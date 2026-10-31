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

export type Building = ApprovalCriteria & {
  id: string;
  name: string;
  address: string;
  city: string;
  last_verified: string; // YYYY-MM-DD
  /** Map pin. Null until the address has been looked up. */
  latitude: number | null;
  longitude: number | null;
  /** The community's own website, if known. */
  website: string | null;
  /** "osm" = real name and position from OpenStreetMap, prices not entered yet. */
  source: "manual" | "osm";
  /** False when the approval fields are placeholders, not the building's real rules. */
  approval_known: boolean;
  /** Plain-words caveat about where the data came from. */
  notes: string | null;
  floor_plans: FloorPlan[];
  building_fees: Fee[];
  building_deals: Deal[];
};
