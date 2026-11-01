-- Swelt: roommate profiles, introductions, and chat that opens only after both people accept.
-- Lifestyle only: habits, budget, move-in date, languages and interests. There is no column for
-- race, ethnicity, religion, nationality, sex, family status or disability, on purpose.
-- No ID scan is ever stored: "verified" is only a date the team (or an ID-check vendor, later)
-- sets. A renter can never set it themselves. For now only the team's sample profiles carry it.

create table if not exists public.roommate_profiles (
  id uuid primary key default gen_random_uuid(),
  -- Null only for the sample profiles the team makes for the demo.
  user_id uuid unique references auth.users (id) on delete cascade,
  demo boolean not null default false,
  nickname text not null check (char_length(nickname) between 2 and 24),
  city text not null check (char_length(city) between 2 and 40),
  budget_usd int not null check (budget_usd between 300 and 5000),
  move_in date not null,
  languages text[] not null default '{}' check (cardinality(languages) <= 6),
  interests text[] not null default '{}' check (cardinality(interests) <= 8),
  sleep text not null check (sleep in ('early', 'flexible', 'night')),
  cleanliness text not null check (cleanliness in ('relaxed', 'tidy', 'very_tidy')),
  guests text not null check (guests in ('rarely', 'sometimes', 'often')),
  smoking text not null check (smoking in ('no', 'outside', 'yes')),
  pets text not null check (pets in ('none', 'fine', 'have')),
  study text not null check (study in ('quiet', 'mixed', 'social')),
  about text not null default '' check (char_length(about) <= 280),
  visible boolean not null default true,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (demo or user_id is not null)
);
create index if not exists roommate_profiles_city_idx
  on public.roommate_profiles (city) where visible;

alter table public.roommate_profiles enable row level security;

revoke all on public.roommate_profiles from anon, authenticated;
grant select, delete on public.roommate_profiles to authenticated;
grant insert (user_id, nickname, city, budget_usd, move_in, languages, interests, sleep,
              cleanliness, guests, smoking, pets, study, about, visible)
  on public.roommate_profiles to authenticated;
grant update (nickname, city, budget_usd, move_in, languages, interests, sleep, cleanliness,
              guests, smoking, pets, study, about, visible, updated_at)
  on public.roommate_profiles to authenticated;

drop policy if exists "Own profile: read" on public.roommate_profiles;
drop policy if exists "Own profile: add" on public.roommate_profiles;
drop policy if exists "Own profile: change" on public.roommate_profiles;
drop policy if exists "Own profile: delete" on public.roommate_profiles;
create policy "Own profile: read" on public.roommate_profiles
  for select to authenticated using (user_id = auth.uid());
create policy "Own profile: add" on public.roommate_profiles
  for insert to authenticated with check (user_id = auth.uid());
create policy "Own profile: change" on public.roommate_profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Own profile: delete" on public.roommate_profiles
  for delete to authenticated using (user_id = auth.uid());

-- The signed-in renter's own profile id (null if none). Used by the rules below.
create or replace function public.my_profile_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.roommate_profiles where user_id = auth.uid()
$$;
revoke all on function public.my_profile_id() from public, anon;
grant execute on function public.my_profile_id() to authenticated;

-- Blocks and reports. A block hides people from each other everywhere.
create table if not exists public.roommate_blocks (
  blocker uuid not null references public.roommate_profiles (id) on delete cascade,
  blocked uuid not null references public.roommate_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);
alter table public.roommate_blocks enable row level security;
revoke all on public.roommate_blocks from anon, authenticated;
grant select, insert, delete on public.roommate_blocks to authenticated;
drop policy if exists "Own blocks" on public.roommate_blocks;
create policy "Own blocks" on public.roommate_blocks
  for all to authenticated
  using (blocker = public.my_profile_id()) with check (blocker = public.my_profile_id());

create table if not exists public.roommate_reports (
  id uuid primary key default gen_random_uuid(),
  reporter uuid not null references public.roommate_profiles (id) on delete cascade,
  reported uuid not null references public.roommate_profiles (id) on delete cascade,
  reason text not null check (reason in ('scam', 'harassment', 'off_topic', 'fake_profile', 'discrimination', 'other')),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);
alter table public.roommate_reports enable row level security;
revoke all on public.roommate_reports from anon, authenticated;
grant insert on public.roommate_reports to authenticated;
drop policy if exists "Report someone" on public.roommate_reports;
create policy "Report someone" on public.roommate_reports
  for insert to authenticated with check (reporter = public.my_profile_id());
-- Nobody can read reports through the public key. The team reads them in the dashboard.

-- What other signed-in renters may see: no account id, no email. Only people who chose to be
-- visible, never yourself, never anyone blocked either way.
drop view if exists public.roommate_directory;
create view public.roommate_directory as
  select p.id, p.nickname, p.city, p.budget_usd, p.move_in, p.languages, p.interests, p.sleep,
         p.cleanliness, p.guests, p.smoking, p.pets, p.study, p.about,
         (p.verified_at is not null) as verified, p.demo
  from public.roommate_profiles p
  where p.visible
    and (p.user_id is null or p.user_id <> auth.uid())
    and not exists (
      select 1 from public.roommate_blocks b
      where (b.blocker = public.my_profile_id() and b.blocked = p.id)
         or (b.blocked = public.my_profile_id() and b.blocker = p.id)
    );
revoke all on public.roommate_directory from anon, authenticated;
grant select on public.roommate_directory to authenticated;

