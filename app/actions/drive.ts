"use server";

import { headers } from "next/headers";
import { fetchBuilding } from "@/lib/buildings";
import { inTexas, searchAddress, type Candidate } from "@/lib/geocode";
import { isUuid } from "@/lib/lead";
import { allow } from "@/lib/rate-limit";
import { fetchTypicalDrive } from "@/lib/traffic-server";
import type { TrafficPoint } from "@/lib/traffic";

// Neither action saves anything. The address and the place are used for this one answer.

async function visitor(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export type FindResult =
  { ok: true; candidates: Candidate[] } | { ok: false; error: string };

/** Finds an address the renter typed. Up to 3 places in Texas to choose from. */
export async function findAddress(address: string): Promise<FindResult> {
  const text = String(address ?? "").trim();
  if (text.length < 5 || text.length > 120) {
    return {
      ok: false,
      error: "Enter a street address and city, like 800 W Campbell Rd, Richardson.",
    };
  }
  if (!allow(`find:${await visitor()}`, 12, 10 * 60_000)) {
    return {
      ok: false,
      error: "That's a lot of searches. Please wait a few minutes and try again.",
    };
  }
  try {
    const candidates = await searchAddress(text);
    if (candidates.length === 0) {
      return {
        ok: false,
        error:
          "We couldn't find that address in Texas. Add the city or ZIP and try again.",
      };
    }
    return { ok: true, candidates };
  } catch {
    return {
      ok: false,
      error: "Address search isn't answering right now. Please try again soon.",
    };
  }
}

export type DriveResult =
  | { ok: true; source: "tomtom" | "sample"; points: TrafficPoint[] }
  | { ok: false; error: string };

/** Typical weekday drive time by hour from one building to a place the renter chose. */
export async function driveTimes(
  buildingId: string,
  latitude: number,
  longitude: number,
): Promise<DriveResult> {
  if (!isUuid(buildingId) || !inTexas(Number(latitude), Number(longitude))) {
    return { ok: false, error: "We can't work out a drive to that place." };
  }
  if (!allow(`drive:${await visitor()}`, 20, 10 * 60_000)) {
    return {
      ok: false,
      error: "That's a lot of lookups. Please wait a few minutes and try again.",
    };
  }
  const result = await fetchBuilding(buildingId);
  const b = result.ok ? result.building : null;
  if (!b || b.latitude === null || b.longitude === null) {
    return { ok: false, error: "We don't have this building's location yet." };
  }
  const drive = await fetchTypicalDrive(
    { latitude: b.latitude, longitude: b.longitude },
    { latitude: Number(latitude), longitude: Number(longitude) },
    { remember: false },
  );
  if (!drive) {
    return {
      ok: false,
      error: "Real drive times need our traffic data, which isn't switched on yet.",
    };
  }
  return { ok: true, source: drive.source, points: drive.points };
}
