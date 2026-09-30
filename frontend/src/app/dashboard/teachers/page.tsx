"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  BookOpen, Plus, Edit2, Trash2, Search, Phone, Mail, Award, Clock, DollarSign,
  ChevronRight, MoreVertical, FileText, Users, Sparkles, Check, X, ArrowRight,
  Filter, LayoutGrid, List, UserCheck, GraduationCap, ShieldCheck, Download, Eye, UploadCloud
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Card, StatCard, ProfileCard, ActionCard, EmptyStateCard } from "@/components/ui/Card";
import { downloadFile } from "@/lib/fileDownload";
import FilePreviewModal from "@/components/common/FilePreviewModal";
import FileUploadModal from "@/components/common/FileUploadModal";

function TeachersContent() {
  const searchParams = useSearchParams();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedDesignation, setSelectedDesignation] = useState("All Designations");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [activeTab, setActiveTab] = useState<"All" | "FullTime" | "Heads" | "OnLeave">("All");

  const [showModal, setShowModal] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  // Teacher Documents State
  const [selectedTeacherForDocs, setSelectedTeacherForDocs] = useState<any>(null);
  const [teacherDocs, setTeacherDocs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [activeUploadCategory, setActiveUploadCategory] = useState<string>('qualification');

  const fetchTeacherDocuments = async (teacherId: string) => {
    setIsLoadingDocs(true);
    try {
      const token = localStorage.getItem('token');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiBase}/api/v1/documents/employees?userId=${teacherId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setTeacherDocs(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load teacher documents', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const openTeacherDocuments = (teacher: any) => {
    setSelectedTeacherForDocs(teacher);
    fetchTeacherDocuments(teacher._id);
  };

  const handleVerifyTeacherDoc = async (docId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiBase}/api/v1/documents/employees/${docId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ verificationStatus: status }),
      });
      if (res.ok) {
        toast.success(`Document marked as "${status}"`);
        if (selectedTeacherForDocs) fetchTeacherDocuments(selectedTeacherForDocs._id);
      } else {
        toast.error('Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Status update failed');
    }
  };

  const handleDeleteTeacherDoc = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this staff document?')) return;
    try {
      const token = localStorage.getItem('token');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiBase}/api/v1/documents/employees/${docId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        toast.success('Document deleted');
        if (selectedTeacherForDocs) fetchTeacherDocuments(selectedTeacherForDocs._id);
      } else {
        toast.error('Failed to delete document');
      }
    } catch (err: any) {
      toast.error(err.message || 'Deletion failed');
    }
  };

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowModal(true);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    designation: '',
    qualification: '',
    experienceYears: '',
    salary: '',
    performanceNotes: '',
    roleName: 'Teacher',
    assignedClass: '',
    teachingAssignments: [] as { classId: string, subjectId: string }[]
  });

  const getSampleTeachers = () => [
    {
      _id: "t1",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@globalerp.edu",
      phoneNumber: "+1 (555) 234-5678",
      designation: "Head of Early Phonics & Rhymes",
      qualification: "M.A. Child Psychology, D.E.C.Ed",
      experienceYears: 8,
      salary: 65000,
      assignedClass: "LKG",
      role: { name: "Teacher" },
      status: "Active",
      rating: "4.9 ★"
    },
    {
      _id: "t2",
      firstName: "Robert",
      lastName: "Chen",
      email: "robert.chen@globalerp.edu",
      phoneNumber: "+1 (555) 876-5432",
      designation: "Head of Mathematics",
      qualification: "Ph.D. Mathematics",
      experienceYears: 12,
      salary: 82000,
      assignedClass: "UKG",
      role: { name: "Teacher" },
      status: "Active",
      rating: "5.0 ★"
    },
    {
      _id: "t3",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@globalerp.edu",
      phoneNumber: "+1 (555) 345-6789",
      designation: "English Literature Educator",
      qualification: "M.A. English, B.Ed",
      experienceYears: 6,
      salary: 58000,
      assignedClass: "PreKG",
      role: { name: "Teacher" },
      status: "Active",
      rating: "4.8 ★"
    },
    {
      _id: "t4",
      firstName: "Marcus",
      lastName: "Vance",
      email: "marcus.vance@globalerp.edu",
      phoneNumber: "+1 (555) 456-7890",
      designation: "Computer Science Lead",
      qualification: "M.Tech CSE",
      experienceYears: 9,
      salary: 72000,
      role: { name: "Teacher" },
      status: "Active",
      rating: "4.9 ★"
    },
    {
      _id: "t5",
      firstName: "Elena",
      lastName: "Rostova",
      email: "elena.rostova@globalerp.edu",
      phoneNumber: "+1 (555) 567-8901",
      designation: "General Awareness (EVS) Faculty",
      qualification: "B.Ed, Child Development Specialist",
      experienceYears: 7,
      salary: 61000,
      role: { name: "Teacher" },
      status: "Active",
      rating: "4.7 ★"
    }
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [usersRes, classesRes, subjectsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/academic/subjects`, { headers })
      ]);

      if (usersRes.ok) {
        const allUsers = await usersRes.json();
        const staff = allUsers.filter((u: any) => u.role?.name === 'Teacher' || u.role?.name === 'Principal' || u.role?.name === 'Staff');
        setTeachers(staff.length > 0 ? staff : getSampleTeachers());
      } else {
        setTeachers(getSampleTeachers());
      }
      if (classesRes.ok) setClasses(await classesRes.json());
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
    } catch (error) {
      console.error(error);
      setTeachers(getSampleTeachers());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', email: '', password: '',
      phoneNumber: '', designation: '', qualification: '',
      experienceYears: '', salary: '', performanceNotes: '', roleName: 'Teacher',
      assignedClass: '',
      teachingAssignments: []
    });
    setEditingTeacherId(null);
    setShowModal(false);
  };

  const openEdit = (teacher: any) => {
    setEditingTeacherId(teacher._id);
    setFormData({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      password: '',
      phoneNumber: teacher.phoneNumber || '',
      designation: teacher.designation || '',
      qualification: teacher.qualification || '',
      experienceYears: teacher.experienceYears?.toString() || '',
      salary: teacher.salary?.toString() || '',
      performanceNotes: teacher.performanceNotes || '',
      roleName: teacher.role?.name || 'Teacher',
      assignedClass: teacher.assignedClass || '',
      teachingAssignments: teacher.teachingAssignments ? teacher.teachingAssignments.map((ta: any) => ({
        classId: ta.classId?._id || ta.classId || '',
        subjectId: ta.subjectId?._id || ta.subjectId || ''
      })) : []
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher record?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success("Teacher record deleted");
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingTeacherId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/${editingTeacherId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/users`;
        
      const payload = { ...formData };
      if (!editingTeacherId && !payload.password) {
        payload.password = 'TeacherPassword123!';
      }
      if (editingTeacherId && !payload.password) {
        delete (payload as any).password;
      }
      if (payload.experienceYears) (payload as any).experienceYears = Number(payload.experienceYears);
      if (payload.salary) (payload as any).salary = Number(payload.salary);

      const res = await fetch(url, {
        method: editingTeacherId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingTeacherId ? 'Teacher profile updated!' : 'Teacher added successfully!');
        resetForm();
        fetchData();
      } else {
        toast.error('Error saving teacher data');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error saving teacher');
    } finally {
      setIsSaving(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = (t.firstName + " " + t.lastName).toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.designation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.assignedClass || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "All Roles" || (t.role || 'Teacher') === selectedRole || (t.designation || '').toLowerCase().includes(selectedRole.toLowerCase());
    const matchesClass = selectedClass === "All Classes" || (t.assignedClass || '') === selectedClass;
    return matchesSearch && matchesRole && matchesClass;
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6 font-sans text-[#000E28] dark:text-white pb-16">
      
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <Link href="/dashboard" className="hover:text-[#0050CB]">Home</Link>
        <span>&gt;</span>
        <span className="text-slate-600 dark:text-slate-300 font-semibold">Teacher Management</span>
      </div>

      {/* HERO BANNER SECTION */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#EBF3FF] via-[#F3F7FF] to-[#E5EEFF] dark:from-[#001A48] dark:via-[#001438] dark:to-[#002766] p-6 sm:p-8 border border-blue-100/60 dark:border-slate-800 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0050CB] text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight">
                Teacher Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-medium mt-1 max-w-xl">
                Manage teacher profiles, academic qualifications, department assignments, performance logs, and daily workload.
              </p>
            </div>
          </div>

          {/* Right Quote Container */}
          <div className="hidden lg:flex flex-col items-center justify-center p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border border-white/80 dark:border-slate-800 shadow-xs max-w-xs text-center">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 italic">
              “ Teaching is the art of
            </p>
            <p className="text-xs font-bold text-[#000E28] dark:text-white italic relative inline-block mt-0.5">
              assisting discovery. ”
              <span className="block h-0.5 bg-[#0050CB] w-12 mx-auto mt-1 rounded-full"></span>
            </p>
          </div>
        </div>
      </div>

      {/* 4 METRIC CARDS ROW + ADD NEW TEACHER BUTTON */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
          <StatCard
            title="Total Faculty"
            value="24"
            icon={Users}
            trend={{ value: "4% MoM", isPositive: true }}
            subtitle="Verified Educators"
          />
          <StatCard
            title="Active Teachers"
            value="20"
            icon={UserCheck}
            trend={{ value: "2% MoM", isPositive: true }}
            iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
            iconTextColor="text-[#12B76A]"
            subtitle="On Campus Today"
          />
          <StatCard
            title="Dept Heads"
            value="5"
            icon={Award}
            trend={{ value: "1% MoM", isPositive: true }}
            iconBgColor="bg-purple-50 dark:bg-purple-950/40"
            iconTextColor="text-purple-600 dark:text-purple-400"
            subtitle="Subject Leads"
          />
          <StatCard
            title="Avg Experience"
            value="8.4 Yrs"
            icon={Clock}
            trend={{ value: "5% MoM", isPositive: true }}
            iconBgColor="bg-amber-50 dark:bg-amber-950/40"
            iconTextColor="text-[#F59E0B]"
            subtitle="Senior Staff Ratio"
          />
        </div>

        {/* Add New Teacher Button on Far Right */}
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0757D5] hover:bg-[#1469E8] text-white text-xs font-extrabold shadow-md cursor-pointer transition-all shrink-0 hover-button-micro"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: TEACHER LIST CONTAINER (COL-8) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teachers by name, email, or designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0050CB]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shrink-0"
              >
                <option value="All Roles">All Roles</option>
                <option value="Teacher">Teacher</option>
                <option value="Principal">Principal</option>
                <option value="Staff">Staff</option>
              </select>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shrink-0"
              >
                <option value="All Classes">All Classes</option>
                <option value="PreKG">PreKG</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
              </select>

              <button
                type="button"
                onClick={() => { setSelectedRole("All Roles"); setSelectedClass("All Classes"); setSearchQuery(""); setCurrentPage(1); }}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Reset Filters"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-[#0050CB] shadow-xs" : "text-slate-400"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#0050CB] text-white shadow-xs" : "text-slate-400"}`}
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
              All Teachers ({filteredTeachers.length})
            </button>
            <button
              onClick={() => setActiveTab("FullTime")}
              className={`pb-2 transition-colors cursor-pointer border-b-2 ${activeTab === "FullTime" ? "border-[#0050CB] text-[#0050CB] font-black" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              Full Time
            </button>
            <button
              onClick={() => setActiveTab("Heads")}
              className={`pb-2 transition-colors cursor-pointer border-b-2 ${activeTab === "Heads" ? "border-[#0050CB] text-[#0050CB] font-black" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              Dept Heads
            </button>
          </div>

          {/* TEACHER LIST ITEMS */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">Loading teacher profiles...</div>
            ) : filteredTeachers.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">No teachers found matching search.</div>
            ) : (
              paginatedTeachers.map((t) => (
                <div
                  key={t._id}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#000E28] hover:border-[#0050CB] transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Avatar Initial Ring */}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0050CB] to-[#38BDF8] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      {t.firstName?.[0] || 'T'}
                    </div>

                    {/* Teacher Details */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-[#000E28] dark:text-white leading-tight">
                          {t.firstName} {t.lastName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#E5EEFF] text-[#0050CB]">
                          {t.designation || t.role?.name || 'Faculty'}
                        </span>
                        {t.assignedClass && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/40 text-[#FF690C] border border-[#FF690C]/20">
                            Class: {t.assignedClass}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {t.qualification || 'M.Sc, B.Ed'} • {t.experienceYears ? `${t.experienceYears} Years Exp.` : 'Senior Staff'}
                      </p>

                      <div className="flex items-center gap-4 pt-1 text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {t.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {t.phoneNumber || '+1 555-0192'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700">
                      {t.rating || '4.9 ★'}
                    </span>

                    <button 
                      onClick={() => openTeacherDocuments(t)}
                      className="p-1.5 rounded-lg bg-[#E5EEFF] dark:bg-blue-950/40 text-[#0050CB] hover:bg-blue-100 cursor-pointer"
                      title="Faculty Documents Vault"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    <button 
                      onClick={() => openEdit(t)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0050CB] cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button 
                      onClick={() => handleDelete(t._id)}
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* LIST FOOTER & PAGINATION */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
            <span>Showing {filteredTeachers.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, filteredTeachers.length)} of {filteredTeachers.length} teachers</span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-[#0050CB] text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS + SUMMARY + BRANDING CARD (COL-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* QUICK ACTIONS PANEL */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
              <h3 className="text-sm font-black text-[#000E28] dark:text-white">Quick Actions</h3>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => { resetForm(); setShowModal(true); }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0050CB] text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>Add New Teacher</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0050CB]" />
              </button>

              <Link 
                href="/dashboard/lesson-planner"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span>Subject Allocations</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
              </Link>

              <Link 
                href="/dashboard/payroll"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-xs font-bold text-[#000E28] dark:text-white transition-all border border-slate-100 dark:border-slate-800 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span>Staff Payroll</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </Link>
            </div>
          </div>

          {/* STAFF SUMMARY PANEL */}
          <div className="bg-white dark:bg-[#000E28] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
                <h3 className="text-sm font-black text-[#000E28] dark:text-white">Faculty Telemetry</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Term 1 ∨</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0050CB] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-base font-black text-[#000E28] dark:text-white leading-none">24</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Faculty</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-base font-black text-[#000E28] dark:text-white leading-none">32</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Subjects</p>
                </div>
              </div>
            </div>
          </div>

          {/* TEACHER EXCELLENCE BRANDING CARD */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EEF2FF] via-[#F3E8FF] to-[#E0E7FF] dark:from-[#1E1B4B] dark:via-[#2E1065] dark:to-[#3B0764] p-5 border border-purple-200/60 dark:border-purple-900/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1 max-w-[180px]">
              <h4 className="text-xs font-black text-[#000E28] dark:text-white leading-tight">
                Teacher Excellence<br />Empower Educators
              </h4>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-300">
                Track workloads, foster academic growth.
              </p>
              <Link
                href="/dashboard/lesson-planner"
                className="mt-2 w-7 h-7 rounded-full bg-[#0050CB] hover:bg-[#0041A8] text-white flex items-center justify-center cursor-pointer shadow-xs transition-colors"
                title="Open Lesson Planner"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="w-16 h-16 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-3xl shadow-sm shrink-0">
              🎓
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
        <div>
          <span className="font-black text-[#000E28] dark:text-white">Global International School ERP</span> &copy; 2026. All rights reserved.
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

      {/* CREATE / EDIT TEACHER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-lg p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-[#000E28] dark:text-white">
                {editingTeacherId ? 'Edit Teacher Profile' : 'Add New Teacher'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Teaching Class *</label>
                <select
                  value={formData.assignedClass}
                  onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                  required
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="">Select Teaching Class (LKG, PreKG, UKG)</option>
                  <option value="PreKG">PreKG</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Early Literacy & Phonics Lead"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. D.E.C.Ed, Montessori Certified"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    placeholder="e.g. 8"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Salary (₹ / Year)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g. 65000"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#0050CB] text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Documents Vault Modal */}
      {selectedTeacherForDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#000E28] dark:text-white">
                    Faculty Document Vault: {selectedTeacherForDocs.firstName} {selectedTeacherForDocs.lastName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedTeacherForDocs.designation || 'Educator'} • ID: {selectedTeacherForDocs._id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadDocOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0050CB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                </button>
                <button
                  onClick={() => setSelectedTeacherForDocs(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Categories Checklist & Items */}
            {isLoadingDocs ? (
              <div className="p-12 text-center text-xs text-slate-500">Loading verified documentation...</div>
            ) : teacherDocs.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {teacherDocs.map((doc: any) => (
                  <div key={doc._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0050CB] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#000E28] dark:text-white">{doc.title}</h4>
                        <p className="text-[11px] text-slate-400">
                          {doc.category} • {doc.fileName} • {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : 'Verified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.verificationStatus === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : doc.verificationStatus === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {doc.verificationStatus || 'Pending'}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setPreviewDoc({
                            _id: doc.fileRecordId?._id || doc._id,
                            originalName: doc.fileName || doc.title,
                            mimeType: doc.mimeType || 'application/pdf',
                            size: doc.fileSize || 1048576,
                            url: doc.documentUrl || `/api/v1/files/${doc.fileRecordId?._id || doc._id}/preview`,
                          });
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-[#0050CB] text-[#0050CB] cursor-pointer"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          downloadFile(
                            doc.documentUrl || doc.fileRecordId?._id || doc._id,
                            `GGPS-Staff-${selectedTeacherForDocs.firstName}-${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`
                          );
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-[#0050CB] text-[#0050CB] cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVerifyTeacherDoc(doc._id, 'Verified')}
                        className="px-2 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                      >
                        Verify
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVerifyTeacherDoc(doc._id, 'Rejected')}
                        className="px-2 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTeacherDoc(doc._id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-3 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  No employee documents on file yet for {selectedTeacherForDocs.firstName}.
                </p>
                <button
                  type="button"
                  onClick={() => setIsUploadDocOpen(true)}
                  className="px-3 py-1.5 bg-[#0050CB] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Upload First Document
                </button>
              </div>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedTeacherForDocs(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <FilePreviewModal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          file={previewDoc}
          onDownload={() => {
            downloadFile(previewDoc._id || previewDoc.url, previewDoc.originalName);
          }}
        />
      )}

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        category="teachers"
        entityType="Employee"
        entityId={selectedTeacherForDocs?._id}
        onUploadComplete={() => {
          toast.success("Staff document successfully uploaded and verified in vault!");
          if (selectedTeacherForDocs) {
            fetchTeacherDocuments(selectedTeacherForDocs._id);
          }
        }}
      />

    </div>
  );
}

export default function TeachersPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 font-bold">
        Loading GGPS School Faculty Directory...
      </div>
    }>
      <TeachersContent />
    </Suspense>
  );
}

