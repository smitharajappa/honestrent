import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ApprovalProvider } from "@/components/approval/ApprovalContext";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

// Next.js downloads Inter at build time and serves it from our own site.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Swelt: find apartments by real monthly cost",
  description:
    "Richardson-Plano apartments ranked by what you will really pay each month: rent plus fees, minus deals.",
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
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <SiteHeader />
        {/* Approval answers live here so they carry across pages, in memory only. */}
        <ApprovalProvider>
          <div className="flex-1">{children}</div>
        </ApprovalProvider>
        <SiteFooter />
      </body>
    </html>
  );
}
