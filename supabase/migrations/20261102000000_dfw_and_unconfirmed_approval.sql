-- Swelt: allow any DFW city, say when approval rules aren't confirmed, and keep a data note.

alter table public.buildings drop constraint if exists buildings_city_check;

alter table public.buildings
  -- false = the approval columns are placeholders, not the building's real rules.
  add column approval_known boolean not null default true,
  -- Plain-words caveat shown on the building page (where the prices came from).
  add column notes text;
