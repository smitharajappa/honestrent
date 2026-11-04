import Link from "next/link";
import type { ExploreItem } from "@/lib/explore";
import { bedroomLabel, formatDate, formatUsd } from "@/lib/format";
import { isDealActive } from "@/lib/cost";
import { SOURCE_LABELS, type UtilityView } from "@/lib/utilities";
import { FitDisplay, FitUnconfirmed } from "./approval/FitBadge";
import { BuildingCover } from "./BuildingCover";
import { CostBar } from "./CostBar";
import { CompareToggle, SaveButton } from "./shortlist/ShortlistButtons";
import { RevealItem } from "./motion/Reveal";
import { Badge } from "./ui/Badge";
import { BusIcon, CheckIcon, MapPinIcon, PlusCircleIcon, TagIcon } from "./ui/icons";
import { VerifiedNote } from "./VerifiedNote";

type Props = {
  item: ExploreItem;
  rank?: number;
  today: string;
  /** Position in the list; later cards fade in a little after earlier ones. */
  index?: number;
  detailHref: string;
  people?: number;
  /** A nearby good fit to suggest when this building is "Unlikely". */
  alternative?: { name: string; href: string };
  /** "you" or "ZIP 75080": where distances are measured from. */
  fromLabel?: string | null;
};

/** One line saying what the utilities part of the price is and where it came from. */
export function UtilitiesLine({ utilities }: { utilities: UtilityView }) {
  if (utilities.source === "included") {
    return <>Utilities included in rent.</>;
  }
  if (!utilities.known) {
    return (
      <>
        {utilities.source === "direct"
          ? "You pay utility providers directly; not included in the total."
          : "Utilities billed by the building: not known yet."}
      </>
    );
  }
  return (
    <>
      Includes about {formatUsd(utilities.avg)} utilities (usually{" "}
      {formatUsd(utilities.low)}–{formatUsd(utilities.high)}) ·{" "}
      {SOURCE_LABELS[utilities.source]}
      {utilities.reportCount ? ` (${utilities.reportCount})` : ""}
    </>
  );
}

/** The biggest required monthly fees as small chips that pop in one after another. */
function FeeChips({
  fees,
}: {
  fees: { id: string; name: string; monthly_usd: number }[];
}) {
  const shown = [...fees]
    .filter((f) => f.monthly_usd > 0)
    .sort((a, b) => b.monthly_usd - a.monthly_usd)
    .slice(0, 3);
  if (shown.length === 0) return null;
  return (
    <ul
      aria-label="Biggest required monthly fees"
      className="mt-2 flex flex-wrap gap-1.5"
    >
      {shown.map((f, i) => (
        <li
          key={f.id}
          style={{ animationDelay: `${300 + i * 90}ms` }}
          className="animate-chip-pop rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning-text tabular-nums"
        >
          {f.name.length > 24 ? "Monthly fees" : f.name} +{formatUsd(f.monthly_usd)}
        </li>
      ))}
    </ul>
  );
}

/**
 * One building in the results grid. The whole card opens the building page;
 * the save and compare controls sit above that link.
 */
export function ResultCard({
  item,
  rank,
  today,
  index,
  detailHref,
  people = 1,
  alternative,
  fromLabel,
}: Props) {
  const {
    building,
    plan,
    cost,
    utilities,
    estimatedTotal,
    perPerson,
    matchingPlanCount,
    fit,
  } = item;
  const difference = estimatedTotal - cost.advertisedRent;
  const availableNow = plan.available_from <= today;
  const shared = people > 1;
  const isEstimate = utilities.known && utilities.avg > 0;
  const deal = building.building_deals.find((d) => isDealActive(d, today));

  return (
    <RevealItem
      index={index}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-[transform,box-shadow,border-color] duration-200 ease-out-soft hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised"
    >
      <div className="relative h-40 overflow-hidden">
        <BuildingCover
          id={building.id}
          name={building.name}
          className="transition-transform duration-500 ease-out-soft group-hover:scale-[1.05]"
        />
        {/* A soft fade at the bottom so the labels on the cover always read clearly. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-text/20 to-transparent"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {rank === 1 && (
            <Badge tone="success" icon={<CheckIcon className="size-3.5" />}>
              Lowest total
            </Badge>
          )}
          <Badge className="bg-surface text-text shadow-card">{building.city}</Badge>
        </div>
        <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2">
          {deal ? (
            <Badge
              tone="accent"
              icon={<TagIcon className="size-3.5" />}
              className="max-w-[68%] shadow-card"
            >
              <span className="truncate">Deal: {deal.description}</span>
            </Badge>
          ) : (
            <span />
          )}
          <span className="shrink-0 rounded-full bg-surface/85 px-2 py-0.5 text-[11px] font-medium text-text-muted">
            Illustrative cover
          </span>
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
            <p className="mt-0.5 line-clamp-2 text-sm text-text-muted">
              {building.address}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-3xl leading-none font-extrabold tracking-tight tabular-nums">
              {isEstimate ? "~" : ""}
              {formatUsd(shared ? perPerson : estimatedTotal)}
            </p>
            <p className="mt-1 text-xs font-medium text-text-muted">
              {shared
                ? "per person / mo"
                : isEstimate
                  ? "est. total / mo"
                  : "real cost / mo"}
            </p>
            {!shared && difference !== 0 && (
              <p className="mt-0.5 text-xs text-text-muted tabular-nums">
                ad: <span className="line-through">{formatUsd(cost.advertisedRent)}</span>
              </p>
            )}
            {shared && (
              <p className="text-xs text-text-muted tabular-nums">
                {formatUsd(estimatedTotal)} total
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

        <CostBar cost={cost} utilities={utilities} />
        <FeeChips fees={building.building_fees} />
        <p className="mt-1.5 text-xs text-text-muted">
          <UtilitiesLine utilities={utilities} />
        </p>

        {fit && <FitDisplay fit={fit} compact alternative={alternative} />}
        {!building.approval_known && <FitUnconfirmed compact />}

        <p className="mt-3 text-sm">
          <span className="font-medium">{plan.name}</span>
          <span className="text-text-muted">
            {" "}
            · {bedroomLabel(plan.bedrooms)} · {plan.lease_months}-mo lease ·{" "}
            {availableNow ? "Available now" : `From ${formatDate(plan.available_from)}`}
            {matchingPlanCount > 1 && ` · ${matchingPlanCount} plans fit`}
          </span>
        </p>

        {item.milesFromYou != null && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-text">
            <MapPinIcon className="size-3.5" />
            {item.milesFromYou.toFixed(1)} mi from {fromLabel ?? "you"}
            <span className="font-normal text-text-muted"> (straight line)</span>
          </p>
        )}

        {(building.miles_to_utd != null || building.bus_route) && (
          <p className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-text-muted">
            {building.miles_to_utd != null && (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3.5" />
                {building.miles_to_utd} mi to UTD
              </span>
            )}
            {building.bus_route && (
              <span className="inline-flex items-center gap-1">
                <BusIcon className="size-3.5" />
                DART bus {building.bus_route}
              </span>
            )}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2">
          <VerifiedNote lastVerified={building.last_verified} today={today} />
          <CompareToggle buildingId={building.id} />
        </div>
      </article>
    </RevealItem>
  );
}
