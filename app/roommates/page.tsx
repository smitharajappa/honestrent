import type { Metadata } from "next";
import { RoommatesPanel } from "@/components/roommates/RoommatesPanel";

export const metadata: Metadata = {
  title: "Find a roommate",
  description:
    "People in your city whose habits fit yours. Chat opens only after you both accept.",
};

export default function RoommatesPage() {
  return (
    <main className="page-container py-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find a roommate</h1>
      <p className="mt-2 max-w-2xl text-lg text-text-muted">
        People in your city whose habits fit yours. You choose who to ask, and chat opens
        only after you both accept. We match on habits, budget, move-in date, languages
        and interests.
      </p>
      <div className="mt-8 max-w-4xl">
        <RoommatesPanel />
      </div>
    </main>
  );
}
