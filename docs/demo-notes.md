# Honest Rent: demo notes (7 to 8 minutes)

Say the words in quotes. The lines starting with "Do" are what to click. Times are a guide.

## Before you start (5 minutes, once)

1. Merge the open pull request, then in GitHub: Actions, **Supabase migrations**, Run workflow
   (leave "baseline" off). Then **Load data into Supabase** (this adds the sample roommates).
2. Open https://honestrent.vercel.app in a fresh browser window. Sign in with your email link
   **before** the demo so you are not waiting for email on stage.
3. Open the site once on the roommate page and the Plus page so the first load is warm.
4. Keep the phone on the table in case someone wants to see it on a phone.
5. Know the honest limits (below). Saying them first makes you look careful, not weak.

## The words

### 0:00 The problem (45 seconds)

"Meet Ana. She is an international student arriving at UT Dallas in six weeks. She has no US
credit history and no Social Security number. She searches Apartments.com and sees a nice
apartment for $1,450. But the ad does not show the trash fee, the pest fee, the parking, or the
utilities. And it does not tell her if the building will even approve her, so she pays a $75
application fee to be told no. Honest Rent fixes both: **the real monthly cost, and the
chance of being approved**, before she pays anything."

### 0:45 Home page (60 seconds)

Do: stay on the home page. Click **Play again** on the card.

"This card is the whole idea. The ad says $1,450. Watch: required fees, utilities the building
bills, and a move-in deal. The real price is $1,620, a hundred and seventy dollars a month the ad
never showed. These numbers are made up for this card; the real buildings show their own."

### 1:45 Search (60 seconds)

Do: click **Anywhere in DFW**. Budget $2,200. Pick a move-in date. In "Will they approve you?"
choose income, **no US credit**, and a passport or ITIN. Click **Show apartments**.

"Renters choose a place first: a city, a ZIP, near me, or anywhere in Dallas–Fort Worth. We ask
three private questions about income, credit and ID. We never ask for a Social Security number or
an exact score, and the answers stay in this browser tab."

### 2:45 Results (60 seconds)

Do: scroll the cards. Point at the big price, the struck-through ad price, the fee chips, the
colored fit badge. Click **Map**, then back to **List**.

"Each building shows the real monthly cost, the ad price crossed out, and the biggest fees as
chips. The badge says Good fit, Possible with a guarantor, or Unlikely, and the reason. Where we
do not know a building's rules, we say **Rules not confirmed** instead of guessing. We never rank
by who pays us, only by real cost and approval fit."

### 3:45 One building (75 seconds)

Do: open a building (for example Cutters Point or a Camden community). Scroll slowly.

"The top box counts up from the ad price to the real price. Below: required fees, move-in
deals spread over the lease, utilities, cash needed to move in, documents to bring, and the
approval rules. Every price shows when it was last verified. The map shows nearby groceries,
bus stops and restaurants from OpenStreetMap. The safety section shows **counts only** from the
City of Dallas open data, with no scores or grades, to avoid unfair labeling. Drive times go to
UT Dallas, and signed-in renters can add other places."

### 5:00 Roommates (75 seconds)

Do: click **Roommates**. Show the form fields, then **Matches**. Open "How matching works".
Click **Request an introduction** on a sample match. Open the chat and the **Next steps** list.

"Sign-in is required. You choose the kind of room: a private room in a shared home, or sharing a
room with one more person. You can pick up to three apartment communities you are looking at.
Matches are people in your city, ranked on habits, budget, move-in date, languages, interests
and the same community. The ring is the match percent: here are 90, 50 and zero, scored with the
same rules. Chat opens only after both people accept, and it blocks links, phone numbers and
payment talk to protect against scams. We use no race, religion or nationality fields; the only
personal detail is an optional gender sharing preference, and other renters never see it."

### 6:15 Pass and checkout (40 seconds)

Do: **Plus**. Pick **Tour**. Click the demo checkout, then **Pay (demo)**. Open the profile menu.

"Search is free forever. A pass, 7 to 28 days, one payment, no auto-renew, adds roommate matches
and extra drive times. This checkout is a demo: no card is read and no money moves. When we turn
on real payments, the same flow goes to Stripe. The profile menu now shows my pass and the days
left."

### 6:55 How it is built (45 seconds)

"It is a mobile-first web app. Next.js and React with TypeScript, Tailwind for design,
Supabase for the Postgres database, sign-in and row-level security, and Vercel for hosting. Maps
are MapLibre with free OpenStreetMap data. GitHub Actions updates the database automatically.
There are 176 automated tests, and the pages pass an accessibility audit in light and dark mode.
I built it with an AI coding assistant, Claude Code, under my direction."

### 7:40 What is next and how AI helps (40 seconds)

"Next: real payments, ID checks for roommate verification, email alerts, and more buildings with
verified fees and approval rules. AI will help in three places, always with a human check:
reading leasing documents to draft fees and rules for us to verify; a second layer of chat
moderation behind our rules; and plain-language help in a renter's own language. AI will never
decide who is approved, and never see a Social Security number."

