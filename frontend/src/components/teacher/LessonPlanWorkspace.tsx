"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Download,
  BookOpen,
  Sparkles,
  Check,
  X,
  FileText,
  AlertCircle,
  Bookmark,
  Compass,
  ArrowRight,
  Share2,
  Layers,
  Award,
  Smile,
  Eye,
  MessageSquare,
  Info,
  ShieldCheck,
  Heart,
  Copy,
  Edit3,
  ExternalLink,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { printDocument } from '@/lib/exportUtils';

export type LessonDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
export type LessonPeriod = 'CIRCLE_TIME' | 'PHONICS' | 'MATH_LOGIC' | 'THEME_EVS' | 'CREATIVE_PLAY';

export interface LessonPlanItem {
  id: string;
  day: LessonDay;
  dayLabel: string;
  dateStr: string;
  period: LessonPeriod;
  periodLabel: string;
  timeSlot: string;
  unit: string;
  title: string;
  objective: string;
  vocabulary: string[];
  materials: string[];
  hook: string;
  steps: string[];
  differentiation: {
    support: string;
    extension: string;
  };
  assessmentMethod: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
  linkedActivityId?: string;
  linkedActivityTitle?: string;
  linkedHomeworkTitle?: string;
  teacherNotes?: string;
}

export interface SyllabusUnit {
  unitNumber: number;
  title: string;
  theme: string;
  weeksAllocated: string;
  completionPct: number;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  competencies: string[];
}

interface LessonPlanWorkspaceProps {
  onNavigateTab?: (tab: any) => void;
}

