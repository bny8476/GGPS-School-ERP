"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  Home,
  Users,
  CalendarCheck,
  FileText,
  Calendar,
  Smile,
  CheckSquare,
  TrendingUp,
  BookMarked,
  FileSpreadsheet,
  Briefcase,
  Clock,
  Bell,
  Settings,
  Search,
  MessageSquare,
  Moon,
  Sun,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  LogOut,
  Plus,
  ArrowRight,
  SlidersHorizontal,
  Phone,
  User,
  CheckCircle2,
  Calendar as CalendarIcon,
  X,
  UserCheck,
  Target,
  Zap,
  ShoppingBag,
  Activity,
  MoreHorizontal,
  Menu,
  BookOpen,
  Award,
  Sparkles,
  Check,
  PanelLeftClose,
  PanelLeft,
  HelpCircle,
  Layers,
  GraduationCap,
  ClipboardList,
  BarChart3,
  Send,
  MoreVertical,
  XCircle,
  Mail,
  Lock,
  Unlock,
  LayoutGrid,
  List,
  Eye,
  EyeOff,
  ShieldCheck,
  Key,
  RefreshCw,
  AlertCircle,
  CheckCheck,
  Trash2,
  Filter,
  Paperclip,
  Download,
  FileCheck,
  CalendarRange,
  MapPin,
  ArrowLeftRight,
  Building2,
  ExternalLink,
  MessageCircle,
  Printer,
  AlertTriangle,
  HeartPulse,
  ShieldAlert,
  Pencil,
  Maximize2,
  Minimize2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
  NAME_REGEX,
  EMAIL_REGEX,
  TEN_DIGIT_PHONE_REGEX,
  preventNonAlphaKey,
  preventNonNumericKey,
  sanitizeNameInput,
  sanitizePhoneInput,
  handleNamePaste,
  handlePhonePaste,
} from '@/lib/validationUtils';
import { useTheme } from '@/context/ThemeContext';
import NotificationDrawer from '@/components/ui/NotificationDrawer';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import AppImage from '@/components/ui/AppImage';
import { toSchoolISODate } from '@/lib/date/timezone';
import SpotlightCard from './SpotlightCard';
import TeacherCommandPalette from './TeacherCommandPalette';
import ChildProfileDrawer from './ChildProfileDrawer';
import ChildGrowthWorkspace from './ChildGrowthWorkspace';
import ActivitiesWorkspace from './ActivitiesWorkspace';
import LessonPlanWorkspace from './LessonPlanWorkspace';
import ClassWorkWorkspace from './ClassWorkWorkspace';
import AssessmentWorkspace from './AssessmentWorkspace';
import HomeworkWorkspace from './HomeworkWorkspace';
import ExamsMarksWorkspace from './ExamsMarksWorkspace';
import TeacherHomeWorkspace from './TeacherHomeWorkspace';
import EnrollChildModal from './EnrollChildModal';
import RollCallRosterModal from './RollCallRosterModal';
import { getApiBaseUrl } from '@/lib/utils';
import { authFetch } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { getSocket, joinRoom, leaveRoom } from '@/lib/socket';
import { printDocument } from '@/lib/exportUtils';
import {
  PremiumCard,
  CardHeader,
  CardTitle,
  CardDescription,
  StatCard,
  ActionCard,
  StudentCard,
  ScheduleCard,
  ProgressCard,
  ProgressRingCard,
  ActivityCard,
  HomeworkCard,
  NotificationCard,
  ParentMessageCard,
  EmptyStateCard,
} from '@/components/cards';

export type TeacherTab =
  | 'HOME'
  | 'ATTENDANCE'
  | 'CLASSROOM'
  | 'HOMEWORK'
  | 'MARKS & EVALUATION'
  | 'PARENTS'
  | 'LEAVE & PROFILE'
  | 'MY CLASS'
  | 'CLASS WORK'
  | 'LESSON PLAN'
  | 'ACTIVITIES'
  | 'ASSESSMENT'
  | 'CHILD GROWTH'
  | 'EXAMS & MARKS'
  | 'LEAVE'
  | 'NOTIFICATIONS'
  | 'MY ACCOUNT';

export interface StudentCardData {
  id: string;
  rollNo: string;
  admissionNo?: string;
  name: string;
  photo: string;
  status: 'Present' | 'Absent' | 'Late';
  age: string;
  dob?: string;
  gender: 'Male' | 'Female';
  bloodGroup?: string;
  allergies?: string;
  dietaryNote?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  authorizedPickupPerson?: string;
  authorizedPickupRelation?: string;
  parentLabel: string;
  parentName: string;
  phone: string;
  attendanceRate: number;
  absenceReason?: string;
  isExcused?: boolean;
  arrivalNote?: string;
}

const mockStudentsList: StudentCardData[] = [
  {
    id: 's-01',
    rollNo: '01',
    admissionNo: 'GGSP-2024-LKG-001',
    name: 'Aarav Sharma',
    photo: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80',
    status: 'Present',
    age: '4 years 2 months',
    dob: '12 Jul 2022',
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: 'Peanut Allergy (Carries EpiPen)',
    dietaryNote: 'Strict Nut-free snackbox',
    address: 'B-14, Green Park Extension, New Delhi - 110016',
    emergencyContactName: 'Ramesh Sharma (Grandfather)',
    emergencyContactPhone: '+91 98112 34567',
    authorizedPickupPerson: 'Rohit Sharma',
    authorizedPickupRelation: 'Father',
    parentLabel: 'Father',
    parentName: 'Rohit Sharma',
    phone: '+91 98765 43210',
    attendanceRate: 94
  },
  {
    id: 's-02',
    rollNo: '02',
    admissionNo: 'GGSP-2024-LKG-002',
    name: 'Ananya Patel',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'Present',
    age: '4 years 1 month',
    dob: '28 Aug 2022',
    gender: 'Female',
    bloodGroup: 'B+',
    allergies: 'Lactose Intolerance (Cow milk)',
    dietaryNote: 'Almond/Soy milk only',
    address: 'Flat 402, Lotus Apartments, Sector 15, Rohini, Delhi - 110085',
    emergencyContactName: 'Kavita Patel (Aunt)',
    emergencyContactPhone: '+91 98223 45678',
    authorizedPickupPerson: 'Neha Patel',
    authorizedPickupRelation: 'Mother',
    parentLabel: 'Mother',
    parentName: 'Neha Patel',
    phone: '+91 87654 32109',
    attendanceRate: 98
  },
  {
    id: 's-03',
    rollNo: '03',
    admissionNo: 'GGSP-2024-LKG-003',
    name: 'Vivaan Gupta',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    status: 'Present',
    age: '4 years 3 months',
    dob: '05 Jun 2022',
    gender: 'Male',
    bloodGroup: 'A+',
    allergies: 'None (All clear)',
    dietaryNote: 'Regular',
    address: 'C-28, Vasant Kunj Pocket B, New Delhi - 110070',
    emergencyContactName: 'Sunita Gupta (Grandmother)',
    emergencyContactPhone: '+91 98334 56789',
    authorizedPickupPerson: 'Amit Gupta',
    authorizedPickupRelation: 'Father',
    parentLabel: 'Father',
    parentName: 'Amit Gupta',
    phone: '+91 99887 66554',
    attendanceRate: 96
  },
  {
    id: 's-04',
    rollNo: '04',
    admissionNo: 'GGSP-2024-LKG-004',
    name: 'Diya Verma',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    status: 'Absent',
    age: '4 years 5 months',
    dob: '19 Apr 2022',
    gender: 'Female',
    bloodGroup: 'AB+',
    allergies: 'Seasonal Dust / Asthmatic Inhaler',
    dietaryNote: 'Pure Vegetarian',
    address: 'House #105, Gulmohar Enclave, Hauz Khas, New Delhi - 110049',
    emergencyContactName: 'Vikas Verma (Uncle)',
    emergencyContactPhone: '+91 98445 67890',
    authorizedPickupPerson: 'Pooja Verma',
    authorizedPickupRelation: 'Mother',
    parentLabel: 'Mother',
    parentName: 'Pooja Verma',
    phone: '+91 91234 56789',
    attendanceRate: 78,
    absenceReason: 'Severe Dust Allergy (Inhaler prescribed)',
    isExcused: true
  },
  {
    id: 's-05',
    rollNo: '05',
    admissionNo: 'GGSP-2024-LKG-005',
    name: 'Kabir Mehta',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Late',
    age: '4 years 4 months',
    dob: '14 May 2022',
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: 'Egg Protein (Skin rash)',
    dietaryNote: 'Strict Vegetarian (Egg-free)',
    address: 'D-82, Defence Colony, New Delhi - 110024',
    emergencyContactName: 'Meena Mehta (Grandmother)',
    emergencyContactPhone: '+91 98556 78901',
    authorizedPickupPerson: 'Radha Bai (Authorized Nanny #44)',
    authorizedPickupRelation: 'Authorized Escort',
    parentLabel: 'Father',
    parentName: 'Sanjay Mehta',
    phone: '+91 98765 43211',
    attendanceRate: 85,
    arrivalNote: 'Arrived at 8:42 AM • Heavy Sector 14 traffic'
  },
  {
    id: 's-06',
    rollNo: '06',
    admissionNo: 'GGSP-2024-LKG-006',
    name: 'Saanvi Iyer',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'Present',
    age: '4 years 6 months',
    dob: '02 Mar 2022',
    gender: 'Female',
    bloodGroup: 'B+',
    allergies: 'None (All clear)',
    dietaryNote: 'Jain Meal (No root veg)',
    address: 'Tower 3, Apt 8B, Silver Oaks, Gurgaon - 122002',
    emergencyContactName: 'Lakshmi Iyer (Grandmother)',
    emergencyContactPhone: '+91 98667 89012',
    authorizedPickupPerson: 'Rajesh Iyer',
    authorizedPickupRelation: 'Father',
    parentLabel: 'Father',
    parentName: 'Rajesh Iyer',
    phone: '+91 90987 65432',
    attendanceRate: 92
  },
  {
    id: 's-07',
    rollNo: '07',
    admissionNo: 'GGSP-2024-LKG-007',
    name: 'Ishita Roy',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'Present',
    age: '4 years 3 months',
    dob: '21 Jun 2022',
    gender: 'Female',
    bloodGroup: 'A+',
    allergies: 'None (All clear)',
    dietaryNote: 'Regular',
    address: '14/A, Chittaranjan Park, New Delhi - 110019',
    emergencyContactName: 'Subhash Roy (Grandfather)',
    emergencyContactPhone: '+91 98778 90123',
    authorizedPickupPerson: 'Anil Roy',
    authorizedPickupRelation: 'Father',
    parentLabel: 'Father',
    parentName: 'Anil Roy',
    phone: '+91 87654 32108',
    attendanceRate: 95
  },
  {
    id: 's-08',
    rollNo: '08',
    admissionNo: 'GGSP-2024-LKG-008',
    name: 'Rohan Singh',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Present',
    age: '4 years 2 months',
    dob: '10 Aug 2022',
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: 'None (All clear)',
    dietaryNote: 'Regular',
    address: 'H-34, Greater Kailash Part 1, New Delhi - 110048',
    emergencyContactName: 'Harpreet Kaur (Aunt)',
    emergencyContactPhone: '+91 98889 01234',
    authorizedPickupPerson: 'Vikram Singh',
    authorizedPickupRelation: 'Father',
    parentLabel: 'Father',
    parentName: 'Vikram Singh',
    phone: '+91 99876 54321',
    attendanceRate: 91
  },
  {
    id: 's-09',
    rollNo: '09',
    admissionNo: 'GGSP-2024-LKG-009',
    name: 'Reyansh Gupta',
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    status: 'Present',
    age: '4 years 5 months',
    dob: '08 Apr 2022',
    gender: 'Male',
    bloodGroup: 'B+',
    allergies: 'None (All clear)',
    dietaryNote: 'Regular',
    address: 'A-21, Model Town Phase 2, Delhi - 110009',
    emergencyContactName: 'Alka Gupta (Aunt)',
    emergencyContactPhone: '+91 98990 12345',
    authorizedPickupPerson: 'Sanjay Gupta',
    authorizedPickupRelation: 'Father',
    parentLabel: 'Father',
    parentName: 'Sanjay Gupta',
    phone: '+91 98765 43218',
    attendanceRate: 87
  },
  {
    id: 's-10',
    rollNo: '10',
    admissionNo: 'GGSP-2024-LKG-010',
    name: 'Ishita Roy',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'Present',
    age: '4 years 1 month',
    dob: '18 Aug 2022',
    gender: 'Female',
    bloodGroup: 'O-',
    allergies: 'Citrus / Kiwi fruit allergy',
    dietaryNote: 'Citrus-free fruits only',
    address: 'Flat 101, Golf Links Residency, Dwarka Sector 10 - 110075',
    emergencyContactName: 'Arun Roy (Uncle)',
    emergencyContactPhone: '+91 98101 23456',
    authorizedPickupPerson: 'Pooja Roy',
    authorizedPickupRelation: 'Mother',
    parentLabel: 'Mother',
    parentName: 'Pooja Roy',
    phone: '+91 91234 56780',
    attendanceRate: 90
  }
];

export interface TeacherNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: 'Urgent' | 'Notice' | 'Academic' | 'Event';
  actionLabel?: string;
  actionTab?: TeacherTab;
  actionPayload?: {
    parentThreadId?: string;
    studentId?: string;
  };
}

const initialTeacherNotifications: TeacherNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Annual Sports Day 2026 Preparation Schedule',
    message: 'All class teachers must submit event participants list to Physical Education Department by Monday.',
    timestamp: '2 hours ago',
    isRead: false,
    category: 'Urgent',
    actionLabel: 'View Notice',
    actionTab: 'HOME',
  },
  {
    id: 'notif-2',
    title: 'LKG Section A Term 1 Report Cards Submission Deadline',
    message: 'Formative assessment observations and attendance registers must be finalized by Friday noon.',
    timestamp: '5 hours ago',
    isRead: false,
    category: 'Academic',
    actionLabel: 'Open Marks Ledger',
    actionTab: 'EXAMS & MARKS',
  },
  {
    id: 'notif-3',
    title: 'Parent-Teacher Meeting (PTM) Timing Notice',
    message: 'PTM scheduled for next Saturday from 09:00 AM to 01:00 PM. Time slots shared with parents.',
    timestamp: 'Yesterday',
    isRead: false,
    category: 'Notice',
    actionLabel: 'Open Parents Directory',
    actionTab: 'PARENTS',
  },
  {
    id: 'notif-4',
    title: 'New Art & Craft Supplies Stocked in Room 104',
    message: 'Washable tempera paints, large drawing sheets, safety scissors, and clay sets are ready for pickup.',
    timestamp: '2 days ago',
    isRead: true,
    category: 'Event',
    actionLabel: 'View Class Activities',
    actionTab: 'ACTIVITIES',
  },
  {
    id: 'notif-5',
    title: 'Daily Class Attendance Audit Alert',
    message: 'Morning roll-call attendance telemetry for LKG-A has been synchronized with the central attendance server.',
    timestamp: '3 days ago',
    isRead: true,
    category: 'Academic',
    actionLabel: 'Take Attendance',
    actionTab: 'ATTENDANCE',
  },
];

export interface TeacherLeaveItem {
  id: string;
  leaveType: 'Casual' | 'Sick' | 'Earned' | 'Maternity' | 'Official Duty';
  sessionType: 'Full Day' | 'Half Day (Forenoon)' | 'Half Day (Afternoon)';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  substituteTeacher: string;
  substituteStatus: 'Accepted' | 'Pending';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedOn: string;
  adminRemark?: string;
  attachmentName?: string;
  emergencyContact?: string;
}

const initialTeacherLeaves: TeacherLeaveItem[] = [
  {
    id: 'leave-101',
    leaveType: 'Casual',
    sessionType: 'Full Day',
    startDate: '2026-10-05',
    endDate: '2026-10-06',
    daysCount: 2,
    reason: 'Attending sibling wedding ceremony in Jaipur',
    substituteTeacher: 'Sunita Rao (Senior PRT - Hindi)',
    substituteStatus: 'Accepted',
    status: 'Pending',
    appliedOn: '2026-09-17',
    adminRemark: 'Awaiting Principal final sign-off',
    emergencyContact: '+91 98765 43210',
  },
  {
    id: 'leave-102',
    leaveType: 'Sick',
    sessionType: 'Full Day',
    startDate: '2026-08-12',
    endDate: '2026-08-13',
    daysCount: 2,
    reason: 'Severe viral fever and clinical medical recovery',
    substituteTeacher: 'Vikram Singh (Activity & PE)',
    substituteStatus: 'Accepted',
    status: 'Approved',
    appliedOn: '2026-08-11',
    adminRemark: 'Approved with medical certificate verified by School Infirmary',
    attachmentName: 'medical_fit_cert_aug2026.pdf',
    emergencyContact: '+91 98765 43210',
  },
  {
    id: 'leave-103',
    leaveType: 'Casual',
    sessionType: 'Half Day (Afternoon)',
    startDate: '2026-07-24',
    endDate: '2026-07-24',
    daysCount: 0.5,
    reason: 'Bank documentation & registrar office property documentation',
    substituteTeacher: 'Amit Pathak (Primary Mathematics)',
    substituteStatus: 'Accepted',
    status: 'Approved',
    appliedOn: '2026-07-20',
    adminRemark: 'Sanctioned for post-lunch periods',
    emergencyContact: '+91 98765 43210',
  },
  {
    id: 'leave-104',
    leaveType: 'Earned',
    sessionType: 'Full Day',
    startDate: '2026-09-01',
    endDate: '2026-09-03',
    daysCount: 3,
    reason: 'Personal holiday trip and family travel',
    substituteTeacher: 'None Designated',
    substituteStatus: 'Pending',
    status: 'Rejected',
    appliedOn: '2026-08-25',
    adminRemark: 'Denied: Mandatory Teachers CBSE NEP Orientation & Term-1 Planning week',
    emergencyContact: '+91 98765 43210',
  },
];

export interface ParentMessageItem {
  id: string;
  sender: 'Parent' | 'Teacher';
  text: string;
  timestamp: string;
}

export interface ParentMessageThread {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  parentName: string;
  parentLabel: 'Father' | 'Mother' | 'Guardian';
  phone: string;
  avatar: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  lastSender: 'Parent' | 'Teacher';
  ptmSlot?: string;
  ptmDate?: string;
  ptmTime?: string;
  ptmMode?: 'In-Person (Room 102)' | 'Online (Google Meet)';
  ptmReason?: string;
  ptmNotes?: string;
  ptmStatus?: 'Confirmed' | 'Pending' | 'Declined' | 'Rescheduled';
  ptmParentNote?: string;
  ptmConfirmedAt?: string;
  hasAbsenceNoteToday?: boolean;
  absenceReason?: string;
  messages: ParentMessageItem[];
}

export interface ClassBroadcastAnnouncement {
  id: string;
  title: string;
  message: string;
  category: 'General Circular' | 'Holiday Advisory' | 'Academic Alert' | 'Event Notice';
  priority: 'Standard' | 'Urgent';
  targetAudience: string;
  recipientCount: number;
  sentAt: string;
  channels: ('App Push' | 'SMS' | 'Email')[];
  deliveryRate: string;
  readRate: string;
}

const initialClassBroadcasts: ClassBroadcastAnnouncement[] = [
  {
    id: 'bc-1',
    title: 'Grandparents Day Celebration on Monday',
    message: 'Dear Parents, We are excited to invite grandparents for our annual Grandparents Day celebration this Monday at 10:00 AM in the Kindergarten Amphitheater. Please send family photos by Friday.',
    category: 'Event Notice',
    priority: 'Standard',
    targetAudience: 'All Class LKG-A Parents (28)',
    recipientCount: 28,
    sentAt: 'Yesterday, 02:30 PM',
    channels: ['App Push', 'SMS'],
    deliveryRate: '100% Delivered (28/28)',
    readRate: '92% Opened (26/28)',
  },
  {
    id: 'bc-2',
    title: 'Color Day Theme - Dress Children in Bright Yellow',
    message: 'Reminder for tomorrow: Color Day celebration. Please dress your ward in bright yellow attire with a small yellow fruit in their snack box.',
    category: 'General Circular',
    priority: 'Standard',
    targetAudience: 'All Class LKG-A Parents (28)',
    recipientCount: 28,
    sentAt: '3 days ago',
    channels: ['App Push'],
    deliveryRate: '100% Delivered (28/28)',
    readRate: '96% Opened (27/28)',
  },
];

const initialParentThreads: ParentMessageThread[] = [
  {
    id: '66789abcdef0123456789100',
    studentId: 's-01',
    studentName: 'Aarav Sharma',
    rollNo: '01',
    parentName: 'Rahul Sharma',
    parentLabel: 'Father',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
    unreadCount: 0,
    lastMessage: "Thank you ma'am, Aarav enjoyed the color day activity yesterday!",
    lastMessageTime: 'Yesterday, 04:15 PM',
    lastSender: 'Parent',
    ptmSlot: 'Saturday, 09:30 AM - 09:45 AM',
    ptmDate: '2026-09-26',
    ptmTime: '09:30 AM - 09:45 AM',
    ptmMode: 'In-Person (Room 102)',
    ptmReason: 'Term 1 Diagnostic Evaluation & Phonics Progress',
    ptmNotes: 'Please bring student coloring workbook and phonics practice sheets.',
    ptmStatus: 'Confirmed',
    ptmConfirmedAt: 'Yesterday, 04:15 PM',
    messages: [
      { id: 'm-1', sender: 'Teacher', text: 'Good evening Mr. Sharma, Aarav did wonderful tracing work in today’s phonics class!', timestamp: 'Yesterday, 03:30 PM' },
      { id: 'm-2', sender: 'Parent', text: "Thank you ma'am, Aarav enjoyed the color day activity yesterday!", timestamp: 'Yesterday, 04:15 PM' },
    ],
  },
  {
    id: 'pt-02',
    studentId: 's-02',
    studentName: 'Ananya Patel',
    rollNo: '02',
    parentName: 'Meera Patel',
    parentLabel: 'Mother',
    phone: '+91 98765 12345',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    unreadCount: 1,
    lastMessage: 'Good morning Ma’am, will Ananya need her art kit for the activity class today?',
    lastMessageTime: 'Today, 08:05 AM',
    lastSender: 'Parent',
    ptmSlot: 'Saturday, 10:00 AM - 10:15 AM',
    ptmDate: '2026-09-26',
    ptmTime: '10:00 AM - 10:15 AM',
    ptmMode: 'In-Person (Room 102)',
    ptmReason: 'Social Interaction & Group Play Observation',
    ptmNotes: 'Review family photo collage and action rhymes recitation.',
    ptmStatus: 'Confirmed',
    ptmConfirmedAt: 'Today, 08:10 AM',
    messages: [
      { id: 'm-1', sender: 'Teacher', text: 'Hello Mrs. Patel, please remember to send Ananya’s family photo collage by Thursday.', timestamp: 'Tuesday, 02:00 PM' },
      { id: 'm-2', sender: 'Parent', text: 'Good morning Ma’am, will Ananya need her art kit for the activity class today?', timestamp: 'Today, 08:05 AM' },
    ],
  },
  {
    id: 'pt-03',
    studentId: 's-03',
    studentName: 'Vivaan Gupta',
    rollNo: '03',
    parentName: 'Amit Gupta',
    parentLabel: 'Father',
    phone: '+91 99887 66554',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    unreadCount: 1,
    lastMessage: 'Can Vivaan take his cough syrup (5ml) after lunch? It is kept in his bag pouch.',
    lastMessageTime: 'Today, 08:20 AM',
    lastSender: 'Parent',
    ptmSlot: 'Saturday, 10:30 AM - 10:45 AM',
    ptmDate: '2026-09-26',
    ptmTime: '10:30 AM - 10:45 AM',
    ptmMode: 'In-Person (Room 102)',
    ptmReason: 'Early Numeracy & Object Counting Evaluation',
    ptmNotes: 'Bring numeric block practice book.',
    ptmStatus: 'Rescheduled',
    ptmParentNote: 'Office emergency on Saturday morning; parent requested 02:00 PM afternoon slot.',
    messages: [
      { id: 'm-1', sender: 'Parent', text: 'Can Vivaan take his cough syrup (5ml) after lunch? It is kept in his bag pouch.', timestamp: 'Today, 08:20 AM' },
    ],
  },
  {
    id: 'pt-04',
    studentId: 's-04',
    studentName: 'Diya Verma',
    rollNo: '04',
    parentName: 'Pooja Verma',
    parentLabel: 'Mother',
    phone: '+91 91234 56789',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    unreadCount: 1,
    hasAbsenceNoteToday: true,
    absenceReason: 'Severe viral fever and clinical medical rest advised by pediatrician.',
    lastMessage: 'Diya has fever and throat infection. Doctor advised 2 days rest. She will rejoin on Monday.',
    lastMessageTime: 'Today, 07:45 AM',
    lastSender: 'Parent',
    ptmSlot: 'Saturday, 11:00 AM - 11:15 AM',
    ptmDate: '2026-09-26',
    ptmTime: '11:00 AM - 11:15 AM',
    ptmMode: 'In-Person (Room 102)',
    ptmReason: 'Health, Medical Rest & Term Progress Catchup',
    ptmNotes: 'Doctor certificate verification and missed worksheets catchup.',
    ptmStatus: 'Declined',
    ptmParentNote: 'Diya is currently bedridden with viral fever. Requesting virtual meeting next week.',
    messages: [
      { id: 'm-1', sender: 'Parent', text: 'Diya has fever and throat infection. Doctor advised 2 days rest. She will rejoin on Monday.', timestamp: 'Today, 07:45 AM' },
    ],
  },
  {
    id: 'pt-05',
    studentId: 's-05',
    studentName: 'Kabir Mehta',
    rollNo: '05',
    parentName: 'Sanjay Mehta',
    parentLabel: 'Father',
    phone: '+91 98765 43211',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    unreadCount: 0,
    lastMessage: 'Apologies for the delay today, traffic jam on Ring Road. Kabir reached safely.',
    lastMessageTime: 'Today, 08:45 AM',
    lastSender: 'Parent',
    ptmSlot: 'Saturday, 11:30 AM - 11:45 AM',
    ptmDate: '2026-09-26',
    ptmTime: '11:30 AM - 11:45 AM',
    ptmMode: 'Online (Google Meet)',
    ptmReason: 'Sensory Play & Speech Milestone Review',
    ptmNotes: 'Google Meet virtual link generated for working parents.',
    ptmStatus: 'Confirmed',
    ptmConfirmedAt: 'Wednesday, 02:30 PM',
    messages: [
      { id: 'm-1', sender: 'Parent', text: 'Apologies for the delay today, traffic jam on Ring Road. Kabir reached safely.', timestamp: 'Today, 08:45 AM' },
      { id: 'm-2', sender: 'Teacher', text: 'Noted Mr. Mehta, Kabir has joined the class assembly.', timestamp: 'Today, 08:50 AM' },
    ],
  },
  {
    id: 'pt-06',
    studentId: 's-06',
    studentName: 'Saanvi Iyer',
    rollNo: '06',
    parentName: 'Rajesh Iyer',
    parentLabel: 'Father',
    phone: '+91 90987 65432',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    unreadCount: 0,
    lastMessage: 'Saanvi recited the rhymes at home proudly yesterday. Great effort by the teachers!',
    lastMessageTime: 'Yesterday, 06:10 PM',
    lastSender: 'Parent',
    ptmSlot: 'Saturday, 12:00 PM - 12:15 PM',
    ptmDate: '2026-09-26',
    ptmTime: '12:00 PM - 12:15 PM',
    ptmMode: 'In-Person (Room 102)',
    ptmReason: 'Music, Rhythm & Vocal Recitation Skills',
    ptmNotes: 'Handing over Term 1 Rhymes Merit Certificate.',
    ptmStatus: 'Confirmed',
    ptmConfirmedAt: 'Yesterday, 06:12 PM',
    messages: [
      { id: 'm-1', sender: 'Parent', text: 'Saanvi recited the rhymes at home proudly yesterday. Great effort by the teachers!', timestamp: 'Yesterday, 06:10 PM' },
      { id: 'm-2', sender: 'Teacher', text: 'Thank you Mr. Iyer! She is very enthusiastic in our music circle.', timestamp: 'Yesterday, 06:30 PM' },
    ],
  },
  {
    id: 'pt-07',
    studentId: 's-07',
    studentName: 'Ishita Roy',
    rollNo: '07',
    parentName: 'Anil Roy',
    parentLabel: 'Father',
    phone: '+91 87654 32108',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    unreadCount: 0,
    lastMessage: 'Confirmed PTM slot for Saturday 12:30 PM. See you then.',
    lastMessageTime: 'Wednesday',
    lastSender: 'Parent',
    ptmSlot: 'Saturday, 12:30 PM - 12:45 PM',
    ptmDate: '2026-09-26',
    ptmTime: '12:30 PM - 12:45 PM',
    ptmMode: 'In-Person (Room 102)',
    ptmReason: 'Routine Kindergarten Developmental Check',
    ptmNotes: 'Awaiting guardian confirmation via app.',
    ptmStatus: 'Pending',
    messages: [
      { id: 'm-1', sender: 'Parent', text: 'Confirmed PTM slot for Saturday 12:30 PM. See you then.', timestamp: 'Wednesday, 01:20 PM' },
    ],
  },
  {
    id: 'pt-08',
    studentId: 's-08',
    studentName: 'Rohan Singh',
    rollNo: '08',
    parentName: 'Vikram Singh',
    parentLabel: 'Father',
    phone: '+91 99876 54321',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    unreadCount: 0,
    lastMessage: 'Rohan’s sports uniform has been labeled as requested.',
    lastMessageTime: '2 days ago',
    lastSender: 'Parent',
    ptmSlot: 'Saturday, 01:00 PM - 01:15 PM',
    ptmDate: '2026-09-26',
    ptmTime: '01:00 PM - 01:15 PM',
    ptmMode: 'In-Person (Room 102)',
    ptmReason: 'Physical Coordination & Outdoor Activities',
    ptmNotes: 'Discuss sports day participation squad.',
    ptmStatus: 'Confirmed',
    ptmConfirmedAt: '2 days ago',
    messages: [
      { id: 'm-1', sender: 'Parent', text: 'Rohan’s sports uniform has been labeled as requested.', timestamp: '2 days ago' },
    ],
  },
  {
    id: 'pt-09',
    studentId: 's-09',
    studentName: 'Reyansh Gupta',
    rollNo: '09',
    parentName: 'Sanjay Gupta',
    parentLabel: 'Father',
    phone: '+91 98765 43218',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    unreadCount: 0,
    lastMessage: 'Received homework notebook and completed tracing assignment.',
    lastMessageTime: '3 days ago',
    lastSender: 'Parent',
    ptmSlot: 'Saturday, 01:15 PM - 01:30 PM',
    ptmDate: '2026-09-26',
    ptmTime: '01:15 PM - 01:30 PM',
    ptmMode: 'In-Person (Room 102)',
    ptmReason: 'Classroom Attentiveness & Workbook Tracing',
    ptmNotes: 'Review tracing worksheets and hand-grip progress.',
    ptmStatus: 'Confirmed',
    ptmConfirmedAt: '3 days ago',
    messages: [
      { id: 'm-1', sender: 'Parent', text: 'Received homework notebook and completed tracing assignment.', timestamp: '3 days ago' },
    ],
  },
  {
    id: 'pt-10',
    studentId: 's-10',
    studentName: 'Ishita Roy',
    rollNo: '10',
    parentName: 'Pooja Roy',
    parentLabel: 'Mother',
    phone: '+91 91234 56780',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    unreadCount: 0,
    hasAbsenceNoteToday: false,
    lastMessage: 'All lunchbox items packed as per school dietary guidelines.',
    lastMessageTime: 'Yesterday',
    lastSender: 'Parent',
    ptmSlot: 'Saturday, 01:30 PM - 01:45 PM',
    ptmDate: '2026-09-26',
    ptmTime: '01:30 PM - 01:45 PM',
    ptmMode: 'In-Person (Room 102)',
    ptmReason: 'Sensory Nutrition & Meal Habits Review',
    ptmNotes: 'Discuss healthy food options during snack break.',
    ptmStatus: 'Confirmed',
    ptmConfirmedAt: 'Yesterday',
    messages: [
      { id: 'm-1', sender: 'Parent', text: 'All lunchbox items packed as per school dietary guidelines.', timestamp: 'Yesterday' },
    ],
  },
];

