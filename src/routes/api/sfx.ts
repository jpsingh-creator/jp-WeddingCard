import { createFileRoute } from "@tanstack/react-router";

const PROMPTS: Record<string, { prompt: string; duration: number }> = {
  bell: { prompt: "Single soft Indian temple bell ring, warm reverb, sacred ambience", duration: 3 },
  conch: { prompt: "Single short Hindu conch shell shankh blow, ceremonial, auspicious", duration: 3 },
  whoosh: { prompt: "Cinematic silk curtain whoosh opening, soft fabric sweep with subtle sparkle", duration: 2 },
};

export const Route = createFileRoute("/api/sfx")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const name = url.searchParams.get("name") || "";
        const cfg = PROMPTS[name];
        if (!cfg) return new Response("Not found", { status: 404 });

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) return new Response("SFX unavailable", { status: 503 });

        const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: cfg.prompt,
            duration_seconds: cfg.duration,
            prompt_influence: 0.4,
          }),
        });

        if (!res.ok) {
          const txt = await res.text();
          return new Response(`SFX error: ${txt}`, { status: 502 });
        }

        const buf = await res.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            // Long cache so service worker + browser keep it offline
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});