"use client";

import Link from "next/link";
import { describeCriteria, isCompleteProfile } from "@/lib/approval";
import { isDealActive } from "@/lib/cost";
import { bedroomLabel, formatDate, formatUsd } from "@/lib/format";
import { itemsFor, type ShortlistItem } from "@/lib/shortlist";
import type { Building } from "@/lib/types";
import { useApproval } from "../approval/ApprovalContext";
import { AnswersNote, FitDisplay } from "../approval/FitBadge";
import { BuildingCover } from "../BuildingCover";
import { CostBar } from "../CostBar";
import { Badge } from "../ui/Badge";
import { ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import { CompareIcon } from "../ui/icons";
import { InfoNote } from "../ui/InfoNote";
import { VerifiedNote } from "../VerifiedNote";
import { MAX_COMPARE, useShortlist } from "./ShortlistContext";

type Props = { buildings: Building[]; today: string; moveIn: string | null };

type Row = {
  label: string;
  render: (item: ShortlistItem, best: BestValues) => React.ReactNode;
};
type BestValues = { realCost: number; fees: number; deals: number };

export function CompareView({ buildings, today, moveIn }: Props) {
  const { compare, toggleCompare, ready } = useShortlist();
  const { answers } = useApproval();
  const profile = isCompleteProfile(answers) ? answers : null;

  if (!ready) return <p className="mt-8 text-text-muted">Loading your comparison…</p>;

  const items = itemsFor(compare, buildings, today, profile, moveIn);

  if (items.length < 2) {
    return (
      <Card className="mt-8 p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-muted text-text-muted">
          <CompareIcon className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">
          {items.length === 0 ? "Pick apartments to compare" : "Pick one more to compare"}
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
          Tap &quot;Compare&quot; on 2 or {MAX_COMPARE} apartments to see them side by
          side.
        </p>
        <ButtonLink href="/" className="mt-5">
          Search apartments
        </ButtonLink>
      </Card>
    );
  }

  const best: BestValues = {
    realCost: Math.min(...items.map((i) => i.cost.realMonthlyCost)),
    fees: Math.min(...items.map((i) => i.cost.monthlyFees)),
    deals: Math.max(...items.map((i) => i.cost.monthlyDealSavings)),
  };

  const rows: Row[] = [
    {
      label: "Real cost / mo",
      render: (i, b) => (
        <div>
          <p className="text-2xl font-bold tabular-nums">
            {formatUsd(i.cost.realMonthlyCost)}
          </p>
          {i.cost.realMonthlyCost === b.realCost && <Badge tone="success">Lowest</Badge>}
          <CostBar cost={i.cost} />
        </div>
      ),
    },
    { label: "Advertised rent", render: (i) => formatUsd(i.cost.advertisedRent) },
    {
      label: "Required fees",
      render: (i, b) => (
        <span>
          + {formatUsd(i.cost.monthlyFees)}/mo{" "}
          {i.cost.monthlyFees === b.fees && items.length > 1 && (
            <span className="text-xs text-success-text">(lowest)</span>
          )}
          <span className="block text-xs text-text-muted">
            {i.building.building_fees.map((f) => f.name).join(", ") || "None"}
          </span>
        </span>
      ),
    },
    {
      label: "Move-in deals",
      render: (i, b) => {
        const deals = i.building.building_deals.filter((d) => isDealActive(d, today));
        return (
          <span>
            − {formatUsd(i.cost.monthlyDealSavings)}/mo{" "}
            {i.cost.monthlyDealSavings === b.deals && b.deals > 0 && (
              <span className="text-xs text-success-text">(biggest)</span>
            )}
            <span className="block text-xs text-text-muted">
              {deals.map((d) => d.description).join(", ") || "None right now"}
            </span>
          </span>
        );
      },
    },
    {
      label: "Your approval fit",
      render: (i) =>
        i.fit ? (
          <FitDisplay fit={i.fit} compact />
        ) : (
          <span className="text-sm text-text-muted">Answer the approval questions</span>
        ),
    },
    {
      label: "Approval rules",
      render: (i) => (
        <ul className="space-y-0.5 text-xs">
          {describeCriteria(i.building).map((r) => (
            <li key={r.label}>
              <span className="text-text-muted">{r.label}:</span> {r.value}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "Cheapest plan",
      render: (i) => (
        <span>
          {i.plan.name}
          <span className="block text-xs text-text-muted">
            {bedroomLabel(i.plan.bedrooms)} · {i.plan.lease_months}-month lease
          </span>
        </span>
      ),
    },
    {
      label: "Available",
      render: (i) => (
        <span>
          {i.plan.available_from <= today ? "Now" : formatDate(i.plan.available_from)}
          {!i.readyByMoveIn && (
            <Badge tone="warning" className="mt-1">
              Not ready by your move-in
            </Badge>
          )}
        </span>
      ),
    },
    {
      label: "Last verified",
      render: (i) => (
        <VerifiedNote lastVerified={i.building.last_verified} today={today} />
      ),
    },
  ];

  return (
    <>
      {profile ? (
        <div className="mt-6 text-sm">
          <AnswersNote editHref="/#search" />
        </div>
      ) : (
        <InfoNote className="mt-6">
          Answer the 3 approval questions on the search page to compare approval fit too.
        </InfoNote>
      )}

      {/* Scrolls sideways on phones; row labels stay pinned on the left. */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <caption className="sr-only">Side-by-side comparison of apartments</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-40 bg-surface p-4">
                <span className="sr-only">Detail</span>
              </th>
              {items.map((i) => (
                <th key={i.building.id} scope="col" className="min-w-56 p-4 align-top">
                  <div className="h-20 overflow-hidden rounded-xl">
                    <BuildingCover id={i.building.id} name={i.building.name} />
                  </div>
                  <Link
                    href={`/buildings/${i.building.id}`}
                    className="mt-3 block text-base font-bold hover:underline"
                  >
                    {i.building.name}
                  </Link>
                  <span className="block text-xs font-normal text-text-muted">
                    {i.building.city}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(i.building.id)}
                    className="mt-1 min-h-11 text-xs font-semibold text-brand-text"
                  >
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-surface p-4 align-top text-xs font-bold tracking-wider text-text-muted uppercase"
                >
                  {row.label}
                </th>
                {items.map((i) => (
                  <td key={i.building.id} className="p-4 align-top">
                    {row.render(i, best)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
