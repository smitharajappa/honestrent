// Fetches real apartment complexes (name, address, map position) from OpenStreetMap
// through the free Overpass API, and saves them to a list for the team to review.
//
// Run on your own computer (not in the cloud session):
//   node scripts/fetch-complexes.mjs                 -> Richardson and Plano
//   node scripts/fetch-complexes.mjs Dallas "Fort Worth" Irving
//
// Data © OpenStreetMap contributors (ODbL). It has NO prices, fees or approval rules.
// Please run it rarely and politely: Overpass is a free community service.

import { writeFileSync } from "node:fs";

const cities = process.argv.slice(2);
if (cities.length === 0) cities.push("Richardson", "Plano");

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

function query(city) {
  // Apartment buildings and apartment-complex land, inside the city boundary in Texas.
  return `[out:json][timeout:90];
area["name"="${city}"]["boundary"="administrative"]["admin_level"~"^(7|8)$"]->.a;
(
  nwr["building"="apartments"]["name"](area.a);
  nwr["landuse"="residential"]["residential"="apartments"]["name"](area.a);
);
out center tags;`;
}

async function run(city) {
  let lastError;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "User-Agent": "SweltDataCheck/0.1 (contact: team@swelt.example)",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ data: query(city) }),
      });
      if (!res.ok) throw new Error(`${url} answered ${res.status}`);
      return (await res.json()).elements;
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`Could not fetch ${city}: ${lastError?.message}`);
}

const rows = new Map();
for (const city of cities) {
  console.log(`Fetching ${city}...`);
  for (const el of await run(city)) {
    const t = el.tags ?? {};
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!t.name || lat === undefined) continue;
    const street = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ");
    const key = `${t.name.toLowerCase()}|${lat.toFixed(3)}|${lon.toFixed(3)}`;
    if (rows.has(key)) continue;
    rows.set(key, {
      name: t.name,
      street,
      city: t["addr:city"] ?? city,
      postcode: t["addr:postcode"] ?? "",
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lon.toFixed(6)),
      website: t.website ?? t["contact:website"] ?? "",
      osm: `${el.type}/${el.id}`,
    });
  }
  // Be polite to the free service.
  await new Promise((r) => setTimeout(r, 5000));
}

const list = [...rows.values()].sort((a, b) =>
  a.city === b.city ? a.name.localeCompare(b.name) : a.city.localeCompare(b.city),
);
const file = "research/complexes-osm.json";
writeFileSync(file, JSON.stringify(list, null, 2) + "\n");
console.log(`Saved ${list.length} complexes to ${file}`);