-- Introductions: one person asks, the other accepts or declines. Chat opens only on "accepted".
create table if not exists public.roommate_intros (
  id uuid primary key default gen_random_uuid(),
  from_profile uuid not null references public.roommate_profiles (id) on delete cascade,
  to_profile uuid not null references public.roommate_profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (from_profile <> to_profile)
);
-- One introduction per pair, whichever way round.
create unique index if not exists roommate_intros_pair_key on public.roommate_intros
  (least(from_profile, to_profile), greatest(from_profile, to_profile));
alter table public.roommate_intros enable row level security;
revoke all on public.roommate_intros from anon, authenticated;
grant select on public.roommate_intros to authenticated;
grant insert (from_profile, to_profile) on public.roommate_intros to authenticated;
grant update (status, responded_at) on public.roommate_intros to authenticated;
drop policy if exists "See your introductions" on public.roommate_intros;
drop policy if exists "Ask for an introduction" on public.roommate_intros;
drop policy if exists "Answer an introduction" on public.roommate_intros;
create policy "See your introductions" on public.roommate_intros
  for select to authenticated
  using (from_profile = public.my_profile_id() or to_profile = public.my_profile_id());
create policy "Ask for an introduction" on public.roommate_intros
  for insert to authenticated with check (from_profile = public.my_profile_id());
-- Only the person asked can answer, and only a pending one.
create policy "Answer an introduction" on public.roommate_intros
  for update to authenticated
  using (to_profile = public.my_profile_id() and status = 'pending')
  with check (to_profile = public.my_profile_id() and status in ('accepted', 'declined'));

-- Messages. Readable only by the two people, and only sent through send_roommate_message(),
-- which refuses unless the introduction was accepted and applies the safety rules below.
create table if not exists public.roommate_messages (
  id uuid primary key default gen_random_uuid(),
  intro_id uuid not null references public.roommate_intros (id) on delete cascade,
  sender uuid not null references public.roommate_profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists roommate_messages_intro_idx on public.roommate_messages (intro_id, created_at);
alter table public.roommate_messages enable row level security;
revoke all on public.roommate_messages from anon, authenticated;
grant select on public.roommate_messages to authenticated;
drop policy if exists "Read your chat" on public.roommate_messages;
create policy "Read your chat" on public.roommate_messages
  for select to authenticated using (
    exists (select 1 from public.roommate_intros i
            where i.id = intro_id and i.status = 'accepted'
              and public.my_profile_id() in (i.from_profile, i.to_profile))
  );

create or replace function public.send_roommate_message(p_intro uuid, p_body text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  me uuid := public.my_profile_id();
  other uuid;
  text_clean text := btrim(coalesce(p_body, ''));
  new_id uuid;
begin
  if me is null then raise exception 'Create a roommate profile first'; end if;
  select case when i.from_profile = me then i.to_profile else i.from_profile end into other
    from public.roommate_intros i
    where i.id = p_intro and i.status = 'accepted' and me in (i.from_profile, i.to_profile);
  if other is null then raise exception 'Chat opens only after both of you accept the introduction'; end if;
  if exists (select 1 from public.roommate_blocks b
             where (b.blocker = me and b.blocked = other) or (b.blocker = other and b.blocked = me)) then
    raise exception 'You can no longer message this person';
  end if;
  if char_length(text_clean) not between 1 and 500 then raise exception 'Messages are 1 to 500 characters'; end if;
  -- Safety rules, a last line of defence behind the same checks in the app:
  -- no links, email addresses, phone numbers or payment requests.
  if text_clean ~* '(https?://|www\.|[a-z0-9-]+\.(com|net|org|io|co|me|app)\b)'
     or text_clean ~* '[^@\s]+@[^@\s]+\.[^@\s]+'
     or text_clean ~ '(\+?\d[\s().-]*){9,}'
     or text_clean ~* '\m(zelle|venmo|cash ?app|paypal|western union|moneygram|wire transfer|gift ?card|bitcoin|crypto)\M' then
    raise exception 'For your safety, do not share links, contact details or payment details here';
  end if;
  -- A little rate limit: 40 messages an hour per person.
  if (select count(*) from public.roommate_messages m
      where m.sender = me and m.created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Too many messages. Please wait a little';
  end if;
  insert into public.roommate_messages (intro_id, sender, body) values (p_intro, me, text_clean)
    returning id into new_id;
  return new_id;
end;
$$;
revoke all on function public.send_roommate_message(uuid, text) from public, anon;
grant execute on function public.send_roommate_message(uuid, text) to authenticated;

-- The signed-in renter's introductions, with just enough about the other person to show a name.
create or replace view public.roommate_my_intros as
  select i.id, i.status, i.created_at,
         (i.from_profile = public.my_profile_id()) as i_asked,
         o.id as other_id, o.nickname, o.city, (o.verified_at is not null) as verified, o.demo
  from public.roommate_intros i
  join public.roommate_profiles o
    on o.id = case when i.from_profile = public.my_profile_id() then i.to_profile else i.from_profile end
  where public.my_profile_id() in (i.from_profile, i.to_profile)
    and not exists (
      select 1 from public.roommate_blocks b
      where (b.blocker = public.my_profile_id() and b.blocked = o.id)
         or (b.blocked = public.my_profile_id() and b.blocker = o.id)
    );
revoke all on public.roommate_my_intros from anon, authenticated;
grant select on public.roommate_my_intros to authenticated;
