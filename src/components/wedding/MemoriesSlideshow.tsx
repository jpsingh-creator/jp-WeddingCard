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
  const [isMuted, setIsMuted] = useState(true); // Default to muted for robust autoplay
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null!);
  const touchStart = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

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
    
    const currentMemory = memories[current];
    if (currentMemory && currentMemory.mediaType === 'video') {
      // For videos, wait for the video to end instead of a fixed timer
      return;
    }

    timerRef.current = setTimeout(next, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, count, next, memories]);

  // Video playback manager
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((id) => {
      const vid = videoRefs.current[id];
      if (!vid) return;
      const isCurrentVid = memories[current]?.id === id;

      vid.muted = isMuted;

      if (isCurrentVid) {
        if (vid.paused) {
          vid.currentTime = 0;
          vid.play().catch(() => {
            // Autoplay policy fallback: if unmuted play is blocked, mute and play
            setIsMuted(true);
            vid.muted = true;
            vid.play().catch(() => {});
          });
        }
      } else {
        vid.pause();
      }
    });
  }, [current, isMuted, memories]);

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
                      playsInline
                      muted={isMuted}
                      onEnded={isActive ? next : undefined}
                      ref={(el) => {
                        if (el) {
                          videoRefs.current[item.id] = el;
                        } else {
                          delete videoRefs.current[item.id];
                        }
                      }}
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

            {/* Mute toggle for videos */}
            {mem.mediaType === "video" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md rounded-full p-2 text-ivory/80 hover:text-gold hover:bg-black/60 transition-all"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )}
              </button>
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
