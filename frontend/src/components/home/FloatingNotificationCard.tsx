"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, FileText, Users, GraduationCap, ChevronRight, type LucideIcon } from "lucide-react";

export type NotificationVariant = "emerald" | "purple" | "blue" | "teal" | "amber";

export interface FloatingNotificationCardProps {
  title: string;
  subtitle: string;
  variant: NotificationVariant;
  customIcon?: "rupee";
  icon?: LucideIcon;
  showChevron?: boolean;
  floatY?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

const VARIANT_CONFIGS = {
  emerald: {
    bgGlow: "radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.45) 0%, rgba(6, 182, 212, 0.22) 50%, transparent 75%)",
    iconGrad: "radial-gradient(circle at 35% 30%, #34D399 0%, #059669 70%, #047857 100%)",
    iconRing: "ring-emerald-500/25",
    iconShadow: "0 0 18px rgba(16, 185, 129, 0.65), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
    cardSheen: "linear-gradient(120deg, rgba(56, 189, 248, 0.12) 0%, transparent 45%, rgba(16, 185, 129, 0.08) 100%)",
    glowBorder: "rgba(16, 185, 129, 0.25)",
    subtitleColor: "text-[#93C5FD] dark:text-[#CBD5E1]",
  },
  purple: {
    bgGlow: "radial-gradient(circle at 30% 50%, rgba(168, 85, 247, 0.45) 0%, rgba(139, 92, 246, 0.22) 50%, transparent 75%)",
    iconGrad: "radial-gradient(circle at 35% 30%, #C084FC 0%, #9333EA 70%, #7E22CE 100%)",
    iconRing: "ring-purple-500/25",
    iconShadow: "0 0 18px rgba(168, 85, 247, 0.65), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
    cardSheen: "linear-gradient(120deg, rgba(192, 132, 252, 0.12) 0%, transparent 45%, rgba(147, 51, 234, 0.08) 100%)",
    glowBorder: "rgba(168, 85, 247, 0.25)",
    subtitleColor: "text-[#E9D5FF] dark:text-[#DDD6FE]",
  },
  blue: {
    bgGlow: "radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.45) 0%, rgba(14, 165, 233, 0.22) 50%, transparent 75%)",
    iconGrad: "radial-gradient(circle at 35% 30%, #60A5FA 0%, #2563EB 70%, #1D4ED8 100%)",
    iconRing: "ring-blue-500/25",
    iconShadow: "0 0 18px rgba(59, 130, 246, 0.65), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
    cardSheen: "linear-gradient(120deg, rgba(56, 189, 248, 0.12) 0%, transparent 45%, rgba(59, 130, 246, 0.08) 100%)",
    glowBorder: "rgba(59, 130, 246, 0.28)",
    subtitleColor: "text-[#BAE6FD] dark:text-[#93C5FD]",
  },
  teal: {
    bgGlow: "radial-gradient(circle at 30% 50%, rgba(20, 184, 166, 0.45) 0%, rgba(16, 185, 129, 0.22) 50%, transparent 75%)",
    iconGrad: "radial-gradient(circle at 35% 30%, #2DD4BF 0%, #0D9488 70%, #0F766E 100%)",
    iconRing: "ring-teal-500/25",
    iconShadow: "0 0 18px rgba(20, 184, 166, 0.65), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
    cardSheen: "linear-gradient(120deg, rgba(45, 212, 191, 0.12) 0%, transparent 45%, rgba(20, 184, 166, 0.08) 100%)",
    glowBorder: "rgba(20, 184, 166, 0.28)",
    subtitleColor: "text-[#99F6E4] dark:text-[#A7F3D0]",
  },
  amber: {
    bgGlow: "radial-gradient(circle at 30% 50%, rgba(245, 158, 11, 0.45) 0%, rgba(251, 191, 36, 0.22) 50%, transparent 75%)",
    iconGrad: "radial-gradient(circle at 35% 30%, #FCD34D 0%, #D97706 70%, #B45309 100%)",
    iconRing: "ring-amber-500/25",
    iconShadow: "0 0 18px rgba(245, 158, 11, 0.65), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
    cardSheen: "linear-gradient(120deg, rgba(251, 191, 36, 0.12) 0%, transparent 45%, rgba(245, 158, 11, 0.08) 100%)",
    glowBorder: "rgba(245, 158, 11, 0.28)",
    subtitleColor: "text-[#FDE68A] dark:text-[#FCD34D]",
  },
};

export default function FloatingNotificationCard({
  title,
  subtitle,
  variant,
  customIcon,
  icon: IconComponent,
  showChevron = false,
  floatY = 6,
  duration = 4.8,
  delay = 0,
  className = "",
}: FloatingNotificationCardProps) {
  const prefersReduced = useReducedMotion();
  const config = VARIANT_CONFIGS[variant];

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 15 }}
      animate={
        prefersReduced
          ? { opacity: 1, scale: 1, y: 0 }
          : {
              opacity: 1,
              scale: 1,
              y: [-floatY, floatY, -floatY],
            }
      }
      transition={
        prefersReduced
          ? { duration: 0.5, delay }
          : {
              opacity: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
              y: {
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              },
            }
      }
      className={`pointer-events-auto relative group cursor-pointer inline-flex items-center select-none ${className}`}
    >
      {/* 1. Surrounding Atmospheric Soft Ambient Glow */}
      <div
        className="absolute -inset-3 sm:-inset-4 rounded-[26px] pointer-events-none -z-10 blur-xl transition-opacity duration-500 opacity-80 dark:opacity-95 group-hover:opacity-100"
        style={{ background: config.bgGlow }}
      />

      {/* 2. Dark Navy & Blue Translucent Glass Capsule Body */}
      <div
        className="relative flex items-center gap-2.5 sm:gap-3.5 px-3.5 py-2.5 sm:px-4.5 sm:py-3 rounded-[18px] sm:rounded-[22px] backdrop-blur-2xl transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-0.5"
        style={{
          background:
            "linear-gradient(135deg, rgba(2, 14, 42, 0.90) 0%, rgba(0, 18, 52, 0.95) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.26)",
          boxShadow: `0 20px 42px -12px rgba(0, 10, 32, 0.85), 0 8px 18px -6px rgba(0, 0, 0, 0.5), 0 0 26px -2px ${config.glowBorder}, inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.5)`,
        }}
      >
        {/* Subtle chromatic sheen */}
        <div
          className="absolute inset-0 rounded-[18px] sm:rounded-[22px] pointer-events-none opacity-80"
          style={{ background: config.cardSheen }}
        />

        {/* Top-Edge Specular Glass Light reflection */}
        <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />

        {/* 3. Embossed 3D Circular Colorful Badge */}
        <div
          className={`relative w-9.5 h-9.5 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ring-4 ${config.iconRing} transition-transform duration-300 group-hover:scale-105`}
          style={{
            background: config.iconGrad,
            boxShadow: config.iconShadow,
          }}
        >
          {customIcon === "rupee" ? (
            <span className="text-white font-extrabold text-sm sm:text-base leading-none drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)]">
              ₹
            </span>
          ) : IconComponent ? (
            <IconComponent className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white stroke-[2.4] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)]" />
          ) : null}
        </div>

        {/* 4. Typography */}
        <div className="flex flex-col text-left pr-1 sm:pr-1.5 min-w-0">
          <span className="font-semibold text-white text-[12.5px] sm:text-[14px] lg:text-[14.5px] tracking-tight leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] whitespace-nowrap">
            {title}
          </span>
          <span className={`${config.subtitleColor} text-[10px] sm:text-[11px] lg:text-[11.5px] font-medium tracking-normal mt-0.5 flex items-center gap-1.5 whitespace-nowrap`}>
            {subtitle}
          </span>
        </div>

        {/* Optional Right Chevron indicator */}
        {showChevron && (
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 ml-1 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
        )}
      </div>
    </motion.div>
  );
}
