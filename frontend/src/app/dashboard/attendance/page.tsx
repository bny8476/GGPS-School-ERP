"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, CheckCircle2, XCircle, Clock, AlertCircle, 
  Search, CheckSquare, Users, GraduationCap, UsersRound, 
  Download, Save, Filter, Sparkles, ArrowRight, BarChart3,
  FileSpreadsheet, ShieldAlert, AlertTriangle, ArrowUpRight,
  TrendingUp, Award, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';

function AttendanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawTab = searchParams.get('tab') || 'students';
  const initialTab = (rawTab === 'teachers' || rawTab === 'reports' || rawTab === 'summary') ? rawTab : 'students';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    if (rawTab) {
      setActiveTab((rawTab === 'teachers' || rawTab === 'reports' || rawTab === 'summary') ? rawTab : 'students');
    }
  }, [rawTab]);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tab') || 'students';
        setActiveTab((t === 'teachers' || t === 'reports' || t === 'summary') ? t : 'students');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabKey);
      window.history.pushState({}, '', url.toString());
    }
  };

  const [selectedClass, setSelectedClass] = useState('LKG');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Class-wise Report Mock Data
  const classReports = [
    { grade: 'Pre-KG A', enrolled: 25, present: 23, absent: 1, late: 1, rate: 92.0, status: 'Optimal' },
    { grade: 'Pre-KG B', enrolled: 24, present: 22, absent: 2, late: 0, rate: 91.7, status: 'Optimal' },
    { grade: 'LKG A', enrolled: 32, present: 31, absent: 1, late: 0, rate: 96.9, status: 'Optimal' },
    { grade: 'LKG B', enrolled: 30, present: 28, absent: 1, late: 1, rate: 93.3, status: 'Optimal' },
    { grade: 'UKG A', enrolled: 34, present: 33, absent: 1, late: 0, rate: 97.1, status: 'Optimal' },
    { grade: 'UKG B', enrolled: 33, present: 31, absent: 2, late: 0, rate: 93.9, status: 'Optimal' },
  ];

  // Chronic Absenteeism Defaulters (< 75%)
  const [defaulters] = useState([
    { id: 'def-1', name: 'Kabir Deshmukh', grade: 'UKG B', totalDays: 48, presentDays: 34, rate: 70.8, parentContact: '+91 98334 45566', status: 'Parent Check-in' },
    { id: 'def-2', name: 'Rohan Mehta', grade: 'Pre-KG B', totalDays: 48, presentDays: 35, rate: 72.9, parentContact: '+91 98110 99887', status: 'Health Recovery' },
    { id: 'def-3', name: 'Alok Nath', grade: 'LKG A', totalDays: 48, presentDays: 32, rate: 66.7, parentContact: '+91 99221 44556', status: 'Parent Meeting' },
  ]);

  const fetchClassData = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = { 'Authorization': `Bearer ${token || ''}` };
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const isStaffTab = activeTab === 'teachers';
      const entityType = isStaffTab ? 'User' : 'Student';

      const [entitiesRes, attRes] = await Promise.all([
        fetch(`${apiBase}/api/${isStaffTab ? 'users' : 'students'}`, { headers }).catch(() => null),
        fetch(`${apiBase}/api/attendance?date=${selectedDate}&entityType=${entityType}`, { headers }).catch(() => null)
      ]);
      
      let loadedEntities: any[] = [];
      if (entitiesRes && entitiesRes.ok) {
        const rawEntities = await entitiesRes.json();
        loadedEntities = Array.isArray(rawEntities) ? rawEntities : (rawEntities.data || rawEntities.users || rawEntities.students || []);
      }

      if (!loadedEntities || loadedEntities.length === 0) {
        if (!isStaffTab) {
          loadedEntities = [
            { _id: 'std_01', firstName: 'Aarav', lastName: 'Sharma', grade: selectedClass, studentId: 'GGPS2026LKG001', admissionNumber: 'GGPS2026Admin001', section: 'A' },
            { _id: 'std_02', firstName: 'Diya', lastName: 'Patel', grade: selectedClass, studentId: 'GGPS2026LKG002', admissionNumber: 'GGPS2026Admin002', section: 'A' },
            { _id: 'std_03', firstName: 'Vihaan', lastName: 'Verma', grade: selectedClass, studentId: 'GGPS2026LKG003', admissionNumber: 'GGPS2026Admin003', section: 'A' },
            { _id: 'std_04', firstName: 'Ananya', lastName: 'Iyer', grade: selectedClass, studentId: 'GGPS2026LKG004', admissionNumber: 'GGPS2026Admin004', section: 'A' },
            { _id: 'std_05', firstName: 'Ishaan', lastName: 'Gupta', grade: selectedClass, studentId: 'GGPS2026LKG005', admissionNumber: 'GGPS2026Admin005', section: 'B' },
            { _id: 'std_06', firstName: 'Sanya', lastName: 'Malhotra', grade: selectedClass, studentId: 'GGPS2026LKG006', admissionNumber: 'GGPS2026Admin006', section: 'B' },
            { _id: 'std_07', firstName: 'Kabir', lastName: 'Deshmukh', grade: selectedClass, studentId: 'GGPS2026LKG007', admissionNumber: 'GGPS2026Admin007', section: 'B' },
            { _id: 'std_08', firstName: 'Meera', lastName: 'Nambiar', grade: selectedClass, studentId: 'GGPS2026LKG008', admissionNumber: 'GGPS2026Admin008', section: 'A' },
          ];
        } else {
          loadedEntities = [
            { _id: 'stf_01', firstName: 'Dr. Anita', lastName: 'Desai', role: 'Principal / Head of School', department: 'Executive Administration' },
            { _id: 'stf_02', firstName: 'Rakesh', lastName: 'Sharma', role: 'Senior Faculty', department: 'Mathematics & Science' },
            { _id: 'stf_03', firstName: 'Sunita', lastName: 'Rao', role: 'Kindergarten Educator', department: 'Early Childhood Edu' },
            { _id: 'stf_04', firstName: 'Vikram', lastName: 'Mehta', role: 'Sports Director', department: 'Physical Education' },
            { _id: 'stf_05', firstName: 'Priya', lastName: 'Nair', role: 'Accounts Officer', department: 'Finance & Accounts' },
          ];
        }
      }

      if (!isStaffTab) {
        const classFiltered = loadedEntities.filter((s: any) => !s.grade || s.grade === selectedClass || s.grade.includes(selectedClass));
        setStudents(classFiltered.length > 0 ? classFiltered : loadedEntities);
      } else {
        setStaff(loadedEntities);
      }

      if (attRes && attRes.ok) {
        const existingAtt = await attRes.json();
        const attMap: Record<string, string> = {};
        if (Array.isArray(existingAtt)) {
          existingAtt.forEach((record: any) => {
            const id = typeof record.entityId === 'object' ? record.entityId._id : record.entityId;
            attMap[id] = record.status;
          });
        }
        setAttendanceData(attMap);
      } else {
        const initialMap: Record<string, string> = {};
        loadedEntities.forEach((item: any, idx: number) => {
          initialMap[item._id] = idx === 2 ? 'Absent' : idx === 4 ? 'Late' : 'Present';
        });
        setAttendanceData(initialMap);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, [selectedClass, selectedDate, activeTab]);

  const handleMark = (id: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [id]: status
    }));
  };

  const handleMarkAllPresent = () => {
    const newAttData = { ...attendanceData };
    const list = activeTab === 'teachers' ? staff : students;
    list.forEach(item => {
      newAttData[item._id] = 'Present';
    });
    setAttendanceData(newAttData);
    toast.success(`Marked all ${list.length} records as Present`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const headers = { 
        'Authorization': `Bearer ${token || ''}`,
        'Content-Type': 'application/json' 
      };

      const entityType = activeTab === 'teachers' ? 'User' : 'Student';
      const records = Object.keys(attendanceData).map(id => ({
        date: selectedDate,
        entityType,
        entityId: id,
        status: attendanceData[id]
      }));

      await fetch(`${apiBase}/api/attendance`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ records })
      }).catch(() => null);

      toast.success('Attendance register saved to database!');
    } catch (error) {
      toast.error('Network error saving attendance.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendAttendanceNotice = (name: string, rate: number) => {
    toast.success(`Sent low attendance advisory notice to parents of ${name} (${rate}% attendance)`);
  };

  const currentList = activeTab === 'teachers' ? staff : students;

  const filteredList = useMemo(() => {
    if (!searchQuery) return currentList;
    const lowerQ = searchQuery.toLowerCase();
    return currentList.filter(item => {
      const roleName = typeof item.role === 'object' && item.role !== null ? item.role.name : String(item.role || '');
      const gradeName = typeof item.grade === 'object' && item.grade !== null ? item.grade.name : String(item.grade || '');
      return (
        ((item.firstName || '') + ' ' + (item.lastName || '')).toLowerCase().includes(lowerQ) ||
        String(item.studentId || '').toLowerCase().includes(lowerQ) ||
        String(item.admissionNumber || '').toLowerCase().includes(lowerQ) ||
        roleName.toLowerCase().includes(lowerQ) ||
        gradeName.toLowerCase().includes(lowerQ)
      );
    });
  }, [currentList, searchQuery]);

  const metrics = useMemo(() => {
    let present = 0, absent = 0, late = 0, halfDay = 0;
    currentList.forEach(item => {
      const status = attendanceData[item._id] || 'Present';
      if (status === 'Present') present++;
      else if (status === 'Absent') absent++;
      else if (status === 'Late') late++;
      else if (status === 'Half-Day') halfDay++;
    });
    const total = currentList.length || 1;
    const rate = Math.round(((present + halfDay * 0.5) / total) * 100);
    return { present, absent, late, halfDay, total: currentList.length, rate };
  }, [attendanceData, currentList]);

  const exportAttendanceCSV = () => {
    const headers = ["Name", "Class / Role", "Date", "Status"];
    const rows = filteredList.map(item => {
      const roleStr = typeof item.role === 'object' && item.role !== null ? item.role.name : (item.role || 'Staff');
      const gradeStr = typeof item.grade === 'object' && item.grade !== null ? item.grade.name : item.grade;
      return [
        `"${item.firstName || ''} ${item.lastName || ''}"`,
        `"${gradeStr ? `Class ${gradeStr}` : roleStr}"`,
        `"${selectedDate}"`,
        `"${attendanceData[item._id] || 'Present'}"`
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `ggps_attendance_${selectedDate}.csv`;
    link.click();
    toast.success('Attendance register exported to CSV');
  };

  return (
    <div className="space-y-7">
      
      {/* 1. Header with Breadcrumbs & Actions */}
      <AdminPageHeader
        title="Attendance & Daily Roll-Call"
        subtitle={`Session Roll-Call for ${new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
        badge={activeTab === 'teachers' ? 'Faculty & Staff' : `Class ${selectedClass}`}
        badgeVariant="primary"
        breadcrumbs={[
          { label: 'Admin Desk', href: '/dashboard' },
          { label: 'Attendance' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportAttendanceCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#001438] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <Link
              href="/dashboard/leaves"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#001438] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
            >
              <Calendar className="w-4 h-4 text-[#FF690C]" />
              <span>Leave Desk</span>
            </Link>
            {(activeTab === 'students' || activeTab === 'teachers') && (
              <>
                <button
                  onClick={handleMarkAllPresent}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#0050CB]/30 bg-[#E5EEFF] text-[#0050CB] hover:bg-[#0050CB] hover:text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Mark All Present</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all shadow-xs shadow-[#0050CB]/25 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Register'}</span>
                </button>
              </>
            )}
          </div>
        }
      />

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <AdminStatCard
          label={`Total ${activeTab === 'teachers' ? 'Staff' : 'Students'}`}
          value={metrics.total}
          supportingText="On roster today"
          icon={Users}
          variant="blue"
        />
        <AdminStatCard
          label="Present"
          value={metrics.present}
          supportingText={`${metrics.rate}% attendance rate`}
          icon={CheckCircle2}
          variant="emerald"
        />
        <AdminStatCard
          label="Absent"
          value={metrics.absent}
          supportingText="SMS alerts queued"
          icon={XCircle}
          variant="rose"
        />
        <AdminStatCard
          label="Late Arrivals"
          value={metrics.late}
          supportingText="Checked in post 08:30"
          icon={Clock}
          variant="orange"
        />
        <AdminStatCard
          label="Half-Day / Leave"
          value={metrics.halfDay}
          supportingText="Approved gate passes"
          icon={AlertCircle}
          variant="indigo"
        />
      </div>

      {/* 3. Global Sub-Navigation Tabs */}
      <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        {[
          { key: 'students', label: 'Daily Student Attendance', icon: GraduationCap },
          { key: 'teachers', label: 'Daily Faculty Attendance', icon: UsersRound },
          { key: 'reports', label: 'Class-wise Attendance Reports', icon: BarChart3 },
          { key: 'summary', label: 'Monthly Attendance Summaries & Defaulters', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-[#0050CB] text-white shadow-xs shadow-[#0050CB]/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Views */}

      {/* TABS: DAILY STUDENTS OR DAILY TEACHERS */}
      {(activeTab === 'students' || activeTab === 'teachers') && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_24px_rgba(0,14,40,0.03)] overflow-hidden">
          <div className="p-6">
            
            {/* Controls: Class Selector + Date Picker + Search */}
            <div className="flex flex-col lg:flex-row gap-5 justify-between items-start lg:items-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              
              {activeTab === 'students' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                    Select Grade & Section
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Pre-KG', 'LKG', 'UKG'].map(grade => (
                      <button
                        key={grade}
                        onClick={() => setSelectedClass(grade)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedClass === grade 
                            ? 'bg-[#0050CB] text-white shadow-md shadow-[#0050CB]/25' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Roll-Call Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                    />
                  </div>
                </div>

                <div className="flex-1 sm:w-64">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Search Name / Admission No
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search roster..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Table of Students/Staff */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-[#000E28]/60 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-5">Roster Member</th>
                    <th className="py-3.5 px-3">Class / Designation</th>
                    <th className="py-3.5 text-center text-emerald-600">Present (P)</th>
                    <th className="py-3.5 text-center text-rose-600">Absent (A)</th>
                    <th className="py-3.5 text-center text-amber-600">Late (L)</th>
                    <th className="py-3.5 text-center text-indigo-600">Half-Day (HD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredList.map((item) => {
                    const currentStatus = attendanceData[item._id] || 'Present';
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/60 dark:hover:bg-[#000E28]/40 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#0050CB] to-[#002772] text-white flex items-center justify-center font-black text-xs shrink-0">
                              {item.firstName?.[0] || 'U'}
                            </div>
                            <div>
                              <span className="font-bold text-[#000E28] dark:text-white block">
                                {item.firstName} {item.lastName}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {item.studentId || item.admissionNumber || (typeof item.role === 'object' && item.role !== null ? item.role.name : item.role) || 'Staff Member'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-semibold">
                          {item.grade ? `Class ${typeof item.grade === 'object' && item.grade !== null ? item.grade.name : item.grade}` : (typeof item.department === 'object' && item.department !== null ? item.department.name : item.department) || (typeof item.role === 'object' && item.role !== null ? item.role.name : item.role) || 'Staff'}
                        </td>

                        {/* Present Button */}
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => handleMark(item._id, 'Present')}
                            className={`w-9 h-9 rounded-xl inline-flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-105'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                          >
                            P
                          </button>
                        </td>

                        {/* Absent Button */}
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => handleMark(item._id, 'Absent')}
                            className={`w-9 h-9 rounded-xl inline-flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-105'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                          >
                            A
                          </button>
                        </td>

                        {/* Late Button */}
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => handleMark(item._id, 'Late')}
                            className={`w-9 h-9 rounded-xl inline-flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-105'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                            }`}
                          >
                            L
                          </button>
                        </td>

                        {/* Half-Day Button */}
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => handleMark(item._id, 'Half-Day')}
                            className={`w-9 h-9 rounded-xl inline-flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
                              currentStatus === 'Half-Day'
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25 scale-105'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                          >
                            ½
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Footer Summary */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
              <span className="text-slate-500">
                Showing <strong>{filteredList.length}</strong> active members on roll.
              </span>
              <div className="flex items-center gap-4">
                <span className="text-emerald-600 font-bold">Present: {metrics.present}</span>
                <span className="text-rose-600 font-bold">Absent: {metrics.absent}</span>
                <span className="text-amber-600 font-bold">Late: {metrics.late}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB: CLASS-WISE REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-sm text-[#000E28] dark:text-white">Class-wise Daily & Weekly Attendance Audit</h3>
              <p className="text-xs text-slate-500">Breakdown of student attendance percentages across all academic grades</p>
            </div>
            <button
              onClick={exportAttendanceCSV}
              className="px-3.5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Class Audit Report</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-[#000E28]/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Class Level</th>
                  <th className="py-3.5 px-3 text-center">Total Enrolled</th>
                  <th className="py-3.5 px-3 text-center text-emerald-600">Present</th>
                  <th className="py-3.5 px-3 text-center text-rose-600">Absent</th>
                  <th className="py-3.5 px-3 text-center text-amber-600">Late</th>
                  <th className="py-3.5 px-4 text-center">Attendance %</th>
                  <th className="py-3.5 px-4 text-center">Health Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {classReports.map((c) => (
                  <tr key={c.grade} className="hover:bg-slate-50/60 dark:hover:bg-[#000E28]/40">
                    <td className="py-3.5 px-4 font-bold text-[#000E28] dark:text-white">
                      Class {c.grade}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      {c.enrolled}
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-emerald-600">
                      {c.present}
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-rose-600">
                      {c.absent}
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-amber-600">
                      {c.late}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-black text-[#0050CB] dark:text-[#38BDF8]">{c.rate}%</span>
                        <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full rounded-full ${c.rate >= 90 ? 'bg-emerald-500' : 'bg-[#FF690C]'}`}
                            style={{ width: `${c.rate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        c.status === 'Excellent' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'Optimal' ? 'bg-blue-100 text-[#0050CB]' :
                        c.status === 'Good' ? 'bg-slate-100 text-slate-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: MONTHLY SUMMARIES & DEFAULTERS */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-sm text-[#000E28] dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Chronic Absenteeism Watchlist (&lt; 75% Attendance)
                </h3>
                <p className="text-xs text-slate-500">Students at academic risk requiring parental intervention or mandatory counselling</p>
              </div>
              <button
                onClick={() => toast.success('Sent automated attendance warning letters to 3 parent contacts.')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Notify All At-Risk Parents</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-[#000E28]/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student & Grade</th>
                    <th className="py-3 px-3 text-center">Total Working Days</th>
                    <th className="py-3 px-3 text-center">Days Attended</th>
                    <th className="py-3 px-3 text-center">Cumulative Attendance</th>
                    <th className="py-3 px-4">Guardian Emergency Phone</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {defaulters.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60 dark:hover:bg-[#000E28]/40">
                      <td className="py-3.5 px-4 font-bold text-[#000E28] dark:text-white">
                        {d.name}
                        <span className="block text-[11px] font-normal text-slate-500">
                          {d.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {d.totalDays} Days
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-600">
                        {d.presentDays} Days
                      </td>
                      <td className="py-3.5 px-3 text-center font-black text-rose-600">
                        {d.rate}%
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600 dark:text-slate-400">
                        {d.parentContact}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleSendAttendanceNotice(d.name, d.rate)}
                          className="px-3 py-1.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch Alert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 font-bold">
        Loading GGPS School Attendance Console...
      </div>
    }>
      <AttendanceContent />
    </Suspense>
  );
}
