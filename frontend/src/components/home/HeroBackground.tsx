"use client";

import React from "react";
import Image from "next/image";
import HeroParticles from "./HeroParticles";

export default function HeroBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none -z-10 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Base Multi-Stop Sky Blue & Crisp White Radial / Linear Gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#DCEBFC] via-[#EEF5FE] to-[#FFFFFF] dark:from-[#000E28] dark:via-[#00173E] dark:to-[#000A20]"
      />

      {/* 2. Soft Blurred School Campus & Greenery Backdrop (Subtle Depth of Field) */}
      <div
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.09] mix-blend-multiply dark:mix-blend-luminosity filter blur-xl scale-105"
        style={{
          maskImage:
            "radial-gradient(ellipse 75% 65% at 55% 45%, black 25%, rgba(0, 0, 0, 0.4) 65%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 55% 45%, black 25%, rgba(0, 0, 0, 0.4) 65%, transparent 95%)",
        }}
      >
        <Image
          src="/ggps-school-campus-hero.jpg"
          alt="GGPS Campus Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
      </div>

      {/* 3. Gentle Sunlight & Golden Morning Rays (Top Right / Center Depth) */}
      <div
        className="absolute -top-24 right-[12%] w-[680px] h-[520px] rounded-full blur-3xl opacity-65 dark:opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(254, 243, 199, 0.6) 0%, rgba(224, 242, 254, 0.35) 50%, transparent 75%)",
        }}
      />

      {/* 4. Soft Cyan & Sky Blue Atmosphere Glow behind Subject (Center-Right Prominence) */}
      <div
        className="absolute top-[8%] right-[10%] xl:right-[14%] w-[620px] h-[620px] rounded-full blur-[110px] opacity-80 dark:opacity-75 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.35) 0%, rgba(56, 189, 248, 0.25) 45%, rgba(0, 80, 203, 0.12) 75%, transparent 100%)",
        }}
      />

      {/* 5. Left Ambient Sky Fill for Content Contrast */}
      <div
        className="absolute top-[18%] -left-20 w-[500px] h-[500px] rounded-full blur-[120px] opacity-45 dark:opacity-15 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(147, 197, 253, 0.35) 0%, rgba(224, 242, 254, 0.15) 60%, transparent 80%)",
        }}
      />

      {/* 6. Upward Drifting Sparkles & Educational Floating Particles */}
      <HeroParticles className="opacity-90 dark:opacity-80" />

      {/* 7. Bottom Natural Fade Layer: Perfectly Seamless Transition to Marquee / Content */}
      <div
        className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#000E28] dark:via-[#000E28]/80 dark:to-transparent pointer-events-none"
      />
    </div>
  );
}
