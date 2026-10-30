"use client";

import { CREDIT_BANDS, ID_TYPES, INCOME_RANGES, isCompleteProfile } from "@/lib/approval";
import { Button } from "../ui/Button";
import { LockIcon } from "../ui/icons";
import { Select } from "../ui/Select";
import { Tip } from "../ui/Tip";
import { useApproval } from "./ApprovalContext";

const toOptions = (list: readonly { id: string; label: string }[]) =>
  list.map((item) => ({ value: item.id, label: item.label }));

/**
 * The 3 approval questions, shown inside the main search (approval-first).
 * The selects have no `name`, so they're never submitted or put in the URL.
 */
export function ApprovalSelects() {
  const { answers, setAnswers } = useApproval();
  return (
    <>
      <Select
        id="income"
        label="Yearly income"
        options={toOptions(INCOME_RANGES)}
        value={answers.income ?? ""}
        onChange={(e) =>
          setAnswers({
            ...answers,
            income: (e.target.value || undefined) as typeof answers.income,
          })
        }
      />
      <Select
        id="credit"
        label="Credit score"
        options={toOptions(CREDIT_BANDS)}
        value={answers.credit ?? ""}
        onChange={(e) =>
          setAnswers({
            ...answers,
            credit: (e.target.value || undefined) as typeof answers.credit,
          })
        }
      />
      <Select
        id="idType"
        label="ID you have"
        options={toOptions(ID_TYPES)}
        value={answers.idType ?? ""}
        onChange={(e) =>
          setAnswers({
            ...answers,
            idType: (e.target.value || undefined) as typeof answers.idType,
          })
        }
      />
    </>
  );
}

/** Privacy promise, help and "Clear answers" under the approval questions. */
export function ApprovalFooter() {
  const { answers, setAnswers } = useApproval();
  const answered = Object.values(answers).filter(Boolean).length;
  const complete = isCompleteProfile(answers);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <p className="flex items-center gap-1.5 text-sm text-text-muted">
        <LockIcon className="size-4 shrink-0" />
        Private: stays in this browser tab. We never ask for your SSN or exact score.
      </p>
      <Tip summary="What do these mean?">
        <p>
          <strong className="font-semibold">ITIN:</strong> a US tax ID for people who
          can&apos;t get an SSN. Many newcomers have one.
        </p>
        <p>
          <strong className="font-semibold">Guarantor:</strong> someone (or a guarantor
          company) who promises to pay if you can&apos;t. Guarantor companies usually
          charge about one month&apos;s rent.
        </p>
        <p>
          <strong className="font-semibold">International credit report:</strong> your
          credit history from your home country, translated for US landlords.
        </p>
      </Tip>
      <p className="sr-only" aria-live="polite">
        {complete ? "Approval fit will show on each apartment." : ""}
      </p>
      {answered > 0 && (
        <Button variant="ghost" onClick={() => setAnswers({})} className="px-2">
          Clear answers
        </Button>
      )}
    </div>
  );
}
