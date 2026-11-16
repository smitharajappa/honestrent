import { TrustNotes } from "../TrustNotes";
import { CostReveal } from "./CostReveal";

// A real sequence, so it is a numbered list. Plain text: no icon tiles or step cards.
const STEPS = [
  {
    title: "Enter your budget and move-in date.",
    body: "Your own share if you live with roommates.",
  },
  {
    title: "Answer 3 private questions.",
    body: "Income range, credit and the ID you have. Never your SSN or exact score. The answers stay on your phone.",
  },
  {
    title: "See who is likely to approve you.",
    body: "Each building is stamped Good fit, Possible with guarantor or Unlikely, with the reason.",
  },
  {
    title: "Compare what you will really pay.",
    body: "Required fees and utilities added, move-in deals spread over the lease, and the cash you need before you get the keys.",
  },
];

/** Under the results on the home page: how it works, with one worked example. */
export function HomeSections() {
  return (
    <section
      aria-labelledby="how-heading"
      className="mt-16 grid gap-10 border-t border-border pt-10 lg:grid-cols-[1fr_26rem]"
    >
      <div className="min-w-0">
        <h2 id="how-heading" className="text-2xl font-bold sm:text-3xl">
          How Honest Rent works
        </h2>
        <ol className="mt-6 max-w-2xl space-y-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="figure w-6 shrink-0 text-xl font-bold text-brand-text"
              >
                {i + 1}
              </span>
              <p>
                <strong className="font-semibold">{step.title}</strong>{" "}
                <span className="text-text-muted">{step.body}</span>
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-2xl text-text-muted">
          Listing sites show the rent a building advertises. We add what the advert leaves
          out, check who accepts renters without an SSN or US credit, and never rank a
          building higher because it pays us. Free to search, no account needed.
        </p>
        <div className="mt-8 max-w-xl">
          <TrustNotes />
        </div>
      </div>
      <CostReveal />
    </section>
  );
}
