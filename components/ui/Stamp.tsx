import { cn } from "./cn";

// Approval fit is a decision someone makes about you, so it looks like an ink stamp.
// One ink per meaning, always with words and an icon. "Pending" is not stamped yet:
// a dashed, straight outline, because nobody has decided anything.
export type StampTone = "good" | "maybe" | "no" | "pending";

const inks: Record<StampTone, string> = {
  good: "text-success-text",
  maybe: "text-warning-text",
  no: "text-unlikely-text",
  pending: "text-text-muted border-dashed [transform:none]",
};

export function Stamp({
  tone,
  icon,
  children,
  className,
}: {
  tone: StampTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("stamp", inks[tone], className)}>
      {icon}
      {children}
    </span>
  );
}
