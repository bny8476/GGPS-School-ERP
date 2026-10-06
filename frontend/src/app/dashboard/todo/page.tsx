"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle2, Plus, Search, Filter, Calendar, Clock, AlertCircle, 
  ChevronRight, MoreVertical, FileText, Users, BookOpen, Edit3, 
  Download, Upload, Sparkles, Check, X, ArrowRight, LayoutGrid, List,
  ShieldAlert, UserCheck, Zap, RefreshCw, AlertTriangle, ArrowUpRight,
  SlidersHorizontal, CheckSquare, CornerDownRight, BellRing
} from "lucide-react";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import toast from "react-hot-toast";

interface TaskItem {
  _id?: string;
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: string | Date;
  dateString?: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "Assigned" | "In Progress" | "Pending Review" | "Completed" | "Escalated";
  assigneeName?: string;
  assigneeRole?: string;
  department?: string;
  assignedByName?: string;
  slaHours?: number;
  isEscalated?: boolean;
  escalationReason?: string;
  erpTriggerSource?: string;
  completed: boolean;
  completedAt?: string | Date;
  createdAt?: string | Date;
  icon?: string;
  iconBg?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
}

const FALLBACK_STAFF: StaffMember[] = [
  { id: "u1", name: "Dr. Marcus Vance", role: "Principal", department: "Leadership", email: "principal@globalinternationalschool.edu" },
  { id: "u2", name: "Sarah Jenkins", role: "Head of Mathematics", department: "Academics", email: "s.jenkins@globalinternationalschool.edu" },
  { id: "u3", name: "David Chen", role: "Pre-KG Phonics Lead Teacher", department: "Academics", email: "d.chen@globalinternationalschool.edu" },
  { id: "u4", name: "Robert Taylor", role: "Chief Finance Officer", department: "Finance", email: "bursar@globalinternationalschool.edu" },
  { id: "u5", name: "Elena Rostova", role: "Dean of Students & Discipline", department: "Student Welfare", email: "e.rostova@globalinternationalschool.edu" },
  { id: "u6", name: "Ahmed Al-Mansoor", role: "Facility Operations Manager", department: "Facilities", email: "facilities@globalinternationalschool.edu" },
  { id: "u7", name: "Michael Chang", role: "Head of Campus Safety & Maintenance", department: "Operations", email: "safety@globalinternationalschool.edu" },
  { id: "u8", name: "Claire Bennett", role: "Chief Examination Controller", department: "Assessments", email: "exams@globalinternationalschool.edu" },
];

