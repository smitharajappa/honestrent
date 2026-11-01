import { cn } from "./cn";

// Brand teal is for actions and selected states (see DESIGN.md). Badges use one color
// per meaning: green = savings or good, amber = costs added or caution, rose = unlikely,
// grey = unknown, accent = deals.
export type Tone =
  "neutral" | "success" | "warning" | "danger" | "info" | "unlikely" | "accent";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-text-muted",
  success: "bg-success-soft text-success-text",
  warning: "bg-warning-soft text-warning-text",
  danger: "bg-danger-soft text-danger-text",
  info: "bg-info-soft text-info-text",
  unlikely: "bg-unlikely-soft text-unlikely-text",
  accent: "bg-accent text-accent-fg",
};

type BadgeProps = {
  tone?: Tone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/** A small label. Always pairs color with words (and usually an icon). */
export function Badge({ tone = "neutral", icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
