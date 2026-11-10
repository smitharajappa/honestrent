"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buyDemoPass, previewPass, type DemoPurchase } from "@/app/actions/plus";
import { formatDate } from "@/lib/format";
import { dollars, includesRoommates, passById, PASSES, type PassId } from "@/lib/plus";
import { useAuth } from "../auth/AuthContext";
import { PASS_CHANGED } from "../auth/usePlusStatus";
import { Badge } from "../ui/Badge";
import { Button, ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import { InfoNote } from "../ui/InfoNote";
import { CheckIcon, LockIcon } from "../ui/icons";

type Step = "review" | "paying" | "done";

const STEPS: { id: Step; label: string }[] = [
  { id: "review", label: "Review" },
  { id: "paying", label: "Pay" },
  { id: "done", label: "Done" },
];

function Stepper({ step }: { step: Step }) {
  const at = STEPS.findIndex((s) => s.id === step);
  return (
    <ol aria-label="Checkout steps" className="flex items-center gap-2 text-sm">
      {STEPS.map((s, i) => (
        <li
          key={s.id}
          aria-current={i === at ? "step" : undefined}
          className={`flex items-center gap-2 ${i <= at ? "font-semibold text-text" : "text-text-muted"}`}
        >
          <span
            className={`grid size-6 place-items-center rounded-full text-xs ${
              i < at
                ? "bg-brand text-brand-fg"
                : i === at
                  ? "border-2 border-brand text-brand-text"
                  : "border border-border-strong"
            }`}
          >
            {i < at ? <CheckIcon className="size-3.5" /> : i + 1}
          </span>
          {s.label}
          {i < STEPS.length - 1 && <span aria-hidden="true">·</span>}
        </li>
      ))}
    </ol>
  );
}

const INCLUDED = (id: PassId) => [
  "Drive times from every apartment to up to 5 places you add",
  includesRoommates(id)
    ? "Roommate matches, percentages and introductions"
    : "Roommate matches are not part of the 1-week pass (they start at 2 weeks)",
  "Search and real cost: always free",
];

/**
 * A demo checkout: it shows the whole buying flow and then adds the pass to the account, but no
 * card is read and no money moves. When real payments arrive, the "Pay" step is replaced by
 * Stripe's page and everything around it stays the same.
 */
export function Checkout({ initialPass }: { initialPass: PassId }) {
  const { accessToken, user, ready, available } = useAuth();
  const [pass, setPass] = useState<PassId>(initialPass);
  const [step, setStep] = useState<Step>("review");
  const [span, setSpan] = useState<{ startsAt: string; endsAt: string } | null>(null);
  const [result, setResult] = useState<Extract<DemoPurchase, { ok: true }> | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);
  const p = passById(pass);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    previewPass(accessToken, pass).then((w) => !cancelled && setSpan(w));
    return () => {
      cancelled = true;
    };
  }, [accessToken, pass]);

  async function pay() {
    setProblem(null);
    setStep("paying");
    setPhase(0);
    // A short pause so the steps can be read; the pass is added while it plays.
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const timer1 = wait(900).then(() => setPhase(1));
    const [r] = await Promise.all([buyDemoPass(accessToken, pass), timer1, wait(1700)]);
    if (r.ok) {
      window.dispatchEvent(new Event(PASS_CHANGED));
      setResult(r);
      setStep("done");
    } else {
      setProblem(r.error);
      setStep("review");
    }
  }

  if (!ready) return <p className="text-text-muted">One moment…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <div className="mt-3">
          <Stepper step={step} />
        </div>
      </div>

      <InfoNote>
        <strong>Demo checkout.</strong> No card is read and nothing is charged. It shows
        how buying a pass will work, and adds the pass to your account.
      </InfoNote>

      {!available || !user ? (
        <Card className="p-6">
          <h2 className="text-lg font-bold">Sign in to check out</h2>
          <p className="mt-1 text-text-muted">
            Your pass is saved to your account, so you need to sign in first.
          </p>
          {available && (
            <ButtonLink
              href={`/sign-in?next=${encodeURIComponent(`/plus/checkout?pass=${pass}`)}`}
              className="mt-4"
            >
              Sign in
            </ButtonLink>
          )}
        </Card>
      ) : step === "done" && result ? (
        <Card className="p-6 text-center" aria-live="polite">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success-text">
            <CheckIcon className="size-7" />
          </span>
          <h2 className="mt-4 text-2xl font-bold">You have the {p.name} pass</h2>
          <p className="mt-1 tabular-nums text-text-muted">
            {formatDate(result.startsAt.slice(0, 10))} to{" "}
            {formatDate(result.endsAt.slice(0, 10))} · {p.days} days
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Demo purchase: {dollars(p.cents)} was not charged.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {includesRoommates(pass) && (
              <ButtonLink href="/roommates">Find a roommate</ButtonLink>
            )}
            <ButtonLink href="/account#pass" variant="secondary">
              See my pass
            </ButtonLink>
            <ButtonLink href="/" variant="ghost">
              Back to apartments
            </ButtonLink>
          </div>
        </Card>
      ) : step === "paying" ? (
        <Card className="p-6" aria-live="polite">
          <h2 className="text-lg font-bold">Processing (demo)…</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {["Checking the test card", "Adding your pass"].map((label, i) => (
              <li key={label} className="flex items-center gap-3">
                {phase > i ? (
                  <span className="grid size-6 place-items-center rounded-full bg-success-soft text-success-text">
                    <CheckIcon className="size-3.5" />
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="size-6 rounded-full border-2 border-border-strong border-t-brand motion-safe:animate-spin"
                  />
                )}
                {label}
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="text-lg font-bold">Your pass</h2>
              <fieldset className="mt-3 grid grid-cols-2 gap-2">
                <legend className="sr-only">Choose a pass</legend>
                {PASSES.map((x) => (
                  <label key={x.id} className="block cursor-pointer">
                    <input
                      type="radio"
                      name="checkout-pass"
                      value={x.id}
                      checked={pass === x.id}
                      onChange={() => setPass(x.id)}
                      className="peer sr-only"
                    />
                    <span
                      className={`block rounded-xl border p-3 text-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)] ${
                        pass === x.id
                          ? "border-brand bg-brand-soft font-semibold"
                          : "border-border-strong"
                      }`}
                    >
                      {x.name}
                      <span className="block tabular-nums text-text-muted">
                        {dollars(x.cents)} · {x.days} days
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
              <ul className="mt-4 space-y-1.5 text-sm">
                {INCLUDED(pass).map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-success-text" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                Payment <Badge>Demo</Badge>
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                A made-up test card is filled in for you. Real card details are never
                asked for here.
              </p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-text-muted">Card number</dt>
                  <dd className="mt-1 flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 tabular-nums">
                    <LockIcon className="size-4 text-text-muted" />
                    4242 4242 4242 4242
                  </dd>
                </div>
                <div>
                  <dt className="text-text-muted">Expires</dt>
                  <dd className="mt-1 flex min-h-11 items-center rounded-xl border border-border bg-surface-muted px-3 tabular-nums">
                    12 / 34
                  </dd>
                </div>
                <div>
                  <dt className="text-text-muted">Security code</dt>
                  <dd className="mt-1 flex min-h-11 items-center rounded-xl border border-border bg-surface-muted px-3 tabular-nums">
                    •••
                  </dd>
                </div>
              </dl>
            </Card>
          </div>

          <Card className="h-fit p-5">
            <h2 className="text-lg font-bold">Order summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">{p.name} pass</dt>
                <dd className="tabular-nums">{dollars(p.cents)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Length</dt>
                <dd>{p.days} days</dd>
              </div>
              {span && (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">Runs</dt>
                  <dd className="text-right tabular-nums">
                    {formatDate(span.startsAt.slice(0, 10))} to{" "}
                    {formatDate(span.endsAt.slice(0, 10))}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-3 border-t border-border pt-2 text-base font-bold">
                <dt>Total today</dt>
                <dd className="tabular-nums">{dollars(p.cents)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-text-muted">
              One payment. No auto-renew. Buying while a pass is running adds the days
              after it.
            </p>
            {problem && (
              <p role="alert" className="mt-3 text-sm text-danger-text">
                {problem}
              </p>
            )}
            <Button type="button" size="lg" className="mt-4 w-full" onClick={pay}>
              Pay {dollars(p.cents)} (demo)
            </Button>
            <p className="mt-3 text-center text-xs text-text-muted">
              <Link
                href="/plus"
                className="font-semibold text-brand-text underline underline-offset-2"
              >
                Back to passes
              </Link>
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
