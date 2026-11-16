import type { CostBreakdown } from "@/lib/cost";
import { formatUsd } from "@/lib/format";
import type { UtilityView } from "@/lib/utilities";
import { cn } from "./ui/cn";

/**
 * The price as an itemised receipt: advertised rent, plus required fees, plus utilities
 * billed by the building, minus deals. Charges the ad left out get the highlighter
 * (the one meaning of that yellow). Amounts are monospaced so they line up and can be
 * checked by eye. Screen readers get the same lines as a list.
 */
export function CostReceipt({
  cost,
  utilities,
  className,
}: {
  cost: CostBreakdown;
  utilities?: UtilityView;
  className?: string;
}) {
  const util = utilities?.known ? utilities.avg : 0;
  const total = cost.realMonthlyCost + util;
  const lines: { label: string; amount: string; hidden?: boolean; save?: boolean }[] = [
    { label: "Advertised rent", amount: formatUsd(cost.advertisedRent) },
  ];
  if (cost.monthlyFees > 0)
    lines.push({
      label: "Required fees",
      amount: `+${formatUsd(cost.monthlyFees)}`,
      hidden: true,
    });
  if (util > 0)
    lines.push({
      label: "Utilities, about",
      amount: `+${formatUsd(util)}`,
      hidden: true,
    });
  if (cost.monthlyDealSavings > 0)
    lines.push({
      label: "Deal, spread over lease",
      amount: `−${formatUsd(cost.monthlyDealSavings)}`,
      save: true,
    });

  return (
    <div className={cn("mt-3 text-sm", className)}>
      <ul aria-label="Monthly cost, line by line" className="space-y-1">
        {lines.map((l) => (
          <li key={l.label} className="flex items-baseline gap-2">
            <span className={l.hidden ? "marker" : "text-text-muted"}>{l.label}</span>
            <span aria-hidden="true" className="leader" />
            <span className={cn("figure", l.save && "text-success-text")}>
              {l.amount}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 flex items-baseline gap-2 border-t border-dashed border-rule pt-1.5 font-semibold">
        <span>{util > 0 ? "Estimated total" : "Real monthly cost"}</span>
        <span aria-hidden="true" className="leader" />
        <span className="figure">
          {util > 0 ? "~" : ""}
          {formatUsd(total)}
        </span>
      </p>
    </div>
  );
}
