"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Phone,
  Mail,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  User,
  GraduationCap,
  Users,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  AlertCircle,
  FileText,
  MessageSquare,
  Send,
  UserCheck,
  ShieldCheck,
  Check,
  CornerDownRight,
  Layers,
  HelpCircle,
  PhoneCall,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/apiClient";
import { getSocket } from "@/lib/socket";
import { useLanguage } from "@/context/LanguageContext";

export interface EnquiryItem {
  _id: string;
  enquiryId: string;
  academicYear: string;
  parent: {
    name: string;
    email: string;
    phone: string;
    relationship?: string;
  };
  child: {
    name: string;
    dateOfBirth?: string;
    classApplied: string;
    gender?: string;
  };
  preferredContactMethod?: string;
  preferredVisitDate?: string;
  message?: string;
  source: string;
  status: "NEW" | "CONTACTED" | "FOLLOW_UP" | "CONVERTED" | "CLOSED" | "LOST";
  assignedTo?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  lastContactAt?: string;
  lastContactMethod?: string;
  nextFollowUpDate?: string;
  followUps?: Array<{
    _id?: string;
    date: string;
    time?: string;
    type: string;
    notes: string;
    createdBy?: {
      name?: string;
      email?: string;
    };
    createdAt: string;
  }>;
  notes?: Array<{
    _id?: string;
    text: string;
    createdBy?: {
      name?: string;
      email?: string;
    };
    createdAt: string;
  }>;
  conversion?: {
    applicationId?: string;
    applicationNumber?: string;
    convertedAt?: string;
    convertedBy?: {
      name?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface EnquiriesResponse {
  success: boolean;
  data: EnquiryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  metrics: {
    total: number;
    new: number;
    contacted: number;
    followUp: number;
    converted: number;
    closed: number;
  };
}

export default function AdminEnquiriesManager() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selected Enquiry for Detail Drawer
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);

  // Modals
  const [isNewEnquiryModalOpen, setIsNewEnquiryModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // Follow-up form inputs
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpType, setFollowUpType] = useState("Phone");
  const [followUpNotes, setFollowUpNotes] = useState("");

  // Internal Note form input
  const [noteText, setNoteText] = useState("");

  // Close reason input
  const [closeReason, setCloseReason] = useState("");

  // Assign staff input
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("Admissions Counsellor");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNew = (enquiry: any) => {
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <div>
              <p className="font-bold text-xs text-[#000E28]">New Admission Enquiry Received!</p>
              <p className="text-[11px] text-slate-600">
                {enquiry?.parent?.name || "Parent"} for Class {enquiry?.child?.classApplied || "LKG"}
              </p>
            </div>
          </div>
        ),
        { duration: 6000, position: "top-right" }
      );
      queryClient.invalidateQueries({ queryKey: ["admissions-enquiries"] });
    };

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["admissions-enquiries"] });
    };

    socket.on("admission:enquiry:new", handleNew);
    socket.on("admission:enquiry:status-changed", handleUpdate);
    socket.on("admission:enquiry:assigned", handleUpdate);
    socket.on("admission:enquiry:follow-up-created", handleUpdate);
    socket.on("admission:enquiry:converted", handleUpdate);
    socket.on("admission:enquiry:closed", handleUpdate);

    return () => {
      socket.off("admission:enquiry:new", handleNew);
      socket.off("admission:enquiry:status-changed", handleUpdate);
      socket.off("admission:enquiry:assigned", handleUpdate);
      socket.off("admission:enquiry:follow-up-created", handleUpdate);
      socket.off("admission:enquiry:converted", handleUpdate);
      socket.off("admission:enquiry:closed", handleUpdate);
    };
  }, [queryClient]);

  // TanStack Query: Fetch Enquiries List
  const { data, isLoading, isFetching, refetch } = useQuery<EnquiriesResponse>({
    queryKey: [
      "admissions-enquiries",
      {
        search: debouncedSearch,
        status: statusFilter,
        classApplied: classFilter,
        academicYear: yearFilter,
        source: sourceFilter,
        page,
        limit,
      },
    ],
    queryFn: async () => {
      const res = await apiClient.get<EnquiriesResponse>("/api/v1/admissions/enquiries", {
        params: {
          search: debouncedSearch || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          classApplied: classFilter !== "ALL" ? classFilter : undefined,
          academicYear: yearFilter !== "ALL" ? yearFilter : undefined,
          source: sourceFilter !== "ALL" ? sourceFilter : undefined,
          page,
          limit,
        },
      });
      return res;
    },
    staleTime: 15 * 1000,
  });

  // Current selected enquiry object
  const selectedEnquiry = useMemo(() => {
    if (!selectedEnquiryId || !data?.data) return null;
    return data.data.find((e) => e._id === selectedEnquiryId || e.enquiryId === selectedEnquiryId) || null;
  }, [selectedEnquiryId, data]);

  // Mutation: Update Status
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, contactMethod }: { id: string; status: string; contactMethod?: string }) => {
      return await apiClient.patch(`/api/v1/admissions/enquiries/${id}/status`, {
        status,
        contactMethod,
      });
    },
    onSuccess: (_, variables) => {
      toast.success(`Enquiry status changed to ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ["admissions-enquiries"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  // Mutation: Assign Staff
  const assignMutation = useMutation({
    mutationFn: async ({ id, name, role }: { id: string; name: string; role: string }) => {
      const token = localStorage.getItem("token");
      return await apiClient.patch(`/api/v1/admissions/enquiries/${id}/assignment`, {
        userId: "650000000000000000000001", // fallback staff ID
        name,
        role,
      });
    },
    onSuccess: (_, variables) => {
      toast.success(`Enquiry assigned to ${variables.name}`);
      queryClient.invalidateQueries({ queryKey: ["admissions-enquiries"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to assign enquiry");
    },
  });

  // Mutation: Add Follow-up
  const followUpMutation = useMutation({
    mutationFn: async ({
      id,
      date,
      time,
      type,
      notes,
    }: {
      id: string;
      date: string;
      time?: string;
      type: string;
      notes: string;
    }) => {
      return await apiClient.post(`/api/v1/admissions/enquiries/${id}/follow-ups`, {
        date,
        time,
        type,
        notes,
      });
    },
    onSuccess: () => {
      toast.success("Follow-up scheduled successfully!");
      setIsFollowUpModalOpen(false);
      setFollowUpNotes("");
      setFollowUpDate("");
      setFollowUpTime("");
      queryClient.invalidateQueries({ queryKey: ["admissions-enquiries"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to schedule follow-up");
    },
  });

  // Mutation: Add Internal Note
  const noteMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      return await apiClient.post(`/api/v1/admissions/enquiries/${id}/notes`, { text });
    },
    onSuccess: () => {
      toast.success("Internal note added");
      setNoteText("");
      queryClient.invalidateQueries({ queryKey: ["admissions-enquiries"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add note");
    },
  });

  // Mutation: Convert to Application
  const convertMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post(`/api/v1/admissions/enquiries/${id}/convert`, {});
    },
    onSuccess: (res: any) => {
      const appNum = res?.applicationNumber || "Application";
      toast.success(`Enquiry converted to application #${appNum}`);
      setIsConvertModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admissions-enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to convert enquiry");
    },
  });

  // Mutation: Close Enquiry
  const closeMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiClient.post(`/api/v1/admissions/enquiries/${id}/close`, { reason });
    },
    onSuccess: () => {
      toast.success("Enquiry closed");
      setIsCloseModalOpen(false);
      setCloseReason("");
      queryClient.invalidateQueries({ queryKey: ["admissions-enquiries"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to close enquiry");
    },
  });

  // Quick Parent Contact Action: Triggers tel/whatsapp/mailto + sets status to CONTACTED
  const handleContactParent = (method: "Phone" | "WhatsApp" | "Email") => {
    if (!selectedEnquiry) return;

    if (method === "Phone" && selectedEnquiry.parent?.phone) {
      window.open(`tel:${selectedEnquiry.parent.phone}`);
    } else if (method === "WhatsApp" && selectedEnquiry.parent?.phone) {
      const cleanPhone = selectedEnquiry.parent.phone.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(selectedEnquiry.parent.name)},%20this%20is%20GGPS%20School%20Admissions%20Desk.`);
    } else if (method === "Email" && selectedEnquiry.parent?.email) {
      window.open(`mailto:${selectedEnquiry.parent.email}?subject=GGPS%20School%20Admission%20Enquiry%20${selectedEnquiry.enquiryId}`);
    }

    if (selectedEnquiry.status === "NEW") {
      statusMutation.mutate({
        id: selectedEnquiry._id,
        status: "CONTACTED",
        contactMethod: method,
      });
    }
  };

  // Helper status color badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            New
          </span>
        );
      case "CONTACTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Contacted
          </span>
        );
      case "FOLLOW_UP":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Follow-up
          </span>
        );
      case "CONVERTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Converted
          </span>
        );
      case "CLOSED":
      case "LOST":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const metrics = data?.metrics || {
    total: 0,
    new: 0,
    contacted: 0,
    followUp: 0,
    converted: 0,
    closed: 0,
  };

  const enquiriesList = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          1. HEADER & TOP ACTIONS
      ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] text-[11px] font-bold mb-1">
            <span>Admissions Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
            Admissions Enquiries
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track, manage and convert admission enquiries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#000E28] hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Refresh Enquiries"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-[#0050CB]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsNewEnquiryModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold shadow-md shadow-[#0050CB]/25 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Enquiry</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. DYNAMIC KPI CARDS (0 HARDCODED NUMBERS)
      ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* TOTAL */}
        <div className="bg-white dark:bg-[#001438] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">TOTAL</span>
            <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white mt-2">
            {metrics.total}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">All enquiries logged</span>
        </div>

        {/* NEW */}
        <div className="bg-white dark:bg-[#001438] rounded-2xl p-4 sm:p-5 border border-blue-200/80 dark:border-blue-900/60 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">NEW</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#FF690C]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#0050CB] dark:text-[#38BDF8] mt-2">
            {metrics.new}
          </p>
          <span className="text-[11px] text-blue-600/80 dark:text-blue-400 font-medium">Requires initial contact</span>
        </div>

        {/* CONTACTED */}
        <div className="bg-white dark:bg-[#001438] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">CONTACTED</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white mt-2">
            {metrics.contacted}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Spoken with parent</span>
        </div>

        {/* FOLLOW-UP */}
        <div className="bg-white dark:bg-[#001438] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">FOLLOW-UP</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#FF690C] mt-2">
            {metrics.followUp}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Tour or revisit scheduled</span>
        </div>

        {/* CONVERTED */}
        <div className="bg-white dark:bg-[#001438] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">CONVERTED</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics.converted}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Applied to school</span>
        </div>
      </div>

      {/* ========================================================
          3. SEARCH & FILTERS BAR
      ======================================================== */}
      <div className="bg-white dark:bg-[#001438] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Server-Side Debounced Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Enquiry ID, Parent name, Child name, Phone, Email..."
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0050CB]/15 focus:border-[#0050CB]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#000E28] dark:text-white focus:outline-none focus:border-[#0050CB]"
            >
              <option value="ALL">Status: All</option>
              <option value="NEW">Status: New</option>
              <option value="CONTACTED">Status: Contacted</option>
              <option value="FOLLOW_UP">Status: Follow-up</option>
              <option value="CONVERTED">Status: Converted</option>
              <option value="CLOSED">Status: Closed</option>
            </select>

            {/* Class Dropdown */}
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#000E28] dark:text-white focus:outline-none focus:border-[#0050CB]"
            >
              <option value="ALL">Class: All</option>
              <option value="PreKG">PreKG</option>
              <option value="LKG">LKG</option>
              <option value="UKG">UKG</option>
            </select>

            {/* Academic Year */}
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#000E28] dark:text-white focus:outline-none focus:border-[#0050CB]"
            >
              <option value="ALL">Year: All</option>
              <option value="2026–2027">2026–27</option>
              <option value="2025–2026">2025–26</option>
            </select>

            {/* Clear Filters Button */}
            {(statusFilter !== "ALL" || classFilter !== "ALL" || yearFilter !== "ALL" || search !== "") && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setClassFilter("ALL");
                  setYearFilter("ALL");
                  setSourceFilter("ALL");
                  setSearch("");
                  setPage(1);
                }}
                className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. ENQUIRY TABLE (DESKTOP) + CARDS (MOBILE)
      ======================================================== */}
      <div className="bg-white dark:bg-[#001438] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Loading Skeleton State */}
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-md w-1/4 animate-pulse" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-slate-50 dark:bg-slate-900 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : enquiriesList.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#000E28] dark:text-white">No admission enquiries found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== "ALL"
                ? "Try adjusting your search terms or filter settings to view existing records."
                : "New enquiries submitted from the public website or home page will automatically appear here in real-time."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#000E28]/60 text-slate-500 uppercase tracking-wider text-[10px] font-black font-mono">
                    <th className="py-3.5 px-4">Enquiry ID</th>
                    <th className="py-3.5 px-4">Parent</th>
                    <th className="py-3.5 px-4">Child</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Academic Year</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Assigned To</th>
                    <th className="py-3.5 px-4">Created</th>
                    <th className="py-3.5 px-4">Next Follow-up</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {enquiriesList.map((enq) => {
                    const isSelected = selectedEnquiryId === enq._id || selectedEnquiryId === enq.enquiryId;
                    return (
                      <tr
                        key={enq._id}
                        className={`hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors ${
                          isSelected ? "bg-blue-50/70 dark:bg-blue-950/40" : ""
                        }`}
                      >
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0050CB] dark:text-[#38BDF8]">
                          {enq.enquiryId}
                        </td>

                        {/* Parent */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[#000E28] dark:text-white block">
                            {enq.parent?.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {enq.parent?.relationship || "Parent"}
                          </span>
                        </td>

                        {/* Child */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {enq.child?.name}
                        </td>

                        {/* Class */}
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8]">
                            {enq.child?.classApplied}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                          <a
                            href={`tel:${enq.parent?.phone}`}
                            className="hover:text-[#0050CB] inline-flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-[#FF690C]" />
                            <span>{enq.parent?.phone}</span>
                          </a>
                        </td>

                        {/* Year */}
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {enq.academicYear}
                        </td>

                        {/* Source */}
                        <td className="py-3.5 px-4 text-slate-500">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                            {enq.source || "Website"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">{getStatusBadge(enq.status)}</td>

                        {/* Assigned To */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {enq.assignedTo?.name ? (
                            <span className="inline-flex items-center gap-1 font-medium">
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                              {enq.assignedTo.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                          )}
                        </td>

                        {/* Created */}
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(enq.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </td>

                        {/* Next Follow-up */}
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {enq.nextFollowUpDate ? (
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              {new Date(enq.nextFollowUpDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedEnquiryId(enq._id)}
                              className="px-2.5 py-1 rounded-lg bg-[#E5EEFF] hover:bg-[#D4E6FF] text-[#0050CB] font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              View
                            </button>
                            {enq.status !== "CONVERTED" && enq.status !== "CLOSED" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEnquiryId(enq._id);
                                  setIsConvertModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Convert
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Responsive Layout) */}
            <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800 p-3 space-y-3">
              {enquiriesList.map((enq) => (
                <div
                  key={enq._id}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#000E28] space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#0050CB] dark:text-[#38BDF8]">
                      {enq.enquiryId}
                    </span>
                    {getStatusBadge(enq.status)}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#000E28] dark:text-white">
                      {enq.parent?.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Child: <strong className="text-slate-700 dark:text-slate-200">{enq.child?.name}</strong> • Class: <strong className="text-[#0050CB]">{enq.child?.classApplied}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <a href={`tel:${enq.parent?.phone}`} className="inline-flex items-center gap-1 text-[#0050CB] font-mono">
                      <Phone className="w-3 h-3 text-[#FF690C]" /> {enq.parent?.phone}
                    </a>
                    <span>{new Date(enq.createdAt).toLocaleDateString("en-GB")}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedEnquiryId(enq._id)}
                      className="px-3 py-1.5 rounded-lg bg-[#E5EEFF] text-[#0050CB] font-bold text-xs"
                    >
                      View Details
                    </button>
                    {enq.status !== "CONVERTED" && enq.status !== "CLOSED" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEnquiryId(enq._id);
                          setIsConvertModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                      >
                        Convert
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({data?.pagination?.total || 0} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================
          5. ENQUIRY DETAIL DRAWER (SLIDE-OVER)
      ======================================================== */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedEnquiryId(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white dark:bg-[#000E28] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
              
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#001438]/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-lg text-[#0050CB] dark:text-[#38BDF8]">
                      {selectedEnquiry.enquiryId}
                    </span>
                    {getStatusBadge(selectedEnquiry.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Logged on {new Date(selectedEnquiry.createdAt).toLocaleString("en-GB")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEnquiryId(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar text-xs">
                
                {/* 1. STATUS WORKFLOW TIMELINE */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#001438] border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Status Workflow Lifecycle
                  </h3>

                  {/* Horizontal visual stepper */}
                  <div className="grid grid-cols-4 gap-1 text-center font-bold text-[10px]">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedEnquiry.status === "NEW"
                          ? "bg-[#0050CB] text-white shadow-xs"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      ● New
                    </div>
                    <div
                      className={`p-2 rounded-lg ${
                        selectedEnquiry.status === "CONTACTED"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : selectedEnquiry.status === "FOLLOW_UP" || selectedEnquiry.status === "CONVERTED"
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      ● Contacted
                    </div>
                    <div
                      className={`p-2 rounded-lg ${
                        selectedEnquiry.status === "FOLLOW_UP"
                          ? "bg-[#FF690C] text-white shadow-xs"
                          : selectedEnquiry.status === "CONVERTED"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      ● Follow-up
                    </div>
                    <div
                      className={`p-2 rounded-lg ${
                        selectedEnquiry.status === "CONVERTED"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      ● Converted
                    </div>
                  </div>

                  {/* Quick Status Transition Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {selectedEnquiry.status === "NEW" && (
                      <button
                        type="button"
                        onClick={() => statusMutation.mutate({ id: selectedEnquiry._id, status: "CONTACTED" })}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors cursor-pointer"
                      >
                        Mark as Contacted →
                      </button>
                    )}

                    {(selectedEnquiry.status === "NEW" || selectedEnquiry.status === "CONTACTED") && (
                      <button
                        type="button"
                        onClick={() => setIsFollowUpModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold transition-colors cursor-pointer"
                      >
                        Schedule Follow-up ⏰
                      </button>
                    )}

                    {selectedEnquiry.status !== "CONVERTED" && selectedEnquiry.status !== "CLOSED" && (
                      <button
                        type="button"
                        onClick={() => setIsConvertModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
                      >
                        Convert to Application ✓
                      </button>
                    )}

                    {selectedEnquiry.status !== "CLOSED" && (
                      <button
                        type="button"
                        onClick={() => setIsCloseModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                      >
                        Close Enquiry
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. QUICK CONTACT PARENT TOOLBAR */}
                <div className="p-4 rounded-2xl bg-[#E5EEFF]/70 dark:bg-[#001D4D]/50 border border-blue-200/80 dark:border-blue-900/60 space-y-2.5">
                  <h4 className="font-bold text-xs text-[#000E28] dark:text-white flex items-center justify-between">
                    <span>Contact Parent Directly</span>
                    <span className="text-[10px] text-slate-500 font-normal">Auto-logs contact activity</span>
                  </h4>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleContactParent("Phone")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#000E28] hover:bg-blue-50 text-[#0050CB] font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#FF690C]" />
                      <span>Call ({selectedEnquiry.parent?.phone})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleContactParent("WhatsApp")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleContactParent("Email")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#000E28] hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      <span>Email</span>
                    </button>
                  </div>

                  {selectedEnquiry.lastContactAt && (
                    <p className="text-[11px] text-slate-500 pt-1">
                      Last contacted: <strong>{new Date(selectedEnquiry.lastContactAt).toLocaleString("en-GB")}</strong> via {selectedEnquiry.lastContactMethod}
                    </p>
                  )}
                </div>

                {/* 3. PARENT & CHILD INFORMATION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Parent Card */}
                  <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#001438] space-y-2">
                    <span className="font-bold text-[10px] uppercase text-slate-400">Parent / Guardian</span>
                    <p className="font-bold text-sm text-[#000E28] dark:text-white">
                      {selectedEnquiry.parent?.name}
                    </p>
                    <p className="text-slate-500">Relation: {selectedEnquiry.parent?.relationship || "Parent"}</p>
                    <p className="font-mono text-slate-600 dark:text-slate-300">{selectedEnquiry.parent?.phone}</p>
                    <p className="text-slate-500">{selectedEnquiry.parent?.email}</p>
                  </div>

                  {/* Child Card */}
                  <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#001438] space-y-2">
                    <span className="font-bold text-[10px] uppercase text-slate-400">Child Details</span>
                    <p className="font-bold text-sm text-[#000E28] dark:text-white">
                      {selectedEnquiry.child?.name}
                    </p>
                    <p className="text-[#0050CB] font-bold">Class Applied: {selectedEnquiry.child?.classApplied}</p>
                    <p className="text-slate-500">Academic Year: {selectedEnquiry.academicYear}</p>
                    {selectedEnquiry.child?.dateOfBirth && (
                      <p className="text-slate-500">
                        DOB: {new Date(selectedEnquiry.child.dateOfBirth).toLocaleDateString("en-GB")}
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. ENQUIRY NOTES / MESSAGE & SOURCE */}
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#001438] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] uppercase text-slate-400">Parent's Message / Enquiry</span>
                    <span className="text-[10px] font-bold text-slate-400">Source: {selectedEnquiry.source || "Website"}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                    {selectedEnquiry.message || "No special message provided during initial submission."}
                  </p>
                  {selectedEnquiry.preferredVisitDate && (
                    <p className="text-slate-500">
                      Preferred Visit Date: <strong>{new Date(selectedEnquiry.preferredVisitDate).toLocaleDateString("en-GB")}</strong>
                    </p>
                  )}
                </div>

                {/* 5. STAFF ASSIGNMENT */}
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#001438] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] uppercase text-slate-400">Staff Assignment</span>
                    {selectedEnquiry.assignedTo?.name ? (
                      <span className="font-bold text-emerald-600">Assigned: {selectedEnquiry.assignedTo.name}</span>
                    ) : (
                      <span className="text-slate-400 italic">Currently Unassigned</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Assign staff name (e.g. Priya Sharma)..."
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!staffName.trim()) {
                          toast.error("Please enter staff member name");
                          return;
                        }
                        assignMutation.mutate({
                          id: selectedEnquiry._id,
                          name: staffName.trim(),
                          role: staffRole,
                        });
                        setStaffName("");
                      }}
                      className="px-3.5 py-2 rounded-lg bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Assign
                    </button>
                  </div>
                </div>

                {/* 6. FOLLOW-UP HISTORY */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Follow-up History ({selectedEnquiry.followUps?.length || 0})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsFollowUpModalOpen(true)}
                      className="text-[#0050CB] font-bold text-xs hover:underline cursor-pointer"
                    >
                      + Add Follow-up
                    </button>
                  </div>

                  {selectedEnquiry.followUps && selectedEnquiry.followUps.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEnquiry.followUps.map((fu, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#FF690C]">
                              {fu.type} on {new Date(fu.date).toLocaleDateString("en-GB")} {fu.time || ""}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              by {fu.createdBy?.name || "Staff"}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{fu.notes}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No follow-ups recorded yet.</p>
                  )}
                </div>

                {/* 7. INTERNAL STAFF NOTES */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Internal Staff Notes (Confidential)
                  </h4>

                  <div className="space-y-2">
                    {selectedEnquiry.notes && selectedEnquiry.notes.length > 0 ? (
                      selectedEnquiry.notes.map((n, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <strong>{n.createdBy?.name || "Staff Member"}</strong>
                            <span>{new Date(n.createdAt).toLocaleString("en-GB")}</span>
                          </div>
                          <p className="text-slate-700 dark:text-amber-100">{n.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic">No internal staff notes yet.</p>
                    )}

                    {/* Add note input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add an internal note (e.g. Parent requested Friday visit)..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && noteText.trim()) {
                            noteMutation.mutate({ id: selectedEnquiry._id, text: noteText.trim() });
                          }
                        }}
                        className="flex-1 h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!noteText.trim()) return;
                          noteMutation.mutate({ id: selectedEnquiry._id, text: noteText.trim() });
                        }}
                        className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>

                {/* 8. CONVERSION STATUS (IF CONVERTED) */}
                {selectedEnquiry.conversion?.applicationNumber && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-1 text-emerald-900 dark:text-emerald-200">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Converted to Formal Application
                    </p>
                    <p className="text-xs">
                      Application Number: <strong>{selectedEnquiry.conversion.applicationNumber}</strong>
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Converted on {new Date(selectedEnquiry.conversion.convertedAt || "").toLocaleDateString("en-GB")} by {selectedEnquiry.conversion.convertedBy?.name || "Admin"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. CONVERT TO APPLICATION MODAL
      ======================================================== */}
      {isConvertModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#000E28] dark:text-white">
                  Convert to Admission Application
                </h3>
                <p className="text-xs text-slate-500">Enquiry {selectedEnquiry.enquiryId}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-xs space-y-2 border border-slate-200/80 dark:border-slate-800">
              <p>
                <strong>Child:</strong> {selectedEnquiry.child?.name}
              </p>
              <p>
                <strong>Grade Applied:</strong> Class {selectedEnquiry.child?.classApplied}
              </p>
              <p>
                <strong>Parent:</strong> {selectedEnquiry.parent?.name} ({selectedEnquiry.parent?.phone})
              </p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                This will create a formal Admission record in the Admissions pipeline, generate a unique Application Number, and update the status of this enquiry to CONVERTED.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => convertMutation.mutate(selectedEnquiry._id)}
                disabled={convertMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {convertMutation.isPending ? "Converting..." : "Confirm Conversion ✓"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          7. SCHEDULE FOLLOW-UP MODAL
      ======================================================== */}
      {isFollowUpModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-[#000E28] dark:text-white">
                Schedule Follow-up for {selectedEnquiry.enquiryId}
              </h3>
              <button type="button" onClick={() => setIsFollowUpModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Date <span className="text-[#FF690C]">*</span>
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Time
                </label>
                <input
                  type="time"
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Type
                </label>
                <select
                  value={followUpType}
                  onChange={(e) => setFollowUpType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="Phone">Phone Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="Visit">Campus Visit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Objectives <span className="text-[#FF690C]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="e.g. Call parent regarding nursery timings and transport availability..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!followUpDate || !followUpNotes.trim()) {
                    toast.error("Please enter date and notes");
                    return;
                  }
                  followUpMutation.mutate({
                    id: selectedEnquiry._id,
                    date: followUpDate,
                    time: followUpTime || undefined,
                    type: followUpType,
                    notes: followUpNotes.trim(),
                  });
                }}
                disabled={followUpMutation.isPending}
                className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold transition-colors cursor-pointer"
              >
                {followUpMutation.isPending ? "Scheduling..." : "Save Follow-up"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          8. CLOSE ENQUIRY MODAL
      ======================================================== */}
      {isCloseModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                Close Enquiry {selectedEnquiry.enquiryId}
              </h3>
              <button type="button" onClick={() => setIsCloseModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-300">
              Please specify the closure reason (e.g., Parent opted for other school, relocated, not responsive).
            </p>

            <textarea
              rows={3}
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder="Reason for closure..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => closeMutation.mutate({ id: selectedEnquiry._id, reason: closeReason.trim() })}
                disabled={closeMutation.isPending}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer"
              >
                {closeMutation.isPending ? "Closing..." : "Close Enquiry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          9. STAFF "+ NEW ENQUIRY" MODAL (PHONE / WALK-IN LOGGING)
      ======================================================== */}
      {isNewEnquiryModalOpen && (
        <StaffNewEnquiryModal
          onClose={() => setIsNewEnquiryModalOpen(false)}
          onSuccess={() => {
            setIsNewEnquiryModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["admissions-enquiries"] });
          }}
        />
      )}
    </div>
  );
}

// Modal component for logging a walk-in / phone enquiry from the admin desk
function StaffNewEnquiryModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [classApplied, setClassApplied] = useState("LKG");
  const [academicYear, setAcademicYear] = useState("2026–2027");
  const [source, setSource] = useState("Referral");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !phone.trim() || !childName.trim()) {
      toast.error("Parent name, phone, and child name are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/api/v1/admissions/enquiries", {
        parentName: parentName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase() || `enquiry_${Date.now()}@ggps.edu`,
        childName: childName.trim(),
        classApplied,
        academicYear,
        source,
        message: message.trim(),
        preferredContactMethod: "Phone",
      });

      toast.success("Enquiry logged successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to log enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-[#000E28] dark:text-white">
            Log New Admission Enquiry
          </h3>
          <button type="button" onClick={onClose}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Rahul Kumar"
                className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98400 XXXXX"
                className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Child Name *
              </label>
              <input
                type="text"
                required
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Arun Kumar"
                className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Class *</label>
              <select
                value={classApplied}
                onChange={(e) => setClassApplied(e.target.value)}
                className="w-full h-9 px-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <option value="PreKG">PreKG</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full h-9 px-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <option value="2026–2027">2026–2027</option>
                <option value="2025–2026">2025–2026</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full h-9 px-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <option value="Referral">Referral</option>
                <option value="Website">Website</option>
                <option value="Home Page">Home Page</option>
                <option value="Other">Walk-in</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notes on parent inquiry..."
              className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold transition-colors cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
