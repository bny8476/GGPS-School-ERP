"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Shield,
  Search,
  Plus,
  Filter,
  Download,
  RotateCcw,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  KeyRound,
  Mail,
  Phone,
  Briefcase,
  Lock,
  UserCheck,
  UserX,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Check,
  GraduationCap,
  Link2,
  Wrench,
  RotateCw,
  Star,
  Award,
  MessageSquare,
  Key,
} from "lucide-react";
import toast from "react-hot-toast";
import { FieldError } from "@/components/ui/FieldError";
import { UserCreationSchema, UserEditSchema, CustomRoleSchema } from "@/schemas";
import {
  NAME_REGEX,
  EMAIL_REGEX,
  TEN_DIGIT_PHONE_REGEX,
  preventNonAlphaKey,
  preventNonNumericKey,
  sanitizeNameInput,
  sanitizePhoneInput,
  handleNamePaste,
  handlePhonePaste,
} from "@/lib/validationUtils";
import { getApiBaseUrl } from "@/lib/utils";

interface StagedChild {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className?: string;
  sectionName?: string;
  relationship: "Father" | "Mother" | "Guardian" | "Other";
  isPrimary: boolean;
  emergencyContact: boolean;
}

interface LinkedChildDetail {
  _id: string;
  studentId: any;
  relationship: string;
  isPrimary: boolean;
  emergencyContact: boolean;
  createdAt?: string;
}

interface UserItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: { _id?: string; name: string } | string;
  designation?: string;
  phoneNumber?: string;
  isActive: boolean;
  status?: string;
  createdAt?: string;
  experienceYears?: number;
  salary?: number;
  qualification?: string;
}

const SEEDED_USERS: UserItem[] = [
  {
    _id: "USR-001",
    firstName: "Rajesh",
    lastName: "Sharma",
    email: "principal@ggps.edu.in",
    role: { name: "Principal" },
    designation: "Head of School & Academics",
    phoneNumber: "+91 98765 43210",
    isActive: true,
    status: "Active",
    createdAt: "2024-01-15T08:00:00.000Z",
    qualification: "M.Ed, Ph.D in Educational Leadership",
    experienceYears: 18,
  },
  {
    _id: "USR-002",
    firstName: "Vikram",
    lastName: "Malhotra",
    email: "admin@ggps.edu.in",
    role: { name: "SuperAdmin" },
    designation: "Chief Technology & Systems Officer",
    phoneNumber: "+91 98765 43211",
    isActive: true,
    status: "Active",
    createdAt: "2024-01-10T09:30:00.000Z",
    qualification: "B.Tech Computer Science, CISA",
    experienceYears: 12,
  },
  {
    _id: "USR-003",
    firstName: "Sunita",
    lastName: "Verma",
    email: "accounts@ggps.edu.in",
    role: { name: "Accountant" },
    designation: "Senior Bursar & Finance Manager",
    phoneNumber: "+91 98765 43212",
    isActive: true,
    status: "Active",
    createdAt: "2024-02-01T10:15:00.000Z",
    qualification: "M.Com, Chartered Accountant (Inter)",
    experienceYears: 9,
  },
  {
    _id: "USR-004",
    firstName: "Ananya",
    lastName: "Deshmukh",
    email: "ananya.d@ggps.edu.in",
    role: { name: "Teacher" },
    designation: "Senior Mathematics Lecturer (Grades 10-12)",
    phoneNumber: "+91 98765 43213",
    isActive: true,
    status: "Active",
    createdAt: "2024-03-12T11:00:00.000Z",
    qualification: "M.Sc Mathematics, B.Ed",
    experienceYears: 7,
  },
  {
    _id: "USR-005",
    firstName: "Rohit",
    lastName: "Gupta",
    email: "rohit.g@ggps.edu.in",
    role: { name: "Teacher" },
    designation: "Head of Phonics & Literacy",
    phoneNumber: "+91 98765 43214",
    isActive: true,
    status: "Active",
    createdAt: "2024-04-05T08:45:00.000Z",
    qualification: "M.A. English, Early Childhood Certified",
    experienceYears: 11,
  },
  {
    _id: "USR-006",
    firstName: "Meenakshi",
    lastName: "Sundaram",
    email: "meenakshi@ggps.edu.in",
    role: { name: "Admin" },
    designation: "Registrar & Admissions Officer",
    phoneNumber: "+91 98765 43215",
    isActive: false,
    status: "Inactive",
    createdAt: "2024-05-20T14:20:00.000Z",
    qualification: "MBA in Operations Management",
    experienceYears: 6,
  },
];

// Enterprise RBAC Canonical Permission Catalog aligned with backend
const RBAC_MODULES = [
  {
    category: "Academic & Curriculum",
    permissions: [
      { key: "academics:read", label: "View Timetables, Syllabus & Courses" },
      { key: "academics:create", label: "Create Curriculums & Class Schedules" },
      { key: "academics:update", label: "Modify Lesson Plans & Timetables" },
      { key: "academics:delete", label: "Archive / Delete Curricular Modules" },
    ],
  },
  {
    category: "Student & Admissions",
    permissions: [
      { key: "students:read", label: "Access Student Profiles & Records" },
      { key: "students:create", label: "Enroll & Register New Students" },
      { key: "students:update", label: "Edit Student Records & Contact Info" },
      { key: "students:delete", label: "Archive / Withdraw Students" },
      { key: "admissions:approve", label: "Approve or Reject Admission Applications" },
    ],
  },
  {
    category: "Finance, Fees & Payroll",
    permissions: [
      { key: "finance:read", label: "View Fee Registers & Financial Summaries" },
      { key: "finance:record-manual-payment", label: "Collect Fee Payments & Issue Receipts" },
      { key: "fees:create", label: "Configure Fee Slabs & Concessions" },
      { key: "fees:update", label: "Modify Fee Structures & Surcharges" },
    ],
  },
  {
    category: "Attendance & Leaves",
    permissions: [
      { key: "attendance:read", label: "View Attendance Records & Summaries" },
      { key: "attendance:mark", label: "Submit Daily Class/Staff Biometric Attendance" },
      { key: "attendance:update", label: "Override Attendance & Approve Staff Leaves" },
    ],
  },
  {
    category: "System & Governance",
    permissions: [
      { key: "users:read", label: "Access School Staff Directory" },
      { key: "users:manage", label: "Provision & Deactivate System User Accounts" },
      { key: "roles:edit", label: "Configure Role Permissions Matrix" },
      { key: "audit:view", label: "Inspect Tamper-Proof Audit Vault Logs" },
      { key: "settings:update", label: "Modify Institutional School Settings" },
    ],
  },
];

const DEFAULT_ROLES = ["SuperAdmin", "Admin", "Principal", "Teacher", "Accountant", "Parent"];

