import type { Metadata, Viewport } from "next";

import { ClientShell } from "@/components/ClientShell";

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
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
