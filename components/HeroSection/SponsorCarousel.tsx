"use client";

import { m, useAnimationFrame, useMotionValue } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface Sponsor {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  url: string;
}

const SPONSORS: Sponsor[] = [
  {
    src: "/mlh-logo.svg",
    alt: "MLH",
    width: 40,
    height: 16,
    className: "w-[40px] h-[16px] sm:w-[55px] sm:h-auto",
    url: "https://mlh.io",
  },
  {
    src: "/joco-logo.svg",
    alt: "JOCO",
    width: 55,
    height: 16,
    className: "w-[55px] h-[16px] sm:w-[90px] sm:h-[26px]",
    url: "https://ridejoco.com",
  },
  {
    src: "/cursor-logo.svg",
    alt: "Cursor",
    width: 60,
    height: 18,
    className: "w-[60px] h-[18px] sm:w-[100px] sm:h-[30px]",
    url: "https://cursor.com",
  },
  {
    src: "/exa-logo.svg",
    alt: "Exa",
    width: 50,
    height: 15,
    className: "w-[50px] h-[15px] sm:w-[80px] sm:h-[24px]",
    url: "https://exa.ai",
  },
  {
    src: "/endex-logo.svg",
    alt: "Endex",
    width: 60,
    height: 14,
    className: "w-[60px] h-[14px] sm:w-[100px] sm:h-[24px]",
    url: "https://endex.ai",
  },
];

const SPEED = 0.35;

const SponsorItem = ({ sponsor }: { sponsor: Sponsor }) => (
  <button
    onClick={() => window.open(sponsor.url, "_blank")}
    className="flex-shrink-0 px-4 sm:px-7 flex items-center justify-center cursor-pointer opacity-50 hover:opacity-90 transition-opacity duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
    aria-label={`Visit ${sponsor.alt}`}
  >
    <Image
      src={sponsor.src}
      alt={sponsor.alt}
      width={sponsor.width}
      height={sponsor.height}
      className={`pointer-events-none ${sponsor.className}`}
    />
  </button>
);

export const SponsorCarousel = () => {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [singleSetWidth, setSingleSetWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (innerRef.current) {
        const totalWidth = innerRef.current.scrollWidth;
        setSingleSetWidth(totalWidth / 4);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useAnimationFrame(() => {
    if (isPaused || singleSetWidth === 0) return;

    const current = x.get();
    let next = current - SPEED;

    if (Math.abs(next) >= singleSetWidth * 2) {
      next += singleSetWidth * 2;
    }

    x.set(next);
  });

  const handlePause = useCallback(() => setIsPaused(true), []);
  const handleResume = useCallback(() => setIsPaused(false), []);

  const sponsorSets = [0, 1, 2, 3];

  return (
    <div className="w-full max-w-xl mx-auto">
      <p className="text-[9px] sm:text-xs text-white/30 mb-2 sm:mb-3 uppercase tracking-[0.15em] font-medium text-center">
        With Help From
      </p>

      {/* Glass bubble container */}
      <div
        ref={containerRef}
        className="relative rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden"
        style={{
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          boxShadow:
            "0 0 20px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(255,255,255,0.02)",
        }}
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        {/* Left distortion zone — blurs content as it exits */}
        <div
          className="absolute left-0 top-0 bottom-0 w-14 sm:w-20 z-10 pointer-events-none"
          style={{
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            maskImage: "linear-gradient(to right, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 0%, transparent 100%)",
          }}
        />

        {/* Right distortion zone — blurs content as it exits */}
        <div
          className="absolute right-0 top-0 bottom-0 w-14 sm:w-20 z-10 pointer-events-none"
          style={{
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            maskImage: "linear-gradient(to left, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to left, black 0%, transparent 100%)",
          }}
        />

        {/* Opacity fade mask on the scrolling content */}
        <div
          style={{
            maskImage:
              "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        >
          <m.div
            ref={innerRef}
            className="flex items-center py-3 sm:py-4"
            style={{ x }}
          >
            {sponsorSets.map((setIndex) =>
              SPONSORS.map((sponsor, i) => (
                <SponsorItem
                  key={`${setIndex}-${sponsor.alt}-${i}`}
                  sponsor={sponsor}
                />
              )),
            )}
          </m.div>
        </div>

        {/* Subtle inner highlight along the top edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
