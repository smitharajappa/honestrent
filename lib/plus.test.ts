import { describe, expect, it } from "vitest";
import {
  activeUntil,
  currentPass,
  dollars,
  includesRoommates,
  isPassId,
  nextPassWindow,
  PASSES,
  perDayCents,
  roommatesUntil,
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

describe("what a pass includes", () => {
  const now = new Date("2026-11-10T12:00:00Z");
  const row = (pass: string, start: string, end: string) => ({
    pass,
    starts_at: start,
    ends_at: end,
  });
  it("includes roommates from Tour up, not Browse", () => {
    expect(includesRoommates("browse")).toBe(false);
    expect(includesRoommates("tour")).toBe(true);
    expect(includesRoommates("apply")).toBe(true);
    expect(includesRoommates("move_in")).toBe(true);
  });
  it("finds the running pass and the days left", () => {
    const c = currentPass(
      [row("tour", "2026-11-05T00:00:00Z", "2026-11-19T00:00:00Z")],
      now,
    );
    expect(c).toMatchObject({ id: "tour", name: "Tour", daysLeft: 9 });
  });
  it("ignores passes that ended or have not started, and unknown names", () => {
    expect(
      currentPass(
        [
          row("tour", "2026-10-01T00:00:00Z", "2026-10-15T00:00:00Z"),
          row("apply", "2026-12-01T00:00:00Z", "2026-12-22T00:00:00Z"),
          row("gold", "2026-11-01T00:00:00Z", "2026-12-01T00:00:00Z"),
        ],
        now,
      ),
    ).toBeNull();
  });
  it("picks the pass that ends last when two overlap", () => {
    const c = currentPass(
      [
        row("browse", "2026-11-08T00:00:00Z", "2026-11-15T00:00:00Z"),
        row("move_in", "2026-11-09T00:00:00Z", "2026-12-07T00:00:00Z"),
      ],
      now,
    );
    expect(c?.id).toBe("move_in");
  });
  it("gives roommate access only while a Tour or higher pass runs", () => {
    const browse = [row("browse", "2026-11-08T00:00:00Z", "2026-11-15T00:00:00Z")];
    expect(roommatesUntil(browse, now)).toBeNull();
    const both = [...browse, row("tour", "2026-11-09T00:00:00Z", "2026-11-23T00:00:00Z")];
    expect(roommatesUntil(both, now)?.toISOString()).toBe("2026-11-23T00:00:00.000Z");
  });
});
