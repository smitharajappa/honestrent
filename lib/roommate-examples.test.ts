import { describe, expect, it } from "vitest";
import { exampleMatches } from "./roommate-examples";

describe("example matches", () => {
  it("show a high, a middle and a no-match score", () => {
    expect(exampleMatches().map((m) => m.score)).toEqual([90, 50, 0]);
  });
  it("explain the high match with the shared community", () => {
    expect(exampleMatches()[0].reasons.join(" ")).toContain("Camden Legacy Park");
  });
});
