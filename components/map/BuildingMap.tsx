"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { CAMPUS, MAP_STYLE_URL, type MapPin } from "@/lib/map";
import { PLACE_KINDS, type Place, type PlaceKind } from "@/lib/places";

// Next.js can't bundle MapLibre's background worker, so we serve it from /public/maplibre
// (a copy of maplibre-gl/dist/maplibre-gl-worker.mjs, committed so it never depends on the build; "npm install" refreshes it).
maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

type Props = {
  pins: MapPin[];
  /** Pin drawn larger and in front (the building you are looking at). */
  highlightId?: string;
  showCampus?: boolean;
  /** Nearby places drawn as clustered dots. */
  places?: Place[];
  /** Which kinds of places are switched on. */
  visibleKinds?: PlaceKind[];
  /** Text for people who can't see the map. */
  summary: string;
  className?: string;
};

function pinElement(pin: MapPin, highlighted: boolean): HTMLElement {
  const el = document.createElement(pin.href ? "a" : "div");
  el.className = `map-pin${highlighted ? " map-pin-main" : ""}`;
  if (pin.href) (el as HTMLAnchorElement).href = pin.href;
  const FIT_WORDS = {
    good: "good fit",
    guarantor: "possible with guarantor",
    unlikely: "unlikely",
    unknown: "approval rules not confirmed",
  } as const;
  const fitText = pin.fit ? `, ${FIT_WORDS[pin.fit]}` : "";
  el.setAttribute(
    "aria-label",
    (pin.label ? `${pin.name}, ${pin.label}` : pin.name) + fitText,
  );
  if (pin.fit) el.classList.add(`map-pin-fit-${pin.fit}`);
  el.textContent = pin.label ?? "";
  if (!pin.label) el.classList.add("map-pin-dot");
  if (pin.unverified) el.classList.add("map-pin-unverified");
  return el;
}

function cssColor(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function placeCollection(
  places: Place[],
  visible: PlaceKind[],
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: places
      .filter((p) => visible.includes(p.kind))
      .map((p) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
        properties: { id: p.id, name: p.name, kind: p.kind },
      })),
  };
}

/**
 * Interactive map of one or more buildings, with optional clustered nearby places.
 * Loaded only in the browser (see LazyMap). Building pins are real links, so they
 * work with keyboard and screen readers.
 */
export default function BuildingMap({
  pins,
  highlightId,
  showCampus = true,
  places = [],
  visibleKinds = [],
  summary,
  className,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [failed, setFailed] = useState(false);
  // Latest values for the map's own event handlers.
  const placesRef = useRef({ places, visibleKinds });
  placesRef.current = { places, visibleKinds };

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
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    let loaded = false;
    map.on("load", () => {
      loaded = true;
      const colors = PLACE_KINDS.flatMap(({ kind, color }) => [
        kind,
        cssColor(color, "#5b6b7a"),
      ]);
      const { places: p, visibleKinds: v } = placesRef.current;
      map.addSource("places", {
        type: "geojson",
        data: placeCollection(p, v),
        cluster: true,
        clusterMaxZoom: 15,
        clusterRadius: 42,
      });
      map.addLayer({
        id: "place-clusters",
        type: "circle",
        source: "places",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": cssColor("--text", "#1a1d21"),
          "circle-radius": ["step", ["get", "point_count"], 14, 10, 18, 50, 24],
          "circle-stroke-width": 2,
          "circle-stroke-color": cssColor("--surface", "#ffffff"),
        },
      });
      map.addLayer({
        id: "place-cluster-count",
        type: "symbol",
        source: "places",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 12,
        },
        paint: { "text-color": cssColor("--surface", "#ffffff") },
      });
      map.addLayer({
        id: "place-points",
        type: "circle",
        source: "places",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "match",
            ["get", "kind"],
            ...colors,
            "#5b6b7a",
          ] as unknown as maplibregl.ExpressionSpecification,
          "circle-radius": 7,
          "circle-stroke-width": 2,
          "circle-stroke-color": cssColor("--surface", "#ffffff"),
        },
      });

      // Click a cluster: zoom in. Click a dot: show its name and kind.
      map.on("click", "place-clusters", async (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const source = map.getSource("places") as maplibregl.GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(feature.properties.cluster_id);
        map.easeTo({
          center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
          zoom,
          duration: reduceMotion ? 0 : 400,
        });
      });
      map.on("click", "place-points", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const kind = PLACE_KINDS.find((k) => k.kind === feature.properties.kind);
        const box = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = String(feature.properties.name);
        const type = document.createElement("div");
        type.textContent = kind?.label ?? "";
        box.append(name, type);
        new maplibregl.Popup({ offset: 10, closeButton: false })
          .setLngLat((feature.geometry as GeoJSON.Point).coordinates as [number, number])
          .setDOMContent(box)
          .addTo(map);
      });
      for (const layer of ["place-clusters", "place-points"]) {
        map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
      }
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
      bounds.extend([pin.longitude, pin.latitude]);
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

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, [pins, highlightId, showCampus]);

  // Switching tabs only swaps the dots; the map itself is not rebuilt.
  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource("places") as maplibregl.GeoJSONSource | undefined;
    source?.setData(placeCollection(places, visibleKinds));
  }, [places, visibleKinds]);

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
