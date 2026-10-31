import Link from "next/link";
import type { ExploreItem } from "@/lib/explore";
import { bedroomLabel, formatDate, formatUsd } from "@/lib/format";
import { FitDisplay } from "./approval/FitBadge";
import { BuildingCover } from "./BuildingCover";
import { CostBar } from "./CostBar";
import { CompareToggle, SaveButton } from "./shortlist/ShortlistButtons";
import { RevealItem } from "./motion/Reveal";
import { Badge } from "./ui/Badge";
import { CheckIcon, PlusCircleIcon, TagIcon } from "./ui/icons";
import { VerifiedNote } from "./VerifiedNote";

type Props = {
  item: ExploreItem;
  rank?: number;
  today: string;
  /** Position in the list; later cards fade in a little after earlier ones. */
  index?: number;
  detailHref: string;
  people?: number;
};

/**
 * One building in the results grid. The whole card opens the building page;
 * the save and compare controls sit above that link.
 */
export function ResultCard({ item, rank, today, index, detailHref, people = 1 }: Props) {
  const { building, plan, cost, perPerson, matchingPlanCount, fit } = item;
  const difference = cost.realMonthlyCost - cost.advertisedRent;
  const availableNow = plan.available_from <= today;
  const shared = people > 1;

  return (
    <RevealItem
      index={index}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-[transform,box-shadow,border-color] duration-200 ease-out-soft hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised"
    >
      <div className="relative h-32 overflow-hidden">
        <BuildingCover
          id={building.id}
          name={building.name}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {rank === 1 && <Badge tone="success">Lowest real cost</Badge>}
          <Badge className="bg-surface text-text">{building.city}</Badge>
        </div>
        <SaveButton
          buildingId={building.id}
          buildingName={building.name}
          className="absolute top-2.5 right-2.5"
        />
      </div>

      <article
        aria-labelledby={`b-${building.id}`}
        className="flex flex-1 flex-col p-4 sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id={`b-${building.id}`} className="text-lg leading-snug font-bold">
              {/* The ::after layer makes the whole card tappable. */}
              <Link
                href={detailHref}
                className="rounded-sm after:absolute after:inset-0 after:content-['']"
              >
                {building.name}
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-sm text-text-muted">{building.address}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl leading-none font-bold tracking-tight tabular-nums sm:text-3xl">
              {formatUsd(shared ? perPerson : cost.realMonthlyCost)}
            </p>
            <p className="mt-1 text-xs font-medium text-text-muted">
              {shared ? "per person / mo" : "real cost / mo"}
            </p>
            {shared && (
              <p className="text-xs text-text-muted tabular-nums">
                {formatUsd(cost.realMonthlyCost)} total
              </p>
            )}
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

        <CostBar cost={cost} />

        {fit && <FitDisplay fit={fit} compact />}

        <p className="mt-3 text-sm">
          <span className="font-medium">{plan.name}</span>
          <span className="text-text-muted">
            {" "}
            · {bedroomLabel(plan.bedrooms)} · {plan.lease_months}-mo lease ·{" "}
            {availableNow ? "Available now" : `From ${formatDate(plan.available_from)}`}
            {matchingPlanCount > 1 && ` · ${matchingPlanCount} plans fit`}
          </span>
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2">
          <VerifiedNote lastVerified={building.last_verified} today={today} />
          <CompareToggle buildingId={building.id} />
        </div>
      </article>
    </RevealItem>
  );
}
