import type { Metadata } from "next";
import { BuildingCover } from "@/components/BuildingCover";
import { CostBar } from "@/components/CostBar";
import { HiddenCostBanner } from "@/components/building/HiddenCostBanner";
import { SectionNav } from "@/components/building/SectionNav";
import { BuildingLocation } from "@/components/map/BuildingLocation";
import { LazyMap } from "@/components/map/LazyMap";
import { RevealBlock } from "@/components/motion/Reveal";
import { TrafficChart } from "@/components/traffic/TrafficChart";
import { TrustNotes } from "@/components/TrustNotes";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { InfoNote } from "@/components/ui/InfoNote";
import { Tip } from "@/components/ui/Tip";
import {
  AlertIcon,
  CheckIcon,
  PlusCircleIcon,
  TagIcon,
  UsersIcon,
  XCircleIcon,
} from "@/components/ui/icons";

// The visual source of truth for the design system (see DESIGN.md).
// Not linked from the app and never listed by search engines.
export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const COLORS: { name: string; className: string; use: string }[] = [
  { name: "bg", className: "bg-bg", use: "Page background (60%)" },
  { name: "surface", className: "bg-surface", use: "Cards (30%)" },
  {
    name: "surface-muted",
    className: "bg-surface-muted",
    use: "Inner panels, neutral badges",
  },
  { name: "border", className: "bg-border", use: "Dividers, card edges" },
  { name: "border-strong", className: "bg-border-strong", use: "Input borders (3:1)" },
  { name: "text", className: "bg-text", use: "Main text" },
  { name: "text-muted", className: "bg-text-muted", use: "Secondary text" },
  { name: "brand", className: "bg-brand", use: "Actions only (10%)" },
  { name: "success", className: "bg-success-soft", use: "Good fit, savings, ready" },
  { name: "warning", className: "bg-warning-soft", use: "Extra fees, guarantor, stale" },
  { name: "danger", className: "bg-danger-soft", use: "Errors, unlikely" },
  { name: "info", className: "bg-info-soft", use: "Explanations and tips" },
];

