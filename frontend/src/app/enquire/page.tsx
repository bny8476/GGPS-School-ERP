"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  GraduationCap,
  Users,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Lock,
  Compass,
  FileCheck,
  Award,
  Send,
  RotateCcw,
  ExternalLink,
  BookOpen,
  MapPin,
  Check,
  AlertCircle,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiBaseUrl } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import {
  createNameSchema,
  emailSchema,
  phoneSchema,
  optionalDobSchema,
} from "@/schemas";
import {
  preventNonAlphaKey,
  preventNonNumericKey,
  sanitizeNameInput,
  sanitizePhoneInput,
  handleNamePaste,
  handlePhonePaste,
} from "@/lib/validationUtils";

// ==========================================
// ZOD VALIDATION SCHEMA
// ==========================================
const enquirySchema = z.object({
  parentName: createNameSchema("Parent/Guardian name", 2, 80),
  email: emailSchema,
  phone: phoneSchema,
  relationship: z.enum(["Father", "Mother", "Guardian", "Other"]),
  childName: createNameSchema("Child name", 2, 80),
  dateOfBirth: optionalDobSchema,
  gender: z.enum(["Male", "Female", "Other"]),
  classApplied: z.enum(["PreKG", "LKG", "UKG"], {
    errorMap: () => ({ message: "Please select the class applying for" }),
  }),
  academicYear: z.string().trim().min(1, "Academic year is required"),
  preferredContactMethod: z.enum(["Phone", "WhatsApp", "Email"]),
  message: z.string().max(600, "Message cannot exceed 600 characters").optional(),
  preferredVisitDate: z.string().optional(),
  source: z.enum(["Website", "Home Page", "Admission Page", "Referral", "Other"]).optional(),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

interface SubmissionResult {
  enquiryId: string;
  childName: string;
  classApplied: string;
  academicYear: string;
  parentName: string;
  phone: string;
  email: string;
  preferredContactMethod: string;
  isDuplicate?: boolean;
}

export default function AdmissionEnquirePage() {
  const { t } = useLanguage();
  const formRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<SubmissionResult | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    mode: "onChange",
    defaultValues: {
      parentName: "",
      email: "",
      phone: "",
      relationship: "Father",
      childName: "",
      dateOfBirth: "",
      gender: "Male",
      classApplied: "LKG",
      academicYear: "2026–2027",
      preferredContactMethod: "Phone",
      message: "",
      preferredVisitDate: "",
      source: "Website",
    },
  });

  const onSubmit = async (data: EnquiryFormData) => {
    setIsSubmitting(true);
    setDuplicateWarning(null);

    try {
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/api/v1/admissions/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: data.parentName.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          relationship: data.relationship,
          childName: data.childName.trim(),
          dateOfBirth: data.dateOfBirth || undefined,
          gender: data.gender,
          classApplied: data.classApplied,
          academicYear: data.academicYear,
          preferredContactMethod: data.preferredContactMethod,
          message: data.message?.trim() || "",
          preferredVisitDate: data.preferredVisitDate || undefined,
          source: data.source || "Website",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to submit your enquiry. Please try again.");
      }

      const rawId =
        result.enquiryId ||
        result.data?.enquiryId ||
        result.enquiryReference ||
        `GGPSENQ20260001`;
      const generatedId = String(rawId).replace(/-/g, '');

      if (result.isDuplicate) {
        setDuplicateWarning(
          result.message ||
            "An enquiry for this child may already exist. Our admissions team will review it."
        );
        toast(
          result.message ||
            "An enquiry for this child may already exist. Our admissions team will review it.",
          {
            icon: "ℹ️",
            duration: 6000,
          }
        );
      } else {
        toast.success("Enquiry submitted successfully!");
      }

      setSubmissionSuccess({
        enquiryId: generatedId,
        childName: data.childName,
        classApplied: data.classApplied,
        academicYear: data.academicYear,
        parentName: data.parentName,
        phone: data.phone,
        email: data.email,
        preferredContactMethod: data.preferredContactMethod,
        isDuplicate: result.isDuplicate,
      });

      formRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err: any) {
      console.error("Enquiry submission error:", err);
      toast.error(err.message || "Unable to submit your enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    reset();
    setSubmissionSuccess(null);
    setDuplicateWarning(null);
  };

  const faqs = [
    {
      question: "When does the admission process begin?",
      answer:
        "Admissions for the upcoming academic year (2026–2027) are open for PreKG, LKG, and UKG. We recommend early enquiry to secure preferred timing.",
    },
    {
      question: "Which classes are currently accepting enquiries?",
      answer:
        "We are currently welcoming enquiries for PreKG (ages 2.5–3.5), LKG (ages 3.5–4.5), and UKG (ages 4.5–5.5). Vacancies are filled on a first-come, first-evaluated basis.",
    },
    {
      question: "What documents are required?",
      answer:
        "No documents are required to submit this enquiry. When your campus visit is scheduled, please bring the birth certificate, immunization chart, and passport photos.",
    },
    {
      question: "How will the school contact me?",
      answer:
        "Our admissions counsellor will contact you within 24 hours through your selected contact method (Phone, WhatsApp, or Email).",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAFF] dark:bg-[#000a1f] text-[#0B1833] dark:text-slate-100 font-sans selection:bg-[#0050CB]/20 selection:text-[#0050CB] transition-colors duration-200">
      
      {/* ========================================================
          HERO & INTRO BANNER
      ======================================================== */}
      <section className="relative pt-6 pb-10 sm:pt-8 sm:pb-12 overflow-hidden border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white via-[#F7FAFF] to-[#E5EEFF]/30 dark:from-[#000E28] dark:via-[#000a1f] dark:to-[#050E22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/30 border border-blue-200 dark:border-blue-900 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#FF690C]" />
              <span>Admissions Intake 2026–2027 Open</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000E28] dark:text-white tracking-tight leading-tight mb-4">
              Start Your Journey With <span className="text-[#0050CB] dark:text-[#38BDF8]">GGPS School</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Experience holistic early childhood learning in a secure, nurturing environment. Fill in the details below, and our admissions team will contact you directly within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          MAIN 2-COLUMN WORKSPACE: LEFT INFO + RIGHT FORM
      ======================================================== */}
      <section ref={formRef} className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ==========================================
              LEFT COLUMN: ADMISSION INFORMATION
          ========================================== */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Guide Card */}
            <div className="bg-white dark:bg-[#001438] rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/30 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#000E28] dark:text-white">Admission Guidance</h2>
                  <p className="text-xs text-slate-500">Step-by-step assistance for new parents</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center text-xs mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#000E28] dark:text-white">One-on-One Counselling</h3>
                    <p className="text-[11px] text-slate-500">Personal guidance to understand curriculum and age readiness.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center text-xs mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#000E28] dark:text-white">Class Availability Check</h3>
                    <p className="text-[11px] text-slate-500">Real-time verification of vacant seats in PreKG, LKG, and UKG.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center text-xs mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#000E28] dark:text-white">Campus Walkthrough Tour</h3>
                    <p className="text-[11px] text-slate-500">Scheduled visit to explore smart classrooms, play zones, and safety labs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center text-xs mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#000E28] dark:text-white">Transparent Fee Information</h3>
                    <p className="text-[11px] text-slate-500">Clear breakdown of tuition, activity kits, day care, and uniforms.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center text-xs mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#000E28] dark:text-white">Complete Application Support</h3>
                    <p className="text-[11px] text-slate-500">Assistance with form completion, verification, and student enrollment.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Availability Matrix */}
            <div className="bg-white dark:bg-[#001438] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#000E28] dark:text-white">
                  Class Availability Matrix
                </h3>
                <span className="text-[10px] font-bold text-[#0050CB] dark:text-[#38BDF8] bg-[#E5EEFF] dark:bg-[#0050CB]/20 px-2 py-0.5 rounded-full">
                  Intake 2026-27
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-xs font-black text-[#000E28] dark:text-white block">PreKG</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Age 2.5 - 3.5</span>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    Open
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-xs font-black text-[#0050CB] dark:text-[#38BDF8] block">LKG</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Age 3.5 - 4.5</span>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    Fast Filling
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-xs font-black text-[#FF690C] block">UKG</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Age 4.5 - 5.5</span>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                    Limited
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contact Desk */}
            <div className="p-5 rounded-2xl bg-[#E5EEFF]/80 dark:bg-[#001D4D]/60 border border-blue-200/90 dark:border-blue-900/60 space-y-2 text-xs">
              <p className="font-bold text-[#000E28] dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF690C]" /> Admissions Helpdesk
              </p>
              <p className="text-slate-600 dark:text-blue-200">
                Direct phone: <strong className="text-[#0050CB] dark:text-white">+91 98401 22334</strong>
              </p>
              <p className="text-slate-600 dark:text-blue-200">
                Campus hours: Monday to Saturday, 8:30 AM – 4:00 PM
              </p>
            </div>
          </div>

          {/* ==========================================
              RIGHT COLUMN: ENQUIRY FORM / SUCCESS STATE
          ========================================== */}
          <div className="lg:col-span-7">
            {submissionSuccess ? (
              /* Success State Card */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-[#001438] rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6"
              >
                {/* Checkmark Animation */}
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-sm animate-in zoom-in duration-300">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#000E28] dark:text-white">
                    Enquiry Submitted Successfully
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                    Thank you for contacting GGPS School. Our admissions team will contact you shortly.
                  </p>
                </div>

                {/* Duplicate Notification Banner if Applicable */}
                {submissionSuccess.isDuplicate && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-left flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      An enquiry for this child was previously logged. Our admissions counsellor will review your updated notes.
                    </span>
                  </div>
                )}

                {/* Enquiry ID Display Box */}
                <div className="p-5 rounded-2xl bg-[#F7FAFF] dark:bg-[#000E28] border border-blue-200 dark:border-blue-900 max-w-md mx-auto space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Your Unique Enquiry ID
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#0050CB] dark:text-[#38BDF8]">
                    {submissionSuccess.enquiryId ? submissionSuccess.enquiryId.replace(/-/g, '') : ''}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Please keep this ID for your reference and during campus visit.
                  </p>
                </div>

                {/* Summary Table */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-1.5">
                    <span className="text-slate-500">Child Name:</span>
                    <strong className="text-[#000E28] dark:text-white">{submissionSuccess.childName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-1.5">
                    <span className="text-slate-500">Grade Applying For:</span>
                    <strong className="text-[#0050CB] dark:text-[#38BDF8]">Class {submissionSuccess.classApplied} ({submissionSuccess.academicYear})</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-1.5">
                    <span className="text-slate-500">Parent / Guardian:</span>
                    <strong className="text-[#000E28] dark:text-white">{submissionSuccess.parentName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-1.5">
                    <span className="text-slate-500">Phone Number:</span>
                    <strong className="text-[#000E28] dark:text-white">{submissionSuccess.phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Preferred Contact:</span>
                    <strong className="text-[#FF690C]">{submissionSuccess.preferredContactMethod}</strong>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    href="/"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-[#000E28] dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-xs shadow-xs transition-colors"
                  >
                    Back to Home
                  </Link>
                  <Link
                    href="/admissions"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs shadow-md shadow-[#0050CB]/25 transition-all"
                  >
                    View Admission Information
                  </Link>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto px-4 py-3 text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Enquiry Form */
              <div className="bg-white dark:bg-[#001438] rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-xl">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white">
                    Submit Admission Enquiry
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Provide the required information to receive admission counseling for your child.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  
                  {/* PARENT INFORMATION */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0050CB] dark:text-[#38BDF8] flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Parent / Guardian Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Parent Name */}
                      <div className="space-y-1">
                        <label htmlFor="parentName" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Parent / Guardian Name <span className="text-[#FF690C]">*</span>
                        </label>
                        <input
                          id="parentName"
                          type="text"
                          placeholder="e.g. Rahul Kumar"
                          {...register("parentName")}
                          onKeyDown={preventNonAlphaKey}
                          onChange={(e) => setValue("parentName", sanitizeNameInput(e.target.value), { shouldValidate: true })}
                          onPaste={(e) => handleNamePaste(e, (v) => setValue("parentName", v, { shouldValidate: true }))}
                          className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                            errors.parentName
                              ? "border-rose-400 focus:ring-rose-500/10"
                              : "border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-[#0050CB]/10"
                          }`}
                        />
                        {errors.parentName && (
                          <p className="text-[11px] text-rose-500 font-semibold">{errors.parentName.message}</p>
                        )}
                      </div>

                      {/* Relationship */}
                      <div className="space-y-1">
                        <label htmlFor="relationship" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Relationship
                        </label>
                        <select
                          id="relationship"
                          {...register("relationship")}
                          className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/10 focus:border-[#0050CB]"
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1">
                        <label htmlFor="phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Phone Number <span className="text-[#FF690C]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="phone"
                            type="tel"
                            placeholder="9840123456"
                            maxLength={10}
                            {...register("phone")}
                            onKeyDown={preventNonNumericKey}
                            onChange={(e) => setValue("phone", sanitizePhoneInput(e.target.value), { shouldValidate: true })}
                            onPaste={(e) => handlePhonePaste(e, (v) => setValue("phone", v, { shouldValidate: true }))}
                            className={`w-full h-11 pl-9 pr-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                              errors.phone
                                ? "border-rose-400 focus:ring-rose-500/10"
                                : "border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-[#0050CB]/10"
                            }`}
                          />
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                        </div>
                        {errors.phone && (
                          <p className="text-[11px] text-rose-500 font-semibold">{errors.phone.message}</p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1">
                        <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Email Address <span className="text-[#FF690C]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            type="email"
                            placeholder="parent@example.com"
                            {...register("email")}
                            className={`w-full h-11 pl-9 pr-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                              errors.email
                                ? "border-rose-400 focus:ring-rose-500/10"
                                : "border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-[#0050CB]/10"
                            }`}
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                        </div>
                        {errors.email && (
                          <p className="text-[11px] text-rose-500 font-semibold">{errors.email.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CHILD INFORMATION */}
                  <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0050CB] dark:text-[#38BDF8] flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5" /> Child Details & Program
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Child Name */}
                      <div className="space-y-1">
                        <label htmlFor="childName" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Child Name <span className="text-[#FF690C]">*</span>
                        </label>
                        <input
                          id="childName"
                          type="text"
                          placeholder="e.g. Arun Kumar"
                          {...register("childName")}
                          onKeyDown={preventNonAlphaKey}
                          onChange={(e) => setValue("childName", sanitizeNameInput(e.target.value), { shouldValidate: true })}
                          onPaste={(e) => handleNamePaste(e, (v) => setValue("childName", v, { shouldValidate: true }))}
                          className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                            errors.childName
                              ? "border-rose-400 focus:ring-rose-500/10"
                              : "border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-[#0050CB]/10"
                          }`}
                        />
                        {errors.childName && (
                          <p className="text-[11px] text-rose-500 font-semibold">{errors.childName.message}</p>
                        )}
                      </div>

                      {/* Child DOB */}
                      <div className="space-y-1">
                        <label htmlFor="dateOfBirth" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Child Date of Birth
                        </label>
                        <input
                          id="dateOfBirth"
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          {...register("dateOfBirth")}
                          className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 transition-all ${
                            errors.dateOfBirth
                              ? "border-rose-400 focus:ring-rose-500/10"
                              : "border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-[#0050CB]/10"
                          }`}
                        />
                        <p className="text-[10px] text-slate-400 mt-0.5">Child must be at least 3 years old for school enrollment</p>
                        {errors.dateOfBirth && (
                          <p className="text-[11px] text-rose-500 font-semibold">{errors.dateOfBirth.message}</p>
                        )}
                      </div>

                      {/* Class Applying For */}
                      <div className="space-y-1">
                        <label htmlFor="classApplied" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Grade / Class Applying For <span className="text-[#FF690C]">*</span>
                        </label>
                        <select
                          id="classApplied"
                          {...register("classApplied")}
                          className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 transition-all ${
                            errors.classApplied
                              ? "border-rose-400 focus:ring-rose-500/10"
                              : "border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-[#0050CB]/10"
                          }`}
                        >
                          <option value="PreKG">PreKG (Ages 2.5–3.5)</option>
                          <option value="LKG">LKG (Ages 3.5–4.5)</option>
                          <option value="UKG">UKG (Ages 4.5–5.5)</option>
                        </select>
                        {errors.classApplied && (
                          <p className="text-[11px] text-rose-500 font-semibold">{errors.classApplied.message}</p>
                        )}
                      </div>

                      {/* Academic Year */}
                      <div className="space-y-1">
                        <label htmlFor="academicYear" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Academic Year <span className="text-[#FF690C]">*</span>
                        </label>
                        <select
                          id="academicYear"
                          {...register("academicYear")}
                          className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/10 focus:border-[#0050CB]"
                        >
                          <option value="2026–2027">2026–2027 (Upcoming Session)</option>
                          <option value="2025–2026">2025–2026 (Current Mid-Term)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* PREFERENCES & SOURCE */}
                  <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0050CB] dark:text-[#38BDF8] flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF690C]" /> Communication & Visit
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Preferred Contact Method */}
                      <div className="space-y-1">
                        <label htmlFor="preferredContactMethod" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Preferred Contact Method
                        </label>
                        <select
                          id="preferredContactMethod"
                          {...register("preferredContactMethod")}
                          className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/10 focus:border-[#0050CB]"
                        >
                          <option value="Phone">Phone Call</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Email">Email</option>
                        </select>
                      </div>

                      {/* Preferred Visit Date */}
                      <div className="space-y-1">
                        <label htmlFor="preferredVisitDate" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Preferred Visit Date
                        </label>
                        <input
                          id="preferredVisitDate"
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          {...register("preferredVisitDate")}
                          className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/10 focus:border-[#0050CB]"
                        />
                      </div>

                      {/* Source */}
                      <div className="space-y-1">
                        <label htmlFor="source" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Source
                        </label>
                        <select
                          id="source"
                          {...register("source")}
                          className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]/10 focus:border-[#0050CB]"
                        >
                          <option value="Website">Website</option>
                          <option value="Home Page">Home Page</option>
                          <option value="Admission Page">Admission Page</option>
                          <option value="Referral">Referral / Friends</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Message / Enquiry Notes */}
                    <div className="space-y-1">
                      <label htmlFor="message" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Message / Enquiry
                      </label>
                      <textarea
                        id="message"
                        rows={3}
                        placeholder="Any questions about curriculum, admissions timeline, or campus visits..."
                        {...register("message")}
                        className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0050CB]/10 focus:border-[#0050CB] resize-none"
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#0050CB]/25 hover:shadow-xl hover:shadow-[#0050CB]/35 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Submitting enquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Enquiry</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-slate-400 mt-2">
                      Safe & secure. Your personal information is protected under GGPS School privacy policy.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            FAQ SECTION
        ======================================================== */}
        <div className="mt-16 pt-12 border-t border-slate-200/80 dark:border-slate-800">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-[#000E28] dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Have questions regarding admission procedure? Here are common answers.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white dark:bg-[#001438] border border-slate-200/90 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#000E28] dark:text-white cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#0050CB]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
