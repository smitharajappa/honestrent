import { ChevronDownIcon } from "./icons";
import { cn } from "./cn";

type Option = { value: string; label: string };

type SelectProps = {
  id: string;
  label: string;
  options: readonly Option[];
  placeholder?: string;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id">;

/** Native dropdown (best on phones), styled to match Field. */
export function Select({
  id,
  label,
  options,
  placeholder = "Choose…",
  className,
  ...rest
}: SelectProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-text">
        {label}
      </label>
      <div className="relative mt-2">
        <select
          id={id}
          className={cn(
            "block min-h-12 w-full appearance-none rounded-xl border border-border-strong bg-surface py-2 pr-10 pl-3.5 text-base text-text",
            "transition-colors duration-150 hover:border-text-muted",
            "focus:border-brand focus:ring-4 focus:ring-brand/15 focus:outline-none",
          )}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-text-muted" />
      </div>
    </div>
  );
}
