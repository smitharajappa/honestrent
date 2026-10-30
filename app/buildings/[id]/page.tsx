import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnswersNote, FitBadge } from "@/components/approval/FitBadge";
import { Tip } from "@/components/ui/Tip";
import { InterestForm } from "@/components/InterestForm";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  AlertIcon,
  ArrowLeftIcon,
  CheckIcon,
  MapPinIcon,
  TagIcon,
} from "@/components/ui/icons";
import { VerifiedNote } from "@/components/VerifiedNote";
import { BuildingCover } from "@/components/BuildingCover";
import { CostBar } from "@/components/CostBar";
import { CompareToggle, SaveButton } from "@/components/shortlist/ShortlistButtons";
import { TrustNotes } from "@/components/TrustNotes";
import { MoveInCashCard } from "@/components/building/MoveInCashCard";
import { UtilitiesSection } from "@/components/building/UtilitiesSection";
import { UtilitiesLine } from "@/components/ResultCard";
import { utilitiesFor } from "@/lib/utilities";
import { describeCriteria, pickCriteria } from "@/lib/approval";
import { fetchBuilding } from "@/lib/buildings";
import { isDealActive, planRows } from "@/lib/cost";
import { bathroomLabel, bedroomLabel, formatDate, formatUsd } from "@/lib/format";
import { todayInTexas, validateSearch } from "@/lib/validation";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ budget?: string | string[]; moveIn?: string | string[] }>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchBuilding(id);
  const building = result.ok ? result.building : null;
  if (!building) return { title: "Apartment" };
  return {
    title: building.name,
    description: `Real monthly cost, fees, deals and approval rules for ${building.name}, ${building.city}.`,
  };
}

