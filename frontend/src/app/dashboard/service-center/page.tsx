"use client";

import React, { useState } from "react";
import { LifeBuoy, Plus, CheckCircle2, Clock, Wrench, Laptop, DollarSign } from "lucide-react";

export default function ServiceCenterPage() {
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("IT Request");

  const [tickets, setTickets] = useState([
    {
      id: "SR-101",
      subject: "Interactive Whiteboard Calibration in Lab 3",
      category: "IT Request",
      priority: "High",
      status: "In Progress",
      requestedBy: "Dr. Vance",
      date: "Sep 15, 2026",
    },
    {
      id: "SR-102",
      subject: "Air Conditioning Maintenance in Auditorium",
      category: "Maintenance",
      priority: "Medium",
      status: "Open",
      requestedBy: "Ms. Rostova",
      date: "Sep 15, 2026",
    },
    {
      id: "SR-103",
      subject: "Updated Payroll Tax Exemption Document",
      category: "HR Request",
      priority: "Normal",
      status: "Resolved",
      requestedBy: "Mr. Miller",
      date: "Sep 10, 2026",
    },
  ]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    const newT = {
      id: `SR-${Date.now().toString().slice(-4)}`,
      subject,
      category,
      priority: "Normal",
      status: "Open",
      requestedBy: "Active User",
      date: "Just now",
    };
    setTickets([newT, ...tickets]);
    setSubject("");
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#000E28] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#0050CB] dark:text-[#38BDF8] font-bold text-xs uppercase tracking-wider mb-1">
            <LifeBuoy className="h-4 w-4" />
            <span>Enterprise Internal Service Desk</span>
          </div>
          <h1 className="text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
            Universal Internal Service Request Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit IT support tickets, facility maintenance requests, HR inquiries, finance document requests, and campus operations.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0050CB] text-white hover:bg-[#003da3] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>New Service Request</span>
        </button>
      </div>

      {/* Tickets Grid */}
      <div className="bg-white dark:bg-[#000E28] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider">
          Active Service Tickets ({tickets.length})
        </h2>

        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0050CB] transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E5EEFF] text-[#0050CB] text-[10px] font-black uppercase">
                    {t.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#000E28] dark:text-white">{t.subject}</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Requested by: <strong className="text-[#000E28] dark:text-white">{t.requestedBy}</strong> • ID: {t.id}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    t.status === "Resolved"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : t.status === "In Progress"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  }`}
                >
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-black text-[#000E28] dark:text-white">Submit Service Request</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Request Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Describe issue or request title"
                  required
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Department Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="IT Request">IT & Hardware</option>
                  <option value="Maintenance">Facility Maintenance</option>
                  <option value="HR Request">HR & Payroll</option>
                  <option value="Finance Request">Finance & Billing</option>
                  <option value="Operations Request">Campus Operations</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0050CB] text-white hover:bg-[#003da3] text-xs font-bold rounded-xl"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
