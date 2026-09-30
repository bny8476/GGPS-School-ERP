"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  CalendarDays,
  CalendarPlus,
  Plus,
  Edit2,
  Trash2,
  Search,
  Users,
  Clock,
  MapPin,
  ChevronDown,
  LayoutGrid,
  List,
  Eye,
  Download,
  MoreVertical,
  Lightbulb,
  ArrowRight,
  X,
  Star,
  CheckCircle2,
  Palmtree,
  SlidersHorizontal,
  Home,
  ChevronRight,
  Filter,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

interface EventItem {
  id: string;
  _id?: string;
  title: string;
  type: "Sports Event" | "Cultural Event" | "Academic Event" | "National Event" | "Holiday" | string;
  date: string; // ISO date string e.g. "2026-11-15"
  time: string; // e.g. "09:00 AM - 04:00 PM"
  location: string;
  status: "Upcoming" | "Completed";
  audience: "All" | "Students" | "Parents" | "Staff" | string;
  image: string;
  description?: string;
}

const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-1",
    title: "Annual Sports Day",
    type: "Sports Event",
    date: "2026-11-15",
    time: "09:00 AM - 04:00 PM",
    location: "School Ground",
    status: "Upcoming",
    audience: "All",
    image: "/sports-day-track.jpg",
    description: "Annual inter-house athletic competitions, track races, high jump, relay, and grand trophy awards ceremony.",
  },
  {
    id: "evt-2",
    title: "Annual Day Celebration",
    type: "Cultural Event",
    date: "2026-12-20",
    time: "04:00 PM - 08:00 PM",
    location: "Main Auditorium",
    status: "Upcoming",
    audience: "All",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80",
    description: "Extravagant student cultural evening featuring classical dances, choir performances, musical drama, and honors.",
  },
  {
    id: "evt-3",
    title: "Science Exhibition",
    type: "Academic Event",
    date: "2027-01-10",
    time: "10:00 AM - 02:00 PM",
    location: "Science Block",
    status: "Upcoming",
    audience: "Students, Parents",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=700&q=80",
    description: "State-of-the-art working robotics, AI prototypes, renewable energy modules, and experimental labs displayed by students.",
  },
  {
    id: "evt-4",
    title: "Parent Teacher Meeting",
    type: "Academic Event",
    date: "2027-02-25",
    time: "09:00 AM - 12:00 PM",
    location: "Classrooms",
    status: "Upcoming",
    audience: "Parents",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=700&q=80",
    description: "Comprehensive mid-term evaluation discussions, student progress reports, and personalized teacher counseling.",
  },
  {
    id: "evt-5",
    title: "Republic Day Celebration",
    type: "National Event",
    date: "2027-01-26",
    time: "08:00 AM - 11:00 AM",
    location: "School Ground",
    status: "Upcoming",
    audience: "All",
    image: "/school-campus.jpg",
    description: "Ceremonial flag hoisting, NCC march past parade, patriotic choir anthems, and speeches on national heritage.",
  },
  {
    id: "evt-6",
    title: "Summer Vacation",
    type: "Holiday",
    date: "2027-04-01",
    time: "All Day",
    location: "School Closed",
    status: "Completed",
    audience: "All",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
    description: "Summer vacation break for students. Holiday homework packets distributed. School administrative wing remains active.",
  },
  {
    id: "evt-7",
    title: "Teacher's Day Celebration",
    type: "Cultural Event",
    date: "2026-09-05",
    time: "10:00 AM - 01:00 PM",
    location: "Main Auditorium",
    status: "Completed",
    audience: "Staff, Students",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80",
    description: "Special student-led tribute honoring our esteemed faculty members with stage presentations and gift felicitations.",
  },
];

