"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

interface CursorState {
  isHovering: boolean;
  isPressed: boolean;
  isOverInteractive: boolean;
}

export const LiquidGlassCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>({
    isHovering: false,
    isPressed: false,
    isOverInteractive: false,
  });

  // Spring configuration for liquid-like fluid motion - slower for bigger blob
  const springConfig = { damping: 15, stiffness: 150, mass: 0.8 };
  const slowSpringConfig = { damping: 25, stiffness: 100, mass: 1.2 };
  const blobSpringConfig = { damping: 12, stiffness: 80, mass: 1.5 };

  // Cursor position with spring physics
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring-animated position for the glass effect
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  // Even smoother position for the outer glow (creates trailing effect)
  const trailX = useSpring(cursorX, slowSpringConfig);
  const trailY = useSpring(cursorY, slowSpringConfig);

  // Blob layer - extra smooth for organic feel
  const blobX = useSpring(cursorX, blobSpringConfig);
  const blobY = useSpring(cursorY, blobSpringConfig);

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
    // Hide default cursor
    document.body.style.cursor = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", checkInteractiveElement);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.body.style.cursor = "auto";
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

  // Don't render on touch devices
  useEffect(() => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      document.body.style.cursor = "auto";
      setIsVisible(false);
    }
  }, []);

  return (
    <motion.div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Outermost blob layer - very soft trailing glow */}
      <motion.div
        className="absolute"
        style={{
          x: blobX,
          y: blobY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="w-48 h-48 rounded-full"
          style={{
            scale,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
      </motion.div>

      {/* Outer trailing glow - creates the liquid feel */}
      <motion.div
        className="absolute"
        style={{
          x: trailX,
          y: trailY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="w-32 h-32 rounded-full"
          style={{
            scale,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      </motion.div>

      {/* Main glass cursor blob */}
      <motion.div
        className="absolute"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="relative"
          style={{ scale }}
          transition={{ type: "spring", damping: 18, stiffness: 300 }}
        >
          {/* Main glass blob container */}
          <motion.div
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

            {/* Top highlight - glass reflection */}
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

            {/* Chromatic aberration effect - subtle color fringing */}
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
          </motion.div>

          {/* Center dot indicator */}
          <motion.div
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
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Liquid trail particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            x: useSpring(cursorX, {
              damping: 20 + i * 4,
              stiffness: 120 - i * 25,
              mass: 0.4 + i * 0.3,
            }),
            y: useSpring(cursorY, {
              damping: 20 + i * 4,
              stiffness: 120 - i * 25,
              mass: 0.4 + i * 0.3,
            }),
            translateX: "-50%",
            translateY: "-50%",
          }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: `${10 - i * 2}px`,
              height: `${10 - i * 2}px`,
              background: `rgba(255,255,255,${0.2 - i * 0.04})`,
              filter: "blur(1px)",
              boxShadow: `0 0 ${8 - i * 2}px rgba(255,255,255,${0.15 - i * 0.03})`,
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
