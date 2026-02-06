"use client";

import { m, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { useIsTouchDevice } from "@/components/hooks/useIsTouchDevice";

interface CursorState {
  isHovering: boolean;
  isPressed: boolean;
  isOverInteractive: boolean;
}

// Spring configs for the different cursor layers
const SPRING_CONFIG = { damping: 15, stiffness: 150, mass: 0.8 };
const SLOW_SPRING_CONFIG = { damping: 25, stiffness: 100, mass: 1.2 };
const BLOB_SPRING_CONFIG = { damping: 12, stiffness: 80, mass: 1.5 };

// Trail particle configs — defined statically so hooks stay unconditional
const TRAIL_CONFIGS = [
  { damping: 20, stiffness: 120, mass: 0.4 },
  { damping: 24, stiffness: 95, mass: 0.7 },
  { damping: 28, stiffness: 70, mass: 1.0 },
  { damping: 32, stiffness: 45, mass: 1.3 },
] as const;

const TRAIL_SIZES = [10, 8, 6, 4] as const;

/**
 * Trail particle component — each one gets its own springs so
 * we avoid calling hooks inside a loop/map in the parent.
 */
const TrailParticle = ({
  index,
  cursorX,
  cursorY,
}: {
  index: 0 | 1 | 2 | 3;
  cursorX: ReturnType<typeof useMotionValue<number>>;
  cursorY: ReturnType<typeof useMotionValue<number>>;
}) => {
  const cfg = TRAIL_CONFIGS[index];
  const size = TRAIL_SIZES[index];

  const x = useSpring(cursorX, cfg);
  const y = useSpring(cursorY, cfg);

  const opacityVal = 0.2 - index * 0.04;
  const shadowSpread = 8 - index * 2;
  const shadowOpacity = 0.15 - index * 0.03;

  return (
    <m.div
      className="absolute"
      style={{
        x,
        y,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <m.div
        className="rounded-full"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `rgba(255,255,255,${opacityVal})`,
          filter: "blur(1px)",
          boxShadow: `0 0 ${shadowSpread}px rgba(255,255,255,${shadowOpacity})`,
        }}
      />
    </m.div>
  );
};

/**
 * The actual cursor implementation — only rendered on non-touch devices.
 * Separated so the parent can gate rendering without breaking hook rules.
 */
const LiquidGlassCursorInner = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>({
    isHovering: false,
    isPressed: false,
    isOverInteractive: false,
  });

  // Cursor position with spring physics
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring-animated position for the glass effect
  const smoothX = useSpring(cursorX, SPRING_CONFIG);
  const smoothY = useSpring(cursorY, SPRING_CONFIG);

  // Even smoother position for the outer glow (creates trailing effect)
  const trailX = useSpring(cursorX, SLOW_SPRING_CONFIG);
  const trailY = useSpring(cursorY, SLOW_SPRING_CONFIG);

  // Blob layer — extra smooth for organic feel
  const blobX = useSpring(cursorX, BLOB_SPRING_CONFIG);
  const blobY = useSpring(cursorY, BLOB_SPRING_CONFIG);

  // Scale spring for interactions
  const scale = useSpring(1, { damping: 18, stiffness: 300 });
  const innerScale = useSpring(1, { damping: 12, stiffness: 200 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      if (!isVisible) {
        setIsVisible(true);
      }
    },
    [cursorX, cursorY, isVisible],
  );

  const handleMouseDown = useCallback(() => {
    setCursorState((prev) => ({ ...prev, isPressed: true }));
    scale.set(0.8);
    innerScale.set(1.3);
  }, [scale, innerScale]);

  const handleMouseUp = useCallback(() => {
    setCursorState((prev) => ({ ...prev, isPressed: false }));
    scale.set(cursorState.isOverInteractive ? 1.4 : 1);
    innerScale.set(1);
  }, [scale, innerScale, cursorState.isOverInteractive]);

  const handleMouseEnter = useCallback(() => {
    setIsVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Check if hovering over interactive elements
  const checkInteractiveElement = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("[data-interactive]");

      const wasOverInteractive = cursorState.isOverInteractive;
      const isNowOverInteractive = !!isInteractive;

      if (wasOverInteractive !== isNowOverInteractive) {
        setCursorState((prev) => ({
          ...prev,
          isOverInteractive: isNowOverInteractive,
        }));
        scale.set(isNowOverInteractive ? 1.4 : 1);
      }
    },
    [cursorState.isOverInteractive, scale],
  );

  useEffect(() => {
    // Signal to CSS that the custom cursor is mounted and ready.
    // The globals.css rule `html[data-custom-cursor] * { cursor: none }` only
    // activates once this attribute is present, eliminating the gap where
    // the default cursor was hidden but the custom one hadn't rendered yet.
    document.documentElement.setAttribute("data-custom-cursor", "");

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousemove", checkInteractiveElement, {
      passive: true,
    });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.documentElement.removeAttribute("data-custom-cursor");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", checkInteractiveElement);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [
    handleMouseMove,
    checkInteractiveElement,
    handleMouseDown,
    handleMouseUp,
    handleMouseEnter,
    handleMouseLeave,
  ]);

  return (
    <m.div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Outermost blob layer — very soft trailing glow */}
      <m.div
        className="absolute"
        style={{
          x: blobX,
          y: blobY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <m.div
          className="w-48 h-48 rounded-full"
          style={{
            scale,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
      </m.div>

      {/* Outer trailing glow — creates the liquid feel */}
      <m.div
        className="absolute"
        style={{
          x: trailX,
          y: trailY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <m.div
          className="w-32 h-32 rounded-full"
          style={{
            scale,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      </m.div>

      {/* Main glass cursor blob */}
      <m.div
        className="absolute"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <m.div
          className="relative"
          style={{ scale }}
          transition={{ type: "spring", damping: 18, stiffness: 300 }}
        >
          {/* Main glass blob container */}
          <m.div
            className="w-20 h-20 rounded-full relative overflow-hidden"
            animate={{
              borderColor: cursorState.isOverInteractive
                ? "rgba(255,255,255,0.5)"
                : "rgba(255,255,255,0.15)",
              borderWidth: cursorState.isOverInteractive ? "2px" : "1.5px",
            }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.03) 100%)",
              boxShadow: `
                inset 0 0 40px rgba(255,255,255,0.15),
                inset 0 -4px 20px rgba(255,255,255,0.08),
                inset 0 4px 20px rgba(255,255,255,0.12),
                0 0 60px rgba(255,255,255,0.08),
                0 8px 32px rgba(0,0,0,0.4)
              `,
              backdropFilter: "blur(12px) saturate(1.4)",
              WebkitBackdropFilter: "blur(12px) saturate(1.4)",
              borderStyle: "solid",
            }}
          >
            {/* Inner glass refraction layers */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 40%, rgba(255,255,255,0.08) 100%)",
              }}
            />

            {/* Top highlight — glass reflection */}
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-4 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
                filter: "blur(2px)",
              }}
            />

            {/* Secondary reflection */}
            <div
              className="absolute top-3 left-3 w-4 h-4 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)",
                filter: "blur(1px)",
              }}
            />

            {/* Third reflection for more glass depth */}
            <div
              className="absolute top-4 left-5 w-2 h-2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)",
              }}
            />

            {/* Chromatic aberration effect — subtle color fringing */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(45deg, rgba(0,133,199,0.12) 0%, transparent 25%, transparent 75%, rgba(223,0,36,0.12) 100%)",
              }}
            />

            {/* Bottom rim light */}
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 rounded-full"
              style={{
                background:
                  "linear-gradient(0deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
                filter: "blur(2px)",
              }}
            />
          </m.div>

          {/* Center dot indicator */}
          <m.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ scale: innerScale }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 100%)",
                boxShadow: "0 0 12px rgba(255,255,255,0.6)",
              }}
            />
          </m.div>
        </m.div>
      </m.div>

      {/* Liquid trail particles — each is its own component to keep hooks unconditional */}
      <TrailParticle index={0} cursorX={cursorX} cursorY={cursorY} />
      <TrailParticle index={1} cursorX={cursorX} cursorY={cursorY} />
      <TrailParticle index={2} cursorX={cursorX} cursorY={cursorY} />
      <TrailParticle index={3} cursorX={cursorX} cursorY={cursorY} />
    </m.div>
  );
};

/**
 * Public component — gates rendering on device type so touch devices
 * never mount any springs, listeners, or DOM for the custom cursor.
 */
export const LiquidGlassCursor = () => {
  const isTouch = useIsTouchDevice();

  // SSR or not-yet-detected: render nothing
  // Touch device: render nothing
  if (isTouch === null || isTouch) return null;

  return <LiquidGlassCursorInner />;
};
