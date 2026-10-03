"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ClipboardList, CheckCircle2, Clock, Star, Calculator, BookOpen, 
  FlaskConical, Globe, Languages, Laptop, FileText, Download, 
  Eye, UploadCloud, ChevronDown, Check, ArrowRight, ArrowUpRight, 
  ArrowDownRight, Sparkles, User, FileSpreadsheet, X, HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";
import ReportCardModal from "@/components/parent/ReportCardModal";
import { useParent } from "@/context/ParentContext";
import { getCurrentAcademicYearFormatted, getAcademicYearDisplayOptions } from "@/lib/date";

interface SubjectScore {
  name: string;
  icon: React.ElementType;
  score: number;
  gradeLabel: string;
  badgeBg: string;
  badgeText: string;
  iconColor: string;
  iconBg: string;
  barColor: string;
}

interface AssessmentResult {
  id: string;
  date: string;
  exam: string;
  type: "Monthly Test" | "Unit Test" | "Term Exams" | "Assignments";
  subject: string;
  subjectIcon: React.ElementType;
  subjectColor: string;
  marks: string;
  totalMarks: number;
  obtainedMarks?: number;
  status: "Completed" | "Pending";
  remarks?: string;
}

interface UpcomingAssessment {
  id: string;
  month: string;
  day: string;
  title: string;
  timing: string;
  status: "Upcoming" | "Pending";
}

