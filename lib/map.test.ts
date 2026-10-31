import { describe, expect, it } from "vitest";
import { CAMPUS, milesBetween } from "./map";

describe("milesBetween", () => {
  it("is zero for the same point", () => {
    expect(milesBetween(CAMPUS, CAMPUS)).toBe(0);
  });

  it("measures a short straight-line distance", () => {
    // About 1 degree of latitude is 69 miles.
    const d = milesBetween(
      { latitude: 33, longitude: -96.7 },
      { latitude: 34, longitude: -96.7 },
    );
    expect(d).toBeGreaterThan(68);
    expect(d).toBeLessThan(70);
  });
});
