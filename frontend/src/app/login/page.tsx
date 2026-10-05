"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  CreditCard,
  MessageSquare,
  Sun,
  Moon,
  User,
  Check,
  KeyRound,
  X,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import GgpsCrestLogo from "@/components/ui/GgpsCrestLogo";
import { getApiBaseUrl } from "@/lib/utils";

type PortalRole = "admin" | "teacher" | "parent";

const ROLE_OPTIONS = [
  { id: "admin" as PortalRole, label: "Admin", icon: User, demoEmail: "admin@schoolerp.com" },
  { id: "teacher" as PortalRole, label: "Teacher", icon: GraduationCap, demoEmail: "teacher@school.com" },
  { id: "parent" as PortalRole, label: "Parent", icon: Users, demoEmail: "parent@school.com" },
];

const FEATURE_CARDS = [
  {
    icon: GraduationCap,
    title: "Academic Management",
    desc: "Manage classes, subjects & curriculum",
  },
  {
    icon: Users,
    title: "Attendance Tracking",
    desc: "Real-time attendance and reports",
  },
  {
    icon: CreditCard,
    title: "Fees & Payments",
    desc: "Secure and hassle-free fee management",
  },
  {
    icon: MessageSquare,
    title: "Parent Portal",
    desc: "Stay connected with your child's progress",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const { t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<PortalRole>("admin");
  const [email, setEmail] = useState("admin@schoolerp.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("ggps_remembered_email");
      const savedRole = localStorage.getItem("ggps_remembered_role") as PortalRole;
      if (savedEmail) { setEmail(savedEmail); setRememberMe(true); }
      if (savedRole && ["admin", "teacher", "parent"].includes(savedRole)) setSelectedRole(savedRole);
    }
  }, []);

  const handleRoleChange = (newRole: PortalRole) => {
    setSelectedRole(newRole);
    setError("");
    const isCurrentPreset = ROLE_OPTIONS.some((r) => r.demoEmail.toLowerCase() === email.trim().toLowerCase());
    if (!email || isCurrentPreset) {
      const cfg = ROLE_OPTIONS.find((r) => r.id === newRole);
      if (cfg) { setEmail(cfg.demoEmail); setPassword("password123"); }
    }
  };

  // --- Forgot Password Flow ---
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPw, setForgotNewPw] = useState("");
  const [forgotConfirmPw, setForgotConfirmPw] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) { setForgotError("Please enter your registered email."); return; }
    setForgotLoading(true); setForgotError(""); setForgotSuccess("");
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset code");
      setForgotStep(2); setForgotSuccess(data.message || "Verification code sent!");
    } catch (err: any) { setForgotError(err.message || "Failed to initiate reset"); }
    finally { setForgotLoading(false); }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotCode) { setForgotError("Please enter the verification code."); return; }
    setForgotLoading(true); setForgotError(""); setForgotSuccess("");
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/verify-reset-code`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), code: forgotCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid or expired code");
      setForgotStep(3); setForgotSuccess("Code verified! Set your new password.");
    } catch (err: any) { setForgotError(err.message || "Invalid or expired code"); }
    finally { setForgotLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotNewPw.length < 6) { setForgotError("Password must be at least 6 characters."); return; }
    if (forgotNewPw !== forgotConfirmPw) { setForgotError("Passwords do not match."); return; }
    setForgotLoading(true); setForgotError(""); setForgotSuccess("");
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), code: forgotCode.trim(), newPassword: forgotNewPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setForgotSuccess("Password reset! You can now sign in.");
      setEmail(forgotEmail.trim());
      setTimeout(() => { setIsForgotOpen(false); setForgotStep(1); setForgotCode(""); setForgotNewPw(""); setForgotConfirmPw(""); setForgotSuccess(""); }, 1800);
    } catch (err: any) { setForgotError(err.message || "Failed to reset password"); }
    finally { setForgotLoading(false); }
  };

  // --- Main Login ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError("");
    try {
      const apiBase = getApiBaseUrl();
      const cleanEmail = email.trim();
      let res: Response;
      try {
        res = await fetch(`${apiBase}/api/v1/auth/login`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          credentials: "include", body: JSON.stringify({ email: cleanEmail, password }),
        });
      } catch {
        res = await fetch("/api/v1/auth/login", {
          method: "POST", headers: { "Content-Type": "application/json" },
          credentials: "include", body: JSON.stringify({ email: cleanEmail, password }),
        });
      }
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) throw new Error("Unable to connect to the server. Please check your connection and try again.");
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        useAuthStore.getState().setAuth(data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        if (rememberMe) { localStorage.setItem("ggps_remembered_email", cleanEmail); localStorage.setItem("ggps_remembered_role", selectedRole); }
        else { localStorage.removeItem("ggps_remembered_email"); localStorage.removeItem("ggps_remembered_role"); }
        const roleStr = (data.role || selectedRole || "").toLowerCase();
        setTimeout(() => {
          if (roleStr === "parent") router.push("/parent");
          else if (roleStr === "teacher") router.push("/teacher");
          else router.push("/dashboard");
        }, 600);
      } else {
        if (res.status === 401) setError("Invalid email or password. Please check your credentials and try again.");
        else if (res.status === 403) {
          if (data.message?.toLowerCase().includes("student")) setError("Students do not have direct login access. Please use the Parent Portal.");
          else setError("Your account is currently inactive. Please contact the school administrator.");
        } else if (res.status === 400) setError(data.message || "Please enter a valid email address and password.");
        else setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      if (err?.name === "TypeError" || err?.message?.includes("Failed to fetch")) setError("Unable to connect to the server. Please check your connection and try again.");
      else setError("Something went wrong while signing you in. Please try again.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-[#F0F6FF] dark:bg-[#07111F]">

      {/* ================================================================
          LEFT PANEL — Full-bleed campus image with dark overlay & content
      ================================================================ */}
      <div className="hidden lg:block relative w-[57%] min-h-screen overflow-hidden shrink-0">

        {/* Campus Full-Bleed Image */}
        <Image
          src="/ggps-campus-hero.jpg"
          alt="GGPS School Campus"
          fill
          priority
          sizes="57vw"
          className="object-cover object-center"
        />

        {/* Dark gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#001030]/88 via-[#001030]/50 to-[#001030]/92 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#001030]/30 to-transparent pointer-events-none" />

        {/* Golden bottom curve decoration */}
        <svg className="absolute bottom-0 left-0 w-full pointer-events-none" viewBox="0 0 800 80" preserveAspectRatio="none" height="80">
          <path d="M0 80 Q400 0 800 80" fill="none" stroke="#F5B942" strokeWidth="2.5" strokeOpacity="0.6" />
        </svg>

        {/* Content layer */}
        <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 py-8 xl:py-10">

          {/* TOP NAV ROW */}
          <div className="flex items-center justify-between mb-8 xl:mb-12">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
                <GgpsCrestLogo size="md" />
              </div>
              <div>
                <h2 className="text-lg xl:text-xl font-black text-white tracking-tight leading-tight">GGPS School</h2>
                <p className="text-xs font-semibold text-blue-200/80 tracking-wide">School Management System</p>
              </div>
            </div>

            {/* Learn • Grow • Achieve */}
            <div className="flex items-center gap-2 text-white/80 text-xs font-extrabold tracking-[0.25em] uppercase">
              <span>LEARN</span>
              <span className="w-1 h-1 rounded-full bg-[#F5B942]" />
              <span>GROW</span>
              <span className="w-1 h-1 rounded-full bg-[#F5B942]" />
              <span>ACHIEVE</span>
            </div>
          </div>

          {/* HERO HEADLINE */}
          <div className="mb-6 xl:mb-10 max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4"
            >
              Building Brighter <br />
              Futures{" "}
              <span
                className="italic font-bold text-[#F5B942]"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                Together
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-blue-100/85 text-sm leading-relaxed max-w-md"
            >
              A modern school management platform to streamline academics, attendance, fees, communication and parent engagement — all in one place.
            </motion.p>
          </div>

          {/* SPACER that pushes feature cards to bottom */}
          <div className="flex-1" />

          {/* BOTTOM FEATURE CARDS — 4 cards with descriptions + arrows */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
            className="grid grid-cols-4 gap-3 mb-5"
          >
            {FEATURE_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="bg-[#001A4A]/80 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 hover:border-[#38BDF8]/30 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#0050CB] flex items-center justify-center mb-2.5 shadow-md">
                    <Icon className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                  </div>
                  <h4 className="text-xs font-black text-white mb-1 leading-tight">{card.title}</h4>
                  <p className="text-[10px] text-blue-200/70 leading-snug mb-2.5">{card.desc}</p>
                  <div className="flex justify-end">
                    <span className="w-5 h-5 rounded-lg bg-white/10 group-hover:bg-[#0050CB] flex items-center justify-center transition-colors">
                      <ArrowRight className="w-2.5 h-2.5 text-white/70 group-hover:text-white" strokeWidth={2.5} />
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Golden Script Motto */}
          <p
            className="text-center text-lg xl:text-xl font-bold text-[#F5B942] pb-2"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            Together for a better tomorrow
          </p>
        </div>
      </div>

      {/* ================================================================
          RIGHT PANEL — Login Card + Decorative Background
      ================================================================ */}
      <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden min-h-screen">

        {/* Decorative gold arc ribbon top-right */}
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full border-[8px] border-[#F5B942]/50" />
          <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full border-[5px] border-[#0050CB]/60" />
        </div>

        {/* Decorative blue leaf / floral bottom-right */}
        <div className="absolute bottom-0 right-0 w-36 h-36 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 120 120" className="w-full h-full opacity-30" fill="none">
            <path d="M100 120 C60 80 20 60 0 0 Q40 20 80 60 Q90 90 100 120Z" fill="#0050CB" />
            <path d="M120 90 C90 60 70 30 60 0 Q90 20 110 60 Q120 75 120 90Z" fill="#0050CB" opacity="0.6" />
          </svg>
        </div>

        {/* Theme + Language controls top-right of right panel */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-30">
          <div className="flex items-center bg-white/90 dark:bg-[#0D1B2E]/90 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${!isDarkMode ? "bg-[#E5EEFF] text-[#0050CB]" : "text-slate-400 hover:text-slate-600"}`}
              aria-label="Light mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${isDarkMode ? "bg-[#0050CB] text-white" : "text-slate-400 hover:text-slate-600"}`}
              aria-label="Dark mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
          <LanguageSwitcher />
        </div>

        {/* ============================================================
            THE FLOATING WHITE LOGIN CARD
        ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative w-full max-w-[430px] bg-white dark:bg-[#0D1B2E] rounded-3xl shadow-[0_20px_60px_rgba(0,14,40,0.14)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-white/10 px-7 py-8 sm:px-9 sm:py-9 overflow-hidden"
        >
          {/* Back button inside card top-left */}
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20">
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/10 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/25 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#0050CB] dark:hover:text-[#38BDF8] hover:border-[#0050CB]/40 shadow-xs transition-all"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.5} />
              <span>Back</span>
            </Link>
          </div>

          {/* Top card corner decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full border-[5px] border-[#F5B942]/40 bg-[#0050CB]/10" />
          </div>

          {/* CREST + SCHOOL BRANDING — centered */}
          <div className="text-center mb-5">
            <div className="inline-flex justify-center mb-2">
              <GgpsCrestLogo size="lg" />
            </div>
            <h2 className="text-xl font-black text-[#000E28] dark:text-white tracking-tight">
              <span className="text-[#0050CB] dark:text-[#38BDF8]">GGPS School</span>
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">School Management System</p>
          </div>

          {/* WELCOME BACK / Sign In heading */}
          <div className="mb-5">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-[#0050CB] dark:text-[#38BDF8] uppercase mb-1">
              WELCOME BACK
            </p>
            <h3 className="text-2xl font-black text-[#000E28] dark:text-white tracking-tight leading-tight">
              Sign In to Your Account
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Access your GGPS School portal and manage your academic journey.
            </p>
          </div>

          {/* ROLE SELECTOR — [ Admin ] [ Teacher ] [ Parent ] */}
          <div className="flex items-center mb-5 p-1 bg-slate-100 dark:bg-[#07111F] rounded-2xl border border-slate-200 dark:border-white/10 gap-0.5">
            {ROLE_OPTIONS.map((role) => {
              const Icon = role.icon;
              const isActive = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleChange(role.id)}
                  className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-[#0050CB] text-white shadow-[0_4px_14px_rgba(0,80,203,0.35)]"
                      : "text-slate-600 dark:text-slate-300 hover:text-[#0050CB] dark:hover:text-white"
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {role.label}
                </button>
              );
            })}
          </div>

          {/* ERROR ALERT */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="px-3.5 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-rose-700 dark:text-rose-300 leading-snug">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0050CB]/40 focus:border-[#0050CB] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setForgotEmail(email); setForgotStep(1); setForgotError(""); setForgotSuccess(""); setIsForgotOpen(true); }}
                  className="text-xs font-semibold text-[#0050CB] dark:text-[#38BDF8] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0050CB]/40 focus:border-[#0050CB] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0050CB] focus:ring-[#0050CB]/30 accent-[#0050CB] cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Remember me</span>
            </label>

            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full h-[52px] rounded-2xl bg-gradient-to-r from-[#0050CB] to-[#003894] hover:from-[#0047B8] hover:to-[#002D75] text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,80,203,0.35)] hover:shadow-[0_10px_26px_rgba(0,80,203,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : isSuccess ? (
                <><Check className="w-4 h-4 text-emerald-300" /> Signed in</>
              ) : (
                <><ArrowRight className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* ================================================================
          FORGOT PASSWORD MODAL
      ================================================================ */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0D1B2E] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 p-7 sm:p-8">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center text-[#0050CB]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset Password</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Step {forgotStep} of 3 • {forgotStep === 1 ? "Enter your email" : forgotStep === 2 ? "Verify 6-digit code" : "Set new password"}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setIsForgotOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-5">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full ${forgotStep >= s ? "bg-[#0050CB]" : "bg-slate-200 dark:bg-slate-800"}`} />
              ))}
            </div>

            {forgotError && (
              <div className="mb-4 px-3.5 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />{forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="mb-4 px-3.5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                <Check className="w-4 h-4 shrink-0" />{forgotSuccess}
              </div>
            )}

            {forgotStep === 1 && (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="admin@ggps.edu.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/40" />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">We will send a 6-digit security code valid for 15 minutes.</p>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setIsForgotOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">Cancel</button>
                  <button type="submit" disabled={forgotLoading} className="px-5 py-2.5 text-xs font-bold text-white bg-[#0050CB] hover:bg-[#003E9E] rounded-xl disabled:opacity-50 cursor-pointer shadow-md">
                    {forgotLoading ? "Sending..." : "Send Reset Code"}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Enter 6-Digit Verification Code</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="text" required maxLength={6} value={forgotCode} onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ""))} placeholder="123456"
                      className="w-full pl-10 pr-4 py-2.5 tracking-widest text-base font-mono bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-800 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-[#0050CB]/40" />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[11px] text-slate-500">Sent to {forgotEmail}</span>
                    <button type="button" onClick={() => setForgotStep(1)} className="text-[11px] font-semibold text-[#0050CB] dark:text-[#38BDF8] hover:underline cursor-pointer">Change Email</button>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setForgotStep(1)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">Back</button>
                  <button type="submit" disabled={forgotLoading} className="px-5 py-2.5 text-xs font-bold text-white bg-[#0050CB] hover:bg-[#003E9E] rounded-xl disabled:opacity-50 cursor-pointer shadow-md">
                    {forgotLoading ? "Verifying..." : "Verify Code"}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="password" required minLength={6} value={forgotNewPw} onChange={(e) => setForgotNewPw(e.target.value)} placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/40" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="password" required minLength={6} value={forgotConfirmPw} onChange={(e) => setForgotConfirmPw(e.target.value)} placeholder="Re-enter password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/40" />
                  </div>
                </div>
                <button type="submit" disabled={forgotLoading} className="w-full py-3 text-xs font-bold text-white bg-[#0050CB] hover:bg-[#003E9E] rounded-2xl flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md">
                  {forgotLoading ? "Updating..." : "Update Password & Login"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
