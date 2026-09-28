"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, ShieldCheck, GraduationCap } from "lucide-react";
import { useParent } from "@/context/ParentContext";

interface ChildSwitcherProps {
  variant?: "header" | "card" | "pills";
  className?: string;
}

export default function ChildSwitcher({ variant = "header", className = "" }: ChildSwitcherProps) {
  const { children, selectedChild, selectChild } = useParent();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!selectedChild) return null;

  // Pills variant (for hero / dashboard banner)
  if (variant === "pills") {
    return (
      <div className={`flex flex-wrap items-center gap-2 sm:gap-3 ${className}`}>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-[#3157D5]" />
          My Children:
        </span>
        {children.map((child) => {
          const isSelected = child._id === selectedChild._id;
          return (
            <motion.button
              key={child._id}
              onClick={() => selectChild(child._id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                isSelected
                  ? "bg-[#3157D5] text-white border-[#3157D5] shadow-[0_4px_14px_rgba(49,87,213,0.25)]"
                  : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-[#3157D5]/40 hover:bg-[#EBF1FF]/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/40">
                <Image
                  src={child.studentPhoto || "/aarav-hero-student.jpg"}
                  alt={child.firstName}
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
              <span className="font-semibold">{child.firstName} {child.lastName}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}>
                {child.grade}
              </span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Header Dropdown Pill
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all duration-200 group text-left"
        aria-label="Switch child"
        aria-expanded={isOpen}
      >
        <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 ring-[#3157D5]/40 group-hover:ring-[#3157D5] transition-all">
          <Image
            src={selectedChild.studentPhoto || "/aarav-hero-student.jpg"}
            alt={selectedChild.firstName}
            fill
            sizes="28px"
            className="object-cover"
          />
        </div>
        <div className="hidden sm:flex flex-col pr-1">
          <span className="text-xs font-bold text-[#172033] dark:text-white leading-tight flex items-center gap-1">
            {selectedChild.firstName} {selectedChild.lastName}
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
          </span>
          <span className="text-[10px] font-semibold text-[#3157D5] dark:text-blue-400 leading-tight">
            {selectedChild.grade} · {selectedChild.section}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#3157D5]" : ""}`} />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-[0_12px_36px_rgba(7,20,47,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] p-2 z-50 backdrop-blur-xl"
          >
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Switch Student Profile
              </span>
              <span className="text-[10px] font-bold text-[#3157D5] bg-[#EBF1FF] dark:bg-[#3157D5]/20 px-2 py-0.5 rounded-full">
                {children.length} Enrolled
              </span>
            </div>

            <div className="space-y-1">
              {children.map((child) => {
                const isSelected = child._id === selectedChild._id;
                const studentId = (child as any).studentId || child.admissionNumber || (child.firstName.toLowerCase().includes("aarav")
                  ? "GGPS2026LKG001"
                  : "GGPS2026LKG002");

                return (
                  <button
                    key={child._id}
                    onClick={() => {
                      selectChild(child._id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-[#EBF1FF] dark:bg-[#3157D5]/25 text-[#172033] dark:text-white"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
                      <Image
                        src={child.studentPhoto || "/aarav-hero-student.jpg"}
                        alt={child.firstName}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-[#172033] dark:text-white">
                        {child.firstName} {child.lastName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {child.grade} · {child.section} ({studentId})
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#3157D5] flex items-center justify-center shrink-0 shadow-sm">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
