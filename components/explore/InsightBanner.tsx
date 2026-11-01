import type { Insight } from "@/lib/explore";
import { formatUsd } from "@/lib/format";

/** Three headline numbers that show why advertised rent can't be trusted. */
export function InsightBanner({ insight }: { insight: Insight }) {
  const gap = insight.biggestGap;
  return (
    <section
      aria-label="What these prices hide"
      className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4"
    >
      <Stat
        label="Required fees add"
        value={`+${formatUsd(insight.avgFees)}/mo`}
        note="on average, on top of advertised rent"
        tone="warning"
      />
      <Stat
        label="Utilities billed add"
        value={
          insight.avgUtilities > 0
            ? `+${formatUsd(insight.avgUtilities)}/mo`
            : "Not known"
        }
        note="on average, varies month to month"
        tone={insight.avgUtilities > 0 ? "warning" : "neutral"}
      />
      <Stat
        label="Move-in deals take off"
        value={`−${formatUsd(insight.avgDeals)}/mo`}
        note="on average, spread over the lease"
        tone="success"
      />
      <Stat
        label="Biggest gap from the ad"
        value={
          gap ? `${gap.gap > 0 ? "+" : "−"}${formatUsd(Math.abs(gap.gap))}/mo` : "None"
        }
        note={gap ? gap.name : "Every price matches its ad"}
        tone="neutral"
      />
    </section>
  );
}

const TONES = {
  neutral: "text-text",
  warning: "text-warning-text",
  success: "text-success-text",
  info: "text-info-text",
} as const;

function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: keyof typeof TONES;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-surface p-3 shadow-card sm:p-4">
      <p className="text-xs leading-tight font-semibold text-text-muted">{label}</p>
      <p
        className={`mt-1 text-base font-bold tracking-tight tabular-nums sm:text-2xl ${TONES[tone]}`}
      >
        {value}
      </p>
      <p className="mt-0.5 hidden truncate text-xs text-text-muted sm:block">{note}</p>
    </div>
  );
}
