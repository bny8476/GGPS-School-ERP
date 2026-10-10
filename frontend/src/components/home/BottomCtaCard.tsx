"use client";

import React from "react";
import Link from "next/link";
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
    <section className="relative w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mb-8 select-none">
      {/* Outer Card with Exact Reference Geometry & Soft Sky-Blue Ambient Aura */}
      <motion.div
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[32px] sm:rounded-[38px] lg:rounded-[44px] shadow-[0_20px_55px_-12px_rgba(0,40,120,0.22)] dark:shadow-[0_20px_60px_-10px_rgba(0,10,35,0.75)] border border-blue-100/80 dark:border-blue-900/40 bg-[#002766]"
      >
        <div className="relative min-h-[500px] sm:min-h-[540px] lg:min-h-[560px] xl:min-h-[590px] flex flex-col lg:flex-row items-stretch">
          
          {/* ======================================================== */}
          {/* LEFT SECTION: Campus Photo with Logo & Floating Stats    */}
          {/* ======================================================== */}
          <div className="relative w-full lg:w-[48%] xl:w-[46%] min-h-[320px] sm:min-h-[380px] lg:min-h-full overflow-hidden shrink-0">
            {/* High-Resolution Campus & Students Photo */}
            <Image
              src="/ggps-school-campus-hero.jpg"
              alt="GGPS School Campus and Students Walking"
              fill
              priority
              quality={95}
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover object-center lg:object-[46%_center]"
            />

            {/* Soft Ambient Light Gradient for clean text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* TOP-LEFT LOGO & TEXT: GGPS School | School Management System */}
            <div className="absolute top-5 sm:top-6 left-5 sm:left-7 z-30 flex items-center gap-3">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
                <Image
                  src="/ggps-crest-logo.png"
                  alt="GGPS School Crest"
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[17px] sm:text-[19px] font-black text-[#00173E] tracking-tight leading-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                  GGPS School
                </span>
                <span className="text-[11px] sm:text-[11.5px] font-medium text-[#2E4765] tracking-tight leading-tight mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                  School Management System
                </span>
              </div>
            </div>

            {/* BOTTOM-LEFT FLOATING METRICS CAPSULE PILL */}
            <div className="absolute bottom-5 sm:bottom-6 left-4 sm:left-6 z-30">
              <div className="inline-flex items-center gap-3 sm:gap-5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_12px_32px_rgba(0,18,50,0.22)] text-[#00173E]">
                {/* 1000+ Happy Students */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E0F0FE] flex items-center justify-center text-[#0050CB] shrink-0">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-xs sm:text-[13px] font-black text-[#00173E]">1000+</span>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium mt-0.5 whitespace-nowrap">Happy Students</span>
                  </div>
                </div>

                <div className="w-[1px] h-6 bg-slate-200" />

                {/* 100+ Expert Teachers */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E0F0FE] flex items-center justify-center text-[#0050CB] shrink-0">
                    <Presentation className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-xs sm:text-[13px] font-black text-[#00173E]">100+</span>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium mt-0.5 whitespace-nowrap">Expert Teachers</span>
                  </div>
                </div>

                <div className="w-[1px] h-6 bg-slate-200" />

                {/* 24/7 Support */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E0F0FE] flex items-center justify-center text-[#0050CB] shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-xs sm:text-[13px] font-black text-[#00173E]">24/7</span>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium mt-0.5 whitespace-nowrap">Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* S-CURVE ORGANIC WAVE DIVIDER WITH CYAN & YELLOW SWOOSHES */}
          {/* ======================================================== */}
          <div className="hidden lg:block absolute left-[44%] xl:left-[43%] top-0 bottom-0 w-36 xl:w-44 z-20 pointer-events-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 160 600"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Deep Ocean Blue Wave Mask Extension */}
              <path
                d="M 70,0 C 135,160 0,380 75,600 L 160,600 L 160,0 Z"
                fill="#002D7A"
              />
              {/* Secondary Gradient Depth Wave */}
              <path
                d="M 85,0 C 145,170 18,390 90,600 L 160,600 L 160,0 Z"
                fill="#002366"
              />
              {/* Bottom Cyan Accent Wave Swoosh */}
              <path
                d="M 12,600 C 35,530 85,540 140,600 Z"
                fill="#38BDF8"
                opacity="0.9"
              />
              {/* Bottom Golden Yellow Accent Wave Swoosh */}
              <path
                d="M 5,600 C 25,565 65,572 105,600 Z"
                fill="#FACC15"
                opacity="0.95"
              />
            </svg>
          </div>

          {/* ======================================================== */}
          {/* RIGHT SECTION: Deep Royal Blue Area with Exact Design    */}
          {/* ======================================================== */}
          <div className="relative flex-1 bg-gradient-to-br from-[#003893] via-[#00276E] to-[#00174A] p-6 sm:p-8 lg:p-9 xl:p-12 flex flex-col justify-between text-white z-10 overflow-hidden">
            
            {/* Radial Atmospheric Ambient Depth Glows */}
            <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-[#0050CB]/25 rounded-full blur-3xl pointer-events-none" />

            {/* TOP BAR: Learn, Grow, Achieve Interactive Pills */}
            <div className="flex items-center justify-end gap-2.5 relative z-10 mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-xs font-semibold text-white shadow-xs transition-transform hover:-translate-y-0.5 active:scale-95 cursor-pointer">
                <GraduationCap className="w-3.5 h-3.5 text-white" />
                <span>Learn</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-xs font-semibold text-white shadow-xs transition-transform hover:-translate-y-0.5 active:scale-95 cursor-pointer">
                <Users className="w-3.5 h-3.5 text-white" />
                <span>Grow</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-xs font-semibold text-white shadow-xs transition-transform hover:-translate-y-0.5 active:scale-95 cursor-pointer">
                <Star className="w-3.5 h-3.5 text-[#FACC15] fill-[#FACC15]" />
                <span>Achieve</span>
              </div>
            </div>

            {/* MAIN CONTENT GRID: Left Typography & Right 4 Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center my-auto relative z-10">
              
              {/* LEFT: Flying Plane, A Brighter Future Awaits, Headline & Subtitle */}
              <div className="md:col-span-7 xl:col-span-8 flex flex-col items-start text-left">
                
                {/* 1. Flying Paper Airplane Doodle & Script Tagline */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  {/* Dotted Flight Loop & Paper Plane */}
                  <svg
                    className="w-12 h-8 text-white/80 shrink-0"
                    viewBox="0 0 48 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 24 C 11 30, 20 28, 18 19 C 16 12, 26 14, 33 10"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeDasharray="2.5 2.5"
                    />
                    <path
                      d="M33 8 L 45 4 L 37 15 L 38 9 Z M 45 4 L 38 9"
                      fill="white"
                      stroke="white"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Handwriting cursive: A Brighter Future Awaits */}
                  <div className="relative">
                    <span className="font-serif italic font-bold text-xl sm:text-2xl lg:text-[25px] text-[#FFD13B] tracking-tight leading-none drop-shadow-xs">
                      A Brighter Future Awaits
                    </span>
                    {/* Underlying Golden Curve */}
                    <svg
                      className="absolute -bottom-1 left-0 w-full h-2 text-[#FFD13B]"
                      viewBox="0 0 160 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 2 5 Q 80 1 158 5"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* 2. Capsule Badge: < READY TO GET STARTED? > */}
                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#0062D6] border border-[#38BDF8]/45 text-white text-[11px] sm:text-xs font-mono font-bold tracking-wider mb-4 shadow-sm">
                  <span>&lt; READY TO GET STARTED? &gt;</span>
                </div>

                {/* 3. Main Headline: Join GGPS School Today */}
                <h2 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[52px] font-black text-white leading-[1.08] tracking-tight mb-4">
                  <span className="block">Join GGPS</span>
                  <span className="block">
                    School <span className="text-[#22D3EE] drop-shadow-xs">Today</span>
                  </span>
                </h2>

                {/* 4. Subtitle */}
                <p className="text-white/90 text-sm sm:text-[15px] leading-relaxed max-w-lg font-normal">
                  Give your school the tools it needs to grow, succeed and make a lasting impact.
                </p>
              </div>

              {/* RIGHT: 4 Vertically Stacked Glass Feature Cards */}
              <div className="md:col-span-5 xl:col-span-4 flex flex-col gap-2.5 sm:gap-3 w-full">
                {RIGHT_FEATURES.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={prefersReduced ? {} : { x: 4 }}
                      className="flex items-center gap-3.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-[#002B7A]/55 hover:bg-[#003893]/75 border border-white/15 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm select-none"
                    >
                      {/* Vibrant Blue Rounded Square Icon Box */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-b from-[#0284C7] to-[#004FAF] flex items-center justify-center text-white shrink-0 shadow-md">
                        <Icon className="w-5 h-5 text-white stroke-[2.2]" />
                      </div>
                      {/* Feature Name */}
                      <span className="text-white text-xs sm:text-[13px] font-semibold leading-tight text-left whitespace-pre-line">
                        {item.title}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

            </div>

            {/* ======================================================== */}
            {/* BOTTOM RIGHT: Fresh Green Leaves Foliage Corner Artwork  */}
            {/* ======================================================== */}
            <div className="absolute -bottom-6 -right-6 w-36 h-36 sm:w-44 sm:h-44 pointer-events-none z-20">
              <svg
                viewBox="0 0 160 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-lg"
              >
                {/* Stem 1 */}
                <path
                  d="M160 160 C 130 135 110 95 90 70"
                  stroke="#166534"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Leaf 1 (Top Left) */}
                <path
                  d="M90 70 C 85 45 105 25 125 35 C 135 55 115 75 90 70 Z"
                  fill="url(#leafGrad1)"
                />
                {/* Leaf 1 Vein */}
                <path d="M92 68 Q 105 48 123 37" stroke="#86EFAC" strokeWidth="1.2" opacity="0.7" />

                {/* Leaf 2 (Center) */}
                <path
                  d="M110 95 C 100 70 120 48 142 55 C 150 78 132 100 110 95 Z"
                  fill="url(#leafGrad2)"
                />
                <path d="M112 93 Q 124 72 140 57" stroke="#BBF7D0" strokeWidth="1.2" opacity="0.7" />

                {/* Leaf 3 (Bottom Left Outer) */}
                <path
                  d="M125 120 C 100 115 95 135 105 155 C 125 158 135 138 125 120 Z"
                  fill="url(#leafGrad1)"
                />

                {/* Leaf 4 (Corner Fill) */}
                <path
                  d="M140 110 C 130 85 155 75 160 95 C 160 115 150 120 140 110 Z"
                  fill="url(#leafGrad3)"
                />

                <defs>
                  <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ADE80" />
                    <stop offset="50%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#15803D" />
                  </linearGradient>
                  <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#86EFAC" />
                    <stop offset="50%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#166534" />
                  </linearGradient>
                  <linearGradient id="leafGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#14532D" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Bottom Cyan and Yellow Accent Curve along bottom edge */}
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-r from-transparent via-[#38BDF8]/40 to-transparent pointer-events-none" />
          </div>

        </div>
      </motion.div>
    </section>
  );
}
