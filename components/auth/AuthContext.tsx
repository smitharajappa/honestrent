"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type Value = {
  user: User | null;
  /** Sent to our server so it can check who is asking. Never shown or stored by us. */
  accessToken: string | null;
  ready: boolean;
  /** False if the site isn't connected to Supabase. */
  available: boolean;
  signInWithEmail: (email: string, next?: string) => Promise<string | null>;
  signInWithGoogle: (next?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<Value | null>(null);

function redirectTo(next?: string): string {
  const url = new URL("/auth/callback", window.location.origin);
  if (next && next.startsWith("/") && !next.startsWith("//"))
    url.searchParams.set("next", next);
  return url.toString();
}

/** Who is signed in. Signing in is optional: the whole search works without it. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const supabase = getBrowserSupabase();

  // Decided after the page loads, so the server and the browser always agree on first paint.
  useEffect(() => {
    setAvailable(supabase !== null);
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const signInWithEmail = useCallback(
    async (email: string, next?: string) => {
      if (!supabase) return "Sign-in isn't set up yet.";
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo(next) },
      });
      return error ? "We couldn't send the link. Check the email and try again." : null;
    },
    [supabase],
  );

  const signInWithGoogle = useCallback(
    async (next?: string) => {
      if (!supabase) return "Sign-in isn't set up yet.";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectTo(next) },
      });
      return error
        ? "Google sign-in isn't switched on yet. Use the email link instead."
        : null;
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, [supabase]);

  const value = useMemo<Value>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      ready,
      available,
      signInWithEmail,
      signInWithGoogle,
      signOut,
    }),
    [session, ready, available, signInWithEmail, signInWithGoogle, signOut],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): Value {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
