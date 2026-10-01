"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Users, Bell, User, Settings,
  LogOut, ChevronRight, ChevronLeft, X
} from "lucide-react";
import GGPSLogo from "@/components/parent/GGPSLogo";
import { useAuthStore } from "@/stores/authStore";
import { useParent } from "@/context/ParentContext";

interface ParentSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

/* ========================================================
   CUSTOM OUTLINE ICONS EXACT TO REFERENCE SCREENSHOT
======================================================== */
const AttendanceBagIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="6" width="16" height="15" rx="3" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <path d="m9 13 2 2 4-4" />
  </svg>
);

const DailyDiaryIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 8h8" />
    <path d="M8 12h8" />
    <path d="M8 16h5" />
  </svg>
);

const HomeworkIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2Z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h5" />
    <path d="M8 17h8" />
  </svg>
);

const AcademicProgressIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 16V10" />
    <path d="M12 16V7" />
    <path d="M16 16V13" />
  </svg>
);

const AssessmentsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

const TimetableIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <circle cx="12" cy="15" r="3" />
    <path d="M12 14v1l1 1" />
  </svg>
);

const FeesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V5a3 3 0 0 1 6 0v3" />
    <path d="m10 13 1.5 1.5 3-3" />
  </svg>
);


const ActivitiesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)" />
    <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
  </svg>
);

const SchoolEventsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="M12 14.5c-1-1-2-.5-2 1 0 1.5 2 2.5 2 2.5s2-1 2-2.5c0-1.5-1-2-2-1Z" fill="currentColor" />
  </svg>
);

const CommunicationIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 16a4 4 0 0 1-.88-7.9 5 5 0 0 1 9.76 0A4 4 0 0 1 17 16H7Z" />
    <path d="M9 12c.5.5 1.5.5 2 0" />
  </svg>
);

const DocumentsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);

