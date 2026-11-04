"use server";

import { viewerFromToken } from "@/lib/auth-server";
import { isPassId, type PassId } from "@/lib/plus";
import { getSupabase } from "@/lib/supabase";

export type PlusStatus =
  | { signedIn: false }
  | {
      signedIn: true;
      email: string | null;
      hasPlus: boolean;
      demoOpen: boolean;
      plusUntil: string | null;
    };

/** What the signed-in renter can use right now. */
export async function myPlusStatus(token: string | null): Promise<PlusStatus> {
  const viewer = await viewerFromToken(token);
  if (!viewer) return { signedIn: false };
  return {
    signedIn: true,
    email: viewer.email,
    hasPlus: viewer.hasPlus,
    demoOpen: viewer.demoOpen,
    plusUntil: viewer.plusUntil,
  };
}

export type WaitlistState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "duplicate" }
  | {
      status: "invalid";
      errors: { email?: string; pass?: string; consent?: string; form?: string };
    };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Saves a waitlist sign-up (email and the pass they'd choose). Nothing is charged. */
export async function joinPlusWaitlist(
  _previous: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const raw = Object.fromEntries(formData);
  // Hidden field that only bots fill in: pretend it worked.
  if (typeof raw.hr_trap === "string" && raw.hr_trap.trim() !== "") {
    return { status: "success" };
  }
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const pass = raw.pass;
  const errors: { email?: string; pass?: string; consent?: string; form?: string } = {};
  if (email === "") errors.email = "Enter your email so we can reach you.";
  else if (email.length > 254 || !EMAIL.test(email))
    errors.email = "Enter a valid email, like name@example.com.";
  if (!isPassId(pass)) errors.pass = "Choose the pass you would want.";
  if (raw.consent !== "on")
    errors.consent = "Tick the box so we're allowed to email you.";
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };

  const supabase = getSupabase();
  if (!supabase) {
    return {
      status: "invalid",
      errors: { form: "We couldn't save that just now. Please try again in a minute." },
    };
  }
  const { error } = await supabase
    .from("plus_waitlist")
    .insert({ email, pass: pass as PassId, consent: true });
  if (error?.code === "23505") return { status: "duplicate" };
  if (error) {
    console.error("Failed to save waitlist sign-up:", error.code, error.message);
    return {
      status: "invalid",
      errors: { form: "We couldn't save that just now. Please try again in a minute." },
    };
  }
  return { status: "success" };
}
