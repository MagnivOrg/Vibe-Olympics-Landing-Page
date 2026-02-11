"use client";

import { useCallback, useEffect, useRef } from "react";

import { useIsTouchDevice } from "@/components/hooks/useIsTouchDevice";

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

  /** Phase offset for the tilt oscillation (radians). */
  tiltPhase: number;
  /** Speed of the tilt oscillation. */
  tiltSpeed: number;

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

/** A pre-rendered ring bitmap and its CSS-space dimensions. */
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

// ── Tilt (3D rotation axis) tuning ──
/** Minimum Y-scale when the ring is "edge-on" */
const TILT_MIN_SCALE = 0.55;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Deceleration ease-out: `1 - (1 - t)^3` */
const cubicOut = (t: number): number => {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
};

/** Linearly interpolate between two values. */
const lerpVal = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Clamp to 0–255 and round. */
const clamp255 = (v: number): number =>
  Math.max(0, Math.min(255, Math.round(v)));

/** Interpolate two RGB triplets and return a CSS colour string. */
const lerpRGB = (
  c1: [number, number, number],
  c2: [number, number, number],
  t: number,
): string =>
  `rgb(${clamp255(lerpVal(c1[0], c2[0], t))},${clamp255(lerpVal(c1[1], c2[1], t))},${clamp255(lerpVal(c1[2], c2[2], t))})`;

// ─── Polished-gold colour palette ───────────────────────────────────────────
// Organised as [R, G, B] tuples.
//
// Two axes control colour:
//   1. Tube cross-section  —  CENTER (highlight) vs EDGE (shadow)
//   2. Ring position        —  TOP (lit) vs MID vs BOTTOM (shadow)
//
// The large contrast range is what makes the metal look "shiny".

// Centre of tube band (the bright crown)
const CT_TOP: [number, number, number] = [255, 253, 225]; // warm near-white
const CT_MID: [number, number, number] = [255, 220, 50]; // rich gold
const CT_BOT: [number, number, number] = [195, 145, 35]; // dark gold

// Edges of tube band (the dark flanks)
const CE_TOP: [number, number, number] = [225, 185, 65]; // muted gold
const CE_MID: [number, number, number] = [160, 115, 15]; // dark goldenrod
const CE_BOT: [number, number, number] = [75, 48, 12]; // deep warm brown

/**
 * Pre-render a smooth, shiny golden ring to an offscreen canvas.
 *
 * Technique: concentric 1-px arc strokes from outer to inner radius.
 * Each stroke gets a vertical linear gradient whose colours are derived from
 * its radial position in the tube (bright crown vs dark flanks) combined with
 * the top-lit directional light (bright top, dark bottom).
 *
 * The result is a pixel-smooth metallic torus with no banding.
 */
