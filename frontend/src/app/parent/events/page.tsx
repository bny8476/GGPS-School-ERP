"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import AppImage from "@/components/ui/AppImage";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, Star, 
  ChevronRight, ChevronLeft, Bell, Heart, Bookmark, 
  Share2, Check, Sparkles, Filter, CheckCircle2, X
} from "lucide-react";
import toast from "react-hot-toast";

interface SchoolEvent {
  id: string;
  title: string;
  category: "Sports & Fitness" | "Academic" | "Cultural" | "Parent Engagement" | "Others";
  categoryBg: string;
  dotColor: string;
  dateKey: string; // YYYY-MM-DD
  date: string;
  time: string;
  location: string;
  audience: string;
  description: string;
  image: string;
  isFeatured?: boolean;
  status: "upcoming" | "past";
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MASTER_EVENTS: SchoolEvent[] = [
  {
    id: "ev-featured",
    title: "Annual Sports Day 2026",
    category: "Sports & Fitness",
    categoryBg: "bg-[#E8FAF0] dark:bg-emerald-950/60 text-[#10B981] dark:text-emerald-300",
    dotColor: "bg-emerald-500",
    dateKey: "2026-09-10",
    date: "Thu, 10 Sep 2026",
    time: "08:30 AM – 01:00 PM",
    location: "GGPS Central Athletic Stadium",
    audience: "All Parents & Students",
    description: "A celebration of talent, teamwork and healthy competition. Students will participate in various track and field events, team games and more.",
    image: "/sports-day-track.jpg",
    isFeatured: true,
    status: "upcoming",
  },
  {
    id: "ev-sep-6",
    title: "Inter-House Classical Solo Singing & Choral Recital",
    category: "Cultural",
    categoryBg: "bg-[#FFF2E7] dark:bg-amber-950/60 text-[#FF690C] dark:text-amber-300",
    dotColor: "bg-purple-500",
    dateKey: "2026-09-06",
    date: "Sun, 06 Sep 2026",
    time: "10:30 AM – 01:30 PM",
    location: "School Mini-Auditorium",
    audience: "Parents & Students (Grades 6-12)",
    description: "Students compete in traditional Indian classical vocals, instrumental accompaniments, and choral ensemble performances.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    status: "upcoming",
  },
  {
    id: "ev-sep-16",
    title: "Hindi Diwas Celebration & Kavi Sammelan",
    category: "Cultural",
    categoryBg: "bg-[#FFF2E7] dark:bg-amber-950/60 text-[#FF690C] dark:text-amber-300",
    dotColor: "bg-purple-500",
    dateKey: "2026-09-16",
    date: "Wed, 16 Sep 2026",
    time: "09:30 AM – 12:30 PM",
    location: "Primary Assembly Hall",
    audience: "All Parents & Students",
    description: "Celebrating national linguistic heritage with student poetry recitations, stage plays, and literary honors.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
    status: "upcoming",
  },
  {
    id: "ev-1",
    title: "Parent-Teacher Developmental Conference (PTC)",
    category: "Parent Engagement",
    categoryBg: "bg-[#F3EBFD] dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300",
    dotColor: "bg-[#0050CB]",
    dateKey: "2026-09-24",
    date: "Sat, 24 Sep 2026",
    time: "09:00 AM – 05:30 PM",
    location: "Pre-Primary & Primary Wings",
    audience: "Parents Only",
    description: "1-on-1 bi-term consultation with your child's mentors to review progress, discuss academic goals, and explore holistic growth.",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80",
    status: "upcoming",
  },
  {
    id: "ev-sep-25",
    title: "Inter-House Debate & Elocution Championship",
    category: "Academic",
    categoryBg: "bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300",
    dotColor: "bg-rose-500",
    dateKey: "2026-09-25",
    date: "Fri, 25 Sep 2026",
    time: "10:00 AM – 02:00 PM",
    location: "Seminar Hall A",
    audience: "All Parents & Students",
    description: "Engaging debates on modern technology ethics, environmental conservation, and civic responsibility.",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80",
    status: "upcoming",
  },
  {
    id: "ev-sep-27",
    title: "Junior Campus Wellness & Cross-Country Fun Run",
    category: "Sports & Fitness",
    categoryBg: "bg-[#E8FAF0] dark:bg-emerald-950/60 text-[#10B981] dark:text-emerald-300",
    dotColor: "bg-emerald-500",
    dateKey: "2026-09-27",
    date: "Sun, 27 Sep 2026",
    time: "06:30 AM – 09:00 AM",
    location: "School Sports Track & Green Lawns",
    audience: "Parents, Faculty & Students",
    description: "Promoting cardio fitness and healthy outdoor lifestyle with a scenic 3km jog and family yoga stretch session.",
    image: "/sports-day-track.jpg",
    status: "upcoming",
  },
  {
    id: "ev-sep-29",
    title: "Annual Performing Arts Theatre Auditions",
    category: "Cultural",
    categoryBg: "bg-[#FFF2E7] dark:bg-amber-950/60 text-[#FF690C] dark:text-amber-300",
    dotColor: "bg-purple-500",
    dateKey: "2026-09-29",
    date: "Tue, 29 Sep 2026",
    time: "02:30 PM – 05:00 PM",
    location: "School Black Box Theatre",
    audience: "Enrolled Drama Students",
    description: "Auditions for the annual school musical production with guest theatre directors and voice coaches.",
    image: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=600&auto=format&fit=crop&q=80",
    status: "upcoming",
  },
  {
    id: "ev-sep-30",
    title: "Vedic Math & STEM Problem Solving Olympiad",
    category: "Academic",
    categoryBg: "bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300",
    dotColor: "bg-rose-500",
    dateKey: "2026-09-30",
    date: "Wed, 30 Sep 2026",
    time: "11:00 AM – 01:30 PM",
    location: "Discovery Science Centre",
    audience: "Grades 4 through 10",
    description: "Speed math tricks, geometric puzzle challenges, and junior logic tests celebrating mathematical excellence.",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80",
    status: "upcoming",
  },
  {
    id: "ev-2",
    title: "Science Exhibition 2026",
    category: "Academic",
    categoryBg: "bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300",
    dotColor: "bg-rose-500",
    dateKey: "2026-10-06",
    date: "Tue, 06 Oct 2026",
    time: "10:00 AM – 01:00 PM",
    location: "Multipurpose Hall",
    audience: "All Parents & Students",
    description: "Our young scientists showcase their innovative ideas and creative projects. All parents are invited to explore the interactive booths.",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80",
    status: "upcoming",
  },
  {
    id: "ev-oct-15",
    title: "World Students' Day & APJ Kalam Innovation Tribute",
    category: "Others",
    categoryBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
    dotColor: "bg-amber-500",
    dateKey: "2026-10-15",
    date: "Thu, 15 Oct 2026",
    time: "09:00 AM – 11:30 AM",
    location: "Main Campus Amphitheatre",
    audience: "All Parents & Students",
    description: "Special tribute assembly celebrating youth innovation, scientific curiosity, and leadership development.",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80",
    status: "upcoming",
  },
  {
    id: "ev-3",
    title: "Diwali Celebration 2026",
    category: "Cultural",
    categoryBg: "bg-[#FFF2E7] dark:bg-amber-950/60 text-[#FF690C] dark:text-amber-300",
    dotColor: "bg-purple-500",
    dateKey: "2026-10-30",
    date: "Fri, 30 Oct 2026",
    time: "04:00 PM – 07:00 PM",
    location: "School Auditorium",
    audience: "All Parents & Students",
    description: "Join us for a day of joy, culture and togetherness as we celebrate the festival of lights with musical performances and sweet distribution.",
    image: "https://images.unsplash.com/photo-1605656816944-971cd5c1407f?w=600&auto=format&fit=crop&q=80",
    status: "upcoming",
  },
  {
    id: "ev-past-1",
    title: "Inter-School Science & STEAM Innovation Expo",
    category: "Academic",
    categoryBg: "bg-blue-50 dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300",
    dotColor: "bg-rose-500",
    dateKey: "2026-08-20",
    date: "Thursday, 20 August 2026",
    time: "09:00 AM – 03:00 PM",
    location: "Exhibition Hall",
    audience: "All Parents & Students",
    description: "Over 80 interactive student working models illustrating renewable green energy and junior robotics.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    status: "past",
  },
  {
    id: "ev-past-2",
    title: "Independence Day Patriotic Assembly & March Past",
    category: "Cultural",
    categoryBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
    dotColor: "bg-purple-500",
    dateKey: "2026-08-15",
    date: "Saturday, 15 August 2026",
    time: "08:00 AM – 11:30 AM",
    location: "Main Parade Ground",
    audience: "All Parents & Students",
    description: "Flag hoisting by Chairman followed by patriotic choir performances and student honors.",
    image: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600&auto=format&fit=crop&q=80",
    status: "past",
  },
];

const formatDateString = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function SchoolEventsPage() {
  const [activeTab, setActiveTab] = useState<"Upcoming" | "All Events" | "Past Events">("Upcoming");
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [stayUpdatedEnabled, setStayUpdatedEnabled] = useState(true);

  // Bookmarked events map
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({
    "ev-featured": true,
    "ev-1": false,
    "ev-2": false,
    "ev-3": false,
  });

  // Reminders map
  const [reminderMap, setReminderMap] = useState<Record<string, boolean>>({
    "ev-featured": true,
  });

  const toggleBookmark = (id: string, title: string) => {
    setBookmarkedMap((prev) => {
      const next = !prev[id];
      if (next) {
        toast.success(`Bookmarked "${title}"`);
      } else {
        toast(`Removed bookmark for "${title}"`);
      }
      return { ...prev, [id]: next };
    });
  };

  const toggleReminder = (id: string, title: string) => {
    setReminderMap((prev) => {
      const next = !prev[id];
      if (next) {
        toast.success(`Reminder set for "${title}"`);
      } else {
        toast(`Reminder cancelled for "${title}"`);
      }
      return { ...prev, [id]: next };
    });
  };

  // Map events by dateKey for fast lookup
  const eventsByDate = useMemo(() => {
    const map: Record<string, SchoolEvent[]> = {};
    MASTER_EVENTS.forEach((ev) => {
      if (!map[ev.dateKey]) {
        map[ev.dateKey] = [];
      }
      map[ev.dateKey].push(ev);
    });
    return map;
  }, []);

  // Calendar month days calculation
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      day: number;
      monthIndex: number;
      year: number;
      isCurrentMonth: boolean;
      dateKey: string;
      events: SchoolEvent[];
    }[] = [];

