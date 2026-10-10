"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Users,
  GraduationCap,
  ShieldCheck,
  Building2,
  Sparkles,
  UserCheck,
  Flower2,
  Lock,
  Headphones,
  CheckCircle2,
  Star,
  ExternalLink,
  UserPlus
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HighQualityHeroBanner() {
  const { t } = useLanguage();
  const prefersReduced = useReducedMotion();
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const keyFeatures = [
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

  return (
    <section className="relative w-full max-w-[1520px] mx-auto px-3 sm:px-5 lg:px-8 pt-2 sm:pt-4 pb-8 sm:pb-12 select-none">
      {/* Panoramic Card Container */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] shadow-[0_25px_70px_-15px_rgba(0,80,203,0.28)] dark:shadow-[0_25px_70px_-10px_rgba(0,10,40,0.85)] border border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-r from-blue-900 via-[#003893] to-[#0050CB]">
        
        {/* ============================================================== */}
        {/* DESKTOP PANORAMA (lg & xl): Split Campus Visual + Wave + Blue Hero */}
        {/* ============================================================== */}
        <div className="relative min-h-[520px] sm:min-h-[580px] lg:min-h-[580px] xl:min-h-[620px] flex flex-col lg:flex-row items-stretch">
          
          {/* LEFT SECTION: High-Definition Campus & Students Photo */}
          <div className="relative w-full lg:w-[48%] xl:w-[46%] min-h-[300px] sm:min-h-[360px] lg:min-h-full overflow-hidden">
            {/* Campus Photography */}
            <Image
              src="/ggps-school-campus-hero.jpg"
              alt="GGPS School Campus and Students"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover object-center lg:object-[45%_center] transition-transform duration-700 hover:scale-105"
            />

            {/* Subtle Gradient vignette on top and bottom of photo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 lg:to-transparent pointer-events-none" />

            {/* Top-Left School Brand Crest Badge */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/90 dark:bg-[#000E28]/90 backdrop-blur-md border border-white/70 dark:border-white/10 shadow-lg">
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
              </div>
            </div>

            {/* Bottom-Left Frosted KPI Capsule Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto z-20"
            >
              <div className="inline-flex items-center justify-between sm:justify-start gap-3 sm:gap-6 px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl sm:rounded-full bg-white/92 dark:bg-[#000E28]/92 backdrop-blur-md border border-white/80 dark:border-white/15 shadow-xl text-[#000E28] dark:text-white">
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
            </motion.div>
          </div>

          {/* S-CURVE SVG WAVE DIVIDER (Desktop Only: seamlessly connects Left Photo into Right Royal Blue) */}
          <div className="hidden lg:block absolute left-[44%] xl:left-[43%] top-0 bottom-0 w-24 xl:w-32 z-10 pointer-events-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 120 600"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0043AF" />
                  <stop offset="50%" stopColor="#0050CB" />
                  <stop offset="100%" stopColor="#00358C" />
                </linearGradient>
                <linearGradient id="waveSoftGlow" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0050CB" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Back wave shadow layer */}
              <path
                d="M 60,0 C 110,180 0,380 60,600 L 120,600 L 120,0 Z"
                fill="url(#waveGrad)"
              />
              {/* Soft ambient wave ripple */}
              <path
                d="M 40,0 C 95,190 -10,390 40,600 L 70,600 C 10,390 115,190 60,0 Z"
                fill="url(#waveSoftGlow)"
              />
            </svg>
          </div>

          {/* RIGHT SECTION: Content Canvas (Royal Blue #0050CB with Dynamic Badges & CTAs) */}
          <div className="relative flex-1 bg-gradient-to-br from-[#0048B8] via-[#0050CB] to-[#002B75] dark:from-[#001438] dark:via-[#001D54] dark:to-[#000E28] p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between text-white z-20">
            
            {/* Top Atmospheric Glow Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#FF690C]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar: Floating Badges (Learn, Grow, Achieve) */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 mb-6 relative z-10">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/20 border border-white/20 backdrop-blur-md text-xs font-semibold text-white/95 shadow-xs transition-transform hover:-translate-y-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Learn
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/20 border border-white/20 backdrop-blur-md text-xs font-semibold text-white/95 shadow-xs transition-transform hover:-translate-y-0.5">
                  <Users className="w-3.5 h-3.5 text-emerald-300" />
                  Grow
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/20 border border-white/20 backdrop-blur-md text-xs font-semibold text-white/95 shadow-xs transition-transform hover:-translate-y-0.5">
                  <Star className="w-3.5 h-3.5 text-[#FFB703] fill-[#FFB703]" />
                  Achieve
                </span>
              </div>
            </div>

            {/* Middle Grid: Main Text & CTAs on Left, Vertical Feature Badges on Right */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center my-auto relative z-10">
              
              {/* Left Column: Heading, Taglines & Action Buttons */}
              <div className="xl:col-span-8 flex flex-col items-start text-left">
                
                {/* Playful Handwritten Script with Flying Paper Airplane Doodle */}
                <div className="flex items-center gap-3 mb-2">
                  <motion.p
                    initial={{ opacity: 0, rotate: -4 }}
                    animate={{ opacity: 1, rotate: -2 }}
                    style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                    className="text-2xl sm:text-3xl lg:text-3xl font-bold text-amber-200 tracking-tight leading-none drop-shadow-xs"
                  >
                    A Brighter Future Awaits
                  </motion.p>
                  
                  {/* Paper Plane Doodle Graphic */}
                  <motion.div
                    animate={prefersReduced ? {} : { x: [0, 8, 0], y: [0, -4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-white/80"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-12">
                      <path d="m22 2-7 20-4-9-9-4Z"/>
                      <path d="M22 2 11 13"/>
                    </svg>
                  </motion.div>
                </div>

                {/* Pre-headline Capsule Tag */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#38BDF8] text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase mb-3.5">
                  <span>&lt; READY TO GET STARTED? &gt;</span>
                </div>

                {/* Main Hero Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-[1.12] mb-3.5 text-white">
                  Join{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-white to-[#BAE6FD] drop-shadow-sm">
                    GGPS School
                  </span>{" "}
                  Today
                </h1>

                {/* Subtitle / Promise */}
                <p className="text-sm sm:text-base lg:text-base text-blue-100/90 leading-relaxed max-w-xl mb-7 font-normal">
                  Give your school the tools it needs to grow, succeed, and make a lasting impact. Admissions for Academic Year 2026–2027 are now open.
                </p>

                {/* Action Buttons: Primary + Secondary */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 w-full">
                  {/* Primary CTA: Apply for Admission */}
                  <Link
                    href="/admissions"
                    className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white hover:bg-blue-50 text-[#000E28] font-bold text-sm shadow-xl shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl active:scale-95 overflow-hidden"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#0050CB] flex items-center justify-center text-white shrink-0">
                      <UserPlus className="w-3 h-3" />
                    </div>
                    <span className="relative z-10 font-black tracking-tight">Apply for Admission</span>
                    <ArrowRight className="w-4 h-4 text-[#0050CB] transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  </Link>

                  {/* Secondary CTA: Admin Sign In */}
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                  >
                    <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center">
                      <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                    </div>
                    <span>Admin Sign In</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: 4 Vertical Stacked Feature Badges (Matches reference mockup) */}
              <div className="xl:col-span-4 flex flex-col gap-2.5 w-full">
                {keyFeatures.map((feat, idx) => {
                  const Icon = feat.icon;
                  const isHovered = activeFeature === idx;
                  return (
                    <motion.div
                      key={idx}
                      onMouseEnter={() => setActiveFeature(idx)}
                      onMouseLeave={() => setActiveFeature(null)}
                      whileHover={{ x: -4 }}
                      transition={{ duration: 0.2 }}
                      className={`relative px-4 py-3 rounded-2xl border transition-all duration-200 cursor-default flex items-center gap-3.5 ${
                        isHovered
                          ? "bg-white/25 border-white/50 shadow-lg backdrop-blur-md"
                          : "bg-white/10 hover:bg-white/15 border-white/15 backdrop-blur-xs"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-[#38BDF8] shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight">
                          {feat.title}
                        </span>
                        <span className="text-[11px] text-blue-100/75 leading-tight line-clamp-1 mt-0.5">
                          {feat.desc}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

            </div>

            {/* Bottom Subtle Trust Micro-Tagline */}
            <div className="pt-6 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] sm:text-xs text-blue-100/70 font-medium">
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
    </section>
  );
}
