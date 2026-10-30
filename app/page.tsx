import { Suspense } from "react";
import { ApprovalPanel } from "@/components/approval/ApprovalPanel";
import { FitSummary } from "@/components/approval/FitBadge";
import { ResultCard } from "@/components/ResultCard";
import { ResultsSkeleton } from "@/components/ResultsSkeleton";
import { SearchForm } from "@/components/SearchForm";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertIcon, ArrowLeftIcon, CheckIcon, SearchIcon } from "@/components/ui/icons";
import { InfoNote } from "@/components/ui/InfoNote";
import { fetchBuildings } from "@/lib/buildings";
import { pickCriteria } from "@/lib/approval";
import { rankBuildings, suggestAlternatives } from "@/lib/cost";
import { formatDate, formatUsd } from "@/lib/format";
import { todayInTexas, validateSearch } from "@/lib/validation";

type SearchParams = Promise<{ budget?: string | string[]; moveIn?: string | string[] }>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const rawBudget = first(params.budget);
  const rawMoveIn = first(params.moveIn);
  const today = todayInTexas();
  const hasSearched = rawBudget !== undefined || rawMoveIn !== undefined;
  const validation = hasSearched ? validateSearch(rawBudget, rawMoveIn, today) : null;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-8 pb-16 sm:pt-12">
      <section aria-labelledby="page-title">
        <Badge>Free for renters</Badge>
        <h1
          id="page-title"
          className="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl"
        >
          See what you&apos;ll really pay each month
        </h1>
        <p className="mt-3 text-base text-pretty text-text-muted sm:text-lg">
          Apartments in Richardson and Plano, ranked by rent plus required fees, minus
          move-in deals.
        </p>
      </section>

      <Card
        as="section"
        id="search"
        aria-label="Search apartments"
        className="mt-6 scroll-mt-20 p-5 sm:p-6"
      >
        <SearchForm
          budget={rawBudget}
          moveIn={rawMoveIn}
          today={today}
          errors={validation && !validation.ok ? validation.errors : undefined}
        />
      </Card>

      <ApprovalPanel />

      {!validation?.ok && (
        <ul className="mt-5 grid gap-2 text-sm text-text-muted sm:grid-cols-3">
          {[
            "Required fees included",
            "Deals spread over the lease",
            "Prices checked by hand",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckIcon className="size-4 shrink-0 text-success-text" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {validation?.ok && (
        <Suspense
          key={`${validation.value.budget}-${validation.value.moveIn}`}
          fallback={<ResultsSkeleton />}
        >
          <Results
            budget={validation.value.budget}
            moveIn={validation.value.moveIn}
            today={today}
          />
        </Suspense>
      )}
    </main>
  );
}

async function Results({
  budget,
  moveIn,
  today,
}: {
  budget: number;
  moveIn: string;
  today: string;
}) {
  const data = await fetchBuildings();

  if (!data.ok) {
    // Renters see plain language; the technical reason is in the server logs.
    return (
      <Card as="section" role="alert" className="mt-10 flex gap-3 p-5">
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-warning-text" />
        <div>
          <h2 className="font-semibold">Apartments are temporarily unavailable</h2>
          <p className="mt-1 text-sm text-text-muted">
            This is on our side, not yours. Please try again in a few minutes.
          </p>
          <ButtonLink
            href={`/?budget=${budget}&moveIn=${moveIn}`}
            variant="secondary"
            className="mt-3"
          >
            Try again
          </ButtonLink>
        </div>
      </Card>
    );
  }

  const results = rankBuildings(data.buildings, budget, moveIn, today);

  if (results.length === 0) {
    const suggestion = suggestAlternatives(data.buildings, budget, moveIn, today);
    return <EmptyState budget={budget} moveIn={moveIn} suggestion={suggestion} />;
  }

  return (
    <section aria-labelledby="results-heading" className="mt-10">
      <SearchActions />
      <h2
        id="results-heading"
        className="text-xl font-bold tracking-tight"
        aria-live="polite"
      >
        {results.length} {results.length === 1 ? "apartment fits" : "apartments fit"}
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Under {formatUsd(budget)}/mo · Move in by {formatDate(moveIn)} · Lowest real cost
        first
      </p>
      <FitSummary
        items={results.map((r) => ({
          criteria: pickCriteria(r.building),
          rentUsd: r.plan.rent_usd,
        }))}
      />
      <InfoNote className="mt-3">
        Real cost = advertised rent + required monthly fees − move-in deals spread over
        the lease.
      </InfoNote>

      <ol className="mt-5 space-y-4">
        {results.map((result, index) => (
          <ResultCard
            key={result.building.id}
            result={result}
            rank={index + 1}
            today={today}
            detailHref={`/buildings/${result.building.id}?budget=${budget}&moveIn=${moveIn}`}
          />
        ))}
      </ol>
    </section>
  );
}

function EmptyState({
  budget,
  moveIn,
  suggestion,
}: {
  budget: number;
  moveIn: string;
  suggestion: { budget: number | null; moveIn: string | null };
}) {
  return (
    <>
      <div className="mt-10">
        <SearchActions />
      </div>
      <Card as="section" aria-labelledby="empty-heading" className="mt-3 p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-muted text-text-muted">
          <SearchIcon className="size-6" />
        </span>
        <h2 id="empty-heading" className="mt-4 text-lg font-semibold" aria-live="polite">
          No apartments fit yet
        </h2>
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
    </>
  );
}

/** One-tap exits from the results (Nielsen #3: user control and freedom). */
function SearchActions() {
  return (
    <nav aria-label="Search actions" className="mb-3 flex items-center gap-1 text-sm">
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
  );
}
