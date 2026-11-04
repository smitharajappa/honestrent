import { Card } from "./ui/Card";

/** Grey placeholder cards shown while buildings load. */
export function ResultsSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="mt-10">
      <span className="sr-only">Finding apartments…</span>
      <div className="mb-4 h-6 w-48 shimmer rounded-md" />
      <ul className="space-y-4" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <Card as="li" key={i} className="p-5">
            <div className="flex justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-5 w-2/3 shimmer rounded-md" />
                <div className="h-4 w-1/2 shimmer rounded-md" />
              </div>
              <div className="h-8 w-20 shimmer rounded-md" />
            </div>
            <div className="mt-4 h-24 shimmer rounded-xl" />
          </Card>
        ))}
      </ul>
    </div>
  );
}
