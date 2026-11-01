import { LocationProvider } from "@/components/location/LocationContext";
import { MyPlacesProvider } from "@/components/location/MyPlacesContext";
import { MotionProvider } from "@/components/motion/Reveal";
import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ApprovalProvider } from "@/components/approval/ApprovalContext";
import { ShortlistProvider } from "@/components/shortlist/ShortlistContext";
import { DemoBanner, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { IS_DEMO, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

// Next.js downloads Inter at build time and serves it from our own site.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Swelt: find apartments by real monthly cost",
    template: "%s · Swelt",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Link previews when someone shares Swelt in a chat or post.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Swelt: find apartments by real monthly cost",
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  // While the data is made up, keep every page out of search results.
  robots: IS_DEMO ? { index: false, follow: false } : { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1113" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        {IS_DEMO && <DemoBanner />}
        {/* Approval answers live in memory only; the shortlist is saved on this device. */}
        <MotionProvider>
          <LocationProvider>
            <ApprovalProvider>
              <ShortlistProvider>
                <MyPlacesProvider>
                  <SiteHeader />
                  <div className="flex-1">{children}</div>
                  <SiteFooter />
                </MyPlacesProvider>
              </ShortlistProvider>
            </ApprovalProvider>
          </LocationProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
