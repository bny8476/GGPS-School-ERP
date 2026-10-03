"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, Calendar, Target, Users, Plus, Search, Filter, ChevronDown, 
  ChevronRight, MoreVertical, CheckCircle2, Edit3, Rocket, FileText, 
  Download, Upload, Sparkles, X, LayoutGrid, List, Check, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CurriculumPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"All" | "My" | "Active" | "Draft" | "Archived">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any | null>(null);

  // New plan state
  const [planTitle, setPlanTitle] = useState("");
  const [planGrade, setPlanGrade] = useState("Pre-KG A");
  const [planSubject, setPlanSubject] = useState("Phonics & English");
  const [planDuration, setPlanDuration] = useState("Apr 2026 - Mar 2027");

  useEffect(() => {
    // Initial sample curriculum plans for Kindergarten cohorts
    setPlans([
      {
        id: "1",
        title: "Phonics & Early Literacy Curriculum",
        subTitle: "Pre-KG - Annual Plan",
        class: "Pre-KG A",
        subject: "Phonics & English",
        duration: "Apr 2026 - Mar 2027",
        status: "Active",
        progress: 75,
        color: "bg-[#0050CB]",
        icon: "🔤",
      },
      {
        id: "2",
        title: "Early Numeracy & Math Play",
        subTitle: "LKG - Semester Plan",
        class: "LKG B",
        subject: "Early Numeracy & Math",
        duration: "Apr 2026 - Sep 2026",
        status: "Active",
        progress: 60,
        color: "bg-purple-600",
        icon: "🔢",
      },
      {
        id: "3",
        title: "General Awareness & Nature Discovery",
        subTitle: "UKG - Annual Plan",
        class: "UKG A",
        subject: "General Awareness (EVS)",
        duration: "Apr 2026 - Mar 2027",
        status: "Draft",
        progress: 30,
        color: "bg-amber-500",
        icon: "🌱",
      },
      {
        id: "4",
        title: "Rhymes, Songs & Storytelling Expressions",
        subTitle: "LKG - Semester Plan",
        class: "LKG A",
        subject: "Rhymes & Storytelling",
        duration: "Apr 2026 - Sep 2026",
        status: "Active",
        progress: 85,
        color: "bg-emerald-600",
        icon: "🎶",
      },
      {
        id: "5",
        title: "Sensory & Fine Motor Skills",
        subTitle: "Pre-KG - Annual Plan",
        class: "Pre-KG B",
        subject: "Sensory & Motor Skills",
        duration: "Apr 2026 - Mar 2027",
        status: "Archived",
        progress: 100,
        color: "bg-rose-500",
        icon: "🎨",
      },
    ]);
  }, []);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) return;

    const newPlan = {
      id: String(Date.now()),
      title: planTitle,
      subTitle: `${planGrade} - Custom Plan`,
      class: planGrade,
      subject: planSubject,
      duration: planDuration,
      status: "Active",
      progress: 0,
      color: "bg-[#0050CB]",
      icon: "📚",
    };

    setPlans([newPlan, ...plans]);
    toast.success("New curriculum plan created!");
    setPlanTitle("");
    setShowCreateModal(false);
  };

  const [currentPage, setCurrentPage] = useState(1);

  const filteredPlans = plans.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.class.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || 
                       (activeTab === "My" && true) ||
                       (activeTab === "Active" && p.status === "Active") ||
                       (activeTab === "Draft" && p.status === "Draft") ||
                       (activeTab === "Archived" && p.status === "Archived");
    const matchesClassFilter = selectedClass === "All Classes" || p.class === selectedClass;
    const matchesSubjectFilter = selectedSubject === "All Subjects" || p.subject === selectedSubject;
    const matchesStatusFilter = selectedStatus === "All Status" || p.status === selectedStatus;
    
    return matchesSearch && matchesTab && matchesClassFilter && matchesSubjectFilter && matchesStatusFilter;
  });

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPlans = filteredPlans.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6 font-sans text-[#000E28] dark:text-white pb-16">
      
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
        <Link href="/dashboard" className="hover:text-[#0050CB]">Home</Link>
        <span>&gt;</span>
        <span className="text-[#0050CB] dark:text-[#38BDF8] font-bold">Curriculum & Syllabus</span>
      </div>

      {/* HERO BANNER SECTION */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#EBF3FF] via-[#F4F8FF] to-[#E5F0FF] dark:from-[#001A48] dark:via-[#001438] dark:to-[#002766] p-6 sm:p-8 border border-blue-100 dark:border-slate-800 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#000E28] dark:text-white tracking-tight">
              Curriculum Planner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-medium leading-relaxed">
              Plan, manage and track your curriculum, subjects, and learning outcomes for better academic success.
            </p>
          </div>

          {/* Right 3D Graduation & Books Graphic Container */}
          <div className="hidden lg:flex items-center justify-center relative shrink-0">
            <div className="w-56 h-36 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white dark:border-slate-700 shadow-sm p-4 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#0050CB] text-white flex items-center justify-center text-xl">
                  🎓
                </div>
                <div>
                  <p className="text-xs font-black text-[#000E28] dark:text-white">Academic Excellence</p>
                  <p className="text-[10px] text-[#0050CB] dark:text-[#38BDF8] font-bold">Syllabus 2025-26</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex justify-between items-center text-[10px] font-bold text-slate-500">
                <span>45 Subjects</span>
                <span className="text-emerald-600">98% Completion</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 STAT METRIC CARDS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-blue-200/50 dark:border-slate-800">
          
          {/* Card 1: Total Subjects */}
          <div className="bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-[#000E28] dark:text-white leading-none">45</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Total Subjects</p>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">↑ 12% vs last term</span>
            </div>
          </div>

          {/* Card 2: Academic Plans */}
          <div className="bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-[#000E28] dark:text-white leading-none">12</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Academic Plans</p>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">↑ 8% vs last term</span>
            </div>
          </div>

          {/* Card 3: Completion Rate */}
          <div className="bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-[#000E28] dark:text-white leading-none">98%</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Completion Rate</p>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">↑ 6% vs last term</span>
            </div>
          </div>

          {/* Card 4: Active Classes */}
          <div className="bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-[#000E28] dark:text-white leading-none">24</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Active Classes</p>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">↑ 5% vs last term</span>
            </div>
          </div>

        </div>

      </div>

      {/* TAB FILTERS & CREATE PLAN ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["All", "My", "Active", "Draft", "Archived"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === tab
                  ? "bg-[#0050CB] text-white shadow-xs"
                  : "bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              {tab === "All" && "⊞ All Plans"}
              {tab === "My" && "👤 My Plans"}
              {tab === "Active" && "🟢 Active"}
              {tab === "Draft" && "⚪ Draft"}
              {tab === "Archived" && "🗃️ Archived"}
            </button>
          ))}
        </div>

        {/* Right Create Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold shadow-md cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Plan</span>
        </button>

      </div>

      {/* SEARCH & FILTERS ROW */}
      <div className="bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by plan name, subject, class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0050CB]"
          />
        </div>

        {/* Class Filter */}
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shrink-0"
        >
          <option value="All Classes">All Classes</option>
          <option value="Pre-KG A">Pre-KG A</option>
          <option value="Pre-KG B">Pre-KG B</option>
          <option value="LKG A">LKG A</option>
          <option value="LKG B">LKG B</option>
          <option value="UKG A">UKG A</option>
          <option value="UKG B">UKG B</option>
        </select>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shrink-0"
        >
          <option value="All Subjects">All Subjects</option>
          <option value="Phonics & English">Phonics & English</option>
          <option value="Early Numeracy & Math">Early Numeracy & Math</option>
          <option value="General Awareness (EVS)">General Awareness (EVS)</option>
          <option value="Rhymes & Storytelling">Rhymes & Storytelling</option>
          <option value="Art & Craft">Art & Craft</option>
          <option value="Sensory & Motor Skills">Sensory & Motor Skills</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shrink-0"
        >
          <option value="All Status">All Status</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </select>

        {/* View Mode Toggle Icons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-white dark:bg-slate-700 text-[#0050CB] shadow-xs" : "text-slate-400"}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-[#0050CB] shadow-xs" : "text-slate-400"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* MAIN TWO-COLUMN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CURRICULUM TABLE (COL-8) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="p-4 w-10 text-center">#</th>
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 w-32">Progress</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedPlans.map((plan, idx) => (
                  <tr key={plan.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 text-center font-bold text-slate-400">{startIndex + idx + 1}</td>
                    
                    {/* Plan Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${plan.color} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}>
                          {plan.icon}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#000E28] dark:text-white leading-tight">{plan.title}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{plan.subTitle}</p>
                        </div>
                      </div>
                    </td>

                    {/* Class Pill */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] text-[10px] font-extrabold">
                        {plan.class}
                      </span>
                    </td>

                    {/* Subject Pill */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {plan.subject}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="p-4 font-semibold text-slate-500 dark:text-slate-400 text-[11px]">{plan.duration}</td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {plan.status === "Active" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold">
                          Active
                        </span>
                      )}
                      {plan.status === "Draft" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-extrabold">
                          • Draft
                        </span>
                      )}
                      {plan.status === "Archived" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-extrabold">
                          Archived
                        </span>
                      )}
                    </td>

                    {/* Progress Bar */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-1">
                          <div
                            className="h-full bg-[#0050CB] rounded-full transition-all"
                            style={{ width: `${plan.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 shrink-0">{plan.progress}%</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSelectedPlanDetails(plan)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER & PAGINATION */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
            <span>Showing {filteredPlans.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, filteredPlans.length)} of {filteredPlans.length} plans</span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-[#0050CB] text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS + RECENT ACTIVITY + QUOTE BANNER (COL-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* QUICK ACTIONS PANEL */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
              <h3 className="text-sm font-black text-[#000E28] dark:text-white">Quick Actions</h3>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0050CB] text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>Create New Plan</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0050CB]" />
              </button>

              <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span>Add Subject</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
              </button>

              <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span>Manage Syllabus</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button 
                onClick={() => toast.success("Opening curriculum import dialog...")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span>Import Curriculum</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
              </button>

              <button 
                onClick={() => toast.success("Exporting curriculum reports...")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <span>Export Reports</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500" />
              </button>
            </div>
          </div>

          {/* RECENT ACTIVITY PANEL */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-[#000E28] dark:text-white">Recent Activity</h3>
              <Link href="/dashboard/audit-logs" className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-0.5 cursor-pointer">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#000E28] dark:text-white">New curriculum plan created</p>
                  <p className="text-[10px] font-semibold text-slate-500">Phonics & Literacy - Pre-KG</p>
                  <p className="text-[9px] text-slate-400">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#000E28] dark:text-white">Syllabus updated</p>
                  <p className="text-[10px] font-semibold text-slate-500">Early Numeracy - LKG</p>
                  <p className="text-[9px] text-slate-400">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0050CB] flex items-center justify-center shrink-0 mt-0.5">
                  <Rocket className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#000E28] dark:text-white">Plan activated</p>
                  <p className="text-[10px] font-semibold text-slate-500">General Awareness - UKG</p>
                  <p className="text-[9px] text-slate-400">6 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#000E28] dark:text-white">New subject added</p>
                  <p className="text-[10px] font-semibold text-slate-500">Sensory & Motor Skills</p>
                  <p className="text-[9px] text-slate-400">1 day ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* INSPIRING QUOTE BANNER CARD */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EEF2FF] via-[#F3E8FF] to-[#E0E7FF] dark:from-[#1E1B4B] dark:via-[#2E1065] dark:to-[#3B0764] p-5 border border-purple-200/60 dark:border-purple-900/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1 max-w-[180px]">
              <p className="text-xs font-bold text-[#000E28] dark:text-white leading-relaxed italic">
                “Every lesson is a step towards a bigger dream.”
              </p>
              <p className="text-[10px] font-extrabold text-[#0050CB] dark:text-[#38BDF8]">
                Plan • Teach • Succeed
              </p>
            </div>

            <div className="w-14 h-14 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-3xl shadow-sm shrink-0">
              🎓
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
        <div>
          <span className="font-black text-[#000E28] dark:text-white">GGPS School ERP</span> &copy; 2026. All rights reserved.
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Portal Active
          </span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Support</span>
          <span>|</span>
          <span className="hover:underline cursor-pointer">Help</span>
        </div>
      </footer>

      {/* CREATE PLAN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-[#000E28] dark:text-white">Create Curriculum Plan</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Plan Title *</label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="e.g. Advanced Mathematics Annual Plan"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#0050CB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Class</label>
                  <select
                    value={planGrade}
                    onChange={(e) => setPlanGrade(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  >
                    <option value="Pre-KG A">Pre-KG A</option>
                    <option value="Pre-KG B">Pre-KG B</option>
                    <option value="LKG A">LKG A</option>
                    <option value="LKG B">LKG B</option>
                    <option value="UKG A">UKG A</option>
                    <option value="UKG B">UKG B</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Subject</label>
                  <select
                    value={planSubject}
                    onChange={(e) => setPlanSubject(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  >
                    <option value="Phonics & English">Phonics & English</option>
                    <option value="Early Numeracy & Math">Early Numeracy & Math</option>
                    <option value="General Awareness (EVS)">General Awareness (EVS)</option>
                    <option value="Rhymes & Storytelling">Rhymes & Storytelling</option>
                    <option value="Art & Craft">Art & Craft</option>
                    <option value="Sensory & Motor Skills">Sensory & Motor Skills</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Duration Range</label>
                <input
                  type="text"
                  value={planDuration}
                  onChange={(e) => setPlanDuration(e.target.value)}
                  placeholder="e.g. Apr 2025 - Mar 2026"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0050CB] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Publish Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLAN DETAILS MODAL */}
      {selectedPlanDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E5EEFF] text-[#0050CB] text-[10px] font-black uppercase">
                {selectedPlanDetails.class}
              </span>
              <button onClick={() => setSelectedPlanDetails(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-[#000E28] dark:text-white leading-tight">
                {selectedPlanDetails.title}
              </h3>
              <p className="text-xs font-bold text-slate-500">{selectedPlanDetails.subTitle}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
                Subject: <strong>{selectedPlanDetails.subject}</strong> • Duration: {selectedPlanDetails.duration}
              </p>
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-500 mb-1">Completion Progress: {selectedPlanDetails.progress}%</p>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-[#0050CB] rounded-full" style={{ width: `${selectedPlanDetails.progress}%` }} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedPlanDetails(null)}
                className="px-4 py-2 bg-[#0050CB] text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
