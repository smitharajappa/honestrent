"use client";

import { approvalFit, isCompleteProfile } from "@/lib/approval";
import { formatDate, formatUsd } from "@/lib/format";
import { moveInCash } from "@/lib/moveIn";
import type { Building, FloorPlan } from "@/lib/types";
import { useApproval } from "../approval/ApprovalContext";

type Props = {
  building: Building;
  plan: FloorPlan;
  monthlyTotal: number;
  moveIn: string;
};

/**
 * Cash due before the keys. Uses the renter's approval answers (in this tab
 * only) to pick the right deposit and add a guarantor fee when one is likely.
 */
export function MoveInCashCard({ building, plan, monthlyTotal, moveIn }: Props) {
  const { answers } = useApproval();
  const profile = isCompleteProfile(answers) ? answers : null;
  const fit = profile ? approvalFit(profile, building, plan.rent_usd) : null;
  const cash = moveInCash({
    building,
    plan,
    monthlyTotal,
    moveIn,
    profile,
    fitLevel: fit?.level ?? null,
    adults: 1,
  });

  return (
    <div>
      <dl className="space-y-1.5 text-sm tabular-nums">
        {cash.lines.map((line) => (
          <div key={line.label} className="flex justify-between gap-3">
            <dt className="text-text-muted">
              {line.label}
              {line.note && <span className="block text-xs">{line.note}</span>}
            </dt>
            <dd>{formatUsd(line.amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 border-t border-border pt-2 text-base font-bold">
          <dt>About {formatUsd(cash.total)} to move in</dt>
          <dd className="sr-only">{formatUsd(cash.total)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-text-muted">
        For {plan.name}, moving in {formatDate(moveIn)}.{" "}
        {profile
          ? "Uses your approval answers."
          : "Answer the approval questions to see the deposit that applies to you."}
        {cash.missing.length > 0 && ` Not included yet: ${cash.missing.join(", ")}.`}
      </p>
    </div>
  );
}
