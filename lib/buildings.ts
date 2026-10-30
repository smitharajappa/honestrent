import { cache } from "react";
import { isUuid } from "./lead";
import { getSupabase } from "./supabase";
import type { Building } from "./types";

const BUILDING_COLUMNS = `id, name, address, city, last_verified,
  min_income_multiple, min_credit_score, accepts_no_ssn, accepts_guarantor,
  accepts_international_credit,
  floor_plans (id, name, bedrooms, bathrooms, rent_usd, lease_months, available_from),
  building_fees (id, name, monthly_usd),
  building_deals (id, description, kind, amount, valid_until)`;

type Failure = { ok: false; reason: "not_configured" | "query_failed" };
export type BuildingsResult = { ok: true; buildings: Building[] } | Failure;
export type BuildingResult = { ok: true; building: Building | null } | Failure;

// Postgres numeric columns can come back as strings; make them numbers.
function normalize(row: Record<string, unknown>): Building {
  const b = row as unknown as Building;
  return {
    ...b,
    min_income_multiple: Number(b.min_income_multiple),
    building_deals: b.building_deals.map((d) => ({ ...d, amount: Number(d.amount) })),
    floor_plans: b.floor_plans.map((p) => ({ ...p, bathrooms: Number(p.bathrooms) })),
  };
}

/** Loads every building with its floor plans, fees and deals. */
export async function fetchBuildings(): Promise<BuildingsResult> {
  const supabase = getSupabase();
  if (!supabase) {
    // For the team, in server logs only. Renters see a plain message.
    console.error(
      "Supabase keys are missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
    return { ok: false, reason: "not_configured" };
  }

  const { data, error } = await supabase.from("buildings").select(BUILDING_COLUMNS);
  if (error) {
    console.error("Failed to load buildings:", error.message);
    return { ok: false, reason: "query_failed" };
  }
  return { ok: true, buildings: (data ?? []).map(normalize) };
}

/**
 * Loads one building, or null if the id is invalid or unknown.
 * Wrapped in cache() so the page and its title share a single database call.
 */
export const fetchBuilding = cache(async (id: string): Promise<BuildingResult> => {
  if (!isUuid(id)) return { ok: true, building: null };

  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const { data, error } = await supabase
    .from("buildings")
    .select(BUILDING_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("Failed to load building:", error.message);
    return { ok: false, reason: "query_failed" };
  }
  return { ok: true, building: data ? normalize(data) : null };
});