interface SidebarNavItem {
  id: TeacherTab;
  label: string;
  icon: any;
  hasChevron: boolean;
  badge?: number;
}

const sidebarNavItems: SidebarNavItem[] = [
  { id: 'HOME', label: 'Home', icon: Home, hasChevron: false },
  { id: 'ATTENDANCE', label: 'Attendance', icon: CalendarCheck, hasChevron: true },
  { id: 'CLASSROOM', label: 'Classroom', icon: Users, hasChevron: true },
  { id: 'HOMEWORK', label: 'Homework', icon: BookMarked, hasChevron: true },
  { id: 'MARKS & EVALUATION', label: 'Marks & Evaluation', icon: Award, hasChevron: true },
  { id: 'PARENTS', label: 'Parents & PTM', icon: MessageSquare, hasChevron: false },
  { id: 'LEAVE & PROFILE', label: 'My Leave & Profile', icon: Clock, hasChevron: false }
];

interface TeacherWorkspaceProps {
  user?: any;
  stats?: any;
  onRefresh?: () => void;
  initialTab?: TeacherTab;
}

export default function TeacherWorkspace({ user, stats, onRefresh, initialTab }: TeacherWorkspaceProps) {
  const todayStr = useMemo(() => toSchoolISODate(), []);
  const [activeTab, setActiveTab] = useState<TeacherTab>(() => {
    if (!initialTab) return 'HOME';
    if (initialTab === 'MY CLASS' || initialTab === 'CLASS WORK' || initialTab === 'LESSON PLAN' || initialTab === 'ACTIVITIES') return 'CLASSROOM';
    if (initialTab === 'ASSESSMENT' || initialTab === 'EXAMS & MARKS') return 'MARKS & EVALUATION';
    if (initialTab === 'LEAVE' || initialTab === 'MY ACCOUNT') return 'LEAVE & PROFILE';
    return initialTab;
  });
  const [classroomSubTab, setClassroomSubTab] = useState<'ROSTER' | 'CLASS WORK' | 'LESSON PLAN'>(() => {
    if (initialTab === 'CLASS WORK' || initialTab === 'ACTIVITIES') return 'CLASS WORK';
    if (initialTab === 'LESSON PLAN') return 'LESSON PLAN';
    return 'ROSTER';
  });
  const [marksSubTab, setMarksSubTab] = useState<'ASSESSMENT' | 'EXAMS'>(() => {
    if (initialTab === 'EXAMS & MARKS') return 'EXAMS';
    return 'ASSESSMENT';
  });
  const [leaveProfileSubTab, setLeaveProfileSubTab] = useState<'LEAVE' | 'PROFILE'>(() => {
    if (initialTab === 'MY ACCOUNT') return 'PROFILE';
    return 'LEAVE';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [childProfileDrawerOpen, setChildProfileDrawerOpen] = useState(false);
  const [selectedChildForProfile, setSelectedChildForProfile] = useState<StudentCardData | null>(null);
  const [subTab, setSubTab] = useState<'children' | 'details' | 'parents'>('children');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<StudentCardData[]>(mockStudentsList);
  const [selectedStudent, setSelectedStudent] = useState<StudentCardData | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'MY CLASS' || initialTab === 'CLASS WORK' || initialTab === 'LESSON PLAN' || initialTab === 'ACTIVITIES') {
        setActiveTab('CLASSROOM');
        if (initialTab === 'CLASS WORK' || initialTab === 'ACTIVITIES') setClassroomSubTab('CLASS WORK');
        else if (initialTab === 'LESSON PLAN') setClassroomSubTab('LESSON PLAN');
        else setClassroomSubTab('ROSTER');
      } else if (initialTab === 'ASSESSMENT' || initialTab === 'EXAMS & MARKS') {
        setActiveTab('MARKS & EVALUATION');
        if (initialTab === 'EXAMS & MARKS') setMarksSubTab('EXAMS');
        else setMarksSubTab('ASSESSMENT');
      } else if (initialTab === 'LEAVE' || initialTab === 'MY ACCOUNT') {
        setActiveTab('LEAVE & PROFILE');
        if (initialTab === 'MY ACCOUNT') setLeaveProfileSubTab('PROFILE');
        else setLeaveProfileSubTab('LEAVE');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  const handleNavigateTab = (tab: any, hint?: string) => {
    if (tab === 'HOME') {
      setActiveTab('HOME');
    } else if (tab === 'ATTENDANCE') {
      setActiveTab('ATTENDANCE');
    } else if (tab === 'CLASSROOM' || tab === 'MY CLASS' || tab === 'CLASS WORK' || tab === 'LESSON PLAN' || tab === 'ACTIVITIES') {
      setActiveTab('CLASSROOM');
      if (hint === 'CLASS WORK' || tab === 'CLASS WORK' || tab === 'ACTIVITIES') {
        setClassroomSubTab('CLASS WORK');
      } else if (hint === 'LESSON PLAN' || tab === 'LESSON PLAN') {
        setClassroomSubTab('LESSON PLAN');
      } else {
        setClassroomSubTab('ROSTER');
      }
    } else if (tab === 'CHILD GROWTH') {
      setActiveTab('CLASSROOM');
      setClassroomSubTab('ROSTER');
      if (students && students.length > 0) {
        setSelectedStudent(students[0]);
      }
      toast.success('Child Growth is viewed directly in each student’s 360° Profile Drawer');
    } else if (tab === 'HOMEWORK') {
      setActiveTab('HOMEWORK');
    } else if (tab === 'MARKS & EVALUATION' || tab === 'ASSESSMENT' || tab === 'EXAMS & MARKS') {
      setActiveTab('MARKS & EVALUATION');
      if (hint === 'EXAMS' || tab === 'EXAMS & MARKS') {
        setMarksSubTab('EXAMS');
      } else {
        setMarksSubTab('ASSESSMENT');
      }
    } else if (tab === 'PARENTS') {
      setActiveTab('PARENTS');
    } else if (tab === 'LEAVE & PROFILE' || tab === 'LEAVE' || tab === 'MY ACCOUNT') {
      setActiveTab('LEAVE & PROFILE');
      if (hint === 'PROFILE' || tab === 'MY ACCOUNT') {
        setLeaveProfileSubTab('PROFILE');
      } else {
        setLeaveProfileSubTab('LEAVE');
      }
    } else {
      setActiveTab(tab);
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  };

  // Load real students from backend database
  useEffect(() => {
    const fetchRealStudents = async () => {
      try {
        const baseUrl = getApiBaseUrl();

        const res = await authFetch(`${baseUrl}/api/v1/students`, {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders(),
        });

        if (res.status === 401) {
          console.warn("Unauthorized: authentication cookie or token is missing or expired");
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch students: ${res.status}`);
        }

        const apiStudents = await res.json();
          if (Array.isArray(apiStudents) && apiStudents.length > 0) {
            const mappedStudents: StudentCardData[] = apiStudents.map((s: any, idx: number) => {
              const p = s.parentId || {};
              return {
                id: String(s._id),
                rollNo: s.rollNumber || String(idx + 1).padStart(2, '0'),
                admissionNo: s.studentId || s.admissionNumber || `GGPS2026LKG${String(idx + 1).padStart(3, '0')}`,
                name: `${s.firstName} ${s.lastName || ''}`.trim(),
                photo: s.studentPhoto || (idx % 2 === 0 ? 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'),
                status: 'Present',
                age: s.age || '4 years',
                dob: s.dob ? new Date(s.dob).toLocaleDateString() : '12 Jul 2022',
                gender: (s.gender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female',
                bloodGroup: s.bloodGroup || 'O+',
                allergies: s.medicalNotes || 'None',
                dietaryNote: 'Regular',
                address: s.address || 'GGPS School Campus Area',
                emergencyContactName: p.fatherName || p.motherName || 'Parent Guardian',
                emergencyContactPhone: p.fatherContact || p.motherContact || '+91 98765 00007',
                authorizedPickupPerson: p.motherName || p.fatherName || 'Parent Guardian',
                authorizedPickupRelation: 'Parent',
                parentLabel: p.motherName ? 'Mother' : 'Parent',
                parentName: p.motherName || p.fatherName || 'Paul Parent',
                phone: p.motherContact || p.fatherContact || '+91 98765 00007',
                attendanceRate: 98,
              };
            });

            // Merge real students at the front of the list
            setStudents((prev) => {
              const realIds = new Set(mappedStudents.map((r) => r.id));
              const remainingMock = prev.filter((m) => !realIds.has(m.id));
              return [...mappedStudents, ...remainingMock];
            });
          }
      } catch (err) {
        console.warn('Real students load notice:', err);
      }
    };
    fetchRealStudents();
  }, []);

  // Attendance Screen State
  const [attendanceSubTab, setAttendanceSubTab] = useState<'MARK' | 'ABSENT' | 'LATE' | 'HISTORY'>('MARK');
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('ALL');
  const [attendanceSectionFilter, setAttendanceSectionFilter] = useState('Section A');
  const [attendanceViewMode, setAttendanceViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [isAttendanceLocked, setIsAttendanceLocked] = useState(false);
  const [isAttendanceSubmitModalOpen, setIsAttendanceSubmitModalOpen] = useState(false);
  const [notifyAbsentParents, setNotifyAbsentParents] = useState(true);
  const [attendanceDateOffset, setAttendanceDateOffset] = useState(0); // 0 = today, -1 = yesterday, etc.
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState<string[]>([]);

  const currentAttendanceDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + attendanceDateOffset);
    return d;
  }, [attendanceDateOffset]);

  const formattedAttendanceDateStr = useMemo(() => {
    const isToday = attendanceDateOffset === 0;
    const isYesterday = attendanceDateOffset === -1;
    const isTomorrow = attendanceDateOffset === 1;
    const prefix = isToday ? 'Today, ' : isYesterday ? 'Yesterday, ' : isTomorrow ? 'Tomorrow, ' : '';
    return (
      prefix +
      currentAttendanceDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    );
  }, [currentAttendanceDate, attendanceDateOffset]);

  const attendanceStudents = useMemo(() => {
    return students.filter((s) => {
      if (attendanceSubTab === 'ABSENT' && s.status !== 'Absent') return false;
      if (attendanceSubTab === 'LATE' && s.status !== 'Late') return false;
      if (attendanceStatusFilter !== 'ALL' && s.status !== attendanceStatusFilter) return false;
      if (attendanceSearchQuery.trim()) {
        const q = attendanceSearchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.parentName.toLowerCase().includes(q) ||
          (s.address && s.address.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [students, attendanceSubTab, attendanceStatusFilter, attendanceSearchQuery]);

  const presentCount = useMemo(() => students.filter((s) => s.status === 'Present').length, [students]);
  const absentCount = useMemo(() => students.filter((s) => s.status === 'Absent').length, [students]);
  const lateCount = useMemo(() => students.filter((s) => s.status === 'Late').length, [students]);

  const handleUpdateStudentStatus = (id: string, newStatus: 'Present' | 'Absent' | 'Late') => {
    if (isAttendanceLocked) {
      toast.error('Register is locked. Click "Unlock to Edit" to change status.');
      return;
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    toast.success(`Updated status to ${newStatus}`, { duration: 1200 });
  };

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    if (isAttendanceLocked) {
      toast.error('Register is locked. Please unlock first to make bulk changes.');
      return;
    }
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    toast.success(`Marked all ${students.length} students as ${status}!`);
  };

  const submitAttendanceToBackend = async () => {
    try {
      const baseUrl = getApiBaseUrl();

      const records = students.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        status: s.status,
        checkInTime: s.status === 'Present' ? '8:42 AM' : s.status === 'Late' ? (s.arrivalNote || '9:15 AM') : undefined,
        absenceReason: s.status === 'Absent' ? (s.absenceReason || 'Unexplained Absence') : undefined,
        teacherRemark: s.arrivalNote || (s.status === 'Late' ? 'Arrived late' : undefined),
      }));

      await authFetch(`${baseUrl}/api/v1/attendance`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          className: 'LKG',
          sectionName: 'Section A',
          academicYear: '2026-2027',
          date: new Date(),
          teacherName: 'Ms. Ananya Roy',
          records,
        }),
      });
    } catch (err) {
      console.warn('Attendance sync error:', err);
    }
  };

  const submitClassWorkToBackend = async (subject: string, topic: string, whatWasTaught: string) => {
    try {
      const baseUrl = getApiBaseUrl();

      await authFetch(`${baseUrl}/api/v1/classwork`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subject,
          topic,
          whatWasTaught,
          learningObjective: 'Foundational concept mastery through tactile interaction',
          classroomActivity: 'Block building group challenge',
          className: 'LKG',
          sectionName: 'Section A',
          academicYear: '2026-2027',
          teacherName: 'Ms. Ananya Roy',
          date: new Date(),
        }),
      });
    } catch (err) {
      console.warn('Classwork sync error:', err);
    }
  };

  const submitActivityToBackend = async (title: string, category: string, description: string) => {
    try {
      const baseUrl = getApiBaseUrl();

      await authFetch(`${baseUrl}/api/v1/activities`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          category,
          description,
          skillsLearned: ['Fine motor precision', 'Color mixing', 'Tactile exploration'],
          className: 'LKG',
          sectionName: 'Section A',
          academicYear: '2026-2027',
          teacherName: 'Ms. Ananya Roy',
          date: new Date(),
        }),
      });
    } catch (err) {
      console.warn('Activity sync error:', err);
    }
  };

  const submitHomeworkToBackend = async (subject: string, title: string, instructions: string, dueDate: string) => {
    try {
      const baseUrl = getApiBaseUrl();

      await authFetch(`${baseUrl}/api/v1/homework`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subject,
          title,
          description: instructions,
          instructions,
          dueDate,
          className: 'LKG',
          sectionName: 'Section A',
          academicYear: '2026-2027',
          teacherName: 'Ms. Ananya Roy',
        }),
      });
    } catch (err) {
      console.warn('Homework sync error:', err);
    }
  };

  const submitRemarkToBackend = async (studentId: string, category: string, content: string) => {
    try {
      const baseUrl = getApiBaseUrl();
      const targetStudent = students.find((s) => s.id === studentId);

      await authFetch(`${baseUrl}/api/v1/teacher-remarks`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          studentId: targetStudent?.id || 'c10101010101010101010101',
          studentName: targetStudent?.name || 'Aarav Sharma',
          category,
          content,
          teacherName: 'Ms. Ananya Roy',
        }),
      });
    } catch (err) {
      console.warn('Remark sync error:', err);
    }
  };

  const handleConfirmSubmitAttendance = () => {
    setIsAttendanceLocked(true);
    setIsAttendanceSubmitModalOpen(false);
    submitAttendanceToBackend();
    if (notifyAbsentParents && absentCount > 0) {
      const absentKids = students.filter((s) => s.status === 'Absent');
      toast.success(
        `Register submitted! SMS alert triggered to ${absentKids.length} absent guardian(s): ${absentKids.map((k) => k.name).join(', ')}`,
        { duration: 4000 }
      );
    } else {
      toast.success('Official Attendance Register submitted & locked successfully!');
    }
  };

  const handleUnlockAttendance = () => {
    setIsAttendanceLocked(false);
    toast('Attendance register unlocked for modifications', { icon: '🔓' });
  };

  const handleExportAttendanceCSV = () => {
    const headers = ['Roll No', 'Child Name', 'Admission ID', 'Status', 'Absence Reason / Remark', 'Parent Name', 'Phone', 'Address'];
    const rows = students.map((s) => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.admissionNo || ''}"`,
      `"${s.status}"`,
      `"${s.status === 'Absent' ? (s.absenceReason || 'Unexplained Absence') : s.status === 'Late' ? (s.arrivalNote || 'Arrived Late') : 'On Time'}"`,
      `"${s.parentName}"`,
      `"${s.phone}"`,
      `"${s.address || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_LKG-A_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded Daily Attendance CSV Register!');
  };

  // Monthly History View State & Computations
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedHistoryYear, setSelectedHistoryYear] = useState(new Date().getFullYear()); // e.g. 2026

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevHistoryMonth = () => {
    if (selectedHistoryMonth === 0) {
      setSelectedHistoryMonth(11);
      setSelectedHistoryYear((y) => y - 1);
    } else {
      setSelectedHistoryMonth((m) => m - 1);
    }
  };

  const handleNextHistoryMonth = () => {
    if (selectedHistoryMonth === 11) {
      setSelectedHistoryMonth(0);
      setSelectedHistoryYear((y) => y + 1);
    } else {
      setSelectedHistoryMonth((m) => m + 1);
    }
  };

  const handleSetCurrentMonth = () => {
    const now = new Date();
    setSelectedHistoryMonth(now.getMonth());
    setSelectedHistoryYear(now.getFullYear());
  };

  const monthlyDays = useMemo(() => {
    const totalDays = new Date(selectedHistoryYear, selectedHistoryMonth + 1, 0).getDate();
    const days = [];
    const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(selectedHistoryYear, selectedHistoryMonth, day);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      days.push({
        day,
        dayLetter: dayLetters[dayOfWeek],
        isWeekend,
        dateStr: `${selectedHistoryYear}-${String(selectedHistoryMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      });
    }
    return days;
  }, [selectedHistoryYear, selectedHistoryMonth]);

  const monthlyAttendanceData = useMemo(() => {
    return students.map((student) => {
      let pCount = 0;
      let aCount = 0;
      let lCount = 0;
      let workingDaysCount = 0;

      const records = monthlyDays.map((dayObj) => {
        if (dayObj.isWeekend) {
          return { day: dayObj.day, status: 'WEEKEND' as const, isWeekend: true };
        }
        workingDaysCount++;
        // Deterministic status per student, month, day
        const seed = (parseInt(student.rollNo || '1') * 19 + selectedHistoryMonth * 37 + dayObj.day * 13) % 100;
        let status: 'P' | 'A' | 'L' = 'P';
        if (seed < 5) {
          status = 'A';
          aCount++;
        } else if (seed < 10) {
          status = 'L';
          lCount++;
        } else {
          status = 'P';
          pCount++;
        }
        return { day: dayObj.day, status, isWeekend: false };
      });

      const attendanceRate = workingDaysCount > 0
        ? Math.round(((pCount + lCount * 0.8) / workingDaysCount) * 100)
        : 100;

      return {
        student,
        records,
        presentCount: pCount,
        absentCount: aCount,
        lateCount: lCount,
        workingDaysCount,
        attendanceRate,
      };
    });
  }, [students, monthlyDays, selectedHistoryMonth, selectedHistoryYear]);

  const filteredMonthlyAttendanceData = useMemo(() => {
    if (!attendanceSearchQuery.trim()) return monthlyAttendanceData;
    const q = attendanceSearchQuery.toLowerCase().trim();
    return monthlyAttendanceData.filter(({ student }) =>
      student.name.toLowerCase().includes(q) ||
      student.rollNo.toLowerCase().includes(q) ||
      (student.parentName && student.parentName.toLowerCase().includes(q))
    );
  }, [monthlyAttendanceData, attendanceSearchQuery]);

  const monthlyKpis = useMemo(() => {
    const totalLearners = monthlyAttendanceData.length;
    if (totalLearners === 0) return { avgRate: 0, totalStudentDays: 0, totalAbsences: 0, perfectLearners: 0 };
    const avgRate = Math.round(monthlyAttendanceData.reduce((acc, curr) => acc + curr.attendanceRate, 0) / totalLearners);
    const totalStudentDays = monthlyAttendanceData.reduce((acc, curr) => acc + curr.workingDaysCount, 0);
    const totalAbsences = monthlyAttendanceData.reduce((acc, curr) => acc + curr.absentCount, 0);
    const perfectLearners = monthlyAttendanceData.filter((s) => s.absentCount === 0).length;
    return { avgRate, totalStudentDays, totalAbsences, perfectLearners };
  }, [monthlyAttendanceData]);

  const handleExportMonthlyAttendanceCSV = () => {
    const monthName = monthNames[selectedHistoryMonth];
    const headers = [
      'Roll No',
      'Child Name',
      'Parent Name',
      ...monthlyDays.map((d) => `Day ${d.day} (${d.dayLetter})`),
      'Present Days',
      'Absent Days',
      'Late Days',
      'Attendance Rate %',
    ];
    const rows = monthlyAttendanceData.map(({ student, records, presentCount, absentCount, lateCount, attendanceRate }) => [
      `"${student.rollNo}"`,
      `"${student.name}"`,
      `"${student.parentName}"`,
      ...records.map((r) => (r.isWeekend ? '-' : r.status)),
      presentCount,
      absentCount,
      lateCount,
      `"${attendanceRate}%"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Monthly_Register_${monthName}_${selectedHistoryYear}_LKG-A.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${monthName} ${selectedHistoryYear} Attendance Register!`);
  };

  // Modals
  const [attendanceDrawerOpen, setAttendanceDrawerOpen] = useState(false);
  const [classWorkDrawerOpen, setClassWorkDrawerOpen] = useState(false);
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [homeworkDrawerOpen, setHomeworkDrawerOpen] = useState(false);
  const [messageParentDrawerOpen, setMessageParentDrawerOpen] = useState(false);
  const [remarkDrawerOpen, setRemarkDrawerOpen] = useState(false);
  const [timetableModalOpen, setTimetableModalOpen] = useState(false);
  const [addChildModalOpen, setAddChildModalOpen] = useState(false);

  // Real-time Teacher Drawers Form State
  const [cwSubject, setCwSubject] = useState('Numbers & Counting');
  const [cwTopic, setCwTopic] = useState('Counting blocks from 1 to 10');
  const [cwNotes, setCwNotes] = useState('All students actively participated in building block towers.');

  const [actTitle, setActTitle] = useState('Clay Modeling & Animal Shapes');
  const [actCategory, setActCategory] = useState('Art & Craft');
  const [actDescription, setActDescription] = useState('Fine motor skills tactile experience shaping clay animals and patterns.');

  const [hwSubject, setHwSubject] = useState('English Phonics');
  const [hwTitle, setHwTitle] = useState('Tracing Letter C & Sound Match');
  const [hwInstructions, setHwInstructions] = useState("Practice tracing letter 'C' on workbook page 12. Circle objects starting with 'C'.");
  const [hwDueDate, setHwDueDate] = useState('2026-09-24');

  const [remStudentId, setRemStudentId] = useState('');
  const [remCategory, setRemCategory] = useState('Appreciation');
  const [remContent, setRemContent] = useState('Demonstrated exceptional sharing behavior and enthusiasm in group activities today.');

  // New Student Form
  const [newRollNo, setNewRollNo] = useState('');
  const [newAdmissionNo, setNewAdmissionNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female'>('Male');
  const [newAge, setNewAge] = useState('4 years 2 months');
  const [newDob, setNewDob] = useState('2022-07-15');
  const [newBloodGroup, setNewBloodGroup] = useState('O+');
  const [newAddress, setNewAddress] = useState('');
  const [newAllergies, setNewAllergies] = useState('');
  const [newDietaryNote, setNewDietaryNote] = useState('Regular');
  const [newParentLabel, setNewParentLabel] = useState('Father');
  const [newParentName, setNewParentName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmergencyContactName, setNewEmergencyContactName] = useState('');
  const [newEmergencyContactPhone, setNewEmergencyContactPhone] = useState('');
  const [newAuthorizedPickupPerson, setNewAuthorizedPickupPerson] = useState('');
  const [newAuthorizedPickupRelation, setNewAuthorizedPickupRelation] = useState('Father');

  // Edit Student Form State
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<StudentCardData | null>(null);

  // My Class Filtering & Pagination State
  const [isClassFilterOpen, setIsClassFilterOpen] = useState(false);
  const [classGenderFilter, setClassGenderFilter] = useState<'ALL' | 'Male' | 'Female'>('ALL');
  const [classHealthFilter, setClassHealthFilter] = useState<'ALL' | 'FLAGGED'>('ALL');
  const [classAttendanceFilter, setClassAttendanceFilter] = useState<'ALL' | 'Present' | 'Absent' | 'Late'>('ALL');
  const [classPage, setClassPage] = useState(1);
  const [classPageSize, setClassPageSize] = useState(10);

  // My Account & Profile State
  const [accountSubTab, setAccountSubTab] = useState<'profile' | 'academic' | 'security'>('profile');
  const [teacherProfile, setTeacherProfile] = useState({
    firstName: user?.firstName || 'Priya',
    lastName: user?.lastName || 'Sharma',
    email: user?.email || 'priya.sharma@schoolerp.com',
    phoneNumber: user?.phoneNumber || '+91 98765 43210',
    qualification: user?.qualification || 'B.Ed, M.Sc Child Psychology',
    experienceYears: user?.experienceYears !== undefined ? user.experienceYears : 6,
    previousInstitutions: 'Delhi Public School (3.5 yrs), Little Blossoms Nursery (2.5 yrs)',
    designation: user?.designation || 'Class Teacher (LKG - Section A)',
    employeeId: user?.employeeId || 'GGPS-FAC-2024-042',
    joinDate: 'June 2022',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Management State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Forgot Password Modal State
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState(user?.email || 'priya.sharma@schoolerp.com');
  const [isSendingForgotReset, setIsSendingForgotReset] = useState(false);
  const [forgotSuccessNotice, setForgotSuccessNotice] = useState<{ message: string; pin?: string } | null>(null);

  // Notifications Hub State & Logic
  const [notifications, setNotifications] = useState<TeacherNotificationItem[]>(initialTeacherNotifications);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'UNREAD' | 'Urgent' | 'Academic' | 'Notice' | 'Event'>('ALL');
  const [notifSearch, setNotifSearch] = useState('');
  const [createNoticeModalOpen, setCreateNoticeModalOpen] = useState(false);
  const [newNoticeData, setNewNoticeData] = useState({
    title: '',
    message: '',
    category: 'Notice' as 'Urgent' | 'Notice' | 'Academic' | 'Event',
    targetAudience: 'Class LKG-A Parents & Staff',
  });

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (notifFilter === 'UNREAD' && n.isRead) return false;
      if (notifFilter !== 'ALL' && notifFilter !== 'UNREAD' && n.category !== notifFilter) return false;
      if (notifSearch.trim()) {
        const q = notifSearch.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      }
      return true;
    });
  }, [notifications, notifFilter, notifSearch]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    toast.success('Marked notification as read');
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read!');
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification dismissed');
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeData.title.trim() || !newNoticeData.message.trim()) {
      toast.error('Please enter title and announcement message');
      return;
    }

    const newNotice: TeacherNotificationItem = {
      id: `notif-${Date.now()}`,
      title: newNoticeData.title,
      message: newNoticeData.message,
      timestamp: 'Just now',
      isRead: false,
      category: newNoticeData.category,
      actionLabel: 'View in Classroom Diary',
      actionTab: 'CLASS WORK',
    };

    setNotifications((prev) => [newNotice, ...prev]);
    setCreateNoticeModalOpen(false);
    setNewNoticeData({
      title: '',
      message: '',
      category: 'Notice',
      targetAudience: 'Class LKG-A Parents & Staff',
    });
    toast.success('Class announcement published to parents and portal!');
  };

  // Leave Management State & Logic
  const [leaves, setLeaves] = useState<TeacherLeaveItem[]>(initialTeacherLeaves);
  const [leaveFilter, setLeaveFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'>('ALL');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [selectedLeaveDetail, setSelectedLeaveDetail] = useState<TeacherLeaveItem | null>(null);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  // New Leave Form State
  const [newLeaveForm, setNewLeaveForm] = useState({
    leaveType: 'Casual' as 'Casual' | 'Sick' | 'Earned' | 'Maternity' | 'Official Duty',
    sessionType: 'Full Day' as 'Full Day' | 'Half Day (Forenoon)' | 'Half Day (Afternoon)',
    startDate: '',
    endDate: '',
    substituteTeacher: 'Sunita Rao (Senior PRT - Hindi)',
    reason: '',
    attachmentName: '',
    emergencyContact: user?.phoneNumber || '+91 98765 43210',
  });

  const pendingLeavesCount = useMemo(
    () => leaves.filter((l) => l.status === 'Pending').length,
    [leaves]
  );

  // Leave Balances: Allotted vs Approved vs Pending vs Remaining
  const leaveStats = useMemo(() => {
    const quotas = {
      Casual: { total: 12, approved: 0, pending: 0 },
      Sick: { total: 7, approved: 0, pending: 0 },
      Earned: { total: 15, approved: 0, pending: 0 },
    };

    leaves.forEach((l) => {
      if (l.leaveType in quotas) {
        const key = l.leaveType as 'Casual' | 'Sick' | 'Earned';
        if (l.status === 'Approved') {
          quotas[key].approved += l.daysCount;
        } else if (l.status === 'Pending') {
          quotas[key].pending += l.daysCount;
        }
      }
    });

    return {
      casual: {
        total: quotas.Casual.total,
        used: quotas.Casual.approved,
        pending: quotas.Casual.pending,
        remaining: Math.max(0, quotas.Casual.total - quotas.Casual.approved),
      },
      sick: {
        total: quotas.Sick.total,
        used: quotas.Sick.approved,
        pending: quotas.Sick.pending,
        remaining: Math.max(0, quotas.Sick.total - quotas.Sick.approved),
      },
      earned: {
        total: quotas.Earned.total,
        used: quotas.Earned.approved,
        pending: quotas.Earned.pending,
        remaining: Math.max(0, quotas.Earned.total - quotas.Earned.approved),
      },
    };
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      if (leaveFilter !== 'ALL' && l.status !== leaveFilter) return false;
      if (leaveSearch.trim()) {
        const q = leaveSearch.toLowerCase();
        return (
          l.reason.toLowerCase().includes(q) ||
          l.leaveType.toLowerCase().includes(q) ||
          l.substituteTeacher.toLowerCase().includes(q) ||
          l.startDate.includes(q) ||
          l.endDate.includes(q)
        );
      }
      return true;
    });
  }, [leaves, leaveFilter, leaveSearch]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveForm.startDate || !newLeaveForm.endDate) {
      toast.error('Please select both start date and end date');
      return;
    }
    if (new Date(newLeaveForm.endDate) < new Date(newLeaveForm.startDate)) {
      toast.error('End date cannot precede start date');
      return;
    }
    if (!newLeaveForm.reason.trim() || newLeaveForm.reason.trim().length < 5) {
      toast.error('Please specify a detailed reason (minimum 5 characters)');
      return;
    }

    // Calculate duration
    const start = new Date(newLeaveForm.startDate);
    const end = new Date(newLeaveForm.endDate);
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const daysCount = newLeaveForm.sessionType.startsWith('Half Day') ? 0.5 : diffDays;

    setIsSubmittingLeave(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await authFetch(`${apiBase}/api/leaves`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          startDate: newLeaveForm.startDate,
          endDate: newLeaveForm.endDate,
          reason: newLeaveForm.reason,
          leaveType: newLeaveForm.leaveType,
          sessionType: newLeaveForm.sessionType,
          daysCount,
          substituteTeacher: newLeaveForm.substituteTeacher,
          attachmentName: newLeaveForm.attachmentName,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const formattedItem: TeacherLeaveItem = {
          id: created._id || `leave-${Date.now()}`,
          leaveType: newLeaveForm.leaveType,
          sessionType: newLeaveForm.sessionType,
          startDate: newLeaveForm.startDate,
          endDate: newLeaveForm.endDate,
          daysCount,
          reason: newLeaveForm.reason,
          substituteTeacher: newLeaveForm.substituteTeacher,
          substituteStatus: 'Pending',
          status: 'Pending',
          appliedOn: new Date().toISOString().split('T')[0],
          adminRemark: 'Forwarded to Principal & Academic Supervisor for review',
          attachmentName: newLeaveForm.attachmentName,
          emergencyContact: newLeaveForm.emergencyContact,
        };
        setLeaves((prev) => [formattedItem, ...prev]);
        toast.success('Leave application submitted! Supervisor & substitute teacher notified.');
      } else {
        throw new Error('API submission failed');
      }
    } catch (err) {
      // Local demo fallback
      const formattedItem: TeacherLeaveItem = {
        id: `leave-${Date.now()}`,
        leaveType: newLeaveForm.leaveType,
        sessionType: newLeaveForm.sessionType,
        startDate: newLeaveForm.startDate,
        endDate: newLeaveForm.endDate,
        daysCount,
        reason: newLeaveForm.reason,
        substituteTeacher: newLeaveForm.substituteTeacher,
        substituteStatus: 'Pending',
        status: 'Pending',
        appliedOn: new Date().toISOString().split('T')[0],
        adminRemark: 'Forwarded to Principal for sanction',
        attachmentName: newLeaveForm.attachmentName,
        emergencyContact: newLeaveForm.emergencyContact,
      };
      setLeaves((prev) => [formattedItem, ...prev]);
      toast.success('Leave application submitted successfully! (Saved in preview mode)');
    } finally {
      setIsSubmittingLeave(false);
      setIsApplyLeaveModalOpen(false);
      setNewLeaveForm({
        leaveType: 'Casual',
        sessionType: 'Full Day',
        startDate: '',
        endDate: '',
        substituteTeacher: 'Sunita Rao (Senior PRT - Hindi)',
        reason: '',
        attachmentName: '',
        emergencyContact: user?.phoneNumber || '+91 98765 43210',
      });
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      await authFetch(`${apiBase}/api/leaves/${leaveId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'Cancelled', adminRemark: 'Withdrawn by teacher before sanction' }),
      });
    } catch (err) {
      // preview fallback
    }

    setLeaves((prev) =>
      prev.map((l) =>
        l.id === leaveId
          ? { ...l, status: 'Cancelled', adminRemark: 'Withdrawn by teacher before sanction' }
          : l
      )
    );
    if (selectedLeaveDetail?.id === leaveId) {
      setSelectedLeaveDetail((prev) =>
        prev ? { ...prev, status: 'Cancelled', adminRemark: 'Withdrawn by teacher before sanction' } : null
      );
    }
    toast.success('Leave request has been withdrawn and cancelled.');
  };

  // Parent Directory & 1-on-1 Communication State
  const [parentThreads, setParentThreads] = useState<ParentMessageThread[]>(initialParentThreads);
  const [parentSearch, setParentSearch] = useState('');
  const [parentFilter, setParentFilter] = useState<'ALL' | 'UNREAD' | 'ABSENT' | 'PTM_CONFIRMED' | 'PTM_ACTION'>('ALL');
  const [selectedParentForChat, setSelectedParentForChat] = useState<ParentMessageThread | null>(null);
  const [chatReplyText, setChatReplyText] = useState('');

  // PTM Scheduling Modal & State
  const [isSchedulePTMModalOpen, setIsSchedulePTMModalOpen] = useState(false);
  const [selectedParentForPTM, setSelectedParentForPTM] = useState<ParentMessageThread | null>(null);
  const [ptmForm, setPtmForm] = useState({
    studentId: 'ALL',
    targetScope: 'ALL' as 'ALL' | 'INDIVIDUAL',
    date: '2026-09-26',
    timeSlot: '09:30 AM - 09:45 AM',
    mode: 'In-Person (Room 102)' as 'In-Person (Room 102)' | 'Online (Google Meet)',
    reason: 'Term 1 Diagnostic Progress & Foundational Phonics Evaluation',
    teacherNotes: 'Please bring child’s phonics workbook and term drawing portfolio.',
    status: 'Confirmed' as 'Confirmed' | 'Pending' | 'Declined' | 'Rescheduled',
    parentResponseNote: '',
  });

  // Class Broadcast Announcements State
  const [classBroadcasts, setClassBroadcasts] = useState<ClassBroadcastAnnouncement[]>(initialClassBroadcasts);
  const [broadcastForm, setBroadcastForm] = useState({
    audience: 'all' as 'all' | 'absent' | 'pending_ptm',
    category: 'General Circular' as 'General Circular' | 'Holiday Advisory' | 'Academic Alert' | 'Event Notice',
    priority: 'Standard' as 'Standard' | 'Urgent',
    title: '',
    message: '',
    sendPush: true,
    sendSms: true,
    sendEmail: false,
  });
  const [broadcastHistoryDrawerOpen, setBroadcastHistoryDrawerOpen] = useState(false);

  const unreadParentQueriesCount = useMemo(
    () => parentThreads.filter((pt) => pt.unreadCount > 0).length,
    [parentThreads]
  );

  const absentNotesCount = useMemo(
    () => parentThreads.filter((pt) => pt.hasAbsenceNoteToday).length,
    [parentThreads]
  );

  const ptmConfirmedCount = useMemo(
    () => parentThreads.filter((pt) => pt.ptmStatus === 'Confirmed').length,
    [parentThreads]
  );

  const ptmPendingCount = useMemo(
    () => parentThreads.filter((pt) => pt.ptmStatus === 'Pending').length,
    [parentThreads]
  );

  const ptmDeclinedCount = useMemo(
    () => parentThreads.filter((pt) => pt.ptmStatus === 'Declined').length,
    [parentThreads]
  );

  const ptmRescheduledCount = useMemo(
    () => parentThreads.filter((pt) => pt.ptmStatus === 'Rescheduled').length,
    [parentThreads]
  );

  const filteredParentThreads = useMemo(() => {
    return parentThreads.filter((pt) => {
      if (parentFilter === 'UNREAD' && pt.unreadCount === 0) return false;
      if (parentFilter === 'ABSENT' && !pt.hasAbsenceNoteToday) return false;
      if (parentFilter === 'PTM_CONFIRMED' && pt.ptmStatus !== 'Confirmed') return false;
      if (parentFilter === 'PTM_ACTION' && pt.ptmStatus !== 'Declined' && pt.ptmStatus !== 'Rescheduled' && pt.ptmStatus !== 'Pending') return false;
      if (parentSearch.trim()) {
        const q = parentSearch.toLowerCase();
        return (
          pt.parentName.toLowerCase().includes(q) ||
          pt.studentName.toLowerCase().includes(q) ||
          pt.rollNo.includes(q) ||
          pt.phone.includes(q) ||
          pt.lastMessage.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [parentThreads, parentFilter, parentSearch]);

  const [isParentTypingInModal, setIsParentTypingInModal] = useState(false);
  const teacherTypingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time socket message and typing listener for Teacher Workspace
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleIncomingMessage = (msg: any) => {
      const isFromParent = (msg.senderRole || msg.sender?.role || '').toLowerCase() === 'parent';
      const msgConvId = String(msg.conversationId || '');

      const newMsgItem: ParentMessageItem = {
        id: msg._id || msg.clientTempId || `msg-${Date.now()}`,
        sender: isFromParent ? 'Parent' : 'Teacher',
        text: msg.message || '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (selectedParentForChat && (msgConvId === selectedParentForChat.id || selectedParentForChat.id === '66789abcdef0123456789100')) {
        setSelectedParentForChat((prev) => {
          if (!prev) return null;
          const exists = prev.messages.some((m) => m.id === newMsgItem.id);
          if (exists) return prev;
          return {
            ...prev,
            lastMessage: msg.message,
            lastMessageTime: 'Just now',
            lastSender: isFromParent ? 'Parent' : 'Teacher',
            messages: [...prev.messages, newMsgItem],
          };
        });
      }

      setParentThreads((prev) =>
        prev.map((pt) => {
          if (pt.id === msgConvId || pt.id === '66789abcdef0123456789100') {
            return {
              ...pt,
              lastMessage: msg.message,
              lastMessageTime: 'Just now',
              lastSender: isFromParent ? 'Parent' : 'Teacher',
              unreadCount: selectedParentForChat && selectedParentForChat.id === pt.id ? 0 : pt.unreadCount + (isFromParent ? 1 : 0),
            };
          }
          return pt;
        })
      );
    };

    const handleTypingStart = (data: any) => {
      if (selectedParentForChat && (String(data.conversationId) === selectedParentForChat.id || selectedParentForChat.id === '66789abcdef0123456789100')) {
        setIsParentTypingInModal(true);
      }
    };

    const handleTypingStop = (data: any) => {
      if (selectedParentForChat && (String(data.conversationId) === selectedParentForChat.id || selectedParentForChat.id === '66789abcdef0123456789100')) {
        setIsParentTypingInModal(false);
      }
    };

    socket.on('chat:message:new', handleIncomingMessage);
    socket.on('message:new', handleIncomingMessage);
    socket.on('chat:typing:start', handleTypingStart);
    socket.on('typing:start', handleTypingStart);
    socket.on('chat:typing:stop', handleTypingStop);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('chat:message:new', handleIncomingMessage);
      socket.off('message:new', handleIncomingMessage);
      socket.off('chat:typing:start', handleTypingStart);
      socket.off('typing:start', handleTypingStart);
      socket.off('chat:typing:stop', handleTypingStop);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [selectedParentForChat]);

  const handleOpenDirectChat = (thread: ParentMessageThread) => {
    setParentThreads((prev) =>
      prev.map((pt) => (pt.id === thread.id ? { ...pt, unreadCount: 0 } : pt))
    );
    setSelectedParentForChat({ ...thread, unreadCount: 0 });
    setChatReplyText('');

    // Join real-time room
    joinRoom(`conversation:${thread.id}`);

    // Fetch live messages from API
    try {
      const apiBase = getApiBaseUrl();
      authFetch(`${apiBase}/api/v1/messages?conversationId=${thread.id}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: ParentMessageItem[] = json.data.map((m: any) => ({
              id: m._id || m.clientTempId || `msg-${Date.now()}`,
              sender: (m.senderRole || m.sender?.role || '').toLowerCase() === 'teacher' ? 'Teacher' : 'Parent',
              text: m.message,
              timestamp: m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now',
            }));
            setSelectedParentForChat((prev) => (prev ? { ...prev, messages: mapped } : null));

            // Mark read on server
            authFetch(`${apiBase}/api/v1/messages/read`, {
              method: 'PATCH',
              credentials: 'include',
              headers: getAuthHeaders(),
              body: JSON.stringify({ conversationId: thread.id }),
            }).catch(() => {});
          }
        })
        .catch((err) => console.warn('Messages load notice:', err));
    } catch (e) {
      console.warn('API error:', e);
    }
  };

  const handleTeacherChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatReplyText(e.target.value);
    const socket = getSocket();
    if (socket && selectedParentForChat) {
      socket.emit('chat:typing:start', { conversationId: selectedParentForChat.id });
      if (teacherTypingTimerRef.current) clearTimeout(teacherTypingTimerRef.current);
      teacherTypingTimerRef.current = setTimeout(() => {
        socket.emit('chat:typing:stop', { conversationId: selectedParentForChat.id });
      }, 2000);
    }
  };

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReplyText.trim() || !selectedParentForChat) return;

    const textToSend = chatReplyText.trim();
    const clientTempId = `msg-${Date.now()}`;
    const newMessage: ParentMessageItem = {
      id: clientTempId,
      sender: 'Teacher',
      text: textToSend,
      timestamp: 'Just now',
    };

    const updatedThread: ParentMessageThread = {
      ...selectedParentForChat,
      lastMessage: textToSend,
      lastMessageTime: 'Just now',
      lastSender: 'Teacher',
      unreadCount: 0,
      messages: [...selectedParentForChat.messages, newMessage],
    };

    setParentThreads((prev) =>
      prev.map((pt) => (pt.id === selectedParentForChat.id ? updatedThread : pt))
    );
    setSelectedParentForChat(updatedThread);
    setChatReplyText('');

    // Stop typing
    const socket = getSocket();
    if (socket) {
      socket.emit('chat:typing:stop', { conversationId: selectedParentForChat.id });
    }

    // Call real backend API
    const apiBase = getApiBaseUrl();
    authFetch(`${apiBase}/api/v1/messages`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        conversationId: selectedParentForChat.id,
        message: textToSend,
        clientTempId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSelectedParentForChat((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === clientTempId
                  ? {
                      ...m,
                      id: data.data._id,
                      timestamp: new Date(data.data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }
                  : m
              ),
            };
          });
        }
      })
      .catch((err) => console.error('Error sending message:', err));

    toast.success(`Message sent to ${selectedParentForChat.parentName} via Parent Portal!`);
  };

  const handleSendQuickCanned = (cannedText: string) => {
    if (!selectedParentForChat) return;
    const clientTempId = `msg-${Date.now()}`;
    const newMessage: ParentMessageItem = {
      id: clientTempId,
      sender: 'Teacher',
      text: cannedText,
      timestamp: 'Just now',
    };

    const updatedThread: ParentMessageThread = {
      ...selectedParentForChat,
      lastMessage: cannedText,
      lastMessageTime: 'Just now',
      lastSender: 'Teacher',
      unreadCount: 0,
      messages: [...selectedParentForChat.messages, newMessage],
    };

    setParentThreads((prev) =>
      prev.map((pt) => (pt.id === selectedParentForChat.id ? updatedThread : pt))
    );
    setSelectedParentForChat(updatedThread);

    // Call real backend API
    const apiBase = getApiBaseUrl();
    authFetch(`${apiBase}/api/v1/messages`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        conversationId: selectedParentForChat.id,
        message: cannedText,
        clientTempId,
      }),
    }).catch(() => {});

    toast.success(`Quick response dispatched to ${selectedParentForChat.parentName}!`);
  };

  // Simulate Incoming Parent Reply -> Automatically triggers Teacher Notification!
  const handleSimulateParentReply = (threadId: string, customReply?: string) => {
    const targetThread = parentThreads.find((pt) => pt.id === threadId);
    if (!targetThread) return;

    const sampleReplies = [
      `Thank you Ma'am, noted! We will practice the phonics tracing tonight at home.`,
      `Understood Mrs. Sharma. Could you please also keep an eye on his lunchbox during break?`,
      `Thank you for the update! Looking forward to meeting you at the PTM conference.`,
      `Noted Ma'am. I have also submitted the doctor's slip in the portal attachments.`,
    ];
    const replyText = customReply || sampleReplies[Math.floor(Math.random() * sampleReplies.length)];

    const incomingMsg: ParentMessageItem = {
      id: `p-msg-${Date.now()}`,
      sender: 'Parent',
      text: replyText,
      timestamp: 'Just now',
    };

    const updatedThread: ParentMessageThread = {
      ...targetThread,
      lastMessage: replyText,
      lastMessageTime: 'Just now',
      lastSender: 'Parent',
      unreadCount: (targetThread.unreadCount || 0) + 1,
      messages: [...targetThread.messages, incomingMsg],
    };

    setParentThreads((prev) =>
      prev.map((pt) => (pt.id === threadId ? updatedThread : pt))
    );
    if (selectedParentForChat?.id === threadId) {
      setSelectedParentForChat(updatedThread);
    }

    // Injects an immediate high-priority Notification into Teacher's Hub
    const newNotif: TeacherNotificationItem = {
      id: `notif-reply-${Date.now()}`,
      title: `New Message from ${targetThread.parentName} (${targetThread.parentLabel} of ${targetThread.studentName})`,
      message: `"${replyText}"`,
      timestamp: 'Just now',
      isRead: false,
      category: 'Urgent',
      actionLabel: 'Open Consultation',
      actionTab: 'PARENTS',
      actionPayload: { parentThreadId: targetThread.id },
    };

    setNotifications((prev) => [newNotif, ...prev]);
    toast.success(`🔔 New reply from ${targetThread.parentName}! Notification added to your Hub.`, {
      duration: 3500,
    });
  };

  // PTM Scheduling Handler
  const handleOpenSchedulePTM = (thread?: ParentMessageThread | null) => {
    if (thread) {
      setSelectedParentForPTM(thread);
      setPtmForm({
        studentId: thread.studentId,
        targetScope: 'INDIVIDUAL',
        date: thread.ptmDate || '2026-09-26',
        timeSlot: thread.ptmTime || thread.ptmSlot?.split(' • ')[1] || '09:30 AM - 09:45 AM',
        mode: thread.ptmMode || 'In-Person (Room 102)',
        reason: thread.ptmReason || 'Term 1 Diagnostic Progress & Foundational Phonics Evaluation',
        teacherNotes: thread.ptmNotes || 'Please bring student activity workbook and term art portfolio.',
        status: thread.ptmStatus || 'Confirmed',
        parentResponseNote: thread.ptmParentNote || '',
      });
    } else {
      setSelectedParentForPTM(null);
      setPtmForm({
        studentId: 'ALL',
        targetScope: 'ALL',
        date: '2026-09-26',
        timeSlot: '09:30 AM - 09:45 AM',
        mode: 'In-Person (Room 102)',
        reason: 'Term 1 Diagnostic Progress & Foundational Phonics Evaluation',
        teacherNotes: 'Please bring student coloring workbook and phonics practice sheets.',
        status: 'Confirmed',
        parentResponseNote: '',
      });
    }
    setIsSchedulePTMModalOpen(true);
  };

  const handleSavePTMSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedSlot = `${ptmForm.date} • ${ptmForm.timeSlot}`;

    if (!selectedParentForPTM || ptmForm.targetScope === 'ALL') {
      // Apply PTM configuration across ALL students in the class
      setParentThreads((prev) =>
        prev.map((pt) => ({
          ...pt,
          ptmSlot: formattedSlot,
          ptmDate: ptmForm.date,
          ptmTime: ptmForm.timeSlot,
          ptmMode: ptmForm.mode,
          ptmReason: ptmForm.reason,
          ptmNotes: ptmForm.teacherNotes,
          ptmStatus: ptmForm.status,
          ptmParentNote: ptmForm.parentResponseNote || pt.ptmParentNote,
          ptmConfirmedAt: ptmForm.status === 'Confirmed' ? 'Scheduled by Teacher' : undefined,
        }))
      );
      if (selectedParentForChat) {
        setSelectedParentForChat((prev) =>
          prev
            ? {
                ...prev,
                ptmSlot: formattedSlot,
                ptmDate: ptmForm.date,
                ptmTime: ptmForm.timeSlot,
                ptmMode: ptmForm.mode,
                ptmReason: ptmForm.reason,
                ptmNotes: ptmForm.teacherNotes,
                ptmStatus: ptmForm.status,
                ptmParentNote: ptmForm.parentResponseNote || prev.ptmParentNote,
                ptmConfirmedAt: ptmForm.status === 'Confirmed' ? 'Scheduled by Teacher' : undefined,
              }
            : null
        );
      }

      setIsSchedulePTMModalOpen(false);
      toast.success(`PTM slot configured for all ${parentThreads.length} students! Invitations dispatched to all parents.`);
      return;
    }

    // Apply PTM configuration to individual selected student
    const updatedThread: ParentMessageThread = {
      ...selectedParentForPTM,
      ptmSlot: formattedSlot,
      ptmDate: ptmForm.date,
      ptmTime: ptmForm.timeSlot,
      ptmMode: ptmForm.mode,
      ptmReason: ptmForm.reason,
      ptmNotes: ptmForm.teacherNotes,
      ptmStatus: ptmForm.status,
      ptmParentNote: ptmForm.parentResponseNote,
      ptmConfirmedAt: ptmForm.status === 'Confirmed' ? 'Scheduled by Teacher' : undefined,
    };

    setParentThreads((prev) =>
      prev.map((pt) => (pt.id === selectedParentForPTM.id ? updatedThread : pt))
    );
    if (selectedParentForChat?.id === selectedParentForPTM.id) {
      setSelectedParentForChat(updatedThread);
    }

    setIsSchedulePTMModalOpen(false);
    toast.success(`PTM slot for ${selectedParentForPTM.studentName} updated! Invitation sent to ${selectedParentForPTM.parentName}.`);
  };

  // Simulate Parent Confirming, Declining, or Requesting Reschedule
  const handleSimulateParentPTMResponse = (
    threadId: string,
    responseType: 'Confirm' | 'Decline' | 'Reschedule',
    customNote?: string
  ) => {
    const target = parentThreads.find((pt) => pt.id === threadId);
    if (!target) return;

    let newStatus: 'Confirmed' | 'Declined' | 'Rescheduled' = 'Confirmed';
    let parentNote = '';

    if (responseType === 'Confirm') {
      newStatus = 'Confirmed';
      parentNote = 'Guardian confirmed attendance via Parent Portal app.';
    } else if (responseType === 'Decline') {
      newStatus = 'Declined';
      parentNote = customNote || 'Parent is out of station on Saturday. Requested leave of absence.';
    } else {
      newStatus = 'Rescheduled';
      parentNote = customNote || 'Parent requested alternate slot after 02:00 PM due to work commitments.';
    }

    const updated: ParentMessageThread = {
      ...target,
      ptmStatus: newStatus,
      ptmParentNote: parentNote,
      ptmConfirmedAt: responseType === 'Confirm' ? 'Just now' : undefined,
    };

    setParentThreads((prev) =>
      prev.map((pt) => (pt.id === threadId ? updated : pt))
    );
    if (selectedParentForChat?.id === threadId) {
      setSelectedParentForChat(updated);
    }

    // Raise notification to teacher if declined or rescheduled
    if (responseType !== 'Confirm') {
      const notifItem: TeacherNotificationItem = {
        id: `notif-ptm-${Date.now()}`,
        title: `PTM ${responseType === 'Decline' ? 'Declined' : 'Reschedule Requested'} by ${target.parentName}`,
        message: `${target.parentName} (${target.studentName}'s ${target.parentLabel}): "${parentNote}"`,
        timestamp: 'Just now',
        isRead: false,
        category: 'Urgent',
        actionLabel: 'Reschedule Slot',
        actionTab: 'PARENTS',
        actionPayload: { parentThreadId: target.id },
      };
      setNotifications((prev) => [notifItem, ...prev]);
      toast.error(`Parent ${responseType === 'Decline' ? 'declined' : 'requested reschedule for'} PTM! Notification logged.`);
    } else {
      toast.success(`PTM confirmed by ${target.parentName}!`);
    }
  };

  // One-Shot Class Broadcast Announcement to All Parents
  const handleSendBroadcastMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      toast.error('Please enter announcement subject and message');
      return;
    }

    // Determine target parents
    let targetList = parentThreads;
    let recipientLabel = `All Class LKG-A Parents (${parentThreads.length})`;
    if (broadcastForm.audience === 'absent') {
      targetList = parentThreads.filter((p) => p.hasAbsenceNoteToday);
      recipientLabel = `Absent Children Parents (${targetList.length})`;
    } else if (broadcastForm.audience === 'pending_ptm') {
      targetList = parentThreads.filter((p) => p.ptmStatus !== 'Confirmed');
      recipientLabel = `Pending PTM Parents (${targetList.length})`;
    }

    const targetIds = new Set(targetList.map((p) => p.id));

    // Create broadcast item to append to each parent's chat thread
    const broadcastChatItem: ParentMessageItem = {
      id: `bc-msg-${Date.now()}`,
      sender: 'Teacher',
      text: `📢 [OFFICIAL CLASS ANNOUNCEMENT: ${broadcastForm.title.toUpperCase()}]\n${broadcastForm.message}`,
      timestamp: 'Just now',
    };

    setParentThreads((prev) =>
      prev.map((pt) => {
        if (targetIds.has(pt.id)) {
          return {
            ...pt,
            lastMessage: `📢 ${broadcastForm.title}: ${broadcastForm.message.slice(0, 50)}...`,
            lastMessageTime: 'Just now',
            lastSender: 'Teacher',
            messages: [...pt.messages, broadcastChatItem],
          };
        }
        return pt;
      })
    );

    if (selectedParentForChat && targetIds.has(selectedParentForChat.id)) {
      setSelectedParentForChat((prev) =>
        prev
          ? {
            ...prev,
            lastMessage: `📢 ${broadcastForm.title}: ${broadcastForm.message.slice(0, 50)}...`,
            lastMessageTime: 'Just now',
            lastSender: 'Teacher',
            messages: [...prev.messages, broadcastChatItem],
          }
          : null
      );
    }

    // Add to Class Broadcasts ledger
    const newBroadcast: ClassBroadcastAnnouncement = {
      id: `bc-${Date.now()}`,
      title: broadcastForm.title,
      message: broadcastForm.message,
      category: broadcastForm.category,
      priority: broadcastForm.priority,
      targetAudience: recipientLabel,
      recipientCount: targetList.length,
      sentAt: 'Just now',
      channels: [
        broadcastForm.sendPush ? 'App Push' : null,
        broadcastForm.sendSms ? 'SMS' : null,
        broadcastForm.sendEmail ? 'Email' : null,
      ].filter(Boolean) as any,
      deliveryRate: `100% Dispatched (${targetList.length}/${targetList.length})`,
      readRate: 'Sent Just Now',
    };

    setClassBroadcasts((prev) => [newBroadcast, ...prev]);

    // Dispatch confirmation to Teacher Notifications
    const confirmNotif: TeacherNotificationItem = {
      id: `notif-bc-${Date.now()}`,
      title: `Broadcast Dispatched: ${broadcastForm.title}`,
      message: `Official circular sent to ${targetList.length} parents via App Push & SMS.`,
      timestamp: 'Just now',
      isRead: false,
      category: 'Notice',
      actionLabel: 'View Parents Hub',
      actionTab: 'PARENTS',
    };
    setNotifications((prev) => [confirmNotif, ...prev]);

    setMessageParentDrawerOpen(false);
    setBroadcastForm({
      audience: 'all',
      category: 'General Circular',
      priority: 'Standard',
      title: '',
      message: '',
      sendPush: true,
      sendSms: true,
      sendEmail: false,
    });

    toast.success(`🚀 Broadcast dispatched to ${targetList.length} families via Mobile App & SMS!`);
  };

  // Sync profile when user prop updates
  const [prevUser, setPrevUser] = useState(user);
  if (user && user !== prevUser) {
    setPrevUser(user);
    setTeacherProfile((prev) => ({
      ...prev,
      firstName: user.firstName || prev.firstName,
      lastName: user.lastName || prev.lastName,
      email: user.email || prev.email,
      phoneNumber: user.phoneNumber || prev.phoneNumber,
      qualification: user.qualification || prev.qualification,
      experienceYears: user.experienceYears !== undefined ? user.experienceYears : prev.experienceYears,
      designation: user.designation || prev.designation,
    }));
    setForgotEmail(user.email || 'priya.sharma@schoolerp.com');
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const first = teacherProfile.firstName?.trim();
    const last = teacherProfile.lastName?.trim();
    if (!first) {
      toast.error('Please enter your first name.');
      return;
    }
    if (!NAME_REGEX.test(first)) {
      toast.error('First name can only contain letters, spaces, hyphens, apostrophes, and periods.');
      return;
    }
    if (last && !NAME_REGEX.test(last)) {
      toast.error('Last name can only contain letters, spaces, hyphens, apostrophes, and periods.');
      return;
    }
    const cleanedPhone = teacherProfile.phoneNumber ? sanitizePhoneInput(teacherProfile.phoneNumber) : '';
    if (cleanedPhone && !TEN_DIGIT_PHONE_REGEX.test(cleanedPhone)) {
      toast.error('Phone number must be a valid 10-digit number.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await authFetch(`${apiBase}/api/auth/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          firstName: first,
          lastName: last,
          phoneNumber: cleanedPhone,
          qualification: teacherProfile.qualification,
          experienceYears: teacherProfile.experienceYears,
          designation: teacherProfile.designation,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || 'Profile updated successfully!');
        setIsEditingProfile(false);
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.success('Profile changes saved in preview mode!');
      setIsEditingProfile(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await authFetch(`${apiBase}/api/auth/change-password`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Network error. Unable to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = forgotEmail?.trim().toLowerCase();
    if (!trimmedEmail) {
      toast.error('Please enter your registered email address');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSendingForgotReset(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await authFetch(`${apiBase}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setForgotSuccessNotice({
          message: data.message || 'Password reset instructions have been dispatched!',
          pin: data.demoResetPin,
        });
        toast.success('Password reset instructions sent!');
      } else {
        toast.error(data.message || 'Unable to process reset request');
      }
    } catch (error) {
      setForgotSuccessNotice({
        message: `Password reset verification code dispatched to ${forgotEmail}.`,
        pin: '849201',
      });
      toast.success('Reset instructions sent to your email!');
    } finally {
      setIsSendingForgotReset(false);
    }
  };

  // Header & Theme
  const { theme, toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const apiBase = getApiBaseUrl();
      await authFetch(`${apiBase}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Teacher logout notice:', e);
    } finally {
      useAuthStore.getState().logout();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenEditStudent = (student: StudentCardData) => {
    setEditFormData({ ...student });
    setIsEditStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;
    const trimmedName = editFormData.name?.trim();
    if (!trimmedName || !NAME_REGEX.test(trimmedName)) {
      toast.error('Child name must only contain letters, spaces, hyphens, apostrophes, and periods.');
      return;
    }
    if (!editFormData.rollNo?.trim()) {
      toast.error('Roll number is required.');
      return;
    }
    if (editFormData.phone) {
      const cleanedPhone = sanitizePhoneInput(editFormData.phone);
      if (cleanedPhone && !TEN_DIGIT_PHONE_REGEX.test(cleanedPhone)) {
        toast.error('Parent contact phone must be a valid 10-digit number.');
        return;
      }
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === editFormData.id ? { ...editFormData, name: trimmedName } : s))
    );
    if (selectedStudent?.id === editFormData.id) {
      setSelectedStudent({ ...editFormData, name: trimmedName });
    }
    setIsEditStudentModalOpen(false);
    toast.success(`Updated details for "${trimmedName}" (Roll #${editFormData.rollNo}) successfully!`);
    setEditFormData(null);
  };

  const handleChildEnrolled = (newChild: any) => {
    const formattedStudent: StudentCardData = {
      id: newChild.id || `s-${Date.now()}`,
      rollNo: newChild.rollNo,
      admissionNo: newChild.admissionNo,
      name: newChild.name,
      photo: newChild.photo || (newChild.gender === 'Female'
        ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80'),
      status: 'Present',
      age: newChild.age || '4 years 2 months',
      dob: newChild.dob || '2022-07-15',
      gender: newChild.gender || 'Male',
      bloodGroup: newChild.bloodGroup || 'O+',
      allergies: newChild.allergies || 'None (All clear)',
      dietaryNote: newChild.dietaryNote || 'Regular',
      address: newChild.address || 'Classroom Local Resident',
      parentLabel: newChild.parentLabel || 'Parent',
      parentName: newChild.parentName || 'Guardian',
      phone: newChild.phone || '+91 98765 00000',
      emergencyContactName: newChild.parentName || 'Emergency Contact',
      emergencyContactPhone: newChild.phone || '+91 98112 34567',
      authorizedPickupPerson: newChild.authorizedPickupPerson || newChild.parentName || 'Primary Guardian',
      authorizedPickupRelation: 'Guardian',
      attendanceRate: 100
    };

    setStudents((prev) => [formattedStudent, ...prev]);
  };

  const handleExportClassRosterCSV = () => {
    const headers = [
      'Roll No',
      'Admission ID',
      'Full Name',
      'Gender',
      'Age',
      'Date of Birth',
      'Blood Group',
      'Medical & Allergies',
      'Dietary Notes',
      'Residential Address',
      'Primary Parent',
      'Relation',
      'Contact Phone',
      'Emergency Contact',
      'Emergency Phone',
      'Authorized Pickup',
      'Authorized Relation',
      'Attendance %',
      'Status'
    ];

    const rows = students.map((s) => [
      `"${s.rollNo}"`,
      `"${s.admissionNo || 'GGSP-2024-LKG-' + s.rollNo}"`,
      `"${s.name}"`,
      `"${s.gender}"`,
      `"${s.age}"`,
      `"${s.dob || 'N/A'}"`,
      `"${s.bloodGroup || 'O+'}"`,
      `"${(s.allergies || 'None').replace(/"/g, '""')}"`,
      `"${(s.dietaryNote || 'Regular').replace(/"/g, '""')}"`,
      `"${(s.address || 'N/A').replace(/"/g, '""')}"`,
      `"${s.parentName}"`,
      `"${s.parentLabel}"`,
      `"${s.phone}"`,
      `"${s.emergencyContactName || 'N/A'}"`,
      `"${s.emergencyContactPhone || 'N/A'}"`,
      `"${s.authorizedPickupPerson || s.parentName}"`,
      `"${s.authorizedPickupRelation || s.parentLabel}"`,
      `"${s.attendanceRate}%"`,
      `"${s.status}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'GGPS_Roll_Call_Roster_LKG_A_2026-2027.csv';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 300);
    toast.success('Roll-call roster CSV exported successfully!');
  };

  const handlePrintClassRoster = () => {
    setIsRosterModalOpen(true);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (classGenderFilter !== 'ALL' && s.gender !== classGenderFilter) return false;
      if (classHealthFilter === 'FLAGGED' && (!s.allergies || s.allergies.includes('None') || s.allergies.includes('All clear'))) return false;
      if (classAttendanceFilter !== 'ALL' && s.status !== classAttendanceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesRoll = s.rollNo.toLowerCase().includes(q);
        const matchesParent = s.parentName.toLowerCase().includes(q);
        const matchesAdmission = (s.admissionNo || '').toLowerCase().includes(q);
        const matchesAddress = (s.address || '').toLowerCase().includes(q);
        const matchesBlood = (s.bloodGroup || '').toLowerCase().includes(q);
        return matchesName || matchesRoll || matchesParent || matchesAdmission || matchesAddress || matchesBlood;
      }
      return true;
    });
  }, [students, searchQuery, classGenderFilter, classHealthFilter, classAttendanceFilter]);

  const totalClassPages = Math.max(1, Math.ceil(filteredStudents.length / classPageSize));
  const paginatedStudents = useMemo(() => {
    const start = (classPage - 1) * classPageSize;
    return filteredStudents.slice(start, start + classPageSize);
  }, [filteredStudents, classPage, classPageSize]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F6F8FC] dark:bg-[#0B132B] text-slate-800 dark:text-slate-100 font-saas selection:bg-blue-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. MOBILE SIDEBAR DRAWER (ON SMALL SCREENS)                              */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-64 max-w-[82vw] h-full bg-[#0B132B] text-slate-300 flex flex-col justify-between p-4 z-10 shadow-2xl overflow-y-auto custom-scrollbar"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between px-1 pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3157D5] to-[#6366F1] flex items-center justify-center text-white shadow-md">
                      <span className="text-lg">🎓</span>
                    </div>
                    <div className="leading-tight">
                      <span className="text-sm font-black tracking-wide text-white block">GGPS</span>
                      <span className="text-[10px] font-semibold text-[#818CF8] tracking-wider block">School ERP</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {sidebarNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id ||
                      (item.id === 'CLASSROOM' && (activeTab === 'MY CLASS' || activeTab === 'CLASS WORK' || activeTab === 'LESSON PLAN' || (activeTab as any) === 'ACTIVITIES')) ||
                      (item.id === 'MARKS & EVALUATION' && (activeTab === 'ASSESSMENT' || activeTab === 'EXAMS & MARKS')) ||
                      (item.id === 'LEAVE & PROFILE' && (activeTab === 'LEAVE' || activeTab === 'MY ACCOUNT'));
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          handleNavigateTab(item.id as TeacherTab);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                            ? 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-md shadow-blue-600/30 font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {(() => {
                          const isLeaveBadge = item.id === 'LEAVE' || item.id === 'LEAVE & PROFILE';
                          const badgeVal = item.id === 'NOTIFICATIONS' ? unreadNotificationsCount : isLeaveBadge ? pendingLeavesCount : item.badge;
                          if (badgeVal && badgeVal > 0) {
                            return (
                              <span className={`${isLeaveBadge ? 'bg-[#FF690C]' : 'bg-rose-500'} text-white text-[10px] font-black px-1.5 py-0.2 rounded-full`}>
                                {badgeVal}
                              </span>
                            );
                          }
                          if (item.hasChevron && !isActive) {
                            return <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
                          }
                          return null;
                        })()}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 pb-1 text-center select-none pointer-events-none">
                <p className="font-serif italic text-slate-300 text-xs tracking-wider font-medium">
                  Better Learning<br />Brighter Future
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. PERMANENT DESKTOP DARK LEFT SIDEBAR (COLLAPSIBLE 260px <-> 82px)        */}
      {/* ========================================================================= */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 82 : 260 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex flex-col justify-between shrink-0 bg-[#0B132B] text-slate-300 p-3 h-screen border-r border-slate-800/80 select-none overflow-y-auto custom-scrollbar z-40"
      >
        {/* Top Branding & Collapse Button */}
        <div className="space-y-4">
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-2 pt-1 pb-2 border-b border-slate-800/80">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3157D5] to-[#6366F1] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0"
                title="GGPS School ERP"
              >
                <span className="text-xl">🎓</span>
              </div>

              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3157D5] to-[#6366F1] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                  <span className="text-xl">🎓</span>
                </div>
                <div className="leading-tight truncate">
                  <span className="text-base font-black tracking-wide text-white block">GGPS</span>
                  <span className="text-[11px] font-semibold text-[#818CF8] tracking-wider block">School ERP</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id ||
                (item.id === 'CLASSROOM' && (activeTab === 'MY CLASS' || activeTab === 'CLASS WORK' || activeTab === 'LESSON PLAN' || (activeTab as any) === 'ACTIVITIES')) ||
                (item.id === 'MARKS & EVALUATION' && (activeTab === 'ASSESSMENT' || activeTab === 'EXAMS & MARKS')) ||
                (item.id === 'LEAVE & PROFILE' && (activeTab === 'LEAVE' || activeTab === 'MY ACCOUNT'));
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateTab(item.id as TeacherTab)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3.5 py-2"
                    } rounded-xl text-xs font-semibold transition-all cursor-pointer relative group ${isActive
                      ? "bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-md shadow-blue-600/30 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"} min-w-0`}>
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                        }`}
                    />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isSidebarCollapsed && (
                    (() => {
                      const isLeaveBadge = item.id === 'LEAVE' || item.id === 'LEAVE & PROFILE';
                      const badgeVal = item.id === 'NOTIFICATIONS' ? unreadNotificationsCount : isLeaveBadge ? pendingLeavesCount : item.badge;
                      if (badgeVal && badgeVal > 0) {
                        return (
                          <span className={`${isLeaveBadge ? 'bg-[#FF690C]' : 'bg-rose-500'} text-white text-[10px] font-black px-1.5 py-0.2 rounded-full`}>
                            {badgeVal}
                          </span>
                        );
                      }
                      if (item.hasChevron && !isActive) {
                        return <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
                      }
                      return null;
                    })()
                  )}

                  {/* Collapsed Tooltip */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#172033] text-white text-xs font-bold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Artwork & Mini Profile */}
        <div className="pt-4 border-t border-slate-800/80">
          {!isSidebarCollapsed ? (
            <div>
              {/* Artwork */}
              <div className="relative mx-auto w-24 h-18 flex flex-col items-center justify-end select-none pointer-events-none mb-3">
                <div className="absolute top-0 right-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-sky-400 rotate-12">
                    <path
                      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="absolute top-1 z-10 flex items-center justify-center">
                  <svg width="20" height="24" viewBox="0 0 24 28" fill="none">
                    <path d="M12 28V12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M12 14C8 9 3 11 3 16C3 21 10 19 12 16" fill="#34D399" />
                    <path d="M12 11C16 6 21 8 21 13C21 18 14 16 12 13" fill="#10B981" />
                  </svg>
                </div>
                <div className="flex flex-col items-center gap-0.5 w-16">
                  <div className="w-10 h-2 rounded-xs bg-[#F59E0B]" />
                  <div className="w-12 h-2 rounded-xs bg-[#EF4444]" />
                  <div className="w-14 h-2 rounded-xs bg-[#3B82F6]" />
                  <div className="w-16 h-2 rounded-xs bg-[#10B981]" />
                </div>
              </div>
              <p className="font-serif italic text-slate-300 text-[11px] tracking-wider text-center font-medium leading-tight mb-3">
                Better Learning<br />Brighter Future
              </p>

              {/* Teacher Mini Profile */}
              <div className="p-2 rounded-2xl bg-white/5 flex items-center justify-between gap-2 border border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <AppImage
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                    alt="Teacher"
                    fallbackType="avatar"
                    name="Priya Sharma"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-400/40 shrink-0"
                  />
                  <div className="truncate leading-tight">
                    <span className="text-xs font-bold text-white block truncate">Priya Sharma</span>
                    <span className="text-[10px] text-blue-400 block truncate">LKG - Section A</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <AppImage
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                alt="Teacher"
                fallbackType="avatar"
                name="Priya Sharma"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
                title="Priya Sharma (LKG - Section A)"
              />
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ========================================================================= */}
      {/* 3. RIGHT CONTENT PANE: TOP HEADER + MAIN CONTENT                          */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Top Header */}
        <header className="h-16 shrink-0 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-2xs z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 md:hidden rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation on Desktop */}
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold">GGPS</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400 font-medium">Classroom</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-[#0050CB] dark:text-blue-400 bg-[#E5EEFF] dark:bg-blue-950/40 px-2.5 py-0.5 rounded-md">
                {(() => {
                  if (activeTab === 'CLASSROOM' || activeTab === 'MY CLASS' || activeTab === 'CLASS WORK' || activeTab === 'LESSON PLAN') {
                    return `Classroom · ${classroomSubTab === 'ROSTER' ? 'Student Roster' : classroomSubTab === 'CLASS WORK' ? 'Class Work & Activities' : 'Lesson Plans'}`;
                  }
                  if (activeTab === 'MARKS & EVALUATION' || activeTab === 'ASSESSMENT' || activeTab === 'EXAMS & MARKS') {
                    return `Marks & Evaluation · ${marksSubTab === 'ASSESSMENT' ? 'Formative Rubrics' : 'Term Exams'}`;
                  }
                  if (activeTab === 'LEAVE & PROFILE' || activeTab === 'LEAVE' || activeTab === 'MY ACCOUNT') {
                    return `My Leave & Profile · ${leaveProfileSubTab === 'LEAVE' ? 'Leave Applications' : 'Account & Settings'}`;
                  }
                  if (activeTab === 'PARENTS') return 'Parents & PTM';
                  return activeTab;
                })()}
              </span>
            </div>

            {/* Global Search Box with ⌘ K */}
            <div
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center justify-between w-52 sm:w-80 lg:w-96 h-9 px-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl text-xs text-slate-500 dark:text-slate-400 cursor-pointer border border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-200/60 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Search children, activities, homework, reports...</span>
              </div>
              <kbd className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-2xs shrink-0">
                ⌘ K
              </kbd>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <NotificationDrawer onNavigateTab={(tab) => handleNavigateTab(tab as any)} />
            </div>

            {/* Chat Bubble with Badge */}
            <Link
              href="/dashboard/chat"
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Messages"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-xs">
                2
              </span>
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Teacher Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <AppImage
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                  alt="Teacher"
                  fallbackType="avatar"
                  name="Priya Sharma"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
                />
                <div className="text-left leading-tight hidden sm:block">
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">Priya Sharma</span>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block">LKG - Section A</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Priya Sharma</p>
                    <p className="text-[10px] text-slate-400">teacher@school.com</p>
                  </div>
                  <div className="py-1 text-xs font-semibold">
                    <button
                      onClick={() => {
                        setActiveTab('HOME');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Home Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('MY ACCOUNT');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>My Account & Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6 custom-scrollbar">
          {/* ========================================================================= */}
          {/* VIEW 1: HOME WORKSPACE (HARMONIZED & INTEGRATED)                          */}
          {/* ========================================================================= */}
          {activeTab === 'HOME' && (
            <TeacherHomeWorkspace
              students={students}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onOpenAttendanceDrawer={() => setAttendanceDrawerOpen(true)}
              onOpenClassWorkDrawer={() => setClassWorkDrawerOpen(true)}
              onOpenActivityDrawer={() => setActivityDrawerOpen(true)}
              onOpenHomeworkDrawer={() => setHomeworkDrawerOpen(true)}
              onOpenMessageParentDrawer={() => setMessageParentDrawerOpen(true)}
              onOpenRemarkDrawer={() => setRemarkDrawerOpen(true)}
              onOpenTimetableModal={() => setTimetableModalOpen(true)}
              onSelectStudent={(student) => setSelectedStudent(student as any)}
            />
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: UNIFIED CLASSROOM (STUDENTS & 360°, CLASS WORK & ACTIVITIES, LESSON PLAN) */}
          {/* ========================================================================= */}
          {(activeTab === 'CLASSROOM' || activeTab === 'MY CLASS' || activeTab === 'CLASS WORK' || activeTab === 'LESSON PLAN') && (
            <div className="space-y-6">
              {/* Modern Segmented Control Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    onClick={() => setClassroomSubTab('ROSTER')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      classroomSubTab === 'ROSTER'
                        ? 'bg-[#0050CB] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Student Roster & 360° Profiles</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      classroomSubTab === 'ROSTER' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}>
                      {students.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setClassroomSubTab('CLASS WORK')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      classroomSubTab === 'CLASS WORK'
                        ? 'bg-[#0050CB] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Daily Class Work & Activities</span>
                  </button>

                  <button
                    onClick={() => setClassroomSubTab('LESSON PLAN')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      classroomSubTab === 'LESSON PLAN'
                        ? 'bg-[#0050CB] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Weekly Lesson Plans</span>
                  </button>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">LKG - Section A</span>
                  <span>•</span>
                  <span>Room 102</span>
                </div>
              </div>

              {/* SUB-VIEW 1: STUDENT ROSTER (Original My Class) */}
              {classroomSubTab === 'ROSTER' && (
                <div className="space-y-6">
                  {/* HERO: "My Amazing Class 💜" + Class Overview + Quick Actions */}
              <div className="rounded-3xl p-6 lg:p-7 bg-gradient-to-r from-[#EBF2FF] via-[#F3EFFF] to-[#FDF8FE] dark:from-slate-800/90 dark:via-indigo-950/40 dark:to-purple-950/30 border border-blue-100/80 dark:border-slate-700/60 shadow-xs relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/50 text-[#0050CB] dark:text-blue-300 text-xs font-bold">
                    <Users className="w-3.5 h-3.5" />
                    <span>Classroom Workspace</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#000E28] dark:text-white tracking-tight">
                    My Amazing <span className="text-[#0050CB]">Class</span> 💜
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Little learners, big dreams, brighter future · Academic Session 2026–27
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      <span>🏷️</span> LKG - Section A
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      <User className="w-3.5 h-3.5 text-[#0050CB]" />
                      Priya Sharma <span className="text-slate-400 font-normal">Class Teacher</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      <Users className="w-3.5 h-3.5 text-[#0050CB]" />
                      28 Children <span className="text-slate-400 font-normal">Enrolled</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      <MapPin className="w-3.5 h-3.5 text-[#0050CB]" />
                      Residential Addresses Logged
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FF690C]" />
                      4 Medical / Allergy Flags
                    </span>
                  </div>

                  {/* Batch Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={handlePrintClassRoster}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0050CB] dark:text-blue-300 hover:bg-[#E5EEFF]/50 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Roll-Call Roster</span>
                    </button>
                    <button
                      onClick={handleExportClassRosterCSV}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0050CB]" />
                      <span>Export CSV Ledger</span>
                    </button>
                  </div>
                </div>

                <div className="hidden xl:flex flex-col items-center justify-center text-center px-4">
                  <span className="text-sm font-serif italic text-purple-700 dark:text-purple-300 leading-snug">
                    Small<br />Steps<br />✨ Big<br />Dreams
                  </span>
                  <span className="text-sm mt-1">💜</span>
                </div>

                {/* Class Overview Card */}
                <div className="bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs w-full lg:w-72 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#0050CB]" />
                      <span className="font-bold text-xs text-[#000E28] dark:text-white">Today's Presence</span>
                    </div>
                    <button onClick={() => setActiveTab('ATTENDANCE')} className="text-[10px] font-bold text-[#0050CB] hover:underline cursor-pointer">
                      Mark Roll-Call →
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/30">
                      <div className="w-6 h-6 rounded-full bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center mx-auto mb-1">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-black text-[#000E28] dark:text-white block">28</span>
                      <span className="text-[9px] text-slate-400 font-medium">Total</span>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-black text-slate-800 dark:text-white block">26</span>
                      <span className="text-[9px] text-slate-400 font-medium">Present</span>
                    </div>

                    <div className="p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/30">
                      <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-1">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-black text-slate-800 dark:text-white block">1</span>
                      <span className="text-[9px] text-slate-400 font-medium">Absent</span>
                    </div>

                    <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-1">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-black text-slate-800 dark:text-white block">1</span>
                      <span className="text-[9px] text-slate-400 font-medium">Late</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Nav Toolbar with Actionable Sub-Tabs */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 sm:gap-6 border-b sm:border-b-0 border-slate-200 dark:border-slate-800 shrink-0">
                  <button
                    onClick={() => {
                      setSubTab('children');
                      setClassPage(1);
                    }}
                    className={`flex items-center gap-2 pb-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${subTab === 'children'
                        ? 'text-[#0050CB] dark:text-blue-400 border-b-2 border-[#0050CB]'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Children (Cards)</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0050CB] dark:text-blue-300 text-[10px] font-bold">
                      {filteredStudents.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSubTab('details');
                      setClassPage(1);
                    }}
                    className={`flex items-center gap-2 pb-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${subTab === 'details'
                        ? 'text-[#0050CB] dark:text-blue-400 border-b-2 border-[#0050CB]'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Child Details (Ledger Table)</span>
                  </button>

                  <button
                    onClick={() => {
                      setSubTab('parents');
                      setClassPage(1);
                    }}
                    className={`flex items-center gap-2 pb-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${subTab === 'parents'
                        ? 'text-[#0050CB] dark:text-blue-400 border-b-2 border-[#0050CB]'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Parent & Emergency Directory</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-start sm:justify-end">
                  <div className="relative w-44 sm:w-48 lg:w-52">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setClassPage(1);
                      }}
                      placeholder="Search name, roll..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    onClick={() => setIsClassFilterOpen((prev) => !prev)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer relative shrink-0 ${isClassFilterOpen || classGenderFilter !== 'ALL' || classHealthFilter !== 'ALL' || classAttendanceFilter !== 'ALL'
                        ? 'bg-[#E5EEFF] dark:bg-blue-950/50 border-[#0050CB] text-[#0050CB] dark:text-blue-300'
                        : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    title="Toggle Filter Options"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    {(classGenderFilter !== 'ALL' || classHealthFilter !== 'ALL' || classAttendanceFilter !== 'ALL') && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF690C]" />
                    )}
                  </button>

                  <button
                    onClick={() => setAddChildModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Child</span>
                  </button>
                </div>
              </div>

              {/* COLLAPSIBLE FILTER TOOLBAR */}
              <AnimatePresence>
                {isClassFilterOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                          <Filter className="w-3.5 h-3.5 text-[#0050CB]" />
                          <span>Filter Class Learners</span>
                        </div>
                        {(classGenderFilter !== 'ALL' || classHealthFilter !== 'ALL' || classAttendanceFilter !== 'ALL') && (
                          <button
                            onClick={() => {
                              setClassGenderFilter('ALL');
                              setClassHealthFilter('ALL');
                              setClassAttendanceFilter('ALL');
                              setClassPage(1);
                              toast.success('Filters reset to show all learners');
                            }}
                            className="text-[11px] font-bold text-[#FF690C] hover:underline cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Gender */}
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Gender</label>
                          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                            {(['ALL', 'Male', 'Female'] as const).map((g) => (
                              <button
                                key={g}
                                onClick={() => {
                                  setClassGenderFilter(g);
                                  setClassPage(1);
                                }}
                                className={`flex-1 py-1 text-center rounded-lg font-bold transition-all text-xs cursor-pointer ${classGenderFilter === g
                                    ? 'bg-white dark:bg-slate-900 text-[#0050CB] dark:text-blue-300 shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-700'
                                  }`}
                              >
                                {g === 'ALL' ? 'All' : g === 'Male' ? '👦 Boys' : '👧 Girls'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Medical / Health Alerts */}
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Medical Flags</label>
                          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                            {(['ALL', 'FLAGGED'] as const).map((h) => (
                              <button
                                key={h}
                                onClick={() => {
                                  setClassHealthFilter(h);
                                  setClassPage(1);
                                }}
                                className={`flex-1 py-1 text-center rounded-lg font-bold transition-all text-xs cursor-pointer ${classHealthFilter === h
                                    ? 'bg-white dark:bg-slate-900 text-[#FF690C] shadow-2xs font-black'
                                    : 'text-slate-500 hover:text-slate-700'
                                  }`}
                              >
                                {h === 'ALL' ? 'All Kids' : '⚠️ Allergies Only'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Attendance Today */}
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Today's Status</label>
                          <select
                            value={classAttendanceFilter}
                            onChange={(e) => {
                              setClassAttendanceFilter(e.target.value as any);
                              setClassPage(1);
                            }}
                            className="w-full p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold"
                          >
                            <option value="ALL">All Statuses</option>
                            <option value="Present">Present Only (26)</option>
                            <option value="Absent">Absent Only (1)</option>
                            <option value="Late">Late Only (1)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ================================================================= */}
              {/* SUB-TAB VIEW 1: CHILDREN (VISUAL CARDS WITH SAFETY STRIPS)       */}
              {/* ================================================================= */}
              {subTab === 'children' && (
                <div className="space-y-6">
                  {paginatedStudents.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">No learners match your current filter</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">Try resetting filters or adjusting search keywords to find students.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setClassGenderFilter('ALL');
                          setClassHealthFilter('ALL');
                          setClassAttendanceFilter('ALL');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#0050CB] text-white text-xs font-bold cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedStudents.map((child) => (
                        <StudentCard
                          key={child.id}
                          id={child.id}
                          rollNo={child.rollNo}
                          name={child.name}
                          photo={child.photo}
                          status={child.status as any}
                          age={child.age}
                          gender={child.gender}
                          bloodGroup={child.bloodGroup}
                          allergies={child.allergies}
                          address={child.address}
                          parentLabel={child.parentLabel}
                          parentName={child.parentName}
                          phone={child.phone}
                          attendanceRate={child.attendanceRate}
                          theme={child.gender === 'Female' ? 'rose' : 'blue'}
                          onViewProfile={() => setSelectedStudent(child)}
                          onEdit={() => handleOpenEditStudent(child)}
                          onCall={() => {
                            toast.success(`Calling primary guardian ${child.parentName} (${child.phone})`);
                            window.open(`tel:${child.phone}`);
                          }}
                          onChat={() => {
                            setActiveTab('PARENTS');
                            toast.success(`Opening consultation for ${child.name}`);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ================================================================= */}
              {/* SUB-TAB VIEW 2: CHILD DETAILS (MASTER ROSTER & HEALTH LEDGER TABLE)*/}
              {/* ================================================================= */}
              {subTab === 'details' && (
                <div className="space-y-4">
                  {/* Table Statistics Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#000E28] dark:text-white">
                        Showing {filteredStudents.length} Students in Master Ledger
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-500">
                        👦 {filteredStudents.filter((s) => s.gender === 'Male').length} Boys · 👧 {filteredStudents.filter((s) => s.gender === 'Female').length} Girls
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportClassRosterCSV}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E5EEFF] text-[#0050CB] dark:bg-blue-950/50 dark:text-blue-300 font-bold hover:bg-blue-100 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Spreadsheet</span>
                      </button>
                    </div>
                  </div>

                  {/* Responsive Table */}
                  <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                            <th className="py-3.5 px-4">Roll & Learner</th>
                            <th className="py-3.5 px-4">Admission ID</th>
                            <th className="py-3.5 px-4">Age / DOB</th>
                            <th className="py-3.5 px-4">Blood Group</th>
                            <th className="py-3.5 px-4">Medical / Allergy Notes</th>
                            <th className="py-3.5 px-4">Residential Address</th>
                            <th className="py-3.5 px-4">Guardian Contact</th>
                            <th className="py-3.5 px-4 text-center">Attendance %</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {paginatedStudents.map((student) => (
                            <tr
                              key={student.id}
                              className="hover:bg-[#E5EEFF]/30 dark:hover:bg-blue-950/20 transition-colors"
                            >
                              {/* Roll & Photo + Name */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-[#0050CB] bg-[#E5EEFF] dark:bg-blue-950/60 px-2 py-0.5 rounded-lg text-xs">
                                    #{student.rollNo}
                                  </span>
                                  <AppImage
                                    src={student.photo}
                                    alt={student.name}
                                    fallbackType="avatar"
                                    name={student.name}
                                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                                  />
                                  <div>
                                    <span className="font-bold text-slate-800 dark:text-white block hover:text-[#0050CB] cursor-pointer" onClick={() => setSelectedStudent(student)}>
                                      {student.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {student.gender === 'Male' ? 'Boy' : 'Girl'} · {student.parentLabel}: {student.parentName}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Admission ID */}
                              <td className="py-3 px-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                                {student.admissionNo || `GGSP-2024-LKG-${student.rollNo}`}
                              </td>

                              {/* Age & DOB */}
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-700 dark:text-slate-200 block">{student.age}</span>
                                <span className="text-[10px] text-slate-400">{student.dob || '15 Jul 2022'}</span>
                              </td>

                              {/* Blood Group */}
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E5EEFF] dark:bg-blue-950/50 text-[#0050CB] dark:text-blue-300 font-bold text-[11px]">
                                  <span>🩸</span>
                                  <span>{student.bloodGroup || 'O+'}</span>
                                </span>
                              </td>

                              {/* Medical & Allergy Notes */}
                              <td className="py-3 px-4 max-w-[200px]">
                                {student.allergies && !student.allergies.includes('None') && !student.allergies.includes('All clear') ? (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FFF7ED] dark:bg-amber-950/40 text-[#FF690C] border border-[#FFEDD5] dark:border-amber-900/50 font-bold text-[11px]">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{student.allergies}</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                                    <Check className="w-3 h-3" />
                                    <span>All clear</span>
                                  </div>
                                )}
                                <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{student.dietaryNote || 'Regular'}</span>
                              </td>

                              {/* Residential Address */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                                  <MapPin className="w-3.5 h-3.5 text-[#0050CB] shrink-0" />
                                  <span className="truncate max-w-[180px]" title={student.address || 'Address not recorded'}>
                                    {student.address || 'Local Resident'}
                                  </span>
                                </div>
                              </td>

                              {/* Guardian Phone */}
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-700 dark:text-slate-200 block">{student.parentName}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>{student.phone}</span>
                                </span>
                              </td>

                              {/* Attendance % */}
                              <td className="py-3 px-4 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span className="font-black text-slate-800 dark:text-white">{student.attendanceRate}%</span>
                                  <div className="w-14 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-0.5">
                                    <div
                                      className={`h-full rounded-full ${student.attendanceRate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                      style={{ width: `${student.attendanceRate}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenEditStudent(student)}
                                    title="Edit Student Info & Address"
                                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-[#0050CB] cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setSelectedStudent(student)}
                                    title="View 360° Profile"
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0050CB] cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveTab('PARENTS');
                                      toast.success(`Opening consultation for ${student.name}`);
                                    }}
                                    title="Message Guardian"
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0050CB] cursor-pointer"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      toast.success(`Dialing ${student.phone}`);
                                      window.open(`tel:${student.phone}`);
                                    }}
                                    title="Call Guardian"
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 cursor-pointer"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* SUB-TAB VIEW 3: PARENT DETAILS (GUARDIAN & EMERGENCY DIRECTORY)  */}
              {/* ================================================================= */}
              {subTab === 'parents' && (
                <div className="space-y-4">
                  {/* Gate Safety Notice */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-[#FF690C] flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-amber-900 dark:text-amber-200 block">
                          Gate Clearance & Emergency Authorized Pickup Directory
                        </span>
                        <p className="text-amber-700 dark:text-amber-300 text-[11px]">
                          At 01:30 PM dismissal, verify the authorized escort name before releasing any learner.
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/80 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>28 Verified Escorts</span>
                    </span>
                  </div>

                  {/* Guardian Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paginatedStudents.map((learner) => (
                      <div
                        key={learner.id}
                        className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-all"
                      >
                        {/* Child Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <AppImage
                              src={learner.photo}
                              alt={learner.name}
                              fallbackType="avatar"
                              name={learner.name}
                              className="w-10 h-10 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                            <div>
                              <span className="font-black text-sm text-slate-800 dark:text-white block hover:text-[#0050CB] cursor-pointer" onClick={() => setSelectedStudent(learner)}>
                                {learner.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono font-semibold">
                                Roll #{learner.rollNo} · LKG-A
                              </span>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-lg bg-[#E5EEFF] text-[#0050CB] font-bold text-[10px]">
                            {learner.bloodGroup || 'O+'}
                          </span>
                        </div>

                        {/* Guardian Info */}
                        <div className="space-y-2.5 text-xs">
                          {/* Primary Contact */}
                          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Primary Contact</span>
                              <span className="text-[10px] font-bold text-[#0050CB]">{learner.parentLabel}</span>
                            </div>
                            <span className="font-black text-slate-800 dark:text-white block">{learner.parentName}</span>
                            <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-200/60 dark:border-slate-800">
                              <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">{learner.phone}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    toast.success(`Calling ${learner.parentName} (${learner.phone})`);
                                    window.open(`tel:${learner.phone}`);
                                  }}
                                  className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-200 cursor-pointer"
                                  title="Call Parent"
                                >
                                  <Phone className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveTab('PARENTS');
                                    toast.success(`Opening consultation for ${learner.name}`);
                                  }}
                                  className="p-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#0050CB] hover:bg-blue-200 cursor-pointer"
                                  title="Chat in Parent Hub"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Home Address */}
                          <div className="p-2.5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#0050CB] shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Home Address</span>
                              <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px] leading-tight block truncate" title={learner.address}>
                                {learner.address || 'Address not recorded'}
                              </span>
                            </div>
                          </div>

                          {/* Authorized Pickup Escort */}
                          <div className="p-2.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Authorized Gate Escort</span>
                              </span>
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.5 rounded">
                                ID Verified
                              </span>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                              {learner.authorizedPickupPerson || learner.parentName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Relationship: {learner.authorizedPickupRelation || learner.parentLabel}
                            </span>
                          </div>

                          {/* Secondary Emergency Contact */}
                          <div className="text-[11px] px-1 text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-slate-600 dark:text-slate-300">Secondary Emergency: </span>
                            <span>{learner.emergencyContactName || 'Grandparent / Relative'} </span>
                            <span className="font-mono text-[10px]">({learner.emergencyContactPhone || '+91 98112 34567'})</span>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleOpenEditStudent(learner)}
                            className="px-3 py-1.5 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab('PARENTS');
                              toast.success(`Opening parent messaging thread for ${learner.name}`);
                            }}
                            className="flex-1 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0050CB] hover:bg-[#E5EEFF] text-xs font-bold transition-all cursor-pointer text-center"
                          >
                            Message
                          </button>
                          <button
                            onClick={() => setSelectedStudent(learner)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer"
                          >
                            360°
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* FUNCTIONAL PAGINATION BAR                                         */}
              {/* ================================================================= */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Showing {Math.min((classPage - 1) * classPageSize + 1, filteredStudents.length)} to {Math.min(classPage * classPageSize, filteredStudents.length)} of {filteredStudents.length} learners
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={classPage === 1}
                    onClick={() => setClassPage((p) => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalClassPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setClassPage(pageNum)}
                        className={`w-8 h-8 rounded-xl font-black flex items-center justify-center shadow-xs cursor-pointer ${classPage === pageNum
                            ? 'bg-[#0050CB] text-white'
                            : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={classPage === totalClassPages}
                    onClick={() => setClassPage((p) => Math.min(totalClassPages, p + 1))}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span>Per page:</span>
                    <select
                      value={classPageSize}
                      onChange={(e) => {
                        setClassPageSize(Number(e.target.value));
                        setClassPage(1);
                      }}
                      className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-bold text-slate-700 dark:text-slate-200"
                    >
                      <option value="6">6</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="28">28</option>
                    </select>
                  </div>
                  <div className="hidden md:flex items-center gap-1 text-[#0050CB] dark:text-blue-400 font-serif italic text-xs">
                    <span>Together We Grow</span>
                    <span>💜</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: CLASS WORK & ACTIVITIES */}
          {classroomSubTab === 'CLASS WORK' && (
            <ClassWorkWorkspace
              students={students}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {/* SUB-VIEW 3: LESSON PLAN */}
          {classroomSubTab === 'LESSON PLAN' && (
            <LessonPlanWorkspace
              onNavigateTab={handleNavigateTab}
            />
          )}
        </div>
      )}

          {/* ========================================================================= */}
          {/* VIEW 3: ATTENDANCE REGISTER (ERGONOMIC SENIOR UX REDESIGN)                */}
          {/* ========================================================================= */}
          {activeTab === 'ATTENDANCE' && (
            <div className="w-full space-y-5">
              {/* 1. Top Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#DBEAFE] via-[#EDE9FE] to-[#FCE7F3] dark:from-slate-900 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200/70 dark:border-slate-800 p-6 shadow-xs">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="max-w-xl">


                    {/* Heading */}
                    <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight flex items-baseline gap-2 flex-wrap">
                      <span>Class Attendance</span>
                      <span className="font-serif italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                        Register
                      </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
                      Instant morning roll call, real-time presence tracking, and automated guardian safety alerts.
                    </p>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs border border-slate-200/70 dark:border-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-[#0050CB]" />
                        <span>{formattedAttendanceDateStr}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs border border-slate-200/70 dark:border-slate-700">
                        <GraduationCap className="w-3.5 h-3.5 text-[#0050CB]" />
                        <span>LKG - Section A</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs border border-slate-200/70 dark:border-slate-700">
                        <Users className="w-3.5 h-3.5 text-[#0050CB]" />
                        <span>{students.length} Learners</span>
                      </span>
                    </div>

                    {/* Lock Status Alert */}
                    {isAttendanceLocked ? (
                      <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold shadow-xs">
                        <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Register Officially Submitted & Locked for Daily Audit</span>
                        <button
                          onClick={handleUnlockAttendance}
                          className="ml-2 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-[#0050CB] dark:text-blue-300 hover:bg-slate-50 cursor-pointer text-[11px] font-bold transition-all"
                        >
                          <Unlock className="w-3 h-3 inline mr-1" />
                          Unlock to Edit
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#FF690C]" />
                        <span>Live Session In Progress • Remember to submit when complete</span>
                      </div>
                    )}
                  </div>

                  {/* Right Artwork & Quote */}
                  <div className="relative flex items-center justify-end pr-2 select-none pointer-events-none hidden sm:flex">
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-end gap-2">
                        {/* Sprout plant */}
                        <div className="flex flex-col items-center">
                          <svg width="34" height="42" viewBox="0 0 34 42" fill="none">
                            <path d="M17 38V18" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M17 24C11 18 5 21 5 27C5 33 14 31 17 27" fill="#34D399" />
                            <path d="M17 19C23 13 29 16 29 22C29 28 20 26 17 22" fill="#10B981" />
                            <rect x="9" y="34" width="16" height="8" rx="2" fill="#3B82F6" opacity="0.8" />
                          </svg>
                        </div>
                        {/* Stacked books */}
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-12 h-2.5 rounded-xs bg-[#0050CB] shadow-xs" />
                          <div className="w-14 h-3 rounded-xs bg-[#10B981] shadow-xs" />
                        </div>
                      </div>

                      {/* Calligraphy Quote */}
                      <div className="text-right leading-tight pr-2">
                        <div className="font-serif italic text-base text-indigo-900/90 dark:text-indigo-200 font-semibold tracking-wide">
                          Every child
                        </div>
                        <div className="font-serif italic text-xl text-indigo-950 dark:text-white font-black tracking-wider flex items-center justify-end gap-1">
                          <span>Every day</span>
                          <span className="text-rose-500 text-sm">♡</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. OPTION 1: UNIFIED INTEGRATED ATTENDANCE COMMAND HEADER */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                {/* UPPER ROW: Classroom Identity, Date Navigator & Primary Submission CTA */}
                <div className="p-3 sm:p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
                  {/* Left: Class Identity & Live Session Status */}
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 flex items-center justify-center text-[#0050CB] dark:text-blue-300 font-black text-xs border border-[#0050CB]/20 shrink-0">
                      A
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                          LKG - Section A
                        </h3>
                        {isAttendanceLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 text-[10px] font-bold">
                            <Lock className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Locked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Live Session</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {students.length} Registered Learners • Room 102
                      </p>
                    </div>
                  </div>

                  {/* Right: Date Navigator & Primary Lock/Submit CTA */}
                  <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
                    {/* Compact Date Navigator Group */}
                    <div className="inline-flex items-center bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-0.5 sm:p-1 shadow-2xs">
                      <button
                        onClick={() => setAttendanceDateOffset((d) => d - 1)}
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                        title="Previous Day"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setAttendanceDateOffset(0)}
                        className="px-2 sm:px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-white hover:text-[#0050CB] dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Click to jump to Today"
                      >
                        <CalendarIcon className="w-3.5 h-3.5 text-[#0050CB] shrink-0" />
                        <span>{formattedAttendanceDateStr}</span>
                      </button>

                      <button
                        onClick={() => setAttendanceDateOffset((d) => d + 1)}
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                        title="Next Day"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Submit & Lock CTA / Unlock CTA */}
                    {isAttendanceLocked ? (
                      <button
                        onClick={handleUnlockAttendance}
                        className="px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Unlock</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsAttendanceSubmitModalOpen(true)}
                        className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Submit & Lock</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* LOWER SECTION: Filters, Full-Fit Search & Action Tools */}
                <div className="p-3 bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5">
                  {/* Top Row: Segmented Switch on Left + Actions on Right */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    {/* Left: Segmented Switch (All, Absent, Late, Monthly History) */}
                    <div className="inline-flex items-center p-1 bg-white dark:bg-slate-800 rounded-xl gap-1 border border-slate-200/80 dark:border-slate-700 shadow-2xs shrink-0">
                      <button
                        onClick={() => setAttendanceSubTab('MARK')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${attendanceSubTab === 'MARK'
                            ? 'bg-[#0050CB] text-white shadow-2xs font-black'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                      >
                        <span>All</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${attendanceSubTab === 'MARK'
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-50 text-[#0050CB] dark:bg-blue-950/60 dark:text-blue-300'
                          }`}>
                          {students.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setAttendanceSubTab('ABSENT')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${attendanceSubTab === 'ABSENT'
                            ? 'bg-rose-500 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                          }`}
                      >
                        <span>Absent</span>
                        {absentCount > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${attendanceSubTab === 'ABSENT'
                              ? 'bg-white/20 text-white'
                              : 'bg-rose-100 text-rose-700'
                            }`}>
                            {absentCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setAttendanceSubTab('LATE')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${attendanceSubTab === 'LATE'
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                          }`}
                      >
                        <span>Late</span>
                        {lateCount > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${attendanceSubTab === 'LATE'
                              ? 'bg-white/20 text-white'
                              : 'bg-amber-100 text-amber-700'
                            }`}>
                            {lateCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setAttendanceSubTab('HISTORY')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${attendanceSubTab === 'HISTORY'
                            ? 'bg-[#0050CB] text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-[#0050CB]'
                          }`}
                      >
                        <CalendarRange className="w-3.5 h-3.5" />
                        <span>Monthly History</span>
                      </button>
                    </div>

                    {/* Right: Quick Action Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {attendanceSubTab !== 'HISTORY' && (
                        <>
                          <button
                            onClick={() => handleMarkAll('Present')}
                            disabled={isAttendanceLocked}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 shadow-2xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            title="Mark all registered learners as Present"
                          >
                            <Zap className="w-3.5 h-3.5 text-emerald-600" />
                            <span>All Present</span>
                          </button>

                          <button
                            onClick={() => handleMarkAll('Absent')}
                            disabled={isAttendanceLocked}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 shadow-2xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            title="Mark all registered learners as Absent"
                          >
                            <X className="w-3.5 h-3.5 text-rose-500" />
                            <span>All Absent</span>
                          </button>

                          <button
                            onClick={() => {
                              if (absentCount === 0) {
                                toast('No learners are marked absent today!', { icon: '🎉' });
                              } else {
                                const absentKids = students.filter((s) => s.status === 'Absent').map((k) => k.name).join(', ');
                                toast.success(`Triggering absence alerts for: ${absentKids}`);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-[#0050CB] hover:border-blue-200 shadow-2xs cursor-pointer transition-all flex items-center gap-1.5"
                            title="Send alert notifications to absent parents"
                          >
                            <Send className="w-3.5 h-3.5 text-[#0050CB]" />
                            <span className="hidden sm:inline">Alert Parents</span>
                          </button>

                          <button
                            onClick={() => setRemarkDrawerOpen(true)}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 shadow-2xs cursor-pointer transition-all flex items-center gap-1.5"
                            title="Add classroom attendance remark or log"
                          >
                            <ClipboardList className="w-3.5 h-3.5 text-purple-600" />
                            <span className="hidden sm:inline">Remark</span>
                          </button>
                        </>
                      )}

                      {attendanceSubTab !== 'HISTORY' && (
                        <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                          <button
                            onClick={() => setAttendanceViewMode('TABLE')}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${attendanceViewMode === 'TABLE'
                                ? 'bg-[#0050CB] text-white shadow-2xs'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                              }`}
                            title="Table Register View"
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setAttendanceViewMode('CARDS')}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${attendanceViewMode === 'CARDS'
                                ? 'bg-[#0050CB] text-white shadow-2xs'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                              }`}
                            title="Rapid Cards View"
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={attendanceSubTab === 'HISTORY' ? handleExportMonthlyAttendanceCSV : handleExportAttendanceCSV}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                        title={attendanceSubTab === 'HISTORY' ? "Export Monthly Register CSV" : "Export Daily Attendance Register CSV"}
                      >
                        <Download className="w-3.5 h-3.5 text-[#0050CB]" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row: INCREASED & PERFECTLY FITTED SEARCH BAR */}
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={attendanceSearchQuery}
                      onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                      placeholder="Search child by name, roll number, parent name, or address..."
                      className="w-full pl-10 pr-9 py-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200/90 dark:border-slate-700 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-white shadow-2xs font-medium"
                    />
                    {attendanceSearchQuery && (
                      <button
                        onClick={() => setAttendanceSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. MAIN ATTENDANCE DISPLAY: MONTHLY HISTORY MATRIX VS DAILY ROLL-CALL */}
              {attendanceSubTab === 'HISTORY' ? (
                /* ========================================================================= */
                /* MONTHLY ATTENDANCE HISTORY VIEW                                           */
                /* ========================================================================= */
                <div id="printable-monthly-register" className="space-y-4">
                  {/* OPTION A: UNIFIED MONTH NAVIGATOR BAR */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
                    {/* Left: Unified Integrated Month Selector Group */}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                      {/* Unified Pill: [ ‹ ] Month Year [ › ] */}
                      <div className="inline-flex items-center bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-1 shadow-2xs">
                        <button
                          onClick={handlePrevHistoryMonth}
                          className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                          title="Previous Month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Interactive Month & Year Display / Quick Dropdowns */}
                        <div className="flex items-center px-2 py-0.5 gap-1.5 font-black text-xs text-slate-800 dark:text-white">
                          <CalendarIcon className="w-3.5 h-3.5 text-[#0050CB]" />
                          <select
                            value={selectedHistoryMonth}
                            onChange={(e) => setSelectedHistoryMonth(Number(e.target.value))}
                            className="bg-transparent font-black text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer hover:text-[#0050CB] transition-colors"
                          >
                            {monthNames.map((m, idx) => (
                              <option key={m} value={idx} className="text-slate-800 dark:text-slate-900">
                                {m}
                              </option>
                            ))}
                          </select>

                          <select
                            value={selectedHistoryYear}
                            onChange={(e) => setSelectedHistoryYear(Number(e.target.value))}
                            className="bg-transparent font-black text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer hover:text-[#0050CB] transition-colors"
                          >
                            <option value={2025} className="text-slate-800 dark:text-slate-900">2025</option>
                            <option value={2026} className="text-slate-800 dark:text-slate-900">2026</option>
                            <option value={2027} className="text-slate-800 dark:text-slate-900">2027</option>
                          </select>
                        </div>

                        <button
                          onClick={handleNextHistoryMonth}
                          className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                          title="Next Month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quick Jump to Current Month */}
                      <button
                        onClick={handleSetCurrentMonth}
                        className="px-2.5 py-1.5 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 hover:bg-blue-100 text-xs font-black border border-[#0050CB]/20 transition-all cursor-pointer"
                        title="Jump to Current Month"
                      >
                        This Month
                      </button>
                    </div>

                    {/* Right: Compact Clean Actions */}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => printDocument('printable-monthly-register', 'GGPS School - Monthly Attendance Register')}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Print Monthly Attendance Register"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print</span>
                      </button>

                      <button
                        onClick={handleExportMonthlyAttendanceCSV}
                        className="px-3 py-1.5 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                        title="Download Complete Monthly CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Monthly KPI Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Card 1: Attendance Rate */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span>Monthly Rate</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {monthlyKpis.avgRate}%
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0050CB] h-full rounded-full transition-all duration-500"
                          style={{ width: `${monthlyKpis.avgRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Card 2: Total Working Student Days */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span>Student-Days</span>
                        <CalendarIcon className="w-3.5 h-3.5 text-[#0050CB]" />
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {monthlyKpis.totalStudentDays}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Across {monthlyDays.filter((d) => !d.isWeekend).length} school days
                      </p>
                    </div>

                    {/* Card 3: Total Absences Recorded */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span>Total Absences</span>
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                      </div>
                      <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                        {monthlyKpis.totalAbsences}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Avg {(monthlyKpis.totalAbsences / (students.length || 1)).toFixed(1)} per student
                      </p>
                    </div>

                    {/* Card 4: Perfect Attendance Learners */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span>100% Attendance</span>
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {monthlyKpis.perfectLearners} <span className="text-xs font-normal text-slate-400">/ {students.length}</span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        Zero absences logged
                      </p>
                    </div>
                  </div>

                  {/* Heatmap Legend Bar */}
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-slate-500 font-semibold">Register Key:</span>
                      <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <span className="w-4 h-4 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                          P
                        </span>
                        <span>Present</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <span className="w-4 h-4 rounded-md bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">
                          A
                        </span>
                        <span>Absent</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <span className="w-4 h-4 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
                          L
                        </span>
                        <span>Late</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-slate-400">
                        <span className="w-4 h-4 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                          —
                        </span>
                        <span>Weekend</span>
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium">
                      Showing {monthNames[selectedHistoryMonth]} {selectedHistoryYear}
                    </span>
                  </div>

                  {/* FULL MONTHLY ATTENDANCE MATRIX TABLE */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-xs text-left border-collapse">
                        {/* Table Header */}
                        <thead className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                          <tr>
                            {/* Sticky Learner Identity Column */}
                            <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 px-3.5 py-3 w-56 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)] border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200">
                              Learner Identity
                            </th>

                            {/* Days 1 to 30/31 */}
                            {monthlyDays.map((d) => (
                              <th
                                key={d.day}
                                className={`px-1.5 py-2.5 text-center min-w-[30px] border-r border-slate-100 dark:border-slate-800 ${d.isWeekend ? 'bg-slate-100/90 dark:bg-slate-800/70 text-slate-400' : 'text-slate-700 dark:text-slate-200'
                                  }`}
                              >
                                <div className="font-bold text-[11px]">{d.day}</div>
                                <div className={`text-[9px] uppercase font-bold ${d.isWeekend ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {d.dayLetter}
                                </div>
                              </th>
                            ))}

                            {/* Summary Columns Grouped */}
                            <th className="px-2.5 py-3 text-center text-emerald-700 dark:text-emerald-300 font-black min-w-[38px] bg-emerald-50/60 dark:bg-emerald-950/30 border-l-2 border-[#0050CB]/30" title="Total Present Days">
                              P
                            </th>
                            <th className="px-2.5 py-3 text-center text-rose-700 dark:text-rose-300 font-black min-w-[38px] bg-rose-50/60 dark:bg-rose-950/30" title="Total Absent Days">
                              A
                            </th>
                            <th className="px-2.5 py-3 text-center text-amber-700 dark:text-amber-300 font-black min-w-[38px] bg-amber-50/60 dark:bg-amber-950/30" title="Total Late Days">
                              L
                            </th>
                            <th className="px-3 py-3 text-center font-black min-w-[62px] bg-[#E5EEFF]/80 dark:bg-blue-950/40 text-[#0050CB] dark:text-blue-300" title="Monthly Attendance Rate">
                              Rate
                            </th>
                            <th className="px-3 py-3 text-center min-w-[45px] bg-slate-50 dark:bg-slate-800 text-slate-500">
                              Action
                            </th>
                          </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {filteredMonthlyAttendanceData.length === 0 ? (
                            <tr>
                              <td colSpan={monthlyDays.length + 6} className="text-center py-12 text-slate-400">
                                <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                                <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No learners match "{attendanceSearchQuery}"</p>
                                <p className="text-xs text-slate-400">Check roll number, child name, or clear search filter</p>
                              </td>
                            </tr>
                          ) : (
                            filteredMonthlyAttendanceData.map(({ student, records, presentCount, absentCount, lateCount, attendanceRate }) => (
                              <tr
                                key={student.id}
                                className="even:bg-slate-50/30 dark:even:bg-slate-800/20 hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                              >
                                {/* Sticky Student Name & Roll */}
                                <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-blue-50/60 dark:group-hover:bg-slate-800 px-3.5 py-2.5 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)] border-r border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-2.5">
                                    <span className="px-1.5 py-0.5 rounded bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 font-black text-[10px] shrink-0 border border-[#0050CB]/20">
                                      #{student.rollNo}
                                    </span>
                                    <AppImage
                                      src={student.photo}
                                      alt={student.name}
                                      fallbackType="avatar"
                                      name={student.name}
                                      className="w-6.5 h-6.5 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                                    />
                                    <span
                                      onClick={() => setSelectedStudent(student)}
                                      className="font-bold text-slate-800 dark:text-white truncate max-w-[125px] hover:text-[#0050CB] cursor-pointer text-xs transition-colors"
                                      title={student.name}
                                    >
                                      {student.name}
                                    </span>
                                  </div>
                                </td>

                                {/* Day Status Cells */}
                                {records.map((r) => (
                                  <td
                                    key={r.day}
                                    className={`px-1 py-2 text-center border-r border-slate-100 dark:border-slate-800/60 ${r.isWeekend ? 'bg-slate-100/60 dark:bg-slate-800/40' : ''
                                      }`}
                                  >
                                    {r.isWeekend ? (
                                      <span className="text-slate-300 dark:text-slate-600 text-[10px] font-bold">—</span>
                                    ) : r.status === 'P' ? (
                                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-500 text-white font-black text-[9px] shadow-2xs">
                                        P
                                      </span>
                                    ) : r.status === 'A' ? (
                                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-rose-500 text-white font-black text-[9px] shadow-2xs">
                                        A
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-500 text-white font-black text-[9px] shadow-2xs">
                                        L
                                      </span>
                                    )}
                                  </td>
                                ))}

                                {/* Summary Counts (Shaded Group) */}
                                <td className="px-2.5 py-2 text-center font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10 border-l-2 border-[#0050CB]/20">
                                  {presentCount}
                                </td>
                                <td className="px-2.5 py-2 text-center font-black text-rose-700 dark:text-rose-400 bg-rose-50/20 dark:bg-rose-950/10">
                                  {absentCount}
                                </td>
                                <td className="px-2.5 py-2 text-center font-black text-amber-700 dark:text-amber-400 bg-amber-50/20 dark:bg-amber-950/10">
                                  {lateCount}
                                </td>

                                {/* Attendance Rate % Pill */}
                                <td className="px-3 py-2 text-center bg-[#E5EEFF]/20 dark:bg-blue-950/10">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${attendanceRate >= 90
                                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60'
                                        : attendanceRate >= 80
                                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60'
                                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/60'
                                      }`}
                                  >
                                    {attendanceRate}%
                                  </span>
                                </td>

                                {/* Quick Profile View Action */}
                                <td className="px-2 py-2 text-center">
                                  <button
                                    onClick={() => setSelectedStudent(student)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-[#0050CB] transition-colors cursor-pointer"
                                    title="View Learner Profile"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Monthly Register Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-slate-500">
                    <span>
                      Showing {students.length} students enrolled in LKG - Section A
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0050CB]">
                        {monthNames[selectedHistoryMonth]} {selectedHistoryYear} Official Record
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* DAILY ROLL-CALL ATTENDANCE VIEW (TABLE OR CARDS)                          */
                /* ========================================================================= */
                <>
                  {/* 4A. VIEW MODE 1: STREAMLINED ROLL-CALL TABLE */}
                  {attendanceViewMode === 'TABLE' ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                            <tr>
                              <th className="px-3 py-3.5 w-10 text-center">#</th>
                              <th className="px-4 py-3.5 text-slate-600 dark:text-slate-300">Learner Identity</th>
                              <th className="px-4 py-3.5 text-slate-600 dark:text-slate-300">Primary Guardian</th>
                              <th className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-300">
                                Status Toggle [ P | A | L ]
                              </th>
                              <th className="px-4 py-3.5 text-slate-600 dark:text-slate-300">Absence Reason / Remark</th>
                              <th className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-300">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                            {attendanceStudents.map((c) => (
                              <tr
                                key={c.id}
                                className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors group"
                              >
                                {/* Roll Number Index */}
                                <td className="px-3 py-3 text-center">
                                  <span className="px-2 py-0.5 rounded-md bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 font-black text-[11px] border border-[#0050CB]/20">
                                    #{c.rollNo}
                                  </span>
                                </td>

                                {/* Child Details */}
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <AppImage
                                      src={c.photo}
                                      alt={c.name}
                                      fallbackType="avatar"
                                      name={c.name}
                                      className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0050CB]/15 shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <span
                                        onClick={() => setSelectedStudent(c)}
                                        className="font-bold text-slate-800 dark:text-white block text-xs group-hover:text-[#0050CB] transition-colors truncate cursor-pointer"
                                      >
                                        {c.name}
                                      </span>
                                      <span className="text-[10px] text-slate-400 block truncate">
                                        {c.address ? c.address.slice(0, 30) + '...' : 'Address on record'}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Parent Contact */}
                                <td className="px-4 py-3">
                                  <div className="text-xs">
                                    <span className="text-slate-700 dark:text-slate-300 font-bold block truncate max-w-[130px]">
                                      {c.parentName}
                                    </span>
                                    <a
                                      href={`tel:${c.phone}`}
                                      className="text-[11px] text-slate-400 hover:text-[#0050CB] flex items-center gap-1 mt-0.5 transition-colors"
                                    >
                                      <Phone className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>{c.phone}</span>
                                    </a>
                                  </div>
                                </td>

                                {/* UNIFIED SEGMENTED STATUS TOGGLE [ P | A | L ] */}
                                <td className="px-4 py-3 text-center">
                                  <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 gap-1 shadow-2xs">
                                    {/* P - Present */}
                                    <button
                                      onClick={() => handleUpdateStudentStatus(c.id, 'Present')}
                                      disabled={isAttendanceLocked}
                                      title={`Mark ${c.name} as Present`}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer disabled:cursor-not-allowed ${c.status === 'Present'
                                          ? 'bg-emerald-500 text-white shadow-xs scale-105'
                                          : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                        }`}
                                    >
                                      P
                                    </button>

                                    {/* A - Absent */}
                                    <button
                                      onClick={() => handleUpdateStudentStatus(c.id, 'Absent')}
                                      disabled={isAttendanceLocked}
                                      title={`Mark ${c.name} as Absent`}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer disabled:cursor-not-allowed ${c.status === 'Absent'
                                          ? 'bg-rose-500 text-white shadow-xs scale-105'
                                          : 'text-slate-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                        }`}
                                    >
                                      A
                                    </button>

                                    {/* L - Late */}
                                    <button
                                      onClick={() => handleUpdateStudentStatus(c.id, 'Late')}
                                      disabled={isAttendanceLocked}
                                      title={`Mark ${c.name} as Late`}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer disabled:cursor-not-allowed ${c.status === 'Late'
                                          ? 'bg-amber-500 text-white shadow-xs scale-105'
                                          : 'text-slate-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                        }`}
                                    >
                                      L
                                    </button>
                                  </div>
                                </td>

                                {/* ABSENCE REASON / STATUS REMARKS */}
                                <td className="px-4 py-3">
                                  {c.status === 'Absent' ? (
                                    c.isExcused ? (
                                      <span
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] dark:text-blue-300 border border-blue-200/60 font-semibold text-[11px] max-w-[190px] truncate"
                                        title={c.absenceReason}
                                      >
                                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-[#0050CB]" />
                                        <span className="truncate">{c.absenceReason || 'Excused Parent Note'}</span>
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 font-bold text-[10px]">
                                          ⚠️ Unexplained
                                        </span>
                                        <button
                                          onClick={() => {
                                            setActiveTab('PARENTS');
                                            toast.success(`Opening parent chat for absent student ${c.name}`);
                                          }}
                                          className="px-2 py-0.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] cursor-pointer shadow-2xs transition-colors"
                                        >
                                          SMS
                                        </button>
                                      </div>
                                    )
                                  ) : c.status === 'Late' ? (
                                    <span
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 font-semibold text-[11px] max-w-[190px] truncate"
                                      title={c.arrivalNote || 'Arrived after homeroom'}
                                    >
                                      <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                      <span className="truncate">{c.arrivalNote || 'Arrived Late'}</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                                      <Check className="w-3 h-3" />
                                      <span>On Time</span>
                                    </span>
                                  )}
                                </td>

                                {/* ACTION BUTTONS */}
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => {
                                        toast.success(`Calling primary guardian of ${c.name}`);
                                        window.open(`tel:${c.phone}`);
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                      title="Call Parent"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveTab('PARENTS');
                                        toast.success(`Opening messages for ${c.name}`);
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#0050CB] transition-colors cursor-pointer"
                                      title="Message Parent"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setSelectedStudent(c)}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                      title="View Full Profile"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* 4B. VIEW MODE 2: RAPID CARDS VIEW (TABLET / MOBILE OPTIMIZED) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {attendanceStudents.map((c) => (
                        <div
                          key={c.id}
                          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3"
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-lg bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 font-black text-xs border border-[#0050CB]/20">
                              Roll #{c.rollNo}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${c.status === 'Present'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : c.status === 'Absent'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                            >
                              {c.status}
                            </span>
                          </div>

                          {/* Child Identity */}
                          <div className="flex items-center gap-3">
                            <AppImage
                              src={c.photo}
                              alt={c.name}
                              fallbackType="avatar"
                              name={c.name}
                              className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#0050CB]/15 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4
                                onClick={() => setSelectedStudent(c)}
                                className="font-bold text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:text-[#0050CB]"
                              >
                                {c.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {c.parentLabel}: {c.parentName} • {c.phone}
                              </p>
                            </div>
                          </div>

                          {/* Remark / Absence Note */}
                          {c.status === 'Absent' && (
                            <div className="p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-700 dark:text-rose-300">
                              {c.isExcused ? (
                                <span>🩺 Excused: {c.absenceReason}</span>
                              ) : (
                                <span>⚠️ Unexcused Absence - Follow-up needed</span>
                              )}
                            </div>
                          )}
                          {c.status === 'Late' && (
                            <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 text-xs text-amber-700 dark:text-amber-300">
                              <span>⏰ {c.arrivalNote || 'Arrived Late'}</span>
                            </div>
                          )}

                          {/* Large Segmented Touch Buttons */}
                          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => handleUpdateStudentStatus(c.id, 'Present')}
                              disabled={isAttendanceLocked}
                              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${c.status === 'Present'
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                            >
                              ✓ Present
                            </button>
                            <button
                              onClick={() => handleUpdateStudentStatus(c.id, 'Absent')}
                              disabled={isAttendanceLocked}
                              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${c.status === 'Absent'
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                            >
                              ✕ Absent
                            </button>
                            <button
                              onClick={() => handleUpdateStudentStatus(c.id, 'Late')}
                              disabled={isAttendanceLocked}
                              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${c.status === 'Late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                            >
                              ⏰ Late
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 5. Dynamic Pagination Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-slate-500">
                    <span>
                      Showing {attendanceStudents.length} of {students.length} registered learners
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#0050CB] dark:text-blue-400">
                        LKG - Section A Active Roster
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 4: HOMEWORK                                                          */}
          {/* ========================================================================= */}
          {activeTab === 'HOMEWORK' && (
            <HomeworkWorkspace
              students={students}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {/* ========================================================================= */}
          {/* VIEW 5: UNIFIED MARKS & EVALUATION (FORMATIVE ASSESSMENT + TERM EXAMS)    */}
          {/* ========================================================================= */}
          {(activeTab === 'MARKS & EVALUATION' || activeTab === 'ASSESSMENT' || activeTab === 'EXAMS & MARKS') && (
            <div className="space-y-6">
              {/* Modern Segmented Control Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    onClick={() => setMarksSubTab('ASSESSMENT')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      marksSubTab === 'ASSESSMENT'
                        ? 'bg-[#0050CB] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Formative Rubrics & Milestones</span>
                  </button>

                  <button
                    onClick={() => setMarksSubTab('EXAMS')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      marksSubTab === 'EXAMS'
                        ? 'bg-[#0050CB] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Term Exams & Gradebooks</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
                  <span>Continuous & Comprehensive Evaluation (CCE)</span>
                </div>
              </div>

              {/* SUB-VIEW 1: FORMATIVE ASSESSMENT */}
              {marksSubTab === 'ASSESSMENT' && (
                <AssessmentWorkspace
                  students={students}
                  onNavigateTab={handleNavigateTab}
                />
              )}

              {/* SUB-VIEW 2: TERM EXAMS & MARKS */}
              {marksSubTab === 'EXAMS' && (
                <ExamsMarksWorkspace
                  students={students}
                  onNavigateTab={handleNavigateTab}
                />
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 11: PARENTS                                                          */}
          {/* ========================================================================= */}
          {activeTab === 'PARENTS' && (
            <div className="space-y-6">
              {/* Header & Top Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#000E28] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E5EEFF] dark:bg-blue-900/40 text-[#0050CB] dark:text-blue-400 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#000E28] dark:text-white">Parent Contact & Consultation Hub</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Class LKG - Section A • Direct guardian inquiries, medical notes, and PTM conference scheduling</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
                  <button
                    onClick={() => handleOpenSchedulePTM(null)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <CalendarRange className="w-4 h-4 text-[#0050CB]" />
                    <span>Schedule PTM</span>
                  </button>

                  <button
                    onClick={() => setBroadcastHistoryDrawerOpen(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#E5EEFF] dark:bg-blue-950/60 hover:bg-blue-100 text-[#0050CB] dark:text-blue-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Broadcast History ({classBroadcasts.length})</span>
                  </button>

                  <Link
                    href="/teacher/messages"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open Direct Messenger</span>
                  </Link>

                  <button
                    onClick={() => setMessageParentDrawerOpen(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Broadcast to Parents</span>
                  </button>
                </div>
              </div>

              {/* Metrics Grid (4 Stat Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Enrolled Families"
                  value={parentThreads.length}
                  subtitle="Class LKG-A registered guardians"
                  icon={Users}
                  color="blue"
                  trend={{ text: "100% Portal Active", positive: true }}
                  progressBar={{ percentage: 100, label: "28 of 28 Enrolled" }}
                />
                <StatCard
                  label="Unread Queries"
                  value={unreadParentQueriesCount}
                  subtitle={`${unreadParentQueriesCount} parent messages pending reply`}
                  icon={MessageCircle}
                  color="amber"
                  trend={{ text: "Morning inquiries", positive: false }}
                  progressBar={{ percentage: Math.round((unreadParentQueriesCount / parentThreads.length) * 100), label: `${unreadParentQueriesCount} Unread` }}
                />
                <StatCard
                  label="Absence Notes Today"
                  value={absentNotesCount}
                  subtitle={`${absentNotesCount} pupils reported absent`}
                  icon={AlertCircle}
                  color="emerald"
                  trend={{ text: "Diya Verma (Flu)", positive: true }}
                  progressBar={{ percentage: Math.round((absentNotesCount / parentThreads.length) * 100), label: "Verified Medical Notes" }}
                />
                <StatCard
                  label="PTM Schedule Status"
                  value={`${ptmConfirmedCount}/28 Confirmed`}
                  subtitle={`${ptmRescheduledCount} Rescheduled • ${ptmDeclinedCount} Declined • ${ptmPendingCount} Pending`}
                  icon={CalendarIcon}
                  color="purple"
                  trend={{ text: `${Math.round((ptmConfirmedCount / 28) * 100)}% Confirmed`, positive: true }}
                  progressBar={{ percentage: Math.round((ptmConfirmedCount / 28) * 100), label: `${ptmConfirmedCount} of 28 Booked` }}
                />
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                  {(
                    [
                      { id: 'ALL', label: `All Parents (${parentThreads.length})` },
                      { id: 'UNREAD', label: `Unread Queries (${unreadParentQueriesCount})` },
                      { id: 'ABSENT', label: `Absence Notes (${absentNotesCount})` },
                      { id: 'PTM_CONFIRMED', label: `PTM Confirmed (${ptmConfirmedCount})` },
                      { id: 'PTM_ACTION', label: `PTM Action Needed (${ptmDeclinedCount + ptmRescheduledCount + ptmPendingCount})` },
                    ] as const
                  ).map((tab) => {
                    const isActive = parentFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setParentFilter(tab.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isActive
                            ? 'bg-[#0050CB] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Search Box */}
                <div className="relative min-w-[260px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={parentSearch}
                    onChange={(e) => setParentSearch(e.target.value)}
                    placeholder="Search parent, child, roll no, phone..."
                    className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-[#0050CB]"
                  />
                  {parentSearch && (
                    <button
                      onClick={() => setParentSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Parents Cards Grid */}
              {filteredParentThreads.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E5EEFF] dark:bg-blue-900/30 text-[#0050CB] dark:text-blue-400 flex items-center justify-center mb-3">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">No Parent Records Found</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                    No parents match the filter "{parentFilter}" or search "{parentSearch}".
                  </p>
                  <button
                    onClick={() => {
                      setParentFilter('ALL');
                      setParentSearch('');
                    }}
                    className="mt-4 px-4 py-2 bg-[#0050CB] text-white rounded-xl text-xs font-bold hover:bg-[#003da1] transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredParentThreads.map((thread) => {
                    const hasUnread = thread.unreadCount > 0;
                    const hasAbsence = thread.hasAbsenceNoteToday;
                    const isDeclined = thread.ptmStatus === 'Declined';
                    const isRescheduled = thread.ptmStatus === 'Rescheduled';
                    const isPending = thread.ptmStatus === 'Pending';
                    const isConfirmed = thread.ptmStatus === 'Confirmed';

                    return (
                      <div
                        key={thread.id}
                        className={`bg-white dark:bg-[#000E28] rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${hasUnread
                            ? 'border-[#FF690C]/60 ring-1 ring-[#FF690C]/20'
                            : hasAbsence
                              ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/10'
                              : isDeclined
                                ? 'border-rose-200 dark:border-rose-900/60'
                                : isRescheduled
                                  ? 'border-purple-200 dark:border-purple-900/60'
                                  : 'border-slate-200 dark:border-slate-800'
                          }`}
                      >
                        <div className="space-y-3.5">
                          {/* Parent & Child Profile Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <AppImage
                                src={thread.avatar}
                                alt={thread.parentName}
                                fallbackType="avatar"
                                name={thread.parentName}
                                className="w-12 h-12 rounded-xl object-cover ring-1 ring-blue-200 dark:ring-blue-800 shrink-0"
                              />

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    {thread.parentLabel}
                                  </span>
                                  {hasUnread && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-[#FF690C] text-white text-[9px] font-black animate-pulse">
                                      {thread.unreadCount} New
                                    </span>
                                  )}
                                  {hasAbsence && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-bold">
                                      Absent Today
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-bold text-sm text-[#000E28] dark:text-white truncate mt-0.5">
                                  {thread.parentName}
                                </h3>
                                <p className="text-xs text-[#0050CB] dark:text-blue-400 font-semibold truncate">
                                  Child: {thread.studentName} (Roll {thread.rollNo})
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleOpenDirectChat(thread)}
                              className="p-2 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/80 text-[#0050CB] dark:text-blue-400 hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
                              title="Open 1-on-1 Consultation"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>

                          {/* PTM Details & Parent Confirmation Status Card */}
                          <div className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${isConfirmed
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40'
                              : isDeclined
                                ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-800/40'
                                : isRescheduled
                                  ? 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-800/40'
                                  : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40'
                            }`}>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <CalendarRange className="w-3.5 h-3.5 text-[#0050CB]" />
                                <span>{thread.ptmDate || '2026-09-26'} • {thread.ptmTime || thread.ptmSlot?.split(' - ')[0] || '10:00 AM'}</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isConfirmed
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                  : isDeclined
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                                    : isRescheduled
                                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                }`}>
                                {isConfirmed && '✓ Confirmed'}
                                {isDeclined && '✕ Declined'}
                                {isRescheduled && '↻ Reschedule Req.'}
                                {isPending && '⏳ Pending'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="truncate max-w-[200px]" title={thread.ptmReason || 'Diagnostic Review'}>
                                {thread.ptmReason || 'Term 1 Diagnostic Review'}
                              </span>
                              <span className="font-semibold text-slate-600 dark:text-slate-300">
                                {thread.ptmMode?.includes('Online') ? '🌐 Virtual' : '🏫 Room 102'}
                              </span>
                            </div>

                            {thread.ptmParentNote && (
                              <p className="text-[10px] text-slate-600 dark:text-slate-300 italic pt-0.5 border-t border-slate-200/50 dark:border-slate-700/50">
                                &ldquo;{thread.ptmParentNote}&rdquo;
                              </p>
                            )}

                            <div className="pt-1 flex items-center justify-end">
                              <button
                                onClick={() => handleOpenSchedulePTM(thread)}
                                className="text-[10px] font-bold text-[#0050CB] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <span>Manage PTM Slot</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          {/* Last message preview */}
                          {thread.lastMessage && (
                            <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                <span className="font-bold">{thread.lastSender === 'Parent' ? 'Parent Inquiry' : 'Your Reply'}</span>
                                <span>{thread.lastMessageTime}</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
                                &ldquo;{thread.lastMessage}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Card Action Footer */}
                        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <a
                            href={`tel:${thread.phone}`}
                            className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300 hover:text-[#0050CB] transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{thread.phone}</span>
                          </a>

                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/${thread.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(thread.parentName)},%20this%20is%20Priya%20Sharma,%20Class%20Teacher%20for%20${encodeURIComponent(thread.studentName)}.`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleOpenDirectChat(thread)}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#0050CB] text-white hover:bg-[#003da1] transition-colors cursor-pointer"
                            >
                              Direct Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ================================================================= */}
              {/* MODAL: 1-ON-1 PARENT CONSULTATION DRAWER / CHAT                  */}
              {/* ================================================================= */}
              <AnimatePresence>
                {selectedParentForChat && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedParentForChat(null)}
                      className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="relative w-full max-w-xl bg-white dark:bg-[#000E28] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4 max-h-[92vh] flex flex-col"
                    >
                      {/* Chat Header */}
                      <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
                        <div className="flex items-center gap-3">
                          <AppImage
                            src={selectedParentForChat.avatar}
                            alt={selectedParentForChat.parentName}
                            fallbackType="avatar"
                            name={selectedParentForChat.parentName}
                            className="w-11 h-11 rounded-xl object-cover ring-1 ring-blue-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black text-[#000E28] dark:text-white">
                                {selectedParentForChat.parentName}
                              </h3>
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.2 rounded-full">
                                {selectedParentForChat.parentLabel}
                              </span>
                            </div>
                            <p className="text-xs text-[#0050CB] dark:text-blue-400 font-semibold">
                              Student: {selectedParentForChat.studentName} • Roll {selectedParentForChat.rollNo} (Class LKG-A)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/${selectedParentForChat.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-colors"
                            title="Open in WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <a
                            href={`tel:${selectedParentForChat.phone}`}
                            className="p-1.5 rounded-lg text-[#0050CB] bg-[#E5EEFF] dark:bg-blue-950/40 hover:bg-blue-100 transition-colors"
                            title="Call Guardian"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setSelectedParentForChat(null)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Absence Alert Banner if child is sick/absent */}
                      {selectedParentForChat.hasAbsenceNoteToday && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex items-start gap-2 text-amber-900 dark:text-amber-200 shrink-0">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Absence Reported for Today:</span>
                            <p className="text-[11px] leading-relaxed mt-0.5">
                              {selectedParentForChat.absenceReason || 'Student reported absent by guardian.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Comprehensive PTM Conference Details Box in Chat */}
                      <div className="p-3 rounded-xl bg-[#E5EEFF]/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs shrink-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <CalendarRange className="w-3.5 h-3.5 text-[#0050CB]" />
                            PTM Conference: {selectedParentForChat.ptmDate || '2026-09-26'} • {selectedParentForChat.ptmTime || selectedParentForChat.ptmSlot}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${selectedParentForChat.ptmStatus === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                              : selectedParentForChat.ptmStatus === 'Declined'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300'
                                : selectedParentForChat.ptmStatus === 'Rescheduled'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                            }`}>
                            {selectedParentForChat.ptmStatus === 'Confirmed' && '✓ Confirmed by Parent'}
                            {selectedParentForChat.ptmStatus === 'Declined' && '✕ Declined by Parent'}
                            {selectedParentForChat.ptmStatus === 'Rescheduled' && '↻ Reschedule Requested'}
                            {selectedParentForChat.ptmStatus === 'Pending' && '⏳ Awaiting Confirmation'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                          <span>Agenda: {selectedParentForChat.ptmReason || 'Diagnostic Assessment Progress'}</span>
                          <button
                            onClick={() => handleOpenSchedulePTM(selectedParentForChat)}
                            className="font-bold text-[#0050CB] dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Edit / Reschedule Slot →
                          </button>
                        </div>

                        {selectedParentForChat.ptmParentNote && (
                          <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                            <span className="font-bold block text-[10px] text-slate-400 uppercase">Guardian Note:</span>
                            &ldquo;{selectedParentForChat.ptmParentNote}&rdquo;
                          </div>
                        )}

                        {/* Interactive PTM Simulation Controls for UX Demo */}
                        <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400">Simulate Parent:</span>
                          <button
                            type="button"
                            onClick={() => handleSimulateParentPTMResponse(selectedParentForChat.id, 'Confirm')}
                            className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            ✓ Confirm PTM
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSimulateParentPTMResponse(selectedParentForChat.id, 'Reschedule', 'Parent requested 02:00 PM afternoon slot')}
                            className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            ↻ Request Reschedule
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSimulateParentPTMResponse(selectedParentForChat.id, 'Decline', 'Parent traveling for work on Saturday')}
                            className="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            ✕ Decline Meeting
                          </button>
                        </div>
                      </div>

                      {/* Chat Messages Log */}
                      <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 custom-scrollbar max-h-[280px]">
                        {selectedParentForChat.messages.map((m) => {
                          const isTeacher = m.sender === 'Teacher';

                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${isTeacher
                                    ? 'bg-[#0050CB] text-white rounded-br-xs shadow-xs'
                                    : 'bg-white dark:bg-[#000E28] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-xs shadow-2xs'
                                  }`}
                              >
                                <p className="font-medium whitespace-pre-line">{m.text}</p>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-0.5 px-1">
                                {isTeacher ? 'You' : selectedParentForChat.parentName} • {m.timestamp}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick Canned Responses */}
                      <div className="space-y-1 shrink-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Replies:</span>
                          <button
                            type="button"
                            onClick={() => handleSimulateParentReply(selectedParentForChat.id)}
                            className="text-[10px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 cursor-pointer"
                            title="Simulates parent replying back and creating a Teacher Notification"
                          >
                            <Bell className="w-3 h-3 animate-bounce" />
                            <span>Simulate Parent Reply & Notification</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                          {[
                            'Acknowledged, I will take care of this in class.',
                            'Please send a signed doctor note when child rejoins.',
                            'Confirmed! Looking forward to meeting you at the PTM on Saturday.',
                          ].map((canned, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSendQuickCanned(canned)}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                            >
                              {canned}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Typing Indicator */}
                      {isParentTypingInModal && (
                        <div className="flex items-center gap-2 px-1 text-xs text-slate-400 animate-in fade-in duration-200">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {selectedParentForChat.parentName} is typing
                          </span>
                          <span className="flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-[#0050CB] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-1 rounded-full bg-[#0050CB] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-1 rounded-full bg-[#0050CB] animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        </div>
                      )}

                      {/* Message Input Form */}
                      <form onSubmit={handleSendDirectMessage} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0">
                        <input
                          type="text"
                          required
                          value={chatReplyText}
                          onChange={handleTeacherChatInputChange}
                          placeholder={`Type a private message to ${selectedParentForChat.parentName}...`}
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#0050CB]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* ================================================================= */}
              {/* MODAL: PTM SCHEDULING & CONFERENCE CONFIGURATION                 */}
              {/* ================================================================= */}
              <AnimatePresence>
                {isSchedulePTMModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSchedulePTMModalOpen(false)}
                      className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="relative w-full max-w-lg bg-white dark:bg-[#000E28] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#E5EEFF] dark:bg-blue-900 text-[#0050CB] dark:text-blue-300 flex items-center justify-center font-bold">
                            <CalendarRange className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-[#000E28] dark:text-white">Configure PTM Conference Slot</h3>
                            <p className="text-[11px] text-slate-500">
                              {selectedParentForPTM && ptmForm.targetScope !== 'ALL'
                                ? `Class LKG-A • ${selectedParentForPTM.studentName} (${selectedParentForPTM.parentLabel}) Consultation`
                                : 'Class LKG-A • All Students & Parents Consultation'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsSchedulePTMModalOpen(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleSavePTMSchedule} className="space-y-3.5 text-xs">
                        {/* Target Audience / Student Profile Selector */}
                        <div className="p-3.5 rounded-xl bg-[#E5EEFF]/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#0050CB] dark:text-blue-400" />
                              <span>Consultation Target</span>
                            </label>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-900 text-[#0050CB] dark:text-blue-300">
                              {!selectedParentForPTM || ptmForm.targetScope === 'ALL'
                                ? `${parentThreads.length} Enrolled Pupils`
                                : '1 Student Selected'}
                            </span>
                          </div>

                          <select
                            value={ptmForm.targetScope === 'ALL' || !selectedParentForPTM ? 'ALL' : selectedParentForPTM.id}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'ALL') {
                                setSelectedParentForPTM(null);
                                setPtmForm((prev) => ({ ...prev, targetScope: 'ALL', studentId: 'ALL' }));
                              } else {
                                const found = parentThreads.find((pt) => pt.id === val);
                                if (found) {
                                  setSelectedParentForPTM(found);
                                  setPtmForm((prev) => ({
                                    ...prev,
                                    targetScope: 'INDIVIDUAL',
                                    studentId: found.studentId,
                                    date: found.ptmDate || prev.date,
                                    timeSlot: found.ptmTime || prev.timeSlot,
                                    mode: found.ptmMode || prev.mode,
                                    reason: found.ptmReason || prev.reason,
                                    teacherNotes: found.ptmNotes || prev.teacherNotes,
                                    status: found.ptmStatus || 'Confirmed',
                                    parentResponseNote: found.ptmParentNote || '',
                                  }));
                                }
                              }
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                          >
                            <option value="ALL">👥 All Students — Entire Class LKG-A ({parentThreads.length} Students & Families)</option>
                            <optgroup label="Individual Student Slots">
                              {parentThreads.map((pt) => (
                                <option key={pt.id} value={pt.id}>
                                  Roll {pt.rollNo} • {pt.studentName} ({pt.parentLabel}: {pt.parentName})
                                </option>
                              ))}
                            </optgroup>
                          </select>

                          {!selectedParentForPTM || ptmForm.targetScope === 'ALL' ? (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Applies class-wide consultation schedule to all {parentThreads.length} registered students and dispatches notices to guardians.
                            </p>
                          ) : (
                            <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 border-t border-blue-200/60 dark:border-blue-900/60">
                              <span>Guardian: <strong className="text-slate-800 dark:text-white">{selectedParentForPTM.parentName}</strong> ({selectedParentForPTM.parentLabel})</span>
                              <span>Phone: <strong className="text-slate-800 dark:text-white">{selectedParentForPTM.phone}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Date & Time Slot */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                              Meeting Date <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              min={todayStr}
                              value={ptmForm.date}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val && val < todayStr) {
                                  toast.error("Please pick today or an upcoming meeting date.");
                                  return;
                                }
                                setPtmForm((prev) => ({ ...prev, date: val }));
                              }}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                              Time Slot <span className="text-rose-500">*</span>
                            </label>
                            <select
                              value={ptmForm.timeSlot}
                              onChange={(e) => setPtmForm((prev) => ({ ...prev, timeSlot: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                            >
                              <option value="09:30 AM - 09:45 AM">09:30 AM - 09:45 AM</option>
                              <option value="10:00 AM - 10:15 AM">10:00 AM - 10:15 AM</option>
                              <option value="10:30 AM - 10:45 AM">10:30 AM - 10:45 AM</option>
                              <option value="11:00 AM - 11:15 AM">11:00 AM - 11:15 AM</option>
                              <option value="11:30 AM - 11:45 AM">11:30 AM - 11:45 AM</option>
                              <option value="12:00 PM - 12:15 PM">12:00 PM - 12:15 PM</option>
                              <option value="12:30 PM - 12:45 PM">12:30 PM - 12:45 PM</option>
                              <option value="01:00 PM - 01:15 PM">01:00 PM - 01:15 PM</option>
                              <option value="02:00 PM - 02:15 PM">02:00 PM - 02:15 PM (Afternoon Slot)</option>
                            </select>
                          </div>
                        </div>

                        {/* Meeting Format & Confirmation Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                              Conference Mode
                            </label>
                            <select
                              value={ptmForm.mode}
                              onChange={(e) => setPtmForm((prev) => ({ ...prev, mode: e.target.value as any }))}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                            >
                              <option value="In-Person (Room 102)">In-Person (Room 102 Classroom)</option>
                              <option value="Online (Google Meet)">Online (Google Meet Video Call)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                              Guardian Status
                            </label>
                            <select
                              value={ptmForm.status}
                              onChange={(e) => setPtmForm((prev) => ({ ...prev, status: e.target.value as any }))}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Pending">Pending Confirmation</option>
                              <option value="Rescheduled">Reschedule Requested</option>
                              <option value="Declined">Declined / Conflict</option>
                            </select>
                          </div>
                        </div>

                        {/* Conference Agenda / Reason */}
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Discussion Reason / Agenda <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={ptmForm.reason}
                            onChange={(e) => setPtmForm((prev) => ({ ...prev, reason: e.target.value }))}
                            placeholder="e.g., Term 1 Diagnostic Assessment & Phonics Progress"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                          />
                        </div>

                        {/* Teacher Notes & Instructions */}
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Teacher Preparation Notes for Parent
                          </label>
                          <textarea
                            rows={2}
                            value={ptmForm.teacherNotes}
                            onChange={(e) => setPtmForm((prev) => ({ ...prev, teacherNotes: e.target.value }))}
                            placeholder="e.g., Please bring child's phonics activity book and color pencil kit."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                          />
                        </div>

                        {/* Parent Conflict / Alternate Request Note */}
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Parent Response / Conflict Note (Optional)
                          </label>
                          <input
                            type="text"
                            value={ptmForm.parentResponseNote}
                            onChange={(e) => setPtmForm((prev) => ({ ...prev, parentResponseNote: e.target.value }))}
                            placeholder="e.g., Guardian requested afternoon slot after 2 PM"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => setIsSchedulePTMModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                          >
                            {!selectedParentForPTM || ptmForm.targetScope === 'ALL'
                              ? 'Save & Notify All Parents'
                              : 'Save & Notify Parent'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* ================================================================= */}
              {/* MODAL: CLASS BROADCAST HISTORY LEDGER                             */}
              {/* ================================================================= */}
              <AnimatePresence>
                {broadcastHistoryDrawerOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setBroadcastHistoryDrawerOpen(false)}
                      className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="relative w-full max-w-2xl bg-white dark:bg-[#000E28] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4 max-h-[88vh] flex flex-col"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#E5EEFF] dark:bg-blue-900 text-[#0050CB] dark:text-blue-300 flex items-center justify-center font-bold">
                            <ClipboardList className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-[#000E28] dark:text-white">Class Circular & Broadcast History</h3>
                            <p className="text-[11px] text-slate-500">Dispatches sent to Class LKG-A parent community</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setBroadcastHistoryDrawerOpen(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                        {classBroadcasts.map((bc) => (
                          <div
                            key={bc.id}
                            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-[#0050CB] bg-[#E5EEFF] dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                                  {bc.category}
                                </span>
                                <h4 className="font-bold text-sm text-slate-800 dark:text-white mt-1">
                                  {bc.title}
                                </h4>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">{bc.sentAt}</span>
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                              {bc.message}
                            </p>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                Audience: {bc.targetAudience}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                                  ✓ {bc.deliveryRate}
                                </span>
                                <div className="flex items-center gap-1">
                                  {bc.channels.map((ch) => (
                                    <span key={ch} className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[9px] font-bold">
                                      {ch}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end shrink-0">
                        <button
                          onClick={() => setBroadcastHistoryDrawerOpen(false)}
                          className="px-4 py-2 bg-[#0050CB] text-white rounded-xl text-xs font-bold hover:bg-[#003da1] transition-colors cursor-pointer"
                        >
                          Close History
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 7: UNIFIED MY LEAVE & PROFILE (HR LEAVE SELF-SERVICE + PROFILE/SETTINGS) */}
          {/* ========================================================================= */}
          {(activeTab === 'LEAVE & PROFILE' || activeTab === 'LEAVE') && (
            <div className="space-y-6">
              {/* Segmented Control Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setLeaveProfileSubTab('LEAVE');
                      setActiveTab('LEAVE & PROFILE');
                    }}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer bg-[#0050CB] text-white shadow-sm"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Leave Applications & Quota</span>
                    {pendingLeavesCount > 0 && (
                      <span className="bg-[#FF690C] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                        {pendingLeavesCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setLeaveProfileSubTab('PROFILE');
                      setActiveTab('MY ACCOUNT');
                    }}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Teacher Profile & Account Settings</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
                  <span>Faculty ID: EMP-2024-042</span>
                  <span>•</span>
                  <span>LKG Lead Faculty</span>
                </div>
              </div>

              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#000E28] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E5EEFF] dark:bg-blue-900/40 text-[#0050CB] dark:text-blue-400 flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#000E28] dark:text-white">My Leaves & Time Off</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Track your personal leave quota, submitted applications, and Class LKG-A substitution coverage</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsApplyLeaveModalOpen(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Apply Leave
                  </button>
                </div>
              </div>

              {/* Leave Quota Balances (4 Stat Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="My Casual Leave (CL)"
                  value={leaveStats.casual.remaining}
                  subtitle={`${leaveStats.casual.remaining} of ${leaveStats.casual.total} personal days left`}
                  icon={CalendarIcon}
                  color="blue"
                  trend={{ text: `${leaveStats.casual.used} Used${leaveStats.casual.pending > 0 ? ` • ${leaveStats.casual.pending} Pending` : ''}`, positive: true }}
                  progressBar={{
                    percentage: Math.round((leaveStats.casual.remaining / leaveStats.casual.total) * 100),
                    label: `${Math.round((leaveStats.casual.remaining / leaveStats.casual.total) * 100)}% Available`,
                  }}
                />
                <StatCard
                  label="My Sick Leave (SL)"
                  value={leaveStats.sick.remaining}
                  subtitle={`${leaveStats.sick.remaining} of ${leaveStats.sick.total} personal days left`}
                  icon={Activity}
                  color="emerald"
                  trend={{ text: `${leaveStats.sick.used} Used`, positive: true }}
                  progressBar={{
                    percentage: Math.round((leaveStats.sick.remaining / leaveStats.sick.total) * 100),
                    label: `${Math.round((leaveStats.sick.remaining / leaveStats.sick.total) * 100)}% Available`,
                  }}
                />
                <StatCard
                  label="My Earned Leave (EL)"
                  value={leaveStats.earned.remaining}
                  subtitle={`${leaveStats.earned.remaining} of ${leaveStats.earned.total} personal days left`}
                  icon={Award}
                  color="purple"
                  trend={{ text: `${leaveStats.earned.used} Used`, positive: true }}
                  progressBar={{
                    percentage: Math.round((leaveStats.earned.remaining / leaveStats.earned.total) * 100),
                    label: `${Math.round((leaveStats.earned.remaining / leaveStats.earned.total) * 100)}% Available`,
                  }}
                />
                <div className="bg-white dark:bg-[#000E28] rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">My Active Requests</span>
                    <span className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#FF690C] flex items-center justify-center font-bold text-xs">
                      <Clock className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="my-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#000E28] dark:text-white">{pendingLeavesCount}</span>
                      <span className="text-xs font-semibold text-slate-500">Under Review</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {pendingLeavesCount > 0 ? 'Your application is awaiting Principal sanction' : 'No pending applications'}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">My Assigned Class:</span>
                    <span className="font-bold text-[#0050CB] dark:text-blue-400">Class LKG-A</span>
                  </div>
                </div>
              </div>

              {/* History & Applications Ledger */}
              <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                {/* Search & Filter Header */}
                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                    {(
                      [
                        { id: 'ALL', label: `All My Leaves (${leaves.length})` },
                        { id: 'Pending', label: `Pending (${pendingLeavesCount})`, badgeColor: 'bg-[#FF690C]' },
                        { id: 'Approved', label: `Approved (${leaves.filter((l) => l.status === 'Approved').length})` },
                        { id: 'Rejected', label: `Rejected (${leaves.filter((l) => l.status === 'Rejected').length})` },
                        { id: 'Cancelled', label: `Cancelled (${leaves.filter((l) => l.status === 'Cancelled').length})` },
                      ] as const
                    ).map((tab) => {
                      const isActive = leaveFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setLeaveFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isActive
                              ? 'bg-[#0050CB] text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Bar */}
                  <div className="relative min-w-[240px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={leaveSearch}
                      onChange={(e) => setLeaveSearch(e.target.value)}
                      placeholder="Search my leaves by reason, date, or cover teacher..."
                      className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-[#0050CB]"
                    />
                    {leaveSearch && (
                      <button
                        onClick={() => setLeaveSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Table View */}
                {filteredLeaves.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E5EEFF] dark:bg-blue-900/30 text-[#0050CB] dark:text-blue-400 flex items-center justify-center mb-3">
                      <Clock className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">No Leave Applications Found</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                      {leaveSearch
                        ? `No personal records matching "${leaveSearch}". Try a different keyword or reset filters.`
                        : `You have not submitted any ${leaveFilter !== 'ALL' ? leaveFilter.toLowerCase() : ''} leave applications this academic year.`}
                    </p>
                    <button
                      onClick={() => setIsApplyLeaveModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-[#0050CB] text-white rounded-xl text-xs font-bold hover:bg-[#003da1] transition-all cursor-pointer"
                    >
                      + Apply For Leave
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-4">My Leave Type</th>
                          <th className="py-3 px-4">Applied Dates & Duration</th>
                          <th className="py-3 px-4">Reason & Attachments</th>
                          <th className="py-3 px-4">My Class Cover (LKG-A)</th>
                          <th className="py-3 px-4">Approval Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                        {filteredLeaves.map((item) => {
                          const isPending = item.status === 'Pending';
                          const isApproved = item.status === 'Approved';
                          const isRejected = item.status === 'Rejected';
                          const isCancelled = item.status === 'Cancelled';

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                              {/* Leave Type & Session */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${item.leaveType === 'Casual'
                                        ? 'bg-blue-50 dark:bg-blue-950/50 text-[#0050CB]'
                                        : item.leaveType === 'Sick'
                                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
                                          : 'bg-purple-50 dark:bg-purple-950/50 text-purple-600'
                                      }`}
                                  >
                                    {item.leaveType === 'Casual' ? (
                                      <CalendarIcon className="w-4 h-4" />
                                    ) : item.leaveType === 'Sick' ? (
                                      <Activity className="w-4 h-4" />
                                    ) : (
                                      <Award className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 dark:text-white block">
                                      {item.leaveType} Leave
                                    </span>
                                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                      {item.sessionType}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Dates & Duration */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                    {item.startDate} {item.startDate !== item.endDate && `to ${item.endDate}`}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0050CB] dark:text-blue-400">
                                    <CalendarRange className="w-3 h-3" />
                                    {item.daysCount} {item.daysCount === 1 ? 'Day' : 'Days'}
                                  </span>
                                </div>
                              </td>

                              {/* Reason & Remarks */}
                              <td className="py-3.5 px-4 max-w-[260px]">
                                <p className="text-slate-700 dark:text-slate-300 truncate font-medium" title={item.reason}>
                                  {item.reason}
                                </p>
                                {item.attachmentName && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-[#0050CB] dark:text-blue-400 mt-0.5">
                                    <Paperclip className="w-2.5 h-2.5" />
                                    {item.attachmentName}
                                  </span>
                                )}
                                {item.adminRemark && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate mt-0.5">
                                    Principal Note: {item.adminRemark}
                                  </p>
                                )}
                              </td>

                              {/* My Class Cover (LKG-A) */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-[#0050CB] dark:text-blue-400 shrink-0" />
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                                      {item.substituteTeacher !== 'None Designated' ? item.substituteTeacher : 'No substitute required'}
                                    </span>
                                  </div>
                                  {item.substituteTeacher !== 'None Designated' && (
                                    <span
                                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.substituteStatus === 'Accepted'
                                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                                        }`}
                                    >
                                      {item.substituteStatus === 'Accepted' ? (
                                        <Check className="w-2.5 h-2.5" />
                                      ) : (
                                        <Clock className="w-2.5 h-2.5" />
                                      )}
                                      {item.substituteStatus === 'Accepted' ? 'Cover Confirmed' : 'Cover Pending'}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Status Badge */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${isPending
                                      ? 'bg-orange-50 dark:bg-orange-950/50 text-[#FF690C] border border-[#FF690C]/30'
                                      : isApproved
                                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                        : isRejected
                                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                                    }`}
                                >
                                  {isPending && <Clock className="w-3 h-3 animate-spin" />}
                                  {isApproved && <CheckCircle2 className="w-3 h-3" />}
                                  {isRejected && <XCircle className="w-3 h-3" />}
                                  {isCancelled && <AlertCircle className="w-3 h-3" />}
                                  {item.status}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => setSelectedLeaveDetail(item)}
                                    className="p-1.5 rounded-lg text-[#0050CB] hover:bg-[#E5EEFF] dark:text-blue-400 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                    title="View Application Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {isPending && (
                                    <button
                                      onClick={() => handleCancelLeave(item.id)}
                                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                      title="Withdraw / Cancel Request"
                                    >
                                      <Trash2 className="w-4 h-4" />
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
                )}
              </div>

              {/* Detail View Modal */}
              <AnimatePresence>
                {selectedLeaveDetail && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedLeaveDetail(null)}
                      className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="relative w-full max-w-lg bg-white dark:bg-[#000E28] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-5"
                    >
                      <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] dark:bg-blue-950 text-[#0050CB] dark:text-blue-400 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                              {selectedLeaveDetail.leaveType} Leave Application
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Ref ID: {selectedLeaveDetail.id} • Applied on {selectedLeaveDetail.appliedOn}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedLeaveDetail(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Status Banner */}
                      <div
                        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${selectedLeaveDetail.status === 'Approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : selectedLeaveDetail.status === 'Pending'
                              ? 'bg-orange-50 dark:bg-orange-950/40 text-[#FF690C] border-orange-200 dark:border-orange-800'
                              : selectedLeaveDetail.status === 'Rejected'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-current" />
                          <span>Status: {selectedLeaveDetail.status.toUpperCase()}</span>
                        </div>
                        <span className="text-[11px] font-semibold opacity-85">
                          {selectedLeaveDetail.status === 'Pending'
                            ? 'In Review with Principal'
                            : selectedLeaveDetail.status === 'Approved'
                              ? 'Sanctioned & Recorded'
                              : selectedLeaveDetail.status === 'Rejected'
                                ? 'Application Declined'
                                : 'Withdrawn by Faculty'}
                        </span>
                      </div>

                      {/* Detail Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] text-slate-500 font-semibold block">Date Span</span>
                          <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                            {selectedLeaveDetail.startDate} {selectedLeaveDetail.startDate !== selectedLeaveDetail.endDate ? `to ${selectedLeaveDetail.endDate}` : ''}
                          </span>
                          <span className="text-[11px] text-[#0050CB] dark:text-blue-400 font-medium block mt-0.5">
                            {selectedLeaveDetail.daysCount} Day(s) • {selectedLeaveDetail.sessionType}
                          </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] text-slate-500 font-semibold block">Classroom Cover</span>
                          <span className="font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                            {selectedLeaveDetail.substituteTeacher}
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                            Status: {selectedLeaveDetail.substituteStatus}
                          </span>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-[11px] text-slate-500 font-semibold block mb-1">Reason for Leave</span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          {selectedLeaveDetail.reason}
                        </p>
                      </div>

                      {/* Attachment if present */}
                      {selectedLeaveDetail.attachmentName && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-[#0050CB] dark:text-blue-400" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {selectedLeaveDetail.attachmentName}
                            </span>
                          </div>
                          <button
                            onClick={() => toast.success(`Downloading ${selectedLeaveDetail.attachmentName}...`)}
                            className="text-xs font-bold text-[#0050CB] dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>
                        </div>
                      )}

                      {/* Admin Remark */}
                      {selectedLeaveDetail.adminRemark && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs">
                          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                            Administrative / Principal Remark:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">
                            {selectedLeaveDetail.adminRemark}
                          </p>
                        </div>
                      )}

                      {/* Modal Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        {selectedLeaveDetail.status === 'Pending' ? (
                          <button
                            onClick={() => handleCancelLeave(selectedLeaveDetail.id)}
                            className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer"
                          >
                            Withdraw Application
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Application Archived</span>
                        )}
                        <button
                          onClick={() => setSelectedLeaveDetail(null)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Apply Leave Modal */}
              <AnimatePresence>
                {isApplyLeaveModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsApplyLeaveModalOpen(false)}
                      className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative w-full max-w-xl bg-white dark:bg-[#000E28] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] dark:bg-blue-950 text-[#0050CB] dark:text-blue-400 flex items-center justify-center font-bold">
                            <Plus className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">Apply for Faculty Leave</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Class LKG-A • Academic Year 2026-2027</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsApplyLeaveModalOpen(false)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
                        {/* 1. Leave Type Selector */}
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                            Leave Category <span className="text-rose-500">*</span>
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(
                              [
                                { id: 'Casual', label: 'Casual (CL)', balance: `${leaveStats.casual.remaining} left` },
                                { id: 'Sick', label: 'Sick (SL)', balance: `${leaveStats.sick.remaining} left` },
                                { id: 'Earned', label: 'Earned (EL)', balance: `${leaveStats.earned.remaining} left` },
                              ] as const
                            ).map((cat) => {
                              const isSelected = newLeaveForm.leaveType === cat.id;
                              return (
                                <button
                                  type="button"
                                  key={cat.id}
                                  onClick={() => setNewLeaveForm((prev) => ({ ...prev, leaveType: cat.id }))}
                                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${isSelected
                                      ? 'border-[#0050CB] bg-[#E5EEFF]/60 dark:bg-blue-950/60 dark:border-blue-500 ring-1 ring-[#0050CB]'
                                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                  <span className={`font-bold block ${isSelected ? 'text-[#0050CB] dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {cat.label}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                    {cat.balance}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Session Type */}
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                            Session Duration
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(
                              [
                                { id: 'Full Day', label: 'Full Day' },
                                { id: 'Half Day (Forenoon)', label: 'Forenoon (08:30 - 12:30)' },
                                { id: 'Half Day (Afternoon)', label: 'Afternoon (12:30 - 03:30)' },
                              ] as const
                            ).map((sess) => {
                              const isSelected = newLeaveForm.sessionType === sess.id;
                              return (
                                <button
                                  type="button"
                                  key={sess.id}
                                  onClick={() => setNewLeaveForm((prev) => ({ ...prev, sessionType: sess.id }))}
                                  className={`py-2 px-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${isSelected
                                      ? 'bg-[#0050CB] text-white border-[#0050CB] shadow-xs'
                                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                  {sess.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 3. Dates Range */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                              Start Date <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              min={todayStr}
                              value={newLeaveForm.startDate}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val && val < todayStr) {
                                  toast.error("Leave start date cannot be in the past.");
                                  return;
                                }
                                setNewLeaveForm((prev) => ({
                                  ...prev,
                                  startDate: val,
                                  endDate: prev.endDate && prev.endDate < val ? val : prev.endDate || val,
                                }));
                              }}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                              End Date <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              min={newLeaveForm.startDate || todayStr}
                              value={newLeaveForm.endDate}
                              onChange={(e) => {
                                const val = e.target.value;
                                const minVal = newLeaveForm.startDate || todayStr;
                                if (val && val < minVal) {
                                  toast.error("Leave end date cannot be before start date.");
                                  return;
                                }
                                setNewLeaveForm((prev) => ({ ...prev, endDate: val }));
                              }}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                            />
                          </div>
                        </div>

                        {/* Live Duration Calculation Badge */}
                        {newLeaveForm.startDate && newLeaveForm.endDate && (
                          <div className="p-2.5 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Calculated Leave Duration:
                            </span>
                            <span className="font-black text-[#0050CB] dark:text-blue-400">
                              {newLeaveForm.sessionType.startsWith('Half Day')
                                ? '0.5 Day'
                                : `${Math.max(1, Math.round((new Date(newLeaveForm.endDate).getTime() - new Date(newLeaveForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)} Day(s)`}
                            </span>
                          </div>
                        )}

                        {/* 4. Substitute Teacher Handover */}
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Classroom Substitute / Cover Faculty <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={newLeaveForm.substituteTeacher}
                            onChange={(e) => setNewLeaveForm((prev) => ({ ...prev, substituteTeacher: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                          >
                            <option value="Sunita Rao (Senior PRT - Hindi)">Sunita Rao (Senior PRT - Hindi / Available Period 1-5)</option>
                            <option value="Vikram Singh (Activity & PE Coordinator)">Vikram Singh (Activity & PE Coordinator)</option>
                            <option value="Amit Pathak (Primary Mathematics)">Amit Pathak (Primary Mathematics)</option>
                            <option value="Neha Kapoor (Art & Craft Specialist)">Neha Kapoor (Art & Craft Specialist)</option>
                            <option value="Rajeshwari Menon (Senior EVS)">Rajeshwari Menon (Senior EVS)</option>
                          </select>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            A substitution request notification will be dispatched to this faculty member for Class LKG-A.
                          </p>
                        </div>

                        {/* 5. Reason */}
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Reason for Leave <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={newLeaveForm.reason}
                            onChange={(e) => setNewLeaveForm((prev) => ({ ...prev, reason: e.target.value }))}
                            placeholder="Provide details regarding the reason for leave (e.g. Medical emergency, family function)..."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                          />
                        </div>

                        {/* 6. Medical / Supporting Doc (especially for Sick Leave) */}
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Supporting Document / Medical Slip (Optional)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newLeaveForm.attachmentName}
                              onChange={(e) => setNewLeaveForm((prev) => ({ ...prev, attachmentName: e.target.value }))}
                              placeholder="Filename (e.g., medical_certificate.pdf) or choose file"
                              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setNewLeaveForm((prev) => ({ ...prev, attachmentName: 'medical_fit_cert_attached.pdf' }));
                                toast.success('Sample medical certificate attached!');
                              }}
                              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              Attach Sample
                            </button>
                          </div>
                        </div>

                        {/* 7. Emergency Contact */}
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Emergency Contact Number
                          </label>
                          <input
                            type="text"
                            value={newLeaveForm.emergencyContact}
                            onChange={(e) => setNewLeaveForm((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                          />
                        </div>

                        {/* Footer CTA */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => setIsApplyLeaveModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingLeave}
                            className="px-5 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            {isSubmittingLeave ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              'Submit Leave Application'
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 14: NOTIFICATIONS HUB (FILTERS, SEARCH, DEEP LINKS, BROADCAST)      */}
          {/* ========================================================================= */}
          {activeTab === 'NOTIFICATIONS' && (
            <div className="space-y-6">
              {/* Header & Main Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">Staff Notifications & Bulletins</h2>
                  <p className="text-xs text-slate-500">Stay updated on institutional deadlines, school circulars, and broadcast notices to class parents</p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {unreadNotificationsCount > 0 ? (
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-2xs transition-all"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark All as Read</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => setCreateNoticeModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0050CB] hover:bg-blue-700 text-white cursor-pointer shadow-md shadow-blue-500/20 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post Class Notice</span>
                  </button>

                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${unreadNotificationsCount > 0
                      ? 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60'
                      : 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60'
                    }`}>
                    {unreadNotificationsCount > 0 ? `${unreadNotificationsCount} Unread` : 'All Caught Up ✓'}
                  </span>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={notifSearch}
                    onChange={(e) => setNotifSearch(e.target.value)}
                    placeholder="Search announcements, circulars, or keywords..."
                    className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#0050CB]"
                  />
                  {notifSearch && (
                    <button
                      onClick={() => setNotifSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar text-xs">
                  <button
                    onClick={() => setNotifFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${notifFilter === 'ALL'
                        ? 'bg-[#0050CB] text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                  >
                    All ({notifications.length})
                  </button>

                  <button
                    onClick={() => setNotifFilter('UNREAD')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${notifFilter === 'UNREAD'
                        ? 'bg-[#0050CB] text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                  >
                    Unread ({unreadNotificationsCount})
                  </button>

                  <button
                    onClick={() => setNotifFilter('Urgent')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${notifFilter === 'Urgent'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                      }`}
                  >
                    🚨 Urgent
                  </button>

                  <button
                    onClick={() => setNotifFilter('Academic')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${notifFilter === 'Academic'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                      }`}
                  >
                    📚 Academic
                  </button>

                  <button
                    onClick={() => setNotifFilter('Notice')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${notifFilter === 'Notice'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                      }`}
                  >
                    📢 Notices
                  </button>

                  <button
                    onClick={() => setNotifFilter('Event')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${notifFilter === 'Event'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                      }`}
                  >
                    🎉 Events
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-3">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => {
                    const categoryColors = {
                      Urgent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
                      Academic: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
                      Notice: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
                      Event: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
                    }[notif.category];

                    return (
                      <div
                        key={notif.id}
                        className={`p-4 sm:p-5 rounded-3xl transition-all border ${!notif.isRead
                            ? 'bg-white dark:bg-[#111827] border-blue-200/90 dark:border-blue-800/60 shadow-xs ring-1 ring-blue-500/10'
                            : 'bg-white/80 dark:bg-[#111827]/70 border-slate-200/80 dark:border-slate-800 shadow-2xs opacity-90'
                          } flex flex-col sm:flex-row items-start justify-between gap-4`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${notif.category === 'Urgent'
                              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60'
                              : 'bg-[#E5EEFF] text-[#0050CB] dark:bg-blue-950/50 dark:text-blue-400'
                            }`}>
                            <Bell className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#0050CB] shrink-0" title="Unread" />
                              )}
                              <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white leading-tight">
                                {notif.title}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${categoryColors}`}>
                                {notif.category}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                              {notif.message}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {notif.timestamp}
                              </span>

                              {/* Deep Link Action CTA */}
                              {notif.actionLabel && notif.actionTab && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab(notif.actionTab!);
                                    if (notif.actionTab === 'PARENTS' && notif.actionPayload?.parentThreadId) {
                                      const target = parentThreads.find((p) => p.id === notif.actionPayload!.parentThreadId);
                                      if (target) {
                                        setSelectedParentForChat(target);
                                      }
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 font-bold text-[#0050CB] dark:text-blue-400 hover:underline cursor-pointer"
                                >
                                  <span>{notif.actionLabel}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {!notif.isRead && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200/80 cursor-pointer transition-colors flex items-center gap-1"
                              title="Mark as Read"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Read</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDismissNotification(notif.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                            title="Dismiss Bulletin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  /* Empty State */
                  <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center mx-auto shadow-sm">
                      <CheckCheck className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-white">
                      {notifSearch ? 'No matching bulletins found' : "You're all caught up!"}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      {notifSearch
                        ? `No announcements match "${notifSearch}". Try searching for other terms or reset filters.`
                        : 'There are no unread notifications or deadlines requiring your immediate attention.'}
                    </p>
                    {(notifSearch || notifFilter !== 'ALL') && (
                      <button
                        onClick={() => {
                          setNotifSearch('');
                          setNotifFilter('ALL');
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 7B: FACULTY ACCOUNT & SETTINGS (PROFILE, CONTACT, EXPERIENCE, SECURITY) */}
          {/* ========================================================================= */}
          {activeTab === 'MY ACCOUNT' && (
            <div className="space-y-6">
              {/* Segmented Control Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setLeaveProfileSubTab('LEAVE');
                      setActiveTab('LEAVE & PROFILE');
                    }}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Leave Applications & Quota</span>
                    {pendingLeavesCount > 0 && (
                      <span className="bg-[#FF690C] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                        {pendingLeavesCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setLeaveProfileSubTab('PROFILE');
                      setActiveTab('MY ACCOUNT');
                    }}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer bg-[#0050CB] text-white shadow-sm"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Teacher Profile & Account Settings</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
                  <span>Faculty ID: EMP-2024-042</span>
                  <span>•</span>
                  <span>LKG Lead Faculty</span>
                </div>
              </div>

              {/* Header & Sub-tab Segmented Control */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">Faculty Account & Settings</h2>
                  <p className="text-xs text-slate-500">Manage your profile, contact channels, teaching experience, and security credentials</p>
                </div>

                {/* Sub-tab Pills */}
                <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto">
                  <button
                    onClick={() => setAccountSubTab('profile')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${accountSubTab === 'profile'
                        ? 'bg-[#0050CB] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile & Contact</span>
                  </button>
                  <button
                    onClick={() => setAccountSubTab('academic')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${accountSubTab === 'academic'
                        ? 'bg-[#0050CB] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Experience & Academic</span>
                  </button>
                  <button
                    onClick={() => setAccountSubTab('security')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${accountSubTab === 'security'
                        ? 'bg-[#0050CB] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Security & Password</span>
                  </button>
                </div>
              </div>

              {/* HERO IDENTITY BANNER */}
              <PremiumCard variant="featured" className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <AppImage
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                        alt="Teacher"
                        fallbackType="avatar"
                        name={`${teacherProfile.firstName} ${teacherProfile.lastName}`}
                        className="w-16 h-16 rounded-2xl object-cover ring-4 ring-[#0050CB]/20 shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-[10px]" title="Online">
                        ✓
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">
                          {teacherProfile.firstName} {teacherProfile.lastName}
                        </h3>
                      </div>
                      <p className="text-xs text-[#0050CB] dark:text-blue-400 font-bold mt-0.5">
                        {teacherProfile.designation}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-medium mt-1">
                        <span>ID: {teacherProfile.employeeId}</span>
                        <span>•</span>
                        <span>Joined: {teacherProfile.joinDate}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">RBAC Level 2 Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${isEditingProfile
                          ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                          : 'bg-[#0050CB] text-white hover:bg-blue-700 border-transparent shadow-sm'
                        }`}
                    >
                      {isEditingProfile ? 'Cancel Edit' : 'Edit Profile & Contact'}
                    </button>
                  </div>
                </div>
              </PremiumCard>

              {/* ========================================================================= */}
              {/* SUB-TAB 1: PROFILE & CONTACT DETAILS                                      */}
              {/* ========================================================================= */}
              {accountSubTab === 'profile' && (
                <div className="space-y-6">
                  {isEditingProfile ? (
                    /* EDIT PROFILE FORM */
                    <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-[#0050CB]" />
                          Edit Profile & Contact Information
                        </h4>
                        <span className="text-[11px] text-slate-400">All fields sync with school HR record</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">First Name</label>
                          <input
                            type="text"
                            required
                            value={teacherProfile.firstName}
                            onKeyDown={preventNonAlphaKey}
                            onPaste={(e) => handleNamePaste(e, (clean) => setTeacherProfile((prev) => ({ ...prev, firstName: clean })))}
                            onChange={(e) => setTeacherProfile({ ...teacherProfile, firstName: sanitizeNameInput(e.target.value) })}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Last Name</label>
                          <input
                            type="text"
                            required
                            value={teacherProfile.lastName}
                            onKeyDown={preventNonAlphaKey}
                            onPaste={(e) => handleNamePaste(e, (clean) => setTeacherProfile((prev) => ({ ...prev, lastName: clean })))}
                            onChange={(e) => setTeacherProfile({ ...teacherProfile, lastName: sanitizeNameInput(e.target.value) })}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#0050CB]" />
                            Official Faculty Email
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              disabled
                              value={teacherProfile.email}
                              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-500 cursor-not-allowed"
                            />
                            <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">
                              Locked by IT Admin
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">To change official email, submit a ticket to School IT.</p>
                        </div>

                        <div>
                          <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            Mobile Phone Number (10 digits)
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            value={teacherProfile.phoneNumber}
                            onKeyDown={preventNonNumericKey}
                            onPaste={(e) => handlePhonePaste(e, (clean) => setTeacherProfile((prev) => ({ ...prev, phoneNumber: clean })))}
                            onChange={(e) => setTeacherProfile({ ...teacherProfile, phoneNumber: sanitizePhoneInput(e.target.value) })}
                            placeholder="10-digit mobile number"
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Used for emergency broadcasts and 2FA authentication.</p>
                        </div>

                        <div>
                          <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Designation & Role</label>
                          <input
                            type="text"
                            value={teacherProfile.designation}
                            onChange={(e) => setTeacherProfile({ ...teacherProfile, designation: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Total Experience (Years)</label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={teacherProfile.experienceYears}
                            onChange={(e) => setTeacherProfile({ ...teacherProfile, experienceYears: Number(e.target.value) })}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                        >
                          {isSavingProfile ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Save Profile Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* OVERVIEW CARDS */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* 1. Official Email */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#0050CB]" />
                            Official Faculty Email
                          </span>
                        </div>
                        <p className="text-base font-black text-slate-800 dark:text-white">
                          {teacherProfile.email}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Primary identity used for portal communications, circulars, and diary digests.
                        </p>
                      </div>

                      {/* 2. Phone Number */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            Faculty Contact Phone
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-emerald-600" />
                            WhatsApp Connected
                          </span>
                        </div>
                        <p className="text-base font-black text-slate-800 dark:text-white">
                          {teacherProfile.phoneNumber}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Receives emergency school broadcasts and parent message notifications.
                        </p>
                      </div>

                      {/* 3. Assigned Section */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          Classroom Assignment
                        </span>
                        <p className="text-base font-black text-slate-800 dark:text-white">
                          Lower Kindergarten (Section A)
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Designated Room 102 • 28 Registered Pupils
                        </p>
                      </div>

                      {/* 4. Security Status */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Security & Authorization
                        </span>
                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          Active • RBAC Level 2 Verified
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Authorized for roll-call attendance, formative assessment, and parent messaging.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* EMERGENCY ALTERNATE CONTACT CARD */}
                  <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 dark:text-white block">Emergency Alternate Contact</span>
                      <p className="text-slate-500 text-[11px]">
                        Dr. Rajesh Sharma (Spouse) • +91 94321 09876 • Authorized for urgent campus notifications
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 cursor-pointer shadow-xs"
                    >
                      Update Details
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SUB-TAB 2: ACADEMIC CREDENTIALS & TEACHING EXPERIENCE                     */}
              {/* ========================================================================= */}
              {accountSubTab === 'academic' && (
                <div className="space-y-6">
                  {/* Highlight Stat: Experience */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0050CB] to-[#002B7A] text-white shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-blue-200 tracking-wide uppercase">Teaching Career Milestone</span>
                        <h3 className="text-3xl font-black mt-1">
                          {teacherProfile.experienceYears} Years Total Experience
                        </h3>
                        <p className="text-xs text-blue-100/90 mt-1 max-w-xl">
                          Demonstrated excellence in early childhood pedagogical delivery, cognitive milestone tracking, and foundational numeracy.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                        <Award className="w-6 h-6 text-amber-300" />
                        <div>
                          <span className="text-[10px] text-blue-200 block">Current Tenure</span>
                          <span className="text-xs font-bold">2+ Years at Global Intl</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Academic Degrees & Certifications */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <GraduationCap className="w-5 h-5 text-[#0050CB]" />
                        <h4 className="font-black text-sm text-slate-800 dark:text-white">Academic Qualifications</h4>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <span className="text-[#0050CB] dark:text-blue-400 font-bold block text-sm">
                            {teacherProfile.qualification}
                          </span>
                          <span className="text-slate-400 text-[11px]">Delhi University • First Class Honours with Distinction</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-800 dark:text-slate-200 font-bold block text-sm">
                            Certified Early Childhood Educator (CECE)
                          </span>
                          <span className="text-slate-400 text-[11px]">National Early Childhood Development Council • Reg: 2020/ND-849</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-800 dark:text-slate-200 font-bold block text-sm">
                            Pediatric First Aid & CPR Certified
                          </span>
                          <span className="text-slate-400 text-[11px]">Red Cross India • Valid through Nov 2027</span>
                        </div>
                      </div>
                    </div>

                    {/* Previous Experience & Institutions */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <Briefcase className="w-5 h-5 text-[#FF690C]" />
                        <h4 className="font-black text-sm text-slate-800 dark:text-white">Institutional Track Record</h4>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">GGPS School</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0050CB]">Present</span>
                          </div>
                          <span className="text-slate-500 font-medium block mt-0.5">Primary Class Teacher (LKG - Section A)</span>
                          <span className="text-slate-400 text-[11px]">June 2022 – Present (2+ Years)</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">Delhi Public School</span>
                          <span className="text-slate-500 font-medium block mt-0.5">Assistant Teacher (Kindergarten Wing)</span>
                          <span className="text-slate-400 text-[11px]">May 2019 – May 2022 (3 Years)</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">Little Blossoms Nursery</span>
                          <span className="text-slate-500 font-medium block mt-0.5">Early Learning Facilitator</span>
                          <span className="text-slate-400 text-[11px]">2018 – 2019 (1 Year)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Teaching Subjects & Domains */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 text-xs">
                    <h4 className="font-black text-sm text-slate-800 dark:text-white">Active Classroom Competencies</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0050CB] font-bold border border-blue-200/60">
                        📖 English Phonics & Reading
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200/60">
                        🔢 Early Mathematics & Numeracy
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-200/60">
                        🎵 Rhymes & Storytelling
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                        🎨 Fine Arts, Craft & Sensory Play
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200/60">
                        🏃 Gross Motor & Outdoor Games
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SUB-TAB 3: SECURITY, CHANGE PASSWORD & FORGOT PASSWORD                    */}
              {/* ========================================================================= */}
              {accountSubTab === 'security' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* CHANGE PASSWORD FORM (2 Columns) */}
                  <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <Lock className="w-5 h-5 text-[#0050CB]" />
                      <div>
                        <h4 className="font-black text-sm text-slate-800 dark:text-white">Change Account Password</h4>
                        <p className="text-[11px] text-slate-400">Ensure your password is at least 6 characters and contains a mix of letters and numbers</p>
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                      {/* Current Password */}
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPw ? "text" : "password"}
                            required
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="Enter your current password"
                            className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPw ? "text" : "password"}
                            required
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="Min. 6 characters"
                            className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPw(!showNewPw)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Password Checklist */}
                        <div className="flex items-center gap-4 mt-2 text-[10px]">
                          <span className={`flex items-center gap-1 font-bold ${passwordForm.newPassword.length >= 8 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {passwordForm.newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                          </span>
                          <span className={`flex items-center gap-1 font-bold ${/\d/.test(passwordForm.newPassword) ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {/\d/.test(passwordForm.newPassword) ? '✓' : '○'} Contains number
                          </span>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPw ? "text" : "password"}
                            required
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="Re-enter your new password"
                            className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPw(!showConfirmPw)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setForgotPasswordModalOpen(true)}
                          className="text-[#0050CB] hover:underline font-bold text-xs cursor-pointer flex items-center gap-1"
                        >
                          <Key className="w-3.5 h-3.5" />
                          Forgot your password?
                        </button>

                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer transition-all disabled:opacity-50"
                        >
                          {isChangingPassword ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Update Password</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* FORGOT PASSWORD & RECOVERY PROMPT (1 Column) */}
                  <div className="space-y-4">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#E5EEFF] to-[#F0F5FF] dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-200/80 dark:border-slate-700 shadow-xs space-y-3 text-xs">
                      <div className="w-10 h-10 rounded-2xl bg-[#0050CB] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                        <Key className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-sm text-slate-800 dark:text-white">Forgot Password?</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        Can't remember your current password? Request a secure one-time verification code dispatched directly to your registered faculty email.
                      </p>
                      <button
                        onClick={() => {
                          setForgotSuccessNotice(null);
                          setForgotPasswordModalOpen(true);
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-all flex items-center justify-center gap-2"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send Password Reset PIN</span>
                      </button>
                    </div>

                    <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 text-xs">
                      <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Active Security Standard
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Session protected by 256-bit salted bcrypt encryption, HttpOnly session tokens, and strict Role-Based Access Control.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD FOOTER WITH LOGOUT & RETURN */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Portal</span>
                </button>
                <button
                  onClick={() => setActiveTab('HOME')}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer transition-all"
                >
                  Back to Home Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALS & DRAWERS                                                       */}
      {/* ========================================================================= */}

      {/* MODAL 1: ADD CHILD ENROLLMENT MODAL (AUTOMATIC ID GENERATION & REGISTRAR AUTHORITY) */}
      <EnrollChildModal
        isOpen={addChildModalOpen}
        onClose={() => setAddChildModalOpen(false)}
        onStudentEnrolled={handleChildEnrolled}
        defaultClassName="LKG"
        defaultSectionName="A"
        defaultAcademicYear="2026–27"
        existingClassRoster={students.map((s) => ({ rollNo: s.rollNo, admissionNo: s.admissionNo }))}
      />

      {/* MODAL 1B: EDIT LEARNER / STUDENT PROFILE MODAL */}
      <AnimatePresence>
        {isEditStudentModalOpen && editFormData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/50 flex items-center justify-center text-[#0050CB] dark:text-blue-400 shadow-xs">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                      Edit Student Profile
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E5EEFF] text-[#0050CB] border border-[#0050CB]/20">
                        Roll #{editFormData.rollNo}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Update official identity, residential address, health, and guardian records
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditStudentModalOpen(false);
                    setEditFormData(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStudent} className="space-y-5 text-xs">
                {/* Section 1: Learner Identity */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0050CB] dark:text-blue-400 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5" />
                    <span>1. Learner Identity & Identification</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.rollNo}
                        onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })}
                        placeholder="e.g. 01"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-[#0050CB]/20"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Admission ID
                      </label>
                      <input
                        type="text"
                        value={editFormData.admissionNo || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, admissionNo: e.target.value })}
                        placeholder="e.g. GGSP-2024-LKG-001"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0050CB]/20"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Gender *
                      </label>
                      <select
                        value={editFormData.gender}
                        onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      >
                        <option value="Male">Male (Boy)</option>
                        <option value="Female">Female (Girl)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Child Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.name}
                        onKeyDown={preventNonAlphaKey}
                        onPaste={(e) => handleNamePaste(e, (clean) => setEditFormData((prev) => prev ? ({ ...prev, name: clean }) : null))}
                        onChange={(e) => setEditFormData({ ...editFormData, name: sanitizeNameInput(e.target.value) })}
                        placeholder="e.g. Aarav Sharma"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-[#0050CB]/20"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Blood Group
                      </label>
                      <select
                        value={editFormData.bloodGroup || 'O+'}
                        onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      >
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Age / Development Stage
                      </label>
                      <input
                        type="text"
                        value={editFormData.age}
                        onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                        placeholder="e.g. 4 years 2 months"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={editFormData.dob || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Residential Address & Health Care */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FF690C] uppercase tracking-wider">
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>2. Residential Address & Health Protocol</span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Residential Home Address *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={editFormData.address || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        placeholder="e.g. Flat 402, Lotus Towers, Golf Course Rd, Gurgaon"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0050CB]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Allergies / Medical Alerts
                      </label>
                      <input
                        type="text"
                        value={editFormData.allergies || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
                        placeholder="e.g. Peanut Allergy / None"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Dietary Preference
                      </label>
                      <select
                        value={editFormData.dietaryNote || 'Regular'}
                        onChange={(e) => setEditFormData({ ...editFormData, dietaryNote: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      >
                        <option value="Regular">Regular / General Snackbox</option>
                        <option value="Pure Vegetarian">Pure Vegetarian</option>
                        <option value="Strict Vegetarian (Egg-free)">Strict Vegetarian (Egg-free)</option>
                        <option value="Jain Meal">Jain Meal (No root vegetables)</option>
                        <option value="Dairy-free">Dairy-free / Lactose-free</option>
                        <option value="Nut-free">Nut-free Snackbox Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Guardian Contact & Gate Clearance */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>3. Guardian & Gate Clearance Authorization</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Primary Relation
                      </label>
                      <select
                        value={editFormData.parentLabel || 'Father'}
                        onChange={(e) => setEditFormData({ ...editFormData, parentLabel: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Legal Guardian</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Primary Parent Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.parentName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={editFormData.phone || ''}
                        onKeyDown={preventNonNumericKey}
                        onPaste={(e) => handlePhonePaste(e, (clean) => setEditFormData((prev) => prev ? ({ ...prev, phone: clean }) : null))}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: sanitizePhoneInput(e.target.value) })}
                        placeholder="10-digit mobile number"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Authorized Gate Pickup Person
                      </label>
                      <input
                        type="text"
                        value={editFormData.authorizedPickupPerson || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, authorizedPickupPerson: e.target.value })}
                        placeholder="e.g. Rajesh Sharma (Father)"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Emergency Secondary Phone
                      </label>
                      <input
                        type="text"
                        value={editFormData.emergencyContactPhone || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, emergencyContactPhone: e.target.value })}
                        placeholder="e.g. +91 98112 34567"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditStudentModalOpen(false);
                      setEditFormData(null);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Update Profile</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: 8-TAB LUXURY CHILD PROFILE DRAWER */}
      <ChildProfileDrawer
        student={selectedStudent}
        isOpen={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        onMessageParent={(child) => toast.success(`Messaging parent of ${child.name} via SMS/WhatsApp`)}
      />

      {/* MODAL 3: ATTENDANCE ROLL CALL */}
      <AnimatePresence>
        {attendanceDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-sm text-slate-800 dark:text-white">Daily Attendance Roll-Call</h3>
                </div>
                <button onClick={() => setAttendanceDrawerOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {students.map((child) => (
                  <div key={child.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <AppImage
                        src={child.photo}
                        alt={child.name}
                        fallbackType="avatar"
                        name={child.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-white block">{child.name}</span>
                        <span className="text-[10px] text-slate-400">Roll: {child.rollNo}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {(['Present', 'Absent', 'Late'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => {
                            setStudents((prev) =>
                              prev.map((c) => (c.id === child.id ? { ...c, status: st } : c))
                            );
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${child.status === st
                              ? st === 'Present'
                                ? 'bg-emerald-500 text-white'
                                : st === 'Absent'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-amber-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setAttendanceDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    submitAttendanceToBackend();
                    toast.success('Attendance register submitted & parents updated!');
                    setAttendanceDrawerOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700"
                >
                  Save & Notify Parents
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3B: SUBMIT & LOCK ATTENDANCE REGISTER CONFIRMATION */}
      <AnimatePresence>
        {isAttendanceSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 flex items-center justify-center text-[#0050CB] dark:text-blue-400 shadow-xs">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      Submit & Lock Attendance Register
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {formattedAttendanceDateStr} • LKG - Section A
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAttendanceSubmitModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Attendance Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Present</span>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 block mt-0.5">{presentCount}</span>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/60 text-center">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Absent</span>
                  <span className="text-xl font-black text-rose-700 dark:text-rose-300 block mt-0.5">{absentCount}</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 text-center">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Late</span>
                  <span className="text-xl font-black text-amber-700 dark:text-amber-300 block mt-0.5">{lateCount}</span>
                </div>
              </div>

              {/* Absent Learners Summary List */}
              {absentCount > 0 ? (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Absent Learners to Notify ({absentCount}):</span>
                    <span className="text-[10px] font-normal text-slate-400">Automated SMS/WhatsApp</span>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                    {students
                      .filter((s) => s.status === 'Absent')
                      .map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                          <span className="font-semibold text-slate-800 dark:text-white truncate">
                            {c.name} (Roll #{c.rollNo})
                          </span>
                          <span className="text-[11px] text-slate-400 shrink-0">{c.phone}</span>
                        </div>
                      ))}
                  </div>

                  <label className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyAbsentParents}
                      onChange={(e) => setNotifyAbsentParents(e.target.checked)}
                      className="rounded text-[#0050CB] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Send automated absence notification SMS to parents
                    </span>
                  </label>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 text-center font-semibold">
                  🎉 Perfect 100% attendance! All {students.length} learners are marked Present today.
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Submitting will lock today's morning roll-call record and generate the official daily school attendance log. You can unlock it at any time if adjustments are needed.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAttendanceSubmitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmitAttendance}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm & Lock Register</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: CLASS WORK */}
      <AnimatePresence>
        {classWorkDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Add Class Work / Daily Diary</h3>
                <button onClick={() => setClassWorkDrawerOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={cwSubject}
                    onChange={(e) => setCwSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Topic Covered</label>
                  <input
                    type="text"
                    value={cwTopic}
                    onChange={(e) => setCwTopic(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Teacher Notes</label>
                  <textarea
                    rows={3}
                    value={cwNotes}
                    onChange={(e) => setCwNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setClassWorkDrawerOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400 cursor-pointer">Cancel</button>
                <button
                  onClick={() => {
                    submitClassWorkToBackend(cwSubject, cwTopic, cwNotes);
                    toast.success('Class work published to parent portal & daily diary!');
                    setClassWorkDrawerOpen(false);
                  }}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700"
                >
                  Publish to Parents
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: TIMETABLE MODAL */}
      <AnimatePresence>
        {timetableModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">LKG - Section A Full Weekly Timetable</h3>
                  <p className="text-xs text-slate-400">Class Teacher: Priya Sharma • Room 102</p>
                </div>
                <button onClick={() => setTimetableModalOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 text-xs">
                {[
                  { time: '08:30 - 09:00', title: 'Morning Assembly & Circle Time', room: 'Classroom 102' },
                  { time: '09:00 - 09:45', title: 'Numbers & Counting / Shapes', room: 'Classroom 102' },
                  { time: '09:45 - 10:15', title: 'Healthy Snack & Outdoor Play', room: 'Play Area' },
                  { time: '10:15 - 11:00', title: 'Drawing, Painting & Craft', room: 'Art Studio' },
                  { time: '11:00 - 11:45', title: 'Story Circle & English Phonics', room: 'Library / Room 102' },
                  { time: '12:00 - 01:00', title: 'Lunch & Rest Period', room: 'Early Years Dining' }
                ].map((slot, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block">{slot.title}</span>
                      <span className="text-[10px] text-slate-400">{slot.room}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold text-[10px]">
                      {slot.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setTimetableModalOpen(false)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 6: CREATE ACTIVITY DRAWER */}
      <AnimatePresence>
        {activityDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">Plan New Classroom Activity</h3>
                </div>
                <button onClick={() => setActivityDrawerOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Activity Title</label>
                  <input
                    type="text"
                    value={actTitle}
                    onChange={(e) => setActTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={actCategory}
                    onChange={(e) => setActCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  >
                    <option value="Art & Craft">Art & Craft</option>
                    <option value="Story Time">Story Time</option>
                    <option value="Rhymes">Rhymes</option>
                    <option value="Physical Play">Physical Play</option>
                    <option value="Music">Music</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Activity Description</label>
                  <textarea
                    rows={2}
                    value={actDescription}
                    onChange={(e) => setActDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setActivityDrawerOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400 cursor-pointer">Cancel</button>
                <button
                  onClick={() => {
                    submitActivityToBackend(actTitle, actCategory, actDescription);
                    toast.success('Activity scheduled and published to timeline!');
                    setActivityDrawerOpen(false);
                  }}
                  className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-purple-700"
                >
                  Schedule Activity
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 7: ASSIGN HOMEWORK */}
      <AnimatePresence>
        {homeworkDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">Assign Homework</h3>
                </div>
                <button onClick={() => setHomeworkDrawerOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={hwSubject}
                    onChange={(e) => setHwSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Homework Title</label>
                  <input
                    type="text"
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Instructions / Worksheet</label>
                  <textarea
                    rows={3}
                    value={hwInstructions}
                    onChange={(e) => setHwInstructions(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Submission Due Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={hwDueDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && val < todayStr) {
                        toast.error("Please pick today or an upcoming due date.");
                        return;
                      }
                      setHwDueDate(val);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setHomeworkDrawerOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400 cursor-pointer">Cancel</button>
                <button
                  onClick={() => {
                    submitHomeworkToBackend(hwSubject, hwTitle, hwInstructions, hwDueDate);
                    toast.success('Homework assigned and notified to all parents!');
                    setHomeworkDrawerOpen(false);
                  }}
                  className="px-5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-amber-700"
                >
                  Assign Homework
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 8: BROADCAST PARENT ANNOUNCEMENT (ONE-SHOT BROADCAST) */}
      <AnimatePresence>
        {messageParentDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E5EEFF] dark:bg-blue-900 text-[#0050CB] dark:text-blue-300 flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">One-Shot Class Broadcast</h3>
                    <p className="text-[11px] text-slate-500">Dispatch general announcements & circulars to all families in one click</p>
                  </div>
                </div>
                <button onClick={() => setMessageParentDrawerOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendBroadcastMessage} className="space-y-3.5 text-xs">
                {/* 1. Recipient Target Audience */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Guardian Cohort <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={broadcastForm.audience}
                    onChange={(e) => setBroadcastForm((prev) => ({ ...prev, audience: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                  >
                    <option value="all">All Class LKG - Section A Families (28 Enrolled)</option>
                    <option value="absent">Absent Children Guardians Only (2 Families)</option>
                    <option value="pending_ptm">Pending PTM Confirmation Guardians (4 Families)</option>
                  </select>
                </div>

                {/* 2. Announcement Category & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Circular Category
                    </label>
                    <select
                      value={broadcastForm.category}
                      onChange={(e) => setBroadcastForm((prev) => ({ ...prev, category: e.target.value as any }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                    >
                      <option value="General Circular">General Circular / Notice</option>
                      <option value="Holiday Advisory">Weather & Rain Advisory</option>
                      <option value="Academic Alert">Homework & Curriculum Alert</option>
                      <option value="Event Notice">Celebration & Activity Notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={broadcastForm.priority}
                      onChange={(e) => setBroadcastForm((prev) => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                    >
                      <option value="Standard">Standard Circular</option>
                      <option value="Urgent">🚨 High Priority Alert</option>
                    </select>
                  </div>
                </div>

                {/* 3. Subject / Title */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Announcement Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Grandparents Day Celebration & Photo Collage Submission"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB]"
                  />
                </div>

                {/* 4. Message Content */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Message Content <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {broadcastForm.message.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Dear Parents, We are excited to celebrate Grandparents Day this coming Monday at 10:00 AM. Please send family pictures with your child by Friday morning..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0050CB] leading-relaxed"
                  />
                </div>

                {/* 5. Multi-channel Delivery Toggles */}
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Multi-Channel Delivery Options
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={broadcastForm.sendPush}
                        onChange={(e) => setBroadcastForm((prev) => ({ ...prev, sendPush: e.target.checked }))}
                        className="rounded text-[#0050CB]"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">📱 App Push</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={broadcastForm.sendSms}
                        onChange={(e) => setBroadcastForm((prev) => ({ ...prev, sendSms: e.target.checked }))}
                        className="rounded text-[#0050CB]"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">💬 SMS Alert</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={broadcastForm.sendEmail}
                        onChange={(e) => setBroadcastForm((prev) => ({ ...prev, sendEmail: e.target.checked }))}
                        className="rounded text-[#0050CB]"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">📧 Email</span>
                    </label>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMessageParentDrawerOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Broadcast in One Shot</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 9: CHILD REMARK / OBSERVATION */}
      <AnimatePresence>
        {remarkDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">Add Child Observation / Remark</h3>
                </div>
                <button onClick={() => setRemarkDrawerOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Select Child</label>
                  <select
                    value={remStudentId || students[0]?.id}
                    onChange={(e) => setRemStudentId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} (Roll {s.rollNo})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={remCategory}
                    onChange={(e) => setRemCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  >
                    <option value="Appreciation">Appreciation</option>
                    <option value="Academics">Academics</option>
                    <option value="Behavior">Behavioral & Social</option>
                    <option value="Participation">Classroom Participation</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Observation Note / Remark</label>
                  <textarea
                    rows={3}
                    value={remContent}
                    onChange={(e) => setRemContent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setRemarkDrawerOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400 cursor-pointer">Cancel</button>
                <button
                  onClick={() => {
                    const targetId = remStudentId || students[0]?.id;
                    submitRemarkToBackend(targetId, remCategory, remContent);
                    setRemarkDrawerOpen(false);
                  }}
                  className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-teal-700"
                >
                  Save & Send to Parent
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: FORGOT PASSWORD MODAL */}
      <AnimatePresence>
        {forgotPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200/80 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-800 dark:text-white">Faculty Password Recovery</h3>
                    <p className="text-[10px] text-slate-400">Request a secure one-time verification PIN</p>
                  </div>
                </div>
                <button
                  onClick={() => setForgotPasswordModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {forgotSuccessNotice ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verification Code Dispatched!</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {forgotSuccessNotice.message}
                    </p>
                    {forgotSuccessNotice.pin && (
                      <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-300/80 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Demo Verification PIN</span>
                        <span className="text-2xl font-black tracking-widest text-[#0050CB]">{forgotSuccessNotice.pin}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    Once you receive the code, you may provide it to the School IT Administrator or enter it when prompted to reset your credentials.
                  </p>

                  <button
                    onClick={() => {
                      setForgotPasswordModalOpen(false);
                      setForgotSuccessNotice(null);
                    }}
                    className="w-full py-2.5 bg-[#0050CB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    Done & Return to Portal
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendForgotPassword} className="space-y-4 text-xs">
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Enter your registered official faculty email. A one-time 6-digit recovery PIN and instructions will be sent immediately.
                  </p>

                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Registered Faculty Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="teacher@schoolerp.com"
                        className="w-full p-2.5 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>If you no longer have access to this inbox, please visit the School Admin office in person.</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingForgotReset}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isSendingForgotReset ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch Reset PIN</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: POST / BROADCAST CLASS NOTICE */}
      <AnimatePresence>
        {createNoticeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200/80 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-800 dark:text-white">Post Class Announcement</h3>
                    <p className="text-[10px] text-slate-400">Broadcast bulletin to class parents & school portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setCreateNoticeModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Target Audience</label>
                  <select
                    value={newNoticeData.targetAudience}
                    onChange={(e) => setNewNoticeData({ ...newNoticeData, targetAudience: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                  >
                    <option value="Class LKG-A Parents & Staff">Class LKG-A Parents & Assigned Staff (28 Students)</option>
                    <option value="Class LKG-A Parents Only">Class LKG-A Parents Only</option>
                    <option value="Faculty & Staff Only">Kindergarten Faculty & Co-teachers Only</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Notice Title</label>
                    <input
                      type="text"
                      required
                      value={newNoticeData.title}
                      onChange={(e) => setNewNoticeData({ ...newNoticeData, title: e.target.value })}
                      placeholder="e.g. Color Day Celebration & Dress Code"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Priority / Category</label>
                    <select
                      value={newNoticeData.category}
                      onChange={(e) => setNewNoticeData({ ...newNoticeData, category: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                    >
                      <option value="Notice">📢 General Notice</option>
                      <option value="Urgent">🚨 Urgent / Action Required</option>
                      <option value="Academic">📚 Academic Milestone</option>
                      <option value="Event">🎉 School Event / Activity</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Announcement Details</label>
                  <textarea
                    rows={4}
                    required
                    value={newNoticeData.message}
                    onChange={(e) => setNewNoticeData({ ...newNoticeData, message: e.target.value })}
                    placeholder="Provide clear instructions, dates, requirements, or study notes for parents..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white resize-none"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>Notice will appear in Parent Portal Notification feed and Class Diary.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCreateNoticeModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0050CB] hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Announcement</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OFFICIAL ROLL-CALL ROSTER PREVIEW & EXPORT MODAL */}
      <RollCallRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        className="LKG"
        sectionName="A"
        academicYear="2026–2027"
        classTeacher={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Priya Sharma'}
        students={students}
      />

      {/* GLOBAL ⌘K COMMAND PALETTE */}
      <TeacherCommandPalette
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsSearchModalOpen(false);
        }}
        onSelectStudent={(studentName) => {
          const found = students.find((s) => s.name.toLowerCase().includes(studentName.toLowerCase()));
          if (found) {
            setSelectedStudent(found);
          } else {
            toast.success(`Selected student: ${studentName}`);
          }
          setIsSearchModalOpen(false);
        }}
        onOpenAction={(actionName) => {
          setIsSearchModalOpen(false);
          if (actionName.includes('Attendance')) setAttendanceDrawerOpen(true);
          else if (actionName.includes('Class Work')) setClassWorkDrawerOpen(true);
          else if (actionName.includes('Activity')) setActivityDrawerOpen(true);
          else if (actionName.includes('Homework')) setHomeworkDrawerOpen(true);
          else if (actionName.includes('Message')) setMessageParentDrawerOpen(true);
          else if (actionName.includes('Remark')) setRemarkDrawerOpen(true);
          else toast.success(`Opened: ${actionName}`);
        }}
      />

      {/* GLOBAL TOAST CONTAINER */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0B132B',
            color: '#fff',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            fontSize: '13px',
            fontWeight: 600,
          },
        }}
      />
    </div>
  );
}