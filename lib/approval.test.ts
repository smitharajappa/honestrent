import { describe, expect, it } from "vitest";
import {
  approvalFit,
  isCompleteProfile,
  pickCriteria,
  type ApprovalCriteria,
  type ApprovalProfile,
} from "./approval";

const strong: ApprovalProfile = { income: "80-100k", credit: "740-plus", idType: "ssn" };

function criteria(overrides: Partial<ApprovalCriteria> = {}): ApprovalCriteria {
  return {
    min_income_multiple: 3,
    min_credit_score: 650,
    accepts_no_ssn: false,
    accepts_guarantor: false,
    accepts_international_credit: false,
    ...overrides,
  };
}

describe("approvalFit", () => {
  it("is a good fit when income, credit and ID all pass", () => {
    // $80k / 12 = $6,667/mo; 3 x $1,500 = $4,500 needed
    expect(approvalFit(strong, criteria(), 1500).level).toBe("good");
  });

  it("is unlikely without an SSN when the building requires one", () => {
    const fit = approvalFit({ ...strong, idType: "passport" }, criteria(), 1500);
    expect(fit).toEqual({ level: "unlikely", reason: "This building requires an SSN." });
  });

  it("accepts ITIN or passport when the building allows no SSN", () => {
    for (const idType of ["itin", "passport"] as const) {
      const fit = approvalFit(
        { ...strong, idType },
        criteria({ accepts_no_ssn: true }),
        1500,
      );
      expect(fit.level).toBe("good");
    }
  });

  it("uses the bottom of the income range and explains what is needed", () => {
    // $45k / 12 = $3,750/mo; 3 x $1,300 = $3,900 needed
    const fit = approvalFit({ ...strong, income: "45-60k" }, criteria(), 1300);
    expect(fit.level).toBe("unlikely");
    expect(fit.reason).toBe(
      "Needs $3,900/mo income (3× rent), and no guarantors are accepted.",
    );
  });

  it("passes income exactly at the required amount", () => {
    // $45k / 12 = $3,750 = 2.5 x $1,500
    const fit = approvalFit(
      { ...strong, income: "45-60k" },
      criteria({ min_income_multiple: 2.5 }),
      1500,
    );
    expect(fit.level).toBe("good");
  });

  it("suggests a guarantor when income or credit falls short and guarantors are allowed", () => {
    const fit = approvalFit(
      { ...strong, credit: "580-619" },
      criteria({ accepts_guarantor: true }),
      1500,
    );
    expect(fit.level).toBe("guarantor");
    expect(fit.reason).toBe("Needs a 650+ credit score. A guarantor can cover the gap.");
  });

  it("lists both problems when income and credit fall short", () => {
    const fit = approvalFit(
      { income: "30-45k", credit: "under-580", idType: "ssn" },
      criteria({ accepts_guarantor: true }),
      1500,
    );
    expect(fit.reason).toBe(
      "Needs $4,500/mo income (3× rent) and needs a 650+ credit score. A guarantor can cover the gap.",
    );
  });

  it("counts no US credit as a pass where international reports are accepted", () => {
    const fit = approvalFit(
      { ...strong, credit: "no-us-credit" },
      criteria({ accepts_international_credit: true }),
      1500,
    );
    expect(fit.level).toBe("good");
    expect(fit.reason).toMatch(/international credit/);
  });

  it("flags no US credit where international reports are not accepted", () => {
    const fit = approvalFit({ ...strong, credit: "no-us-credit" }, criteria(), 1500);
    expect(fit.level).toBe("unlikely");
    expect(fit.reason).toBe("Needs US credit history, and no guarantors are accepted.");
  });

  it("ignores credit when the building has no minimum score", () => {
    const fit = approvalFit(
      { ...strong, credit: "no-us-credit" },
      criteria({ min_credit_score: null }),
      1500,
    );
    expect(fit).toEqual({
      level: "good",
      reason: "No minimum credit score, and your income meets the rule.",
    });
  });

  it("shows decimal income multiples cleanly", () => {
    const fit = approvalFit(
      { ...strong, income: "under-30k" },
      criteria({ min_income_multiple: 2.75 }),
      1000,
    );
    expect(fit.reason).toContain("(2.75× rent)");
  });
});

describe("isCompleteProfile", () => {
  it("needs all three answers with known values", () => {
    expect(isCompleteProfile(strong)).toBe(true);
    expect(isCompleteProfile({ income: "80-100k", credit: "740-plus" })).toBe(false);
    expect(
      isCompleteProfile({
        ...strong,
        idType: "other" as unknown as ApprovalProfile["idType"],
      }),
    ).toBe(false);
  });
});

describe("pickCriteria", () => {
  it("keeps only the approval fields", () => {
    const extra = { ...criteria(), name: "Secret building", floor_plans: [] };
    expect(Object.keys(pickCriteria(extra)).sort()).toEqual([
      "accepts_guarantor",
      "accepts_international_credit",
      "accepts_no_ssn",
      "min_credit_score",
      "min_income_multiple",
    ]);
  });
});
