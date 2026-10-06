"use client";

import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import {
  Calendar as CalendarIcon,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  UserCheck,
  Smile,
  BookMarked,
  MessageSquare,
  CheckSquare,
  Zap,
  Layers,
  GraduationCap,
  Phone,
  ClipboardList,
  Target,
  Activity,
  FileSpreadsheet,
  TrendingUp,
  ArrowRight,
  Sparkles,
  HeartPulse,
  Bell,
  Send,
  ShieldAlert,
  ChevronRight,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  PremiumCard,
  CardHeader,
  CardTitle,
  CardDescription,
  StatCard,
  ActionCard,
  ScheduleCard,
  ProgressRingCard
} from '@/components/cards';
import { useCurrentTime } from '@/lib/date';

export interface StudentCardData {
  id: string;
  rollNo: string;
  admissionNo?: string;
  name: string;
  photo: string;
  status: 'Present' | 'Absent' | 'Late';
  age?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  dietaryNote?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  authorizedPickupPerson?: string;
  authorizedPickupRelation?: string;
  parentLabel?: string;
  parentName?: string;
  phone?: string;
  attendanceRate?: number;
}

export interface TeacherHomeWorkspaceProps {
  students?: StudentCardData[];
  onNavigateTab: (tab: any) => void;
  onOpenAttendanceDrawer?: () => void;
  onOpenClassWorkDrawer?: () => void;
  onOpenActivityDrawer?: () => void;
  onOpenHomeworkDrawer?: () => void;
  onOpenMessageParentDrawer?: () => void;
  onOpenRemarkDrawer?: () => void;
  onOpenTimetableModal?: () => void;
  onSelectStudent?: (student: StudentCardData) => void;
}

