"use client";

import React from "react";
import HeroParticles from "@/components/home/HeroParticles";

export default function SchoolHeroBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none -z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Soft Sky Blue Gradient Background surrounding the banner */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E0EEFD] via-[#EEF5FE] to-[#F8FAFC] dark:from-[#000E28] dark:via-[#001338] dark:to-[#000E28]" />

      {/* Atmospheric Soft Ambient Sunlight Glows */}
      <div
        className="absolute -top-32 left-1/4 w-[600px] h-[500px] rounded-full blur-[120px] opacity-60 dark:opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(254, 243, 199, 0.5) 0%, rgba(224, 242, 254, 0.3) 50%, transparent 75%)",
        }}
      />
      <div
        className="absolute top-1/3 right-10 w-[550px] h-[550px] rounded-full blur-[130px] opacity-50 dark:opacity-25 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(0, 80, 203, 0.12) 60%, transparent 80%)",
        }}
      />

      {/* Subtle Upward Floating Educational Particles */}
      <HeroParticles className="opacity-75 dark:opacity-60" />
    </div>
  );
}
