import type { Metadata } from "next";
import { ShareBillForm } from "@/components/ShareBillForm";
import { Card } from "@/components/ui/Card";
import { AlertIcon } from "@/components/ui/icons";
import { recentMonths } from "@/lib/billReport";
import { fetchBuildings } from "@/lib/buildings";
import { isUuid } from "@/lib/lead";
import { todayInTexas } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Share your monthly charges",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ building?: string | string[] }>;

export default async function ShareBillPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.building) ? params.building[0] : params.building;
  const data = await fetchBuildings();
  const today = todayInTexas();
  const months = recentMonths(today).map((value) => ({
    value,
    label: new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "long",
      year: "numeric",
    }),
  }));

  return (
    <main className="page-container pt-10">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Share your monthly charges
        </h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Water, sewer and trash billed by apartments change every month. Sharing one
          month of yours, anonymously, helps the next renter know what to expect.
        </p>
        <Card className="mt-8 p-5 sm:p-8">
          {data.ok ? (
            <ShareBillForm
              buildings={data.buildings
                .map((b) => ({ id: b.id, name: b.name }))
                .sort((a, b) => a.name.localeCompare(b.name))}
              months={months}
              defaultBuildingId={raw && isUuid(raw) ? raw : undefined}
            />
          ) : (
            <p role="alert" className="flex items-start gap-2 text-sm">
              <AlertIcon className="mt-0.5 size-4 shrink-0 text-warning-text" />
              This form is temporarily unavailable. Please try again soon.
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}