export default function StyleguidePage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Styleguide</h1>
        <p className="mt-2 text-text-muted">
          Every color, font and component Swelt uses. Rules live in DESIGN.md; tokens live
          in app/globals.css.
        </p>
      </header>

      <Section title="Vibe">
        <p className="text-lg font-semibold">Trustworthy · Clear · Welcoming</p>
        <p className="mt-1 text-sm text-text-muted">
          For Ana, a newcomer comparing real costs and approval odds without US credit.
        </p>
      </Section>

      <Section title="Color">
        <ul className="grid gap-3 sm:grid-cols-2">
          {COLORS.map((c) => (
            <li key={c.name} className="flex items-center gap-3">
              <span
                className={`size-10 shrink-0 rounded-lg border border-border ${c.className}`}
              />
              <span className="text-sm">
                <span className="block font-semibold">{c.name}</span>
                <span className="text-text-muted">{c.use}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type">
        <p className="text-3xl font-bold">Heading: Plus Jakarta Sans</p>
        <h3 className="mt-3 text-lg font-bold">Section heading</h3>
        <p className="mt-2">Body: Inter, 16px. Clear and easy to read on a phone.</p>
        <p className="mt-2 text-sm text-text-muted">Secondary text, 14px.</p>
        <p className="mt-2 text-3xl font-bold tabular-nums">$1,184</p>
        <p className="text-xs text-text-muted">
          Prices use tabular numbers so digits line up.
        </p>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <ButtonLink href="/styleguide" size="lg">
            Large link
          </ButtonLink>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="success" icon={<CheckIcon className="size-3.5" />}>
            Good fit
          </Badge>
          <Badge tone="warning" icon={<UsersIcon className="size-3.5" />}>
            Possible with guarantor
          </Badge>
          <Badge tone="danger" icon={<XCircleIcon className="size-3.5" />}>
            Unlikely
          </Badge>
          <Badge tone="warning" icon={<PlusCircleIcon className="size-3.5" />}>
            $35/mo more than advertised
          </Badge>
          <Badge tone="success" icon={<TagIcon className="size-3.5" />}>
            $41/mo less than advertised
          </Badge>
          <Badge tone="info" icon={<AlertIcon className="size-3.5" />}>
            Info
          </Badge>
        </div>
      </Section>

      <Section title="Form fields">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="sg-ok"
            label="Monthly budget"
            hint="Your max for rent plus fees"
            prefix="$"
          />
          <Field
            id="sg-error"
            label="Email"
            defaultValue="not-an-email"
            error="Enter a valid email, like name@example.com."
          />
        </div>
      </Section>

      <Section title="Building covers (decorative)">
        <p className="mb-3 text-sm text-text-muted">
          Each building gets its own color and skyline from its id. A real photo replaces
          it once the building supplies one.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            "Maple Creek",
            "Cottonwood",
            "Bluebonnet",
            "Legacy Row",
            "Prairie Oak",
            "Willow",
          ].map((name) => (
            <div
              key={name}
              className="h-20 overflow-hidden rounded-xl border border-border"
            >
              <BuildingCover id={name} name={name} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Cost bar">
        <CostBar
          cost={{
            advertisedRent: 1225,
            monthlyFees: 100,
            monthlyDealSavings: 141,
            realMonthlyCost: 1184,
          }}
        />
      </Section>

      <Section title="Filter chips">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex min-h-11 items-center rounded-full border border-text bg-text px-3.5 text-sm font-medium text-bg">
            Selected
          </span>
          <span className="inline-flex min-h-11 items-center rounded-full border border-border-strong bg-surface px-3.5 text-sm font-medium">
            Not selected
          </span>
        </div>
      </Section>

      <Section title="Map (made-up pins)">
        <LazyMap
          pins={[
            {
              id: "a",
              name: "Sample building A",
              latitude: 32.961,
              longitude: -96.729,
              label: "$1,184",
            },
            {
              id: "b",
              name: "Sample building B",
              latitude: 33.019,
              longitude: -96.73,
              label: "$1,420",
            },
            {
              id: "c",
              name: "Sample community, prices not verified yet",
              latitude: 33.0,
              longitude: -96.76,
              unverified: true,
            },
          ]}
          summary="Two sample buildings and UT Dallas."
          className="h-72"
        />
        <p className="mt-2 text-sm text-text-muted">
          Teal pins are buildings (tap to open). Grey dots are real places whose prices
          aren&apos;t verified yet. The white pin is UT Dallas. Tiles from OpenFreeMap;
          data © OpenStreetMap contributors.
        </p>
      </Section>

      <Section title="Hidden-cost banner and section bar (made-up numbers)">
        <HiddenCostBanner
          planName="1 Bed, 700 sq ft"
          total={1210}
          cost={{
            advertisedRent: 963,
            monthlyFees: 90,
            monthlyDealSavings: 74,
            realMonthlyCost: 979,
          }}
          utilities={{
            known: true,
            avg: 231,
            low: 190,
            high: 280,
            source: "renters",
            reportCount: 3,
            asOf: "2026-10-31",
          }}
        />
        <div className="mt-4">
          <SectionNav
            items={[
              { id: "a", label: "Plans" },
              { id: "b", label: "Location" },
              { id: "c", label: "Safety" },
              { id: "d", label: "Fees" },
              { id: "e", label: "Move-in cash" },
              { id: "f", label: "Apply" },
            ]}
          />
        </div>
      </Section>

      <Section title="Location with nearby tabs (made-up places)">
        <BuildingLocation
          pin={{ id: "x", name: "Sample building", latitude: 33.0, longitude: -96.75 }}
          miles={2.2}
          places={[
            ["grocery", "Sample Market", 0.004, 0.006],
            ["grocery", "Corner Grocer", -0.006, 0.003],
            ["bus_stop", "Main St Stop", 0.002, -0.004],
            ["bus_stop", "Oak Ave Stop", 0.0025, -0.0035],
            ["bus_stop", "Oak Ave Stop 2", 0.003, -0.003],
            ["gym", "Sample Fitness", -0.004, -0.006],
            ["cafe", "Sample Coffee", 0.007, 0.002],
            ["restaurant", "Sample Diner", -0.003, 0.008],
            ["school", "Sample Elementary", 0.009, -0.007],
            ["bank", "Sample Bank", -0.008, 0.001],
          ].map(([kind, name, dLat, dLng], i) => ({
            id: `p${i}`,
            kind: kind as "grocery",
            name: name as string,
            latitude: 33.0 + (dLat as number),
            longitude: -96.75 + (dLng as number),
          }))}
        />
      </Section>

      <Section title="Traffic chart (made-up numbers)">
        <TrafficChart
          destination="UT Dallas"
          points={[
            { hour: 6, minutes: 17 },
            { hour: 7, minutes: 27 },
            { hour: 8, minutes: 34 },
            { hour: 9, minutes: 26 },
            { hour: 10, minutes: 19 },
            { hour: 12, minutes: 18 },
            { hour: 14, minutes: 20 },
            { hour: 16, minutes: 28 },
            { hour: 17, minutes: 36 },
            { hour: 18, minutes: 31 },
            { hour: 19, minutes: 22 },
            { hour: 21, minutes: 16 },
          ]}
        />
      </Section>

      <Section title="Motion">
        <p className="mb-3 text-sm text-text-muted">
          Short and gentle: items fade up 12px in 0.35s, a little later one after another.
          Turned off for people who choose &quot;reduce motion&quot;. Presets live in
          components/motion/Reveal.tsx.
        </p>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <RevealBlock
              key={i}
              index={i}
              className="rounded-xl bg-surface-muted p-3 text-sm"
            >
              Item {i + 1} fades up
            </RevealBlock>
          ))}
        </div>
      </Section>

      <Section title="Trust">
        <TrustNotes />
      </Section>

      <Section title="Help and info">
        <InfoNote>
          Real cost = advertised rent + required monthly fees − deals over the lease.
        </InfoNote>
        <Tip summary="What's a guarantor?" className="mt-3">
          <p>Someone who promises to pay if you can&apos;t.</p>
        </Tip>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card as="section" className="p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </Card>
  );
}
