// Filtering, sorting, roommate split and insight numbers for the results page.
// Pure functions, so they're tested and run the same in the browser and on the server.

import { approvalFit, type ApprovalProfile, type Fit, type FitLevel } from "./approval";
import { isDealActive, realMonthlyCost, type CostBreakdown } from "./cost";
import type { Building, FloorPlan } from "./types";

export type SortKey = "cost" | "savings" | "fit";
export type BedroomFilter = 0 | 1 | 2 | 3; // 3 means "3 or more"

export type ExploreOptions = {
  budget: number; // the renter's own share per month
  moveIn: string;
  today: string;
  /** People sharing the apartment (1 = living alone). Each person gets a bedroom. */
  people: number;
  bedrooms: BedroomFilter[]; // empty = any
  cities: string[]; // empty = any
  dealsOnly: boolean;
  goodFitOnly: boolean;
  profile: ApprovalProfile | null;
  sort: SortKey;
};

export type ExploreItem = {
  building: Building;
  plan: FloorPlan;
  cost: CostBreakdown;
  /** Real monthly cost divided between the people sharing. */
  perPerson: number;
  /** Positive when the real cost is below the advertised rent. */
  savingsVsAd: number;
  matchingPlanCount: number;
  fit: Fit | null;
};

export const DEFAULT_OPTIONS: Omit<
  ExploreOptions,
  "budget" | "moveIn" | "today" | "profile"
> = {
  people: 1,
  bedrooms: [],
  cities: [],
  dealsOnly: false,
  goodFitOnly: false,
  sort: "cost",
};

const FIT_ORDER: Record<FitLevel, number> = { good: 0, guarantor: 1, unlikely: 2 };

function matchesBedrooms(plan: FloorPlan, filter: BedroomFilter[]): boolean {
  if (filter.length === 0) return true;
  return filter.some((b) => (b === 3 ? plan.bedrooms >= 3 : plan.bedrooms === b));
}

export function hasActiveDeal(building: Building, today: string): boolean {
  return building.building_deals.some((d) => isDealActive(d, today));
}

/**
 * For each building, keep floor plans that are available by move-in, match the
 * bedroom filter, give each person a bedroom, and fit the per-person budget.
 * Show the cheapest one, then filter and sort buildings.
 */
export function explore(buildings: Building[], o: ExploreOptions): ExploreItem[] {
  const people = Math.max(1, Math.floor(o.people));
  const items: ExploreItem[] = [];

  for (const building of buildings) {
    if (o.cities.length > 0 && !o.cities.includes(building.city)) continue;
    if (o.dealsOnly && !hasActiveDeal(building, o.today)) continue;

    const matches = building.floor_plans
      .filter((plan) => plan.available_from <= o.moveIn)
      .filter((plan) => matchesBedrooms(plan, o.bedrooms))
      .filter((plan) => people === 1 || plan.bedrooms >= people)
      .map((plan) => {
        const cost = realMonthlyCost(
          plan,
          building.building_fees,
          building.building_deals,
          o.today,
        );
        return { plan, cost, perPerson: Math.round(cost.realMonthlyCost / people) };
      })
      .filter((m) => m.perPerson <= o.budget)
      .sort((a, b) => a.cost.realMonthlyCost - b.cost.realMonthlyCost);

    if (matches.length === 0) continue;
    const best = matches[0];

    // Approval is checked against each person's share of the rent.
    const fit = o.profile
      ? approvalFit(o.profile, building, Math.round(best.plan.rent_usd / people))
      : null;
    if (o.goodFitOnly && fit?.level !== "good") continue;

    items.push({
      building,
      plan: best.plan,
      cost: best.cost,
      perPerson: best.perPerson,
      savingsVsAd: best.cost.advertisedRent - best.cost.realMonthlyCost,
      matchingPlanCount: matches.length,
      fit,
    });
  }

  const byCost = (a: ExploreItem, b: ExploreItem) =>
    a.cost.realMonthlyCost - b.cost.realMonthlyCost ||
    a.building.name.localeCompare(b.building.name);

  return items.sort((a, b) => {
    if (o.sort === "savings") return b.savingsVsAd - a.savingsVsAd || byCost(a, b);
    if (o.sort === "fit" && a.fit && b.fit) {
      return FIT_ORDER[a.fit.level] - FIT_ORDER[b.fit.level] || byCost(a, b);
    }
    return byCost(a, b);
  });
}

export type Insight = {
  count: number;
  avgFees: number;
  avgDeals: number;
  /** Average real cost minus advertised rent (negative = cheaper than ads). */
  avgGap: number;
  biggestGap: { name: string; gap: number } | null;
};

/** Headline numbers for the insight banner. Null when there's nothing to show. */
export function insight(items: ExploreItem[]): Insight | null {
  if (items.length === 0) return null;
  const avg = (f: (i: ExploreItem) => number) =>
    Math.round(items.reduce((sum, i) => sum + f(i), 0) / items.length);
  const biggest = [...items].sort(
    (a, b) =>
      Math.abs(b.cost.realMonthlyCost - b.cost.advertisedRent) -
      Math.abs(a.cost.realMonthlyCost - a.cost.advertisedRent),
  )[0];
  const gap = biggest.cost.realMonthlyCost - biggest.cost.advertisedRent;
  return {
    count: items.length,
    avgFees: avg((i) => i.cost.monthlyFees),
    avgDeals: avg((i) => i.cost.monthlyDealSavings),
    avgGap: avg((i) => i.cost.realMonthlyCost - i.cost.advertisedRent),
    biggestGap: gap === 0 ? null : { name: biggest.building.name, gap },
  };
}

/** How many filters are switched on (for the "Filters (2)" label). */
export function activeFilterCount(
  o: Pick<ExploreOptions, "bedrooms" | "cities" | "dealsOnly" | "goodFitOnly" | "people">,
): number {
  return (
    (o.bedrooms.length > 0 ? 1 : 0) +
    (o.cities.length > 0 ? 1 : 0) +
    (o.dealsOnly ? 1 : 0) +
    (o.goodFitOnly ? 1 : 0) +
    (o.people > 1 ? 1 : 0)
  );
}
