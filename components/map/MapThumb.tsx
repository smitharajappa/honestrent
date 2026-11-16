"use client";

import { useEffect, useRef, useState } from "react";
import { MAP_STYLE_URL } from "@/lib/map";
import { cn } from "../ui/cn";

/*
 * A small picture of the building's own block, from the same OpenFreeMap tiles as our
 * maps. Real and honest, unlike a drawn cover, and nothing is copied from other sites.
 *
 * Browsers allow only a few live maps at once, so one hidden map draws every picture in
 * turn, each is saved as an image, and the map is thrown away when nothing has asked for a
 * picture for a while. Pictures are kept for the visit, so scrolling back doesn't redraw.
 */

const WIDTH = 480;
const HEIGHT = 240;
const ZOOM = 15.3;
const cache = new Map<string, string>();
let queue: Promise<unknown> = Promise.resolve();

function key(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
}

type Shared = { map: import("maplibre-gl").Map; host: HTMLDivElement };
let shared: Shared | null = null;
let closeTimer: ReturnType<typeof setTimeout> | undefined;

/** One hidden map, reused for every picture so the map style loads only once. */
async function sharedMap(): Promise<Shared> {
  if (shared) return shared;
  const maplibregl = await import("maplibre-gl");
  maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${WIDTH}px;height:${HEIGHT}px;`;
  document.body.appendChild(host);
  const map = new maplibregl.Map({
    container: host,
    style: MAP_STYLE_URL,
    center: [-96.75, 32.99],
    zoom: ZOOM,
    interactive: false,
    attributionControl: false,
    fadeDuration: 0,
    pixelRatio: Math.min(2, window.devicePixelRatio || 1),
    canvasContextAttributes: { preserveDrawingBuffer: true },
  });
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("map style timed out")), 20000);
      map.once("load", () => {
        clearTimeout(timer);
        resolve();
      });
    });
  } catch (error) {
    // Give up cleanly; the next picture asked for will try again from scratch.
    map.remove();
    host.remove();
    throw error;
  }
  shared = { map, host };
  return shared;
}

/** Throw the hidden map away once no picture has been asked for in a while. */
function closeLater() {
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    shared?.map.remove();
    shared?.host.remove();
    shared = null;
  }, 20000);
}

async function draw(latitude: number, longitude: number): Promise<string | null> {
  clearTimeout(closeTimer);
  try {
    const { map } = await sharedMap();
    map.jumpTo({ center: [longitude, latitude], zoom: ZOOM });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("map timed out")), 15000);
      map.once("idle", () => {
        clearTimeout(timer);
        resolve();
      });
    });
    return map.getCanvas().toDataURL("image/webp", 0.82);
  } catch {
    return null;
  } finally {
    closeLater();
  }
}

/** Draws one picture at a time, in the order cards ask for them. */
function picture(latitude: number, longitude: number): Promise<string | null> {
  const k = key(latitude, longitude);
  const hit = cache.get(k);
  if (hit) return Promise.resolve(hit);
  const job = queue.then(() => draw(latitude, longitude));
  queue = job.catch(() => null);
  return job.then((url) => {
    if (url) cache.set(k, url);
    return url;
  });
}

export function MapThumb({
  name,
  latitude,
  longitude,
  className,
}: {
  name: string;
  latitude: number | null;
  longitude: number | null;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const hasPlace = latitude != null && longitude != null;
  const [src, setSrc] = useState<string | null>(() =>
    hasPlace ? (cache.get(key(latitude, longitude)) ?? null) : null,
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasPlace || src || !box.current) return;
    let cancelled = false;
    // Only draw once the card is near the screen.
    const watcher = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        watcher.disconnect();
        picture(latitude, longitude).then((url) => {
          if (cancelled) return;
          if (url) setSrc(url);
          else setFailed(true);
        });
      },
      { rootMargin: "300px" },
    );
    watcher.observe(box.current);
    return () => {
      cancelled = true;
      watcher.disconnect();
    };
  }, [hasPlace, latitude, longitude, src]);

  return (
    <div
      ref={box}
      className={cn("relative h-full w-full overflow-hidden bg-surface-muted", className)}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- a picture drawn in the browser, not a file
        <img
          src={src}
          alt={`Map of the streets around ${name}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <p className="grid h-full place-items-center px-4 text-center text-xs text-text-muted">
          {!hasPlace
            ? "Location not mapped yet"
            : failed
              ? "Map unavailable right now"
              : "Loading map…"}
        </p>
      )}
      {hasPlace && (
        <>
          {/* The building sits at the centre of the picture. */}
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface bg-brand shadow-raised"
          />
          <span className="absolute right-1 bottom-1 rounded-sm bg-surface/90 px-1 text-[10px] text-text-muted">
            © OpenStreetMap
          </span>
        </>
      )}
    </div>
  );
}
