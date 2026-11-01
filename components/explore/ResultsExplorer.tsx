"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { isCompleteProfile } from "@/lib/approval";
import { suggestAlternatives } from "@/lib/cost";
import {
  activeFilterCount,
  applicationFeesSaved,
  DEFAULT_OPTIONS,
  explore,
  insight as getInsight,
  type SortKey,
} from "@/lib/explore";
import { formatDate, formatUsd } from "@/lib/format";
import { searchHref } from "@/lib/links";
import type { MapPin } from "@/lib/map";
import type { Building } from "@/lib/types";
import { useApproval } from "../approval/ApprovalContext";
import { AnswersNote } from "../approval/FitBadge";
import { LocateButton } from "../location/LocateButton";
import { useLocation } from "../location/LocationContext";
import { LazyMap } from "../map/LazyMap";
import { ResultCard } from "../ResultCard";
import { CompareTray } from "../shortlist/CompareTray";
import { TrustNotes } from "../TrustNotes";
import { Button, ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  MapPinIcon,
  SearchIcon,
  SlidersIcon,
  TagIcon,
} from "../ui/icons";
import { InfoNote } from "../ui/InfoNote";
import { FiltersPanel, type FilterState } from "./FiltersPanel";
import { InsightBanner } from "./InsightBanner";

type Props = {
  buildings: Building[];
  area?: string | null;
  /** The renter picked "Near me" or "Near ZIP …" as the place. */
  nearChosen?: boolean;
  budget: number;
  moveIn: string;
  today: string;
};

const SORTS: { value: SortKey; label: string }[] = [
  { value: "cost", label: "Lowest real cost" },
  { value: "savings", label: "Biggest savings vs. ad" },
  { value: "fit", label: "Best approval fit" },
  { value: "near", label: "Nearest to my place" },
];

const NO_FILTERS: FilterState = {
  people: DEFAULT_OPTIONS.people,
  bedrooms: [],
  cities: [],
  dealsOnly: false,
  goodFitOnly: false,
  nearUtd: false,
};

