import { useState, useEffect, useRef, useCallback } from "react";
import type { MemoryItem } from "./types";
import { Reveal } from "./Reveal";

const SLIDE_DURATION = 5000; // 5s per slide
const TRANSITION_MS = 800;

// Ken Burns directions — each slide gets a unique zoom/pan
const KB_VARIANTS = [
  { from: "scale(1.0) translate(0%, 0%)", to: "scale(1.15) translate(-2%, -1%)" },
  { from: "scale(1.05) translate(2%, 0%)", to: "scale(1.0) translate(-1%, 2%)" },
  { from: "scale(1.0) translate(-1%, 1%)", to: "scale(1.12) translate(1%, -2%)" },
  { from: "scale(1.08) translate(0%, 2%)", to: "scale(1.0) translate(2%, 0%)" },
  { from: "scale(1.0) translate(1%, -1%)", to: "scale(1.1) translate(-2%, 1%)" },
];

export function MemoriesSlideshow({ memories }: { memories: MemoryItem[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null!);
  const touchStart = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const count = memories.length;

  const goTo = useCallback(
    (idx: number) => {
      if (isAnimating || count === 0) return;
      setIsAnimating(true);
      setCurrent(((idx % count) + count) % count);
      setTimeout(() => setIsAnimating(false), TRANSITION_MS);
    },
    [count, isAnimating]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused || count <= 1) return;
    timerRef.current = setTimeout(next, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, count, next]);

  // Touch swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    setPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    // Resume auto-play after 8s of inactivity
    setTimeout(() => setPaused(false), 8000);
  };

  if (count === 0) return null;

  const mem = memories[current];
  const kb = KB_VARIANTS[current % KB_VARIANTS.length];

  return (
    <section className="relative px-5 py-20 max-w-3xl mx-auto text-center">
      <Reveal>
        <div className="divider-ornate font-label text-xs tracking-[0.3em]">OUR MEMORIES</div>
      </Reveal>

      <Reveal delay={150}>
        <h2 className="font-script text-shimmer text-6xl md:text-7xl mt-3 mb-10">
          Moments Together
        </h2>
      </Reveal>

      <Reveal delay={300}>
        <div
          ref={containerRef}
          className="memories-slideshow-container"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Main slide area */}
          <div className="memories-slide-frame">
            {/* Vignette overlay */}
            <div className="memories-vignette" />

            {/* The media */}
            {memories.map((item, i) => {
              const isActive = i === current;
              const itemKb = KB_VARIANTS[i % KB_VARIANTS.length];

              return (
                <div
                  key={item.id}
                  className={`memories-slide ${isActive ? "memories-slide-active" : ""}`}
                >
                  {item.mediaType === "video" ? (
                    <video
                      src={item.dataUrl}
                      className="memories-media"
                      autoPlay={isActive}
                      muted
                      loop
                      playsInline
                      style={{
                        transform: isActive ? itemKb.to : itemKb.from,
                      }}
                    />
                  ) : (
                    <img
                      src={item.dataUrl}
                      alt={item.caption || "Memory"}
                      className="memories-media"
                      style={{
                        transform: isActive ? itemKb.to : itemKb.from,
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* Caption overlay */}
            {mem.caption && (
              <div className="memories-caption">
                <p className="font-serif italic text-lg md:text-xl text-ivory">
                  "{mem.caption}"
                </p>
              </div>
            )}

            {/* Navigation arrows (desktop) */}
            {count > 1 && (
              <>
                <button
                  onClick={prev}
                  className="memories-nav memories-nav-prev"
                  aria-label="Previous memory"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  className="memories-nav memories-nav-next"
                  aria-label="Next memory"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Progress dots */}
          {count > 1 && (
            <div className="memories-dots">
              {memories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`memories-dot ${i === current ? "memories-dot-active" : ""}`}
                  aria-label={`Go to memory ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Slide counter */}
          <div className="memories-counter font-label">
            {current + 1} / {count}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
