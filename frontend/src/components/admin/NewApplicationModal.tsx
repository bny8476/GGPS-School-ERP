"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  X, 
  User, 
  Users, 
  GraduationCap, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/apiClient";
import {
  NAME_REGEX,
  EMAIL_REGEX,
  PHONE_REGEX,
  TEN_DIGIT_PHONE_REGEX,
  preventNonAlphaKey,
  sanitizeNameInput,
  sanitizePhoneInput,
  handleNamePaste,
  handlePhonePaste,
  validateDOB,
} from "@/lib/validationUtils";

const newApplicationSchema = z.object({
  // Child Information
  childFirstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters")
    .regex(NAME_REGEX, "First name can contain only letters, spaces, hyphens, apostrophes, and periods (no numbers)"),
  childMiddleName: z.string().trim().optional(),
  childLastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(NAME_REGEX, "Last name can contain only letters, spaces, hyphens, apostrophes, and periods (no numbers)"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => validateDOB(val).valid, {
      message: "Child must be at least 3 years old for school enrollment",
    }),
  gender: z.enum(["Male", "Female", "Other"]),
  classApplied: z.string().min(1, "Class applied for is required"),
  academicYear: z.string(),

  // Parent Information
  parentName: z
    .string()
    .trim()
    .min(2, "Primary parent name must be at least 2 characters")
    .max(80, "Name cannot exceed 80 characters")
    .regex(NAME_REGEX, "Name can contain only letters, spaces, hyphens, apostrophes, and periods (no numbers)"),
  fatherName: z.string().trim().optional(),
  motherName: z.string().trim().optional(),
  guardianName: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(PHONE_REGEX, "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9"),
  email: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || EMAIL_REGEX.test(val), {
      message: "Enter a valid email address",
    }),
  address: z.string().trim().max(300).optional(),

  // Academic Information
  previousSchool: z.string().trim().optional(),
  previousClass: z.string().trim().optional(),
  previousAcademicYear: z.string().trim().optional(),
  tcAvailable: z.boolean(),

  // Additional Information
  medicalNotes: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  source: z.string().optional(),
  referral: z.string().trim().optional(),
});

type NewApplicationFormData = z.infer<typeof newApplicationSchema>;

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: any) => void;
}

const CLASS_OPTIONS = [
  "Pre-KG",
  "LKG",
  "UKG",
];

const REQUIRED_DOCS = [
  "Birth Certificate",
  "Child's Passport-Size Photographs",
  "Proof of Residential Address",
  "Parent / Guardian Identification & Contact Details",
];

