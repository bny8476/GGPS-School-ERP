"use client";

import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  GraduationCap, 
  User, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  FileCheck,
  ArrowRight,
  Printer,
  Copy
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/apiClient";
import { AdmissionApplication } from "@/components/admin/AdmissionKanban";

interface ConfirmAdmissionModalProps {
  isOpen: boolean;
  application: AdmissionApplication | null;
  onClose: () => void;
  onSuccess: (result?: any) => void;
}

interface ApprovalResult {
  student: any;
  enrollment: any;
  admissionNumber: string;
  rollNumber: string;
  parent: any;
}

export default function ConfirmAdmissionModal({
  isOpen,
  application,
  onClose,
  onSuccess,
}: ConfirmAdmissionModalProps) {
  if (!isOpen || !application) return null;

  const [sectionName, setSectionName] = useState<string>("A");
  const [isApproving, setIsApproving] = useState(false);
  const [approvalResult, setApprovalResult] = useState<ApprovalResult | null>(null);

  const handleConfirm = async () => {
    setIsApproving(true);
    try {
      const res: any = await apiClient.post(`/api/admissions/${application._id}/approve`, {
        sectionName,
      });

      setApprovalResult(res);
      toast.success(
        `Admission Confirmed! Admission No: ${res?.admissionNumber || res?.student?.admissionNumber || "Generated"}`
      );
      onSuccess(res);
    } catch (err: any) {
      console.error("Admission approval error", err);
      toast.error(err.message || "Failed to confirm admission. Please check requirements.");
    } finally {
      setIsApproving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl my-8 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#001438]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#000E28] dark:text-white">
                Final Admission Confirmation
              </h3>
              <p className="text-xs text-slate-500">
                Converts prospective applicant into officially enrolled student.
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

        {/* Modal Content */}
        {!approvalResult ? (
          <div className="p-6 space-y-4 text-xs">
            {/* Candidate Summary Box */}
            <div className="p-4 rounded-xl border border-[#0050CB]/20 bg-[#E5EEFF]/40 dark:bg-[#0050CB]/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-[#000E28] dark:text-white">
                    {application.childFirstName} {application.childLastName}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Grade: Class {application.gradeAppliedFor || "LKG"} • Academic Year: {application.academicYear || "2026–2027"}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-[10px]">
                  Ready for Enrollment
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#0050CB]/10 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Parent / Guardian:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{application.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Phone:</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{application.contactNumber || application.parentPhone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Seat Fee Status:</span>
                  <span className={`font-bold ${application.feeStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                    {application.feeStatus === "Paid" ? "✓ Fully Paid (₹25,000)" : `Deposit ${application.feeStatus || "Pending"}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Application Ref:</span>
                  <span className="font-bold font-mono text-[#0050CB]">{application.applicationNumber || "APP-2026"}</span>
                </div>
              </div>
            </div>

            {/* Section Assignment & Rules */}
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Classroom Section <span className="text-[#FF690C]">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["A", "B", "C", "D"].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSectionName(sec)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        sectionName === sec
                          ? "bg-[#0050CB] text-white border-[#0050CB] shadow-xs"
                          : "bg-slate-50 dark:bg-[#07152F] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      Section {sec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#07152F]/50 space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                  Automated Backend Actions on Confirmation:
                </span>
                <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
                  <li>Generate unique sequential Admission Number (e.g. <span className="font-mono text-[#0050CB]">GGPS2026Admin001</span>)</li>
                  <li>Generate official Student ID & Roll Number for Class {application.gradeAppliedFor || "LKG"} (Sec {sectionName})</li>
                  <li>Create Student record & link Parent User portal credentials</li>
                  <li>Create active Enrollment for the 2026–2027 academic session</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isApproving ? (
                  <span>Generating Enrollment...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Enroll Student</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Enrollment Success Certificate Card */
          <div className="p-6 space-y-5 text-center text-xs animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/15">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h4 className="text-base font-black text-[#000E28] dark:text-white">
                Admission Officially Confirmed!
              </h4>
              <p className="text-slate-500 mt-1">
                Student and Parent records have been created in the school database.
              </p>
            </div>

            {/* Key Generated Credentials Grid */}
            <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Admission Number</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-black text-slate-900 dark:text-white font-mono text-sm">
                    {approvalResult.admissionNumber || approvalResult.student?.admissionNumber || "ADM-2026"}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(approvalResult.admissionNumber || approvalResult.student?.admissionNumber || "")}
                    className="p-1 rounded text-slate-400 hover:text-slate-700"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Student ID</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-black text-[#0050CB] font-mono text-sm">
                    {approvalResult.student?.studentId || "GGPS2026LKG001"}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(approvalResult.student?.studentId || "")}
                    className="p-1 rounded text-slate-400 hover:text-slate-700"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Roll Number</span>
                <span className="font-black text-slate-800 dark:text-slate-200 font-mono text-xs block mt-0.5">
                  {approvalResult.rollNumber || approvalResult.student?.rollNumber || "001"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Class & Section</span>
                <span className="font-black text-slate-800 dark:text-slate-200 text-xs block mt-0.5">
                  Class {application.gradeAppliedFor || "LKG"} (Sec {sectionName})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold transition-all shadow-xs cursor-pointer"
              >
                Done & Return to Admissions Desk
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
