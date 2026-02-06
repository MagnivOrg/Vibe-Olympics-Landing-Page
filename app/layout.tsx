import type { Metadata, Viewport } from "next";

import { ClientShell } from "@/components/ClientShell";

import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe Olympics",
  description: "Where creators compete",
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
    description: "Where creators compete",
    siteName: "Vibe Olympics",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 2004,
        height: 1144,
        alt: "Vibe Olympics — Where creators compete",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Olympics",
    description: "Where creators compete",
    images: ["/twitter-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vibe Olympics",
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
      </body>
    </html>
  );
}
