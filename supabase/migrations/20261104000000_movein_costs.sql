-- Swelt: move-in costs and guarantor companies, as confirmed with each leasing office.
-- Safe to run more than once. Every column is null until someone confirms it; null means "ask the leasing office".

alter table public.buildings
  add column if not exists application_fee_usd int check (application_fee_usd >= 0),
  add column if not exists admin_fee_usd int check (admin_fee_usd >= 0),
  add column if not exists security_deposit_usd int check (security_deposit_usd >= 0),
  -- Deposit for a renter with no US credit, if the building charges a different amount.
  add column if not exists deposit_no_credit_usd int check (deposit_no_credit_usd >= 0),
  -- Guarantor companies the building accepts. null = unknown, empty list = none accepted.
  add column if not exists guarantor_companies text[],
  -- The day these numbers were confirmed (call or written reply).
  add column if not exists terms_verified_on date;
