import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CompareView } from "@/components/shortlist/CompareView";
import { Card } from "@/components/ui/Card";
import { AlertIcon } from "@/components/ui/icons";
import { fetchBuildings } from "@/lib/buildings";
import { isRealDate, todayInTexas } from "@/lib/validation";

export const metadata: Metadata = { title: "Compare apartments" };

type SearchParams = Promise<{ moveIn?: string | string[] }>;

export default async function ComparePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.moveIn) ? params.moveIn[0] : params.moveIn;
  const moveIn = raw && isRealDate(raw) ? raw : null;
  const data = await fetchBuildings();

  return (
    <main>
      <PageHeader eyebrow="Side by side" title="Compare apartments">
        Real cost, fees, deals and approval side by side. Your picks stay on this device.
      </PageHeader>
      <div className="page-container pt-8">
        {data.ok ? (
          <CompareView
            buildings={data.buildings}
            today={todayInTexas()}
            moveIn={moveIn}
          />
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
