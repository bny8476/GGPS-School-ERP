"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Users, Plus, Edit2, Trash2, Search, Phone, Mail, MapPin,
  GraduationCap, MessageSquare, Send, CheckCircle2, Clock, 
  ExternalLink, UserCheck, AlertCircle, Shield, FileText,
  Building, ChevronRight, X, Sparkles, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AdminDataTable, { Column } from '@/components/admin/AdminDataTable';

interface ParentRecord {
  _id: string;
  fatherName: string;
  fatherOccupation?: string;
  fatherContact?: string;
  motherName: string;
  motherOccupation?: string;
  motherContact?: string;
  guardianName?: string;
  guardianContact?: string;
  primaryEmail: string;
  address: string;
  whatsappNumber?: string;
  students?: Array<{ _id: string; firstName: string; lastName: string; grade: string; section?: string; studentId?: string; admissionNumber?: string }>;
}

interface CommLog {
  id: string;
  recipient: string;
  parentName: string;
  studentName: string;
  channel: 'WhatsApp' | 'SMS' | 'Email';
  subject: string;
  timestamp: string;
  status: 'Delivered' | 'Read' | 'Pending';
}

function ParentsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawTab = searchParams.get('tab') || 'directory';
  const initialTab = (rawTab === 'linked' || rawTab === 'logs') ? rawTab : 'directory';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    if (rawTab) {
      setActiveTab((rawTab === 'linked' || rawTab === 'logs') ? rawTab : 'directory');
    }
  }, [rawTab]);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tab') || 'directory';
        setActiveTab((t === 'linked' || t === 'logs') ? t : 'directory');
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

  const [parents, setParents] = useState<ParentRecord[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState<{ show: boolean; parent: ParentRecord | null }>({ show: false, parent: null });
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Forms
  const [formData, setFormData] = useState({
    fatherName: '',
    fatherOccupation: '',
    fatherContact: '',
    motherName: '',
    motherOccupation: '',
    motherContact: '',
    guardianName: '',
    guardianContact: '',
    primaryEmail: '',
    address: '',
    whatsappNumber: ''
  });

  const [linkStudentForm, setLinkStudentForm] = useState({
    studentId: '',
    relationship: 'Father'
  });

  const [broadcastForm, setBroadcastForm] = useState({
    channel: 'WhatsApp' as 'WhatsApp' | 'SMS' | 'Email',
    targetGroup: 'All Parents',
    subject: '',
    message: ''
  });

  // Mock Communication Logs
  const [commLogs, setCommLogs] = useState<CommLog[]>([
    { id: 'log-1', recipient: '+91 98765 43210', parentName: 'Vikram & Priya Sharma', studentName: 'Aarav Sharma (LKG-A)', channel: 'WhatsApp', subject: 'Term 1 Fee Payment Acknowledgment & Receipt', timestamp: '2026-09-24 10:15 AM', status: 'Read' },
    { id: 'log-2', recipient: '+91 98111 22334', parentName: 'Sanjay & Sunita Patel', studentName: 'Diya Patel (UKG-B)', channel: 'WhatsApp', subject: 'Upcoming Parent-Teacher Executive Conference Invite', timestamp: '2026-09-23 04:30 PM', status: 'Delivered' },
    { id: 'log-3', recipient: '+91 97234 56789', parentName: 'Ananya & Ramesh Verma', studentName: 'Vihaan Verma (UKG-A)', channel: 'SMS', subject: 'Classroom Field Trip Consent Form Required', timestamp: '2026-09-23 09:00 AM', status: 'Delivered' },
    { id: 'log-4', recipient: '+91 94440 12345', parentName: 'Karthik & Deepa Iyer', studentName: 'Ananya Iyer (Pre-KG)', channel: 'Email', subject: 'Monthly Academic & Wellness Newsletter - Sept 2026', timestamp: '2026-09-22 11:45 AM', status: 'Read' },
    { id: 'log-5', recipient: '+91 99887 76655', parentName: 'Meera & Sunil Gupta', studentName: 'Ishaan Gupta (LKG-B)', channel: 'SMS', subject: 'Fee Payment Reminder - Term 1 Dues Pending', timestamp: '2026-09-21 02:20 PM', status: 'Pending' },
  ]);

  const fetchParents = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const headers = { 'Authorization': `Bearer ${token || ''}` };

      const [parentsRes, stuRes] = await Promise.all([
        fetch(`${apiBase}/api/parents`, { headers }).catch(() => null),
        fetch(`${apiBase}/api/students`, { headers }).catch(() => null)
      ]);

      let loadedParents: ParentRecord[] = [];
      let loadedStudents: any[] = [];

      if (parentsRes && parentsRes.ok) {
        loadedParents = await parentsRes.json();
      }
      if (stuRes && stuRes.ok) {
        loadedStudents = await stuRes.json();
      }

      if (!loadedParents || loadedParents.length === 0) {
        loadedParents = [
          {
            _id: 'p-1',
            fatherName: 'Vikram Sharma',
            fatherOccupation: 'Chartered Accountant',
            fatherContact: '+91 98765 43210',
            motherName: 'Priya Sharma',
            motherOccupation: 'Software Architect',
            motherContact: '+91 98765 43211',
            primaryEmail: 'sharma.family@example.com',
            whatsappNumber: '+91 98765 43210',
            address: '42 Orchid Villa, Bandra West, Mumbai',
            students: [
              { _id: 'std_01', firstName: 'Aarav', lastName: 'Sharma', grade: 'LKG', section: 'A', studentId: 'GGPS2026LKG001', admissionNumber: 'GGPS2026Admin001' }
            ]
          },
          {
            _id: 'p-2',
            fatherName: 'Sanjay Patel',
            fatherOccupation: 'Senior Civil Engineer',
            fatherContact: '+91 98111 22334',
            motherName: 'Sunita Patel',
            motherOccupation: 'Physiotherapist',
            motherContact: '+91 98111 22335',
            primaryEmail: 'sanjay.patel@example.com',
            whatsappNumber: '+91 98111 22334',
            address: '15 Silver Palm Residences, Andheri East, Mumbai',
            students: [
              { _id: 'std_02', firstName: 'Diya', lastName: 'Patel', grade: 'UKG', section: 'B', studentId: 'GGPS2026UKG001', admissionNumber: 'GGPS2026Admin002' }
            ]
          },
          {
            _id: 'p-3',
            fatherName: 'Ramesh Verma',
            fatherOccupation: 'Executive Director, PSU',
            fatherContact: '+91 97234 56789',
            motherName: 'Ananya Verma',
            motherOccupation: 'College Lecturer',
            motherContact: '+91 97234 56780',
            primaryEmail: 'verma.household@example.com',
            whatsappNumber: '+91 97234 56789',
            address: '88 Green Meadows Enclave, Powai, Mumbai',
            students: [
              { _id: 'std_03', firstName: 'Vihaan', lastName: 'Verma', grade: 'UKG', section: 'A', studentId: 'GGPS2026UKG002', admissionNumber: 'GGPS2026Admin003' }
            ]
          },
          {
            _id: 'p-4',
            fatherName: 'Karthik Iyer',
            fatherOccupation: 'Senior Research Scientist',
            fatherContact: '+91 94440 12345',
            motherName: 'Deepa Iyer',
            motherOccupation: 'Pediatrician',
            motherContact: '+91 94440 12346',
            primaryEmail: 'karthik.iyer@example.com',
            whatsappNumber: '+91 94440 12345',
            address: 'Flat 402, Lotus Heights, Thane West',
            students: [
              { _id: 'std_04', firstName: 'Ananya', lastName: 'Iyer', grade: 'PreKG', section: 'Lotus', studentId: 'GGPS2026PREKG001', admissionNumber: 'GGPS2026Admin004' }
            ]
          },
          {
            _id: 'p-5',
            fatherName: 'Sunil Gupta',
            fatherOccupation: 'Industrial Merchant',
            fatherContact: '+91 99887 76655',
            motherName: 'Meera Gupta',
            motherOccupation: 'Homemaker',
            motherContact: '+91 99887 76656',
            primaryEmail: 'meera.gupta@example.com',
            whatsappNumber: '+91 99887 76655',
            address: 'B-12 Hill View Towers, Malabar Hill, Mumbai',
            students: [
              { _id: 'std_05', firstName: 'Ishaan', lastName: 'Gupta', grade: 'LKG', section: 'B', studentId: 'GGPS2026LKG002', admissionNumber: 'GGPS2026Admin005' }
            ]
          }
        ];
      }

      setParents(loadedParents);
      setStudentsList(loadedStudents.length > 0 ? loadedStudents : [
        { _id: 'std_01', firstName: 'Aarav', lastName: 'Sharma', grade: 'LKG', studentId: 'GGPS2026LKG001', admissionNumber: 'GGPS2026Admin001' },
        { _id: 'std_02', firstName: 'Diya', lastName: 'Patel', grade: 'UKG', studentId: 'GGPS2026UKG001', admissionNumber: 'GGPS2026Admin002' },
        { _id: 'std_03', firstName: 'Vihaan', lastName: 'Verma', grade: 'UKG', studentId: 'GGPS2026UKG002', admissionNumber: 'GGPS2026Admin003' },
        { _id: 'std_04', firstName: 'Ananya', lastName: 'Iyer', grade: 'PreKG', studentId: 'GGPS2026PREKG001', admissionNumber: 'GGPS2026Admin004' },
        { _id: 'std_05', firstName: 'Ishaan', lastName: 'Gupta', grade: 'LKG', studentId: 'GGPS2026LKG002', admissionNumber: 'GGPS2026Admin005' },
      ]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load parents list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const resetForm = () => {
    setFormData({
      fatherName: '', fatherOccupation: '', fatherContact: '',
      motherName: '', motherOccupation: '', motherContact: '',
      guardianName: '', guardianContact: '', primaryEmail: '',
      address: '', whatsappNumber: ''
    });
    setEditingParentId(null);
    setShowAddModal(false);
  };

  const openEdit = (parent: ParentRecord) => {
    setEditingParentId(parent._id);
    setFormData({
      fatherName: parent.fatherName,
      fatherOccupation: parent.fatherOccupation || '',
      fatherContact: parent.fatherContact || '',
      motherName: parent.motherName,
      motherOccupation: parent.motherOccupation || '',
      motherContact: parent.motherContact || '',
      guardianName: parent.guardianName || '',
      guardianContact: parent.guardianContact || '',
      primaryEmail: parent.primaryEmail,
      address: parent.address,
      whatsappNumber: parent.whatsappNumber || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the parent profile for ${name}?`)) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      await fetch(`${apiBase}/api/parents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token || ''}` }
      });
      setParents(prev => prev.filter(p => p._id !== id));
      toast.success('Parent profile removed successfully');
    } catch (error) {
      toast.error('Could not remove parent profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const url = editingParentId ? `${apiBase}/api/parents/${editingParentId}` : `${apiBase}/api/parents`;

      await fetch(url, {
        method: editingParentId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || ''}` },
        body: JSON.stringify(formData)
      });

      if (editingParentId) {
        setParents(prev => prev.map(p => p._id === editingParentId ? { ...p, ...formData } : p));
        toast.success('Parent profile updated successfully!');
      } else {
        const newRecord: ParentRecord = {
          _id: 'p-' + Date.now(),
          ...formData,
          students: []
        };
        setParents(prev => [newRecord, ...prev]);
        toast.success('Parent enrolled successfully!');
      }

      resetForm();
    } catch (error) {
      toast.error('Network error saving parent data');
    }
  };

  const handleLinkStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showLinkModal.parent || !linkStudentForm.studentId) return;

    const targetStudent = studentsList.find(s => s._id === linkStudentForm.studentId);
    if (!targetStudent) return;

    setParents(prev => prev.map(p => {
      if (p._id === showLinkModal.parent?._id) {
        const existing = p.students || [];
        if (existing.some(s => s._id === targetStudent._id)) {
          toast.error('Student is already linked to this parent profile');
          return p;
        }
        return {
          ...p,
          students: [...existing, {
            _id: targetStudent._id,
            firstName: targetStudent.firstName,
            lastName: targetStudent.lastName,
            grade: targetStudent.grade || 'LKG',
            studentId: targetStudent.studentId || 'GGPS2026LKG001',
            admissionNumber: targetStudent.admissionNumber || 'GGPS2026Admin001'
          }]
        };
      }
      return p;
    }));

    toast.success(`Linked ${targetStudent.firstName} ${targetStudent.lastName} to ${showLinkModal.parent.fatherName || showLinkModal.parent.motherName}`);
    setShowLinkModal({ show: false, parent: null });
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: CommLog = {
      id: 'log-' + Date.now(),
      recipient: broadcastForm.targetGroup === 'All Parents' ? 'All Enrolled Parents (1,248)' : 'Class Pre-KG Parents',
      parentName: broadcastForm.targetGroup,
      studentName: 'Broadcast Group',
      channel: broadcastForm.channel,
      subject: broadcastForm.subject,
      timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Delivered'
    };
    setCommLogs(prev => [newLog, ...prev]);
    toast.success(`Dispatched ${broadcastForm.channel} circular to ${broadcastForm.targetGroup}!`);
    setShowBroadcastModal(false);
    setBroadcastForm({ channel: 'WhatsApp', targetGroup: 'All Parents', subject: '', message: '' });
  };

  // Stats
  const totalFamilies = parents.length;
  const totalLinkedKids = parents.reduce((sum, p) => sum + (p.students?.length || 0), 0);
  const whatsappActive = parents.filter(p => p.whatsappNumber).length;
  const singleGuardians = parents.filter(p => !p.fatherName || !p.motherName || p.guardianName).length;

  // Filtered
  const filteredParents = useMemo(() => {
    if (!searchQuery) return parents;
    const q = searchQuery.toLowerCase();
    return parents.filter(p => 
      p.fatherName.toLowerCase().includes(q) || 
      p.motherName.toLowerCase().includes(q) ||
      p.primaryEmail.toLowerCase().includes(q) ||
      (p.whatsappNumber && p.whatsappNumber.includes(q)) ||
      (p.students && p.students.some(s => s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q)))
    );
  }, [parents, searchQuery]);

  // Linked list flat map
  const linkedList = useMemo(() => {
    const list: Array<{ parent: ParentRecord; student: any }> = [];
    parents.forEach(p => {
      if (p.students && p.students.length > 0) {
        p.students.forEach(s => {
          list.push({ parent: p, student: s });
        });
      }
    });
    return list;
  }, [parents]);

  return (
    <div className="space-y-7">
      
      {/* 1. Header with Actions */}
      <AdminPageHeader
        title="Parents & Family Directory"
        subtitle="Manage verified parent profiles, primary guardian emergency links, enrolled student relationships, and family communication channels."
        badge="Academic Year 2026-27"
        badgeVariant="primary"
        breadcrumbs={[
          { label: 'Admin Desk', href: '/dashboard' },
          { label: 'Parents Hub' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#001438] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#FF690C]" />
              <span>Broadcast Notice</span>
            </button>
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all shadow-xs shadow-[#0050CB]/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Register Parent</span>
            </button>
          </div>
        }
      />

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AdminStatCard
          label="Registered Families"
          value={totalFamilies}
          supportingText="Verified household records"
          icon={Users}
          variant="blue"
        />
        <AdminStatCard
          label="Linked Students"
          value={totalLinkedKids}
          supportingText="Active student associations"
          icon={GraduationCap}
          variant="emerald"
        />
        <AdminStatCard
          label="WhatsApp Channel Active"
          value={whatsappActive}
          supportingText="Instant SMS/WhatsApp reachable"
          icon={Phone}
          variant="orange"
          progress={totalFamilies > 0 ? Math.round((whatsappActive / totalFamilies) * 100) : 100}
        />
        <AdminStatCard
          label="Special Guardians / Solo"
          value={singleGuardians}
          supportingText="Designated legal guardians"
          icon={Shield}
          variant="rose"
        />
      </div>

      {/* 3. Global Sub-Navigation Tabs */}
      <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-1">
        {[
          { key: 'directory', label: 'Parent Directory', icon: Users, count: parents.length },
          { key: 'linked', label: 'Linked Students & Siblings', icon: GraduationCap, count: linkedList.length },
          { key: 'logs', label: 'Communication Logs', icon: MessageSquare, count: commLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-[#0050CB] text-white shadow-xs shadow-[#0050CB]/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white text-[#0050CB]' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Views */}

      {/* TAB: DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-5">
          <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search parent by father, mother, email, phone, or child's name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#000E28] rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none focus:border-[#0050CB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParents.map((parent) => (
              <div
                key={parent._id}
                className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 p-6 flex flex-col justify-between hover:shadow-lg transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#0050CB] to-[#002772] text-white flex items-center justify-center font-black text-sm shrink-0">
                      {parent.fatherName?.[0] || 'P'}{parent.motherName?.[0] || 'M'}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(parent)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 hover:text-[#0050CB] transition-all cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(parent._id, `${parent.fatherName} & ${parent.motherName}`)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-[#000E28] dark:text-white leading-tight">
                      {parent.fatherName} {parent.motherName && `& ${parent.motherName}`}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {parent.primaryEmail}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#000E28]/60 border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                    {parent.fatherName && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Father:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                          {parent.fatherOccupation || 'Guardian'} • {parent.fatherContact || '-'}
                        </span>
                      </div>
                    )}
                    {parent.motherName && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Mother:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                          {parent.motherOccupation || 'Guardian'} • {parent.motherContact || '-'}
                        </span>
                      </div>
                    )}
                    {parent.whatsappNumber && (
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/50 dark:border-slate-800 text-emerald-600">
                        <span className="font-bold text-[10px] uppercase flex items-center gap-1">
                          <Phone className="w-3 h-3" /> WhatsApp:
                        </span>
                        <span className="font-mono font-bold">{parent.whatsappNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Linked Students List */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Enrolled Children ({parent.students?.length || 0})
                      </span>
                      <button
                        onClick={() => setShowLinkModal({ show: true, parent })}
                        className="text-[11px] font-bold text-[#0050CB] hover:underline cursor-pointer"
                      >
                        + Link Child
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {parent.students && parent.students.length > 0 ? (
                        parent.students.map(s => (
                          <div
                            key={s._id}
                            className="p-2 rounded-xl bg-[#E5EEFF]/60 dark:bg-[#0050CB]/15 border border-[#0050CB]/20 flex justify-between items-center text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5 text-[#0050CB]" />
                              <span className="font-bold text-[#000E28] dark:text-white">
                                {s.firstName} {s.lastName}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-[#0050CB] text-white font-mono text-[10px] font-bold">
                              Class {s.grade}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs italic">
                          No student linked yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={parent.address}>
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {parent.address}
                  </span>
                  <button
                    onClick={() => {
                      setBroadcastForm({
                        channel: 'WhatsApp',
                        targetGroup: `${parent.fatherName || parent.motherName}`,
                        subject: '',
                        message: ''
                      });
                      setShowBroadcastModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold cursor-pointer"
                    title="Send Direct WhatsApp Message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: LINKED STUDENTS */}
      {activeTab === 'linked' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-sm text-[#000E28] dark:text-white">Student to Guardian Relationship Mapping</h3>
              <p className="text-xs text-slate-500">Overview of student profiles linked to verified parent accounts</p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Total {linkedList.length} associations active
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-[#000E28]/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student Name & Admission</th>
                  <th className="py-3 px-3">Class Level</th>
                  <th className="py-3 px-4">Primary Guardian</th>
                  <th className="py-3 px-3">Contact Phone</th>
                  <th className="py-3 px-4">Official Email</th>
                  <th className="py-3 px-4 text-center">Guardian Relationship</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {linkedList.map(({ parent, student }, idx) => (
                  <tr key={`${parent._id}-${student._id}-${idx}`} className="hover:bg-slate-50/60 dark:hover:bg-[#000E28]/40">
                    <td className="py-3.5 px-4 font-bold text-[#000E28] dark:text-white">
                      {student.firstName} {student.lastName}
                      <span className="block text-[11px] font-normal text-slate-500 font-mono">
                        {student.studentId || student.admissionNumber || 'GGPS2026LKG001'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] font-bold text-[11px]">
                        Class {student.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {parent.fatherName} {parent.motherName && `& ${parent.motherName}`}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {parent.whatsappNumber || parent.fatherContact || parent.motherContact || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {parent.primaryEmail}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Verified Parents
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: COMMUNICATION LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-sm text-[#000E28] dark:text-white">Automated & Direct Communication Logs</h3>
              <p className="text-xs text-slate-500">History of dispatched SMS, WhatsApp notices, and fee alerts sent to parents</p>
            </div>
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-4 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose Message</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-[#000E28]/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Recipient & Student</th>
                  <th className="py-3 px-4">Message Subject / Circular</th>
                  <th className="py-3 px-3">Dispatched Timestamp</th>
                  <th className="py-3 px-3 text-center">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {commLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-[#000E28]/40">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        log.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' :
                        log.channel === 'SMS' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {log.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#000E28] dark:text-white">
                      {log.parentName}
                      <span className="block text-[11px] font-normal text-slate-500">
                        {log.studentName} • {log.recipient}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {log.subject}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        log.status === 'Read' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        log.status === 'Delivered' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Register / Edit Parent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#001438] rounded-[28px] max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-[#000E28] dark:text-white">
                {editingParentId ? 'Update Parent Profile' : 'Enroll New Parent / Guardian'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Father's Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                    placeholder="e.g. Vikram Sharma"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Father's Occupation</label>
                  <input
                    type="text"
                    value={formData.fatherOccupation}
                    onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                    placeholder="e.g. Software Consultant"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Mother's Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                    placeholder="e.g. Priya Sharma"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Mother's Occupation</label>
                  <input
                    type="text"
                    value={formData.motherOccupation}
                    onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                    placeholder="e.g. Architect"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Primary Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.primaryEmail}
                    onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                    placeholder="sharma.family@example.com"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">WhatsApp Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Residential Address *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-medium"
                  placeholder="Street, apartment, city, pincode"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {editingParentId ? 'Save Profile Changes' : 'Register Parent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Student Modal */}
      {showLinkModal.show && showLinkModal.parent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#001438] rounded-[28px] max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-[#000E28] dark:text-white">Link Student to Family</h3>
              <button onClick={() => setShowLinkModal({ show: false, parent: null })} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLinkStudent} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#000E28] rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Parent Household</span>
                <span className="font-bold text-sm text-[#000E28] dark:text-white">
                  {showLinkModal.parent.fatherName} & {showLinkModal.parent.motherName}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Select Student</label>
                <select
                  value={linkStudentForm.studentId}
                  onChange={(e) => setLinkStudentForm({ ...linkStudentForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                  required
                >
                  <option value="">-- Choose student from directory --</option>
                  {studentsList.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} (Class {s.grade}) - {s.admissionNumber || 'GGPS'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Primary Relationship</label>
                <select
                  value={linkStudentForm.relationship}
                  onChange={(e) => setLinkStudentForm({ ...linkStudentForm, relationship: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                >
                  <option>Biological Child</option>
                  <option>Adopted / Ward</option>
                  <option>Legal Guardian</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLinkModal({ show: false, parent: null })}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Confirm Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Message Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#001438] rounded-[28px] max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-[#000E28] dark:text-white">Compose Notice to Parents</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Channel</label>
                  <select
                    value={broadcastForm.channel}
                    onChange={(e: any) => setBroadcastForm({ ...broadcastForm, channel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS">SMS Gateway</option>
                    <option value="Email">Official Email</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Target Group</label>
                  <select
                    value={broadcastForm.targetGroup}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                  >
                    <option>All Parents</option>
                    <option>Pre-KG & Kindergarten</option>
                    <option>Primary (Grades 1-5)</option>
                    <option>Middle (Grades 6-8)</option>
                    <option>Secondary (Grades 9-10)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Subject / Header</label>
                <input
                  type="text"
                  required
                  value={broadcastForm.subject}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                  placeholder="e.g. Tomorrow Campus Advisory / Event Circular"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Circular Content</label>
                <textarea
                  rows={4}
                  required
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-medium"
                  placeholder="Type official communication message here..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ParentsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 font-bold">
        Loading GGPS School Parents Hub...
      </div>
    }>
      <ParentsPageContent />
    </Suspense>
  );
}
