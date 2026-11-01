"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { MapPinIcon } from "../ui/icons";
import { useLocation } from "./LocationContext";

/**
 * Where to measure distances from: the renter's location (asked only when pressed) or a
 * ZIP code, for people who are still moving here. Says what it does with the answer.
 */
export function LocateButton({ compact = false }: { compact?: boolean }) {
  const { status, label, request, setZip, clear } = useLocation();
  const [zip, setZipText] = useState("");
  const [zipError, setZipError] = useState<string | null>(null);

  // Choosing a place to measure from also fills the Where-do-you-want-to-live box
  // ("Near me", "Near ZIP 75080"), so the search can be sent. Clearing it empties that box.
  useEffect(() => {
    const input = document.getElementById("area") as HTMLInputElement | null;
    if (!input) return;
    const text = input.value.trim();
    if (status === "on" && label && (text === "" || /^near /i.test(text))) {
      input.value = label === "you" ? "Near me" : `Near ${label}`;
    } else if (status !== "on" && /^near /i.test(text)) {
      input.value = "";
    }
  }, [status, label]);

  function applyZip() {
    const result = setZip(zip);
    setZipError(
      result === "invalid"
        ? "Enter a 5-digit ZIP code, like 75080."
        : result === "unknown"
          ? "We don't have that ZIP yet. Try a Dallas–Fort Worth ZIP, like 75080."
          : null,
    );
  }

  if (status === "on") {
    return (
      <p
        role="status"
        className="flex flex-wrap items-center gap-x-2 text-sm text-text-muted"
      >
        <span className="inline-flex items-center gap-1.5 font-semibold text-text">
          <MapPinIcon className="size-4" /> Measuring from {label}
        </span>
        Distances shown on each apartment.
        <button
          type="button"
          onClick={() => {
            clear();
            setZipText("");
            setZipError(null);
          }}
          className="min-h-11 font-semibold text-brand-text underline underline-offset-2"
        >
          Change or turn off
        </button>
      </p>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          type="button"
          variant="secondary"
          onClick={request}
          disabled={status === "asking"}
        >
          <MapPinIcon className="size-4" />
          {status === "asking" ? "Finding you…" : "Use my location"}
        </Button>
        <span className="text-text-muted">or</span>
        {/* Not a <form>: this sits inside the search form, and forms can't nest. */}
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`zip-from-${compact ? "c" : "f"}`}>
            Measure distances from a ZIP code
          </label>
          <input
            id={`zip-from-${compact ? "c" : "f"}`}
            value={zip}
            onChange={(e) => setZipText(e.target.value.replace(/\D/g, "").slice(0, 5))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // don't submit the search
                applyZip();
              }
            }}
            inputMode="numeric"
            autoComplete="off"
            placeholder="ZIP code"
            aria-invalid={zipError ? true : undefined}
            className="min-h-11 w-28 rounded-xl border border-border-strong bg-surface px-3 text-base tabular-nums"
          />
          <Button type="button" variant="secondary" onClick={applyZip}>
            Use ZIP
          </Button>
        </div>
      </div>
      {!compact && status !== "denied" && status !== "unavailable" && !zipError && (
        <p className="mt-1.5 text-xs text-text-muted">
          Not in Texas yet? Enter the ZIP where you will work or study. Distances are
          worked out in this tab. Nothing is sent or saved.
        </p>
      )}
      {zipError && (
        <p role="status" className="mt-1.5 text-text-muted">
          {zipError}
        </p>
      )}
      {status === "denied" && (
        <p role="status" className="mt-1.5 text-text-muted">
          Location is blocked for this site. Allow it in your browser settings, or use a
          ZIP code.
        </p>
      )}
      {status === "unavailable" && (
        <p role="status" className="mt-1.5 text-text-muted">
          We couldn&apos;t find your location. Enter a ZIP code instead.
        </p>
      )}
    </div>
  );
}
