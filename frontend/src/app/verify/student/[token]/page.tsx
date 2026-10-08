"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  GraduationCap,
  Calendar,
  Building2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Clock,
  UserCheck
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/utils";
import AppImage from "@/components/ui/AppImage";

interface VerificationData {
  studentName: string;
  studentId: string;
  admissionNumber: string;
  className: string;
  photoUrl?: string;
  cardNumber: string;
  validFrom: string;
  validTill: string;
  schoolName: string;
  schoolTagline?: string;
  schoolAddress?: string;
  issuedAt?: string;
  revocationReason?: string;
}

export default function StudentIdVerificationPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"ACTIVE" | "EXPIRED" | "REVOKED" | "NOT_FOUND">("ACTIVE");
  const [data, setData] = useState<VerificationData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const verifyCard = async () => {
      try {
        setLoading(true);
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/api/v1/id-cards/verify/${token}`);
        const json = await res.json();

        if (res.ok && json.success && json.data) {
          setIsValid(json.isValid);
          setStatus(json.status);
          setData(json.data);
        } else {
          setIsValid(false);
          setStatus(json.status || "NOT_FOUND");
          setErrorMessage(json.message || "Invalid or unrecognized student ID card token.");
        }
      } catch (err: any) {
        setIsValid(false);
        setStatus("NOT_FOUND");
        setErrorMessage("Network error verifying ID card credentials.");
      } finally {
        setLoading(false);
      }
    };

    verifyCard();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#000E28] text-slate-800 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-xl w-full mx-auto my-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-900/40">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Credential Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight">
            GGPS School
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Official student identity verification portal
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-[#07152F] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#0050CB] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Validating digital signature &amp; student record...
            </p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && status === "NOT_FOUND" && (
          <div className="bg-white dark:bg-[#07152F] rounded-3xl p-8 border border-rose-200 dark:border-rose-900/60 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-rose-700 dark:text-rose-400">
              Invalid or Unregistered ID Card
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {errorMessage || "The scanned QR code does not correspond to an authentic student record issued by GGPS School."}
            </p>
            <div className="pt-2">
              <span className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                TOKEN: {token}
              </span>
            </div>
          </div>
        )}

        {/* Valid / Expired / Revoked Card View */}
        {!loading && data && (
          <div className="bg-white dark:bg-[#07152F] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Status Banner */}
            <div
              className={`p-4 sm:p-5 text-white flex items-center justify-between ${
                status === "ACTIVE"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700"
                  : status === "EXPIRED"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600"
                  : "bg-gradient-to-r from-rose-600 to-red-700"
              }`}
            >
              <div className="flex items-center gap-3">
                {status === "ACTIVE" && <CheckCircle2 className="w-6 h-6 shrink-0" />}
                {status === "EXPIRED" && <AlertTriangle className="w-6 h-6 shrink-0" />}
                {status === "REVOKED" && <XCircle className="w-6 h-6 shrink-0" />}
                <div>
                  <h3 className="font-black text-sm sm:text-base tracking-wide uppercase">
                    {status === "ACTIVE" && "Official ID Verified • Active"}
                    {status === "EXPIRED" && "Expired Student ID"}
                    {status === "REVOKED" && "Revoked Student ID"}
                  </h3>
                  <p className="text-[11px] sm:text-xs opacity-90 font-medium">
                    {status === "ACTIVE" && "This ID card is valid, genuine, and active."}
                    {status === "EXPIRED" && "The validity period for this ID card has ended."}
                    {status === "REVOKED" && `Reason: ${data.revocationReason || "Cancelled by school administrator"}`}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs">
                {status}
              </span>
            </div>

            {/* Student Info Card */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
                {/* Photo */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border-2 border-[#0050CB]/30 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                  <AppImage
                    src={data.photoUrl}
                    alt={data.studentName}
                    fallbackType="avatar"
                    name={data.studentName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white truncate">
                    {data.studentName}
                  </h2>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    Class {data.className}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    Card No: {data.cardNumber}
                  </p>
                </div>
              </div>

              {/* Credential Data Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Student ID
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {data.studentId || "-"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Admission Number
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {data.admissionNumber || "-"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Valid From
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {data.validFrom ? new Date(data.validFrom).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Valid Till
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {data.validTill ? new Date(data.validTill).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                  </span>
                </div>
              </div>

              {/* School Details */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#000E28] dark:text-white">
                  <Building2 className="w-4 h-4 text-[#0050CB]" />
                  <span>{data.schoolName}</span>
                </div>
                {data.schoolAddress && (
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                    {data.schoolAddress}
                  </p>
                )}
              </div>

              {/* Security Warning */}
              <div className="pt-2 text-center text-[11px] text-slate-400 leading-normal border-t border-slate-100 dark:border-slate-800">
                🔒 Cryptographically signed digital credential issued by GGPS School. For verification queries, contact{" "}
                <span className="font-semibold text-slate-600 dark:text-slate-300">admissions@ggps.edu</span>.
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} GGPS School. All rights reserved.
        </div>
      </div>
    </div>
  );
}
