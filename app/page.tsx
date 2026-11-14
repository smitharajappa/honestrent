import { Suspense } from "react";
import { ResultsExplorer } from "@/components/explore/ResultsExplorer";
import { HeroArt } from "@/components/HeroArt";
import { CollapsibleSearch } from "@/components/explore/CollapsibleSearch";
import { CostReveal } from "@/components/home/CostReveal";
import { HomeSections } from "@/components/home/HowItWorks";
import { ResultsSkeleton } from "@/components/ResultsSkeleton";
import { SearchForm } from "@/components/SearchForm";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertIcon, LockIcon } from "@/components/ui/icons";
import { fetchBuildings } from "@/lib/buildings";
import { searchHref } from "@/lib/links";
import { inArea } from "@/lib/explore";
import { todayInTexas, validateArea, validateSearch } from "@/lib/validation";
import { RequestArea } from "@/components/explore/RequestArea";

type SearchParams = Promise<{
  area?: string | string[];
  budget?: string | string[];
  moveIn?: string | string[];
}>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const rawBudget = first(params.budget);
  const rawMoveIn = first(params.moveIn);
  const rawArea = first(params.area);
  const areaCheck = validateArea(rawArea);
  const area = areaCheck.ok ? areaCheck.value : null;
  const nearChosen = /^near /i.test((rawArea ?? "").trim());
  const today = todayInTexas();
  const hasSearched = rawBudget !== undefined || rawMoveIn !== undefined;
  const validation = hasSearched ? validateSearch(rawBudget, rawMoveIn, today) : null;
  const showingResults = validation?.ok === true && areaCheck.ok;
  const formErrors = {
    ...(validation && !validation.ok ? validation.errors : {}),
    ...(!areaCheck.ok ? { area: areaCheck.error } : {}),
  };

  return (
    <main>
      {/* Hero: full width, compact once results are showing. */}
      <section aria-labelledby="page-title" className="hero-bg">
        <div
          className={`page-container grid items-center gap-8 lg:grid-cols-[1fr_27rem] ${
            showingResults ? "pt-8 pb-24 sm:pt-10" : "pt-10 pb-28 sm:pt-14 lg:pt-16"
          }`}
        >
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1 text-xs font-semibold text-text-muted shadow-card">
              <LockIcon className="size-3.5" />
              No SSN or US credit? Start here.
            </p>
            {showingResults ? (
              <h1
                id="page-title"
                className="mt-4 text-3xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-4xl"
              >
                Find a place that will say yes.{" "}
                <span className="text-text-muted">See what it really costs.</span>
              </h1>
            ) : (
              <h1 id="page-title" className="display mt-4 text-balance">
                Find a place that will say yes.{" "}
                <span className="marker">See what it really costs.</span>
              </h1>
            )}
            {!showingResults && (
              <>
                <p className="mt-5 max-w-xl text-lg text-pretty text-text-muted">
                  Apartments ranked by what you&apos;ll really pay each month (rent,
                  required fees and utilities, minus deals) and by how likely they are to
                  approve newcomers. Starting in the Dallas area: Richardson, Plano and
                  Dallas.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <ButtonLink href="#search" size="lg">
                    Search apartments
                  </ButtonLink>
                  <ButtonLink href="#how-heading" size="lg" variant="secondary">
                    How it works
                  </ButtonLink>
                </div>
                <p className="mt-5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-surface/80 px-3.5 py-2 text-sm shadow-card lg:hidden">
                  <span className="text-text-muted">The ad says</span>
                  <strong className="tabular-nums">$1,450</strong>
                  <span aria-hidden="true">→</span>
                  <span className="text-text-muted">estimated real cost</span>
                  <strong className="tabular-nums text-warning-text">~$1,620</strong>
                </p>
              </>
            )}
          </div>
          {showingResults ? (
            <HeroArt compact />
          ) : (
            <CostReveal className="hidden lg:block" />
          )}
        </div>
      </section>

      {/* The search card overlaps the hero. */}
      <div className="page-container relative z-10 -mt-20">
        <Card
          as="section"
          id="search"
          aria-label="Search apartments"
          className="scroll-mt-24 p-5 shadow-raised sm:p-6 lg:p-8"
        >
          {showingResults && validation?.ok ? (
            <CollapsibleSearch
              area={rawArea?.trim() || null}
              budget={validation.value.budget}
              moveIn={validation.value.moveIn}
            >
              <SearchForm
                area={rawArea}
                budget={rawBudget}
                moveIn={rawMoveIn}
                today={today}
                errors={formErrors}
              />
            </CollapsibleSearch>
          ) : (
            <SearchForm
              area={rawArea}
              budget={rawBudget}
              moveIn={rawMoveIn}
              today={today}
              errors={formErrors}
            />
          )}
        </Card>

        {showingResults && validation?.ok ? (
          <Suspense
            key={`${area ?? ""}-${validation.value.budget}-${validation.value.moveIn}`}
            fallback={<ResultsSkeleton />}
          >
            <Results
              area={area}
              nearChosen={nearChosen}
              budget={validation.value.budget}
              moveIn={validation.value.moveIn}
              today={today}
            />
          </Suspense>
        ) : (
          <HomeSections />
        )}
      </div>
    </main>
  );
}

async function Results({
  area,
  nearChosen,
  budget,
  moveIn,
  today,
}: {
  area: string | null;
  nearChosen: boolean;
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
            href={searchHref("/", { budget, moveIn, area })}
            variant="secondary"
            className="mt-3"
          >
            Try again
          </ButtonLink>
        </div>
      </Card>
    );
  }

  const inSearchArea = data.buildings.filter((b) => inArea(b, area));
  if (area && inSearchArea.length === 0) {
    return <RequestArea area={area} coveredHref={searchHref("/", { budget, moveIn })} />;
  }

  return (
    <ResultsExplorer
      buildings={inSearchArea}
      area={area}
      nearChosen={nearChosen}
      budget={budget}
      moveIn={moveIn}
      today={today}
    />
  );
}
