"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import { useParams } from "next/navigation";
import {
  UserCheck, CalendarHeart, BookOpen, Sparkles, Award, 
  Clock, WalletCards, FileText, ArrowLeft, Download, 
  Phone, ShieldCheck, HeartPulse, CheckCircle2
} from "lucide-react";
import SpotlightCard from "@/components/teacher/SpotlightCard";
import ReportCardModal from "@/components/parent/ReportCardModal";
import { useParent } from "@/context/ParentContext";

export default function ChildProfilePage() {
  const params = useParams();
  const childId = params?.id as string;
  const { children } = useParent();
  const [activeTab, setActiveTab] = useState<
    "overview" | "attendance" | "diary" | "homework" | "progress" | "assessments" | "timetable" | "fees" | "documents"
  >("overview");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const child = children.find((c) => c._id === childId) || children[0];

  const tabs = [
    { id: "overview", label: "Overview", icon: UserCheck },
    { id: "attendance", label: "Attendance", icon: UserCheck },
    { id: "diary", label: "Diary", icon: CalendarHeart },
    { id: "homework", label: "Homework", icon: BookOpen },
    { id: "progress", label: "Progress", icon: Sparkles },
    { id: "assessments", label: "Assessments", icon: Award },
    { id: "timetable", label: "Timetable", icon: Clock },
    { id: "fees", label: "Fees", icon: WalletCards },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Back Link */}
      <Link
        href="/parent/children"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0050CB] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Children
      </Link>

      {/* Child Profile Header */}
      <div className="p-6 sm:p-8 rounded-[24px] bg-white dark:bg-[#07142F] border border-[#E7EAF0] dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-white dark:border-slate-700 shadow-md">
            <AppImage
              src={child.studentPhoto || "/class-hero-girl.jpg"}
              alt={child.firstName}
              fill
              sizes="96px"
              fallbackType="avatar"
              name={`${child.firstName} ${child.lastName}`}
              className="object-cover"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#07142F] dark:text-white">
                {child.firstName} {child.lastName}
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Enrolled
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#3157D5] dark:text-blue-400">
              {child.grade} – {child.section} {child.rollNumber ? `(Roll #${child.rollNumber})` : ""}
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Adm No: {child.admissionNumber ? child.admissionNumber.replace(/-/g, '') : "Enrolled"} • Session 2026–2027
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3157D5] hover:bg-[#2444B5] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0"
        >
          <Award className="w-4 h-4" /> Download Official Report Card
        </button>
      </div>

      {/* Sticky Tab Navigation */}
      <div className="sticky top-[72px] z-10 p-1.5 rounded-2xl bg-white/90 dark:bg-[#07142F]/90 backdrop-blur-md border border-[#E7EAF0] dark:border-white/10 shadow-sm overflow-x-auto flex gap-1.5 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? "bg-[#3157D5] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <SpotlightCard className="p-6 sm:p-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-[#000E28] dark:text-white">Academic & Health Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Class Mentor</span>
                <p className="text-sm font-bold text-[#000E28] dark:text-white mt-1">{child.teacherName || "Assigned Class Educator"}</p>
                <p className="text-[11px] text-slate-400">Early Childhood Certified</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Blood Group</span>
                <p className="text-sm font-bold text-rose-600 mt-1">{child.bloodGroup || "On File"}</p>
                <p className="text-[11px] text-slate-400">Verified via Medical Card</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Emergency Phone</span>
                <p className="text-sm font-bold text-[#000E28] dark:text-white mt-1">{child.emergencyContact || "Registered on file"}</p>
                <p className="text-[11px] text-slate-400">Primary Guardian</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-[#000E28] dark:text-white">Medical & Dietary Advisory</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {child.medicalNotes || "No chronic allergies recorded. Regular seasonal hydration and sun protection recommended during physical playground hours."}
              </p>
            </div>
          </div>
        )}

        {activeTab !== "overview" && (
          <div className="py-8 text-center space-y-3">
            <h2 className="text-sm font-bold text-[#000E28] dark:text-white capitalize">
              Dedicated {activeTab} Workspace
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You can explore detailed live analytics, submissions, and logs for {child.firstName} on the main navigation.
            </p>
            <Link
              href={`/parent/${activeTab}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0050CB] text-white text-xs font-bold hover:bg-[#0040A5] transition-all shadow-sm"
            >
              Open Full {activeTab.toUpperCase()} Workspace
            </Link>
          </div>
        )}
      </SpotlightCard>

      <ReportCardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        child={child}
      />
    </div>
  );
}
