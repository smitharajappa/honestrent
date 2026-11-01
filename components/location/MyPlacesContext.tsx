"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type MyPlace = {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
};

export const MAX_PLACES = 5;
const KEY = "swelt.places.v1";

type Value = {
  places: MyPlace[];
  ready: boolean;
  add: (p: Omit<MyPlace, "id">) => boolean;
  remove: (id: string) => void;
};

const Ctx = createContext<Value | null>(null);

function load(): MyPlace[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(
        (p) =>
          p &&
          typeof p.id === "string" &&
          typeof p.label === "string" &&
          typeof p.address === "string" &&
          Number.isFinite(p.latitude) &&
          Number.isFinite(p.longitude),
      )
      .slice(0, MAX_PLACES);
  } catch {
    return [];
  }
}

/**
 * Up to 5 places that matter to the renter (work, campus, a grocery chain, a place of
 * worship...). Saved in this browser only, until accounts exist. Never sent to our database.
 */
export function MyPlacesProvider({ children }: { children: React.ReactNode }) {
  const [places, setPlaces] = useState<MyPlace[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPlaces(load());
    setReady(true);
  }, []);

  const save = useCallback((next: MyPlace[]) => {
    setPlaces(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Private window or blocked storage: it still works until the tab closes.
    }
  }, []);

  const add = useCallback(
    (p: Omit<MyPlace, "id">) => {
      if (places.length >= MAX_PLACES) return false;
      save([...places, { ...p, id: crypto.randomUUID() }]);
      return true;
    },
    [places, save],
  );

  const remove = useCallback(
    (id: string) => save(places.filter((p) => p.id !== id)),
    [places, save],
  );

  const value = useMemo(
    () => ({ places, ready, add, remove }),
    [places, ready, add, remove],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMyPlaces(): Value {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMyPlaces must be used inside MyPlacesProvider");
  return v;
}
