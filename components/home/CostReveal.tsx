"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { formatUsd } from "@/lib/format";
import { CountUp } from "../motion/CountUp";

// Made-up numbers for one sample building, shown as an estimate: the point is the shape of the
// gap, not the figures. Real buildings show their own numbers with a last-verified date.
const AD = 1450;
const ROWS = [
  { label: "Required fees (trash, pest, parking)", amount: 85, kind: "add" },
  { label: "Utilities the building bills you", amount: 140, kind: "add" },
  { label: "Move-in deal, spread over the lease", amount: -55, kind: "save" },
] as const;
const REAL = AD + ROWS.reduce((sum, r) => sum + r.amount, 0);
const GAP = REAL - AD;

/**
 * The home page's one big idea in a card: the advertised rent, then each thing the ad leaves
 * out, then what you really pay. It plays once as it scrolls into view, and can be replayed.
 */
export function CostReveal({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <motion.section
      aria-label="Estimate for a sample building: advertised rent compared with the estimated real monthly cost"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className={`relative self-start rounded-md border border-border bg-surface px-5 pt-5 sm:px-6 sm:pt-6 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-dashed border-rule pb-3">
        <h3 className="text-base font-bold">Example: one 1-bed apartment</h3>
        <span className="text-xs text-text-muted">Made-up figures</span>
      </div>

      <div className="mt-4 flex items-baseline gap-2 text-sm">
        <span className="text-text-muted">What the ad says</span>
        <span aria-hidden="true" className="leader" />
        <span className="figure text-base font-medium">{formatUsd(AD)}</span>
      </div>

      <motion.ul
        key={round}
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.42, delayChildren: 0.3 } } }}
        onAnimationComplete={() => setDone(true)}
        className="mt-2 space-y-2 text-sm"
      >
        {ROWS.map((r) => (
          <motion.li
            key={r.label}
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex items-baseline gap-2"
          >
            {/* Highlighter only on charges the ad hid. */}
            <span className={r.kind === "add" ? "marker" : "text-text-muted"}>
              {r.label}
            </span>
            <span aria-hidden="true" className="leader" />
            <span
              className={`figure text-base font-medium ${r.kind === "save" ? "text-success-text" : ""}`}
            >
              {r.amount > 0 ? "+" : "−"}
              {formatUsd(Math.abs(r.amount))}
            </span>
          </motion.li>
        ))}
      </motion.ul>

      <div className="mt-4 border-t-2 border-dashed border-rule pt-4 pb-5">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">Estimated real cost</span>
          <span aria-hidden="true" className="leader" />
          <span className="figure text-3xl font-bold">
            <CountUp key={round} from={AD} to={REAL} go={done} prefix="~" />
          </span>
        </div>
        <p className="mt-3 text-sm text-text-muted">
          <strong className="font-semibold text-text">
            About {formatUsd(GAP)} a month
          </strong>{" "}
          the ad never showed. An estimate: real buildings show their own figures, each
          with a last-verified date.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setRound((n) => n + 1);
          }}
          className="mt-2 min-h-11 text-sm font-semibold text-brand-text underline underline-offset-2"
        >
          Show again
        </button>
      </div>
    </motion.section>
  );
}
