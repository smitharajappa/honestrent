PRODUCT: Swelt
STATUS: v2 DRAFT (10/29/2026). Updated after the Discovery Report (Smitha Rajappa,
Oct 2026). The synthetic interviews in that report are hypotheses until the six
real interviews are done. Every line below is a hypothesis until research/ and
interviews/ back it up.
PIVOT NOTES:
  10/25/2026: changed from landlord inspections to renter apartment search after
  professor feedback and competitor research. The old PRD is the record of why.
  10/29/2026: repositioned approval-first. The discovery report found approval
  uncertainty was the most common pain (4 of 6 interviews) and that fee
  transparency alone is a weak reason to switch for renters with good credit.
  The v1 PRD is in git history (commit 31ff73b and earlier).

POSITIONING: Approval-first renting for newcomers without US credit.
  Promise to renters: "Find a place that will say yes, and see what it really
  costs." Swelt ranks only by real cost and approval fit, never by who pays us.

USER:
  Beachhead: UT Dallas international graduate students (F-1, no SSN or US credit),
    arriving in waves before the fall and spring terms, often searching from
    abroad, sharing advice in cohort WhatsApp groups.
  First adjacent market: new OPT and H-1B professionals in Richardson and Plano
    who move without employer relocation help.
  Long-term: all DFW renters without US credit.
  Lower priority: employer-relocated movers and US citizens with a family
    co-signer (their approval problem is usually solved for them).

