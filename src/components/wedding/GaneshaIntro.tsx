import { useEffect, useRef, useState } from "react";
import ganesha from "@/assets/ganesha.png";
import { playSfx, preloadSfx } from "@/lib/sfx";
import { useLang } from "@/i18n";

export function GaneshaIntro({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [imgReady, setImgReady] = useState(false);
  const startedRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    // Preload audio in parallel — failures are silent and never block.
    void preloadSfx("bell");
    void preloadSfx("conch");
    void preloadSfx("whoosh");
    playSfx("bell");
    // Fallback: if the image takes too long, reveal anyway after 1.5s.
    const t = setTimeout(() => setImgReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
      timeoutsRef.current = [];
    };
  }, []);

  const handleContinue = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    playSfx("conch");
    setZooming(true);
    onDone();
    setFading(true);
    timeoutsRef.current.push(window.setTimeout(() => setHidden(true), 850));
  };

  if (hidden) return null;

  const introImageSize = "min(56vw, 32svh, 260px)";

  return (
    <div
      data-wedding-scene="ganesha-intro"
      className="fixed inset-0 z-[120] overflow-hidden will-change-[opacity,transform]"
      style={{
        background:
          "radial-gradient(circle at center, oklch(0.28 0.10 25) 0%, oklch(0.15 0.06 25) 70%, #000 100%)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
        opacity: fading ? 0 : 1,
        transform: zooming ? "scale(1.15)" : "scale(1)",
        pointerEvents: fading ? "none" : "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: 3 + (i % 4),
              height: 3 + (i % 4),
              background: "var(--gold)",
              filter: "blur(0.5px)",
              boxShadow: "0 0 8px var(--gold)",
              animation: `twinkle ${3 + (i % 5)}s ease-in-out ${(i * 0.2) % 4}s infinite`,
              willChange: "opacity",
              transform: "translateZ(0)",
            }}
          />
        ))}
      </div>

      <div className="relative h-full overflow-y-auto overscroll-contain px-4 py-4 text-center sm:px-6 sm:py-6">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-3 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:gap-4">
          <p className="font-label uppercase tracking-[0.35em] text-gold-soft text-[10px] sm:text-xs animate-fade-in">
            ॥ श्री गणेशाय नमः ॥
          </p>

          <div className="relative animate-scale-in">
            <img
              src={ganesha}
              alt="Lord Ganesha"
              width={1024}
              height={1024}
              loading="eager"
              decoding="async"
              onLoad={() => setImgReady(true)}
              onError={() => setImgReady(true)}
              className="relative object-contain"
              style={{
                width: introImageSize,
                maxWidth: "300px",
                maxHeight: "40svh",
                opacity: imgReady ? 1 : 0,
                transition: "opacity 0.5s ease",
                filter: "drop-shadow(0 0 15px rgba(255, 200, 80, 0.5))",
                willChange: "opacity, filter, transform",
                transform: "translateZ(0)",
              }}
            />
          </div>

          <GaneshaText onContinue={handleContinue} />
        </div>
      </div>
    </div>
  );
}

function GaneshaText({ onContinue }: { onContinue: () => void }) {
  const { t } = useLang();
  return (
    <>
      <p
        className="font-script text-shimmer mt-1 animate-fade-in"
        style={{ fontSize: "clamp(3.2rem, 11vw, 5.25rem)", lineHeight: 0.9 }}
      >
        {t.ganeshaMantra}
      </p>
      <p
        className="font-serif italic text-gold-soft max-w-md animate-fade-in"
        style={{ fontSize: "clamp(1rem, 3.4vw, 1.35rem)", lineHeight: 1.3 }}
      >
        {t.ganeshaSub}
      </p>
      <button
        onClick={onContinue}
        aria-label={t.tapToContinue}
        className="mt-6 group relative inline-flex min-h-12 items-center justify-center gap-3 bg-gold-grad text-maroon-deep font-label uppercase tracking-[0.22em] text-[11px] sm:text-sm px-5 py-3 sm:px-7 rounded-full shadow-gold active:scale-95 transition-transform animate-fade-in"
        style={{ animationDelay: "1.2s", animationFillMode: "backwards" }}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full opacity-70 animate-ping"
          style={{ background: "radial-gradient(circle, rgba(255,200,80,0.55), transparent 70%)" }}
        />
        <span className="relative">{t.tapToContinue}</span>
        <span className="relative text-base group-hover:translate-x-1 transition-transform">→</span>
      </button>
    </>
  );
}
