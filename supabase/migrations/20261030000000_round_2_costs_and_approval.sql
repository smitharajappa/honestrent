-- Swelt Round 2: move-in costs, finer approval rules, utilities billed by the
-- building, anonymous renter bills, and "Request my area".
-- Renter data stays minimal: no names, unit numbers, SSNs, credit scores,
-- ID scans or immigration status anywhere in these tables.

-- 1. More facts per building (all optional until the 10-building check fills them).
alter table public.buildings
  add column zip text check (zip ~ '^[0-9]{5}$'),
  add column application_fee_usd int check (application_fee_usd >= 0),
  add column admin_fee_usd int check (admin_fee_usd >= 0),
  add column deposit_usd int check (deposit_usd >= 0),
  add column deposit_no_credit_usd int check (deposit_no_credit_usd >= 0),
  -- null = not asked yet; the app then falls back to accepts_no_ssn
  add column accepts_itin boolean,
  add column accepts_passport_only boolean,
  add column accepts_offer_letter boolean,
  add column guarantor_companies text[] not null default '{}',
  add column documents_required text[] not null default '{}',
  add column utility_billing text not null default 'unknown'
    check (utility_billing in ('submetered', 'allocated', 'included', 'direct', 'unknown')),
  add column electricity_note text,
  add column miles_to_utd numeric(4, 1) check (miles_to_utd >= 0),
  add column bus_route text;

-- 2. Monthly utilities the building bills, per bedroom count.
--    source 'building' = the building's own figures (Texas PUC rules let renters ask
--    for last year's average, lowest and highest water/wastewater bill).
create table public.building_utility_estimates (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings (id) on delete cascade,
  bedrooms int not null check (bedrooms between 0 and 5),
  avg_usd int not null check (avg_usd >= 0),
  low_usd int not null check (low_usd >= 0),
  high_usd int not null check (high_usd >= 0),
  source text not null check (source in ('building', 'estimate')),
  as_of date not null,
  check (low_usd <= avg_usd and avg_usd <= high_usd),
  unique (building_id, bedrooms, source)
);

-- 3. The line items that make up those utilities (water, sewer, trash...).
create table public.building_utility_items (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('water', 'sewer', 'trash', 'drainage', 'admin', 'other')),
  typical_usd numeric(7, 2) check (typical_usd >= 0),
  sort int not null default 0
);

create index building_utility_estimates_building_id_idx
  on public.building_utility_estimates (building_id);
create index building_utility_items_building_id_idx
  on public.building_utility_items (building_id);

-- 4. Anonymous renter bills: building, month, bedrooms and amounts only.
create table public.renter_bill_reports (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings (id) on delete cascade,
  bill_month date not null check (extract(day from bill_month) = 1),
  bedrooms int not null check (bedrooms between 0 and 5),
  water_usd numeric(7, 2) not null default 0 check (water_usd between 0 and 1000),
  sewer_usd numeric(7, 2) not null default 0 check (sewer_usd between 0 and 1000),
  trash_usd numeric(7, 2) not null default 0 check (trash_usd between 0 and 1000),
  drainage_usd numeric(7, 2) not null default 0 check (drainage_usd between 0 and 1000),
  admin_usd numeric(7, 2) not null default 0 check (admin_usd between 0 and 1000),
  other_usd numeric(7, 2) not null default 0 check (other_usd between 0 and 1000),
  total_usd numeric(8, 2) generated always as
    (water_usd + sewer_usd + trash_usd + drainage_usd + admin_usd + other_usd) stored,
  -- The team reviews reports in the dashboard before they count.
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  check (water_usd + sewer_usd + trash_usd + drainage_usd + admin_usd + other_usd between 1 and 2000)
);

-- Only totals of accepted reports, and only when at least 3 renters reported,
-- so no single renter's bill can be read back.
create view public.renter_bill_summary as
  select
    building_id,
    bedrooms,
    count(*)::int as report_count,
    round(avg(total_usd))::int as avg_usd,
    round(min(total_usd))::int as low_usd,
    round(max(total_usd))::int as high_usd
  from public.renter_bill_reports
  where status = 'accepted'
  group by building_id, bedrooms
  having count(*) >= 3;

-- 5. "Request my area": which areas renters want next. Area name and date only.
create table public.area_requests (
  id uuid primary key default gen_random_uuid(),
  area text not null check (char_length(area) between 2 and 60),
  created_at timestamptz not null default now()
);

-- Security: the public key may READ building facts and the summary view,
-- may ADD renter bills (as pending) and area requests, and nothing else.
alter table public.building_utility_estimates enable row level security;
alter table public.building_utility_items enable row level security;
alter table public.renter_bill_reports enable row level security;
alter table public.area_requests enable row level security;

create policy "Public can read utility estimates" on public.building_utility_estimates
  for select to anon, authenticated using (true);
create policy "Public can read utility items" on public.building_utility_items
  for select to anon, authenticated using (true);
create policy "Public can submit a bill" on public.renter_bill_reports
  for insert to anon, authenticated with check (status = 'pending');
create policy "Public can request an area" on public.area_requests
  for insert to anon, authenticated with check (true);

grant select on public.renter_bill_summary to anon, authenticated;
