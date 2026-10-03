"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  BookOpen,
  Calculator,
  Palette,
  Utensils,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatHeaderDate } from "@/lib/date";

export interface ScheduleItem {
  id: string;
  subject: string;
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "09:45 AM"
  timeString?: string; // e.g. "09:00 AM – 09:45 AM"
  className?: string;  // e.g. "LKG"
  section?: string;    // e.g. "Section A"
  type: "CLASS" | "ACTIVITY" | "BREAK";
  room?: string;
  teacher?: string;
}

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    id: "sch-1",
    subject: "English",
    startTime: "09:00 AM",
    endTime: "09:45 AM",
    timeString: "09:00 AM – 09:45 AM",
    className: "LKG",
    section: "Section A",
    type: "CLASS",
  },
  {
    id: "sch-2",
    subject: "Maths",
    startTime: "10:00 AM",
    endTime: "10:45 AM",
    timeString: "10:00 AM – 10:45 AM",
    className: "LKG",
    section: "Section A",
    type: "CLASS",
  },
  {
    id: "sch-3",
    subject: "Art & Craft",
    startTime: "11:00 AM",
    endTime: "11:45 AM",
    timeString: "11:00 AM – 11:45 AM",
    className: "LKG",
    section: "Section A",
    type: "ACTIVITY",
  },
  {
    id: "sch-4",
    subject: "Lunch Break",
    startTime: "12:30 PM",
    endTime: "01:15 PM",
    timeString: "12:30 PM – 01:15 PM",
    type: "BREAK",
  },
  {
    id: "sch-5",
    subject: "Story Time",
    startTime: "02:00 PM",
    endTime: "02:45 PM",
    timeString: "02:00 PM – 02:45 PM",
    className: "LKG",
    section: "Section A",
    type: "CLASS",
  },
];

interface TodayScheduleCardProps {
  schedule?: ScheduleItem[];
  isLoading?: boolean;
  className?: string;
  currentDate?: string;
}

// Convert "09:00 AM" to minutes from midnight for active schedule check
function timeToMinutes(timeStr: string): number {
  try {
    const parts = timeStr.trim().split(" ");
    if (parts.length < 2) return -1;
    const [rawTime, modifier] = parts;
    const [hStr, mStr] = rawTime.split(":");
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  } catch {
    return -1;
  }
}

