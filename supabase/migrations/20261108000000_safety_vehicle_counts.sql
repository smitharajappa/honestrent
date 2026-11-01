-- Swelt: reported vehicle incidents near a building (a smaller 0.25-mile circle).
-- Counts only. "Reported near this address", never a claim about the building.
-- Safe to run more than once.

alter table public.building_safety
  add column if not exists vehicle_radius_miles numeric(3, 2),
  -- Theft from a vehicle, and theft of vehicle parts or accessories.
  add column if not exists vehicle_break_ins int check (vehicle_break_ins >= 0),
  -- Vehicle stolen or used without the owner's permission.
  add column if not exists vehicle_thefts int check (vehicle_thefts >= 0);
