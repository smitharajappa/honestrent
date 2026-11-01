-- Swelt: buildings imported from OpenStreetMap (real name and map position, no prices yet).
-- "source" says where a building came from; "website" is the community's own site.

alter table public.buildings
  add column website text,
  add column source text not null default 'manual' check (source in ('manual', 'osm'));
