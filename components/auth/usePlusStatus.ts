"use client";

import { useEffect, useState } from "react";
import { myPlusStatus, type PlusStatus } from "@/app/actions/plus";
import { useAuth } from "./AuthContext";

/** What the signed-in renter can use. Asked of our server, which checks the sign-in token. */
export function usePlusStatus(): { status: PlusStatus | null; loading: boolean } {
  const { accessToken, ready } = useAuth();
  const [state, setState] = useState<{ token: string | null; status: PlusStatus | null }>(
    {
      token: null,
      status: null,
    },
  );

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
  }, [ready, accessToken]);

  if (!ready) return { status: null, loading: true };
  if (!accessToken) return { status: { signedIn: false }, loading: false };
  return state.token === accessToken
    ? { status: state.status, loading: false }
    : { status: null, loading: true };
}
