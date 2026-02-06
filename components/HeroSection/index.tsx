"use client";

import { m } from "framer-motion";
import { useState } from "react";

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

export const HeroSection = ({ data }: HeroSectionProps) => {
  const [applyOpen, setApplyOpen] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const isTouch = useIsTouchDevice();

  return (
    <section className="relative h-full w-full flex items-center justify-center overflow-hidden px-4 sm:px-6">
      {/* Interactive Background with parallax orbs and cursor glow */}
      <InteractiveBackground />

      <div className="relative max-w-6xl mx-auto px-6 text-center z-20">
        {/* Olympic Rings — Central Element (smaller on mobile) */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-6 sm:mb-10"
        >
          <OlympicRings size={isTouch ? "md" : "lg"} animated />
        </m.div>

        {/* Badge */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 sm:mb-6 inline-block"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#009F3D] animate-pulse" />
            <span className="text-sm font-medium text-white/70 tracking-wide uppercase">
              {data.badge}
            </span>
          </div>
        </m.div>

        {/* Title */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-display font-bold text-foreground mb-3 sm:mb-4 leading-[0.95] tracking-tight">
            {data.title}
          </h1>
        </m.div>

        {/* Subtitle with gradient */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className="text-hero font-semibold mb-4 sm:mb-6"
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
        >
          <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed font-light">
            {data.description}
          </p>
        </m.div>

        {/* CTA Buttons */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-w-[180px]"
            onClick={() => setApplyOpen(true)}
          >
            {data.ctaText}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto min-w-[180px]"
            onClick={() => setLearnMoreOpen(true)}
          >
            {data.ctaSecondary}
          </Button>
        </m.div>

        {/* Bottom sponsors */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-white/[0.06]"
        >
          <p className="text-xs text-white/30 mb-4 sm:mb-5 uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium">
            Partnered with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {["Vercel", "NVIDIA", "OpenAI"].map((company, index) => (
              <m.div
                key={company}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.6 + index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-base font-medium text-white/25 hover:text-white/60 transition-colors duration-300 cursor-pointer"
              >
                {company}
              </m.div>
            ))}
          </div>
        </m.div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to Compete</DialogTitle>
            <DialogDescription>
              Applications open soon. Join our waitlist to be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-y-2">
            <Button variant="secondary" onClick={() => setApplyOpen(false)}>
              Close
            </Button>
            <Button variant="accent" onClick={() => setApplyOpen(false)}>
              Join Waitlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Learn More Dialog */}
      <Dialog open={learnMoreOpen} onOpenChange={setLearnMoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About Vibe Olympics</DialogTitle>
            <DialogDescription>
              48-hour creative competition. Build something incredible. Win
              glory and prizes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="secondary" onClick={() => setLearnMoreOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
