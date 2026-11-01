// Shared map settings. Tiles come from OpenFreeMap (free, open data, no key).

export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/** UT Dallas main campus (public landmark), used as the first "place that matters". */
export const CAMPUS = { name: "UT Dallas", latitude: 32.9886, longitude: -96.748 };

export type MapPin = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Short text on the pin, such as a price. */
  label?: string;
  /** Pin opens this page when tapped. */
  href?: string;
  /** Real place, but prices aren't entered yet: drawn grey and small. */
  unverified?: boolean;
  /** A nearby store, bus stop and so on: small neutral dot, not a building. */
  place?: boolean;
};

/** Distance in miles between two points (straight line, not driving). */
export function milesBetween(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
