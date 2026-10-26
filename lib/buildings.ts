import { getSupabase } from "./supabase";
import type { Building } from "./types";

export type BuildingsResult =
  | { ok: true; buildings: Building[] }
  | { ok: false; reason: "not_configured" | "query_failed" };

/** Loads every building with its floor plans, fees and deals. */
export async function fetchBuildings(): Promise<BuildingsResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const { data, error } = await supabase.from("buildings").select(
    `id, name, address, city, last_verified,
       min_income_multiple, min_credit_score, accepts_no_ssn, accepts_guarantor,
       accepts_international_credit,
       floor_plans (id, name, bedrooms, bathrooms, rent_usd, lease_months, available_from),
       building_fees (id, name, monthly_usd),
       building_deals (id, description, kind, amount, valid_until)`,
  );

  if (error) {
    console.error("Failed to load buildings:", error.message);
    return { ok: false, reason: "query_failed" };
  }

  // Postgres numeric columns can come back as strings; make them numbers.
  const buildings = (data ?? []).map((b) => ({
    ...b,
    min_income_multiple: Number(b.min_income_multiple),
    building_deals: b.building_deals.map((d) => ({ ...d, amount: Number(d.amount) })),
    floor_plans: b.floor_plans.map((p) => ({ ...p, bathrooms: Number(p.bathrooms) })),
  })) as Building[];

  return { ok: true, buildings };
}
