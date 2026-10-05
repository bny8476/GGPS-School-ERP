"use client";

import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckSquare,
  Sparkles,
  Search,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Eye,
  FileText,
  Star,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  Bookmark,
  Share2,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToCSV, printDocument } from '@/lib/exportUtils';
import { downloadPdf } from '@/lib/fileDownload';
import { formatMediumDate, getCurrentAcademicYearFormatted } from '@/lib/date';
import AppImage from '@/components/ui/AppImage';

const getAssessmentDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export type AssessmentCycle = 'TERM_1_FORMATIVE' | 'BASELINE_DIAGNOSTIC' | 'TERM_1_SUMMATIVE';

export type RubricLevel = 'EXEMPLARY' | 'PROFICIENT' | 'EMERGING' | 'NEEDS_SUPPORT';

export type DomainId =
  | 'LANGUAGE'
  | 'MATH_LOGIC'
  | 'FINE_MOTOR'
  | 'GROSS_MOTOR'
  | 'SOCIAL_EMOTIONAL';

export interface DomainMetadata {
  id: DomainId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  weight: number;
}

export interface StudentAssessmentRecord {
  studentId: string;
  name: string;
  rollNo: string;
  photo: string;
  scores: Record<DomainId, RubricLevel>;
  overallStatus: 'Evaluated' | 'Pending';
  teacherRemarks: string;
  strengths: string[];
  growthGoals: string[];
  lastUpdated: string;
}

export interface RubricDescriptor {
  domainId: DomainId;
  domainName: string;
  levels: Record<
    RubricLevel,
    {
      label: string;
      levelNum: number;
      descriptor: string;
      classroomExample: string;
    }
  >;
}

interface AssessmentWorkspaceProps {
  students?: Array<{
    id: string;
    name: string;
    rollNo: string;
    photo: string;
  }>;
  onNavigateTab?: (tab: any) => void;
}

export const domainMetaList: DomainMetadata[] = [
  { id: 'LANGUAGE', name: 'Language & Communication', shortName: 'Language', icon: '📖', color: 'bg-blue-500', weight: 20 },
  { id: 'MATH_LOGIC', name: 'Early Mathematics & Logic', shortName: 'Math', icon: '🔢', color: 'bg-emerald-500', weight: 20 },
  { id: 'FINE_MOTOR', name: 'Fine Motor & Creative Expression', shortName: 'Fine Motor', icon: '🎨', color: 'bg-purple-500', weight: 20 },
  { id: 'GROSS_MOTOR', name: 'Gross Motor & Balance', shortName: 'Gross Motor', icon: '🏃', color: 'bg-[#0050CB]', weight: 20 },
  { id: 'SOCIAL_EMOTIONAL', name: 'Social & Emotional Development', shortName: 'Social', icon: '🤝', color: 'bg-amber-500', weight: 20 }
];

