"use client";

import React, { useEffect, useRef, useState } from "react";

interface HeroSparklesProps {
  className?: string;
  density?: "low" | "medium" | "high";
  showOrbitalArc?: boolean;
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  size: number;
  speedY: number;
  driftSpeed: number;
  driftAmplitude: number;
  driftOffset: number;
  color: string;
  rgb: [number, number, number];
  baseOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  isHighlight: boolean;
  glowRadius: number;
}

const DARK_COLORS = [
  { hex: "#2F8CFF", rgb: [47, 140, 255] as [number, number, number], weight: 0.4 }, // Primary royal blue
  { hex: "#38BDF8", rgb: [56, 189, 248] as [number, number, number], weight: 0.3 }, // Secondary sky
  { hex: "#60A5FA", rgb: [96, 165, 250] as [number, number, number], weight: 0.15 }, // Accent light blue
  { hex: "#22D3EE", rgb: [34, 211, 238] as [number, number, number], weight: 0.1 },  // Cyan neon
  { hex: "#A855F7", rgb: [168, 85, 247] as [number, number, number], weight: 0.05 }, // Subtle purple
];

const LIGHT_COLORS = [
  { hex: "#0050CB", rgb: [0, 80, 203] as [number, number, number], weight: 0.45 },
  { hex: "#2F8CFF", rgb: [47, 140, 255] as [number, number, number], weight: 0.35 },
  { hex: "#60A5FA", rgb: [96, 165, 250] as [number, number, number], weight: 0.2 },
];

function pickColor(isDark: boolean) {
  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;
  const rand = Math.random();
  let cumulative = 0;
  for (const item of palette) {
    cumulative += item.weight;
    if (rand <= cumulative) return item;
  }
  return palette[0];
}

