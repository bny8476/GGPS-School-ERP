"use client";

import React from "react";
import { Users, Mail } from "lucide-react";

interface ParentEmptyChildStateProps {
  title?: string;
  message?: string;
}

export default function ParentEmptyChildState({
  title = "No children linked to this account.",
  message = "Please contact the school administrator to link your child. Once your student relationship is verified by administration, their full academic profile, attendance, diary, homework, and fee ledger will automatically appear here.",
}: ParentEmptyChildStateProps) {
  return (
    <div className="w-full min-h-[420px] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#000E28] rounded-[24px] border border-blue-100 dark:border-slate-800 p-8 sm:p-10 max-w-lg w-full text-center shadow-lg shadow-blue-500/5 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center mx-auto shadow-inner">
          <Users className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            {message}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Mail className="w-3.5 h-3.5 text-[#0050CB]" />
            <span>admin@ggps.edu.in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
