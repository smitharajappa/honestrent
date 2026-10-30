"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Saved buildings and the compare list. Kept on this device only (browser
 * storage), never sent to Swelt. Building ids are not personal data.
 */

export const MAX_COMPARE = 3;
const STORAGE_KEY = "swelt.shortlist.v1";

type Stored = { saved: string[]; compare: string[] };

type ContextValue = {
  ready: boolean;
  saved: string[];
  compare: string[];
  isSaved: (id: string) => boolean;
  isComparing: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  /** Returns false when the compare list is already full. */
  toggleCompare: (id: string) => boolean;
  clearCompare: () => void;
};

const ShortlistContext = createContext<ContextValue | null>(null);

function load(): Stored {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { saved: [], compare: [] };
    const parsed = JSON.parse(raw) as Partial<Stored>;
    const ids = (v: unknown) =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    return {
      saved: ids(parsed.saved),
      compare: ids(parsed.compare).slice(0, MAX_COMPARE),
    };
  } catch {
    return { saved: [], compare: [] };
  }
}

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Stored>({ saved: [], compare: [] });
  const [ready, setReady] = useState(false);

  // Read storage after the first render so server and browser HTML match.
  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private mode or storage blocked: the shortlist simply isn't remembered.
    }
  }, [state, ready]);

  const toggleSaved = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
    }));
  }, []);

  const toggleCompare = useCallback(
    (id: string) => {
      if (!state.compare.includes(id) && state.compare.length >= MAX_COMPARE)
        return false;
      setState((s) => ({
        ...s,
        compare: s.compare.includes(id)
          ? s.compare.filter((x) => x !== id)
          : [...s.compare, id],
      }));
      return true;
    },
    [state.compare],
  );

  const value = useMemo<ContextValue>(
    () => ({
      ready,
      saved: state.saved,
      compare: state.compare,
      isSaved: (id) => state.saved.includes(id),
      isComparing: (id) => state.compare.includes(id),
      toggleSaved,
      toggleCompare,
      clearCompare: () => setState((s) => ({ ...s, compare: [] })),
    }),
    [ready, state, toggleSaved, toggleCompare],
  );

  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>;
}

export function useShortlist(): ContextValue {
  const value = useContext(ShortlistContext);
  if (!value) throw new Error("useShortlist must be used inside ShortlistProvider");
  return value;
}
