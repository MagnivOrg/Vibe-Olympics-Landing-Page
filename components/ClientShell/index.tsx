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

const LiquidGlassCursor = dynamic(
  () =>
    import("@/components/LiquidGlassCursor").then(
      (mod) => mod.LiquidGlassCursor,
    ),
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
 * 3. **Deferred decorative layers** — `FloatingEmojis` and `LiquidGlassCursor`
 *    are dynamically imported AND only mounted after the preloader has fully
 *    dismissed (`isDismissed`). This ensures the main thread is free for
 *    the hero content to paint first, then expensive particle systems and
 *    cursor springs initialise once the user is already seeing content.
 */
export const ClientShell = ({ children }: ClientShellProps) => {
  const { isLoading, isDismissed } = usePreloader(600);

  return (
    <LazyMotionProvider>
      <Preloader isLoading={isLoading} isDismissed={isDismissed} />

      {/* Main content renders immediately (under the preloader overlay) so
          the browser can start painting it in the background. */}
      {children}

      {/* Heavy decorative layers — only mount after preloader is fully gone
          so their initialisation doesn't compete with the hero paint. */}
      {isDismissed && (
        <>
          <LiquidGlassCursor />
          <FloatingEmojis />
        </>
      )}
    </LazyMotionProvider>
  );
};
