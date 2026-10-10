"use client";

import React from "react";
import { Users, GraduationCap, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface SchoolStatsProps {
  className?: string;
}

export default function SchoolStats({ className = "" }: SchoolStatsProps) {
  const prefersReduced = useReducedMotion();

  const stats = [
    {
      icon: Users,
      value: "1000+",
      label: "Happy Students",
      iconBg: "bg-[#E5EEFF] dark:bg-[#0050CB]/30",
      iconColor: "text-[#0050CB] dark:text-sky-400",
    },
    {
      icon: GraduationCap,
      value: "100+",
      label: "Expert Teachers",
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-[#0050CB] dark:text-sky-400",
    },
    {
      icon: ShieldCheck,
      value: "24/7",
      label: "Support",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 18 }}
      animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`inline-flex items-center gap-3 sm:gap-6 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl sm:rounded-full bg-white/95 dark:bg-[#000E28]/95 backdrop-blur-md border border-white/80 dark:border-white/15 shadow-2xl text-[#000E28] dark:text-white select-none ${className}`}
    >
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full ${stat.iconBg} flex items-center justify-center ${stat.iconColor} shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs sm:text-sm font-black text-[#000E28] dark:text-white">
                  {stat.value}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  {stat.label}
                </span>
              </div>
            </div>

            {idx < stats.length - 1 && (
              <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            )}
          </React.Fragment>
        );
      })}
    </motion.div>
  );
}
