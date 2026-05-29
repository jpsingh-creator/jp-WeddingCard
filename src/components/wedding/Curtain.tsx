import { useEffect, useState } from "react";
import { playSfx } from "@/lib/sfx";
import { useLang } from "@/i18n";

export function Curtain({ onDone }: { onDone: () => void }) {
  const { t } = useLang();
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [textFading, setTextFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => { setTextFading(true); }, 1600);
    const t2 = setTimeout(() => { playSfx("whoosh"); setOpening(true); }, 2200);
    const t3 = setTimeout(() => { setHidden(true); onDone(); }, 6400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  if (hidden) return null;

  /* Matches the exact horizontal red ripple effect from the user's reference */
  const horizontalRipples = "repeating-linear-gradient(180deg, #3a0404 0px, #6b0c0c 15px, #8c1212 25px, #6b0c0c 35px, #3a0404 50px)";

  const curtainPanel = (side: "left" | "right") => ({
    animation: opening
      ? `royal-open-${side} 4s cubic-bezier(0.5, 0, 0.1, 1) forwards`
      : "none",
    transformOrigin: `top ${side}`,
    background: horizontalRipples,
    borderRight: side === "left" ? "3px solid #DCA13A" : undefined,
    borderLeft: side === "right" ? "3px solid #DCA13A" : undefined,
    boxShadow: side === "left"
      ? "15px 0 50px rgba(0,0,0,0.8)"
      : "-15px 0 50px rgba(0,0,0,0.8)",
    zIndex: 50,
  });

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" data-wedding-scene="curtain">

      {/* LEFT CURTAIN PANEL */}
      <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden" style={curtainPanel("left")}>
        <div 
          className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/80 to-transparent" 
          style={{ opacity: opening ? 1 : 0.5, transition: "opacity 3s ease-in" }}
        />
      </div>

      {/* RIGHT CURTAIN PANEL */}
      <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden" style={curtainPanel("right")}>
        <div 
          className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/80 to-transparent" 
          style={{ opacity: opening ? 1 : 0.5, transition: "opacity 3s ease-in" }}
        />
      </div>

      {/* TEXT overlaid on curtain */}
      {!opening && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-[55] animate-scale-in"
          style={{ 
            pointerEvents: "none",
            animation: textFading ? "text-lift-fade 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards" : undefined
          }}
        >
          {/* Decorative top line */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#DCA13A]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#DCA13A]" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#DCA13A]" />
          </div>

          {/* Main title — Shubh Vivah */}
          <p
            className="font-script leading-none text-center"
            style={{
              fontSize: "clamp(3.5rem, 12vw, 7.5rem)",
              color: "#F1D98A",
              textShadow: "0 4px 20px rgba(0,0,0,0.9), 0 0 50px rgba(220,161,58,0.5)",
              letterSpacing: "0.02em",
            }}
          >
            {t.shubhVivah}
          </p>

          {/* Gold dot divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px w-14 bg-gradient-to-r from-transparent to-[#DCA13A]" />
            <div className="flex gap-1.5 items-center">
              <div className="w-1 h-1 rounded-full bg-[#DCA13A] opacity-50" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#DCA13A] drop-shadow-md" />
              <div className="w-1 h-1 rounded-full bg-[#DCA13A] opacity-50" />
            </div>
            <div className="h-px w-14 bg-gradient-to-l from-transparent to-[#DCA13A]" />
          </div>

          {/* Subtitle — Shri Ganeshaya Namah */}
          <p
            className="font-display tracking-[0.45em] uppercase text-center"
            style={{
              fontSize: "clamp(0.6rem, 2vw, 0.85rem)",
              color: "#DCA13A",
              textShadow: "0 2px 10px rgba(0,0,0,1)",
              opacity: 0.9,
            }}
          >
            {t.ganeshaSalutation}
          </p>

          {/* Decorative bottom line */}
          <div className="flex items-center gap-3 mt-6">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#DCA13A]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#DCA13A]" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#DCA13A]" />
          </div>
        </div>
      )}

      {/* Center seam shadow (creates depth behind the gold border) */}
      {!opening && (
        <div 
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-black/40 blur-md z-[40]" 
        />
      )}

    </div>
  );
}
