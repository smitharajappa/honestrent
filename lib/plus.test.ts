import { describe, expect, it } from "vitest";
import {
  activeUntil,
  dollars,
  isPassId,
  nextPassWindow,
  PASSES,
  perDayCents,
  savingVsWeekly,
} from "./plus";

describe("pass prices", () => {
  it("adds exactly $3 for each extra week", () => {
    const cents = PASSES.map((p) => p.cents);
    expect(cents).toEqual([599, 899, 1199, 1499]);
    expect(cents.slice(1).every((c, i) => c - cents[i] === 300)).toBe(true);
  });
  it("works out the daily price and the saving against repeating the 7-day pass", () => {
    expect(PASSES.map(perDayCents)).toEqual([86, 64, 57, 54]);
    expect(PASSES.map(savingVsWeekly)).toEqual([0, 25, 33, 37]);
    expect(dollars(1499)).toBe("$14.99");
  });
  it("knows which ids are passes", () => {
    expect(isPassId("tour")).toBe(true);
    expect(isPassId("gold")).toBe(false);
    expect(isPassId(undefined)).toBe(false);
  });
});

describe("pass windows", () => {
  const now = new Date("2026-11-10T12:00:00Z");
  it("finds the latest pass that is still running", () => {
    const until = activeUntil(
      [
        { ends_at: "2026-11-01T00:00:00Z" },
        { ends_at: "2026-11-20T00:00:00Z" },
        { ends_at: "2026-11-15T00:00:00Z" },
      ],
      now,
    );
    expect(until?.toISOString()).toBe("2026-11-20T00:00:00.000Z");
    expect(activeUntil([{ ends_at: "2026-11-01T00:00:00Z" }], now)).toBeNull();
  });
  it("starts a new pass when the running one ends", () => {
    const running = new Date("2026-11-20T00:00:00Z");
    expect(nextPassWindow(running, 14, now).start).toEqual(running);
    expect(nextPassWindow(running, 14, now).end.toISOString()).toBe(
      "2026-12-04T00:00:00.000Z",
    );
    expect(nextPassWindow(null, 7, now).start).toEqual(now);
  });
});
