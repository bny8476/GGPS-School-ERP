"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarCheck2,
  Clock,
  UserCheck,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Info,
} from "lucide-react";
import { useParent, TodayAttendanceInfo } from "@/context/ParentContext";

export default function TodayAttendanceCard({ className = "" }: { className?: string }) {
  const { selectedChild, todayAttendance } = useParent();

  const childName = selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : "Your child";
  const classNameStr = selectedChild ? `${selectedChild.grade} - ${selectedChild.section}` : "Class not assigned";

  const formattedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isRecorded = Boolean(todayAttendance?.recorded);
  const status = isRecorded ? (todayAttendance?.status || "Not Marked") : (todayAttendance?.status || "Not Marked");
  const checkInTime = todayAttendance?.checkInTime || "Not recorded";
  const teacherName = todayAttendance?.teacherName || selectedChild?.teacherName || "Class Teacher";
  const absenceReason = todayAttendance?.absenceReason;
  const teacherRemark = todayAttendance?.teacherRemark;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-[24px] p-5 sm:p-6 bg-white/95 dark:bg-[#07142F]/95 backdrop-blur-md border border-[rgba(70,150,255,0.16)] dark:border-white/10 shadow-[0_8px_30px_rgba(0,80,203,0.06)] hover:shadow-[0_12px_36px_rgba(0,80,203,0.10)] transition-all duration-300 ${className}`}
    >
      {/* Decorative Glow Elements */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-gradient-to-br from-blue-100/40 via-sky-100/20 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-blue-50/90 dark:border-white/5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 flex items-center justify-center border border-blue-100/80 dark:border-white/10 shadow-2xs">
            <CalendarCheck2 className="w-4 h-4 text-[#0050CB] dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#000E28] dark:text-white flex items-center gap-1.5">
              Today&apos;s Attendance
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{formattedDate}</p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center">
          {status === "Present" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ✓ Present
            </span>
          )}
          {status === "Late" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              🕒 Late Arrival
            </span>
          )}
          {status === "Absent" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              ⚠ Absent
            </span>
          )}
          {status === "Excused" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 shadow-2xs">
              Excused Leave
            </span>
          )}
          {status === "Not Marked" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 shadow-2xs">
              Roll-call Pending
            </span>
          )}
        </div>
      </div>

      {/* 2. Child Identification Strip */}
      <div className="pt-3 pb-2 flex items-center justify-between text-xs">
        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Student</span>
          <span className="font-black text-sm text-[#000E28] dark:text-white">{childName}</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Class & Section</span>
          <span className="font-bold text-xs text-[#0050CB] dark:text-blue-300 bg-[#E5EEFF] dark:bg-blue-950/50 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-800/60">
            {classNameStr}
          </span>
        </div>
      </div>

      {/* 3. Status Specific Content */}
      <div className="my-2 p-3.5 rounded-2xl bg-gradient-to-br from-slate-50/90 to-blue-50/40 dark:from-white/5 dark:to-blue-950/20 border border-blue-100/60 dark:border-white/5 space-y-2">
        {status === "Present" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0050CB] dark:text-blue-400" />
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Arrival Time: <strong className="text-[#000E28] dark:text-white font-black">{checkInTime}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified by: <strong className="text-slate-800 dark:text-slate-200">{teacherName}</strong></span>
            </div>
          </div>
        )}

        {status === "Late" && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 font-bold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{childName} arrived at {checkInTime}.</span>
            </div>
            {teacherRemark && (
              <div className="text-xs text-slate-600 dark:text-slate-300 pl-6">
                Teacher Remark: <span className="font-semibold italic text-slate-800 dark:text-slate-200">&ldquo;{teacherRemark}&rdquo;</span>
              </div>
            )}
            <div className="text-[11px] text-slate-500 pl-6">
              Recorded by: {teacherName}
            </div>
          </div>
        )}

        {status === "Absent" && (
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{childName} was marked absent today.</p>
                {absenceReason ? (
                  <p className="text-[11px] mt-0.5 text-rose-700 dark:text-rose-300">
                    Reason: <strong className="underline decoration-rose-300 font-bold">{absenceReason}</strong>
                  </p>
                ) : (
                  <p className="text-[11px] mt-0.5 text-slate-600 dark:text-slate-400 leading-snug">
                    Your child was marked absent today. Please contact the school if this absence was unexpected.
                  </p>
                )}
                {teacherRemark && (
                  <p className="text-[11px] mt-0.5 text-slate-500 dark:text-slate-400">
                    Teacher Remark: <span className="italic">{teacherRemark}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {status === "Not Marked" && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Morning attendance roll-call is currently in progress by {teacherName}.</span>
          </div>
        )}
      </div>

      {/* 4. Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-blue-50 dark:border-white/5">
        <span className="text-[11px] font-bold text-slate-400">
          Teacher: <strong className="text-slate-600 dark:text-slate-300">{teacherName}</strong>
        </span>

        <div className="flex items-center gap-2">
          {status === "Absent" ? (
            <>
              <Link
                href="/parent/attendance"
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                View Attendance
              </Link>
              <Link
                href="/parent/messages"
                className="px-3 py-1.5 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message Teacher
              </Link>
            </>
          ) : (
            <Link
              href="/parent/attendance"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline"
            >
              Full Register <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