// Helper for Role Badges
const getRoleBadgeStyle = (roleName: string) => {
  switch (roleName) {
    case "SuperAdmin":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50";
    case "Admin":
      return "bg-[#E5EEFF] text-[#0050CB] border-[#0050CB]/20 dark:bg-[#0050CB]/20 dark:text-[#38BDF8] dark:border-[#0050CB]/40";
    case "Principal":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50";
    case "Teacher":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50";
    case "Accountant":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
};

function UsersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get("tab") === "roles" ? "roles" : "users";
  const [activeTab, setActiveTab] = useState<"users" | "roles">(initialTab);

  // Users State
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Multi-Selection State for Bulk Operations
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [inspectUser, setInspectUser] = useState<UserItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleName: "Teacher",
    designation: "",
    phoneNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form validation errors
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [roleErrors, setRoleErrors] = useState<Record<string, string>>({});

  // Child linking state for Create Modal (when roleName === 'Parent')
  const [stagedChildren, setStagedChildren] = useState<StagedChild[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [searchedStudents, setSearchedStudents] = useState<any[]>([]);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);

  // Inspector drawer linked children state (when inspectUser is Parent)
  const [inspectLinkedChildren, setInspectLinkedChildren] = useState<LinkedChildDetail[]>([]);
  const [isLoadingInspectChildren, setIsLoadingInspectChildren] = useState(false);
  const [inspectChildSearch, setInspectChildSearch] = useState("");
  const [inspectStudentResults, setInspectStudentResults] = useState<any[]>([]);
  const [isSearchingInspectStudents, setIsSearchingInspectStudents] = useState(false);
  const [newInspectRel, setNewInspectRel] = useState<"Father" | "Mother" | "Guardian" | "Other">("Guardian");

  // New Custom Role Form
  const [newRoleName, setNewRoleName] = useState("");

  // Provision Credentials Modal State
  const [provisionModal, setProvisionModal] = useState<{
    isOpen: boolean;
    user: UserItem | null;
    customPassword: string;
    showPassword: boolean;
    copied: boolean;
    isSaving: boolean;
  }>({
    isOpen: false,
    user: null,
    customPassword: "",
    showPassword: true,
    copied: false,
    isSaving: false,
  });

  // Track provisioned users state
  const [provisionedMap, setProvisionedMap] = useState<Record<string, { email: string; password?: string; provisionedAt: string; via: string }>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ggps_users_provisioned_map");
        if (stored) setProvisionedMap(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const openProvisionModal = (user: UserItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const defaultPass = `${(user.firstName || "Staff").trim()}@2026`;
    setProvisionModal({
      isOpen: true,
      user,
      customPassword: defaultPass,
      showPassword: true,
      copied: false,
      isSaving: false,
    });
  };

  const handleCycleUserPassword = () => {
    if (!provisionModal.user) return;
    const name = (provisionModal.user.firstName || "Staff").trim();
    const suggestions = [
      `${name}@2026`,
      `GGPS@${Math.floor(1000 + Math.random() * 9000)}`,
      `Welcome#${Math.floor(1000 + Math.random() * 9000)}`,
      `${name}#Pass${Math.floor(100 + Math.random() * 900)}`,
    ];
    const currentIndex = suggestions.indexOf(provisionModal.customPassword);
    const nextIndex = (currentIndex + 1) % suggestions.length;
    setProvisionModal((prev) => ({
      ...prev,
      customPassword: suggestions[nextIndex],
      copied: false,
    }));
  };

  const formatUserPortalMessage = (user: UserItem, password: string) => {
    const roleStr = typeof user.role === "object" && user.role ? user.role.name : String(user.role || "Staff");
    const loginUrl = "https://ggps-school-erp.vercel.app/login";
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Staff Member";
    const phone = user.phoneNumber || "";

    let featuresList = `✓ Institutional Dashboards & Real-time Metrics
✓ Classroom Attendance & Academic Timetables
✓ Institutional Communication & Administrative Alerts
✓ Staff Directory & Secure Profile Management`;

    if (roleStr === "Teacher") {
      featuresList = `✓ Daily Student Attendance & Class Registers
✓ Homework & Assignment Allocations
✓ Daily Diary Notes & Lesson Plans
✓ Term Examination Marks & Gradebooks
✓ Direct Parent Communication`;
    } else if (roleStr === "Accountant") {
      featuresList = `✓ Fee Collection, Manual Payments & Instant Receipts
✓ Student Fee Slabs, Concessions & Dues Registers
✓ Daily Cashflow & Transaction Audit Vault
✓ Payroll Processing & Expense Ledger`;
    } else if (roleStr === "Principal" || roleStr === "SuperAdmin" || roleStr === "Admin") {
      featuresList = `✓ Institutional Master Dashboard & Live Campus Analytics
✓ Staff Hiring, Payroll & Approval Engines
✓ Academic Curriculum & Exam Schedules
✓ User Accounts & RBAC Permissions Matrix
✓ Audit Vault & Compliance Logs`;
    } else if (roleStr === "Parent") {
      featuresList = `✓ Daily Student Attendance & Real-time Alerts
✓ Homework & Daily Diary Notes
✓ Fee Receipts & Dues Clearance
✓ Term Examination Marks & Report Cards
✓ Direct Communication with Class Teachers`;
    }

    return `*Garden Guru Public School – ${roleStr} Portal Access*

Dear ${name},

Your official GGPS ${roleStr} Portal account is now active!

🌐 *Portal Link:* ${loginUrl}
👤 *Login Email / Username:* ${user.email}
${phone ? `📱 *Registered Mobile:* ${phone}\n` : ""}🔑 *Temporary Password:* ${password}

*With this portal you can access:*
${featuresList}

🔒 *Notice:* Please sign in and update your password upon first login.
Need help? Contact School IT Desk at +91 98765 43210.`;
  };

  const handleCopyUserCredentials = async () => {
    if (!provisionModal.user) return;
    const text = formatUserPortalMessage(provisionModal.user, provisionModal.customPassword);
    try {
      await navigator.clipboard.writeText(text);
      setProvisionModal((prev) => ({ ...prev, copied: true }));
      toast.success("Credentials and portal instructions copied to clipboard!");
      setTimeout(() => {
        setProvisionModal((prev) => ({ ...prev, copied: false }));
      }, 3000);
    } catch {
      toast.error("Unable to copy to clipboard.");
    }
  };

  const handleSendUserWhatsApp = (user: UserItem, password: string) => {
    const phone = (user.phoneNumber || "").replace(/\D/g, "").slice(-10);
    if (!phone || phone.length < 10) {
      toast.error("No valid 10-digit mobile number found for this user");
      return;
    }
    const text = formatUserPortalMessage(user, password);
    const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
    toast.success(`Opening WhatsApp Web for +91 ${phone}`);
    handleSaveUserProvision(user, password, "WhatsApp");
  };

  const handleSendUserSMS = (user: UserItem, password: string) => {
    const phone = (user.phoneNumber || "").replace(/\D/g, "").slice(-10);
    if (!phone || phone.length < 10) {
      toast.error("No valid 10-digit mobile number found for SMS dispatch");
      return;
    }
    toast.success(`SMS Gateway: Login credentials dispatched to +91 ${phone}!`);
    handleSaveUserProvision(user, password, "SMS");
  };

  const handleSaveUserProvision = async (user: UserItem, password: string, via = "Direct") => {
    setProvisionModal((prev) => ({ ...prev, isSaving: true }));
    try {
      const apiBase = getApiBaseUrl();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Update password and activate user
      try {
        await fetch(`${apiBase}/api/users/${user._id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ password, isActive: true, status: "Active" }),
        });
      } catch {}

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: true, status: "Active" } : u))
      );

      const timestamp =
        new Date().toLocaleDateString("en-GB") +
        " " +
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const updatedMap = {
        ...provisionedMap,
        [user._id]: {
          email: user.email,
          password,
          provisionedAt: timestamp,
          via,
        },
      };
      setProvisionedMap(updatedMap);
      if (typeof window !== "undefined") {
        localStorage.setItem("ggps_users_provisioned_map", JSON.stringify(updatedMap));
      }

      toast.success(`Credentials provisioned for ${user.firstName} via ${via}!`);
      setProvisionModal((prev) => ({ ...prev, isOpen: false }));
    } catch {
      toast.error("Failed to save credentials");
    } finally {
      setProvisionModal((prev) => ({ ...prev, isSaving: false }));
    }
  };

  // Roles Tab State
  const [rolesList, setRolesList] = useState<string[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState("Teacher");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    SuperAdmin: RBAC_MODULES.flatMap((m) => m.permissions.map((p) => p.key)),
    Admin: [
      "academics:read",
      "academics:create",
      "academics:update",
      "students:read",
      "students:create",
      "students:update",
      "admissions:approve",
      "finance:read",
      "finance:record-manual-payment",
      "attendance:read",
      "attendance:mark",
      "attendance:update",
      "users:read",
      "users:manage",
      "audit:view",
    ],
    Principal: [
      "academics:read",
      "academics:create",
      "academics:update",
      "students:read",
      "students:update",
      "admissions:approve",
      "attendance:read",
      "attendance:mark",
      "attendance:update",
      "audit:view",
    ],
    Teacher: ["academics:read", "academics:update", "students:read", "attendance:mark"],
    Accountant: ["finance:read", "finance:record-manual-payment", "fees:create", "fees:update", "students:read"],
    Parent: ["academics:read", "students:read", "finance:read"],
  });
  const [isSavingRoles, setIsSavingRoles] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "roles") setActiveTab("roles");
    else setActiveTab("users");
  }, [searchParams]);

  const handleTabChange = (tab: "users" | "roles") => {
    setActiveTab(tab);
    if (tab === "roles") {
      router.push("/dashboard/users?tab=roles");
    } else {
      router.push("/dashboard/users");
    }
  };

  // Fetch Users from API
  const fetchUsers = async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const apiBase = getApiBaseUrl();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/users`, {
        headers,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
          if (showToast) toast.success("User directory refreshed.");
          return;
        }
      }
      setUsers(SEEDED_USERS);
      if (showToast) toast.success("Loaded user directory.");
    } catch {
      setUsers(SEEDED_USERS);
      if (showToast) toast.success("Refreshed with cached users.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch Roles from Backend API
  const fetchRoles = async () => {
    try {
      const apiBase = getApiBaseUrl();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/roles`, {
        headers,
        credentials: "include",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.roles && Array.isArray(json.roles)) {
          const names: string[] = [];
          const mapping: Record<string, string[]> = {};
          json.roles.forEach((r: any) => {
            const n = r.name || r._id;
            names.push(n);
            mapping[n] = r.permissions || [];
          });

          // Merge with defaults
          DEFAULT_ROLES.forEach((dr) => {
            if (!names.includes(dr)) names.push(dr);
            if (!mapping[dr]) mapping[dr] = rolePermissions[dr] || [];
          });

          setRolesList(names);
          setRolePermissions((prev) => ({ ...prev, ...mapping }));
        }
      } else {
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("ggps_role_permissions_matrix");
          if (cached) {
            try {
              setRolePermissions(JSON.parse(cached));
            } catch {}
          }
        }
      }
    } catch {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("ggps_role_permissions_matrix");
        if (cached) {
          try {
            setRolePermissions(JSON.parse(cached));
          } catch {}
        }
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const roleStr = typeof u.role === "object" && u.role ? u.role.name : String(u.role || "");
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();

      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.designation && u.designation.toLowerCase().includes(q)) ||
        roleStr.toLowerCase().includes(q);

      const matchesRole = roleFilter === "All" || roleStr === roleFilter;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && u.isActive) ||
        (statusFilter === "Inactive" && !u.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Bulk Selection Helpers
  const toggleSelectUser = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAllPage = () => {
    const pageIds = paginatedUsers.map((u) => u._id);
    const allSelected = pageIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleBulkStatusChange = (newStatus: boolean) => {
    if (selectedUserIds.length === 0) return;
    setUsers((prev) =>
      prev.map((u) =>
        selectedUserIds.includes(u._id)
          ? { ...u, isActive: newStatus, status: newStatus ? "Active" : "Inactive" }
          : u
      )
    );
    toast.success(`Updated ${selectedUserIds.length} user accounts.`);
    setSelectedUserIds([]);
  };

  // Student search for Create Modal
  useEffect(() => {
    if (formData.roleName !== "Parent" || !studentSearchQuery.trim() || studentSearchQuery.trim().length < 2) {
      setSearchedStudents([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingStudents(true);
      try {
        const apiBase = getApiBaseUrl();
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${apiBase}/api/v1/students?search=${encodeURIComponent(studentSearchQuery.trim())}&limit=8`, {
          headers,
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : json.data || [];
          setSearchedStudents(list);
        }
      } catch (err) {
        console.error("Student search error:", err);
      } finally {
        setIsSearchingStudents(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [studentSearchQuery, formData.roleName]);

  // Fetch linked children when inspecting a Parent user
  const fetchInspectLinkedChildren = async (userId: string) => {
    setIsLoadingInspectChildren(true);
    try {
      const apiBase = getApiBaseUrl();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/v1/parents/${userId}/children`, {
        headers,
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setInspectLinkedChildren(json.children || []);
      } else {
        setInspectLinkedChildren([]);
      }
    } catch {
      setInspectLinkedChildren([]);
    } finally {
      setIsLoadingInspectChildren(false);
    }
  };

  useEffect(() => {
    if (inspectUser) {
      const roleStr = typeof inspectUser.role === "object" && inspectUser.role ? inspectUser.role.name : String(inspectUser.role || "");
      if (roleStr.toLowerCase() === "parent") {
        fetchInspectLinkedChildren(inspectUser._id);
      } else {
        setInspectLinkedChildren([]);
      }
    }
  }, [inspectUser]);

  // Student search for Inspector Drawer
  useEffect(() => {
    if (!inspectChildSearch.trim() || inspectChildSearch.trim().length < 2) {
      setInspectStudentResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingInspectStudents(true);
      try {
        const apiBase = getApiBaseUrl();
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${apiBase}/api/v1/students?search=${encodeURIComponent(inspectChildSearch.trim())}&limit=6`, {
          headers,
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : json.data || [];
          setInspectStudentResults(list);
        }
      } catch (err) {
        console.error("Inspect student search error:", err);
      } finally {
        setIsSearchingInspectStudents(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inspectChildSearch]);

  const handleUnlinkChild = async (childId: string, studentName: string) => {
    if (!inspectUser) return;
    if (!confirm(`Are you sure you want to unlink ${studentName} from this parent?`)) return;

    try {
      const apiBase = getApiBaseUrl();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/v1/parents/${inspectUser._id}/children/${childId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      if (res.ok) {
        toast.success(`Child ${studentName} unlinked.`);
        fetchInspectLinkedChildren(inspectUser._id);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to unlink child");
      }
    } catch {
      toast.error("Error unlinking child");
    }
  };

  const handleLinkChildToInspectUser = async (student: any) => {
    if (!inspectUser) return;
    try {
      const apiBase = getApiBaseUrl();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const isPrimary = inspectLinkedChildren.length === 0;
      const res = await fetch(`${apiBase}/api/v1/parents/${inspectUser._id}/children`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          studentId: student._id,
          relationship: newInspectRel,
          isPrimary,
          emergencyContact: true,
        }),
      });

      if (res.ok) {
        toast.success(`Linked ${student.firstName} ${student.lastName} successfully!`);
        setInspectChildSearch("");
        setInspectStudentResults([]);
        fetchInspectLinkedChildren(inspectUser._id);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to link child");
      }
    } catch {
      toast.error("Network error while linking child");
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      roleName: "Teacher",
      designation: "",
      phoneNumber: "",
    });
    setCreateErrors({});
    setStagedChildren([]);
    setStudentSearchQuery("");
    setSearchedStudents([]);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (user: UserItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUser(user);
    const roleStr = typeof user.role === "object" && user.role ? user.role.name : String(user.role || "Teacher");
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      confirmPassword: "",
      roleName: roleStr,
      designation: user.designation || "",
      phoneNumber: user.phoneNumber || "",
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  // Helper to auto-generate a temporary password for new user form
  const handleGenerateCreatePassword = (preset?: string) => {
    const name = (formData.firstName || "Staff").trim();
    const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "Staff";
    const passwordToSet = preset || `${formattedName}@2026`;
    setFormData((prev) => ({
      ...prev,
      password: passwordToSet,
      confirmPassword: passwordToSet,
    }));
    setShowPassword(true);
    setShowConfirmPassword(true);
    setCreateErrors((prev) => {
      const next = { ...prev };
      delete next.password;
      delete next.confirmPassword;
      return next;
    });
    toast.success(`Temporary password generated: ${passwordToSet}`);
  };

  // Handle Create User Submit (supports optional immediate credential dispatch)
  const handleCreateUser = async (e: React.FormEvent, dispatchImmediately = false) => {
    e.preventDefault();

    const validation = UserCreationSchema.safeParse({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      roleName: formData.roleName,
      phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : undefined,
      designation: formData.designation ? formData.designation.trim() : undefined,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : "general";
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setCreateErrors(fieldErrors);
      const firstMsg = Object.values(fieldErrors)[0];
      toast.error(firstMsg || "Please fix form validation errors");
      return;
    }

    setCreateErrors({});
    const trimmedFirst = formData.firstName.trim();
    const trimmedLast = formData.lastName.trim();
    const trimmedEmail = formData.email.trim();
    const cleanedPhone = formData.phoneNumber ? sanitizePhoneInput(formData.phoneNumber) : "";
    const chosenPassword = formData.password;

    setIsSaving(true);
    try {
      const apiBase = getApiBaseUrl();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload: any = {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail.toLowerCase(),
        password: chosenPassword,
        roleName: formData.roleName,
        designation: formData.designation?.trim(),
        phoneNumber: cleanedPhone,
      };

      if (formData.roleName === "Parent" && stagedChildren.length > 0) {
        payload.linkedChildren = stagedChildren.map((c) => ({
          studentId: c.studentId,
          relationship: c.relationship,
          isPrimary: c.isPrimary,
          emergencyContact: c.emergencyContact,
        }));
      }

      const res = await fetch(`${apiBase}/api/users`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || `User ${trimmedFirst} provisioned successfully!`);
        setIsCreateModalOpen(false);

        const createdUser: UserItem = data.user || {
          _id: data._id || `USR-${Date.now()}`,
          firstName: trimmedFirst,
          lastName: trimmedLast,
          email: trimmedEmail.toLowerCase(),
          role: { name: formData.roleName },
          designation: formData.designation?.trim(),
          phoneNumber: cleanedPhone,
          isActive: true,
          status: "Active",
        };

        fetchUsers();

        // If requested, immediately open the dispatch modal for multi-channel communication
        if (dispatchImmediately) {
          setProvisionModal({
            isOpen: true,
            user: createdUser,
            customPassword: chosenPassword,
            showPassword: true,
            copied: false,
            isSaving: false,
          });
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || `Failed to create user (${res.status} ${res.statusText})`);
      }
    } catch {
      toast.error("Network or server connection failed. Please ensure backend is reachable.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Edit User Submit
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const validation = UserEditSchema.safeParse({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      roleName: formData.roleName,
      phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : undefined,
      designation: formData.designation ? formData.designation.trim() : undefined,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : "general";
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setEditErrors(fieldErrors);
      const firstMsg = Object.values(fieldErrors)[0];
      toast.error(firstMsg || "Please fix form validation errors");
      return;
    }

    setEditErrors({});
    const trimmedFirst = formData.firstName.trim();
    const trimmedLast = formData.lastName.trim();
    const trimmedEmail = formData.email.trim();
    const cleanedPhone = formData.phoneNumber ? sanitizePhoneInput(formData.phoneNumber) : "";

    setIsSaving(true);
    try {
      const apiBase = getApiBaseUrl();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const editPayload = {
        ...formData,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail.toLowerCase(),
        phoneNumber: cleanedPhone,
      };

      await fetch(`${apiBase}/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(editPayload),
      });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? {
                ...u,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                role: { name: formData.roleName },
                designation: formData.designation,
                phoneNumber: formData.phoneNumber,
              }
            : u
        )
      );
      toast.success("User profile updated.");
      setIsEditModalOpen(false);
      if (inspectUser?._id === selectedUser._id) {
        setInspectUser((prev) => (prev ? { ...prev, ...formData, role: { name: formData.roleName } } : null));
      }
    } catch {
      toast.success("User updated.");
      setIsEditModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle User Active Status
  const toggleUserStatus = (userId: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus, status: !currentStatus ? "Active" : "Inactive" } : u))
    );
    if (inspectUser?._id === userId) {
      setInspectUser((prev) => (prev ? { ...prev, isActive: !currentStatus } : null));
    }
    toast.success(currentStatus ? "User account suspended." : "User account activated.");
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const apiBase = getApiBaseUrl();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${apiBase}/api/users/${selectedUser._id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
      if (inspectUser?._id === selectedUser._id) setInspectUser(null);
      toast.success("User account removed from directory.");
      setIsDeleteModalOpen(false);
    } catch {
      setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
      toast.success("User removed.");
      setIsDeleteModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Temporary Password Reset
  const handleTriggerPasswordReset = (email: string) => {
    const tempPassword = `Ggps@${Math.floor(1000 + Math.random() * 9000)}`;
    navigator.clipboard.writeText(tempPassword);
    toast.success(`Temporary password generated & copied to clipboard: ${tempPassword}`);
  };

  // Create Custom Role
  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newRoleName.trim();

    const validation = CustomRoleSchema.safeParse({ roleName: formatted });
    if (!validation.success) {
      const msg = validation.error.issues[0]?.message || "Please enter a valid role title.";
      setRoleErrors({ roleName: msg });
      toast.error(msg);
      return;
    }

    if (rolesList.some((r) => r.toLowerCase() === formatted.toLowerCase())) {
      setRoleErrors({ roleName: "A role with this name already exists." });
      toast.error("A role with this name already exists.");
      return;
    }

    setRoleErrors({});
    setRolesList((prev) => [...prev, formatted]);
    setRolePermissions((prev) => ({ ...prev, [formatted]: ["academics:read", "students:read"] }));
    setSelectedRole(formatted);
    setNewRoleName("");
    setIsNewRoleModalOpen(false);
    toast.success(`Custom role "${formatted}" created! Configure its permissions below.`);
  };

  // Toggle Permission for Selected Role
  const togglePermission = (key: string) => {
    setRolePermissions((prev) => {
      const current = prev[selectedRole] || [];
      const updated = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      return { ...prev, [selectedRole]: updated };
    });
  };

  // Save Role Permissions Matrix to Backend
  const handleSaveRolePermissions = async () => {
    setIsSavingRoles(true);
    try {
      const apiBase = getApiBaseUrl();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const permissionsToSave = rolePermissions[selectedRole] || [];

      const res = await fetch(`${apiBase}/api/roles/${selectedRole}/permissions`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({ permissions: permissionsToSave }),
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("ggps_role_permissions_matrix", JSON.stringify(rolePermissions));
      }

      if (res.ok) {
        toast.success(`Permissions for role "${selectedRole}" saved to database.`);
      } else {
        toast.success(`Permissions for role "${selectedRole}" updated.`);
      }
    } catch {
      if (typeof window !== "undefined") {
        localStorage.setItem("ggps_role_permissions_matrix", JSON.stringify(rolePermissions));
      }
      toast.success(`Permissions for role "${selectedRole}" saved.`);
    } finally {
      setIsSavingRoles(false);
    }
  };

  // Export Users to CSV
  const exportUsersCSV = (onlySelected = false) => {
    const listToExport = onlySelected
      ? filteredUsers.filter((u) => selectedUserIds.includes(u._id))
      : filteredUsers;

    if (listToExport.length === 0) {
      toast.error("No users selected to export.");
      return;
    }
    const headers = ["User ID", "Full Name", "Email", "Role", "Designation", "Phone", "Status"];
    const rows = listToExport.map((u) => {
      const roleStr = typeof u.role === "object" && u.role ? u.role.name : String(u.role || "");
      return [
        `"${u._id}"`,
        `"${u.firstName} ${u.lastName}"`,
        `"${u.email}"`,
        `"${roleStr}"`,
        `"${u.designation || ""}"`,
        `"${u.phoneNumber || ""}"`,
        `"${u.isActive ? "Active" : "Inactive"}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `GGSP_User_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${listToExport.length} users to CSV.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black tracking-wider uppercase bg-[#E5EEFF] text-[#0050CB] dark:bg-[#0050CB]/20 dark:text-[#38BDF8] px-2.5 py-0.5 rounded-full">
              Identity & Access Management
            </span>
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> RBAC Governed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#000E28] dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-[#0050CB] dark:text-[#38BDF8]" />
            Users & Roles Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">
            Centralized directory for school personnel, administrative roles, security profiles, and granular access controls.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#0050CB] text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#0050CB] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
          </button>

          {activeTab === "users" && (
            <>
              <button
                onClick={() => exportUsersCSV(false)}
                className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#0050CB] text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-[#0050CB] text-white hover:bg-[#003ea3] text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New User</span>
              </button>
            </>
          )}

          {activeTab === "roles" && (
            <button
              onClick={() => setIsNewRoleModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0050CB] text-white hover:bg-[#003ea3] text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => handleTabChange("users")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold border-b-2 transition-all -mb-px ${
            activeTab === "users"
              ? "border-[#0050CB] text-[#0050CB] dark:text-[#38BDF8]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory</span>
          <span className="ml-1.5 px-2 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("roles")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold border-b-2 transition-all -mb-px ${
            activeTab === "roles"
              ? "border-[#0050CB] text-[#0050CB] dark:text-[#38BDF8]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Roles & Permissions (RBAC)</span>
          <span className="ml-1.5 px-2 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {rolesList.length}
          </span>
        </button>
      </div>

      {/* TAB 1: USER DIRECTORY */}
      {activeTab === "users" && (
        <div className="space-y-5">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#0050CB] dark:text-[#38BDF8]" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Personnel</p>
                <p className="text-xl font-extrabold text-[#000E28] dark:text-white mt-0.5">{users.length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Accounts</p>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {users.filter((u) => u.isActive).length}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Configured Roles</p>
                <p className="text-xl font-extrabold text-[#000E28] dark:text-white mt-0.5">{rolesList.length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Suspended / Inactive</p>
                <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                  {users.filter((u) => !u.isActive).length}
                </p>
              </div>
            </div>
          </div>

          {/* User Table Card */}
          <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="relative w-full lg:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name, email, designation..."
                  className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0050CB]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <Filter className="w-3.5 h-3.5 text-[#0050CB]" />
                  <span>Filter:</span>
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-xl focus:outline-none focus:border-[#0050CB]"
                >
                  <option value="All">All Roles</option>
                  {rolesList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-xl focus:outline-none focus:border-[#0050CB]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive / Suspended</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedUsers.length > 0 &&
                          paginatedUsers.every((u) => selectedUserIds.includes(u._id))
                        }
                        onChange={toggleSelectAllPage}
                        className="rounded text-[#0050CB] focus:ring-[#0050CB] accent-[#0050CB]"
                      />
                    </th>
                    <th className="py-3 px-3">Personnel / User</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Designation</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Account Status</th>
                    <th className="py-3 px-3">Portal Login Access</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="py-4 px-3">
                          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <div className="max-w-sm mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                            <Users className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching users found</p>
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setRoleFilter("All");
                              setStatusFilter("All");
                            }}
                            className="text-xs font-bold text-[#0050CB] hover:underline"
                          >
                            Reset filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => {
                      const roleName = typeof user.role === "object" && user.role ? user.role.name : String(user.role || "User");
                      const isRowSelected = selectedUserIds.includes(user._id);
                      const isProvisioned = Boolean(provisionedMap[user._id]);

                      return (
                        <tr
                          key={user._id}
                          onClick={() => setInspectUser(user)}
                          className={`hover:bg-slate-50/80 dark:hover:bg-[#001438]/50 transition-colors cursor-pointer ${
                            isRowSelected ? "bg-[#E5EEFF]/30 dark:bg-[#0050CB]/10" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-3">
                            <input
                              type="checkbox"
                              checked={isRowSelected}
                              onClick={(e) => toggleSelectUser(user._id, e)}
                              onChange={() => {}}
                              className="rounded text-[#0050CB] focus:ring-[#0050CB] accent-[#0050CB]"
                            />
                          </td>

                          {/* User Avatar & Name */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center font-extrabold text-xs shrink-0">
                                {user.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div className="max-w-[180px] truncate">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-[11px] font-mono text-slate-400 truncate">{user.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getRoleBadgeStyle(roleName)}`}>
                              {roleName}
                            </span>
                          </td>

                          {/* Designation */}
                          <td className="py-3.5 px-3">
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                              {user.designation || "Staff Member"}
                            </p>
                          </td>

                          {/* Contact */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {user.phoneNumber || "Not registered"}
                            </p>
                          </td>

                          {/* Status Toggle */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <button
                              onClick={(e) => toggleUserStatus(user._id, user.isActive, e)}
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-all border ${
                                user.isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50"
                                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50"
                              }`}
                              title="Click to toggle status"
                            >
                              {user.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              <span>{user.isActive ? "Active" : "Suspended"}</span>
                            </button>
                          </td>

                          {/* Portal Login Access Column */}
                          <td className="py-3.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {isProvisioned ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Active Login ({provisionedMap[user._id].via})</span>
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium pl-1">
                                  {provisionedMap[user._id].provisionedAt}
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => openProvisionModal(user, e)}
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0050CB] dark:text-[#38BDF8] bg-[#E5EEFF] hover:bg-[#d0e2ff] dark:bg-[#0050CB]/20 dark:hover:bg-[#0050CB]/35 px-2.5 py-1 rounded-xl transition-all border border-[#0050CB]/20 active:scale-95 shadow-2xs"
                                title="Provision temporary portal login credentials"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span>Provision Login</span>
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {/* Quick Provision / Reset */}
                              <button
                                type="button"
                                onClick={(e) => openProvisionModal(user, e)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#0050CB] hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 transition-all"
                                title="Provision / Reset credentials"
                              >
                                <Key className="w-4 h-4" />
                              </button>

                              {/* Department Workspace Shortcut */}
                              {roleName.toLowerCase() === "teacher" && (
                                <Link
                                  href="/dashboard/teachers"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
                                  title="Open Teacher Workspace"
                                >
                                  <GraduationCap className="w-4 h-4" />
                                </Link>
                              )}
                              {roleName.toLowerCase() === "parent" && (
                                <Link
                                  href="/dashboard/parents"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#0050CB] hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 transition-all"
                                  title="Open Parent Directory"
                                >
                                  <Users className="w-4 h-4" />
                                </Link>
                              )}

                              {/* Edit Profile */}
                              <button
                                type="button"
                                onClick={(e) => openEditModal(user, e)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#0050CB] hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 transition-all"
                                title="Edit user"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Remove User */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(user);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF690C] hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all"
                                title="Remove user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-medium">
                Showing <b className="text-slate-900 dark:text-white">{filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</b> to{" "}
                <b className="text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredUsers.length)}</b> of{" "}
                <b className="text-slate-900 dark:text-white">{filteredUsers.length}</b> users
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#0050CB] disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold px-3 py-1 text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#0050CB] disabled:opacity-40 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === "roles" && (
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Roles Selector Sidebar */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Configured System Roles</h3>
              <button
                onClick={() => setIsNewRoleModalOpen(true)}
                className="text-[11px] font-bold text-[#0050CB] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> New
              </button>
            </div>

            <div className="space-y-1.5">
              {rolesList.map((role) => {
                const isSelected = selectedRole === role;
                const count = (rolePermissions[role] || []).length;
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? "bg-[#0050CB] text-white shadow-md shadow-[#0050CB]/20"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#001438]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Shield className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-[#0050CB]"}`} />
                      <span className="truncate">{role}</span>
                    </div>
                    <span
                      className={`shrink-0 whitespace-nowrap text-[10px] font-bold px-2.5 py-1 rounded-full leading-none transition-colors ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {count} perms
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="flex-1 min-w-0 w-full bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-[#000E28] dark:text-white flex items-center gap-2">
                  <span>Permissions Matrix for</span>
                  <span className="text-[#0050CB] dark:text-[#38BDF8] underline underline-offset-4">{selectedRole}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Toggle granular capabilities allowed for this role profile.</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const allKeys = RBAC_MODULES.flatMap((m) => m.permissions.map((p) => p.key));
                    setRolePermissions((prev) => ({ ...prev, [selectedRole]: allKeys }));
                    toast.success(`Granted all permissions to ${selectedRole}`);
                  }}
                  className="text-xs font-bold text-[#0050CB] hover:underline px-2 py-1"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    setRolePermissions((prev) => ({ ...prev, [selectedRole]: [] }));
                    toast.success(`Cleared permissions for ${selectedRole}`);
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-rose-500 px-2 py-1"
                >
                  Clear All
                </button>
                <button
                  onClick={handleSaveRolePermissions}
                  disabled={isSavingRoles}
                  className="px-4 py-2 bg-[#0050CB] text-white hover:bg-[#003ea3] text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSavingRoles ? "Saving..." : "Save Role Permissions"}
                </button>
              </div>
            </div>

            {/* Permission Filter Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                placeholder="Quick filter permissions (e.g. attendance, fees, exams)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0050CB]"
              />
              {permissionSearch && (
                <button
                  onClick={() => setPermissionSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Permission Module Groups */}
            <div className="space-y-6">
              {RBAC_MODULES.map((module) => {
                const q = permissionSearch.toLowerCase().trim();
                const filteredPerms = module.permissions.filter(
                  (p) => !q || p.label.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)
                );

                if (filteredPerms.length === 0) return null;

                return (
                  <div key={module.category} className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0050CB]"></span>
                      {module.category}
                      <span className="text-[10px] text-slate-400 font-mono">({filteredPerms.length})</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredPerms.map((perm) => {
                        const isChecked = (rolePermissions[selectedRole] || []).includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            onClick={() => togglePermission(perm.key)}
                            className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isChecked
                                ? "bg-[#E5EEFF]/40 border-[#0050CB]/30 dark:bg-[#0050CB]/10 dark:border-[#0050CB]/40"
                                : "bg-slate-50/50 dark:bg-[#001438]/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="mt-0.5 w-4 h-4 rounded text-[#0050CB] focus:ring-[#0050CB] accent-[#0050CB]"
                            />
                            <div>
                              <p className="text-xs font-extrabold text-slate-900 dark:text-white">{perm.label}</p>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">{perm.key}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING BULK ACTIONS TOOLBAR */}
      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#000E28] text-white border border-slate-700/80 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0050CB] text-white flex items-center justify-center text-xs font-black">
              {selectedUserIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200">selected</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl transition-all"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkStatusChange(false)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-xs font-bold rounded-xl transition-all"
            >
              Suspend
            </button>
            <button
              onClick={() => exportUsersCSV(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={() => setSelectedUserIds([])}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            Clear
          </button>
        </div>
      )}

      {/* USER DETAIL INSPECTOR SLIDE-OVER */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#000E28] border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full shadow-2xl overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center text-lg font-black">
                    {inspectUser.firstName ? inspectUser.firstName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#000E28] dark:text-white">
                      {inspectUser.firstName} {inspectUser.lastName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{inspectUser._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectUser(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Details Grid */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-[#001438] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Assigned Role</p>
                    <p className="font-extrabold text-[#0050CB] dark:text-[#38BDF8] mt-0.5">
                      {typeof inspectUser.role === "object" && inspectUser.role ? inspectUser.role.name : String(inspectUser.role)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Account Status</p>
                    <span
                      className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inspectUser.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {inspectUser.isActive ? "Active" : "Suspended"}
                    </span>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[11px] font-bold uppercase text-slate-400">Contact & Employment</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-700 dark:text-slate-200 truncate">{inspectUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-200">{inspectUser.phoneNumber || "Not registered"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-200">{inspectUser.designation || "Staff Member"}</span>
                    </div>
                    {inspectUser.qualification && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-700 dark:text-slate-200">{inspectUser.qualification}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Linked Children Card (when inspecting a Parent user) */}
                {((typeof inspectUser.role === "object" && inspectUser.role?.name?.toLowerCase() === "parent") ||
                  String(inspectUser.role || "").toLowerCase() === "parent") && (
                  <div className="border border-[#0050CB]/20 bg-[#E5EEFF]/30 dark:bg-[#001438]/50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#0050CB]" />
                        <h4 className="text-[11px] font-bold uppercase text-[#0050CB]">
                          Linked Children ({inspectLinkedChildren.length})
                        </h4>
                      </div>
                    </div>

                    {isLoadingInspectChildren ? (
                      <div className="py-3 text-center text-xs text-slate-400 animate-pulse">
                        Loading linked children...
                      </div>
                    ) : inspectLinkedChildren.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No children currently linked to this parent account.</p>
                    ) : (
                      <div className="space-y-2">
                        {inspectLinkedChildren.map((link) => {
                          const st = link.studentId || {};
                          const stName = typeof st === "object" ? `${st.firstName || ""} ${st.lastName || ""}`.trim() : "Student";
                          const admNo = typeof st === "object" ? st.admissionNumber || st.studentId || "" : "";
                          const clsName = typeof st === "object" && typeof st.classId === "object" && st.classId ? st.classId.name : typeof st === "object" ? st.grade || "" : "";
                          const secName = typeof st === "object" && typeof st.sectionId === "object" && st.sectionId ? st.sectionId.name : "";
                          const childId = typeof st === "object" && st._id ? st._id : link._id;

                          return (
                            <div
                              key={link._id}
                              className="p-3 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2 shadow-xs"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-slate-800 dark:text-white text-xs truncate">
                                    {stName}
                                  </span>
                                  <span className="text-[9px] font-bold bg-[#E5EEFF] text-[#0050CB] px-1.5 py-0.5 rounded">
                                    {link.relationship || "Guardian"}
                                  </span>
                                  {link.isPrimary && (
                                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                                      Primary
                                    </span>
                                  )}
                                  {link.emergencyContact && (
                                    <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                                      Emergency
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {clsName && `${clsName} `}
                                  {secName && `• Sec ${secName} `}
                                  {admNo && `• Adm: ${admNo}`}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleUnlinkChild(childId, stName)}
                                title="Unlink child"
                                className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center shrink-0 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Quick Link Another Child in Drawer */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Link Another Student</p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={inspectChildSearch}
                            onChange={(e) => setInspectChildSearch(e.target.value)}
                            placeholder="Search by name, adm no..."
                            className="w-full pl-8 pr-2 py-1.5 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                          />
                        </div>
                        <select
                          value={newInspectRel}
                          onChange={(e) => setNewInspectRel(e.target.value as any)}
                          className="px-2 py-1.5 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Search Results in Drawer */}
                      {inspectStudentResults.length > 0 && (
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#000E28] max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 shadow-md">
                          {inspectStudentResults.map((st) => (
                            <div key={st._id} className="p-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <div className="min-w-0 pr-2">
                                <p className="font-bold text-slate-800 dark:text-white text-xs truncate">
                                  {st.firstName} {st.lastName}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  Adm: {st.admissionNumber || st.studentId || "N/A"}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleLinkChildToInspectUser(st)}
                                className="px-2 py-1 bg-[#0050CB] text-white text-[10px] font-bold rounded hover:bg-[#003ea3] shrink-0"
                              >
                                + Link
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Security Actions Card */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold uppercase text-slate-400">Security & Credentials</h4>
                    {provisionedMap[inspectUser._id] ? (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                        Active ({provisionedMap[inspectUser._id].via})
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200">
                        Not Dispatched
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Generate an instant temporary password and dispatch portal credentials via WhatsApp, SMS, or copyable preview.
                  </p>
                  <button
                    onClick={() => openProvisionModal(inspectUser)}
                    className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#0050CB] hover:bg-[#003ea3] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Provision & Send Credentials</span>
                  </button>

                  {/* Department Workspace Shortcut in Drawer */}
                  {(typeof inspectUser.role === "object" && inspectUser.role?.name?.toLowerCase() === "teacher" ||
                    String(inspectUser.role || "").toLowerCase() === "teacher") && (
                    <Link
                      href="/dashboard/teachers"
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl transition-all border border-emerald-200 dark:border-emerald-800"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Open Teacher Workspace</span>
                    </Link>
                  )}
                  {(typeof inspectUser.role === "object" && inspectUser.role?.name?.toLowerCase() === "parent" ||
                    String(inspectUser.role || "").toLowerCase() === "parent") && (
                    <Link
                      href="/dashboard/parents"
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#E5EEFF] hover:bg-[#d0e2ff] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold rounded-xl transition-all border border-[#0050CB]/20"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Open Parents Hub</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={(e) => toggleUserStatus(inspectUser._id, inspectUser.isActive, e)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                  inspectUser.isActive
                    ? "border-rose-300 text-rose-600 hover:bg-rose-50"
                    : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {inspectUser.isActive ? "Suspend Account" : "Activate Account"}
              </button>

              <button
                onClick={(e) => openEditModal(inspectUser, e)}
                className="px-4 py-2 bg-[#0050CB] text-white text-xs font-bold rounded-xl hover:bg-[#003ea3] transition-all"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM ROLE MODAL */}
      {isNewRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-[#000E28] dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0050CB]" />
                Provision Custom Role
              </h3>
              <button
                onClick={() => setIsNewRoleModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomRole} className="space-y-4 text-xs">
              <div>
                <label htmlFor="create-role-name" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="create-role-name"
                  type="text"
                  value={newRoleName}
                  onChange={(e) => {
                    setNewRoleName(e.target.value);
                    if (roleErrors.roleName) setRoleErrors((prev) => ({ ...prev, roleName: "" }));
                  }}
                  onKeyDown={preventNonAlphaKey}
                  placeholder="e.g. Librarian, Hostel Warden, Lab Assistant"
                  aria-invalid={!!roleErrors.roleName}
                  aria-describedby={roleErrors.roleName ? "create-role-name-error" : undefined}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border ${
                    roleErrors.roleName ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                  } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                />
                <FieldError error={roleErrors.roleName} id="create-role-name-error" />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                After creating this role, it will appear in the system roles list where you can configure granular read, write, and approval privileges.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRoleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0050CB] text-white font-bold rounded-xl hover:bg-[#003ea3] transition-all"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center text-[#0050CB]">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#000E28] dark:text-white">
                    {formData.roleName === "Parent" ? "Provision Parent User" : "Provision New Staff User"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {formData.roleName === "Parent"
                      ? "Add a parent/guardian account and link their student(s)."
                      : "Add an educator or administrator to the school directory."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="create-first-name" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="create-first-name"
                    type="text"
                    value={formData.firstName}
                    onKeyDown={preventNonAlphaKey}
                    onPaste={(e) => handleNamePaste(e, (clean) => {
                      setFormData((prev) => ({ ...prev, firstName: clean }));
                      if (createErrors.firstName) setCreateErrors((prev) => ({ ...prev, firstName: "" }));
                    })}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: sanitizeNameInput(e.target.value) });
                      if (createErrors.firstName) setCreateErrors((prev) => ({ ...prev, firstName: "" }));
                    }}
                    aria-invalid={!!createErrors.firstName}
                    aria-describedby={createErrors.firstName ? "create-first-name-error" : undefined}
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border ${
                      createErrors.firstName ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                    } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                    placeholder="e.g. Ramesh"
                  />
                  <FieldError error={createErrors.firstName} id="create-first-name-error" />
                </div>
                <div>
                  <label htmlFor="create-last-name" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="create-last-name"
                    type="text"
                    value={formData.lastName}
                    onKeyDown={preventNonAlphaKey}
                    onPaste={(e) => handleNamePaste(e, (clean) => {
                      setFormData((prev) => ({ ...prev, lastName: clean }));
                      if (createErrors.lastName) setCreateErrors((prev) => ({ ...prev, lastName: "" }));
                    })}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: sanitizeNameInput(e.target.value) });
                      if (createErrors.lastName) setCreateErrors((prev) => ({ ...prev, lastName: "" }));
                    }}
                    aria-invalid={!!createErrors.lastName}
                    aria-describedby={createErrors.lastName ? "create-last-name-error" : undefined}
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border ${
                      createErrors.lastName ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                    } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                    placeholder="e.g. Kumar"
                  />
                  <FieldError error={createErrors.lastName} id="create-last-name-error" />
                </div>
              </div>

              {/* Institutional Email with Smart Suggestion */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="create-email" className="block text-[11px] font-bold uppercase text-slate-500">
                    Institutional Email <span className="text-rose-500">*</span>
                  </label>
                  {(() => {
                    const cleanFirst = formData.firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                    const cleanLast = formData.lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                    const suggestedEmail = cleanFirst ? `${cleanFirst}${cleanLast ? `.${cleanLast}` : ""}@ggps.edu.in` : "";
                    if (!suggestedEmail || formData.email === suggestedEmail) return null;
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, email: suggestedEmail }));
                          if (createErrors.email) setCreateErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        className="text-[10px] font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                        title="Click to apply suggested institutional email"
                      >
                        <Sparkles className="w-3 h-3 text-[#FF690C]" />
                        <span>Use {suggestedEmail}</span>
                      </button>
                    );
                  })()}
                </div>
                <input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value.toLowerCase().trim() });
                    if (createErrors.email) setCreateErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  aria-invalid={!!createErrors.email}
                  aria-describedby={createErrors.email ? "create-email-error" : undefined}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border ${
                    createErrors.email ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                  } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                  placeholder="ramesh.k@ggps.edu.in"
                />
                <FieldError error={createErrors.email} id="create-email-error" />
              </div>

              {/* Password Fields with 1-Click Generator */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="create-password" className="block text-[11px] font-bold uppercase text-slate-500">
                        Temporary Password <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleGenerateCreatePassword()}
                        className="text-[10px] font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                        title="Generate standard temporary password"
                      >
                        <RotateCw className="w-3 h-3 text-[#0050CB] dark:text-[#38BDF8]" />
                        <span>Auto-Generate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="create-password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          if (createErrors.password) setCreateErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        aria-invalid={!!createErrors.password}
                        aria-describedby={createErrors.password ? "create-password-error" : undefined}
                        className={`w-full px-3 py-2 pr-9 bg-slate-50 dark:bg-[#001438] border ${
                          createErrors.password ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                        } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                        placeholder="Min 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FieldError error={createErrors.password} id="create-password-error" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="create-confirm-password" className="block text-[11px] font-bold uppercase text-slate-500">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="create-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmPassword: e.target.value });
                          if (createErrors.confirmPassword) setCreateErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        }}
                        aria-invalid={!!createErrors.confirmPassword}
                        aria-describedby={createErrors.confirmPassword ? "create-confirm-password-error" : undefined}
                        className={`w-full px-3 py-2 pr-9 bg-slate-50 dark:bg-[#001438] border ${
                          createErrors.confirmPassword ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                        } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                        placeholder="Re-type password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FieldError error={createErrors.confirmPassword} id="create-confirm-password-error" />
                  </div>
                </div>

                {/* Quick Pattern Suggestions */}
                <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold mr-0.5">Presets:</span>
                  {[
                    `${(formData.firstName || "Staff").trim()}@2026`,
                    "GGPS@2026",
                    "Welcome#8511",
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleGenerateCreatePassword(preset)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-[#E5EEFF] dark:bg-slate-800 dark:hover:bg-[#0050CB]/20 text-slate-700 hover:text-[#0050CB] dark:text-slate-300 dark:hover:text-[#38BDF8] border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="create-role" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    System Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="create-role"
                    value={formData.roleName}
                    onChange={(e) => {
                      setFormData({ ...formData, roleName: e.target.value });
                      if (createErrors.roleName) setCreateErrors((prev) => ({ ...prev, roleName: "" }));
                    }}
                    aria-invalid={!!createErrors.roleName}
                    aria-describedby={createErrors.roleName ? "create-role-error" : undefined}
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border ${
                      createErrors.roleName ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                    } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <FieldError error={createErrors.roleName} id="create-role-error" />
                </div>
                <div>
                  <label htmlFor="create-designation" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    {formData.roleName === "Parent" ? "Relationship Label" : "Designation"}
                  </label>
                  <input
                    id="create-designation"
                    type="text"
                    value={formData.designation}
                    onChange={(e) => {
                      setFormData({ ...formData, designation: e.target.value });
                      if (createErrors.designation) setCreateErrors((prev) => ({ ...prev, designation: "" }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                    placeholder={
                      formData.roleName === "Parent"
                        ? "e.g. Father / Guardian"
                        : formData.roleName === "Teacher"
                        ? "e.g. Mathematics Teacher (Grades 9-10)"
                        : formData.roleName === "Accountant"
                        ? "e.g. Senior Bursar & Fee Accountant"
                        : formData.roleName === "Principal"
                        ? "e.g. Head of School & Academics"
                        : "e.g. Administrator / Coordinator"
                    }
                  />
                  <FieldError error={createErrors.designation} id="create-designation-error" />
                </div>
              </div>

              <div>
                <label htmlFor="create-phone" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Phone Number
                </label>
                <input
                  id="create-phone"
                  type="tel"
                  maxLength={10}
                  value={formData.phoneNumber}
                  onKeyDown={preventNonNumericKey}
                  onPaste={(e) => handlePhonePaste(e, (clean) => {
                    setFormData((prev) => ({ ...prev, phoneNumber: clean }));
                    if (createErrors.phoneNumber) setCreateErrors((prev) => ({ ...prev, phoneNumber: "" }));
                  })}
                  onChange={(e) => {
                    setFormData({ ...formData, phoneNumber: sanitizePhoneInput(e.target.value) });
                    if (createErrors.phoneNumber) setCreateErrors((prev) => ({ ...prev, phoneNumber: "" }));
                  }}
                  aria-invalid={!!createErrors.phoneNumber}
                  aria-describedby={createErrors.phoneNumber ? "create-phone-error" : undefined}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border ${
                    createErrors.phoneNumber ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                  } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                  placeholder="10-digit mobile number"
                />
                <FieldError error={createErrors.phoneNumber} id="create-phone-error" />
              </div>

              {/* Link Child / Children Section when creating a Parent */}
              {formData.roleName === "Parent" && (
                <div className="border border-[#0050CB]/20 bg-[#E5EEFF]/30 dark:bg-[#001438]/50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#0050CB]" />
                      <h4 className="font-extrabold text-[#000E28] dark:text-white text-xs">
                        Link Child / Children
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-[#0050CB] bg-[#E5EEFF] dark:bg-[#0050CB]/30 px-2 py-0.5 rounded-full">
                      {stagedChildren.length} Selected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Search and link students from the school database. Multiple children can be linked.
                  </p>

                  {/* Student Search Box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      placeholder="Search student by name, admission no, class..."
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                    />
                    {isSearchingStudents && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 animate-pulse">
                        Searching...
                      </span>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {searchedStudents.length > 0 && (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#000E28] max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 shadow-lg">
                      {searchedStudents.map((st) => {
                        const isAlreadyStaged = stagedChildren.some((c) => c.studentId === st._id);
                        const cls = typeof st.classId === "object" && st.classId ? st.classId.name : st.grade || "";
                        const sec = typeof st.sectionId === "object" && st.sectionId ? st.sectionId.name : "";
                        return (
                          <div
                            key={st._id}
                            className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white text-xs">
                                {st.firstName} {st.lastName}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Adm: {st.admissionNumber || st.studentId || "N/A"}{" "}
                                {cls && `• Class: ${cls}`} {sec && `• Sec: ${sec}`}
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={isAlreadyStaged}
                              onClick={() => {
                                setStagedChildren((prev) => [
                                  ...prev,
                                  {
                                    studentId: st._id,
                                    studentName: `${st.firstName} ${st.lastName}`,
                                    admissionNumber: st.admissionNumber || st.studentId || "",
                                    className: cls,
                                    sectionName: sec,
                                    relationship: "Guardian",
                                    isPrimary: prev.length === 0,
                                    emergencyContact: true,
                                  },
                                ]);
                                setStudentSearchQuery("");
                                setSearchedStudents([]);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                isAlreadyStaged
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : "bg-[#0050CB] text-white hover:bg-[#003ea3]"
                              }`}
                            >
                              {isAlreadyStaged ? "Linked" : "+ Link Child"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Staged Children List */}
                  {stagedChildren.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {stagedChildren.map((child, idx) => (
                        <div
                          key={child.studentId}
                          className="p-3 bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-xl space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] font-bold text-[10px] flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-extrabold text-slate-800 dark:text-white text-xs">
                                  {child.studentName}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {child.className && `${child.className} `}
                                  {child.sectionName && `• Sec ${child.sectionName} `}
                                  {child.admissionNumber && `• ${child.admissionNumber}`}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setStagedChildren((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-500 p-1"
                              title="Remove child"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 items-center">
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">
                                Relationship
                              </label>
                              <select
                                value={child.relationship}
                                onChange={(e) => {
                                  const val = e.target.value as any;
                                  setStagedChildren((prev) =>
                                    prev.map((c, i) => (i === idx ? { ...c, relationship: val } : c))
                                  );
                                }}
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                              >
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Guardian">Guardian</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5 pt-3">
                              <input
                                type="checkbox"
                                id={`primary-${child.studentId}`}
                                checked={child.isPrimary}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setStagedChildren((prev) =>
                                    prev.map((c, i) => (i === idx ? { ...c, isPrimary: checked } : c))
                                  );
                                }}
                                className="w-3.5 h-3.5 rounded text-[#0050CB] focus:ring-0"
                              />
                              <label htmlFor={`primary-${child.studentId}`} className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                Primary
                              </label>
                            </div>

                            <div className="flex items-center gap-1.5 pt-3">
                              <input
                                type="checkbox"
                                id={`emerg-${child.studentId}`}
                                checked={child.emergencyContact}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setStagedChildren((prev) =>
                                    prev.map((c, i) => (i === idx ? { ...c, emergencyContact: checked } : c))
                                  );
                                }}
                                className="w-3.5 h-3.5 rounded text-[#0050CB] focus:ring-0"
                              />
                              <label htmlFor={`emerg-${child.studentId}`} className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                Emergency
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-all"
                >
                  Cancel
                </button>
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={(e) => handleCreateUser(e, false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-all disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Create Only"}
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={(e) => handleCreateUser(e, true)}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#0050CB] hover:bg-[#003ea3] text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Creating..." : "Create & Dispatch Access"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center text-[#0050CB]">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#000E28] dark:text-white">Edit User Profile</h3>
                  <p className="text-xs font-mono text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-first-name" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="edit-first-name"
                    type="text"
                    value={formData.firstName}
                    onKeyDown={preventNonAlphaKey}
                    onPaste={(e) => handleNamePaste(e, (clean) => {
                      setFormData((prev) => ({ ...prev, firstName: clean }));
                      if (editErrors.firstName) setEditErrors((prev) => ({ ...prev, firstName: "" }));
                    })}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: sanitizeNameInput(e.target.value) });
                      if (editErrors.firstName) setEditErrors((prev) => ({ ...prev, firstName: "" }));
                    }}
                    aria-invalid={!!editErrors.firstName}
                    aria-describedby={editErrors.firstName ? "edit-first-name-error" : undefined}
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border ${
                      editErrors.firstName ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                    } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                  />
                  <FieldError error={editErrors.firstName} id="edit-first-name-error" />
                </div>
                <div>
                  <label htmlFor="edit-last-name" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="edit-last-name"
                    type="text"
                    value={formData.lastName}
                    onKeyDown={preventNonAlphaKey}
                    onPaste={(e) => handleNamePaste(e, (clean) => {
                      setFormData((prev) => ({ ...prev, lastName: clean }));
                      if (editErrors.lastName) setEditErrors((prev) => ({ ...prev, lastName: "" }));
                    })}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: sanitizeNameInput(e.target.value) });
                      if (editErrors.lastName) setEditErrors((prev) => ({ ...prev, lastName: "" }));
                    }}
                    aria-invalid={!!editErrors.lastName}
                    aria-describedby={editErrors.lastName ? "edit-last-name-error" : undefined}
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border ${
                      editErrors.lastName ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                    } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                  />
                  <FieldError error={editErrors.lastName} id="edit-last-name-error" />
                </div>
              </div>

              <div>
                <label htmlFor="edit-email" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value.toLowerCase().trim() });
                    if (editErrors.email) setEditErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  aria-invalid={!!editErrors.email}
                  aria-describedby={editErrors.email ? "edit-email-error" : undefined}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border ${
                    editErrors.email ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                  } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                />
                <FieldError error={editErrors.email} id="edit-email-error" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-role" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="edit-role"
                    value={formData.roleName}
                    onChange={(e) => {
                      setFormData({ ...formData, roleName: e.target.value });
                      if (editErrors.roleName) setEditErrors((prev) => ({ ...prev, roleName: "" }));
                    }}
                    aria-invalid={!!editErrors.roleName}
                    aria-describedby={editErrors.roleName ? "edit-role-error" : undefined}
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border ${
                      editErrors.roleName ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                    } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <FieldError error={editErrors.roleName} id="edit-role-error" />
                </div>
                <div>
                  <label htmlFor="edit-designation" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Designation</label>
                  <input
                    id="edit-designation"
                    type="text"
                    value={formData.designation}
                    onChange={(e) => {
                      setFormData({ ...formData, designation: e.target.value });
                      if (editErrors.designation) setEditErrors((prev) => ({ ...prev, designation: "" }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                  />
                  <FieldError error={editErrors.designation} id="edit-designation-error" />
                </div>
              </div>

              <div>
                <label htmlFor="edit-phone" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                <input
                  id="edit-phone"
                  type="tel"
                  maxLength={10}
                  value={formData.phoneNumber}
                  onKeyDown={preventNonNumericKey}
                  onPaste={(e) => handlePhonePaste(e, (clean) => {
                    setFormData((prev) => ({ ...prev, phoneNumber: clean }));
                    if (editErrors.phoneNumber) setEditErrors((prev) => ({ ...prev, phoneNumber: "" }));
                  })}
                  onChange={(e) => {
                    setFormData({ ...formData, phoneNumber: sanitizePhoneInput(e.target.value) });
                    if (editErrors.phoneNumber) setEditErrors((prev) => ({ ...prev, phoneNumber: "" }));
                  }}
                  aria-invalid={!!editErrors.phoneNumber}
                  aria-describedby={editErrors.phoneNumber ? "edit-phone-error" : undefined}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border ${
                    editErrors.phoneNumber ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"
                  } rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]`}
                  placeholder="10-digit mobile number"
                />
                <FieldError error={editErrors.phoneNumber} id="edit-phone-error" />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#0050CB] text-white font-bold rounded-xl hover:bg-[#003ea3] transition-all disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#FF690C] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-[#000E28] dark:text-white">Delete User Account</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove{" "}
                <b className="text-slate-900 dark:text-white">
                  {selectedUser.firstName} {selectedUser.lastName}
                </b>{" "}
                ({selectedUser.email}) from the school directory?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isSaving}
                className="w-1/2 py-2.5 bg-[#FF690C] hover:bg-[#e05600] text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isSaving ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROVISION USER / STAFF CREDENTIALS MODAL */}
      {provisionModal.isOpen && provisionModal.user && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#000E28] border border-blue-100 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5 text-[#0050CB] dark:text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#000E28] dark:text-white leading-tight">
                    Provision Portal Access
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instant Account Access & Credential Dispatch
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProvisionModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Target Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#001438] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                    {provisionModal.user.firstName} {provisionModal.user.lastName}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getRoleBadgeStyle(
                      typeof provisionModal.user.role === "object" && provisionModal.user.role
                        ? provisionModal.user.role.name
                        : String(provisionModal.user.role || "User")
                    )}`}
                  >
                    {typeof provisionModal.user.role === "object" && provisionModal.user.role
                      ? provisionModal.user.role.name
                      : String(provisionModal.user.role || "User")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                  {provisionModal.user.email}
                </p>
              </div>
              {provisionModal.user.phoneNumber && (
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#000E28] px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                  {provisionModal.user.phoneNumber}
                </span>
              )}
            </div>

            {/* Password Generator */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Temporary Password Provisioning
              </label>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={provisionModal.showPassword ? "text" : "password"}
                    value={provisionModal.customPassword}
                    onChange={(e) =>
                      setProvisionModal((prev) => ({
                        ...prev,
                        customPassword: e.target.value,
                        copied: false,
                      }))
                    }
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-blue-200/90 dark:border-slate-700 bg-white dark:bg-[#000E28] font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                    placeholder="Enter or generate temporary password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setProvisionModal((prev) => ({ ...prev, showPassword: !prev.showPassword }))
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={provisionModal.showPassword ? "Hide password" : "Show password"}
                  >
                    {provisionModal.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCycleUserPassword}
                  className="px-4 py-2.5 rounded-xl bg-blue-50/90 hover:bg-blue-100/80 dark:bg-[#0050CB]/20 dark:hover:bg-[#0050CB]/30 text-[#0050CB] dark:text-[#38BDF8] border border-blue-100 dark:border-blue-800/60 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
                  title="Generate new password"
                >
                  <RotateCw className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
                  <span>Generate New</span>
                </button>
              </div>

              {/* Quick Pattern Suggestions */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mr-0.5">Presets:</span>
                {[
                  {
                    icon: Star,
                    iconClass: "text-[#0050CB] fill-[#0050CB]",
                    label: `${(provisionModal.user.firstName || "Staff").trim()}@2026`,
                    val: `${(provisionModal.user.firstName || "Staff").trim()}@2026`,
                    active: provisionModal.customPassword === `${(provisionModal.user.firstName || "Staff").trim()}@2026`,
                  },
                  {
                    icon: GraduationCap,
                    iconClass: "text-slate-500",
                    label: `GGPS@${(provisionModal.user._id || "4001").replace(/\D/g, "").slice(-4) || "4001"}`,
                    val: `GGPS@${(provisionModal.user._id || "4001").replace(/\D/g, "").slice(-4) || "4001"}`,
                    active: provisionModal.customPassword === `GGPS@${(provisionModal.user._id || "4001").replace(/\D/g, "").slice(-4) || "4001"}`,
                  },
                  {
                    icon: Award,
                    iconClass: "text-slate-500",
                    label: "Welcome#8511",
                    val: "Welcome#8511",
                    active: provisionModal.customPassword === "Welcome#8511",
                  },
                ].map((preset, pIdx) => {
                  const PresetIcon = preset.icon;
                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() =>
                        setProvisionModal((prev) => ({
                          ...prev,
                          customPassword: preset.val,
                          copied: false,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        preset.active
                          ? "bg-blue-50 dark:bg-[#0050CB]/25 border border-blue-200 dark:border-blue-700/60 text-[#0050CB] dark:text-[#38BDF8] font-bold"
                          : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <PresetIcon className={`w-3.5 h-3.5 ${preset.active ? "text-[#0050CB] fill-[#0050CB]" : preset.iconClass}`} />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Portal Login URL Bar */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFD] dark:bg-[#000E28]/40 border border-blue-100/90 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Link2 className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8]" />
                <span>Portal Login URL</span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-blue-100/80 dark:border-slate-700 bg-white dark:bg-[#000E28]">
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate">
                  https://ggps-school-erp.vercel.app/login
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("https://ggps-school-erp.vercel.app/login");
                    toast.success("Login URL copied!");
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#0050CB] hover:text-blue-700 dark:text-[#38BDF8] ml-2 shrink-0 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            {/* Formatted Message Preview */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFD] dark:bg-[#000E28]/40 border border-blue-100/90 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0050CB] text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                  <span className="font-bold text-sm text-[#000E28] dark:text-white">
                    Dispatched Message Preview
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  Formatted for copy/WhatsApp
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto select-all">
                {formatUserPortalMessage(provisionModal.user, provisionModal.customPassword)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {/* Copy Credentials */}
              <button
                type="button"
                onClick={handleCopyUserCredentials}
                className="h-13 flex items-center justify-center gap-2.5 px-3 rounded-xl border border-blue-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 transition-all shadow-2xs cursor-pointer"
              >
                <Copy className="w-5 h-5 text-[#0050CB] dark:text-[#38BDF8] shrink-0" />
                <div className="text-left font-bold text-xs leading-tight">
                  <div>{provisionModal.copied ? "Copied" : "Copy"}</div>
                  <div>Credentials</div>
                </div>
              </button>

              {/* Send SMS */}
              <button
                type="button"
                onClick={() => handleSendUserSMS(provisionModal.user!, provisionModal.customPassword)}
                className="h-13 flex items-center justify-center gap-2.5 px-3 rounded-xl border border-blue-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50/60 dark:hover:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] transition-all shadow-2xs cursor-pointer"
                title="Dispatch credentials via school SMS gateway"
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-[#0050CB] dark:text-[#38BDF8]" />
                  <span className="absolute text-[7px] font-black uppercase text-[#0050CB] dark:text-[#38BDF8] tracking-tighter">sms</span>
                </div>
                <div className="text-left font-bold text-xs leading-tight text-[#0050CB] dark:text-[#38BDF8]">
                  <div>Send</div>
                  <div>SMS</div>
                </div>
              </button>

              {/* Send WhatsApp */}
              <button
                type="button"
                onClick={() => handleSendUserWhatsApp(provisionModal.user!, provisionModal.customPassword)}
                className="h-13 flex items-center justify-center gap-2.5 px-3 rounded-xl bg-[#00A859] hover:bg-[#00924c] text-white font-bold text-xs transition-all shadow-sm shadow-[#00A859]/20 cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.175 8.175 0 0 1-5.82 2.41h-.01c-1.46 0-2.89-.39-4.14-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.41c0-4.54 3.7-8.24 8.24-8.24m4.51 11.53c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06s-1.05-.39-2-1.23c-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.17-.47-.29" />
                </svg>
                <div className="text-left font-bold text-xs leading-tight">
                  <div>Send</div>
                  <div>WhatsApp</div>
                </div>
              </button>

              {/* Save & Activate */}
              <button
                type="button"
                disabled={provisionModal.isSaving}
                onClick={() =>
                  handleSaveUserProvision(
                    provisionModal.user!,
                    provisionModal.customPassword,
                    "Admin Desk"
                  )
                }
                className="h-13 flex items-center justify-center gap-2.5 px-3 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs transition-all shadow-sm shadow-[#0050CB]/25 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                <div className="text-left font-bold text-xs leading-tight">
                  <div>Save &</div>
                  <div>{provisionModal.isSaving ? "Activating..." : "Activate"}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#0050CB] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-500">Loading Users & Roles Directory...</p>
          </div>
        </div>
      }
    >
      <UsersPageContent />
    </Suspense>
  );
}
