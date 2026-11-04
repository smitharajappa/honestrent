"use client";

import { useState } from "react";
import {
  saveRoommateProfile,
  type CommunityOption,
  type MyProfile,
} from "@/app/actions/roommates";
import {
  CITIES,
  CLEAN,
  GENDER_PREFS,
  GENDERS,
  GUESTS,
  INTERESTS,
  MAX_COMMUNITIES,
  LANGUAGES,
  PETS,
  ROOM_TYPES,
  SLEEP,
  SMOKING,
  STUDY,
  type ProfileErrors,
} from "@/lib/roommates";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type Draft = {
  nickname: string;
  city: string;
  budget_usd: string;
  move_in: string;
  languages: string[];
  interests: string[];
  sleep: string;
  cleanliness: string;
  guests: string;
  smoking: string;
  pets: string;
  study: string;
  room_types: string[];
  gender: string;
  gender_pref: string;
  building_ids: string[];
  about: string;
  visible: boolean;
};

const EMPTY: Draft = {
  nickname: "",
  city: "",
  budget_usd: "",
  move_in: "",
  languages: [],
  interests: [],
  sleep: "",
  cleanliness: "",
  guests: "",
  smoking: "",
  pets: "",
  study: "",
  room_types: ["private"],
  gender: "prefer_not",
  gender_pref: "any",
  building_ids: [],
  about: "",
  visible: true,
};

function toDraft(p: MyProfile | null): Draft {
  return p ? { ...p, budget_usd: String(p.budget_usd) } : EMPTY;
}

const inputClass =
  "mt-1 min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-base";

