import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { RoommatesPanel } from "@/components/roommates/RoommatesPanel";

export const metadata: Metadata = {
  title: "Find a roommate",
  description:
    "People in your city whose habits fit yours. Chat opens only after you both accept.",
};

export default function RoommatesPage() {
  return (
    <main>
      <PageHeader eyebrow="Roommates" title="Find a roommate">
        People in your city whose habits fit yours. You choose who to ask, and chat opens
        only after you both accept. We match on habits, budget, move-in date, room type,
        languages and interests.
      </PageHeader>
      <div className="page-container py-8">
        <div className="max-w-4xl">
          <RoommatesPanel />
        </div>
      </div>
    </main>
  );
}
