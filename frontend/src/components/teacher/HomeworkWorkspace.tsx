"use client";

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
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
  Send,
  Bell,
  Printer,
  ChevronRight,
  Eye,
  Check,
  X,
  FileText,
  UploadCloud,
  MessageSquare,
  Users,
  Star,
  CheckCheck,
  RefreshCw,
  SlidersHorizontal,
  BookmarkCheck,
  Paperclip,
  Share2,
  ZoomIn,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { printDocument } from '@/lib/exportUtils';
import AppImage from '@/components/ui/AppImage';

export type HomeworkStatus = 'ACTIVE' | 'DUE_SOON' | 'COMPLETED' | 'OVERDUE';
export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'REVIEWED' | 'REVISION_REQUESTED';

export interface HomeworkAssignment {
  id: string;
  title: string;
  subject: string;
  instructions: string;
  assignedDate: string;
  dueDate: string;
  status: HomeworkStatus;
  targetType: 'ALL' | 'SELECTED';
  targetStudentIds?: string[];
  workbookRef: string;
  recommendedDuration: string; // e.g. "10-15 mins"
  attachmentPdfName?: string;
  submissionType: 'PHOTO_APP' | 'PHYSICAL_NOTEBOOK' | 'VOICE_RECORDING';
  totalAssigned: number;
  submittedCount: number;
  reviewedCount: number;
}

export interface StudentSubmission {
  studentId: string;
  studentName: string;
  rollNo: string;
  photoUrl: string;
  status: SubmissionStatus;
  submittedAt?: string;
  submissionType: 'APP_PHOTO' | 'PHYSICAL_NOTEBOOK';
  photoAttachmentUrl?: string;
  parentNote?: string;
  teacherRemark?: string;
  awardedSticker?: string;
  reviewedAt?: string;
}

export interface HomeworkWorkspaceProps {
  students?: Array<{
    id: string;
    name: string;
    rollNo: string;
    photo: string;
  }>;
  onNavigateTab?: (tab: string) => void;
}

const getHomeworkDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Initial realistic assignments connected to Kindergarten curriculum & Parent Portal
const initialAssignments: HomeworkAssignment[] = [
  {
    id: 'hw-1',
    title: 'Tracing Letters A to E in Red Activity Workbook',
    subject: 'English & Phonics',
    instructions: 'Trace uppercase and lowercase letters on pages 14-16. Color the pictures starting with /æ/ (Apple) and /b/ (Ball). Guide child to hold crayon with three-finger pincer grip.',
    assignedDate: getHomeworkDate(-2),
    dueDate: getHomeworkDate(2),
    status: 'ACTIVE',
    targetType: 'ALL',
    workbookRef: 'Little Learners Phonics Book Vol 1, Pages 14–16',
    recommendedDuration: '10–15 mins',
    attachmentPdfName: 'Phonics_Tracing_Guide_ABCDE.pdf',
    submissionType: 'PHOTO_APP',
    totalAssigned: 28,
    submittedCount: 24,
    reviewedCount: 18
  },
  {
    id: 'hw-2',
    title: 'Find & Count 5 Round Household Objects (Photo Quest)',
    subject: 'Early Mathematics',
    instructions: 'Explore living room or kitchen with parent. Locate 5 round/circular objects (e.g. clock, coaster, bowl). Take a cute picture or draw them in the math scrapbook.',
    assignedDate: getHomeworkDate(-3),
    dueDate: getHomeworkDate(1),
    status: 'DUE_SOON',
    targetType: 'ALL',
    workbookRef: 'Kinder Math Discovery Book, Activity 5',
    recommendedDuration: '15 mins',
    attachmentPdfName: 'Circle_Quest_Sheet.pdf',
    submissionType: 'PHOTO_APP',
    totalAssigned: 28,
    submittedCount: 22,
    reviewedCount: 20
  },
  {
    id: 'hw-3',
    title: 'Color the Butterfly Using Primary Colors Only',
    subject: 'Art & Creativity',
    instructions: 'Color symmetrically within the butterfly wings using only Red, Yellow, and Blue wax crayons. Practice color recognition and border control.',
    assignedDate: getHomeworkDate(-6),
    dueDate: getHomeworkDate(-2),
    status: 'COMPLETED',
    targetType: 'ALL',
    workbookRef: 'Classroom Art Scrapbook, Sheet #4',
    recommendedDuration: '20 mins',
    attachmentPdfName: 'Butterfly_Primary_Template.pdf',
    submissionType: 'PHYSICAL_NOTEBOOK',
    totalAssigned: 28,
    submittedCount: 28,
    reviewedCount: 28
  },
  {
    id: 'hw-4',
    title: 'Pencil Grip & Fine-Motor Line Tracing (Targeted Practice)',
    subject: 'Motor Skills & Writing',
    instructions: 'Special 10-minute diagonal and wavy stroke tracing for finger coordination. Please guide child without holding their wrist.',
    assignedDate: getHomeworkDate(-1),
    dueDate: getHomeworkDate(3),
    status: 'ACTIVE',
    targetType: 'SELECTED',
    targetStudentIds: ['s-02', 's-04', 's-07', 's-11'],
    workbookRef: 'Fine Motor Primer, Worksheets 3 & 4',
    recommendedDuration: '10 mins',
    attachmentPdfName: 'Diagonal_Tracing_Practice.pdf',
    submissionType: 'PHOTO_APP',
    totalAssigned: 4,
    submittedCount: 3,
    reviewedCount: 1
  }
];

