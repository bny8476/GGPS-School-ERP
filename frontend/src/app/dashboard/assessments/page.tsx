"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, Plus, Search, ChevronDown, CheckCircle2, Award, User, 
  Calendar, BookOpen, X, Printer, Download, Filter, Layers, Users, 
  Star, BarChart2, Lightbulb, ArrowRight, Home, Trash2, Eye, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/utils';
import { authFetch } from '@/lib/apiClient';
import { printDocument } from '@/lib/exportUtils';
import { downloadPdf } from '@/lib/fileDownload';
import { AssessmentEntrySchema } from '@/schemas';
import FieldError from '@/components/ui/FieldError';

const RUBRIC_TEMPLATE = [
  { category: 'Motor Skills', skill: 'Holds pencil correctly and traces lines' },
  { category: 'Motor Skills', skill: 'Uses scissors to cut along a straight line' },
  { category: 'Motor Skills', skill: 'Can run, jump, and maintain balance' },
  { category: 'Social Skills', skill: 'Shares toys and cooperates with peers' },
  { category: 'Social Skills', skill: 'Follows multi-step instructions' },
  { category: 'Social Skills', skill: 'Expresses emotions appropriately' },
  { category: 'Cognitive', skill: 'Recognizes primary colors and basic shapes' },
  { category: 'Cognitive', skill: 'Counts objects up to 10' },
  { category: 'Cognitive', skill: 'Shows curiosity and asks questions' }
];

// Hero Header Vector Artwork matching reference image
function AssessmentsHeroIllustration() {
  return (
    <div className="hidden lg:flex items-center gap-3 relative py-2 px-3.5 bg-[#F0F6FE] dark:bg-blue-950/40 rounded-2xl border border-[#DCEBFF] dark:border-blue-900/40 select-none">
      <svg
        width="145"
        height="62"
        viewBox="0 0 145 62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-xs"
      >
        <defs>
          <linearGradient id="assessBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0050CB" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="assessCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* Soft background foliage/glow */}
        <g opacity="0.6">
          <path d="M 12 45 C 4 35 2 20 12 12 C 18 20 20 32 12 45 Z" fill="#BFDBFE" />
          <path d="M 132 45 C 140 35 142 20 132 12 C 126 20 124 32 132 45 Z" fill="#BFDBFE" />
        </g>

        {/* 1. Document with Download Arrow on Left */}
        <g transform="translate(20, 10)">
          {/* Document Base */}
          <rect x="0" y="0" width="34" height="42" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <path d="M 22 0 L 34 12 L 22 12 Z" fill="#E2E8F0" />
          {/* Header line */}
          <rect x="5" y="8" width="14" height="2.5" rx="1" fill="#93C5FD" />
          {/* Download Circle Badge */}
          <circle cx="17" cy="24" r="8" fill="#E0F2FE" />
          <path d="M 17 19 L 17 26 M 14 23 L 17 26 L 20 23" stroke="#0050CB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Mini bar chart */}
          <rect x="5" y="34" width="3.5" height="5" rx="0.8" fill="#0050CB" />
          <rect x="10.5" y="31" width="3.5" height="8" rx="0.8" fill="#38BDF8" />
          <rect x="16" y="33" width="3.5" height="6" rx="0.8" fill="#60A5FA" />
          <rect x="21.5" y="30" width="3.5" height="9" rx="0.8" fill="#0050CB" />
        </g>

        {/* 2. Mortarboard Graduation Cap on Right */}
        <g transform="translate(60, 16)">
          {/* Diamond Top */}
          <path d="M 28 4 L 54 15 L 28 24 L 2 15 Z" fill="url(#assessBlueGrad)" stroke="#1D4ED8" strokeWidth="0.8" />
          {/* Cap Base */}
          <path d="M 14 19 Q 28 25 42 19 L 42 24 Q 28 30 14 24 Z" fill="#002870" />
          {/* Highlight facet */}
          <path d="M 28 4 L 54 15 L 28 24 Z" fill="#1E40AF" opacity="0.3" />
          {/* Cap Button */}
          <circle cx="28" cy="14" r="2.2" fill="#60A5FA" />
          {/* Tassel */}
          <path d="M 28 14 C 20 14 12 18 10 25 C 9 29 10 34 9 37" fill="none" stroke="#93C5FD" strokeWidth="1.4" strokeLinecap="round" />
          <rect x="7" y="35" width="4" height="6" rx="1.5" fill="#38BDF8" />
        </g>
      </svg>

      {/* Text matching reference */}
      <div className="flex flex-col text-left pr-2">
        <span className="text-[#0050CB] dark:text-blue-400 text-xs font-bold tracking-tight">Track Progress</span>
        <span className="text-[#0050CB] dark:text-blue-400 text-xs font-bold tracking-tight">Build Brighter Futures</span>
        <div className="h-0.5 w-7 bg-blue-300 dark:bg-blue-500 rounded-full mt-1.5" />
      </div>
    </div>
  );
}

