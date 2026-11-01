import Link from "next/link";
import { bedroomLabel, formatDate, formatUsd } from "@/lib/format";
import type { Building, UtilityBilling } from "@/lib/types";
import { SOURCE_LABELS, utilitiesFor } from "@/lib/utilities";
import { Badge } from "../ui/Badge";
import { Tip } from "../ui/Tip";

const BILLING_TEXT: Record<UtilityBilling, string> = {
  submetered:
    "Water and sewer are metered for each apartment and billed by the building.",
  allocated:
    "Water and sewer are split between apartments by a formula (not your own meter), then billed by the building.",
  included: "Water, sewer and trash are included in rent.",
  direct: "You set up and pay utility providers yourself.",
  unknown: "We haven't confirmed how this building bills utilities yet.",
};

/** What the building bills each month on top of rent, with ranges and sources. */
export function UtilitiesSection({ building }: { building: Building }) {
  const billing = building.utility_billing ?? "unknown";
  const sizes = [...new Set(building.floor_plans.map((p) => p.bedrooms))].sort();
  const items = building.building_utility_items ?? [];

  return (
    <div className="space-y-4">
      <p className="text-sm">{BILLING_TEXT[billing]}</p>

      {billing !== "included" && (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {sizes.map((bedrooms) => {
            const u = utilitiesFor(building, bedrooms);
            return (
              <li key={bedrooms} className="flex items-start justify-between gap-4 p-3.5">
                <div>
                  <p className="font-semibold">{bedroomLabel(bedrooms)}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {u.known ? (
                      <>
                        {SOURCE_LABELS[u.source]}
                        {u.reportCount ? ` (${u.reportCount} renters)` : ""}
                        {u.asOf ? ` · ${formatDate(u.asOf)}` : ""}
                      </>
                    ) : (
                      SOURCE_LABELS[u.source]
                    )}
                  </p>
                </div>
                <div className="text-right tabular-nums">
                  {u.known ? (
                    <>
                      <p className="text-lg font-bold">~{formatUsd(u.avg)}/mo</p>
                      <p className="text-xs text-text-muted">
                        usually {formatUsd(u.low)}–{formatUsd(u.high)}
                      </p>
                    </>
                  ) : (
                    <Badge>Not known yet</Badge>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {items.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold tracking-wider text-text-muted uppercase">
            On the monthly bill
          </p>
          <dl className="space-y-1.5 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3">
                <dt className="text-text-muted">{item.name}</dt>
                <dd className="tabular-nums">
                  {item.typical_usd != null
                    ? `about ${formatUsd(item.typical_usd)}`
                    : "varies"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {building.electricity_note && (
        <p className="text-sm text-text-muted">
          <strong className="font-semibold text-text">Electricity:</strong>{" "}
          {building.electricity_note}
        </p>
      )}

      <Tip summary="How to check these numbers yourself">
        <p>
          In Texas, when a building bills water and sewer by meter or by formula, you can
          ask for last year&apos;s average, lowest and highest monthly bill for all
          apartments before you sign. Public Utility Commission rules require owners to
          provide it.
        </p>
      </Tip>

      <p className="text-sm">
        Live here?{" "}
        <Link
          href={`/share-bill?building=${building.id}`}
          className="font-semibold text-brand-text underline underline-offset-2"
        >
          Share last month&apos;s charges anonymously
        </Link>{" "}
        <span className="text-text-muted">to help the next renter.</span>
      </p>
    </div>
  );
}
