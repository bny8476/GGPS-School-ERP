"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Star,
  Building2,
  User,
  ShieldCheck,
  Flower2,
  Presentation,
} from "lucide-react";

const RIGHT_FEATURES = [
  {
    icon: Building2,
    title: "Modern\nInfrastructure",
  },
  {
    icon: User,
    title: "Qualified\nFaculty",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure\nEnvironment",
  },
  {
    icon: Flower2,
    title: "Holistic\nDevelopment",
  },
];

export default function BottomCtaCard() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 mb-6 select-none">
      {/* Outer Compact Banner Card */}
      <motion.div
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[28px] sm:rounded-[34px] lg:rounded-[38px] shadow-[0_16px_45px_-12px_rgba(0,35,110,0.22)] dark:shadow-[0_16px_50px_-10px_rgba(0,10,35,0.75)] border border-blue-100/70 dark:border-blue-900/40 bg-[#002B7A]"
      >
        <div className="relative min-h-[400px] sm:min-h-[430px] lg:min-h-[440px] flex flex-col lg:flex-row items-stretch">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: School Campus Photo (38% on Desktop)        */}
          {/* ======================================================== */}
          <div className="relative w-full lg:w-[38%] xl:w-[37%] min-h-[260px] sm:min-h-[300px] lg:min-h-full overflow-hidden shrink-0">
            {/* Campus Photo */}
            <Image
              src="/ggps-school-campus-hero.jpg"
              alt="GGPS School Campus and Students Walking"
              fill
              priority
              quality={92}
              sizes="(max-width: 1024px) 100vw, 38vw"
              className="object-cover object-center lg:object-[45%_center]"
            />

            {/* Subtle Gradient vignette for crisp text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15 pointer-events-none" />

            {/* TOP-LEFT CREST & LOGO */}
            <div className="absolute top-4 sm:top-5 left-4 sm:left-6 z-30 flex items-center gap-2.5">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.22)]">
                <Image
                  src="/ggps-crest-logo.png"
                  alt="GGPS Crest"
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[15px] sm:text-[17px] font-black text-[#00173E] tracking-tight leading-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                  GGPS School
                </span>
                <span className="text-[10px] sm:text-[10.5px] font-semibold text-[#223955] tracking-tight leading-tight mt-0.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                  School Management System
                </span>
              </div>
            </div>

            {/* BOTTOM-LEFT STATS CAPSULE PILL */}
            <div className="absolute bottom-4 sm:bottom-5 left-3 sm:left-5 z-30">
              <div className="inline-flex items-center gap-2.5 sm:gap-3.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full bg-white/95 dark:bg-[#000E28]/95 backdrop-blur-md border border-white/80 dark:border-blue-500/30 shadow-[0_8px_24px_rgba(0,18,50,0.20)]">
                {/* 1000+ Students */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-[#E0F0FE] dark:bg-blue-900/40 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-xs sm:text-[12.5px] font-black text-[#00173E] dark:text-white">1000+</span>
                    <span className="text-[8.5px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 whitespace-nowrap">Happy Students</span>
                  </div>
                </div>

                <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700" />

                {/* 100+ Teachers */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-[#E0F0FE] dark:bg-blue-900/40 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] shrink-0">
                    <Presentation className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-xs sm:text-[12.5px] font-black text-[#00173E] dark:text-white">100+</span>
                    <span className="text-[8.5px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 whitespace-nowrap">Expert Teachers</span>
                  </div>
                </div>

                <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700" />

                {/* 24/7 Support */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-[#E0F0FE] dark:bg-blue-900/40 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-xs sm:text-[12.5px] font-black text-[#00173E] dark:text-white">24/7</span>
                    <span className="text-[8.5px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 whitespace-nowrap">Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Royal Blue Section (62% on Desktop)        */}
          {/* ======================================================== */}
          <div className="relative flex-1 bg-gradient-to-br from-[#003893] via-[#00276E] to-[#00174A] p-5 sm:p-7 lg:p-7 xl:p-9 flex flex-col justify-between text-white z-10 overflow-hidden">
            
            {/* S-CURVE WAVE DIVIDER: Flows to the LEFT over photo edge, never covering text */}
            <div className="hidden lg:block absolute -left-14 xl:-left-16 top-0 bottom-0 w-16 xl:w-20 z-0 pointer-events-none">
              <svg
                className="w-full h-full"
                viewBox="0 0 80 440"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Deep Blue Wave extending outward over photo edge */}
                <path
                  d="M 80,0 C 20,120 0,270 65,440 L 80,440 Z"
                  fill="#003893"
                />
                {/* Cyan Accent Swoosh at bottom left */}
                <path
                  d="M 15,440 C 30,385 65,395 80,440 Z"
                  fill="#38BDF8"
                  opacity="0.95"
                />
                {/* Yellow Accent Swoosh at bottom left */}
                <path
                  d="M 28,440 C 42,408 68,414 80,440 Z"
                  fill="#FACC15"
                  opacity="0.95"
                />
              </svg>
            </div>

            {/* Ambient Depth Glows */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-[#0050CB]/20 rounded-full blur-3xl pointer-events-none" />

            {/* TOP BAR: Learn, Grow, Achieve Pills */}
            <div className="flex items-center justify-end gap-2 relative z-10 mb-3 sm:mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-[11px] font-semibold text-white shadow-xs transition-transform hover:-translate-y-0.5 active:scale-95 cursor-pointer">
                <GraduationCap className="w-3.5 h-3.5 text-white" />
                <span>Learn</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-[11px] font-semibold text-white shadow-xs transition-transform hover:-translate-y-0.5 active:scale-95 cursor-pointer">
                <Users className="w-3.5 h-3.5 text-white" />
                <span>Grow</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-[11px] font-semibold text-white shadow-xs transition-transform hover:-translate-y-0.5 active:scale-95 cursor-pointer">
                <Star className="w-3.5 h-3.5 text-[#FACC15] fill-[#FACC15]" />
                <span>Achieve</span>
              </div>
            </div>

            {/* MAIN CONTENT ROW: Left Typography + Right 4 Features */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-center my-auto relative z-10 pl-1 sm:pl-2">
              
              {/* LEFT: Doodle, Script, Tag, Headline & Subtitle */}
              <div className="md:col-span-7 xl:col-span-7 flex flex-col items-start text-left min-w-0">
                
                {/* Flying Paper Plane Doodle & Golden Script */}
                <div className="flex items-center gap-2 mb-2">
                  {/* Paper Plane SVG with Dashed Loop Trail */}
                  <svg
                    className="w-10 h-7 text-white/80 shrink-0"
                    viewBox="0 0 44 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 21 C 9 27, 18 25, 16 16 C 14 10, 24 12, 30 8"
                      stroke="white"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeDasharray="2.5 2.5"
                    />
                    <path
                      d="M30 6 L 41 2 L 34 13 L 35 7 Z M 41 2 L 35 7"
                      fill="white"
                      stroke="white"
                      strokeWidth="1.1"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Handwriting text: A Brighter Future Awaits */}
                  <div className="relative">
                    <span className="font-serif italic font-bold text-lg sm:text-xl lg:text-[22px] text-[#FFD13B] tracking-tight leading-none drop-shadow-xs whitespace-nowrap">
                      A Brighter Future Awaits
                    </span>
                    <svg
                      className="absolute -bottom-1 left-0 w-full h-1.5 text-[#FFD13B]"
                      viewBox="0 0 160 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 2 4 Q 80 1 158 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Capsule Badge: < READY TO GET STARTED? > */}
                <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#0062D6] border border-[#38BDF8]/45 text-white text-[10px] sm:text-[11px] font-mono font-bold tracking-wider mb-2.5 shadow-xs">
                  <span>&lt; READY TO GET STARTED? &gt;</span>
                </div>

                {/* Main Headline: Join GGPS School Today */}
                <h2 className="text-2xl sm:text-3xl lg:text-[36px] xl:text-[42px] font-black text-white leading-[1.08] tracking-tight mb-2.5">
                  <span className="block">Join GGPS</span>
                  <span className="block">
                    School <span className="text-[#22D3EE] drop-shadow-xs">Today</span>
                  </span>
                </h2>

                {/* Subtitle */}
                <p className="text-white/90 text-xs sm:text-[13.5px] leading-relaxed max-w-sm lg:max-w-md font-normal">
                  Give your school the tools it needs to grow, succeed and make a lasting impact.
                </p>
              </div>

              {/* RIGHT: 4 Vertically Stacked Feature Cards */}
              <div className="md:col-span-5 xl:col-span-5 flex flex-col gap-2 sm:gap-2.5 w-full pr-1">
                {RIGHT_FEATURES.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={prefersReduced ? {} : { x: 3 }}
                      className="flex items-center gap-3 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#002B7A]/60 hover:bg-[#003893]/80 border border-white/15 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs select-none"
                    >
                      {/* Vibrant Blue Rounded Square Icon Box */}
                      <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#0284C7] to-[#004FAF] flex items-center justify-center text-white shrink-0 shadow-sm">
                        <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white stroke-[2.2]" />
                      </div>
                      {/* Feature Name */}
                      <span className="text-white text-[11.5px] sm:text-xs font-semibold leading-tight text-left whitespace-pre-line">
                        {item.title}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

            </div>

            {/* ======================================================== */}
            {/* BOTTOM RIGHT: Fresh Green Leaves Corner Accent           */}
            {/* ======================================================== */}
            <div className="absolute -bottom-4 -right-4 w-28 h-28 sm:w-32 sm:h-32 pointer-events-none z-20">
              <svg
                viewBox="0 0 140 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md"
              >
                {/* Stem */}
                <path
                  d="M140 140 C 115 118 98 85 80 62"
                  stroke="#166534"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Leaf 1 */}
                <path
                  d="M80 62 C 75 40 93 22 110 30 C 118 48 102 66 80 62 Z"
                  fill="url(#leafGradCompact1)"
                />
                {/* Leaf 2 */}
                <path
                  d="M98 84 C 90 62 108 42 126 48 C 133 68 117 88 98 84 Z"
                  fill="url(#leafGradCompact2)"
                />
                {/* Leaf 3 */}
                <path
                  d="M110 106 C 90 102 85 118 94 135 C 110 138 120 122 110 106 Z"
                  fill="url(#leafGradCompact1)"
                />

                <defs>
                  <linearGradient id="leafGradCompact1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ADE80" />
                    <stop offset="50%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#15803D" />
                  </linearGradient>
                  <linearGradient id="leafGradCompact2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#86EFAC" />
                    <stop offset="50%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#166534" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Bottom Subtle Cyan Accent line along bottom edge */}
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-transparent via-[#38BDF8]/40 to-transparent pointer-events-none" />
          </div>

        </div>
      </motion.div>
    </section>
  );
}