// Empty State Folder & Magnifying Glass Illustration matching reference image
function EmptyFolderIllustration() {
  return (
    <div className="relative select-none mb-3">
      <svg
        width="140"
        height="100"
        viewBox="0 0 140 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-sm"
      >
        <defs>
          <linearGradient id="folderBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0050CB" />
          </linearGradient>
          <linearGradient id="magnifierGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0050CB" />
          </linearGradient>
        </defs>

        {/* Soft foliage/clouds behind folder */}
        <g opacity="0.45">
          <path d="M 24 70 C 12 55 10 38 20 25 C 28 35 32 50 24 70 Z" fill="#BFDBFE" />
          <path d="M 116 70 C 128 55 130 38 120 25 C 112 35 108 50 116 70 Z" fill="#BFDBFE" />
          <path d="M 16 55 C 8 46 8 32 16 22 C 22 30 24 42 16 55 Z" fill="#93C5FD" />
          <path d="M 124 55 C 132 46 132 32 124 22 C 118 30 116 42 124 55 Z" fill="#93C5FD" />
        </g>

        {/* Main Folder Base */}
        <g transform="translate(32, 18)">
          {/* Back Tab */}
          <path d="M 4 8 Q 4 2 10 2 L 28 2 Q 33 2 36 6 L 41 12 L 68 12 Q 74 12 74 18 L 74 60 Q 74 66 68 66 L 10 66 Q 4 66 4 60 Z" fill="#60A5FA" />
          
          {/* White Sheets inside folder */}
          <rect x="12" y="10" width="54" height="46" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <line x1="20" y1="20" x2="44" y2="20" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="28" x2="56" y2="28" stroke="#F1F5F9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="36" x2="50" y2="36" stroke="#F1F5F9" strokeWidth="2.5" strokeLinecap="round" />

          {/* Front Folder Flap */}
          <path d="M 0 20 Q 0 14 6 14 L 30 14 L 38 20 L 72 20 Q 78 20 78 26 L 78 62 Q 78 68 72 68 L 6 68 Q 0 68 0 62 Z" fill="url(#folderBlueGrad)" />
        </g>

        {/* Magnifying Glass Overlapping */}
        <g transform="translate(74, 44)">
          {/* Glass circle outline */}
          <circle cx="20" cy="20" r="16" fill="#FFFFFF" fillOpacity="0.8" stroke="url(#magnifierGrad)" strokeWidth="4.5" />
          {/* Glass reflection */}
          <path d="M 12 12 Q 20 6 28 12" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
          {/* Handle */}
          <path d="M 32 32 L 46 46" stroke="url(#magnifierGrad)" strokeWidth="5.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedReportCard, setSelectedReportCard] = useState<any | null>(null);

  // Filters State matching reference
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [termFilter, setTermFilter] = useState('All Terms');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('Section A');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [teacherComments, setTeacherComments] = useState('');
  const [rubricScores, setRubricScores] = useState<Record<string, string>>({});
  const [assessmentErrors, setAssessmentErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setIsLoading(false);
        router.push('/login?redirect=/dashboard/assessments');
        return;
      }
      const apiBase = getApiBaseUrl();

      const [assmRes, stuRes, classRes] = await Promise.allSettled([
        authFetch(`${apiBase}/api/assessments`),
        authFetch(`${apiBase}/api/students`),
        authFetch(`${apiBase}/api/classes`)
      ]);

      if (assmRes.status === 'fulfilled') {
        if (assmRes.value.status === 401) {
          router.push('/login?redirect=/dashboard/assessments');
          return;
        }
        if (assmRes.value.ok) {
          const data = await assmRes.value.json().catch(() => null);
          setAssessments(Array.isArray(data) ? data : (data?.data || []));
        }
      }
      if (stuRes.status === 'fulfilled' && stuRes.value.ok) {
        const data = await stuRes.value.json().catch(() => null);
        setStudents(Array.isArray(data) ? data : (data?.data || []));
      }
      if (classRes.status === 'fulfilled' && classRes.value.ok) {
        const data = await classRes.value.json().catch(() => null);
        setClasses(Array.isArray(data) ? data : (data?.data || []));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScoreChange = (skill: string, score: string) => {
    setRubricScores(prev => ({ ...prev, [skill]: score }));
  };

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = AssessmentEntrySchema.safeParse({
      studentId: selectedStudent,
      term: selectedTerm,
      teacherComments,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : "general";
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setAssessmentErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || "Please select a student");
      return;
    }
    setAssessmentErrors({});

    const rubrics = RUBRIC_TEMPLATE.map(r => ({
      category: r.category,
      skill: r.skill,
      score: rubricScores[r.skill] || 'Developing'
    }));

    setIsSaving(true);
    try {
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/assessments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId: selectedStudent,
          term: selectedTerm,
          class: selectedClass || undefined,
          section: selectedSection || undefined,
          rubrics,
          teacherComments
        })
      });

      if (res.ok) {
        toast.success("Assessment saved successfully!");
        setShowAddModal(false);
        fetchData();
        // Reset form
        setSelectedStudent('');
        setSelectedClass('');
        setSelectedSection('Section A');
        setTeacherComments('');
        setRubricScores({});
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Failed to save assessment');
      }
    } catch (error) {
      toast.error('Error saving assessment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment record?')) return;
    try {
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/assessments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Assessment record deleted');
        fetchData();
        if (selectedReportCard?._id === id) {
          setSelectedReportCard(null);
        }
      } else {
        toast.error('Failed to delete assessment');
      }
    } catch (error) {
      toast.error('Network error deleting assessment');
    }
  };

  // Sample CSV Download Trigger
  const handleDownloadSample = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Student Name,Roll Number,Class,Section,Term,Motor Skills,Social Skills,Cognitive Skills,Teacher Remarks\n" +
      "Aarav Sharma,101,Grade 1,Section A,Term 1,Mastered,Mastered,Developing,Demonstrates excellent creativity and active participation.\n" +
      "Ananya Patel,102,Grade 1,Section A,Term 1,Developing,Mastered,Mastered,Exceptional cognitive aptitude and peer cooperation.\n" +
      "Vivaan Verma,103,Grade 1,Section B,Term 1,Mastered,Developing,Developing,Good focus in motor activities; continue reading practice.";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_assessment_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample assessment template downloaded");
  };

  // Filtered Assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const studentName = a.childId ? `${a.childId.firstName || ''} ${a.childId.lastName || ''}`.toLowerCase() : '';
      const rollNo = a.childId?.rollNumber ? String(a.childId.rollNumber).toLowerCase() : '';
      const cls = (a.childId?.grade || a.class || '').toLowerCase();
      const sec = (a.childId?.section || a.section || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = !q || studentName.includes(q) || rollNo.includes(q) || cls.includes(q) || sec.includes(q);
      const matchesClass = classFilter === 'All Classes' || cls.includes(classFilter.toLowerCase());
      const matchesSection = sectionFilter === 'All Sections' || sec.includes(sectionFilter.toLowerCase());
      const matchesTerm = termFilter === 'All Terms' || (a.term || '').toLowerCase() === termFilter.toLowerCase();

      return matchesSearch && matchesClass && matchesSection && matchesTerm;
    });
  }, [assessments, searchQuery, classFilter, sectionFilter, termFilter]);

  // Metric Stats
  const stats = useMemo(() => {
    const total = assessments.length;
    const reportCards = assessments.filter(a => a.rubrics && a.rubrics.length > 0).length;
    const generated = assessments.filter(a => a.status === 'Generated' || a.isPublished).length;
    const pending = assessments.filter(a => a.status === 'Pending' || (!a.isPublished && a.status !== 'Generated')).length;
    return { total, reportCards, generated, pending };
  }, [assessments]);

  const categories = Array.from(new Set(RUBRIC_TEMPLATE.map(r => r.category)));

  const getScoreBadge = (score: string) => {
    switch (score) {
      case 'Mastered': return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">Mastered</span>;
      case 'Developing': return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">Developing</span>;
      case 'Beginning': return <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-200">Beginning</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-saas pb-24">
      {/* Top Breadcrumb Navigation matching reference */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/dashboard" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
          Dashboard
        </Link>
        <span className="text-slate-400">&rsaquo;</span>
        <Link href="/dashboard/academic" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
          Academics
        </Link>
        <span className="text-slate-400">&rsaquo;</span>
        <span className="font-bold text-[#000E28] dark:text-white">
          Assessments &amp; Reports
        </span>
      </div>

      {/* Hero Header Card matching reference */}
      <div className="bg-white dark:bg-[#07152F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden relative">
        <div className="flex items-start gap-4 z-10">
          <div className="w-13 h-13 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0 text-[#0050CB] dark:text-blue-400 shadow-2xs">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="10" width="4.5" height="11" rx="2" fill="#0050CB" />
              <rect x="9.75" y="4" width="4.5" height="17" rx="2" fill="#0050CB" />
              <rect x="16.5" y="7" width="4.5" height="14" rx="2" fill="#0050CB" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-[26px] font-black text-[#000E28] dark:text-white tracking-tight">
              Assessments &amp; Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              View, manage and download assessment records, report cards and academic reports.
            </p>
          </div>
        </div>

        {/* Right Artwork graphic banner */}
        <AssessmentsHeroIllustration />
      </div>

      {/* 4 Metric Cards in 1 Row matching reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assessments */}
        <div className="bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 flex items-center justify-center shrink-0 text-[#0050CB] dark:text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Assessments</p>
            <h3 className="text-2xl font-black text-[#000E28] dark:text-white">{stats.total}</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-0.5">
              <span>&uarr;</span>
              <span>0% from last term</span>
            </div>
          </div>
        </div>

        {/* Total Report Cards */}
        <div className="bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] dark:bg-emerald-950/60 flex items-center justify-center shrink-0 text-[#10B981] dark:text-emerald-400">
            <Star className="w-6 h-6 fill-[#10B981]" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Report Cards</p>
            <h3 className="text-2xl font-black text-[#000E28] dark:text-white">{stats.reportCards}</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-0.5">
              <span>&uarr;</span>
              <span>0% from last term</span>
            </div>
          </div>
        </div>

        {/* Generated Reports */}
        <div className="bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] dark:bg-purple-950/60 flex items-center justify-center shrink-0 text-[#9333EA] dark:text-purple-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Generated Reports</p>
            <h3 className="text-2xl font-black text-[#000E28] dark:text-white">{stats.generated}</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-0.5">
              <span>&uarr;</span>
              <span>0% from last term</span>
            </div>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] dark:bg-amber-950/60 flex items-center justify-center shrink-0 text-[#EA580C] dark:text-amber-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Reports</p>
            <h3 className="text-2xl font-black text-[#000E28] dark:text-white">{stats.pending}</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-0.5">
              <span>&uarr;</span>
              <span>0% from last term</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar Container matching reference */}
      <div className="bg-white dark:bg-[#07152F] rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student name, roll number, class or section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Dropdowns and Filter button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* All Classes Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3.5 py-2 bg-white dark:bg-slate-900 shadow-2xs hover:bg-slate-50 transition-colors">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="appearance-none bg-transparent pr-5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
              >
                <option value="All Classes">All Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c.name}>
                    Class {c.name}
                  </option>
                ))}
                {classes.length === 0 && (
                  <>
                    <option value="Pre-KG">Pre-KG</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                  </>
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* All Sections Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3.5 py-2 bg-white dark:bg-slate-900 shadow-2xs hover:bg-slate-50 transition-colors">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="appearance-none bg-transparent pr-5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
              >
                <option value="All Sections">All Sections</option>
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* All Terms Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3.5 py-2 bg-white dark:bg-slate-900 shadow-2xs hover:bg-slate-50 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className="appearance-none bg-transparent pr-5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
              >
                <option value="All Terms">All Terms</option>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Filter Reset Button */}
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setClassFilter('All Classes');
              setSectionFilter('All Sections');
              setTermFilter('All Terms');
              toast.success('Filters reset to default');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Content Container matching reference */}
      <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-2 border-[#0050CB] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading assessment records...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          /* Empty State EXACTLY matching the reference image */
          <div className="p-12 sm:p-16 flex flex-col items-center justify-center text-center">
            {/* 3D Folder + Magnifying Glass Artwork */}
            <EmptyFolderIllustration />

            <h3 className="text-lg sm:text-xl font-bold text-[#000E28] dark:text-white mt-2">
              No assessments or reports found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md font-medium leading-relaxed">
              There are no records available for the selected filters.<br className="hidden sm:inline" />
              Try changing the filters or add a new assessment.
            </p>

            {/* CTAs matching reference */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#0050CB] hover:bg-[#003E9E] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Assessment</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSample}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 text-[#0050CB] dark:text-blue-400 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Download Sample</span>
              </button>
            </div>
          </div>
        ) : (
          /* Table of Assessments when records exist */
          <div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Showing {filteredAssessments.length} assessment record(s)
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0050CB] hover:bg-[#003E9E] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Assessment</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class &amp; Section</th>
                    <th className="py-3 px-4">Term</th>
                    <th className="py-3 px-4">Skills Overview</th>
                    <th className="py-3 px-4">Date Recorded</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredAssessments.map((assessment) => (
                    <tr key={assessment._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#000E28] dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] font-bold flex items-center justify-center text-xs shrink-0">
                            {assessment.childId?.firstName?.[0] || 'S'}
                          </div>
                          <div>
                            <div>{assessment.childId ? `${assessment.childId.firstName} ${assessment.childId.lastName}` : 'Student Record'}</div>
                            {assessment.childId?.rollNumber && (
                              <div className="text-[10px] text-slate-400 font-mono">Roll: {assessment.childId.rollNumber}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {assessment.childId?.grade || assessment.class || 'N/A'} - {assessment.childId?.section || assessment.section || 'A'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0050CB] dark:text-blue-400">
                        {assessment.term || 'Term 1'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {assessment.rubrics?.slice(0, 2).map((r: any, idx: number) => (
                            <span key={idx} className="shrink-0">{getScoreBadge(r.score)}</span>
                          ))}
                          {assessment.rubrics?.length > 2 && (
                            <span className="text-[10px] font-bold text-slate-400">+{assessment.rubrics.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {assessment.date ? new Date(assessment.date).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedReportCard(assessment)}
                          className="px-2.5 py-1 text-xs font-bold text-[#0050CB] hover:underline cursor-pointer"
                        >
                          View Report
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAssessment(assessment._id)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Guidance Banner matching reference */}
      <div className="bg-[#F0F6FE] dark:bg-blue-950/20 border border-[#DCEBFF] dark:border-blue-900/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center text-[#0050CB] dark:text-blue-400 shrink-0 shadow-2xs">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#000E28] dark:text-white">
              Need help with reports?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Learn how to generate, manage and download academic reports for your students.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toast('Academic assessment documentation & guidelines', { icon: '📘' })}
          className="text-[#0050CB] dark:text-blue-400 text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap self-start sm:self-center"
        >
          <span>View Documentation</span>
          <span className="text-sm font-bold">&rarr;</span>
        </button>
      </div>

      {/* MODAL: ADD ASSESSMENT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#000E28] dark:text-white">New Academic Assessment</h3>
                  <p className="text-xs text-slate-400 font-medium">Record developmental skill scores and evaluations.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} className="space-y-5 text-xs">
              {/* Meta Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Student <span className="text-[#FF690C]">*</span>
                  </label>
                  <select
                    required
                    value={selectedStudent}
                    onChange={(e) => {
                      setSelectedStudent(e.target.value);
                      if (assessmentErrors.studentId) setAssessmentErrors(prev => ({ ...prev, studentId: '' }));
                    }}
                    aria-invalid={Boolean(assessmentErrors.studentId)}
                    aria-describedby={assessmentErrors.studentId ? "assess-student-err" : undefined}
                    className={`w-full border rounded-xl p-2.5 font-bold outline-hidden ${
                      assessmentErrors.studentId ? 'border-rose-400 bg-rose-50/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <option value="">-- Choose a student --</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.firstName} {s.lastName} ({s.grade || 'Pre-KG'})
                      </option>
                    ))}
                  </select>
                  <FieldError id="assess-student-err" error={assessmentErrors.studentId} />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Term *</label>
                  <select
                    required
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                  >
                    <option value="Term 1">Term 1 (Monsoon)</option>
                    <option value="Term 2">Term 2 (Autumn)</option>
                    <option value="Term 3">Term 3 (Spring)</option>
                  </select>
                </div>
              </div>

              {/* Rubric Evaluation */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                  Developmental Rubric Scoring
                </h4>
                {categories.map((category) => (
                  <div key={category} className="space-y-2.5 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-[#0050CB] dark:text-blue-400 block text-xs">{category}</span>
                    <div className="space-y-2">
                      {RUBRIC_TEMPLATE.filter(r => r.category === category).map((rubric, idx) => {
                        const currentScore = rubricScores[rubric.skill] || 'Developing';
                        return (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">{rubric.skill}</span>
                            <div className="flex gap-1">
                              {['Beginning', 'Developing', 'Mastered'].map((lvl) => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => handleScoreChange(rubric.skill, lvl)}
                                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                    currentScore === lvl
                                      ? lvl === 'Mastered' ? 'bg-emerald-600 text-white'
                                        : lvl === 'Developing' ? 'bg-amber-500 text-white'
                                        : 'bg-rose-500 text-white'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Teacher Comments */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teacher's Observations / Feedback</label>
                <textarea
                  rows={3}
                  value={teacherComments}
                  onChange={(e) => {
                    setTeacherComments(e.target.value);
                    if (assessmentErrors.teacherComments) setAssessmentErrors(prev => ({ ...prev, teacherComments: '' }));
                  }}
                  aria-invalid={Boolean(assessmentErrors.teacherComments)}
                  aria-describedby={assessmentErrors.teacherComments ? "assess-comments-err" : undefined}
                  placeholder="Share developmental remarks, social interaction observations, and areas for encouragement..."
                  className={`w-full border rounded-xl p-3 outline-hidden font-medium ${
                    assessmentErrors.teacherComments ? 'border-rose-400 bg-rose-50/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                />
                <FieldError id="assess-comments-err" error={assessmentErrors.teacherComments} />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#0050CB] hover:bg-[#003E9E] disabled:bg-slate-300 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Assessment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FULL REPORT CARD VIEW & PRINT */}
      {selectedReportCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#07152F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#000E28] dark:text-white">
                  {selectedReportCard.childId ? `${selectedReportCard.childId.firstName} ${selectedReportCard.childId.lastName}` : 'Student'} — Report Card
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                  {selectedReportCard.term || 'Term 1'} • Grade: {selectedReportCard.childId?.grade || 'Pre-KG'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printDocument('printable-admin-report-card-modal', 'GGPS School - Official Report Card')}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0050CB] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const studentId = selectedReportCard.childId?._id || selectedReportCard.childId;
                    const studentName = selectedReportCard.childId ? `${selectedReportCard.childId.firstName}_${selectedReportCard.childId.lastName}` : 'Student';
                    if (studentId) {
                      await downloadPdf(`/api/v1/students/${studentId}/report-card`, `GGPS_Report_Card_${studentName}.pdf`);
                    } else {
                      toast.error('Student ID not found');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReportCard(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div id="printable-admin-report-card-modal" className="p-6 overflow-y-auto space-y-5 text-xs">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Evaluated Skill Rubrics</h4>
              <div className="space-y-2.5">
                {selectedReportCard.rubrics?.map((rubric: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      <span className="font-bold text-slate-400 mr-2">[{rubric.category}]</span> {rubric.skill}
                    </span>
                    <div className="shrink-0">{getScoreBadge(rubric.score)}</div>
                  </div>
                ))}
              </div>

              {selectedReportCard.teacherComments && (
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Teacher's Observations</h4>
                  <p className="text-slate-700 dark:text-slate-300 italic">{selectedReportCard.teacherComments}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReportCard(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
