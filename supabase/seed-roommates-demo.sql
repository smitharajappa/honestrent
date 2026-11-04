-- SAMPLE roommate profiles, made up by the team for the demo. These people do not exist.
-- They are labelled "Sample profile" in the app, and introductions to them are refused.
-- Some carry the verified tag so the demo shows how it will look. Safe to re-run.

delete from public.roommate_profiles where demo;

insert into public.roommate_profiles
  (demo, nickname, city, budget_usd, move_in, languages, interests, sleep, cleanliness, guests,
   smoking, pets, study, about, verified_at, gender, gender_pref, room_types, building_ids)
values
  (true, 'Sample Alex',   'Richardson', 850,  '2026-12-01', '{English,Hindi}',            '{Cooking,Cricket,Movies}',        'night',    'tidy',      'sometimes', 'no',      'fine', 'quiet',  'Grad student. I cook on weekends and like a calm home during the week.', now(), 'man', 'any', '{private,shared}', (select coalesce(array_agg(id), '{}') from public.buildings where name in ('Maple Creek Flats'))),
  (true, 'Sample Jordan', 'Richardson', 950,  '2026-12-10', '{English,Spanish}',          '{Running,Music,Board games}',     'early',    'very_tidy', 'rarely',    'no',      'none', 'quiet',  'Early riser, out by 7. Clean kitchen is my one rule.', null, 'woman', 'same', '{private}', (select coalesce(array_agg(id), '{}') from public.buildings where name in ('Maple Creek Flats', 'Cutters Point Apartment Homes'))),
  (true, 'Sample Riley',  'Richardson', 800,  '2027-01-05', '{English,Mandarin}',        '{Coding,Gaming,Anime}',           'night',    'relaxed',   'sometimes', 'outside', 'have', 'mixed',  'Software intern with a small cat. Quiet hours after 11.', now(), 'nonbinary', 'any', '{private,shared}', '{}'),
  (true, 'Sample Sam',    'Plano',      900,  '2026-12-01', '{English,Telugu,Hindi}',     '{Cooking,Hiking,Movies}',         'night',    'tidy',      'sometimes', 'no',      'fine', 'quiet',  'Working near Legacy. Happy to split chores on a rota.', now(), 'man', 'any', '{private,shared}', (select coalesce(array_agg(id), '{}') from public.buildings where name in ('Camden Legacy Park'))),
  (true, 'Sample Taylor', 'Plano',      1100, '2026-12-15', '{English}',                  '{Fitness,Travel,Photography}',    'early',    'tidy',      'often',     'no',      'fine', 'social', 'Friendly, often have friends over on weekends.', null, 'woman', 'same', '{private,shared}', (select coalesce(array_agg(id), '{}') from public.buildings where name in ('Camden Legacy Park', 'Camden Legacy Creek'))),
  (true, 'Sample Casey',  'Plano',      850,  '2026-11-28', '{English,Korean}',           '{Music,Art,Reading}',             'flexible', 'tidy',      'rarely',    'no',      'none', 'quiet',  'Quiet reader. I would like someone who keeps shared spaces tidy.', null, 'woman', 'same', '{shared}', (select coalesce(array_agg(id), '{}') from public.buildings where name in ('Camden Legacy Creek'))),
  (true, 'Sample Morgan', 'Dallas',     1000, '2026-12-05', '{English,Spanish,French}',   '{Soccer,Cooking,Volunteering}',   'flexible', 'tidy',      'sometimes', 'no',      'fine', 'mixed',  'Works downtown. Easy-going and up for a split-cost grocery run.', now(), 'man', 'any', '{private}', (select coalesce(array_agg(id), '{}') from public.buildings where name in ('Maya at White Rock'))),
  (true, 'Sample Jamie',  'Dallas',     1250, '2027-01-02', '{English,Vietnamese}',       '{Yoga,Travel,Startups}',          'early',    'very_tidy', 'rarely',    'no',      'none', 'quiet',  'Product manager. Prefer a calm, tidy place.', null, 'woman', 'any', '{private,shared}', '{}');