export function ResultsExplorer({
  buildings,
  area,
  nearChosen = false,
  budget,
  moveIn,
  today,
}: Props) {
  const { answers } = useApproval();
  const { coords, label: fromLabel } = useLocation();
  const profile = isCompleteProfile(answers) ? answers : null;
  const [filters, setFilters] = useState<FilterState>(NO_FILTERS);
  const [sort, setSort] = useState<SortKey>("cost");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [radius, setRadius] = useState<number | null>(10);

  // "Best fit" and "Good fit only" need the approval answers.
  const effectiveSort: SortKey =
    (sort === "fit" && !profile) || (sort === "near" && !coords) ? "cost" : sort;
  const effectiveFilters = useMemo(
    () => (profile ? filters : { ...filters, goodFitOnly: false }),
    [profile, filters],
  );

  const items = useMemo(
    () =>
      explore(buildings, {
        ...effectiveFilters,
        budget,
        moveIn,
        today,
        profile,
        sort: effectiveSort,
        origin: coords,
        maxMiles: coords ? radius : null,
      }),
    [
      buildings,
      effectiveFilters,
      budget,
      moveIn,
      today,
      profile,
      effectiveSort,
      coords,
      radius,
    ],
  );
  const pins = useMemo<MapPin[]>(
    () =>
      items.flatMap((item) => {
        const { building, cost, perPerson } = item;
        if (building.latitude === null || building.longitude === null) return [];
        return [
          {
            id: building.id,
            name: building.name,
            latitude: building.latitude,
            longitude: building.longitude,
            label: formatUsd(
              effectiveFilters.people > 1 ? perPerson : cost.realMonthlyCost,
            ),
            href: searchHref(`/buildings/${building.id}`, { budget, moveIn, area }),
            fit: profile ? (item.fit?.level ?? "unknown") : undefined,
          },
        ];
      }),
    [items, effectiveFilters.people, budget, moveIn, profile, area],
  );
  // Real places with no prices yet: shown grey on the map, never ranked.
  const mapOnlyPins = useMemo<MapPin[]>(
    () =>
      buildings.flatMap((b) => {
        if (b.floor_plans.length > 0 || b.latitude === null || b.longitude === null)
          return [];
        if (
          effectiveFilters.cities.length > 0 &&
          !effectiveFilters.cities.includes(b.city)
        )
          return [];
        return [
          {
            id: b.id,
            name: `${b.name} (prices not verified yet)`,
            latitude: b.latitude,
            longitude: b.longitude,
            href: `/buildings/${b.id}`,
            unverified: true,
          },
        ];
      }),
    [buildings, effectiveFilters.cities],
  );
  // Offered under every "Unlikely" card, so a refusal always comes with a next step.
  const firstGoodFit = items.find((i) => i.fit?.level === "good");
  const stats = getInsight(items);
  const feesSaved = applicationFeesSaved(items, effectiveFilters.people);
  const filterCount = activeFilterCount(effectiveFilters);
  const cities = [...new Set(buildings.map((b) => b.city))].sort();

  const fitCounts = profile
    ? items.reduce(
        (acc, i) => (i.fit ? { ...acc, [i.fit.level]: acc[i.fit.level] + 1 } : acc),
        { good: 0, guarantor: 0, unlikely: 0 },
      )
    : null;
  const unconfirmedCount = profile ? items.filter((i) => !i.fit).length : 0;

  return (
    <div className="mt-8 grid gap-8 pb-24 lg:grid-cols-[17rem_1fr] xl:grid-cols-[18rem_1fr]">
      {/* Filters: a sidebar on laptops, a collapsible panel on phones. */}
      <aside aria-label="Filters" className="lg:sticky lg:top-24 lg:self-start">
        <Button
          variant="secondary"
          className="w-full justify-between lg:hidden"
          aria-expanded={filtersOpen}
          aria-controls="filters-panel"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <span className="inline-flex items-center gap-2">
            <SlidersIcon className="size-4" />
            Filters{filterCount > 0 ? ` (${filterCount})` : ""}
          </span>
          <ChevronDownIcon
            className={`size-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
          />
        </Button>
        <div
          id="filters-panel"
          className={`${filtersOpen ? "block" : "hidden"} mt-3 lg:mt-0 lg:block`}
        >
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Filters</h2>
              {filterCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters(NO_FILTERS)}
                  className="min-h-11 text-sm font-semibold text-brand-text"
                >
                  Clear all
                </button>
              )}
            </div>
            <FiltersPanel
              value={effectiveFilters}
              onChange={setFilters}
              cities={cities}
              hasApprovalAnswers={profile !== null}
            />
          </Card>
          <div className="mt-4 hidden lg:block">
            <TrustNotes />
          </div>
        </div>
      </aside>

      <section aria-labelledby="results-heading" className="min-w-0">
        <nav aria-label="Search actions" className="mb-2 flex items-center gap-1 text-sm">
          <a
            href="#search"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-semibold text-brand-text hover:bg-surface-muted"
          >
            <ArrowLeftIcon className="size-4 rotate-90" />
            Edit search
          </a>
          <span aria-hidden="true" className="text-text-muted">
            ·
          </span>
          <ButtonLink href="/" variant="ghost" className="px-2">
            Start over
          </ButtonLink>
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="results-heading"
              className={
                items.length === 0 ? "sr-only" : "text-2xl font-bold tracking-tight"
              }
              aria-live="polite"
            >
              {items.length} {items.length === 1 ? "apartment fits" : "apartments fit"}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {area ? `${area} · ` : ""}Under {formatUsd(budget)}/mo
              {filters.people > 1 ? " per person" : ""} · Move in by {formatDate(moveIn)}
            </p>
          </div>
          <label className="flex w-full items-center gap-2 text-sm sm:w-auto">
            <span className="font-medium text-text-muted">Sort</span>
            <span className="relative min-w-0 flex-1 sm:flex-none">
              <select
                value={effectiveSort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="min-h-11 w-full appearance-none truncate rounded-xl border border-border-strong bg-surface py-2 pr-9 pl-3 text-sm font-semibold"
              >
                {SORTS.map((s) => (
                  <option
                    key={s.value}
                    value={s.value}
                    disabled={
                      (s.value === "fit" && !profile) || (s.value === "near" && !coords)
                    }
                  >
                    {s.label}
                    {s.value === "fit" && !profile ? " (needs approval answers)" : ""}
                    {s.value === "near" && !coords ? " (choose a place first)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-muted" />
            </span>
          </label>
        </div>

        <div className="mt-4">
          <LocateButton compact />
        </div>
        {coords && (
          <div
            role="group"
            aria-label="Show apartments within"
            className="mt-3 flex flex-wrap items-center gap-2"
          >
            <span className="text-sm font-medium text-text-muted">Within</span>
            {[5, 10, 25, null].map((miles) => (
              <button
                key={miles ?? "any"}
                type="button"
                aria-pressed={radius === miles}
                onClick={() => setRadius(miles)}
                className={`min-h-11 rounded-full border px-3.5 text-sm font-medium ${
                  radius === miles
                    ? "border-brand bg-brand text-brand-fg"
                    : "border-border-strong bg-surface text-text"
                }`}
              >
                {miles === null ? "Any distance" : `${miles} miles`}
              </button>
            ))}
            <span className="text-xs text-text-muted">
              of {fromLabel === "you" ? "you" : fromLabel}
            </span>
          </div>
        )}
        {nearChosen && !coords && (
          <InfoNote className="mt-3">
            You chose to search near a place, but this tab doesn&apos;t have it any more.
            Use my location or enter a ZIP above to see distances and filter by miles.
          </InfoNote>
        )}

        {items.length > 0 && (
          <div
            role="group"
            aria-label="Show results as"
            className="mt-4 inline-flex rounded-xl border border-border-strong bg-surface p-1"
          >
            {(
              [
                { value: "list", label: "List", icon: TagIcon },
                { value: "map", label: "Map", icon: MapPinIcon },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={view === option.value}
                onClick={() => setView(option.value)}
                className={`relative inline-flex min-h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold ${
                  view === option.value ? "text-brand-fg" : "text-text-muted"
                }`}
              >
                {view === option.value && (
                  <motion.span
                    layoutId="view-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    className="absolute inset-0 rounded-lg bg-brand"
                  />
                )}
                <span className="relative inline-flex items-center gap-1.5">
                  <option.icon className="size-4" />
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {fitCounts && items.length > 0 && (
          <div className="mt-3 text-sm">
            <p className="font-semibold">
              {[
                fitCounts.good &&
                  `${fitCounts.good} good ${fitCounts.good === 1 ? "fit" : "fits"}`,
                fitCounts.guarantor && `${fitCounts.guarantor} possible with guarantor`,
                fitCounts.unlikely && `${fitCounts.unlikely} unlikely`,
                unconfirmedCount > 0 &&
                  `${unconfirmedCount} approval rules not confirmed`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <AnswersNote />
          </div>
        )}
        {feesSaved.buildings > 0 && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-success-soft p-3 text-sm text-success-text">
            <TagIcon className="mt-0.5 size-4 shrink-0" />
            <span>
              <strong className="font-semibold">
                Skipping the {feesSaved.buildings} unlikely{" "}
                {feesSaved.buildings === 1 ? "building" : "buildings"} saves you about{" "}
                {formatUsd(feesSaved.usd)}
              </strong>{" "}
              in application fees.
            </span>
          </p>
        )}
        {!profile && items.length > 0 && (
          <InfoNote className="mt-3">
            Answer the 3 approval questions in the search to see who&apos;s likely to say
            yes.
          </InfoNote>
        )}

        {stats && (
          <div className="mt-5">
            <InsightBanner insight={stats} />
          </div>
        )}

        {items.length > 0 && view === "map" && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {pins.length > 0 ? (
              <LazyMap
                pins={[...mapOnlyPins, ...pins]}
                you={coords}
                summary={`${pins.length} apartments with their real monthly cost. Switch to List to read them.`}
                className="h-[28rem] lg:h-[34rem]"
              />
            ) : (
              <InfoNote>
                Map pins aren&apos;t available for these apartments yet.
              </InfoNote>
            )}
            <p className="mt-2 text-sm text-text-muted">
              Teal pins show the real monthly cost. Tap a pin to open the apartment.
              {mapOnlyPins.length > 0 &&
                ` Grey dots are ${mapOnlyPins.length} more real communities whose prices we haven't verified yet.`}
            </p>
          </motion.div>
        )}

        {items.length > 0 && view === "list" ? (
          <ol className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <ResultCard
                key={item.building.id}
                item={item}
                rank={effectiveSort === "cost" ? index + 1 : undefined}
                index={index}
                today={today}
                people={effectiveFilters.people}
                detailHref={searchHref(`/buildings/${item.building.id}`, {
                  budget,
                  moveIn,
                  area,
                })}
                fromLabel={fromLabel}
                alternative={
                  item.fit?.level === "unlikely" && firstGoodFit
                    ? {
                        name: firstGoodFit.building.name,
                        href: searchHref(`/buildings/${firstGoodFit.building.id}`, {
                          budget,
                          moveIn,
                          area,
                        }),
                      }
                    : undefined
                }
              />
            ))}
          </ol>
        ) : items.length > 0 ? null : filterCount > 0 ? (
          <Card className="mt-6 p-6 text-center">
            <h3 className="text-lg font-semibold">No apartments match these filters</h3>
            <p className="mt-1 text-sm text-text-muted">Try removing a filter or two.</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setFilters(NO_FILTERS)}
            >
              Clear all filters
            </Button>
          </Card>
        ) : (
          <EmptyState
            buildings={buildings}
            area={area}
            budget={budget}
            moveIn={moveIn}
            today={today}
          />
        )}

        <div className="mt-8 lg:hidden">
          <TrustNotes />
        </div>
      </section>

      <CompareTray moveIn={moveIn} />
    </div>
  );
}

function EmptyState({ buildings, area, budget, moveIn, today }: Props) {
  const suggestion = suggestAlternatives(buildings, budget, moveIn, today);
  return (
    <Card className="mt-6 p-6 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-muted text-text-muted">
        <SearchIcon className="size-6" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">No apartments fit yet</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
        Nothing is under {formatUsd(budget)}/mo for a {formatDate(moveIn)} move-in. One
        small change could open up options:
      </p>
      {(suggestion.budget || suggestion.moveIn) && (
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          {suggestion.budget && (
            <ButtonLink
              variant="secondary"
              href={searchHref("/", { budget: suggestion.budget, moveIn, area })}
            >
              Try a {formatUsd(suggestion.budget)} budget
            </ButtonLink>
          )}
          {suggestion.moveIn && (
            <ButtonLink
              variant="secondary"
              href={searchHref("/", { budget, moveIn: suggestion.moveIn, area })}
            >
              Move in {formatDate(suggestion.moveIn)}
            </ButtonLink>
          )}
        </div>
      )}
    </Card>
  );
}
