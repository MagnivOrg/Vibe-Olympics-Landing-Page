"use client";

import { useEffect, useState } from "react";

/**
 * Detects whether the current device is primarily touch-based.
 * Uses `(hover: none)` media query with a fallback to `ontouchstart` /
 * `maxTouchPoints` for older browsers.
 *
 * Returns `null` during SSR / before hydration so callers can
 * distinguish "not yet known" from "definitely not touch".
 */
export const useIsTouchDevice = (): boolean | null => {
  const [isTouch, setIsTouch] = useState<boolean | null>(null);

  useEffect(() => {
    // Prefer the media-query approach — it reflects the *primary* input
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");

    const update = () => {
      setIsTouch(
        mq.matches ||
          "ontouchstart" in window ||
          navigator.maxTouchPoints > 0,
      );
    };

    update();

    // Listen for changes (e.g. desktop ↔ tablet mode on convertibles)
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isTouch;
};
