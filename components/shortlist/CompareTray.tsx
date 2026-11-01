"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { ButtonLink } from "../ui/Button";
import { CompareIcon } from "../ui/icons";
import { MAX_COMPARE, useShortlist } from "./ShortlistContext";

/** Floating bar once something is picked to compare. Hidden on the compare page. */
export function CompareTray({ moveIn }: { moveIn?: string }) {
  const { compare, clearCompare, ready } = useShortlist();
  const pathname = usePathname();
  const visible = ready && compare.length > 0 && pathname !== "/compare";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="compare-tray"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4"
        >
          <div
            role="region"
            aria-label="Compare"
            className="flex items-center gap-3 rounded-full border border-border bg-surface py-2 pr-2 pl-5 shadow-raised"
          >
            <CompareIcon className="size-4 text-text-muted" />
            <p className="text-sm font-medium whitespace-nowrap tabular-nums">
              {compare.length} of {MAX_COMPARE} picked
            </p>
            <button
              type="button"
              onClick={clearCompare}
              className="min-h-11 rounded-full px-3 text-sm font-semibold text-text-muted hover:text-text"
            >
              Clear
            </button>
            <ButtonLink
              href={moveIn ? `/compare?moveIn=${moveIn}` : "/compare"}
              className="rounded-full"
            >
              Compare now
            </ButtonLink>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
