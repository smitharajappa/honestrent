import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Sign in" };

type SearchParams = Promise<{ next?: string | string[] }>;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { next } = await searchParams;
  const target = Array.isArray(next) ? next[0] : next;
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Sign in to Swelt</h1>
      <p className="mt-2 text-text-muted">
        Optional. Search, real cost and approval fit work without an account.
      </p>
      <Card className="mt-6 p-6">
        <SignInForm next={target} />
      </Card>
      <ul className="mt-6 space-y-2 text-sm text-text-muted">
        <li>
          An account lets you use a Swelt Plus pass and, later, keep saves on every
          device.
        </li>
        <li>
          Your approval answers still stay in this browser tab. We never tie your income
          or ID answers to your account.
        </li>
        <li>We don&apos;t store a password.</li>
      </ul>
    </main>
  );
}
