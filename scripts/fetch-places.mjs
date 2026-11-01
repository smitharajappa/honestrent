// Fetches nearby places (grocery, gyms, places of worship, bus stops) from OpenStreetMap
// through the free Overpass API and saves them for review.
//
// Run on your own computer (not in the cloud session):
//   node scripts/fetch-places.mjs
// Then: node scripts/make-places-seed.mjs
//
// Data © OpenStreetMap contributors (ODbL). Please run it rarely: Overpass is a free service.

import { writeFileSync } from "node:fs";

// Richardson, Plano and north Dallas (south, west, north, east), cut into small tiles
// so each request is light enough for the free servers.
const SOUTH = 32.78,
  WEST = -96.92,
  NORTH = 33.12,
  EAST = -96.6;
const ROWS = 4,
  COLS = 4;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function tiles() {
  const out = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const s = SOUTH + ((NORTH - SOUTH) * r) / ROWS;
      const n = SOUTH + ((NORTH - SOUTH) * (r + 1)) / ROWS;
      const w = WEST + ((EAST - WEST) * c) / COLS;
      const e = WEST + ((EAST - WEST) * (c + 1)) / COLS;
      out.push([s, w, n, e].map((x) => x.toFixed(4)).join(","));
    }
  }
  return out;
}

const query = (bbox) => `[out:json][timeout:60];
(
  nwr["shop"~"^(supermarket|grocery)$"](${bbox});
  nwr["leisure"="fitness_centre"](${bbox});
  nwr["amenity"="place_of_worship"](${bbox});
  node["highway"="bus_stop"](${bbox});
);
out center tags;`;

function kindOf(t) {
  if (t.highway === "bus_stop") return "bus_stop";
  if (t.shop === "supermarket" || t.shop === "grocery") return "grocery";
  if (t.leisure === "fitness_centre") return "gym";
  if (t.amenity === "place_of_worship") return "worship";
  return null;
}

async function fetchTile(bbox) {
  // Try each server, then wait and try them all again (up to 4 rounds).
  for (let round = 1; round <= 4; round++) {
    for (const url of ENDPOINTS) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "User-Agent": "SweltDataCheck/0.1 (contact: team@swelt.example)",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ data: query(bbox) }),
          signal: AbortSignal.timeout(90_000),
        });
        if (!res.ok) throw new Error(`answered ${res.status}`);
        return (await res.json()).elements;
      } catch (err) {
        console.log(`    ${new URL(url).host}: ${err.message}`);
      }
    }
    console.log(`    all busy, waiting ${round * 20}s...`);
    await sleep(round * 20_000);
  }
  return null;
}

const byOsm = new Map();
const failed = [];
const all = tiles();
for (const [i, bbox] of all.entries()) {
  console.log(`Area ${i + 1} of ${all.length}...`);
  const elements = await fetchTile(bbox);
  if (!elements) {
    failed.push(bbox);
    continue;
  }
  for (const el of elements) {
    const t = el.tags ?? {};
    const kind = kindOf(t);
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!kind || lat === undefined) continue;
    const fallback = {
      bus_stop: "Bus stop",
      grocery: "Grocery store",
      gym: "Gym",
      worship: "Place of worship",
    };
    byOsm.set(`${el.type}/${el.id}`, {
      kind,
      name: t.name ?? fallback[kind],
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lon.toFixed(6)),
      osm: `${el.type}/${el.id}`,
    });
  }
  await sleep(3000); // be polite to the free service
}

const places = [...byOsm.values()];
if (failed.length > 0) {
  console.log(
    `WARNING: ${failed.length} area(s) failed, so the list is incomplete. Run the script again later.`,
  );
}
writeFileSync("research/places-osm.json", JSON.stringify(places, null, 1) + "\n");
const counts = places.reduce((c, p) => ({ ...c, [p.kind]: (c[p.kind] ?? 0) + 1 }), {});
console.log(`Saved ${places.length} places to research/places-osm.json`, counts);
