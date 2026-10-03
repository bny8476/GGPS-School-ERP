"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileSpreadsheet, ChevronRight, Award, Download, Printer, 
  Calendar, CheckCircle2, TrendingUp, Sparkles, BookOpen, 
  User, ShieldCheck, Star 
} from "lucide-react";
import toast from "react-hot-toast";
import { useParent } from "@/context/ParentContext";
import ReportCardModal from "@/components/parent/ReportCardModal";
import { printDocument } from "@/lib/exportUtils";

export default function ParentResultsPage() {
  const { selectedChild } = useParent();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState("Term 1 (Mid-Year 2026)");

  const child = selectedChild || {
    firstName: "Aarav",
    lastName: "Sharma",
    grade: "LKG",
    section: "Section A",
    studentId: "GGPS2026LKG001",
    admissionNumber: "GGPS2026Admin001",
  };

  const results = [
    { subject: "Early Numeracy", marks: "96 / 100", grade: "A+", status: "Distinction", teacher: "Ms. Ananya Roy", remarks: "Outstanding counting, patterns, and shape identification skills." },
    { subject: "Phonics & English", marks: "94 / 100", grade: "A+", status: "Distinction", teacher: "Ms. Ananya Roy", remarks: "Clear letter pronunciation and enthusiastic story participation." },
    { subject: "Environmental Awareness", marks: "92 / 100", grade: "A", status: "Merit", teacher: "Mr. Rajesh Kumar", remarks: "Great curiosity about nature, seasons, and classroom plants." },
    { subject: "Creative Arts & Craft", marks: "98 / 100", grade: "A+", status: "Distinction", teacher: "Ms. Priyanka Sen", remarks: "Expressive color combinations, neat clay modeling, and sponge painting." },
    { subject: "Rhymes & Vocal Rhythm", marks: "95 / 100", grade: "A+", status: "Distinction", teacher: "Ms. Ananya Roy", remarks: "Recites poems with joyful expressions and melodic rhythm." },
  ];

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 dark:text-slate-100">
      <ReportCardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        child={child as any}
      />

      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <Link href="/parent" className="hover:text-[#0050CB] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
        <span className="text-slate-800 dark:text-slate-200 font-bold">Results & Report Card</span>
      </div>

      {/* 2. Hero Banner */}
      <div className="relative rounded-[26px] bg-gradient-to-r from-[#F4F8FE] via-[#EDF4FE] to-[#E3EFFF] dark:from-[#091E42] dark:via-[#0A2554] dark:to-[#091E42] border border-[#D7E6FD] dark:border-blue-900/40 p-6 sm:p-7 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0050CB] text-white flex items-center justify-center shadow-md shadow-[#0050CB]/25 shrink-0">
              <Award className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-widest text-[#0050CB] dark:text-[#38BDF8] block">
                ACADEMIC EXCELLENCE
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight mt-0.5">
                Examination Results & Report Card
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-1">
                Official verified performance ledger for {child.firstName} {child.lastName}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#0050CB]/20 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>View Full Report Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#07142F] rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Aggregate</p>
          <p className="text-3xl font-black text-[#0050CB] dark:text-[#38BDF8] mt-1">95.0%</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Grade A+ (Outstanding)
          </p>
        </div>

        <div className="bg-white dark:bg-[#07142F] rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Rank</p>
          <p className="text-3xl font-black text-[#000E28] dark:text-white mt-1">#02</p>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Out of 28 learners</p>
        </div>

        <div className="bg-white dark:bg-[#07142F] rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">96.2%</p>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Consistently punctual</p>
        </div>

        <div className="bg-white dark:bg-[#07142F] rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certification Status</p>
          <p className="text-base font-black text-[#000E28] dark:text-white mt-2 flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Verified & Approved
          </p>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Signed by Academic Head</p>
        </div>
      </div>

      {/* 4. Subject Breakdown Table */}
      <div id="printable-results-ledger" className="bg-white dark:bg-[#07142F] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#000E28] dark:text-white">
              Subject Scorecard: {selectedTerm}
            </h3>
            <p className="text-xs text-slate-400">Continuous comprehensive evaluation metrics</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                printDocument("printable-results-ledger", `GGPS School Assessment Ledger - ${child.firstName} ${child.lastName || ''}`);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Ledger</span>
            </button>
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#0050CB] hover:bg-[#003EA3] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Official PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0B1735] text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-5">Subject</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Evaluation</th>
                <th className="py-3 px-5">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {results.map((r, i) => (
                <tr key={i} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-[#000E28] dark:text-white">
                    {r.subject}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0050CB] dark:text-[#38BDF8]">
                    {r.marks}
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-200 dark:border-emerald-800/40">
                      {r.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {r.status}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 text-[11.5px] leading-relaxed">
                    {r.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
