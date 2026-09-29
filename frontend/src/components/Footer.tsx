"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AcademyLogo from "@/components/AcademyLogo";
import { useLanguage } from "@/context/LanguageContext";
import {
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  GraduationCap,
} from "lucide-react";

interface NavLinkItemProps {
  href: string;
  label: string;
}

function NavLinkItem({ href, label }: NavLinkItemProps) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center justify-between text-[14px] text-slate-400 hover:text-white transition-all duration-200 py-1"
      >
        <span className="transition-transform duration-200 group-hover:translate-x-1.5">
          {label}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
      </Link>
    </li>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();

  // Hide the public marketing footer on login and inside portal/dashboard views
  // (the dashboard has its own dedicated application footer)
  if (
    pathname === '/login' ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/portal') ||
    pathname?.startsWith('/parent') ||
    pathname?.startsWith('/teacher') ||
    pathname?.startsWith('/admin')
  ) {
    return null;
  }

  const exploreLinks = [
    { href: "/", label: t("nav.home", "Home") },
    { href: "/admissions", label: t("nav.admissions", "Admissions") },
    { href: "/login", label: t("nav.adminPortal", "Admin Portal") },
    { href: "/portal", label: t("nav.parentPortal", "Parent Portal") },
  ];

  const managementLinks = [
    { href: "/dashboard/students", label: t("footer.students", "Student Directory & IDs") },
    { href: "/dashboard/fees", label: t("footer.fees", "Fee Billing & Collections") },
    { href: "/dashboard/attendance", label: t("footer.attendance", "Real-Time Attendance") },
    { href: "/dashboard/payroll", label: t("footer.payroll", "Staff Payroll & Operations") },
  ];

  return (
    <footer
      className="relative w-full bg-[#000E28] text-white overflow-hidden select-none z-10"
      aria-label="Footer Navigation and School Information"
    >
      {/* Top Transition Divider: Glowing horizontal beam separating page content from footer */}
      <div className="relative w-full h-[1px] bg-white/[0.08]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 sm:w-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-[#0050CB] to-transparent shadow-[0_0_15px_#0050CB]" />
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1/4 h-[3px] bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent blur-[1px]" />
      </div>

      {/* Atmospheric Background Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#0050CB]/30 via-[#002B7A]/20 to-transparent rounded-full blur-3xl pointer-events-none opacity-20" />
        <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-[#0050CB]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-[#38BDF8]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main 4-Column Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* COLUMN 1: Brand & Mission (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Logo Treatment with Academic Crest */}
            <Link href="/" className="inline-flex items-center gap-3 group">
              <AcademyLogo size="md" />
              <span className="text-2xl font-black tracking-tight text-white">
                GGPS <span className="text-[#38BDF8]">School</span>
              </span>
            </Link>

            {/* Description */}
            <p className="text-slate-400 text-[14px] leading-relaxed max-w-[320px] font-normal">
              {t("footer.desc", "Intelligent all-in-one school management platform unifying admissions, academics, fee operations, and parent communication.")}
            </p>

            {/* Status Pill Badge */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-sm shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                </span>
                <span>{t("footer.openAdmissions", "Admissions open for 2026–2027")}</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Explore Navigation (2.5 Cols) */}
          <div className="lg:col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-[#0050CB] to-[#38BDF8]" />
              <h3 className="text-xs font-bold tracking-[0.1em] text-white uppercase">
                {t("footer.explore", "EXPLORE")}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {exploreLinks.map((link) => (
                <NavLinkItem key={link.href} href={link.href} label={link.label} />
              ))}
            </ul>
          </div>

          {/* COLUMN 3: Management Navigation (3 Cols) */}
          <div className="lg:col-span-3 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-[#0050CB] to-[#38BDF8]" />
              <h3 className="text-xs font-bold tracking-[0.1em] text-white uppercase">
                {t("footer.management", "MANAGEMENT")}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {managementLinks.map((link) => (
                <NavLinkItem key={link.href} href={link.href} label={link.label} />
              ))}
            </ul>
          </div>

          {/* COLUMN 4: Contact & Support (3.5 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-[#0050CB] to-[#38BDF8]" />
              <h3 className="text-xs font-bold tracking-[0.1em] text-white uppercase">
                {t("footer.contact", "CONTACT & CAMPUS")}
              </h3>
            </div>

            <ul className="space-y-3 text-[14px]">
              {/* Address */}
              <li className="group flex items-start gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#38BDF8] shrink-0 mt-0.5 group-hover:scale-105 group-hover:border-[#0050CB] group-hover:bg-[#0050CB]/20 transition-all duration-200">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-slate-300 group-hover:text-white transition-colors leading-snug">
                  123 Education Lane, Learning City, 10001
                </span>
              </li>

              {/* Phone */}
              <li className="group flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#38BDF8] shrink-0 group-hover:scale-105 group-hover:border-[#0050CB] group-hover:bg-[#0050CB]/20 transition-all duration-200">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-slate-300 group-hover:text-white transition-colors">
                  +1 (555) 123-4567
                </span>
              </li>

              {/* Email */}
              <li className="group flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#38BDF8] shrink-0 group-hover:scale-105 group-hover:border-[#0050CB] group-hover:bg-[#0050CB]/20 transition-all duration-200">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-slate-300 group-hover:text-white transition-colors">
                  admin@ggpsschool.com
                </span>
              </li>
            </ul>

            {/* Compact CTA Button: Apply Online -> */}
            <div className="pt-2">
              <Link
                href="/admissions"
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0050CB] to-[#1D4ED8] hover:from-[#0041A8] hover:to-[#1E40AF] text-white font-bold text-xs shadow-[0_4px_16px_rgba(0,80,203,0.4)] hover:shadow-[0_6px_22px_rgba(0,80,203,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                <span>{t("footer.applyOnline", "Apply Online")}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Sub-footer Bar */}
      <div className="relative border-t border-white/[0.08] bg-[#000818]/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          {/* Copyright */}
          <p className="text-center sm:text-left text-slate-400 font-normal">
            &copy; {new Date().getFullYear()} GGPS School. {t("footer.rights", "All rights reserved.")}
          </p>

          {/* Trust Indicators & Portal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-400 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{t("footer.verified", "Verified School Portal")}</span>
            </span>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("footer.staffPortal", "Staff Portal")}</span>
            </Link>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <Link
              href="/admissions"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("nav.admissions", "Admissions")}</span>
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
