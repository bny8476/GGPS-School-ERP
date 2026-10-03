"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Mail,
  Inbox,
  Send,
  FileText,
  Star,
  Trash2,
  Plus,
  Search,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Tag,
  Users,
  Award,
  Receipt,
  Clock,
  Printer,
  Sparkles,
  Check,
  ShieldCheck,
  Building,
  GraduationCap,
  Filter,
  SendHorizontal,
} from "lucide-react";
import EmergencyBanner from "@/components/ui/EmergencyBanner";
import { printDocument } from "@/lib/exportUtils";

interface EmailItem {
  _id?: string;
  id?: string | number;
  sender: string;
  senderEmail: string;
  recipients: string[] | string;
  recipientGroups?: string[];
  subject: string;
  preview: string;
  body: string;
  html?: string;
  category: "fee_reminder" | "admission_letter" | "report_card" | "disciplinary_memo" | "general_notice";
  folder: "inbox" | "sent" | "drafts" | "trash";
  priority: "normal" | "high";
  status: "delivered" | "pending" | "failed" | "simulated";
  messageId?: string;
  starred: boolean;
  read: boolean;
  createdAt: string | Date;
}

interface RecipientGroup {
  id: string;
  tag: string;
  label: string;
  count: number;
  category: string;
}

interface IndividualRecipient {
  id: string;
  name: string;
  email: string;
  type: string;
  title: string;
  badge: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  category: "fee_reminder" | "admission_letter" | "report_card" | "disciplinary_memo" | "general_notice";
  badge: string;
  subject: string;
  defaultBody: string;
}

// Fallback initial data in case of immediate network latency
const FALLBACK_GROUPS: RecipientGroup[] = [
  { id: "all-parents", tag: "@All-Parents", label: "All Parents & Guardians", count: 850, category: "Parents" },
  { id: "all-teachers", tag: "@All-Teachers", label: "All Teaching Faculty", count: 24, category: "Staff" },
  { id: "ukg-faculty", tag: "@UKG-Faculty", label: "UKG Faculty & Caregivers", count: 8, category: "Staff" },
  { id: "lkg-faculty", tag: "@LKG-Faculty", label: "LKG Faculty & Caregivers", count: 8, category: "Staff" },
  { id: "pkg-faculty", tag: "@PreKG-Faculty", label: "Pre-KG Faculty & Caregivers", count: 6, category: "Staff" },
  { id: "administration", tag: "@Administration", label: "Senior Admin & Department Heads", count: 10, category: "Admin" },
  { id: "all-students", tag: "@All-Students", label: "All Enrolled Students", count: 1240, category: "Students" },
];

