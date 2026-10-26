import { STALE_AFTER_DAYS, type RankedResult } from "@/lib/cost";
import { bedroomLabel, formatDate, formatUsd } from "@/lib/format";
import { daysBetween } from "@/lib/validation";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
import { AlertIcon, CheckIcon, ClockIcon, PlusCircleIcon, TagIcon } from "./ui/icons";

type Props = { result: RankedResult; rank: number; today: string };

export function ResultCard({ result, rank, today }: Props) {
  const { building, plan, cost, matchingPlanCount } = result;
  const difference = cost.realMonthlyCost - cost.advertisedRent;
  const daysSinceVerified = daysBetween(building.last_verified, today);
  const isStale = daysSinceVerified > STALE_AFTER_DAYS;
  const availableNow = plan.available_from <= today;

  return (
    <Card as="li" className="p-4 sm:p-5">
      <article aria-labelledby={`b-${building.id}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {rank === 1 ? (
              <Badge tone="brand" className="mb-2">
                Lowest real cost
              </Badge>
            ) : (
              <p className="mb-1 text-xs font-semibold text-text-muted">#{rank}</p>
            )}
            <h3 id={`b-${building.id}`} className="text-lg leading-snug font-semibold">
              {building.name}
            </h3>
            <p className="mt-0.5 text-sm text-text-muted">{building.address}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-3xl leading-none font-bold tracking-tight tabular-nums">
              {formatUsd(cost.realMonthlyCost)}
            </p>
            <p className="mt-1 text-xs font-medium text-text-muted">real cost / mo</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {difference > 0 && (
            <Badge tone="warning" icon={<PlusCircleIcon className="size-3.5" />}>
              {formatUsd(difference)}/mo more than advertised
            </Badge>
          )}
          {difference < 0 && (
            <Badge tone="success" icon={<TagIcon className="size-3.5" />}>
              {formatUsd(-difference)}/mo less than advertised
            </Badge>
          )}
          {difference === 0 && (
            <Badge tone="neutral" icon={<CheckIcon className="size-3.5" />}>
              Same as advertised
            </Badge>
          )}
          {matchingPlanCount > 1 && <Badge>{matchingPlanCount} floor plans fit</Badge>}
        </div>

        <dl className="mt-4 space-y-1.5 rounded-xl bg-surface-muted p-3.5 text-sm tabular-nums">
          <Row label="Advertised rent" value={formatUsd(cost.advertisedRent)} />
          <Row label="Required monthly fees" value={`+ ${formatUsd(cost.monthlyFees)}`} />
          <Row
            label={`Move-in deals ÷ ${plan.lease_months} months`}
            value={`− ${formatUsd(cost.monthlyDealSavings)}`}
          />
          <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
            <dt>Real monthly cost</dt>
            <dd>{formatUsd(cost.realMonthlyCost)}</dd>
          </div>
        </dl>

        <p className="mt-3 text-sm">
          <span className="font-medium">{plan.name}</span>
          <span className="text-text-muted">
            {" "}
            · {bedroomLabel(plan.bedrooms)} · {plan.lease_months}-month lease ·{" "}
            {availableNow
              ? "Available now"
              : `Available ${formatDate(plan.available_from)}`}
          </span>
        </p>

        <div className="mt-3 border-t border-border pt-3">
          {isStale ? (
            <Badge tone="warning" icon={<AlertIcon className="size-3.5" />}>
              Verified {formatDate(building.last_verified)}: price may have changed
            </Badge>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-text-muted">
              <ClockIcon className="size-3.5" />
              Last verified {formatDate(building.last_verified)}
            </p>
          )}
        </div>
      </article>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-text-muted">
      <dt>{label}</dt>
      <dd className="text-text">{value}</dd>
    </div>
  );
}
