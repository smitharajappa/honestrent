"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { CheckIcon } from "../ui/icons";
import { useAuth } from "./AuthContext";

/** Google or an email link. No passwords: we never store one. */
export function SignInForm({ next }: { next?: string }) {
  const { signInWithEmail, signInWithGoogle, available, googleEnabled, ready } =
    useAuth();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
      setError("Enter a valid email, like name@example.com.");
      return;
    }
    setError(null);
    setState("sending");
    const problem = await signInWithEmail(clean, next);
    if (problem) {
      setError(problem);
      setState("idle");
    } else {
      setState("sent");
    }
  }

  if (!ready) return <p className="text-sm text-text-muted">One moment…</p>;

  if (!available) {
    return (
      <p className="rounded-xl bg-surface-muted p-4 text-sm text-text-muted">
        Sign-in isn&apos;t set up on this copy of the site yet. Everything else works
        without it.
      </p>
    );
  }

  if (state === "sent") {
    return (
      <div role="status" className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-success-soft text-success-text">
          <CheckIcon className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">Check your email</h2>
        <p className="mt-1 text-sm text-text-muted">
          We sent a sign-in link to <strong className="text-text">{email.trim()}</strong>.
          Open it on this device. It works once and expires soon.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-3 min-h-11 text-sm font-semibold text-brand-text underline underline-offset-2"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {googleEnabled && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={async () => {
              const problem = await signInWithGoogle(next);
              if (problem) setError(problem);
            }}
          >
            Continue with Google
          </Button>
          <p className="text-center text-xs text-text-muted">or</p>
        </>
      )}
      <form onSubmit={sendLink} noValidate className="space-y-3">
        <Field
          id="signin-email"
          name="email"
          type="email"
          label="Email"
          hint="We'll email you a link. No password."
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error ?? undefined}
        />
        <Button type="submit" size="lg" className="w-full" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Email me a sign-in link"}
        </Button>
      </form>
    </div>
  );
}
