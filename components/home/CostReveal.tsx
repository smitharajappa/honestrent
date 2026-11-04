"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { formatUsd } from "@/lib/format";
import { CountUp } from "../motion/CountUp";
import { LogoMark } from "../ui/Logo";
import { Badge } from "../ui/Badge";

// Made-up numbers for one sample building: the point is the shape of the gap, not the figures.
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
  const pct = (n: number) => `${(n / (REAL + 55)) * 100}%`;

  return (
    <motion.section
      aria-label="Sample: advertised rent compared with the real monthly cost"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className={`relative overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-raised sm:p-6 ${className ?? ""}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full blur-3xl"
        style={{ background: "var(--glow)" }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-bold">
          <LogoMark className="size-7" />
          One sample building
        </span>
        <Badge>Made-up numbers</Badge>
      </div>

      <div className="relative mt-5">
        <p className="eyebrow">What the ad says</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums text-text-muted">
          {formatUsd(AD)}
          <span className="text-base font-semibold"> /mo</span>
        </p>
      </div>

      <motion.ul
        key={round}
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.42, delayChildren: 0.3 } } }}
        onAnimationComplete={() => setDone(true)}
        className="relative mt-4 space-y-2.5 text-sm"
      >
        {ROWS.map((r) => (
          <motion.li
            key={r.label}
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3.5 py-2.5"
          >
            <span className="text-text-muted">{r.label}</span>
            <span
              className={`font-bold tabular-nums ${r.kind === "save" ? "text-success-text" : "text-warning-text"}`}
            >
              {r.amount > 0 ? "+" : "−"}
              {formatUsd(Math.abs(r.amount))}
            </span>
          </motion.li>
        ))}
      </motion.ul>

      <div className="relative mt-4 border-t border-border pt-4">
        <p className="eyebrow">What you really pay</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight tabular-nums">
          <CountUp key={round} from={AD} to={REAL} go={done} />
          <span className="text-base font-semibold text-text-muted"> /mo</span>
        </p>
        <div
          role="img"
          aria-label={`Advertised ${formatUsd(AD)}, plus fees ${formatUsd(85)} and utilities ${formatUsd(140)}, minus a deal of ${formatUsd(55)}, equals ${formatUsd(REAL)} a month.`}
          className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-surface-muted"
        >
          <span className="h-full bg-brand/55" style={{ width: pct(AD) }} />
          <motion.span
            key={round}
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: done || reduce ? 1 : 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="h-full origin-left bg-warning-text/70"
            style={{ width: pct(GAP + 55) }}
          />
        </div>
        <p className="mt-3 text-sm text-text-muted">
          <strong className="font-semibold text-text">{formatUsd(GAP)} a month</strong>{" "}
          the ad never showed. Honest Rent adds it up for every building.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setRound((n) => n + 1);
          }}
          className="mt-2 min-h-11 text-sm font-semibold text-brand-text underline underline-offset-2"
        >
          Play again
        </button>
      </div>
    </motion.section>
  );
}
