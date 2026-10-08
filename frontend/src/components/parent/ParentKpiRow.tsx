"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import { useParent } from "@/context/ParentContext";

interface ParentKpiRowProps {
  onPayNowClick?: () => void;
  onAssessmentClick?: () => void;
  className?: string;
}

export default function ParentKpiRow({
  onPayNowClick,
  onAssessmentClick,
  className = "",
}: ParentKpiRowProps) {
  const { selectedChild, todayAttendance, homeworkList } = useParent();

  const attendanceDisplay =
    selectedChild?.attendanceRate !== undefined
      ? `${selectedChild.attendanceRate}%`
      : todayAttendance.recorded
      ? todayAttendance.status
      : "Recorded";

  const pendingTasks =
    homeworkList.filter((h) => h.status === "Pending").length ||
    (selectedChild?.pendingHomework ?? 0);

  const feesDisplay =
    selectedChild?.feesDue && selectedChild.feesDue > 0
      ? `₹${selectedChild.feesDue.toLocaleString("en-IN")}`
      : "Settled";

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 items-stretch ${className}`}
    >
      {/* ========================================================
          CARD 1: ATTENDANCE
      ======================================================== */}
      <Link href="/parent/attendance" className="block group h-full">
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] p-4 sm:p-5 bg-gradient-to-br from-white via-white to-[#EBF3FF]/70 dark:from-[#07142F] dark:via-[#091838] dark:to-[#0D2452] border border-blue-100/90 dark:border-white/10 shadow-[0_4px_20px_rgba(0,80,203,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,80,203,0.14)] transition-all duration-300 h-full min-h-[148px] flex flex-col justify-between"
        >
          {/* Row 1: Icon on left, Chevron on right */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E1EFFF] to-[#C8E0FF] dark:from-blue-950/60 dark:to-blue-900/40 p-[2.5px] shadow-sm shadow-blue-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#2563EB] to-[#0050CB] flex items-center justify-center shadow-inner">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-white"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="17" rx="3" fill="currentColor" fillOpacity="0.2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="8" y1="2" x2="8" y2="5" strokeWidth="2.5" />
                  <line x1="16" y1="2" x2="16" y2="5" strokeWidth="2.5" />
                  <circle cx="8" cy="13" r="1" fill="currentColor" />
                  <circle cx="12" cy="13" r="1" fill="currentColor" />
                  <circle cx="16" cy="13" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Row 2: Metric & Title */}
          <div className="relative z-10 mt-3 min-w-0">
            <div className="text-[26px] sm:text-[28px] lg:text-[30px] font-black text-[#000E28] dark:text-white tracking-tight leading-none font-sans">
              {attendanceDisplay}
            </div>
            <div className="text-[14px] sm:text-[15px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Attendance
            </div>
          </div>

          {/* Row 3: Trend footer */}
          <div className="relative z-10 mt-2.5 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11.5px] sm:text-[12px] font-extrabold text-[#059669] dark:text-emerald-400 whitespace-nowrap">
              {todayAttendance.recorded ? `Today: ${todayAttendance.status}` : "Verified Attendance"}
            </span>
          </div>
        </motion.div>
      </Link>

      {/* ========================================================
          CARD 2: PENDING HOMEWORK (2 Tasks, Pending Tasks, Due Tomorrow)
      ======================================================== */}
      <Link href="/parent/homework" className="block group h-full">
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] p-4 sm:p-5 bg-gradient-to-br from-white via-white to-[#FFF1F5]/70 dark:from-[#07142F] dark:via-[#1A0B1E] dark:to-[#2B0E2A] border border-rose-100/90 dark:border-white/10 shadow-[0_4px_20px_rgba(244,63,94,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(244,63,94,0.14)] transition-all duration-300 h-full min-h-[148px] flex flex-col justify-between"
        >
          {/* Row 1: Icon on left, Chevron on right */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFE4E6] to-[#FECDD3] dark:from-pink-950/60 dark:to-pink-900/40 p-[2.5px] shadow-sm shadow-pink-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#F43F5E] to-[#E11D48] flex items-center justify-center shadow-inner">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-white"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" fill="currentColor" fillOpacity="0.2" />
                </svg>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Row 2: Metric & Title */}
          <div className="relative z-10 mt-3 min-w-0">
            <div className="text-[26px] sm:text-[28px] lg:text-[30px] font-black text-[#E11D48] dark:text-rose-400 tracking-tight leading-none font-sans">
              {pendingTasks}
            </div>
            <div className="text-[14px] sm:text-[15px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Pending Tasks
            </div>
          </div>

          {/* Row 3: Trend footer */}
          <div className="relative z-10 mt-2.5 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11.5px] sm:text-[12px] font-extrabold text-[#E11D48] dark:text-rose-400 whitespace-nowrap">
              {pendingTasks > 0 ? "Pending submission" : "All caught up"}
            </span>
          </div>
        </motion.div>
      </Link>

      {/* ========================================================
          CARD 3: FEES DUE
      ======================================================== */}
      <div
        onClick={onPayNowClick}
        className="block group h-full cursor-pointer"
      >
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] p-4 sm:p-5 bg-gradient-to-br from-white via-white to-[#ECFDF5]/70 dark:from-[#07142F] dark:via-[#092218] dark:to-[#0D3325] border border-emerald-100/90 dark:border-white/10 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.14)] transition-all duration-300 h-full min-h-[148px] flex flex-col justify-between"
        >
          {/* Row 1: Icon on left, Chevron on right */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] dark:from-emerald-950/60 dark:to-emerald-900/40 p-[2.5px] shadow-sm shadow-emerald-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#10B981] to-[#059669] flex items-center justify-center shadow-inner">
                <span className="text-white text-lg font-black leading-none drop-shadow-xs">
                  ₹
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Row 2: Metric & Title */}
          <div className="relative z-10 mt-3 min-w-0">
            <div className="text-[26px] sm:text-[28px] lg:text-[30px] font-black text-[#000E28] dark:text-white tracking-tight leading-none font-sans">
              {feesDisplay}
            </div>
            <div className="text-[14px] sm:text-[15px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Fees Due
            </div>
          </div>

          {/* Row 3: Trend footer */}
          <div className="relative z-10 mt-2.5 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11.5px] sm:text-[12px] font-extrabold text-[#059669] dark:text-emerald-400 whitespace-nowrap">
              {selectedChild?.feesDue && selectedChild.feesDue > 0 ? "Payable online" : "All dues cleared"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ========================================================
          CARD 4: UPCOMING EVENTS (4 Events, Upcoming Events, This Month)
      ======================================================== */}
      <Link href="/parent/events" className="block group h-full">
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] p-4 sm:p-5 bg-gradient-to-br from-white via-white to-[#FFF7ED]/70 dark:from-[#07142F] dark:via-[#221609] dark:to-[#361E0A] border border-amber-100/90 dark:border-white/10 shadow-[0_4px_20px_rgba(249,115,22,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(249,115,22,0.14)] transition-all duration-300 h-full min-h-[148px] flex flex-col justify-between"
        >
          {/* Row 1: Icon on left, Chevron on right */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFEDD5] to-[#FED7AA] dark:from-orange-950/60 dark:to-orange-900/40 p-[2.5px] shadow-sm shadow-orange-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#FB923C] to-[#EA580C] flex items-center justify-center shadow-inner">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-white stroke-[2.2]"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="17" rx="3" fill="currentColor" fillOpacity="0.2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="8" y1="2" x2="8" y2="5" strokeWidth="2.5" />
                  <line x1="16" y1="2" x2="16" y2="5" strokeWidth="2.5" />
                  <circle cx="8" cy="13" r="1" fill="currentColor" />
                  <circle cx="12" cy="13" r="1" fill="currentColor" />
                  <circle cx="16" cy="13" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Row 2: Metric & Title */}
          <div className="relative z-10 mt-3 min-w-0">
            <div className="text-[26px] sm:text-[28px] lg:text-[30px] font-black text-[#000E28] dark:text-white tracking-tight leading-none font-sans">
              4
            </div>
            <div className="text-[14px] sm:text-[15px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Upcoming Events
            </div>
          </div>

          {/* Row 3: Trend footer */}
          <div className="relative z-10 mt-2.5 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11.5px] sm:text-[12px] font-extrabold text-[#EA580C] dark:text-orange-400 whitespace-nowrap">
              Next: Sports Day
            </span>
          </div>
        </motion.div>
      </Link>

      {/* ========================================================
          CARD 5: ASSESSMENTS (2 Scheduled, Assessments, Unit Test Oct)
      ======================================================== */}
      <div
        onClick={onAssessmentClick}
        className="block group h-full cursor-pointer"
      >
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] p-4 sm:p-5 bg-gradient-to-br from-white via-white to-[#F5F3FF]/70 dark:from-[#07142F] dark:via-[#1A0B2E] dark:to-[#2B0E44] border border-purple-100/90 dark:border-white/10 shadow-[0_4px_20px_rgba(124,58,237,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(124,58,237,0.14)] transition-all duration-300 h-full min-h-[148px] flex flex-col justify-between"
        >
          {/* Row 1: Icon on left, Chevron on right */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] dark:from-purple-950/60 dark:to-purple-900/40 p-[2.5px] shadow-sm shadow-purple-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-inner">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-white stroke-[2.2]"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 4h16v7a6 6 0 0 1-12 0V4z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M12 15v5" strokeWidth="2.5" />
                  <path d="M8 20h8" strokeWidth="2.5" />
                </svg>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Row 2: Metric & Title */}
          <div className="relative z-10 mt-3 min-w-0">
            <div className="text-[26px] sm:text-[28px] lg:text-[30px] font-black text-[#000E28] dark:text-white tracking-tight leading-none font-sans">
              2
            </div>
            <div className="text-[14px] sm:text-[15px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Assessments
            </div>
          </div>

          {/* Row 3: Trend footer */}
          <div className="relative z-10 mt-2.5 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11.5px] sm:text-[12px] font-extrabold text-[#7C3AED] dark:text-purple-400 whitespace-nowrap">
              Next: Unit Test
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
