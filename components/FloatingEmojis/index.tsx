"use client";

import { useEffect, useRef, useState } from "react";

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

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

// ============ TWEAK THESE VALUES ============
const PARTICLE_COUNT = 80;
const COLUMN_WIDTH_PERCENT = 18;
const MAX_VELOCITY = 0.15; // Very slow max velocity for gentle drifting
const DRIFT_FORCE = 0.003; // Tiny force applied each frame for gentle acceleration
const DAMPING = 0.998; // Very slight damping to slowly reduce velocity
const DIRECTION_CHANGE_CHANCE = 0.008; // Low chance to change drift direction
const UPWARD_BIAS = -0.002; // Slight upward drift tendency
const CURSOR_INFLUENCE_RADIUS = 25; // vw/vh units - how far cursor affects particles
const CURSOR_PUSH_STRENGTH = 0.8; // How strongly cursor pushes particles away
const CURSOR_MAX_VELOCITY = 1.5; // Higher max velocity when pushed by cursor
// ============================================

const createParticle = (id: number, initialY?: number): Particle => {
  const side = id % 2 === 0 ? "left" : "right";
  const baseX =
    side === "left"
      ? Math.random() * COLUMN_WIDTH_PERCENT
      : 100 - COLUMN_WIDTH_PERCENT + Math.random() * COLUMN_WIDTH_PERCENT;

  return {
    id,
    emoji: VIBE_EMOJIS[Math.floor(Math.random() * VIBE_EMOJIS.length)],
    x: baseX,
    y: initialY ?? Math.random() * 100,
    vx: (Math.random() - 0.5) * MAX_VELOCITY * 0.5,
    vy: (Math.random() - 0.5) * MAX_VELOCITY * 0.5,
    size: 16 + Math.random() * 14,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 0.3, // Very slow rotation
    opacity: 0.3 + Math.random() * 0.5,
  };
};

export const FloatingEmojis = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Initialize particles
    const initialParticles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      initialParticles.push(createParticle(i));
    }
    setParticles(initialParticles);

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 100, // Convert to vw
        y: (e.clientY / window.innerHeight) * 100, // Convert to vh
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;

    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = Math.min(
        (currentTime - lastTimeRef.current) / 16.67,
        3,
      ); // Normalize to ~60fps, cap at 3x
      lastTimeRef.current = currentTime;

      setParticles((prevParticles) =>
        prevParticles.map((particle) => {
          let { x, y, vx, vy, rotation, rotationSpeed } = particle;
          const side = particle.id % 2 === 0 ? "left" : "right";

          // Apply cursor repulsion force
          const mouse = mouseRef.current;
          let isBeingPushed = false;
          if (mouse) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CURSOR_INFLUENCE_RADIUS && distance > 0.5) {
              isBeingPushed = true;
              // Strong inverse falloff - much stronger when close
              const falloff = 1 - distance / CURSOR_INFLUENCE_RADIUS;
              const force = CURSOR_PUSH_STRENGTH * falloff * falloff * falloff;

              // Normalize direction and apply force
              vx += (dx / distance) * force;
              vy += (dy / distance) * force;
            }
          }

          // Apply gentle random drift forces (zero gravity feel)
          if (Math.random() < DIRECTION_CHANGE_CHANCE) {
            vx += (Math.random() - 0.5) * DRIFT_FORCE * 10;
            vy += (Math.random() - 0.5) * DRIFT_FORCE * 10;
          }

          // Apply constant tiny drift force for organic movement
          vx += (Math.random() - 0.5) * DRIFT_FORCE * deltaTime;
          vy +=
            (Math.random() - 0.5) * DRIFT_FORCE * deltaTime +
            UPWARD_BIAS * deltaTime;

          // Apply damping for gradual slowdown
          vx *= Math.pow(DAMPING, deltaTime);
          vy *= Math.pow(DAMPING, deltaTime);

          // Clamp velocity (allow higher when being pushed by cursor)
          const maxVel = isBeingPushed ? CURSOR_MAX_VELOCITY : MAX_VELOCITY;
          const speed = Math.sqrt(vx * vx + vy * vy);
          if (speed > maxVel) {
            vx = (vx / speed) * maxVel;
            vy = (vy / speed) * maxVel;
          }

          // Update position
          x += vx * deltaTime;
          y += vy * deltaTime;

          // Soft boundary constraints for x (keep within column)
          const minX = side === "left" ? 0 : 100 - COLUMN_WIDTH_PERCENT;
          const maxX = side === "left" ? COLUMN_WIDTH_PERCENT : 100;

          if (x < minX) {
            x = minX;
            vx = Math.abs(vx) * 0.3; // Gentle bounce
          } else if (x > maxX) {
            x = maxX;
            vx = -Math.abs(vx) * 0.3;
          }

          // Wrap around vertically with reset
          if (y < -5) {
            y = 105;
            vy = Math.abs(vy) * 0.5;
          } else if (y > 105) {
            y = -5;
            vy = -Math.abs(vy) * 0.5;
          }

          // Very slow rotation
          rotation += rotationSpeed * deltaTime;

          return {
            ...particle,
            x,
            y,
            vx,
            vy,
            rotation,
          };
        }),
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles.length]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute will-change-transform"
          style={{
            left: `${particle.x}vw`,
            top: `${particle.y}vh`,
            fontSize: `${particle.size}px`,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            transition: "none",
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
};
