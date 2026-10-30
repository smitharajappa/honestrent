// Helpers for the Saved and Compare pages: show each building's cheapest plan
// regardless of budget, preferring plans ready by the renter's move-in date.

import type { ApprovalProfile } from "./approval";
import { DEFAULT_OPTIONS, explore, type ExploreItem } from "./explore";
import type { Building } from "./types";

const NO_LIMIT_BUDGET = Number.MAX_SAFE_INTEGER;
const ANY_DATE = "9999-12-31";

export type ShortlistItem = ExploreItem & { readyByMoveIn: boolean };

function cheapest(
  building: Building,
  today: string,
  profile: ApprovalProfile | null,
  moveIn: string,
): ExploreItem | undefined {
  return explore([building], {
    ...DEFAULT_OPTIONS,
    budget: NO_LIMIT_BUDGET,
    moveIn,
    today,
    profile,
  })[0];
}

/** One item per building id, in the order given. Unknown ids are skipped. */
export function itemsFor(
  ids: string[],
  buildings: Building[],
  today: string,
  profile: ApprovalProfile | null,
  moveIn: string | null = null,
): ShortlistItem[] {
  const byId = new Map(buildings.map((b) => [b.id, b]));
  const items: ShortlistItem[] = [];
  for (const id of ids) {
    const building = byId.get(id);
    if (!building) continue;
    const ready = moveIn ? cheapest(building, today, profile, moveIn) : undefined;
    const any = ready ?? cheapest(building, today, profile, ANY_DATE);
    if (any) items.push({ ...any, readyByMoveIn: moveIn ? Boolean(ready) : true });
  }
  return items;
}
