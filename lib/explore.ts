// Filtering, sorting, roommate split and insight numbers for the results page.
// Pure functions, so they're tested and run the same in the browser and on the server.

import { approvalFit, type ApprovalProfile, type Fit, type FitLevel } from "./approval";
import { isDealActive, realMonthlyCost, type CostBreakdown } from "./cost";
import type { Building, FloorPlan } from "./types";
import { utilitiesFor, type UtilityView } from "./utilities";

export type SortKey = "cost" | "savings" | "fit";
export type BedroomFilter = 0 | 1 | 2 | 3; // 3 means "3 or more"

/** "Near UTD" means within this many miles. */
export const NEAR_UTD_MILES = 3;

export type ExploreOptions = {
  budget: number; // the renter's own share per month, utilities included
  moveIn: string;
  today: string;
  /** People sharing the apartment (1 = living alone). Each person gets a bedroom. */
  people: number;
  bedrooms: BedroomFilter[]; // empty = any
  cities: string[]; // empty = any
  dealsOnly: boolean;
  goodFitOnly: boolean;
  nearUtd: boolean;
  profile: ApprovalProfile | null;
  sort: SortKey;
};

export type ExploreItem = {
  building: Building;
  plan: FloorPlan;
  /** Rent + required fixed fees − deals (exact). */
  cost: CostBreakdown;
  /** Utilities billed by the building (an average that varies month to month). */
  utilities: UtilityView;
  /** Real cost + average utilities: what Swelt ranks by. */
  estimatedTotal: number;
  /** Estimated total divided between the people sharing. */
  perPerson: number;
  /** Positive when the estimated total is below the advertised rent. */
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
  nearUtd: false,
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

/** The building's ZIP: the saved one, or the one at the end of its address. */
export function zipOf(building: Building): string | null {
  if (building.zip) return building.zip;
  return building.address.match(/\b(\d{5})\s*$/)?.[1] ?? null;
}

/**
 * True when the building is in the searched area: a city name (any letter case)
 * or a 5-digit ZIP. An empty area matches everything.
 */
export function inArea(building: Building, area: string | null | undefined): boolean {
  const q = (area ?? "").trim().toLowerCase();
  if (q === "") return true;
  if (/^\d{5}$/.test(q)) return zipOf(building) === q;
  return building.city.toLowerCase() === q;
}

/**
 * For each building, keep floor plans that are available by move-in, match the
 * bedroom filter, give each person a bedroom, and fit the per-person budget
 * (estimated total, utilities included). Show the cheapest one, then filter and sort.
 */
export function explore(buildings: Building[], o: ExploreOptions): ExploreItem[] {
  const people = Math.max(1, Math.floor(o.people));
  const items: ExploreItem[] = [];

  for (const building of buildings) {
    if (o.cities.length > 0 && !o.cities.includes(building.city)) continue;
    if (o.dealsOnly && !hasActiveDeal(building, o.today)) continue;
    if (
      o.nearUtd &&
      !(building.miles_to_utd != null && building.miles_to_utd <= NEAR_UTD_MILES)
    )
      continue;

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
        const utilities = utilitiesFor(building, plan.bedrooms);
        const estimatedTotal = cost.realMonthlyCost + utilities.avg;
        return {
          plan,
          cost,
          utilities,
          estimatedTotal,
          perPerson: Math.round(estimatedTotal / people),
        };
      })
      .filter((m) => m.perPerson <= o.budget)
      .sort((a, b) => a.estimatedTotal - b.estimatedTotal);

    if (matches.length === 0) continue;
    const best = matches[0];

    // Approval is checked against each person's share of the rent.
    // Buildings whose approval rules we haven't confirmed get no fit badge.
    const fit =
      o.profile && building.approval_known
        ? approvalFit(o.profile, building, Math.round(best.plan.rent_usd / people))
        : null;
    if (o.goodFitOnly && fit?.level !== "good") continue;

    items.push({
      building,
      plan: best.plan,
      cost: best.cost,
      utilities: best.utilities,
      estimatedTotal: best.estimatedTotal,
      perPerson: best.perPerson,
      savingsVsAd: best.cost.advertisedRent - best.estimatedTotal,
      matchingPlanCount: matches.length,
      fit,
    });
  }

  const byTotal = (a: ExploreItem, b: ExploreItem) =>
    a.estimatedTotal - b.estimatedTotal || a.building.name.localeCompare(b.building.name);

  return items.sort((a, b) => {
    if (o.sort === "savings") return b.savingsVsAd - a.savingsVsAd || byTotal(a, b);
    if (o.sort === "fit" && a.fit && b.fit) {
      return FIT_ORDER[a.fit.level] - FIT_ORDER[b.fit.level] || byTotal(a, b);
    }
    return byTotal(a, b);
  });
}

export type Insight = {
  count: number;
  avgFees: number;
  avgDeals: number;
  /** Average utilities billed by buildings that have a known figure. */
  avgUtilities: number;
  /** Average estimated total minus advertised rent (negative = cheaper than ads). */
  avgGap: number;
  biggestGap: { name: string; gap: number } | null;
};

/** Headline numbers for the insight banner. Null when there's nothing to show. */
export function insight(items: ExploreItem[]): Insight | null {
  if (items.length === 0) return null;
  const avgOf = (list: ExploreItem[], f: (i: ExploreItem) => number) =>
    list.length === 0
      ? 0
      : Math.round(list.reduce((sum, i) => sum + f(i), 0) / list.length);
  const gapOf = (i: ExploreItem) => i.estimatedTotal - i.cost.advertisedRent;
  const biggest = [...items].sort((a, b) => Math.abs(gapOf(b)) - Math.abs(gapOf(a)))[0];
  const billed = items.filter((i) => i.utilities.known && i.utilities.avg > 0);
  return {
    count: items.length,
    avgFees: avgOf(items, (i) => i.cost.monthlyFees),
    avgDeals: avgOf(items, (i) => i.cost.monthlyDealSavings),
    avgUtilities: avgOf(billed, (i) => i.utilities.avg),
    avgGap: avgOf(items, gapOf),
    biggestGap:
      gapOf(biggest) === 0 ? null : { name: biggest.building.name, gap: gapOf(biggest) },
  };
}

/**
 * Application fees a renter avoids by skipping buildings that are unlikely to
 * approve them (one fee per adult). Buildings without a known fee are left out.
 */
export function applicationFeesSaved(
  items: ExploreItem[],
  adults: number,
): { buildings: number; usd: number } {
  const unlikely = items.filter(
    (i) => i.fit?.level === "unlikely" && i.building.application_fee_usd != null,
  );
  return {
    buildings: unlikely.length,
    usd: unlikely.reduce(
      (sum, i) => sum + (i.building.application_fee_usd ?? 0) * Math.max(1, adults),
      0,
    ),
  };
}

/** How many filters are switched on (for the "Filters (2)" label). */
export function activeFilterCount(
  o: Pick<
    ExploreOptions,
    "bedrooms" | "cities" | "dealsOnly" | "goodFitOnly" | "people" | "nearUtd"
  >,
): number {
  return (
    (o.bedrooms.length > 0 ? 1 : 0) +
    (o.cities.length > 0 ? 1 : 0) +
    (o.dealsOnly ? 1 : 0) +
    (o.goodFitOnly ? 1 : 0) +
    (o.nearUtd ? 1 : 0) +
    (o.people > 1 ? 1 : 0)
  );
}
