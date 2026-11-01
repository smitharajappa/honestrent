import { describe, expect, it } from "vitest";
import { inTexas, parseCandidates } from "./geocode";

describe("parseCandidates", () => {
  it("keeps Texas results, drops the country and stops at 3", () => {
    const rows = [
      {
        lat: "32.98",
        lon: "-96.75",
        display_name: "800 W Campbell Rd, Richardson, Texas, United States",
      },
      { lat: "40.7", lon: "-74.0", display_name: "New York, United States" },
      { lat: "33.0", lon: "-96.7", display_name: "A" },
      { lat: "33.1", lon: "-96.8", display_name: "B" },
      { lat: "33.2", lon: "-96.9", display_name: "C" },
    ];
    const out = parseCandidates(rows);
    expect(out).toHaveLength(3);
    expect(out[0].name).toBe("800 W Campbell Rd, Richardson, Texas");
    expect(out.some((c) => c.latitude === 40.7)).toBe(false);
  });
  it("ignores anything that isn't a list", () => {
    expect(parseCandidates({ error: "x" })).toEqual([]);
    expect(parseCandidates(null)).toEqual([]);
  });
});

describe("inTexas", () => {
  it("rejects bad numbers and far-away points", () => {
    expect(inTexas(32.9, -96.7)).toBe(true);
    expect(inTexas(NaN, -96.7)).toBe(false);
    expect(inTexas(51.5, -0.1)).toBe(false);
  });
});
