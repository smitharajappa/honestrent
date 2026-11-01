-- Swelt Plus: sign-in, passes and the waitlist test.
-- Passes are one-time (no auto-renew). A renter can READ their own passes; only the team
-- (dashboard) or the payment webhook can create them. Nobody can read other renters' rows.

-- 1. Waitlist test. Insert only, so the email list can't be downloaded.
create table if not exists public.plus_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (
    char_length(email) between 3 and 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  pass text not null check (pass in ('browse', 'tour', 'apply', 'move_in')),
  consent boolean not null check (consent),
  created_at timestamptz not null default now()
);
create unique index if not exists plus_waitlist_email_key on public.plus_waitlist (lower(email));
alter table public.plus_waitlist enable row level security;
drop policy if exists "Public can join the waitlist" on public.plus_waitlist;
create policy "Public can join the waitlist" on public.plus_waitlist
  for insert to anon, authenticated with check (consent);

-- 2. Anonymous daily counts, for the demand test: how many people saw the offer and how
--    many joined. No identifiers. Nobody can read or write it directly; only the two
--    functions below touch it, and the team reads it in the dashboard.
create table if not exists public.plus_daily_counts (
  day date primary key,
  views int not null default 0,
  joins int not null default 0
);
alter table public.plus_daily_counts enable row level security;

create or replace function public.record_plus_view() returns void
language sql security definer set search_path = public as $$
  insert into public.plus_daily_counts (day, views) values (current_date, 1)
  on conflict (day) do update set views = public.plus_daily_counts.views + 1;
$$;
revoke all on function public.record_plus_view() from public;
grant execute on function public.record_plus_view() to anon, authenticated;

create or replace function public.count_plus_join() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.plus_daily_counts (day, joins) values (current_date, 1)
  on conflict (day) do update set joins = public.plus_daily_counts.joins + 1;
  return new;
end;
$$;
drop trigger if exists plus_waitlist_count on public.plus_waitlist;
create trigger plus_waitlist_count after insert on public.plus_waitlist
  for each row execute function public.count_plus_join();

-- 3. Passes. One-time, fixed length.
create table if not exists public.plus_passes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pass text not null check (pass in ('browse', 'tour', 'apply', 'move_in')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null check (ends_at > starts_at),
  source text not null default 'manual' check (source in ('manual', 'stripe')),
  created_at timestamptz not null default now()
);
create index if not exists plus_passes_user_idx on public.plus_passes (user_id, ends_at desc);
alter table public.plus_passes enable row level security;
drop policy if exists "Renters read their own passes" on public.plus_passes;
create policy "Renters read their own passes" on public.plus_passes
  for select to authenticated using (user_id = auth.uid());
-- Deliberately no insert, update or delete policy.
