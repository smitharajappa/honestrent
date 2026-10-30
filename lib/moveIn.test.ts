import { describe, expect, it } from "vitest";
import { daysLeftInMonth, moveInCash } from "./moveIn";
import type { Building, FloorPlan } from "./types";

const plan: FloorPlan = {
  id: "p",
  name: "1 Bed",
  bedrooms: 1,
  bathrooms: 1,
  rent_usd: 1200,
  lease_months: 12,
  available_from: "2026-11-01",
};

function building(o: Partial<Building> = {}): Building {
  return {
    id: "b",
    name: "B",
    address: "1 St",
    city: "Plano",
    last_verified: "2026-10-20",
    min_income_multiple: 3,
    min_credit_score: 650,
    accepts_no_ssn: true,
    accepts_guarantor: true,
    accepts_international_credit: false,
    floor_plans: [plan],
    building_fees: [],
    building_deals: [],
    application_fee_usd: 50,
    admin_fee_usd: 150,
    deposit_usd: 300,
    deposit_no_credit_usd: 900,
    ...o,
  };
}

const goodCredit = { income: "80-100k", credit: "740-plus", idType: "ssn" } as const;
const noCredit = {
  income: "80-100k",
  credit: "no-us-credit",
  idType: "passport",
} as const;

describe("daysLeftInMonth", () => {
  it("counts the move-in day", () => {
    expect(daysLeftInMonth("2026-12-01")).toEqual({ days: 31, inMonth: 31 });
    expect(daysLeftInMonth("2026-11-16")).toEqual({ days: 15, inMonth: 30 });
    expect(daysLeftInMonth("2027-02-28")).toEqual({ days: 1, inMonth: 28 });
  });
});

describe("moveInCash", () => {
  it("adds application, admin, deposit and a full first month", () => {
    const cash = moveInCash({
      building: building(),
      plan,
      monthlyTotal: 1400,
      moveIn: "2026-12-01",
      profile: goodCredit,
      fitLevel: "good",
      adults: 1,
    });
    expect(cash.lines.map((l) => [l.label, l.amount])).toEqual([
      ["Application fee", 50],
      ["Admin fee", 150],
      ["Deposit", 300],
      ["First month", 1400],
    ]);
    expect(cash.total).toBe(1900);
    expect(cash.missing).toEqual([]);
  });

  it("uses the no-credit deposit and a guarantor fee when they apply", () => {
    const cash = moveInCash({
      building: building(),
      plan,
      monthlyTotal: 1400,
      moveIn: "2026-11-16",
      profile: noCredit,
      fitLevel: "guarantor",
      adults: 2,
    });
    expect(cash.lines.map((l) => [l.label, l.amount])).toEqual([
      ["Application fees (2 adults)", 100],
      ["Admin fee", 150],
      ["Deposit", 900],
      ["Guarantor company fee", 1200],
      ["First month (15 of 30 days)", 700],
    ]);
    expect(cash.total).toBe(3050);
  });

  it("lists what the building hasn't told us yet", () => {
    const cash = moveInCash({
      building: building({
        application_fee_usd: null,
        admin_fee_usd: null,
        deposit_usd: null,
      }),
      plan,
      monthlyTotal: 1000,
      moveIn: "2026-12-01",
      profile: null,
      fitLevel: null,
      adults: 1,
    });
    expect(cash.missing).toEqual(["application fee", "admin fee", "deposit"]);
    expect(cash.total).toBe(1000);
  });
});
