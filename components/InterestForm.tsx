"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitInterest } from "@/app/buildings/[id]/actions";
import type { InterestState } from "@/lib/lead";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { AlertIcon, CheckIcon } from "./ui/icons";
import { Select } from "./ui/Select";

type Props = {
  buildingId: string;
  buildingName: string;
  plans: { value: string; label: string }[];
  moveIn: string | null;
  budget: number | null;
};

const initial: InterestState = { status: "idle" };

export function InterestForm({ buildingId, buildingName, plans, moveIn, budget }: Props) {
  const [state, formAction, pending] = useActionState(submitInterest, initial);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const done = state.status === "success" || state.status === "duplicate";

  // Move focus to the confirmation so screen-reader users hear it.
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  if (done) {
    return (
      <div className="text-center" role="status">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-success-soft text-success-text">
          <CheckIcon className="size-6" />
        </span>
        <h3 ref={doneRef} tabIndex={-1} className="mt-4 text-lg font-semibold">
          {state.status === "duplicate"
            ? "You're already on our list"
            : "Thanks, we got it!"}
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
          {state.status === "duplicate"
            ? `You've already told us you're interested in ${buildingName}. We'll be in touch.`
            : `We'll email ${state.email || "you"} about ${buildingName}.`}
        </p>
      </div>
    );
  }

  const errors = state.status === "invalid" ? state.errors : {};
  const values =
    state.status === "invalid" ? state.values : { email: "", consent: false };

  return (
    <form action={formAction} noValidate className="space-y-5">
      <input type="hidden" name="buildingId" value={buildingId} />
      {moveIn && <input type="hidden" name="moveIn" value={moveIn} />}
      {budget && <input type="hidden" name="budget" value={budget} />}

      {/* Spam trap: hidden from people and screen readers, bots fill it in. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="hr_trap">Leave this empty</label>
        <input id="hr_trap" name="hr_trap" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {errors.form && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-sm text-danger-text"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {errors.form}
        </p>
      )}

      <Field
        id="email"
        name="email"
        type="email"
        label="Your email"
        inputMode="email"
        autoComplete="email"
        placeholder="name@example.com"
        defaultValue={values.email}
        error={errors.email}
        required
      />

      {plans.length > 1 && (
        <Select
          id="floorPlanId"
          name="floorPlanId"
          label="Floor plan you like"
          placeholder="Any floor plan"
          options={plans}
          defaultValue=""
        />
      )}

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            defaultChecked={values.consent}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-0.5 size-5 shrink-0 cursor-pointer accent-brand"
          />
          <span>Honest Rent may email me about this apartment.</span>
        </label>
        {errors.consent && (
          <p
            id="consent-error"
            className="mt-1.5 flex items-start gap-1.5 text-sm text-danger-text"
          >
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {errors.consent}
          </p>
        )}
      </div>

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
            Sending…
          </>
        ) : (
          "I'm interested"
        )}
      </Button>

      <p className="text-xs text-text-muted">
        We only use your email to help you with this apartment. We never ask for your SSN,
        credit score or ID.
      </p>
    </form>
  );
}
