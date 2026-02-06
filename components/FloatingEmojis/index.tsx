"use client";

import { useCallback, useEffect, useRef } from "react";

import { useIsTouchDevice } from "@/components/hooks/useIsTouchDevice";

/**
 * Deduplicated & trimmed emoji palette.
 * Keeping ~100 unique entries is plenty for visual variety while reducing
 * the static array cost and keeping the module lighter.
 */
const VIBE_EMOJIS = [
  "✨",
  "🎨",
  "🚀",
  "💫",
  "🎯",
  "⚡",
  "🔥",
  "💎",
  "🌟",
  "🎪",
  "🌈",
  "🎵",
  "🎶",
  "🎉",
  "🎊",
  "🌺",
  "🌸",
  "🌼",
  "🌻",
  "🦋",
  "🐚",
  "🍀",
  "🌙",
  "☀️",
  "🌊",
  "🎭",
  "🎸",
  "🎹",
  "🎺",
  "🎷",
  "🥁",
  "🎤",
  "🎬",
  "📸",
  "🎮",
  "🕹️",
  "🎲",
  "🧩",
  "🪁",
  "🎈",
  "🎀",
  "🎁",
  "🏆",
  "🥇",
  "🏅",
  "👑",
  "💖",
  "💗",
  "💞",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🌀",
  "🕺",
  "💃",
  "🪩",
  "🎼",
  "🎧",
  "🔮",
  "🪄",
  "🌌",
  "🦚",
  "🦜",
  "🦩",
  "🐬",
  "🐳",
  "🦄",
  "🐉",
  "🍉",
  "🍊",
  "🍋",
  "🍍",
  "🍑",
  "🍒",
  "🍓",
  "🍭",
  "🍩",
  "🧁",
  "🎂",
  "🍦",
  "☕",
  "🥂",
  "🍾",
  "🏄",
  "🏂",
  "🛹",
  "🛸",
  "⛵",
  "🥳",
  "🤩",
  "😎",
  "🤪",
  "🫠",
  "💯",
  "⭐",
  "💥",
  "🎆",
];

interface ParticleData {
  x: number;
  y: number;
  restX: number;
  restY: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  /** Final resting opacity once fully entered. */
  targetOpacity: number;
  side: "left" | "right";
  phase: number;
  wobbleSpeed: number;
  wobbleAmpX: number;
  wobbleAmpY: number;
  floatSpeed: number;

  // ── Entrance animation state ──
  /** 0 → 1 progress through the entrance animation. */
  entranceProgress: number;
  /** Normalised-frame delay before this particle begins its entrance. */
  entranceDelay: number;
  /** Normalised-frame duration of the entrance tween. */
  entranceDuration: number;
  /** Cumulative normalised frames elapsed since the particle was created. */
  age: number;
}

// ============ TWEAK THESE VALUES ============
const PARTICLE_COUNT_DESKTOP = 80;
const PARTICLE_COUNT_MOBILE = 30;
const COLUMN_WIDTH_PERCENT = 18;

// Cursor interaction
const CURSOR_INFLUENCE_RADIUS = 25;
const CURSOR_PUSH_STRENGTH = 0.8;

// Velocity damping after cursor push — heavy for Apple-like deceleration
const VELOCITY_DAMPING = 0.9;

// Exponential ease-back speed (0–1). Higher = faster return, no oscillation.
// ~0.08 gives a smooth ≈1.5 s critically-damped glide back.
const EASE_BACK_SPEED = 0.08;

// Base upward float speed (vh per normalised frame)
const FLOAT_SPEED_BASE = 0.028;
const FLOAT_SPEED_VARIANCE = 0.012;

// ── Entrance tuning ──
// Total stagger window (normalised frames). Particles are randomly assigned
// a delay within [0, ENTRANCE_STAGGER_WINDOW]. At 60 fps one normalised
// frame ≈ 16.67 ms, so 90 frames ≈ 1.5 s total stagger spread.
const ENTRANCE_STAGGER_WINDOW = 90;
// How long each individual particle takes to fully fade/scale in.
// ~48 frames ≈ 0.8 s at 60 fps.
const ENTRANCE_DURATION = 48;
// How many vh the particle drifts upward from below its rest during entrance.
const ENTRANCE_DRIFT_VH = 6;
// Starting scale factor (grows to 1.0).
const ENTRANCE_SCALE_START = 0.45;
// ============================================

