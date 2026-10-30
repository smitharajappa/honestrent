import { ShieldIcon } from "./ui/icons";
import { Tip } from "./ui/Tip";

/** Neutral-ranking promise and scam-safety tips (trust is part of the product). */
export function TrustNotes() {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 text-sm">
      <p className="flex items-start gap-2">
        <ShieldIcon className="mt-0.5 size-4 shrink-0 text-success-text" />
        <span>
          <strong className="font-semibold">We never rank by who pays us.</strong>{" "}
          <span className="text-text-muted">Only real cost and approval fit.</span>
        </span>
      </p>
      <Tip summary="Scam-safety tips for newcomers">
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            Never pay a deposit or rent before you&apos;ve toured (in person or live
            video).
          </li>
          <li>
            Find the leasing office&apos;s phone number on the building&apos;s own
            website.
          </li>
          <li>Be careful with prices far below everything else nearby.</li>
          <li>
            Don&apos;t send passport or visa scans over WhatsApp or email to strangers.
          </li>
          <li>
            Pay through the building&apos;s official portal, never by gift card or wire.
          </li>
        </ul>
      </Tip>
    </div>
  );
}
