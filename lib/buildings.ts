import { cache } from "react";
import { isUuid } from "./lead";
import { getSupabase } from "./supabase";
import type { Building, RenterBillSummary } from "./types";

const BASE_COLUMNS = `id, name, address, city, last_verified,
  latitude, longitude, website, source, approval_known, notes,
  min_income_multiple, min_credit_score, accepts_no_ssn, accepts_guarantor,
  accepts_international_credit,
  floor_plans (id, name, bedrooms, bathrooms, rent_usd, lease_months, available_from),
  building_fees (id, name, monthly_usd),
  building_deals (id, description, kind, amount, valid_until)`;

const ROUND_2_COLUMNS = `${BASE_COLUMNS},
  zip, application_fee_usd, admin_fee_usd, deposit_usd, deposit_no_credit_usd,
  accepts_itin, accepts_passport_only, accepts_offer_letter, guarantor_companies,
  documents_required, utility_billing, electricity_note, miles_to_utd, bus_route,
  building_utility_estimates (bedrooms, avg_usd, low_usd, high_usd, source, as_of),
  building_utility_items (id, name, kind, typical_usd, sort)`;

type Failure = { ok: false; reason: "not_configured" | "query_failed" };
export type BuildingsResult = { ok: true; buildings: Building[] } | Failure;
export type BuildingResult = { ok: true; building: Building | null } | Failure;

// Postgres numeric columns can come back as strings; make them numbers.
function normalize(
  row: Record<string, unknown>,
  bills: RenterBillSummary[] = [],
): Building {
  const b = row as unknown as Building;
  return {
    ...b,
    min_income_multiple: Number(b.min_income_multiple),
    latitude: b.latitude === null ? null : Number(b.latitude),
    longitude: b.longitude === null ? null : Number(b.longitude),
    miles_to_utd: b.miles_to_utd == null ? null : Number(b.miles_to_utd),
    building_deals: b.building_deals.map((d) => ({ ...d, amount: Number(d.amount) })),
    floor_plans: b.floor_plans.map((p) => ({ ...p, bathrooms: Number(p.bathrooms) })),
    building_utility_items: (b.building_utility_items ?? [])
      .map((i) => ({
        ...i,
        typical_usd: i.typical_usd == null ? null : Number(i.typical_usd),
      }))
      .sort((x, y) => x.sort - y.sort),
    renter_bills: bills,
  };
}

/** Renter-reported totals (at least 3 accepted reports per building and size). */
async function fetchRenterBills(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  buildingId?: string,
): Promise<Map<string, RenterBillSummary[]>> {
  let query = supabase
    .from("renter_bill_summary")
    .select("building_id, bedrooms, report_count, avg_usd, low_usd, high_usd");
  if (buildingId) query = query.eq("building_id", buildingId);
  const { data, error } = await query;
  const byBuilding = new Map<string, RenterBillSummary[]>();
  if (error) return byBuilding; // Not set up yet: simply no renter figures.
  for (const row of data ?? []) {
    const list = byBuilding.get(row.building_id) ?? [];
    list.push({
      bedrooms: row.bedrooms,
      report_count: row.report_count,
      avg_usd: row.avg_usd,
      low_usd: row.low_usd,
      high_usd: row.high_usd,
    });
    byBuilding.set(row.building_id, list);
  }
  return byBuilding;
}

/**
 * Asks for Round 2 columns first. If the Round 2 database update hasn't been run
 * yet, falls back to the Round 1 columns so the site keeps working.
 */
async function selectBuildings(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  id?: string,
) {
  const run = (columns: string) => {
    const q = supabase.from("buildings").select(columns);
    return id ? q.eq("id", id) : q;
  };
  const full = await run(ROUND_2_COLUMNS);
  if (!full.error) return full;
  console.warn("Round 2 columns unavailable, using Round 1 columns:", full.error.message);
  return run(BASE_COLUMNS);
}

function supabaseOrLog() {
  const supabase = getSupabase();
  if (!supabase) {
    // For the team, in server logs only. Renters see a plain message.
    console.error(
      "Supabase keys are missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return supabase;
}

/** Loads every building with its plans, fees, deals, utilities and renter figures. */
export async function fetchBuildings(): Promise<BuildingsResult> {
  const supabase = supabaseOrLog();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const [{ data, error }, bills] = await Promise.all([
    selectBuildings(supabase),
    fetchRenterBills(supabase),
  ]);
  if (error) {
    console.error("Failed to load buildings:", error.message);
    if (/invalid api key/i.test(error.message)) {
      console.error(
        "Hint: the Supabase key in .env.local is wrong or from another project. Run: npm run check:env",
      );
    }
    return { ok: false, reason: "query_failed" };
  }
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return {
    ok: true,
    buildings: rows.map((row) => normalize(row, bills.get(row.id as string))),
  };
}

/**
 * Loads one building, or null if the id is invalid or unknown.
 * Wrapped in cache() so the page and its title share a single database call.
 */
export const fetchBuilding = cache(async (id: string): Promise<BuildingResult> => {
  if (!isUuid(id)) return { ok: true, building: null };

  const supabase = supabaseOrLog();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const [{ data, error }, bills] = await Promise.all([
    selectBuildings(supabase, id),
    fetchRenterBills(supabase, id),
  ]);
  if (error) {
    console.error("Failed to load building:", error.message);
    return { ok: false, reason: "query_failed" };
  }
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return { ok: true, building: rows[0] ? normalize(rows[0], bills.get(id)) : null };
});
