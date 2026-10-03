"use client";

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Printer,
  BookOpen,
  Sparkles,
  Check,
  X,
  FileText,
  AlertCircle,
  Share2,
  Users,
  Camera,
  MessageSquare,
  Eye,
  ExternalLink,
  ShieldCheck,
  Send,
  HelpCircle,
  ArrowRight,
  SlidersHorizontal,
  Bookmark,
  CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { printDocument } from '@/lib/exportUtils';

export type ClassWorkStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';

export interface ClassWorkPeriod {
  id: string;
  subject: string;
  topic: string;
  timeSlot: string;
  status: ClassWorkStatus;
  workbookReference: string;
  teacherNotes: string;
  boardPhotoUrl?: string;
  worksheetPdfName?: string;
  completedCount: number;
  totalStudents: number;
  incompleteStudentIds: string[];
}

export interface StudentReference {
  id: string;
  name: string;
  rollNo: string;
  photo: string;
}

export interface ParentReceipt {
  studentId: string;
  studentName: string;
  parentName: string;
  hasViewed: boolean;
  viewedTime?: string;
  signedAck: boolean;
}

interface ClassWorkWorkspaceProps {
  students?: Array<{
    id: string;
    name: string;
    rollNo: string;
    photo: string;
  }>;
  onNavigateTab?: (tab: any) => void;
}

const initialClassWorkPeriods: ClassWorkPeriod[] = [
  {
    id: 'cw-1',
    subject: 'English & Phonics',
    topic: 'Alphabet Tracing: Letters A, B, C & Phonic Sounds',
    timeSlot: '09:00 AM - 09:45 AM',
    status: 'COMPLETED',
    workbookReference: 'Little Learners Phonics Workbook Vol 1, Pages 14–16',
    teacherNotes: 'Children practiced phonics sounds /æ/, /b/, /k/ with flash cards. Traced uppercase letters in practice books with wax crayons.',
    boardPhotoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
    worksheetPdfName: 'Worksheet_Phonics_Letters_ABC.pdf',
    completedCount: 26,
    totalStudents: 28,
    incompleteStudentIds: ['s-04', 's-08']
  },
  {
    id: 'cw-2',
    subject: 'Early Mathematics',
    topic: 'Numbers & Counting: 1 to 10 with Color Beads',
    timeSlot: '10:00 AM - 10:45 AM',
    status: 'IN_PROGRESS',
    workbookReference: 'Kinder Math Discovery Book, Pages 20–22 (Number 4 & 5 Matching)',
    teacherNotes: 'Counting real objects and beads. Associating quantity with numeric symbols 1-5. Fine-motor bead threading.',
    boardPhotoUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80',
    worksheetPdfName: 'Math_Counting_Beads_Practice.pdf',
    completedCount: 24,
    totalStudents: 28,
    incompleteStudentIds: ['s-02', 's-05', 's-07']
  },
  {
    id: 'cw-3',
    subject: 'Art & Fine Motor Skills',
    topic: 'Finger Painting & Color Mixing (Red + Yellow = Orange)',
    timeSlot: '11:15 AM - 12:00 PM',
    status: 'UPCOMING',
    workbookReference: 'Classroom Art Scrapbook, Sheet #6 (Sunset Butterfly)',
    teacherNotes: 'Sensory finger painting on chart paper. Enhances grip strength and color identification.',
    boardPhotoUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80',
    completedCount: 0,
    totalStudents: 28,
    incompleteStudentIds: []
  },
  {
    id: 'cw-4',
    subject: 'Rhymes & Storytelling',
    topic: 'The Lion and the Mouse & Action Rhymes',
    timeSlot: '12:30 PM - 01:15 PM',
    status: 'UPCOMING',
    workbookReference: 'Nursery Rhyme & Moral Story Reader, Story #3',
    teacherNotes: 'Interactive puppet storytelling and singing animal action rhymes with vocal imitation.',
    completedCount: 0,
    totalStudents: 28,
    incompleteStudentIds: []
  }
];

