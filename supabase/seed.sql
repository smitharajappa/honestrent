-- MADE-UP sample data for testing. These buildings do not exist.
-- Map pins are made-up spots near Richardson and Plano, not real addresses.
-- Safe to re-run: it clears the sample tables first.

truncate public.buildings cascade;

with b as (
  insert into public.buildings
    (name, address, city, last_verified, min_income_multiple, min_credit_score,
     accepts_no_ssn, accepts_guarantor, accepts_international_credit,
     latitude, longitude)
  values
    ('Maple Creek Flats',   '100 Sample Pkwy, Richardson, TX 75080', 'Richardson', '2026-10-20', 3.0, 620, true,  true,  true, 32.961, -96.729),
    ('Cottonwood Commons',  '200 Example Dr, Richardson, TX 75081',  'Richardson', '2026-10-18', 3.0, 650, false, true,  false, 32.978, -96.705),
    ('Bluebonnet Lofts',    '300 Demo Ave, Plano, TX 75074',         'Plano',      '2026-10-22', 2.5, null, true, true,  true, 33.019, -96.73),
    ('Legacy Row Residences','400 Test Blvd, Plano, TX 75024',       'Plano',      '2026-10-15', 3.0, 680, false, false, false, 33.078, -96.821),
    ('Prairie Oak Apartments','500 Mock St, Richardson, TX 75082',   'Richardson', '2026-10-21', 2.75, 600, true, true, false, 32.989, -96.749),
    ('Willow Park Place',   '600 Fake Ln, Plano, TX 75075',          'Plano',      '2026-10-10', 3.0, 640, false, true,  true, 33.035, -96.745)
  returning id, name
),
plans as (
  insert into public.floor_plans (building_id, name, bedrooms, bathrooms, rent_usd, lease_months, available_from)
  select b.id, p.name, p.bedrooms, p.bathrooms, p.rent_usd, p.lease_months, p.available_from::date
  from b join (values
    ('Maple Creek Flats',      'A1 Studio',   0, 1.0, 1095, 12, '2026-11-01'),
    ('Maple Creek Flats',      'B1 1 Bed',    1, 1.0, 1290, 12, '2026-11-15'),
    ('Cottonwood Commons',     '1x1 Classic', 1, 1.0, 1225, 12, '2026-11-01'),
    ('Cottonwood Commons',     '2x2 Corner',  2, 2.0, 1650, 12, '2026-12-01'),
    ('Bluebonnet Lofts',       'Loft 1',      1, 1.0, 1380, 13, '2026-11-01'),
    ('Bluebonnet Lofts',       'Loft 2',      2, 2.0, 1795, 13, '2026-12-15'),
    ('Legacy Row Residences',  'The Elm',     1, 1.0, 1520, 12, '2026-11-01'),
    ('Legacy Row Residences',  'The Oak',     2, 2.0, 2100, 12, '2026-11-20'),
    ('Prairie Oak Apartments', 'Studio S',    0, 1.0, 995,  12, '2026-11-10'),
    ('Prairie Oak Apartments', '1 Bed Plus',  1, 1.0, 1150, 12, '2026-11-01'),
    ('Willow Park Place',      'Willow 1',    1, 1.0, 1260, 15, '2026-11-01'),
    ('Willow Park Place',      'Willow 2',    2, 2.0, 1590, 15, '2027-01-05')
  ) as p(building, name, bedrooms, bathrooms, rent_usd, lease_months, available_from)
    on p.building = b.name
  returning 1
),
fees as (
  insert into public.building_fees (building_id, name, monthly_usd)
  select b.id, f.name, f.monthly_usd
  from b join (values
    ('Maple Creek Flats',      'Trash valet',     30),
    ('Maple Creek Flats',      'Pest control',     5),
    ('Cottonwood Commons',     'Tech package',    75),
    ('Cottonwood Commons',     'Trash',           25),
    ('Bluebonnet Lofts',       'Amenity fee',     40),
    ('Legacy Row Residences',  'Tech package',    85),
    ('Legacy Row Residences',  'Valet trash',     35),
    ('Legacy Row Residences',  'Pet DNA program',  0),
    ('Prairie Oak Apartments', 'Trash',           20),
    ('Willow Park Place',      'Utility admin',   12),
    ('Willow Park Place',      'Trash valet',     28)
  ) as f(building, name, monthly_usd)
    on f.building = b.name
  returning 1
)
insert into public.building_deals (building_id, description, kind, amount, valid_until)
select b.id, d.description, d.kind, d.amount, d.valid_until::date
from b join (values
  ('Cottonwood Commons',  '6 weeks free on a 12-month lease', 'free_weeks', 6,   '2026-12-31'),
  ('Bluebonnet Lofts',    '$500 off move-in',                 'fixed_usd',  500, '2026-11-30'),
  ('Legacy Row Residences','8 weeks free',                    'free_weeks', 8,   '2026-12-15'),
  ('Willow Park Place',   '1 month free (as 4 weeks)',        'free_weeks', 4,   null)
) as d(building, description, kind, amount, valid_until)
  on d.building = b.name;
