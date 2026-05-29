import { useEffect, useRef, useState } from "react";
import { getSfxStats, type SfxStat } from "@/lib/sfx";

type CacheSource = "sw-cache" | "http-cache" | "network" | "pending";

function classify(entry: PerformanceResourceTiming | undefined): CacheSource {
  if (!entry) return "pending";
  // PerformanceResourceTiming exposes deliveryType (Chrome 109+) — "cache"
  // means HTTP cache. transferSize===0 with a positive decodedBodySize is
  // the classic cache hit (covers SW + memory/disk).
  // We treat 0-byte transfer as cache. We treat anything else as network.
  // Heuristic: if SW is controlling the page AND transferSize===0, label SW.
  const fromCache = entry.transferSize === 0 && entry.decodedBodySize > 0;
  if (!fromCache) return "network";
  if (typeof navigator !== "undefined" && navigator.serviceWorker?.controller) {
    return "sw-cache";
  }
  return "http-cache";
}

function findEntry(matcher: (url: string) => boolean): PerformanceResourceTiming | undefined {
  if (typeof performance === "undefined") return undefined;
  const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  // Prefer the most recent matching entry.
  for (let i = entries.length - 1; i >= 0; i--) {
    if (matcher(entries[i].name)) return entries[i];
  }
  return undefined;
}

/**
 * Lightweight perf overlay — measures FPS / dropped frames and shows
 * audio preload timings. Only renders when ?perf=1 is in the URL so it
 * never affects guests.
 */
export function PerfPanel() {
  const [enabled, setEnabled] = useState(false);
  const [fps, setFps] = useState(60);
  const [drops, setDrops] = useState(0);
  const [stats, setStats] = useState<SfxStat[]>([]);
  const [sources, setSources] = useState<Record<string, CacheSource>>({});
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("perf") !== "1") return;
    setEnabled(true);

    let last = performance.now();
    let frames = 0;
    let dropped = 0;
    let acc = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      frames++;
      acc += dt;
      // a "drop" = frame budget over 24ms (~< 42fps)
      if (dt > 24) dropped++;
      if (acc >= 500) {
        setFps(Math.round((frames * 1000) / acc));
        setDrops((d) => d + dropped);
        frames = 0;
        dropped = 0;
        acc = 0;
        setStats(getSfxStats());
        setSources({
          ganesha: classify(findEntry((u) => u.includes("ganesha"))),
          curtain: classify(findEntry((u) => u.includes("/p100") || u.endsWith("/") || u.includes("/?"))),
          "sfx:bell": classify(findEntry((u) => u.includes("/api/sfx") && u.includes("bell"))),
          "sfx:conch": classify(findEntry((u) => u.includes("/api/sfx") && u.includes("conch"))),
          "sfx:whoosh": classify(findEntry((u) => u.includes("/api/sfx") && u.includes("whoosh"))),
        });
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  if (!enabled) return null;

  const swActive = typeof navigator !== "undefined" && !!navigator.serviceWorker?.controller;

  return (
    <div
      className="fixed top-2 right-2 z-[200] rounded-md bg-black/70 text-ivory text-[10px] font-mono px-2 py-1 leading-tight"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <div>fps: {fps} · drops: {drops}</div>
      <div>sw: {swActive ? "active" : "off"}</div>
      {stats.map((s) => (
        <div key={s.name}>
          {s.name}: {s.failed ? "✗ fail" : s.ready ? `✓ ${s.ms}ms` : "…"}
        </div>
      ))}
      <div className="mt-1 border-t border-ivory/20 pt-1">
        {Object.entries(sources).map(([k, v]) => (
          <div key={k}>
            {k}: <span style={{ color: v === "sw-cache" ? "lime" : v === "http-cache" ? "gold" : v === "network" ? "salmon" : "gray" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}