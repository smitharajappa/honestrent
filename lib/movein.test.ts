import { describe, expect, it } from "vitest";
import { firstMonthRent, moveInCash } from "./movein";
import type { Building } from "./types";

function building(o: Partial<Building> = {}): Building {
  return {
    application_fee_usd: null,
    admin_fee_usd: null,
    security_deposit_usd: null,
    deposit_no_credit_usd: null,
    ...o,
  } as Building;
}

describe("firstMonthRent", () => {
  it("is the whole rent with no move-in date", () => {
    expect(firstMonthRent(1200, null)).toBe(1200);
  });
  it("prorates by the days left in the month, including move-in day", () => {
    // Nov has 30 days; moving in on the 16th leaves 15 days.
    expect(firstMonthRent(1200, "2026-11-16")).toBe(600);
    expect(firstMonthRent(1200, "2026-11-01")).toBe(1200);
  });
});

describe("moveInCash", () => {
  it("never calls the total complete while anything is unconfirmed", () => {
    const r = moveInCash(building({ application_fee_usd: 50 }), 1000, 100, null);
    expect(r.complete).toBe(false);
    expect(r.knownTotal).toBe(1150);
    expect(r.missing).toEqual(["Administrative fee", "Security deposit"]);
  });
  it("totals everything once confirmed, with the no-credit deposit difference", () => {
    const r = moveInCash(
      building({
        application_fee_usd: 50,
        admin_fee_usd: 150,
        security_deposit_usd: 300,
        deposit_no_credit_usd: 600,
      }),
      1000,
      100,
      null,
    );
    expect(r.complete).toBe(true);
    expect(r.knownTotal).toBe(1600);
    expect(r.noCreditExtra).toBe(300);
  });
});
