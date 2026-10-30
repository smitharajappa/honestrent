import { Suspense } from "react";
import { ResultsExplorer } from "@/components/explore/ResultsExplorer";
import { HeroSkyline } from "@/components/HeroSkyline";
import { ResultsSkeleton } from "@/components/ResultsSkeleton";
import { SearchForm } from "@/components/SearchForm";
import { TrustNotes } from "@/components/TrustNotes";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  AlertIcon,
  CheckIcon,
  LockIcon,
  SearchIcon,
  TagIcon,
} from "@/components/ui/icons";
import { fetchBuildings } from "@/lib/buildings";
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
  const showingResults = validation?.ok === true;

  return (
    <main>
      {/* Hero: full width, compact once results are showing. */}
      <section
        aria-labelledby="page-title"
        className="bg-gradient-to-br from-[var(--hero-from)] to-[var(--hero-to)]"
      >
        <div
          className={`page-container grid items-end gap-6 lg:grid-cols-[1fr_26rem] ${
            showingResults ? "pt-8 pb-24 sm:pt-10" : "pt-10 pb-28 sm:pt-14 lg:pt-16"
          }`}
        >
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1 text-xs font-semibold text-text-muted shadow-card">
              <LockIcon className="size-3.5" />
              No SSN or US credit? Start here.
            </p>
            <h1
              id="page-title"
              className={`mt-4 leading-[1.05] font-extrabold tracking-tight text-balance ${
                showingResults
                  ? "text-3xl sm:text-4xl"
                  : "text-4xl sm:text-5xl lg:text-6xl"
              }`}
            >
              Find a place that will say yes.{" "}
              <span className="text-text-muted">See what it really costs.</span>
            </h1>
            {!showingResults && (
              <p className="mt-4 max-w-xl text-lg text-pretty text-text-muted">
                Richardson and Plano apartments ranked by real monthly cost (rent plus
                required fees, minus deals) and by how likely they are to approve
                newcomers.
              </p>
            )}
          </div>
          <HeroSkyline
            className={`hidden w-full lg:block ${showingResults ? "max-h-32" : "max-h-56"}`}
          />
        </div>
      </section>

      {/* The search card overlaps the hero. */}
      <div className="page-container -mt-20">
        <Card
          as="section"
          id="search"
          aria-label="Search apartments"
          className="scroll-mt-24 p-5 shadow-raised sm:p-6 lg:p-8"
        >
          <SearchForm
            budget={rawBudget}
            moveIn={rawMoveIn}
            today={today}
            errors={validation && !validation.ok ? validation.errors : undefined}
          />
        </Card>

        {showingResults ? (
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
        ) : (
          <HowItWorks />
        )}
      </div>
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

  return (
    <ResultsExplorer
      buildings={data.buildings}
      budget={budget}
      moveIn={moveIn}
      today={today}
    />
  );
}

const STEPS = [
  {
    icon: SearchIcon,
    title: "Tell us your budget and move-in date",
    body: "Your share if you're living with roommates.",
  },
  {
    icon: LockIcon,
    title: "Answer 3 private questions",
    body: "Income range, credit, and the ID you have. Never your SSN or exact score.",
  },
  {
    icon: CheckIcon,
    title: "See who's likely to say yes",
    body: "Each building shows Good fit, Possible with guarantor, or Unlikely, with the reason.",
  },
  {
    icon: TagIcon,
    title: "Compare the real cost",
    body: "Required fees added, move-in deals spread over the lease. No surprises.",
  },
];

function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="mt-14">
      <h2 id="how-heading" className="text-2xl font-bold tracking-tight">
        How Swelt works
      </h2>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="rounded-2xl border border-border bg-surface p-5 shadow-card"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-surface-muted text-text">
                <step.icon className="size-5" />
              </span>
              <span className="text-xs font-bold tracking-wider text-text-muted uppercase">
                Step {i + 1}
              </span>
            </span>
            <h3 className="mt-4 font-bold">{step.title}</h3>
            <p className="mt-1 text-sm text-text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6 max-w-xl">
        <TrustNotes />
      </div>
    </section>
  );
}
