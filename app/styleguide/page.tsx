import type { Metadata } from "next";
import { BuildingCover } from "@/components/BuildingCover";
import { CostBar } from "@/components/CostBar";
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
