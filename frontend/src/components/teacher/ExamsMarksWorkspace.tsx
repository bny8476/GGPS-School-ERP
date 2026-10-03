"use client";

import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Award,
  Download,
  Printer,
  ChevronRight,
  Eye,
  Check,
  X,
  FileText,
  Users,
  Star,
  CheckCheck,
  RefreshCw,
  SlidersHorizontal,
  BookmarkCheck,
  Lock,
  Unlock,
  TrendingUp,
  BarChart3,
  Send,
  HelpCircle,
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { printDocument } from '@/lib/exportUtils';
import { downloadPdf } from '@/lib/fileDownload';

export interface ExamPaper {
  id: string;
  title: string;
  subject: string;
  category: 'TERM_SUMMATIVE' | 'PERIODIC_DIAGNOSTIC' | 'ORAL_PRACTICAL';
  date: string;
  timeSlot: string;
  room: string;
  invigilator: string;
  maxWritten: number;
  maxOral: number;
  totalMax: number;
  description: string;
  status: 'UPCOMING' | 'COMPLETED' | 'EVALUATING';
}

export interface StudentMarkEntry {
  studentId: string;
  studentName: string;
  rollNo: string;
  photoUrl: string;
  isAbsent: boolean;
  writtenScore: number; // 0 to maxWritten
  oralScore: number;    // 0 to maxOral
  isLocked: boolean;
  teacherNote?: string;
}

export interface ExamsMarksWorkspaceProps {
  students?: Array<{
    id: string;
    name: string;
    rollNo: string;
    photo: string;
  }>;
  onNavigateTab?: (tab: string) => void;
}

// Initial realistic exam papers
const initialExamPapers: ExamPaper[] = [
  {
    id: 'exam-1',
    title: 'English Reading, Phonics & Letter Recognition',
    subject: 'English & Phonics',
    category: 'TERM_SUMMATIVE',
    date: '22 Sep 2026',
    timeSlot: '09:30 AM - 10:45 AM',
    room: 'Room 102 (Classroom A)',
    invigilator: 'Ms. Ananya Roy',
    maxWritten: 15,
    maxOral: 10,
    totalMax: 25,
    description: 'Letter sound blending, uppercase-lowercase matching, 3-letter word reading, and sight-word recitation.',
    status: 'EVALUATING'
  },
  {
    id: 'exam-2',
    title: 'Early Mathematics, Shapes & Object Counting',
    subject: 'Early Mathematics',
    category: 'TERM_SUMMATIVE',
    date: '25 Sep 2026',
    timeSlot: '10:00 AM - 11:15 AM',
    room: 'Room 102 (Classroom A)',
    invigilator: 'Ms. Ananya Roy & Mr. R. Sharma',
    maxWritten: 15,
    maxOral: 10,
    totalMax: 25,
    description: 'Number identification 1-20, counting physical beads, basic 2D geometric shapes (Circle, Square, Triangle), and size comparison.',
    status: 'UPCOMING'
  },
  {
    id: 'exam-3',
    title: 'Rhyme Recitation, Storytelling & Oral Expression',
    subject: 'Oral & General Awareness',
    category: 'ORAL_PRACTICAL',
    date: '28 Sep 2026',
    timeSlot: '11:15 AM - 12:30 PM',
    room: 'Activity Hall 1',
    invigilator: 'Ms. Ananya Roy',
    maxWritten: 0,
    maxOral: 25,
    totalMax: 25,
    description: 'Vocal projection, nursery rhyme memorization, animal sound mimicry, and answering simple conversational questions.',
    status: 'UPCOMING'
  }
];

