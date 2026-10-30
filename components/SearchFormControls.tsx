"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./ui/Button";
import { SearchIcon } from "./ui/icons";

const QUICK_BUDGETS = [1200, 1500, 2000];

/** Shows "Searching…" while results load (Nielsen #1: visibility of system status). */
export function SearchButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
          Searching…
        </>
      ) : (
        <>
          <SearchIcon className="size-5" />
          Show apartments
        </>
      )}
    </Button>
  );
}

/** One-tap budgets (Nielsen #7: shortcuts). Fills the budget box; nothing is sent. */
export function BudgetChips({ inputId }: { inputId: string }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Quick budgets">
      {QUICK_BUDGETS.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => {
            const input = document.getElementById(inputId) as HTMLInputElement | null;
            if (input) {
              input.value = String(amount);
              input.focus();
            }
          }}
          className="min-h-11 rounded-full border border-border-strong bg-surface px-3 text-sm font-medium tabular-nums transition-colors duration-150 hover:border-brand hover:text-brand-text"
        >
          ${amount.toLocaleString("en-US")}
        </button>
      ))}
    </div>
  );
}
