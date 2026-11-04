"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { IS_DEMO } from "@/lib/site";
import { displayName, type ProfileSource } from "@/lib/profile";
import { Avatar } from "../ui/Avatar";
import { cn } from "../ui/cn";
import { LockIcon, LogOutIcon, PlusCircleIcon, UserIcon, UsersIcon } from "../ui/icons";
import { useAuth } from "./AuthContext";

const itemClass =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-text hover:bg-surface-muted focus-visible:bg-surface-muted";

/** The list inside the menu. Shown by ProfileMenu, and as a fixed example in /styleguide. */
export function ProfileMenuPanel({
  user,
  onNavigate,
  onSignOut,
  className,
}: {
  user: ProfileSource;
  onNavigate?: () => void;
  onSignOut?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("p-2", className)}>
      <div className="flex items-center gap-3 px-3 py-2">
        <Avatar user={user} className="size-10" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{displayName(user)}</p>
          {user.email && <p className="truncate text-xs text-text-muted">{user.email}</p>}
        </div>
      </div>
      <div role="separator" className="my-1 border-t border-border" />
      <Link href="/roommates" role="menuitem" className={itemClass} onClick={onNavigate}>
        <UsersIcon className="size-4 text-text-muted" />
        My roommate profile
      </Link>
      <Link href="/plus" role="menuitem" className={itemClass} onClick={onNavigate}>
        <PlusCircleIcon className="size-4 text-text-muted" />
        <span>
          Honest Rent Plus
          <span className="block text-xs font-normal text-text-muted">
            {IS_DEMO ? "Free during the demo" : "Passes and waitlist"}
          </span>
        </span>
      </Link>
      <Link href="/account" role="menuitem" className={itemClass} onClick={onNavigate}>
        <UserIcon className="size-4 text-text-muted" />
        Account
      </Link>
      <Link href="/privacy" role="menuitem" className={itemClass} onClick={onNavigate}>
        <LockIcon className="size-4 text-text-muted" />
        Privacy
      </Link>
      <div role="separator" className="my-1 border-t border-border" />
      <button type="button" role="menuitem" className={itemClass} onClick={onSignOut}>
        <LogOutIcon className="size-4 text-text-muted" />
        Sign out
      </button>
    </div>
  );
}

/** Round avatar in the header that opens the profile menu. */
export function ProfileMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  }, []);

  // Close when the page changes.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const items = () =>
      Array.from(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    items()[0]?.focus();
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key === "Tab") {
        setOpen(false);
        return;
      }
      const list = items();
      if (list.length === 0) return;
      const at = list.indexOf(document.activeElement as HTMLElement);
      let next = -1;
      if (e.key === "ArrowDown") next = (at + 1) % list.length;
      else if (e.key === "ArrowUp") next = (at <= 0 ? list.length : at) - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = list.length - 1;
      if (next >= 0) {
        e.preventDefault();
        list[next].focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!user) return null;

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Profile menu for ${displayName(user)}`}
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 place-items-center rounded-full hover:bg-surface-muted"
      >
        <Avatar user={user} />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Profile"
          className="absolute right-0 top-full z-50 mt-1 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface shadow-raised"
        >
          <ProfileMenuPanel
            user={user}
            onNavigate={() => setOpen(false)}
            onSignOut={() => {
              setOpen(false);
              void signOut().finally(() => {
                router.push("/");
                router.refresh();
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
