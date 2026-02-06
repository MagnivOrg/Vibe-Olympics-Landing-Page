import { HeroSection } from "@/components/HeroSection";

// Server-side rendered page
export default async function Home() {
  // Simulate fetching data on the server
  const serverData = {
    hero: {
      badge: "February 26, 2026 — NYC",
      title: "Vibe Olympics",
      subtitle: "please win the competition & make no mistakes.",
      description:
        "Three rounds. One stage. Vibe code head-to-head in front of a live audience and commentators — last one standing wins.",
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
