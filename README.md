# Swelt

Richardson-Plano apartments ranked by **real monthly cost** (rent + mandatory fees − deals
spread over the lease) and, later, by how likely a newcomer is to be approved.
See [prd.md](prd.md) for the product plan.

## Run it on your computer

Needs Node.js 20 or newer.

1. Install packages: `npm install`
2. Copy `.env.example` to `.env.local` and paste in your Supabase URL and publishable key.
3. Start the app: `npm run dev`, then open http://localhost:3000

## Set up the database (one time)

In the Supabase dashboard, open **SQL Editor** and run these files in order:

1. `supabase/migrations/20261025000000_create_buildings.sql` creates the tables and
   read-only security rules.
2. `supabase/seed.sql` adds **made-up** sample buildings for testing.
3. `supabase/migrations/20261026000000_create_leads.sql` creates the "I'm interested"
   leads table. The public key can add leads but never read, change or delete them.
   View leads in the dashboard under **Table Editor → leads**.
4. `supabase/migrations/20261030000000_round_2_costs_and_approval.sql` adds move-in
   costs, finer approval rules, utilities billed by the building, anonymous renter bills
   (`renter_bill_reports`, insert-only) and "Request my area" (`area_requests`,
   insert-only).
5. `supabase/sample-data-round-2.sql` fills the Round 2 fields for the **made-up**
   sample buildings. Safe to re-run.

Reviewing renter bills: in **Table Editor → renter_bill_reports**, set `status` to
`accepted` or `rejected`. A building's range appears once 3 reports for the same size
are accepted. See demand by area in **Table Editor → area_requests**.

Real building data is collected with the "Swelt building check (10 buildings)" Google
Sheet (questions, call script and floor plans tabs).

Any later change to the tables goes in a new, dated file in `supabase/migrations/`.
Never edit a migration that has already been run.

## Deploying (Vercel)

- Every merge to `main` deploys the live site. Every pull request gets a private preview link.
- In Vercel, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  (the publishable key only, never the secret key).
- **Demo mode** is on by default: a "sample data" banner shows and search engines are asked
  not to list the site. Once building data is real, set `NEXT_PUBLIC_DEMO_MODE=off` in
  Vercel and redeploy.
- Preview links use the same database as the live site, so delete any test leads they create.

## Before you commit

```
npm run check
```

This runs lint, type checks, the formatting check and tests. `npm run format` fixes formatting.
GitHub runs the same checks plus a production build on every push (`.github/workflows/ci.yml`).

## Working rules

- One branch per feature (`feature/short-name`), then merge into `main` through a pull request.
- Secrets live only in `.env.local`, which git ignores. Never commit keys.
- Use only made-up renter data. Never store SSNs, ID scans, exact credit scores or
  immigration status.
- Show the "last verified" date wherever building prices appear.
- Approval answers (income range, credit band, ID type) stay in the renter's browser
  memory only: never in the URL, server, database or browser storage.

## Design rules

- All colors, shadows and motion live as tokens in `app/globals.css`. Use token classes
  (`bg-surface`, `text-text-muted`, `bg-brand`…), never raw hex colors in components.
- Every text color meets WCAG 2.2 AA contrast (4.5:1) in light and dark mode. Re-check
  contrast whenever a token changes.
- Build screens from `components/ui/` (Button, Field, Card, Badge, icons) before
  writing new styles.
- Tap targets are at least 44px tall. Inputs use 16px text so phones don't zoom.
- Status is never shown by color alone: always pair it with words and usually an icon.
- Design for 375px phone width first, then check desktop.

## Project layout

| Path                   | What it holds                               |
| ---------------------- | ------------------------------------------- |
| `app/`                 | Pages (Next.js App Router)                  |
| `components/`          | Reusable pieces of the page                 |
| `lib/cost.ts`          | Real-monthly-cost math and ranking (tested) |
| `lib/validation.ts`    | Checks search inputs (tested)               |
| `lib/buildings.ts`     | Loads building data from Supabase           |
| `supabase/migrations/` | Database table definitions, in order        |
| `supabase/seed.sql`    | Made-up sample buildings                    |
