"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AppImage from "@/components/ui/AppImage";
import { usePathname } from "next/navigation";
import { 
  Menu, Search, Bell, Mail, Sun, Moon, ChevronDown, Check, ChevronRight, Calendar, Clock, User
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useParent } from "@/context/ParentContext";
import { useCurrentTime } from "@/lib/date";

interface ParentHeaderProps {
  onOpenMobileMenu: () => void;
}

export default function ParentHeader({ onOpenMobileMenu }: ParentHeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { parentProfile, children, selectedChild, selectChild, setIsSearchOpen, unreadNotificationCount, unreadMessageCount } = useParent();
  const { dateHeaderStr, timeStr } = useCurrentTime({ intervalMs: 15000 });
  const [isChildMenuOpen, setIsChildMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close child selector dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsChildMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute clean breadcrumbs from pathname
  const getBreadcrumbs = () => {
    if (pathname === "/parent") return [{ label: "Home", href: "/parent" }, { label: "Dashboard" }];
    const segments = pathname.replace(/^\/parent\/?/, "").split("/").filter(Boolean);
    const crumbs = [{ label: "Home", href: "/parent" }];
    let accum = "/parent";
    for (const seg of segments) {
      accum += `/${seg}`;
      const title = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
      crumbs.push({ label: title, href: accum });
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const currentChild = selectedChild || children[0] || null;

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-white/95 dark:bg-[#081329]/95 backdrop-blur-md border-b border-blue-100/70 dark:border-white/10 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-3 transition-colors shadow-2xs">
      {/* 1. Left Section: Mobile Menu & Breadcrumb Trail */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden w-10 h-10 rounded-full border border-blue-100/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-[#EAF4FF] dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Trail */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-400 font-medium truncate">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
                {isLast ? (
                  <span className="font-bold text-[#102A5C] dark:text-white truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href || "/parent"}
                    className="hover:text-[#0050CB] dark:hover:text-[#38BDF8] transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* 2. Center Section: Global Search Bar with ⌘K Badge */}
      <div className="flex items-center justify-start flex-1 min-w-[130px] max-w-[220px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[360px] mx-1 sm:mx-2">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="w-full h-10 flex items-center justify-between px-3.5 rounded-full bg-[#F6F9FE] hover:bg-[#EAF4FF] dark:bg-white/5 dark:hover:bg-white/10 border border-blue-100/80 dark:border-white/10 text-xs sm:text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all group shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-4 h-4 text-[#0050CB] shrink-0" />
            <span className="truncate font-medium text-slate-400 text-xs sm:text-[13px]">
              Search your child, homework, diary, fees...
            </span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-md shrink-0 shadow-2xs ml-1.5">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* 3. Right Section: Synchronized Action Controls & Profile Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 shrink-0">
        {/* Live Date & Real-time Clock */}
        <div className="hidden xl:flex items-center gap-2 h-10 px-3.5 rounded-full bg-[#F6F9FE] dark:bg-white/5 border border-blue-100/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[#0050CB] shrink-0" />
          <span suppressHydrationWarning className="whitespace-nowrap">{dateHeaderStr}</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <Clock className="w-3.5 h-3.5 text-[#FF690C] shrink-0" />
          <span className="font-mono text-[11px] font-bold text-[#0050CB] dark:text-[#38BDF8] whitespace-nowrap" suppressHydrationWarning>
            {timeStr}
          </span>
        </div>

        {/* Notification Bell with Dynamic Badge */}
        <Link
          href="/parent/notifications"
          className="relative w-10 h-10 rounded-full bg-[#F6F9FE] dark:bg-white/5 hover:bg-[#EAF4FF] dark:hover:bg-white/10 border border-blue-100/80 dark:border-white/10 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] transition-colors shadow-2xs cursor-pointer shrink-0"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#FF690C] text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-in fade-in">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </Link>

        {/* Messages with Dynamic Badge */}
        <Link
          href="/parent/messages"
          className="relative w-10 h-10 rounded-full bg-[#F6F9FE] dark:bg-white/5 hover:bg-[#EAF4FF] dark:hover:bg-white/10 border border-blue-100/80 dark:border-white/10 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] transition-colors shadow-2xs cursor-pointer shrink-0"
          title="Messages"
        >
          <Mail className="w-4 h-4" />
          {unreadMessageCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#0050CB] text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-in fade-in">
              {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
            </span>
          )}
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          suppressHydrationWarning
          className="w-10 h-10 rounded-full bg-[#F6F9FE] dark:bg-white/5 hover:bg-[#EAF4FF] dark:hover:bg-white/10 border border-blue-100/80 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-[#F59E0B] transition-colors cursor-pointer shadow-2xs shrink-0"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Active Child Selector Dropdown */}
        {currentChild ? (
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsChildMenuOpen(!isChildMenuOpen)}
              className="h-10 flex items-center gap-2 pl-1.5 pr-2.5 rounded-full bg-[#F6F9FE] hover:bg-[#EAF4FF] dark:bg-white/5 dark:hover:bg-white/10 border border-blue-100/80 dark:border-white/10 transition-all cursor-pointer shadow-2xs shrink-0"
            >
              <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 ring-[#0050CB]/30">
                <AppImage
                  src={currentChild.studentPhoto || "/aarav-hero-student.jpg"}
                  alt={currentChild.firstName}
                  fill
                  sizes="28px"
                  fallbackType="avatar"
                  name={`${currentChild.firstName} ${currentChild.lastName}`}
                  className="object-cover object-top"
                />
              </div>
              <div className="hidden sm:flex flex-col justify-center text-left pr-0.5 whitespace-nowrap">
                <span className="text-xs font-bold text-[#000E28] dark:text-white leading-tight">
                  {currentChild.firstName} {currentChild.lastName}
                </span>
                <span className="text-[9.5px] text-[#0050CB] dark:text-[#38BDF8] leading-tight font-semibold">
                  {currentChild.grade} - {currentChild.section}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Child Dropdown Menu */}
            {isChildMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#081329] rounded-2xl shadow-xl border border-blue-100 dark:border-white/10 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <p className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Select Child
                </p>
                <div className="space-y-1">
                  {children.map((c) => {
                    const isSelected = c._id === currentChild._id;
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => {
                          selectChild(c._id);
                          setIsChildMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#EAF4FF] dark:bg-white/10 text-[#0050CB] font-bold"
                            : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-200">
                            <AppImage
                              src={c.studentPhoto || "/aarav-hero-student.jpg"}
                              alt={c.firstName}
                              fill
                              sizes="32px"
                              fallbackType="avatar"
                              name={`${c.firstName} ${c.lastName}`}
                              className="object-cover object-top"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">
                              {c.firstName} {c.lastName}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {c.grade} - {c.section}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#0050CB]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-10 flex items-center gap-2 px-3 rounded-full bg-[#E5EEFF] dark:bg-white/5 border border-blue-200 dark:border-white/10 text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] shrink-0">
            <User className="w-3.5 h-3.5" />
            <span>Family Portal</span>
          </div>
        )}

        {/* Parent Profile Pill (Harmonized, Never Truncated) */}
        <Link
          href="/parent/account"
          className="h-10 flex items-center gap-2 pl-1.5 pr-3.5 rounded-full bg-[#F6F9FE] hover:bg-[#EAF4FF] dark:bg-white/5 dark:hover:bg-white/10 border border-blue-100/80 dark:border-white/10 transition-all group cursor-pointer text-left shrink-0 shadow-2xs"
          title="Parent Account Settings"
        >
          <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 ring-[#0050CB]/25">
            <AppImage
              src="/priya-exact-avatar.png"
              alt="Parent Profile"
              fill
              sizes="28px"
              fallbackType="avatar"
              name={parentProfile?.motherName || parentProfile?.fatherName || "Priya Sharma"}
              className="object-cover"
            />
          </div>
          <div className="hidden sm:flex flex-col justify-center whitespace-nowrap">
            <span className="text-xs font-bold text-[#000E28] dark:text-white leading-tight" suppressHydrationWarning>
              {parentProfile?.motherName || parentProfile?.fatherName || "Priya Sharma"}
            </span>
            <span className="text-[9.5px] text-slate-400 dark:text-slate-400 leading-tight font-medium">
              Parent
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
