"use client";

import React, { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Award, 
  FileText, 
  Check, 
  X, 
  Sparkles, 
  Users, 
  Settings, 
  Heart,
  ChevronDown,
  Lock,
  CalendarCheck,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import AppImage from "@/components/ui/AppImage";

interface EventItem {
  id: string;
  title: string;
  type: "Event" | "Exam" | "Reminder" | "Meeting" | "Holiday";
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  badgeColor: string;
  badgeBg: string;
  borderColor?: string;
  icon?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SHORT_MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

// Seed institutional events
const SEED_EVENTS: EventItem[] = [
  // September 2026
  {
    id: "ev-sep-1",
    title: "Teacher Meeting",
    type: "Meeting",
    date: "2026-09-01",
    time: "08:30 AM - 10:00 AM",
    location: "Staff Conference Room",
    badgeColor: "text-[#059669]",
    badgeBg: "bg-[#ECFDF5]",
    borderColor: "border-[#A7F3D0]",
    icon: "👤"
  },
  {
    id: "ev-sep-2",
    title: "Holiday (Ganesh Chaturthi)",
    type: "Holiday",
    date: "2026-09-02",
    time: "All Day",
    location: "School Closed",
    badgeColor: "text-[#7C3AED]",
    badgeBg: "bg-[#F3E8FF]",
    borderColor: "border-[#DDD6FE]",
    icon: "🎉"
  },
  {
    id: "ev-sep-4",
    title: "Phonics Check (LKG & UKG)",
    type: "Exam",
    date: "2026-09-04",
    time: "09:30 AM - 11:30 AM",
    location: "Primary Wing",
    badgeColor: "text-[#2563EB]",
    badgeBg: "bg-[#EFF6FF]",
    borderColor: "border-[#BFDBFE]",
    icon: "📝"
  },
  {
    id: "ev-sep-7",
    title: "Parent Teacher Meeting",
    type: "Meeting",
    date: "2026-09-07",
    time: "09:00 AM - 01:00 PM",
    location: "Classrooms",
    badgeColor: "text-[#E11D48]",
    badgeBg: "bg-[#FFF1F2]",
    borderColor: "border-[#FECDD3]",
    icon: "👥"
  },
  {
    id: "ev-sep-9",
    title: "Sports Day (Pre-KG to UKG)",
    type: "Event",
    date: "2026-09-09",
    time: "08:00 AM - 12:00 PM",
    location: "School Athletic Turf",
    badgeColor: "text-[#EA580C]",
    badgeBg: "bg-[#FFF7ED]",
    borderColor: "border-[#FED7AA]",
    icon: "🏆"
  },
  {
    id: "ev-sep-11",
    title: "Science Exhibition",
    type: "Event",
    date: "2026-09-11",
    time: "10:00 AM - 02:00 PM",
    location: "Science Labs & Hall",
    badgeColor: "text-[#0D9488]",
    badgeBg: "bg-[#F0FDFA]",
    borderColor: "border-[#99F6E4]",
    icon: "🔬"
  },
  {
    id: "ev-sep-14",
    title: "Rhyme Recitation (Pre-KG & LKG)",
    type: "Event",
    date: "2026-09-14",
    time: "09:00 AM - 11:00 AM",
    location: "Activity Hall",
    badgeColor: "text-[#2563EB]",
    badgeBg: "bg-[#EFF6FF]",
    borderColor: "border-[#BFDBFE]",
    icon: "📝"
  },
  {
    id: "ev-sep-16",
    title: "Workshop (Teachers)",
    type: "Meeting",
    date: "2026-09-16",
    time: "02:00 PM - 04:30 PM",
    location: "AV Seminar Hall",
    badgeColor: "text-[#7C3AED]",
    badgeBg: "bg-[#F3E8FF]",
    borderColor: "border-[#DDD6FE]",
    icon: "👥"
  },
  {
    id: "ev-sep-18",
    title: "Fee Due Date",
    type: "Reminder",
    date: "2026-09-18",
    time: "End of Day",
    location: "Accounts Office",
    badgeColor: "text-[#E11D48]",
    badgeBg: "bg-[#FFF1F2]",
    borderColor: "border-[#FECDD3]",
    icon: "💳"
  },
  {
    id: "ev-sep-20",
    title: "Holiday (Dussehra)",
    type: "Holiday",
    date: "2026-09-20",
    time: "All Day",
    location: "School Closed",
    badgeColor: "text-[#0284C7]",
    badgeBg: "bg-[#E0F2FE]",
    borderColor: "border-[#BAE6FD]",
    icon: "🎉"
  },
  {
    id: "ev-sep-22",
    title: "PTM Meeting",
    type: "Meeting",
    date: "2026-09-22",
    time: "09:30 AM - 12:30 PM",
    location: "Main Wing",
    badgeColor: "text-[#059669]",
    badgeBg: "bg-[#ECFDF5]",
    borderColor: "border-[#A7F3D0]",
    icon: "👥"
  },
  {
    id: "ev-sep-24",
    title: "Student Council Leadership",
    type: "Event",
    date: "2026-09-24",
    time: "10:00 AM - 12:00 PM",
    location: "Main Campus, Auditorium",
    badgeColor: "text-white",
    badgeBg: "bg-[#000E28]",
    borderColor: "border-[#000E28]",
    icon: "👥"
  },
  {
    id: "ev-sep-25",
    title: "UKG Early Numeracy & Phonics Term Assessment",
    type: "Exam",
    date: "2026-09-25",
    time: "10:00 AM - 01:00 PM",
    location: "Examination Hall A & B",
    badgeColor: "text-[#7C3AED]",
    badgeBg: "bg-[#F3E8FF]",
    borderColor: "border-[#DDD6FE]",
    icon: "📝"
  },
  {
    id: "ev-sep-28",
    title: "Inter-School Sports Track Trials & Athletic Heats",
    type: "Event",
    date: "2026-09-28",
    time: "08:30 AM - 03:00 PM",
    location: "Olympic Athletic Ground",
    badgeColor: "text-[#2563EB]",
    badgeBg: "bg-[#EFF6FF]",
    borderColor: "border-[#BFDBFE]",
    icon: "🏆"
  },
  {
    id: "ev-sep-29",
    title: "UKG Diagnostic Evaluation Catch-up",
    type: "Exam",
    date: "2026-09-29",
    time: "10:00 AM - 12:00 PM",
    location: "Examination Hall A",
    badgeColor: "text-[#7C3AED]",
    badgeBg: "bg-[#F3E8FF]",
    borderColor: "border-[#DDD6FE]",
    icon: "📝"
  },
  {
    id: "ev-sep-30",
    title: "Cultural Event & Art Exhibition",
    type: "Event",
    date: "2026-09-30",
    time: "04:00 PM - 06:00 PM",
    location: "Open Air Amphitheatre",
    badgeColor: "text-[#D97706]",
    badgeBg: "bg-[#FFFBEB]",
    borderColor: "border-[#FDE68A]",
    icon: "🎭"
  },
  // October 2026
  {
    id: "ev-oct-2",
    title: "Term 1 Tuition Fee Reconciliation Deadline",
    type: "Reminder",
    date: "2026-10-02",
    time: "All Day",
    location: "Accounts Dept. & Online Portal",
    badgeColor: "text-[#E11D48]",
    badgeBg: "bg-[#FFF1F2]",
    borderColor: "border-[#FECDD3]",
    icon: "💳"
  },
  {
    id: "ev-oct-2-hol",
    title: "Holiday (Gandhi Jayanti)",
    type: "Holiday",
    date: "2026-10-02",
    time: "All Day",
    location: "School Closed",
    badgeColor: "text-[#059669]",
    badgeBg: "bg-[#ECFDF5]",
    borderColor: "border-[#A7F3D0]",
    icon: "🕊️"
  },
  {
    id: "ev-oct-5",
    title: "Annual Day Celebration",
    type: "Event",
    date: "2026-10-05",
    time: "09:00 AM - 05:00 PM",
    location: "School Ground",
    badgeColor: "text-[#2563EB]",
    badgeBg: "bg-[#EFF6FF]",
    borderColor: "border-[#BFDBFE]",
    icon: "🌟"
  },
  {
    id: "ev-oct-12",
    title: "Term 1 Mid-Term Assessments",
    type: "Exam",
    date: "2026-10-12",
    time: "09:00 AM - 12:30 PM",
    location: "Main Exam Hall",
    badgeColor: "text-[#7C3AED]",
    badgeBg: "bg-[#F3E8FF]",
    borderColor: "border-[#DDD6FE]",
    icon: "📝"
  },
  {
    id: "ev-oct-24",
    title: "Holiday (Diwali Festival)",
    type: "Holiday",
    date: "2026-10-24",
    time: "All Day",
    location: "School Closed",
    badgeColor: "text-[#EA580C]",
    badgeBg: "bg-[#FFF7ED]",
    borderColor: "border-[#FED7AA]",
    icon: "🪔"
  },
  // November 2026
  {
    id: "ev-nov-14",
    title: "Children's Day Carnival",
    type: "Event",
    date: "2026-11-14",
    time: "08:30 AM - 02:00 PM",
    location: "School Athletic Turf",
    badgeColor: "text-[#059669]",
    badgeBg: "bg-[#ECFDF5]",
    borderColor: "border-[#A7F3D0]",
    icon: "🎈"
  }
];

export default function AcademicCalendarPage() {
  // Today's normalized date (Matches ERP system calendar date: 2026-09-29)
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [today]);

  // Current active view month/year (Defaults to current month: September 2026)
  const [viewDate, setViewDate] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [currentView, setCurrentView] = useState<"Month" | "Week" | "Day">("Month");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  
  // All Events State
  const [events, setEvents] = useState<EventItem[]>(SEED_EVENTS);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedEventModal, setSelectedEventModal] = useState<EventItem | null>(null);

  // Form State for Add Event
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState<"Event" | "Exam" | "Reminder" | "Meeting" | "Holiday">("Event");
  const [newEventDate, setNewEventDate] = useState(todayStr);
  const [newEventTime, setNewEventTime] = useState("10:00 AM - 12:00 PM");
  const [newEventLocation, setNewEventLocation] = useState("Main Campus, Auditorium");

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateStr(todayStr);
    toast.success("Navigated to today");
  };

  // Month information
  const currentYear = viewDate.getFullYear();
  const currentMonthIndex = viewDate.getMonth();
  const currentMonthName = MONTH_NAMES[currentMonthIndex];
  const academicYearLabel = currentMonthIndex >= 5 
    ? `${currentYear} - ${currentYear + 1}` 
    : `${currentYear - 1} - ${currentYear}`;

  // Check if viewing an entire month that has already finished
  const isEntireMonthPast = useMemo(() => {
    const lastDayOfMonth = new Date(currentYear, currentMonthIndex + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    return lastDayOfMonth < today;
  }, [currentYear, currentMonthIndex, today]);

  // Calendar Grid Calculation
  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sun, 6 = Sat
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonthIndex, 0).getDate();

    const cells: {
      dayNumber: number;
      dateStr: string;
      dateObj: Date;
      isCurrentMonth: boolean;
      isPast: boolean;
      isToday: boolean;
      events: EventItem[];
    }[] = [];

    // 1. Previous month trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(currentYear, currentMonthIndex - 1, dayNum);
      d.setHours(0, 0, 0, 0);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({
        dayNumber: dayNum,
        dateStr: dStr,
        dateObj: d,
        isCurrentMonth: false,
        isPast: d < today,
        isToday: dStr === todayStr,
        events: events.filter((e) => e.date === dStr),
      });
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(currentYear, currentMonthIndex, dayNum);
      d.setHours(0, 0, 0, 0);
      const dStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({
        dayNumber: dayNum,
        dateStr: dStr,
        dateObj: d,
        isCurrentMonth: true,
        isPast: d < today,
        isToday: dStr === todayStr,
        events: events.filter((e) => e.date === dStr),
      });
    }

    // 3. Next month leading days (Fill 35 or 42 grid slots)
    const targetSlots = cells.length <= 35 ? 35 : 42;
    const remaining = targetSlots - cells.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const d = new Date(currentYear, currentMonthIndex + 1, dayNum);
      d.setHours(0, 0, 0, 0);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({
        dayNumber: dayNum,
        dateStr: dStr,
        dateObj: d,
        isCurrentMonth: false,
        isPast: d < today,
        isToday: dStr === todayStr,
        events: events.filter((e) => e.date === dStr),
      });
    }

    return cells;
  }, [currentYear, currentMonthIndex, today, todayStr, events]);

  // Dynamic KPI Stats for the current viewed month
  const monthStats = useMemo(() => {
    const monthEvents = events.filter((ev) => {
      const evDate = new Date(ev.date);
      return evDate.getFullYear() === currentYear && evDate.getMonth() === currentMonthIndex;
    });

    const total = monthEvents.length;
    const completed = monthEvents.filter((ev) => ev.date < todayStr).length;
    const upcoming = monthEvents.filter((ev) => ev.date >= todayStr).length;
    const holidays = monthEvents.filter((ev) => ev.type === "Holiday").length;

    return { total, completed, upcoming, holidays };
  }, [events, currentYear, currentMonthIndex, todayStr]);

  // Sidebar Upcoming Events List (Filtered strictly for upcoming dates >= today)
  const upcomingEventsList = useMemo(() => {
    return events
      .filter((ev) => ev.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
  }, [events, todayStr]);

  // Open Add Event modal for a specific enabled date
  const handleOpenAddForDate = (dateStr: string) => {
    if (dateStr < todayStr) {
      toast.error("Cannot assign events to past dates. Please pick an upcoming date.", {
        id: "past-date-blocked",
      });
      return;
    }
    setNewEventDate(dateStr);
    setSelectedDateStr(dateStr);
    setShowAddModal(true);
  };

  // Submit new event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    // Strict validation: Block past dates
    if (newEventDate < todayStr) {
      toast.error("This date has already passed. Only upcoming dates can be assigned an event.");
      return;
    }

    let badgeColor = "text-[#2563EB]";
    let badgeBg = "bg-[#EFF6FF]";
    let borderColor = "border-[#BFDBFE]";
    let icon = "📅";

    if (newEventType === "Exam") {
      badgeColor = "text-[#7C3AED]";
      badgeBg = "bg-[#F3E8FF]";
      borderColor = "border-[#DDD6FE]";
      icon = "📝";
    } else if (newEventType === "Meeting") {
      badgeColor = "text-[#059669]";
      badgeBg = "bg-[#ECFDF5]";
      borderColor = "border-[#A7F3D0]";
      icon = "👥";
    } else if (newEventType === "Holiday") {
      badgeColor = "text-[#E11D48]";
      badgeBg = "bg-[#FFF1F2]";
      borderColor = "border-[#FECDD3]";
      icon = "🎉";
    } else if (newEventType === "Reminder") {
      badgeColor = "text-[#EA580C]";
      badgeBg = "bg-[#FFF7ED]";
      borderColor = "border-[#FED7AA]";
      icon = "💳";
    }

    const created: EventItem = {
      id: `ev-${Date.now()}`,
      title: newEventTitle.trim(),
      type: newEventType,
      date: newEventDate,
      time: newEventTime.trim() || "10:00 AM - 12:00 PM",
      location: newEventLocation.trim() || "Main Campus",
      badgeColor,
      badgeBg,
      borderColor,
      icon,
    };

    setEvents((prev) => [...prev, created]);
    toast.success(`Event "${created.title}" successfully scheduled!`);
    setShowAddModal(false);
    setNewEventTitle("");
  };

  return (
    <div className="space-y-6 font-sans pb-8 max-w-[1600px] mx-auto">
      {/* ========================================================
          1. TOP HERO ROW (Left Hero Card + Right KPI Card)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hero Card */}
        <div className="lg:col-span-7 xl:col-span-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EFF5FF] via-[#F4F8FF] to-[#E5EEFF] dark:from-[#001030] dark:via-[#001844] dark:to-[#002266] border border-blue-100/90 dark:border-blue-900/40 p-6 md:p-7 shadow-xs flex flex-col justify-between">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 lg:opacity-35 dark:opacity-40 pointer-events-none overflow-hidden flex items-center justify-end">
            <AppImage 
              src="/admin-hero-campus.jpg" 
              alt="Campus visual" 
              className="h-full w-full object-cover object-left mask-[linear-gradient(to_left,black,transparent)]"
            />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0050CB] to-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-[#0050CB]/25 shrink-0">
                <CalendarIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-[#000E28] tracking-tight">
                  Academic Calendar
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  View and manage academic schedule, events, holidays and important dates.
                </p>
                <p className="text-xs sm:text-sm text-slate-500 italic font-serif mt-2 tracking-wide">
                  Plan Today &nbsp;•&nbsp; Build Tomorrow
                </p>
              </div>
            </div>

            <div className="self-end mr-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-blue-100 text-xs font-bold text-[#0050CB] shadow-xs">
                Learning Never Stops ✍️
              </span>
            </div>
          </div>
        </div>

        {/* Right KPI & Academic Year Card */}
        <div className="lg:col-span-5 xl:col-span-4 rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-blue-200/80 text-[#0050CB] flex items-center justify-center shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#000E28] leading-tight">
                  {currentMonthName} {currentYear}
                </h2>
                <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                  Academic Year {academicYearLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setNewEventDate(todayStr);
                setShowAddModal(true);
              }}
              className="bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-md hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>

          {/* 4 Stat Metric Badges for the Viewed Month */}
          <div className="grid grid-cols-4 gap-2.5 mt-5">
            {/* Total Events */}
            <div className="bg-[#EFF6FF] border border-blue-100/80 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-[#0050CB]" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1 truncate w-full">
                Total Events
              </span>
              <span className="text-xl font-black text-slate-900 mt-0.5">{monthStats.total}</span>
            </div>

            {/* Completed */}
            <div className="bg-[#ECFDF5] border border-emerald-100/80 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1 truncate w-full">
                Completed
              </span>
              <span className="text-xl font-black text-slate-900 mt-0.5">{monthStats.completed}</span>
            </div>

            {/* Upcoming */}
            <div className="bg-[#FFF7ED] border border-amber-100/80 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
              <Clock className="w-4 h-4 text-[#D97706]" />
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-1 truncate w-full">
                Upcoming
              </span>
              <span className="text-xl font-black text-slate-900 mt-0.5">{monthStats.upcoming}</span>
            </div>

            {/* Holidays */}
            <div className="bg-[#FFF1F2] border border-rose-100/80 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
              <Heart className="w-4 h-4 text-[#E11D48]" />
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mt-1 truncate w-full">
                Holidays
              </span>
              <span className="text-xl font-black text-slate-900 mt-0.5">{monthStats.holidays}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. MAIN SECTION (Calendar Grid 68% + Right Column 32%)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Calendar View */}
        <div className="lg:col-span-8 space-y-3">
          {/* Calendar Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              {/* Previous Month Button */}
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs transition-all active:scale-95"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Next Month Button */}
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs transition-all active:scale-95"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <h2 className="text-lg font-bold text-[#000E28] ml-2">
                {currentMonthName} {currentYear}
              </h2>

              {/* Today Quick Jump */}
              <button
                type="button"
                onClick={handleGoToToday}
                className="ml-2 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors"
              >
                Today
              </button>
            </div>

            {/* View Switcher Pill */}
            <div className="bg-slate-100 p-0.5 rounded-full flex items-center border border-slate-200/80">
              <button
                type="button"
                onClick={() => setCurrentView("Month")}
                className={`px-4 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  currentView === "Month"
                    ? "bg-[#0050CB] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setCurrentView("Week")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  currentView === "Week"
                    ? "bg-[#0050CB] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setCurrentView("Day")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  currentView === "Day"
                    ? "bg-[#0050CB] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Day
              </button>
            </div>
          </div>

          {/* Past Month Notice Banner */}
          {isEntireMonthPast && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Past Month:</strong> All dates in {currentMonthName} {currentYear} are finished and locked. New events can only be scheduled for upcoming dates.
              </span>
            </div>
          )}

          {/* Calendar Table Grid */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50/70 text-center py-2.5">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-xs font-bold text-slate-600">
                  {day}
                </div>
              ))}
            </div>

            {/* MONTH VIEW */}
            {currentView === "Month" && (
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 text-xs">
                {calendarCells.map((cell, idx) => {
                  const isPast = cell.isPast;
                  const isToday = cell.isToday;
                  const isSelected = cell.dateStr === selectedDateStr;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedDateStr(cell.dateStr);
                        if (isPast) {
                          toast("Past date: Event scheduling is locked.", {
                            icon: "🔒",
                            id: "locked-date",
                          });
                        } else {
                          handleOpenAddForDate(cell.dateStr);
                        }
                      }}
                      className={`min-h-[96px] p-2 flex flex-col justify-between transition-all relative group ${
                        !cell.isCurrentMonth
                          ? "bg-slate-50/30 text-slate-300"
                          : isPast
                          ? "bg-slate-50/60 text-slate-400 cursor-not-allowed opacity-75"
                          : "bg-white hover:bg-[#E5EEFF]/40 cursor-pointer"
                      } ${isSelected && !isPast ? "ring-2 ring-inset ring-[#0050CB] bg-blue-50/20" : ""}`}
                    >
                      {/* Top Header of the Day Cell */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {isToday ? (
                            <span className="w-6 h-6 rounded-full bg-[#0050CB] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              {cell.dayNumber}
                            </span>
                          ) : (
                            <span className={`font-semibold ${
                              !cell.isCurrentMonth 
                                ? "text-slate-300" 
                                : isPast 
                                ? "text-slate-400" 
                                : "text-slate-700"
                            }`}>
                              {cell.dayNumber}
                            </span>
                          )}

                          {!cell.isCurrentMonth && (
                            <span className="text-[10px] text-slate-300 font-normal">
                              • {cell.dayNumber > 15 ? "(Prev)" : "(Next)"}
                            </span>
                          )}

                          {isToday && (
                            <span className="text-[9px] font-black uppercase text-[#0050CB] bg-[#E5EEFF] px-1 py-0.2 rounded-sm">
                              Today
                            </span>
                          )}
                        </div>

                        {/* Status Icon / Quick Add on Enabled Dates */}
                        {isPast ? (
                          <span title="Date finished & locked">
                            <Lock className="w-3 h-3 text-slate-300" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddForDate(cell.dateStr);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-[#0050CB] hover:text-white text-[#0050CB] transition-all cursor-pointer"
                            title={`Assign Event to ${cell.dateStr}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Events listed in this cell */}
                      <div className="mt-1 space-y-1 overflow-hidden">
                        {cell.events.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEventModal(ev);
                            }}
                            className={`px-1.5 py-0.5 rounded-md border text-[10px] font-semibold truncate cursor-pointer transition-transform hover:scale-101 ${
                              ev.badgeBg
                            } ${ev.badgeColor} ${ev.borderColor || "border-transparent"} ${
                              isPast ? "opacity-60" : "shadow-2xs"
                            }`}
                            title={`${ev.title} (${ev.time})`}
                          >
                            <span>{ev.icon || "•"}</span> {ev.title}
                          </div>
                        ))}
                      </div>

                      {/* Bottom indicator for upcoming empty day */}
                      {!isPast && cell.events.length === 0 && (
                        <div className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-[#0050CB] mt-auto self-end flex items-center gap-0.5">
                          <span>+ Assign</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* WEEK VIEW */}
            {currentView === "Week" && (
              <div className="p-4 space-y-3">
                <div className="text-xs text-slate-500 font-medium">
                  Showing 7-day schedule for the selected period ({currentMonthName} {currentYear}):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                  {calendarCells.slice(0, 7).map((cell, idx) => (
                    <div
                      key={idx}
                      onClick={() => !cell.isPast && handleOpenAddForDate(cell.dateStr)}
                      className={`p-3 rounded-xl border text-xs min-h-[140px] flex flex-col justify-between ${
                        cell.isPast
                          ? "bg-slate-50/70 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-white border-blue-200 hover:bg-blue-50/40 cursor-pointer shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b pb-1.5 border-slate-100">
                        <span className="font-bold text-slate-700">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][idx]} {cell.dayNumber}
                        </span>
                        {cell.isPast ? (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#0050CB] font-bold">+ Add</span>
                        )}
                      </div>
                      <div className="space-y-1 my-2">
                        {cell.events.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEventModal(ev);
                            }}
                            className={`p-1 rounded-md text-[10px] font-semibold truncate ${ev.badgeBg} ${ev.badgeColor}`}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {cell.events.length} event(s)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DAY VIEW */}
            {currentView === "Day" && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#000E28]">
                      Schedule for {selectedDateStr}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedDateStr < todayStr ? "⚠️ Past Date — Event creation is disabled." : "Active upcoming date — You can assign academic events."}
                    </p>
                  </div>
                  {selectedDateStr >= todayStr && (
                    <button
                      type="button"
                      onClick={() => handleOpenAddForDate(selectedDateStr)}
                      className="px-3.5 py-1.5 bg-[#0050CB] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign Event to this Day</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {events.filter((e) => e.date === selectedDateStr).length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No events scheduled for this day.
                    </div>
                  ) : (
                    events
                      .filter((e) => e.date === selectedDateStr)
                      .map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEventModal(ev)}
                          className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{ev.icon || "📅"}</span>
                            <div>
                              <h4 className="font-bold text-xs text-slate-800">{ev.title}</h4>
                              <p className="text-[11px] text-slate-400">{ev.time} • {ev.location}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${ev.badgeBg} ${ev.badgeColor}`}>
                            {ev.type}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Events & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Upcoming Events & Exams */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#000E28]">
                Upcoming Events & Exams
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {upcomingEventsList.length} Upcoming
              </span>
            </div>

            {/* Event List */}
            <div className="divide-y divide-slate-100 mt-1">
              {upcomingEventsList.map((ev) => {
                const dateParts = ev.date.split("-");
                const mIdx = parseInt(dateParts[1], 10) - 1;
                const monthShort = SHORT_MONTHS[mIdx] || "SEP";
                const dayNum = dateParts[2];

                return (
                  <div 
                    key={ev.id}
                    onClick={() => setSelectedEventModal(ev)}
                    className="py-3 flex items-center justify-between group hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Date Pill Box */}
                      <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-blue-100 text-center flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-[#0050CB] uppercase tracking-wider leading-none">
                          {monthShort}
                        </span>
                        <span className="text-base font-black text-slate-900 leading-tight mt-0.5">
                          {dayNum}
                        </span>
                      </div>

                      {/* Event Details */}
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#0050CB] transition-colors">
                          {ev.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                          <span>🕒</span> {ev.time}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                          <span>📍</span> {ev.location}
                        </p>
                      </div>
                    </div>

                    {/* Badge & Arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ev.badgeBg} ${ev.badgeColor}`}>
                        {ev.type}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: ⚡ Quick Actions */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#000E28] mb-3 flex items-center gap-1.5">
              <span>⚡</span> Quick Actions
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              {/* 1. Add Event */}
              <button
                type="button"
                onClick={() => {
                  setNewEventDate(todayStr);
                  setShowAddModal(true);
                }}
                className="bg-[#EFF6FF] hover:bg-blue-100/70 border border-blue-100/70 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-102"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0050CB] text-white flex items-center justify-center shadow-xs">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">Add Event</span>
              </button>

              {/* 2. Add Holiday */}
              <button
                type="button"
                onClick={() => {
                  setNewEventType("Holiday");
                  setNewEventDate(todayStr);
                  setShowAddModal(true);
                }}
                className="bg-[#FAF5FF] hover:bg-purple-100/70 border border-purple-100/70 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-102"
              >
                <div className="w-8 h-8 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">Add Holiday</span>
              </button>

              {/* 3. View Timetable */}
              <Link
                href="/dashboard/academic?tab=timetable"
                className="bg-[#F0FDF4] hover:bg-emerald-100/70 border border-emerald-100/70 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-102"
              >
                <div className="w-8 h-8 rounded-lg bg-[#059669] text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">View Timetable</span>
              </Link>

              {/* 4. Manage Exams */}
              <Link
                href="/dashboard/online-exams"
                className="bg-[#FFF7ED] hover:bg-orange-100/70 border border-orange-100/70 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-102"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EA580C] text-white flex items-center justify-center shadow-xs">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">Manage Exams</span>
              </Link>

              {/* 5. Academic Reports */}
              <Link
                href="/dashboard/reports?tab=academic"
                className="bg-[#FFF1F2] hover:bg-rose-100/70 border border-rose-100/70 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-102"
              >
                <div className="w-8 h-8 rounded-lg bg-[#E11D48] text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">Academic Reports</span>
              </Link>

              {/* 6. Settings */}
              <Link
                href="/dashboard/settings"
                className="bg-[#F8FAFC] hover:bg-slate-200/70 border border-slate-200/70 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group hover:scale-102"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shadow-xs">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. BOTTOM SECTION: Class Schedule + Academic Overview
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Class Schedule */}
        <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#000E28] flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#0050CB]" />
              Today's Class Schedule ({todayStr})
            </h3>
            <Link
              href="/dashboard/academic?tab=timetable"
              className="text-xs font-semibold text-[#0050CB] hover:underline cursor-pointer"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            <div className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium w-36">08:00 AM - 09:00 AM</span>
              <span className="font-bold text-slate-800 flex-1 px-3">Early Numeracy & Math</span>
              <span className="text-slate-500 font-medium px-3">LKG - A</span>
              <span className="bg-[#ECFDF5] text-[#059669] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                Ongoing
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium w-36">09:15 AM - 10:15 AM</span>
              <span className="font-bold text-slate-800 flex-1 px-3">Phonics & Rhymes</span>
              <span className="text-slate-500 font-medium px-3">Pre-KG - A</span>
              <span className="bg-[#EFF6FF] text-[#2563EB] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                Upcoming
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium w-36">10:30 AM - 11:30 AM</span>
              <span className="font-bold text-slate-800 flex-1 px-3">General Awareness (EVS)</span>
              <span className="text-slate-500 font-medium px-3">UKG - A</span>
              <span className="bg-slate-100 text-slate-500 font-semibold text-[10px] px-2.5 py-0.5 rounded-full">
                Not Started
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium w-36">11:45 AM - 12:45 PM</span>
              <span className="font-bold text-slate-800 flex-1 px-3">Art & Craft Discovery</span>
              <span className="text-slate-500 font-medium px-3">LKG - B</span>
              <span className="bg-slate-100 text-slate-500 font-semibold text-[10px] px-2.5 py-0.5 rounded-full">
                Not Started
              </span>
            </div>
          </div>
        </div>

        {/* Right: Academic Overview */}
        <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#000E28] flex items-center gap-2">
              <span>📊</span> Academic Overview
            </h3>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 text-xs text-slate-600 bg-white font-medium">
              <span>{currentMonthName} {currentYear}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-center">
            {/* Gauge 1: Classes Conducted */}
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="#E2E8F0" strokeWidth="4" fill="none" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#059669"
                    strokeWidth="4"
                    strokeDasharray="163"
                    strokeDashoffset={163 - (163 * 84) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <span className="absolute text-xs font-black text-slate-900">84%</span>
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-2">Classes Conducted</span>
              <span className="text-[11px] text-slate-400 font-semibold">20 / 24</span>
            </div>

            {/* Gauge 2: Attendance Rate */}
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="#E2E8F0" strokeWidth="4" fill="none" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#0050CB"
                    strokeWidth="4"
                    strokeDasharray="163"
                    strokeDashoffset={163 - (163 * 72) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <span className="absolute text-xs font-black text-slate-900">72%</span>
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-2">Attendance Rate</span>
              <span className="text-[11px] text-slate-400 font-semibold">1,248 / 1,730</span>
            </div>

            {/* Gauge 3: Holidays */}
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[#FAF5FF] border-2 border-[#7C3AED]/40 flex flex-col items-center justify-center text-[#7C3AED]">
                  <span className="text-base font-black leading-none">{monthStats.holidays}</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-2">Holidays</span>
              <span className="text-[11px] text-slate-400 font-semibold">{currentMonthName}</span>
            </div>

            {/* Gauge 4: Events */}
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[#FFF7ED] border-2 border-[#EA580C]/40 flex flex-col items-center justify-center text-[#EA580C]">
                  <span className="text-base font-black leading-none">{monthStats.total}</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-2">Total Events</span>
              <span className="text-[11px] text-slate-400 font-semibold">{currentMonthName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. FOOTER
      ======================================================== */}
      <footer className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <p>GGPS School ERP © 2026. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed for a better learning experience <span>🤍</span>
        </p>
      </footer>

      {/* ========================================================
          5. ADD EVENT MODAL (Enforces Upcoming Dates Only)
      ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#000E28]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0050CB] text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#000E28]">Schedule Academic Event</h3>
                  <p className="text-[11px] text-slate-400">Only upcoming dates can be assigned</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Science Fair / PTM Meeting / Term Assessment"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0050CB]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0050CB]"
                  >
                    <option value="Event">Event</option>
                    <option value="Exam">Exam / Assessment</option>
                    <option value="Meeting">Meeting / PTM</option>
                    <option value="Holiday">School Holiday</option>
                    <option value="Reminder">Administrative Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date <span className="text-rose-500">*</span>
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(Upcoming only)</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={newEventDate}
                    onChange={(e) => {
                      if (e.target.value < todayStr) {
                        toast.error("Please pick today or an upcoming date.");
                        return;
                      }
                      setNewEventDate(e.target.value);
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0050CB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="10:00 AM - 12:00 PM"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0050CB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    placeholder="Auditorium / Ground / Lab"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0050CB]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0050CB] hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          6. EVENT DETAILS MODAL
      ======================================================== */}
      {selectedEventModal && (
        <div className="fixed inset-0 bg-[#000E28]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${selectedEventModal.badgeBg} ${selectedEventModal.badgeColor}`}>
                {selectedEventModal.type}
              </span>
              <button
                type="button"
                onClick={() => setSelectedEventModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-bold text-[#000E28] mb-3">
              {selectedEventModal.title}
            </h3>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Date: <strong>{selectedEventModal.date}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Time: <strong>{selectedEventModal.time}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Venue: <strong>{selectedEventModal.location}</strong></span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEventModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0050CB] text-white hover:bg-blue-700 cursor-pointer transition-colors"
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