// Initial mock data for Week 3 lessons
const initialLessons: LessonPlanItem[] = [
  // MONDAY
  {
    id: 'lp-mon-1',
    day: 'MONDAY',
    dayLabel: 'Monday',
    dateStr: '14 Sep 2026',
    period: 'CIRCLE_TIME',
    periodLabel: 'Circle Time & Welcome',
    timeSlot: '09:00 AM - 09:40 AM',
    unit: 'Unit 4: Jungle Animals & Habitats',
    title: 'Welcome Song & Animal Sounds Chorus',
    objective: 'Practice auditory discrimination of animal calls and turn-taking greeting.',
    vocabulary: ['Roar', 'Trumpet', 'Chatter', 'Jungle', 'Creature'],
    materials: ['Animal plush puppets', 'Sound button audio board', 'Morning circle rug'],
    hook: 'Play a mystery tiger growl audio clip. Have children guess which jungle animal is visiting our circle.',
    steps: [
      'Sing the "Good Morning Jungle Friends" rhythm song with clapping.',
      'Pass the lion plush toy; each child says "Good morning!" in a soft lion whisper.',
      'Show 3 animal photo flashcards (Lion, Elephant, Monkey) and mimic their walk.'
    ],
    differentiation: {
      support: 'Allow non-verbal greeting with a gentle high-five using the puppet paw.',
      extension: 'Encourage children to explain where the animal sleeps at night.'
    },
    assessmentMethod: 'Observation of eye contact, vocal imitation, and circle posture.',
    status: 'COMPLETED',
    linkedActivityId: 'act-1',
    linkedActivityTitle: 'Animal Sounds Guessing Game',
    teacherNotes: 'Class was very enthusiastic with the elephant trumpet sound. Kabir needed quiet seating.'
  },
  {
    id: 'lp-mon-2',
    day: 'MONDAY',
    dayLabel: 'Monday',
    dateStr: '14 Sep 2026',
    period: 'PHONICS',
    periodLabel: 'Language & Phonics',
    timeSlot: '09:50 AM - 10:35 AM',
    unit: 'Unit 3: Phonics Sounds A through G',
    title: 'Letter Sound /d/ & Drumming Rhymes',
    objective: 'Recognize letter shape D, produce the /d/ sound, and name words starting with D.',
    vocabulary: ['Drum', 'Duck', 'Dinosaur', 'Door', 'Dot'],
    materials: ['Sandpaper letter D cards', 'Toy mini drums with rhythm sticks', 'Tactile sand trays'],
    hook: 'Tap a steady drum beat on a toy bongo: "D-D-Drum, D-D-Duck!" Have kids tap on knees.',
    steps: [
      'Introduce big and small letter D flashcards with visual tactile sandpaper stroke.',
      'Air-trace letter D: "Big line down, big round belly!"',
      'Children trace letter D in individual red sand trays using pointer finger.'
    ],
    differentiation: {
      support: 'Guide hand-over-hand index finger tracing across the sandpaper card.',
      extension: 'Ask students to identify other classroom objects starting with /d/ (Desk, Door).'
    },
    assessmentMethod: 'Check tactile tracing direction and verbal phoneme clarity.',
    status: 'COMPLETED',
    linkedHomeworkTitle: 'Trace Letter D in Red Activity Workbook',
    teacherNotes: 'Ananya formed the curve beautifully. Aarav needed reminder on top-to-bottom stroke.'
  },
  {
    id: 'lp-mon-3',
    day: 'MONDAY',
    dayLabel: 'Monday',
    dateStr: '14 Sep 2026',
    period: 'MATH_LOGIC',
    periodLabel: 'Early Math & Shapes',
    timeSlot: '10:55 AM - 11:40 AM',
    unit: 'Unit 2: Colors & Daily Shapes',
    title: 'Circle Spotting & Plate Counting (1 to 5)',
    objective: 'Identify circular 2D objects and count objects in 1-to-1 correspondence up to 5.',
    vocabulary: ['Circle', 'Round', 'Count', 'Five', 'Curve'],
    materials: ['Yellow paper plates', 'Counting circular rings', 'Chalk circle on floor mats'],
    hook: 'Roll a large red hula-hoop across the rug. "Look at this shape roll, can a square roll like this?"',
    steps: [
      'Walk along the perimeter of the giant chalk circle barefoot to feel the continuous curve.',
      'Distribute counting rings: place exactly 3 rings on paper plate, then 4, then 5.',
      'Sing "5 Little Circles Bouncing on the Bed" fingerplay.'
    ],
    differentiation: {
      support: 'Use pre-marked numbered dot plates for 1-to-1 matching.',
      extension: 'Challenge children to find 2 non-round shapes in the math corner.'
    },
    assessmentMethod: 'Count aloud accuracy and circle recognition.',
    status: 'COMPLETED',
    teacherNotes: '26 out of 28 children demonstrated accurate 1-to-1 counting up to 5.'
  },

  // TUESDAY
  {
    id: 'lp-tue-1',
    day: 'TUESDAY',
    dayLabel: 'Tuesday',
    dateStr: '15 Sep 2026',
    period: 'CIRCLE_TIME',
    periodLabel: 'Circle Time & Welcome',
    timeSlot: '09:00 AM - 09:40 AM',
    unit: 'Unit 4: Jungle Animals & Habitats',
    title: 'Tall Giraffes & Ground Turtles: Spatial Opposites',
    objective: 'Understand and demonstrate high vs low, tall vs short using body postures.',
    vocabulary: ['Tall', 'Short', 'High', 'Low', 'Reach', 'Crawl'],
    materials: ['Giraffe height meter chart', 'Turtle plush', 'Audio track with chime bells'],
    hook: 'Hold the giraffe puppet high up to touch the ceiling light, then tuck turtle down on the floor.',
    steps: [
      'Children stretch on tiptoes with arms high like a giraffe reaching acacia leaves.',
      'Crouch low into a turtle shell when the low bass drum hits.',
      'Partner game: One friend stands tall, other friend crouches low.'
    ],
    differentiation: {
      support: 'Provide a balance rail for students struggling with tiptoe stability.',
      extension: 'Prompt children to use comparison: "The giraffe is taller than the table."'
    },
    assessmentMethod: 'Physical response to verbal concept prompts.',
    status: 'COMPLETED',
    teacherNotes: 'Great gross-motor energy. Helped transition into calm phonics.'
  },
  {
    id: 'lp-tue-2',
    day: 'TUESDAY',
    dayLabel: 'Tuesday',
    dateStr: '15 Sep 2026',
    period: 'THEME_EVS',
    periodLabel: 'Theme & EVS Discovery',
    timeSlot: '12:30 PM - 01:15 PM',
    unit: 'Unit 4: Jungle Animals & Habitats',
    title: 'Animal Camouflage & Spots vs Stripes',
    objective: 'Distinguish visual patterns (spots of leopard vs stripes of tiger/zebra).',
    vocabulary: ['Stripes', 'Spots', 'Leopard', 'Zebra', 'Pattern'],
    materials: ['Patterned fabric swatches', 'Magnifying glasses', 'Animal photo matching cards'],
    hook: 'Hide a zebra puppet against a black-and-white striped backdrop. "Where did Marty Zebra go?"',
    steps: [
      'Pass around velvet patterned cards; feel smooth stripes vs bumpy spots.',
      'Sort animal figurines into 2 baskets: "Spotty Friends" vs "Stripy Friends".',
      'Color matching game on the interactive whiteboard.'
    ],
    differentiation: {
      support: 'Use high-contrast black-and-white cards before introducing colored cheetah prints.',
      extension: 'Introduce the word "Camouflage" and discuss why animals hide in tall grass.'
    },
    assessmentMethod: 'Sorting accuracy of 8 animal cards into spot/stripe baskets.',
    status: 'COMPLETED',
    linkedActivityId: 'act-2',
    linkedActivityTitle: 'Animal Mask Crafting & Pincer Pinching',
    teacherNotes: 'Linked seamlessly with the Afternoon craft activity in Art Studio.'
  },

  // WEDNESDAY
  {
    id: 'lp-wed-1',
    day: 'WEDNESDAY',
    dayLabel: 'Wednesday',
    dateStr: '16 Sep 2026',
    period: 'PHONICS',
    periodLabel: 'Language & Phonics',
    timeSlot: '09:50 AM - 10:35 AM',
    unit: 'Unit 3: Phonics Sounds A through G',
    title: 'Letter Sound /e/ & Elephant Ear Craft',
    objective: 'Introduce vowel sound /e/ as in Elephant, Egg, Elbow.',
    vocabulary: ['Elephant', 'Egg', 'Elbow', 'Empty', 'Envelope'],
    materials: ['Letter E sandpaper cards', 'Egg cartons with plastic pastel eggs', 'Grey construction paper ears'],
    hook: 'Open a giant mystery egg on the table to reveal an elephant miniature.',
    steps: [
      'Touch elbow and repeat: "/e/ /e/ Elbow, /e/ /e/ Elephant".',
      'Air-trace letter E: "Pull down, across top, across middle, across bottom".',
      'Match picture cards starting with /e/ to the giant egg basket.'
    ],
    differentiation: {
      support: 'Focus on tactile letter card and elbow touch gesture to cement phoneme.',
      extension: 'Encourage chanting: "Ellie Elephant eats eggs every morning!"'
    },
    assessmentMethod: 'Oral repetition of short /e/ vowel without elongating into /ee/.',
    status: 'COMPLETED',
    teacherNotes: 'Short /e/ sound needs reinforcement; several kids confused it with long /i/ sound.'
  },
  {
    id: 'lp-wed-2',
    day: 'WEDNESDAY',
    dayLabel: 'Wednesday',
    dateStr: '16 Sep 2026',
    period: 'CREATIVE_PLAY',
    periodLabel: 'Creative Arts & Play',
    timeSlot: '01:30 PM - 02:15 PM',
    unit: 'Unit 4: Jungle Animals & Habitats',
    title: 'Sensory Jungle Swamp & Fine Motor Scooping',
    objective: 'Develop fine-motor pincer control and tactile tolerance of wet/squishy textures.',
    vocabulary: ['Scoop', 'Pour', 'Swamp', 'Slime', 'Squishy'],
    materials: ['Sensory bin with green chia-seed water', 'Plastic jungle frogs', 'Tweezers & scoops'],
    hook: 'Present the covered mystery sensory bin. Invite 3 brave children to feel inside without peeking.',
    steps: [
      'Model gentle dipping and two-finger pinch to rescue frogs from the "swamp".',
      'Count the rescued frogs into matching green counting cups.',
      'Wipe hands with warm damp lavender towels for sensory transition.'
    ],
    differentiation: {
      support: 'Offer dry spoons first for children sensitive to wet textures.',
      extension: 'Challenge with fine tweezers to lift smaller plastic insects.'
    },
    assessmentMethod: 'Grasp pattern (fist vs tripod/pincer) and tactile engagement.',
    status: 'COMPLETED',
    linkedActivityId: 'act-1',
    linkedActivityTitle: 'Sensory Bin Exploration & Sorting',
    teacherNotes: 'Vihaan was hesitant with the wet seeds at first, then engaged for 15 solid minutes.'
  },

  // THURSDAY
  {
    id: 'lp-thu-1',
    day: 'THURSDAY',
    dayLabel: 'Thursday',
    dateStr: '17 Sep 2026',
    period: 'MATH_LOGIC',
    periodLabel: 'Early Math & Shapes',
    timeSlot: '10:55 AM - 11:40 AM',
    unit: 'Unit 2: Colors & Daily Shapes',
    title: 'Sorting Primary Colors & Geometric Towers',
    objective: 'Sort objects by Red, Blue, and Yellow; build a stable tower with 4+ blocks.',
    vocabulary: ['Red', 'Blue', 'Yellow', 'Tower', 'Balance', 'Build'],
    materials: ['Primary color sorting trays', 'Beechwood wooden blocks', 'Colored soft beanbags'],
    hook: 'Toss a soft red beanbag: "Catch the red apple!" Repeat with yellow sun and blue ocean.',
    steps: [
      'Sort classroom toys into 3 primary colored buckets on the rug.',
      'In pairs, stack 4 wooden cubes without the tower tumbling.',
      'Top off each tower with a triangular prism roof.'
    ],
    differentiation: {
      support: 'Start with larger foam blocks before progressing to wooden blocks.',
      extension: 'Introduce secondary green color by mixing blue and yellow transparent sheets.'
    },
    assessmentMethod: 'Color sorting correctness and bilateral hand stability while stacking.',
    status: 'COMPLETED',
    linkedHomeworkTitle: 'Color the Butterfly using Primary Colors',
    teacherNotes: 'Great spatial progress. Reyansh and Myra built an 8-block stable tower together.'
  },

  // FRIDAY (TODAY)
  {
    id: 'lp-fri-1',
    day: 'FRIDAY',
    dayLabel: 'Friday (Today)',
    dateStr: '18 Sep 2026',
    period: 'CIRCLE_TIME',
    periodLabel: 'Circle Time & Welcome',
    timeSlot: '09:00 AM - 09:40 AM',
    unit: 'Unit 4: Jungle Animals & Habitats',
    title: 'Jungle Freeze Dance & Body Rhythm Coordination',
    objective: 'Follow auditory start/stop cues, coordinate motor balance, and celebrate Friday together.',
    vocabulary: ['Freeze', 'Statue', 'Rhythm', 'Prowl', 'Listen'],
    materials: ['Bluetooth speaker with animal soundtrack', 'Tambourine cue instrument', 'Ribbon wands'],
    hook: 'Shake tambourine fast = monkey hops; ring bell = freeze like a stone tiger statue!',
    steps: [
      'Warm-up stretches: reaching for bananas, stomping like elephants.',
      'Play jungle music: kids dance; when tambourine stops, everyone freezes for 5 seconds.',
      'Compliment steady statues; gentle breathing cool-down with hand on heart.'
    ],
    differentiation: {
      support: 'Stand next to teacher to mirror balance statues.',
      extension: 'Call out specific poses: "Freeze with one foot lifted like a flamingo!"'
    },
    assessmentMethod: 'Reaction time to sound cues and self-regulation.',
    status: 'IN_PROGRESS',
    linkedActivityId: 'act-3',
    linkedActivityTitle: 'Animal Moves & Obstacle Jungle Hop',
    teacherNotes: 'Live now! High participation from whole class.'
  },
  {
    id: 'lp-fri-2',
    day: 'FRIDAY',
    dayLabel: 'Friday (Today)',
    dateStr: '18 Sep 2026',
    period: 'THEME_EVS',
    periodLabel: 'Theme & EVS Discovery',
    timeSlot: '12:30 PM - 01:15 PM',
    unit: 'Unit 4: Jungle Animals & Habitats',
    title: 'Jungle Review & Mask Parade Showcase',
    objective: 'Review animal habitats, food, and showcase masks crafted this week to peers.',
    vocabulary: ['Parade', 'Showcase', 'Habitat', 'Proud', 'Carnivore'],
    materials: ['Crafted paper plate animal masks', 'Small classroom runway banner', 'Camera for student portfolio photos'],
    hook: 'Line up animal masks on display easel. "Look at the fierce lions and swift zebras created this week!"',
    steps: [
      'Each child puts on their animal mask and steps onto the classroom runway rug.',
      'Child makes their animal sound and shares 1 thing their animal likes to eat.',
      'Class applause after each presentation; snap keepsake photo for Parent Portal feed.'
    ],
    differentiation: {
      support: 'Co-teacher walks alongside child holding mask if child feels shy.',
      extension: 'Child shares where their animal lives (Den, Tree, Grassland).'
    },
    assessmentMethod: 'Public speaking confidence and retention of animal vocabulary.',
    status: 'PLANNED',
    linkedActivityId: 'act-2',
    linkedActivityTitle: 'Animal Mask Crafting & Pincer Pinching',
    teacherNotes: 'Scheduled for 12:30 PM. Assistant Anjali will help manage mask bands.'
  }
];

