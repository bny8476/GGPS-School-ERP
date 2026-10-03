"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  FileText, Plus, Pin, Tag, Search, Trash2, Lock, Eye, Users, 
  Printer, MessageSquare, Sparkles, Check, X, ShieldAlert,
  Calendar, CheckSquare, List, Bold, Italic, Table, Quote, 
  Heading, Download, ExternalLink, CornerDownLeft, RefreshCw,
  Building, UserCheck, ChevronRight
} from "lucide-react";
import EmergencyBanner from "@/components/ui/EmergencyBanner";
import toast from "react-hot-toast";
import { printDocument } from "@/lib/exportUtils";

interface NoteComment {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string | Date;
}

interface NoteItem {
  _id?: string;
  id?: string | number;
  title: string;
  content: string;
  category: "Academic" | "Staff" | "Curriculum" | "Safety" | "Meeting Minutes" | "General";
  privacy: "private" | "executive_board" | "public_staff";
  authorName?: string;
  authorRole?: string;
  isPinned: boolean;
  isArchived: boolean;
  tags?: string[];
  color?: string;
  comments?: NoteComment[];
  createdAt: string | Date;
}

const FALLBACK_NOTES: NoteItem[] = [
  {
    id: "note_1",
    title: "Executive Board Resolution #BR-2026-08: STEAM & AI Innovation Lab",
    content: `## Executive Resolution & Capital Allocation

The Governing Board of **GGPS School** hereby ratifies the capital budget allocation for the Phase 2 STEAM Innovation Centre.

### Key Resolution Directives:
* **Approved Grant**: $125,000 from the 2026 Development Reserve.
* **Procurement Lead**: Chief Finance Officer (Robert Taylor) & IT Directorate.
* **Target Delivery**: Prior to Term 2 orientation (November 15, 2026).

| Equipment / Asset | Units | Department | Projected Cost |
| :--- | :--- | :--- | :--- |
| Advanced Robotics Kits | 30 | Secondary Science | $35,000 |
| High-Performance Workstations | 25 | Computer Science | $52,000 |
| 3D Prototyping Stations | 4 | Design Tech | $18,000 |
| Teacher Certification | - | Faculty Training | $20,000 |

### Confidentiality Clause:
> *This resolution is classified as Executive Board Only. Public dissemination is restricted until formal faculty announcement on October 1st.*`,
    category: "Meeting Minutes",
    privacy: "private",
    authorName: "Super Admin",
    authorRole: "Executive Administration",
    isPinned: true,
    isArchived: false,
    tags: ["Board Resolution", "Finance", "STEAM"],
    color: "#FFFFFF",
    comments: [
      {
        id: "c1",
        authorName: "Dr. Marcus Vance",
        authorRole: "Principal",
        text: "The equipment specifications have been reviewed by Department Heads and fully endorsed.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "note_2",
    title: "Kindergarten Curriculum Harmonization Plan: Pre-KG, LKG & UKG",
    content: `## Early Years Foundation Stage (EYFS) Moderation Framework

Coordination memo regarding curriculum alignment between Pre-KG, LKG, and UKG early literacy and sensory learning.

### Objectives:
- [x] Standardize phonics pronunciation and sound-play rubrics for Term 1.
- [x] Integrate sensory motor-skills activities and Montessori math trays.
- [ ] Finalize developmental assessment milestones for UKG (Target: Oct 15).
- [ ] Circulate parental early childhood milestone consultation booklet.

### Assigned Academic Mentors:
* **Early Literacy & Phonics**: Sarah Jenkins (Head of Dept)
* **Numeracy & Fine Motor**: David Chen (Pre-KG Phonics Lead)
* **General Awareness & Storytelling**: Elena Rostova (Dean of Academics)

> **Mandatory Note**: Class advisors must submit term completion logs by Friday 4:00 PM.`,
    category: "Curriculum",
    privacy: "executive_board",
    authorName: "Sarah Jenkins",
    authorRole: "Head of Mathematics",
    isPinned: true,
    isArchived: false,
    tags: ["Curriculum", "IGCSE", "IB Diploma"],
    color: "#FFFFFF",
    comments: [
      {
        id: "c2",
        authorName: "Elena Rostova",
        authorRole: "Dean of Students",
        text: "Parent consultation dates will be synchronized with the ERP calendar tomorrow morning.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "note_3",
    title: "Campus Safety & Fire Evacuation Protocols: 2026 Audit Standard",
    content: `## Official Institutional Safety Directive

Notice to all teaching faculty, facility staff, and administrative personnel regarding emergency preparedness.

### Assembly Stations:
1. **Primary Wing**: North Courtyard (Station Alpha)
2. **Secondary Wing & Labs**: Central Sports Pavilion (Station Beta)
3. **Dining & Hostel**: South Perimeter Green (Station Gamma)

### Staff Responsibilities:
* Homeroom proctors must carry class physical attendance dossiers.
* Lab teachers must activate emergency main gas shut-off valves immediately.
* Floor marshals must verify restrooms and stairwells before evacuating.

> *Inspection scheduled with City Fire Safety Bureau next Tuesday at 10:30 AM.*`,
    category: "Safety",
    privacy: "public_staff",
    authorName: "Michael Chang",
    authorRole: "Head of Campus Safety",
    isPinned: false,
    isArchived: false,
    tags: ["Safety", "Compliance", "All Staff"],
    color: "#FFFFFF",
    comments: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>(FALLBACK_NOTES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPrivacy, setSelectedPrivacy] = useState<"All" | "private" | "executive_board" | "public_staff">("All");
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal States
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorCategory, setEditorCategory] = useState<NoteItem["category"]>("Meeting Minutes");
  const [editorPrivacy, setEditorPrivacy] = useState<NoteItem["privacy"]>("private");
  const [editorTags, setEditorTags] = useState("");
  const [editorIsPinned, setEditorIsPinned] = useState(false);
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Comments Drawer / Modal States
  const [activeCommentNote, setActiveCommentNote] = useState<NoteItem | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Printable / Official PDF Export Modal
  const [pdfNote, setPdfNote] = useState<NoteItem | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fetch Notes from API
  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notes`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          setNotes(data.data);
        }
      }
    } catch (err) {
      console.warn("Using fallback notes due to latency:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Markdown Formatting Helper
  const insertFormatting = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end) || "Sample Text";
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setEditorContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  // Insert Table Template
  const insertTableTemplate = () => {
    const tableString = `\n| Agenda Item | Lead Advisor | Timeline | Status |\n| :--- | :--- | :--- | :--- |\n| Curriculum Review | Sarah Jenkins | Oct 10 | Pending |\n| Lab Safety Audit | Michael Chang | Oct 15 | Approved |\n`;
    setEditorContent((prev) => prev + tableString);
  };

  // Save / Create Note
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorTitle.trim() || !editorContent.trim()) {
      toast.error("Please enter a note title and content.");
      return;
    }

    const payload = {
      title: editorTitle,
      content: editorContent,
      category: editorCategory,
      privacy: editorPrivacy,
      isPinned: editorIsPinned,
      tags: editorTags ? editorTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };

    try {
      const res = await fetch(`${API_URL}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setNotes((prev) => [data.data, ...prev]);
        toast.success("Institutional memo saved successfully!");
      } else {
        throw new Error("Local fallback");
      }
    } catch (err) {
      const localNote: NoteItem = {
        id: `note_${Date.now()}`,
        title: editorTitle,
        content: editorContent,
        category: editorCategory,
        privacy: editorPrivacy,
        authorName: "Super Admin",
        authorRole: "Executive Administration",
        isPinned: editorIsPinned,
        isArchived: false,
        tags: editorTags ? editorTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        comments: [],
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => [localNote, ...prev]);
      toast.success("Note saved to local workspace!");
    }

    setEditorTitle("");
    setEditorContent("");
    setEditorTags("");
    setShowEditorModal(false);
  };

  // Toggle Pin
  const togglePin = async (note: NoteItem) => {
    const noteId = note._id || note.id;
    const newPinned = !note.isPinned;

    setNotes((prev) =>
      prev.map((n) => ((n._id || n.id) === noteId ? { ...n, isPinned: newPinned } : n))
    );
    toast.success(newPinned ? "Memo pinned to top!" : "Memo unpinned.");

    try {
      await fetch(`${API_URL}/api/notes/${noteId}/pin`, { method: "PATCH" });
    } catch (e) {}
  };

  // Delete Note
  const handleDeleteNote = async (note: NoteItem) => {
    const noteId = note._id || note.id;
    setNotes((prev) => prev.filter((n) => (n._id || n.id) !== noteId));
    toast.success("Note removed.");

    try {
      await fetch(`${API_URL}/api/notes/${noteId}`, { method: "DELETE" });
    } catch (e) {}
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentNote || !newCommentText.trim()) return;

    const noteId = activeCommentNote._id || activeCommentNote.id;

    const newComment: NoteComment = {
      id: `c_${Date.now()}`,
      authorName: "Super Admin",
      authorRole: "Executive Administration",
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    };

    // Update in active modal and list
    const updatedComments = [...(activeCommentNote.comments || []), newComment];
    const updatedNote = { ...activeCommentNote, comments: updatedComments };

    setActiveCommentNote(updatedNote);
    setNotes((prev) => prev.map((n) => ((n._id || n.id) === noteId ? updatedNote : n)));
    setNewCommentText("");
    toast.success("Review feedback recorded!");

    try {
      await fetch(`${API_URL}/api/notes/${noteId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newComment.text,
          authorName: "Super Admin",
          authorRole: "Executive Administration",
        }),
      });
    } catch (e) {}
  };

  // Trigger Print / PDF Export
  const handlePrintPDF = (note: NoteItem) => {
    setPdfNote(note);
    setTimeout(() => {
      printDocument('printable-note-letterhead', `GGPS Memo - ${note.title}`);
    }, 200);
  };

  // Privacy styling badge
  const getPrivacyBadge = (privacy: NoteItem["privacy"]) => {
    switch (privacy) {
      case "private":
        return {
          label: "Private (Super Admin)",
          icon: Lock,
          bg: "bg-[#000E28] text-white dark:bg-[#001438] border border-slate-700",
        };
      case "executive_board":
        return {
          label: "Executive Board",
          icon: Building,
          bg: "bg-[#E5EEFF] text-[#0050CB] dark:bg-[#0050CB]/30 dark:text-[#38BDF8] border border-[#0050CB]/30",
        };
      case "public_staff":
        return {
          label: "Public Staff Notice",
          icon: Users,
          bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800",
        };
      default:
        return {
          label: "General",
          icon: Eye,
          bg: "bg-slate-100 text-slate-700",
        };
    }
  };

  // Category styling
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Meeting Minutes":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300";
      case "Curriculum":
        return "bg-blue-100 text-[#0050CB] dark:bg-blue-950/60 dark:text-[#38BDF8]";
      case "Safety":
        return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300";
      case "Staff":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  // Dynamic Filtering
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Privacy filter
      if (selectedPrivacy !== "All" && n.privacy !== selectedPrivacy) return false;

      // Category filter
      if (selectedCategory !== "All Categories" && n.category !== selectedCategory) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const tagMatch = n.tags && n.tags.some((t) => t.toLowerCase().includes(q));
        const match =
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.authorName && n.authorName.toLowerCase().includes(q)) ||
          tagMatch;
        if (!match) return false;
      }

      return true;
    });
  }, [notes, selectedPrivacy, selectedCategory, searchQuery]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans text-[#000E28] dark:text-white pb-16">
      <EmergencyBanner />

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-white via-[#E5EEFF]/40 to-white dark:from-[#000E28] dark:via-[#001844] dark:to-[#000E28] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#0050CB] text-white rounded-2xl shadow-md shadow-[#0050CB]/25 shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight">
                Notes, Executive Memos & Minutes
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E5EEFF] text-[#0050CB] dark:bg-[#0050CB]/30 dark:text-[#38BDF8] border border-[#0050CB]/20">
                <Lock className="w-3 h-3" />
                RBAC Governed
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
              Institutional records, executive resolutions, curriculum frameworks, and collaborative meeting minutes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchNotes()}
            disabled={isLoading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Refresh Notes"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#0050CB]" : ""}`} />
          </button>

          <button
            onClick={() => {
              setEditorTitle("");
              setEditorContent("");
              setEditorTags("");
              setShowEditorModal(true);
            }}
            className="px-5 py-2.5 bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-extrabold rounded-xl shadow-md shadow-[#0050CB]/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>New Institutional Memo</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white dark:bg-[#000E28] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search memos by keyword, title, tag, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0050CB]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Privacy Scope Filter */}
          <select
            value={selectedPrivacy}
            onChange={(e) => setSelectedPrivacy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shrink-0"
          >
            <option value="All">All Privacy Scopes</option>
            <option value="private">🔒 Private (Super Admin)</option>
            <option value="executive_board">🏛️ Executive Board</option>
            <option value="public_staff">📢 Public Staff Notice</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shrink-0"
          >
            <option value="All Categories">All Categories</option>
            <option value="Meeting Minutes">Meeting Minutes</option>
            <option value="Curriculum">Curriculum</option>
            <option value="Safety">Safety</option>
            <option value="Staff">Staff</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#000E28] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xl font-black text-[#000E28] dark:text-white leading-none">{notes.length}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Total Records</p>
          </div>
          <FileText className="w-5 h-5 text-[#0050CB]" />
        </div>

        <div className="bg-white dark:bg-[#000E28] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xl font-black text-[#000E28] dark:text-white leading-none">
              {notes.filter((n) => n.privacy === "private").length}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Private (Admin)</p>
          </div>
          <Lock className="w-5 h-5 text-amber-500" />
        </div>

        <div className="bg-white dark:bg-[#000E28] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xl font-black text-[#000E28] dark:text-white leading-none">
              {notes.filter((n) => n.privacy === "executive_board").length}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Board Memos</p>
          </div>
          <Building className="w-5 h-5 text-[#0050CB]" />
        </div>

        <div className="bg-white dark:bg-[#000E28] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xl font-black text-[#000E28] dark:text-white leading-none">
              {notes.filter((n) => n.isPinned).length}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Pinned Items</p>
          </div>
          <Pin className="w-5 h-5 text-[#FF690C]" />
        </div>
      </div>

      {/* NOTES GRID */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-[#000E28] rounded-3xl p-16 text-center space-y-3 border border-slate-200/80 dark:border-slate-800 text-slate-400">
          <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No notes found</h3>
          <p className="text-xs max-w-sm mx-auto">
            No institutional memos match the current search or confidentiality filter.
          </p>
          <button
            onClick={() => setShowEditorModal(true)}
            className="px-4 py-2 bg-[#0050CB] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0041A8] cursor-pointer"
          >
            Create New Memo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const privacy = getPrivacyBadge(note.privacy);
            const noteId = note._id || note.id;

            return (
              <div
                key={noteId}
                className={`bg-white dark:bg-[#000E28] border rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between transition-all relative ${
                  note.isPinned
                    ? "border-[#0050CB]/50 dark:border-[#0050CB]/40 shadow-sm"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-[#0050CB]/30"
                }`}
              >
                {/* Header Pills */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${getCategoryBadge(note.category)}`}>
                        {note.category}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${privacy.bg}`}>
                        <privacy.icon className="w-2.5 h-2.5" />
                        <span>{privacy.label}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => togglePin(note)}
                      className="text-slate-300 hover:text-[#FF690C] transition-colors cursor-pointer"
                      title={note.isPinned ? "Unpin Memo" : "Pin Memo"}
                    >
                      <Pin className={`w-4 h-4 ${note.isPinned ? "text-[#FF690C] fill-[#FF690C]" : ""}`} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {note.title}
                  </h3>

                  {/* Content Preview */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal space-y-1 line-clamp-4">
                    {note.content.replace(/[#*`>-]/g, "").substring(0, 180)}...
                  </div>

                  {/* Tag Chips */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      {note.tags.map((tag, i) => (
                        <span key={i} className="text-[9px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Metadata & Action Icons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>{typeof note.createdAt === "string" && note.createdAt.includes("T") ? new Date(note.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) : "Recent"}</span>
                    <span>•</span>
                    <span className="truncate max-w-[100px]">{note.authorName || "Super Admin"}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Comments Button */}
                    <button
                      onClick={() => setActiveCommentNote(note)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-[#0050CB] flex items-center gap-1 cursor-pointer transition-colors"
                      title="View & Add Review Comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{note.comments?.length || 0}</span>
                    </button>

                    {/* PDF Export Button */}
                    <button
                      onClick={() => handlePrintPDF(note)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 cursor-pointer transition-colors"
                      title="1-Click Official PDF / Letterhead Export"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteNote(note)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                      title="Delete Memo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* RICH-TEXT / MARKDOWN EDITOR MODAL                                         */}
      {/* ========================================================================= */}
      {showEditorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-[#001438] dark:to-[#000E28]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#0050CB] text-white rounded-xl shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#000E28] dark:text-white">
                    Compose Institutional Memo / Meeting Minutes
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Supports rich headings, checklists, board resolution tables, and confidentiality scopes.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowEditorModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNote} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Title & Privacy Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <label className="font-extrabold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    placeholder="e.g. Executive Board Resolution #BR-2026-09"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0050CB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#0050CB]" />
                    <span>Confidentiality</span>
                  </label>
                  <select
                    value={editorPrivacy}
                    onChange={(e) => setEditorPrivacy(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-white outline-none"
                  >
                    <option value="private">🔒 Private (Super Admin)</option>
                    <option value="executive_board">🏛️ Executive Board</option>
                    <option value="public_staff">📢 Public Staff Notice</option>
                  </select>
                </div>
              </div>

              {/* Category, Tags & Pin Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={editorCategory}
                    onChange={(e) => setEditorCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-white outline-none"
                  >
                    <option value="Meeting Minutes">Meeting Minutes</option>
                    <option value="Curriculum">Curriculum</option>
                    <option value="Safety">Safety</option>
                    <option value="Staff">Staff</option>
                    <option value="Academic">Academic</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editorTags}
                    onChange={(e) => setEditorTags(e.target.value)}
                    placeholder="e.g. Budget, STEAM, Board"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-medium outline-none"
                  />
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={editorIsPinned}
                      onChange={(e) => setEditorIsPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0050CB] focus:ring-[#0050CB]"
                    />
                    <span>Pin to Top of Dashboard</span>
                  </label>
                </div>
              </div>

              {/* Rich-Text Formatting Toolbar */}
              <div className="p-2 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => insertFormatting("**", "**")}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-black text-xs cursor-pointer"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("*", "*")}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 italic text-xs cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("## ")}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-bold text-xs cursor-pointer flex items-center gap-0.5"
                    title="Heading"
                  >
                    <Heading className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("* ")}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-xs cursor-pointer"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("- [ ] ")}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-xs cursor-pointer"
                    title="Checklist Item"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("> ")}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-xs cursor-pointer"
                    title="Quote Block"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={insertTableTemplate}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                    title="Insert Resolution / Minutes Table"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>+ Table</span>
                  </button>
                </div>

                {/* Preview Toggle */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setEditorMode("edit")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors cursor-pointer ${
                      editorMode === "edit" ? "bg-[#0050CB] text-white" : "text-slate-500"
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("preview")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors cursor-pointer ${
                      editorMode === "preview" ? "bg-[#0050CB] text-white" : "text-slate-500"
                    }`}
                  >
                    Live Preview
                  </button>
                </div>
              </div>

              {/* Editor Content or Live Preview */}
              {editorMode === "edit" ? (
                <div>
                  <textarea
                    ref={textareaRef}
                    required
                    rows={12}
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Type executive memo content, meeting resolutions, action items, or paste markdown tables..."
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0050CB] leading-relaxed"
                  />
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#001438] min-h-[260px] space-y-3">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0050CB]">
                      Institutional Preview
                    </span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white mt-1">
                      {editorTitle || "Document Title Preview"}
                    </h2>
                  </div>
                  <div className="whitespace-pre-line text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                    {editorContent || "Write something in the editor to see formatted preview..."}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowEditorModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold rounded-xl shadow-md shadow-[#0050CB]/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Official Memo</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COLLABORATIVE REVIEW COMMENTS DRAWER                                      */}
      {/* ========================================================================= */}
      {activeCommentNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#0050CB] text-white rounded-xl">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Leadership Review & Comments</h3>
                  <p className="text-[10px] text-slate-400">Collaboration on agenda draft & board resolutions.</p>
                </div>
              </div>
              <button onClick={() => setActiveCommentNote(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note Snippet */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <h4 className="font-bold text-[#0050CB] dark:text-[#38BDF8] line-clamp-1">{activeCommentNote.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{activeCommentNote.content}</p>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              {(!activeCommentNote.comments || activeCommentNote.comments.length === 0) ? (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold">No feedback comments yet</p>
                  <p className="text-[10px]">Add review notes or revision requests below.</p>
                </div>
              ) : (
                activeCommentNote.comments.map((cmt) => (
                  <div key={cmt.id} className="pt-2.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 dark:text-white">{cmt.authorName}</span>
                      <span className="text-[10px] text-slate-400">
                        {typeof cmt.createdAt === "string" && cmt.createdAt.includes("T") ? new Date(cmt.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) : "Today"}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-[#0050CB] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.2 rounded">
                      {cmt.authorRole}
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-0.5 leading-relaxed">
                      {cmt.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add review feedback or advisory note..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0050CB]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span>Post Review Feedback</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1-CLICK PRINTABLE SCHOOL LETTERHEAD TEMPLATE (FOR WINDOW.PRINT / PDF)     */}
      {/* ========================================================================= */}
      {pdfNote && (
        <div id="printable-note-letterhead" className="print-only p-10 font-serif text-black max-w-3xl mx-auto space-y-6">
          {/* Letterhead Banner */}
          <div className="border-b-2 border-black pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider">GGPS SCHOOL</h1>
              <p className="text-xs tracking-widest text-slate-600">OFFICE OF THE GOVERNING BOARD & SUPER ADMIN</p>
              <p className="text-[10px] text-slate-500">Plot 42, Knowledge Avenue • contact@ggps.edu</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold">REF: GGPS-MEMO-2026</p>
              <p>Date: {new Date().toLocaleDateString([], { dateStyle: "long" })}</p>
              <p className="font-bold uppercase text-[10px]">{pdfNote.privacy.replace("_", " ")}</p>
            </div>
          </div>

          {/* Subject / Title */}
          <div>
            <h2 className="text-lg font-black">{pdfNote.title}</h2>
            <p className="text-xs italic text-slate-600">Category: {pdfNote.category} • Authorized Author: {pdfNote.authorName || "Super Admin"}</p>
          </div>

          {/* Body Content */}
          <div className="whitespace-pre-line text-sm leading-relaxed space-y-3 font-sans">
            {pdfNote.content}
          </div>

          {/* Official Signature & Seal Placeholder */}
          <div className="pt-16 border-t border-slate-300 flex items-center justify-between text-xs font-sans">
            <div className="space-y-1">
              <div className="w-40 border-b border-black"></div>
              <p className="font-bold">Dr. Marcus Vance, Ph.D.</p>
              <p className="text-slate-500 text-[10px]">Principal & Academic Executive</p>
            </div>

            <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400 font-bold text-center">
              OFFICIAL<br />INSTITUTIONAL<br />SEAL
            </div>

            <div className="space-y-1 text-right">
              <div className="w-40 border-b border-black ml-auto"></div>
              <p className="font-bold">Super Admin Directorate</p>
              <p className="text-slate-500 text-[10px]">GGPS School</p>
            </div>
          </div>
        </div>
      )}

      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible !important;
            display: block !important;
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

    </div>
  );
}
