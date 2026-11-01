import { describe, expect, it } from "vitest";
import {
  activeFilterCount,
  applicationFeesSaved,
  DEFAULT_OPTIONS,
  explore,
  inArea,
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
    website: null,
    source: "manual",
    approval_known: true,
    notes: null,
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

  it("gives no fit badge when the approval rules aren't confirmed", () => {
    const profile = {
      income: "45-60k",
      credit: "no-us-credit",
      idType: "passport",
    } as const;
    const unconfirmed = building({ id: "u", approval_known: false });
    const items = explore([unconfirmed], opts({ profile }));
    expect(items).toHaveLength(1);
    expect(items[0].fit).toBeNull();
    expect(explore([unconfirmed], opts({ profile, goodFitOnly: true }))).toHaveLength(0);
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
      avgUtilities: 0,
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

describe("utilities in the estimated total", () => {
  const withUtilities = building({
    id: "u",
    name: "With Utilities",
    utility_billing: "allocated",
    floor_plans: [plan({ id: "u1", rent_usd: 1000 })],
    building_utility_estimates: [
      {
        bedrooms: 1,
        avg_usd: 150,
        low_usd: 100,
        high_usd: 200,
        source: "building",
        as_of: "2025-12-31",
      },
    ],
  });
  const included = building({
    id: "i",
    name: "Included",
    utility_billing: "included",
    floor_plans: [plan({ id: "i1", rent_usd: 1100 })],
  });

  it("ranks by real cost plus average utilities", () => {
    // 1000 + 150 = 1150 vs 1100 + 0 (included) = 1100
    const items = explore([withUtilities, included], opts());
    expect(items.map((i) => [i.building.id, i.estimatedTotal])).toEqual([
      ["i", 1100],
      ["u", 1150],
    ]);
  });

  it("compares the budget with the estimated total", () => {
    expect(explore([withUtilities], opts({ budget: 1149 }))).toHaveLength(0);
    expect(explore([withUtilities], opts({ budget: 1150 }))).toHaveLength(1);
  });

  it("averages utilities only over buildings that bill them", () => {
    expect(insight(explore([withUtilities, included], opts()))?.avgUtilities).toBe(150);
  });
});

describe("area and near-UTD filters", () => {
  const near = building({
    id: "n",
    name: "Near",
    city: "Richardson",
    zip: "75080",
    miles_to_utd: 1.2,
  });
  const far = building({
    id: "f",
    name: "Far",
    city: "Plano",
    zip: "75024",
    miles_to_utd: 7.9,
  });
  const unknown = building({ id: "x", name: "Unknown distance", city: "Plano" });

  it("matches a city in any letter case, or a ZIP", () => {
    expect(inArea(near, "richardson")).toBe(true);
    expect(inArea(near, " 75080 ")).toBe(true);
    expect(inArea(near, "75024")).toBe(false);
    expect(inArea(near, "")).toBe(true);
    expect(inArea(near, "Dallas")).toBe(false);
  });

  it("keeps only buildings within 3 miles of UTD", () => {
    expect(
      explore([near, far, unknown], opts({ nearUtd: true })).map((i) => i.building.id),
    ).toEqual(["n"]);
  });
});

describe("applicationFeesSaved", () => {
  it("adds up fees at unlikely buildings, one per adult", () => {
    const profile = {
      income: "80-100k",
      credit: "740-plus",
      idType: "passport",
    } as const;
    const ssnOnly = building({ id: "s", name: "SSN only", application_fee_usd: 60 });
    const open = building({
      id: "o",
      name: "Open",
      accepts_no_ssn: true,
      application_fee_usd: 40,
    });
    const items = explore([ssnOnly, open], opts({ profile }));
    expect(applicationFeesSaved(items, 1)).toEqual({ buildings: 1, usd: 60 });
    expect(applicationFeesSaved(items, 2)).toEqual({ buildings: 1, usd: 120 });
  });
});

describe("activeFilterCount with near UTD", () => {
  it("counts the near-UTD filter", () => {
    expect(activeFilterCount({ ...DEFAULT_OPTIONS, nearUtd: true })).toBe(1);
  });
});

describe("inArea", () => {
  it("matches a ZIP from the address when no ZIP is saved", () => {
    const b = building({ address: "6400 Ohio Dr, Plano, TX 75024", zip: undefined });
    expect(inArea(b, "75024")).toBe(true);
    expect(inArea(b, "75080")).toBe(false);
  });
  it("matches a city in any letter case and everything when blank", () => {
    const b = building({ city: "Plano" });
    expect(inArea(b, "plano")).toBe(true);
    expect(inArea(b, "")).toBe(true);
    expect(inArea(b, "Dallas")).toBe(false);
  });
});

describe("distance from the renter's chosen place", () => {
  const near = building({ id: "n", name: "Near", latitude: 33.0, longitude: -96.75 });
  const far = building({ id: "f", name: "Far", latitude: 33.2, longitude: -96.75 });
  const origin = { latitude: 33.001, longitude: -96.75 };

  it("works out straight-line miles, only when a place is chosen", () => {
    const withPlace = explore([near, far], opts({ origin }));
    expect(withPlace.find((i) => i.building.id === "n")!.milesFromYou).toBeLessThan(0.2);
    expect(withPlace.find((i) => i.building.id === "f")!.milesFromYou).toBeGreaterThan(
      10,
    );
    expect(explore([near], opts({}))[0].milesFromYou).toBeNull();
  });

  it("sorts nearest first, with ties broken by price", () => {
    const items = explore([far, near], opts({ origin, sort: "near" }));
    expect(items.map((i) => i.building.id)).toEqual(["n", "f"]);
  });
});
