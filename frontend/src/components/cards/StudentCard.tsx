"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Pencil,
  MapPin,
  AlertTriangle,
  Check,
  Eye
} from "lucide-react";
import AppImage from "@/components/ui/AppImage";

export interface StudentCardProps {
  id?: string | number;
  rollNo: string;
  name: string;
  photo: string;
  status: "Present" | "Absent" | "Late" | string;
  age?: string;
  gender?: "Male" | "Female" | string;
  bloodGroup?: string;
  allergies?: string;
  address?: string;
  parentLabel?: string;
  parentName: string;
  phone: string;
  attendanceRate: number;
  classNameLabel?: string;
  theme?: "rose" | "blue";
  onViewProfile: () => void;
  onEdit?: () => void;
  onCall?: () => void;
  onChat?: () => void;
  onMenuClick?: () => void;
  className?: string;
}

export default function StudentCard({
  rollNo,
  name,
  photo,
  status = "Present",
  age,
  gender = "Male",
  bloodGroup = "O+",
  allergies,
  address,
  parentLabel = "Father",
  parentName,
  phone,
  attendanceRate = 94,
  classNameLabel = "LKG - Section A",
  theme,
  onViewProfile,
  onEdit,
  onCall,
  onChat,
  className = "",
}: StudentCardProps) {
  const cardTheme = theme || (gender === "Female" ? "rose" : "blue");
  const isRose = cardTheme === "rose";

  // Formatted 2-digit roll number (e.g., "1" -> "01")
  const formattedRoll = String(rollNo).padStart(2, "0");

  const isPresent = status === "Present";
  const isAbsent = status === "Absent";

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCall) {
      onCall();
    } else if (phone) {
      window.open(`tel:${phone}`);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChat) onChat();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewProfile();
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-[28px] bg-white dark:bg-[#111827] border ${
        isRose
          ? "border-[#FFE4EC] dark:border-rose-950/50 shadow-[0_8px_30px_rgba(244,114,182,0.08)]"
          : "border-[#D0E2FF] dark:border-blue-950/50 shadow-[0_8px_30px_rgba(37,99,235,0.08)]"
      } p-5 flex flex-col justify-between transition-all duration-300 ${className}`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER ROW: ROLL NUMBER PILL + STATUS BADGE                         */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        {/* Prominent Roll Number Pill */}
        <span className="inline-flex items-center px-3 py-1 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 border border-[#0050CB]/20 font-black text-xs tracking-wider shadow-2xs">
          Roll #{formattedRoll}
        </span>

        {/* Status Badge */}
        <span
          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-2xs ${
            isPresent
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
              : isAbsent
              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50"
              : "bg-amber-50 text-[#FF690C] dark:bg-amber-950/40 dark:text-amber-300 border border-[#FF690C]/30"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPresent
                ? "bg-emerald-500 animate-pulse"
                : isAbsent
                ? "bg-rose-500"
                : "bg-[#FF690C]"
            }`}
          />
          <span>{status}</span>
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 2. LEARNER IDENTITY: CHILD PHOTO + CHILD FULL NAME + MEDICAL/BLOOD PILLS   */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-3.5 pt-3.5 pb-2">
        <div className="relative shrink-0">
          <div
            className={`w-16 h-16 sm:w-18 sm:h-18 p-0.5 rounded-2xl ${
              isRose
                ? "bg-gradient-to-tr from-[#FFD5DC] to-[#FCA5A5]"
                : "bg-gradient-to-tr from-[#BFDBFE] to-[#93C5FD]"
            } shadow-xs`}
          >
            <AppImage
              src={photo}
              alt={name}
              fallbackType="avatar"
              name={name}
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {/* Child Full Name in Bold */}
          <h3
            onClick={handleProfileClick}
            className="font-black text-base text-slate-900 dark:text-white leading-snug truncate hover:text-[#0050CB] dark:hover:text-blue-400 cursor-pointer transition-colors"
            title={name}
          >
            {name}
          </h3>

          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {classNameLabel} {age ? `• ${age}` : ""}
          </p>

          {/* Health & Medical Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#E5EEFF] dark:bg-blue-950/50 text-[#0050CB] dark:text-blue-300 font-bold text-[10px]">
              <span>🩸</span>
              <span>{bloodGroup || "O+"}</span>
            </span>

            {allergies && !allergies.includes("None") && !allergies.includes("All clear") ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FFF7ED] dark:bg-amber-950/40 text-[#FF690C] border border-[#FFEDD5] dark:border-amber-900/50 font-bold text-[10px] truncate max-w-[150px]"
                title={allergies}
              >
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span className="truncate">{allergies}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                <Check className="w-3 h-3" />
                <span>Medical Clear</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RESIDENTIAL ADDRESS & GUARDIAN LOGISTICS SNIPPET                       */}
      {/* ========================================================================= */}
      <div className="rounded-2xl p-3 bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-2 mt-2 text-xs">
        {/* Residential Address with MapPin */}
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#0050CB] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-none mb-0.5">
              Residential Address
            </span>
            <span
              className="text-slate-700 dark:text-slate-300 font-medium text-[11px] line-clamp-1 block"
              title={address || "Classroom Local Resident"}
            >
              {address || "Classroom Local Resident"}
            </span>
          </div>
        </div>

        {/* Primary Guardian & Contact */}
        <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/80 pt-2 text-[11px]">
          <div className="truncate pr-2">
            <span className="text-slate-400 font-medium">{parentLabel}: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
              {parentName}
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">
            {phone}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CONSOLIDATED ACTION BAR: CALL • CHAT • EDIT • 360° PROFILE             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={handleCallClick}
          title={`Call ${parentName} (${phone})`}
          className="flex items-center justify-center gap-1 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-xs font-bold transition-all cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Call</span>
        </button>

        <button
          type="button"
          onClick={handleChatClick}
          title={`Message Guardian of ${name}`}
          className="flex items-center justify-center gap-1 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0050CB] dark:text-blue-300 hover:bg-[#E5EEFF] hover:border-[#0050CB]/30 text-xs font-bold transition-all cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>

        <button
          type="button"
          onClick={handleEditClick}
          title="Edit Student Profile & Address"
          className="flex items-center justify-center gap-1 py-2 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/50 text-[#0050CB] dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={handleProfileClick}
          title="Open Full 360° Profile Drawer"
          className="flex items-center justify-center gap-1 py-2 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>360°</span>
        </button>
      </div>
    </motion.div>
  );
}
