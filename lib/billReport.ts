// Checks the anonymous "Share your monthly charges" form on the server.
// Only building, month, bedrooms and amounts are accepted. No names, unit
// numbers or screenshots.

import { isUuid } from "./lead";

export const BILL_ITEMS = [
  { key: "water", label: "Water" },
  { key: "sewer", label: "Sewer / wastewater" },
  { key: "trash", label: "Trash (billed by the building)" },
  { key: "drainage", label: "Drainage" },
  { key: "admin", label: "Utility admin or billing fees" },
  { key: "other", label: "Other utility charges" },
] as const;

export type BillItemKey = (typeof BILL_ITEMS)[number]["key"];
const MAX_ITEM = 1000;
const MAX_TOTAL = 2000;

export type BillReport = {
  buildingId: string;
  billMonth: string; // YYYY-MM-01
  bedrooms: number;
  amounts: Record<BillItemKey, number>;
};

export type BillErrors = Partial<
  Record<"building" | "month" | "bedrooms" | "amounts" | "consent", string>
>;

export type BillValidation =
  | { ok: true; value: BillReport }
  | { ok: false; spam: true }
  | { ok: false; spam: false; errors: BillErrors };

const text = (raw: Record<string, unknown>, key: string) =>
  typeof raw[key] === "string" ? (raw[key] as string).trim() : "";

/** "$1,234.50" -> 1234.5; empty -> 0; anything else -> NaN. */
export function parseAmount(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, "");
  if (cleaned === "") return 0;
  return /^\d+(\.\d{1,2})?$/.test(cleaned) ? Number(cleaned) : NaN;
}

/** The last 12 months as YYYY-MM-01, newest first (bills for the current month count). */
export function recentMonths(today: string, count = 12): string[] {
  const [y, m] = today.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    return d.toISOString().slice(0, 10);
  });
}

export function validateBillReport(
  raw: Record<string, unknown>,
  today: string,
): BillValidation {
  if (text(raw, "hr_trap") !== "") return { ok: false, spam: true };
  const errors: BillErrors = {};

  const buildingId = text(raw, "buildingId");
  if (!isUuid(buildingId)) errors.building = "Choose the building.";

  const billMonth = text(raw, "billMonth");
  if (!recentMonths(today).includes(billMonth))
    errors.month = "Choose a month from the last year.";

  const bedrooms = Number(text(raw, "bedrooms"));
  if (!Number.isInteger(bedrooms) || bedrooms < 0 || bedrooms > 5) {
    errors.bedrooms = "Choose the number of bedrooms.";
  }

  const amounts = {} as Record<BillItemKey, number>;
  let bad = false;
  for (const item of BILL_ITEMS) {
    const amount = parseAmount(text(raw, item.key));
    if (Number.isNaN(amount) || amount < 0 || amount > MAX_ITEM) bad = true;
    amounts[item.key] = Number.isNaN(amount) ? 0 : amount;
  }
  const total = Object.values(amounts).reduce((sum, a) => sum + a, 0);
  if (bad) errors.amounts = `Enter amounts in dollars, up to $${MAX_ITEM} each.`;
  else if (total < 1 || total > MAX_TOTAL) {
    errors.amounts = "Enter at least one amount from your bill.";
  }

  if (raw.consent !== "on") {
    errors.consent = "Please confirm you're sharing amounts only.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, spam: false, errors };
  return { ok: true, value: { buildingId, billMonth, bedrooms, amounts } };
}
