"use client";

import { useState } from "react";
import { initialOf, photoUrl, type ProfileSource } from "@/lib/profile";
import { cn } from "./cn";

/** Round picture for a signed-in person: their Google photo, or the first letter of their name. */
export function Avatar({
  user,
  className,
  tone = "solid",
}: {
  user: ProfileSource;
  className?: string;
  /** "solid" is white on brand green; "inverse" is for sitting on a green background. */
  tone?: "solid" | "inverse";
}) {
  const url = photoUrl(user);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showPhoto = url !== null && failedUrl !== url;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-extrabold",
        tone === "solid" ? "bg-brand text-brand-fg" : "bg-brand-fg text-brand",
        className,
      )}
    >
      {showPhoto ? (
        // A plain <img> on purpose: the photo lives on Google's servers, and if it fails we show the letter.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          width={36}
          height={36}
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setFailedUrl(url)}
        />
      ) : (
        initialOf(user)
      )}
    </span>
  );
}
