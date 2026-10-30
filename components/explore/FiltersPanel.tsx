"use client";

import type { BedroomFilter, ExploreOptions } from "@/lib/explore";
import { cn } from "../ui/cn";

export type FilterState = Pick<
  ExploreOptions,
  "people" | "bedrooms" | "cities" | "dealsOnly" | "goodFitOnly"
>;

type Props = {
  value: FilterState;
  onChange: (next: FilterState) => void;
  cities: string[];
  hasApprovalAnswers: boolean;
};

const BEDROOMS: { value: BedroomFilter; label: string }[] = [
  { value: 0, label: "Studio" },
  { value: 1, label: "1 bed" },
  { value: 2, label: "2 beds" },
  { value: 3, label: "3+" },
];

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/** Chips for quick narrowing (Nielsen #7). Every chip is a real toggle button. */
export function FiltersPanel({ value, onChange, cities, hasApprovalAnswers }: Props) {
  return (
    <div className="space-y-6">
      <Group title="Living with">
        {[1, 2, 3].map((n) => (
          <Chip
            key={n}
            on={value.people === n}
            onClick={() => onChange({ ...value, people: n })}
          >
            {n === 1 ? "Just me" : `${n} people`}
          </Chip>
        ))}
        {value.people > 1 && (
          <p className="w-full text-xs text-text-muted">
            Prices show each person&apos;s share. Everyone gets their own bedroom.
          </p>
        )}
      </Group>

      <Group title="Bedrooms">
        {BEDROOMS.map((b) => (
          <Chip
            key={b.value}
            on={value.bedrooms.includes(b.value)}
            onClick={() =>
              onChange({ ...value, bedrooms: toggle(value.bedrooms, b.value) })
            }
          >
            {b.label}
          </Chip>
        ))}
      </Group>

      <Group title="City">
        {cities.map((city) => (
          <Chip
            key={city}
            on={value.cities.includes(city)}
            onClick={() => onChange({ ...value, cities: toggle(value.cities, city) })}
          >
            {city}
          </Chip>
        ))}
      </Group>

      <Group title="Show only">
        <Chip
          on={value.dealsOnly}
          onClick={() => onChange({ ...value, dealsOnly: !value.dealsOnly })}
        >
          Has move-in deals
        </Chip>
        <Chip
          on={value.goodFitOnly}
          disabled={!hasApprovalAnswers}
          onClick={() => onChange({ ...value, goodFitOnly: !value.goodFitOnly })}
        >
          Good fit for me
        </Chip>
        {!hasApprovalAnswers && (
          <p className="w-full text-xs text-text-muted">
            Answer the 3 approval questions to use &quot;Good fit for me&quot;.
          </p>
        )}
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const id = `filter-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div role="group" aria-labelledby={id}>
      <p
        id={id}
        className="mb-2 text-xs font-bold tracking-wider text-text-muted uppercase"
      >
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  on,
  disabled,
  onClick,
  children,
}: {
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border px-3.5 text-sm font-medium transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50",
        on
          ? "border-text bg-text text-bg"
          : "border-border-strong bg-surface text-text hover:border-text",
      )}
    >
      {children}
    </button>
  );
}
