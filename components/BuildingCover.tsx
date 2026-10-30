import { cn } from "./ui/cn";

/**
 * A drawn cover for a building. Each building gets its own color and skyline,
 * worked out from its id, so it looks the same every time. When a building
 * supplies a real photo, pass `photoUrl` and the photo is shown instead.
 */

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

type Props = {
  id: string;
  name: string;
  photoUrl?: string | null;
  className?: string;
};

export function BuildingCover({ id, name, photoUrl, className }: Props) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- photos come from building owners; sizes vary
      <img
        src={photoUrl}
        alt={`${name} exterior`}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  const h = hash(id + name);
  const palette = (h % 6) + 1;
  const bg = `var(--cover-${palette}-bg)`;
  const ink = `var(--cover-${palette}-ink)`;
  const floors = 4 + (h % 4); // 4–7 floors
  const mainW = 96 + (h % 3) * 16;
  const mainX = 70 + ((h >> 3) % 50);
  const sideFloors = 2 + ((h >> 5) % 3);
  const floorH = 13;
  const ground = 112;

  const windows: { x: number; y: number }[] = [];
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < Math.floor((mainW - 16) / 16); c++) {
      windows.push({ x: mainX + 10 + c * 16, y: ground - (f + 1) * floorH + 3 });
    }
  }

  return (
    <svg
      viewBox="0 0 320 120"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className={cn("h-full w-full", className)}
      style={{ background: bg }}
    >
      <circle cx={260 - ((h >> 7) % 40)} cy="30" r="14" fill={ink} opacity="0.35" />
      {/* Side building */}
      <rect
        x={mainX + mainW + 10}
        y={ground - sideFloors * floorH}
        width="62"
        height={sideFloors * floorH}
        rx="3"
        fill={ink}
        opacity="0.55"
      />
      {/* Main building */}
      <rect
        x={mainX}
        y={ground - floors * floorH - 4}
        width={mainW}
        height={floors * floorH + 4}
        rx="4"
        fill={ink}
      />
      {windows.map((w, i) => (
        <rect
          key={i}
          x={w.x}
          y={w.y}
          width="8"
          height="6"
          rx="1"
          fill="var(--surface)"
          opacity={(h >> (i % 13)) % 3 === 0 ? 0.95 : 0.55}
        />
      ))}
      {/* Trees */}
      <circle cx={mainX - 22} cy={ground - 14} r="12" fill={ink} opacity="0.7" />
      <rect x={mainX - 23.5} y={ground - 6} width="3" height="8" fill={ink} />
      <rect x="0" y={ground} width="320" height="8" fill={ink} opacity="0.4" />
    </svg>
  );
}
