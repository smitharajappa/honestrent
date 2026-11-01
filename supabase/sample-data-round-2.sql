-- MADE-UP sample data for Round 2. These buildings do not exist.
-- Run after the Round 2 migration. Safe to re-run: it updates buildings by name
-- and replaces their utility rows. Building ids stay the same.

update public.buildings b set
  zip = v.zip,
  application_fee_usd = v.app_fee,
  admin_fee_usd = v.admin_fee,
  deposit_usd = v.deposit,
  deposit_no_credit_usd = v.deposit_no_credit,
  accepts_itin = v.itin,
  accepts_passport_only = v.passport,
  accepts_no_ssn = (v.itin or v.passport),
  accepts_offer_letter = v.offer_letter,
  guarantor_companies = v.guarantors,
  documents_required = v.documents,
  utility_billing = v.billing,
  electricity_note = v.electricity,
  miles_to_utd = v.miles,
  bus_route = v.bus
from (values
  ('Maple Creek Flats', '75080', 45, 150, 250, 750, true, true, true,
    array['TheGuarantors', 'Leap'],
    array['Passport', 'Visa', 'I-20 or offer letter', '3 months of bank statements'],
    'allocated', 'You choose an electricity provider. About $70-$110 a month.', 1.2, '883'),
  ('Cottonwood Commons', '75081', 60, 200, 400, 800, false, false, false,
    array['TheGuarantors'],
    array['SSN card', 'Photo ID', '2 months of pay stubs'],
    'submetered', 'You choose an electricity provider. About $80-$120 a month.', 2.4, '883'),
  ('Bluebonnet Lofts', '75074', 50, 100, 300, 300, true, true, true,
    array['TheGuarantors', 'Leap'],
    array['Passport', 'Visa', 'I-20 or offer letter', '2 months of bank statements'],
    'included', 'Electricity included in rent.', 4.8, '210'),
  ('Legacy Row Residences', '75024', 75, 250, 500, null, false, false, false,
    array[]::text[],
    array['SSN card', 'Photo ID', '2 months of pay stubs', 'Credit check'],
    'allocated', 'You choose an electricity provider. About $90-$140 a month.', 7.9, null),
  ('Prairie Oak Apartments', '75082', 40, 100, 200, 600, true, false, true,
    array['TheGuarantors'],
    array['Passport', 'I-20', '3 months of bank statements'],
    'direct', 'You pay water and electricity providers directly.', 3.1, '883'),
  ('Willow Park Place', '75075', 50, 150, 350, 1000, true, false, true,
    array['Leap'],
    array['SSN card or ITIN letter', 'Offer letter or 2 months of pay stubs'],
    'submetered', 'You choose an electricity provider. About $80-$120 a month.', 6.5, '208')
) as v(name, zip, app_fee, admin_fee, deposit, deposit_no_credit, itin, passport, offer_letter,
       guarantors, documents, billing, electricity, miles, bus)
where b.name = v.name;

delete from public.building_utility_estimates
where building_id in (select id from public.buildings);
delete from public.building_utility_items
where building_id in (select id from public.buildings);

insert into public.building_utility_estimates
  (building_id, bedrooms, avg_usd, low_usd, high_usd, source, as_of)
select b.id, e.bedrooms, e.avg_usd, e.low_usd, e.high_usd, e.source, e.as_of::date
from public.buildings b
join (values
  ('Maple Creek Flats', 0, 95, 70, 125, 'building', '2025-12-31'),
  ('Maple Creek Flats', 1, 120, 90, 160, 'building', '2025-12-31'),
  ('Cottonwood Commons', 1, 140, 110, 185, 'building', '2025-12-31'),
  ('Cottonwood Commons', 2, 185, 140, 240, 'building', '2025-12-31'),
  ('Legacy Row Residences', 1, 190, 150, 245, 'building', '2025-12-31'),
  ('Legacy Row Residences', 2, 231, 180, 290, 'building', '2025-12-31'),
  ('Prairie Oak Apartments', 0, 80, 55, 110, 'estimate', '2026-10-21'),
  ('Prairie Oak Apartments', 1, 100, 70, 140, 'estimate', '2026-10-21'),
  ('Willow Park Place', 1, 130, 100, 170, 'building', '2025-12-31'),
  ('Willow Park Place', 2, 170, 130, 220, 'building', '2025-12-31')
) as e(name, bedrooms, avg_usd, low_usd, high_usd, source, as_of)
  on e.name = b.name;

insert into public.building_utility_items (building_id, name, kind, typical_usd, sort)
select b.id, i.item, i.kind, i.typical, i.sort
from public.buildings b
join (values
  ('Maple Creek Flats', 'Water', 'water', null::numeric, 1),
  ('Maple Creek Flats', 'Sewer', 'sewer', null, 2),
  ('Maple Creek Flats', 'Trash', 'trash', 35, 3),
  ('Maple Creek Flats', 'Billing fee', 'admin', 4, 4),
  ('Cottonwood Commons', 'Water', 'water', null, 1),
  ('Cottonwood Commons', 'Sewer', 'sewer', null, 2),
  ('Cottonwood Commons', 'Trash', 'trash', 45, 3),
  ('Cottonwood Commons', 'Drainage', 'drainage', 4, 4),
  ('Cottonwood Commons', 'Water and sewer admin fees', 'admin', 6, 5),
  ('Legacy Row Residences', 'Water', 'water', null, 1),
  ('Legacy Row Residences', 'Sewer', 'sewer', null, 2),
  ('Legacy Row Residences', 'Trash (monthly)', 'trash', 82, 3),
  ('Legacy Row Residences', 'Drainage', 'drainage', 4, 4),
  ('Legacy Row Residences', 'Water, sewer and billing admin fees', 'admin', 11, 5),
  ('Prairie Oak Apartments', 'Water (paid to the city)', 'water', null, 1),
  ('Willow Park Place', 'Water', 'water', null, 1),
  ('Willow Park Place', 'Sewer', 'sewer', null, 2),
  ('Willow Park Place', 'Trash', 'trash', 30, 3),
  ('Willow Park Place', 'Billing fee', 'admin', 5, 4)
) as i(name, item, kind, typical, sort)
  on i.name = b.name;
