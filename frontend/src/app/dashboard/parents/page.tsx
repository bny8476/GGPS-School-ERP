"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Users, Plus, Edit2, Trash2, Search, Phone, Mail, MapPin,
  GraduationCap, MessageSquare, Send, CheckCircle2, Clock, 
  ExternalLink, UserCheck, AlertCircle, Shield, FileText,
  Building, ChevronRight, X, Sparkles, Filter,
  Key, RefreshCw, Copy, Check, Eye, EyeOff, Lock, Smartphone,
  Wrench, User, RotateCw, Star, Award, Link2
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AdminDataTable, { Column } from '@/components/admin/AdminDataTable';
import { FieldError } from '@/components/ui/FieldError';
import {
  ParentRegistrationSchema,
  BroadcastMessageSchema,
  LinkStudentSchema,
} from '@/schemas';
import {
  preventNonAlphaKey,
  preventNonNumericKey,
  sanitizeNameInput,
  sanitizePhoneInput,
  handleNamePaste,
  handlePhonePaste,
} from '@/lib/validationUtils';
import { getApiBaseUrl } from '@/lib/utils';

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
  userId?: string;
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

  // Option 5: Provisioning Modal State
  const [provisionModal, setProvisionModal] = useState<{
    isOpen: boolean;
    parent: ParentRecord | null;
    student: any | null;
    customPassword: string;
    cycleIndex: number;
    showPassword: boolean;
    copied: boolean;
    isSaving: boolean;
    smsSent: boolean;
  }>({
    isOpen: false,
    parent: null,
    student: null,
    customPassword: '',
    cycleIndex: 0,
    showPassword: true,
    copied: false,
    isSaving: false,
    smsSent: false,
  });

  // Persisted provisioning map
  const [provisionedMap, setProvisionedMap] = useState<Record<string, { password?: string; provisionedAt: string; via: string }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ggps_parent_provisioned_map');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

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

  // Form error states
  const [parentErrors, setParentErrors] = useState<Record<string, string>>({});
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({});
  const [broadcastErrors, setBroadcastErrors] = useState<Record<string, string>>({});

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
      const apiBase = getApiBaseUrl();
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

      // Read persistent linked students from localStorage
      let localLinks: Record<string, any[]> = {};
      if (typeof window !== 'undefined') {
        try {
          localLinks = JSON.parse(localStorage.getItem('ggps_parent_links_map') || '{}');
        } catch {}
      }

      const mergedParents = loadedParents.map(p => {
        const storedStudents = localLinks[p._id] || localLinks[p.primaryEmail] || [];
        const existingStudents = p.students || [];
        const combined = [...existingStudents];
        
        storedStudents.forEach(st => {
          if (!combined.some(c => c._id === st._id)) {
            combined.push(st);
          }
        });

        // Always ensure default primary ward for Vikram Sharma if empty
        if (combined.length === 0 && p.primaryEmail === 'sharma.family@example.com') {
          combined.push({
            _id: 'std_01',
            firstName: 'Aarav',
            lastName: 'Sharma',
            grade: 'LKG',
            section: 'A',
            studentId: 'GGPS2026LKG001',
            admissionNumber: 'GGPS2026Admin001'
          });
        }

        return {
          ...p,
          students: combined
        };
      });

      setParents(mergedParents);
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
      const apiBase = getApiBaseUrl();
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
    const validation = ParentRegistrationSchema.safeParse({
      fatherName: formData.fatherName || undefined,
      fatherOccupation: formData.fatherOccupation || undefined,
      fatherContact: formData.fatherContact || undefined,
      motherName: formData.motherName || undefined,
      motherOccupation: formData.motherOccupation || undefined,
      motherContact: formData.motherContact || undefined,
      guardianName: formData.guardianName || undefined,
      guardianContact: formData.guardianContact || undefined,
      primaryEmail: formData.primaryEmail,
      address: formData.address,
      whatsappNumber: formData.whatsappNumber || undefined,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : 'general';
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setParentErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || 'Please fix parent form errors');
      return;
    }
    setParentErrors({});

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = getApiBaseUrl();
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
    if (!showLinkModal.parent) return;

    const validation = LinkStudentSchema.safeParse({
      studentId: linkStudentForm.studentId,
      relationship: linkStudentForm.relationship,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : 'general';
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setLinkErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || 'Please select a student');
      return;
    }
    setLinkErrors({});

    const targetStudent = studentsList.find(s => s._id === linkStudentForm.studentId);
    if (!targetStudent) return;

    const currentParent = parents.find(p => p._id === showLinkModal.parent?._id) || showLinkModal.parent;
    const existing = currentParent.students || [];
    if (existing.some(s => s._id === targetStudent._id)) {
      setLinkErrors({ studentId: 'Student is already linked to this parent profile' });
      toast.error('Student is already linked to this parent profile');
      return;
    }

    const newStudentObj = {
      _id: targetStudent._id,
      firstName: targetStudent.firstName,
      lastName: targetStudent.lastName,
      grade: targetStudent.grade || 'LKG',
      studentId: targetStudent.studentId || 'GGPS2026LKG001',
      admissionNumber: targetStudent.admissionNumber || 'GGPS2026Admin001'
    };

    // Save to backend API asynchronously
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = getApiBaseUrl();
      fetch(`${apiBase}/api/parents/${currentParent._id}/children`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          studentId: targetStudent._id,
          parentEmail: currentParent.primaryEmail,
          relationship: linkStudentForm.relationship,
          firstName: targetStudent.firstName,
          lastName: targetStudent.lastName,
          admissionNumber: targetStudent.admissionNumber || targetStudent.studentId,
          grade: targetStudent.grade,
        })
      }).catch(() => {});
    } catch {}

    // Save to localStorage so link NEVER disappears across refreshes
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('ggps_parent_links_map') || '{}');
        const list = stored[currentParent._id] || stored[currentParent.primaryEmail] || [];
        if (!list.some((s: any) => s._id === targetStudent._id)) {
          list.push(newStudentObj);
        }
        stored[currentParent._id] = list;
        stored[currentParent.primaryEmail] = list;
        localStorage.setItem('ggps_parent_links_map', JSON.stringify(stored));
      } catch {}
    }

    setParents(prev => prev.map(p => {
      if (p._id === currentParent._id || p.primaryEmail === currentParent.primaryEmail) {
        return {
          ...p,
          students: [...(p.students || []), newStudentObj]
        };
      }
      return p;
    }));

    toast.success(`Linked ${targetStudent.firstName} ${targetStudent.lastName} to ${currentParent.fatherName || currentParent.motherName}`);
    setShowLinkModal({ show: false, parent: null });
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = BroadcastMessageSchema.safeParse({
      channel: broadcastForm.channel,
      targetGroup: broadcastForm.targetGroup,
      subject: broadcastForm.subject,
      message: broadcastForm.message,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : 'general';
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setBroadcastErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || 'Please fix broadcast notice errors');
      return;
    }
    setBroadcastErrors({});

    const newLog: CommLog = {
      id: 'log-' + Date.now(),
      recipient: broadcastForm.targetGroup === 'All Parents' ? 'All Enrolled Parents (1,248)' : 'Class Pre-KG Parents',
      parentName: broadcastForm.targetGroup,
      studentName: 'Broadcast Group',
      channel: broadcastForm.channel,
      subject: broadcastForm.subject.trim(),
      timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Delivered'
    };
    setCommLogs(prev => [newLog, ...prev]);
    toast.success(`Dispatched ${broadcastForm.channel} circular to ${broadcastForm.targetGroup}!`);
    setShowBroadcastModal(false);
    setBroadcastForm({ channel: 'WhatsApp', targetGroup: 'All Parents', subject: '', message: '' });
  };

  // Option 5: Provisioning Helper Functions
  const getSuggestedPassword = (studentName?: string, admNo?: string, cycleIndex = 0) => {
    const rawFirst = (studentName || 'Student').trim().split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'Student';
    const cleanFirst = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
    const cleanAdm = admNo ? admNo.replace(/\D/g, '').slice(-4) : '2026';
    const last4 = cleanAdm || '2026';
    const randomPin = Math.floor(1000 + Math.random() * 9000);

    const patterns = [
      `${cleanFirst}@2026`,
      `GGPS@${last4}`,
      `Welcome#${randomPin}`,
      `${cleanFirst}#${last4}`,
    ];
    return patterns[cycleIndex % patterns.length];
  };

  const handleOpenProvision = (parent: ParentRecord, student?: any) => {
    const targetStudent = student || (parent.students && parent.students[0]) || null;
    const existing = provisionedMap[parent._id];
    const initialPassword = existing?.password || getSuggestedPassword(
      targetStudent?.firstName,
      targetStudent?.admissionNumber || targetStudent?.studentId,
      0
    );

    setProvisionModal({
      isOpen: true,
      parent,
      student: targetStudent,
      customPassword: initialPassword,
      cycleIndex: 0,
      showPassword: true,
      copied: false,
      isSaving: false,
      smsSent: false,
    });
  };

  const handleCyclePassword = () => {
    if (!provisionModal.parent) return;
    const nextIndex = provisionModal.cycleIndex + 1;
    const nextPassword = getSuggestedPassword(
      provisionModal.student?.firstName,
      provisionModal.student?.admissionNumber || provisionModal.student?.studentId,
      nextIndex
    );
    setProvisionModal(prev => ({
      ...prev,
      cycleIndex: nextIndex,
      customPassword: nextPassword,
      copied: false,
    }));
  };

  const formatPortalMessage = (parent: ParentRecord, student: any, password: string) => {
    const guardianName = parent.fatherName || parent.motherName || parent.guardianName || 'Parent Guardian';
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'your child';
    const admNo = String(student?.studentId || student?.admissionNumber || 'GGPS2026').replace(/-/g, '');
    const loginUrl = 'https://ggps-school-erp.vercel.app/login';
    const username = parent.primaryEmail || parent.whatsappNumber || parent.fatherContact || 'Registered Email';
    const phone = parent.whatsappNumber || parent.fatherContact || parent.motherContact || '';

    return `*Garden Guru Public School – Parent Portal Access*

Dear ${guardianName},

Your official GGPS Parent Portal account for *${studentName}* (Adm: ${admNo}) is now active!

🌐 *Portal Link:* ${loginUrl}
👤 *Login Email / Username:* ${username}
${phone ? `📱 *Registered Mobile:* ${phone}\n` : ''}🔑 *Temporary Password:* ${password}

*With this portal you can view:*
✓ Daily Attendance & Real-time Alerts
✓ Homework & Daily Diary Notes
✓ Fee Receipts & Dues Clearance
✓ Term Examination Marks & Report Cards
✓ Direct Communication with Class Teachers

🔒 *Notice:* Please sign in and update your password upon first login.
Need help? Contact School Administration at +91 98765 43210.`;
  };

  const handleCopyCredentials = async () => {
    if (!provisionModal.parent) return;
    const text = formatPortalMessage(provisionModal.parent, provisionModal.student, provisionModal.customPassword);
    try {
      await navigator.clipboard.writeText(text);
      setProvisionModal(prev => ({ ...prev, copied: true }));
      toast.success('Credentials and portal instructions copied to clipboard!');
      setTimeout(() => {
        setProvisionModal(prev => ({ ...prev, copied: false }));
      }, 3000);
    } catch {
      toast.error('Unable to auto-copy to clipboard. Please copy manually.');
    }
  };

  const handleSendWhatsApp = (parent: ParentRecord, student: any, password: string) => {
    const phone = parent.whatsappNumber || parent.fatherContact || parent.motherContact || '';
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('No valid 10-digit mobile number found for this guardian');
      return;
    }
    const text = formatPortalMessage(parent, student, password);
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    toast.success(`Opening WhatsApp Web for +91 ${cleanPhone}`);

    handleSaveProvision(parent, student, password, 'WhatsApp');
  };

  const handleSendSMS = (parent: ParentRecord, student: any, password: string) => {
    const phone = parent.fatherContact || parent.whatsappNumber || parent.motherContact || '';
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('No valid 10-digit mobile number found for SMS dispatch');
      return;
    }

    const newLog: CommLog = {
      id: 'log-' + Date.now(),
      recipient: `+91 ${cleanPhone}`,
      parentName: parent.fatherName || parent.motherName || 'Parent Guardian',
      studentName: `${student?.firstName || 'Student'} (${student?.grade || 'Class'})`,
      channel: 'SMS',
      subject: `Portal Access Provisioned — Initial Password: ${password}`,
      timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Delivered',
    };
    setCommLogs(prev => [newLog, ...prev]);
    toast.success(`SMS Gateway: Login credentials dispatched to +91 ${cleanPhone}!`);
    setProvisionModal(prev => ({ ...prev, smsSent: true }));

    handleSaveProvision(parent, student, password, 'SMS');
  };

  const handleSaveProvision = async (parent: ParentRecord, student: any, password: string, via = 'Direct') => {
    setProvisionModal(prev => ({ ...prev, isSaving: true }));
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = getApiBaseUrl();
      
      try {
        await fetch(`${apiBase}/api/parents/${parent._id}/provision-access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`,
          },
          body: JSON.stringify({
            password,
            email: parent.primaryEmail,
            phone: parent.whatsappNumber || parent.fatherContact || parent.motherContact,
            fatherName: parent.fatherName,
            motherName: parent.motherName,
            address: parent.address,
            channel: via,
          }),
        });
      } catch {
        // Local state fallback
      }

      const updatedMap = {
        ...provisionedMap,
        [parent._id]: {
          email: parent.primaryEmail,
          password,
          provisionedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          via,
        },
      };
      setProvisionedMap(updatedMap);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ggps_parent_provisioned_map', JSON.stringify(updatedMap));
      }
      toast.success(`Portal login access active for ${parent.fatherName || parent.motherName}!`);
    } finally {
      setProvisionModal(prev => ({ ...prev, isSaving: false }));
    }
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
                  <th className="py-3 px-4">Student & Admission</th>
                  <th className="py-3 px-3">Class Level</th>
                  <th className="py-3 px-4">Primary Guardian</th>
                  <th className="py-3 px-3">Contact Phone</th>
                  <th className="py-3 px-4">Official Email</th>
                  <th className="py-3 px-3 text-center">Portal Login Status</th>
                  <th className="py-3 px-4 text-center">Portal Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {linkedList.map(({ parent, student }, idx) => {
                  const isProvisioned = Boolean(parent.userId || provisionedMap[parent._id]);
                  const currentPassword = provisionedMap[parent._id]?.password || getSuggestedPassword(student.firstName, student.admissionNumber || student.studentId);
                  return (
                    <tr key={`${parent._id}-${student._id}-${idx}`} className="hover:bg-slate-50/60 dark:hover:bg-[#000E28]/40 transition-colors">
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
                        <span className="block text-[10px] font-normal text-slate-400">Verified Guardian</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {parent.whatsappNumber || parent.fatherContact || parent.motherContact || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {parent.primaryEmail}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {isProvisioned ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active Access
                            </span>
                            {provisionedMap[parent._id]?.provisionedAt && (
                              <span className="text-[9px] text-slate-400 mt-0.5 font-medium">
                                via {provisionedMap[parent._id].via}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            Not Provisioned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isProvisioned ? (
                            <>
                              <button
                                onClick={() => handleOpenProvision(parent, student)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0050CB] hover:bg-[#E5EEFF] dark:hover:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] font-bold text-xs transition-all shadow-xs cursor-pointer"
                                title="View credentials or reset password"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span>Access Card</span>
                              </button>
                              <button
                                onClick={() => handleSendWhatsApp(parent, student, currentPassword)}
                                className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold cursor-pointer border border-emerald-200 dark:border-emerald-800"
                                title="Send Credentials via WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenProvision(parent, student)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-black text-xs transition-all shadow-xs shadow-[#0050CB]/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                              title="Provision Parent Portal Login"
                            >
                              <Key className="w-3.5 h-3.5 text-amber-300" />
                              <span>🔑 Provision Login</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Father's Full Name <span className="text-[#FF690C]">*</span>
                  </label>
                  <input
                    type="text"
                    id="parent-father"
                    onKeyDown={preventNonAlphaKey}
                    onPaste={(e) => handleNamePaste(e, (clean) => {
                      setFormData(prev => ({ ...prev, fatherName: clean }));
                      if (parentErrors.fatherName) setParentErrors(prev => ({ ...prev, fatherName: '' }));
                    })}
                    value={formData.fatherName}
                    onChange={(e) => {
                      setFormData({ ...formData, fatherName: sanitizeNameInput(e.target.value) });
                      if (parentErrors.fatherName) setParentErrors(prev => ({ ...prev, fatherName: '' }));
                    }}
                    aria-invalid={Boolean(parentErrors.fatherName)}
                    aria-describedby={parentErrors.fatherName ? "parent-father-err" : undefined}
                    className={`w-full px-3 py-2 rounded-xl border font-bold ${
                      parentErrors.fatherName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'
                    }`}
                    placeholder="e.g. Vikram Sharma"
                  />
                  <FieldError id="parent-father-err" error={parentErrors.fatherName} />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Father's Occupation</label>
                  <input
                    type="text"
                    id="parent-fatherOcc"
                    value={formData.fatherOccupation}
                    onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                    placeholder="e.g. Software Consultant"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Mother's Full Name <span className="text-[#FF690C]">*</span>
                  </label>
                  <input
                    type="text"
                    id="parent-mother"
                    onKeyDown={preventNonAlphaKey}
                    onPaste={(e) => handleNamePaste(e, (clean) => {
                      setFormData(prev => ({ ...prev, motherName: clean }));
                      if (parentErrors.motherName) setParentErrors(prev => ({ ...prev, motherName: '' }));
                    })}
                    value={formData.motherName}
                    onChange={(e) => {
                      setFormData({ ...formData, motherName: sanitizeNameInput(e.target.value) });
                      if (parentErrors.motherName) setParentErrors(prev => ({ ...prev, motherName: '' }));
                    }}
                    aria-invalid={Boolean(parentErrors.motherName)}
                    aria-describedby={parentErrors.motherName ? "parent-mother-err" : undefined}
                    className={`w-full px-3 py-2 rounded-xl border font-bold ${
                      parentErrors.motherName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'
                    }`}
                    placeholder="e.g. Priya Sharma"
                  />
                  <FieldError id="parent-mother-err" error={parentErrors.motherName} />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Mother's Occupation</label>
                  <input
                    type="text"
                    id="parent-motherOcc"
                    value={formData.motherOccupation}
                    onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                    placeholder="e.g. Architect"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Primary Email <span className="text-[#FF690C]">*</span>
                  </label>
                  <input
                    type="email"
                    id="parent-email"
                    required
                    value={formData.primaryEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, primaryEmail: e.target.value });
                      if (parentErrors.primaryEmail) setParentErrors(prev => ({ ...prev, primaryEmail: '' }));
                    }}
                    aria-invalid={Boolean(parentErrors.primaryEmail)}
                    aria-describedby={parentErrors.primaryEmail ? "parent-email-err" : undefined}
                    className={`w-full px-3 py-2 rounded-xl border font-bold ${
                      parentErrors.primaryEmail ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'
                    }`}
                    placeholder="sharma.family@example.com"
                  />
                  <FieldError id="parent-email-err" error={parentErrors.primaryEmail} />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    WhatsApp Mobile <span className="text-[#FF690C]">*</span>
                  </label>
                  <input
                    type="tel"
                    id="parent-whatsapp"
                    onKeyDown={preventNonNumericKey}
                    onPaste={(e) => handlePhonePaste(e, (clean) => {
                      setFormData(prev => ({ ...prev, whatsappNumber: clean }));
                      if (parentErrors.whatsappNumber) setParentErrors(prev => ({ ...prev, whatsappNumber: '' }));
                    })}
                    value={formData.whatsappNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, whatsappNumber: sanitizePhoneInput(e.target.value) });
                      if (parentErrors.whatsappNumber) setParentErrors(prev => ({ ...prev, whatsappNumber: '' }));
                    }}
                    aria-invalid={Boolean(parentErrors.whatsappNumber)}
                    aria-describedby={parentErrors.whatsappNumber ? "parent-whatsapp-err" : undefined}
                    className={`w-full px-3 py-2 rounded-xl border font-bold font-mono ${
                      parentErrors.whatsappNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'
                    }`}
                    placeholder="10-digit mobile"
                  />
                  <FieldError id="parent-whatsapp-err" error={parentErrors.whatsappNumber} />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Residential Address <span className="text-[#FF690C]">*</span>
                </label>
                <textarea
                  rows={2}
                  id="parent-address"
                  required
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (parentErrors.address) setParentErrors(prev => ({ ...prev, address: '' }));
                  }}
                  aria-invalid={Boolean(parentErrors.address)}
                  aria-describedby={parentErrors.address ? "parent-address-err" : undefined}
                  className={`w-full px-3 py-2 rounded-xl border font-medium ${
                    parentErrors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'
                  }`}
                  placeholder="Street, apartment, city, pincode"
                />
                <FieldError id="parent-address-err" error={parentErrors.address} />
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
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Select Student <span className="text-[#FF690C]">*</span>
                </label>
                <select
                  value={linkStudentForm.studentId}
                  onChange={(e) => {
                    setLinkStudentForm({ ...linkStudentForm, studentId: e.target.value });
                    if (linkErrors.studentId) setLinkErrors(prev => ({ ...prev, studentId: '' }));
                  }}
                  aria-invalid={Boolean(linkErrors.studentId)}
                  aria-describedby={linkErrors.studentId ? "link-student-err" : undefined}
                  className={`w-full px-3 py-2 rounded-xl border font-bold ${
                    linkErrors.studentId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'
                  }`}
                  required
                >
                  <option value="">-- Choose student from directory --</option>
                  {studentsList.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} (Class {s.grade}) - {s.admissionNumber || 'GGPS'}
                    </option>
                  ))}
                </select>
                <FieldError id="link-student-err" error={linkErrors.studentId} />
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
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Subject / Header <span className="text-[#FF690C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={broadcastForm.subject}
                  onChange={(e) => {
                    setBroadcastForm({ ...broadcastForm, subject: e.target.value });
                    if (broadcastErrors.subject) setBroadcastErrors(prev => ({ ...prev, subject: '' }));
                  }}
                  aria-invalid={Boolean(broadcastErrors.subject)}
                  aria-describedby={broadcastErrors.subject ? "broadcast-subject-err" : undefined}
                  className={`w-full px-3 py-2 rounded-xl border font-bold ${
                    broadcastErrors.subject ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'
                  }`}
                  placeholder="e.g. Tomorrow Campus Advisory / Event Circular"
                />
                <FieldError id="broadcast-subject-err" error={broadcastErrors.subject} />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Circular Content <span className="text-[#FF690C]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={broadcastForm.message}
                  onChange={(e) => {
                    setBroadcastForm({ ...broadcastForm, message: e.target.value });
                    if (broadcastErrors.message) setBroadcastErrors(prev => ({ ...prev, message: '' }));
                  }}
                  aria-invalid={Boolean(broadcastErrors.message)}
                  aria-describedby={broadcastErrors.message ? "broadcast-message-err" : undefined}
                  className={`w-full px-3 py-2 rounded-xl border font-medium ${
                    broadcastErrors.message ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'
                  }`}
                  placeholder="Type official communication message here..."
                />
                <FieldError id="broadcast-message-err" error={broadcastErrors.message} />
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

      {/* OPTION 5: INTERACTIVE PROVISIONING MODAL */}
      {provisionModal.isOpen && provisionModal.parent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#001438] rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#0050CB] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#0050CB]/25">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-[#000E28] dark:text-white leading-tight">
                    Provision Parent Portal Access
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Generate instant portal credentials and dispatch to parent via WhatsApp or SMS.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProvisionModal(prev => ({ ...prev, isOpen: false }))}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Guardian & Child Snapshot Card */}
            <div className="rounded-2xl bg-[#F6FAFE] dark:bg-[#000E28]/50 border border-blue-100 dark:border-slate-800/80 p-4 sm:p-5 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <User className="w-4 h-4 text-[#0050CB]" />
                    <span>Target Guardian</span>
                  </div>
                  <div className="font-bold text-base text-[#000E28] dark:text-white mt-1">
                    {provisionModal.parent.fatherName} {provisionModal.parent.motherName && `& ${provisionModal.parent.motherName}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <GraduationCap className="w-4 h-4 text-slate-500" />
                    <span>Linked Student</span>
                  </div>
                  <div className="font-bold text-sm text-[#0050CB] dark:text-[#38BDF8] mt-1">
                    {provisionModal.student ? `${provisionModal.student.firstName} ${provisionModal.student.lastName} (Class ${provisionModal.student.grade})` : 'Primary Ward'}
                  </div>
                </div>
              </div>

              <div className="border-t border-blue-100/80 dark:border-slate-800 pt-2 flex items-center text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-4 h-4 text-[#0050CB] shrink-0" />
                  <span className="font-medium text-slate-600 dark:text-slate-300 truncate">
                    {provisionModal.parent.primaryEmail}
                  </span>
                </div>
                <span className="text-slate-300 dark:text-slate-700 mx-3">|</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Phone className="w-4 h-4 text-[#0050CB] shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {provisionModal.parent.whatsappNumber || provisionModal.parent.fatherContact || provisionModal.parent.motherContact || '9876543210'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Password Configurator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block font-bold text-sm text-[#000E28] dark:text-white">
                  Temporary Password <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Editable or auto-generated
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative flex-1">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={provisionModal.showPassword ? 'text' : 'password'}
                    value={provisionModal.customPassword}
                    onChange={(e) => setProvisionModal(prev => ({ ...prev, customPassword: e.target.value, copied: false }))}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#000E28] font-bold text-sm text-[#000E28] dark:text-white focus:outline-none focus:border-[#0050CB] transition-all"
                    placeholder="Enter password..."
                  />
                  <button
                    type="button"
                    onClick={() => setProvisionModal(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={provisionModal.showPassword ? "Hide password" : "Show password"}
                  >
                    {provisionModal.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCyclePassword}
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
                    label: `${(provisionModal.student?.firstName || 'Aarav').trim()}@2026`,
                    val: `${(provisionModal.student?.firstName || 'Aarav').trim()}@2026`,
                    active: provisionModal.customPassword === `${(provisionModal.student?.firstName || 'Aarav').trim()}@2026`,
                  },
                  {
                    icon: GraduationCap,
                    iconClass: "text-slate-500",
                    label: `GGPS@${(provisionModal.student?.studentId || '4001').replace(/\D/g, '').slice(-4) || '4001'}`,
                    val: `GGPS@${(provisionModal.student?.studentId || '4001').replace(/\D/g, '').slice(-4) || '4001'}`,
                    active: provisionModal.customPassword === `GGPS@${(provisionModal.student?.studentId || '4001').replace(/\D/g, '').slice(-4) || '4001'}`,
                  },
                  {
                    icon: Award,
                    iconClass: "text-slate-500",
                    label: `Welcome#8511`,
                    val: `Welcome#8511`,
                    active: provisionModal.customPassword === `Welcome#8511`,
                  },
                ].map((preset, pIdx) => {
                  const PresetIcon = preset.icon;
                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setProvisionModal(prev => ({ ...prev, customPassword: preset.val, copied: false }))}
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
                    navigator.clipboard.writeText('https://ggps-school-erp.vercel.app/login');
                    toast.success('Login URL copied!');
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
                {formatPortalMessage(provisionModal.parent, provisionModal.student, provisionModal.customPassword)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {/* Copy Credentials */}
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="h-13 flex items-center justify-center gap-2.5 px-3 rounded-xl border border-blue-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 transition-all shadow-2xs cursor-pointer"
              >
                <Copy className="w-5 h-5 text-[#0050CB] dark:text-[#38BDF8] shrink-0" />
                <div className="text-left font-bold text-xs leading-tight">
                  <div>{provisionModal.copied ? 'Copied' : 'Copy'}</div>
                  <div>Credentials</div>
                </div>
              </button>

              {/* Send SMS */}
              <button
                type="button"
                onClick={() => handleSendSMS(provisionModal.parent!, provisionModal.student, provisionModal.customPassword)}
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
                onClick={() => handleSendWhatsApp(provisionModal.parent!, provisionModal.student, provisionModal.customPassword)}
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
                onClick={() => {
                  handleSaveProvision(provisionModal.parent!, provisionModal.student, provisionModal.customPassword, 'Portal Desk');
                  setProvisionModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="h-13 flex items-center justify-center gap-2.5 px-3 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs transition-all shadow-sm shadow-[#0050CB]/25 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                <div className="text-left font-bold text-xs leading-tight">
                  <div>Save &</div>
                  <div>{provisionModal.isSaving ? 'Activating...' : 'Activate'}</div>
                </div>
              </button>
            </div>
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
