"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { joinPlusWaitlist, type WaitlistState } from "@/app/actions/plus";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { dollars, PASSES, perDayCents, savingVsWeekly, type PassId } from "@/lib/plus";
import { useAuth } from "../auth/AuthContext";
import { usePlusStatus } from "../auth/usePlusStatus";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Field } from "../ui/Field";
import { CheckIcon } from "../ui/icons";

const initial: WaitlistState = { status: "idle" };

/** The four passes, the waitlist, and what the signed-in renter has right now. */
export function PlusPanel() {
  const { user } = useAuth();
  const { status } = usePlusStatus();
  const [choice, setChoice] = useState<PassId>("tour");
  const [state, action, pending] = useActionState(joinPlusWaitlist, initial);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const done = state.status === "success" || state.status === "duplicate";

  // Counts that someone saw the offer (no name or email, only a daily number), once a tab.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("honestrent.plus.seen")) return;
      sessionStorage.setItem("honestrent.plus.seen", "1");
    } catch {
      /* private window: count it anyway */
    }
    void getBrowserSupabase()?.rpc("record_plus_view");
  }, []);

  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  const errors = state.status === "invalid" ? state.errors : {};
  const demoOpen = status?.signedIn && status.demoOpen;

  return (
    <div>
      {status?.signedIn && (
        <p role="status" className="mb-6 rounded-xl bg-surface-muted p-4 text-sm">
          Signed in as <strong>{status.email}</strong>.{" "}
          {status.plusUntil
            ? `Your pass runs until ${new Date(status.plusUntil).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
            : demoOpen
              ? "Honest Rent Plus features are free for you during the demo."
              : "You don't have a pass yet."}
        </p>
      )}

      <fieldset className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <legend className="sr-only">Choose the pass you would want</legend>
        {PASSES.map((p) => {
          const on = choice === p.id;
          return (
            <label key={p.id} className="relative block cursor-pointer">
              <input
                type="radio"
                name="pass-choice"
                value={p.id}
                checked={on}
                onChange={() => setChoice(p.id)}
                className="peer sr-only"
              />
              <Card
                className={`h-full p-4 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)] ${
                  on ? "border-brand bg-brand-soft" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-lg font-bold">{p.name}</p>
                  {p.badge && (
                    <Badge tone={p.badge === "Best value" ? "success" : "accent"}>
                      {p.badge}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-text-muted">{p.days} days</p>
                <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">
                  {dollars(p.cents)}
                </p>
                <p className="text-xs text-text-muted tabular-nums">
                  {dollars(perDayCents(p))} a day
                  {savingVsWeekly(p) > 0 && ` · save ${savingVsWeekly(p)}%`}
                </p>
                <p className="mt-2 text-sm text-text-muted">{p.blurb}</p>
                {on && (
                  <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-text">
                    <CheckIcon className="size-4" /> Your pick
                  </p>
                )}
              </Card>
            </label>
          );
        })}
      </fieldset>
      <p className="mt-3 text-sm text-text-muted">
        Pay once. No auto-renew. Prices are planned and may change. Nothing is charged
        yet.
      </p>

      <Card className="mt-6 p-5">
        {done ? (
          <div role="status" className="text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-success-soft text-success-text">
              <CheckIcon className="size-6" />
            </span>
            <h2 ref={doneRef} tabIndex={-1} className="mt-4 text-lg font-semibold">
              {state.status === "duplicate"
                ? "You're already on the list"
                : "You're on the list"}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              We&apos;ll email you once when passes open. We won&apos;t charge you.
            </p>
          </div>
        ) : (
          <form action={action} noValidate className="space-y-4">
            <h2 className="text-lg font-semibold">Get an email when passes open</h2>
            <input type="hidden" name="pass" value={choice} />
            <div aria-hidden="true" className="hidden">
              <label>
                Leave this empty
                <input name="hr_trap" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <Field
              id="plus-email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              defaultValue={user?.email ?? ""}
              error={errors.email}
            />
            <label className="flex min-h-11 items-start gap-2 text-sm">
              <input type="checkbox" name="consent" className="mt-1 size-4" />
              <span>
                Email me once when Honest Rent Plus opens. I can ignore it.
                {errors.consent && (
                  <span className="block text-danger-text">{errors.consent}</span>
                )}
              </span>
            </label>
            {errors.pass && <p className="text-sm text-danger-text">{errors.pass}</p>}
            {errors.form && (
              <p role="alert" className="text-sm text-danger-text">
                {errors.form}
              </p>
            )}
            <Button type="submit" size="lg" disabled={pending}>
              {pending
                ? "Saving…"
                : `Join the waitlist for ${PASSES.find((p) => p.id === choice)!.name}`}
            </Button>
          </form>
        )}
      </Card>

      {!user && (
        <p className="mt-4 text-sm text-text-muted">
          Already have a pass?{" "}
          <Link
            href="/sign-in?next=/plus"
            className="font-semibold text-brand-text underline underline-offset-2"
          >
            Sign in
          </Link>
          .
        </p>
      )}
    </div>
  );
}
