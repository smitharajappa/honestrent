type Props = {
  budget?: string;
  moveIn?: string;
  today: string;
  errors?: { budget?: string; moveIn?: string };
};

// A plain HTML form: it works even before JavaScript loads, and the search
// lives in the URL so results can be shared or bookmarked.
export function SearchForm({ budget, moveIn, today, errors = {} }: Props) {
  return (
    <form method="get" action="/" className="space-y-4" noValidate>
      <div>
        <label htmlFor="budget" className="block text-sm font-medium">
          Monthly budget
        </label>
        <div className="relative mt-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
            $
          </span>
          <input
            id="budget"
            name="budget"
            inputMode="numeric"
            autoComplete="off"
            placeholder="1500"
            defaultValue={budget}
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={errors.budget ? "budget-error" : undefined}
            className="block w-full rounded-lg border border-neutral-300 bg-white py-3 pr-3 pl-7 text-base focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/30 focus:outline-none aria-invalid:border-red-600"
          />
        </div>
        {errors.budget && (
          <p id="budget-error" className="mt-1 text-sm text-red-700">
            {errors.budget}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="moveIn" className="block text-sm font-medium">
          Move-in date
        </label>
        <input
          id="moveIn"
          name="moveIn"
          type="date"
          min={today}
          defaultValue={moveIn}
          aria-invalid={Boolean(errors.moveIn)}
          aria-describedby={errors.moveIn ? "moveIn-error" : undefined}
          className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white p-3 text-base focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/30 focus:outline-none aria-invalid:border-red-600"
        />
        {errors.moveIn && (
          <p id="moveIn-error" className="mt-1 text-sm text-red-700">
            {errors.moveIn}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-emerald-800 py-3 text-base font-semibold text-white hover:bg-emerald-900 focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Show apartments
      </button>
    </form>
  );
}
