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
// This is the ONLY place R2 is accessed — the old TanStack API route was removed.

interface R2Object {
  body: ReadableStream;
  httpEtag: string;
  writeHttpMetadata: (h: Headers) => void;
}

interface R2Bucket {
  get: (key: string) => Promise<R2Object | null>;
  put: (
    key: string,
    body: ReadableStream | ArrayBuffer | null,
    opts?: { httpMetadata?: { contentType?: string } },
  ) => Promise<void>;
  delete: (key: string | string[]) => Promise<void>;
}

async function handleMediaRequest(
  request: Request,
  env: Record<string, unknown>,
): Promise<Response | null> {
  const url = new URL(request.url);
  const prefix = "/api/media/";

  if (!url.pathname.startsWith(prefix)) return null;

  const bucket = env.WEDDING_MEDIA as R2Bucket | undefined;

  if (!bucket) {
    return new Response(
      JSON.stringify({ ok: false, error: "R2 not configured" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  // Decode the key (handles spaces like "WhatsApp Image elephant.jpeg")
  const key = decodeURIComponent(url.pathname.slice(prefix.length));

  if (!key) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing key" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
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
      if (key.startsWith("db/") || key.endsWith(".json")) {
        headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      } else {
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
      }
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
      return new Response(
        JSON.stringify({ ok: false, error: "Upload Error" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // ——— DELETE: soft-delete (move to bin/) or permanent delete (if already in bin/) ———
  if (request.method === "DELETE") {
    try {
      // If the file is already in bin/, permanently delete it
      if (key.startsWith("bin/")) {
        await bucket.delete(key);
        return new Response(
          JSON.stringify({ ok: true, permanentlyDeleted: key }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      // Otherwise, move to bin/ (copy to bin then delete original)
      const object = await bucket.get(key);
      if (!object) {
        // File doesn't exist in R2, that's fine — just confirm deletion
        return new Response(
          JSON.stringify({ ok: true, note: "File not found in R2, nothing to move" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      // Read content type from the original object
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      const contentType = headers.get("Content-Type") || "application/octet-stream";

      // Copy to bin/ folder preserving original path structure
      const binKey = `bin/${key}`;
      await bucket.put(binKey, object.body, {
        httpMetadata: { contentType },
      });

      // Delete the original
      await bucket.delete(key);

      return new Response(
        JSON.stringify({ ok: true, movedTo: binKey }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (e) {
      console.error("R2 DELETE error:", e);
      return new Response(
        JSON.stringify({ ok: false, error: "Delete Error" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
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
