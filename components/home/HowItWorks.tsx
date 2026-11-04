import { RevealItemOnScroll, RevealOnScroll } from "../motion/Reveal";
import { TrustNotes } from "../TrustNotes";
import { ButtonLink } from "../ui/Button";
import {
  CheckIcon,
  LockIcon,
  SearchIcon,
  ShieldIcon,
  TagIcon,
  UsersIcon,
} from "../ui/icons";

const STEPS = [
  {
    icon: SearchIcon,
    title: "Tell us your budget and move-in date",
    body: "Your share if you're living with roommates.",
  },
  {
    icon: LockIcon,
    title: "Answer 3 private questions",
    body: "Income range, credit, and the ID you have. Never your SSN or exact score.",
  },
  {
    icon: CheckIcon,
    title: "See who's likely to say yes",
    body: "Each building shows Good fit, Possible with guarantor, or Unlikely, with the reason.",
  },
  {
    icon: TagIcon,
    title: "Compare the real cost",
    body: "Required fees added, move-in deals spread over the lease. No surprises.",
  },
];

const WHY = [
  {
    icon: TagIcon,
    title: "Every fee, added up",
    body: "Application, admin, parking, utilities and move-in cash, shown before you tour. The ad price is just the start.",
  },
  {
    icon: ShieldIcon,
    title: "Approval fit before you apply",
    body: "See who takes no-SSN applicants, ITINs or a guarantor, so you don't pay $75 to be told no.",
  },
  {
    icon: UsersIcon,
    title: "Find a roommate you fit",
    body: "Match on habits, budget, move-in date and the community you both want. Chat opens only after you both agree.",
  },
];

/** Under the search card on the home page: how it works, why it's different, and a nudge to start. */
export function HomeSections() {
  return (
    <>
      <section aria-labelledby="how-heading" className="mt-16">
        <RevealOnScroll>
          <p className="eyebrow">How it works</p>
          <h2
            id="how-heading"
            className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            Four steps to a place that says yes
          </h2>
        </RevealOnScroll>
        <ol className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden="true"
            className="absolute top-[3.1rem] right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent via-border-strong to-transparent lg:block"
          />
          {STEPS.map((step, i) => (
            <RevealItemOnScroll
              key={step.title}
              index={i}
              className="relative list-none rounded-2xl border border-border bg-surface p-5 shadow-card transition-shadow duration-200 hover:shadow-raised"
            >
              <div>
                <span className="flex items-center gap-3">
                  <span
                    className="grid size-11 place-items-center rounded-xl text-white shadow-card"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, var(--logo-from), var(--logo-to))",
                    }}
                  >
                    <step.icon className="size-5" />
                  </span>
                  <span className="eyebrow !text-text-muted">Step {i + 1}</span>
                </span>
                <h3 className="mt-4 font-bold">{step.title}</h3>
                <p className="mt-1 text-sm text-text-muted">{step.body}</p>
              </div>
            </RevealItemOnScroll>
          ))}
        </ol>
      </section>

      <section aria-labelledby="why-heading" className="mt-20">
        <RevealOnScroll>
          <p className="eyebrow">Why Honest Rent</p>
          <h2
            id="why-heading"
            className="mt-1 max-w-2xl text-2xl font-extrabold tracking-tight text-balance sm:text-3xl"
          >
            The sites list apartments. We tell you what they&apos;ll really cost you.
          </h2>
        </RevealOnScroll>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {WHY.map((w, i) => (
            <RevealOnScroll key={w.title} index={i}>
              <div className="h-full rounded-2xl border border-border bg-surface p-6 shadow-card">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-text">
                  <w.icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{w.title}</h3>
                <p className="mt-2 text-text-muted">{w.body}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <RevealOnScroll>
        <section
          aria-labelledby="start-heading"
          className="relative mt-20 overflow-hidden rounded-3xl bg-brand p-8 text-brand-fg sm:p-12"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-brand-fg/10 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full bg-accent/25 blur-3xl"
          />
          <div className="relative max-w-2xl">
            <h2
              id="start-heading"
              className="display !text-3xl sm:!text-5xl text-balance"
            >
              Know the real price before you tour.
            </h2>
            <p className="mt-3 max-w-xl text-lg opacity-90">
              Free to search, always. No account needed.
            </p>
            <ButtonLink
              href="#search"
              size="lg"
              className="mt-6 !bg-surface !text-text hover:!bg-surface-muted"
            >
              Start my search
            </ButtonLink>
          </div>
        </section>
      </RevealOnScroll>

      <div className="mt-10 max-w-xl">
        <TrustNotes />
      </div>
    </>
  );
}
