import type { CostBreakdown } from "@/lib/cost";
import { formatUsd } from "@/lib/format";
import type { UtilityView } from "@/lib/utilities";
import { Card } from "../ui/Card";
import { PlusCircleIcon, TagIcon } from "../ui/icons";

/**
 * The reason Honest Rent exists, at the top of every building page: the ad price, what gets
 * added, and the total. Every part has words and an icon, never color alone.
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
  const utilitiesKnown = utilities?.known && utilities.avg > 0;
  const gap = total - cost.advertisedRent;
  return (
    <Card as="section" aria-label="What the ad does not say" className="mt-6 p-5">
      <p className="text-sm font-semibold text-text-muted">
        What the ad doesn&apos;t say
      </p>
      <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1 tabular-nums">
        <p className="text-sm text-text-muted">
          Ad price{" "}
          <span className="font-semibold text-text">
            {formatUsd(cost.advertisedRent)}
          </span>
          /mo
        </p>
        <p className="text-sm text-text-muted" aria-hidden="true">
          →
        </p>
        <p className="text-3xl font-extrabold tracking-tight">
          {utilitiesKnown ? "~" : ""}
          {formatUsd(total)}
          <span className="text-base font-medium text-text-muted">/mo</span>
        </p>
        <p className="text-sm text-text-muted">for {planName}</p>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        {cost.monthlyFees > 0 && (
          <li className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 font-medium text-warning-text">
            <PlusCircleIcon className="size-4" />
            {formatUsd(cost.monthlyFees)} required fees
          </li>
        )}
        {utilitiesKnown ? (
          <li className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 font-medium text-warning-text">
            <PlusCircleIcon className="size-4" />~{formatUsd(utilities!.avg)} utilities
            billed by the building
          </li>
        ) : (
          <li className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 font-medium text-text-muted">
            Utilities not confirmed yet
          </li>
        )}
        {cost.monthlyDealSavings > 0 && (
          <li className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 font-medium text-success-text">
            <TagIcon className="size-4" />
            {formatUsd(cost.monthlyDealSavings)} off from deals
          </li>
        )}
      </ul>
      {gap !== 0 && (
        <p className="mt-3 text-sm text-text-muted">
          That is {formatUsd(Math.abs(gap))} a month {gap > 0 ? "more" : "less"} than the
          ad price.
        </p>
      )}
    </Card>
  );
}
