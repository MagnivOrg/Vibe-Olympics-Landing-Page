import { HeroSection } from "@/components/HeroSection";

// Server-side rendered page
export default async function Home() {
  // Simulate fetching data on the server
  const serverData = {
    hero: {
      badge: "February 26, 2026 — NYC",
      title: "Vibe Olympics",
      subtitle: "The vibe coding competition.",
      description:
        "A live tournament-style vibe coding competition. Three rounds. One stage. Compete head-to-head to build the best app — in front of a live audience with commentary.",
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
