import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// ——— R2 Media Handler ———
// Handles /api/media/* requests directly here where the Cloudflare env
// (and thus the R2 bucket binding) is guaranteed to be available.
async function handleMediaRequest(
  request: Request,
  env: Record<string, unknown>,
): Promise<Response | null> {
  const url = new URL(request.url);
  const prefix = "/api/media/";

  if (!url.pathname.startsWith(prefix)) return null;

  const bucket = env.WEDDING_MEDIA as
    | {
        get: (key: string) => Promise<{
          body: ReadableStream;
          httpEtag: string;
          writeHttpMetadata: (h: Headers) => void;
        } | null>;
        put: (
          key: string,
          body: ReadableStream | ArrayBuffer | null,
          opts?: { httpMetadata?: { contentType?: string } },
        ) => Promise<void>;
      }
    | undefined;

  if (!bucket) {
    return new Response("R2 not configured", { status: 503 });
  }

  // Decode the key (handles spaces like "WhatsApp Image elephant.jpeg")
  const key = decodeURIComponent(url.pathname.slice(prefix.length));

  if (!key) {
    return new Response("Missing key", { status: 400 });
  }

  // ——— GET: serve a file from R2 ———
  if (request.method === "GET") {
    try {
      const object = await bucket.get(key);
      if (!object) {
        return new Response("Object Not Found", { status: 404 });
      }
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(object.body, { headers });
    } catch (e) {
      console.error("R2 GET error:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  // ——— PUT: upload a file to R2 ———
  if (request.method === "PUT") {
    try {
      const contentType =
        request.headers.get("Content-Type") || "application/octet-stream";
      await bucket.put(key, request.body, {
        httpMetadata: { contentType },
      });
      return new Response(JSON.stringify({ ok: true, key }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("R2 PUT error:", e);
      return new Response("Upload Error", { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // Handle R2 media requests directly (env is available here)
      const mediaResponse = await handleMediaRequest(
        request,
        (env ?? {}) as Record<string, unknown>,
      );
      if (mediaResponse) return mediaResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
