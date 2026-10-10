"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Lock,
  Check,
  Headphones,
  Users,
  GraduationCap,
  ShieldCheck,
  FileText,
} from "lucide-react";
import HeroBackground from "./HeroBackground";
import HeroStudentImage from "./HeroStudentImage";
import FloatingNotificationCard from "./FloatingNotificationCard";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden select-none min-h-[640px] sm:min-h-[700px] lg:min-h-[760px] xl:min-h-[820px] flex items-center">
      {/* 1. Full-Width Premium Educational Background */}
      <HeroBackground />

      {/* 2. Main Hero Content Container */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: GGPS Headline, Subtitle, CTAs & Trust Badges */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 xl:col-span-5 text-left z-20 flex flex-col items-start">
            
            {/* Top Brand Crest Badge */}
            <motion.div
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -12 }}
              animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5EEFF]/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/60 shadow-xs mb-5"
            >
              <div className="w-5 h-5 rounded-full bg-[#0050CB] text-[#FFB703] flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] tracking-tight">
                #1 School Management Platform
              </span>
              <span className="text-blue-300 dark:text-blue-600">•</span>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                CBSE & State Board Ready
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[54px] font-black text-[#000E28] dark:text-white leading-[1.08] tracking-tight mb-5">
              <motion.span
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 18 }}
                animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="block font-serif italic font-medium text-[#0050CB] dark:text-[#38BDF8]"
              >
                Empowering
              </motion.span>
              <motion.span
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 18 }}
                animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="block tracking-tight"
              >
                Every Child&apos;s
              </motion.span>
              <motion.span
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 18 }}
                animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative inline-block text-[#0050CB] dark:text-[#38BDF8] font-black"
              >
                <span>Potential</span>
                {/* Curved swoop underline */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3.5 text-[#0050CB] dark:text-[#38BDF8]"
                  viewBox="0 0 160 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M2 12 Q 80 2, 158 10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.span>
            </h1>

            {/* Description Subtitle */}
            <motion.p
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 15 }}
              animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-[17px] leading-relaxed max-w-lg mb-7 font-normal"
            >
              {t(
                "hero.subtitle",
                "GGPS School brings together students, parents, teachers and administrators with a powerful, easy-to-use school management system."
              )}
            </motion.p>

            {/* Action CTA Buttons */}
            <motion.div
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
              animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.46, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full mb-8"
            >
              {/* Primary CTA: Enquire About Admission */}
              <Link
                href="/enquire"
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-sm shadow-md shadow-[#0050CB]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0050CB]/40 active:scale-95 overflow-hidden whitespace-nowrap"
              >
                <span className="text-[#FFB703] text-xs">✦</span>
                <span className="relative z-10 font-bold">
                  {t("nav.enquireAboutAdmission", "Enquire About Admission")}
                </span>
                <ArrowRight
                  className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={2.4}
                />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              </Link>

              {/* Secondary CTA: Start Admission Enquiry */}
              <Link
                href="/admissions"
                className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white dark:bg-slate-900 hover:bg-[#E5EEFF] dark:hover:bg-slate-800 border border-blue-200 dark:border-slate-700 hover:border-[#0050CB] text-[#0050CB] dark:text-[#38BDF8] font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <span>{t("hero.startAdmissionEnquiry", "Start Admission Enquiry")}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Trust Micro-Badges */}
            <motion.div
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.54, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4 sm:gap-5 text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center text-[#0050CB]">
                  <Lock className="w-3 h-3" />
                </div>
                <span>Safe & Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center text-[#0050CB]">
                  <Check className="w-3 h-3" />
                </div>
                <span>Easy to Use</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center text-[#0050CB]">
                  <Headphones className="w-3 h-3" />
                </div>
                <span>24/7 Support</span>
              </div>
            </motion.div>

          </div>

          {/* ======================================================== */}
          {/* CENTER-RIGHT: Student Cutout & 5 Floating Notification Cards */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center min-h-[480px] sm:min-h-[560px] lg:min-h-[620px] xl:min-h-[680px]">
            
            {/* The Schoolgirl cutout, standing center-right */}
            <div className="relative w-full flex items-end justify-center z-10">
              <HeroStudentImage />
            </div>

            {/* ====================================================== */}
            {/* 5 FLOATING NOTIFICATION CARDS (Surrounding the subject) */}
            {/* ====================================================== */}

            {/* --- LEFT SIDE CARDS (Desktop & Tablet) --- */}
            {/* Card 1: Attendance Recorded (Left Top) */}
            <div className="absolute left-[-8px] sm:left-4 lg:left-[-12px] xl:left-[10px] top-[14%] sm:top-[16%] lg:top-[18%] z-30">
              <FloatingNotificationCard
                title="Attendance Recorded"
                subtitle="Class 8-A · 09:15 AM"
                variant="emerald"
                icon={Check}
                duration={4.6}
                delay={0.2}
                floatY={7}
                className="shadow-xl"
              />
            </div>

            {/* Card 2: Exam Result Published (Left Bottom) */}
            <div className="absolute left-[-4px] sm:left-6 lg:left-[-6px] xl:left-[24px] bottom-[18%] sm:bottom-[16%] lg:bottom-[20%] z-30">
              <FloatingNotificationCard
                title="Exam Result Published"
                subtitle="Class 10 · 10:30 AM"
                variant="purple"
                icon={FileText}
                duration={5.2}
                delay={0.5}
                floatY={8}
                className="shadow-xl"
              />
            </div>

            {/* --- RIGHT SIDE CARDS (Desktop & Tablet) --- */}
            {/* Card 3: Parent Notified (Right Top) */}
            <div className="absolute right-[-8px] sm:right-4 lg:right-[-14px] xl:right-[12px] top-[12%] sm:top-[14%] lg:top-[15%] z-30">
              <FloatingNotificationCard
                title="Parent Notified"
                subtitle="09:45 AM"
                variant="blue"
                icon={Users}
                showChevron={true}
                duration={4.8}
                delay={0.35}
                floatY={7}
                className="shadow-xl"
              />
            </div>

            {/* Card 4: Fee Receipt Generated (Right Middle) */}
            <div className="absolute right-[-6px] sm:right-6 lg:right-[-20px] xl:right-[0px] top-[44%] sm:top-[46%] lg:top-[47%] z-30 hidden sm:inline-flex">
              <FloatingNotificationCard
                title="Fee Receipt Generated"
                subtitle="11:20 AM"
                variant="teal"
                customIcon="rupee"
                duration={5.0}
                delay={0.65}
                floatY={7}
                className="shadow-xl"
              />
            </div>

            {/* Card 5: New Admission (Right Bottom) */}
            <div className="absolute right-[-4px] sm:right-6 lg:right-[-8px] xl:right-[20px] bottom-[12%] sm:bottom-[14%] lg:bottom-[15%] z-30 hidden sm:inline-flex">
              <FloatingNotificationCard
                title="New Admission"
                subtitle="04:10 PM"
                variant="amber"
                icon={GraduationCap}
                duration={4.9}
                delay={0.8}
                floatY={8}
                className="shadow-xl"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
