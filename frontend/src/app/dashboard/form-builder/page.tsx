"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, Plus, Eye, CheckCircle2, Layers, Sparkles,
  Users, GraduationCap, Calendar, BookOpen, ChevronRight,
  Clock, ArrowRight, MessageSquare, Check, X, Search, Send,
  TrendingUp, Edit3, Award, AlertCircle, FilePlus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/apiClient";

let formIdCounter = 100;
const getFormId = () => ++formIdCounter;

export default function FormBuilderPage() {
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [previewForm, setPreviewForm] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"builder" | "surveys" | "submissions">("builder");

  // New form form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Admission");
  const [description, setDescription] = useState("");

  const [aiPrompt, setAiPrompt] = useState("");

  const setDefaultForms = () => {
    setForms([
      {
        _id: "FB-101",
        title: "2025-26 International Student Admission Form",
        category: "Admission",
        fieldsCount: 14,
        submissionsCount: 342,
        isPublished: true,
        updatedAt: "2 hours ago",
      },
      {
        _id: "FB-102",
        title: "Q3 Parent Satisfaction & Feedback Survey",
        category: "Survey",
        fieldsCount: 8,
        submissionsCount: 189,
        isPublished: true,
        updatedAt: "1 day ago",
      },
      {
        _id: "FB-103",
        title: "Staff Hardware & IT Service Requisition",
        category: "InternalRequest",
        fieldsCount: 6,
        submissionsCount: 45,
        isPublished: true,
        updatedAt: "3 days ago",
      },
    ]);
  };

  const fetchForms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await authFetch("/api/enterprise/forms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.forms && data.forms.length > 0) {
          setForms(data.forms);
        } else {
          setDefaultForms();
        }
      } else {
        setDefaultForms();
      }
    } catch (e) {
      console.error(e);
      setDefaultForms();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newFormObj = {
      _id: `FB-${getFormId()}`,
      title,
      category,
      description: description || "Custom interactive school ERP form template",
      fieldsCount: 5,
      submissionsCount: 0,
      isPublished: true,
      updatedAt: "Just now",
      fields: [
        { id: "f1", label: "Full Name", type: "text", required: true },
        { id: "f2", label: "Email Address", type: "email", required: true },
        { id: "f3", label: "Student Grade / Class", type: "select", options: ["Pre-KG A", "LKG A", "UKG A"] },
        { id: "f4", label: "Feedback / Application Details", type: "textarea", required: true },
      ],
    };

    setForms([newFormObj, ...forms]);
    setTitle("");
    setDescription("");
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-24 font-sans text-[#000E28] dark:text-white">
      
      {/* ========================================================
          1. HERO WORKSPACE BANNER ("Welcome Back, Mrs. Sarah Johnson")
      ======================================================== */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#D9ECFF] via-[#EAF3FF] to-[#D5E8FF] dark:from-[#001E50] dark:via-[#001438] dark:to-[#002B70] p-6 sm:p-8 border border-blue-200/60 dark:border-blue-900/40 shadow-xs">
        
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 bg-[radial-[#0050CB]/10_1px,transparent_1px] [background-size:16px_16px] pointer-events-none opacity-40" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            
            {/* Blue Pill Badge: Teacher Workspace */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0050CB]/10 dark:bg-[#38BDF8]/20 border border-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold">
              <GraduationCap className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
              <span>Teacher Workspace</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#000E28] dark:text-white">
              Welcome Back, Mrs. Sarah Johnson 👏
            </h1>

            <p className="text-[#0050CB] dark:text-blue-300 font-extrabold text-sm tracking-wide">
              Create. Teach. Inspire. Make a difference every day.
            </p>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Access your classes, manage your students, track progress, and stay connected with your school community — all in one place.
            </p>

          </div>

          {/* Right Illustration Graphics Card */}
          <div className="hidden lg:flex items-center justify-center relative shrink-0">
            <div className="w-56 h-36 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white dark:border-slate-700 shadow-md p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0050CB] text-white flex items-center justify-center font-bold text-xs">
                  📚
                </div>
                <div>
                  <p className="text-[11px] font-black text-[#000E28] dark:text-white leading-tight">Teach Inspire</p>
                  <p className="text-[10px] font-bold text-[#0050CB] dark:text-[#38BDF8]">Transform</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[10px] font-bold text-slate-500">
                <span>Classroom 10-A</span>
                <span className="text-emerald-600 dark:text-emerald-400">Live Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 STAT METRIC CARDS (OVERLAPPING BANNER BOTTOM) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4">
          
          {/* Card 1: My Classes */}
          <div className="bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between group hover:border-[#0050CB] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-black text-[#000E28] dark:text-white leading-tight">6</p>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">My Classes</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0050CB] group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Card 2: Total Students */}
          <div className="bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between group hover:border-emerald-500 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-black text-[#000E28] dark:text-white leading-tight">156</p>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Students</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Card 3: Upcoming Classes */}
          <div className="bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between group hover:border-amber-500 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-black text-[#000E28] dark:text-white leading-tight">12</p>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Upcoming Classes</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Card 4: Pending Assignments */}
          <div className="bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between group hover:border-rose-500 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-black text-[#000E28] dark:text-white leading-tight">8</p>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Pending Assignments</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
          </div>

        </div>
      </div>

      {/* ========================================================
          2. MAIN GRID (LEFT: FORM BUILDER + CLASSES TODAY | RIGHT: QUICK ACTIONS + OVERVIEW + QUOTE + RECENT ACTIVITY)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (COL-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* FORM BUILDER & SURVEYS INTERACTIVE WORKSPACE */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[#0050CB] dark:text-[#38BDF8] font-bold text-xs uppercase tracking-wider mb-1">
                  <FileText className="h-4 w-4" />
                  <span>Enterprise Form Builder & Surveys</span>
                </div>
                <h2 className="text-xl font-black text-[#000E28] dark:text-white">
                  Active Web Forms & Surveys Engine
                </h2>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0050CB] text-white hover:bg-[#003da3] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Form</span>
              </button>
            </div>

            {/* Form Builder Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {forms.map((f) => (
                <div
                  key={f._id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-3 hover:border-[#0050CB] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] text-[10px] font-black uppercase">
                        {f.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                        Published
                      </span>
                    </div>

                    <h3 className="text-xs font-black text-[#000E28] dark:text-white leading-snug line-clamp-2">
                      {f.title}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                      <span>{f.fieldsCount || 8} Fields</span>
                      <span className="font-bold text-[#000E28] dark:text-white">{f.submissionsCount} Submissions</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button 
                        onClick={() => setPreviewForm(f)}
                        className="text-[#0050CB] dark:text-[#38BDF8] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview Form</span>
                      </button>
                      <span className="text-slate-400 font-semibold">{f.updatedAt || 'Recent'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MY CLASSES TODAY PANEL */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0050CB] dark:text-[#38BDF8]" />
                <h3 className="text-base font-black text-[#000E28] dark:text-white">
                  My Classes Today
                </h3>
              </div>
              <Link href="/dashboard/classes" className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline cursor-pointer">
                View All
              </Link>
            </div>

            {/* Class Items */}
            <div className="space-y-3">
              
              {/* Slot 1 */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0050CB] text-white flex items-center justify-center font-black text-sm shadow-xs">
                    🔤
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#000E28] dark:text-white">Phonics & Early Literacy</h4>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pre-KG A • Room 101</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>08:00 AM - 08:45 AM</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                    Completed
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Slot 2 */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    🔢
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#000E28] dark:text-white">Early Numeracy & Math</h4>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">LKG - A • Room 102</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>09:00 AM - 09:45 AM</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#0050CB] dark:text-[#38BDF8] text-[11px] font-bold">
                    Ongoing
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Slot 3 */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    📖
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#000E28] dark:text-white">Rhymes & Storytelling</h4>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">UKG - A • Room 105</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>10:00 AM - 10:45 AM</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                    Upcoming
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Slot 4 */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    🌱
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#000E28] dark:text-white">General Awareness (EVS)</h4>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">LKG - B • Room 106</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>11:00 AM - 11:45 AM</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                    Upcoming
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Slot 5 */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    🎨
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#000E28] dark:text-white">Sensory & Motor Play</h4>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pre-KG - B • Activity Arena</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>12:00 PM - 12:45 PM</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                    Upcoming
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (COL-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* QUICK ACTIONS PANEL */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
              <h3 className="text-sm font-black text-[#000E28] dark:text-white">⚡ Quick Actions</h3>
            </div>

            <div className="space-y-2">
              <Link
                href="/dashboard/lesson-planner"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0050CB] text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span>Create Lesson Plan</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0050CB]" />
              </Link>

              <Link
                href="/dashboard/attendance"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Take Attendance</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </Link>

              <Link
                href="/dashboard/curriculum"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span>Add Homework</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500" />
              </Link>

              <Link
                href="/dashboard/calendar"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span>View Class Routine</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
              </Link>

              <Link
                href="/dashboard/chat"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span>Send Message</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
              </Link>
            </div>
          </div>

          {/* TODAY'S OVERVIEW PANEL */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-[#000E28] dark:text-white">Today's Overview</h3>
              <span className="text-[11px] font-semibold text-slate-400">Tue, 22 Apr 2025</span>
            </div>

            {/* Circular gauge */}
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#0050CB] dark:text-[#38BDF8]"
                    strokeDasharray="60, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-[#000E28] dark:text-white leading-none">
                    3/5
                  </span>
                </div>
              </div>
              <p className="text-xs font-black text-[#000E28] dark:text-white">Classes Completed</p>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">↑ 20% from yesterday</p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                <span className="font-semibold text-slate-600 dark:text-slate-300">2 Assignments Due</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                <span className="font-semibold text-slate-600 dark:text-slate-300">1 Meetings</span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                <span className="font-semibold text-slate-600 dark:text-slate-300">0 Today's Leaves</span>
                <span className="w-2 h-2 rounded-full bg-purple-500" />
              </div>
            </div>
          </div>

          {/* QUOTE CARD */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E0E7FF] via-[#EEF2FF] to-[#DDD6FE] dark:from-[#1E1B4B] dark:via-[#2E1065] dark:to-[#3B0764] p-5 border border-purple-200/60 dark:border-purple-900/40 shadow-xs">
            <span className="text-3xl font-serif text-[#0050CB] dark:text-purple-300 font-bold block mb-1">“</span>
            <p className="text-xs font-bold text-[#000E28] dark:text-white leading-relaxed italic">
              "Education is not the filling of a pail, but the lighting of a fire."
            </p>
            <p className="text-[11px] font-extrabold text-[#0050CB] dark:text-[#38BDF8] mt-3">
              — W.B. Yeats
            </p>
          </div>

          {/* RECENT ACTIVITY PANEL */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-[#000E28] dark:text-white">Recent Activity</h3>
              <Link href="/dashboard/audit-logs" className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline cursor-pointer">View All</Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#000E28] dark:text-white">Attendance marked for Pre-KG A</p>
                  <p className="text-[10px] text-slate-400">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#000E28] dark:text-white">Activity worksheet assigned for LKG B</p>
                  <p className="text-[10px] text-slate-400">3 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0050CB] flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#000E28] dark:text-white">New message from Admin</p>
                  <p className="text-[10px] text-slate-400">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#000E28] dark:text-white">Lesson plan updated</p>
                  <p className="text-[10px] text-slate-400">5 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#000E28] dark:text-white">Student performance report viewed</p>
                  <p className="text-[10px] text-slate-400">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================
          3. BOTTOM AI ASSISTANT STICKY/FLOATING BANNER
      ======================================================== */}
      <div className="fixed bottom-4 left-4 right-4 md:left-72 md:right-8 z-40">
        <div className="rounded-2xl bg-gradient-to-r from-[#000E28] via-[#002772] to-[#0050CB] p-4 text-white shadow-2xl border border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#38BDF8] shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                Global AI Assistant
              </h4>
              <p className="text-xs text-blue-100/80">Ask questions, get insights, and manage your work faster with AI.</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = aiPrompt.trim();
              if (q) {
                router.push(`/dashboard/ai-assistant?q=${encodeURIComponent(q)}`);
              }
            }}
            className="flex-1 max-w-xl w-full flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2"
          >
            <Search className="w-4 h-4 text-blue-200 shrink-0" />
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask anything about your classes, students, or school..."
              className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-blue-200/70"
            />
            <button
              type="submit"
              className="w-7 h-7 rounded-full bg-[#0050CB] hover:bg-blue-600 flex items-center justify-center text-white shrink-0 cursor-pointer transition-colors"
              title="Submit Query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <span className="hidden xl:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-[#38BDF8] border border-white/10">
            Powered by AI ✦
          </span>
        </div>
      </div>

      {/* CREATE FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-[#000E28] dark:text-white">Create New Form Template</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Form Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Science Fair Registration Form"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-[#0050CB]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-[#0050CB]"
                >
                  <option value="Admission">Admission Application</option>
                  <option value="Survey">Feedback / Survey</option>
                  <option value="Application">Scholarship Application</option>
                  <option value="InternalRequest">Internal Service Request</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Form guidelines or instructions..."
                  rows={3}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-[#0050CB]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0050CB] text-white hover:bg-[#003da3] text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW FORM MODAL */}
      {previewForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-lg p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-[#E5EEFF] text-[#0050CB] text-[10px] font-black uppercase">
                  {previewForm.category}
                </span>
                <h3 className="text-base font-black text-[#000E28] dark:text-white mt-1">
                  {previewForm.title}
                </h3>
              </div>
              <button onClick={() => setPreviewForm(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                <input type="text" placeholder="Enter student / parent name" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" disabled />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                <input type="email" placeholder="example@school.com" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" disabled />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Feedback / Notes</label>
                <textarea rows={3} placeholder="Form content preview..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" disabled />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setPreviewForm(null)}
                className="px-4 py-2 bg-[#0050CB] text-white text-xs font-bold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
