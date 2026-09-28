"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Smile,
  Send,
  CheckCheck,
  Check,
  PhoneCall,
  Mail,
  MapPin,
  Calendar,
  FileEdit,
  Download,
  ArrowRight,
  UserCheck,
  GraduationCap,
  X,
  Plus
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { getApiBaseUrl } from "@/lib/utils";

type FilterTab = "all" | "parent" | "teacher" | "student";

interface DocumentItem {
  id: string;
  name: string;
  size: string;
  date: string;
  url?: string;
}

interface Message {
  id: string;
  sender: "contact" | "me";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
}

interface Conversation {
  id: string;
  name: string;
  roleType: "parent" | "teacher" | "student";
  tag: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
  phone: string;
  email: string;
  address: string;
  child?: {
    name: string;
    grade: string;
    avatar: string;
  };
  classesTaught?: string[];
  documents: DocumentItem[];
  messages: Message[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    name: "Priya Sharma",
    roleType: "parent",
    tag: "Parent • Aarav Sharma (LKG-A)",
    avatar: "/priya-sharma-avatar.jpg",
    lastMessage: "Thank you for the information. 😊",
    time: "10:24 AM",
    unreadCount: 2,
    online: true,
    phone: "+91 98765 43210",
    email: "priya.sharma@email.com",
    address: "12 Green Park, Chennai, Tamil Nadu",
    child: {
      name: "Aarav Sharma",
      grade: "LKG - A",
      avatar: "/aarav-sharma-avatar.jpg"
    },
    documents: [
      { id: "doc-1", name: "Student_Profile.pdf", size: "2.4 MB", date: "Sep 20, 2026" },
      { id: "doc-2", name: "Birth_Certificate.pdf", size: "1.8 MB", date: "Sep 18, 2026" },
      { id: "doc-3", name: "Address_Proof.pdf", size: "1.2 MB", date: "Sep 15, 2026" }
    ],
    messages: [
      {
        id: "m-1",
        sender: "contact",
        text: "Hello,  I wanted to know if the school timings are the same for next week as well?",
        time: "09:42 AM"
      },
      {
        id: "m-2",
        sender: "me",
        text: "Good morning! Yes, the school timings will remain the same. School starts at 8:30 AM and ends at 2:30 PM.\n\nLet me know if you need any more information.",
        time: "09:45 AM",
        status: "read"
      },
      {
        id: "m-3",
        sender: "contact",
        text: "Thank you for the information. 😊",
        time: "10:24 AM"
      }
    ]
  },
  {
    id: "conv-2",
    name: "Rohit Verma",
    roleType: "parent",
    tag: "Parent • Diya Verma (UKG-B)",
    avatar: "/rohit-verma-avatar.jpg",
    lastMessage: "When will the mid-term results be declared?",
    time: "09:45 AM",
    unreadCount: 1,
    online: true,
    phone: "+91 98401 23456",
    email: "rohit.verma@email.com",
    address: "45 Anna Nagar, Chennai, Tamil Nadu",
    child: {
      name: "Diya Verma",
      grade: "UKG - B",
      avatar: "/hero-girl-student.png"
    },
    documents: [
      { id: "doc-4", name: "Diya_Admission_Form.pdf", size: "3.1 MB", date: "Sep 10, 2026" },
      { id: "doc-5", name: "Term1_Fee_Receipt.pdf", size: "640 KB", date: "Aug 29, 2026" }
    ],
    messages: [
      {
        id: "m-201",
        sender: "contact",
        text: "Hello Principal and Administration team. When will the mid-term results be declared?",
        time: "09:45 AM"
      }
    ]
  },
  {
    id: "conv-3",
    name: "Sunita Reddy",
    roleType: "teacher",
    tag: "Teacher • Class 1-A",
    avatar: "/avatar-anjali.png",
    lastMessage: "Please find the lesson plan for this week.",
    time: "Yesterday",
    unreadCount: 3,
    online: false,
    phone: "+91 94451 87654",
    email: "sunita.reddy@ggpsschool.com",
    address: "Staff Quarters B-4, GGPS Campus, Chennai",
    classesTaught: ["Class 1-A (English)", "Class 1-A (EVS)"],
    documents: [
      { id: "doc-6", name: "Lesson_Plan_Week4.pdf", size: "1.5 MB", date: "Sep 27, 2026" },
      { id: "doc-7", name: "Class1A_Attendance_Summary.pdf", size: "850 KB", date: "Sep 25, 2026" }
    ],
    messages: [
      {
        id: "m-301",
        sender: "contact",
        text: "Good afternoon. Please find the lesson plan for this week uploaded to the portal.",
        time: "Yesterday 03:15 PM"
      }
    ]
  },
  {
    id: "conv-4",
    name: "Anil Kumar",
    roleType: "parent",
    tag: "Parent • Rohan Kumar (LKG-B)",
    avatar: "/avatar-rajesh.png",
    lastMessage: "Can you please share the homework details?",
    time: "Yesterday",
    unreadCount: 0,
    online: false,
    phone: "+91 97890 12345",
    email: "anil.kumar@email.com",
    address: "88 T. Nagar, Chennai, Tamil Nadu",
    child: {
      name: "Rohan Kumar",
      grade: "LKG - B",
      avatar: "/aarav-hero-student.jpg"
    },
    documents: [
      { id: "doc-8", name: "Rohan_Medical_Report.pdf", size: "1.1 MB", date: "Aug 15, 2026" }
    ],
    messages: [
      {
        id: "m-401",
        sender: "contact",
        text: "Can you please share the homework details for today?",
        time: "Yesterday 04:30 PM"
      },
      {
        id: "m-402",
        sender: "me",
        text: "Certainly! The teacher has posted the LKG-B rhymes and coloring assignment under the student homework tab.",
        time: "Yesterday 04:45 PM",
        status: "read"
      }
    ]
  },
  {
    id: "conv-5",
    name: "Neha Kapoor",
    roleType: "parent",
    tag: "Parent • Anaya Kapoor (UKG-A)",
    avatar: "/avatar-priya.png",
    lastMessage: "Is there any holiday on Friday?",
    time: "Aug 27",
    unreadCount: 1,
    online: false,
    phone: "+91 98840 56789",
    email: "neha.kapoor@email.com",
    address: "16 Velachery Main Rd, Chennai",
    child: {
      name: "Anaya Kapoor",
      grade: "UKG - A",
      avatar: "/ananya-student.jpg"
    },
    documents: [
      { id: "doc-9", name: "Anaya_Birth_Certificate.pdf", size: "1.4 MB", date: "Jul 12, 2026" }
    ],
    messages: [
      {
        id: "m-501",
        sender: "contact",
        text: "Is there any holiday on Friday? We received a notice about staff training.",
        time: "Aug 27 11:15 AM"
      }
    ]
  },
  {
    id: "conv-6",
    name: "Vikram Singh",
    roleType: "teacher",
    tag: "Teacher • Class 2-B",
    avatar: "/teacher-ananya-roy.jpg",
    lastMessage: "The class activity is updated in the portal.",
    time: "Aug 26",
    unreadCount: 0,
    online: true,
    phone: "+91 91760 34567",
    email: "vikram.singh@ggpsschool.com",
    address: "32 Adyar, Chennai, Tamil Nadu",
    classesTaught: ["Class 2-B (Maths)", "Class 2-B (Robotics)"],
    documents: [
      { id: "doc-10", name: "Science_Fair_Guidelines.pdf", size: "2.8 MB", date: "Aug 26, 2026" }
    ],
    messages: [
      {
        id: "m-601",
        sender: "contact",
        text: "The class activity is updated in the portal. All parent permissions are collected.",
        time: "Aug 26 02:40 PM"
      }
    ]
  },
  {
    id: "conv-7",
    name: "Meera Iyer",
    roleType: "parent",
    tag: "Parent • Advait Iyer (Class 3)",
    avatar: "/priya-sharma-avatar.jpg",
    lastMessage: "Thank you for the support and guidance.",
    time: "Aug 25",
    unreadCount: 0,
    online: false,
    phone: "+91 99400 98765",
    email: "meera.iyer@email.com",
    address: "24 Mylapore, Chennai, Tamil Nadu",
    child: {
      name: "Advait Iyer",
      grade: "Class 3 - A",
      avatar: "/aarav-exact-avatar.png"
    },
    documents: [
      { id: "doc-11", name: "Advait_ReportCard_Term1.pdf", size: "980 KB", date: "Aug 20, 2026" }
    ],
    messages: [
      {
        id: "m-701",
        sender: "contact",
        text: "Thank you for the support and guidance during the parent-teacher meeting.",
        time: "Aug 25 05:10 PM"
      }
    ]
  },
  {
    id: "conv-8",
    name: "Suresh Patel",
    roleType: "parent",
    tag: "Parent • Aanya Patel (LKG-A)",
    avatar: "/rohit-verma-avatar.jpg",
    lastMessage: "Please send the fee receipt for this month.",
    time: "Aug 24",
    unreadCount: 0,
    online: false,
    phone: "+91 98410 43210",
    email: "suresh.patel@email.com",
    address: "77 Besant Nagar, Chennai",
    child: {
      name: "Aanya Patel",
      grade: "LKG - A",
      avatar: "/hero-girl-student.png"
    },
    documents: [
      { id: "doc-12", name: "Fee_Receipt_Aug2026.pdf", size: "480 KB", date: "Aug 24, 2026" }
    ],
    messages: [
      {
        id: "m-801",
        sender: "contact",
        text: "Please send the fee receipt for this month.",
        time: "Aug 24 10:05 AM"
      }
    ]
  },
  {
    id: "conv-9",
    name: "Aarav Sharma",
    roleType: "student",
    tag: "Student • LKG-A",
    avatar: "/aarav-sharma-avatar.jpg",
    lastMessage: "Thank you Teacher for the story session!",
    time: "Aug 22",
    unreadCount: 1,
    online: true,
    phone: "+91 98765 43210 (Parent)",
    email: "aarav.s@student.ggpsschool.com",
    address: "12 Green Park, Chennai",
    child: {
      name: "Aarav Sharma",
      grade: "LKG - A",
      avatar: "/aarav-sharma-avatar.jpg"
    },
    documents: [
      { id: "doc-13", name: "Drawing_Activity_LKG.pdf", size: "1.9 MB", date: "Aug 22, 2026" }
    ],
    messages: [
      {
        id: "m-901",
        sender: "contact",
        text: "Thank you Teacher for the fun story session today! I colored the elephant.",
        time: "Aug 22 01:30 PM"
      }
    ]
  },
  {
    id: "conv-10",
    name: "Diya Verma",
    roleType: "student",
    tag: "Student • UKG-B",
    avatar: "/hero-girl-student.png",
    lastMessage: "Submitted my drawing assignment.",
    time: "Aug 20",
    unreadCount: 1,
    online: false,
    phone: "+91 98401 23456 (Parent)",
    email: "diya.v@student.ggpsschool.com",
    address: "45 Anna Nagar, Chennai",
    child: {
      name: "Diya Verma",
      grade: "UKG - B",
      avatar: "/hero-girl-student.png"
    },
    documents: [
      { id: "doc-14", name: "Art_Portfolio_UKG.pdf", size: "2.3 MB", date: "Aug 20, 2026" }
    ],
    messages: [
      {
        id: "m-1001",
        sender: "contact",
        text: "I submitted my drawing assignment for the arts festival.",
        time: "Aug 20 04:00 PM"
      }
    ]
  }
];