// Initial mock submissions mapped to student roster
const initialSubmissionsMap: Record<string, StudentSubmission[]> = {
  'hw-1': [
    {
      studentId: 's-01',
      studentName: 'Aarav Sharma',
      rollNo: '01',
      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
      status: 'REVIEWED',
      submittedAt: 'Today, 08:30 AM',
      submissionType: 'APP_PHOTO',
      photoAttachmentUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&auto=format&fit=crop&q=80',
      parentNote: 'Aarav completed the whole page independently! He loved coloring the apple.',
      teacherRemark: 'Outstanding pencil control! Neat letter shapes.',
      awardedSticker: '⭐⭐⭐ Star Work',
      reviewedAt: 'Today, 09:15 AM'
    },
    {
      studentId: 's-02',
      studentName: 'Ananya Patel',
      rollNo: '02',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      status: 'SUBMITTED',
      submittedAt: 'Yesterday, 07:45 PM',
      submissionType: 'APP_PHOTO',
      photoAttachmentUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=700&auto=format&fit=crop&q=80',
      parentNote: 'She struggled a bit with lowercase b and d. Attached photo for review.'
    },
    {
      studentId: 's-03',
      studentName: 'Vivaan Gupta',
      rollNo: '03',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      status: 'SUBMITTED',
      submittedAt: 'Yesterday, 06:20 PM',
      submissionType: 'APP_PHOTO',
      photoAttachmentUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=700&auto=format&fit=crop&q=80',
      parentNote: 'Completed all 3 pages with wax crayons.'
    },
    {
      studentId: 's-04',
      studentName: 'Diya Verma',
      rollNo: '04',
      photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      status: 'REVISION_REQUESTED',
      submittedAt: getHomeworkDate(-1),
      submissionType: 'APP_PHOTO',
      photoAttachmentUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&auto=format&fit=crop&q=80',
      parentNote: 'Done hurriedly before bedtime.',
      teacherRemark: 'Kindly guide Diya to trace along the dotted lines on Page 15.',
      awardedSticker: '✏️ Please Redo Page 15',
      reviewedAt: 'Yesterday, 02:00 PM'
    },
    {
      studentId: 's-05',
      studentName: 'Reyansh Reddy',
      rollNo: '05',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'PENDING',
      submissionType: 'PHYSICAL_NOTEBOOK'
    },
    {
      studentId: 's-06',
      studentName: 'Isha Nair',
      rollNo: '06',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'PENDING',
      submissionType: 'APP_PHOTO'
    },
    {
      studentId: 's-07',
      studentName: 'Kabir Joshi',
      rollNo: '07',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: 'PENDING',
      submissionType: 'PHYSICAL_NOTEBOOK'
    },
    {
      studentId: 's-08',
      studentName: 'Myra Singh',
      rollNo: '08',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'PENDING',
      submissionType: 'APP_PHOTO'
    }
  ]
};

// Queue of tasks carried over from Incomplete Class Work
const initialClassWorkQueue = [
  {
    id: 'cw-carry-1',
    subject: 'Early Mathematics',
    title: 'Incomplete Bead Threading & Number 5 Matching',
    dateOrigin: getHomeworkDate(-2),
    studentsCount: 3,
    studentNames: ['Ananya Patel', 'Reyansh Reddy', 'Kabir Joshi'],
    reason: 'Ran out of time during Period 2 hands-on counting activity.'
  },
  {
    id: 'cw-carry-2',
    subject: 'English & Phonics',
    title: 'Letter C Worksheet Coloring & Tracing',
    dateOrigin: getHomeworkDate(-2),
    studentsCount: 2,
    studentNames: ['Diya Verma', 'Myra Singh'],
    reason: 'Absent during morning session; needs home completion.'
  }
];

