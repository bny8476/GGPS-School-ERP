"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Users, 
  GraduationCap, 
  HeartPulse, 
  FileCheck,
  AlertCircle,
  Copy,
  CheckCircle2,
  PlusCircle,
  Eye,
  ListFilter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';
import {
  NAME_REGEX,
  EMAIL_REGEX,
  TEN_DIGIT_PHONE_REGEX,
  preventNonAlphaKey,
  preventNonNumericKey,
  sanitizeNameInput,
  sanitizePhoneInput,
  handleNamePaste,
  handlePhonePaste,
  validateDOB,
} from '@/lib/validationUtils';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = [
  { id: 1, label: 'Identity', icon: User, desc: 'Personal details' },
  { id: 2, label: 'Parent/Guardian', icon: Users, desc: 'Contact details' },
  { id: 3, label: 'Enrollment', icon: GraduationCap, desc: 'Class & section' },
  { id: 4, label: 'Health & Well-being', icon: HeartPulse, desc: 'Medical declaration' },
  { id: 5, label: 'Review', icon: FileCheck, desc: 'Verification' },
];

interface CreatedStudentResult {
  _id: string;
  studentId: string;
  admissionNumber: string;
  name: string;
  grade: string;
  section: string;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onSuccess,
}: AddStudentModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<CreatedStudentResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    parentName: '',
    parentEmail: '',
    emergencyContact: '',
    address: '',
    grade: 'LKG',
    section: 'A',
    rollNumber: '',
    academicYear: '2026-2027',
    medicalNotes: '',
    status: 'Active',
  });

  if (!isOpen) return null;

  // Normalized Class Code for Preview: PreKG -> PREKG, LKG -> LKG, UKG -> UKG
  const getNormalizedClassCode = (g: string) => {
    const upper = (g || 'LKG').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (upper === 'PREKG' || upper === 'PRE' || upper === 'PLAYGROUP' || upper === 'NURSERY') return 'PREKG';
    if (upper === 'LKG' || upper === 'LOWERKG') return 'LKG';
    if (upper === 'UKG' || upper === 'UPPERKG') return 'UKG';
    return upper || 'LKG';
  };

  const previewStudentId = `GGPS2026${getNormalizedClassCode(formData.grade)}001`;
  const previewAdmissionNo = `GGPS2026Admin001`;

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleNext = () => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      const fName = formData.firstName.trim();
      const lName = formData.lastName.trim();

      if (!fName) {
        stepErrors.firstName = 'First name is required';
      } else if (!NAME_REGEX.test(fName)) {
        stepErrors.firstName = 'First name can contain only letters, spaces, hyphens, apostrophes, and periods';
      } else if (fName.length < 1) {
        stepErrors.firstName = 'First name is required';
      }

      if (!lName) {
        stepErrors.lastName = 'Last name is required';
      } else if (!NAME_REGEX.test(lName)) {
        stepErrors.lastName = 'Last name can contain only letters, spaces, hyphens, apostrophes, and periods';
      }

      if (formData.dateOfBirth) {
        const dobCheck = validateDOB(formData.dateOfBirth);
        if (!dobCheck.valid) {
          stepErrors.dateOfBirth = dobCheck.error || 'Date of birth cannot be in the future';
        }
      }

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        toast.error(Object.values(stepErrors)[0]);
        return;
      }
    }

    if (currentStep === 2) {
      if (formData.parentName.trim() && !NAME_REGEX.test(formData.parentName.trim())) {
        stepErrors.parentName = 'Parent name can contain only letters, spaces, hyphens, apostrophes, and periods';
      }

      const phone = formData.emergencyContact.trim();
      if (!phone) {
        stepErrors.emergencyContact = 'Parent contact phone number is required';
      } else if (!TEN_DIGIT_PHONE_REGEX.test(phone)) {
        stepErrors.emergencyContact = 'Enter a valid 10-digit mobile number';
      }

      if (formData.parentEmail.trim() && !EMAIL_REGEX.test(formData.parentEmail.trim())) {
        stepErrors.parentEmail = 'Enter a valid email address';
      }

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        toast.error(Object.values(stepErrors)[0]);
        return;
      }
    }

    setErrors({});
    setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName}: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleResetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
      bloodGroup: 'O+',
      parentName: '',
      parentEmail: '',
      emergencyContact: '',
      address: '',
      grade: 'LKG',
      section: 'A',
      rollNumber: '',
      academicYear: '2026-2027',
      medicalNotes: '',
      status: 'Active',
    });
    setCreatedStudent(null);
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

      // Note: Student ID and Admission Number are NOT sent from the browser.
      // The backend generates them dynamically with strict server-side uniqueness guarantees.
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dob: formData.dateOfBirth || undefined,
        gender: formData.gender,
        grade: formData.grade,
        className: formData.grade,
        section: formData.section,
        sectionName: formData.section,
        bloodGroup: formData.bloodGroup,
        medicalNotes: formData.medicalNotes,
        emergencyContact: formData.emergencyContact,
        parentName: formData.parentName,
        parentEmail: formData.parentEmail,
        address: formData.address,
        status: formData.status,
      };

      const res = await authFetch(`${apiBase}/api/v1/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        const studentId = data.studentId || data.student?.studentId || previewStudentId;
        const admissionNumber = data.admissionNumber || data.student?.admissionNumber || previewAdmissionNo;
        const studentRecord = data.student || data;

        setCreatedStudent({
          _id: studentRecord._id || '',
          studentId,
          admissionNumber,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          grade: formData.grade,
          section: formData.section,
        });

        toast.success(`Student Added Successfully: ${studentId}`);
        onSuccess();
      } else {
        toast.error(data.message || 'Failed to enroll student.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Network error enrolling student: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07152F]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#07152F] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#0B1F3A]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0050CB] text-white flex items-center justify-center shadow-md shadow-[#0050CB]/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#000E28] dark:text-white">
                Add New Student
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official institutional enrollment wizard • GGPS ERP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================
            SUCCESS SCREEN (Shown immediately upon successful creation)
            Requirement 9:
            Student Added Successfully
            Student ID: GGPS2026LKG001
            Admission Number: GGPS2026Admin001
            [View Student] [Add Another Student] [Go to Student Directory]
        ======================================================== */}
        {createdStudent ? (
          <div className="p-8 space-y-6 flex-1 overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-black text-[#000E28] dark:text-white">
                Student Added Successfully
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institutional record has been officially registered in the GGPS student database.
              </p>
            </div>

            {/* Generated Identifiers Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student ID Card */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#0050CB]/15 border border-[#0050CB]/20 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Student ID
                  </span>
                  <span className="text-xl font-black font-mono text-[#0050CB] dark:text-[#38BDF8] tracking-wider block mt-1">
                    {createdStudent.studentId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(createdStudent.studentId, 'Student ID')}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline cursor-pointer"
                >
                  {copiedField === 'Student ID' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Admission Number Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1F3A]/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Admission Number
                  </span>
                  <span className="text-xl font-black font-mono text-[#000E28] dark:text-white tracking-wider block mt-1">
                    {createdStudent.admissionNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(createdStudent.admissionNumber, 'Admission Number')}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
                >
                  {copiedField === 'Admission Number' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Profile Brief */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1F3A]/40 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Student Name</span>
                <span className="font-bold text-[#000E28] dark:text-white text-sm">
                  {createdStudent.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Enrolled Class</span>
                <span className="font-bold text-[#0050CB] dark:text-[#38BDF8] text-sm">
                  {createdStudent.grade} - Section {createdStudent.section}
                </span>
              </div>
            </div>

            {/* Action Buttons: Requirement 9 */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (createdStudent._id) {
                    router.push(`/dashboard/students/${createdStudent._id}`);
                  } else {
                    router.push('/dashboard/students');
                  }
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold shadow-md shadow-[#0050CB]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Student</span>
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-[#0050CB]/30 bg-blue-50/50 dark:bg-blue-950/20 text-[#0050CB] dark:text-[#38BDF8] hover:bg-blue-100/50 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Another Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/dashboard/students');
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F3A] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ListFilter className="w-4 h-4" />
                <span>Go to Student Directory</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Progress Tracker */}
            <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-[#0B1F3A]/70 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div className="flex items-center justify-between">
                {STEPS.map((s, idx) => {
                  const isDone = currentStep > s.id;
                  const isActive = currentStep === s.id;

                  return (
                    <React.Fragment key={s.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : isActive
                              ? 'bg-[#0050CB] text-white shadow-md shadow-[#0050CB]/30'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : s.id}
                        </div>
                        <span
                          className={`text-xs font-bold hidden sm:inline ${
                            isActive
                              ? 'text-[#0050CB] dark:text-[#E5EEFF]'
                              : isDone
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                            currentStep > s.id
                              ? 'bg-emerald-500'
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Wizard Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
              <AnimatePresence mode="wait">
                {/* ========================================================
                    STEP 1: PERSONAL & IDENTITY (Starts directly with First Name)
                    Requirement 2 & 7 & 15: No preview banner above the form!
                ======================================================== */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          First Name <span className="text-[#FF690C]">*</span>
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          required
                          placeholder="e.g. Aarav"
                          value={formData.firstName}
                          onKeyDown={preventNonAlphaKey}
                          onChange={(e) => handleChange('firstName', sanitizeNameInput(e.target.value))}
                          onPaste={(e) => handleNamePaste(e, (v) => handleChange('firstName', v))}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none transition-all ${
                            errors.firstName
                              ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/15'
                              : 'border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/30'
                          }`}
                        />
                        {errors.firstName && (
                          <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Last Name <span className="text-[#FF690C]">*</span>
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          required
                          placeholder="e.g. Sharma"
                          value={formData.lastName}
                          onKeyDown={preventNonAlphaKey}
                          onChange={(e) => handleChange('lastName', sanitizeNameInput(e.target.value))}
                          onPaste={(e) => handleNamePaste(e, (v) => handleChange('lastName', v))}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none transition-all ${
                            errors.lastName
                              ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/15'
                              : 'border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/30'
                          }`}
                        />
                        {errors.lastName && (
                          <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.lastName}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="dateOfBirth" className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Date of Birth
                        </label>
                        <input
                          id="dateOfBirth"
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          value={formData.dateOfBirth}
                          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none transition-all ${
                            errors.dateOfBirth
                              ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/15'
                              : 'border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/30'
                          }`}
                        />
                        {errors.dateOfBirth && (
                          <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.dateOfBirth}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Gender *
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) => handleChange('gender', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/30"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Blood Group
                        </label>
                        <select
                          value={formData.bloodGroup}
                          onChange={(e) => handleChange('bloodGroup', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/30"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => handleChange('status', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/30"
                        >
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Parent/Guardian Details */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label htmlFor="parentName" className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Primary Parent / Guardian Full Name
                        </label>
                        <input
                          id="parentName"
                          type="text"
                          placeholder="e.g. Vikram Sharma"
                          value={formData.parentName}
                          onKeyDown={preventNonAlphaKey}
                          onChange={(e) => handleChange('parentName', sanitizeNameInput(e.target.value))}
                          onPaste={(e) => handleNamePaste(e, (v) => handleChange('parentName', v))}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none transition-all ${
                            errors.parentName
                              ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/15'
                              : 'border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/30'
                          }`}
                        />
                        {errors.parentName && (
                          <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.parentName}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="emergencyContact" className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Contact Phone <span className="text-[#FF690C]">*</span>
                        </label>
                        <input
                          id="emergencyContact"
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="9876543210"
                          value={formData.emergencyContact}
                          onKeyDown={preventNonNumericKey}
                          onChange={(e) => handleChange('emergencyContact', sanitizePhoneInput(e.target.value))}
                          onPaste={(e) => handlePhonePaste(e, (v) => handleChange('emergencyContact', v))}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none transition-all ${
                            errors.emergencyContact
                              ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/15'
                              : 'border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/30'
                          }`}
                        />
                        {errors.emergencyContact && (
                          <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.emergencyContact}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="parentEmail" className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Email Address
                        </label>
                        <input
                          id="parentEmail"
                          type="email"
                          placeholder="vikram.sharma@example.com"
                          value={formData.parentEmail}
                          onChange={(e) => handleChange('parentEmail', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none transition-all ${
                            errors.parentEmail
                              ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/15'
                              : 'border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/30'
                          }`}
                        />
                        {errors.parentEmail && (
                          <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.parentEmail}</p>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Residential Address
                        </label>
                        <input
                          type="text"
                          placeholder="123 Meadow Lane, Green Park, City"
                          value={formData.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/30"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Class & Enrollment */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Class / Grade *
                        </label>
                        <select
                          value={formData.grade}
                          onChange={(e) => handleChange('grade', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/30"
                        >
                          {['PreKG', 'LKG', 'UKG'].map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Section
                        </label>
                        <select
                          value={formData.section}
                          onChange={(e) => handleChange('section', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/30"
                        >
                          {['A', 'B', 'C', 'D'].map((sec) => (
                            <option key={sec} value={sec}>
                              Section {sec}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Roll Number (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 001"
                          value={formData.rollNumber}
                          onChange={(e) => handleChange('rollNumber', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                          Academic Year
                        </label>
                        <input
                          type="text"
                          disabled
                          value={formData.academicYear}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Health & Logistics */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-[#000E28] dark:text-slate-300 mb-1.5">
                        Medical Notes / Allergies
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. No known allergies, mild asthma inhaler in bag"
                        value={formData.medicalNotes}
                        onChange={(e) => handleChange('medicalNotes', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/30 resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* ========================================================
                    STEP 5: REVIEW & CONFIRM
                    Requirement 8: Shows generated Student ID preview (GGPS2026LKG001)
                ======================================================== */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1F3A]/70 border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Enrollment Summary
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block">Student Name:</span>
                          <span className="font-bold text-[#000E28] dark:text-white">
                            {formData.firstName} {formData.lastName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Student ID:</span>
                          <span className="font-bold text-[#0050CB] dark:text-[#38BDF8] font-mono tracking-wider">
                            {previewStudentId}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Class & Section:</span>
                          <span className="font-bold text-[#000E28] dark:text-white">
                            {formData.grade} • Section {formData.section}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Admission Number:</span>
                          <span className="font-bold text-[#000E28] dark:text-white font-mono">
                            {previewAdmissionNo}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Date of Birth:</span>
                          <span className="font-bold text-[#000E28] dark:text-white">
                            {formData.dateOfBirth || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Parent Phone:</span>
                          <span className="font-bold text-[#000E28] dark:text-white">
                            {formData.emergencyContact || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#0B1F3A]/40 shrink-0">
              <button
                type="button"
                onClick={currentStep === 1 ? onClose : handleBack}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>

              <div className="flex items-center gap-2">
                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold shadow-md shadow-[#0050CB]/25 transition-all cursor-pointer"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold shadow-lg shadow-[#0050CB]/30 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSubmitting ? 'Enrolling...' : 'Confirm & Enroll'}</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
