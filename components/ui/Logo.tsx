import { useId } from "react";
import { cn } from "./cn";

/**
 * The Honest Rent mark: an "H" under a roof, with an amber bar like a line on a receipt.
 * Colors come from the logo tokens in globals.css, so it follows light and dark mode.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={cn("size-8 shrink-0", className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--logo-from)" }} />
          <stop offset="1" style={{ stopColor: "var(--logo-to)" }} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <path
        className="origin-center transition-transform duration-300 ease-out motion-safe:group-hover/logo:-translate-y-0.5"
        d="M13 29 32 14l19 15"
        fill="none"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 33v17M43 33v17" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path
        className="origin-center transition-transform duration-300 ease-out motion-safe:group-hover/logo:scale-x-110"
        d="M21 42h22"
        style={{ stroke: "var(--logo-accent)" }}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Mark plus the name. Wrap it in a link with the `group/logo` class for the hover motion. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-9" />
      <span className="font-heading text-lg font-extrabold tracking-tight whitespace-nowrap sm:text-xl">
        Honest <span className="text-brand-text">Rent</span>
      </span>
    </span>
  );
}
