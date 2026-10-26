"use server";

import { fetchBuilding } from "@/lib/buildings";
import { validateLead, type InterestState } from "@/lib/lead";
import { getSupabase } from "@/lib/supabase";

const TRY_AGAIN = "We couldn't save that just now. Please try again in a minute.";

/** Saves an "I'm interested" lead. Runs only on the server. */
export async function submitInterest(
  _previous: InterestState,
  formData: FormData,
): Promise<InterestState> {
  const raw = Object.fromEntries(formData);
  const values = {
    email: typeof raw.email === "string" ? raw.email : "",
    consent: raw.consent === "on",
  };

  const result = validateLead(raw);
  // Pretend it worked so spam bots learn nothing.
  if (!result.ok && result.spam) return { status: "success", email: "" };
  if (!result.ok) return { status: "invalid", errors: result.errors, values };

  const lead = result.value;

  // Never trust ids from the browser: the building must exist, and the
  // floor plan (if any) must belong to it.
  const found = await fetchBuilding(lead.buildingId);
  if (!found.ok || !found.building) {
    return { status: "invalid", errors: { form: TRY_AGAIN }, values };
  }
  const planBelongs = found.building.floor_plans.some((p) => p.id === lead.floorPlanId);

  const supabase = getSupabase();
  if (!supabase) return { status: "invalid", errors: { form: TRY_AGAIN }, values };

  const { error } = await supabase.from("leads").insert({
    building_id: lead.buildingId,
    floor_plan_id: planBelongs ? lead.floorPlanId : null,
    email: lead.email,
    move_in: lead.moveIn,
    budget_usd: lead.budget,
    consent: true,
  });

  if (error?.code === "23505") return { status: "duplicate", email: lead.email };
  if (error) {
    // Log the reason for the team, never the renter's email.
    console.error("Failed to save lead:", error.code, error.message);
    return { status: "invalid", errors: { form: TRY_AGAIN }, values };
  }
  return { status: "success", email: lead.email };
}
