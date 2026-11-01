"use client";

import { useMemo, useState } from "react";
import { CAMPUS, type MapPin } from "@/lib/map";
import {
  DEFAULT_VISIBLE_KINDS,
  PLACE_KINDS,
  type Place,
  type PlaceKind,
} from "@/lib/places";
import { LazyMap } from "./LazyMap";

/**
 * A building's map with tabs for the kinds of places around it (groceries, bus stops,
 * restaurants...). Tabs switch dots on and off; nearby dots cluster when zoomed out.
 */
export function BuildingLocation({
  pin,
  places,
  miles,
}: {
  pin: MapPin;
  places: Place[];
  /** Straight-line miles to campus, for the text fallback. */
  miles: number;
}) {
  const [visible, setVisible] = useState<PlaceKind[]>(DEFAULT_VISIBLE_KINDS);
  const pins = useMemo(() => [pin], [pin]);
  const counts = useMemo(() => {
    const c = {} as Record<PlaceKind, number>;
    for (const { kind } of PLACE_KINDS) c[kind] = 0;
    for (const p of places) c[p.kind] += 1;
    return c;
  }, [places]);

  const toggle = (kind: PlaceKind) =>
    setVisible((v) => (v.includes(kind) ? v.filter((k) => k !== kind) : [...v, kind]));

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${pin.latitude},${pin.longitude}`;

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-text underline underline-offset-2"
        >
          Get directions<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      <LazyMap
        pins={pins}
        highlightId={pin.id}
        places={places}
        visibleKinds={visible}
        summary={`${pin.name} is about ${miles.toFixed(1)} miles from ${CAMPUS.name} in a straight line.`}
        className="h-72 sm:h-96"
      />
      <div
        role="group"
        aria-label="Show nearby places on the map"
        className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {PLACE_KINDS.map(({ kind, tab, color }) => {
          const on = visible.includes(kind);
          return (
            <button
              key={kind}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(kind)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium ${
                on
                  ? "border-brand bg-brand text-brand-fg"
                  : "border-border-strong bg-surface text-text"
              }`}
            >
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ background: `var(${color})` }}
              />
              {tab}
              <span
                className={
                  on ? "text-brand-fg/80 tabular-nums" : "text-text-muted tabular-nums"
                }
              >
                {counts[kind]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
