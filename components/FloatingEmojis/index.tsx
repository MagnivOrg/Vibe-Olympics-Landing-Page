"use client";

import { useCallback, useEffect, useRef } from "react";

import { useIsTouchDevice } from "@/components/hooks/useIsTouchDevice";

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
  "💝",
  "💖",
  "💗",
  "💓",
  "💞",
  "💕",
  "💘",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🤎",
  "🖤",
  "🤍",
  "☮️",
  "☯️",
  "🕉️",
  "☪️",
  "🔯",
  "🪬",
  "🧿",
  "🌀",
  "🎐",
  "🎏",
  "🎎",
  "🧘",
  "🕺",
  "💃",
  "🪩",
  "🎼",
  "🎧",
  "🎛️",
  "🎚️",
  "📻",
  "🔮",
  "🪄",
  "🌌",
  "🌃",
  "🌆",
  "🌇",
  "🌉",
  "🗼",
  "🎢",
  "🎡",
  "🎠",
  "⛱️",
  "🏖️",
  "🏝️",
  "🦚",
  "🦜",
  "🦩",
  "🐠",
  "🐟",
  "🐬",
  "🐳",
  "🦄",
  "🐉",
  "🦖",
  "🍇",
  "🍉",
  "🍊",
  "🍋",
  "🍌",
  "🍍",
  "🥭",
  "🍑",
  "🍒",
  "🍓",
  "🫐",
  "🥝",
  "🍿",
  "🍭",
  "🍬",
  "🍫",
  "🍩",
  "🍪",
  "🧁",
  "🍰",
  "🎂",
  "🍨",
  "🍦",
  "🍧",
  "🥤",
  "🧃",
  "🧋",
  "🍹",
  "🍸",
  "☕",
  "🍵",
  "🧉",
  "🥂",
  "🍾",
  "🏄",
  "🏂",
  "🪂",
  "🧗",
  "🚴",
  "🛹",
  "🛼",
  "✈️",
  "🚁",
  "🛸",
  "🛶",
  "⛵",
  "🚤",
  "⛰️",
  "🏔️",
  "🗻",
  "🏕️",
  "⛺",
  "🏞️",
  "🌋",
  "💀",
  "👻",
  "🤡",
  "🤠",
  "🥳",
  "🤩",
  "😭",
  "😎",
  "🤪",
  "🫠",
  "🫡",
  "🫣",
  "🫢",
  "🫥",
  "🥺",
  "🤌",
  "🫰",
  "🤙",
  "🫶",
  "💅",
  "🧠",
  "👁️",
  "🦷",
  "🦴",
  "👄",
  "🧃",
  "🌮",
  "🌯",
  "🥑",
  "🥤",
  "🧋",
  "💯",
  "🔥",
  "⭐",
  "🌠",
  "💥",
  "🎇",
  "🎆",
  "🌤️",
  "⛅",
  "🌥️",
  "☁️",
  "🌦️",
  "🌧️",
  "⛈️",
  "🌩️",
  "🌨️",
  "❄️",
  "⛄",
  "☃️",
  "🌬️",
  "💨",
  "🌪️",
  "🌫️",
  "🌍",
  "🌎",
  "🌏",
  "🌐",
  "🗾",
  "🧭",
  "🏔️",
  "⛰️",
  "🌋",
  "🗻",
  "🏕️",
  "🏖️",
  "🏜️",
  "🏝️",
  "🏞️",
  "🏟️",
  "🏛️",
  "🏗️",
  "🧱",
  "🪨",
  "🪵",
  "🛖",
  "🏘️",
  "🏚️",
  "🏠",
  "🏡",
  "🏢",
  "🏣",
  "🏤",
  "🏥",
  "🏦",
  "🏨",
  "🏩",
  "🏪",
  "🏫",
  "🏬",
  "🏭",
  "🏯",
  "🏰",
  "💒",
  "🗼",
  "🗽",
  "⛪",
  "🕌",
  "🛕",
  "🕍",
  "⛩️",
  "🕋",
  "⛲",
  "⛺",
  "🌁",
  "🌃",
  "🏙️",
  "🌄",
  "🌅",
  "🌆",
  "🌇",
  "🌉",
  "♨️",
  "🎠",
  "🎡",
  "🎢",
  "💈",
  "🎪",
  "🚂",
  "🚃",
  "🚄",
  "🚅",
  "🚆",
  "🚇",
  "🚈",
  "🚉",
  "🚊",
  "🚝",
  "🚞",
  "🚋",
  "🚌",
  "🚍",
  "🚎",
  "🚐",
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
  opacity: number;
  side: "left" | "right";
  phase: number;
  wobbleSpeed: number;
  wobbleAmpX: number;
  wobbleAmpY: number;
  floatSpeed: number;
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
// ============================================

const createParticleData = (id: number, initialY?: number): ParticleData => {
  const side: "left" | "right" = id % 2 === 0 ? "left" : "right";
  const baseX =
    side === "left"
      ? Math.random() * COLUMN_WIDTH_PERCENT
      : 100 - COLUMN_WIDTH_PERCENT + Math.random() * COLUMN_WIDTH_PERCENT;

  const yPos = initialY ?? Math.random() * 100;

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
    opacity: 0.3 + Math.random() * 0.5,
    side,
    phase: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.0006 + Math.random() * 0.0012,
    wobbleAmpX: 1.0 + Math.random() * 2.0,
    wobbleAmpY: 0.5 + Math.random() * 1.0,
    floatSpeed: FLOAT_SPEED_BASE + (Math.random() - 0.5) * FLOAT_SPEED_VARIANCE,
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
      el.style.transform = `rotate(${data.rotation}deg)`;
      el.style.opacity = String(data.opacity);
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

        // ── 8. Write to DOM ──
        const el = els[i];
        el.style.left = `${p.x}vw`;
        el.style.top = `${p.y}vh`;
        el.style.transform = `rotate(${p.rotation}deg)`;
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
    />
  );
};
