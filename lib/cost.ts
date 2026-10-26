import type { Building, Deal, Fee, FloorPlan } from "./types";

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

/** Dollar value of one deal for a given floor plan. */
export function dealValueUsd(deal: Deal, plan: FloorPlan): number {
  if (deal.kind === "fixed_usd") return deal.amount;
  const weeklyRent = (plan.rent_usd * MONTHS_PER_YEAR) / WEEKS_PER_YEAR;
  return weeklyRent * deal.amount;
}

/** A deal counts if it has no end date or has not expired yet. */
export function isDealActive(deal: Deal, today: string): boolean {
  return deal.valid_until === null || deal.valid_until >= today;
}

export type CostBreakdown = {
  advertisedRent: number;
  monthlyFees: number;
  monthlyDealSavings: number;
  realMonthlyCost: number;
};

/**
 * Real monthly cost = rent + mandatory monthly fees - (deals spread over the lease).
 * Rounded to whole dollars for display.
 */
export function realMonthlyCost(
  plan: FloorPlan,
  fees: Fee[],
  deals: Deal[],
  today: string,
): CostBreakdown {
  const monthlyFees = fees.reduce((sum, fee) => sum + fee.monthly_usd, 0);
  const totalDeals = deals
    .filter((deal) => isDealActive(deal, today))
    .reduce((sum, deal) => sum + dealValueUsd(deal, plan), 0);
  const monthlyDealSavings = totalDeals / plan.lease_months;

  return {
    advertisedRent: plan.rent_usd,
    monthlyFees: Math.round(monthlyFees),
    monthlyDealSavings: Math.round(monthlyDealSavings),
    realMonthlyCost: Math.round(plan.rent_usd + monthlyFees - monthlyDealSavings),
  };
}

export type RankedResult = {
  building: Building;
  plan: FloorPlan;
  cost: CostBreakdown;
  matchingPlanCount: number;
};

/**
 * For each building, find floor plans available by the move-in date whose real
 * monthly cost fits the budget. Keep the cheapest one per building, then sort
 * buildings cheapest first.
 */
export function rankBuildings(
  buildings: Building[],
  budgetUsd: number,
  moveInDate: string,
  today: string,
): RankedResult[] {
  const results: RankedResult[] = [];

  for (const building of buildings) {
    const matches = building.floor_plans
      .filter((plan) => plan.available_from <= moveInDate)
      .map((plan) => ({
        plan,
        cost: realMonthlyCost(
          plan,
          building.building_fees,
          building.building_deals,
          today,
        ),
      }))
      .filter(({ cost }) => cost.realMonthlyCost <= budgetUsd)
      .sort((a, b) => a.cost.realMonthlyCost - b.cost.realMonthlyCost);

    if (matches.length > 0) {
      results.push({ building, ...matches[0], matchingPlanCount: matches.length });
    }
  }

  return results.sort(
    (a, b) =>
      a.cost.realMonthlyCost - b.cost.realMonthlyCost ||
      a.building.name.localeCompare(b.building.name),
  );
}