export default function ClassWorkWorkspace({ students = [], onNavigateTab }: ClassWorkWorkspaceProps) {
  // Navigation & Date State
  const [activeSubTab, setActiveSubTab] = useState<'TIMELINE' | 'STUDENT_TRACKER' | 'BOARD_PHOTOS' | 'PARENT_FEED'>('TIMELINE');
  const [currentDateIndex, setCurrentDateIndex] = useState(2); // 0: 16 Sep, 1: 17 Sep, 2: 18 Sep (Today)
  const [searchQuery, setSearchQuery] = useState('');

  // Class work items state
  const [periods, setPeriods] = useState<ClassWorkPeriod[]>(initialClassWorkPeriods);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedPeriodForRoster, setSelectedPeriodForRoster] = useState<ClassWorkPeriod | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State for Add Class Work
  const [newSubject, setNewSubject] = useState('English & Phonics');
  const [newTopic, setNewTopic] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('09:00 AM - 09:45 AM');
  const [newWorkbookRef, setNewWorkbookRef] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newBoardPhoto, setNewBoardPhoto] = useState('');

  // Parent General Diary Remark
  const [dailyGeneralNote, setDailyGeneralNote] = useState(
    'Dear Parents, today children explored Letter C and practiced counting objects 1-5. Please review page 16 with your child tonight. Tomorrow is Yellow Day!'
  );
  const [isDiaryBroadcasted, setIsDiaryBroadcasted] = useState(true);

  // Fallback Student Roster
  const studentRoster: StudentReference[] = useMemo(() => {
    if (students && students.length > 0) {
      return students.map((s) => ({
        id: s.id,
        name: s.name,
        rollNo: s.rollNo,
        photo: s.photo || 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80'
      }));
    }
    return [
      { id: 's-01', rollNo: '01', name: 'Aarav Sharma', photo: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80' },
      { id: 's-02', rollNo: '02', name: 'Ananya Deshmukh', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
      { id: 's-03', rollNo: '03', name: 'Diya Patel', photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80' },
      { id: 's-04', rollNo: '04', name: 'Kabir Verma', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
      { id: 's-05', rollNo: '05', name: 'Reyansh Iyer', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { id: 's-06', rollNo: '06', name: 'Myra Kapoor', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { id: 's-07', rollNo: '07', name: 'Zara Khan', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
      { id: 's-08', rollNo: '08', name: 'Advait Nair', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' }
    ];
  }, [students]);

  // Mock Parent Receipts for today
  const parentReceipts: ParentReceipt[] = useMemo(() => {
    return studentRoster.map((s, idx) => ({
      studentId: s.id,
      studentName: s.name,
      parentName: `${s.name.split(' ')[1] || 'Family'} Parent`,
      hasViewed: idx !== 1 && idx !== 6, // 2 unread
      viewedTime: idx !== 1 && idx !== 6 ? 'Today, 01:25 PM' : undefined,
      signedAck: idx < 5
    }));
  }, [studentRoster]);

  const datesList = useMemo(() => {
    const now = new Date();
    return [2, 1, 0].map(daysAgo => {
      const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const weekday = d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long' });
      const dateStr = d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
      return {
        label: daysAgo === 0 ? `${weekday} (Today)` : weekday,
        date: dateStr,
      };
    });
  }, []);

  // Filtered periods
  const filteredPeriods = useMemo(() => {
    return periods.filter((p) => {
      const match =
        p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.workbookReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.teacherNotes.toLowerCase().includes(searchQuery.toLowerCase());
      return match;
    });
  }, [periods, searchQuery]);

  // Quick stats
  const completedPeriodsCount = periods.filter((p) => p.status === 'COMPLETED').length;
  const inProgressPeriodsCount = periods.filter((p) => p.status === 'IN_PROGRESS').length;
  const totalIncompleteCount = periods.reduce((acc, p) => acc + p.incompleteStudentIds.length, 0);
  const parentsViewedCount = parentReceipts.filter((r) => r.hasViewed).length;

  // Handlers
  const handleTogglePeriodStatus = (period: ClassWorkPeriod) => {
    const next: Record<ClassWorkStatus, ClassWorkStatus> = {
      UPCOMING: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      COMPLETED: 'UPCOMING'
    };
    const updatedStatus = next[period.status];
    setPeriods((prev) =>
      prev.map((p) =>
        p.id === period.id
          ? {
              ...p,
              status: updatedStatus,
              completedCount: updatedStatus === 'COMPLETED' ? 26 : p.completedCount
            }
          : p
      )
    );
    toast.success(`Period status updated to ${updatedStatus.replace('_', ' ')}!`);
  };

  const handleSaveNewClassWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) {
      toast.error('Please enter the topic covered');
      return;
    }

    const newPeriod: ClassWorkPeriod = {
      id: `cw-${Date.now()}`,
      subject: newSubject,
      topic: newTopic.trim(),
      timeSlot: newTimeSlot,
      status: 'UPCOMING',
      workbookReference: newWorkbookRef || 'Classroom Workbook / Handout Sheet',
      teacherNotes: newNotes || 'Students completed hands-on exercises in their workbooks.',
      boardPhotoUrl: newBoardPhoto || undefined,
      completedCount: 0,
      totalStudents: 28,
      incompleteStudentIds: []
    };

    setPeriods((prev) => [...prev, newPeriod]);
    setIsAddModalOpen(false);
    toast.success(`✨ Added "${newTopic}" to Daily Class Work!`);

    // Reset
    setNewTopic('');
    setNewWorkbookRef('');
    setNewNotes('');
    setNewBoardPhoto('');
  };

  const handleToggleStudentCompletion = (periodId: string, studentId: string) => {
    setPeriods((prev) =>
      prev.map((p) => {
        if (p.id !== periodId) return p;
        const isIncomplete = p.incompleteStudentIds.includes(studentId);
        const nextIncomplete = isIncomplete
          ? p.incompleteStudentIds.filter((id) => id !== studentId)
          : [...p.incompleteStudentIds, studentId];
        return {
          ...p,
          incompleteStudentIds: nextIncomplete,
          completedCount: p.totalStudents - nextIncomplete.length
        };
      })
    );
  };

  const handleSendIncompleteToHomework = (period: ClassWorkPeriod) => {
    const count = period.incompleteStudentIds.length;
    if (count === 0) {
      toast.success('All students have finished their workbook in class!');
      return;
    }

    toast.success(
      `📝 Converted incomplete work for ${count} students into Home Practice in the Homework tab!`
    );
    if (onNavigateTab) {
      setTimeout(() => onNavigateTab('HOMEWORK'), 800);
    }
  };

  const handleBroadcastDiary = () => {
    setIsDiaryBroadcasted(true);
    setIsBroadcastModalOpen(false);
    toast.success(
      '📢 Daily Classwork & Diary published! Push notifications dispatched to all 28 registered guardians.'
    );
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & COMMAND TOOLBAR                                           */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#000E28] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/70 text-[#0050CB] dark:text-blue-300 flex items-center justify-center font-bold text-xl shadow-xs">
                📖
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
                    Daily Class Work & Parent Diary
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 border border-emerald-300/60">
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Published to Parent App
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Class LKG - Section A • Real-time workbook completion, whiteboard records, and parent daily communication
                </p>
              </div>
            </div>
          </div>

          {/* Date Navigator & Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            {/* Date Pill Navigator */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  if (currentDateIndex > 0) {
                    setCurrentDateIndex(currentDateIndex - 1);
                    toast.success(`Viewing diary for ${datesList[currentDateIndex - 1].date}`);
                  }
                }}
                className="p-1.5 text-slate-500 hover:text-[#0050CB] dark:hover:text-blue-400 rounded-lg cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 text-xs font-black text-[#000E28] dark:text-white shrink-0">
                {datesList[currentDateIndex].label} • {datesList[currentDateIndex].date.split(' ')[0]} {datesList[currentDateIndex].date.split(' ')[1]}
              </span>

              <button
                onClick={() => {
                  if (currentDateIndex < datesList.length - 1) {
                    setCurrentDateIndex(currentDateIndex + 1);
                    toast.success(`Viewing diary for ${datesList[currentDateIndex + 1].date}`);
                  }
                }}
                className="p-1.5 text-slate-500 hover:text-[#0050CB] dark:hover:text-blue-400 rounded-lg cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Print Daily Diary Sheet"
            >
              <Printer className="w-4 h-4 text-[#0050CB]" />
              <span>Print Diary</span>
            </button>

            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#E5EEFF] dark:bg-blue-950/60 hover:bg-blue-100 text-[#0050CB] dark:text-blue-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-blue-200/60"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Diary</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class Work</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('TIMELINE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'TIMELINE'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Period Timeline ({periods.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('STUDENT_TRACKER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'STUDENT_TRACKER'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Workbook Roster (28)</span>
            {totalIncompleteCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#FF690C] text-white text-[10px] font-black">
                {totalIncompleteCount} pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('BOARD_PHOTOS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'BOARD_PHOTOS'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Board & Worksheets</span>
          </button>

          <button
            onClick={() => setActiveSubTab('PARENT_FEED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'PARENT_FEED'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Parent Live Feed ({parentsViewedCount}/28)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP KPI METRICS BAR                                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Periods Taught Today
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#000E28] dark:text-white">{periods.length}</span>
              <span className="text-xs text-[#0050CB] font-bold">Planned</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              {completedPeriodsCount} completed • {inProgressPeriodsCount} live
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] flex items-center justify-center font-black">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Class Workbook Completion
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#000E28] dark:text-white">89.2%</span>
              <span className="text-xs text-emerald-600 font-bold">High Pace</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              25 of 28 children finished
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Parent Reads & Sign-off
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#000E28] dark:text-white">24 / 28</span>
              <span className="text-xs text-blue-600 font-bold">85.7%</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Guardians acknowledged diary
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-black">
            <Share2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Pending Follow-up
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#FF690C]">{totalIncompleteCount}</span>
              <span className="text-xs text-amber-600 font-bold">Incomplete</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              1-Tap push to Home Practice
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#FF690C] flex items-center justify-center font-black">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SEARCH & QUICK FILTER BAR                                              */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Viewing: {datesList[currentDateIndex].label} ({datesList[currentDateIndex].date})
          </span>
        </div>

        <div className="relative shrink-0 sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subject, workbook pages, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#0050CB]"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: PERIOD-BY-PERIOD TIMELINE                                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'TIMELINE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPeriods.map((item) => {
              const isDone = item.status === 'COMPLETED';
              const isLive = item.status === 'IN_PROGRESS';

              return (
                <div
                  key={item.id}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between group ${
                    isLive
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 border-[#0050CB] shadow-md ring-1 ring-[#0050CB]/30'
                      : isDone
                      ? 'bg-white dark:bg-[#000E28] border-slate-200 dark:border-slate-800 hover:border-blue-300'
                      : 'bg-slate-50/50 dark:bg-[#000E28]/50 border-slate-200 dark:border-slate-800 opacity-90'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top period row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#0050CB] dark:text-blue-300 bg-[#E5EEFF] dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200/50">
                          {item.subject}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#0050CB]" /> {item.timeSlot}
                        </span>
                      </div>

                      <button
                        onClick={() => handleTogglePeriodStatus(item)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200'
                            : isLive
                            ? 'bg-[#FF690C] text-white animate-pulse'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}
                        title="Click to toggle status"
                      >
                        • {item.status.replace('_', ' ')}
                      </button>
                    </div>

                    {/* Topic Title */}
                    <h3 className="font-black text-base text-[#000E28] dark:text-white leading-tight">
                      {item.topic}
                    </h3>

                    {/* Workbook reference badge */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5">
                      <BookOpen className="w-4 h-4 text-[#0050CB] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Class Workbook Reference:
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.workbookReference}
                        </p>
                      </div>
                    </div>

                    {/* Teacher Notes */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {item.teacherNotes}
                    </p>

                    {/* Photo preview thumbnail if available */}
                    {item.boardPhotoUrl && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                          <img
                            src={item.boardPhotoUrl}
                            alt="Board snapshot"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <span className="font-bold text-[#0050CB] block">Whiteboard Photo Attached</span>
                          <span>Shared with 28 parent accounts</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Student Completion Status & Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <Users className="w-3.5 h-3.5 text-[#0050CB]" />
                      <span>{item.completedCount} / {item.totalStudents} Finished in Class</span>
                      {item.incompleteStudentIds.length > 0 && (
                        <span className="text-[10px] font-bold text-[#FF690C] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                          ({item.incompleteStudentIds.length} pending)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPeriodForRoster(item);
                          setIsRosterModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        Class Roster
                      </button>

                      {item.incompleteStudentIds.length > 0 && (
                        <button
                          onClick={() => handleSendIncompleteToHomework(item)}
                          className="px-3 py-1.5 rounded-xl bg-[#FF690C] hover:bg-orange-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Convert pending workbook tasks into home practice"
                        >
                          → Homework
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: STUDENT WORKBOOK TRACKER MATRIX                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'STUDENT_TRACKER' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#000E28] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-[#000E28] dark:text-white">
                Classroom Workbook Completion Matrix (Class LKG-A)
              </h3>
              <p className="text-xs text-slate-500">
                Track individual child progress on assigned pages across today's periods
              </p>
            </div>
            <button
              onClick={() => {
                // Mark all completed
                setPeriods((prev) =>
                  prev.map((p) => ({
                    ...p,
                    completedCount: p.totalStudents,
                    incompleteStudentIds: []
                  }))
                );
                toast.success('All 28 children marked as workbook completed!');
              }}
              className="px-4 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Mark All 28 Finished ✓
            </button>
          </div>

          <div className="bg-white dark:bg-[#000E28] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Student</th>
                    {periods.map((p) => (
                      <th key={p.id} className="p-4 text-center">
                        <div>{p.subject}</div>
                        <div className="text-[9px] text-[#0050CB] font-semibold lowercase">
                          {p.workbookReference.split(',')[1] || 'workbook'}
                        </div>
                      </th>
                    ))}
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {studentRoster.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={st.photo}
                            alt={st.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white block">
                              #{st.rollNo} {st.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {periods.map((p) => {
                        const isIncomplete = p.incompleteStudentIds.includes(st.id);
                        return (
                          <td key={p.id} className="p-4 text-center">
                            <button
                              onClick={() => handleToggleStudentCompletion(p.id, st.id)}
                              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                isIncomplete
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200'
                              }`}
                            >
                              {isIncomplete ? '⏳ Incomplete' : '✅ Finished'}
                            </button>
                          </td>
                        );
                      })}

                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('CHILD GROWTH');
                            toast.success(`Viewing growth profile for ${st.name}`);
                          }}
                          className="text-[#0050CB] dark:text-blue-400 font-bold hover:underline"
                        >
                          Growth Card →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: WHITEBOARD & WORKSHEET EVIDENCE                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'BOARD_PHOTOS' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#000E28] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-[#000E28] dark:text-white">
                Classroom Whiteboard & Worksheets Gallery
              </h3>
              <p className="text-xs text-slate-500">
                Snapshots uploaded directly from Room 102 for parents' visual reference
              </p>
            </div>
            <button
              onClick={() => {
                toast.success('Snap photo action ready! Select period to attach.');
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-[#FF690C] hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Camera className="w-4 h-4" />
              <span>Upload New Snapshot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {periods
              .filter((p) => p.boardPhotoUrl)
              .map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-[#000E28] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="h-52 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={p.boardPhotoUrl}
                        alt={p.topic}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-[#0050CB] font-bold text-[10px] backdrop-blur-xs">
                          {p.subject}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-[#000E28] dark:text-white">
                        {p.topic}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {p.workbookReference}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-semibold">{p.timeSlot}</span>
                    <button
                      onClick={() => toast.success("Opening high-res view...")}
                      className="text-[#0050CB] dark:text-blue-400 font-bold hover:underline"
                    >
                      View High-Res →
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: PARENT DIARY BROADCAST FEED                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'PARENT_FEED' && (
        <div className="space-y-6">
          {/* Simulation of Parent App Screen */}
          <div className="bg-white dark:bg-[#000E28] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0050CB] dark:text-blue-400 block mb-1">
                  Live Preview: What Parents See on Mobile App
                </span>
                <h3 className="text-base font-black text-[#000E28] dark:text-white">
                  Classroom LKG-A • Daily School Diary ({new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  ✓ Broadcast Delivered (24 Read)
                </span>
              </div>
            </div>

            {/* General Remark from Teacher */}
            <div className="p-4 rounded-2xl bg-[#E5EEFF]/60 dark:bg-blue-950/30 border border-[#0050CB]/20 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0050CB] dark:text-blue-300 block">
                Teacher Message to Guardians:
              </span>
              <p className="text-xs text-slate-800 dark:text-white font-semibold leading-relaxed">
                "{dailyGeneralNote}"
              </p>
            </div>

            {/* Period Summaries */}
            <div className="space-y-3">
              {periods.map((p, i) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0050CB]">{p.subject}</span>
                      <span className="text-slate-400">• {p.timeSlot}</span>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-white">{p.topic}</p>
                    <p className="text-slate-500 font-medium">Book: {p.workbookReference}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[10px] font-bold shrink-0">
                    Done in Class
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Parent Read & Acknowledgment Log */}
          <div className="bg-white dark:bg-[#000E28] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider">
              Parent Read Receipts & Digital Signatures ({parentsViewedCount} of 28 Acknowledged)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {parentReceipts.map((r) => (
                <div
                  key={r.studentId}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-white truncate">
                      {r.studentName}
                    </span>
                    {r.hasViewed ? (
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block truncate">{r.parentName}</span>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className={r.hasViewed ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                      {r.hasViewed ? 'Read by parent' : 'Not opened yet'}
                    </span>
                    {r.signedAck && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[#0050CB] font-bold">
                        Signed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD CLASS WORK DRAWER                                            */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0050CB]" />
                <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                  Add Daily Class Work / Diary Entry
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewClassWork} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                  >
                    <option value="English & Phonics">English & Phonics</option>
                    <option value="Early Mathematics">Early Mathematics</option>
                    <option value="Art & Fine Motor Skills">Art & Fine Motor Skills</option>
                    <option value="Rhymes & Storytelling">Rhymes & Storytelling</option>
                    <option value="Environmental Studies (EVS)">Environmental Studies (EVS)</option>
                    <option value="General Discovery">General Discovery</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Period Time Slot
                  </label>
                  <input
                    type="text"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Topic Covered in Class <span className="text-[#FF690C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Letter D tracing and matching duck flashcards"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Workbook & Page Numbers
                </label>
                <input
                  type="text"
                  placeholder="e.g., Phonics Activity Book Vol 1, Pages 17–19"
                  value={newWorkbookRef}
                  onChange={(e) => setNewWorkbookRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Teacher Classroom Notes / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Children completed tracing on page 17. Most children recognized duck and drum."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Optional Whiteboard / Worksheet Photo URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newBoardPhoto}
                  onChange={(e) => setNewBoardPhoto(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl font-bold cursor-pointer transition-all shadow-md shadow-blue-500/20"
                >
                  Save Class Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: STUDENT ROSTER COMPLETION DRAWER                                 */}
      {/* ========================================================================= */}
      {isRosterModalOpen && selectedPeriodForRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                  {selectedPeriodForRoster.subject}: Student Completion Roster
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedPeriodForRoster.workbookReference}
                </p>
              </div>
              <button
                onClick={() => setIsRosterModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {studentRoster.map((st) => {
                const isIncomplete = selectedPeriodForRoster.incompleteStudentIds.includes(st.id);
                return (
                  <div
                    key={st.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={st.photo}
                        alt={st.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-bold text-slate-800 dark:text-white">
                        #{st.rollNo} {st.name}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleStudentCompletion(selectedPeriodForRoster.id, st.id)}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        isIncomplete
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      {isIncomplete ? '⏳ Incomplete' : '✅ Finished in Class'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleSendIncompleteToHomework(selectedPeriodForRoster)}
                className="px-3.5 py-2 bg-[#FF690C] hover:bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                Send Incomplete to Homework →
              </button>

              <button
                onClick={() => setIsRosterModalOpen(false)}
                className="px-4 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BROADCAST DIARY CONFIRMATION                                     */}
      {/* ========================================================================= */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#0050CB]" />
                <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                  Broadcast Daily Diary to Parents
                </h3>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              This will publish today's {periods.length} classwork periods and your general teacher note directly to the Parent Mobile Portal for all 28 enrolled families.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-400 block uppercase text-[10px]">Guardian Message:</span>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                "{dailyGeneralNote}"
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBroadcastDiary}
                className="px-5 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl font-bold cursor-pointer text-xs shadow-md shadow-blue-500/20"
              >
                Broadcast Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PRINTABLE DAILY DIARY PREVIEW                                    */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0050CB]" />
                <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                  Daily Classroom Diary (Print Preview)
                </h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Paper */}
            <div id="printable-classwork-diary" className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
              <div className="border-b border-slate-200 dark:border-slate-700 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-sm text-slate-900 dark:text-white">
                    GGPS SCHOOL • DAILY CLASSROOM DIARY
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Class LKG - Section A • Teacher: Priya Sharma • Date: {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                  </p>
                </div>
                <span className="px-2 py-1 rounded bg-blue-100 text-[#0050CB] font-bold text-[10px]">
                  ROOM 102
                </span>
              </div>

              <div className="space-y-3">
                {periods.map((p, i) => (
                  <div key={i} className="border-b border-slate-200 dark:border-slate-700/60 pb-2">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-white">
                      <span>{p.subject} ({p.timeSlot})</span>
                      <span className="text-[#0050CB]">{p.workbookReference}</span>
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{p.topic}</p>
                    <p className="text-slate-500 mt-0.5">{p.teacherNotes}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 block uppercase text-[9px]">General Remark:</span>
                <p className="font-semibold text-slate-800 dark:text-white text-xs mt-0.5">{dailyGeneralNote}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  printDocument('printable-classwork-diary', 'GGPS School - Daily Classroom Diary');
                  setIsPrintModalOpen(false);
                }}
                className="px-5 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl font-bold cursor-pointer text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Send to Printer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
