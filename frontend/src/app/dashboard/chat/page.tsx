"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Plus,
  Megaphone,
  Briefcase,
  BookOpen,
  Award,
  Layers,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { getApiBaseUrl } from "@/lib/utils";

type FilterTab = "all" | "class_teacher" | "subject_faculty" | "coordinator";

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

interface StaffConversation {
  id: string;
  name: string;
  category: "class_teacher" | "subject_faculty" | "coordinator";
  tag: string;
  designation: string;
  department: string;
  employeeId: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
  phone: string;
  email: string;
  campusOffice: string;
  assignedClasses: string[];
  subjects: string[];
  documents: DocumentItem[];
  messages: Message[];
}

const INITIAL_STAFF_CONVERSATIONS: StaffConversation[] = [
  {
    id: "conv-1",
    name: "Sunita Reddy",
    category: "class_teacher",
    tag: "Class Teacher • Class 1-A",
    designation: "Primary Class Teacher & EVS Lead",
    department: "Primary Academic Wing",
    employeeId: "EMP-T-104",
    avatar: "/avatar-anjali.png",
    lastMessage: "Please find the lesson plan for this week uploaded to the portal.",
    time: "10:24 AM",
    unreadCount: 2,
    online: true,
    phone: "+91 94451 87654",
    email: "sunita.reddy@ggpsschool.com",
    campusOffice: "Primary Wing Staff Room, 1st Floor",
    assignedClasses: ["Class 1-A (Class Teacher)", "Class 1-A (English)", "Class 1-A (EVS)"],
    subjects: ["English", "Environmental Studies"],
    documents: [
      { id: "doc-1", name: "Lesson_Plan_Week4_Class1A.pdf", size: "1.5 MB", date: "Sep 28, 2026" },
      { id: "doc-2", name: "Class1A_Attendance_Summary.pdf", size: "850 KB", date: "Sep 25, 2026" },
      { id: "doc-3", name: "Term1_EVS_Activity_Roster.pdf", size: "1.2 MB", date: "Sep 20, 2026" }
    ],
    messages: [
      {
        id: "m-101",
        sender: "contact",
        text: "Good morning! Please find the lesson plan for this week uploaded to the portal.",
        time: "09:30 AM"
      },
      {
        id: "m-102",
        sender: "me",
        text: "Thank you Sunita. Please ensure the activity worksheets for the upcoming science lab are printed before Thursday.",
        time: "09:45 AM",
        status: "read"
      },
      {
        id: "m-103",
        sender: "contact",
        text: "Certainly, all worksheets are finalized and prepared.",
        time: "10:24 AM"
      }
    ]
  },
  {
    id: "conv-2",
    name: "Vikram Singh",
    category: "subject_faculty",
    tag: "Maths & STEM Faculty • Class 2-B",
    designation: "Senior Mathematics & Robotics Lead",
    department: "STEM & Mathematics Department",
    employeeId: "EMP-T-118",
    avatar: "/teacher-ananya-roy.jpg",
    lastMessage: "The robotics activity kit requisitions have been submitted.",
    time: "09:45 AM",
    unreadCount: 0,
    online: true,
    phone: "+91 91760 34567",
    email: "vikram.singh@ggpsschool.com",
    campusOffice: "STEM Innovation Lab, 2nd Floor",
    assignedClasses: ["Class 2-B (Maths)", "Class 3-A (Robotics Lab)", "Class 4-B (Maths)"],
    subjects: ["Mathematics", "Robotics & Coding"],
    documents: [
      { id: "doc-4", name: "Science_Fair_Guidelines_2026.pdf", size: "2.8 MB", date: "Sep 26, 2026" },
      { id: "doc-5", name: "Robotics_Lab_Inventory.pdf", size: "1.1 MB", date: "Sep 22, 2026" }
    ],
    messages: [
      {
        id: "m-201",
        sender: "contact",
        text: "Good morning Sir, the robotics activity kit requisitions have been submitted for the upcoming inter-school science exhibition.",
        time: "09:40 AM"
      },
      {
        id: "m-202",
        sender: "me",
        text: "Received Vikram. The purchase approval will be cleared by the finance desk today.",
        time: "09:45 AM",
        status: "read"
      }
    ]
  },
  {
    id: "conv-3",
    name: "Anjali Nair",
    category: "coordinator",
    tag: "Academic Coordinator • Primary Wing",
    designation: "Academic Program Coordinator",
    department: "Curriculum & Academic Administration",
    employeeId: "EMP-C-021",
    avatar: "/avatar-priya.png",
    lastMessage: "Term 1 exam timetable draft submitted for review.",
    time: "Yesterday",
    unreadCount: 1,
    online: false,
    phone: "+91 98841 23450",
    email: "anjali.nair@ggpsschool.com",
    campusOffice: "Academic Council Office, Room 102",
    assignedClasses: ["Curriculum Oversight (Classes 1-5)", "Faculty Peer Evaluation"],
    subjects: ["Curriculum Framework", "Language Arts"],
    documents: [
      { id: "doc-6", name: "Term1_Exam_Timetable_Draft.pdf", size: "1.6 MB", date: "Sep 27, 2026" },
      { id: "doc-7", name: "Teacher_Workload_Distribution.pdf", size: "940 KB", date: "Sep 24, 2026" }
    ],
    messages: [
      {
        id: "m-301",
        sender: "contact",
        text: "Good afternoon. Term 1 examination timetable draft has been compiled following teacher inputs and submitted for your final approval.",
        time: "Yesterday 03:15 PM"
      }
    ]
  },
  {
    id: "conv-4",
    name: "Rajesh Kannan",
    category: "subject_faculty",
    tag: "Science Faculty • Science Lab In-Charge",
    designation: "Natural Sciences Faculty",
    department: "Science Department",
    employeeId: "EMP-T-109",
    avatar: "/avatar-rajesh.png",
    lastMessage: "Lab safety inventory check completed for this month.",
    time: "Yesterday",
    unreadCount: 0,
    online: false,
    phone: "+91 97890 56789",
    email: "rajesh.kannan@ggpsschool.com",
    campusOffice: "Science Laboratory Block A",
    assignedClasses: ["Class 3-A (Science)", "Class 3-B (Science)", "Class 4-A (EVS)"],
    subjects: ["General Science", "Environmental Studies"],
    documents: [
      { id: "doc-8", name: "Lab_Safety_Compliance_Q3.pdf", size: "1.4 MB", date: "Sep 26, 2026" },
      { id: "doc-9", name: "Science_Experiment_Syllabus.pdf", size: "2.1 MB", date: "Sep 15, 2026" }
    ],
    messages: [
      {
        id: "m-401",
        sender: "contact",
        text: "Lab safety inventory check completed for this month. All emergency eyewash and first aid kits are fully verified.",
        time: "Yesterday 04:30 PM"
      },
      {
        id: "m-402",
        sender: "me",
        text: "Well done Rajesh. Please submit the signed safety log to the administrative desk.",
        time: "Yesterday 04:45 PM",
        status: "read"
      }
    ]
  },
  {
    id: "conv-5",
    name: "Kavita Swaminathan",
    category: "coordinator",
    tag: "Head Coordinator • Kindergarten",
    designation: "Early Childhood Academic Head",
    department: "Pre-Primary Division",
    employeeId: "EMP-C-015",
    avatar: "/priya-sharma-avatar.jpg",
    lastMessage: "Open-House activity stations are scheduled for Saturday.",
    time: "Aug 27",
    unreadCount: 0,
    online: false,
    phone: "+91 98840 98765",
    email: "kavita.s@ggpsschool.com",
    campusOffice: "Kindergarten Block, Ground Floor",
    assignedClasses: ["Pre-KG & Kindergarten Academic Supervision", "Montessori Wing"],
    subjects: ["Early Learning", "Phonics & Motor Skills"],
    documents: [
      { id: "doc-10", name: "KG_Activity_Calendar_Oct.pdf", size: "1.8 MB", date: "Aug 27, 2026" },
      { id: "doc-11", name: "Phonics_Assessment_Framework.pdf", size: "1.3 MB", date: "Aug 20, 2026" }
    ],
    messages: [
      {
        id: "m-501",
        sender: "contact",
        text: "Good morning Sir, Open-House activity stations are scheduled for Saturday. All 4 preschool learning zones are ready.",
        time: "Aug 27 11:15 AM"
      }
    ]
  },
  {
    id: "conv-6",
    name: "Deepak Chawla",
    category: "subject_faculty",
    tag: "Sports Lead • Physical Education",
    designation: "Head of Physical Education & Athletics",
    department: "Physical Education & Sports",
    employeeId: "EMP-T-132",
    avatar: "/rohit-verma-avatar.jpg",
    lastMessage: "Annual Sports Meet track event schedule is finalized.",
    time: "Aug 26",
    unreadCount: 0,
    online: true,
    phone: "+91 98410 87654",
    email: "deepak.chawla@ggpsschool.com",
    campusOffice: "Sports Complex & Ground Pavilion",
    assignedClasses: ["Primary Physical Education (Grades 1-5)", "Morning Athletics Squad"],
    subjects: ["Physical Training", "Athletics & Track"],
    documents: [
      { id: "doc-12", name: "Annual_Sports_Meet_Schedule.pdf", size: "2.5 MB", date: "Aug 25, 2026" },
      { id: "doc-13", name: "First_Aid_Action_Plan.pdf", size: "890 KB", date: "Aug 20, 2026" }
    ],
    messages: [
      {
        id: "m-601",
        sender: "contact",
        text: "Annual Sports Meet track event schedule is finalized. The ground markings will be completed by Friday afternoon.",
        time: "Aug 26 02:40 PM"
      }
    ]
  },
  {
    id: "conv-7",
    name: "Meenakshi Sundaram",
    category: "subject_faculty",
    tag: "Creative Arts Lead • Fine Arts",
    designation: "Visual Arts & Cultural Coordinator",
    department: "Creative Arts & Performing Wings",
    employeeId: "EMP-T-125",
    avatar: "/avatar-anjali.png",
    lastMessage: "Art competition selections have been compiled.",
    time: "Aug 25",
    unreadCount: 0,
    online: false,
    phone: "+91 99400 34567",
    email: "meenakshi.s@ggpsschool.com",
    campusOffice: "Fine Arts Studio, 3rd Floor",
    assignedClasses: ["Classes 1-5 (Visual Arts)", "Creative Expression Club"],
    subjects: ["Drawing & Sketching", "Craft & Clay Modeling"],
    documents: [
      { id: "doc-14", name: "Art_Exhibition_Budget_2026.pdf", size: "1.2 MB", date: "Aug 24, 2026" },
      { id: "doc-15", name: "InterSchool_Art_Contest_Roster.pdf", size: "780 KB", date: "Aug 18, 2026" }
    ],
    messages: [
      {
        id: "m-701",
        sender: "contact",
        text: "The student artwork selections for the state level drawing competition have been finalized.",
        time: "Aug 25 05:10 PM"
      }
    ]
  },
  {
    id: "conv-8",
    name: "Shalini Joshi",
    category: "class_teacher",
    tag: "Class Teacher • Class 2-A",
    designation: "Class Teacher & Language Educator",
    department: "Primary Academic Wing",
    employeeId: "EMP-T-112",
    avatar: "/avatar-priya.png",
    lastMessage: "Grade 2 reading assessment marks updated.",
    time: "Aug 24",
    unreadCount: 0,
    online: false,
    phone: "+91 98410 12345",
    email: "shalini.joshi@ggpsschool.com",
    campusOffice: "Primary Wing Staff Room, 1st Floor",
    assignedClasses: ["Class 2-A (Class Teacher)", "Class 2-A (Hindi)", "Class 2-B (Hindi)"],
    subjects: ["Hindi Literature", "Language Fluency"],
    documents: [
      { id: "doc-16", name: "Class2A_Reading_Progress.pdf", size: "950 KB", date: "Aug 24, 2026" },
      { id: "doc-17", name: "Language_Curriculum_Week4.pdf", size: "1.4 MB", date: "Aug 19, 2026" }
    ],
    messages: [
      {
        id: "m-801",
        sender: "contact",
        text: "Good morning Sir, Grade 2 reading assessment marks have been updated on the teacher workspace.",
        time: "Aug 24 10:05 AM"
      }
    ]
  }
];