export default function TodayScheduleCard({
  schedule = DEFAULT_SCHEDULE,
  isLoading = false,
  className = "",
  currentDate,
}: TodayScheduleCardProps) {
  const displayDate = currentDate || formatHeaderDate();
  const prefersReducedMotion = useReducedMotion();
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Determine current active class dynamically based on current time
  useEffect(() => {
    const checkActiveSchedule = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Find item that spans current time
      const active = schedule.find((item) => {
        const start = timeToMinutes(item.startTime);
        const end = timeToMinutes(item.endTime);
        if (start !== -1 && end !== -1) {
          return currentMinutes >= start && currentMinutes <= end;
        }
        return false;
      });

      // If during class hours, highlight matching item.
      // If outside class hours, highlight first class (09:00 AM - 09:45 AM) as featured demonstration
      if (active) {
        setActiveItemId(active.id);
      } else {
        // Highlight first item as demo of active/current state
        setActiveItemId(schedule[0]?.id || null);
      }
    };

    checkActiveSchedule();
    const interval = setInterval(checkActiveSchedule, 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  // Loading skeleton state
  if (isLoading) {
    return (
      <div
        className={`relative overflow-hidden rounded-[24px] p-6 bg-white/95 border border-[#4696ff]/14 shadow-[0_8px_30px_rgba(0,80,203,0.04)] ${className}`}
      >
        {/* Skeleton Header */}
        <div className="flex items-center justify-between pb-3 border-b border-blue-50/80 mb-5 animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100/60" />
            <div className="w-36 h-5 rounded-lg bg-blue-100/60" />
          </div>
          <div className="w-28 h-6 rounded-xl bg-blue-100/40" />
        </div>
        {/* Skeleton Rows */}
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[72px] rounded-[16px] bg-slate-50 border border-slate-100 animate-pulse flex items-center px-4 gap-4"
            >
              <div className="w-24 h-4 bg-slate-200/70 rounded" />
              <div className="w-10 h-10 rounded-[14px] bg-slate-200/70" />
              <div className="flex-1 space-y-1.5">
                <div className="w-28 h-4 bg-slate-200/70 rounded" />
                <div className="w-20 h-3 bg-slate-200/40 rounded" />
              </div>
              <div className="w-16 h-6 rounded-full bg-slate-200/70" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state if no schedule items
  if (!schedule || schedule.length === 0) {
    return (
      <div
        className={`relative overflow-hidden rounded-[24px] p-8 text-center bg-white/95 border border-[#4696ff]/14 shadow-[0_8px_30px_rgba(0,80,203,0.04)] flex flex-col items-center justify-center min-h-[360px] ${className}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0050CB] flex items-center justify-center mb-3 shadow-xs">
          <CalendarDays className="w-8 h-8 text-[#0050CB]" />
        </div>
        <h3 className="text-lg font-bold text-[#123B82] mb-1">No classes scheduled for today</h3>
        <p className="text-xs text-slate-500 max-w-xs mb-5">
          Your child has no scheduled activities for this day at GGPS.
        </p>
        <Link
          href="/parent/timetable"
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0050CB] to-[#2563EB] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all hover:scale-105"
        >
          View Full Calendar
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-[24px] p-4 sm:p-5 bg-white/95 dark:bg-[#07142F]/95 backdrop-blur-md border border-[rgba(70,150,255,0.14)] dark:border-white/10 shadow-[0_8px_30px_rgba(0,80,203,0.04)] hover:shadow-[0_12px_36px_rgba(0,80,203,0.08)] flex flex-col justify-between space-y-3 transition-all duration-300 ${className}`}
    >
      {/* Subtle Background Decorative Effects */}
      <div className="absolute -top-12 -left-12 w-44 h-44 bg-gradient-to-br from-blue-100/35 via-sky-100/15 to-transparent rounded-full blur-2xl pointer-events-none select-none" />
      <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-gradient-to-tl from-sky-100/30 via-indigo-100/10 to-transparent rounded-full blur-2xl pointer-events-none select-none" />

      {/* 2. CARD HEADER */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex items-center justify-between pb-2.5 border-b border-blue-50/80 dark:border-white/5 relative z-10"
      >
        {/* LEFT: Calendar icon + Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0050CB] dark:text-blue-300 flex items-center justify-center shadow-2xs border border-blue-100/60 dark:border-white/10">
            <CalendarDays className="w-4 h-4 text-[#0050CB] dark:text-blue-400" />
          </div>
          <h2 className="text-[17px] sm:text-[18px] font-extrabold text-[#123B82] dark:text-white tracking-tight font-sans">
            Today&rsquo;s Schedule
          </h2>
        </div>

        {/* RIGHT: Date + Calendar button */}
        <Link
          href="/parent/timetable"
          title="View GGPS Timetable"
          className="group/date flex items-center gap-1.5 bg-blue-50/80 dark:bg-white/5 hover:bg-blue-100/70 dark:hover:bg-white/10 px-2.5 py-1 rounded-xl border border-blue-100/80 dark:border-white/10 transition-colors shadow-2xs"
        >
          <span className="text-[12px] sm:text-[13px] font-semibold text-[#2867C7] dark:text-blue-300" suppressHydrationWarning>
            {displayDate}
          </span>
          <CalendarDays className="w-3.5 h-3.5 text-[#2867C7] dark:text-blue-300 transition-transform duration-200 group-hover/date:rotate-6" />
        </Link>
      </motion.div>

      {/* 3. TIMELINE & 4. SCHEDULE ROWS */}
      <div className="relative pl-5 sm:pl-6 space-y-2 z-10">
        {/* Continuous Left Vertical Timeline Track */}
        <div
          aria-hidden="true"
          className="absolute left-1.5 sm:left-2 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-blue-400 via-sky-300 to-blue-200 dark:from-blue-600 dark:to-blue-900/40"
        />

        {schedule.map((item, index) => {
          const isActive = item.id === activeItemId;
          const isClass = item.type === "CLASS";
          const isActivity = item.type === "ACTIVITY";
          const isBreak = item.type === "BREAK";

          // Dot indicator color
          const dotBg = isClass
            ? "bg-[#2563EB]"
            : isActivity
            ? "bg-[#F97316]"
            : "bg-[#16A34A]";

          // Icon styling & component
          let IconComponent = BookOpen;
          let iconBg = "bg-[#EEF5FF] dark:bg-blue-950/40";
          let iconColor = "text-[#2563EB] dark:text-blue-300";

          if (item.subject.toLowerCase().includes("math")) {
            IconComponent = Calculator;
            iconBg = "bg-[#F0F3FF] dark:bg-indigo-950/40";
            iconColor = "text-[#3B82F6] dark:text-indigo-300";
          } else if (item.subject.toLowerCase().includes("art")) {
            IconComponent = Palette;
            iconBg = "bg-[#FFF4EA] dark:bg-orange-950/40";
            iconColor = "text-[#EA580C] dark:text-orange-300";
          } else if (isBreak || item.subject.toLowerCase().includes("lunch")) {
            IconComponent = Utensils;
            iconBg = "bg-[#EDFAF5] dark:bg-emerald-950/40";
            iconColor = "text-[#059669] dark:text-emerald-300";
          }

          // Type badge styling
          let badgeText = "Class";
          let badgeClass =
            "bg-[#EBF3FF] text-[#2563EB] border-[#D6E6FE] dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900";
          if (isActivity) {
            badgeText = "Activity";
            badgeClass =
              "bg-[#EAF7EE] text-[#16A34A] border-[#D0F0DB] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900";
          } else if (isBreak) {
            badgeText = "Break";
            badgeClass =
              "bg-[#FFF4E5] text-[#D97706] border-[#FEDBB5] dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900";
          }

          return (
            <motion.div
              key={item.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: prefersReducedMotion ? 0 : index * 0.06,
                ease: "easeOut",
              }}
              whileHover={prefersReducedMotion ? {} : { y: -2 }}
              className={`relative flex items-center justify-between p-2.5 sm:px-3 sm:py-2.5 min-h-[64px] rounded-[15px] border transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-[#F0F6FF] via-white to-white dark:from-[#0D2452] dark:to-[#07142F] border-blue-300 dark:border-blue-500/40 shadow-[0_4px_16px_rgba(37,99,235,0.08)]"
                  : "bg-white dark:bg-white/5 border-[#EEF3FA] dark:border-white/5 hover:border-[#BFDBFE] hover:bg-[#FBFDFF] hover:shadow-xs"
              }`}
            >
              {/* Timeline Indicator Dot with Glow & Active Pulse */}
              <div className="absolute -left-5 sm:-left-6 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <span
                  className={`w-3 h-3 rounded-full ${dotBg} ring-3 ${
                    isActive
                      ? "ring-blue-300 dark:ring-blue-600/50 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                      : "ring-white dark:ring-[#07142F]"
                  } z-10 transition-transform`}
                />
                {isActive && !prefersReducedMotion && (
                  <motion.span
                    animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute w-3 h-3 rounded-full bg-blue-400 z-0"
                  />
                )}
              </div>

              {/* Main Content Area */}
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                {/* 5. TIME COLUMN */}
                <div className="shrink-0 text-left min-w-[110px] sm:min-w-[118px]">
                  <span className="text-[11px] sm:text-[12px] font-semibold text-[#4B72B0] dark:text-blue-300 whitespace-nowrap block tracking-tight">
                    {item.timeString || `${item.startTime} – ${item.endTime}`}
                  </span>
                </div>

                {/* 6. SUBJECT ICON CONTAINER */}
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { scale: 1.08, rotate: 2 }}
                  transition={{ duration: 0.2 }}
                  className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-[10px] ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-2xs border border-white/80 dark:border-white/5`}
                >
                  <IconComponent className="w-4 h-4" />
                </motion.div>

                {/* 7. SUBJECT INFORMATION */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-[12.5px] sm:text-[13.5px] font-bold text-[#163B78] dark:text-white leading-tight whitespace-nowrap">
                      {item.subject}
                    </h3>
                    {/* Active NOW Tag */}
                    {isActive && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-blue-600 text-white text-[8.5px] font-black uppercase tracking-wider shrink-0 shadow-2xs animate-pulse">
                        NOW
                      </span>
                    )}
                  </div>

                  {/* Secondary info (skip for Lunch Break as per spec) */}
                  {!isBreak && (item.className || item.section) && (
                    <p className="text-[10.5px] sm:text-[11px] font-medium text-[#7A94BA] dark:text-slate-400 leading-tight mt-0.5 whitespace-nowrap">
                      ({item.className ? `${item.className} - ` : ""}
                      {item.section || "Section A"})
                    </p>
                  )}
                </div>
              </div>

              {/* 8. TYPE BADGE */}
              <div className="shrink-0 ml-1.5">
                <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-bold border block shadow-2xs whitespace-nowrap ${badgeClass}`}>
                  {badgeText}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
