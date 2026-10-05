"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Settings,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Award,
  Users,
  Building,
  FileText,
  Lock,
  MessageSquare,
  BarChart3,
  Clock,
  Zap,
} from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import FeatureBreadcrumb from "@/components/FeatureBreadcrumb";

export default function FeaturesIndexPage() {
  const featureList = [
    {
      slug: "intelligent-operations",
      title: "Intelligent Operations",
      tagline: "Smart Automation & Campus Management",
      description:
        "Automate class scheduling, admissions workflows, facility management, and staff payroll with zero paperwork.",
      color: "emerald",
      badgeBg: "bg-emerald-500",
      accentBorder: "border-emerald-200 dark:border-emerald-800/40",
      accentGradient: "from-emerald-500 to-teal-600",
      icon: Settings,
      image: "/hero-girl-student.png",
      bulletPoints: [
        "Conflict-free AI timetable & room scheduling",
        "Paperless end-to-end admission stage management",
        "Automated biometric staff attendance & payroll calculation",
        "Campus asset, lab & library resource tracking",
      ],
    },
    {
      slug: "performance-rubrics",
      title: "Performance & Rubrics",
      tagline: "Holistic Milestone & Academic Evaluation",
      description:
        "Track cognitive, motor, and academic milestones with teacher grading, rubrics, and automated report cards.",
      color: "purple",
      badgeBg: "bg-purple-500",
      accentBorder: "border-purple-200 dark:border-purple-800/40",
      accentGradient: "from-purple-500 to-fuchsia-600",
      icon: TrendingUp,
      image: "/student-raising-hand.png",
      bulletPoints: [
        "Foundational milestone rubrics for LKG/UKG & primary",
        "Cognitive, motor, social-emotional & phonics tracking",
        "Teacher observation remarks & progress scoring",
        "One-click professional digital report card generation",
      ],
    },
    {
      slug: "secure-connected",
      title: "Secure & Connected",
      tagline: "Role Portals & Multi-Channel Sync",
      description:
        "Role-based access control for Admins, Teachers, and Parents; instant announcements, WhatsApp updates, real-time alerts.",
      color: "amber",
      badgeBg: "bg-[#FF690C]",
      accentBorder: "border-amber-200 dark:border-amber-800/40",
      accentGradient: "from-[#FF690C] to-amber-500",
      icon: ShieldCheck,
      image: "/mother-daughter-study.png",
      bulletPoints: [
        "Dedicated RBAC portals for Admin, Teacher & Parent",
        "Real-time attendance & homework broadcast alerts",
        "Direct 2-way teacher-parent communications",
        "Enterprise-grade 256-bit encryption & immutable audit logs",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#000a1f] pt-28 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <FeatureBreadcrumb currentPage="All Features" />

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 border border-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GGPS School ERP Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000E28] dark:text-white tracking-tight leading-tight">
            Designed for Academic Excellence & Flawless Operations
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Discover the three foundational pillars that power GGPS School: streamline operations, foster child developmental milestones, and keep our entire school family safely connected.
          </p>
        </div>

        {/* 3 Main Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {featureList.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative bg-white dark:bg-[#001233] rounded-[32px] p-7 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl dark:shadow-none transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Top Bar with Icon & Tagline */}
                  <div className="flex items-center gap-3.5 mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl ${feat.badgeBg} text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        {feat.tagline}
                      </p>
                      <h2 className="text-xl font-black text-[#000E28] dark:text-white tracking-tight group-hover:text-[#0050CB] dark:group-hover:text-[#38BDF8] transition-colors">
                        {feat.title}
                      </h2>
                    </div>
                  </div>

                  {/* Cutout Image Container */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-6 bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <AppImage
                      src={feat.image}
                      alt={feat.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
                    {feat.description}
                  </p>

                  {/* Feature Highlights */}
                  <div className="space-y-2.5 mb-8">
                    {feat.bulletPoints.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learn More Action Button */}
                <Link
                  href={`/features/${feat.slug}`}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 hover:bg-[#0050CB] hover:text-white text-[#0050CB] dark:text-[#38BDF8] dark:hover:bg-[#0050CB] dark:hover:text-white font-bold text-sm flex items-center justify-center gap-2 group-hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Explore {feat.title}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Operational Excellence Stats Section */}
        <div className="bg-gradient-to-r from-[#0050CB] to-[#002677] text-white rounded-[32px] p-8 sm:p-12 mb-16 shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-black">99.8%</p>
              <p className="text-xs sm:text-sm text-blue-200 mt-1 font-semibold">On-time Notifications</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black">100%</p>
              <p className="text-xs sm:text-sm text-blue-200 mt-1 font-semibold">Zero Paperwork Admissions</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black">6 Domains</p>
              <p className="text-xs sm:text-sm text-blue-200 mt-1 font-semibold">Child Milestone Rubrics</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black">256-Bit</p>
              <p className="text-xs sm:text-sm text-blue-200 mt-1 font-semibold">Enterprise Security</p>
            </div>
          </div>
        </div>

        {/* Global CTA Box */}
        <div className="text-center bg-white dark:bg-[#00102E] rounded-[32px] p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight">
            Ready to experience the future of school management?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-2 mb-6">
            Get in touch with the GGPS School admissions desk or sign in to your dedicated portal.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-2xl bg-[#0050CB] hover:bg-[#003da8] text-white font-bold text-sm shadow-md transition-all"
            >
              Sign In to Portal
            </Link>
            <Link
              href="/admissions"
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#0050CB] text-[#000E28] dark:text-white font-bold text-sm transition-all"
            >
              Start Admission Enquiry
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
