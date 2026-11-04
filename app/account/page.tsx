import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { AccountPanel } from "@/components/auth/AccountPanel";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function AccountPage() {
  return (
    <main>
      <PageHeader eyebrow="Account" title="Your account">
        Your sign-in, your pass and what we keep.
      </PageHeader>
      <div className="mx-auto w-full max-w-xl px-4 py-8">
        <AccountPanel />
      </div>
    </main>
  );
}
