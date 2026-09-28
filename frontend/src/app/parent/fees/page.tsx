"use client";

import React, { useState, useEffect } from "react";
import { 
  WalletCards, CheckCircle2, AlertCircle, Clock, 
  Download, ArrowRight, ShieldCheck, CreditCard, Receipt,
  ChevronRight 
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import SpotlightCard from "@/components/teacher/SpotlightCard";
import FeePaymentModal from "@/components/parent/FeePaymentModal";
import { useParent } from "@/context/ParentContext";
import toast from "react-hot-toast";

export default function ParentFeesPage() {
  const { selectedChild } = useParent();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [feesData, setFeesData] = useState<any[]>([]);

  const child = selectedChild || {
    firstName: "Aarav",
    lastName: "Sharma",
    grade: "LKG",
  };

  const fetchFees = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await fetch(`${apiBase}/api/v1/finance/fees`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFeesData(data);
        }
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees, child]);

  const defaultInvoices = [
    {
      id: "inv-01",
      title: "Term 2 Tuition & Digital Learning Fee",
      category: "Tuition",
      dueDate: "30 Sep 2026",
      amount: 4500,
      status: "Pending",
    },
    {
      id: "inv-02",
      title: "Classroom Activity & Experiential Kit Fee",
      category: "Activities",
      dueDate: "15 Oct 2026",
      amount: 2500,
      status: "Pending",
    },
    {
      id: "inv-03",
      title: "Sports & Physical Education Development Fee",
      category: "Sports",
      dueDate: "10 Oct 2026",
      amount: 1500,
      status: "Pending",
    },
    {
      id: "inv-04",
      title: "Term 1 Tuition & Annual Registration",
      category: "Tuition",
      dueDate: "30 Jun 2026",
      amount: 18500,
      status: "Paid",
    },
  ];

  const invoices = React.useMemo(() => {
    if (feesData.length > 0) {
      return feesData.map((f: any, idx: number) => ({
        id: String(f._id),
        title: f.title || `${f.feeType || "Tuition"} Fee`,
        category: f.feeType || "Tuition",
        dueDate: f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "30 Sep 2026",
        amount: f.totalAmount || f.amount || 4500,
        amountPaid: f.amountPaid || 0,
        status: f.status || "Pending",
        invoiceNumber: f.invoiceNumber || `INV-2026-${String(idx + 1).padStart(4, "0")}`,
        receiptNumber: f.receiptNumber || (f.status === "Paid" ? `GGPS-REC-${Date.now().toString().slice(-6)}` : undefined),
      }));
    }
    return defaultInvoices;
  }, [feesData]);

  const totalAnnualFees = React.useMemo(() => invoices.reduce((acc, i) => acc + (i.amount || 0), 0), [invoices]);
  const totalPaid = React.useMemo(() => invoices.filter((i) => i.status === "Paid").reduce((acc, i) => acc + (i.amount || 0), 0), [invoices]);
  const totalPending = Math.max(0, totalAnnualFees - totalPaid);

  const defaultPaymentHistory = [
    {
      receiptNo: "GGPS-RCP-902811",
      date: "28 Jun 2026",
      description: "Term 1 Tuition & Registration",
      amount: 18500,
      mode: "UPI / PhonePe",
      status: "Successful",
    },
    {
      receiptNo: "GGPS-RCP-771204",
      date: "12 Apr 2026",
      description: "Admission & Registration Kit",
      amount: 5000,
      mode: "Net Banking (HDFC)",
      status: "Successful",
    },
  ];

  const paymentHistory = React.useMemo(() => {
    const paidFees = feesData.filter((f) => f.status === "Paid" || (f.amountPaid && f.amountPaid > 0));
    if (paidFees.length > 0) {
      return paidFees.map((f, i) => ({
        receiptNo: f.receiptNumber || `GGPS-RCP-${String(100000 + i)}`,
        date: f.paidAt ? new Date(f.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "28 Jun 2026",
        description: f.title || `${f.feeType} Fee`,
        amount: f.amountPaid || f.totalAmount || 18500,
        mode: f.paymentMethod || "UPI / Online Gateway",
        status: "Successful",
      }));
    }
    return defaultPaymentHistory;
  }, [feesData]);

  const openPayModal = (inv: any) => {
    setSelectedInvoice(inv || invoices[0]);
    setIsPaymentModalOpen(true);
  };

  const handleDownloadReceipt = (receiptNo: string, amount: number) => {
    const receiptContent = `GGPS SCHOOL ERP - OFFICIAL FEE RECEIPT
------------------------------------------------
Receipt Number: ${receiptNo}
Student Name:   ${child.firstName} ${child.lastName}
Grade & Section:${child.grade}
Amount Paid:    ₹${amount.toLocaleString()}
Payment Status: SUCCESSFUL / VERIFIED
Authorized By:  GGPS Directorate of Finance
------------------------------------------------`;
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt_${receiptNo}.txt`;
    document.body.appendChild(a);
    a.click();
    toast.success(`Downloaded Receipt ${receiptNo}`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[22px] bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#12B76A]">
            Financial Management
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white">
            Fees & Payments: {child.firstName} {child.lastName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transparent fee statements, pending dues breakdown, and instant online receipts.
          </p>
        </div>

        <button
          onClick={() => openPayModal(invoices.find((i) => i.status === "Pending") || invoices[0])}
          className="px-5 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0040A5] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          Pay Pending Fees (₹{totalPending.toLocaleString("en-IN")})
        </button>
      </div>

      {/* Summary KPI Cards (Exact Matching Reference Card Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Annual Fees */}
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] p-5 bg-gradient-to-br from-white via-white to-[#EBF3FF]/70 dark:from-[#07142F] dark:via-[#091838] dark:to-[#0D2452] border border-blue-100/90 dark:border-white/10 shadow-[0_4px_20px_rgba(0,80,203,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,80,203,0.14)] transition-all duration-300 min-h-[148px] flex flex-col justify-between group cursor-pointer"
        >

          <div className="relative z-10 flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E1EFFF] to-[#C8E0FF] dark:from-blue-950/60 dark:to-blue-900/40 p-[2.5px] shadow-sm shadow-blue-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#2563EB] to-[#0050CB] flex items-center justify-center shadow-inner">
                <WalletCards className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="relative z-10 mt-3 min-w-0">
            <div className="text-[28px] sm:text-[32px] font-black text-[#000E28] dark:text-white tracking-tight leading-none font-sans">
              ₹{totalAnnualFees.toLocaleString("en-IN")}
            </div>
            <div className="text-[15px] sm:text-[16px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Total Annual Fees
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[12px] sm:text-[12.5px] font-extrabold text-[#0050CB] dark:text-blue-300 whitespace-nowrap">
              Academic Year 2025–26
            </span>
          </div>
        </motion.div>

        {/* Card 2: Total Paid */}
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] p-5 bg-gradient-to-br from-white via-white to-[#E6F9F0]/60 dark:from-[#07142F] dark:via-[#09221C] dark:to-[#0D382E] border border-emerald-100/90 dark:border-white/10 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.14)] transition-all duration-300 min-h-[148px] flex flex-col justify-between group cursor-pointer"
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
            <div className="text-[28px] sm:text-[32px] font-black text-[#059669] dark:text-emerald-400 tracking-tight leading-none font-sans">
              ₹{totalPaid.toLocaleString("en-IN")}
            </div>
            <div className="text-[15px] sm:text-[16px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Total Paid
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[12px] sm:text-[12.5px] font-extrabold text-[#059669] dark:text-emerald-400 whitespace-nowrap">
              Receipts verified
            </span>
          </div>
        </motion.div>

        {/* Card 3: Pending Dues */}
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => openPayModal(invoices.find((i) => i.status === "Pending") || invoices[0])}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] p-5 bg-gradient-to-br from-white via-white to-[#FFF7ED]/70 dark:from-[#07142F] dark:via-[#221609] dark:to-[#361E0A] border border-amber-100/90 dark:border-white/10 shadow-[0_4px_20px_rgba(249,115,22,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(249,115,22,0.14)] transition-all duration-300 min-h-[148px] flex flex-col justify-between group cursor-pointer"
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
              ₹{totalPending.toLocaleString("en-IN")}
            </div>
            <div className="text-[15px] sm:text-[16px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Pending Dues
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[12px] sm:text-[12.5px] font-extrabold text-[#EA580C] dark:text-orange-400 whitespace-nowrap">
              Term 2 Due 30 Sep
            </span>
          </div>
        </motion.div>

        {/* Card 4: Overdue Fees */}
        <motion.div
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] p-5 bg-gradient-to-br from-white via-white to-[#FFF1F2]/70 dark:from-[#07142F] dark:via-[#220B11] dark:to-[#380E18] border border-rose-100/90 dark:border-white/10 shadow-[0_4px_20px_rgba(244,63,94,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(244,63,94,0.14)] transition-all duration-300 min-h-[148px] flex flex-col justify-between group cursor-pointer"
        >

          <div className="relative z-10 flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFE4E6] to-[#FECDD3] dark:from-rose-950/60 dark:to-rose-900/40 p-[2.5px] shadow-sm shadow-rose-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#F43F5E] to-[#E11D48] flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-5 h-5 text-white stroke-[2.4]" />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="relative z-10 mt-3 min-w-0">
            <div className="text-[28px] sm:text-[32px] font-black text-[#000E28] dark:text-white tracking-tight leading-none font-sans">
              ₹0
            </div>
            <div className="text-[15px] sm:text-[16px] font-bold text-[#001D4A] dark:text-blue-100 tracking-tight leading-tight mt-1.5 whitespace-nowrap">
              Overdue Fees
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[12px] sm:text-[12.5px] font-extrabold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              All accounts current
            </span>
          </div>
        </motion.div>
      </div>

      {/* Pending Invoices List */}
      <SpotlightCard className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-[#000E28] dark:text-white">Fee Invoices & Statements</h2>
            <p className="text-xs text-slate-500">Select any invoice to inspect itemization or complete online settlement.</p>
          </div>
        </div>

        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB]">
                    {inv.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#000E28] dark:text-white">
                    {inv.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Due Date: <strong className="text-[#000E28] dark:text-white">{inv.dueDate}</strong> • Invoice ID: {inv.id}
                </p>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <span className="text-base font-black text-[#000E28] dark:text-white">
                  ₹{inv.amount.toLocaleString()}
                </span>

                {inv.status === "Pending" ? (
                  <button
                    onClick={() => openPayModal(inv)}
                    className="px-4 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0040A5] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Pay Now
                  </button>
                ) : (
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </SpotlightCard>

      {/* Payment History & Receipts */}
      <SpotlightCard className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h2 className="text-base font-bold text-[#000E28] dark:text-white">Verified Payment Receipts</h2>
            <p className="text-xs text-slate-500">Download official receipts for tax benefits (Section 80C) and family records.</p>
          </div>

          <Link
            href="/parent/documents"
            className="text-xs font-bold text-[#0050CB] hover:underline flex items-center gap-1.5 self-start sm:self-center"
          >
            <span>Document Vault</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4">Receipt Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Payment Channel</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paymentHistory.map((rec, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono font-bold text-[#0050CB]">{rec.receiptNo}</td>
                  <td className="py-3 px-4 text-slate-500">{rec.date}</td>
                  <td className="py-3 px-4 font-bold text-[#000E28] dark:text-white">{rec.description}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{rec.mode}</td>
                  <td className="py-3 px-4 font-black text-emerald-600">₹{rec.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDownloadReceipt(rec.receiptNo, rec.amount)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#0050CB] text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      {/* Payment Modal */}
      <FeePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        defaultInvoice={selectedInvoice}
        childName={`${child.firstName} ${child.lastName}`}
        onPaymentSuccess={() => {
          fetchFees();
        }}
      />
    </div>
  );
}
