"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

import { LazyMotionProvider } from "@/components/LazyMotionProvider";
import { Preloader } from "@/components/Preloader";
import { usePreloader } from "@/components/Preloader/hooks/usePreloader";

/**
 * Dynamically import heavy decorative components so they are code-split
 * out of the initial bundle. `ssr: false` ensures they only load on the
 * client (they rely on browser APIs like requestAnimationFrame / mousemove).
 *
 * The `loading` prop returns `null` — the preloader covers the gap.
 */
const FloatingEmojis = dynamic(
  () => import("@/components/FloatingEmojis").then((mod) => mod.FloatingEmojis),
  { ssr: false, loading: () => null },
);

interface ClientShellProps {
  children: ReactNode;
}

/**
 * Client-side shell that wraps the entire app with:
 *
 * 1. **LazyMotionProvider** — Loads only `domAnimation` features (~5kb)
 *    instead of the full framer-motion bundle (~34kb).
 *
 * 2. **Preloader** — CSS-only Olympic rings animation displayed instantly.
 *    Covers the page until hydration + minimum display time completes,
 *    masking any layout shifts or animation stutter.
 *
 * 3. **Deferred decorative layers** — `FloatingEmojis` is dynamically imported
 *    and only mounted once the preloader starts its
 *    fade-out (`!isLoading`). This lets them initialise behind the fading
 *    overlay so they're ready by the time the user sees the content — closing
 *    the gap between "preloader gone" and "site fully interactive".
 *
 * Previously these layers waited until `isDismissed` (after the fade
 * finished), which added an extra 400-600ms of dead time before
 * decorative elements appeared. Now the fade itself covers their init.
 */
export const ClientShell = ({ children }: ClientShellProps) => {
  const { isLoading, isDismissed } = usePreloader(400);

  return (
    <LazyMotionProvider>
      <Preloader isLoading={isLoading} isDismissed={isDismissed} />

      {/* Main content renders immediately (under the preloader overlay) so
          the browser can start painting it in the background. */}
      {children}

      {/* Heavy decorative layers — mount as soon as the preloader starts
          fading out so their initialisation happens behind the overlay.
          By the time the fade completes they're already running. */}
      {!isLoading && <FloatingEmojis />}
    </LazyMotionProvider>
  );
};
