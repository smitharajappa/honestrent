import { describe, expect, it } from "vitest";
import { compareWithCity, type BuildingSafety } from "./safety";

function safety(people: number, property: number, avg: number): BuildingSafety {
  return {
    period_start: "2025-10-31",
    period_end: "2026-10-30",
    radius_miles: 0.5,
    against_people: people,
    property,
    other: 50,
    city_average_people_property: avg,
    city_name: "Dallas",
    source_name: "x",
    source_url: "https://example.com",
    license: "ODC-BY",
  };
}

describe("compareWithCity", () => {
  it("says about the same near the average", () => {
    expect(compareWithCity(safety(12, 147, 150.5)).level).toBe("about_same");
  });
  it("says fewer when well below, more when well above", () => {
    expect(compareWithCity(safety(5, 50, 150)).level).toBe("fewer");
    expect(compareWithCity(safety(40, 200, 150)).level).toBe("more");
  });
  it("ignores 'other' incidents in the comparison", () => {
    expect(compareWithCity(safety(0, 100, 100)).ratio).toBe(1);
  });
});
