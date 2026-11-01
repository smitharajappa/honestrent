// Checks your Supabase sign-in settings from the outside and says what to fix.
// Run: npm run check:auth                       (checks the live site address)
//      npm run check:auth -- https://my-site.vercel.app
// Reads the project address and public key from .env.local. Never prints the key. Sends no emails.

import { existsSync, readFileSync } from "node:fs";

const SITE = (process.argv[2] ?? "https://swelt.vercel.app").replace(/\/$/, "");

if (!existsSync(".env.local")) {
  console.log(
    "✗ No .env.local here. Run this from the Swelt folder, after npm run check:env passes.",
  );
  process.exit(1);
}
const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const url = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
if (!url || !key) {
  console.log(
    "✗ The Supabase address or key is missing in .env.local. Run npm run check:env.",
  );
  process.exit(1);
}

let problems = 0;
const bad = (msg) => {
  problems++;
  console.log(`✗ ${msg}`);
};
const ok = (msg) => console.log(`✓ ${msg}`);

const settings = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
  .then((r) => (r.ok ? r.json() : null))
  .catch(() => null);
if (!settings) {
  bad(
    "Couldn't read the sign-in settings. Check your internet connection and npm run check:env.",
  );
} else {
  if (settings.external?.email) ok("Email sign-in is on.");
  else
    bad(
      "Email sign-in is OFF. Supabase, Authentication, Providers, Email: switch it on.",
    );
  if (settings.disable_signup) {
    bad("New sign-ups are switched off in Supabase, so new people can't get a link.");
  } else {
    ok("New people are allowed to sign up.");
  }
  if (settings.external?.google) ok("Google sign-in is on.");
  else {
    console.log(
      "• Google sign-in is off. That's fine: the site hides the Google button until you switch it on.",
    );
  }
}

// Where does a sign-in link send people? A fake link makes Supabase say, without sending anything.
async function landsOn(target) {
  const res = await fetch(
    `${url}/auth/v1/verify?token=not-a-real-token&type=magiclink&redirect_to=${encodeURIComponent(target)}`,
    { headers: { apikey: key }, redirect: "manual" },
  ).catch(() => null);
  return res?.headers.get("location")?.split("#")[0] ?? null;
}
const wanted = `${SITE}/auth/callback`;
const landed = await landsOn(wanted);
if (landed === wanted) {
  ok(`Sign-in links can return to ${wanted}.`);
} else {
  bad(
    `Sign-in links to ${SITE} are sent to ${landed ?? "somewhere else"} instead. In Supabase, Authentication, URL Configuration:\n    1. Site URL: ${SITE}\n    2. Redirect URLs: add ${wanted}`,
  );
}

console.log(
  problems === 0
    ? "\nAll good. Request a fresh sign-in link on the site and open it on the same device."
    : "\nFix the items marked ✗, save in Supabase, then run this again.",
);
process.exit(problems === 0 ? 0 : 1);
