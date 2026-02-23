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
    className="flex-shrink-0 px-4 sm:px-7 flex items-center justify-center cursor-pointer opacity-40 hover:opacity-80 transition-opacity duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
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
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        <m.div ref={innerRef} className="flex items-center py-1" style={{ x }}>
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
    </div>
  );
};
