-- Swelt: map pins. Latitude and longitude of each building (public address only).
-- Nullable: a building without a pin simply shows no map.

alter table public.buildings
  add column latitude double precision check (latitude between -90 and 90),
  add column longitude double precision check (longitude between -180 and 180);
