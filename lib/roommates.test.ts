import { describe, expect, it } from "vitest";
import {
  checkAbout,
  checkMessage,
  rankMatches,
  scoreMatch,
  validateProfile,
  type DirectoryProfile,
  type Profile,
} from "./roommates";

const me: Profile = {
  nickname: "Asha",
  city: "Plano",
  budget_usd: 900,
  move_in: "2026-12-01",
  languages: ["English", "Hindi"],
  interests: ["Cooking", "Hiking", "Movies"],
  sleep: "night",
  cleanliness: "tidy",
  guests: "sometimes",
  smoking: "no",
  pets: "fine",
  study: "quiet",
  room_types: ["private", "shared"],
  gender: "prefer_not",
  gender_pref: "any",
  building_ids: [],
  about: "",
  visible: true,
};
const other = (o: Partial<DirectoryProfile> = {}): DirectoryProfile => ({
  id: "x",
  nickname: "Sam",
  city: "Plano",
  budget_usd: 900,
  move_in: "2026-12-01",
  languages: ["English", "Hindi"],
  interests: ["Cooking", "Hiking", "Movies"],
  sleep: "night",
  cleanliness: "tidy",
  guests: "sometimes",
  smoking: "no",
  pets: "fine",
  study: "quiet",
  room_types: ["private", "shared"],
  building_ids: [],
  about: "",
  verified: false,
  demo: false,
  ...o,
});

describe("scoreMatch", () => {
  it("gives a near-perfect score to near-identical habits, with plain reasons", () => {
    const m = scoreMatch(me, other());
    expect(m.score).toBeGreaterThanOrEqual(95);
    expect(m.reasons.length).toBe(3);
  });
  it("scores a poor fit lower", () => {
    const m = scoreMatch(
      me,
      other({
        budget_usd: 1500,
        move_in: "2027-03-01",
        sleep: "early",
        cleanliness: "relaxed",
        languages: ["Spanish"],
        interests: ["Gaming"],
        study: "social",
        guests: "often",
      }),
    );
    expect(m.score).toBeLessThan(40);
  });
  it("caps the score when smoking habits clash", () => {
    const m = scoreMatch(me, other({ smoking: "yes" }));
    expect(m.score).toBeLessThanOrEqual(40);
    expect(m.reasons).toContain("Different smoking habits");
  });
});

describe("rankMatches", () => {
  it("keeps the same city only, best first", () => {
    const list = rankMatches(me, [
      other({ id: "1", nickname: "Far", city: "Dallas" }),
      other({ id: "2", nickname: "Okay", budget_usd: 1100, sleep: "early" }),
      other({ id: "3", nickname: "Best" }),
    ]);
    expect(list.map((m) => m.profile.nickname)).toEqual(["Best", "Okay"]);
  });
});

describe("room type and shared communities", () => {
  const CAMDEN = "11111111-1111-4111-8111-111111111111";
  const names = new Map([[CAMDEN, "Camden Legacy Park"]]);
  it("leaves out people who want a different kind of room", () => {
    const privateOnly = { ...me, room_types: ["private" as const] };
    const list = rankMatches(privateOnly, [
      other({ id: "1", nickname: "Shares", room_types: ["shared"] }),
      other({ id: "2", nickname: "Either", room_types: ["private", "shared"] }),
    ]);
    expect(list.map((m) => m.profile.nickname)).toEqual(["Either"]);
  });
  it("says which community both are looking at and ranks it higher", () => {
    const mine = { ...me, building_ids: [CAMDEN], budget_usd: 1000 };
    const same = scoreMatch(
      mine,
      other({ budget_usd: 1300, building_ids: [CAMDEN] }),
      names,
    );
    const diff = scoreMatch(mine, other({ budget_usd: 1300 }), names);
    expect(same.sharedCommunities).toEqual([CAMDEN]);
    expect(same.reasons).toContain("Also looking at Camden Legacy Park");
    expect(same.score).toBeGreaterThan(diff.score);
    expect(diff.sharedCommunities).toEqual([]);
  });
  it("never goes over 100", () => {
    const mine = { ...me, building_ids: [CAMDEN] };
    expect(scoreMatch(mine, other({ building_ids: [CAMDEN] }), names).score).toBe(100);
  });
});

describe("text rules", () => {
  it("blocks contact details in 'about me'", () => {
    expect(checkAbout("call me 214 555 0199").ok).toBe(false);
    expect(checkAbout("find me @asha_here").ok).toBe(false);
    expect(checkAbout("I cook on Sundays and keep quiet hours.").ok).toBe(true);
  });
  it("rejects ruling people out by who they are", () => {
    expect(checkAbout("No Indians please").ok).toBe(false);
    expect(checkAbout("only women, no men").ok).toBe(false);
    expect(checkAbout("I'm vegetarian and prefer a calm home.").ok).toBe(true);
  });
  it("keeps chat about renting, and safe", () => {
    expect(checkMessage("What move-in date works for you?").ok).toBe(true);
    expect(checkMessage("Text me on +1 (214) 555-0199").ok).toBe(false);
    expect(checkMessage("pay the deposit by Zelle first").ok).toBe(false);
    expect(checkMessage("see www.listing-scam.com").ok).toBe(false);
    expect(checkMessage("what is your religion?").ok).toBe(false);
    expect(checkMessage("want to go on a date sometime").ok).toBe(false);
    expect(checkMessage("   ").ok).toBe(false);
    expect(checkMessage("x".repeat(501)).ok).toBe(false);
  });
});

