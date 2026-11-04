"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  answerIntro,
  askIntro,
  loadRoommates,
  removeRoommateProfile,
  type Intro,
  type RoommateState,
} from "@/app/actions/roommates";
import { formatDate, formatUsd } from "@/lib/format";
import {
  EXAMPLE_COMMUNITY_NAMES as EXAMPLE_NAMES,
  exampleMatches,
} from "@/lib/roommate-examples";
import {
  CLEAN,
  GUESTS,
  PETS,
  ROOM_TYPES,
  SLEEP,
  SMOKING,
  STUDY,
  type Match,
} from "@/lib/roommates";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "../ui/Badge";
import { Button, ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import { CheckIcon } from "../ui/icons";
import { Chat } from "./Chat";
import { ProfileForm } from "./ProfileForm";

type Tab = "matches" | "intros" | "profile";

function VerifiedBadge() {
  return (
    <Badge tone="success" icon={<CheckIcon className="size-3.5" />}>
      Verified
    </Badge>
  );
}

function MatchCard({
  m,
  intro,
  canAsk,
  onAsk,
  busy,
  message,
  names,
  example,
}: {
  m: Match;
  intro: Intro | undefined;
  canAsk: boolean;
  onAsk: () => void;
  busy: boolean;
  message?: string;
  names: ReadonlyMap<string, string>;
  /** Shown only to explain how a percentage works: no button, labelled "Sample". */
  example?: boolean;
}) {
  const p = m.profile;
  const habits = [
    SLEEP[p.sleep],
    CLEAN[p.cleanliness],
    `Guests: ${GUESTS[p.guests].toLowerCase()}`,
    SMOKING[p.smoking],
    PETS[p.pets],
    STUDY[p.study],
  ];
  return (
    <Card as="li" className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold">{p.nickname}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {p.verified && <VerifiedBadge />}
            {example ? <Badge>Sample</Badge> : p.demo && <Badge>Sample profile</Badge>}
            <Badge>{p.city}</Badge>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-extrabold tabular-nums">{m.score}%</p>
          <p className="text-xs text-text-muted">match</p>
        </div>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted"
        aria-hidden="true"
      >
        <div className="h-full rounded-full bg-brand" style={{ width: `${m.score}%` }} />
      </div>
      {m.reasons.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {m.reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-success-text" />
              {r}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-sm tabular-nums text-text-muted">
        {formatUsd(p.budget_usd)}/mo · moving in {formatDate(p.move_in)}
      </p>
      <p className="mt-1 text-xs text-text-muted">
        {p.room_types.map((k) => ROOM_TYPES[k]).join(" or ")}
      </p>
      <p className="mt-1 text-xs text-text-muted">{habits.join(" · ")}</p>
      {p.building_ids.length > 0 && (
        <p className="mt-1 text-xs text-text-muted">
          Looking at:{" "}
          {p.building_ids
            .map((id) => names.get(id))
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
      {(p.languages.length > 0 || p.interests.length > 0) && (
        <p className="mt-1 text-xs text-text-muted">
          {[...p.languages, ...p.interests].join(" · ")}
        </p>
      )}
      {p.about && <p className="mt-3 text-sm">{p.about}</p>}
      <div className="mt-4">
        {example ? (
          <p className="text-sm text-text-muted">
            {m.score >= 80
              ? "A strong match: very close habits, and the same community."
              : m.score >= 40
                ? "A partial match: some habits fit, others don't."
                : "No match: almost nothing lines up."}
          </p>
        ) : intro ? (
          <Badge tone={intro.status === "accepted" ? "success" : "neutral"}>
            {intro.status === "accepted"
              ? "Matched: open the chat"
              : intro.i_asked
                ? "Waiting for their answer"
                : "They asked you: see Introductions"}
          </Badge>
        ) : canAsk ? (
          <Button type="button" onClick={onAsk} disabled={busy}>
            {busy ? "Asking…" : "Request an introduction"}
          </Button>
        ) : (
          <ButtonLink href="/plus" variant="secondary">
            Introductions come with a Tour, Apply or Move-in pass
          </ButtonLink>
        )}
        {message && (
          <p role="status" className="mt-2 text-sm text-text-muted">
            {message}
          </p>
        )}
      </div>
    </Card>
  );
}

/** Roommates: create a profile, see people in your city whose habits fit, and chat once matched. */
export function RoommatesPanel() {
  const { accessToken, user, ready, available } = useAuth();
  const [state, setState] = useState<RoommateState | null>(null);
  const [tab, setTab] = useState<Tab>("matches");
  const [editing, setEditing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openChat, setOpenChat] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!accessToken) return;
    setState(await loadRoommates(accessToken));
  }, [accessToken]);
  useEffect(() => {
    if (ready && accessToken) void reload();
  }, [ready, accessToken, reload]);

  if (!ready) return <p className="text-text-muted">One moment…</p>;

  if (!available || !user) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-bold">Sign in to find a roommate</h2>
        <p className="mt-1 text-text-muted">
          You need a free account so people know you are real and so we can keep chats
          safe. No password: we email you a link. Your approval answers are never tied to
          it.
        </p>
        {available && (
          <ButtonLink href="/sign-in?next=/roommates" className="mt-4">
            Sign in
          </ButtonLink>
        )}
      </Card>
    );
  }
  if (!state) return <p className="text-text-muted">Loading your roommate page…</p>;
  if (state.status !== "ok") {
    return (
      <p className="text-text-muted">
        We couldn&apos;t load this just now. Please try again in a minute.
      </p>
    );
  }

  if (!state.profile || editing) {
    return (
      <div>
        {!state.profile && (
          <p className="mb-5 text-text-muted">
            Create a short profile. People in your city whose habits fit will see you, and
            you&apos;ll see them. You choose who to talk to.
          </p>
        )}
        <ProfileForm
          existing={state.profile}
          token={accessToken}
          communities={state.communities}
          onSaved={() => {
            setEditing(false);
            void reload();
          }}
        />
        {editing && (
          <Button
            type="button"
            variant="ghost"
            className="mt-3"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        )}
      </div>
    );
  }

  const { profile, matches, intros, hasAccess, cityCount, communities } = state;
  const names = new Map(communities.map((c) => [c.id, c.name]));
  const introFor = (id: string) => intros.find((i) => i.other_id === id);
  const incoming = intros.filter((i) => i.status === "pending" && !i.i_asked);
  const accepted = intros.filter((i) => i.status === "accepted");
  const chat = accepted.find((i) => i.id === openChat);

  async function ask(otherId: string) {
    setBusyId(otherId);
    const r = await askIntro(accessToken, otherId);
    setBusyId(null);
    setNotes((n) => ({
      ...n,
      [otherId]: r.ok
        ? r.status === "accepted"
          ? "Matched! Open the chat in Introductions."
          : "Asked. We'll show it here when they answer."
        : r.error,
    }));
    if (r.ok) void reload();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "matches", label: "Matches" },
    {
      id: "intros",
      label: `Introductions${incoming.length ? ` (${incoming.length})` : ""}`,
    },
    { id: "profile", label: "My profile" },
  ];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Roommates"
        className="mb-6 flex gap-1 overflow-x-auto"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold ${
              tab === t.id ? "bg-brand text-brand-fg" : "text-text-muted hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "matches" && (
        <section aria-label="Matches">
          {!profile.visible && (
            <p className="mb-4 rounded-xl bg-surface-muted p-3 text-sm">
              You&apos;re hidden, so others can&apos;t see you. Turn that on in My
              profile.
            </p>
          )}
          {!hasAccess ? (
            <Card className="p-6">
              <h2 className="text-lg font-bold">
                {cityCount} {cityCount === 1 ? "person" : "people"} in {profile.city}
              </h2>
              <p className="mt-1 text-text-muted">
                Your profile is free. A Tour, Apply or Move-in pass shows who fits your
                habits, room type and community, and lets you ask for an introduction.
                Answering an introduction someone sent you, and chatting, are always free.
              </p>
              <ButtonLink href="/plus" className="mt-4">
                See passes
              </ButtonLink>
            </Card>
          ) : matches.length === 0 ? (
            <Card className="p-6">
              <h2 className="text-lg font-bold">No one else in {profile.city} yet</h2>
              <p className="mt-1 text-text-muted">
                We only match people in the same city. Check back soon, or change your
                city in My profile.
              </p>
            </Card>
          ) : (
            <>
              <p className="mb-3 text-sm text-text-muted">
                People in {profile.city}, best fit first. Matched on habits, budget,
                move-in date, languages and interests.
              </p>
              <ul className="grid gap-4 md:grid-cols-2">
                {matches.map((m) => (
                  <MatchCard
                    key={m.profile.id}
                    m={m}
                    intro={introFor(m.profile.id)}
                    canAsk={hasAccess}
                    busy={busyId === m.profile.id}
                    onAsk={() => ask(m.profile.id)}
                    message={notes[m.profile.id]}
                    names={names}
                  />
                ))}
              </ul>
            </>
          )}
          <details className="mt-8" open={matches.length === 0}>
            <summary className="min-h-11 cursor-pointer text-sm font-semibold text-brand-text">
              How matching works: 90%, 50% and 0%
            </summary>
            <p className="mb-3 mt-1 text-sm text-text-muted">
              Made-up people scored against a made-up renter with the same rules we use
              for real matches. A 90% match shares habits and a community, 50% fits some
              things, 0% shares almost nothing.
            </p>
            <ul className="grid gap-4 md:grid-cols-3">
              {exampleMatches().map((m) => (
                <MatchCard
                  key={m.profile.id}
                  m={m}
                  intro={undefined}
                  canAsk={false}
                  busy={false}
                  onAsk={() => {}}
                  names={EXAMPLE_NAMES}
                  example
                />
              ))}
            </ul>
          </details>
        </section>
      )}

      {tab === "intros" && (
        <section aria-label="Introductions" className="space-y-4">
          {intros.length === 0 && (
            <p className="text-text-muted">
              No introductions yet. Ask someone from Matches. Chat opens only after you
              both accept.
            </p>
          )}
          {incoming.map((i) => (
            <Card key={i.id} className="p-4">
              <p className="font-semibold">{i.nickname} would like to be introduced</p>
              <div className="mt-1 flex gap-1.5">
                {i.verified && <VerifiedBadge />}
                <Badge>{i.city}</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  onClick={async () => {
                    await answerIntro(accessToken, i.id, true);
                    void reload();
                  }}
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    await answerIntro(accessToken, i.id, false);
                    void reload();
                  }}
                >
                  Decline
                </Button>
              </div>
            </Card>
          ))}
          {intros
            .filter((i) => i.status === "pending" && i.i_asked)
            .map((i) => (
              <Card key={i.id} className="p-4">
                <p className="font-semibold">{i.nickname}</p>
                <p className="text-sm text-text-muted">Waiting for their answer.</p>
              </Card>
            ))}
          {accepted.map((i) => (
            <div key={i.id}>
              {chat?.id === i.id ? (
                <Chat
                  intro={i}
                  myId={profile.id}
                  onClose={() => setOpenChat(null)}
                  onBlocked={() => {
                    setOpenChat(null);
                    void reload();
                  }}
                />
              ) : (
                <Card className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{i.nickname}</p>
                    <div className="mt-1 flex gap-1.5">
                      <Badge tone="success">Matched</Badge>
                      {i.verified && <VerifiedBadge />}
                    </div>
                  </div>
                  <Button type="button" onClick={() => setOpenChat(i.id)}>
                    Open chat
                  </Button>
                </Card>
              )}
            </div>
          ))}
        </section>
      )}

      {tab === "profile" && (
        <section aria-label="My profile" className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{profile.nickname}</h2>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.verified ? <VerifiedBadge /> : <Badge>Not verified</Badge>}
                  <Badge>{profile.city}</Badge>
                  <Badge>{profile.visible ? "Visible" : "Hidden"}</Badge>
                </div>
              </div>
              <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </div>
            <p className="mt-3 text-sm tabular-nums text-text-muted">
              {formatUsd(profile.budget_usd)}/mo · moving in {formatDate(profile.move_in)}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {[
                SLEEP[profile.sleep],
                CLEAN[profile.cleanliness],
                SMOKING[profile.smoking],
                PETS[profile.pets],
              ].join(" · ")}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {[...profile.languages, ...profile.interests].join(" · ")}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {profile.room_types.map((k) => ROOM_TYPES[k]).join(" or ")}
              {profile.building_ids.length > 0 &&
                ` · Looking at ${profile.building_ids
                  .map((id) => names.get(id))
                  .filter(Boolean)
                  .join(", ")}`}
            </p>
          </Card>
          <Card className="p-5 text-sm">
            <h3 className="font-bold">About verification</h3>
            <p className="mt-1 text-text-muted">
              A verified tag will mean a third-party service checked a government ID. We
              will never keep a copy of your ID. ID checks aren&apos;t switched on yet:
              the sample profiles show how the tag will look.
            </p>
          </Card>
          <Card className="p-5 text-sm">
            <h3 className="font-bold">Remove my profile</h3>
            <p className="mt-1 text-text-muted">
              Deletes your profile and your introductions and chats. Your account stays.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              onClick={async () => {
                if (confirm("Remove your roommate profile, introductions and chats?")) {
                  await removeRoommateProfile(accessToken);
                  void reload();
                }
              }}
            >
              Remove my profile
            </Button>
          </Card>
          <p className="text-xs text-text-muted">
            <Link
              href="/privacy"
              className="font-semibold text-brand-text underline underline-offset-2"
            >
              Privacy
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
