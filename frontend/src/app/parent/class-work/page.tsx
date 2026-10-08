"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  BookOpen, ChevronRight, Calendar, User, Clock, 
  CheckCircle2, Sparkles, Filter, FileText, ArrowRight,
  Download, Eye, Lightbulb, Target
} from "lucide-react";
import toast from "react-hot-toast";
import { useParent } from "@/context/ParentContext";
import ParentEmptyChildState from "@/components/parent/ParentEmptyChildState";

export default function ParentClassWorkPage() {
  const { selectedChild, children = [], todayClassWork, isLoadingChildren } = useParent();
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const child = selectedChild || children[0] || null;

  const filteredWork = useMemo(() => {
    return (todayClassWork || []).filter((item) => {
      if (selectedSubject !== "All" && item.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.topic.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.whatWasTaught.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [todayClassWork, selectedSubject, searchQuery]);

  const subjects = useMemo(() => {
    const set = new Set<string>(["All"]);
    (todayClassWork || []).forEach((i) => {
      if (i.subject) set.add(i.subject);
    });
    return Array.from(set);
  }, [todayClassWork]);

  if (isLoadingChildren) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#0050CB] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading daily classroom work...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return <ParentEmptyChildState />;
  }

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 dark:text-slate-100">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <Link href="/parent" className="hover:text-[#0050CB] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
        <span className="text-slate-800 dark:text-slate-200 font-bold">Class Work</span>
      </div>

      {/* 2. Hero Banner */}
      <div className="relative rounded-[26px] bg-gradient-to-r from-[#F4F8FE] via-[#EDF4FE] to-[#E3EFFF] dark:from-[#091E42] dark:via-[#0A2554] dark:to-[#091E42] border border-[#D7E6FD] dark:border-blue-900/40 p-6 sm:p-7 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0050CB] text-white flex items-center justify-center shadow-md shadow-[#0050CB]/25 shrink-0">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-widest text-[#0050CB] dark:text-[#38BDF8] block">
                LEARNING MILESTONES
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight mt-0.5">
                Class Work & Daily Learning
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-1">
                Explore what {child.firstName} learned in class today with teacher guidance and worksheets.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-[#FF690C]" />
            <span>Class {child.grade} ({child.section})</span>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {subjects.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSubject === sub
                  ? "bg-[#0050CB] text-white shadow-xs"
                  : "bg-white dark:bg-[#07142F] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#0050CB]/40"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            placeholder="Search class work..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#07142F] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0050CB]"
          />
        </div>
      </div>

      {/* 4. Class Work Cards */}
      {filteredWork.length === 0 ? (
        <div className="bg-white dark:bg-[#07142F] rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No class work entries found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Today&apos;s lesson notes and worksheets will appear here as soon as the teacher submits them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredWork.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-[#07142F] rounded-[24px] p-6 border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-[#0050CB]/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] text-[11px] font-black uppercase tracking-wider">
                    {item.subject}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(item.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 space-y-2">
                  <h3 className="text-base font-extrabold text-[#000E28] dark:text-white">
                    {item.topic}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {item.whatWasTaught}
                  </p>
                </div>

                {item.classroomActivity && (
                  <div className="mt-3.5 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-[#FF690C] shrink-0 mt-0.5" />
                    <div className="text-[11.5px] text-amber-900 dark:text-amber-200">
                      <span className="font-bold">Classroom Activity: </span>
                      {item.classroomActivity}
                    </div>
                  </div>
                )}

                {item.learningObjective && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 flex items-start gap-2.5">
                    <Target className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <div className="text-[11.5px] text-blue-900 dark:text-blue-200">
                      <span className="font-bold">Learning Objective: </span>
                      {item.learningObjective}
                    </div>
                  </div>
                )}

                {item.teacherRemark && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-[11.5px] text-emerald-900 dark:text-emerald-200">
                      <span className="font-bold">Teacher Feedback: </span>
                      {item.teacherRemark}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-[#0050CB]">
                    {item.teacherName ? item.teacherName[0] : "T"}
                  </div>
                  <span className="font-semibold">{item.teacherName || "Instructor"}</span>
                </div>

                {item.worksheetUrl && (
                  <a
                    href={item.worksheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0050CB] text-white font-bold text-[11px] shadow-xs hover:bg-[#0041A8] transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Worksheet</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
