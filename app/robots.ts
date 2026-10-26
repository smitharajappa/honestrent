import type { MetadataRoute } from "next";
import { IS_DEMO, SITE_URL } from "@/lib/site";

// While the data is made up, ask search engines not to list any page.
export default function robots(): MetadataRoute.Robots {
  if (IS_DEMO) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, host: SITE_URL };
}
