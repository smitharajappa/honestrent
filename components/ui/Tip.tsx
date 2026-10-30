import { InfoIcon } from "./icons";
import { cn } from "./cn";

type TipProps = { summary: string; children: React.ReactNode; className?: string };

/**
 * Help right where it's needed (Nielsen #10). Uses the browser's built-in
 * <details>, so it works with keyboards and screen readers without extra code.
 */
export function Tip({ summary, children, className }: TipProps) {
  return (
    <details className={cn("group relative z-10 text-sm", className)}>
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-lg font-medium text-info-text [&::-webkit-details-marker]:hidden">
        <InfoIcon className="size-4 shrink-0" />
        <span className="underline decoration-dotted underline-offset-4">{summary}</span>
      </summary>
      <div className="mt-1 space-y-2 rounded-xl bg-info-soft p-3.5 text-info-text">
        {children}
      </div>
    </details>
  );
}
