-- REAL communities, prices taken from each community's own public page.
-- Run AFTER seed.sql (and seed-osm.sql). Safe to re-run.
--
-- BH Live (Cutters Point, Maya at White Rock), entered 2026-10-31. How the numbers were read: the page lists "Total monthly price starting at $X" and
-- "Base rent starting at $Y". The listed unit prices match the total, so each rent below
-- is the listed price minus (X - Y), and the difference is entered as a monthly fee.
-- Real cost therefore equals the listed price. Lease length and move-in dates aren't on
-- the page: 12 months and 1 Nov are assumed. Approval rules are NOT on the page.
--
-- Camden (Buckingham, Legacy Park, Legacy Creek), read 2026-11-01 from the page's own
-- floor-plan data: rent = the listed monthly rent, fee = (listed total monthly rent minus
-- rent), which the page says is the technology package and trash pickup. Lease length and
-- move-in date are the listed ones for the cheapest unit of each plan. No specials were
-- shown. Approval rules are NOT on the page.

delete from public.buildings
where name in ('Cutters Point Apartment Homes', 'Maya at White Rock',
               'Camden Buckingham', 'Camden Legacy Park', 'Camden Legacy Creek');

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
     'Prices are the lowest listed per floor plan on the community''s website on 31 Oct 2026. Lease length and move-in dates are assumed. Application fee, deposits and approval rules are not confirmed: ask the leasing office (254-282-5811).'),
    ('Camden Buckingham', '430 East Buckingham Rd, Richardson, TX 75081', 'Richardson',
     '2026-11-01', 32.9339335, -96.7279465,
     'https://www.camdenliving.com/apartments/richardson-tx/camden-buckingham', 'manual', false,
     'Prices and move-in dates are the listed ones for each floor plan on the community''s website on 1 Nov 2026. Deposits, application fee and approval rules are not confirmed: ask the leasing office (469-772-8909).'),
    ('Camden Legacy Park', '6600 Preston Rd, Plano, TX 75024', 'Plano',
     '2026-11-01', 33.063024, -96.794973,
     'https://www.camdenliving.com/apartments/plano-tx/camden-legacy-park', 'manual', false,
     'Prices and move-in dates are the listed ones for each floor plan on the community''s website on 1 Nov 2026. Deposits, application fee and approval rules are not confirmed: ask the leasing office (469-649-7776).'),
    ('Camden Legacy Creek', '6400 Ohio Dr, Plano, TX 75024', 'Plano',
     '2026-11-01', 33.0597617, -96.7911589,
     'https://www.camdenliving.com/apartments/plano-tx/camden-legacy-creek', 'manual', false,
     'Prices and move-in dates are the listed ones for each floor plan on the community''s website on 1 Nov 2026. Deposits, application fee and approval rules are not confirmed: ask the leasing office (469-717-4407).')
  returning id, name
),
plans as (
  insert into public.floor_plans (building_id, name, bedrooms, bathrooms, rent_usd, lease_months, available_from)
  select b.id, p.name, p.bedrooms, p.bathrooms, p.rent_usd, p.lease_months, p.available_from::date
  from b join (values
    ('Cutters Point Apartment Homes', '1 Bed, 700 sq ft',  1, 1.0,  963, 12, '2026-11-01'),
    ('Cutters Point Apartment Homes', '2 Bed, 1,067 sq ft', 2, 2.0, 1360, 12, '2026-11-01'),
    ('Cutters Point Apartment Homes', '3 Bed, 1,392 sq ft', 3, 2.0, 1626, 12, '2026-11-01'),
    ('Maya at White Rock', '1 Bed, 465 sq ft',  1, 1.0, 1055, 12, '2026-11-01'),
    ('Maya at White Rock', '1 Bed, 569 sq ft',  1, 1.0, 1144, 12, '2026-11-01'),
    ('Maya at White Rock', '2 Bed 1 Bath, 839 sq ft', 2, 1.0, 1430, 12, '2026-11-01'),
    ('Maya at White Rock', '2 Bed 2 Bath, 931 sq ft', 2, 2.0, 1485, 12, '2026-11-01'),
    ('Camden Buckingham', 'A, 1 Bed, 719 sq ft',  1, 1.0, 1149, 15, '2026-11-02'),
    ('Camden Buckingham', 'B, 1 Bed, 799 sq ft',  1, 1.0, 1319, 15, '2027-01-20'),
    ('Camden Buckingham', 'C, 2 Bed, 1,095 sq ft', 2, 2.0, 1539, 15, '2026-11-02'),
    ('Camden Buckingham', 'D, 2 Bed, 1,116 sq ft', 2, 2.0, 1539, 15, '2026-11-02'),
    ('Camden Buckingham', 'E, 2 Bed, 1,087 sq ft', 2, 2.0, 1619, 15, '2026-11-28'),
    ('Camden Legacy Park', 'A1, 1 Bed, 691 sq ft',  1, 1.0, 1489, 15, '2026-11-20'),
    ('Camden Legacy Park', 'A2B, 1 Bed, 736 sq ft', 1, 1.0, 1549, 15, '2026-11-19'),
    ('Camden Legacy Park', 'A2C, 1 Bed, 727 sq ft', 1, 1.0, 1559, 15, '2026-12-05'),
    ('Camden Legacy Park', 'A3, 1 Bed, 791 sq ft',  1, 1.0, 1569,  9, '2026-11-02'),
    ('Camden Legacy Park', 'B1, 2 Bed, 985 sq ft',  2, 2.0, 1919, 15, '2026-12-30'),
    ('Camden Legacy Park', 'B3, 2 Bed, 1,070 sq ft', 2, 2.0, 1989, 10, '2026-11-02'),
    ('Camden Legacy Creek', 'A2D, 1 Bed, 648 sq ft',   1, 1.0, 1459, 15, '2026-12-05'),
    ('Camden Legacy Creek', 'A2B.2, 1 Bed, 689 sq ft', 1, 1.0, 1519, 15, '2027-01-08'),
    ('Camden Legacy Creek', 'A2CR.2, 1 Bed, 732 sq ft',1, 1.0, 1539, 15, '2027-01-15'),
    ('Camden Legacy Creek', 'A2DR, 1 Bed, 736 sq ft',  1, 1.0, 1579,  9, '2026-11-02'),
    ('Camden Legacy Creek', 'B1.2, 2 Bed, 935 sq ft',  2, 2.0, 1789, 12, '2026-11-02'),
    ('Camden Legacy Creek', 'B1R, 2 Bed, 985 sq ft',   2, 2.0, 1829, 12, '2026-11-06')
  ) as p(building, name, bedrooms, bathrooms, rent_usd, lease_months, available_from) on p.building = b.name
  returning 1
),
fees as (
  insert into public.building_fees (building_id, name, monthly_usd)
  select b.id, f.name, f.monthly_usd
  from b join (values
    ('Cutters Point Apartment Homes', 'Monthly fees in the listed total price', 90),
    ('Maya at White Rock', 'Monthly fees in the listed total price', 30),
    ('Camden Buckingham', 'Technology package and trash pickup', 154),
    ('Camden Legacy Park', 'Technology package and trash pickup', 155),
    ('Camden Legacy Creek', 'Technology package and trash pickup', 155)
  ) as f(building, name, monthly_usd) on f.building = b.name
  returning 1
)
insert into public.building_deals (building_id, description, kind, amount, valid_until)
select b.id, d.description, d.kind, d.amount, d.valid_until::date
from b join (values
  ('Cutters Point Apartment Homes', 'One month free on new leases (restrictions apply)', 'free_weeks', 4, null)
) as d(building, description, kind, amount, valid_until) on d.building = b.name;
