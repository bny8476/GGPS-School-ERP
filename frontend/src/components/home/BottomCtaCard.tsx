"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Star,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserPlus,
  Play,
  Building2,
  UserCheck,
  ShieldCheck,
  Flower2,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Building2,
    title: "Modern Infrastructure",
    desc: "Smart digital labs, Wi-Fi campus & interactive classrooms",
  },
  {
    icon: UserCheck,
    title: "Qualified Faculty",
    desc: "Experienced educators fostering individual potential",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure Environment",
    desc: "CCTV surveillance, RFID entry & 24/7 security staff",
  },
  {
    icon: Flower2,
    title: "Holistic Development",
    desc: "Sports academies, arts, public speaking & STEAM clubs",
  },
];

export default function BottomCtaCard() {
  const prefersReduced = useReducedMotion();
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 mb-8 select-none">
      {/* Outer Card with Rounded Corners, Shadow & Depth */}
      <motion.div
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] shadow-[0_25px_70px_-15px_rgba(0,80,203,0.28)] dark:shadow-[0_0_55px_rgba(0,80,203,0.35),0_25px_70px_-10px_rgba(0,10,40,0.85)] border border-blue-200/70 dark:border-blue-500/35 bg-gradient-to-r from-blue-900 via-[#003893] to-[#0050CB]"
      >
        <div className="relative min-h-[520px] sm:min-h-[580px] lg:min-h-[590px] xl:min-h-[620px] flex flex-col lg:flex-row items-stretch">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: High-Resolution Campus & Students Photo    */}
          {/* ======================================================== */}
          <div className="relative w-full lg:w-[48%] xl:w-[46%] min-h-[300px] sm:min-h-[360px] lg:min-h-full overflow-hidden">
            {/* Campus Photo */}
            <Image
              src="/ggps-school-campus-hero.jpg"
              alt="GGPS School Campus and Students Walking with Backpacks"
              fill
              priority
              quality={95}
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover object-center lg:object-[45%_center] transition-transform duration-700 hover:scale-105"
            />

            {/* Depth of Field Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/30 lg:to-transparent pointer-events-none" />

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

            {/* Bottom-Left Floating Statistics Panel */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto z-20">
              <div className="inline-flex items-center justify-between sm:justify-start gap-3 sm:gap-6 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl sm:rounded-full bg-white/95 dark:bg-[#000E28]/95 backdrop-blur-md border border-white/80 dark:border-white/15 shadow-2xl text-[#000E28] dark:text-white">
                {/* 1000+ Happy Students */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/30 flex items-center justify-center text-[#0050CB] dark:text-sky-400 shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-xs sm:text-sm font-black text-[#0050CB] dark:text-sky-400">1000+</span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Happy Students</span>
                  </div>
                </div>

                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                {/* 100+ Expert Teachers */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[#0050CB] dark:text-sky-400 shrink-0">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-xs sm:text-sm font-black text-[#0050CB] dark:text-sky-400">100+</span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Expert Teachers</span>
                  </div>
                </div>

                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                {/* 24/7 Support */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">24/7</span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Support</span>
                  </div>
                </div>
              </div>
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
                <linearGradient id="bottomWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0043AF" />
                  <stop offset="50%" stopColor="#0050CB" />
                  <stop offset="100%" stopColor="#00358C" />
                </linearGradient>
                <linearGradient id="bottomWaveGlow" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0050CB" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 60,0 C 110,180 0,380 60,600 L 120,600 L 120,0 Z"
                fill="url(#bottomWaveGrad)"
              />
              <path
                d="M 40,0 C 95,190 -10,390 40,600 L 70,600 C 10,390 115,190 60,0 Z"
                fill="url(#bottomWaveGlow)"
              />
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
          {/* RIGHT COLUMN: Real Typography & Real Clickable Buttons   */}
          {/* ======================================================== */}
          <div className="relative flex-1 bg-gradient-to-br from-[#0048B8] via-[#0050CB] to-[#002B75] dark:from-[#001438] dark:via-[#001D54] dark:to-[#000E28] p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between text-white z-20">
            
            {/* Ambient Lighting Orbs */}
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

            {/* Middle Grid: Main Text & Action Buttons on Left, 4 Benefits on Right */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center my-auto relative z-10">
              
              {/* Left Column: Heading, Subtitle & REAL-TIME BUTTONS */}
              <div className="xl:col-span-8 flex flex-col items-start text-left">
                
                {/* Handwritten Script with Flying Paper Airplane Doodle & Yellow Curve */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <p className="text-2xl sm:text-3xl font-bold text-[#FEF08A] tracking-tight leading-none drop-shadow-xs font-serif italic">
                      A Brighter Future Awaits
                    </p>
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

                {/* Main Heading: Join GGPS School Today */}
                <h2 className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-[1.12] mb-3.5 text-white">
                  Join{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-white to-[#BAE6FD] drop-shadow-sm">
                    GGPS School
                  </span>{" "}
                  Today
                </h2>

                {/* Description */}
                <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-xl mb-7 font-normal">
                  Give your school the tools it needs to grow, succeed and make a lasting impact.
                </p>

                {/* ======================================================== */}
                {/* REAL-TIME INTERACTIVE BUTTONS (NOT IMAGE BUTTONS)         */}
                {/* ======================================================== */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 w-full">
                  {/* 1. Real Clickable Button: Apply for Admission */}
                  <Link
                    href="/admissions"
                    id="bottom-card-apply-admission-btn"
                    className="group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-full bg-white hover:bg-blue-50 text-[#000E28] font-black text-sm sm:text-base shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white overflow-hidden cursor-pointer"
                  >
                    <div className="w-5.5 h-5.5 rounded-full bg-[#0050CB] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <UserPlus className="w-3.2 h-3.2" />
                    </div>
                    <span className="relative z-10 text-[#000E28] font-black tracking-tight">
                      Apply for Admission
                    </span>
                    <ArrowRight
                      className="w-4 h-4 text-[#0050CB] transition-transform duration-200 group-hover:translate-x-1"
                      strokeWidth={2.6}
                    />
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
                  </Link>

                  {/* 2. Real Clickable Button: Admin Sign In */}
                  <Link
                    href="/login"
                    id="bottom-card-admin-signin-btn"
                    className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 text-white font-semibold text-sm sm:text-base backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] cursor-pointer"
                  >
                    <div className="w-5.5 h-5.5 rounded-full border border-white/40 group-hover:border-white/70 flex items-center justify-center bg-white/5 transition-colors">
                      <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5 transition-transform group-hover:scale-110" />
                    </div>
                    <span className="font-semibold text-white tracking-normal">
                      Admin Sign In
                    </span>
                  </Link>
                </div>

              </div>

              {/* Right Column: 4 Vertical Stacked Real Benefit Cards */}
              <div className="xl:col-span-4 flex flex-col gap-2.5 w-full">
                {BENEFITS.map((item, idx) => {
                  const Icon = item.icon;
                  const isHovered = hoveredBenefit === idx;

                  return (
                    <motion.div
                      key={idx}
                      whileHover={prefersReduced ? {} : { x: -4 }}
                      onMouseEnter={() => setHoveredBenefit(idx)}
                      onMouseLeave={() => setHoveredBenefit(null)}
                      className={`relative px-4 py-3 rounded-2xl border transition-all duration-200 cursor-default flex items-center gap-3.5 select-none ${
                        isHovered
                          ? "bg-white/25 border-white/50 shadow-lg backdrop-blur-md"
                          : "bg-white/10 hover:bg-white/15 border-white/15 backdrop-blur-xs"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-[#38BDF8] shrink-0 shadow-xs">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-blue-100/75 leading-tight line-clamp-1 mt-0.5 font-normal">
                          {item.desc}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
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
      </motion.div>
    </section>
  );
}