    // Trailing days from previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const dateKey = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        monthIndex: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        dateKey,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        monthIndex: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateKey,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Leading days from next month to complete standard grid (35 or 42 cells)
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const dateKey = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        monthIndex: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        dateKey,
        events: eventsByDate[dateKey] || [],
      });
    }

    return days;
  }, [currentYear, currentMonth, eventsByDate]);

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "Sports & Fitness": 0,
      "Academic": 0,
      "Cultural": 0,
      "Parent Engagement": 0,
      "Others": 0,
    };
    MASTER_EVENTS.forEach((ev) => {
      if (counts[ev.category] !== undefined) {
        counts[ev.category]++;
      }
    });
    return counts;
  }, []);

  const categoryLegend = [
    { label: "Sports & Fitness", category: "Sports & Fitness", count: categoryCounts["Sports & Fitness"], color: "bg-emerald-500" },
    { label: "Academic", category: "Academic", count: categoryCounts["Academic"], color: "bg-rose-500" },
    { label: "Cultural", category: "Cultural", count: categoryCounts["Cultural"], color: "bg-purple-500" },
    { label: "Parent Engagement", category: "Parent Engagement", count: categoryCounts["Parent Engagement"], color: "bg-[#0050CB]" },
    { label: "Others", category: "Others", count: categoryCounts["Others"], color: "bg-amber-500" },
  ];

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleResetToCurrent = () => {
    setCurrentYear(2026);
    setCurrentMonth(8); // September
    setSelectedDateKey("2026-09-10");
    setSelectedCategory(null);
    toast.success("Returned to September 2026");
  };

  // Day click handler
  const handleDayClick = (item: typeof calendarDays[0]) => {
    if (selectedDateKey === item.dateKey) {
      setSelectedDateKey(null);
      toast("Cleared date filter");
      return;
    }

    setSelectedDateKey(item.dateKey);

    // If clicked day is from previous or next month, smoothly navigate to that month
    if (!item.isCurrentMonth) {
      setCurrentMonth(item.monthIndex);
      setCurrentYear(item.year);
    }

    const count = item.events.length;
    if (count > 0) {
      toast.success(`${count} event${count > 1 ? "s" : ""} on ${item.day} ${MONTH_NAMES[item.monthIndex]}`);
    } else {
      toast(`No events scheduled on ${item.day} ${MONTH_NAMES[item.monthIndex]}`);
    }
  };

  // Events on the selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDateKey) return [];
    return eventsByDate[selectedDateKey] || [];
  }, [selectedDateKey, eventsByDate]);

  // Filtered upcoming events for the 3-column grid
  const filteredUpcomingCards = useMemo(() => {
    return MASTER_EVENTS.filter((ev) => {
      if (ev.status !== "upcoming") return false;
      if (ev.isFeatured) return false; // Featured is shown in hero card
      if (selectedCategory && ev.category !== selectedCategory) return false;
      if (selectedDateKey && ev.dateKey !== selectedDateKey) return false;
      return true;
    });
  }, [selectedCategory, selectedDateKey]);

  // Featured event visibility based on filter
  const featuredEvent = useMemo(() => {
    const feat = MASTER_EVENTS.find((ev) => ev.isFeatured);
    if (!feat) return null;
    if (activeTab === "Past Events") return null;
    if (selectedCategory && feat.category !== selectedCategory) return null;
    if (selectedDateKey && feat.dateKey !== selectedDateKey) return null;
    return feat;
  }, [activeTab, selectedCategory, selectedDateKey]);

  // Filtered past events
  const filteredPastEvents = useMemo(() => {
    return MASTER_EVENTS.filter((ev) => {
      if (ev.status !== "past") return false;
      if (selectedCategory && ev.category !== selectedCategory) return false;
      if (selectedDateKey && ev.dateKey !== selectedDateKey) return false;
      return true;
    });
  }, [selectedCategory, selectedDateKey]);

  // KPI Metrics
  const stats = [
    { label: "Upcoming", count: 12, icon: CalendarIcon, color: "text-[#0050CB]", bg: "bg-[#E5EEFF] dark:bg-blue-950/60", tab: "Upcoming" as const },
    { label: "Total Events", count: 28, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/60", tab: "All Events" as const },
    { label: "Past Events", count: 6, icon: Clock, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/60", tab: "Past Events" as const },
    { label: "Featured", count: 4, icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/60", tab: "Upcoming" as const },
  ];

  return (
    <div className="space-y-5 pb-16 max-w-[1440px] mx-auto font-sans text-slate-800 dark:text-slate-100">

      {/* ========================================================
          1. BREADCRUMBS
      ======================================================== */}
      <nav className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/parent" className="hover:text-[#0050CB] transition-colors">
          Home
        </Link>
        <span className="text-slate-400">›</span>
        <span className="text-slate-700 dark:text-slate-200 font-bold">Events</span>
      </nav>

      {/* ========================================================
          2. TOP HEADER BANNER + KPI METRICS + TABS
      ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-[24px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)]">
        
        {/* Left Side: Title & Subtitle with Calendar Icon */}
        <div className="flex items-start gap-4 max-w-xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#0050CB] border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-[#0050CB] dark:text-blue-300">
              SCHOOL EVENTS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
              Upcoming &amp; Past Events
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Stay informed about school events, parent-teacher meetings, celebrations, and important dates in your child&apos;s academic journey.
            </p>
          </div>
        </div>

        {/* Middle / Right: Stats Cards & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          
          {/* 4 Stats Chips in a Container */}
          <div className="flex items-center gap-3 p-2 px-3 rounded-2xl bg-[#F6F9FD] dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto">
            {stats.map((st) => {
              const Icon = st.icon;
              return (
                <button
                  key={st.label}
                  type="button"
                  onClick={() => setActiveTab(st.tab)}
                  className="flex items-center gap-2.5 px-2 py-1 shrink-0 text-left hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-xl ${st.bg} ${st.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#000E28] dark:text-white leading-tight">
                      {st.count}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 leading-tight">
                      {st.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Filter Tabs: Upcoming, All Events, Past Events */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 self-start sm:self-center shrink-0">
            {(["Upcoming", "All Events", "Past Events"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0050CB] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-[#0050CB]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* ========================================================
          3. MAIN TWO-COLUMN SECTION
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ====================================================
            LEFT COLUMN (8 or 9 COLS): FEATURED & UPCOMING EVENTS
        ==================================================== */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-5">

          {/* Active Filter Bar (when date or category is selected) */}
          {(selectedDateKey || selectedCategory) && (
            <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-xs">
              <div className="flex items-center gap-2 text-[#0050CB] dark:text-blue-300 font-bold flex-wrap">
                <Filter className="w-4 h-4 shrink-0" />
                <span>Active Filters:</span>
                {selectedDateKey && (
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[#0050CB] dark:text-white border border-blue-200 dark:border-blue-800 flex items-center gap-1 font-bold">
                    <CalendarIcon className="w-3 h-3 text-[#0050CB]" />
                    {formatDateString(selectedDateKey)}
                    <button 
                      type="button"
                      onClick={() => setSelectedDateKey(null)}
                      className="ml-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[#0050CB] dark:text-white border border-blue-200 dark:border-blue-800 flex items-center gap-1 font-bold">
                    {selectedCategory}
                    <button 
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="ml-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedDateKey(null);
                  setSelectedCategory(null);
                }}
                className="text-xs font-bold text-[#0050CB] hover:underline cursor-pointer shrink-0 ml-2"
              >
                Clear Filters
              </button>
            </div>
          )}
          
          {/* 1. FEATURED EVENT LARGE CARD */}
          {featuredEvent && (
            <div className="relative overflow-hidden rounded-[26px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_20px_rgba(0,14,40,0.03)] grid grid-cols-1 md:grid-cols-12">
              
              {/* Left Photo with Featured Badge */}
              <div className="md:col-span-5 relative min-h-[220px] md:min-h-full">
                <AppImage
                  src={featuredEvent.image}
                  alt={featuredEvent.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
                
                {/* FEATURED EVENT Badge on top-left of image */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0050CB]/90 backdrop-blur-md text-white text-[11px] font-black tracking-wide shadow-md">
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    <span>FEATURED EVENT</span>
                  </span>
                </div>
              </div>

              {/* Right Details */}
              <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-4">
                
                {/* Top Row: Categories + Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#E8FAF0] dark:bg-emerald-950/60 text-[#10B981] dark:text-emerald-300 text-[11px] font-bold">
                      {featuredEvent.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 text-[#0050CB] dark:text-blue-300 text-[10.5px] font-bold">
                      Upcoming
                    </span>
                  </div>

                  {/* Heart, Bookmark, Share */}
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <button 
                      type="button"
                      onClick={() => toast.success("Added to favorites")}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => toggleBookmark(featuredEvent.id, featuredEvent.title)}
                      className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                        bookmarkedMap[featuredEvent.id] ? "text-[#0050CB] fill-[#0050CB]" : "hover:text-[#0050CB]"
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => toast("Share event link copied to clipboard!")}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0050CB] transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
                    {featuredEvent.title}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-300 leading-relaxed font-normal">
                    {featuredEvent.description}
                  </p>
                </div>

                {/* Event Metadata (Date, Location, Audience) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-start gap-2">
                    <CalendarIcon className="w-4 h-4 text-[#0050CB] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#000E28] dark:text-white leading-tight">{featuredEvent.date}</p>
                      <p className="text-[10.5px] text-slate-400">{featuredEvent.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#0050CB] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#000E28] dark:text-white leading-tight">GGPS Central Athletic</p>
                      <p className="text-[10.5px] text-slate-400">Stadium</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-[#0050CB] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#000E28] dark:text-white leading-tight">{featuredEvent.audience}</p>
                    </div>
                  </div>
                </div>

                {/* Footer: Organizer & Set Reminder Button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0050CB] font-bold text-xs flex items-center justify-center border border-blue-200">
                      CV
                    </div>
                    <div>
                      <p className="text-[10.5px] text-slate-400 leading-tight">Organized by</p>
                      <p className="text-xs font-bold text-[#000E28] dark:text-white leading-tight">Sports Department</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleReminder(featuredEvent.id, featuredEvent.title)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0 ${
                      reminderMap[featuredEvent.id]
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-[#0050CB] hover:bg-[#0041A8] text-white shadow-blue-500/20"
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5 stroke-[2.4]" />
                    <span>{reminderMap[featuredEvent.id] ? "Reminder Set ✓" : "Set Reminder"}</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* 2. UPCOMING EVENTS SECTION */}
          {activeTab !== "Past Events" && (
            <div className="space-y-4">
              
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0050CB] flex items-center justify-center">
                    <CalendarIcon className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>
                  <h3 className="text-base font-black text-[#000E28] dark:text-white">
                    Upcoming Events
                  </h3>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    setSelectedDateKey(null);
                    setSelectedCategory(null);
                    setActiveTab("Upcoming");
                    toast("Showing all upcoming events");
                  }}
                  className="text-xs font-bold text-[#0050CB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Events</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Event Cards Grid */}
              {filteredUpcomingCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredUpcomingCards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-[24px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
                    >
                      {/* Top Thumbnail Image */}
                      <div className="relative h-44 w-full overflow-hidden">
                        <AppImage
                          src={card.image}
                          alt={card.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Bookmark Action Button */}
                        <button
                          type="button"
                          onClick={() => toggleBookmark(card.id, card.title)}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
                            bookmarkedMap[card.id] ? "text-[#0050CB]" : "text-slate-500 hover:text-[#0050CB]"
                          }`}
                        >
                          <Bookmark className="w-4 h-4 stroke-[2.2]" />
                        </button>
                      </div>

                      {/* Card Content */}
                      <div className="p-4.5 flex-1 flex flex-col justify-between">
                        
                        <div className="space-y-2">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${card.categoryBg}`}>
                            {card.category}
                          </span>

                          <h4 className="text-sm font-extrabold text-[#000E28] dark:text-white leading-snug line-clamp-2 min-h-[40px] flex items-start">
                            {card.title}
                          </h4>

                          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[34px] leading-relaxed">
                            {card.description}
                          </p>
                        </div>

                        {/* Metadata: Date & Location */}
                        <div className="space-y-1.5 pt-2.5 my-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-[#0050CB] shrink-0" />
                            <div>
                              <span className="font-bold text-[#000E28] dark:text-white">{card.date}</span>
                              <span className="text-[10px] text-slate-400 block">{card.time}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#0050CB] shrink-0" />
                            <span className="truncate">{card.location}</span>
                          </div>
                        </div>

                        {/* Footer Row: Audience & Set Reminder Button */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto gap-2">
                          <span className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1 min-w-0 truncate">
                            <Users className="w-3.5 h-3.5 text-[#0050CB] shrink-0" />
                            <span className="truncate">{card.audience}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleReminder(card.id, card.title)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0050CB] hover:bg-blue-50/50 dark:hover:bg-blue-900/20 text-xs font-bold text-[#0050CB] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap shadow-2xs"
                          >
                            <Bell className="w-3.5 h-3.5 shrink-0" />
                            <span>{reminderMap[card.id] ? "Saved ✓" : "Set Reminder"}</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-[24px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 text-center space-y-3">
                  <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    No upcoming events match the current filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDateKey(null);
                      setSelectedCategory(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0050CB] text-white text-xs font-bold cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

            </div>
          )}

          {/* 3. PAST EVENTS SECTION (Bottom) */}
          {activeTab !== "Upcoming" && (
            <div className="space-y-4 pt-2">
              
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>
                  <h3 className="text-base font-black text-[#000E28] dark:text-white">
                    Past Events
                  </h3>
                </div>

                <button 
                  type="button"
                  onClick={() => toast("Showing archive of past school events")}
                  className="text-xs font-bold text-[#0050CB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Past Events</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Compact Past Event Cards */}
              {filteredPastEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPastEvents.map((pe) => (
                    <div
                      key={pe.id}
                      className="p-4.5 rounded-[22px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${pe.categoryBg}`}>
                          {pe.category}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">{pe.date}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#000E28] dark:text-white">
                        {pe.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {pe.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-[22px] bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 text-center">
                  <p className="text-xs text-slate-400">No past events match the current filter.</p>
                </div>
              )}

            </div>
          )}

        </div>

        {/* ====================================================
            RIGHT COLUMN (3 or 4 COLS): CALENDAR WIDGET & NOTIFICATIONS
        ==================================================== */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          
          {/* 1. EVENT CALENDAR WIDGET */}
          <div className="bg-white dark:bg-[#07142F] rounded-[24px] p-5 border border-slate-200/80 dark:border-white/10 shadow-[0_2px_12px_rgba(0,14,40,0.02)] space-y-4">
            
            {/* Header: Title */}
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-4.5 h-4.5 text-[#0050CB] stroke-[2.2]" />
              <h3 className="text-sm font-black text-[#000E28] dark:text-white">
                Event Calendar
              </h3>
            </div>

            {/* Month Selector Pagination */}
            <div className="flex items-center justify-between px-1 py-1">
              <button
                type="button"
                onClick={handleResetToCurrent}
                title="Jump to September 2026 (Today)"
                className="text-xs font-bold text-slate-400 hover:text-[#0050CB] transition-colors cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                &lt; • &gt;
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#000E28] dark:text-white">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={handlePrevMonth}
                    title="Previous Month"
                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-[#0050CB] cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={handleNextMonth}
                    title="Next Month"
                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-[#0050CB] cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day} className="py-1">{day}</span>
              ))}
            </div>

            {/* Interactive Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold">
              {calendarDays.map((item, idx) => {
                const dayEvents = item.events;
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDateKey === item.dateKey;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDayClick(item)}
                    className={`relative h-8.5 w-8.5 mx-auto rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0050CB] text-white shadow-sm shadow-blue-500/40 font-black scale-105"
                        : item.isCurrentMonth
                        ? hasEvents
                          ? "text-[#000E28] dark:text-white font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        : "text-slate-300 dark:text-slate-600 font-normal hover:bg-slate-50 dark:hover:bg-slate-850"
                    }`}
                  >
                    <span className="leading-none text-[12px]">{item.day}</span>
                    
                    {/* Small Colored Dot indicator(s) under day */}
                    {hasEvents && !isSelected && (
                      <div className="flex items-center justify-center gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 2).map((ev, i) => (
                          <span
                            key={i}
                            className={`w-1 h-1 rounded-full ${ev.dotColor}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* White dot indicator when day is actively selected */}
                    {hasEvents && isSelected && (
                      <div className="flex items-center justify-center gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 2).map((_, i) => (
                          <span
                            key={i}
                            className="w-1 h-1 rounded-full bg-white/90"
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Events Drawer */}
            {selectedDateKey && (
              <div className="p-3 rounded-2xl bg-[#E5EEFF]/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 space-y-2.5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#0050CB] dark:text-blue-300">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{formatDateString(selectedDateKey)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDateKey(null)}
                    className="text-[11px] font-bold text-slate-400 hover:text-[#0050CB] cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateEvents.map((ev) => (
                      <div 
                        key={ev.id} 
                        className="p-2.5 rounded-xl bg-white dark:bg-[#07142F] border border-blue-100 dark:border-white/10 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${ev.categoryBg}`}>
                            {ev.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{ev.time}</span>
                        </div>
                        <p className="text-xs font-bold text-[#000E28] dark:text-white leading-snug">
                          {ev.title}
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[10.5px] text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800">
                          <span className="truncate max-w-[130px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#0050CB] shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReminder(ev.id, ev.title)}
                            className="text-[10.5px] font-bold text-[#0050CB] hover:underline cursor-pointer shrink-0"
                          >
                            {reminderMap[ev.id] ? "Saved ✓" : "+ Reminder"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-center space-y-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">No school events scheduled on this date.</p>
                    <button
                      type="button"
                      onClick={() => setSelectedDateKey(null)}
                      className="text-[11px] font-bold text-[#0050CB] hover:underline cursor-pointer"
                    >
                      Show all events
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Category Legend & Filter */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-400 px-1 mb-1">
                <span>CATEGORIES</span>
                {selectedCategory && (
                  <button 
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="text-[#0050CB] hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {categoryLegend.map((leg) => {
                const isCatActive = selectedCategory === leg.category;
                return (
                  <button
                    key={leg.label}
                    type="button"
                    onClick={() => {
                      setSelectedCategory((prev) => (prev === leg.category ? null : leg.category));
                    }}
                    className={`w-full flex items-center justify-between p-1.5 px-2 rounded-xl transition-colors cursor-pointer text-left ${
                      isCatActive
                        ? "bg-[#E5EEFF] dark:bg-blue-950/60 font-bold text-[#0050CB]"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${leg.color}`} />
                      <span className="text-[11.5px]">{leg.label}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">{leg.count}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* 2. STAY UPDATED NOTIFICATION CARD */}
          <div className="p-4.5 rounded-[24px] bg-[#EFF6FE]/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-[#0050CB] flex items-center justify-center shrink-0 shadow-2xs">
                <Bell className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#000E28] dark:text-white">
                  Stay Updated
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                  Enable notifications to get instant updates about upcoming events.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div 
              onClick={() => {
                setStayUpdatedEnabled((prev) => {
                  const next = !prev;
                  toast.success(next ? "Event updates enabled" : "Event updates muted");
                  return next;
                });
              }}
              className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer shrink-0 ${
                stayUpdatedEnabled ? "bg-[#0050CB]" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                  stayUpdatedEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
