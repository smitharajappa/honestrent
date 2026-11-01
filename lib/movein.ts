// Move-in cash: what a renter pays before getting the keys.
// Only counts what the leasing office has confirmed. Anything unknown is listed
// as "ask", never guessed, so the total is never presented as complete when it isn't.

import type { Building } from "./types";

export type MoveInLine = {
  label: string;
  /** Null when the leasing office hasn't confirmed it yet. */
  usd: number | null;
};

export type MoveInCash = {
  lines: MoveInLine[];
  /** Sum of the lines we know. */
  knownTotal: number;
  /** True only when every line is confirmed. */
  complete: boolean;
  /** Extra deposit for a renter with no US credit (0 when the same or unknown). */
  noCreditExtra: number;
  /** Names of the lines still to ask about. */
  missing: string[];
};

/** Rent for the part of the move-in month the renter lives there (whole rent if no date). */
export function firstMonthRent(rentUsd: number, moveIn: string | null): number {
  if (!moveIn) return rentUsd;
  const [y, m, d] = moveIn.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const days = daysInMonth - d + 1;
  return Math.round((rentUsd * days) / daysInMonth);
}

export function moveInCash(
  building: Building,
  rentUsd: number,
  monthlyFeesUsd: number,
  moveIn: string | null,
): MoveInCash {
  const lines: MoveInLine[] = [
    {
      label: moveIn ? "Rent and fees until month end" : "First month's rent and fees",
      usd: firstMonthRent(rentUsd + monthlyFeesUsd, moveIn),
    },
    { label: "Application fee", usd: building.application_fee_usd },
    { label: "Administrative fee", usd: building.admin_fee_usd },
    { label: "Security deposit", usd: building.security_deposit_usd },
  ];
  const knownTotal = lines.reduce((sum, l) => sum + (l.usd ?? 0), 0);
  const missing = lines.filter((l) => l.usd === null).map((l) => l.label);
  const noCreditExtra =
    building.deposit_no_credit_usd !== null && building.security_deposit_usd !== null
      ? Math.max(0, building.deposit_no_credit_usd - building.security_deposit_usd)
      : 0;
  return { lines, knownTotal, complete: missing.length === 0, noCreditExtra, missing };
}
