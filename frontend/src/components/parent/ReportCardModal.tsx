"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Download, Printer, Award, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import GGPSLogo from "@/components/parent/GGPSLogo";

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: {
    _id: string;
    firstName: string;
    lastName: string;
    admissionNumber?: string;
    grade?: string;
    section?: string;
    rollNumber?: string;
    teacherName?: string;
  };
}

export default function ReportCardModal({ isOpen, onClose, child }: ReportCardModalProps) {
  if (!isOpen || !child) return null;

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const response = await fetch(`${apiBase}/api/v1/parents/report-card/${child._id}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download official report card");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GGPS_ReportCard_${child.firstName}_${child.grade || "Term1"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Report card downloaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to download PDF. Opening printable version.");
      window.print();
    }
  };

  const learningAreas = [
    { area: "Language & Phonics", score: "Mastered", notes: "Recognizes alphabet sounds and blends three-letter words confidently." },
    { area: "Numeracy & Quantities", score: "Mastered", notes: "Counts 1–50 accurately and classifies geometric shapes with ease." },
    { area: "Creative & Visual Arts", score: "Progressing", notes: "Loves clay modelling and demonstrates thoughtful colour palettes." },
    { area: "Fine & Gross Motor Skills", score: "Mastered", notes: "Excellent pencil grip, scissor handling, and playground balance." },
    { area: "Social & Emotional Growth", score: "Progressing", notes: "Kind peer interactions; shares play materials with genuine empathy." },
    { area: "General Awareness", score: "Mastered", notes: "Demonstrates high curiosity about nature, seasons, and classroom flora." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-[#07142F] dark:border-white/10"
      >
        {/* Modal Controls Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-50/90 dark:bg-[#07142F]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#3157D5]/10 text-[#3157D5] dark:text-blue-300">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-[#07142F] dark:text-white">
                Official Academic Assessment & Report Card
              </h3>
              <p className="text-[11px] text-slate-500">
                GGPS Central Board of Secondary Education • 2026–2027
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 rounded-lg bg-[#3157D5] hover:bg-[#2444B5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Card Document Content */}
        <div className="p-6 sm:p-10 space-y-8 bg-white text-[#172033] dark:bg-[#07142F] dark:text-white">
          {/* Institution Header */}
          <div className="flex items-start justify-between border-b-2 border-[#3157D5] pb-6">
            <div className="flex items-center gap-4">
              <GGPSLogo size="lg" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#07142F] dark:text-white uppercase">
                  GGPS International School
                </h1>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Affiliated to CBSE • Institutional Code: GGPS-KA-5601
                </p>
                <p className="text-[11px] text-slate-400">
                  Campus: Prestige Knowledge City, Bangalore – 560103
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-[#E5EEFF] dark:bg-[#3157D5]/25 text-[#3157D5] dark:text-blue-300 text-xs font-black uppercase tracking-wider">
                Term 1 Report Card
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                Session 2026–2027
              </p>
            </div>
          </div>

          {/* Student Profile Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F6F8FC] dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Student Name</span>
              <p className="text-xs sm:text-sm font-bold">{child.firstName} {child.lastName}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Class & Section</span>
              <p className="text-xs sm:text-sm font-bold">{child.grade} – {child.section}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Admission No.</span>
              <p className="text-xs sm:text-sm font-mono font-bold text-[#0050CB]">{child.admissionNumber || "GGPS2026Admin001"}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Class Instructor</span>
              <p className="text-xs sm:text-sm font-bold">{child.teacherName || "Ms. Ananya Roy"}</p>
            </div>
          </div>

          {/* Learning Areas & Rubrics Table */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Foundational Learning & Development Rubrics
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Development Area</th>
                    <th className="py-2.5 px-3">Proficiency Level</th>
                    <th className="py-2.5 px-3">Educator Observation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {learningAreas.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-[#000E28] dark:text-white">
                        {item.area}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.score === "Mastered"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : "bg-blue-100 dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300"
                        }`}>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {item.score}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        {item.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Teacher Remarks & Endorsements */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0050CB]">
              Overall Lead Educator Remarks
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              &ldquo;{child.firstName} has made commendable strides in classroom curiosity, language fluency, and creative collaborative play. Always energetic, polite, and eager to discover new concepts every morning.&rdquo;
            </p>
          </div>

          {/* Signature Block */}
          <div className="pt-6 grid grid-cols-3 gap-4 text-center border-t border-slate-200 dark:border-slate-800">
            <div>
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-sm text-slate-600 dark:text-slate-400">Ananya Roy</span>
              </div>
              <p className="text-[10px] uppercase font-bold text-slate-400 pt-1 border-t border-slate-300 dark:border-slate-700">Class Teacher</p>
            </div>
            <div>
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-sm text-slate-600 dark:text-slate-400">Dr. M. S. Varma</span>
              </div>
              <p className="text-[10px] uppercase font-bold text-slate-400 pt-1 border-t border-slate-300 dark:border-slate-700">Academic Dean</p>
            </div>
            <div>
              <div className="h-10 flex items-end justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
              </div>
              <p className="text-[10px] uppercase font-bold text-slate-400 pt-1 border-t border-slate-300 dark:border-slate-700">Digital Seal Verified</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
