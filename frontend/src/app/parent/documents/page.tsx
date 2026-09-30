"use client";

import React, { useState, useMemo } from "react";
import { 
  FileText, Download, Eye, ShieldCheck, Award, Receipt, School, 
  Calendar, MoreVertical, Search, SlidersHorizontal, Plus, X, 
  Check, Bell, ChevronDown, CheckCircle2, Lock, ArrowUpRight, 
  Printer, Share2, UploadCloud, FileCheck, Sparkles, AlertCircle
} from "lucide-react";
import ReportCardModal from "@/components/parent/ReportCardModal";
import IdCardParentModal from "@/components/parent/IdCardParentModal";
import { useParent } from "@/context/ParentContext";
import toast from "react-hot-toast";
import { downloadFile } from "@/lib/fileDownload";
import FileUploadModal from "@/components/common/FileUploadModal";

interface DocumentRecord {
  id: string;
  title: string;
  category: "Report Cards" | "Receipts" | "Certificates" | "School Documents";
  date: string;
  fileType: string;
  size: string;
  iconType: "report" | "receipt" | "certificate" | "calendar" | "health" | "idcard";
  downloadUrl?: string;
  verifiedBy?: string;
  checksum?: string;
}

export default function DocumentVaultPage() {
  const { selectedChild } = useParent();
  const [activeCategory, setActiveCategory] = useState("All Documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "size">("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocDetails, setSelectedDocDetails] = useState<DocumentRecord | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const child = selectedChild || {
    _id: "c-01",
    firstName: "Aarav",
    lastName: "Sharma",
    grade: "LKG",
    section: "Section A",
    rollNumber: "14",
    studentPhoto: "/aarav-hero-student.jpg",
  };

  // 8 Exact Documents matching screenshot categories & counts
  const allDocuments: DocumentRecord[] = [
    {
      id: "doc-1",
      title: `Official Term 1 Academic Progress Report Card – ${child.firstName}`,
      category: "Report Cards",
      date: "15 Sep 2026",
      fileType: "PDF Document",
      size: "1.8 MB",
      iconType: "report",
      verifiedBy: "Controller of Examinations & Principal",
      checksum: "SHA-256: 8a7b9c1d...4e2f",
    },
    {
      id: "doc-2",
      title: "Fee Payment Receipt #GGPS-RCP-902811",
      category: "Receipts",
      date: "28 Jun 2026",
      fileType: "PDF Document",
      size: "420 KB",
      iconType: "receipt",
      verifiedBy: "Bursar & Accounts Office",
      checksum: "SHA-256: 5f1a3b8c...9e7d",
    },
    {
      id: "doc-3",
      title: "Kindergarten Star Performer Award Certificate",
      category: "Certificates",
      date: "10 Aug 2026",
      fileType: "PDF Document",
      size: "2.4 MB",
      iconType: "certificate",
      verifiedBy: "Head of Early Years Education",
      checksum: "SHA-256: 1c4e7a2b...6d9f",
    },
    {
      id: "doc-4",
      title: "School Academic Calendar & Holiday Schedule 2025–26",
      category: "School Documents",
      date: "01 Jun 2026",
      fileType: "PDF Document",
      size: "3.1 MB",
      iconType: "calendar",
      verifiedBy: "Administration Directorate",
      checksum: "SHA-256: 9f8e7d6c...5b4a",
    },
    {
      id: "doc-5",
      title: "Student Health, Immunization & Pediatric Declaration",
      category: "School Documents",
      date: "04 May 2026",
      fileType: "PDF Document",
      size: "890 KB",
      iconType: "health",
      verifiedBy: "Chief Medical Officer (Campus Health)",
      checksum: "SHA-256: 3b2a1c4d...8e9f",
    },
    {
      id: "doc-6",
      title: "Campus Gate Pass & Student Security ID Card",
      category: "School Documents",
      date: "22 Jun 2026",
      fileType: "PDF Document",
      size: "650 KB",
      iconType: "idcard",
      verifiedBy: "Campus Safety & Security Office",
      checksum: "SHA-256: 7d6c5b4a...1e2f",
    },
    {
      id: "doc-7",
      title: "Inter-School Arts & Rhymes Merit Certificate",
      category: "Certificates",
      date: "22 Jul 2026",
      fileType: "PDF Document",
      size: "1.9 MB",
      iconType: "certificate",
      verifiedBy: "Youth Arts Festival Jury",
      checksum: "SHA-256: 4e2f1a3b...8c9d",
    },
    {
      id: "doc-8",
      title: "Annual Sports Meet Junior Relay Participation Certificate",
      category: "Certificates",
      date: "18 Feb 2026",
      fileType: "PDF Document",
      size: "2.1 MB",
      iconType: "certificate",
      verifiedBy: "Director of Physical Education",
      checksum: "SHA-256: 6d9f8e7d...5a4c",
    },
  ];

  // Category counts matching reference screenshot exactly:
  // All Documents (8) • Report Cards (2) • Receipts (2) • Certificates (3) • School Documents (1)
  const categoryTabs = [
    { label: "All Documents", count: 8, icon: FileText },
    { label: "Report Cards", count: 2, icon: FileText },
    { label: "Receipts", count: 2, icon: Receipt },
    { label: "Certificates", count: 3, icon: Award },
    { label: "School Documents", count: 1, icon: School },
  ];

  // Filter & Search Logic
  const filteredDocuments = useMemo(() => {
    let result = [...allDocuments];

    if (activeCategory !== "All Documents") {
      result = result.filter((d) => d.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.date.toLowerCase().includes(q)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "size") {
      result.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
    }

    return result;
  }, [allDocuments, activeCategory, searchQuery, sortBy]);

  const handleDownload = async (doc: DocumentRecord) => {
    if (doc.category === "Report Cards") {
      setIsReportModalOpen(true);
      return;
    }
    if (doc.iconType === "idcard" || doc.id === "doc-6") {
      setIsIdCardModalOpen(true);
      return;
    }
    if (doc.category === "Receipts" || doc.id === "doc-2") {
      await downloadFile('/api/v1/finance/payments/latest/receipt-pdf', 'GGPS-Fee-Receipt-902811.pdf');
      return;
    }
    const safeTitle = doc.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    await downloadFile(`/api/v1/reports/export/students?format=pdf`, `${safeTitle}.pdf`);
  };

  const handleViewDetails = (doc: DocumentRecord) => {
    if (doc.category === "Report Cards") {
      setIsReportModalOpen(true);
    } else if (doc.iconType === "idcard" || doc.id === "doc-6") {
      setIsIdCardModalOpen(true);
    } else {
      setSelectedDocDetails(doc);
    }
  };

  // Color config for each card icon & category badge matching the screenshot
  const getCardTheme = (iconType: string) => {
    switch (iconType) {
      case "report":
        return {
          iconBg: "bg-[#EAF2FF] dark:bg-[#0050CB]/20",
          iconColor: "text-[#0050CB] dark:text-[#38BDF8]",
          badgeBg: "bg-[#E5EEFF] dark:bg-[#0050CB]/25",
          badgeColor: "text-[#0050CB] dark:text-[#60A5FA]",
          badgeLabel: "REPORT CARDS",
        };
      case "receipt":
        return {
          iconBg: "bg-[#E8FAF0] dark:bg-emerald-950/40",
          iconColor: "text-[#10B981] dark:text-emerald-400",
          badgeBg: "bg-[#E3F9ED] dark:bg-emerald-950/50",
          badgeColor: "text-[#10B981] dark:text-emerald-400",
          badgeLabel: "RECEIPTS",
        };
      case "certificate":
        return {
          iconBg: "bg-[#F2EDFD] dark:bg-purple-950/40",
          iconColor: "text-[#8B5CF6] dark:text-purple-400",
          badgeBg: "bg-[#F1ECFD] dark:bg-purple-950/50",
          badgeColor: "text-[#8B5CF6] dark:text-purple-300",
          badgeLabel: "CERTIFICATES",
        };
      case "calendar":
        return {
          iconBg: "bg-[#FFF2E7] dark:bg-orange-950/40",
          iconColor: "text-[#F97316] dark:text-orange-400",
          badgeBg: "bg-[#FFF0E2] dark:bg-orange-950/50",
          badgeColor: "text-[#F97316] dark:text-orange-300",
          badgeLabel: "SCHOOL DOCUMENTS",
        };
      case "health":
        return {
          iconBg: "bg-[#E2F7F8] dark:bg-cyan-950/40",
          iconColor: "text-[#0284C7] dark:text-cyan-400",
          badgeBg: "bg-[#E2F7F8] dark:bg-cyan-950/50",
          badgeColor: "text-[#0284C7] dark:text-cyan-300",
          badgeLabel: "SCHOOL DOCUMENTS",
        };
      case "idcard":
      default:
        return {
          iconBg: "bg-[#FDEBF1] dark:bg-rose-950/40",
          iconColor: "text-[#E11D48] dark:text-rose-400",
          badgeBg: "bg-[#FDEBF1] dark:bg-rose-950/50",
          badgeColor: "text-[#E11D48] dark:text-rose-300",
          badgeLabel: "SCHOOL DOCUMENTS",
        };
    }
  };

  // Specific Icon Component per document
  const renderDocumentIcon = (iconType: string) => {
    switch (iconType) {
      case "report":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        );
      case "receipt":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="16" x2="12" y2="16" />
          </svg>
        );
      case "certificate":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        );
      case "calendar":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <circle cx="8" cy="14" r="1" fill="currentColor" />
            <circle cx="12" cy="14" r="1" fill="currentColor" />
            <circle cx="16" cy="14" r="1" fill="currentColor" />
            <circle cx="8" cy="18" r="1" fill="currentColor" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
          </svg>
        );
      case "health":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        );
      case "idcard":
      default:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <circle cx="9" cy="10" r="2.5" />
            <line x1="15" y1="9" x2="19" y2="9" />
            <line x1="15" y1="13" x2="19" y2="13" />
            <path d="M5 17c0-2 2-3 4-3s4 1 4 3" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-5 pb-16 font-sans">
      {/* ========================================================
          1. TOP MINI HEADER BAR (Exact to Reference Screenshot)
      ======================================================== */}
      <div className="flex items-center justify-between py-1 px-1">
        {/* Left: Secure Vault | Family Document Repository */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#000E28] dark:bg-white/10 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <span className="text-[15px] sm:text-base font-black text-[#000E28] dark:text-white tracking-tight">
              Secure Vault
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 font-light select-none">|</span>

          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Family Document Repository
          </span>
        </div>

        {/* Right: Notification Bell + Student Avatar Pill */}
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => toast("You have 8 active verified documents in this repository.")}
            className="relative p-2 rounded-xl text-slate-500 hover:text-[#0050CB] hover:bg-white dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0B1020]" />
          </button>

          <div className="flex items-center gap-2.5 pl-1.5 py-1 pr-3 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-[#0050CB] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
              AS
            </div>
            <span className="text-xs font-bold text-[#000E28] dark:text-white">
              {child.firstName} {child.lastName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* ========================================================
          2. HERO VAULT BANNER (Exact to Reference Screenshot)
      ======================================================== */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#EBF3FF] via-[#F1F6FF] to-[#E3EEFF] dark:from-[#091D42] dark:via-[#071633] dark:to-[#081836] border border-blue-200/70 dark:border-white/10 p-6 sm:p-7 shadow-[0_10px_35px_rgba(0,80,203,0.04)]">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-sky-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Block: Big Blue Document Icon & Titles */}
          <div className="flex items-start gap-5 min-w-0">
            {/* Big Rounded Soft-Blue Icon Box with White Folded Document */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] bg-gradient-to-b from-[#DCEAFF] to-[#CDE2FF] dark:from-blue-900/40 dark:to-blue-950/60 border border-white/80 dark:border-white/10 shadow-[0_8px_20px_rgba(0,80,203,0.08)] flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#0050CB] dark:text-[#38BDF8]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                <path d="M14 2v6h6" fill="#A5C9FF" />
                <rect x="8" y="12" width="8" height="2" rx="1" fill="white" />
                <rect x="8" y="16" width="5" height="2" rx="1" fill="white" />
              </svg>
            </div>

            <div className="space-y-1 min-w-0">
              {/* Badge: SECURE FAMILY ARCHIVE */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#D8E8FF] dark:bg-[#0050CB]/30 border border-[#BED7FF] dark:border-[#0050CB]/40 text-[#0050CB] dark:text-[#60A5FA] text-[10px] font-black uppercase tracking-wider">
                SECURE FAMILY ARCHIVE
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-[25px] font-black text-[#000E28] dark:text-white tracking-tight leading-tight">
                Official Documents Vault: {child.firstName} {child.lastName}
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-2xl pt-0.5">
                Access and manage your important documents — report cards, receipts, certificates, health records and more — all in one secure place.
              </p>
            </div>
          </div>

          {/* Right Block: Digitally Signed Badge + 3D Shield/Documents Graphic */}
          <div className="flex flex-col items-end justify-between shrink-0 h-full gap-4">
            {/* Top Right Pill: Digitally Signed & Validated */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#000E28]/80 backdrop-blur-md border border-emerald-200/90 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                ✓
              </div>
              <span>Digitally Signed &amp; Validated</span>
            </div>

            {/* 3D Isometric Illustration Artwork on Right */}
            <div className="hidden lg:flex items-center justify-center relative w-48 h-20 pr-4 select-none pointer-events-none">
              {/* Floating Spheres */}
              <div className="absolute top-2 left-6 w-5 h-5 rounded-full bg-gradient-to-tr from-[#93C5FD] to-white shadow-md opacity-90 animate-pulse" />
              <div className="absolute -bottom-1 left-20 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#2563EB] shadow-xs" />

              {/* Back Card Document */}
              <div className="absolute top-0 right-10 w-24 h-24 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white dark:border-white/20 shadow-md rotate-12 flex flex-col p-2.5 space-y-1.5 opacity-80">
                <div className="w-8 h-1.5 rounded-full bg-blue-300 dark:bg-blue-400/50" />
                <div className="w-14 h-1.5 rounded-full bg-slate-200 dark:bg-white/20" />
                <div className="w-10 h-1.5 rounded-full bg-slate-200 dark:bg-white/20" />
              </div>

              {/* Front Main Document */}
              <div className="relative z-10 w-24 h-24 rounded-2xl bg-white/95 dark:bg-[#0D2554] backdrop-blur-md border border-blue-200 dark:border-blue-400/30 shadow-xl flex flex-col p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-4 h-4 rounded-md bg-[#0050CB] text-white flex items-center justify-center text-[9px] font-black">
                    ✓
                  </div>
                  <div className="w-7 h-1 rounded-full bg-blue-200" />
                </div>
                <div className="w-14 h-1.5 rounded-full bg-slate-200 dark:bg-white/20 mt-1" />
                <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-white/20" />
                <div className="w-10 h-1.5 rounded-full bg-blue-300 dark:bg-blue-400/50" />

                {/* 3D Glowing Shield Badge */}
                <div className="absolute -bottom-2 -right-3 w-9 h-9 rounded-xl bg-gradient-to-br from-[#0050CB] to-[#2563EB] text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-[#07142F]">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. HORIZONTAL TOOLBAR: TABS + SEARCH + FILTER + ADD
      ======================================================== */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
        {/* Category Tabs with Exact Count Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.label;

            return (
              <button
                key={tab.label}
                onClick={() => setActiveCategory(tab.label)}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#0050CB] text-white shadow-sm shadow-[#0050CB]/25 scale-[1.01]"
                    : "bg-white/80 dark:bg-[#07142F]/80 text-slate-600 dark:text-slate-300 hover:text-[#0050CB] dark:hover:text-blue-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-colors ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Filter & Add Document Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#07142F] border border-slate-200/90 dark:border-white/10 rounded-xl text-xs font-medium text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0050CB]/30 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#07142F] border border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#07142F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-30 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                  Sort Documents
                </span>
                <button
                  onClick={() => { setSortBy("newest"); setIsFilterOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${sortBy === "newest" ? "bg-[#E5EEFF] text-[#0050CB] font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  <span>Newest First</span>
                  {sortBy === "newest" && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setSortBy("name"); setIsFilterOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${sortBy === "name" ? "bg-[#E5EEFF] text-[#0050CB] font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  <span>Name (A – Z)</span>
                  {sortBy === "name" && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setSortBy("size"); setIsFilterOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${sortBy === "size" ? "bg-[#E5EEFF] text-[#0050CB] font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  <span>File Size (Largest)</span>
                  {sortBy === "size" && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* + Add Document Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-[#0050CB]/25 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          4. 2-COLUMN DOCUMENT CARDS GRID (Exact to Screenshot)
      ======================================================== */}
      {filteredDocuments.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#07142F] rounded-[24px] border border-slate-200/80 dark:border-white/10 p-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#000E28] dark:text-white">
            No documents found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No verified records matched your selected category or query &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            onClick={() => { setActiveCategory("All Documents"); setSearchQuery(""); }}
            className="px-4 py-2 rounded-xl bg-[#0050CB] text-white text-xs font-bold mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filteredDocuments.map((doc) => {
            const theme = getCardTheme(doc.iconType);

            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-[#07142F] rounded-[22px] border border-slate-200/80 dark:border-white/10 p-5 sm:p-5.5 shadow-[0_4px_20px_rgba(0,14,40,0.02)] hover:shadow-[0_10px_28px_rgba(0,80,203,0.08)] hover:border-blue-200 dark:hover:border-blue-900/60 transition-all duration-200 flex flex-col justify-between group relative"
              >
                {/* Upper Content Area */}
                <div className="flex items-start justify-between gap-3.5">
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Rounded Colored Icon Box */}
                    <div
                      className={`w-12 h-12 rounded-[18px] ${theme.iconBg} ${theme.iconColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200`}
                    >
                      {renderDocumentIcon(doc.iconType)}
                    </div>

                    {/* Metadata & Title */}
                    <div className="space-y-1.5 min-w-0">
                      {/* Category Badge + Calendar Date */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeColor}`}
                        >
                          {theme.badgeLabel}
                        </span>

                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{doc.date}</span>
                        </span>
                      </div>

                      {/* Main Title */}
                      <h2 
                        onClick={() => handleViewDetails(doc)}
                        className="text-sm sm:text-[15px] font-bold text-[#000E28] dark:text-white leading-snug line-clamp-2 hover:text-[#0050CB] dark:hover:text-[#38BDF8] cursor-pointer transition-colors"
                      >
                        {doc.title}
                      </h2>

                      {/* Red PDF File Icon + File Info */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-[4px] bg-[#E11D48] text-white font-black text-[8px] tracking-tight shrink-0 shadow-2xs">
                          PDF
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400">
                          {doc.fileType} • {doc.size}
                        </span>
                      </div>

                      {/* View Details Clickable Action */}
                      <div className="pt-2">
                        <button
                          onClick={() => handleViewDetails(doc)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline cursor-pointer group-hover:translate-x-0.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: 3-Dots Menu (Top) & Circular Download Button (Bottom) */}
                  <div className="flex flex-col items-end justify-between self-stretch shrink-0 pl-1">
                    {/* 3-Dots More Options */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === doc.id ? null : doc.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Document options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === doc.id && (
                        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#07142F] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-20 text-xs space-y-1">
                          <button
                            onClick={() => { handleViewDetails(doc); setActiveMenuId(null); }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#0050CB]" /> View Details
                          </button>
                          <button
                            onClick={() => { handleDownload(doc); setActiveMenuId(null); }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-600" /> Download PDF
                          </button>
                          <button
                            onClick={() => { toast.success(`Sent print request for "${doc.title}"`); setActiveMenuId(null); }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" /> Print Record
                          </button>
                          <button
                            onClick={() => { 
                              navigator.clipboard?.writeText(window.location.href);
                              toast.success("Secure document verification link copied!");
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2"
                          >
                            <Share2 className="w-3.5 h-3.5 text-blue-500" /> Share Secure Link
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Circular Light-Blue Download Button */}
                    <button
                      onClick={() => handleDownload(doc)}
                      className="w-9 h-9 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 hover:bg-[#0050CB] text-[#0050CB] dark:text-[#38BDF8] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs group/btn cursor-pointer"
                      title="Download PDF Document"
                    >
                      <Download className="w-4 h-4 transition-transform group-hover/btn:translate-y-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          5. BOTTOM SECURITY FOOTER CARD (Exact to Screenshot)
      ======================================================== */}
      <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#EAF2FF] via-[#F2F7FF] to-[#E3EEFF] dark:from-[#081838] dark:via-[#091F47] dark:to-[#071633] border border-blue-200/60 dark:border-white/10 p-4 sm:p-5 shadow-xs flex items-center justify-between mt-6">
        {/* Subtle Decorative Wave Curve in bottom-right */}
        <div className="absolute right-0 top-0 bottom-0 w-72 pointer-events-none opacity-40">
          <svg viewBox="0 0 300 100" fill="none" className="w-full h-full preserve-3d">
            <path d="M0,100 C100,20 200,80 300,10 L300,100 Z" fill="#93C5FD" fillOpacity="0.4" />
            <path d="M50,100 C150,40 220,90 300,30 L300,100 Z" fill="#3B82F6" fillOpacity="0.25" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#0050CB]" />
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#000E28] dark:text-white">
              Your documents are safe &amp; secure
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Encrypted storage &bull; Verified documents &bull; Accessible anytime
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          6. INTERACTIVE DOCUMENT DETAILS MODAL
      ======================================================== */}
      {selectedDocDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedDocDetails(null)}
            className="fixed inset-0 bg-[#000E28]/60 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-[#07142F] rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#0050CB] tracking-wider">
                    {selectedDocDetails.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#000E28] dark:text-white">
                    Document Specification
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedDocDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Details Body */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Document Title</span>
                <p className="font-bold text-[#000E28] dark:text-white text-sm mt-0.5">
                  {selectedDocDetails.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Issue Date</span>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                    {selectedDocDetails.date}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">File Type &amp; Size</span>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                    {selectedDocDetails.fileType} ({selectedDocDetails.size})
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Issuing Authority</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  {selectedDocDetails.verifiedBy || "Global Genesis School of Progress Registrar"}
                </p>
                <p className="font-mono text-[10px] text-slate-400 pt-1">
                  Cryptographic Signature: {selectedDocDetails.checksum}
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="text-[11px] font-medium">
                  Verified authentic copy signed by the institution under National Education Registry standards.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedDocDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => { handleDownload(selectedDocDetails); setSelectedDocDetails(null); }}
                className="px-4 py-2 rounded-xl bg-[#0050CB] text-white text-xs font-bold hover:bg-[#0041A8] flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Certified PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        category="students"
        entityType="Student"
        entityId={child._id}
        onUploadComplete={() => {
          toast.success("Document uploaded and forwarded to School Registrar for digital verification.");
          setIsUploadModalOpen(false);
        }}
      />

      {/* Official Interactive Report Card Modal */}
      <ReportCardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        child={child as any}
      />

      {/* Official Interactive ID Card Modal */}
      <IdCardParentModal
        isOpen={isIdCardModalOpen}
        onClose={() => setIsIdCardModalOpen(false)}
        child={child as any}
      />
    </div>
  );
}
