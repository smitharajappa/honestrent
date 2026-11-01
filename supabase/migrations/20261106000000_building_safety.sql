-- Swelt: reported-incident counts near a building, from a city's official open police data.
-- Counts only. No incident details, addresses, or anything about victims or suspects.
-- A building with no row simply has no official open data yet.

create table if not exists public.building_safety (
  building_id uuid primary key references public.buildings (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  radius_miles numeric(3, 2) not null,
  -- Counts of reported incidents inside the radius during the period.
  against_people int not null check (against_people >= 0),
  property int not null check (property >= 0),
  other int not null check (other >= 0),
  -- The city's average (people + property) for a circle of the same size, same period.
  city_average_people_property numeric(8, 1) not null,
  city_name text not null,
  source_name text not null,
  source_url text not null,
  license text not null,
  checked_on date not null
);

alter table public.building_safety enable row level security;
drop policy if exists "Public can read building safety" on public.building_safety;
create policy "Public can read building safety" on public.building_safety
  for select to anon, authenticated using (true);
