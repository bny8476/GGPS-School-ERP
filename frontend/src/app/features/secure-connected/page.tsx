"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Users,
  Bell,
  MessageSquare,
  Smartphone,
  Mail,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Layers,
  FileText,
  AlertTriangle,
  UserCheck,
  Send,
  Eye,
  Server,
  Database,
  Radio,
} from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import FeatureBreadcrumb from "@/components/FeatureBreadcrumb";

export default function SecureConnectedPage() {
  const [activePipeline, setActivePipeline] = useState<"attendance" | "classwork" | "chat">("attendance");

  const portals = [
    {
      role: "Admin Portal",
      tagline: "Total Governance & Policy",
      color: "border-[#0050CB] text-[#0050CB] bg-blue-50 dark:bg-blue-950/40",
      description: "Complete control over master configurations, staff permissions, fee invoicing, student dossiers, and compliance logs.",
      capabilities: [
        "Granular Role-Based Access Control (RBAC)",
        "Campus-wide emergency alerts & circulars",
        "Financial billing & fee collection tracking",
        "Staff workload & leave authorization",
      ],
    },
    {
      role: "Teacher Portal",
      tagline: "Classroom & Milestone Management",
      color: "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/40",
      description: "Fast daily attendance, digital diary entries, homework publisher, milestone rubric grading, and direct parent messaging.",
      capabilities: [
        "One-tap daily attendance marking",
        "Classwork & study material publisher",
        "Developmental milestone rubric evaluation",
        "Secure two-way parent communication channel",
      ],
    },
    {
      role: "Parent Portal",
      tagline: "Transparency & Peace of Mind",
      color: "border-[#FF690C] text-[#FF690C] bg-orange-50 dark:bg-orange-950/40",
      description: "Instant child attendance alerts, interactive homework tracker, digital fee payments, progress report cards, and teacher messaging.",
      capabilities: [
        "Instant attendance notification within seconds",
        "Daily homework & academic diary feeds",
        "Hassle-free online fee payments & receipts",
        "Direct teacher chats & progress updates",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#000a1f] pt-28 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <FeatureBreadcrumb currentPage="Secure & Connected" />

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-20">
          
          {/* Left Hero Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF690C]" />
              <span>Role-Based Access Control & Instant Sync</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000E28] dark:text-white tracking-tight leading-tight">
              Secure & Connected: Built for Admins, Teachers & Parents
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Role-based access control for Admins, Teachers, and Parents; instant announcements, WhatsApp updates, real-time alerts. Ensure everyone in the GGPS School ecosystem stays informed, aligned, and safely connected.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-2xl bg-[#FF690C] hover:bg-[#e05804] text-white font-bold text-sm shadow-[0_8px_20px_rgba(255,105,12,0.35)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Connected School</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-[#001438] border border-slate-200 dark:border-slate-800 text-[#000E28] dark:text-white hover:border-[#FF690C] font-bold text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <span>Contact School Administration</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-slate-800">
              <div>
                <p className="text-2xl font-black text-[#FF690C]">&lt; 3 Sec</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Alert Delivery</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#0050CB] dark:text-[#38BDF8]">3 Portals</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Strict RBAC</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">256-Bit</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Data Encryption</p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-gradient-to-tr from-amber-100/80 via-white to-orange-50 dark:from-[#2e1202] dark:to-[#00102E] rounded-[36px] p-6 sm:p-8 border border-amber-200/80 dark:border-amber-800/40 shadow-xl overflow-hidden">
              
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF690C]/10 rounded-bl-[40px] pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FF690C] text-white flex items-center justify-center font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#000E28] dark:text-white">Multi-Channel Sync Hub</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Encrypted WebSocket: Connected</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Hero Image */}
                <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                  <AppImage
                    src="/mother-daughter-study.png"
                    alt="Secure & Connected Parent and Student"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-top"
                  />

                  {/* Floating Notification Toast */}
                  <div className="absolute top-3 left-3 bg-white/95 dark:bg-[#000E28]/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800 shadow-md max-w-[240px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white">Attendance Confirmed</p>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Aarav marked Present (08:42 AM)</p>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-[#000E28]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 shadow-md">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0050CB] dark:text-[#38BDF8]">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>WhatsApp Sync Active</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* 3 ROLE-BASED PORTALS (RBAC) */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-[#FF690C] uppercase tracking-wider">
              Tailored User Experiences
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight mt-1">
              Three Dedicated Role Portals
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Every user enters a purpose-built environment governed strictly by role permissions and security policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portals.map((portal, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#001233] rounded-[32px] p-7 border border-slate-200/90 dark:border-slate-800 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-black px-3 py-1 rounded-full border ${portal.color}`}>
                      {portal.role}
                    </span>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-black text-[#000E28] dark:text-white tracking-tight mb-2">
                    {portal.tagline}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal mb-6">
                    {portal.description}
                  </p>

                  <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    {portal.capabilities.map((cap, cIdx) => (
                      <div key={cIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href="/login"
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-[#0050CB] hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Login as {portal.role.split(" ")[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HIERARCHICAL RELATIONSHIP ARCHITECTURE */}
        <div className="bg-white dark:bg-[#00102E] rounded-[36px] p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-md mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-[#0050CB] dark:text-[#38BDF8] uppercase tracking-wider">
              Data & Governance Hierarchy
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight mt-1">
              School Administrative Governance Chain
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Structured role delegation ensures seamless coordination from top-level policy down to parent notifications.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {[
              { title: "ADMIN", desc: "Global policy, system settings, RBAC enforcement, financial oversight, campus calendar", icon: ShieldCheck, color: "bg-blue-600 text-white" },
              { title: "School Management", desc: "Curriculum oversight, teacher substitution approvals, facility allocation, fee collections", icon: Layers, color: "bg-indigo-600 text-white" },
              { title: "Teacher", desc: "Classroom management, daily attendance logging, assignment publishing, continuous rubric evaluation", icon: UserCheck, color: "bg-purple-600 text-white" },
              { title: "Student Records", desc: "Digital cumulative records, milestone progression, attendance rate, health & medical logs", icon: FileText, color: "bg-teal-600 text-white" },
              { title: "Parent", desc: "Direct portal view, daily activity notifications, academic report cards, fee payments", icon: Users, color: "bg-[#FF690C] text-white" },
              { title: "Multi-Channel Communications", desc: "Real-time in-app alerts, WhatsApp digests, SMS emergency broadcasts, and email newsletters", icon: Radio, color: "bg-emerald-600 text-white" },
            ].map((node, nIdx, arr) => (
              <React.Fragment key={nIdx}>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#001438] border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${node.color} flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                    <node.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#000E28] dark:text-white">{node.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{node.desc}</p>
                  </div>
                </div>
                {nIdx < arr.length - 1 && (
                  <div className="flex justify-center -my-1 text-slate-400">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* REAL-TIME EVENT PIPELINES (INTERACTIVE DEMO) */}
        <div className="bg-gradient-to-br from-slate-900 via-[#000E28] to-[#001740] text-white rounded-[36px] p-6 sm:p-10 shadow-xl mb-20">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              Real-Time WebSocket & Push Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              Live Event Dispatch Workflows
            </h2>
            <p className="text-slate-300 text-sm mt-2">
              Select a scenario below to explore how actions in the classroom trigger instantaneous notifications.
            </p>
          </div>

          {/* Scenario Selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <button
              onClick={() => setActivePipeline("attendance")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePipeline === "attendance"
                  ? "bg-[#FF690C] text-white shadow-md"
                  : "bg-white/10 hover:bg-white/20 text-slate-300"
              }`}
            >
              1. Attendance Event Pipeline
            </button>
            <button
              onClick={() => setActivePipeline("classwork")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePipeline === "classwork"
                  ? "bg-[#FF690C] text-white shadow-md"
                  : "bg-white/10 hover:bg-white/20 text-slate-300"
              }`}
            >
              2. Classwork & Diary Pipeline
            </button>
            <button
              onClick={() => setActivePipeline("chat")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePipeline === "chat"
                  ? "bg-[#FF690C] text-white shadow-md"
                  : "bg-white/10 hover:bg-white/20 text-slate-300"
              }`}
            >
              3. Two-Way Parent Chat Loop
            </button>
          </div>

          {/* Pipeline Visualizer Display */}
          <div className="max-w-4xl mx-auto bg-black/40 rounded-2xl p-6 sm:p-8 border border-white/10">
            {activePipeline === "attendance" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>Attendance Event Flow (Delivered in &lt; 2.4 seconds)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
                  {[
                    { step: "Teacher marks attendance", sub: "Via Teacher App" },
                    { step: "Backend API", sub: "Fast POST /api/attendance" },
                    { step: "Database Sync", sub: "Encrypted PostgreSQL" },
                    { step: "Real-Time Event", sub: "Socket & SMS Broker" },
                    { step: "Parent Notification", sub: "Instant In-App / WhatsApp" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col justify-between">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-black font-extrabold text-[10px] mx-auto flex items-center justify-center mb-2">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-white">{item.step}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePipeline === "classwork" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Classwork Publishing Flow</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs font-bold text-white">1. Teacher publishes class work</p>
                    <p className="text-[11px] text-slate-400 mt-1">Attaches worksheet, instructions, and submission due date.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-purple-400 hidden sm:block" />
                    <span className="text-xs text-purple-300 font-bold sm:hidden">→ Cloud Sync →</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs font-bold text-white">2. Parent Portal Live Update</p>
                    <p className="text-[11px] text-slate-400 mt-1">App badge illuminates, homework listed in student digital diary.</p>
                  </div>
                </div>
              </div>
            )}

            {activePipeline === "chat" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4" />
                  <span>Two-Way Direct Communication Loop</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs font-bold text-white">Teacher sends message</p>
                    <p className="text-[10px] text-slate-400 mt-1">E.g., notes on reading milestone</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs font-bold text-white">Parent receives alert</p>
                    <p className="text-[10px] text-slate-400 mt-1">Instant push notification</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs font-bold text-white">Parent replies in portal</p>
                    <p className="text-[10px] text-slate-400 mt-1">Answers questions directly</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs font-bold text-white">Teacher receives update</p>
                    <p className="text-[10px] text-slate-400 mt-1">Thread archived in audit logs</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM CTA BANNER */}
        <div className="bg-gradient-to-r from-[#FF690C] via-amber-600 to-[#0050CB] text-white rounded-[32px] p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Experience GGPS School Connected Portals
            </h3>
            <p className="text-amber-100 text-sm mt-2">
              Strengthen school-family partnerships with secure access, transparency, and instant communication.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-2xl bg-white text-[#FF690C] hover:bg-orange-50 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Connected School</span>
              <ArrowRight className="w-4 h-4 text-[#FF690C]" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
