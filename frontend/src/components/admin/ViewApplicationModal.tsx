"use client";

import React from "react";
import { 
  X, 
  FileText, 
  User, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { AdmissionApplication } from "@/components/admin/AdmissionKanban";

interface ViewApplicationModalProps {
  isOpen: boolean;
  application: AdmissionApplication | null;
  onClose: () => void;
  onVerifyDocs?: (app: AdmissionApplication) => void;
  onRecordFee?: (app: AdmissionApplication) => void;
  onConfirmAdmission?: (app: AdmissionApplication) => void;
}

export default function ViewApplicationModal({
  isOpen,
  application,
  onClose,
  onVerifyDocs,
  onRecordFee,
  onConfirmAdmission,
}: ViewApplicationModalProps) {
  if (!isOpen || !application) return null;

  const phone = application.contactNumber || application.parentPhone;
  const email = application.email || application.parentEmail;
  const totalFee = application.feeAmount || 25000;
  const feePaid = application.feePaid || 0;
  const balanceDue = Math.max(0, totalFee - feePaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl my-8 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#001438]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0050CB] to-[#002772] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              {application.childFirstName?.[0] || "A"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#000E28] dark:text-white">
                  {application.childFirstName} {application.childLastName !== '-' ? application.childLastName : ''}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] font-mono">
                  {application.applicationNumber || "APP-2026"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Grade: <strong className="text-slate-700 dark:text-slate-300">Class {application.gradeAppliedFor || "LKG"}</strong> • Academic Year: {application.academicYear || "2026–2027"}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs">
          {/* Status Row */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#07152F]/40 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Pipeline Stage</span>
              <span className="font-bold text-[#0050CB] text-xs mt-0.5 block">{application.stage || "Application"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Document Status</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs mt-0.5 block">
                {application.documents?.every(d => d.status === 'Verified') ? '✓ Verified' : 'In Review / Pending'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Fee Status</span>
              <span className={`font-bold text-xs mt-0.5 block ${application.feeStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {application.feeStatus === 'Paid' ? '✓ Fully Paid' : `Due (₹${balanceDue.toLocaleString('en-IN')})`}
              </span>
            </div>
          </div>

          {/* Child Information */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#000E28] dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <User className="w-3.5 h-3.5 text-[#0050CB]" />
              <span>Child Information</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#07152F]">
              <div>
                <span className="text-slate-400 block text-[10px]">Full Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{application.childFirstName} {application.childLastName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {application.dateOfBirth ? new Date(application.dateOfBirth).toLocaleDateString("en-GB") : "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Gender</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{application.gender || "Other"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Class Applied</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Class {application.gradeAppliedFor || "LKG"}</span>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#000E28] dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Users className="w-3.5 h-3.5 text-[#0050CB]" />
              <span>Parent / Guardian Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#07152F]">
              <div>
                <span className="text-slate-400 block text-[10px]">Primary Contact</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{application.parentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Phone Number</span>
                <span className="font-bold font-mono text-[#0050CB]">{phone || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Email Address</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{email || "N/A"}</span>
              </div>
              {application.address && (
                <div className="sm:col-span-3">
                  <span className="text-slate-400 block text-[10px]">Address</span>
                  <span className="text-slate-700 dark:text-slate-300">{application.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Academic & Prior School */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#000E28] dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <GraduationCap className="w-3.5 h-3.5 text-[#0050CB]" />
              <span>Prior Academic Records</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#07152F]">
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[10px]">Previous School</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{application.previousSchool || "Fresher / First School"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Previous Class</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{application.previousClass || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Transfer Certificate</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{application.tcAvailable ? "✓ Available" : "Not Provided"}</span>
              </div>
            </div>
          </div>

          {/* Documents Checklist */}
          {application.documents && application.documents.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-[#000E28] dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0050CB]" />
                <span>Submitted Documents ({application.documents.length})</span>
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#07152F]">
                {application.documents.map((d: any, idx: number) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{d.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {d.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Medical */}
          {(application.medicalNotes || application.notes) && (
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#07152F]/30 space-y-1.5">
              {application.medicalNotes && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-slate-200">Medical Notes:</strong> {application.medicalNotes}
                </p>
              )}
              {application.notes && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-slate-200">Internal Notes:</strong> {application.notes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer with Quick Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#001438]/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-bold"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {onVerifyDocs && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerifyDocs(application);
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Docs</span>
              </button>
            )}

            {onRecordFee && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordFee(application);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Fee</span>
              </button>
            )}

            {onConfirmAdmission && application.status !== "Admission Confirmed" && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmAdmission(application);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Admission</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
