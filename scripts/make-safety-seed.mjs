// Counts reported incidents near each Dallas building from the City of Dallas open
// police data (Police Incidents, license ODC-BY) and writes supabase/seed-safety.sql.
//
// Run: node scripts/make-safety-seed.mjs        (needs internet; safe to re-run)
//
// We keep COUNTS only: against people, property, other. We never read or keep victim,
// suspect, race, sex or any other personal field. Richardson and Plano publish no open
// bulk data, so they get no row (the page links to the police department's own map).

import { readFileSync, writeFileSync } from "node:fs";

const DATASET = "https://www.dallasopendata.com/resource/qv6i-rri7.json";
const RADIUS_MILES = 0.5;
// Parking lots and streets: a smaller circle for vehicle incidents.
const VEHICLE_RADIUS_MILES = 0.25;
const VEHICLE_METERS = Math.round(VEHICLE_RADIUS_MILES * 1609.344);
const BREAK_IN = [
  "THEFT FROM MOTOR VEHICLE",
  "THEFT OF MOTOR VEHICLE PARTS OR ACCESSORIES",
];
const VEHICLE_THEFT = ["UUMV"]; // unauthorized use of a motor vehicle
const METERS = Math.round(RADIUS_MILES * 1609.344);
// City of Dallas land area, square miles (approximate), to size the baseline circle.
const CITY_SQ_MILES = 340;
const SOURCE_URL =
  "https://www.dallasopendata.com/Public-Safety/Police-Incidents/qv6i-rri7";

// Dallas buildings in our seed files: name, latitude, longitude.
const buildings = [];
for (const file of ["seed-live.sql", "seed-osm.sql"]) {
  const sql = readFileSync(`supabase/${file}`, "utf8");
  for (const m of sql.matchAll(
    /\('([^']+)',\s*'[^']*',\s*'Dallas',\s*'[^']*',\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)/g,
  )) {
    buildings.push({
      name: m[1].replaceAll("''", "'"),
      lat: Number(m[2]),
      lng: Number(m[3]),
    });
  }
}
if (buildings.length === 0)
  throw new Error("No Dallas buildings found in the seed files.");

async function query(params) {
  const url = new URL(DATASET);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { "User-Agent": "HonestRentDataCheck/0.1" } });
  if (!res.ok) throw new Error(`Dallas open data answered ${res.status}`);
  return res.json();
}

// The latest day in the data, then the 12 months before it.
const [{ max_date1 }] = await query({ $select: "max(date1)" });
const end = new Date(max_date1.slice(0, 10) + "T00:00:00Z");
const start = new Date(end);
start.setUTCFullYear(start.getUTCFullYear() - 1);
start.setUTCDate(start.getUTCDate() + 1);
const iso = (d) => d.toISOString().slice(0, 10);

function bucket(rows) {
  const out = { people: 0, property: 0, other: 0 };
  for (const r of rows) {
    const n = Number(r.n);
    const kind = (r.nibrs_crimeagainst ?? "").toUpperCase();
    if (kind === "PERSON") out.people += n;
    else if (kind === "PROPERTY") out.property += n;
    else out.other += n;
  }
  return out;
}

const where = `date1>='${iso(start)}' AND date1<='${iso(end)} 23:59:59'`;
const city = bucket(
  await query({
    $select: "nibrs_crimeagainst, count(*) as n",
    $where: where,
    $group: "nibrs_crimeagainst",
  }),
);
const circleSqMiles = Math.PI * RADIUS_MILES ** 2;
const cityAverage = ((city.people + city.property) * circleSqMiles) / CITY_SQ_MILES;
console.log(
  `Dallas, ${iso(start)} to ${iso(end)}: ${city.people + city.property} people+property incidents; average per ${RADIUS_MILES}-mile circle: ${cityAverage.toFixed(1)}`,
);

const rows = [];
for (const b of buildings) {
  const counts = bucket(
    await query({
      $select: "nibrs_crimeagainst, count(*) as n",
      $where: `${where} AND within_circle(geocoded_column, ${b.lat}, ${b.lng}, ${METERS})`,
      $group: "nibrs_crimeagainst",
    }),
  );
  const vehicle = await query({
    $select: "nibrs_crime, count(*) as n",
    $where: `${where} AND within_circle(geocoded_column, ${b.lat}, ${b.lng}, ${VEHICLE_METERS}) AND nibrs_crime in (${[...BREAK_IN, ...VEHICLE_THEFT].map((x) => `'${x}'`).join(",")})`,
    $group: "nibrs_crime",
  });
  const sum = (labels) =>
    vehicle
      .filter((r) => labels.includes(r.nibrs_crime))
      .reduce((t, r) => t + Number(r.n), 0);
  const breakIns = sum(BREAK_IN);
  const vehicleThefts = sum(VEHICLE_THEFT);
  console.log(
    `${b.name}: people ${counts.people}, property ${counts.property}, other ${counts.other}; vehicle break-ins ${breakIns}, vehicle thefts ${vehicleThefts}`,
  );
  const q = (s) => `'${String(s).replaceAll("'", "''")}'`;
  rows.push(
    `insert into public.building_safety
  (building_id, period_start, period_end, radius_miles, against_people, property, other,
   vehicle_radius_miles, vehicle_break_ins, vehicle_thefts,
   city_average_people_property, city_name, source_name, source_url, license, checked_on)
select id, '${iso(start)}', '${iso(end)}', ${RADIUS_MILES}, ${counts.people}, ${counts.property}, ${counts.other},
  ${VEHICLE_RADIUS_MILES}, ${breakIns}, ${vehicleThefts},
  ${cityAverage.toFixed(1)}, 'Dallas', 'City of Dallas Police Incidents (open data)', ${q(SOURCE_URL)},
  'Open Data Commons Attribution License (ODC-BY)', '${iso(new Date())}'
from public.buildings where name = ${q(b.name)} and city = 'Dallas'
on conflict (building_id) do update set
  period_start = excluded.period_start, period_end = excluded.period_end,
  against_people = excluded.against_people, property = excluded.property, other = excluded.other,
  vehicle_radius_miles = excluded.vehicle_radius_miles, vehicle_break_ins = excluded.vehicle_break_ins,
  vehicle_thefts = excluded.vehicle_thefts,
  city_average_people_property = excluded.city_average_people_property, checked_on = excluded.checked_on;`,
  );
}

writeFileSync(
  "supabase/seed-safety.sql",
  `-- Reported-incident counts near Dallas buildings (City of Dallas open data, ODC-BY).
-- Counts only. Safe to re-run. Generated by scripts/make-safety-seed.mjs. Do not edit by hand.
-- Run AFTER seed-live.sql (it looks buildings up by name).

${rows.join("\n\n")}
`,
);
console.log(`Wrote ${rows.length} building(s) to supabase/seed-safety.sql`);
