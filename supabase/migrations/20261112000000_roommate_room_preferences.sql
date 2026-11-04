-- Honest Rent: what kind of room people want to share, who they would share with, and which
-- apartment communities they are looking at.
--
-- Room type and gender are only used to decide who can be matched to share a home or a room.
-- A person's own gender is never shown to anyone: the directory below simply leaves out people
-- whose sharing preference doesn't fit yours (in either direction). Race, ethnicity, religion,
-- nationality, family status and disability are still not stored or used anywhere.

alter table public.roommate_profiles
  add column if not exists room_types text[] not null default '{private,shared}',
  add column if not exists gender text not null default 'prefer_not',
  add column if not exists gender_pref text not null default 'any',
  add column if not exists building_ids uuid[] not null default '{}';

alter table public.roommate_profiles drop constraint if exists roommate_room_types_check;
alter table public.roommate_profiles add constraint roommate_room_types_check
  check (cardinality(room_types) between 1 and 2 and room_types <@ array['private', 'shared']);
alter table public.roommate_profiles drop constraint if exists roommate_gender_check;
alter table public.roommate_profiles add constraint roommate_gender_check
  check (gender in ('woman', 'man', 'nonbinary', 'prefer_not'));
alter table public.roommate_profiles drop constraint if exists roommate_gender_pref_check;
alter table public.roommate_profiles add constraint roommate_gender_pref_check
  check (gender_pref in ('any', 'same') and (gender_pref = 'any' or gender <> 'prefer_not'));
alter table public.roommate_profiles drop constraint if exists roommate_building_ids_check;
alter table public.roommate_profiles add constraint roommate_building_ids_check
  check (cardinality(building_ids) <= 3);

grant insert (room_types, gender, gender_pref, building_ids)
  on public.roommate_profiles to authenticated;
grant update (room_types, gender, gender_pref, building_ids)
  on public.roommate_profiles to authenticated;

-- Two people can be matched only if they both want a type of room in common, and each person's
-- sharing preference is met by the other's gender. "any" accepts everyone.
create or replace function public.roommate_fits(
  a_rooms text[], a_gender text, a_pref text,
  b_rooms text[], b_gender text, b_pref text
) returns boolean
language sql immutable as $$
  select a_rooms && b_rooms
     and (a_pref = 'any' or (a_gender <> 'prefer_not' and a_gender = b_gender))
     and (b_pref = 'any' or (b_gender <> 'prefer_not' and b_gender = a_gender));
$$;

-- What other signed-in renters may see. Same as before, plus room type and the communities
-- someone is looking at. Gender is not in this list, and people whose preference doesn't fit
-- yours are not in it at all.
drop view if exists public.roommate_directory;
create view public.roommate_directory as
  select p.id, p.nickname, p.city, p.budget_usd, p.move_in, p.languages, p.interests, p.sleep,
         p.cleanliness, p.guests, p.smoking, p.pets, p.study, p.about, p.room_types,
         p.building_ids, (p.verified_at is not null) as verified, p.demo
  from public.roommate_profiles p
  join public.roommate_profiles me on me.user_id = auth.uid()
  where p.visible
    and (p.user_id is null or p.user_id <> auth.uid())
    and public.roommate_fits(me.room_types, me.gender, me.gender_pref,
                             p.room_types, p.gender, p.gender_pref)
    and not exists (
      select 1 from public.roommate_blocks b
      where (b.blocker = me.id and b.blocked = p.id)
         or (b.blocked = me.id and b.blocker = p.id)
    );
revoke all on public.roommate_directory from anon, authenticated;
grant select on public.roommate_directory to authenticated;

-- How many real renters want a roommate in each community. Only communities with at least 3
-- people are returned, so nobody can be picked out. Sample profiles are not counted.
create or replace function public.roommate_interest_counts()
returns table (building_id uuid, people int)
language sql stable security definer set search_path = public as $$
  select b.id, count(*)::int
  from public.roommate_profiles p, unnest(p.building_ids) as b(id)
  where p.visible and not p.demo
  group by b.id
  having count(*) >= 3;
$$;
revoke all on function public.roommate_interest_counts() from public;
grant execute on function public.roommate_interest_counts() to anon, authenticated;

-- Asking for an introduction now goes through this function, so the same fit rules apply (you
-- can only ask someone the directory shows you). A sample profile made by the team accepts at
-- once, so the demo can show the chat. A real person gets a pending request.
create or replace function public.ask_roommate_intro(p_other uuid) returns text
language plpgsql security definer set search_path = public as $$
declare
  me uuid := public.my_profile_id();
  target record;
  new_status text;
begin
  if me is null then raise exception 'Create a roommate profile first'; end if;
  select d.id, d.demo into target from public.roommate_directory d where d.id = p_other;
  if not found then raise exception 'That person is not available'; end if;
  new_status := case when target.demo then 'accepted' else 'pending' end;
  insert into public.roommate_intros (from_profile, to_profile, status, responded_at)
    values (me, p_other, new_status, case when target.demo then now() end);
  return new_status;
end;
$$;
revoke all on function public.ask_roommate_intro(uuid) from public, anon;
grant execute on function public.ask_roommate_intro(uuid) to authenticated;
revoke insert on public.roommate_intros from authenticated;
