// A small per-visitor limiter, so one person can't use up our free allowance with
// map and traffic lookups. In memory: it resets when the server restarts, which is
// enough to stop casual abuse. Not a security boundary.

const hits = new Map<string, number[]>();

export function allow(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // Keep the map from growing forever.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return true;
}
