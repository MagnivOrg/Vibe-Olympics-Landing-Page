"use client";

import { m } from "framer-motion";

interface OlympicRingsProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
}

const OLYMPIC_COLORS = {
  blue: "#0085C7",
  yellow: "#F4C300",
  black: "#1a1a1a",
  green: "#009F3D",
  red: "#DF0024",
};

export const OlympicRings = ({
  size = "md",
  className = "",
  animated = true,
}: OlympicRingsProps) => {
  const sizes = {
    sm: { ring: 32, stroke: 3, gap: 4 },
    md: { ring: 56, stroke: 5, gap: 6 },
    lg: { ring: 80, stroke: 6, gap: 8 },
    xl: { ring: 120, stroke: 8, gap: 12 },
  };

  const { ring, stroke, gap } = sizes[size];
  const overlap = ring * 0.45;

  const containerWidth = ring * 3 + gap * 2 - overlap * 2;
  const containerHeight = ring * 1.5 + gap;

  const topRowY = stroke / 2;
  const bottomRowY = ring * 0.5 + gap;

  const rings = [
    {
      cx: ring / 2,
      cy: topRowY + ring / 2,
      color: OLYMPIC_COLORS.blue,
      delay: 0,
      zIndex: 1,
    },
    {
      cx: ring / 2 + ring - overlap + gap,
      cy: topRowY + ring / 2,
      color: OLYMPIC_COLORS.black,
      delay: 0.1,
      zIndex: 3,
    },
    {
      cx: ring / 2 + (ring - overlap + gap) * 2,
      cy: topRowY + ring / 2,
      color: OLYMPIC_COLORS.red,
      delay: 0.2,
      zIndex: 5,
    },
    {
      cx: ring / 2 + (ring - overlap + gap) * 0.5,
      cy: bottomRowY + ring / 2,
      color: OLYMPIC_COLORS.yellow,
      delay: 0.15,
      zIndex: 2,
    },
    {
      cx: ring / 2 + (ring - overlap + gap) * 1.5,
      cy: bottomRowY + ring / 2,
      color: OLYMPIC_COLORS.green,
      delay: 0.25,
      zIndex: 4,
    },
  ];

  return (
    <div className={`relative ${className}`}>
      <svg
        width={containerWidth + stroke}
        height={containerHeight + stroke}
        viewBox={`0 0 ${containerWidth + stroke} ${containerHeight + stroke}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {rings
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((ringData, index) => (
            <m.circle
              key={`ring-${index}`}
              cx={ringData.cx}
              cy={ringData.cy}
              r={ring / 2 - stroke / 2}
              stroke={ringData.color}
              strokeWidth={stroke}
              fill="none"
              initial={animated ? { scale: 0, opacity: 0 } : {}}
              animate={animated ? { scale: 1, opacity: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: ringData.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: `${ringData.cx}px ${ringData.cy}px` }}
            />
          ))}
      </svg>

      {animated && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute inset-0 blur-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 20% 30%, ${OLYMPIC_COLORS.blue}40, transparent 40%),
                        radial-gradient(circle at 50% 30%, ${OLYMPIC_COLORS.black}20, transparent 40%),
                        radial-gradient(circle at 80% 30%, ${OLYMPIC_COLORS.red}40, transparent 40%),
                        radial-gradient(circle at 35% 70%, ${OLYMPIC_COLORS.yellow}40, transparent 40%),
                        radial-gradient(circle at 65% 70%, ${OLYMPIC_COLORS.green}40, transparent 40%)`,
          }}
        />
      )}
    </div>
  );
};
