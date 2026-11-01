// Approval fit: estimates whether a building is likely to approve a renter,
// using only coarse answers (income range, credit band, ID type).
// We never ask for an SSN, an exact credit score, or immigration status,
// and these answers never leave the renter's device.

export const INCOME_RANGES = [
  { id: "under-30k", label: "Under $30,000", minYearly: 0 },
  { id: "30-45k", label: "$30,000 – $45,000", minYearly: 30_000 },
  { id: "45-60k", label: "$45,000 – $60,000", minYearly: 45_000 },
  { id: "60-80k", label: "$60,000 – $80,000", minYearly: 60_000 },
  { id: "80-100k", label: "$80,000 – $100,000", minYearly: 80_000 },
  { id: "100-150k", label: "$100,000 – $150,000", minYearly: 100_000 },
  { id: "150k-plus", label: "$150,000 or more", minYearly: 150_000 },
] as const;

export const CREDIT_BANDS = [
  { id: "no-us-credit", label: "No US credit yet", minScore: null },
  { id: "under-580", label: "Under 580", minScore: 300 },
  { id: "580-619", label: "580 – 619", minScore: 580 },
  { id: "620-679", label: "620 – 679", minScore: 620 },
  { id: "680-739", label: "680 – 739", minScore: 680 },
  { id: "740-plus", label: "740 or higher", minScore: 740 },
] as const;

export const ID_TYPES = [
  { id: "ssn", label: "SSN" },
  { id: "itin", label: "ITIN" },
  { id: "passport", label: "Passport only" },
] as const;

export type IncomeId = (typeof INCOME_RANGES)[number]["id"];
export type CreditId = (typeof CREDIT_BANDS)[number]["id"];
export type IdTypeId = (typeof ID_TYPES)[number]["id"];

export type ApprovalProfile = { income: IncomeId; credit: CreditId; idType: IdTypeId };

export type ApprovalCriteria = {
  min_income_multiple: number;
  min_credit_score: number | null;
  accepts_no_ssn: boolean;
  accepts_guarantor: boolean;
  accepts_international_credit: boolean;
  /** Finer ID rules. Missing or null = not asked yet: falls back to accepts_no_ssn. */
  accepts_itin?: boolean | null;
  accepts_passport_only?: boolean | null;
};

/** Copies only the approval fields, so the browser receives no more data than it needs. */
export function pickCriteria(source: ApprovalCriteria): ApprovalCriteria {
  return {
    min_income_multiple: source.min_income_multiple,
    min_credit_score: source.min_credit_score,
    accepts_no_ssn: source.accepts_no_ssn,
    accepts_guarantor: source.accepts_guarantor,
    accepts_international_credit: source.accepts_international_credit,
    accepts_itin: source.accepts_itin ?? null,
    accepts_passport_only: source.accepts_passport_only ?? null,
  };
}

/** Whether the building accepts this kind of ID, plus the reason if it doesn't. */
export function idCheck(
  idType: IdTypeId,
  c: ApprovalCriteria,
): { ok: true } | { ok: false; reason: string } {
  if (idType === "ssn") return { ok: true };
  const itin = c.accepts_itin ?? c.accepts_no_ssn;
  const passport = c.accepts_passport_only ?? c.accepts_no_ssn;
  if (idType === "itin" && itin) return { ok: true };
  if (idType === "passport" && passport) return { ok: true };
  if (idType === "passport" && itin) {
    return { ok: false, reason: "This building needs an SSN or an ITIN." };
  }
  return { ok: false, reason: "This building requires an SSN." };
}

function ssnRuleText(c: ApprovalCriteria): string {
  const itin = c.accepts_itin ?? c.accepts_no_ssn;
  const passport = c.accepts_passport_only ?? c.accepts_no_ssn;
  if (itin && passport) return "Not required (ITIN or passport OK)";
  if (itin) return "Not required with an ITIN (passport only not accepted)";
  if (passport) return "Not required (passport OK)";
  return "Required";
}

