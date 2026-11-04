"use client";

import { useEffect, useState } from "react";
import { myPlusStatus, type PlusStatus } from "@/app/actions/plus";
import { useAuth } from "./AuthContext";

/** What the signed-in renter can use. Asked of our server, which checks the sign-in token. */
/** Fired after a pass is bought, so every place that shows the pass asks again. */
export const PASS_CHANGED = "honestrent:pass-changed";

export function usePlusStatus(): { status: PlusStatus | null; loading: boolean } {
  const { accessToken, ready } = useAuth();
  const [state, setState] = useState<{ token: string | null; status: PlusStatus | null }>(
    {
      token: null,
      status: null,
    },
  );

  const [bump, setBump] = useState(0);
  useEffect(() => {
    const again = () => setBump((n) => n + 1);
    window.addEventListener(PASS_CHANGED, again);
    return () => window.removeEventListener(PASS_CHANGED, again);
  }, []);

  useEffect(() => {
    if (!ready || !accessToken) return;
    let cancelled = false;
    myPlusStatus(accessToken)
      .then((status) => !cancelled && setState({ token: accessToken, status }))
      .catch(
        () => !cancelled && setState({ token: accessToken, status: { signedIn: false } }),
      );
    return () => {
      cancelled = true;
    };
  }, [ready, accessToken, bump]);

  if (!ready) return { status: null, loading: true };
  if (!accessToken) return { status: { signedIn: false }, loading: false };
  return state.token === accessToken
    ? { status: state.status, loading: false }
    : { status: null, loading: true };
}
