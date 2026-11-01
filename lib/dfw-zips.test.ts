import { describe, expect, it } from "vitest";
import { DFW_ZIPS } from "./dfw-zips";

describe("DFW_ZIPS", () => {
  it("has the ZIPs our buildings are in, near the right place", () => {
    for (const zip of ["75080", "75081", "75082", "75024", "75074", "75214"]) {
      const [lat, lng] = DFW_ZIPS[zip];
      expect(lat).toBeGreaterThan(32.7);
      expect(lat).toBeLessThan(33.2);
      expect(lng).toBeGreaterThan(-97);
      expect(lng).toBeLessThan(-96.5);
    }
  });
  it("only has 5-digit Texas ZIPs", () => {
    expect(Object.keys(DFW_ZIPS).every((z) => /^7[56]\d{3}$/.test(z))).toBe(true);
    expect(Object.keys(DFW_ZIPS).length).toBeGreaterThan(200);
  });
});
