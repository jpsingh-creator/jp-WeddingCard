import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/media/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        // The wildcard param is in params._splat
        const key = params._splat;

        // In Cloudflare environments, bindings are often exposed via process.env
        // (if configured in wrangler) or event contexts. 
        const bucket = (process.env as any).WEDDING_MEDIA;

        if (!bucket) {
          // User requested: "connect the data base to only for the deployed site, not for local host"
          // If the bucket binding is missing (e.g. locally), we handle it gracefully here.
          console.warn("R2 bucket WEDDING_MEDIA is not bound. This is expected on localhost.");
          return new Response("Media not found or R2 not configured locally", { status: 404 });
        }

        try {
          const object = await bucket.get(key);

          if (object === null) {
            return new Response("Object Not Found", { status: 404 });
          }

          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set("etag", object.httpEtag);
          
          // Allow caching for performance
          headers.set("Cache-Control", "public, max-age=31536000, immutable");

          return new Response(object.body, {
            headers,
          });
        } catch (e) {
          console.error("Error fetching from R2:", e);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
