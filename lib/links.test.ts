import { describe, expect, it } from "vitest";
import { searchHref } from "./links";

describe("searchHref", () => {
  it("keeps the search and adds the area only when there is one", () => {
    expect(searchHref("/", { budget: 1500, moveIn: "2026-12-01" })).toBe(
      "/?budget=1500&moveIn=2026-12-01",
    );
    expect(
      searchHref("/buildings/x", {
        budget: 1500,
        moveIn: "2026-12-01",
        area: "Fort Worth",
      }),
    ).toBe("/buildings/x?budget=1500&moveIn=2026-12-01&area=Fort%20Worth");
  });
});
