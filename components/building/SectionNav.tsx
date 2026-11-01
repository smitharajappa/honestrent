"use client";

import { useEffect, useState } from "react";

export type NavItem = { id: string; label: string };

/**
 * Sticky "jump to" bar for a long building page, like the tab bar on big listing sites.
 * Highlights the section you are reading. Plain links, so it works without scripting.
 */
export function SectionNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const elements = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // The first listed section that is on screen is the one being read.
        const current = items.find((i) => visible.has(i.id));
        if (current) setActive(current.id);
      },
      { rootMargin: "-120px 0px -55% 0px" },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  function jump(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  }

  return (
    <nav
      aria-label="Sections on this page"
      className="sticky top-16 z-10 -mx-4 mt-4 border-b border-border bg-bg/90 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <ul className="flex gap-1 overflow-x-auto py-1.5">
        {items.map((item) => {
          const on = item.id === active;
          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                onClick={(e) => jump(e, item.id)}
                aria-current={on ? "true" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-semibold ${
                  on ? "bg-brand text-brand-fg" : "text-text-muted hover:text-text"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