export default function ChatPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<StaffConversation[]>(INITIAL_STAFF_CONVERSATIONS);
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
  const countAll = conversations.length;
  const countClassTeachers = conversations.filter((c) => c.category === "class_teacher").length;
  const countSubjectFaculty = conversations.filter((c) => c.category === "subject_faculty").length;
  const countCoordinators = conversations.filter((c) => c.category === "coordinator").length;

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (activeTab === "class_teacher" && c.category !== "class_teacher") return false;
    if (activeTab === "subject_faculty" && c.category !== "subject_faculty") return false;
    if (activeTab === "coordinator" && c.category !== "coordinator") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchTag = c.tag.toLowerCase().includes(q);
      const matchDept = c.department.toLowerCase().includes(q);
      const matchMsg = c.lastMessage.toLowerCase().includes(q);
      return matchName || matchTag || matchDept || matchMsg;
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
        toast.success(`Initiating internal voice call to ${activeConversation.name} (${activeConversation.phone})...`, {
          icon: "📞"
        });
        break;
      case "email":
        window.open(`mailto:${activeConversation.email}?subject=GGPS Academic Administration`);
        break;
      case "meeting":
        toast.success(`Scheduling faculty coordination meeting with ${activeConversation.name}...`, {
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
      {/* 1. TOP HEADER TITLE & ACTION BUTTON */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3.5">
          {/* Blue Chat Bubble Icon */}
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
              Staff & Faculty Messages
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Internal direct messaging with teachers, coordinators, and school staff
            </p>
          </div>
        </div>

        {/* Quick Link to Circulars & Notices for Parents */}
        <Link
          href="/dashboard/circulars"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Megaphone className="w-4 h-4" />
          <span>Publish Parent Circular / Notice</span>
        </Link>
      </div>

      {/* ==================================================== */}
      {/* 2. POLICY NOTICE BANNER */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#E5EEFF] dark:bg-[#001B48]/50 border border-blue-200/80 dark:border-blue-900/50 text-[#000E28] dark:text-blue-100 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#0050CB] shrink-0" />
          <p className="font-medium">
            <strong className="font-bold text-[#0050CB] dark:text-[#38BDF8]">School Policy:</strong> Direct 1-on-1 messaging is reserved exclusively for internal teachers and staff. To send announcements, alerts, or notices to parents and students, broadcast an official circular.
          </p>
        </div>
        <Link
          href="/dashboard/circulars"
          className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Go to Circulars & Notices</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ==================================================== */}
      {/* 3. FILTER TABS (All Staff, Class Teachers, Subject Faculty, Coordinators) */}
      {/* ==================================================== */}
      <div className="border-b border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
          {/* TAB 1: ALL STAFF */}
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`relative py-3 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === "all"
                ? "text-[#0050CB] dark:text-[#38BDF8]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            }`}
          >
            <span>All Staff</span>
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

          {/* TAB 2: CLASS TEACHERS */}
          <button
            type="button"
            onClick={() => setActiveTab("class_teacher")}
            className={`relative py-3 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === "class_teacher"
                ? "text-[#0050CB] dark:text-[#38BDF8]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            }`}
          >
            <span>Class Teachers</span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full transition-colors ${
                activeTab === "class_teacher"
                  ? "bg-[#0050CB] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {countClassTeachers}
            </span>
            {activeTab === "class_teacher" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0050CB] dark:bg-[#38BDF8] rounded-full" />
            )}
          </button>

          {/* TAB 3: SUBJECT FACULTY */}
          <button
            type="button"
            onClick={() => setActiveTab("subject_faculty")}
            className={`relative py-3 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === "subject_faculty"
                ? "text-[#0050CB] dark:text-[#38BDF8]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            }`}
          >
            <span>Subject Faculty</span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full transition-colors ${
                activeTab === "subject_faculty"
                  ? "bg-[#0050CB] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {countSubjectFaculty}
            </span>
            {activeTab === "subject_faculty" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0050CB] dark:bg-[#38BDF8] rounded-full" />
            )}
          </button>

          {/* TAB 4: ACADEMIC COORDINATORS */}
          <button
            type="button"
            onClick={() => setActiveTab("coordinator")}
            className={`relative py-3 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === "coordinator"
                ? "text-[#0050CB] dark:text-[#38BDF8]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            }`}
          >
            <span>Academic Coordinators</span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full transition-colors ${
                activeTab === "coordinator"
                  ? "bg-[#0050CB] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {countCoordinators}
            </span>
            {activeTab === "coordinator" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0050CB] dark:bg-[#38BDF8] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 4. MAIN 3-COLUMN CHAT APPLICATION CONTAINER */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#000E28] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_4px_30px_rgba(0,14,40,0.04)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[720px] h-[calc(100vh-16rem)]">
        
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
                placeholder="Search staff, department or message..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-normal text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0050CB] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => toast("Advanced filters coming soon", { icon: "⚙️" })}
              className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Filter staff conversations"
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
                No staff messages found matching &quot;{searchQuery}&quot;
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
                  {activeConversation.tag} • {activeConversation.department}
                </p>
              </div>
            </div>

            {/* Action Buttons on Right (Call, Video, More) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleQuickAction("call")}
                className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-[#0050CB] dark:text-[#38BDF8] border border-slate-200/80 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                title="Internal Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => toast.success(`Starting staff video conference with ${activeConversation.name}...`, { icon: "📹" })}
                className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-[#0050CB] dark:text-[#38BDF8] border border-slate-200/80 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                title="Staff Video Call"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => toast("Staff communication options", { icon: "⚙️" })}
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
              {/* Text Input Row */}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Write message to ${activeConversation.name}...`}
                  className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Bottom Row of Input Bar: Action Icons + Send Button */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 sm:gap-2 text-slate-400">
                  <button
                    type="button"
                    onClick={() => toast("Document upload active", { icon: "📎" })}
                    className="p-1.5 hover:text-[#0050CB] dark:hover:text-[#38BDF8] hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Attach File"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toast("Image upload active", { icon: "🖼️" })}
                    className="p-1.5 hover:text-[#0050CB] dark:hover:text-[#38BDF8] hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Attach Image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toast("Staff document shared", { icon: "📄" })}
                    className="p-1.5 hover:text-[#0050CB] dark:hover:text-[#38BDF8] hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Share Staff Document"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toast("Emoji reactions active", { icon: "😊" })}
                    className="p-1.5 hover:text-[#0050CB] dark:hover:text-[#38BDF8] hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Insert Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>

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
        {/* COLUMN 3: DETAIL PANEL (Right Staff Profile Panel) */}
        {/* ================================================== */}
        <div className="lg:col-span-3 xl:col-span-3 bg-white dark:bg-[#000E28] flex flex-col overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar min-h-0">
          
          {/* SECTION 1: STAFF INFORMATION */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase">
                Staff Information
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
                <p className="text-[11px] font-semibold text-[#0050CB] dark:text-blue-400 mt-0.5">
                  ID: {activeConversation.employeeId}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  {activeConversation.designation}
                </p>
              </div>
            </div>

            {/* Contact Details List */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Briefcase className="w-3.5 h-3.5 text-[#0050CB] dark:text-[#38BDF8] shrink-0" />
                <span className="font-medium">{activeConversation.department}</span>
              </div>

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
                <span className="font-medium leading-relaxed">{activeConversation.campusOffice}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: ASSIGNED CLASSES & SUBJECTS */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase mb-3">
              Assigned Classes & Academic Roles
            </h3>
            <div className="space-y-1.5">
              {activeConversation.assignedClasses.map((cls, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  <BookOpen className="w-3 h-3 text-[#0050CB] dark:text-blue-400 shrink-0" />
                  <span>{cls}</span>
                </div>
              ))}
            </div>

            {/* Subjects Tags */}
            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Subjects / Specialization
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeConversation.subjects.map((sub, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-[#E5EEFF] dark:bg-[#002366]/50 text-[#0050CB] dark:text-blue-300 text-[11px] font-bold border border-blue-200/60 dark:border-blue-800/50"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: QUICK ACTIONS */}
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
                <span className="truncate">Call Staff</span>
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
                <span className="truncate">Add Staff Note</span>
              </button>
            </div>
          </div>

          {/* SECTION 4: DOCUMENTS & ATTACHMENTS */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase">
                Staff Files & Curriculum Plans
              </h3>
              <button
                type="button"
                onClick={() => toast("Viewing all faculty documents", { icon: "📂" })}
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
      {/* 5. MODAL: ADD STAFF NOTE */}
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
              Attach an internal administrative remark or follow-up note to this faculty record.
            </p>

            <textarea
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="e.g. Discussed upcoming curriculum review meeting for Thursday afternoon..."
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
                  toast.success("Staff administrative note saved successfully!", { icon: "📝" });
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
