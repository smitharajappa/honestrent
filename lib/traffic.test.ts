import { describe, expect, it } from "vitest";
import {
  departAtIso,
  hourLabel,
  nextTypicalWeekday,
  shortHourLabel,
  summarize,
} from "./traffic";

describe("nextTypicalWeekday", () => {
  it("returns a Tuesday at least a week ahead", () => {
    for (const from of ["2026-11-01", "2026-11-03", "2026-11-04", "2026-12-31"]) {
      const date = nextTypicalWeekday(new Date(`${from}T18:00:00Z`));
      expect(new Date(`${date}T12:00:00Z`).getUTCDay()).toBe(2);
      expect(new Date(`${date}T12:00:00Z`).getTime()).toBeGreaterThan(
        new Date(`${from}T18:00:00Z`).getTime() + 6 * 86_400_000,
      );
    }
  });
});

describe("departAtIso", () => {
  it("uses the right Texas offset in winter and summer", () => {
    expect(departAtIso("2026-11-17", 8)).toBe("2026-11-17T08:00:00-06:00");
    expect(departAtIso("2027-06-15", 17)).toBe("2027-06-15T17:00:00-05:00");
  });
});

describe("summarize", () => {
  it("finds the best and worst hours", () => {
    const s = summarize([
      { hour: 8, minutes: 31 },
      { hour: 10, minutes: 17 },
      { hour: 17, minutes: 38 },
    ]);
    expect(s?.best.hour).toBe(10);
    expect(s?.worst.hour).toBe(17);
    expect(s?.extraMinutes).toBe(21);
  });
  it("doesn't recommend leaving late at night", () => {
    const s = summarize([
      { hour: 8, minutes: 31 },
      { hour: 12, minutes: 18 },
      { hour: 17, minutes: 38 },
      { hour: 21, minutes: 15 },
    ]);
    expect(s?.best.hour).toBe(12);
  });
  it("needs at least two hours", () => {
    expect(summarize([{ hour: 8, minutes: 20 }])).toBeNull();
  });
});

describe("hourLabel", () => {
  it("writes 12-hour times", () => {
    expect(hourLabel(0)).toBe("12 AM");
    expect(hourLabel(8)).toBe("8 AM");
    expect(hourLabel(12)).toBe("12 PM");
    expect(hourLabel(17)).toBe("5 PM");
  });
});

describe("shortHourLabel", () => {
  it("is compact", () => {
    expect(shortHourLabel(6)).toBe("6a");
    expect(shortHourLabel(12)).toBe("12p");
    expect(shortHourLabel(21)).toBe("9p");
  });
});
