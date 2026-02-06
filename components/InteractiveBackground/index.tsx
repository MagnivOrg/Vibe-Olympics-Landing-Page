"use client";

import { m, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { useIsTouchDevice } from "@/components/hooks/useIsTouchDevice";

// Spring configuration for Apple-like fluid motion
const SPRING_CONFIG = { damping: 25, stiffness: 150, mass: 0.5 };
const SLOW_SPRING_CONFIG = { damping: 40, stiffness: 90, mass: 1 };

export const InteractiveBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isTouch = useIsTouchDevice();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mouse position with spring physics
  const mouseX = useSpring(0.5, SPRING_CONFIG);
  const mouseY = useSpring(0.5, SPRING_CONFIG);

  // Slower springs for parallax layers
  const slowMouseX = useSpring(0.5, SLOW_SPRING_CONFIG);
  const slowMouseY = useSpring(0.5, SLOW_SPRING_CONFIG);

  // Transform mouse position to parallax offsets
  const orbOffset1X = useTransform(slowMouseX, [0, 1], [-30, 30]);
  const orbOffset1Y = useTransform(slowMouseY, [0, 1], [-30, 30]);
  const orbOffset2X = useTransform(slowMouseX, [0, 1], [20, -20]);
  const orbOffset2Y = useTransform(slowMouseY, [0, 1], [20, -20]);
  const orbOffset3X = useTransform(slowMouseX, [0, 1], [-15, 15]);
  const orbOffset3Y = useTransform(slowMouseY, [0, 1], [25, -25]);

  // Cursor glow position
  const glowX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(mouseY, [0, 1], ["0%", "100%"]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      mouseX.set(x);
      mouseY.set(y);
      slowMouseX.set(x);
      slowMouseY.set(y);
    },
    [mouseX, mouseY, slowMouseX, slowMouseY],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    // Smoothly return to center
    mouseX.set(0.5);
    mouseY.set(0.5);
    slowMouseX.set(0.5);
    slowMouseY.set(0.5);
  }, [mouseX, mouseY, slowMouseX, slowMouseY]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isTouch) return;

    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, isTouch]);

  const showCursorGlow = !isTouch && isHovering;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ isolation: "isolate", contain: "layout style paint" }}
    >
      {/* YouTube video background — rendered only after mount to avoid hydration mismatch */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          opacity: isMounted ? 1 : 0,
          transition: "opacity 1.5s ease-in-out",
        }}
      >
        {isMounted && (
          <iframe
            src="https://www.youtube.com/embed/c-sFWDzvgyw?autoplay=1&mute=1&loop=1&playlist=c-sFWDzvgyw&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3"
            title="Background video"
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0 pointer-events-none scale-[1.4]"
            style={{
              aspectRatio: "16/9",
              width: "177.78vh",
              minWidth: "100%",
              minHeight: "100%",
            }}
          />
        )}
        {/* Dark overlay to keep text readable */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Base grid background */}
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Interactive gradient orbs with parallax
          Mobile: smaller sizes + reduced blur for GPU performance
          Desktop: full-size orbs with heavy blur
          CSS containment via `contain: strict` isolates each orb's
          compositing layer so blur repaints don't cascade. */}
      <m.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.12, scale: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        style={isTouch ? undefined : { x: orbOffset1X, y: orbOffset1Y }}
        className="absolute top-1/3 left-1/4 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#0085C7] rounded-full blur-[80px] md:blur-[150px] will-change-transform"
      />
      <m.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.12, scale: 1 }}
        transition={{ duration: 2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={isTouch ? undefined : { x: orbOffset2X, y: orbOffset2Y }}
        className="absolute top-1/3 right-1/4 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#DF0024] rounded-full blur-[80px] md:blur-[150px] will-change-transform"
      />
      <m.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={isTouch ? undefined : { x: orbOffset3X, y: orbOffset3Y }}
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-[#F4C300] rounded-full blur-[80px] md:blur-[150px] will-change-transform"
      />

      {/* Cursor-following layers — desktop only, skipped entirely on touch */}
      {!isTouch && (
        <>
          {/* Subtle cursor-following ambient glow */}
          <m.div
            className="absolute pointer-events-none will-change-transform"
            style={{
              left: glowX,
              top: glowY,
              translateX: "-50%",
              translateY: "-50%",
              contain: "layout style paint",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: showCursorGlow ? 1 : 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Primary soft glow */}
            <div
              className="w-[400px] h-[400px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 40%, transparent 70%)",
              }}
            />
          </m.div>

          {/* Secondary subtle highlight ring */}
          <m.div
            className="absolute pointer-events-none will-change-transform"
            style={{
              left: glowX,
              top: glowY,
              translateX: "-50%",
              translateY: "-50%",
              contain: "layout style paint",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: showCursorGlow ? 1 : 0,
              scale: showCursorGlow ? 1 : 0.8,
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="w-[600px] h-[600px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, transparent 0%, transparent 30%, rgba(255,255,255,0.008) 50%, transparent 70%)",
              }}
            />
          </m.div>

          {/* Ambient color tint that follows cursor */}
          <m.div
            className="absolute pointer-events-none will-change-transform mix-blend-soft-light"
            style={{
              left: glowX,
              top: glowY,
              translateX: "-50%",
              translateY: "-50%",
              contain: "layout style paint",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: showCursorGlow ? 1 : 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="w-[800px] h-[800px] rounded-full blur-[100px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(0,133,199,0.08) 0%, rgba(244,195,0,0.05) 50%, transparent 70%)",
              }}
            />
          </m.div>
        </>
      )}

      {/* Noise texture overlay */}
      <div className="absolute inset-0 noise pointer-events-none" />
    </div>
  );
};
