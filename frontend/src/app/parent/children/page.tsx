"use client";

import React, { useState } from "react";
import Image from "next/image";
import AppImage from "@/components/ui/AppImage";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserCheck, BookOpen, Award,
  TrendingUp, CalendarCheck, ChevronRight,
  Plus, X, Check, ShieldCheck, Calendar, Mail, Headphones,
  GraduationCap, Home, BarChart3, CheckCircle2
} from "lucide-react";
import { useParent } from "@/context/ParentContext";
import ParentEmptyChildState from "@/components/parent/ParentEmptyChildState";

export default function MyChildrenPage() {
  const { children, selectChild, selectedChild, isLoadingChildren } = useParent();
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [newAdmissionNumber, setNewAdmissionNumber] = useState("");
  const [newStudentDob, setNewStudentDob] = useState("");
  const [addStatus, setAddStatus] = useState<"idle" | "success" | "error">("idle");

  const handleLinkChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmissionNumber) return;
    setAddStatus("success");
    setTimeout(() => {
      setIsAddChildModalOpen(false);
      setAddStatus("idle");
      setNewAdmissionNumber("");
      setNewStudentDob("");
    }, 1500);
  };

  if (isLoadingChildren) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#0050CB] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading student directory...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return <ParentEmptyChildState />;
  }

  return (
    <div className="space-y-6 pb-14 font-sans">
      {/* ========================================================
          1. TOP ROW: HERO BANNER (LEFT) + YOUR CHILDREN CARD (RIGHT)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Hero Card (~70% width) — Plain full-width image banner */}
        <div className="lg:col-span-8 xl:col-span-8.5 rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(0,80,203,0.06)] border border-blue-100/60 relative min-h-[160px] sm:min-h-[185px]">
          <AppImage
            src="/my-children-exact-banner-hd.png"
            alt="Welcome Back, My Children"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="object-cover object-center"
          />
        </div>

        {/* Right "Your Children" Card (~30% width) */}
        <div className="lg:col-span-4 xl:col-span-3.5 rounded-[24px] bg-white border border-slate-100 shadow-[0_4px_24px_rgba(0,80,203,0.05)] p-4 sm:p-4.5 flex flex-col justify-between relative overflow-hidden">
          {/* Top Decorative Sun */}
          <div className="absolute top-2.5 right-3 text-amber-400 text-lg select-none pointer-events-none">
            ☀️
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100/80 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">+ Your Children</span>
              <span className="w-5 h-5 rounded-full bg-[#0050CB] text-white text-[11px] font-bold flex items-center justify-center">
                {children.length}
              </span>
            </div>
            <Link
              href="/parent/children"
              className="text-xs font-bold text-[#0050CB] hover:underline flex items-center gap-0.5 pr-6"
            >
              <span>View All</span>
              <span className="text-sm">→</span>
            </Link>
          </div>

          {/* Children List */}
          <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
            {children.map((c) => {
              const isSelected = (selectedChild?._id || children[0]?._id) === c._id;
              const photo = c.studentPhoto || (c.firstName === "Ananya" ? "/ananya-student.jpg" : "/aarav-hero-student.jpg");
              return (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => selectChild(c._id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left ${
                    isSelected
                      ? "bg-blue-50/80 border border-blue-200/60"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-100 dark:ring-blue-900/50">
                      <AppImage
                        src={photo}
                        alt={c.firstName}
                        fill
                        sizes="36px"
                        fallbackType="avatar"
                        name={`${c.firstName} ${c.lastName || ""}`}
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#000E28] flex items-center gap-1.5 truncate">
                        <span>{c.firstName} {c.lastName}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] shrink-0" />}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">
                        {c.grade} - {c.section}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          2. SECTION TITLE: MY CHILDREN
      ======================================================== */}
      <div className="flex items-center gap-3 pt-1">
        <div className="w-9 h-9 rounded-xl bg-[#E5EEFF] flex items-center justify-center text-[#0050CB] shrink-0">
          <Users className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#000E28] tracking-tight">My Children</h2>
          <p className="text-xs text-slate-400 font-normal">
            Switch between your children and view their complete academic profile.
          </p>
        </div>
      </div>

      {/* ========================================================
          3. TWO SIDE-BY-SIDE CHILD PROFILE CARDS
          (EXACT MATCH TO REFERENCE WITH PASTEL GRADIENTS & RICH DETAILS)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ================= CARD 1: AARAV SHARMA ================= */}
        <div className="bg-white rounded-[28px] border border-[#DCE7F6] shadow-[0_4px_24px_rgba(0,80,203,0.06)] flex flex-col justify-between group hover:shadow-xl transition-all overflow-hidden p-5 sm:p-6">
          
          <div>
            {/* Top Profile Header: Real Dynamic Content */}
            <div className="relative w-full rounded-[22px] p-3.5 sm:p-4 mb-4 overflow-hidden bg-gradient-to-r from-[#EBF5FF] via-[#F4F9FF] to-[#E3F0FF] dark:from-[#0B1A3A] dark:via-[#091530] dark:to-[#0D2452] border border-blue-200/80 dark:border-white/10 shadow-xs flex items-center justify-between min-h-[92px] sm:min-h-[104px]">
              {/* Left: Avatar + Details */}
              <div className="relative z-10 flex items-center gap-3 sm:gap-3.5 min-w-0">
                {/* Circular Avatar */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border-2 sm:border-3 border-white dark:border-[#000E28] shadow-md ring-3 ring-blue-200/80 dark:ring-blue-500/30 bg-blue-100">
                  <AppImage
                    src={children[0]?.studentPhoto || "/aarav-hero-student.jpg"}
                    alt={children[0]?.firstName || "Student"}
                    fill
                    sizes="64px"
                    fallbackType="avatar"
                    name={`${children[0]?.firstName || ""} ${children[0]?.lastName || ""}`}
                    className="object-cover object-top"
                  />
                  {/* Floating mini star */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 text-white flex items-center justify-center text-[9px] shadow-xs">
                    ⭐
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F9F0] dark:bg-emerald-950/60 border border-emerald-200/70 text-[10px] font-black text-[#059669] dark:text-emerald-400 leading-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <h3 className="text-base sm:text-[17px] font-black text-[#000E28] dark:text-white tracking-tight leading-snug">
                      {children[0]?.firstName} {children[0]?.lastName}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-[#0050CB] fill-[#0050CB] text-white shrink-0" />
                  </div>
                  <p className="text-[11.5px] sm:text-xs font-bold text-[#0050CB] dark:text-blue-300 leading-tight">
                    {children[0]?.grade} - {children[0]?.section} <span className="text-slate-300 dark:text-slate-600 mx-1 font-normal">|</span> <span className="text-slate-500 dark:text-slate-400 font-semibold">{children[0]?.admissionNumber ? `Adm: ${children[0]?.admissionNumber}` : `Roll No. ${children[0]?.rollNumber || "01"}`}</span>
                  </p>
                </div>
              </div>

              {/* Right: Slogan & Decorative Books */}
              <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 shrink-0">
                <div className="text-right hidden xs:block">
                  <p className="text-[11px] sm:text-xs font-bold italic text-[#1A68E5] dark:text-blue-300 leading-tight">
                    Bright Mind
                  </p>
                  <p className="text-[11px] sm:text-xs font-bold italic text-[#1A68E5] dark:text-blue-300 leading-tight flex items-center justify-end gap-0.5">
                    Happy Heart <span className="text-rose-500 not-italic">♡</span>
                  </p>
                </div>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-blue-100/60 shadow-xs shrink-0 hidden sm:block">
                  <AppImage
                    src="/aarav-card-books.jpg"
                    alt="Study Books"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* 3 Info Capsules (Age, Class Teacher, Class Mentor) */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {/* Capsule 1: Age */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#EEF5FE] border border-[#DCE9FA] flex items-center gap-2.5 min-h-[64px]">
                <div className="w-9 h-9 rounded-full bg-[#D4E6FC] text-[#1A68E5] flex items-center justify-center shrink-0 shadow-2xs">
                  <GraduationCap className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#5A6E8C] font-semibold leading-tight">Age</p>
                  <p className="text-xs sm:text-sm font-black text-[#0A225C] leading-snug">5 Years</p>
                </div>
              </div>

              {/* Capsule 2: Class Teacher */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FDF2F7] border border-[#FCE1EC] flex items-center gap-2.5 min-h-[64px]">
                <div className="w-9 h-9 rounded-full bg-[#FCE1EC] text-[#E11D48] flex items-center justify-center shrink-0 shadow-2xs">
                  <UserCheck className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#5A6E8C] font-semibold leading-tight">Class Teacher</p>
                  <p className="text-xs sm:text-sm font-black text-[#0A225C] leading-snug" title="Ms. Anjali Singh">Ms. Anjali</p>
                </div>
              </div>

              {/* Capsule 3: Class Mentor */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#F5F3FF] border border-[#EDE9FE] flex items-center gap-2.5 min-h-[64px]">
                <div className="w-9 h-9 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-2xs">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#5A6E8C] font-semibold leading-tight">Class Mentor</p>
                  <p className="text-xs sm:text-sm font-black text-[#0A225C] leading-snug" title="Ms. Ritu Verma">Ms. Ritu</p>
                </div>
              </div>
            </div>

            {/* 3 Metric Cards Row (Exact Matching Reference Card Design) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5">
              {/* Metric 1: Attendance */}
              <div className="relative overflow-hidden rounded-[22px] p-4 bg-gradient-to-br from-white via-white to-[#EBF3FF]/70 border border-blue-100/90 shadow-[0_4px_16px_rgba(0,80,203,0.05)] hover:shadow-md transition-all duration-300 min-h-[128px] flex flex-col justify-between group">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E1EFFF] to-[#C8E0FF] p-[2px] shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-[#2563EB] to-[#0050CB] flex items-center justify-center shadow-inner">
                      <CalendarCheck className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="relative z-10 mt-2 min-w-0">
                  <div className="text-[22px] sm:text-[24px] font-black text-[#000E28] tracking-tight leading-none font-sans">
                    94%
                  </div>
                  <div className="text-[13px] font-bold text-[#001D4A] tracking-tight leading-tight mt-1 whitespace-nowrap">
                    Attendance
                  </div>
                </div>
                <div className="relative z-10 mt-2 pt-0.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#059669] whitespace-nowrap">
                    ↑ +2.4% this month
                  </span>
                </div>
              </div>

              {/* Metric 2: Homework */}
              <div className="relative overflow-hidden rounded-[22px] p-4 bg-gradient-to-br from-white via-white to-[#FFF7ED]/70 border border-amber-100/90 shadow-[0_4px_16px_rgba(249,115,22,0.05)] hover:shadow-md transition-all duration-300 min-h-[128px] flex flex-col justify-between group">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFEDD5] to-[#FED7AA] p-[2px] shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-[#FB923C] to-[#EA580C] flex items-center justify-center shadow-inner">
                      <Home className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="relative z-10 mt-2 min-w-0">
                  <div className="text-[22px] sm:text-[24px] font-black text-[#EA580C] tracking-tight leading-none font-sans">
                    3
                  </div>
                  <div className="text-[13px] font-bold text-[#001D4A] tracking-tight leading-tight mt-1 whitespace-nowrap">
                    Pending Tasks
                  </div>
                </div>
                <div className="relative z-10 mt-2 pt-0.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#EA580C] whitespace-nowrap">
                    Due soon
                  </span>
                </div>
              </div>

              {/* Metric 3: Overall Progress */}
              <div className="relative overflow-hidden rounded-[22px] p-4 bg-gradient-to-br from-white via-white to-[#F5F3FF]/70 border border-purple-100/90 shadow-[0_4px_16px_rgba(124,58,237,0.05)] hover:shadow-md transition-all duration-300 min-h-[128px] flex flex-col justify-between group">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] p-[2px] shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-inner">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="relative z-10 mt-2 min-w-0">
                  <div className="text-[20px] sm:text-[22px] font-black text-[#7C3AED] tracking-tight leading-none font-sans">
                    Progressing
                  </div>
                  <div className="text-[13px] font-bold text-[#001D4A] tracking-tight leading-tight mt-1 whitespace-nowrap">
                    Overall Progress
                  </div>
                </div>
                <div className="relative z-10 mt-2 pt-0.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#7C3AED] whitespace-nowrap">
                    On track &amp; thriving
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Gradient Button: Royal Blue to Electric Purple */}
          <Link
            href={`/parent/children/${children[0]?._id}`}
            onClick={() => children[0] && selectChild(children[0]._id)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2072F5] via-[#6366F1] to-[#9D4DF6] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all"
          >
            <span>View Full Profile</span>
            <span className="text-base">→</span>
          </Link>
        </div>

        {/* ================= CARD 2: DYNAMIC SECOND CHILD ================= */}
        {children[1] && (
        <div className="bg-white rounded-[28px] border border-[#DCE7F6] shadow-[0_4px_24px_rgba(0,80,203,0.06)] flex flex-col justify-between group hover:shadow-xl transition-all overflow-hidden p-5 sm:p-6">
          
          <div>
            {/* Top Profile Header: Real Dynamic Content */}
            <div className="relative w-full rounded-[22px] p-3.5 sm:p-4 mb-4 overflow-hidden bg-gradient-to-r from-[#FDF2F7] via-[#FEF8FC] to-[#F5F0FF] border border-pink-200/80 shadow-xs flex items-center justify-between min-h-[92px] sm:min-h-[104px]">
              {/* Left: Avatar + Details */}
              <div className="relative z-10 flex items-center gap-3 sm:gap-3.5 min-w-0">
                {/* Circular Avatar */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border-2 sm:border-3 border-white shadow-md ring-3 ring-pink-200/80 bg-pink-100 flex items-center justify-center">
                  <span className="text-3xl">👧</span>
                  {/* Floating mini star */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 text-white flex items-center justify-center text-[9px] shadow-xs">
                    ⭐
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F9F0] border border-emerald-200/70 text-[10px] font-black text-[#059669] leading-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <h3 className="text-base sm:text-[17px] font-black text-[#000E28] dark:text-white tracking-tight leading-snug">
                      {children[1]?.firstName || children[0]?.firstName} {children[1]?.lastName || children[0]?.lastName}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-[#E11D48] fill-[#E11D48] text-white shrink-0" />
                  </div>
                  <p className="text-[11.5px] sm:text-xs font-bold text-[#E11D48] leading-tight">
                    {children[1]?.grade || children[0]?.grade} - {children[1]?.section || children[0]?.section} <span className="text-slate-300 mx-1 font-normal">|</span> <span className="text-slate-500 font-semibold">{(children[1] || children[0])?.admissionNumber ? `Adm: ${(children[1] || children[0])?.admissionNumber}` : `Roll No. ${(children[1] || children[0])?.rollNumber || "02"}`}</span>
                  </p>
                </div>
              </div>

              {/* Right: Slogan & Decorative Art */}
              <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 shrink-0">
                <div className="text-right hidden xs:block">
                  <p className="text-[11px] sm:text-xs font-bold italic text-[#E11D48] leading-tight">
                    Creative Soul
                  </p>
                  <p className="text-[11px] sm:text-xs font-bold italic text-[#E11D48] leading-tight flex items-center justify-end gap-0.5">
                    Star Learner <span className="text-rose-500 not-italic">♡</span>
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 border border-pink-200/60 shadow-xs shrink-0 hidden sm:flex items-center justify-center text-3xl">
                  🎨
                </div>
              </div>
            </div>

            {/* 3 Info Capsules (Age, Class Teacher, Class Mentor) */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {/* Capsule 1: Age */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#EEF5FE] border border-[#DCE9FA] flex items-center gap-2.5 min-h-[64px]">
                <div className="w-9 h-9 rounded-full bg-[#D4E6FC] text-[#1A68E5] flex items-center justify-center shrink-0 shadow-2xs">
                  <GraduationCap className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#5A6E8C] font-semibold leading-tight">Age</p>
                  <p className="text-xs sm:text-sm font-black text-[#0A225C] leading-snug">5 Years</p>
                </div>
              </div>

              {/* Capsule 2: Class Teacher */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FDF2F7] border border-[#FCE1EC] flex items-center gap-2.5 min-h-[64px]">
                <div className="w-9 h-9 rounded-full bg-[#FCE1EC] text-[#E11D48] flex items-center justify-center shrink-0 shadow-2xs">
                  <UserCheck className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#5A6E8C] font-semibold leading-tight">Class Teacher</p>
                  <p className="text-xs sm:text-sm font-black text-[#0A225C] leading-snug" title="Ms. Pooja Sharma">Ms. Pooja</p>
                </div>
              </div>

              {/* Capsule 3: Class Mentor */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#F5F3FF] border border-[#EDE9FE] flex items-center gap-2.5 min-h-[64px]">
                <div className="w-9 h-9 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-2xs">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#5A6E8C] font-semibold leading-tight">Class Mentor</p>
                  <p className="text-xs sm:text-sm font-black text-[#0A225C] leading-snug" title="Ms. Neha Gupta">Ms. Neha</p>
                </div>
              </div>
            </div>

            {/* 3 Metric Cards Row (Exact Matching Reference Card Design) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5">
              {/* Metric 1: Attendance */}
              <div className="relative overflow-hidden rounded-[22px] p-4 bg-gradient-to-br from-white via-white to-[#EBF3FF]/70 border border-blue-100/90 shadow-[0_4px_16px_rgba(0,80,203,0.05)] hover:shadow-md transition-all duration-300 min-h-[128px] flex flex-col justify-between group">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E1EFFF] to-[#C8E0FF] p-[2px] shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-[#2563EB] to-[#0050CB] flex items-center justify-center shadow-inner">
                      <CalendarCheck className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="relative z-10 mt-2 min-w-0">
                  <div className="text-[22px] sm:text-[24px] font-black text-[#000E28] tracking-tight leading-none font-sans">
                    96%
                  </div>
                  <div className="text-[13px] font-bold text-[#001D4A] tracking-tight leading-tight mt-1 whitespace-nowrap">
                    Attendance
                  </div>
                </div>
                <div className="relative z-10 mt-2 pt-0.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#059669] whitespace-nowrap">
                    ↑ +1.8% this month
                  </span>
                </div>
              </div>

              {/* Metric 2: Homework */}
              <div className="relative overflow-hidden rounded-[22px] p-4 bg-gradient-to-br from-white via-white to-[#FFF7ED]/70 border border-amber-100/90 shadow-[0_4px_16px_rgba(249,115,22,0.05)] hover:shadow-md transition-all duration-300 min-h-[128px] flex flex-col justify-between group">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFEDD5] to-[#FED7AA] p-[2px] shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-[#FB923C] to-[#EA580C] flex items-center justify-center shadow-inner">
                      <Home className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="relative z-10 mt-2 min-w-0">
                  <div className="text-[22px] sm:text-[24px] font-black text-[#EA580C] tracking-tight leading-none font-sans">
                    1
                  </div>
                  <div className="text-[13px] font-bold text-[#001D4A] tracking-tight leading-tight mt-1 whitespace-nowrap">
                    Pending Tasks
                  </div>
                </div>
                <div className="relative z-10 mt-2 pt-0.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#EA580C] whitespace-nowrap">
                    Due soon
                  </span>
                </div>
              </div>

              {/* Metric 3: Overall Progress */}
              <div className="relative overflow-hidden rounded-[22px] p-4 bg-gradient-to-br from-white via-white to-[#F5F3FF]/70 border border-purple-100/90 shadow-[0_4px_16px_rgba(124,58,237,0.05)] hover:shadow-md transition-all duration-300 min-h-[128px] flex flex-col justify-between group">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] p-[2px] shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-inner">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="relative z-10 mt-2 min-w-0">
                  <div className="text-[20px] sm:text-[22px] font-black text-[#7C3AED] tracking-tight leading-none font-sans">
                    Progressing
                  </div>
                  <div className="text-[13px] font-bold text-[#001D4A] tracking-tight leading-tight mt-1 whitespace-nowrap">
                    Overall Progress
                  </div>
                </div>
                <div className="relative z-10 mt-2 pt-0.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#7C3AED] whitespace-nowrap">
                    On track &amp; thriving
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Gradient Button: Royal Blue to Electric Purple */}
          <Link
            href={`/parent/children/${children[1]?._id || children[0]?._id}`}
            onClick={() => (children[1] || children[0]) && selectChild((children[1] || children[0])._id)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2072F5] via-[#6366F1] to-[#9D4DF6] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all"
          >
            <span>View Full Profile</span>
            <span className="text-base">→</span>
          </Link>
        </div>
        )}

      </div>

      {/* ========================================================
          4. BOTTOM 4 EXACT COLORFUL NAVIGATION CARDS
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        
        {/* Card 1: Quick View */}
        <Link
          href="/parent/attendance"
          className="relative rounded-[24px] p-4 sm:p-4.5 border border-[#CFE2FE] shadow-[0_4px_20px_rgba(0,80,203,0.06)] hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] flex items-center justify-between min-h-[125px] sm:min-h-[135px] overflow-hidden bg-gradient-to-br from-[#EAF3FF] via-[#F4F8FE] to-[#FFF6E9]"
        >
          <div className="flex items-center gap-3 relative z-10 min-w-0 pr-16 sm:pr-20">
            {/* Round Icon Pill */}
            <div className="w-12 h-12 rounded-full bg-[#CCE3FF] text-[#1A68E5] flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-5 h-5 stroke-[2.4]" />
            </div>
            {/* Texts */}
            <div className="min-w-0">
              <p className="text-sm sm:text-[15px] font-bold text-[#0A225C] tracking-tight group-hover:text-[#1A68E5] transition-colors">
                Quick View
              </p>
              <p className="text-[11px] text-[#5A6E8C] font-semibold leading-snug mt-0.5">
                Attendance, homework, diary &amp; more
              </p>
            </div>
          </div>

          {/* Top Right Blue Arrow */}
          <div className="absolute top-4 right-4 z-10">
            <ChevronRight className="w-4 h-4 text-[#1A68E5] stroke-[2.8] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Corner 3D Illustration */}
          <div className="absolute -bottom-2 -right-1 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none select-none mix-blend-multiply dark:mix-blend-normal opacity-95">
            <AppImage
              src="/decor-quick-view.jpg"
              alt="Quick View Books"
              fill
              sizes="112px"
              className="object-contain object-bottom-right"
            />
          </div>
        </Link>

        {/* Card 2: Family Calendar */}
        <Link
          href="/parent/events"
          className="relative rounded-[24px] p-4 sm:p-4.5 border border-[#FADCC8] shadow-[0_4px_20px_rgba(255,105,12,0.06)] hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] flex items-center justify-between min-h-[125px] sm:min-h-[135px] overflow-hidden bg-gradient-to-br from-[#FFF4EA] via-[#FFF9F5] to-[#FCE7F3]"
        >
          <div className="flex items-center gap-3 relative z-10 min-w-0 pr-16 sm:pr-20">
            {/* Round Icon Pill */}
            <div className="w-12 h-12 rounded-full bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-5 h-5 stroke-[2.4]" />
            </div>
            {/* Texts */}
            <div className="min-w-0">
              <p className="text-sm sm:text-[15px] font-bold text-[#0A225C] tracking-tight group-hover:text-[#EA580C] transition-colors">
                Family Calendar
              </p>
              <p className="text-[11px] text-[#5A6E8C] font-semibold leading-snug mt-0.5">
                Upcoming events &amp; important dates
              </p>
            </div>
          </div>

          {/* Top Right Blue Arrow */}
          <div className="absolute top-4 right-4 z-10">
            <ChevronRight className="w-4 h-4 text-[#1A68E5] stroke-[2.8] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Corner 3D Illustration */}
          <div className="absolute -bottom-2 -right-1 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none select-none mix-blend-multiply dark:mix-blend-normal opacity-95">
            <AppImage
              src="/decor-family-calendar.jpg"
              alt="Family Calendar 3D"
              fill
              sizes="112px"
              className="object-contain object-bottom-right"
            />
          </div>
        </Link>

        {/* Card 3: Messages */}
        <Link
          href="/parent/messages"
          className="relative rounded-[24px] p-4 sm:p-4.5 border border-[#FDE68A] shadow-[0_4px_20px_rgba(245,158,11,0.06)] hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] flex items-center justify-between min-h-[125px] sm:min-h-[135px] overflow-hidden bg-gradient-to-br from-[#FEFCE8] via-[#FFFDF5] to-[#FEF08A]/35"
        >
          <div className="flex items-center gap-3 relative z-10 min-w-0 pr-16 sm:pr-20">
            {/* Round Icon Pill */}
            <div className="w-12 h-12 rounded-full bg-[#FEF08A] text-[#D97706] flex items-center justify-center shrink-0 shadow-xs">
              <Mail className="w-5 h-5 stroke-[2.4]" />
            </div>
            {/* Texts */}
            <div className="min-w-0">
              <p className="text-sm sm:text-[15px] font-bold text-[#0A225C] tracking-tight group-hover:text-[#D97706] transition-colors">
                Messages
              </p>
              <p className="text-[11px] text-[#5A6E8C] font-semibold leading-snug mt-0.5">
                From teachers &amp; school
              </p>
            </div>
          </div>

          {/* Top Right: Red Badge 3 + Blue Arrow */}
          <div className="absolute top-3.5 right-4 z-10 flex flex-col items-end gap-1">
            <span className="w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
              3
            </span>
            <ChevronRight className="w-4 h-4 text-[#1A68E5] stroke-[2.8] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Corner 3D Illustration */}
          <div className="absolute -bottom-2 -right-1 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none select-none mix-blend-multiply dark:mix-blend-normal opacity-95">
            <AppImage
              src="/decor-chat-bubbles.jpg"
              alt="Messages Chat Bubbles"
              fill
              sizes="112px"
              className="object-contain object-bottom-right"
            />
          </div>
        </Link>

        {/* Card 4: Need Help? */}
        <Link
          href="/parent/messages"
          className="relative rounded-[24px] p-4 sm:p-4.5 border border-[#BBF7D0] shadow-[0_4px_20px_rgba(18,183,106,0.06)] hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] flex items-center justify-between min-h-[125px] sm:min-h-[135px] overflow-hidden bg-gradient-to-br from-[#E8FAF0] via-[#F2FAF6] to-[#E0F2FE]"
        >
          <div className="flex items-center gap-3 relative z-10 min-w-0 pr-16 sm:pr-20">
            {/* Round Icon Pill */}
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 shadow-xs">
              <Headphones className="w-5 h-5 stroke-[2.4]" />
            </div>
            {/* Texts */}
            <div className="min-w-0">
              <p className="text-sm sm:text-[15px] font-bold text-[#0A225C] tracking-tight group-hover:text-[#16A34A] transition-colors">
                Need Help?
              </p>
              <p className="text-[11px] text-[#5A6E8C] font-semibold leading-snug mt-0.5">
                Contact your school for any assistance
              </p>
            </div>
          </div>

          {/* Top Right Blue Arrow */}
          <div className="absolute top-4 right-4 z-10">
            <ChevronRight className="w-4 h-4 text-[#1A68E5] stroke-[2.8] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Corner 3D Illustration */}
          <div className="absolute -bottom-2 -right-1 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none select-none mix-blend-multiply dark:mix-blend-normal opacity-95">
            <AppImage
              src="/decor-chat-bubbles.jpg"
              alt="Need Help Support"
              fill
              sizes="112px"
              className="object-contain object-bottom-right"
            />
          </div>
        </Link>

      </div>

      {/* ========================================================
          LINK CHILD MODAL (ENROLLMENT LINKING DIALOG)
      ======================================================== */}
      <AnimatePresence>
        {isAddChildModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0050CB] flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Link Enrolled Child</h3>
                    <p className="text-[11px] text-slate-400">Enter your child&rsquo;s student ID and DOB</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddChildModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {addStatus === "success" ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Child Linked Successfully!</p>
                  <p className="text-xs text-slate-500">Student profile synchronized with your account.</p>
                </div>
              ) : (
                <form onSubmit={handleLinkChild} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student Admission Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GGPS-2026-042"
                      value={newAdmissionNumber}
                      onChange={(e) => setNewAdmissionNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0050CB] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      required
                      value={newStudentDob}
                      onChange={(e) => setNewStudentDob(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0050CB] focus:outline-hidden"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0050CB] shrink-0 mt-0.5" />
                    <span>
                      Parent-child linkage is verified automatically against our registrar records using your registered phone number.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddChildModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                    >
                      Verify &amp; Link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
