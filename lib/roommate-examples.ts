// Three made-up people that show how a match percentage works. They are scored with the same
// function as real matches, against one made-up renter, and labelled "Example" in the app.
import {
  scoreMatch,
  type CommunityNames,
  type DirectoryProfile,
  type Match,
  type Profile,
} from "./roommates";

export const EXAMPLE_COMMUNITY_ID = "00000000-0000-4000-8000-000000000001";
export const EXAMPLE_COMMUNITY_NAMES: CommunityNames = new Map([
  [EXAMPLE_COMMUNITY_ID, "Camden Legacy Park"],
]);

export const EXAMPLE_ME: Profile = {
  nickname: "You",
  city: "Plano",
  budget_usd: 900,
  move_in: "2026-12-01",
  languages: ["English", "Hindi", "Telugu"],
  interests: ["Cooking", "Hiking", "Movies"],
  sleep: "night",
  cleanliness: "very_tidy",
  guests: "rarely",
  smoking: "no",
  pets: "none",
  study: "quiet",
  room_types: ["private", "shared"],
  gender: "prefer_not",
  gender_pref: "any",
  building_ids: [EXAMPLE_COMMUNITY_ID],
  about: "",
  visible: true,
};

const base: DirectoryProfile = {
  id: "example",
  nickname: "",
  city: "Plano",
  budget_usd: 900,
  move_in: "2026-12-01",
  languages: [],
  interests: [],
  sleep: "night",
  cleanliness: "very_tidy",
  guests: "rarely",
  smoking: "no",
  pets: "none",
  study: "quiet",
  room_types: ["private", "shared"],
  building_ids: [],
  about: "",
  verified: false,
  demo: true,
};

export const EXAMPLE_PEOPLE: DirectoryProfile[] = [
  {
    ...base,
    id: "example-high",
    nickname: "Priya",
    budget_usd: 1050,
    move_in: "2026-12-20",
    languages: ["English", "Hindi", "Telugu"],
    interests: ["Cooking", "Hiking", "Movies"],
    sleep: "flexible",
    cleanliness: "tidy",
    building_ids: [EXAMPLE_COMMUNITY_ID],
    about: "Grad student. Calm home, shared groceries.",
  },
  {
    ...base,
    id: "example-mid",
    nickname: "Luis",
    budget_usd: 1200,
    move_in: "2027-01-10",
    languages: ["English", "Spanish"],
    interests: ["Soccer", "Movies"],
    sleep: "early",
    cleanliness: "relaxed",
    guests: "sometimes",
    study: "mixed",
    about: "Works days, friends over on weekends.",
  },
  {
    ...base,
    id: "example-none",
    nickname: "Chen",
    budget_usd: 1800,
    move_in: "2027-04-15",
    languages: ["Mandarin"],
    interests: ["Gaming", "Anime"],
    sleep: "early",
    cleanliness: "relaxed",
    guests: "often",
    smoking: "yes",
    pets: "have",
    study: "social",
    room_types: ["private"],
    about: "Likes a lively place.",
  },
];

export function exampleMatches(): Match[] {
  return EXAMPLE_PEOPLE.map((p) => scoreMatch(EXAMPLE_ME, p, EXAMPLE_COMMUNITY_NAMES));
}