export const rubricDescriptors: RubricDescriptor[] = [
  {
    domainId: 'LANGUAGE',
    domainName: 'Language & Communication',
    levels: {
      EXEMPLARY: {
        label: 'Exemplary ★',
        levelNum: 4,
        descriptor: 'Articulates complex 5-6 word sentences; independently identifies all taught letter sounds (A-G); predicts story outcomes with enthusiasm.',
        classroomExample: 'Initiates story discussions and explains why the caterpillar was hungry.'
      },
      PROFICIENT: {
        label: 'Proficient ✓',
        levelNum: 3,
        descriptor: 'Speaks clearly in 3-4 word phrases; accurately recognizes uppercase letters A-E; recites rhymes with rhythm.',
        classroomExample: 'Responds accurately when asked to name the letter on the flashcard.'
      },
      EMERGING: {
        label: 'Emerging ⏳',
        levelNum: 2,
        descriptor: 'Understands teacher speech; uses 2-word combinations; occasionally confuses similar letter sounds (/b/ vs /d/).',
        classroomExample: 'Points correctly to objects when prompted, but hesitates to speak aloud.'
      },
      NEEDS_SUPPORT: {
        label: 'Needs Support ⚠️',
        levelNum: 1,
        descriptor: 'Relies on non-verbal gestures; needs speech articulation reinforcement and repetitive 1-on-1 phonics exercises.',
        classroomExample: 'Requires teacher prompting to repeat basic letter sounds.'
      }
    }
  },
  {
    domainId: 'MATH_LOGIC',
    domainName: 'Early Mathematics & Logic',
    levels: {
      EXEMPLARY: {
        label: 'Exemplary ★',
        levelNum: 4,
        descriptor: 'Confidently counts beyond 10 with 1-to-1 correspondence; effortlessly categorizes objects by color, shape, and size.',
        classroomExample: 'Sorts 12 mixed geometric blocks into 3 categories in under 1 minute.'
      },
      PROFICIENT: {
        label: 'Proficient ✓',
        levelNum: 3,
        descriptor: 'Accurately counts 1 to 5 objects; correctly identifies 2D Circle, Square, and Triangle in classroom realia.',
        classroomExample: 'Places exactly 4 counting rings on the numbered plate.'
      },
      EMERGING: {
        label: 'Emerging ⏳',
        levelNum: 2,
        descriptor: 'Chants numbers in order up to 5, but occasionally skips objects during physical counting.',
        classroomExample: 'May count 4 items while touching only 3.'
      },
      NEEDS_SUPPORT: {
        label: 'Needs Support ⚠️',
        levelNum: 1,
        descriptor: 'Struggles to distinguish circles from rectangles; requires concrete sensory materials to associate quantity.',
        classroomExample: 'Requires hand-over-hand touch counting with colorful beads.'
      }
    }
  },
  {
    domainId: 'FINE_MOTOR',
    domainName: 'Fine Motor & Creative Expression',
    levels: {
      EXEMPLARY: {
        label: 'Exemplary ★',
        levelNum: 4,
        descriptor: 'Consistently demonstrates mature dynamic tripod pencil grip; cuts along straight lines with safety scissors independently.',
        classroomExample: 'Glues fine yarn whiskers precisely inside animal mask borders.'
      },
      PROFICIENT: {
        label: 'Proficient ✓',
        levelNum: 3,
        descriptor: 'Uses pincer grasp for picking beads and seeds; colors within wide borders with minimal stray marks.',
        classroomExample: 'Holds chunky crayons securely without dropping.'
      },
      EMERGING: {
        label: 'Emerging ⏳',
        levelNum: 2,
        descriptor: 'Switches between palmar fist grip and pincer grasp; scissors technique requires two-handed stabilization.',
        classroomExample: 'Tears paper into irregular shapes with gradual improvement.'
      },
      NEEDS_SUPPORT: {
        label: 'Needs Support ⚠️',
        levelNum: 1,
        descriptor: 'Weak finger strength; tires quickly during 5-minute coloring tasks; needs playdough hand exercises.',
        classroomExample: 'Struggles to squeeze glue stick or open sensory clips.'
      }
    }
  },
  {
    domainId: 'GROSS_MOTOR',
    domainName: 'Gross Motor & Balance',
    levels: {
      EXEMPLARY: {
        label: 'Exemplary ★',
        levelNum: 4,
        descriptor: 'Maintains static balance on one foot for 5+ seconds; coordinates two-footed hopping, running stops, and ball catching.',
        classroomExample: 'Navigates obstacle balance beams smoothly without hesitation.'
      },
      PROFICIENT: {
        label: 'Proficient ✓',
        levelNum: 3,
        descriptor: 'Hops forward on two feet; catches a medium playground ball with both arms; runs without tripping.',
        classroomExample: 'Follows freeze dance rhythm cues and maintains body statues.'
      },
      EMERGING: {
        label: 'Emerging ⏳',
        levelNum: 2,
        descriptor: 'Climbs playground ladders with support; catches balls against chest rather than with hands.',
        classroomExample: 'Needs assistant hand while crossing elevated lily pad mats.'
      },
      NEEDS_SUPPORT: {
        label: 'Needs Support ⚠️',
        levelNum: 1,
        descriptor: 'Frequent balance loss during running; hesitant to jump down from low gym bench.',
        classroomExample: 'Benefits from gentle bilateral stepping and sensory swing work.'
      }
    }
  },
  {
    domainId: 'SOCIAL_EMOTIONAL',
    domainName: 'Social & Emotional Development',
    levels: {
      EXEMPLARY: {
        label: 'Exemplary ★',
        levelNum: 4,
        descriptor: 'Demonstrates spontaneous empathy towards upset peers; initiates cooperative pretend play; follows multi-step routines.',
        classroomExample: 'Offers his crayon box to a peer who has no red crayon.'
      },
      PROFICIENT: {
        label: 'Proficient ✓',
        levelNum: 3,
        descriptor: 'Shares toys when requested; takes turns in circle games; separates smoothly from parents at morning arrival.',
        classroomExample: 'Packs away toys into labelled cubbies when transition chime rings.'
      },
      EMERGING: {
        label: 'Emerging ⏳',
        levelNum: 2,
        descriptor: 'Engages in parallel play next to peers; occasionally reluctant to share high-value sensory toys.',
        classroomExample: 'Plays happily alongside friends with blocks with occasional verbal reminders.'
      },
      NEEDS_SUPPORT: {
        label: 'Needs Support ⚠️',
        levelNum: 1,
        descriptor: 'Emotional dysregulation during classroom transitions; requires 1-on-1 calming comfort during arrival.',
        classroomExample: 'Needs teacher hand-holding and visual timetable cues.'
      }
    }
  }
];

