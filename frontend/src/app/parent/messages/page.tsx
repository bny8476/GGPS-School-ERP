"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  MessageSquare, Bell, Sparkles, FolderDown, HelpCircle, 
  Search, SlidersHorizontal, Phone, Video, MoreHorizontal, 
  Paperclip, Smile, Mic, Send, FileText, Image as ImageIcon, 
  Film, Pin, Download, CheckCheck, ChevronRight, User, 
  Calendar, BookOpen, Clock, ShieldCheck, CheckCircle2, ChevronDown,
  X, Check, AlertCircle, PlusCircle, Volume2, Square
} from "lucide-react";
import toast from "react-hot-toast";
import { getSocket, joinRoom, leaveRoom } from "@/lib/socket";
import { getApiBaseUrl } from "@/lib/utils";
import { authFetch } from "@/lib/apiClient";
import { useParent } from "@/context/ParentContext";
import { useAuthStore } from "@/stores/authStore";

interface MessageAttachment {
  name: string;
  size: string;
  type: string;
  url?: string;
}

interface Message {
  id: string;
  sender: "teacher" | "parent";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read" | "sending";
  attachment?: MessageAttachment;
  studentId?: string;
  senderName?: string;
  clientTempId?: string;
}

interface ConversationItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isOnline?: boolean;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  category: "teachers" | "parents" | "admin";
  participantId?: string;
  student?: {
    _id: string;
    name: string;
    grade: string;
    section?: string;
    rollNumber?: string;
    studentPhoto?: string;
  };
}

interface ContactItem {
  _id: string;
  name: string;
  role: string;
  email: string;
  designation?: string;
  avatar?: string;
  student?: {
    _id: string;
    name: string;
    grade: string;
    rollNumber?: string;
    studentPhoto?: string;
  };
}

function formatServerMessage(m: any, currentUserId: string): Message {
  const senderId = m.sender?._id || m.sender;
  const isMe = String(senderId) === String(currentUserId);
  const isTeacher = (m.senderRole || m.sender?.role || "").toLowerCase() === "teacher";

  let attachmentObj: MessageAttachment | undefined = undefined;
  if (m.attachments && m.attachments.length > 0) {
    const att = m.attachments[0];
    if (typeof att === "string") {
      attachmentObj = {
        name: att.length > 40 ? "Document_Attachment.pdf" : att,
        size: "1.8 MB",
        type: att.includes("image") ? "IMAGE" : "PDF",
        url: att,
      };
    } else if (typeof att === "object" && att !== null) {
      attachmentObj = {
        name: att.name || "Attachment",
        size: att.size ? `${(att.size / 1024 / 1024).toFixed(1)} MB` : "1.5 MB",
        type: att.mimeType?.includes("image") ? "IMAGE" : "PDF",
        url: att.url,
      };
    }
  }

  const senderName = m.sender?.firstName 
    ? `${m.sender.firstName} ${m.sender.lastName || ""}`.trim()
    : (isTeacher ? "Class Teacher" : "Parent");

  return {
    id: m._id || m.clientTempId || `msg-${Date.now()}`,
    sender: isMe ? "parent" : "teacher",
    text: m.message || m.text || "",
    time: m.createdAt
      ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Just now",
    status: m.status || "sent",
    attachment: attachmentObj,
    studentId: m.studentId?._id || m.studentId,
    senderName,
    clientTempId: m.clientTempId,
  };
}

