"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Plus, 
  Download, 
  Kanban, 
  Table as TableIcon, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  Mail, 
  Clock, 
  ArrowRight, 
  Filter, 
  ChevronRight, 
  FileText, 
  Check, 
  AlertCircle, 
  Eye, 
  ShieldCheck,
  CreditCard,
  Search,
  X,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AdmissionKanban, { AdmissionApplication, getApplicationStage, KANBAN_STAGES } from '@/components/admin/AdmissionKanban';
import AdminEnquiriesManager from '@/components/admin/AdminEnquiriesManager';
import NewEnquiryModal from '@/components/admin/NewEnquiryModal';
import NewApplicationModal from '@/components/admin/NewApplicationModal';
import DocumentVerificationModal from '@/components/admin/DocumentVerificationModal';
import FeePaymentModal from '@/components/admin/FeePaymentModal';
import ConfirmAdmissionModal from '@/components/admin/ConfirmAdmissionModal';
import ViewApplicationModal from '@/components/admin/ViewApplicationModal';
import { getSocket } from '@/lib/socket';

type ActiveModal = 
  | null 
  | 'new-enquiry' 
  | 'new-application' 
  | 'document-verification' 
  | 'fee-payment' 
  | 'confirm-admission' 
  | 'view-application';

function AdmissionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') || 'pipeline';

  const [activeTab, setActiveTab] = useState<string>(tabParam);
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Explicit Modal State Management (No ambiguous setOpen)
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);

  // Filters & Search for Application Forms tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('ALL');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('ALL');

  // Pagination for Application Forms table
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tab') || 'pipeline';
        setActiveTab(t);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.pushState({}, '', url.toString());
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await fetch(`${apiBase}/api/admissions`, {
        headers: { 
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      }).catch(() => null);

      let loaded: AdmissionApplication[] = [];
      if (res && res.ok) {
        const raw = await res.json();
        loaded = Array.isArray(raw) ? raw : (raw.data || []);
      }

      setApplications(loaded || []);
    } catch (error) {
      console.error('Failed to fetch admissions', error);
      toast.error('Failed to load admissions pipeline');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    // Realtime Socket updates
    const socket = getSocket();
    if (socket) {
      const handleAdmissionNew = () => {
        fetchApplications();
      };
      const handleAdmissionUpdated = () => {
        fetchApplications();
      };
      socket.on('admission:new', handleAdmissionNew);
      socket.on('admission:enquiry:converted', handleAdmissionNew);
      socket.on('admission:status-updated', handleAdmissionUpdated);

      return () => {
        socket.off('admission:new', handleAdmissionNew);
        socket.off('admission:enquiry:converted', handleAdmissionNew);
        socket.off('admission:status-updated', handleAdmissionUpdated);
      };
    }
  }, []);

  // Stage change handler
  const updateStage = async (id: string, stage: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      
      let status = stage;
      if (stage === 'Confirmed') status = 'Admission Confirmed';
      else if (stage === 'Approved') status = 'Approved';
      else if (stage === 'Fee Pending') status = 'Fee Pending';
      else if (stage === 'Documents') status = 'Documents Pending';
      else if (stage === 'Assessment') status = 'Assessment Pending';
      else if (stage === 'Interview') status = 'Interview Scheduled';
      else if (stage === 'Review') status = 'Under Review';
      else if (stage === 'Application') status = 'Submitted';
      else if (stage === 'Enquiry') status = 'New Inquiry';

      const res = await fetch(`${apiBase}/api/admissions/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}` 
        },
        body: JSON.stringify({ stage, status })
      });

      if (!res.ok) {
        throw new Error('Failed to update stage');
      }

      toast.success(`Application advanced to "${stage}"`);
      setApplications(prev => prev.map(a => a._id === id ? { ...a, stage, status } : a));
    } catch (error) {
      console.error(error);
      toast.error('Network error updating pipeline stage');
    }
  };

  // Metrics Row Calculation
  const metrics = useMemo(() => {
    return {
      total: applications.length,
      applicationsInReview: applications.filter(a => {
        const stage = getApplicationStage(a);
        return stage === 'Documents' || stage === 'Assessment' || stage === 'Interview' || stage === 'Review';
      }).length,
      approvedOffers: applications.filter(a => {
        const stage = getApplicationStage(a);
        return stage === 'Approved' || stage === 'Fee Pending';
      }).length,
      confirmed: applications.filter(a => {
        const stage = getApplicationStage(a);
        return stage === 'Confirmed' || a.status === 'Admission Confirmed';
      }).length,
    };
  }, [applications]);

  // Filtered Applications for Application Forms Tab & Export
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const childName = `${app.childFirstName} ${app.childLastName}`.toLowerCase();
        const parentName = (app.parentName || '').toLowerCase();
        const appNo = (app.applicationNumber || '').toLowerCase();
        const phone = (app.contactNumber || app.parentPhone || '').toLowerCase();
        const email = (app.email || app.parentEmail || '').toLowerCase();
        if (
          !childName.includes(q) &&
          !parentName.includes(q) &&
          !appNo.includes(q) &&
          !phone.includes(q) &&
          !email.includes(q)
        ) {
          return false;
        }
      }

      // 2. Class filter
      if (selectedClass !== 'ALL' && app.gradeAppliedFor !== selectedClass) {
        return false;
      }

      // 3. Stage filter
      if (selectedStage !== 'ALL') {
        const stage = getApplicationStage(app);
        if (stage !== selectedStage) return false;
      }

      // 4. Status filter
      if (selectedStatus !== 'ALL' && app.status !== selectedStatus) {
        return false;
      }

      // 5. Payment status filter
      if (selectedPaymentStatus !== 'ALL') {
        const feeStatus = app.feeStatus || 'Pending';
        if (feeStatus !== selectedPaymentStatus) return false;
      }

      // 6. Academic year filter
      if (selectedAcademicYear !== 'ALL' && app.academicYear !== selectedAcademicYear) {
        return false;
      }

      return true;
    });
  }, [
    applications,
    searchQuery,
    selectedClass,
    selectedStage,
    selectedStatus,
    selectedPaymentStatus,
    selectedAcademicYear,
  ]);

  // Paginated applications for Table View
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredApplications.slice(startIndex, startIndex + pageSize);
  }, [filteredApplications, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));

  // Export CSV respecting filters
  const handleExportCSV = () => {
    if (filteredApplications.length === 0) {
      toast.error('No applications to export');
      return;
    }

    const headers = [
      'Application Number',
      'Child First Name',
      'Child Last Name',
      'Class Applied',
      'Academic Year',
      'Parent Name',
      'Phone Number',
      'Email',
      'Pipeline Stage',
      'Application Status',
      'Document Status',
      'Fee Status',
      'Fee Amount',
      'Fee Paid',
      'Balance Due',
      'Created Date'
    ];

    const rows = filteredApplications.map(app => {
      const allDocsVerified = app.documents && app.documents.length > 0 && app.documents.every(d => d.status === 'Verified');
      const feeAmount = app.feeAmount || 25000;
      const feePaid = app.feePaid || 0;
      const balance = Math.max(0, feeAmount - feePaid);

      return [
        `"${app.applicationNumber || 'APP-2026'}"`,
        `"${app.childFirstName}"`,
        `"${app.childLastName !== '-' ? app.childLastName : ''}"`,
        `"${app.gradeAppliedFor || 'LKG'}"`,
        `"${app.academicYear || '2026–2027'}"`,
        `"${app.parentName || ''}"`,
        `"${app.contactNumber || app.parentPhone || ''}"`,
        `"${app.email || app.parentEmail || ''}"`,
        `"${getApplicationStage(app)}"`,
        `"${app.status || 'New'}"`,
        `"${allDocsVerified ? 'Verified' : 'Pending'}"`,
        `"${app.feeStatus || 'Pending'}"`,
        feeAmount,
        feePaid,
        balance,
        `"${app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB') : ''}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GGPS-Admissions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredApplications.length} admission applications to CSV`);
  };

  // Quick Action Modal Openers
  const openViewApplication = (app: AdmissionApplication) => {
    setSelectedApplication(app);
    setActiveModal('view-application');
  };

  const openVerifyDocs = (app: AdmissionApplication) => {
    setSelectedApplication(app);
    setActiveModal('document-verification');
  };

  const openRecordFee = (app: AdmissionApplication) => {
    setSelectedApplication(app);
    setActiveModal('fee-payment');
  };

  const openConfirmAdmission = (app: AdmissionApplication) => {
    setSelectedApplication(app);
    setActiveModal('confirm-admission');
  };

  const closeAllModals = () => {
    setActiveModal(null);
    setSelectedApplication(null);
  };

  return (
    <div className="space-y-7">
      
      {/* 1. Header with Breadcrumb & Direct Action Buttons */}
      <AdminPageHeader
        title="Admissions & Applicant CRM"
        subtitle="Track prospective admissions, campus tours, entrance evaluations, and confirmed enrollments."
        breadcrumbs={[
          { label: 'Admin Desk', href: '/dashboard' },
          { label: 'Admissions' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#001438] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('new-enquiry')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#001438] hover:bg-slate-50 border border-[#0050CB]/30 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#FF690C]" />
              <span>+ New Enquiry</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('new-application')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all shadow-xs shadow-[#0050CB]/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Application</span>
            </button>
          </div>
        }
      />

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AdminStatCard
          label="Total Pipeline"
          value={metrics.total}
          supportingText="Active applications in intake"
          icon={GraduationCap}
          variant="blue"
          trend={{ value: "+14.2%", isPositive: true, period: "vs last intake" }}
        />
        <AdminStatCard
          label="In Assessment & Review"
          value={metrics.applicationsInReview}
          supportingText="Document verification & interviews"
          icon={Calendar}
          variant="orange"
          progress={65}
        />
        <AdminStatCard
          label="Offers Issued / Fee Pending"
          value={metrics.approvedOffers}
          supportingText="Offer letter sent, seat fee awaiting"
          icon={Sparkles}
          variant="indigo"
        />
        <AdminStatCard
          label="Confirmed & Enrolled"
          value={metrics.confirmed}
          supportingText="Student records created & enrolled"
          icon={CheckCircle2}
          variant="emerald"
          trend={{ value: "+8.5%", isPositive: true, period: "Conversion" }}
        />
      </div>

      {/* 3. Official Admissions Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto custom-scrollbar">
        {[
          { id: 'pipeline', label: 'Pipeline Command (Kanban)', icon: Kanban },
          { id: 'inquiries', label: 'New Enquiries', icon: Phone },
          { id: 'applications', label: 'Application Forms', icon: FileText },
          { id: 'documents', label: 'Document Verification', icon: ShieldCheck },
          { id: 'confirmed', label: 'Fee Payment & Confirmation', icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
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

      {/* ========================================================
          TAB 1: PIPELINE COMMAND (KANBAN)
      ======================================================== */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-sm text-[#000E28] dark:text-white flex items-center gap-2">
                <span>9-Stage Admissions Lifecycle Funnel</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] font-mono">
                  {applications.length} Candidates
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Advance candidates from initial Enquiry through Verification, Assessment, Fee Payment, and final Confirmation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchApplications}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Refresh Pipeline"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0050CB]' : ''}`} />
              </button>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#000E28] border border-slate-200/60 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'kanban'
                      ? 'bg-white dark:bg-[#001438] text-[#0050CB] dark:text-[#38BDF8] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-[#001438] text-[#0050CB] dark:text-[#38BDF8] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'kanban' ? (
            <AdmissionKanban
              applications={applications}
              onStageChange={updateStage}
              onSelectApplication={openViewApplication}
              onVerifyDocs={openVerifyDocs}
              onRecordFee={openRecordFee}
              onConfirmAdmission={openConfirmAdmission}
            />
          ) : (
            /* Table view of pipeline */
            <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#001438] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5">Application No</th>
                      <th className="p-3.5">Applicant Child</th>
                      <th className="p-3.5">Parent / Contact</th>
                      <th className="p-3.5">Class</th>
                      <th className="p-3.5">Stage</th>
                      <th className="p-3.5">Document Status</th>
                      <th className="p-3.5">Fee Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {applications.map((app) => {
                      const stage = getApplicationStage(app);
                      return (
                        <tr key={app._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-[#0050CB]">
                            {app.applicationNumber || 'APP-2026'}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-[#000E28] dark:text-white block">
                              {app.childFirstName} {app.childLastName !== '-' ? app.childLastName : ''}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {app.gender || 'Other'} • {app.academicYear || '2026–2027'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{app.parentName}</span>
                            <span className="text-[11px] font-mono text-slate-500">{app.contactNumber || app.parentPhone || 'N/A'}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-lg bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] font-bold">
                              Class {app.gradeAppliedFor || 'LKG'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {stage}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.documents?.every(d => d.status === 'Verified')
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {app.documents?.every(d => d.status === 'Verified') ? '✓ Verified' : 'In Review'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.feeStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {app.feeStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openViewApplication(app)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#0050CB] hover:bg-slate-50"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openVerifyDocs(app)}
                                className="p-1.5 rounded-lg border border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                                title="Verify Documents"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openRecordFee(app)}
                                className="p-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
                                title="Record Fee"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>
                              {app.status !== 'Admission Confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => openConfirmAdmission(app)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                >
                                  Enroll ✓
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
        </div>
      )}

      {/* ========================================================
          TAB 2: NEW ENQUIRIES (ADMIN ENQUIRIES MANAGER)
      ======================================================== */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <AdminEnquiriesManager />
        </div>
      )}

      {/* ========================================================
          TAB 3: APPLICATION FORMS TAB (ACTUAL ADMISSION APPS)
      ======================================================== */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Filters & Search Control Bar */}
          <div className="p-4 bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search application number, applicant child, parent name, or contact..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('new-application')}
                  className="px-4 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ New Application</span>
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Class Filter
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Classes</option>
                  {['Pre-KG', 'LKG', 'UKG'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Pipeline Stage
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => {
                    setSelectedStage(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Stages</option>
                  {KANBAN_STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Application Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Statuses</option>
                  {['Submitted', 'Under Review', 'Documents Pending', 'Assessment Pending', 'Interview Scheduled', 'Approved', 'Fee Pending', 'Admission Confirmed'].map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Payment Status
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => {
                    setSelectedPaymentStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Payment Statuses</option>
                  <option value="Pending">Pending Due</option>
                  <option value="Partial">Partial Deposit</option>
                  <option value="Paid">Fully Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Academic Year
                </label>
                <select
                  value={selectedAcademicYear}
                  onChange={(e) => {
                    setSelectedAcademicYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Sessions</option>
                  <option value="2026–2027">2026–2027</option>
                  <option value="2025–2026">2025–2026</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#001438] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Application Number</th>
                    <th className="p-3.5">Applicant Child</th>
                    <th className="p-3.5">Parent / Guardian</th>
                    <th className="p-3.5">Class Applied</th>
                    <th className="p-3.5">Academic Year</th>
                    <th className="p-3.5">Application Date</th>
                    <th className="p-3.5">Application Status</th>
                    <th className="p-3.5">Document Status</th>
                    <th className="p-3.5">Payment Status</th>
                    <th className="p-3.5">Pipeline Stage</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#0050CB] border-t-transparent rounded-full animate-spin" />
                          <span>Loading application forms...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-600 dark:text-slate-300">No applications match your criteria</p>
                          <p className="text-[11px] text-slate-400">Try adjusting your search terms or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedApplications.map((app) => {
                      const stage = getApplicationStage(app);
                      const allDocsVerified = app.documents && app.documents.length > 0 && app.documents.every(d => d.status === 'Verified');

                      return (
                        <tr key={app._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          {/* 1. Application Number */}
                          <td className="p-3.5 font-mono font-bold text-[#0050CB]">
                            {app.applicationNumber || 'APP-2026'}
                          </td>

                          {/* 2. Applicant Child */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#0050CB] to-[#002772] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                {app.childFirstName?.[0] || 'C'}
                              </div>
                              <div>
                                <span className="font-bold text-[#000E28] dark:text-white block">
                                  {app.childFirstName} {app.childLastName !== '-' ? app.childLastName : ''}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {app.gender || 'Other'} • {app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString('en-GB') : 'DOB N/A'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 3. Parent/Guardian */}
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{app.parentName}</span>
                            <span className="text-[11px] font-mono text-slate-500">{app.contactNumber || app.parentPhone || 'N/A'}</span>
                          </td>

                          {/* 4. Class Applied */}
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-lg bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] font-bold">
                              Class {app.gradeAppliedFor || 'LKG'}
                            </span>
                          </td>

                          {/* 5. Academic Year */}
                          <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                            {app.academicYear || '2026–2027'}
                          </td>

                          {/* 6. Application Date */}
                          <td className="p-3.5 text-slate-500 text-[11px]">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB') : 'Recent'}
                          </td>

                          {/* 7. Application Status */}
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
                              {app.status || 'Submitted'}
                            </span>
                          </td>

                          {/* 8. Document Status */}
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              allDocsVerified
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {allDocsVerified ? '✓ Verified' : 'Pending / Review'}
                            </span>
                          </td>

                          {/* 9. Payment Status */}
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.feeStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {app.feeStatus || 'Pending'}
                            </span>
                          </td>

                          {/* 10. Pipeline Stage */}
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {stage}
                            </span>
                          </td>

                          {/* 11. Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openViewApplication(app)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#0050CB] hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                title="View Application 360°"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openVerifyDocs(app)}
                                className="p-1.5 rounded-lg border border-cyan-200 dark:border-cyan-800 text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 cursor-pointer"
                                title="Verify Documents"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openRecordFee(app)}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                title="Record Fee Payment"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>
                              {app.status !== 'Admission Confirmed' ? (
                                <button
                                  type="button"
                                  onClick={() => openConfirmAdmission(app)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                                  title="Confirm Admission"
                                >
                                  Confirm
                                </button>
                              ) : (
                                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Row */}
            {filteredApplications.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredApplications.length)} of {filteredApplications.length} applications
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: DOCUMENT VERIFICATION TAB
      ======================================================== */}
      {activeTab === 'documents' && (
        <div className="space-y-4 bg-white dark:bg-[#07152F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-[#000E28] dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0050CB]" />
                <span>Admission Document Verification Desk</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify statutory birth certificates, parent Aadhaar/ID, and transfer certificates before issuing admission offers.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchApplications}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No admission applications found for document verification.
              </div>
            ) : (
              applications.map((app) => {
                const docs = app.documents || [];
                const allVerified = docs.length > 0 && docs.every((d) => d.status === 'Verified');
                const hasRejected = docs.some((d) => d.status === 'Rejected');

                return (
                  <div key={app._id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#000E28] dark:text-slate-100">
                          {app.childFirstName} {app.childLastName !== '-' ? app.childLastName : ''}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB]">
                          Class {app.gradeAppliedFor || 'LKG'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {app.applicationNumber || 'APP-2026'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          allVerified
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : hasRejected
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {allVerified ? '✓ All Verified' : hasRejected ? 'Requires Correction' : 'Verification In-Progress'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Parent: {app.parentName} ({app.contactNumber || app.parentPhone || 'Phone N/A'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openVerifyDocs(app)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0050CB] hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Inspect & Verify Documents</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: CONFIRMED & FEE PAYMENT TAB
      ======================================================== */}
      {activeTab === 'confirmed' && (
        <div className="space-y-4 bg-white dark:bg-[#07152F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0050CB]" />
                <span>Admission Fee Payment & Seat Confirmation Desk</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Collect seat deposit fees, track balances, and generate final student enrollments.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchApplications}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No candidates currently at the fee payment desk.
              </div>
            ) : (
              applications.map((app) => {
                const totalFee = app.feeAmount || 25000;
                const paid = app.feePaid || 0;
                const balance = Math.max(0, totalFee - paid);
                const isPaid = app.feeStatus === 'Paid';

                return (
                  <div key={app._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                            {app.childFirstName} {app.childLastName !== '-' ? app.childLastName : ''}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {app.applicationNumber || 'APP-2026'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Class {app.gradeAppliedFor || 'LKG'} • Parent: {app.parentName} ({app.contactNumber || app.parentPhone || 'Phone N/A'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-right text-xs">
                        <span className="text-slate-400 block text-[10px]">Fee Breakdown</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          Paid: ₹{paid.toLocaleString('en-IN')} / ₹{totalFee.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {isPaid ? 'Paid in Full' : `Due: ₹${balance.toLocaleString('en-IN')}`}
                      </span>

                      <button
                        type="button"
                        onClick={() => openRecordFee(app)}
                        className="px-3 py-1.5 bg-[#0050CB] hover:bg-[#003E9E] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Record Payment
                      </button>

                      {app.status !== 'Admission Confirmed' && (
                        <button
                          type="button"
                          onClick={() => openConfirmAdmission(app)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Confirm & Enroll
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          EXPLICIT MODAL DIALOGS
      ======================================================== */}

      {/* 1. Dedicated New Admission Enquiry Modal */}
      <NewEnquiryModal
        isOpen={activeModal === 'new-enquiry'}
        onClose={closeAllModals}
        onSuccess={() => {
          fetchApplications();
        }}
      />

      {/* 2. Dedicated New Formal Admission Application Modal */}
      <NewApplicationModal
        isOpen={activeModal === 'new-application'}
        onClose={closeAllModals}
        onSuccess={() => {
          fetchApplications();
        }}
      />

      {/* 3. Document Verification Desk Modal */}
      <DocumentVerificationModal
        isOpen={activeModal === 'document-verification'}
        application={selectedApplication}
        onClose={closeAllModals}
        onSuccess={() => {
          fetchApplications();
        }}
      />

      {/* 4. Fee Payment Modal */}
      <FeePaymentModal
        isOpen={activeModal === 'fee-payment'}
        application={selectedApplication}
        onClose={closeAllModals}
        onSuccess={() => {
          fetchApplications();
        }}
      />

      {/* 5. Final Admission Confirmation & Student Enrollment Modal */}
      <ConfirmAdmissionModal
        isOpen={activeModal === 'confirm-admission'}
        application={selectedApplication}
        onClose={closeAllModals}
        onSuccess={() => {
          fetchApplications();
        }}
      />

      {/* 6. 360° View Application Modal */}
      <ViewApplicationModal
        isOpen={activeModal === 'view-application'}
        application={selectedApplication}
        onClose={closeAllModals}
        onVerifyDocs={openVerifyDocs}
        onRecordFee={openRecordFee}
        onConfirmAdmission={openConfirmAdmission}
      />

    </div>
  );
}

export default function AdmissionsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-[#0050CB] border-t-transparent rounded-full animate-spin" />
        <span>Loading Admissions Desk...</span>
      </div>
    }>
      <AdmissionsContent />
    </Suspense>
  );
}
