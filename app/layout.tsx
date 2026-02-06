import type { Metadata } from "next";

import { LiquidGlassCursor } from "@/components/LiquidGlassCursor";

import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe Olympics",
  description: "Where creators compete",
  viewport: "width=device-width, initial-scale=1",
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
        {children}
      </body>
    </html>
  );
}
