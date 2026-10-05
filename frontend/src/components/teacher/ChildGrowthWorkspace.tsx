"use client";

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Activity,
  Award,
  Target,
  Sparkles,
  Users,
  Search,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Download,
  Share2,
  Camera,
  Apple,
  Heart,
  Smile,
  BookOpen,
  MessageSquare,
  Filter,
  Check,
  X,
  Footprints,
  Eye,
  FileText,
  SlidersHorizontal,
  Zap,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppImage from '@/components/ui/AppImage';

export type GrowthDomain = 'OVERVIEW' | 'PHYSICAL' | 'LEARNING' | 'SPEAKING' | 'SOCIAL' | 'HABITS' | 'CHILDREN' | 'REPORT';
export type SkillStatus = 'Mastered' | 'Emerging' | 'Needs Help';

export interface ChildGrowthProfile {
  studentId: string;
  name: string;
  rollNo: string;
  photo: string;
  age: string;
  gender: 'Male' | 'Female';
  overallScore: number;
  lastUpdate: string;
  needsAttention: boolean;
  attentionReason?: string;
  // 1. Physical
  height: number; // cm
  heightPercentile: string;
  weight: number; // kg
  weightBmiStatus: string;
  running: SkillStatus;
  jumping: SkillStatus;
  handMovement: SkillStatus;
  // 2. Learning
  letters: SkillStatus;
  numbers: SkillStatus;
  colours: SkillStatus;
  shapes: SkillStatus;
  remembering: SkillStatus;
  // 3. Speaking
  speaking: SkillStatus;
  listening: SkillStatus;
  newWords: SkillStatus;
  talkingWithOthers: SkillStatus;
  // 4. Social
  sharing: SkillStatus;
  makingFriends: SkillStatus;
  playingTogether: SkillStatus;
  helpingOthers: SkillStatus;
  // 5. Daily Habits
  eating: SkillStatus;
  cleaning: SkillStatus;
  toilet: SkillStatus;
  keepingThings: SkillStatus;
  routine: SkillStatus;
}

export interface GrowthObservation {
  id: string;
  studentId: string;
  studentName: string;
  studentPhoto: string;
  category: 'Physical' | 'Learning' | 'Speaking' | 'Social' | 'Daily Habits';
  skill: string;
  status: SkillStatus;
  note: string;
  date: string;
  photoUrl?: string;
}

const INITIAL_OBSERVATIONS: GrowthObservation[] = [
  {
    id: 'obs-1',
    studentId: 's-01',
    studentName: 'Aarav Sharma',
    studentPhoto: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80',
    category: 'Learning',
    skill: 'Letters & Phonics',
    status: 'Mastered',
    note: 'Recognized letters A through H accurately and sounded out "B-B-Ball" during phonics circle time.',
    date: 'Today, 10:15 AM'
  },
  {
    id: 'obs-2',
    studentId: 's-04',
    studentName: 'Ananya Verma',
    studentPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    category: 'Physical',
    skill: 'Hand Movement (Pincer Grip)',
    status: 'Needs Help',
    note: 'Still uses full-fist grip with wax crayons. Introduced triangular ergonomic grip adapter with good initial response.',
    date: 'Today, 09:30 AM'
  },
  {
    id: 'obs-3',
    studentId: 's-03',
    studentName: 'Vivaan Patel',
    studentPhoto: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
    category: 'Social',
    skill: 'Sharing & Cooperative Play',
    status: 'Mastered',
    note: 'Willfully offered yellow magnetic tiles to Kabir to finish building the airport tower without teacher intervention.',
    date: 'Yesterday, 02:20 PM'
  },
  {
    id: 'obs-4',
    studentId: 's-06',
    studentName: 'Saanvi Iyer',
    studentPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    category: 'Speaking',
    skill: 'Vocabulary & Articulation',
    status: 'Mastered',
    note: 'Used descriptive words "glittery" and "enormous" when narrating her butterfly drawing.',
    date: '17 Sep, 11:40 AM'
  },
  {
    id: 'obs-5',
    studentId: 's-05',
    studentName: 'Kabir Mehta',
    studentPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    category: 'Daily Habits',
    skill: 'Eating & Snack Routine',
    status: 'Mastered',
    note: 'Ate all vegetable cutlets independently with spoon and wiped table cleanly without spilling.',
    date: '16 Sep, 12:10 PM'
  }
];

