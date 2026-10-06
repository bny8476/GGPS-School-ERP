"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  User,
  Shield,
  KeyRound,
  Bell,
  Sliders,
  Save,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  UserCircle,
  MapPin,
  Calendar,
  Coins,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { FieldError } from '@/components/ui/FieldError';
import {
  InstitutionalSettingsSchema,
  ProfileUpdateSchema,
  PasswordChangeSchema,
} from '@/schemas';
import {
  preventNonAlphaKey,
  preventNonNumericKey,
  sanitizeNameInput,
  sanitizePhoneInput,
  handleNamePaste,
  handlePhonePaste,
} from '@/lib/validationUtils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'security' | 'notifications' | 'permissions'>('general');
  const [isLoading, setIsLoading] = useState(true);

  // Form error states
  const [generalErrors, setGeneralErrors] = useState<Record<string, string>>({});
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Current Logged-in User
  const [user, setUser] = useState<any>(null);

  // Tab 1: Institutional General Settings
  const [generalSettings, setGeneralSettings] = useState({
    schoolName: 'GGPS School',
    schoolTagline: 'Excellence in Holistic Education',
    schoolEmail: 'admin@ggps.edu.in',
    schoolPhone: '+91 (800) 555-GGPS',
    schoolAddress: 'GGPS Main Campus, Sector 4, Knowledge City',
    academicYear: '2026-2027',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en',
    enableSMS: true,
    enableEmailNotifications: true,
  });
  const [isGeneralSaving, setIsGeneralSaving] = useState(false);

  // Tab 2: Personal Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Tab 3: Security & Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  // Tab 5: Role & Permissions Management State
  const [roles, setRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [defaultRolePermissions, setDefaultRolePermissions] = useState<Record<string, string[]>>({});
  const [selectedRole, setSelectedRole] = useState<string>('Teacher');
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([]);
  const [isRolesLoading, setIsRolesLoading] = useState(false);
  const [isRoleSaving, setIsRoleSaving] = useState(false);
  const [permissionFilter, setPermissionFilter] = useState('');

  // Fetch Institutional System Settings
  const fetchSystemSettings = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/settings`, {
        headers,
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setGeneralSettings({
            schoolName: json.data.schoolName || 'GGPS School',
            schoolTagline: json.data.schoolTagline || 'Excellence in Holistic Education',
            schoolEmail: json.data.schoolEmail || 'admin@ggps.edu.in',
            schoolPhone: json.data.schoolPhone || '+91 (800) 555-GGPS',
            schoolAddress: json.data.schoolAddress || 'GGPS Main Campus, Sector 4, Knowledge City',
            academicYear: json.data.academicYear || '2026-2027',
            currency: json.data.currency || 'INR',
            timezone: json.data.timezone || 'Asia/Kolkata',
            language: json.data.language || 'en',
            enableSMS: json.data.enableSMS ?? true,
            enableEmailNotifications: json.data.enableEmailNotifications ?? true,
          });
        }
      }
    } catch (e) {
      console.warn('Could not load institutional settings:', e);
    }
  };

  // Fetch Current User Profile
  const fetchProfile = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/auth/profile`, {
        headers,
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Roles for RBAC
  const fetchRoles = async () => {
    setIsRolesLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/v1/roles`, {
        headers,
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles || []);
        setAllPermissions(data.allPermissions || []);
        setDefaultRolePermissions(data.defaultRolePermissions || {});
        const initial = data.roles?.find((r: any) => r.name === selectedRole) || data.roles?.[0];
        if (initial) {
          setSelectedRole(initial.name);
          setSelectedRolePermissions(initial.permissions || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    } finally {
      setIsRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemSettings();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'permissions') {
      fetchRoles();
    }
  }, [activeTab]);

  // Handler: Save Institutional General Settings
  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = InstitutionalSettingsSchema.safeParse(generalSettings);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : 'general';
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setGeneralErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || 'Please fix settings errors');
      return;
    }
    setGeneralErrors({});

    setIsGeneralSaving(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/settings`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(generalSettings),
      });

      if (res.ok) {
        toast.success('Institutional General Settings updated successfully!');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to update school settings.');
      }
    } catch (err) {
      toast.error('Network error saving school settings.');
    } finally {
      setIsGeneralSaving(false);
    }
  };

  // Handler: Save Personal Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = ProfileUpdateSchema.safeParse({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phoneNumber: profileData.phoneNumber || undefined,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : 'general';
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setProfileErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || 'Please fix profile errors');
      return;
    }
    setProfileErrors({});

    setIsProfileSaving(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/auth/profile`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser(updated.data || updated);
        toast.success('Personal profile updated successfully!');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to update profile.');
      }
    } catch (error) {
      toast.error('A network error occurred. Please try again.');
    } finally {
      setIsProfileSaving(false);
    }
  };

  // Handler: Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = PasswordChangeSchema.safeParse(passwordData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : 'general';
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setPasswordErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || 'Please fix password errors');
      return;
    }
    setPasswordErrors({});

    setIsPasswordSaving(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/auth/change-password`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Failed to update password.');
      }
    } catch (err) {
      toast.error('Network error changing password.');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  // RBAC Role Selection & Modification
  const handleSelectRole = (roleName: string) => {
    setSelectedRole(roleName);
    const found = roles.find((r) => r.name === roleName);
    if (found) {
      setSelectedRolePermissions(found.permissions || []);
    } else if (defaultRolePermissions[roleName]) {
      setSelectedRolePermissions(defaultRolePermissions[roleName]);
    } else {
      setSelectedRolePermissions([]);
    }
  };

  const togglePermission = (perm: string) => {
    setSelectedRolePermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleResetToDefaults = () => {
    if (defaultRolePermissions[selectedRole]) {
      setSelectedRolePermissions([...defaultRolePermissions[selectedRole]]);
      toast.success(`Restored standard default permissions for ${selectedRole}. Click 'Save Role Permissions' to persist.`);
    }
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return;
    setIsRoleSaving(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/v1/roles/${selectedRole}/permissions`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ permissions: selectedRolePermissions }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Permissions for role "${selectedRole}" updated and persisted!`);
        setRoles((prev) =>
          prev.map((r) => (r.name === selectedRole ? { ...r, permissions: selectedRolePermissions } : r))
        );
      } else {
        toast.error(data.message || 'Failed to update permissions');
      }
    } catch (err) {
      toast.error('Network error saving role permissions');
    } finally {
      setIsRoleSaving(false);
    }
  };

  const permissionCategories: Record<string, string[]> = {
    'Students & Parents': allPermissions.filter(
      (p) => p.startsWith('students:') || p.startsWith('parents:') || p.startsWith('child:')
    ),
    'Teachers & Staff': allPermissions.filter((p) => p.startsWith('teachers:') || p.startsWith('profile:')),
    'Academics & Curriculum': allPermissions.filter((p) => p.startsWith('academics:') || p.startsWith('timetable:')),
    Attendance: allPermissions.filter((p) => p.startsWith('attendance:')),
    Admissions: allPermissions.filter((p) => p.startsWith('admissions:')),
    'Finance & Payroll': allPermissions.filter(
      (p) => p.startsWith('finance:') || p.startsWith('fees:') || p.startsWith('payroll:')
    ),
    'Classroom & Learning': allPermissions.filter(
      (p) =>
        p.startsWith('activities:') ||
        p.startsWith('diary:') ||
        p.startsWith('homework:') ||
        p.startsWith('assessments:')
    ),
    'Communication & Messages': allPermissions.filter(
      (p) => p.startsWith('announcements:') || p.startsWith('notifications:') || p.startsWith('messages:')
    ),
    'Operations & System Admin': allPermissions.filter(
      (p) => p.startsWith('visitors:') || p.startsWith('reports:') || p.startsWith('settings:') || p === '*'
    ),
  };

  const userRole = (typeof user?.role === 'string' ? user.role : user?.role?.name || '').toLowerCase();
  const isSuperAdminOrAdmin = ['superadmin', 'admin'].includes(userRole);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32 text-slate-500">
        <div className="animate-spin h-10 w-10 border-4 border-[#0050CB]/20 border-t-[#0050CB] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] uppercase tracking-wider">
              Administration
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              System Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white tracking-tight">
            Settings & System Governance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Configure institutional profile, manage personal security, and set role-based access controls.
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-[#07152F] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[680px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50/80 dark:bg-[#000E28]/60 border-r border-slate-200 dark:border-slate-800 p-5 space-y-1.5 flex-shrink-0">
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Institution
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center px-3.5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-white dark:bg-[#001438] text-[#0050CB] dark:text-[#38BDF8] shadow-xs border border-slate-200/90 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="h-4.5 w-4.5 mr-3 text-[#0050CB] dark:text-[#38BDF8] shrink-0" />
            <span>General Settings</span>
          </button>

          <div className="pt-3 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Account & Security
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center px-3.5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-[#001438] text-[#0050CB] dark:text-[#38BDF8] shadow-xs border border-slate-200/90 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <User className="h-4.5 w-4.5 mr-3 text-[#0050CB] dark:text-[#38BDF8] shrink-0" />
            <span>Personal Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center px-3.5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white dark:bg-[#001438] text-[#0050CB] dark:text-[#38BDF8] shadow-xs border border-slate-200/90 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Shield className="h-4.5 w-4.5 mr-3 text-[#0050CB] dark:text-[#38BDF8] shrink-0" />
            <span>Security & Password</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center px-3.5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-[#001438] text-[#0050CB] dark:text-[#38BDF8] shadow-xs border border-slate-200/90 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Bell className="h-4.5 w-4.5 mr-3 text-[#0050CB] dark:text-[#38BDF8] shrink-0" />
            <span>Notifications</span>
          </button>

          {/* Admin Role Guarded Tab */}
          {isSuperAdminOrAdmin && (
            <>
              <div className="pt-3 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Governance
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('permissions')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  activeTab === 'permissions'
                    ? 'bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] shadow-xs border border-[#0050CB]/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center">
                  <Sliders className="h-4.5 w-4.5 mr-3 text-[#0050CB] dark:text-[#38BDF8] shrink-0" />
                  <span>Roles & Access</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF690C] text-white font-black">
                  RBAC
                </span>
              </button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* TAB 1: Institutional General Settings */}
          {activeTab === 'general' && (
            <div className="max-w-3xl animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white">
                    School Profile & General Configuration
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Configure institutional identity, default currency, academic calendar year, and public contact channels.
                  </p>
                </div>
                <div className="hidden sm:flex w-10 h-10 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      School Legal Name <span className="text-[#FF690C]">*</span>
                    </label>
                    <input
                      type="text"
                      id="gen-schoolName"
                      value={generalSettings.schoolName}
                      onChange={(e) => {
                        setGeneralSettings({ ...generalSettings, schoolName: e.target.value });
                        if (generalErrors.schoolName) setGeneralErrors(prev => ({ ...prev, schoolName: '' }));
                      }}
                      required
                      aria-invalid={Boolean(generalErrors.schoolName)}
                      aria-describedby={generalErrors.schoolName ? "gen-schoolName-err" : undefined}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none transition-colors ${
                        generalErrors.schoolName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                      }`}
                      placeholder="e.g. Global Guru Shanti Public School (GGPS)"
                    />
                    <FieldError id="gen-schoolName-err" error={generalErrors.schoolName} />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      Motto / Tagline
                    </label>
                    <input
                      type="text"
                      id="gen-schoolTagline"
                      value={generalSettings.schoolTagline}
                      onChange={(e) => {
                        setGeneralSettings({ ...generalSettings, schoolTagline: e.target.value });
                        if (generalErrors.schoolTagline) setGeneralErrors(prev => ({ ...prev, schoolTagline: '' }));
                      }}
                      aria-invalid={Boolean(generalErrors.schoolTagline)}
                      aria-describedby={generalErrors.schoolTagline ? "gen-schoolTagline-err" : undefined}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none transition-colors"
                      placeholder="e.g. Excellence in Holistic Education & Character"
                    />
                    <FieldError id="gen-schoolTagline-err" error={generalErrors.schoolTagline} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      Official Contact Email <span className="text-[#FF690C]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        id="gen-schoolEmail"
                        value={generalSettings.schoolEmail}
                        onChange={(e) => {
                          setGeneralSettings({ ...generalSettings, schoolEmail: e.target.value });
                          if (generalErrors.schoolEmail) setGeneralErrors(prev => ({ ...prev, schoolEmail: '' }));
                        }}
                        required
                        aria-invalid={Boolean(generalErrors.schoolEmail)}
                        aria-describedby={generalErrors.schoolEmail ? "gen-schoolEmail-err" : undefined}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none transition-colors ${
                          generalErrors.schoolEmail ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                        }`}
                        placeholder="contact@ggps.edu.in"
                      />
                    </div>
                    <FieldError id="gen-schoolEmail-err" error={generalErrors.schoolEmail} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      Reception Phone Number <span className="text-[#FF690C]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        id="gen-schoolPhone"
                        value={generalSettings.schoolPhone}
                        onChange={(e) => {
                          setGeneralSettings({ ...generalSettings, schoolPhone: e.target.value });
                          if (generalErrors.schoolPhone) setGeneralErrors(prev => ({ ...prev, schoolPhone: '' }));
                        }}
                        required
                        aria-invalid={Boolean(generalErrors.schoolPhone)}
                        aria-describedby={generalErrors.schoolPhone ? "gen-schoolPhone-err" : undefined}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none transition-colors ${
                          generalErrors.schoolPhone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                        }`}
                        placeholder="+91 (800) 555-GGPS"
                      />
                    </div>
                    <FieldError id="gen-schoolPhone-err" error={generalErrors.schoolPhone} />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      Primary Campus Address <span className="text-[#FF690C]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        id="gen-schoolAddress"
                        value={generalSettings.schoolAddress}
                        onChange={(e) => {
                          setGeneralSettings({ ...generalSettings, schoolAddress: e.target.value });
                          if (generalErrors.schoolAddress) setGeneralErrors(prev => ({ ...prev, schoolAddress: '' }));
                        }}
                        required
                        aria-invalid={Boolean(generalErrors.schoolAddress)}
                        aria-describedby={generalErrors.schoolAddress ? "gen-schoolAddress-err" : undefined}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none transition-colors ${
                          generalErrors.schoolAddress ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                        }`}
                        placeholder="Main Campus, Sector 4, Institutional Area"
                      />
                    </div>
                    <FieldError id="gen-schoolAddress-err" error={generalErrors.schoolAddress} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      Active Academic Year
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <select
                        value={generalSettings.academicYear}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, academicYear: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="2025-2026">AY 2025 – 2026</option>
                        <option value="2026-2027">AY 2026 – 2027 (Active)</option>
                        <option value="2027-2028">AY 2027 – 2028</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      Operational Currency
                    </label>
                    <div className="relative">
                      <Coins className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <select
                        value={generalSettings.currency}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="INR">INR (₹ Indian Rupee)</option>
                        <option value="USD">USD ($ United States Dollar)</option>
                        <option value="EUR">EUR (€ Euro)</option>
                        <option value="GBP">GBP (£ British Pound)</option>
                        <option value="AED">AED (د.إ UAE Dirham)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      System Timezone
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                        <option value="UTC">UTC (Universal Coordinated Time)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
                        <option value="America/New_York">America/New_York (EST - UTC-05:00)</option>
                        <option value="Europe/London">Europe/London (GMT - UTC+00:00)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isGeneralSaving}
                    className="bg-[#0050CB] hover:bg-[#003d99] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-[#0050CB]/20 flex items-center disabled:opacity-70 cursor-pointer"
                  >
                    {isGeneralSaving ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save General Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Personal Profile */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-18 w-18 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/30 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center font-black text-2xl border-2 border-white dark:border-slate-700 shadow-md mr-5">
                  {user?.firstName?.[0] || 'A'}
                  {user?.lastName?.[0] || 'D'}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs mt-0.5">
                    {user?.role?.name || user?.role || 'Administrator'} • Active Staff Account
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      First Name <span className="text-[#FF690C]">*</span>
                    </label>
                    <div className="relative">
                      <UserCircle className="h-5 w-5 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        id="prof-firstName"
                        onKeyDown={preventNonAlphaKey}
                        onPaste={(e) => handleNamePaste(e, (clean) => {
                          setProfileData(prev => ({ ...prev, firstName: clean }));
                          if (profileErrors.firstName) setProfileErrors(prev => ({ ...prev, firstName: '' }));
                        })}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0050CB] focus:outline-none text-[#000E28] dark:text-white transition-colors ${
                          profileErrors.firstName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                        }`}
                        value={profileData.firstName}
                        onChange={(e) => {
                          setProfileData({ ...profileData, firstName: sanitizeNameInput(e.target.value) });
                          if (profileErrors.firstName) setProfileErrors(prev => ({ ...prev, firstName: '' }));
                        }}
                        aria-invalid={Boolean(profileErrors.firstName)}
                        aria-describedby={profileErrors.firstName ? "prof-firstName-err" : undefined}
                        required
                      />
                    </div>
                    <FieldError id="prof-firstName-err" error={profileErrors.firstName} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      Last Name <span className="text-[#FF690C]">*</span>
                    </label>
                    <div className="relative">
                      <UserCircle className="h-5 w-5 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        id="prof-lastName"
                        onKeyDown={preventNonAlphaKey}
                        onPaste={(e) => handleNamePaste(e, (clean) => {
                          setProfileData(prev => ({ ...prev, lastName: clean }));
                          if (profileErrors.lastName) setProfileErrors(prev => ({ ...prev, lastName: '' }));
                        })}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0050CB] focus:outline-none text-[#000E28] dark:text-white transition-colors ${
                          profileErrors.lastName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                        }`}
                        value={profileData.lastName}
                        onChange={(e) => {
                          setProfileData({ ...profileData, lastName: sanitizeNameInput(e.target.value) });
                          if (profileErrors.lastName) setProfileErrors(prev => ({ ...prev, lastName: '' }));
                        }}
                        aria-invalid={Boolean(profileErrors.lastName)}
                        aria-describedby={profileErrors.lastName ? "prof-lastName-err" : undefined}
                        required
                      />
                    </div>
                    <FieldError id="prof-lastName-err" error={profileErrors.lastName} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      Email Address <span className="text-[#FF690C]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="h-5 w-5 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="email"
                        id="prof-email"
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0050CB] focus:outline-none text-[#000E28] dark:text-white transition-colors ${
                          profileErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                        }`}
                        value={profileData.email}
                        onChange={(e) => {
                          setProfileData({ ...profileData, email: e.target.value });
                          if (profileErrors.email) setProfileErrors(prev => ({ ...prev, email: '' }));
                        }}
                        aria-invalid={Boolean(profileErrors.email)}
                        aria-describedby={profileErrors.email ? "prof-email-err" : undefined}
                        required
                      />
                    </div>
                    <FieldError id="prof-email-err" error={profileErrors.email} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      Direct Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="h-5 w-5 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="tel"
                        id="prof-phone"
                        onKeyDown={preventNonNumericKey}
                        onPaste={(e) => handlePhonePaste(e, (clean) => {
                          setProfileData(prev => ({ ...prev, phoneNumber: clean }));
                          if (profileErrors.phoneNumber) setProfileErrors(prev => ({ ...prev, phoneNumber: '' }));
                        })}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0050CB] focus:outline-none text-[#000E28] dark:text-white transition-colors font-mono ${
                          profileErrors.phoneNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                        }`}
                        value={profileData.phoneNumber}
                        onChange={(e) => {
                          setProfileData({ ...profileData, phoneNumber: sanitizePhoneInput(e.target.value) });
                          if (profileErrors.phoneNumber) setProfileErrors(prev => ({ ...prev, phoneNumber: '' }));
                        }}
                        aria-invalid={Boolean(profileErrors.phoneNumber)}
                        aria-describedby={profileErrors.phoneNumber ? "prof-phone-err" : undefined}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <FieldError id="prof-phone-err" error={profileErrors.phoneNumber} />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isProfileSaving}
                    className="bg-[#0050CB] hover:bg-[#003d99] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-[#0050CB]/20 flex items-center disabled:opacity-70 cursor-pointer"
                  >
                    {isProfileSaving ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Security & Password */}
          {activeTab === 'security' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white">
                  Security & Authentication
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Update your credentials and review account security protections.
                </p>
              </div>

              {/* Inline Password Change Form */}
              <div className="bg-slate-50/70 dark:bg-[#000E28]/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <KeyRound className="w-5 h-5 text-[#0050CB] dark:text-[#38BDF8]" />
                  <h3 className="font-black text-[#000E28] dark:text-white text-base">
                    Change Password
                  </h3>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      Current Password <span className="text-[#FF690C]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="pwd-current"
                        value={passwordData.currentPassword}
                        onChange={(e) => {
                          setPasswordData({ ...passwordData, currentPassword: e.target.value });
                          if (passwordErrors.currentPassword) setPasswordErrors(prev => ({ ...prev, currentPassword: '' }));
                        }}
                        required
                        aria-invalid={Boolean(passwordErrors.currentPassword)}
                        aria-describedby={passwordErrors.currentPassword ? "pwd-current-err" : undefined}
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none ${
                          passwordErrors.currentPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FieldError id="pwd-current-err" error={passwordErrors.currentPassword} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        New Password <span className="text-[#FF690C]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="pwd-new"
                          value={passwordData.newPassword}
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, newPassword: e.target.value });
                            if (passwordErrors.newPassword) setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                          }}
                          required
                          aria-invalid={Boolean(passwordErrors.newPassword)}
                          aria-describedby={passwordErrors.newPassword ? "pwd-new-err" : undefined}
                          className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none ${
                            passwordErrors.newPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                          }`}
                          placeholder="Min 6 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <FieldError id="pwd-new-err" error={passwordErrors.newPassword} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        Confirm New Password <span className="text-[#FF690C]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="pwd-confirm"
                          value={passwordData.confirmPassword}
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                            if (passwordErrors.confirmPassword) setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                          }}
                          required
                          aria-invalid={Boolean(passwordErrors.confirmPassword)}
                          aria-describedby={passwordErrors.confirmPassword ? "pwd-confirm-err" : undefined}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium text-[#000E28] dark:text-white focus:ring-2 focus:ring-[#0050CB] focus:outline-none ${
                            passwordErrors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                          }`}
                          placeholder="Repeat new password"
                        />
                      </div>
                      <FieldError id="pwd-confirm-err" error={passwordErrors.confirmPassword} />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isPasswordSaving}
                      className="bg-[#0050CB] hover:bg-[#003d99] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-[#0050CB]/20 flex items-center disabled:opacity-70 cursor-pointer"
                    >
                      {isPasswordSaving ? (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      ) : (
                        <Save className="h-3.5 w-3.5 mr-2" />
                      )}
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Status Cards */}
              <div className="space-y-4">
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex justify-between items-center bg-white dark:bg-[#07152F] shadow-xs">
                  <div>
                    <h4 className="font-bold text-[#000E28] dark:text-white text-sm">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Add biometric or authenticator OTP protection to your sign-in workflow.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/security"
                    className="px-4 py-2 bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold rounded-xl hover:bg-[#0050CB] hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    Setup 2FA
                  </Link>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex justify-between items-center bg-white dark:bg-[#07152F] shadow-xs">
                  <div>
                    <h4 className="font-bold text-[#000E28] dark:text-white text-sm">Active Login Sessions</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Review browsers and IP addresses authenticated to this portal account.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/security"
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                  >
                    Manage Sessions
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Notifications */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white">
                  Notification Dispatch Preferences
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Configure live alert delivery channels and automated institutional dispatch.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#07152F] cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="pr-4">
                    <span className="block font-bold text-sm text-[#000E28] dark:text-white">
                      Automated Email Notifications
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Send automated email confirmations for admission inquiries, fee receipts, and staff leave updates.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalSettings.enableEmailNotifications}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, enableEmailNotifications: e.target.checked })
                    }
                    className="h-5 w-5 text-[#0050CB] rounded border-slate-300 dark:border-slate-600 focus:ring-[#0050CB] cursor-pointer mt-0.5"
                  />
                </label>

                <label className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#07152F] cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="pr-4">
                    <span className="block font-bold text-sm text-[#000E28] dark:text-white">
                      SMS & Gateway Alerts
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Trigger direct SMS broadcasts to parent mobile numbers for attendance roll-call and emergency notices.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalSettings.enableSMS}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, enableSMS: e.target.checked })
                    }
                    className="h-5 w-5 text-[#0050CB] rounded border-slate-300 dark:border-slate-600 focus:ring-[#0050CB] cursor-pointer mt-0.5"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveGeneralSettings}
                  disabled={isGeneralSaving}
                  className="bg-[#0050CB] hover:bg-[#003d99] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-[#0050CB]/20 flex items-center disabled:opacity-70 cursor-pointer"
                >
                  {isGeneralSaving ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notification Channels
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Role-Based Access Control (RBAC) */}
          {activeTab === 'permissions' && isSuperAdminOrAdmin && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white">
                    Role-Based Access Control (RBAC)
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-1">
                    Manage granular system permissions for each ERP role using the unified permission taxonomy.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetToDefaults}
                    type="button"
                    className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Reset to Defaults
                  </button>
                  <button
                    onClick={handleSaveRolePermissions}
                    disabled={isRoleSaving}
                    type="button"
                    className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0050CB] hover:bg-[#003d99] shadow-md shadow-[#0050CB]/20 transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {isRoleSaving ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Role Permissions
                  </button>
                </div>
              </div>

              {/* Role Selection Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  'SuperAdmin',
                  'Admin',
                  'Principal',
                  'Teacher',
                  'Parent',
                  'Accountant',
                  'Receptionist',
                  'Staff',
                ].map((roleName) => {
                  const isSelected = selectedRole === roleName;
                  return (
                    <button
                      key={roleName}
                      type="button"
                      onClick={() => handleSelectRole(roleName)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0050CB] text-white shadow-md shadow-[#0050CB]/25'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {roleName}
                      {isSelected && (
                        <span className="ml-2 px-1.5 py-0.5 text-[9px] rounded-full bg-white/20 text-white font-black">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Permission Search Bar */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter permissions (e.g. students, fees, attendance)..."
                  value={permissionFilter}
                  onChange={(e) => setPermissionFilter(e.target.value.toLowerCase())}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-[#0050CB] focus:outline-none bg-slate-50 dark:bg-slate-800 text-[#000E28] dark:text-white transition-colors"
                />
              </div>

              {/* Selected Role Summary Card */}
              <div className="bg-[#E5EEFF]/60 dark:bg-[#0050CB]/15 border border-[#0050CB]/20 dark:border-[#0050CB]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-[#000E28] dark:text-white text-sm sm:text-base">
                    Editing Permissions for: <span className="text-[#0050CB] dark:text-[#38BDF8]">{selectedRole}</span>
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">
                    {selectedRolePermissions.includes('*')
                      ? 'Full system wildcard (*) active — All administrative capabilities granted'
                      : `${selectedRolePermissions.length} active permissions granted`}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedRolePermissions(allPermissions)}
                    className="font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedRolePermissions([])}
                    className="font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Grouped Permission Categories */}
              {isRolesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-6 w-6 border-3 border-[#0050CB]/30 border-t-[#0050CB] rounded-full" />
                </div>
              ) : (
                <div className="space-y-5">
                  {Object.entries(permissionCategories).map(([category, perms]) => {
                    const filteredPerms = perms.filter(
                      (p) => !permissionFilter || p.toLowerCase().includes(permissionFilter)
                    );
                    if (filteredPerms.length === 0) return null;

                    const grantedCount = filteredPerms.filter(
                      (p) => selectedRolePermissions.includes(p) || selectedRolePermissions.includes('*')
                    ).length;

                    return (
                      <div
                        key={category}
                        className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-[#07152F] shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="font-black text-[#000E28] dark:text-white text-xs sm:text-sm flex items-center gap-2">
                            {category}
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] font-bold">
                              {grantedCount} / {filteredPerms.length}
                            </span>
                          </h4>
                          <div className="flex gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                const newSet = new Set([...selectedRolePermissions, ...filteredPerms]);
                                setSelectedRolePermissions(Array.from(newSet));
                              }}
                              className="text-[#0050CB] dark:text-[#38BDF8] font-bold hover:underline cursor-pointer"
                            >
                              Grant All
                            </button>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRolePermissions(
                                  selectedRolePermissions.filter((p) => !filteredPerms.includes(p))
                                );
                              }}
                              className="text-slate-500 dark:text-slate-400 font-bold hover:underline cursor-pointer"
                            >
                              Revoke All
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                          {filteredPerms.map((perm) => {
                            const isGranted =
                              selectedRolePermissions.includes(perm) || selectedRolePermissions.includes('*');
                            const isWildcardInherited =
                              selectedRolePermissions.includes('*') && perm !== '*';

                            return (
                              <label
                                key={perm}
                                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                  isGranted
                                    ? 'bg-[#E5EEFF]/80 dark:bg-[#0050CB]/20 border-[#0050CB]/40 dark:border-[#0050CB]/50 text-[#000E28] dark:text-white'
                                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <span className="font-mono text-[11px] truncate mr-2" title={perm}>
                                  {perm}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isGranted}
                                  disabled={isWildcardInherited}
                                  onChange={() => togglePermission(perm)}
                                  className="h-4 w-4 rounded text-[#0050CB] border-slate-300 dark:border-slate-600 focus:ring-[#0050CB]"
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
