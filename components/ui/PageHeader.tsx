import { cn } from "./cn";

/**
 * The band at the top of the inner pages (Roommates, Plus, Account, Sign in, ...): a small
 * label, one big heading and a line of context, on the same soft glow as the home page.
 */
export function PageHeader({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("hero-bg border-b border-border", className)}>
      <div className="page-container py-8 sm:py-12">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {children && (
          <p className="mt-3 max-w-2xl text-lg text-pretty text-text-muted">{children}</p>
        )}
      </div>
    </header>
  );
}