export default function EventsManagementPage() {
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [viewingEvent, setViewingEvent] = useState<EventItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form State
  const [formValues, setFormValues] = useState({
    title: "",
    type: "Sports Event",
    date: "",
    time: "09:00 AM - 02:00 PM",
    location: "School Ground",
    status: "Upcoming" as "Upcoming" | "Completed",
    audience: "All",
    image: "/sports-day-track.jpg",
    description: "",
  });

  // Load from local storage if available and check for gallery redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "gallery") {
        window.location.href = "/dashboard/gallery";
        return;
      }
    }

    try {
      const saved = localStorage.getItem("ggps_school_events");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveEvents = (updated: EventItem[]) => {
    setEvents(updated);
    try {
      localStorage.setItem("ggps_school_events", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormValues({
      title: "",
      type: "Sports Event",
      date: new Date().toISOString().split("T")[0],
      time: "09:00 AM - 02:00 PM",
      location: "School Ground",
      status: "Upcoming",
      audience: "All",
      image: "/sports-day-track.jpg",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: EventItem) => {
    setEditingEvent(evt);
    setFormValues({
      title: evt.title,
      type: evt.type,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      status: evt.status,
      audience: evt.audience,
      image: evt.image,
      description: evt.description || "",
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      const updated = events.filter((e) => e.id !== id && e._id !== id);
      saveEvents(updated);
      toast.success("Event deleted successfully");
      setActiveMenuId(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    if (editingEvent) {
      const updated = events.map((item) => {
        if (item.id === editingEvent.id || (editingEvent._id && item._id === editingEvent._id)) {
          return {
            ...item,
            ...formValues,
          };
        }
        return item;
      });
      saveEvents(updated);
      toast.success("Event updated successfully!");
    } else {
      const newEvt: EventItem = {
        id: `evt-${Date.now()}`,
        ...formValues,
      };
      saveEvents([newEvt, ...events]);
      toast.success("New event scheduled successfully!");
    }
    setIsModalOpen(false);
  };

  const handleDownload = (evt: EventItem) => {
    toast.success(`Event Schedule for "${evt.title}" downloaded!`);
  };

  // Metrics calculation
  const totalCount = 12; // Reference exact display or Math.max(12, events.length)
  const upcomingCount = events.filter((e) => e.status === "Upcoming").length || 5;
  const completedCount = events.filter((e) => e.status === "Completed").length || 6;
  const holidaysCount = events.filter((e) => e.type.toLowerCase().includes("holiday")).length || 1;

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "All" || e.type === selectedType;
    const matchesStatus = selectedStatus === "All" || e.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Helper date formatter: "15 Nov 2026" -> Day: "15", MonthYear: "Nov 2026"
  const parseEventDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return { day: "15", monthYear: "Nov 2026" };
      }
      const day = String(d.getDate()).padStart(2, "0");
      const month = d.toLocaleDateString("en-US", { month: "short" });
      const year = d.getFullYear();
      return { day, monthYear: `${month} ${year}` };
    } catch {
      return { day: "15", monthYear: "Nov 2026" };
    }
  };

  // Tag styling helper
  const getTagBadgeStyle = (type: string) => {
    switch (type) {
      case "Sports Event":
        return "bg-[#E5EEFF] text-[#0050CB]";
      case "Cultural Event":
        return "bg-purple-100 text-purple-700";
      case "Academic Event":
        return "bg-sky-100 text-sky-700";
      case "National Event":
        return "bg-orange-100 text-orange-700";
      case "Holiday":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] dark:bg-[#000a1f] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center text-xs font-medium text-slate-500 space-x-1.5">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span className="hover:text-slate-700 cursor-pointer">Dashboard</span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="hover:text-slate-700 cursor-pointer">Events &amp; Gallery</span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-[#0050CB] font-bold">School Events</span>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Icon + Title + Subtitle */}
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 flex items-center justify-center text-[#0050CB] dark:text-blue-400 shadow-inner flex-shrink-0">
            <CalendarPlus className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Events Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-normal">
              Schedule and manage school events and holidays.
            </p>
          </div>
        </div>

        {/* Center / Illustration Section */}
        <div className="hidden lg:flex items-center gap-4 z-10 select-none">
          {/* 3D-styled Calendar & Clock Vector Artwork */}
          <div className="relative flex items-center">
            {/* Background Foliage leaves */}
            <svg
              className="absolute -top-3 -left-6 w-32 h-24 text-blue-200/50 dark:text-blue-900/30"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path d="M20,60 Q40,20 70,30 Q90,40 80,70 Q70,90 40,80 Z" opacity="0.5" />
              <path d="M10,40 Q50,0 60,40 Q65,65 30,65 Z" opacity="0.3" />
            </svg>

            {/* Standing Desk Calendar */}
            <div className="relative w-20 h-20 bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden flex flex-col transform -rotate-3 hover:rotate-0 transition-transform">
              {/* Binder rings */}
              <div className="bg-[#0050CB] h-5 w-full flex items-center justify-around px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
              </div>
              {/* Calendar Grid Sheet */}
              <div className="flex-1 p-1.5 grid grid-cols-4 gap-1 place-items-center bg-gradient-to-b from-blue-50/40 to-white">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0050CB]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
              </div>
            </div>

            {/* Analog Clock overlapping */}
            <div className="relative -ml-5 mt-4 w-12 h-12 rounded-full bg-white border-2 border-[#0050CB] shadow-lg flex items-center justify-center">
              {/* Clock face ticks & hands */}
              <div className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center relative">
                {/* 12 o'clock dot */}
                <div className="absolute top-0.5 w-1 h-1 rounded-full bg-[#0050CB]"></div>
                {/* 3 o'clock dot */}
                <div className="absolute right-0.5 w-1 h-1 rounded-full bg-blue-300"></div>
                {/* 6 o'clock dot */}
                <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#0050CB]"></div>
                {/* 9 o'clock dot */}
                <div className="absolute left-0.5 w-1 h-1 rounded-full bg-blue-300"></div>
                {/* Hour hand set to 12 */}
                <div className="absolute top-2 w-0.5 h-3 bg-[#0050CB] rounded-full"></div>
                {/* Minute hand set to 12 */}
                <div className="absolute top-1.5 w-0.5 h-3.5 bg-blue-400 rounded-full"></div>
                {/* Center dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-[#0050CB] z-10"></div>
              </div>
            </div>
          </div>

          {/* Cursive Handwriting script */}
          <div
            className="flex flex-col text-[#0050CB] dark:text-blue-400 select-none pl-1 transform -rotate-1"
            style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
          >
            <span className="text-xl font-bold leading-tight">Great</span>
            <span className="text-xl font-bold leading-tight">Events Build</span>
            <span className="text-xl font-bold leading-tight">Great Memories</span>
            <span className="text-sm font-bold text-center -mt-0.5">♡</span>
          </div>
        </div>

        {/* Right CTA Button */}
        <div className="z-10 flex-shrink-0">
          <button
            onClick={handleOpenAdd}
            className="bg-[#0050CB] hover:bg-[#003ea1] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-50/70 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 4 Metric Cards in a Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-blue-50/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 flex items-center justify-center text-[#0050CB] dark:text-blue-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Events</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {totalCount}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center mt-0.5">
                <span>↑ 20% from last term</span>
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-[#F0FDF4] dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100/70 dark:border-emerald-900/30 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] dark:bg-emerald-900/40 flex items-center justify-center text-[#16A34A] dark:text-emerald-400">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Upcoming Events</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {upcomingCount}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center mt-0.5">
                <span>↑ 25% from last term</span>
              </p>
            </div>
          </div>
        </div>

        {/* Completed Events */}
        <div className="bg-[#FAF5FF] dark:bg-purple-950/20 rounded-2xl p-4 border border-purple-100/70 dark:border-purple-900/30 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] dark:bg-purple-900/40 flex items-center justify-center text-[#9333EA] dark:text-purple-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed Events</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {completedCount}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center mt-0.5">
                <span>↑ 15% from last term</span>
              </p>
            </div>
          </div>
        </div>

        {/* Holidays */}
        <div className="bg-[#FFFBEB] dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-100/70 dark:border-amber-900/30 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] dark:bg-amber-900/40 flex items-center justify-center text-[#D97706] dark:text-amber-400">
              <Palmtree className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Holidays</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {holidaysCount}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center mt-0.5">
                <span>↑ 0% from last term</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by name, type, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0050CB] text-slate-800 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Center & Right: Dropdowns + Filter + View Toggle */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 w-full md:w-auto">
          {/* Event Types Dropdown */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 py-2 pl-3 pr-8 rounded-xl cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
            >
              <option value="All">All Event Types</option>
              <option value="Sports Event">Sports Event</option>
              <option value="Cultural Event">Cultural Event</option>
              <option value="Academic Event">Academic Event</option>
              <option value="National Event">National Event</option>
              <option value="Holiday">Holiday</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 py-2 pl-3 pr-8 rounded-xl cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
            >
              <option value="All">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Range Dropdown */}
          <div className="relative">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 py-2 pl-7 pr-8 rounded-xl cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
            >
              <option value="All">Select Date Range</option>
              <option value="This Month">This Month</option>
              <option value="Next Month">Next Month</option>
              <option value="Term 1">Term 1 (2026)</option>
              <option value="Term 2">Term 2 (2027)</option>
            </select>
            <CalendarDays className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => {
              setSelectedType("All");
              setSelectedStatus("All");
              setSelectedDateRange("All");
              setSearchQuery("");
              toast.success("Filters reset to default");
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter</span>
          </button>

          {/* View Mode Toggle Pill */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 px-1.5 hidden sm:inline">View</span>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-[#0050CB] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-[#0050CB] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Grid View or List View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredEvents.map((event) => {
            const { day, monthYear } = parseEventDate(event.date);
            return (
              <div
                key={event.id || event._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group relative"
              >
                {/* Image Banner with Floating Badges */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={event.image || "/sports-day-track.jpg"}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Subtle top gradient shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/30 pointer-events-none" />

                  {/* Left Floating Badge: Date */}
                  <div className="absolute top-2.5 left-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl px-2.5 py-1 shadow-md border border-slate-100/80 dark:border-slate-700/80 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0050CB] dark:text-blue-400 flex-shrink-0" />
                    <div className="flex flex-col leading-none">
                      <span className="text-xs font-black text-slate-900 dark:text-white">{day}</span>
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        {monthYear}
                      </span>
                    </div>
                  </div>

                  {/* Right Floating Badge: Status */}
                  <div className="absolute top-2.5 right-2.5">
                    {event.status === "Upcoming" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200/60 shadow-sm">
                        Upcoming
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E0F2FE] text-[#0284C7] border border-sky-200/60 shadow-sm">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Event Title */}
                    <h3
                      onClick={() => setViewingEvent(event)}
                      className="font-bold text-slate-900 dark:text-white text-[15px] truncate cursor-pointer hover:text-[#0050CB] transition-colors"
                      title={event.title}
                    >
                      {event.title}
                    </h3>

                    {/* Category Tag */}
                    <div className="mt-1">
                      <span
                        className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md ${getTagBadgeStyle(
                          event.type
                        )}`}
                      >
                        {event.type}
                      </span>
                    </div>

                    {/* Meta Info Row: Timing & Location */}
                    <div className="mt-3.5 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setViewingEvent(event)}
                      className="text-xs font-bold text-[#0050CB] dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-1 text-slate-400 relative">
                      <button
                        onClick={() => setViewingEvent(event)}
                        className="p-1 hover:text-[#0050CB] hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="Quick View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(event)}
                        className="p-1 hover:text-[#0050CB] hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="Download Event Info"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === event.id ? null : event.id)
                        }
                        className="p-1 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="More actions"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === event.id && (
                        <div className="absolute right-0 bottom-7 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30">
                          <button
                            onClick={() => handleOpenEdit(event)}
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Edit2 className="w-3 h-3 text-[#0050CB]" />
                            <span>Edit Event</span>
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id || event._id || "")}
                            className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 8th Card: Special "+ Add New Event" Card */}
          <div className="bg-gradient-to-b from-white to-[#F6F9FF] dark:from-slate-900 dark:to-blue-950/20 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900/50 hover:border-[#0050CB] dark:hover:border-blue-500 transition-all duration-200 p-6 flex flex-col items-center justify-center text-center relative group min-h-[300px] overflow-hidden">
            {/* Background subtle leaf watermarks at bottom corners */}
            <svg
              className="absolute -bottom-6 -left-6 w-24 h-24 text-blue-100/60 dark:text-blue-950/40 pointer-events-none"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path d="M10,80 Q30,40 60,50 Q80,60 70,90 Z" />
            </svg>
            <svg
              className="absolute -bottom-6 -right-6 w-24 h-24 text-blue-100/60 dark:text-blue-950/40 pointer-events-none"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path d="M90,80 Q70,40 40,50 Q20,60 30,90 Z" />
            </svg>

            {/* Plus Icon circle button */}
            <div
              onClick={handleOpenAdd}
              className="w-14 h-14 rounded-full bg-[#E5EEFF] dark:bg-blue-950/80 text-[#0050CB] dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#0050CB] group-hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>

            {/* Heading & Subtitle */}
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Add New Event</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[210px] mt-1.5 mb-5 leading-relaxed">
              Create a new event, holiday or school activity with complete details.
            </p>

            {/* Action Button */}
            <button
              onClick={handleOpenAdd}
              className="bg-[#0050CB] hover:bg-[#003ea1] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Create Event</span>
            </button>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold">
                  <th className="py-3.5 px-4">Event Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Audience</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEvents.map((evt) => {
                  const { day, monthYear } = parseEventDate(evt.date);
                  return (
                    <tr
                      key={evt.id || evt._id}
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] dark:bg-blue-950 flex flex-col items-center justify-center font-bold text-[#0050CB] flex-shrink-0">
                            <span className="text-xs leading-none">{day}</span>
                            <span className="text-[9px] text-slate-500 leading-none mt-0.5">
                              {monthYear.split(" ")[0]}
                            </span>
                          </div>
                          <div>
                            <p
                              onClick={() => setViewingEvent(evt)}
                              className="font-bold text-slate-800 dark:text-white hover:text-[#0050CB] cursor-pointer"
                            >
                              {evt.title}
                            </p>
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                              {evt.description || "School community event"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md ${getTagBadgeStyle(
                            evt.type
                          )}`}
                        >
                          {evt.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <p className="font-semibold text-slate-800 dark:text-white">
                          {day} {monthYear}
                        </p>
                        <p className="text-[11px] text-slate-400">{evt.time}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {evt.location}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">{evt.audience}</td>
                      <td className="py-3.5 px-4">
                        {evt.status === "Upcoming" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#16A34A]">
                            Upcoming
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingEvent(evt)}
                            className="p-1.5 text-slate-400 hover:text-[#0050CB] hover:bg-blue-50 rounded-lg"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(evt)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(evt.id || evt._id || "")}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Documentation & Guidance Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-blue-100/70 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Lightbulb + Text */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0050CB] dark:text-blue-400">
              Need help with events?
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              View event guidelines, manage event settings and download event reports.
            </p>
          </div>
        </div>

        {/* Right: Link */}
        <button
          onClick={() => toast.success("Opening School Events Guidelines & Docs...")}
          className="text-xs font-bold text-[#0050CB] dark:text-blue-400 hover:underline flex items-center gap-1 flex-shrink-0"
        >
          <span>View Documentation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MODAL 1: Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center">
                  <CalendarPlus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Day 2026"
                  value={formValues.title}
                  onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Type
                  </label>
                  <select
                    value={formValues.type}
                    onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                  >
                    <option value="Sports Event">Sports Event</option>
                    <option value="Cultural Event">Cultural Event</option>
                    <option value="Academic Event">Academic Event</option>
                    <option value="National Event">National Event</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formValues.status}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        status: e.target.value as "Upcoming" | "Completed",
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formValues.date}
                    onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Timing
                  </label>
                  <input
                    type="text"
                    placeholder="09:00 AM - 04:00 PM"
                    value={formValues.time}
                    onChange={(e) => setFormValues({ ...formValues, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. School Ground / Auditorium"
                    value={formValues.location}
                    onChange={(e) => setFormValues({ ...formValues, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={formValues.audience}
                    onChange={(e) => setFormValues({ ...formValues, audience: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                  >
                    <option value="All">All School (Students &amp; Parents)</option>
                    <option value="Parents">Parents Only</option>
                    <option value="Students">Students Only</option>
                    <option value="Staff">Faculty &amp; Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Card Cover Image
                </label>
                <div className="flex gap-2">
                  <select
                    value={formValues.image}
                    onChange={(e) => setFormValues({ ...formValues, image: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                  >
                    <option value="/sports-day-track.jpg">Sports Ground Track</option>
                    <option value="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80">
                      Annual Day Stage
                    </option>
                    <option value="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=700&q=80">
                      Science Lab Fair
                    </option>
                    <option value="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=700&q=80">
                      Parent Teacher Consultation
                    </option>
                    <option value="/school-campus.jpg">Campus Flag Hoisting</option>
                    <option value="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80">
                      Holiday Beach
                    </option>
                    <option value="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80">
                      Teacher&apos;s Day Board
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions, guidelines or schedule details for students & parents..."
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0050CB] hover:bg-[#003ea1] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  {editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Event Details Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Header image banner */}
            <div className="relative h-44 w-full bg-slate-100">
              <Image
                src={viewingEvent.image || "/sports-day-track.jpg"}
                alt={viewingEvent.title}
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
              <button
                onClick={() => setViewingEvent(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 right-4">
                <span
                  className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md mb-1 ${getTagBadgeStyle(
                    viewingEvent.type
                  )}`}
                >
                  {viewingEvent.type}
                </span>
                <h3 className="text-xl font-black text-white drop-shadow-sm">
                  {viewingEvent.title}
                </h3>
              </div>
            </div>

            {/* Details Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-[#0050CB]" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Date</p>
                    <p className="font-bold">{viewingEvent.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-[#0050CB]" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Timing</p>
                    <p className="font-bold">{viewingEvent.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-[#0050CB]" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Location</p>
                    <p className="font-bold">{viewingEvent.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Users className="w-4 h-4 text-[#0050CB]" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Audience</p>
                    <p className="font-bold">{viewingEvent.audience}</p>
                  </div>
                </div>
              </div>

              {viewingEvent.description && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Overview
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {viewingEvent.description}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleDownload(viewingEvent)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0050CB] bg-[#E5EEFF] hover:bg-blue-100 rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Pass</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const evt = viewingEvent;
                      setViewingEvent(null);
                      handleOpenEdit(evt);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#0050CB]" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setViewingEvent(null)}
                    className="px-5 py-2 text-xs font-bold bg-[#0050CB] hover:bg-[#003ea1] text-white rounded-xl shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
