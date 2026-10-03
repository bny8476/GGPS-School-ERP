"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Home, ChevronRight, Calendar, ChevronDown, Check, Download, 
  GraduationCap, BookOpen, CheckCircle2, FileText, Star, Trophy, 
  Calculator, FlaskConical, Globe, Languages, Laptop, ClipboardList, 
  Zap, UploadCloud, User, Megaphone, Clock, Sparkles, TrendingUp, 
  CheckCircle, ArrowUpRight
} from "lucide-react";
import toast from "react-hot-toast";
import ReportCardModal from "@/components/parent/ReportCardModal";
import { useParent } from "@/context/ParentContext";
import { getCurrentAcademicYearFormatted, getAcademicYearDisplayOptions } from "@/lib/date";

export default function AcademicProgressPage() {
  const { selectedChild } = useParent();
  const [selectedTerm, setSelectedTerm] = useState<"All Subjects" | "Term 1" | "Term 2" | "Term 3" | "Term 4">("All Subjects");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(() => getCurrentAcademicYearFormatted());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState<boolean>(false);
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState<boolean>(false);

  const child = selectedChild || {
    _id: "c10101010101010101010101",
    firstName: "Aarav",
    lastName: "Sharma",
    grade: "LKG",
    section: "Section A",
    rollNumber: "LKG-014",
    studentPhoto: "/aarav-profile-avatar.png",
  };

  // Top KPI Stats
  const kpiStats = [
    {
      title: "Overall Progress",
      value: "92%",
      trend: "↑ 4%",
      trendColor: "text-emerald-500",
      subtext: "Excellent Performance",
      icon: BookOpen,
      iconBg: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-[#0050CB] dark:text-[#38BDF8]",
      progressBar: 92,
      progressColor: "bg-[#0050CB]"
    },
    {
      title: "Completed Subjects",
      value: "8",
      trend: "↑ 1",
      trendColor: "text-emerald-500",
      subtext: "Out of 10",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Assignments Submitted",
      value: "12",
      trend: "↑ 3",
      trendColor: "text-emerald-500",
      subtext: "This Month",
      icon: FileText,
      iconBg: "bg-purple-50 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Average Score",
      value: "86%",
      trend: "↑ 5%",
      trendColor: "text-emerald-500",
      subtext: "Across All Subjects",
      icon: Star,
      iconBg: "bg-amber-50 dark:bg-amber-900/30",
      iconColor: "text-amber-500 dark:text-amber-400"
    },
    {
      title: "Rank",
      value: "2nd",
      trend: "↑ 1",
      trendColor: "text-emerald-500",
      subtext: "In Class",
      icon: Trophy,
      iconBg: "bg-rose-50 dark:bg-rose-900/30",
      iconColor: "text-rose-500 dark:text-rose-400"
    }
  ];

  // Subject Wise Performance Data
  const subjectsData = [
    {
      name: "Mathematics",
      score: 95,
      grade: "A+",
      gradeBg: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
      icon: Calculator,
      iconBg: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-[#0050CB] dark:text-[#38BDF8]",
      barGradient: "from-blue-600 to-cyan-500"
    },
    {
      name: "English",
      score: 88,
      grade: "A",
      gradeBg: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
      icon: BookOpen,
      iconBg: "bg-pink-50 dark:bg-pink-900/30",
      iconColor: "text-pink-600 dark:text-pink-400",
      barGradient: "from-pink-500 to-rose-500"
    },
    {
      name: "Science",
      score: 84,
      grade: "A",
      gradeBg: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
      icon: FlaskConical,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      barGradient: "from-emerald-500 to-teal-500"
    },
    {
      name: "Social Studies",
      score: 90,
      grade: "A+",
      gradeBg: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
      icon: Globe,
      iconBg: "bg-amber-50 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      barGradient: "from-orange-500 to-amber-500"
    },
    {
      name: "Hindi",
      score: 85,
      grade: "A",
      gradeBg: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
      icon: Languages,
      iconBg: "bg-purple-50 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      barGradient: "from-purple-500 to-indigo-500"
    },
    {
      name: "Computer",
      score: 78,
      grade: "B+",
      gradeBg: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
      icon: Laptop,
      iconBg: "bg-cyan-50 dark:bg-cyan-900/30",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      barGradient: "from-cyan-500 to-blue-500"
    }
  ];

  // Recent Assessments Data
  const recentAssessments = [
    {
      id: "test-1",
      title: "Unit Test 1",
      subject: "Mathematics",
      date: "15 Sep 2026",
      score: "92/100",
      status: "Completed",
      icon: BookOpen,
      iconBg: "bg-blue-50 text-[#0050CB] dark:bg-blue-900/30 dark:text-[#38BDF8]"
    },
    {
      id: "test-2",
      title: "Grammar Test",
      subject: "English",
      date: "13 Sep 2026",
      score: "88/100",
      status: "Completed",
      icon: BookOpen,
      iconBg: "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
    },
    {
      id: "test-3",
      title: "Science Quiz",
      subject: "Science",
      date: "10 Sep 2026",
      score: "76/100",
      status: "Completed",
      icon: FlaskConical,
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
    },
    {
      id: "test-4",
      title: "Social Studies Test",
      subject: "Social Studies",
      date: "07 Sep 2026",
      score: "90/100",
      status: "Completed",
      icon: Globe,
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
    },
    {
      id: "test-5",
      title: "Hindi Reading",
      subject: "Hindi",
      date: "05 Sep 2026",
      score: "—",
      status: "Pending",
      icon: Languages,
      iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
    }
  ];

  // Upcoming Events Data
  const upcomingEvents = [
    {
      date: "20",
      month: "Sep",
      title: "PTM (Parent Teacher Meeting)",
      time: "09:00 AM - 11:00 AM",
      status: "Upcoming"
    },
    {
      date: "22",
      month: "Sep",
      title: "Maths Class Test",
      time: "10:30 AM - 11:30 AM",
      status: "Upcoming"
    },
    {
      date: "25",
      month: "Sep",
      title: "School Annual Day Preparation",
      time: "01:00 PM - 03:00 PM",
      status: "Pending"
    }
  ];

  // Announcements Data
  const announcements = [
    {
      text: "School will remain closed on 25th September 2026 due to Teacher Training.",
      date: "20 Sep 2026"
    },
    {
      text: "Parent-Teacher Meeting schedule is updated. Please check the calendar.",
      date: "18 Sep 2026"
    },
    {
      text: "New sessional assessment guidelines are available in the documents section.",
      date: "15 Sep 2026"
    }
  ];

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* 1. Breadcrumb Top Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/parent" className="hover:text-[#0050CB] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
        <span className="text-slate-800 dark:text-slate-200 font-bold">
          Academic Progress
        </span>
      </div>

      {/* 2. Hero Banner */}
      <div className="relative rounded-[26px] bg-gradient-to-r from-[#EBF3FF] via-[#E8F1FE] to-[#DDEBFF] dark:from-[#091E42] dark:via-[#0A2554] dark:to-[#091E42] border border-[#CDE1FF] dark:border-blue-900/40 p-6 sm:p-7 shadow-xs">
        
        {/* Subtle cloud and glow elements (clipped inside inner container) */}
        <div className="absolute inset-0 rounded-[26px] overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/40 dark:bg-blue-500/10 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-1/4 w-56 h-36 bg-blue-100/40 dark:bg-blue-400/5 rounded-full blur-xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Left Title & Description */}
          <div className="flex items-start sm:items-center gap-4 max-w-xl">
            {/* Graduation Cap Icon Square Box */}
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#0050CB] flex items-center justify-center text-white shadow-md shadow-[#0050CB]/25 shrink-0">
              <GraduationCap className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-[28px] font-black text-[#000E28] dark:text-white tracking-tight leading-tight">
                Academic Progress
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed max-w-lg">
                Track your child&apos;s learning journey, performance and overall development with detailed reports and insights.
              </p>
            </div>
          </div>

          {/* Right: Academic Year Pill Dropdown (Aligned & unclipped) */}
          <div className="self-start md:self-auto shrink-0 relative z-30 w-48">
            <button
              type="button"
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between hover:border-[#0050CB]/40 shadow-2xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#0050CB] shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-medium block leading-none">
                    Academic Year
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {selectedAcademicYear}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-1 transition-transform ${isYearDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isYearDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsYearDropdownOpen(false)} 
                />
                <div className="absolute left-0 right-0 mt-2 w-full rounded-2xl bg-white dark:bg-[#07142F] border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                  {getAcademicYearDisplayOptions().map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setSelectedAcademicYear(yr);
                        setIsYearDropdownOpen(false);
                        toast.success(`Academic Year: ${yr}`);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors ${
                        selectedAcademicYear === yr ? "text-[#0050CB] font-bold bg-blue-50/50 dark:bg-blue-900/20" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{yr}</span>
                      {selectedAcademicYear === yr && <Check className="w-3.5 h-3.5 text-[#0050CB]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>


      </div>

      {/* 3. Top Metrics Row (5 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiStats.map((stat, idx) => {
          const Icon = stat.icon;

          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#07142F] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-white/10 shadow-xs flex flex-col justify-between hover:border-[#0050CB]/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${stat.trendColor}`}>
                  {stat.trend}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {stat.title}
                </p>
                <p className="text-2xl font-black text-[#000E28] dark:text-white mt-0.5 tracking-tight">
                  {stat.value}
                </p>
              </div>

              {stat.progressBar ? (
                <div className="mt-3">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${stat.progressColor} transition-all duration-500`} 
                      style={{ width: `${stat.progressBar}%` }} 
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                    {stat.subtext}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-2">
                  {stat.subtext}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Subject Wise Performance + School Announcements (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Subject Wise Performance */}
          <div className="bg-white dark:bg-[#07142F] rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-white/10 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0050CB] flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#000E28] dark:text-white">
                  Subject Wise Performance
                </h2>
              </div>

              <button
                type="button"
                onClick={() => toast("Viewing detailed subject metrics...")}
                className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {(["All Subjects", "Term 1", "Term 2", "Term 3", "Term 4"] as const).map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSelectedTerm(term)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedTerm === term
                      ? "bg-[#0050CB] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Subject Rows */}
            <div className="space-y-3.5 pt-1">
              {subjectsData.map((subj, idx) => {
                const Icon = subj.icon;

                return (
                  <div key={idx} className="flex items-center gap-3">
                    {/* Subject Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${subj.iconBg} ${subj.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Name */}
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-28 shrink-0 truncate">
                      {subj.name}
                    </span>

                    {/* Horizontal Bar */}
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${subj.barGradient} transition-all duration-500`}
                        style={{ width: `${subj.score}%` }}
                      />
                    </div>

                    {/* Score */}
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 w-9 text-right shrink-0">
                      {subj.score}%
                    </span>

                    {/* Grade Badge */}
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border shrink-0 ${subj.gradeBg}`}>
                      {subj.grade}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Card: School Announcements */}
          <div className="bg-white dark:bg-[#07142F] rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0050CB] flex items-center justify-center">
                  <Megaphone className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-extrabold text-[#000E28] dark:text-white">
                  School Announcements
                </h3>
              </div>

              <Link
                href="/parent/events"
                className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 mt-3">
              {announcements.map((ann, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0050CB] shrink-0 mt-1.5" />
                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {ann.text}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0 whitespace-nowrap">
                    {ann.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Column 2: Recent Assessments + Attendance Overview (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Recent Assessments */}
          <div className="bg-white dark:bg-[#07142F] rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-white/10 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0050CB] flex items-center justify-center">
                  <ClipboardList className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#000E28] dark:text-white">
                  Recent Assessments
                </h2>
              </div>

              <Link
                href="/parent/assessments"
                className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Assessment Items */}
            <div className="space-y-3">
              {recentAssessments.map((test) => {
                const Icon = test.icon;

                return (
                  <div
                    key={test.id}
                    className="p-3 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-[#0050CB]/30 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${test.iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#000E28] dark:text-white leading-tight truncate">
                          {test.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {test.subject} • {test.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {test.score}
                      </span>

                      {test.status === "Completed" ? (
                        <span className="bg-[#EAFBF3] dark:bg-emerald-950/40 text-[#0E9F6E] dark:text-emerald-400 border border-[#BFF1D6] dark:border-emerald-800/40 text-[11px] font-bold px-2 py-0.5 rounded-md">
                          Completed
                        </span>
                      ) : (
                        <span className="bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 border border-[#FDE68A] dark:border-amber-800/40 text-[11px] font-bold px-2 py-0.5 rounded-md">
                          Pending
                        </span>
                      )}

                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#0050CB] transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Card: Attendance Overview */}
          <div className="bg-white dark:bg-[#07142F] rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0050CB] flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-extrabold text-[#000E28] dark:text-white">
                  Attendance Overview
                </h3>
              </div>

              <Link
                href="/parent/attendance"
                className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
              >
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center justify-around gap-4 pt-1">
              {/* Donut Chart */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Present 92% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-[#0E9F6E]"
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - 0.92)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Absent 5% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-rose-500"
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - 0.05)}
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black text-[#000E28] dark:text-white leading-none">
                    92%
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                    Present
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0E9F6E]" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Present</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white">92%</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Absent</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white">5%</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Late</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white">3%</span>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 text-[11px] text-slate-400">
                  <span>Total Days</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">20</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Column 3: Quick Actions + Upcoming Events + Quote Card (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Card 1: Quick Actions */}
          <div className="bg-white dark:bg-[#07142F] rounded-3xl p-5 border border-slate-100 dark:border-white/10 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0050CB] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 fill-[#0050CB] text-[#0050CB]" />
                </div>
                <h3 className="text-sm font-extrabold text-[#000E28] dark:text-white">
                  Quick Actions
                </h3>
              </div>

              <Link
                href="/parent/assessments"
                className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 6 Actions in 2-column grid */}
            <div className="grid grid-cols-2 gap-2">
              
              {/* 1. Download Report Card */}
              <button
                type="button"
                onClick={() => setIsReportCardModalOpen(true)}
                className="bg-[#F0F7FF] dark:bg-blue-950/30 hover:bg-[#E2F0FE] dark:hover:bg-blue-900/40 border border-[#D8EAFD] dark:border-blue-800/30 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center group"
              >
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-blue-900/50 flex items-center justify-center text-[#0050CB] shadow-2xs group-hover:scale-105 transition-transform">
                  <Download className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#0050CB] dark:text-[#38BDF8] leading-tight">
                  Download Report Card
                </span>
              </button>

              {/* 2. View Assignments */}
              <Link
                href="/parent/diary"
                className="bg-[#FAF5FF] dark:bg-purple-950/30 hover:bg-[#F3E8FF] dark:hover:bg-purple-900/40 border border-[#E9D5FF] dark:border-purple-800/30 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center group"
              >
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-purple-900/50 flex items-center justify-center text-[#9333EA] shadow-2xs group-hover:scale-105 transition-transform">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#9333EA] dark:text-purple-300 leading-tight">
                  View Assignments
                </span>
              </Link>

              {/* 3. View Marksheets */}
              <Link
                href="/parent/assessments"
                className="bg-[#F0FDF4] dark:bg-emerald-950/30 hover:bg-[#DCFCE7] dark:hover:bg-emerald-900/40 border border-[#BBF7D0] dark:border-emerald-800/30 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center group"
              >
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-emerald-900/50 flex items-center justify-center text-[#16A34A] shadow-2xs group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#16A34A] dark:text-emerald-300 leading-tight">
                  View Marksheets
                </span>
              </Link>

              {/* 4. Upload Document */}
              <Link
                href="/parent/documents"
                className="bg-[#FFFBEB] dark:bg-amber-950/30 hover:bg-[#FEF3C7] dark:hover:bg-amber-900/40 border border-[#FDE68A] dark:border-amber-800/30 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center group"
              >
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-amber-900/50 flex items-center justify-center text-[#D97706] shadow-2xs group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#D97706] dark:text-amber-300 leading-tight">
                  Upload Document
                </span>
              </Link>

              {/* 5. View Syllabus */}
              <button
                type="button"
                onClick={() => toast("Opening Academic Curriculum & Syllabus...")}
                className="bg-[#FDF2F8] dark:bg-pink-950/30 hover:bg-[#FCE7F3] dark:hover:bg-pink-900/40 border border-[#FBCFE8] dark:border-pink-800/30 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center group"
              >
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-pink-900/50 flex items-center justify-center text-[#DB2777] shadow-2xs group-hover:scale-105 transition-transform">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#DB2777] dark:text-pink-300 leading-tight">
                  View Syllabus
                </span>
              </button>

              {/* 6. Contact Teacher */}
              <Link
                href="/parent/messages"
                className="bg-[#F5F3FF] dark:bg-indigo-950/30 hover:bg-[#EDE9FE] dark:hover:bg-indigo-900/40 border border-[#DDD6FE] dark:border-indigo-800/30 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center group"
              >
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-indigo-900/50 flex items-center justify-center text-[#7C3AED] shadow-2xs group-hover:scale-105 transition-transform">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#7C3AED] dark:text-indigo-300 leading-tight">
                  Contact Teacher
                </span>
              </Link>

            </div>
          </div>

          {/* Card 2: Upcoming Events */}
          <div className="bg-white dark:bg-[#07142F] rounded-3xl p-5 border border-slate-100 dark:border-white/10 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0050CB] flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-extrabold text-[#000E28] dark:text-white">
                  Upcoming Events
                </h3>
              </div>

              <Link
                href="/parent/events"
                className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {upcomingEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between gap-3 hover:border-[#0050CB]/30 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0050CB] dark:text-[#38BDF8] flex flex-col items-center justify-center shrink-0 leading-none">
                      <span className="text-xs font-black">{evt.date}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">{evt.month}</span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#000E28] dark:text-white truncate">
                        {evt.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                        {evt.time}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    evt.status === "Upcoming"
                      ? "bg-blue-50 text-[#0050CB] dark:bg-blue-950/40 dark:text-blue-400"
                      : "bg-amber-50 text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400"
                  }`}>
                    {evt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>



        </div>

      </div>

      {/* Report Card Modal */}
      {isReportCardModalOpen && (
        <ReportCardModal
          isOpen={isReportCardModalOpen}
          onClose={() => setIsReportCardModalOpen(false)}
          child={child}
        />
      )}

    </div>
  );
}
