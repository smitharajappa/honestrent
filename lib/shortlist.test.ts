import { describe, expect, it } from "vitest";
import { itemsFor } from "./shortlist";
import type { Building, FloorPlan } from "./types";

const TODAY = "2026-10-25";

function plan(o: Partial<FloorPlan>): FloorPlan {
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

function building(id: string, plans: FloorPlan[]): Building {
  return {
    id,
    name: id,
    address: "1 St",
    city: "Plano",
    last_verified: "2026-10-20",
    min_income_multiple: 3,
    min_credit_score: null,
    accepts_no_ssn: true,
    accepts_guarantor: false,
    accepts_international_credit: false,
    floor_plans: plans,
    building_fees: [],
    building_deals: [],
  };
}

const a = building("a", [
  plan({ id: "a-cheap-late", rent_usd: 900, available_from: "2027-03-01" }),
  plan({ id: "a-now", rent_usd: 1400 }),
]);
const b = building("b", [plan({ id: "b-late", available_from: "2027-05-01" })]);

describe("itemsFor", () => {
  it("keeps the order of ids and skips unknown ones", () => {
    expect(
      itemsFor(["b", "zzz", "a"], [a, b], TODAY, null).map((i) => i.building.id),
    ).toEqual(["b", "a"]);
  });

  it("shows the cheapest plan overall when there's no move-in date", () => {
    const [item] = itemsFor(["a"], [a, b], TODAY, null);
    expect(item.plan.id).toBe("a-cheap-late");
    expect(item.readyByMoveIn).toBe(true);
  });

  it("prefers plans ready by the move-in date", () => {
    const [item] = itemsFor(["a"], [a, b], TODAY, null, "2026-12-01");
    expect(item.plan.id).toBe("a-now");
    expect(item.readyByMoveIn).toBe(true);
  });

  it("still shows a building with nothing ready, and says so", () => {
    const [item] = itemsFor(["b"], [a, b], TODAY, null, "2026-12-01");
    expect(item.plan.id).toBe("b-late");
    expect(item.readyByMoveIn).toBe(false);
  });
});
