"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, UserCheck, DollarSign, Calendar, HeartPulse, 
  FileText, ArrowLeft, Download, ShieldCheck, Mail, Phone, 
  MapPin, Clock, AlertTriangle, CheckCircle2, ChevronRight,
  Printer, Send, Edit3, Award, Sparkles, Activity, FileCheck, Upload, CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import DocumentTable, { DocumentItem } from '@/components/common/DocumentTable';
import FileUploadModal from '@/components/common/FileUploadModal';
import FilePreviewModal, { PreviewableFile } from '@/components/common/FilePreviewModal';
import { downloadFile } from '@/lib/fileDownload';

export default function Student360Profile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const [student, setStudent] = useState<any>(null);
  const [parentInfo, setParentInfo] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PreviewableFile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'attendance' | 'fees' | 'health' | 'timeline' | 'documents'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent360 = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers = { 'Authorization': `Bearer ${token || ''}` };
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

        // Fetch Student Record
        const res = await fetch(`${apiBase}/api/students/${studentId}`, { headers }).catch(() => null);
        let studentData: any = null;
        if (res && res.ok) {
          studentData = await res.json();
        }

        // Realistic fallback for demo or offline mode
        if (!studentData) {
          studentData = {
            _id: studentId,
            firstName: 'Aarav',
            lastName: 'Sharma',
            studentId: 'GGPS2026LKG001',
            admissionNumber: 'GGPS2026Admin001',
            grade: 'LKG',
            section: 'A',
            gender: 'Male',
            dateOfBirth: '2022-04-14',
            bloodGroup: 'O+',
            medicalNotes: 'Mild pollen allergy during seasonal change. No dietary restrictions.',
            status: 'Active',
            enrollmentDate: '2026-03-15',
            busRoute: 'Route 4 (Sector 14 - Green Park)',
            busStop: 'Green Park Block C Gate',
            emergencyContact: '+91 98765 43210',
            parentId: {
              fatherName: 'Rajesh Sharma',
              motherName: 'Sunita Sharma',
              fatherContact: '+91 98765 43210',
              motherContact: '+91 98765 43211',
              email: 'rajesh.sharma@example.com',
              address: 'Villa 42, Palm Meadows, Sector 14, New Delhi',
              occupation: 'Senior Software Architect'
            }
          };
        }

        setStudent(studentData);
        setParentInfo(studentData.parentId || null);

        // Fetch Attendance
        const attRes = await fetch(`${apiBase}/api/attendance?studentId=${studentId}`, { headers }).catch(() => null);
        if (attRes && attRes.ok) {
          const attData = await attRes.json();
          setAttendance(Array.isArray(attData) ? attData : []);
        } else {
          setAttendance([
            { date: '2026-09-22', status: 'Present' },
            { date: '2026-09-21', status: 'Present' },
            { date: '2026-09-20', status: 'Present' },
            { date: '2026-09-19', status: 'Present' },
            { date: '2026-09-18', status: 'Present' },
            { date: '2026-09-17', status: 'Absent' },
            { date: '2026-09-16', status: 'Present' },
          ]);
        }

        // Fetch Fees
        const feeRes = await fetch(`${apiBase}/api/finance/fees?studentId=${studentId}`, { headers }).catch(() => null);
        if (feeRes && feeRes.ok) {
          const feeData = await feeRes.json();
          setFees(Array.isArray(feeData) ? feeData : []);
        } else {
          setFees([
            { _id: 'fee_1', feeType: 'Term 1 Tuition & Facility Fee', dueDate: '2026-06-15', totalAmount: 32000, amountPaid: 32000, status: 'Paid', receiptNo: 'GGPS-REC-2026-0421' },
            { _id: 'fee_2', feeType: 'Term 2 Tuition & Activity Fee', dueDate: '2026-10-15', totalAmount: 32000, amountPaid: 15000, status: 'Partial', receiptNo: 'GGPS-REC-2026-0899' },
            { _id: 'fee_3', feeType: 'Annual Lab & Technology Access Fee', dueDate: '2026-07-01', totalAmount: 18000, amountPaid: 18000, status: 'Paid', receiptNo: 'GGPS-REC-2026-0512' },
          ]);
        }

        // Fetch Assessments
        const assRes = await fetch(`${apiBase}/api/assessments?childId=${studentId}`, { headers }).catch(() => null);
        if (assRes && assRes.ok) {
          const assData = await assRes.json();
          setAssessments(Array.isArray(assData) ? assData : []);
        } else {
          setAssessments([
            { _id: 'ass_1', term: 'Term 1 Mid-Term Evaluation', subject: 'Early Numeracy & Counting', score: '95/100', grade: 'A+', teacherComments: 'Aarav exhibits remarkable pattern recognition and numerical curiosity.', createdAt: '2026-08-20' },
            { _id: 'ass_2', term: 'Term 1 Mid-Term Evaluation', subject: 'Language & Phonics', score: '91/100', grade: 'A', teacherComments: 'Expressive vocabulary, actively participates in circle time storytelling.', createdAt: '2026-08-22' },
            { _id: 'ass_3', term: 'Term 1 Mid-Term Evaluation', subject: 'Motor Skills & Sensory Play', score: '98/100', grade: 'A+', teacherComments: 'Excellent fine motor coordination in block building and craft work.', createdAt: '2026-08-24' },
          ]);
        }

        // Fetch Documents
        const docRes = await fetch(`${apiBase}/api/v1/documents?studentId=${studentId}`, { headers }).catch(() => null);
        if (docRes && docRes.ok) {
          const docData = await docRes.json();
          setDocuments(Array.isArray(docData.data) ? docData.data : []);
        } else {
          setDocuments([
            { _id: 'doc-birth', title: 'Official Birth Certificate', category: 'Birth Certificate', size: 1450000, mimeType: 'application/pdf', verificationStatus: 'Verified', createdAt: '2026-03-15' },
            { _id: 'doc-aadhaar', title: 'Aadhaar / National Identity Proof', category: 'Aadhaar/ID Proof', size: 820000, mimeType: 'image/jpeg', verificationStatus: 'Verified', createdAt: '2026-03-15' },
            { _id: 'doc-immun', title: 'Pediatric Immunization Record', category: 'Medical Documents', size: 1120000, mimeType: 'application/pdf', verificationStatus: 'Pending', createdAt: '2026-04-10' },
            { _id: 'doc-parent', title: 'Parent Proof of Residence & Address', category: 'Address Proof', size: 950000, mimeType: 'application/pdf', verificationStatus: 'Verified', createdAt: '2026-03-16' },
          ]);
        }
      } catch (err) {
        console.error('Failed to load Student 360 profile', err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudent360();
    }
  }, [studentId]);

  const fetchStudentDocuments = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const docRes = await fetch(`${apiBase}/api/v1/documents?studentId=${studentId}`, {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      if (docRes.ok) {
        const docData = await docRes.json();
        setDocuments(Array.isArray(docData.data) ? docData.data : []);
      }
    } catch {
      // Ignored
    }
  };

  const handleDownloadReportCard = async () => {
    const filename = `GGPS_Report_Card_${student?.firstName || 'Student'}_${student?.lastName || ''}_2026-2027.pdf`.replace(/\s+/g, '_');
    await downloadFile(`/api/v1/students/${studentId}/report-card`, filename);
  };

  const handleVerifyDocument = async (doc: DocumentItem, status: 'Verified' | 'Rejected' | 'Replacement Required') => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await fetch(`${apiBase}/api/v1/documents/${doc._id || doc.id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ verificationStatus: status }),
      });
      if (res.ok) {
        toast.success(`Document marked as ${status}`);
        fetchStudentDocuments();
      } else {
        toast.error('Failed to update verification status');
      }
    } catch {
      toast.error('Network error during verification update');
    }
  };

  const handleDeleteDocument = async (doc: DocumentItem) => {
    if (!confirm(`Are you sure you want to remove "${doc.title}"?`)) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await fetch(`${apiBase}/api/v1/documents/${doc._id || doc.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      if (res.ok) {
        toast.success('Document deleted');
        setDocuments(prev => prev.filter(d => (d._id || d.id) !== (doc._id || doc.id)));
      } else {
        toast.error('Failed to delete document');
      }
    } catch {
      toast.error('Network error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#0050CB]/20 border-t-[#0050CB] animate-spin" />
        <p className="text-sm font-bold text-slate-500">Loading Student 360° Record...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#001438] rounded-3xl border border-slate-200 dark:border-slate-800">
        <p className="text-rose-500 font-bold mb-4">Student record not found or inaccessible.</p>
        <Link href="/dashboard/students" className="px-5 py-2.5 bg-[#0050CB] text-white font-bold text-xs rounded-xl inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Student Directory
        </Link>
      </div>
    );
  }

  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const totalAtt = attendance.length || 1;
  const attRate = Math.round((presentCount / totalAtt) * 100);

  const totalFeeAmount = fees.reduce((acc, f) => acc + (f.totalAmount || 0), 0);
  const totalPaidAmount = fees.reduce((acc, f) => acc + (f.amountPaid || 0), 0);
  const totalPendingAmount = totalFeeAmount - totalPaidAmount;

  return (
    <div className="space-y-7">
      
      {/* 1. Header with Breadcrumb & Quick Actions */}
      <AdminPageHeader
        title={`${student.firstName} ${student.lastName}`}
        subtitle={`Student 360° Profile • ${student.studentId || student.admissionNumber || 'GGPS2026LKG001'} • Class ${student.grade || 'Pre-KG'} ${student.section ? `(${student.section})` : ''}`}
        badge={student.status || 'Active'}
        badgeVariant="primary"
        breadcrumbs={[
          { label: 'Admin Desk', href: '/dashboard' },
          { label: 'Students', href: '/dashboard/students' },
          { label: `${student.firstName} ${student.lastName}` }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReportCard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#001438] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Report Card</span>
            </button>
            <Link
              href={`/dashboard/id-cards?studentId=${student._id || studentId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#001438] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>ID Badge</span>
            </Link>
            <button
              onClick={() => toast.success(`Drafting announcement to ${student.emergencyContact || 'Guardian'}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send SMS</span>
            </button>
          </div>
        }
      />

      {/* 2. Hero Profile Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#000E28] via-[#002772] to-[#0050CB] p-6 sm:p-8 text-white border border-white/10 shadow-[0_20px_50px_rgba(0,14,40,0.15)]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-20 w-80 h-80 bg-[#38BDF8]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/15 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-inner shrink-0">
              {student.firstName?.[0] || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#38BDF8]/20 border border-[#38BDF8]/30 text-[#38BDF8] text-[11px] font-bold">
                  Class {student.grade || 'Pre-KG'} - Section {student.section || 'A'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
                  {student.status || 'Active Enrolled'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {student.firstName} {student.lastName}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100/80 mt-1.5 font-medium">
                <span>Student ID: <strong className="text-white font-mono">{student.studentId || 'GGPS2026LKG001'}</strong></span>
                <span>•</span>
                <span>Admission: <strong className="text-white font-mono">{student.admissionNumber || 'GGPS2026Admin001'}</strong></span>
                <span>•</span>
                <span>DOB: <strong className="text-white">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : '14 Apr 2022'}</strong></span>
                <span>•</span>
                <span>Gender: <strong className="text-white">{student.gender || 'Male'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Pillars */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[100px]">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Attendance</span>
              <span className="text-xl sm:text-2xl font-black text-[#38BDF8] mt-0.5 block">{attRate}%</span>
              <span className="text-[9px] text-emerald-300 font-bold block mt-0.5">High Regularity</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[100px]">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Pending Fees</span>
              <span className="text-xl sm:text-2xl font-black text-[#FF690C] mt-0.5 block">
                ₹{totalPendingAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-amber-200 font-bold block mt-0.5">Term 2 Dues</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[100px]">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Blood Group</span>
              <span className="text-xl sm:text-2xl font-black text-rose-300 mt-0.5 block">{student.bloodGroup || 'O+'}</span>
              <span className="text-[9px] text-blue-200 font-bold block mt-0.5">Verified</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Luxury Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: '360° Overview', icon: GraduationCap },
          { id: 'academic', label: `Academic & Exams (${assessments.length})`, icon: Award },
          { id: 'attendance', label: 'Attendance Roll', icon: Calendar },
          { id: 'fees', label: `Fee Ledger (${fees.length})`, icon: DollarSign },
          { id: 'health', label: 'Health & Dietary', icon: HeartPulse },
          { id: 'documents', label: `Documents (${documents.length})`, icon: FileCheck },
          { id: 'timeline', label: 'Audit Timeline', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#0050CB] text-white shadow-md shadow-[#0050CB]/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#001438]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Student Identity & Bio Details (6 cols) */}
          <div className="lg:col-span-6 bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="w-1.5 h-5 rounded-full bg-[#0050CB]" />
              <h3 className="font-black text-base text-[#000E28] dark:text-white">
                Student Identity & Bio
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 font-semibold">Full Legal Name</span>
                <span className="font-bold text-[#000E28] dark:text-white">{student.firstName} {student.lastName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 font-semibold">Student ID</span>
                <span className="font-mono font-bold text-[#0050CB] dark:text-[#38BDF8]">{student.studentId || 'GGPS2026LKG001'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 font-semibold">Permanent Admission No.</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{student.admissionNumber || 'GGPS2026Admin001'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 font-semibold">Academic Class & Section</span>
                <span className="font-bold text-[#000E28] dark:text-white">Class {student.grade} - Section {student.section || 'A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 font-semibold">Date of Birth</span>
                <span className="font-bold text-[#000E28] dark:text-white">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : '14 April 2022'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 font-semibold">Enrolled Campus Date</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{student.enrollmentDate || '15 March 2026'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-semibold">Emergency Medical Notes</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-right max-w-xs">{student.medicalNotes || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Guardian & Emergency Information (6 cols) */}
          <div className="lg:col-span-6 bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="w-1.5 h-5 rounded-full bg-[#FF690C]" />
              <h3 className="font-black text-base text-[#000E28] dark:text-white">
                Guardian & Parent Contact
              </h3>
            </div>

            {parentInfo ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 font-semibold">Father's Name</span>
                  <span className="font-bold text-[#000E28] dark:text-white">{parentInfo.fatherName || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 font-semibold">Mother's Name</span>
                  <span className="font-bold text-[#000E28] dark:text-white">{parentInfo.motherName || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 font-semibold">Primary WhatsApp Phone</span>
                  <a href={`tel:${parentInfo.fatherContact || student.emergencyContact}`} className="font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{parentInfo.fatherContact || student.emergencyContact}</span>
                  </a>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 font-semibold">Parent Email Address</span>
                  <a href={`mailto:${parentInfo.email}`} className="font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>{parentInfo.email || 'parents@example.com'}</span>
                  </a>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-semibold">Residential Address</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-right max-w-xs">{parentInfo.address || 'Campus Bus Stop Area'}</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">No parent account linked yet.</p>
            )}
          </div>

        </div>
      )}

      {activeTab === 'academic' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-[#000E28] dark:text-white">
              Continuous Evaluations & Assessments
            </h3>
            <button
              onClick={handleDownloadReportCard}
              className="px-3.5 py-1.5 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold hover:bg-[#0050CB] hover:text-white transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official Transcript</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assessments.map((ass) => (
              <div key={ass._id} className="p-5 rounded-2xl bg-slate-50 dark:bg-[#000E28]/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{ass.term}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                      {ass.grade}
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-[#000E28] dark:text-white">{ass.subject}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    "{ass.teacherComments}"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Evaluation Score</span>
                  <span className="font-black text-[#0050CB] dark:text-[#38BDF8]">{ass.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-[#000E28] dark:text-white">
                Daily Attendance Roll & Heatmap
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Overall attendance compliance: {attRate}%</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold">
              {presentCount} Days Present in Term
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {attendance.map((att, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${att.status === 'Present' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="font-bold text-[#000E28] dark:text-white">
                    {new Date(att.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                  att.status === 'Present' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' 
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                }`}>
                  {att.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-[#000E28] dark:text-white">Student Fee Ledger & Receipts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Total Dues Pending: ₹{totalPendingAmount.toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={() => toast.success('Triggering payment collection voucher...')}
              className="px-4 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all shadow-xs"
            >
              + Collect Fee Payment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Fee Item</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Receipt No</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Paid Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {fees.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/70 dark:hover:bg-[#000E28]/40">
                    <td className="py-3 font-bold text-[#000E28] dark:text-white">{f.feeType}</td>
                    <td className="py-3 text-slate-500">{new Date(f.dueDate).toLocaleDateString()}</td>
                    <td className="py-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">{f.receiptNo || 'REC-PENDING'}</td>
                    <td className="py-3 font-bold text-[#000E28] dark:text-white">₹{f.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 font-bold text-emerald-600">₹{(f.amountPaid || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.status === 'Paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {activeTab === 'health' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-1.5 h-5 rounded-full bg-rose-500" />
            <h3 className="font-black text-base text-[#000E28] dark:text-white">
              Medical Records & Dietary Directives
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span className="font-bold text-rose-800 dark:text-rose-200">Blood Group: {student.bloodGroup || 'O+'}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Medical Notes & Directives:</strong> {student.medicalNotes || 'No known chronic conditions or registered allergies.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <h3 className="font-black text-base text-[#000E28] dark:text-white">
            Student Lifecycle Audit Trail
          </h3>

          <div className="space-y-4 border-l-2 border-[#0050CB]/30 dark:border-[#0050CB]/50 pl-5 text-xs">
            <div className="relative">
              <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#0050CB] ring-4 ring-[#0050CB]/20" />
              <p className="font-bold text-[#000E28] dark:text-white">Term 1 Evaluation Completed</p>
              <p className="text-slate-500">Graded A+ with distinction by Class Teacher • 22 Aug 2026</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <p className="font-bold text-[#000E28] dark:text-white">Term 1 Tuition Cleared</p>
              <p className="text-slate-500">Receipt #GGPS-REC-2026-0421 issued for ₹32,000 • 15 Jun 2026</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#FF690C] ring-4 ring-[#FF690C]/20" />
              <p className="font-bold text-[#000E28] dark:text-white">Enrolled in GGPS Academic Session 2026-27</p>
              <p className="text-slate-500">Student admitted to Class {student.grade} - Section {student.section || 'A'} • 15 Mar 2026</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-base text-[#000E28] dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#0050CB]" />
                Student Verified Documents & Certificates Vault
              </h3>
              <p className="text-xs text-slate-500">
                Official records: Birth Certificate, ID Proof, Address Proof, Transfer Certificate, and Immunization Records.
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>

          <DocumentTable
            documents={documents}
            onPreview={(doc) => setPreviewDoc(doc as any)}
            onVerify={handleVerifyDocument}
            onDelete={handleDeleteDocument}
            canVerify={true}
            canDelete={true}
          />
        </div>
      )}

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultCategory="students"
        entityType="Student"
        entityId={studentId}
        title={`Upload Student Document • ${student.firstName} ${student.lastName}`}
        onSuccess={() => fetchStudentDocuments()}
      />

      {/* Universal Preview Modal */}
      <FilePreviewModal
        file={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

    </div>
  );
}
