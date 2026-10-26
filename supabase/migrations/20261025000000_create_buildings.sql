-- Swelt: buildings, their floor plans, mandatory monthly fees and move-in deals.
-- Data is entered by hand for the MVP. No renter personal data lives here.

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null check (city in ('Richardson', 'Plano')),
  last_verified date not null,
  -- Approval criteria (used by the "Approval fit" feature later)
  min_income_multiple numeric(4, 2) not null default 3.0 check (min_income_multiple > 0),
  min_credit_score int check (min_credit_score between 300 and 850),
  accepts_no_ssn boolean not null default false,
  accepts_guarantor boolean not null default false,
  accepts_international_credit boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.floor_plans (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings (id) on delete cascade,
  name text not null,
  bedrooms int not null check (bedrooms >= 0),
  bathrooms numeric(3, 1) not null check (bathrooms > 0),
  rent_usd int not null check (rent_usd > 0),
  lease_months int not null check (lease_months between 1 and 24),
  available_from date not null
);

-- Mandatory monthly fees (e.g. trash, pest control, required tech package).
create table public.building_fees (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings (id) on delete cascade,
  name text not null,
  monthly_usd int not null check (monthly_usd >= 0)
);

-- Move-in deals. Either a fixed dollar amount off, or a number of free weeks.
create table public.building_deals (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings (id) on delete cascade,
  description text not null,
  kind text not null check (kind in ('fixed_usd', 'free_weeks')),
  amount numeric(8, 2) not null check (amount > 0),
  valid_until date
);

create index floor_plans_building_id_idx on public.floor_plans (building_id);
create index building_fees_building_id_idx on public.building_fees (building_id);
create index building_deals_building_id_idx on public.building_deals (building_id);

-- Row-level security: anyone may READ building data; nobody may write
-- through the public key. The team edits data in the Supabase dashboard.
alter table public.buildings enable row level security;
alter table public.floor_plans enable row level security;
alter table public.building_fees enable row level security;
alter table public.building_deals enable row level security;

create policy "Public can read buildings" on public.buildings
  for select to anon, authenticated using (true);
create policy "Public can read floor plans" on public.floor_plans
  for select to anon, authenticated using (true);
create policy "Public can read fees" on public.building_fees
  for select to anon, authenticated using (true);
create policy "Public can read deals" on public.building_deals
  for select to anon, authenticated using (true);
