"use client";

import Link from "next/link";
import { useAuth } from "../auth/AuthContext";
import { CompareIcon, HeartIcon } from "../ui/icons";
import { useShortlist } from "./ShortlistContext";

/** "Saved (2)" and "Compare (1)" links in the header. */
export function HeaderLinks() {
  const { saved, compare, ready } = useShortlist();
  const { user, ready: authReady, available } = useAuth();
  const link =
    "inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold whitespace-nowrap text-text hover:bg-surface-muted";
  return (
    <nav aria-label="Your shortlist" className="flex items-center gap-1">
      <Link href="/saved" className={link}>
        <HeartIcon className="size-4" filled={ready && saved.length > 0} />
        <span>
          <span className="sr-only sm:not-sr-only">Saved</span>
          <span className="sr-only"> buildings</span>
          {ready && saved.length > 0 && (
            <span className="tabular-nums"> ({saved.length})</span>
          )}
        </span>
      </Link>
      <Link href="/compare" className={link}>
        <CompareIcon className="size-4" />
        <span>
          <span className="sr-only sm:not-sr-only">Compare</span>
          {ready && compare.length > 0 && (
            <span className="tabular-nums"> ({compare.length})</span>
          )}
        </span>
      </Link>
      {available && authReady && (
        <>
          <Link href="/plus" className={`${link} max-sm:hidden`}>
            Plus
          </Link>
          {user ? (
            <Link href="/account" className={link} title={user.email ?? undefined}>
              Account
            </Link>
          ) : (
            <Link href="/sign-in" className={`${link} text-brand-text`}>
              Sign in
            </Link>
          )}
        </>
      )}
    </nav>
  );
}