describe("stronger chat checks", () => {
  it("catches look-alike tricks for payment apps and links", () => {
    for (const t of [
      "send it by z e l l e please",
      "use v3nmo",
      "pay with Z.E.L.L.E",
      "my site is example dot com",
      "email me at name at gmail",
      "text me on w h a t s a p p",
      "add me on Telegram",
      "find me on Instagram",
    ])
      expect(checkMessage(t).ok, t).toBe(false);
  });
  it("does not block ordinary talk about chatting or apps", () => {
    for (const t of [
      "Can we chat about the rent split?",
      "I use an app to track bills",
      "Does the building take cash for the deposit at the office?",
      "I'm free after 6 to tour",
    ])
      expect(checkMessage(t).ok, t).toBe(true);
  });
  it("blocks common rental scam wording", () => {
    for (const t of [
      "I'm currently abroad so send the deposit first",
      "You must pay first to hold it",
      "I can only take a cashier's check",
      "Please wire the deposit now",
    ])
      expect(checkMessage(t).ok, t).toBe(false);
  });
  it("stops the same message being sent again and again", () => {
    expect(
      checkMessage("What are your quiet hours?", ["what are  your quiet hours?"]).ok,
    ).toBe(false);
    expect(checkMessage("What are your quiet hours?", ["Hi!"]).ok).toBe(true);
  });
});

describe("validateProfile", () => {
  const good = {
    nickname: "Asha",
    city: "Plano",
    budget_usd: "900",
    move_in: "2026-12-01",
    languages: ["English"],
    interests: ["Cooking"],
    sleep: "night",
    cleanliness: "tidy",
    guests: "sometimes",
    smoking: "no",
    pets: "fine",
    study: "quiet",
    about: "Calm home.",
    room_types: ["private"],
  };
  it("accepts a good profile and keeps only known options", () => {
    const r = validateProfile(
      { ...good, languages: ["English", "Klingon"] },
      "2026-11-01",
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.languages).toEqual(["English"]);
  });
  it("lists what is wrong in plain words", () => {
    const r = validateProfile(
      {
        ...good,
        nickname: "x",
        budget_usd: "50",
        move_in: "2020-01-01",
        languages: [],
        sleep: "",
      },
      "2026-11-01",
    );
    expect(r.ok).toBe(false);
    if (!r.ok)
      expect(Object.keys(r.errors).sort()).toEqual([
        "budget_usd",
        "languages",
        "move_in",
        "nickname",
        "sleep",
      ]);
  });
  it("needs at least one room type, and only knows the two", () => {
    const none = validateProfile({ ...good, room_types: [] }, "2026-11-01");
    expect(none.ok).toBe(false);
    if (!none.ok) expect(none.errors.room_types).toBeTruthy();
    const r = validateProfile(
      { ...good, room_types: ["shared", "castle"] },
      "2026-11-01",
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.room_types).toEqual(["shared"]);
  });
  it("only allows 'my own gender' if you say what your gender is", () => {
    const bad = validateProfile({ ...good, gender_pref: "same" }, "2026-11-01");
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors.gender_pref).toContain("choose your gender");
    const refuse = validateProfile(
      { ...good, gender: "prefer_not", gender_pref: "same" },
      "2026-11-01",
    );
    expect(refuse.ok).toBe(false);
    const fine = validateProfile(
      { ...good, gender: "woman", gender_pref: "same" },
      "2026-11-01",
    );
    expect(fine.ok).toBe(true);
    const open = validateProfile(good, "2026-11-01");
    expect(open.ok && open.value.gender).toBe("prefer_not");
    expect(open.ok && open.value.gender_pref).toBe("any");
  });
  it("keeps up to 3 real building ids and drops the rest", () => {
    const id = (n: number) => `${String(n).repeat(8)}-1111-4111-8111-111111111111`;
    const r = validateProfile(
      { ...good, building_ids: [id(1), id(1), id(2), "not-an-id", id(3), id(4)] },
      "2026-11-01",
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.building_ids).toEqual([id(1), id(2), id(3)]);
  });
  it("has no field for race, ethnicity, religion or nationality", () => {
    const r = validateProfile(
      { ...good, ethnicity: "x", religion: "y", nationality: "z" },
      "2026-11-01",
    );
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(Object.keys(r.value)).not.toEqual(expect.arrayContaining(["ethnicity"]));
  });
});
