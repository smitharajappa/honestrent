// Roommate profiles and matching.
// Lifestyle only: habits, budget, move-in date, languages and interests. There is deliberately
// no field for race, ethnicity, religion, nationality, sex, family status or disability, and
// nothing here uses them. Free text ("about me") is checked for contact details and for
// language that rules people out by who they are.

import { DFW_SUGGESTIONS } from "./areas";

export const LANGUAGES = [
  "English",
  "Spanish",
  "Hindi",
  "Telugu",
  "Tamil",
  "Urdu",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Marathi",
  "Mandarin",
  "Cantonese",
  "Vietnamese",
  "Korean",
  "Japanese",
  "Arabic",
  "French",
  "Portuguese",
  "Tagalog",
] as const;

export const INTERESTS = [
  "Cooking",
  "Fitness",
  "Running",
  "Cricket",
  "Soccer",
  "Basketball",
  "Yoga",
  "Hiking",
  "Movies",
  "Music",
  "Gaming",
  "Board games",
  "Reading",
  "Travel",
  "Photography",
  "Art",
  "Volunteering",
  "Startups",
  "Coding",
  "Anime",
] as const;

export const CITIES = DFW_SUGGESTIONS;

export const SLEEP = {
  early: "Early riser",
  flexible: "Flexible",
  night: "Night owl",
} as const;
export const CLEAN = {
  relaxed: "Relaxed",
  tidy: "Tidy",
  very_tidy: "Very tidy",
} as const;
export const GUESTS = {
  rarely: "Rarely",
  sometimes: "Sometimes",
  often: "Often",
} as const;
export const SMOKING = {
  no: "No smoking",
  outside: "Outside only",
  yes: "Smoker",
} as const;
export const PETS = {
  none: "No pets",
  fine: "Fine with pets",
  have: "Has a pet",
} as const;
export const STUDY = {
  quiet: "Quiet at home",
  mixed: "Mixed",
  social: "Social at home",
} as const;

type Keys<T> = keyof T & string;
export type Profile = {
  nickname: string;
  city: string;
  budget_usd: number;
  move_in: string; // YYYY-MM-DD
  languages: string[];
  interests: string[];
  sleep: Keys<typeof SLEEP>;
  cleanliness: Keys<typeof CLEAN>;
  guests: Keys<typeof GUESTS>;
  smoking: Keys<typeof SMOKING>;
  pets: Keys<typeof PETS>;
  study: Keys<typeof STUDY>;
  about: string;
  visible: boolean;
};

/** A profile as other signed-in renters see it (no account id or email). */
export type DirectoryProfile = Omit<Profile, "visible"> & {
  id: string;
  verified: boolean;
  /** A sample profile made by the team for the demo. */
  demo: boolean;
};

// ---- text rules -------------------------------------------------------------------------

const URL_LIKE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|me|app)\b)/i;
const EMAIL_LIKE = /[^@\s]+@[^@\s]+\.[^@\s]+/;
const PHONE_LIKE = /(\+?\d[\s().-]*){9,}/;
const HANDLE_LIKE = /(^|\s)@[a-z0-9_.]{3,}/i;
const MONEY_APPS =
  /\b(zelle|venmo|cash ?app|paypal|western union|moneygram|wire transfer|gift ?card|bitcoin|crypto)\b/i;
// Phrases that rule people out by who they are, or ask for it. Not a full list: reporting
// and the team's review back it up.
const EXCLUDES_PEOPLE =
  /\b(no|not|only|never|avoid|without|except)\s+(blacks?|whites?|asians?|indians?|chinese|mexicans?|arabs?|muslims?|hindus?|christians?|jews?|jewish|gays?|lesbians?|trans|transgender|disabled|immigrants?|foreigners?|women|men|girls|guys|kids|children|families)\b/i;
