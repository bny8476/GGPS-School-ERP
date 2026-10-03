"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  UserCheck, 
  Clock, 
  UserPlus, 
  Activity, 
  Shield, 
  Award,
  Heart,
  Compass,
  CheckSquare, 
  Mail, 
  FileText, 
  IndianRupee, 
  ChevronDown
} from 'lucide-react';
import AddStudentModal from '@/components/admin/AddStudentModal';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrentTime, getCurrentMonthName, getCurrentYear } from '@/lib/date';

interface AdminExecutiveDashboardProps {
  stats: any;
  userName: string;
  onRefresh: () => void;
}

const formatCurrency = (val?: number, fallback = '₹ 8.42 L') => {
  if (val === undefined || val === null || isNaN(val)) return fallback;
  if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹ ${(val / 1000).toFixed(1)}k`;
  return `₹ ${val.toLocaleString('en-IN')}`;
};

export default function AdminExecutiveDashboard({
  stats,
  userName,
  onRefresh,
}: AdminExecutiveDashboardProps) {
  const { t } = useLanguage();
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const { timeStr, dateLongStr, academicYearFormatted, termName, greeting } = useCurrentTime();

  const displayName = userName?.trim() || 'Admin';

  // Dynamically compute the last 6 months for chart axis
  const last6Months = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short' }));
    }
    return months;
  }, []);

  // Dynamically compute upcoming event dates relative to current school date
  const upcomingEventDates = useMemo(() => {
    const now = new Date();
    return [2, 5, 8, 12, 18].map(daysAhead => {
      const d = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
      return {
        day: d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit' }),
        month: d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short' }),
      };
    });
  }, []);

  const currentMonthYearStr = `${getCurrentMonthName()} ${getCurrentYear()}`;

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-10">
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSuccess={onRefresh}
      />

      {/* ========================================================
          HERO BANNER
      ======================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EEF4FF] via-[#F2F6FE] to-[#E9F1FE] dark:from-[#0B1735] dark:via-[#09152F] dark:to-[#0A1B3F] border border-blue-100/80 dark:border-slate-800 shadow-[0_2px_14px_rgba(0,80,203,0.04)] min-h-[160px] flex items-stretch">
        {/* School Campus Photo on Right with seamless gradient blend */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[55%] lg:w-[48%] pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#EEF4FF] via-[#EEF4FF]/75 to-transparent dark:from-[#0B1735] dark:via-[#0B1735]/80 z-10 w-44" />
          <img
            src="/admin-hero-campus.jpg"
            alt="GGPS School Campus"
            className="w-full h-full object-cover object-center opacity-90 dark:opacity-40"
          />
        </div>

        {/* Content on Left */}
        <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col justify-between max-w-2xl w-full">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-900/50 text-[#0050CB] dark:text-[#38BDF8] text-[11px] font-bold">
                <Calendar className="w-3 h-3" />
                <span suppressHydrationWarning>{dateLongStr}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-900/40 text-[#FF690C] dark:text-amber-300 text-[11px] font-bold font-mono">
                <Clock className="w-3 h-3" />
                <span suppressHydrationWarning>{timeStr}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold">
                {academicYearFormatted} • {termName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
              {greeting}, {displayName} <span className="inline-block animate-wave text-2xl">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-normal">
              Here&apos;s what&apos;s happening at GGPS School today.
            </p>
          </div>

          {/* 4 Value Pill Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-4 sm:mt-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs border border-blue-200/60 dark:border-slate-700 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold shadow-2xs">
              <Shield className="w-3.5 h-3.5 fill-[#0050CB]/15 text-[#0050CB]" />
              <span>Excellence</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs border border-amber-200/60 dark:border-slate-700 text-[#FF690C] dark:text-amber-400 text-xs font-bold shadow-2xs">
              <Award className="w-3.5 h-3.5 text-[#FF690C]" />
              <span>Discipline</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs border border-indigo-200/60 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-2xs">
              <Heart className="w-3.5 h-3.5 fill-indigo-500/15 text-indigo-600" />
              <span>Character</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs border border-emerald-200/60 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Future Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 1: 4 STAT KPI CARDS + QUICK ACTIONS CARD
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Card 1: Total Students */}
        <Link
          href="/dashboard/students"
          className="lg:col-span-2 xl:col-span-2 bg-white dark:bg-[#07152F] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,14,40,0.02)] flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden group cursor-pointer block"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#0050CB] text-white flex items-center justify-center shadow-sm shadow-[#0050CB]/25 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#0050CB] dark:text-[#38BDF8] bg-blue-50 dark:bg-[#0050CB]/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40">
                Enrolled
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2.5 group-hover:text-[#0050CB] transition-colors">
              {t('dashboard.totalStudents', 'Total Students')}
            </p>
            <p className="text-2xl font-black text-[#000E28] dark:text-white mt-0.5 tracking-tight">
              {stats?.totalStudents ? stats.totalStudents.toLocaleString('en-IN') : '1,248'}
            </p>

            {/* Capacity / Target Bar */}
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Capacity</span>
                <span className="font-bold text-slate-600 dark:text-slate-300">92%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#0050CB] rounded-full transition-all duration-500" style={{ width: '92%' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/70">
            <div className="flex items-center gap-1 text-emerald-600 font-bold">
              <span>↑ 8.4%</span>
              <span className="text-slate-400 font-normal">vs. last month</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Live</span>
          </div>
        </Link>

        {/* Card 2: Total Teachers / Staff */}
        <Link
          href="/dashboard/teachers"
          className="lg:col-span-2 xl:col-span-2 bg-white dark:bg-[#07152F] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,14,40,0.02)] flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden group cursor-pointer block"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center shadow-sm shadow-purple-500/25 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-900/40">
                1:18 Ratio
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2.5 group-hover:text-purple-600 transition-colors">
              {t('dashboard.totalStaff', 'Total Teachers / Staff')}
            </p>
            <p className="text-2xl font-black text-[#000E28] dark:text-white mt-0.5 tracking-tight">
              {stats?.totalStaff ? stats.totalStaff.toLocaleString('en-IN') : '86'}
            </p>

            {/* Attendance / Duty Bar */}
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>On Duty</span>
                <span className="font-bold text-slate-600 dark:text-slate-300">96%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#8B5CF6] rounded-full transition-all duration-500" style={{ width: '96%' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/70">
            <div className="flex items-center gap-1 text-emerald-600 font-bold">
              <span>↑ 3.1%</span>
              <span className="text-slate-400 font-normal">vs. last month</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Verified</span>
          </div>
        </Link>

        {/* Card 3: New Admissions */}
        <Link
          href="/dashboard/admissions"
          className="lg:col-span-2 xl:col-span-2 bg-white dark:bg-[#07152F] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,14,40,0.02)] flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden group cursor-pointer block"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-sm shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                AY 25-26
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2.5 group-hover:text-emerald-600 transition-colors">
              {t('dashboard.newAdmissions', 'New Admissions')}
            </p>
            <p className="text-2xl font-black text-[#000E28] dark:text-white mt-0.5 tracking-tight">
              {stats?.newAdmissions ?? stats?.admissionPipeline?.confirmed ?? 42}
            </p>

            {/* Target Progress Bar */}
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Target: 50</span>
                <span className="font-bold text-slate-600 dark:text-slate-300">84%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full transition-all duration-500" style={{ width: '84%' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/70">
            <div className="flex items-center gap-1 text-emerald-600 font-bold">
              <span>↑ 12.5%</span>
              <span className="text-slate-400 font-normal">vs. last month</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Target</span>
          </div>
        </Link>

        {/* Card 4: Fee Collection */}
        <Link
          href="/dashboard/fees"
          className="lg:col-span-2 xl:col-span-2 bg-white dark:bg-[#07152F] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,14,40,0.02)] flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden group cursor-pointer block"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shadow-sm shadow-amber-500/25 group-hover:scale-105 transition-transform">
                <IndianRupee className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/40">
                Term 1
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2.5 group-hover:text-amber-600 transition-colors">
              {t('dashboard.feeCollection', 'Fee Collection')}
            </p>
            <p className="text-2xl font-black text-[#000E28] dark:text-white mt-0.5 tracking-tight">
              {formatCurrency(stats?.feeStats?.collected ?? stats?.feeCollectionSummary, '₹ 8.42 L')}
            </p>

            {/* Collection Target Bar */}
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Target: ₹ 10 L</span>
                <span className="font-bold text-slate-600 dark:text-slate-300">88%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#F59E0B] rounded-full transition-all duration-500" style={{ width: '88%' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/70">
            <div className="flex items-center gap-1 text-emerald-600 font-bold">
              <span>↑ 7.2%</span>
              <span className="text-slate-400 font-normal">vs. last month</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Q3 Pace</span>
          </div>
        </Link>

        {/* Card 5: Quick Actions (Spans 4 columns for full readable action buttons) */}
        <div className="sm:col-span-2 lg:col-span-4 xl:col-span-4 bg-white dark:bg-[#07152F] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,14,40,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-[#000E28] dark:text-white">
              {t('dashboard.quickActions', 'Quick Actions')}
            </h3>
            <Link
              href="/dashboard/workflows"
              className="text-[11px] font-bold text-[#0050CB] hover:underline"
            >
              {t('dashboard.viewAll', 'View All')}
            </Link>
          </div>

          {/* 6 Actions Grid (2 columns x 3 rows) */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-3">
            <button
              type="button"
              onClick={() => setIsAddStudentOpen(true)}
              className="flex items-center gap-2.5 p-2 sm:px-3 sm:py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 dark:bg-slate-800/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800 transition-colors text-left group cursor-pointer min-w-0"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-100/70 text-[#0050CB] flex items-center justify-center shrink-0">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#0050CB] truncate">
                {t('dashboard.addStudent', 'Add Student')}
              </span>
            </button>

            <Link
              href="/dashboard/teachers"
              className="flex items-center gap-2.5 p-2 sm:px-3 sm:py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 dark:bg-slate-800/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800 transition-colors text-left group cursor-pointer min-w-0"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-100/70 text-[#0050CB] flex items-center justify-center shrink-0">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#0050CB] truncate">
                {t('dashboard.addTeacher', 'Add Teacher')}
              </span>
            </Link>

            <Link
              href="/dashboard/admissions"
              className="flex items-center gap-2.5 p-2 sm:px-3 sm:py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 dark:bg-slate-800/60 dark:hover:bg-emerald-950/30 border border-slate-100 dark:border-slate-800 transition-colors text-left group cursor-pointer min-w-0"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 truncate">
                {t('dashboard.newAdmission', 'New Admission')}
              </span>
            </Link>

            <Link
              href="/dashboard/fees?tab=collect"
              className="flex items-center gap-2.5 p-2 sm:px-3 sm:py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/70 dark:bg-slate-800/60 dark:hover:bg-amber-950/30 border border-slate-100 dark:border-slate-800 transition-colors text-left group cursor-pointer min-w-0"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0">
                <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-amber-600 truncate">
                {t('finance.collectPayment', 'Fee Payment')}
              </span>
            </Link>

            <Link
              href="/dashboard/attendance"
              className="flex items-center gap-2.5 p-2 sm:px-3 sm:py-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/70 dark:bg-slate-800/60 dark:hover:bg-purple-950/30 border border-slate-100 dark:border-slate-800 transition-colors text-left group cursor-pointer min-w-0"
            >
              <div className="w-6 h-6 rounded-lg bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                <CheckSquare className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-purple-600 truncate">
                {t('attendance.markAttendance', 'Take Attendance')}
              </span>
            </Link>

            <Link
              href="/dashboard/chat"
              className="flex items-center gap-2.5 p-2 sm:px-3 sm:py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 dark:bg-slate-800/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800 transition-colors text-left group cursor-pointer min-w-0"
            >
              <div className="w-6 h-6 rounded-lg bg-sky-100/70 text-sky-600 flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-sky-600 truncate">
                Send Message
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 2: SCHOOL OVERVIEW | RECENT ACTIVITIES | UPCOMING EVENTS & EXAMS
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SECTION 2A: SCHOOL OVERVIEW (Spans 6 cols on lg) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,14,40,0.02)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#000E28] dark:text-white">
                  School Overview
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Key statistics and performance at a glance
                </p>
              </div>
            </div>

            {/* 4 Summary Stats row directly under title */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-1 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Link href="/dashboard/students" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0050CB] flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium group-hover:text-[#0050CB] transition-colors">Total Students</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    {stats?.totalStudents ? stats.totalStudents.toLocaleString('en-IN') : '1,248'}{' '}
                    <span className="text-[9px] text-emerald-600">↑ 8.4%</span>
                  </p>
                </div>
              </Link>

              <Link href="/dashboard/teachers" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium group-hover:text-purple-600 transition-colors">Total Teachers</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    {stats?.totalStaff ? stats.totalStaff.toLocaleString('en-IN') : '86'}{' '}
                    <span className="text-[9px] text-emerald-600">↑ 3.1%</span>
                  </p>
                </div>
              </Link>

              <Link href="/dashboard/teachers" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium group-hover:text-teal-600 transition-colors">Total Staff</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    {stats?.attendanceSummary?.staffTotal ?? 24}{' '}
                    <span className="text-[9px] text-emerald-600">↑ 2.5%</span>
                  </p>
                </div>
              </Link>

              <Link href="/dashboard/parents" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium group-hover:text-sky-600 transition-colors">Total Parents</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    {stats?.totalParents ?? '1,012'}{' '}
                    <span className="text-[9px] text-emerald-600">↑ 6.8%</span>
                  </p>
                </div>
              </Link>
            </div>

            {/* Legend & Multi-Line Area Chart */}
            <div className="flex items-center gap-4 mt-3 mb-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0050CB]" /> Students
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" /> Teachers
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Admissions
              </span>
            </div>
          </div>

          {/* SVG High-Fidelity Multi-Line Area Chart with Floating Tooltip */}
          <div className="relative mt-2">
            <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 170" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0050CB" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#0050CB" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="areaTeachers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line x1="30" y1="20" x2="490" y2="20" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="30" y1="60" x2="490" y2="60" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="30" y1="100" x2="490" y2="100" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="30" y1="140" x2="490" y2="140" stroke="#E2E8F0" />

              {/* Y-Axis Labels */}
              <text x="22" y="24" fill="#94A3B8" fontSize="10" textAnchor="end">1.5K</text>
              <text x="22" y="64" fill="#94A3B8" fontSize="10" textAnchor="end">1K</text>
              <text x="22" y="104" fill="#94A3B8" fontSize="10" textAnchor="end">500</text>
              <text x="22" y="144" fill="#94A3B8" fontSize="10" textAnchor="end">0</text>

              {/* X-Axis Labels (Dynamic last 6 months) */}
              <text x="45" y="160" fill="#94A3B8" fontSize="10" textAnchor="middle">{last6Months[0]}</text>
              <text x="130" y="160" fill="#94A3B8" fontSize="10" textAnchor="middle">{last6Months[1]}</text>
              <text x="215" y="160" fill="#94A3B8" fontSize="10" textAnchor="middle">{last6Months[2]}</text>
              <text x="300" y="160" fill="#94A3B8" fontSize="10" textAnchor="middle">{last6Months[3]}</text>
              <text x="385" y="160" fill="#94A3B8" fontSize="10" textAnchor="middle">{last6Months[4]}</text>
              <text x="470" y="160" fill="#94A3B8" fontSize="10" textAnchor="middle">{last6Months[5]}</text>

              {/* Area Under Students Curve */}
              <path
                d="M 45 125 C 100 115, 140 85, 215 78 C 290 70, 360 48, 470 38 L 470 140 L 45 140 Z"
                fill="url(#areaStudents)"
              />

              {/* Students Line (Blue) */}
              <path
                d="M 45 125 C 100 115, 140 85, 215 78 C 290 70, 360 48, 470 38"
                fill="none"
                stroke="#0050CB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="470" cy="38" r="4.5" fill="#0050CB" stroke="#FFFFFF" strokeWidth="2" />

              {/* Teachers Line (Purple) */}
              <path
                d="M 45 110 C 110 102, 200 95, 290 94 C 360 92, 410 90, 470 88"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="470" cy="88" r="3.5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="1.5" />

              {/* Admissions Line (Green) */}
              <path
                d="M 45 136 C 110 134, 200 132, 290 128 C 360 125, 410 120, 470 115"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="470" cy="115" r="3.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>

            {/* Hover Tooltip (Shown floating over the latest month point) */}
            <div className="absolute right-12 top-0 pointer-events-none bg-white/95 dark:bg-[#08152F]/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700 rounded-xl shadow-lg p-2.5 min-w-[130px] z-10 text-[11px] animate-in fade-in duration-200">
              <p className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1 mb-1.5" suppressHydrationWarning>
                {currentMonthYearStr}
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0050CB]" /> Students
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">1,248</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" /> Teachers
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">86</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Admissions
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">42</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2B: RECENT ACTIVITIES (Spans 3 cols on lg) */}
        <div className="lg:col-span-3 bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,14,40,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0050CB]" />
                <h3 className="text-sm font-bold text-[#000E28] dark:text-white">
                  Recent Activities
                </h3>
              </div>
              <Link
                href="/dashboard/audit"
                className="text-[11px] font-bold text-[#0050CB] hover:underline"
              >
                View All
              </Link>
            </div>

            {/* List of 6 activity items */}
            <div className="space-y-3.5 mt-4">
              {/* Item 1 */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      New admission received
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Rahul Sharma - UKG
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                  2m ago
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      Fee payment received
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Aarav Patel - Class 3B
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                  15m ago
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-[#0050CB] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      Attendance updated
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Class 5A - 28 students
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                  32m ago
                </span>
              </div>

              {/* Item 4 */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      New enquiry
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Parent: Priya Singh
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                  1h ago
                </span>
              </div>

              {/* Item 5 */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      Exam schedule published
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Term 1 Assessment - Pre-KG & LKG
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                  2h ago
                </span>
              </div>

              {/* Item 6 */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-[#0050CB] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      Teacher assigned
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Ms. Neha Verma - Class 2B
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                  3h ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2C: UPCOMING EVENTS & EXAMS (Spans 3 cols on lg) */}
        <div className="lg:col-span-3 bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,14,40,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0050CB]" />
                <h3 className="text-sm font-bold text-[#000E28] dark:text-white">
                  Upcoming Events &amp; Exams
                </h3>
              </div>
              <Link
                href="/dashboard/events"
                className="text-[11px] font-bold text-[#0050CB] hover:underline"
              >
                View All
              </Link>
            </div>

            {/* List of 5 items with Date Box on left (Dynamically calculated upcoming dates) */}
            <div className="space-y-3.5 mt-4">
              {/* Event 1 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 text-slate-800 dark:text-white leading-none">
                    <span className="text-xs font-black" suppressHydrationWarning>{upcomingEventDates[0]?.day}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5" suppressHydrationWarning>{upcomingEventDates[0]?.month}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      Parent Teacher Meeting
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      10:00 AM - 12:00 PM
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0050CB] dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-bold shrink-0">
                  Event
                </span>
              </div>

              {/* Event 2 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 text-slate-800 dark:text-white leading-none">
                    <span className="text-xs font-black" suppressHydrationWarning>{upcomingEventDates[1]?.day}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5" suppressHydrationWarning>{upcomingEventDates[1]?.month}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      Mid Term Phonics Assessment - UKG
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      09:00 AM - 12:00 PM
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300 text-[10px] font-bold shrink-0">
                  Exam
                </span>
              </div>

              {/* Event 3 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 text-slate-800 dark:text-white leading-none">
                    <span className="text-xs font-black" suppressHydrationWarning>{upcomingEventDates[2]?.day}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5" suppressHydrationWarning>{upcomingEventDates[2]?.month}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      Sports Day Rehearsal
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      02:00 PM - 04:00 PM
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                  Event
                </span>
              </div>

              {/* Event 4 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 text-slate-800 dark:text-white leading-none">
                    <span className="text-xs font-black" suppressHydrationWarning>{upcomingEventDates[3]?.day}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5" suppressHydrationWarning>{upcomingEventDates[3]?.month}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      Fee Payment Due Date
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Last date for term fees
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 text-[10px] font-bold shrink-0">
                  Reminder
                </span>
              </div>

              {/* Event 5 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 text-slate-800 dark:text-white leading-none">
                    <span className="text-xs font-black" suppressHydrationWarning>{upcomingEventDates[4]?.day}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5" suppressHydrationWarning>{upcomingEventDates[4]?.month}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      Annual Day Celebration
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      09:00 AM - 05:00 PM
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0050CB] dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-bold shrink-0">
                  Event
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 3: ADMISSIONS OVERVIEW | FEE COLLECTION OVERVIEW | PENDING FEES
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SECTION 3A: ADMISSIONS OVERVIEW (Spans 6 cols on lg, 4 on xl) */}
        <div className="lg:col-span-6 xl:col-span-4 bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,14,40,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0050CB] flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-[#000E28] dark:text-white">
                  Admissions Overview
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Last 6 months</span>
            </div>

            {/* Content: Left bar chart + Right donut progress */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mt-5">
              {/* 6-Month Bar Chart */}
              <div className="sm:col-span-7">
                <div className="h-32 flex items-end justify-between gap-2 pt-4 px-1">
                  {[
                    { month: 'Apr', value: 18, height: '42%' },
                    { month: 'May', value: 26, height: '58%' },
                    { month: 'Jun', value: 34, height: '74%' },
                    { month: 'Jul', value: 37, height: '82%' },
                    { month: 'Aug', value: 41, height: '90%' },
                    { month: 'Sep', value: 42, height: '94%' },
                  ].map((item) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 mb-1 group-hover:text-[#0050CB] transition-colors">
                        {item.value}
                      </span>
                      <div
                        style={{ height: item.height }}
                        className="w-full max-w-[20px] rounded-t-lg bg-gradient-to-t from-[#4338CA] via-[#4F46E5] to-[#3B82F6] group-hover:from-[#0050CB] group-hover:to-[#38BDF8] transition-all duration-300"
                      />
                      <span className="text-[10px] font-medium text-slate-400 mt-1.5">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Radial Donut Chart */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center text-center pl-2">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      stroke="currentColor"
                      strokeWidth="3.6"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#0050CB]"
                      stroke="currentColor"
                      strokeWidth="3.6"
                      strokeDasharray="80, 100"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-slate-900 dark:text-white">
                    42
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-2">
                  New Admissions
                </p>
                <p className="text-[10px] text-slate-400 font-medium">This Month</p>
                <span className="text-[10px] font-bold text-emerald-600 mt-0.5">
                  ↑ 12.5% <span className="font-normal text-slate-400">vs. last month</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3B: FEE COLLECTION OVERVIEW (Spans 6 cols on lg, 4 on xl) */}
        <div className="lg:col-span-6 xl:col-span-4 bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,14,40,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#000E28] dark:text-white">
                  Fee Collection Overview
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Last 6 months</p>
              </div>
            </div>

            {/* Content: Green Bar Chart + 2 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center mt-5">
              {/* Green Bar Chart */}
              <div className="sm:col-span-7">
                <div className="relative h-32 flex items-end justify-between gap-1.5 pt-6 pl-5 pr-1">
                  {/* Y Axis Guide */}
                  <div className="absolute left-0 top-3 bottom-5 flex flex-col justify-between text-[9px] text-slate-400 text-right pr-1">
                    <span>10L</span>
                    <span>8L</span>
                    <span>6L</span>
                    <span>4L</span>
                    <span>2L</span>
                    <span>0</span>
                  </div>

                  {[
                    { month: 'Apr', height: '42%' },
                    { month: 'May', height: '52%' },
                    { month: 'Jun', height: '60%' },
                    { month: 'Jul', height: '70%' },
                    { month: 'Aug', height: '78%' },
                    { month: 'Sep', height: '90%', isTarget: true },
                  ].map((bar) => (
                    <div key={bar.month} className="flex-1 flex flex-col items-center h-full justify-end relative group">
                      {bar.isTarget && (
                        <span className="absolute -top-5 text-[10px] font-bold text-slate-800 dark:text-white whitespace-nowrap">
                          ₹ 8.42 L
                        </span>
                      )}
                      <div
                        style={{ height: bar.height }}
                        className="w-full max-w-[18px] rounded-t-lg bg-[#10B981] group-hover:bg-emerald-600 transition-colors"
                      />
                      <span className="text-[10px] font-medium text-slate-400 mt-1.5">
                        {bar.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2 Right Metric Cards */}
              <div className="sm:col-span-5 space-y-2.5">
                {/* Collected Card */}
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <IndianRupee className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      Collected
                    </span>
                  </div>
                  <p className="text-base font-black text-emerald-900 dark:text-emerald-100 mt-1">
                    {formatCurrency(stats?.feeStats?.collected, '₹ 8.42 L')}
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                    ↑ 7.2% <span className="font-normal text-slate-400">vs. last month</span>
                  </p>
                </div>

                {/* Pending Card */}
                <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                      <Clock className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                      Pending
                    </span>
                  </div>
                  <p className="text-base font-black text-rose-900 dark:text-rose-100 mt-1">
                    {formatCurrency(stats?.feeStats?.pending, '₹ 2.16 L')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3C: PENDING FEES (Spans 12 cols on lg, 4 on xl) */}
        <div className="lg:col-span-12 xl:col-span-4 bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,14,40,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0050CB] flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-[#000E28] dark:text-white">
                  Pending Fees
                </h3>
              </div>
              <Link
                href="/dashboard/fees?tab=dues"
                className="text-[11px] font-bold text-[#0050CB] hover:underline"
              >
                View All
              </Link>
            </div>

            {/* Pending Fees Table */}
            <div className="overflow-x-auto mt-4 -mx-1 px-1">
              <table className="w-full min-w-[390px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-400">
                    <th className="pb-2.5 pl-0.5 pr-2 text-left whitespace-nowrap">Student Name</th>
                    <th className="pb-2.5 px-2 text-left whitespace-nowrap">Class</th>
                    <th className="pb-2.5 px-2 text-right whitespace-nowrap">Amount</th>
                    <th className="pb-2.5 px-2 text-center whitespace-nowrap">Due Date</th>
                    <th className="pb-2.5 pl-2 pr-0.5 text-right whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs">
                  {stats?.feesDue && stats.feesDue.length > 0 ? (
                    stats.feesDue.slice(0, 5).map((fee: any) => {
                      const student = fee.studentId || {};
                      const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
                      const initial = studentName.charAt(0).toUpperCase() || 'S';
                      const studentGrade = student.grade ? `Class ${student.grade}` : 'Pre-KG A';
                      const remaining = Math.max(0, (fee.totalAmount || 0) - (fee.amountPaid || 0));
                      const amountStr = remaining > 0 ? `₹${remaining.toLocaleString('en-IN')}` : `₹${(fee.totalAmount || 0).toLocaleString('en-IN')}`;
                      const dueDateStr = fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Due Soon';

                      return (
                        <tr key={fee._id || fee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-2.5 pl-0.5 pr-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0050CB] font-bold text-[10px] flex items-center justify-center shrink-0">
                                {initial}
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {studentName}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-slate-500 text-[11px] whitespace-nowrap">{studentGrade}</td>
                          <td className="py-2.5 px-2 text-right font-bold text-rose-500 text-[11px] whitespace-nowrap">{amountStr}</td>
                          <td className="py-2.5 px-2 text-center text-slate-500 text-[10px] whitespace-nowrap">{dueDateStr}</td>
                          <td className="py-2.5 pl-2 pr-0.5 text-right whitespace-nowrap">
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-[9px] font-bold border border-rose-100 dark:border-rose-900/50">
                              {fee.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      {/* Row 1 */}
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-2.5 pl-0.5 pr-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0050CB] font-bold text-[10px] flex items-center justify-center shrink-0">
                              A
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              Aarav Sharma
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-slate-500 text-[11px] whitespace-nowrap">Class 3B</td>
                        <td className="py-2.5 px-2 text-right font-bold text-rose-500 text-[11px] whitespace-nowrap">₹12,000</td>
                        <td className="py-2.5 px-2 text-center text-slate-500 text-[10px] whitespace-nowrap">Sep 20, 2026</td>
                        <td className="py-2.5 pl-2 pr-0.5 text-right whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-[9px] font-bold border border-rose-100 dark:border-rose-900/50">
                            Pending
                          </span>
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-2.5 pl-0.5 pr-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                              D
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              Diya Patel
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-slate-500 text-[11px] whitespace-nowrap">Class 5A</td>
                        <td className="py-2.5 px-2 text-right font-bold text-rose-500 text-[11px] whitespace-nowrap">₹8,500</td>
                        <td className="py-2.5 px-2 text-center text-slate-500 text-[10px] whitespace-nowrap">Sep 22, 2026</td>
                        <td className="py-2.5 pl-2 pr-0.5 text-right whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-[9px] font-bold border border-rose-100 dark:border-rose-900/50">
                            Pending
                          </span>
                        </td>
                      </tr>

                      {/* Row 3 */}
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-2.5 pl-0.5 pr-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                              R
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              Rohan Verma
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-slate-500 text-[11px] whitespace-nowrap">Class 4C</td>
                        <td className="py-2.5 px-2 text-right font-bold text-rose-500 text-[11px] whitespace-nowrap">₹10,000</td>
                        <td className="py-2.5 px-2 text-center text-slate-500 text-[10px] whitespace-nowrap">Sep 25, 2026</td>
                        <td className="py-2.5 pl-2 pr-0.5 text-right whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-[9px] font-bold border border-rose-100 dark:border-rose-900/50">
                            Pending
                          </span>
                        </td>
                      </tr>

                      {/* Row 4 */}
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-2.5 pl-0.5 pr-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                              A
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              Ananya Singh
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-slate-500 text-[11px] whitespace-nowrap">Class 2B</td>
                        <td className="py-2.5 px-2 text-right font-bold text-rose-500 text-[11px] whitespace-nowrap">₹7,500</td>
                        <td className="py-2.5 px-2 text-center text-slate-500 text-[10px] whitespace-nowrap">Sep 28, 2026</td>
                        <td className="py-2.5 pl-2 pr-0.5 text-right whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-[9px] font-bold border border-rose-100 dark:border-rose-900/50">
                            Pending
                          </span>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
