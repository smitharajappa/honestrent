-- Swelt: nearby places (grocery, gyms, places of worship, bus stops) from OpenStreetMap.
-- Public map data only (© OpenStreetMap contributors, ODbL). No renter data lives here.

create table public.places (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('grocery', 'gym', 'worship', 'bus_stop')),
  name text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  osm text not null unique -- e.g. node/123456, so re-running the import never duplicates
);

create index places_latitude_idx on public.places (latitude);

alter table public.places enable row level security;
create policy "Public can read places" on public.places
  for select to anon, authenticated using (true);
