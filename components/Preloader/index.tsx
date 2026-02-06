"use client";

import { useEffect, useRef } from "react";

interface PreloaderProps {
  isLoading: boolean;
  isDismissed: boolean;
}

/**
 * Full-screen preloader overlay with a pure-CSS Olympic rings animation.
 *
 * Key design decisions:
 * - Zero framer-motion dependency — CSS keyframes only, so it renders
 *   and animates before any JS bundle has finished parsing.
 * - `opacity` + `visibility` transition for the fade-out so the element
 *   is removed from the accessibility tree once hidden.
 * - `will-change: opacity` for a compositor-only fade (no repaints).
 * - The ring draw-on uses `stroke-dasharray` / `stroke-dashoffset`
 *   which is GPU-friendly and avoids layout thrashing.
 * - The glow effect lives on a **separate SVG layer** behind the rings,
 *   using a pre-computed Gaussian blur filter. Only `opacity` is animated
 *   on the glow layer — a compositor-only property — so the breathing
 *   effect is silky smooth with zero repaint cost.
 * - Once fully dismissed the component returns `null` to free DOM nodes.
 */
export const Preloader = ({ isLoading, isDismissed }: PreloaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll while preloader is visible
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  // Once dismissed, remove from DOM entirely
  if (isDismissed) return null;

  return (
    <>
      {/* Inline styles so the animation works even before Tailwind CSS is parsed */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes ring-draw {
              0%   { stroke-dashoffset: 283; opacity: 0; }
              20%  { opacity: 1; }
              100% { stroke-dashoffset: 0; opacity: 1; }
            }

            @keyframes glow-enter {
              0%   { opacity: 0; }
              100% { opacity: 1; }
            }

            @keyframes glow-breathe {
              0%   { opacity: 0.25; }
              10%  { opacity: 0.3; }
              25%  { opacity: 0.5; }
              40%  { opacity: 0.75; }
              50%  { opacity: 0.85; }
              60%  { opacity: 0.75; }
              75%  { opacity: 0.5; }
              90%  { opacity: 0.3; }
              100% { opacity: 0.25; }
            }

            @keyframes preloader-text-fade {
              0%   { opacity: 0; transform: translateY(8px); }
              100% { opacity: 1; transform: translateY(0); }
            }

            @keyframes dot-bounce {
              0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
              40%            { opacity: 1;   transform: scale(1.2); }
            }

            .preloader-overlay {
              position: fixed;
              inset: 0;
              z-index: 99999;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background-color: #050505;
              will-change: opacity;
              transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                          visibility 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .preloader-overlay[data-hidden="true"] {
              opacity: 0;
              visibility: hidden;
              pointer-events: none;
            }

            /* ── Main ring circles (crisp, no filter) ── */

            .preloader-rings .ring-main {
              fill: none;
              stroke-width: 3.5;
              stroke-dasharray: 283;
              stroke-dashoffset: 283;
              stroke-linecap: round;
            }

            .preloader-rings .ring-blue-main {
              stroke: #0085C7;
              animation: ring-draw 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
            }
            .preloader-rings .ring-black-main {
              stroke: #444444;
              animation: ring-draw 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
            }
            .preloader-rings .ring-red-main {
              stroke: #DF0024;
              animation: ring-draw 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
            }
            .preloader-rings .ring-yellow-main {
              stroke: #F4C300;
              animation: ring-draw 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards;
            }
            .preloader-rings .ring-green-main {
              stroke: #009F3D;
              animation: ring-draw 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.35s forwards;
            }

            /* ── Glow layer (blurred duplicate circles behind the main rings) ──
             *
             * Each glow group uses a pre-computed SVG Gaussian blur filter.
             * Only 'opacity' is animated — a compositor-only property —
             * so breathing costs zero repaints. The glow first eases in
             * via glow-enter, then loops with the slow glow-breathe cycle.
             */

            .preloader-rings .glow-group {
              opacity: 0;
              will-change: opacity;
            }

            .preloader-rings .glow-group circle {
              fill: none;
              stroke-width: 5;
              stroke-linecap: round;
            }

            .glow-blue {
              animation:
                glow-enter 1.2s cubic-bezier(0.33, 0, 0.2, 1) 0.7s forwards,
                glow-breathe 4s cubic-bezier(0.37, 0, 0.63, 1) 1.9s infinite;
            }
            .glow-black {
              animation:
                glow-enter 1.2s cubic-bezier(0.33, 0, 0.2, 1) 0.8s forwards,
                glow-breathe 4s cubic-bezier(0.37, 0, 0.63, 1) 2.0s infinite;
            }
            .glow-red {
              animation:
                glow-enter 1.2s cubic-bezier(0.33, 0, 0.2, 1) 0.9s forwards,
                glow-breathe 4s cubic-bezier(0.37, 0, 0.63, 1) 2.1s infinite;
            }
            .glow-yellow {
              animation:
                glow-enter 1.2s cubic-bezier(0.33, 0, 0.2, 1) 0.85s forwards,
                glow-breathe 4s cubic-bezier(0.37, 0, 0.63, 1) 2.05s infinite;
            }
            .glow-green {
              animation:
                glow-enter 1.2s cubic-bezier(0.33, 0, 0.2, 1) 0.95s forwards,
                glow-breathe 4s cubic-bezier(0.37, 0, 0.63, 1) 2.15s infinite;
            }

            /* ── Loading text ── */

            .preloader-text {
              margin-top: 32px;
              font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
                "SF Pro Text", "Inter", sans-serif;
              font-size: 14px;
              font-weight: 500;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              color: rgba(255, 255, 255, 0.4);
              animation: preloader-text-fade 0.6s ease-out 0.6s both;
              display: flex;
              align-items: center;
              gap: 2px;
            }

            .preloader-dot {
              display: inline-block;
              width: 4px;
              height: 4px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.4);
              margin-left: 2px;
              animation: dot-bounce 1.4s ease-in-out infinite;
            }

            .preloader-dot:nth-child(2) { animation-delay: 0.16s; }
            .preloader-dot:nth-child(3) { animation-delay: 0.32s; }
          `,
        }}
      />

      <div
        ref={containerRef}
        className="preloader-overlay"
        data-hidden={!isLoading}
        aria-live="polite"
        aria-busy={isLoading}
        role="status"
      >
        {/* Olympic rings — drawn with SVG stroke animation */}
        <svg
          className="preloader-rings"
          width="200"
          height="100"
          viewBox="0 0 200 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* SVG filter for the glow blur — computed once, reused per ring */}
          <defs>
            <filter
              id="preloader-glow-blur"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/*
           * Glow layer — sits behind the main rings.
           * Each ring's glow is in its own <g> so we can animate opacity
           * independently (staggered breathing). The blur filter is applied
           * once by the GPU; only opacity changes per frame.
           */}
          <g
            className="glow-group glow-blue"
            filter="url(#preloader-glow-blur)"
          >
            <circle cx="45" cy="38" r="22" stroke="#0085C7" />
          </g>
          <g
            className="glow-group glow-black"
            filter="url(#preloader-glow-blur)"
          >
            <circle cx="100" cy="38" r="22" stroke="#444444" />
          </g>
          <g className="glow-group glow-red" filter="url(#preloader-glow-blur)">
            <circle cx="155" cy="38" r="22" stroke="#DF0024" />
          </g>
          <g
            className="glow-group glow-yellow"
            filter="url(#preloader-glow-blur)"
          >
            <circle cx="72.5" cy="58" r="22" stroke="#F4C300" />
          </g>
          <g
            className="glow-group glow-green"
            filter="url(#preloader-glow-blur)"
          >
            <circle cx="127.5" cy="58" r="22" stroke="#009F3D" />
          </g>

          {/* Main ring layer — crisp strokes, no filter overhead */}
          <circle className="ring-main ring-blue-main" cx="45" cy="38" r="22" />
          <circle
            className="ring-main ring-black-main"
            cx="100"
            cy="38"
            r="22"
          />
          <circle className="ring-main ring-red-main" cx="155" cy="38" r="22" />
          <circle
            className="ring-main ring-yellow-main"
            cx="72.5"
            cy="58"
            r="22"
          />
          <circle
            className="ring-main ring-green-main"
            cx="127.5"
            cy="58"
            r="22"
          />
        </svg>

        {/* Loading text with animated dots */}
        <div className="preloader-text">
          <span>Loading</span>
          <span className="preloader-dot" />
          <span className="preloader-dot" />
          <span className="preloader-dot" />
        </div>
      </div>
    </>
  );
};
