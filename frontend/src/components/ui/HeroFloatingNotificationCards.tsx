"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, FileText, Users, ChevronRight, GraduationCap } from 'lucide-react';

interface HeroFloatingNotificationCardsProps {
  className?: string;
  side?: 'all' | 'left' | 'right';
}

/**
 * LEFT SIDE CARDS:
 * 1. Attendance Recorded (Class 8-A • 09:15 AM)
 * 2. Exam Result Published (Class 10 • 10:30 AM)
 */
export function HeroFloatingLeftCards({ className = "" }: { className?: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <div
      className={`pointer-events-none select-none flex flex-col items-start ${className}`}
      style={{ perspective: 1200 }}
    >
      {/* ======================================================== */}
      {/* CARD 1: Attendance Recorded                              */}
      {/* ======================================================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={
          prefersReduced
            ? { opacity: 1, scale: 1, y: 0 }
            : {
                opacity: 1,
                scale: 1,
                y: [0, -8, 0],
                rotateX: [4, 5.5, 4],
                rotateY: [-8, -6.5, -8],
                rotateZ: [-2, -1.2, -2],
              }
        }
        transition={
          prefersReduced
            ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
            : {
                opacity: { duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
                rotateX: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
                rotateY: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
                rotateZ: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
              }
        }
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
        className="pointer-events-auto relative group cursor-pointer inline-flex items-center"
      >
        {/* Soft Blue/Cyan/Emerald Atmospheric Glow */}
        <div
          className="absolute -inset-3 sm:-inset-4 rounded-[28px] pointer-events-none -z-10 blur-xl transition-opacity duration-500 opacity-90 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.42) 0%, rgba(6, 182, 212, 0.22) 45%, transparent 75%)",
          }}
        />

        {/* Floating Micro-Particles */}
        <span className="absolute -top-1.5 left-8 w-1.5 h-1.5 rounded-full bg-emerald-400/80 blur-[0.6px] animate-pulse pointer-events-none" />
        <span className="absolute -bottom-1 right-12 w-1.5 h-1.5 rounded-full bg-cyan-300/70 blur-[0.6px] animate-pulse pointer-events-none" />

        {/* Glassmorphism Capsule Surface */}
        <div
          className="relative flex items-center gap-3 sm:gap-3.5 px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-[20px] sm:rounded-[22px] backdrop-blur-2xl transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1"
          style={{
            background:
              "linear-gradient(135deg, rgba(3, 18, 48, 0.88) 0%, rgba(1, 10, 30, 0.94) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.22)",
            boxShadow:
              "0 22px 45px -12px rgba(0, 10, 32, 0.85), 0 8px 20px -6px rgba(0, 0, 0, 0.5), 0 0 25px -4px rgba(16, 185, 129, 0.25), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Subtle cyan sheen */}
          <div
            className="absolute inset-0 rounded-[20px] sm:rounded-[22px] pointer-events-none opacity-80"
            style={{
              background:
                "linear-gradient(120deg, rgba(56, 189, 248, 0.12) 0%, transparent 45%, rgba(16, 185, 129, 0.08) 100%)",
            }}
          />

          {/* Internal Top-Edge Specular Highlight */}
          <div className="absolute inset-x-5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />

          {/* Diagonal Glass Reflection */}
          <div className="absolute inset-0 rounded-[20px] sm:rounded-[22px] bg-gradient-to-br from-white/[0.14] via-transparent to-transparent pointer-events-none" />

          {/* 3D Embossed Green Glowing Badge */}
          <div
            className="relative w-10.5 h-10.5 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ring-4 ring-emerald-500/25 transition-transform duration-300 group-hover:scale-105"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #34D399 0%, #059669 70%, #047857 100%)",
              boxShadow:
                "0 0 20px rgba(16, 185, 129, 0.7), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
            }}
          >
            <Check className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white stroke-[2.8] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)]" />
          </div>

          {/* Typography */}
          <div className="flex flex-col pr-1 sm:pr-2">
            <span className="font-semibold text-white text-[13.5px] sm:text-[15px] tracking-tight leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] whitespace-nowrap">
              Attendance Recorded
            </span>
            <span className="text-[#93C5FD] dark:text-[#CBD5E1] text-[11px] sm:text-[12px] font-medium tracking-normal mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
              Class 8-A <span className="opacity-60">•</span> 09:15 AM
            </span>
          </div>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* CARD 2: Exam Result Published                            */}
      {/* ======================================================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 25 }}
        animate={
          prefersReduced
            ? { opacity: 1, scale: 1, y: 0 }
            : {
                opacity: 1,
                scale: 1,
                y: [0, 8, 0],
                rotateX: [6, 4.2, 6],
                rotateY: [-6, -7.5, -6],
                rotateZ: [-1, -1.8, -1],
              }
        }
        transition={
          prefersReduced
            ? { duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }
            : {
                opacity: { duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
                rotateX: { duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
                rotateY: { duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
                rotateZ: { duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
              }
        }
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
        className="pointer-events-auto relative group cursor-pointer inline-flex items-center mt-3.5 sm:mt-5 -translate-x-1 sm:-translate-x-2 lg:-translate-x-3"
      >
        {/* Soft Purple/Violet Atmospheric Glow */}
        <div
          className="absolute -inset-3 sm:-inset-4 rounded-[28px] pointer-events-none -z-10 blur-xl transition-opacity duration-500 opacity-90 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(168, 85, 247, 0.42) 0%, rgba(139, 92, 246, 0.22) 45%, transparent 75%)",
          }}
        />

        {/* Floating Micro-Particle */}
        <span className="absolute -top-1 left-10 w-1.5 h-1.5 rounded-full bg-purple-400/80 blur-[0.6px] animate-pulse pointer-events-none" />

        {/* Glassmorphism Capsule Surface */}
        <div
          className="relative flex items-center gap-3 sm:gap-3.5 px-3.5 py-2 sm:px-4.5 sm:py-3 rounded-[19px] sm:rounded-[21px] backdrop-blur-2xl transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1"
          style={{
            background:
              "linear-gradient(135deg, rgba(4, 16, 44, 0.88) 0%, rgba(2, 9, 28, 0.94) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.22)",
            boxShadow:
              "0 20px 42px -12px rgba(0, 10, 32, 0.85), 0 8px 18px -6px rgba(0, 0, 0, 0.5), 0 0 25px -4px rgba(168, 85, 247, 0.25), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Subtle violet sheen */}
          <div
            className="absolute inset-0 rounded-[19px] sm:rounded-[21px] pointer-events-none opacity-80"
            style={{
              background:
                "linear-gradient(120deg, rgba(192, 132, 252, 0.12) 0%, transparent 45%, rgba(147, 51, 234, 0.08) 100%)",
            }}
          />

          {/* Internal Top-Edge Specular Highlight */}
          <div className="absolute inset-x-5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />

          {/* Diagonal Glass Reflection */}
          <div className="absolute inset-0 rounded-[19px] sm:rounded-[21px] bg-gradient-to-br from-white/[0.14] via-transparent to-transparent pointer-events-none" />

          {/* 3D Embossed Purple Glowing Badge */}
          <div
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ring-4 ring-purple-500/25 transition-transform duration-300 group-hover:scale-105"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #C084FC 0%, #7c1cd5ff 70%, #7E22CE 100%)",
              boxShadow:
                "0 0 20px rgba(168, 85, 247, 0.7), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
            }}
          >
            <FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white stroke-[2.2] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)]" />
          </div>

          {/* Typography */}
          <div className="flex flex-col pr-1 sm:pr-2">
            <span className="font-semibold text-white text-[13px] sm:text-[14.5px] tracking-tight leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] whitespace-nowrap">
              Exam Result Published
            </span>
            <span className="text-[#E9D5FF] dark:text-[#DDD6FE] text-[10.5px] sm:text-[11.5px] font-medium tracking-normal mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
              Class 10 <span className="opacity-60">•</span> 10:30 AM
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * RIGHT SIDE CARDS:
 * 3. Parent Notified (09:45 AM)
 * 4. Fee Receipt Generated (11:20 AM)
 * 5. New Admission (04:10 PM)
 */