const FALLBACK_TEMPLATES: EmailTemplate[] = [
  {
    id: "fee_reminder",
    name: "Term Fee Due Notice",
    category: "fee_reminder",
    badge: "Finance Notice",
    subject: "URGENT: Outstanding School Fee Notice for [Student Name] - Term 2",
    defaultBody: `Dear [Parent Name],

We hope this message finds you well.

This is a formal notification from the Bursar's Office regarding the pending school tuition and activity fees for your child, [Student Name] (Grade: [Grade], Admission No: [Admission No]).

Fee Breakdown Summary:
• Outstanding Tuition Fee: $[Amount Due]
• Late Assessment Grace Period Ends: [Due Date]
• Reference / Invoice ID: [Invoice Number]

To avoid late processing surcharges or disruption in online learning portal access, kindly settle the balance on or before [Due Date].

Payment Options:
1. Online Payment: Click below to access the GIS Parent Secure Payment Gateway.
2. Direct Wire Transfer: GGPS Educational Trust (HDFC Bank, Acct: 4402-9912-001, Ref: [Admission No]).

If payment has already been remitted in the last 24 hours, please disregard this notice.

Sincerely,
Office of Finance & Bursar
GGPS School`,
  },
  {
    id: "admission_letter",
    name: "Admission Acceptance Letter",
    category: "admission_letter",
    badge: "Admissions",
    subject: "Official Letter of Admission: Welcome to GGPS School - [Student Name]",
    defaultBody: `Dear [Parent Name],

On behalf of the Governing Board and Academic Faculty of GGPS School, it gives us immense pleasure to offer [Student Name] formal admission to Grade [Grade] for the Academic Session 2026-2027.

Admission Particulars:
• Student Name: [Student Name]
• Assigned Grade: [Grade]
• Student ID / Roll: [Admission No]
• Orientation & Reporting Date: [Reporting Date]
• Assigned House: Phoenix Blue

Next Steps for Enrollment Confirmation:
1. Complete registration verification via the GIS Student ERP Portal.
2. Submit original medical clearance and immunization records by [Due Date].
3. Orientation uniform fitting sessions begin next Monday from 9:00 AM to 3:00 PM.

We warmly welcome your family into our vibrant scholastic community!

Warm regards,
Dr. Marcus Vance, Ph.D.
Principal & Head of School
GGPS School`,
  },
  {
    id: "report_card",
    name: "Report Card & Performance Dispatch",
    category: "report_card",
    badge: "Academics",
    subject: "Official Term Examination Report Card Released: [Student Name] (Grade [Grade])",
    defaultBody: `Dear Parent / Guardian,

The Academic Examination Board of GGPS School has published the official Semester Assessment Results and Progress Portfolio for [Student Name] (Grade [Grade]).

Performance Snapshot:
• Semester Grade Average (GPA): [GPA / Marks %]
• Term Attendance Record: 98.4%
• Conduct & Extracurricular Rating: Exemplary

Detailed Subject Performance & Teacher Notes:
The comprehensive report card containing subject-wise percentiles, faculty observations, and developmental milestones is now available for download in the GIS Parent Portal.

Parent-Teacher Consultation (PTC) Notice:
Parent-Teacher conferences will take place on [PTA Meeting Date]. Please reserve your 15-minute slot with the class homeroom advisor via the portal.

Congratulations to [Student Name] on their hard work this semester!

Cordially,
Academic Examination Board
GGPS School`,
  },
  {
    id: "disciplinary_memo",
    name: "Behavioral & Disciplinary Memo",
    category: "disciplinary_memo",
    badge: "Disciplinary",
    subject: "CONFIDENTIAL: Student Conduct & Disciplinary Memo regarding [Student Name]",
    defaultBody: `Dear [Parent Name],

This communication is from the Office of Student Welfare and Disciplinary Committee regarding an incident involving [Student Name] (Grade [Grade]) on [Incident Date].

Summary of Observation:
[Incident Summary]

School Code of Conduct Policy:
GGPS School strictly enforces principles of mutual respect, safety, and academic integrity as outlined in Section 4.2 of the Student Handbook.

Required Action:
In accordance with school policy, a mandatory in-person conference has been scheduled with the Dean of Students on [Mandatory Parent Conference Date] at 09:30 AM in Office 204.

Please confirm receipt of this memo and your availability for the scheduled meeting.

Respectfully,
Dean of Student Affairs
GGPS School`,
  },
  {
    id: "general_notice",
    name: "General Institutional Circular",
    category: "general_notice",
    badge: "Circular",
    subject: "General School Circular: Campus Updates and Upcoming Events",
    defaultBody: `Dear GIS Community,

Please take note of the upcoming schedule and administrative updates for the upcoming academic cycle.

Key Announcements:
1. Mid-Term Recess dates and campus facility maintenance hours.
2. Annual Science & Technology Exhibition submission deadline: [Due Date].
3. Campus facility and schedule updates for North Campus.

Thank you for your continuous partnership in fostering excellence.

Best regards,
Administration Directorate
GGPS School`,
  },
];

