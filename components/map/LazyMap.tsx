"use client";

import dynamic from "next/dynamic";

// The map library is big and needs the browser, so it loads only when a map is shown.
export const LazyMap = dynamic(() => import("./BuildingMap"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="grid h-72 animate-pulse place-items-center rounded-2xl border border-border bg-surface-muted text-sm text-text-muted"
    >
      Loading map…
    </div>
  ),
});
