"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView, useReducedMotion, AnimatePresence, type Variants } from 'framer-motion';
import ModernAcademicExcellence from '@/components/ModernAcademicExcellence';
import CtaBanner from '@/components/CtaBanner';
import { useLanguage } from '@/context/LanguageContext';
import { ScrollProgress } from "@/registry/magicui/scroll-progress";
import {
  ArrowRight,
  Play,
  Users,
  UserCheck,
  Settings,
  Smile,
  CreditCard,
  Wallet,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Lock,
  Headphones,
  Check,
  Star,
  Award,
  BookOpen,
  TrendingUp,
  Heart,
  X,
  Plus,
  Minus,
  Zap,
  Globe
} from 'lucide-react';

// Animated Counter Component for Smooth Number Roll-Up on Scroll
function AnimatedCount({
  from = 0,
  to,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 2.0
}: {
  from?: number;
  to: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const prefersReduced = useReducedMotion();
  const [val, setVal] = useState(() => prefersReduced ? to : from);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (prefersReduced || !isInView) return;

    let start: number | null = null;
    let animId: number;

    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setVal(from + (to - from) * ease);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setVal(to);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isInView, from, to, duration, prefersReduced]);

  return (
    <span ref={ref} className="font-data inline-block">
      {prefix}
      {decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString()}
      {suffix}
    </span>
  );
}

// Spring Zoom-In Scroll Animation Variant Generator
const springZoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 35 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 14,
      delay: i * 0.08
    }
  })
};

