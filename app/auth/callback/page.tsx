"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";

function Finish() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  // Supabase puts the session in this tab from the link. Once it is there, go on.
  useEffect(() => {
    if (ready && user) router.replace(target);
  }, [ready, user, target, router]);

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16 text-center" role="status">
      <h1 className="text-2xl font-bold">Signing you in…</h1>
      <p className="mt-2 text-text-muted">
        {ready && !user
          ? "That link didn't work. It may have expired or been used already. Go back and ask for a new one."
          : "One moment."}
      </p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <Finish />
    </Suspense>
  );
}