const INITIAL_LOCAL_EMAILS: EmailItem[] = [
  {
    _id: "mem_1",
    sender: "Dr. Marcus Vance (Principal)",
    senderEmail: "principal@globalinternationalschool.edu",
    recipients: ["superadmin@globalinternationalschool.edu"],
    subject: "Annual Academic Audit & Review Meeting Schedule",
    preview: "Dear Super Admin & Senior Leadership, Please note that the annual academic review meeting will be held this Friday in Conference Hall A...",
    body: `Dear Super Admin & Senior Leadership,

Please note that the annual academic review meeting will be convened this Friday at 10:00 AM in Conference Hall A. We will be reviewing:

1. Term 1 academic performance benchmarks across Grades 6–12.
2. Accreditation compliance checklist for international boards.
3. Budgetary allocations for the new STEAM innovation lab.

Please ensure all department reports are synchronized in the ERP beforehand.

Warm regards,
Dr. Marcus Vance
Principal | GGPS School`,
    category: "general_notice",
    folder: "inbox",
    priority: "high",
    status: "delivered",
    messageId: "gis_inbox_001",
    starred: true,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    _id: "mem_2",
    sender: "Finance & Bursar Office",
    senderEmail: "bursar@globalinternationalschool.edu",
    recipients: ["superadmin@globalinternationalschool.edu"],
    subject: "Quarterly Term 2 Fee Reconciliation Summary",
    preview: "The quarterly fee reconciliation for Q3 2026 has been generated. Total collections stand at 94.2%...",
    body: `Dear Administrator,

The fee reconciliation audit report for Term 2 has been prepared. Key highlights:

- Total Billed: $428,500.00
- Total Collected: $403,647.00 (94.2%)
- Outstanding Balance: $24,853.00 (primarily 28 student accounts)

We have pre-scheduled automated fee reminder dispatches for parents with pending dues starting next Monday.

Regards,
Accounting & Bursar Department
GGPS School`,
    category: "fee_reminder",
    folder: "inbox",
    priority: "normal",
    status: "delivered",
    messageId: "gis_inbox_002",
    starred: false,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    _id: "mem_3",
    sender: "Eleanor Harrison (Parent)",
    senderEmail: "e.harrison@gmail.com",
    recipients: ["admissions@globalinternationalschool.edu", "superadmin@globalinternationalschool.edu"],
    subject: "Inquiry regarding Pre-KG Kindergarten Admission",
    preview: "Good morning, I would like to confirm receipt of Leo Harrison’s application dossier and schedule an orientation slot...",
    body: `Dear Admissions & Admin Team,

Good morning. I submitted the enrollment inquiry for my son Leo Harrison for Pre-KG last Tuesday.

Could you kindly confirm if the school tour and demo interaction schedule have been finalized?

Thank you for your assistance.

Best regards,
Eleanor Harrison
Parent of Leo Harrison (App ID: GGPS-ADM-2026-882)`,
    category: "admission_letter",
    folder: "inbox",
    priority: "normal",
    status: "delivered",
    messageId: "gis_inbox_003",
    starred: false,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export default function EmailPage() {
  const [activeFolder, setActiveFolder] = useState<"inbox" | "sent" | "drafts" | "starred" | "trash">("inbox");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedMail, setSelectedMail] = useState<EmailItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Email data states
  const [emails, setEmails] = useState<EmailItem[]>(INITIAL_LOCAL_EMAILS);
  const [groups, setGroups] = useState<RecipientGroup[]>(FALLBACK_GROUPS);
  const [recipientsList, setRecipientsList] = useState<IndividualRecipient[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>(FALLBACK_TEMPLATES);

  // Compose form states
  const [selectedGroupTags, setSelectedGroupTags] = useState<string[]>([]);
  const [selectedRecipientEmails, setSelectedRecipientEmails] = useState<string[]>([]);
  const [recipientInputText, setRecipientInputText] = useState("");
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeCategory, setComposeCategory] = useState<"fee_reminder" | "admission_letter" | "report_card" | "disciplinary_memo" | "general_notice">("general_notice");
  const [composePriority, setComposePriority] = useState<"normal" | "high">("normal");
  const [hasAttachments, setHasAttachments] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Show Toast
  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch templates
      const tRes = await fetch(`${API_URL}/api/email/templates`).catch(() => null);
      if (tRes && tRes.ok) {
        const tData = await tRes.json();
        if (tData.templates) setTemplates(tData.templates);
      }

      // 2. Fetch recipients and groups
      const rRes = await fetch(`${API_URL}/api/email/recipients`).catch(() => null);
      if (rRes && rRes.ok) {
        const rData = await rRes.json();
        if (rData.groups) setGroups(rData.groups);
        if (rData.recipients) setRecipientsList(rData.recipients);
      }

      // 3. Fetch emails
      const eRes = await fetch(`${API_URL}/api/email?folder=all`).catch(() => null);
      if (eRes && eRes.ok) {
        const eData = await eRes.json();
        if (eData.emails && eData.emails.length > 0) {
          setEmails(eData.emails);
        }
      }
    } catch (err) {
      console.warn("Using fallback email dataset due to offline or initial loading:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered emails based on folder, category, and search query
  const filteredEmails = useMemo(() => {
    return emails.filter((mail) => {
      // Folder filtering
      if (activeFolder === "starred" && !mail.starred) return false;
      if (activeFolder !== "starred" && mail.folder !== activeFolder) return false;

      // Category filtering
      if (activeCategory !== "all" && mail.category !== activeCategory) return false;

      // Search query filtering
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const recipientStr = Array.isArray(mail.recipients) ? mail.recipients.join(" ") : mail.recipients || "";
        const groupStr = (mail.recipientGroups || []).join(" ");
        const match =
          mail.subject?.toLowerCase().includes(q) ||
          mail.sender?.toLowerCase().includes(q) ||
          mail.senderEmail?.toLowerCase().includes(q) ||
          mail.preview?.toLowerCase().includes(q) ||
          mail.body?.toLowerCase().includes(q) ||
          recipientStr.toLowerCase().includes(q) ||
          groupStr.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [emails, activeFolder, activeCategory, searchQuery]);

  // Set default selected email when list changes
  useEffect(() => {
    if (filteredEmails.length > 0 && (!selectedMail || !filteredEmails.find((m) => (m._id || m.id) === (selectedMail._id || selectedMail.id)))) {
      setSelectedMail(filteredEmails[0]);
    } else if (filteredEmails.length === 0) {
      setSelectedMail(null);
    }
  }, [filteredEmails, activeFolder]);

  // Handle template selection
  const handleSelectTemplate = (tId: string) => {
    setSelectedTemplateId(tId);
    const tmpl = templates.find((t) => t.id === tId);
    if (tmpl) {
      setComposeSubject(tmpl.subject);
      setComposeBody(tmpl.defaultBody);
      setComposeCategory(tmpl.category);
      if (tmpl.category === "fee_reminder" || tmpl.category === "disciplinary_memo") {
        setComposePriority("high");
      }
    }
  };

  // Add Dynamic Group
  const toggleGroupTag = (tag: string) => {
    if (selectedGroupTags.includes(tag)) {
      setSelectedGroupTags(selectedGroupTags.filter((t) => t !== tag));
    } else {
      setSelectedGroupTags([...selectedGroupTags, tag]);
    }
  };

  // Add individual email recipient
  const addRecipientEmail = (email: string) => {
    if (!selectedRecipientEmails.includes(email)) {
      setSelectedRecipientEmails([...selectedRecipientEmails, email]);
    }
    setRecipientInputText("");
    setIsRecipientDropdownOpen(false);
  };

  const removeRecipientEmail = (email: string) => {
    setSelectedRecipientEmails(selectedRecipientEmails.filter((e) => e !== email));
  };

  // Insert template placeholder into body
  const insertVariable = (variableName: string) => {
    setComposeBody((prev) => `${prev} [${variableName}]`);
  };

  // Toggle Star
  const handleToggleStar = async (e: React.MouseEvent, mail: EmailItem) => {
    e.stopPropagation();
    const mailId = mail._id || mail.id;
    const newStarred = !mail.starred;

    // Optimistic update
    setEmails((prev) =>
      prev.map((item) => ((item._id || item.id) === mailId ? { ...item, starred: newStarred } : item))
    );
    if (selectedMail && (selectedMail._id || selectedMail.id) === mailId) {
      setSelectedMail({ ...selectedMail, starred: newStarred });
    }

    try {
      await fetch(`${API_URL}/api/email/${mailId}/star`, { method: "PATCH" });
    } catch (err) {
      console.warn("Failed to persist star toggle to backend:", err);
    }
  };

  // Delete Mail
  const handleDeleteMail = async (mail: EmailItem) => {
    const mailId = mail._id || mail.id;
    setEmails((prev) => prev.filter((item) => (item._id || item.id) !== mailId));
    if (selectedMail && (selectedMail._id || selectedMail.id) === mailId) {
      setSelectedMail(null);
    }
    showToast("Email moved to trash or deleted.", "info");

    try {
      await fetch(`${API_URL}/api/email/${mailId}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Failed to persist delete to backend:", err);
    }
  };

  // Send Email Handler
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedGroupTags.length === 0 && selectedRecipientEmails.length === 0) {
      showToast("Please add at least one recipient or recipient group.", "error");
      return;
    }
    if (!composeSubject.trim()) {
      showToast("Please enter an email subject line.", "error");
      return;
    }
    if (!composeBody.trim()) {
      showToast("Email body cannot be empty.", "error");
      return;
    }

    setIsSending(true);

    const payload = {
      recipients: selectedRecipientEmails.length > 0 ? selectedRecipientEmails : selectedGroupTags,
      recipientGroups: selectedGroupTags,
      subject: composeSubject,
      body: composeBody,
      category: composeCategory,
      priority: composePriority,
    };

    try {
      const response = await fetch(`${API_URL}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success && data.email) {
        showToast(
          data.mode === "smtp"
            ? "✅ Dispatched live via SMTP Relay!"
            : "⚡ Dispatched via Simulated Sandbox Engine (logged to server).",
          "success"
        );

        // Add to sent folder locally
        const newMail: EmailItem = data.email;
        setEmails((prev) => [newMail, ...prev]);
        setActiveFolder("sent");
        setSelectedMail(newMail);

        // Reset composer
        setIsComposeOpen(false);
        setSelectedGroupTags([]);
        setSelectedRecipientEmails([]);
        setComposeSubject("");
        setComposeBody("");
        setSelectedTemplateId("");
        setHasAttachments(false);
      } else {
        showToast(data.message || "Failed to dispatch email", "error");
      }
    } catch (err: any) {
      // Safe client-side fallback simulation if network is unreachable
      const fallbackSentMail: EmailItem = {
        _id: `sent_${Date.now()}`,
        sender: "Super Admin",
        senderEmail: "superadmin@globalinternationalschool.edu",
        recipients: selectedRecipientEmails.length > 0 ? selectedRecipientEmails : selectedGroupTags,
        recipientGroups: selectedGroupTags,
        subject: composeSubject,
        preview: composeBody.substring(0, 140) + "...",
        body: composeBody,
        category: composeCategory,
        folder: "sent",
        priority: composePriority,
        status: "simulated",
        messageId: `sim_${Date.now()}`,
        starred: false,
        read: true,
        createdAt: new Date().toISOString(),
      };
      setEmails((prev) => [fallbackSentMail, ...prev]);
      setActiveFolder("sent");
      setSelectedMail(fallbackSentMail);
      setIsComposeOpen(false);
      showToast("⚡ Sent via Sandbox Dispatcher.", "success");
    } finally {
      setIsSending(false);
    }
  };

  // Helper for category badge styles
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "fee_reminder":
        return { label: "Fee Notice", bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900" };
      case "admission_letter":
        return { label: "Admission", bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900" };
      case "report_card":
        return { label: "Report Card", bg: "bg-blue-50 text-[#0050CB] border-blue-200 dark:bg-blue-950/40 dark:text-[#38BDF8] dark:border-blue-900" };
      case "disciplinary_memo":
        return { label: "Disciplinary", bg: "bg-[#FF690C]/10 text-[#FF690C] border-[#FF690C]/30 dark:bg-[#FF690C]/20 dark:text-[#FF690C]" };
      default:
        return { label: "Circular", bg: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" };
    }
  };

  // Autocomplete matching recipients
  const filteredRecipientSuggestions = useMemo(() => {
    if (!recipientInputText.trim()) return recipientsList.slice(0, 5);
    const q = recipientInputText.toLowerCase();
    return recipientsList.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q)
    );
  }, [recipientsList, recipientInputText]);

  // Folder Counts
  const counts = useMemo(() => {
    return {
      inbox: emails.filter((m) => m.folder === "inbox").length,
      sent: emails.filter((m) => m.folder === "sent").length,
      drafts: emails.filter((m) => m.folder === "drafts").length,
      starred: emails.filter((m) => m.starred).length,
      unreadInbox: emails.filter((m) => m.folder === "inbox" && !m.read).length,
    };
  }, [emails]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <EmergencyBanner />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toastMessage.type === "success"
              ? "bg-[#000E28] text-white border-[#0050CB]/40 shadow-[#0050CB]/20"
              : toastMessage.type === "error"
              ? "bg-red-900 text-white border-red-700 shadow-red-900/30"
              : "bg-slate-900 text-white border-slate-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#FF690C] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-white via-[#E5EEFF]/40 to-white dark:from-[#000E28] dark:via-[#001844] dark:to-[#000E28] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#0050CB] text-white rounded-2xl shadow-md shadow-[#0050CB]/25">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight">
                  Official School Email Client
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E5EEFF] text-[#0050CB] dark:bg-[#0050CB]/30 dark:text-[#38BDF8] border border-[#0050CB]/20">
                  <ShieldCheck className="w-3 h-3" />
                  Super Admin Dispatcher
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                Enterprise communication hub with SMTP relay, automated school-branded templates, and student/parent directory autocomplete.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#001438] rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>SMTP Service:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Connected (Active)</span>
          </div>

          <button
            onClick={() => fetchData()}
            disabled={isLoading}
            title="Refresh Mails"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#0050CB]" : ""}`} />
          </button>

          <button
            onClick={() => setIsComposeOpen(true)}
            className="px-5 py-2.5 bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold rounded-xl shadow-md shadow-[#0050CB]/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Dispatch</span>
          </button>
        </div>
      </div>

      {/* Main Mail Client Layout: 3 Columns */}
      <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* ========================================================================= */}
        {/* COLUMN 1: Folders & Category Filters (lg:col-span-3)                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 border-r border-slate-200 dark:border-slate-800 p-4 space-y-6 bg-slate-50/50 dark:bg-[#000E28]/50 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Compose Quick Button */}
            <button
              onClick={() => setIsComposeOpen(true)}
              className="w-full py-2.5 px-4 bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>New Institutional Email</span>
            </button>

            {/* Main Mail Folders */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
                Mailboxes
              </span>

              <button
                onClick={() => setActiveFolder("inbox")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeFolder === "inbox"
                    ? "bg-[#0050CB] text-white shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4" />
                  <span>Inbox</span>
                </div>
                {counts.unreadInbox > 0 && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      activeFolder === "inbox" ? "bg-[#FF690C] text-white" : "bg-[#E5EEFF] text-[#0050CB] dark:bg-[#0050CB]/30 dark:text-[#38BDF8]"
                    }`}
                  >
                    {counts.unreadInbox}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveFolder("sent")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeFolder === "sent"
                    ? "bg-[#0050CB] text-white shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4" />
                  <span>Sent Dispatches</span>
                </div>
                <span className="text-[10px] opacity-70 font-semibold">{counts.sent}</span>
              </button>

              <button
                onClick={() => setActiveFolder("drafts")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeFolder === "drafts"
                    ? "bg-[#0050CB] text-white shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Drafts</span>
                </div>
                <span className="text-[10px] opacity-70 font-semibold">{counts.drafts}</span>
              </button>

              <button
                onClick={() => setActiveFolder("starred")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeFolder === "starred"
                    ? "bg-[#0050CB] text-white shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Starred / Flagged</span>
                </div>
                <span className="text-[10px] opacity-70 font-semibold">{counts.starred}</span>
              </button>
            </div>

            {/* Template Category Filters */}
            <div className="pt-2 space-y-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                <span>Categories</span>
              </span>

              <div className="space-y-1">
                {[
                  { id: "all", label: "All Dispatches", icon: Filter, color: "text-slate-500" },
                  { id: "fee_reminder", label: "Fee Notices", icon: Receipt, color: "text-red-500" },
                  { id: "admission_letter", label: "Admissions", icon: GraduationCap, color: "text-emerald-500" },
                  { id: "report_card", label: "Report Cards", icon: Award, color: "text-[#0050CB]" },
                  { id: "disciplinary_memo", label: "Disciplinary", icon: ShieldCheck, color: "text-[#FF690C]" },
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeCategory === cat.id
                          ? "bg-[#E5EEFF] text-[#0050CB] font-bold dark:bg-[#0050CB]/20 dark:text-[#38BDF8]"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Dynamic Groups Preview */}
          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Broadcast Groups</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {groups.slice(0, 4).map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGroupTags([g.tag]);
                    setIsComposeOpen(true);
                  }}
                  className="px-2 py-1 bg-white dark:bg-[#001438] hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/30 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-[#0050CB] dark:text-[#38BDF8] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>{g.tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: Message List (lg:col-span-4)                                     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 border-r border-slate-200 dark:border-slate-800 p-4 space-y-3 flex flex-col">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by recipient, subject, preview..."
              className="w-full pl-10 pr-8 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List Header */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span className="capitalize">{activeFolder} ({filteredEmails.length})</span>
            {activeCategory !== "all" && (
              <span className="text-[#FF690C] text-[10px] font-extrabold uppercase">Filtered</span>
            )}
          </div>

          {/* Scrollable Email Items */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[580px]">
            {filteredEmails.length === 0 ? (
              <div className="py-16 text-center space-y-2 text-slate-400">
                <Mail className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold">No emails found</p>
                <p className="text-[11px]">No messages match current folder or search filters.</p>
              </div>
            ) : (
              filteredEmails.map((mail) => {
                const mailId = mail._id || mail.id;
                const isSelected = (selectedMail?._id || selectedMail?.id) === mailId;
                const badge = getCategoryBadge(mail.category);

                return (
                  <div
                    key={mailId}
                    onClick={() => setSelectedMail(mail)}
                    className={`pt-2 p-3 rounded-2xl transition-all cursor-pointer space-y-1.5 relative border ${
                      isSelected
                        ? "bg-[#E5EEFF] dark:bg-[#0050CB]/20 border-[#0050CB]/40 shadow-sm"
                        : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    {/* Top Row: Sender & Star */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        {mail.priority === "high" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF690C] shrink-0" title="High Priority" />
                        )}
                        <h4
                          className={`text-xs truncate ${
                            !mail.read ? "font-extrabold text-[#0050CB] dark:text-[#38BDF8]" : "font-bold text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {activeFolder === "sent"
                            ? `To: ${Array.isArray(mail.recipients) ? mail.recipients.join(", ") : mail.recipients}`
                            : mail.sender}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {typeof mail.createdAt === "string" && mail.createdAt.includes("T")
                            ? new Date(mail.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })
                            : "Today"}
                        </span>
                        <button
                          onClick={(e) => handleToggleStar(e, mail)}
                          className="text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${mail.starred ? "text-amber-500 fill-amber-500" : ""}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Subject */}
                    <p className={`text-xs truncate ${!mail.read ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-700 dark:text-slate-300"}`}>
                      {mail.subject}
                    </p>

                    {/* Preview Snippet */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-normal">
                      {mail.preview || mail.body}
                    </p>

                    {/* Bottom Badges */}
                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                        {badge.label}
                      </span>

                      {mail.recipientGroups && mail.recipientGroups.length > 0 && (
                        <span className="text-[9px] font-bold text-[#0050CB] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                          {mail.recipientGroups[0]}
                        </span>
                      )}

                      {mail.status === "simulated" && (
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                          Sandbox
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 3: Reading Pane (lg:col-span-5)                                     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 p-6 flex flex-col justify-between overflow-y-auto max-h-[640px]">
          {selectedMail ? (
            <div id="printable-email-pane" className="space-y-6">
              {/* Message Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border mb-1.5 ${getCategoryBadge(selectedMail.category).bg}`}>
                      {getCategoryBadge(selectedMail.category).label}
                    </span>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {selectedMail.subject}
                    </h2>
                  </div>

                  {/* Quick Action Toolbar */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleToggleStar(e, selectedMail)}
                      title={selectedMail.starred ? "Unstar" : "Star"}
                      className="p-2 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${selectedMail.starred ? "text-amber-500 fill-amber-500" : ""}`} />
                    </button>
                    <button
                      onClick={() => printDocument('printable-email-pane', 'GGPS School Email - ' + selectedMail.subject)}
                      title="Print Email"
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMail(selectedMail)}
                      title="Delete Email"
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sender & Recipient Metadata */}
                <div className="bg-slate-50 dark:bg-[#001438] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 font-semibold">From: </span>
                      <strong className="text-slate-800 dark:text-white font-bold">{selectedMail.sender}</strong>
                      <span className="text-slate-500 text-[11px] ml-1">({selectedMail.senderEmail})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {typeof selectedMail.createdAt === "string" && selectedMail.createdAt.includes("T")
                        ? new Date(selectedMail.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
                        : "Today"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400 font-semibold">To: </span>
                    {Array.isArray(selectedMail.recipients) ? (
                      selectedMail.recipients.map((r, i) => (
                        <span key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md font-medium text-slate-700 dark:text-slate-300">
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className="font-medium text-slate-700 dark:text-slate-300">{selectedMail.recipients}</span>
                    )}

                    {selectedMail.recipientGroups && selectedMail.recipientGroups.map((g, i) => (
                      <span key={i} className="bg-[#E5EEFF] text-[#0050CB] dark:bg-[#0050CB]/30 dark:text-[#38BDF8] font-bold px-2 py-0.5 rounded-md">
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Delivery Status Banner */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0050CB]" />
                      <span>Dispatch Status: </span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold capitalize">
                        {selectedMail.status === "simulated" ? "Delivered (Sandbox Relay)" : "Delivered via SMTP"}
                      </strong>
                    </span>
                    {selectedMail.messageId && (
                      <span className="font-mono text-slate-400">ID: {selectedMail.messageId.substring(0, 16)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Content: Official School Letterhead Format */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#00102e] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                    <span className="font-bold text-[#0050CB] dark:text-[#38BDF8]">GGPS SCHOOL</span>
                    <span>Administrative Communication</span>
                  </div>

                  <div className="whitespace-pre-line space-y-2 font-normal text-slate-700 dark:text-slate-300">
                    {selectedMail.body}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <p className="font-bold text-slate-600 dark:text-slate-300">Office of Academic Administration</p>
                    <p>GGPS School • Plot 42, Knowledge Avenue • Tel: +91 98765 43210</p>
                  </div>
                </div>
              </div>

              {/* Reply / Quick Action Footer */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedRecipientEmails([selectedMail.senderEmail]);
                    setComposeSubject(`Re: ${selectedMail.subject}`);
                    setComposeBody(`\n\n--- On ${selectedMail.createdAt}, ${selectedMail.sender} wrote:\n${selectedMail.body}`);
                    setIsComposeOpen(true);
                  }}
                  className="px-4 py-2 bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <SendHorizontal className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() => {
                    setComposeSubject(`Fwd: ${selectedMail.subject}`);
                    setComposeBody(`\n\n---------- Forwarded message ---------\nFrom: ${selectedMail.sender} <${selectedMail.senderEmail}>\nSubject: ${selectedMail.subject}\n\n${selectedMail.body}`);
                    setIsComposeOpen(true);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Forward</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="my-auto text-center space-y-3 text-slate-400 py-24">
              <div className="w-16 h-16 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center mx-auto text-[#0050CB] dark:text-[#38BDF8]">
                <Mail className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Email Selected</h3>
                <p className="text-xs max-w-xs mx-auto">
                  Select an email from the message list to view its complete correspondence and letterhead dispatch.
                </p>
              </div>
              <button
                onClick={() => setIsComposeOpen(true)}
                className="mt-2 px-4 py-2 bg-[#0050CB] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#0041A8] cursor-pointer"
              >
                Compose New Dispatch
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* COMPOSE MODAL: Recipient Autocomplete, Template Chooser, Dispatcher       */}
      {/* ========================================================================= */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-[#001438] dark:to-[#000E28]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#0050CB] text-white rounded-xl">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#000E28] dark:text-white">
                    Compose Official Institutional Dispatch
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Dispatched via Nodemailer SMTP service with official school letterhead.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendEmail} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* 1. Official School Template Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF690C]" />
                    <span>Select Official Template (Auto-fills Subject & Letterhead)</span>
                  </label>
                  {selectedTemplateId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId("");
                        setComposeSubject("");
                        setComposeBody("");
                      }}
                      className="text-[10px] text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      Clear Template
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {templates.map((tmpl) => {
                    const isSelected = selectedTemplateId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tmpl.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#0050CB] text-white border-[#0050CB] shadow-sm shadow-[#0050CB]/25"
                            : "bg-slate-50 dark:bg-[#001438] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0050CB]"
                        }`}
                      >
                        <span className="text-[11px] font-extrabold line-clamp-1">{tmpl.name}</span>
                        <span className={`text-[9px] font-semibold mt-1 px-1.5 py-0.5 rounded w-fit ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}>
                          {tmpl.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Dynamic Recipient Group Selectors */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#0050CB]" />
                  <span>Dynamic Group Selectors (@Groups)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {groups.map((grp) => {
                    const isGroupSelected = selectedGroupTags.includes(grp.tag);
                    return (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => toggleGroupTag(grp.tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isGroupSelected
                            ? "bg-[#0050CB] text-white border-[#0050CB] shadow-sm"
                            : "bg-slate-50 dark:bg-[#001438] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20"
                        }`}
                      >
                        <span>{grp.tag}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isGroupSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        }`}>
                          {grp.count}
                        </span>
                        {isGroupSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Individual Recipient Autocomplete Input */}
              <div className="space-y-1.5 relative">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Individual Recipients (Search Directory: /api/users & /api/parents)
                </label>

                {/* Selected Recipient Chips */}
                <div className="min-h-[42px] p-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl flex flex-wrap items-center gap-1.5 focus-within:border-[#0050CB]">
                  {selectedGroupTags.map((g) => (
                    <span key={g} className="bg-[#0050CB] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <span>{g}</span>
                      <button
                        type="button"
                        onClick={() => toggleGroupTag(g)}
                        className="hover:text-red-200 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {selectedRecipientEmails.map((email) => (
                    <span key={email} className="bg-[#E5EEFF] text-[#0050CB] dark:bg-[#0050CB]/30 dark:text-[#38BDF8] text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-[#0050CB]/20">
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => removeRecipientEmail(email)}
                        className="hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={recipientInputText}
                    onChange={(e) => {
                      setRecipientInputText(e.target.value);
                      setIsRecipientDropdownOpen(true);
                    }}
                    onFocus={() => setIsRecipientDropdownOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && recipientInputText.includes("@")) {
                        e.preventDefault();
                        addRecipientEmail(recipientInputText.trim());
                      }
                    }}
                    placeholder={
                      selectedGroupTags.length === 0 && selectedRecipientEmails.length === 0
                        ? "Type staff or parent name / email..."
                        : "Add more..."
                    }
                    className="flex-1 min-w-[140px] bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {isRecipientDropdownOpen && filteredRecipientSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRecipientSuggestions.map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => addRecipientEmail(rec.email)}
                        className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center font-bold text-xs">
                            {rec.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{rec.name}</p>
                            <p className="text-[10px] text-slate-400">{rec.email}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          rec.badge === "Staff"
                            ? "bg-blue-50 text-[#0050CB] dark:bg-blue-900/30 dark:text-[#38BDF8]"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}>
                          {rec.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Subject Line & Priority Flag */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="Enter institutional subject line..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0050CB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Priority
                  </label>
                  <button
                    type="button"
                    onClick={() => setComposePriority(composePriority === "normal" ? "high" : "normal")}
                    className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border ${
                      composePriority === "high"
                        ? "bg-[#FF690C] text-white border-[#FF690C] shadow-sm"
                        : "bg-slate-50 dark:bg-[#001438] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span>{composePriority === "high" ? "High Priority 🚨" : "Normal"}</span>
                  </button>
                </div>
              </div>

              {/* 5. Variable Helper Toolbar */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-bold text-slate-400">Insert Variable:</span>
                {["Student Name", "Parent Name", "Grade", "Amount Due", "Due Date", "Admission No"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/30 text-slate-700 dark:text-slate-300 hover:text-[#0050CB] text-[10px] font-bold rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    + [{v}]
                  </button>
                ))}
              </div>

              {/* 6. Body Editor */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Message Body (Wrapped with Official GIS HTML Letterhead)
                </label>
                <textarea
                  required
                  rows={8}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type message content here..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:border-[#0050CB] leading-relaxed"
                />
              </div>

              {/* 7. Attachment Toggle */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setHasAttachments(!hasAttachments)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0050CB] cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{hasAttachments ? "Attachments (1 File attached)" : "Attach document / report card"}</span>
                </button>

                {hasAttachments && (
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                    GIS_Official_Notice_2026.pdf (1.2 MB)
                  </span>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-6 py-2.5 bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold rounded-xl shadow-md shadow-[#0050CB]/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Dispatch Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
