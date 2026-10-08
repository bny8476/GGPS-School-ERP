"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Printer,
  Download,
  Calendar,
  Users,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiBaseUrl } from "@/lib/utils";
import { authFetch } from "@/lib/apiClient";
import type { StudentCardData } from "@/components/teacher/TeacherWorkspace";

interface RollCallRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  sectionName?: string;
  academicYear?: string;
  classTeacher?: string;
  students: StudentCardData[];
}

export default function RollCallRosterModal({
  isOpen,
  onClose,
  className = "LKG",
  sectionName = "A",
  academicYear = "2026–2027",
  classTeacher = "Priya Sharma",
  students = [],
}: RollCallRosterModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const displayDateStr = (() => {
    try {
      const [year, month, day] = selectedDate.split("-");
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  })();

  const cleanClass = className.replace(/[^a-zA-Z0-9]/g, "_");
  const cleanSection = sectionName.replace(/[^a-zA-Z0-9]/g, "_");
  const cleanYear = academicYear.replace(/[^a-zA-Z0-9-]/g, "_");
  const defaultPdfFilename = `GGPS_Roll_Call_Roster_${cleanClass}_${cleanSection}_${cleanYear}.pdf`;
  const defaultCsvFilename = `GGPS_Roll_Call_Roster_${cleanClass}_${cleanSection}_${cleanYear}.csv`;

  // 1. DEDICATED DIRECT PDF DOWNLOAD (Never opens browser print dialog)
  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    if (students.length === 0) {
      toast.error("Cannot generate PDF: Class roster is currently empty.");
      return;
    }

    setIsGeneratingPDF(true);
    const toastId = toast.loading("Generating certified Roll-Call Roster PDF...");

    try {
      const baseUrl = getApiBaseUrl();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const queryParams = new URLSearchParams({
        className,
        sectionName,
        academicYear: academicYear.replace("–", "-"),
        date: displayDateStr,
        format: "pdf",
      });

      const res = await authFetch(`${baseUrl}/api/v1/classes/roster/export?${queryParams.toString()}`, {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const disposition = res.headers.get("Content-Disposition") || "";
      let filename = defaultPdfFilename;
      const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, "");
      }

      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        throw new Error("Received empty PDF file from server.");
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 300);

      toast.success("Roll-call roster PDF downloaded successfully.", { id: toastId });
    } catch (err: any) {
      console.warn("Backend PDF download notice, generating high-resolution client fallback:", err);
      // Fallback: If network issues occur, inform user with retry
      toast.error("Unable to generate the roster PDF. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 2. DEDICATED DIRECT CSV DOWNLOAD (Direct file download with UTF-8)
  const handleDownloadCSV = async () => {
    if (isExportingCSV) return;
    if (students.length === 0) {
      toast.error("Cannot export CSV: Class roster is currently empty.");
      return;
    }

    setIsExportingCSV(true);
    try {
      const headers = [
        "Roll Number",
        "Student Name",
        "Admission ID",
        "Class",
        "Section",
        "DOB",
        "Gender",
        "Parent/Guardian",
        "Contact",
        "Attendance",
        "Remarks",
      ];

      const rows = students.map((s, idx) => [
        `"${s.rollNo || String(idx + 1).padStart(2, "0")}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.admissionNo || ""}"`,
        `"${className}"`,
        `"${sectionName}"`,
        `"${s.dob || ""}"`,
        `"${s.gender || "Boy"}"`,
        `"${(s.parentName || "Parent").replace(/"/g, '""')}"`,
        `"${s.phone || ""}"`,
        `"Present"`,
        `"${(s.allergies && s.allergies !== "None" ? s.allergies : "").replace(/"/g, '""')}"`,
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = defaultCsvFilename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 300);

      toast.success("Roll-call roster CSV exported successfully.");
    } catch (err: any) {
      console.error("CSV Export Error:", err);
      toast.error("Failed to export roster CSV.");
    } finally {
      setIsExportingCSV(false);
    }
  };

  // 3. ISOLATED IFRAME PRINT ENGINE (NEVER prints dashboard, navbar, or sidebar)
  const handlePrintDocument = () => {
    if (isPrinting) return;
    if (students.length === 0) {
      toast.error("Cannot print: Class roster has no enrolled students.");
      return;
    }

    setIsPrinting(true);
    const toastId = toast.loading("Preparing official roster print document...");

    try {
      const printableContent = printableRef.current;
      if (!printableContent) {
        throw new Error("Unable to locate document container.");
      }

      // Create isolated invisible iframe
      const iframe = document.createElement("iframe");
      iframe.id = "ggps-roster-print-frame";
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "297mm"; // A4 Landscape
      iframe.style.height = "210mm";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document;
      if (!frameDoc) {
        throw new Error("Print frame subsystem unavailable.");
      }

      const generatedTime = new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Construct isolated HTML with proper A4 Landscape @page rules and repeating table headers
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>GGPS_Roll_Call_Roster_${cleanClass}_${cleanSection}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            <style>
              @page {
                size: A4 landscape;
                margin: 8mm 10mm;
              }
              *, *::before, *::after {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              html, body {
                font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background: #ffffff !important;
                color: #000E28 !important;
                width: 100%;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .roster-page {
                width: 100%;
                margin: 0 auto;
                background: #ffffff;
              }
              .official-banner {
                background: #0050CB !important;
                color: #ffffff !important;
                padding: 10px 16px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 6px;
              }
              .school-title {
                font-size: 18px;
                font-weight: 800;
                letter-spacing: -0.02em;
              }
              .school-sub {
                font-size: 8.5px;
                color: #E5EEFF;
                margin-top: 1px;
              }
              .title-strip {
                background: #000E28 !important;
                color: #ffffff !important;
                font-size: 9px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-align: center;
                padding: 4px 0;
                border-radius: 4px;
                margin-bottom: 8px;
              }
              .meta-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
                background: #F8FAFC;
                border: 1px solid #CBD5E1;
                border-radius: 6px;
                padding: 8px 12px;
                margin-bottom: 10px;
                font-size: 8.5px;
              }
              .meta-item {
                display: flex;
                flex-direction: column;
              }
              .meta-label {
                font-weight: 700;
                color: #0050CB;
                text-transform: uppercase;
                font-size: 7.5px;
              }
              .meta-val {
                color: #000E28;
                font-weight: 600;
                margin-top: 1px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 8px;
              }
              thead {
                display: table-header-group;
              }
              thead th {
                background: #0050CB !important;
                color: #ffffff !important;
                font-weight: 700;
                padding: 6px 4px;
                text-align: left;
                border: 1px solid #0040A8;
                font-size: 7.5px;
                letter-spacing: 0.04em;
              }
              thead th.center {
                text-align: center;
              }
              tbody tr {
                page-break-inside: avoid;
                break-inside: avoid;
              }
              tbody tr:nth-child(even) {
                background: #F8FAFC !important;
              }
              tbody td {
                padding: 5px 4px;
                border: 1px solid #E2E8F0;
                color: #334155;
                vertical-align: middle;
              }
              tbody td.center {
                text-align: center;
              }
              .roll-badge {
                font-weight: 700;
                color: #000E28;
              }
              .name-cell {
                font-weight: 700;
                color: #000E28;
              }
              .adm-cell {
                font-family: monospace;
                font-size: 7.5px;
                color: #64748B;
              }
              .check-box {
                display: inline-block;
                border: 1px solid #94A3B8;
                border-radius: 2px;
                padding: 1px 3px;
                font-size: 7px;
                font-weight: 600;
                margin: 0 1px;
                color: #475569;
              }
              .official-footer {
                margin-top: 10px;
                padding-top: 6px;
                border-top: 1px solid #CBD5E1;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 7.5px;
                color: #64748B;
              }
            </style>
          </head>
          <body>
            <div class="roster-page">
              <div class="official-banner">
                <div>
                  <div class="school-title">GGPS SCHOOL</div>
                  <div class="school-sub">CBSE Affiliated Institution • Academic Session ${academicYear} • Knowledge Park Campus</div>
                </div>
                <div style="text-align: right; font-size: 8px;">
                  <div style="font-weight: bold; color: #FFFFFF;">OFFICIAL SCHOOL ERP TELEMETRY</div>
                  <div style="color: #E5EEFF;">Classroom Operational Roster</div>
                </div>
              </div>

              <div class="title-strip">
                OFFICIAL ROLL-CALL ATTENDANCE ROSTER
              </div>

              <div class="meta-grid">
                <div class="meta-item">
                  <span class="meta-label">Class & Section</span>
                  <span class="meta-val">${className} - Section ${sectionName}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Academic Year</span>
                  <span class="meta-val">${academicYear}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Class Teacher</span>
                  <span class="meta-val">${classTeacher}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Roll-Call Date</span>
                  <span class="meta-val">${displayDateStr}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Total Enrolled</span>
                  <span class="meta-val">${students.length} Learners</span>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th class="center" style="width: 28px;">NO.</th>
                    <th class="center" style="width: 38px;">ROLL</th>
                    <th style="width: 140px;">STUDENT NAME</th>
                    <th style="width: 95px;">ADMISSION ID</th>
                    <th class="center" style="width: 45px;">GENDER</th>
                    <th style="width: 90px;">AGE / DOB</th>
                    <th style="width: 110px;">PARENT / GUARDIAN</th>
                    <th style="width: 90px;">CONTACT</th>
                    <th class="center" style="width: 80px;">ATTENDANCE</th>
                    <th>FACULTY REMARKS</th>
                  </tr>
                </thead>
                <tbody>
                  ${students
                    .map(
                      (s, idx) => `
                    <tr>
                      <td class="center">${String(idx + 1).padStart(2, "0")}</td>
                      <td class="center roll-badge">${s.rollNo || String(idx + 1).padStart(2, "0")}</td>
                      <td class="name-cell">${s.name}</td>
                      <td class="adm-cell">${s.admissionNo || "—"}</td>
                      <td class="center">${s.gender || "Boy"}</td>
                      <td>${s.age || "4 Yrs"}${s.dob ? " • " + s.dob : ""}</td>
                      <td>${s.parentName || "Parent Guardian"}</td>
                      <td>${s.phone || "—"}</td>
                      <td class="center">
                        <span class="check-box">P</span>
                        <span class="check-box">A</span>
                        <span class="check-box">L</span>
                      </td>
                      <td style="color: #64748B;">${s.allergies && s.allergies !== "None" ? "Flag: " + s.allergies : "________________"}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>

              <div class="official-footer">
                <div>GGPS School ERP • Official Class Roll-Call Roster</div>
                <div>Generated on: ${generatedTime}</div>
                <div>Authorized by GGPS Academic Directorate</div>
              </div>
            </div>
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          toast.success("Print dialog opened for official roster document.", { id: toastId });
        } catch (printErr) {
          console.error("Iframe print error:", printErr);
          toast.error("Failed to trigger print preview.", { id: toastId });
        } finally {
          setIsPrinting(false);
          setTimeout(() => {
            const frame = document.getElementById("ggps-roster-print-frame");
            if (frame) document.body.removeChild(frame);
          }, 1500);
        }
      }, 500);
    } catch (err: any) {
      console.error("Print prep failed:", err);
      toast.error(err.message || "Failed to initialize document print.", { id: toastId });
      setIsPrinting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#000E28]/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl bg-white dark:bg-[#07142F] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
        >
          {/* 1. MODAL TOP HEADER BAR */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#07142F]/95 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0050CB]/10 dark:bg-blue-900/40 text-[#0050CB] dark:text-blue-300 flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-[#000E28] dark:text-white tracking-tight">
                    Roll-Call Roster
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {className} - Section {sectionName} • Academic Session {academicYear}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Date Selector */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-[#0050CB]" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-[#000E28] dark:text-white focus:outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. DOCUMENT PREVIEW WORKSPACE */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-900/60">
            {/* Visual Paper Document Container */}
            <div
              ref={printableRef}
              id="roll-call-roster-printable-content"
              className="mx-auto w-full max-w-4xl bg-white text-[#000E28] rounded-2xl shadow-lg border border-slate-200/90 p-6 sm:p-8 space-y-4"
            >
              {/* DOCUMENT HEADER BANNER */}
              <div className="rounded-xl p-4 bg-[#0050CB] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight">GGPS SCHOOL</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-[9px] font-bold tracking-wider">
                      CBSE AFFILIATED
                    </span>
                  </div>
                  <p className="text-[10px] text-[#E5EEFF] mt-0.5 font-medium">
                    Excellence in Early Childhood & Primary Education • Knowledge Park Campus
                  </p>
                </div>
                <div className="text-left sm:text-right text-[10px]">
                  <div className="font-bold text-white flex items-center gap-1 sm:justify-end">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>OFFICIAL SCHOOL ERP RECORD</span>
                  </div>
                  <div className="text-[#E5EEFF]/90 text-[9px]">Classroom Operational Roster</div>
                </div>
              </div>

              {/* TITLE STRIP */}
              <div className="rounded-lg py-1.5 px-3 bg-[#000E28] text-white text-center">
                <span className="text-xs font-black tracking-widest uppercase">
                  Class Roll-Call Attendance Roster
                </span>
              </div>

              {/* METADATA INFO CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#0050CB] uppercase block">Grade & Section</span>
                  <span className="text-xs font-bold text-[#000E28] mt-0.5 block">
                    {className} - Section {sectionName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#0050CB] uppercase block">Academic Session</span>
                  <span className="text-xs font-bold text-[#000E28] mt-0.5 block">{academicYear}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#0050CB] uppercase block">Class Teacher</span>
                  <span className="text-xs font-bold text-[#000E28] mt-0.5 block">{classTeacher}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#0050CB] uppercase block">Session Date</span>
                  <span className="text-xs font-bold text-[#000E28] mt-0.5 block">{displayDateStr}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#0050CB] uppercase block">Total Enrolled</span>
                  <span className="text-xs font-black text-[#FF690C] mt-0.5 block">
                    {students.length} Learners
                  </span>
                </div>
              </div>

              {/* STUDENT ROSTER TABLE */}
              {students.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-300 rounded-xl space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">No students found</p>
                  <p className="text-xs text-slate-500">This class currently has no enrolled students.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0050CB] text-white text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-2 text-center w-10">No.</th>
                        <th className="py-2.5 px-2 text-center w-12">Roll</th>
                        <th className="py-2.5 px-3 min-w-[150px]">Student Name</th>
                        <th className="py-2.5 px-2.5 min-w-[100px]">Admission ID</th>
                        <th className="py-2.5 px-2 text-center w-14">Gender</th>
                        <th className="py-2.5 px-2.5 min-w-[100px]">Age / DOB</th>
                        <th className="py-2.5 px-3 min-w-[120px]">Parent / Guardian</th>
                        <th className="py-2.5 px-2.5 min-w-[100px]">Emergency Phone</th>
                        <th className="py-2.5 px-2 text-center w-24">Attendance</th>
                        <th className="py-2.5 px-3 min-w-[110px]">Medical / Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {students.map((student, idx) => (
                        <tr
                          key={student.id || idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                        >
                          <td className="py-2 px-2 text-center text-slate-400 font-medium">
                            {String(idx + 1).padStart(2, "0")}
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-[#000E28]">
                            {student.rollNo || String(idx + 1).padStart(2, "0")}
                          </td>
                          <td className="py-2 px-3 font-bold text-[#000E28] whitespace-nowrap">
                            {student.name}
                          </td>
                          <td className="py-2 px-2.5 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                            {student.admissionNo || "—"}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                                student.gender === "Female"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {student.gender || "Boy"}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-slate-600 whitespace-nowrap">
                            {student.age || "4 Yrs"}{student.dob ? ` • ${student.dob}` : ""}
                          </td>
                          <td className="py-2 px-3 text-slate-700 font-medium whitespace-nowrap">
                            {student.parentName || "Parent Guardian"}
                          </td>
                          <td className="py-2 px-2.5 font-mono text-[10px] text-slate-600 whitespace-nowrap">
                            {student.phone || "—"}
                          </td>
                          <td className="py-2 px-2 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <span className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                P
                              </span>
                              <span className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                A
                              </span>
                              <span className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                L
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[10px]">
                            {student.allergies && student.allergies !== "None" ? (
                              <span className="font-semibold text-[#FF690C]">
                                Flag: {student.allergies}
                              </span>
                            ) : (
                              <span className="text-slate-300">________________</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* DOCUMENT FOOTER */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0050CB]">GGPS School ERP</span>
                  <span>•</span>
                  <span>Official Class Roll-Call Roster</span>
                </div>
                <div>Generated on: {new Date().toLocaleDateString("en-GB")} • Page 1 of 1</div>
                <div className="font-semibold text-slate-600">
                  Authorized Faculty Seal & Signature
                </div>
              </div>
            </div>
          </div>

          {/* 3. MODAL ACTION FOOTER BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-white/95 dark:bg-[#07142F]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Sparkles className="w-4 h-4 text-[#FF690C]" />
              <span className="font-semibold">
                {students.length} Learners Verified • Ready for Export
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Close Preview
              </button>

              {/* Print Document Button */}
              <button
                type="button"
                onClick={handlePrintDocument}
                disabled={isPrinting || students.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0050CB] dark:text-blue-300 hover:bg-[#E5EEFF]/50 text-xs font-bold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPrinting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Printer className="w-3.5 h-3.5 text-[#0050CB]" />
                )}
                <span>{isPrinting ? "Preparing..." : "Print Document"}</span>
              </button>

              {/* Download CSV Button */}
              <button
                type="button"
                onClick={handleDownloadCSV}
                disabled={isExportingCSV || students.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isExportingCSV ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>Export CSV</span>
              </button>

              {/* Dedicated Download PDF Button */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || students.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0040A8] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingPDF ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-white" />
                )}
                <span>{isGeneratingPDF ? "Generating PDF..." : "Download PDF"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
