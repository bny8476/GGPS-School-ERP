"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  GraduationCap, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Clock,
  Compass,
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
  validateDOB,
} from "@/lib/validationUtils";

const newEnquirySchema = z.object({
  parentName: z
    .string()
    .trim()
    .min(2, "Parent/Guardian name must be at least 2 characters")
    .max(80, "Name cannot exceed 80 characters")
    .regex(NAME_REGEX, "Name can contain only letters, spaces, hyphens, apostrophes, and periods (no numbers)"),
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
  childName: z
    .string()
    .trim()
    .min(2, "Child name must be at least 2 characters")
    .max(80, "Name cannot exceed 80 characters")
    .regex(NAME_REGEX, "Name can contain only letters, spaces, hyphens, apostrophes, and periods (no numbers)"),
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return validateDOB(val).valid;
    }, {
      message: "Child must be at least 3 years old for school enrollment",
    }),
  gender: z.enum(["Male", "Female", "Other"]),
  classApplied: z.string().min(1, "Please select the class applying for"),
  academicYear: z.string(),
  preferredContactMethod: z.enum(["Phone", "WhatsApp", "Email"]),
  source: z.string(),
  enquiryDate: z.string(),
  followUpDate: z.string().optional(),
  status: z.enum([
    "New",
    "Contacted",
    "Follow-up",
    "Qualified",
    "Application Started",
    "Converted",
    "Closed",
  ]),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

type NewEnquiryFormData = z.infer<typeof newEnquirySchema>;

interface NewEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: any) => void;
}

const CLASS_OPTIONS = [
  "Pre-KG",
  "LKG",
  "UKG",
];

const SOURCE_OPTIONS = [
  "Walk-in",
  "Phone",
  "Website",
  "Referral",
  "Social Media",
  "Admission Page",
  "Other",
];

