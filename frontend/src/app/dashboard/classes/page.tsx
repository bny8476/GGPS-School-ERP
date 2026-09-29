"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Users,
  Layers,
  Search,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  MoreVertical,
  UserCheck,
  Check,
  X,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Trash2,
  Edit2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface SectionBadge {
  name: string;
  bg: string;
  color: string;
  border: string;
}

interface ClassItem {
  id: string;
  name: string;
  subtitle: string;
  avatarText: string;
  avatarBg: string;
  sectionsCount: number;
  studentsCount: number;
  classTeacher: string;
  status: "Active" | "Inactive";
  sections: SectionBadge[];
}

const INITIAL_CLASSES: ClassItem[] = [
  {
    id: "cls-prekg",
    name: "PreKG",
    subtitle: "Pre Kindergarten",
    avatarText: "P",
    avatarBg: "bg-[#8B5CF6]",
    sectionsCount: 3,
    studentsCount: 42,
    classTeacher: "Ms. Priya Sharma",
    status: "Active",
    sections: [
      { name: "A", bg: "bg-[#EFF6FF]", color: "text-[#0050CB]", border: "border-blue-200/60" },
      { name: "B", bg: "bg-[#FAF5FF]", color: "text-[#7C3AED]", border: "border-purple-200/60" },
      { name: "C", bg: "bg-[#FFF1F2]", color: "text-[#E11D48]", border: "border-pink-200/60" },
    ],
  },
  {
    id: "cls-lkg",
    name: "LKG",
    subtitle: "Lower Kindergarten",
    avatarText: "L",
    avatarBg: "bg-[#3B82F6]",
    sectionsCount: 3,
    studentsCount: 56,
    classTeacher: "Ms. Neha Patel",
    status: "Active",
    sections: [
      { name: "A", bg: "bg-[#EFF6FF]", color: "text-[#0050CB]", border: "border-blue-200/60" },
      { name: "B", bg: "bg-[#FAF5FF]", color: "text-[#7C3AED]", border: "border-purple-200/60" },
      { name: "C", bg: "bg-[#FFF1F2]", color: "text-[#E11D48]", border: "border-pink-200/60" },
    ],
  },
  {
    id: "cls-ukg",
    name: "UKG",
    subtitle: "Upper Kindergarten",
    avatarText: "U",
    avatarBg: "bg-[#8B5CF6]",
    sectionsCount: 3,
    studentsCount: 54,
    classTeacher: "Ms. Ritu Singh",
    status: "Active",
    sections: [
      { name: "A", bg: "bg-[#EFF6FF]", color: "text-[#0050CB]", border: "border-blue-200/60" },
      { name: "B", bg: "bg-[#FAF5FF]", color: "text-[#7C3AED]", border: "border-purple-200/60" },
      { name: "C", bg: "bg-[#FFF1F2]", color: "text-[#E11D48]", border: "border-pink-200/60" },
    ],
  },
];