export default async function BuildingPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const query = await searchParams;
  const today = todayInTexas();

  // Keep the renter's search if it came along and is valid; otherwise ignore it.
  const search = validateSearch(first(query.budget), first(query.moveIn), today);
  const moveIn = search.ok ? search.value.moveIn : null;
  const budget = search.ok ? search.value.budget : null;
  const backHref = search.ok ? `/?budget=${budget}&moveIn=${moveIn}` : "/";

  const result = await fetchBuilding(id);
  if (!result.ok) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16">
        <Card role="alert" className="flex gap-3 p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-warning-text" />
          <p className="text-sm">
            We couldn&apos;t load this apartment. Please try again soon.
          </p>
        </Card>
      </main>
    );
  }
  const building = result.building;
  if (!building) notFound();

  const rows = planRows(building, today, moveIn);
  const cheapest = rows.find((r) => r.availableByMoveIn) ?? rows[0];
  const cheapestUtilities = cheapest
    ? utilitiesFor(building, cheapest.plan.bedrooms)
    : null;
  const cheapestTotal =
    cheapest && cheapestUtilities
      ? cheapest.cost.realMonthlyCost + cheapestUtilities.avg
      : 0;
  const nextMonthFirst = (() => {
    const [y, m] = today.split("-").map(Number);
    return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  })();
  const deals = building.building_deals.filter((d) => isDealActive(d, today));
  const totalFees = building.building_fees.reduce((sum, f) => sum + f.monthly_usd, 0);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(building.address)}`;

  return (
    <main className="page-container pt-6 pb-16">
      <ButtonLink href={backHref} variant="ghost" className="-ml-3">
        <ArrowLeftIcon className="size-4" />
        {search.ok ? "Back to results" : "Search apartments"}
      </ButtonLink>

      <div className="relative mt-3 h-40 overflow-hidden rounded-2xl border border-border sm:h-56">
        <BuildingCover id={building.id} name={building.name} />
        <SaveButton
          buildingId={building.id}
          buildingName={building.name}
          className="absolute top-3 right-3"
        />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          <section aria-labelledby="building-name">
            <Badge>{building.city}</Badge>
            <h1
              id="building-name"
              className="mt-2 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl"
            >
              {building.name}
            </h1>
            <p className="mt-2 flex items-start gap-1.5 text-text-muted">
              <MapPinIcon className="mt-1 size-4 shrink-0" />
              <span>
                {building.address} ·{" "}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-text underline underline-offset-2"
                >
                  Map<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </span>
            </p>
            <div className="mt-3">
              <VerifiedNote lastVerified={building.last_verified} today={today} />
            </div>
          </section>

          <Section id="plans" title="Floor plans">
            <p className="text-sm text-text-muted">
              {moveIn
                ? `Real monthly cost for each plan. Plans marked "Ready" are available by ${formatDate(moveIn)}.`
                : "Real monthly cost for each plan, cheapest first."}
            </p>
            <ul className="mt-4 divide-y divide-border">
              {rows.map(({ plan, cost, availableByMoveIn }) => (
                <li
                  key={plan.id}
                  className="flex items-start justify-between gap-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{plan.name}</p>
                    <p className="mt-0.5 text-sm text-text-muted">
                      {bedroomLabel(plan.bedrooms)} · {bathroomLabel(plan.bathrooms)} ·{" "}
                      {plan.lease_months}-month lease
                    </p>
                    <div className="mt-2">
                      {availableByMoveIn ? (
                        <Badge tone="success">
                          {moveIn ? "Ready by your move-in" : "Available now"}
                        </Badge>
                      ) : (
                        <Badge>Available {formatDate(plan.available_from)}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right tabular-nums">
                    <p className="text-xl font-bold">{formatUsd(cost.realMonthlyCost)}</p>
                    <p className="text-xs text-text-muted">real / mo</p>
                    {(() => {
                      const u = utilitiesFor(building, plan.bedrooms);
                      return u.known && u.avg > 0 ? (
                        <p className="text-xs text-info-text">
                          + ~{formatUsd(u.avg)} utilities
                        </p>
                      ) : null;
                    })()}
                    <p className="mt-1 text-sm text-text-muted">
                      Advertised {formatUsd(cost.advertisedRent)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="fees" title="Required monthly fees">
            {building.building_fees.length === 0 ? (
              <p className="text-sm text-text-muted">
                No required monthly fees. Rent is the full price.
              </p>
            ) : (
              <dl className="space-y-2 text-sm tabular-nums">
                {building.building_fees.map((fee) => (
                  <div key={fee.id} className="flex justify-between gap-3">
                    <dt className="text-text-muted">{fee.name}</dt>
                    <dd>{formatUsd(fee.monthly_usd)}/mo</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-3 border-t border-border pt-2 font-semibold">
                  <dt>Total added to rent</dt>
                  <dd>{formatUsd(totalFees)}/mo</dd>
                </div>
              </dl>
            )}
          </Section>

          <Section id="deals" title="Move-in deals">
            {deals.length === 0 ? (
              <p className="text-sm text-text-muted">No current deals.</p>
            ) : (
              <>
                <ul className="space-y-3">
                  {deals.map((deal) => (
                    <li key={deal.id} className="flex items-start gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-success-soft text-success-text">
                        <TagIcon className="size-4" />
                      </span>
                      <div>
                        <p className="font-medium">{deal.description}</p>
                        <p className="text-sm text-text-muted">
                          {deal.valid_until
                            ? `Ends ${formatDate(deal.valid_until)}`
                            : "No end date"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-text-muted">
                  Deals are spread across the lease to get each plan&apos;s real monthly
                  cost.
                </p>
              </>
            )}
          </Section>

          <Section id="utilities" title="Utilities billed by the building">
            <UtilitiesSection building={building} />
          </Section>

          {cheapest && (
            <Section id="move-in" title="Cash to move in">
              <MoveInCashCard
                building={building}
                plan={cheapest.plan}
                monthlyTotal={cheapestTotal}
                moveIn={moveIn ?? nextMonthFirst}
              />
            </Section>
          )}

          <Section id="documents" title="What to bring when you apply">
            {(building.documents_required ?? []).length > 0 ? (
              <ul className="space-y-1.5 text-sm">
                {building.documents_required!.map((doc) => (
                  <li key={doc} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-success-text" />
                    {doc}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted">
                Not confirmed yet. Ask the leasing office before you pay an application
                fee.
              </p>
            )}
          </Section>

          <Section id="approval" title="Approval rules">
            <dl className="space-y-2 text-sm">
              {describeCriteria(building).map((rule) => (
                <div key={rule.label} className="flex justify-between gap-3">
                  <dt className="text-text-muted">{rule.label}</dt>
                  <dd className="text-right font-medium">{rule.value}</dd>
                </div>
              ))}
              {building.accepts_offer_letter != null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">Job offer letter as income proof</dt>
                  <dd className="text-right font-medium">
                    {building.accepts_offer_letter ? "Accepted" : "Not accepted"}
                  </dd>
                </div>
              )}
              {(building.guarantor_companies ?? []).length > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">Guarantor companies</dt>
                  <dd className="text-right font-medium">
                    {building.guarantor_companies!.join(", ")}
                  </dd>
                </div>
              )}
              {building.deposit_no_credit_usd != null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">Deposit with no US credit</dt>
                  <dd className="text-right font-medium tabular-nums">
                    {formatUsd(building.deposit_no_credit_usd)}
                  </dd>
                </div>
              )}
            </dl>
            {cheapest && (
              <>
                <FitBadge
                  criteria={pickCriteria(building)}
                  rentUsd={cheapest.plan.rent_usd}
                  emptyHint="Answer the 3 approval questions on the search page to see your fit here. Estimates only."
                />
                <div className="text-sm">
                  <AnswersNote editHref={`${backHref}#search`} />
                </div>
              </>
            )}
            <Tip summary="What's a guarantor or ITIN?" className="mt-2">
              <p>
                <strong className="font-semibold">Guarantor:</strong> someone (or a
                guarantor company) who promises to pay if you can&apos;t.
              </p>
              <p>
                <strong className="font-semibold">ITIN:</strong> a US tax ID for people
                who can&apos;t get an SSN.
              </p>
            </Tip>
          </Section>

          <Section id="interest" title="I'm interested">
            <p className="mb-5 text-sm text-text-muted">
              Leave your email and the Swelt team will help you with next steps for{" "}
              {building.name}.
            </p>
            <InterestForm
              buildingId={building.id}
              buildingName={building.name}
              plans={rows.map(({ plan, cost }) => ({
                value: plan.id,
                label: `${plan.name} · ${bedroomLabel(plan.bedrooms)} · ${formatUsd(cost.realMonthlyCost)}/mo`,
              }))}
              moveIn={moveIn}
              budget={budget}
            />
          </Section>
        </div>

        {/* Price summary: follows you down the page on laptops. */}
        {cheapest && (
          <aside aria-label="Price summary" className="lg:sticky lg:top-24 lg:self-start">
            <Card className="p-5 shadow-raised">
              <p className="text-sm text-text-muted">
                {cheapestUtilities?.known && cheapestUtilities.avg > 0
                  ? "Estimated total from"
                  : "Real cost from"}
              </p>
              <p className="text-4xl font-extrabold tracking-tight tabular-nums">
                {cheapestUtilities?.known && cheapestUtilities.avg > 0 ? "~" : ""}
                {formatUsd(cheapestTotal)}
                <span className="text-base font-medium text-text-muted">/mo</span>
              </p>
              <p className="mt-0.5 text-sm text-text-muted">
                Advertised {formatUsd(cheapest.cost.advertisedRent)} ·{" "}
                {cheapest.plan.name}
              </p>
              <CostBar cost={cheapest.cost} utilities={cheapestUtilities ?? undefined} />
              {cheapestUtilities && (
                <p className="mt-1.5 text-xs text-text-muted">
                  <UtilitiesLine utilities={cheapestUtilities} />
                </p>
              )}
              <ButtonLink href="#interest" size="lg" className="mt-5 w-full">
                I&apos;m interested
              </ButtonLink>
              <div className="mt-2 flex justify-center">
                <CompareToggle buildingId={building.id} />
              </div>
            </Card>
            <div className="mt-4">
              <TrustNotes />
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      as="section"
      aria-labelledby={`${id}-heading`}
      className="mt-6 scroll-mt-20 p-5 sm:p-6"
      id={id}
    >
      <h2 id={`${id}-heading`} className="mb-3 text-lg font-semibold">
        {title}
      </h2>
      {children}
    </Card>
  );
}
