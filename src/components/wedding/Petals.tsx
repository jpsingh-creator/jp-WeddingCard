const PETALS = Array.from({ length: 24 });

export function Petals() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {PETALS.map((_, i) => {
        const left = (i * 4.3) % 100;
        const delay = (i * 0.7) % 12;
        const dur = 10 + ((i * 1.7) % 10);
        const size = 8 + (i % 5) * 3;
        const hue = i % 3 === 0 ? "var(--gold)" : i % 3 === 1 ? "var(--rose)" : "oklch(0.78 0.14 85 / 0.7)";
        return (
          <span
            key={i}
            className="petal"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              background: hue,
              animation: `float-up ${dur}s linear ${delay}s infinite`,
              filter: "blur(0.3px) drop-shadow(0 0 4px rgba(255,200,100,0.4))",
              willChange: "transform",
              transform: "translateZ(0)",
            }}
          />
        );
      })}
    </div>
  );
}
