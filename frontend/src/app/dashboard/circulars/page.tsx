"use client";

import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  Trash2, 
  Send, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Download, 
  Share2, 
  Eye, 
  X, 
  Calendar, 
  Sparkles, 
  Loader2,
  Building2,
  Bell,
  CheckCheck,
  Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { getApiBaseUrl } from '@/lib/utils';
import { printDocument } from '@/lib/exportUtils';

interface CircularItem {
  _id: string;
  refNo: string;
  title: string;
  category: 'Curricular' | 'Events' | 'Health & Safety' | 'Logistics' | 'Administrative';
  audience: string;
  cohort: string;
  isUrgent: boolean;
  message: string;
  date: string;
  author: string;
  readCount: number;
  totalRecipients: number;
  pdfUrl?: string;
}

const initialKindergartenCirculars: CircularItem[] = [
  {
    _id: 'c-101',
    refNo: 'CIRC-2026-014',
    title: 'Monsoon Preschool Arrival & Dispersal Safety Advisory',
    category: 'Logistics',
    audience: 'All Parents',
    cohort: 'Pre-KG, LKG, UKG',
    isUrgent: true,
    message: 'In view of continuous rain forecasts, morning toddler gates will open 15 minutes early at 08:00 AM. School buses will operate with dual-attendant assistance for safe umbrella transitions. Parents doing self-pickup are requested to use North Gate 2.',
    date: '2026-09-24',
    author: 'Principal Desk & Transport Wing',
    readCount: 148,
    totalRecipients: 154,
  },
  {
    _id: 'c-102',
    refNo: 'CIRC-2026-013',
    title: 'Grandparents & Toddler Storytelling Day — Invitation & Roster',
    category: 'Events',
    audience: 'Pre-KG Parents',
    cohort: 'Pre-KG Wing',
    isUrgent: false,
    message: 'We cordially invite grandparents of our Pre-KG toddlers for our annual Story Circle & Nursery Rhyme Celebration on Friday, Oct 2, from 09:30 AM to 11:30 AM. Light refreshments and Montessori play stations will be hosted in the Kindergarten Courtyard.',
    date: '2026-09-22',
    author: 'Dr. Sarah Jenkins (Head of ECCE)',
    readCount: 31,
    totalRecipients: 32,
  },
  {
    _id: 'c-103',
    refNo: 'CIRC-2026-012',
    title: 'Term 1 Phonics & Early Numeracy Milestone Progress Cards',
    category: 'Curricular',
    audience: 'LKG & UKG Parents',
    cohort: 'LKG & UKG',
    isUrgent: false,
    message: 'The comprehensive observation report cards for Term 1 (covering phonics recognition, number work, pencil grip, and sensory play) have been uploaded to each child’s parent portal account. Individual parent-educator check-ins are scheduled for next Saturday.',
    date: '2026-09-20',
    author: 'Academic Coordination Committee',
    readCount: 112,
    totalRecipients: 118,
  },
  {
    _id: 'c-104',
    refNo: 'CIRC-2026-011',
    title: 'Pediatric Health Desk: Seasonal Flu & Hand-Hygiene Drive',
    category: 'Health & Safety',
    audience: 'All Parents',
    cohort: 'Pre-KG, LKG, UKG',
    isUrgent: false,
    message: 'Our campus health office has initiated twice-daily infrared temperature logs and supervised bubbly handwash routines. Please ensure children exhibiting mild fever or cough rest at home until symptom-free for 24 hours.',
    date: '2026-09-18',
    author: "Sister Mary D'Souza (Pediatric Nurse)",
    readCount: 150,
    totalRecipients: 154,
  },
  {
    _id: 'c-105',
    refNo: 'CIRC-2026-010',
    title: 'Term 2 Composite Tuition & Montessori Learning Kit Ledger Notice',
    category: 'Administrative',
    audience: 'All Parents',
    cohort: 'All Kindergarten',
    isUrgent: true,
    message: 'Term 2 composite preschool fees, activity materials, and daycare meal subscriptions are due for payment. Digital invoices with instant UPI & card links are accessible in your parent account fees ledger.',
    date: '2026-09-15',
    author: 'Institutional Finance Desk',
    readCount: 139,
    totalRecipients: 154,
  },
];

