"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Star,
  CheckCircle2,
  Lock,
} from "lucide-react";
import SchoolHeroBackground from "./SchoolHeroBackground";
import SchoolStats from "./SchoolStats";
import SchoolBenefits from "./SchoolBenefits";
import HeroActionButtons from "./HeroActionButtons";

export default function SchoolHero() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden select-none">
      {/* 1. Surrounding Soft Sky-Blue Ambient Background */}
      <SchoolHeroBackground />

      {/* 2. Main Large Rounded Hero Banner Card Container */}
      <div className="relative w-full max-w-[1520px] mx-auto px-3 sm:px-5 lg:px-8 pt-2 sm:pt-4 pb-8 sm:pb-12">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] shadow-[0_25px_70px_-15px_rgba(0,80,203,0.28)] dark:shadow-[0_25px_70px_-10px_rgba(0,10,40,0.85)] border border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-r from-blue-900 via-[#003893] to-[#0050CB]">
          
          <div className="relative min-h-[540px] sm:min-h-[580px] lg:min-h-[600px] xl:min-h-[640px] flex flex-col lg:flex-row items-stretch">
            
            {/* ======================================================== */}
            {/* LEFT SECTION: Realistic School Campus Image & Students   */}
            {/* ======================================================== */}
            <div className="relative w-full lg:w-[48%] xl:w-[46%] min-h-[320px] sm:min-h-[380px] lg:min-h-full overflow-hidden">
              {/* Campus Photography with Students Walking with Backpacks */}
              <Image
                src="/ggps-school-campus-hero.jpg"
                alt="GGPS School Campus and Students Walking to School"
                fill
                priority
                quality={95}
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover object-center lg:object-[45%_center] transition-transform duration-700 hover:scale-105"
              />

              {/* Depth of Field Vignette Layers */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35 lg:to-transparent pointer-events-none" />

              {/* Top-Left School Brand Crest Badge */}
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/92 dark:bg-[#000E28]/92 backdrop-blur-md border border-white/70 dark:border-white/10 shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#0050CB] flex items-center justify-center text-white shadow-xs">
                    <GraduationCap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs sm:text-sm font-black text-[#000E28] dark:text-white leading-tight tracking-tight">
                      GGPS School
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                      School Management System
                    </span>
                  </div>
                </Link>
              </div>

              {/* Bottom-Left Floating White Statistics Panel */}
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto z-20">
                <SchoolStats />
              </div>
            </div>

            {/* ======================================================== */}
            {/* S-CURVE WAVE DIVIDER WITH SUBTLE YELLOW ACCENT SWOOSH   */}
            {/* ======================================================== */}
            <div className="hidden lg:block absolute left-[44%] xl:left-[43%] top-0 bottom-0 w-24 xl:w-32 z-10 pointer-events-none">
              <svg
                className="w-full h-full"
                viewBox="0 0 120 600"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="schoolWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0043AF" />
                    <stop offset="50%" stopColor="#0050CB" />
                    <stop offset="100%" stopColor="#00358C" />
                  </linearGradient>
                  <linearGradient id="schoolWaveGlow" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0050CB" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Back wave shadow layer */}
                <path
                  d="M 60,0 C 110,180 0,380 60,600 L 120,600 L 120,0 Z"
                  fill="url(#schoolWaveGrad)"
                />
                {/* Soft ambient wave ripple */}
                <path
                  d="M 40,0 C 95,190 -10,390 40,600 L 70,600 C 10,390 115,190 60,0 Z"
                  fill="url(#schoolWaveGlow)"
                />
                {/* Subtle Yellow Accent Wave Curve */}
                <path
                  d="M 52,40 C 102,210 -3,390 52,560"
                  stroke="#FFD13B"
                  strokeWidth="3.2"
                  strokeOpacity="0.65"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* ======================================================== */}
            {/* RIGHT SECTION: Dark-Blue Content Area & Action Buttons    */}
            {/* ======================================================== */}
            <div className="relative flex-1 bg-gradient-to-br from-[#0048B8] via-[#0050CB] to-[#002B75] dark:from-[#001438] dark:via-[#001D54] dark:to-[#000E28] p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between text-white z-20">
              
              {/* Atmospheric Glow Orbs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#FFD13B]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Bar: Learn, Grow, Achieve Interactive Pill Badges */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 mb-6 relative z-10">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Link
                    href="/features"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md text-xs font-semibold text-white/95 shadow-xs transition-transform hover:-translate-y-0.5 active:scale-95"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Learn</span>
                  </Link>
                  <Link
                    href="/features"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md text-xs font-semibold text-white/95 shadow-xs transition-transform hover:-translate-y-0.5 active:scale-95"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Grow</span>
                  </Link>
                  <Link
                    href="/features"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md text-xs font-semibold text-white/95 shadow-xs transition-transform hover:-translate-y-0.5 active:scale-95"
                  >
                    <Star className="w-3.5 h-3.5 text-[#FFD13B] fill-[#FFD13B]" />
                    <span>Achieve</span>
                  </Link>
                </div>
              </div>

              {/* Middle Grid: Main Text & CTAs on Left, 4 Benefits on Right */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center my-auto relative z-10">
                
                {/* Left Column: Heading, Taglines & Action Buttons */}
                <div className="xl:col-span-8 flex flex-col items-start text-left">
                  
                  {/* Handwritten Script with Flying Paper Airplane Doodle & Yellow Curve */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                      <motion.p
                        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, rotate: -4 }}
                        animate={prefersReduced ? { opacity: 1 } : { opacity: 1, rotate: -2 }}
                        className="text-2xl sm:text-3xl font-bold text-[#FEF08A] tracking-tight leading-none drop-shadow-xs font-serif italic"
                      >
                        A Brighter Future Awaits
                      </motion.p>
                      {/* Subtle yellow underline swoop */}
                      <svg
                        className="absolute -bottom-1 left-0 w-full h-2.5 text-[#FFD13B]"
                        viewBox="0 0 160 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M 2,8 Q 80,1 158,6"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    {/* Paper Plane Doodle Graphic */}
                    <motion.div
                      animate={prefersReduced ? {} : { x: [0, 8, 0], y: [0, -4, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="text-white/80"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="rotate-12"
                      >
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Pre-headline Capsule Tag: READY TO GET STARTED? */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#38BDF8] text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase mb-3.5">
                    <span>&lt; READY TO GET STARTED? &gt;</span>
                  </div>

                  {/* Main Hero Heading: Join GGPS School Today */}
                  <h1 className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-[1.12] mb-3.5 text-white">
                    Join{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-white to-[#BAE6FD] drop-shadow-sm">
                      GGPS School
                    </span>{" "}
                    Today
                  </h1>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-xl mb-7 font-normal">
                    Give your school the tools it needs to grow, succeed and make a lasting impact.
                  </p>

                  {/* Real Functional Buttons: Apply for Admission & Admin Sign In */}
                  <HeroActionButtons />
                </div>

                {/* Right Column: 4 Vertical Stacked Benefit Badges */}
                <div className="xl:col-span-4 w-full">
                  <SchoolBenefits />
                </div>

              </div>

              {/* Bottom Subtle Trust Micro-Tagline */}
              <div className="pt-6 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] sm:text-xs text-blue-100/75 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  CBSE & State Board Curriculum Certified
                </span>
                <span className="flex items-center gap-1.5 mt-1 sm:mt-0">
                  <Lock className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Encrypted Data Security & Parent Privacy
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
