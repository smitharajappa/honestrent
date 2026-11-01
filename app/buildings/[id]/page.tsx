import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnswersNote, FitBadge } from "@/components/approval/FitBadge";
import { Tip } from "@/components/ui/Tip";
import { InterestForm } from "@/components/InterestForm";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InfoNote } from "@/components/ui/InfoNote";
import { AlertIcon, ArrowLeftIcon, MapPinIcon, TagIcon } from "@/components/ui/icons";
import { VerifiedNote } from "@/components/VerifiedNote";
import { BuildingCover } from "@/components/BuildingCover";
import { CostBar } from "@/components/CostBar";
import { LazyMap } from "@/components/map/LazyMap";
import { RevealOnScroll } from "@/components/motion/Reveal";
import { CompareToggle, SaveButton } from "@/components/shortlist/ShortlistButtons";
import { TrustNotes } from "@/components/TrustNotes";
import { describeCriteria, pickCriteria } from "@/lib/approval";
import { fetchBuilding } from "@/lib/buildings";
import { isDealActive, planRows } from "@/lib/cost";
import { CAMPUS, milesBetween } from "@/lib/map";
import { moveInCash } from "@/lib/movein";
import { fetchTypicalDrive } from "@/lib/traffic-server";
import { TrafficChart } from "@/components/traffic/TrafficChart";
import { fetchPlacesNear, nearestByKind, PLACE_KINDS, walkMinutes } from "@/lib/places";
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
  // Imported real community with no prices entered yet: show where it is, nothing else.
  const mapOnly = building.floor_plans.length === 0;
  const cheapest = rows.find((r) => r.availableByMoveIn) ?? rows[0];
  const cash = cheapest
    ? moveInCash(building, cheapest.plan.rent_usd, cheapest.cost.monthlyFees, moveIn)
    : null;
  const deals = building.building_deals.filter((d) => isDealActive(d, today));
  const totalFees = building.building_fees.reduce((sum, f) => sum + f.monthly_usd, 0);
  const hasPin = building.latitude !== null && building.longitude !== null;
  const places = hasPin
    ? await fetchPlacesNear(building.latitude!, building.longitude!)
    : [];
  const drive = hasPin
    ? await fetchTypicalDrive(
        { latitude: building.latitude!, longitude: building.longitude! },
        CAMPUS,
      )
    : null;
  const nearby = hasPin
    ? nearestByKind(
        { latitude: building.latitude!, longitude: building.longitude! },
        places,
      )
    : null;
  const placePins = nearby
    ? PLACE_KINDS.flatMap(({ kind }) => nearby[kind]).map((p) => ({
        id: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        place: true,
      }))
    : [];
  const campusMiles = hasPin
    ? milesBetween(
        { latitude: building.latitude!, longitude: building.longitude! },
        CAMPUS,
      )
    : null;

  return (
    <main className="page-container pt-6 pb-16">
      <ButtonLink href={backHref} variant="ghost" className="-ml-3">
        <ArrowLeftIcon className="size-4" />
        {search.ok ? "Back to results" : "Search apartments"}
      </ButtonLink>

      <div className="relative mt-3 h-40 overflow-hidden rounded-2xl border border-border sm:h-56">
        <BuildingCover id={building.id} name={building.name} />
        {!mapOnly && (
          <SaveButton
            buildingId={building.id}
            buildingName={building.name}
            className="absolute top-3 right-3"
          />
        )}
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
                {building.address}
                {hasPin && (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      href="#location"
                      className="font-medium text-brand-text underline underline-offset-2"
                    >
                      Map
                    </a>
                  </>
                )}
              </span>
            </p>
            <div className="mt-3">
              {mapOnly ? (
                <Badge tone="warning">Prices not verified yet</Badge>
              ) : (
                <VerifiedNote lastVerified={building.last_verified} today={today} />
              )}
            </div>
          </section>

          {building.notes && !mapOnly && (
            <InfoNote className="mt-6">{building.notes}</InfoNote>
          )}

          {mapOnly && (
            <Section id="unverified" title="We haven't verified this community yet">
              <p className="text-sm text-text-muted">
                This is a real apartment community. Swelt has its location, but not its
                current rent, fees, deals or approval rules, so it isn&apos;t ranked by
                real cost yet. Check the community&apos;s own website for current prices,
                and never pay a fee before seeing the apartment and a written lease.
              </p>
              {building.website && (
                <p className="mt-3 text-sm">
                  <a
                    href={building.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-text underline underline-offset-2"
                  >
                    Community website
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </p>
              )}
            </Section>
          )}

          {!mapOnly && (
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
                      <p className="text-xl font-bold">
                        {formatUsd(cost.realMonthlyCost)}
                      </p>
                      <p className="text-xs text-text-muted">real / mo</p>
                      <p className="mt-1 text-sm text-text-muted">
                        Advertised {formatUsd(cost.advertisedRent)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {hasPin && (
            <Section id="location" title="Location">
              <LazyMap
                pins={[
                  {
                    id: building.id,
                    name: building.name,
                    latitude: building.latitude!,
                    longitude: building.longitude!,
                  },
                  ...placePins,
                ]}
                highlightId={building.id}
                summary={`${building.name} is about ${campusMiles!.toFixed(1)} miles from UT Dallas in a straight line.`}
                className="h-72 sm:h-96"
              />
              <p className="mt-3 text-sm text-text-muted tabular-nums">
                About {campusMiles!.toFixed(1)} miles from UT Dallas, measured in a
                straight line (not a driving route). Map data ©{" "}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-text underline underline-offset-2"
                >
                  OpenStreetMap
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>{" "}
                contributors.
              </p>
              {nearby && placePins.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <h3 className="text-base font-semibold">Nearby</h3>
                  <p className="mt-1 text-sm text-text-muted">
                    Closest places within 2 miles. Walking time is a rough guess from
                    straight-line distance. Small dots on the map.
                  </p>
                  <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                    {PLACE_KINDS.map(({ kind, label }) => (
                      <div key={kind}>
                        <dt className="text-sm font-semibold">{label}</dt>
                        <dd className="mt-1">
                          {nearby[kind].length === 0 ? (
                            <span className="text-sm text-text-muted">
                              None found within 2 miles
                            </span>
                          ) : (
                            <ul className="space-y-1 text-sm tabular-nums">
                              {nearby[kind].map((p) => (
                                <li key={p.id} className="flex justify-between gap-3">
                                  <span className="min-w-0 truncate">{p.name}</span>
                                  <span className="shrink-0 text-text-muted">
                                    {p.miles.toFixed(1)} mi · {walkMinutes(p.miles)} min
                                    walk
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </Section>
          )}

          {!mapOnly && (
            <>
              {drive && (
                <Section id="drive" title="Drive to UT Dallas">
                  <p className="mb-4 text-sm text-text-muted">
                    Typical weekday drive time by the hour you leave. This is based on
                    past traffic patterns, not live traffic.
                  </p>
                  <TrafficChart points={drive} destination={CAMPUS.name} />
                  <p className="mt-3 text-xs text-text-muted">Traffic data © TomTom.</p>
                </Section>
              )}

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
                      Deals are spread across the lease to get each plan&apos;s real
                      monthly cost.
                    </p>
                  </>
                )}
              </Section>

              {cash && (
                <Section id="movein" title="Cash to move in">
                  <p className="text-sm text-text-muted">
                    What you pay before you get the keys, for {cheapest.plan.name}. Only
                    amounts the leasing office has confirmed are counted.
                  </p>
                  <dl className="mt-4 space-y-2 text-sm tabular-nums">
                    {cash.lines.map((line) => (
                      <div key={line.label} className="flex justify-between gap-3">
                        <dt className="text-text-muted">{line.label}</dt>
                        <dd className={line.usd === null ? "text-text-muted" : ""}>
                          {line.usd === null
                            ? "Ask the leasing office"
                            : formatUsd(line.usd)}
                        </dd>
                      </div>
                    ))}
                    <div className="flex justify-between gap-3 border-t border-border pt-2 font-semibold">
                      <dt>{cash.complete ? "Total to move in" : "Known so far"}</dt>
                      <dd>{formatUsd(cash.knownTotal)}</dd>
                    </div>
                  </dl>
                  {!cash.complete && (
                    <p className="mt-3 text-sm text-text-muted">
                      This is not the full amount. Still to confirm:{" "}
                      {cash.missing.join(", ")}.
                    </p>
                  )}
                  {cash.noCreditExtra > 0 && (
                    <p className="mt-3 text-sm text-text-muted">
                      With no US credit, the deposit can be{" "}
                      {formatUsd(cash.noCreditExtra)} higher.
                    </p>
                  )}
                  <h3 className="mt-5 text-base font-semibold">Guarantor</h3>
                  <p className="mt-1 text-sm text-text-muted">
                    {building.guarantor_companies === null
                      ? "Which guarantor companies this building accepts is not confirmed yet. Ask before you pay any guarantor fee."
                      : building.guarantor_companies.length === 0
                        ? "This building does not accept guarantor companies."
                        : `Accepted: ${building.guarantor_companies.join(", ")}.`}
                  </p>
                  <Tip summary="How much does a guarantor cost?" className="mt-3">
                    <p>
                      Fees are one-time and paid before the lease starts. One guarantor
                      company publishes about 70%–90% of one month&apos;s rent with US
                      credit and 98%–110% with no US credit, per lease.{" "}
                      <a
                        href="https://www.insurent.com/renters/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-brand-text underline underline-offset-2"
                      >
                        Source<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </p>
                    <p>
                      That company does not serve Texas buildings yet, so treat it as an
                      example, not a quote.
                    </p>
                  </Tip>
                  {building.terms_verified_on && (
                    <p className="mt-3 text-xs text-text-muted">
                      Confirmed with the leasing office on{" "}
                      {formatDate(building.terms_verified_on)}.
                    </p>
                  )}
                </Section>
              )}

              <Section id="approval" title="Approval rules">
                <dl className="space-y-2 text-sm">
                  {describeCriteria(building).map((rule) => (
                    <div key={rule.label} className="flex justify-between gap-3">
                      <dt className="text-text-muted">{rule.label}</dt>
                      <dd className="text-right font-medium">{rule.value}</dd>
                    </div>
                  ))}
                </dl>
                {cheapest && building.approval_known && (
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
                    <strong className="font-semibold">ITIN:</strong> a US tax ID for
                    people who can&apos;t get an SSN.
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
            </>
          )}
        </div>

        {/* Price summary: follows you down the page on laptops. */}
        {cheapest && (
          <aside aria-label="Price summary" className="lg:sticky lg:top-24 lg:self-start">
            <Card className="p-5 shadow-raised">
              <p className="text-sm text-text-muted">Real cost from</p>
              <p className="text-4xl font-extrabold tracking-tight tabular-nums">
                {formatUsd(cheapest.cost.realMonthlyCost)}
                <span className="text-base font-medium text-text-muted">/mo</span>
              </p>
              <p className="mt-0.5 text-sm text-text-muted">
                Advertised {formatUsd(cheapest.cost.advertisedRent)} ·{" "}
                {cheapest.plan.name}
              </p>
              <CostBar cost={cheapest.cost} />
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
    <RevealOnScroll>
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
    </RevealOnScroll>
  );
}
