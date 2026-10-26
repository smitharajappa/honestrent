// Checks the "I'm interested" form on the server. Never trust the browser.
import { MAX_BUDGET, MIN_BUDGET, isRealDate } from "./validation";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_EMAIL_LENGTH = 254;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

export type LeadInput = {
  buildingId: string;
  floorPlanId: string | null;
  email: string;
  moveIn: string | null;
  budget: number | null;
};

export type LeadErrors = { email?: string; consent?: string; form?: string };

export type LeadValidation =
  | { ok: true; value: LeadInput }
  | { ok: false; spam: true }
  | { ok: false; spam: false; errors: LeadErrors };

type Raw = Record<string, unknown>;
const text = (raw: Raw, key: string) =>
  typeof raw[key] === "string" ? raw[key].trim() : "";

export function validateLead(raw: Raw): LeadValidation {
  // Hidden "trap" field: people never see it, simple bots fill it in.
  if (text(raw, "swelt_trap") !== "") return { ok: false, spam: true };

  const errors: LeadErrors = {};

  const buildingId = text(raw, "buildingId");
  if (!isUuid(buildingId))
    errors.form = "Something went wrong. Please reload and try again.";

  const email = text(raw, "email").toLowerCase();
  if (email === "") errors.email = "Enter your email so we can reach you.";
  else if (email.length > MAX_EMAIL_LENGTH || !EMAIL.test(email))
    errors.email = "Enter a valid email, like name@example.com.";

  if (raw.consent !== "on")
    errors.consent = "Please tick the box so we're allowed to email you.";

  if (Object.keys(errors).length > 0) return { ok: false, spam: false, errors };

  // Optional extras: silently dropped if they look wrong, never block the renter.
  const floorPlanId = text(raw, "floorPlanId");
  const moveIn = text(raw, "moveIn");
  const budget = Number(text(raw, "budget"));

  return {
    ok: true,
    value: {
      buildingId,
      floorPlanId: isUuid(floorPlanId) ? floorPlanId : null,
      email,
      moveIn: isRealDate(moveIn) ? moveIn : null,
      budget:
        Number.isInteger(budget) && budget >= MIN_BUDGET && budget <= MAX_BUDGET
          ? budget
          : null,
    },
  };
}

/** What the "I'm interested" form shows after the renter submits. */
export type InterestState =
  | { status: "idle" }
  | { status: "success" | "duplicate"; email: string }
  | {
      status: "invalid";
      errors: LeadErrors;
      values: { email: string; consent: boolean };
    };
