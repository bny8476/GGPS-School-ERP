"use client";

import React, { useState } from "react";
import { Trophy, Award, QrCode, Plus, Sparkles, Flame, Shield, CheckCircle2, Star } from "lucide-react";

export default function HouseSystemPage() {
  const [selectedStudent, setSelectedStudent] = useState("Aarav Sharma");
  const [certTitle, setCertTitle] = useState("Excellence in Phonics & Storytelling");
  const [certGenerated, setCertGenerated] = useState(false);

  const houses = [
    { name: "Phoenix House", points: 1420, color: "from-amber-500 to-rose-600", lead: "UKG A", icon: Flame },
    { name: "Dragon House", points: 1380, color: "from-emerald-500 to-teal-700", lead: "LKG B", icon: Shield },
    { name: "Falcon House", points: 1290, color: "from-[#0050CB] to-[#38BDF8]", lead: "UKG B", icon: Star },
    { name: "Pegasus House", points: 1210, color: "from-purple-500 to-indigo-700", lead: "Pre-KG A", icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#000E28] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Trophy className="h-4 w-4" />
            <span>Gamified House Points & Recognition</span>
          </div>
          <h1 className="text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
            House System Leaderboard & QR Certificates
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track inter-house academic and sports competitions, award merit points, and generate tamper-proof QR verified certificates.
          </p>
        </div>
      </div>

      {/* House Leaderboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {houses.map((h, i) => {
          const Icon = h.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl bg-gradient-to-br ${h.color} text-white shadow-md space-y-3 relative overflow-hidden`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Rank #{i + 1}
                </span>
                <Icon className="h-6 w-6 opacity-80" />
              </div>
              <div>
                <h3 className="text-lg font-black">{h.name}</h3>
                <div className="text-3xl font-black mt-1">{h.points} pts</div>
              </div>
              <p className="text-[11px] opacity-90 font-medium">Top Contributor: {h.lead}</p>
            </div>
          );
        })}
      </div>

      {/* QR Certificate Generator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-[#000E28] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="h-4 w-4 text-[#0050CB]" />
            Generate Merit Certificate
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Recipient Student</label>
              <input
                type="text"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Award Title</label>
              <input
                type="text"
                value={certTitle}
                onChange={(e) => setCertTitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
              />
            </div>

            <button
              onClick={() => setCertGenerated(true)}
              className="w-full py-2.5 bg-[#0050CB] hover:bg-[#003da3] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate QR Certificate</span>
            </button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="lg:col-span-2 bg-white dark:bg-[#000E28] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider">
            Certificate Preview
          </h2>

          <div className="p-8 border-4 border-double border-[#0050CB] rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-slate-50 dark:from-[#000E28] dark:to-slate-900 text-center space-y-6 relative">
            <div className="space-y-1">
              <div className="text-[10px] font-black tracking-widest text-[#0050CB] uppercase">GGPS School</div>
              <h3 className="text-2xl font-serif font-black text-[#000E28] dark:text-white tracking-wide">
                CERTIFICATE OF MERIT
              </h3>
              <p className="text-xs text-slate-500 font-serif italic">This official recognition is proudly presented to</p>
            </div>

            <div className="text-xl font-black text-[#0050CB] dark:text-[#38BDF8] underline decoration-2 decoration-[#FF690C] underline-offset-4">
              {selectedStudent}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              In honor of outstanding performance and achievement in <span className="font-bold text-[#000E28] dark:text-white">{certTitle}</span>.
            </p>

            <div className="pt-6 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6">
              <div className="text-left leading-tight">
                <div className="font-serif font-bold text-xs text-[#000E28] dark:text-white">Principal Signature</div>
                <div className="text-[10px] text-slate-400">Dr. Elizabeth Vance</div>
              </div>

              {/* QR Verification Code Placeholder */}
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-left">
                <QrCode className="h-8 w-8 text-[#0050CB]" />
                <div className="text-[9px] font-mono text-slate-500">
                  <div className="font-bold text-[#000E28] dark:text-white">VERIFIED QR</div>
                  <div>ID: CERT-2026-88</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