export default function Home() {
  const { t } = useLanguage();
  const prefersReduced = useReducedMotion();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Mouse Spotlight Position State
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Scroll reference for hero parallax effects
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const yHeroImage = useTransform(scrollYProgress, [0, 1], [0, 30]);

  // Testimonials Auto-rotate timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev: number) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      quote: "GGPS School has made our school operations so much easier. The platform is intuitive, reliable and excellent support team!",
      name: "Priya Sharma",
      role: "Principal, Sunrise Public School",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    {
      quote: "As a parent, I can easily track my child's progress, attendance and school activities. It gives me great peace of mind.",
      name: "Rajesh Kumar",
      role: "Parent",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    },
    {
      quote: "The system is simple, powerful and saves us so much time. It's truly a complete solution for modern schools.",
      name: "Anjali Verma",
      role: "Teacher",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
    }
  ];

  const faqs = [
    {
      q: "How fast can our school onboard with GGPS School?",
      a: "Our automated data importer lets you import student rosters, staff lists, and fee schedules in under 30 minutes with dedicated 24/7 migration support."
    },
    {
      q: "Does GGPS School support WhatsApp & SMS notifications?",
      a: "Yes! Instant automated WhatsApp alerts and SMS notifications are sent to parents for attendance logs, fee receipts, exam report cards, and urgent notices."
    },
    {
      q: "Is student data encrypted and secure?",
      a: "Absolutely. We enforce bank-grade AES-256 encryption, role-based access control, biometric verification, and automated daily cloud backups."
    },
    {
      q: "Can parents pay school fees online through the portal?",
      a: "Yes, our paperless fee module integrates with UPI, Credit/Debit cards, Net Banking, and auto-generated QR receipts with instant payment confirmation."
    }
  ];

  const marqueeItems = [
    "⚡ Biometric Attendance Sync",
    "📄 1-Click Report Card Generator",
    "📱 Parent Mobile Diary App",
    "💳 Paperless Instant Fee Collection",
    "🤖 AI Examination Paper Creator",
    "🔒 Bank-Grade Role Security",
    "🚀 99.9% Uptime Guarantee",
    "💬 Real-Time WhatsApp Alerts"
  ];

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-gradient-to-b from-[#F2F7FE] via-white to-[#F6F9FE] dark:from-[#000a1f] dark:via-[#000E28] dark:to-[#000a1f] overflow-hidden transition-colors duration-200"
    >

      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 80, 203, 0.07), transparent 70%)`
        }}
      />

      {/* Magic UI Animated Scroll Progress Bar below fixed navbar */}
      <ScrollProgress className="top-20 z-40" />

      {/* Dynamic Animated Ambient Background Glow Orbs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.08, 0.95, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-1/4 w-[650px] h-[650px] bg-blue-200/40 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"
      />
      <motion.div
        animate={{
          x: [0, -40, 20, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.92, 1.05, 1]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[600px] right-10 w-[550px] h-[550px] bg-sky-100/60 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none -z-10"
      />

      {/* ========================================== */}
      {/* 1. HERO SECTION WITH PHOTO COLLAGE & DOODLES */}
      {/* ========================================== */}
      <section className="relative w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-4 sm:pt-6 lg:pt-8 pb-8 lg:pb-12 lg:min-h-[calc(100vh-5rem)] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 items-center my-auto">

          {/* LEFT COLUMN: Hero Copy & CTAs */}
          <div className="lg:col-span-5 flex flex-col items-start text-left z-20 relative">
            {/* Tagline Pill */}
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.04 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 border border-blue-200/60 dark:border-[#0050CB]/40 text-[#0050CB] dark:text-[#38BDF8] text-xs sm:text-sm font-bold mb-4 shadow-2xs cursor-default"
            >
              <Sparkles className="w-4 h-4 text-[#0050CB] animate-pulse" />
              <span>{t('hero.badge', 'Modern School Management for a Brighter Tomorrow')}</span>
            </motion.div>

            {/* Main Headline with Multi-Font Editorial Pairing & Cinematic Reveal */}
            <h1 className="text-4xl sm:text-5xl lg:text-[48px] xl:text-[54px] tracking-tight leading-[1.12] mb-5 text-[#000E28] dark:text-white">
              <motion.span
                initial={{ opacity: 0, y: 22, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="block font-editorial italic font-medium tracking-normal text-[#0050CB] dark:text-[#38BDF8]"
              >
                Empowering
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 22, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
                className="block font-saas font-black tracking-tight"
              >
                Every Child's
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 22, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.65, delay: 0.46, ease: [0.16, 1, 0.3, 1] }}
                className="relative inline-block text-[#0050CB] dark:text-[#38BDF8] font-saas font-black"
              >
                <span className="text-gradient-animated text-3d-subtle">Potential</span>
                {/* Curved underline swoosh under Potential */}
                <svg className="absolute -bottom-2 left-0 w-full h-3.5 text-[#0050CB] dark:text-[#38BDF8]" viewBox="0 0 160 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.1, delay: 0.75, ease: "easeOut" }}
                    d="M2 12 Q 80 2, 158 10" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                  />
                </svg>
              </motion.span>
            </h1>

            {/* Subtitle / Description: Fade + Slide Up */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg mb-7 font-normal"
            >
              {t('hero.subtitle', 'GGPS School brings together students, parents, teachers and administrators with a powerful, easy-to-use school management system.')}
            </motion.p>

            {/* Hero Admission Assistance Banner */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 p-2.5 sm:p-3 px-4 rounded-2xl bg-[#E5EEFF]/80 dark:bg-[#001D4D]/70 border border-blue-200/90 dark:border-blue-800/60 mb-6 max-w-lg shadow-xs"
            >
              <div className="w-8 h-8 rounded-full bg-[#0050CB] text-[#FFB703] flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#000E28] dark:text-white text-xs">Have questions about admission?</p>
                <p className="text-[11px] text-slate-600 dark:text-blue-200">Talk to the GGPS School admissions team.</p>
              </div>
              <Link
                href="/enquire"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#0050CB]/25 shrink-0"
              >
                <span>Send an Enquiry</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>

            {/* CTA Buttons: Staggered Entrance with Hover Micro-Interactions */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4 w-full mb-7"
            >
              {/* Primary Button: ✦ Enquire About Admission → */}
              <Link
                href="/enquire"
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-base shadow-lg shadow-[#0050CB]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#0050CB]/40 active:scale-95 overflow-hidden"
              >
                <span className="text-[#FFB703] text-sm">✦</span>
                <span className="relative z-10 font-bold">{t('nav.enquireAboutAdmission', 'Enquire About Admission')}</span>
                <ArrowRight className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:translate-x-1.5" strokeWidth={2.4} />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              </Link>

              {/* Secondary CTA: Start Admission Enquiry */}
              <Link
                href="/enquire"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-white dark:bg-slate-900 hover:bg-[#E5EEFF] dark:hover:bg-slate-800 border-2 border-blue-200 dark:border-slate-700 hover:border-[#0050CB] text-[#0050CB] dark:text-[#38BDF8] font-bold text-base transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-2xs cursor-pointer"
              >
                <span>{t('hero.startAdmissionEnquiry', 'Start Admission Enquiry')}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Trust Micro-Badges Row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.84, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center gap-1.5 cursor-default transition-transform hover:-translate-y-0.5 duration-150">
                <div className="w-5.5 h-5.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center text-[#0050CB]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span>Safe & Secure Platform</span>
              </div>
              <div className="flex items-center gap-1.5 cursor-default transition-transform hover:-translate-y-0.5 duration-150">
                <div className="w-5.5 h-5.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center text-[#0050CB]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Easy to Use for Everyone</span>
              </div>
              <div className="flex items-center gap-1.5 cursor-default transition-transform hover:-translate-y-0.5 duration-150">
                <div className="w-5.5 h-5.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center text-[#0050CB]">
                  <Headphones className="w-3.5 h-3.5" />
                </div>
                <span>24/7 Support Always Here</span>
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Seamless Hero Visual Artwork (Branded GGPS School Composition) */}
          <motion.div
            style={{ y: yHeroImage }}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative flex items-center justify-center mt-6 lg:mt-0 select-none z-10"
          >
            <div className="relative w-full max-w-[880px] lg:max-w-none lg:w-[138%] xl:w-[148%] 2xl:w-[156%] lg:-translate-x-[40px] xl:-translate-x-[65px] 2xl:-translate-x-[85px] flex items-center justify-center">

              {/* Soft Atmospheric Ambient Backing Glow */}
              <div className="absolute -inset-8 sm:-inset-14 bg-gradient-to-tr from-[#0050CB]/20 via-sky-300/25 to-indigo-200/20 dark:from-blue-600/25 dark:via-sky-400/20 dark:to-indigo-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

              {/* Main Transparent Hero Artwork - Theme-Adaptive (Light & Dark) */}
              <div className="relative w-full flex items-center justify-center [mask-image:radial-gradient(ellipse_70%_70%_at_center,black_60%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_70%_70%_at_center,black_60%,transparent_100%)]">
                {/* Light Theme Hero Banner */}
                <Image
                  src="/hero-banner-light.jpg"
                  alt="GGPS School Modern Management Platform"
                  width={1600}
                  height={800}
                  priority
                  className="w-full h-auto object-contain select-none pointer-events-none mix-blend-multiply block dark:hidden"
                />

                {/* Dark Theme Hero Banner */}
                <Image
                  src="/hero-banner-dark.jpg"
                  alt="GGPS School Modern Management Platform"
                  width={1600}
                  height={800}
                  priority
                  className="w-full h-auto object-contain select-none pointer-events-none hidden dark:block"
                />
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* ========================================== */}
      {/* INFINITE ANIMATED TICKER MARQUEE RIBBON */}
      {/* ========================================== */}
      <div className="w-full bg-[#0050CB] text-white py-3.5 overflow-hidden select-none shadow-md border-y border-blue-400/30">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-12 font-bold text-sm tracking-wide"
        >
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-2">
              <span>{item}</span>
              <span className="w-2 h-2 rounded-full bg-blue-300 opacity-60 ml-4" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* ========================================== */}
      {/* 2. HIGHLIGHT KEY METRICS BANNER (Exact Design) */}
      {/* ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          custom={0}
          variants={springZoomIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-[#EBF3FE] via-[#F2F7FE] to-[#EAF3FE] dark:from-[#001438] dark:via-[#001742] dark:to-[#001233] rounded-[36px] sm:rounded-[48px] p-6 sm:p-8 lg:p-10 border border-blue-200/60 dark:border-blue-900/40 shadow-[0_15px_40px_rgba(0,80,203,0.06)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

            {/* LEFT WING: "Trusted by Schools Across the World" + Line-art School + Stacked Books with Sprout */}
            <div className="lg:col-span-3 flex flex-col justify-between h-full relative">
              {/* Handwritten text + curved arrow */}
              <div className="flex items-start justify-between sm:justify-start gap-4 mb-2">
                <div className="rotate-[-6deg] origin-left">
                  <p
                    style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                    className="text-[#0050CB] dark:text-[#38BDF8] text-2xl sm:text-3xl font-bold leading-[1.1] tracking-tight select-none"
                  >
                    Trusted<br />
                    by Schools<br />
                    Across the World
                  </p>
                </div>

                {/* Curved Arrow pointing down-right towards cards */}
                <div className="pt-2 text-[#0050CB] dark:text-[#38BDF8] shrink-0">
                  <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
                    <path d="M6 8 C 22 6, 36 16, 30 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M22 28 L30 35 L37 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Middle: Blue Line-Art School Icon + Outline Heart */}
              <div className="flex items-center gap-2.5 my-2">
                <div className="w-14 h-14 rounded-2xl bg-white/90 dark:bg-slate-900/80 p-2 shadow-xs border border-blue-100 dark:border-slate-800 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8]">
                  <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
                    {/* Roof & Clock Tower */}
                    <path d="M32 8 L14 22 H50 Z" stroke="currentColor" strokeWidth="2.4" fill="#E5EEFF" strokeLinejoin="round" />
                    <path d="M32 8 V3 M32 3 L39 6 L32 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#60A5FA" />
                    <circle cx="32" cy="18" r="3" stroke="currentColor" strokeWidth="1.8" fill="white" />
                    {/* Main Building Body */}
                    <rect x="18" y="22" width="28" height="28" rx="2" stroke="currentColor" strokeWidth="2.4" fill="white" />
                    {/* Arched Door */}
                    <path d="M28 50 V39 C28 36.5 36 36.5 36 39 V50" stroke="currentColor" strokeWidth="2.2" fill="#BFDBFE" />
                    {/* Windows */}
                    <rect x="21" y="27" width="5" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" fill="#E0E7FF" />
                    <rect x="38" y="27" width="5" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" fill="#E0E7FF" />
                  </svg>
                </div>
                <span
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                  className="text-2xl text-[#0050CB] dark:text-[#38BDF8] font-bold select-none"
                >
                  ♡
                </span>
              </div>

              {/* Bottom Left: Stack of 3 Colorful Books with Sprout Leaves */}
              <div className="hidden lg:block mt-1">
                <div className="relative w-28 h-20 select-none">
                  <svg viewBox="0 0 130 100" fill="none" className="w-full h-full">
                    {/* Sprout Leaves */}
                    <path d="M26 30 C 15 16, 2 24, 16 35 C 23 40, 26 30, 26 30 Z" fill="#22C55E" stroke="#16A34A" strokeWidth="1.8" />
                    <path d="M26 30 C 30 12, 48 15, 38 29 C 33 37, 26 30, 26 30 Z" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.8" />
                    <path d="M26 30 Q 24 42, 26 46" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" />

                    {/* Book 1 (Top - Blue) */}
                    <rect x="2" y="44" width="80" height="13" rx="2.5" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.8" />
                    <rect x="8" y="47" width="71" height="7" rx="1" fill="#FFFFFF" />

                    {/* Book 2 (Middle - Orange) */}
                    <rect x="2" y="59" width="94" height="14" rx="2.5" fill="#F97316" stroke="#EA580C" strokeWidth="1.8" />
                    <rect x="9" y="62" width="84" height="8" rx="1" fill="#FFFBEB" />

                    {/* Book 3 (Bottom - Green) */}
                    <rect x="2" y="75" width="108" height="15" rx="2.5" fill="#059669" stroke="#047857" strokeWidth="1.8" />
                    <rect x="10" y="78" width="97" height="9" rx="1" fill="#FFFFFF" />
                  </svg>
                </div>
              </div>

            </div>

            {/* RIGHT WING: The 4 Metric Cards in a Row */}
            <div className="lg:col-span-9 relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-4.5">

                {/* CARD 1: 99.8% Attendance Accuracy */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.015 }}
                  transition={{ duration: 0.25 }}
                  className="relative bg-white dark:bg-[#00102E] rounded-[24px] p-5 sm:p-6 shadow-[0_10px_25px_-5px_rgba(0,80,203,0.08)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] border border-blue-100/60 dark:border-blue-900/30 flex flex-col justify-between overflow-hidden cursor-default group"
                >
                  {/* Bottom-right diagonal corner wedge (Light Blue) */}
                  <div
                    className="absolute bottom-0 right-0 w-11 h-11 pointer-events-none"
                    style={{
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      backgroundColor: '#93C5FD'
                    }}
                  />

                  {/* Top Row: Icon Badge + Sparkle Doodle */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-full bg-blue-100/90 dark:bg-blue-950/60 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center shadow-2xs">
                      <Users className="w-5 h-5" />
                    </div>
                    {/* Blue Sparkle */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                      <path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" fill="currentColor" />
                      <circle cx="19" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="5" cy="18" r="1" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Middle Content */}
                  <div>
                    <div className="text-3xl sm:text-[32px] font-black text-[#000E28] dark:text-white tracking-tight leading-none mb-1.5">
                      <AnimatedCount to={99.8} decimals={1} suffix="%" />
                    </div>
                    <h4 className="text-sm sm:text-[15px] font-extrabold text-[#000E28] dark:text-white leading-snug mb-1">
                      Attendance Accuracy
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed pr-3">
                      Real-time biometric & mobile logs.
                    </p>
                  </div>
                </motion.div>

                {/* CARD 2: 100% Paperless Fee Collection */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.015 }}
                  transition={{ duration: 0.25 }}
                  className="relative bg-white dark:bg-[#00102E] rounded-[24px] p-5 sm:p-6 shadow-[0_10px_25px_-5px_rgba(0,80,203,0.08)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] border border-blue-100/60 dark:border-blue-900/30 flex flex-col justify-between overflow-hidden cursor-default group"
                >
                  {/* Bottom-right diagonal corner wedge (Mint Green) */}
                  <div
                    className="absolute bottom-0 right-0 w-11 h-11 pointer-events-none"
                    style={{
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      backgroundColor: '#86EFAC'
                    }}
                  />

                  {/* Top Row: Icon Badge + Sparkle Doodle */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
                      <Wallet className="w-5 h-5" />
                    </div>
                    {/* Emerald Sparkle */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                      <path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" fill="currentColor" />
                      <circle cx="19" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="5" cy="18" r="1" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Middle Content */}
                  <div>
                    <div className="text-3xl sm:text-[32px] font-black text-[#000E28] dark:text-white tracking-tight leading-none mb-1.5">
                      <AnimatedCount to={100} decimals={0} suffix="%" />
                    </div>
                    <h4 className="text-sm sm:text-[15px] font-extrabold text-[#000E28] dark:text-white leading-snug mb-1">
                      Paperless Fee Collection
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed pr-3">
                      Automated receipts & reminders.
                    </p>
                  </div>
                </motion.div>

                {/* CARD 3: 1-Click Report Cards & Timetables */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.015 }}
                  transition={{ duration: 0.25 }}
                  className="relative bg-white dark:bg-[#00102E] rounded-[24px] p-5 sm:p-6 shadow-[0_10px_25px_-5px_rgba(0,80,203,0.08)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] border border-blue-100/60 dark:border-blue-900/30 flex flex-col justify-between overflow-hidden cursor-default group"
                >
                  {/* Bottom-right diagonal corner wedge (Lavender Purple) */}
                  <div
                    className="absolute bottom-0 right-0 w-11 h-11 pointer-events-none"
                    style={{
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      backgroundColor: '#D8B4FE'
                    }}
                  />

                  {/* Top Row: Icon Badge + Sparkle Doodle */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-full bg-purple-100/90 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-2xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    {/* Purple Sparkle */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                      <path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" fill="currentColor" />
                      <circle cx="19" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="5" cy="18" r="1" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Middle Content */}
                  <div>
                    <div className="text-3xl sm:text-[32px] font-black text-[#000E28] dark:text-white tracking-tight leading-none mb-1.5">
                      1-Click
                    </div>
                    <h4 className="text-sm sm:text-[15px] font-extrabold text-[#000E28] dark:text-white leading-snug mb-1">
                      Report Cards & Timetables
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed pr-3">
                      Instant generation & export.
                    </p>
                  </div>
                </motion.div>

                {/* CARD 4: 24/7 Parent Portal Access */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.015 }}
                  transition={{ duration: 0.25 }}
                  className="relative bg-white dark:bg-[#00102E] rounded-[24px] p-5 sm:p-6 shadow-[0_10px_25px_-5px_rgba(0,80,203,0.08)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] border border-blue-100/60 dark:border-blue-900/30 flex flex-col justify-between overflow-hidden cursor-default group"
                >
                  {/* Bottom-right diagonal corner wedge (Warm Amber Yellow) */}
                  <div
                    className="absolute bottom-0 right-0 w-11 h-11 pointer-events-none"
                    style={{
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      backgroundColor: '#FDE047'
                    }}
                  />

                  {/* Top Row: Icon Badge + Sparkle Doodle */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-full bg-amber-100/90 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
                      <Users className="w-5 h-5" />
                    </div>
                    {/* Amber Sparkle */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amber-400">
                      <path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" fill="currentColor" />
                      <circle cx="19" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="5" cy="18" r="1" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Middle Content */}
                  <div>
                    <div className="text-3xl sm:text-[32px] font-black text-[#000E28] dark:text-white tracking-tight leading-none mb-1.5">
                      24/7
                    </div>
                    <h4 className="text-sm sm:text-[15px] font-extrabold text-[#000E28] dark:text-white leading-snug mb-1">
                      Parent Portal Access
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed pr-3">
                      Mobile diary & live updates.
                    </p>
                  </div>
                </motion.div>

              </div>

              {/* Bottom Right Doodle: Dashed Trail + "Small Steps Big Dreams ♡" */}
              <div className="flex items-center justify-end gap-2 mt-4 pr-2 select-none">
                <svg width="120" height="24" viewBox="0 0 140 28" fill="none" className="text-blue-400/70">
                  <path d="M4 22 Q 60 4, 136 18" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" fill="none" />
                </svg>
                <span
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                  className="text-[#0050CB] dark:text-[#38BDF8] text-xl sm:text-2xl font-bold tracking-tight whitespace-nowrap"
                >
                  Small Steps Big Dreams ♡
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* ========================================== */}
      {/* 3. "WHY GGPS SCHOOL" SECTION */}
      {/* ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Copy & Features List */}
          <motion.div
            custom={0}
            variants={springZoomIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold uppercase tracking-wider mb-3">
              <span>WHY GGPS SCHOOL</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-[#000E28] dark:text-white tracking-tight leading-tight mb-5">
              A Smarter Way to Manage Your School
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-8">
              From admissions to academic performance, GGPS School simplifies every process, so you can focus on what truly matters — your students.
            </p>

            {/* Checkmark Features List */}
            <div className="space-y-4 mb-9">
              {[
                'Streamlined school operations',
                'Better parent engagement',
                'Improved student outcomes',
                'Secure & reliable platform'
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 6 }}
                  className="flex items-center gap-3 cursor-default"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0050CB] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>

            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#000E28] hover:bg-[#001438] text-white font-bold text-base shadow-md transition-all duration-300 hover:scale-105"
            >
              <span>Explore Features</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Right Photo & Persona Cards Grid (Zoom-In Reveal) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Top Wide Card: Students Banner + Happy Students Card */}
            <motion.div
              custom={1}
              variants={springZoomIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="sm:col-span-2 relative h-56 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 cursor-pointer transition-transform"
            >
              <Image
                src="/hero-kids-banner.png"
                alt="Happy Students"
                fill
                sizes="(max-width: 640px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

              {/* Happy Students Floating Overlay */}
              <motion.div
                whileHover={{ scale: 1.06 }}
                className="absolute right-6 top-6 bottom-6 bg-[#FFFBEB] dark:bg-[#001438] text-slate-800 dark:text-white rounded-2xl p-5 shadow-xl max-w-[170px] flex flex-col justify-center border border-amber-200 dark:border-blue-900/50"
              >
                <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">Happy Students</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Confident learners, bright futures.</p>
              </motion.div>
            </motion.div>

            {/* Bottom Left Card: Active Parents */}
            <motion.div
              custom={2}
              variants={springZoomIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="bg-[#E6F9F0] dark:bg-emerald-950/30 rounded-3xl p-6 border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between cursor-pointer transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-lg mb-1">Active Parents</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Stay connected, be involved.</p>
              </div>
            </motion.div>

            {/* Bottom Center Photo Card + Dedicated Teachers Card */}
            <motion.div
              custom={3}
              variants={springZoomIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="relative h-44 rounded-3xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-800 cursor-pointer transition-transform"
            >
              <Image
                src="/mother-daughter-study.png"
                alt="Mother Daughter Study"
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0050CB]/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="font-extrabold text-base">Dedicated Teachers</h4>
                <p className="text-[11px] text-blue-100">Better tools, greater impact.</p>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================== */}
      {/* ========================================== */}
      {/* 4. "DESIGNED FOR MODERN ACADEMIC EXCELLENCE" SECTION (Exact Design) */}
      {/* ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* Sky-Blue / Cloud Rounded Banner Container matching Reference */}
        <div className="relative bg-gradient-to-r from-[#EBF3FE] via-[#F2F7FE] to-[#EAF3FE] dark:from-[#001438] dark:via-[#001742] dark:to-[#001233] rounded-[44px] sm:rounded-[56px] p-6 sm:p-10 lg:p-12 border border-blue-200/60 dark:border-blue-900/40 shadow-[0_15px_40px_rgba(0,80,203,0.06)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] overflow-hidden">

          {/* Decorative Outer Sprout Leaves & Star */}
          <div className="absolute top-1/2 -left-1 hidden sm:block pointer-events-none select-none text-amber-400">
            <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
              <path d="M15 2 L18 12 L28 15 L18 18 L15 28 L12 18 L2 15 L12 12 Z" stroke="#FBBF24" strokeWidth="2.4" strokeLinejoin="round" fill="#FEF08A" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -left-2 pointer-events-none select-none">
            <svg width="46" height="46" viewBox="0 0 50 50" fill="none">
              <path d="M12 40 C 2 30, 6 12, 24 20 C 32 25, 24 38, 12 40 Z" fill="#4ADE80" stroke="#22C55E" strokeWidth="2" />
              <path d="M18 42 C 28 35, 42 38, 38 22 C 28 16, 20 28, 18 42 Z" fill="#22C55E" stroke="#16A34A" strokeWidth="2" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-2 pointer-events-none select-none">
            <svg width="46" height="46" viewBox="0 0 50 50" fill="none">
              <path d="M38 40 C 48 30, 44 12, 26 20 C 18 25, 26 38, 38 40 Z" fill="#4ADE80" stroke="#22C55E" strokeWidth="2" />
              <path d="M32 42 C 22 35, 8 38, 12 22 C 22 16, 30 28, 32 42 Z" fill="#22C55E" stroke="#16A34A" strokeWidth="2" />
            </svg>
          </div>

          {/* Section Header with Floating Airplane & "Better Learning Together" */}
          <div className="relative mb-10 sm:mb-12">
            <div className="max-w-2xl">
              {/* Top Tagline */}
              <div className="inline-flex items-center gap-2 text-[#0050CB] dark:text-[#38BDF8] text-xs font-black uppercase tracking-wider mb-2.5">
                <span>✦ POWERFUL FEATURES</span>
                <span className="w-10 h-[2px] bg-[#0050CB]/40 dark:bg-[#38BDF8]/40" />
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000E28] dark:text-white tracking-tight leading-[1.14] mb-3">
                Designed for Modern<br />
                <span className="text-[#0050CB] dark:text-[#38BDF8]">Academic Excellence</span>
              </h2>

              {/* Subtitle */}
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Everything your school needs to operate smoothly, engage parents, empower educators, and guide student achievement.
              </p>
            </div>

            {/* Doodled Flying Airplane & "Better Learning Together" Cursive Note */}
            <div className="absolute top-0 right-2 lg:right-8 hidden md:flex items-center gap-4 pointer-events-none select-none">
              <svg width="95" height="60" viewBox="0 0 110 65" fill="none">
                <path d="M8 50 C 26 58, 48 40, 44 22 C 40 10, 22 14, 30 30 C 38 48, 65 35, 85 14" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
                <g transform="translate(80, 8) rotate(-15)">
                  <polygon points="0,16 24,0 16,24 8,17" fill="#93C5FD" />
                  <polygon points="0,16 24,0 9,15" fill="#2563EB" />
                </g>
              </svg>

              <div className="flex flex-col items-center rotate-[8deg]">
                <p
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                  className="text-[#0050CB] dark:text-[#38BDF8] text-2xl lg:text-3xl font-bold leading-tight text-center"
                >
                  Better<br />Learning<br />Together
                </p>
                <svg width="22" height="26" viewBox="0 0 28 32" fill="none" className="text-[#0050CB] dark:text-[#38BDF8] mt-0.5">
                  <path d="M14 2 C 20 9, 20 18, 10 26 M 10 26 L 16 24 M 10 26 L 12 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* 3 Solution Graphic Cards (with Playful Angles) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">

            {/* CARD 1: Intelligent Operations (Green Theme, Tilted -2deg) */}
            <motion.div
              custom={1}
              variants={springZoomIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6, rotate: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white dark:bg-[#00102E] rounded-[32px] sm:rounded-[36px] p-6 sm:p-7 border border-emerald-100 dark:border-emerald-900/30 shadow-[0_12px_35px_rgba(16,185,129,0.08)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden cursor-default group lg:rotate-[-2deg] transition-all"
            >
              {/* Bottom-right diagonal corner wedge (Emerald) */}
              <div
                className="absolute bottom-0 right-0 w-14 h-14 pointer-events-none rounded-tl-[32px] bg-[#10B981]"
              />

              <div className="grid grid-cols-12 gap-3.5 items-center h-full">
                {/* Left Details */}
                <div className="col-span-7 flex flex-col justify-between h-full pr-1 z-10">
                  <div>
                    {/* Square Green Icon Badge */}
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md mb-3.5 group-hover:scale-105 transition-transform">
                      <Settings className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#000E28] dark:text-white leading-snug mb-2">
                      Intelligent Operations
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4">
                      Automate class scheduling, admissions workflows, facility management, and staff payroll with zero paperwork.
                    </p>
                  </div>

                  <Link
                    href="/admissions"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:gap-2.5 transition-all group-hover:underline"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform" />
                  </Link>
                </div>

                {/* Right Cutout Photo of Student Girl */}
                <div className="col-span-5 relative h-48 sm:h-52 flex items-end justify-center">
                  {/* Soft Mint Curved Backdrop Shape */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/80 via-emerald-50/60 to-teal-100/50 dark:from-emerald-950/40 dark:to-teal-950/30 rounded-2xl sm:rounded-3xl -z-10" />

                  <div className="relative w-full h-[180px] sm:h-[195px] rounded-2xl overflow-hidden">
                    <Image
                      src="/hero-girl-student.png"
                      alt="Intelligent Operations Student"
                      fill
                      sizes="(max-width: 768px) 40vw, 15vw"
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 2: Performance & Rubrics (Purple Theme, Straight) */}
            <motion.div
              custom={2}
              variants={springZoomIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white dark:bg-[#00102E] rounded-[32px] sm:rounded-[36px] p-6 sm:p-7 border border-purple-100 dark:border-purple-900/30 shadow-[0_12px_35px_rgba(168,85,247,0.08)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden cursor-default group lg:rotate-0 transition-all"
            >
              {/* Bottom-right diagonal corner wedge (Purple) */}
              <div
                className="absolute bottom-0 right-0 w-14 h-14 pointer-events-none rounded-tl-[32px] bg-[#A855F7]"
              />

              <div className="grid grid-cols-12 gap-3.5 items-center h-full">
                {/* Left Details */}
                <div className="col-span-7 flex flex-col justify-between h-full pr-1 z-10">
                  <div>
                    {/* Square Purple Icon Badge */}
                    <div className="w-11 h-11 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-md mb-3.5 group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#000E28] dark:text-white leading-snug mb-2">
                      Performance & Rubrics
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4">
                      Track cognitive, motor, and academic milestones with teacher grading, rubrics, and automated report cards.
                    </p>
                  </div>

                  <Link
                    href="/admissions"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 hover:gap-2.5 transition-all group-hover:underline"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform" />
                  </Link>
                </div>

                {/* Right Cutout Photo of Student Boy Writing + A+ Badge */}
                <div className="col-span-5 relative h-48 sm:h-52 flex items-end justify-center">
                  {/* Soft Purple Backdrop Shape */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/80 via-purple-50/60 to-fuchsia-100/50 dark:from-purple-950/40 dark:to-fuchsia-950/30 rounded-2xl sm:rounded-3xl -z-10" />

                  {/* Floating A+ Badge */}
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-2 left-1 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-purple-400 text-purple-600 dark:text-purple-300 font-extrabold text-xs flex items-center justify-center shadow-md select-none"
                  >
                    A+
                  </motion.div>

                  <div className="relative w-full h-[180px] sm:h-[195px] rounded-2xl overflow-hidden">
                    <Image
                      src="/student-raising-hand.png"
                      alt="Performance & Rubrics Student"
                      fill
                      sizes="(max-width: 768px) 40vw, 15vw"
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 3: Secure & Connected (Amber/Orange Theme, Tilted +2deg) */}
            <motion.div
              custom={3}
              variants={springZoomIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6, rotate: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white dark:bg-[#00102E] rounded-[32px] sm:rounded-[36px] p-6 sm:p-7 border border-amber-100 dark:border-amber-900/30 shadow-[0_12px_35px_rgba(255,105,12,0.08)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden cursor-default group lg:rotate-[2deg] transition-all"
            >
              {/* Bottom-right diagonal corner wedge (Amber) */}
              <div
                className="absolute bottom-0 right-0 w-14 h-14 pointer-events-none rounded-tl-[32px] bg-[#FF690C]"
              />

              <div className="grid grid-cols-12 gap-3.5 items-center h-full">
                {/* Left Details */}
                <div className="col-span-7 flex flex-col justify-between h-full pr-1 z-10">
                  <div>
                    {/* Square Amber Icon Badge */}
                    <div className="w-11 h-11 rounded-2xl bg-[#FF690C] text-white flex items-center justify-center shadow-md mb-3.5 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#000E28] dark:text-white leading-snug mb-2">
                      Secure & Connected
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4">
                      Role-based access control for Admins, Teachers, and Parents; instant announcements, WhatsApp updates, real-time alerts.
                    </p>
                  </div>

                  <Link
                    href="/admissions"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FF690C] hover:gap-2.5 transition-all group-hover:underline"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform" />
                  </Link>
                </div>

                {/* Right Cutout Photo of Mother & Daughter Studying + Shield Badge */}
                <div className="col-span-5 relative h-48 sm:h-52 flex items-end justify-center">
                  {/* Soft Amber Backdrop Shape */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/80 via-orange-50/60 to-amber-100/50 dark:from-amber-950/40 dark:to-orange-950/30 rounded-2xl sm:rounded-3xl -z-10" />

                  {/* Floating Shield Badge */}
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-2 left-1 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-amber-400 text-amber-500 flex items-center justify-center shadow-md select-none"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </motion.div>

                  <div className="relative w-full h-[180px] sm:h-[195px] rounded-2xl overflow-hidden">
                    <Image
                      src="/mother-daughter-study.png"
                      alt="Secure & Connected"
                      fill
                      sizes="(max-width: 768px) 40vw, 15vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================== */}
      {/* 5. "OUR IMPACT" SECTION */}
      {/* ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Left Column: Student Photo + Floating Pill */}
          <motion.div
            custom={1}
            variants={springZoomIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="lg:col-span-5 relative h-[360px] rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-[#001438] cursor-pointer transition-transform"
          >
            <Image
              src="/student-raising-hand.png"
              alt="Student raising hand"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-top"
            />
            {/* Floating Pill Badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-6 left-6 bg-white dark:bg-[#001438] rounded-full px-5 py-2.5 shadow-lg border border-slate-100 dark:border-slate-800 flex items-center gap-2"
            >
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
                😊
              </span>
              <span className="text-xs font-extrabold text-[#000E28] dark:text-white">
                Small Steps Big Dreams
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column: Title + Impact Stats */}
          <motion.div
            custom={2}
            variants={springZoomIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold uppercase tracking-wider mb-3">
              <span>OUR IMPACT</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-[#000E28] dark:text-white tracking-tight leading-tight mb-4">
              Real Growth. Lasting Success.
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-10">
              We're proud to support schools in building a better future through technology, trust and innovation.
            </p>

            {/* 3 Impact Numbers Grid */}
            <div className="grid grid-cols-3 gap-6 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#000E28] dark:text-white tracking-tight leading-none mb-2">
                  <AnimatedCount to={500} suffix="+" />
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Schools Trusted
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#000E28] dark:text-white tracking-tight leading-none mb-2">
                  <AnimatedCount to={50000} suffix="+" />
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Students Enrolled
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#000E28] dark:text-white tracking-tight leading-none mb-2">
                  <AnimatedCount to={99.9} decimals={1} suffix="%" />
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  System Uptime
                </div>
              </div>
            </div>

          </motion.div>

        </div>
      </section>

      {/* ========================================== */}
      {/* 6. "WHAT SCHOOLS SAY" TESTIMONIALS SECTION */}
      {/* ========================================== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 overflow-hidden">

        {/* Top-Left Origami Paper Airplane Doodle */}
        <div className="absolute top-6 sm:top-10 left-4 sm:left-10 lg:left-14 hidden md:flex items-center pointer-events-none select-none z-10 opacity-90">
          <svg width="85" height="50" viewBox="0 0 100 55" fill="none">
            <path d="M5 45 C 22 52, 40 38, 36 20 C 32 8, 16 12, 22 26 C 28 40, 52 30, 72 12" stroke="#60A5FA" strokeWidth="1.8" strokeDasharray="3.5 3.5" strokeLinecap="round" />
            <g transform="translate(68, 6) rotate(-14)">
              <polygon points="0,15 22,0 14,22 7,16" fill="#93C5FD" />
              <polygon points="0,15 22,0 8,14" fill="#0050CB" />
              <polyline points="0,15 22,0 14,22 7,16 0,15" stroke="#FFFFFF" strokeWidth="0.8" />
            </g>
          </svg>
        </div>

        {/* Top-Right Doodled Note: "Better Learning Together ♡" */}
        <div className="absolute top-4 sm:top-8 right-6 sm:right-12 lg:right-16 hidden md:flex flex-col items-center rotate-[8deg] pointer-events-none select-none z-10">
          <span
            style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
            className="text-[#0050CB] dark:text-[#38BDF8] text-2xl lg:text-[28px] font-bold leading-tight text-center"
          >
            Better<br />Learning<br />Together ♡
          </span>
          <svg width="68" height="12" viewBox="0 0 70 12" fill="none" className="text-[#0050CB] dark:text-[#38BDF8] mt-0.5">
            <path d="M2 6 C 20 2, 50 10, 68 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 border border-blue-200/60 dark:border-[#0050CB]/40 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold uppercase tracking-wider mb-3 select-none">
            <GraduationCap className="w-4 h-4" />
            <span>WHAT SCHOOLS SAY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000E28] dark:text-white tracking-tight leading-[1.14] mb-3">
            Trusted by Educators,<br />
            <span className="text-[#0050CB] dark:text-[#38BDF8]">Loved by Parents</span>
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Real stories from schools, teachers and parents who are building a better future with GGPS School.
          </p>
        </div>

        {/* 3 Playful Stationery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-7 items-stretch relative z-10">

          {/* CARD 1: Priya Sharma (Principal, Sunrise Public School) */}
          <motion.div
            custom={1}
            variants={springZoomIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -8, rotate: 0 }}
            onClick={() => setActiveTestimonial(0)}
            className="relative lg:rotate-[-1.8deg] transition-all duration-300 cursor-pointer flex flex-col"
          >
            {/* Light-blue backing sheet peeking behind */}
            <div className="absolute inset-0 bg-[#D9E8FF] dark:bg-blue-950/60 rounded-[28px] transform -translate-x-1.5 -translate-y-1.5 -rotate-1 shadow-sm" />

            {/* Main White Note Sheet */}
            <div className={`relative bg-white dark:bg-[#001438] rounded-[26px] p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between flex-1 min-h-[330px] ${activeTestimonial === 0
                ? "border-[#0050CB] shadow-[0_16px_40px_rgba(0,80,203,0.18)] ring-2 ring-[#0050CB]/20"
                : "border-blue-100/90 dark:border-blue-900/40 shadow-[0_10px_30px_rgba(0,80,203,0.06)]"
              }`}>

              {/* Paper Clip on top-left */}
              <div className="absolute -top-3 left-6 z-20 pointer-events-none select-none">
                <svg width="26" height="46" viewBox="0 0 28 48" fill="none">
                  <path
                    d="M8 12 V 34 C 8 40, 20 40, 20 34 V 8 C 20 2, 4 2, 4 10 V 38 C 4 46, 24 46, 24 38 V 16"
                    stroke="#2563EB"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    className="drop-shadow-sm"
                  />
                </svg>
              </div>

              <div>
                {/* Top Header: Avatar + Info + Stars */}
                <div className="flex items-center gap-3.5 mb-4 pt-1">
                  <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ring-blue-100 dark:ring-blue-900/60 shrink-0 shadow-xs">
                    <Image
                      src="/avatar-priya.png"
                      alt="Priya Sharma"
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-[#000E28] dark:text-white leading-snug">
                      Priya Sharma
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                      Principal, Sunrise Public School
                    </p>
                    {/* 5 Golden Stars */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Body Quote */}
                <p className="font-editorial italic text-slate-700 dark:text-slate-200 text-sm sm:text-[15.5px] leading-relaxed mb-6 font-normal">
                  “GGPS School has made our school operations so much easier. The platform is intuitive, reliable and excellent support team!”
                </p>
              </div>

              {/* Bottom Footer: School Info + "Great Platform! ♡" Doodle */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3L2 8V10H4V19H2V21H22V19H20V10H22V8L12 3ZM6 10H8V13H6V10ZM10 10H14V13H10V10ZM16 10H18V13H16V10ZM6 15H8V19H6V15ZM10 15H14V21H10V15ZM16 15H18V19H16V15Z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#0050CB] dark:text-[#38BDF8] leading-tight">
                      Sunrise Public School
                    </h4>
                    <p className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase">
                      LEARN · GROW · EXCEL
                    </p>
                  </div>
                </div>

                {/* Handwritten cursive note */}
                <span
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                  className="text-[#0050CB] dark:text-[#38BDF8] text-base sm:text-lg font-bold rotate-[-6deg] select-none whitespace-nowrap"
                >
                  Great<br />Platform! ♡
                </span>
              </div>

            </div>
          </motion.div>

          {/* CARD 2: Rajesh Kumar (Parent) */}
          <motion.div
            custom={2}
            variants={springZoomIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -8, rotate: 0 }}
            onClick={() => setActiveTestimonial(1)}
            className="relative lg:rotate-[0.5deg] transition-all duration-300 cursor-pointer flex flex-col"
          >
            {/* Main White Note Sheet */}
            <div className={`relative bg-white dark:bg-[#001438] rounded-[26px] p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between flex-1 min-h-[330px] ${activeTestimonial === 1
                ? "border-[#0050CB] shadow-[0_20px_45px_rgba(0,80,203,0.18)] ring-2 ring-[#0050CB]/20"
                : "border-slate-100 dark:border-blue-900/40 shadow-[0_14px_38px_rgba(0,80,203,0.08)]"
              }`}>

              {/* Yellow Washi Tape on top-right */}
              <div className="absolute -top-3.5 right-8 z-20 pointer-events-none select-none">
                <div className="w-16 sm:w-18 h-6 bg-[#FDE68A]/85 dark:bg-amber-400/50 backdrop-blur-xs border-y border-amber-300/60 rotate-[14deg] shadow-xs rounded-xs flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </div>

              <div>
                {/* Top Header: Avatar + Info + Stars */}
                <div className="flex items-center gap-3.5 mb-4 pt-1">
                  <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ring-sky-100 dark:ring-blue-900/60 shrink-0 shadow-xs">
                    <Image
                      src="/avatar-rajesh.png"
                      alt="Rajesh Kumar"
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-[#000E28] dark:text-white leading-snug">
                      Rajesh Kumar
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                      Parent
                    </p>
                    {/* 5 Golden Stars */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Body Quote */}
                <p className="font-editorial italic text-slate-700 dark:text-slate-200 text-sm sm:text-[15.5px] leading-relaxed mb-6 font-normal">
                  “As a parent, I can easily track my child's progress, attendance and school activities. It gives me great peace of mind.”
                </p>
              </div>

              {/* Bottom Footer: Happy Parent + Golden Heart Sparkle */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#000E28] dark:text-white leading-tight">
                      Happy Parent
                    </h4>
                    <p className="text-[9px] font-medium text-slate-400">
                      Building a brighter future
                    </p>
                  </div>
                </div>

                {/* Golden Doodle Heart with Rays */}
                <div className="flex items-center justify-center text-amber-400 select-none">
                  <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                    <path d="M16 26 C 16 26, 6 19, 6 12 C 6 8, 9 5, 13 5 C 15 5, 16 7, 16 7 C 16 7, 17 5, 19 5 C 23 5, 26 8, 26 12 C 26 19, 16 26, 16 26 Z" fill="#FBBF24" />
                    <line x1="16" y1="1" x2="16" y2="3" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                    <line x1="28" y1="4" x2="26" y2="6" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                    <line x1="4" y1="4" x2="6" y2="6" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

            </div>
          </motion.div>

          {/* CARD 3: Anjali Verma (Teacher) */}
          <motion.div
            custom={3}
            variants={springZoomIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -8, rotate: 0 }}
            onClick={() => setActiveTestimonial(2)}
            className="relative lg:rotate-[1.8deg] transition-all duration-300 cursor-pointer flex flex-col"
          >
            {/* Soft Mint Green backing sheet peeking behind */}
            <div className="absolute inset-0 bg-[#D4EDDA] dark:bg-emerald-950/60 rounded-[28px] transform translate-x-1.5 -translate-y-1.5 rotate-1 shadow-sm" />

            {/* Main White Note Sheet */}
            <div className={`relative bg-white dark:bg-[#001438] rounded-[26px] p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between flex-1 min-h-[330px] ${activeTestimonial === 2
                ? "border-[#0050CB] shadow-[0_16px_40px_rgba(16,185,129,0.18)] ring-2 ring-[#0050CB]/20"
                : "border-emerald-100/80 dark:border-emerald-900/40 shadow-[0_10px_30px_rgba(16,185,129,0.06)]"
              }`}>

              <div>
                {/* Top Header: Avatar + Info + Stars */}
                <div className="flex items-center gap-3.5 mb-4 pt-1">
                  <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ring-emerald-100 dark:ring-emerald-900/60 shrink-0 shadow-xs">
                    <Image
                      src="/avatar-anjali.png"
                      alt="Anjali Verma"
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-[#000E28] dark:text-white leading-snug">
                      Anjali Verma
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                      Teacher
                    </p>
                    {/* 5 Golden Stars */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Body Quote */}
                <p className="font-editorial italic text-slate-700 dark:text-slate-200 text-sm sm:text-[15.5px] leading-relaxed mb-6 font-normal">
                  “The system is simple, powerful and saves us so much time. It's truly a complete solution for modern schools.”
                </p>
              </div>

              {/* Bottom Footer: Academy Info + "Highly Recommended" Stamp */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#000E28] dark:text-white leading-tight">
                      Modern Learning School
                    </h4>
                    <p className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase">
                      EDUCATE · EMPOWER · EXCEL
                    </p>
                  </div>
                </div>

                {/* Handwritten cursive stamp: "Highly Recommended" */}
                <div className="flex flex-col items-center rotate-[-8deg] select-none">
                  <span
                    style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                    className="text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-extrabold leading-tight whitespace-nowrap"
                  >
                    Highly<br />Recommended
                  </span>
                  <svg width="45" height="6" viewBox="0 0 50 6" fill="none" className="text-emerald-500">
                    <path d="M2 3 C 15 1, 35 5, 48 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

            </div>
          </motion.div>

        </div>

        {/* Carousel Pagination Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mt-10 sm:mt-12 select-none relative z-10">
          <button
            type="button"
            onClick={() => setActiveTestimonial(0)}
            className={`rounded-full transition-all duration-300 cursor-pointer ${activeTestimonial === 0
                ? "w-8 h-2.5 bg-[#0050CB]"
                : "w-2.5 h-2.5 bg-blue-200 dark:bg-blue-900/60 hover:bg-blue-300"
              }`}
          />
          <button
            type="button"
            onClick={() => setActiveTestimonial(1)}
            className={`rounded-full transition-all duration-300 cursor-pointer ${activeTestimonial === 1
                ? "w-8 h-2.5 bg-[#0050CB]"
                : "w-2.5 h-2.5 bg-blue-200 dark:bg-blue-900/60 hover:bg-blue-300"
              }`}
          />
          <button
            type="button"
            onClick={() => setActiveTestimonial(2)}
            className={`rounded-full transition-all duration-300 cursor-pointer ${activeTestimonial === 2
                ? "w-8 h-2.5 bg-[#0050CB]"
                : "w-2.5 h-2.5 bg-blue-200 dark:bg-blue-900/60 hover:bg-blue-300"
              }`}
          />
        </div>

      </section>

      {/* ========================================== */}
      {/* INTERACTIVE FAQ ACCORDION SECTION */}
      {/* ========================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold uppercase tracking-wider block mb-2">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#000E28] dark:text-white tracking-tight">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white dark:bg-[#001438] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-extrabold text-base text-[#000E28] dark:text-white hover:text-[#0050CB] dark:hover:text-[#38BDF8] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 ${openFaq === idx ? "bg-[#0050CB] text-white rotate-180" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </button>

              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* 7. BOTTOM CTA BANNER */}
      {/* ========================================== */}
      {/* ========================================== */}
      {/* 7. BOTTOM CTA BANNER (Coded Component Redesign) */}
      {/* ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 mb-10">
        <motion.div
          custom={0}
          variants={springZoomIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ scale: 1.008 }}
          transition={{ duration: 0.3 }}
          className="relative bg-gradient-to-r from-[#0047B6] via-[#004EB8] to-[#120D4E] text-white rounded-[32px] sm:rounded-[42px] lg:rounded-[50px] p-6 sm:p-8 lg:p-10 min-h-[220px] sm:min-h-[240px] lg:min-h-[250px] flex items-center overflow-hidden shadow-[0_20px_60px_rgba(0,71,182,0.3)] border-2 border-white/20 dark:border-blue-900/40"
        >
          {/* Left Visual Artwork: Close-Up School Campus & Students */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[36%] md:w-[32%] lg:w-[28%] max-w-[360px] hidden md:block overflow-hidden pointer-events-none select-none z-0"
            style={{
              maskImage: "linear-gradient(to right, rgba(0,0,0,1) 62%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 62%, rgba(0,0,0,0) 100%)"
            }}
          >
            <Image
              src="/cta-students-school.jpg"
              alt="GGPS School Students"
              fill
              priority
              sizes="(max-width: 768px) 0px, 28vw"
              className="object-cover object-bottom"
            />
            {/* Soft blue gradient blend overlay */}
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[#0047B6]/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0047B6]/25 via-transparent to-transparent" />
          </div>

          {/* Doodled Flying Airplane + "A Brighter Future Awaits" */}
          <div className="absolute top-2.5 sm:top-3 lg:top-4 left-[18%] md:left-[20%] lg:left-[22%] xl:left-[22%] hidden md:flex items-center gap-2 pointer-events-none select-none z-10">
            <svg width="56" height="32" viewBox="0 0 76 42" fill="none" className="shrink-0 drop-shadow">
              <path
                d="M5 34 C 15 38, 26 28, 24 18 C 22 8, 11 12, 17 21 C 23 29, 39 23, 52 10"
                stroke="#93C5FD"
                strokeWidth="1.8"
                strokeDasharray="3.5 3.5"
                strokeLinecap="round"
              />
              <g transform="translate(50, 2) rotate(-18)">
                <polygon points="0,15 22,0 14,22 7,16" fill="#BFDBFE" />
                <polygon points="0,15 22,0 8,14" fill="#FFFFFF" />
                <polyline points="0,15 22,0 14,22 7,16 0,15" stroke="#FFFFFF" strokeWidth="0.8" />
              </g>
            </svg>
            <span
              style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              className="text-white text-sm sm:text-base lg:text-lg font-bold tracking-tight rotate-[-4deg] whitespace-nowrap drop-shadow leading-tight"
            >
              A Brighter<br />Future Awaits
            </span>
          </div>

          {/* Center Main Content (Positioned with clear breathing room from doodle) */}
          <div className="relative z-10 w-full md:w-auto md:ml-[43%] lg:ml-[44%] xl:ml-[44%] max-w-xl flex flex-col justify-center">
            {/* Tagline Pill */}
            <div className="self-start inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-sky-300/40 bg-sky-400/15 text-sky-200 text-[11px] font-extrabold tracking-wider uppercase mb-2 select-none backdrop-blur-sm">
              <span>&lt; READY TO GET STARTED? &gt;</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[36px] font-black text-white tracking-tight leading-[1.15] mb-2 lg:whitespace-nowrap">
              Join GGPS School Today
            </h2>

            {/* Subtitle */}
            <p className="text-blue-100/90 text-xs sm:text-sm lg:text-[14px] leading-relaxed mb-4 font-normal max-w-lg">
              Give your school the tools it needs to grow, succeed and make a lasting impact.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
              {/* Primary Button */}
              <Link
                href="/admissions"
                className="group relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white hover:bg-blue-50 text-[#0050CB] font-extrabold text-xs sm:text-sm shadow-[0_4px_18px_rgba(0,0,0,0.18)] transition-all duration-300 hover:scale-[1.04] active:scale-95"
              >
                <span>Apply for Admission</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              {/* Secondary Button */}
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#002D7A]/50 hover:bg-[#002D7A]/80 border border-white/40 hover:border-white/70 text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-[1.04] active:scale-95 backdrop-blur-sm shadow-sm"
              >
                <div className="w-4 h-4 rounded-full border-[1.5px] border-white/90 flex items-center justify-center text-[8px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <span>Admin Sign In</span>
              </Link>
            </div>
          </div>

          {/* Right Side Looping Trail + "Education Builds Tomorrow ♡" */}
          <div className="absolute right-4 sm:right-6 lg:right-8 bottom-3 sm:bottom-4 hidden lg:flex items-center gap-2.5 pointer-events-none select-none z-10">
            {/* Looping dotted trajectory */}
            <div className="relative">
              <svg width="90" height="42" viewBox="0 0 110 52" fill="none" className="text-sky-300/80">
                <path
                  d="M5 38 C 25 44, 52 48, 66 30 C 76 17, 62 8, 54 18 C 45 29, 66 42, 102 20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeDasharray="3.5 3.5"
                  strokeLinecap="round"
                />
                {/* Yellow star / sparkle */}
                <polygon points="96,15 97.5,18.5 101,18.5 98,20.5 99,24 96,21.5 93,24 94,20.5 91,18.5 94.5,18.5" fill="#FDE047" />
              </svg>
            </div>
            <span
              style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              className="text-white text-lg sm:text-xl lg:text-[24px] font-bold leading-tight tracking-tight rotate-[6deg] whitespace-nowrap drop-shadow"
            >
              Education<br />Builds<br />Tomorrow ♡
            </span>
          </div>
        </motion.div>
      </section>

      {/* ========================================== */}
      {/* 8. VIDEO MODAL / LIGHTBOX */}
      {/* ========================================== */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl bg-white dark:bg-[#001438] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-6"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <h3 className="text-lg font-black text-[#000E28] dark:text-white">GGPS School Overview</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Placeholder Frame */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-tr from-[#000E28] to-[#0050CB] flex flex-col items-center justify-center text-white p-8">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4 animate-pulse">
                <Play className="w-10 h-10 fill-current ml-1" />
              </div>
              <h4 className="text-2xl font-black mb-2 text-center">Interactive ERP Tour Video</h4>
              <p className="text-blue-100 text-sm max-w-md text-center">
                Discover how GGPS School automates admissions, fee collection, student attendance, and report cards.
              </p>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