const ASKS_PROTECTED =
  /\b(what('?s| is) your (race|religion|caste|ethnicity|nationality)|where are you (really )?from originally|are you (muslim|hindu|christian|jewish|gay|straight))\b/i;

export type TextCheck = { ok: true } | { ok: false; reason: string };

/** Checks "about me" text. Contact details are shared later, in an accepted chat. */
export function checkAbout(text: string): TextCheck {
  if (text.length > 280) return { ok: false, reason: "Keep it under 280 characters." };
  if (
    URL_LIKE.test(text) ||
    EMAIL_LIKE.test(text) ||
    PHONE_LIKE.test(text) ||
    HANDLE_LIKE.test(text)
  ) {
    return {
      ok: false,
      reason:
        "Leave out links, emails, phone numbers and social handles. You can share them later.",
    };
  }
  if (EXCLUDES_PEOPLE.test(text) || ASKS_PROTECTED.test(text)) {
    return {
      ok: false,
      reason:
        "Describe your own habits instead of who you do or don't want to live with. Honest Rent matches on lifestyle, languages and interests only.",
    };
  }
  return { ok: true };
}

const OFF_LIMITS =
  /\b(sex|sexy|nude|nudes|dating|hook ?up|girlfriend|boyfriend|date me|go on a date|ask you out|are you single|romantic|romance|flirt|kill|stupid|idiot|fuck|shit|bitch|asshole)\w*\b/i;

/** Checks one chat message. Chats are about renting a place together, nothing else. */
export function checkMessage(text: string): TextCheck {
  const t = text.trim();
  if (t.length < 1) return { ok: false, reason: "Write a message first." };
  if (t.length > 500)
    return { ok: false, reason: "Messages are 500 characters or fewer." };
  if (
    URL_LIKE.test(t) ||
    EMAIL_LIKE.test(t) ||
    PHONE_LIKE.test(t) ||
    HANDLE_LIKE.test(t) ||
    MONEY_APPS.test(t)
  ) {
    return {
      ok: false,
      reason:
        "For your safety, don't share links, contact details or payment details here. Never send money before you have seen the place and a written lease.",
    };
  }
  if (EXCLUDES_PEOPLE.test(t) || ASKS_PROTECTED.test(t)) {
    return {
      ok: false,
      reason: "Keep it to the apartment and your living habits, not who someone is.",
    };
  }
  if (OFF_LIMITS.test(t)) {
    return {
      ok: false,
      reason:
        "This chat is for renting a place together. Please keep it respectful and on topic.",
    };
  }
  return { ok: true };
}

/** Starter messages, so the first hello is about the apartment. */
export const CHAT_STARTERS = [
  "Hi! Are you still looking for a place?",
  "What move-in date works for you?",
  "How would we split rent and utilities?",
  "What are your quiet hours?",
  "Would you want to tour a place together?",
];

// ---- profile form -----------------------------------------------------------------------

export type ProfileErrors = Partial<Record<keyof Profile | "form", string>>;

function pick<T extends Record<string, string>>(map: T, value: unknown): Keys<T> | null {
  return typeof value === "string" && value in map ? (value as Keys<T>) : null;
}

export function validateProfile(
  raw: Record<string, unknown>,
  today: string,
): { ok: true; value: Profile } | { ok: false; errors: ProfileErrors } {
  const errors: ProfileErrors = {};
  const str = (k: string) =>
    typeof raw[k] === "string" ? (raw[k] as string).trim() : "";

  const nickname = str("nickname").replace(/\s+/g, " ");
  if (nickname.length < 2 || nickname.length > 24)
    errors.nickname = "Use 2 to 24 characters. A first name or nickname is fine.";
  else if (
    URL_LIKE.test(nickname) ||
    EMAIL_LIKE.test(nickname) ||
    /\d{4,}/.test(nickname)
  )
    errors.nickname = "Use a nickname, not contact details.";

  const city = str("city");
  if (!CITIES.includes(city)) errors.city = "Choose where you want to live.";

  const budget = Number(str("budget_usd"));
  if (!Number.isInteger(budget) || budget < 300 || budget > 5000)
    errors.budget_usd = "Enter your share of rent, between $300 and $5,000.";

  const moveIn = str("move_in");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(moveIn) || Number.isNaN(Date.parse(moveIn)))
    errors.move_in = "Choose a move-in date.";
  else if (moveIn < today) errors.move_in = "Choose a date from today on.";

  const list = (key: string, allowed: readonly string[], max: number) => {
    const values = Array.isArray(raw[key]) ? (raw[key] as unknown[]) : [];
    return [
      ...new Set(
        values.filter((v): v is string => typeof v === "string" && allowed.includes(v)),
      ),
    ].slice(0, max);
  };
  const languages = list("languages", LANGUAGES, 6);
  if (languages.length === 0)
    errors.languages = "Choose at least one language you speak.";
  const interests = list("interests", INTERESTS, 8);

  const sleep = pick(SLEEP, raw.sleep);
  const cleanliness = pick(CLEAN, raw.cleanliness);
  const guests = pick(GUESTS, raw.guests);
  const smoking = pick(SMOKING, raw.smoking);
  const pets = pick(PETS, raw.pets);
  const study = pick(STUDY, raw.study);
  if (!sleep) errors.sleep = "Choose one.";
  if (!cleanliness) errors.cleanliness = "Choose one.";
  if (!guests) errors.guests = "Choose one.";
  if (!smoking) errors.smoking = "Choose one.";
  if (!pets) errors.pets = "Choose one.";
  if (!study) errors.study = "Choose one.";

  const about = str("about");
  const aboutCheck = checkAbout(about);
  if (!aboutCheck.ok) errors.about = aboutCheck.reason;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      nickname,
      city,
      budget_usd: budget,
      move_in: moveIn,
      languages,
      interests,
      sleep: sleep!,
      cleanliness: cleanliness!,
      guests: guests!,
      smoking: smoking!,
      pets: pets!,
      study: study!,
      about,
      visible: raw.visible !== false && raw.visible !== "off",
    },
  };
}

