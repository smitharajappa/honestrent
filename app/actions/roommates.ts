"use server";

import { userClient, viewerFromToken } from "@/lib/auth-server";
import {
  rankMatches,
  validateProfile,
  type DirectoryProfile,
  type Match,
  type Profile,
  type ProfileErrors,
} from "@/lib/roommates";
import { todayInTexas } from "@/lib/validation";

export type MyProfile = Profile & { id: string; verified: boolean };

export type CommunityOption = { id: string; name: string; city: string };

export type Intro = {
  id: string;
  status: "pending" | "accepted" | "declined";
  i_asked: boolean;
  other_id: string;
  nickname: string;
  city: string;
  verified: boolean;
  demo: boolean;
};

export type RoommateState =
  | { status: "signed-out" }
  | { status: "unavailable" }
  | {
      status: "ok";
      /** Has a pass that includes roommate matches (or the site is in demo mode). */
      hasAccess: boolean;
      profile: MyProfile | null;
      matches: Match[];
      /** How many people are in the same city (shown even without a pass). */
      cityCount: number;
      intros: Intro[];
      /** Apartment communities people can say they are looking at. */
      communities: CommunityOption[];
    };

const PROFILE_COLUMNS =
  "id, nickname, city, budget_usd, move_in, languages, interests, sleep, cleanliness, guests, smoking, pets, study, room_types, gender, gender_pref, building_ids, about, visible, verified_at";

async function loadCommunities(
  sb: NonNullable<ReturnType<typeof userClient>>,
): Promise<CommunityOption[]> {
  const { data } = await sb.from("buildings").select("id, name, city").order("name");
  return (data ?? []) as CommunityOption[];
}

/** Everything the roommates page needs, for the signed-in renter only. */
export async function loadRoommates(token: string | null): Promise<RoommateState> {
  const viewer = await viewerFromToken(token);
  if (!viewer || !token) return { status: "signed-out" };
  const sb = userClient(token);
  if (!sb) return { status: "unavailable" };

  const { data: row, error } = await sb
    .from("roommate_profiles")
    .select(PROFILE_COLUMNS)
    .maybeSingle();
  if (error) {
    console.error("Failed to load roommate profile:", error.code, error.message);
    return { status: "unavailable" };
  }
  const { data: introRows } = await sb
    .from("roommate_my_intros")
    .select("id, status, i_asked, other_id, nickname, city, verified, demo")
    .neq("status", "declined")
    .order("created_at", { ascending: false });
  const intros = (introRows ?? []) as Intro[];
  const communities = await loadCommunities(sb);

  if (!row) {
    return {
      status: "ok",
      hasAccess: viewer.hasRoommates,
      profile: null,
      matches: [],
      cityCount: 0,
      intros,
      communities,
    };
  }
  const { verified_at, ...rest } = row as unknown as Profile & {
    id: string;
    verified_at: string | null;
  };
  const profile: MyProfile = { ...rest, verified: verified_at !== null };

  const { data: others } = await sb
    .from("roommate_directory")
    .select("*")
    .eq("city", profile.city)
    .limit(200);
  const list = (others ?? []) as DirectoryProfile[];
  return {
    status: "ok",
    hasAccess: viewer.hasRoommates,
    profile,
    matches: viewer.hasRoommates
      ? rankMatches(profile, list, 20, new Map(communities.map((c) => [c.id, c.name])))
      : [],
    cityCount: list.length,
    intros,
    communities,
  };
}

export type SaveResult = { ok: true } | { ok: false; errors: ProfileErrors };

export async function saveRoommateProfile(
  token: string | null,
  raw: Record<string, unknown>,
): Promise<SaveResult> {
  const viewer = await viewerFromToken(token);
  const sb = viewer && token ? userClient(token) : null;
  if (!viewer || !sb) return { ok: false, errors: { form: "Sign in first." } };

  const checked = validateProfile(raw, todayInTexas());
  if (!checked.ok) return { ok: false, errors: checked.errors };
  // Keep only communities that exist.
  if (checked.value.building_ids.length > 0) {
    const known = new Set((await loadCommunities(sb)).map((c) => c.id));
    checked.value.building_ids = checked.value.building_ids.filter((id) => known.has(id));
  }

  const { data: existing } = await sb
    .from("roommate_profiles")
    .select("id")
    .maybeSingle();
  const { error } = existing
    ? await sb
        .from("roommate_profiles")
        .update({ ...checked.value, updated_at: new Date().toISOString() })
        .eq("user_id", viewer.id)
    : await sb.from("roommate_profiles").insert({ ...checked.value, user_id: viewer.id });
  if (error) {
    console.error("Failed to save roommate profile:", error.code, error.message);
    return {
      ok: false,
      errors: { form: "We couldn't save that just now. Please try again in a minute." },
    };
  }
  return { ok: true };
}