/** Deceleration ease-out: `1 - (1 - t)^3` */
const cubicOut = (t: number): number => {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
};

const createParticleData = (id: number, _initialY?: number): ParticleData => {
  const side: "left" | "right" = id % 2 === 0 ? "left" : "right";
  const baseX =
    side === "left"
      ? Math.random() * COLUMN_WIDTH_PERCENT
      : 100 - COLUMN_WIDTH_PERCENT + Math.random() * COLUMN_WIDTH_PERCENT;

  const yPos = _initialY ?? Math.random() * 100;

  return {
    x: baseX,
    y: yPos,
    restX: baseX,
    restY: yPos,
    vx: 0,
    vy: 0,
    size: 16 + Math.random() * 14,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 0.15,
    targetOpacity: 0.3 + Math.random() * 0.5,
    side,
    phase: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.0006 + Math.random() * 0.0012,
    wobbleAmpX: 1.0 + Math.random() * 2.0,
    wobbleAmpY: 0.5 + Math.random() * 1.0,
    floatSpeed: FLOAT_SPEED_BASE + (Math.random() - 0.5) * FLOAT_SPEED_VARIANCE,

    // Entrance state — each particle gets a random delay so they don't
    // all pop in at the same frame.
    entranceProgress: 0,
    entranceDelay: Math.random() * ENTRANCE_STAGGER_WINDOW,
    entranceDuration: ENTRANCE_DURATION,
    age: 0,
  };
};

