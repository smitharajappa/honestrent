/** Decorative Richardson–Plano skyline for the hero. Uses hero tokens only. */
export function HeroSkyline({ className }: { className?: string }) {
  const towers = [
    { x: 10, w: 46, h: 70 },
    { x: 62, w: 34, h: 110 },
    { x: 102, w: 58, h: 86 },
    { x: 166, w: 40, h: 140 },
    { x: 212, w: 64, h: 96 },
    { x: 282, w: 36, h: 124 },
    { x: 324, w: 54, h: 78 },
    { x: 384, w: 44, h: 104 },
  ];
  const ground = 180;
  return (
    <svg
      viewBox="0 0 440 190"
      aria-hidden="true"
      focusable="false"
      className={className}
      preserveAspectRatio="xMidYMax meet"
    >
      <circle cx="350" cy="44" r="26" fill="var(--hero-ink)" opacity="0.6" />
      {towers.map((t, i) => (
        <g key={i}>
          <rect
            x={t.x}
            y={ground - t.h}
            width={t.w}
            height={t.h}
            rx="4"
            fill="var(--hero-ink)"
            opacity={i % 2 ? 1 : 0.75}
          />
          {Array.from({ length: Math.floor(t.h / 18) }).map((_, row) =>
            Array.from({ length: Math.floor((t.w - 8) / 12) }).map((__, col) => (
              <rect
                key={`${row}-${col}`}
                x={t.x + 6 + col * 12}
                y={ground - t.h + 8 + row * 18}
                width="6"
                height="8"
                rx="1"
                fill="var(--surface)"
                opacity={(row + col + i) % 4 === 0 ? 0.9 : 0.45}
              />
            )),
          )}
        </g>
      ))}
      <rect x="0" y={ground} width="440" height="10" rx="2" fill="var(--hero-ink)" />
    </svg>
  );
}
