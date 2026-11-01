-- Swelt: two move-in columns added by an earlier migration duplicated Round 2's
-- deposit_usd and last_verified. Round 2's columns are the ones the app uses.
-- Safe to run more than once.

alter table public.buildings
  drop column if exists security_deposit_usd,
  drop column if exists terms_verified_on;
