import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";

import { ClientShell } from "@/components/ClientShell";

import "./globals.css";

const siteUrl = "https://vibeolympics.org";
const description = "The vibe coding competition — February 26, 2026 in NYC";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Vibe Olympics",
  description,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Vibe Olympics",
    description,
    siteName: "Vibe Olympics",
    type: "website",
    locale: "en_US",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 2004,
        height: 1144,
        alt: "Vibe Olympics — The vibe coding competition",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Olympics",
    description,
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vibe Olympics",
  },
  other: {
    "apple-mobile-web-app-title": "Vibe Olympics",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className="antialiased bg-background text-foreground h-full overflow-hidden">
        <ClientShell>{children}</ClientShell>
        <Analytics />
      </body>
    </html>
  );
}
