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
  TEN_DIGIT_PHONE_REGEX,
  preventNonAlphaKey,
  sanitizeNameInput,
  sanitizePhoneInput,
  handleNamePaste,
  handlePhonePaste,
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
  dateOfBirth: z.string().min(1, "Date of birth is required"),
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
    .regex(TEN_DIGIT_PHONE_REGEX, "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9"),
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
  source: z.string(),
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
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

const REQUIRED_DOCS = [
  "Birth Certificate",
  "Parent ID Proof (Aadhaar / Passport)",
  "Address Proof (Utility Bill / Rent Agreement)",
  "Previous School Records / Report Card",
  "Transfer Certificate (TC)",
];

export default function NewApplicationModal({
  isOpen,
  onClose,
  onSuccess,
}: NewApplicationModalProps) {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, boolean>>({
    "Birth Certificate": true,
    "Parent ID Proof (Aadhaar / Passport)": true,
    "Address Proof (Utility Bill / Rent Agreement)": false,
    "Previous School Records / Report Card": false,
    "Transfer Certificate (TC)": false,
  });

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

  if (!isOpen) return null;

  const handleNextTab = async (nextStep: 1 | 2 | 3 | 4) => {
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
      const docPayload = Object.entries(selectedDocuments).map(([name, isChecked]) => ({
        name,
        status: isChecked ? "Uploaded" : "Pending",
        url: isChecked ? `/docs/sample-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf` : undefined,
      }));

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
        source: data.source,
        referral: data.referral?.trim() || undefined,
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
      toast.error(err.message || "Failed to submit application. Please review fields.");
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
            { step: 2, label: "2. Parent / Guardian", icon: Users },
            { step: 3, label: "3. Academic History", icon: GraduationCap },
            { step: 4, label: "4. Documents & Additional", icon: ShieldCheck },
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
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth <span className="text-[#FF690C]">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("dateOfBirth")}
                    max={new Date().toISOString().split("T")[0]}
                    className={`w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border text-xs text-[#000E28] dark:text-white ${
                      errors.dateOfBirth ? "border-rose-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  {errors.dateOfBirth && <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.dateOfBirth.message}</p>}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
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

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Guardian Name (if applicable)
                  </label>
                  <input
                    type="text"
                    {...register("guardianName")}
                    onKeyDown={preventNonAlphaKey}
                    placeholder="Guardian name"
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
                    placeholder="10-digit mobile"
                    className={`w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border text-xs text-[#000E28] dark:text-white font-mono ${
                      errors.phone ? "border-rose-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.phone.message}</p>}
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

          {/* STEP 3: ACADEMIC HISTORY */}
          {activeTab === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Previous School Attended
                  </label>
                  <input
                    type="text"
                    {...register("previousSchool")}
                    placeholder="e.g. St. Xavier International Academy"
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Previous Class / Grade
                  </label>
                  <input
                    type="text"
                    {...register("previousClass")}
                    placeholder="e.g. Nursery / Class 1"
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Previous Academic Year
                  </label>
                  <input
                    type="text"
                    {...register("previousAcademicYear")}
                    placeholder="2025-2026"
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white font-mono"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#07152F]">
                    <input
                      type="checkbox"
                      {...register("tcAvailable")}
                      className="w-4 h-4 rounded text-[#0050CB] focus:ring-[#0050CB]"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      Transfer Certificate (TC) Available
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DOCUMENTS & ADDITIONAL */}
          {activeTab === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0050CB]" />
                  <span>Mandatory Documents Checklist</span>
                </h4>
                <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-[#07152F]/50">
                  {REQUIRED_DOCS.map((docName) => (
                    <label
                      key={docName}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#000E28] border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-[#0050CB]/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!selectedDocuments[docName]}
                          onChange={(e) =>
                            setSelectedDocuments((prev) => ({
                              ...prev,
                              [docName]: e.target.value === "on" ? e.target.checked : false,
                            }))
                          }
                          className="w-4 h-4 rounded text-[#0050CB] focus:ring-[#0050CB]"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{docName}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        selectedDocuments[docName] ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {selectedDocuments[docName] ? "Uploaded / Attached" : "Pending Submission"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Application Source
                  </label>
                  <select
                    {...register("source")}
                    className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white font-bold"
                  >
                    <option value="Direct">Direct Campus Office</option>
                    <option value="Website">School Portal</option>
                    <option value="Referral">Existing Parent Referral</option>
                    <option value="Social Media">Social Campaign</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Referral Name / ID
                  </label>
                  <input
                    type="text"
                    {...register("referral")}
                    placeholder="e.g. Sibling Admission No or Teacher Name"
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
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

              {activeTab < 4 ? (
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
