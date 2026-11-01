// Fetches nearby places (grocery, gyms, places of worship, bus stops) from OpenStreetMap
// through the free Overpass API and saves them for review.
//
// Run on your own computer (not in the cloud session):
//   node scripts/fetch-places.mjs
// Then: node scripts/make-places-seed.mjs
//
// Data © OpenStreetMap contributors (ODbL). Please run it rarely: Overpass is a free service.

import { writeFileSync } from "node:fs";

// Richardson, Plano and north Dallas (south, west, north, east).
const BBOX = "32.78,-96.92,33.12,-96.60";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const QUERY = `[out:json][timeout:180];
(
  nwr["shop"~"^(supermarket|grocery)$"](${BBOX});
  nwr["leisure"="fitness_centre"](${BBOX});
  nwr["amenity"="place_of_worship"](${BBOX});
  node["highway"="bus_stop"](${BBOX});
);
out center tags;`;

function kindOf(t) {
  if (t.highway === "bus_stop") return "bus_stop";
  if (t.shop === "supermarket" || t.shop === "grocery") return "grocery";
  if (t.leisure === "fitness_centre") return "gym";
  if (t.amenity === "place_of_worship") return "worship";
  return null;
}

let elements;
let lastError;
for (const url of ENDPOINTS) {
  try {
    console.log(`Asking ${url} ...`);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "SweltDataCheck/0.1 (contact: team@swelt.example)",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ data: QUERY }),
    });
    if (!res.ok) throw new Error(`answered ${res.status}`);
    elements = (await res.json()).elements;
    break;
  } catch (err) {
    lastError = err;
    console.log(`  failed: ${err.message}`);
  }
}
if (!elements) throw new Error(`All servers failed: ${lastError?.message}`);

const places = [];
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
  places.push({
    kind,
    name: t.name ?? fallback[kind],
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lon.toFixed(6)),
    osm: `${el.type}/${el.id}`,
  });
}

writeFileSync("research/places-osm.json", JSON.stringify(places, null, 1) + "\n");
const counts = places.reduce((c, p) => ({ ...c, [p.kind]: (c[p.kind] ?? 0) + 1 }), {});
console.log(`Saved ${places.length} places to research/places-osm.json`, counts);
