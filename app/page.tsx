import { HeroSection } from "@/components/HeroSection";

// Server-side rendered page
export default async function Home() {
  // Simulate fetching data on the server
  const serverData = {
    hero: {
      badge: "Coming Summer 2025",
      title: "Vibe Olympics",
      subtitle: "Where creators compete.",
      description:
        "The ultimate showdown for builders, designers, and dreamers. 48 hours. One winner. Infinite possibilities.",
      ctaText: "Apply Now",
      ctaSecondary: "Learn More",
    },
  };

  return (
    <main className="h-full overflow-hidden bg-background">
      <HeroSection data={serverData.hero} />
    </main>
  );
}
