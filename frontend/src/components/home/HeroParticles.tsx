"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  size: number;
  speedY: number;
  driftSpeed: number;
  driftAmplitude: number;
  driftOffset: number;
  color: [number, number, number]; // rgb
  baseOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

const PARTICLE_COLORS: [number, number, number][] = [
  [96, 165, 250],  // Light Sky Blue (#60A5FA)
  [56, 189, 248],  // Bright Sky Blue (#38BDF8)
  [34, 211, 238],  // Cyan (#22D3EE)
  [255, 255, 255], // Soft White
  [147, 197, 253], // Pastel Blue (#93C5FD)
];

export default function HeroParticles({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    const count = prefersReduced ? 16 : 38;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Re-initialize particles across the space
      particles = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        particles.push({
          x,
          y,
          baseX: x,
          size: 1.2 + Math.random() * 2.8,
          speedY: 0.25 + Math.random() * 0.55,
          driftSpeed: 0.008 + Math.random() * 0.015,
          driftAmplitude: 12 + Math.random() * 24,
          driftOffset: Math.random() * Math.PI * 2,
          color,
          baseOpacity: 0.25 + Math.random() * 0.5,
          twinkleSpeed: 0.02 + Math.random() * 0.04,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    if (prefersReduced) {
      // Static render for reduced motion
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.baseOpacity})`;
        ctx.fill();
      }
      return () => window.removeEventListener("resize", resize);
    }

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move upward slowly
        p.y -= p.speedY;
        if (p.y < -15) {
          p.y = height + 10;
          p.baseX = Math.random() * width;
          p.x = p.baseX;
        }

        // Gentle horizontal sway
        p.x = p.baseX + Math.sin(frame * p.driftSpeed + p.driftOffset) * p.driftAmplitude;

        // Twinkle
        const twinkle = Math.sin(frame * p.twinkleSpeed + p.twinklePhase);
        const currentOpacity = Math.max(0.1, Math.min(0.85, p.baseOpacity + twinkle * 0.25));

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${currentOpacity})`;
        ctx.shadowColor = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, 0.6)`;
        ctx.shadowBlur = p.size > 2.2 ? 6 : 2;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [prefersReduced]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