export function HeroFloatingRightCards({ className = "" }: { className?: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <div
      className={`pointer-events-none select-none flex flex-col items-end ${className}`}
      style={{ perspective: 1200 }}
    >
      {/* ======================================================== */}
      {/* CARD 3: Parent Notified (Blue Badge + Chevron)           */}
      {/* ======================================================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={
          prefersReduced
            ? { opacity: 1, scale: 1, y: 0 }
            : {
                opacity: 1,
                scale: 1,
                y: [0, -7, 0],
                rotateX: [4, 5.2, 4],
                rotateY: [7, 5.5, 7],
                rotateZ: [1.5, 2.2, 1.5],
              }
        }
        transition={
          prefersReduced
            ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
            : {
                opacity: { duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 4.6, repeat: Infinity, ease: "easeInOut" },
                rotateX: { duration: 4.6, repeat: Infinity, ease: "easeInOut" },
                rotateY: { duration: 4.6, repeat: Infinity, ease: "easeInOut" },
                rotateZ: { duration: 4.6, repeat: Infinity, ease: "easeInOut" },
              }
        }
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
        className="pointer-events-auto relative group cursor-pointer inline-flex items-center"
      >
        {/* Soft Blue Atmospheric Glow */}
        <div
          className="absolute -inset-3 sm:-inset-4 rounded-[28px] pointer-events-none -z-10 blur-xl transition-opacity duration-500 opacity-90 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.42) 0%, rgba(14, 165, 233, 0.22) 45%, transparent 75%)",
          }}
        />

        {/* Ambient Tiny Light Particle */}
        <span className="absolute -top-1 right-8 w-1.5 h-1.5 rounded-full bg-sky-400/80 blur-[0.6px] animate-pulse pointer-events-none" />

        {/* Glassmorphism Capsule Surface */}
        <div
          className="relative flex items-center gap-3 sm:gap-3.5 px-4 py-2.5 sm:px-4.5 sm:py-3 rounded-[20px] sm:rounded-[22px] backdrop-blur-2xl transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1 min-w-[220px] sm:min-w-[245px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(3, 18, 48, 0.88) 0%, rgba(1, 10, 30, 0.94) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.22)",
            boxShadow:
              "0 22px 45px -12px rgba(0, 10, 32, 0.85), 0 8px 20px -6px rgba(0, 0, 0, 0.5), 0 0 25px -4px rgba(59, 130, 246, 0.28), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Subtle cyan sheen */}
          <div
            className="absolute inset-0 rounded-[20px] sm:rounded-[22px] pointer-events-none opacity-80"
            style={{
              background:
                "linear-gradient(120deg, rgba(56, 189, 248, 0.12) 0%, transparent 45%, rgba(59, 130, 246, 0.08) 100%)",
            }}
          />

          {/* Internal Top-Edge Specular Highlight */}
          <div className="absolute inset-x-5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />

          {/* Diagonal Glass Reflection */}
          <div className="absolute inset-0 rounded-[20px] sm:rounded-[22px] bg-gradient-to-br from-white/[0.14] via-transparent to-transparent pointer-events-none" />

          {/* 3D Embossed Blue Glowing Badge with Users Icon */}
          <div
            className="relative w-10.5 h-10.5 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ring-4 ring-blue-500/25 transition-transform duration-300 group-hover:scale-105"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #60A5FA 0%, #3B82F6 70%, #1D4ED8 100%)",
              boxShadow:
                "0 0 20px rgba(59, 130, 246, 0.7), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
            }}
          >
            <Users className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white stroke-[2.2] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)]" />
          </div>

          {/* Typography */}
          <div className="flex flex-col pr-1">
            <span className="font-semibold text-white text-[13px] sm:text-[14.5px] tracking-tight leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] whitespace-nowrap">
              Parent Notified
            </span>
            <span className="text-[#BAE6FD] dark:text-[#93C5FD] text-[10.5px] sm:text-[11.5px] font-medium tracking-normal mt-0.5 whitespace-nowrap">
              09:45 AM
            </span>
          </div>

          {/* Trailing Chevron */}
          <ChevronRight className="w-4 h-4 text-white/70 ml-auto transition-transform group-hover:translate-x-0.5 shrink-0" />
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* CARD 4: Fee Receipt Generated (Teal Badge + Rupee Symbol)*/}
      {/* ======================================================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={
          prefersReduced
            ? { opacity: 1, scale: 1, y: 0 }
            : {
                opacity: 1,
                scale: 1,
                y: [0, 8, 0],
                rotateX: [5, 3.8, 5],
                rotateY: [8, 9.2, 8],
                rotateZ: [1, 0.4, 1],
              }
        }
        transition={
          prefersReduced
            ? { duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }
            : {
                opacity: { duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 5.1, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
                rotateX: { duration: 5.1, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
                rotateY: { duration: 5.1, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
                rotateZ: { duration: 5.1, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
              }
        }
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
        className="pointer-events-auto relative group cursor-pointer inline-flex items-center mt-3 sm:mt-4.5 translate-x-2 sm:translate-x-4 lg:translate-x-5"
      >
        {/* Soft Teal Atmospheric Glow */}
        <div
          className="absolute -inset-3 sm:-inset-4 rounded-[28px] pointer-events-none -z-10 blur-xl transition-opacity duration-500 opacity-90 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(20, 184, 166, 0.42) 0%, rgba(16, 185, 129, 0.22) 45%, transparent 75%)",
          }}
        />

        {/* Glassmorphism Capsule Surface */}
        <div
          className="relative flex items-center gap-3 sm:gap-3.5 px-4 py-2.5 sm:px-4.5 sm:py-3 rounded-[19px] sm:rounded-[21px] backdrop-blur-2xl transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1 min-w-[235px] sm:min-w-[260px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(3, 18, 48, 0.88) 0%, rgba(1, 10, 30, 0.94) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.22)",
            boxShadow:
              "0 20px 42px -12px rgba(0, 10, 32, 0.85), 0 8px 18px -6px rgba(0, 0, 0, 0.5), 0 0 25px -4px rgba(20, 184, 166, 0.28), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Subtle teal sheen */}
          <div
            className="absolute inset-0 rounded-[19px] sm:rounded-[21px] pointer-events-none opacity-80"
            style={{
              background:
                "linear-gradient(120deg, rgba(45, 212, 191, 0.12) 0%, transparent 45%, rgba(20, 184, 166, 0.08) 100%)",
            }}
          />

          {/* Internal Top-Edge Specular Highlight */}
          <div className="absolute inset-x-5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />

          {/* Diagonal Glass Reflection */}
          <div className="absolute inset-0 rounded-[19px] sm:rounded-[21px] bg-gradient-to-br from-white/[0.14] via-transparent to-transparent pointer-events-none" />

          {/* 3D Embossed Teal Glowing Badge with ₹ Symbol */}
          <div
            className="relative w-10.5 h-10.5 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ring-4 ring-teal-500/25 transition-transform duration-300 group-hover:scale-105"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #2DD4BF 0%, #14B8A6 70%, #0F766E 100%)",
              boxShadow:
                "0 0 20px rgba(20, 184, 166, 0.7), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
            }}
          >
            <span className="text-white font-bold text-base sm:text-lg leading-none drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)]">
              ₹
            </span>
          </div>

          {/* Typography */}
          <div className="flex flex-col pr-1">
            <span className="font-semibold text-white text-[13px] sm:text-[14.5px] tracking-tight leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] whitespace-nowrap">
              Fee Receipt Generated
            </span>
            <span className="text-[#99F6E4] dark:text-[#A7F3D0] text-[10.5px] sm:text-[11.5px] font-medium tracking-normal mt-0.5 whitespace-nowrap">
              11:20 AM
            </span>
          </div>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* CARD 5: New Admission (Gold Badge + Graduation Icon)     */}
      {/* ======================================================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.86, y: 22 }}
        animate={
          prefersReduced
            ? { opacity: 1, scale: 1, y: 0 }
            : {
                opacity: 1,
                scale: 1,
                y: [0, -6, 0],
                rotateX: [5.5, 6.8, 5.5],
                rotateY: [6.5, 5.2, 6.5],
                rotateZ: [0.5, -0.2, 0.5],
              }
        }
        transition={
          prefersReduced
            ? { duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }
            : {
                opacity: { duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 4.9, repeat: Infinity, ease: "easeInOut", delay: 1.1 },
                rotateX: { duration: 4.9, repeat: Infinity, ease: "easeInOut", delay: 1.1 },
                rotateY: { duration: 4.9, repeat: Infinity, ease: "easeInOut", delay: 1.1 },
                rotateZ: { duration: 4.9, repeat: Infinity, ease: "easeInOut", delay: 1.1 },
              }
        }
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
        className="pointer-events-auto relative group cursor-pointer inline-flex items-center mt-3 sm:mt-4.5"
      >
        {/* Soft Amber Atmospheric Glow */}
        <div
          className="absolute -inset-3 sm:-inset-4 rounded-[28px] pointer-events-none -z-10 blur-xl transition-opacity duration-500 opacity-90 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(245, 158, 11, 0.42) 0%, rgba(251, 191, 36, 0.22) 45%, transparent 75%)",
          }}
        />

        {/* Glassmorphism Capsule Surface */}
        <div
          className="relative flex items-center gap-3 sm:gap-3.5 px-3.5 py-2 sm:px-4.5 sm:py-3 rounded-[19px] sm:rounded-[21px] backdrop-blur-2xl transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1 min-w-[215px] sm:min-w-[235px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(3, 18, 48, 0.88) 0%, rgba(1, 10, 30, 0.94) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.22)",
            boxShadow:
              "0 20px 42px -12px rgba(0, 10, 32, 0.85), 0 8px 18px -6px rgba(0, 0, 0, 0.5), 0 0 25px -4px rgba(245, 158, 11, 0.28), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Subtle amber sheen */}
          <div
            className="absolute inset-0 rounded-[19px] sm:rounded-[21px] pointer-events-none opacity-80"
            style={{
              background:
                "linear-gradient(120deg, rgba(251, 191, 36, 0.12) 0%, transparent 45%, rgba(245, 158, 11, 0.08) 100%)",
            }}
          />

          {/* Internal Top-Edge Specular Highlight */}
          <div className="absolute inset-x-5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />

          {/* Diagonal Glass Reflection */}
          <div className="absolute inset-0 rounded-[19px] sm:rounded-[21px] bg-gradient-to-br from-white/[0.14] via-transparent to-transparent pointer-events-none" />

          {/* 3D Embossed Gold Glowing Badge with Graduation Cap Icon */}
          <div
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ring-4 ring-amber-500/25 transition-transform duration-300 group-hover:scale-105"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #FCD34D 0%, #F59E0B 70%, #D97706 100%)",
              boxShadow:
                "0 0 20px rgba(245, 158, 11, 0.7), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
            }}
          >
            <GraduationCap className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white stroke-[2.2] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)]" />
          </div>

          {/* Typography */}
          <div className="flex flex-col pr-1">
            <span className="font-semibold text-white text-[13px] sm:text-[14.5px] tracking-tight leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] whitespace-nowrap">
              New Admission
            </span>
            <span className="text-[#FDE68A] dark:text-[#FEF08A] text-[10.5px] sm:text-[11.5px] font-medium tracking-normal mt-0.5 whitespace-nowrap">
              04:10 PM
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Main Combined Component
 */
