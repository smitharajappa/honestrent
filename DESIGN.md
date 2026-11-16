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

## Identity: the receipt and the stamp (Nov 2026)

The first look was the generic AI-app kit: teal, Inter with Plus Jakarta Sans, very rounded
cards with soft shadows, pill badges and a pastel gradient hero. Our professor said it showed
"obvious signs of being generated". It looked like every other app, so it said nothing about
ours. We compared three directions on one card (`docs/design-review/directions.html`):

| Direction                          | Borrowed from                   | Why we didn't pick it alone                                                                  |
| ---------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------- |
| **A. The honest receipt** (chosen) | An itemised bill or rent ledger | Can feel cold, so B's stamps add the human decision.                                         |
| B. The passport                    | Passport cover and entry stamps | The whole look would tie the brand to immigration status, which we never ask about or store. |
| C. Wayfinding                      | Transit signs                   | Says "location", not "honest cost". The core promise gets lost.                              |

**Why the receipt:** our promise is an itemised price. Renters already audit their ledgers line
by line (see `research/ledger-example-2026.md`). A receipt shows the promise before anyone reads
a word.

**Why the stamp:** approval is a decision someone makes about you. Newcomers meet those
decisions as stamps (visa, I-20, passport), so a stamp reads as "decided", not "decoration".

## Vibe words

**Itemised · Checkable · Decided.** Calm, never salesy. Every number can be checked by eye; every
approval says who decides and why.

## Color: and why each one

- **Paper and ink, 60%:** a slightly cool paper page (`bg`) with white receipt slips
  (`surface`) and blue-black ink text (`text`). Why: thermal paper and receipt ink are cool, not
  cream. We avoid warm cream on purpose because it is a common generated look.
- **Ballpoint blue `brand`, 10%:** actions only (buttons, links, focus, selected states). Why: it
  is the pen you sign a lease with, and blue reads as "you can press this" without borrowing a
  bank's or a listing site's color. It replaced teal, which many generated apps use.
- **Highlighter `mark`:** used **only** on charges the advert hid (required fees, utilities billed
  by the building) and the `marker` text style. Why: renters mark up surprise charges on their
  own ledgers with a highlighter. If it is yellow, it was hidden. Never used for anything else.
- **Deal sticker `accent`:** a pale green tag for move-in deals. Why: a price sticker, and green
  already means "taken off".
- **`rule`:** dotted leader lines and dashed tear lines. Decoration only.
- **One meaning per color**, always with words and an icon:
  - green `success`: savings, deals taken off, good fit, "ready";
  - amber `warning`: costs added, possible with guarantor, data may be stale;
  - soft rose `unlikely`: "Unlikely" approval. Never alarm red: our renters have often been
    refused already, so it always comes with the reason and a nearby good fit;
  - grey `neutral`: unknown or unconfirmed. Never blue, so the eye isn't drawn to what we can't
    confirm;
  - red `danger`: errors only; blue `info`: tips; slate `slate`: neighbourhood facts, never
    graded.
- **Decorative colors** (`--hero-*`) are for page backgrounds only. The old `--cover-*` colors
  are no longer used.
- Never write raw hex colors in components. Add or change a token in `globals.css`.
- Every text color must pass WCAG AA (4.5:1 body text, 3:1 large text and input borders) in
  light **and** dark mode.

## Brand

- **Logo:** `components/ui/Logo.tsx`: an H under a roof, with a highlighter line across it like a
  marked receipt line. Pen blue, flat (no gradient), with less rounded corners.
- **Receipt pieces** (utilities in `globals.css`): `figure` (equal-width digits for every
  price), `leader` (the dotted line between a label and its amount) and `marker` (the
  highlighter, for hidden charges only).
- **Stamps:** `components/ui/Stamp.tsx` (`stamp` utility). Good fit, Possible with guarantor and
  Unlikely are tilted ink stamps. "Rules not confirmed" is a straight, dashed outline, because
  nobody has decided anything yet.
- **Cost strip:** `CostStrip` in `components/ResultCard.tsx`. Every card shows the same four
  columns: Rent · Fees · Utilities · Move-in. Why: Japanese rental listings show rent,
  management fee, deposit and key money in fixed columns, so renters compare at a glance. A
  part the building hasn't shared says **"Not disclosed"** instead of disappearing (like the
  UK rule that rent and deposit must be filled in before a listing goes live).
- **One big total, breakdown on tap:** like Airbnb's total price. The card leads with the
  estimated total; "Full breakdown" opens `components/CostReceipt.tsx` (each line of the bill,
  so it can be checked by eye).
- **Map thumbnails instead of drawn covers:** `components/map/MapThumb.tsx` draws the streets
  around each building from our own map tiles, once, and keeps it as a picture. Why: drawn
  skylines were decoration pretending to be a photo. A map is real and tells the renter
  something (what is nearby). A real photo replaces it once a building supplies one.