export default function AssessmentWorkspace({ students = [], onNavigateTab }: AssessmentWorkspaceProps) {
  // Navigation & Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'MATRIX' | 'DOSSIER' | 'RUBRICS' | 'REPORT_CARDS'>('MATRIX');
  const [selectedCycle, setSelectedCycle] = useState<AssessmentCycle>('TERM_1_FORMATIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<'ALL' | DomainId>('ALL');

  // Selected child for Dossier / Report Card view
  const [selectedChildId, setSelectedChildId] = useState<string>('s-01');

  // Modals
  const [isEvaluationDrawerOpen, setIsEvaluationDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPrintReportModalOpen, setIsPrintReportModalOpen] = useState(false);

  // Student Evaluation Records State
  const [evaluationRecords, setEvaluationRecords] = useState<StudentAssessmentRecord[]>([
    {
      studentId: 's-01',
      name: 'Aarav Sharma',
      rollNo: '01',
      photo: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80',
      scores: {
        LANGUAGE: 'EXEMPLARY',
        MATH_LOGIC: 'PROFICIENT',
        FINE_MOTOR: 'PROFICIENT',
        GROSS_MOTOR: 'EXEMPLARY',
        SOCIAL_EMOTIONAL: 'EXEMPLARY'
      },
      overallStatus: 'Evaluated',
      teacherRemarks: 'Aarav is an enthusiastic learner with stellar verbal communication and cooperative play skills. Shows great leadership in morning circle rhymes.',
      strengths: ['Verbal storytelling', 'Auditory rhyming', 'Outdoor balance & running'],
      growthGoals: ['Top-to-bottom pencil stroke consistency', 'Sustained focus during independent block building'],
      lastUpdated: getAssessmentDate(-1)
    },
    {
      studentId: 's-02',
      name: 'Ananya Deshmukh',
      rollNo: '02',
      photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      scores: {
        LANGUAGE: 'PROFICIENT',
        MATH_LOGIC: 'EXEMPLARY',
        FINE_MOTOR: 'EMERGING',
        GROSS_MOTOR: 'PROFICIENT',
        SOCIAL_EMOTIONAL: 'PROFICIENT'
      },
      overallStatus: 'Evaluated',
      teacherRemarks: 'Ananya demonstrates brilliant mathematical pattern logic. Practicing with soft playdough to strengthen her tripod pencil grip.',
      strengths: ['Number sorting 1-10', 'Geometric shape recognition', 'Gentle peer sharing'],
      growthGoals: ['Pincer grasp strength with safety scissors', 'Confidence answering in large groups'],
      lastUpdated: getAssessmentDate(-2)
    },
    {
      studentId: 's-03',
      name: 'Diya Patel',
      rollNo: '03',
      photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
      scores: {
        LANGUAGE: 'PROFICIENT',
        MATH_LOGIC: 'PROFICIENT',
        FINE_MOTOR: 'EXEMPLARY',
        GROSS_MOTOR: 'EMERGING',
        SOCIAL_EMOTIONAL: 'PROFICIENT'
      },
      overallStatus: 'Evaluated',
      teacherRemarks: 'Diya creates intricate paper collages and demonstrates superb fine-motor control. Gaining confidence on outdoor gym obstacles.',
      strengths: ['Paper folding & scissor cutting', 'Tactile art collage', 'Classroom cubby care'],
      growthGoals: ['Two-footed hopping stamina', 'Drinking adequate water after outdoor games'],
      lastUpdated: getAssessmentDate(-1)
    },
    {
      studentId: 's-04',
      name: 'Kabir Verma',
      rollNo: '04',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      scores: {
        LANGUAGE: 'EMERGING',
        MATH_LOGIC: 'PROFICIENT',
        FINE_MOTOR: 'PROFICIENT',
        GROSS_MOTOR: 'EXEMPLARY',
        SOCIAL_EMOTIONAL: 'NEEDS_SUPPORT'
      },
      overallStatus: 'Evaluated',
      teacherRemarks: 'Kabir is remarkably agile outdoors and loves building towers. Needs gentle guidance managing arrival transitions and sharing high-demand toys.',
      strengths: ['Athletic running & hopping', 'Building block structural balance', 'Musical rhythm'],
      growthGoals: ['Expressing frustration with words rather than tears', 'Turn-taking in sensory table games'],
      lastUpdated: getAssessmentDate(-3)
    },
    {
      studentId: 's-05',
      name: 'Reyansh Iyer',
      rollNo: '05',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      scores: {
        LANGUAGE: 'EXEMPLARY',
        MATH_LOGIC: 'EXEMPLARY',
        FINE_MOTOR: 'PROFICIENT',
        GROSS_MOTOR: 'PROFICIENT',
        SOCIAL_EMOTIONAL: 'EXEMPLARY'
      },
      overallStatus: 'Evaluated',
      teacherRemarks: 'Reyansh shows exemplary cognitive and early numeracy skills. Friendly, inclusive peer who always helps classmates pack away.',
      strengths: ['Rapid 1-to-1 counting', 'Phonics sound clarity', 'Peer empathy'],
      growthGoals: ['Exploring wet/squishy textures during sensory play'],
      lastUpdated: getAssessmentDate(-1)
    },
    {
      studentId: 's-06',
      name: 'Myra Kapoor',
      rollNo: '06',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      scores: {
        LANGUAGE: 'PROFICIENT',
        MATH_LOGIC: 'PROFICIENT',
        FINE_MOTOR: 'EXEMPLARY',
        GROSS_MOTOR: 'PROFICIENT',
        SOCIAL_EMOTIONAL: 'PROFICIENT'
      },
      overallStatus: 'Evaluated',
      teacherRemarks: 'Myra is artistic, methodical, and attentive. Demonstrates lovely symmetrical color choices in mask crafting.',
      strengths: ['Color harmony & crayon grip', 'Story listening comprehension', 'Polite mannerisms'],
      growthGoals: ['Speed when transitioning between outdoor play and circle time'],
      lastUpdated: getAssessmentDate(-2)
    },
    {
      studentId: 's-07',
      name: 'Zara Khan',
      rollNo: '07',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      scores: {
        LANGUAGE: 'PROFICIENT',
        MATH_LOGIC: 'EMERGING',
        FINE_MOTOR: 'PROFICIENT',
        GROSS_MOTOR: 'EXEMPLARY',
        SOCIAL_EMOTIONAL: 'PROFICIENT'
      },
      overallStatus: 'Evaluated',
      teacherRemarks: 'Zara is energetic and cheerful. Excellent rhythm in animal dance sessions. Strengthening number correspondence 1 to 5.',
      strengths: ['Dancing & physical coordination', 'Vocal rhyme chanting', 'Sharing crayons'],
      growthGoals: ['Associating numeral symbols with bead quantities 1-5'],
      lastUpdated: getAssessmentDate(-1)
    },
    {
      studentId: 's-08',
      name: 'Advait Nair',
      rollNo: '08',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      scores: {
        LANGUAGE: 'EMERGING',
        MATH_LOGIC: 'PROFICIENT',
        FINE_MOTOR: 'EMERGING',
        GROSS_MOTOR: 'PROFICIENT',
        SOCIAL_EMOTIONAL: 'NEEDS_SUPPORT'
      },
      overallStatus: 'Evaluated',
      teacherRemarks: 'Advait shows great interest in wooden blocks. Working on verbal phoneme articulation and routine predictability.',
      strengths: ['Tower building', 'Observation of nature', 'Quiet listening'],
      growthGoals: ['Expressive speech in 4-word sentences', 'Separation comfort at morning drop-off'],
      lastUpdated: getAssessmentDate(-4)
    }
  ]);

  // Form State for editing an evaluation
  const [evaluatingStudent, setEvaluatingStudent] = useState<StudentAssessmentRecord | null>(null);
  const [editRemarks, setEditRemarks] = useState('');
  const [editScores, setEditScores] = useState<Record<DomainId, RubricLevel>>({
    LANGUAGE: 'PROFICIENT',
    MATH_LOGIC: 'PROFICIENT',
    FINE_MOTOR: 'PROFICIENT',
    GROSS_MOTOR: 'PROFICIENT',
    SOCIAL_EMOTIONAL: 'PROFICIENT'
  });

  // Filtered records
  const filteredRecords = useMemo(() => {
    return evaluationRecords.filter((rec) => {
      const matchesSearch =
        rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.rollNo.includes(searchQuery);
      return matchesSearch;
    });
  }, [evaluationRecords, searchQuery]);

  // Currently active child record for Dossier / Report Card
  const activeChildRecord = useMemo(() => {
    return evaluationRecords.find((r) => r.studentId === selectedChildId) || evaluationRecords[0];
  }, [evaluationRecords, selectedChildId]);

  // Cohort Domain Mastery Percentages (calculated dynamically from current scores)
  const cohortStats = useMemo(() => {
    const levelWeight: Record<RubricLevel, number> = {
      EXEMPLARY: 100,
      PROFICIENT: 85,
      EMERGING: 65,
      NEEDS_SUPPORT: 40
    };

    const stats: Record<DomainId, { avg: number; count: number }> = {
      LANGUAGE: { avg: 0, count: 0 },
      MATH_LOGIC: { avg: 0, count: 0 },
      FINE_MOTOR: { avg: 0, count: 0 },
      GROSS_MOTOR: { avg: 0, count: 0 },
      SOCIAL_EMOTIONAL: { avg: 0, count: 0 }
    };

    evaluationRecords.forEach((r) => {
      (Object.keys(r.scores) as DomainId[]).forEach((d) => {
        stats[d].avg += levelWeight[r.scores[d]];
        stats[d].count += 1;
      });
    });

    const results: Record<DomainId, number> = {} as any;
    (Object.keys(stats) as DomainId[]).forEach((d) => {
      results[d] = Math.round(stats[d].avg / (stats[d].count || 1));
    });

    return results;
  }, [evaluationRecords]);

  // Handlers
  const handleQuickLevelToggle = (studentId: string, domainId: DomainId) => {
    const nextLevelMap: Record<RubricLevel, RubricLevel> = {
      NEEDS_SUPPORT: 'EMERGING',
      EMERGING: 'PROFICIENT',
      PROFICIENT: 'EXEMPLARY',
      EXEMPLARY: 'NEEDS_SUPPORT'
    };

    setEvaluationRecords((prev) =>
      prev.map((rec) => {
        if (rec.studentId !== studentId) return rec;
        const current = rec.scores[domainId];
        const next = nextLevelMap[current];
        return {
          ...rec,
          scores: {
            ...rec.scores,
            [domainId]: next
          },
          lastUpdated: 'Just now'
        };
      })
    );
  };

  const handleOpenEvaluationDrawer = (rec: StudentAssessmentRecord) => {
    setEvaluatingStudent(rec);
    setEditScores({ ...rec.scores });
    setEditRemarks(rec.teacherRemarks);
    setIsEvaluationDrawerOpen(true);
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingStudent) return;

    setEvaluationRecords((prev) =>
      prev.map((rec) =>
        rec.studentId === evaluatingStudent.studentId
          ? {
              ...rec,
              scores: { ...editScores },
              teacherRemarks: editRemarks,
              lastUpdated: formatMediumDate()
            }
          : rec
      )
    );

    setIsEvaluationDrawerOpen(false);
    toast.success(`✨ Formative assessment saved for ${evaluatingStudent.name}!`);
  };

  const getRubricBadge = (level: RubricLevel) => {
    switch (level) {
      case 'EXEMPLARY':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[11px] flex items-center justify-center gap-1 border border-purple-200 dark:border-purple-800/40">
            ★ Exemplary
          </span>
        );
      case 'PROFICIENT':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 border border-emerald-200 dark:border-emerald-800/40">
            ✓ Proficient
          </span>
        );
      case 'EMERGING':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1 border border-amber-200 dark:border-amber-800/40">
            ⏳ Emerging
          </span>
        );
      case 'NEEDS_SUPPORT':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex items-center justify-center gap-1 border border-rose-200 dark:border-rose-800/40">
            ⚠️ Needs Help
          </span>
        );
    }
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
                📊
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
                    Holistic Assessment & Evaluation Hub
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 border border-emerald-300/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    NEP 2020 Foundational Framework
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Class LKG - Section A • Continuous formative rubrics, developmental milestones, and PTM progress dossiers
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Cycle Selector & Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            {/* Cycle Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setSelectedCycle('BASELINE_DIAGNOSTIC')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCycle === 'BASELINE_DIAGNOSTIC'
                    ? 'bg-white dark:bg-[#000E28] text-[#0050CB] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Baseline
              </button>
              <button
                onClick={() => setSelectedCycle('TERM_1_FORMATIVE')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCycle === 'TERM_1_FORMATIVE'
                    ? 'bg-[#0050CB] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Term 1 Formative (Active)
              </button>
              <button
                onClick={() => setSelectedCycle('TERM_1_SUMMATIVE')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCycle === 'TERM_1_SUMMATIVE'
                    ? 'bg-white dark:bg-[#000E28] text-[#0050CB] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Term 1 Summative
              </button>
            </div>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Export Class Ledger (CSV / PDF)"
            >
              <Download className="w-4 h-4 text-[#0050CB]" />
              <span>Export Ledger</span>
            </button>

            <button
              onClick={() => setIsPrintReportModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#E5EEFF] dark:bg-blue-950/60 hover:bg-blue-100 text-[#0050CB] dark:text-blue-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-blue-200/60"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report Card</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher Pills (flex-wrap with responsive padding) */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('MATRIX')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'MATRIX'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Cohort Rubric Matrix (28)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('DOSSIER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'DOSSIER'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Individual Holistic Dossier</span>
          </button>

          <button
            onClick={() => setActiveSubTab('RUBRICS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'RUBRICS'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rubric Criteria & Descriptors</span>
          </button>

          <button
            onClick={() => setActiveSubTab('REPORT_CARDS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'REPORT_CARDS'
                ? 'bg-[#0050CB] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PTM Progress Cards</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. COHORT DOMAIN PROGRESS BARS (REAL-TIME AGGREGATED)                      */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#000E28] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider">
              Term 1 Developmental Competency Mastery
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated from teacher formative continuous evaluations across all 28 enrolled children
            </p>
          </div>
          <span className="text-xs font-bold text-[#0050CB] bg-[#E5EEFF] dark:bg-blue-950/60 px-3 py-1 rounded-xl">
            Overall Cohort Index: 88.4% • Proficient
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {domainMetaList.map((dom) => {
            const score = cohortStats[dom.id];
            return (
              <div
                key={dom.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span>{dom.icon}</span>
                    <span>{dom.shortName}</span>
                  </span>
                  <span className="font-black text-[#0050CB] dark:text-blue-300">{score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full ${dom.color} rounded-full transition-all duration-700`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 block">
                  {score >= 90 ? 'Exemplary ★' : score >= 80 ? 'Proficient ✓' : 'Ongoing ⏳'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SEARCH & DOMAIN FILTER BAR                                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Domain Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedDomainFilter('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedDomainFilter === 'ALL'
                ? 'bg-[#000E28] text-white dark:bg-white dark:text-[#000E28]'
                : 'bg-white dark:bg-[#000E28] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All 5 Domains
          </button>
          {domainMetaList.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDomainFilter(d.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                selectedDomainFilter === d.id
                  ? 'bg-[#000E28] text-white dark:bg-white dark:text-[#000E28]'
                  : 'bg-white dark:bg-[#000E28] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{d.icon}</span>
              <span>{d.shortName}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative shrink-0 sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search learner by name or roll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#0050CB]"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: COHORT RUBRIC MATRIX (THE CORE SPREADSHEET EVALUATION GRID)   */}
      {/* ========================================================================= */}
      {activeSubTab === 'MATRIX' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Tip: Click any rating cell to cycle levels (
                <span className="text-purple-600 font-bold">★ Exemplary</span> →{' '}
                <span className="text-emerald-600 font-bold">✓ Proficient</span> →{' '}
                <span className="text-amber-600 font-bold">⏳ Emerging</span> →{' '}
                <span className="text-rose-600 font-bold">⚠️ Needs Support</span>)
              </span>
            </div>
            <span className="text-xs font-bold text-[#0050CB]">
              Showing {filteredRecords.length} Learners
            </span>
          </div>

          <div className="bg-white dark:bg-[#000E28] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4 w-52">Student Identity</th>
                    {domainMetaList
                      .filter((d) => selectedDomainFilter === 'ALL' || selectedDomainFilter === d.id)
                      .map((d) => (
                        <th key={d.id} className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span>{d.icon}</span>
                            <span>{d.name}</span>
                          </div>
                        </th>
                      ))}
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.map((rec) => (
                    <tr
                      key={rec.studentId}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="p-4">
                        <div
                          onClick={() => {
                            setSelectedChildId(rec.studentId);
                            setActiveSubTab('DOSSIER');
                          }}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <AppImage
                            src={rec.photo}
                            alt={rec.name}
                            fallbackType="avatar"
                            name={rec.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white block group-hover:text-[#0050CB] transition-colors">
                              #{rec.rollNo} {rec.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Updated: {rec.lastUpdated}
                            </span>
                          </div>
                        </div>
                      </td>

                      {domainMetaList
                        .filter((d) => selectedDomainFilter === 'ALL' || selectedDomainFilter === d.id)
                        .map((d) => (
                          <td key={d.id} className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleQuickLevelToggle(rec.studentId, d.id)}
                              className="cursor-pointer transition-transform hover:scale-105 inline-block"
                              title="Click to advance level"
                            >
                              {getRubricBadge(rec.scores[d.id])}
                            </button>
                          </td>
                        ))}

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEvaluationDrawer(rec)}
                            className="p-1.5 text-slate-500 hover:text-[#0050CB] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Edit Qualitative Remarks"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedChildId(rec.studentId);
                              setActiveSubTab('DOSSIER');
                            }}
                            className="text-[#0050CB] dark:text-blue-400 font-bold hover:underline"
                          >
                            Dossier →
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

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: INDIVIDUAL STUDENT HOLISTIC DOSSIER & 360° RADAR               */}
      {/* ========================================================================= */}
      {activeSubTab === 'DOSSIER' && activeChildRecord && (
        <div className="space-y-6">
          {/* Child Picker Row */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {evaluationRecords.map((r) => (
              <button
                key={r.studentId}
                onClick={() => setSelectedChildId(r.studentId)}
                className={`px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedChildId === r.studentId
                    ? 'bg-[#0050CB] text-white shadow-xs'
                    : 'bg-white dark:bg-[#000E28] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <AppImage
                  src={r.photo}
                  alt={r.name}
                  fallbackType="avatar"
                  name={r.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>{r.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Child Profile & Strengths */}
            <div className="bg-white dark:bg-[#000E28] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center gap-3.5">
                <AppImage
                  src={activeChildRecord.photo}
                  alt={activeChildRecord.name}
                  fallbackType="avatar"
                  name={activeChildRecord.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0050CB]"
                />
                <div>
                  <h3 className="font-black text-lg text-[#000E28] dark:text-white">
                    {activeChildRecord.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">
                    Roll #{activeChildRecord.rollNo} • Class LKG-A
                  </span>
                  <div className="mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      Term 1 Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                    Teacher Commendation & Observations:
                  </span>
                  <p className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    "{activeChildRecord.teacherRemarks}"
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1.5">
                    Demonstrated Strengths:
                  </span>
                  <div className="space-y-1">
                    {activeChildRecord.strengths.map((str, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1.5">
                    Targeted Growth Goals (Next Term):
                  </span>
                  <div className="space-y-1">
                    {activeChildRecord.growthGoals.map((g, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold text-xs">
                        <ArrowRight className="w-3.5 h-3.5 text-[#FF690C] shrink-0" />
                        <span>{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenEvaluationDrawer(activeChildRecord)}
                className="w-full py-2.5 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Edit Learner Evaluation
              </button>
            </div>

            {/* Middle & Right: Competency Breakdown & Visual Barometer */}
            <div className="lg:col-span-2 bg-white dark:bg-[#000E28] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-[#000E28] dark:text-white">
                    5-Domain Holistic Profile: {activeChildRecord.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rubric evaluations mapped to Early Childhood Development Standards
                  </p>
                </div>
                <button
                  onClick={() => setIsPrintReportModalOpen(true)}
                  className="px-3.5 py-2 bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print HPC Card</span>
                </button>
              </div>

              <div className="space-y-4">
                {domainMetaList.map((dom) => {
                  const level = activeChildRecord.scores[dom.id];
                  const descriptorData = rubricDescriptors.find((r) => r.domainId === dom.id)?.levels[level];

                  return (
                    <div
                      key={dom.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{dom.icon}</span>
                          <span className="font-bold text-slate-800 dark:text-white">{dom.name}</span>
                        </div>
                        {getRubricBadge(level)}
                      </div>

                      {descriptorData && (
                        <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          {descriptorData.descriptor}
                        </p>
                      )}

                      {descriptorData && (
                        <div className="text-[11px] text-slate-400 pt-1">
                          <span className="font-bold text-slate-500 dark:text-slate-300">Observed in Class: </span>
                          <span>"{descriptorData.classroomExample}"</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-[#E5EEFF]/60 dark:bg-blue-950/30 rounded-2xl border border-[#0050CB]/20 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Ready for Parent-Teacher Consultation (PTM)
                </span>
                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('PARENTS');
                    toast.success('Navigating to Parent Consultation Hub (PTM)...');
                  }}
                  className="font-bold text-[#0050CB] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Parent PTM Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: RUBRIC DESCRIPTORS & NEP 2020 CRITERIA LIBRARY                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'RUBRICS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#000E28] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-[#000E28] dark:text-white">
                Standardized Preschool Rubric Descriptors (NEP 2020 / EYFS)
              </h3>
              <p className="text-xs text-slate-500">
                Official behavioural guidelines used to maintain scoring consistency across kindergarten classrooms
              </p>
            </div>

            <div className="space-y-6 pt-2">
              {rubricDescriptors.map((desc) => (
                <div
                  key={desc.domainId}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <h4 className="font-black text-sm text-[#000E28] dark:text-white flex items-center gap-2">
                    <span>{domainMetaList.find((d) => d.id === desc.domainId)?.icon}</span>
                    <span>{desc.domainName}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {(Object.keys(desc.levels) as RubricLevel[]).map((lvl) => {
                      const item = desc.levels[lvl];
                      return (
                        <div
                          key={lvl}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-slate-800 dark:text-white">{item.label}</span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                                L{item.levelNum}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                              {item.descriptor}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400">
                            <span className="font-bold text-[#0050CB] block">Example:</span>
                            {item.classroomExample}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: PTM PROGRESS CARDS & PARENT PREVIEW                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'REPORT_CARDS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#000E28] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-[#000E28] dark:text-white">
                Batch Print & Share Holistic Progress Cards (HPC)
              </h3>
              <p className="text-xs text-slate-500">
                Generate official Term 1 report dossiers ready for Parent-Teacher Conferences
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toast.success('Dispatched Term 1 report dossiers to all 28 Parent Portal accounts!');
                }}
                className="px-4 py-2 bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-blue-200/60"
              >
                <Share2 className="w-4 h-4" />
                <span>Share with All Parents</span>
              </button>

              <button
                onClick={() => setIsPrintReportModalOpen(true)}
                className="px-4 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Active Card</span>
              </button>
            </div>
          </div>

          {/* Report Card Simulation */}
          <div className="max-w-3xl mx-auto bg-white dark:bg-[#000E28] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs">
            <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0050CB] block">
                  GGSP INTERNATIONAL SCHOOL
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  HOLISTIC PROGRESS CARD (HPC) • TERM 1 (2026-2027)
                </h2>
                <p className="text-xs text-slate-500">
                  Early Years Foundational Stage • Continuous Observational Evaluation
                </p>
              </div>
              <AppImage
                src={activeChildRecord.photo}
                alt={activeChildRecord.name}
                fallbackType="avatar"
                name={activeChildRecord.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 font-medium">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Student Name:</span>
                <span className="font-bold text-slate-800 dark:text-white">{activeChildRecord.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Class & Roll:</span>
                <span className="font-bold text-slate-800 dark:text-white">LKG - Section A (#{activeChildRecord.rollNo})</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Lead Teacher:</span>
                <span className="font-bold text-slate-800 dark:text-white">Mrs. Priya Sharma</span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Developmental Competencies:
              </span>
              <table className="w-full border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3 text-left">Competency Area</th>
                    <th className="p-3 text-center">Formative Level</th>
                    <th className="p-3 text-left">Key Observation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {domainMetaList.map((d) => {
                    const level = activeChildRecord.scores[d.id];
                    const descriptor = rubricDescriptors.find((r) => r.domainId === d.id)?.levels[level];
                    return (
                      <tr key={d.id}>
                        <td className="p-3 font-bold text-slate-800 dark:text-white">
                          {d.name}
                        </td>
                        <td className="p-3 text-center">
                          {getRubricBadge(level)}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">
                          {descriptor?.descriptor}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Teacher Narrative:</span>
              <p className="font-semibold text-slate-800 dark:text-white leading-relaxed">
                "{activeChildRecord.teacherRemarks}"
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Teacher Signature: Priya Sharma</span>
              <span>Parent Signature: __________________</span>
              <span>Principal Seal: Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT EVALUATION DRAWER                                            */}
      {/* ========================================================================= */}
      {isEvaluationDrawerOpen && evaluatingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <AppImage
                  src={evaluatingStudent.photo}
                  alt={evaluatingStudent.name}
                  fallbackType="avatar"
                  name={evaluatingStudent.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                    Formative Assessment: {evaluatingStudent.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Roll #{evaluatingStudent.rollNo} • Term 1 Continuous Assessment
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsEvaluationDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div className="space-y-3">
                {domainMetaList.map((dom) => (
                  <div
                    key={dom.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <span>{dom.icon}</span>
                      <span>{dom.name}</span>
                    </span>

                    <select
                      value={editScores[dom.id]}
                      onChange={(e) =>
                        setEditScores((prev) => ({
                          ...prev,
                          [dom.id]: e.target.value as RubricLevel
                        }))
                      }
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                    >
                      <option value="EXEMPLARY">★ Exemplary (Level 4)</option>
                      <option value="PROFICIENT">✓ Proficient (Level 3)</option>
                      <option value="EMERGING">⏳ Emerging (Level 2)</option>
                      <option value="NEEDS_SUPPORT">⚠️ Needs Support (Level 1)</option>
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Teacher Narrative Commendation
                </label>
                <textarea
                  rows={3}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEvaluationDrawerOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl font-bold cursor-pointer transition-all shadow-md shadow-blue-500/20"
                >
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EXPORT CLASS LEDGER MODAL                                        */}
      {/* ========================================================================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#0050CB]" />
                <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                  Export Class Assessment Ledger
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Export the complete formative evaluation ledger for Class LKG-A ({evaluationRecords.length} pupils across 5 foundational domains).
            </p>

            <div className="space-y-2 text-xs font-bold">
              <button
                onClick={() => {
                  const rows = evaluationRecords.map((r) => ({
                    'Roll No': r.rollNo,
                    'Pupil Name': r.name,
                    'Language & Literacy': r.scores.LANGUAGE,
                    'Math & Logic': r.scores.MATH_LOGIC,
                    'Fine Motor': r.scores.FINE_MOTOR,
                    'Gross Motor': r.scores.GROSS_MOTOR,
                    'Social Emotional': r.scores.SOCIAL_EMOTIONAL,
                    'Evaluation Notes': r.teacherRemarks,
                    'Last Evaluated': r.lastUpdated,
                  }));
                  exportToCSV(rows, 'GGPS_Assessment_Evaluation_Ledger');
                  setIsExportModalOpen(false);
                }}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0050CB] flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Spreadsheet Data (.CSV)</span>
                <FileText className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                onClick={async () => {
                  await downloadPdf(
                    '/api/v1/reports/export/academic?format=pdf',
                    'GGPS_Assessment_Academic_Report.pdf'
                  );
                  setIsExportModalOpen(false);
                }}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0050CB] flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Accreditation Report (.PDF)</span>
                <Download className="w-4 h-4 text-[#0050CB]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PRINT REPORT CARD MODAL                                          */}
      {/* ========================================================================= */}
      {isPrintReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#000E28] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0050CB]" />
                <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                  Print Holistic Progress Card (Preview)
                </h3>
              </div>
              <button
                onClick={() => setIsPrintReportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Holistic Card Document */}
            <div id="printable-assessment-progress-card" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs font-sans">
              <div className="border-b-2 border-[#0050CB] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-base text-[#000E28] dark:text-white uppercase tracking-tight">
                    GGPS SCHOOL • HOLISTIC PROGRESS CARD
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Class LKG - Section A • Academic Session 2026–2027 • Term 1 Formative Assessment
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0050CB] font-black text-[10px] uppercase">
                  Verified Record
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Pupil Name</span>
                  <span className="font-extrabold text-slate-800 dark:text-white text-sm">{activeChildRecord.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Roll / Admission</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">#{activeChildRecord.rollNo} • {activeChildRecord.studentId || 'GGPS-STU'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Class Teacher</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">Priya Sharma</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-[#0050CB] uppercase tracking-wide">Developmental Rubrics & Domains</h4>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Domain</th>
                        <th className="py-2 px-3">Skill / Focus Area</th>
                        <th className="py-2 px-3 text-right">Performance Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="py-2 px-3 font-semibold">Language & Phonics</td>
                        <td className="py-2 px-3 text-slate-500">Letter Recognition & Pronunciation</td>
                        <td className="py-2 px-3 text-right font-black text-emerald-600">Exemplary (A+)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold">Numeracy & Logic</td>
                        <td className="py-2 px-3 text-slate-500">Counting & Sorting Objects 1-20</td>
                        <td className="py-2 px-3 text-right font-black text-emerald-600">Exemplary (A+)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold">Creative & Visual Arts</td>
                        <td className="py-2 px-3 text-slate-500">Sponge Painting & Clay Modeling</td>
                        <td className="py-2 px-3 text-right font-black text-[#0050CB]">Proficient (A)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold">Motor & Physical Development</td>
                        <td className="py-2 px-3 text-slate-500">Scissors Grip, Pencil Grasp, Balance</td>
                        <td className="py-2 px-3 text-right font-black text-emerald-600">Exemplary (A+)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold">Social & Emotional Growth</td>
                        <td className="py-2 px-3 text-slate-500">Sharing, Turn-Taking, Empathy</td>
                        <td className="py-2 px-3 text-right font-black text-[#0050CB]">Proficient (A)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 block uppercase text-[9px]">Class Teacher Observations:</span>
                <p className="text-slate-700 dark:text-slate-200 mt-0.5 italic">
                  {activeChildRecord.teacherRemarks || 'Consistently cheerful, punctual, and helpful during circle time activities.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                <span>GGPS School Directorate of Academic Evaluation</span>
                <span>Principal Verification Seal: Affixed</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPrintReportModalOpen(false)}
                className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  const studentId = activeChildRecord.studentId || 'student-1';
                  const safeName = activeChildRecord.name.replace(/\s+/g, '_');
                  await downloadPdf(
                    `/api/v1/students/${studentId}/report-card`,
                    `GGPS_Report_Card_${safeName}_2026-2027.pdf`
                  );
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  printDocument('printable-assessment-progress-card', `GGPS Progress Card - ${activeChildRecord.name}`);
                  setIsPrintReportModalOpen(false);
                }}
                className="px-5 py-2 bg-[#0050CB] hover:bg-[#003da1] text-white rounded-xl font-bold cursor-pointer text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Progress Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
