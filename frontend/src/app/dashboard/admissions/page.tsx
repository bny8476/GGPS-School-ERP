"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  GraduationCap, Plus, Download, Kanban, Table as TableIcon, 
  Sparkles, CheckCircle2, Calendar, Phone, Mail, Clock, 
  ArrowRight, Filter, ChevronRight, UserPlus, FileText, Check, AlertCircle, Eye, ShieldCheck,
  UploadCloud, X, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AdmissionKanban, { AdmissionApplication } from '@/components/admin/AdmissionKanban';
import AdminDataTable, { Column } from '@/components/admin/AdminDataTable';
import AddStudentModal from '@/components/admin/AddStudentModal';
import AdminEnquiriesManager from '@/components/admin/AdminEnquiriesManager';
import { downloadFile } from '@/lib/fileDownload';
import FilePreviewModal from '@/components/common/FilePreviewModal';
import FileUploadModal from '@/components/common/FileUploadModal';

function AdmissionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') || 'pipeline';

  const [activeTab, setActiveTab] = useState<string>(tabParam);
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isAddApplicantOpen, setIsAddApplicantOpen] = useState(false);
  const [selectedApplicantDocs, setSelectedApplicantDocs] = useState<AdmissionApplication | null>(null);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeUploadDocType, setActiveUploadDocType] = useState<string>('Birth Certificate');
  const [docStatuses, setDocStatuses] = useState<Record<string, Record<string, 'Verified' | 'Pending' | 'Rejected' | 'Replacement Required'>>>({
    app_5: {
      birthCertificate: 'Verified',
      transferCertificate: 'Verified',
      addressProof: 'Verified',
      photos: 'Verified',
    },
    app_1: {
      birthCertificate: 'Verified',
      transferCertificate: 'Pending',
      addressProof: 'Replacement Required',
      photos: 'Verified',
    },
  });

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
        headers: { 'Authorization': `Bearer ${token || ''}` }
      }).catch(() => null);

      let loaded: any[] = [];
      if (res && res.ok) {
        const raw = await res.json();
        loaded = Array.isArray(raw) ? raw : (raw.data || []);
      }

      setApplications(loaded || []);
    } catch (error) {
      console.error('Failed to fetch admissions', error);
      toast.error('Failed to load admissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      await fetch(`${apiBase}/api/admissions/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}` 
        },
        body: JSON.stringify({ status })
      }).catch(() => null);

      toast.success(`Applicant advanced to "${status}"`);
      setApplications(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch (error) {
      console.error(error);
      toast.error('Network error updating status');
    }
  };

  const metrics = useMemo(() => {
    return {
      total: applications.length,
      newInquiry: applications.filter(a => a.status === 'New Inquiry').length,
      demoScheduled: applications.filter(a => a.status === 'Demo Class Scheduled').length,
      interested: applications.filter(a => a.status === 'Interested').length,
      confirmed: applications.filter(a => a.status === 'Admission Confirmed').length,
    };
  }, [applications]);

  const handleExport = async () => {
    await downloadFile(
      '/api/v1/reports/export/admissions?format=csv',
      `GGPS-Admissions-Pipeline-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const columns: Column<AdmissionApplication>[] = [
    {
      header: 'Applicant Child',
      accessorKey: 'childFirstName',
      sortable: true,
      cell: (row: AdmissionApplication) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#0050CB] to-[#002772] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
            {row.childFirstName?.[0] || 'A'}
          </div>
          <div>
            <span className="font-bold text-[#000E28] dark:text-white block">
              {row.childFirstName} {row.childLastName}
            </span>
            <span className="text-[11px] text-slate-500">
              Inquiry: {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB') : 'Recent'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Grade Applied',
      accessorKey: 'gradeAppliedFor',
      sortable: true,
      cell: (row: AdmissionApplication) => (
        <span className="px-2.5 py-1 rounded-lg bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] font-bold text-xs">
          Class {row.gradeAppliedFor || 'Pre-KG'}
        </span>
      )
    },
    {
      header: 'Parent Contact',
      cell: (row: AdmissionApplication) => (
        <div className="text-xs">
          <span className="font-bold text-[#000E28] dark:text-white block">{row.parentName}</span>
          <a href={`tel:${row.parentPhone}`} className="text-slate-500 hover:text-[#0050CB] inline-flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-[#FF690C]" />
            <span>{row.parentPhone || '+91 98000 00000'}</span>
          </a>
        </div>
      )
    },
    {
      header: 'Pipeline Stage',
      accessorKey: 'status',
      sortable: true,
      cell: (row: AdmissionApplication) => {
        const stageColors: Record<string, string> = {
          'New': 'bg-blue-50 text-blue-700 border-blue-200',
          'New Inquiry': 'bg-blue-50 text-blue-700 border-blue-200',
          'Follow-up Pending': 'bg-indigo-50 text-indigo-700 border-indigo-200',
          'Demo Class Scheduled': 'bg-amber-50 text-amber-700 border-amber-200',
          'Interested': 'bg-purple-50 text-purple-700 border-purple-200',
          'Admission Confirmed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stageColors[row.status] || 'bg-slate-100 text-slate-600'}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Advance Pipeline',
      className: 'text-right',
      cell: (row: AdmissionApplication) => (
        <div className="flex items-center justify-end gap-1.5">
          {(row.status === 'New Inquiry' || row.status === 'New') && (
            <button
              onClick={() => updateStatus(row._id, 'Follow-up Pending')}
              className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Follow-up →
            </button>
          )}
          {row.status === 'Follow-up Pending' && (
            <button
              onClick={() => updateStatus(row._id, 'Demo Class Scheduled')}
              className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Schedule Demo →
            </button>
          )}
          {row.status === 'Demo Class Scheduled' && (
            <button
              onClick={() => updateStatus(row._id, 'Interested')}
              className="px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Mark Interested →
            </button>
          )}
          {row.status === 'Interested' && (
            <button
              onClick={() => updateStatus(row._id, 'Admission Confirmed')}
              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              Confirm Admission ✓
            </button>
          )}
          {row.status === 'Admission Confirmed' && (
            <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-7">
      
      {/* 1. Header with Breadcrumb & Actions */}
      <AdminPageHeader
        title="Admissions & Applicant CRM"
        subtitle="Track prospective admissions, campus tours, entrance evaluations, and confirmed enrollments."
        badge="Intake 2026-27"
        badgeVariant="orange"
        breadcrumbs={[
          { label: 'Admin Desk', href: '/dashboard' },
          { label: 'Admissions' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#001438] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsAddApplicantOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all shadow-xs shadow-[#0050CB]/25"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Inquiry</span>
            </button>
          </div>
        }
      />

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AdminStatCard
          label="Total Pipeline"
          value={metrics.total}
          supportingText="Inquiries logged for 2026-27"
          icon={GraduationCap}
          variant="blue"
          trend={{ value: "+14.2%", isPositive: true, period: "vs last term" }}
        />
        <AdminStatCard
          label="Campus Tours & Demos"
          value={metrics.demoScheduled}
          supportingText="Interviews scheduled this week"
          icon={Calendar}
          variant="orange"
          progress={65}
        />
        <AdminStatCard
          label="High Interest / Qualified"
          value={metrics.interested}
          supportingText="Ready for final offer letters"
          icon={Sparkles}
          variant="indigo"
        />
        <AdminStatCard
          label="Confirmed Admissions"
          value={metrics.confirmed}
          supportingText="Seat fees collected & admitted"
          icon={CheckCircle2}
          variant="emerald"
          trend={{ value: "+8.5%", isPositive: true, period: "68% conversion" }}
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

      {/* TAB CONTENT */}

      {/* 1. PIPELINE TAB */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                Applicant Lifecycle Funnel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Advance cards across stages or toggle to table mode for batch operations
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#000E28] border border-slate-200/60 dark:border-slate-800/80">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-[#001438] text-[#0050CB] dark:text-[#38BDF8] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#001438] text-[#0050CB] dark:text-[#38BDF8] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>
          </div>

          {viewMode === 'kanban' ? (
            <AdmissionKanban
              applications={applications}
              onStatusChange={updateStatus}
            />
          ) : (
            <AdminDataTable<AdmissionApplication>
              data={applications}
              columns={columns}
              keyExtractor={(item) => item._id}
              searchPlaceholder="Search applicant child, parent name, or contact number..."
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      {/* 2. ENQUIRIES TAB */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <AdminEnquiriesManager />
        </div>
      )}

      {/* 3. APPLICATION FORMS TAB */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Formal Admission Applications</h3>
            <p className="text-xs text-slate-500">Submitted application packages undergoing entrance assessment and academic review.</p>
          </div>
          <AdminDataTable<AdmissionApplication>
            data={applications.filter(a => a.status === 'Demo Class Scheduled' || a.status === 'Interested')}
            columns={columns}
            keyExtractor={(item) => item._id}
            searchPlaceholder="Search application submissions..."
            isLoading={isLoading}
          />
        </div>
      )}

      {/* 4. DOCUMENT VERIFICATION TAB */}
      {activeTab === 'documents' && (
        <div className="space-y-4 bg-white dark:bg-[#07152F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h3 className="text-sm font-black text-[#000E28] dark:text-slate-100">
              Admission Document Verification Desk
            </h3>
            <p className="text-xs text-slate-500">
              Verify statutory certificates, address proofs, and photos before final enrollment approval.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {applications.map((app) => {
              const currentStatuses = docStatuses[app._id] || {
                birthCertificate: 'Pending',
                transferCertificate: 'Pending',
                addressProof: 'Pending',
                photos: 'Pending',
              };

              const allVerified = Object.values(currentStatuses).every((s) => s === 'Verified');
              const anyRejected = Object.values(currentStatuses).some((s) => s === 'Rejected' || s === 'Replacement Required');

              return (
                <div key={app._id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#000E28] dark:text-slate-100">
                        {app.childFirstName} {app.childLastName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E5EEFF] text-[#0050CB]">
                        Class {app.gradeAppliedFor || 'LKG'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        allVerified
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : anyRejected
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {allVerified ? 'All Documents Verified' : anyRejected ? 'Action Required' : 'Verification In-Progress'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">Parent: {app.parentName} ({app.parentPhone || '+91 98000 00000'})</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedApplicantDocs(app)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0050CB] hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect & Verify Documents</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. CONFIRMED & FEE PAYMENT TAB */}
      {activeTab === 'confirmed' && (
        <div className="space-y-4 bg-white dark:bg-[#07152F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
              Admission Confirmation & Seat Fee Status
            </h3>
            <p className="text-xs text-slate-500">
              View confirmed admissions, generated admission numbers, and tuition seat deposit records.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {applications.filter(a => a.status === 'Admission Confirmed').map((app) => (
              <div key={app._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                      {app.childFirstName} {app.childLastName}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Class: {app.gradeAppliedFor || 'Pre-KG'} • Parent: {app.parentName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Admission Fee Paid (₹25,000)
                  </span>
                  <button
                    type="button"
                    onClick={() => toast.success(`Admission receipt sent to ${app.parentEmail || 'parent email'}`)}
                    className="px-3 py-1.5 bg-[#0050CB] hover:bg-[#003E9E] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Email Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Add Applicant Modal */}
      <AddStudentModal
        isOpen={isAddApplicantOpen}
        onClose={() => setIsAddApplicantOpen(false)}
        onSuccess={() => {
          fetchApplications();
        }}
      />

      {/* 6. Document Inspection & Verification Modal */}
      {selectedApplicantDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-[#000E28] dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0050CB]" />
                  Document Verification: {selectedApplicantDocs.childFirstName} {selectedApplicantDocs.childLastName}
                </h3>
                <p className="text-xs text-slate-500">
                  Grade: Class {selectedApplicantDocs.gradeAppliedFor || 'LKG'} • App No: {selectedApplicantDocs.applicationNumber || selectedApplicantDocs._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedApplicantDocs(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { key: 'birthCertificate', name: 'Birth Certificate', ext: 'PDF' },
                { key: 'transferCertificate', name: 'Transfer Certificate (TC)', ext: 'PDF' },
                { key: 'addressProof', name: 'Parent Address / Aadhaar Proof', ext: 'JPG' },
                { key: 'photos', name: 'Passport Size Student Photo', ext: 'PNG' },
              ].map((doc) => {
                const appId = selectedApplicantDocs._id;
                const status = docStatuses[appId]?.[doc.key] || 'Pending';

                const updateDocStatus = (newStatus: 'Verified' | 'Rejected' | 'Replacement Required') => {
                  setDocStatuses((prev) => ({
                    ...prev,
                    [appId]: {
                      ...(prev[appId] || {}),
                      [doc.key]: newStatus,
                    },
                  }));
                  toast.success(`${doc.name} marked as "${newStatus}"`);
                };

                return (
                  <div key={doc.key} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-[#0050CB]" />
                        <div>
                          <h4 className="font-bold text-xs text-[#000E28] dark:text-white">{doc.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">Format: {doc.ext} • Verified Storage Key</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : status === 'Replacement Required'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewFile({
                              _id: `${appId}_${doc.key}`,
                              originalName: `${doc.name}.${doc.ext.toLowerCase()}`,
                              mimeType: doc.ext === 'PDF' ? 'application/pdf' : 'image/jpeg',
                              size: 1048576,
                              url: `/api/v1/files/${appId}_${doc.key}/preview`,
                            });
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-[#0050CB] text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#0050CB]" /> Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            downloadFile(`/api/v1/files/${appId}_${doc.key}/download`, `GGPS-Admission-${selectedApplicantDocs.childFirstName}-${doc.key}.${doc.ext.toLowerCase()}`);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-[#0050CB] text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-[#0050CB]" /> Download
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveUploadDocType(doc.name);
                            setUploadModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-[#FF690C] text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-[#FF690C]" /> Replace
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateDocStatus('Verified')}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => updateDocStatus('Replacement Required')}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                        >
                          Require Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => updateDocStatus('Rejected')}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedApplicantDocs(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Close Desk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          isOpen={Boolean(previewFile)}
          onClose={() => setPreviewFile(null)}
          file={previewFile}
          onDownload={() => {
            downloadFile(previewFile._id || previewFile.url, previewFile.originalName);
          }}
        />
      )}

      {/* Universal File Upload Modal */}
      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        category="admissions"
        entityType="Admission"
        entityId={selectedApplicantDocs?._id}
        onUploadComplete={() => {
          toast.success(`${activeUploadDocType} uploaded and attached to admission application!`);
          if (selectedApplicantDocs) {
            setDocStatuses((prev) => ({
              ...prev,
              [selectedApplicantDocs._id]: {
                ...(prev[selectedApplicantDocs._id] || {}),
                [activeUploadDocType.toLowerCase().replace(/[^a-z]/g, '')]: 'Pending',
              },
            }));
          }
        }}
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