export default function ParentMessagesPage() {
  const { user } = useAuthStore();
  const { children, selectedChild, selectChild, refreshUnreadCounts } = useParent();

  const [activeTab, setActiveTab] = useState<"Messages" | "Announcements" | "Updates" | "Documents" | "FAQs">("Messages");
  const [activeSubFilter, setActiveSubFilter] = useState<"All" | "Teachers" | "Parents">("All");
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [messageInput, setMessageInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isTeacherTyping, setIsTeacherTyping] = useState<boolean>(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  // New Chat Modal & Contacts
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState<boolean>(false);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(false);

  // Attachment & Media
  const [selectedFile, setSelectedFile] = useState<{ file: File; base64: string; previewUrl: string } | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quick Emoji Bar & Voice Note Simulator
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Typing debounce timer
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentUserId = user?._id || user?.id || "";

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTeacherTyping]);

  // 1. Fetch Conversations from REST API
  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const token = localStorage.getItem("token");
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/v1/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: ConversationItem[] = json.data.map((c: any) => ({
            id: c._id,
            name: c.participant?.name || "Teacher",
            role: c.participant?.role === "Teacher" 
              ? (c.student ? `Class Teacher • ${c.student.grade}` : "Class Teacher") 
              : (c.participant?.role || "Faculty Staff"),
            avatar: c.participant?.avatar || "/teacher-ananya-roy.jpg",
            isOnline: true,
            lastMessage: c.lastMessage?.message || "No messages exchanged yet",
            time: c.lastMessage?.createdAt
              ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : (c.updatedAt ? new Date(c.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" }) : "New"),
            unreadCount: c.unreadCount || 0,
            category: (c.participant?.role?.toLowerCase() === "parent" ? "parents" : "teachers") as any,
            participantId: c.participant?._id,
            student: c.student,
          }));

          setConversations(mapped);

          // Select first conversation if none selected
          if (mapped.length > 0 && (!activeChatId || !mapped.some(m => m.id === activeChatId))) {
            setActiveChatId(mapped[0].id);
          }
        }
      }
    } catch (err) {
      console.warn("Conversations load notice:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [activeChatId]);

  // 2. Fetch Messages for Active Conversation
  const loadMessages = useCallback(async (convId: string) => {
    if (!convId) return;
    try {
      setIsLoadingMessages(true);
      const token = localStorage.getItem("token");
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/v1/messages?conversationId=${convId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMessages(json.data.map((m: any) => formatServerMessage(m, currentUserId)));

          // Mark messages as read on backend
          authFetch(`${apiBase}/api/v1/messages/read`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ conversationId: convId }),
          }).then(() => {
            refreshUnreadCounts();
            // Clear unread count on local conversation item
            setConversations(prev =>
              prev.map(c => (c.id === convId ? { ...c, unreadCount: 0 } : c))
            );
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn("Messages load notice:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentUserId, refreshUnreadCounts]);

  // 3. Load Contacts for New Chat
  const loadContacts = useCallback(async () => {
    try {
      setIsLoadingContacts(true);
      const token = localStorage.getItem("token");
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/v1/messages/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.contacts)) {
          setContacts(json.contacts);
        }
      }
    } catch (e) {
      console.warn("Contacts load notice:", e);
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 4. Socket.IO Real-Time Handling
  useEffect(() => {
    if (!activeChatId) return;

    loadMessages(activeChatId);

    const socket = getSocket();
    if (!socket) return;

    joinRoom(`conversation:${activeChatId}`);

    const handleNewMessage = (msg: any) => {
      const msgConvId = String(msg.conversationId || "");
      if (msgConvId === String(activeChatId)) {
        setMessages((prev) => {
          // Deduplicate if already present by _id or clientTempId
          const exists = prev.some(
            (m) => m.id === msg._id || (msg.clientTempId && (m.id === msg.clientTempId || m.clientTempId === msg.clientTempId))
          );
          if (exists) {
            return prev.map((m) =>
              (m.id === msg.clientTempId || m.id === msg._id || m.clientTempId === msg.clientTempId)
                ? formatServerMessage(msg, currentUserId)
                : m
            );
          }
          return [...prev, formatServerMessage(msg, currentUserId)];
        });

        // Update conversation lastMessage
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? {
                  ...c,
                  lastMessage: msg.message,
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  unreadCount: 0,
                }
              : c
          )
        );

        // Mark as read immediately since user is actively viewing
        const token = localStorage.getItem("token");
        const apiBase = getApiBaseUrl();
        authFetch(`${apiBase}/api/v1/messages/read`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ conversationId: activeChatId }),
        }).then(() => refreshUnreadCounts()).catch(() => {});
      } else {
        // Increment unread for background conversation
        setConversations((prev) =>
          prev.map((c) =>
            c.id === msgConvId
              ? {
                  ...c,
                  lastMessage: msg.message,
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  unreadCount: (c.unreadCount || 0) + 1,
                }
              : c
          )
        );
        refreshUnreadCounts();
      }
    };

    const handleTypingStart = (data: any) => {
      if (String(data?.conversationId) === String(activeChatId)) {
        setIsTeacherTyping(true);
      }
    };

    const handleTypingStop = (data: any) => {
      if (String(data?.conversationId) === String(activeChatId)) {
        setIsTeacherTyping(false);
      }
    };

    const handleMessageRead = (data: any) => {
      if (String(data?.conversationId) === String(activeChatId)) {
        setMessages((prev) =>
          prev.map((m) => (m.sender === "parent" ? { ...m, status: "read" } : m))
        );
      }
    };

    socket.on("chat:message:new", handleNewMessage);
    socket.on("message:new", handleNewMessage);
    socket.on("chat:typing:start", handleTypingStart);
    socket.on("typing:start", handleTypingStart);
    socket.on("chat:typing:stop", handleTypingStop);
    socket.on("typing:stop", handleTypingStop);
    socket.on("chat:message:read", handleMessageRead);

    return () => {
      leaveRoom(`conversation:${activeChatId}`);
      socket.off("chat:message:new", handleNewMessage);
      socket.off("message:new", handleNewMessage);
      socket.off("chat:typing:start", handleTypingStart);
      socket.off("typing:start", handleTypingStart);
      socket.off("chat:typing:stop", handleTypingStop);
      socket.off("typing:stop", handleTypingStop);
      socket.off("chat:message:read", handleMessageRead);
    };
  }, [activeChatId, currentUserId, loadMessages, refreshUnreadCounts]);

  // Input Typing Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    const socket = getSocket();
    if (socket && activeChatId) {
      socket.emit("chat:typing:start", { conversationId: activeChatId });
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socket.emit("chat:typing:stop", { conversationId: activeChatId });
      }, 2000);
    }
  };

  // Attachment File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size cannot exceed 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedFile({
        file,
        base64,
        previewUrl: URL.createObjectURL(file),
      });
      toast.success(`Attached ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Send Message Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = messageInput.trim();
    if (!textToSend && !selectedFile) return;

    const clientTempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: clientTempId,
      sender: "parent",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sending",
      attachment: selectedFile
        ? {
            name: selectedFile.file.name,
            size: `${(selectedFile.file.size / 1024 / 1024).toFixed(1)} MB`,
            type: selectedFile.file.type.includes("image") ? "IMAGE" : "PDF",
            url: selectedFile.previewUrl,
          }
        : undefined,
      clientTempId,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setMessageInput("");
    const filePayload = selectedFile ? {
      name: selectedFile.file.name,
      mimeType: selectedFile.file.type,
      size: selectedFile.file.size,
      url: selectedFile.base64,
    } : null;
    setSelectedFile(null);
    setShowEmojiPicker(false);

    // Stop typing indicator
    const socket = getSocket();
    if (socket && activeChatId) {
      socket.emit("chat:typing:stop", { conversationId: activeChatId });
    }

    try {
      const token = localStorage.getItem("token");
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: activeChatId,
          message: textToSend,
          attachments: filePayload ? [filePayload.url] : [],
          clientTempId,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMessages((prev) =>
          prev.map((m) => (m.clientTempId === clientTempId ? formatServerMessage(json.data, currentUserId) : m))
        );
      } else {
        toast.error("Failed to deliver message");
        setMessages((prev) =>
          prev.map((m) => (m.clientTempId === clientTempId ? { ...m, status: "sent" } : m))
        );
      }
    } catch (err) {
      console.error("Send message error:", err);
      toast.error("Network error sending message");
    }
  };

  // Start New Conversation with Contact
  const handleStartConversation = async (contact: ContactItem) => {
    try {
      const token = localStorage.getItem("token");
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/v1/messages/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: contact._id,
          studentId: selectedChild?._id,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setIsNewChatModalOpen(false);
        toast.success(`Chat opened with ${contact.name}`);
        await loadConversations();
        setActiveChatId(json.data._id);
      } else {
        toast.error(json.message || "Could not start chat");
      }
    } catch (e) {
      toast.error("Error creating conversation");
    }
  };

  // Audio Note Recording Simulator
  const toggleAudioRecording = () => {
    if (isRecordingAudio) {
      // Stop and send audio note
      clearInterval(recordingTimerRef.current as any);
      setIsRecordingAudio(false);
      setMessageInput(`🎙️ Voice Note (${recordingSeconds}s)`);
      setRecordingSeconds(0);
      toast.success("Voice note recorded! Press Send to dispatch.");
    } else {
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      toast("Recording audio note... Tap stop when finished.");
    }
  };

  const currentConversation = conversations.find((c) => c.id === activeChatId) || conversations[0];

  // Filter conversations by search and subfilter
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.student?.name && c.student.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeSubFilter === "Teachers") return c.category === "teachers";
    if (activeSubFilter === "Parents") return c.category === "parents";
    return true;
  });

  return (
    <div className="space-y-4 pb-12 max-w-[1440px] mx-auto font-sans text-slate-800 dark:text-slate-100">

      {/* ========================================================
          1. TOP HERO BANNER & SLOGAN
      ======================================================== */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#EFF6FF] via-[#E8F4FF] to-[#DDEEFF] dark:from-[#061530] dark:via-[#091D45] dark:to-[#0B2558] border border-blue-100/90 dark:border-white/10 p-5 sm:p-6 shadow-xs flex items-center justify-between min-h-[105px]">
        
        {/* Left Side: Icon + Heading + Subtitle */}
        <div className="relative z-10 flex items-center gap-4 max-w-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#0050CB] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <BookOpen className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
              Communication Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
              Real-time messaging between school staff and parents for authorized student care.
            </p>
          </div>
        </div>

        {/* Right Side: Child Profile Pill & Slogan */}
        <div className="relative z-10 hidden md:flex items-center gap-4">
          {/* Child badge */}
          {selectedChild && (
            <div className="bg-white/80 dark:bg-[#07142F]/80 backdrop-blur-md border border-slate-200/90 dark:border-white/10 rounded-2xl p-2 px-3 flex items-center gap-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 relative border border-slate-200">
                <Image
                  src={selectedChild.studentPhoto || "/aarav-profile-avatar.png"}
                  alt={selectedChild.firstName}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-[#000E28] dark:text-white leading-tight">
                  {selectedChild.firstName} {selectedChild.lastName}
                </p>
                <p className="text-[10px] font-semibold text-slate-400">
                  {selectedChild.grade} - {selectedChild.section || "Section A"}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              loadContacts();
              setIsNewChatModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

      </div>

      {/* ========================================================
          2. CATEGORY TABS (Messages, Announcements, Updates, Documents, FAQs)
      ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: "Messages", icon: MessageSquare, badge: null },
          { label: "Announcements", icon: Bell, badge: 3 },
          { label: "Updates", icon: Sparkles, badge: null },
          { label: "Documents", icon: FolderDown, badge: null },
          { label: "FAQs", icon: HelpCircle, badge: null },
        ].map((tab) => {
          const isActive = activeTab === tab.label;
          const Icon = tab.icon;

          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                isActive
                  ? "bg-[#0050CB] text-white shadow-xs"
                  : "bg-white dark:bg-[#07142F] text-slate-600 dark:text-slate-300 hover:text-[#0050CB] border border-slate-200/80 dark:border-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? "bg-white text-[#0050CB]" : "bg-rose-500 text-white"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          3. MAIN CHAT WORKSPACE (2-COLUMN LAYOUT)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* ========================================================
            LEFT COLUMN: CONVERSATION LIST (4 COLS)
        ======================================================== */}
        <div className="lg:col-span-4 bg-white dark:bg-[#07142F] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs p-4 space-y-3.5">
          
          {/* Header Row: Title & Action Button */}
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#000E28] dark:text-white flex items-center gap-2">
              <span>Chats & Conversations</span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {filteredConversations.length}
              </span>
            </h3>

            <button
              type="button"
              onClick={() => {
                loadContacts();
                setIsNewChatModalOpen(true);
              }}
              className="text-xs font-bold text-[#0050CB] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Message Teacher</span>
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations or student..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sub-Filter Pills (All, Teachers, Parents) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {(["All", "Teachers", "Parents"] as const).map((sub) => {
              const isSubActive = activeSubFilter === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setActiveSubFilter(sub)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold transition-all cursor-pointer shrink-0 ${
                    isSubActive
                      ? "bg-[#0050CB] text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50"
                  }`}
                >
                  <span>{sub}</span>
                </button>
              );
            })}
          </div>

          {/* Conversation List Items */}
          <div className="space-y-1.5 pt-1 max-h-[520px] overflow-y-auto scrollbar-thin">
            {isLoadingConversations ? (
              <div className="py-12 text-center text-xs text-slate-400 font-semibold space-y-2">
                <div className="w-6 h-6 border-2 border-[#0050CB] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading real-time chats...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 font-medium space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p>No active conversations yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    loadContacts();
                    setIsNewChatModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0050CB] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Start Chat with Teacher</span>
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeChatId === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveChatId(conv.id)}
                    className={`relative p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 group ${
                      isActive
                        ? "bg-[#EFF6FF] dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md bg-[#0050CB]" />
                    )}

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-blue-100 shadow-xs">
                        <Image
                          src={conv.avatar}
                          alt={conv.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </div>

                    {/* Name + Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-black text-[#000E28] dark:text-white truncate">
                          {conv.name}
                        </p>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          {conv.time}
                        </span>
                      </div>

                      {/* Student Context Badge */}
                      {conv.student && (
                        <span className="inline-block text-[9.5px] font-bold text-[#0050CB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded-md mt-0.5">
                          Child: {conv.student.name} ({conv.student.grade})
                        </span>
                      )}

                      <div className="flex items-center justify-between gap-1 mt-1">
                        <p className="text-[11px] text-slate-500 dark:text-slate-300 truncate font-medium">
                          {conv.lastMessage}
                        </p>
                        {conv.unreadCount && conv.unreadCount > 0 ? (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#0050CB] text-white text-[9px] font-black shrink-0">
                            {conv.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* ========================================================
            RIGHT COLUMN: ACTIVE CHAT SCREEN (8 COLS)
        ======================================================== */}
        <div className="lg:col-span-8 bg-white dark:bg-[#07142F] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden flex flex-col min-h-[580px]">
          
          {/* 1. Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
            
            {/* Left: Active Contact Profile */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-blue-100 shadow-xs shrink-0">
                <Image
                  src={currentConversation?.avatar || "/teacher-ananya-roy.jpg"}
                  alt={currentConversation?.name || "Faculty Staff"}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-[#000E28] dark:text-white truncate">
                    {currentConversation?.name || "Teacher Contact"}
                  </h4>
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Online</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span>{currentConversation?.role || "Class Teacher"}</span>
                  {currentConversation?.student && (
                    <>
                      <span>•</span>
                      <span className="text-[#0050CB] dark:text-blue-400 font-bold">
                        Student: {currentConversation.student.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toast.success("Voice calls are routed through the official school reception")}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-blue-50 hover:text-[#0050CB] transition-colors cursor-pointer"
                title="Reception Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => toast.success("Parent-Teacher Video Conference schedule available in Timetable")}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-blue-50 hover:text-[#0050CB] transition-colors cursor-pointer"
                title="Video Conference"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* 2. Messages Scroll Container */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[440px] bg-slate-50/20 dark:bg-transparent">
            {isLoadingMessages ? (
              <div className="py-20 text-center text-xs text-slate-400 font-semibold space-y-2">
                <div className="w-6 h-6 border-2 border-[#0050CB] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400 font-medium space-y-2">
                <p>No messages in this conversation yet.</p>
                <p className="text-[11px] text-slate-400">Say hello to start the discussion!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isTeacher = msg.sender === "teacher";

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isTeacher ? "justify-start" : "justify-end"}`}
                  >
                    {/* Teacher Avatar */}
                    {isTeacher && (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-blue-100 shrink-0 mt-1">
                        <Image
                          src={currentConversation?.avatar || "/teacher-ananya-roy.jpg"}
                          alt="Teacher"
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Bubble Container */}
                    <div className={`max-w-[78%] space-y-1 ${isTeacher ? "items-start" : "items-end"}`}>
                      
                      {/* Name & Time */}
                      <div className={`flex items-center gap-2 text-[10.5px] font-semibold text-slate-400 ${
                        isTeacher ? "" : "justify-end"
                      }`}>
                        {isTeacher && (
                          <span className="font-bold text-[#000E28] dark:text-white">
                            {msg.senderName || currentConversation?.name || "Teacher"}
                          </span>
                        )}
                        <span>{msg.time}</span>
                      </div>

                      {/* Message Bubble Surface */}
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 shadow-2xs ${
                          isTeacher
                            ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-sm"
                            : "bg-[#0050CB] text-white rounded-tr-sm"
                        }`}
                      >
                        {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}

                        {/* Optional Attachment File inside Bubble */}
                        {msg.attachment && (
                          <div
                            onClick={() => {
                              if (msg.attachment?.url) {
                                window.open(msg.attachment.url, "_blank");
                              } else {
                                toast.success(`Viewing ${msg.attachment?.name}`);
                              }
                            }}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                              isTeacher
                                ? "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-blue-300"
                                : "bg-white/10 border-white/20 hover:bg-white/20"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                isTeacher ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-white text-[#0050CB]"
                              }`}>
                                {msg.attachment.type || "FILE"}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-xs font-bold truncate ${isTeacher ? "text-[#000E28] dark:text-white" : "text-white"}`}>
                                  {msg.attachment.name}
                                </p>
                                <p className={`text-[10px] ${isTeacher ? "text-slate-400" : "text-blue-100"}`}>
                                  {msg.attachment.size} • Verified Attachment
                                </p>
                              </div>
                            </div>

                            <Download className={`w-4 h-4 shrink-0 ${isTeacher ? "text-slate-400" : "text-white"}`} />
                          </div>
                        )}
                      </div>

                      {/* Parent Read Receipt Status */}
                      {!isTeacher && (
                        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                          {msg.status === "sending" ? (
                            <Clock className="w-3 h-3 text-slate-400 animate-spin" />
                          ) : msg.status === "read" ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#0050CB] dark:text-blue-400" />
                          ) : msg.status === "delivered" ? (
                            <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Check className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      )}

                    </div>

                    {/* Parent Avatar */}
                    {!isTeacher && (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-blue-200 shrink-0 mt-1">
                        <Image
                          src={selectedChild?.studentPhoto || "/aarav-profile-avatar.png"}
                          alt="Parent"
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Real-Time Teacher Typing Indicator */}
            {isTeacherTyping && (
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-400 animate-in fade-in duration-200">
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-blue-100 shrink-0">
                  <Image
                    src={currentConversation?.avatar || "/teacher-ananya-roy.jpg"}
                    alt="Teacher"
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {currentConversation?.name || "Teacher"} is typing
                </span>
                <span className="flex items-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-[#0050CB] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 rounded-full bg-[#0050CB] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-1 rounded-full bg-[#0050CB] animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3. Attachment Preview Chip (If Selected) */}
          {selectedFile && (
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border-t border-blue-100 dark:border-blue-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0050CB] dark:text-blue-300">
                <Paperclip className="w-3.5 h-3.5" />
                <span className="truncate max-w-xs">{selectedFile.file.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  ({(selectedFile.file.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 4. Quick Emoji Picker Bar (If Open) */}
          {showEmojiPicker && (
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
              {["😊", "👍", "❤️", "🙏", "👏", "🎉", "📝", "🏫", "🌟", "📚"].map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setMessageInput((prev) => prev + " " + em)}
                  className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          )}

          {/* 5. Voice Recording Simulator Bar */}
          {isRecordingAudio && (
            <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>Recording voice note... {recordingSeconds}s</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearInterval(recordingTimerRef.current as any);
                    setIsRecordingAudio(false);
                    setRecordingSeconds(0);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={toggleAudioRecording}
                  className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}

          {/* 6. Main Chat Input Composer */}
          <div className="p-3 px-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#07142F]">
            
            {/* Hidden Native File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx,.txt"
              className="hidden"
            />

            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-[#0050CB] transition-colors cursor-pointer"
                title="Attach Document or Image"
              >
                <Paperclip className="w-4.5 h-4.5" />
              </button>

              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Type a private message to ${currentConversation?.name || "Teacher"}...`}
                className="flex-1 py-2 px-3 bg-transparent text-xs text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none"
              />

              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-1 transition-colors cursor-pointer ${showEmojiPicker ? "text-[#0050CB]" : "hover:text-[#0050CB]"}`}
                  title="Emoji"
                >
                  <Smile className="w-4.5 h-4.5" />
                </button>

                <button
                  type="button"
                  onClick={toggleAudioRecording}
                  className={`p-1 transition-colors cursor-pointer ${isRecordingAudio ? "text-rose-500" : "hover:text-[#0050CB]"}`}
                  title="Voice Note"
                >
                  <Mic className="w-4.5 h-4.5" />
                </button>

                <button
                  type="submit"
                  disabled={!messageInput.trim() && !selectedFile}
                  className="w-8 h-8 rounded-full bg-[#0050CB] hover:bg-[#0041A8] disabled:opacity-40 disabled:hover:scale-100 text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm shadow-blue-500/30 cursor-pointer"
                  title="Send Message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>

      {/* ========================================================
          4. NEW CHAT / TEACHER SELECTOR MODAL
      ======================================================== */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#07142F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-[#000E28] dark:text-white">
                  Message School Faculty
                </h3>
                <p className="text-xs text-slate-400">
                  Select your child&apos;s teacher to begin a conversation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Child Selector in Modal */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Communicating regarding child:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {children.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => selectChild(c._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                      selectedChild?._id === c._id
                        ? "bg-[#0050CB] text-white border-[#0050CB]"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span>{c.firstName} {c.lastName}</span>
                    <span className="text-[10px] opacity-75 font-normal">({c.grade})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Teachers List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pt-1">
              {isLoadingContacts ? (
                <div className="py-10 text-center text-xs text-slate-400">Loading authorized faculty...</div>
              ) : contacts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No faculty contacts available</div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact._id}
                    onClick={() => handleStartConversation(contact)}
                    className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-blue-100 relative shrink-0">
                        <Image
                          src={contact.avatar || "/teacher-ananya-roy.jpg"}
                          alt={contact.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#000E28] dark:text-white group-hover:text-[#0050CB] transition-colors">
                          {contact.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {contact.designation || "Class Teacher"} • {contact.email}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0050CB] group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
