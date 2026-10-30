import Form from "next/form";
import { BudgetChips, SearchButton } from "./SearchFormControls";
import { Field } from "./ui/Field";

type Props = {
  budget?: string;
  moveIn?: string;
  today: string;
  errors?: { budget?: string; moveIn?: string };
};

// Next.js <Form> keeps the search in the URL (shareable, bookmarkable) and
// updates the page without a full reload. It still works before JavaScript loads.
export function SearchForm({ budget, moveIn, today, errors = {} }: Props) {
  return (
    <Form action="/" noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Field
            id="budget"
            name="budget"
            label="Monthly budget"
            hint="Your max for rent plus fees"
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
      <SearchButton />
    </Form>
  );
}
