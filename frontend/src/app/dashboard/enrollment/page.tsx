"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Layers,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Search,
  Filter,
  Plus,
  Edit2,
  RefreshCw,
  IdCard,
  Building,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getCurrentAcademicYearFormatted } from '@/lib/date';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import { getApiBaseUrl } from '@/lib/utils';

interface EnrollmentRecord {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    rollNumber?: string;
    gender?: string;
    avatar?: string;
    profilePicture?: string;
    status?: string;
  };
  classId: {
    _id: string;
    name: string;
  };
  sectionId?: {
    _id: string;
    name: string;
    capacity: number;
  };
  academicYearId: {
    _id: string;
    name: string;
    isCurrent?: boolean;
  };
  rollNumber?: string;
  status: 'Active' | 'Promoted' | 'Transferred' | 'Graduated' | 'Withdrawn';
  createdAt: string;
}

interface SectionCapacityItem {
  sectionId: string;
  sectionName: string;
  classId: string;
  className: string;
  capacity: number;
  enrolledCount: number;
  availableSeats: number;
  utilizationRate: number;
  status: 'Available' | 'Near Capacity' | 'Full';
}

export default function EnrollmentPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'allocations';

  const [activeTab, setActiveTab] = useState<'allocations' | 'rollover' | 'capacity' | 'idcards'>('allocations');
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [capacities, setCapacities] = useState<SectionCapacityItem[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Allocation Filters
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Assign Student Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<{
    student?: any;
    enrollment?: any;
  } | null>(null);
  const [assignForm, setAssignForm] = useState({
    studentId: '',
    classId: '',
    sectionId: '',
    rollNumber: '',
    remarks: '',
  });
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Edit Capacity Modal State
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionCapacityItem | null>(null);
  const [newCapacityLimit, setNewCapacityLimit] = useState(30);
  const [isUpdatingCapacity, setIsUpdatingCapacity] = useState(false);

  // Rollover Wizard State
  const [rolloverSourceYear, setRolloverSourceYear] = useState('');
  const [rolloverSourceClass, setRolloverSourceClass] = useState('');
  const [rolloverTargetYear, setRolloverTargetYear] = useState('');
  const [rolloverTargetClass, setRolloverTargetClass] = useState('');
  const [rolloverTargetSection, setRolloverTargetSection] = useState('');
  const [selectedStudentsForRollover, setSelectedStudentsForRollover] = useState<string[]>([]);
  const [isExecutingRollover, setIsExecutingRollover] = useState(false);

  // Sync tab with URL parameter if present
  useEffect(() => {
    if (initialTab === 'rollover' || initialTab === 'capacity' || initialTab === 'idcards') {
      setActiveTab(initialTab);
    } else {
      setActiveTab('allocations');
    }
  }, [initialTab]);

  const apiBase = getApiBaseUrl();

  const getHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Fetch Core Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [enrollRes, capRes, classRes, stuRes, yearRes] = await Promise.allSettled([
        fetch(`${apiBase}/api/v1/enrollment`, { credentials: 'include', headers: getHeaders() }),
        fetch(`${apiBase}/api/v1/enrollment/capacity`, { credentials: 'include', headers: getHeaders() }),
        fetch(`${apiBase}/api/classes`, { credentials: 'include', headers: getHeaders() }),
        fetch(`${apiBase}/api/students`, { credentials: 'include', headers: getHeaders() }),
        fetch(`${apiBase}/api/academic/years`, { credentials: 'include', headers: getHeaders() }),
      ]);

      if (enrollRes.status === 'fulfilled' && enrollRes.value.ok) {
        const data = await enrollRes.value.json();
        setEnrollments(data.data || []);
      }

      if (capRes.status === 'fulfilled' && capRes.value.ok) {
        const data = await capRes.value.json();
        setCapacities(data.data || []);
      }

      if (classRes.status === 'fulfilled' && classRes.value.ok) {
        const data = await classRes.value.json();
        setClasses(Array.isArray(data) ? data : data.data || []);
      }

      if (stuRes.status === 'fulfilled' && stuRes.value.ok) {
        const data = await stuRes.value.json();
        setStudents(Array.isArray(data) ? data : data.data || []);
      }

      if (yearRes.status === 'fulfilled' && yearRes.value.ok) {
        const data = await yearRes.value.json();
        setAcademicYears(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch enrollment workspace data:', err);
      toast.error('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  }, [apiBase, getHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Statistics
  const stats = useMemo(() => {
    const totalEnrolled = enrollments.filter((e) => e.status === 'Active').length;
    const totalCapacity = capacities.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
    const availableSeats = Math.max(0, totalCapacity - totalEnrolled);
    const sectionsFull = capacities.filter((c) => c.status === 'Full').length;
    const currentYear = academicYears.find((y) => y.isCurrent)?.name || `AY ${getCurrentAcademicYearFormatted()}`;

    return { totalEnrolled, availableSeats, sectionsFull, currentYear };
  }, [enrollments, capacities, academicYears]);

  // Filtered Enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((item) => {
      const student = item.studentId;
      if (!student) return false;

      if (selectedClassFilter && item.classId?._id !== selectedClassFilter) return false;
      if (selectedSectionFilter && item.sectionId?._id !== selectedSectionFilter) return false;
      if (selectedStatusFilter && item.status !== selectedStatusFilter) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
        const adm = (student.admissionNumber || '').toLowerCase();
        const roll = (item.rollNumber || student.rollNumber || '').toLowerCase();
        return fullName.includes(q) || adm.includes(q) || roll.includes(q);
      }

      return true;
    });
  }, [enrollments, selectedClassFilter, selectedSectionFilter, selectedStatusFilter, searchQuery]);

  // Deduplicate and filter classes list (ensuring only one Pre-KG is shown)
  const filteredClasses = useMemo(() => {
    const hasHyphen = classes.some(
      (c) => (c.name || '').replace(/\s+/g, '').toLowerCase() === 'pre-kg'
    );
    const seen = new Set<string>();

    return classes.filter((c) => {
      const rawName = (c.name || '').trim();
      if (!rawName) return false;

      // If 'Pre-KG' is present, remove the redundant 'PreKG' entry
      if (hasHyphen && rawName.toLowerCase() === 'prekg') {
        return false;
      }

      const norm = rawName.replace(/[\s-]+/g, '').toLowerCase();
      if (seen.has(norm)) {
        return false;
      }
      seen.add(norm);
      return true;
    });
  }, [classes]);

  // Available sections for the assign form
  const assignAvailableSections = useMemo(() => {
    if (!assignForm.classId) return [];
    const cls = classes.find((c) => c._id === assignForm.classId);
    return cls?.sections || [];
  }, [assignForm.classId, classes]);

  const currentSelectedStudent = useMemo(() => {
    if (reassignTarget?.student) return reassignTarget.student;
    return students.find((s) => s._id === assignForm.studentId) || null;
  }, [reassignTarget, students, assignForm.studentId]);

  // Handle Assign Student Submit
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.studentId || !assignForm.classId) {
      toast.error('Please select both a student and target class');
      return;
    }

    setIsSubmittingAssign(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/enrollment/assign`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(assignForm),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to assign student');
      }

      toast.success(result.message || 'Student enrolled successfully');
      setIsAssignModalOpen(false);
      setReassignTarget(null);
      setAssignForm({ studentId: '', classId: '', sectionId: '', rollNumber: '', remarks: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Enrollment assignment failed');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Handle Capacity Update
  const handleCapacityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setIsUpdatingCapacity(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/enrollment/capacity/${editingSection.sectionId}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ capacity: newCapacityLimit }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to update section capacity');
      }

      toast.success('Section capacity updated');
      setIsCapacityModalOpen(false);
      setEditingSection(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update capacity');
    } finally {
      setIsUpdatingCapacity(false);
    }
  };

  // Rollover Eligible Students
  const eligibleRolloverStudents = useMemo(() => {
    if (!rolloverSourceClass) return [];
    return enrollments.filter(
      (e) => e.classId?._id === rolloverSourceClass && e.status === 'Active'
    );
  }, [rolloverSourceClass, enrollments]);

  // Execute Bulk Rollover
  const handleExecuteRollover = async () => {
    if (selectedStudentsForRollover.length === 0) {
      toast.error('Please select at least one student to promote');
      return;
    }
    if (!rolloverTargetYear || !rolloverTargetClass) {
      toast.error('Please select target academic year and class');
      return;
    }

    setIsExecutingRollover(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/enrollment/bulk-rollover`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          studentIds: selectedStudentsForRollover,
          targetAcademicYearId: rolloverTargetYear,
          targetClassId: rolloverTargetClass,
          targetSectionId: rolloverTargetSection || undefined,
          remarks: 'End-of-year promotion',
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Bulk roll-over failed');
      }

      toast.success(`Successfully promoted ${result.promotedCount || selectedStudentsForRollover.length} students!`);
      setSelectedStudentsForRollover([]);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Roll-over process failed');
    } finally {
      setIsExecutingRollover(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-saas pb-24">
      {/* Top Header */}
      <AdminPageHeader
        title="Enrollment & Class Allocation"
        subtitle="Manage academic year student registrations, section quotas, roll-overs and student IDs."
        badge="Academic Operations"
        badgeVariant="primary"
        breadcrumbs={[
          { label: 'Admin Console', href: '/dashboard' },
          { label: 'Enrollment' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setReassignTarget(null);
                setAssignForm({
                  studentId: '',
                  classId: '',
                  sectionId: '',
                  rollNumber: '',
                  remarks: '',
                });
                setIsAssignModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0050CB] hover:bg-[#003E9E] text-white text-xs font-bold rounded-xl shadow-md shadow-[#0050CB]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Student</span>
            </button>

            <Link
              href="/dashboard/id-cards"
              className="flex items-center gap-2 px-4 py-2 bg-[#E5EEFF] hover:bg-[#D5E4FF] text-[#0050CB] text-xs font-bold rounded-xl border border-[#0050CB]/20 transition-all cursor-pointer"
            >
              <IdCard className="w-4 h-4" />
              <span>Generate ID Cards</span>
            </Link>

            <button
              type="button"
              onClick={fetchData}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Active Enrollments"
          value={stats.totalEnrolled}
          icon={Users}
          variant="blue"
          supportingText="Registered in current session"
        />
        <AdminStatCard
          label="Available Seats"
          value={stats.availableSeats}
          icon={GraduationCap}
          variant="emerald"
          supportingText="Remaining section capacity"
        />
        <AdminStatCard
          label="Sections at Capacity"
          value={stats.sectionsFull}
          icon={AlertTriangle}
          variant={stats.sectionsFull > 0 ? 'orange' : 'emerald'}
          supportingText={stats.sectionsFull > 0 ? 'Requires section expansion' : 'Balanced distribution'}
        />
        <AdminStatCard
          label="Academic Session"
          value={2026}
          prefix="AY "
          icon={Calendar}
          variant="indigo"
          supportingText={stats.currentYear}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto custom-scrollbar">
        {[
          { id: 'allocations', label: 'Class & Section Allocation', icon: Layers },
          { id: 'rollover', label: 'Academic Year Roll-over', icon: RefreshCw },
          { id: 'capacity', label: 'Section Capacity & Limits', icon: Building },
          { id: 'idcards', label: 'Student Identity Cards', icon: IdCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#0050CB] text-[#0050CB] dark:text-[#E5EEFF] bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALLOCATIONS */}
      {activeTab === 'allocations' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-[#07152F] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student by name, admission no, or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs w-full outline-hidden text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Class Filter */}
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 outline-hidden"
              >
                <option value="">All Classes</option>
                {filteredClasses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 outline-hidden"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Promoted">Promoted</option>
                <option value="Transferred">Transferred</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>

              {(selectedClassFilter || selectedStatusFilter || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClassFilter('');
                    setSelectedSectionFilter('');
                    setSelectedStatusFilter('');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-rose-500 hover:underline px-2 py-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Allocation Table */}
          <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Admission No</th>
                    <th className="py-3.5 px-4">Class & Section</th>
                    <th className="py-3.5 px-4">Roll Number</th>
                    <th className="py-3.5 px-4">Academic Year</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Layers className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-bold text-slate-600 dark:text-slate-300">No enrollment records found</p>
                        <p className="text-[11px] text-slate-400">Try adjusting your filters or assign a new student to a class.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((record) => {
                      const student = record.studentId;
                      const isPromoted = record.status === 'Promoted';
                      const isActive = record.status === 'Active';

                      return (
                        <tr key={record._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#E5EEFF] flex items-center justify-center font-bold text-xs">
                                {student?.firstName?.[0] || 'S'}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-100 block">
                                  {student?.firstName} {student?.lastName}
                                </span>
                                <span className="text-[10px] text-slate-400">{student?.gender || 'Student'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {student?.admissionNumber || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                              <span>{record.classId?.name || 'Unassigned'}</span>
                              {record.sectionId && (
                                <span className="text-slate-400">({record.sectionId.name})</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#0050CB] dark:text-[#E5EEFF]">
                            {record.rollNumber || student?.rollNumber || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            {record.academicYearId?.name || 'Current'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                                  : isPromoted
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] dark:text-[#E5EEFF] border border-blue-200 dark:border-blue-800/50'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setReassignTarget({
                                  student,
                                  enrollment: record,
                                });
                                setAssignForm({
                                  studentId: student?._id || (typeof student === 'string' ? student : ''),
                                  classId: record.classId?._id || '',
                                  sectionId: record.sectionId?._id || '',
                                  rollNumber: record.rollNumber || student?.rollNumber || '',
                                  remarks: '',
                                });
                                setIsAssignModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0050CB] hover:bg-[#E5EEFF] dark:text-[#E5EEFF] dark:hover:bg-[#0050CB]/20 transition-colors cursor-pointer"
                            >
                              Reassign
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Showing {filteredEnrollments.length} registered students</span>
              <span className="font-bold">GGPS Official Enrollment Roster</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC YEAR ROLL-OVER WIZARD */}
      {activeTab === 'rollover' && (
        <div className="space-y-6 bg-white dark:bg-[#07152F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
              End-of-Year Academic Roll-over
            </h3>
            <p className="text-xs text-slate-500">
              Promote an entire cohort or selected students into the next academic year and higher grade level while preserving historical records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {/* Source Cohort */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                1. Select Source Cohort (Current)
              </span>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Current Class / Grade
                </label>
                <select
                  value={rolloverSourceClass}
                  onChange={(e) => {
                    setRolloverSourceClass(e.target.value);
                    setSelectedStudentsForRollover([]);
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl p-2.5 outline-hidden"
                >
                  <option value="">Select Class to Promote From...</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Cohort */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                2. Select Destination Cohort (Next Year)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Academic Year
                  </label>
                  <select
                    value={rolloverTargetYear}
                    onChange={(e) => setRolloverTargetYear(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl p-2.5 outline-hidden"
                  >
                    <option value="">Select Year...</option>
                    {academicYears.map((y) => (
                      <option key={y._id} value={y._id}>
                        {y.name} {y.isCurrent ? '(Active)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Promote Into Class
                  </label>
                  <select
                    value={rolloverTargetClass}
                    onChange={(e) => setRolloverTargetClass(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl p-2.5 outline-hidden"
                  >
                    <option value="">Target Class...</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Student Selection for Rollover */}
          {rolloverSourceClass && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Select Students to Roll-over ({selectedStudentsForRollover.length} of {eligibleRolloverStudents.length} selected)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedStudentsForRollover.length === eligibleRolloverStudents.length) {
                        setSelectedStudentsForRollover([]);
                      } else {
                        setSelectedStudentsForRollover(eligibleRolloverStudents.map((e) => e.studentId._id));
                      }
                    }}
                    className="text-xs font-bold text-[#0050CB] hover:underline cursor-pointer"
                  >
                    {selectedStudentsForRollover.length === eligibleRolloverStudents.length
                      ? 'Deselect All'
                      : 'Select All Active'}
                  </button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                {eligibleRolloverStudents.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">No active students enrolled in this source class</p>
                ) : (
                  eligibleRolloverStudents.map((record) => {
                    const s = record.studentId;
                    const isChecked = selectedStudentsForRollover.includes(s._id);
                    return (
                      <label
                        key={record._id}
                        className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudentsForRollover([...selectedStudentsForRollover, s._id]);
                              } else {
                                setSelectedStudentsForRollover(selectedStudentsForRollover.filter((id) => id !== s._id));
                              }
                            }}
                            className="w-4 h-4 rounded text-[#0050CB] focus:ring-[#0050CB]"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                              {s.firstName} {s.lastName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Adm: {s.admissionNumber} | Roll: {record.rollNumber || '—'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded">
                          Eligible
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteRollover}
                  disabled={isExecutingRollover || selectedStudentsForRollover.length === 0 || !rolloverTargetClass || !rolloverTargetYear}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#0050CB] hover:bg-[#003E9E] disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isExecutingRollover ? 'animate-spin' : ''}`} />
                  <span>
                    {isExecutingRollover
                      ? 'Processing Promotion...'
                      : `Promote & Roll-over (${selectedStudentsForRollover.length}) Students`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECTION CAPACITY & LIMITS */}
      {activeTab === 'capacity' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#07152F] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-1">
              Class & Section Quota Limits
            </h3>
            <p className="text-xs text-slate-500">
              Monitor active classroom density, student-teacher ratios and seat limits across each school section.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capacities.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800">
                <Building className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="font-bold text-slate-600 dark:text-slate-300">No sections defined yet</p>
                <Link
                  href="/dashboard/classes"
                  className="inline-block mt-2 text-xs font-bold text-[#0050CB] hover:underline"
                >
                  Create classes & sections in Academic Setup →
                </Link>
              </div>
            ) : (
              capacities.map((item) => {
                const isFull = item.status === 'Full';
                const isNear = item.status === 'Near Capacity';

                return (
                  <div
                    key={item.sectionId}
                    className="bg-white dark:bg-[#07152F] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block">{item.className}</span>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                          Section {item.sectionName}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isFull
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : isNear
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 my-4">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-300">
                          {item.enrolledCount} / {item.capacity} Enrolled
                        </span>
                        <span className="text-slate-400">{item.utilizationRate}% Full</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFull ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-[#0050CB]'
                          }`}
                          style={{ width: `${Math.min(100, item.utilizationRate)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500">
                        <strong className="text-slate-700 dark:text-slate-200">{item.availableSeats}</strong> seats open
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSection(item);
                          setNewCapacityLimit(item.capacity);
                          setIsCapacityModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#0050CB] hover:bg-[#E5EEFF] dark:text-[#E5EEFF] dark:hover:bg-[#0050CB]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Limit</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT ID CARDS JUMP */}
      {activeTab === 'idcards' && (
        <div className="bg-white dark:bg-[#07152F] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center mx-auto shadow-md">
            <IdCard className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
            Student Identity Card Studio
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generate, customize, and print high-definition PVC identity cards with barcodes, student portrait photos, emergency contacts, and official GGPS school crests.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/id-cards"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0050CB] hover:bg-[#003E9E] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Launch ID Card Generator Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN / REASSIGN STUDENT */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0050CB]" />
                <span>{reassignTarget ? 'Reassign Class & Section' : 'Class & Section Allocation'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setReassignTarget(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              {reassignTarget ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      Student
                    </label>
                    <span className="text-[10px] font-bold text-[#0050CB] dark:text-[#E5EEFF] bg-[#E5EEFF] dark:bg-[#0050CB]/20 px-2 py-0.5 rounded-full border border-[#0050CB]/20">
                      Reassigning
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#E5EEFF] flex items-center justify-center font-black text-xs shrink-0">
                      {(currentSelectedStudent?.firstName?.[0] || 'S').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                        {currentSelectedStudent?.firstName} {currentSelectedStudent?.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        <span>
                          Adm No: <strong className="font-mono text-slate-700 dark:text-slate-300">{currentSelectedStudent?.admissionNumber || '—'}</strong>
                        </span>
                        {reassignTarget.enrollment?.classId?.name && (
                          <span className="text-slate-400">
                            • Current:{' '}
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                              {reassignTarget.enrollment.classId.name}
                              {reassignTarget.enrollment.sectionId?.name
                                ? ` (${reassignTarget.enrollment.sectionId.name})`
                                : ''}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Student *
                  </label>
                  <select
                    value={assignForm.studentId}
                    onChange={(e) => {
                      const chosenId = e.target.value;
                      const existing = enrollments.find((enr) => enr.studentId?._id === chosenId);
                      setAssignForm((prev) => ({
                        ...prev,
                        studentId: chosenId,
                        rollNumber: existing?.rollNumber || '',
                      }));
                    }}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                  >
                    <option value="">Choose student...</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.firstName} {s.lastName} ({s.admissionNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Class *
                </label>
                <select
                  value={assignForm.classId}
                  onChange={(e) => setAssignForm({ ...assignForm, classId: e.target.value, sectionId: '' })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                >
                  <option value="">Choose class...</option>
                  {filteredClasses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Section
                </label>
                <select
                  value={assignForm.sectionId}
                  onChange={(e) => setAssignForm({ ...assignForm, sectionId: e.target.value })}
                  disabled={!assignForm.classId}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden disabled:opacity-50"
                >
                  <option value="">Select section (optional)...</option>
                  {assignAvailableSections.map((sec: any) => (
                    <option key={sec._id || sec} value={sec._id || sec}>
                      Section {sec.name || sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Roll Number
                  </label>
                </div>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={assignForm.rollNumber ? assignForm.rollNumber : 'Auto-generated on allocation'}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed outline-hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  System auto-assigns a unique sequential roll number to each student. Manual editing is disabled to eliminate duplicates.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    setReassignTarget(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAssign}
                  className="px-5 py-2 bg-[#0050CB] hover:bg-[#003E9E] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {isSubmittingAssign
                    ? (reassignTarget ? 'Reallocating...' : 'Assigning...')
                    : (reassignTarget ? 'Save Reallocation' : 'Save Allocation')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SECTION CAPACITY */}
      {isCapacityModalOpen && editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                Update Capacity Limit
              </h3>
              <button
                type="button"
                onClick={() => setIsCapacityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCapacityUpdate} className="space-y-4 text-xs">
              <p className="text-slate-500">
                Adjust maximum student capacity for <strong>{editingSection.className} — Section {editingSection.sectionName}</strong>.
              </p>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Maximum Student Limit
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newCapacityLimit}
                  onChange={(e) => setNewCapacityLimit(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCapacityModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCapacity}
                  className="px-5 py-2 bg-[#0050CB] hover:bg-[#003E9E] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {isUpdatingCapacity ? 'Saving...' : 'Update Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
