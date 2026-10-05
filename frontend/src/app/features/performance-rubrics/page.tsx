"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Award,
  BookOpen,
  Brain,
  Smile,
  Activity,
  Compass,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileCheck,
  Star,
  Users,
  Eye,
  Download,
  GraduationCap,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import FeatureBreadcrumb from "@/components/FeatureBreadcrumb";

export default function PerformanceRubricsPage() {
  const [selectedDomain, setSelectedDomain] = useState(0);

  // 6 Foundational Development Areas for LKG/UKG & Primary
  const developmentAreas = [
    {
      id: "phonics",
      title: "Language & Phonics",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-600 dark:text-blue-400",
      bgLight: "bg-blue-50 dark:bg-blue-950/50",
      description: "Phonemic awareness, blended consonant sounds, vocabulary enrichment, active listening, and expressive narration.",
      criteria: [
        { label: "Letter-sound association (A-Z)", level: "Exceeding Expectations (4/4)" },
        { label: "Sight word recognition & simple sentences", level: "Meeting Expectations (3/4)" },
        { label: "Story comprehension & expressive recall", level: "Meeting Expectations (3/4)" },
        { label: "Early handwriting stroke formulation", level: "Developing (2/4)" },
      ],
    },
    {
      id: "numeracy",
      title: "Numeracy & Quantities",
      icon: Brain,
      color: "from-purple-500 to-fuchsia-600",
      textColor: "text-purple-600 dark:text-purple-400",
      bgLight: "bg-purple-50 dark:bg-purple-950/50",
      description: "Number sense, cardinal counting, 2D/3D shape attributes, spatial relationships, and concrete patterns.",
      criteria: [
        { label: "Quantities to numerals matching (1-50)", level: "Exceeding Expectations (4/4)" },
        { label: "Pattern recognition & sequential ordering", level: "Exceeding Expectations (4/4)" },
        { label: "Basic addition using concrete counters", level: "Meeting Expectations (3/4)" },
        { label: "Spatial awareness (above, below, beside)", level: "Meeting Expectations (3/4)" },
      ],
    },
    {
      id: "creative",
      title: "Creative & Visual Arts",
      icon: Sparkles,
      color: "from-pink-500 to-rose-600",
      textColor: "text-pink-600 dark:text-pink-400",
      bgLight: "bg-pink-50 dark:bg-pink-950/50",
      description: "Color mixing, imaginative drawing, paper collage, clay modeling, and musical rhythm participation.",
      criteria: [
        { label: "Color identification & aesthetic palette choice", level: "Exceeding Expectations (4/4)" },
        { label: "Imaginative self-expression via medium", level: "Meeting Expectations (3/4)" },
        { label: "Rhythm replication and singing rhymes", level: "Meeting Expectations (3/4)" },
        { label: "Clay modeling & 3D texture handling", level: "Exceeding Expectations (4/4)" },
      ],
    },
    {
      id: "motor",
      title: "Fine & Gross Motor Skills",
      icon: Activity,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/50",
      description: "Pincer grasp, child-safe scissor coordination, balance beams, running agility, and hand-eye coordination.",
      criteria: [
        { label: "Tripod pencil grip and pressure control", level: "Meeting Expectations (3/4)" },
        { label: "Safety scissor paper cutting along lines", level: "Developing (2/4)" },
        { label: "Balance beam walking & hopping agility", level: "Exceeding Expectations (4/4)" },
        { label: "Ball catching and throwing accuracy", level: "Meeting Expectations (3/4)" },
      ],
    },
    {
      id: "social",
      title: "Social & Emotional Growth",
      icon: Smile,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-600 dark:text-amber-400",
      bgLight: "bg-amber-50 dark:bg-amber-950/50",
      description: "Empathy, cooperative peer play, respectful turn-taking, classroom routines, and emotional self-expression.",
      criteria: [
        { label: "Shares toys and classroom learning material", level: "Exceeding Expectations (4/4)" },
        { label: "Follows multi-step classroom instructions", level: "Meeting Expectations (3/4)" },
        { label: "Resolves peer disagreements calmly", level: "Meeting Expectations (3/4)" },
        { label: "Demonstrates empathy towards classmates", level: "Exceeding Expectations (4/4)" },
      ],
    },
    {
      id: "general",
      title: "General Awareness",
      icon: Compass,
      color: "from-teal-500 to-cyan-600",
      textColor: "text-teal-600 dark:text-teal-400",
      bgLight: "bg-teal-50 dark:bg-teal-950/50",
      description: "Nature exploration, seasons, community helpers, animal habitats, and healthy nutritional awareness.",
      criteria: [
        { label: "Community helpers identification", level: "Exceeding Expectations (4/4)" },
        { label: "Healthy vs junk food distinction", level: "Meeting Expectations (3/4)" },
        { label: "Plant life cycle & seasons comprehension", level: "Meeting Expectations (3/4)" },
        { label: "Curiosity and asking scientific questions", level: "Exceeding Expectations (4/4)" },
      ],
    },
  ];

  // Assessment Workflow Steps
  const workflowFlow = [
    { title: "Teacher", role: "Classroom Educator", desc: "Observes child in daily learning, play, and guided tasks." },
    { title: "Assessment", role: "Milestone Task", desc: "Structured observational assessment aligned with CBSE/NEP foundational stage." },
    { title: "Rubric Evaluation", role: "Standardized Scale", desc: "Ratings across 4 competency levels: Exemplary, Proficient, Approaching, Emerging." },
    { title: "Performance Data", role: "Analytics Engine", desc: "Auto-calculated domain score benchmarks and historical milestone trends." },
    { title: "Teacher Remarks", role: "Personalized Narrative", desc: "Custom pedagogical observations and constructive encouragement." },
    { title: "Report Card", role: "Digital Document", desc: "Automated tamper-evident visual report card with grading scales." },
    { title: "Parent Portal", role: "Instant Visibility", desc: "Parents review milestone growth charts on web & mobile app instantly." },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#000a1f] pt-28 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <FeatureBreadcrumb currentPage="Performance & Rubrics" />

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-20">
          
          {/* Left Hero Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Holistic Assessment & Developmental Tracking</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000E28] dark:text-white tracking-tight leading-tight">
              Performance, Rubrics & Child Developmental Tracking
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Track cognitive, motor, and academic milestones with teacher grading, rubrics, and automated report cards. Built for GGPS School to offer multi-dimensional evaluations that celebrate every child’s individual learning pace.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-[0_8px_20px_rgba(168,85,247,0.35)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Assessment System</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/admissions"
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-[#001438] border border-slate-200 dark:border-slate-800 text-[#000E28] dark:text-white hover:border-purple-500 font-bold text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <span>Admissions & Curriculum</span>
              </Link>
            </div>

            {/* Assessment Pillars */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-slate-800">
              <div>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">6 Domains</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">LKG & UKG Rubrics</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#0050CB] dark:text-[#38BDF8]">100%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Automated Cards</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Continuous</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">CCE Aligned</p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-gradient-to-tr from-purple-100/80 via-white to-fuchsia-50 dark:from-[#1b0635] dark:to-[#00102E] rounded-[36px] p-6 sm:p-8 border border-purple-200/80 dark:border-purple-800/40 shadow-xl overflow-hidden">
              
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-[40px] pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      A+
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#000E28] dark:text-white">Academic Milestone Engine</p>
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Status: Evaluated & Verified</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                    Term 1 Active
                  </span>
                </div>

                {/* Simulated Student Snapshot */}
                <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                  <AppImage
                    src="/student-raising-hand.png"
                    alt="Performance & Rubrics Student"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover object-top"
                  />
                  
                  {/* Floating Micro Score Badges */}
                  <div className="absolute top-3 left-3 bg-white/95 dark:bg-[#000E28]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 shadow-md">
                    <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Language & Phonics</p>
                    <p className="text-xs font-black text-[#000E28] dark:text-white">Exceeding Expectations (98%)</p>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-[#000E28]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-md">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Social Milestone</p>
                    <p className="text-xs font-black text-[#000E28] dark:text-white">Active Peer Helper</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* 6 DEVELOPMENT DOMAINS FOR GGPS LKG / UKG */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Holistic Early Childhood Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight mt-1">
              6 Foundational Development Areas
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Our rubrics go far beyond rote memorization. We assess comprehensive cognitive, motor, creative, and socio-emotional milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developmentAreas.map((domain, idx) => {
              const Icon = domain.icon;
              return (
                <div
                  key={domain.id}
                  className="bg-white dark:bg-[#001233] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-2xl ${domain.bgLight} ${domain.textColor} flex items-center justify-center shrink-0 shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-[#000E28] dark:text-white leading-tight">
                        {domain.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal mb-5">
                      {domain.description}
                    </p>

                    {/* Criteria Evaluation Badges */}
                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                      {domain.criteria.map((crit, cIdx) => (
                        <div key={cIdx} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[190px]">
                            {crit.label}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shrink-0">
                            {crit.level.includes("Exceeding") ? "Exceeding" : crit.level.includes("Meeting") ? "Meeting" : "Developing"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* REALISTIC ASSESSMENT WORKFLOW VISUALIZATION */}
        <div className="bg-white dark:bg-[#00102E] rounded-[36px] p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-md mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Continuous Evaluation Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight mt-1">
              From Observation to Parent Report Card
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Follow how teacher observations seamlessly transform into structured performance data and instant parent visibility.
            </p>
          </div>

          {/* Workflow Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 relative">
            {workflowFlow.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#001438] border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between relative group hover:border-purple-400 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-extrabold text-[11px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {idx < workflowFlow.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 hidden lg:block -mr-2" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#000E28] dark:text-white leading-tight">
                    {step.title}
                  </h4>
                  <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                    {step.role}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* PREMIUM REPORT CARD PREVIEW SECTION */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Automated Output Showcase
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight mt-1">
              Sample GGPS Child Developmental Report Card
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Generated automatically from teacher rubric inputs. Professional, printable, and instantly accessible to parents.
            </p>
          </div>

          {/* Realistic Report Card Paper UI */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-[#001233] rounded-[32px] border-2 border-purple-200 dark:border-purple-900/60 p-6 sm:p-10 shadow-xl relative overflow-hidden">
            
            {/* Header of Report Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase">
                    Official Term Evaluation
                  </span>
                  <span className="text-xs text-slate-400">Academic Year 2026-27</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white tracking-tight mt-1">
                  GGPS School — Holistic Progress Report
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Class: UKG-A • Roll No: 14</span>
                <p className="text-sm font-black text-[#0050CB] dark:text-[#38BDF8]">Student: Aarav Sharma</p>
              </div>
            </div>

            {/* Rubric Evaluation Table */}
            <div className="my-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Developmental Domain</th>
                    <th className="py-2.5">Key Observable Milestone</th>
                    <th className="py-2.5 text-center">Score</th>
                    <th className="py-2.5 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                  <tr>
                    <td className="py-3 font-bold text-[#000E28] dark:text-white">Language & Phonics</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">Blends consonants and recites rhyming poetry</td>
                    <td className="py-3 text-center font-bold text-purple-600">4 / 4</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        Exceeding
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-[#000E28] dark:text-white">Numeracy & Spatial</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">Counts objects up to 50 & identifies 3D shapes</td>
                    <td className="py-3 text-center font-bold text-purple-600">4 / 4</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        Exceeding
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-[#000E28] dark:text-white">Motor Coordination</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">Steady pencil tripod grip & balance agility</td>
                    <td className="py-3 text-center font-bold text-purple-600">3 / 4</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                        Meeting
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-[#000E28] dark:text-white">Socio-Emotional</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">Collaborates eagerly and shares materials</td>
                    <td className="py-3 text-center font-bold text-purple-600">4 / 4</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        Exceeding
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Teacher Remarks Box */}
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
              <p className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-1">
                Class Teacher Remarks — Mrs. Ananya Roy:
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                “Aarav has shown outstanding enthusiasm in linguistic exploration and group storytelling. He demonstrates remarkable empathy toward his peers and consistently follows classroom routines with joy. We encourage continuing his bedtime reading habit at home.”
              </p>
            </div>

            {/* Footer with Sync Status */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified by GGPS Academic Head & Synced to Parent Portal</span>
              </div>
              <span>Digital Verification ID: #GGPS-REP-2026-0891</span>
            </div>

          </div>
        </div>

        {/* BOTTOM CTA BANNER */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-[#0050CB] text-white rounded-[32px] p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Elevate Child Assessment with GGPS School Rubrics
            </h3>
            <p className="text-purple-100 text-sm mt-2">
              Empower your educators with evidence-based developmental grading and give parents actionable insights into their child’s growth.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-2xl bg-white text-purple-800 hover:bg-purple-50 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Assessment System</span>
              <ArrowRight className="w-4 h-4 text-purple-700" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
