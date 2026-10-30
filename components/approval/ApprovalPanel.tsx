"use client";

import { CREDIT_BANDS, ID_TYPES, INCOME_RANGES, isCompleteProfile } from "@/lib/approval";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { LockIcon } from "../ui/icons";
import { Select } from "../ui/Select";
import { Tip } from "../ui/Tip";
import { useApproval } from "./ApprovalContext";

const toOptions = (list: readonly { id: string; label: string }[]) =>
  list.map((item) => ({ value: item.id, label: item.label }));

export function ApprovalPanel() {
  const { answers, setAnswers } = useApproval();
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const complete = isCompleteProfile(answers);

  return (
    <Card
      as="section"
      id="approval"
      aria-labelledby="approval-heading"
      className="mt-4 scroll-mt-20 p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="approval-heading" className="text-lg font-semibold">
            Will they approve me?
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Answer 3 quick questions to see your chances at each building.
          </p>
        </div>
        <Badge>Optional</Badge>
      </div>

      {/* Not a <form>: these answers are never submitted anywhere. */}
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
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
      </div>

      <Tip summary="What do these mean?" className="mt-3">
        <p>
          <strong className="font-semibold">ITIN:</strong> a US tax ID for people who
          can&apos;t get an SSN. Many newcomers have one.
        </p>
        <p>
          <strong className="font-semibold">Guarantor:</strong> someone (or a guarantor
          company) who promises to pay if you can&apos;t. Buildings often accept one when
          income or credit is short.
        </p>
        <p>
          <strong className="font-semibold">International credit report:</strong> your
          credit history from your home country, translated for US landlords.
        </p>
      </Tip>

      <p className="mt-2 flex items-start gap-2 text-sm text-text-muted">
        <LockIcon className="mt-0.5 size-4 shrink-0" />
        Your answers stay on this device. They aren&apos;t sent or saved. We never ask for
        your SSN or exact score.
      </p>

      {/* Only shown once there's something to say (no empty gap before answering). */}
      <p className="sr-only" aria-live="polite">
        {complete ? "Fit shown on each apartment." : ""}
      </p>
      {answeredCount > 0 && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-sm font-medium">
            {complete
              ? "Your fit now shows on each apartment."
              : `${3 - answeredCount} more to go.`}
          </p>
          <Button variant="ghost" onClick={() => setAnswers({})}>
            Clear answers
          </Button>
        </div>
      )}
    </Card>
  );
}
