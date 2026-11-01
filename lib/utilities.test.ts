import { describe, expect, it } from "vitest";
import type { Building } from "./types";
import { utilitiesFor } from "./utilities";

function building(o: Partial<Building>): Building {
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
    min_credit_score: null,
    accepts_no_ssn: true,
    accepts_guarantor: false,
    accepts_international_credit: false,
    floor_plans: [],
    building_fees: [],
    building_deals: [],
    ...o,
  };
}

const fromBuilding = {
  bedrooms: 1,
  avg_usd: 140,
  low_usd: 110,
  high_usd: 185,
  source: "building" as const,
  as_of: "2025-12-31",
};

describe("utilitiesFor", () => {
  it("treats included utilities as $0 and known", () => {
    expect(utilitiesFor(building({ utility_billing: "included" }), 1)).toMatchObject({
      avg: 0,
      source: "included",
      known: true,
    });
  });

  it("uses the building's own figures for the same bedroom count first", () => {
    const b = building({
      utility_billing: "allocated",
      building_utility_estimates: [fromBuilding],
      renter_bills: [
        { bedrooms: 1, report_count: 5, avg_usd: 200, low_usd: 150, high_usd: 260 },
      ],
    });
    expect(utilitiesFor(b, 1)).toMatchObject({
      avg: 140,
      low: 110,
      high: 185,
      source: "building",
      asOf: "2025-12-31",
    });
  });

  it("uses renter reports when the building hasn't given figures for that size", () => {
    const b = building({
      utility_billing: "allocated",
      building_utility_estimates: [fromBuilding],
      renter_bills: [
        { bedrooms: 2, report_count: 4, avg_usd: 210, low_usd: 170, high_usd: 260 },
      ],
    });
    expect(utilitiesFor(b, 2)).toMatchObject({
      avg: 210,
      source: "renters",
      reportCount: 4,
    });
  });

  it("falls back to the closest bedroom count from the building", () => {
    const b = building({
      utility_billing: "submetered",
      building_utility_estimates: [fromBuilding],
    });
    expect(utilitiesFor(b, 2)).toMatchObject({ avg: 140, source: "building" });
  });

  it("uses Swelt's estimate last", () => {
    const b = building({
      utility_billing: "direct",
      building_utility_estimates: [
        { ...fromBuilding, source: "estimate", avg_usd: 100, low_usd: 70, high_usd: 140 },
      ],
    });
    expect(utilitiesFor(b, 1)).toMatchObject({ avg: 100, source: "estimate" });
  });

  it("says when nothing is known yet, without adding to the total", () => {
    expect(utilitiesFor(building({}), 1)).toMatchObject({
      avg: 0,
      source: "unknown",
      known: false,
    });
    expect(utilitiesFor(building({ utility_billing: "direct" }), 1)).toMatchObject({
      source: "direct",
      known: false,
    });
  });
});
