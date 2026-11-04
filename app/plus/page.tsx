import type { Metadata } from "next";
import { PlusPanel } from "@/components/plus/PlusPanel";
import { CheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Honest Rent Plus",
  description:
    "Optional passes for roommate matches, drive times to your own places, price alerts and synced saves.",
};

const FREE = [
  "Search by real monthly cost, with every fee and utility",
  "Approval fit and what each building will really ask for",
  "Building pages, move-in cash, maps and nearby places",
  "Drive times to UT Dallas",
];
const PLUS = [
  "Drive times from every apartment to up to 5 places you add (work, a grocery chain, a place of worship)",
  "Roommate matches and introductions (Tour, Apply and Move-in passes): see who fits your habits, room type and community. A free profile, answering introductions and chatting stay free",
  "Price-drop alerts (coming)",
  "Saved apartments and places on every device (coming)",
];

export default function PlusPage() {
  return (
    <main className="page-container py-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Honest Rent Plus</h1>
      <p className="mt-2 max-w-2xl text-lg text-text-muted">
        Search and real cost stay free, always. A pass adds extras for renters who are
        about to sign. One payment, no auto-renew.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section
          aria-labelledby="free-heading"
          className="rounded-2xl border border-border p-5"
        >
          <h2 id="free-heading" className="font-bold">
            Always free
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {FREE.map((t) => (
              <li key={t} className="flex gap-2">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-success-text" />
                {t}
              </li>
            ))}
          </ul>
        </section>
        <section
          aria-labelledby="plus-heading"
          className="rounded-2xl border border-brand p-5"
        >
          <h2 id="plus-heading" className="font-bold">
            With a pass
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {PLUS.map((t) => (
              <li key={t} className="flex gap-2">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-text" />
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">Pick a pass</h2>
        <PlusPanel />
      </div>
    </main>
  );
}
