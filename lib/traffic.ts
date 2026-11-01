// Typical weekday drive time by hour: pure helpers (no network), so they are tested.

export type TrafficPoint = {
  /** Hour of day, 0-23, local Texas time. */
  hour: number;
  /** Door-to-door drive time in minutes for a car leaving at that hour. */
  minutes: number;
};

export type TrafficSummary = {
  best: TrafficPoint;
  worst: TrafficPoint;
  /** Extra minutes the worst hour costs compared with the best. */
  extraMinutes: number;
};

/** Hours we sample: the morning and evening rush, plus quiet hours between. */
export const SAMPLE_HOURS = [6, 7, 8, 9, 10, 12, 14, 16, 17, 18, 19, 21] as const;

/** The next Tuesday after `from` (a typical weekday), as YYYY-MM-DD in Texas time. */
export function nextTypicalWeekday(from: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(from);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const day = new Date(Date.UTC(+get("year"), +get("month") - 1, +get("day")));
  // Always at least a week ahead so the date is safely in the future.
  const dow = day.getUTCDay(); // 0 = Sunday
  const untilTuesday = (2 - dow + 7) % 7 || 7;
  day.setUTCDate(day.getUTCDate() + untilTuesday + 7);
  return day.toISOString().slice(0, 10);
}

/** ISO time with the right Texas offset (-05:00 or -06:00), for a date and hour. */
export function departAtIso(date: string, hour: number): string {
  const [y, m, d] = date.split("-").map(Number);
  // Find the Chicago offset on that date at that hour.
  const utcGuess = new Date(Date.UTC(y, m - 1, d, hour));
  const asChicago = new Date(
    utcGuess.toLocaleString("en-US", { timeZone: "America/Chicago" }),
  );
  const asUtc = new Date(utcGuess.toLocaleString("en-US", { timeZone: "UTC" }));
  const offsetMinutes = Math.round((asChicago.getTime() - asUtc.getTime()) / 60000);
  const sign = offsetMinutes < 0 ? "-" : "+";
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(d)}T${pad(hour)}:00:00${sign}${hh}:${mm}`;
}

/** Hours a person would plausibly choose to leave (late evening is cheap but not advice). */
const ADVICE_HOURS = { from: 6, to: 19 };

export function summarize(points: TrafficPoint[]): TrafficSummary | null {
  if (points.length < 2) return null;
  const daytime = points.filter(
    (p) => p.hour >= ADVICE_HOURS.from && p.hour <= ADVICE_HOURS.to,
  );
  const pool = daytime.length >= 2 ? daytime : points;
  const best = pool.reduce((a, b) => (b.minutes < a.minutes ? b : a));
  const worst = pool.reduce((a, b) => (b.minutes > a.minutes ? b : a));
  return { best, worst, extraMinutes: worst.minutes - best.minutes };
}

/** "8 AM", "12 PM" */
export function hourLabel(hour: number): string {
  const suffix = hour < 12 ? "AM" : "PM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${suffix}`;
}

/** Short label for narrow charts: "6a", "12p". */
export function shortHourLabel(hour: number): string {
  return `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? "a" : "p"}`;
}
