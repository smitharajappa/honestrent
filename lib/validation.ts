// Checks the search form values. Returns friendly messages for the renter.

export const MIN_BUDGET = 300;
export const MAX_BUDGET = 20000;
const MAX_DAYS_AHEAD = 365;

export type SearchInput = { budget: number; moveIn: string };

export type ValidationResult =
  | { ok: true; value: SearchInput }
  | { ok: false; errors: { budget?: string; moveIn?: string } };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function validateSearch(
  rawBudget: string | undefined,
  rawMoveIn: string | undefined,
  today: string,
): ValidationResult {
  const errors: { budget?: string; moveIn?: string } = {};

  const budgetText = (rawBudget ?? "").replace(/[$,\s]/g, "");
  const budget = Number(budgetText);
  if (budgetText === "" || !Number.isFinite(budget)) {
    errors.budget = "Enter your monthly budget in dollars.";
  } else if (budget < MIN_BUDGET || budget > MAX_BUDGET) {
    errors.budget = `Budget must be between $${MIN_BUDGET} and $${MAX_BUDGET.toLocaleString("en-US")}.`;
  }

  const moveIn = (rawMoveIn ?? "").trim();
  if (!isRealDate(moveIn)) {
    errors.moveIn = "Pick a move-in date.";
  } else if (moveIn < today) {
    errors.moveIn = "Move-in date can't be in the past.";
  } else if (moveIn > addDays(today, MAX_DAYS_AHEAD)) {
    errors.moveIn = "Pick a move-in date within the next year.";
  }

  if (errors.budget || errors.moveIn) return { ok: false, errors };
  return { ok: true, value: { budget: Math.floor(budget), moveIn } };
}

/** Today's date in Texas (Central time) as YYYY-MM-DD. */
export function todayInTexas(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Whole days from one YYYY-MM-DD date to another (negative if `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}
