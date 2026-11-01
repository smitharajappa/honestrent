import type { CostBreakdown } from "@/lib/cost";
import { formatUsd } from "@/lib/format";

/**
 * Rent, plus fees, minus deals, drawn as one bar so the gap between the ad and
 * the real cost is visible at a glance. Screen readers get the same numbers as text.
 */
export function CostBar({ cost }: { cost: CostBreakdown }) {
  const total = cost.advertisedRent + cost.monthlyFees;
  const pct = (n: number) => `${Math.max(0, Math.min(100, (n / total) * 100))}%`;
  const label =
    `Advertised rent ${formatUsd(cost.advertisedRent)}, plus fees ${formatUsd(cost.monthlyFees)}, ` +
    `minus deals ${formatUsd(cost.monthlyDealSavings)}, equals ${formatUsd(cost.realMonthlyCost)} a month.`;

  return (
    <div role="img" aria-label={label} className="mt-3">
      <div className="relative flex h-2.5 overflow-hidden rounded-full bg-surface-muted">
        <span
          className="h-full origin-left animate-bar-grow bg-border-strong/60"
          style={{ width: pct(cost.advertisedRent) }}
        />
        {cost.monthlyFees > 0 && (
          <span
            className="h-full origin-left animate-bar-grow bg-warning-text/70 [animation-delay:150ms]"
            style={{ width: pct(cost.monthlyFees) }}
          />
        )}
        {cost.monthlyDealSavings > 0 && (
          <span
            className="absolute inset-y-0 right-0 bg-[repeating-linear-gradient(135deg,var(--success-text)_0_3px,transparent_3px_6px)] opacity-80"
            style={{ width: pct(cost.monthlyDealSavings) }}
          />
        )}
      </div>
      <div
        aria-hidden="true"
        className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-muted tabular-nums"
      >
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-border-strong/60" />
          Rent {formatUsd(cost.advertisedRent)}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-warning-text/70" />+ Fees{" "}
          {formatUsd(cost.monthlyFees)}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-success-text" />− Deals{" "}
          {formatUsd(cost.monthlyDealSavings)}
        </span>
      </div>
    </div>
  );
}
