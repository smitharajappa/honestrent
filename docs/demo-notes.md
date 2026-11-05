# Honest Rent: speaker notes (about 8 minutes)

Say the words in quotes. Lines starting with "Do:" are what to click. Times are a guide.
About 900 spoken words (about 7 minutes at a calm pace) plus the clicks lands near 8 minutes.

## Before you start (5 minutes, once)

1. Merge the open pull request. In GitHub: Actions, **Supabase migrations**, Run workflow (leave
   "baseline" off). Then **Load data into Supabase** (adds the sample roommates).
2. Open https://honestrent.vercel.app in a fresh window and **sign in before the talk** so you
   are not waiting for an email on stage.
3. Open the Roommates and Plus pages once so the first load is warm.
4. Have the phone ready in case someone asks to see it on a phone.

---

## 0:00 Why I built this (50 seconds)

"Meet Ana. She is an international graduate student arriving at UT Dallas in six weeks. She has no
Social Security number and no US credit history. She is searching from abroad, asking in cohort
WhatsApp groups. Three things go wrong. First, she can't tell which buildings will approve her
until she pays an application fee, about fifty dollars, and loses weeks. Second, the cash to move
in is a surprise: a guarantor can cost about a month's rent, plus double deposits. Third, the
price in the ad is not the price: trash, pest, parking and utilities never show up. I built Honest
Rent so she can see **the real monthly cost and her chance of being approved before she pays
anything**."

## 0:50 Why now (45 seconds)

"Why now? In June 2026, nearly two in three Dallas listings, 64.6 percent, offered a concession, so
the ad price is rarely what you pay. One real resident's bills ran twelve to sixteen percent above
rent, $274 in one month, mostly utilities. That is one renter, not a sample, and I say so. And with no
US credit, a guarantor can cost seventy to a hundred and ten percent of a month's rent. Apartments.com
does not show approval fit at all. That gap is what I am building into."

## 1:35 Customer discovery (45 seconds)

Say this version if you have **not** done real interviews yet (it is the honest one):

"Here is what I know and what I don't. My October discovery report used six synthetic interviews:
simulated renters to form hypotheses, not real customers. In four of six, approval uncertainty was
the biggest pain, so the product became approval-first. The real evidence so far is that one
resident's bills. Next, I run six real interviews with UT Dallas international students: would you
trust an approval prediction, and what would make you apply through a new site? If fewer than two of
five recent movers were surprised by fees or turned down, I change course."

If you **have** done real interviews, replace the middle with: "I interviewed [N] students. [Name or
'a first-year student'] told me: '[real quote]'. [N] of [N] said approval was the hardest part." Only
use real quotes. Never present the synthetic ones as real customers.

## 2:20 Core features, live (about 3 minutes 40 seconds)

### Home (25 seconds)

Do: stay on the home page, click **Play again** on the card.

"This card is the whole idea. The ad says $1,450. Fees, utilities and a deal come in one by one, and
the real price is $1,620, a hundred and seventy dollars a month the ad never showed. These numbers are
made up for the card; real buildings show their own."

### Search and approval (45 seconds)

Do: **Anywhere in DFW**, budget $2,200, a move-in date. Choose income, **no US credit**, passport or
ITIN. Click **Show apartments**.

"Renters pick a place, then answer three private questions about income, credit and ID. We never ask
for a Social Security number or an exact score, and the answers stay in this browser tab."

### Results (40 seconds)

Do: scroll the cards, point at the big price, the struck-through ad price, the fee chips and the
fit badge. Click **Map**, then back to **List**.

"Each building shows the real monthly cost with the ad price crossed out, and its biggest fees.
The badge says Good fit, Possible with a guarantor, or Unlikely, with the reason. When we don't know
a building's rules we say **Rules not confirmed**, never a guess. We never rank by who pays us."

### One building (55 seconds)

Do: open Cutters Point or a Camden community. Scroll.

"The top box counts up from the ad price to the real price. Below it: required fees, deals, utilities,
cash to move in, documents to bring and approval rules, each with a last-verified date. The map shows
nearby groceries and bus stops, and the safety section shows counts only, from City of Dallas open
data, with no scores or grades."

### Roommates (50 seconds)

Do: **Roommates**. Show the form, then **Matches**, then open "How matching works". Click **Request an
introduction** on a sample match, open the chat and the **Next steps** list.

"Roommates need sign-in. You choose a private room or a shared room, and up to three communities you
are looking at. Matches are people in your city, ranked on habits, budget, move-in date, languages and
the same community. The ring is the match percent: 90, 50 and zero show how it works. Chat opens only
after both accept and blocks links, phone numbers and payment talk. There is no race, religion or
nationality anywhere; the only personal detail is an optional gender sharing preference that others
never see."

### Pass (25 seconds)

Do: **Plus**, pick **Tour**, demo checkout, **Pay (demo)**, open the profile menu.

"Search is free forever. A pass, seven to twenty-eight days, one payment, no auto-renew, adds roommate
matches and extra drive times. This checkout is a demo: no card, no money. The profile menu now shows
my pass and the days left."

## 6:00 The databases (45 seconds)

"Everything lives in one Supabase Postgres database: buildings, floor plans, fees, deals, utilities,
nearby places, safety counts, passes, and roommate profiles, introductions and messages. Seventy-seven
communities and about 3,950 nearby places come from OpenStreetMap. Eleven communities have prices I
entered by hand: five real, from the community's own page, and six made up for testing, each with a
last-verified date. Safety counts come from City of Dallas open data. Row-level security means you see
only your own account, and we never store a Social Security number, ID scan, exact credit score or
immigration status."

## 6:45 Tech stack (30 seconds)

