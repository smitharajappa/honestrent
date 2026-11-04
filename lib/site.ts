// Site-wide settings.

/**
 * Demo mode is ON unless NEXT_PUBLIC_DEMO_MODE is set to "off".
 * While on, the site shows a "sample data" banner and asks search engines
 * not to list it, because the building data is made up.
 */
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE !== "off";

export const SITE_NAME = "Honest Rent";
export const SITE_DESCRIPTION =
  "Dallas-area apartments ranked by what you will really pay each month: rent plus fees, minus deals.";

/** The public web address. Vercel provides it; locally it's localhost. */
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