const prerenderRing = (size: number, dpr: number): GlyphEntry => {
  const padding = 1.6;
  const cssSize = Math.ceil(size * padding);
  const pxSize = Math.ceil(cssSize * dpr);

  const canvas = document.createElement("canvas");
  canvas.width = pxSize;
  canvas.height = pxSize;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);

    const cx = cssSize / 2;
    const cy = cssSize / 2;
    const outerRadius = size * 0.46;
    const ringThickness = outerRadius * 0.46;
    const innerRadius = outerRadius - ringThickness;
    const midRadius = (outerRadius + innerRadius) / 2;

    // ── Helper: clip to ring annulus ──
    const clipToRing = () => {
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius + 0.5, 0, Math.PI * 2);
      ctx.arc(cx, cy, innerRadius - 0.5, 0, Math.PI * 2, true);
      ctx.clip("evenodd");
    };

    // ══════════════════════════════════════════════════════════════════════
    // Pass 1 — Concentric strokes building the smooth metallic torus body
    // ══════════════════════════════════════════════════════════════════════
    const bandSteps = Math.max(Math.ceil(ringThickness * dpr), 18);
    const strokeW = ringThickness / bandSteps + 0.6; // slight overlap

    for (let s = 0; s <= bandSteps; s++) {
      const t = s / bandSteps; // 0 = outer edge → 1 = inner edge
      const radius = outerRadius - t * ringThickness;

      // Bell-curve brightness across the tube (bright centre, dark flanks)
      const tubeT = Math.pow(Math.sin(t * Math.PI), 0.65);

      // Interpolated colour triplets for this concentric ring
      const colTop: [number, number, number] = [
        lerpVal(CE_TOP[0], CT_TOP[0], tubeT),
        lerpVal(CE_TOP[1], CT_TOP[1], tubeT),
        lerpVal(CE_TOP[2], CT_TOP[2], tubeT),
      ];
      const colMid: [number, number, number] = [
        lerpVal(CE_MID[0], CT_MID[0], tubeT),
        lerpVal(CE_MID[1], CT_MID[1], tubeT),
        lerpVal(CE_MID[2], CT_MID[2], tubeT),
      ];
      const colBot: [number, number, number] = [
        lerpVal(CE_BOT[0], CT_BOT[0], tubeT),
        lerpVal(CE_BOT[1], CT_BOT[1], tubeT),
        lerpVal(CE_BOT[2], CT_BOT[2], tubeT),
      ];

      const grad = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
      grad.addColorStop(0, lerpRGB(colTop, colTop, 0));
      grad.addColorStop(0.18, lerpRGB(colTop, colMid, 0.35));
      grad.addColorStop(0.48, lerpRGB(colMid, colMid, 0));
      grad.addColorStop(0.78, lerpRGB(colMid, colBot, 0.65));
      grad.addColorStop(1, lerpRGB(colBot, colBot, 0));

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = grad;
      ctx.lineWidth = strokeW;
      ctx.stroke();
    }

    // ══════════════════════════════════════════════════════════════════════
    // Pass 2 — Specular highlight: intense warm bloom on the top arc
    // ══════════════════════════════════════════════════════════════════════
    ctx.save();
    clipToRing();

    const specGrad = ctx.createRadialGradient(
      cx,
      cy - outerRadius * 0.48,
      0,
      cx,
      cy - outerRadius * 0.12,
      outerRadius * 0.95,
    );
    specGrad.addColorStop(0, "rgba(255, 255, 240, 0.97)");
    specGrad.addColorStop(0.06, "rgba(255, 253, 225, 0.88)");
    specGrad.addColorStop(0.15, "rgba(255, 248, 195, 0.58)");
    specGrad.addColorStop(0.3, "rgba(255, 235, 130, 0.25)");
    specGrad.addColorStop(0.5, "rgba(255, 215, 60, 0.07)");
    specGrad.addColorStop(0.7, "rgba(255, 200, 0, 0)");

    ctx.fillStyle = specGrad;
    ctx.fillRect(0, 0, cssSize, cssSize);

    // Tight hot-spot slightly left of top-centre
    const hotGrad = ctx.createRadialGradient(
      cx - outerRadius * 0.18,
      cy - midRadius * 0.88,
      0,
      cx - outerRadius * 0.08,
      cy - midRadius * 0.72,
      ringThickness * 1.1,
    );
    hotGrad.addColorStop(0, "rgba(255, 255, 252, 0.98)");
    hotGrad.addColorStop(0.12, "rgba(255, 255, 240, 0.65)");
    hotGrad.addColorStop(0.35, "rgba(255, 248, 200, 0.22)");
    hotGrad.addColorStop(1, "rgba(255, 230, 100, 0)");

    ctx.fillStyle = hotGrad;
    ctx.fillRect(0, 0, cssSize, cssSize);
    ctx.restore();

    // ══════════════════════════════════════════════════════════════════════
    // Pass 3 — Bottom warm bounce-light (polished gold reflects itself)
    // ══════════════════════════════════════════════════════════════════════
    ctx.save();
    clipToRing();

    const bounceGrad = ctx.createRadialGradient(
      cx + outerRadius * 0.12,
      cy + outerRadius * 0.48,
      0,
      cx,
      cy + outerRadius * 0.28,
      outerRadius * 0.75,
    );
    bounceGrad.addColorStop(0, "rgba(255, 215, 100, 0.35)");
    bounceGrad.addColorStop(0.25, "rgba(255, 195, 60, 0.15)");
    bounceGrad.addColorStop(0.6, "rgba(200, 150, 40, 0)");

    ctx.fillStyle = bounceGrad;
    ctx.fillRect(0, 0, cssSize, cssSize);
    ctx.restore();

    // ══════════════════════════════════════════════════════════════════════
    // Pass 4 — Edge definition strokes
    // ══════════════════════════════════════════════════════════════════════

    // Outer dark border
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(70, 42, 5, 0.5)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Outer bright highlight on top arc
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius - 0.3, -Math.PI * 0.82, -Math.PI * 0.18);
    ctx.strokeStyle = "rgba(255, 250, 210, 0.75)";
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Inner dark border
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(70, 42, 5, 0.45)";
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Inner bright highlight on bottom arc (torus geometry — light wraps under)
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius + 0.3, Math.PI * 0.18, Math.PI * 0.82);
    ctx.strokeStyle = "rgba(255, 245, 190, 0.55)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
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
    size: 22 + Math.random() * 34,
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

    tiltPhase: Math.random() * Math.PI * 2,
    tiltSpeed: 0.008 + Math.random() * 0.012,

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

    // Create particles and pre-render their ring glyphs
    const particles: ParticleData[] = [];
    const glyphs: GlyphEntry[] = [];

    for (let i = 0; i < particleCount; i++) {
      const data = createParticleData(i, i);
      const glyph = prerenderRing(data.size, dpr);

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

        // ── 8b. 3D tilt — oscillating Y-scale simulates axis rotation ──
        const tiltCos = Math.cos(t * p.tiltSpeed + p.tiltPhase);
        const tiltScaleY =
          TILT_MIN_SCALE + (1 - TILT_MIN_SCALE) * Math.abs(tiltCos);

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
        ctx.scale(scale, scale * tiltScaleY);
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

      // If DPR changed (e.g. dragging between monitors), re-render ring glyphs.
      const newDpr = sizeRef.current.dpr;
      if (Math.abs(newDpr - prevDpr) > 0.01) {
        const particles = particlesRef.current;
        const glyphs = glyphsRef.current;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          glyphs[p.glyphIndex] = prerenderRing(p.size, newDpr);
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