// Initial marks map for exams
const initialMarksMap: Record<string, StudentMarkEntry[]> = {
  'exam-1': [
    {
      studentId: 's-01',
      studentName: 'Aarav Sharma',
      rollNo: '01',
      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
      isAbsent: false,
      writtenScore: 14,
      oralScore: 10,
      isLocked: true,
      teacherNote: 'Flawless phonics blending and clear speech!'
    },
    {
      studentId: 's-02',
      studentName: 'Ananya Patel',
      rollNo: '02',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      isAbsent: false,
      writtenScore: 13,
      oralScore: 9,
      isLocked: true,
      teacherNote: 'Recognized all consonants effortlessly.'
    },
    {
      studentId: 's-03',
      studentName: 'Vivaan Gupta',
      rollNo: '03',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      isAbsent: false,
      writtenScore: 11,
      oralScore: 8,
      isLocked: true,
      teacherNote: 'Good effort in letter formation.'
    },
    {
      studentId: 's-04',
      studentName: 'Diya Verma',
      rollNo: '04',
      photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      isAbsent: false,
      writtenScore: 7,
      oralScore: 6,
      isLocked: false,
      teacherNote: 'Needs extra guided practice on lowercase b & d.'
    },
    {
      studentId: 's-05',
      studentName: 'Reyansh Reddy',
      rollNo: '05',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isAbsent: false,
      writtenScore: 12,
      oralScore: 8,
      isLocked: true
    },
    {
      studentId: 's-06',
      studentName: 'Isha Nair',
      rollNo: '06',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isAbsent: false,
      writtenScore: 14,
      oralScore: 9,
      isLocked: true,
      teacherNote: 'Very expressive reading voice!'
    },
    {
      studentId: 's-07',
      studentName: 'Kabir Joshi',
      rollNo: '07',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isAbsent: true,
      writtenScore: 0,
      oralScore: 0,
      isLocked: false,
      teacherNote: 'Absent on medical grounds; retest scheduled.'
    },
    {
      studentId: 's-08',
      studentName: 'Myra Singh',
      rollNo: '08',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isAbsent: false,
      writtenScore: 10,
      oralScore: 7,
      isLocked: false
    }
  ]
};

