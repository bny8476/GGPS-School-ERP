import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AppImage from "@/components/ui/AppImage";
import {
  X,
  User,
  Phone,
  Calendar,
  CheckCircle2,
  HeartPulse,
  BookOpen,
  Smile,
  FileText,
  TrendingUp,
  MessageSquare,
  Printer,
  ShieldCheck,
  AlertCircle,
  Edit3,
  Save,
  Activity,
  Check
} from "lucide-react";

export interface StudentProfileData {
  id: string;
  studentId?: string;
  rollNo: string;
  name: string;
  photo: string;
  status: "Present" | "Absent" | "Late";
  age: string;
  gender: "Male" | "Female";
  parentLabel: string;
  parentName: string;
  phone: string;
  attendanceRate: number;
}

interface ChildProfileDrawerProps {
  student: StudentProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onMessageParent?: (student: StudentProfileData) => void;
}

type TabKey =
  | "Overview"
  | "Attendance"
  | "Learning"
  | "Activities"
  | "Growth"
  | "Homework"
  | "Health"
  | "Documents";

export default function ChildProfileDrawer({
  student,
  isOpen,
  onClose,
  onMessageParent,
}: ChildProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("Overview");
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  // Growth & Milestones State
  const [isEditingGrowth, setIsEditingGrowth] = useState(false);
  const [heightCm, setHeightCm] = useState("103.2");
  const [weightKg, setWeightKg] = useState("16.4");
  const [milestones, setMilestones] = useState([
    { id: 'm1', label: 'Runs smoothly & maintains balance', domain: 'Gross Motor', done: true },
    { id: 'm2', label: 'Holds pencil with 3-finger tripod grip', domain: 'Fine Motor', done: true },
    { id: 'm3', label: 'Counts objects up to 10 with 1-to-1 correspondence', domain: 'Cognitive', done: true },
    { id: 'm4', label: 'Speaks in full 4-6 word sentences clearly', domain: 'Language', done: true },
    { id: 'm5', label: 'Takes turns & shares play materials cooperatively', domain: 'Social-Emotional', done: false },
    { id: 'm6', label: 'Catches a bounced ball with both hands', domain: 'Gross Motor', done: true },
  ]);

  const bmiValue = useMemo(() => {
    const h = parseFloat(heightCm) / 100;
    const w = parseFloat(weightKg);
    if (!h || !w || h <= 0) return "15.4";
    return (w / (h * h)).toFixed(1);
  }, [heightCm, weightKg]);

  const toggleMilestone = (id: string) => {
    setMilestones(prev =>
      prev.map(m => m.id === id ? { ...m, done: !m.done } : m)
    );
    toast.success('Developmental milestone updated');
  };

  if (!student) return null;

  const tabs: TabKey[] = [
    "Overview",
    "Attendance",
    "Learning",
    "Activities",
    "Growth",
    "Homework",
    "Health",
    "Documents",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#071126]/60 backdrop-blur-xs"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl bg-white dark:bg-[#111827] h-full shadow-2xl z-10 flex flex-col overflow-hidden border-l border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/40 dark:from-slate-900 dark:to-slate-900/80">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <AppImage
                    src={student.photo}
                    alt={student.name}
                    fallbackType="avatar"
                    name={student.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-800 dark:text-white">
                        {student.name}
                      </h2>
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                        ✓
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Roll No: <span className="font-bold text-slate-700 dark:text-slate-300">{student.rollNo}</span> • LKG - Section A
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          student.status === "Present"
                            ? "bg-emerald-50 text-emerald-600"
                            : student.status === "Absent"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        • {student.status} Today
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        {student.attendanceRate}% Term Rate
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 8-Tabs Navigation Bar */}
              <div className="flex items-center gap-2 mt-5 overflow-x-auto custom-scrollbar pb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white bg-white/60 dark:bg-slate-800/60"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "Overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Age</span>
                      <span className="font-bold text-slate-800 dark:text-white">{student.age}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gender</span>
                      <span className="font-bold text-slate-800 dark:text-white">{student.gender}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Student ID</span>
                      <span className="font-bold text-slate-800 dark:text-white font-mono">{student.studentId || `GGPS2026LKG${String(student.rollNo || '1').padStart(3, '0')}`}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Blood Group</span>
                      <span className="font-bold text-rose-600">B+ Positive</span>
                    </div>
                  </div>

                  {/* Parent Details Card */}
                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Primary Guardian Details
                    </span>
                    <div className="space-y-1.5 pt-1 text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{student.parentLabel}:</span>
                        <span className="font-bold text-slate-800 dark:text-white">{student.parentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone Contact:</span>
                        <span className="font-bold text-blue-600">{student.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Emergency Alert:</span>
                        <span className="font-bold text-emerald-600">SMS & WhatsApp Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Residential Address</span>
                    <p className="font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                      Flat 402, Sunshine Meadows, Green Valley Road, Sector 4, Bangalore - 560034
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: ATTENDANCE */}
              {activeTab === "Attendance" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wider block">Term Attendance Rate</span>
                      <span className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-0.5 block">{student.attendanceRate}%</span>
                      <span className="text-[10px] text-slate-500">Above minimum threshold (85%)</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                      ✓
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
                      <span className="text-lg font-black block">44</span>
                      <span className="text-[10px] font-bold">Days Present</span>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-700">
                      <span className="text-lg font-black block">2</span>
                      <span className="text-[10px] font-bold">Days Absent</span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
                      <span className="text-lg font-black block">1</span>
                      <span className="text-[10px] font-bold">Late Arrivals</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LEARNING */}
              {activeTab === "Learning" && (
                <div className="space-y-3">
                  {[
                    { skill: "Letter Recognition & Phonics Sounds", level: "Exemplary", pct: 95 },
                    { skill: "Numbers & Counting (1 to 10)", level: "Proficient", pct: 90 },
                    { skill: "Pencil & Crayon Grip Control", level: "Proficient", pct: 85 },
                    { skill: "Rhyme Recitation & Actions", level: "Exemplary", pct: 98 },
                    { skill: "Sharing & Turn Taking", level: "Developing", pct: 75 },
                  ].map((item, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-white">{item.skill}</span>
                        <span className="text-[10px] font-bold text-blue-600">{item.level}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: ACTIVITIES */}
              {activeTab === "Activities" && (
                <div className="space-y-3">
                  {[
                    { title: "Animal Mask Finger Painting", date: "Yesterday", status: "Completed with High Engagement" },
                    { title: "Sensory Bin Rice & Bean Sorting", date: "16 Sep", status: "Completed" },
                    { title: "Rhyme Time: The Lion and The Mouse", date: "15 Sep", status: "Actively Participated" },
                  ].map((act, i) => (
                    <div key={i} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{act.date}</span>
                      <h4 className="font-bold text-slate-800 dark:text-white text-xs">{act.title}</h4>
                      <p className="text-[11px] text-emerald-600 font-medium">✓ {act.status}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: GROWTH & MILESTONES */}
              {activeTab === "Growth" && (
                <div className="space-y-4">
                  {/* Top Summary & Edit Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-wider">
                        Growth & Health Profile
                      </h4>
                      <p className="text-[11px] text-slate-500">WHO Pediatric Growth percentiles & milestone tracker</p>
                    </div>
                    <button
                      onClick={() => {
                        if (isEditingGrowth) {
                          setIsEditingGrowth(false);
                          toast.success(`Updated physical growth record for ${student.name}`);
                        } else {
                          setIsEditingGrowth(true);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-300 border border-blue-200/80 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      {isEditingGrowth ? (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Measurements</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Update Growth</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Physical Measurements Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Height</span>
                      {isEditingGrowth ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={heightCm}
                            onChange={(e) => setHeightCm(e.target.value)}
                            className="w-16 px-1.5 py-1 text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 rounded-lg outline-none"
                          />
                          <span className="text-xs font-bold text-slate-500">cm</span>
                        </div>
                      ) : (
                        <span className="text-base font-black text-slate-800 dark:text-white block">{heightCm} cm</span>
                      )}
                      <span className="text-[10px] text-emerald-600 font-medium">55th Percentile</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Weight</span>
                      {isEditingGrowth ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={weightKg}
                            onChange={(e) => setWeightKg(e.target.value)}
                            className="w-16 px-1.5 py-1 text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 rounded-lg outline-none"
                          />
                          <span className="text-xs font-bold text-slate-500">kg</span>
                        </div>
                      ) : (
                        <span className="text-base font-black text-slate-800 dark:text-white block">{weightKg} kg</span>
                      )}
                      <span className="text-[10px] text-emerald-600 font-medium">50th Percentile</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Calculated BMI</span>
                      <span className="text-base font-black text-[#0050CB] dark:text-blue-400 block">{bmiValue}</span>
                      <span className="text-[10px] text-emerald-600 font-medium font-bold">Healthy Range</span>
                    </div>
                  </div>

                  {/* Developmental Milestones Checklist */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#0050CB]" />
                        Key Developmental Milestones (Early Years)
                      </span>
                      <span className="text-[10px] text-[#0050CB] font-bold">
                        {milestones.filter(m => m.done).length}/{milestones.length} Mastered
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {milestones.map((m) => (
                        <label
                          key={m.id}
                          onClick={() => toggleMilestone(m.id)}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:bg-blue-50/30 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                              m.done
                                ? 'bg-[#0050CB] border-[#0050CB] text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}>
                              {m.done && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className={`text-xs font-medium ${m.done ? 'text-slate-800 dark:text-white font-semibold' : 'text-slate-500'}`}>
                              {m.label}
                            </span>
                          </div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {m.domain}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: HOMEWORK */}
              {activeTab === "Homework" && (
                <div className="space-y-3">
                  {[
                    { title: "Alphabet Tracing Booklet (Letters A–E)", status: "Submitted & Star Awarded", date: "Due 18 Sep" },
                    { title: "Count 5 Round Objects at Home", status: "Submitted", date: "Due 15 Sep" },
                  ].map((hw, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-800 dark:text-white">{hw.title}</span>
                        <span className="text-emerald-600 font-bold text-[10px]">✓ Done</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{hw.date} • {hw.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 7: HEALTH */}
              {activeTab === "Health" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 space-y-1">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      No Known Medical Allergies
                    </span>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Immunization schedule is 100% up to date for kindergarten entry.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Pediatrician Info</span>
                    <p className="font-bold text-slate-800 dark:text-white">Dr. Arvind Rao, MD Pediatrics</p>
                    <p className="text-slate-500 text-[11px]">Apollo Children&apos;s Clinic • +91 98765 11223</p>
                  </div>
                </div>
              )}

              {/* TAB 8: DOCUMENTS */}
              {activeTab === "Documents" && (
                <div className="space-y-2">
                  {[
                    "Birth_Certificate_Aarav.pdf",
                    "Immunization_Record_Card.pdf",
                    "Admissions_Enrollment_Form.pdf",
                    "Proof_Of_Residence.pdf",
                  ].map((doc, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">{doc}</span>
                      </div>
                      <button 
                        onClick={() => setPreviewDoc(doc)}
                        className="text-blue-600 hover:underline font-bold text-[11px] cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Footer Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#111827] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  onMessageParent?.(student);
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message {student.parentLabel}</span>
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-[#111827] w-full max-w-lg p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {previewDoc}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="font-extrabold text-xs text-slate-800 dark:text-white">Official Student Record</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verified document on file for student: <strong className="text-slate-800 dark:text-slate-200">{student.name}</strong> ({student.rollNo})
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  const blob = new Blob([`Official Record: ${previewDoc}\nStudent: ${student.name} (${student.rollNo})\nSchool: GGPS School ERP`], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = previewDoc;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Download Document
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