### 8:00 Close (15 seconds)

"Honest Rent: know the real price, and your chances, before you pay a cent. Thank you. Questions?"

## What is real and what is sample (say this if asked)

- 77 apartment communities are on the map (39 Plano, 37 Richardson, 1 Dallas), from OpenStreetMap.
- 11 have prices. **5 are real**, entered by hand from the communities' own pages (Cutters Point,
  Maya at White Rock, Camden Buckingham, Camden Legacy Park, Camden Legacy Creek). **6 are made up**
  for testing (Bluebonnet Lofts, Cottonwood Commons, Legacy Row Residences, Maple Creek Flats,
  Prairie Oak Apartments, Willow Park Place). Every price shows a "last verified" date.
- Approval rules are known for only some buildings. The rest say "Rules not confirmed".
- Safety counts exist for Dallas only. Richardson and Plano need public-records requests.
- Drive times use typical-hour estimates; live traffic switches on with a TomTom key.
- Roommate matches in the demo are made-up sample people, labeled "Sample profile".
- Payments are a demo. Nothing is charged.

## Tech stack

| Layer                | What we use                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| App                  | Next.js 15 (App Router), React 19, TypeScript                                                                                         |
| Design               | Tailwind CSS v4 with design tokens, Plus Jakarta Sans and Inter, `motion` for animation                                               |
| Maps                 | MapLibre GL JS with OpenFreeMap tiles, OpenStreetMap data                                                                             |
| Database and sign-in | Supabase: Postgres, row-level security, email-link sign-in                                                                            |
| Hosting              | Vercel                                                                                                                                |
| Automation           | GitHub Actions: database migrations, data loads, tests on every change                                                                |
| Quality              | Vitest (176 tests), ESLint, Prettier, axe-core accessibility audit                                                                    |
| Data sources         | OpenStreetMap, City of Dallas open data (incident counts), US Census ZIP centers, Nominatim (addresses), TomTom routing (planned key) |
| Built with           | Claude Code, an AI coding assistant                                                                                                   |

## Built, and still planned

Built: search by real monthly cost; approval fit with the reason; building pages with fees, deals,
utilities, move-in cash and documents; map with nearby places; neighborhood safety counts
(Dallas); drive times; saved and compare; optional sign-in, account and delete; roommate profiles,
matching, introductions and chat with safety rules; passes with a demo checkout; accessible,
dark-mode-ready design.

Planned (each new service needs approval first):

1. Real payments (Stripe), receipts, refunds, and a tax and legal check.
2. ID verification for the "verified" roommate tag (a third-party vendor; we never store ID scans).
3. Email alerts for new roommate matches and price drops (an email service).
4. More verified buildings: calls to leasing offices for fees, approval rules and guarantor terms.
5. Safety counts for Richardson and Plano; Google sign-in; real building photos from leasing offices.
6. A landlord portal: free listings that Honest Rent verifies.

## How we use AI, now and next

**Now:** AI helped build the app (Claude Code wrote code, tests and docs under direction, with
a human approving every plan). **Inside the product today: none.** Matching and chat checks are
plain, explainable rules, which is deliberate for fairness and trust.

**Next, with guardrails:**

| Idea                    | What AI does                                                                         | Guardrail                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Fee and rule extraction | Reads a leasing PDF or web page and drafts fees, deposits and approval rules         | A person verifies every figure before it shows; the "last verified" date stays      |
| Chat moderation         | A second layer behind the current rules to catch scams and harassment                | Rules stay first; reports go to a person; no ID or contact data sent                |
| Help in your language   | Explains fees, approval terms and leases in plain language, in the renter's language | Never gives legal advice; links to the source                                       |
| Bill reading            | Reads an uploaded utility bill to add real utility costs                             | Strip names and addresses first; ask for consent; delete after reading              |
| Match explanations      | Writes the "why you match" sentence                                                  | Only from lifestyle fields; never race, religion, nationality or anything protected |

**Never:** AI deciding who is approved, scoring people, using protected traits, or seeing SSNs,
ID scans, exact credit scores or immigration status.

## Likely questions

- **"Isn't the data just sample?"** Five communities have real prices from their own pages, each
  with a date. The point of the demo is the method: the ad price, the real price, and the chance
  of approval. Next we verify more buildings by phone.
- **"How do you make money?"** Search is free. Renters can buy a short pass (7 to 28 days) with
  roommate matches and extras. Landlords may later pay for verified listings, but we never rank
  by who pays.
- **"Fair housing?"** No race, religion, nationality, family status or disability fields or
  filters. Safety is counts only, with no grades. The roommate gender sharing preference is
  optional, applied inside shared homes, and never shown to others. We will still get a housing
  lawyer's review before a real launch.
- **"What about privacy?"** No SSN, ID scan, exact score or immigration status is ever stored.
  Approval answers stay in the browser tab. Accounts can be deleted from the Account page.
- **"What if the number is wrong?"** Every price shows its "last verified" date, and we say "confirm
  with the building." Renters can also share last month's charges anonymously to improve utilities.
