// Fetches typical weekday drive times from TomTom's Routing API.
// Server only. Needs TOMTOM_API_KEY. Without it: a labelled sample in demo mode, otherwise no chart.
//
// We do NOT store TomTom's answers in our database (their terms limit storage).
// The web host reuses an answer for up to 7 days, which is ordinary short-term caching.

import { milesBetween } from "./map";
import { IS_DEMO } from "./site";
import {
  departAtIso,
  nextTypicalWeekday,
  sampleDrive,
  SAMPLE_HOURS,
  type TrafficPoint,
} from "./traffic";

const ROUTE_URL = "https://api.tomtom.com/routing/1/calculateRoute";
const WEEK_SECONDS = 7 * 24 * 60 * 60;

type Point = { latitude: number; longitude: number };

async function minutesAt(
  from: Point,
  to: Point,
  date: string,
  hour: number,
  key: string,
): Promise<number | null> {
  const locations = `${from.latitude},${from.longitude}:${to.latitude},${to.longitude}`;
  const params = new URLSearchParams({
    key,
    departAt: departAtIso(date, hour),
    traffic: "true",
    travelMode: "car",
    routeType: "fastest",
  });
  try {
    const res = await fetch(`${ROUTE_URL}/${locations}/json?${params}`, {
      next: { revalidate: WEEK_SECONDS },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const seconds = json?.routes?.[0]?.summary?.travelTimeInSeconds;
    return typeof seconds === "number" ? Math.round(seconds / 60) : null;
  } catch {
    return null;
  }
}

export type TypicalDrive = {
  points: TrafficPoint[];
  /** "tomtom" = real predicted traffic. "sample" = made-up demo curve. */
  source: "tomtom" | "sample";
};

/**
 * Drive time by hour on a typical weekday. Uses TomTom when a key is set; in demo mode
 * with no key it returns a clearly labelled sample curve; otherwise null (no chart).
 */
export async function fetchTypicalDrive(
  from: Point,
  to: Point,
): Promise<TypicalDrive | null> {
  const key = process.env.TOMTOM_API_KEY;
  if (!key) {
    return IS_DEMO
      ? { points: sampleDrive(milesBetween(from, to)), source: "sample" }
      : null;
  }
  const date = nextTypicalWeekday(new Date());
  const results = await Promise.all(
    SAMPLE_HOURS.map(async (hour) => ({
      hour: hour as number,
      minutes: await minutesAt(from, to, date, hour, key),
    })),
  );
  const points: TrafficPoint[] = [];
  for (const r of results) {
    if (r.minutes !== null && r.minutes > 0)
      points.push({ hour: r.hour, minutes: r.minutes });
  }
  // A chart with only a few hours would mislead.
  if (points.length < SAMPLE_HOURS.length - 2) return null;
  return { points, source: "tomtom" };
}
