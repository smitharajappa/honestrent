-- Honest Rent: DEMO payments, and stronger chat and introduction limits.
--
-- 1. buy_demo_pass(): adds a pass to the signed-in renter's account with source 'demo'. No card,
--    no Stripe, no money. It works only while the setting demo_payments is 'on'. When real
--    payments arrive, set it to 'off' (or drop the function): see docs/payments-demo.md.
-- 2. ask_roommate_intro(): at most 10 introduction requests an hour per person.
-- 3. send_roommate_message(): the same safety rules as the app, plus chat apps people use to
--    move a conversation off Honest Rent (WhatsApp, Telegram, ...) and "d0t com" style tricks.

-- A tiny settings table nobody can read or change through the public key.
create table if not exists public.app_settings (
  key text primary key,
  value text not null
);
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;
insert into public.app_settings (key, value) values ('demo_payments', 'on')
  on conflict (key) do nothing;

alter table public.plus_passes drop constraint if exists plus_passes_source_check;
alter table public.plus_passes add constraint plus_passes_source_check
  check (source in ('manual', 'stripe', 'demo'));

create or replace function public.buy_demo_pass(p_pass text)
returns table (starts_at timestamptz, ends_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  days int;
  run_to timestamptz;
  s timestamptz;
begin
  if me is null then raise exception 'Sign in first'; end if;
  if coalesce((select value from public.app_settings where key = 'demo_payments'), 'off') <> 'on' then
    raise exception 'Demo payments are switched off';
  end if;
  days := case p_pass when 'browse' then 7 when 'tour' then 14 when 'apply' then 21
                      when 'move_in' then 28 end;
  if days is null then raise exception 'Unknown pass'; end if;
  if (select count(*) from public.plus_passes pp
      where pp.user_id = me and pp.source = 'demo' and pp.created_at > now() - interval '1 day') >= 5 then
    raise exception 'Too many demo purchases today';
  end if;
  -- A new pass starts when the running one ends, so buying early never wastes days.
  select max(pp.ends_at) into run_to from public.plus_passes pp
    where pp.user_id = me and pp.ends_at > now();
  s := greatest(now(), coalesce(run_to, now()));
  return query
    insert into public.plus_passes as np (user_id, pass, starts_at, ends_at, source)
    values (me, p_pass, s, s + make_interval(days => days), 'demo')
    returning np.starts_at, np.ends_at;
end;
$$;
revoke all on function public.buy_demo_pass(text) from public, anon;
grant execute on function public.buy_demo_pass(text) to authenticated;

create or replace function public.ask_roommate_intro(p_other uuid) returns text
language plpgsql security definer set search_path = public as $$
declare
  me uuid := public.my_profile_id();
  target record;
  new_status text;
begin
  if me is null then raise exception 'Create a roommate profile first'; end if;
  if (select count(*) from public.roommate_intros i
      where i.from_profile = me and i.created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Too many introduction requests. Please wait a little';
  end if;
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

create or replace function public.send_roommate_message(p_intro uuid, p_body text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  me uuid := public.my_profile_id();
  other uuid;
  text_clean text := btrim(coalesce(p_body, ''));
  squashed text;
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
  -- The same text with look-alike digits and symbols turned back into letters, spaces and dots
  -- removed, so "z e l l e", "d0t com" and "w.h.a.t.s.a.p.p" are still caught.
  squashed := regexp_replace(translate(lower(text_clean), '0134578@$', 'oleastbas'),
                             '[^a-z0-9]', '', 'g');
  if text_clean ~* '(https?://|www\.|[a-z0-9-]+\.(com|net|org|io|co|me|app)\b)'
     or text_clean ~* '[^@\s]+@[^@\s]+\.[^@\s]+'
     or text_clean ~ '(\+?\d[\s().-]*){9,}'
     or text_clean ~* '\m(zelle|venmo|cash ?app|paypal|western union|moneygram|wire transfer|gift ?card|bitcoin|crypto|whatsapp|telegram|wechat|snapchat|instagram)\M'
     or squashed ~ '(zelle|venmo|cashapp|paypal|westernunion|moneygram|wiretransfer|giftcard|bitcoin|whatsapp|telegram|snapchat|instagram|signalapp|dotcom|dotnet|dotorg|atgmail|atyahoo|atoutlook)' then
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
