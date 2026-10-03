"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  GraduationCap,
  Users,
  BarChart3,
  Globe,
  Sun,
  Moon,
  ChevronDown,
  User,
  Check,
  KeyRound,
  X,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getApiBaseUrl } from "@/lib/utils";
import toast from "react-hot-toast";

/* Academic Crest Logo with Laurel Wreath & Mortarboard */
function AcademyCrest({ size = "md" }: { size?: "sm" | "md" }) {
  const isSm = size === "sm";
  return (
    <div className={`relative flex items-center justify-center ${isSm ? "w-10 h-10" : "w-12 h-12"}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Left Laurel Wreath Branch */}
        <path
          d="M20 48C14 40 14 24 23 14"
          stroke="#0050CB"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M16 22C14 20 12 21 12 24C12 27 15 26 16 24" fill="#0050CB" />
        <path d="M15 31C13 30 11 31 11 34C11 37 14 36 15 33" fill="#0050CB" />
        <path d="M16 40C14 39 12 40 12 43C12 46 15 45 16 42" fill="#0050CB" />
        <path d="M20 47C18 46 16 48 16 50C16 53 19 52 20 49" fill="#0050CB" />
        <path d="M22 17C21 15 19 15 18 18C18 20 21 20 22 18" fill="#0050CB" />

        {/* Right Laurel Wreath Branch */}
        <path
          d="M44 48C50 40 50 24 41 14"
          stroke="#0050CB"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M48 22C50 20 52 21 52 24C52 27 49 26 48 24" fill="#0050CB" />
        <path d="M49 31C51 30 53 31 53 34C53 37 50 36 49 33" fill="#0050CB" />
        <path d="M48 40C50 39 52 40 52 43C52 46 49 45 48 42" fill="#0050CB" />
        <path d="M44 47C46 46 48 48 48 50C48 53 45 52 44 49" fill="#0050CB" />
        <path d="M42 17C43 15 45 15 46 18C46 20 43 20 42 18" fill="#0050CB" />

        {/* Graduation Cap Diamond Top */}
        <polygon points="32,20 50,29 32,38 14,29" fill="#0050CB" />
        <polygon points="14,29 32,38 32,40 14,31" fill="#003E9E" />
        <polygon points="50,29 32,38 32,40 50,31" fill="#00226B" />

        {/* Skull Cap Base */}
        <path d="M23 33C23 33 23 44 32 45C41 44 41 33 41 33" fill="#000E28" />

        {/* Golden Tassel Button & String */}
        <circle cx="32" cy="29" r="2.2" fill="#FF690C" />
        <path
          d="M32 29 Q43 31 44 38 L44 43"
          stroke="#FF690C"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="44" cy="43.5" r="1.8" fill="#FF690C" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const { language, currentLanguage, setLanguage, languages, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Forgot & Reset Password Flow State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError("Please enter your registered email address.");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset code");
      }
      setForgotStep(2);
      setForgotSuccess(data.message || "Verification code sent to your email!");
    } catch (err: any) {
      setForgotError(err.message || "Failed to initiate password reset");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotCode) {
      setForgotError("Please enter the verification code.");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), code: forgotCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid or expired reset code");
      }
      setForgotStep(3);
      setForgotSuccess("Code verified! You can now choose a new password.");
    } catch (err: any) {
      setForgotError(err.message || "Invalid or expired reset code");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotNewPassword.length < 6) {
      setForgotError("Password must be at least 6 characters long.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: forgotCode.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }
      setForgotSuccess("Password reset successfully! You can now sign in.");
      setEmail(forgotEmail.trim());
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setForgotStep(1);
        setForgotCode("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setForgotSuccess("");
      }, 2000);
    } catch (err: any) {
      setForgotError(err.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const apiBase = getApiBaseUrl();
      let res: Response;

      const cleanEmail = email.trim();

      try {
        res = await fetch(`${apiBase}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: cleanEmail, password }),
        });
      } catch (directErr) {
        // Fallback to relative URL proxied by Next.js rewrites
        res = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: cleanEmail, password }),
        });
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Backend server returned non-JSON/HTML. Please ensure the backend server is running.");
      }

      const data = await res.json();

      if (res.ok) {
        useAuthStore.getState().setAuth(data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));

        const roleStr = (data.role || "").toLowerCase();
        // Students are data records only; role-based portal routing
        if (roleStr === "parent") {
          router.push("/parent");
        } else if (roleStr === "teacher") {
          router.push("/teacher");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err?.name === "TypeError" || err?.message?.includes("Failed to fetch")) {
        setError("Unable to connect to backend server. Please run 'npm run dev:all' or start backend on port 5001.");
      } else {
        setError(err?.message || "Failed to connect to the server. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#EBF2FE] via-[#F4F8FE] to-[#E6F0FD] dark:from-[#000a1f] dark:via-[#000E28] dark:to-[#000a1f] flex flex-col justify-between overflow-x-hidden font-sans select-none transition-colors duration-200">
      
      {/* ========================================================
          TOP HEADER BAR: BACK BUTTON & LOGO (LEFT) & THEME/LANGUAGE (RIGHT)
      ======================================================== */}
      <header className="relative z-30 w-full px-6 sm:px-10 lg:px-12 pt-5 pb-3 flex items-center justify-between">
        
        {/* Left: Back Button & Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#001438]/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#0050CB] dark:hover:text-[#38BDF8] hover:border-[#0050CB]/40 dark:hover:border-[#38BDF8]/40 shadow-xs hover:shadow-sm transition-all cursor-pointer"
            title={t("login.backHome", "Back to Home")}
            aria-label="Back to main page"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-[#0050CB] dark:group-hover:text-[#38BDF8] transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
            <span className="font-bold">{t("common.back", "Back")}</span>
          </Link>

          <span className="h-6 w-px bg-slate-200 dark:bg-slate-700/80 hidden sm:block" />

          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <AcademyCrest size="md" />
            <div className="leading-tight">
              <span className="block text-xl sm:text-2xl font-black tracking-tight text-[#000E28] dark:text-white">
                GGPS <span className="text-[#0050CB] dark:text-[#38BDF8]">School</span>
              </span>
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                {t("header.sub", "School Management System")}
              </span>
            </div>
          </Link>
        </div>

        {/* Right Controls: Theme Toggle & Language */}
        <div className="flex items-center gap-3">
          
          {/* Theme Pill (Sun / Moon) */}
          <div className="flex items-center bg-white/90 dark:bg-[#001438]/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700 rounded-full p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                !isDarkMode
                  ? "bg-[#E5EEFF] text-[#0050CB] shadow-xs"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
              aria-label="Light mode"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                isDarkMode
                  ? "bg-[#0050CB] text-white shadow-xs"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
              aria-label="Dark mode"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Language Selector Dropdown */}
          <LanguageSwitcher />

        </div>
      </header>

      {/* ========================================================
          MAIN CONTENT AREA: SPLIT HERO (LEFT) & LOGIN CARD (RIGHT)
      ======================================================== */}
      <main className="relative z-20 flex-1 w-full max-w-[1580px] mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-6 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ----------------------------------------------------
              LEFT COLUMN: HERO IMAGE + BLUE WAVES + 4 PILLARS
          ---------------------------------------------------- */}
          <div className="lg:col-span-7 relative flex flex-col justify-between rounded-[36px] overflow-hidden shadow-[0_20px_60px_rgba(0,14,40,0.12)] border border-white/60 dark:border-slate-800 bg-white dark:bg-[#000E28] min-h-[580px] sm:min-h-[660px] lg:min-h-[720px]">
            
            {/* Campus Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/school-campus.jpg"
                alt="GGPS School Campus Exterior"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center"
              />
            </div>

            {/* TOP ORGANIC BLUE WAVE OVERLAY */}
            <div className="relative z-10 w-full pt-8 sm:pt-10 px-6 sm:px-10 pb-20">
              {/* Organic wave shape SVG behind text */}
              <div className="absolute inset-0 -top-6 -left-6 -right-6 h-[290px] sm:h-[320px] bg-gradient-to-r from-[#002B7A] via-[#0050CB] to-[#0050CB]/90 transform -skew-y-2 origin-top-left shadow-lg pointer-events-none rounded-b-[60px]" />

              <div className="relative z-10 space-y-2 max-w-lg">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
                  {t("login.heroTitle", "Excellence in")} <br />
                  <span className="text-[#38BDF8]">{t("login.heroTitleHighlight", "Education.")}</span>
                </h2>
                <p className="text-blue-100/90 text-xs sm:text-sm font-normal max-w-md leading-relaxed pt-1">
                  {t("login.heroSubtitle", "Join over 1,000+ top educational institutions streamlining administration, academics, and parent trust.")}
                </p>
              </div>
            </div>

            {/* SPACER */}
            <div className="flex-1 min-h-[120px]" />

            {/* BOTTOM 4 PILLARS GRID */}
            <div className="relative z-10 p-5 sm:p-7">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Pillar 1 */}
                <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-slate-700/60 shadow-sm flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#000E28] dark:text-white">{t("nav.admissions", "Admissions")}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">100% Online</p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-slate-700/60 shadow-sm flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#000E28] dark:text-white">{t("card.attendance", "Attendance")}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Live Biometrics</p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-slate-700/60 shadow-sm flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#000E28] dark:text-white">{t("card.fees", "Fee Billing")}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Auto Receipts</p>
                  </div>
                </div>

                {/* Pillar 4 */}
                <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-slate-700/60 shadow-sm flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#000E28] dark:text-white">{t("nav.parentPortal", "Parent App")}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">24/7 Access</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ----------------------------------------------------
              RIGHT COLUMN: MODERN LOGIN FORM CARD
          ---------------------------------------------------- */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white/95 dark:bg-[#001233]/95 backdrop-blur-xl rounded-[36px] p-7 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,14,40,0.08)]">
              
              {/* Card Mobile Crest Header */}
              <div className="flex lg:hidden items-center gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <AcademyCrest size="sm" />
                <div>
                  <span className="block text-base font-black text-[#000E28] dark:text-white">
                    GGPS <span className="text-[#0050CB] dark:text-[#38BDF8]">School</span>
                  </span>
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {t("header.sub", "School Management System")}
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-4">
                <span className="text-[11px] font-extrabold tracking-widest text-[#0050CB] dark:text-[#38BDF8] uppercase block mb-1">
                  {t("login.welcomeBack", "WELCOME BACK")}
                </span>
                <h3 className="text-2xl sm:text-[26px] font-black text-[#000E28] dark:text-white tracking-tight leading-snug">
                  {t("login.signInTitle", "Sign In to Your Account")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal leading-relaxed">
                  {t("login.signInSubtitle", "Access your GGPS School portal and manage your academic journey.")}
                </p>
              </div>

              {/* Quick Role Fill Presets Bar */}
              <div className="mb-4 p-3 bg-[#E5EEFF]/80 dark:bg-slate-800/80 rounded-2xl border border-[#0050CB]/20 dark:border-slate-700 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-[#0050CB] dark:text-[#38BDF8] tracking-wider block">
                  ⚡ Quick Demo Login Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@schoolerp.com");
                      setPassword("password123");
                    }}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-[#0050CB] hover:text-white text-[10px] font-bold text-[#0050CB] dark:text-[#38BDF8] rounded-lg transition-colors cursor-pointer border border-[#0050CB]/20 shadow-2xs"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("teacher@school.com");
                      setPassword("password123");
                    }}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-[#0050CB] hover:text-white text-[10px] font-bold text-[#0050CB] dark:text-[#38BDF8] rounded-lg transition-colors cursor-pointer border border-[#0050CB]/20 shadow-2xs"
                  >
                    Teacher
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("parent@school.com");
                      setPassword("password123");
                    }}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-[#0050CB] hover:text-white text-[10px] font-bold text-[#0050CB] dark:text-[#38BDF8] rounded-lg transition-colors cursor-pointer border border-[#0050CB]/20 shadow-2xs"
                  >
                    Parent
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Email Address Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span>{t("login.email", "Email Address")}</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      required
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("login.emailPlaceholder", "Enter your email address")}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 input-focus-glow transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      <span>{t("login.password", "Password")}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotStep(1);
                        setForgotError("");
                        setForgotSuccess("");
                        setIsForgotModalOpen(true);
                      }}
                      className="text-xs font-semibold text-[#0050CB] dark:text-[#38BDF8] hover:underline cursor-pointer"
                    >
                      {t("login.forgotPassword", "Forgot password?")}
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
                      placeholder={t("login.passwordPlaceholder", "Enter your password")}
                      className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 input-focus-glow transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Secure Login Row */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#0050CB] focus:ring-[#0050CB]/30 cursor-pointer accent-[#0050CB]"
                    />
                    <span>{t("login.rememberMe", "Remember me")}</span>
                  </label>

                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>{t("login.secureLogin", "Secure Login")}</span>
                  </span>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-3.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,80,203,0.3)] hover:shadow-[0_10px_25px_rgba(0,80,203,0.45)] btn-interactive transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <span>{t("login.signingIn", "Signing in...")}</span>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      <span>{t("login.signInBtn", "Sign In")}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Password Reset Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#000E28] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Reset Password
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Step {forgotStep} of 3 • {forgotStep === 1 ? 'Enter your email' : forgotStep === 2 ? 'Verify 6-digit code' : 'Set new password'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-2 mb-5">
              <div className={`h-1.5 flex-1 rounded-full ${forgotStep >= 1 ? 'bg-[#0050CB]' : 'bg-slate-200 dark:bg-slate-800'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${forgotStep >= 2 ? 'bg-[#0050CB]' : 'bg-slate-200 dark:bg-slate-800'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${forgotStep >= 3 ? 'bg-[#0050CB]' : 'bg-slate-200 dark:bg-slate-800'}`} />
            </div>

            {/* Alerts */}
            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{forgotError}</span>
              </div>
            )}
            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* Step 1: Request Code */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@ggps.edu.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    We will send a 6-digit security code valid for 15 minutes.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#0050CB] hover:bg-[#003E9E] rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Code"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Verify Code */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-2.5 tracking-widest text-base font-mono bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-center"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-500">Sent to {forgotEmail}</span>
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-[11px] font-semibold text-[#0050CB] dark:text-[#38BDF8] hover:underline"
                    >
                      Change Email
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#0050CB] hover:bg-[#003E9E] rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {forgotLoading ? "Verifying..." : "Verify Code"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Set New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 text-xs font-bold text-white bg-[#0050CB] hover:bg-[#003E9E] rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {forgotLoading ? "Updating..." : "Update Password & Login"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Subtle bottom padding */}
      <div className="h-4" />
    </div>
  );
}
