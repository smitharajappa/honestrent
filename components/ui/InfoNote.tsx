import { InfoIcon } from "./icons";
import { cn } from "./cn";

/** A short blue explanation box (blue = information, per DESIGN.md). */
export function InfoNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl bg-info-soft p-3 text-sm text-info-text",
        className,
      )}
    >
      <InfoIcon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
