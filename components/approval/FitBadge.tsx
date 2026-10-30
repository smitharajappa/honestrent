"use client";

import Link from "next/link";
import {
  approvalFit,
  describeAnswers,
  FIT_LABELS,
  isCompleteProfile,
  type ApprovalCriteria,
  type Fit,
  type FitLevel,
} from "@/lib/approval";
import { Badge, type Tone } from "../ui/Badge";
import { CheckIcon, UsersIcon, XCircleIcon } from "../ui/icons";
import { useApproval } from "./ApprovalContext";

const STYLE: Record<FitLevel, { tone: Tone; icon: React.ReactNode }> = {
  good: { tone: "success", icon: <CheckIcon className="size-3.5" /> },
  guarantor: { tone: "warning", icon: <UsersIcon className="size-3.5" /> },
  unlikely: { tone: "danger", icon: <XCircleIcon className="size-3.5" /> },
};

/** Approval fit for one building. Shows nothing (or a hint) until all 3 answers are given. */
export function FitBadge({
  criteria,
  rentUsd,
  emptyHint,
}: {
  criteria: ApprovalCriteria;
  rentUsd: number;
  /** Shown instead of the badge when the renter hasn't answered yet. */
  emptyHint?: string;
}) {
  const { answers } = useApproval();
  if (!isCompleteProfile(answers)) {
    return emptyHint ? <p className="mt-3 text-sm text-text-muted">{emptyHint}</p> : null;
  }

  return <FitDisplay fit={approvalFit(answers, criteria, rentUsd)} />;
}

/** Shows a fit that was already worked out (badge plus one-line reason). */
export function FitDisplay({ fit, compact = false }: { fit: Fit; compact?: boolean }) {
  const { tone, icon } = STYLE[fit.level];
  return (
    <div className="mt-3">
      <Badge tone={tone} icon={icon}>
        {FIT_LABELS[fit.level]}
      </Badge>
      <p
        className={
          compact ? "mt-1 text-xs text-text-muted" : "mt-1.5 text-sm text-text-muted"
        }
      >
        {fit.reason}
      </p>
    </div>
  );
}

type Item = { criteria: ApprovalCriteria; rentUsd: number };

/** "3 good fits · 2 possible · 1 unlikely" above the results list. */
export function FitSummary({ items }: { items: Item[] }) {
  const { answers } = useApproval();
  if (!isCompleteProfile(answers)) return null;

  const counts = { good: 0, guarantor: 0, unlikely: 0 };
  for (const { criteria, rentUsd } of items)
    counts[approvalFit(answers, criteria, rentUsd).level]++;

  const parts = [
    counts.good && `${counts.good} good ${counts.good === 1 ? "fit" : "fits"}`,
    counts.guarantor && `${counts.guarantor} possible with guarantor`,
    counts.unlikely && `${counts.unlikely} unlikely`,
  ].filter(Boolean);

  return (
    <div className="mt-3 text-sm">
      <p className="font-semibold">{parts.join(" · ")}</p>
      <AnswersNote />
    </div>
  );
}

/**
 * Shows what the fit is based on, so renters don't have to remember
 * (Nielsen #6), with a one-tap way to change it.
 */
export function AnswersNote({ editHref = "#search" }: { editHref?: string }) {
  const { answers } = useApproval();
  if (!isCompleteProfile(answers)) return null;
  return (
    <p className="mt-1 text-text-muted">
      Based on: {describeAnswers(answers)} ·{" "}
      <Link
        href={editHref}
        className="font-semibold text-brand-text underline underline-offset-2"
      >
        Change
      </Link>
      <span className="block text-xs">
        Estimates only. Each building makes the final decision.
      </span>
    </p>
  );
}
