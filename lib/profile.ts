// What we show for a signed-in person: a name, a first letter, and a photo if Google gave one.
// Pure functions so they are easy to test. Nothing here is stored.

export type ProfileSource = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function text(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Name from Google if there is one, otherwise the part of the email before the @. */
export function displayName(user: ProfileSource): string {
  const meta = user.user_metadata ?? {};
  const named = text(meta.full_name) || text(meta.name);
  if (named) return named;
  const local = text(user.email).split("@")[0];
  return local || "Your profile";
}

/** One capital letter for the round avatar. Never empty. */
export function initialOf(user: ProfileSource): string {
  const first = Array.from(displayName(user).replace(/^[^\p{L}\p{N}]+/u, ""))[0];
  return first ? first.toLocaleUpperCase() : "?";
}

/** The Google photo, only if it is a normal https address. Otherwise null (we show the letter). */
export function photoUrl(user: ProfileSource): string | null {
  const meta = user.user_metadata ?? {};
  const raw = text(meta.avatar_url) || text(meta.picture);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
