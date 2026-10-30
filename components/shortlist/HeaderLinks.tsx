"use client";

import Link from "next/link";
import { CompareIcon, HeartIcon } from "../ui/icons";
import { useShortlist } from "./ShortlistContext";

/** "Saved (2)" and "Compare (1)" links in the header. */
export function HeaderLinks() {
  const { saved, compare, ready } = useShortlist();
  const link =
    "inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-text hover:bg-surface-muted";
  return (
    <nav aria-label="Your shortlist" className="flex items-center gap-1">
      <Link href="/saved" className={link}>
        <HeartIcon className="size-4" filled={ready && saved.length > 0} />
        <span>
          Saved<span className="sr-only"> buildings</span>
          {ready && saved.length > 0 && (
            <span className="tabular-nums"> ({saved.length})</span>
          )}
        </span>
      </Link>
      <Link href="/compare" className={link}>
        <CompareIcon className="size-4" />
        <span>
          Compare
          {ready && compare.length > 0 && (
            <span className="tabular-nums"> ({compare.length})</span>
          )}
        </span>
      </Link>
    </nav>
  );
}
