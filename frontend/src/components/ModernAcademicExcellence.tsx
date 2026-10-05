"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Settings, TrendingUp, Shield, ArrowRight, Calendar, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ModernAcademicExcellence() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const prefersReduced = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 sm:py-28 bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFE] to-[#F1F5FB] dark:from-[#000a1f] dark:via-[#000E28] dark:to-[#000a1f] overflow-hidden select-none transition-colors duration-200"
      aria-label="Academic Excellence and Platform Features"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Ambient Radial Light Orb */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/60 via-[#0050CB]/5 to-transparent dark:from-[#0050CB]/15 dark:via-transparent rounded-full blur-3xl opacity-70" />

        {/* Floating 3D Sphere Accent (Right Side) */}
        <div className="absolute top-1/3 right-8 sm:right-16 w-8 h-8 rounded-full bg-gradient-to-br from-[#38BDF8] via-[#0050CB] to-[#000E28] shadow-[0_8px_20px_rgba(0,80,203,0.3)] hidden lg:block opacity-85" />
        
        {/* Soft floating glow lower right */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-blue-100/60 dark:bg-blue-900/15 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          
          {/* Eyebrow badge with side wings */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#0050CB]/40 dark:to-blue-400/40" />
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#E5EEFF]/80 dark:bg-[#0050CB]/20 backdrop-blur-sm border border-[#0050CB]/20 dark:border-[#0050CB]/40 text-[#0050CB] dark:text-[#E5EEFF] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-sm">
              {t("features.badge", "ONE PLATFORM. COMPLETE SCHOOL MANAGEMENT.")}
            </span>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#0050CB]/40 dark:to-blue-400/40" />
          </motion.div>

          {/* Main Section Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="font-saas text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-[#000E28] dark:text-white tracking-tight leading-[1.12]"
          >
            {t("features.title1", "Designed for Modern")} <br className="hidden sm:block" />
            <span className="text-[#0050CB] dark:text-[#38BDF8] inline-block">{t("features.title2", "Academic Excellence")}</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-slate-600 dark:text-slate-400 text-sm sm:text-base md:text-lg mt-4 max-w-2xl mx-auto leading-relaxed"
          >
            {t("features.subtitle", "Everything your school needs to operate smoothly, engage parents, empower educators, and guide student achievement.")}
          </motion.p>
        </div>

        {/* Bento Grid Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT COLUMN: Feature 1 - Intelligent Operations (Large Bento Card) */}
          <motion.div
            initial={{ opacity: 0, y: prefersReduced ? 0 : 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: prefersReduced ? 0.2 : 0.7,
              delay: prefersReduced ? 0 : 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={
              prefersReduced
                ? {}
                : {
                    y: -6,
                    boxShadow: "0 24px 50px -12px rgba(0, 14, 40, 0.10)",
                    transition: { duration: 0.25, ease: "easeOut" },
                  }
            }
            className="lg:col-span-7 group relative flex flex-col justify-between bg-white/90 dark:bg-[#001233]/90 backdrop-blur-md rounded-[28px] p-7 sm:p-9 border border-slate-200/90 dark:border-slate-800 shadow-[0_10px_35px_rgba(0,14,40,0.04)] hover:border-blue-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden"
          >
            {/* Subtle background glow & curved line */}
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-tl from-[#0050CB]/10 via-[#0050CB]/5 to-transparent blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-12 w-64 h-64 rounded-full border border-blue-100/70 dark:border-slate-800/60 bg-blue-50/20 dark:bg-blue-900/10 pointer-events-none" />

            {/* Top row: Icon + Pill Tag */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Settings className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0050CB] dark:bg-[#38BDF8] animate-pulse" />
                <span className="text-[11px] sm:text-xs font-bold tracking-wider text-[#0050CB] dark:text-[#38BDF8] uppercase">
                  {t("features.c1_tag", "SMART AUTOMATION")}
                </span>
              </div>
            </div>

            {/* Middle row: Content and Illustrated UI Preview Graphic */}
            <div className="my-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center relative z-10">
              
              {/* Text details */}
              <div className="sm:col-span-7 space-y-3">
                <h3 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight group-hover:text-[#0050CB] dark:group-hover:text-[#38BDF8] transition-colors">
                  {t("features.c1_title", "Intelligent Operations")}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-[15px] leading-relaxed font-normal">
                  {t("features.c1_desc", "Automate class scheduling, admissions workflows, facility management, and staff payroll with zero paperwork.")}
                </p>
              </div>

              {/* Illustrated Floating UI Graphic (as seen in screenshot) */}
              <div className="sm:col-span-5 relative flex items-center justify-center min-h-[170px]">
                
                {/* Floating 3D Accent Sphere */}
                <div className="absolute -top-3 right-4 w-4 h-4 rounded-full bg-gradient-to-tr from-[#0050CB] to-[#38BDF8] shadow-md z-20" />

                {/* Back card: Automated Schedule */}
                <div className="absolute -top-2 right-3 w-40 bg-white/95 dark:bg-[#001438]/95 rounded-2xl p-3 border border-blue-100 dark:border-slate-800 shadow-md transform rotate-3 transition-transform duration-300 group-hover:rotate-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    <div className="w-6 h-6 rounded-lg bg-[#0050CB] flex items-center justify-center text-white">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <div className="w-full h-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-full" />
                    <div className="w-3/4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  </div>
                </div>

                {/* Front card: Verified Checkmarks list */}
                <div className="relative z-10 w-44 bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-[0_12px_28px_rgba(0,14,40,0.08)] transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <div className="w-24 h-2 bg-[#0050CB]/40 dark:bg-blue-500/30 rounded-full" />
                    </div>
                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 ml-6" />
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom link: Explore More -> */}
            <div className="pt-2 relative z-10">
              <Link
                href="/features/intelligent-operations"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0050CB] dark:text-[#38BDF8] hover:text-[#003B99] dark:hover:text-blue-300 transition-colors group/link"
              >
                <span>{t("features.c1_link", "Explore More")}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Two Stacked Feature Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* Feature 2: Performance & Rubrics */}
            <Link href="/features/performance-rubrics" className="block flex-1 group/card">
              <motion.div
                initial={{ opacity: 0, y: prefersReduced ? 0 : 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: prefersReduced ? 0.2 : 0.7,
                  delay: prefersReduced ? 0 : 0.25,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={
                  prefersReduced
                    ? {}
                    : {
                        y: -5,
                        boxShadow: "0 22px 45px -10px rgba(0, 14, 40, 0.08)",
                        transition: { duration: 0.25, ease: "easeOut" },
                      }
                }
                className="group relative h-full flex flex-col justify-between bg-white/90 dark:bg-[#001233]/90 backdrop-blur-md rounded-[28px] p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,14,40,0.04)] hover:border-blue-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden"
              >
                {/* Subtle glass curved accent at bottom-right */}
                <div className="absolute -bottom-14 -right-10 w-44 h-44 rounded-full border border-blue-100/60 dark:border-slate-800/60 bg-blue-50/20 dark:bg-blue-900/10 pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Icon & Tag */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <TrendingUp className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0050CB] dark:bg-[#38BDF8]" />
                        <span className="text-[11px] font-bold tracking-wider text-[#0050CB] dark:text-[#38BDF8] uppercase">
                          {t("features.c2_tag", "BETTER INSIGHTS")}
                        </span>
                      </div>
                    </div>

                    {/* Right: Circular Action Arrow */}
                    <div className="w-9 h-9 rounded-full border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:border-[#0050CB] group-hover:bg-[#E5EEFF] dark:group-hover:bg-[#0050CB]/25 group-hover:text-[#0050CB] dark:group-hover:text-[#38BDF8] transition-all duration-300">
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xl font-bold text-[#000E28] dark:text-white tracking-tight group-hover:text-[#0050CB] dark:group-hover:text-[#38BDF8] transition-colors">
                      {t("features.c2_title", "Performance & Rubrics")}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                      {t("features.c2_desc", "Track cognitive, motor, and academic milestones with comprehensive teacher grading, rubrics, and automated report cards.")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Feature 3: Secure & Connected */}
            <Link href="/features/secure-connected" className="block flex-1 group/card">
              <motion.div
                initial={{ opacity: 0, y: prefersReduced ? 0 : 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: prefersReduced ? 0.2 : 0.7,
                  delay: prefersReduced ? 0 : 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={
                  prefersReduced
                    ? {}
                    : {
                        y: -5,
                        boxShadow: "0 22px 45px -10px rgba(0, 14, 40, 0.08)",
                        transition: { duration: 0.25, ease: "easeOut" },
                      }
                }
                className="group relative h-full flex flex-col justify-between bg-white/90 dark:bg-[#001233]/90 backdrop-blur-md rounded-[28px] p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,14,40,0.04)] hover:border-blue-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden"
              >
                {/* Subtle glass curved accent at bottom-right */}
                <div className="absolute -bottom-14 -right-10 w-44 h-44 rounded-full border border-blue-100/60 dark:border-slate-800/60 bg-blue-50/20 dark:bg-blue-900/10 pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Icon & Tag */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <Shield className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0050CB] dark:bg-[#38BDF8]" />
                        <span className="text-[11px] font-bold tracking-wider text-[#0050CB] dark:text-[#38BDF8] uppercase">
                          {t("features.c3_tag", "SAFE & CONNECTED")}
                        </span>
                      </div>
                    </div>

                    {/* Right: Circular Action Arrow */}
                    <div className="w-9 h-9 rounded-full border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:border-[#0050CB] group-hover:bg-[#E5EEFF] dark:group-hover:bg-[#0050CB]/25 group-hover:text-[#0050CB] dark:group-hover:text-[#38BDF8] transition-all duration-300">
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xl font-bold text-[#000E28] dark:text-white tracking-tight group-hover:text-[#0050CB] dark:group-hover:text-[#38BDF8] transition-colors">
                      {t("features.c3_title", "Secure & Connected")}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                      {t("features.c3_desc", "Role-based access control for Admins, Teachers, and Parents with instant announcements, WhatsApp updates, and real-time alerts.")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}
