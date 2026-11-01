// Web addresses that carry the renter's search along (budget, move-in, and the area they
// chose), so "Back to results" returns to the same search.

export function searchHref(
  path: string,
  {
    budget,
    moveIn,
    area,
  }: { budget: number | string; moveIn: string; area?: string | null },
): string {
  const base = `${path}?budget=${budget}&moveIn=${moveIn}`;
  return area ? `${base}&area=${encodeURIComponent(area)}` : base;
}
