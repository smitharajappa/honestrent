import { ResultCard } from "@/components/ResultCard";
import { SearchForm } from "@/components/SearchForm";
import { fetchBuildings } from "@/lib/buildings";
import { rankBuildings } from "@/lib/cost";
import { formatUsd } from "@/lib/format";
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
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Swelt</h1>
        <p className="mt-1 text-neutral-700">
          Richardson-Plano apartments ranked by what you&apos;ll really pay each month:
          rent + fees − deals.
        </p>
      </header>

      <SearchForm
        budget={rawBudget}
        moveIn={rawMoveIn}
        today={today}
        errors={validation && !validation.ok ? validation.errors : undefined}
      />

      {validation?.ok && (
        <Results
          budget={validation.value.budget}
          moveIn={validation.value.moveIn}
          today={today}
        />
      )}

      <footer className="mt-10 text-xs text-neutral-500">
        Prices are entered by hand and may change. Always confirm with the building.
      </footer>
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
    return (
      <p role="alert" className="mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
        {data.reason === "not_configured"
          ? "The building database isn't connected yet. Add your Supabase keys to .env.local (see README)."
          : "We couldn't load buildings right now. Please try again in a minute."}
      </p>
    );
  }

  const results = rankBuildings(data.buildings, budget, moveIn, today);

  return (
    <section aria-labelledby="results-heading" className="mt-8">
      <h2 id="results-heading" className="mb-3 text-sm font-medium text-neutral-700">
        {results.length === 0
          ? "No matches"
          : `${results.length} ${results.length === 1 ? "building" : "buildings"} under ${formatUsd(budget)}, cheapest first`}
      </h2>

      {results.length === 0 ? (
        <p className="rounded-lg bg-white p-4 text-sm text-neutral-700">
          Nothing fits a {formatUsd(budget)} budget for that move-in date. Try a higher
          budget or a later date.
        </p>
      ) : (
        <ol className="space-y-3">
          {results.map((result, index) => (
            <ResultCard key={result.building.id} result={result} rank={index + 1} />
          ))}
        </ol>
      )}
    </section>
  );
}
