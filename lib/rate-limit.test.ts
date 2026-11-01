import { describe, expect, it } from "vitest";
import { allow } from "./rate-limit";

describe("allow", () => {
  it("lets a visitor through up to the limit, then waits for the window to pass", () => {
    const t = 1_000_000;
    expect(allow("a", 2, 1000, t)).toBe(true);
    expect(allow("a", 2, 1000, t + 10)).toBe(true);
    expect(allow("a", 2, 1000, t + 20)).toBe(false);
    expect(allow("a", 2, 1000, t + 1500)).toBe(true);
  });
  it("counts each visitor separately", () => {
    const t = 2_000_000;
    expect(allow("x", 1, 1000, t)).toBe(true);
    expect(allow("y", 1, 1000, t)).toBe(true);
  });
});
