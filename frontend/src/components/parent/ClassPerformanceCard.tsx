"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, BookOpen, Calculator, Palette } from "lucide-react";

interface SubjectPerformance {
  name: string;
  percentage: number;
  gradient: string;
  shadowColor: string;
  iconBg: string;
  iconColor: string;
  type: "book" | "calc" | "evs" | "art";
}

const SUBJECTS_DATA: SubjectPerformance[] = [
  {
    name: "English",
    percentage: 88,
    gradient: "from-[#8EC5FC] via-[#5B95F8] to-[#2563EB]",
    shadowColor: "rgba(37, 99, 235, 0.25)",
    iconBg: "bg-[#EEF5FF] dark:bg-blue-950/50",
    iconColor: "text-[#2563EB]",
    type: "book",
  },
  {
    name: "Maths",
    percentage: 92,
    gradient: "from-[#D8B4FE] via-[#C084FC] to-[#9333EA]",
    shadowColor: "rgba(147, 51, 234, 0.25)",
    iconBg: "bg-[#FBF2FF] dark:bg-purple-950/50",
    iconColor: "text-[#9333EA]",
    type: "calc",
  },
  {
    name: "EVS",
    percentage: 85,
    gradient: "from-[#86EFAC] via-[#4ADE80] to-[#16A34A]",
    shadowColor: "rgba(22, 163, 74, 0.25)",
    iconBg: "bg-[#EDFAF5] dark:bg-emerald-950/50",
    iconColor: "text-[#16A34A]",
    type: "evs",
  },
  {
    name: "Art & Craft",
    percentage: 94,
    gradient: "from-[#FDA4AF] via-[#FB7185] to-[#E11D48]",
    shadowColor: "rgba(225, 29, 72, 0.25)",
    iconBg: "bg-[#FFF0F5] dark:bg-rose-950/50",
    iconColor: "text-[#E11D48]",
    type: "art",
  },
];

interface ClassPerformanceCardProps {
  subjects?: SubjectPerformance[];
  onViewDetailsClick?: () => void;
  className?: string;
}

// Micro animated counter for percentage
function AnimatedPercentage({ value, delay }: { value: number; delay: number }) {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(prefersReducedMotion ? value : 0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = setTimeout(() => {
      let current = 0;
      const step = Math.ceil(value / 25);
      const interval = setInterval(() => {
        current += step;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(current);
        }
      }, 25);
      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, delay, prefersReducedMotion]);

  return <span>{displayValue}%</span>;
}

