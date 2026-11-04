import Link from "next/link";
import { Logo } from "./ui/Logo";
import { HeaderLinks } from "./shortlist/HeaderLinks";
import { ShieldIcon } from "./ui/icons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="Honest Rent, home"
          className="group/logo shrink-0 rounded-lg"
        >
          <Logo />
        </Link>
        <HeaderLinks />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="page-container grid gap-6 py-8 text-sm text-text-muted md:grid-cols-3">
        <p className="flex items-start gap-2">
          <ShieldIcon className="mt-0.5 size-4 shrink-0 text-success-text" />
          <span>
            <strong className="font-semibold text-text">
              We never rank by who pays us.
            </strong>{" "}
            Results are ordered only by real cost and how likely you are to be approved.
          </span>
        </p>
        <p>
          Prices are entered by hand and can change. Always confirm with the building
          before you apply.
        </p>
        <p>
          <Link
            href="/plus"
            className="font-semibold text-brand-text underline underline-offset-2"
          >
            Honest Rent Plus
          </Link>{" "}
          adds optional extras. Search and real cost are always free.{" "}
          <Link
            href="/roommates"
            className="font-semibold text-brand-text underline underline-offset-2"
          >
            Find a roommate
          </Link>{" "}
          <Link
            href="/privacy"
            className="font-semibold text-brand-text underline underline-offset-2"
          >
            Privacy
          </Link>
        </p>
        <p>
          Your approval answers stay in this browser tab. Saved and compared buildings
          stay on this device.
        </p>
      </div>
    </footer>
  );
}
