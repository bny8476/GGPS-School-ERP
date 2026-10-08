"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  FileText,
  User,
  X,
  Layers,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { useParent, ClassWorkItem } from "@/context/ParentContext";

export default function TodayLearningCard({ className = "" }: { className?: string }) {
  const { todayClassWork } = useParent();
  const [selectedItem, setSelectedItem] = useState<ClassWorkItem | null>(null);

  const items = todayClassWork && todayClassWork.length > 0 ? todayClassWork : [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
        className={`relative overflow-hidden rounded-[24px] p-5 sm:p-6 bg-white/95 dark:bg-[#07142F]/95 backdrop-blur-md border border-[rgba(70,150,255,0.16)] dark:border-white/10 shadow-[0_8px_30px_rgba(0,80,203,0.06)] hover:shadow-[0_12px_36px_rgba(0,80,203,0.10)] transition-all duration-300 flex flex-col justify-between ${className}`}
      >
        {/* Glow */}
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-tr from-sky-100/40 via-blue-100/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-blue-50/90 dark:border-white/5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 flex items-center justify-center border border-blue-100/80 dark:border-white/10 shadow-2xs">
                <BookOpen className="w-4 h-4 text-[#0050CB] dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#000E28] dark:text-white flex items-center gap-1.5">
                  Today&apos;s Learning
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Classroom Lesson Units</p>
              </div>
            </div>

            <Link
              href="/parent/homework"
              className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-0.5"
            >
              All Lessons <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* List of Today's Learning Items */}
          <div className="mt-3.5 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-7 px-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800">
                <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No learning units published for today yet
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Classroom lesson topics and activities will appear here once teachers log them.
                </p>
              </div>
            ) : (
              items.map((item, idx) => (
                <motion.div
                  key={item._id || idx}
                  whileHover={{ y: -2 }}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F8FAFF] to-[#EFF5FF] dark:from-white/5 dark:to-blue-950/20 border border-blue-100/70 dark:border-white/5 transition-all shadow-2xs"
                >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wide bg-[#0050CB] text-white shadow-2xs mb-1">
                      {item.subject}
                    </span>
                    <h4 className="text-sm font-black text-[#000E28] dark:text-white leading-snug">
                      {item.topic}
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#0050CB] dark:text-blue-300 bg-white dark:bg-slate-800 border border-blue-200/60 dark:border-white/10 hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    View Details
                  </button>
                </div>

                <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Lesson completed</span>
                  </div>
                  {item.classroomActivity && (
                    <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{item.classroomActivity}</span>
                    </div>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-blue-100/60 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Teacher: <strong className="text-slate-600 dark:text-slate-300">{item.teacherName}</strong></span>
                  {item.homework && (
                    <span className="text-[#FF690C] font-bold">Includes Homework</span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

        <div className="mt-4 pt-3 border-t border-blue-50 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>Updated dynamically by classroom teachers</span>
          <span className="font-bold text-[#0050CB] dark:text-blue-300">{items.length} units published today</span>
        </div>
      </motion.div>

      {/* Detail Modal Dialog */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#07142F] rounded-3xl p-6 shadow-2xl border border-blue-100 dark:border-white/10 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-blue-50 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#0050CB] text-white">
                    {selectedItem.subject}
                  </span>
                  <h3 className="font-black text-base text-[#000E28] dark:text-white">{selectedItem.topic}</h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10.5px] mb-1">What We Learned</h5>
                  <p className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {selectedItem.whatWasTaught}
                  </p>
                </div>

                {selectedItem.learningObjective && (
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10.5px] mb-1">Learning Objective</h5>
                    <p className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedItem.learningObjective}
                    </p>
                  </div>
                )}

                {selectedItem.classroomActivity && (
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10.5px] mb-1">Classroom Activity</h5>
                    <p className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 font-medium">
                      🎯 {selectedItem.classroomActivity}
                    </p>
                  </div>
                )}

                {selectedItem.homework && (
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10.5px] mb-1">Associated Homework</h5>
                    <p className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 font-medium">
                      ✏️ {selectedItem.homework}
                    </p>
                  </div>
                )}

                {selectedItem.teacherRemark && (
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10.5px] mb-1">Teacher Remark</h5>
                    <p className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 italic">
                      &ldquo;{selectedItem.teacherRemark}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-blue-50 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Teacher: <strong className="text-slate-700 dark:text-slate-200">{selectedItem.teacherName}</strong>
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl bg-[#0050CB] text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
