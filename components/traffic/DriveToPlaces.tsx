"use client";

import { useEffect, useRef, useState } from "react";
import { driveTimes, findAddress } from "@/app/actions/drive";
import { milesBetween, CAMPUS } from "@/lib/map";
import type { TrafficPoint } from "@/lib/traffic";
import type { Candidate } from "@/lib/geocode";
import { useAuth } from "../auth/AuthContext";
import { usePlusStatus } from "../auth/usePlusStatus";
import { Button, ButtonLink } from "../ui/Button";
import { MAX_PLACES, useMyPlaces } from "../location/MyPlacesContext";
import { TrafficChart } from "./TrafficChart";

type Drive = { source: "tomtom" | "sample"; points: TrafficPoint[] };
type Choice = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  address?: string;
};

const CAMPUS_CHOICE: Choice = {
  id: "campus",
  label: CAMPUS.name,
  latitude: CAMPUS.latitude,
  longitude: CAMPUS.longitude,
};

/**
 * Typical weekday drive time from this building to places the renter cares about:
 * UT Dallas, plus up to 5 places they add (work, a grocery chain, a place of worship...).
 * Places are saved on this device only. The chart for the chosen place loads on demand.
 */
export function DriveToPlaces({
  buildingId,
  from,
  initial,
}: {
  buildingId: string;
  from: { latitude: number; longitude: number };
  /** The UT Dallas answer, worked out on the server so the first view needs no wait. */
  initial: Drive | null;
}) {
  const { places, ready, add, remove } = useMyPlaces();
  const { accessToken } = useAuth();
  const { status: plus } = usePlusStatus();
  const [selected, setSelected] = useState<string>("campus");
  const [cache, setCache] = useState<Record<string, Drive | string>>(
    initial ? { campus: initial } : {},
  );
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Adding your own places needs an account and, outside the demo, a pass. Our server
  // checks this too; this is only so the page can say what to do.
  const gate: "sign-in" | "plus" | null = !accessToken
    ? "sign-in"
    : plus?.signedIn && !plus.hasPlus
      ? "plus"
      : null;

  const choices: Choice[] = [CAMPUS_CHOICE, ...places];
  const current = choices.find((c) => c.id === selected) ?? CAMPUS_CHOICE;
  const result = cache[current.id];

  // Load the chosen place's chart once, the first time it is picked.
  const asked = useRef(new Set<string>(initial ? ["campus"] : []));
  useEffect(() => {
    if (asked.current.has(current.id)) return;
    asked.current.add(current.id);
    setLoading(true);
    driveTimes(buildingId, current.latitude, current.longitude, accessToken)
      .then((r) =>
        setCache((c) => ({
          ...c,
          [current.id]: r.ok ? { source: r.source, points: r.points } : r.error,
        })),
      )
      .catch(() =>
        setCache((c) => ({
          ...c,
          [current.id]: "We couldn't get drive times just now. Please try again.",
        })),
      )
      .finally(() => setLoading(false));
  }, [buildingId, current.id, current.latitude, current.longitude, accessToken]);

  return (
    <div>
      <div
        role="group"
        aria-label="Drive to"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={c.id === current.id}
            onClick={() => setSelected(c.id)}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium ${
              c.id === current.id
                ? "border-brand bg-brand text-brand-fg"
                : "border-border-strong bg-surface text-text"
            }`}
          >
            {c.label}
            <span
              className={`ml-2 text-xs tabular-nums ${c.id === current.id ? "text-brand-fg/80" : "text-text-muted"}`}
            >
              {milesBetween(from, c).toFixed(1)} mi
            </span>
          </button>
        ))}
        {ready && places.length < MAX_PLACES && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-dashed border-border-strong px-3.5 text-sm font-semibold text-brand-text"
          >
            + Add a place
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-text-muted">
        Miles are in a straight line. The chart is the drive.
      </p>

      {adding && (
        <AddPlace
          gate={gate}
          accessToken={accessToken}
          onClose={() => setAdding(false)}
          onSave={(p) => {
            if (add(p)) setAdding(false);
          }}
        />
      )}

      <div className="mt-4" aria-live="polite">
        {loading && !result && (
          <p className="rounded-xl bg-surface-muted p-4 text-sm text-text-muted">
            Getting drive times to {current.label}…
          </p>
        )}
        {typeof result === "string" && (
          <p className="rounded-xl bg-surface-muted p-4 text-sm text-text-muted">
            {result}
          </p>
        )}
        {result && typeof result !== "string" && (
          <>
            <p className="mb-4 text-sm text-text-muted">
              {result.source === "tomtom"
                ? "Typical weekday drive time by the hour you leave. This is based on past traffic patterns, not live traffic."
                : "Sample estimate for the demo: a typical weekday rush-hour pattern, not real traffic data."}
            </p>
            <TrafficChart points={result.points} destination={current.label} />
            <p className="mt-3 text-xs text-text-muted">
              {result.source === "tomtom"
                ? "Traffic data © TomTom."
                : "Sample data. Real traffic appears once a traffic data key is added."}
            </p>
          </>
        )}
        {!result && !loading && (
          <p className="rounded-xl bg-surface-muted p-4 text-sm text-text-muted">
            Real drive times need our traffic data, which isn&apos;t switched on yet.
          </p>
        )}
      </div>

      {places.length > 0 && (
        <ul className="mt-4 divide-y divide-border text-sm">
          {places.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-1">
              <span className="min-w-0">
                <span className="font-medium">{p.label}</span>
                <span className="block truncate text-xs text-text-muted">
                  {p.address}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  remove(p.id);
                  if (selected === p.id) setSelected("campus");
                }}
                className="min-h-11 shrink-0 font-semibold text-brand-text underline underline-offset-2"
              >
                Remove<span className="sr-only"> {p.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-text-muted">
        Places you add are saved on this device only, not in your account or our database.
        We send an address once to OpenStreetMap&apos;s address search to find it, and the
        place once to our traffic provider to get drive times. Swelt does not keep either.
      </p>
    </div>
  );
}

/** Add a place: type an address, pick the right match, give it a name. */
function AddPlace({
  gate,
  accessToken,
  onClose,
  onSave,
}: {
  gate: "sign-in" | "plus" | null;
  accessToken: string | null;
  onClose: () => void;
  onSave: (p: {
    label: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
}) {
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pick, setPick] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [back, setBack] = useState("/");
  useEffect(() => setBack(window.location.pathname + window.location.search), []);

  if (gate) {
    return (
      <div className="mt-3 rounded-xl border border-border bg-surface-muted p-4 text-sm">
        <p className="font-semibold">
          {gate === "sign-in"
            ? "Sign in to add your own places"
            : "Adding your own places is part of Swelt Plus"}
        </p>
        <p className="mt-1 text-text-muted">
          {gate === "sign-in"
            ? "UT Dallas stays free for everyone. An account lets you add up to 5 places, like work or a grocery chain. Signing in is free and has no password."
            : "UT Dallas stays free. A pass adds drive times to up to 5 places you choose. One payment, no auto-renew."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <ButtonLink
            href={
              gate === "sign-in" ? `/sign-in?next=${encodeURIComponent(back)}` : "/plus"
            }
          >
            {gate === "sign-in" ? "Sign in" : "See Swelt Plus"}
          </ButtonLink>
          <Button type="button" variant="ghost" onClick={onClose}>
            Not now
          </Button>
        </div>
      </div>
    );
  }

  async function find() {
    setBusy(true);
    setError(null);
    const r = await findAddress(address, accessToken);
    setBusy(false);
    if (r.ok) {
      setCandidates(r.candidates);
      setPick(0);
    } else {
      setCandidates([]);
      setError(r.error);
    }
  }

  const chosen = candidates[pick];
  const name = label.trim() || "My place";

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface-muted p-4">
      <p className="text-sm font-semibold">Add a place</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr]">
        <label className="text-sm">
          <span className="font-medium">Name</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value.slice(0, 24))}
            placeholder="Work, Temple, Walmart…"
            className="mt-1 min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-base"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Address</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value.slice(0, 120))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void find();
              }
            }}
            placeholder="Street, city (or ZIP)"
            autoComplete="off"
            className="mt-1 min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-base"
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={find} disabled={busy}>
          {busy ? "Finding…" : "Find address"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
      {error && (
        <p role="status" className="mt-3 text-sm text-text-muted">
          {error}
        </p>
      )}
      {candidates.length > 0 && (
        <fieldset className="mt-3">
          <legend className="text-sm font-medium">Is this the right place?</legend>
          <div className="mt-1 space-y-1">
            {candidates.map((c, i) => (
              <label
                key={`${c.latitude},${c.longitude}`}
                className="flex min-h-11 items-start gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="candidate"
                  checked={i === pick}
                  onChange={() => setPick(i)}
                  className="mt-1"
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
          <Button
            type="button"
            className="mt-2"
            onClick={() =>
              onSave({
                label: name,
                address: chosen.name,
                latitude: chosen.latitude,
                longitude: chosen.longitude,
              })
            }
          >
            Save {name}
          </Button>
        </fieldset>
      )}
    </div>
  );
}
