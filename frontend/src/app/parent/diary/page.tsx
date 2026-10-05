"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import AppImage from "@/components/ui/AppImage";
import Link from "next/link";
import {
  BookOpen,
  Utensils,
  Moon,
  Palette,
  Home,
  Calendar,
  Clock,
  User,
  Eye,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  Bookmark,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useParent } from "@/context/ParentContext";
import ParentEmptyChildState from "@/components/parent/ParentEmptyChildState";

interface DiaryEntry {
  id: string;
  category: "Academic" | "Meals & Nutrition" | "Rest & Nap Time" | "Creative Activity" | "Homework";
  shortCategory: "Academic" | "Meals" | "Rest" | "Activity" | "Homework";
  title: string;
  description: string;
  dateTime: string;
  dateTag: "Today" | "Yesterday" | "Last 7 Days" | "Last 30 Days";
  subjectOrTag: string;
  tagIconType: "subject" | "meal" | "duration" | "craft";
  teacher: string;
  image: string;
  categoryBg: string;
  categoryText: string;
  iconBg: string;
  iconColor: string;
  detailedNotes?: string;
  feedback?: string;
}

const DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: "diary-1",
    category: "Academic",
    shortCategory: "Academic",
    title: "Number Fun – Counting & Shapes (Worksheet)",
    description: "Aarav completed the worksheet on counting and shapes. He was able to identify and color the circles and triangles. Well done!",
    dateTime: "18 Sep 2026, 10:15 AM",
    dateTag: "Today",
    subjectOrTag: "Early Numeracy",
    tagIconType: "subject",
    teacher: "Ms. Ananya Roy",
    image: "/diary-fractions-worksheet.jpg",
    categoryBg: "bg-[#E5EEFF] dark:bg-blue-950/50",
    categoryText: "text-[#0050CB] dark:text-blue-400",
    iconBg: "bg-[#2563EB]",
    iconColor: "text-white",
    detailedNotes: "Topic covered: Counting 1 to 10 and identifying circles, triangles and squares using colorful counters.",
    feedback: "High spatial grasp and enthusiasm. Recommended home play: shape sorting game.",
  },
  {
    id: "diary-2",
    category: "Meals & Nutrition",
    shortCategory: "Meals",
    title: "Lunch",
    description: "Aarav had vegetable rice, dal, and curd. Finished all the food.",
    dateTime: "18 Sep 2026, 12:30 PM",
    dateTag: "Today",
    subjectOrTag: "Lunch",
    tagIconType: "meal",
    teacher: "Class Teacher",
    image: "/diary-lunch-tray.jpg",
    categoryBg: "bg-[#DCFCE7] dark:bg-emerald-950/50",
    categoryText: "text-[#16A34A] dark:text-emerald-400",
    iconBg: "bg-[#16A34A]",
    iconColor: "text-white",
    detailedNotes: "Menu: Steamed jeera rice, yellow toor dal, mixed cauliflower & paneer vegetable curry, home-set curd, and wheat roti.",
    feedback: "Ate independently without spilling. Drank 300ml of clean drinking water post lunch.",
  },
  {
    id: "diary-3",
    category: "Rest & Nap Time",
    shortCategory: "Rest",
    title: "Rest Time",
    description: "Aarav took a 45-minute rest after lunch. He was calm and relaxed.",
    dateTime: "18 Sep 2026, 01:30 PM",
    dateTag: "Today",
    subjectOrTag: "45 minutes",
    tagIconType: "duration",
    teacher: "Class Teacher",
    image: "/diary-rest-time.jpg",
    categoryBg: "bg-[#F3E8FF] dark:bg-purple-950/50",
    categoryText: "text-[#9333EA] dark:text-purple-400",
    iconBg: "bg-[#9333EA]",
    iconColor: "text-white",
    detailedNotes: "Post-lunch quiet period from 1:30 PM to 2:15 PM in the kindergarten relaxation room with gentle ambient music.",
    feedback: "Fell asleep smoothly and woke up refreshed, energetic, and cheerful for afternoon creative workshops.",
  },
  {
    id: "diary-4",
    category: "Creative Activity",
    shortCategory: "Activity",
    title: "Art & Craft",
    description: "Aarav made a beautiful paper craft using colored paper. He was very creative and participated enthusiastically.",
    dateTime: "18 Sep 2026, 03:00 PM",
    dateTag: "Today",
    subjectOrTag: "Art & Craft",
    tagIconType: "craft",
    teacher: "Ms. Neha Kapoor",
    image: "/diary-art-craft.jpg",
    categoryBg: "bg-[#FFE4E6] dark:bg-rose-950/50",
    categoryText: "text-[#E11D48] dark:text-rose-400",
    iconBg: "bg-[#F43F5E]",
    iconColor: "text-white",
    detailedNotes: "Project: Accordion folding and concentric rainbow paper fan rosette. Practiced fine motor dexterity, symmetric folding, and color wheel arrangements.",
    feedback: "Selected color contrasts thoughtfully. Shared safety scissors politely with bench partner.",
  },
  {
    id: "diary-5",
    category: "Homework",
    shortCategory: "Homework",
    title: "Maths Practice",
    description: "Complete 10 sums from page 48 in the workbook.",
    dateTime: "17 Sep 2026, 05:00 PM",
    dateTag: "Yesterday",
    subjectOrTag: "Maths",
    tagIconType: "subject",
    teacher: "Ms. Ananya Roy",
    image: "/diary-maths-practice.jpg",
    categoryBg: "bg-[#E0F2FE] dark:bg-sky-950/50",
    categoryText: "text-[#0284C7] dark:text-sky-400",
    iconBg: "bg-[#0284C7]",
    iconColor: "text-white",
    detailedNotes: "Homework Task: Simple double-digit additions and carryover exercises (Numbers 1-100). Due tomorrow before 9:00 AM assembly.",
    feedback: "Ensure writing numbers clearly in designated squared grids.",
  },
];

