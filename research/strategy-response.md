# Honest Rent: response to professor feedback (Nov 2026)

Four questions came back from the professor. This memo answers each one with evidence, says what
we changed, and names the test that would prove us wrong. Sources are linked inline. Anything
marked **(team judgement)** is our estimate, not a measured fact.

---

## 1. Rules differ by state and city, so the problem differs by region

**The feedback is right, and it changes how we expand.** Rental fee rules are now a patchwork.
Several states and cities require an all-in price; Texas does not, but Austin does.

### Jurisdiction rules table

| Place                             | Fee rule                                                                                                                                                                                                                                                                                                                                                                                                                                        | Screening rule                                                                                                                                                                                         | What it means for us                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Texas (state)**                 | No all-in price rule. Landlords must hand out written tenant selection criteria with the application, or refund the application fee if they reject without them ([Tex. Prop. Code §92.3515](https://texas.public.law/statutes/tex._prop._code_section_92.3515), [TexasTenant.org](https://www.texastenant.org/before-you-move-in-1/applications-and-deposits)). Owners must disclose last year's average water and wastewater bill (Texas PUC). | No portable screening report rule.                                                                                                                                                                     | **Biggest renter pain:** fees stay hidden. Our real-cost math is most valuable here. The §92.3515 rule is a renter right we can show on every building page.                                                                                                                                                                                                                                                                                                                                                    |
| **Austin**                        | Itemised list of mandatory, optional and estimated variable fees required for 5+ unit buildings, passed May 28, 2026; complaint-based, fine up to $500 ([Austin Equity and Inclusion](https://www.austintexas.gov/equity-inclusion/rental-fee-transparency-ordinance), [Community Impact](https://communityimpact.com/austin/east-austin/government/2026/06/08/new-austin-rental-fee-disclosure-requirement-to-boost-tenant-transparency/)).    | Same as Texas.                                                                                                                                                                                         | Operators must produce a fee list anyway, so asking them to share it with us costs them little. Texas's 2023 preemption law (HB 2127) may limit city rental rules; its reach over this ordinance is unsettled ([Texas Tribune](https://www.texastribune.org/2025/07/18/texas-legislature-death-star-law-city-ordinances-limits/), [Bisnow](https://www.bisnow.com/news/dallas-ft-worth/affordable-housing/eviction-filings-are-way-up-in-texas-a-new-law-prevents-cities-from-doing-anything-about-it-119562)). |
| **Colorado**                      | Ban on undisclosed rental fees from Jan 1, 2026 ([CoStar](https://www.costar.com/article/1725530122/colorado-bans-apartment-landlords-from-collecting-junk-fees)).                                                                                                                                                                                                                                                                              | Landlords must accept a renter's portable screening report (HB 23-1099) ([LeaseRunner](https://www.leaserunner.com/blog/portable-tenant-screening-report-by-state)).                                   | Fee pain is lower, so we lead with approval: an apply-once Renter Passport fits a law that already exists.                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Massachusetts**                 | All-in price rules for rentals from Sep 2, 2025 (940 CMR 38) ([Mintz](https://insights.mintz.com/insights-center/viewpoints/2025-08-04-preparing-allston-christmas-what-massachusetts-new-junk-fee)).                                                                                                                                                                                                                                           | No mandatory portable report.                                                                                                                                                                          | Large student market (Boston). Lead with approval and move-in cash, not fees.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Seattle / Bellingham**          | Seattle ordinance from July 1, 2027; Bellingham's already in effect ([CRE Daily](https://www.credaily.com/?p=222021)).                                                                                                                                                                                                                                                                                                                          | Washington has notice rules for reusable reports ([KVIA/Stacker](https://kvia.com/money/stacker-money/2025/02/06/renters-save-money-with-reusable-tenant-screening-reports-these-states-allow-them/)). | City-level rules inside one state: the clearest case for a rules table instead of a state flag.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Nevada, Connecticut, Virginia** | Fee transparency laws (Virginia from July 1, 2026) ([Entrata](https://www.entrata.com/blog/2025-fee-transparency-laws-in-the-rental-market-what-to-watch-in-2026)).                                                                                                                                                                                                                                                                             | Varies.                                                                                                                                                                                                | Same pattern: operators already prepare disclosures.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Federal**                       | FTC advance notice of rulemaking on rental fees, March 2026 ([Arnold & Porter](https://www.arnoldporter.com/en/perspectives/advisories/2026/02/ftc-prioritizes-hidden-fees-in-housing-rental-markets-amidst-broader-state-scrutiny-of-junk-fees)).                                                                                                                                                                                              | None.                                                                                                                                                                                                  | A national rule could make all-in prices common. Our moat cannot be the fee math alone (see question 3).                                                                                                                                                                                                                                                                                                                                                                                                        |

Operators call this a "compliance headache" because the rules are moving to cities and states
([Propmodo](https://propmodo.com/?p=181875)). That headache is our opening on the supply side
(question 2).

### What regulation does to our product

Regulation does not remove the problem; it **moves** it:

- **No fee law (Texas, most of DFW):** fees are hidden. Renters need our real-cost number most.
- **Fee law in place (Austin, Colorado, Massachusetts):** advertised prices get more honest, but
  approval for people without US credit, move-in cash and utilities that vary month to month
  stay unsolved. Operators now have a disclosure ready, so self-reporting to us is cheap.

So the **renter-side pain is highest where there is no law, and the supply-side cost of joining
is lowest where there is one.** We use both: launch where pain is highest, and expect
self-reporting to come easiest in regulated cities.

**Product change:** a `jurisdictions` table (state, city, rule, effective date, source link,
last checked). Each building page gets a short **"Your rights here"** box from that table, for
example in Texas: "Ask for the written selection criteria before you pay the application fee.
If they reject you without giving it, they must refund the fee." The rules are data, not code,
so a new city is a new row.

### Expansion scorecard **(team judgement, 1 = low, 5 = high)**

| Metro                       | Newcomer density                      | Hidden-fee pain             | Approval friction             | Ease of self-reporting | Total  | Order                                               |
| --------------------------- | ------------------------------------- | --------------------------- | ----------------------------- | ---------------------- | ------ | --------------------------------------------------- |
| **Dallas–Richardson–Plano** | 4 (UTD, large H-1B and OPT employers) | 5 (no law)                  | 5 (no portable report rule)   | 2                      | **16** | Now                                                 |
| **Houston**                 | 4 (UH, Rice, energy employers)        | 5                           | 5                             | 2                      | **16** | Next (same state rules, same playbook)              |
| **Austin**                  | 4 (UT Austin, tech employers)         | 3 (city fee list from 2026) | 5                             | 4                      | **16** | Next (tests the "regulated city" playbook in Texas) |
| **Boston**                  | 5                                     | 2                           | 4                             | 4                      | **15** | Later                                               |
| **Denver**                  | 3                                     | 2                           | 2 (portable reports required) | 4                      | **11** | Later                                               |

Newcomer density is backed by scale: the US hosted a record **1,177,766 international students**
in 2024/25, including 294,253 on OPT; India alone sent 363,019
([Open Doors 2025 fast facts](https://opendoorsdata.org/wp-content/uploads/2025/11/OD25_Fast-Facts.pdf),
[Lehigh summary](https://global.lehigh.edu/news/lehigh-university-international-student-enrollment-2024-2025)).
New enrolment fell about 7%, which is a risk to watch ([ACE](https://www.acenet.edu/News-Room/Pages/Open-Doors-2025.aspx)).

**Rule for the next city:** go when a metro scores 15 or more **and** the current metro passes
the flywheel targets below.

---

## 2. Manual data won't scale. How do buildings self-report, and how does the flywheel start?

The professor is right that a person checking every building does not scale. Our data comes from
four sources, and only the first is manual:

1. **Team-checked** (today): calls and visits, with a last-verified date.
2. **Building-reported** (next): the operator enters fees, deals, approval rules and utility
   averages.
3. **Renter-reported** (built): anonymous monthly bills, shown only after 3 reports per building
   and size.
4. **Outcome-reported** (later, after legal advice): "I applied with a passport and no SSN and was
   approved / asked for a double deposit".

### Why would a building self-report? Give it three reasons, in this order

1. **Comply once, publish everywhere.** Operators in Austin, Colorado, Massachusetts and other
   regulated places must produce an itemised fee list anyway. We give them a free form that
   creates that list in the required format, plus a public, honest listing. In Texas, the same
   form produces the §92.3515 selection criteria and the PUC water disclosure.
2. **Data is the price of a lead.** Renters who tap "I'm interested" arrive with an approval
   profile already matched (income range, ID type, guarantor yes/no). Only buildings that
   self-report get those approval-ready leads. Applications from people who will be rejected
   waste a leasing office's time, so this is a real benefit to them.
3. **The "Verified by building" badge.** A building that self-reports, and whose figures match
   renter bills, shows a badge. One that refuses shows "Not reported by the building" next to our
   own estimate. Silence becomes visible.

This is the same **give-to-get** idea Glassdoor uses: full access in exchange for a contribution.
Glassdoor's own study found it also made reviews less extreme
([Glassdoor](https://clear.glassdoor.nl/blog/give-to-get/), [HRreview](https://hrreview.co.uk/hr-news/supplier-news/give-get-policy-leads-balanced-company-ratings-claims-glassdoor/106446)).
We apply it to buildings, not renters: renters always get the core search free.

### Keeping self-reports honest

Buildings have a reason to under-report fees. Renter bills are the audit:

- If renter-reported bills for a size run more than 15% above the building's own average for 2
  months, the badge pauses and the page shows both numbers.
- The discrepancy rate per operator is tracked internally. Repeat offenders lose the badge.

### Kickstarting the flywheel (the cold start)

The **atomic network** is one UTD cohort and about 30 buildings within 3 miles of campus.

1. **Seed the supply by hand.** The team checks the 30 buildings most UTD students consider
   (we have 10 done). This is the "do things that don't scale" phase, on purpose.
2. **Bring a cohort at once.** Partner with the UTD international student office and student
   groups before the spring and fall arrival waves. One WhatsApp post reaches a whole cohort.
3. **Let renters fill gaps.** Every renter who moves in is asked for one bill, a month later.
   Three bills per building and size unlock the "Renters reported" figure.
4. **Show the leads to the buildings.** After one arrival wave, take each operator a short report:
   for example, "47 renters viewed you; 12 matched your rules; 3 tapped I'm interested." Then offer the
   self-report form. **Target operators, not buildings:** one management company often runs several
   of the 30 buildings, so one yes can convert many (to count during the 30-building check).
5. **Each turn of the wheel:** more verified buildings → more renters trust the ranking → more
   approval-ready leads and more renter bills → more buildings self-report.

```
 Renters trust the ranking ──► more approval-ready leads ──► buildings self-report
          ▲                                                        │
          └──── renter bills audit the numbers ◄── more verified ◄─┘
```

### Flywheel targets (to prove or kill the idea)

| Metric                                         | Spring 2027 target         |
| ---------------------------------------------- | -------------------------- |
| Buildings in the atomic network with data      | 30                         |
| Share of those that self-report                | 30% (at least 3 operators) |
| Median age of a building's data                | under 30 days              |
| Renter bills submitted per move-in             | 1 in 4                     |
| Discrepancy rate (self-report vs renter bills) | under 10%                  |

**Kill signal:** if fewer than 2 operators self-report after seeing a lead report, data stays
manual and we stay a small, local guide.

---

## 3. Competitors can copy the features. Is this a feature or a company?

**Honest answer: real monthly cost on its own is a feature.** Apartments.com, Zillow or Apartment
List can add an all-in price, and new laws (Colorado, Massachusetts, the FTC) push them to do it.
If that is all we have, they win.

**The company is the newcomer's on-ramp to US renting**, a group the big listing sites are not
built for. Four things, together, are hard to copy:

1. **Approval data no one else has.** Approval rules for people without SSNs or US credit, plus
   (later) anonymous approval outcomes. Listing sites collect neither, and each new outcome makes
   our prediction better. This is a **data network effect**.
2. **The Renter Passport.** Apply once with verified income (offer letter, I-20 funding, bank
   statements), an international credit report through a partner, and a guarantor quote. It
   works anywhere that accepts it, and Colorado already makes landlords accept portable reports.
   We would partner with a consumer reporting agency rather than become one.
3. **Money products for the first year.** Guarantor and deposit alternatives, move-in cash
   planning and **rent reporting to build US credit**. Over 50 million Americans have no credit
   file; an Urban Institute trial found rent reporting raised the share of renters with a score
   by 12 points ([Bankrate](https://www.bankrate.com/personal-finance/credit/how-to-report-rent-payments-to-credit-bureaus),
   [CNBC via NBC](https://www.nbcboston.com/news/business/money-report/americans-pay-trillions-in-rent-but-few-get-credit-score-boost-for-it/3738791/)).
   Zillow already sells it through Esusu, so we would partner, not build
   ([HousingWire](https://www.housingwire.com/articles/zillow-and-esusu-expand-credit-building-for-renters/)).
   The renter who arrives through us stays with us for year two.
4. **Counter-positioning.** Listing sites earn money from buildings paying for placement. We
   promise never to rank by who pays us. Copying that promise would put their main revenue at
   risk, so they are unlikely to copy it.

### The "what would a big listing site do?" test

Before we build a feature, we ask: if Apartments.com copied this tomorrow, would renters still
come to us?

| Feature                                | Copy risk | Why we keep it anyway                                      |
| -------------------------------------- | --------- | ---------------------------------------------------------- |
| Real monthly cost                      | High      | Entry point; not the moat.                                 |
| Utilities from renter bills            | Medium    | Needs a renter community that trusts us.                   |
| Approval fit for no SSN / no US credit | Low       | Needs approval data from newcomers and buildings.          |
| Renter Passport                        | Low       | Needs partners, renter trust and buildings that accept it. |
| Rent reporting and guarantor partners  | Medium    | Valuable as a bundle for newcomers, not on its own.        |
| "Never ranked by who pays"             | Very low  | Copying it costs them their placement revenue.             |

### How the company makes money (unchanged in spirit, sharper in order)

1. **Buildings:** pay per signed lease through a licensed partner broker; later a paid compliance
   tool (fee lists for each city's rules) for operators.
2. **Partners:** disclosed referral fees from guarantor, international credit and rent-reporting
   partners.
3. **Renters:** optional passes for extras. Core search, real cost and approval fit stay free.

---

## 4. What we changed because of this feedback

| We changed                                                                                                  | Because                                                                                |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Expansion order is now a scorecard, not "next big city"                                                     | Rules differ by state and city (Austin passed its own fee ordinance in 2026).          |
| Added a `jurisdictions` table and a "Your rights here" box to the plan                                      | The same building feature means different things under different rules.                |
| Building self-reporting moved from "later" (R4.2) to the next round                                         | Manual data won't scale; operators now prepare fee lists for regulators anyway.        |
| Added flywheel targets and a kill signal                                                                    | A flywheel claim needs numbers that can fail.                                          |
| Repositioned the company as the newcomer's on-ramp, with the Renter Passport and rent reporting as the moat | Real monthly cost alone can be copied, and new laws push competitors to copy it.       |
| Redesigned the visual identity around a receipt and approval stamps                                         | The old look was a generic template; see DESIGN.md for the reasons behind each choice. |