export default function ClassPerformanceCard({
  subjects,
  onViewDetailsClick,
  className = "",
}: ClassPerformanceCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const items = subjects && subjects.length > 0 ? subjects : SUBJECTS_DATA;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-[24px] p-5 sm:p-6 bg-white/95 dark:bg-[#07142F]/95 backdrop-blur-md border border-blue-100/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,80,203,0.04)] hover:shadow-[0_14px_36px_-6px_rgba(0,80,203,0.1)] flex flex-col justify-between space-y-4 group transition-all duration-300 ${className}`}
    >
      {/* Subtle Pastel Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-bl from-blue-100/30 via-indigo-100/10 to-transparent rounded-full blur-xl pointer-events-none select-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between pb-2 border-b border-blue-50/80 dark:border-white/5 relative z-10">
        <div className="flex items-center gap-2.5">
          {/* Blue Analytics Performance Icon */}
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0050CB] dark:text-blue-300 flex items-center justify-center shadow-2xs">
            <BarChart3 className="w-4 h-4 text-[#0050CB] dark:text-blue-400" />
          </div>
          <h2 className="text-base font-black text-[#000E28] dark:text-white tracking-tight">
            Class Performance
          </h2>
        </div>

        {/* View Details Action with smooth arrow-slide */}
        <button
          onClick={onViewDetailsClick}
          type="button"
          className="group/btn flex items-center gap-1.5 text-xs font-bold text-[#0050CB] dark:text-blue-400 hover:text-[#003EA3] transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50/60 dark:hover:bg-white/5"
        >
          <span>View Details</span>
          <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-1">
            →
          </span>
        </button>
      </div>

      {/* Four Evenly Spaced Performance Columns */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 pt-1 items-end justify-items-center relative z-10">
        {items.map((subject, idx) => {
          const delay = 0.15 + idx * 0.1;

          return (
            <div
              key={subject.name}
              className="flex flex-col items-center justify-end h-full w-full max-w-[72px]"
            >
              {/* Percentage Label */}
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: delay }}
                className="text-xs sm:text-[13px] font-black text-[#000E28] dark:text-white mb-2 tracking-tight"
              >
                <AnimatedPercentage value={subject.percentage} delay={delay} />
              </motion.span>

              {/* Vertical Bar Capsule Container */}
              <div className="w-9 sm:w-11 h-24 sm:h-28 bg-[#F1F5F9]/80 dark:bg-white/5 rounded-t-[18px] rounded-b-[10px] relative overflow-hidden flex items-end p-0.5 border border-slate-100/80 dark:border-white/5 shadow-inner">
                {/* Animated Growing Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${subject.percentage}%` }}
                  transition={{
                    duration: prefersReducedMotion ? 0.01 : 0.85,
                    delay: prefersReducedMotion ? 0 : delay,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    boxShadow: `0 4px 14px ${subject.shadowColor}`,
                  }}
                  className={`w-full bg-gradient-to-t ${subject.gradient} rounded-t-[16px] rounded-b-[8px] relative overflow-hidden`}
                >
                  {/* Subtle top inner light highlight */}
                  <div className="absolute top-0 inset-x-0 h-2 bg-white/35 rounded-t-[16px] pointer-events-none" />
                </motion.div>
              </div>

              {/* Icon & Subject Name */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.3 + idx * 0.1 }}
                className="mt-2.5 text-center flex flex-col items-center w-full"
              >
                {/* Subject Icon Container */}
                <div
                  className={`w-7 h-7 rounded-xl ${subject.iconBg} ${subject.iconColor} flex items-center justify-center shadow-2xs mb-1`}
                >
                  {subject.type === "book" && <BookOpen className="w-4 h-4 text-[#2563EB]" />}
                  {subject.type === "calc" && <Calculator className="w-4 h-4 text-[#9333EA]" />}
                  {subject.type === "evs" && (
                    <span className="text-sm leading-none select-none" title="EVS">
                      🌱
                    </span>
                  )}
                  {subject.type === "art" && <Palette className="w-4 h-4 text-[#E11D48]" />}
                </div>

                {/* Subject Name + Star Accent for Art & Craft */}
                <div className="flex items-center justify-center gap-0.5 w-full">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                    {subject.name}
                  </span>

                  {/* Tiny GGPS-style Star Accent for Art & Craft */}
                  {subject.type === "art" && (
                    <motion.div
                      animate={{
                        rotate: [-6, 6, -6],
                        scale: [0.95, 1.08, 0.95],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut",
                      }}
                      className="inline-block shrink-0 select-none pointer-events-none drop-shadow-xs"
                      title="Top Performance"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                          fill="url(#artStarGrad)"
                          stroke="#F59E0B"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        {/* Eyes */}
                        <circle cx="9.5" cy="11.5" r="1" fill="#78350F" />
                        <circle cx="14.5" cy="11.5" r="1" fill="#78350F" />
                        {/* Smile */}
                        <path
                          d="M10.5 14C11 14.8 13 14.8 13.5 14"
                          stroke="#78350F"
                          strokeWidth="0.8"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient
                            id="artStarGrad"
                            x1="12"
                            y1="2"
                            x2="12"
                            y2="22"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#FDE047" />
                            <stop offset="0.6" stopColor="#FBBF24" />
                            <stop offset="1" stopColor="#F59E0B" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
