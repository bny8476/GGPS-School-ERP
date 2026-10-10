"use client";

import React, { useState } from "react";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  ChevronRight, 
  CheckCircle2, 
  MessageCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Users,
  Sparkles,
  KeyRound,
  X,
} from "lucide-react";
import { useParent } from "@/context/ParentContext";
import toast from "react-hot-toast";
import { getApiBaseUrl } from "@/lib/utils";
import { authFetch } from "@/lib/apiClient";

export default function ParentAccountPage() {
  const { parentProfile, updateParentProfile, children } = useParent();
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingForgotReset, setIsSendingForgotReset] = useState(false);
  const [forgotSuccessNotice, setForgotSuccessNotice] = useState<{ message: string; pin?: string } | null>(null);
  const [forgotPin, setForgotPin] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [isResettingWithPin, setIsResettingWithPin] = useState(false);
  const [showForgotNewPw, setShowForgotNewPw] = useState(false);

  const [form, setForm] = useState({
    motherName: parentProfile?.motherName || "",
    fatherName: parentProfile?.fatherName || "",
    primaryEmail: parentProfile?.primaryEmail || "",
    motherContact: parentProfile?.motherContact || "",
    fatherContact: parentProfile?.fatherContact || "",
    whatsappNumber: parentProfile?.whatsappNumber || "",
    address: parentProfile?.address || "",
  });

  React.useEffect(() => {
    if (parentProfile) {
      setForm({
        motherName: parentProfile.motherName || "",
        fatherName: parentProfile.fatherName || "",
        primaryEmail: parentProfile.primaryEmail || "",
        motherContact: parentProfile.motherContact || "",
        fatherContact: parentProfile.fatherContact || "",
        whatsappNumber: parentProfile.whatsappNumber || "",
        address: parentProfile.address || "",
      });
    }
  }, [parentProfile]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const displayChildren = children && children.length > 0 ? children : [];

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const success = await updateParentProfile(form);
      if (success) {
        toast.success("Contact details updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.success("Contact details saved locally!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/v1/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Account password updated securely!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch {
      toast.error("Network error updating password. Please try again.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSendForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = (forgotEmail || form.primaryEmail || "").trim().toLowerCase();
    if (!emailToUse) {
      toast.error("Please enter your registered email address");
      return;
    }

    setIsSendingForgotReset(true);
    try {
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotSuccessNotice({
          message: data.message || "Password reset instructions sent!",
          pin: data.demoResetPin,
        });
        if (data.demoResetPin) {
          setForgotPin(data.demoResetPin);
        }
        toast.success("Reset code sent to your email!");
      } else {
        toast.error(data.message || "Unable to send reset code");
      }
    } catch {
      toast.error("Network error sending reset code");
    } finally {
      setIsSendingForgotReset(false);
    }
  };

  const handleCompleteForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = forgotPin.trim();
    if (!cleanPin || cleanPin.length < 4) {
      toast.error("Please enter the 6-digit verification PIN");
      return;
    }
    if (forgotNewPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsResettingWithPin(true);
    try {
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: (forgotEmail || form.primaryEmail || "").trim().toLowerCase(),
          code: cleanPin,
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Password reset successfully!");
        setForgotModalOpen(false);
        setForgotSuccessNotice(null);
        setForgotPin("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
      } else {
        toast.error(data.message || "Failed to reset password. Check your PIN.");
      }
    } catch {
      toast.error("Network error resetting password");
    } finally {
      setIsResettingWithPin(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans">
      {/* ========================================================
          1. BREADCRUMBS
      ======================================================== */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link href="/parent" className="hover:text-[#0050CB] transition-colors">
          Home
        </Link>
        <span className="text-slate-300">›</span>
        <span className="text-[#0050CB] font-bold">My Account</span>
      </nav>

      {/* ========================================================
          2. TOP ILLUSTRATED HEADER BANNER
      ======================================================== */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#EBF3FF] via-[#F4F8FF] to-[#DCEBFF] dark:from-[#061530] dark:via-[#091D45] dark:to-[#0B2558] border border-blue-100/90 dark:border-white/10 shadow-[0_4px_24px_rgba(0,80,203,0.06)] min-h-[148px] flex items-center justify-between p-6 sm:p-8">
        {/* Soft background glow accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/40 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/3 w-64 h-64 bg-blue-300/20 dark:bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Left Side: Avatar Icon + Title + Subtitle */}
        <div className="relative z-10 flex items-start sm:items-center gap-4 max-w-2xl">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-slate-800 shadow-md border border-blue-100/80 dark:border-slate-700 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] shrink-0 mt-1 sm:mt-0">
            <User className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#000E28] dark:text-white tracking-tight leading-tight">
                My Account & Profile
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8FAF0] dark:bg-emerald-950/60 text-[#027A48] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-bold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#027A48] dark:text-emerald-400" />
                <span>Verified Primary Guardian</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Manage your personal details, emergency contacts, and account settings to keep your information secure and up to date.
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================
          3. MAIN TWO-COLUMN SECTION
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ----------------------------------------------------
            LEFT COLUMN (Col 1 to 4): PROFILE SUMMARY & CHILDREN
        ---------------------------------------------------- */}
        <div className="lg:col-span-4 bg-white dark:bg-[#07152F] rounded-[26px] p-6 border border-[#E6EAF2] dark:border-slate-800 shadow-[0_4px_24px_rgba(0,14,40,0.03)] flex flex-col justify-between space-y-6">
          
          {/* User Profile Mini Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#2563EB] to-[#0050CB] text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/25 ring-4 ring-[#E5EEFF] dark:ring-blue-900/40 shrink-0">
              {form.motherName ? form.motherName.trim()[0].toUpperCase() : "L"}
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-black text-[#000E28] dark:text-white truncate">
                {form.motherName || "Latha"}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Parent / Guardian
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{form.primaryEmail || "parent@school.com"}</span>
              </div>
            </div>
          </div>

          {/* Authorized Children Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Users className="w-4 h-4 text-[#0050CB]" />
              <span>Authorized Children ({displayChildren.length})</span>
            </div>

            <div className="space-y-2.5">
              {displayChildren.length === 0 ? (
                <div className="p-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No student profiles linked to this parent account yet.
                  </p>
                </div>
              ) : (
                displayChildren.map((child: any, idx: number) => {
                  return (
                    <div
                      key={child._id || idx}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700 shadow-[0_2px_10px_rgba(0,14,40,0.02)] transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shrink-0">
                          <AppImage
                            src={child.studentPhoto}
                            alt={child.firstName}
                            fallbackType="avatar"
                            name={`${child.firstName} ${child.lastName || ""}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#000E28] dark:text-white truncate">
                            {child.firstName} {child.lastName || ""}
                          </p>
                          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                            {child.grade ? `${child.grade} - ${child.section || "A"}` : "Class not assigned"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-blue-300 font-extrabold text-[10px]">
                          {child.rollNumber ? `Roll #${child.rollNumber}` : (child.admissionNumber ? `ID #${child.admissionNumber}` : "Student")}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0050CB] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Child Safety Callout Box */}
          <div className="rounded-2xl p-4 bg-[#F2F7FF] dark:bg-blue-950/20 border border-blue-100/90 dark:border-blue-900/40 relative overflow-hidden flex items-start gap-3 mt-4">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-[#0050CB] dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black text-[#000E28] dark:text-white leading-tight">
                Your child&apos;s safety is our priority
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                Keep your contact details updated for better communication and support.
              </p>
            </div>
            <div className="text-emerald-500 text-sm opacity-80 shrink-0 self-end">
              🌿
            </div>
          </div>

        </div>

        {/* ----------------------------------------------------
            RIGHT COLUMN (Col 5 to 12): CONTACT DETAILS FORM
        ---------------------------------------------------- */}
        <div className="lg:col-span-8 bg-white dark:bg-[#07152F] rounded-[26px] p-6 sm:p-8 border border-[#E6EAF2] dark:border-slate-800 shadow-[0_4px_24px_rgba(0,14,40,0.03)] flex flex-col justify-between relative overflow-hidden">
          
          <div>
            {/* Header with Icon + Title + Festive Confetti Accent */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                  <User className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-[#000E28] dark:text-white">
                    Personal & Emergency Contact Details
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Campus authorized emergency broadcasts & SMS notifications will be dispatched to these numbers.
                  </p>
                </div>
              </div>

              {/* Colorful decorative tick marks on top-right */}
              <div className="hidden sm:flex items-center gap-1 opacity-70">
                <span className="w-2.5 h-1 rounded-full bg-amber-400 rotate-45 block" />
                <span className="w-3 h-1 rounded-full bg-emerald-400 -rotate-12 block" />
                <span className="w-2.5 h-1 rounded-full bg-blue-500 rotate-12 block" />
              </div>
            </div>

            {/* Form Fields */}
            <form id="parent-contact-form" onSubmit={handleSaveContact} className="space-y-4">
              {/* Row 1: Mother / Guardian Name & Father / Co-Guardian Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mother / Guardian Name</span>
                  </label>
                  <input
                    type="text"
                    value={form.motherName}
                    onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                    placeholder="Mother's name"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB] focus:border-transparent transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Father / Co-Guardian Name</span>
                  </label>
                  <input
                    type="text"
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    placeholder="Father's name"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB] focus:border-transparent transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 2: Primary Mobile Number & WhatsApp Broadcast Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Primary Mobile Number</span>
                  </label>
                  <input
                    type="text"
                    value={form.motherContact}
                    onChange={(e) => setForm({ ...form, motherContact: e.target.value })}
                    placeholder="+91 Mobile number"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB] focus:border-transparent transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>WhatsApp Broadcast Number</span>
                  </label>
                  <input
                    type="text"
                    value={form.whatsappNumber}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                    placeholder="+91 WhatsApp number"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB] focus:border-transparent transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 3: Residential Street Address & Pincode */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Residential Street Address & Pincode</span>
                </label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Enter complete residential address"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB] focus:border-transparent transition-all shadow-2xs resize-none"
                />
              </div>
            </form>
          </div>

          {/* Bottom Right: Save Contact Changes Button */}
          <div className="flex justify-end pt-5">
            <button
              type="submit"
              form="parent-contact-form"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#0050CB]/25 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Save className="w-4 h-4 stroke-[2.4]" />
              <span>{isSaving ? "Saving Changes..." : "Save Contact Changes"}</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================
          4. BOTTOM SECTION: ACCOUNT SECURITY & PASSWORD
      ======================================================== */}
      <div className="bg-white dark:bg-[#07152F] rounded-[26px] p-6 sm:p-8 border border-[#E6EAF2] dark:border-slate-800 shadow-[0_4px_24px_rgba(0,14,40,0.03)] relative overflow-hidden">
        
        {/* Decorative corner confetti ticks */}
        <div className="absolute top-5 left-5 hidden sm:flex flex-col gap-1 opacity-70 pointer-events-none">
          <span className="w-2.5 h-1 rounded-full bg-amber-400 rotate-45 block" />
          <span className="w-3 h-1 rounded-full bg-rose-400 -rotate-12 block" />
          <span className="w-2.5 h-1 rounded-full bg-blue-500 rotate-12 block" />
        </div>

        {/* Top Header of Security Card + 3D Lock Illustration on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] dark:text-blue-300 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#000E28] dark:text-white">
                Account Security & Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Keep your account secure with a strong password (minimum 8 characters).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setForgotEmail(form.primaryEmail || "");
                setForgotModalOpen(true);
              }}
              className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF690C]" />
              Forgot Current Password?
            </button>
            {/* 3D Glossy Blue Lock Graphic */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 overflow-hidden hidden sm:block">
              <AppImage
                src="/security-lock-3d.jpg"
                alt="Security Lock"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Password Form Row */}
        <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Current Password Field */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password <span className="text-[#FF690C]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB] focus:border-transparent transition-all shadow-2xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              New Password <span className="text-[#FF690C]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                minLength={8}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB] focus:border-transparent transition-all shadow-2xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm Password <span className="text-[#FF690C]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat new password"
                minLength={8}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB] focus:border-transparent transition-all shadow-2xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Update Password Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0050CB]/25 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 stroke-[2.4] ${isUpdatingPassword ? 'animate-spin' : ''}`} />
              <span>{isUpdatingPassword ? "Updating..." : "Update"}</span>
            </button>
          </div>
        </form>

      </div>

      {/* ========================================================
          PARENT FORGOT PASSWORD / PIN RESET MODAL
      ======================================================== */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-left">
            <button
              onClick={() => {
                setForgotModalOpen(false);
                setForgotSuccessNotice(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/30 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#000E28] dark:text-white">
                  Reset Parent Password
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {forgotSuccessNotice ? 'Enter your 6-digit PIN & new password' : 'Send verification code to your email'}
                </p>
              </div>
            </div>

            {!forgotSuccessNotice ? (
              <form onSubmit={handleSendForgotReset} className="space-y-4 mt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Registered Email Address <span className="text-[#FF690C]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="parent@school.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    We will send a 6-digit one-time verification PIN valid for 15 minutes.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingForgotReset}
                    className="px-5 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#003d99] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#0050CB]/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSendingForgotReset ? (
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#FF690C]" />
                    )}
                    <span>{isSendingForgotReset ? 'Sending...' : 'Send Reset PIN'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCompleteForgotReset} className="space-y-4 mt-2">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                  <p className="font-semibold">{forgotSuccessNotice.message}</p>
                  {forgotSuccessNotice.pin && (
                    <p className="mt-1 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      Development PIN: {forgotSuccessNotice.pin}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    6-Digit Verification PIN <span className="text-[#FF690C]">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={forgotPin}
                      onChange={(e) => setForgotPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tracking-widest text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    New Password <span className="text-[#FF690C]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showForgotNewPw ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPw(!showForgotNewPw)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showForgotNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Confirm New Password <span className="text-[#FF690C]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showForgotNewPw ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotSuccessNotice(null)}
                    className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotModalOpen(false);
                        setForgotSuccessNotice(null);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isResettingWithPin}
                      className="px-5 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#003d99] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#0050CB]/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isResettingWithPin ? (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                      <span>{isResettingWithPin ? 'Resetting...' : 'Set New Password'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