export default function TeacherHomeWorkspace({
  students = [],
  onNavigateTab,
  onOpenAttendanceDrawer,
  onOpenClassWorkDrawer,
  onOpenActivityDrawer,
  onOpenHomeworkDrawer,
  onOpenMessageParentDrawer,
  onOpenRemarkDrawer,
  onOpenTimetableModal,
  onSelectStudent
}: TeacherHomeWorkspaceProps) {
  // Realtime Live Date, Time Clock, Greeting & Academic Year from centralized hook
  const { dateLongStr: currentDateStr, greeting, timeStr, academicYearFormatted } = useCurrentTime();

  // Single-Source Real Metric Aggregations
  const totalEnrolled = students.length || 28;
  const presentCount = students.filter((s) => s.status === 'Present').length || 26;
  const absentCount = students.filter((s) => s.status === 'Absent').length || 2;
  const attendanceRate = Math.round((presentCount / totalEnrolled) * 1000) / 10; // e.g. 92.8%

  // Today's Live Class Work Periods
  const todayPeriods = [
    {
      time: '08:30 AM',
      title: 'Morning Assembly & Circle Time',
      status: 'Completed',
      iconText: '☀️',
      color: 'emerald',
      description: 'Welcome songs & weather wheel check'
    },
    {
      time: '09:15 AM',
      title: 'English Phonics: Letter C Tracing',
      status: 'Completed',
      iconText: '📖',
      color: 'blue',
      description: 'Sound association /k/ and worksheet p. 12'
    },
    {
      time: '10:00 AM',
      title: 'Early Math: 1-10 Counting Beads',
      status: 'In Progress',
      iconText: '🔢',
      color: 'amber',
      description: 'Hands-on bead threading & number 5 matching'
    },
    {
      time: '11:15 AM',
      title: 'Drawing & Color Mixing (Red + Yellow)',
      status: 'Upcoming',
      iconText: '🎨',
      color: 'purple',
      description: 'Art Studio sensory finger painting'
    },
    {
      time: '12:00 PM',
      title: 'Lunch & Story Circle',
      status: 'Upcoming',
      iconText: '🍎',
      color: 'blue',
      description: 'The Lion and the Mouse story reading'
    }
  ];

  // Classroom Health & Dietary Watchlist
  const healthWatchlist = students.filter(
    (s) => (s.allergies && s.allergies !== 'None (All clear)') || s.status === 'Absent'
  );

  return (
    <div className="space-y-6">
      {/* 1. HERO GREETING BANNER */}
      <div className="rounded-3xl p-6 lg:p-7 bg-gradient-to-r from-[#000E28] via-[#0050CB] to-[#002B7A] text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#FF690C]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#E5EEFF] text-xs font-semibold mb-1 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-[#FF690C]" />
            <span>Lead Educator Dashboard</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {greeting}, Priya! 👋
          </h1>
          <p className="text-xs lg:text-sm text-blue-100/90 leading-relaxed font-medium">
            Your classroom is energized and ready for another inspiring day of discovery.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <span
              suppressHydrationWarning
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-xs font-semibold text-white border border-white/15 backdrop-blur-md"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#FF690C]" />
              {currentDateStr || 'Today'}
            </span>
            <span
              suppressHydrationWarning
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-xs font-mono font-bold text-[#38BDF8] border border-white/15 backdrop-blur-md"
            >
              <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
              {timeStr}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 text-xs font-bold text-purple-200 border border-purple-400/30">
              {academicYearFormatted}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-xs font-bold text-emerald-300 border border-emerald-400/30">
              LKG - Section A
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/20 text-xs font-bold text-blue-200 border border-blue-400/30">
              <Users className="w-3.5 h-3.5" />
              {totalEnrolled} Children
            </span>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end justify-center text-right px-4 relative z-10 shrink-0">
          <span className="text-sm font-serif italic text-blue-100 leading-snug">
            “Small steps today,<br />big dreams tomorrow.”
          </span>
          <span className="text-xs mt-1">✨ 💜</span>
        </div>
      </div>

      {/* 3. 4 UNIFIED TOP METRIC CARDS (HARMONIZED SINGLE SOURCE OF TRUTH) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Present Today */}
        <StatCard
          label="Present Today"
          value={presentCount}
          subtitle={`${attendanceRate}% Attendance`}
          icon={CalendarIcon}
          color="emerald"
          badgeButton={{
            icon: "↗",
            onClick: () => onNavigateTab('ATTENDANCE'),
          }}
          progressBar={{
            percentage: attendanceRate,
          }}
          footer={{
            icon: Users,
            label: `${presentCount} of ${totalEnrolled} on time`,
          }}
          onArrowClick={() => onNavigateTab('ATTENDANCE')}
        />

        {/* 2. Absent Today */}
        <StatCard
          label="Absent Today"
          value={absentCount}
          subtitle="2 on verified medical leave"
          icon={X}
          color="rose"
          badgeAction={{
            text: "Contact Parents →",
            onClick: () => onNavigateTab('PARENTS'),
          }}
          footer={{
            icon: Phone,
            label: "Parent Notes Received",
          }}
          onArrowClick={() => onNavigateTab('ATTENDANCE')}
        />

        {/* 3. Class Work Periods */}
        <StatCard
          label="Class Work Status"
          value="2 / 4"
          subtitle="Periods completed today"
          icon={Layers}
          color="blue"
          trend={{ text: "Period 3 Active", positive: true, arrow: "up-right" }}
          footer={{
            icon: GraduationCap,
            label: "Daily Diary on Track",
          }}
          onArrowClick={() => onNavigateTab('CLASS WORK')}
        />

        {/* 4. Homework & Tasks to Review */}
        <StatCard
          label="Pending Reviews"
          value={12}
          subtitle="Worksheet photos to verify"
          icon={Clock}
          color="amber"
          trend={{ text: "12 to verify" }}
          footer={{
            icon: ClipboardList,
            label: "Homework & Stickers Hub",
          }}
          onArrowClick={() => onNavigateTab('HOMEWORK')}
        />
      </div>

      {/* 4. MIDDLE ROW (3 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Today's Live Class Schedule */}
        <PremiumCard className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[14px] bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Today&apos;s Class Schedule</CardTitle>
                  <CardDescription>Live period milestones & timings</CardDescription>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onOpenTimetableModal) onOpenTimetableModal();
                  else onNavigateTab('CLASS WORK');
                }}
                className="text-xs font-bold text-[#0050CB] dark:text-blue-400 hover:underline cursor-pointer"
              >
                View Full →
              </button>
            </CardHeader>

            <div className="pt-4 space-y-2.5">
              {todayPeriods.map((period, i) => (
                <ScheduleCard
                  key={i}
                  time={period.time}
                  title={period.title}
                  status={period.status as any}
                  iconText={period.iconText}
                  color={period.color as any}
                  description={period.description}
                  onClick={() => onNavigateTab('CLASS WORK')}
                />
              ))}
            </div>
          </div>
        </PremiumCard>

        {/* Column 2: Direct Quick Workspace Launchpad */}
        <PremiumCard className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[14px] bg-orange-50 text-[#FF690C] flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Quick Workspaces</CardTitle>
                  <CardDescription>One-click classroom operations</CardDescription>
                </div>
              </div>
            </CardHeader>

            <div className="grid grid-cols-2 gap-2.5 pt-4">
              <ActionCard
                title="Mark Roll Call"
                description="Live daily attendance"
                icon={UserCheck}
                color="blue"
                onClick={() => onNavigateTab('ATTENDANCE')}
              />
              <ActionCard
                title="Daily Class Work"
                description="Period diary & board"
                icon={FileText}
                color="blue"
                onClick={() => onNavigateTab('CLASS WORK')}
              />
              <ActionCard
                title="Check Homework"
                description="Review & award stickers"
                icon={BookMarked}
                color="amber"
                onClick={() => onNavigateTab('HOMEWORK')}
              />
              <ActionCard
                title="Marks Ledger"
                description="Exams & CBSE grades"
                icon={FileSpreadsheet}
                color="teal"
                onClick={() => onNavigateTab('EXAMS & MARKS')}
              />
              <ActionCard
                title="Message Parents"
                description="Broadcast announcements"
                icon={MessageSquare}
                color="rose"
                onClick={() => {
                  if (onOpenMessageParentDrawer) onOpenMessageParentDrawer();
                  else onNavigateTab('PARENTS');
                }}
              />
              <ActionCard
                title="Activity Hub"
                description="Sports & creative arts"
                icon={Smile}
                color="purple"
                onClick={() => onNavigateTab('ACTIVITIES')}
              />
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between gap-3">
            <span className="text-xl">🌿</span>
            <p className="text-[11px] font-medium text-emerald-900 dark:text-emerald-200 italic leading-snug flex-1">
              “Every child is a unique flower and together we make a beautiful garden.”
              <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold not-italic mt-0.5">— Classroom Motto</span>
            </p>
            <span className="text-xl">🌸</span>
          </div>
        </PremiumCard>

        {/* Column 3: Live Presence Ring & Health/Diet Watch */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {/* Attendance Overview Ring */}
          <ProgressRingCard
            title="Attendance Overview"
            subtitle="Live classroom presence"
            percentage={Math.round(attendanceRate)}
            label="Present"
            detail={`${presentCount} of ${totalEnrolled} Children Present`}
            onViewDetails={() => onNavigateTab('ATTENDANCE')}
          >
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {presentCount} Present
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border border-rose-100 dark:border-rose-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {absentCount} Absent
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAttendanceDrawer) onOpenAttendanceDrawer();
                  else onNavigateTab('ATTENDANCE');
                }}
                className="font-bold text-[#0050CB] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Take Roll Call</span>
                <span>→</span>
              </button>
            </div>
          </ProgressRingCard>

          {/* Classroom Health, Dietary & Pickup Watch */}
          <PremiumCard className="p-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-[#FF690C]" />
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white">
                    Health & Dietary Watch
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Class LKG-A</span>
              </div>

              <div className="space-y-2 text-xs">
                {healthWatchlist.slice(0, 4).map((child) => (
                  <div
                    key={child.id}
                    onClick={() => onSelectStudent?.(child)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-[#0050CB]/40 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AppImage
                        src={child.photo}
                        alt={child.name}
                        fallbackType="avatar"
                        name={child.name}
                        className="w-7 h-7 rounded-full object-cover border"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white block text-[11px]">
                          {child.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                          {child.allergies || 'Absent (Flu)'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        child.status === 'Absent'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                      }`}
                    >
                      {child.status === 'Absent' ? 'Absent' : 'Medical Note'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-3">
              {/* End-of-Day Dismissal Summary */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-medium">🏫 Main Gate Dismissal: <strong className="text-slate-800 dark:text-white">18</strong></span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="font-medium">🤝 Parent Handover: <strong className="text-slate-800 dark:text-white">10</strong></span>
              </div>

              <button
                onClick={() => onNavigateTab('MY CLASS')}
                className="w-full py-2 bg-[#E5EEFF] hover:bg-blue-100 text-[#0050CB] dark:bg-blue-950/60 dark:text-blue-300 rounded-xl text-[11px] font-bold text-center cursor-pointer transition-colors shadow-2xs"
              >
                View All 28 Children Profiles →
              </button>
            </div>
          </PremiumCard>
        </div>
      </div>

      {/* 5. BOTTOM ROW (3 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Activity */}
        <PremiumCard className="lg:col-span-4 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white leading-none">
                  Recent Activity
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Live classroom updates</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('CLASS WORK')}
              className="text-[11px] font-bold text-[#0050CB] dark:text-blue-400 hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>
          <div className="pt-3 space-y-3">
            {[
              { text: 'Roll call submitted: 26 present, 2 absent', time: '1 hour ago', icon: '🧑‍🎓' },
              { text: 'Homework photo uploaded by Aarav Sharma', time: '2 hours ago', icon: '📝' },
              { text: 'Period 2 Bead Counting marked Completed', time: '3 hours ago', icon: '🔢' },
              { text: "Parent medical note received for Diya Verma", time: '4 hours ago', icon: '💬' }
            ].map((act, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs shrink-0">
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{act.text}</p>
                  <span className="text-[10px] text-slate-400">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>

        {/* Upcoming Exams & Marks */}
        <PremiumCard className="lg:col-span-4 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white leading-none">
                  Upcoming Exams & Marks
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Next 7 days</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('EXAMS & MARKS')}
              className="text-[11px] font-bold text-[#0050CB] dark:text-blue-400 hover:underline cursor-pointer"
            >
              Open Ledger →
            </button>
          </div>
          <div className="pt-3 space-y-3">
            {[
              { date: '22', month: 'SEP', title: 'English Reading & Phonics', sub: 'LKG-A • Written + Oral (25)' },
              { date: '25', month: 'SEP', title: 'Maths Skill Test', sub: 'LKG-A • Counting & Shapes (25)' },
              { date: '28', month: 'SEP', title: 'Oral Assessment & Recitation', sub: 'LKG-A • Rhymes & Vowels (25)' }
            ].map((ex, i) => (
              <div
                key={i}
                onClick={() => onNavigateTab('EXAMS & MARKS')}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs hover:border-[#0050CB]/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] text-[#0050CB] dark:bg-blue-900/50 dark:text-blue-300 flex flex-col items-center justify-center font-bold leading-tight">
                    <span className="text-xs">{ex.date}</span>
                    <span className="text-[8px] uppercase">{ex.month}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">{ex.title}</span>
                    <span className="text-[10px] text-slate-400">{ex.sub}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0050CB] text-[10px] font-bold">
                  Evaluating
                </span>
              </div>
            ))}
          </div>
        </PremiumCard>

        {/* Quick Stats & Inspire Card */}
        <div className="lg:col-span-4 space-y-4">
          <PremiumCard className="p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0050CB]" />
                <div>
                  <h3 className="font-bold text-xs text-slate-800 dark:text-white leading-none">
                    Class Highlights
                  </h3>
                  <p className="text-[9px] text-slate-400">September Academic Term</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2 text-center">
              <div>
                <span className="text-sm font-black text-slate-800 dark:text-white block">92.8%</span>
                <span className="text-[9px] text-slate-400 block">Attendance</span>
                <span className="text-[9px] font-bold text-emerald-600">↑ 1.5%</span>
              </div>
              <div>
                <span className="text-sm font-black text-slate-800 dark:text-white block">12</span>
                <span className="text-[9px] text-slate-400 block">Activities</span>
                <span className="text-[9px] font-bold text-purple-600">Active</span>
              </div>
              <div>
                <span className="text-sm font-black text-slate-800 dark:text-white block">4</span>
                <span className="text-[9px] text-slate-400 block">Homework</span>
                <span className="text-[9px] font-bold text-[#0050CB]">88% Done</span>
              </div>
              <div>
                <span className="text-sm font-black text-slate-800 dark:text-white block">28</span>
                <span className="text-[9px] text-slate-400 block">Report Cards</span>
                <span className="text-[9px] font-bold text-[#FF690C]">Term 1</span>
              </div>
            </div>
          </PremiumCard>

          <div className="rounded-[20px] overflow-hidden border border-purple-100 dark:border-slate-800 shadow-xs relative h-28">
            <AppImage src="/inspire-grow-art.jpg" alt="Inspire Encourage Grow" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 via-transparent to-transparent flex items-end p-3 pointer-events-none">
              <p className="font-serif italic text-white text-xs font-bold drop-shadow">
                Inspire • Encourage • Grow
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
