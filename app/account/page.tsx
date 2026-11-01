import type { Metadata } from "next";
import { AccountPanel } from "@/components/auth/AccountPanel";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Your account</h1>
      <div className="mt-6">
        <AccountPanel />
      </div>
    </main>
  );
}
