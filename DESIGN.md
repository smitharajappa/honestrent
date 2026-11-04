# Honest Rent design guide

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
- **10% brand teal:** the one brand color. Used for actions (primary buttons, links, focus
  ring) and **selected states** (List/Map toggle, filter chips, section bar, map tabs) and
  the rent part of the cost bar. Not for labels or info boxes.
- **One meaning per color**, always with words and an icon:
  - green `success`: savings, deals taken off, good fit, "ready";
  - amber `warning`: costs added (fees, utilities), possible with guarantor, data may be stale;
  - soft rose `unlikely`: "Unlikely" approval. Never alarm red: our renters have often
    been refused already, so it always comes with the reason and a nearby good fit;
  - grey `neutral`: unknown or unconfirmed ("Rules not confirmed", "Not known"). Never
    blue, so the eye isn't drawn to the one thing we can't confirm;
  - red `danger`: errors only;
  - blue `info`: explanations and tips;
  - slate `slate`: neighbourhood facts (incident counts). Never red or graded.
- **Warm accent** `accent` (amber #E8A33D): deal tags and small highlights only.
- **Approval fit has four states:** Good fit (green), Possible with guarantor (amber),
  Unlikely (soft rose), Rules not confirmed (grey), each with an icon and a one-line reason.
- **Decorative colors** (`--cover-1` to `--cover-6`, `--hero-*`) are only for building
  covers and the hero illustration. Never use them for text, status or actions.
- Never write raw hex colors in components. Add or change a token in `globals.css`.
- Every text color must pass WCAG AA (4.5:1 body text, 3:1 large text and input
  borders) in light **and** dark mode.

## Brand

- **Logo:** `components/ui/Logo.tsx`: an H under a roof, with an amber bar like a receipt line.
  Header, tab icon (`app/icon.svg`) and phone icon (`app/apple-icon.png`) all use it. Colors are
  the `--logo-*` tokens: a teal that deepens toward one corner, plus the warm amber.
- Gradients and glows are decoration only. Buttons and links stay solid brand teal so text
  keeps its contrast.
- Motion: small and quick (150 to 300ms), always off for people who ask for less motion.

## Type

- **Headings:** Plus Jakarta Sans (`font-heading`): friendly and clear.
- **Body, numbers and forms:** Inter (`font-sans`). Prices use `tabular-nums`.
- Big moments: `display` (one per page, fluid size) with an `eyebrow` label above it.
- Body text is at least 16px in inputs (phones zoom in on smaller text).
- One `h1` per page. Headings go in order (h1 → h2 → h3).

## Layout

- Pages use the full screen up to 1440px (`page-container`), with 16/24/32px side
  margins on phone, tablet and laptop.
- Results: a sticky filter sidebar on laptops (`lg`), a collapsible "Filters" panel on
  phones; cards in a 1/2/3-column grid.
- Building pages: content on the left, a sticky price summary on the right on laptops.
- Check every screen at 320px, 375px and 1440px wide. Nothing may scroll sideways.

## Shape and space

- Corners: cards `rounded-2xl`, controls `rounded-xl`, chips `rounded-full`.
- Spacing on a 4px grid (Tailwind's default scale).
- Two shadows only: `shadow-card` (resting) and `shadow-raised` (floating).
- Tap targets are at least 44px tall.

## Components (reuse before creating)

`components/ui/`: `Button` / `ButtonLink` (primary, secondary, ghost), `Field`, `Select`,
`Card`, `Badge`, `Tip`, `InfoNote`, `icons`.

Honest Rent-specific: `BuildingCover` (drawn cover; shows a real photo once a building supplies
one), `CostBar` (rent, + fees, − deals), `home/CostReveal` (the home page's animated ad-vs-real price card), `home/HowItWorks` (steps, why, closing call to action), `ui/Logo`, `ResultCard`, `explore/FiltersPanel` (toggle
chips), `explore/InsightBanner`, `shortlist/SaveButton` and `CompareToggle`, `CompareTray`,
`TrustNotes`, `location/LocateButton` (device location or a ZIP code to measure from; kept in the tab, never sent or saved), `map/LazyMap` (maps, MapLibre + OpenFreeMap tiles) and `motion/Reveal` (fade-up animation presets; respects "reduce motion").

If a new pattern is needed, add it there and to `/styleguide`.

## Engagement, honestly

- Engagement comes from usefulness: save, compare, filters, roommate split. No streaks,
  countdown timers, fake scarcity ("2 people viewing!") or dark patterns.
- Photos stay secondary (discovery report: reduce marketing content). Never copy photos
  from other websites or Google Maps.
- Saved and compared buildings stay on the device. Approval answers stay in the tab.

## Usability rules (Nielsen's 10 heuristics, applied to Honest Rent)

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
