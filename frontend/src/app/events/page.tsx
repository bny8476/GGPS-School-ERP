"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Filter,
  Users,
  Search,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface SchoolEvent {
  _id: string;
  title: string;
  type: string;
  date: string;
  time?: string;
  audience?: string;
  description: string;
}

export default function EventsPage() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/api/v1/events`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setEvents(data);
          } else {
            // Curated initial school calendar events
            setEvents([
              {
                _id: "evt_1",
                title: "2026–2027 Academic Year Admissions Open House",
                type: "Admissions",
                date: "2026-10-10",
                time: "09:30 AM – 12:30 PM",
                audience: "Prospective Parents",
                description: "Campus walkthrough, principal address, early years curriculum presentation, and direct counsellor consultations for PreKG, LKG, and UKG.",
              },
              {
                _id: "evt_2",
                title: "Little Explorers STEM & Sensory Play Workshop",
                type: "Workshop",
                date: "2026-10-18",
                time: "10:00 AM – 11:30 AM",
                audience: "Parents & Toddlers",
                description: "Hands-on play-based sensory activities designed for child development and parent-child interaction at our Kindergarten Activity Hub.",
              },
              {
                _id: "evt_3",
                title: "Grandparents Day Celebration & Cultural Showcase",
                type: "Cultural",
                date: "2026-10-24",
                time: "02:00 PM – 04:00 PM",
                audience: "Families & Students",
                description: "A joyous celebration honoring the wisdom and warmth of grandparents with music, storytelling, and student performances.",
              },
              {
                _id: "evt_4",
                title: "Annual Sports & Active Play Day",
                type: "Sports",
                date: "2026-11-14",
                time: "08:30 AM – 01:00 PM",
                audience: "All Students & Parents",
                description: "Friendly sprint races, obstacle courses, gymnastics drills, and fun athletic relays fostering sportsmanship and fitness.",
              },
            ]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchesType = selectedType === "ALL" || e.type.toLowerCase() === selectedType.toLowerCase();
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#000a1f] text-[#000E28] dark:text-slate-100 font-sans selection:bg-[#0050CB]/20 selection:text-[#0050CB] transition-colors duration-200">
      
      {/* HERO SECTION */}
      <section className="relative pt-6 pb-10 sm:pt-8 sm:pb-12 overflow-hidden border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white via-[#F6F8FC] to-[#E5EEFF]/30 dark:from-[#000E28] dark:via-[#000a1f] dark:to-[#050E22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/30 border border-blue-200 dark:border-blue-900 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold mb-4">
              <CalendarDays className="w-3.5 h-3.5 text-[#FF690C]" />
              <span>Campus Calendar & Celebrations</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000E28] dark:text-white tracking-tight leading-tight mb-4">
              Events at <span className="text-[#0050CB] dark:text-[#38BDF8]">GGPS School</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Stay connected with school happenings, admissions open houses, cultural celebrations, and student exhibitions.
            </p>
          </div>
        </div>
      </section>

      {/* EVENTS DIRECTORY */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* FILTERS & SEARCH */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {["ALL", "Admissions", "Workshop", "Cultural", "Sports"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedType === type
                    ? "bg-[#0050CB] text-white shadow-sm"
                    : "bg-white dark:bg-[#001438] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                {type === "ALL" ? "All Events" : type}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white dark:bg-[#001438] border border-slate-200 dark:border-slate-800 text-xs text-[#000E28] dark:text-white focus:outline-none focus:border-[#0050CB]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* EVENTS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No events found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((evt) => (
              <div
                key={evt._id}
                className="bg-white dark:bg-[#001438] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8]">
                    {evt.type}
                  </span>
                  {evt.audience && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Audience: {evt.audience}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#000E28] dark:text-white leading-snug">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-[#000E28] dark:text-white">
                    <CalendarDays className="w-3.5 h-3.5 text-[#FF690C]" />
                    <span>{new Date(evt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  {evt.time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{evt.time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>GGPS Main Campus</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOTTOM ADMISSIONS CTA */}
        <div className="mt-12 p-8 rounded-3xl bg-linear-to-r from-[#000E28] via-[#002772] to-[#0050CB] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-xl font-black">Plan a Campus Tour During Any Event</h3>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              Meet our teachers, experience our classrooms, and start your child's 2026–2027 admission journey today.
            </p>
          </div>
          <Link
            href="/enquire"
            className="px-6 py-3 rounded-full bg-white text-[#0050CB] font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors shrink-0 shadow-md"
          >
            ✦ Enquire About Admission →
          </Link>
        </div>
      </section>
    </div>
  );
}
