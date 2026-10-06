"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Bell, Check, ChevronRight, Wallet, BookOpen, 
  Calendar, Paperclip, UserCheck, Star, Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { formatHeaderDate } from "@/lib/date";
import { useParent } from "@/context/ParentContext";
import ParentEmptyChildState from "@/components/parent/ParentEmptyChildState";

interface NotificationItem {
  id: string;
  category: "Fees" | "Homework" | "Attendance" | "Events" | "Teacher";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  attachment?: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function NotificationsPage() {
  const { selectedChild, children } = useParent();
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const childName = selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}`.trim() : "Your child";

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-1",
      category: "Fees",
      title: "Term 2 Fee Invoice Published",
      message: "Tuition and digital classroom fee invoice for Term 2 (₹4,500) has been generated. Due by 30 September 2026.",
      time: "10 minutes ago",
      isRead: false,
      attachment: "Invoice_Term2_2026.pdf",
      accentColor: "#0050CB",
      badgeBg: "bg-[#E5EEFF] dark:bg-blue-950/60",
      badgeText: "text-[#0050CB] dark:text-blue-300",
      iconBg: "bg-[#EBF3FE] dark:bg-blue-900/30",
      iconColor: "text-[#0050CB]",
      icon: Wallet,
    },
    {
      id: "n-2",
      category: "Homework",
      title: "New Assignment: Drawing Domestic Animals",
      message: "Ms. Ananya Roy assigned a new creative arts colouring worksheet due tomorrow.",
      time: "2 hours ago",
      isRead: false,
      attachment: "Drawing_Worksheet.pdf",
      accentColor: "#E11D48",
      badgeBg: "bg-[#FDEBF1] dark:bg-rose-950/60",
      badgeText: "text-[#E11D48] dark:text-rose-300",
      iconBg: "bg-[#FDEEF2] dark:bg-rose-900/30",
      iconColor: "text-[#E11D48]",
      icon: BookOpen,
    },
    {
      id: "n-3",
      category: "Attendance",
      title: "Morning Campus Check-In Confirmed",
      message: `${childName} checked into campus Gate 2 at 08:24 AM via biometric reader.`,
      time: "Today, 08:26 AM",
      isRead: false,
      accentColor: "#0D9488",
      badgeBg: "bg-[#E6F8F6] dark:bg-teal-950/60",
      badgeText: "text-[#0D9488] dark:text-teal-300",
      iconBg: "bg-[#E5F9F7] dark:bg-teal-900/30",
      iconColor: "text-[#0D9488]",
      icon: UserCheck,
    },
    {
      id: "n-4",
      category: "Events",
      title: "Annual Sports Day Registration Open",
      message: "Registrations for track & field races and parent-child obstacle relays are now open on the school calendar.",
      time: "Yesterday",
      isRead: false,
      accentColor: "#7C3AED",
      badgeBg: "bg-[#F3EBFD] dark:bg-purple-950/60",
      badgeText: "text-[#7C3AED] dark:text-purple-300",
      iconBg: "bg-[#F3EBFD] dark:bg-purple-900/30",
      iconColor: "text-[#7C3AED]",
      icon: Star,
    },
    {
      id: "n-5",
      category: "Teacher",
      title: "Classroom Activity Update",
      message: "Ms. Ananya shared pictures from today's hands-on sensory exploration class.",
      time: "Yesterday",
      isRead: false,
      accentColor: "#0284C7",
      badgeBg: "bg-[#E5F7FD] dark:bg-sky-950/60",
      badgeText: "text-[#0284C7] dark:text-sky-300",
      iconBg: "bg-[#E5F7FD] dark:bg-sky-900/30",
      iconColor: "text-[#0284C7]",
      icon: UserCheck,
    },
  ]);

  const categories = [
    { label: "All", count: 14 },
    { label: "Fees", count: 2 },
    { label: "Homework", count: 3 },
    { label: "Attendance", count: 2 },
    { label: "Events", count: 2 },
    { label: "Teacher", count: 2 },
  ];

  const filteredNotifications = activeFilter === "All"
    ? notifications
    : notifications.filter((n) => n.category.toLowerCase() === activeFilter.toLowerCase());

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("All notifications marked as read!");
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  if (children.length === 0) {
    return <ParentEmptyChildState />;
  }

  return (
    <div className="space-y-5 pb-16 max-w-[1380px] mx-auto font-sans text-slate-800 dark:text-slate-100">
      
      {/* ========================================================
          1. BREADCRUMBS
      ======================================================== */}
      <nav className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/parent" className="hover:text-[#0050CB] transition-colors">
          Home
        </Link>
        <span className="text-slate-400">›</span>
        <span className="text-slate-700 dark:text-slate-200 font-bold">Notifications</span>
      </nav>

      {/* ========================================================
          2. TOP HERO BANNER (Exact to reference design)
      ======================================================== */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#EBF5FE] via-[#E4F2FE] to-[#D6EAFE] dark:from-[#061530] dark:via-[#091D45] dark:to-[#071938] border border-[#CCE3FD] dark:border-white/10 p-6 sm:p-7 min-h-[160px] flex items-center justify-between shadow-xs">
        
        {/* Left Side Content */}
        <div className="relative z-10 max-w-xl space-y-2">

          <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight">
            Notifications Center
          </h1>

          <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Stay connected with attendance, learning, fees, activities and school updates in real time.
          </p>
        </div>

        {/* Paper Airplane Flying Trajectory SVG */}
        <div className="absolute left-[380px] top-[26px] hidden xl:block pointer-events-none opacity-85">
          <svg width="180" height="90" viewBox="0 0 180 90" fill="none">
            {/* Dashed curved flight trail */}
            <path
              d="M 5 65 C 45 68, 65 30, 115 28 C 135 27, 150 22, 160 15"
              stroke="#0050CB"
              strokeWidth="1.8"
              strokeDasharray="4 4"
              strokeLinecap="round"
              fill="none"
              opacity="0.45"
            />
            {/* Origami Paper Airplane */}
            <g transform="translate(150, 8) rotate(-15) scale(0.85)">
              <polygon points="0,15 32,0 12,24" fill="#0050CB" fillOpacity="0.85" />
              <polygon points="12,24 32,0 18,32" fill="#2563EB" />
              <polygon points="0,15 12,24 8,28" fill="#1D4ED8" />
            </g>
          </svg>
        </div>

        {/* Right Side: Cute Schoolhouse Illustration & Action Button */}
        <div className="relative z-10 flex items-center gap-6">
          
          {/* Detailed School Illustration with Clock Tower & Trees */}
          <div className="hidden lg:block relative w-[240px] h-[120px] shrink-0 pointer-events-none select-none">
            <svg viewBox="0 0 280 140" fill="none" className="w-full h-full drop-shadow-sm">
              <defs>
                <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#C2410C" />
                </linearGradient>
                <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FED7AA" />
                  <stop offset="100%" stopColor="#FDBA74" />
                </linearGradient>
                <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#86EFAC" />
                  <stop offset="100%" stopColor="#4ADE80" />
                </linearGradient>
                <linearGradient id="treeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#15803D" />
                </linearGradient>
              </defs>

              {/* Background Fluffy Cloud */}
              <path d="M40 50 Q48 35 65 42 Q80 30 95 44 Q110 40 115 54 Z" fill="white" fillOpacity="0.75" />
              <path d="M190 35 Q200 22 215 28 Q230 18 245 30 Q255 26 260 40 Z" fill="white" fillOpacity="0.65" />

              {/* Rolling Hills Base */}
              <ellipse cx="140" cy="155" rx="145" ry="45" fill="url(#hillGrad)" />
              <ellipse cx="60" cy="148" rx="80" ry="30" fill="#22C55E" fillOpacity="0.85" />
              <ellipse cx="230" cy="145" rx="80" ry="30" fill="#34D399" />

              {/* Left Trees */}
              <circle cx="45" cy="95" r="18" fill="url(#treeGrad)" />
              <circle cx="30" cy="102" r="14" fill="#16A34A" />
              <circle cx="58" cy="100" r="13" fill="#4ADE80" />

              {/* Right Trees */}
              <circle cx="235" cy="90" r="22" fill="url(#treeGrad)" />
              <circle cx="215" cy="98" r="16" fill="#16A34A" />
              <circle cx="255" cy="96" r="16" fill="#86EFAC" />

              {/* School Left Wing */}
              <rect x="75" y="85" width="40" height="35" rx="3" fill="url(#wallGrad)" stroke="#EA580C" strokeWidth="1" />
              <polygon points="70,85 95,68 120,85" fill="url(#roofGrad)" />
              <rect x="83" y="93" width="9" height="12" rx="1.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="0.8" />
              <rect x="100" y="93" width="9" height="12" rx="1.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="0.8" />

              {/* School Right Wing */}
              <rect x="155" y="85" width="40" height="35" rx="3" fill="url(#wallGrad)" stroke="#EA580C" strokeWidth="1" />
              <polygon points="150,85 175,68 200,85" fill="url(#roofGrad)" />
              <rect x="162" y="93" width="9" height="12" rx="1.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="0.8" />
              <rect x="179" y="93" width="9" height="12" rx="1.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="0.8" />

              {/* School Center Tower */}
              <rect x="110" y="68" width="50" height="52" rx="3" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.2" />
              <polygon points="104,68 135,42 166,68" fill="url(#roofGrad)" />

              {/* Clock Tower Cupola */}
              <rect x="123" y="44" width="24" height="24" rx="2" fill="#FFEDD5" stroke="#C2410C" strokeWidth="1" />
              <polygon points="119,44 135,26 151,44" fill="url(#roofGrad)" />
              
              {/* Flagpole & Red Flag */}
              <line x1="135" y1="26" x2="135" y2="12" stroke="#64748B" strokeWidth="1.5" />
              <polygon points="135,12 152,17 135,22" fill="#EF4444" />

              {/* Clock Face */}
              <circle cx="135" cy="56" r="7.5" fill="white" stroke="#0284C7" strokeWidth="1" />
              <line x1="135" y1="56" x2="135" y2="52" stroke="#000E28" strokeWidth="1" strokeLinecap="round" />
              <line x1="135" y1="56" x2="138" y2="56" stroke="#000E28" strokeWidth="1" strokeLinecap="round" />

              {/* School Main Arched Door */}
              <path d="M127 120 V102 Q135 96 143 102 V120 Z" fill="#78350F" />
              <rect x="129" y="104" width="5" height="14" fill="#9A3412" rx="1" />
              <rect x="136" y="104" width="5" height="14" fill="#9A3412" rx="1" />
            </svg>
          </div>

          {/* Mark All as Read Button */}
          <button
            onClick={handleMarkAllRead}
            className="px-5 py-2.5 rounded-full bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs sm:text-[13px] font-bold flex items-center gap-2 shadow-md shadow-[#0050CB]/25 hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Check className="w-4 h-4 stroke-[2.8]" />
            <span>Mark All as Read</span>
          </button>
        </div>

      </div>

      {/* ========================================================
          3. CATEGORY FILTER PILLS
      ======================================================== */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeFilter.toLowerCase() === cat.label.toLowerCase();
          return (
            <button
              key={cat.label}
              onClick={() => setActiveFilter(cat.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-[#0050CB] text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-[#07142F] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-white/10 hover:border-blue-300"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-black flex items-center justify-center ${
                  isActive
                    ? "bg-[#2563EB] text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          4. MAIN 2-COLUMN LAYOUT
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ----------------------------------------------------
            LEFT COLUMN (8 COLS): NOTIFICATION CARDS LIST
        ---------------------------------------------------- */}
        <div className="lg:col-span-8 space-y-3.5">
          {filteredNotifications.map((notif) => {
            const Icon = notif.icon;

            return (
              <div
                key={notif.id}
                onClick={() => handleToggleRead(notif.id)}
                className="relative overflow-hidden bg-white dark:bg-[#07142F] rounded-[22px] p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] hover:shadow-md transition-all cursor-pointer group flex items-start gap-4 sm:gap-5"
              >
                {/* Left Colored Accent Bar Indicator */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-[4.5px] rounded-r-md transition-opacity"
                  style={{ backgroundColor: notif.accentColor }}
                />

                {/* Left Category Icon Box */}
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-transparent group-hover:scale-105 transition-transform ${notif.iconBg}`}
                >
                  <Icon className={`w-5 h-5 ${notif.iconColor} stroke-[2.2]`} />
                </div>

                {/* Middle & Right Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  
                  {/* Top Line: Title + Category Pill + Timestamp + Chevron */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-[#000E28] dark:text-white group-hover:text-[#0050CB] transition-colors leading-snug">
                        {notif.title}
                      </h3>
                      <span 
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${notif.badgeBg} ${notif.badgeText}`}
                      >
                        {notif.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0050CB]" />
                        <span>{notif.time}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#0050CB] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  {/* Body Message */}
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {notif.message}
                  </p>

                  {/* Optional Attachment Pill */}
                  {notif.attachment && (
                    <div className="pt-1">
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Opening ${notif.attachment}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0050CB] hover:border-blue-300 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Paperclip className="w-3 h-3 text-slate-400" />
                        <span>{notif.attachment}</span>
                      </span>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* ----------------------------------------------------
            RIGHT COLUMN (4 COLS): TODAY AT A GLANCE + PREFERENCES
        ---------------------------------------------------- */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* 1. TODAY AT A GLANCE CARD */}
          <div className="bg-white dark:bg-[#07142F] rounded-[24px] p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] space-y-4">
            
            {/* Header */}
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#000E28] dark:text-white">
                  Today at a Glance
                </h2>
                <p className="text-xs text-slate-400 font-medium" suppressHydrationWarning>
                  {formatHeaderDate()}
                </p>
              </div>
            </div>

            {/* List Rows */}
            <div className="space-y-3">
              
              {/* Row 1: Unread Notifications */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-blue-200 flex items-center justify-between transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] flex items-center justify-center shrink-0">
                    <Bell className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#000E28] dark:text-white">
                      Unread Notifications
                    </p>
                    <p className="text-base font-black text-[#0050CB] dark:text-blue-400 leading-tight">
                      15
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Row 2: Attendance Update */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 flex items-center justify-between transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E6F8F6] dark:bg-teal-950/60 text-[#0D9488] flex items-center justify-center shrink-0">
                    <UserCheck className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#000E28] dark:text-white">
                      Attendance Update
                    </p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {childName} - Present
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Today, 08:24 AM
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Row 3: Homework Update */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-rose-200 flex items-center justify-between transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FDEBF1] dark:bg-rose-950/60 text-[#E11D48] flex items-center justify-center shrink-0">
                    <BookOpen className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#000E28] dark:text-white">
                      Homework Update
                    </p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Drawing Domestic Animals
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Due Tomorrow
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Row 4: Upcoming Event */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-purple-200 flex items-center justify-between transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F3EBFD] dark:bg-purple-950/60 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <Calendar className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#000E28] dark:text-white">
                      Upcoming Event
                    </p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Sports Day Registration
                    </p>
                    <p className="text-[11px] text-slate-400">
                      26 Sep 2025
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
