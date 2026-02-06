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

// ─── Particle data ──────────────────────────────────────────────────────────

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

  /** Index into the pre-rendered glyph atlas. */
  glyphIndex: number;
  /** The emoji character assigned to this particle (preserved across DPR changes). */
  emoji: string;

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

/** A pre-rendered emoji bitmap and its CSS-space dimensions. */
interface GlyphEntry {
  canvas: HTMLCanvasElement;
  /** The CSS-pixel width/height used when drawing (before DPR scaling). */
  cssSize: number;
}

// ─── Tuning constants ───────────────────────────────────────────────────────

const PARTICLE_COUNT_DESKTOP = 80;
const PARTICLE_COUNT_MOBILE = 30;
const COLUMN_WIDTH_PERCENT = 18;

// Cursor interaction
const CURSOR_INFLUENCE_RADIUS = 25;
const CURSOR_PUSH_STRENGTH = 0.8;

// Velocity damping after cursor push — heavy for Apple-like deceleration
const VELOCITY_DAMPING = 0.9;

// Exponential ease-back speed (0–1). Higher = faster return, no oscillation.
const EASE_BACK_SPEED = 0.08;

// Base upward float speed (vh per normalised frame)
const FLOAT_SPEED_BASE = 0.028;
const FLOAT_SPEED_VARIANCE = 0.012;

// ── Entrance tuning (tightened vs DOM version for faster visibility) ──
// ~45 frames ≈ 0.75 s total stagger spread at 60 fps
const ENTRANCE_STAGGER_WINDOW = 45;
// ~30 frames ≈ 0.5 s per particle fade-in
const ENTRANCE_DURATION = 30;
// How many vh the particle drifts upward from below its rest during entrance.
const ENTRANCE_DRIFT_VH = 6;
// Starting scale factor (grows to 1.0).
const ENTRANCE_SCALE_START = 0.45;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Deceleration ease-out: `1 - (1 - t)^3` */
const cubicOut = (t: number): number => {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
};

/**
 * Pre-render a single emoji glyph to an offscreen canvas.
 * The canvas is sized with DPR padding so it stays crisp on retina displays.
 * A 1.4× padding factor accounts for emoji glyphs that extend beyond their
 * measured em-square (common with colour emoji fonts).
 */
const prerenderGlyph = (
  emoji: string,
  size: number,
  dpr: number,
): GlyphEntry => {
  const padding = 1.4;
  const cssSize = Math.ceil(size * padding);
  const pxSize = Math.ceil(cssSize * dpr);

  const canvas = document.createElement("canvas");
  canvas.width = pxSize;
  canvas.height = pxSize;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, cssSize / 2, cssSize / 2);
  }

  return { canvas, cssSize };
};

const createParticleData = (id: number, glyphIndex: number): ParticleData => {
  const side: "left" | "right" = id % 2 === 0 ? "left" : "right";
  const baseX =
    side === "left"
      ? Math.random() * COLUMN_WIDTH_PERCENT
      : 100 - COLUMN_WIDTH_PERCENT + Math.random() * COLUMN_WIDTH_PERCENT;

  const yPos = Math.random() * 100;

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
    glyphIndex,
    emoji: "",

    entranceProgress: 0,
    entranceDelay: Math.random() * ENTRANCE_STAGGER_WINDOW,
    entranceDuration: ENTRANCE_DURATION,
    age: 0,
  };
};

// ─── Component ──────────────────────────────────────────────────────────────

