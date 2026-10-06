"use client";

import React, { useState } from "react";
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  Receipt, 
  IndianRupee, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/apiClient";
import { AdmissionApplication } from "@/components/admin/AdmissionKanban";

interface FeePaymentModalProps {
  isOpen: boolean;
  application: AdmissionApplication | null;
  onClose: () => void;
  onSuccess: (updatedApp: AdmissionApplication) => void;
}

export default function FeePaymentModal({
  isOpen,
  application,
  onClose,
  onSuccess,
}: FeePaymentModalProps) {
  if (!isOpen || !application) return null;

  const totalFee = application.feeAmount || 25000;
  const currentPaid = application.feePaid || 0;
  const balanceDue = Math.max(0, totalFee - currentPaid);

  const [paymentAmount, setPaymentAmount] = useState<number>(balanceDue > 0 ? balanceDue : totalFee);
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [receiptNumber, setReceiptNumber] = useState<string>(
    application.receiptNumber || `GGPS-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState<string>("Seat confirmation tuition deposit");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const newTotalPaid = currentPaid + paymentAmount;
      let newFeeStatus: "Pending" | "Partial" | "Paid" = "Pending";
      if (newTotalPaid >= totalFee) {
        newFeeStatus = "Paid";
      } else if (newTotalPaid > 0) {
        newFeeStatus = "Partial";
      }

      const payload: any = {
        feeAmount: totalFee,
        feePaid: newTotalPaid,
        feeStatus: newFeeStatus,
        paymentMethod,
        receiptNumber: receiptNumber.trim(),
      };

      // If fee is fully paid and currently in Fee Pending stage, can update stage to Approved or Fee Paid
      if (newFeeStatus === "Paid" && (application.stage === "Fee Pending" || application.status === "Fee Pending")) {
        payload.stage = "Approved";
        payload.status = "Approved";
      }

      const res: any = await apiClient.put(`/api/admissions/${application._id}`, payload);
      toast.success(`Payment of ₹${paymentAmount.toLocaleString("en-IN")} recorded! Receipt: ${receiptNumber}`);
      onSuccess(res);
      onClose();
    } catch (err: any) {
      console.error("Record payment failed", err);
      toast.error(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg my-8 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#001438]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#000E28] dark:text-white">
                Record Admission Fee Payment
              </h3>
              <p className="text-xs text-slate-500">
                Official school deposit for seat allocation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Applicant & Balance Overview Card */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-[#E5EEFF]/30 dark:bg-[#001438]/30 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-black text-[#000E28] dark:text-white text-sm">
                {application.childFirstName} {application.childLastName}
              </h4>
              <p className="text-slate-500 text-[11px]">
                Class {application.gradeAppliedFor || "LKG"} • App #{application.applicationNumber || "APP-2026"}
              </p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200">
              {application.feeStatus || "Pending"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-white dark:bg-[#000E28] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Admission Fee</span>
              <span className="font-black text-slate-800 dark:text-slate-200 font-mono text-xs">
                ₹{totalFee.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#000E28] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Paid So Far</span>
              <span className="font-black text-emerald-600 font-mono text-xs">
                ₹{currentPaid.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#000E28] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Balance Due</span>
              <span className="font-black text-rose-600 font-mono text-xs">
                ₹{balanceDue.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Amount to Collect (₹) <span className="text-[#FF690C]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min={1}
                max={balanceDue > 0 ? balanceDue : totalFee}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full h-10 pl-7 pr-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono text-[#000E28] dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Mode <span className="text-[#FF690C]">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#000E28] dark:text-white"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="Net Banking">Net Banking / NEFT / RTGS</option>
                <option value="Debit Card">Debit / Credit Card</option>
                <option value="Cash">Cash Deposit</option>
                <option value="Cheque">Cheque</option>
                <option value="Demand Draft">Demand Draft</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Receipt / Transaction Reference Number <span className="text-[#FF690C]">*</span>
            </label>
            <input
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="e.g. REC-2026-ADM-0042"
              className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-[#000E28] dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Transaction Notes
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Bank name, cheque number, or parent notes..."
              className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Processing..." : `Record ₹${paymentAmount.toLocaleString("en-IN")} Payment`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
