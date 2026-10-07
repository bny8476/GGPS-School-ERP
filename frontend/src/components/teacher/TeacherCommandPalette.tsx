"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  CalendarCheck,
  FileText,
  Calendar,
  Smile,
  CheckSquare,
  TrendingUp,
  BookMarked,
  FileSpreadsheet,
  Clock,
  Bell,
  Settings,
  X,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Plus,
  Award
} from "lucide-react";
import { TeacherTab } from "./TeacherWorkspace";

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Modules" | "Children" | "Actions" | "Reports";
  icon: any;
  action: () => void;
}

interface TeacherCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: TeacherTab) => void;
  onSelectStudent?: (studentName: string) => void;
  onOpenAction?: (actionName: string) => void;
}

export default function TeacherCommandPalette({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectStudent,
  onOpenAction,
}: TeacherCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items: SearchItem[] = useMemo(
    () => [
      // Navigation Modules
      {
        id: "m-home",
        title: "Home Dashboard",
        subtitle: "Classroom schedule, KPI stats, and quick focus",
        category: "Modules",
        icon: Sparkles,
        action: () => {
          onNavigateTab("HOME");
          onClose();
        },
      },
      {
        id: "m-classroom",
        title: "Classroom (Unified Workspace)",
        subtitle: "Student roster, daily class work, activities & lesson plans",
        category: "Modules",
        icon: Users,
        action: () => {
          onNavigateTab("CLASSROOM");
          onClose();
        },
      },
      {
        id: "m-class",
        title: "Student Roster & 360° Profiles",
        subtitle: "Student directory, growth records, and class overview",
        category: "Modules",
        icon: Users,
        action: () => {
          onNavigateTab("MY CLASS");
          onClose();
        },
      },
      {
        id: "m-att",
        title: "Attendance Register",
        subtitle: "Take roll-call, term rate history, and parent alerts",
        category: "Modules",
        icon: CalendarCheck,
        action: () => {
          onNavigateTab("ATTENDANCE");
          onClose();
        },
      },
      {
        id: "m-cw",
        title: "Class Work & Activities",
        subtitle: "Record topics taught, sensory play, parent sharing, and photo proofs",
        category: "Modules",
        icon: FileText,
        action: () => {
          onNavigateTab("CLASS WORK");
          onClose();
        },
      },
      {
        id: "m-lp",
        title: "Weekly Lesson Plan",
        subtitle: "Curriculum schedule, unit objectives, and aids",
        category: "Modules",
        icon: Calendar,
        action: () => {
          onNavigateTab("LESSON PLAN");
          onClose();
        },
      },
      {
        id: "m-act",
        title: "Activities & Sensory Play",
        subtitle: "Sensory games, arts & craft, rhyme time, and outdoor play in Class Work",
        category: "Modules",
        icon: Smile,
        action: () => {
          onNavigateTab("ACTIVITIES");
          onClose();
        },
      },
      {
        id: "m-marks-eval",
        title: "Marks & Evaluation (Unified)",
        subtitle: "Continuous rubrics assessment and term exam marks ledger",
        category: "Modules",
        icon: Award,
        action: () => {
          onNavigateTab("MARKS & EVALUATION");
          onClose();
        },
      },
      {
        id: "m-asm",
        title: "Formative Assessment",
        subtitle: "Developmental rubrics, progress meters, and domain scores",
        category: "Modules",
        icon: CheckSquare,
        action: () => {
          onNavigateTab("ASSESSMENT");
          onClose();
        },
      },
      {
        id: "m-cg",
        title: "Child Growth (Student Profile)",
        subtitle: "WHO percentiles, height, weight, and milestones in Student 360° Profile",
        category: "Modules",
        icon: TrendingUp,
        action: () => {
          onNavigateTab("CHILD GROWTH");
          onClose();
        },
      },
      {
        id: "m-hw",
        title: "Homework Assignments",
        subtitle: "Gentle home reinforcement and submission tracking",
        category: "Modules",
        icon: BookMarked,
        action: () => {
          onNavigateTab("HOMEWORK");
          onClose();
        },
      },
      {
        id: "m-em",
        title: "Exams & Evaluation Marks",
        subtitle: "Assessment timetable, marks ledger, and report cards",
        category: "Modules",
        icon: FileSpreadsheet,
        action: () => {
          onNavigateTab("EXAMS & MARKS");
          onClose();
        },
      },
      {
        id: "m-prt",
        title: "Parent Directory & Messages",
        subtitle: "Direct communications, WhatsApp links, and meeting notes",
        category: "Modules",
        icon: MessageSquare,
        action: () => {
          onNavigateTab("PARENTS");
          onClose();
        },
      },
      {
        id: "m-leave-profile",
        title: "My Leave & Profile",
        subtitle: "Faculty leave self-service quota and account settings",
        category: "Modules",
        icon: Clock,
        action: () => {
          onNavigateTab("LEAVE & PROFILE");
          onClose();
        },
      },
      {
        id: "m-lv",
        title: "Teacher Leave Management",
        subtitle: "Casual, Sick, and Earned leave applications",
        category: "Modules",
        icon: Clock,
        action: () => {
          onNavigateTab("LEAVE");
          onClose();
        },
      },

      // Children
      {
        id: "c-aarav",
        title: "Aarav Sharma",
        subtitle: "Roll: 01 • LKG-A • Present • Father: Rohan Sharma",
        category: "Children",
        icon: Users,
        action: () => {
          onNavigateTab("MY CLASS");
          onSelectStudent?.("Aarav Sharma");
          onClose();
        },
      },
      {
        id: "c-diya",
        title: "Diya Verma",
        subtitle: "Roll: 02 • LKG-A • Present • Mother: Neha Verma",
        category: "Children",
        icon: Users,
        action: () => {
          onNavigateTab("MY CLASS");
          onSelectStudent?.("Diya Verma");
          onClose();
        },
      },
      {
        id: "c-rohan",
        title: "Rohan Mehta",
        subtitle: "Roll: 03 • LKG-A • Present • Father: Amit Mehta",
        category: "Children",
        icon: Users,
        action: () => {
          onNavigateTab("MY CLASS");
          onSelectStudent?.("Rohan Mehta");
          onClose();
        },
      },
      {
        id: "c-sneha",
        title: "Sneha Iyer",
        subtitle: "Roll: 04 • LKG-A • Late • Mother: Priya Iyer",
        category: "Children",
        icon: Users,
        action: () => {
          onNavigateTab("MY CLASS");
          onSelectStudent?.("Sneha Iyer");
          onClose();
        },
      },
      {
        id: "c-vihaan",
        title: "Vihaan Singh",
        subtitle: "Roll: 05 • LKG-A • Absent • Father: Rajesh Singh",
        category: "Children",
        icon: Users,
        action: () => {
          onNavigateTab("MY CLASS");
          onSelectStudent?.("Vihaan Singh");
          onClose();
        },
      },
      {
        id: "c-anaya",
        title: "Anaya Khan",
        subtitle: "Roll: 06 • LKG-A • Present • Mother: Farah Khan",
        category: "Children",
        icon: Users,
        action: () => {
          onNavigateTab("MY CLASS");
          onSelectStudent?.("Anaya Khan");
          onClose();
        },
      },

      // Quick Actions
      {
        id: "a-att",
        title: "Take Attendance Now",
        subtitle: "Launch full interactive roll-call modal",
        category: "Actions",
        icon: CalendarCheck,
        action: () => {
          onOpenAction?.("attendance");
          onClose();
        },
      },
      {
        id: "a-cw",
        title: "Add Daily Class Work",
        subtitle: "Post today's learning activities to parent diary",
        category: "Actions",
        icon: Plus,
        action: () => {
          onOpenAction?.("classwork");
          onClose();
        },
      },
      {
        id: "a-act",
        title: "Create New Activity",
        subtitle: "Plan sensory, art, or song activity for class",
        category: "Actions",
        icon: Plus,
        action: () => {
          onOpenAction?.("activity");
          onClose();
        },
      },
      {
        id: "a-hw",
        title: "Assign Homework",
        subtitle: "Set home practice task with due date",
        category: "Actions",
        icon: Plus,
        action: () => {
          onOpenAction?.("homework");
          onClose();
        },
      },
      {
        id: "a-msg",
        title: "Broadcast to Parents",
        subtitle: "Send instant notification to all LKG-A parents",
        category: "Actions",
        icon: MessageSquare,
        action: () => {
          onOpenAction?.("message");
          onClose();
        },
      },
    ],
    [onNavigateTab, onSelectStudent, onOpenAction, onClose]
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setSelectedIndex(0);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent
          const customEvent = new CustomEvent("toggle-teacher-search");
          window.dispatchEvent(customEvent);
        }
      }

      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        filteredItems[selectedIndex].action();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#071126]/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search children, activities, homework, reports, or modules..."
                className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 shadow-2xs">
                ESC
              </kbd>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  <p className="font-semibold">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-[11px] mt-1">Try searching for a student name, module, or action.</p>
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-[#2563EB] text-white shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold block truncate">{item.title}</span>
                          <span className="text-[11px] text-slate-400 block truncate">{item.subtitle}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {item.category}
                        </span>
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer keyboard hints */}
            <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="font-bold">↑↓</kbd> navigate
                </span>
                <span>
                  <kbd className="font-bold">↵</kbd> select
                </span>
              </div>
              <span className="text-[10px]">LKG – Section A Academic Suite</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
