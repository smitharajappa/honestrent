import Link from "next/link";
import { pickCriteria } from "@/lib/approval";
import type { RankedResult } from "@/lib/cost";
import { bedroomLabel, formatDate, formatUsd } from "@/lib/format";
import { FitBadge } from "./approval/FitBadge";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
import { CheckIcon, ChevronDownIcon, PlusCircleIcon, TagIcon } from "./ui/icons";
import { VerifiedNote } from "./VerifiedNote";

type Props = { result: RankedResult; rank: number; today: string; detailHref: string };

/**
 * Shows only what a renter needs to compare at a glance (Nielsen #8): real price,
 * how it differs from the ad, approval fit and the plan. The full breakdown is
 * one tap away.
 */
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
              <Badge tone="success" className="mb-2">
                Lowest real cost
              </Badge>
            ) : (
              <p className="mb-1 text-xs font-semibold text-text-muted">#{rank}</p>
            )}
            <h3 id={`b-${building.id}`} className="text-lg leading-snug font-bold">
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
            <p className="mt-0.5 text-xs text-text-muted tabular-nums">
              Advertised {formatUsd(cost.advertisedRent)}
            </p>
          </div>
        </div>

        <div className="mt-3">
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
            <Badge icon={<CheckIcon className="size-3.5" />}>Same as advertised</Badge>
          )}
        </div>

        <FitBadge criteria={pickCriteria(building)} rentUsd={plan.rent_usd} />

        <p className="mt-3 text-sm">
          <span className="font-medium">{plan.name}</span>
          <span className="text-text-muted">
            {" "}
            · {bedroomLabel(plan.bedrooms)} · {plan.lease_months}-mo lease ·{" "}
            {availableNow ? "Available now" : `From ${formatDate(plan.available_from)}`}
            {matchingPlanCount > 1 && ` · ${matchingPlanCount} plans fit`}
          </span>
        </p>

        {/* Sits above the card-wide link so it can be opened on its own. */}
        <details className="group relative z-10 mt-2">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-lg text-sm font-semibold text-brand-text [&::-webkit-details-marker]:hidden">
            See cost breakdown
            <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <dl className="mt-1 space-y-1.5 rounded-xl bg-surface-muted p-3.5 text-sm tabular-nums">
            <Row label="Advertised rent" value={formatUsd(cost.advertisedRent)} />
            <Row
              label="Required monthly fees"
              value={`+ ${formatUsd(cost.monthlyFees)}`}
            />
            <Row
              label={`Move-in deals ÷ ${plan.lease_months} months`}
              value={`− ${formatUsd(cost.monthlyDealSavings)}`}
            />
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
              <dt>Real monthly cost</dt>
              <dd>{formatUsd(cost.realMonthlyCost)}</dd>
            </div>
          </dl>
        </details>

        <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-3">
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