/** The building's approval rules in plain words, for the detail page. */
export function describeCriteria(
  c: ApprovalCriteria,
): { label: string; value: string }[] {
  return [
    {
      label: "Income",
      value: `At least ${multiple(c.min_income_multiple)} the monthly rent`,
    },
    {
      label: "Credit score",
      value:
        c.min_credit_score === null ? "No minimum" : `${c.min_credit_score} or higher`,
    },
    {
      label: "SSN",
      value: ssnRuleText(c),
    },
    { label: "Guarantor", value: c.accepts_guarantor ? "Accepted" : "Not accepted" },
    {
      label: "International credit report",
      value: c.accepts_international_credit ? "Accepted" : "Not accepted",
    },
  ];
}

export type FitLevel = "good" | "guarantor" | "unlikely";
export type Fit = { level: FitLevel; reason: string };

export const FIT_LABELS: Record<FitLevel, string> = {
  good: "Good fit",
  guarantor: "Possible with guarantor",
  unlikely: "Unlikely",
};

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

/** 3 -> "3×", 2.75 -> "2.75×" */
const multiple = (n: number) => `${Number(n.toFixed(2))}×`;

/**
 * Income uses the bottom of the renter's range so we never over-promise.
 * Income is compared to advertised rent, which is how buildings usually screen.
 */
export function approvalFit(
  profile: ApprovalProfile,
  criteria: ApprovalCriteria,
  rentUsd: number,
): Fit {
  const id = idCheck(profile.idType, criteria);
  if (!id.ok) return { level: "unlikely", reason: id.reason };

  const problems: string[] = [];

  const income = INCOME_RANGES.find((r) => r.id === profile.income)!;
  const neededMonthly = Math.ceil(criteria.min_income_multiple * rentUsd);
  if (income.minYearly / 12 < neededMonthly) {
    problems.push(
      `needs ${usd(neededMonthly)}/mo income (${multiple(criteria.min_income_multiple)} rent)`,
    );
  }

  const credit = CREDIT_BANDS.find((c) => c.id === profile.credit)!;
  const usesInternationalCredit =
    credit.minScore === null && criteria.min_credit_score !== null;
  if (criteria.min_credit_score !== null) {
    if (credit.minScore === null) {
      if (!criteria.accepts_international_credit)
        problems.push("needs US credit history");
    } else if (credit.minScore < criteria.min_credit_score) {
      problems.push(`needs a ${criteria.min_credit_score}+ credit score`);
    }
  }

  if (problems.length === 0) {
    return {
      level: "good",
      reason:
        criteria.min_credit_score === null
          ? "No minimum credit score, and your income meets the rule."
          : usesInternationalCredit
            ? "Accepts international credit reports, and your income meets the rule."
            : "Your income and credit meet this building's rules.",
    };
  }

  const joined = problems.join(" and ");
  const summary = joined.charAt(0).toUpperCase() + joined.slice(1);
  if (criteria.accepts_guarantor) {
    return { level: "guarantor", reason: `${summary}. A guarantor can cover the gap.` };
  }
  return { level: "unlikely", reason: `${summary}, and no guarantors are accepted.` };
}

/** True when every answer is filled in with a known option. */
export function isCompleteProfile(p: Partial<ApprovalProfile>): p is ApprovalProfile {
  return (
    INCOME_RANGES.some((r) => r.id === p.income) &&
    CREDIT_BANDS.some((c) => c.id === p.credit) &&
    ID_TYPES.some((t) => t.id === p.idType)
  );
}

/** "$60,000 – $80,000 income · 620 – 679 credit · SSN", so renters see what a fit is based on. */
export function describeAnswers(profile: ApprovalProfile): string {
  const income = INCOME_RANGES.find((r) => r.id === profile.income)!.label;
  const credit = CREDIT_BANDS.find((c) => c.id === profile.credit)!;
  const id = ID_TYPES.find((t) => t.id === profile.idType)!.label;
  const creditText = credit.minScore === null ? credit.label : `${credit.label} credit`;
  return `${income} income · ${creditText} · ${id}`;
}
