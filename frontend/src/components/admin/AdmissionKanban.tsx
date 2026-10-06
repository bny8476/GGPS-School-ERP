"use client";

import React from 'react';
import { 
  Phone, 
  User, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight,
  Eye,
  Calendar,
  AlertCircle
} from 'lucide-react';

export interface AdmissionApplication {
  _id: string;
  applicationNumber?: string;
  enquiryReference?: string;
  childFirstName: string;
  childMiddleName?: string;
  childLastName: string;
  dateOfBirth?: string;
  gender?: string;
  parentName: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  parentPhone?: string;
  contactNumber?: string;
  parentEmail?: string;
  email?: string;
  address?: string;
  gradeAppliedFor?: string;
  academicYear?: string;
  status: string;
  stage: string;
  documents?: Array<{
    name: string;
    url?: string;
    status: 'Pending' | 'Uploaded' | 'Under Review' | 'Verified' | 'Rejected';
    remarks?: string;
    verifiedAt?: string;
    verifiedBy?: string;
  }>;
  feeStatus?: 'Pending' | 'Partial' | 'Paid' | 'Refunded';
  feeAmount?: number;
  feePaid?: number;
  paymentMethod?: string;
  receiptNumber?: string;
  medicalNotes?: string;
  previousSchool?: string;
  previousClass?: string;
  previousAcademicYear?: string;
  tcAvailable?: boolean;
  notes?: string;
  source?: string;
  studentId?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface AdmissionKanbanProps {
  applications: AdmissionApplication[];
  onStatusChange?: (id: string, newStatus: string) => void;
  onStageChange?: (id: string, newStage: string) => void;
  onSelectApplication?: (app: AdmissionApplication) => void;
  onVerifyDocs?: (app: AdmissionApplication) => void;
  onRecordFee?: (app: AdmissionApplication) => void;
  onConfirmAdmission?: (app: AdmissionApplication) => void;
}

export const KANBAN_STAGES = [
  { id: 'Enquiry', title: '1. Enquiry', badge: 'bg-blue-50 text-[#0050CB] border-blue-200 dark:bg-blue-950/40 dark:text-blue-300', dot: 'bg-[#0050CB]' },
  { id: 'Application', title: '2. Application', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300', dot: 'bg-indigo-600' },
  { id: 'Documents', title: '3. Documents', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300', dot: 'bg-cyan-600' },
  { id: 'Assessment', title: '4. Assessment', badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300', dot: 'bg-amber-500' },
  { id: 'Interview', title: '5. Interview', badge: 'bg-orange-50 text-[#FF690C] border-orange-200 dark:bg-orange-950/40 dark:text-orange-300', dot: 'bg-[#FF690C]' },
  { id: 'Review', title: '6. Review', badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300', dot: 'bg-purple-600' },
  { id: 'Approved', title: '7. Approved', badge: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300', dot: 'bg-teal-600' },
  { id: 'Fee Pending', title: '8. Fee Pending', badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300', dot: 'bg-rose-500' },
  { id: 'Confirmed', title: '9. Confirmed', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300', dot: 'bg-emerald-600' },
];

export function getApplicationStage(app: AdmissionApplication): string {
  if (app.stage && KANBAN_STAGES.some(s => s.id.toLowerCase() === app.stage.toLowerCase())) {
    const match = KANBAN_STAGES.find(s => s.id.toLowerCase() === app.stage.toLowerCase());
    if (match) return match.id;
  }
  if (app.status === 'Admission Confirmed' || app.status === 'Confirmed' || app.stage === 'Enrolled') return 'Confirmed';
  if (app.status === 'Offer Issued' || app.status === 'Approved') return 'Approved';
  if (app.feeStatus === 'Pending' && (app.status === 'Approved' || app.stage === 'Approved')) return 'Fee Pending';
  if (app.status === 'Demo Class Scheduled' || app.status === 'Interview Scheduled') return 'Interview';
  if (app.status === 'Assessment Pending' || app.status === 'Entrance Assessment') return 'Assessment';
  if (app.status === 'Documents Pending' || app.status === 'Document Verification') return 'Documents';
  if (app.status === 'Under Review' || app.status === 'Interested') return 'Review';
  if (app.status === 'Application Received' || app.status === 'Submitted' || app.status === 'Draft') return 'Application';
  if (app.status === 'New Inquiry' || app.status === 'New' || app.status === 'Follow-up Pending') return 'Enquiry';
  return 'Application';
}

export default function AdmissionKanban({
  applications,
  onStatusChange,
  onStageChange,
  onSelectApplication,
  onVerifyDocs,
  onRecordFee,
  onConfirmAdmission,
}: AdmissionKanbanProps) {
  const handleMove = (id: string, newStage: string) => {
    if (onStageChange) {
      onStageChange(id, newStage);
    } else if (onStatusChange) {
      onStatusChange(id, newStage);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1 custom-scrollbar min-w-full items-start">
      {KANBAN_STAGES.map((col, idx) => {
        const columnApps = applications.filter((app) => getApplicationStage(app) === col.id);
        const nextStage = idx < KANBAN_STAGES.length - 1 ? KANBAN_STAGES[idx + 1].id : null;

        return (
          <div
            key={col.id}
            className="flex-1 min-w-[290px] max-w-[340px] shrink-0 flex flex-col bg-slate-50/80 dark:bg-[#07152F]/70 rounded-[22px] border border-slate-200/80 dark:border-slate-800 p-3.5 max-h-[82vh]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800 px-1 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h3 className="text-xs font-black text-[#000E28] dark:text-white uppercase tracking-wider">
                  {col.title}
                </h3>
              </div>
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${col.badge}`}>
                {columnApps.length}
              </span>
            </div>

            {/* Column Cards (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {columnApps.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-600 text-xs font-medium border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl p-4">
                  No applicants in {col.id}
                </div>
              ) : (
                columnApps.map((app) => {
                  const phone = app.contactNumber || app.parentPhone;
                  const allDocsVerified = app.documents && app.documents.length > 0 && app.documents.every(d => d.status === 'Verified');
                  const hasPendingDocs = app.documents && app.documents.some(d => d.status === 'Pending' || d.status === 'Rejected');

                  return (
                    <div
                      key={app._id}
                      className="bg-white dark:bg-[#0B1F3A] rounded-2xl p-4 border border-[#E6EAF2] dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-[#0050CB]/40 dark:hover:border-[#0050CB]/50 transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top Bar: Grade Badge + Application Number */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E5EEFF] dark:bg-[#0050CB]/30 text-[#0050CB] dark:text-[#E5EEFF]">
                            Class {app.gradeAppliedFor || 'LKG'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold truncate max-w-[140px]" title={app.applicationNumber}>
                            {app.applicationNumber || 'APP-2026'}
                          </span>
                        </div>

                        {/* Applicant Name */}
                        <h4 
                          onClick={() => onSelectApplication?.(app)}
                          className="text-sm font-black text-[#000E28] dark:text-white group-hover:text-[#0050CB] dark:group-hover:text-[#38BDF8] transition-colors cursor-pointer flex items-center justify-between"
                        >
                          <span>{app.childFirstName} {app.childLastName !== '-' ? app.childLastName : ''}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0050CB] transition-colors shrink-0" />
                        </h4>

                        {/* Parent & Contact */}
                        <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{app.parentName || 'Parent'}</span>
                          </div>
                          {phone && (
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-[#FF690C] shrink-0" />
                              <span>{phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Status Badges Row (Docs & Fee) */}
                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                          {col.id === 'Documents' && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${allDocsVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {allDocsVerified ? '✓ All Docs Verified' : 'Docs Review Required'}
                            </span>
                          )}

                          {(col.id === 'Approved' || col.id === 'Fee Pending' || col.id === 'Confirmed') && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${app.feeStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              Fee: {app.feeStatus === 'Paid' ? 'Paid (₹25,000)' : 'Pending Due'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                        {/* Specific Stage Helper CTA */}
                        {col.id === 'Documents' && onVerifyDocs && (
                          <button
                            type="button"
                            onClick={() => onVerifyDocs(app)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify Documents</span>
                          </button>
                        )}

                        {col.id === 'Fee Pending' && onRecordFee && (
                          <button
                            type="button"
                            onClick={() => onRecordFee(app)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Record Fee Payment</span>
                          </button>
                        )}

                        {col.id === 'Approved' && onConfirmAdmission && (
                          <button
                            type="button"
                            onClick={() => onConfirmAdmission(app)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Admission</span>
                          </button>
                        )}

                        {/* Stage Transition Selector & Quick Advance */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={col.id}
                            onChange={(e) => handleMove(app._id, e.target.value)}
                            className="text-[11px] font-bold py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#000E28] dark:text-slate-200 cursor-pointer focus:outline-none flex-1 min-w-0"
                          >
                            {KANBAN_STAGES.map((c) => (
                              <option key={c.id} value={c.id}>
                                Move: {c.title}
                              </option>
                            ))}
                          </select>

                          {nextStage && (
                            <button
                              type="button"
                              onClick={() => handleMove(app._id, nextStage)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#0050CB] hover:text-white text-slate-600 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
                              title={`Advance to ${nextStage}`}
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
