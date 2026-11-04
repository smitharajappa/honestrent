import Form from "next/form";
import { ApprovalFooter, ApprovalSelects } from "./approval/ApprovalFields";
import { AreaChips, BudgetChips, SearchButton } from "./SearchFormControls";
import { LocateButton } from "./location/LocateButton";
import { Badge } from "./ui/Badge";
import { Field } from "./ui/Field";
import { CheckIcon, UsersIcon, XCircleIcon } from "./ui/icons";
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
                label="Where do you want to live?"
                hint="A city or ZIP in Dallas–Fort Worth, or pick Anywhere in DFW."
                placeholder="Richardson, Plano, 75080…"
                autoComplete="off"
                list="area-suggestions"
                defaultValue={area}
                error={errors.area}
              />
              <AreaChips inputId="area" />
              <datalist id="area-suggestions">
                {DFW_SUGGESTIONS.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
              <div className="mt-3">
                <LocateButton />
              </div>
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
          <div className="mt-6 rounded-2xl bg-surface-muted p-4">
            <p className="text-sm font-semibold">
              What you&apos;ll see on every building
            </p>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Badge tone="success" icon={<CheckIcon className="size-3.5" />}>
                  Good fit
                </Badge>
                <span className="text-text-muted">Your answers match what they ask.</span>
              </li>
              <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Badge tone="warning" icon={<UsersIcon className="size-3.5" />}>
                  Possible with guarantor
                </Badge>
                <span className="text-text-muted">
                  A guarantor would help. We say who takes one.
                </span>
              </li>
              <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Badge tone="unlikely" icon={<XCircleIcon className="size-3.5" />}>
                  Unlikely
                </Badge>
                <span className="text-text-muted">
                  With the reason, and a nearby building that fits.
                </span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-text-muted">
              Estimates only. Skip the questions to see every building.
            </p>
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
