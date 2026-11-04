import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SavedView } from "@/components/shortlist/SavedView";
import { Card } from "@/components/ui/Card";
import { AlertIcon } from "@/components/ui/icons";
import { fetchBuildings } from "@/lib/buildings";
import { todayInTexas } from "@/lib/validation";

export const metadata: Metadata = { title: "Saved apartments" };

// Always load current prices (never a copy frozen at build time).
export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const data = await fetchBuildings();
  return (
    <main>
      <PageHeader eyebrow="Your shortlist" title="Saved apartments">
        Each shows its cheapest floor plan. Saved on this device only.
      </PageHeader>
      <div className="page-container pt-8">
        {data.ok ? (
          <SavedView buildings={data.buildings} today={todayInTexas()} />
        ) : (
          <Card role="alert" className="mt-8 flex gap-3 p-5">
            <AlertIcon className="mt-0.5 size-5 shrink-0 text-warning-text" />
            <p className="text-sm">
              Apartments are temporarily unavailable. Please try again soon.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
