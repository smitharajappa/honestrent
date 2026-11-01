# Image log

Every photo on the site is listed here with where it came from, so we can prove we may use it
and react if a license changes. Add a row when you add a file. Remove the row when you remove it.

## Rules

- **Never use stock photos for a building.** A stock picture labelled as a real apartment is
  what scammers do, and our scam tips tell renters to watch for it. Building photos must be of
  that property, dated, and come from the leasing office, our own shoot, or a moderated
  resident. Until then the card shows a drawn cover and "Photos coming soon".
- Stock photos are for mood only: the home hero, "How Swelt works", the scam-safety page,
  empty and error states. Label them "Illustrative photo".
- Free sources and their rules (check the license page on the day you download):
  Unsplash, Pexels and Pixabay allow commercial use without credit. Do not use pictures that
  show a brand, logo or recognisable face (a model release may be needed). The free Unsplash
  license has no indemnification, so we carry the risk.
- Prefer scenes of Richardson, Plano, Dallas or the UT Dallas area, with no signs or faces.
- Save as WebP, about 1600 px wide and under 200 KB.

## How to add the hero photo

1. Download one wide photo that fits the rules above.
2. Convert it: `npx sharp-cli -i photo.jpg -o public/images/hero.webp resize 1600` (or any
   image tool; WebP, 1600 px wide).
3. The home page picks it up by itself, with a teal tint and an "Illustrative photo" label.
4. Add a row below.

## Photos in use

| File                                                | Where used | Source page | Photographer | License (and version) | Downloaded |
| --------------------------------------------------- | ---------- | ----------- | ------------ | --------------------- | ---------- |
| _(none yet: the home page shows the drawn skyline)_ |            |             |              |                       |            |