export default function HomeworkWorkspace({ students = [], onNavigateTab }: HomeworkWorkspaceProps) {
  // Navigation & Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<'ASSIGNMENTS' | 'SUBMISSIONS_REVIEW' | 'CLASSWORK_QUEUE'>('ASSIGNMENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'NEEDS_REVIEW' | 'COMPLETED'>('ALL');

  // Homework data state
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>(initialAssignments);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, StudentSubmission[]>>(initialSubmissionsMap);
  const [classworkQueue, setClassworkQueue] = useState(initialClassWorkQueue);

  // Review Drawer / Active Review Assignment
  const [selectedHwIdForReview, setSelectedHwIdForReview] = useState<string>('hw-1');
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState<StudentSubmission | null>(
    initialSubmissionsMap['hw-1']?.[1] || null
  );

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRemindModalOpen, setIsRemindModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState('');

  // Form State for Assign Homework Modal
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwSubject, setNewHwSubject] = useState('English & Phonics');
  const [newHwInstructions, setNewHwInstructions] = useState('');
  const [newHwDueDate, setNewHwDueDate] = useState('2026-09-24');
  const [newHwWorkbookRef, setNewHwWorkbookRef] = useState('');
  const [newHwTargetType, setNewHwTargetType] = useState<'ALL' | 'SELECTED'>('ALL');
  const [newHwDuration, setNewHwDuration] = useState('10–15 mins');
  const [selectedTargetStudentIds, setSelectedTargetStudentIds] = useState<string[]>([]);

  // Grading Form State
  const [tempTeacherRemark, setTempTeacherRemark] = useState('');
  const [tempSticker, setTempSticker] = useState('⭐⭐⭐ Star Work');

  const selectedAssignment = useMemo(() => {
    return assignments.find((a) => a.id === selectedHwIdForReview) || assignments[0];
  }, [assignments, selectedHwIdForReview]);

  const activeSubmissionsList = useMemo(() => {
    return submissionsMap[selectedHwIdForReview] || [];
  }, [submissionsMap, selectedHwIdForReview]);

  // Overall KPI Calculations
  const kpiStats = useMemo(() => {
    const activeTasks = assignments.filter((a) => a.status === 'ACTIVE' || a.status === 'DUE_SOON').length;
    const totalAssignedAll = assignments.reduce((acc, a) => acc + a.totalAssigned, 0);
    const totalSubmittedAll = assignments.reduce((acc, a) => acc + a.submittedCount, 0);
    const rate = totalAssignedAll > 0 ? Math.round((totalSubmittedAll / totalAssignedAll) * 100) : 0;
    
    // Count pending review across all assignments
    let pendingReviews = 0;
    Object.values(submissionsMap).forEach((list) => {
      pendingReviews += list.filter((s) => s.status === 'SUBMITTED').length;
    });

    const dueTodayCount = assignments.filter((a) => a.dueDate.includes('21 Sep') || a.dueDate.includes('22 Sep')).length;

    return {
      activeTasks,
      submissionRate: rate,
      totalSubmitted: totalSubmittedAll,
      pendingReviews,
      dueTodayCount
    };
  }, [assignments, submissionsMap]);

  // Filtered Assignments List
  const filteredAssignments = useMemo(() => {
    return assignments.filter((hw) => {
      const matchesSearch =
        hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.instructions.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = selectedSubject === 'ALL' || hw.subject === selectedSubject;

      let matchesStatus = true;
      if (statusFilter === 'ACTIVE') matchesStatus = hw.status === 'ACTIVE' || hw.status === 'DUE_SOON';
      else if (statusFilter === 'NEEDS_REVIEW') matchesStatus = (hw.submittedCount - hw.reviewedCount) > 0;
      else if (statusFilter === 'COMPLETED') matchesStatus = hw.status === 'COMPLETED';

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [assignments, searchQuery, selectedSubject, statusFilter]);

  // Subjects for Filter
  const subjectsList = ['ALL', 'English & Phonics', 'Early Mathematics', 'Art & Creativity', 'Motor Skills & Writing'];

  // Handler: Save New Assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle.trim()) {
      toast.error('Please enter assignment title');
      return;
    }

    const newHw: HomeworkAssignment = {
      id: `hw-${Date.now()}`,
      title: newHwTitle.trim(),
      subject: newHwSubject,
      instructions: newHwInstructions.trim() || 'Complete assigned workbook practice with parent guidance.',
      assignedDate: 'Today, 22 Sep',
      dueDate: newHwDueDate,
      status: 'ACTIVE',
      targetType: newHwTargetType,
      targetStudentIds: newHwTargetType === 'SELECTED' ? selectedTargetStudentIds : undefined,
      workbookRef: newHwWorkbookRef.trim() || 'Daily Practice Workbook',
      recommendedDuration: newHwDuration,
      submissionType: 'PHOTO_APP',
      totalAssigned: newHwTargetType === 'SELECTED' ? (selectedTargetStudentIds.length || 4) : 28,
      submittedCount: 0,
      reviewedCount: 0
    };

    setAssignments((prev) => [newHw, ...prev]);

    // Populate initial empty submissions
    const initialSubs: StudentSubmission[] = (students.length > 0 ? students : [
      { id: 's-01', name: 'Aarav Sharma', rollNo: '01', photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80' },
      { id: 's-02', name: 'Ananya Patel', rollNo: '02', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
      { id: 's-03', name: 'Vivaan Gupta', rollNo: '03', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' }
    ]).map((s) => ({
      studentId: s.id,
      studentName: s.name,
      rollNo: s.rollNo,
      photoUrl: s.photo,
      status: 'PENDING',
      submissionType: 'APP_PHOTO'
    }));

    setSubmissionsMap((prev) => ({
      ...prev,
      [newHw.id]: initialSubs
    }));

    setIsAssignModalOpen(false);
    setNewHwTitle('');
    setNewHwInstructions('');
    setNewHwWorkbookRef('');
    toast.success('🎉 New homework assigned and broadcast to parent portal!');
  };

  // Handler: Convert Classwork Queue Item into Homework
  const handleConvertClassworkToHomework = (queueItem: typeof initialClassWorkQueue[0]) => {
    const newHw: HomeworkAssignment = {
      id: `hw-cw-${queueItem.id}-${assignments.length + 1}`,
      title: queueItem.title,
      subject: queueItem.subject,
      instructions: `Complete remaining practice started in class. ${queueItem.reason}`,
      assignedDate: 'Today, 22 Sep',
      dueDate: 'Tomorrow, 23 Sep',
      status: 'ACTIVE',
      targetType: 'SELECTED',
      workbookRef: 'Workbook Practice Sheet',
      recommendedDuration: '10 mins',
      submissionType: 'PHOTO_APP',
      totalAssigned: queueItem.studentsCount,
      submittedCount: 0,
      reviewedCount: 0
    };

    setAssignments((prev) => [newHw, ...prev]);
    setClassworkQueue((prev) => prev.filter((item) => item.id !== queueItem.id));
    toast.success(`✨ Incomplete classwork converted to homework for ${queueItem.studentsCount} students!`);
    setActiveSubTab('ASSIGNMENTS');
  };

  // Handler: Save Evaluation / Sticker for Student
  const handleSaveEvaluation = (action: 'APPROVE' | 'REQUEST_REVISION') => {
    if (!selectedStudentForGrading) return;

    const newStatus: SubmissionStatus = action === 'APPROVE' ? 'REVIEWED' : 'REVISION_REQUESTED';
    const remark = tempTeacherRemark.trim() || (action === 'APPROVE' ? 'Well done! Clean work.' : 'Please redo page with neat tracing.');

    setSubmissionsMap((prev) => {
      const list = prev[selectedHwIdForReview] || [];
      const updated = list.map((item) => {
        if (item.studentId === selectedStudentForGrading.studentId) {
          return {
            ...item,
            status: newStatus,
            teacherRemark: remark,
            awardedSticker: tempSticker,
            reviewedAt: 'Just now'
          };
        }
        return item;
      });
      return { ...prev, [selectedHwIdForReview]: updated };
    });

    // Update parent assignment reviewed count
    setAssignments((prev) =>
      prev.map((hw) => {
        if (hw.id === selectedHwIdForReview) {
          const wasReviewed = selectedStudentForGrading.status === 'REVIEWED';
          return {
            ...hw,
            reviewedCount: wasReviewed ? hw.reviewedCount : hw.reviewedCount + 1
          };
        }
        return hw;
      })
    );

    setSelectedStudentForGrading((prev) =>
      prev
        ? {
            ...prev,
            status: newStatus,
            teacherRemark: remark,
            awardedSticker: tempSticker,
            reviewedAt: 'Just now'
          }
        : null
    );

    toast.success(
      action === 'APPROVE'
        ? `🌟 Verified & sticker awarded to ${selectedStudentForGrading.studentName}!`
        : `⚠️ Revision requested from ${selectedStudentForGrading.studentName}'s parents.`
    );
  };

  // Handler: Broadcast reminder to parents
  const handleBroadcastReminder = () => {
    setIsRemindModalOpen(false);
    toast.success('📢 Reminder dispatched via App Notification & SMS to all parents with pending homework!');
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & WORKSPACE BANNER */}
      <div className="bg-gradient-to-r from-[#000E28] via-[#0050CB] to-[#002B7A] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#FF690C]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#E5EEFF] text-xs font-semibold mb-3 border border-white/15">
              <BookOpen className="w-3.5 h-3.5 text-[#FF690C]" />
              <span>Kindergarten & Primary Home Practice Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Home Practice & Homework
            </h1>
            <p className="text-sm text-blue-100/80 mt-1 max-w-xl">
              Assign gentle home reinforcement, inspect parent worksheet photo uploads, award motivational stickers, and keep parents updated in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsRemindModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell className="w-4 h-4 text-[#FF690C]" />
              <span>Nudge Parents</span>
            </button>

            <button
              onClick={() => {
                printDocument('printable-homework-roster', 'GGPS School - Weekly Homework & Task Schedule');
              }}
              className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Print Homework Schedule"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#FF690C] hover:bg-[#e05b07] text-white text-xs font-extrabold shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Homework</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE METRIC CARDS (KPI STRIP) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Assignments */}
        <div className="bg-white dark:bg-[#000E28]/40 dark:border-slate-800 p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Active Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">
            {kpiStats.activeTasks}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Targeted for LKG-A</span>
          </div>
        </div>

        {/* Card 2: Overall Turnout Rate */}
        <div className="bg-white dark:bg-[#000E28]/40 dark:border-slate-800 p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Overall Turnout</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">
            {kpiStats.submissionRate}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {kpiStats.totalSubmitted} total turned in
          </div>
        </div>

        {/* Card 3: Pending Teacher Review */}
        <div className="bg-white dark:bg-[#000E28]/40 dark:border-slate-800 p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>To Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {kpiStats.pendingReviews}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Awaiting stickers & review
          </div>
        </div>

        {/* Card 4: Classwork Queue */}
        <div className="bg-white dark:bg-[#000E28]/40 dark:border-slate-800 p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Classwork Queue</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF690C] flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#FF690C]">
            {classworkQueue.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Carried over from class
          </div>
        </div>
      </div>

      {/* 3. SUB-NAV TABS & WORKSPACE CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('ASSIGNMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'ASSIGNMENTS'
                ? 'bg-[#0050CB] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Assignments Roster</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
              {assignments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('SUBMISSIONS_REVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
              activeSubTab === 'SUBMISSIONS_REVIEW'
                ? 'bg-[#0050CB] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Submissions & Stickers Review</span>
            {kpiStats.pendingReviews > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FF690C] text-white font-extrabold animate-pulse">
                {kpiStats.pendingReviews} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('CLASSWORK_QUEUE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'CLASSWORK_QUEUE'
                ? 'bg-[#0050CB] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>From Classwork</span>
            {classworkQueue.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#FF690C] text-white font-bold">
                {classworkQueue.length}
              </span>
            )}
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, workbook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#000E28]/40 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#0050CB]"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ASSIGNMENTS ROSTER                                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'ASSIGNMENTS' && (
        <div id="printable-homework-roster" className="space-y-4">
          {/* Filters strip: Subjects and Status Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Subject:
              </span>
              {subjectsList.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedSubject === subj
                      ? 'bg-[#0050CB] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {subj === 'ALL' ? 'All Subjects' : subj}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Status:
              </span>
              {(['ALL', 'ACTIVE', 'NEEDS_REVIEW', 'COMPLETED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    statusFilter === st
                      ? 'bg-[#E5EEFF] text-[#0050CB] border border-[#0050CB]/30'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'NEEDS_REVIEW' ? 'Needs Review' : st === 'ACTIVE' ? 'Active' : 'Completed'}
                </button>
              ))}
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((hw) => {
              const percentage = Math.round((hw.submittedCount / (hw.totalAssigned || 1)) * 100);
              const pendingReviewCount = hw.submittedCount - hw.reviewedCount;

              return (
                <div
                  key={hw.id}
                  className="bg-white dark:bg-[#000E28]/40 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:border-[#0050CB]/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 group flex flex-col justify-between"
                >
                  <div>
                    {/* Header Row: Subject, Target Badge, Due Date */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E5EEFF] text-[#0050CB] uppercase tracking-wider">
                          {hw.subject}
                        </span>
                        {hw.targetType === 'SELECTED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            Remedial • {hw.totalAssigned} Students
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" /> {hw.recommendedDuration}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                          hw.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : hw.status === 'DUE_SOON'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}
                      >
                        Due {hw.dueDate}
                      </span>
                    </div>

                    {/* Title & Instructions */}
                    <h3 className="font-bold text-base text-slate-800 dark:text-white group-hover:text-[#0050CB] transition-colors line-clamp-1">
                      {hw.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {hw.instructions}
                    </p>

                    {/* Workbook & Attachment Badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                        <BookOpen className="w-3.5 h-3.5 text-[#0050CB]" />
                        <span className="truncate max-w-[200px]">{hw.workbookRef}</span>
                      </div>
                      {hw.attachmentPdfName && (
                        <div className="flex items-center gap-1 text-[#0050CB] font-semibold">
                          <Paperclip className="w-3 h-3" />
                          <span>Worksheet Attached</span>
                        </div>
                      )}
                    </div>

                    {/* Submissions Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-700 dark:text-slate-300">
                            Submissions: {hw.submittedCount} / {hw.totalAssigned}
                          </span>
                          {pendingReviewCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FF690C] text-white">
                              {pendingReviewCount} need review
                            </span>
                          )}
                        </div>
                        <span className="text-[#0050CB] font-extrabold">{percentage}%</span>
                      </div>

                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${
                            percentage === 100
                              ? 'bg-emerald-500'
                              : percentage > 60
                              ? 'bg-[#0050CB]'
                              : 'bg-[#FF690C]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar: Review Submissions button & Assigned Date */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Assigned: {hw.assignedDate}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedHwIdForReview(hw.id);
                        const firstSub = submissionsMap[hw.id]?.[0] || null;
                        setSelectedStudentForGrading(firstSub);
                        setActiveSubTab('SUBMISSIONS_REVIEW');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#E5EEFF] hover:bg-blue-200 text-[#0050CB] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer group-hover:bg-[#0050CB] group-hover:text-white"
                    >
                      <span>Inspect Submissions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAssignments.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#000E28]/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                No homework assignments match your search or filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('ALL');
                  setStatusFilter('ALL');
                }}
                className="mt-3 text-xs font-bold text-[#0050CB] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SUBMISSIONS & STICKERS REVIEW (TWO-PANE SPLIT DOCK)                */}
      {/* ========================================================================= */}
      {activeSubTab === 'SUBMISSIONS_REVIEW' && (
        <div className="space-y-4">
          {/* Assignment Switcher Header */}
          <div className="bg-white dark:bg-[#000E28]/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center font-black">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Currently Evaluating
                </span>
                <select
                  value={selectedHwIdForReview}
                  onChange={(e) => {
                    setSelectedHwIdForReview(e.target.value);
                    const first = submissionsMap[e.target.value]?.[0] || null;
                    setSelectedStudentForGrading(first);
                  }}
                  className="font-black text-sm sm:text-base text-slate-800 dark:text-white bg-transparent border-0 focus:ring-0 cursor-pointer p-0 pr-6"
                >
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id} className="dark:bg-[#000E28] text-slate-800 dark:text-white">
                      {a.title} ({a.subject})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{selectedAssignment?.reviewedCount || 0} Evaluated</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-xl font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>
                  {Math.max(
                    0,
                    (selectedAssignment?.submittedCount || 0) - (selectedAssignment?.reviewedCount || 0)
                  )}{' '}
                  Pending Review
                </span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Split: Left Roster & Right Verification Deck */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column (5 cols): Student Submissions List */}
            <div className="lg:col-span-5 bg-white dark:bg-[#000E28]/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                <span>Class Roster ({activeSubmissionsList.length} Students)</span>
                <span className="text-[11px] text-slate-400">Click to inspect</span>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {activeSubmissionsList.map((sub) => {
                  const isSelected = selectedStudentForGrading?.studentId === sub.studentId;

                  return (
                    <div
                      key={sub.studentId}
                      onClick={() => {
                        setSelectedStudentForGrading(sub);
                        setTempTeacherRemark(sub.teacherRemark || '');
                        setTempSticker(sub.awardedSticker || '⭐⭐⭐ Star Work');
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#0050CB] bg-[#E5EEFF]/60 dark:bg-blue-950/40 shadow-xs'
                          : 'border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <AppImage
                            src={sub.photoUrl}
                            alt={sub.studentName}
                            fallbackType="avatar"
                            name={sub.studentName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <span className="absolute -bottom-1 -right-1 text-[9px] font-black bg-slate-800 text-white w-4 h-4 rounded-full flex items-center justify-center">
                            {sub.rollNo}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                            {sub.studentName}
                          </h4>
                          <span className="text-[10px] text-slate-400 block">
                            {sub.submittedAt || 'Not yet submitted'}
                          </span>
                        </div>
                      </div>

                      {/* Status pill on right */}
                      <div>
                        {sub.status === 'REVIEWED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Checked
                          </span>
                        )}
                        {sub.status === 'SUBMITTED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0050CB] dark:bg-blue-950 dark:text-blue-300 animate-pulse flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> New Photo
                          </span>
                        )}
                        {sub.status === 'REVISION_REQUESTED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            Redo
                          </span>
                        )}
                        {sub.status === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column (7 cols): Photo Verification & Sticker Awarding Deck */}
            <div className="lg:col-span-7 bg-white dark:bg-[#000E28]/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-5">
              {selectedStudentForGrading ? (
                <>
                  {/* Student Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <AppImage
                        src={selectedStudentForGrading.photoUrl}
                        alt={selectedStudentForGrading.studentName}
                        fallbackType="avatar"
                        name={selectedStudentForGrading.studentName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#0050CB]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                            {selectedStudentForGrading.studentName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600">
                            Roll #{selectedStudentForGrading.rollNo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Mode: {selectedStudentForGrading.submissionType === 'APP_PHOTO' ? 'Parent App Upload (Photo)' : 'Physical Notebook in Class'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Submitted Time</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {selectedStudentForGrading.submittedAt || 'Pending Delivery'}
                      </span>
                    </div>
                  </div>

                  {/* Submission Work Preview: Photo or Notebook Notice */}
                  {selectedStudentForGrading.photoAttachmentUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                        <span>Submitted Workbook Image</span>
                        <button
                          onClick={() => {
                            setLightboxImageUrl(selectedStudentForGrading.photoAttachmentUrl!);
                            setIsLightboxOpen(true);
                          }}
                          className="text-[#0050CB] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <ZoomIn className="w-3.5 h-3.5" /> Full Zoom
                        </button>
                      </div>

                      <div
                        onClick={() => {
                          setLightboxImageUrl(selectedStudentForGrading.photoAttachmentUrl!);
                          setIsLightboxOpen(true);
                        }}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group cursor-pointer aspect-video bg-slate-900"
                      >
                        <AppImage
                          src={selectedStudentForGrading.photoAttachmentUrl}
                          alt="Student Workbook Submission"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                          <Eye className="w-4 h-4" /> Click to view high-res photo
                        </div>
                      </div>

                      {selectedStudentForGrading.parentNote && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-[#0050CB] block mb-0.5">Parent's Note:</span>
                          "{selectedStudentForGrading.parentNote}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {selectedStudentForGrading.status === 'PENDING'
                          ? 'No submission uploaded yet by parent'
                          : 'Physical notebook checked in classroom'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        You can still award a star sticker and mark it as checked once the child presents their physical book in class.
                      </p>
                    </div>
                  )}

                  {/* Encouragement Sticker Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#FF690C]" />
                      <span>Select Digital Sticker / Praise Badge:</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        '⭐⭐⭐ Star Work',
                        '✏️ Neat Handwriting',
                        '🎯 Great Effort',
                        '💡 Creative Thinker',
                        '🌟 Spotless Tracing',
                        '🎨 Colorful Magic',
                        '👍 Good Try',
                        '🔄 Redo Page'
                      ].map((sticker) => (
                        <button
                          key={sticker}
                          type="button"
                          onClick={() => setTempSticker(sticker)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                            tempSticker === sticker
                              ? 'bg-[#E5EEFF] text-[#0050CB] border-[#0050CB] shadow-xs'
                              : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {sticker}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Teacher Feedback Remark */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Teacher's Note to Parent:</span>
                      <span className="text-[10px] text-slate-400 font-normal">Visible on Parent App</span>
                    </label>
                    <textarea
                      rows={2}
                      value={tempTeacherRemark}
                      onChange={(e) => setTempTeacherRemark(e.target.value)}
                      placeholder="e.g. Excellent grip and neat curved letters! Keep it up."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#000E28]/40 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#0050CB]"
                    />
                  </div>

                  {/* Action Buttons: Mark as Approved vs Request Revision */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleSaveEvaluation('REQUEST_REVISION')}
                      className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all cursor-pointer"
                    >
                      Request Correction / Redo
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveEvaluation('APPROVE')}
                      className="px-6 py-2 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Award Sticker</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-slate-400">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-bold text-slate-600">Please select a student from the roster</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FROM CLASSWORK QUEUE                                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'CLASSWORK_QUEUE' && (
        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 p-4 rounded-2xl flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-[#FF690C] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-black text-orange-900 dark:text-orange-200 uppercase tracking-wide">
                Class Work Carryover Queue
              </h3>
              <p className="text-xs text-orange-800/80 dark:text-orange-300/80 mt-1 leading-relaxed">
                When students do not complete their period worksheets during classroom time in{' '}
                <strong>Class Work Workspace</strong>, teachers can forward them here with 1-click. You can review and dispatch them as targeted home practice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classworkQueue.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#000E28]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E5EEFF] text-[#0050CB]">
                      {item.subject}
                    </span>
                    <span className="text-slate-400 text-[11px]">Origin: {item.dateOrigin}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.reason}</p>

                  <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Affected Students ({item.studentsCount})
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {item.studentNames.map((name) => (
                        <span
                          key={name}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setClassworkQueue((prev) => prev.filter((q) => q.id !== item.id));
                      toast.success('Task dismissed from queue');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Dismiss
                  </button>

                  <button
                    onClick={() => handleConvertClassworkToHomework(item)}
                    className="px-4 py-1.5 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Convert to Homework</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {classworkQueue.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-[#000E28]/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                All classwork is completed! No tasks in queue.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Any incomplete periods sent from the Class Work tab will appear here automatically.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ASSIGN HOMEWORK DIALOG                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAssignModalOpen && (
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
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-800 dark:text-white">
                      Assign New Home Practice
                    </h3>
                    <p className="text-[11px] text-slate-400">Class: LKG - Section A (28 Students)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs">
                {/* Target Audience Switcher: All Class vs Targeted Remedial */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Target Students:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewHwTargetType('ALL')}
                      className={`p-2.5 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                        newHwTargetType === 'ALL'
                          ? 'bg-[#E5EEFF] text-[#0050CB] border-[#0050CB]'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Entire Class (28 Kids)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewHwTargetType('SELECTED')}
                      className={`p-2.5 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                        newHwTargetType === 'SELECTED'
                          ? 'bg-[#E5EEFF] text-[#0050CB] border-[#0050CB]'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Targeted / Remedial Group
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tracing Numbers 1 to 10 with Color Crayons"
                    value={newHwTitle}
                    onChange={(e) => setNewHwTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Subject & Recommended Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Subject
                    </label>
                    <select
                      value={newHwSubject}
                      onChange={(e) => setNewHwSubject(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    >
                      <option value="English & Phonics">English & Phonics</option>
                      <option value="Early Mathematics">Early Mathematics</option>
                      <option value="General Awareness">General Awareness</option>
                      <option value="Art & Creativity">Art & Creativity</option>
                      <option value="Motor Skills & Writing">Motor Skills & Writing</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Recommended Duration
                    </label>
                    <select
                      value={newHwDuration}
                      onChange={(e) => setNewHwDuration(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    >
                      <option value="10–15 mins">10–15 mins (Gentle)</option>
                      <option value="15–20 mins">15–20 mins (Standard)</option>
                      <option value="25–30 mins">25–30 mins (Project/Art)</option>
                    </select>
                  </div>
                </div>

                {/* Workbook Reference */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Workbook & Page Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Little Learners Phonics Workbook, Pages 18–19"
                    value={newHwWorkbookRef}
                    onChange={(e) => setNewHwWorkbookRef(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Instructions for Parents & Child
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide clear, encouraging guidance on how parents can support the child without doing it for them..."
                    value={newHwInstructions}
                    onChange={(e) => setNewHwInstructions(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newHwDueDate}
                    onChange={(e) => setNewHwDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0050CB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    Publish to Parent App
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: PARENT REMINDER BROADCAST                                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isRemindModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#FF690C]" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                    Send Homework Reminder to Parents
                  </h3>
                </div>
                <button
                  onClick={() => setIsRemindModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                This will dispatch an instant push notification and automated WhatsApp/SMS reminder to parents whose children have not yet submitted assignments due within 48 hours.
              </p>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <span className="font-bold text-[#0050CB] block">Message Preview:</span>
                <p className="italic">
                  "Dear Parent, gentle reminder from GGPS Teacher: Tracing Letters A-E home practice is due tomorrow. Please upload worksheet photo via portal or send workbook with child. Thank you!"
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Recipients: 6 Pending Families</span>
                  <span className="text-emerald-600 font-bold">LKG-A</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsRemindModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBroadcastReminder}
                  className="px-5 py-2 bg-[#FF690C] hover:bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-orange-500/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* LIGHTBOX: FULL IMAGE ZOOM                                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20"
            >
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <AppImage
                src={lightboxImageUrl}
                alt="Enlarged Submission Preview"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
