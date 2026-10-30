# Swelt design guide

Read this before changing anything people see. It keeps every screen feeling like the
same calm, trustworthy app. The tokens live in `app/globals.css`, and the live examples
are at `/styleguide`.

## Who we design for

**Ana** (made-up persona), 26, an international grad student arriving at UT Dallas in
six weeks.

|                 |                                                                           |
| --------------- | ------------------------------------------------------------------------- |
| **Situation**   | Signing a lease from abroad, with no US credit history and no SSN yet.    |
| **Goal**        | A safe apartment she can afford, without wasting $50–75 application fees. |
| **Frustration** | Advertised rent hides fees, and she can't tell who will approve her.      |
| **Uses now**    | Apartments.com, WhatsApp groups of seniors, guesswork.                    |

**Problem statement:** Ana needs a way to compare what apartments _really_ cost and
whether they'll accept her, because advertised rent hides fees and approval rules are
invisible until she has paid to apply.

**How might we** help Ana trust a price and a "yes" in under 10 seconds?

## Vibe words

**Trustworthy · Clear · Welcoming.** Calm, never salesy. Money decisions deserve a quiet
interface.

## Color (60-30-10)

- **60% neutrals:** page background `bg-bg`, text `text-text`, borders.
- **30% surfaces:** cards `bg-surface`, inner panels `bg-surface-muted`.
- **10% brand teal:** only for **actions**: primary buttons, links, focus ring. Not for
  decoration, labels or info boxes.
- **Semantic colors** mean one thing each, always with words and an icon:
  - green `success`: good fit, savings, "ready";
  - amber `warning`: extra fees, possible with guarantor, data may be stale;
  - red `danger`: errors, unlikely;
  - blue `info`: explanations and tips.
- Never write raw hex colors in components. Add or change a token in `globals.css`.
- Every text color must pass WCAG AA (4.5:1 body text, 3:1 large text and input
  borders) in light **and** dark mode.

## Type

- **Headings:** Plus Jakarta Sans (`font-heading`): friendly and clear.
- **Body, numbers and forms:** Inter (`font-sans`). Prices use `tabular-nums`.
- Body text is at least 16px in inputs (phones zoom in on smaller text).
- One `h1` per page. Headings go in order (h1 → h2 → h3).

## Shape and space

- Corners: cards `rounded-2xl`, controls `rounded-xl`, chips `rounded-full`.
- Spacing on a 4px grid (Tailwind's default scale).
- Two shadows only: `shadow-card` (resting) and `shadow-raised` (floating).
- Tap targets are at least 44px tall.

## Components (reuse before creating)

`components/ui/`: `Button` / `ButtonLink` (primary, secondary, ghost), `Field`, `Select`,
`Card`, `Badge`, `Tip`, `icons`. If a new pattern is needed, add it there and to
`/styleguide`.

## Usability rules (Nielsen's 10 heuristics, applied to Swelt)

1. **Show status:** every action gives feedback (loading text or placeholder cards, success
   messages).
2. **Speak renter language:** say "real monthly cost", not "TCO". Explain ITIN, guarantor
   and similar terms where they appear.
3. **Easy exits:** "Edit search", "Start over", "Clear answers" and "Back to results" are
   always one tap away.
4. **Consistency:** the same words and colors mean the same thing everywhere.
5. **Prevent errors:** sensible limits (dates in the future, budget ranges) and quick-pick
   budgets.
6. **Recognition, not recall:** show what results are based on (budget, date, approval
   answers).
7. **Shortcuts:** budget chips, plus the URL keeps the search so it can be bookmarked.
8. **Only what matters:** cards show price, the difference from advertised, fit and plan.
   Details sit one tap away.
9. **Plain-language errors:** say what happened and what to do. Never show technical
   setup messages to renters.
10. **Help in context:** short tips next to the thing they explain. No separate manual.

## Do / Don't

| Do                                                   | Don't                                          |
| ---------------------------------------------------- | ---------------------------------------------- |
| Lead with the real monthly cost                      | Lead with advertised rent                      |
| Pair every status color with words and an icon       | Use color alone to mean something              |
| Show the "last verified" date wherever prices appear | Hide how fresh the data is                     |
| Keep renter answers on their device                  | Ask for SSN, exact score or immigration status |
| Use teal for actions only                            | Paint labels, info boxes or icons teal         |

## Review loop

When a screen drifts (a random hex color, a one-off button), fix it **and** add a rule
here so it doesn't happen again.
