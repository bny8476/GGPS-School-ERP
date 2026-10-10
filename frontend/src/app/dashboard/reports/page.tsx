"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  CircleDollarSign, 
  Download, 
  AlertTriangle, 
  CalendarCheck, 
  CheckCircle2, 
  Loader2,
  TrendingUp,
  UserPlus,
  Clock,
  ArrowDownToLine,
  FileSpreadsheet,
  GraduationCap,
  Briefcase,
  FileText,
  FileDown,
  Search,
  Printer,
  Filter,
  X,
  Award,
  BookOpen,
  Phone,
  Send,
  ShieldAlert,
  ArrowUpRight,
  Check,
  XCircle,
  AlertCircle,
  Calendar,
  Sparkles,
  UserCheck,
  Receipt,
  CreditCard,
  Smartphone,
  CheckCheck,
  Building2,
  Star,
  BadgeCheck,
  HeartHandshake,
  Stethoscope,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { getApiBaseUrl } from '@/lib/utils';
import { downloadFile } from '@/lib/fileDownload';
import { printDocument } from '@/lib/exportUtils';

const kindergartenStaffList = [
  {
    id: 'EMP-2026-101',
    name: 'Dr. Sarah Jenkins',
    role: 'Lead Class Mentor',
    designation: 'Head of ECCE & Pre-KG A Mentor',
    cohort: 'Pre-KG A',
    cohortGroup: 'Pre-KG',
    domain: 'Phonics & Early English',
    qualification: 'Ph.D (ECE) • NTT Certified',
    experience: '10 Years',
    weeklyHours: 24,
    milestoneProgress: 98,
    rating: 4.95,
    reviewCount: 28,
    firstAid: 'Pediatric First Aid Certified',
    ratio: '1:8',
    phone: '+91 98110 11223',
    email: 'sarah.j@ggps.edu',
    status: 'Active',
    avatar: 'SJ'
  },
  {
    id: 'EMP-2026-102',
    name: 'Mrs. Rajeshwari Iyer',
    role: 'Lead Class Mentor',
    designation: 'Pre-Primary Academic Coordinator & LKG A Mentor',
    cohort: 'LKG A',
    cohortGroup: 'LKG',
    domain: 'Early Numeracy & Math',
    qualification: 'M.Ed (ECE) • Montessori Certified',
    experience: '12 Years',
    weeklyHours: 24,
    milestoneProgress: 97,
    rating: 4.92,
    reviewCount: 34,
    firstAid: 'Pediatric First Aid Certified',
    ratio: '1:10',
    phone: '+91 98220 22334',
    email: 'rajeshwari.i@ggps.edu',
    status: 'Active',
    avatar: 'RI'
  },
  {
    id: 'EMP-2026-103',
    name: 'Ms. Ananya Roy',
    role: 'Lead Class Mentor',
    designation: 'LKG B Class Mentor',
    cohort: 'LKG B',
    cohortGroup: 'LKG',
    domain: 'General Awareness (EVS) & Rhymes',
    qualification: 'B.Ed & Montessori Diploma',
    experience: '6 Years',
    weeklyHours: 24,
    milestoneProgress: 94,
    rating: 4.88,
    reviewCount: 22,
    firstAid: 'Pediatric First Aid Certified',
    ratio: '1:10',
    phone: '+91 98330 33445',
    email: 'ananya.r@ggps.edu',
    status: 'Active',
    avatar: 'AR'
  },
  {
    id: 'EMP-2026-104',
    name: 'Ms. Pooja Sharma',
    role: 'Lead Class Mentor',
    designation: 'Pre-KG B Class Mentor',
    cohort: 'Pre-KG B',
    cohortGroup: 'Pre-KG',
    domain: 'Sensory & Motor Skills',
    qualification: 'NTT Certified • Child Psychology Dip',
    experience: '5 Years',
    weeklyHours: 22,
    milestoneProgress: 95,
    rating: 4.85,
    reviewCount: 19,
    firstAid: 'Pediatric First Aid Certified',
    ratio: '1:8',
    phone: '+91 98440 44556',
    email: 'pooja.s@ggps.edu',
    status: 'Active',
    avatar: 'PS'
  },
  {
    id: 'EMP-2026-105',
    name: 'Ms. Shalini Saxena',
    role: 'Lead Class Mentor',
    designation: 'UKG A Lead Mentor',
    cohort: 'UKG A',
    cohortGroup: 'UKG',
    domain: 'Phonics, Sight Words & Early Literacy',
    qualification: 'B.Sc & Early Childhood Dip',
    experience: '7 Years',
    weeklyHours: 25,
    milestoneProgress: 96,
    rating: 4.90,
    reviewCount: 26,
    firstAid: 'Pediatric First Aid Certified',
    ratio: '1:10',
    phone: '+91 98550 55667',
    email: 'shalini.s@ggps.edu',
    status: 'Active',
    avatar: 'SS'
  },
  {
    id: 'EMP-2026-106',
    name: 'Ms. Meera Nambiar',
    role: 'Lead Class Mentor',
    designation: 'UKG B Lead Mentor',
    cohort: 'UKG B',
    cohortGroup: 'UKG',
    domain: 'Early Numeracy & Logic Games',
    qualification: 'M.A & Montessori Diploma',
    experience: '8 Years',
    weeklyHours: 24,
    milestoneProgress: 93,
    rating: 4.86,
    reviewCount: 21,
    firstAid: 'Pediatric First Aid Certified',
    ratio: '1:10',
    phone: '+91 98660 66778',
    email: 'meera.n@ggps.edu',
    status: 'Active',
    avatar: 'MN'
  },
  {
    id: 'EMP-2026-107',
    name: 'Ms. Sunita Patil',
    role: 'Co-Teacher / Assistant',
    designation: 'Pre-KG A Co-Teacher & Toddler Aide',
    cohort: 'Pre-KG A',
    cohortGroup: 'Pre-KG',
    domain: 'Rhymes & Action Songs Rhythm',
    qualification: 'ECCE Certified Caregiver',
    experience: '3 Years',
    weeklyHours: 26,
    milestoneProgress: 96,
    rating: 4.82,
    reviewCount: 15,
    firstAid: 'Pediatric First Aid Certified',
    ratio: '1:8',
    phone: '+91 98770 77889',
    email: 'sunita.p@ggps.edu',
    status: 'Active',
    avatar: 'SP'
  },
  {
    id: 'EMP-2026-108',
    name: 'Ms. Farah Khan',
    role: 'Co-Teacher / Assistant',
    designation: 'Creative Arts & Clay Modeling Mentor',
    cohort: 'LKG A',
    cohortGroup: 'LKG',
    domain: 'Art, Clay Molding & Sensory Craft',
    qualification: 'Fine Arts & ECCE Diploma',
    experience: '4 Years',
    weeklyHours: 20,
    milestoneProgress: 98,
    rating: 4.94,
    reviewCount: 29,
    firstAid: 'Pediatric First Aid Certified',
    ratio: '1:10',
    phone: '+91 98880 88990',
    email: 'farah.k@ggps.edu',
    status: 'Active',
    avatar: 'FK'
  },
  {
    id: 'EMP-2026-109',
    name: 'Ms. Tanvi Trivedi',
    role: 'Specialist Educator',
    designation: 'Physical & Gross Motor Specialist',
    cohort: 'UKG A',
    cohortGroup: 'UKG',
    domain: 'Gross Motor Skills & Circle Play',
    qualification: 'B.P.Ed Early Years Certified',
    experience: '4 Years',
    weeklyHours: 22,
    milestoneProgress: 92,
    rating: 4.80,
    reviewCount: 17,
    firstAid: 'Pediatric First Aid Certified',
    ratio: '1:12',
    phone: '+91 98990 99001',
    email: 'tanvi.t@ggps.edu',
    status: 'Active',
    avatar: 'TT'
  },
  {
    id: 'EMP-2026-110',
    name: "Sister Mary D'Souza",
    role: 'Health & Caregiving',
    designation: 'Campus Pediatric Health Officer & Daycare Nurse',
    cohort: 'Campus & Support',
    cohortGroup: 'Campus & Support',
    domain: 'Child Wellness & Emergency First Aid',
    qualification: 'GNM Pediatric Nursing • Master Trainer',
    experience: '14 Years',
    weeklyHours: 35,
    milestoneProgress: 100,
    rating: 4.98,
    reviewCount: 42,
    firstAid: 'Master Pediatric Trainer',
    ratio: 'Campus Wide',
    phone: '+91 98112 23344',
    email: 'nurse.mary@ggps.edu',
    status: 'Active',
    avatar: 'MD'
  },
  {
    id: 'EMP-2026-111',
    name: 'Ms. Kavita Reddy',
    role: 'Co-Teacher / Assistant',
    designation: 'Montessori Assistant & Toddler Caregiver',
    cohort: 'Pre-KG B',
    cohortGroup: 'Pre-KG',
    domain: 'Sensory Stations & Nap Supervision',
    qualification: 'Nursery Training Dip (NTT)',
    experience: '4 Years',
    weeklyHours: 28,
    milestoneProgress: 95,
    rating: 4.79,
    reviewCount: 14,
    firstAid: 'Pediatric First Aid Certified',
    ratio: '1:8',
    phone: '+91 98223 34455',
    email: 'kavita.r@ggps.edu',
    status: 'Active',
    avatar: 'KR'
  },
  {
    id: 'EMP-2026-112',
    name: 'Ms. Archana Bose',
    role: 'Specialist Educator',
    designation: 'Puppet Theater & Moral Storytelling Mentor',
    cohort: 'LKG B',
    cohortGroup: 'LKG',
    domain: 'Rhymes, Puppetry & Value Stories',
    qualification: 'Diploma in ECCE & Story Craft',
    experience: '5 Years',
    weeklyHours: 22,
    milestoneProgress: 97,
    rating: 4.91,
    reviewCount: 25,
    firstAid: 'Pediatric First Aid Certified',
    ratio: '1:10',
    phone: '+91 98334 45566',
    email: 'archana.b@ggps.edu',
    status: 'Active',
    avatar: 'AB'
  }
];

function ReportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') || 'academic';

  const [activeReport, setActiveReport] = useState<string>(tabParam);
  
  const [feeData, setFeeData] = useState<any[]>([]);
  const [admData, setAdmData] = useState<any>(null);
  const [attData, setAttData] = useState<any>(null);
  const [academicData, setAcademicData] = useState<any>(null);
  const [staffData, setStaffData] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Academic Filtering State
  const [academicSearch, setAcademicSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTerm, setSelectedTerm] = useState('All');
  const [selectedGradeBand, setSelectedGradeBand] = useState('All');

  // Attendance Filtering State
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceCohort, setAttendanceCohort] = useState('All');
  const [attendanceAudience, setAttendanceAudience] = useState<'all' | 'students' | 'staff'>('all');
  const [attendanceStatus, setAttendanceStatus] = useState('All');
  const [attendanceDateRange, setAttendanceDateRange] = useState('Today');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [notifiedAbsentees, setNotifiedAbsentees] = useState<string[]>([]);

  // Finance Filtering State
  const [financeSearch, setFinanceSearch] = useState('');
  const [financeCohort, setFinanceCohort] = useState('All');
  const [financeFeeType, setFinanceFeeType] = useState('All');
  const [financeTerm, setFinanceTerm] = useState('All');
  const [financeStatus, setFinanceStatus] = useState('All');
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [remindedInvoices, setRemindedInvoices] = useState<string[]>([]);

  // Staff Filtering State
  const [staffSearch, setStaffSearch] = useState('');
  const [staffCohort, setStaffCohort] = useState('All');
  const [staffRole, setStaffRole] = useState('All');
  const [staffRatingBand, setStaffRatingBand] = useState('All');
  const [commendedStaff, setCommendedStaff] = useState<string[]>([]);

  const handleCommendStaff = (id: string, name: string) => {
    if (!commendedStaff.includes(id)) {
      setCommendedStaff((prev) => [...prev, id]);
      toast.success(`Executive commendation note dispatched to ${name}!`);
    } else {
      toast('Commendation note already sent for this term.', { icon: 'ℹ️' });
    }
  };

  const apiBase = getApiBaseUrl();

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    if (tabParam) {
      setActiveReport(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tab') || 'academic';
        setActiveReport(t);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (t: string) => {
    setActiveReport(t);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', t);
      window.history.pushState({}, '', url.toString());
    }
  };

  const fetchReportData = async (type: string) => {
    setIsLoading(true);
    try {
      const headers = getHeaders();

      if (type === 'finance' || type === 'fees') {
        const res = await fetch(`${apiBase}/api/reports/fee-defaulters`, { headers, credentials: 'include' });
        if (res.ok) setFeeData(await res.json());
      } else if (type === 'admissions') {
        const res = await fetch(`${apiBase}/api/reports/admissions`, { headers, credentials: 'include' });
        if (res.ok) setAdmData(await res.json());
      } else if (type === 'attendance') {
        const res = await fetch(`${apiBase}/api/reports/attendance`, { headers, credentials: 'include' });
        if (res.ok) setAttData(await res.json());
      } else if (type === 'academic') {
        const res = await fetch(`${apiBase}/api/reports/academic`, { headers, credentials: 'include' });
        if (res.ok) setAcademicData(await res.json());
      } else if (type === 'staff') {
        const res = await fetch(`${apiBase}/api/reports/staff`, { headers, credentials: 'include' });
        if (res.ok) setStaffData(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(activeReport);
  }, [activeReport]);

  const handleExport = async (dataset: string, format: 'csv' | 'xlsx' | 'pdf' = 'csv') => {
    setIsExporting(true);
    try {
      let reportKey = dataset;
      if (dataset === 'fees' || dataset === 'finance') reportKey = 'fee-defaulters';
      await downloadFile(
        `/api/v1/reports/export/${reportKey}?format=${format}`,
        `GGPS-Report-${dataset.toUpperCase()}.${format}`
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to download report');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintCurrentReport = () => {
    const reportTitle = `${activeReport.toUpperCase()} REPORT - GGPS SCHOOL ERP`;
    const printableArea = document.getElementById('report-content-area');
    if (printableArea) {
      printDocument('report-content-area', reportTitle, true);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-saas pb-24">
      {/* Page Header */}
      <AdminPageHeader
        title="Executive Reports & Analytics Hub"
        subtitle="Generate curricular evaluations, attendance summaries, financial audits and data export packages."
        breadcrumbs={[
          { label: 'Admin Desk', href: '/dashboard' },
          { label: 'Reports' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleExport(activeReport, 'pdf')}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport(activeReport, 'xlsx')}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport(activeReport, 'csv')}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0050CB] hover:bg-[#003E9E] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrintCurrentReport}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-[#000E28] dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-[#0050CB]" />
              <span>Print</span>
            </button>
          </div>
        }
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto custom-scrollbar">
        {[
          { id: 'academic', label: 'Academic Reports', icon: GraduationCap },
          { id: 'attendance', label: 'Attendance Reports', icon: CalendarCheck },
          { id: 'finance', label: 'Financial & Fee Reports', icon: CircleDollarSign },
          { id: 'staff', label: 'Staff Performance Reports', icon: Briefcase },
          { id: 'export', label: 'Export Data Center', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#0050CB] text-[#0050CB] dark:text-[#E5EEFF] bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <div id="report-content-area" className="w-full bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden print:overflow-visible">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#0050CB] animate-spin" />
            <p className="text-xs font-bold text-slate-500">Compiling statistical intelligence...</p>
          </div>
        ) : (
          <div>
            {/* 1. ACADEMIC REPORTS */}
            {activeReport === 'academic' && (() => {
              const rawAssessments = (academicData?.recentAssessments && academicData.recentAssessments.length > 0)
                ? academicData.recentAssessments
                : [
                    { childId: { firstName: 'Aarav', lastName: 'Sharma', admissionNumber: 'GGPS2026001' }, title: 'Phonics & Alphabet Recognition', subject: 'Phonics & English', grade: 'Pre-KG A', term: 'Term 1 Evaluation', score: 94, maxScore: 100, overallGrade: 'A+', date: '2026-09-18' },
                    { childId: { firstName: 'Diya', lastName: 'Patel', admissionNumber: 'GGPS2026002' }, title: 'Number Work & Counting (1-50)', subject: 'Early Numeracy & Math', grade: 'LKG A', term: 'Term 1 Evaluation', score: 88, maxScore: 100, overallGrade: 'A', date: '2026-09-19' },
                    { childId: { firstName: 'Vihaan', lastName: 'Verma', admissionNumber: 'GGPS2026003' }, title: 'Sight Words & Sentence Reading', subject: 'Phonics & English', grade: 'UKG A', term: 'Term 1 Mid-Term', score: 82, maxScore: 100, overallGrade: 'A', date: '2026-09-15' },
                    { childId: { firstName: 'Ananya', lastName: 'Rao', admissionNumber: 'GGPS2026004' }, title: 'General Awareness - Animals & Nature', subject: 'General Awareness (EVS)', grade: 'LKG B', term: 'Term 1 Evaluation', score: 91, maxScore: 100, overallGrade: 'A+', date: '2026-09-20' },
                    { childId: { firstName: 'Ishaan', lastName: 'Gupta', admissionNumber: 'GGPS2026005' }, title: 'Basic Addition & 2D Shapes', subject: 'Early Numeracy & Math', grade: 'UKG B', term: 'Term 1 Evaluation', score: 96, maxScore: 100, overallGrade: 'A+', date: '2026-09-21' },
                    { childId: { firstName: 'Kavya', lastName: 'Nair', admissionNumber: 'GGPS2026006' }, title: 'Rhymes & Action Songs Rhythm', subject: 'Rhymes & Storytelling', grade: 'Pre-KG A', term: 'Term 1 Evaluation', score: 85, maxScore: 100, overallGrade: 'A', date: '2026-09-17' },
                    { childId: { firstName: 'Rohan', lastName: 'Mehta', admissionNumber: 'GGPS2026007' }, title: 'Pre-Writing & Pencil Grip Practice', subject: 'Sensory & Motor Skills', grade: 'Pre-KG B', term: 'Term 1 Evaluation', score: 48, maxScore: 100, overallGrade: 'D', date: '2026-09-19' },
                    { childId: { firstName: 'Sanya', lastName: 'Malhotra', admissionNumber: 'GGPS2026008' }, title: 'Coloring, Clay Molding & Craft', subject: 'Art & Craft', grade: 'LKG A', term: 'Term 1 Mid-Term', score: 89, maxScore: 100, overallGrade: 'A', date: '2026-09-14' },
                  ];

              // Filtering Logic
              const filteredAssessments = rawAssessments.filter((item: any) => {
                const q = academicSearch.toLowerCase().trim();
                const studentName = `${item.childId?.firstName || ''} ${item.childId?.lastName || ''}`.toLowerCase();
                const admNo = (item.childId?.admissionNumber || '').toLowerCase();
                const title = (item.title || '').toLowerCase();

                const matchesSearch = !q || studentName.includes(q) || admNo.includes(q) || title.includes(q);
                const matchesClass = selectedClass === 'All' || item.grade === selectedClass;
                const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
                const matchesTerm = selectedTerm === 'All' || item.term === selectedTerm;
                
                let matchesGrade = true;
                if (selectedGradeBand === 'A+') matchesGrade = item.overallGrade === 'A+';
                else if (selectedGradeBand === 'A/B') matchesGrade = item.overallGrade === 'A' || item.overallGrade === 'B';
                else if (selectedGradeBand === 'D') matchesGrade = item.overallGrade === 'D' || item.overallGrade === 'F';

                return matchesSearch && matchesClass && matchesSubject && matchesTerm && matchesGrade;
              });

              // Distribution counts
              const gradeCounts = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
              rawAssessments.forEach((item: any) => {
                const g = item.overallGrade || 'B';
                if (gradeCounts[g as keyof typeof gradeCounts] !== undefined) {
                  gradeCounts[g as keyof typeof gradeCounts]++;
                }
              });
              const totalItems = rawAssessments.length || 1;

              // Subject benchmark averages
              const subjectMap: Record<string, { totalScore: number; count: number }> = {};
              rawAssessments.forEach((item: any) => {
                const s = item.subject || 'General';
                if (!subjectMap[s]) subjectMap[s] = { totalScore: 0, count: 0 };
                subjectMap[s].totalScore += (item.score || 80);
                subjectMap[s].count++;
              });

              return (
                <div className="p-6 space-y-6">
                  {/* Header & Print Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#0050CB]" />
                        Curricular Assessment & Examination Analytics
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Performance telemetry across classes, grade distributions, and subject mastery benchmarks.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePrintCurrentReport}
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all self-start sm:self-auto shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#0050CB]" />
                      <span>Print Academic Ledger</span>
                    </button>
                  </div>

                  {/* 4 Standard Top KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#0050CB]/20 border border-blue-200/60 dark:border-blue-800/40">
                      <span className="text-[11px] font-bold text-[#0050CB] dark:text-[#E5EEFF] block uppercase tracking-wider">
                        Pass Percentage
                      </span>
                      <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
                        {academicData?.passPercentage || 96.4}%
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">↑ 2.1% vs last academic year</span>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider">
                        Distinction (A+)
                      </span>
                      <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
                        {academicData?.gradeDistribution?.['A+'] || gradeCounts['A+']}
                      </span>
                      <span className="text-[10px] text-slate-400">Students with 90%+ marks</span>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
                      <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block uppercase tracking-wider">
                        First Class (A/B)
                      </span>
                      <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
                        {gradeCounts['A'] + gradeCounts['B']}
                      </span>
                      <span className="text-[10px] text-slate-400">70% to 89% score range</span>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 block uppercase tracking-wider">
                        Remedial Support
                      </span>
                      <span className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                        {academicData?.gradeDistribution?.['D'] || gradeCounts['D']}
                      </span>
                      <span className="text-[10px] text-amber-600 font-bold">Scheduled for tutorial support</span>
                    </div>
                  </div>

                  {/* Visual Grade Distribution Bell Curve */}
                  <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-[#001438]/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                        Institutional Grade Distribution (Bell Curve)
                      </span>
                      <span className="text-slate-400 font-medium">Sample Size: {rawAssessments.length} Evaluations</span>
                    </div>

                    {/* Progress Segment Bar */}
                    <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
                      <div
                        style={{ width: `${Math.round((gradeCounts['A+'] / totalItems) * 100)}%` }}
                        className="bg-emerald-500 hover:opacity-90 transition-all cursor-pointer"
                        title={`A+ (90-100%): ${gradeCounts['A+']} students`}
                      />
                      <div
                        style={{ width: `${Math.round((gradeCounts['A'] / totalItems) * 100)}%` }}
                        className="bg-blue-500 hover:opacity-90 transition-all cursor-pointer"
                        title={`A (80-89%): ${gradeCounts['A']} students`}
                      />
                      <div
                        style={{ width: `${Math.round((gradeCounts['B'] / totalItems) * 100)}%` }}
                        className="bg-purple-500 hover:opacity-90 transition-all cursor-pointer"
                        title={`B (70-79%): ${gradeCounts['B']} students`}
                      />
                      <div
                        style={{ width: `${Math.round((gradeCounts['C'] / totalItems) * 100)}%` }}
                        className="bg-amber-500 hover:opacity-90 transition-all cursor-pointer"
                        title={`C (50-69%): ${gradeCounts['C']} students`}
                      />
                      <div
                        style={{ width: `${Math.round((gradeCounts['D'] / totalItems) * 100)}%` }}
                        className="bg-[#FF690C] hover:opacity-90 transition-all cursor-pointer"
                        title={`D (<50%): ${gradeCounts['D']} students`}
                      />
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 flex-wrap text-xs pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">A+ (90%+):</span>
                        <span className="text-slate-400">{gradeCounts['A+']}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">A (80-89%):</span>
                        <span className="text-slate-400">{gradeCounts['A']}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">B (70-79%):</span>
                        <span className="text-slate-400">{gradeCounts['B']}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">C (50-69%):</span>
                        <span className="text-slate-400">{gradeCounts['C']}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#FF690C] shrink-0" />
                        <span className="font-bold text-[#FF690C]">D (&lt;50% Remedial):</span>
                        <span className="text-slate-400">{gradeCounts['D']}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subject Mastery Benchmarks Cards */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#0050CB]" />
                      Subject Performance Benchmarks
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {Object.entries(subjectMap).map(([subj, stats]) => {
                        const avg = Math.round(stats.totalScore / stats.count);
                        return (
                          <div
                            key={subj}
                            className="bg-white dark:bg-[#001438] border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-1 shadow-xs"
                          >
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate block">
                              {subj}
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-slate-900 dark:text-white">{avg}%</span>
                              <span className="text-[10px] text-slate-400 font-medium">avg</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${avg}%` }}
                                className={`h-full rounded-full ${
                                  avg >= 85 ? 'bg-emerald-500' : avg >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Filtering Toolbar */}
                  <div className="bg-slate-50 dark:bg-[#001438] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    {/* Search */}
                    <div className="relative w-full lg:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={academicSearch}
                        onChange={(e) => setAcademicSearch(e.target.value)}
                        placeholder="Search student or assessment..."
                        className="w-full pl-9 pr-8 py-1.5 bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0050CB]"
                      />
                      {academicSearch && (
                        <button
                          onClick={() => setAcademicSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                        <Filter className="w-3.5 h-3.5 text-[#0050CB]" />
                        <span>Filter:</span>
                      </div>

                      {/* Class */}
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl focus:outline-none focus:border-[#0050CB]"
                      >
                        <option value="All">All Classes</option>
                        <option value="Pre-KG A">Pre-KG A</option>
                        <option value="Pre-KG B">Pre-KG B</option>
                        <option value="LKG A">LKG A</option>
                        <option value="LKG B">LKG B</option>
                        <option value="UKG A">UKG A</option>
                        <option value="UKG B">UKG B</option>
                      </select>

                      {/* Subject */}
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl focus:outline-none focus:border-[#0050CB]"
                      >
                        <option value="All">All Subjects</option>
                        <option value="Phonics & English">Phonics & English</option>
                        <option value="Early Numeracy & Math">Early Numeracy & Math</option>
                        <option value="General Awareness (EVS)">General Awareness (EVS)</option>
                        <option value="Rhymes & Storytelling">Rhymes & Storytelling</option>
                        <option value="Art & Craft">Art & Craft</option>
                        <option value="Sensory & Motor Skills">Sensory & Motor Skills</option>
                      </select>

                      {/* Performance Band */}
                      <select
                        value={selectedGradeBand}
                        onChange={(e) => setSelectedGradeBand(e.target.value)}
                        className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl focus:outline-none focus:border-[#0050CB]"
                      >
                        <option value="All">All Grades</option>
                        <option value="A+">Distinction (A+)</option>
                        <option value="A/B">First Class (A/B)</option>
                        <option value="D">Remedial (&lt;50%)</option>
                      </select>
                    </div>
                  </div>

                  {/* Detailed Assessment Ledger Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden print:overflow-visible shadow-xs">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                        Granular Assessment Ledger ({filteredAssessments.length} records)
                      </span>
                      {(academicSearch || selectedClass !== 'All' || selectedSubject !== 'All' || selectedGradeBand !== 'All') && (
                        <button
                          onClick={() => {
                            setAcademicSearch('');
                            setSelectedClass('All');
                            setSelectedSubject('All');
                            setSelectedGradeBand('All');
                          }}
                          className="text-xs font-bold text-[#0050CB] hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>

                    <div className="overflow-x-auto print:overflow-visible">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Student & Admission</th>
                            <th className="py-3 px-4">Subject & Assessment</th>
                            <th className="py-3 px-4">Class & Term</th>
                            <th className="py-3 px-4">Score & Percentage</th>
                            <th className="py-3 px-4 text-center">Grade</th>
                            <th className="py-3 px-4 text-right">Evaluation Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredAssessments.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-slate-400">
                                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No evaluations match criteria</p>
                                <p className="text-xs">Adjust your search query or reset class and subject filters.</p>
                              </td>
                            </tr>
                          ) : (
                            filteredAssessments.map((item: any, idx: number) => {
                              const scoreVal = item.score || 85;
                              const maxVal = item.maxScore || 100;
                              const pct = Math.round((scoreVal / maxVal) * 100);
                              const g = item.overallGrade || 'A';

                              return (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                  <td className="py-3.5 px-4">
                                    <p className="font-bold text-slate-900 dark:text-white">
                                      {item.childId?.firstName} {item.childId?.lastName}
                                    </p>
                                    <p className="text-[10px] font-mono text-slate-400">
                                      {item.childId?.admissionNumber || 'GGPS-REC'}
                                    </p>
                                  </td>

                                  <td className="py-3.5 px-4">
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] dark:text-[#38BDF8] inline-block mb-0.5">
                                      {item.subject || 'General'}
                                    </span>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                      {item.title || 'Mid-Term Exam'}
                                    </p>
                                  </td>

                                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                    <span className="font-semibold">{item.grade || 'Pre-KG'}</span>
                                    <span className="text-slate-400 block text-[11px]">{item.term || 'Term 1'}</span>
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <div className="flex items-baseline gap-1.5">
                                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                                        {scoreVal} / {maxVal}
                                      </span>
                                      <span className="text-[11px] font-bold text-slate-400">({pct}%)</span>
                                    </div>
                                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                      <div
                                        style={{ width: `${pct}%` }}
                                        className={`h-full rounded-full ${
                                          pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-blue-500' : pct >= 50 ? 'bg-amber-500' : 'bg-[#FF690C]'
                                        }`}
                                      />
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full font-black text-[10px] border ${
                                        g === 'A+'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                          : g === 'A'
                                          ? 'bg-blue-50 text-[#0050CB] border-blue-200 dark:bg-blue-950/40 dark:text-[#38BDF8]'
                                          : g === 'B'
                                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400'
                                          : g === 'C'
                                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                                          : 'bg-rose-50 text-[#FF690C] border-rose-200 dark:bg-rose-950/40 dark:text-[#FF690C]'
                                      }`}
                                    >
                                      {g}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                    {item.date || '2026-09-20'}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2. ATTENDANCE REPORTS */}
            {activeReport === 'attendance' && (() => {
              // Raw Attendance Dataset for Kindergarten (Pre-KG, LKG, UKG) + Faculty
              const rawAttendanceRecords = [
                { id: 'GGPS2026001', name: 'Aarav Sharma', type: 'Student', cohort: 'Pre-KG A', checkInTime: '08:12 AM', method: 'RFID Tap', status: 'Present', contact: '+91 98765 43210', guardian: 'Ramesh Sharma', smsStatus: 'Delivered' },
                { id: 'GGPS2026002', name: 'Diya Patel', type: 'Student', cohort: 'LKG A', checkInTime: '08:18 AM', method: 'RFID Tap', status: 'Present', contact: '+91 98223 11223', guardian: 'Kunal Patel', smsStatus: 'Delivered' },
                { id: 'GGPS2026003', name: 'Vihaan Verma', type: 'Student', cohort: 'UKG A', checkInTime: '08:22 AM', method: 'Gate Sensor', status: 'Present', contact: '+91 98456 77889', guardian: 'Sanjay Verma', smsStatus: 'Delivered' },
                { id: 'GGPS2026004', name: 'Ananya Rao', type: 'Student', cohort: 'LKG B', checkInTime: '08:25 AM', method: 'RFID Tap', status: 'Present', contact: '+91 97112 33445', guardian: 'Venkatesh Rao', smsStatus: 'Delivered' },
                { id: 'GGPS2026005', name: 'Ishaan Gupta', type: 'Student', cohort: 'UKG B', checkInTime: '08:42 AM', method: 'Manual Log', status: 'Late', contact: '+91 99887 66554', guardian: 'Deepak Gupta', smsStatus: 'Late Arrival SMS Sent' },
                { id: 'GGPS2026006', name: 'Kavya Nair', type: 'Student', cohort: 'Pre-KG A', checkInTime: '08:15 AM', method: 'RFID Tap', status: 'Present', contact: '+91 98332 11990', guardian: 'Pradeep Nair', smsStatus: 'Delivered' },
                { id: 'GGPS2026007', name: 'Rohan Mehta', type: 'Student', cohort: 'Pre-KG B', checkInTime: '—', method: '—', status: 'Absent', contact: '+91 98110 99887', guardian: 'Amit Mehta', smsStatus: notifiedAbsentees.includes('GGPS2026007') ? 'SMS Sent (Alert)' : 'Unnotified' },
                { id: 'GGPS2026008', name: 'Sanya Malhotra', type: 'Student', cohort: 'LKG A', checkInTime: '08:10 AM', method: 'RFID Tap', status: 'Present', contact: '+91 98199 88776', guardian: 'Gaurav Malhotra', smsStatus: 'Delivered' },
                { id: 'GGPS2026009', name: 'Kabir Deshmukh', type: 'Student', cohort: 'UKG B', checkInTime: '—', method: '—', status: 'Absent', contact: '+91 98334 45566', guardian: 'Rajesh Deshmukh', smsStatus: notifiedAbsentees.includes('GGPS2026009') ? 'SMS Sent (Alert)' : 'Unnotified' },
                { id: 'GGPS2026010', name: 'Advika Joshi', type: 'Student', cohort: 'UKG A', checkInTime: '08:28 AM', method: 'RFID Tap', status: 'Present', contact: '+91 97665 44332', guardian: 'Mahesh Joshi', smsStatus: 'Delivered' },
                { id: 'GGPS2026011', name: 'Alok Nath', type: 'Student', cohort: 'LKG A', checkInTime: '—', method: '—', status: 'Excused', contact: '+91 99221 44556', guardian: 'S. K. Nath', smsStatus: 'Medical Leave Approved' },
                { id: 'EMP-2026-101', name: 'Dr. Sarah Jenkins', type: 'Staff', cohort: 'Lead ECE Educator', checkInTime: '07:45 AM', method: 'Biometric Palm', status: 'Present', contact: '+91 98110 11223', guardian: 'Early Childhood', smsStatus: 'On Duty' },
                { id: 'EMP-2026-102', name: 'Mrs. Rajeshwari Iyer', type: 'Staff', cohort: 'Pre-Primary Coordinator', checkInTime: '07:50 AM', method: 'Biometric Palm', status: 'Present', contact: '+91 98220 22334', guardian: 'Early Childhood', smsStatus: 'On Duty' },
                { id: 'EMP-2026-103', name: 'Ms. Ananya Roy', type: 'Staff', cohort: 'LKG A Mentor', checkInTime: '07:55 AM', method: 'Biometric Palm', status: 'Present', contact: '+91 98330 33445', guardian: 'Faculty Dept', smsStatus: 'On Duty' },
                { id: 'EMP-2026-104', name: 'Ms. Pooja Sharma', type: 'Staff', cohort: 'LKG B Mentor', checkInTime: '08:02 AM', method: 'Biometric Palm', status: 'Present', contact: '+91 98440 44556', guardian: 'Faculty Dept', smsStatus: 'On Duty' },
                { id: 'EMP-2026-105', name: 'Ms. Shalini Saxena', type: 'Staff', cohort: 'Pre-KG B Mentor', checkInTime: '—', method: '—', status: 'Excused', contact: '+91 98550 55667', guardian: 'Leave Dept', smsStatus: 'Casual Leave Approved' },
              ];

              // Filtering records
              const filteredAttendanceRecords = rawAttendanceRecords.filter((rec) => {
                const q = attendanceSearch.toLowerCase().trim();
                const matchesSearch = !q || rec.name.toLowerCase().includes(q) || rec.id.toLowerCase().includes(q) || rec.guardian.toLowerCase().includes(q);
                const matchesAudience = attendanceAudience === 'all' || (attendanceAudience === 'students' ? rec.type === 'Student' : rec.type === 'Staff');
                const matchesCohort = attendanceCohort === 'All' || rec.cohort.startsWith(attendanceCohort);
                const matchesStatus = attendanceStatus === 'All' || rec.status === attendanceStatus;
                return matchesSearch && matchesAudience && matchesCohort && matchesStatus;
              });

              // Class-wise Cohort Breakdown Data (Pre-KG, LKG, UKG)
              const cohortBreakdowns = [
                { grade: 'Pre-KG A', enrolled: 25, present: 23, absent: 1, late: 1, rate: 92.0, mentor: 'Ms. Sunita Roy', status: 'Optimal' },
                { grade: 'Pre-KG B', enrolled: 24, present: 22, absent: 2, late: 0, rate: 91.7, mentor: 'Ms. Shalini Saxena', status: 'Optimal' },
                { grade: 'LKG A', enrolled: 32, present: 31, absent: 1, late: 0, rate: 96.9, mentor: 'Ms. Ananya Roy', status: 'Top Performing' },
                { grade: 'LKG B', enrolled: 30, present: 28, absent: 1, late: 1, rate: 93.3, mentor: 'Ms. Pooja Sharma', status: 'Optimal' },
                { grade: 'UKG A', enrolled: 34, present: 33, absent: 1, late: 0, rate: 97.1, mentor: 'Ms. Neha Gupta', status: 'Top Performing' },
                { grade: 'UKG B', enrolled: 33, present: 31, absent: 1, late: 1, rate: 93.9, mentor: 'Mr. Vikram Rao', status: 'Optimal' },
              ];

              // 7-Day Attendance Trend
              const weeklyTrend = [
                { day: 'Mon', date: 'Sep 22', rate: 93.8, present: 167, total: 178 },
                { day: 'Tue', date: 'Sep 23', rate: 95.5, present: 170, total: 178 },
                { day: 'Wed', date: 'Sep 24', rate: 96.1, present: 171, total: 178 },
                { day: 'Thu', date: 'Sep 25', rate: 94.9, present: 169, total: 178 },
                { day: 'Fri', date: 'Sep 26', rate: 94.4, present: 168, total: 178, active: true },
              ];

              // Chronic Absenteeism Defaulters (<75%)
              const chronicDefaulters = [
                { id: 'def-1', name: 'Kabir Deshmukh', grade: 'UKG B', totalDays: 48, presentDays: 34, rate: 70.8, parentContact: '+91 98334 45566', guardian: 'Rajesh Deshmukh', reason: 'Repeated unnotified Monday absences', actionRequired: 'Parent Check-in Required' },
                { id: 'def-2', name: 'Rohan Mehta', grade: 'Pre-KG B', totalDays: 48, presentDays: 35, rate: 72.9, parentContact: '+91 98110 99887', guardian: 'Amit Mehta', reason: 'Viral recovery & pediatrician rest', actionRequired: 'Medical Cert Received' },
                { id: 'def-3', name: 'Alok Nath', grade: 'LKG A', totalDays: 48, presentDays: 32, rate: 66.7, parentContact: '+91 99221 44556', guardian: 'S. K. Nath', reason: 'Out of station family emergency', actionRequired: 'Principal Meeting Scheduled' },
              ];

              const handleBroadcastAbsentees = async () => {
                setIsBroadcasting(true);
                await new Promise((res) => setTimeout(res, 600));
                setNotifiedAbsentees(['GGPS2026007', 'GGPS2026009']);
                setIsBroadcasting(false);
                toast.success('Instant Attendance SMS Alert dispatched to all unnotified guardians!');
              };

              const handleNotifySingle = (id: string, name: string) => {
                setNotifiedAbsentees(prev => [...prev, id]);
                toast.success(`Automated SMS notification dispatched to guardian of ${name}`);
              };

              return (
                <div className="p-6 space-y-6">
                  {/* Top Header & Immediate Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-[#0050CB]" />
                        Student & Faculty Attendance Telemetry
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Campus presence statistics, cohort compliance benchmarks, biometric logs, and absentee alerts.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        onClick={handleBroadcastAbsentees}
                        disabled={isBroadcasting}
                        className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-[#FF690C] to-[#EA580C] hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        {isBroadcasting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Broadcast SMS to Absentees</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePrintCurrentReport}
                        className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#0050CB]" />
                        <span>Print Attendance Ledger</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Standard Top KPI Cards Aligned with Kindergarten Capacity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Student Attendance Rate */}
                    <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider">
                        Student Attendance Rate
                      </span>
                      <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
                        94.4%
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <TrendingUp className="w-3 h-3" /> 168 Present of 178 Enrolled (↑ 1.2%)
                      </span>
                    </div>

                    {/* Card 2: Absentees Today */}
                    <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
                      <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block uppercase tracking-wider">
                        Absentees Today
                      </span>
                      <span className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                        7 Students
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                        3 Unnotified • 4 Medical / Excused
                      </span>
                    </div>

                    {/* Card 3: Faculty Presence */}
                    <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#0050CB]/20 border border-blue-200/60 dark:border-blue-800/40">
                      <span className="text-[11px] font-bold text-[#0050CB] dark:text-[#E5EEFF] block uppercase tracking-wider">
                        Faculty & Staff On Duty
                      </span>
                      <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
                        93.3%
                      </span>
                      <span className="text-[10px] text-[#0050CB] dark:text-blue-300 font-bold mt-0.5 block">
                        14 / 15 Present (1 Approved Leave)
                      </span>
                    </div>

                    {/* Card 4: Punctuality & RFID Biometric Check-in */}
                    <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 block uppercase tracking-wider">
                        Late Arrivals / Post 08:30
                      </span>
                      <span className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                        4 Check-ins
                      </span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold mt-0.5 block">
                        Average Check-in: 08:18 AM
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: 7-Day Attendance Trend Curve & Chronic Defaulters Watchlist */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    {/* Left: 7-Day Trend Visualizer (7 Cols) */}
                    <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-50/80 dark:bg-[#001438]/50 border border-slate-200/80 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#0050CB]" />
                            Weekly Attendance Compliance Trend
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Day-by-day aggregate attendance percentage for the current week.
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#E5EEFF] dark:bg-blue-950/40 text-[#0050CB] dark:text-[#38BDF8]">
                          Weekly Avg: 94.9%
                        </span>
                      </div>

                      {/* Bar Visualization */}
                      <div className="grid grid-cols-5 gap-3 pt-2 items-end min-h-[140px]">
                        {weeklyTrend.map((d, i) => {
                          const heightPct = Math.round(((d.rate - 85) / 15) * 100);
                          return (
                            <div key={i} className="flex flex-col items-center gap-2 group">
                              <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 opacity-80 group-hover:opacity-100 transition-opacity">
                                {d.rate}%
                              </span>
                              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-xl h-24 p-1 flex items-end">
                                <div
                                  style={{ height: `${Math.max(20, Math.min(100, heightPct))}%` }}
                                  className={`w-full rounded-lg transition-all duration-300 group-hover:brightness-110 shadow-xs ${
                                    d.active 
                                      ? 'bg-gradient-to-t from-[#0050CB] to-[#2563EB]' 
                                      : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                                  }`}
                                />
                              </div>
                              <div className="text-center">
                                <p className={`text-[11px] font-black ${d.active ? 'text-[#0050CB] dark:text-[#38BDF8]' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {d.day}
                                </p>
                                <p className="text-[9px] text-slate-400">{d.date}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Institution Threshold: <strong>85.0%</strong></span>
                        <span className="text-emerald-600 font-bold">✓ All days above regulatory benchmark</span>
                      </div>
                    </div>

                    {/* Right: Chronic Absenteeism Watchlist (<75%) (5 Cols) */}
                    <div className="lg:col-span-5 p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/80 dark:border-amber-800/40 space-y-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                              Chronic Defaulters (&lt; 75%)
                            </h4>
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                              Early childhood intervention list
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200/70 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                          {chronicDefaulters.length} At Risk
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {chronicDefaulters.map((def) => (
                          <div
                            key={def.id}
                            className="p-3 rounded-xl bg-white dark:bg-[#07152F] border border-amber-200/60 dark:border-amber-800/40 shadow-2xs flex items-center justify-between gap-2.5"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-slate-800 dark:text-white truncate">
                                  {def.name}
                                </p>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {def.grade}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-slate-500 mt-0.5 truncate">
                                {def.reason} • Guardian: {def.guardian}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                                {def.rate}%
                              </span>
                              <span className="text-[9px] font-bold text-slate-400">
                                {def.presentDays}/{def.totalDays} Days
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                        <span>Coordination Desk:</span>
                        <span className="text-slate-500 font-normal">Parent meetings scheduled on Friday</span>
                      </div>
                    </div>

                  </div>

                  {/* Section 3: Cohort-wise Attendance Rates Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#0050CB]" />
                        Kindergarten Cohort Performance Cards
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">6 Active Class Sections</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                      {cohortBreakdowns.map((cohort, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-2 hover:border-[#0050CB]/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 dark:text-white">
                              {cohort.grade}
                            </span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              cohort.rate >= 95 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                : 'bg-blue-50 text-[#0050CB] dark:bg-blue-950/40 dark:text-[#38BDF8]'
                            }`}>
                              {cohort.rate}%
                            </span>
                          </div>

                          {/* Progress fill bar */}
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${cohort.rate}%` }}
                              className={`h-full rounded-full ${cohort.rate >= 95 ? 'bg-emerald-500' : 'bg-[#0050CB]'}`}
                            />
                          </div>

                          <div className="pt-1 text-[10.5px] text-slate-500 flex items-center justify-between">
                            <span>{cohort.present}/{cohort.enrolled} Present</span>
                            <span className="text-rose-500 font-bold">{cohort.absent} Absent</span>
                          </div>

                          <p className="text-[10px] text-slate-400 truncate">
                            Mentor: {cohort.mentor}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 4: Filters & Search Controls Strip */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Left: Search input */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={attendanceSearch}
                        onChange={(e) => setAttendanceSearch(e.target.value)}
                        placeholder="Search student, staff name, admission no..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0050CB]"
                      />
                      {attendanceSearch && (
                        <button
                          onClick={() => setAttendanceSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Right: Dropdowns */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Audience Selector */}
                      <select
                        value={attendanceAudience}
                        onChange={(e) => setAttendanceAudience(e.target.value as any)}
                        className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl focus:outline-none focus:border-[#0050CB]"
                      >
                        <option value="all">All Campus (Students & Staff)</option>
                        <option value="students">Students Only</option>
                        <option value="staff">Faculty & Staff Only</option>
                      </select>

                      {/* Cohort Selector */}
                      <select
                        value={attendanceCohort}
                        onChange={(e) => setAttendanceCohort(e.target.value)}
                        className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl focus:outline-none focus:border-[#0050CB]"
                      >
                        <option value="All">All Cohorts</option>
                        <option value="Pre-KG">Pre-KG</option>
                        <option value="LKG">LKG</option>
                        <option value="UKG">UKG</option>
                      </select>

                      {/* Status Selector */}
                      <select
                        value={attendanceStatus}
                        onChange={(e) => setAttendanceStatus(e.target.value)}
                        className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl focus:outline-none focus:border-[#0050CB]"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late Check-in</option>
                        <option value="Excused">Excused / Leave</option>
                      </select>

                      {/* Date Range Preset */}
                      <select
                        value={attendanceDateRange}
                        onChange={(e) => setAttendanceDateRange(e.target.value)}
                        className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl focus:outline-none focus:border-[#0050CB]"
                      >
                        <option value="Today">Today (Live)</option>
                        <option value="Yesterday">Yesterday</option>
                        <option value="This Week">This Week (Aggregate)</option>
                        <option value="This Month">This Month (Sept)</option>
                      </select>
                    </div>
                  </div>

                  {/* Section 5: Detailed Granular Daily Attendance Ledger Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden print:overflow-visible shadow-xs">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                        Granular Attendance Ledger ({filteredAttendanceRecords.length} records shown)
                      </span>
                      {(attendanceSearch || attendanceCohort !== 'All' || attendanceAudience !== 'all' || attendanceStatus !== 'All') && (
                        <button
                          onClick={() => {
                            setAttendanceSearch('');
                            setAttendanceCohort('All');
                            setAttendanceAudience('all');
                            setAttendanceStatus('All');
                          }}
                          className="text-xs font-bold text-[#0050CB] hover:underline cursor-pointer"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>

                    <div className="overflow-x-auto print:overflow-visible">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Member & ID</th>
                            <th className="py-3 px-4">Role / Section</th>
                            <th className="py-3 px-4">Check-in Time & Method</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4">Guardian / Department Contact</th>
                            <th className="py-3 px-4 text-right">Instant Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredAttendanceRecords.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-slate-400">
                                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No attendance entries found</p>
                                <p className="text-xs">Adjust your search query or reset cohort and status filters.</p>
                              </td>
                            </tr>
                          ) : (
                            filteredAttendanceRecords.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                      item.type === 'Staff' 
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' 
                                        : 'bg-blue-100 text-[#0050CB] dark:bg-blue-950/60 dark:text-[#38BDF8]'
                                    }`}>
                                      {item.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 dark:text-white">
                                        {item.name}
                                      </p>
                                      <p className="text-[10px] font-mono text-slate-400">
                                        {item.id}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded inline-block ${
                                    item.type === 'Staff'
                                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                                      : 'bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] dark:text-[#38BDF8]'
                                  }`}>
                                    {item.cohort}
                                  </span>
                                  <span className="text-[10.5px] text-slate-400 block mt-0.5 font-medium">
                                    {item.type}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-semibold text-slate-800 dark:text-white">
                                      {item.checkInTime}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    {item.method}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full font-black text-[10px] border ${
                                      item.status === 'Present'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                        : item.status === 'Absent'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                                        : item.status === 'Late'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4">
                                  <p className="text-slate-800 dark:text-white font-medium text-[11px]">
                                    {item.contact}
                                  </p>
                                  <span className={`text-[10px] font-bold ${
                                    item.smsStatus.includes('Delivered') || item.smsStatus.includes('On Duty') 
                                      ? 'text-emerald-600' 
                                      : item.smsStatus.includes('Unnotified') 
                                      ? 'text-rose-600 font-extrabold' 
                                      : 'text-blue-600'
                                  }`}>
                                    • {item.smsStatus}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  {item.status === 'Absent' ? (
                                    <button
                                      type="button"
                                      onClick={() => handleNotifySingle(item.id, item.name)}
                                      className="px-2.5 py-1 rounded-lg bg-[#FF690C] hover:bg-[#E05A08] text-white font-bold text-[10.5px] transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Send className="w-3 h-3" />
                                      <span>Alert Parent</span>
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      Logged ✓
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3. FINANCIAL & FEE REPORTS */}
            {(activeReport === 'finance' || activeReport === 'fees') && (() => {
              // Master Financial Ledger for Kindergarten Cohorts
              const rawFinancialRecords = [
                { id: 'INV-2026-101', studentName: 'Aarav Sharma', admissionNumber: 'GGPS2026001', cohort: 'Pre-KG A', feeType: 'Composite Tuition & Learning Kit', term: 'Term 2', dueDate: '2026-09-15', totalAmount: 28500, amountPaid: 28500, status: 'Settled', contact: '+91 98765 43210', guardian: 'Ramesh Sharma' },
                { id: 'INV-2026-102', studentName: 'Diya Patel', admissionNumber: 'GGPS2026002', cohort: 'LKG A', feeType: 'Composite Tuition', term: 'Term 2', dueDate: '2026-09-15', totalAmount: 32000, amountPaid: 32000, status: 'Settled', contact: '+91 98223 11223', guardian: 'Kunal Patel' },
                { id: 'INV-2026-103', studentName: 'Vihaan Verma', admissionNumber: 'GGPS2026003', cohort: 'UKG A', feeType: 'Composite Tuition & Annual Fest', term: 'Term 2', dueDate: '2026-09-15', totalAmount: 34000, amountPaid: 34000, status: 'Settled', contact: '+91 98456 77889', guardian: 'Sanjay Verma' },
                { id: 'INV-2026-104', studentName: 'Ananya Rao', admissionNumber: 'GGPS2026004', cohort: 'LKG B', feeType: 'Composite Tuition', term: 'Term 2', dueDate: '2026-09-15', totalAmount: 32000, amountPaid: 16000, status: 'Partial', contact: '+91 97112 33445', guardian: 'Venkatesh Rao' },
                { id: 'INV-2026-105', studentName: 'Ishaan Gupta', admissionNumber: 'GGPS2026005', cohort: 'UKG B', feeType: 'Composite Tuition & Arts', term: 'Term 2', dueDate: '2026-09-10', totalAmount: 42000, amountPaid: 0, status: 'Overdue', contact: '+91 99887 66554', guardian: 'Deepak Gupta' },
                { id: 'INV-2026-106', studentName: 'Kavya Nair', admissionNumber: 'GGPS2026006', cohort: 'Pre-KG A', feeType: 'Composite Tuition & Activity Kit', term: 'Term 2', dueDate: '2026-09-15', totalAmount: 28500, amountPaid: 28500, status: 'Settled', contact: '+91 98332 11990', guardian: 'Pradeep Nair' },
                { id: 'INV-2026-107', studentName: 'Rohan Mehta', admissionNumber: 'GGPS2026007', cohort: 'Pre-KG B', feeType: 'Composite Tuition', term: 'Term 2', dueDate: '2026-09-05', totalAmount: 28500, amountPaid: 0, status: 'Overdue', contact: '+91 98110 99887', guardian: 'Amit Mehta' },
                { id: 'INV-2026-108', studentName: 'Sanya Malhotra', admissionNumber: 'GGPS2026008', cohort: 'LKG A', feeType: 'Composite Tuition', term: 'Term 2', dueDate: '2026-09-15', totalAmount: 32000, amountPaid: 32000, status: 'Settled', contact: '+91 98199 88776', guardian: 'Gaurav Malhotra' },
                { id: 'INV-2026-109', studentName: 'Kabir Deshmukh', admissionNumber: 'GGPS2026009', cohort: 'UKG B', feeType: 'Composite Tuition & Daycare', term: 'Term 2', dueDate: '2026-09-10', totalAmount: 45000, amountPaid: 15000, status: 'Overdue', contact: '+91 98334 45566', guardian: 'Rajesh Deshmukh' },
                { id: 'INV-2026-110', studentName: 'Advika Joshi', admissionNumber: 'GGPS2026010', cohort: 'UKG A', feeType: 'Composite Tuition', term: 'Term 2', dueDate: '2026-09-15', totalAmount: 34000, amountPaid: 34000, status: 'Settled', contact: '+91 97665 44332', guardian: 'Mahesh Joshi' },
                { id: 'INV-2026-111', studentName: 'Alok Nath', admissionNumber: 'GGPS2026011', cohort: 'LKG A', feeType: 'Composite Tuition & Sports', term: 'Term 2', dueDate: '2026-09-05', totalAmount: 39000, amountPaid: 0, status: 'Overdue', contact: '+91 99221 44556', guardian: 'S. K. Nath' },
              ];

              // Filtering records
              const filteredFinancialRecords = rawFinancialRecords.filter((rec) => {
                const q = financeSearch.toLowerCase().trim();
                const matchesSearch = !q || rec.studentName.toLowerCase().includes(q) || rec.admissionNumber.toLowerCase().includes(q) || rec.id.toLowerCase().includes(q) || rec.guardian.toLowerCase().includes(q);
                const matchesCohort = financeCohort === 'All' || rec.cohort.startsWith(financeCohort);
                const matchesFeeType = financeFeeType === 'All' || rec.feeType.toLowerCase().includes(financeFeeType.toLowerCase());
                const matchesTerm = financeTerm === 'All' || rec.term === financeTerm;
                const matchesStatus = financeStatus === 'All' || rec.status === financeStatus;
                return matchesSearch && matchesCohort && matchesFeeType && matchesTerm && matchesStatus;
              });

              // Cohort Revenue Breakdown Data
              const cohortFinanceBreakdowns = [
                { grade: 'Pre-KG', billed: 1420000, collected: 1280000, rate: 90.1, pending: 140000, students: 49, status: 'Optimal' },
                { grade: 'LKG', billed: 1840000, collected: 1710000, rate: 92.9, pending: 130000, students: 62, status: 'Top Efficiency' },
                { grade: 'UKG', billed: 1920000, collected: 1725000, rate: 89.8, pending: 195000, students: 67, status: 'Optimal' },
              ];

              // Payment Channel Telemetry
              const paymentChannels = [
                { method: 'UPI / QR Code', percentage: 62, amount: 2923300, icon: Smartphone, color: 'from-[#0050CB] to-[#2563EB]' },
                { method: 'NetBanking / Cards', percentage: 24, amount: 1131600, icon: CreditCard, color: 'from-emerald-600 to-emerald-400' },
                { method: 'School Office / Cash', percentage: 10, amount: 471500, icon: CircleDollarSign, color: 'from-amber-600 to-amber-400' },
                { method: 'Cheque in Clearing', percentage: 4, amount: 188600, icon: Receipt, color: 'from-purple-600 to-purple-400' },
              ];

              // Fee Heads Breakdown
              const feeHeads = [
                { head: 'Composite Tuition Fee', share: 74, amount: 3489100 },
                { head: 'Activity & Learning Kits', share: 14, amount: 660100 },
                { head: 'Daycare & Extended Care', share: 8, amount: 377200 },
                { head: 'Physical Education & Sports', share: 4, amount: 188600 },
              ];

              const handleBroadcastDuesReminders = async () => {
                setIsSendingReminders(true);
                await new Promise((res) => setTimeout(res, 600));
                setRemindedInvoices(['INV-2026-104', 'INV-2026-105', 'INV-2026-107', 'INV-2026-109', 'INV-2026-111']);
                setIsSendingReminders(false);
                toast.success('Instant Payment Reminder SMS & WhatsApp links dispatched to all overdue accounts!');
              };

              const handleSendSingleReminder = (id: string, name: string) => {
                setRemindedInvoices(prev => [...prev, id]);
                toast.success(`Payment link & invoice reminder dispatched to guardian of ${name}`);
              };

              return (
                <div className="p-6 space-y-6">
                  {/* Top Header & Immediate Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <CircleDollarSign className="w-5 h-5 text-[#0050CB]" />
                        Executive Financial & Tuition Analytics
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Gross billing registers, realized collections, cohort fee reconciliation, and outstanding dues recovery.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        onClick={handleBroadcastDuesReminders}
                        disabled={isSendingReminders}
                        className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-[#FF690C] to-[#EA580C] hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        {isSendingReminders ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Broadcast Dues Reminders</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePrintCurrentReport}
                        className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#0050CB]" />
                        <span>Print Financial Audit</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Standard Top KPI Cards Aligned with Kindergarten Scale */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Gross Revenue Billed */}
                    <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#0050CB]/20 border border-blue-200/60 dark:border-blue-800/40">
                      <span className="text-[11px] font-bold text-[#0050CB] dark:text-[#E5EEFF] block uppercase tracking-wider">
                        Gross Revenue Billed
                      </span>
                      <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
                        ₹51.80 L
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                        AY 2025-26 • 178 Kindergarteners
                      </span>
                    </div>

                    {/* Card 2: Net Realized Collections */}
                    <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider">
                        Realized Collections
                      </span>
                      <span className="text-3xl font-black text-emerald-800 dark:text-emerald-200 mt-1 block">
                        ₹47.15 L
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <TrendingUp className="w-3 h-3" /> 91.0% Collection Rate (↑ 3.4%)
                      </span>
                    </div>

                    {/* Card 3: Outstanding Receivables */}
                    <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
                      <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block uppercase tracking-wider">
                        Outstanding Receivables
                      </span>
                      <span className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                        ₹4.65 L
                      </span>
                      <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                        14 Accounts Pending / Overdue
                      </span>
                    </div>

                    {/* Card 4: Learning Kit & Activity Inflow */}
                    <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
                      <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block uppercase tracking-wider">
                        Montessori & Kit Inflow
                      </span>
                      <span className="text-3xl font-black text-purple-700 dark:text-purple-300 mt-1 block">
                        ₹6.80 L
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                        100% Realized Early Learning Aids
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Payment Mode Channels & Fee Heads Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    {/* Left: Payment Channel Distribution (7 Cols) */}
                    <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-50/80 dark:bg-[#001438]/50 border border-slate-200/80 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#0050CB]" />
                            Payment Inflow Channel Telemetry
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Transaction mode breakdown across digital gateways, POS, and clearing.
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#E5EEFF] dark:bg-blue-950/40 text-[#0050CB] dark:text-[#38BDF8]">
                          Digital Share: 86.0%
                        </span>
                      </div>

                      {/* Stacked Progress Bar */}
                      <div className="space-y-2">
                        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800 shadow-inner">
                          <div style={{ width: '62%' }} className="bg-[#0050CB] hover:opacity-90 transition-all cursor-pointer" title="UPI: 62% (₹29.23L)" />
                          <div style={{ width: '24%' }} className="bg-emerald-500 hover:opacity-90 transition-all cursor-pointer" title="NetBanking/Cards: 24% (₹11.32L)" />
                          <div style={{ width: '10%' }} className="bg-amber-500 hover:opacity-90 transition-all cursor-pointer" title="Cash at Desk: 10% (₹4.72L)" />
                          <div style={{ width: '4%' }} className="bg-purple-500 hover:opacity-90 transition-all cursor-pointer" title="Cheques in Clearing: 4% (₹1.88L)" />
                        </div>

                        {/* Legend Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                          {paymentChannels.map((ch, i) => {
                            const Icon = ch.icon;
                            return (
                              <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-[#07152F] border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                                  <Icon className="w-3.5 h-3.5 text-[#0050CB]" />
                                  <span className="truncate">{ch.method}</span>
                                </div>
                                <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
                                  {ch.percentage}%
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  ₹{(ch.amount / 100000).toFixed(2)} Lakhs
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Gateway Reconciliation: <strong>Razorpay & Cashier Desk</strong></span>
                        <span className="text-emerald-600 font-bold">✓ 100% Synced Today</span>
                      </div>
                    </div>

                    {/* Right: Fee Heads Distribution (5 Cols) */}
                    <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50/80 dark:bg-[#001438]/50 border border-slate-200/80 dark:border-slate-800 space-y-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-[#0050CB]" />
                            Revenue Streams by Fee Head
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Tuition vs Montessori aids vs ancillary services
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {feeHeads.map((fh, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">{fh.head}</span>
                              <span className="font-black text-slate-900 dark:text-white text-[11px]">
                                ₹{(fh.amount / 100000).toFixed(2)}L ({fh.share}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${fh.share}%` }}
                                className={`h-full rounded-full ${
                                  idx === 0 ? 'bg-[#0050CB]' : idx === 1 ? 'bg-purple-500' : idx === 2 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Ancillary Share: <strong>26.0%</strong></span>
                        <span className="text-[#0050CB] dark:text-[#38BDF8] font-bold">Montessori Kits prioritized</span>
                      </div>
                    </div>

                  </div>

                  {/* Section 3: Cohort Revenue & Efficiency Progress Cards */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#0050CB]" />
                        Kindergarten Cohort Revenue Progress
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">Pre-KG, LKG, UKG Collections</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {cohortFinanceBreakdowns.map((cf, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 hover:border-[#0050CB]/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-black text-slate-800 dark:text-white">
                                {cf.grade}
                              </span>
                              <span className="text-[10.5px] text-slate-400 block font-medium">
                                {cf.students} Enrolled Children
                              </span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              cf.rate >= 92 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200' 
                                : 'bg-blue-50 text-[#0050CB] dark:bg-blue-950/40 dark:text-[#38BDF8] border border-blue-200'
                            }`}>
                              {cf.status} ({cf.rate}%)
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${cf.rate}%` }}
                              className={`h-full rounded-full ${cf.rate >= 92 ? 'bg-emerald-500' : 'bg-[#0050CB]'}`}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Billed</span>
                              <span className="text-xs font-black text-slate-800 dark:text-white">
                                ₹{(cf.billed / 100000).toFixed(2)}L
                              </span>
                            </div>
                            <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20">
                              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase">Collected</span>
                              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                                ₹{(cf.collected / 100000).toFixed(2)}L
                              </span>
                            </div>
                            <div className="p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20">
                              <span className="text-[9px] font-bold text-rose-700 dark:text-rose-400 block uppercase">Pending</span>
                              <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                                ₹{(cf.pending / 100000).toFixed(2)}L
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 4: Filters & Search Controls Strip */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Left: Search input */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={financeSearch}
                        onChange={(e) => setFinanceSearch(e.target.value)}
                        placeholder="Search student, invoice ID, guardian phone..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0050CB]"
                      />
                      {financeSearch && (
                        <button
                          onClick={() => setFinanceSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Right: Dropdowns */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Cohort Selector */}
                      <select
                        value={financeCohort}
                        onChange={(e) => setFinanceCohort(e.target.value)}
                        className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl focus:outline-none focus:border-[#0050CB]"
                      >
                        <option value="All">All Cohorts</option>
                        <option value="Pre-KG">Pre-KG</option>
                        <option value="LKG">LKG</option>
                        <option value="UKG">UKG</option>
                      </select>

                      {/* Fee Category Selector */}
                      <select
                        value={financeFeeType}
                        onChange={(e) => setFinanceFeeType(e.target.value)}
                        className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl focus:outline-none focus:border-[#0050CB]"
                      >
                        <option value="All">All Categories</option>
                        <option value="Tuition">Composite Tuition</option>
                        <option value="Learning Kit">Activity / Kit</option>
                        <option value="Sports">Sports & Arts</option>
                        <option value="Daycare">Daycare</option>
                      </select>

                      {/* Term Selector */}
                      <select
                        value={financeTerm}
                        onChange={(e) => setFinanceTerm(e.target.value)}
                        className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl focus:outline-none focus:border-[#0050CB]"
                      >
                        <option value="All">All Terms</option>
                        <option value="Term 1">Term 1 (Autumn)</option>
                        <option value="Term 2">Term 2 (Winter)</option>
                        <option value="Term 3">Term 3 (Spring)</option>
                      </select>

                      {/* Status Selector */}
                      <select
                        value={financeStatus}
                        onChange={(e) => setFinanceStatus(e.target.value)}
                        className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl focus:outline-none focus:border-[#0050CB]"
                      >
                        <option value="All">All Invoices</option>
                        <option value="Settled">Settled / Paid</option>
                        <option value="Partial">Partially Paid</option>
                        <option value="Overdue">Overdue / Pending</option>
                      </select>
                    </div>
                  </div>

                  {/* Section 5: Detailed Financial & Dues Ledger Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden print:overflow-visible shadow-xs">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                        Granular Financial Ledger ({filteredFinancialRecords.length} records shown)
                      </span>
                      {(financeSearch || financeCohort !== 'All' || financeFeeType !== 'All' || financeTerm !== 'All' || financeStatus !== 'All') && (
                        <button
                          onClick={() => {
                            setFinanceSearch('');
                            setFinanceCohort('All');
                            setFinanceFeeType('All');
                            setFinanceTerm('All');
                            setFinanceStatus('All');
                          }}
                          className="text-xs font-bold text-[#0050CB] hover:underline cursor-pointer"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>

                    <div className="overflow-x-auto print:overflow-visible">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Student & Invoice ID</th>
                            <th className="py-3 px-4">Cohort & Fee Category</th>
                            <th className="py-3 px-4">Term & Due Date</th>
                            <th className="py-3 px-4 text-right">Billed (₹)</th>
                            <th className="py-3 px-4 text-right">Paid (₹)</th>
                            <th className="py-3 px-4 text-right">Balance Due (₹)</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-right">Instant Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredFinancialRecords.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-400">
                                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No invoices match selected criteria</p>
                                <p className="text-xs">Adjust your search query or reset cohort and status filters.</p>
                              </td>
                            </tr>
                          ) : (
                            filteredFinancialRecords.map((item, idx) => {
                              const bal = item.totalAmount - item.amountPaid;
                              const isReminded = remindedInvoices.includes(item.id);
                              return (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                  <td className="py-3.5 px-4">
                                    <p className="font-bold text-slate-900 dark:text-white">
                                      {item.studentName}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono text-slate-400">
                                      <span>{item.admissionNumber}</span>
                                      <span>•</span>
                                      <span className="text-[#0050CB] dark:text-[#38BDF8]">{item.id}</span>
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4">
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] dark:text-[#38BDF8] inline-block mb-0.5">
                                      {item.cohort}
                                    </span>
                                    <p className="text-slate-700 dark:text-slate-300 font-medium text-[11px] truncate max-w-[200px]">
                                      {item.feeType}
                                    </p>
                                  </td>

                                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                    <span className="font-bold text-slate-800 dark:text-white">
                                      {item.term}
                                    </span>
                                    <span className={`text-[10.5px] block mt-0.5 font-medium ${
                                      item.status === 'Overdue' ? 'text-rose-600 font-bold' : 'text-slate-400'
                                    }`}>
                                      Due: {item.dueDate}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 text-right font-black text-slate-800 dark:text-white whitespace-nowrap">
                                    ₹{item.totalAmount.toLocaleString('en-IN')}
                                  </td>

                                  <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                    ₹{item.amountPaid.toLocaleString('en-IN')}
                                  </td>

                                  <td className="py-3.5 px-4 text-right font-black whitespace-nowrap">
                                    <span className={bal > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                                      ₹{bal.toLocaleString('en-IN')}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full font-black text-[10px] border ${
                                        item.status === 'Settled'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                          : item.status === 'Partial'
                                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                                      }`}
                                    >
                                      {item.status}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    {item.status !== 'Settled' ? (
                                      <button
                                        type="button"
                                        onClick={() => handleSendSingleReminder(item.id, item.studentName)}
                                        className={`px-2.5 py-1 rounded-lg text-white font-bold text-[10.5px] transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer ${
                                          isReminded 
                                            ? 'bg-emerald-600 hover:bg-emerald-700' 
                                            : 'bg-[#FF690C] hover:bg-[#E05A08]'
                                        }`}
                                      >
                                        {isReminded ? <CheckCheck className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                                        <span>{isReminded ? 'Reminder Sent' : 'Send Pay Link'}</span>
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                                        <Check className="w-3.5 h-3.5" /> Receipt Sent
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 4. STAFF PERFORMANCE REPORTS */}
            {activeReport === 'staff' && (() => {
              const filteredStaffList = kindergartenStaffList.filter((staff) => {
                const q = staffSearch.toLowerCase().trim();
                const nameMatch = staff.name.toLowerCase().includes(q);
                const idMatch = staff.id.toLowerCase().includes(q);
                const domainMatch = staff.domain.toLowerCase().includes(q);
                const qualMatch = staff.qualification.toLowerCase().includes(q);
                const matchesSearch = !q || nameMatch || idMatch || domainMatch || qualMatch;

                const matchesCohort = staffCohort === 'All' || staff.cohortGroup === staffCohort || staff.cohort.includes(staffCohort);
                const matchesRole = staffRole === 'All' || staff.role === staffRole;
                
                let matchesRating = true;
                if (staffRatingBand === '4.9') matchesRating = staff.rating >= 4.9;
                else if (staffRatingBand === '4.8') matchesRating = staff.rating >= 4.8;
                else if (staffRatingBand === '4.5') matchesRating = staff.rating >= 4.5;

                return matchesSearch && matchesCohort && matchesRole && matchesRating;
              });

              const isFiltered = staffSearch !== '' || staffCohort !== 'All' || staffRole !== 'All' || staffRatingBand !== 'All';

              return (
                <div className="p-6 space-y-6">
                  {/* Header & Print Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-[#0050CB]" />
                        Early Childhood Educator & Faculty Telemetry
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pre-KG, LKG, and UKG pedagogical roster, classroom safety ratios, milestone evaluation cadence, and parent ratings.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePrintCurrentReport}
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all self-start sm:self-auto shadow-2xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#0050CB]" />
                      <span>Print Faculty Ledger</span>
                    </button>
                  </div>

                  {/* 4 Standard Top KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#0050CB]/20 border border-blue-200/60 dark:border-blue-800/40">
                      <span className="text-[11px] font-bold text-[#0050CB] dark:text-[#E5EEFF] block uppercase tracking-wider">
                        Total ECE Faculty & Caregivers
                      </span>
                      <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
                        {staffData?.totalStaff || 18} Staff
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <BadgeCheck className="w-3 h-3 text-emerald-600 inline" /> 100% ECE / Montessori Certified
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider">
                        Avg Child-to-Teacher Ratio
                      </span>
                      <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
                        1:9.4
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                        Pre-KG 1:8 • LKG 1:9.6 • UKG 1:10
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
                      <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block uppercase tracking-wider">
                        Milestone & Observation Cadence
                      </span>
                      <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
                        95.8%
                      </span>
                      <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold mt-0.5 block">
                        Evaluations & Daily Diaries on Schedule
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 block uppercase tracking-wider">
                        Parent Educator Rating
                      </span>
                      <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 flex items-center gap-1">
                        4.91 <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                        Based on 142 Verified Parent Reviews
                      </span>
                    </div>
                  </div>

                  {/* Cohort Wing Roster & Child Ratios */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#0050CB]" />
                        Kindergarten Wing Roster & Safety Standards
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">NEP 2020 & NAEYC Preschool Compliance</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Pre-KG Wing */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 hover:border-[#0050CB]/40 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#0050CB] dark:bg-blue-900/40 dark:text-blue-200 whitespace-nowrap">
                            Pre-KG Wing
                          </span>
                          <span className="text-xs font-black text-emerald-600 whitespace-nowrap">1:8.0 Ratio</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Classrooms & Care</p>
                          <p className="text-sm font-black text-slate-800 dark:text-white">Pre-KG A & Pre-KG B</p>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-500">
                            <span>Faculty:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">4 Educators</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Enrolled:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">32 Toddlers</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Key Focus:</span>
                            <span className="font-bold text-[#0050CB] dark:text-[#38BDF8]">Sensory & Phonics</span>
                          </div>
                        </div>
                      </div>

                      {/* LKG Wing */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 hover:border-[#0050CB]/40 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200 whitespace-nowrap">
                            LKG Wing
                          </span>
                          <span className="text-xs font-black text-emerald-600 whitespace-nowrap">1:9.6 Ratio</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Classrooms & Care</p>
                          <p className="text-sm font-black text-slate-800 dark:text-white">LKG A & LKG B</p>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-500">
                            <span>Faculty:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">6 Educators</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Enrolled:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">58 Children</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Key Focus:</span>
                            <span className="font-bold text-[#0050CB] dark:text-[#38BDF8]">Numeracy & Puppetry</span>
                          </div>
                        </div>
                      </div>

                      {/* UKG Wing */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 hover:border-[#0050CB]/40 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 whitespace-nowrap">
                            UKG Wing
                          </span>
                          <span className="text-xs font-black text-emerald-600 whitespace-nowrap">1:10.0 Ratio</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Classrooms & Care</p>
                          <p className="text-sm font-black text-slate-800 dark:text-white">UKG A & UKG B</p>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-500">
                            <span>Faculty:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">6 Educators</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Enrolled:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">60 Children</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Key Focus:</span>
                            <span className="font-bold text-[#0050CB] dark:text-[#38BDF8]">Reading & Motor Play</span>
                          </div>
                        </div>
                      </div>

                      {/* Health & Pediatric Support */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 hover:border-[#0050CB]/40 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 whitespace-nowrap">
                            Health Desk
                          </span>
                          <span className="text-xs font-black text-emerald-600 whitespace-nowrap">Full Coverage</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Pediatric Officer & Nurse</p>
                          <p className="text-sm font-black text-slate-800 dark:text-white">Sister Mary D'Souza</p>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-500">
                            <span>First Aid Certified:</span>
                            <span className="font-bold text-emerald-600">100% of Staff</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Emergency Response:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">&lt; 2 Minutes</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Key Focus:</span>
                            <span className="font-bold text-[#0050CB] dark:text-[#38BDF8]">Child Wellness & Taps</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Dimensional Filter Bar */}
                  <div className="p-4 bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex flex-col lg:flex-row gap-3">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={staffSearch}
                          onChange={(e) => setStaffSearch(e.target.value)}
                          placeholder="Search educator name, employee code (EMP-2026-xxx), domain, or qualification..."
                          className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0050CB] text-slate-800 dark:text-slate-100"
                        />
                        {staffSearch && (
                          <button
                            type="button"
                            onClick={() => setStaffSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Cohort Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Cohort:</span>
                        <select
                          value={staffCohort}
                          onChange={(e) => setStaffCohort(e.target.value)}
                          className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0050CB] cursor-pointer"
                        >
                          <option value="All">All Kindergarten Cohorts</option>
                          <option value="Pre-KG">Pre-KG Wing</option>
                          <option value="LKG">LKG Wing</option>
                          <option value="UKG">UKG Wing</option>
                          <option value="Campus & Support">Campus Wellness & Support</option>
                        </select>
                      </div>

                      {/* Role Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Role:</span>
                        <select
                          value={staffRole}
                          onChange={(e) => setStaffRole(e.target.value)}
                          className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0050CB] cursor-pointer"
                        >
                          <option value="All">All Faculty Roles</option>
                          <option value="Lead Class Mentor">Lead Class Mentor</option>
                          <option value="Co-Teacher / Assistant">Co-Teacher / Assistant</option>
                          <option value="Specialist Educator">Specialist Educator</option>
                          <option value="Health & Caregiving">Health & Caregiving</option>
                        </select>
                      </div>

                      {/* Rating Band Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Rating:</span>
                        <select
                          value={staffRatingBand}
                          onChange={(e) => setStaffRatingBand(e.target.value)}
                          className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0050CB] cursor-pointer"
                        >
                          <option value="All">All Ratings</option>
                          <option value="4.9">Exceptional (4.9+ ★)</option>
                          <option value="4.8">Commended (4.8+ ★)</option>
                          <option value="4.5">Proficient (4.5+ ★)</option>
                        </select>
                      </div>

                      {/* Reset Button */}
                      {isFiltered && (
                        <button
                          type="button"
                          onClick={() => {
                            setStaffSearch('');
                            setStaffCohort('All');
                            setStaffRole('All');
                            setStaffRatingBand('All');
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>
                        Showing <strong className="text-slate-800 dark:text-white">{filteredStaffList.length}</strong> of{' '}
                        {kindergartenStaffList.length} ECE Educators
                      </span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% Background & Police Verified
                      </span>
                    </div>
                  </div>

                  {/* Interactive Faculty Roster Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden print:overflow-visible shadow-2xs">
                    <div className="overflow-x-auto custom-scrollbar print:overflow-visible">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-[10.5px] uppercase font-black text-slate-400 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Faculty Member & Credential</th>
                            <th className="py-3 px-4">Assigned Cohort</th>
                            <th className="py-3 px-4">Curricular Domain</th>
                            <th className="py-3 px-4 text-center">Workload</th>
                            <th className="py-3 px-4 text-center">Milestone Cadence</th>
                            <th className="py-3 px-4 text-center">Parent Rating</th>
                            <th className="py-3 px-4 text-center">Accreditation</th>
                            <th className="py-3 px-4 text-right">Instant Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredStaffList.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-400">
                                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                                  No educators match your search criteria
                                </p>
                                <p className="text-xs">Adjust your search keywords or clear active cohort filters.</p>
                              </td>
                            </tr>
                          ) : (
                            filteredStaffList.map((s, idx) => {
                              const isCommended = commendedStaff.includes(s.id);
                              return (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                  {/* Faculty Member */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/30 border border-[#0050CB]/20 flex items-center justify-center font-black text-[#0050CB] dark:text-[#E5EEFF] text-xs">
                                        {s.avatar}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-900 dark:text-white">
                                          {s.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono text-slate-400">
                                          <span className="text-[#0050CB] dark:text-[#38BDF8] font-bold">{s.id}</span>
                                          <span>•</span>
                                          <span>{s.experience} exp</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[200px]">
                                          {s.qualification}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Assigned Cohort */}
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full font-black text-[10px] border ${
                                        s.cohortGroup === 'Pre-KG'
                                          ? 'bg-blue-50 text-[#0050CB] border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                                          : s.cohortGroup === 'LKG'
                                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300'
                                          : s.cohortGroup === 'UKG'
                                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                                      }`}
                                    >
                                      {s.cohort}
                                    </span>
                                    <p className="text-[10.5px] text-slate-400 font-medium mt-1">
                                      Ratio: {s.ratio}
                                    </p>
                                  </td>

                                  {/* Curricular Domain */}
                                  <td className="py-3.5 px-4">
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-[11.5px]">
                                      {s.domain}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                      {s.role}
                                    </p>
                                  </td>

                                  {/* Workload */}
                                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                                      {s.weeklyHours} hrs/wk
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      Circle & Play Lead
                                    </span>
                                  </td>

                                  {/* Milestone Cadence */}
                                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                    <div className="w-24 mx-auto space-y-1">
                                      <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-slate-500">Logged</span>
                                        <span className={s.milestoneProgress >= 95 ? 'text-emerald-600' : 'text-[#0050CB]'}>
                                          {s.milestoneProgress}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            s.milestoneProgress >= 95 ? 'bg-emerald-500' : 'bg-[#0050CB]'
                                          }`}
                                          style={{ width: `${s.milestoneProgress}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  {/* Parent Rating */}
                                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1 font-black text-slate-800 dark:text-white text-xs">
                                      <span>{s.rating}</span>
                                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    </div>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      {s.reviewCount} reviews
                                    </span>
                                  </td>

                                  {/* Accreditation */}
                                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                                      <BadgeCheck className="w-3 h-3 text-emerald-600" /> First Aid
                                    </span>
                                  </td>

                                  {/* Action */}
                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => handleCommendStaff(s.id, s.name)}
                                      className={`px-2.5 py-1 rounded-lg text-white font-bold text-[10.5px] transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer ${
                                        isCommended
                                          ? 'bg-emerald-600 hover:bg-emerald-700'
                                          : 'bg-[#0050CB] hover:bg-[#003E9E]'
                                      }`}
                                    >
                                      {isCommended ? <CheckCheck className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                                      <span>{isCommended ? 'Commended ✓' : 'Send Recognition'}</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 5. EXPORT DATA CENTER */}
            {activeReport === 'export' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                    Institutional Data Export Center
                  </h3>
                  <p className="text-xs text-slate-500">
                    Download full verified datasets in standard CSV, Excel, and PDF formats for statutory audits and records.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Student Directory Archive', desc: 'Full student profiles, admission numbers, grades, and parent contacts.', id: 'students', type: 'CSV / Excel' },
                    { title: 'Financial & Fee Defaulters', desc: 'Overdue invoices, balance ledgers, and receipt registers.', id: 'fees', type: 'CSV / Excel' },
                    { title: 'Daily Attendance Telemetry', desc: 'Class-wise student presence and faculty roll-call records.', id: 'attendance', type: 'CSV' },
                    { title: 'Faculty & Staff Payroll Roster', desc: 'Staff directory, qualifications, experience, and department allocations.', id: 'staff', type: 'CSV / Excel' },
                    { title: 'Academic Marks & Grades', desc: 'End-of-term evaluations, marks entry, and pass percentages.', id: 'academic', type: 'CSV' },
                  ].map((exp) => (
                    <div
                      key={exp.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-[#0050CB] dark:text-[#E5EEFF] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                            {exp.type}
                          </span>
                          <FileDown className="w-4 h-4 text-slate-400" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{exp.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{exp.desc}</p>
                      </div>

                      <div className="pt-4 mt-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleExport(exp.id, 'csv')}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[#0050CB] hover:bg-[#003E9E] text-white text-[11px] font-bold rounded-lg shadow-xs cursor-pointer transition-all"
                        >
                          <Download className="w-3 h-3" />
                          <span>CSV</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExport(exp.id, 'xlsx')}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs cursor-pointer transition-all"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Excel</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExport(exp.id, 'pdf')}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg shadow-xs cursor-pointer transition-all"
                        >
                          <FileText className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-[#0050CB] border-t-transparent rounded-full animate-spin" />
        <span>Loading Executive Reports...</span>
      </div>
    }>
      <ReportsContent />
    </Suspense>
  );
}
