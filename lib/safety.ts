import { getSupabase } from "./supabase";

// Reported-incident counts near a building. Counts only, never a score or grade:
// the same facts are shown for every building, and nothing here uses who lives nearby.

export type BuildingSafety = {
  period_start: string; // YYYY-MM-DD
  period_end: string;
  radius_miles: number;
  against_people: number;
  property: number;
  other: number;
  /** Smaller 0.25-mile circle for parking-lot and street vehicle incidents. Null if not counted. */
  vehicle_radius_miles: number | null;
  vehicle_break_ins: number | null;
  vehicle_thefts: number | null;
  city_average_people_property: number;
  city_name: string;
  source_name: string;
  source_url: string;
  license: string;
};

export type Comparison = "fewer" | "about_same" | "more";

/** Compares people + property incidents with the city's average for an area this size. */
export function compareWithCity(s: BuildingSafety): { ratio: number; level: Comparison } {
  const count = s.against_people + s.property;
  const ratio =
    s.city_average_people_property > 0 ? count / s.city_average_people_property : 1;
  const level: Comparison = ratio < 0.8 ? "fewer" : ratio > 1.25 ? "more" : "about_same";
  return { ratio, level };
}

export const COMPARISON_TEXT: Record<Comparison, string> = {
  fewer: "Fewer reported incidents than",
  about_same: "About the same number of reported incidents as",
  more: "More reported incidents than",
};

/** The police department's own public map, when we know a link we have checked. */
export const OFFICIAL_CRIME_MAPS: Record<string, { label: string; url: string }> = {
  Richardson: {
    label: "Richardson Police crime statistics and map",
    url: "https://www.richardsonpolice.net/i-want-to/find/crime-stats",
  },
  Dallas: {
    label: "Dallas Police crime dashboard",
    url: "https://dallascitydata.dallascityhall.com/#/views/CrimeAnalyticsDashboard/CrimeOverviewD",
  },
};

export async function fetchSafety(buildingId: string): Promise<BuildingSafety | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("building_safety")
    .select(
      "period_start, period_end, radius_miles, against_people, property, other, vehicle_radius_miles, vehicle_break_ins, vehicle_thefts, city_average_people_property, city_name, source_name, source_url, license",
    )
    .eq("building_id", buildingId)
    .maybeSingle();
  if (error) {
    console.error("Failed to load safety data:", error.message);
    return null;
  }
  if (!data) return null;
  return {
    ...data,
    radius_miles: Number(data.radius_miles),
    vehicle_radius_miles:
      data.vehicle_radius_miles == null ? null : Number(data.vehicle_radius_miles),
    city_average_people_property: Number(data.city_average_people_property),
  } as BuildingSafety;
}
