# Project: Honest Rent

## What this is
Honest Rent helps newcomers renting in Richardson-Plano, Texas find apartments ranked by real monthly cost (rent + fees - deals) and by how likely they are to be approved, even without US credit. Renters use it free; building data is entered by hand for the MVP.

## Team hats
- Product owner (owns prd.md): [name]
- Integrator (owns main): [name]
- Evidence owner (owns research/ and interviews/): [name]
- Demo owner (owns qa-report.md): [name]

## Stack
Next.js + Supabase + Vercel. Mobile-first web app (design for phone width first).

## Rules
- Explain changes in plain English. I am not a programmer.
- Prefer the simplest solution that works.
- Ask before adding any new service or library.
- Plan first and wait for my approval before writing code.
- After each feature, remind me to commit.
- Use only made-up renter data while testing. Never store SSNs, ID scans, exact credit scores, or immigration status.
- Show the data's "last verified" date wherever building prices appear.
- Keep answers short. No introduction, no summary at the end.

## Design rules
- Read DESIGN.md before changing anything people see.
- Never hardcode colors; use the tokens in app/globals.css.
- Reuse components in components/ui/ before making new ones; add new ones to /styleguide.

## Current focus
Walking skeleton: renter enters budget and move-in date, sees buildings ranked by real monthly cost.
