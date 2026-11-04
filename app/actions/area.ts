"use server";

import { getSupabase } from "@/lib/supabase";
import { validateArea } from "@/lib/validation";

export type AreaRequestState = { status: "idle" | "done" | "error"; message?: string };

/** Records that someone wants Honest Rent in an area. Area name and date only. */
export async function requestArea(
  _prev: AreaRequestState,
  formData: FormData,
): Promise<AreaRequestState> {
  const raw = formData.get("area");
  const area = validateArea(typeof raw === "string" ? raw : undefined);
  if (!area.ok || !area.value)
    return { status: "error", message: "That area name looks off." };

  const supabase = getSupabase();
  if (!supabase)
    return { status: "error", message: "Please try again in a few minutes." };

  const { error } = await supabase.from("area_requests").insert({ area: area.value });
  if (error) {
    console.error("Failed to save area request:", error.code, error.message);
    return { status: "error", message: "Please try again in a few minutes." };
  }
  return { status: "done" };
}
