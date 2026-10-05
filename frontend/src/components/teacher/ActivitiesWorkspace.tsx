"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  Check,
  Plus,
  Search,
  Filter,
  Users,
  Camera,
  Share2,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Info,
  Layers,
  Heart,
  Flame,
  Award,
  BookOpen,
  Music,
  Smile,
  Palette,
  Compass,
  Boxes,
  Zap,
  Tag,
  X,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppImage from '@/components/ui/AppImage';

export type ActivityDomain =
  | 'ALL'
  | 'SENSORY'
  | 'FINE_MOTOR'
  | 'GROSS_MOTOR'
  | 'CREATIVE'
  | 'COGNITIVE'
  | 'LANGUAGE'
  | 'OUTDOOR';

export type ActivityStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';

export interface ActivityItem {
  id: string;
  title: string;
  domain: ActivityDomain;
  domainLabel: string;
  icon: string;
  time: string;
  duration: string;
  location: string;
  status: ActivityStatus;
  leadTeacher: string;
  learningGoal: string;
  materials: string[];
  instructions: string[];
  safetyAlert?: string;
  participatedCount: number;
  totalStudents: number;
  photosCount: number;
  heroImage?: string;
  milestoneLinked: string;
}

export interface ActivityMoment {
  id: string;
  activityId: string;
  activityTitle: string;
  photoUrl: string;
  caption: string;
  timestamp: string;
  taggedStudentIds: string[];
  taggedStudentNames: string[];
  isSharedWithParents: boolean;
  domain: ActivityDomain;
}

export interface StudentReference {
  id: string;
  name: string;
  rollNo: string;
  photo: string;
}

interface ActivitiesWorkspaceProps {
  students?: Array<{
    id: string;
    name: string;
    rollNo: string;
    photo: string;
  }>;
  onNavigateTab?: (tab: any) => void;
}

