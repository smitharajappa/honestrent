import Link from "next/link";
import { Suspense } from "react";
import { ResultCard } from "@/components/ResultCard";
import { ResultsSkeleton } from "@/components/ResultsSkeleton";
import { SearchForm } from "@/components/SearchForm";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  AlertIcon,
  CheckIcon,
  HomeIcon,
  InfoIcon,
  SearchIcon,
} from "@/components/ui/icons";
import { fetchBuildings } from "@/lib/buildings";
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
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl px-4 pt-8 pb-16 sm:pt-12">
        <section aria-labelledby="page-title">
          <Badge tone="brand">Free for renters</Badge>
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

        <Card as="section" aria-label="Search apartments" className="mt-6 p-5 sm:p-6">
          <SearchForm
            budget={rawBudget}
            moveIn={rawMoveIn}
            today={today}
            errors={validation && !validation.ok ? validation.errors : undefined}
          />
        </Card>

        {!validation?.ok && (
          <ul className="mt-5 grid gap-2 text-sm text-text-muted sm:grid-cols-3">
            {[
              "Required fees included",
              "Deals spread over the lease",
              "Prices checked by hand",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckIcon className="size-4 shrink-0 text-brand-text" />
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

      <footer className="border-t border-border">
        <p className="mx-auto max-w-2xl px-4 py-6 text-xs text-text-muted">
          Prices are entered by hand and can change. Always confirm with the building
          before you apply.
        </p>
      </footer>
    </>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg font-bold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-brand-fg">
            <HomeIcon className="size-4.5" />
          </span>
          Swelt
        </Link>
        <span className="text-sm text-text-muted">Richardson · Plano</span>
      </div>
    </header>
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
    return (
      <Card as="section" role="alert" className="mt-10 flex gap-3 p-5">
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-warning-text" />
        <div>
          <h2 className="font-semibold">
            {data.reason === "not_configured"
              ? "Building data isn't connected yet"
              : "We couldn't load apartments"}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {data.reason === "not_configured"
              ? "Add your Supabase keys to .env.local. The README has the steps."
              : "This is usually brief. Please try again in a minute."}
          </p>
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
      <p className="mt-3 flex items-start gap-2 rounded-xl bg-brand-soft p-3 text-sm text-brand-text">
        <InfoIcon className="mt-0.5 size-4 shrink-0" />
        Real cost = advertised rent + required monthly fees − move-in deals spread over
        the lease.
      </p>

      <ol className="mt-5 space-y-4">
        {results.map((result, index) => (
          <ResultCard
            key={result.building.id}
            result={result}
            rank={index + 1}
            today={today}
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
    <Card as="section" aria-labelledby="empty-heading" className="mt-10 p-6 text-center">
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
  );
}