export default function ParentAssessmentsPage() {
  const { selectedChild } = useParent();
  const [activeExamFilter, setActiveExamFilter] = useState<string>("All Exams");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All Subjects");
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(() => getCurrentAcademicYearFormatted());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedResultModal, setSelectedResultModal] = useState<AssessmentResult | null>(null);
  const [isMarksheetModalOpen, setIsMarksheetModalOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);

  const child = selectedChild || {
    _id: "c-01",
    firstName: "Aarav",
    lastName: "Sharma",
    grade: "LKG",
    section: "Section A",
    admissionNumber: "GGPS-2024-8891",
    rollNumber: "14",
    teacherName: "Ms. Ananya Roy",
  };

  // Exam type filter pills
  const examPills = [
    { label: "All Exams", icon: Sparkles },
    { label: "Monthly Test", icon: ClipboardList },
    { label: "Unit Test", icon: FileText },
    { label: "Term Exams", icon: BookOpen },
    { label: "Assignments", icon: CheckCircle2 },
  ];

  // Subject wise performance dataset
  const subjectScores: SubjectScore[] = [
    {
      name: "Early Numeracy & Math",
      icon: Calculator,
      score: 92,
      gradeLabel: "Excellent",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
      badgeText: "text-emerald-600 dark:text-emerald-400",
      iconColor: "text-[#0050CB]",
      iconBg: "bg-[#E5EEFF] dark:bg-blue-950/60",
      barColor: "bg-[#0050CB]",
    },
    {
      name: "Phonics & English",
      icon: BookOpen,
      score: 88,
      gradeLabel: "Very Good",
      badgeBg: "bg-purple-50 dark:bg-purple-950/60",
      badgeText: "text-purple-600 dark:text-purple-400",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 dark:bg-purple-950/60",
      barColor: "bg-purple-600",
    },
    {
      name: "General Awareness (EVS)",
      icon: Globe,
      score: 84,
      gradeLabel: "Good",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
      badgeText: "text-emerald-600 dark:text-emerald-400",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
      barColor: "bg-emerald-500",
    },
    {
      name: "Rhymes & Storytelling",
      icon: Languages,
      score: 90,
      gradeLabel: "Excellent",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
      badgeText: "text-emerald-600 dark:text-emerald-400",
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50 dark:bg-amber-950/60",
      barColor: "bg-amber-500",
    },
    {
      name: "Art & Craft",
      icon: Sparkles,
      score: 85,
      gradeLabel: "Good",
      badgeBg: "bg-amber-50 dark:bg-amber-950/60",
      badgeText: "text-amber-600 dark:text-amber-400",
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50 dark:bg-rose-950/60",
      barColor: "bg-rose-500",
    },
    {
      name: "Sensory & Motor Skills",
      icon: CheckCircle2,
      score: 95,
      gradeLabel: "Outstanding",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
      badgeText: "text-emerald-600 dark:text-emerald-400",
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-50 dark:bg-cyan-950/60",
      barColor: "bg-cyan-500",
    },
  ];

  // Assessment results table dataset
  const assessmentResults: AssessmentResult[] = [
    {
      id: "res-1",
      date: "15 Sep 2026",
      exam: "Numeracy Milestone",
      type: "Unit Test",
      subject: "Early Numeracy & Math",
      subjectIcon: Calculator,
      subjectColor: "text-[#0050CB]",
      marks: "92 / 100",
      totalMarks: 100,
      obtainedMarks: 92,
      status: "Completed",
      remarks: "Outstanding shape identification and counting objects 1-20.",
    },
    {
      id: "res-2",
      date: "13 Sep 2026",
      exam: "Phonics Sound Test",
      type: "Monthly Test",
      subject: "Phonics & English",
      subjectIcon: BookOpen,
      subjectColor: "text-purple-600",
      marks: "88 / 100",
      totalMarks: 100,
      obtainedMarks: 88,
      status: "Completed",
      remarks: "Expressive vowel sound recognition. Excellent letter tracing.",
    },
    {
      id: "res-3",
      date: "10 Sep 2026",
      exam: "Nature Observation",
      type: "Monthly Test",
      subject: "General Awareness (EVS)",
      subjectIcon: Globe,
      subjectColor: "text-emerald-600",
      marks: "76 / 100",
      totalMarks: 100,
      obtainedMarks: 76,
      status: "Completed",
      remarks: "Recognized domestic vs wild animals accurately.",
    },
    {
      id: "res-4",
      date: "07 Sep 2026",
      exam: "Rhyme Recitation",
      type: "Unit Test",
      subject: "Rhymes & Storytelling",
      subjectIcon: Languages,
      subjectColor: "text-amber-500",
      marks: "90 / 100",
      totalMarks: 100,
      obtainedMarks: 90,
      status: "Completed",
      remarks: "Excellent rhythm and cheerful expression during recitation.",
    },
    {
      id: "res-5",
      date: "05 Sep 2026",
      exam: "Clay Modeling & Craft",
      type: "Assignments",
      subject: "Art & Craft",
      subjectIcon: Sparkles,
      subjectColor: "text-rose-500",
      marks: "—",
      totalMarks: 50,
      status: "Pending",
      remarks: "Fine motor clay molding and coloring activity scheduled for this week.",
    },
  ];

  // Upcoming assessments list
  const upcomingAssessments: UpcomingAssessment[] = [
    {
      id: "up-1",
      month: "SEP",
      day: "20",
      title: "Phonics Sound Blending Check",
      timing: "09:00 AM - 10:00 AM",
      status: "Upcoming",
    },
    {
      id: "up-2",
      month: "SEP",
      day: "22",
      title: "Number Flashcard Counting",
      timing: "10:30 AM - 11:30 AM",
      status: "Upcoming",
    },
    {
      id: "up-3",
      month: "SEP",
      day: "25",
      title: "Sensory Play & Motor Activity",
      timing: "12:00 PM - 01:00 PM",
      status: "Pending",
    },
  ];

  // Filtered assessment results
  const filteredResults = useMemo(() => {
    return assessmentResults.filter((item) => {
      if (activeExamFilter !== "All Exams" && item.type !== activeExamFilter) {
        return false;
      }
      if (selectedSubjectFilter !== "All Subjects" && item.subject !== selectedSubjectFilter) {
        return false;
      }
      return true;
    });
  }, [activeExamFilter, selectedSubjectFilter]);

  // Filtered subject cards
  const filteredSubjects = useMemo(() => {
    if (selectedSubjectFilter === "All Subjects") return subjectScores;
    return subjectScores.filter((s) => s.name === selectedSubjectFilter);
  }, [selectedSubjectFilter]);

  return (
    <div className="space-y-6 pb-16 max-w-[1440px] mx-auto font-sans text-slate-800 dark:text-slate-100 select-none">

      {/* ========================================================
          1. HERO BANNER
      ======================================================== */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#EBF3FE] via-[#F2F7FF] to-[#E3F0FE] dark:from-[#051636] dark:via-[#091B40] dark:to-[#071738] border border-blue-100/90 dark:border-white/10 shadow-[0_4px_24px_rgba(0,80,203,0.04)] p-6 sm:p-7 lg:p-8 flex flex-col justify-between min-h-[220px]">
        
        {/* Background Paper Airplane Dotted Flight Doodle */}
        <div className="absolute left-[45%] top-5 hidden md:block pointer-events-none opacity-40 dark:opacity-20">
          <svg width="150" height="70" viewBox="0 0 150 70" fill="none">
            <path 
              d="M10 50 C 45 20, 85 60, 125 22" 
              stroke="#0050CB" 
              strokeWidth="1.8" 
              strokeDasharray="4 4" 
              fill="none" 
            />
            <path d="M125 22 L142 16 L133 32 Z" fill="#0050CB" />
          </svg>
        </div>

        {/* Top Header Row: Title & Academic Year Dropdown */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          
          {/* Left Title Area */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0050CB] text-white shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#0050CB] dark:text-blue-300">
                Assessments
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black text-[#000E28] dark:text-white tracking-tight leading-tight">
                Track Your Child&apos;s Progress
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-normal max-w-lg">
                View marks, test results, and performance reports to stay informed about your child&apos;s academic journey.
              </p>
            </div>
          </div>

          {/* Right: Academic Year Dropdown + 3D Study Elements */}
          <div className="flex items-center gap-4 self-start sm:self-auto">
            
            {/* Academic Year Dropdown */}
            <div className="relative z-20">
              <button
                type="button"
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                className="px-4 py-2 rounded-full bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:border-[#0050CB]/40 shadow-2xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#0050CB]" />
                <span className="text-slate-400 font-normal">Academic Year</span>
                <span>{selectedAcademicYear}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isYearDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-[#07142F] border border-slate-200 dark:border-slate-800 shadow-lg py-1.5 z-30">
                  {getAcademicYearDisplayOptions().map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setSelectedAcademicYear(yr);
                        setIsYearDropdownOpen(false);
                        toast.success(`Academic Year: ${yr}`);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between ${
                        selectedAcademicYear === yr ? "text-[#0050CB] font-bold bg-blue-50/50" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{yr}</span>
                      {selectedAcademicYear === yr && <Check className="w-3.5 h-3.5 text-[#0050CB]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Banner Right-Side Decorative Words */}
        <div className="absolute right-6 bottom-5 hidden lg:flex items-end pointer-events-none select-none">
          <div className="flex flex-col items-end text-[#0050CB] dark:text-[#38BDF8] font-sans font-black pr-2">
            <span className="text-xl tracking-tight leading-none rotate-[-5deg]">
              Learn
            </span>
            <span className="text-2xl tracking-tight leading-none mt-1 rotate-[3deg]">
              Grow
            </span>
            <div className="flex items-center gap-1 mt-1 rotate-[-3deg]">
              <span className="text-2xl tracking-tight leading-none">
                Achieve
              </span>
              <span className="text-xl text-[#FF690C] dark:text-[#FFA066] leading-none">♡</span>
            </div>
          </div>
        </div>

        {/* Bottom Exam Filter Pills */}
        <div className="relative z-10 pt-6 flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-2xl">
          {examPills.map((pill) => {
            const Icon = pill.icon;
            const isActive = activeExamFilter === pill.label;

            return (
              <button
                key={pill.label}
                type="button"
                onClick={() => {
                  setActiveExamFilter(pill.label);
                  toast(`Filter: ${pill.label}`);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive
                    ? "bg-[#0050CB] text-white shadow-sm shadow-blue-500/20"
                    : "bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#0050CB]/50 hover:text-[#0050CB]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* ========================================================
          2. METRICS ROW (5 STAT CARDS)
      ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Total Assessments */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] flex items-center justify-center">
              <ClipboardList className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Total Assessments
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-black text-[#000E28] dark:text-white leading-none">
              12
            </span>
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              ↑ 20%
            </span>
          </div>
          <p className="text-[10px] text-slate-400">vs last month</p>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Completed
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-black text-[#000E28] dark:text-white leading-none">
              10
            </span>
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              ↑ 18%
            </span>
          </div>
          <p className="text-[10px] text-slate-400">vs last month</p>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Pending
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-black text-[#000E28] dark:text-white leading-none">
              2
            </span>
            <span className="text-[10.5px] font-bold text-rose-500 dark:text-rose-400 flex items-center">
              ↓ 50%
            </span>
          </div>
          <p className="text-[10px] text-slate-400">vs last month</p>
        </div>

        {/* Average Score */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Average Score
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-black text-[#000E28] dark:text-white leading-none">
              86%
            </span>
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              ↑ 7%
            </span>
          </div>
          <p className="text-[10px] text-slate-400">vs last month</p>
        </div>

        {/* Highest Score */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
              <Star className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Highest Score
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-black text-[#000E28] dark:text-white leading-none">
              98%
            </span>
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              ↑ 12%
            </span>
          </div>
          <p className="text-[10px] text-slate-400">vs last month</p>
        </div>

      </div>

      {/* ========================================================
          3. MAIN TWO-COLUMN SECTION (Subject Wise & Quick Actions)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* ====================================================
            LEFT COLUMN (7 or 8 COLS): SUBJECT PERFORMANCE & RESULTS TABLE
        ==================================================== */}
        <div className="lg:col-span-8 space-y-6">

          {/* 3.1 SUBJECT WISE PERFORMANCE */}
          <div className="p-5 sm:p-6 rounded-[26px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] space-y-5">
            
            {/* Header + Dropdown */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[#000E28] dark:text-white">
                Subject Wise Performance
              </h2>

              {/* All Subjects Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>{selectedSubjectFilter}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isSubjectDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-[#07142F] border border-slate-200 dark:border-slate-800 shadow-lg py-1.5 z-30">
                    {["All Subjects", "Mathematics", "English", "Science", "Social Studies", "Hindi", "Computer"].map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          setSelectedSubjectFilter(sub);
                          setIsSubjectDropdownOpen(false);
                          toast(`Filter: ${sub}`);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between ${
                          selectedSubjectFilter === sub ? "text-[#0050CB] font-bold bg-blue-50/50" : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span>{sub}</span>
                        {selectedSubjectFilter === sub && <Check className="w-3.5 h-3.5 text-[#0050CB]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 6 Subjects Grid (2 columns on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {filteredSubjects.map((sub) => {
                const Icon = sub.icon;

                return (
                  <div
                    key={sub.name}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl ${sub.iconBg} ${sub.iconColor} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#000E28] dark:text-white leading-tight">
                            {sub.name}
                          </p>
                          <p className="text-sm font-black text-[#000E28] dark:text-white">
                            {sub.score}%
                          </p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sub.badgeBg} ${sub.badgeText}`}>
                        {sub.gradeLabel}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200/70 dark:bg-slate-700 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${sub.barColor} transition-all duration-500`}
                        style={{ width: `${sub.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* 3.2 RECENT ASSESSMENT RESULTS TABLE */}
          <div className="p-5 sm:p-6 rounded-[26px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] space-y-4">
            
            {/* Table Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[#000E28] dark:text-white">
                Recent Assessment Results
              </h2>

              <button
                type="button"
                onClick={() => {
                  setActiveExamFilter("All Exams");
                  setSelectedSubjectFilter("All Subjects");
                  toast("Showing all historical assessment records");
                }}
                className="text-xs font-bold text-[#0050CB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                    <th className="pb-3 font-bold">Date</th>
                    <th className="pb-3 font-bold">Exam / Test</th>
                    <th className="pb-3 font-bold">Subject</th>
                    <th className="pb-3 font-bold text-center">Marks</th>
                    <th className="pb-3 font-bold text-center">Status</th>
                    <th className="pb-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/80">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((row) => {
                      const SubIcon = row.subjectIcon;

                      return (
                        <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {row.date}
                          </td>
                          <td className="py-3.5 font-bold text-[#000E28] dark:text-white whitespace-nowrap">
                            {row.exam}
                          </td>
                          <td className="py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <SubIcon className={`w-3.5 h-3.5 ${row.subjectColor} shrink-0`} />
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{row.subject}</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-center font-bold text-[#000E28] dark:text-white whitespace-nowrap">
                            {row.marks}
                          </td>
                          <td className="py-3.5 text-center whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                              row.status === "Completed"
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedResultModal(row)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#0050CB] text-[#0050CB] dark:text-blue-300 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{row.status === "Completed" ? "View Report" : "View Details"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No assessment results match your selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* ====================================================
            RIGHT COLUMN (4 or 5 COLS): QUICK ACTIONS & UPCOMING
        ==================================================== */}
        <div className="lg:col-span-4 space-y-6">

          {/* 3.3 QUICK ACTIONS */}
          <div className="p-5 sm:p-6 rounded-[26px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[#000E28] dark:text-white">
                Quick Actions
              </h2>

              <button
                type="button"
                onClick={() => toast("All quick actions are active")}
                className="text-xs font-bold text-[#0050CB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 6 Action Tiles (3 cols x 2 rows) */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              
              {/* 1. Download Report Card */}
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="p-3 rounded-2xl bg-[#EAF2FF] dark:bg-blue-950/40 hover:bg-[#DEECFF] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-[#0050CB] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10.5px] font-bold text-[#000E28] dark:text-white leading-tight">
                  Download Report Card
                </span>
              </button>

              {/* 2. View Assessments */}
              <button
                type="button"
                onClick={() => {
                  setActiveExamFilter("All Exams");
                  toast("Navigated to recent results table");
                }}
                className="p-3 rounded-2xl bg-[#F5EDFF] dark:bg-purple-950/40 hover:bg-[#ECE0FF] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-purple-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10.5px] font-bold text-[#000E28] dark:text-white leading-tight">
                  View Assessments
                </span>
              </button>

              {/* 3. View Marksheets */}
              <button
                type="button"
                onClick={() => setIsMarksheetModalOpen(true)}
                className="p-3 rounded-2xl bg-[#E9F9F0] dark:bg-emerald-950/40 hover:bg-[#D8F5E4] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10.5px] font-bold text-[#000E28] dark:text-white leading-tight">
                  View Marksheets
                </span>
              </button>

              {/* 4. Upload Document */}
              <button
                type="button"
                onClick={() => toast("Document Upload Portal ready for submission")}
                className="p-3 rounded-2xl bg-[#FFF6E8] dark:bg-amber-950/40 hover:bg-[#FEEDD2] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-amber-500 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10.5px] font-bold text-[#000E28] dark:text-white leading-tight">
                  Upload Document
                </span>
              </button>

              {/* 5. View Syllabus */}
              <button
                type="button"
                onClick={() => setIsSyllabusModalOpen(true)}
                className="p-3 rounded-2xl bg-[#FFEBF1] dark:bg-rose-950/40 hover:bg-[#FDDCE7] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-rose-500 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10.5px] font-bold text-[#000E28] dark:text-white leading-tight">
                  View Syllabus
                </span>
              </button>

              {/* 6. Contact Teacher */}
              <Link
                href="/parent/messages"
                className="p-3 rounded-2xl bg-[#F2EDFF] dark:bg-indigo-950/40 hover:bg-[#E5DDFF] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10.5px] font-bold text-[#000E28] dark:text-white leading-tight">
                  Contact Teacher
                </span>
              </Link>

            </div>

          </div>

          {/* 3.4 UPCOMING ASSESSMENTS */}
          <div className="p-5 sm:p-6 rounded-[26px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[#000E28] dark:text-white">
                Upcoming Assessments
              </h2>

              <button
                type="button"
                onClick={() => toast("Showing all scheduled tests on academic calendar")}
                className="text-xs font-bold text-[#0050CB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Scheduled Items */}
            <div className="space-y-3">
              {upcomingAssessments.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    
                    {/* Date Badge Box */}
                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 leading-none">
                        {item.month}
                      </span>
                      <span className="text-sm font-black text-[#000E28] dark:text-white leading-none mt-0.5">
                        {item.day}
                      </span>
                    </div>

                    {/* Title & Timing */}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#000E28] dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-[10.5px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.timing}</span>
                      </p>
                    </div>

                  </div>

                  {/* Status Pill */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold shrink-0 ${
                    item.status === "Upcoming"
                      ? "bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300"
                      : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================
          4. MODALS & POPUPS
      ======================================================== */}

      {/* Official PDF Report Card Modal */}
      <ReportCardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        child={child}
      />

      {/* Single Assessment Detail / Report Modal */}
      {selectedResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white dark:bg-[#07142F] rounded-[28px] max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0050CB] flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#000E28] dark:text-white">
                    {selectedResultModal.exam}
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedResultModal.date}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResultModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-bold text-slate-500">Subject</span>
                <span className="font-black text-[#000E28] dark:text-white">{selectedResultModal.subject}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-bold text-slate-500">Score Achieved</span>
                <span className="font-black text-[#0050CB] text-sm">{selectedResultModal.marks}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-bold text-slate-500">Evaluation Status</span>
                <span className="font-bold text-emerald-600">{selectedResultModal.status}</span>
              </div>
              {selectedResultModal.remarks && (
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 space-y-1">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-[#0050CB]">Mentor Feedback</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    &quot;{selectedResultModal.remarks}&quot;
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.success("Assessment summary printed");
                  setSelectedResultModal(null);
                }}
                className="w-full py-2.5 rounded-xl bg-[#0050CB] text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marksheets Modal */}
      {isMarksheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white dark:bg-[#07142F] rounded-[28px] max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-[#000E28] dark:text-white">
                  Academic Marksheets Archive
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMarksheetModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { term: "Unit Test 1 (August 2026)", marks: "94% Aggregate", file: "UT1_Marksheet.pdf" },
                { term: "Mid-Term Assessment (June 2026)", marks: "89% Aggregate", file: "MidTerm_Marksheet.pdf" },
                { term: "Diagnostic Benchmark Test (April 2026)", marks: "86% Aggregate", file: "Diagnostic_Marksheet.pdf" },
              ].map((ms, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#000E28] dark:text-white">{ms.term}</p>
                    <p className="text-[11px] text-emerald-600 font-bold">{ms.marks}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success(`Downloading ${ms.file}...`)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 text-[#0050CB] hover:bg-blue-50 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Syllabus Modal */}
      {isSyllabusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white dark:bg-[#07142F] rounded-[28px] max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-black text-[#000E28] dark:text-white">
                  Term 1 Assessment Syllabus
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSyllabusModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { subject: "Mathematics", topics: "Fractions, Decimals, Perimeter & Area, Roman Numerals" },
                { subject: "Science", topics: "Photosynthesis, Circulatory System, Matter & Energy" },
                { subject: "English", topics: "Direct & Indirect Speech, Comprehension Passages, Formal Letters" },
                { subject: "Social Studies", topics: "Indian Freedom Movement, Coastal Plains, Local Government" },
              ].map((syl, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <p className="font-black text-[#000E28] dark:text-white">{syl.subject}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{syl.topics}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
