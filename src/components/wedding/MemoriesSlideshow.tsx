import { useState, useEffect, useRef, useCallback } from "react";
import type { MemoryItem } from "./types";
import { Reveal } from "./Reveal";

const SLIDE_DURATION = 5000; // 5s per image
const CROSSFADE_MS = 1500;  // matches CSS transition

export function MemoriesSlideshow({ memories }: { memories: MemoryItem[] }) {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null!);
  const videoRefs = useRef<Record<number, HTMLVideoElement>>({});
  const touchStart = useRef<number>(0);
  const count = memories.length;

  const goNext = useCallback(() => {
    if (count <= 1) return;
    setPrevious(current);
    setCurrent((current + 1) % count);
    // Clear previous layer after crossfade completes
    setTimeout(() => setPrevious(null), CROSSFADE_MS + 100);
  }, [current, count]);

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    setPrevious(current);
    setCurrent(((current - 1) + count) % count);
    setTimeout(() => setPrevious(null), CROSSFADE_MS + 100);
  }, [current, count]);

  // Auto-advance for images (videos advance on their own via onEnded)
  useEffect(() => {
    const mem = memories[current];
    if (!mem || count <= 1) return;

    if (mem.mediaType === "video") {
      // Don't auto-advance — wait for onEnded
      return;
    }

    timerRef.current = setTimeout(goNext, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [current, count, goNext, memories]);

  // Video playback controller
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((key) => {
      const idx = Number(key);
      const vid = videoRefs.current[idx];
      if (!vid) return;

      vid.muted = isMuted;

      if (idx === current) {
        vid.currentTime = 0;
        vid.play().catch(() => {
          // Autoplay policy fallback
          setIsMuted(true);
          vid.muted = true;
          vid.play().catch(() => {});
        });
      } else {
        vid.pause();
      }
    });
  }, [current, isMuted]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  if (count === 0) return null;

  const mem = memories[current];
  const progressPercent = ((current + 1) / count) * 100;

  // We render at most 2 layers: the exiting (previous) and the entering (current)
  const renderLayer = (idx: number, phase: "entering" | "exiting") => {
    const item = memories[idx];
    if (!item) return null;

    return (
      <div key={`${item.id}-${phase}`} className={`memories-layer ${phase}`}>
        {item.mediaType === "video" ? (
          <video
            src={item.dataUrl}
            playsInline
            muted={isMuted}
            onEnded={phase === "entering" ? goNext : undefined}
            ref={(el) => {
              if (el) {
                videoRefs.current[idx] = el;
              } else {
                delete videoRefs.current[idx];
              }
            }}
          />
        ) : (
          <img
            src={item.dataUrl}
            alt={item.caption || "Memory"}
            loading="lazy"
          />
        )}

        {/* Soft edge vignette */}
        <div className="memories-edge-fade" />

        {/* Caption whisper */}
        {phase === "entering" && item.caption && (
          <div className="memories-whisper">
            <p className="font-serif italic text-lg md:text-xl text-ivory/90">
              "{item.caption}"
            </p>
          </div>
        )}

        {/* Mute toggle for videos */}
        {phase === "entering" && item.mediaType === "video" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="memories-mute-btn"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <section className="memories-section">
      <Reveal>
        <div className="text-center mb-2">
          <div className="divider-ornate font-label text-xs tracking-[0.3em]">OUR MEMORIES</div>
        </div>
      </Reveal>

      <Reveal delay={150}>
        <h2 className="font-script text-shimmer text-6xl md:text-7xl mt-3 mb-10 text-center">
          Moments Together
        </h2>
      </Reveal>

      <Reveal delay={300}>
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="memories-stage">
            {/* Previous (exiting) layer */}
            {previous !== null && renderLayer(previous, "exiting")}

            {/* Current (entering) layer */}
            {renderLayer(current, "entering")}

            {/* Navigation arrows */}
            {count > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="memories-nav memories-nav-prev"
                  aria-label="Previous memory"
                >
                  ‹
                </button>
                <button
                  onClick={goNext}
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
                  onClick={() => {
                    if (i === current) return;
                    setPrevious(current);
                    setCurrent(i);
                    setTimeout(() => setPrevious(null), CROSSFADE_MS + 100);
                  }}
                  className={`memories-dot ${i === current ? "memories-dot-active" : ""}`}
                  aria-label={`Go to memory ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