// Term 1 Syllabus Units
const syllabusUnits: SyllabusUnit[] = [
  {
    unitNumber: 1,
    title: 'Self & Family Exploration',
    theme: 'Identity & Emotions',
    weeksAllocated: 'Weeks 1 - 2 (Aug)',
    completionPct: 100,
    status: 'Completed',
    competencies: [
      'Expresses basic emotions (happy, sad, calm)',
      'Identifies self and immediate family members',
      'Demonstrates classroom cubby and routine ownership'
    ]
  },
  {
    unitNumber: 2,
    title: 'Colors & Daily Geometric Shapes',
    theme: 'Visual Discrimination & Math',
    weeksAllocated: 'Weeks 3 - 4 (Late Aug - Early Sep)',
    completionPct: 100,
    status: 'Completed',
    competencies: [
      'Distinguishes Primary Colors (Red, Blue, Yellow)',
      'Identifies 2D Circle, Square, and Triangle in real objects',
      'Builds stable 3D geometric block structures'
    ]
  },
  {
    unitNumber: 3,
    title: 'Phonics Sounds A through G',
    theme: 'Early Literacy & Oral Language',
    weeksAllocated: 'Weeks 5 - 7 (September)',
    completionPct: 85,
    status: 'In Progress',
    competencies: [
      'Recognizes uppercase and lowercase letterforms A through G',
      'Articulates beginning letter phonemes (/a/, /b/, /c/, /d/, /e/)',
      'Air-traces letters with proper top-to-bottom stroke orientation'
    ]
  },
  {
    unitNumber: 4,
    title: 'Jungle Animals & Habitats',
    theme: 'Nature, Animals & Science',
    weeksAllocated: 'Weeks 7 - 9 (September - October)',
    completionPct: 70,
    status: 'In Progress',
    competencies: [
      'Distinguishes wild vs domestic animals and mimics vocal calls',
      'Recognizes visual patterns (spots vs stripes) and animal coats',
      'Demonstrates gross-motor animal movements (hopping, crawling, prowling)'
    ]
  },
  {
    unitNumber: 5,
    title: 'Number Magic & Counting 1 to 10',
    theme: 'Early Numeracy & Quantities',
    weeksAllocated: 'Weeks 10 - 12 (October)',
    completionPct: 40,
    status: 'Upcoming',
    competencies: [
      'One-to-one correspondence counting with concrete objects up to 10',
      'Associates numerals 1-5 with correct physical quantities',
      'Understands concepts of "more", "less", and "equal"'
    ]
  }
];

