"use client";

import { useState } from "react";
import { cn } from "../ui/cn";
import { CompareIcon, HeartIcon } from "../ui/icons";
import { MAX_COMPARE, useShortlist } from "./ShortlistContext";

/** Heart button to save a building on this device. */
export function SaveButton({
  buildingId,
  buildingName,
  className,
}: {
  buildingId: string;
  buildingName: string;
  className?: string;
}) {
  const { isSaved, toggleSaved } = useShortlist();
  const saved = isSaved(buildingId);
  return (
    <button
      type="button"
      onClick={() => toggleSaved(buildingId)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${buildingName} from saved` : `Save ${buildingName}`}
      className={cn(
        "z-10 grid size-11 place-items-center rounded-full bg-surface shadow-card transition-transform duration-150 hover:scale-105 active:scale-95",
        saved ? "text-danger-text" : "text-text",
        className,
      )}
    >
      <HeartIcon className="size-5" filled={saved} />
    </button>
  );
}

/** "Compare" toggle. Up to 3 buildings. */
export function CompareToggle({ buildingId }: { buildingId: string }) {
  const { isComparing, toggleCompare, compare } = useShortlist();
  const [full, setFull] = useState(false);
  const on = isComparing(buildingId);
  return (
    <span className="relative z-10 inline-flex flex-col items-start">
      <button
        type="button"
        aria-pressed={on}
        onClick={() => setFull(!toggleCompare(buildingId))}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold transition-colors",
          on ? "text-brand-text" : "text-text-muted hover:text-text",
        )}
      >
        <CompareIcon className="size-4" />
        {on ? "Comparing" : "Compare"}
      </button>
      {full && !on && compare.length >= MAX_COMPARE && (
        <span role="status" className="px-2 text-xs text-warning-text">
          Compare up to {MAX_COMPARE}. Remove one first.
        </span>
      )}
    </span>
  );
}
