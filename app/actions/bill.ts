"use server";

import { validateBillReport, type BillErrors } from "@/lib/billReport";
import { getSupabase } from "@/lib/supabase";
import { todayInTexas } from "@/lib/validation";

export type BillState =
  { status: "idle" } | { status: "done" } | { status: "invalid"; errors: BillErrors };

const TRY_AGAIN = "We couldn't save that just now. Please try again in a few minutes.";

/** Saves an anonymous bill as "pending" until the team reviews it. */
export async function submitBill(
  _prev: BillState,
  formData: FormData,
): Promise<BillState> {
  const result = validateBillReport(Object.fromEntries(formData), todayInTexas());
  if (!result.ok && result.spam) return { status: "done" }; // tell bots nothing
  if (!result.ok) return { status: "invalid", errors: result.errors };

  const supabase = getSupabase();
  if (!supabase) return { status: "invalid", errors: { amounts: TRY_AGAIN } };

  const { buildingId, billMonth, bedrooms, amounts } = result.value;
  const { error } = await supabase.from("renter_bill_reports").insert({
    building_id: buildingId,
    bill_month: billMonth,
    bedrooms,
    water_usd: amounts.water,
    sewer_usd: amounts.sewer,
    trash_usd: amounts.trash,
    drainage_usd: amounts.drainage,
    admin_usd: amounts.admin,
    other_usd: amounts.other,
  });
  if (error) {
    console.error("Failed to save bill report:", error.code, error.message);
    return {
      status: "invalid",
      errors:
        error.code === "23503"
          ? { building: "Choose the building." }
          : { amounts: TRY_AGAIN },
    };
  }
  return { status: "done" };
}