export default function LessonPlanWorkspace({ onNavigateTab }: LessonPlanWorkspaceProps) {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<'WEEKLY_GRID' | 'DAILY_RUNSHEET' | 'SYLLABUS_MAP' | 'REFLECTIONS'>('WEEKLY_GRID');
  const [selectedDay, setSelectedDay] = useState<LessonDay>('FRIDAY');
  const [currentWeek, setCurrentWeek] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  // Lesson data state
  const [lessons, setLessons] = useState<LessonPlanItem[]>(initialLessons);

  // Modals & Drawers
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedLessonDetail, setSelectedLessonDetail] = useState<LessonPlanItem | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // New Lesson Form State
  const [formDay, setFormDay] = useState<LessonDay>('FRIDAY');
  const [formPeriod, setFormPeriod] = useState<LessonPeriod>('PHONICS');
  const [formTitle, setFormTitle] = useState('');
  const [formUnit, setFormUnit] = useState('Unit 4: Jungle Animals & Habitats');
  const [formTimeSlot, setFormTimeSlot] = useState('09:50 AM - 10:35 AM');
  const [formObjective, setFormObjective] = useState('');
  const [formVocabulary, setFormVocabulary] = useState('');
  const [formMaterials, setFormMaterials] = useState('');
  const [formHook, setFormHook] = useState('');
  const [formSteps, setFormSteps] = useState('');
  const [formSupport, setFormSupport] = useState('');
  const [formExtension, setFormExtension] = useState('');

  // Period labels & times
  const periodMeta: Record<LessonPeriod, { label: string; time: string; icon: string }> = {
    CIRCLE_TIME: { label: 'Circle Time & Warm-up', time: '09:00 AM - 09:40 AM', icon: '🌅' },
    PHONICS: { label: 'Language & Phonics', time: '09:50 AM - 10:35 AM', icon: '📖' },
    MATH_LOGIC: { label: 'Early Math & Shapes', time: '10:55 AM - 11:40 AM', icon: '🔢' },
    THEME_EVS: { label: 'Theme & EVS Discovery', time: '12:30 PM - 01:15 PM', icon: '🌍' },
    CREATIVE_PLAY: { label: 'Creative Arts & Play', time: '01:30 PM - 02:15 PM', icon: '🎨' }
  };

  const daysList: Array<{ id: LessonDay; label: string; date: string }> = [
    { id: 'MONDAY', label: 'Mon', date: '14 Sep' },
    { id: 'TUESDAY', label: 'Tue', date: '15 Sep' },
    { id: 'WEDNESDAY', label: 'Wed', date: '16 Sep' },
    { id: 'THURSDAY', label: 'Thu', date: '17 Sep' },
    { id: 'FRIDAY', label: 'Fri (Today)', date: '18 Sep' }
  ];

  // Filtered lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      const matchesSearch =
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.vocabulary.some((v) => v.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [lessons, searchQuery]);

  // Lessons for currently selected day (Daily run-sheet)
  const dayLessons = useMemo(() => {
    return filteredLessons.filter((l) => l.day === selectedDay);
  }, [filteredLessons, selectedDay]);

  // Handlers
  const handleSaveNewLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }

    const dayObj = daysList.find((d) => d.id === formDay) || daysList[4];

    const newLesson: LessonPlanItem = {
      id: `lp-${Date.now()}`,
      day: formDay,
      dayLabel: dayObj.label,
      dateStr: `${dayObj.date} 2026`,
      period: formPeriod,
      periodLabel: periodMeta[formPeriod].label,
      timeSlot: formTimeSlot || periodMeta[formPeriod].time,
      unit: formUnit,
      title: formTitle.trim(),
      objective: formObjective || 'Engage preschool learners with hands-on multi-sensory discovery.',
      vocabulary: formVocabulary ? formVocabulary.split(',').map((v) => v.trim()) : ['Explore', 'Discover'],
      materials: formMaterials ? formMaterials.split(',').map((m) => m.trim()) : ['Classroom standard props'],
      hook: formHook || 'Begin with an engaging question or mystery prop.',
      steps: formSteps
        ? formSteps.split('\n').filter((s) => s.trim().length > 0)
        : ['Introduce concept with visual realia.', 'Model guided exploration.', 'Independent hands-on play.', 'Reflect and celebrate.'],
      differentiation: {
        support: formSupport || 'Provide gentle hand-over-hand tactile guidance.',
        extension: formExtension || 'Invite child to explain or demonstrate to a classmate.'
      },
      assessmentMethod: 'Teacher observation checklist and verbal response.',
      status: 'PLANNED'
    };

    setLessons((prev) => [newLesson, ...prev]);
    setIsPlanModalOpen(false);
    toast.success(`✨ New lesson "${formTitle}" scheduled for ${dayObj.label}!`);

    // Reset
    setFormTitle('');
    setFormObjective('');
    setFormVocabulary('');
    setFormMaterials('');
    setFormHook('');
    setFormSteps('');
    setFormSupport('');
    setFormExtension('');
  };

  const handleDuplicateLesson = (item: LessonPlanItem) => {
    const duplicated: LessonPlanItem = {
      ...item,
      id: `lp-copy-${item.id}-${lessons.length + 1}`,
      title: `${item.title} (Revisit / Practice)`,
      status: 'PLANNED'
    };
    setLessons((prev) => [duplicated, ...prev]);
    toast.success(`📋 Duplicated lesson plan to schedule!`);
  };

  const handleToggleLessonStatus = (item: LessonPlanItem) => {
    const nextStatus: Record<string, 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED'> = {
      PLANNED: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      COMPLETED: 'PLANNED'
    };
    const updated = nextStatus[item.status];
    setLessons((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, status: updated } : l))
    );
    toast.success(`Lesson marked as ${updated.replace('_', ' ')}!`);
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
                📚
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
                    Weekly Teaching & Curriculum Hub
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 border border-emerald-300/60">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Approved by Academic Head
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Class LKG - Section A • Early Years Foundation Stage (EYFS) & NEP 2020 Pedagogical Plan
                </p>
              </div>
            </div>
          </div>

          {/* Week Selector & Primary Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            {/* Week Navigator Pill */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  if (currentWeek > 1) {
                    setCurrentWeek(currentWeek - 1);
                    toast.success(`Switched to Week ${currentWeek - 1}`);
                  }
                }}
                className="p-1.5 text-slate-500 hover:text-[#0050CB] dark:hover:text-blue-400 rounded-lg cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 text-xs font-black text-[#000E28] dark:text-white shrink-0">
                Week {currentWeek} • 14 - 18 Sep
              </span>

              <button
                onClick={() => {
                  setCurrentWeek(currentWeek + 1);
                  toast.success(`Switched to Week ${currentWeek + 1}`);
                }}
                className="p-1.5 text-slate-500 hover:text-[#0050CB] dark:hover:text-blue-400 rounded-lg cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Print Daily Run-Sheet for Clipboard"
            >
              <Printer className="w-4 h-4 text-[#0050CB]" />
              <span>Print Run-Sheet</span>
            </button>

            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Plan Lesson</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('WEEKLY_GRID')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'WEEKLY_GRID'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Timetable Matrix</span>
          </button>

          <button
            onClick={() => setActiveSubTab('DAILY_RUNSHEET')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'DAILY_RUNSHEET'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Daily Run-Sheet</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SYLLABUS_MAP')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'SYLLABUS_MAP'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Term 1 Syllabus (78%)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('REFLECTIONS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'REFLECTIONS'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Teacher Reflections</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP METRICS / SYLLABUS SUMMARY CARDS                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Term 1 Progress
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#000E28] dark:text-white">78%</span>
              <span className="text-xs text-emerald-600 font-bold">On Schedule</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              4 of 5 Curriculum Units active
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] flex items-center justify-center font-black">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              This Week's Lessons
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#000E28] dark:text-white">{lessons.length}</span>
              <span className="text-xs text-[#0050CB] font-bold">Planned</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              5 periods daily (25 weekly blocks)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] flex items-center justify-center font-black">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Unit Focus
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-[#000E28] dark:text-white">Unit 4: Animals</span>
            </div>
            <span className="text-[11px] text-[#FF690C] font-bold mt-1 block">
              Habitats & Gross Motor Moves
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#FF690C] flex items-center justify-center font-black">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              HOD Submission
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">Approved</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Reviewed by Mrs. Radhika Sen
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-black">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SEARCH & DAY SELECTOR TOOLBAR                                          */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Day selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {daysList.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                selectedDay === d.id
                  ? 'bg-[#000E28] text-white dark:bg-white dark:text-[#000E28] shadow-xs'
                  : 'bg-white dark:bg-[#000E28] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{d.label}</span>
              <span className="text-[10px] opacity-70 font-semibold">• {d.date}</span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative shrink-0 md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search objectives, vocabulary, units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#0050CB]"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: WEEKLY TIMETABLE MATRIX                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'WEEKLY_GRID' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider">
                Weekly Pedagogical Sequence • Week 3
              </h3>
              <p className="text-xs text-slate-500">
                Period-by-period progression aligned with foundational learning goals
              </p>
            </div>
            <span className="text-xs font-bold text-[#0050CB] bg-[#E5EEFF] dark:bg-blue-950/60 px-3 py-1 rounded-xl">
              Showing {filteredLessons.length} Scheduled Lessons
            </span>
          </div>

          <div className="space-y-3">
            {filteredLessons.map((item) => {
              const isLive = item.status === 'IN_PROGRESS';
              const isDone = item.status === 'COMPLETED';

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isLive
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 border-[#0050CB] shadow-md ring-1 ring-[#0050CB]/30'
                      : isDone
                      ? 'bg-white dark:bg-[#000E28] border-slate-200 dark:border-slate-800/80 hover:border-blue-300'
                      : 'bg-slate-50/50 dark:bg-[#000E28]/50 border-slate-200 dark:border-slate-800 opacity-90'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left: Timing badge, period icon & content */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/80 text-[#0050CB] flex items-center justify-center text-xl shrink-0 shadow-2xs">
                        {periodMeta[item.period]?.icon || '📖'}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                            {item.dayLabel} • {item.timeSlot}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full bg-[#E5EEFF] dark:bg-blue-950/40 text-[#0050CB] dark:text-blue-300 text-[10px] font-bold">
                            {item.periodLabel}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isLive
                                ? 'bg-[#FF690C] text-white animate-pulse'
                                : isDone
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {isLive ? '● Live Teaching Now' : isDone ? '✓ Taught' : 'Upcoming'}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-[#000E28] dark:text-white leading-tight">
                          {item.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <span className="font-bold text-slate-700 dark:text-slate-200">Objective: </span>
                          {item.objective}
                        </p>

                        {/* Vocabulary chips & props */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] font-bold text-slate-400">Key Words:</span>
                          {item.vocabulary.map((vocab, vIdx) => (
                            <span
                              key={vIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                            >
                              {vocab}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & cross-module links */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto shrink-0 justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setSelectedLessonDetail(item);
                          setIsDetailDrawerOpen(true);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                        title="View Full Lesson Script"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDuplicateLesson(item)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                        title="Duplicate Lesson"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {item.linkedActivityTitle && (
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('ACTIVITIES');
                            toast.success(`Opening linked activity: ${item.linkedActivityTitle}`);
                          }}
                          className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>🎨 Activity</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      {item.linkedHomeworkTitle && (
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('HOMEWORK');
                            toast.success(`Opening homework assignment`);
                          }}
                          className="px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#FF690C] border border-orange-200 dark:border-orange-800/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>📝 Homework</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleLessonStatus(item)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                          isLive
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : isDone
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            : 'bg-[#0050CB] hover:bg-[#003da1] text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isLive ? 'Finish Lesson' : isDone ? 'Done' : 'Mark Live'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Hook preview bar */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="line-clamp-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">🎣 Warm-up Hook: </span>
                      {item.hook}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedLessonDetail(item);
                        setIsDetailDrawerOpen(true);
                      }}
                      className="text-[#0050CB] dark:text-blue-400 font-bold shrink-0 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Step-by-Step Guide</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: DAILY DETAILED RUN-SHEET (STEP-BY-STEP)                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'DAILY_RUNSHEET' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#000E28] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-[#000E28] dark:text-white">
                Detailed Run-Sheet for {daysList.find((d) => d.id === selectedDay)?.label} ({dayLessons.length} Sessions)
              </h3>
              <p className="text-xs text-slate-500">
                Teacher instructional script, differentiation prompts, and supply checklists
              </p>
            </div>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print This Day's Sheet</span>
            </button>
          </div>

          {dayLessons.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#000E28] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Smile className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                No lessons found for this day under current search.
              </p>
              <button
                onClick={() => {
                  setFormDay(selectedDay);
                  setIsPlanModalOpen(true);
                }}
                className="px-4 py-2 bg-[#0050CB] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                + Add Lesson for this Day
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {dayLessons.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#000E28] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
                >
                  {/* Period Header */}
                  <div className="p-5 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] font-black text-sm flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#000E28] dark:text-white uppercase tracking-wider">
                            {item.periodLabel}
                          </span>
                          <span className="text-xs text-slate-400">• {item.timeSlot}</span>
                        </div>
                        <span className="text-xs font-bold text-[#0050CB] dark:text-blue-300">
                          {item.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'IN_PROGRESS'
                            ? 'bg-[#FF690C] text-white animate-pulse'
                            : item.status === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-5 text-xs">
                    <div>
                      <h4 className="text-base font-black text-[#000E28] dark:text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        <span className="font-bold text-slate-800 dark:text-slate-100">Learning Objective: </span>
                        {item.objective}
                      </p>
                    </div>

                    {/* Hook Box */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-1">
                      <span className="font-bold text-amber-800 dark:text-amber-300 uppercase text-[10px] tracking-wider block">
                        🎣 Circle Hook / Attention Grabber:
                      </span>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                        "{item.hook}"
                      </p>
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs uppercase tracking-wider">
                        Step-by-Step Pedagogical Sequence:
                      </span>
                      <div className="space-y-2">
                        {item.steps.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#E5EEFF] dark:bg-blue-950 text-[#0050CB] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Materials Checklist & Differentiation Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase text-[10px] tracking-wider">
                          Props & Materials Required:
                        </span>
                        <div className="space-y-1.5">
                          {item.materials.map((mat, mIdx) => (
                            <div key={mIdx} className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{mat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#E5EEFF]/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
                        <span className="font-bold text-[#0050CB] dark:text-blue-300 block uppercase text-[10px] tracking-wider">
                          Differentiated Support (Inclusive ECE):
                        </span>
                        <div className="space-y-1.5">
                          <p className="text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-[#0050CB]">Extra Support: </span>
                            {item.differentiation.support}
                          </p>
                          <p className="text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-emerald-600">Extension: </span>
                            {item.differentiation.extension}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <div className="text-[11px] text-slate-500 font-medium">
                      Assessment: {item.assessmentMethod}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.linkedActivityTitle && (
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('ACTIVITIES');
                            toast.success(`Opening live activity in Activities Hub`);
                          }}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Run as Live Activity →
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleLessonStatus(item)}
                        className="px-3.5 py-1.5 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Update Teaching Status
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: TERM 1 SYLLABUS & COMPETENCIES                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'SYLLABUS_MAP' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#000E28] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#000E28] dark:text-white">
                  Academic Term 1 Syllabus Coverage (78% Mastered)
                </h3>
                <p className="text-xs text-slate-500">
                  Aligned with National Early Childhood Education Curriculum Framework (NEP 2020)
                </p>
              </div>
              <button
                onClick={() => toast.success("Downloading Academic Term Syllabus PDF...")}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-[#0050CB]" />
                <span>Download Syllabus PDF</span>
              </button>
            </div>

            {/* Units Progression List */}
            <div className="space-y-4 pt-2">
              {syllabusUnits.map((u) => (
                <div
                  key={u.unitNumber}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#0050CB] dark:text-blue-400">
                          Unit {u.unitNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-400">• {u.weeksAllocated}</span>
                      </div>
                      <h4 className="text-base font-black text-[#000E28] dark:text-white">
                        {u.title}
                      </h4>
                      <span className="text-xs text-slate-500 font-semibold">{u.theme}</span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs font-black text-[#000E28] dark:text-white">
                        {u.completionPct}% Completed
                      </span>
                      <span
                        className={`block text-[11px] font-bold ${
                          u.status === 'Completed'
                            ? 'text-emerald-600'
                            : u.status === 'In Progress'
                            ? 'text-blue-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        u.completionPct === 100
                          ? 'bg-emerald-500'
                          : u.completionPct >= 70
                          ? 'bg-[#0050CB]'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${u.completionPct}%` }}
                    />
                  </div>

                  {/* Competency bullet points */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                      Target Early Childhood Competencies:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {u.competencies.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-start gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium leading-tight">
                            {c}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: TEACHER REFLECTIONS & SUBSTITUTE NOTES                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'REFLECTIONS' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#000E28] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-[#000E28] dark:text-white">
                Post-Class Pedagogical Reflections & Observations
              </h3>
              <p className="text-xs text-slate-500">
                Continuous teacher notes on pupil engagement, sensory responses, and adjustments for next week
              </p>
            </div>

            <div className="space-y-4">
              {lessons
                .filter((l) => l.teacherNotes)
                .map((l) => (
                  <div
                    key={l.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0050CB] dark:text-blue-400">
                        {l.dayLabel} • {l.periodLabel}: {l.title}
                      </span>
                      <span className="text-slate-400">{l.dateStr}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      "{l.teacherNotes}"
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Substitute Teacher Quick Briefing Box */}
          <div className="bg-[#E5EEFF]/60 dark:bg-blue-950/30 p-5 rounded-3xl border border-[#0050CB]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0050CB]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0050CB] dark:text-blue-300">
                  Assistant Teacher & Substitute Briefing
                </h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Friday Afternoon Mask Parade requires 2 tables cleared for photo staging. Child Aarav S. has peanut allergy (nut-free snack only). Hand stamps ready for end-of-day goodbye circle.
              </p>
            </div>
            <button
              onClick={() => toast.success("Saved assistant instructions to notice board!")}
              className="px-4 py-2 bg-[#0050CB] text-white rounded-xl text-xs font-bold hover:bg-[#003da1] transition-all cursor-pointer shrink-0"
            >
              Update Briefing
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PLAN NEW LESSON DRAWER                                           */}
      {/* ========================================================================= */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] flex items-center justify-center font-bold">
                  📚
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                    Plan New Kindergarten Lesson
                  </h3>
                  <p className="text-[11px] text-slate-400">Class LKG - Section A • Week {currentWeek}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewLesson} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Day of Week
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as LessonDay)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                  >
                    <option value="MONDAY">Monday (14 Sep)</option>
                    <option value="TUESDAY">Tuesday (15 Sep)</option>
                    <option value="WEDNESDAY">Wednesday (16 Sep)</option>
                    <option value="THURSDAY">Thursday (17 Sep)</option>
                    <option value="FRIDAY">Friday (18 Sep)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Period / Time Block
                  </label>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value as LessonPeriod)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                  >
                    <option value="CIRCLE_TIME">🌅 Circle Time & Warm-up</option>
                    <option value="PHONICS">📖 Language & Phonics</option>
                    <option value="MATH_LOGIC">🔢 Early Math & Shapes</option>
                    <option value="THEME_EVS">🌍 Theme & EVS Discovery</option>
                    <option value="CREATIVE_PLAY">🎨 Creative Arts & Play</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Curriculum Unit
                </label>
                <input
                  type="text"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Lesson Title <span className="text-[#FF690C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Letter Sound /f/ & Paper Frog Hopping Game"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Learning Objective
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Recognize letter F, articulate /f/ phoneme, and coordinate origami frog hops"
                  value={formObjective}
                  onChange={(e) => setFormObjective(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Key Vocabulary (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Frog, Five, Fish, Fast, Green"
                  value={formVocabulary}
                  onChange={(e) => setFormVocabulary(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Circle Hook / Attention Grabber
                </label>
                <input
                  type="text"
                  placeholder="e.g., Play mystery sound of croaking frog from beneath green leaf prop"
                  value={formHook}
                  onChange={(e) => setFormHook(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Teaching Steps (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Air trace letter F&#10;Tactile tracing on sandpaper card&#10;Origami paper frog hopping game on carpet"
                  value={formSteps}
                  onChange={(e) => setFormSteps(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Materials Required (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sandpaper F cards, green origami frogs, blue tape ponds"
                  value={formMaterials}
                  onChange={(e) => setFormMaterials(e.target.value)}
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
                  Schedule Lesson Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRINTABLE CLIPBOARD RUN-SHEET PREVIEW                            */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0050CB]" />
                <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                  Classroom Clipboard Run-Sheet (Print Preview)
                </h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Document Paper Simulation */}
            <div id="printable-runsheet-paper" className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
              <div className="border-b border-slate-200 dark:border-slate-700 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-sm text-slate-900 dark:text-white">
                    GGPS SCHOOL • TEACHER DAILY RUN-SHEET
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Class LKG - Section A • Primary Teacher: Priya Sharma • Date: {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                  </p>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  APPROVED
                </span>
              </div>

              <div className="space-y-3">
                {dayLessons.map((l, i) => (
                  <div key={i} className="border-b border-slate-200 dark:border-slate-700/60 pb-2.5">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-white">
                      <span>
                        Period {i + 1}: {l.periodLabel} ({l.timeSlot})
                      </span>
                      <span className="text-[#0050CB] font-semibold">{l.unit}</span>
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">
                      {l.title}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      <span className="font-bold">Objective: </span>
                      {l.objective}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      <span className="font-bold">Materials: </span>
                      {l.materials.join(', ')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Emergency Contact: Medical Room Ext 104</span>
                <span>Principal Sign-off: Verified</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-xs"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  printDocument('printable-runsheet-paper', 'GGPS School - Teacher Daily Run-Sheet');
                  setIsPrintModalOpen(false);
                }}
                className="px-5 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl font-bold cursor-pointer transition-all text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Send to Printer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: LESSON DETAIL SCRIPT & DIFFERENTIATION GUIDE                      */}
      {/* ========================================================================= */}
      {isDetailDrawerOpen && selectedLessonDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white dark:bg-[#000E28] p-6 shadow-2xl overflow-y-auto space-y-5 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">
                  {periodMeta[selectedLessonDetail.period]?.icon || '📖'}
                </span>
                <div>
                  <h3 className="font-black text-base text-[#000E28] dark:text-white">
                    {selectedLessonDetail.title}
                  </h3>
                  <span className="text-xs text-[#0050CB] font-bold">
                    {selectedLessonDetail.periodLabel}
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

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-400 block uppercase text-[10px]">
                  Learning Objective:
                </span>
                <p className="font-semibold text-slate-800 dark:text-white leading-relaxed">
                  {selectedLessonDetail.objective}
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 block uppercase text-[10px]">
                  🎣 Attention Hook:
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  "{selectedLessonDetail.hook}"
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 text-xs">
                  Step-by-Step Sequence:
                </span>
                <div className="space-y-1.5">
                  {selectedLessonDetail.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                      <span className="w-4 h-4 rounded-full bg-[#E5EEFF] dark:bg-blue-950 text-[#0050CB] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 text-xs">
                  Materials Checklist:
                </span>
                <div className="space-y-1">
                  {selectedLessonDetail.materials.map((mat, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{mat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#E5EEFF]/50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900 space-y-1">
                <span className="font-bold text-[#0050CB] dark:text-blue-300 block uppercase text-[10px]">
                  Differentiated Remediation:
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  {selectedLessonDetail.differentiation.support}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => {
                  handleDuplicateLesson(selectedLessonDetail);
                  setIsDetailDrawerOpen(false);
                }}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs text-center cursor-pointer"
              >
                Duplicate
              </button>

              <button
                onClick={() => {
                  handleToggleLessonStatus(selectedLessonDetail);
                  setIsDetailDrawerOpen(false);
                }}
                className="flex-1 py-2.5 bg-[#0050CB] text-white font-bold rounded-xl text-xs text-center cursor-pointer hover:bg-[#003da1]"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