// CBSE Standard Grade Calculation
export function calculateGrade(percentage: number): { grade: string; color: string; remarks: string } {
  if (percentage >= 91) return { grade: 'A1', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50', remarks: 'Outstanding' };
  if (percentage >= 81) return { grade: 'A2', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50', remarks: 'Excellent' };
  if (percentage >= 71) return { grade: 'B1', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50', remarks: 'Very Good' };
  if (percentage >= 61) return { grade: 'B2', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50', remarks: 'Good' };
  if (percentage >= 51) return { grade: 'C1', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50', remarks: 'Fair' };
  if (percentage >= 41) return { grade: 'C2', color: 'text-orange-700 bg-orange-100 dark:bg-orange-950', remarks: 'Average' };
  if (percentage >= 33) return { grade: 'D', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50', remarks: 'Marginal' };
  return { grade: 'E', color: 'text-red-700 bg-red-100 dark:bg-red-950', remarks: 'Needs Remediation' };
}

export default function ExamsMarksWorkspace({ students = [], onNavigateTab }: ExamsMarksWorkspaceProps) {
  // Navigation & Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<'GRADEBOOK' | 'TIMETABLE' | 'ANALYTICS' | 'REPORT_CARDS'>('GRADEBOOK');
  const [selectedExamId, setSelectedExamId] = useState<string>('exam-1');
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [selectedReportCardStudentId, setSelectedReportCardStudentId] = useState<string>('s-01');

  // Exams & Marks State
  const [examPapers, setExamPapers] = useState<ExamPaper[]>(initialExamPapers);
  const [marksMap, setMarksMap] = useState<Record<string, StudentMarkEntry[]>>(initialMarksMap);

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Form State for Scheduling New Exam
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('English & Phonics');
  const [newExamCategory, setNewExamCategory] = useState<'TERM_SUMMATIVE' | 'PERIODIC_DIAGNOSTIC' | 'ORAL_PRACTICAL'>('TERM_SUMMATIVE');
  const [newExamDate, setNewExamDate] = useState('2026-10-02');
  const [newExamTime, setNewExamTime] = useState('09:30 AM - 10:45 AM');
  const [newExamRoom, setNewExamRoom] = useState('Room 102 (Classroom A)');
  const [newExamMaxWritten, setNewExamMaxWritten] = useState(15);
  const [newExamMaxOral, setNewExamMaxOral] = useState(10);
  const [newExamDescription, setNewExamDescription] = useState('');

  // Selected Exam Object
  const selectedExam = useMemo(() => {
    return examPapers.find((e) => e.id === selectedExamId) || examPapers[0];
  }, [examPapers, selectedExamId]);

  // Current Exam Marks List
  const currentMarksList = useMemo(() => {
    return marksMap[selectedExamId] || [];
  }, [marksMap, selectedExamId]);

  // Filtered Marks List
  const filteredMarksList = useMemo(() => {
    return currentMarksList.filter((m) =>
      m.studentName.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
      m.rollNo.includes(searchStudentQuery)
    );
  }, [currentMarksList, searchStudentQuery]);

  // Executive KPI Calculations
  const kpiStats = useMemo(() => {
    const totalScheduled = examPapers.length;
    
    // Calculate entry progress for selected exam
    const presentStudents = currentMarksList.filter((m) => !m.isAbsent);
    const evaluatedCount = presentStudents.filter((m) => m.writtenScore > 0 || m.oralScore > 0).length;
    const progressPercentage = presentStudents.length > 0 ? Math.round((evaluatedCount / presentStudents.length) * 100) : 0;

    // Calculate class average for selected exam
    let totalScoreSum = 0;
    let countedPresent = 0;
    let remedialCount = 0;

    presentStudents.forEach((m) => {
      const score = m.writtenScore + m.oralScore;
      const pct = (score / (selectedExam.totalMax || 1)) * 100;
      totalScoreSum += pct;
      countedPresent++;
      if (pct < 60) remedialCount++;
    });

    const classAveragePct = countedPresent > 0 ? (totalScoreSum / countedPresent).toFixed(1) : '0';

    return {
      totalScheduled,
      progressPercentage,
      classAveragePct,
      remedialCount
    };
  }, [examPapers, currentMarksList, selectedExam]);

  // Analytics: Grade Distribution
  const gradeDistribution = useMemo(() => {
    const dist: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0, D: 0, E: 0 };
    currentMarksList.forEach((m) => {
      if (!m.isAbsent) {
        const total = m.writtenScore + m.oralScore;
        const pct = (total / (selectedExam.totalMax || 1)) * 100;
        const g = calculateGrade(pct).grade;
        dist[g] = (dist[g] || 0) + 1;
      }
    });
    return dist;
  }, [currentMarksList, selectedExam]);

  // Analytics: Class Toppers
  const classToppers = useMemo(() => {
    return [...currentMarksList]
      .filter((m) => !m.isAbsent)
      .sort((a, b) => (b.writtenScore + b.oralScore) - (a.writtenScore + a.oralScore))
      .slice(0, 3);
  }, [currentMarksList]);

  // Handler: Update Student Mark
  const handleScoreChange = (studentId: string, field: 'writtenScore' | 'oralScore', value: number) => {
    const maxAllowed = field === 'writtenScore' ? selectedExam.maxWritten : selectedExam.maxOral;
    const clampedValue = Math.max(0, Math.min(value, maxAllowed));

    setMarksMap((prev) => {
      const list = prev[selectedExamId] || [];
      const updated = list.map((item) => {
        if (item.studentId === studentId) {
          return {
            ...item,
            [field]: clampedValue
          };
        }
        return item;
      });
      return { ...prev, [selectedExamId]: updated };
    });
  };

  // Handler: Toggle Absent
  const handleToggleAbsent = (studentId: string) => {
    setMarksMap((prev) => {
      const list = prev[selectedExamId] || [];
      const updated = list.map((item) => {
        if (item.studentId === studentId) {
          const newAbsent = !item.isAbsent;
          return {
            ...item,
            isAbsent: newAbsent,
            writtenScore: newAbsent ? 0 : item.writtenScore,
            oralScore: newAbsent ? 0 : item.oralScore
          };
        }
        return item;
      });
      return { ...prev, [selectedExamId]: updated };
    });
    toast.success('Updated attendance status for exam.');
  };

  // Handler: Toggle Lock Status
  const handleToggleLock = (studentId: string) => {
    setMarksMap((prev) => {
      const list = prev[selectedExamId] || [];
      const updated = list.map((item) => {
        if (item.studentId === studentId) {
          const newLocked = !item.isLocked;
          return {
            ...item,
            isLocked: newLocked
          };
        }
        return item;
      });
      return { ...prev, [selectedExamId]: updated };
    });
  };

  // Handler: Lock All Marks
  const handleLockAll = () => {
    setMarksMap((prev) => {
      const list = prev[selectedExamId] || [];
      const updated = list.map((item) => ({ ...item, isLocked: true }));
      return { ...prev, [selectedExamId]: updated };
    });
    toast.success('🔒 All scores locked and finalized for ' + selectedExam.title);
  };

  // Handler: Create New Exam
  const handleScheduleExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) {
      toast.error('Please enter an exam title');
      return;
    }

    const newExam: ExamPaper = {
      id: `exam-${Date.now()}`,
      title: newExamTitle.trim(),
      subject: newExamSubject,
      category: newExamCategory,
      date: newExamDate,
      timeSlot: newExamTime,
      room: newExamRoom,
      invigilator: 'Ms. Ananya Roy',
      maxWritten: Number(newExamMaxWritten),
      maxOral: Number(newExamMaxOral),
      totalMax: Number(newExamMaxWritten) + Number(newExamMaxOral),
      description: newExamDescription.trim() || 'Diagnostic evaluation of term competencies.',
      status: 'UPCOMING'
    };

    setExamPapers((prev) => [...prev, newExam]);

    // Initialize marks map for this exam with existing students
    const initialMarks: StudentMarkEntry[] = (students.length > 0 ? students : [
      { id: 's-01', name: 'Aarav Sharma', rollNo: '01', photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80' },
      { id: 's-02', name: 'Ananya Patel', rollNo: '02', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
      { id: 's-03', name: 'Vivaan Gupta', rollNo: '03', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' }
    ]).map((s) => ({
      studentId: s.id,
      studentName: s.name,
      rollNo: s.rollNo,
      photoUrl: s.photo,
      isAbsent: false,
      writtenScore: 0,
      oralScore: 0,
      isLocked: false
    }));

    setMarksMap((prev) => ({ ...prev, [newExam.id]: initialMarks }));

    setIsScheduleModalOpen(false);
    setNewExamTitle('');
    setNewExamDescription('');
    toast.success('📅 Exam scheduled & added to class academic calendar!');
  };

  // Handler: Export CSV Ledger
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Roll No,Student Name,Status,Written Score,Oral Score,Total Score,Max Marks,Percentage,CBSE Grade,Teacher Note\r\n';

    currentMarksList.forEach((m) => {
      const total = m.writtenScore + m.oralScore;
      const pct = m.isAbsent ? 0 : ((total / (selectedExam.totalMax || 1)) * 100).toFixed(1);
      const grade = m.isAbsent ? 'AB' : calculateGrade(Number(pct)).grade;
      const statusText = m.isAbsent ? 'Absent' : 'Present';
      const cleanNote = (m.teacherNote || '').replace(/,/g, ' ');

      csvContent += `${m.rollNo},"${m.studentName}",${statusText},${m.writtenScore},${m.oralScore},${total},${selectedExam.totalMax},${pct}%,${grade},"${cleanNote}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GGPS_${selectedExam.subject.replace(/\s+/g, '_')}_Marks_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('📥 Term marks ledger CSV exported successfully!');
  };

  // Selected Student for Report Card Preview
  const selectedReportCardEntry = useMemo(() => {
    return currentMarksList.find((m) => m.studentId === selectedReportCardStudentId) || currentMarksList[0];
  }, [currentMarksList, selectedReportCardStudentId]);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & WORKSPACE BANNER */}
      <div className="bg-gradient-to-r from-[#000E28] via-[#0050CB] to-[#002B7A] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#FF690C]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#E5EEFF] text-xs font-semibold mb-3 border border-white/15">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#FF690C]" />
              <span>Academic Evaluation & Gradebook Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Exams, Marks & Tabulation Ledger
            </h1>
            <p className="text-sm text-blue-100/80 mt-1 max-w-xl">
              Schedule term assessments, record written and oral marks, auto-compute CBSE standard grades, and publish report cards directly to parent portals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#FF690C]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                printDocument('printable-exam-ledger', 'GGPS School - Term Examination Ledger');
              }}
              className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Print Ledger"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#FF690C] hover:bg-[#e05b07] text-white text-xs font-extrabold shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE METRIC RIBBON (KPI STRIP) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Scheduled Exams */}
        <div className="bg-white dark:bg-[#000E28]/40 dark:border-slate-800 p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Scheduled Papers</span>
            <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">
            {kpiStats.totalScheduled}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Term 1 Summative</span>
          </div>
        </div>

        {/* Card 2: Marks Entry Progress */}
        <div className="bg-white dark:bg-[#000E28]/40 dark:border-slate-800 p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Entry Progress</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0050CB] flex items-center justify-center">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">
            {kpiStats.progressPercentage}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Scores entered for {selectedExam.subject}
          </div>
        </div>

        {/* Card 3: Class Average Percentage */}
        <div className="bg-white dark:bg-[#000E28]/40 dark:border-slate-800 p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Class Aggregate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {kpiStats.classAveragePct}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Grade A2 Benchmark
          </div>
        </div>

        {/* Card 4: Remedial Watchlist */}
        <div className="bg-white dark:bg-[#000E28]/40 dark:border-slate-800 p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Remedial Support</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {kpiStats.remedialCount}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Pupils scoring below 60%
          </div>
        </div>
      </div>

      {/* 3. SUB-NAV TABS & WORKSPACE CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('GRADEBOOK')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'GRADEBOOK'
                ? 'bg-[#0050CB] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Marks Ledger Grid</span>
          </button>

          <button
            onClick={() => setActiveSubTab('TIMETABLE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'TIMETABLE'
                ? 'bg-[#0050CB] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Datesheet & Timetable</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
              {examPapers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('ANALYTICS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'ANALYTICS'
                ? 'bg-[#0050CB] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Performance Analytics</span>
          </button>

          <button
            onClick={() => setActiveSubTab('REPORT_CARDS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'REPORT_CARDS'
                ? 'bg-[#0050CB] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Report Cards</span>
          </button>
        </div>

        {/* Exam Paper Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Paper:
          </span>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#000E28] text-xs font-bold text-slate-800 dark:text-white cursor-pointer focus:outline-hidden focus:border-[#0050CB]"
          >
            {examPapers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} (Max: {p.totalMax})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: GRADEBOOK & MARKS ENTRY GRID                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'GRADEBOOK' && (
        <div id="printable-exam-ledger" className="space-y-4">
          {/* Top Control Strip: Search student, Total count, Lock All button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#000E28]/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter student or roll #..."
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white placeholder-slate-400"
                />
              </div>

              <span className="text-xs font-semibold text-slate-500">
                Showing {filteredMarksList.length} Students
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLockAll}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock All Entries</span>
              </button>

              <button
                onClick={() => {
                  toast.success(`Broadcasting grades for ${selectedExam.subject} to Parent App!`);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish to Parents</span>
              </button>
            </div>
          </div>

          {/* Marks Spreadsheet Table */}
          <div className="bg-white dark:bg-[#000E28]/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-16 text-center">Roll #</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4 text-center w-28">Status</th>
                    {selectedExam.maxWritten > 0 && (
                      <th className="py-3 px-4 text-center w-32">
                        Written ({selectedExam.maxWritten})
                      </th>
                    )}
                    {selectedExam.maxOral > 0 && (
                      <th className="py-3 px-4 text-center w-32">
                        Oral/Viva ({selectedExam.maxOral})
                      </th>
                    )}
                    <th className="py-3 px-4 text-center w-28">
                      Total ({selectedExam.totalMax})
                    </th>
                    <th className="py-3 px-4 text-center w-24">Percentage</th>
                    <th className="py-3 px-4 text-center w-24">CBSE Grade</th>
                    <th className="py-3 px-4">Teacher Remark</th>
                    <th className="py-3 px-4 text-center w-20">Lock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredMarksList.map((row) => {
                    const totalScore = row.writtenScore + row.oralScore;
                    const percentage = row.isAbsent
                      ? 0
                      : Math.round((totalScore / (selectedExam.totalMax || 1)) * 100);
                    const gradeInfo = row.isAbsent
                      ? { grade: 'AB', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950', remarks: 'Absent' }
                      : calculateGrade(percentage);

                    return (
                      <tr
                        key={row.studentId}
                        className={`hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors ${
                          row.isAbsent ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        {/* Roll Number */}
                        <td className="py-3 px-4 text-center font-black text-slate-700 dark:text-slate-300">
                          {row.rollNo}
                        </td>

                        {/* Student Name & Avatar */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={row.photoUrl}
                              alt={row.studentName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-800 dark:text-white block">
                                {row.studentName}
                              </span>
                              <span className="text-[10px] text-slate-400">Class LKG-A</span>
                            </div>
                          </div>
                        </td>

                        {/* Attendance Toggle (Present / Absent) */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleAbsent(row.studentId)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                              row.isAbsent
                                ? 'bg-red-500 text-white shadow-xs'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                            }`}
                          >
                            {row.isAbsent ? 'ABSENT' : 'PRESENT'}
                          </button>
                        </td>

                        {/* Written Marks Input */}
                        {selectedExam.maxWritten > 0 && (
                          <td className="py-3 px-4 text-center">
                            {row.isAbsent ? (
                              <span className="text-slate-400 font-bold">--</span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={selectedExam.maxWritten}
                                disabled={row.isLocked}
                                value={row.writtenScore}
                                onChange={(e) =>
                                  handleScoreChange(row.studentId, 'writtenScore', Number(e.target.value))
                                }
                                className={`w-16 p-1.5 text-center font-bold rounded-lg border text-xs focus:ring-2 focus:ring-[#0050CB] focus:outline-hidden ${
                                  row.isLocked
                                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-600'
                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white'
                                }`}
                              />
                            )}
                          </td>
                        )}

                        {/* Oral Marks Input */}
                        {selectedExam.maxOral > 0 && (
                          <td className="py-3 px-4 text-center">
                            {row.isAbsent ? (
                              <span className="text-slate-400 font-bold">--</span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={selectedExam.maxOral}
                                disabled={row.isLocked}
                                value={row.oralScore}
                                onChange={(e) =>
                                  handleScoreChange(row.studentId, 'oralScore', Number(e.target.value))
                                }
                                className={`w-16 p-1.5 text-center font-bold rounded-lg border text-xs focus:ring-2 focus:ring-[#0050CB] focus:outline-hidden ${
                                  row.isLocked
                                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-600'
                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white'
                                }`}
                              />
                            )}
                          </td>
                        )}

                        {/* Total Score */}
                        <td className="py-3 px-4 text-center font-black text-slate-800 dark:text-white">
                          {row.isAbsent ? '--' : totalScore}
                        </td>

                        {/* Percentage */}
                        <td className="py-3 px-4 text-center font-bold text-slate-600 dark:text-slate-300">
                          {row.isAbsent ? '--' : `${percentage}%`}
                        </td>

                        {/* CBSE Grade Badge */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${gradeInfo.color}`}
                          >
                            {gradeInfo.grade}
                          </span>
                        </td>

                        {/* Teacher Remark */}
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Optional feedback..."
                            disabled={row.isLocked}
                            value={row.teacherNote || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMarksMap((prev) => {
                                const list = prev[selectedExamId] || [];
                                const updated = list.map((item) =>
                                  item.studentId === row.studentId ? { ...item, teacherNote: val } : item
                                );
                                return { ...prev, [selectedExamId]: updated };
                              });
                            }}
                            className="w-full p-1 bg-transparent text-xs text-slate-600 dark:text-slate-300 placeholder-slate-400 focus:outline-hidden border-b border-transparent focus:border-[#0050CB]"
                          />
                        </td>

                        {/* Lock / Unlock Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleLock(row.studentId)}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title={row.isLocked ? 'Unlock Entry' : 'Lock Entry'}
                          >
                            {row.isLocked ? (
                              <Lock className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5 text-amber-500" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: DATESHEET & TIMETABLE                                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'TIMETABLE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {examPapers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white dark:bg-[#000E28]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#0050CB]/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E5EEFF] text-[#0050CB]">
                      {paper.subject}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        paper.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : paper.status === 'EVALUATING'
                          ? 'bg-amber-50 text-amber-700 animate-pulse'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {paper.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-800 dark:text-white group-hover:text-[#0050CB] transition-colors">
                    {paper.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                    {paper.description}
                  </p>

                  <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#0050CB]" />
                      <span>{paper.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{paper.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Invigilator: {paper.invigilator}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Max Marks: {paper.totalMax}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedExamId(paper.id);
                      setActiveSubTab('GRADEBOOK');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#E5EEFF] hover:bg-blue-200 text-[#0050CB] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Gradebook</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: PERFORMANCE ANALYTICS                                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {/* Grade Distribution Bar Chart */}
          <div className="bg-white dark:bg-[#000E28]/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1">
              CBSE Grade Distribution: {selectedExam.title}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Total Evaluated: {currentMarksList.filter((m) => !m.isAbsent).length} Students
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {Object.entries(gradeDistribution).map(([grade, count]) => {
                const total = currentMarksList.filter((m) => !m.isAbsent).length || 1;
                const barHeight = Math.max(12, Math.round((count / total) * 120));

                return (
                  <div key={grade} className="flex flex-col items-center justify-end">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mb-1.5">
                      {count}
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden flex items-end h-32 p-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${barHeight}px` }}
                        transition={{ duration: 0.6 }}
                        className={`w-full rounded-lg ${
                          grade.startsWith('A')
                            ? 'bg-[#0050CB]'
                            : grade.startsWith('B')
                            ? 'bg-cyan-500'
                            : grade.startsWith('C')
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300 mt-2">
                      {grade}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2-Column: Toppers Podium vs Remedial Support List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Toppers Podium */}
            <div className="bg-white dark:bg-[#000E28]/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
                  Class High Achievers (Top 3)
                </h4>
              </div>

              <div className="space-y-3">
                {classToppers.map((top, idx) => {
                  const score = top.writtenScore + top.oralScore;
                  const pct = Math.round((score / (selectedExam.totalMax || 1)) * 100);

                  return (
                    <div
                      key={top.studentId}
                      className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          #{idx + 1}
                        </div>
                        <img
                          src={top.photoUrl}
                          alt={top.studentName}
                          className="w-9 h-9 rounded-full object-cover border"
                        />
                        <div>
                          <h5 className="font-bold text-xs text-slate-800 dark:text-white">
                            {top.studentName}
                          </h5>
                          <span className="text-[10px] text-slate-400">Roll #{top.rollNo}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                          {score}/{selectedExam.totalMax}
                        </span>
                        <span className="text-[10px] text-slate-500 block">{pct}% (A1)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remedial List */}
            <div className="bg-white dark:bg-[#000E28]/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#FF690C]" />
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
                  Academic Remediation Queue
                </h4>
              </div>

              <div className="space-y-2">
                {currentMarksList
                  .filter((m) => {
                    if (m.isAbsent) return false;
                    const score = m.writtenScore + m.oralScore;
                    return (score / (selectedExam.totalMax || 1)) * 100 < 60;
                  })
                  .map((rem) => (
                    <div
                      key={rem.studentId}
                      className="p-3 bg-orange-50/40 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-900 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rem.photoUrl}
                          alt={rem.studentName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <h5 className="font-bold text-xs text-slate-800 dark:text-white">
                            {rem.studentName}
                          </h5>
                          <span className="text-[10px] text-orange-600 font-semibold">
                            Score: {rem.writtenScore + rem.oralScore}/{selectedExam.totalMax}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab('HOMEWORK');
                          toast.success(`Assigning targeted home practice for ${rem.studentName}`);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#FF690C] hover:bg-orange-600 text-white text-[11px] font-bold shadow-xs cursor-pointer"
                      >
                        + Assign Home Practice
                      </button>
                    </div>
                  ))}

                {currentMarksList.filter(
                  (m) => !m.isAbsent && ((m.writtenScore + m.oralScore) / (selectedExam.totalMax || 1)) * 100 < 60
                ).length === 0 && (
                  <div className="py-8 text-center text-slate-400">
                    <CheckCheck className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-600">All students are above the 60% threshold!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: OFFICIAL REPORT CARD PREVIEW                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'REPORT_CARDS' && (
        <div className="space-y-4">
          {/* Student Selector Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto p-3 bg-white dark:bg-[#000E28]/40 rounded-2xl border border-slate-200 dark:border-slate-800 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">
              Select Child:
            </span>
            {currentMarksList.map((m) => (
              <button
                key={m.studentId}
                onClick={() => setSelectedReportCardStudentId(m.studentId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  selectedReportCardStudentId === m.studentId
                    ? 'bg-[#0050CB] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <img src={m.photoUrl} alt={m.studentName} className="w-5 h-5 rounded-full object-cover" />
                <span>{m.studentName}</span>
              </button>
            ))}
          </div>

          {/* Printable Report Card Card */}
          {selectedReportCardEntry && (
            <div id="printable-student-report-card-modal" className="bg-white dark:bg-[#000E28] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl max-w-3xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold text-[#0050CB] uppercase tracking-wider block mb-1">
                    GGPS Central Board of Secondary Education
                  </span>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">
                    Official Term 1 Academic Performance Card
                  </h2>
                  <p className="text-xs text-slate-500">Academic Session 2026–2027 • Class LKG-A</p>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                    Verified & Certified
                  </span>
                </div>
              </div>

              {/* Student Bio Strip */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <img
                  src={selectedReportCardEntry.photoUrl}
                  alt={selectedReportCardEntry.studentName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#0050CB]"
                />
                <div className="grid grid-cols-3 gap-6 flex-1 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Student</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">
                      {selectedReportCardEntry.studentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Roll Number</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">
                      #{selectedReportCardEntry.rollNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Class Teacher</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">Ms. Ananya Roy</span>
                  </div>
                </div>
              </div>

              {/* Subject Ledger Preview */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5">Subject</th>
                    <th className="py-2.5 text-center">Written (15)</th>
                    <th className="py-2.5 text-center">Oral (10)</th>
                    <th className="py-2.5 text-center">Total (25)</th>
                    <th className="py-2.5 text-center">CBSE Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 font-bold text-slate-800 dark:text-white">English Reading & Phonics</td>
                    <td className="py-3 text-center">{selectedReportCardEntry.writtenScore}</td>
                    <td className="py-3 text-center">{selectedReportCardEntry.oralScore}</td>
                    <td className="py-3 text-center font-extrabold">
                      {selectedReportCardEntry.writtenScore + selectedReportCardEntry.oralScore}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-[#0050CB]">
                        {calculateGrade(
                          ((selectedReportCardEntry.writtenScore + selectedReportCardEntry.oralScore) / 25) * 100
                        ).grade}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-800 dark:text-white">Early Mathematics & Logic</td>
                    <td className="py-3 text-center">14</td>
                    <td className="py-3 text-center">9</td>
                    <td className="py-3 text-center font-extrabold">23</td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-600">
                        A1
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-800 dark:text-white">Rhymes & Storytelling</td>
                    <td className="py-3 text-center">--</td>
                    <td className="py-3 text-center">24</td>
                    <td className="py-3 text-center font-extrabold">24</td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-600">
                        A1
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Teacher Remarks */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900 text-xs space-y-1">
                <span className="font-extrabold text-[#0050CB] block">Teacher's Holistic Assessment:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{selectedReportCardEntry.teacherNote || 'Consistently enthusiastic pupil with cheerful peer participation and keen curiosity in classroom storytelling.'}"
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => printDocument('printable-student-report-card-modal', `GGPS Report Card - ${selectedReportCardEntry.studentName}`)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Print Report Card
                  </button>
                  <button
                    onClick={async () => {
                      const studentId = selectedReportCardEntry.studentId || 'student-1';
                      const safeName = selectedReportCardEntry.studentName.replace(/\s+/g, '_');
                      await downloadPdf(
                        `/api/v1/students/${studentId}/report-card`,
                        `GGPS_Report_Card_${safeName}_2026-2027.pdf`
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>

                <button
                  onClick={() => {
                    toast.success(`Published ${selectedReportCardEntry.studentName}'s report card to parent portal!`);
                  }}
                  className="px-6 py-2 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish to Parent App</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SCHEDULE NEW EXAM                                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-800 dark:text-white">
                      Schedule Assessment / Exam Paper
                    </h3>
                    <p className="text-[11px] text-slate-400">Class: LKG - Section A</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleScheduleExam} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hindi Vowels & Oral Picture Identification"
                    value={newExamTitle}
                    onChange={(e) => setNewExamTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Subject
                    </label>
                    <select
                      value={newExamSubject}
                      onChange={(e) => setNewExamSubject(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    >
                      <option value="English & Phonics">English & Phonics</option>
                      <option value="Early Mathematics">Early Mathematics</option>
                      <option value="Oral & General Awareness">Oral & General Awareness</option>
                      <option value="Hindi & Varnamala">Hindi & Varnamala</option>
                      <option value="Creative Arts & Craft">Creative Arts & Craft</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Category
                    </label>
                    <select
                      value={newExamCategory}
                      onChange={(e) => setNewExamCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    >
                      <option value="TERM_SUMMATIVE">Term Summative (Written + Oral)</option>
                      <option value="PERIODIC_DIAGNOSTIC">Periodic Unit Test</option>
                      <option value="ORAL_PRACTICAL">Oral / Viva Practical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Exam Date
                    </label>
                    <input
                      type="date"
                      value={newExamDate}
                      onChange={(e) => setNewExamDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    >
                    </input>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Time Slot
                    </label>
                    <input
                      type="text"
                      value={newExamTime}
                      onChange={(e) => setNewExamTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Max Written
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newExamMaxWritten}
                      onChange={(e) => setNewExamMaxWritten(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Max Oral
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newExamMaxOral}
                      onChange={(e) => setNewExamMaxOral(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Total Max
                    </label>
                    <input
                      type="text"
                      disabled
                      value={Number(newExamMaxWritten) + Number(newExamMaxOral)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Room / Venue
                  </label>
                  <input
                    type="text"
                    value={newExamRoom}
                    onChange={(e) => setNewExamRoom(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Syllabus Topics & Evaluation Scope
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of chapters, worksheets, or phonics sounds covered..."
                    value={newExamDescription}
                    onChange={(e) => setNewExamDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0050CB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    Save & Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
