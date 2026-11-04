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
};

export const PASSES: Pass[] = [
  { id: "browse", name: "Browse", days: 7, cents: 599, blurb: "A week to look around." },
  {
    id: "tour",
    name: "Tour",
    days: 14,
    cents: 899,
    badge: "Most popular",
    blurb: "Two weeks to visit and compare.",
  },
  {
    id: "apply",
    name: "Apply",
    days: 21,
    cents: 1199,
    blurb: "Three weeks to choose and apply.",
  },
  {
    id: "move_in",
    name: "Move-in",
    days: 28,
    cents: 1499,
    badge: "Best value",
    blurb: "Four weeks, from search to keys.",
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