export default function ParentSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: ParentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadMessageCount, unreadNotificationCount } = useParent();

  interface NavSection {
    title: string;
    items: {
      label: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string;
    }[];
  }

  /* ========================================================
     CLUSTERED NAVIGATION DOMAINS FOR INTUITIVE PARENT UX
  ======================================================== */
  const navSections: NavSection[] = [
    {
      title: "Daily Essentials",
      items: [
        { label: "Home", href: "/parent", icon: Home },
        { label: "My Children", href: "/parent/children", icon: Users, badge: "2" },
        { label: "Daily Diary", href: "/parent/diary", icon: DailyDiaryIcon },
        { label: "Attendance", href: "/parent/attendance", icon: AttendanceBagIcon },
        { label: "Homework", href: "/parent/homework", icon: HomeworkIcon, badge: "3" },
        { label: "Timetable", href: "/parent/timetable", icon: TimetableIcon },
      ],
    },
    {
      title: "Academics & Growth",
      items: [
        { label: "Academic Progress", href: "/parent/progress", icon: AcademicProgressIcon },
        { label: "Assessments", href: "/parent/assessments", icon: AssessmentsIcon },
        { label: "Activities", href: "/parent/activities", icon: ActivitiesIcon },
      ],
    },
    {
      title: "School Life & Connect",
      items: [
        { 
          label: "Communication", 
          href: "/parent/messages", 
          icon: CommunicationIcon, 
          badge: unreadMessageCount > 0 ? (unreadMessageCount > 99 ? "99+" : String(unreadMessageCount)) : undefined 
        },
        { label: "School Events", href: "/parent/events", icon: SchoolEventsIcon, badge: "4" },
        { 
          label: "Notifications", 
          href: "/parent/notifications", 
          icon: Bell, 
          badge: unreadNotificationCount > 0 ? (unreadNotificationCount > 99 ? "99+" : String(unreadNotificationCount)) : undefined 
        },
      ],
    },
    {
      title: "Finance & Records",
      items: [
        { label: "Fees & Payments", href: "/parent/fees", icon: FeesIcon, badge: "1" },
        { label: "Documents", href: "/parent/documents", icon: DocumentsIcon },
        { label: "My Account", href: "/parent/account", icon: User },
      ],
    },
  ];

  const handleLogout = () => {
    useAuthStore.getState().logout();
  };

  const isItemActive = (href: string) => {
    if (href === "/parent") return pathname === "/parent";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#F3F8FF] via-white to-[#F0F6FF] dark:from-[#061026] dark:via-[#081329] dark:to-[#061026] text-slate-700 dark:text-slate-200 select-none relative overflow-hidden font-sans border-r border-blue-100/70 dark:border-white/10 shadow-[2px_0_12px_rgba(0,80,203,0.03)]">
      
      {/* 1. Header: Logo & Parent Portal Title */}
      {isCollapsed ? (
        <div className="py-3 px-2 flex flex-col items-center gap-2 shrink-0 border-b border-blue-100/60 dark:border-white/10">
          <Link
            href="/parent"
            className="flex items-center justify-center p-1 rounded-xl hover:bg-blue-50 dark:hover:bg-white/5 transition-colors"
            title="GGPS School - Parent Portal"
          >
            <GGPSLogo size="sm" />
          </Link>

          {/* Desktop Expand Toggle Button inside collapsed header */}
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-[#0050CB] hover:bg-[#E5EEFF] dark:hover:bg-white/10 transition-colors cursor-pointer items-center justify-center"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-between px-4 sm:px-5 shrink-0 bg-transparent">
          <Link href="/parent" className="flex items-center gap-3 group min-w-0">
            <GGPSLogo size="md" />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-black tracking-tight text-[#102A5C] dark:text-white truncate">
                GGPS School
              </span>
              <span className="text-[11px] font-bold text-[#0050CB] tracking-wide truncate">
                Parent Portal
              </span>
            </div>
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-[#0050CB] hover:bg-[#E5EEFF] dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Clustered Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-thin scrollbar-thumb-blue-100/60 dark:scrollbar-thumb-slate-800">
        {navSections.map((section, sIdx) => (
          <div key={section.title || sIdx} className="space-y-1">
            {/* Section Header */}
            {!isCollapsed ? (
              <div className="px-3 pt-1.5 pb-0.5">
                <p className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-blue-300/60">
                  {section.title}
                </p>
              </div>
            ) : (
              sIdx > 0 && <div className="border-t border-blue-100/60 dark:border-white/10 my-2 mx-1" />
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`relative flex items-center gap-3 px-3.5 py-2 rounded-[14px] transition-all duration-200 group ${
                    active
                      ? "bg-gradient-to-r from-[#1C64F2] via-[#2B7FFF] to-[#3B82F6] text-white font-bold shadow-[0_6px_16px_rgba(28,100,242,0.30)] scale-[1.01]"
                      : "text-[#1E3A8A] dark:text-blue-100 hover:text-[#0050CB] hover:bg-blue-50/80 dark:hover:bg-white/5 font-semibold text-[13.5px]"
                  } ${isCollapsed ? "justify-center px-2 py-2.5" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                      active ? "text-white" : "text-[#1A56DB] dark:text-blue-400"
                    }`}
                  />

                  {!isCollapsed && (
                    <span className={`truncate flex-1 tracking-tight text-[13.5px] ${active ? "font-bold text-white" : "font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#0050CB]"}`}>
                      {item.label}
                    </span>
                  )}

                  {/* Notification Badge */}
                  {!isCollapsed && item.badge && !active && (
                    <span className="w-5 h-5 rounded-full bg-[#F43F5E] text-white text-[10.5px] font-black flex items-center justify-center shrink-0 shadow-xs ml-auto">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* 3. Bottom Decorative Card & Links (Exact to Reference Screenshot) */}
      {!isCollapsed && (
        <div className="relative mt-auto p-3.5 pt-1 select-none">
          {/* Illustrated Card with Floral Decor & Slogan */}
          <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#EBF5FF] via-[#F3F9FF] to-[#E5F1FF] dark:from-[#0B1E45] dark:via-[#081530] dark:to-[#0A1A3C] border border-blue-100/90 dark:border-white/10 p-3.5 pt-4 shadow-sm shadow-blue-500/5">
            {/* Background Floral Art (Right Corner) */}
            <div className="absolute -bottom-1 -right-1 w-24 h-28 pointer-events-none opacity-90">
              <svg viewBox="0 0 100 110" fill="none" className="w-full h-full">
                {/* Soft Leaves */}
                <path d="M40 90C45 60 70 45 95 35C95 65 80 85 55 95Z" fill="#86EFAC" fillOpacity="0.75" />
                <path d="M60 85C70 65 88 55 100 50C98 75 85 88 70 95Z" fill="#38BDF8" fillOpacity="0.65" />
                <path d="M50 100C60 75 80 70 95 68C90 90 75 102 60 105Z" fill="#4ADE80" fillOpacity="0.8" />
                {/* Blossom Flowers */}
                <circle cx="85" cy="85" r="7" fill="#F472B6" />
                <circle cx="85" cy="85" r="3" fill="#FDE047" />
                <circle cx="70" cy="98" r="5" fill="#FB7185" />
                <circle cx="70" cy="98" r="2" fill="#FEF08A" />
              </svg>
            </div>

            {/* Slogan: Together We Build Brighter Futures ♡ */}
            <div className="relative z-10 pr-10 mb-3">
              <p className="text-[12px] font-bold text-[#1A56DB] dark:text-blue-200 leading-tight">
                Together
              </p>
              <p className="text-[12px] font-bold text-[#1A56DB] dark:text-blue-200 leading-tight">
                We Build
              </p>
              <p className="text-[13px] font-black text-[#1A56DB] dark:text-blue-100 leading-tight flex items-center gap-1 mt-0.5 font-serif italic">
                <span>Brighter Futures</span>
                <span className="text-rose-500 not-italic text-sm">♡</span>
              </p>
            </div>

            {/* 3 Interactive Links: Help & Support, Settings, Logout */}
            <div className="relative z-10 space-y-1 pt-1 border-t border-blue-200/50 dark:border-white/10">
              <Link
                href="/parent/messages"
                className="flex items-center gap-2.5 py-1 px-1 text-[12px] font-bold text-[#1E40AF] dark:text-blue-200 hover:text-[#0050CB] hover:translate-x-0.5 transition-all group"
              >
                <Settings className="w-3.5 h-3.5 text-[#1D4ED8] group-hover:rotate-45 transition-transform" />
                <span>Help &amp; Support</span>
              </Link>

              <Link
                href="/parent/account"
                className="flex items-center gap-2.5 py-1 px-1 text-[12px] font-bold text-[#1E40AF] dark:text-blue-200 hover:text-[#0050CB] hover:translate-x-0.5 transition-all group"
              >
                <Settings className="w-3.5 h-3.5 text-[#1D4ED8] group-hover:rotate-45 transition-transform" />
                <span>Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 py-1 px-1 text-[12px] font-bold text-[#1E40AF] dark:text-blue-200 hover:text-rose-600 hover:translate-x-0.5 transition-all text-left group cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-[#1D4ED8] group-hover:text-rose-600 transition-colors" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed bottom actions (Settings & Logout) */}
      {isCollapsed && (
        <div className="mt-auto p-2 flex flex-col items-center gap-1 pb-3 border-t border-blue-100/60 dark:border-white/10 shrink-0">
          <Link
            href="/parent/account"
            title="Settings"
            className="p-2 rounded-xl text-slate-400 hover:text-[#0050CB] hover:bg-[#E5EEFF] dark:hover:bg-white/10 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (260px width matching exact design) */}
      <aside
        className={`hidden md:flex flex-col shrink-0 transition-all duration-300 z-30 relative ${
          isCollapsed ? "w-[76px]" : "w-[260px] lg:w-[270px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-[280px] h-full z-10 shadow-2xl flex flex-col"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
