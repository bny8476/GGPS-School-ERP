"use client";

import React, { useState } from "react";
import { Building2, UserCheck, ShieldCheck, Flower2, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface BenefitItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const BENEFITS: BenefitItem[] = [
  {
    icon: Building2,
    title: "Modern Infrastructure",
    desc: "Smart digital labs, Wi-Fi campus & interactive classrooms",
  },
  {
    icon: UserCheck,
    title: "Qualified Faculty",
    desc: "Experienced educators fostering individual potential",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure Environment",
    desc: "CCTV surveillance, RFID entry & 24/7 security staff",
  },
  {
    icon: Flower2,
    title: "Holistic Development",
    desc: "Sports academies, arts, public speaking & STEAM clubs",
  },
];

interface SchoolBenefitsProps {
  className?: string;
}

export default function SchoolBenefits({ className = "" }: SchoolBenefitsProps) {
  const prefersReduced = useReducedMotion();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className={`flex flex-col gap-2.5 w-full ${className}`}>
      {BENEFITS.map((item, idx) => {
        const Icon = item.icon;
        const isHovered = hoveredIdx === idx;

        return (
          <motion.div
            key={idx}
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: 20 }}
            animate={prefersReduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.2 + idx * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={prefersReduced ? {} : { x: -4 }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`relative px-4 py-3 rounded-2xl border transition-all duration-200 cursor-default flex items-center gap-3.5 select-none ${
              isHovered
                ? "bg-white/25 border-white/50 shadow-lg backdrop-blur-md"
                : "bg-white/10 hover:bg-white/15 border-white/15 backdrop-blur-xs"
            }`}
          >
            {/* Translucent Blue Icon Container */}
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-[#38BDF8] shrink-0 shadow-xs">
              <Icon className="w-5 h-5 text-white" />
            </div>

            {/* Typography */}
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight">
                {item.title}
              </span>
              <span className="text-[11px] text-blue-100/75 leading-tight line-clamp-1 mt-0.5 font-normal">
                {item.desc}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
