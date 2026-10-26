import Link from "next/link";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap " +
  "transition-[background-color,border-color,transform] duration-150 ease-out-soft " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-brand-fg shadow-card hover:bg-brand-hover",
  secondary:
    "border border-border-strong bg-surface text-text hover:border-brand hover:text-brand-text",
  ghost: "text-brand-text hover:bg-brand-soft",
};

// Every size is at least 44px tall so it's easy to tap (Apple HIG, WCAG 2.2).
const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

type StyleProps = { variant?: Variant; size?: Size; className?: string };

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = StyleProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    />
  );
}

type ButtonLinkProps = StyleProps & React.ComponentProps<typeof Link>;

export function ButtonLink({ variant, size, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...rest} />;
}
