import { Suspense } from "react";
import { ResultsExplorer } from "@/components/explore/ResultsExplorer";
import { CollapsibleSearch } from "@/components/explore/CollapsibleSearch";
import { HomeSections } from "@/components/home/HowItWorks";
import { ResultsSkeleton } from "@/components/ResultsSkeleton";
import { SearchForm } from "@/components/SearchForm";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertIcon } from "@/components/ui/icons";
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

  // Search-first: with no search yet, show every apartment we have checked, so the
  // product is the first thing people see. A budget and date narrow it down.
  const browsing = !hasSearched;
  const resultBudget = validation?.ok ? validation.value.budget : BROWSE_BUDGET;
  // Browsing uses the first of a month a year ahead, so every plan is available and the
  // first month in the move-in cash is a whole month.
  const resultMoveIn = validation?.ok
    ? validation.value.moveIn
    : firstOfMonthAYearAhead(today);

  return (
    <main className="page-container pt-6 pb-16 sm:pt-8">
      <h1
        id="page-title"
        className="max-w-4xl text-3xl font-bold text-balance sm:text-4xl"
      >
        Dallas–Fort Worth apartments, ranked by what you will really pay
      </h1>
      <p className="mt-2 max-w-3xl text-text-muted sm:text-lg">
        Rent plus required fees and utilities, minus deals, and whether the building is
        likely to approve you without an SSN or US credit.
      </p>

      <Card
        as="section"
        id="search"
        aria-label="Search apartments"
        className="mt-5 scroll-mt-24 p-4 sm:p-6"
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

      {(showingResults || browsing) && (
        <Suspense
          key={`${area ?? ""}-${resultBudget}-${resultMoveIn}`}
          fallback={<ResultsSkeleton />}
        >
          <Results
            area={area}
            nearChosen={nearChosen}
            budget={resultBudget}
            moveIn={resultMoveIn}
            today={today}
            browsing={browsing}
          />
        </Suspense>
      )}

      {!showingResults && <HomeSections />}
    </main>
  );
}

/** Budget used when nobody has searched yet: high enough to include every apartment. */
const BROWSE_BUDGET = 100000;

function firstOfMonthAYearAhead(isoDate: string): string {
  const [y, m] = isoDate.split("-").map(Number);
  return `${y + 1}-${String(m).padStart(2, "0")}-01`;
}

async function Results({
  area,
  nearChosen,
  budget,
  moveIn,
  today,
  browsing = false,
}: {
  area: string | null;
  nearChosen: boolean;
  budget: number;
  moveIn: string;
  today: string;
  browsing?: boolean;
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
      browsing={browsing}
    />
  );
}
