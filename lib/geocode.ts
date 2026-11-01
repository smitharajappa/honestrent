// Turning an address the renter types into a point on the map.
// Uses OpenStreetMap's free Nominatim search (open data). Usage rules: identify the app,
// at most one request a second, and only when a person presses "Find" (never as they type).

export type Candidate = { name: string; latitude: number; longitude: number };

// Texas, with some room (used to reject points far outside where we work).
export const TEXAS_BOX = { south: 25.8, north: 36.6, west: -106.7, east: -93.5 };

export function inTexas(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= TEXAS_BOX.south &&
    lat <= TEXAS_BOX.north &&
    lng >= TEXAS_BOX.west &&
    lng <= TEXAS_BOX.east
  );
}

type NominatimRow = { lat: string; lon: string; display_name: string };

/** Up to 3 places in Texas, with a short readable name each. */
export function parseCandidates(rows: unknown): Candidate[] {
  if (!Array.isArray(rows)) return [];
  const out: Candidate[] = [];
  for (const row of rows as NominatimRow[]) {
    const latitude = Number(row?.lat);
    const longitude = Number(row?.lon);
    if (!inTexas(latitude, longitude) || typeof row.display_name !== "string") continue;
    // "1 Main St, Dallas, Dallas County, Texas, 75201, United States" -> without the country.
    const name = row.display_name.replace(/,\s*United States$/, "");
    out.push({ name, latitude, longitude });
    if (out.length === 3) break;
  }
  return out;
}

export async function searchAddress(query: string): Promise<Candidate[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("q", query);
  // Prefer the Dallas-Fort Worth area, without excluding other places in Texas.
  url.searchParams.set("viewbox", "-97.9,33.6,-96.2,32.2");
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Swelt/0.1 (apartment search; contact via the Swelt website)",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Address search answered ${res.status}`);
  return parseCandidates(await res.json());
}
