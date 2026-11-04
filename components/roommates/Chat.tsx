"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { blockAndReport, type Intro } from "@/app/actions/roommates";
import { CHAT_STARTERS, NEXT_STEPS, checkMessage } from "@/lib/roommates";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { CheckIcon } from "../ui/icons";

type Message = { id: string; sender: string; body: string; created_at: string };

const REPORT_REASONS: Record<string, string> = {
  scam: "Asked for money or links (scam)",
  harassment: "Harassment or rude messages",
  off_topic: "Not about renting a place",
  fake_profile: "Fake profile",
  discrimination: "Discrimination",
  other: "Something else",
};

/** The chat for one accepted match. Rental topics only, with safety checks and a way to report. */
export function Chat({
  intro,
  myId,
  onClose,
  onBlocked,
}: {
  intro: Intro;
  myId: string;
  onClose: () => void;
  onBlocked: () => void;
}) {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("scam");
  const [note, setNote] = useState("");
  const end = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data } = await sb
      .from("roommate_messages")
      .select("id, sender, body, created_at")
      .eq("intro_id", intro.id)
      .order("created_at", { ascending: true })
      .limit(200);
    setMessages((data ?? []) as Message[]);
  }, [intro.id]);

  // New messages appear within a few seconds. No live connection needed.
  useEffect(() => {
    void load();
    const t = setInterval(load, 6000);
    return () => clearInterval(t);
  }, [load]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  async function send(body: string) {
    const check = checkMessage(body);
    if (!check.ok) return setProblem(check.reason);
    const sb = getBrowserSupabase();
    if (!sb) return;
    setSending(true);
    setProblem(null);
    const { error } = await sb.rpc("send_roommate_message", {
      p_intro: intro.id,
      p_body: body.trim(),
    });
    setSending(false);
    if (error) {
      setProblem(
        /safety|share/i.test(error.message)
          ? "For your safety, don't share links, contact details or payment details here."
          : /Too many/i.test(error.message)
            ? "That's a lot of messages. Please wait a little."
            : "That didn't send. Please try again.",
      );
      return;
    }
    setText("");
    void load();
  }

  async function report() {
    const r = await blockAndReport(accessToken, intro.other_id, reason, note);
    if (r.ok) onBlocked();
    else setProblem(r.error);
  }

  return (
    <Card className="flex flex-col p-0">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0">
          <p className="font-bold">{intro.nickname}</p>
          <div className="mt-0.5 flex gap-1.5">
            {intro.verified && (
              <Badge tone="success" icon={<CheckIcon className="size-3.5" />}>
                Verified
              </Badge>
            )}
            <Badge>{intro.city}</Badge>
          </div>
        </div>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" onClick={() => setReporting((x) => !x)}>
            Report or block
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <p className="bg-info-soft px-4 py-2 text-xs text-info-text">
        This chat is for renting a place together. Don&apos;t share links, contact details
        or payment details here, and never send money before you&apos;ve seen the place
        and a written lease.
      </p>

      {intro.demo && (
        <p className="bg-surface-muted px-4 py-2 text-xs text-text-muted">
          Sample profile made for the demo: it accepted at once so you can try the chat,
          but nobody will reply.
        </p>
      )}

      {reporting && (
        <div className="space-y-3 border-b border-border bg-surface-muted p-4 text-sm">
          <p className="font-semibold">Report and block {intro.nickname}</p>
          <label className="block">
            Why
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3"
            >
              {Object.entries(REPORT_REASONS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Anything to add (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              className="mt-1 w-full rounded-xl border border-border-strong bg-surface px-3 py-2"
            />
          </label>
          <p className="text-xs text-text-muted">
            You will no longer see each other. Our team reviews every report.
          </p>
          <Button type="button" onClick={report}>
            Report and block
          </Button>
        </div>
      )}

      <div className="max-h-96 min-h-48 space-y-2 overflow-y-auto p-4" aria-live="polite">
        {messages.length === 0 && (
          <p className="text-sm text-text-muted">
            You&apos;re matched. Say hello and talk about the apartment: move-in date,
            rent split, habits.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === myId ? "justify-end" : "justify-start"}`}
          >
            <p
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${m.sender === myId ? "bg-brand text-brand-fg" : "bg-surface-muted"}`}
            >
              {m.body}
            </p>
          </div>
        ))}
        <div ref={end} />
      </div>

      <details className="border-t border-border px-4 py-3 text-sm">
        <summary className="min-h-6 cursor-pointer font-semibold">
          Next steps once you&apos;re matched
        </summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-text-muted">
          {NEXT_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </details>

      <div className="space-y-2 border-t border-border p-4">
        <div className="flex flex-wrap gap-2">
          {CHAT_STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setText(s)}
              className="min-h-11 rounded-full border border-border-strong px-3 text-xs font-medium"
            >
              {s}
            </button>
          ))}
        </div>
        {problem && (
          <p role="alert" className="text-sm text-danger-text">
            {problem}
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(text);
          }}
          className="flex gap-2"
        >
          <label className="sr-only" htmlFor="chat-text">
            Message
          </label>
          <input
            id="chat-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            autoComplete="off"
            placeholder="Write about the apartment…"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-strong bg-surface px-3 text-base"
          />
          <Button type="submit" disabled={sending}>
            Send
          </Button>
        </form>
      </div>
    </Card>
  );
}
