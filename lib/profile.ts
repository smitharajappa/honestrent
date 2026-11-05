// What we show for a signed-in person: a name, a first letter, and a photo if Google gave one.
// Pure functions so they are easy to test. Nothing here is stored.

export type ProfileSource = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function text(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** "rajappa.smitha" or "rajappa_smitha92" becomes "Rajappa Smitha". Letters only, each word capitalised. */
export function prettyFromEmail(email: string): string {
  const local = email.trim().split("@")[0] ?? "";
  const words = local
    .split(/[._\-+\s]+/)
    .map((w) => w.replace(/[^\p{L}]/gu, ""))
    .filter((w) => w.length > 0)
    .slice(0, 3);
  return words
    .map((w) => w.charAt(0).toLocaleUpperCase() + w.slice(1).toLocaleLowerCase())
    .join(" ");
}

/**
 * The name we show: the one they typed or Google gave us, otherwise a tidied-up version of the
 * part of the email before the @ (never the raw address).
 */
export function displayName(user: ProfileSource): string {
  const meta = user.user_metadata ?? {};
  const named = text(meta.full_name) || text(meta.name);
  if (named) return named;
  return prettyFromEmail(text(user.email)) || "Your profile";
}

/** Checks a name someone types in. Short, letters and a few marks, nothing that looks like contact details. */
export function validateDisplayName(
  raw: string,
): { ok: true; value: string } | { ok: false; error: string } {
  const value = raw.trim().replace(/\s+/g, " ");
  if (value.length < 2 || value.length > 40)
    return { ok: false, error: "Use 2 to 40 characters." };
  if (!/^[\p{L}][\p{L}\p{M} .'’-]*$/u.test(value))
    return { ok: false, error: "Use letters, spaces, dots, apostrophes or hyphens." };
  // "site.com" has a dot between letters; real names put a space after an initial ("J. Rao").
  if (/\p{L}\.\p{L}/u.test(value))
    return { ok: false, error: "Use just your name, with no web address." };
  return { ok: true, value };
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