const INITIAL_PROFILES: ChildGrowthProfile[] = [
  {
    studentId: 's-01',
    name: 'Aarav Sharma',
    rollNo: '01',
    photo: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80',
    age: '4y 3m',
    gender: 'Male',
    overallScore: 92,
    lastUpdate: 'Today',
    needsAttention: false,
    height: 104.2,
    heightPercentile: '58th %ile',
    weight: 16.5,
    weightBmiStatus: 'Healthy',
    running: 'Mastered',
    jumping: 'Mastered',
    handMovement: 'Mastered',
    letters: 'Mastered',
    numbers: 'Mastered',
    colours: 'Mastered',
    shapes: 'Mastered',
    remembering: 'Mastered',
    speaking: 'Mastered',
    listening: 'Mastered',
    newWords: 'Mastered',
    talkingWithOthers: 'Mastered',
    sharing: 'Mastered',
    makingFriends: 'Mastered',
    playingTogether: 'Mastered',
    helpingOthers: 'Mastered',
    eating: 'Mastered',
    cleaning: 'Mastered',
    toilet: 'Mastered',
    keepingThings: 'Mastered',
    routine: 'Mastered'
  },
  {
    studentId: 's-02',
    name: 'Diya Sen',
    rollNo: '02',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    age: '4y 1m',
    gender: 'Female',
    overallScore: 78,
    lastUpdate: 'Yesterday',
    needsAttention: true,
    attentionReason: 'Underweight curve (-1.2 kg) following viral illness; monitor snack nutrition',
    height: 101.5,
    heightPercentile: '42nd %ile',
    weight: 14.1,
    weightBmiStatus: 'Borderline Low',
    running: 'Emerging',
    jumping: 'Mastered',
    handMovement: 'Mastered',
    letters: 'Mastered',
    numbers: 'Emerging',
    colours: 'Mastered',
    shapes: 'Mastered',
    remembering: 'Mastered',
    speaking: 'Emerging',
    listening: 'Mastered',
    newWords: 'Emerging',
    talkingWithOthers: 'Emerging',
    sharing: 'Mastered',
    makingFriends: 'Mastered',
    playingTogether: 'Mastered',
    helpingOthers: 'Emerging',
    eating: 'Needs Help',
    cleaning: 'Mastered',
    toilet: 'Mastered',
    keepingThings: 'Mastered',
    routine: 'Emerging'
  },
  {
    studentId: 's-03',
    name: 'Vivaan Patel',
    rollNo: '03',
    photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
    age: '4y 5m',
    gender: 'Male',
    overallScore: 96,
    lastUpdate: 'Yesterday',
    needsAttention: false,
    height: 106.0,
    heightPercentile: '70th %ile',
    weight: 17.2,
    weightBmiStatus: 'Healthy',
    running: 'Mastered',
    jumping: 'Mastered',
    handMovement: 'Mastered',
    letters: 'Mastered',
    numbers: 'Mastered',
    colours: 'Mastered',
    shapes: 'Mastered',
    remembering: 'Mastered',
    speaking: 'Mastered',
    listening: 'Mastered',
    newWords: 'Mastered',
    talkingWithOthers: 'Mastered',
    sharing: 'Mastered',
    makingFriends: 'Mastered',
    playingTogether: 'Mastered',
    helpingOthers: 'Mastered',
    eating: 'Mastered',
    cleaning: 'Mastered',
    toilet: 'Mastered',
    keepingThings: 'Mastered',
    routine: 'Mastered'
  },
  {
    studentId: 's-04',
    name: 'Ananya Verma',
    rollNo: '04',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    age: '4y 2m',
    gender: 'Female',
    overallScore: 74,
    lastUpdate: 'Today',
    needsAttention: true,
    attentionReason: 'Fine motor delay: persistent palmar fist grip on crayons; requires guided finger tracing',
    height: 102.8,
    heightPercentile: '50th %ile',
    weight: 16.0,
    weightBmiStatus: 'Healthy',
    running: 'Mastered',
    jumping: 'Mastered',
    handMovement: 'Needs Help',
    letters: 'Emerging',
    numbers: 'Mastered',
    colours: 'Mastered',
    shapes: 'Emerging',
    remembering: 'Mastered',
    speaking: 'Mastered',
    listening: 'Mastered',
    newWords: 'Mastered',
    talkingWithOthers: 'Mastered',
    sharing: 'Mastered',
    makingFriends: 'Mastered',
    playingTogether: 'Mastered',
    helpingOthers: 'Mastered',
    eating: 'Mastered',
    cleaning: 'Mastered',
    toilet: 'Mastered',
    keepingThings: 'Needs Help',
    routine: 'Mastered'
  },
  {
    studentId: 's-05',
    name: 'Kabir Mehta',
    rollNo: '05',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    age: '4y 4m',
    gender: 'Male',
    overallScore: 84,
    lastUpdate: '16 Sep',
    needsAttention: true,
    attentionReason: 'Emotional transition: reluctant during morning drop-off, settles after 15 mins of sensory sandbox play',
    height: 103.5,
    heightPercentile: '54th %ile',
    weight: 16.8,
    weightBmiStatus: 'Healthy',
    running: 'Mastered',
    jumping: 'Mastered',
    handMovement: 'Mastered',
    letters: 'Mastered',
    numbers: 'Mastered',
    colours: 'Mastered',
    shapes: 'Mastered',
    remembering: 'Mastered',
    speaking: 'Emerging',
    listening: 'Emerging',
    newWords: 'Mastered',
    talkingWithOthers: 'Emerging',
    sharing: 'Emerging',
    makingFriends: 'Mastered',
    playingTogether: 'Mastered',
    helpingOthers: 'Mastered',
    eating: 'Mastered',
    cleaning: 'Mastered',
    toilet: 'Mastered',
    keepingThings: 'Emerging',
    routine: 'Emerging'
  },
  {
    studentId: 's-06',
    name: 'Saanvi Iyer',
    rollNo: '06',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    age: '4y 6m',
    gender: 'Female',
    overallScore: 98,
    lastUpdate: '17 Sep',
    needsAttention: false,
    height: 105.1,
    heightPercentile: '65th %ile',
    weight: 16.9,
    weightBmiStatus: 'Healthy',
    running: 'Mastered',
    jumping: 'Mastered',
    handMovement: 'Mastered',
    letters: 'Mastered',
    numbers: 'Mastered',
    colours: 'Mastered',
    shapes: 'Mastered',
    remembering: 'Mastered',
    speaking: 'Mastered',
    listening: 'Mastered',
    newWords: 'Mastered',
    talkingWithOthers: 'Mastered',
    sharing: 'Mastered',
    makingFriends: 'Mastered',
    playingTogether: 'Mastered',
    helpingOthers: 'Mastered',
    eating: 'Mastered',
    cleaning: 'Mastered',
    toilet: 'Mastered',
    keepingThings: 'Mastered',
    routine: 'Mastered'
  },
  {
    studentId: 's-07',
    name: 'Ishita Roy',
    rollNo: '07',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    age: '4y 3m',
    gender: 'Female',
    overallScore: 89,
    lastUpdate: '15 Sep',
    needsAttention: false,
    height: 103.0,
    heightPercentile: '52nd %ile',
    weight: 15.8,
    weightBmiStatus: 'Healthy',
    running: 'Mastered',
    jumping: 'Mastered',
    handMovement: 'Mastered',
    letters: 'Mastered',
    numbers: 'Emerging',
    colours: 'Mastered',
    shapes: 'Mastered',
    remembering: 'Mastered',
    speaking: 'Mastered',
    listening: 'Mastered',
    newWords: 'Mastered',
    talkingWithOthers: 'Mastered',
    sharing: 'Mastered',
    makingFriends: 'Mastered',
    playingTogether: 'Mastered',
    helpingOthers: 'Mastered',
    eating: 'Mastered',
    cleaning: 'Mastered',
    toilet: 'Mastered',
    keepingThings: 'Mastered',
    routine: 'Mastered'
  },
  {
    studentId: 's-08',
    name: 'Rohan Singh',
    rollNo: '08',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    age: '4y 5m',
    gender: 'Male',
    overallScore: 76,
    lastUpdate: '14 Sep',
    needsAttention: true,
    attentionReason: 'Social sharing: struggles to wait for turn on playground slide, needs gentle verbal reminder',
    height: 104.8,
    heightPercentile: '62nd %ile',
    weight: 17.5,
    weightBmiStatus: 'Healthy',
    running: 'Mastered',
    jumping: 'Mastered',
    handMovement: 'Mastered',
    letters: 'Emerging',
    numbers: 'Emerging',
    colours: 'Mastered',
    shapes: 'Mastered',
    remembering: 'Emerging',
    speaking: 'Mastered',
    listening: 'Emerging',
    newWords: 'Mastered',
    talkingWithOthers: 'Mastered',
    sharing: 'Needs Help',
    makingFriends: 'Mastered',
    playingTogether: 'Emerging',
    helpingOthers: 'Emerging',
    eating: 'Mastered',
    cleaning: 'Mastered',
    toilet: 'Mastered',
    keepingThings: 'Emerging',
    routine: 'Emerging'
  }
];

