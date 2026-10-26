-- Swelt: "I'm interested" leads.
-- Renters can ADD a lead through the public key but can never READ leads,
-- so the email list can't be downloaded. The team reads leads in the
-- Supabase dashboard. Leads hold contact info only: no SSN, credit score,
-- ID type, or immigration status.

-- Lets a lead's floor plan be checked against its building (see foreign key below).
alter table public.floor_plans
  add constraint floor_plans_id_building_id_key unique (id, building_id);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings (id) on delete cascade,
  floor_plan_id uuid,
  email text not null check (
    char_length(email) between 3 and 254
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  move_in date,
  budget_usd int check (budget_usd between 300 and 20000),
  consent boolean not null check (consent),
  created_at timestamptz not null default now(),
  -- The chosen floor plan must belong to the same building.
  foreign key (floor_plan_id, building_id)
    references public.floor_plans (id, building_id)
    on delete set null (floor_plan_id)
);

-- One lead per email per building (case-insensitive).
create unique index leads_building_email_key on public.leads (building_id, lower(email));
create index leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

-- Insert only. There is deliberately no SELECT, UPDATE or DELETE policy.
create policy "Public can submit interest" on public.leads
  for insert to anon, authenticated
  with check (consent);
