// Honest Rent Plus passes: fixed length, paid once, no auto-renew.
// Prices are planned. Nothing is charged until payments are switched on.

export type PassId = "browse" | "tour" | "apply" | "move_in";

export type Pass = {
  id: PassId;
  name: string;
  days: number;
  /** Price in cents. */
  cents: number;
  badge?: "Most popular" | "Best value";
  blurb: string;
  /** Two or three words on what the pass is for, shown on the card. */
  purpose: string;
};

// The id never changes (it is stored with each purchase); the name is what people read. The name
// is the length, so nobody has to guess what a pass is. Shown as "2-Week pass" or "2-Week Pass".
export const PASSES: Pass[] = [
  {
    id: "browse",
    name: "1-Week",
    days: 7,
    cents: 599,
    blurb: "A week to look around.",
    purpose: "Look around",
  },
  {
    id: "tour",
    name: "2-Week",
    days: 14,
    cents: 899,
    badge: "Most popular",
    blurb: "Two weeks to visit and compare.",
    purpose: "Visit and compare",
  },
  {
    id: "apply",
    name: "3-Week",
    days: 21,
    cents: 1199,
    blurb: "Three weeks to choose and apply.",
    purpose: "Choose and apply",
  },
  {
    id: "move_in",
    name: "4-Week",
    days: 28,
    cents: 1499,
    badge: "Best value",
    blurb: "Four weeks, from search to keys.",
    purpose: "Search to keys",
  },
];

export const PASS_IDS = PASSES.map((p) => p.id);

export function isPassId(value: unknown): value is PassId {
  return typeof value === "string" && (PASS_IDS as string[]).includes(value);
}

export function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function perDayCents(p: Pass): number {
  return Math.round(p.cents / p.days);
}

/** Percent saved compared with buying the 7-day pass again and again. */
export function savingVsWeekly(p: Pass): number {
  const weekly = PASSES[0];
  const repeats = p.days / weekly.days;
  if (repeats <= 1) return 0;
  return Math.round((1 - p.cents / (weekly.cents * repeats)) * 100);
}

/** The latest end of any pass that is still running, or null. Passes stack: see addDays. */
export function activeUntil(
  passes: { ends_at: string }[],
  now = new Date(),
): Date | null {
  let latest: Date | null = null;
  for (const p of passes) {
    const end = new Date(p.ends_at);
    if (end > now && (!latest || end > latest)) latest = end;
  }
  return latest;
}

/** A new pass starts when the current one ends, so buying early never wastes days. */
export function nextPassWindow(
  current: Date | null,
  days: number,
  now = new Date(),
): { start: Date; end: Date } {
  const start = current && current > now ? current : now;
  return { start, end: new Date(start.getTime() + days * 86_400_000) };
}

// ---- what a pass includes ---------------------------------------------------------------

/** Roommate matches and introductions come with the 2-, 3- and 4-week passes (not the 1-week pass). */
export const ROOMMATE_PASS_IDS: PassId[] = ["tour", "apply", "move_in"];

export function includesRoommates(id: PassId): boolean {
  return ROOMMATE_PASS_IDS.includes(id);
}

export function passById(id: PassId): Pass {
  return PASSES.find((p) => p.id === id)!;
}

export type PassRow = { pass: string; starts_at: string; ends_at: string };

export type CurrentPass = { id: PassId; name: string; endsAt: string; daysLeft: number };

export function daysLeft(end: Date, now = new Date()): number {
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000));
}

/** The pass running right now (if two overlap, the one that ends last). Null if none. */
export function currentPass(rows: PassRow[], now = new Date()): CurrentPass | null {
  let best: { id: PassId; end: Date } | null = null;
  for (const r of rows) {
    const start = new Date(r.starts_at);
    const end = new Date(r.ends_at);
    if (!isPassId(r.pass) || start > now || end <= now) continue;
    if (!best || end > best.end) best = { id: r.pass, end };
  }
  if (!best) return null;
  return {
    id: best.id,
    name: passById(best.id).name,
    endsAt: best.end.toISOString(),
    daysLeft: daysLeft(best.end, now),
  };
}

/** When roommate access ends: the latest end of a running pass that includes roommates. */
export function roommatesUntil(rows: PassRow[], now = new Date()): Date | null {
  return activeUntil(
    rows.filter((r) => isPassId(r.pass) && includesRoommates(r.pass)),
    now,
  );
}
