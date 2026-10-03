"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, Trophy, BookOpen, Music, Palette, Wrench, MoreHorizontal, 
  Calendar, Users, MapPin, ArrowRight, ChevronDown, LayoutGrid, 
  Heart, X, Check, Sparkles, Clock, Share2, Award
} from "lucide-react";
import toast from "react-hot-toast";
import { getCurrentMonthName, getCurrentYear } from "@/lib/date";

interface ActivityItem {
  id: string;
  title: string;
  category: "Academic" | "Sports" | "Cultural" | "Art & Craft" | "Workshop" | "Others";
  categoryBg: string;
  categoryText: string;
  categoryIcon: React.ElementType;
  date: string;
  description: string;
  fullDetails?: string;
  targetClass: string;
  location: string;
  image: string;
  isBookmarked?: boolean;
  instructor?: string;
  timing?: string;
}

// Generate real upcoming school dates relative to current date
function getRelativeDateStr(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

const ACTIVITIES_DATA: ActivityItem[] = [
  {
    id: "act-1",
    title: "Creative Writing Workshop",
    category: "Academic",
    categoryBg: "bg-[#E5EEFF] dark:bg-blue-950/60",
    categoryText: "text-[#0050CB] dark:text-blue-300",
    categoryIcon: BookOpen,
    date: getRelativeDateStr(2),
    description: "An interactive workshop to enhance creativity and writing skills among students.",
    fullDetails: "Students will explore vocabulary building, imaginative storytelling, narrative composition, and essay formulation guided by guest authors and senior language mentors.",
    targetClass: "LKG & UKG",
    location: "School Library",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=700&auto=format&fit=crop&q=80",
    instructor: "Mrs. Meenakshi Sundaram",
    timing: "09:30 AM – 11:30 AM",
  },
  {
    id: "act-2",
    title: "Inter-School Football Tournament",
    category: "Sports",
    categoryBg: "bg-[#E8FAF0] dark:bg-emerald-950/60",
    categoryText: "text-[#10B981] dark:text-emerald-300",
    categoryIcon: Trophy,
    date: getRelativeDateStr(5),
    description: "Our school team is participating in the inter-school football tournament. Let's support them!",
    fullDetails: "A prestigious 3-day regional tournament hosting 16 top school teams. Parents are cordially invited to cheer our senior football squad during their opening league fixtures.",
    targetClass: "Pre-KG - UKG",
    location: "School Ground",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=700&auto=format&fit=crop&q=80",
    instructor: "Coach Rajesh Singh",
    timing: "08:00 AM – 02:00 PM",
  },
  {
    id: "act-3",
    title: "Dance & Music Fest",
    category: "Cultural",
    categoryBg: "bg-[#F3EBFD] dark:bg-purple-950/60",
    categoryText: "text-[#7C3AED] dark:text-purple-300",
    categoryIcon: Music,
    date: getRelativeDateStr(8),
    description: "A celebration of talent, rhythm and culture. Showcase your skills and be a part of the fest!",
    fullDetails: "An exhilarating showcase of Indian classical fusion, contemporary dance troupes, and choral ensemble singing. Over 200 student performers celebrating cultural arts.",
    targetClass: "Pre-KG - UKG",
    location: "Auditorium",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&auto=format&fit=crop&q=80",
    isBookmarked: true,
    instructor: "Ms. Shalini Iyer",
    timing: "10:00 AM – 01:30 PM",
  },
  {
    id: "act-4",
    title: "Art & Craft Exhibition",
    category: "Art & Craft",
    categoryBg: "bg-[#FEEBF0] dark:bg-rose-950/60",
    categoryText: "text-[#E11D48] dark:text-rose-300",
    categoryIcon: Palette,
    date: getRelativeDateStr(11),
    description: "Students will display their creativity through various art and craft projects.",
    fullDetails: "Featuring student clay pottery, acrylic canvas paintings, recycled origami installations, and handmade greeting cards created during term studio sessions.",
    targetClass: "Pre-KG & LKG",
    location: "Activity Hall",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&auto=format&fit=crop&q=80",
    isBookmarked: true,
    instructor: "Mr. Tanmay Deshmukh",
    timing: "11:00 AM – 03:00 PM",
  },
  {
    id: "act-5",
    title: "Science Discovery Workshop",
    category: "Workshop",
    categoryBg: "bg-[#FFF3E8] dark:bg-amber-950/60",
    categoryText: "text-[#FF690C] dark:text-amber-300",
    categoryIcon: Wrench,
    date: getRelativeDateStr(14),
    description: "Hands-on activities to explore the wonders of science in a fun way.",
    fullDetails: "Interactive experiments including non-Newtonian fluids, lemon battery circuits, microscope slide preparation, and junior robotics kit demonstrations.",
    targetClass: "LKG & UKG",
    location: "Science Lab",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=700&auto=format&fit=crop&q=80",
    isBookmarked: true,
    instructor: "Dr. Ananya Roy",
    timing: "09:00 AM – 12:00 PM",
  },
  {
    id: "act-6",
    title: "Parent Orientation Program",
    category: "Others",
    categoryBg: "bg-[#EFF6FE] dark:bg-slate-800",
    categoryText: "text-[#0050CB] dark:text-blue-300",
    categoryIcon: MoreHorizontal,
    date: getRelativeDateStr(18),
    description: "Get insights into the school's academic approach, policies and student development.",
    fullDetails: "Comprehensive address by Principal and senior academic coordinators highlighting NEP curriculum guidelines, emotional wellbeing support, and bi-term progress milestones.",
    targetClass: "All Classes",
    location: "Auditorium",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=700&auto=format&fit=crop&q=80",
    instructor: "Academic Advisory Committee",
    timing: "04:00 PM – 06:00 PM",
  },
];

export default function ActivitiesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All Activities");
  const [selectedClass, setSelectedClass] = useState<string>("All Classes");
  const [selectedMonth, setSelectedMonth] = useState<string>("All Months");
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

  // Bookmark tracking map
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({
    "act-1": false,
    "act-2": false,
    "act-3": true,
    "act-4": true,
    "act-5": true,
    "act-6": false,
  });

  const toggleBookmark = (id: string, title: string) => {
    setBookmarkedMap((prev) => {
      const next = !prev[id];
      if (next) {
        toast.success(`Saved "${title}" to favorites`);
      } else {
        toast(`Removed "${title}" from favorites`);
      }
      return { ...prev, [id]: next };
    });
  };

  const categories = [
    { label: "All Activities", icon: LayoutGrid },
    { label: "Academic", icon: BookOpen },
    { label: "Cultural", icon: Music },
    { label: "Sports", icon: Trophy },
    { label: "Art & Craft", icon: Palette },
    { label: "Workshop", icon: Wrench },
    { label: "Others", icon: MoreHorizontal },
  ];

  const classOptions = [
    "All Classes",
    "Pre-KG",
    "LKG",
    "UKG",
    "Pre-KG & LKG",
    "LKG & UKG",
  ];

  const monthOptions = useMemo(() => {
    const list = ["All Months"];
    const now = new Date();
    for (let i = -1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      list.push(d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', year: 'numeric' }));
    }
    return list;
  }, []);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return ACTIVITIES_DATA.filter((item) => {
      if (activeCategory !== "All Activities" && item.category !== activeCategory) {
        return false;
      }
      if (selectedClass !== "All Classes" && item.targetClass !== selectedClass && item.targetClass !== "All Classes") {
        return false;
      }
      return true;
    });
  }, [activeCategory, selectedClass]);

  return (
    <div className="space-y-6 pb-16 max-w-[1440px] mx-auto font-sans text-slate-800 dark:text-slate-100 select-none">

      {/* ========================================================
          1. BREADCRUMBS
      ======================================================== */}
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-400">
        <Link href="/parent" className="hover:text-[#0050CB] transition-colors">
          Home
        </Link>
        <span className="text-slate-300 dark:text-slate-600">›</span>
        <span className="text-[#000E28] dark:text-white font-bold">Activities</span>
      </nav>

      {/* ========================================================
          2. HERO BANNER
      ======================================================== */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#EBF3FE] via-[#F2F7FF] to-[#E2F0FE] dark:from-[#051636] dark:via-[#091B40] dark:to-[#071738] border border-blue-100/90 dark:border-white/10 shadow-[0_4px_24px_rgba(0,80,203,0.04)] min-h-[170px] sm:min-h-[190px] flex items-center justify-between p-6 sm:p-8 lg:p-10">
        
        {/* Background Paper Airplane Dotted Flight Doodle */}
        <div className="absolute left-[36%] sm:left-[42%] top-6 hidden md:block pointer-events-none opacity-50 dark:opacity-30">
          <svg width="150" height="70" viewBox="0 0 150 70" fill="none">
            <path 
              d="M10 50 C 45 20, 85 60, 125 22" 
              stroke="#0050CB" 
              strokeWidth="1.8" 
              strokeDasharray="4 4" 
              fill="none" 
            />
            <path d="M125 22 L142 16 L133 32 Z" fill="#0050CB" />
          </svg>
        </div>

        {/* Left Side: Star Badge + Title + Subtitle */}
        <div className="relative z-10 flex items-start gap-4 sm:gap-5 max-w-xl">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 text-[#0050CB] border border-blue-200/80 dark:border-blue-900/60 shadow-xs flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 stroke-[2.2] text-[#0050CB]" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#000E28] dark:text-white tracking-tight leading-tight">
              School Activities
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-300 leading-relaxed font-normal max-w-md">
              Explore exciting learning activities, events and opportunities that help your child grow beyond the classroom.
            </p>
          </div>
        </div>

        {/* Right Side: Playful Hand-drawn "Learn Explore Grow ♡" */}
        <div className="relative z-10 hidden sm:flex items-center gap-4 self-center pr-2 sm:pr-4">
          <div className="flex flex-col items-end text-[#0050CB] dark:text-[#38BDF8] select-none font-sans font-black">
            <span className="text-xl sm:text-2xl tracking-tight leading-none rotate-[-5deg]">
              Learn
            </span>
            <span className="text-2xl sm:text-3xl tracking-tight leading-none mt-1.5 rotate-[3deg]">
              Explore
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 rotate-[-3deg]">
              <span className="text-2xl sm:text-3xl tracking-tight leading-none">
                Grow
              </span>
              <span className="text-2xl sm:text-3xl text-[#FF690C] dark:text-[#FFA066] leading-none">♡</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          3. CATEGORIES PILLS + DROPDOWNS BAR
      ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        
        {/* Left: Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.label;

            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setActiveCategory(cat.label)}
                className={`px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive
                    ? "bg-[#0050CB] text-white shadow-sm shadow-blue-500/20"
                    : "bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#0050CB]/50 hover:text-[#0050CB]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Class & Month Dropdowns */}
        <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
          
          {/* Class Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsClassDropdownOpen(!isClassDropdownOpen);
                setIsMonthDropdownOpen(false);
              }}
              className="px-4 py-2 sm:py-2.5 rounded-full bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:border-[#0050CB]/40 shadow-2xs cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-[#0050CB]" />
              <span>{selectedClass}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isClassDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-[#07142F] border border-slate-200 dark:border-slate-800 shadow-lg py-1.5 z-30">
                {classOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedClass(c);
                      setIsClassDropdownOpen(false);
                      toast(`Filtered by ${c}`);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between ${
                      selectedClass === c ? "text-[#0050CB] font-bold bg-blue-50/50" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{c}</span>
                    {selectedClass === c && <Check className="w-3.5 h-3.5 text-[#0050CB]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Month Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsMonthDropdownOpen(!isMonthDropdownOpen);
                setIsClassDropdownOpen(false);
              }}
              className="px-4 py-2 sm:py-2.5 rounded-full bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:border-[#0050CB]/40 shadow-2xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#0050CB]" />
              <span>{selectedMonth}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isMonthDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 rounded-2xl bg-white dark:bg-[#07142F] border border-slate-200 dark:border-slate-800 shadow-lg py-1.5 z-30">
                {monthOptions.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSelectedMonth(m);
                      setIsMonthDropdownOpen(false);
                      toast(`Showing activities for ${m}`);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between ${
                      selectedMonth === m ? "text-[#0050CB] font-bold bg-blue-50/50" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{m}</span>
                    {selectedMonth === m && <Check className="w-3.5 h-3.5 text-[#0050CB]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================
          4. 3-COLUMN ACTIVITIES GRID (6 Cards)
      ======================================================== */}
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredActivities.map((act) => {
            const CatIcon = act.categoryIcon;
            const isFav = bookmarkedMap[act.id];

            return (
              <div
                key={act.id}
                className="group rounded-[24px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              >
                {/* Card Thumbnail Image + Star Bookmark Button */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={act.image}
                    alt={act.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => toggleBookmark(act.id, act.title)}
                    className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-110 shadow-xs cursor-pointer z-10"
                    title={isFav ? "Saved to favorites" : "Save to favorites"}
                  >
                    <Star
                      className={`w-4 h-4 stroke-[2] ${
                        isFav
                          ? "fill-[#FF690C] text-[#FF690C]"
                          : "text-slate-400 hover:text-[#0050CB]"
                      }`}
                    />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  
                  <div className="space-y-2">
                    {/* Category Pill Tag */}
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${act.categoryBg} ${act.categoryText}`}>
                        <CatIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>{act.category}</span>
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0050CB] dark:text-blue-300 pt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0050CB] shrink-0" />
                      <span>{act.date}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-extrabold text-[#000E28] dark:text-white leading-snug line-clamp-1 group-hover:text-[#0050CB] transition-colors">
                      {act.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[34px]">
                      {act.description}
                    </p>
                  </div>

                  {/* Footer Row: Target Class, Location & View Details */}
                  <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-auto">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center gap-1 truncate text-[11px] font-medium">
                        <Users className="w-3.5 h-3.5 text-[#0050CB] shrink-0" />
                        <span className="truncate">{act.targetClass}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate text-[11px] font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#0050CB] shrink-0" />
                        <span className="truncate">{act.location}</span>
                      </div>
                    </div>

                    {/* View Details CTA */}
                    <button
                      type="button"
                      onClick={() => setSelectedActivity(act)}
                      className="text-xs font-bold text-[#0050CB] hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer transition-colors"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-[28px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 space-y-3">
          <Palette className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            No school activities found matching &quot;{activeCategory}&quot; for &quot;{selectedClass}&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("All Activities");
              setSelectedClass("All Classes");
            }}
            className="px-4 py-2 rounded-xl bg-[#0050CB] text-white text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ========================================================
          5. ACTIVITY DETAILS MODAL
      ======================================================== */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white dark:bg-[#07142F] rounded-[28px] max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Thumbnail */}
            <div className="relative h-52 w-full">
              <Image
                src={selectedActivity.image}
                alt={selectedActivity.title}
                fill
                sizes="(max-width: 640px) 90vw, 512px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase mb-1.5 ${selectedActivity.categoryBg} ${selectedActivity.categoryText}`}>
                  {selectedActivity.category}
                </span>
                <h3 className="text-xl font-black leading-tight drop-shadow-sm">
                  {selectedActivity.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedActivity.fullDetails || selectedActivity.description}
              </p>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Schedule</span>
                  <div className="flex items-center gap-1.5 font-bold text-[#000E28] dark:text-white">
                    <Calendar className="w-3.5 h-3.5 text-[#0050CB]" />
                    <span>{selectedActivity.date}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">{selectedActivity.timing || "Morning Session"}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Venue</span>
                  <div className="flex items-center gap-1.5 font-bold text-[#000E28] dark:text-white">
                    <MapPin className="w-3.5 h-3.5 text-[#0050CB]" />
                    <span>{selectedActivity.location}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">Main Campus</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Eligible Classes</span>
                  <div className="flex items-center gap-1.5 font-bold text-[#000E28] dark:text-white">
                    <Users className="w-3.5 h-3.5 text-[#0050CB]" />
                    <span>{selectedActivity.targetClass}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Faculty In-Charge</span>
                  <div className="flex items-center gap-1.5 font-bold text-[#000E28] dark:text-white">
                    <Award className="w-3.5 h-3.5 text-[#0050CB]" />
                    <span>{selectedActivity.instructor || "School Mentor"}</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    toggleBookmark(selectedActivity.id, selectedActivity.title);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0050CB] text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Star className={`w-3.5 h-3.5 ${bookmarkedMap[selectedActivity.id] ? "fill-[#FF690C] text-[#FF690C]" : ""}`} />
                  <span>{bookmarkedMap[selectedActivity.id] ? "Saved" : "Save"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Child enrolled in "${selectedActivity.title}"!`);
                    setSelectedActivity(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold text-center shadow-md shadow-blue-500/20 cursor-pointer transition-all"
                >
                  Register Child
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
