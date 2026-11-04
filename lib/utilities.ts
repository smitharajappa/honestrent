// Utilities billed by the building (water, sewer, trash, drainage, admin fees).
// They change month to month, so Honest Rent shows an average with a range and says
// where the number came from.

import type { Building } from "./types";

export type UtilitySource =
  "building" | "renters" | "estimate" | "included" | "direct" | "unknown";

export type UtilityView = {
  /** Average per month added to the real cost (0 when included or unknown). */
  avg: number;
  low: number;
  high: number;
  source: UtilitySource;
  /** Date the figure is from (building or estimate), if known. */
  asOf: string | null;
  /** How many renters reported, when the source is renters. */
  reportCount: number | null;
  /** True when this is a known number the renter can rely on as an average. */
  known: boolean;
};

export const SOURCE_LABELS: Record<UtilitySource, string> = {
  building: "Building's figures",
  renters: "Renters reported",
  estimate: "Honest Rent estimate",
  included: "Included in rent",
  direct: "You pay providers directly",
  unknown: "Not known yet",
};

const NONE = { low: 0, high: 0, asOf: null, reportCount: null };

/** Picks the closest bedroom count when there's no exact match. */
function closest<T extends { bedrooms: number }>(
  rows: T[],
  bedrooms: number,
): T | undefined {
  return [...rows].sort(
    (a, b) =>
      Math.abs(a.bedrooms - bedrooms) - Math.abs(b.bedrooms - bedrooms) ||
      a.bedrooms - b.bedrooms,
  )[0];
}

/**
 * Best available figure, in this order: the building's own numbers (Texas PUC
 * rules let renters ask for them), then at least 3 renter reports, then Honest Rent's
 * estimate. "Included" counts as $0.
 */
export function utilitiesFor(building: Building, bedrooms: number): UtilityView {
  const billing = building.utility_billing ?? "unknown";
  if (billing === "included") {
    return { avg: 0, ...NONE, source: "included", known: true };
  }

  const estimates = building.building_utility_estimates ?? [];
  const fromBuilding = estimates.filter((e) => e.source === "building");
  const exactBuilding = fromBuilding.find((e) => e.bedrooms === bedrooms);
  const renters = building.renter_bills ?? [];
  const exactRenters = renters.find((r) => r.bedrooms === bedrooms);
  const fromEstimate = estimates.filter((e) => e.source === "estimate");

  const pick =
    (exactBuilding && { row: exactBuilding, source: "building" as const }) ||
    (exactRenters && { row: exactRenters, source: "renters" as const }) ||
    (closest(fromBuilding, bedrooms) && {
      row: closest(fromBuilding, bedrooms)!,
      source: "building" as const,
    }) ||
    (closest(fromEstimate, bedrooms) && {
      row: closest(fromEstimate, bedrooms)!,
      source: "estimate" as const,
    });

  if (!pick) {
    return {
      avg: 0,
      ...NONE,
      source: billing === "direct" ? "direct" : "unknown",
      known: false,
    };
  }

  const row = pick.row;
  return {
    avg: row.avg_usd,
    low: row.low_usd,
    high: row.high_usd,
    source: pick.source,
    asOf: "as_of" in row ? row.as_of : null,
    reportCount: "report_count" in row ? row.report_count : null,
    known: true,
  };
}
