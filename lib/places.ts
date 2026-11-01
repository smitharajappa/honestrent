import { getSupabase } from "./supabase";
import { milesBetween } from "./map";

export type PlaceKind = "grocery" | "gym" | "worship" | "bus_stop";

export type Place = {
  id: string;
  kind: PlaceKind;
  name: string;
  latitude: number;
  longitude: number;
};

export type NearbyPlace = Place & { miles: number };

export const PLACE_KINDS: { kind: PlaceKind; label: string }[] = [
  { kind: "grocery", label: "Grocery" },
  { kind: "bus_stop", label: "Bus stops" },
  { kind: "gym", label: "Gyms" },
  { kind: "worship", label: "Places of worship" },
];

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
  const result: Record<PlaceKind, NearbyPlace[]> = {
    grocery: [],
    gym: [],
    worship: [],
    bus_stop: [],
  };
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
  const { data, error } = await supabase
    .from("places")
    .select("id, kind, name, latitude, longitude")
    .gte("latitude", latitude - dLat)
    .lte("latitude", latitude + dLat)
    .gte("longitude", longitude - dLng)
    .lte("longitude", longitude + dLng)
    .limit(2000);
  if (error) {
    console.error("Failed to load places:", error.message);
    return [];
  }
  return (data ?? []) as Place[];
}
