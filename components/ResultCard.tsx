import Link from "next/link";
import type { ExploreItem } from "@/lib/explore";
import { bedroomLabel, formatDate, formatUsd } from "@/lib/format";
import { isDealActive } from "@/lib/cost";
import { SOURCE_LABELS, type UtilityView } from "@/lib/utilities";
import { FitDisplay, FitUnconfirmed } from "./approval/FitBadge";
import { MapThumb } from "./map/MapThumb";
import { CostReceipt } from "./CostReceipt";
import { CompareToggle, SaveButton } from "./shortlist/ShortlistButtons";
import { RevealItem } from "./motion/Reveal";
import { Badge } from "./ui/Badge";
import { BusIcon, CheckIcon, MapPinIcon, TagIcon } from "./ui/icons";
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
  /** Cash due before the keys, or null when the building hasn't shared every part. */
  moveInTotal?: number | null;
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

type StripCell = { label: string; value: string; hidden?: boolean; muted?: boolean };

/**
 * The same four columns on every card, so cards can be compared at a glance (like the
 * fixed fee columns on Japanese rental listings). Anything the building hasn't shared
 * says so instead of being left out. Charges the ad hid get the highlighter.
 */
export function CostStrip({
  cost,
  utilities,
  moveInTotal,
}: {
  cost: ExploreItem["cost"];
  utilities: UtilityView;
  moveInTotal: number | null;
}) {
  const NOT_SHARED = "Not disclosed";
  const util: StripCell =
    utilities.source === "included"
      ? { label: "Utilities", value: "In rent" }
      : utilities.source === "direct"
        ? { label: "Utilities", value: "You pay", muted: true }
        : utilities.known && utilities.avg > 0
          ? { label: "Utilities", value: `+${formatUsd(utilities.avg)}`, hidden: true }
          : { label: "Utilities", value: NOT_SHARED, muted: true };
  const cells: StripCell[] = [
    { label: "Rent", value: formatUsd(cost.advertisedRent) },
    cost.monthlyFees > 0
      ? { label: "Fees", value: `+${formatUsd(cost.monthlyFees)}`, hidden: true }
      : { label: "Fees", value: "$0" },
    util,
    moveInTotal != null
      ? { label: "Move-in", value: formatUsd(moveInTotal) }
      : { label: "Move-in", value: NOT_SHARED, muted: true },
  ];
  return (
    <dl className="mt-3 grid grid-cols-4 divide-x divide-border rounded-md border border-border text-center">
      {cells.map((c) => (
        <div key={c.label} className="min-w-0 px-1 py-2">
          <dt className="text-[11px] text-text-muted">{c.label}</dt>
          <dd
            className={
              c.muted
                ? "mt-0.5 text-xs leading-tight text-text-muted"
                : "figure mt-0.5 text-sm font-semibold"
            }
          >
            {c.hidden ? <span className="marker">{c.value}</span> : c.value}
          </dd>
        </div>
      ))}
    </dl>
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
  moveInTotal = null,
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
      className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-surface transition-colors duration-150 hover:border-border-strong"
    >
      <div className="relative h-40 overflow-hidden">
        <MapThumb
          name={building.name}
          latitude={building.latitude}
          longitude={building.longitude}
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
        </div>
        <SaveButton
          buildingId={building.id}
          buildingName={building.name}
          className="absolute top-2.5 right-2.5"
        />
      </div>

      <article
        aria-labelledby={`b-${building.id}`}
        className="flex flex-1 flex-col border-t border-border p-4 sm:p-5"
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
            <p className="figure text-3xl leading-none font-medium">
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
                ad:{" "}
                <span className="figure line-through">
                  {formatUsd(cost.advertisedRent)}
                </span>
              </p>
            )}
            {shared && (
              <p className="text-xs text-text-muted tabular-nums">
                {formatUsd(estimatedTotal)} total
              </p>
            )}
          </div>
        </div>

        <CostStrip cost={cost} utilities={utilities} moveInTotal={moveInTotal} />
        {cost.monthlyDealSavings > 0 && (
          <p className="mt-2 text-xs text-success-text">
            Includes a deal worth {formatUsd(cost.monthlyDealSavings)}/mo over the lease.
          </p>
        )}
        <details className="group/details relative z-10 mt-2 text-sm">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center font-semibold text-brand-text underline underline-offset-2 [&::-webkit-details-marker]:hidden">
            Full breakdown
          </summary>
          <CostReceipt cost={cost} utilities={utilities} className="mt-0" />
          <p className="mt-1.5 text-xs text-text-muted">
            <UtilitiesLine utilities={utilities} />
          </p>
        </details>

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