export async function removeRoommateProfile(
  token: string | null,
): Promise<{ ok: boolean }> {
  const viewer = await viewerFromToken(token);
  const sb = viewer && token ? userClient(token) : null;
  if (!viewer || !sb) return { ok: false };
  const { error } = await sb.from("roommate_profiles").delete().eq("user_id", viewer.id);
  return { ok: !error };
}

export type ActionResult = { ok: true } | { ok: false; error: string };
const TRY_AGAIN = "That didn't work just now. Please try again in a minute.";

/** Ask someone for an introduction. Needs a pass (free during the demo). */
export type AskResult =
  { ok: true; status: "pending" | "accepted" } | { ok: false; error: string };

export async function askIntro(
  token: string | null,
  otherId: string,
): Promise<AskResult> {
  const viewer = await viewerFromToken(token);
  const sb = viewer && token ? userClient(token) : null;
  if (!viewer || !sb) return { ok: false, error: "Sign in first." };
  if (!viewer.hasRoommates)
    return {
      ok: false,
      error: "Introductions come with a Tour, Apply or Move-in pass.",
    };

  const { data, error } = await sb.rpc("ask_roommate_intro", { p_other: otherId });
  if (error?.code === "23505")
    return { ok: false, error: "You already have an introduction with this person." };
  if (error?.message.includes("Too many"))
    return {
      ok: false,
      error: "That's a lot of requests. Please wait a little and try again.",
    };
  if (error?.message.includes("not available"))
    return { ok: false, error: "That person isn't available any more." };
  if (error?.message.includes("Create a roommate profile"))
    return { ok: false, error: "Create your profile first." };
  if (error) {
    console.error("Failed to ask for an introduction:", error.code, error.message);
    return { ok: false, error: TRY_AGAIN };
  }
  return { ok: true, status: data === "accepted" ? "accepted" : "pending" };
}

export async function answerIntro(
  token: string | null,
  introId: string,
  accept: boolean,
): Promise<ActionResult> {
  const viewer = await viewerFromToken(token);
  const sb = viewer && token ? userClient(token) : null;
  if (!viewer || !sb) return { ok: false, error: "Sign in first." };
  const { data, error } = await sb
    .from("roommate_intros")
    .update({
      status: accept ? "accepted" : "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", introId)
    .select("id");
  if (error || !data || data.length === 0) return { ok: false, error: TRY_AGAIN };
  return { ok: true };
}

const REASONS = [
  "scam",
  "harassment",
  "off_topic",
  "fake_profile",
  "discrimination",
  "other",
];

/** Block someone (hides you from each other) and tell the team why. */
export async function blockAndReport(
  token: string | null,
  otherId: string,
  reason: string,
  note: string,
): Promise<ActionResult> {
  const viewer = await viewerFromToken(token);
  const sb = viewer && token ? userClient(token) : null;
  if (!viewer || !sb) return { ok: false, error: "Sign in first." };
  const { data: me } = await sb.from("roommate_profiles").select("id").maybeSingle();
  if (!me || !REASONS.includes(reason)) return { ok: false, error: TRY_AGAIN };
  const { error: reportError } = await sb.from("roommate_reports").insert({
    reporter: me.id,
    reported: otherId,
    reason,
    note: note.trim().slice(0, 500),
  });
  const { error: blockError } = await sb
    .from("roommate_blocks")
    .insert({ blocker: me.id, blocked: otherId });
  if (reportError || (blockError && blockError.code !== "23505"))
    return { ok: false, error: TRY_AGAIN };
  return { ok: true };
}
