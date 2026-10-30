// Shapes of the data we read from Supabase.

import type { ApprovalCriteria } from "./approval";

export type FloorPlan = {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  rent_usd: number;
  lease_months: number;
  available_from: string; // YYYY-MM-DD
};

export type Fee = {
  id: string;
  name: string;
  monthly_usd: number;
};

export type Deal = {
  id: string;
  description: string;
  kind: "fixed_usd" | "free_weeks";
  amount: number;
  valid_until: string | null; // YYYY-MM-DD
};

/** How a building bills water, sewer and trash. */
export type UtilityBilling =
  "submetered" | "allocated" | "included" | "direct" | "unknown";

/** Monthly utilities billed by the building, for one bedroom count. */
export type UtilityEstimate = {
  bedrooms: number;
  avg_usd: number;
  low_usd: number;
  high_usd: number;
  source: "building" | "estimate";
  as_of: string; // YYYY-MM-DD
};

export type UtilityItem = {
  id: string;
  name: string;
  kind: "water" | "sewer" | "trash" | "drainage" | "admin" | "other";
  typical_usd: number | null;
  sort: number;
};

/** What at least 3 renters reported (accepted reports only). */
export type RenterBillSummary = {
  bedrooms: number;
  report_count: number;
  avg_usd: number;
  low_usd: number;
  high_usd: number;
};

export type Building = ApprovalCriteria & {
  id: string;
  name: string;
  address: string;
  city: string;
  last_verified: string; // YYYY-MM-DD
  floor_plans: FloorPlan[];
  building_fees: Fee[];
  building_deals: Deal[];
  // Round 2 (optional until the database update has run and data is entered)
  zip?: string | null;
  application_fee_usd?: number | null;
  admin_fee_usd?: number | null;
  deposit_usd?: number | null;
  deposit_no_credit_usd?: number | null;
  accepts_offer_letter?: boolean | null;
  guarantor_companies?: string[];
  documents_required?: string[];
  utility_billing?: UtilityBilling;
  electricity_note?: string | null;
  miles_to_utd?: number | null;
  bus_route?: string | null;
  building_utility_estimates?: UtilityEstimate[];
  building_utility_items?: UtilityItem[];
  renter_bills?: RenterBillSummary[];
};
