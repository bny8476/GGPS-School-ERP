"use client";

import React, { useState, useEffect } from "react";
import { 
  Heart, Calendar, Plus, Search, Filter, ChevronDown, ChevronRight,
  MoreVertical, CheckCircle2, UserCheck, Utensils, Moon, Star, Users,
  BookOpen, Clock, FileText, ArrowUpRight, Check, X, Shield, Sparkles
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatMediumDate, formatShortDate } from "@/lib/date";
import AppImage from "@/components/ui/AppImage";

export default function DaycarePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedRoom, setSelectedRoom] = useState("All Rooms");
  const [showModal, setShowModal] = useState(false);
  const [selectedLogDetails, setSelectedLogDetails] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Form states for new daycare log
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [className, setClassName] = useState("Nursery");
  const [room, setRoom] = useState("Room 1");
  const [checkInTime, setCheckInTime] = useState("08:15 AM");
  const [checkOutTime, setCheckOutTime] = useState("-");
  const [mealStatus, setMealStatus] = useState("Yes");
  const [napStatus, setNapStatus] = useState("Yes");
  const [activitiesCount, setActivitiesCount] = useState(2);
  const [status, setStatus] = useState("In Care");

  useEffect(() => {
    // Initial sample student records matching screenshot exactly
    setLogs([
      {
        id: "1",
        name: "Aarav Sharma",
        studentCode: "STU001",
        avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=120&auto=format&fit=crop",
        class: "Nursery",
        room: "Room 1",
        checkIn: "08:15 AM",
        checkOut: "04:00 PM",
        meals: "Yes",
        nap: "Yes",
        activities: 2,
        status: "Checked Out",
      },
      {
        id: "2",
        name: "Diya Patel",
        studentCode: "STU002",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=120&auto=format&fit=crop",
        class: "LKG",
        room: "Room 2",
        checkIn: "08:30 AM",
        checkOut: "04:10 PM",
        meals: "Yes",
        nap: "No",
        activities: 1,
        status: "Checked Out",
      },
      {
        id: "3",
        name: "Vihaan Mehta",
        studentCode: "STU003",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=120&auto=format&fit=crop",
        class: "UKG",
        room: "Room 1",
        checkIn: "08:20 AM",
        checkOut: "-",
        meals: "Yes",
        nap: "No",
        activities: 3,
        status: "In Care",
      },
      {
        id: "4",
        name: "Ananya Reddy",
        studentCode: "STU004",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop",
        class: "Nursery",
        room: "Room 3",
        checkIn: "08:45 AM",
        checkOut: "-",
        meals: "Yes",
        nap: "Yes",
        activities: 2,
        status: "In Care",
      },
      {
        id: "5",
        name: "Arjun Nair",
        studentCode: "STU005",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop",
        class: "LKG",
        room: "Room 2",
        checkIn: "08:10 AM",
        checkOut: "03:50 PM",
        meals: "Yes",
        nap: "No",
        activities: 1,
        status: "Checked Out",
      },
      {
        id: "6",
        name: "Sneha Iyer",
        studentCode: "STU006",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop",
        class: "UKG",
        room: "Room 3",
        checkIn: "08:25 AM",
        checkOut: "-",
        meals: "Yes",
        nap: "Yes",
        activities: 2,
        status: "In Care",
      },
    ]);
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    const newEntry = {
      id: String(Date.now()),
      name: studentName,
      studentCode: studentId || `STU00${logs.length + 1}`,
      avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=120&auto=format&fit=crop",
      class: className,
      room: room,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      meals: mealStatus,
      nap: napStatus,
      activities: Number(activitiesCount),
      status: status,
    };

    setLogs([newEntry, ...logs]);
    toast.success("Daycare student log recorded successfully!");
    setStudentName("");
    setStudentId("");
    setShowModal(false);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.room.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === "All Classes" || log.class === selectedClass;
    const matchesRoom = selectedRoom === "All Rooms" || log.room === selectedRoom;
    return matchesSearch && matchesClass && matchesRoom;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedLogs = filteredLogs.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-6 font-sans text-[#000E28] dark:text-white pb-16">
      
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
        <Link href="/dashboard" className="hover:text-[#0050CB]">Home</Link>
        <span>&gt;</span>
        <span className="text-[#0050CB] dark:text-[#38BDF8] font-bold">Day Care Management</span>
      </div>

      {/* HERO BANNER SECTION */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#EBF3FF] via-[#F4F8FF] to-[#E5F0FF] dark:from-[#001A48] dark:via-[#001438] dark:to-[#002766] p-6 sm:p-8 border border-blue-100 dark:border-slate-800 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] shadow-sm shrink-0">
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight">
                Day Care Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-medium mt-1">
                Track check-ins, meals, naps and activities for day care students.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#000E28] dark:text-white hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
              <span>Daily Logs</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 STAT METRIC CARDS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Students */}
        <div className="bg-white dark:bg-[#000E28] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#000E28] dark:text-white leading-none">24</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Total Students</p>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">↑ 12%</span>
          </div>
        </div>

        {/* Card 2: Checked In */}
        <div className="bg-white dark:bg-[#000E28] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#000E28] dark:text-white leading-none">18</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Checked In</p>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">↑ 8%</span>
          </div>
        </div>

        {/* Card 3: Had Lunch */}
        <div className="bg-white dark:bg-[#000E28] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#000E28] dark:text-white leading-none">16</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Had Lunch</p>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">↑ 10%</span>
          </div>
        </div>

        {/* Card 4: Naps Taken */}
        <div className="bg-white dark:bg-[#000E28] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#000E28] dark:text-white leading-none">12</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Naps Taken</p>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">↑ 6%</span>
          </div>
        </div>

        {/* Card 5: Activities */}
        <div className="bg-white dark:bg-[#000E28] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#000E28] dark:text-white leading-none">8</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Activities</p>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">↑ 14%</span>
          </div>
        </div>

      </div>

      {/* FILTER CONTROL BAR CARD */}
      <div className="bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, ID or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0050CB]"
          />
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
          <Calendar className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
          <span suppressHydrationWarning>{formatShortDate()}</span>
        </div>

        {/* Class Dropdown */}
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shrink-0"
        >
          <option value="All Classes">All Classes</option>
          <option value="Nursery">Nursery</option>
          <option value="LKG">LKG</option>
          <option value="UKG">UKG</option>
        </select>

        {/* Room Dropdown */}
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shrink-0"
        >
          <option value="All Rooms">All Rooms</option>
          <option value="Room 1">Room 1</option>
          <option value="Room 2">Room 2</option>
          <option value="Room 3">Room 3</option>
        </select>

        {/* Filter Button */}
        <button 
          onClick={() => {
            setSelectedClass("All Classes");
            setSelectedRoom("All Rooms");
            setSearchQuery("");
            setCurrentPage(1);
            toast.success("Filters reset to default");
          }}
          title="Reset all filters"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* MAIN TWO-COLUMN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: TABLE (COL-8) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="p-4 w-10 text-center">
                    <input type="checkbox" className="rounded-md border-slate-300" />
                  </th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Room</th>
                  <th className="p-4">Check-in</th>
                  <th className="p-4">Check-out</th>
                  <th className="p-4">Meals</th>
                  <th className="p-4">Nap</th>
                  <th className="p-4">Activities</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 text-center">
                      <input type="checkbox" className="rounded-md border-slate-300" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <AppImage
                          src={log.avatar}
                          alt={log.name}
                          fallbackType="avatar"
                          name={log.name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
                        />
                        <div>
                          <p className="font-extrabold text-[#000E28] dark:text-white leading-tight">{log.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{log.studentCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">{log.class}</td>
                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">{log.room}</td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-200">{log.checkIn}</td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-200">{log.checkOut}</td>
                    
                    {/* Meals Column */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-emerald-600 font-bold">
                        <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Yes</span>
                      </div>
                    </td>

                    {/* Nap Column */}
                    <td className="p-4">
                      {log.nap === "Yes" ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-bold">
                          <Moon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-500 font-bold">
                          <Utensils className="w-3.5 h-3.5 text-rose-500" />
                          <span>No</span>
                        </div>
                      )}
                    </td>

                    {/* Activities Column */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                        <Star className="w-3.5 h-3.5 text-purple-500" />
                        <span>{log.activities}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {log.status === "Checked Out" ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold inline-block">
                          Checked Out
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#0050CB] dark:text-[#38BDF8] text-[10px] font-bold inline-block">
                          In Care
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSelectedLogDetails(log)}
                        title="View & Edit Status"
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer transition-colors"
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
            <span>Showing {filteredLogs.length > 0 ? (safePage - 1) * pageSize + 1 : 0} to {Math.min(safePage * pageSize, filteredLogs.length)} of {filteredLogs.length} students</span>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center cursor-pointer transition-colors ${
                    safePage === pageNum 
                      ? "bg-[#0050CB] text-white shadow-xs" 
                      : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN PANELS (COL-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* QUICK ACTIONS PANEL */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
              <h3 className="text-sm font-black text-[#000E28] dark:text-white">Quick Actions</h3>
            </div>

            <div className="space-y-2.5">
              
              {/* Action 1 */}
              <button 
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-left transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#000E28] dark:text-white">Add New Student</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Register a new day care student</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0050CB]" />
              </button>

              {/* Action 2 */}
              <Link 
                href="/dashboard/attendance"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-left transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0050CB]/15 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#000E28] dark:text-white">Take Attendance</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Mark daily attendance</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0050CB]" />
              </Link>

              {/* Action 3 */}
              <button 
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-left transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#000E28] dark:text-white">Log Meals</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Record meals and snacks</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0050CB]" />
              </button>

              {/* Action 4 */}
              <button 
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-left transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#000E28] dark:text-white">Add Activity</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Create activity log</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0050CB]" />
              </button>

              {/* Action 5 */}
              <Link 
                href="/dashboard/reports"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-left transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#000E28] dark:text-white">View Reports</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Daily & monthly reports</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0050CB]" />
              </Link>

            </div>
          </div>

          {/* TODAY'S SUMMARY PANEL */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
                <h3 className="text-sm font-black text-[#000E28] dark:text-white">Today's Summary</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400" suppressHydrationWarning>{formatMediumDate()}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-base font-black text-[#000E28] dark:text-white leading-none">18</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Checked In</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-base font-black text-[#000E28] dark:text-white leading-none">16</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Meals Served</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-base font-black text-[#000E28] dark:text-white leading-none">12</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Naps</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-base font-black text-[#000E28] dark:text-white leading-none">8</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Activities</p>
                </div>
              </div>
            </div>
          </div>

          {/* HAPPY KIDS HAPPY LEARNING BRANDING CARD */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E2F1FF] via-[#EEF6FF] to-[#DCEBFF] dark:from-[#001D4A] dark:via-[#001438] dark:to-[#002766] p-5 border border-blue-200/60 dark:border-blue-900/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-[#0050CB] dark:text-[#38BDF8] uppercase tracking-wider block">
                ☀️ Nursery Care
              </span>
              <h4 className="text-sm font-black text-[#000E28] dark:text-white leading-tight">
                Happy Kids<br />Happy Learning
              </h4>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-300 mt-1">
                Safe • Nurturing • Engaging
              </p>
            </div>

            <div className="w-16 h-16 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-3xl shadow-sm shrink-0">
              🎒
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
        <div>
          <span className="font-black text-[#000E28] dark:text-white">GGPS School</span> &copy; 2026 School ERP. All rights reserved.
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

      {/* CREATE LOG MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-[#000E28] dark:text-white">Register Day Care Log</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                  className="w-full mt-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#0050CB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Class</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  >
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Room</label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  >
                    <option value="Room 1">Room 1</option>
                    <option value="Room 2">Room 2</option>
                    <option value="Room 3">Room 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Check-in Time</label>
                  <input
                    type="text"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  >
                    <option value="In Care">In Care</option>
                    <option value="Checked Out">Checked Out</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0050CB] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT LOG DETAILS & STATUS TOGGLE MODAL */}
      {selectedLogDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <AppImage
                  src={selectedLogDetails.avatar}
                  alt={selectedLogDetails.name}
                  fallbackType="avatar"
                  name={selectedLogDetails.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100"
                />
                <div>
                  <h2 className="text-base font-black text-[#000E28] dark:text-white leading-tight">
                    {selectedLogDetails.name}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {selectedLogDetails.studentCode} • Class {selectedLogDetails.class} ({selectedLogDetails.room})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLogDetails(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Check-in Time</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedLogDetails.checkIn}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Check-out Time</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedLogDetails.checkOut || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Meals Status</span>
                  <span className="font-extrabold text-emerald-600">Served ({selectedLogDetails.meals})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Nap Status</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedLogDetails.nap}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">Current Care Status</span>
                <span className="text-sm font-black text-[#0050CB] dark:text-[#38BDF8]">{selectedLogDetails.status}</span>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const updatedLogs = logs.map(l => {
                    if (l.id === selectedLogDetails.id) {
                      const newStatus = l.status === "In Care" ? "Checked Out" : "In Care";
                      const newCheckOut = newStatus === "Checked Out" ? "04:30 PM" : "-";
                      return { ...l, status: newStatus, checkOut: newCheckOut };
                    }
                    return l;
                  });
                  setLogs(updatedLogs);
                  toast.success(`Updated status for ${selectedLogDetails.name}`);
                  setSelectedLogDetails(null);
                }}
                className={`px-4 py-2 text-white font-bold rounded-xl shadow-xs cursor-pointer text-xs ${
                  selectedLogDetails.status === "In Care" 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "bg-[#0050CB] hover:bg-[#0041A8]"
                }`}
              >
                {selectedLogDetails.status === "In Care" ? "Check Out Student" : "Mark Back In Care"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedLogDetails(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
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