interface ChildGrowthWorkspaceProps {
  students?: any[];
  onNavigateTab?: (tab: any) => void;
}

export default function ChildGrowthWorkspace({ students = [], onNavigateTab }: ChildGrowthWorkspaceProps) {
  const [growthSubTab, setGrowthSubTab] = useState<GrowthDomain>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<ChildGrowthProfile[]>(INITIAL_PROFILES);
  const [observations, setObservations] = useState<GrowthObservation[]>(INITIAL_OBSERVATIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedChildForDetail, setSelectedChildForDetail] = useState<ChildGrowthProfile | null>(null);
  const [isReportShared, setIsReportShared] = useState(false);

  // Add observation form state
  const [formStudentId, setFormStudentId] = useState('s-01');
  const [formCategory, setFormCategory] = useState<'Physical' | 'Learning' | 'Speaking' | 'Social' | 'Daily Habits'>('Learning');
  const [formSkill, setFormSkill] = useState('Letters & Phonics');
  const [formStatus, setFormStatus] = useState<SkillStatus>('Mastered');
  const [formNote, setFormNote] = useState('');

  // Domain skills presets
  const DOMAIN_SKILL_PRESETS: Record<string, string[]> = {
    'Physical': ['Height & Weight', 'Running & Obstacles', 'Jumping (Two-foot takeoff)', 'Hand Movement (Pincer Grip)', 'Balance & Posture'],
    'Learning': ['Letters (A-Z Recognition)', 'Numbers (Counting 1-10)', 'Colours Recognition', 'Shapes (2D Geometric)', 'Remembering & Recall'],
    'Speaking': ['Speaking Articulation', 'Listening Comprehension', 'New Words Vocabulary', 'Talking with Others'],
    'Social': ['Sharing Toys & Crayons', 'Making Friends', 'Playing Together (Cooperative)', 'Helping Others & Empathy'],
    'Daily Habits': ['Independent Eating', 'Hand Cleaning & Hygiene', 'Using Toilet Routine', 'Keeping Things Properly', 'Following Classroom Routine']
  };

  const QUICK_NOTE_PRESETS: Record<string, string[]> = {
    'Physical': [
      'Grasped pencil with firm 3-finger tripod grip today.',
      'Jumped over the soft low obstacle with both feet together smoothly.',
      'Ran across the open play court with balanced posture and confident stops.'
    ],
    'Learning': [
      'Identified all primary colours and matched them with flashcards cheerfully.',
      'Counted 10 wooden pegs correctly using one-to-one correspondence.',
      'Recited letter sounds A through G during morning alphabet songs.'
    ],
    'Speaking': [
      'Spoke in complete 5-word sentences when describing home pet.',
      'Listened attentively through the entire 10-minute storytime session.',
      'Used brand new descriptive words to express classroom excitement.'
    ],
    'Social': [
      'Shared magnetic building tiles with classmate without any prompting.',
      'Helped a fallen peer stand up gently and notified teacher.',
      'Took turns happily during the slide and swing playground period.'
    ],
    'Daily Habits': [
      'Washed hands with soap independently before snack and wiped dry.',
      'Placed water bottle and backpack properly inside personal cubby.',
      'Settled down quietly on circle mat immediately when bell rang.'
    ]
  };

  // Filtered profiles for search
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.rollNo.includes(q);
    });
  }, [profiles, searchQuery]);

  // Children needing attention count
  const attentionChildren = useMemo(() => profiles.filter((p) => p.needsAttention), [profiles]);

  // Handle adding new observation
  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedKid = profiles.find((p) => p.studentId === formStudentId) || profiles[0];
    const newObs: GrowthObservation = {
      id: `obs-${Date.now()}`,
      studentId: selectedKid.studentId,
      studentName: selectedKid.name,
      studentPhoto: selectedKid.photo,
      category: formCategory,
      skill: formSkill,
      status: formStatus,
      note: formNote || `${formSkill} observed as ${formStatus} in classroom activity.`,
      date: 'Just now'
    };

    setObservations([newObs, ...observations]);

    // Update profile score slightly
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.studentId === formStudentId) {
          const boost = formStatus === 'Mastered' ? 2 : formStatus === 'Emerging' ? 1 : 0;
          return {
            ...p,
            lastUpdate: 'Just now',
            overallScore: Math.min(100, p.overallScore + boost)
          };
        }
        return p;
      })
    );

    toast.success(`Logged observation for ${selectedKid.name}!`, { icon: '🌱' });
    setIsAddModalOpen(false);
    setFormNote('');
  };

  // Quick skill status toggle in matrices
  const handleToggleSkill = (studentId: string, domainKey: 'running' | 'jumping' | 'handMovement' | 'letters' | 'numbers' | 'colours' | 'shapes' | 'remembering' | 'speaking' | 'listening' | 'newWords' | 'talkingWithOthers' | 'sharing' | 'makingFriends' | 'playingTogether' | 'helpingOthers' | 'eating' | 'cleaning' | 'toilet' | 'keepingThings' | 'routine') => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.studentId === studentId) {
          const current = p[domainKey];
          const next: SkillStatus = current === 'Mastered' ? 'Needs Help' : current === 'Needs Help' ? 'Emerging' : 'Mastered';
          return { ...p, [domainKey]: next, lastUpdate: 'Just now' };
        }
        return p;
      })
    );
    toast.success("Milestone updated!", { duration: 1500 });
  };

  // Helper for status badge
  const renderStatusBadge = (status: SkillStatus, onClick?: () => void) => {
    if (status === 'Mastered') {
      return (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 text-[11px] font-bold cursor-pointer hover:scale-105 transition-transform"
          title="Click to toggle status"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Mastered</span>
        </button>
      );
    }
    if (status === 'Emerging') {
      return (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 text-[11px] font-bold cursor-pointer hover:scale-105 transition-transform"
          title="Click to toggle status"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Emerging</span>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 text-[11px] font-bold cursor-pointer hover:scale-105 transition-transform"
        title="Click to toggle status"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span>Needs Help</span>
      </button>
    );
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & COMMAND HERO BANNER                                       */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0050CB] via-[#072B70] to-[#000E28] p-6 sm:p-7 text-white shadow-md border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[#E5EEFF] text-xs font-bold border border-white/15">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
              <span>Early Childhood Development Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>🌱 Child Growth & Milestones</span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-xl font-medium">
              Track physical growth, motor readiness, phonics, speaking, social empathy, and daily independence for LKG - Section A.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-white text-[#0050CB] hover:bg-blue-50 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#0050CB]" />
              <span>Add Observation</span>
            </button>
            <button
              onClick={() => {
                setIsReportShared(true);
                toast.success("September Developmental Reports shared with all 28 parents via Portal!", { icon: '📲', duration: 4000 });
              }}
              className="px-4 py-2.5 bg-[#FF690C] hover:bg-[#e05a06] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRESCHOOL SUB-TABS NAVIGATION STRIP                                    */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: 'OVERVIEW', label: '📊 Overview', count: attentionChildren.length > 0 ? `${attentionChildren.length} flags` : undefined },
          { id: 'PHYSICAL', label: '📏 Physical Growth' },
          { id: 'LEARNING', label: '📚 Learning Growth' },
          { id: 'SPEAKING', label: '🗣️ Speaking' },
          { id: 'SOCIAL', label: '🤝 Social Growth' },
          { id: 'HABITS', label: '🍎 Daily Habits' },
          { id: 'CHILDREN', label: '👧 Children Directory', count: profiles.length },
          { id: 'REPORT', label: '📄 Growth Report' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setGrowthSubTab(tab.id as GrowthDomain)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 shadow-2xs ${
              growthSubTab === tab.id
                ? 'bg-[#0050CB] text-white font-black shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                growthSubTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: OVERVIEW                                                      */}
      {/* ========================================================================= */}
      {growthSubTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Needing Attention</span>
                <span className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
                {attentionChildren.length} Children
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Pencil grip, nutrition, speech focus</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Cohort Mastery</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                91.4%
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">↑ +4.2% since term start</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Growth This Month</span>
                <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] flex items-center justify-center font-bold text-xs">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                +1.4 cm / +0.4 kg
              </div>
              <p className="text-[11px] text-slate-400 mt-1">WHO healthy growth band</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Observations Logged</span>
                <span className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold text-xs">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {observations.length + 42} Notes
              </div>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">All 28 students documented</p>
            </div>
          </div>

          {/* Two-Column Grid: Left (Children Needing Attention) & Right (Recent Activity Feed) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Triage Cards for Needing Attention */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                        Children Needing Teacher Attention
                      </h3>
                      <p className="text-[11px] text-slate-400">Actionable flags requiring targeted reinforcement</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                    {attentionChildren.length} Flagged
                  </span>
                </div>

                <div className="space-y-3">
                  {attentionChildren.map((kid) => (
                    <div
                      key={kid.studentId}
                      className="p-3.5 rounded-xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <AppImage
                          src={kid.photo}
                          alt={kid.name}
                          fallbackType="avatar"
                          name={kid.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{kid.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-500 font-bold">
                              Roll #{kid.rollNo}
                            </span>
                          </div>
                          <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium mt-0.5 leading-snug">
                            {kid.attentionReason}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setFormStudentId(kid.studentId);
                          setIsAddModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 text-xs font-bold cursor-pointer transition-colors shrink-0"
                      >
                        + Log Note
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-Domain Cohort Mastery Barometers */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                  Classroom Mastery Across 5 Growth Areas
                </h3>
                <div className="space-y-3">
                  {[
                    { label: '📏 Physical Growth', score: 92, color: 'bg-[#0050CB]' },
                    { label: '📚 Learning Growth', score: 88, color: 'bg-indigo-600' },
                    { label: '🗣️ Speaking & Language', score: 90, color: 'bg-blue-500' },
                    { label: '🤝 Social Growth', score: 94, color: 'bg-purple-600' },
                    { label: '🍎 Daily Habits & Toilet', score: 86, color: 'bg-emerald-600' },
                  ].map((dom) => (
                    <div key={dom.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>{dom.label}</span>
                        <span>{dom.score}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${dom.color}`} style={{ width: `${dom.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Recent Updates Feed */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0050CB]" />
                    <span>Recent Observations</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-bold">Latest 5</span>
                </div>

                <div className="space-y-3.5">
                  {observations.slice(0, 5).map((obs) => (
                    <div
                      key={obs.id}
                      className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AppImage
                            src={obs.studentPhoto}
                            alt={obs.studentName}
                            fallbackType="avatar"
                            name={obs.studentName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-bold text-xs text-slate-800 dark:text-white">{obs.studentName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{obs.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 text-[10px] font-bold">
                          {obs.category} • {obs.skill}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          obs.status === 'Mastered'
                            ? 'bg-emerald-100 text-emerald-700'
                            : obs.status === 'Emerging'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {obs.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {obs.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: PHYSICAL GROWTH                                               */}
      {/* ========================================================================= */}
      {growthSubTab === 'PHYSICAL' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-white">
                Physical Growth & Motor Skills Matrix
              </h2>
              <p className="text-xs text-slate-400">Height (cm), Weight (kg), Running, Jumping, and Hand Movement</p>
            </div>
            <button
              onClick={() => {
                setFormCategory('Physical');
                setFormSkill('Height & Weight');
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0050CB] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Biometrics</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Learner</th>
                    <th className="py-3 px-3">Height</th>
                    <th className="py-3 px-3">Weight</th>
                    <th className="py-3 px-3">Running</th>
                    <th className="py-3 px-3">Jumping</th>
                    <th className="py-3 px-3">Hand Movement (Pencil)</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProfiles.map((kid) => (
                    <tr key={kid.studentId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <AppImage
                            src={kid.photo}
                            alt={kid.name}
                            fallbackType="avatar"
                            name={kid.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{kid.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Roll #{kid.rollNo} • {kid.age}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 dark:text-white">{kid.height} cm</span>
                        <span className="block text-[10px] text-blue-600 font-semibold">{kid.heightPercentile}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 dark:text-white">{kid.weight} kg</span>
                        <span className={`block text-[10px] font-semibold ${
                          kid.weightBmiStatus === 'Healthy' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>{kid.weightBmiStatus}</span>
                      </td>
                      <td className="py-3 px-3">
                        {renderStatusBadge(kid.running, () => handleToggleSkill(kid.studentId, 'running'))}
                      </td>
                      <td className="py-3 px-3">
                        {renderStatusBadge(kid.jumping, () => handleToggleSkill(kid.studentId, 'jumping'))}
                      </td>
                      <td className="py-3 px-3">
                        {renderStatusBadge(kid.handMovement, () => handleToggleSkill(kid.studentId, 'handMovement'))}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedChildForDetail(kid)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#E5EEFF] hover:text-[#0050CB] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          View Growth →
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
      {/* SUB-VIEW 3: LEARNING GROWTH                                               */}
      {/* ========================================================================= */}
      {growthSubTab === 'LEARNING' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-white">
                Cognitive & Academic Learning Matrix
              </h2>
              <p className="text-xs text-slate-400">Letters (Phonics), Numbers (1-10), Colours, Shapes, and Memory Recall</p>
            </div>
            <button
              onClick={() => {
                setFormCategory('Learning');
                setFormSkill('Letters & Phonics');
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0050CB] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Learning</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Learner</th>
                    <th className="py-3 px-3">Letters (A-Z)</th>
                    <th className="py-3 px-3">Numbers (1-10)</th>
                    <th className="py-3 px-3">Colours</th>
                    <th className="py-3 px-3">Shapes</th>
                    <th className="py-3 px-3">Remembering</th>
                    <th className="py-3 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProfiles.map((kid) => (
                    <tr key={kid.studentId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <AppImage
                            src={kid.photo}
                            alt={kid.name}
                            fallbackType="avatar"
                            name={kid.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{kid.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Roll #{kid.rollNo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.letters, () => handleToggleSkill(kid.studentId, 'letters'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.numbers, () => handleToggleSkill(kid.studentId, 'numbers'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.colours, () => handleToggleSkill(kid.studentId, 'colours'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.shapes, () => handleToggleSkill(kid.studentId, 'shapes'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.remembering, () => handleToggleSkill(kid.studentId, 'remembering'))}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedChildForDetail(kid)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#E5EEFF] hover:text-[#0050CB] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          View Growth →
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
      {/* SUB-VIEW 4: SPEAKING & LANGUAGE                                           */}
      {/* ========================================================================= */}
      {growthSubTab === 'SPEAKING' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-white">
                Speaking & Communication Milestone Ledger
              </h2>
              <p className="text-xs text-slate-400">Articulation, Listening comprehension, New vocabulary adoption, and Expressive talk</p>
            </div>
            <button
              onClick={() => {
                setFormCategory('Speaking');
                setFormSkill('Speaking Articulation');
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0050CB] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Speaking</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Learner</th>
                    <th className="py-3 px-3">Speaking (Sentences)</th>
                    <th className="py-3 px-3">Listening Comprehension</th>
                    <th className="py-3 px-3">New Words</th>
                    <th className="py-3 px-3">Talking with Others</th>
                    <th className="py-3 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProfiles.map((kid) => (
                    <tr key={kid.studentId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <AppImage
                            src={kid.photo}
                            alt={kid.name}
                            fallbackType="avatar"
                            name={kid.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{kid.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Roll #{kid.rollNo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.speaking, () => handleToggleSkill(kid.studentId, 'speaking'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.listening, () => handleToggleSkill(kid.studentId, 'listening'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.newWords, () => handleToggleSkill(kid.studentId, 'newWords'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.talkingWithOthers, () => handleToggleSkill(kid.studentId, 'talkingWithOthers'))}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedChildForDetail(kid)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#E5EEFF] hover:text-[#0050CB] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          View Growth →
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
      {/* SUB-VIEW 5: SOCIAL GROWTH                                                 */}
      {/* ========================================================================= */}
      {growthSubTab === 'SOCIAL' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-white">
                Social & Emotional Growth Board
              </h2>
              <p className="text-xs text-slate-400">Sharing toys, Making friends, Playing together, and Helping peers</p>
            </div>
            <button
              onClick={() => {
                setFormCategory('Social');
                setFormSkill('Sharing Toys & Crayons');
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0050CB] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Social Observation</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Learner</th>
                    <th className="py-3 px-3">Sharing</th>
                    <th className="py-3 px-3">Making Friends</th>
                    <th className="py-3 px-3">Playing Together</th>
                    <th className="py-3 px-3">Helping Others</th>
                    <th className="py-3 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProfiles.map((kid) => (
                    <tr key={kid.studentId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <AppImage
                            src={kid.photo}
                            alt={kid.name}
                            fallbackType="avatar"
                            name={kid.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{kid.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Roll #{kid.rollNo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.sharing, () => handleToggleSkill(kid.studentId, 'sharing'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.makingFriends, () => handleToggleSkill(kid.studentId, 'makingFriends'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.playingTogether, () => handleToggleSkill(kid.studentId, 'playingTogether'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.helpingOthers, () => handleToggleSkill(kid.studentId, 'helpingOthers'))}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedChildForDetail(kid)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#E5EEFF] hover:text-[#0050CB] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          View Growth →
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
      {/* SUB-VIEW 6: DAILY HABITS                                                  */}
      {/* ========================================================================= */}
      {growthSubTab === 'HABITS' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-white">
                Daily Kindergarten Habits & Routine Tracker
              </h2>
              <p className="text-xs text-slate-400">Independent eating, Hand hygiene, Restroom routine, Cubby care, and Settling down</p>
            </div>
            <button
              onClick={() => {
                setFormCategory('Daily Habits');
                setFormSkill('Independent Eating');
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0050CB] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Daily Habit</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Learner</th>
                    <th className="py-3 px-3">Eating (Spoon)</th>
                    <th className="py-3 px-3">Cleaning (Hands)</th>
                    <th className="py-3 px-3">Using Toilet</th>
                    <th className="py-3 px-3">Keeping Things</th>
                    <th className="py-3 px-3">Following Routine</th>
                    <th className="py-3 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProfiles.map((kid) => (
                    <tr key={kid.studentId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <AppImage
                            src={kid.photo}
                            alt={kid.name}
                            fallbackType="avatar"
                            name={kid.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{kid.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Roll #{kid.rollNo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.eating, () => handleToggleSkill(kid.studentId, 'eating'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.cleaning, () => handleToggleSkill(kid.studentId, 'cleaning'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.toilet, () => handleToggleSkill(kid.studentId, 'toilet'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.keepingThings, () => handleToggleSkill(kid.studentId, 'keepingThings'))}</td>
                      <td className="py-3 px-3">{renderStatusBadge(kid.routine, () => handleToggleSkill(kid.studentId, 'routine'))}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedChildForDetail(kid)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#E5EEFF] hover:text-[#0050CB] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          View Growth →
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
      {/* SUB-VIEW 7: CHILDREN DIRECTORY                                            */}
      {/* ========================================================================= */}
      {growthSubTab === 'CHILDREN' && (
        <div className="space-y-5">
          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search child by name or roll number..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:outline-none text-slate-800 dark:text-white shadow-2xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProfiles.map((kid) => (
              <div
                key={kid.studentId}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <AppImage
                      src={kid.photo}
                      alt={kid.name}
                      fallbackType="avatar"
                      name={kid.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-950"
                    />
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        {kid.overallScore}%
                      </span>
                      <span className="text-[10px] text-slate-400">Overall Track</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{kid.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Roll #{kid.rollNo} • {kid.age}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Height:</span>
                      <span className="font-bold">{kid.height} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Weight:</span>
                      <span className="font-bold">{kid.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Update:</span>
                      <span className="font-bold text-blue-600">{kid.lastUpdate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {kid.needsAttention ? (
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">
                      Flagged
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      On Track
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedChildForDetail(kid)}
                    className="text-xs font-bold text-[#0050CB] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View Growth</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 8: GROWTH REPORT & PARENT SHARING                                */}
      {/* ========================================================================= */}
      {growthSubTab === 'REPORT' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 text-xs font-bold mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Kindergarten Term Progress Dossier</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Monthly Child Growth Summary • September 2026
                </h2>
                <p className="text-xs text-slate-500 mt-1">Class LKG - Section A • Total Enrolled: 28 Pupils</p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => toast.success("Downloading Term 1 Growth Ledger PDF...", { icon: '📄' })}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Ledger PDF</span>
                </button>
                <button
                  onClick={() => {
                    setIsReportShared(true);
                    toast.success("Dispatched child progress dossiers to all 28 parent portals!", { icon: '🚀', duration: 4000 });
                  }}
                  className="px-4 py-2 bg-[#0050CB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isReportShared ? "Shared with Parents ✓" : "Share with Parents"}</span>
                </button>
              </div>
            </div>

            {/* Teacher Qualitative Comments & Cohort Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="p-5 rounded-2xl bg-[#E5EEFF]/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 space-y-2.5">
                <h3 className="font-bold text-sm text-[#0050CB] dark:text-blue-300 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Lead Educator's Monthly Commendation</span>
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  "Section A has shown tremendous growth in sensory independence this term. Over 90% of learners now wash their hands without prompting and pack away toys cheerfully. Letter phonics recognition for sounds A-M is ahead of schedule."
                </p>
                <span className="text-[11px] font-bold text-slate-500 block">
                  — Ms. Rashmi Sharma, Homeroom Lead Teacher
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#FF690C]" />
                  <span>Next Month's Focus Goals (October 2026)</span>
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside font-medium">
                  <li>Reinforce 3-finger tripod grip with triangle wax crayons for 4 flagged students.</li>
                  <li>Introduce two-foot horizontal jumps in PE obstacle games.</li>
                  <li>Expand conversational vocabulary with Autumn nature storytelling themes.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ADD GROWTH OBSERVATION MODAL / DRAWER                                   */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#000E28] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-400 flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">Record Child Growth Observation</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Preschool milestone evaluation & developmental progress record</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveObservation} className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 text-xs">
              {/* Row 1: Select Child & Development Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Select Child */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Select Child <span className="text-rose-500">*</span></span>
                    {(() => {
                      const sel = profiles.find((p) => p.studentId === formStudentId) || profiles[0];
                      return sel ? (
                        <span className="text-[10px] font-bold text-[#0050CB] dark:text-blue-400">
                          Score: {sel.overallScore}%
                        </span>
                      ) : null;
                    })()}
                  </label>
                  <select
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB] transition-colors"
                  >
                    {profiles.map((p) => (
                      <option key={p.studentId} value={p.studentId}>
                        {p.name} (Roll #{p.rollNo}) • Age {p.age}
                      </option>
                    ))}
                  </select>

                  {/* Quick Selected Child Banner */}
                  {(() => {
                    const sel = profiles.find((p) => p.studentId === formStudentId) || profiles[0];
                    if (!sel) return null;
                    return (
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#E5EEFF]/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                        <AppImage
                          src={sel.photo}
                          alt={sel.name}
                          fallbackType="avatar"
                          name={sel.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-300 dark:ring-blue-800"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-800 dark:text-white text-[11px] block truncate">{sel.name}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">LKG-A • Roll {sel.rollNo} • {sel.gender}</span>
                        </div>
                        {sel.needsAttention && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                            Focus Kid
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Development Area Domain Pills */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Development Domain <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'Physical', label: 'Physical', emoji: '🏃‍♂️' },
                        { id: 'Learning', label: 'Learning', emoji: '🧠' },
                        { id: 'Speaking', label: 'Speaking', emoji: '🗣️' },
                        { id: 'Social', label: 'Social', emoji: '🤝' },
                        { id: 'Daily Habits', label: 'Daily Habits', emoji: '🧼' },
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormCategory(cat.id);
                          setFormSkill(DOMAIN_SKILL_PRESETS[cat.id][0]);
                        }}
                        className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          formCategory === cat.id
                            ? 'bg-[#0050CB] text-white border-[#0050CB] shadow-xs shadow-blue-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        } ${cat.id === 'Daily Habits' ? 'col-span-2 sm:col-span-2' : ''}`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Specific Milestone / Skill & Current Milestone Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Specific Milestone / Skill */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Specific Milestone / Skill <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSkill}
                    onChange={(e) => setFormSkill(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB] transition-colors"
                  >
                    {(DOMAIN_SKILL_PRESETS[formCategory] || []).map((sk) => (
                      <option key={sk} value={sk}>
                        {sk}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">Select standard preschool skill for {formCategory} evaluation</p>
                </div>

                {/* Milestone Status Picker */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Current Milestone Status <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'Mastered', label: 'Mastered', icon: '✓', color: 'bg-emerald-600 border-emerald-600 text-white' },
                        { id: 'Emerging', label: 'Emerging', icon: '⏳', color: 'bg-amber-500 border-amber-500 text-white' },
                        { id: 'Needs Help', label: 'Needs Help', icon: '🚩', color: 'bg-rose-500 border-rose-500 text-white' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setFormStatus(st.id)}
                        className={`py-2 px-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all flex flex-col items-center justify-center gap-0.5 ${
                          formStatus === st.id
                            ? `${st.color} shadow-xs`
                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-xs">{st.icon}</span>
                        <span>{st.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {formStatus === 'Mastered' && '✨ Demonstrates skill independently and with ease'}
                    {formStatus === 'Emerging' && '🌱 Skill is in progress; requires partial prompting'}
                    {formStatus === 'Needs Help' && '🚩 Requires 1-on-1 teacher guidance and practice'}
                  </p>
                </div>
              </div>

              {/* Row 3: Quick Suggestions */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="text-amber-500">💡</span>
                  <span>Quick Observation Suggestions (Click to insert):</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(QUICK_NOTE_PRESETS[formCategory] || []).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormNote(preset)}
                      className={`text-left p-2 rounded-xl border text-[11px] leading-snug transition-all cursor-pointer block ${
                        formNote === preset
                          ? 'bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                      title="Click to use this note"
                    >
                      &ldquo;{preset}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Observation Remark Textarea */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Observation Remark & Teacher Notes
                </label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Type specific teacher observation notes, classroom context, or click a suggestion above..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB] transition-colors leading-relaxed"
                />
              </div>

              {/* Footer CTA & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Updates milestone progress score on submit</span>
                </div>

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Observation</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. INDIVIDUAL CHILD GROWTH DETAIL DRAWER                                   */}
      {/* ========================================================================= */}
      {selectedChildForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto space-y-6 custom-scrollbar animate-in slide-in-from-right duration-200 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <AppImage
                  src={selectedChildForDetail.photo}
                  alt={selectedChildForDetail.name}
                  fallbackType="avatar"
                  name={selectedChildForDetail.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#0050CB]"
                />
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {selectedChildForDetail.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Roll #{selectedChildForDetail.rollNo} • {selectedChildForDetail.age}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedChildForDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Score Badge */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-[#0050CB] text-white flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs uppercase font-bold text-blue-100">Overall Milestone Score</span>
                <span className="text-2xl font-black block mt-0.5">{selectedChildForDetail.overallScore}% Mastered</span>
              </div>
              <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black text-lg">
                🌟
              </span>
            </div>

            {/* Physical Biometrics */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Physical Biometrics</h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 font-bold block">Height</span>
                  <span className="text-base font-black text-slate-800 dark:text-white">{selectedChildForDetail.height} cm</span>
                  <span className="text-[10px] text-blue-600 block">{selectedChildForDetail.heightPercentile}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 font-bold block">Weight</span>
                  <span className="text-base font-black text-slate-800 dark:text-white">{selectedChildForDetail.weight} kg</span>
                  <span className="text-[10px] text-emerald-600 block">{selectedChildForDetail.weightBmiStatus}</span>
                </div>
              </div>
            </div>

            {/* Domain Mastery Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Preschool Milestone Breakdown</h4>
              {[
                { domain: '📏 Running & Jumping', status: selectedChildForDetail.running },
                { domain: '✏️ Hand Movement (Grip)', status: selectedChildForDetail.handMovement },
                { domain: '🔤 Letters (Phonics A-Z)', status: selectedChildForDetail.letters },
                { domain: '🔢 Numbers (1-10 Counting)', status: selectedChildForDetail.numbers },
                { domain: '🎨 Colours Recognition', status: selectedChildForDetail.colours },
                { domain: '🗣️ Sentence Articulation', status: selectedChildForDetail.speaking },
                { domain: '🤝 Sharing with Friends', status: selectedChildForDetail.sharing },
                { domain: '🥄 Independent Eating', status: selectedChildForDetail.eating },
                { domain: '🧼 Hand Cleaning & Routine', status: selectedChildForDetail.cleaning },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.domain}</span>
                  {renderStatusBadge(item.status)}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setFormStudentId(selectedChildForDetail.studentId);
                  setSelectedChildForDetail(null);
                  setIsAddModalOpen(true);
                }}
                className="w-full py-2.5 bg-[#0050CB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                + Add New Observation for {selectedChildForDetail.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
