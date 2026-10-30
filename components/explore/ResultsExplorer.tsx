"use client";

import { useMemo, useState } from "react";
import { isCompleteProfile } from "@/lib/approval";
import { suggestAlternatives } from "@/lib/cost";
import {
  activeFilterCount,
  DEFAULT_OPTIONS,
  explore,
  insight as getInsight,
  type SortKey,
} from "@/lib/explore";
import { formatDate, formatUsd } from "@/lib/format";
import type { Building } from "@/lib/types";
import { useApproval } from "../approval/ApprovalContext";
import { AnswersNote } from "../approval/FitBadge";
import { ResultCard } from "../ResultCard";
import { CompareTray } from "../shortlist/CompareTray";
import { TrustNotes } from "../TrustNotes";
import { Button, ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import { ArrowLeftIcon, ChevronDownIcon, SearchIcon, SlidersIcon } from "../ui/icons";
import { InfoNote } from "../ui/InfoNote";
import { FiltersPanel, type FilterState } from "./FiltersPanel";
import { InsightBanner } from "./InsightBanner";

type Props = { buildings: Building[]; budget: number; moveIn: string; today: string };

const SORTS: { value: SortKey; label: string }[] = [
  { value: "cost", label: "Lowest real cost" },
  { value: "savings", label: "Biggest savings vs. ad" },
  { value: "fit", label: "Best approval fit" },
];

const NO_FILTERS: FilterState = {
  people: DEFAULT_OPTIONS.people,
  bedrooms: [],
  cities: [],
  dealsOnly: false,
  goodFitOnly: false,
};

export function ResultsExplorer({ buildings, budget, moveIn, today }: Props) {
  const { answers } = useApproval();
  const profile = isCompleteProfile(answers) ? answers : null;
  const [filters, setFilters] = useState<FilterState>(NO_FILTERS);
  const [sort, setSort] = useState<SortKey>("cost");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // "Best fit" and "Good fit only" need the approval answers.
  const effectiveSort: SortKey = sort === "fit" && !profile ? "cost" : sort;
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
      }),
    [buildings, effectiveFilters, budget, moveIn, today, profile, effectiveSort],
  );
  const stats = getInsight(items);
  const filterCount = activeFilterCount(effectiveFilters);
  const cities = [...new Set(buildings.map((b) => b.city))].sort();

  const fitCounts = profile
    ? items.reduce((acc, i) => ({ ...acc, [i.fit!.level]: acc[i.fit!.level] + 1 }), {
        good: 0,
        guarantor: 0,
        unlikely: 0,
      })
    : null;

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
              Under {formatUsd(budget)}/mo{filters.people > 1 ? " per person" : ""} · Move
              in by {formatDate(moveIn)}
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
                    disabled={s.value === "fit" && !profile}
                  >
                    {s.label}
                    {s.value === "fit" && !profile ? " (needs approval answers)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-muted" />
            </span>
          </label>
        </div>

        {fitCounts && items.length > 0 && (
          <div className="mt-3 text-sm">
            <p className="font-semibold">
              {[
                fitCounts.good &&
                  `${fitCounts.good} good ${fitCounts.good === 1 ? "fit" : "fits"}`,
                fitCounts.guarantor && `${fitCounts.guarantor} possible with guarantor`,
                fitCounts.unlikely && `${fitCounts.unlikely} unlikely`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <AnswersNote />
          </div>
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

        {items.length > 0 ? (
          <ol className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <ResultCard
                key={item.building.id}
                item={item}
                rank={effectiveSort === "cost" ? index + 1 : undefined}
                today={today}
                people={effectiveFilters.people}
                detailHref={`/buildings/${item.building.id}?budget=${budget}&moveIn=${moveIn}`}
              />
            ))}
          </ol>
        ) : filterCount > 0 ? (
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

function EmptyState({ buildings, budget, moveIn, today }: Omit<Props, never>) {
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
              href={`/?budget=${suggestion.budget}&moveIn=${moveIn}`}
            >
              Try a {formatUsd(suggestion.budget)} budget
            </ButtonLink>
          )}
          {suggestion.moveIn && (
            <ButtonLink
              variant="secondary"
              href={`/?budget=${budget}&moveIn=${suggestion.moveIn}`}
            >
              Move in {formatDate(suggestion.moveIn)}
            </ButtonLink>
          )}
        </div>
      )}
    </Card>
  );
}