"A mobile-first web app: Next.js and React with TypeScript, Tailwind, Supabase for the database and
sign-in, MapLibre with OpenStreetMap, and Vercel hosting. GitHub Actions updates the database, with 180
automated tests and an accessibility audit. I built it with an AI coding assistant, Claude Code, under
my direction."

## 7:15 What is planned and how AI helps next (40 seconds)

"Next: real payments with Stripe, ID checks for the verified roommate tag, email alerts, and more
verified buildings by phoning leasing offices. There is no AI inside the product today, on purpose:
matching is plain rules, for fairness. Next, AI will draft fees from leasing documents, add a second
layer of chat moderation, and explain terms in the renter's language, always with a person checking.
AI will never decide who is approved or see a Social Security number."

## 7:55 Close (15 seconds)

"Honest Rent: know the real price, and your chances, before you pay a cent. Thank you. Questions?"

---

## What is real and what is sample (say this if asked)

- 77 communities are on the map (39 Plano, 37 Richardson, 1 Dallas), from OpenStreetMap.
- 11 have prices. **5 are real**, entered from the communities' own pages: Cutters Point, Maya at
  White Rock, Camden Buckingham, Camden Legacy Park, Camden Legacy Creek. **6 are made up**: Bluebonnet
  Lofts, Cottonwood Commons, Legacy Row Residences, Maple Creek Flats, Prairie Oak Apartments, Willow Park
  Place. Every price shows a "last verified" date.
- Approval rules are known for only some buildings; the rest say "Rules not confirmed".
- Safety counts exist for Dallas only. Richardson and Plano need public-records requests.
- Drive times are typical-hour estimates; live traffic needs a TomTom key.
- Roommate matches in the demo are made-up sample people, labeled "Sample profile".
- Payments are a demo. Nothing is charged.

## Tech stack

| Layer                | What we use                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| App                  | Next.js 15 (App Router), React 19, TypeScript                                                           |
| Design               | Tailwind CSS v4 design tokens, Plus Jakarta Sans and Inter, `motion` for animation                      |
| Maps                 | MapLibre GL JS, OpenFreeMap tiles, OpenStreetMap data                                                   |
| Database and sign-in | Supabase: Postgres, row-level security, email-link sign-in                                              |
| Hosting              | Vercel                                                                                                  |
| Automation           | GitHub Actions: database migrations, data loads, tests on every change                                  |
| Quality              | Vitest (180 tests), ESLint, Prettier, axe-core accessibility audit                                      |
| Data sources         | OpenStreetMap, City of Dallas open data, US Census ZIP centers, Nominatim, TomTom routing (planned key) |
| Built with           | Claude Code, an AI coding assistant                                                                     |

## Built, and still planned

Built: search by real monthly cost; approval fit with the reason; building pages with fees, deals,
utilities, move-in cash and documents; map with nearby places; Dallas safety counts; drive times; saved
and compare; optional sign-in, account and delete; roommate profiles, matching, introductions and chat
with safety rules; passes with a demo checkout; accessible, dark-mode-ready design.

Planned (each new service needs approval first):

1. Real payments (Stripe), receipts, refunds, and a tax and legal check.
2. ID verification for the "verified" roommate tag (a vendor; we never store ID scans).
3. Email alerts for new roommate matches and price drops (an email service).
4. More verified buildings: calls to leasing offices for fees, approval rules and guarantor terms.
5. Safety counts for Richardson and Plano; Google sign-in; real building photos from leasing offices.
6. A landlord portal: free listings that Honest Rent verifies.

## How we use AI, now and next

**Now:** AI helped build the app (Claude Code wrote code, tests and docs under direction, with a person
approving every plan). **Inside the product today: none**, on purpose.

| Idea                    | What AI does                                                                         | Guardrail                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Fee and rule extraction | Reads a leasing PDF or page and drafts fees, deposits and approval rules             | A person verifies every figure before it shows; the last-verified date stays   |
| Chat moderation         | A second layer behind the current rules to catch scams and harassment                | Rules stay first; reports go to a person; no ID or contact data sent           |
| Help in your language   | Explains fees, approval terms and leases in plain language, in the renter's language | Never legal advice; links to the source                                        |
| Bill reading            | Reads an uploaded utility bill to add real utility costs                             | Strip names and addresses first; ask consent; delete after reading             |
| Match explanations      | Writes the "why you match" sentence                                                  | Only lifestyle fields; never race, religion, nationality or anything protected |

**Never:** AI deciding who is approved, scoring people, using protected traits, or seeing SSNs, ID
scans, exact credit scores or immigration status.

## Likely questions

- **"Isn't the data just sample?"** Five communities have real prices from their own pages, each with a
  date. The point is the method: ad price, real price, chance of approval. Next I verify more
  buildings by phone.
- **"Were the interviews real?"** Be direct: the six in the October report were synthetic hypotheses;
  the real evidence is one resident's ledger; six real interviews are next.
- **"How do you make money?"** Search is free. Renters can buy a short pass (7 to 28 days) with roommate
  matches and extras. Landlords may later pay for verified listings, but we never rank by who pays.
- **"Fair housing?"** No race, religion, nationality, family status or disability fields or filters.
  Safety is counts only, no grades. The roommate gender sharing preference is optional, only about
  sharing a home, and never shown to others. A housing lawyer's review comes before a real launch.
- **"Privacy?"** No SSN, ID scan, exact score or immigration status is ever stored. Approval answers stay
  in the browser tab. Accounts can be deleted from the Account page.
- **"What if a number is wrong?"** Every price shows its last-verified date and says "confirm with the
  building". Renters can also share last month's charges anonymously.
