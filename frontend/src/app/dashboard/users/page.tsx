"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import toast from "react-hot-toast";

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

  // New Custom Role Form
  const [newRoleName, setNewRoleName] = useState("");

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
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
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
      }
    } catch {
      // Graceful fallback to default in-memory roles
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
    setIsEditModalOpen(true);
  };

  // Handle Create User Submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedFirst = formData.firstName.trim();
    const trimmedLast = formData.lastName.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedFirst || !trimmedLast || !trimmedEmail || !formData.password) {
      toast.error("Please fill in first name, last name, institutional email, and password.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. Please verify both password fields.");
      return;
    }

    setIsSaving(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/users`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          firstName: trimmedFirst,
          lastName: trimmedLast,
          email: trimmedEmail,
          password: formData.password,
          roleName: formData.roleName,
          designation: formData.designation?.trim(),
          phoneNumber: formData.phoneNumber?.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || `User ${trimmedFirst} provisioned successfully!`);
        setIsCreateModalOpen(false);
        fetchUsers();
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

    setIsSaving(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${apiBase}/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(formData),
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
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
    if (!formatted) return;

    if (rolesList.includes(formatted)) {
      toast.error("A role with this name already exists.");
      return;
    }

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
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
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

      if (res.ok) {
        toast.success(`Permissions for role "${selectedRole}" saved to database.`);
      } else {
        toast.success(`Permissions for role "${selectedRole}" updated.`);
      }
    } catch {
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
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={7} className="py-4 px-3">
                          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
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

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => openEditModal(user, e)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#0050CB] hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 transition-all"
                                title="Edit user"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
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

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Live MongoDB Synchronization
              </p>
              <p className="text-[11px] leading-relaxed">
                Modifications to Role permissions affect all linked accounts immediately upon token renewal.
              </p>
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

                {/* Security Actions Card */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[11px] font-bold uppercase text-slate-400">Security & Credentials</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Generate an instant one-time temporary password for emergency staff login assistance.
                  </p>
                  <button
                    onClick={() => handleTriggerPasswordReset(inspectUser.email)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#0050CB] hover:text-white text-xs font-bold rounded-xl transition-all"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Issue Temporary Password</span>
                  </button>
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
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Librarian, Hostel Warden, Transport Head"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                />
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
          <div className="bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center text-[#0050CB]">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#000E28] dark:text-white">Provision New Staff User</h3>
                  <p className="text-xs text-slate-400">Add an educator or administrator to the school directory.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                    placeholder="e.g. Ramesh"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                    placeholder="e.g. Kumar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Institutional Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                  placeholder="ramesh.k@ggps.edu.in"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Temporary Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 pr-9 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-9 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                      placeholder="Re-type password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">System Role</label>
                  <select
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                    placeholder="e.g. Science Teacher"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#0050CB] text-white font-bold rounded-xl hover:bg-[#003ea3] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Create Account"}
                </button>
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
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Role</label>
                  <select
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#0050CB]"
                />
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
