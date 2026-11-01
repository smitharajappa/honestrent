// Checks that the Supabase keys in .env.local are written correctly and really work.
// Run: npm run check:env
// It never prints your key. It says what is wrong in plain words.

import { existsSync, readFileSync } from "node:fs";

const FILE = ".env.local";
if (!existsSync(FILE)) {
  console.log(
    `✗ There is no ${FILE} file in this folder. Copy .env.example to ${FILE} and fill it in.`,
  );
  process.exit(1);
}

const env = {};
for (const line of readFileSync(FILE, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=(.*)$/);
  if (m && !line.trim().startsWith("#")) env[m[1]] = m[2];
}

let problems = 0;
const bad = (msg) => {
  problems++;
  console.log(`✗ ${msg}`);
};

const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

for (const [name, value] of [
  ["NEXT_PUBLIC_SUPABASE_URL", url],
  ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key],
]) {
  if (value === "") bad(`${name} is missing or empty.`);
  else if (/^\s|\s$/.test(value))
    bad(`${name} has a space at the start or end. Remove it.`);
  else if (/^["']|["']$/.test(value))
    bad(`${name} is wrapped in quote marks. Remove the quotes.`);
}

const cleanUrl = url.trim().replace(/^["']|["']$/g, "");
const cleanKey = key.trim().replace(/^["']|["']$/g, "");

if (cleanUrl && !/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(cleanUrl)) {
  bad("The URL should look like https://your-project.supabase.co (no extra path).");
}
if (cleanKey) {
  if (cleanKey.startsWith("sb_secret_") || cleanKey.length > 250) {
    bad(
      "That looks like a SECRET key. Use the PUBLISHABLE key (starts with sb_publishable_). Never put a secret key here.",
    );
  } else if (!cleanKey.startsWith("sb_publishable_") && !cleanKey.startsWith("eyJ")) {
    bad("The key should start with sb_publishable_ (or eyJ for the older anon key).");
  }
  console.log(
    `  key: ${cleanKey.length} characters, starts with "${cleanKey.slice(0, 15)}"`,
  );
}

if (problems === 0) {
  try {
    const res = await fetch(
      `${cleanUrl.replace(/\/$/, "")}/rest/v1/buildings?select=id&limit=1`,
      {
        headers: { apikey: cleanKey, Authorization: `Bearer ${cleanKey}` },
      },
    );
    if (res.ok) {
      console.log(
        "✓ The URL and key work. Supabase answered and the buildings table is readable.",
      );
    } else if (res.status === 401 || res.status === 403) {
      bad(
        `Supabase said "${res.status}": this key is not valid for this project. In Supabase open Project Settings, API Keys and copy the Publishable key again, from the SAME project as the URL.`,
      );
    } else if (res.status === 404) {
      bad(
        "Supabase answered 404: the buildings table doesn't exist yet. Run the migrations first.",
      );
    } else {
      bad(`Supabase answered ${res.status}.`);
    }
  } catch {
    bad("Couldn't reach Supabase. Check your internet connection and the URL.");
  }
}

if (problems > 0) {
  console.log(
    "\nAfter fixing, save the file and restart the app: press Ctrl+C, then run npm run dev.",
  );
  process.exit(1);
}
