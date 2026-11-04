import { describe, expect, it } from "vitest";
import { displayName, initialOf, photoUrl } from "./profile";

describe("displayName", () => {
  it("prefers the Google name", () => {
    expect(
      displayName({ email: "a@b.com", user_metadata: { full_name: " Priya Rao " } }),
    ).toBe("Priya Rao");
    expect(displayName({ email: "a@b.com", user_metadata: { name: "Li" } })).toBe("Li");
  });
  it("falls back to the email before the @", () => {
    expect(displayName({ email: "smitha179@gmail.com" })).toBe("smitha179");
  });
  it("never returns an empty name", () => {
    expect(displayName({})).toBe("Your profile");
    expect(displayName({ email: "", user_metadata: null })).toBe("Your profile");
    expect(displayName({ user_metadata: { full_name: 42 } })).toBe("Your profile");
  });
});

describe("initialOf", () => {
  it("is one capital letter", () => {
    expect(initialOf({ email: "smitha@x.com" })).toBe("S");
    expect(initialOf({ user_metadata: { full_name: "élan Moreau" } })).toBe("É");
  });
  it("skips leading symbols and handles emoji or empty names", () => {
    expect(initialOf({ user_metadata: { full_name: "  ~ana" } })).toBe("A");
    expect(initialOf({ user_metadata: { full_name: "😀" } })).toBe("?");
    expect(initialOf({})).toBe("Y");
  });
});

describe("photoUrl", () => {
  it("accepts https photos from avatar_url or picture", () => {
    expect(
      photoUrl({
        user_metadata: { avatar_url: "https://lh3.googleusercontent.com/a/x" },
      }),
    ).toBe("https://lh3.googleusercontent.com/a/x");
    expect(photoUrl({ user_metadata: { picture: "https://example.com/p.png" } })).toBe(
      "https://example.com/p.png",
    );
  });
  it("rejects everything else", () => {
    expect(photoUrl({})).toBeNull();
    expect(
      photoUrl({ user_metadata: { avatar_url: "http://example.com/p.png" } }),
    ).toBeNull();
    expect(photoUrl({ user_metadata: { avatar_url: "javascript:alert(1)" } })).toBeNull();
    expect(photoUrl({ user_metadata: { avatar_url: "not a url" } })).toBeNull();
  });
});
