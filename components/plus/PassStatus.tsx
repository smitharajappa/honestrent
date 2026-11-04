import Link from "next/link";
import type { CurrentPass } from "@/lib/plus";
import { formatDate } from "@/lib/format";
import { Badge } from "../ui/Badge";
import { CheckIcon } from "../ui/icons";

/**
 * What pass someone has, in one consistent place: the Plus page, the Account page and the
 * profile menu all say it the same way.
 */
export function PassStatus({
  pass,
  demoOpen,
  className,
}: {
  pass: CurrentPass | null;
  /** The site is in demo mode, so Plus features are open to signed-in renters. */
  demoOpen: boolean;
  className?: string;
}) {
  if (pass) {
    return (
      <div className={className}>
        <Badge tone="success" icon={<CheckIcon className="size-3.5" />}>
          {pass.name} pass
        </Badge>
        <p className="mt-1 text-sm tabular-nums text-text-muted">
          Until {formatDate(pass.endsAt.slice(0, 10))} ·{" "}
          {pass.daysLeft === 1 ? "1 day" : `${pass.daysLeft} days`} left
        </p>
      </div>
    );
  }
  return (
    <div className={className}>
      <Badge>{demoOpen ? "Free during the demo" : "No pass"}</Badge>
      <p className="mt-1 text-sm text-text-muted">
        {demoOpen ? "Everything in Plus is open while we test. " : ""}
        <Link
          href="/plus"
          className="font-semibold text-brand-text underline underline-offset-2"
        >
          See passes
        </Link>
      </p>
    </div>
  );
}
