import { useEffect, useState } from "react";
import { playSfx } from "@/lib/sfx";
import { useLang } from "@/i18n";

function CurtainText() {
  const { t } = useLang();
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center animate-scale-in">
        <p className="font-script text-gold text-7xl md:text-9xl leading-none">{t.shubhVivah}</p>
        <p className="font-display tracking-[0.4em] text-gold-soft mt-4 text-xs md:text-sm">{t.ganeshaSalutation}</p>
      </div>
    </div>
  );
}

export function Curtain({ onDone }: { onDone: () => void }) {
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { playSfx("whoosh"); setOpening(true); }, 1400);
    const t2 = setTimeout(() => { setHidden(true); onDone(); }, 3600);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [onDone]);

  if (hidden) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" data-wedding-scene="curtain">
      <div
        className="absolute inset-y-0 left-0 w-1/2 shadow-deep"
        style={{
          background:
            "repeating-linear-gradient(180deg, oklch(0.32 0.14 25), oklch(0.22 0.10 25) 18px, oklch(0.32 0.14 25) 36px)",
          transition: "transform 2s cubic-bezier(0.7, 0, 0.3, 1)",
          transform: opening ? "translateX(-105%)" : "translateX(0)",
          borderRight: "3px solid var(--gold)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/2 shadow-deep"
        style={{
          background:
            "repeating-linear-gradient(180deg, oklch(0.32 0.14 25), oklch(0.22 0.10 25) 18px, oklch(0.32 0.14 25) 36px)",
          transition: "transform 2s cubic-bezier(0.7, 0, 0.3, 1)",
          transform: opening ? "translateX(105%)" : "translateX(0)",
          borderLeft: "3px solid var(--gold)",
        }}
      />
      {!opening && <CurtainText />}
    </div>
  );
}
