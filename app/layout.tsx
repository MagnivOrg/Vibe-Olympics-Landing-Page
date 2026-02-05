import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