export default function DailyDiaryPage() {
  const { children, selectedChild, selectChild, isLoadingChildren } = useParent();
  const [activeFilter, setActiveFilter] = useState<"Today" | "Yesterday" | "Last 7 Days" | "Last 30 Days">("Today");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Record<string, boolean>>({
    "diary-1": true,
    "diary-2": true,
  });

  const activeChild = selectedChild || children[0] || null;

  if (isLoadingChildren) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#0050CB] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading daily diary entries...</p>
        </div>
      </div>
    );
  }

  if (!activeChild) {
    return <ParentEmptyChildState />;
  }

  const filteredEntries = useMemo(() => {
    return DIARY_ENTRIES.filter((entry) => {
      // 1. Time Filter
      if (activeFilter === "Today" && entry.dateTag !== "Today") return false;
      if (activeFilter === "Yesterday" && entry.dateTag !== "Yesterday") return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = entry.title.toLowerCase().includes(q);
        const matchesDesc = entry.description.toLowerCase().includes(q);
        const matchesCat = entry.category.toLowerCase().includes(q);
        const matchesTeacher = entry.teacher.toLowerCase().includes(q);
        const matchesTag = entry.subjectOrTag.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesCat || matchesTeacher || matchesTag;
      }
      return true;
    });
  }, [activeFilter, searchQuery]);

  const handleAcknowledge = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAcknowledgedIds((prev) => {
      const nextState = !prev[id];
      if (nextState) {
        toast.success("Diary entry signed & acknowledged!", {
          icon: "✓",
          style: { borderRadius: "16px", background: "#0050CB", color: "#fff", fontSize: "13px", fontWeight: "bold" },
        });
      }
      return { ...prev, [id]: nextState };
    });
  };

  return (
    <div className="space-y-5 pb-16 font-sans">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <Link href="/parent" className="hover:text-[#0050CB] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Daily Diary</span>
      </nav>

      {/* Top Header Card */}
      <header className="rounded-[26px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 p-6 shadow-[0_4px_24px_rgba(0,14,40,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#EDE9FE] dark:bg-purple-950/40 flex items-center justify-center shrink-0 shadow-2xs">
            <BookOpen className="w-6 h-6 text-[#7C3AED] dark:text-purple-400 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#7C3AED] dark:text-purple-400">
              DAILY DIARY
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white leading-tight">
              My Child&apos;s Daily Diary
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Stay updated with your child&apos;s daily activities, learning, and school life.
            </p>
          </div>
        </div>

        {/* Right Side: Child Profile Pill Selector */}
        <div className="relative self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
            className="bg-white dark:bg-[#0B1E47] border border-slate-200 dark:border-white/10 rounded-full py-1.5 px-3.5 flex items-center gap-2.5 shadow-2xs hover:border-[#0050CB]/40 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 relative">
              <AppImage
                src={activeChild.studentPhoto || "/aarav-profile-avatar.png"}
                alt={activeChild.firstName}
                fill
                sizes="32px"
                fallbackType="avatar"
                name={`${activeChild.firstName} ${activeChild.lastName || ""}`}
                className="object-cover"
              />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#000E28] dark:text-white leading-tight">
                {activeChild.firstName} {activeChild.lastName}
              </p>
              <p className="text-[10px] font-medium text-slate-400 leading-tight">
                {activeChild.grade} - {activeChild.section || "Section A"}
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-1 transition-transform ${isChildDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Child Dropdown Menu */}
          {isChildDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-[#07142F] border border-slate-200 dark:border-white/10 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <p className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Switch Student Profile
              </p>
              {(children && children.length > 0 ? children : [activeChild]).map((c: any) => (
                <button
                  key={c._id}
                  onClick={() => {
                    if (selectChild) selectChild(c._id);
                    setIsChildDropdownOpen(false);
                    toast.success(`Viewing diary for ${c.firstName}`);
                  }}
                  className={`w-full px-3.5 py-2 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                    c._id === activeChild._id ? "bg-blue-50/70 dark:bg-blue-950/40" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-700">
                    <AppImage
                      src={c.studentPhoto || "/aarav-profile-avatar.png"}
                      alt={c.firstName}
                      fill
                      sizes="28px"
                      fallbackType="avatar"
                      name={`${c.firstName} ${c.lastName || ""}`}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#000E28] dark:text-white leading-tight">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-[10px] text-slate-400">{c.grade} - {c.section}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Filter and Search Bar */}
      <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Pill Date Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {(["Today", "Yesterday", "Last 7 Days", "Last 30 Days"] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0050CB] text-white shadow-md shadow-blue-600/20"
                    : "bg-white dark:bg-[#07142F] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Right: Date Picker Box & Search Input */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Date Indicator Box */}
          <div className="bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-[#000E28] dark:text-white shadow-2xs select-none">
            <Calendar className="w-4 h-4 text-[#0050CB]" />
            <span>18 Sep 2026</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search diary entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 rounded-2xl text-xs placeholder:text-slate-400 text-[#000E28] dark:text-white outline-none focus:border-[#0050CB] transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Diary Entry Cards List */}
      <main className="space-y-3.5">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center rounded-[26px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#000E28] dark:text-white">No diary entries found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No daily entries matched your search &quot;{searchQuery}&quot; or date filter. Try clearing your filters.
            </p>
            <button
              onClick={() => {
                setActiveFilter("Today");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-[#0050CB] text-white text-xs font-bold rounded-xl hover:bg-[#003da1] transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            return (
              <article
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="group rounded-[24px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 p-4.5 sm:p-5 shadow-[0_3px_16px_rgba(0,14,40,0.02)] hover:border-[#0050CB]/40 hover:shadow-[0_6px_24px_rgba(0,80,203,0.06)] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
              >
                {/* Left Side: Category Icon + Content */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Category Rounded Icon Squircle */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${entry.iconBg}`}
                  >
                    {entry.category === "Academic" && (
                      <BookOpen className={`w-5 h-5 ${entry.iconColor} stroke-[2.2]`} />
                    )}
                    {entry.category === "Meals & Nutrition" && (
                      <Utensils className={`w-5 h-5 ${entry.iconColor} stroke-[2.2]`} />
                    )}
                    {entry.category === "Rest & Nap Time" && (
                      <Moon className={`w-5 h-5 ${entry.iconColor} stroke-[2.2]`} />
                    )}
                    {entry.category === "Creative Activity" && (
                      <Palette className={`w-5 h-5 ${entry.iconColor} stroke-[2.2]`} />
                    )}
                    {entry.category === "Homework" && (
                      <Home className={`w-5 h-5 ${entry.iconColor} stroke-[2.2]`} />
                    )}
                  </div>

                  {/* Text Details Column */}
                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Category Pill Tag */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block ${entry.categoryBg} ${entry.categoryText}`}
                      >
                        {entry.category}
                      </span>
                    </div>

                    {/* Entry Title */}
                    <h2 className="text-sm sm:text-base font-black text-[#000E28] dark:text-white leading-snug">
                      {entry.title}
                    </h2>

                    {/* Entry Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {entry.description}
                    </p>

                    {/* Metadata Row: Date/Time • Subject/Type • Teacher */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{entry.dateTime}</span>
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        {entry.tagIconType === "subject" && <Bookmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                        {entry.tagIconType === "meal" && <Utensils className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                        {entry.tagIconType === "duration" && <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                        {entry.tagIconType === "craft" && <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                        <span>{entry.subjectOrTag}</span>
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{entry.teacher}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Photo Thumbnail + Short Tag Pill + View Details Action */}
                <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-3.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Photo Thumbnail */}
                  <div className="relative w-28 h-18 sm:w-32 sm:h-20 rounded-xl overflow-hidden border border-slate-200/90 dark:border-slate-700/80 shadow-2xs shrink-0 group-hover:scale-[1.02] transition-transform">
                    <AppImage
                      src={entry.image}
                      alt={entry.title}
                      fill
                      sizes="(max-width: 768px) 120px, 140px"
                      className="object-cover"
                    />
                  </div>

                  {/* Short Pill Badge */}
                  <div className="hidden sm:block">
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full ${entry.categoryBg} ${entry.categoryText}`}
                    >
                      {entry.shortCategory}
                    </span>
                  </div>

                  {/* View Details Action Link */}
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-[#0050CB] dark:text-blue-400 group-hover:text-[#003da1] dark:group-hover:text-blue-300 transition-colors">
                    <Eye className="w-4 h-4 text-[#0050CB] dark:text-blue-400" />
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </article>
            );
          })
        )}
      </main>

      {/* Detail Modal / Drawer Dialog */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-[28px] bg-white dark:bg-[#07142F] border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedEntry(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedEntry.categoryBg} ${selectedEntry.categoryText}`}>
                {selectedEntry.category}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400">{selectedEntry.dateTime}</span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-[#000E28] dark:text-white">
                {selectedEntry.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {selectedEntry.description}
              </p>
            </div>

            {/* High-Resolution Media Preview */}
            <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs">
              <AppImage
                src={selectedEntry.image}
                alt={selectedEntry.title}
                fill
                sizes="(max-width: 640px) 90vw, 500px"
                className="object-cover"
              />
            </div>

            {/* Educator Remarks / Detailed Observations */}
            <div className="rounded-2xl bg-slate-50 dark:bg-[#091D45]/60 p-4 border border-slate-200/60 dark:border-white/5 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Educator Observations &amp; Insights
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {selectedEntry.detailedNotes}
              </p>
              {selectedEntry.feedback && (
                <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-[#0050CB] shrink-0">Teacher Tip:</span>
                  <span>{selectedEntry.feedback}</span>
                </div>
              )}
            </div>

            {/* Educator & Signature Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <div className="w-8 h-8 rounded-full bg-[#E5EEFF] dark:bg-blue-950 flex items-center justify-center text-[#0050CB] font-bold text-xs">
                  AR
                </div>
                <div>
                  <p className="text-xs font-bold text-[#000E28] dark:text-white leading-tight">
                    {selectedEntry.teacher}
                  </p>
                  <p className="text-[10px] text-slate-400">Class Mentor • LKG Section A</p>
                </div>
              </div>

              {/* Parent Acknowledge Button */}
              <button
                type="button"
                onClick={() => handleAcknowledge(selectedEntry.id)}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  acknowledgedIds[selectedEntry.id]
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    : "bg-[#0050CB] hover:bg-[#003da1] text-white shadow-md shadow-blue-500/20"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{acknowledgedIds[selectedEntry.id] ? "Signed & Acknowledged" : "Sign as Parent"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
