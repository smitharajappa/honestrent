"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { CAMPUS, MAP_STYLE_URL, type MapPin } from "@/lib/map";

// Next.js can't bundle MapLibre's background worker, so we serve it from /public/maplibre
// (copied there by "npm install"; see package.json).
maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

type Props = {
  pins: MapPin[];
  /** Pin drawn larger and in front (the building you are looking at). */
  highlightId?: string;
  showCampus?: boolean;
  /** Text for people who can't see the map. */
  summary: string;
  className?: string;
};

function pinElement(pin: MapPin, highlighted: boolean): HTMLElement {
  const el = document.createElement(pin.href ? "a" : "div");
  el.className = `map-pin${highlighted ? " map-pin-main" : ""}`;
  if (pin.href) (el as HTMLAnchorElement).href = pin.href;
  el.setAttribute("aria-label", pin.label ? `${pin.name}, ${pin.label}` : pin.name);
  el.textContent = pin.label ?? "";
  if (!pin.label) el.classList.add("map-pin-dot");
  if (pin.unverified) el.classList.add("map-pin-unverified");
  if (pin.place) {
    el.classList.add("map-pin-place");
    el.title = pin.name;
  }
  return el;
}

/**
 * Interactive map of one or more buildings. Loaded only in the browser
 * (see LazyMap). Pins are real links, so they work with keyboard and screen readers.
 */
export default function BuildingMap({
  pins,
  highlightId,
  showCampus = true,
  summary,
  className,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = container.current;
    if (!node || pins.length === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: node,
        style: MAP_STYLE_URL,
        center: [pins[0].longitude, pins[0].latitude],
        zoom: 12,
        // Two-finger pan and ctrl+scroll, so the map never traps page scrolling.
        cooperativeGestures: true,
        attributionControl: { compact: true },
      });
    } catch {
      // Usually a browser without WebGL.
      setFailed(true);
      return;
    }
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    let loaded = false;
    map.on("load", () => {
      loaded = true;
    });
    map.on("error", () => {
      // If the map never started (for example the tile server is unreachable),
      // show the text fallback instead of an empty box.
      if (!loaded) setFailed(true);
    });

    const bounds = new maplibregl.LngLatBounds();
    for (const pin of pins) {
      new maplibregl.Marker({ element: pinElement(pin, pin.id === highlightId) })
        .setLngLat([pin.longitude, pin.latitude])
        .addTo(map);
      if (!pin.place) bounds.extend([pin.longitude, pin.latitude]);
    }
    if (showCampus) {
      const el = document.createElement("div");
      el.className = "map-pin map-pin-campus";
      el.textContent = CAMPUS.name;
      new maplibregl.Marker({ element: el })
        .setLngLat([CAMPUS.longitude, CAMPUS.latitude])
        .addTo(map);
      bounds.extend([CAMPUS.longitude, CAMPUS.latitude]);
    }
    map.fitBounds(bounds, { padding: 56, maxZoom: 14, animate: !reduceMotion });

    return () => map.remove();
  }, [pins, highlightId, showCampus]);

  if (pins.length === 0) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-surface-muted ${className ?? "h-72"}`}
    >
      {failed ? (
        <p className="grid h-full place-items-center p-6 text-center text-sm text-text-muted">
          The map can&apos;t load on this device. {summary}
        </p>
      ) : (
        <div
          ref={container}
          role="img"
          aria-label={`Map. ${summary}`}
          className="h-full w-full"
        />
      )}
    </div>
  );
}
