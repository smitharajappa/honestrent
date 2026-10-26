import type { RankedResult } from "@/lib/cost";
import { bedroomLabel, formatDate, formatUsd } from "@/lib/format";

export function ResultCard({ result, rank }: { result: RankedResult; rank: number }) {
  const { building, plan, cost, matchingPlanCount } = result;
  const difference = cost.realMonthlyCost - cost.advertisedRent;

  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-500">#{rank}</p>
          <h2 className="truncate text-lg font-semibold">{building.name}</h2>
          <p className="text-sm text-neutral-600">{building.address}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold text-emerald-800">
            {formatUsd(cost.realMonthlyCost)}
          </p>
          <p className="text-xs text-neutral-600">real / month</p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-neutral-50 p-3 text-sm">
        <div>
          <dt className="text-xs text-neutral-500">Advertised</dt>
          <dd className="font-medium">{formatUsd(cost.advertisedRent)}</dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Fees</dt>
          <dd className="font-medium">+{formatUsd(cost.monthlyFees)}</dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Deals</dt>
          <dd className="font-medium">−{formatUsd(cost.monthlyDealSavings)}</dd>
        </div>
      </dl>

      <p className="mt-2 text-sm text-neutral-700">
        {difference === 0
          ? "Same as advertised rent."
          : difference > 0
            ? `${formatUsd(difference)} more than advertised.`
            : `${formatUsd(-difference)} less than advertised.`}
      </p>

      <p className="mt-2 text-sm text-neutral-700">
        {plan.name} · {bedroomLabel(plan.bedrooms)} · {plan.lease_months}-month lease
        {matchingPlanCount > 1 && ` · ${matchingPlanCount} plans fit`}
      </p>

      <p className="mt-2 text-xs text-neutral-500">
        Last verified {formatDate(building.last_verified)}
      </p>
    </li>
  );
}
