import Link from "next/link";
import { pickCriteria } from "@/lib/approval";
import type { RankedResult } from "@/lib/cost";
import { bedroomLabel, formatDate, formatUsd } from "@/lib/format";
import { FitBadge } from "./approval/FitBadge";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
import { CheckIcon, PlusCircleIcon, TagIcon } from "./ui/icons";
import { VerifiedNote } from "./VerifiedNote";

type Props = { result: RankedResult; rank: number; today: string; detailHref: string };

export function ResultCard({ result, rank, today, detailHref }: Props) {
  const { building, plan, cost, matchingPlanCount } = result;
  const difference = cost.realMonthlyCost - cost.advertisedRent;
  const availableNow = plan.available_from <= today;

  return (
    <Card
      as="li"
      className="relative p-4 transition-colors duration-150 hover:border-border-strong sm:p-5"
    >
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
              {/* The ::after layer makes the whole card tappable. */}
              <Link
                href={detailHref}
                className="rounded-sm after:absolute after:inset-0 after:rounded-2xl after:content-['']"
              >
                {building.name}
              </Link>
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

        <FitBadge criteria={pickCriteria(building)} rentUsd={plan.rent_usd} />

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

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <VerifiedNote lastVerified={building.last_verified} today={today} />
          <span
            aria-hidden="true"
            className="shrink-0 text-sm font-semibold text-brand-text"
          >
            Details →
          </span>
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
