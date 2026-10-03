"use client";

import React, { useState } from "react";
import { Users, Grid, Sparkles, Printer, ShieldCheck, CheckCircle2 } from "lucide-react";
import { printDocument } from "@/lib/exportUtils";

export default function SeatingPlanPage() {
  const [hall, setHall] = useState("Main Examination Hall A");
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(6);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setGenerated(true);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#000E28] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#0050CB] dark:text-[#38BDF8] font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="h-4 w-4" />
            <span>Anti-Cheating Examination Security</span>
          </div>
          <h1 className="text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
            Exam Seating Plan & Hall Arrangement Generator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automatically shuffle students across different grades, classes, and subjects into alternating rows to prevent collusion and ensure strict exam integrity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Config Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-[#000E28] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Grid className="h-4 w-4 text-[#0050CB]" />
            Hall & Capacity Settings
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Examination Hall</label>
              <select
                value={hall}
                onChange={(e) => setHall(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
              >
                <option value="Main Examination Hall A">Main Examination Hall A</option>
                <option value="Auditorium Block B">Auditorium Block B</option>
                <option value="Science Lab Hall 1">Science Lab Hall 1</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Rows</label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Columns</label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Cohort Arrangement Mode:</span>
              <p className="text-slate-500 text-[11px]">
                LKG & UKG activity cohorts interleaved. Balanced group spacing for classroom activity tables.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0050CB] hover:bg-[#003da3] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loading ? "Arranging..." : "Generate Seating Grid"}</span>
            </button>
          </form>
        </div>

        {/* Right Seating Grid View */}
        <div className="lg:col-span-2 bg-white dark:bg-[#000E28] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider">
                {hall} - Seating Layout
              </h2>
              <p className="text-xs text-slate-400">Total Capacity: {rows * cols} Desks</p>
            </div>
            {generated && (
              <button
                onClick={() => printDocument("printable-seating-plan", `GGPS School - Seating Plan (${hall})`)}
                className="px-3 py-1.5 bg-[#0050CB] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-[#003EA3] transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Door Seating Sheet</span>
              </button>
            )}
          </div>

          <div id="printable-seating-plan" className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50 dark:bg-slate-900 space-y-4">
            <div className="text-center py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300">
              [ FRONT PODIUM / ACTIVITY BOARD ]
            </div>

            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: rows * cols }).map((_, idx) => {
                const isEvenRow = Math.floor(idx / cols) % 2 === 0;
                const isLKG = (idx % 2 === 0 && isEvenRow) || (idx % 2 !== 0 && !isEvenRow);
                const rollNo = isLKG ? `LKG-A-${(idx % 20) + 1}` : `UKG-B-${(idx % 20) + 1}`;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isLKG
                        ? "bg-[#E5EEFF] border-[#0050CB]/30 text-[#0050CB] dark:bg-[#0050CB]/20 dark:text-[#38BDF8]"
                        : "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase">Desk #{idx + 1}</div>
                    <div className="text-xs font-bold mt-1">{rollNo}</div>
                    <div className="text-[9px] font-bold opacity-75 mt-0.5">
                      {isLKG ? "LKG Phonics" : "UKG Math"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