// Default initial activities
const initialActivities: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Sensory Bin Exploration & Sorting',
    domain: 'SENSORY',
    domainLabel: 'Sensory Play',
    icon: '🌾',
    time: '09:30 AM - 10:15 AM',
    duration: '45 mins',
    location: 'Discovery Table (Room 102)',
    status: 'COMPLETED',
    leadTeacher: 'Priya Sharma',
    learningGoal: 'Tactile discrimination, bilateral hand coordination, and scooping precision.',
    materials: ['Kinetic sand & rice', 'Tweezers & wooden scoops', 'Color sorting bowls', 'Textured silicone shapes'],
    instructions: [
      'Encourage children to bury wooden shapes under the rice.',
      'Use tweezers or scoops to retrieve only the blue circles first.',
      'Prompt descriptive words: "Is it rough, smooth, cold, or soft?"'
    ],
    safetyAlert: 'Ensure non-toxic rice; monitor children who put sensory items in mouth.',
    participatedCount: 28,
    totalStudents: 28,
    photosCount: 6,
    heroImage: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?w=600&auto=format&fit=crop&q=80',
    milestoneLinked: 'Pincer grasp & sensory exploration'
  },
  {
    id: 'act-2',
    title: 'Animal Mask Crafting & Pincer Pinching',
    domain: 'FINE_MOTOR',
    domainLabel: 'Fine Motor',
    icon: '🎨',
    time: '10:45 AM - 11:30 AM',
    duration: '45 mins',
    location: 'Art Studio Corner',
    status: 'IN_PROGRESS',
    leadTeacher: 'Priya Sharma & Anjali M.',
    learningGoal: 'Pincer grip strength, paper tearing, symmetrical collage, and animal vocalization.',
    materials: ['Paper plates with eye cutouts', 'Non-toxic glue sticks', 'Felt scraps & yarn', 'Blunt child-safe scissors'],
    instructions: [
      'Demonstrate tearing colored tissue paper into dime-sized patches.',
      'Apply glue stick with thumb and index fingers.',
      'Stick yarn whiskers to tiger and lion mask outlines.'
    ],
    safetyAlert: 'Close supervision with safety scissors. Check adhesive non-toxicity.',
    participatedCount: 26,
    totalStudents: 28,
    photosCount: 9,
    heroImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80',
    milestoneLinked: 'Fine motor precision & scissor grip'
  },
  {
    id: 'act-3',
    title: 'Animal Moves & Obstacle Jungle Hop',
    domain: 'GROSS_MOTOR',
    domainLabel: 'Gross Motor',
    icon: '🏃',
    time: '01:15 PM - 02:00 PM',
    duration: '45 mins',
    location: 'Outdoor Soft Play Courtyard',
    status: 'UPCOMING',
    leadTeacher: 'Coach Vikram & Priya Sharma',
    learningGoal: 'Dynamic balance, two-footed hopping, spatial awareness, and auditory reaction time.',
    materials: ['Foam balance beams', 'Poly spots (stepping stones)', 'Soft foam agility cones', 'Bluetooth speaker with animal beats'],
    instructions: [
      'Play jungle drum rhythm: fast drums = cheetah sprint; heavy bass = elephant stomp.',
      'Children hop across green lily pads without stepping on the "river".',
      'Finish with 5-second frog balance squat.'
    ],
    safetyAlert: 'Clear soft fall matting around balance beam; monitor hydration in sunlight.',
    participatedCount: 0,
    totalStudents: 28,
    photosCount: 0,
    heroImage: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80',
    milestoneLinked: 'Gross motor hopping & balance'
  },
  {
    id: 'act-4',
    title: 'Story Circle: The Very Hungry Caterpillar',
    domain: 'LANGUAGE',
    domainLabel: 'Language & Phonics',
    icon: '📖',
    time: '02:15 PM - 02:45 PM',
    duration: '30 mins',
    location: 'Cozy Reading Rug',
    status: 'UPCOMING',
    leadTeacher: 'Priya Sharma',
    learningGoal: 'Vocabulary expansion (fruits, days of week), prediction, and turn-taking in conversation.',
    materials: ['Big Book edition of The Very Hungry Caterpillar', 'Plush fruit props with holes', 'Felt caterpillar puppet'],
    instructions: [
      'Introduce caterpillar puppet; ask children what caterpillars eat.',
      'Have children take turns feeding the plush fruits to the caterpillar puppet.',
      'Chant rhyme: "One green apple, crunch crunch crunch!"'
    ],
    safetyAlert: 'Ensure calm seating; position children with attention needs near front.',
    participatedCount: 0,
    totalStudents: 28,
    photosCount: 0,
    heroImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    milestoneLinked: 'Listening comprehension & story recall'
  },
  {
    id: 'act-5',
    title: 'Rainbow Geometry Block Towers & Counting',
    domain: 'COGNITIVE',
    domainLabel: 'Cognitive & Early Logic',
    icon: '🧱',
    time: 'Scheduled for Tomorrow',
    duration: '35 mins',
    location: 'STEM Construction Table',
    status: 'UPCOMING',
    leadTeacher: 'Priya Sharma',
    learningGoal: 'Spatial reasoning, 1-to-1 counting up to 10, recognizing 3D geometric stability.',
    materials: ['Natural beechwood blocks', 'Translucent rainbow magnetic tiles', 'Numbered sorting mats 1-5'],
    instructions: [
      'Challenge pairs of students to build a tower using exactly 4 cubes and 1 pyramid roof.',
      'Count together before testing if a light blow knocks it down.',
      'Sort blocks by color and height at pack-away time.'
    ],
    safetyAlert: 'Inspect wooden edges for smooth sanded corners.',
    participatedCount: 0,
    totalStudents: 28,
    photosCount: 0,
    heroImage: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80',
    milestoneLinked: 'Number recognition & spatial logic'
  },
  {
    id: 'act-6',
    title: 'Botanical Leaf Rubbing & Texture Patterns',
    domain: 'OUTDOOR',
    domainLabel: 'Outdoor Nature',
    icon: '🍁',
    time: 'Scheduled for Thursday',
    duration: '40 mins',
    location: 'School Botanical Garden',
    status: 'UPCOMING',
    leadTeacher: 'Priya Sharma',
    learningGoal: 'Appreciation of nature, sensory leaf textures, gentle lateral crayon strokes.',
    materials: ['Fallen neem, peepal & mango leaves', 'Chunky unwrapped wax crayons', 'Thick sketch paper'],
    instructions: [
      'Guide children to collect 2 dry leaves with distinct raised veins.',
      'Place leaf under paper; use flat side of crayon to reveal hidden vein map.',
      'Compare smooth vs serrated leaf borders.'
    ],
    safetyAlert: 'Ensure children wash hands thoroughly after handling outdoor plants.',
    participatedCount: 0,
    totalStudents: 28,
    photosCount: 0,
    heroImage: 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=600&auto=format&fit=crop&q=80',
    milestoneLinked: 'Fine motor wrist control & observation'
  }
];

const initialMoments: ActivityMoment[] = [
  {
    id: 'mom-1',
    activityId: 'act-1',
    activityTitle: 'Sensory Bin Exploration & Sorting',
    photoUrl: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?w=600&auto=format&fit=crop&q=80',
    caption: 'Aarav and Ananya discovering submerged colored rings using scoops! Great bilateral hand balance.',
    timestamp: 'Today, 10:05 AM',
    taggedStudentIds: ['s-01', 's-02'],
    taggedStudentNames: ['Aarav Sharma', 'Ananya Deshmukh'],
    isSharedWithParents: true,
    domain: 'SENSORY'
  },
  {
    id: 'mom-2',
    activityId: 'act-2',
    activityTitle: 'Animal Mask Crafting & Pincer Pinching',
    photoUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80',
    caption: 'Diya concentrated on gluing orange yarn whiskers for her tiger mask. Excellent finger pinch control!',
    timestamp: 'Today, 11:15 AM',
    taggedStudentIds: ['s-03', 's-04'],
    taggedStudentNames: ['Diya Patel', 'Kabir Verma'],
    isSharedWithParents: true,
    domain: 'FINE_MOTOR'
  },
  {
    id: 'mom-3',
    activityId: 'act-5',
    activityTitle: 'Rainbow Geometry Block Towers',
    photoUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80',
    caption: 'Reyansh and Myra collaborated on a 6-tier bridge. Both practiced sharing blocks without conflict.',
    timestamp: 'Yesterday, 02:40 PM',
    taggedStudentIds: ['s-05', 's-06'],
    taggedStudentNames: ['Reyansh Iyer', 'Myra Kapoor'],
    isSharedWithParents: true,
    domain: 'COGNITIVE'
  },
  {
    id: 'mom-4',
    activityId: 'act-6',
    activityTitle: 'Botanical Leaf Rubbing',
    photoUrl: 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=600&auto=format&fit=crop&q=80',
    caption: 'Zara showing off her green peepal leaf rubbing to teacher Priya. High pride in creative work!',
    timestamp: '16 Sep, 11:45 AM',
    taggedStudentIds: ['s-07'],
    taggedStudentNames: ['Zara Khan'],
    isSharedWithParents: false,
    domain: 'OUTDOOR'
  }
];

