"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Settings,
  Calendar,
  Users,
  CreditCard,
  Building,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
  BarChart3,
  Layers,
  ChevronRight,
  TrendingUp,
  Inbox,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import FeatureBreadcrumb from "@/components/FeatureBreadcrumb";

export default function IntelligentOperationsPage() {
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      num: "01",
      title: "Inquiry & Digital Application",
      description: "Parents submit digital forms online; documents are auto-categorized and assigned an admission tracker ID.",
      badge: "Automation Active",
    },
    {
      num: "02",
      title: "Document Verification",
      description: "Administrative staff validates birth certificates, transfer certificates, and immunization records with zero paper filing.",
      badge: "Instant Audit",
    },
    {
      num: "03",
      title: "One-Click Fee Clearance",
      description: "Automated payment gateway reconciliation generates instant fee tokens, tax-compliant invoices, and receipts.",
      badge: "Auto-Reconciled",
    },
    {
      num: "04",
      title: "Timetable & Roll Allocation",
      description: "AI scheduler assigns class sections, roll numbers, desk allocation, and teacher-subject matrix with zero clashes.",
      badge: "Zero Clashes",
    },
    {
      num: "05",
      title: "Instant Portal Onboarding",
      description: "Automated credentials sent to parents and teachers with pre-configured role-based security rules.",
      badge: "Instant Sync",
    },
  ];

  const operationalModules = [
    {
      icon: Calendar,
      title: "Smart Class Scheduling",
      description:
        "AI timetable engine prevents room clashes, manages teacher substitutions in seconds, and optimizes laboratory & athletic ground availability.",
      tag: "AI Powered",
    },
    {
      icon: Users,
      title: "Admissions Workflow Automation",
      description:
        "Track prospective students from initial web enquiry to fee clearance. Automated stage-gating keeps parents and admissions coordinators aligned.",
      tag: "Zero Paperwork",
    },
    {
      icon: Layers,
      title: "Staff & Workload Management",
      description:
        "Automated biometric attendance tracking, leave approval workflows, substitution management, and teacher class-load optimization.",
      tag: "HR Automation",
    },
    {
      icon: CreditCard,
      title: "Automated Payroll Management",
      description:
        "Transparent salary calculations, automated allowances, provident fund deductions, statutory compliance, and digital salary slip distribution.",
      tag: "100% Accuracy",
    },
    {
      icon: Building,
      title: "Facility & Asset Management",
      description:
        "Track school lab instruments, library books, classroom smart-boards, sports supplies, and automated preventive maintenance tickets.",
      tag: "Asset Tracking",
    },
    {
      icon: FileText,
      title: "Digital Document Management",
      description:
        "Centralized encrypted repository for student dossiers, transfer certificates, report cards, and administrative compliance records.",
      tag: "256-Bit Vault",
    },
    {
      icon: FileCheck,
      title: "Multi-Level Approval Workflows",
      description:
        "Pre-defined approval chains for budget requisition, leave applications, school excursion permits, and facility bookings.",
      tag: "Audit Compliant",
    },
    {
      icon: BarChart3,
      title: "Operations Dashboard & Reports",
      description:
        "Executive oversight with live metrics on daily attendance rates, fee collection velocity, inventory turnover, and staff efficiency.",
      tag: "Real-Time BI",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#000a1f] pt-28 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <FeatureBreadcrumb currentPage="Intelligent Operations" />

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-20">
          
          {/* Left Hero Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Settings className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Smart Operations & ERP Automation</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000E28] dark:text-white tracking-tight leading-tight">
              Intelligent Operations for Modern School Leadership
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Automate class scheduling, admissions workflows, facility management, and staff payroll with zero paperwork. Empower your administrative team to spend less time on manual data entry and more time nurturing educational excellence.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-2xl bg-[#0050CB] hover:bg-[#003da8] text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,80,203,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span>Explore GGPS School ERP</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/admissions"
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-[#001438] border border-slate-200 dark:border-slate-800 text-[#000E28] dark:text-white hover:border-[#0050CB] font-bold text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <span>Start Admission Enquiry</span>
              </Link>
            </div>

            {/* Fast Stats Row */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-slate-800">
              <div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">85%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Less Paperwork</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#0050CB] dark:text-[#38BDF8]">0 Clashes</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">AI Timetables</p>
              </div>
              <div>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">100%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Audit Compliant</p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-gradient-to-tr from-emerald-100/80 via-white to-teal-50 dark:from-[#00153a] dark:to-[#002660] rounded-[36px] p-6 sm:p-8 border border-emerald-200/80 dark:border-emerald-800/40 shadow-xl overflow-hidden">
              
              {/* Decorative Corner Shape */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-[40px] pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                      OP
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#000E28] dark:text-white">Campus Ops Hub</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Live System Status: Normal</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Simulated Admin Metric Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-white dark:bg-[#00102E] border border-slate-100 dark:border-slate-800 shadow-xs">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Admissions Queue</p>
                    <p className="text-xl font-black text-[#000E28] dark:text-white mt-0.5">142</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">98% Verified</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-[#00102E] border border-slate-100 dark:border-slate-800 shadow-xs">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Staff Payroll</p>
                    <p className="text-xl font-black text-[#000E28] dark:text-white mt-0.5">Disbursed</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">100% on schedule</p>
                  </div>
                </div>

                {/* Operations Image Banner */}
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                  <AppImage
                    src="/hero-girl-student.png"
                    alt="Intelligent Operations Student"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <p className="text-white text-xs font-bold">Paperless Administration for GGPS School</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* WORKFLOW VISUALIZATION SECTION */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Automated Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight mt-1">
              End-to-End Operational Workflow
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Every phase from parent inquiry to class scheduling runs through an automated, audit-friendly digital pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowSteps.map((step, sIdx) => {
              const isActive = activeStep === sIdx;
              return (
                <div
                  key={sIdx}
                  onClick={() => setActiveStep(sIdx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-[#001438] border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                      : "bg-white/70 dark:bg-[#00102E]/70 border-slate-200 dark:border-slate-800 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{step.num}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#000E28] dark:text-white leading-snug mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* OPERATIONS MODULES GRID */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-[#0050CB] dark:text-[#38BDF8] uppercase tracking-wider">
              Comprehensive ERP Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight mt-1">
              8 Core Modules Powering School Operations
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Designed specifically for the administrative rigor and governance needs of GGPS School.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {operationalModules.map((mod, mIdx) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mIdx}
                  className="bg-white dark:bg-[#001233] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {mod.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#000E28] dark:text-white leading-snug mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {mod.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* INTERACTIVE OPERATIONS DASHBOARD MOCKUP */}
        <div className="bg-white dark:bg-[#00102E] rounded-[36px] p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-md mb-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live System Simulation</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white tracking-tight mt-1">
                GGPS Operations Control Center
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Academic Year 2026–2027</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            
            {/* Live Timetable & Substitute Engine Preview */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-[#000d24] rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
                  <span className="text-xs font-bold text-[#000E28] dark:text-white">Smart Timetable & Substitute Engine</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { time: "09:00 - 09:45", class: "Grade 4-A", subject: "Mathematics", teacher: "Mrs. Ananya Roy", room: "Room 102", status: "On Schedule" },
                  { time: "09:50 - 10:35", class: "Grade 2-B", subject: "Environmental Science", teacher: "Mr. Rajesh Verma", room: "Lab A", status: "Room Verified" },
                  { time: "10:50 - 11:35", class: "UKG-A", subject: "Phonics & Rhymes", teacher: "Ms. Priya Sharma", room: "Activity Hall", status: "Substitute Assigned" },
                ].map((slot, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-[#001438] rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#000E28] dark:text-white mr-2">{slot.time}</span>
                      <span className="text-[#0050CB] dark:text-[#38BDF8] font-semibold">{slot.class}</span>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{slot.subject} • {slot.teacher} ({slot.room})</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {slot.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Workflow Queue */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-[#000d24] rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-[#000E28] dark:text-white">Pending Approvals</span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                    2 Action Items
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-[#001438] rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-[#000E28] dark:text-white">Annual Sports Day Equipment Requisition</p>
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">Pending Admin</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">Req ID: #REQ-4091 • Athletics Dept</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#001438] rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-[#000E28] dark:text-white">Staff Medical Leave Request (2 days)</p>
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">Pending Principal</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">Auto-substitution ready for UKG-A</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Total automated approvals this month:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">128 processed</span>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM DUAL CTA BANNER */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-[#0050CB] text-white rounded-[32px] p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Transform Your School Operations with GGPS School ERP
            </h3>
            <p className="text-emerald-100 text-sm mt-2">
              Eliminate administrative bottlenecks, eliminate lost paperwork, and experience automated school governance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore GGPS School ERP</span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </Link>
            <Link
              href="/admissions"
              className="px-6 py-3.5 rounded-2xl bg-emerald-800/40 hover:bg-emerald-800/60 border border-white/20 text-white font-bold text-sm transition-all cursor-pointer"
            >
              <span>Start Admission Enquiry</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
