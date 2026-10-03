"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Award,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Phone,
  Bookmark,
  BookOpen,
  CreditCard,
  MessageSquare,
  Trophy,
  Camera,
  User,
} from "lucide-react";
import FeePaymentModal from "@/components/parent/FeePaymentModal";
import ReportCardModal from "@/components/parent/ReportCardModal";
import ParentKpiRow from "@/components/parent/ParentKpiRow";
import TodayAttendanceCard from "@/components/parent/TodayAttendanceCard";
import TodayScheduleCard from "@/components/parent/TodayScheduleCard";
import TodayLearningCard from "@/components/parent/TodayLearningCard";
import TodayActivitiesCard from "@/components/parent/TodayActivitiesCard";
import TodayDiaryRemarkCard from "@/components/parent/TodayDiaryRemarkCard";
import QuickActionsCard from "@/components/parent/QuickActionsCard";
import ClassPerformanceCard from "@/components/parent/ClassPerformanceCard";
import { useParent } from "@/context/ParentContext";
import { useCurrentTime } from "@/lib/date";

export default function ParentDashboard() {
  const {
    parentProfile,
    children,
    selectedChild,
    selectChild,
    todayAttendance,
    todayClassWork,
    todayActivities,
    todayDiary,
    teacherRemarks,
  } = useParent();

  const { dateLongStr, academicYearFormatted } = useCurrentTime();

  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const child = selectedChild || children[0] || {
    _id: "c10101010101010101010101",
    firstName: "Aarav",
    lastName: "Sharma",
    grade: "LKG",
    section: "Section A",
    rollNumber: "LKG001",
    studentPhoto: "/aarav-profile-avatar.png",
  };

  const currentDateFormatted = dateLongStr;

  return (
    <div className="space-y-5 pb-12 font-sans antialiased text-slate-800 dark:text-slate-100">
      {/* ========================================================
          1. TOP MAIN SECTION (2 COLUMNS):
          LEFT (8 COLS): HERO BANNER + MY CHILDREN BAR
          RIGHT (4 COLS): MY CHILD QUICK IDENTITY CARD
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          {/* HERO BANNER - GGPS FAMILY PORTAL */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full bg-gradient-to-br from-white/95 via-[#F8FAFF]/90 to-[#EAF2FF]/85 dark:from-[#0B1A3A]/95 dark:via-[#091530]/90 dark:to-[#050E22]/90 backdrop-blur-md rounded-[22px] border border-blue-200/50 dark:border-white/10 relative overflow-hidden shadow-[0_10px_28px_-6px_rgba(0,80,203,0.08),0_0_20px_rgba(59,130,246,0.06)] group min-h-[200px] flex flex-col justify-between"
          >
            {/* Full-bleed Background Artwork */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src="/little-steps-clean-hero.png"
                alt="GGPS School Family Portal"
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 900px"
                className="object-cover object-bottom transition-transform duration-700 group-hover:scale-[1.01]"
              />
            </div>

            {/* Left Live Content Overlay */}
            <div className="relative z-10 p-5 sm:p-6 pb-6 flex flex-col justify-between h-full max-w-[65%] sm:max-w-[58%] pointer-events-none">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-[#000E28]/90 backdrop-blur-md border border-blue-200/80 text-[11px] font-extrabold text-[#0050CB] dark:text-blue-200 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>GGPS CONNECTED CAMPUS</span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-[24px] font-black text-[#000E28] tracking-tight leading-tight flex items-center gap-1.5 mt-2" suppressHydrationWarning>
                  <span suppressHydrationWarning>Welcome back, {parentProfile?.motherName?.split(" ")[0] || "Priya"} 👋</span>
                </h1>

                <p className="text-xs sm:text-[13px] font-bold text-[#102A5C] dark:text-blue-100 leading-snug mt-1">
                  Real-time updates from {child.firstName}&apos;s classroom.
                </p>

                <p className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5 hidden sm:block">
                  Attendance, live lesson units, daily diary, and teacher remarks in sync.
                </p>
              </div>

              {/* Child Info Tag & Date */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-[#000E28]/85 backdrop-blur-md border border-blue-200/80 text-[11px] font-bold text-[#0050CB] dark:text-blue-200 shadow-2xs">
                  <span>{child.firstName} {child.lastName}</span>
                  <span className="text-blue-300">•</span>
                  <span>{child.grade}</span>
                  <span className="text-blue-300">•</span>
                  <span>{child.section}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-[#000E28]/80 backdrop-blur-md border border-slate-200/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                  <Calendar className="w-3 h-3 text-[#0050CB]" />
                  <span suppressHydrationWarning>{currentDateFormatted}</span>
                </div>
              </div>
            </div>


          </motion.div>

          {/* MY CHILDREN SELECTOR BAR */}
          <div className="w-full bg-white/95 dark:bg-[#07142F]/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-blue-100/90 dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#0050CB] flex items-center justify-center font-bold text-xs">
                <Users className="w-3.5 h-3.5 text-[#0050CB]" />
              </div>
              <div>
                <span className="text-xs font-black text-[#000E28] dark:text-white uppercase tracking-wider">
                  My Children ({children.length})
                </span>
                <span className="text-[11px] text-slate-400 ml-1.5 hidden sm:inline">
                  Click to switch active child
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {children.map((c) => {
                const isSelected = (selectedChild?._id || children[0]?._id) === c._id;
                const photo =
                  c.studentPhoto ||
                  (c.firstName === "Ananya" ? "/ananya-student.jpg" : "/aarav-profile-avatar.png");
                return (
                  <button
                    key={c._id}
                    onClick={() => selectChild(c._id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-[#0050CB] to-[#2563EB] text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-300 dark:ring-blue-400"
                        : "bg-slate-50 dark:bg-white/5 hover:bg-blue-50/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10"
                    }`}
                  >
                    <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/40 shrink-0">
                      <Image
                        src={photo}
                        alt={c.firstName}
                        fill
                        sizes="20px"
                        className="object-cover"
                      />
                    </div>
                    <span>{c.firstName}</span>
                    <span className="opacity-75 font-normal text-[11px]">({c.grade})</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                        isSelected ? "bg-white/20 text-white" : "bg-blue-100 text-[#0050CB]"
                      }`}
                    >
                      {c.attendanceRate || 94}%
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUICK DAILY ACTIONS BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              {
                label: "Sign Daily Diary",
                sub: "Today's class note",
                href: "/parent/diary",
                icon: BookOpen,
                color: "text-[#0050CB] bg-blue-50 dark:bg-blue-950/50 border-blue-200/60",
              },
              {
                label: "Apply for Leave",
                sub: "Report absence",
                href: "/parent/attendance",
                icon: Calendar,
                color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200/60",
              },
              {
                label: "Pay School Dues",
                sub: "Instant receipt sync",
                href: "/parent/fees",
                icon: CreditCard,
                color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60",
              },
              {
                label: "Chat with Teacher",
                sub: "Direct messaging",
                href: "/parent/messages",
                icon: MessageSquare,
                color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200/60",
              },
            ].map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 dark:bg-[#07142F]/95 border border-blue-100/90 dark:border-white/10 hover:border-[#0050CB] dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${action.color}`}>
                    <ActionIcon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#000E28] dark:text-white group-hover:text-[#0050CB] transition-colors truncate">
                      {action.label}
                    </p>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500 truncate">
                      {action.sub}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN (4 COLS) - MY CHILD QUICK CARD */}
        <div className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative overflow-hidden rounded-[26px] p-5 sm:p-6 bg-gradient-to-b from-[#FFFFFF] via-[#F8FBFF] to-[#EDF5FF] dark:from-[#0B1A3A] dark:via-[#081530] dark:to-[#050E22] border border-blue-200/70 dark:border-white/10 shadow-[0_12px_32px_-4px_rgba(0,80,203,0.08),0_4px_16px_rgba(59,130,246,0.06)] flex flex-col justify-between space-y-4"
          >
            {/* Child Identity Row */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden border-2 border-white dark:border-white/20 shadow-md shadow-blue-500/10">
                  <Image
                    src={
                      child.studentPhoto ||
                      (child.firstName === "Ananya"
                        ? "/ananya-student.jpg"
                        : "/aarav-profile-avatar.png")
                    }
                    alt={`${child.firstName} ${child.lastName}`}
                    fill
                    sizes="70px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-[#000E28] dark:text-white tracking-tight leading-tight truncate">
                    {child.firstName} {child.lastName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-black shrink-0">
                    Enrolled
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  {child.grade} - {child.section} • Roll #{child.rollNumber || "01"}
                </p>
              </div>
            </div>

            {/* Quick Details */}
            <div className="space-y-2.5 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <div className="flex items-center justify-between py-1 border-b border-blue-50 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Class Teacher</span>
                <span className="font-bold text-[#0050CB] dark:text-blue-300">
                  {child.teacherName || "Ms. Ananya Roy"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-blue-50 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Admission No</span>
                <span className="font-mono">{child.admissionNumber || "GGPS-2024-089"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Emergency Contact</span>
                <span>{child.emergencyContact || "+91 98765 43210"}</span>
              </div>
            </div>

            {/* Action */}
            <Link
              href="/parent/children"
              className="w-full py-2.5 px-4 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-colors"
            >
              <span>View Full Student Profile</span>
              <span>→</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ========================================================
          2. KPI ROW (STAGGERED ANIMATIONS)
      ======================================================== */}
      <ParentKpiRow
        onPayNowClick={() => setIsFeeModalOpen(true)}
        onAssessmentClick={() => setIsReportModalOpen(true)}
      />

      {/* ========================================================
          3. REAL-TIME CLASSROOM SECTION (TEACHER -> PARENT WORKFLOW)
          ROW A: TODAY'S ATTENDANCE (6 COLS) + TODAY'S SCHEDULE (6 COLS)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <TodayAttendanceCard className="lg:col-span-6" />
        <TodayScheduleCard className="lg:col-span-6" />
      </div>

      {/* ========================================================
          ROW B: TODAY'S LEARNING (6 COLS) + TODAY'S ACTIVITIES (6 COLS)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <TodayLearningCard className="lg:col-span-6" />
        <TodayActivitiesCard className="lg:col-span-6" />
      </div>

      {/* ========================================================
          ROW C: DAILY DIARY & CHILD-SPECIFIC REMARKS (7 COLS) + QUICK ACTIONS (5 COLS)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <TodayDiaryRemarkCard className="lg:col-span-7" />
        <QuickActionsCard
          className="lg:col-span-5"
          onViewResults={() => setIsReportModalOpen(true)}
        />
      </div>

      {/* ========================================================
          ROW D: CLASS PERFORMANCE | NOTICES & EVENTS | BUS BANNER
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Class Performance */}
        <ClassPerformanceCard
          onViewDetailsClick={() => setIsReportModalOpen(true)}
        />

        {/* Notices & Events */}
        <div className="bg-white/95 dark:bg-[#07142F]/95 backdrop-blur-md rounded-[24px] p-5 border border-blue-100/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,80,203,0.04)] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-blue-50 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0050CB] flex items-center justify-center">
                <Bell className="w-4 h-4 text-[#0050CB]" />
              </div>
              <h2 className="text-sm font-black text-[#123B82] dark:text-white">
                Recent Notices
              </h2>
            </div>
            <Link
              href="/parent/notifications"
              className="text-xs font-bold text-[#0050CB] dark:text-blue-300 hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-2.5 flex-1">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <Bookmark className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  Parent Teacher Meeting
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 shrink-0">
                Friday
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  School Annual Day Preparation
                </span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">Upcoming</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <Trophy className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  Fancy Dress Competition
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 shrink-0">
                Next Week
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Verified school circulars</span>
            <span className="font-semibold text-[#0050CB]">All up to date</span>
          </div>
        </div>

        {/* Inspiring Academic Excellence Banner */}
        <motion.div
          whileHover={{ scale: 1.015 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#07142F] rounded-[24px] overflow-hidden border border-blue-100/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,80,203,0.04)] relative min-h-[190px] h-full group"
        >
          <Image
            src="/children-hero-books.jpg"
            alt="GGPS School Inspiring Academic Learning"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </motion.div>
      </div>

      {/* Modals */}
      <FeePaymentModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        childName={`${child.firstName} ${child.lastName}`}
      />

      <ReportCardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        child={child as any}
      />
    </div>
  );
}
