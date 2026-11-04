"use server";

import { userClient, viewerFromToken } from "@/lib/auth-server";
import {
  isPassId,
  nextPassWindow,
  passById,
  type CurrentPass,
  type PassId,
} from "@/lib/plus";
import { getSupabase } from "@/lib/supabase";

export type PlusStatus =
  | { signedIn: false }
  | {
      signedIn: true;
      email: string | null;
      hasPlus: boolean;
      demoOpen: boolean;
      plusUntil: string | null;
      /** The pass running now, if any. */
      pass: CurrentPass | null;
      /** Can use roommate matches and introductions. */
      roommates: boolean;
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
    pass: viewer.pass,
    roommates: viewer.hasRoommates,
  };
}

export type DemoPurchase =
  | { ok: true; pass: PassId; startsAt: string; endsAt: string }
  | { ok: false; error: string };

/**
 * DEMO PAYMENT. No card, no Stripe, no money: it only adds a pass to the account so the whole
 * flow can be shown. The database refuses it once the "demo_payments" switch is turned off
 * (that is the moment real payments replace this).
 */
export async function buyDemoPass(
  token: string | null,
  pass: unknown,
): Promise<DemoPurchase> {
  const viewer = await viewerFromToken(token);
  if (!viewer || !token) return { ok: false, error: "Sign in first." };
  if (!isPassId(pass)) return { ok: false, error: "Choose a pass." };
  const sb = userClient(token);
  if (!sb) return { ok: false, error: "We couldn't do that just now. Please try again." };
  const { data, error } = await sb.rpc("buy_demo_pass", { p_pass: pass });
  if (error) {
    if (error.message.includes("switched off"))
      return { ok: false, error: "Demo payments are switched off." };
    if (error.message.includes("Too many"))
      return {
        ok: false,
        error: "That's a lot of demo purchases today. Please try again tomorrow.",
      };
    console.error("Failed to add a demo pass:", error.code, error.message);
    return {
      ok: false,
      error: "We couldn't do that just now. Please try again in a minute.",
    };
  }
  const row = (Array.isArray(data) ? data[0] : data) as
    { starts_at: string; ends_at: string } | null | undefined;
  if (!row)
    return { ok: false, error: "We couldn't do that just now. Please try again." };
  return { ok: true, pass, startsAt: row.starts_at, endsAt: row.ends_at };
}

/** What the next pass would cover, so the checkout can say the dates before anyone pays. */
export async function previewPass(
  token: string | null,
  pass: unknown,
): Promise<{ startsAt: string; endsAt: string } | null> {
  const viewer = await viewerFromToken(token);
  if (!viewer || !isPassId(pass)) return null;
  const current = viewer.plusUntil ? new Date(viewer.plusUntil) : null;
  const w = nextPassWindow(current, passById(pass).days);
  return { startsAt: w.start.toISOString(), endsAt: w.end.toISOString() };
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
