"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  X,
  Download,
  Printer,
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  User,
  GraduationCap,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  BarChart3,
  BookOpen,
  Palette,
  Lightbulb,
  Activity,
  Smile,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: {
    _id?: string;
    firstName: string;
    lastName: string;
    admissionNumber?: string;
    grade?: string;
    section?: string;
    rollNumber?: string;
    teacherName?: string;
    dob?: string;
  };
}

export default function ReportCardModal({ isOpen, onClose, child }: ReportCardModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !child) return null;

  const handlePrint = () => {
    window.print();
    toast.success("Printing Official Report Card...");
  };

  const handleDownloadPDF = () => {
    toast.success("Generating Official Report Card PDF...");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const studentName = `${child.firstName || "Sammy"} ${child.lastName || "Student"}`.trim();
  const admissionNo = child.admissionNumber || "SEED-001";
  const classSection = `${child.grade || "LKG"} - ${child.section || "Section A"}`;
  const dob = child.dob || "15-06-2020";
  const classTeacher = child.teacherName || "Ms. Ananya Roy";
  const rollNumber = child.rollNumber || "12";
  const curriculum = child.grade || "LKG";

  const performanceItems = [
    {
      id: 1,
      badge: "ABC",
      badgeColor: "bg-[#0050CB] text-white",
      area: "Language & Phonics",
      maxGrade: "Grading Scale",
      result: "Mastered",
      resultType: "mastered",
      remarks: "Recognizes alphabet sounds and blends three-letter words confidently.",
    },
    {
      id: 2,
      badge: "123",
      badgeColor: "bg-[#0050CB] text-white",
      area: "Numeracy & Quantities",
      maxGrade: "Grading Scale",
      result: "Mastered",
      resultType: "mastered",
      remarks: "Counts 1-50 accurately and classifies geometric shapes with ease.",
    },
    {
      id: 3,
      icon: Palette,
      badgeColor: "bg-[#0050CB] text-white",
      area: "Creative & Visual Arts",
      maxGrade: "Grading Scale",
      result: "Progressing",
      resultType: "progressing",
      remarks: "Loves clay modelling and demonstrates thoughtful colour palettes.",
    },
    {
      id: 4,
      icon: Activity,
      badgeColor: "bg-[#0050CB] text-white",
      area: "Fine & Gross Motor Skills",
      maxGrade: "Grading Scale",
      result: "Mastered",
      resultType: "mastered",
      remarks: "Excellent pencil grip, scissor handling, and playground balance.",
    },
    {
      id: 5,
      icon: Users,
      badgeColor: "bg-[#0050CB] text-white",
      area: "Social & Emotional Growth",
      maxGrade: "Grading Scale",
      result: "Progressing",
      resultType: "progressing",
      remarks: "Kind peer interactions; shares play materials with genuine empathy.",
    },
    {
      id: 6,
      icon: Lightbulb,
      badgeColor: "bg-[#0050CB] text-white",
      area: "General Awareness",
      maxGrade: "Grading Scale",
      result: "Mastered",
      resultType: "mastered",
      remarks: "Demonstrates high curiosity about nature, seasons, and classroom flora.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 15 }}
        className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden dark:bg-[#07142F] dark:border-white/10"
      >
        {/* Sticky Action Controls Header (Hidden during window.print()) */}
        <div className="print:hidden sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-slate-50/95 dark:bg-[#07142F]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#0050CB]/10 text-[#0050CB] dark:text-blue-300">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-[#000E28] dark:text-white leading-tight">
                Academic Assessment &amp; Report Card
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Official verified student performance report • Academic Session 2026–2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-1.5 rounded-xl bg-[#0050CB] hover:bg-[#003ea1] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#0050CB]/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 ml-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Sheet */}
        <div
          ref={printRef}
          className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-[#000E28] space-y-6 print:p-0 print:m-0 print:overflow-visible print:w-full"
        >
          {/* 1. Header: School Crest + Title + Contact Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
            {/* Left: School Crest & Name */}
            <div className="flex items-center gap-3.5">
              {/* Crest Logo */}
              <div className="w-16 h-16 relative flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#0050CB]">
                  {/* Outer Laurel Wreath Leaves */}
                  <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M 22 75 C 10 50, 15 25, 35 15 C 32 25, 26 45, 30 65" />
                    <path d="M 78 75 C 90 50, 85 25, 65 15 C 68 25, 74 45, 70 65" />
                  </g>
                  {/* Laurel Leaf Sprays */}
                  <g fill="currentColor">
                    <ellipse cx="18" cy="40" rx="3.5" ry="2" transform="rotate(-30 18 40)" />
                    <ellipse cx="20" cy="52" rx="3.5" ry="2" transform="rotate(-15 20 52)" />
                    <ellipse cx="24" cy="64" rx="3.5" ry="2" transform="rotate(0 24 64)" />
                    <ellipse cx="82" cy="40" rx="3.5" ry="2" transform="rotate(30 82 40)" />
                    <ellipse cx="80" cy="52" rx="3.5" ry="2" transform="rotate(15 80 52)" />
                    <ellipse cx="76" cy="64" rx="3.5" ry="2" transform="rotate(0 76 64)" />
                  </g>
                  {/* Center Blue Shield */}
                  <path
                    d="M 32 24 L 68 24 C 68 24, 70 52, 50 78 C 30 52, 32 24, 32 24 Z"
                    fill="#0050CB"
                  />
                  {/* Open Book in White */}
                  <path
                    d="M 50 48 C 45 44, 39 45, 38 46 L 38 58 C 43 57, 47 58, 50 61 C 53 58, 57 57, 62 58 L 62 46 C 61 45, 55 44, 50 48 Z"
                    fill="white"
                  />
                  <line x1="50" y1="48" x2="50" y2="61" stroke="#0050CB" strokeWidth="1.5" />
                  {/* Small Crown/Star on top of book */}
                  <polygon
                    points="50,33 53,39 59,39 54,43 56,49 50,45 44,49 46,43 41,39 47,39"
                    fill="white"
                  />
                </svg>
              </div>

              {/* Title & Motto */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] tracking-tight leading-none">
                  GGPS SCHOOL
                </h1>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 tracking-[0.22em] uppercase mt-1">
                  LEARN &nbsp;•&nbsp; GROW &nbsp;•&nbsp; SUCCEED
                </p>
              </div>
            </div>

            {/* Right: Contact Details */}
            <div className="text-right space-y-1 text-[11px] text-slate-600">
              <div className="flex items-center justify-start sm:justify-end gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0050CB] flex-shrink-0" />
                <span>Prestige Knowledge City, Bangalore - 560103</span>
              </div>
              <div className="flex items-center justify-start sm:justify-end gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0050CB] flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center justify-start sm:justify-end gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#0050CB] flex-shrink-0" />
                <span>info@ggpsschool.in</span>
              </div>
              <div className="flex items-center justify-start sm:justify-end gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#0050CB] flex-shrink-0" />
                <span>www.ggpsschool.in</span>
              </div>
            </div>
          </div>

          {/* 2. Subtitle Rule & Header Banner */}
          <div className="relative border-t border-blue-200 pt-3 text-center">
            {/* Overlapping Tag */}
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              GGPS School ERP
            </span>

            {/* Main Title & Term Badge */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-1">
              <div className="sm:w-32 hidden sm:block"></div>

              <div className="text-center flex-1">
                <h2 className="text-lg sm:text-2xl font-black text-[#0050CB] tracking-tight uppercase">
                  ACADEMIC ASSESSMENT &amp; REPORT CARD
                </h2>
                <p className="text-xs font-bold text-slate-700 tracking-wider mt-0.5">
                  ACADEMIC SESSION: 2026 – 2027
                </p>
              </div>

              <div className="sm:w-36 flex justify-end">
                <span className="px-3.5 py-1 rounded-full bg-[#E5EEFF] text-[#0050CB] font-black text-[11px] uppercase tracking-wider border border-blue-200">
                  TERM 1 REPORT CARD
                </span>
              </div>
            </div>
          </div>

          {/* 3. Student Information Card */}
          <div className="rounded-2xl border border-blue-200/90 p-4 sm:p-5 relative bg-white shadow-xs">
            {/* Floating Top Badge */}
            <div className="absolute -top-3.5 left-5 bg-[#0050CB] text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
              <User className="w-3.5 h-3.5" />
              <span>STUDENT INFORMATION</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Column 1 */}
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-[#0050CB] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Student Name
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 block">
                      {studentName}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-[#0050CB] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Date of Birth
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block">{dob}</span>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-3 sm:border-l sm:border-slate-200 sm:pl-4">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#0050CB] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Admission No.
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 block">
                      {admissionNo}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <GraduationCap className="w-4 h-4 text-[#0050CB] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Class Teacher
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                      {classTeacher}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="space-y-3 sm:border-l sm:border-slate-200 sm:pl-4">
                <div className="flex items-start gap-2.5">
                  <GraduationCap className="w-4 h-4 text-[#0050CB] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Class &amp; Section
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 block">
                      {classSection}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-[#0050CB] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Roll Number
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                      {rollNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Academic Performance Table */}
          <div className="rounded-2xl border border-blue-200/90 overflow-hidden relative shadow-xs">
            {/* Header pill & Curriculum pill */}
            <div className="flex items-center justify-between p-3.5 border-b border-blue-100 bg-white">
              <div className="flex items-center gap-1.5 bg-[#0050CB] text-white px-3 py-1 rounded-full text-[11px] font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>ACADEMIC PERFORMANCE</span>
              </div>
              <span className="px-3 py-0.5 rounded-full bg-[#E5EEFF] text-[#0050CB] font-bold text-[11px] uppercase tracking-wider border border-blue-200">
                CURRICULUM: {curriculum}
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F0F5FF] text-[#0050CB] font-bold border-b border-blue-100 text-[11px]">
                    <th className="py-2.5 px-4 w-[28%]">DEVELOPMENT AREA</th>
                    <th className="py-2.5 px-3 w-[18%]">MAXIMUM / GRADE</th>
                    <th className="py-2.5 px-3 w-[18%]">OBTAINED RESULT</th>
                    <th className="py-2.5 px-4 w-[36%]">TEACHER OBSERVATION / REMARKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performanceItems.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                      {/* Development Area */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#0050CB] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 shadow-xs">
                            {item.badge ? (
                              item.badge
                            ) : item.icon ? (
                              <item.icon className="w-3.5 h-3.5" />
                            ) : null}
                          </div>
                          <span className="text-xs font-bold text-slate-800">{item.area}</span>
                        </div>
                      </td>

                      {/* Maximum / Grade */}
                      <td className="py-3 px-3 text-slate-600 font-medium text-xs">
                        {item.maxGrade}
                      </td>

                      {/* Obtained Result */}
                      <td className="py-3 px-3">
                        {item.resultType === "mastered" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mastered</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#E5EEFF] text-[#0050CB] border border-blue-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Progressing</span>
                          </span>
                        )}
                      </td>

                      {/* Remarks */}
                      <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed">
                        {item.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Attendance Summary + Overall Performance + Grading Legend (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Attendance Summary */}
            <div className="rounded-2xl border border-blue-200/90 p-4 bg-white shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-1.5 bg-[#0050CB] text-white px-3 py-1 rounded-full text-[11px] font-bold w-fit mb-3">
                <Calendar className="w-3.5 h-3.5" />
                <span>ATTENDANCE SUMMARY</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block leading-tight">
                    Total Working Days
                  </span>
                  <span className="text-xl font-black text-slate-900 block mt-1">90</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block leading-tight">
                    Days Present
                  </span>
                  <span className="text-xl font-black text-slate-900 block mt-1">82</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block leading-tight">
                    Days Absent
                  </span>
                  <span className="text-xl font-black text-slate-900 block mt-1">8</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/80 px-3 py-2 rounded-xl">
                <span className="font-bold text-slate-700">Attendance Percentage</span>
                <span className="font-black text-[#0050CB] text-sm">91%</span>
              </div>
            </div>

            {/* Card 2: Overall Performance */}
            <div className="rounded-2xl border border-blue-200/90 p-4 bg-white shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-1.5 bg-[#0050CB] text-white px-3 py-1 rounded-full text-[11px] font-bold w-fit mb-3">
                <Star className="w-3.5 h-3.5" />
                <span>OVERALL PERFORMANCE</span>
              </div>

              <div className="flex items-center justify-center gap-4 py-2">
                {/* Big Round A+ Badge */}
                <div className="w-16 h-16 rounded-full border-4 border-[#0050CB] flex items-center justify-center text-2xl font-black text-[#0050CB] shadow-xs">
                  A+
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Overall Grade
                  </span>
                  <span className="text-lg font-black text-slate-900 block">Excellent</span>
                </div>
              </div>

              <div className="text-center mt-2">
                <span className="inline-block px-3.5 py-1 rounded-full bg-[#E5EEFF] text-[#0050CB] font-bold text-xs border border-blue-200">
                  Class Position: 2 / 25
                </span>
              </div>
            </div>

            {/* Card 3: Grading Legend */}
            <div className="rounded-2xl border border-blue-200/90 p-3 bg-white shadow-xs">
              <div className="flex items-center gap-1.5 bg-[#0050CB] text-white px-3 py-1 rounded-full text-[11px] font-bold w-fit mb-2">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>GRADING LEGEND</span>
              </div>

              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="py-1 px-2">Grade</th>
                    <th className="py-1 px-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-0.5 px-2 font-bold text-[#0050CB]">A+</td>
                    <td className="py-0.5 px-2">Outstanding</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-2 font-bold text-[#0050CB]">A</td>
                    <td className="py-0.5 px-2">Excellent</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-2 font-bold text-[#0050CB]">B+</td>
                    <td className="py-0.5 px-2">Very Good</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-2 font-bold text-[#0050CB]">B</td>
                    <td className="py-0.5 px-2">Good</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-2 font-bold text-[#0050CB]">C+</td>
                    <td className="py-0.5 px-2">Satisfactory</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-2 font-bold text-[#0050CB]">C</td>
                    <td className="py-0.5 px-2">Need Improvement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. Remarks: Teacher & Principal Remarks (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Teacher Remarks */}
            <div className="rounded-2xl border border-blue-200/90 p-4 bg-white shadow-xs">
              <div className="flex items-center gap-1.5 bg-[#0050CB] text-white px-3 py-1 rounded-full text-[11px] font-bold w-fit mb-2">
                <User className="w-3.5 h-3.5" />
                <span>TEACHER REMARKS</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {studentName} is a bright and curious learner. He shows enthusiasm in all activities
                and is making steady progress. With continued support and encouragement, he will
                achieve even greater success.
              </p>
            </div>

            {/* Principal Remarks */}
            <div className="rounded-2xl border border-blue-200/90 p-4 bg-white shadow-xs">
              <div className="flex items-center gap-1.5 bg-[#0050CB] text-white px-3 py-1 rounded-full text-[11px] font-bold w-fit mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>PRINCIPAL REMARKS</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                Well done, {child.firstName || "Sammy"}! Keep up the good work. Your consistent
                effort and positive attitude are commendable.
              </p>
            </div>
          </div>

          {/* 7. Parent Acknowledgement */}
          <div className="rounded-2xl border border-blue-200/90 p-4 bg-white shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 bg-[#0050CB] text-white px-3 py-1 rounded-full text-[11px] font-bold w-fit">
              <Users className="w-3.5 h-3.5" />
              <span>PARENT ACKNOWLEDGEMENT</span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              I have read and understood the contents of this report card.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3 text-xs text-slate-500 font-medium">
              <div className="border-b border-slate-300 pb-1">
                <span>Parent / Guardian Name:</span>
              </div>
              <div className="border-b border-slate-300 pb-1">
                <span>Signature:</span>
              </div>
              <div className="border-b border-slate-300 pb-1">
                <span>Date:</span>
              </div>
            </div>
          </div>

          {/* 8. Signatures & Stamp Footer */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center text-center">
            {/* Signature 1: Class Teacher */}
            <div className="flex flex-col items-center">
              <div
                className="h-10 text-xl font-bold text-[#0050CB] flex items-end justify-center select-none"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                Ananya Roy
              </div>
              <div className="w-36 border-t border-slate-300 pt-1 mt-1">
                <p className="text-xs font-bold text-slate-800">Ms. Ananya Roy</p>
                <p className="text-[10px] text-slate-500">Class Teacher</p>
              </div>
            </div>

            {/* Rubber Stamp Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#0050CB] p-1 flex flex-col items-center justify-center text-center relative select-none">
                <div className="w-full h-full rounded-full border border-[#0050CB] flex flex-col items-center justify-center p-1 bg-blue-50/20">
                  <span className="text-[7.5px] font-black text-[#0050CB] tracking-wider uppercase">
                    GGPS SCHOOL
                  </span>
                  <div className="my-0.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#0050CB]" />
                  </div>
                  <span className="text-[6.5px] font-bold text-[#0050CB] tracking-wider">
                    ESTD. 2015
                  </span>
                </div>
              </div>
              <p
                className="text-[9px] text-[#0050CB] font-bold italic mt-1"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                Nurturing Young Minds for a Brighter Future
              </p>
            </div>

            {/* Signature 2: Principal */}
            <div className="flex flex-col items-center">
              <div
                className="h-10 text-xl font-bold text-[#0050CB] flex items-end justify-center select-none"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                Dr. M. S. Varma
              </div>
              <div className="w-36 border-t border-slate-300 pt-1 mt-1">
                <p className="text-xs font-bold text-slate-800">Dr. M. S. Varma</p>
                <p className="text-[10px] text-slate-500">Principal</p>
              </div>
            </div>

            {/* Verification QR Code */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 p-1 border border-slate-200 rounded-lg bg-white shadow-xs">
                {/* SVG QR Code */}
                <svg viewBox="0 0 29 29" className="w-full h-full text-slate-900" fill="currentColor">
                  {/* Top-Left Position Detection Pattern */}
                  <rect x="0" y="0" width="7" height="7" />
                  <rect x="1" y="1" width="5" height="5" fill="white" />
                  <rect x="2" y="2" width="3" height="3" />

                  {/* Top-Right Position Detection Pattern */}
                  <rect x="22" y="0" width="7" height="7" />
                  <rect x="23" y="1" width="5" height="5" fill="white" />
                  <rect x="24" y="2" width="3" height="3" />

                  {/* Bottom-Left Position Detection Pattern */}
                  <rect x="0" y="22" width="7" height="7" />
                  <rect x="1" y="23" width="5" height="5" fill="white" />
                  <rect x="2" y="24" width="3" height="3" />

                  {/* Matrix Bits */}
                  <rect x="9" y="2" width="2" height="2" />
                  <rect x="13" y="1" width="2" height="2" />
                  <rect x="17" y="3" width="2" height="2" />
                  <rect x="3" y="9" width="2" height="2" />
                  <rect x="6" y="11" width="2" height="2" />
                  <rect x="10" y="10" width="3" height="3" />
                  <rect x="15" y="8" width="2" height="2" />
                  <rect x="18" y="11" width="3" height="2" />
                  <rect x="11" y="15" width="2" height="3" />
                  <rect x="15" y="14" width="3" height="2" />
                  <rect x="9" y="23" width="2" height="2" />
                  <rect x="14" y="21" width="2" height="3" />
                  <rect x="18" y="24" width="3" height="2" />
                  <rect x="23" y="10" width="2" height="2" />
                  <rect x="25" y="15" width="2" height="3" />
                  <rect x="22" y="20" width="3" height="2" />
                </svg>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[110px] leading-tight">
                Scan to verify this report card
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
