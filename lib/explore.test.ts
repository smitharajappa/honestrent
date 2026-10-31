import { describe, expect, it } from "vitest";
import {
  activeFilterCount,
  DEFAULT_OPTIONS,
  explore,
  insight,
  type ExploreOptions,
} from "./explore";
import type { Building, FloorPlan } from "./types";

const TODAY = "2026-10-25";

function plan(o: Partial<FloorPlan> = {}): FloorPlan {
  return {
    id: "p",
    name: "Plan",
    bedrooms: 1,
    bathrooms: 1,
    rent_usd: 1200,
    lease_months: 12,
    available_from: "2026-11-01",
    ...o,
  };
}

function building(o: Partial<Building> = {}): Building {
  return {
    id: "b",
    name: "B",
    address: "1 St",
    city: "Plano",
    last_verified: "2026-10-20",
    latitude: null,
    longitude: null,
    min_income_multiple: 3,
    min_credit_score: 650,
    accepts_no_ssn: false,
    accepts_guarantor: false,
    accepts_international_credit: false,
    floor_plans: [plan()],
    building_fees: [],
    building_deals: [],
    ...o,
  };
}

function opts(o: Partial<ExploreOptions> = {}): ExploreOptions {
  return {
    ...DEFAULT_OPTIONS,
    budget: 5000,
    moveIn: "2026-12-01",
    today: TODAY,
    profile: null,
    ...o,
  };
}

const richardsonDeal = building({
  id: "r",
  name: "Richardson Deal",
  city: "Richardson",
  floor_plans: [plan({ id: "r1", rent_usd: 1300 })],
  building_deals: [
    {
      id: "d",
      description: "$1,200 off",
      kind: "fixed_usd",
      amount: 1200,
      valid_until: null,
    },
  ],
});
const planoFees = building({
  id: "p",
  name: "Plano Fees",
  city: "Plano",
  accepts_no_ssn: true,
  min_credit_score: null,
  floor_plans: [
    plan({ id: "p0", bedrooms: 0, rent_usd: 1000 }),
    plan({ id: "p2", bedrooms: 2, rent_usd: 1700 }),
  ],
  building_fees: [{ id: "f", name: "Tech", monthly_usd: 100 }],
});

describe("explore", () => {
  it("sorts by real cost by default", () => {
    // Richardson: 1300 - 100 = 1200. Plano studio: 1000 + 100 = 1100.
    expect(
      explore([richardsonDeal, planoFees], opts()).map((i) => i.building.name),
    ).toEqual(["Plano Fees", "Richardson Deal"]);
  });

  it("sorts by biggest savings versus advertised rent", () => {
    const items = explore([richardsonDeal, planoFees], opts({ sort: "savings" }));
    expect(items[0].building.name).toBe("Richardson Deal");
    expect(items[0].savingsVsAd).toBe(100);
  });

  it("filters by city and by active deals", () => {
    expect(
      explore([richardsonDeal, planoFees], opts({ cities: ["Plano"] })),
    ).toHaveLength(1);
    expect(
      explore([richardsonDeal, planoFees], opts({ dealsOnly: true })).map(
        (i) => i.building.id,
      ),
    ).toEqual(["r"]);
  });

  it("filters floor plans by bedrooms, including 3 or more", () => {
    const [item] = explore([planoFees], opts({ bedrooms: [2] }));
    expect(item.plan.id).toBe("p2");
    const big = building({ floor_plans: [plan({ bedrooms: 4 })] });
    expect(explore([big], opts({ bedrooms: [3] }))).toHaveLength(1);
  });

  it("splits cost between roommates and gives each a bedroom", () => {
    // 2 people: only the 2-bed qualifies. (1700 + 100) / 2 = 900 each.
    const [item] = explore([planoFees], opts({ people: 2 }));
    expect(item.plan.id).toBe("p2");
    expect(item.perPerson).toBe(900);
  });

  it("compares the budget with each person's share", () => {
    expect(explore([planoFees], opts({ people: 2, budget: 899 }))).toHaveLength(0);
    expect(explore([planoFees], opts({ people: 2, budget: 900 }))).toHaveLength(1);
  });

  it("keeps only good fits when asked, and sorts by fit", () => {
    const profile = {
      income: "45-60k",
      credit: "no-us-credit",
      idType: "passport",
    } as const;
    const items = explore([richardsonDeal, planoFees], opts({ profile, sort: "fit" }));
    expect(items.map((i) => i.fit?.level)).toEqual(["good", "unlikely"]);
    expect(
      explore([richardsonDeal, planoFees], opts({ profile, goodFitOnly: true })),
    ).toHaveLength(1);
  });

  it("checks approval against each person's share of the rent", () => {
    // $45k = $3,750/mo. Alone, 3 x 1700 = 5,100 fails; shared by 2, 3 x 850 = 2,550 passes.
    const profile = { income: "45-60k", credit: "740-plus", idType: "ssn" } as const;
    const alone = explore([planoFees], opts({ profile, bedrooms: [2] }))[0];
    const shared = explore([planoFees], opts({ profile, people: 2 }))[0];
    expect(alone.fit?.level).toBe("unlikely");
    expect(shared.fit?.level).toBe("good");
  });
});

describe("insight", () => {
  it("averages fees, deals and the gap from advertised rent", () => {
    const items = explore([richardsonDeal, planoFees], opts());
    expect(insight(items)).toEqual({
      count: 2,
      avgFees: 50,
      avgDeals: 50,
      avgGap: 0,
      biggestGap: { name: "Plano Fees", gap: 100 },
    });
  });

  it("returns null with no results", () => {
    expect(insight([])).toBeNull();
  });
});

describe("activeFilterCount", () => {
  it("counts each kind of filter once", () => {
    expect(activeFilterCount({ ...DEFAULT_OPTIONS })).toBe(0);
    expect(
      activeFilterCount({
        ...DEFAULT_OPTIONS,
        bedrooms: [1, 2],
        cities: ["Plano"],
        people: 2,
      }),
    ).toBe(3);
  });
});