export default function HeroSparkles({
  className = "",
  density = "medium",
  showOrbitalArc = true,
}: HeroSparklesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState<boolean>(true);

  // Detect theme dynamically
  useEffect(() => {
    const updateTheme = () => {
      const isDarkMode =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark";
      setIsDark(isDarkMode);
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let isVisible = true;

    // Mouse parallax tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetMouseX = x * 6; // max 3px offset each way
      targetMouseY = y * 4;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle Reduced Motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    // Visibility Change: pause when tab is inactive
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible) {
        lastTime = performance.now();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const getParticleCount = (w: number) => {
      const multiplier = density === "high" ? 1.25 : density === "low" ? 0.7 : 1.0;
      if (w >= 1280) return Math.round(650 * multiplier);
      if (w >= 1024) return Math.round(520 * multiplier);
      if (w >= 768) return Math.round(360 * multiplier);
      return Math.round(180 * multiplier);
    };

    const initParticle = (p?: Partial<Particle>, spawnAtBottom = false): Particle => {
      const colorObj = pickColor(isDark);
      
      // Particle size distribution
      const randSize = Math.random();
      let size: number;
      let isHighlight = false;
      let glowRadius = 0;

      if (randSize > 0.96) {
        // Very rare highlight particle: 3px – 4px
        size = 3.0 + Math.random() * 1.0;
        isHighlight = true;
        glowRadius = size * 3.5;
      } else if (randSize > 0.82) {
        // Some particles: 2px – 3px
        size = 2.0 + Math.random() * 1.0;
        glowRadius = size * 2.2;
      } else {
        // Most particles: 0.5px – 1.6px
        size = 0.6 + Math.random() * 1.0;
        glowRadius = 0;
      }

      // Vertical Speed: 0.4 – 1.45 (different speeds create natural depth)
      const speedY = 0.42 + Math.random() * 0.95;

      // Subtle horizontal drift: -0.15 to +0.15
      const driftSpeed = 0.001 + Math.random() * 0.003;
      const driftAmplitude = 8 + Math.random() * 22;
      const driftOffset = Math.random() * Math.PI * 2;

      // Opacity: most particles small & soft (0.15–0.5), rare highlights up to 0.85
      const baseOpacity = isHighlight
        ? 0.7 + Math.random() * 0.25
        : 0.18 + Math.random() * 0.45;

      const twinkleSpeed = 0.015 + Math.random() * 0.035;
      const twinklePhase = Math.random() * Math.PI * 2;

      // Strategic X positioning:
      // More particles concentrated around the hero artwork (right side, x: 0.45 to 0.95)
      // and bottom region, but spread across the entire width
      let x: number;
      const randSpread = Math.random();
      if (randSpread < 0.55) {
        // Concentrated in the right visual area
        x = width * (0.42 + Math.random() * 0.55);
      } else {
        // Distributed across the rest of the canvas
        x = Math.random() * width;
      }

      // Initial Y position
      const y = spawnAtBottom
        ? height + Math.random() * 40
        : Math.random() * (height + 40);

      return {
        x,
        y,
        baseX: x,
        size,
        speedY,
        driftSpeed,
        driftAmplitude,
        driftOffset,
        color: colorObj.hex,
        rgb: colorObj.rgb,
        baseOpacity,
        twinkleSpeed,
        twinklePhase,
        isHighlight,
        glowRadius,
        ...p,
      };
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      const targetCount = getParticleCount(width);
      particles = Array.from({ length: targetCount }, () => initParticle());
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);
    resize();

    let lastTime = performance.now();

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const deltaTime = Math.min((time - lastTime) / 16.667, 2.5);
      lastTime = time;

      // Smooth mouse parallax lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.06;
      currentMouseY += (targetMouseY - currentMouseY) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // Girl's face safe zone boundaries (normalized to container width & height)
      // When hero is on the right, student girl face is roughly at x: 0.60..0.73, y: 0.22..0.44
      const safeXMin = width * 0.58;
      const safeXMax = width * 0.74;
      const safeYMin = height * 0.18;
      const safeYMax = height * 0.44;

      const motionSpeedFactor = prefersReducedMotion ? 0.08 : 1.0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Vertical movement: strictly upward
        p.y -= p.speedY * deltaTime * motionSpeedFactor;

        // Subtle horizontal drift
        p.driftOffset += p.driftSpeed * deltaTime * motionSpeedFactor;
        const drift = Math.sin(p.driftOffset) * (p.driftAmplitude * 0.35);
        p.x = p.baseX + drift + currentMouseX;

        // Twinkle phase
        p.twinklePhase += p.twinkleSpeed * deltaTime;
        const twinkle = 0.65 + 0.35 * Math.sin(p.twinklePhase);

        // Smooth fade-in near bottom, fade-out near top
        let verticalFade = 1;
        // Fade in from y = height to y = height - 120
        if (p.y > height - 120) {
          verticalFade = Math.max(0, (height - p.y) / 120);
        } else if (p.y < 140) {
          // Fade out near top 140px
          verticalFade = Math.max(0, p.y / 140);
        }

        // Soft invisible "safe zone" attenuation around the girl's face
        let safeZoneMultiplier = 1.0;
        if (p.x >= safeXMin && p.x <= safeXMax && p.y >= safeYMin && p.y <= safeYMax) {
          // Calculate distance from center of face safe zone
          const centerX = (safeXMin + safeXMax) / 2;
          const centerY = (safeYMin + safeYMax) / 2;
          const dx = (p.x - centerX) / ((safeXMax - safeXMin) / 2);
          const dy = (p.y - centerY) / ((safeYMax - safeYMin) / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1.0) {
            safeZoneMultiplier = Math.max(0.12, dist * 0.5);
          }
        }

        // Compute final opacity
        const opacityFactor = isDark ? 1.0 : 0.65;
        const currentOpacity = Math.max(
          0,
          Math.min(
            1,
            p.baseOpacity * twinkle * verticalFade * safeZoneMultiplier * opacityFactor
          )
        );

        // Render particle if visible
        if (currentOpacity > 0.02 && p.x >= -10 && p.x <= width + 10) {
          const [r, g, b] = p.rgb;

          // Render soft glow aura for highlight and medium particles
          if (p.glowRadius > 0 && currentOpacity > 0.25) {
            const glowGrad = ctx.createRadialGradient(
              p.x,
              p.y,
              0,
              p.x,
              p.y,
              p.glowRadius
            );
            glowGrad.addColorStop(
              0,
              `rgba(${r}, ${g}, ${b}, ${currentOpacity * (isDark ? 0.45 : 0.25)})`
            );
            glowGrad.addColorStop(
              0.5,
              `rgba(${r}, ${g}, ${b}, ${currentOpacity * (isDark ? 0.15 : 0.08)})`
            );
            glowGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
            ctx.fill();
          }

          // Core particle dot
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Respawn smoothly at bottom when reaching top boundary
        if (p.y < -15) {
          particles[i] = initParticle(undefined, true);
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      mediaQuery.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver.disconnect();
    };
  }, [density, isDark]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-[1] ${className}`}
      aria-hidden="true"
    >
      {/* ======================================================== */}
      {/* 1. OPTIONAL LARGE ATMOSPHERIC ORBITAL ARC (Futuristic Glow) */}
      {/* ======================================================== */}
      {showOrbitalArc && (
        <div
          className="absolute -top-[15%] right-[-12%] sm:right-[-6%] lg:right-[0%] w-[680px] sm:w-[860px] lg:w-[1100px] h-[680px] sm:h-[860px] lg:h-[1100px] rounded-full pointer-events-none -z-10 transition-opacity duration-700"
          style={{
            border: isDark
              ? "1.5px solid rgba(56, 189, 248, 0.16)"
              : "1.5px solid rgba(0, 80, 203, 0.09)",
            boxShadow: isDark
              ? "0 0 75px -10px rgba(56, 189, 248, 0.20), inset 0 0 65px -15px rgba(47, 140, 255, 0.15)"
              : "0 0 55px -12px rgba(0, 80, 203, 0.10)",
            maskImage:
              "radial-gradient(ellipse 65% 65% at 50% 50%, black 50%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 65% 65% at 50% 50%, black 50%, transparent 72%)",
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 2. SUBTLE BOTTOM-ORIGIN GLOW (Where particles emerge)     */}
      {/* ======================================================== */}
      <div
        className="absolute bottom-0 inset-x-0 h-44 sm:h-56 pointer-events-none -z-10 transition-opacity duration-500"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 80% 55% at 55% 100%, rgba(47, 140, 255, 0.18) 0%, rgba(56, 189, 248, 0.08) 45%, transparent 75%)"
            : "radial-gradient(ellipse 80% 55% at 55% 100%, rgba(0, 80, 203, 0.08) 0%, rgba(207, 232, 255, 0.3) 45%, transparent 75%)",
        }}
      />

      {/* ======================================================== */}
      {/* 3. ATMOSPHERIC AMBIENT BLUE/CYAN ILLUMINATION             */}
      {/* ======================================================== */}
      <div
        className="absolute top-1/4 right-[5%] sm:right-[15%] w-[420px] sm:w-[580px] h-[420px] sm:h-[580px] rounded-full blur-[110px] pointer-events-none -z-10 opacity-70 dark:opacity-85 transition-opacity duration-700"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(47, 140, 255, 0.22) 0%, rgba(14, 165, 233, 0.12) 45%, transparent 70%)"
            : "radial-gradient(circle, rgba(207, 232, 255, 0.5) 0%, rgba(229, 238, 255, 0.25) 50%, transparent 70%)",
        }}
      />

      {/* ======================================================== */}
      {/* 4. HIGH-PERFORMANCE UPWARD-FLOWING CANVAS                 */}
      {/* ======================================================== */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />
    </div>
  );
}
