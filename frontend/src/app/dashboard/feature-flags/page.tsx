"use client";

import React, { useState } from "react";
import { Sliders, ShieldCheck, ToggleLeft, ToggleRight, CheckCircle2, Lock, Zap, Sparkles } from "lucide-react";

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState([
    {
      key: "ai_assistant",
      name: "Global AI Assistant & Predictive Insights",
      description: "Enables natural language querying and automated early warning risk engine.",
      enabled: true,
      category: "AI & Intelligence",
    },
    {
      key: "online_exams",
      name: "Online Exam Engine & Proctoring",
      description: "Enables digital timed exams, webcam monitoring, and automated grading.",
      enabled: true,
      category: "Academics",
    },
    {
      key: "biometric_attendance",
      name: "Biometric Smart Gate Access",
      description: "Automated student & staff arrival verification at main campus security gates.",
      enabled: true,
      category: "Operations",
    },
    {
      key: "whatsapp_gateway",
      name: "Automated WhatsApp Notification Gateway",
      description: "Sends automated fee receipts and emergency broadcast messages via WhatsApp.",
      enabled: false,
      category: "Communication",
    },
    {
      key: "multi_currency",
      name: "Multi-Currency Fee Payment Ledger",
      description: "Allows parents to pay tuition fees in USD, EUR, GBP, or local currencies.",
      enabled: true,
      category: "Finance",
    },
  ]);

  const toggleFlag = (key: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#000E28] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#0050CB] dark:text-[#38BDF8] font-bold text-xs uppercase tracking-wider mb-1">
            <Sliders className="h-4 w-4" />
            <span>Super Admin Module Control</span>
          </div>
          <h1 className="text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
            System Feature Flags & Capability Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamically toggle enterprise modules, AI assistants, payment gateways, and security controls across all tenant portals without code deployments.
          </p>
        </div>
      </div>

      {/* Feature Flags Grid */}
      <div className="space-y-4">
        {flags.map((f) => (
          <div
            key={f.key}
            className="p-5 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-6 hover:border-[#0050CB] transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-[#000E28] dark:text-white">{f.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E5EEFF] text-[#0050CB] text-[10px] font-black uppercase">
                  {f.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{f.description}</p>
            </div>

            <button
              onClick={() => toggleFlag(f.key)}
              className="flex items-center gap-2 cursor-pointer shrink-0"
            >
              {f.enabled ? (
                <ToggleRight className="h-8 w-8 text-[#0050CB]" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-slate-400" />
              )}
              <span className={`text-xs font-bold ${f.enabled ? "text-[#0050CB] dark:text-[#38BDF8]" : "text-slate-400"}`}>
                {f.enabled ? "ENABLED" : "DISABLED"}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
