"use client";

import { isCompleteProfile } from "@/lib/approval";
import { itemsFor } from "@/lib/shortlist";
import type { Building } from "@/lib/types";
import { useApproval } from "../approval/ApprovalContext";
import { ResultCard } from "../ResultCard";
import { ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import { HeartIcon } from "../ui/icons";
import { CompareTray } from "./CompareTray";
import { useShortlist } from "./ShortlistContext";

export function SavedView({
  buildings,
  today,
}: {
  buildings: Building[];
  today: string;
}) {
  const { saved, ready } = useShortlist();
  const { answers } = useApproval();
  const profile = isCompleteProfile(answers) ? answers : null;

  if (!ready)
    return <p className="mt-8 text-text-muted">Loading your saved apartments…</p>;

  const items = itemsFor(saved, buildings, today, profile);

  if (items.length === 0) {
    return (
      <Card className="mt-8 p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-muted text-text-muted">
          <HeartIcon className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">Nothing saved yet</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
          Tap the heart on any apartment to keep it here. Saved apartments stay on this
          device.
        </p>
        <ButtonLink href="/" className="mt-5">
          Search apartments
        </ButtonLink>
      </Card>
    );
  }

  return (
    <>
      <ol className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ResultCard
            key={item.building.id}
            item={item}
            today={today}
            detailHref={`/buildings/${item.building.id}`}
          />
        ))}
      </ol>
      <CompareTray />
    </>
  );
}
