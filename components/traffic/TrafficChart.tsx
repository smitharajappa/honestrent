"use client";

import { motion } from "motion/react";
import { hourLabel, shortHourLabel, summarize, type TrafficPoint } from "@/lib/traffic";

/**
 * Typical weekday drive time by hour, as bars. The best and worst hours are marked
 * with words, not only color. The same numbers are in a table for screen readers.
 */
export function TrafficChart({
  points,
  destination,
}: {
  points: TrafficPoint[];
  destination: string;
}) {
  const sorted = [...points].sort((a, b) => a.hour - b.hour);
  const summary = summarize(sorted);
  if (!summary) return null;
  const max = Math.max(...sorted.map((p) => p.minutes));

  return (
    <div>
      <p className="text-sm">
        <span className="font-semibold">
          Leave around {hourLabel(summary.best.hour)}:
        </span>{" "}
        about {summary.best.minutes} min to {destination}.{" "}
        <span className="font-semibold">Avoid {hourLabel(summary.worst.hour)}:</span>{" "}
        about {summary.worst.minutes} min
        {summary.extraMinutes > 0 && ` (${summary.extraMinutes} min longer)`}.
      </p>

      <div
        aria-hidden="true"
        className="mt-4 grid h-40 items-end gap-1.5 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${sorted.length}, minmax(0, 1fr))` }}
      >
        {sorted.map((p, i) => {
          const isBest = p.hour === summary.best.hour;
          const isWorst = p.hour === summary.worst.hour;
          return (
            <div key={p.hour} className="flex h-full flex-col justify-end text-center">
              <span className="mb-1 text-[11px] font-semibold tabular-nums sm:text-xs">
                {p.minutes}
              </span>
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.03, ease: [0.2, 0.8, 0.2, 1] }}
                style={{ height: `${Math.max(8, (p.minutes / max) * 100)}%`, originY: 1 }}
                className={`w-full rounded-t-md ${
                  isWorst
                    ? "bg-warning-text/70"
                    : isBest
                      ? "bg-success-text/70"
                      : "bg-border-strong/60"
                }`}
              />
            </div>
          );
        })}
      </div>
      <div
        aria-hidden="true"
        className="mt-1.5 grid gap-1.5 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${sorted.length}, minmax(0, 1fr))` }}
      >
        {sorted.map((p) => (
          <span
            key={p.hour}
            className="text-center text-[10px] text-text-muted tabular-nums sm:text-xs"
          >
            {shortHourLabel(p.hour)}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-success-text/70" /> Best time to leave
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-warning-text/70" /> Slowest time
        </span>
        <span>Minutes above each bar. a = AM, p = PM</span>
      </div>

      <table className="sr-only">
        <caption>Typical weekday drive time to {destination} by departure hour</caption>
        <thead>
          <tr>
            <th scope="col">Leave at</th>
            <th scope="col">Minutes</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.hour}>
              <th scope="row">{hourLabel(p.hour)}</th>
              <td>{p.minutes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
