"use client";

import React, { useState } from "react";
import { 
  BookOpen, Clock, Calendar, CheckCircle2, AlertCircle, 
  Upload, Download, Paperclip, X, FileText, ArrowRight,
  ChevronRight, AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import SpotlightCard from "@/components/teacher/SpotlightCard";
import { useParent } from "@/context/ParentContext";
import ParentEmptyChildState from "@/components/parent/ParentEmptyChildState";
import { authFetch } from "@/lib/apiClient";
import toast from "react-hot-toast";

interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  teacher: string;
  status: "Pending" | "Completed" | "Overdue";
  attachmentName?: string;
  attachmentSize?: string;
}

export default function ParentHomeworkPage() {
  const { selectedChild, children = [], isLoadingChildren, homeworkList: contextHwList = [], updateHomeworkStatus } = useParent();
  const [filter, setFilter] = useState<"all" | "Pending" | "Completed" | "Overdue">("all");
  const [selectedHw, setSelectedHw] = useState<HomeworkItem | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionNote, setSubmissionNote] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const child = selectedChild || children[0] || null;

  if (isLoadingChildren) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#0050CB] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading homework assignments...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return <ParentEmptyChildState />;
  }

  const homeworkList: HomeworkItem[] = (contextHwList || []).map((h: any) => ({
    id: h._id || h.id || `hw-${Math.random()}`,
    title: h.title,
    subject: h.subject || "General",
    description: h.description || h.instructions || "Review and complete the classroom assignment.",
    assignedDate: h.assignedDate
      ? new Date(h.assignedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "Assigned",
    dueDate: h.dueDate
      ? new Date(h.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "Upcoming",
    teacher: h.teacherName || child.teacherName || "Class Teacher",
    status: h.status === "Submitted" ? "Completed" : (h.status || "Pending"),
    attachmentName: h.attachmentUrl ? h.attachmentUrl.split("/").pop() : undefined,
  }));

  const counts = {
    all: homeworkList.length,
    Pending: homeworkList.filter((h) => h.status === "Pending").length,
    Completed: homeworkList.filter((h) => h.status === "Completed").length,
    Overdue: homeworkList.filter((h) => h.status === "Overdue").length,
  };

  const filteredList = filter === "all"
    ? homeworkList
    : homeworkList.filter((h) => h.status === filter);

  const handleOpenSubmit = (hw: HomeworkItem) => {
    setSelectedHw(hw);
    setUploadedFile(null);
    setSubmissionNote("");
    setIsSubmitModalOpen(true);
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHw) return;
    setIsSubmitting(true);
    try {
      if (updateHomeworkStatus) {
        await updateHomeworkStatus(selectedHw.id, "Submitted");
      }
      setIsSubmitModalOpen(false);
      toast.success(`Homework for "${selectedHw.title}" submitted successfully!`);
    } catch {
      toast.error("Failed to submit homework.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[22px] bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF690C]">
            Academic Tasks
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white">
            Homework Workspace: {child.firstName} {child.lastName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track pending assignments, download worksheets, and submit finished work online.
          </p>
        </div>

        <button
          onClick={() => {
            const firstPending = homeworkList.find((h) => h.status === "Pending");
            if (firstPending) handleOpenSubmit(firstPending);
            else toast.success("No pending assignments to submit!");
          }}
          className="px-4 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0040A5] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Submit Work
        </button>
      </div>

      {/* Counter Statistics Cards (Exact Matching Reference Card Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assigned Total */}
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setFilter("all")}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative overflow-hidden rounded-[24px] p-5 bg-gradient-to-br from-white via-white to-[#EBF3FF]/70 dark:from-[#07142F] dark:via-[#091838] dark:to-[#0D2452] border ${
            filter === "all" ? "border-blue-400 ring-2 ring-blue-200" : "border-blue-100/90"
          } dark:border-white/10 shadow-[0_4px_20px_rgba(0,80,203,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,80,203,0.14)] transition-all duration-300 min-h-[148px] flex flex-col justify-between group cursor-pointer`}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E1EFFF] to-[#C8E0FF] dark:from-blue-950/60 dark:to-blue-900/40 p-[2.5px] shadow-sm shadow-blue-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#2563EB] to-[#0050CB] flex items-center justify-center shadow-inner">
                <BookOpen className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="relative z-10 mt-3 min-w-0">
            <div className="text-[28px] sm:text-[32px] font-black text-[#000E28] dark:text-white tracking-tight leading-none font-sans">
              {counts.all}
            </div>
            <div className="text-[15px] sm:text-[16px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Assigned Tasks
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[12px] sm:text-[12.5px] font-extrabold text-[#0050CB] dark:text-blue-300 whitespace-nowrap">
              This academic term
            </span>
          </div>
        </motion.div>

        {/* Card 2: Pending */}
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setFilter("Pending")}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative overflow-hidden rounded-[24px] p-5 bg-gradient-to-br from-white via-white to-[#FFF7ED]/70 dark:from-[#07142F] dark:via-[#221609] dark:to-[#361E0A] border ${
            filter === "Pending" ? "border-amber-400 ring-2 ring-amber-200" : "border-amber-100/90"
          } dark:border-white/10 shadow-[0_4px_20px_rgba(249,115,22,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(249,115,22,0.14)] transition-all duration-300 min-h-[148px] flex flex-col justify-between group cursor-pointer`}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFEDD5] to-[#FED7AA] dark:from-orange-950/60 dark:to-orange-900/40 p-[2.5px] shadow-sm shadow-orange-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#FB923C] to-[#EA580C] flex items-center justify-center shadow-inner">
                <Clock className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="relative z-10 mt-3 min-w-0">
            <div className="text-[28px] sm:text-[32px] font-black text-[#EA580C] dark:text-orange-400 tracking-tight leading-none font-sans">
              {counts.Pending}
            </div>
            <div className="text-[15px] sm:text-[16px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Pending Tasks
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[12px] sm:text-[12.5px] font-extrabold text-[#EA580C] dark:text-orange-400 whitespace-nowrap">
              Action required
            </span>
          </div>
        </motion.div>

        {/* Card 3: Completed */}
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setFilter("Completed")}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative overflow-hidden rounded-[24px] p-5 bg-gradient-to-br from-white via-white to-[#E6F9F0]/60 dark:from-[#07142F] dark:via-[#09221C] dark:to-[#0D382E] border ${
            filter === "Completed" ? "border-emerald-400 ring-2 ring-emerald-200" : "border-emerald-100/90"
          } dark:border-white/10 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.14)] transition-all duration-300 min-h-[148px] flex flex-col justify-between group cursor-pointer`}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] dark:from-emerald-950/60 dark:to-emerald-900/40 p-[2.5px] shadow-sm shadow-emerald-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#10B981] to-[#059669] flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-5 h-5 text-white stroke-[2.4]" />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="relative z-10 mt-3 min-w-0">
            <div className="text-[28px] sm:text-[32px] font-black text-[#000E28] dark:text-white tracking-tight leading-none font-sans">
              {counts.Completed}
            </div>
            <div className="text-[15px] sm:text-[16px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Completed Tasks
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[12px] sm:text-[12.5px] font-extrabold text-[#059669] dark:text-emerald-400 whitespace-nowrap">
              100% on time
            </span>
          </div>
        </motion.div>

        {/* Card 4: Overdue */}
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setFilter("Overdue")}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative overflow-hidden rounded-[24px] p-5 bg-gradient-to-br from-white via-white to-[#FFF1F2]/70 dark:from-[#07142F] dark:via-[#220B11] dark:to-[#380E18] border ${
            filter === "Overdue" ? "border-rose-400 ring-2 ring-rose-200" : "border-rose-100/90"
          } dark:border-white/10 shadow-[0_4px_20px_rgba(244,63,94,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(244,63,94,0.14)] transition-all duration-300 min-h-[148px] flex flex-col justify-between group cursor-pointer`}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFE4E6] to-[#FECDD3] dark:from-rose-950/60 dark:to-rose-900/40 p-[2.5px] shadow-sm shadow-rose-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#F43F5E] to-[#E11D48] flex items-center justify-center shadow-inner">
                <AlertCircle className="w-5 h-5 text-white stroke-[2.4]" />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="relative z-10 mt-3 min-w-0">
            <div className="text-[28px] sm:text-[32px] font-black text-[#E11D48] dark:text-rose-400 tracking-tight leading-none font-sans">
              {counts.Overdue}
            </div>
            <div className="text-[15px] sm:text-[16px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Overdue Tasks
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[12px] sm:text-[12.5px] font-extrabold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              All up to date
            </span>
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(["all", "Pending", "Completed", "Overdue"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === tab
                ? "bg-[#0050CB] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab === "all" ? "All Homework" : tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Homework Cards List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-[24px] p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No homework assignments found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {filter === "all"
                ? `No homework tasks currently assigned to ${child.firstName}.`
                : `No ${filter.toLowerCase()} homework tasks found for this filter.`}
            </p>
          </div>
        ) : (
          filteredList.map((hw) => (
            <SpotlightCard key={hw.id} className="p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-blue-300">
                    {hw.subject}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    hw.status === "Completed"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : hw.status === "Pending"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                  }`}>
                    {hw.status}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-[#000E28] dark:text-white">
                  {hw.title}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {hw.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>Assigned: <strong className="text-slate-600 dark:text-slate-300">{hw.assignedDate}</strong></span>
                  <span>Due Date: <strong className="text-[#0050CB] dark:text-blue-400">{hw.dueDate}</strong></span>
                  <span>Teacher: <strong>{hw.teacher}</strong></span>
                </div>

                {/* Attachment Link if available */}
                {hw.attachmentName && (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => toast.success(`Downloading ${hw.attachmentName}...`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0050CB]" />
                      <span>{hw.attachmentName}</span>
                      <span className="text-[10px] text-slate-400">({hw.attachmentSize})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                {hw.status === "Pending" ? (
                  <button
                    onClick={() => handleOpenSubmit(hw)}
                    className="px-4 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0040A5] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" /> Submit Work
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Submitted
                  </div>
                )}
              </div>
            </div>
          </SpotlightCard>
        ))
      )}
      </div>

      {/* Submission Modal */}
      {isSubmitModalOpen && selectedHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsSubmitModalOpen(false)}
            className="fixed inset-0 bg-[#000E28]/70 backdrop-blur-md"
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0050CB]">
                  Online Submission
                </span>
                <h3 className="text-sm font-bold text-[#000E28] dark:text-white truncate">
                  {selectedHw.title}
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Student Work (Photo / PDF / Scan)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-[#0050CB] transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/40">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    {uploadedFile ? uploadedFile.name : "Click to browse or drop photograph"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, PDF up to 10MB</p>
                  <input
                    type="file"
                    className="hidden"
                    id="fileUpload"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label
                    htmlFor="fileUpload"
                    className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-[#0050CB] text-white text-[11px] font-bold cursor-pointer"
                  >
                    Select File
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parent Note / Comments (Optional)
                </label>
                <textarea
                  rows={3}
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  placeholder={`e.g. ${child.firstName} completed the assigned worksheet with parent guidance...`}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0040A5] text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  {isSubmitting ? "Submitting..." : "Confirm & Send to Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
