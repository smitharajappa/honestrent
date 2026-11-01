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
