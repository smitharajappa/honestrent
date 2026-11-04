// Who is asking, checked on our server. The browser sends its sign-in token; we check it
// with Supabase and read only that person's own passes (row-level security).

import { createClient } from "@supabase/supabase-js";
import { activeUntil, currentPass, roommatesUntil, type CurrentPass } from "./plus";
import { IS_DEMO } from "./site";

export type Viewer = {
  id: string;
  email: string | null;
  /** When the running pass ends, or null. */
  plusUntil: string | null;
  /** True while the site is in demo mode: Plus features are open to signed-in renters. */
  demoOpen: boolean;
  /** Can use Plus features right now. */
  hasPlus: boolean;
  /** Can see roommate matches and ask for introductions (a Tour, Apply or Move-in pass). */
  hasRoommates: boolean;
  /** The pass running now, for showing in the profile. */
  pass: CurrentPass | null;
};

/** A Supabase client that acts as this signed-in renter: row-level security applies to them. */
export function userClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function viewerFromToken(token: unknown): Promise<Viewer | null> {
  if (typeof token !== "string" || token.length < 20 || token.length > 4000) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: auth, error } = await supabase.auth.getUser(token);
  if (error || !auth.user) return null;

  const { data } = await supabase.from("plus_passes").select("pass, starts_at, ends_at");
  const passes = (data ?? []) as { pass: string; starts_at: string; ends_at: string }[];
  const until = activeUntil(passes);
  return {
    id: auth.user.id,
    email: auth.user.email ?? null,
    plusUntil: until ? until.toISOString() : null,
    demoOpen: IS_DEMO,
    hasPlus: IS_DEMO || until !== null,
    hasRoommates: IS_DEMO || roommatesUntil(passes) !== null,
    pass: currentPass(passes),
  };
}
