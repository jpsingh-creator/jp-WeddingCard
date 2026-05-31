import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/media/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        // The wildcard param is in params._splat.
        // We decode it to handle spaces like "WhatsApp Image elephant.jpeg"
        const key = decodeURIComponent(params._splat || "");

        // In Cloudflare environments with TanStack Start/Vinxi, bindings are usually
        // located in the H3 event context rather than standard process.env.
        let bucket: any = (process.env as any).WEDDING_MEDIA;
        
        try {
          const { getEvent } = await import("vinxi/http");
          const event = getEvent();
          if (event.context?.cloudflare?.env?.WEDDING_MEDIA) {
            bucket = event.context.cloudflare.env.WEDDING_MEDIA;
          }
        } catch (e) {
          // Fallback if vinxi is unavailable (though it should be in TanStack Start)
        }

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
      PUT: async ({ request, params }) => {
        const key = decodeURIComponent(params._splat || "");
        
        let bucket: any = (process.env as any).WEDDING_MEDIA;
        try {
          const { getEvent } = await import("vinxi/http");
          const event = getEvent();
          if (event.context?.cloudflare?.env?.WEDDING_MEDIA) {
            bucket = event.context.cloudflare.env.WEDDING_MEDIA;
          }
        } catch (e) {}

        if (!bucket) {
          console.warn("R2 bucket WEDDING_MEDIA is not bound. Upload failed on localhost.");
          return new Response("R2 not configured locally", { status: 500 });
        }

        try {
          const contentType = request.headers.get("Content-Type") || "application/octet-stream";
          
          // Put the file into R2 bucket
          await bucket.put(key, request.body, {
            httpMetadata: { contentType },
          });

          return new Response("Uploaded successfully", { status: 200 });
        } catch (e) {
          console.error("Error uploading to R2:", e);
          return new Response("Upload Error", { status: 500 });
        }
      },
    },
  },
});
