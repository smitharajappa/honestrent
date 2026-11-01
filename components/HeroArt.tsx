import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { HeroSkyline } from "./HeroSkyline";

/** Where a chosen hero photo goes. Add it and log it in docs/image-log.md. */
const PHOTO_FILE = "public/images/hero.webp";
const PHOTO_URL = "/images/hero.webp";

/**
 * The picture beside the home headline. Uses a real photo with a teal tint when one has
 * been added (labelled "Illustrative photo", never used as a building's photo), and the
 * drawn skyline until then.
 */
export function HeroArt({ compact }: { compact: boolean }) {
  const hasPhoto = existsSync(path.join(process.cwd(), PHOTO_FILE));

  if (!hasPhoto) {
    return (
      <HeroSkyline
        className={`hidden w-full lg:block ${compact ? "max-h-32" : "max-h-56"}`}
      />
    );
  }

  return (
    <figure
      className={`relative hidden overflow-hidden rounded-2xl shadow-raised lg:block ${
        compact ? "h-32" : "h-56"
      }`}
    >
      <Image
        src={PHOTO_URL}
        alt=""
        width={1600}
        height={900}
        priority
        sizes="(min-width: 1024px) 26rem, 0px"
        className="size-full object-cover grayscale"
      />
      {/* Teal tint so photos from different photographers look like one brand. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-brand mix-blend-multiply opacity-70"
      />
      <figcaption className="absolute right-3 bottom-2 rounded-full bg-surface/85 px-2.5 py-0.5 text-[11px] font-medium text-text-muted">
        Illustrative photo
      </figcaption>
    </figure>
  );
}