export default function ChatPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string>("conv-1");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find((c) => c.id === selectedId) || conversations[0];

  // Auto scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  // Tab counts
  const countAll = 12;
  const countParent = 6;
  const countTeacher = 4;
  const countStudent = 2;

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (activeTab === "parent" && c.roleType !== "parent") return false;
    if (activeTab === "teacher" && c.roleType !== "teacher") return false;
    if (activeTab === "student" && c.roleType !== "student") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchTag = c.tag.toLowerCase().includes(q);
      const matchMsg = c.lastMessage.toLowerCase().includes(q);
      return matchName || matchTag || matchMsg;
    }
    return true;
  });

  // Handle Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsgText = inputText.trim();
    setInputText("");

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "me",
      text: newMsgText,
      time: timeStr,
      status: "read"
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedId) {
          return {
            ...c,
            lastMessage: newMsgText,
            time: timeStr,
            unreadCount: 0,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );

    // Optional sync to backend if user is authenticated
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        const apiBase = getApiBaseUrl();
        fetch(`${apiBase}/api/v1/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            conversationId: selectedId,
            message: newMsgText
          })
        }).catch(() => {});
      }
    } catch {
      // Offline fallback
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "call":
        toast.success(`Initiating voice call to ${activeConversation.phone}...`, {
          icon: "📞"
        });
        break;
      case "email":
        window.open(`mailto:${activeConversation.email}?subject=GGPS School Update`);
        break;
      case "meeting":
        toast.success(`Opening meeting schedule invite with ${activeConversation.name}...`, {
          icon: "📅"
        });
        break;
      case "note":
        setNoteModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleDownloadDoc = (docName: string) => {
    toast.success(`Downloading ${docName}...`, { icon: "📥" });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1720px] mx-auto space-y-4 select-none">
      {/* ==================================================== */}
      {/* 1. TOP HEADER TITLE & SUBTITLE */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3.5">
          {/* Blue Chat Bubble Icon with 3 white dots */}
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#00102E] border border-blue-200/90 dark:border-blue-900/60 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] shadow-2xs shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#0050CB] dark:text-[#38BDF8]"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              <circle cx="8" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="16" cy="12" r="1" fill="currentColor" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
              Messages
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Stay connected with parents, teachers and students
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. FILTER TABS (All Messages, Parent, Teacher, Student) */}
      {/* ==================================================== */}
      <div className="border-b border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
          {/* TAB 1: ALL MESSAGES */}
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`relative py-3 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === "all"
                ? "text-[#0050CB] dark:text-[#38BDF8]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            }`}
          >
            <span>All Messages</span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full transition-colors ${
                activeTab === "all"
                  ? "bg-[#0050CB] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {countAll}
            </span>
            {activeTab === "all" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0050CB] dark:bg-[#38BDF8] rounded-full" />
            )}
          </button>

          {/* TAB 2: PARENT MESSAGES */}
          <button
            type="button"
            onClick={() => setActiveTab("parent")}
            className={`relative py-3 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === "parent"
                ? "text-[#0050CB] dark:text-[#38BDF8]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            }`}
          >
            <span>Parent Messages</span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full transition-colors ${
                activeTab === "parent"
                  ? "bg-[#0050CB] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {countParent}
            </span>
            {activeTab === "parent" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0050CB] dark:bg-[#38BDF8] rounded-full" />
            )}
          </button>

          {/* TAB 3: TEACHER MESSAGES */}
          <button
            type="button"
            onClick={() => setActiveTab("teacher")}
            className={`relative py-3 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === "teacher"
                ? "text-[#0050CB] dark:text-[#38BDF8]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            }`}
          >
            <span>Teacher Messages</span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full transition-colors ${
                activeTab === "teacher"
                  ? "bg-[#0050CB] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {countTeacher}
            </span>
            {activeTab === "teacher" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0050CB] dark:bg-[#38BDF8] rounded-full" />
            )}
          </button>

          {/* TAB 4: STUDENT MESSAGES */}
          <button
            type="button"
            onClick={() => setActiveTab("student")}
            className={`relative py-3 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === "student"
                ? "text-[#0050CB] dark:text-[#38BDF8]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            }`}
          >
            <span>Student Messages</span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full transition-colors ${
                activeTab === "student"
                  ? "bg-[#0050CB] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {countStudent}
            </span>
            {activeTab === "student" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0050CB] dark:bg-[#38BDF8] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. MAIN 3-COLUMN CHAT APPLICATION CONTAINER */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#000E28] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_4px_30px_rgba(0,14,40,0.04)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[720px] h-[calc(100vh-14rem)]">
        
        {/* ================================================== */}
        {/* COLUMN 1: CONVERSATION LIST (Left Panel) */}
        {/* ================================================== */}
        <div className="lg:col-span-4 xl:col-span-3 border-r border-slate-200/80 dark:border-slate-800 flex flex-col bg-white dark:bg-[#000E28] min-h-0">
          {/* Search Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/90 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, class or message..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-normal text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0050CB] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => toast("Advanced filters coming soon", { icon: "⚙️" })}
              className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Filter conversations"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Conversation Items List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedId;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`relative p-3 rounded-2xl flex items-start gap-3 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-[#EBF3FE] dark:bg-[#001E50] border border-blue-200/90 dark:border-blue-700/60 shadow-2xs"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent"
                  }`}
                >
                  {/* Contact Avatar */}
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700 ring-1 ring-slate-200 dark:ring-slate-700">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-full h-full object-cover"
                    />
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#000E28]" />
                    )}
                  </div>

                  {/* Middle: Name + Tag + Message Preview */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {conv.name}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                        {conv.time}
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-slate-400 truncate mb-1">
                      {conv.tag}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate font-normal">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="w-4.5 h-4.5 rounded-full bg-[#0050CB] text-white text-[10px] font-black flex items-center justify-center shadow-xs shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="text-center py-10 text-xs text-slate-400">
                No messages found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* COLUMN 2: ACTIVE CHAT THREAD (Center Canvas) */}
        {/* ================================================== */}
        <div className="lg:col-span-5 xl:col-span-6 flex flex-col bg-[#FAFCFF] dark:bg-[#000a1f] border-r border-slate-200/80 dark:border-slate-800 min-h-0">
          
          {/* Header of Active Chat */}
          <div className="h-18 px-5 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#000E28] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                <img
                  src={activeConversation.avatar}
                  alt={activeConversation.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {activeConversation.name}
                  </h3>
                  {activeConversation.online && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-medium text-slate-400 truncate">
                  {activeConversation.tag}
                </p>
              </div>
            </div>

            {/* Action Buttons on Right (Call, Video, More) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleQuickAction("call")}
                className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-[#0050CB] dark:text-[#38BDF8] border border-slate-200/80 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => toast.success(`Starting video call with ${activeConversation.name}...`, { icon: "📹" })}
                className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-[#0050CB] dark:text-[#38BDF8] border border-slate-200/80 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => toast("Conversation options", { icon: "⚙️" })}
                className="w-9 h-9 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                title="More Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
            {/* Date Separator Pill */}
            <div className="flex items-center justify-center my-2">
              <span className="px-3.5 py-1 rounded-full bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-medium text-slate-500 dark:text-slate-400 shadow-2xs">
                Today, Sep 28, 2026
              </span>
            </div>

            {/* Conversation Messages */}
            {activeConversation.messages.map((msg) => {
              const isMe = msg.sender === "me";
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-slate-200 mb-1 ring-1 ring-slate-200 dark:ring-slate-700">
                      <img
                        src={activeConversation.avatar}
                        alt={activeConversation.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className={`max-w-[82%] sm:max-w-[76%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                    {/* Bubble */}
                    <div
                      className={`rounded-2xl p-3.5 sm:p-4 text-xs sm:text-[13.5px] leading-relaxed shadow-2xs whitespace-pre-line ${
                        isMe
                          ? "bg-[#D9E8FF] dark:bg-[#0050CB]/25 border border-blue-200/80 dark:border-blue-800/40 text-[#002D7A] dark:text-blue-100 rounded-br-xs"
                          : "bg-white dark:bg-[#001438] border border-slate-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Timestamp & Status */}
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {msg.time}
                      </span>
                      {isMe && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#0050CB] dark:text-[#38BDF8]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 bg-white dark:bg-[#000E28] border-t border-slate-200/80 dark:border-slate-800 shrink-0">
            <form
              onSubmit={handleSendMessage}
              className="bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-2.5 space-y-2 focus-within:border-[#0050CB] dark:focus-within:border-[#0050CB] transition-colors"
            >
              {/* Attachment icons row */}
              <div className="flex items-center gap-3 px-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => toast.success("Attach file clicked", { icon: "📎" })}
                  className="hover:text-[#0050CB] dark:hover:text-[#38BDF8] transition-colors cursor-pointer"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toast.success("Attach image clicked", { icon: "🖼️" })}
                  className="hover:text-[#0050CB] dark:hover:text-[#38BDF8] transition-colors cursor-pointer"
                  title="Attach photo"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toast.success("Attach document clicked", { icon: "📄" })}
                  className="hover:text-[#0050CB] dark:hover:text-[#38BDF8] transition-colors cursor-pointer"
                  title="Attach document"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>

              {/* Text Input Row */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputText((prev) => prev + " 😊")}
                  className="text-slate-400 hover:text-amber-500 transition-colors p-1 cursor-pointer"
                  title="Insert emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-md shrink-0 ${
                    inputText.trim()
                      ? "bg-[#0050CB] hover:bg-[#0041A8] hover:scale-105 active:scale-95"
                      : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60"
                  }`}
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* ================================================== */}
        {/* COLUMN 3: DETAIL PANEL (Right Profile Panel) */}
        {/* ================================================== */}
        <div className="lg:col-span-3 xl:col-span-3 bg-white dark:bg-[#000E28] flex flex-col overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar min-h-0">
          
          {/* SECTION 1: PARENT / CONTACT INFORMATION */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase">
                {activeConversation.roleType === "parent"
                  ? "Parent Information"
                  : activeConversation.roleType === "teacher"
                  ? "Teacher Information"
                  : "Student Information"}
              </h3>
              <button
                type="button"
                onClick={() => toast(`Opening full profile for ${activeConversation.name}`, { icon: "👤" })}
                className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Avatar & Name */}
            <div className="flex items-center gap-3.5 mb-3.5">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-200 ring-2 ring-slate-100 dark:ring-slate-700 shrink-0">
                <img
                  src={activeConversation.avatar}
                  alt={activeConversation.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {activeConversation.name}
                  </h4>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-2.5 h-2.5" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Details List */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-[#0050CB] dark:text-[#38BDF8] shrink-0" />
                <span className="font-medium">{activeConversation.phone}</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-[#0050CB] dark:text-[#38BDF8] shrink-0" />
                <span className="font-medium truncate">{activeConversation.email}</span>
              </div>

              <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-[#0050CB] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{activeConversation.address}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: CHILD / CLASS INFORMATION */}
          {activeConversation.child && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase mb-3">
                Child Information
              </h3>

              <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-200 shrink-0 ring-1 ring-white dark:ring-slate-700">
                  <img
                    src={activeConversation.child.avatar}
                    alt={activeConversation.child.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {activeConversation.child.name}
                    </h5>
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] dark:text-[#38BDF8]">
                      <GraduationCap className="w-2.5 h-2.5" />
                      Student
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeConversation.child.grade}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeConversation.classesTaught && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase mb-3">
                Assigned Classes
              </h3>
              <div className="space-y-1.5">
                {activeConversation.classesTaught.map((cls, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {cls}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: QUICK ACTIONS (2x2 Buttons Grid) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase mb-3">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickAction("call")}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-[#0050CB] hover:bg-blue-50/50 dark:hover:bg-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#0050CB] dark:text-[#38BDF8]" />
                <span className="truncate">Call Parent</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction("email")}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-[#0050CB] hover:bg-blue-50/50 dark:hover:bg-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#0050CB] dark:text-[#38BDF8]" />
                <span className="truncate">Send Email</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction("meeting")}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-[#0050CB] hover:bg-blue-50/50 dark:hover:bg-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#0050CB] dark:text-[#38BDF8]" />
                <span className="truncate">Schedule Meeting</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction("note")}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-[#0050CB] hover:bg-blue-50/50 dark:hover:bg-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5 text-[#0050CB] dark:text-[#38BDF8]" />
                <span className="truncate">Add Note</span>
              </button>
            </div>
          </div>

          {/* SECTION 4: DOCUMENTS & ATTACHMENTS */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase">
                Documents & Attachments
              </h3>
              <button
                type="button"
                onClick={() => toast("Viewing all student documents", { icon: "📂" })}
                className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {activeConversation.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3 group hover:border-[#0050CB] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Red PDF Icon */}
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <h6 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {doc.name}
                      </h6>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {doc.size} • {doc.date}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadDoc(doc.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0050CB] dark:hover:text-[#38BDF8] hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                    title={`Download ${doc.name}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ==================================================== */}
      {/* 4. MODAL: ADD NOTE TO PARENT/STUDENT RECORD */}
      {/* ==================================================== */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#000E28] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                Add Note • {activeConversation.name}
              </h4>
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Attach an administrative remark or follow-up note to this contact record.
            </p>

            <textarea
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="e.g. Parent requested rescheduling of upcoming science assessment..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-[#0050CB] text-slate-900 dark:text-white"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!noteContent.trim()) return;
                  toast.success("Administrative note saved successfully!", { icon: "📝" });
                  setNoteContent("");
                  setNoteModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0050CB] hover:bg-[#0041A8] shadow-md cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
