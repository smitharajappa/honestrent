import { describe, expect, it } from "vitest";
import {
  dealValueUsd,
  rankBuildings,
  realMonthlyCost,
  suggestAlternatives,
} from "./cost";
import type { Building, Deal, FloorPlan } from "./types";

const TODAY = "2026-10-25";

function plan(overrides: Partial<FloorPlan> = {}): FloorPlan {
  return {
    id: "p1",
    name: "1 Bed",
    bedrooms: 1,
    bathrooms: 1,
    rent_usd: 1300,
    lease_months: 12,
    available_from: "2026-11-01",
    ...overrides,
  };
}

function deal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: "d1",
    description: "deal",
    kind: "fixed_usd",
    amount: 600,
    valid_until: null,
    ...overrides,
  };
}

function building(overrides: Partial<Building> = {}): Building {
  return {
    id: "b1",
    name: "Test Building",
    address: "1 Test St",
    city: "Plano",
    last_verified: "2026-10-20",
    min_income_multiple: 3,
    min_credit_score: null,
    accepts_no_ssn: false,
    accepts_guarantor: false,
    accepts_international_credit: false,
    floor_plans: [plan()],
    building_fees: [],
    building_deals: [],
    ...overrides,
  };
}

describe("dealValueUsd", () => {
  it("returns the fixed dollar amount", () => {
    expect(dealValueUsd(deal({ amount: 500 }), plan())).toBe(500);
  });

  it("converts free weeks into dollars using weekly rent", () => {
    // $1300 x 12 / 52 = $300 per week; 6 weeks = $1800
    expect(dealValueUsd(deal({ kind: "free_weeks", amount: 6 }), plan())).toBeCloseTo(
      1800,
    );
  });
});

describe("realMonthlyCost", () => {
  it("equals rent when there are no fees or deals", () => {
    expect(realMonthlyCost(plan(), [], [], TODAY).realMonthlyCost).toBe(1300);
  });

  it("adds all mandatory monthly fees", () => {
    const fees = [
      { id: "f1", name: "Trash", monthly_usd: 30 },
      { id: "f2", name: "Tech", monthly_usd: 75 },
    ];
    const cost = realMonthlyCost(plan(), fees, [], TODAY);
    expect(cost.monthlyFees).toBe(105);
    expect(cost.realMonthlyCost).toBe(1405);
  });

  it("spreads deals over the lease length", () => {
    // $600 off over 12 months = $50/month
    const cost = realMonthlyCost(plan(), [], [deal({ amount: 600 })], TODAY);
    expect(cost.monthlyDealSavings).toBe(50);
    expect(cost.realMonthlyCost).toBe(1250);
  });

  it("ignores expired deals", () => {
    const expired = deal({ valid_until: "2026-10-01" });
    expect(realMonthlyCost(plan(), [], [expired], TODAY).realMonthlyCost).toBe(1300);
  });

  it("counts a deal on its last valid day", () => {
    const lastDay = deal({ valid_until: TODAY });
    expect(realMonthlyCost(plan(), [], [lastDay], TODAY).realMonthlyCost).toBe(1250);
  });

  it("keeps the advertised rent unchanged", () => {
    const fees = [{ id: "f1", name: "Trash", monthly_usd: 30 }];
    expect(realMonthlyCost(plan(), fees, [deal()], TODAY).advertisedRent).toBe(1300);
  });
});

describe("rankBuildings", () => {
  const cheapAfterFees = building({
    id: "a",
    name: "Cheap Rent High Fees",
    floor_plans: [plan({ rent_usd: 1200 })],
    building_fees: [{ id: "f", name: "Tech", monthly_usd: 150 }],
  });
  const pricierWithDeal = building({
    id: "b",
    name: "Higher Rent Big Deal",
    floor_plans: [plan({ rent_usd: 1300 })],
    building_deals: [deal({ amount: 1200 })], // -$100/month
  });

  it("sorts by real monthly cost, not advertised rent", () => {
    const results = rankBuildings(
      [cheapAfterFees, pricierWithDeal],
      2000,
      "2026-12-01",
      TODAY,
    );
    expect(results.map((r) => r.building.name)).toEqual([
      "Higher Rent Big Deal", // 1300 - 100 = 1200
      "Cheap Rent High Fees", // 1200 + 150 = 1350
    ]);
  });

  it("hides buildings whose real cost is over budget", () => {
    const results = rankBuildings(
      [cheapAfterFees, pricierWithDeal],
      1300,
      "2026-12-01",
      TODAY,
    );
    expect(results.map((r) => r.building.name)).toEqual(["Higher Rent Big Deal"]);
  });

  it("includes a building exactly at budget", () => {
    const results = rankBuildings([pricierWithDeal], 1200, "2026-12-01", TODAY);
    expect(results).toHaveLength(1);
  });

  it("hides floor plans not available by the move-in date", () => {
    const late = building({ floor_plans: [plan({ available_from: "2027-01-01" })] });
    expect(rankBuildings([late], 5000, "2026-12-01", TODAY)).toEqual([]);
  });

  it("shows the cheapest matching plan per building and counts matches", () => {
    const multi = building({
      floor_plans: [
        plan({ id: "big", rent_usd: 1600 }),
        plan({ id: "small", rent_usd: 1100 }),
        plan({ id: "late", rent_usd: 900, available_from: "2027-02-01" }),
      ],
    });
    const [result] = rankBuildings([multi], 2000, "2026-12-01", TODAY);
    expect(result.plan.id).toBe("small");
    expect(result.matchingPlanCount).toBe(2);
  });

  it("returns an empty list when nothing fits", () => {
    expect(rankBuildings([cheapAfterFees], 500, "2026-12-01", TODAY)).toEqual([]);
  });
});

describe("suggestAlternatives", () => {
  const b = building({
    floor_plans: [
      plan({ id: "now", rent_usd: 1320, available_from: "2026-11-01" }),
      plan({ id: "later", rent_usd: 1000, available_from: "2027-01-15" }),
    ],
  });

  it("suggests a budget rounded up to the next $50", () => {
    expect(suggestAlternatives([b], 900, "2026-12-01", TODAY).budget).toBe(1350);
  });

  it("suggests the earliest later move-in that fits the budget", () => {
    expect(suggestAlternatives([b], 1100, "2026-12-01", TODAY).moveIn).toBe("2027-01-15");
  });

  it("returns nulls when there is nothing to suggest", () => {
    expect(suggestAlternatives([], 1000, "2026-12-01", TODAY)).toEqual({
      budget: null,
      moveIn: null,
    });
  });
});
