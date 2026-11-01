import { describe, expect, it } from "vitest";
import { daysBetween, todayInTexas, validateArea, validateSearch } from "./validation";

const TODAY = "2026-10-25";

describe("validateSearch", () => {
  it("accepts a normal budget and future date", () => {
    expect(validateSearch("1500", "2026-12-01", TODAY)).toEqual({
      ok: true,
      value: { budget: 1500, moveIn: "2026-12-01" },
    });
  });

  it("accepts budgets typed with $ and commas", () => {
    const result = validateSearch("$1,500", "2026-12-01", TODAY);
    expect(result.ok && result.value.budget).toBe(1500);
  });

  it("rejects a missing budget", () => {
    const result = validateSearch("", "2026-12-01", TODAY);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.errors.budget).toBeTruthy();
  });

  it("rejects non-number and out-of-range budgets", () => {
    for (const bad of ["abc", "100", "50000", "-5"]) {
      expect(validateSearch(bad, "2026-12-01", TODAY).ok).toBe(false);
    }
  });

  it("rejects past, invalid and far-future dates", () => {
    for (const bad of ["2026-10-24", "2026-02-30", "not-a-date", "", "2028-01-01"]) {
      const result = validateSearch("1500", bad, TODAY);
      expect(result.ok).toBe(false);
      expect(!result.ok && result.errors.moveIn).toBeTruthy();
    }
  });

  it("accepts today as a move-in date", () => {
    expect(validateSearch("1500", TODAY, TODAY).ok).toBe(true);
  });
});

describe("todayInTexas", () => {
  it("uses Central time, not UTC", () => {
    // 2026-10-26 03:00 UTC is still 2026-10-25 in Texas
    expect(todayInTexas(new Date("2026-10-26T03:00:00Z"))).toBe("2026-10-25");
  });
});

describe("daysBetween", () => {
  it("counts whole days, including across months", () => {
    expect(daysBetween("2026-10-10", "2026-10-25")).toBe(15);
    expect(daysBetween("2026-10-31", "2026-11-01")).toBe(1);
    expect(daysBetween("2026-10-25", "2026-10-25")).toBe(0);
  });
});

describe("validateArea", () => {
  it("allows cities and ZIPs", () => {
    expect(validateArea("  Fort   Worth ")).toEqual({ ok: true, value: "Fort Worth" });
    expect(validateArea("75080")).toEqual({ ok: true, value: "75080" });
  });

  it("asks for a place when the box is left empty", () => {
    expect(validateArea("").ok).toBe(false);
    expect(validateArea("   ").ok).toBe(false);
  });

  it("treats 'Anywhere in DFW' and an older link with no area as everywhere", () => {
    expect(validateArea("Anywhere in DFW")).toEqual({ ok: true, value: null });
    expect(validateArea("anywhere")).toEqual({ ok: true, value: null });
    expect(validateArea(undefined)).toEqual({ ok: true, value: null });
  });

  it("accepts a chosen place to measure from", () => {
    expect(validateArea("Near me")).toEqual({ ok: true, value: null });
    expect(validateArea("Near ZIP 75080")).toEqual({ ok: true, value: null });
  });

  it("rejects odd characters and very long text", () => {
    expect(validateArea("<script>").ok).toBe(false);
    expect(validateArea("x".repeat(61)).ok).toBe(false);
  });
});
