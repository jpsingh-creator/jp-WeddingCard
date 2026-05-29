// Lightweight SFX helper. Caches audio via the service worker so it works
// after first scan. Tracks preload timing and never blocks the visual flow:
// any failure (network, missing key, decode) is swallowed silently.

const PROMPTS: Record<string, { prompt: string; duration: number }> = {
  bell: { prompt: "Single soft Indian temple bell ring, warm reverb, sacred", duration: 3 },
  conch: { prompt: "Single short Hindu conch shell shankh blow, ceremonial, auspicious", duration: 3 },
  whoosh: { prompt: "Cinematic silk curtain whoosh open, soft fabric sweep", duration: 2 },
};

type Entry = { audio: HTMLAudioElement; ready: boolean; ms?: number; failed?: boolean };
const cache = new Map<string, Entry>();

export type SfxStat = { name: string; ready: boolean; failed: boolean; ms?: number };

function urlFor(name: string) {
  return `/api/sfx?name=${encodeURIComponent(name)}`;
}

export function preloadSfx(name: string): Promise<SfxStat> {
  if (typeof window === "undefined") {
    return Promise.resolve({ name, ready: false, failed: false });
  }
  const existing = cache.get(name);
  if (existing) {
    return Promise.resolve({ name, ready: existing.ready, failed: !!existing.failed, ms: existing.ms });
  }
  if (!PROMPTS[name]) return Promise.resolve({ name, ready: false, failed: true });

  const t0 = performance.now();
  const audio = new Audio(urlFor(name));
  audio.preload = "auto";
  audio.volume = 0.6;
  const entry: Entry = { audio, ready: false };
  cache.set(name, entry);

  return new Promise<SfxStat>((resolve) => {
    const done = (failed: boolean) => {
      entry.ms = Math.round(performance.now() - t0);
      entry.ready = !failed;
      entry.failed = failed;
      resolve({ name, ready: entry.ready, failed, ms: entry.ms });
    };
    audio.addEventListener("canplaythrough", () => done(false), { once: true });
    audio.addEventListener("error", () => done(true), { once: true });
    // Hard timeout — never block the UX waiting for audio
    setTimeout(() => { if (!entry.ready && !entry.failed) done(true); }, 6000);
  });
}

export function playSfx(name: string) {
  if (typeof window === "undefined") return;
  let entry = cache.get(name);
  if (!entry) {
    const audio = new Audio(urlFor(name));
    audio.volume = 0.6;
    entry = { audio, ready: false };
    cache.set(name, entry);
  }
  if (entry.failed) return;
  try {
    entry.audio.currentTime = 0;
    void entry.audio.play().catch(() => { /* autoplay/network — ignore */ });
  } catch {
    // ignore
  }
}

export function getSfxStats(): SfxStat[] {
  return Array.from(cache.entries()).map(([name, e]) => ({
    name,
    ready: e.ready,
    failed: !!e.failed,
    ms: e.ms,
  }));
}

export const SFX_NAMES = Object.keys(PROMPTS);