export default function ClassesPage() {
  const [classesList, setClassesList] = useState<ClassItem[]>(INITIAL_CLASSES);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"Active" | "All" | "Inactive">("Active");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Dropdown states
  const [showGradeMenu, setShowGradeMenu] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [activeMenuClassId, setActiveMenuClassId] = useState<string | null>(null);

  // Modals
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [selectedClassForSections, setSelectedClassForSections] = useState<ClassItem | null>(null);
  const [newSectionLetter, setNewSectionLetter] = useState("");

  // Add Class Form State
  const [newClassName, setNewClassName] = useState("");
  const [newClassSubtitle, setNewClassSubtitle] = useState("");
  const [newClassTeacher, setNewClassTeacher] = useState("");
  const [newClassBadgeColor, setNewClassBadgeColor] = useState("bg-[#3B82F6]");

  // Dynamic Metrics
  const totalClasses = classesList.length;
  const totalSections = classesList.reduce((acc, c) => acc + c.sectionsCount, 0);
  const totalStudents = classesList.reduce((acc, c) => acc + c.studentsCount, 0);
  const activeClasses = classesList.filter((c) => c.status === "Active").length;

  // Filtered List
  const filteredClasses = useMemo(() => {
    return classesList.filter((cls) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        cls.name.toLowerCase().includes(q) ||
        cls.subtitle.toLowerCase().includes(q) ||
        cls.classTeacher.toLowerCase().includes(q) ||
        cls.sections.some((s) => s.name.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "All" ? true : cls.status === statusFilter;

      const matchesGrade =
        gradeFilter === "All"
          ? true
          : cls.name === gradeFilter;

      const matchesSection =
        sectionFilter === "All"
          ? true
          : cls.sections.some((s) => s.name === sectionFilter);

      return matchesSearch && matchesStatus && matchesGrade && matchesSection;
    });
  }, [classesList, searchQuery, statusFilter, gradeFilter, sectionFilter]);

  // Handle Add Class
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      toast.error("Please enter a class name");
      return;
    }

    const created: ClassItem = {
      id: `cls-${Date.now()}`,
      name: newClassName.trim(),
      subtitle: newClassSubtitle.trim() || `${newClassName.trim()} Standard`,
      avatarText: newClassName.trim().slice(0, 1).toUpperCase(),
      avatarBg: newClassBadgeColor,
      sectionsCount: 3,
      studentsCount: 30,
      classTeacher: newClassTeacher.trim() || "Unassigned",
      status: "Active",
      sections: [
        { name: "A", bg: "bg-[#EFF6FF]", color: "text-[#0050CB]", border: "border-blue-200/60" },
        { name: "B", bg: "bg-[#FAF5FF]", color: "text-[#7C3AED]", border: "border-purple-200/60" },
        { name: "C", bg: "bg-[#FFF1F2]", color: "text-[#E11D48]", border: "border-pink-200/60" },
      ],
    };

    setClassesList((prev) => [...prev, created]);
    toast.success(`Class ${created.name} added successfully!`);
    setShowAddClassModal(false);
    setNewClassName("");
    setNewClassSubtitle("");
    setNewClassTeacher("");
  };

  // Handle Add Section to specific class
  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForSections || !newSectionLetter.trim()) return;

    const letter = newSectionLetter.trim().toUpperCase();
    if (selectedClassForSections.sections.some((s) => s.name === letter)) {
      toast.error(`Section ${letter} already exists for ${selectedClassForSections.name}`);
      return;
    }

    const updatedSections = [
      ...selectedClassForSections.sections,
      {
        name: letter,
        bg: "bg-[#F0FDF4]",
        color: "text-[#059669]",
        border: "border-emerald-200/60",
      },
    ];

    const updatedClass: ClassItem = {
      ...selectedClassForSections,
      sections: updatedSections,
      sectionsCount: updatedSections.length,
    };

    setClassesList((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    );
    setSelectedClassForSections(updatedClass);
    setNewSectionLetter("");
    toast.success(`Section ${letter} added to ${updatedClass.name}!`);
  };

  // Remove section
  const handleRemoveSection = (sectionName: string) => {
    if (!selectedClassForSections) return;
    if (selectedClassForSections.sections.length <= 1) {
      toast.error("A class must have at least one section");
      return;
    }

    const updatedSections = selectedClassForSections.sections.filter(
      (s) => s.name !== sectionName
    );

    const updatedClass: ClassItem = {
      ...selectedClassForSections,
      sections: updatedSections,
      sectionsCount: updatedSections.length,
    };

    setClassesList((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    );
    setSelectedClassForSections(updatedClass);
    toast.success(`Section ${sectionName} removed from ${updatedClass.name}`);
  };

  return (
    <div className="space-y-6 font-sans pb-10 max-w-[1600px] mx-auto">
      {/* ========================================================
          1. HEADER ROW: Classes & Sections + Add Class Button
      ======================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center shrink-0 shadow-2xs">
            <BookOpen className="w-6 h-6 text-[#0050CB] dark:text-[#38BDF8]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#000E28] dark:text-white tracking-tight">
              Classes &amp; Sections
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Manage all class grades and their sections
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddClassModal(true)}
          className="bg-[#0050CB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer hover:shadow-md hover:scale-102"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Class</span>
        </button>
      </div>

      {/* ========================================================
          2. TOP METRIC CARDS (4 Cards in a Row)
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Classes */}
        <div className="rounded-2xl bg-white dark:bg-[#000E28] border border-blue-100/80 dark:border-slate-800 p-5 shadow-2xs flex items-center gap-4 hover:shadow-sm transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/80 text-[#0050CB] flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-5 h-5 text-[#0050CB]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">
              Total Classes
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {totalClasses}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <span>↑</span> 0% from last term
            </span>
          </div>
        </div>

        {/* Card 2: Total Sections */}
        <div className="rounded-2xl bg-white dark:bg-[#000E28] border border-emerald-100/80 dark:border-slate-800 p-5 shadow-2xs flex items-center gap-4 hover:shadow-sm transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/80 text-[#059669] flex items-center justify-center shrink-0 shadow-2xs">
            <Layers className="w-5 h-5 text-[#059669]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">
              Total Sections
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {totalSections}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <span>↑</span> 7% from last term
            </span>
          </div>
        </div>

        {/* Card 3: Total Students */}
        <div className="rounded-2xl bg-white dark:bg-[#000E28] border border-amber-100/80 dark:border-slate-800 p-5 shadow-2xs flex items-center gap-4 hover:shadow-sm transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] dark:bg-amber-950/80 text-[#EA580C] flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-5 h-5 text-[#EA580C]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">
              Total Students
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {totalStudents}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <span>↑</span> 12% from last term
            </span>
          </div>
        </div>

        {/* Card 4: Active Classes */}
        <div className="rounded-2xl bg-white dark:bg-[#000E28] border border-rose-100/80 dark:border-slate-800 p-5 shadow-2xs flex items-center gap-4 hover:shadow-sm transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] dark:bg-rose-950/80 text-[#E11D48] flex items-center justify-center shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5 text-[#E11D48]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">
              Active Classes
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {activeClasses}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <span>↑</span> 0% from last term
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. SEARCH, FILTERS & VIEW TOGGLE BAR
      ======================================================== */}
      <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classes or sections..."
            className="w-full pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-transparent rounded-xl focus:outline-hidden focus:bg-slate-50/70 dark:focus:bg-slate-900 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls: Filter Dropdowns & Grid/List Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Dropdown 1: All Grades */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowGradeMenu(!showGradeMenu);
                setShowSectionMenu(false);
                setShowStatusMenu(false);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              <span>{gradeFilter === "All" ? "All Grades" : gradeFilter}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showGradeMenu && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in duration-100">
                {["All", "PreKG", "LKG", "UKG"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGradeFilter(g);
                      setShowGradeMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      gradeFilter === g ? "text-[#0050CB] font-bold" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {g === "All" ? "All Grades" : g}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown 2: All Sections */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowSectionMenu(!showSectionMenu);
                setShowGradeMenu(false);
                setShowStatusMenu(false);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>{sectionFilter === "All" ? "All Sections" : `Section ${sectionFilter}`}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showSectionMenu && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in duration-100">
                {["All", "A", "B", "C"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSectionFilter(s);
                      setShowSectionMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      sectionFilter === s ? "text-[#0050CB] font-bold" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {s === "All" ? "All Sections" : `Section ${s}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown 3: Status: Active */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowStatusMenu(!showStatusMenu);
                setShowGradeMenu(false);
                setShowSectionMenu(false);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Status: {statusFilter}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in duration-100">
                {(["Active", "All", "Inactive"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st);
                      setShowStatusMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      statusFilter === st ? "text-[#0050CB] font-bold" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Status: {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Toggle: Grid / List */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl flex items-center border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#0050CB] text-white shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#0050CB] text-white shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN VIEW: 3-COLUMN CARDS GRID (OR LIST TABLE)
      ======================================================== */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header of Class Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rounded Colored Squircle Avatar */}
                    <div
                      className={`w-11 h-11 rounded-2xl ${cls.avatarBg} text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      {cls.avatarText}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-extrabold text-base text-[#000E28] dark:text-white truncate tracking-tight">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-400 truncate mt-0.5">
                        {cls.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Three-Dots Menu */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Active</span>
                    </span>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuClassId(activeMenuClassId === cls.id ? null : cls.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Options */}
                      {activeMenuClassId === cls.id && (
                        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-20 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClassForSections(cls);
                              setActiveMenuClassId(null);
                            }}
                            className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2 cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span>Manage Sections</span>
                          </button>
                          <Link
                            href={`/dashboard/students?class=${cls.name}`}
                            className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2"
                          >
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>View Students</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              toast.success(`Class ${cls.name} settings updated`);
                              setActiveMenuClassId(null);
                            }}
                            className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit Class Details</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle Info Stats Row (3 Metrics) */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Sections */}
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>Sections</span>
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {cls.sectionsCount}
                    </span>
                  </div>

                  {/* Students */}
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Students</span>
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {cls.studentsCount}
                    </span>
                  </div>

                  {/* Class Teacher */}
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-slate-400" />
                      <span>Class Teacher</span>
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate" title={cls.classTeacher}>
                      {cls.classTeacher}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Row: Section Badges + Manage Sections Link */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                {/* Section Letter Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {cls.sections.map((sec, idx) => (
                    <span
                      key={idx}
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border ${sec.bg} ${sec.color} ${sec.border}`}
                    >
                      {sec.name}
                    </span>
                  ))}
                </div>

                {/* Manage Sections Link */}
                <button
                  type="button"
                  onClick={() => setSelectedClassForSections(cls)}
                  className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Manage Sections</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW TABLE */
        <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Class / Grade</th>
                  <th className="px-4 py-3.5">Class Teacher</th>
                  <th className="px-4 py-3.5 text-center">Sections</th>
                  <th className="px-4 py-3.5 text-center">Enrolled Students</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl ${cls.avatarBg} text-white font-extrabold text-xs flex items-center justify-center shrink-0`}
                        >
                          {cls.avatarText}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            {cls.name}
                          </span>
                          <span className="text-[11px] text-slate-400">{cls.subtitle}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      {cls.classTeacher}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {cls.sections.map((sec, idx) => (
                          <span
                            key={idx}
                            className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center border ${sec.bg} ${sec.color} ${sec.border}`}
                          >
                            {sec.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {cls.studentsCount}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedClassForSections(cls)}
                        className="text-xs font-bold text-[#0050CB] hover:underline cursor-pointer"
                      >
                        Manage Sections &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          5. MODAL: ADD NEW CLASS
      ======================================================== */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-[#000E28]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#000E28] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0050CB] text-white flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="font-bold text-base text-[#000E28] dark:text-white">
                  Add New Class Grade
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddClassModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Class Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Grade 3 / Nursery"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={newClassSubtitle}
                  onChange={(e) => setNewClassSubtitle(e.target.value)}
                  placeholder="e.g. Third Grade / Early Foundation"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Class Teacher
                </label>
                <input
                  type="text"
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  placeholder="e.g. Ms. Anita Roy"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Badge Color
                </label>
                <div className="flex items-center gap-2">
                  {[
                    "bg-[#3B82F6]",
                    "bg-[#8B5CF6]",
                    "bg-[#10B981]",
                    "bg-[#F97316]",
                    "bg-[#E11D48]",
                  ].map((colorClass) => (
                    <button
                      key={colorClass}
                      type="button"
                      onClick={() => setNewClassBadgeColor(colorClass)}
                      className={`w-7 h-7 rounded-lg ${colorClass} transition-transform ${
                        newClassBadgeColor === colorClass
                          ? "ring-2 ring-offset-2 ring-[#0050CB] scale-110"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#0050CB] hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-colors"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          6. MODAL: MANAGE SECTIONS FOR CLASS
      ======================================================== */}
      {selectedClassForSections && (
        <div className="fixed inset-0 bg-[#000E28]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#000E28] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${selectedClassForSections.avatarBg} text-white font-extrabold text-base flex items-center justify-center`}
                >
                  {selectedClassForSections.avatarText}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#000E28] dark:text-white">
                    Manage Sections • {selectedClassForSections.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedClassForSections.subtitle} • {selectedClassForSections.studentsCount} Students Enrolled
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClassForSections(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Sections List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Active Sections ({selectedClassForSections.sections.length})
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedClassForSections.sections.map((sec) => (
                  <div
                    key={sec.name}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border ${sec.bg} ${sec.color} ${sec.border}`}
                      >
                        {sec.name}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-white block">
                          Section {sec.name}
                        </span>
                        <span className="text-[10px] text-slate-400">Capacity: 30 pupils</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sec.name)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Section Form */}
            <form onSubmit={handleAddSection} className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Add Section Letter
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={2}
                  required
                  value={newSectionLetter}
                  onChange={(e) => setNewSectionLetter(e.target.value)}
                  placeholder="e.g. D"
                  className="w-24 px-3 py-2 text-xs uppercase font-bold text-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0050CB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>
            </form>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClassForSections(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