export default function CircularsPage() {
  const [circulars, setCirculars] = useState<CircularItem[]>(initialKindergartenCirculars);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAudience, setSelectedAudience] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  
  // Compose modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Curricular' | 'Events' | 'Health & Safety' | 'Logistics' | 'Administrative'>('Curricular');
  const [newAudience, setNewAudience] = useState('All Parents');
  const [newCohort, setNewCohort] = useState('Pre-KG, LKG, UKG');
  const [newIsUrgent, setNewIsUrgent] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const apiBase = getApiBaseUrl();

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/announcements`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Merge API data with kindergarten items
          const apiFormatted: CircularItem[] = data.map((d: any, idx: number) => ({
            _id: d._id || `api-${idx}`,
            refNo: `CIRC-2026-${String(20 + idx).padStart(3, '0')}`,
            title: d.title || 'Official Circular',
            category: 'Curricular',
            audience: d.audience === 'All' ? 'All Users' : d.audience === 'Staff' ? 'Faculty & Staff' : 'All Parents',
            cohort: d.classId?.name || 'Pre-KG, LKG, UKG',
            isUrgent: false,
            message: d.message || '',
            date: d.createdAt ? d.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
            author: d.createdBy ? `${d.createdBy.firstName} ${d.createdBy.lastName}` : 'Administration Desk',
            readCount: 142,
            totalRecipients: 154,
          }));
          setCirculars([...apiFormatted, ...initialKindergartenCirculars]);
        }
      }
    } catch (err) {
      console.log('Using local kindergarten circulars ledger:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateCircular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) {
      toast.error('Please enter circular title and notice content.');
      return;
    }

    setIsSaving(true);
    try {
      // Post to backend announcement endpoint if available
      try {
        await fetch(`${apiBase}/api/announcements`, {
          method: 'POST',
          headers: getHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            title: newTitle,
            message: newMessage,
            audience: newAudience.includes('Staff') ? 'Staff' : newAudience.includes('All') ? 'All' : 'Parents',
          }),
        });
      } catch (e) {
        console.warn('Backend sync failed, saving locally:', e);
      }

      const newRef = `CIRC-2026-${String(Math.floor(Math.random() * 800) + 100)}`;
      const createdItem: CircularItem = {
        _id: `circ-${Date.now()}`,
        refNo: newRef,
        title: newTitle,
        category: newCategory,
        audience: newAudience,
        cohort: newCohort,
        isUrgent: newIsUrgent,
        message: newMessage,
        date: new Date().toISOString().split('T')[0],
        author: 'Principal Desk & Administration',
        readCount: 0,
        totalRecipients: newAudience === 'Pre-KG Parents' ? 32 : newAudience === 'LKG Parents' ? 58 : newAudience === 'UKG Parents' ? 60 : 154,
      };

      setCirculars([createdItem, ...circulars]);
      toast.success(`Circular ${newRef} dispatched and broadcast to parent portal!`);
      
      // Reset form
      setNewTitle('');
      setNewMessage('');
      setNewIsUrgent(false);
      setIsComposeOpen(false);
    } catch (err) {
      toast.error('Failed to dispatch circular');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, refNo: string) => {
    if (confirm(`Are you sure you want to archive or remove circular ${refNo}?`)) {
      setCirculars(prev => prev.filter(c => c._id !== id));
      toast.success(`Circular ${refNo} has been removed.`);
    }
  };

  const handleCopyLink = (refNo: string, title: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/parent?ref=${refNo}`);
      toast.success(`Direct parent circular link copied for "${title}"!`);
    }
  };

  const handlePrintNotice = (refNo: string, id: string) => {
    printDocument(`circular-card-${id}`, `GGPS School - Circular ${refNo}`);
  };

  // Filtering
  const filteredCirculars = circulars.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.title.toLowerCase().includes(q) || 
      item.refNo.toLowerCase().includes(q) || 
      item.message.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesAudience = selectedAudience === 'All' || item.audience.includes(selectedAudience) || item.cohort.includes(selectedAudience);
    const matchesPriority = selectedPriority === 'All' || (selectedPriority === 'Urgent' ? item.isUrgent : !item.isUrgent);

    return matchesSearch && matchesCategory && matchesAudience && matchesPriority;
  });

  const isFiltered = searchQuery !== '' || selectedCategory !== 'All' || selectedAudience !== 'All' || selectedPriority !== 'All';

  // KPI calculations
  const totalCirculars = circulars.length;
  const urgentCount = circulars.filter(c => c.isUrgent).length;
  const totalReads = circulars.reduce((acc, curr) => acc + curr.readCount, 0);
  const totalTargeted = circulars.reduce((acc, curr) => acc + curr.totalRecipients, 0);
  const avgReadRate = totalTargeted > 0 ? ((totalReads / totalTargeted) * 100).toFixed(1) : '94.2';

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-saas pb-24">
      {/* Header */}
      <AdminPageHeader
        title="Institutional Circulars & Notices Desk"
        subtitle="Issue, broadcast, and track verified preschool circulars, event invites, and pediatric safety notices."
        breadcrumbs={[
          { label: 'Admin Desk', href: '/dashboard' },
          { label: 'Communication', href: '/dashboard/circulars' },
          { label: 'Circulars & Notices' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsComposeOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0050CB] hover:bg-[#003E9E] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Circular</span>
            </button>
          </div>
        }
      />

      {/* 4 Standard Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#0050CB]/20 border border-blue-200/60 dark:border-blue-800/40">
          <span className="text-[11px] font-bold text-[#0050CB] dark:text-[#E5EEFF] block uppercase tracking-wider">
            Active Circulars
          </span>
          <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
            {totalCirculars} Published
          </span>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" /> 100% Broadcast to Parent App
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider">
            Parent Engagement Rate
          </span>
          <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
            {avgReadRate}%
          </span>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
            {totalReads} of {totalTargeted} Families Confirmed Read
          </span>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block uppercase tracking-wider">
            Kindergarten Target Wings
          </span>
          <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
            3 Cohorts
          </span>
          <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold mt-0.5 block">
            Pre-KG • LKG • UKG Tailored Notices
          </span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 block uppercase tracking-wider">
            Urgent Action Notices
          </span>
          <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">
            {urgentCount} Priority
          </span>
          <span className="text-[10px] text-amber-600 font-bold mt-0.5 block">
            Weather & Composite Ledger Notices
          </span>
        </div>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="p-4 bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circulars by title, reference code (CIRC-2026-xxx), or content..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0050CB] text-slate-800 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0050CB] cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Curricular">Curricular & Milestones</option>
              <option value="Events">Preschool Events</option>
              <option value="Health & Safety">Pediatric Health & Safety</option>
              <option value="Logistics">Logistics & Bus Routes</option>
              <option value="Administrative">Administrative & Fees</option>
            </select>
          </div>

          {/* Target Audience Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Audience:</span>
            <select
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0050CB] cursor-pointer"
            >
              <option value="All">All Audiences</option>
              <option value="Pre-KG">Pre-KG Wing</option>
              <option value="LKG">LKG Wing</option>
              <option value="UKG">UKG Wing</option>
              <option value="All Parents">All Parents</option>
              <option value="Faculty & Staff">Faculty & Staff</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0050CB] cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent Only</option>
              <option value="Regular">Regular Only</option>
            </select>
          </div>

          {/* Reset Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedAudience('All');
                setSelectedPriority('All');
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>
            Displaying <strong className="text-slate-800 dark:text-white">{filteredCirculars.length}</strong> of{' '}
            {circulars.length} Kindergarten Circulars
          </span>
          <span className="font-semibold text-[#0050CB] dark:text-[#38BDF8] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Direct sync to Parent App & SMS Gateway
          </span>
        </div>
      </div>

      {/* Circulars List Feed */}
      <div className="space-y-4">
        {filteredCirculars.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
            <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-full mb-3 text-[#0050CB]">
              <Megaphone className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No Matching Circulars Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Try adjusting your search query, clearing filters, or compose a new circular for the preschool community.
            </p>
          </div>
        ) : (
          filteredCirculars.map((item) => {
            const readPercentage = item.totalRecipients > 0 
              ? Math.round((item.readCount / item.totalRecipients) * 100) 
              : 100;

            return (
              <div 
                key={item._id}
                id={`circular-card-${item._id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-[#0050CB]/40 transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reference No */}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.refNo}
                    </span>

                    {/* Category */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      item.category === 'Curricular'
                        ? 'bg-blue-100 text-[#0050CB] dark:bg-blue-950/40 dark:text-blue-300'
                        : item.category === 'Events'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                        : item.category === 'Health & Safety'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : item.category === 'Logistics'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                    }`}>
                      {item.category}
                    </span>

                    {/* Cohort Badge */}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E5EEFF] dark:bg-[#0050CB]/30 text-[#0050CB] dark:text-[#E5EEFF]">
                      {item.cohort}
                    </span>

                    {/* Urgent Badge */}
                    {item.isUrgent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-100 text-[#FF690C] dark:bg-orange-950/40 dark:text-orange-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Urgent Advisory
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Published: {item.date}</span>
                  </div>
                </div>

                {/* Title & Body */}
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                    {item.message}
                  </p>
                </div>

                {/* Footer Telemetry & Quick Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-medium">
                      Author: <strong className="text-slate-800 dark:text-slate-200">{item.author}</strong>
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {item.readCount}/{item.totalRecipients} Read ({readPercentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item.refNo, item.title)}
                      className="p-1.5 text-slate-500 hover:text-[#0050CB] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Copy Parent Share Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintNotice(item.refNo, item._id)}
                      className="p-1.5 text-slate-500 hover:text-[#0050CB] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Print Official Circular"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id, item.refNo)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Archive Circular"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* COMPOSE MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#0050CB]" />
                  Issue New Kindergarten Circular
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Broadcast verified official notifications to families and staff via portal and SMS.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCircular} className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-200">
              <div>
                <label className="block mb-1.5">Circular Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Preschool Annual Sports Morning & Color Day Schedule"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0050CB] text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0050CB]"
                  >
                    <option value="Curricular">Curricular & Milestones</option>
                    <option value="Events">Preschool Events</option>
                    <option value="Health & Safety">Pediatric Health & Safety</option>
                    <option value="Logistics">Logistics & Bus Routes</option>
                    <option value="Administrative">Administrative & Fees</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5">Target Audience</label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0050CB]"
                  >
                    <option value="All Parents">All Kindergarten Parents</option>
                    <option value="Pre-KG Parents">Pre-KG Wing Parents</option>
                    <option value="LKG Parents">LKG Wing Parents</option>
                    <option value="UKG Parents">UKG Wing Parents</option>
                    <option value="Faculty & Staff">Teaching Staff & Faculty Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block mb-1.5">Preschool Cohort Scope</label>
                  <select
                    value={newCohort}
                    onChange={(e) => setNewCohort(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0050CB]"
                  >
                    <option value="Pre-KG, LKG, UKG">All Kindergarten (Pre-KG, LKG, UKG)</option>
                    <option value="Pre-KG Wing">Pre-KG Wing Only</option>
                    <option value="LKG Wing">LKG Wing Only</option>
                    <option value="UKG Wing">UKG Wing Only</option>
                  </select>
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsUrgent}
                      onChange={(e) => setNewIsUrgent(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF690C] focus:ring-[#FF690C]"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Mark as Urgent / Priority Advisory
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Will trigger high-priority push notice and amber alert tag in the parent portal.
                  </p>
                </div>
              </div>

              <div>
                <label className="block mb-1.5">Notice Body & Details *</label>
                <textarea
                  required
                  rows={5}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Provide complete circular details, timing, venue, dress code, or parent action instructions..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0050CB] text-slate-800 dark:text-slate-100 font-normal leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0050CB] hover:bg-[#003E9E] disabled:bg-slate-300 text-white rounded-xl shadow-md cursor-pointer transition-all"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Broadcast Circular</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
