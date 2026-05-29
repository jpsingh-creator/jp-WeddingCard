import { useEffect, useState } from "react";
import { useLang } from "@/i18n";

function diff(target: number) {
  const now = Date.now();
  let s = Math.max(0, Math.floor((target - now) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  return { d, h, m, s };
}

export function Countdown({ iso }: { iso: string }) {
  const target = new Date(iso).getTime();
  const [t, setT] = useState(() => diff(target));
  const { t: tr } = useLang();
  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const items = [
    { l: tr.days, v: t.d },
    { l: tr.hours, v: t.h },
    { l: tr.minutes, v: t.m },
    { l: tr.seconds, v: t.s },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-md mx-auto">
      {items.map((i) => (
        <div key={i.l} className="glass-card px-2 py-3 md:py-5 text-center transition-transform active:scale-95">
          <div className="font-display text-2xl md:text-4xl text-shimmer tabular-nums">
            {String(i.v).padStart(2, "0")}
          </div>
          <div className="font-label text-[10px] md:text-xs uppercase tracking-[0.25em] text-gold-soft mt-1">{i.l}</div>
        </div>
      ))}
    </div>
  );
}
