import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";
import { Card } from "@/components/ui/Card";
import { CheckIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/PageHeader";

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
    <main>
      <PageHeader eyebrow="Sign in" title="Sign in to Honest Rent">
        Optional. Search, real cost and approval fit work without an account.
      </PageHeader>
      <div className="page-container grid gap-8 py-8 md:grid-cols-[26rem_1fr] md:items-start">
        <Card className="p-6 shadow-raised">
          <SignInForm next={target} />
        </Card>
        <ul className="space-y-4 text-sm">
          {[
            "An account lets you use a Honest Rent Plus pass, find a roommate and, later, keep saves on every device.",
            "Your approval answers still stay in this browser tab. We never tie your income or ID answers to your account.",
            "We don't store a password. We email you a link.",
          ].map((t) => (
            <li key={t} className="flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success-soft text-success-text">
                <CheckIcon className="size-3.5" />
              </span>
              <span className="text-text-muted">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
