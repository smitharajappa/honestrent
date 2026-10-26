import type { NextConfig } from "next";

// Basic security headers on every page. Vercel adds HTTPS-only (HSTS) itself.
const securityHeaders = [
  // Don't let other sites show Swelt inside a frame (stops click-jacking).
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  // Don't let browsers guess file types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Share only our domain, not full page addresses, with other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Swelt never needs the camera, microphone or location.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