- **Shape:** 6px corners (`rounded-md`) on cards, buttons and fields; 2px on badges. Pills stay
  only for filter chips, avatars and round icon buttons.
- **Depth:** cards are flat with a border; hover darkens the border instead of lifting the card.
- Motion: small and quick (150 to 300ms), always off for people who ask for less motion.

### What we removed because it looked generated (Nov 2026)

After the redesign it still looked generated, so we checked it against published lists of
"AI design tells" and how real rental sites look. We removed:

| Removed                                                                               | Why                                                                                                 |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Pill label above the headline                                                         | The default generated hero. It also looked clickable.                                               |
| One headline phrase highlighted in colour                                             | A common generated move; the highlighter now means only "hidden charge".                            |
| Small capital monospace labels on sections                                            | Read as decoration. Labels are now plain sentence case.                                             |
| Monospace for prices, zigzag receipt edge                                             | Monospace used to look "technical" is a known tell. Equal-width digits do the real job.             |
| Marketing hero with two buttons before the product                                    | Real rental sites open on search and listings. The home page now is the search.                     |
| Four icon-tile step cards, three icon "why" cards, coloured band with blurred circles | The most common generated landing-page layout. Now a plain numbered list beside one worked example. |
| Drawn building covers and hero skyline                                                | Decoration pretending to be a photo. Replaced with real map thumbnails.                             |
| Cards lifting on hover                                                                | Generic hover effect. The border darkens instead.                                                   |

## Type: and why each face

- **Headings: Archivo** (`font-heading`), at a narrowed width (`font-stretch` 75–85%). Why: it
  looks like a printed header or a stamp, is sturdy at small sizes, and the narrow width fits
  long building names on a phone.
- **Body and forms: Public Sans** (`font-sans`). Why: it was made for US government websites and
  forms, the same kind of forms newcomers fill in. It reads as plain and official.
- **Figures:** Public Sans with equal-width digits (`figure` utility), so amounts line up in a
  column and can be compared at a glance. No monospace font.
- Labels (`eyebrow`) are short, plain and in sentence case. Use them only when a heading needs
  one, never on every section.
- Body text is at least 16px in inputs (phones zoom in on smaller text).
- One `h1` per page. Headings go in order (h1 → h2 → h3).
- Both fonts load through `next/font` (served from our own site, no new library).

## Layout

- Pages use the full screen up to 1440px (`page-container`), with 16/24/32px side
  margins on phone, tablet and laptop.
- Results: a sticky filter sidebar on laptops (`lg`), a collapsible "Filters" panel on
  phones; cards in a 1/2/3-column grid.
- Building pages: content on the left, a sticky price summary on the right on laptops.
- Check every screen at 320px, 375px and 1440px wide. Nothing may scroll sideways.

## Shape and space

- Corners: cards and controls `rounded-md` (6px), badges `rounded-sm`, chips and avatars
  `rounded-full`.
- Spacing on a 4px grid (Tailwind's default scale).
- Two shadows only: `shadow-card` (a paper slip resting) and `shadow-raised` (lifted).
- Tap targets are at least 44px tall.

## Components (reuse before creating)

`components/ui/`: `Button` / `ButtonLink` (primary, secondary, ghost), `Field`, `Select`,
`Card`, `Badge`, `Stamp` (approval fit), `Tip`, `InfoNote`, `icons`.

Honest Rent-specific: `map/MapThumb` (map picture of the building's block), `CostStrip`
(the four fixed cost columns), `CostReceipt` (rent, + fees, + utilities, − deals, as receipt lines), `home/CostReveal` (the worked example of ad price vs real cost), `home/HowItWorks` (a plain numbered list beside the example), `ui/Logo`, `ResultCard`, `explore/FiltersPanel` (toggle
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

## Accessibility checks

- A "Skip to content" link is the first Tab stop on every page.
- Run before a release: axe-core (WCAG 2.1 AA plus best practices) over every page in light and
  dark, laptop and phone. The last run found nothing left to fix.
- Labels need a role to be valid (a plain div with `aria-label` needs `role="img"`); a table is
  hidden by wrapping it in `sr-only`, not by putting `sr-only` on the table; a widget with
  clickable parts inside (a map) is a `group`, not an `img`.

## Do / Don't

| Do                                                   | Don't                                          |
| ---------------------------------------------------- | ---------------------------------------------- |
| Lead with the real monthly cost                      | Lead with advertised rent                      |
| Pair every status color with words and an icon       | Use color alone to mean something              |
| Show the "last verified" date wherever prices appear | Hide how fresh the data is                     |
| Keep renter answers on their device                  | Ask for SSN, exact score or immigration status |
| Use pen blue for actions only                        | Paint labels, info boxes or icons blue         |
| Use the highlighter only for charges the ad hid      | Highlight deals, headings or anything else     |
| Use `figure` for every price                         | Mix proportional and monospaced prices         |

## Review loop

When a screen drifts (a random hex color, a one-off button), fix it **and** add a rule
here so it doesn't happen again.
