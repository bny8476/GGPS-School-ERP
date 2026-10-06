"use client";

import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Eye, 
  User, 
  Check,
  Save,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/apiClient";
import { AdmissionApplication } from "@/components/admin/AdmissionKanban";

interface DocumentVerificationModalProps {
  isOpen: boolean;
  application: AdmissionApplication | null;
  onClose: () => void;
  onSuccess: (updatedApp: AdmissionApplication) => void;
}

interface DocItem {
  name: string;
  url?: string;
  status: "Pending" | "Uploaded" | "Under Review" | "Verified" | "Rejected";
  remarks?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

const DEFAULT_DOCUMENTS = [
  "Birth Certificate",
  "Parent ID Proof (Aadhaar / Passport)",
  "Address Proof (Utility Bill / Rent Agreement)",
  "Previous School Records / Report Card",
  "Transfer Certificate (TC)",
];

export default function DocumentVerificationModal({
  isOpen,
  application,
  onClose,
  onSuccess,
}: DocumentVerificationModalProps) {
  if (!isOpen || !application) return null;

  // Initialize doc items from application.documents or default list
  const initialDocs: DocItem[] = React.useMemo(() => {
    const existing = application.documents || [];
    const docMap = new Map<string, DocItem>();
    existing.forEach((d: any) => {
      docMap.set(d.name, {
        name: d.name,
        url: d.url,
        status: (d.status as any) || "Pending",
        remarks: d.remarks || "",
        verifiedAt: d.verifiedAt,
        verifiedBy: d.verifiedBy,
      });
    });

    return DEFAULT_DOCUMENTS.map((name) => {
      if (docMap.has(name)) return docMap.get(name)!;
      return {
        name,
        status: "Pending",
        remarks: "",
      };
    });
  }, [application]);

  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [rejectPromptDoc, setRejectPromptDoc] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleVerify = (docName: string) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.name === docName
          ? {
              ...d,
              status: "Verified",
              remarks: "Verified by Admissions Officer",
              verifiedAt: new Date().toISOString(),
              verifiedBy: "Admissions Officer",
            }
          : d
      )
    );
    toast.success(`${docName} marked as Verified`);
  };

  const handleOpenReject = (docName: string) => {
    setRejectPromptDoc(docName);
    setRejectReason("");
  };

  const handleConfirmReject = () => {
    if (!rejectPromptDoc) return;
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }

    setDocs((prev) =>
      prev.map((d) =>
        d.name === rejectPromptDoc
          ? {
              ...d,
              status: "Rejected",
              remarks: rejectReason.trim(),
              verifiedAt: new Date().toISOString(),
              verifiedBy: "Admissions Officer",
            }
          : d
      )
    );
    toast.error(`${rejectPromptDoc} marked as Rejected`);
    setRejectPromptDoc(null);
    setRejectReason("");
  };

  const handleSaveAll = async (advanceStage?: boolean) => {
    setIsSaving(true);
    try {
      const allVerified = docs.every((d) => d.status === "Verified");
      const nextStage = advanceStage && allVerified ? "Assessment" : application.stage;

      const payload: any = {
        documents: docs,
      };

      if (advanceStage && allVerified) {
        payload.stage = "Assessment";
        payload.status = "Assessment Pending";
      }

      const res: any = await apiClient.put(`/api/admissions/${application._id}`, payload);
      toast.success(
        advanceStage
          ? "Documents updated and advanced to Entrance Assessment!"
          : "Document verification saved successfully"
      );
      onSuccess(res);
      onClose();
    } catch (err: any) {
      console.error("Save doc verification failed", err);
      toast.error(err.message || "Failed to update document statuses");
    } finally {
      setIsSaving(false);
    }
  };

  const verifiedCount = docs.filter((d) => d.status === "Verified").length;
  const pendingCount = docs.filter((d) => d.status === "Pending" || d.status === "Uploaded" || d.status === "Under Review").length;
  const rejectedCount = docs.filter((d) => d.status === "Rejected").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl my-8 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#001438]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#000E28] dark:text-white">
                  Document Verification Desk
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] font-bold">
                  {application.applicationNumber || "APP-2026"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Applicant: <strong className="text-slate-800 dark:text-slate-200">{application.childFirstName} {application.childLastName}</strong> (Class {application.gradeAppliedFor || "LKG"}) • Parent: {application.parentName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Summary Counters */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-[#07152F]/40 text-center py-2.5 text-xs">
          <div>
            <span className="text-emerald-600 font-bold block text-sm">{verifiedCount} / {docs.length}</span>
            <span className="text-slate-400 text-[11px]">Verified</span>
          </div>
          <div>
            <span className="text-amber-600 font-bold block text-sm">{pendingCount}</span>
            <span className="text-slate-400 text-[11px]">Pending / Under Review</span>
          </div>
          <div>
            <span className="text-rose-600 font-bold block text-sm">{rejectedCount}</span>
            <span className="text-slate-400 text-[11px]">Rejected</span>
          </div>
        </div>

        {/* Document Checklist Body */}
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1 text-xs">
          <div className="space-y-3">
            {docs.map((doc) => {
              const statusColors: Record<string, string> = {
                Verified: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
                Rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
                Pending: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
                Uploaded: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
                "Under Review": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
              };

              return (
                <div
                  key={doc.name}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#07152F] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {doc.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[doc.status] || "bg-slate-100"}`}>
                        {doc.status}
                      </span>
                    </div>

                    {doc.remarks && (
                      <p className={`text-[11px] pl-6 ${doc.status === "Rejected" ? "text-rose-600 font-semibold" : "text-slate-500"}`}>
                        {doc.status === "Rejected" ? "Rejection Reason: " : "Remarks: "}
                        {doc.remarks}
                      </p>
                    )}

                    {doc.verifiedAt && (
                      <p className="text-[10px] text-slate-400 pl-6">
                        Updated: {new Date(doc.verifiedAt).toLocaleDateString("en-GB")} by {doc.verifiedBy || "Staff"}
                      </p>
                    )}
                  </div>

                  {/* Document Row Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleVerify(doc.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        doc.status === "Verified"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReject(doc.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        doc.status === "Rejected"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inline Rejection Reason Modal/Dialog */}
          {rejectPromptDoc && (
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Specify Rejection Reason for {rejectPromptDoc}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setRejectPromptDoc(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Blurry scan, certificate not issued by competent authority, mismatched birth date..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#000E28] border border-rose-300 dark:border-rose-800 text-xs text-slate-800 dark:text-white resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectPromptDoc(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#001438]/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-bold"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveAll(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#07152F] text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>

            {verifiedCount === docs.length && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveAll(true)}
                className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Advance to Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
