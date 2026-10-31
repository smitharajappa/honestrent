-- REAL communities, prices hand-entered from the community's own public page (BH Live).
-- Entered 2026-10-31. Run AFTER seed.sql (and seed-osm.sql). Safe to re-run.
--
-- How the numbers were read: the page lists "Total monthly price starting at $X" and
-- "Base rent starting at $Y". The listed unit prices match the total, so each rent below
-- is the listed price minus (X - Y), and the difference is entered as a monthly fee.
-- Real cost therefore equals the listed price. Lease length and move-in dates aren't on
-- the page: 12 months and "now" are assumed. Approval rules are NOT on the page.

delete from public.buildings where name in ('Cutters Point Apartment Homes', 'Maya at White Rock');

with b as (
  insert into public.buildings
    (name, address, city, last_verified, latitude, longitude, website, source,
     approval_known, notes)
  values
    ('Cutters Point Apartment Homes', '1111 Abrams Rd, Richardson, TX 75081', 'Richardson',
     '2026-10-31', 32.9289465, -96.7345862,
     'https://livebh.com/apartments/cutters-point-apartment-homes/', 'manual', false,
     'Prices are the lowest listed per floor plan on the community''s website on 31 Oct 2026. Lease length and move-in dates are assumed. Application fee, deposits and approval rules are not confirmed: ask the leasing office (945-203-5392).'),
    ('Maya at White Rock', '7414 East Grand Avenue, Dallas, TX 75214', 'Dallas',
     '2026-10-31', 32.8074747, -96.7298556,
     'https://livebh.com/apartments/maya-at-white-rock-apartment/', 'manual', false,
     'Prices are the lowest listed per floor plan on the community''s website on 31 Oct 2026. Lease length and move-in dates are assumed. Application fee, deposits and approval rules are not confirmed: ask the leasing office (254-282-5811).')
  returning id, name
),
plans as (
  insert into public.floor_plans (building_id, name, bedrooms, bathrooms, rent_usd, lease_months, available_from)
  select b.id, p.name, p.bedrooms, p.bathrooms, p.rent_usd, 12, '2026-11-01'::date
  from b join (values
    ('Cutters Point Apartment Homes', '1 Bed, 700 sq ft',  1, 1.0,  963),
    ('Cutters Point Apartment Homes', '2 Bed, 1,067 sq ft', 2, 2.0, 1360),
    ('Cutters Point Apartment Homes', '3 Bed, 1,392 sq ft', 3, 2.0, 1626),
    ('Maya at White Rock', '1 Bed, 465 sq ft',  1, 1.0, 1055),
    ('Maya at White Rock', '1 Bed, 569 sq ft',  1, 1.0, 1144),
    ('Maya at White Rock', '2 Bed 1 Bath, 839 sq ft', 2, 1.0, 1430),
    ('Maya at White Rock', '2 Bed 2 Bath, 931 sq ft', 2, 2.0, 1485)
  ) as p(building, name, bedrooms, bathrooms, rent_usd) on p.building = b.name
  returning 1
),
fees as (
  insert into public.building_fees (building_id, name, monthly_usd)
  select b.id, f.name, f.monthly_usd
  from b join (values
    ('Cutters Point Apartment Homes', 'Monthly fees in the listed total price', 90),
    ('Maya at White Rock', 'Monthly fees in the listed total price', 30)
  ) as f(building, name, monthly_usd) on f.building = b.name
  returning 1
)
insert into public.building_deals (building_id, description, kind, amount, valid_until)
select b.id, d.description, d.kind, d.amount, d.valid_until::date
from b join (values
  ('Cutters Point Apartment Homes', 'One month free on new leases (restrictions apply)', 'free_weeks', 4, null)
) as d(building, description, kind, amount, valid_until) on d.building = b.name;
