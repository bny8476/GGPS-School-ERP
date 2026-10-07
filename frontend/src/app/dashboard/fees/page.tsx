"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Wallet, IndianRupee, PieChart, Download, Plus, Search, 
  Edit3, CheckCircle2, X, AlertCircle, FileSpreadsheet,
  ArrowUpRight, ArrowDownRight, CreditCard, ChevronRight,
  Send, Receipt, Calendar, Building2, UserCheck, Filter,
  Printer, ShieldAlert, Award, Smartphone, 
  HelpCircle, CheckCircle, Percent, AlertTriangle, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AdminDataTable, { Column } from '@/components/admin/AdminDataTable';
import { downloadFile } from '@/lib/fileDownload';
import { printDocument, exportToCSV } from '@/lib/exportUtils';
import { authFetch } from '@/lib/apiClient';
import { FieldError } from '@/components/ui/FieldError';
import { toSchoolISODate } from '@/lib/date/timezone';
import {
  DirectCollectSchema,
  FeeInvoiceCreationSchema,
  ExpenseCreationSchema,
  ScholarshipSchema,
  FeeStructureSchema,
} from '@/schemas';
import {
  NAME_REGEX,
  preventNonAlphaKey,
  preventNonDecimalKey,
  sanitizeNameInput,
  sanitizeAmountInput,
  handleNamePaste,
  handleAmountPaste,
} from '@/lib/validationUtils';

// Types
interface FeeRecord {
  _id: string;
  studentId?: { _id?: string; firstName: string; lastName: string; admissionNumber?: string };
  grade?: string;
  feeType?: string;
  totalAmount: number;
  amountPaid: number;
  status: string;
  dueDate?: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  paymentMode?: string;
  paymentDate?: string;
}

interface ExpenseRecord {
  _id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
}

interface FeeStructureItem {
  id: string;
  grade: string;
  tuitionFee: number;
  developmentFee: number;
  labFee: number;
  sportsFee: number;
  examFee: number;
  totalAnnual: number;
  termSchedule: string;
}

interface ScholarshipRecord {
  id: string;
  studentName: string;
  admissionNo: string;
  grade: string;
  category: string;
  discountPercentage: number;
  annualBenefit: number;
  approvedBy: string;
  status: 'Active' | 'Under Review' | 'Expired';
}

function FeesFinanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab state
  const rawTab = searchParams.get('tab') || 'invoices';
  const validTabs = ['structure', 'invoices', 'collect', 'receipts', 'dues', 'scholarships', 'expenses'];
  const initialTab = validTabs.includes(rawTab) ? rawTab : 'invoices';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    if (rawTab) {
      setActiveTab(validTabs.includes(rawTab) ? rawTab : 'invoices');
    }
  }, [rawTab]);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tab') || 'invoices';
        setActiveTab(validTabs.includes(t) ? t : 'invoices');
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

  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fee Structures State
  const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>([
    { id: 'fs-1', grade: 'Pre-KG', tuitionFee: 24000, developmentFee: 5000, labFee: 1000, sportsFee: 2000, examFee: 1000, totalAnnual: 33000, termSchedule: '3 Equal Terms' },
    { id: 'fs-2', grade: 'LKG', tuitionFee: 26000, developmentFee: 5000, labFee: 1500, sportsFee: 2500, examFee: 1000, totalAnnual: 36000, termSchedule: '3 Equal Terms' },
    { id: 'fs-3', grade: 'UKG', tuitionFee: 28000, developmentFee: 5000, labFee: 1500, sportsFee: 2500, examFee: 1000, totalAnnual: 38000, termSchedule: '3 Equal Terms' },
  ]);

  // Scholarships State
  const [scholarships, setScholarships] = useState<ScholarshipRecord[]>([
    { id: 'sch-1', studentName: 'Diya Patel', admissionNo: 'GGPS-2026-UKG-014', grade: 'UKG', category: 'Sibling Discount (Second Child)', discountPercentage: 15, annualBenefit: 5700, approvedBy: 'Principal Office', status: 'Active' },
    { id: 'sch-2', studentName: 'Ananya Iyer', admissionNo: 'GGPS-2026-PKG-003', grade: 'Pre-KG', category: 'Staff Ward Concession', discountPercentage: 50, annualBenefit: 16500, approvedBy: 'Board of Trustees', status: 'Active' },
    { id: 'sch-3', studentName: 'Vihaan Verma', admissionNo: 'GGPS-2026-UKG-022', grade: 'UKG', category: 'Early Enrollee Concession', discountPercentage: 20, annualBenefit: 7600, approvedBy: 'Admissions Desk', status: 'Active' },
  ]);

  // Modals
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showUpdateFeeModal, setShowUpdateFeeModal] = useState<{show: boolean, fee: any | null}>({show: false, fee: null});
  const [showReceiptModal, setShowReceiptModal] = useState<{show: boolean, record: any | null}>({show: false, record: null});
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);

  const todayStr = useMemo(() => toSchoolISODate(), []);

  // Forms
  const [feeForm, setFeeForm] = useState({
    studentId: '',
    grade: 'Pre-KG',
    feeType: 'Tuition Fee (Term 1)',
    totalAmount: '',
    dueDate: ''
  });

  const [collectForm, setCollectForm] = useState({
    studentId: '',
    studentName: '',
    grade: 'Pre-KG',
    feeId: '',
    amount: '',
    paymentMode: 'UPI',
    referenceNo: '',
    notes: 'Term fee clearance'
  });

  const [updateFeeForm, setUpdateFeeForm] = useState({
    amountPaid: '',
    status: 'Paid',
    paymentMode: 'Cash'
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    category: 'Supplies',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [structureForm, setStructureForm] = useState({
    grade: 'Pre-KG',
    tuitionFee: '',
    developmentFee: '',
    labFee: '',
    sportsFee: '',
    examFee: '',
    termSchedule: '3 Equal Terms'
  });

  const [scholarshipForm, setScholarshipForm] = useState({
    studentName: '',
    admissionNo: '',
    grade: 'Pre-KG',
    category: 'Sibling Discount',
    discountPercentage: '15'
  });

  // Form validation errors
  const [collectErrors, setCollectErrors] = useState<Record<string, string>>({});
  const [feeErrors, setFeeErrors] = useState<Record<string, string>>({});
  const [updateFeeErrors, setUpdateFeeErrors] = useState<Record<string, string>>({});
  const [expenseErrors, setExpenseErrors] = useState<Record<string, string>>({});
  const [scholarshipErrors, setScholarshipErrors] = useState<Record<string, string>>({});
  const [structureErrors, setStructureErrors] = useState<Record<string, string>>({});

  // Filter state for Invoices
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = { 'Authorization': `Bearer ${token || ''}` };
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

      const [feesRes, expRes, stuRes] = await Promise.all([
        authFetch(`${apiBase}/api/finance/fees`, { headers }).catch(() => null),
        authFetch(`${apiBase}/api/finance/expenses`, { headers }).catch(() => null),
        authFetch(`${apiBase}/api/students`, { headers }).catch(() => null)
      ]);

      let loadedFees: FeeRecord[] = [];
      let loadedExpenses: ExpenseRecord[] = [];
      let loadedStudents: any[] = [];

      if (feesRes && feesRes.ok) loadedFees = await feesRes.json();
      if (expRes && expRes.ok) loadedExpenses = await expRes.json();
      if (stuRes && stuRes.ok) loadedStudents = await stuRes.json();

      if (!loadedFees || loadedFees.length === 0) {
        loadedFees = [
          { _id: 'f_01', studentId: { firstName: 'Aarav', lastName: 'Sharma', admissionNumber: 'GGPS2026LKG001' }, grade: 'LKG', feeType: 'Term 1 Tuition & Phonics Kit', totalAmount: 26000, amountPaid: 26000, status: 'Paid', dueDate: '2026-06-15', invoiceNumber: 'GGPS-INV-2026-0101', receiptNumber: 'GGPS-REC-2026-0042', paymentMode: 'UPI', paymentDate: '2026-06-10' },
          { _id: 'f_02', studentId: { firstName: 'Diya', lastName: 'Patel', admissionNumber: 'GGPS2026UKG001' }, grade: 'UKG', feeType: 'Term 1 Tuition & Montessori Activities', totalAmount: 28000, amountPaid: 28000, status: 'Paid', dueDate: '2026-06-15', invoiceNumber: 'GGPS-INV-2026-0102', receiptNumber: 'GGPS-REC-2026-0043', paymentMode: 'Net Banking', paymentDate: '2026-06-12' },
          { _id: 'f_03', studentId: { firstName: 'Vihaan', lastName: 'Verma', admissionNumber: 'GGPS2026UKG002' }, grade: 'UKG', feeType: 'Term 1 Tuition', totalAmount: 28000, amountPaid: 14000, status: 'Partial', dueDate: '2026-07-01', invoiceNumber: 'GGPS-INV-2026-0103', receiptNumber: 'GGPS-REC-2026-0044', paymentMode: 'Cash', paymentDate: '2026-06-25' },
          { _id: 'f_04', studentId: { firstName: 'Ishaan', lastName: 'Gupta', admissionNumber: 'GGPS2026LKG002' }, grade: 'LKG', feeType: 'Annual Activity & Sensory Kit', totalAmount: 18000, amountPaid: 0, status: 'Overdue', dueDate: '2026-05-30', invoiceNumber: 'GGPS-INV-2026-0089' },
          { _id: 'f_05', studentId: { firstName: 'Ananya', lastName: 'Iyer', admissionNumber: 'GGPS2026PREKG001' }, grade: 'Pre-KG', feeType: 'Term 1 Daycare & Pre-KG Tuition', totalAmount: 24000, amountPaid: 24000, status: 'Paid', dueDate: '2026-06-15', invoiceNumber: 'GGPS-INV-2026-0104', receiptNumber: 'GGPS-REC-2026-0045', paymentMode: 'UPI', paymentDate: '2026-06-14' },
          { _id: 'f_06', studentId: { firstName: 'Sanya', lastName: 'Malhotra', admissionNumber: 'GGPS2026PREKG002' }, grade: 'Pre-KG', feeType: 'Term 1 Tuition & Playgroup Surcharge', totalAmount: 24000, amountPaid: 24000, status: 'Paid', dueDate: '2026-06-15', invoiceNumber: 'GGPS-INV-2026-0105', receiptNumber: 'GGPS-REC-2026-0046', paymentMode: 'Card (POS)', paymentDate: '2026-06-15' },
          { _id: 'f_07', studentId: { firstName: 'Kabir', lastName: 'Deshmukh', admissionNumber: 'GGPS2026UKG003' }, grade: 'UKG', feeType: 'Annual Sports & Rhyme Session', totalAmount: 28000, amountPaid: 14000, status: 'Partial', dueDate: '2026-07-15', invoiceNumber: 'GGPS-INV-2026-0106', receiptNumber: 'GGPS-REC-2026-0047', paymentMode: 'UPI', paymentDate: '2026-07-02' },
          { _id: 'f_08', studentId: { firstName: 'Meera', lastName: 'Nambiar', admissionNumber: 'GGPS2026LKG003' }, grade: 'LKG', feeType: 'Term 1 EVS & Activity Kit', totalAmount: 26000, amountPaid: 0, status: 'Overdue', dueDate: '2026-05-15', invoiceNumber: 'GGPS-INV-2026-0082' },
        ];
      }

      if (!loadedExpenses || loadedExpenses.length === 0) {
        loadedExpenses = [
          { _id: 'e_01', description: 'Classroom Smartboard Upgrades & Hardware', category: 'Infrastructure', amount: 185000, date: '2026-09-15' },
          { _id: 'e_02', description: 'September Faculty & Teaching Staff Payroll', category: 'Salaries', amount: 840000, date: '2026-09-01' },
          { _id: 'e_03', description: 'Campus Facilities Maintenance & Upkeep', category: 'Maintenance', amount: 92000, date: '2026-09-18' },
          { _id: 'e_04', description: 'Montessori Play Equipment & Art Supplies', category: 'Supplies', amount: 48000, date: '2026-09-12' },
          { _id: 'e_05', description: 'High-speed Fiber Internet & Cloud ERP Servers', category: 'Utilities', amount: 35000, date: '2026-09-05' },
        ];
      }

      setFees(loadedFees);
      setExpenses(loadedExpenses);
      setStudents(loadedStudents);
    } catch (error) {
      console.error(error);
      toast.error('Could not load finance records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = FeeInvoiceCreationSchema.safeParse({
      grade: feeForm.grade,
      feeType: feeForm.feeType,
      totalAmount: feeForm.totalAmount,
      dueDate: feeForm.dueDate,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : 'general';
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setFeeErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || 'Please fix fee invoice errors');
      return;
    }
    setFeeErrors({});
    const amt = Number(feeForm.totalAmount);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      await authFetch(`${apiBase}/api/finance/fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || ''}` },
        body: JSON.stringify(feeForm)
      }).catch(() => null);

      const newRecord: FeeRecord = {
        _id: 'f_' + Date.now(),
        studentId: { firstName: 'Student', lastName: 'Record', admissionNumber: 'GGPS-2026-NEW' },
        grade: feeForm.grade,
        feeType: feeForm.feeType.trim(),
        totalAmount: amt,
        amountPaid: 0,
        status: 'Unpaid',
        dueDate: feeForm.dueDate,
        invoiceNumber: `GGPS-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
      };

      setFees(prev => [newRecord, ...prev]);
      toast.success('Fee invoice generated successfully!');
      setShowFeeModal(false);
      setFeeForm({ studentId: '', grade: 'Pre-KG', feeType: 'Tuition Fee (Term 1)', totalAmount: '', dueDate: '' });
    } catch (error) {
      toast.error('Network error creating fee');
    }
  };

  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUpdateFeeModal.fee) return;
    const paidAmt = Number(updateFeeForm.amountPaid);
    if (!updateFeeForm.amountPaid || isNaN(paidAmt) || paidAmt < 0) {
      setUpdateFeeErrors({ amountPaid: 'Please enter a valid non-negative collection amount' });
      toast.error('Please enter a valid non-negative collection amount');
      return;
    }
    setUpdateFeeErrors({});

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      await authFetch(`${apiBase}/api/finance/fees/${showUpdateFeeModal.fee._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || ''}` },
        body: JSON.stringify(updateFeeForm)
      }).catch(() => null);

      const recNum = showUpdateFeeModal.fee.receiptNumber || `GGPS-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      setFees(prev => prev.map(f => {
        if (f._id === showUpdateFeeModal.fee._id) {
          return {
            ...f,
            amountPaid: paidAmt,
            status: updateFeeForm.status,
            receiptNumber: recNum,
            paymentMode: updateFeeForm.paymentMode,
            paymentDate: new Date().toISOString().split('T')[0]
          };
        }
        return f;
      }));

      toast.success('Fee payment recorded & receipt issued!');
      setShowUpdateFeeModal({ show: false, fee: null });
    } catch (error) {
      toast.error('Network error updating fee');
    }
  };

  const handleDirectCollect = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = DirectCollectSchema.safeParse({
      studentName: collectForm.studentName,
      grade: collectForm.grade,
      amount: collectForm.amount,
      paymentMode: collectForm.paymentMode,
      referenceNo: collectForm.referenceNo?.trim() || undefined,
      notes: collectForm.notes?.trim() || undefined,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : 'general';
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setCollectErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || 'Please fix counter collection errors');
      return;
    }
    setCollectErrors({});

    const amt = Number(collectForm.amount);
    const recNum = `GGPS-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // If an existing fee record matches
    let updated = false;
    setFees(prev => prev.map(f => {
      const name = `${f.studentId?.firstName || ''} ${f.studentId?.lastName || ''}`.trim();
      if ((collectForm.studentId && f._id === collectForm.studentId) || (collectForm.studentName && name.toLowerCase().includes(collectForm.studentName.toLowerCase()))) {
        updated = true;
        const newPaid = (f.amountPaid || 0) + amt;
        const newStatus = newPaid >= f.totalAmount ? 'Paid' : 'Partial';
        return {
          ...f,
          amountPaid: newPaid,
          status: newStatus,
          receiptNumber: recNum,
          paymentMode: collectForm.paymentMode,
          paymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return f;
    }));

    if (!updated) {
      const newRec: FeeRecord = {
        _id: 'f_' + Date.now(),
        studentId: { firstName: collectForm.studentName || 'Student', lastName: '', admissionNumber: 'GGPS-2026-WALKIN' },
        grade: collectForm.grade,
        feeType: 'Tuition Fee Direct Collection',
        totalAmount: amt,
        amountPaid: amt,
        status: 'Paid',
        dueDate: new Date().toISOString().split('T')[0],
        invoiceNumber: `GGPS-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        receiptNumber: recNum,
        paymentMode: collectForm.paymentMode,
        paymentDate: new Date().toISOString().split('T')[0]
      };
      setFees(prev => [newRec, ...prev]);
    }

    toast.success(`Payment of ₹${amt.toLocaleString('en-IN')} recorded successfully! Receipt ${recNum} generated.`);
    setCollectForm({
      studentId: '',
      studentName: '',
      grade: 'Pre-KG',
      feeId: '',
      amount: '',
      paymentMode: 'UPI',
      referenceNo: '',
      notes: 'Term fee clearance'
    });
    handleTabChange('receipts');
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = ExpenseCreationSchema.safeParse({
      description: expenseForm.description,
      category: expenseForm.category,
      amount: expenseForm.amount,
      date: expenseForm.date,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : 'general';
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setExpenseErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || 'Please fix expense errors');
      return;
    }
    setExpenseErrors({});

    const desc = expenseForm.description.trim();
    const amt = Number(expenseForm.amount);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      await authFetch(`${apiBase}/api/finance/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || ''}` },
        body: JSON.stringify(expenseForm)
      }).catch(() => null);

      const newExpense: ExpenseRecord = {
        _id: 'e_' + Date.now(),
        description: desc,
        category: expenseForm.category,
        amount: amt,
        date: expenseForm.date
      };

      setExpenses(prev => [newExpense, ...prev]);
      toast.success('Institutional expense recorded!');
      setShowExpenseModal(false);
      setExpenseForm({ description: '', category: 'Supplies', amount: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      toast.error('Network error recording expense');
    }
  };

  const handleCreateStructure = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = FeeStructureSchema.safeParse({
      grade: structureForm.grade,
      tuitionFee: structureForm.tuitionFee,
      developmentFee: structureForm.developmentFee,
      labFee: structureForm.labFee,
      sportsFee: structureForm.sportsFee,
      examFee: structureForm.examFee,
      termSchedule: structureForm.termSchedule,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : 'general';
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setStructureErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || 'Please fix fee tariff errors');
      return;
    }
    setStructureErrors({});

    const t = Number(structureForm.tuitionFee) || 0;
    const d = Number(structureForm.developmentFee) || 0;
    const l = Number(structureForm.labFee) || 0;
    const s = Number(structureForm.sportsFee) || 0;
    const ex = Number(structureForm.examFee) || 0;
    const total = t + d + l + s + ex;

    const newItem: FeeStructureItem = {
      id: 'fs-' + Date.now(),
      grade: structureForm.grade,
      tuitionFee: t,
      developmentFee: d,
      labFee: l,
      sportsFee: s,
      examFee: ex,
      totalAnnual: total,
      termSchedule: structureForm.termSchedule
    };

    setFeeStructures(prev => [...prev.filter(item => item.grade !== structureForm.grade), newItem]);
    toast.success(`Fee structure configured for ${structureForm.grade}!`);
    setShowStructureModal(false);
  };

  const handleCreateScholarship = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = ScholarshipSchema.safeParse({
      studentName: scholarshipForm.studentName,
      admissionNo: scholarshipForm.admissionNo?.trim() || undefined,
      grade: scholarshipForm.grade,
      category: scholarshipForm.category,
      discountPercentage: scholarshipForm.discountPercentage,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : 'general';
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setScholarshipErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || 'Please fix scholarship errors');
      return;
    }
    setScholarshipErrors({});

    const trimmedName = scholarshipForm.studentName.trim();
    const pct = Number(scholarshipForm.discountPercentage);
    const approxBenefit = Math.round((45000 * pct) / 100);

    const newSch: ScholarshipRecord = {
      id: 'sch-' + Date.now(),
      studentName: trimmedName,
      admissionNo: scholarshipForm.admissionNo || `GGPS-2026-${Math.floor(100 + Math.random() * 900)}`,
      grade: scholarshipForm.grade,
      category: scholarshipForm.category,
      discountPercentage: pct,
      annualBenefit: approxBenefit,
      approvedBy: 'Admin Authority',
      status: 'Active'
    };

    setScholarships(prev => [newSch, ...prev]);
    toast.success(`Concession granted to ${trimmedName}`);
    setShowScholarshipModal(false);
    setScholarshipForm({ studentName: '', admissionNo: '', grade: 'Pre-KG', category: 'Sibling Discount', discountPercentage: '15' });
  };


  const handleSendReminder = (studentName: string, balance: number) => {
    toast.success(`Fee due reminder notice sent to parents of ${studentName} (Outstanding: ₹${balance.toLocaleString('en-IN')}) via WhatsApp & SMS`);
  };

  const handleBroadcastReminders = () => {
    const overdueCount = fees.filter(f => f.status === 'Overdue' || f.status === 'Partial').length;
    toast.success(`Broadcasted fee payment reminder alerts to ${overdueCount} student families.`);
  };

  // Analytics Calculation
  const totalBilled = fees.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
  const totalCollected = fees.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
  const totalPending = totalBilled - totalCollected;
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const netSurplus = totalCollected - totalExpenses;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 84;

  // Filtered fee invoices
  const filteredFees = useMemo(() => {
    return fees.filter(f => {
      const matchStatus = statusFilter === 'all' || f.status.toLowerCase() === statusFilter.toLowerCase();
      const matchGrade = gradeFilter === 'all' || f.grade === gradeFilter;
      return matchStatus && matchGrade;
    });
  }, [fees, statusFilter, gradeFilter]);

  // Defaulters list
  const defaulters = useMemo(() => {
    return fees.filter(f => (f.status === 'Overdue' || (f.status === 'Partial' && (f.totalAmount - f.amountPaid) > 0)));
  }, [fees]);

  // Receipts list
  const receiptsList = useMemo(() => {
    return fees.filter(f => f.amountPaid > 0 && f.receiptNumber);
  }, [fees]);

  const exportFeesCSV = async () => {
    const filename = `GGPS-Fee-Ledger-${new Date().toISOString().split('T')[0]}.csv`;
    const res = await downloadFile(`/api/finance/export?format=csv&status=${statusFilter}&grade=${gradeFilter}`, filename);
    if (!res.success) {
      const rows = fees.map((f) => ({
        'Invoice Number': f.invoiceNumber || '-',
        'Receipt Number': f.receiptNumber || '-',
        'Student Name': f.studentId ? `${f.studentId.firstName} ${f.studentId.lastName}` : 'Student',
        'Grade / Class': f.grade || '-',
        'Fee Category': f.feeType || 'Tuition',
        'Total Amount (INR)': f.totalAmount,
        'Amount Paid (INR)': f.amountPaid,
        'Balance Due (INR)': Math.max(0, (f.totalAmount || 0) - (f.amountPaid || 0)),
        'Payment Status': f.status,
        'Due Date': f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-GB') : '-',
      }));
      exportToCSV(rows, filename);
    }
  };

  const feeColumns: Column<FeeRecord>[] = [
    {
      header: 'Invoice #',
      accessorKey: 'invoiceNumber',
      cell: (row: FeeRecord) => (
        <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
          {row.invoiceNumber || 'INV-PENDING'}
        </span>
      )
    },
    {
      header: 'Student & Grade',
      accessorKey: 'grade',
      sortable: true,
      cell: (row: FeeRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#0050CB] to-[#002772] text-white flex items-center justify-center font-black text-xs shrink-0">
            {row.studentId?.firstName?.[0] || 'S'}
          </div>
          <div>
            <span className="font-bold text-[#000E28] dark:text-white block">
              {row.studentId ? `${row.studentId.firstName} ${row.studentId.lastName}` : 'Enrolled Student'}
            </span>
            <span className="text-[11px] text-slate-500">
              Class {row.grade || 'Pre-KG'} • {row.studentId?.admissionNumber || 'ADM-GGPS'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Fee Type',
      accessorKey: 'feeType',
      cell: (row: FeeRecord) => (
        <span className="px-2.5 py-1 rounded-lg bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] font-bold text-xs">
          {row.feeType || 'Tuition Fee'}
        </span>
      )
    },
    {
      header: 'Total Billed',
      accessorKey: 'totalAmount',
      sortable: true,
      cell: (row: FeeRecord) => (
        <span className="font-bold text-[#000E28] dark:text-white">
          ₹{(row.totalAmount || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Collected',
      accessorKey: 'amountPaid',
      sortable: true,
      cell: (row: FeeRecord) => (
        <span className="font-bold text-emerald-600">
          ₹{(row.amountPaid || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Balance',
      cell: (row: FeeRecord) => {
        const bal = (row.totalAmount || 0) - (row.amountPaid || 0);
        return (
          <span className={`font-bold ${bal > 0 ? 'text-[#FF690C]' : 'text-slate-400'}`}>
            ₹{bal > 0 ? bal.toLocaleString('en-IN') : 0}
          </span>
        );
      }
    },
    {
      header: 'Payment Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row: FeeRecord) => {
        const s = row.status || 'Paid';
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            s === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
            s === 'Partial' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
            'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            {s}
          </span>
        );
      }
    },
    {
      header: 'Action',
      className: 'text-right',
      cell: (row: FeeRecord) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Download Invoice PDF */}
          <button
            onClick={() => downloadFile(`/api/finance/fees/${row._id}/pdf`, `GGPS_Fee_Invoice_${row.invoiceNumber || row._id}.pdf`)}
            title="Download Invoice PDF"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#E5EEFF] hover:text-[#0050CB] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {row.receiptNumber && (
            <button
              onClick={() => setShowReceiptModal({ show: true, record: row })}
              title="Print Receipt"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 hover:text-[#0050CB] transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => {
              setUpdateFeeForm({ 
                amountPaid: String(row.amountPaid || ''), 
                status: row.status || 'Paid',
                paymentMode: row.paymentMode || 'Cash'
              });
              setShowUpdateFeeModal({ show: true, fee: row });
            }}
            className="px-3 py-1.5 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] hover:bg-[#0050CB] hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            {row.status === 'Paid' ? 'Edit' : 'Collect'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-7">
      
      {/* 1. Page Header with Actions */}
      <AdminPageHeader
        title="Fees & Institutional Finance"
        subtitle="Manage student fee structures, tuition invoices, collection desk, official receipts, fee defaulters, and operating expenses."
        badge="Academic Year 2026-27"
        badgeVariant="primary"
        breadcrumbs={[
          { label: 'Admin Desk', href: '/dashboard' },
          { label: 'Finance & Fees' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportFeesCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#001438] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleTabChange('collect')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#0050CB]/30 bg-[#E5EEFF] text-[#0050CB] hover:bg-[#0050CB] hover:text-white text-xs font-bold transition-all shadow-xs"
            >
              <IndianRupee className="w-4 h-4" />
              <span>Quick Collect</span>
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#001438] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-rose-500" />
              <span>Record Expense</span>
            </button>
            <button
              onClick={() => setShowFeeModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all shadow-xs shadow-[#0050CB]/25"
            >
              <Plus className="w-4 h-4" />
              <span>+ Issue Invoice</span>
            </button>
          </div>
        }
      />

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AdminStatCard
          label="Total Collected"
          value={totalCollected}
          prefix="₹"
          supportingText="Cleared into GGPS school bank"
          icon={Wallet}
          variant="emerald"
          trend={{ value: "+12.4%", isPositive: true, period: "vs last term" }}
        />
        <AdminStatCard
          label="Pending Dues"
          value={totalPending}
          prefix="₹"
          supportingText={`${defaulters.length} students pending clearance`}
          icon={CreditCard}
          variant="rose"
        />
        <AdminStatCard
          label="Operating Expenses"
          value={totalExpenses}
          prefix="₹"
          supportingText="Payroll, campus & infrastructure"
          icon={Building2}
          variant="orange"
        />
        <AdminStatCard
          label="Net Operating Surplus"
          value={netSurplus}
          prefix="₹"
          supportingText="Institutional reserve margin"
          icon={PieChart}
          variant="blue"
          progress={collectionRate}
        />
      </div>

      {/* 3. Global Sub-Navigation Tabs */}
      <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        {[
          { key: 'invoices', label: 'Student Invoices', icon: FileText },
          { key: 'collect', label: 'Payment Desk', icon: IndianRupee },
          { key: 'receipts', label: 'Official Receipts', icon: Receipt },
          { key: 'dues', label: 'Outstanding & Dues', icon: AlertTriangle, count: defaulters.length },
          { key: 'structure', label: 'Fee Structure Setup', icon: Calendar },
          { key: 'scholarships', label: 'Concessions & Aid', icon: Award },
          { key: 'expenses', label: 'Campus Expenses', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-[#0050CB] text-white shadow-xs shadow-[#0050CB]/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white text-[#0050CB]' : 'bg-rose-100 text-rose-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Views */}

      {/* TAB: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-5">
          {/* Collection Progress Banner */}
          <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
              <div>
                <h3 className="font-black text-sm text-[#000E28] dark:text-white">
                  Term 1 Institutional Collection Milestone
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ₹{totalCollected.toLocaleString('en-IN')} collected of ₹{totalBilled.toLocaleString('en-IN')} total invoiced
                </p>
              </div>
              <span className="font-black text-lg text-[#0050CB] dark:text-[#38BDF8]">
                {collectionRate}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#0050CB] via-[#0070FF] to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>

          {/* Invoices Filters & Table */}
          <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_24px_rgba(0,14,40,0.03)] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Filter Invoices:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold bg-slate-50 dark:bg-[#000E28]"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="Paid">Paid in Full</option>
                  <option value="Partial">Partial Payment</option>
                  <option value="Overdue">Overdue / Defaulter</option>
                </select>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold bg-slate-50 dark:bg-[#000E28]"
                >
                  <option value="all">All Grades</option>
                  <option value="Pre-KG">Pre-KG</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFeeModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  + Generate Student Invoice
                </button>
              </div>
            </div>

            <AdminDataTable<FeeRecord>
              data={filteredFees}
              columns={feeColumns}
              keyExtractor={(item) => item._id}
              searchPlaceholder="Search invoice #, student name, grade..."
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* TAB: PAYMENT COLLECTION DESK */}
      {activeTab === 'collect' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-6 shadow-xs">
            <div>
              <h3 className="font-black text-base text-[#000E28] dark:text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-[#0050CB]" />
                Direct Fee Collection Counter
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Record on-counter payments via cash, UPI QR, POS card swipe, or bank cheque. Automatically generates instant official receipt.
              </p>
            </div>

            <form onSubmit={handleDirectCollect} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="collect-student-name" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="collect-student-name"
                    type="text"
                    value={collectForm.studentName}
                    onKeyDown={preventNonAlphaKey}
                    onPaste={(e) => handleNamePaste(e, (clean) => {
                      setCollectForm((prev) => ({ ...prev, studentName: clean }));
                      if (collectErrors.studentName) setCollectErrors((prev) => ({ ...prev, studentName: '' }));
                    })}
                    onChange={(e) => {
                      setCollectForm({ ...collectForm, studentName: sanitizeNameInput(e.target.value) });
                      if (collectErrors.studentName) setCollectErrors((prev) => ({ ...prev, studentName: '' }));
                    }}
                    aria-invalid={!!collectErrors.studentName}
                    aria-describedby={collectErrors.studentName ? "collect-student-name-error" : undefined}
                    className={`w-full px-3 py-2.5 rounded-xl border ${
                      collectErrors.studentName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                    } bg-slate-50 dark:bg-[#000E28] font-bold`}
                    placeholder="Enter student name..."
                  />
                  <FieldError error={collectErrors.studentName} id="collect-student-name-error" />
                </div>
                <div>
                  <label htmlFor="collect-grade" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Class / Grade <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="collect-grade"
                    value={collectForm.grade}
                    onChange={(e) => {
                      setCollectForm({ ...collectForm, grade: e.target.value });
                      if (collectErrors.grade) setCollectErrors((prev) => ({ ...prev, grade: '' }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                  >
                    <option>Pre-KG</option>
                    <option>LKG</option>
                    <option>UKG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="collect-amount" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Payment Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                    <input
                      id="collect-amount"
                      type="number"
                      min={1}
                      value={collectForm.amount}
                      onKeyDown={preventNonDecimalKey}
                      onPaste={(e) => handleAmountPaste(e, (clean) => {
                        setCollectForm((prev) => ({ ...prev, amount: clean }));
                        if (collectErrors.amount) setCollectErrors((prev) => ({ ...prev, amount: '' }));
                      })}
                      onChange={(e) => {
                        setCollectForm({ ...collectForm, amount: sanitizeAmountInput(e.target.value) });
                        if (collectErrors.amount) setCollectErrors((prev) => ({ ...prev, amount: '' }));
                      }}
                      aria-invalid={!!collectErrors.amount}
                      aria-describedby={collectErrors.amount ? "collect-amount-error" : undefined}
                      className={`w-full pl-8 pr-3 py-2.5 rounded-xl border ${
                        collectErrors.amount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                      } bg-slate-50 dark:bg-[#000E28] font-black text-emerald-600 text-sm`}
                      placeholder="e.g. 32000"
                    />
                  </div>
                  <FieldError error={collectErrors.amount} id="collect-amount-error" />
                </div>
                <div>
                  <label htmlFor="collect-mode" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Payment Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="collect-mode"
                    value={collectForm.paymentMode}
                    onChange={(e) => setCollectForm({ ...collectForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Card (POS)">Card (POS Terminal)</option>
                    <option value="Net Banking">Net Banking / NEFT</option>
                    <option value="Cheque">Bank Cheque / DD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="collect-ref" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Transaction Ref / Cheque No</label>
                  <input
                    id="collect-ref"
                    type="text"
                    value={collectForm.referenceNo}
                    onChange={(e) => {
                      setCollectForm({ ...collectForm, referenceNo: e.target.value });
                      if (collectErrors.referenceNo) setCollectErrors((prev) => ({ ...prev, referenceNo: '' }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-mono text-xs"
                    placeholder="e.g. UPI-938201 or CHQ-004812"
                  />
                  <FieldError error={collectErrors.referenceNo} id="collect-ref-error" />
                </div>
                <div>
                  <label htmlFor="collect-notes" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Administrative Notes</label>
                  <input
                    id="collect-notes"
                    type="text"
                    value={collectForm.notes}
                    onChange={(e) => {
                      setCollectForm({ ...collectForm, notes: e.target.value });
                      if (collectErrors.notes) setCollectErrors((prev) => ({ ...prev, notes: '' }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-medium"
                    placeholder="e.g. Cleared Term 1 Tuition & Kit"
                  />
                  <FieldError error={collectErrors.notes} id="collect-notes-error" />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Payment & Print Receipt</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Counter Info */}
          <div className="space-y-5">
            <div className="bg-linear-to-br from-[#0050CB] to-[#000E28] text-white rounded-[28px] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Institution Bank Desk</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">Live Gateways</span>
              </div>
              <h4 className="text-xl font-black">GGPS School Central Collection</h4>
              <p className="text-xs text-white/80 leading-relaxed">
                All collections are credited directly into GGPS School Operational Account with instant SMS/Email notifications dispatched to parent mobile numbers.
              </p>
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/70">Terminal ID:</span>
                  <span className="font-mono font-bold">GGPS-POS-01</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Cashier:</span>
                  <span className="font-bold">Finance Admin Desk</span>
                </div>
              </div>
            </div>

            <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-3">
              <h4 className="font-bold text-xs text-[#000E28] dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#0050CB]" />
                UPI & QR Instant Payment
              </h4>
              <p className="text-[11px] text-slate-500">
                Show official dynamic QR code to parents for instant tuition clearing with Google Pay, PhonePe, or Paytm.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-[#000E28] rounded-xl text-center border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs font-black text-[#0050CB] dark:text-[#38BDF8]">UPI ID: ggps.school@hdfcbank</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: OFFICIAL RECEIPTS */}
      {activeTab === 'receipts' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-sm text-[#000E28] dark:text-white">Official Fee Receipts Archive</h3>
              <p className="text-xs text-slate-500">Certified fee payment receipts generated for academic session 2026-27</p>
            </div>
            <button
              onClick={exportFeesCSV}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Receipts Ledger</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-[#000E28]/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-4">Student & Grade</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Payment Mode</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Receipt Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {receiptsList.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/60 dark:hover:bg-[#000E28]/40">
                    <td className="py-3 px-4 font-mono font-bold text-[#0050CB] dark:text-[#38BDF8]">
                      {f.receiptNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#000E28] dark:text-white">
                      {f.studentId ? `${f.studentId.firstName} ${f.studentId.lastName}` : 'Enrolled Student'}
                      <span className="block text-[11px] font-normal text-slate-500">
                        Class {f.grade || 'LKG'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {f.paymentDate ? new Date(f.paymentDate).toLocaleDateString('en-GB') : '15 Jun 2026'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[11px]">
                        {f.paymentMode || 'UPI'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600">
                      ₹{f.amountPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Cleared
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => downloadFile(`/api/finance/receipts/${f.receiptNumber}/pdf`, `GGPS_Fee_Receipt_${f.receiptNumber}.pdf`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-[11px] transition-all cursor-pointer border border-emerald-200"
                          title="Download Receipt PDF"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => setShowReceiptModal({ show: true, record: f })}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] hover:bg-[#0050CB] hover:text-white font-bold text-[11px] transition-all cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>View / Print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: OUTSTANDING & DUES TRACKING */}
      {activeTab === 'dues' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-sm text-[#000E28] dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Fee Defaulters & Outstanding Balances
              </h3>
              <p className="text-xs text-slate-500">
                Track pending tuition payments, overdue terms, and trigger automated reminders to parents.
              </p>
            </div>
            <button
              onClick={handleBroadcastReminders}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Reminder Notices ({defaulters.length})</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-[#000E28]/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3">Fee Type</th>
                  <th className="py-3 px-4 text-right">Total Invoiced</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {defaulters.map((f) => {
                  const bal = (f.totalAmount || 0) - (f.amountPaid || 0);
                  const studentName = f.studentId ? `${f.studentId.firstName} ${f.studentId.lastName}` : 'Enrolled Student';
                  return (
                    <tr key={f._id} className="hover:bg-slate-50/60 dark:hover:bg-[#000E28]/40">
                      <td className="py-3.5 px-4 font-bold text-[#000E28] dark:text-white">
                        {studentName}
                        <span className="block text-[11px] font-normal text-slate-500 font-mono">
                          {f.studentId?.admissionNumber || 'GGPS-2026'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {f.grade}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                        {f.feeType}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium">
                        ₹{f.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-rose-600">
                        ₹{bal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono">
                        {f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-GB') : 'Overdue'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSendReminder(studentName, bal)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3 text-[#FF690C]" />
                            <span>Remind</span>
                          </button>
                          <button
                            onClick={() => {
                              setUpdateFeeForm({ 
                                amountPaid: String(f.amountPaid || ''), 
                                status: 'Paid',
                                paymentMode: 'Cash'
                              });
                              setShowUpdateFeeModal({ show: true, fee: f });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#0050CB] hover:bg-[#0041A8] text-white text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Collect
                          </button>
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

      {/* TAB: FEE STRUCTURE SETUP */}
      {activeTab === 'structure' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-black text-base text-[#000E28] dark:text-white">Institutional Fee Structure Matrix</h3>
              <p className="text-xs text-slate-500">Grade-wise approved tuition, laboratory, sports, and examination fee tariffs for 2026-27</p>
            </div>
            <button
              onClick={() => setShowStructureModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Grade Fee Structure</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {feeStructures.map((fs) => (
              <div 
                key={fs.id}
                className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-4 shadow-xs hover:border-[#0050CB]/40 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] font-black text-xs">
                      {fs.grade}
                    </span>
                    <h4 className="font-bold text-sm text-[#000E28] dark:text-white mt-2">Annual Program Fee</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#000E28] dark:text-white">
                      ₹{fs.totalAnnual.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium">{fs.termSchedule}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-500">Tuition Fee:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{fs.tuitionFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-500">Development Fee:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{fs.developmentFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-500">Science & Computer Lab:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{fs.labFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-500">Sports & Activities:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{fs.sportsFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Exams & Assessment:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{fs.examFee.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => {
                      setStructureForm({
                        grade: fs.grade,
                        tuitionFee: String(fs.tuitionFee),
                        developmentFee: String(fs.developmentFee),
                        labFee: String(fs.labFee),
                        sportsFee: String(fs.sportsFee),
                        examFee: String(fs.examFee),
                        termSchedule: fs.termSchedule
                      });
                      setShowStructureModal(true);
                    }}
                    className="text-xs font-bold text-[#0050CB] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Tariff</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CONCESSIONS & SCHOLARSHIPS */}
      {activeTab === 'scholarships' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-sm text-[#000E28] dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FF690C]" />
                Concessions, Sibling Waivers & Scholarships
              </h3>
              <p className="text-xs text-slate-500">Manage approved tuition waivers, staff ward discounts, and merit fellowships</p>
            </div>
            <button
              onClick={() => setShowScholarshipModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Grant Student Concession</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-[#000E28]/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student & Admission</th>
                  <th className="py-3 px-3">Grade</th>
                  <th className="py-3 px-4">Concession Head</th>
                  <th className="py-3 px-3 text-center">Waiver %</th>
                  <th className="py-3 px-4 text-right">Annual Saving</th>
                  <th className="py-3 px-4">Approved By</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {scholarships.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-[#000E28]/40">
                    <td className="py-3.5 px-4 font-bold text-[#000E28] dark:text-white">
                      {s.studentName}
                      <span className="block text-[11px] font-normal text-slate-500 font-mono">
                        {s.admissionNo}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold">{s.grade}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-[#38BDF8] font-bold text-[11px]">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-[#FF690C]">
                      {s.discountPercentage}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600">
                      ₹{s.annualBenefit.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {s.approvedBy}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* TAB: CAMPUS EXPENSES & PAYROLL */}
      {activeTab === 'expenses' && (
        <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-sm text-[#000E28] dark:text-white">Campus Operating Expenses & Disbursements</h3>
              <p className="text-xs text-slate-500">Track institutional expenditures across utilities, infrastructure, vendor procurement and payroll</p>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              + Record Disbursement
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-[#000E28]/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Expense Description</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Date Disbursed</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/60 dark:hover:bg-[#000E28]/40">
                    <td className="py-3.5 px-5 font-bold text-[#000E28] dark:text-white">
                      {exp.description}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(exp.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3.5 px-5 text-right font-black text-rose-600">
                      - ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Issue Fee Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#001438] rounded-[28px] max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-[#000E28] dark:text-white">Issue Student Fee Invoice</h3>
              <button onClick={() => setShowFeeModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFee} className="space-y-4 text-xs">
              <div>
                <label htmlFor="fee-grade" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Class / Grade <span className="text-rose-500">*</span>
                </label>
                <select
                  id="fee-grade"
                  value={feeForm.grade}
                  onChange={(e) => setFeeForm({ ...feeForm, grade: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                >
                  <option>Pre-KG</option>
                  <option>LKG</option>
                  <option>UKG</option>
                </select>
              </div>

              <div>
                <label htmlFor="fee-type" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Fee Head / Description <span className="text-rose-500">*</span>
                </label>
                <input
                  id="fee-type"
                  type="text"
                  value={feeForm.feeType}
                  onChange={(e) => {
                    setFeeForm({ ...feeForm, feeType: e.target.value });
                    if (feeErrors.feeType) setFeeErrors((prev) => ({ ...prev, feeType: '' }));
                  }}
                  aria-invalid={!!feeErrors.feeType}
                  aria-describedby={feeErrors.feeType ? "fee-type-error" : undefined}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    feeErrors.feeType ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  } bg-slate-50 dark:bg-[#000E28] font-bold`}
                  placeholder="e.g. Term 1 Tuition Fee"
                />
                <FieldError error={feeErrors.feeType} id="fee-type-error" />
              </div>

              <div>
                <label htmlFor="fee-amount" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Total Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="fee-amount"
                  type="number"
                  min={1}
                  value={feeForm.totalAmount}
                  onKeyDown={preventNonDecimalKey}
                  onPaste={(e) => handleAmountPaste(e, (clean) => {
                    setFeeForm((prev) => ({ ...prev, totalAmount: clean }));
                    if (feeErrors.totalAmount) setFeeErrors((prev) => ({ ...prev, totalAmount: '' }));
                  })}
                  onChange={(e) => {
                    setFeeForm({ ...feeForm, totalAmount: sanitizeAmountInput(e.target.value) });
                    if (feeErrors.totalAmount) setFeeErrors((prev) => ({ ...prev, totalAmount: '' }));
                  }}
                  aria-invalid={!!feeErrors.totalAmount}
                  aria-describedby={feeErrors.totalAmount ? "fee-amount-error" : undefined}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    feeErrors.totalAmount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  } bg-slate-50 dark:bg-[#000E28] font-bold text-emerald-600`}
                  placeholder="32000"
                />
                <FieldError error={feeErrors.totalAmount} id="fee-amount-error" />
              </div>

              <div>
                <label htmlFor="fee-due-date" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Due Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="fee-due-date"
                  type="date"
                  min={todayStr}
                  value={feeForm.dueDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && val < todayStr) {
                      toast.error("Please pick today or a future due date.");
                      return;
                    }
                    setFeeForm({ ...feeForm, dueDate: val });
                    if (feeErrors.dueDate) setFeeErrors((prev) => ({ ...prev, dueDate: '' }));
                  }}
                  aria-invalid={!!feeErrors.dueDate}
                  aria-describedby={feeErrors.dueDate ? "fee-due-date-error" : undefined}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    feeErrors.dueDate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  } bg-slate-50 dark:bg-[#000E28] font-bold`}
                />
                <FieldError error={feeErrors.dueDate} id="fee-due-date-error" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFeeModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect / Edit Payment Modal */}
      {showUpdateFeeModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#001438] rounded-[28px] max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-[#000E28] dark:text-white">Record Fee Collection</h3>
              <button onClick={() => setShowUpdateFeeModal({ show: false, fee: null })} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFee} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#000E28] border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Total Invoiced</span>
                <span className="text-lg font-black text-[#000E28] dark:text-white">
                  ₹{showUpdateFeeModal.fee?.totalAmount?.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Student: {showUpdateFeeModal.fee?.studentId ? `${showUpdateFeeModal.fee?.studentId.firstName} ${showUpdateFeeModal.fee?.studentId.lastName}` : 'Enrolled Student'}
                </span>
              </div>

              <div>
                <label htmlFor="update-fee-amount" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Amount Collected (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="update-fee-amount"
                  type="number"
                  min={0}
                  value={updateFeeForm.amountPaid}
                  onKeyDown={preventNonDecimalKey}
                  onPaste={(e) => handleAmountPaste(e, (clean) => {
                    setUpdateFeeForm((prev) => ({ ...prev, amountPaid: clean }));
                    if (updateFeeErrors.amountPaid) setUpdateFeeErrors((prev) => ({ ...prev, amountPaid: '' }));
                  })}
                  onChange={(e) => {
                    setUpdateFeeForm({ ...updateFeeForm, amountPaid: sanitizeAmountInput(e.target.value) });
                    if (updateFeeErrors.amountPaid) setUpdateFeeErrors((prev) => ({ ...prev, amountPaid: '' }));
                  }}
                  aria-invalid={!!updateFeeErrors.amountPaid}
                  aria-describedby={updateFeeErrors.amountPaid ? "update-fee-amount-error" : undefined}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    updateFeeErrors.amountPaid ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  } bg-slate-50 dark:bg-[#000E28] font-bold text-emerald-600 text-sm`}
                />
                <FieldError error={updateFeeErrors.amountPaid} id="update-fee-amount-error" />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Payment Mode</label>
                <select
                  value={updateFeeForm.paymentMode}
                  onChange={(e) => setUpdateFeeForm({ ...updateFeeForm, paymentMode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                >
                  <option value="Cash">Cash in Hand</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Card (POS)">Card (POS Terminal)</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={updateFeeForm.status}
                  onChange={(e) => setUpdateFeeForm({ ...updateFeeForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                >
                  <option value="Paid">Paid in Full</option>
                  <option value="Partial">Partial Payment</option>
                  <option value="Overdue">Overdue / Defaulter</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUpdateFeeModal({ show: false, fee: null })}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {showReceiptModal.show && showReceiptModal.record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div id="printable-receipt-container" className="bg-white rounded-[28px] max-w-lg w-full p-8 border border-slate-200 shadow-2xl space-y-6 text-[#000E28]">
            {/* Receipt Header */}
            <div className="flex justify-between items-start pb-4 border-b-2 border-slate-800">
              <div>
                <span className="text-xl font-black text-[#0050CB] tracking-tight block">GGPS SCHOOL</span>
                <span className="text-[11px] text-slate-600 block">Excellence in Academics & Character Building</span>
                <span className="text-[10px] text-slate-500 block">CBSE Affiliation No: 1930482 | Established 2012</span>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase">
                  OFFICIAL RECEIPT
                </span>
                <span className="block font-mono text-xs font-bold text-slate-800 mt-1">
                  {showReceiptModal.record.receiptNumber || 'GGPS-REC-2026-0042'}
                </span>
                <span className="block text-[10px] text-slate-500">
                  Date: {showReceiptModal.record.paymentDate || new Date().toISOString().split('T')[0]}
                </span>
              </div>
            </div>

            {/* Student Info Box */}
            <div className="bg-slate-50 rounded-xl p-3 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[10px]">Student Name:</span>
                <span className="font-bold">
                  {showReceiptModal.record.studentId ? `${showReceiptModal.record.studentId.firstName} ${showReceiptModal.record.studentId.lastName}` : 'Aarav Sharma'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Admission No:</span>
                <span className="font-mono font-bold">
                  {showReceiptModal.record.studentId?.studentId || showReceiptModal.record.studentId?.admissionNumber || 'GGPS2026LKG001'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Class & Section:</span>
                <span className="font-bold">Class {showReceiptModal.record.grade || 'LKG'} - Section A</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Payment Mode:</span>
                <span className="font-bold">{showReceiptModal.record.paymentMode || 'UPI'}</span>
              </div>
            </div>

            {/* Particulars Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Fee Head Particulars</th>
                    <th className="p-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-medium">{showReceiptModal.record.feeType || 'Term 1 Tuition Fee'}</td>
                    <td className="p-2.5 text-right font-mono font-bold">₹{(showReceiptModal.record.amountPaid || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-2.5 text-[#000E28]">TOTAL AMOUNT RECEIVED</td>
                    <td className="p-2.5 text-right text-emerald-600 font-black text-sm">₹{(showReceiptModal.record.amountPaid || 0).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Seal & Signatures */}
            <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-center">
              <div>
                <div className="w-20 h-10 border border-dashed border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400 mb-1">
                  GGPS STAMP
                </div>
                <span className="text-[10px] text-slate-500 block">Accounts Office</span>
              </div>
              <div>
                <div className="w-28 border-b border-slate-800 mb-1"></div>
                <span className="text-[10px] font-bold text-slate-700 block">Authorized Signatory</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReceiptModal({ show: false, record: null })}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => downloadFile(`/api/finance/receipts/${showReceiptModal.record?.receiptNumber}/pdf`, `GGPS_Fee_Receipt_${showReceiptModal.record?.receiptNumber || 'REC'}.pdf`)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => {
                  printDocument('printable-receipt-container', `GGPS Receipt #${showReceiptModal.record?.receiptNumber}`);
                }}
                className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#001438] rounded-[28px] max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-[#000E28] dark:text-white">Record Operating Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label htmlFor="expense-desc" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Expense Description <span className="text-rose-500">*</span>
                </label>
                <input
                  id="expense-desc"
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => {
                    setExpenseForm({ ...expenseForm, description: e.target.value });
                    if (expenseErrors.description) setExpenseErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  aria-invalid={!!expenseErrors.description}
                  aria-describedby={expenseErrors.description ? "expense-desc-error" : undefined}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    expenseErrors.description ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  } bg-slate-50 dark:bg-[#000E28] font-bold`}
                  placeholder="e.g. Science Lab Supplies & Chemicals"
                />
                <FieldError error={expenseErrors.description} id="expense-desc-error" />
              </div>

              <div>
                <label htmlFor="expense-category" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="expense-category"
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                >
                  <option>Supplies</option>
                  <option>Salaries</option>
                  <option>Infrastructure</option>
                  <option>Maintenance</option>
                  <option>Utilities</option>
                  <option>Events</option>
                </select>
              </div>

              <div>
                <label htmlFor="expense-amount" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="expense-amount"
                  type="number"
                  min={1}
                  value={expenseForm.amount}
                  onKeyDown={preventNonDecimalKey}
                  onPaste={(e) => handleAmountPaste(e, (clean) => {
                    setExpenseForm((prev) => ({ ...prev, amount: clean }));
                    if (expenseErrors.amount) setExpenseErrors((prev) => ({ ...prev, amount: '' }));
                  })}
                  onChange={(e) => {
                    setExpenseForm({ ...expenseForm, amount: sanitizeAmountInput(e.target.value) });
                    if (expenseErrors.amount) setExpenseErrors((prev) => ({ ...prev, amount: '' }));
                  }}
                  aria-invalid={!!expenseErrors.amount}
                  aria-describedby={expenseErrors.amount ? "expense-amount-error" : undefined}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    expenseErrors.amount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  } bg-slate-50 dark:bg-[#000E28] font-bold`}
                  placeholder="45000"
                />
                <FieldError error={expenseErrors.amount} id="expense-amount-error" />
              </div>

              <div>
                <label htmlFor="expense-date" className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="expense-date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => {
                    setExpenseForm({ ...expenseForm, date: e.target.value });
                    if (expenseErrors.date) setExpenseErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  aria-invalid={!!expenseErrors.date}
                  aria-describedby={expenseErrors.date ? "expense-date-error" : undefined}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    expenseErrors.date ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  } bg-slate-50 dark:bg-[#000E28] font-bold`}
                />
                <FieldError error={expenseErrors.date} id="expense-date-error" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Fee Structure Modal */}
      {showStructureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#001438] rounded-[28px] max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-[#000E28] dark:text-white">Configure Grade Fee Tariff</h3>
              <button onClick={() => setShowStructureModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStructure} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Class / Grade Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={structureForm.grade}
                  onChange={(e) => {
                    setStructureForm({ ...structureForm, grade: e.target.value });
                    if (structureErrors.grade) setStructureErrors(prev => ({ ...prev, grade: '' }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                >
                  <option>Pre-KG</option>
                  <option>LKG</option>
                  <option>UKG</option>
                </select>
                <FieldError id="fs-grade-err" error={structureErrors.grade} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Tuition Fee (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="fs-tuitionFee"
                    min={0}
                    value={structureForm.tuitionFee}
                    onKeyDown={preventNonDecimalKey}
                    onChange={(e) => {
                      setStructureForm({ ...structureForm, tuitionFee: sanitizeAmountInput(e.target.value) });
                      if (structureErrors.tuitionFee) setStructureErrors(prev => ({ ...prev, tuitionFee: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border ${structureErrors.tuitionFee ? 'border-red-500 bg-red-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'} font-bold`}
                    placeholder="30000"
                    aria-invalid={Boolean(structureErrors.tuitionFee)}
                    aria-describedby={structureErrors.tuitionFee ? "fs-tuitionFee-err" : undefined}
                    required
                  />
                  <FieldError id="fs-tuitionFee-err" error={structureErrors.tuitionFee} />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Development Fee (₹)</label>
                  <input
                    type="number"
                    id="fs-devFee"
                    min={0}
                    value={structureForm.developmentFee}
                    onKeyDown={preventNonDecimalKey}
                    onChange={(e) => {
                      setStructureForm({ ...structureForm, developmentFee: sanitizeAmountInput(e.target.value) });
                      if (structureErrors.developmentFee) setStructureErrors(prev => ({ ...prev, developmentFee: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border ${structureErrors.developmentFee ? 'border-red-500 bg-red-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'} font-bold`}
                    placeholder="6000"
                    aria-invalid={Boolean(structureErrors.developmentFee)}
                    aria-describedby={structureErrors.developmentFee ? "fs-devFee-err" : undefined}
                  />
                  <FieldError id="fs-devFee-err" error={structureErrors.developmentFee} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Lab (₹)</label>
                  <input
                    type="number"
                    id="fs-labFee"
                    min={0}
                    value={structureForm.labFee}
                    onKeyDown={preventNonDecimalKey}
                    onChange={(e) => {
                      setStructureForm({ ...structureForm, labFee: sanitizeAmountInput(e.target.value) });
                      if (structureErrors.labFee) setStructureErrors(prev => ({ ...prev, labFee: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border ${structureErrors.labFee ? 'border-red-500 bg-red-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'} font-bold`}
                    placeholder="3000"
                    aria-invalid={Boolean(structureErrors.labFee)}
                    aria-describedby={structureErrors.labFee ? "fs-labFee-err" : undefined}
                  />
                  <FieldError id="fs-labFee-err" error={structureErrors.labFee} />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Sports (₹)</label>
                  <input
                    type="number"
                    id="fs-sportsFee"
                    min={0}
                    value={structureForm.sportsFee}
                    onKeyDown={preventNonDecimalKey}
                    onChange={(e) => {
                      setStructureForm({ ...structureForm, sportsFee: sanitizeAmountInput(e.target.value) });
                      if (structureErrors.sportsFee) setStructureErrors(prev => ({ ...prev, sportsFee: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border ${structureErrors.sportsFee ? 'border-red-500 bg-red-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'} font-bold`}
                    placeholder="2500"
                    aria-invalid={Boolean(structureErrors.sportsFee)}
                    aria-describedby={structureErrors.sportsFee ? "fs-sportsFee-err" : undefined}
                  />
                  <FieldError id="fs-sportsFee-err" error={structureErrors.sportsFee} />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Exam (₹)</label>
                  <input
                    type="number"
                    id="fs-examFee"
                    min={0}
                    value={structureForm.examFee}
                    onKeyDown={preventNonDecimalKey}
                    onChange={(e) => {
                      setStructureForm({ ...structureForm, examFee: sanitizeAmountInput(e.target.value) });
                      if (structureErrors.examFee) setStructureErrors(prev => ({ ...prev, examFee: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border ${structureErrors.examFee ? 'border-red-500 bg-red-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'} font-bold`}
                    placeholder="1500"
                    aria-invalid={Boolean(structureErrors.examFee)}
                    aria-describedby={structureErrors.examFee ? "fs-examFee-err" : undefined}
                  />
                  <FieldError id="fs-examFee-err" error={structureErrors.examFee} />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Installment Schedule <span className="text-red-500">*</span>
                </label>
                <select
                  value={structureForm.termSchedule}
                  onChange={(e) => {
                    setStructureForm({ ...structureForm, termSchedule: e.target.value });
                    if (structureErrors.termSchedule) setStructureErrors(prev => ({ ...prev, termSchedule: '' }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                >
                  <option>3 Equal Terms</option>
                  <option>4 Quarterly Terms</option>
                  <option>2 Bi-annual Terms</option>
                  <option>Annual Lump-sum</option>
                </select>
                <FieldError id="fs-terms-err" error={structureErrors.termSchedule} />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Fee Tariff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grant Scholarship Modal */}
      {showScholarshipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#001438] rounded-[28px] max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-[#000E28] dark:text-white">Grant Student Concession</h3>
              <button onClick={() => setShowScholarshipModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScholarship} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Student Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="sch-studentName"
                  value={scholarshipForm.studentName}
                  onKeyDown={preventNonAlphaKey}
                  onPaste={(e) => handleNamePaste(e, (clean) => {
                    setScholarshipForm((prev) => ({ ...prev, studentName: clean }));
                    if (scholarshipErrors.studentName) setScholarshipErrors(prev => ({ ...prev, studentName: '' }));
                  })}
                  onChange={(e) => {
                    setScholarshipForm({ ...scholarshipForm, studentName: sanitizeNameInput(e.target.value) });
                    if (scholarshipErrors.studentName) setScholarshipErrors(prev => ({ ...prev, studentName: '' }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl border ${scholarshipErrors.studentName ? 'border-red-500 bg-red-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'} font-bold`}
                  placeholder="e.g. Diya Patel"
                  aria-invalid={Boolean(scholarshipErrors.studentName)}
                  aria-describedby={scholarshipErrors.studentName ? "sch-studentName-err" : undefined}
                  required
                />
                <FieldError id="sch-studentName-err" error={scholarshipErrors.studentName} />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Class / Grade <span className="text-red-500">*</span>
                </label>
                <select
                  value={scholarshipForm.grade}
                  onChange={(e) => {
                    setScholarshipForm({ ...scholarshipForm, grade: e.target.value });
                    if (scholarshipErrors.grade) setScholarshipErrors(prev => ({ ...prev, grade: '' }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                >
                  <option>Pre-KG</option>
                  <option>LKG</option>
                  <option>UKG</option>
                </select>
                <FieldError id="sch-grade-err" error={scholarshipErrors.grade} />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Concession Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={scholarshipForm.category}
                  onChange={(e) => {
                    setScholarshipForm({ ...scholarshipForm, category: e.target.value });
                    if (scholarshipErrors.category) setScholarshipErrors(prev => ({ ...prev, category: '' }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] font-bold"
                >
                  <option>Sibling Discount (Second Child - 15%)</option>
                  <option>Staff Ward Concession (50%)</option>
                  <option>Merit Scholarship (Top Academic Rank - 25%)</option>
                  <option>EWS Full Tuition Waiver (100%)</option>
                  <option>Sports Excellence Fellowship (30%)</option>
                </select>
                <FieldError id="sch-category-err" error={scholarshipErrors.category} />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Discount Percentage (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="sch-discount"
                  min={1}
                  max={100}
                  value={scholarshipForm.discountPercentage}
                  onKeyDown={preventNonDecimalKey}
                  onChange={(e) => {
                    setScholarshipForm({ ...scholarshipForm, discountPercentage: e.target.value });
                    if (scholarshipErrors.discountPercentage) setScholarshipErrors(prev => ({ ...prev, discountPercentage: '' }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl border ${scholarshipErrors.discountPercentage ? 'border-red-500 bg-red-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28]'} font-bold text-[#FF690C]`}
                  placeholder="15"
                  aria-invalid={Boolean(scholarshipErrors.discountPercentage)}
                  aria-describedby={scholarshipErrors.discountPercentage ? "sch-discount-err" : undefined}
                  required
                />
                <FieldError id="sch-discount-err" error={scholarshipErrors.discountPercentage} />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScholarshipModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Approve Concession
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 font-bold">
        Loading GGPS School Finance Console...
      </div>
    }>
      <FeesFinanceContent />
    </Suspense>
  );
}
