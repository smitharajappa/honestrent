-- Swelt: more nearby place kinds (restaurants, coffee, banks, schools).
-- Safe to run more than once.

alter table public.places drop constraint if exists places_kind_check;
alter table public.places add constraint places_kind_check
  check (kind in ('grocery', 'restaurant', 'cafe', 'bank', 'school', 'gym', 'worship', 'bus_stop'));
