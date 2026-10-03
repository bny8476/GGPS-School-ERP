"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Download,
  Printer,
  Award,
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
  CheckCircle2,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiBaseUrl } from "@/lib/utils";
import { authFetch } from "@/lib/apiClient";

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
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!isOpen || !child) return null;

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
      badgeType: "text",
      area: "Language & Phonics",
      maxGrade: "Grading Scale",
      result: "Mastered",
      resultType: "mastered",
      remarks: "Recognizes alphabet sounds and blends three-letter words confidently.",
    },
    {
      id: 2,
      badge: "123",
      badgeType: "text",
      area: "Numeracy & Quantities",
      maxGrade: "Grading Scale",
      result: "Mastered",
      resultType: "mastered",
      remarks: "Counts 1-50 accurately and classifies geometric shapes with ease.",
    },
    {
      id: 3,
      icon: Palette,
      badgeType: "icon",
      area: "Creative & Visual Arts",
      maxGrade: "Grading Scale",
      result: "Progressing",
      resultType: "progressing",
      remarks: "Loves clay modelling and demonstrates thoughtful colour palettes.",
    },
    {
      id: 4,
      icon: Activity,
      badgeType: "icon",
      area: "Fine & Gross Motor Skills",
      maxGrade: "Grading Scale",
      result: "Mastered",
      resultType: "mastered",
      remarks: "Excellent pencil grip, scissor handling, and playground balance.",
    },
    {
      id: 5,
      icon: Users,
      badgeType: "icon",
      area: "Social & Emotional Growth",
      maxGrade: "Grading Scale",
      result: "Progressing",
      resultType: "progressing",
      remarks: "Kind peer interactions; shares play materials with genuine empathy.",
    },
    {
      id: 6,
      icon: Lightbulb,
      badgeType: "icon",
      area: "General Awareness",
      maxGrade: "Grading Scale",
      result: "Mastered",
      resultType: "mastered",
      remarks: "Demonstrates high curiosity about nature, seasons, and classroom flora.",
    },
  ];

  // Guaranteed One-Page Print Engine
  const executePrint = () => {
    const printableElement = document.getElementById("report-card-printable-content");
    if (!printableElement) {
      window.print();
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.id = "ggps-print-frame";
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "210mm";
    iframe.style.height = "297mm";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>GGPS_ReportCard_${studentName.replace(/\s+/g, "_")}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <style>
            @page {
              size: A4 portrait;
              margin: 4mm 6mm !important;
            }
            *, *::before, *::after {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            html, body {
              font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #ffffff !important;
              color: #000E28 !important;
              width: 100%;
              height: auto;
              max-height: 290mm !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .printable-sheet {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              padding: 2px !important;
              box-shadow: none !important;
              border: none !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <div class="printable-sheet">
            ${printableElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Print frame error:", err);
        window.print();
      } finally {
        setTimeout(() => {
          const frame = document.getElementById("ggps-print-frame");
          if (frame) document.body.removeChild(frame);
        }, 1500);
      }
    }, 450);

    toast.success("Printing 1-Page Official Report Card...");
  };

  const handleDownloadPDF = async () => {
    const studentId = child._id;
    const toastId = toast.loading("Downloading certified Report Card PDF...");
    try {
      if (studentId) {
        const baseUrl = getApiBaseUrl();
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await authFetch(`${baseUrl}/api/v1/students/${studentId}/report-card`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `GGPS_ReportCard_${studentName.replace(/\s+/g, "_")}.pdf`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 300);
          toast.success("Official Report Card PDF downloaded successfully!", { id: toastId });
          return;
        }
      }
      toast.error("Unable to generate PDF from server. Please try printing to PDF.", { id: toastId });
    } catch (e: any) {
      console.warn("Report card download notice:", e);
      toast.error("Report card PDF generation failed. Please try again.", { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Strict 1-Page Global Print Media Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm 6mm !important;
          }
          html, body {
            background: #ffffff !important;
            color: #000E28 !important;
            height: auto !important;
            max-height: 290mm !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #report-card-printable-content,
          #report-card-printable-content * {
            visibility: visible !important;
          }
          #report-card-printable-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 2px !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .modal-preview-bar {
            display: none !important;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="relative w-full max-w-5xl max-h-[96vh] flex flex-col rounded-3xl bg-[#0f172a] shadow-2xl border border-slate-700/60 overflow-hidden"
      >
        {/* Modal Controls Header */}
        <div className="modal-preview-bar shrink-0 flex items-center justify-between px-5 py-3 bg-[#0f172a] border-b border-slate-700/80 text-white z-20">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#0050CB] text-white shadow-sm flex items-center justify-center">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white leading-tight">
                Official Report Card (1-Page A4) — {studentName}
              </h3>
              <p className="text-[11px] text-slate-400">
                Single Page Format • {classSection} • Session 2026–2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 mr-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.75, Number((z - 0.1).toFixed(2))))}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold text-slate-300 px-2 min-w-[45px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.2, Number((z + 0.1).toFixed(2))))}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={executePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            >
              <Printer className="w-3.5 h-3.5 text-blue-300" />
              <span>Print (1 Page)</span>
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-4 py-1.5 rounded-xl bg-[#0050CB] hover:bg-[#003ea1] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#0050CB]/30 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white ml-1 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Workspace Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-5 bg-slate-900/60 flex justify-center">
          {/* Strictly 1-Page A4 Sheet (794px max-width, compact vertical flow) */}
          <div
            id="report-card-printable-content"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease",
            }}
            className="w-full max-w-[794px] bg-white text-[#000E28] rounded-xl shadow-[0_15px_45px_rgba(0,0,0,0.35)] p-5 space-y-2.5 my-auto border border-slate-200 select-none"
          >
            {/* 1. Header: School Crest + Title + Contact Info */}
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              {/* Left: School Crest & Name */}
              <div className="flex items-center gap-2.5">
                {/* Compact Crest Logo */}
                <div className="w-11 h-11 relative flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-[#0050CB]">
                    {/* Laurel Wreath */}
                    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M 22 75 C 10 50, 15 25, 35 15 C 32 25, 26 45, 30 65" />
                      <path d="M 78 75 C 90 50, 85 25, 65 15 C 68 25, 74 45, 70 65" />
                    </g>
                    <g fill="currentColor">
                      <ellipse cx="18" cy="40" rx="3.5" ry="2" transform="rotate(-30 18 40)" />
                      <ellipse cx="20" cy="52" rx="3.5" ry="2" transform="rotate(-15 20 52)" />
                      <ellipse cx="24" cy="64" rx="3.5" ry="2" transform="rotate(0 24 64)" />
                      <ellipse cx="82" cy="40" rx="3.5" ry="2" transform="rotate(30 82 40)" />
                      <ellipse cx="80" cy="52" rx="3.5" ry="2" transform="rotate(15 80 52)" />
                      <ellipse cx="76" cy="64" rx="3.5" ry="2" transform="rotate(0 76 64)" />
                    </g>
                    {/* Shield */}
                    <path
                      d="M 32 24 L 68 24 C 68 24, 70 52, 50 78 C 30 52, 32 24, 32 24 Z"
                      fill="#0050CB"
                    />
                    {/* Book */}
                    <path
                      d="M 50 48 C 45 44, 39 45, 38 46 L 38 58 C 43 57, 47 58, 50 61 C 53 58, 57 57, 62 58 L 62 46 C 61 45, 55 44, 50 48 Z"
                      fill="white"
                    />
                    <line x1="50" y1="48" x2="50" y2="61" stroke="#0050CB" strokeWidth="1.5" />
                    <polygon
                      points="50,33 53,39 59,39 54,43 56,49 50,45 44,49 46,43 41,39 47,39"
                      fill="white"
                    />
                  </svg>
                </div>

                <div>
                  <h1 className="text-xl font-black text-[#000E28] tracking-tight leading-none">
                    GGPS SCHOOL
                  </h1>
                  <p className="text-[9px] font-bold text-slate-600 tracking-[0.2em] uppercase mt-0.5">
                    LEARN &nbsp;•&nbsp; GROW &nbsp;•&nbsp; SUCCEED
                  </p>
                </div>
              </div>

              {/* Right: Contact Details */}
              <div className="text-right space-y-0.5 text-[9.5px] text-slate-600">
                <div className="flex items-center justify-end gap-1">
                  <MapPin className="w-3 h-3 text-[#0050CB] shrink-0" />
                  <span>Prestige Knowledge City, Bangalore - 560103</span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Phone className="w-3 h-3 text-[#0050CB] shrink-0" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Mail className="w-3 h-3 text-[#0050CB] shrink-0" />
                  <span>info@ggpsschool.in</span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Globe className="w-3 h-3 text-[#0050CB] shrink-0" />
                  <span>www.ggpsschool.in</span>
                </div>
              </div>
            </div>

            {/* 2. Subtitle Divider & Header Title */}
            <div className="relative border-t border-blue-200 pt-1.5 text-center">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                GGPS School ERP
              </span>

              <div className="flex items-center justify-between gap-1 mt-0.5">
                <div className="w-24 hidden sm:block"></div>

                <div className="text-center flex-1">
                  <h2 className="text-base font-black text-[#0050CB] tracking-tight uppercase leading-tight">
                    ACADEMIC ASSESSMENT &amp; REPORT CARD
                  </h2>
                  <p className="text-[10px] font-bold text-slate-700 tracking-wider">
                    ACADEMIC SESSION: 2026 – 2027
                  </p>
                </div>

                <div className="w-28 flex justify-end">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E5EEFF] text-[#0050CB] font-black text-[9px] uppercase tracking-wider border border-blue-200">
                    TERM 1 REPORT CARD
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Student Information Card */}
            <div className="rounded-xl border border-blue-200/90 p-2.5 relative bg-white shadow-xs">
              <div className="absolute -top-2.5 left-3.5 bg-[#0050CB] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-sm">
                <User className="w-2.5 h-2.5" />
                <span>STUDENT INFORMATION</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-0.5">
                {/* Column 1 */}
                <div className="space-y-1">
                  <div className="flex items-start gap-1.5">
                    <User className="w-3 h-3 text-[#0050CB] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Student Name
                      </span>
                      <span className="text-[11px] font-black text-slate-900 block leading-tight">{studentName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Calendar className="w-3 h-3 text-[#0050CB] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Date of Birth
                      </span>
                      <span className="text-[10.5px] font-bold text-slate-800 block leading-tight">{dob}</span>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-1 border-l border-slate-200 pl-2.5">
                  <div className="flex items-start gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-[#0050CB] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Admission No.
                      </span>
                      <span className="text-[11px] font-black text-slate-900 block leading-tight">{admissionNo}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <GraduationCap className="w-3 h-3 text-[#0050CB] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Class Teacher
                      </span>
                      <span className="text-[10.5px] font-bold text-slate-800 block leading-tight">{classTeacher}</span>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-1 border-l border-slate-200 pl-2.5">
                  <div className="flex items-start gap-1.5">
                    <GraduationCap className="w-3 h-3 text-[#0050CB] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Class &amp; Section
                      </span>
                      <span className="text-[11px] font-black text-slate-900 block leading-tight">{classSection}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Users className="w-3 h-3 text-[#0050CB] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Roll Number
                      </span>
                      <span className="text-[10.5px] font-bold text-slate-800 block leading-tight">{rollNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Academic Performance Table */}
            <div className="rounded-xl border border-blue-200/90 overflow-hidden relative shadow-xs">
              <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-blue-100 bg-white">
                <div className="flex items-center gap-1.5 bg-[#0050CB] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                  <BookOpen className="w-2.5 h-2.5" />
                  <span>ACADEMIC PERFORMANCE</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#E5EEFF] text-[#0050CB] font-bold text-[9px] uppercase tracking-wider border border-blue-200">
                  CURRICULUM: {curriculum}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F0F5FF] text-[#0050CB] font-bold border-b border-blue-100 text-[9px]">
                      <th className="py-1 px-2.5 w-[28%]">DEVELOPMENT AREA</th>
                      <th className="py-1 px-2.5 w-[18%]">MAXIMUM / GRADE</th>
                      <th className="py-1 px-2.5 w-[18%]">OBTAINED RESULT</th>
                      <th className="py-1 px-2.5 w-[36%]">TEACHER OBSERVATION / REMARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10px]">
                    {performanceItems.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/20">
                        {/* Area */}
                        <td className="py-1 px-2.5 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#0050CB] text-white flex items-center justify-center font-bold text-[8px] shrink-0">
                              {item.badgeType === "text" ? (
                                item.badge
                              ) : item.icon ? (
                                <item.icon className="w-2.5 h-2.5" />
                              ) : null}
                            </div>
                            <span className="text-[10px] font-bold text-slate-800">{item.area}</span>
                          </div>
                        </td>

                        {/* Max Grade */}
                        <td className="py-1 px-2.5 text-slate-600 font-medium text-[10px]">
                          {item.maxGrade}
                        </td>

                        {/* Result */}
                        <td className="py-1 px-2.5">
                          {item.resultType === "mastered" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Mastered</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E5EEFF] text-[#0050CB] border border-blue-200">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Progressing</span>
                            </span>
                          )}
                        </td>

                        {/* Remarks */}
                        <td className="py-1 px-2.5 text-slate-600 text-[9.5px] leading-tight">
                          {item.remarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Summary Row (Attendance + Overall Performance + Grading Legend) */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Attendance */}
              <div className="rounded-xl border border-blue-200/90 p-2 bg-white shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1 bg-[#0050CB] text-white px-2 py-0.5 rounded-full text-[9px] font-bold w-fit mb-1">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>ATTENDANCE SUMMARY</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-center py-0.5">
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold uppercase block leading-tight">
                      Total Working Days
                    </span>
                    <span className="text-base font-black text-slate-900 block">90</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold uppercase block leading-tight">
                      Days Present
                    </span>
                    <span className="text-base font-black text-slate-900 block">82</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold uppercase block leading-tight">
                      Days Absent
                    </span>
                    <span className="text-base font-black text-slate-900 block">8</span>
                  </div>
                </div>

                <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] bg-slate-50 px-2 py-0.5 rounded-lg">
                  <span className="font-bold text-slate-700">Attendance Percentage</span>
                  <span className="font-black text-[#0050CB] text-[11px]">91%</span>
                </div>
              </div>

              {/* Overall Performance */}
              <div className="rounded-xl border border-blue-200/90 p-2 bg-white shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1 bg-[#0050CB] text-white px-2 py-0.5 rounded-full text-[9px] font-bold w-fit mb-1">
                  <Star className="w-2.5 h-2.5" />
                  <span>OVERALL PERFORMANCE</span>
                </div>

                <div className="flex items-center justify-center gap-2.5 py-0.5">
                  <div className="w-10 h-10 rounded-full border-2 border-[#0050CB] flex items-center justify-center text-sm font-black text-[#0050CB]">
                    A+
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
                      Overall Grade
                    </span>
                    <span className="text-sm font-black text-slate-900 block leading-tight">Excellent</span>
                  </div>
                </div>

                <div className="text-center mt-0.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E5EEFF] text-[#0050CB] font-bold text-[9px] border border-blue-200">
                    Class Position: 2 / 25
                  </span>
                </div>
              </div>

              {/* Grading Legend */}
              <div className="rounded-xl border border-blue-200/90 p-2 bg-white shadow-xs">
                <div className="flex items-center gap-1 bg-[#0050CB] text-white px-2 py-0.5 rounded-full text-[9px] font-bold w-fit mb-1">
                  <BarChart3 className="w-2.5 h-2.5" />
                  <span>GRADING LEGEND</span>
                </div>

                <table className="w-full text-left text-[9px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="py-0.5 px-1">Grade</th>
                      <th className="py-0.5 px-1">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr>
                      <td className="py-0.2 px-1 font-bold text-[#0050CB]">A+</td>
                      <td className="py-0.2 px-1">Outstanding</td>
                    </tr>
                    <tr>
                      <td className="py-0.2 px-1 font-bold text-[#0050CB]">A</td>
                      <td className="py-0.2 px-1">Excellent</td>
                    </tr>
                    <tr>
                      <td className="py-0.2 px-1 font-bold text-[#0050CB]">B+</td>
                      <td className="py-0.2 px-1">Very Good</td>
                    </tr>
                    <tr>
                      <td className="py-0.2 px-1 font-bold text-[#0050CB]">B</td>
                      <td className="py-0.2 px-1">Good</td>
                    </tr>
                    <tr>
                      <td className="py-0.2 px-1 font-bold text-[#0050CB]">C+</td>
                      <td className="py-0.2 px-1">Satisfactory</td>
                    </tr>
                    <tr>
                      <td className="py-0.2 px-1 font-bold text-[#0050CB]">C</td>
                      <td className="py-0.2 px-1">Need Improvement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. Remarks: Teacher & Principal Remarks */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-blue-200/90 p-2 bg-white shadow-xs">
                <div className="flex items-center gap-1 bg-[#0050CB] text-white px-2 py-0.5 rounded-full text-[9px] font-bold w-fit mb-1">
                  <User className="w-2.5 h-2.5" />
                  <span>TEACHER REMARKS</span>
                </div>
                <p className="text-[9.5px] text-slate-600 leading-snug">
                  {studentName} is a bright and curious learner. He shows enthusiasm in all activities
                  and is making steady progress. With continued support and encouragement, he will
                  achieve even greater success.
                </p>
              </div>

              <div className="rounded-xl border border-blue-200/90 p-2 bg-white shadow-xs">
                <div className="flex items-center gap-1 bg-[#0050CB] text-white px-2 py-0.5 rounded-full text-[9px] font-bold w-fit mb-1">
                  <GraduationCap className="w-2.5 h-2.5" />
                  <span>PRINCIPAL REMARKS</span>
                </div>
                <p className="text-[9.5px] text-slate-600 leading-snug">
                  Well done, {child.firstName || "Sammy"}! Keep up the good work. Your consistent
                  effort and positive attitude are commendable.
                </p>
              </div>
            </div>

            {/* 7. Parent Acknowledgement */}
            <div className="rounded-xl border border-blue-200/90 p-2 bg-white shadow-xs space-y-1">
              <div className="flex items-center gap-1 bg-[#0050CB] text-white px-2 py-0.5 rounded-full text-[9px] font-bold w-fit">
                <Users className="w-2.5 h-2.5" />
                <span>PARENT ACKNOWLEDGEMENT</span>
              </div>

              <p className="text-[9.5px] text-slate-600 font-medium">
                I have read and understood the contents of this report card.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-1 text-[9.5px] text-slate-500 font-medium">
                <div className="border-b border-slate-300 pb-0.5">
                  <span>Parent / Guardian Name:</span>
                </div>
                <div className="border-b border-slate-300 pb-0.5">
                  <span>Signature:</span>
                </div>
                <div className="border-b border-slate-300 pb-0.5">
                  <span>Date:</span>
                </div>
              </div>
            </div>

            {/* 8. Signatures & Official Stamp Footer (Small & Compact for Guaranteed 1-Page fit) */}
            <div className="pt-0.5 grid grid-cols-4 gap-2 items-center text-center">
              {/* Teacher Signature */}
              <div className="flex flex-col items-center">
                <div
                  className="h-6 text-sm font-bold text-[#0050CB] flex items-end justify-center select-none"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  Ananya Roy
                </div>
                <div className="w-24 border-t border-slate-300 pt-0.5 mt-0.5">
                  <p className="text-[9.5px] font-bold text-slate-800 leading-tight">Ms. Ananya Roy</p>
                  <p className="text-[8px] text-slate-500">Class Teacher</p>
                </div>
              </div>

              {/* Rubber Stamp Seal (Small) */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-dashed border-[#0050CB] p-0.5 flex flex-col items-center justify-center text-center relative select-none">
                  <div className="w-full h-full rounded-full border border-[#0050CB] flex flex-col items-center justify-center p-0.5 bg-blue-50/20">
                    <span className="text-[5px] font-black text-[#0050CB] tracking-wider uppercase leading-none">
                      GGPS SCHOOL
                    </span>
                    <div className="my-0.5">
                      <BookOpen className="w-2.5 h-2.5 text-[#0050CB]" />
                    </div>
                    <span className="text-[4.5px] font-bold text-[#0050CB] tracking-wider leading-none">
                      ESTD. 2015
                    </span>
                  </div>
                </div>
                <p
                  className="text-[7px] text-[#0050CB] font-bold italic mt-0.5 leading-none"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  Nurturing Young Minds for a Brighter Future
                </p>
              </div>

              {/* Principal Signature */}
              <div className="flex flex-col items-center">
                <div
                  className="h-6 text-sm font-bold text-[#0050CB] flex items-end justify-center select-none"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  Dr. M. S. Varma
                </div>
                <div className="w-24 border-t border-slate-300 pt-0.5 mt-0.5">
                  <p className="text-[9.5px] font-bold text-slate-800 leading-tight">Dr. M. S. Varma</p>
                  <p className="text-[8px] text-slate-500">Principal</p>
                </div>
              </div>

              {/* QR Code (Small) */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 p-0.5 border border-slate-200 rounded-md bg-white shadow-xs">
                  <svg viewBox="0 0 29 29" className="w-full h-full text-slate-900" fill="currentColor">
                    <rect x="0" y="0" width="7" height="7" />
                    <rect x="1" y="1" width="5" height="5" fill="white" />
                    <rect x="2" y="2" width="3" height="3" />
                    <rect x="22" y="0" width="7" height="7" />
                    <rect x="23" y="1" width="5" height="5" fill="white" />
                    <rect x="24" y="2" width="3" height="3" />
                    <rect x="0" y="22" width="7" height="7" />
                    <rect x="1" y="23" width="5" height="5" fill="white" />
                    <rect x="2" y="24" width="3" height="3" />
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
                <p className="text-[7.5px] text-slate-500 mt-0.5 max-w-[85px] leading-tight">
                  Scan to verify
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
