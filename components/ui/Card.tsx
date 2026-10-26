import { cn } from "./cn";

type CardProps = React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "li" | "article";
};

export function Card({ as: Tag = "div", className, ...rest }: CardProps) {
  return (
    <Tag
      className={cn("rounded-2xl border border-border bg-surface shadow-card", className)}
      {...rest}
    />
  );
}
