import { AlertIcon } from "./icons";
import { cn } from "./cn";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  prefix?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "prefix">;

/**
 * Labelled text input with optional hint and error.
 * Text is 16px so phones don't zoom in when the field is tapped.
 */
export function Field({
  id,
  label,
  hint,
  error,
  prefix,
  className,
  ...inputProps
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-text">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="mt-0.5 text-sm text-text-muted">
          {hint}
        </p>
      )}
      <div className="relative mt-2">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-base text-text-muted">
            {prefix}
          </span>
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "block min-h-12 w-full appearance-none rounded-xl border bg-surface px-3.5 text-base text-text tabular-nums",
            "placeholder:text-text-muted/70 transition-colors duration-150",
            "focus:border-brand focus:ring-4 focus:ring-brand/15 focus:outline-none",
            error ? "border-danger-text" : "border-border-strong hover:border-text-muted",
            prefix && "pl-8",
          )}
          {...inputProps}
        />
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-1.5 flex items-start gap-1.5 text-sm text-danger-text"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
