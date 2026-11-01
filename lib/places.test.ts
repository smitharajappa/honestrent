import { describe, expect, it } from "vitest";
import { nearestByKind, walkMinutes, type Place } from "./places";

const ORIGIN = { latitude: 33.0, longitude: -96.75 };

function place(id: string, kind: Place["kind"], dLat: number): Place {
  return { id, kind, name: id, latitude: 33.0 + dLat, longitude: -96.75 };
}

describe("nearestByKind", () => {
  it("sorts each kind nearest first and keeps only the closest few", () => {
    const places = [
      place("far", "grocery", 0.02),
      place("near", "grocery", 0.002),
      place("mid", "grocery", 0.01),
      place("farther", "grocery", 0.015),
    ];
    const result = nearestByKind(ORIGIN, places, { perKind: 3 });
    expect(result.grocery.map((p) => p.id)).toEqual(["near", "mid", "farther"]);
  });

  it("drops places beyond the radius and keeps kinds apart", () => {
    const places = [place("gym-1", "gym", 0.005), place("stop-far", "bus_stop", 0.1)];
    const result = nearestByKind(ORIGIN, places, { maxMiles: 2 });
    expect(result.gym).toHaveLength(1);
    expect(result.bus_stop).toHaveLength(0);
    expect(result.grocery).toHaveLength(0);
  });
});

describe("walkMinutes", () => {
  it("is at least 1 and rounds up at 3 mph", () => {
    expect(walkMinutes(0.01)).toBe(1);
    expect(walkMinutes(0.5)).toBe(10);
    expect(walkMinutes(0.51)).toBe(11);
  });
});
