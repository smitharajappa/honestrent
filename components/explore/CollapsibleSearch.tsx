"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate, formatUsd } from "@/lib/format";
import { ChevronDownIcon, SearchIcon } from "../ui/icons";

/**
 * After a search, the big form folds into one line ("Anywhere in DFW · Under $2,200/mo ·
 * Move in by Dec 15") so the results are on screen. Any link to #search opens it again.
 * Without scripts the form is simply open.
 */
export function CollapsibleSearch({
  area,
  budget,
  moveIn,
  children,
}: {
  area: string | null;
  budget: number;
  moveIn: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  // Fold after the page loads (so it is open if scripts are off), and reopen on "Edit search".
  useEffect(() => {
    setOpen(false);
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (a && /#search$/.test(a.getAttribute("href") ?? "")) {
        setOpen(true);
        requestAnimationFrame(() =>
          box.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={box}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="search-form"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-12 w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-text">
            <SearchIcon className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">
              {area ?? "Anywhere in DFW"} · Under {formatUsd(budget)}/mo
            </span>
            <span className="block truncate text-xs text-text-muted">
              Move in by {formatDate(moveIn)} · {open ? "Hide" : "Edit search"}
            </span>
          </span>
        </span>
        <ChevronDownIcon
          className={`size-5 shrink-0 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div id="search-form" hidden={!open} className="mt-4 border-t border-border pt-5">
        {children}
      </div>
    </div>
  );
}
