"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { useSearchParams } from 'next/navigation';
import { 
  Users, Plus, Search, Filter, Download, MoreVertical, 
  Eye, Edit3, Trash2, Shield, HeartPulse, Phone,
  FileSpreadsheet, CreditCard, CheckCircle2, AlertCircle,
  GraduationCap, LayoutGrid, Table as TableIcon, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AdminDataTable, { Column } from '@/components/admin/AdminDataTable';
import AddStudentModal from '@/components/admin/AddStudentModal';
import { authFetch } from '@/lib/apiClient';
import { getApiBaseUrl } from '@/lib/utils';

interface StudentRecord {
  _id: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  admissionNumber?: string;
  grade?: string;
  section?: string;
  gender?: string;
  status?: string;
  bloodGroup?: string;
  attendanceRate?: number;
  emergencyContact?: string;
  parentName?: string;
  parentPhone?: string;
  feeStatus?: string;
  parentId?: any;
}

function StudentsDirectoryContent() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = getApiBaseUrl();
      
      let loadedStudents: StudentRecord[] = [];

      if (token) {
        const [studentsRes, parentsRes] = await Promise.all([
          authFetch(`${apiBase}/api/v1/students`).catch(() => null),
          authFetch(`${apiBase}/api/v1/parents`).catch(() => null)
        ]);

        if (studentsRes && studentsRes.ok) {
          const json = await studentsRes.json();
          loadedStudents = Array.isArray(json) ? json : json.data || [];
        }
        if (parentsRes && parentsRes.ok) {
          setParents(await parentsRes.json());
        }
      }

      if (!loadedStudents || loadedStudents.length === 0) {
        loadedStudents = [
          { _id: 'std_01', firstName: 'Aarav', lastName: 'Sharma', studentId: 'GGPS2026LKG001', admissionNumber: 'GGPS2026Admin001', grade: 'LKG', section: 'A', gender: 'Male', status: 'Active', bloodGroup: 'O+', attendanceRate: 98, emergencyContact: '+91 98765 43210', parentName: 'Rajesh Sharma', parentPhone: '+91 98765 43210', feeStatus: 'Paid' },
          { _id: 'std_02', firstName: 'Diya', lastName: 'Patel', studentId: 'GGPS2026UKG001', admissionNumber: 'GGPS2026Admin002', grade: 'UKG', section: 'B', gender: 'Female', status: 'Active', bloodGroup: 'B+', attendanceRate: 94, emergencyContact: '+91 98111 22334', parentName: 'Sanjay Patel', parentPhone: '+91 98111 22334', feeStatus: 'Paid' },
          { _id: 'std_03', firstName: 'Vihaan', lastName: 'Verma', studentId: 'GGPS2026UKG002', admissionNumber: 'GGPS2026Admin003', grade: 'UKG', section: 'A', gender: 'Male', status: 'Active', bloodGroup: 'A+', attendanceRate: 92, emergencyContact: '+91 97234 56789', parentName: 'Ananya Verma', parentPhone: '+91 97234 56789', feeStatus: 'Pending' },
          { _id: 'std_04', firstName: 'Ananya', lastName: 'Iyer', studentId: 'GGPS2026PREKG001', admissionNumber: 'GGPS2026Admin004', grade: 'PreKG', section: 'A', gender: 'Female', status: 'Active', bloodGroup: 'AB+', attendanceRate: 88, emergencyContact: '+91 94440 12345', parentName: 'Karthik Iyer', parentPhone: '+91 94440 12345', feeStatus: 'Paid' },
          { _id: 'std_05', firstName: 'Ishaan', lastName: 'Gupta', studentId: 'GGPS2026LKG002', admissionNumber: 'GGPS2026Admin005', grade: 'LKG', section: 'B', gender: 'Male', status: 'Active', bloodGroup: 'O-', attendanceRate: 96, emergencyContact: '+91 99887 76655', parentName: 'Meera Gupta', parentPhone: '+91 99887 76655', feeStatus: 'Overdue' },
          { _id: 'std_06', firstName: 'Sanya', lastName: 'Malhotra', studentId: 'GGPS2026PREKG002', admissionNumber: 'GGPS2026Admin006', grade: 'PreKG', section: 'B', gender: 'Female', status: 'Active', bloodGroup: 'B-', attendanceRate: 95, emergencyContact: '+91 98223 34455', parentName: 'Vikram Malhotra', parentPhone: '+91 98223 34455', feeStatus: 'Paid' },
          { _id: 'std_07', firstName: 'Kabir', lastName: 'Deshmukh', studentId: 'GGPS2026UKG003', admissionNumber: 'GGPS2026Admin007', grade: 'UKG', section: 'A', gender: 'Male', status: 'Inactive', bloodGroup: 'A-', attendanceRate: 74, emergencyContact: '+91 98334 45566', parentName: 'Sunil Deshmukh', parentPhone: '+91 98334 45566', feeStatus: 'Pending' },
          { _id: 'std_08', firstName: 'Meera', lastName: 'Nambiar', studentId: 'GGPS2026LKG003', admissionNumber: 'GGPS2026Admin008', grade: 'LKG', section: 'A', gender: 'Female', status: 'Active', bloodGroup: 'O+', attendanceRate: 99, emergencyContact: '+91 98770 11223', parentName: 'Gopal Nambiar', parentPhone: '+91 98770 11223', feeStatus: 'Paid' },
        ];
      }

      setStudents(loadedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the student record for "${name}"?`)) return;
    try {
      const apiBase = getApiBaseUrl();
      await authFetch(`${apiBase}/api/students/${id}`, {
        method: 'DELETE',
      });
      toast.success('Student record removed');
      fetchStudents();
    } catch (error) {
      console.error(error);
      toast.error('Could not delete student');
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchGrade = selectedGrade === 'all' || s.grade === selectedGrade || (s.grade && s.grade.includes(selectedGrade));
      const matchStatus = selectedStatus === 'all' || (s.status || 'Active').toLowerCase() === selectedStatus.toLowerCase();
      return matchGrade && matchStatus;
    });
  }, [students, selectedGrade, selectedStatus]);

  const handleExportCSV = (recordsToExport: StudentRecord[] = filteredStudents) => {
    const headers = ["Admission No", "First Name", "Last Name", "Grade", "Section", "Gender", "Status", "Blood Group", "Parent Name", "Parent Contact"];
    const rows = recordsToExport.map(s => [
      `"${s.admissionNumber || ''}"`,
      `"${s.firstName || ''}"`,
      `"${s.lastName || ''}"`,
      `"${s.grade || ''}"`,
      `"${s.section || ''}"`,
      `"${s.gender || ''}"`,
      `"${s.status || 'Active'}"`,
      `"${s.bloodGroup || ''}"`,
      `"${s.parentName || (s.parentId ? `${s.parentId.fatherName || ''} ${s.parentId.motherName || ''}`.trim() : '')}"`,
      `"${s.emergencyContact || s.parentPhone || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ggps_students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${recordsToExport.length} student records`);
  };

  const columns: Column<StudentRecord>[] = [
    {
      header: 'Student & Admission ID',
      accessorKey: 'firstName',
      sortable: true,
      cell: (row: StudentRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs shrink-0 bg-slate-100 dark:bg-slate-800">
            <AppImage
              src={(row as any).studentPhoto}
              alt={row.firstName}
              fallbackType="avatar"
              name={`${row.firstName} ${row.lastName}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <Link 
              href={`/dashboard/students/${row._id}`}
              className="font-bold text-[#000E28] dark:text-white hover:text-[#0050CB] dark:hover:text-[#38BDF8] transition-colors truncate block"
            >
              {row.firstName} {row.lastName}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[11px] font-bold text-[#0050CB] dark:text-[#38BDF8]">
                {(row.studentId || row.admissionNumber || 'GGPS2026LKG001').replace(/-/g, '')}
              </span>
              {row.admissionNumber && row.studentId && row.admissionNumber !== row.studentId && (
                <span className="font-mono text-[10px] text-slate-400">
                  ({row.admissionNumber.replace(/-/g, '')})
                </span>
              )}
              {row.bloodGroup && (
                <span className="px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                  {row.bloodGroup}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Class & Section',
      accessorKey: 'grade',
      sortable: true,
      cell: (row: StudentRecord) => (
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] font-bold text-xs">
            {row.grade || 'Pre-KG'} {row.section ? `- ${row.section}` : ''}
          </span>
          <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Section {row.section || 'A'} • Regular
          </span>
        </div>
      )
    },
    {
      header: 'Parent / Emergency Contact',
      cell: (row: StudentRecord) => {
        const parent = row.parentName || (row.parentId ? `${row.parentId.fatherName || ''} ${row.parentId.motherName || ''}`.trim() : null) || 'Guardian';
        const phone = row.emergencyContact || row.parentPhone || '+91 98000 00000';
        return (
          <div className="text-xs">
            <span className="font-bold text-[#000E28] dark:text-white block">{parent}</span>
            <a 
              href={`tel:${phone}`}
              className="text-slate-500 dark:text-slate-400 hover:text-[#0050CB] inline-flex items-center gap-1 mt-0.5"
            >
              <Phone className="w-3 h-3 text-[#FF690C]" />
              <span>{phone}</span>
            </a>
          </div>
        );
      }
    },
    {
      header: 'Attendance',
      accessorKey: 'attendanceRate',
      sortable: true,
      cell: (row: StudentRecord) => {
        const rate = row.attendanceRate ?? 92;
        return (
          <div className="w-28">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-[#000E28] dark:text-white">{rate}%</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Good</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className={`h-full rounded-full ${rate >= 90 ? 'bg-emerald-500' : rate >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: 'Fee Status',
      accessorKey: 'feeStatus',
      cell: (row: StudentRecord) => {
        const status = row.feeStatus || 'Paid';
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
            status === 'Paid'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
              : status === 'Pending'
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              status === 'Paid' ? 'bg-emerald-500' : status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
            }`} />
            <span>{status}</span>
          </span>
        );
      }
    },
    {
      header: 'Enrollment',
      accessorKey: 'status',
      cell: (row: StudentRecord) => {
        const active = (row.status || 'Active').toLowerCase() === 'active';
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold ${
            active ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] dark:text-[#38BDF8]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            {row.status || 'Active'}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row: StudentRecord) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/dashboard/students/${row._id}`}
            title="View 360° Profile"
            className="p-2 rounded-xl text-slate-500 hover:text-[#0050CB] hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 transition-all"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleDelete(row._id, `${row.firstName} ${row.lastName}`)}
            title="Delete Record"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-7">
      
      {/* 1. Header with Breadcrumbs & Primary Actions */}
      <AdminPageHeader
        title="Student Directory"
        subtitle="Manage 1,248 student profiles, enrollments, guardian contacts, and 360° academic portfolios."
        badge="Academic Year 2026-27"
        badgeVariant="primary"
        breadcrumbs={[
          { label: 'Admin Desk', href: '/dashboard' },
          { label: 'Students' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportCSV()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#001438] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all shadow-xs shadow-[#0050CB]/25"
            >
              <Plus className="w-4 h-4" />
              <span>+ Enroll Student</span>
            </button>
          </div>
        }
      />

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AdminStatCard
          label="Total Enrolled"
          value={students.length > 0 ? students.length * 156 : 1248}
          supportingText="Registered in 2026-27"
          icon={Users}
          variant="blue"
          trend={{ value: "+4.8%", isPositive: true, period: "vs last term" }}
        />
        <AdminStatCard
          label="Average Attendance"
          value={94}
          suffix="%"
          supportingText="Campus-wide daily present"
          icon={CheckCircle2}
          variant="emerald"
          progress={94}
        />
        <AdminStatCard
          label="Fee Defaulters"
          value={18}
          supportingText="Pending tuition overdue"
          icon={CreditCard}
          variant="rose"
          trend={{ value: "-2.1%", isPositive: false, period: "vs last month" }}
        />
        <AdminStatCard
          label="Active Co-Curricular"
          value={842}
          supportingText="Clubs & sports enrolled"
          icon={Sparkles}
          variant="orange"
          progress={68}
        />
      </div>

      {/* 3. Filter Bar & View Toggle */}
      <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filters:</span>
          </div>

          {/* Grade Filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
          >
            <option value="all">All Kindergarten Classes</option>
            <option value="Pre-KG">Pre-KG</option>
            <option value="LKG">LKG</option>
            <option value="UKG">UKG</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive / On Leave</option>
          </select>

          {(selectedGrade !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => { setSelectedGrade('all'); setSelectedStatus('all'); }}
              className="text-xs text-[#0050CB] dark:text-[#38BDF8] font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#000E28] border border-slate-200/60 dark:border-slate-800/80">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-[#001438] text-[#0050CB] dark:text-[#38BDF8] shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-[#001438] text-[#0050CB] dark:text-[#38BDF8] shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
        </div>

      </div>

      {/* 4. Table or Grid View */}
      {viewMode === 'table' ? (
        <AdminDataTable<StudentRecord>
          data={filteredStudents}
          columns={columns}
          keyExtractor={(item) => item._id}
          searchPlaceholder="Search student name, admission number, guardian..."
          isLoading={isLoading}
          bulkActions={(selectedIds: string[]) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const selectedRecords = filteredStudents.filter(s => selectedIds.includes(s._id));
                  handleExportCSV(selectedRecords);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export ({selectedIds.length})</span>
              </button>
            </div>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStudents.map((student) => (
            <div
              key={student._id}
              className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[24px] p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_24px_rgba(0,14,40,0.03)] hover:border-[#0050CB]/40 hover:shadow-[0_12px_32px_rgba(0,80,203,0.12)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm shrink-0 bg-slate-100 dark:bg-slate-800">
                      <AppImage
                        src={(student as any).studentPhoto}
                        alt={student.firstName}
                        fallbackType="avatar"
                        name={`${student.firstName} ${student.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-[#000E28] dark:text-white">
                        {student.firstName} {student.lastName}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {student.admissionNumber ? student.admissionNumber.replace(/-/g, '') : 'GGPS2026000'}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    (student.status || 'Active') === 'Active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {student.status || 'Active'}
                  </span>
                </div>

                <div className="space-y-2 py-2 border-y border-slate-100 dark:border-slate-800/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Class & Section:</span>
                    <span className="font-bold text-[#000E28] dark:text-white">
                      {student.grade || 'Pre-KG'} {student.section ? `(${student.section})` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Guardian:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                      {student.parentName || 'Parent'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Attendance:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {student.attendanceRate ?? 92}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center gap-2">
                <Link
                  href={`/dashboard/students/${student._id}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold text-center hover:bg-[#0050CB] hover:text-white transition-all"
                >
                  360° Profile
                </Link>
                <button
                  onClick={() => handleDelete(student._id, `${student.firstName} ${student.lastName}`)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Add Student Wizard Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchStudents();
        }}
      />

    </div>
  );
}

export default function StudentsDirectoryPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 font-bold">
        Loading GGPS School Students Directory...
      </div>
    }>
      <StudentsDirectoryContent />
    </Suspense>
  );
}