export default function HeroFloatingNotificationCards({
  className = "",
  side = 'all',
}: HeroFloatingNotificationCardsProps) {
  if (side === 'left') {
    return <HeroFloatingLeftCards className={className} />;
  }
  if (side === 'right') {
    return <HeroFloatingRightCards className={className} />;
  }

  return (
    <>
      <div className="absolute top-[4%] sm:top-[6%] lg:top-[7%] left-[-16%] sm:left-[-14%] lg:left-[-18%] xl:left-[-15%] 2xl:left-[-12%] z-30 flex flex-col items-start pointer-events-none scale-[0.74] sm:scale-[0.84] md:scale-90 lg:scale-[0.95] xl:scale-100 origin-top-left transition-transform duration-300">
        <HeroFloatingLeftCards className={className} />
      </div>

      <div className="absolute top-[6%] sm:top-[8%] lg:top-[8%] right-[-2%] sm:right-[0%] lg:right-[-2%] xl:right-[0%] 2xl:right-[2%] z-30 flex flex-col items-end pointer-events-none scale-[0.74] sm:scale-[0.84] md:scale-90 lg:scale-[0.95] xl:scale-100 origin-top-right transition-transform duration-300">
        <HeroFloatingRightCards className={className} />
      </div>
    </>
  );
}