export default function NewEnquiryModal({
  isOpen,
  onClose,
  onSuccess,
}: NewEnquiryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NewEnquiryFormData>({
    resolver: zodResolver(newEnquirySchema),
    defaultValues: {
      parentName: "",
      phone: "",
      email: "",
      childName: "",
      dateOfBirth: "",
      gender: "Male",
      classApplied: "LKG",
      academicYear: "2026–2027",
      preferredContactMethod: "Phone",
      source: "Walk-in",
      enquiryDate: new Date().toISOString().split("T")[0],
      followUpDate: "",
      status: "New",
      notes: "",
    },
  });

  const parentNameValue = watch("parentName");
  const childNameValue = watch("childName");
  const phoneValue = watch("phone");
  const dateOfBirthValue = watch("dateOfBirth");

  const maxDobDate = React.useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 3);
    return d.toISOString().split("T")[0];
  }, []);

  const ageInfo = React.useMemo(() => {
    if (!dateOfBirthValue) return null;
    const dob = new Date(dateOfBirthValue);
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
  }, [dateOfBirthValue]);

  if (!isOpen) return null;

  const onSubmit = async (data: NewEnquiryFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        parentName: data.parentName.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || undefined,
        childName: data.childName.trim(),
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender,
        classApplied: data.classApplied,
        gradeAppliedFor: data.classApplied,
        academicYear: data.academicYear,
        preferredContactMethod: data.preferredContactMethod,
        source: data.source,
        enquiryDate: data.enquiryDate,
        followUpDate: data.followUpDate || undefined,
        status: data.status,
        notes: data.notes?.trim() || undefined,
        message: data.notes?.trim() || `Admission enquiry for ${data.childName} (${data.classApplied})`,
      };

      const res: any = await apiClient.post("/api/v1/admissions/enquiries", payload);
      const rawRef = res?.enquiryId || res?.applicationNumber || "Created";
      const cleanRef = String(rawRef).replace(/-/g, '');
      toast.success(
        `Enquiry logged successfully! Ref: ${cleanRef}`
      );
      reset();
      onSuccess(res);
      onClose();
    } catch (err: any) {
      console.error("Enquiry submission failed", err);
      toast.error(err.message || "Failed to log enquiry. Please check the fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#000E28] rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#001438]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8] shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#000E28] dark:text-white">
                + New Admission Enquiry
              </h3>
              <p className="text-xs text-slate-500">
                Log prospective admission interest. Does <span className="font-bold text-[#FF690C]">NOT</span> create a student record.
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          
          {/* Section 1: Parent/Guardian Details */}
          <div>
            <div className="flex items-center gap-2 pb-1 mb-2 border-b border-slate-100 dark:border-slate-800">
              <User className="w-3.5 h-3.5 text-[#0050CB]" />
              <h4 className="text-xs font-bold text-[#000E28] dark:text-white uppercase tracking-wider">
                Parent / Guardian Information
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parent Name <span className="text-[#FF690C]">*</span>
                </label>
                <input
                  type="text"
                  value={parentNameValue}
                  onKeyDown={preventNonAlphaKey}
                  onChange={(e) => setValue("parentName", sanitizeNameInput(e.target.value), { shouldValidate: true })}
                  onPaste={(e) => handleNamePaste(e, (v) => setValue("parentName", v, { shouldValidate: true }))}
                  placeholder="e.g. Ramesh Kumar"
                  className={`w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border text-xs text-[#000E28] dark:text-white transition-all ${
                    errors.parentName ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {errors.parentName && <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.parentName.message}</p>}
              </div>

              <div className="sm:col-span-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number <span className="text-[#FF690C]">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneValue}
                  onChange={(e) => setValue("phone", sanitizePhoneInput(e.target.value), { shouldValidate: true })}
                  onPaste={(e) => handlePhonePaste(e, (v) => setValue("phone", v, { shouldValidate: true }))}
                  placeholder="10-digit mobile"
                  className={`w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border text-xs text-[#000E28] dark:text-white transition-all font-mono ${
                    errors.phone ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.phone.message}</p>}
              </div>

              <div className="sm:col-span-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="parent@example.com"
                  className={`w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border text-xs text-[#000E28] dark:text-white transition-all ${
                    errors.email ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {errors.email && <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.email.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Child Details */}
          <div>
            <div className="flex items-center gap-2 pb-1 mb-2 border-b border-slate-100 dark:border-slate-800">
              <GraduationCap className="w-3.5 h-3.5 text-[#0050CB]" />
              <h4 className="text-xs font-bold text-[#000E28] dark:text-white uppercase tracking-wider">
                Child / Applicant Information
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Child Name <span className="text-[#FF690C]">*</span>
                </label>
                <input
                  type="text"
                  value={childNameValue}
                  onKeyDown={preventNonAlphaKey}
                  onChange={(e) => setValue("childName", sanitizeNameInput(e.target.value), { shouldValidate: true })}
                  onPaste={(e) => handleNamePaste(e, (v) => setValue("childName", v, { shouldValidate: true }))}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border text-xs text-[#000E28] dark:text-white transition-all ${
                    errors.childName ? "border-rose-400 focus:ring-1 focus:ring-rose-400" : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {errors.childName && <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{errors.childName.message}</p>}
              </div>

              <div className="sm:col-span-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Date of Birth
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
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
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
                  className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Admission & Communication Preferences */}
          <div>
            <div className="flex items-center gap-2 pb-1 mb-2 border-b border-slate-100 dark:border-slate-800">
              <Compass className="w-3.5 h-3.5 text-[#0050CB]" />
              <h4 className="text-xs font-bold text-[#000E28] dark:text-white uppercase tracking-wider">
                Admission Details & Preferences
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Class Applying For <span className="text-[#FF690C]">*</span>
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

              <div className="sm:col-span-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  {...register("academicYear")}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Contact
                </label>
                <select
                  {...register("preferredContactMethod")}
                  className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                >
                  <option value="Phone">Phone Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enquiry Source
                </label>
                <select
                  {...register("source")}
                  className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                >
                  {SOURCE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Workflow Status & Follow-up */}
          <div>
            <div className="flex items-center gap-2 pb-1 mb-2 border-b border-slate-100 dark:border-slate-800">
              <Clock className="w-3.5 h-3.5 text-[#0050CB]" />
              <h4 className="text-xs font-bold text-[#000E28] dark:text-white uppercase tracking-wider">
                Status & Follow-up Tracking
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enquiry Status
                </label>
                <select
                  {...register("status")}
                  className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white font-bold"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Application Started">Application Started</option>
                  <option value="Converted">Converted</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enquiry Date
                </label>
                <input
                  type="date"
                  {...register("enquiryDate")}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  {...register("followUpDate")}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Internal Remarks / Notes
              </label>
              <textarea
                {...register("notes")}
                rows={2}
                placeholder="Parent interest notes, previous school, queries..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#07152F] border border-slate-200 dark:border-slate-700 text-xs text-[#000E28] dark:text-white resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold transition-all shadow-xs shadow-[#0050CB]/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Logging Enquiry...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Enquiry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
