"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitBill, type BillState } from "@/app/actions/bill";
import { BILL_ITEMS } from "@/lib/billReport";
import { formatUsd } from "@/lib/format";
import { Button, ButtonLink } from "./ui/Button";
import { Field } from "./ui/Field";
import { AlertIcon, CheckIcon, LockIcon } from "./ui/icons";
import { Select } from "./ui/Select";

type Props = {
  buildings: { id: string; name: string }[];
  months: { value: string; label: string }[];
  defaultBuildingId?: string;
};

const BEDROOMS = [0, 1, 2, 3, 4].map((n) => ({
  value: String(n),
  label: n === 0 ? "Studio" : `${n} bedroom${n === 1 ? "" : "s"}`,
}));

export function ShareBillForm({ buildings, months, defaultBuildingId }: Props) {
  const [state, action, pending] = useActionState<BillState, FormData>(submitBill, {
    status: "idle",
  });
  const doneRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (state.status === "done") doneRef.current?.focus();
  }, [state.status]);

  if (state.status === "done") {
    return (
      <div role="status" className="py-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-success-soft text-success-text">
          <CheckIcon className="size-6" />
        </span>
        <h2 ref={doneRef} tabIndex={-1} className="mt-4 text-xl font-bold">
          Thank you!
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
          Once we&apos;ve checked it and at least 3 renters have shared for the same
          building and size, the range shows on Honest Rent.
        </p>
        <ButtonLink href="/" className="mt-5">
          Back to search
        </ButtonLink>
      </div>
    );
  }

  const errors = state.status === "invalid" ? state.errors : {};

  return (
    <form action={action} noValidate className="space-y-6">
      {/* Spam trap: hidden from people and screen readers, bots fill it in. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="hr_trap">Leave this empty</label>
        <input id="hr_trap" name="hr_trap" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Select
            id="buildingId"
            name="buildingId"
            label="Building"
            placeholder="Choose…"
            options={buildings.map((b) => ({ value: b.id, label: b.name }))}
            defaultValue={defaultBuildingId ?? ""}
          />
          {errors.building && <ErrorText>{errors.building}</ErrorText>}
        </div>
        <div>
          <Select
            id="billMonth"
            name="billMonth"
            label="Bill month"
            placeholder="Choose…"
            options={months}
            defaultValue=""
          />
          {errors.month && <ErrorText>{errors.month}</ErrorText>}
        </div>
        <div>
          <Select
            id="bedrooms"
            name="bedrooms"
            label="Apartment size"
            placeholder="Choose…"
            options={BEDROOMS}
            defaultValue=""
          />
          {errors.bedrooms && <ErrorText>{errors.bedrooms}</ErrorText>}
        </div>
      </div>

      <div role="group" aria-labelledby="amounts-heading">
        <p id="amounts-heading" className="text-sm font-semibold">
          Amounts on that month&apos;s bill
        </p>
        <p className="mt-0.5 text-sm text-text-muted">
          Leave blank anything that wasn&apos;t on your bill. Rent and fixed fees
          aren&apos;t needed.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BILL_ITEMS.map((item) => (
            <Field
              key={item.key}
              id={item.key}
              name={item.key}
              label={item.label}
              prefix="$"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
            />
          ))}
        </div>
        {errors.amounts && <ErrorText>{errors.amounts}</ErrorText>}
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 size-5 shrink-0 cursor-pointer accent-brand"
          />
          <span>
            I&apos;m sharing amounts only, with no names, unit numbers or account numbers.
          </span>
        </label>
        {errors.consent && <ErrorText>{errors.consent}</ErrorText>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm text-text-muted">
          <LockIcon className="mt-0.5 size-4 shrink-0" />
          We store the building, month, size and amounts. Nothing that identifies you.
          Amounts over {formatUsd(1000)} a line are rejected.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          aria-busy={pending}
          className="sm:w-56"
        >
          {pending ? "Sending…" : "Share anonymously"}
        </Button>
      </div>
    </form>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-danger-text">
      <AlertIcon className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}
