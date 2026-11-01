"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DFW_ZIPS } from "@/lib/dfw-zips";

export type LocationStatus = "idle" | "asking" | "on" | "denied" | "unavailable";
export type Coords = { latitude: number; longitude: number };

type Value = {
  status: LocationStatus;
  coords: Coords | null;
  /** Words for the place distances are measured from: "you" or "ZIP 75080". */
  label: string | null;
  request: () => void;
  /** Measure from a DFW ZIP code instead (for renters who haven't moved yet). */
  setZip: (zip: string) => "ok" | "invalid" | "unknown";
  clear: () => void;
};

const LocationContext = createContext<Value | null>(null);

/**
 * The place distances are measured from: the renter's device location (only after they
 * press "Use my location") or a ZIP code they type. Kept in memory in this tab: never
 * sent to our server, put in the URL or saved, and gone when the tab closes.
 * Distances are worked out on the device.
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [label, setLabel] = useState<string | null>(null);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLabel("you");
        setStatus("on");
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }, []);

  const setZip = useCallback((raw: string) => {
    const zip = raw.trim();
    if (!/^\d{5}$/.test(zip)) return "invalid" as const;
    const point = DFW_ZIPS[zip];
    if (!point) return "unknown" as const;
    setCoords({ latitude: point[0], longitude: point[1] });
    setLabel(`ZIP ${zip}`);
    setStatus("on");
    return "ok" as const;
  }, []);

  const clear = useCallback(() => {
    setCoords(null);
    setLabel(null);
    setStatus("idle");
  }, []);

  const value = useMemo(
    () => ({ status, coords, label, request, setZip, clear }),
    [status, coords, label, request, setZip, clear],
  );
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): Value {
  const value = useContext(LocationContext);
  if (!value) throw new Error("useLocation must be used inside LocationProvider");
  return value;
}
