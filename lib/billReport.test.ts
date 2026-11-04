import { describe, expect, it } from "vitest";
import { parseAmount, recentMonths, validateBillReport } from "./billReport";

const TODAY = "2026-10-30";
const BUILDING = "3f2b8c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f";
const good = {
  buildingId: BUILDING,
  billMonth: "2026-08-01",
  bedrooms: "1",
  water: "68.43",
  sewer: "$65.45",
  trash: "82.12",
  drainage: "3.65",
  admin: "11.43",
  other: "",
  consent: "on",
  hr_trap: "",
};

describe("parseAmount", () => {
  it("reads dollar amounts", () => {
    expect(parseAmount("$1,234.50")).toBe(1234.5);
    expect(parseAmount("")).toBe(0);
    expect(parseAmount("12.345")).toBeNaN();
    expect(parseAmount("abc")).toBeNaN();
  });
});

describe("recentMonths", () => {
  it("lists the last 12 months, newest first, across years", () => {
    const months = recentMonths(TODAY);
    expect(months).toHaveLength(12);
    expect(months[0]).toBe("2026-10-01");
    expect(months[11]).toBe("2025-11-01");
  });
});

describe("validateBillReport", () => {
  it("accepts a real-looking bill", () => {
    const result = validateBillReport(good, TODAY);
    expect(result.ok && result.value).toMatchObject({
      buildingId: BUILDING,
      billMonth: "2026-08-01",
      bedrooms: 1,
      amounts: {
        water: 68.43,
        sewer: 65.45,
        trash: 82.12,
        drainage: 3.65,
        admin: 11.43,
        other: 0,
      },
    });
  });

  it("silently drops spam bots", () => {
    expect(validateBillReport({ ...good, hr_trap: "x" }, TODAY)).toEqual({
      ok: false,
      spam: true,
    });
  });

  it("rejects old or future months, bad bedrooms and missing consent", () => {
    const result = validateBillReport(
      { ...good, billMonth: "2025-01-01", bedrooms: "9", consent: undefined },
      TODAY,
    );
    expect(
      result.ok === false && !result.spam && Object.keys(result.errors).sort(),
    ).toEqual(["bedrooms", "consent", "month"]);
  });

  it("rejects silly or empty amounts", () => {
    for (const water of ["5000", "-3", "lots"]) {
      const r = validateBillReport({ ...good, water }, TODAY);
      expect(r.ok === false && !r.spam && r.errors.amounts).toBeTruthy();
    }
    const empty = validateBillReport(
      { ...good, water: "", sewer: "", trash: "", drainage: "", admin: "" },
      TODAY,
    );
    expect(empty.ok === false && !empty.spam && empty.errors.amounts).toBeTruthy();
  });
});