export const FloatingEmojis = () => {
  const isTouch = useIsTouchDevice();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const particlesRef = useRef<ParticleData[]>([]);
  const glyphsRef = useRef<GlyphEntry[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const sizeRef = useRef<{ w: number; h: number; dpr: number }>({
    w: 0,
    h: 0,
    dpr: 1,
  });
  const initializedRef = useRef(false);

  const particleCount =
    isTouch === null
      ? 0
      : isTouch
        ? PARTICLE_COUNT_MOBILE
        : PARTICLE_COUNT_DESKTOP;

  /** Sync the canvas buffer size to the current viewport & DPR. */
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    sizeRef.current = { w, h, dpr };
  }, []);

  /**
   * Pre-render all emoji glyphs and create particle data.
   * Runs once after mount; glyphs are rendered at the current DPR.
   */
  const initParticles = useCallback(() => {
    if (initializedRef.current || particleCount === 0) return;
    initializedRef.current = true;

    const dpr = window.devicePixelRatio || 1;

    // Create particles and pre-render their glyphs
    const particles: ParticleData[] = [];
    const glyphs: GlyphEntry[] = [];

    for (let i = 0; i < particleCount; i++) {
      const data = createParticleData(i, i);
      const emoji = VIBE_EMOJIS[Math.floor(Math.random() * VIBE_EMOJIS.length)];
      data.emoji = emoji;
      const glyph = prerenderGlyph(emoji, data.size, dpr);

      particles.push(data);
      glyphs.push(glyph);
    }

    particlesRef.current = particles;
    glyphsRef.current = glyphs;
  }, [particleCount]);

  // ── Animation loop ────────────────────────────────────────────────────────

  const animate = useCallback(
    (currentTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Cache the 2D context on first call — getContext always returns the
      // same instance, but the ref avoids the lookup overhead each frame.
      if (!ctxRef.current) ctxRef.current = canvas.getContext("2d");
      const ctx = ctxRef.current;
      if (!ctx) return;

      // ── Delta time (normalised so 1.0 ≈ one 60 fps frame) ──
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const deltaTime = Math.min(
        (currentTime - lastTimeRef.current) / 16.67,
        3,
      );
      lastTimeRef.current = currentTime;
      timeRef.current += deltaTime;

      const t = timeRef.current;
      const particles = particlesRef.current;
      const glyphs = glyphsRef.current;
      const mouse = mouseRef.current;
      const trackMouse = !isTouch && mouse;
      const { w, h, dpr } = sizeRef.current;

      // Frame-rate-independent exponential ease factor
      const easeFactor = 1 - Math.pow(1 - EASE_BACK_SPEED, deltaTime);

      // Clear the entire canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Scale context to DPR once — all drawing uses CSS-pixel coordinates
      ctx.save();
      ctx.scale(dpr, dpr);

      const degToRad = Math.PI / 180;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // ── 0. Advance entrance animation ──
        p.age += deltaTime;

        if (p.entranceProgress < 1) {
          if (p.age < p.entranceDelay) {
            // Still in stagger delay — nothing to draw yet
            continue;
          }
          const rawProgress = Math.min(
            (p.age - p.entranceDelay) / p.entranceDuration,
            1,
          );
          p.entranceProgress = cubicOut(rawProgress);
        }

        const ep = p.entranceProgress;

        // ── 1. Advance rest position (continuous upward float) ──
        p.restY -= p.floatSpeed * deltaTime;

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

        const minX = p.side === "left" ? 0 : 100 - COLUMN_WIDTH_PERCENT;
        const maxX = p.side === "left" ? COLUMN_WIDTH_PERCENT : 100;
        targetX = Math.max(minX, Math.min(maxX, targetX));

        // ── 3. Cursor repulsion (desktop only) ──
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

        // ── 4. Apply velocity & damp heavily ──
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vx *= Math.pow(VELOCITY_DAMPING, deltaTime);
        p.vy *= Math.pow(VELOCITY_DAMPING, deltaTime);
        if (Math.abs(p.vx) < 0.0001) p.vx = 0;
        if (Math.abs(p.vy) < 0.0001) p.vy = 0;

        // ── 5. Exponential ease toward target ──
        p.x += (targetX - p.x) * easeFactor;
        p.y += (targetY - p.y) * easeFactor;

        // ── 6. Boundary safety ──
        if (p.x < minX) p.x = minX;
        else if (p.x > maxX) p.x = maxX;
        if (p.y < -10) p.y = -10;
        else if (p.y > 110) p.y = 110;

        // ── 7. Smooth rotation ──
        p.rotation += p.rotationSpeed * deltaTime;

        // ── 8. Entrance modifiers ──
        const driftOffset = (1 - ep) * ENTRANCE_DRIFT_VH;
        const scale = ENTRANCE_SCALE_START + (1 - ENTRANCE_SCALE_START) * ep;
        const opacity = p.targetOpacity * ep;

        // ── 9. Draw to canvas ──
        // Convert viewport-percentage coordinates to CSS pixels
        const px = (p.x / 100) * w;
        const py = ((p.y + driftOffset) / 100) * h;

        const glyph = glyphs[p.glyphIndex];
        const halfSize = glyph.cssSize / 2;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(px, py);
        ctx.rotate(p.rotation * degToRad);
        ctx.scale(scale, scale);
        ctx.drawImage(
          glyph.canvas,
          -halfSize,
          -halfSize,
          glyph.cssSize,
          glyph.cssSize,
        );
        ctx.restore();
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    },
    [isTouch],
  );

  // ── Lifecycle: init + start animation ─────────────────────────────────────

  useEffect(() => {
    if (particleCount === 0) return;

    syncCanvasSize();
    initParticles();

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [particleCount, syncCanvasSize, initParticles, animate]);

  // ── Resize handling ───────────────────────────────────────────────────────

  useEffect(() => {
    if (particleCount === 0) return;

    const handleResize = () => {
      // Capture old DPR *before* syncCanvasSize updates it
      const prevDpr = sizeRef.current.dpr;
      syncCanvasSize();

      // If DPR changed (e.g. dragging between monitors), re-render glyphs
      // using the same emoji each particle was originally assigned.
      const newDpr = sizeRef.current.dpr;
      if (Math.abs(newDpr - prevDpr) > 0.01) {
        const particles = particlesRef.current;
        const glyphs = glyphsRef.current;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          glyphs[p.glyphIndex] = prerenderGlyph(p.emoji, p.size, newDpr);
        }
        // Reset cached context — buffer resize invalidates it
        ctxRef.current = null;
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [particleCount, syncCanvasSize]);

  // ── Mouse tracking (desktop only) ─────────────────────────────────────────

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

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(
    () => () => {
      particlesRef.current = [];
      glyphsRef.current = [];
      initializedRef.current = false;
    },
    [],
  );

  // Nothing to show during SSR or before detection finishes
  if (isTouch === null) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ width: "100vw", height: "100vh", contain: "strict" }}
    />
  );
};