PROBLEM (in order of evidence):
  (New evidence, Oct 2026: one renter's ledger shows $213-$274/month above
  rent, 12-16%, mostly utilities billed by the building. See
  research/ledger-example-2026.md.)
  1. Approval uncertainty: renters can't tell which buildings will accept them
     without an SSN or US credit, so they pay application fees (typically $50
     each) and lose weeks.
  2. Move-in cash: guarantor fees (about one month's rent), double deposits and
     surprise document requests make the first month far more expensive.
  3. Real cost: required fees and move-in specials make advertised rent a poor
     guide (64.6% of Dallas listings offered a concession in June 2026).

CORE USER STORY:
  As a newcomer without US credit, I can see which nearby apartments are likely
  to approve me, what each will really cost per month and to move in, and what
  documents I need, so that I apply only where I fit and don't waste fees.

FEATURES

  Built and live (swelt.vercel.app):
  F1. Search by real monthly cost (rent + required fees - deals spread over the
      lease), with advertised rent beside it and the last-verified date.
  F2. Approval fit: income range, credit band and ID type give Good fit,
      Possible with guarantor, or Unlikely, with a one-line reason. Answers stay
      on the renter's device.
  F3. Building detail and "I'm interested" leads saved for the team.
  F4. Design system and usability review (Nielsen's heuristics, DESIGN.md).

  Round 1 (now; no new data or services needed):
  R1.1 Approval-first home and full-width layout - done means: the approval
       questions sit in the main search, results use the full screen width on
       laptops (filters on the left, card grid on the right) and stay one
       column on phones.
  R1.2 New result cards - done means: each card shows a drawn cover (replaced by
       a real photo only when the building supplies one), a cost bar (rent,
       + fees, - deals), the fit badge and a save button.
  R1.3 Filters and sort - done means: chips for bedrooms, city, Good fit only
       and Has deals; sort by real cost, biggest savings or best fit.
  R1.4 Save - done means: renters can save buildings and see them in a Saved
       view. Stored on the device only.
  R1.5 Compare - done means: renters can compare 2 or 3 buildings side by side
       (real cost, fees, deals, approval fit, availability).
  R1.6 Roommate cost split - done means: a toggle shows the cost per person for
       2 or 3 roommates. No roommate matching yet.
  R1.7 Trust - done means: an insight banner shows the average gap between
       advertised and real cost, plus a visible "we never rank by who pays us"
       promise and scam-safety tips.

  Round 2 (next; needs a database change and data from the 10-building check):
  R2.1 Move-in cash estimate per building: application fee, admin fee, deposit
       (normal and no-credit), guarantor fee, prorated rent, minus any moving
       perk.
  R2.2 Application fees saved: "Skipping the 3 unlikely buildings saves you
       about $150."
  R2.3 Documents checklist per building (for example: offer letter accepted as
       income proof; I-20 and bank statements needed).
  R2.4 Finer approval rules: ITIN and passport-only handled separately; deposit
       policy for thin or no credit; guarantor companies accepted; Nova Credit
       international reports accepted.
  R2.5 Guarantor help: which guarantor companies each building accepts and what
       they typically cost, folded into R2.1.
  R2.6 Map with up to 5 favourite places (campus, work, grocery, temple, gym):
       distance from each building. Places saved on the device. Needs a map
       service (approval required).
  R2.7 Distance to UTD and bus access per building.
  R2.8 Utilities billed by the building - done means: each building shows how
       utilities are billed (split by meter, split by formula, included, or
       none), its line items (water, sewer, trash, drainage, admin and billing
       fees), and an average with a low-high range per bedroom count, each with
       a source label ("Building's 2025 average", "Renters reported",
       "Estimate") and a verified date. Electricity paid to the renter's own
       provider is shown separately.
  R2.9 Estimated total - done means: results rank by estimated total per month
       (real cost + average utilities billed by the building), with the
       estimate and its range clearly labeled.
  R2.10 Anonymous renter bills - done means: renters can share one month's
       charges for a building as line items and amounts (building, month,
       bedrooms, amounts only). Never names, unit numbers or screenshots.
       Reports feed the utility ranges after a basic sanity check.
  R2.11 Location search - done means: renters can search by city, ZIP or
       neighbourhood anywhere in DFW. Areas without data yet show a
       "Request my area" button that records demand (area name and date only).

  R2.12 Reported incidents nearby - done means: each building shows counts of reported
       incidents within half a mile over the last 12 months (against people, property,
       other), compared with the city average for an area that size, with the source and
       a link to the police department's own map. Counts only: no score, grade or
       ranking. Only where the city publishes open data (Dallas now; Richardson and Plano
       show a link until a bulk source exists). See research/safety-data.md.

  Round 3 (then; needs accounts, payments and email services):
  R3.1 "Swelt Plus" waitlist test before building payments. BUILT (Nov 2026): four passes
       (Browse 7 days $5.99, Tour 14 days $8.99, Apply 21 days $11.99, Move-in 28 days
       $14.99; one-time, no auto-renew) shown at /plus with a join button, plus anonymous
       daily view and join counts. Optional sign-in (Google or email link) exists. Passes
       unlock only extras (drive times to places you add); search, real cost and approval fit
       stay free. See docs/sign-in-setup.md.
  R3.2 Move Pass: optional paid access for 30, 60 or 90 days.
  R3.3 Price history and alerts (Move Pass): price-drop alerts and the highest
       price in the last 30 days.
  R3.4 Commute with traffic (Move Pass): typical rush-hour drive time to work.
  R3.5 Saved places and buildings synced across devices (accounts).

  Round 4 (later):
  R4.1 Roommate matching (Move Pass). FIRST VERSION BUILT (Nov 2026): signed-in renters make a
       profile (nickname, city, budget, move-in date, languages, interests, sleep, cleaning,
       guests, smoking, pets, study habits, short note) and see people in the same city ranked by
       habit fit with plain reasons. They ask for an introduction; chat opens only after both
       accept, is rental-topics-only with safety checks (no links, contact or payment details),
       and has report and block. Verified tag: team-set only (sample profiles for the demo); an
       ID-check vendor is not chosen yet and no ID scan is ever stored. Still to do: ID-check
       vendor, stronger chat moderation, email alerts for new matches. See docs/roommates.md.
  R4.2 Landlord portal: free listings, with Swelt verifying fees and approval
       rules before they show.
  R4.3 Lease referrals: properties pay when a renter signs, through a partner
       broker.
  R4.4 Movers program (see HOW WE MAKE MONEY).
  R4.5 Partner referrals: guarantor companies, Nova Credit, student lenders.
  R4.6 Anonymous approval outcomes from renters (after legal advice).
  R4.7 Renter Passport with partners (after legal advice).

HOW WE MAKE MONEY (to test):
  Renters:
    - Core search, real cost and approval fit stay free and unlimited.
    - Move Pass (optional, 30/60/90 days) unlocks alerts, commute with traffic,
      roommate matching and synced saves. Prices to test, for example $9 for 30
      days and $19 for 90 days. Compare its value with the guarantor fee (about
      one month's rent) and application fees saved, not with locators, who are
      free to renters in Texas.
  Properties:
    - Listings are free.
    - Pay per signed lease (about 75% of one month's rent in the report),
      split 50/50 with a licensed partner broker. Texas requires a real estate
      license to be paid for locating.
    - Paying never changes ranking. Commissions are disclosed.
  Movers program:
    - A building may offer "we cover 50% of your move" as a move-in perk,
      shown like any other deal.
    - Swelt arranges the move with vetted partner movers and earns a disclosed
      referral fee from the mover.
    - Any discount negotiated with movers goes to the renter.
  Partners:
    - Referral fees from guarantor companies, Nova Credit and student lenders,
      disclosed to renters. MPOWER (no-cosigner loans that can cover housing at
      US schools) paused new loans for 2026, so this waits.
  Unit economics (report base case): about $563 Swelt share per lease, target
  acquisition cost about $83, break-even about 4 leases a month.

DATA WE STORE:
  Buildings: address, last-verified date, required monthly fees, current deals,
  approval rules, floor plans with rent, lease length and availability.
  Round 2 adds: application and admin fees, deposits, guarantor companies
  accepted, documents required, distance to UTD, bus access, utility billing
  method and line items with average and range per bedroom count, anonymous
  renter-reported monthly charges (building, month, bedrooms, amounts only),
  and "Request my area" demand (area name and date only).
  Leads: building, floor plan, email, move-in date, budget, date.
  Round 3 adds: renter accounts (email), price history, alert settings.
  Round 4 adds: roommate profiles with lifestyle preferences only.
  On the renter's device only: approval answers, saved buildings, compare list,
  favourite places (until accounts exist and the renter opts in).
  Never store: SSNs, ID scans, exact credit scores, immigration status,
  nationality, religion, or any other protected characteristic.

LEGAL AND TRUST GUARDRAILS:
  - Paid locating in Texas needs a real estate license: use a partner broker.
  - Don't store screening data or act as a consumer reporting agency (FCRA):
    partner for the Renter Passport instead.
  - Approval predictions use documents, credit and income only, never national
    origin or other protected traits (fair housing).
  - Roommate matching uses lifestyle preferences only: no field, filter or ranking for race,
    ethnicity, religion, nationality, sex, family status or disability. A roommate site that
    asked such questions and filtered on them was held liable under fair housing law
    (Roommates.com, 2012), so get legal advice before ever adding one. Free-text notes must not
    exclude people by who they are.
  - Neighbourhood incident counts are shown the same way for every building and every
    renter. We never use victim, suspect, race, sex or any personal field from police
    data, never publish a safety score or grade, and never filter or rank buildings by
    who lives nearby. Get fair housing advice before adding a "safest first" sort.
  - Swelt does not lend money or act as a guarantor.
  - No copying photos or data from other websites or Google Maps.
  - Demo mode stays on until building data is real.

OUT OF SCOPE (for now):
  - Live data feeds or scraping; buildings are entered by hand (Wizard of Oz)
  - Native mobile app
  - Building data beyond Richardson-Plano. Search works for any DFW city, but
    data collection stays in Richardson-Plano until it reaches about 30
    buildings (the report's atomic network) or landlords self-list (R4.2).
    "Request my area" measures demand in Dallas and Fort Worth first.
  - Software for landlords (vertical SaaS)
  - Swelt as a lender or guarantor

KILL CRITERIA:
  1. Across 10 Richardson-Plano buildings, real monthly cost differs from
     advertised rent by less than $25 on average.
  2. Fewer than 2 of 5 recent newcomer movers were surprised by fees or
     turned down / asked for extra deposit.
  3. A competitor (Sunny, Apartment List, Apartments.com AI) already shows
     both real monthly cost and approval fit for Dallas.
  4. Fewer than 5% of renters who see the Swelt Plus waitlist join it in the
     first season (then drop the Move Pass and stay commission-only).

NEXT EVIDENCE (from the discovery report):
  - Six real customer interviews (add: would you trust an approval prediction?
    what would make you apply through a new site?).
  - Check fee disclosure, approval rules, guarantor companies accepted and
    documents required at 10 Richardson and Plano complexes.
  - At each building, ask for last calendar year's average, highest and lowest
    monthly water/wastewater bill (Texas PUC rules require owners to provide
    it), plus trash, drainage and admin fees.
  - Confirm commission rates and partner broker terms.
  - Test cost per lead with one student-group post.
  - Get advice on licensing, credit reporting and fair housing before R4.6
    and R4.7.
