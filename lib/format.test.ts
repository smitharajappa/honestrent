import { describe, expect, it } from "vitest";
import { bedroomLabel, formatDate, formatUsd } from "./format";

describe("format helpers", () => {
  it("formats dollars without cents", () => {
    expect(formatUsd(1405)).toBe("$1,405");
  });

  it("formats dates without shifting the day", () => {
    expect(formatDate("2026-10-20")).toBe("Oct 20, 2026");
  });

  it("labels studios", () => {
    expect(bedroomLabel(0)).toBe("Studio");
    expect(bedroomLabel(2)).toBe("2 bed");
  });
});
