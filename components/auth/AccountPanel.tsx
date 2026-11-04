"use client";

import Link from "next/link";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Button, ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import { CheckIcon } from "../ui/icons";
import { useAuth } from "./AuthContext";
import { PassStatus } from "../plus/PassStatus";
import { usePlusStatus } from "./usePlusStatus";

// The two things we keep in this browser. Cleared on request when an account is deleted.
const DEVICE_KEYS = [
  "honestrent.shortlist.v1",
  "honestrent.places.v1",
  "swelt.shortlist.v1", // the old name
  "swelt.places.v1",
];

/** Who is signed in, what they have, sign out, and delete the account. */
export function AccountPanel() {
  const { user, ready, available, signOut } = useAuth();
  const { status } = usePlusStatus();
  const [sure, setSure] = useState(false);
  const [alsoDevice, setAlsoDevice] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  if (!ready) return <p className="text-text-muted">One moment…</p>;

  if (deleted) {
    return (
      <div role="status" className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-success-soft text-success-text">
          <CheckIcon className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">Your account is deleted</h2>
        <p className="mt-1 text-sm text-text-muted">
          Your sign-in record and any passes are gone.
          {alsoDevice
            ? " Saved places and apartments on this device are cleared too."
            : ""}
        </p>
        <ButtonLink href="/" className="mt-4">
          Back to search
        </ButtonLink>
      </div>
    );
  }

  if (!available || !user) {
    return (
      <div>
        <p className="text-text-muted">
          {available
            ? "You're not signed in."
            : "Sign-in isn't set up on this copy of the site."}
        </p>
        {available && (
          <ButtonLink href="/sign-in?next=/account" className="mt-4">
            Sign in
          </ButtonLink>
        )}
      </div>
    );
  }

  async function deleteAccount() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setWorking(true);
    setError(null);
    const { error: failed } = await supabase.rpc("delete_my_account");
    if (failed) {
      setWorking(false);
      setError("We couldn't delete your account just now. Please try again in a minute.");
      return;
    }
    if (alsoDevice) {
      for (const key of DEVICE_KEYS) {
        try {
          localStorage.removeItem(key);
        } catch {
          /* blocked storage: nothing to clear */
        }
      }
    }
    await signOut();
    setDeleted(true);
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="font-bold">Details</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">Email</dt>
            <dd className="font-medium break-all">{user.email}</dd>
          </div>
          <div id="pass" className="flex justify-between gap-3 scroll-mt-24">
            <dt className="text-text-muted">Honest Rent Plus</dt>
            <dd className="text-right font-medium">
              {!status || !status.signedIn ? (
                "Checking…"
              ) : (
                <PassStatus pass={status.pass} demoOpen={status.demoOpen} />
              )}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={signOut}>
            Sign out
          </Button>
          <ButtonLink href="/plus" variant="ghost">
            {status?.signedIn && status.pass
              ? "Buy another pass"
              : "See Honest Rent Plus"}
          </ButtonLink>
        </div>
        <p className="mt-4 text-xs text-text-muted">
          What we keep, and what we don&apos;t, is on the{" "}
          <Link
            href="/privacy"
            className="font-semibold text-brand-text underline underline-offset-2"
          >
            privacy page
          </Link>
          .
        </p>
      </Card>

      <Card className="border-danger-text/40 p-5">
        <h2 className="font-bold">Delete my account</h2>
        <p className="mt-1 text-sm text-text-muted">
          This removes your sign-in record and any passes. It can&apos;t be undone. A
          waitlist email isn&apos;t tied to your account, so it stays unless you ask us to
          remove it.
        </p>
        <label className="mt-4 flex min-h-11 items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={alsoDevice}
            onChange={(e) => setAlsoDevice(e.target.checked)}
            className="mt-1 size-4"
          />
          <span>Also clear saved places and apartments on this device</span>
        </label>
        <label className="flex min-h-11 items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={sure}
            onChange={(e) => setSure(e.target.checked)}
            className="mt-1 size-4"
          />
          <span>I understand this can&apos;t be undone</span>
        </label>
        {error && (
          <p role="alert" className="mt-2 text-sm text-danger-text">
            {error}
          </p>
        )}
        <Button
          type="button"
          variant="secondary"
          className="mt-3 border-danger-text text-danger-text hover:border-danger-text hover:text-danger-text"
          disabled={!sure || working}
          onClick={deleteAccount}
        >
          {working ? "Deleting…" : "Delete my account"}
        </Button>
      </Card>
    </div>
  );
}
