"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Download, Printer, ShieldCheck, CheckCircle2, 
  ExternalLink, CreditCard, RefreshCw, AlertCircle, Sparkles, Eye
} from "lucide-react";
import toast from "react-hot-toast";
import QRCode from "qrcode";
import GGPSLogo from "@/components/parent/GGPSLogo";
import { authFetch } from "@/lib/apiClient";
import { getApiBaseUrl } from "@/lib/utils";
import AppImage from "@/components/ui/AppImage";

interface IdCardParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: {
    _id: string;
    firstName: string;
    lastName: string;
    admissionNumber?: string;
    grade?: string;
    section?: string;
    rollNumber?: string;
    studentPhoto?: string;
    bloodGroup?: string;
  };
}

export default function IdCardParentModal({ isOpen, onClose, child }: IdCardParentModalProps) {
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [idCard, setIdCard] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !child) return;

    let isMounted = true;
    const fetchIdCard = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const apiBase = getApiBaseUrl();
        
        // Try querying by child._id first
        let res = await authFetch(`${apiBase}/api/v1/id-cards?studentId=${child._id}&status=active`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        let data = await res.json();
        let foundCard = data.data?.[0];

        // If not found by child._id, try query without studentId filter (backend will filter by parent's linked children)
        if (!foundCard) {
          res = await authFetch(`${apiBase}/api/v1/id-cards?status=active`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          data = await res.json();
          foundCard = data.data?.find((c: any) => 
            c.studentId?._id === child._id || 
            c.studentId?.admissionNumber === child.admissionNumber ||
            c.studentId?.firstName?.toLowerCase() === child.firstName?.toLowerCase()
          ) || data.data?.[0];
        }

        if (isMounted) {
          if (foundCard) {
            setIdCard(foundCard);
            // Generate QR code for verification URL
            const verifyUrl = `${window.location.origin}/verify/student/${foundCard.verificationToken}`;
            const qr = await QRCode.toDataURL(verifyUrl, {
              width: 256,
              margin: 1,
              color: { dark: "#000E28", light: "#FFFFFF" }
            });
            setQrDataUrl(qr);
          } else {
            setIdCard(null);
          }
        }
      } catch (err) {
        console.error("Failed to load active student ID card:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchIdCard();

    return () => {
      isMounted = false;
    };
  }, [isOpen, child]);

  if (!isOpen || !child) return null;

  const handleDownloadPDF = async () => {
    if (!idCard) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await authFetch(`${apiBase}/api/v1/id-cards/${idCard._id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error("Unable to download certified ID Card PDF.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GGPS-ID-Card-${idCard.studentId?.admissionNumber || idCard.cardNumber || "student"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Official ID Card downloaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const el = document.getElementById("id-card-printable-container");
    if (!el) {
      window.print();
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "210mm";
    iframe.style.height = "297mm";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      window.print();
      return;
    }
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GGPS_Student_ID_Card</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff !important; }
            .print-wrap { width: 340px; margin: 20px auto; }
          </style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #0050CB; font-size: 20px; font-weight: 800; margin: 0;">GGPS SCHOOL</h2>
            <p style="color: #64748B; font-size: 11px; margin: 3px 0 0 0;">Official Student Identity Card • CR80 PVC Standard</p>
          </div>
          <div class="print-wrap">${el.innerHTML}</div>
        </body>
      </html>
    `);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1500);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000E28]/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#07142F] shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col"
      >
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-[#07142F]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0050CB]/10 dark:bg-blue-900/40 text-[#0050CB] dark:text-blue-300 flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E5EEFF] text-[#0050CB] dark:bg-blue-950/60 dark:text-blue-300">
                  OFFICIAL IDENTITY CREDENTIAL
                </span>
                {idCard && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> ACTIVE
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#000E28] dark:text-white">
                Student Security ID Card &bull; {child.firstName} {child.lastName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-[#0050CB] animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                Fetching certified security ID card record...
              </p>
            </div>
          ) : !idCard ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-[#000E28]/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#000E28] dark:text-white">
                  No Active ID Card Record Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  The official PVC Student ID Card for {child.firstName} {child.lastName} is pending generation or renewal by the School Administration office.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#0050CB] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Return to Document Vault
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Side Switcher & Actions Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/80 dark:border-white/10">
                <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#07142F] rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <button
                    onClick={() => setActiveSide("front")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeSide === "front"
                        ? "bg-[#0050CB] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-[#0050CB]"
                    }`}
                  >
                    Front Side
                  </button>
                  <button
                    onClick={() => setActiveSide("back")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeSide === "back"
                        ? "bg-[#0050CB] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-[#0050CB]"
                    }`}
                  >
                    Back Side
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="px-4 py-2 bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloading ? "Downloading..." : "Download Official PDF"}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-2 bg-white dark:bg-[#07142F] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* PVC Card Display (Scaled exact standard proportions) */}
              <div id="id-card-printable-container" className="flex justify-center py-4 bg-gradient-to-b from-slate-100/70 to-slate-200/50 dark:from-[#000E28]/60 dark:to-[#000E28]/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                <AnimatePresence mode="wait">
                  {activeSide === "front" ? (
                    <motion.div
                      key="front"
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-[340px] h-[520px] rounded-[22px] bg-white text-[#000E28] shadow-2xl border-4 border-slate-100 overflow-hidden flex flex-col justify-between relative"
                    >
                      {/* Card Header Strip */}
                      <div className="bg-[#0050CB] text-white p-4 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                        <h3 className="text-base font-black tracking-tight leading-tight">GGPS SCHOOL</h3>
                        <p className="text-[10px] text-blue-100 font-medium">Learn &bull; Grow &bull; Succeed</p>
                        <p className="text-[9px] text-blue-200 font-mono mt-0.5">{idCard.cardNumber}</p>
                      </div>

                      {/* Photo + Core Details */}
                      <div className="p-4 flex flex-col items-center flex-1 justify-around text-center">
                        <div className="w-24 h-28 rounded-xl border-2 border-[#0050CB] overflow-hidden bg-slate-100 shadow-md">
                          <AppImage
                            src={idCard.studentId?.studentPhoto || idCard.photoUrl || child.studentPhoto || "/aarav-hero-student.jpg"}
                            alt={child.firstName}
                            fallbackType="avatar"
                            name={`${child.firstName} ${child.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-0.5 mt-2">
                          <h4 className="text-lg font-black text-[#000E28] tracking-tight">
                            {idCard.studentId?.firstName || child.firstName} {idCard.studentId?.lastName || child.lastName}
                          </h4>
                          <span className="inline-block px-3 py-0.5 rounded-full bg-[#E5EEFF] text-[#0050CB] font-black text-[11px]">
                            STUDENT &bull; Class {idCard.studentId?.grade || child.grade} {idCard.studentId?.section || child.section}
                          </span>
                        </div>

                        {/* Metadata Grid */}
                        <div className="w-full grid grid-cols-2 gap-2 text-left bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px]">
                          <div>
                            <span className="text-slate-400 font-semibold uppercase text-[9px] block">Adm No.</span>
                            <span className="font-bold text-slate-800">{idCard.studentId?.admissionNumber || child.admissionNumber || "GGPS-2024-089"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold uppercase text-[9px] block">Roll No.</span>
                            <span className="font-bold text-slate-800">{idCard.studentId?.rollNumber || child.rollNumber || "14"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold uppercase text-[9px] block">Blood Group</span>
                            <span className="font-bold text-[#FF690C]">{idCard.studentId?.bloodGroup || child.bloodGroup || "B+"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold uppercase text-[9px] block">Valid Till</span>
                            <span className="font-bold text-slate-800">{idCard.validTill ? new Date(idCard.validTill).toLocaleDateString() : "May 2027"}</span>
                          </div>
                        </div>

                        {/* Barcode Strip */}
                        <div className="w-full flex flex-col items-center pt-1">
                          <div className="h-7 w-48 flex items-end justify-center space-x-1 opacity-80">
                            {[2,4,1,3,2,5,1,4,2,3,1,4,3,2,4,1,3,2].map((w, i) => (
                              <div key={i} className="bg-slate-900 h-full" style={{ width: `${w * 1.5}px` }} />
                            ))}
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 tracking-widest mt-0.5">
                            {idCard.barcodeValue || idCard.cardNumber}
                          </span>
                        </div>
                      </div>

                      {/* Card Bottom Accent Strip */}
                      <div className="bg-[#000E28] h-3 w-full" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-[340px] h-[520px] rounded-[22px] bg-white text-[#000E28] shadow-2xl border-4 border-slate-100 overflow-hidden flex flex-col justify-between p-4 relative"
                    >
                      <div className="border-b border-slate-200 pb-2 text-center">
                        <h4 className="text-xs font-black text-[#0050CB] uppercase tracking-wider">
                          Emergency &amp; Institutional Contacts
                        </h4>
                        <p className="text-[9px] text-slate-400">Campus Security &amp; Medical Dispatch</p>
                      </div>

                      <div className="space-y-2 text-[10px] text-slate-700">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Parent / Guardian</span>
                          <span className="font-bold text-[#000E28]">
                            {idCard.studentId?.parentName || "Mr. Vikram & Mrs. Priya Sharma"}
                          </span>
                          <span className="text-slate-500 block">
                            {idCard.studentId?.parentPhone || "+91 98765 43210"}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Residential Address</span>
                          <span className="text-slate-600 line-clamp-2">
                            {idCard.studentId?.address || "Prestige Greenfield Residences, Bangalore 560103"}
                          </span>
                        </div>

                        <div className="bg-blue-50/70 p-2 rounded-lg border border-blue-100 text-blue-900">
                          <span className="text-[9px] font-bold text-blue-700 uppercase block">Campus Security Office</span>
                          <span>Helpline: +91 (80) 4122-8900 | security@ggps.edu.in</span>
                        </div>
                      </div>

                      {/* Official Verification QR Code */}
                      <div className="flex flex-col items-center py-2 bg-slate-50 rounded-xl border border-slate-100">
                        {qrDataUrl ? (
                          <img src={qrDataUrl} alt="Security Verification QR" className="w-20 h-20 rounded-md shadow-2xs" />
                        ) : (
                          <div className="w-20 h-20 bg-slate-200 animate-pulse rounded-md" />
                        )}
                        <span className="text-[8px] font-bold text-slate-500 uppercase mt-1 tracking-wider">
                          Scan to Verify Authenticity
                        </span>
                      </div>

                      {/* Principal Signature & Footer */}
                      <div className="flex items-end justify-between border-t border-slate-200 pt-2 text-[9px]">
                        <div>
                          <p className="font-bold text-[#0050CB]">GGPS School Authority</p>
                          <p className="text-[8px] text-slate-400">Card Serial: {idCard.cardNumber}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-serif italic font-bold text-xs text-slate-800 -mb-0.5">
                            M. V. Rao
                          </div>
                          <div className="h-0.5 w-16 bg-slate-400 ml-auto my-0.5" />
                          <p className="text-[8px] font-bold text-slate-600">Principal Signature</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Safety & Parental Notice */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs">
                <ShieldCheck className="w-5 h-5 text-[#0050CB] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[#000E28] dark:text-white">
                    Certified National School Registry Security Pass
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    This digital student identity credential is cryptographically tied to GGPS School&apos;s campus security system. Parents have read-only viewing and downloading access. If the card is lost or details require amendment, please submit a service request through the School Office.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