export const FloatingEmojis = () => {
  const isTouch = useIsTouchDevice();
  const containerRef = useRef<HTMLDivElement>(null);
  const particleEls = useRef<HTMLDivElement[]>([]);
  const particleData = useRef<ParticleData[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const initializedRef = useRef(false);

  const particleCount =
    isTouch === null
      ? 0 // Don't render anything during SSR / before hydration
      : isTouch
        ? PARTICLE_COUNT_MOBILE
        : PARTICLE_COUNT_DESKTOP;

  // Build the DOM elements once, imperatively
  const initParticles = useCallback(() => {
    const container = containerRef.current;
    if (!container || initializedRef.current || particleCount === 0) return;
    initializedRef.current = true;

    particleData.current = [];
    particleEls.current = [];

    for (let i = 0; i < particleCount; i++) {
      const data = createParticleData(i);
      particleData.current.push(data);

      const el = document.createElement("div");
      el.className = "absolute will-change-transform";
      el.style.left = `${data.x}vw`;
      el.style.top = `${data.y}vh`;
      el.style.fontSize = `${data.size}px`;
      // Start invisible & scaled down — the animation loop will ease them in.
      el.style.opacity = "0";
      el.style.transform = `rotate(${data.rotation}deg) scale(${ENTRANCE_SCALE_START})`;
      el.textContent =
        VIBE_EMOJIS[Math.floor(Math.random() * VIBE_EMOJIS.length)];

      container.appendChild(el);
      particleEls.current.push(el);
    }
  }, [particleCount]);

  // Animation loop — mutates refs + DOM directly, zero React re-renders
  const animate = useCallback(
    (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = Math.min(
        (currentTime - lastTimeRef.current) / 16.67,
        3,
      );
      lastTimeRef.current = currentTime;
      timeRef.current += deltaTime;

      const t = timeRef.current;
      const particles = particleData.current;
      const els = particleEls.current;
      const mouse = mouseRef.current;
      const trackMouse = !isTouch && mouse;

      // Frame-rate-independent exponential ease factor (critically damped, no oscillation)
      const easeFactor = 1 - Math.pow(1 - EASE_BACK_SPEED, deltaTime);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // ── 0. Advance entrance animation ──
        p.age += deltaTime;

        if (p.entranceProgress < 1) {
          // Haven't started yet (still in stagger delay)?
          if (p.age < p.entranceDelay) {
            // Particle stays invisible — skip expensive position work.
            continue;
          }

          // How far through the entrance tween are we?
          const rawProgress = Math.min(
            (p.age - p.entranceDelay) / p.entranceDuration,
            1,
          );
          p.entranceProgress = cubicOut(rawProgress);
        }

        const ep = p.entranceProgress; // 0 → 1

        // ── 1. Advance the rest position (continuous upward float) ──
        p.restY -= p.floatSpeed * deltaTime;

        // Vertical wrap — when rest drifts off top, reappear at bottom.
        // Snap particle directly to new rest so there's no distance gap
        // that would cause the ease to drag it rapidly across the screen.
        if (p.restY < -5) {
          p.restY += 110;
          p.y = p.restY;
          p.vx = 0;
          p.vy = 0;
        }

        // ── 2. Compute target = rest + gentle wobble ──
        const wobbleX = Math.sin(t * p.wobbleSpeed + p.phase) * p.wobbleAmpX;
        const wobbleY =
          Math.cos(t * p.wobbleSpeed * 0.7 + p.phase + 1.3) * p.wobbleAmpY;

        let targetX = p.restX + wobbleX;
        const targetY = p.restY + wobbleY;

        // Clamp target within column boundaries
        const minX = p.side === "left" ? 0 : 100 - COLUMN_WIDTH_PERCENT;
        const maxX = p.side === "left" ? COLUMN_WIDTH_PERCENT : 100;
        targetX = Math.max(minX, Math.min(maxX, targetX));

        // ── 3. Cursor repulsion → velocity impulse (desktop only) ──
        if (trackMouse) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CURSOR_INFLUENCE_RADIUS && distance > 0.5) {
            const falloff = 1 - distance / CURSOR_INFLUENCE_RADIUS;
            const force = CURSOR_PUSH_STRENGTH * falloff * falloff * falloff;
            p.vx += (dx / distance) * force;
            p.vy += (dy / distance) * force;
          }
        }

        // ── 4. Apply velocity (from cursor push) and damp heavily ──
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;

        p.vx *= Math.pow(VELOCITY_DAMPING, deltaTime);
        p.vy *= Math.pow(VELOCITY_DAMPING, deltaTime);

        // Zero out negligible velocity to avoid micro-drift
        if (Math.abs(p.vx) < 0.0001) p.vx = 0;
        if (Math.abs(p.vy) < 0.0001) p.vy = 0;

        // ── 5. Exponential ease toward target (critically damped return) ──
        p.x += (targetX - p.x) * easeFactor;
        p.y += (targetY - p.y) * easeFactor;

        // ── 6. Boundary safety (soft clamp — never teleport to opposite edge) ──
        if (p.x < minX) p.x = minX;
        else if (p.x > maxX) p.x = maxX;

        if (p.y < -10) p.y = -10;
        else if (p.y > 110) p.y = 110;

        // ── 7. Smooth rotation ──
        p.rotation += p.rotationSpeed * deltaTime;

        // ── 8. Entrance modifiers ──
        // Drift: during entrance the particle rises from slightly below its
        // natural position, blending the offset out as ep approaches 1.
        const driftOffset = (1 - ep) * ENTRANCE_DRIFT_VH;

        // Scale: grows from ENTRANCE_SCALE_START to 1.0
        const scale = ENTRANCE_SCALE_START + (1 - ENTRANCE_SCALE_START) * ep;

        // Opacity: ramps from 0 to targetOpacity
        const opacity = p.targetOpacity * ep;

        // ── 9. Write to DOM ──
        const el = els[i];
        el.style.left = `${p.x}vw`;
        el.style.top = `${p.y + driftOffset}vh`;
        el.style.transform = `rotate(${p.rotation}deg) scale(${scale})`;
        el.style.opacity = String(opacity);
      }

      animationRef.current = requestAnimationFrame(animate);
    },
    [isTouch],
  );

  // Lifecycle: init particles & start animation
  useEffect(() => {
    if (particleCount === 0) return;

    initParticles();

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [particleCount, initParticles, animate]);

  // Mouse tracking (desktop only)
  useEffect(() => {
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isTouch]);

  // Cleanup DOM nodes on unmount
  useEffect(
    () => () => {
      const container = containerRef.current;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
      particleEls.current = [];
      particleData.current = [];
      initializedRef.current = false;
    },
    [],
  );

  // Nothing to show during SSR or before detection finishes
  if (isTouch === null) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      style={{ contain: "layout style paint size" }}
    />
  );
};
