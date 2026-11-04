import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Honest Rent keeps, what stays on your device, and how to delete it.",
};

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-2 text-text-muted">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main>
      <PageHeader eyebrow="Your data" title="Privacy">
        Short version: you can use Honest Rent without an account, and we keep very
        little.
      </PageHeader>
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <p className="rounded-xl bg-warning-soft p-3 text-sm text-warning-text">
          Draft written by the Honest Rent team. It has not been reviewed by a lawyer yet.
        </p>

        <Section title="Never collected">
          <p>
            We never ask for or store a Social Security number, ID scan, exact credit
            score or immigration status.
          </p>
        </Section>

        <Section title="Stays on your device only">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Your approval answers (income range, credit band, ID type). They live in the
              open browser tab and are gone when you close it. We never tie them to an
              account.
            </li>
            <li>
              Saved and compared apartments, and the places you add for drive times. Kept
              in this browser until you clear them.
            </li>
            <li>
              Your location or ZIP, if you use &quot;measure from here&quot;. It is used
              in the open tab to work out distances and is never sent to our server or
              saved.
            </li>
          </ul>
        </Section>

        <Section title="What we do keep">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-text">An account (optional):</strong> your email,
              when you signed up and last signed in, and how you signed in. If you use
              Google, Google shares your name and picture link with our sign-in service,
              which stores them. We do not ask for or show a name. We store no password.
            </li>
            <li>
              <strong className="text-text">A roommate profile (optional):</strong> the
              nickname, city, budget, move-in date, languages, interests, habits, the kind
              of room you want, up to 3 apartment communities you are looking at, and a
              short note you choose. Other signed-in renters in your city can see those,
              never your email or account. You can hide or remove it any time. If you ask
              someone for an introduction and they accept, your chat messages are stored
              so you both can read them, Our team can technically see stored messages, and
              only looks at chats that are reported. You can also say your gender and
              whether you would share only with people of your own gender. We use that
              only to decide who can be matched with you, and it is never shown to other
              renters. We never ask about race, ethnicity, religion, nationality, family
              status or disability, and we never keep a copy of an ID.
            </li>
            <li>
              <strong className="text-text">Passes:</strong> the type and dates of any
              pass on your account.
            </li>
            <li>
              <strong className="text-text">
                &quot;I&apos;m interested&quot; and waitlist sign-ups:
              </strong>{" "}
              the email you gave, the apartment or pass you picked, and the date. Not tied
              to an account.
            </li>
            <li>
              <strong className="text-text">Anonymous counts:</strong> how many people saw
              the Honest Rent Plus page and how many joined the waitlist, by day. No names
              or emails.
            </li>
            <li>
              <strong className="text-text">Bills you share (if you share one):</strong>{" "}
              building, month, bedrooms and amounts only. No names, unit numbers or
              screenshots.
            </li>
            <li>
              <strong className="text-text">&quot;Request my area&quot;:</strong> the area
              name and the date.
            </li>
          </ul>
        </Section>

        <Section title="Other services that see something">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-text">Our hosts</strong> (Vercel for the website,
              Supabase for the database and sign-in) may keep technical logs, such as an
              IP address.
            </li>
            <li>
              <strong className="text-text">The map</strong> loads picture tiles from
              OpenFreeMap, which can see roughly which area you look at.
            </li>
            <li>
              <strong className="text-text">When you add a place for drive times:</strong>{" "}
              the address you type goes once to OpenStreetMap&apos;s address search, and
              the place goes to our traffic provider (TomTom) to get drive times. Honest
              Rent does not keep either.
            </li>
            <li>
              <strong className="text-text">Google,</strong> if you choose &quot;Continue
              with Google&quot;.
            </li>
          </ul>
        </Section>

        <Section title="Delete your data">
          <p>
            Signed in? Go to{" "}
            <Link
              href="/account"
              className="font-semibold text-brand-text underline underline-offset-2"
            >
              your account
            </Link>{" "}
            and press &quot;Delete my account&quot;. Your sign-in record and passes are
            removed. Clear saved places and apartments from your browser&apos;s site data,
            or tick the box on that page.
          </p>
          <p>
            To remove an &quot;I&apos;m interested&quot; or waitlist email, or a shared
            bill, contact us{" "}
            {CONTACT ? (
              <>
                at{" "}
                <a
                  href={`mailto:${CONTACT}`}
                  className="font-semibold text-brand-text underline underline-offset-2"
                >
                  {CONTACT}
                </a>
                .
              </>
            ) : (
              "(contact details will be added before launch)."
            )}
          </p>
        </Section>

        <Section title="Prices and data">
          <p>
            Building prices are entered by hand or taken from each community&apos;s own
            public page, with the date we checked. Always confirm with the building before
            you apply or pay any fee.
          </p>
        </Section>
      </div>
    </main>
  );
}