export default function NewApplicationModal({
  isOpen,
  onClose,
  onSuccess,
}: NewApplicationModalProps) {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, boolean>>({
    "Birth Certificate": true,
    "Child's Passport-Size Photographs": true,
    "Proof of Residential Address": true,
    "Parent / Guardian Identification & Contact Details": true,
  });
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; size: string; file?: File }>>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<NewApplicationFormData>({
    resolver: zodResolver(newApplicationSchema),
    defaultValues: {
      childFirstName: "",
      childMiddleName: "",
      childLastName: "",
      dateOfBirth: "",
      gender: "Male",
      classApplied: "LKG",
      academicYear: "2026–2027",
      parentName: "",
      fatherName: "",
      motherName: "",
      guardianName: "",
      phone: "",
      email: "",
      address: "",
      previousSchool: "",
      previousClass: "",
      previousAcademicYear: "2025-2026",
      tcAvailable: false,
      medicalNotes: "",
      notes: "",
      source: "Direct",
      referral: "",
    },
  });

  const childFirstName = watch("childFirstName");
  const childLastName = watch("childLastName");
  const parentName = watch("parentName");
  const phone = watch("phone");
  const dateOfBirth = watch("dateOfBirth");

  const maxDobDate = React.useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 3);
    return d.toISOString().split("T")[0];
  }, []);

  const ageInfo = React.useMemo(() => {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return null;
    const now = new Date();
    const diffMs = now.getTime() - dob.getTime();
    if (diffMs < 0) return { text: "Future date", isEligible: false };
    const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
    const months = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.4375));
    return {
      text: `${years}y ${months}m`,
      isEligible: years >= 3,
    };
  }, [dateOfBirth]);

  const handleFileUpload = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size cannot exceed 10MB");
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setUploadedFiles((prev) => ({
      ...prev,
      [docName]: { name: file.name, size: sizeFormatted, file },
    }));
    setSelectedDocuments((prev) => ({
      ...prev,
      [docName]: true,
    }));
    toast.success(`Attached ${file.name}`);
  };

  const removeUploadedFile = (docName: string) => {
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[docName];
      return next;
    });
  };

  if (!isOpen) return null;

  const handleNextTab = async (nextStep: 1 | 2 | 3) => {
    let isValid = true;
    if (activeTab === 1) {
      isValid = await trigger(["childFirstName", "childLastName", "dateOfBirth", "gender", "classApplied"]);
    } else if (activeTab === 2) {
      isValid = await trigger(["parentName", "phone", "email"]);
    }
    if (isValid) {
      setActiveTab(nextStep);
    }
  };

  const onSubmit = async (data: NewApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const docPayload = REQUIRED_DOCS.map((name) => {
        const fileInfo = uploadedFiles[name];
        const isChecked = selectedDocuments[name] || !!fileInfo;
        return {
          name,
          status: isChecked ? "Uploaded" : "Pending",
          url: fileInfo
            ? `/uploads/admissions/${encodeURIComponent(fileInfo.name)}`
            : isChecked
            ? `/docs/sample-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf`
            : undefined,
          remarks: fileInfo ? `Attached file: ${fileInfo.name} (${fileInfo.size})` : undefined,
        };
      });

      const payload = {
        childFirstName: data.childFirstName.trim(),
        childMiddleName: data.childMiddleName?.trim() || undefined,
        childLastName: data.childLastName.trim(),
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        gradeAppliedFor: data.classApplied,
        classApplied: data.classApplied,
        academicYear: data.academicYear,
        parentName: data.parentName.trim(),
        fatherName: data.fatherName?.trim() || undefined,
        motherName: data.motherName?.trim() || undefined,
        guardianName: data.guardianName?.trim() || undefined,
        contactNumber: data.phone.trim(),
        parentPhone: data.phone.trim(),
        email: data.email?.trim() || undefined,
        parentEmail: data.email?.trim() || undefined,
        address: data.address?.trim() || undefined,
        previousSchool: data.previousSchool?.trim() || undefined,
        previousClass: data.previousClass?.trim() || undefined,
        previousAcademicYear: data.previousAcademicYear?.trim() || undefined,
        tcAvailable: data.tcAvailable,
        medicalNotes: data.medicalNotes?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        source: data.source || "Direct",
        referral: undefined,
        documents: docPayload,
        stage: "Application",
        status: "Submitted",
        feeStatus: "Pending",
        feeAmount: 25000,
        feePaid: 0,
      };

      const res: any = await apiClient.post("/api/admissions", payload);
      toast.success(
        `Application ${res?.applicationNumber || res?.enquiryReference || "created"} submitted successfully!`
      );
      reset();
      onSuccess(res);
      onClose();
    } catch (err: any) {
      console.error("Application submission failed", err);
      const msg = err.message || "Failed to submit application. Please review fields.";
      toast.error(msg);
      if (msg.toLowerCase().includes("mobile") || msg.toLowerCase().includes("phone") || msg.toLowerCase().includes("parent")) {
        setActiveTab(2);
      } else if (msg.toLowerCase().includes("child") || msg.toLowerCase().includes("birth") || msg.toLowerCase().includes("age") || msg.toLowerCase().includes("class")) {
        setActiveTab(1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl my-8 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#001438]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0050CB] to-[#002772] flex items-center justify-center text-white shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#000E28] dark:text-white">
                + New Formal Admission Application
              </h3>
              <p className="text-xs text-slate-500">
                Register candidate for entrance assessment & document review.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step Navigation Pills */}
        <div className="px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-[#001438]/30 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { step: 1, label: "1. Child Information", icon: User },
            { step: 2, label: "2. Parent Information", icon: Users },
            { step: 3, label: "3. Documents & Additional Details", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.step;
            const isCompleted = activeTab > tab.step;
            return (
              <button
                key={tab.step}
                type="button"
                onClick={() => handleNextTab(tab.step as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? "bg-[#0050CB] text-white shadow-xs"
                    : isCompleted
                    ? "bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8]"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs flex-1">
          {/* STEP 1: CHILD INFO */}
          {activeTab === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    First Name <span className="text-[#FF690C]">*</span>
                  </label>
                  <input
                    type="text"
                    value={childFirstName}
                    onKeyDown={preventNonAlphaKey}
                    onChange={(e) => setValue("childFirstName", sanitizeNameInput(e.target.value), { shouldValidate: true })}
                    onPaste={(e) => handleNamePaste(e, (v) => setValue("childFirstName", v, { shouldValidate: true }))}
                    placeholder="e.g. Rahul"
                    className={`w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border text-xs text-[#000E28] dark:text-white transition-all ${
                      errors.childFirstName ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  {errors.childFirstName && <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.childFirstName.message}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Middle Name (Optional)
                  </label>
                  <input
                    type="text"
                    {...register("childMiddleName")}
                    onKeyDown={preventNonAlphaKey}
                    placeholder="e.g. Kumar"
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Last Name <span className="text-[#FF690C]">*</span>
                  </label>
                  <input
                    type="text"
                    value={childLastName}
                    onKeyDown={preventNonAlphaKey}
                    onChange={(e) => setValue("childLastName", sanitizeNameInput(e.target.value), { shouldValidate: true })}
                    onPaste={(e) => handleNamePaste(e, (v) => setValue("childLastName", v, { shouldValidate: true }))}
                    placeholder="e.g. Sharma"
                    className={`w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border text-xs text-[#000E28] dark:text-white transition-all ${
                      errors.childLastName ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  {errors.childLastName && <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.childLastName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Date of Birth <span className="text-[#FF690C]">*</span>
                    </label>
                    {ageInfo && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ageInfo.isEligible
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        }`}
                      >
                        Age: {ageInfo.text}
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    {...register("dateOfBirth")}
                    max={maxDobDate}
                    className={`w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border text-xs text-[#000E28] dark:text-white transition-all ${
                      errors.dateOfBirth ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-1">
                    Child must be at least 3 years old for school enrollment.
                  </p>
                  {errors.dateOfBirth && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    {...register("gender")}
                    className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white font-bold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grade Applying For <span className="text-[#FF690C]">*</span>
                  </label>
                  <select
                    {...register("classApplied")}
                    className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white font-bold"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Intake Academic Year
                </label>
                <input
                  type="text"
                  {...register("academicYear")}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* STEP 2: PARENT INFO */}
          {activeTab === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Parent / Guardian Name <span className="text-[#FF690C]">*</span>
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onKeyDown={preventNonAlphaKey}
                    onChange={(e) => setValue("parentName", sanitizeNameInput(e.target.value), { shouldValidate: true })}
                    onPaste={(e) => handleNamePaste(e, (v) => setValue("parentName", v, { shouldValidate: true }))}
                    placeholder="e.g. Suresh Sharma"
                    className={`w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border text-xs text-[#000E28] dark:text-white transition-all ${
                      errors.parentName ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  {errors.parentName && <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.parentName.message}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    {...register("fatherName")}
                    onKeyDown={preventNonAlphaKey}
                    placeholder="Father's full name"
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    {...register("motherName")}
                    onKeyDown={preventNonAlphaKey}
                    placeholder="Mother's full name"
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Mobile Number <span className="text-[#FF690C]">*</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setValue("phone", sanitizePhoneInput(e.target.value), { shouldValidate: true })}
                    onPaste={(e) => handlePhonePaste(e, (v) => setValue("phone", v, { shouldValidate: true }))}
                    placeholder="e.g. 9876543210 (starts with 6-9)"
                    className={`w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border text-xs text-[#000E28] dark:text-white font-mono transition-all ${
                      errors.phone ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  {errors.phone ? (
                    <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.phone.message}</p>
                  ) : (
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Must be a valid 10-digit mobile number starting with 6, 7, 8, or 9
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Email Address
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="parent@example.com"
                    className={`w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border text-xs text-[#000E28] dark:text-white ${
                      errors.email ? "border-rose-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <textarea
                  {...register("address")}
                  rows={2}
                  placeholder="House / Flat No., Street, Area, City, PIN"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: DOCUMENTS & ADDITIONAL DETAILS */}
          {activeTab === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Documents Checklist & Upload */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0050CB]" />
                  <span>Mandatory Documents & Upload</span>
                </h4>
                <div className="space-y-2.5">
                  {REQUIRED_DOCS.map((docName) => {
                    const fileInfo = uploadedFiles[docName];
                    const isChecked = selectedDocuments[docName] || !!fileInfo;

                    return (
                      <div
                        key={docName}
                        className={`p-3.5 rounded-xl border transition-all ${
                          fileInfo
                            ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                            : isChecked
                            ? "bg-white dark:bg-[#000E28] border-blue-200 dark:border-blue-900/60"
                            : "bg-slate-50 dark:bg-[#07152F] border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setSelectedDocuments((prev) => ({
                                  ...prev,
                                  [docName]: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 rounded text-[#0050CB] focus:ring-[#0050CB]"
                            />
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block">
                                {docName} <span className="text-[#FF690C]">*</span>
                              </span>
                              <span className="text-[10.5px] text-slate-400 dark:text-slate-500">
                                Accepted: PDF, JPG, PNG (Max 10MB)
                              </span>
                            </div>
                          </label>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            {fileInfo ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-700/50">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="max-w-[140px] truncate">{fileInfo.name}</span>
                                  <span className="text-[9.5px] opacity-75">({fileInfo.size})</span>
                                </span>
                                <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors">
                                  <Upload className="w-3 h-3 text-[#0050CB]" />
                                  <span>Change</span>
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(docName, e)}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeUploadedFile(docName)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Remove attached file"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isChecked
                                      ? "bg-[#E5EEFF] text-[#0050CB] dark:bg-[#0050CB]/20 dark:text-[#38BDF8]"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                  }`}
                                >
                                  {isChecked ? "Pending Upload" : "Not Provided"}
                                </span>
                                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold transition-all shadow-xs shadow-[#0050CB]/20">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload Document</span>
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(docName, e)}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Previous Playschool / Daycare (Optional for Transfers) */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#07152F]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-xs">
                    <GraduationCap className="w-4 h-4 text-[#0050CB]" />
                    <span>Previous Playschool / Daycare (Optional for Transfers)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">Leave blank if first-time schooling</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Previous Playschool / Center
                    </label>
                    <input
                      type="text"
                      {...register("previousSchool")}
                      placeholder="e.g. Little Stars Montessori / Daycare"
                      className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Previous Level / Class
                    </label>
                    <input
                      type="text"
                      {...register("previousClass")}
                      placeholder="e.g. Playgroup / Pre-KG"
                      className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Previous Academic Year
                  </label>
                  <input
                    type="text"
                    {...register("previousAcademicYear")}
                    placeholder="2025–2026"
                    className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Medical & Special Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Medical Notes / Allergies (if any)
                  </label>
                  <textarea
                    {...register("medicalNotes")}
                    rows={2}
                    placeholder="Allergies, chronic medical conditions, medications..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Special Academic / Admissions Notes
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={2}
                    placeholder="Special educator requirements, sibling discount..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Navigation & Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              {activeTab > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab((prev) => (prev - 1) as any)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {activeTab < 3 ? (
                <button
                  type="button"
                  onClick={() => handleNextTab((activeTab + 1) as any)}
                  className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-linear-to-r from-[#0050CB] to-[#002772] hover:opacity-95 text-white font-bold transition-all shadow-md shadow-[#0050CB]/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering Application...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
