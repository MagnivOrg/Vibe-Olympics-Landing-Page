"use client";

import { useCallback, useEffect, useState } from "react";

const MINIMUM_DISPLAY_MS = 1200;

/**
 * Manages the preloader lifecycle:
 *
 * 1. `isLoading` starts `true` — the preloader overlay is visible.
 * 2. After hydration completes **and** a minimum display time has elapsed,
 *    `isLoading` becomes `false` and the preloader fades out.
 * 3. `isDismissed` becomes `true` after the fade-out transition finishes,
 *    signalling that heavy decorative components can begin initialising.
 *
 * This two-phase approach prevents the user from seeing a flash of
 * un-animated content while still deferring expensive work (particles,
 * cursor effects) until the preloader is fully gone.
 */
export const usePreloader = (fadeOutDurationMs = 600) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const start = performance.now();

    const finish = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, MINIMUM_DISPLAY_MS - elapsed);

      setTimeout(() => {
        setIsLoading(false);

        // Wait for the CSS fade-out transition to complete before
        // marking the preloader as fully dismissed.
        setTimeout(() => {
          setIsDismissed(true);
        }, fadeOutDurationMs);
      }, remaining);
    };

    // If the document is already fully loaded (cached visit / fast
    // connection), resolve immediately subject to minimum display time.
    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      return () => window.removeEventListener("load", finish);
    }
  }, [fadeOutDurationMs]);

  const dismiss = useCallback(() => {
    setIsLoading(false);
    setTimeout(() => setIsDismissed(true), fadeOutDurationMs);
  }, [fadeOutDurationMs]);

  return { isLoading, isDismissed, dismiss } as const;
};
