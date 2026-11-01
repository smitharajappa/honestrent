// Cash needed to move in: the second-biggest pain in the discovery report.

import type { ApprovalProfile, FitLevel } from "./approval";
import { CREDIT_BANDS } from "./approval";
import type { Building, FloorPlan } from "./types";

export type MoveInLine = { label: string; amount: number; note?: string };

export type MoveInCash = {
  lines: MoveInLine[];
  total: number;
  /** Facts the building hasn't given us yet. */
  missing: string[];
};

/** Days from the move-in date to the end of that month, counting move-in day. */
export function daysLeftInMonth(moveIn: string): { days: number; inMonth: number } {
  const [y, m, d] = moveIn.split("-").map(Number);
  const inMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { days: inMonth - d + 1, inMonth };
}

function hasThinCredit(profile: ApprovalProfile | null, building: Building): boolean {
  if (!profile) return false;
  const band = CREDIT_BANDS.find((c) => c.id === profile.credit)!;
  if (band.minScore === null) return true;
  return building.min_credit_score !== null && band.minScore < building.min_credit_score;
}

/**
 * Estimate of the cash due before the keys: application fees (one per adult),
 * admin fee, deposit (the no-credit deposit when that applies), a guarantor fee
 * when one is likely needed, and the first month prorated.
 */
export function moveInCash(opts: {
  building: Building;
  plan: FloorPlan;
  monthlyTotal: number; // estimated total per month for the whole apartment
  moveIn: string;
  profile: ApprovalProfile | null;
  fitLevel: FitLevel | null;
  adults: number;
}): MoveInCash {
  const { building: b, plan, monthlyTotal, moveIn, profile, fitLevel } = opts;
  const adults = Math.max(1, Math.floor(opts.adults));
  const lines: MoveInLine[] = [];
  const missing: string[] = [];

  if (b.application_fee_usd != null) {
    lines.push({
      label: adults > 1 ? `Application fees (${adults} adults)` : "Application fee",
      amount: b.application_fee_usd * adults,
    });
  } else missing.push("application fee");

  if (b.admin_fee_usd != null)
    lines.push({ label: "Admin fee", amount: b.admin_fee_usd });
  else missing.push("admin fee");

  const thin = hasThinCredit(profile, b);
  if (thin && b.deposit_no_credit_usd != null) {
    lines.push({
      label: "Deposit",
      amount: b.deposit_no_credit_usd,
      note: "Higher deposit for little or no US credit",
    });
  } else if (b.deposit_usd != null) {
    lines.push({ label: "Deposit", amount: b.deposit_usd });
  } else missing.push("deposit");

  if (fitLevel === "guarantor") {
    lines.push({
      label: "Guarantor company fee",
      amount: plan.rent_usd,
      note: "Usually about one month's rent",
    });
  }

  const { days, inMonth } = daysLeftInMonth(moveIn);
  lines.push({
    label: days === inMonth ? "First month" : `First month (${days} of ${inMonth} days)`,
    amount: Math.round((monthlyTotal * days) / inMonth),
  });

  return { lines, total: lines.reduce((sum, l) => sum + l.amount, 0), missing };
}