export default function ActivitiesWorkspace({ students = [], onNavigateTab }: ActivitiesWorkspaceProps) {
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<'SCHEDULE' | 'LIBRARY' | 'MOMENTS' | 'ANALYTICS'>('SCHEDULE');
  const [selectedDomain, setSelectedDomain] = useState<ActivityDomain>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Horizontal scroll state for domain filter pills
  const pillsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkPillScroll = () => {
    if (pillsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = pillsRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  };

  useEffect(() => {
    checkPillScroll();
    window.addEventListener('resize', checkPillScroll);
    return () => window.removeEventListener('resize', checkPillScroll);
  }, []);

  const handleScrollPills = (direction: 'left' | 'right') => {
    if (pillsRef.current) {
      const scrollAmount = 260;
      pillsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkPillScroll, 320);
    }
  };

  // Main state
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [moments, setMoments] = useState<ActivityMoment[]>(initialMoments);

  // Modals & Drawers
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedActivityForLog, setSelectedActivityForLog] = useState<ActivityItem | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<ActivityItem | null>(null);
  const [isAddMomentModalOpen, setIsAddMomentModalOpen] = useState(false);

  // Plan Activity Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState<ActivityDomain>('FINE_MOTOR');
  const [newTime, setNewTime] = useState('11:00 AM - 11:45 AM');
  const [newDuration, setNewDuration] = useState('45 mins');
  const [newLocation, setNewLocation] = useState('Room 102 - Creative Table');
  const [newGoal, setNewGoal] = useState('');
  const [newMaterials, setNewMaterials] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newSafety, setNewSafety] = useState('');

  // Participation Tracking Form State
  const [participationMap, setParticipationMap] = useState<Record<string, 'ENGAGED' | 'PARTICIPATED' | 'SUPPORT_NEEDED' | 'ABSENT'>>({});
  const [participationNotes, setParticipationNotes] = useState('');
  const [syncWithGrowth, setSyncWithGrowth] = useState(true);

  // New Moment Form State
  const [momentActivityId, setMomentActivityId] = useState(activities[0].id);
  const [momentCaption, setMomentCaption] = useState('');
  const [momentSelectedStudents, setMomentSelectedStudents] = useState<string[]>([]);
  const [momentShareParents, setMomentShareParents] = useState(true);

  // Fallback student list if not provided
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

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesDomain = selectedDomain === 'ALL' || act.domain === selectedDomain;
      const matchesSearch =
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.domainLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.learningGoal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.materials.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDomain && matchesSearch;
    });
  }, [activities, selectedDomain, searchQuery]);

  // Quick stats
  const totalPlannedToday = activities.filter((a) => a.time.includes('AM') || a.time.includes('PM')).length;
  const inProgressCount = activities.filter((a) => a.status === 'IN_PROGRESS').length;
  const completedToday = activities.filter((a) => a.status === 'COMPLETED').length;
  const totalMomentsCount = moments.length;

  // Handlers
  const handleStartActivity = (act: ActivityItem) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === act.id ? { ...a, status: 'IN_PROGRESS' as ActivityStatus } : a))
    );
    toast.success(`🚀 "${act.title}" is now LIVE in Room 102!`);
  };

  const handleCompleteActivity = (act: ActivityItem) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === act.id
          ? {
              ...a,
              status: 'COMPLETED' as ActivityStatus,
              participatedCount: a.participatedCount || 28
            }
          : a
      )
    );
    toast.success(`🎉 "${act.title}" marked completed and added to student records!`);
  };

  const openLogParticipation = (act: ActivityItem) => {
    setSelectedActivityForLog(act);
    // Initialize map
    const initialMap: Record<string, 'ENGAGED' | 'PARTICIPATED' | 'SUPPORT_NEEDED' | 'ABSENT'> = {};
    studentRoster.forEach((s) => {
      initialMap[s.id] = 'PARTICIPATED';
    });
    setParticipationMap(initialMap);
    setIsLogModalOpen(true);
  };

  const handleSaveParticipation = () => {
    if (!selectedActivityForLog) return;
    const activeCount = Object.values(participationMap).filter((v) => v !== 'ABSENT').length;

    setActivities((prev) =>
      prev.map((a) =>
        a.id === selectedActivityForLog.id
          ? {
              ...a,
              participatedCount: activeCount,
              status: a.status === 'UPCOMING' ? 'IN_PROGRESS' : a.status
            }
          : a
      )
    );

    setIsLogModalOpen(false);
    toast.success(
      `✅ Logged participation for ${activeCount} students! ${
        syncWithGrowth ? 'Synced with Child Growth & Milestones.' : ''
      }`
    );
  };

  const handleMarkAllParticipation = (status: 'ENGAGED' | 'PARTICIPATED' | 'SUPPORT_NEEDED') => {
    const updated: Record<string, 'ENGAGED' | 'PARTICIPATED' | 'SUPPORT_NEEDED' | 'ABSENT'> = {};
    studentRoster.forEach((s) => {
      updated[s.id] = status;
    });
    setParticipationMap(updated);
  };

  const handleSaveNewActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter an activity title');
      return;
    }

    const domainLabels: Record<ActivityDomain, string> = {
      ALL: 'General',
      SENSORY: 'Sensory Play',
      FINE_MOTOR: 'Fine Motor',
      GROSS_MOTOR: 'Gross Motor',
      CREATIVE: 'Creative Arts',
      COGNITIVE: 'Cognitive & Logic',
      LANGUAGE: 'Language & Phonics',
      OUTDOOR: 'Outdoor Nature'
    };

    const domainIcons: Record<ActivityDomain, string> = {
      ALL: '✨',
      SENSORY: '🌾',
      FINE_MOTOR: '🎨',
      GROSS_MOTOR: '🏃',
      CREATIVE: '🎭',
      COGNITIVE: '🧱',
      LANGUAGE: '📖',
      OUTDOOR: '🍁'
    };

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      title: newTitle.trim(),
      domain: newDomain,
      domainLabel: domainLabels[newDomain],
      icon: domainIcons[newDomain],
      time: newTime,
      duration: newDuration,
      location: newLocation,
      status: 'UPCOMING',
      leadTeacher: 'Priya Sharma',
      learningGoal: newGoal || 'Enhance early preschool developmental skills through guided play.',
      materials: newMaterials ? newMaterials.split(',').map((s) => s.trim()) : ['Classroom standard kit'],
      instructions: newInstructions
        ? newInstructions.split('\n').filter((s) => s.trim().length > 0)
        : ['Introduce materials safely.', 'Model key action step.', 'Allow independent hands-on exploration.'],
      safetyAlert: newSafety || undefined,
      participatedCount: 0,
      totalStudents: 28,
      photosCount: 0,
      heroImage: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?w=600&auto=format&fit=crop&q=80',
      milestoneLinked: 'Preschool active play milestone'
    };

    setActivities((prev) => [newAct, ...prev]);
    setIsPlanModalOpen(false);
    toast.success(`✨ New activity "${newTitle}" added to schedule!`);

    // Reset inputs
    setNewTitle('');
    setNewGoal('');
    setNewMaterials('');
    setNewInstructions('');
    setNewSafety('');
  };

  const handleSaveMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momentCaption.trim()) {
      toast.error('Please enter a caption or observation');
      return;
    }

    const parentActivity = activities.find((a) => a.id === momentActivityId) || activities[0];
    const taggedNames = studentRoster
      .filter((s) => momentSelectedStudents.includes(s.id))
      .map((s) => s.name);

    const newMoment: ActivityMoment = {
      id: `mom-${Date.now()}`,
      activityId: parentActivity.id,
      activityTitle: parentActivity.title,
      photoUrl: parentActivity.heroImage || 'https://images.unsplash.com/photo-1596464716127-f2a829822301?w=600&auto=format&fit=crop&q=80',
      caption: momentCaption.trim(),
      timestamp: 'Just now',
      taggedStudentIds: momentSelectedStudents,
      taggedStudentNames: taggedNames.length > 0 ? taggedNames : ['Classroom Group'],
      isSharedWithParents: momentShareParents,
      domain: parentActivity.domain
    };

    setMoments((prev) => [newMoment, ...prev]);
    // increment photo count on activity
    setActivities((prev) =>
      prev.map((a) => (a.id === parentActivity.id ? { ...a, photosCount: a.photosCount + 1 } : a))
    );

    setIsAddMomentModalOpen(false);
    setMomentCaption('');
    setMomentSelectedStudents([]);
    toast.success(
      `📸 Moment saved! ${momentShareParents ? 'Published to Parent Feed & Child Portfolios.' : ''}`
    );
  };

  const domainPills: Array<{ id: ActivityDomain; label: string; icon: string }> = [
    { id: 'ALL', label: 'All Activities', icon: '✨' },
    { id: 'SENSORY', label: 'Sensory Play', icon: '🌾' },
    { id: 'FINE_MOTOR', label: 'Fine Motor', icon: '🎨' },
    { id: 'GROSS_MOTOR', label: 'Gross Motor', icon: '🏃' },
    { id: 'CREATIVE', label: 'Creative Arts', icon: '🎭' },
    { id: 'COGNITIVE', label: 'Cognitive & Logic', icon: '🧱' },
    { id: 'LANGUAGE', label: 'Language & Phonics', icon: '📖' },
    { id: 'OUTDOOR', label: 'Outdoor Nature', icon: '🍁' }
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & MAIN WORKSPACE TOOLBAR                                     */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#000E28] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/70 text-[#0050CB] dark:text-blue-300 flex items-center justify-center font-bold text-xl shadow-xs">
                🎨
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
                  Classroom Activities & Play Hub
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Class LKG - Section A • Play-based developmental flow, live sessions, and parent moment sharing
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            <button
              onClick={() => {
                if (activities.length > 0) {
                  openLogParticipation(activities.find((a) => a.status === 'IN_PROGRESS') || activities[0]);
                }
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E5EEFF] dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0050CB] dark:text-blue-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-blue-200/60 dark:border-blue-800/40"
            >
              <Users className="w-4 h-4" />
              <span>Log Participation</span>
            </button>

            <button
              onClick={() => setIsAddMomentModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#FF690C]" />
              <span>Capture Moment</span>
            </button>

            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Plan Activity</span>
            </button>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('SCHEDULE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'SCHEDULE'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today's Live Flow</span>
            {inProgressCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF690C] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('LIBRARY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'LIBRARY'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Activity Bank ({activities.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('MOMENTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'MOMENTS'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Moments Gallery ({moments.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ANALYTICS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'ANALYTICS'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Domain Coverage</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP METRICS / KPI SUMMARY BAR                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Today's Schedule
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#000E28] dark:text-white">{totalPlannedToday}</span>
              <span className="text-xs text-slate-500 font-semibold">Planned Sessions</span>
            </div>
            <span className="text-[11px] text-[#0050CB] font-bold mt-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {completedToday} done • {inProgressCount} active
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] flex items-center justify-center font-black">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Class Participation
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#000E28] dark:text-white">96.4%</span>
              <span className="text-xs text-emerald-600 font-bold">High Engagement</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              27 of 28 children participated today
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-black">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Moments Captured
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#000E28] dark:text-white">{totalMomentsCount}</span>
              <span className="text-xs text-[#FF690C] font-bold">Photos Logged</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Directly shared to Parent Feed
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#FF690C] flex items-center justify-center font-black">
            <Camera className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Focus Domain
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-[#000E28] dark:text-white">Fine Motor</span>
              <span className="text-xs text-blue-600 font-bold">Week 3</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Aligned with Term 1 Assessment
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-black">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DOMAIN FILTER PILLS & SEARCH BAR                                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Domain Filter Pills with Left/Right Scroll Controls */}
        <div className="relative flex-1 min-w-0 flex items-center group">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScrollPills('left')}
              className="absolute left-0 z-10 w-7 h-7 rounded-full bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-[#E5EEFF] hover:text-[#0050CB] transition-all cursor-pointer -ml-1"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={pillsRef}
            onScroll={checkPillScroll}
            onWheel={(e) => {
              if (e.deltaY !== 0 && pillsRef.current) {
                pillsRef.current.scrollLeft += e.deltaY;
                checkPillScroll();
              }
            }}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1 px-1 select-none no-scrollbar w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {domainPills.map((pill) => (
              <button
                key={pill.id}
                onClick={() => setSelectedDomain(pill.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedDomain === pill.id
                    ? 'bg-[#000E28] text-white dark:bg-white dark:text-[#000E28] shadow-xs'
                    : 'bg-white dark:bg-[#000E28] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{pill.icon}</span>
                <span>{pill.label}</span>
              </button>
            ))}
          </div>

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScrollPills('right')}
              className="absolute right-0 z-10 w-7 h-7 rounded-full bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-[#E5EEFF] hover:text-[#0050CB] transition-all cursor-pointer -mr-1"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative shrink-0 md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activity, materials, skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#0050CB]"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: TODAY'S LIVE SCHEDULE & FLOW                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'SCHEDULE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0050CB]" />
              <span>Daily Sequence • Today, {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span>
            </h3>
            <span className="text-xs text-slate-500">
              Showing {filteredActivities.length} play sessions
            </span>
          </div>

          <div className="space-y-4">
            {filteredActivities.map((act) => {
              const isLive = act.status === 'IN_PROGRESS';
              const isDone = act.status === 'COMPLETED';

              return (
                <div
                  key={act.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isLive
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 border-[#0050CB] shadow-md ring-1 ring-[#0050CB]/30'
                      : isDone
                      ? 'bg-slate-50/50 dark:bg-[#000E28]/50 border-slate-200 dark:border-slate-800/80 opacity-90'
                      : 'bg-white dark:bg-[#000E28] border-slate-200 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left: Time & Icon & Details */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/80 text-[#0050CB] flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                        {act.icon}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isLive
                                ? 'bg-[#FF690C] text-white animate-pulse'
                                : isDone
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {isLive ? '● Live Now' : isDone ? '✓ Completed' : 'Upcoming'}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full bg-[#E5EEFF] dark:bg-blue-950/40 text-[#0050CB] dark:text-blue-300 text-[10px] font-bold">
                            {act.domainLabel}
                          </span>

                          <span className="text-xs text-slate-400 font-medium">
                            {act.time} • {act.duration}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-[#000E28] dark:text-white leading-tight">
                          {act.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                          <span className="font-bold text-slate-700 dark:text-slate-200">Goal: </span>
                          {act.learningGoal}
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 flex-wrap">
                          <span>📍 {act.location}</span>
                          <span>👩‍🏫 {act.leadTeacher}</span>
                          <span className="text-[#0050CB] font-bold">
                            🎯 Aligned: {act.milestoneLinked}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Student Participation Gauge */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto shrink-0 justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      {/* Participation badge */}
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-slate-400 block font-semibold">Participation</span>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#000E28] dark:text-white">
                          <Users className="w-3.5 h-3.5 text-[#0050CB]" />
                          <span>
                            {act.participatedCount > 0 ? `${act.participatedCount} of ${act.totalStudents}` : 'Not logged yet'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            setSelectedActivityDetail(act);
                            setIsDetailDrawerOpen(true);
                          }}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                          title="View prep checklist and instructions"
                        >
                          <Info className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openLogParticipation(act)}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 text-xs font-bold text-[#0050CB] dark:text-blue-300 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Roster</span>
                        </button>

                        {isLive ? (
                          <button
                            onClick={() => handleCompleteActivity(act)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>End & Complete</span>
                          </button>
                        ) : isDone ? (
                          <button
                            onClick={() => {
                              setSelectedActivityDetail(act);
                              setIsDetailDrawerOpen(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Summary</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartActivity(act)}
                            className="px-4 py-2 rounded-xl bg-[#0050CB] hover:bg-[#003da1] text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Start Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Materials Quick Bar */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-slate-500 overflow-x-auto no-scrollbar">
                      <span className="font-bold text-slate-600 dark:text-slate-400 shrink-0">Supplies:</span>
                      {act.materials.map((mat, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 shrink-0"
                        >
                          {mat}
                        </span>
                      ))}
                    </div>

                    {act.safetyAlert && (
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-[#FF690C]" />
                        {act.safetyAlert}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: ACTIVITY LIBRARY & IDEAS BANK                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'LIBRARY' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider">
                Preschool Play & Curriculum Bank
              </h3>
              <p className="text-xs text-slate-500">
                Evidence-backed kindergarten activities indexed by developmental milestone
              </p>
            </div>
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="px-3.5 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Idea</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="bg-white dark:bg-[#000E28] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-[#0050CB] transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Hero Image */}
                  {act.heroImage && (
                    <div className="h-36 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                      <AppImage
                        src={act.heroImage}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-[#0050CB] dark:text-blue-400 font-bold text-[10px] backdrop-blur-xs">
                          {act.domainLabel}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-center justify-between text-xs">
                        <span className="font-semibold drop-shadow-xs">⏱ {act.duration}</span>
                        <span className="font-semibold drop-shadow-xs">📍 {act.location.split('(')[0]}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-black text-base text-[#000E28] dark:text-white group-hover:text-[#0050CB] transition-colors leading-snug">
                        {act.title}
                      </h4>
                      <span className="text-xl shrink-0">{act.icon}</span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {act.learningGoal}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">Key Supplies:</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1 font-medium">
                        {act.materials.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedActivityDetail(act);
                      setIsDetailDrawerOpen(true);
                    }}
                    className="text-xs font-bold text-[#0050CB] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Guide</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleStartActivity(act)}
                    className="px-3 py-1.5 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Schedule Today
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: MOMENTS & PHOTO EVIDENCE                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'MOMENTS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider">
                Classroom Moments & Visual Evidence
              </h3>
              <p className="text-xs text-slate-500">
                Photo observations linked directly to Child Portfolios & Parent Feeds
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toast.success("All published moments are synced with parents' mobile app!")}
                className="px-3.5 py-2 bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Parent Sync Status: Active</span>
              </button>
              <button
                onClick={() => setIsAddMomentModalOpen(true)}
                className="px-3.5 py-2 bg-[#FF690C] hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload New Moment</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {moments.map((mom) => (
              <div
                key={mom.id}
                className="bg-white dark:bg-[#000E28] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <AppImage
                      src={mom.photoUrl}
                      alt={mom.caption}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      {mom.isSharedWithParents ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                          <Check className="w-3 h-3" /> Shared to Parents
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                          Classroom Internal
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-[#0050CB] dark:text-blue-300 line-clamp-1">
                        {mom.activityTitle}
                      </span>
                      <span className="shrink-0">{mom.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      "{mom.caption}"
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Tagged Children:
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {mom.taggedStudentNames.map((name, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 text-[10px] font-bold"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      toast.success(`Opening parent comments for ${mom.activityTitle}...`);
                    }}
                    className="text-slate-500 hover:text-[#0050CB] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>3 Parent Notes</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onNavigateTab) {
                        onNavigateTab('CHILD GROWTH');
                      }
                      toast.success('Viewing developmental record in Child Growth...');
                    }}
                    className="text-[#0050CB] dark:text-blue-400 font-bold text-[11px] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Growth Card →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: DOMAIN COVERAGE & ANALYTICS                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#000E28] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-black text-[#000E28] dark:text-white">
                Early Childhood Play-Domain Balance (Term 1)
              </h3>
              <p className="text-xs text-slate-500">
                Preschool accreditation requires holistic engagement across all 6 foundational developmental areas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { domain: 'Fine Motor & Hand Strength', pct: 94, sessions: 18, color: 'bg-[#0050CB]', status: 'Exemplary' },
                { domain: 'Sensory & Tactile Play', pct: 98, sessions: 22, color: 'bg-emerald-600', status: 'Exemplary' },
                { domain: 'Gross Motor & Agility', pct: 91, sessions: 15, color: 'bg-[#FF690C]', status: 'On Target' },
                { domain: 'Cognitive & Math Logic', pct: 86, sessions: 12, color: 'bg-purple-600', status: 'Proficient' },
                { domain: 'Language, Rhymes & Phonics', pct: 92, sessions: 16, color: 'bg-blue-500', status: 'Exemplary' },
                { domain: 'Outdoor Nature & Botany', pct: 78, sessions: 8, color: 'bg-amber-600', status: 'Needs Increase' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{item.domain}</span>
                    <span className="text-xs font-black text-[#0050CB] dark:text-blue-300">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>{item.sessions} classroom sessions logged</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Attention Recommendation Card */}
          <div className="bg-[#E5EEFF]/60 dark:bg-blue-950/30 p-5 rounded-3xl border border-[#0050CB]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0050CB]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0050CB] dark:text-blue-300">
                  Teacher Recommendation For Next Week
                </h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Increase Outdoor Nature & Botany sessions by 2 slots. Children Vihaan and Kabir show higher verbal engagement when interacting outdoors with natural materials.
              </p>
            </div>
            <button
              onClick={() => {
                setIsPlanModalOpen(true);
                setNewDomain('OUTDOOR');
                setNewTitle('Outdoor Garden Nature Trail');
              }}
              className="px-4 py-2 bg-[#0050CB] text-white rounded-xl text-xs font-bold hover:bg-[#003da1] transition-all cursor-pointer shrink-0"
            >
              Plan Outdoor Session
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PLAN NEW ACTIVITY DRAWER                                         */}
      {/* ========================================================================= */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] flex items-center justify-center font-bold">
                  🎨
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                    Plan New Classroom Activity
                  </h3>
                  <p className="text-[11px] text-slate-400">Add to kindergarten daily flow or library bank</p>
                </div>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewActivity} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Activity Title <span className="text-[#FF690C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Shaving Cream Letter Tracing & Foam Play"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Developmental Domain
                  </label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value as ActivityDomain)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                  >
                    <option value="FINE_MOTOR">Fine Motor & Hand Strength</option>
                    <option value="SENSORY">Sensory Play & Textures</option>
                    <option value="GROSS_MOTOR">Gross Motor & Movement</option>
                    <option value="CREATIVE">Creative Arts & Drama</option>
                    <option value="COGNITIVE">Cognitive & Math Logic</option>
                    <option value="LANGUAGE">Language & Phonics</option>
                    <option value="OUTDOOR">Outdoor Nature & Botany</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Duration & Time
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Location in School
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Learning Objective / Goal
                </label>
                <input
                  type="text"
                  placeholder="e.g., Letter recognition and finger sensation tracing curves"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Materials Required (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sensitive foam cream, flat trays, wet towels"
                  value={newMaterials}
                  onChange={(e) => setNewMaterials(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Step-by-Step Teacher Instructions (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Spread foam evenly onto tray&#10;Model tracing letter 'S' with index finger&#10;Have child vocalize the letter sound"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Safety / Allergy Alert (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Avoid eye contact; hypo-allergenic foam only"
                  value={newSafety}
                  onChange={(e) => setNewSafety(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl font-bold cursor-pointer transition-all shadow-md shadow-blue-500/20"
                >
                  Schedule Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 1-TAP PARTICIPATION & ROSTER TRACKER                             */}
      {/* ========================================================================= */}
      {isLogModalOpen && selectedActivityForLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedActivityForLog.icon}</span>
                  <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                    Log Participation: {selectedActivityForLog.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedActivityForLog.domainLabel} • Class LKG-A ({studentRoster.length} children)
                </p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Batch Select Buttons */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quick Batch:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMarkAllParticipation('ENGAGED')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold cursor-pointer"
                >
                  All Highly Engaged ★
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAllParticipation('PARTICIPATED')}
                  className="px-2.5 py-1 rounded-lg bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 text-[11px] font-bold cursor-pointer"
                >
                  All Participated ✓
                </button>
              </div>
            </div>

            {/* Student Roster Table / Grid */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {studentRoster.map((st) => {
                const currentStatus = participationMap[st.id] || 'PARTICIPATED';
                return (
                  <div
                    key={st.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <AppImage
                        src={st.photo}
                        alt={st.name}
                        fallbackType="avatar"
                        name={st.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white block">
                          #{st.rollNo} {st.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setParticipationMap((prev) => ({ ...prev, [st.id]: 'ENGAGED' }))}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          currentStatus === 'ENGAGED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Engaged ★
                      </button>

                      <button
                        type="button"
                        onClick={() => setParticipationMap((prev) => ({ ...prev, [st.id]: 'PARTICIPATED' }))}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          currentStatus === 'PARTICIPATED'
                            ? 'bg-[#0050CB] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Active ✓
                      </button>

                      <button
                        type="button"
                        onClick={() => setParticipationMap((prev) => ({ ...prev, [st.id]: 'SUPPORT_NEEDED' }))}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          currentStatus === 'SUPPORT_NEEDED'
                            ? 'bg-[#FF690C] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Needs Help
                      </button>

                      <button
                        type="button"
                        onClick={() => setParticipationMap((prev) => ({ ...prev, [st.id]: 'ABSENT' }))}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          currentStatus === 'ABSENT'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sync Toggle & Notes */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncWithGrowth}
                  onChange={(e) => setSyncWithGrowth(e.target.checked)}
                  className="rounded text-[#0050CB] focus:ring-[#0050CB] w-4 h-4"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Sync milestone observations with Child Growth & Development Portfolios
                </span>
              </label>

              <input
                type="text"
                placeholder="Optional group observation note for this session..."
                value={participationNotes}
                onChange={(e) => setParticipationNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveParticipation}
                className="px-5 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl font-bold cursor-pointer transition-all text-xs shadow-md shadow-blue-500/20"
              >
                Save Participation Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CAPTURE CLASSROOM MOMENT                                         */}
      {/* ========================================================================= */}
      {isAddMomentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#FF690C]" />
                <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                  Capture Classroom Moment
                </h3>
              </div>
              <button
                onClick={() => setIsAddMomentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMoment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Associate with Activity
                </label>
                <select
                  value={momentActivityId}
                  onChange={(e) => setMomentActivityId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                >
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.icon} {a.title} ({a.domainLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Observation Caption / Story
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., Kabir demonstrated great patience sorting colored beads into corresponding bowls..."
                  value={momentCaption}
                  onChange={(e) => setMomentCaption(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tag Children in Photo
                </label>
                <div className="flex items-center gap-1.5 flex-wrap max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  {studentRoster.map((st) => {
                    const isSelected = momentSelectedStudents.includes(st.id);
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setMomentSelectedStudents((prev) => prev.filter((id) => id !== st.id));
                          } else {
                            setMomentSelectedStudents((prev) => [...prev, st.id]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0050CB] text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {st.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={momentShareParents}
                    onChange={(e) => setMomentShareParents(e.target.checked)}
                    className="rounded text-[#0050CB] focus:ring-[#0050CB] w-4 h-4"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Publish directly to Parent Daily Feed & Child Growth Portfolio
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMomentModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF690C] hover:bg-orange-600 text-white rounded-xl font-bold cursor-pointer transition-all shadow-xs"
                >
                  Upload & Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: ACTIVITY DETAIL, PREP & STEP-BY-STEP GUIDE                        */}
      {/* ========================================================================= */}
      {isDetailDrawerOpen && selectedActivityDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white dark:bg-[#000E28] p-6 shadow-2xl overflow-y-auto space-y-5 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedActivityDetail.icon}</span>
                <div>
                  <h3 className="font-black text-base text-[#000E28] dark:text-white">
                    {selectedActivityDetail.title}
                  </h3>
                  <span className="text-xs text-[#0050CB] font-bold">
                    {selectedActivityDetail.domainLabel}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedActivityDetail.heroImage && (
              <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <AppImage
                  src={selectedActivityDetail.heroImage}
                  alt={selectedActivityDetail.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-400 block uppercase text-[10px]">Learning Goal:</span>
                <p className="font-semibold text-slate-800 dark:text-white leading-relaxed">
                  {selectedActivityDetail.learningGoal}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 text-xs">
                  Materials Checklist:
                </span>
                <div className="space-y-1">
                  {selectedActivityDetail.materials.map((mat, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{mat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 text-xs">
                  Step-by-Step Teacher Guidance:
                </span>
                <div className="space-y-1.5">
                  {selectedActivityDetail.instructions.map((ins, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                      <span className="w-4 h-4 rounded-full bg-[#E5EEFF] dark:bg-blue-950 text-[#0050CB] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {ins}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedActivityDetail.safetyAlert && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF690C] shrink-0 mt-0.5" />
                  <span className="font-semibold text-[11px] leading-relaxed">
                    Safety alert: {selectedActivityDetail.safetyAlert}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => {
                  setIsDetailDrawerOpen(false);
                  openLogParticipation(selectedActivityDetail);
                }}
                className="flex-1 py-2.5 bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 font-bold rounded-xl text-xs text-center cursor-pointer"
              >
                Log Participation
              </button>

              <button
                onClick={() => {
                  handleStartActivity(selectedActivityDetail);
                  setIsDetailDrawerOpen(false);
                }}
                className="flex-1 py-2.5 bg-[#0050CB] text-white font-bold rounded-xl text-xs text-center cursor-pointer hover:bg-[#003da1]"
              >
                Run Activity Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
