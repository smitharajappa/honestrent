# Neighbourhood safety data: what we can use (1 Nov 2026)

## What we show

For each building: counts of **reported incidents** within **0.5 mile** over the **last 12
months** (against people, property, other), the city average for a circle that size, the
source and a link to the police department's own map. Counts only. No score or grade.

## Sources checked

- **Dallas**: City of Dallas "Police Incidents" open data (Socrata, license ODC-BY, geocoded,
  current to 30 Oct 2026). Used. The page says it is published "for research purposes only"
  and that the authoritative source is the city's crime dashboard, which we link.
  Fields we read: offense category and date only. We never read victim, suspect, race,
  sex, badge or address fields.
- **Richardson**: Community Crime Map (LexisNexis) and a stats page. No bulk open data.
  It also leaves out some incident types (juvenile and sexual offences). Link only.
- **Plano**: Community Crime Map, service call log, PDF summaries. No bulk open data found.
  No link shown until we verify an official address.
- Aggregators (SpotCrime, US Crime Review, OpenCrime): not official, terms unclear. Not used.

## Vehicle incidents (parking lots and streets)

There is no public dataset by apartment. For Dallas we count, within 0.25 mile and 12 months,
"theft from motor vehicle" plus "theft of motor vehicle parts or accessories" (break-ins), and
"UUMV" (vehicle taken without permission). Worded as "reported near this address", never as
a claim about the building.

## Checked against the sources (1 Nov 2026)

- Dallas data has latitude and longitude on every record and is about a day behind: confirmed.
- Richardson: LexisNexis Community Crime Map only, no open data: confirmed.
- Plano: annual reports and daily summaries found; monthly PDFs with response times: not confirmed.
- FBI per-100,000 city figures quoted by aggregators (146.7 Richardson, 151.6 Plano): not
  verified, not used. We show counts with a source and date.
- Management responsiveness: no public dataset. Needs resident reports and a lawyer first
  (defamation risk when naming a management company).

## How the comparison is made

City average = (all Dallas people + property incidents in the period) x (circle area /
city land area, about 340 sq mi). Wording: fewer than / about the same as / more than the
city average (under 0.8x, 0.8x to 1.25x, over 1.25x). This is rough: busy retail areas and
highways show more reports. The page says so.

## Fair housing

- HUD's Dear Colleague letter of 24 Apr 2026 says discussing crime and school data is not
  steering by itself, and that platforms (Realtor.com, Redfin) that removed crime data in
  2021 over-corrected. NAR disagrees, and the letter is guidance, not a rule.
- The safe practice: the same facts for every renter, no personal fields, no score or grade,
  no ranking by safety. `prd.md` still calls for fair housing advice before any "safest first"
  sort. Get that advice before launch.

Sources: HUD letter (hud.gov/news/hud-no-26-028), Inman and Cooley summaries, Dallas Open Data
(dallasopendata.com/resource/qv6i-rri7), Richardson Police crime stats page.