// ---- matching ---------------------------------------------------------------------------

export type Match = { profile: DirectoryProfile; score: number; reasons: string[] };

const ORDER = {
  sleep: ["early", "flexible", "night"],
  cleanliness: ["relaxed", "tidy", "very_tidy"],
  guests: ["rarely", "sometimes", "often"],
  study: ["quiet", "mixed", "social"],
} as const;

const dist = (list: readonly string[], a: string, b: string) =>
  Math.abs(list.indexOf(a) - list.indexOf(b));
const days = (a: string, b: string) =>
  Math.abs(Math.round((Date.parse(a) - Date.parse(b)) / 86_400_000));
const joinWords = (xs: string[]) =>
  xs.length <= 2
    ? xs.join(" and ")
    : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

/**
 * How well two people's habits fit, 0 to 100, with plain reasons. Uses only the lifestyle
 * facts above. Different smoking habits cap the score, because that rarely works out.
 */
export function scoreMatch(me: Profile, other: DirectoryProfile): Match {
  let points = 0;
  const reasons: { text: string; weight: number }[] = [];
  const add = (p: number, text?: string) => {
    points += p;
    if (text && p > 0) reasons.push({ text, weight: p });
  };

  const gap = Math.abs(me.budget_usd - other.budget_usd);
  const pct = gap / Math.max(me.budget_usd, other.budget_usd);
  if (pct <= 0.1) add(20, `Budgets within $${Math.max(10, Math.round(gap / 10) * 10)}`);
  else if (pct <= 0.25) add(12, "Similar budgets");
  else if (pct <= 0.4) add(5);

  const d = days(me.move_in, other.move_in);
  if (d <= 14)
    add(
      15,
      d === 0
        ? "Same move-in date"
        : `Move-in dates ${d} ${d === 1 ? "day" : "days"} apart`,
    );
  else if (d <= 45) add(8, "Move-in dates close");

  const sleep = dist(ORDER.sleep, me.sleep, other.sleep);
  if (sleep === 0)
    add(
      10,
      `Both ${SLEEP[me.sleep].toLowerCase()}s`.replace("flexibles", "flexible sleepers"),
    );
  else if (sleep === 1) add(5);

  const clean = dist(ORDER.cleanliness, me.cleanliness, other.cleanliness);
  if (clean === 0) add(10, `Both ${CLEAN[me.cleanliness].toLowerCase()} about cleaning`);
  else if (clean === 1) add(5);

  const guests = dist(ORDER.guests, me.guests, other.guests);
  if (guests === 0) add(5, "Same view on guests");
  else if (guests === 1) add(2);

  const study = dist(ORDER.study, me.study, other.study);
  if (study === 0) add(5, "Similar at-home noise");
  else if (study === 1) add(2);

  if (me.pets === "none" && other.pets === "have") add(0);
  else if (me.pets === other.pets || me.pets === "fine" || other.pets === "fine")
    add(5, "Pets are not a problem");

  let smokingClash = false;
  if (me.smoking === other.smoking)
    add(10, me.smoking === "no" ? "Neither smokes" : "Same smoking habits");
  else if ([me.smoking, other.smoking].sort().join() === "no,outside") add(5);
  else {
    smokingClash = true;
  }

  const sharedLang = me.languages.filter((l) => other.languages.includes(l));
  if (sharedLang.length >= 2) add(10, `Both speak ${joinWords(sharedLang.slice(0, 3))}`);
  else if (sharedLang.length === 1) add(7, `Both speak ${sharedLang[0]}`);

  const sharedInt = me.interests.filter((i) => other.interests.includes(i));
  if (sharedInt.length >= 3)
    add(10, `Both like ${joinWords(sharedInt.slice(0, 3).map((x) => x.toLowerCase()))}`);
  else if (sharedInt.length === 2)
    add(7, `Both like ${joinWords(sharedInt.map((x) => x.toLowerCase()))}`);
  else if (sharedInt.length === 1) add(4, `Both like ${sharedInt[0].toLowerCase()}`);

  const MAX = 20 + 15 + 10 + 10 + 5 + 5 + 5 + 10 + 10 + 10; // 100
  let score = Math.round((points / MAX) * 100);
  if (smokingClash) score = Math.min(score, 40);

  reasons.sort((a, b) => b.weight - a.weight);
  const top = reasons.slice(0, 3).map((r) => r.text);
  if (smokingClash) top.push("Different smoking habits");
  return { profile: other, score, reasons: top };
}

/** Same city only, best first. */
export function rankMatches(
  me: Profile,
  others: DirectoryProfile[],
  limit = 20,
): Match[] {
  return others
    .filter((o) => o.city === me.city)
    .map((o) => scoreMatch(me, o))
    .sort(
      (a, b) => b.score - a.score || a.profile.nickname.localeCompare(b.profile.nickname),
    )
    .slice(0, limit);
}
