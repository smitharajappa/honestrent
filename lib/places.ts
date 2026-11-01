import { getSupabase } from "./supabase";
import { milesBetween } from "./map";

export type PlaceKind =
  "grocery" | "restaurant" | "cafe" | "bank" | "school" | "gym" | "worship" | "bus_stop";

export type Place = {
  id: string;
  kind: PlaceKind;
  name: string;
  latitude: number;
  longitude: number;
};

export type NearbyPlace = Place & { miles: number };

/** Every kind we show: its heading, its short tab name and its map color token. */
export const PLACE_KINDS: {
  kind: PlaceKind;
  label: string;
  tab: string;
  /** CSS variable in app/globals.css */
  color: string;
}[] = [
  { kind: "grocery", label: "Grocery", tab: "Groceries", color: "--place-grocery" },
  { kind: "bus_stop", label: "Bus stops", tab: "Bus stops", color: "--place-bus" },
  { kind: "restaurant", label: "Restaurants", tab: "Restaurants", color: "--place-food" },
  { kind: "cafe", label: "Coffee", tab: "Coffee", color: "--place-cafe" },
  { kind: "bank", label: "Banks", tab: "Banks", color: "--place-bank" },
  { kind: "school", label: "Schools", tab: "Schools", color: "--place-school" },
  { kind: "gym", label: "Gyms", tab: "Fitness", color: "--place-gym" },
  {
    kind: "worship",
    label: "Places of worship",
    tab: "Worship",
    color: "--place-worship",
  },
];

/** Tabs switched on when the map first opens. */
export const DEFAULT_VISIBLE_KINDS: PlaceKind[] = ["grocery", "bus_stop", "gym"];

/** Walking minutes for a straight-line distance (about 3 mph, rounded up). */
export function walkMinutes(miles: number): number {
  return Math.max(1, Math.ceil(miles * 20));
}

/** The closest few places of each kind within a radius, nearest first. */
export function nearestByKind(
  origin: { latitude: number; longitude: number },
  places: Place[],
  { perKind = 3, maxMiles = 2 }: { perKind?: number; maxMiles?: number } = {},
): Record<PlaceKind, NearbyPlace[]> {
  const result = Object.fromEntries(
    PLACE_KINDS.map((k) => [k.kind, [] as NearbyPlace[]]),
  ) as Record<PlaceKind, NearbyPlace[]>;
  for (const place of places) {
    const miles = milesBetween(origin, place);
    if (miles <= maxMiles) result[place.kind].push({ ...place, miles });
  }
  for (const kind of Object.keys(result) as PlaceKind[]) {
    result[kind] = result[kind].sort((a, b) => a.miles - b.miles).slice(0, perKind);
  }
  return result;
}

/** Places in a box around a point (about 2 miles each way). Empty if unavailable. */
export async function fetchPlacesNear(
  latitude: number,
  longitude: number,
): Promise<Place[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const dLat = 0.03; // about 2 miles
  const dLng = 0.035;
  // One request per kind, so a crowded kind (bus stops) never pushes others out.
  const results = await Promise.all(
    PLACE_KINDS.map(({ kind }) =>
      supabase
        .from("places")
        .select("id, kind, name, latitude, longitude")
        .eq("kind", kind)
        .gte("latitude", latitude - dLat)
        .lte("latitude", latitude + dLat)
        .gte("longitude", longitude - dLng)
        .lte("longitude", longitude + dLng)
        .limit(400),
    ),
  );
  const places: Place[] = [];
  for (const { data, error } of results) {
    if (error) {
      console.error("Failed to load places:", error.message);
      continue;
    }
    places.push(...((data ?? []) as Place[]));
  }
  return places;
}
