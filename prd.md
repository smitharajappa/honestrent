PRODUCT: Swelt
STATUS: DRAFT. Every line below is a hypothesis until research/ and interviews/ back it up.
PIVOT NOTE (10/25/2026): Changed from landlord inspections to renter apartment
search after professor feedback and competitor research. Keep the old PRD in
research/ as the record of why.

USER: a newcomer renting in Richardson-Plano, Texas (international student,
  H-1B worker, green card holder, or anyone relocating) looking for an
  apartment in the next 60 days, often without US credit history.
  Renters use Swelt free. Buildings will pay later (see HOW WE MAKE MONEY).

PROBLEM: Advertised rent hides mandatory fees and move-in deals, and renters
cannot tell before paying an application fee whether a building will approve
them, so they compare the wrong numbers and get turned down.

CORE USER STORY:
  As a newcomer renter, I can enter my budget, move-in date and approval
  profile and see nearby apartments ranked by real monthly cost with a clear
  "likely to approve" signal, so that I apply only where I fit and pay the
  least.

FEATURES (maximum 3):
  1. Search with real monthly cost - done means: a renter enters budget and
     move-in date and sees a list of buildings sorted by real monthly cost
     (rent + mandatory monthly fees - deals spread over the lease), with the
     advertised rent shown next to it.
  2. Approval fit - done means: a renter enters income range, credit band
     (or "no US credit") and ID type (SSN, ITIN, passport only), and each
     building shows "Good fit", "Possible with guarantor", or "Unlikely",
     with the reason in one line.
  3. Building detail and interest request - done means: a renter opens a
     building, sees the fee and deal breakdown, its approval criteria, and
     the date the data was last verified, and submits "I'm interested",
     which saves a lead the team can see.

OUT OF SCOPE (the v2 parking lot):
  - Live data feeds or scraping; buildings are entered by hand (Wizard of Oz)
  - Group/roommate search and per-person cost split
  - Movers, insurance and utilities bundle
  - Placement fees, payments, cash back (needs a licensed brokerage partner)
  - AI chat search
  - Native mobile app
  - Cities beyond Richardson-Plano

DATA WE STORE:
  Buildings. Each building has an address, a last-verified date, mandatory
  monthly fees, current deals, and approval criteria (minimum income as a
  multiple of rent, minimum credit score, accepts no SSN, accepts guarantor,
  accepts international credit report). Each building has floor plans with
  rent and lease length. Renters save a search profile (budget, move-in date,
  income range, credit band, ID type). Leads link a renter profile to a
  building with a date and contact email.
  Never store SSNs, ID scans, exact credit scores, or immigration status.

HOW WE MAKE MONEY (to test):
  - First: referral fees from movers, renters insurance, guarantors.
  - Then: featured listings for buildings.
  - Main: placement fee per lease through a licensed Texas brokerage partner
    (Texas requires a real estate license to be paid for locating).

KILL CRITERIA:
  1. Across 10 Richardson-Plano buildings, real monthly cost differs from
     advertised rent by less than $25 on average.
  2. Fewer than 2 of 5 recent newcomer movers were surprised by fees or
     turned down / asked for extra deposit.
  3. A competitor (Sunny, Apartment List, Apartments.com AI) already shows
     both real monthly cost and approval fit for Dallas.
