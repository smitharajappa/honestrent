import Link from "next/link";
import { HomeIcon, InfoIcon } from "./ui/icons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg font-bold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-brand-fg">
            <HomeIcon className="size-4.5" />
          </span>
          Swelt
        </Link>
        <span className="text-sm text-text-muted">Richardson · Plano</span>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <p className="mx-auto max-w-2xl px-4 py-6 text-xs text-text-muted">
        Prices are entered by hand and can change. Always confirm with the building before
        you apply.
      </p>
    </footer>
  );
}

/** Shown while building data is made up (see lib/site.ts). */
export function DemoBanner() {
  return (
    <div role="note" className="bg-warning-soft text-warning-text">
      <p className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-2 text-sm">
        <InfoIcon className="size-4 shrink-0" />
        <span>
          <strong className="font-semibold">Demo:</strong> buildings and prices are sample
          data for testing.
        </span>
      </p>
    </div>
  );
}
