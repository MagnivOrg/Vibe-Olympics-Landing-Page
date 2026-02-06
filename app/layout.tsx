import type { Metadata, Viewport } from "next";

import { FloatingEmojis } from "@/components/FloatingEmojis";
import { LiquidGlassCursor } from "@/components/LiquidGlassCursor";

import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe Olympics",
  description: "Where creators compete",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className="antialiased bg-background text-foreground h-full overflow-hidden">
        <LiquidGlassCursor />
        <FloatingEmojis />
        {children}
      </body>
    </html>
  );
}
