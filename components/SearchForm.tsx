import Form from "next/form";
import { ApprovalFooter, ApprovalSelects } from "./approval/ApprovalFields";
import { BudgetChips, SearchButton } from "./SearchFormControls";
import { Field } from "./ui/Field";
import { DFW_SUGGESTIONS } from "@/lib/areas";

type Props = {
  area?: string;
  budget?: string;
  moveIn?: string;
  today: string;
  errors?: { area?: string; budget?: string; moveIn?: string };
};

/**
 * One search for everything: budget and move-in (kept in the URL so results can
 * be bookmarked) plus the optional approval questions (kept in memory only).
 */
export function SearchForm({ area, budget, moveIn, today, errors = {} }: Props) {
  return (
    <Form action="/" noValidate className="space-y-5">
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr] lg:gap-8">
        <div role="group" aria-labelledby="group-search" className="min-w-0">
          <p
            id="group-search"
            className="mb-3 text-xs font-bold tracking-wider text-text-muted uppercase"
          >
            Your search
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field
                id="area"
                name="area"
                label="Area"
                hint="City, ZIP or neighbourhood in Dallas–Fort Worth (optional)"
                placeholder="Richardson, Plano, 75080…"
                autoComplete="off"
                list="area-suggestions"
                defaultValue={area}
                error={errors.area}
              />
              <datalist id="area-suggestions">
                {DFW_SUGGESTIONS.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
            <div>
              <Field
                id="budget"
                name="budget"
                label="Monthly budget"
                hint="Your share of rent, fees and utilities"
                prefix="$"
                inputMode="numeric"
                autoComplete="off"
                placeholder="1,500"
                defaultValue={budget}
                error={errors.budget}
              />
              <BudgetChips inputId="budget" />
            </div>
            <Field
              id="moveIn"
              name="moveIn"
              type="date"
              label="Move-in date"
              hint="When you need the keys"
              min={today}
              defaultValue={moveIn}
              error={errors.moveIn}
            />
          </div>
        </div>

        <div
          role="group"
          aria-labelledby="group-approval"
          className="min-w-0 border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
        >
          <p
            id="group-approval"
            className="mb-3 text-xs font-bold tracking-wider text-text-muted uppercase"
          >
            Will they approve you?{" "}
            <span className="font-medium normal-case">(optional)</span>
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            <ApprovalSelects />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between">
        <ApprovalFooter />
        <div className="lg:w-64 lg:shrink-0">
          <SearchButton />
        </div>
      </div>
    </Form>
  );
}
