import { describe, expect, it } from "vitest";
import { todayInTexas, validateSearch } from "./validation";

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
