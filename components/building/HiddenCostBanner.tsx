"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CostBreakdown } from "@/lib/cost";
import { formatUsd } from "@/lib/format";
import type { UtilityView } from "@/lib/utilities";
import { CountUp } from "../motion/CountUp";
import { Card } from "../ui/Card";
import { PlusCircleIcon, TagIcon } from "../ui/icons";

/**
 * The reason Honest Rent exists, at the top of every building page: the ad price, what gets
 * added, and the total, which counts up from the ad price. Every part has words and an icon,
 * never color alone.
 */
export function HiddenCostBanner({
  cost,
  utilities,
  total,
  planName,
}: {
  cost: CostBreakdown;
  utilities: UtilityView | null;
  total: number;
  planName: string;
}) {
  const reduce = useReducedMotion();
  const utilitiesKnown = utilities?.known && utilities.avg > 0;
  const util = utilitiesKnown ? utilities!.avg : 0;
  const gap = total - cost.advertisedRent;
  const whole = cost.advertisedRent + cost.monthlyFees + util;
  const pct = (n: number) => `${Math.max(0, (n / whole) * 100)}%`;
  const grow = (delay: number) => ({
    initial: reduce ? false : { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] as const },
  });

  return (
    <Card
      as="section"
      aria-label="What the ad does not say"
      className="relative mt-6 overflow-hidden p-5 sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-14 -right-14 size-44 rounded-full blur-3xl"
        style={{ background: "var(--glow)" }}
      />
      <p className="eyebrow relative">What the ad doesn&apos;t say</p>
      <div className="relative mt-2 flex flex-wrap items-end gap-x-4 gap-y-1 tabular-nums">
        <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          <CountUp
            from={cost.advertisedRent}
            to={total}
            prefix={utilitiesKnown ? "~" : ""}
          />
          <span className="text-base font-medium text-text-muted">/mo</span>
        </p>
        <p className="pb-1 text-sm text-text-muted">
          for {planName} · ad says{" "}
          <span className="font-semibold text-text line-through decoration-text-muted">
            {formatUsd(cost.advertisedRent)}
          </span>
        </p>
      </div>

      <div
        role="img"
        aria-label={`Rent ${formatUsd(cost.advertisedRent)}, fees ${formatUsd(cost.monthlyFees)}${util > 0 ? `, utilities about ${formatUsd(util)}` : ""}, deals take off ${formatUsd(cost.monthlyDealSavings)}.`}
        className="relative mt-4 flex h-3 overflow-hidden rounded-full bg-surface-muted"
      >
        <motion.span
          {...grow(0)}
          className="h-full origin-left bg-brand/55"
          style={{ width: pct(cost.advertisedRent) }}
        />
        {cost.monthlyFees > 0 && (
          <motion.span
            {...grow(0.25)}
            className="h-full origin-left bg-warning-text/70"
            style={{ width: pct(cost.monthlyFees) }}
          />
        )}
        {util > 0 && (
          <motion.span
            {...grow(0.45)}
            className="h-full origin-left bg-warning-text/40"
            style={{ width: pct(util) }}
          />
        )}
      </div>

      <ul className="relative mt-4 flex flex-wrap gap-2 text-sm">
        {cost.monthlyFees > 0 && (
          <li className="inline-flex animate-chip-pop items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 font-medium text-warning-text [animation-delay:300ms]">
            <PlusCircleIcon className="size-4" />
            {formatUsd(cost.monthlyFees)} required fees
          </li>
        )}
        {utilitiesKnown ? (
          <li className="inline-flex animate-chip-pop items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 font-medium text-warning-text [animation-delay:400ms]">
            <PlusCircleIcon className="size-4" />~{formatUsd(util)} utilities billed by
            the building
          </li>
        ) : (
          <li className="inline-flex animate-chip-pop items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 font-medium text-text-muted [animation-delay:400ms]">
            Utilities not confirmed yet
          </li>
        )}
        {cost.monthlyDealSavings > 0 && (
          <li className="inline-flex animate-chip-pop items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 font-medium text-success-text [animation-delay:500ms]">
            <TagIcon className="size-4" />
            {formatUsd(cost.monthlyDealSavings)} off from deals
          </li>
        )}
      </ul>
      {gap !== 0 && (
        <p className="relative mt-3 text-sm text-text-muted">
          That is{" "}
          <strong className="font-semibold text-text">{formatUsd(Math.abs(gap))}</strong>{" "}
          a month {gap > 0 ? "more" : "less"} than the ad price.
        </p>
      )}
    </Card>
  );
}
