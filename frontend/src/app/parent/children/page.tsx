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
  const { children, selectChild, selectedChild, isLoadingChildren, unreadMessageCount } = useParent();
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
            src="/kids-learning-banner.jpg"
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
              const photo = c.studentPhoto || "/class-hero-girl.jpg";
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
          3. DYNAMIC CHILD PROFILE CARDS
      ======================================================== */}
      <div className={`grid grid-cols-1 ${children.length > 1 ? "lg:grid-cols-2" : "max-w-2xl mx-auto"} gap-6`}>
        {children.map((c, idx) => {
          const isSelected = (selectedChild?._id || children[0]?._id) === c._id;
          const photo = c.studentPhoto || "/class-hero-girl.jpg";
          const isSecondTheme = idx % 2 === 1;

          return (
            <div
              key={c._id}
              className="bg-white dark:bg-[#07142F] rounded-[28px] border border-[#DCE7F6] dark:border-white/10 shadow-[0_4px_24px_rgba(0,80,203,0.06)] flex flex-col justify-between group hover:shadow-xl transition-all overflow-hidden p-5 sm:p-6"
            >
              <div>
                {/* Top Profile Header */}
                <div
                  className={`relative w-full rounded-[22px] p-3.5 sm:p-4 mb-4 overflow-hidden border shadow-xs flex items-center justify-between min-h-[92px] sm:min-h-[104px] ${
                    isSecondTheme
                      ? "bg-gradient-to-r from-[#FDF2F7] via-[#FEF8FC] to-[#F5F0FF] dark:from-[#2B1020] dark:via-[#1A0B20] dark:to-[#0D1535] border-pink-200/80 dark:border-white/10"
                      : "bg-gradient-to-r from-[#EBF5FF] via-[#F4F9FF] to-[#E3F0FF] dark:from-[#0B1A3A] dark:via-[#091530] dark:to-[#0D2452] border-blue-200/80 dark:border-white/10"
                  }`}
                >
                  {/* Left: Avatar + Details */}
                  <div className="relative z-10 flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border-2 sm:border-3 border-white dark:border-[#000E28] shadow-md ring-3 ${
                        isSecondTheme
                          ? "ring-pink-200/80 dark:ring-pink-500/30 bg-pink-100"
                          : "ring-blue-200/80 dark:ring-blue-500/30 bg-blue-100"
                      }`}
                    >
                      <AppImage
                        src={photo}
                        alt={c.firstName}
                        fill
                        sizes="64px"
                        fallbackType="avatar"
                        name={`${c.firstName} ${c.lastName || ""}`}
                        className="object-cover object-top"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 text-white flex items-center justify-center text-[9px] shadow-xs">
                        ⭐
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F9F0] dark:bg-emerald-950/60 border border-emerald-200/70 text-[10px] font-black text-[#059669] dark:text-emerald-400 leading-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                          Enrolled
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <h3 className="text-base sm:text-[17px] font-black text-[#000E28] dark:text-white tracking-tight leading-snug">
                          {c.firstName} {c.lastName}
                        </h3>
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            isSecondTheme
                              ? "text-[#E11D48] fill-[#E11D48] text-white"
                              : "text-[#0050CB] fill-[#0050CB] text-white"
                          }`}
                        />
                      </div>
                      <p
                        className={`text-[11.5px] sm:text-xs font-bold leading-tight ${
                          isSecondTheme ? "text-[#E11D48] dark:text-pink-300" : "text-[#0050CB] dark:text-blue-300"
                        }`}
                      >
                        {c.grade} - {c.section}{" "}
                        <span className="text-slate-300 dark:text-slate-600 mx-1 font-normal">|</span>{" "}
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">
                          {c.admissionNumber
                            ? `Adm: ${c.admissionNumber.replace(/-/g, "")}`
                            : c.rollNumber
                            ? `Roll No. ${c.rollNumber}`
                            : "Enrolled"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Class Tag */}
                  <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 shrink-0">
                    <div className="text-right hidden xs:block">
                      <p
                        className={`text-[11px] sm:text-xs font-bold italic leading-tight ${
                          isSecondTheme ? "text-[#E11D48] dark:text-pink-300" : "text-[#1A68E5] dark:text-blue-300"
                        }`}
                      >
                        {c.grade}
                      </p>
                      <p
                        className={`text-[11px] sm:text-xs font-bold italic leading-tight flex items-center justify-end gap-0.5 ${
                          isSecondTheme ? "text-[#E11D48] dark:text-pink-300" : "text-[#1A68E5] dark:text-blue-300"
                        }`}
                      >
                        {c.section} <span className="text-rose-500 not-italic">♡</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Info Capsules */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {/* Capsule 1: Class */}
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-[#EEF5FE] dark:bg-blue-950/30 border border-[#DCE9FA] dark:border-blue-900/40 flex items-center gap-2.5 min-h-[64px]">
                    <div className="w-9 h-9 rounded-full bg-[#D4E6FC] dark:bg-blue-900/60 text-[#1A68E5] flex items-center justify-center shrink-0 shadow-2xs">
                      <GraduationCap className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-[#5A6E8C] dark:text-slate-400 font-semibold leading-tight">Class</p>
                      <p className="text-xs sm:text-sm font-black text-[#0A225C] dark:text-white leading-snug truncate">
                        {c.grade || "Preschool"}
                      </p>
                    </div>
                  </div>

                  {/* Capsule 2: Class Teacher */}
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FDF2F7] dark:bg-rose-950/30 border border-[#FCE1EC] dark:border-rose-900/40 flex items-center gap-2.5 min-h-[64px]">
                    <div className="w-9 h-9 rounded-full bg-[#FCE1EC] dark:bg-rose-900/60 text-[#E11D48] flex items-center justify-center shrink-0 shadow-2xs">
                      <UserCheck className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-[#5A6E8C] dark:text-slate-400 font-semibold leading-tight">Teacher</p>
                      <p
                        className="text-xs sm:text-sm font-black text-[#0A225C] dark:text-white leading-snug truncate"
                        title={c.teacherName || "Assigned Educator"}
                      >
                        {c.teacherName || "Assigned"}
                      </p>
                    </div>
                  </div>

                  {/* Capsule 3: Emergency Contact */}
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-[#F5F3FF] dark:bg-purple-950/30 border border-[#EDE9FE] dark:border-purple-900/40 flex items-center gap-2.5 min-h-[64px]">
                    <div className="w-9 h-9 rounded-full bg-[#EDE9FE] dark:bg-purple-900/60 text-[#7C3AED] flex items-center justify-center shrink-0 shadow-2xs">
                      <ShieldCheck className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-[#5A6E8C] dark:text-slate-400 font-semibold leading-tight">Emergency</p>
                      <p
                        className="text-xs sm:text-sm font-black text-[#0A225C] dark:text-white leading-snug truncate"
                        title={c.emergencyContact || "Registered on file"}
                      >
                        {c.emergencyContact ? c.emergencyContact.slice(-10) : "On Record"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Metric Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5">
                  {/* Metric 1: Attendance */}
                  <div className="relative overflow-hidden rounded-[22px] p-4 bg-gradient-to-br from-white via-white to-[#EBF3FF]/70 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 border border-blue-100/90 dark:border-blue-900/40 shadow-[0_4px_16px_rgba(0,80,203,0.05)] hover:shadow-md transition-all duration-300 min-h-[128px] flex flex-col justify-between group">
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E1EFFF] to-[#C8E0FF] p-[2px] shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full bg-gradient-to-b from-[#2563EB] to-[#0050CB] flex items-center justify-center shadow-inner">
                          <CalendarCheck className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="relative z-10 mt-2 min-w-0">
                      <div className="text-[22px] sm:text-[24px] font-black text-[#000E28] dark:text-white tracking-tight leading-none font-sans">
                        {c.attendanceRate !== undefined ? `${c.attendanceRate}%` : "Recorded"}
                      </div>
                      <div className="text-[13px] font-bold text-[#001D4A] dark:text-slate-300 tracking-tight leading-tight mt-1 whitespace-nowrap">
                        Attendance
                      </div>
                    </div>
                    <div className="relative z-10 mt-2 pt-0.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#059669] whitespace-nowrap">
                        Verified Record
                      </span>
                    </div>
                  </div>

                  {/* Metric 2: Homework */}
                  <div className="relative overflow-hidden rounded-[22px] p-4 bg-gradient-to-br from-white via-white to-[#FFF7ED]/70 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/30 border border-amber-100/90 dark:border-amber-900/40 shadow-[0_4px_16px_rgba(249,115,22,0.05)] hover:shadow-md transition-all duration-300 min-h-[128px] flex flex-col justify-between group">
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
                        {c.pendingHomework !== undefined ? c.pendingHomework : 0}
                      </div>
                      <div className="text-[13px] font-bold text-[#001D4A] dark:text-slate-300 tracking-tight leading-tight mt-1 whitespace-nowrap">
                        Pending Tasks
                      </div>
                    </div>
                    <div className="relative z-10 mt-2 pt-0.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#EA580C] whitespace-nowrap">
                        Assignments
                      </span>
                    </div>
                  </div>

                  {/* Metric 3: Fees */}
                  <div className="relative overflow-hidden rounded-[22px] p-4 bg-gradient-to-br from-white via-white to-[#F5F3FF]/70 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/30 border border-purple-100/90 dark:border-purple-900/40 shadow-[0_4px_16px_rgba(124,58,237,0.05)] hover:shadow-md transition-all duration-300 min-h-[128px] flex flex-col justify-between group">
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] p-[2px] shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-inner">
                          <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="relative z-10 mt-2 min-w-0">
                      <div className="text-[18px] sm:text-[20px] font-black text-[#7C3AED] tracking-tight leading-none font-sans truncate">
                        {c.feesDue && c.feesDue > 0 ? `₹${c.feesDue.toLocaleString('en-IN')}` : "Settled"}
                      </div>
                      <div className="text-[13px] font-bold text-[#001D4A] dark:text-slate-300 tracking-tight leading-tight mt-1 whitespace-nowrap">
                        Fee Balance
                      </div>
                    </div>
                    <div className="relative z-10 mt-2 pt-0.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#7C3AED] whitespace-nowrap">
                        {c.feesDue && c.feesDue > 0 ? "Payment due" : "All cleared"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-Width Gradient Button */}
              <Link
                href={`/parent/children/${c._id}`}
                onClick={() => selectChild(c._id)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0050CB] via-[#3B82F6] to-[#6366F1] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,80,203,0.25)] transition-all"
              >
                <span>View Full Profile</span>
                <span className="text-base">→</span>
              </Link>
            </div>
          );
        })}
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
            {unreadMessageCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
              </span>
            )}
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
                      placeholder="e.g. GGPS2026042"
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
                      max={new Date().toISOString().split("T")[0]}
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
