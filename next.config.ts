import type { NextConfig } from "next";

// Basic security headers on every page. Vercel adds HTTPS-only (HSTS) itself.
const securityHeaders = [
  // Don't let other sites show Honest Rent inside a frame (stops click-jacking).
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  // Don't let browsers guess file types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Share only our domain, not full page addresses, with other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Honest Rent never needs the camera or microphone. Location is only used on this site, and only
  // after a renter presses "Use my location".
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
