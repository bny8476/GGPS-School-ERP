"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, UserPlus, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface HeroActionButtonsProps {
  className?: string;
}

export default function HeroActionButtons({ className = "" }: HeroActionButtonsProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div className={`flex flex-wrap sm:flex-nowrap items-center gap-3.5 w-full ${className}`}>
      {/* 1. Primary Button: Apply for Admission */}
      <Link
        href="/admissions"
        id="hero-apply-admission-btn"
        className="group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-full bg-white hover:bg-blue-50 text-[#000E28] font-bold text-sm sm:text-base shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0050CB] overflow-hidden select-none"
      >
        {/* Student Icon Badge */}
        <div className="w-5.5 h-5.5 rounded-full bg-[#0050CB] flex items-center justify-center text-white shrink-0 shadow-xs">
          <UserPlus className="w-3.2 h-3.2" />
        </div>

        {/* Button Label */}
        <span className="relative z-10 font-black tracking-tight text-[#000E28]">
          Apply for Admission
        </span>

        {/* Right Arrow Icon */}
        <ArrowRight
          className="w-4 h-4 text-[#0050CB] transition-transform duration-200 group-hover:translate-x-1"
          strokeWidth={2.6}
        />

        {/* Subtle Specular Shine on Hover */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
      </Link>

      {/* 2. Secondary Button: Admin Sign In */}
      <Link
        href="/login"
        id="hero-admin-signin-btn"
        className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 text-white font-semibold text-sm sm:text-base backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] select-none"
      >
        {/* Play / Sign In Icon in Circle */}
        <div className="w-5.5 h-5.5 rounded-full border border-white/40 group-hover:border-white/70 flex items-center justify-center bg-white/5 transition-colors">
          <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5 transition-transform group-hover:scale-110" />
        </div>

        {/* Button Label */}
        <span className="font-semibold text-white tracking-normal">
          Admin Sign In
        </span>
      </Link>
    </div>
  );
}