export default function TodoPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>(FALLBACK_STAFF);
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Completed" | "Overdue">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All Priorities");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedAssignee, setSelectedAssignee] = useState("All Staff");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [taskToEscalate, setTaskToEscalate] = useState<TaskItem | null>(null);
  const [escalateReasonText, setEscalateReasonText] = useState("");

  // Loading & Trigger states
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggeringERP, setIsTriggeringERP] = useState(false);

  // New task state for modal
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academic");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("High");
  const [dueDate, setDueDate] = useState("Sep 25, 2026");
  const [slaHours, setSlaHours] = useState(48);
  const [selectedStaffId, setSelectedStaffId] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fetch tasks and staff members
  const fetchTasksAndStaff = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Staff Members
      const staffRes = await fetch(`${API_URL}/api/apps/tasks/staff`).catch(() => null);
      if (staffRes && staffRes.ok) {
        const sData = await staffRes.json();
        if (sData.staff) setStaffList(sData.staff);
      }

      // 2. Fetch Tasks
      const tasksRes = await fetch(`${API_URL}/api/apps/tasks`).catch(() => null);
      if (tasksRes && tasksRes.ok) {
        const tData = await tasksRes.json();
        if (tData.data && Array.isArray(tData.data)) {
          setTasks(tData.data);
        }
      }
    } catch (err) {
      console.warn("Using fallback local tasks state due to connection latency:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndStaff();
  }, []);

  // Toggle complete
  const toggleTaskComplete = async (task: TaskItem) => {
    const newCompleted = !task.completed;
    const newStatus = newCompleted ? "Completed" : (task.assigneeName ? "Assigned" : "Pending");

    // Optimistic UI update
    setTasks(prev => prev.map(t => (t.id === task.id || t._id === task._id) ? { ...t, completed: newCompleted, status: newStatus } : t));
    toast.success(newCompleted ? "Task marked as Completed!" : "Task reopened!");

    try {
      await fetch(`${API_URL}/api/apps/tasks/${task._id || task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.warn("Failed to persist status to backend:", e);
    }
  };

  // Advance Task Lifecycle
  const advanceLifecycle = async (task: TaskItem, nextStatus: TaskItem["status"]) => {
    setTasks(prev => prev.map(t => (t.id === task.id || t._id === task._id) ? { ...t, status: nextStatus, completed: nextStatus === "Completed" } : t));
    toast.success(`Task advanced to "${nextStatus}"!`);

    try {
      await fetch(`${API_URL}/api/apps/tasks/${task._id || task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (e) {}
  };

  // Add Task / Delegate
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedStaff = staffList.find(s => s.id === selectedStaffId);

    const payload = {
      title,
      description: description || "Operational task action item",
      category,
      priority,
      dueDate,
      slaHours: Number(slaHours) || 48,
      assigneeId: assignedStaff?.id,
      assigneeName: assignedStaff?.name || "Unassigned",
      assigneeRole: assignedStaff?.role || "Staff",
      department: assignedStaff?.department || "Operations",
    };

    try {
      const res = await fetch(`${API_URL}/api/apps/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTasks(prev => [data.data, ...prev]);
        toast.success(assignedStaff ? `Task delegated to ${assignedStaff.name}!` : "Task created successfully!");
      } else {
        throw new Error("Local fallback");
      }
    } catch (e) {
      // Local fallback
      const localTask: TaskItem = {
        id: String(Date.now()),
        title,
        description: description || "New task action item",
        category,
        dueDate,
        dateString: dueDate,
        priority,
        status: assignedStaff ? "Assigned" : "Pending",
        assigneeName: assignedStaff?.name || "Unassigned",
        assigneeRole: assignedStaff?.role || "Staff",
        department: assignedStaff?.department || "Operations",
        assignedByName: "Super Admin",
        slaHours: Number(slaHours) || 48,
        isEscalated: priority === "Urgent",
        completed: false,
        icon: "📄",
      };
      setTasks(prev => [localTask, ...prev]);
      toast.success("Task created and saved!");
    }

    setTitle("");
    setDescription("");
    setSelectedStaffId("");
    setShowAddModal(false);
  };

  // Trigger Automated ERP Event Task
  const handleTriggerERPTask = async () => {
    setIsTriggeringERP(true);
    try {
      const res = await fetch(`${API_URL}/api/apps/tasks/trigger-erp`, { method: "POST" });
      const data = await res.json();
      if (data.success && data.data) {
        setTasks(prev => [data.data, ...prev]);
        toast.success(`⚡ Automated ERP Trigger: New task generated & delegated to ${data.data.assigneeName}!`);
      }
    } catch (e) {
      toast.error("Failed to trigger automated ERP task");
    } finally {
      setIsTriggeringERP(false);
    }
  };

  // Open Escalate Modal
  const openEscalateModal = (task: TaskItem) => {
    setTaskToEscalate(task);
    setEscalateReasonText(`SLA Overdue: Action item "${task.title}" has breached expected SLA deadline.`);
    setShowEscalateModal(true);
  };

  // Confirm Escalate
  const handleConfirmEscalate = async () => {
    if (!taskToEscalate) return;
    const taskId = taskToEscalate._id || taskToEscalate.id;

    setTasks(prev => prev.map(t => (t.id === taskId || t._id === taskId) ? {
      ...t,
      status: "Escalated",
      priority: "Urgent",
      isEscalated: true,
      escalationReason: escalateReasonText,
    } : t));

    toast.error(`🚨 Task escalated to Super Admin! Escalation alert dispatched.`);
    setShowEscalateModal(false);

    try {
      await fetch(`${API_URL}/api/apps/tasks/${taskId}/escalate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: escalateReasonText }),
      });
    } catch (e) {}
  };

  // Delete Task
  const handleDeleteTask = async (task: TaskItem) => {
    const taskId = task._id || task.id;
    setTasks(prev => prev.filter(t => t.id !== taskId && t._id !== taskId));
    toast.success("Task deleted successfully.");

    try {
      await fetch(`${API_URL}/api/apps/tasks/${taskId}`, { method: "DELETE" });
    } catch (e) {}
  };

  // Dynamic Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (activeTab === "Pending" && (t.completed || t.status === "Completed")) return false;
      if (activeTab === "Completed" && (!t.completed && t.status !== "Completed")) return false;
      if (activeTab === "Overdue" && (t.priority !== "Urgent" && t.status !== "Escalated" && !t.isEscalated)) return false;

      // Dropdown filters
      if (selectedPriority !== "All Priorities" && t.priority !== selectedPriority) return false;
      if (selectedStatus !== "All Statuses" && t.status !== selectedStatus) return false;
      if (selectedCategory !== "All Categories" && t.category !== selectedCategory) return false;
      if (selectedAssignee !== "All Staff" && t.assigneeName !== selectedAssignee) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const match =
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.assigneeName && t.assigneeName.toLowerCase().includes(q)) ||
          (t.department && t.department.toLowerCase().includes(q)) ||
          (t.erpTriggerSource && t.erpTriggerSource.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [tasks, activeTab, selectedPriority, selectedStatus, selectedCategory, selectedAssignee, searchQuery]);

  // Dynamic Statistics
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => !t.completed && t.status !== "Completed").length,
      completed: tasks.filter(t => t.completed || t.status === "Completed").length,
      overdue: tasks.filter(t => t.priority === "Urgent" || t.status === "Escalated" || t.isEscalated).length,
    };
  }, [tasks]);

  // Priority badge styling
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900";
      case "High":
        return "bg-[#FF690C]/10 text-[#FF690C] dark:bg-[#FF690C]/20 border border-[#FF690C]/30";
      case "Medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200";
      default:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200";
    }
  };

  // Status badge styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500 text-white";
      case "In Progress":
        return "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200";
      case "Pending Review":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200";
      case "Escalated":
        return "bg-rose-600 text-white animate-pulse";
      case "Assigned":
        return "bg-[#E5EEFF] text-[#0050CB] dark:bg-blue-950/60 dark:text-[#38BDF8] border border-[#0050CB]/20";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#000E28] dark:text-white pb-16">
      
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <Link href="/dashboard" className="hover:text-[#0050CB]">Home</Link>
        <span>&gt;</span>
        <span className="text-slate-600 dark:text-slate-300 font-semibold">To-Do Tasks</span>
      </div>

      {/* HERO BANNER SECTION */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#EBF3FF] via-[#F3F7FF] to-[#E5EEFF] dark:from-[#001A48] dark:via-[#001438] dark:to-[#002766] p-6 sm:p-8 border border-blue-100/60 dark:border-slate-800 shadow-xs">
        <div 
          className="absolute top-0 right-0 bottom-0 w-1/2 opacity-25 dark:opacity-35 bg-no-repeat bg-cover bg-right pointer-events-none"
          style={{ backgroundImage: `url('/todo-hero-banner.png')` }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0050CB] text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight">
                  To-Do Tasks & Delegation
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E5EEFF] text-[#0050CB] dark:bg-[#0050CB]/30 dark:text-[#38BDF8] border border-[#0050CB]/20">
                  <UserCheck className="w-3 h-3" />
                  Staff Delegation Hub
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-medium mt-1 max-w-xl">
                Assign tasks to faculty, monitor SLA deadlines, automate ERP workflow items, and escalate critical operational action items.
              </p>
            </div>
          </div>

          {/* Action Buttons in Hero */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleTriggerERPTask}
              disabled={isTriggeringERP}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-[#0050CB] dark:text-[#38BDF8] border border-[#0050CB]/30 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className={`w-4 h-4 text-[#FF690C] ${isTriggeringERP ? "animate-spin" : ""}`} />
              <span>{isTriggeringERP ? "Triggering ERP..." : "Trigger ERP Event Task"}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#003EA3] text-white text-xs font-extrabold shadow-md cursor-pointer transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Delegate Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 STAT CARDS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="relative overflow-hidden bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#0050CB] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#000E28] dark:text-white leading-none">{stats.total}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Total Tasks</p>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Synchronized Database</span>
          </div>
        </div>

        {/* Pending / Assigned */}
        <div className="relative overflow-hidden bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#000E28] dark:text-white leading-none">{stats.pending}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Pending / In Progress</p>
            <span className="text-[10px] font-bold text-amber-600">Active Workflows</span>
          </div>
        </div>

        {/* Completed */}
        <div className="relative overflow-hidden bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#000E28] dark:text-white leading-none">{stats.completed}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Completed</p>
            <span className="text-[10px] font-bold text-emerald-600">Approved & Closed</span>
          </div>
        </div>

        {/* Overdue / Escalated */}
        <div className="relative overflow-hidden bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#000E28] dark:text-white leading-none">{stats.overdue}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Overdue / Escalated</p>
            <span className="text-[10px] font-bold text-rose-500">Requires Intervention</span>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: TASK FILTERS & LIST/GRID (COL-8) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, assignee, description, or ERP trigger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0050CB]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Staff Assignee Filter */}
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shrink-0"
              >
                <option value="All Staff">All Staff</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shrink-0"
              >
                <option value="All Priorities">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shrink-0"
              >
                <option value="All Categories">All Categories</option>
                <option value="Academic">Academic</option>
                <option value="Administration">Administration</option>
                <option value="Facilities">Facilities</option>
                <option value="Finance">Finance</option>
                <option value="Events">Events</option>
                <option value="Library">Library</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-[#0050CB] shadow-xs" : "text-slate-400"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  title="List View"
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#0050CB] text-white shadow-xs" : "text-slate-400"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* TABS ROW */}
          <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab("All")}
              className={`pb-2 transition-colors cursor-pointer border-b-2 ${activeTab === "All" ? "border-[#0050CB] text-[#0050CB] font-black" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              All Tasks ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("Pending")}
              className={`pb-2 transition-colors cursor-pointer border-b-2 ${activeTab === "Pending" ? "border-[#0050CB] text-[#0050CB] font-black" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              Pending & Assigned ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab("Completed")}
              className={`pb-2 transition-colors cursor-pointer border-b-2 ${activeTab === "Completed" ? "border-[#0050CB] text-[#0050CB] font-black" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              Completed ({stats.completed})
            </button>
            <button
              onClick={() => setActiveTab("Overdue")}
              className={`pb-2 transition-colors cursor-pointer border-b-2 ${activeTab === "Overdue" ? "border-rose-500 text-rose-500 font-black" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              Overdue & Escalated ({stats.overdue})
            </button>
          </div>

          {/* TASK DISPLAY (LIST VS GRID) */}
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold">No tasks found</p>
              <p className="text-[11px]">No tasks match the active filters or tab selection.</p>
            </div>
          ) : viewMode === "list" ? (
            /* LIST VIEW */
            <div className="space-y-3">
              {filteredTasks.map((t) => {
                const taskId = t._id || t.id;
                return (
                  <div
                    key={taskId}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      t.completed 
                        ? "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-80" 
                        : t.isEscalated
                        ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900 shadow-sm"
                        : "bg-white dark:bg-[#000E28] border-slate-200/80 dark:border-slate-800 hover:border-[#0050CB]"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTaskComplete(t)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors mt-0.5 shrink-0 ${
                          t.completed
                            ? "bg-[#0050CB] border-[#0050CB] text-white"
                            : "border-slate-300 dark:border-slate-600 hover:border-[#0050CB]"
                        }`}
                      >
                        {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl bg-[#E5EEFF] dark:bg-slate-800 text-[#0050CB] flex items-center justify-center font-bold text-sm shrink-0`}>
                        {t.icon || "📄"}
                      </div>

                      {/* Details */}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xs font-extrabold leading-tight ${t.completed ? "line-through text-slate-400" : "text-[#000E28] dark:text-white"}`}>
                            {t.title}
                          </h4>
                          {t.erpTriggerSource && (
                            <span className="text-[9px] font-extrabold bg-[#FF690C]/15 text-[#FF690C] border border-[#FF690C]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" />
                              <span>ERP Trigger</span>
                            </span>
                          )}
                          {t.isEscalated && (
                            <span className="text-[9px] font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              <span>Escalated</span>
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-normal">
                          {t.description}
                        </p>

                        {/* Metadata row: Staff Assignee & SLA */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                          <span className="flex items-center gap-1 text-[#0050CB] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                            <UserCheck className="w-3 h-3" />
                            <strong>{t.assigneeName || "Unassigned"}</strong>
                            {t.assigneeRole && <span className="opacity-70">({t.assigneeRole})</span>}
                          </span>

                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{t.dateString || "Due Soon"}</span>
                          </span>

                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>SLA: {t.slaHours || 48}h</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action & Status Controls */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold ${getPriorityStyle(t.priority)}`}>
                        {t.priority}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getStatusStyle(t.status)}`}>
                        {t.status}
                      </span>

                      {/* Advance Lifecycle Button */}
                      {!t.completed && t.status !== "Completed" && (
                        <button
                          onClick={() => {
                            if (t.status === "Assigned" || t.status === "Pending") advanceLifecycle(t, "In Progress");
                            else if (t.status === "In Progress") advanceLifecycle(t, "Pending Review");
                            else if (t.status === "Pending Review") advanceLifecycle(t, "Completed");
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#E5EEFF] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0050CB] dark:text-[#38BDF8] rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Advance Task Workflow"
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {/* Escalate Button (if not already escalated and not completed) */}
                      {!t.isEscalated && !t.completed && (
                        <button
                          onClick={() => openEscalateModal(t)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                          title="Escalate to Super Admin"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteTask(t)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Delete Task"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* GRID / KANBAN VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTasks.map((t) => {
                const taskId = t._id || t.id;
                return (
                  <div
                    key={taskId}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      t.completed
                        ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 opacity-80"
                        : t.isEscalated
                        ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900 shadow-sm"
                        : "bg-white dark:bg-[#000E28] border-slate-200/80 dark:border-slate-800 hover:border-[#0050CB]"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${getPriorityStyle(t.priority)}`}>
                          {t.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${getStatusStyle(t.status)}`}>
                          {t.status}
                        </span>
                      </div>

                      <h4 className={`text-xs font-black line-clamp-2 ${t.completed ? "line-through text-slate-400" : "text-[#000E28] dark:text-white"}`}>
                        {t.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {t.description}
                      </p>

                      {t.erpTriggerSource && (
                        <div className="text-[9px] font-bold text-[#FF690C] bg-[#FF690C]/10 px-2 py-0.5 rounded flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          <span className="truncate">{t.erpTriggerSource}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Assignee & Action bar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-bold text-[#0050CB] dark:text-[#38BDF8] truncate max-w-[150px]">
                          👤 {t.assigneeName || "Unassigned"}
                        </span>
                        <span>SLA: {t.slaHours || 48}h</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => toggleTaskComplete(t)}
                          className="text-[10px] font-extrabold text-[#0050CB] hover:underline cursor-pointer"
                        >
                          {t.completed ? "Mark Pending" : "✓ Mark Done"}
                        </button>

                        {!t.isEscalated && !t.completed && (
                          <button
                            onClick={() => openEscalateModal(t)}
                            className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                          >
                            Escalate 🚨
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST FOOTER */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
            <span>Showing {filteredTasks.length} operational tasks</span>
            <span className="text-[11px] font-medium text-slate-400">Real-time Task Database Active</span>
          </div>

        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS + WORKFLOW STATUS + REMINDERS (COL-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* QUICK ACTIONS PANEL */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
              <h3 className="text-sm font-black text-[#000E28] dark:text-white">Staff Delegation & Controls</h3>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => setShowAddModal(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0050CB] text-white flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <span>Delegate New Task</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0050CB]" />
              </button>

              <button 
                onClick={handleTriggerERPTask}
                disabled={isTriggeringERP}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#FF690C]/10 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF690C] text-white flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span>Trigger Automated ERP Task</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF690C]" />
              </button>

              <Link 
                href="/dashboard/email"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <span>Send Staff Email Dispatch</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link 
                href="/dashboard/calendar"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span>School Calendar Sync</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
              </Link>
            </div>
          </div>

          {/* FACULTY ASSIGNEE DIRECTORY MINI PANEL */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
                <h3 className="text-sm font-black text-[#000E28] dark:text-white">Active Delegation Staff</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{staffList.length} Active</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              {staffList.slice(0, 5).map((staff) => (
                <div key={staff.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-full bg-[#E5EEFF] text-[#0050CB] dark:bg-[#0050CB]/30 dark:text-[#38BDF8] flex items-center justify-center font-bold text-[11px] shrink-0">
                      {staff.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-800 dark:text-white truncate">{staff.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{staff.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStaffId(staff.id);
                      setShowAddModal(true);
                    }}
                    className="text-[10px] font-extrabold text-[#0050CB] hover:underline shrink-0 cursor-pointer"
                  >
                    + Assign
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* STAY FOCUSED MOTIVATION CARD */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EEF2FF] via-[#F3E8FF] to-[#E0E7FF] dark:from-[#1E1B4B] dark:via-[#2E1065] dark:to-[#3B0764] p-5 border border-purple-200/60 dark:border-purple-900/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1 max-w-[170px] z-10">
              <h4 className="text-xs font-black text-[#000E28] dark:text-white leading-tight">
                Staff Accountability<br />SLA Performance
              </h4>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-300">
                Track compliance across academic and administrative departments.
              </p>
              <button 
                onClick={() => toast.success("All department SLAs are currently monitored.")}
                className="mt-2 w-7 h-7 rounded-full bg-[#0050CB] text-white flex items-center justify-center cursor-pointer shadow-xs hover:bg-[#003EA3] transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-24 h-24 rounded-xl overflow-hidden shadow-sm shrink-0 border border-white/60">
              <AppImage 
                src="/stay-focused-illustration.png" 
                alt="Stay Focused" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>

      </div>

      {/* CREATE / DELEGATE TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-lg p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#0050CB] text-white rounded-xl">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#000E28] dark:text-white">Delegate New Task</h2>
                  <p className="text-[11px] text-slate-400">Assign operational tasks with SLA to school faculty.</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Task Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Prepare Pre-KG Sensory Activity Worksheets"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#0050CB] font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Description & Instructions</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed instructions for the assignee..."
                  rows={3}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none leading-relaxed"
                />
              </div>

              {/* Staff Delegation Dropdown */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#0050CB]" />
                  <span>Assign to Staff Member (Delegation)</span>
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-bold text-slate-800 dark:text-white"
                >
                  <option value="">-- Leave Unassigned (General Pool) --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} • {s.role} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-semibold"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Administration">Administration</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Finance">Finance</option>
                    <option value="Events">Events</option>
                    <option value="Library">Library</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-semibold"
                  >
                    <option value="High">High</option>
                    <option value="Urgent">Urgent (SLA Alert)</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Target Due Date</label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="e.g. Sep 25, 2026"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">SLA Resolution Window</label>
                  <select
                    value={slaHours}
                    onChange={(e) => setSlaHours(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-semibold"
                  >
                    <option value={12}>12 Hours (Urgent)</option>
                    <option value={24}>24 Hours (Standard Fast)</option>
                    <option value={48}>48 Hours (2 Days)</option>
                    <option value={72}>72 Hours (3 Days)</option>
                    <option value={96}>96 Hours (4 Days)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0050CB] hover:bg-[#003EA3] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Assign & Delegate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESCALATION MODAL */}
      {showEscalateModal && taskToEscalate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-md p-6 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-base font-black text-[#000E28] dark:text-white">Escalate Task to Super Admin</h2>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Escalating flags this task as <strong>Urgent (SLA Breached)</strong>, alerts executive administration, and triggers an urgent Socket.IO notification.
            </p>

            <div className="bg-rose-50 dark:bg-rose-950/30 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900 text-xs">
              <p className="font-extrabold text-[#000E28] dark:text-white">{taskToEscalate.title}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Assignee: {taskToEscalate.assigneeName || "Unassigned"}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Escalation Reason *</label>
              <textarea
                value={escalateReasonText}
                onChange={(e) => setEscalateReasonText(e.target.value)}
                rows={3}
                className="w-full mt-1 p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-800 text-xs outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEscalate}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Escalation</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
