// Shapes of the data we read from Supabase.

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

export type Building = {
  id: string;
  name: string;
  address: string;
  city: "Richardson" | "Plano";
  last_verified: string; // YYYY-MM-DD
  floor_plans: FloorPlan[];
  building_fees: Fee[];
  building_deals: Deal[];
};
