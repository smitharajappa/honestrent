import { describe, expect, it } from "vitest";
import { isUuid, validateLead } from "./lead";

const BUILDING = "3f2b8c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f";
const PLAN = "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d";

const good = {
  buildingId: BUILDING,
  floorPlanId: PLAN,
  email: "  Renter@Example.com ",
  moveIn: "2026-12-01",
  budget: "1500",
  consent: "on",
  hr_trap: "",
};

describe("validateLead", () => {
  it("accepts a complete form and cleans the email", () => {
    expect(validateLead(good)).toEqual({
      ok: true,
      value: {
        buildingId: BUILDING,
        floorPlanId: PLAN,
        email: "renter@example.com",
        moveIn: "2026-12-01",
        budget: 1500,
      },
    });
  });

  it("flags bots that fill the hidden trap field", () => {
    expect(validateLead({ ...good, hr_trap: "spam" })).toEqual({
      ok: false,
      spam: true,
    });
  });

  it("requires a valid email", () => {
    for (const email of ["", "not-an-email", "a@b", `${"x".repeat(250)}@example.com`]) {
      const result = validateLead({ ...good, email });
      expect(result.ok === false && !result.spam && result.errors.email).toBeTruthy();
    }
  });

  it("requires consent", () => {
    const result = validateLead({ ...good, consent: undefined });
    expect(result.ok === false && !result.spam && result.errors.consent).toBeTruthy();
  });

  it("rejects a tampered building id", () => {
    const result = validateLead({ ...good, buildingId: "1; drop table leads" });
    expect(result.ok === false && !result.spam && result.errors.form).toBeTruthy();
  });

  it("drops bad optional fields instead of blocking the renter", () => {
    const result = validateLead({
      ...good,
      floorPlanId: "nope",
      moveIn: "2026-02-30",
      budget: "99999",
    });
    expect(result.ok && result.value).toMatchObject({
      floorPlanId: null,
      moveIn: null,
      budget: null,
    });
  });

  it("ignores non-text values", () => {
    const result = validateLead({ ...good, email: 42 });
    expect(result.ok).toBe(false);
  });
});

describe("isUuid", () => {
  it("recognizes ids", () => {
    expect(isUuid(BUILDING)).toBe(true);
    expect(isUuid("abc")).toBe(false);
  });
});