function Chips({
  options,
  value,
  onChange,
  max,
}: {
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  max: number;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            disabled={!on && value.length >= max}
            onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            className={`min-h-11 rounded-full border px-3.5 text-sm font-medium disabled:opacity-40 ${
              on
                ? "border-brand bg-brand text-brand-fg"
                : "border-border-strong bg-surface text-text"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Choice({
  legend,
  options,
  value,
  onChange,
  error,
}: {
  legend: string;
  options: Record<string, string>;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {Object.entries(options).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={value === key}
            onClick={() => onChange(key)}
            className={`min-h-11 rounded-xl border px-3.5 text-sm font-medium ${
              value === key
                ? "border-brand bg-brand text-brand-fg"
                : "border-border-strong bg-surface text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-danger-text">{error}</p>}
    </fieldset>
  );
}

/** Pick up to 3 apartment communities you are looking at, from the city you chose. */
function CommunityPicker({
  options,
  city,
  value,
  onChange,
}: {
  options: CommunityOption[];
  city: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const chosen = value
    .map((id) => options.find((o) => o.id === id))
    .filter((o): o is CommunityOption => Boolean(o));
  const shown = options
    .filter((o) => !value.includes(o.id))
    .filter((o) => (city ? o.city === city : true))
    .filter((o) => (q ? o.name.toLowerCase().includes(q) : true))
    .slice(0, 8);
  const full = value.length >= MAX_COMMUNITIES;
  return (
    <div>
      <p className="text-sm font-medium">
        Apartment communities you&apos;re looking at (up to {MAX_COMMUNITIES}, optional)
      </p>
      <p className="mt-1 text-xs text-text-muted">
        Matches who pick the same community rank higher, so you can tour and apply
        together. Only shown to people in your city.
      </p>
      {chosen.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {chosen.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-label={`Remove ${o.name}`}
              onClick={() => onChange(value.filter((x) => x !== o.id))}
              className="min-h-11 rounded-full border border-brand bg-brand px-3.5 text-sm font-medium text-brand-fg"
            >
              {o.name} ×
            </button>
          ))}
        </div>
      )}
      {!full && (
        <>
          <label className="sr-only" htmlFor="community-search">
            Search apartment communities
          </label>
          <input
            id="community-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={city ? `Search in ${city}` : "Search by name"}
            autoComplete="off"
            className={inputClass}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {shown.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange([...value, o.id]);
                  setQuery("");
                }}
                className="min-h-11 rounded-full border border-border-strong bg-surface px-3.5 text-sm font-medium text-text"
              >
                {o.name}
              </button>
            ))}
            {shown.length === 0 && (
              <p className="text-sm text-text-muted">No communities match.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Create or change your roommate profile: habits, languages and interests. Nothing else. */
export function ProfileForm({
  existing,
  token,
  communities,
  onSaved,
}: {
  existing: MyProfile | null;
  token: string | null;
  communities: CommunityOption[];
  onSaved: () => void;
}) {
  const [d, setD] = useState<Draft>(toDraft(existing));
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setD((x) => ({ ...x, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const r = await saveRoommateProfile(token, d);
    setSaving(false);
    if (r.ok) onSaved();
    else setErrors(r.errors);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Card className="space-y-4 p-5">
        <h2 className="text-lg font-bold">The basics</h2>
        <label className="block text-sm font-medium">
          Nickname
          <input
            value={d.nickname}
            onChange={(e) => set("nickname", e.target.value)}
            maxLength={24}
            autoComplete="off"
            className={inputClass}
          />
          <span className="mt-1 block text-xs font-normal text-text-muted">
            A first name or nickname. Others see only this.
          </span>
          {errors.nickname && (
            <span className="block text-danger-text">{errors.nickname}</span>
          )}
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium">
            Where
            <select
              value={d.city}
              onChange={(e) => set("city", e.target.value)}
              className={inputClass}
            >
              <option value="">Choose a city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.city && (
              <span className="block font-normal text-danger-text">{errors.city}</span>
            )}
          </label>
          <label className="block text-sm font-medium">
            Your share of rent ($/month)
            <input
              value={d.budget_usd}
              onChange={(e) => set("budget_usd", e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className={inputClass}
            />
            {errors.budget_usd && (
              <span className="block font-normal text-danger-text">
                {errors.budget_usd}
              </span>
            )}
          </label>
          <label className="block text-sm font-medium">
            Move-in date
            <input
              type="date"
              value={d.move_in}
              onChange={(e) => set("move_in", e.target.value)}
              className={inputClass}
            />
            {errors.move_in && (
              <span className="block font-normal text-danger-text">{errors.move_in}</span>
            )}
          </label>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-lg font-bold">What you&apos;re looking for</h2>
        <div>
          <p className="text-sm font-medium">
            Kind of room you&apos;d take (pick one or both)
          </p>
          <Chips
            options={Object.values(ROOM_TYPES)}
            value={d.room_types.map((k) => ROOM_TYPES[k as keyof typeof ROOM_TYPES])}
            onChange={(labels) =>
              set(
                "room_types",
                (Object.keys(ROOM_TYPES) as (keyof typeof ROOM_TYPES)[]).filter((k) =>
                  labels.includes(ROOM_TYPES[k]),
                ),
              )
            }
            max={2}
          />
          {errors.room_types && (
            <p className="mt-1 text-sm text-danger-text">{errors.room_types}</p>
          )}
        </div>
        <CommunityPicker
          options={communities}
          city={d.city}
          value={d.building_ids}
          onChange={(v) => set("building_ids", v)}
        />
        <Choice
          legend="I am"
          options={GENDERS}
          value={d.gender}
          onChange={(v) => set("gender", v)}
        />
        <Choice
          legend="I'd share with"
          options={GENDER_PREFS}
          value={d.gender_pref}
          onChange={(v) => set("gender_pref", v)}
          error={errors.gender_pref}
        />
        <p className="text-xs text-text-muted">
          This only decides who can be matched with you, for sharing a home or a room.
          Other renters never see your gender.
        </p>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-lg font-bold">Languages and interests</h2>
        <div>
          <p className="text-sm font-medium">Languages you speak (up to 6)</p>
          <Chips
            options={LANGUAGES}
            value={d.languages}
            onChange={(v) => set("languages", v)}
            max={6}
          />
          {errors.languages && (
            <p className="mt-1 text-sm text-danger-text">{errors.languages}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">Interests (up to 8, optional)</p>
          <Chips
            options={INTERESTS}
            value={d.interests}
            onChange={(v) => set("interests", v)}
            max={8}
          />
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-lg font-bold">Living habits</h2>
        <Choice
          legend="Sleep"
          options={SLEEP}
          value={d.sleep}
          onChange={(v) => set("sleep", v)}
          error={errors.sleep}
        />
        <Choice
          legend="Cleaning"
          options={CLEAN}
          value={d.cleanliness}
          onChange={(v) => set("cleanliness", v)}
          error={errors.cleanliness}
        />
        <Choice
          legend="Guests"
          options={GUESTS}
          value={d.guests}
          onChange={(v) => set("guests", v)}
          error={errors.guests}
        />
        <Choice
          legend="Smoking"
          options={SMOKING}
          value={d.smoking}
          onChange={(v) => set("smoking", v)}
          error={errors.smoking}
        />
        <Choice
          legend="Pets"
          options={PETS}
          value={d.pets}
          onChange={(v) => set("pets", v)}
          error={errors.pets}
        />
        <Choice
          legend="At home"
          options={STUDY}
          value={d.study}
          onChange={(v) => set("study", v)}
          error={errors.study}
        />
      </Card>

      <Card className="space-y-3 p-5">
        <h2 className="text-lg font-bold">About you (optional)</h2>
        <label className="block text-sm font-medium">
          In your own words
          <textarea
            value={d.about}
            onChange={(e) => set("about", e.target.value)}
            maxLength={280}
            rows={3}
            className={`${inputClass} py-2`}
          />
          <span className="mt-1 block text-xs font-normal text-text-muted">
            {d.about.length}/280. Say how you like to live. No links, emails, phone
            numbers or handles: you can share contact details after an introduction is
            accepted.
          </span>
          {errors.about && (
            <span className="block font-normal text-danger-text">{errors.about}</span>
          )}
        </label>
        <label className="flex min-h-11 items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={d.visible}
            onChange={(e) => set("visible", e.target.checked)}
            className="mt-1 size-4"
          />
          <span>
            Show me to other signed-in renters in my city. You can switch this off any
            time.
          </span>
        </label>
      </Card>

      <p className="text-sm text-text-muted">
        We match on room type, habits, budget, move-in date, languages, interests and the
        communities you pick. The only personal detail we use is the gender preference
        above, and only to decide who can share with you. We don&apos;t ask about, store
        or filter by race, ethnicity, religion, nationality, family status or disability.
      </p>
      {errors.form && (
        <p role="alert" className="text-sm text-danger-text">
          {errors.form}
        </p>
      )}
      <Button type="submit" size="lg" disabled={saving}>
        {saving ? "Saving…" : existing ? "Save changes" : "Create my profile"}
      </Button>
    </form>
  );
}
