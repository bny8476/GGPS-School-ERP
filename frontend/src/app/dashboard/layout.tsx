"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from "@/stores/authStore";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  DollarSign, 
  UserCheck, 
  Megaphone, 
  BarChart3, 
  Settings, 
  LogOut, 
  FileText, 
  Activity, 
  Globe, 
  Sun, 
  Moon, 
  Search, 
  Send,
  PanelLeftClose, 
  PanelLeft,
  Package, 
  ShieldCheck, 
  CheckCircle2, 
  Check,
  Lock, 
  Menu, 
  X,
  Sparkles, 
  Trophy, 
  Building2, 
  LifeBuoy, 
  ChevronDown, 
  ChevronRight,
  MessageSquare, 
  Calendar,
  Layers,
  Inbox,
  Clock,
  QrCode,
  FileSpreadsheet,
  WalletCards,
  Sliders,
  Shield,
  Briefcase,
  UserPlus,
  CalendarDays
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import CommandPalette from '@/components/ui/CommandPalette';
import NotificationDrawer from '@/components/ui/NotificationDrawer';

interface NavSubItem {
  href: string;
  label: string;
  badge?: string;
  icon?: any;
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  show: boolean;
  badge?: string;
  subItems?: NavSubItem[];
}

interface NavCategory {
  category: string;
  items: NavItem[];
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);
  const [academicYearDropdownOpen, setAcademicYearDropdownOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState('GGPS Main Campus');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('AY 2025 - 2026');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  const { theme, toggleTheme, direction, setDirection } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
    const updateDate = () => {
      const now = new Date();
      setCurrentDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    updateDate();
    const interval = setInterval(updateDate, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        const role = ((typeof parsed.role === 'string' ? parsed.role : parsed.role?.name) || '').toLowerCase();
        if (role === 'parent') {
          router.push('/portal');
        }
      } catch (e) {}
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      await fetch(`${apiBase}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.warn("Logout request failed:", e);
    } finally {
      useAuthStore.getState().logout();
    }
  };

  const roleStr = typeof user?.role === 'string' ? user.role : (user?.role?.name || '');
  const r = roleStr.toLowerCase();
  
  const isSuperAdmin = r === 'superadmin' || r === 'admin';
  const isPrincipal = r === 'principal' || isSuperAdmin;
  const isReceptionist = r === 'receptionist' || isSuperAdmin;
  const isTeacher = r === 'teacher' || isSuperAdmin;
  const isAccountant = r === 'accountant' || isSuperAdmin;

  // The Complete Navigation Modules matching exact design
  const navItems: NavItem[] = useMemo(() => [
    { 
      href: '/dashboard', 
      label: t('nav.dashboard', 'Dashboard'), 
      icon: LayoutDashboard, 
      show: true 
    },
    { 
      href: '/dashboard/admissions', 
      label: t('nav.admissions', 'Admissions'), 
      icon: UserPlus, 
      show: isSuperAdmin || isPrincipal || isReceptionist,
      subItems: [
        { href: '/dashboard/admissions/enquiries', label: t('admissions.enquiries', 'Enquiries') },
        { href: '/dashboard/admissions?tab=inquiries', label: t('admissions.enquiries', 'All Inquiries') },
        { href: '/dashboard/admissions?tab=applications', label: t('admissions.applicationForms', 'Application Forms') },
        { href: '/dashboard/admissions?tab=documents', label: t('admissions.documentVerification', 'Document Verification') },
        { href: '/dashboard/admissions?tab=pipeline', label: t('admissions.pipeline', 'Admission Pipeline') },
        { href: '/dashboard/admissions?tab=confirmed', label: t('admissions.confirmed', 'Confirmed Admissions') },
      ]
    },
    { 
      href: '/dashboard/students', 
      label: t('nav.students', 'Students'), 
      icon: GraduationCap, 
      show: true,
      subItems: [
        { href: '/dashboard/students', label: t('students.directory', 'Student Directory') },
        { href: '/dashboard/students?action=new', label: t('students.addStudent', 'Add Student') },
        { href: '/dashboard/id-cards', label: t('students.idCards', 'ID Card Generator') },
        { href: '/dashboard/discipline', label: t('students.discipline', 'Behavioral & Discipline Logs') },
        { href: '/dashboard/growth-profile', label: t('students.growthProfile', 'Growth Profiles') },
      ]
    },
    { 
      href: '/dashboard/enrollment', 
      label: t('nav.enrollment', 'Enrollment'), 
      icon: Layers, 
      show: true,
      subItems: [
        { href: '/dashboard/enrollment', label: t('enrollment.overview', 'Enrollment & Roster') },
        { href: '/dashboard/enrollment', label: t('enrollment.promotion', 'Student Promotion & Roll-over') },
      ]
    },
    { 
      href: '/dashboard/teachers', 
      label: t('nav.teachers', 'Teachers / Employees'), 
      icon: Briefcase, 
      show: isSuperAdmin || isPrincipal,
      subItems: [
        { href: '/dashboard/teachers', label: t('teachers.directory', 'Staff Directory') },
        { href: '/dashboard/teachers?action=new', label: t('teachers.addEmployee', 'Add / Edit Employee') },
        { href: '/dashboard/attendance?tab=teachers', label: t('teachers.staffAttendance', 'Staff Attendance') },
        { href: '/dashboard/leaves', label: t('teachers.leavesPermissions', 'Leaves & Permissions') },
      ]
    },
    { 
      href: '/dashboard/parents', 
      label: t('nav.parents', 'Parents'), 
      icon: Users, 
      show: isSuperAdmin || isPrincipal,
      subItems: [
        { href: '/dashboard/parents', label: t('parents.directory', 'Parent Directory') },
        { href: '/dashboard/parents?tab=linked', label: t('parents.linkedStudents', 'Linked Students') },
        { href: '/dashboard/parents?tab=logs', label: t('parents.communicationLogs', 'Communication Logs') },
        { href: '/dashboard/parent-booking', label: t('parents.meetingRequests', 'Parent Meeting Requests') },
      ]
    },
    { 
      href: '/dashboard/academic', 
      label: t('nav.academics', 'Academics'), 
      icon: BookOpen, 
      show: true,
      subItems: [
        { href: '/dashboard/calendar', label: t('academics.calendar', 'Academic Calendar') },
        { href: '/dashboard/classes', label: t('academics.classesSections', 'Classes & Sections') },
        { href: '/dashboard/academic?tab=subjects', label: t('academics.subjects', 'Subjects') },
        { href: '/dashboard/academic?tab=timetable', label: t('academics.timetable', 'Timetable') },
        { href: '/dashboard/curriculum', label: t('academics.curriculum', 'Curriculum') },
        { href: '/dashboard/teachers?tab=assignments', label: t('academics.teacherAssignments', 'Teacher Assignments') },
      ]
    },
    { 
      href: '/dashboard/attendance', 
      label: t('nav.attendance', 'Attendance'), 
      icon: CheckCircle2, 
      show: true,
      subItems: [
        { href: '/dashboard/attendance', label: t('attendance.dailyStudentAttendance', 'Daily Student Attendance') },
        { href: '/dashboard/attendance?tab=teachers', label: t('attendance.dailyTeacherAttendance', 'Daily Teacher Attendance') },
        { href: '/dashboard/attendance?tab=reports', label: t('attendance.reports', 'Class Attendance Reports') },
        { href: '/dashboard/leaves', label: t('attendance.leaveApplications', 'Leave Applications') },
      ]
    },
    { 
      href: '/dashboard/fees', 
      label: t('nav.finance', 'Fees & Finance'), 
      icon: DollarSign, 
      show: isAccountant || isSuperAdmin,
      subItems: [
        { href: '/dashboard/fees?tab=structure', label: t('finance.feeStructure', 'Fee Structure Setup') },
        { href: '/dashboard/fees?tab=invoices', label: t('finance.invoices', 'Student Invoices') },
        { href: '/dashboard/fees?tab=collect', label: t('finance.paymentCollection', 'Payment Collection') },
        { href: '/dashboard/fees?tab=receipts', label: t('finance.receipts', 'Fee Receipts') },
        { href: '/dashboard/fees?tab=dues', label: t('finance.outstandingDues', 'Outstanding Dues') },
        { href: '/dashboard/fees?tab=scholarships', label: t('finance.scholarships', 'Scholarships & Concessions') },
      ]
    },
    { 
      href: '/dashboard/online-exams', 
      label: t('nav.examinations', 'Examinations'), 
      icon: FileSpreadsheet, 
      show: true,
      subItems: [
        { href: '/dashboard/online-exams', label: t('examinations.onlineExams', 'Online Exams') },
        { href: '/dashboard/assessments', label: t('examinations.assessmentsMarks', 'Assessments & Marks') },
        { href: '/dashboard/assessments?tab=reportcards', label: t('examinations.reportCards', 'Report Cards') },
      ]
    },
    { 
      href: '/dashboard/events', 
      label: t('nav.events', 'Events & Gallery'), 
      icon: CalendarDays, 
      show: true,
      subItems: [
        { href: '/dashboard/events', label: 'School Events' },
        { href: '/dashboard/events?tab=gallery', label: 'Photo Gallery' },
      ]
    },
    { 
      href: '/dashboard/circulars', 
      label: t('nav.communication', 'Communication'), 
      icon: Send, 
      show: true,
      subItems: [
        { href: '/dashboard/circulars', label: 'Circulars & Notices' },
        { href: '/dashboard/chat', label: 'Messages', icon: MessageSquare },
      ]
    },
    { 
      href: '/dashboard/reports', 
      label: t('nav.reports', 'Reports'), 
      icon: BarChart3, 
      show: true,
      subItems: [
        { href: '/dashboard/reports?tab=academic', label: t('reports.academicReports', 'Academic Reports') },
        { href: '/dashboard/reports?tab=attendance', label: t('reports.attendanceReports', 'Attendance Reports') },
        { href: '/dashboard/reports?tab=finance', label: t('reports.financeReports', 'Financial Reports') },
      ]
    },
    { 
      href: '/dashboard/users', 
      label: t('nav.usersRoles', 'Users & Roles'), 
      icon: Shield, 
      show: isSuperAdmin,
      subItems: [
        { href: '/dashboard/users', label: 'User Directory' },
        { href: '/dashboard/users?tab=roles', label: 'Roles & Permissions' },
      ]
    },
    { 
      href: '/dashboard/settings', 
      label: t('nav.settings', 'Settings / Audit'), 
      icon: Settings, 
      show: isSuperAdmin || isPrincipal,
      subItems: [
        { href: '/dashboard/settings', label: 'General Settings' },
        { href: '/dashboard/audit-logs', label: t('nav.auditLogs', 'System Audit Logs') },
      ]
    },
  ], [isSuperAdmin, isPrincipal, isAccountant, t]);

  // Compute breadcrumb title from pathname
  const currentBreadcrumbs = useMemo(() => {
    const parts = pathname.replace('/dashboard', '').split('/').filter(Boolean);
    if (parts.length === 0) return [{ label: 'Executive Dashboard' }];

    return parts.map((part, index) => {
      const formatted = part
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      const href = `/dashboard/${parts.slice(0, index + 1).join('/')}`;
      return {
        label: formatted,
        href: index === parts.length - 1 ? undefined : href,
      };
    });
  }, [pathname]);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F6F8FC] dark:bg-[#07152F]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0050CB] text-white flex items-center justify-center shadow-lg shadow-[#0050CB]/25 animate-pulse">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#0050CB] animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-[#FF690C] animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-[#0050CB] animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  // Teacher-only accounts render without the admin sidebar, preserving TeacherWorkspace
  const isTeacherOnly = r === 'teacher' && !isSuperAdmin;
  if (isTeacherOnly) {
    return (
      <div className="min-h-screen bg-[#F3F6FC] dark:bg-[#07152F] text-[#172033] dark:text-[#F8FAFC] transition-colors duration-200 overflow-hidden font-saas">
        <CommandPalette />
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F6F8FC] dark:bg-[#040C1A] text-[#000E28] dark:text-white transition-colors duration-200 overflow-hidden font-saas">
      <CommandPalette />

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#07152F]/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#08152F] text-white z-10 shadow-2xl border-r border-slate-800">
            {/* Mobile Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-[#0B1735]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0050CB] flex items-center justify-center text-white shadow-md">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black tracking-tight text-white block">GGPS SCHOOL ERP</span>
                  <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Admin Console</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation List */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
              {navItems.filter((item) => item.show).map((item) => {
                const Icon = item.icon;
                const isItemActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
                  item.subItems?.some((sub) => pathname === sub.href);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = openSubmenu === item.label || (openSubmenu === null && isItemActive);

                return (
                  <div key={item.label} className="space-y-1">
                    {hasSubItems ? (
                      <button
                        type="button"
                        onClick={() => setOpenSubmenu(isExpanded ? '__closed__' : item.label)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                          isItemActive
                            ? 'bg-[#0050CB] text-white shadow-md'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-white" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-white' : 'text-slate-400'
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                          isItemActive
                            ? 'bg-[#0050CB] text-white shadow-md'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    )}

                    {hasSubItems && isExpanded && (
                      <div className="pl-6 pr-2 space-y-1 pt-1">
                        {item.subItems!.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                                isSubActive
                                  ? 'bg-[#0050CB] text-white font-bold shadow-xs'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {sub.icon ? (
                                  <sub.icon className="w-3.5 h-3.5 text-current shrink-0" />
                                ) : (
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isSubActive ? 'bg-white' : 'bg-slate-500'
                                    }`}
                                  />
                                )}
                                <span>{sub.label}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Mobile Logout */}
            <div className="p-3 border-t border-slate-800 bg-[#0B1735]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 rounded-xl cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Luxury Sidebar (260px expanded / 72px collapsed) */}
      <aside
        className={`${
          isCollapsed ? 'w-20' : 'w-68'
        } bg-[#000E28] text-white flex flex-col hidden md:flex shrink-0 shadow-[4px_0_30px_rgba(0,14,40,0.15)] z-30 transition-all duration-300 ease-in-out border-r border-slate-800/80`}
      >
        {/* Sidebar Brand Header matching screenshot */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0 bg-[#000E28]">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0050CB] to-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-[#0050CB]/30 ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="text-base font-black tracking-tight text-white block font-saas">
                  GGPS
                </span>
                <span className="text-[11px] font-semibold text-slate-300 block -mt-0.5">
                  School ERP
                </span>
                <span className="text-[10px] font-medium text-[#38BDF8] block -mt-0.5">
                  Learn • Grow • Succeed
                </span>
              </div>
            </Link>
          )}

          {isCollapsed && (
            <div className="mx-auto">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0050CB] to-[#2563EB] flex items-center justify-center text-white shadow-lg ring-1 ring-white/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer hover:bg-slate-800/60"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Sidebar Navigation Links (Scrollable) */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5 custom-scrollbar">
          {navItems.filter((item) => item.show).map((item) => {
            const Icon = item.icon;
            const isItemActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
              item.subItems?.some((sub) => pathname === sub.href);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = openSubmenu === item.label || (openSubmenu === null && isItemActive);

            return (
              <div key={item.label} className="space-y-1">
                {hasSubItems ? (
                  <button
                    type="button"
                    onClick={() => setOpenSubmenu(isExpanded ? '__closed__' : item.label)}
                    className={`w-full flex items-center justify-between ${
                      isCollapsed ? 'justify-center px-2' : 'px-3.5'
                    } py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer group ${
                      isItemActive
                        ? 'bg-[#0050CB] text-white shadow-md shadow-[#0050CB]/35 ring-1 ring-white/10 font-bold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center">
                      <Icon
                        className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'} shrink-0 text-white group-hover:scale-105 transition-transform duration-200`}
                        strokeWidth={2}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-white' : 'text-slate-400'
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    title={item.label}
                    className={`flex items-center justify-between ${
                      isCollapsed ? 'justify-center px-2' : 'px-3.5'
                    } py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                      isItemActive
                        ? 'bg-[#0050CB] text-white shadow-md shadow-[#0050CB]/35 ring-1 ring-white/10 font-bold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon
                        className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'} shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                          isItemActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                        }`}
                        strokeWidth={2}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                  </Link>
                )}

                {/* Submenu Expansion */}
                {hasSubItems && isExpanded && !isCollapsed && (
                  <div className="pl-4 pr-1 space-y-1 pt-1 animate-in fade-in duration-150">
                    {item.subItems!.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                            isSubActive
                              ? 'bg-[#0050CB] text-white font-bold shadow-xs'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {sub.icon ? (
                              <sub.icon className="w-3.5 h-3.5 text-current shrink-0" />
                            ) : (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSubActive ? 'bg-white' : 'bg-slate-500'
                                }`}
                              />
                            )}
                            <span>{sub.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Better Education / Brighter Future Bottom Card matching screenshot */}
        {!isCollapsed && (
          <div className="p-3 mx-3 my-2 rounded-2xl bg-gradient-to-b from-[#0B1D45] to-[#040D1E] border border-blue-900/60 overflow-hidden relative shadow-lg text-white shrink-0">
            <p className="text-xs font-bold text-white">Better Education</p>
            <p className="text-xs font-black text-[#38BDF8]">Brighter Future</p>
            <div className="mt-2.5 rounded-xl overflow-hidden h-20 w-full relative">
              <img src="/admin-hero-campus.jpg" alt="GGPS Campus" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040D1E]/70 via-transparent to-transparent" />
            </div>
          </div>
        )}

        {/* Sidebar Footer Admin Profile & Actions */}
        <div className="p-3 border-t border-slate-800/80 bg-[#000E28] space-y-1 shrink-0">
          <Link
            href="/dashboard/settings"
            title="System Settings"
            className={`flex items-center ${
              isCollapsed ? 'justify-center px-2' : 'px-3'
            } py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-all`}
          >
            <Settings className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2.5'} text-slate-400 shrink-0`} />
            {!isCollapsed && <span>System Settings</span>}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-2' : 'px-3'
            } py-2 text-xs font-semibold text-slate-300 hover:bg-rose-950/40 hover:text-rose-400 rounded-xl transition-all cursor-pointer`}
          >
            <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2.5'} text-slate-400 hover:text-rose-400 shrink-0`} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar (72px) */}
        <header className="h-18 bg-white dark:bg-[#07152F] border-b border-[#E6EAF2] dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20 shadow-[0_2px_12px_rgba(0,14,40,0.03)]">
          {/* Left: Mobile Menu + Search Bar (Matches Exact Screenshot) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Pill (Cmd + K) */}
            <button
              type="button"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true });
                window.dispatchEvent(event);
              }}
              className="flex items-center justify-between w-[280px] sm:w-[340px] md:w-[420px] h-9 px-3.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-full text-xs font-normal text-slate-400 cursor-pointer transition-all border border-slate-200/90 dark:border-slate-700 shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Search students, teachers, classes, events...</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-600 shadow-2xs shrink-0">
                ⌘K
              </span>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Drawer with red badge "3" */}
            <div className="relative">
              <NotificationDrawer />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center pointer-events-none shadow-xs">
                3
              </span>
            </div>

            {/* Messages Quick Action with red badge "2" */}
            <div className="relative">
              <Link
                href="/dashboard/chat"
                className="h-9 w-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700 shadow-2xs"
                title="Staff Messages"
              >
                <MessageSquare className="h-4 w-4 text-slate-500 dark:text-slate-300" />
              </Link>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center pointer-events-none shadow-xs">
                2
              </span>
            </div>

            {/* Dark/Light Mode Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700 shadow-2xs"
              title="Toggle Dark/Light Mode"
            >
              {theme === 'light' ? <Moon className="h-4 w-4 text-slate-500" /> : <Sun className="h-4 w-4 text-slate-300" />}
            </button>

            {/* Language Switcher Pill */}
            <LanguageSwitcher />

            {/* Date Picker / Current Date Button matching screenshot */}
            <Link
              href="/dashboard/calendar"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs transition-colors"
              title="View Academic Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-[#0050CB]" />
              <span suppressHydrationWarning>{currentDateStr || 'Today'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </Link>

            {/* Admin Profile Dropdown Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 sm:pl-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-1 pr-1.5 rounded-full transition-colors cursor-pointer"
              >
                <div className="relative h-9 w-9 rounded-full overflow-hidden bg-slate-200 ring-1 ring-slate-200 shrink-0">
                  <img
                    src="/aarav-profile-avatar.png"
                    alt="Admin"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="hidden sm:block text-left leading-none pr-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Admin
                  </p>
                  <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                    Administrator
                  </p>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#08152F] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-[#000E28] dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings</span>
                  </Link>
                  <Link
                    href="/dashboard/audit-logs"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Security Audit Logs</span>
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-[#F6F8FC] dark:bg-[#040C1A] transition-colors flex flex-col justify-between">
          <div className="max-w-[1680px] w-full mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardContent>{children}</DashboardContent>;
}
