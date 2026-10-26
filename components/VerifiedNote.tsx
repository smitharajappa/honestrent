import { STALE_AFTER_DAYS } from "@/lib/cost";
import { formatDate } from "@/lib/format";
import { daysBetween } from "@/lib/validation";
import { Badge } from "./ui/Badge";
import { AlertIcon, ClockIcon } from "./ui/icons";

/** "Last verified" date, with a warning when the data is getting old. */
export function VerifiedNote({
  lastVerified,
  today,
}: {
  lastVerified: string;
  today: string;
}) {
  if (daysBetween(lastVerified, today) > STALE_AFTER_DAYS) {
    return (
      <Badge tone="warning" icon={<AlertIcon className="size-3.5" />}>
        Verified {formatDate(lastVerified)}: price may have changed
      </Badge>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-xs text-text-muted">
      <ClockIcon className="size-3.5" />
      Last verified {formatDate(lastVerified)}
    </p>
  );
}
