"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

interface HeroStudentImageProps {
  className?: string;
}

const CANDIDATE_SOURCES = [
  "/hero-student-girl-clean.png",
  "/hero-student-girl.webp",
  "/home.png",
];

export default function HeroStudentImage({ className = "" }: HeroStudentImageProps) {
  const prefersReduced = useReducedMotion();
  const [srcIndex, setSrcIndex] = useState(0);

  const activeSrc = CANDIDATE_SOURCES[srcIndex] || CANDIDATE_SOURCES[0];

  return (
    <div
      className={`relative w-full flex items-end justify-center select-none ${className}`}
    >
      {/* Dynamic Cyan / Sky Backlight Glow Halo behind Girl Silhouette */}
      <div
        className="absolute bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 w-[340px] sm:w-[480px] lg:w-[540px] h-[340px] sm:h-[480px] lg:h-[540px] rounded-full blur-[80px] lg:blur-[100px] pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, rgba(56, 189, 248, 0.28) 45%, rgba(0, 80, 203, 0.1) 75%, transparent 100%)",
        }}
      />

      {/* Floating Micro Light Specular Flares around Subject */}
      <span className="absolute top-[22%] left-[18%] w-2 h-2 rounded-full bg-cyan-300/80 blur-[1px] animate-pulse pointer-events-none" />
      <span className="absolute top-[36%] right-[16%] w-1.5 h-1.5 rounded-full bg-sky-200/90 blur-[0.8px] animate-pulse pointer-events-none" />
      <span className="absolute bottom-[30%] left-[10%] w-2.5 h-2.5 rounded-full bg-white/70 blur-[1.2px] animate-pulse pointer-events-none" />

      {/* Main Schoolgirl Visual with Natural Feathered Dissolve Base */}
      <motion.div
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 24 }}
        animate={prefersReduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.85,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.15,
        }}
        className="relative flex items-end justify-center"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 86%, rgba(0, 0, 0, 0.5) 94%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 86%, rgba(0, 0, 0, 0.5) 94%, transparent 100%)",
        }}
      >
        <Image
          src={activeSrc}
          alt="GGPS School Student with Backpack and Books"
          width={765}
          height={858}
          priority
          unoptimized
          onError={() => {
            setSrcIndex((prev) => (prev < CANDIDATE_SOURCES.length - 1 ? prev + 1 : prev));
          }}
          className="w-auto h-[440px] sm:h-[500px] lg:h-[580px] xl:h-[640px] max-w-full object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,14,40,0.18)] dark:drop-shadow-[0_25px_45px_rgba(0,0,0,0.65)] pointer-events-none"
        />
      </motion.div>
    </div>
  );
}
