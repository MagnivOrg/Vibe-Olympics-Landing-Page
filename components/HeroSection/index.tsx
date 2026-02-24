"use client";

import { m } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import { SponsorCarousel } from "@/components/HeroSection/SponsorCarousel";
import { useIsTouchDevice } from "@/components/hooks/useIsTouchDevice";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OlympicRings } from "@/components/ui/olympic-rings";

interface HeroData {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaSecondary: string;
}

interface HeroSectionProps {
  data: HeroData;
}

const FORMAT_ITEMS = [
  {
    round: "Round 1",
    title: "The Qualifier",
    description:
      "Starts at 6:30pm sharp. All competitors get the same prompt. Build as fast as you can. Top builders advance.",
  },
  {
    round: "Round 2",
    title: "The Showdown",
    description:
      "Harder prompt. Fewer competitors. The field narrows down to the final two.",
  },
  {
    round: "Round 3",
    title: "The Final",
    description:
      "1v1 on stage. Live coding. Live commentary. The audience watches every keystroke.",
  },
];

export const HeroSection = ({ data }: HeroSectionProps) => {
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const isTouch = useIsTouchDevice();

  return (
    <section
      className="relative h-dvh w-full flex items-center justify-center overflow-hidden px-4 sm:px-6"
      style={{
        paddingTop: "clamp(1.5rem, 4vh, 3rem)",
        paddingBottom: "clamp(1.5rem, 4vh, 3rem)",
      }}
    >
      {/* Interactive Background with parallax orbs and cursor glow */}
      <InteractiveBackground />

      <div className="relative max-w-6xl w-full mx-auto px-6 text-center z-20 flex flex-col items-center max-h-full">
        {/* Olympic Rings — Central Element (smaller on mobile) */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center shrink-0"
          style={{ marginBottom: "clamp(0.5rem, 1.5vh, 2.5rem)" }}
        >
          <OlympicRings size={isTouch ? "sm" : "lg"} animated />
        </m.div>

        {/* Badge */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block shrink-0"
          style={{ marginBottom: "clamp(0.5rem, 1vh, 1.5rem)" }}
        >
          <div className="inline-flex items-center px-2.5 py-1 sm:px-5 sm:py-2.5 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-sm">
            <span className="text-[10px] sm:text-sm font-medium text-white/70 tracking-wide uppercase">
              {data.badge}
            </span>
          </div>
        </m.div>

        {/* Title */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
          style={{ marginBottom: "clamp(0.25rem, 0.75vh, 1rem)" }}
        >
          <h1 className="text-display font-bold text-foreground leading-[0.95] tracking-tight">
            {data.title}
          </h1>
        </m.div>

        {/* Subtitle with gradient */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
          style={{ marginBottom: "clamp(0.375rem, 1vh, 1.5rem)" }}
        >
          <p
            className="text-base sm:text-4xl italic font-semibold"
            style={{
              background: "linear-gradient(135deg, #0085C7, #F4C300, #DF0024)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {data.subtitle}
          </p>
        </m.div>

        {/* Description */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
          style={{ marginBottom: "clamp(0.75rem, 2vh, 2.5rem)" }}
        >
          <p className="text-[10px] sm:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed font-light">
            {data.description}
          </p>
        </m.div>

        {/* CTA Buttons */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 shrink-0"
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-w-[160px] sm:min-w-[180px]"
            onClick={() =>
              window.open(
                "https://partiful.com/e/ZgwBhhmfjWTBjqXcs9dS?c=aejCpAmk",
                "_blank",
              )
            }
          >
            {data.ctaText}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto min-w-[160px] sm:min-w-[180px]"
            onClick={() => setLearnMoreOpen(true)}
          >
            {data.ctaSecondary}
          </Button>
        </m.div>

        {/* Run by PromptLayer */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex items-center justify-center gap-1.5 sm:gap-2 shrink-0"
          style={{ marginTop: "clamp(2rem, 4vh, 4rem)" }}
        >
          <span className="text-[11px] sm:text-sm text-white/30 uppercase tracking-[0.15em] font-medium">
            Run by
          </span>
          <Image
            src="/promptlayer-logo.svg"
            alt="PromptLayer"
            width={132}
            height={19}
            className="opacity-40 hover:opacity-70 transition-opacity duration-300 cursor-pointer sm:w-[216px] sm:h-[31px]"
            onClick={() => window.open("https://promptlayer.com", "_blank")}
          />
        </m.div>

        {/* With Help From */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="shrink-0 w-full"
          style={{ marginTop: "clamp(1.5rem, 3vh, 3rem)" }}
        >
          <SponsorCarousel />
        </m.div>
      </div>

      {/* Learn More Dialog */}
      <Dialog open={learnMoreOpen} onOpenChange={setLearnMoreOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl">
              How It Works
            </DialogTitle>
            <DialogDescription className="sr-only">
              Event format details
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs sm:text-sm text-white/50 mt-2">
            Doors open at 6pm. The first round starts at 6:30pm sharp — if
            you&apos;re competing, show up early to set up your workstation.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-3 sm:mt-4">
            {FORMAT_ITEMS.map((item) => (
              <div
                key={item.round}
                className="bg-white/[0.04] border border-white/10 rounded-xl p-3 sm:p-4 text-left"
              >
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-white/30 mb-1 block">
                  {item.round}
                </span>
                <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/40 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          {/* Prizes */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/[0.06]">
            <h3 className="text-sm sm:text-base font-semibold text-white mb-2">
              Prizes
            </h3>
            <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-white/50">
              <p>
                <span className="text-white/70">1st Place:</span> Mac Mini
              </p>
              <p>
                <span className="text-white/70">Runner-up:</span> Raspberry Pi
              </p>
              <p className="text-white/30 text-[10px] sm:text-xs mt-1">
                More prizes to be announced from our sponsors.
              </p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/[0.06] text-center">
            <a
              href="mailto:hello@promptlayer.com"
              className="text-xs sm:text-sm text-white/40 hover:text-white/70 transition-colors duration-300"
            >
              Contact us to sponsor or get involved →
            </a>
          </div>
          <DialogFooter className="mt-3 sm:mt-4">
            <Button variant="secondary" onClick={() => setLearnMoreOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
