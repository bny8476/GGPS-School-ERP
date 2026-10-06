"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar as CalendarIcon,
  ChevronDown,
  GraduationCap,
  Info,
  ArrowRight,
  ArrowLeft,
  X,
  Send,
  CheckCircle2,
  Users,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Check,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

import toast from 'react-hot-toast';
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
} from "@/lib/validationUtils";

export default function AdmissionsPage() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    childFirstName: "",
    childLastName: "",
    dateOfBirth: "",
    gender: "",
    gradeAppliedFor: "",
    parentName: "",
    email: "",
    contactNumber: "",
    address: "",
  });

  // Validation Error States
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const firstName = formData.childFirstName.trim();
    if (!firstName) {
      newErrors.childFirstName = "Student first name is required";
    } else if (!NAME_REGEX.test(firstName)) {
      newErrors.childFirstName = "First name can contain only letters, spaces, hyphens, apostrophes, and periods";
    } else if (firstName.length < 2) {
      newErrors.childFirstName = "First name must be at least 2 characters";
    }

    const lastName = formData.childLastName.trim();
    if (!lastName) {
      newErrors.childLastName = "Student last name is required";
    } else if (!NAME_REGEX.test(lastName)) {
      newErrors.childLastName = "Last name can contain only letters, spaces, hyphens, apostrophes, and periods";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const dobResult = validateDOB(formData.dateOfBirth);
      if (!dobResult.valid) {
        newErrors.dateOfBirth = dobResult.error || "Date of birth cannot be in the future";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Please select gender";
    }

    if (!formData.gradeAppliedFor) {
      newErrors.gradeAppliedFor = "Please select grade applied for";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstField = Object.keys(newErrors)[0];
      const el = document.getElementById(firstField);
      if (el) el.focus();
      return;
    }

    setErrors({});
    setCurrentStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const parentName = formData.parentName.trim();
    if (!parentName) {
      newErrors.parentName = "Parent/Guardian name is required";
    } else if (!NAME_REGEX.test(parentName)) {
      newErrors.parentName = "Name can contain only letters, spaces, hyphens, apostrophes, and periods";
    } else if (parentName.length < 2) {
      newErrors.parentName = "Name must be at least 2 characters";
    }

    const email = formData.email.trim();
    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    const phone = formData.contactNumber.trim();
    if (!phone) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!TEN_DIGIT_PHONE_REGEX.test(phone)) {
      newErrors.contactNumber = "Please enter a valid 10-digit mobile number";
    }

    const address = formData.address.trim();
    if (!address) {
      newErrors.address = "Home address is required";
    } else if (address.length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstField = Object.keys(newErrors)[0];
      const el = document.getElementById(firstField);
      if (el) el.focus();
      return;
    }

    setErrors({});
    setCurrentStep(3);
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        student: {
          firstName: formData.childFirstName.trim(),
          lastName: formData.childLastName.trim(),
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          gradeAppliedFor: formData.gradeAppliedFor,
        },
        parent: {
          name: formData.parentName.trim(),
          email: formData.email.trim().toLowerCase(),
          contactNumber: formData.contactNumber.trim(),
          address: formData.address.trim(),
        },
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const err = await response.json();
        toast.error(`Submission failed: ${err.message || 'Validation error'}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("A network error occurred. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to cancel and clear the form?")) {
      setFormData({
        childFirstName: "",
        childLastName: "",
        dateOfBirth: "",
        gender: "",
        gradeAppliedFor: "",
        parentName: "",
        email: "",
        contactNumber: "",
        address: "",
      });
      setErrors({});
      setCurrentStep(1);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-gradient-to-b from-[#F7FAFE] via-white to-[#F0F5FF]">
        <div className="bg-white max-w-md w-full p-8 sm:p-10 rounded-3xl shadow-xl text-center space-y-6 border border-slate-100 animate-in zoom-in duration-300">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-[#E5EEFF] rounded-full flex items-center justify-center border-4 border-blue-100 text-[#0050CB]">
              <CheckCircle2 className="h-10 w-10 text-[#0050CB]" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#000E28]">
              Application Recorded!
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Student admission enquiry for{" "}
              <strong className="text-[#000E28]">
                {formData.childFirstName} {formData.childLastName}
              </strong>{" "}
              has been successfully recorded in the GGPS School ERP. The admissions committee will review credentials and reach out shortly.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full py-3.5 px-4 bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-sm rounded-full transition-all shadow-md"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FAFE] via-white to-[#F4F8FD] pt-4 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      
      {/* Decorative ambient blurred lights */}
      <div className="absolute -top-10 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* TOP HEADER & STEPPER BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          
          {/* Left: Icon + Eyebrow + Heading + Subtitle */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E5EEFF] flex items-center justify-center text-[#0050CB] shrink-0 mt-1 shadow-sm">
              <User className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-black tracking-widest text-[#0050CB] uppercase">
                {t("adm.eyebrow", "STUDENT ENROLLMENT")}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-[#000E28] tracking-tight mt-0.5">
                {t("adm.title", "Student")} <span className="text-[#0050CB]">{t("adm.titleHighlight", "Enrollment")}</span>
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-normal">
                {t("adm.subtitle", "Complete the details below to register a new student with GGPS School.")}
              </p>
            </div>
          </div>
          {/* Right: Stepper (01, 02, 03) with smooth animated fill lines */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start lg:self-center">
            
            {/* Step 1: Student Information */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: currentStep === 1 ? 1.06 : 1,
                  backgroundColor: currentStep >= 1 ? "#0050CB" : "#FFFFFF",
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all ${
                  currentStep === 1
                    ? "shadow-md shadow-blue-500/30 ring-4 ring-[#E5EEFF]"
                    : "shadow-sm"
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4 stroke-[2.5]" /> : "01"}
              </motion.div>
              <span
                className={`text-[11px] font-bold mt-1.5 whitespace-nowrap transition-colors duration-300 ${
                  currentStep === 1 ? "text-[#000E28]" : "text-slate-400"
                }`}
              >
                {t("adm.step1", "Student Information")}
              </span>
            </div>

            {/* Smooth Animated Connecting Line 1 -> 2 */}
            <div className="relative w-12 sm:w-20 h-[3px] bg-slate-200 rounded-full overflow-hidden mb-5 shrink-0">
              <motion.div
                initial={false}
                animate={{ width: currentStep >= 2 ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-0 left-0 h-full bg-[#0050CB] rounded-full"
              />
            </div>

            {/* Step 2: Parent / Guardian */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: currentStep === 2 ? 1.06 : 1,
                  backgroundColor: currentStep >= 2 ? "#0050CB" : "#FFFFFF",
                  color: currentStep >= 2 ? "#FFFFFF" : "#94A3B8",
                  borderColor: currentStep >= 2 ? "#0050CB" : "#E2E8F0",
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  currentStep === 2
                    ? "shadow-md shadow-blue-500/30 ring-4 ring-[#E5EEFF] text-white"
                    : "border-slate-200 text-slate-400 bg-white"
                }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4 stroke-[2.5]" /> : "02"}
              </motion.div>
              <span
                className={`text-[11px] font-bold mt-1.5 whitespace-nowrap transition-colors duration-300 ${
                  currentStep === 2 ? "text-[#000E28]" : "text-slate-400"
                }`}
              >
                {t("adm.step2", "Parent / Guardian")}
              </span>
            </div>

            {/* Smooth Animated Connecting Line 2 -> 3 */}
            <div className="relative w-12 sm:w-20 h-[3px] bg-slate-200 rounded-full overflow-hidden mb-5 shrink-0">
              <motion.div
                initial={false}
                animate={{ width: currentStep >= 3 ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-0 left-0 h-full bg-[#0050CB] rounded-full"
              />
            </div>

            {/* Step 3: Review & Submit */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: currentStep === 3 ? 1.06 : 1,
                  backgroundColor: currentStep === 3 ? "#0050CB" : "#FFFFFF",
                  color: currentStep >= 3 ? "#FFFFFF" : "#94A3B8",
                  borderColor: currentStep >= 3 ? "#0050CB" : "#E2E8F0",
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  currentStep === 3
                    ? "shadow-md shadow-blue-500/30 ring-4 ring-[#E5EEFF] text-white"
                    : "border-slate-200 text-slate-400 bg-white"
                }`}
              >
                03
              </motion.div>
              <span
                className={`text-[11px] font-bold mt-1.5 whitespace-nowrap transition-colors duration-300 ${
                  currentStep === 3 ? "text-[#000E28]" : "text-slate-400"
                }`}
              >
                {t("adm.step3", "Review & Submit")}
              </span>
            </div>

          </div>


        </div>

        {/* MAIN FORM CARD */}
        <div className="bg-white rounded-[28px] p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,14,40,0.06)] border border-slate-200/90">
          
          {/* STEP 1: STUDENT INFORMATION */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-6" noValidate>
              
              {/* Card Header */}
              <div className="flex items-center gap-3.5 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#000E28] tracking-tight">
                    Student Information
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal">
                    Personal details for official school records and ID card generation
                  </p>
                </div>
              </div>

              {/* 4-Column Grid: First Name, Last Name, DOB, Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* First Name */}
                <div>
                  <label htmlFor="childFirstName" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                    FIRST NAME <span className="text-[#FF690C]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      id="childFirstName"
                      name="childFirstName"
                      value={formData.childFirstName}
                      onKeyDown={preventNonAlphaKey}
                      onChange={(e) => {
                        const val = sanitizeNameInput(e.target.value);
                        setFormData((p) => ({ ...p, childFirstName: val }));
                        if (errors.childFirstName) {
                          setErrors((p) => {
                            const next = { ...p };
                            delete next.childFirstName;
                            return next;
                          });
                        }
                      }}
                      onPaste={(e) =>
                        handleNamePaste(e, (val) =>
                          setFormData((p) => ({ ...p, childFirstName: val }))
                        )
                      }
                      placeholder="e.g. Emma"
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                        errors.childFirstName
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                          : "border-slate-200 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                      }`}
                    />
                  </div>
                  {errors.childFirstName && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {errors.childFirstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="childLastName" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                    LAST NAME <span className="text-[#FF690C]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      id="childLastName"
                      name="childLastName"
                      value={formData.childLastName}
                      onKeyDown={preventNonAlphaKey}
                      onChange={(e) => {
                        const val = sanitizeNameInput(e.target.value);
                        setFormData((p) => ({ ...p, childLastName: val }));
                        if (errors.childLastName) {
                          setErrors((p) => {
                            const next = { ...p };
                            delete next.childLastName;
                            return next;
                          });
                        }
                      }}
                      onPaste={(e) =>
                        handleNamePaste(e, (val) =>
                          setFormData((p) => ({ ...p, childLastName: val }))
                        )
                      }
                      placeholder="e.g. Smith"
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                        errors.childLastName
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                          : "border-slate-200 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                      }`}
                    />
                  </div>
                  {errors.childLastName && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {errors.childLastName}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dob" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                    DATE OF BIRTH <span className="text-[#FF690C]">*</span>
                  </label>
                  <div className="relative">
                    <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      id="dob"
                      name="dateOfBirth"
                      max={new Date().toISOString().split("T")[0]}
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-700 focus:outline-none transition-all ${
                        errors.dateOfBirth
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                          : "border-slate-200 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                      }`}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                    GENDER <span className="text-[#FF690C]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-700 focus:outline-none transition-all appearance-none cursor-pointer ${
                        errors.gender
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                          : "border-slate-200 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.gender && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {errors.gender}
                    </p>
                  )}
                </div>

              </div>

              {/* Full Width Row: Grade Level */}
              <div>
                <label htmlFor="grade" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                  GRADE LEVEL APPLYING FOR <span className="text-[#FF690C]">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="grade"
                    name="gradeAppliedFor"
                    value={formData.gradeAppliedFor}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-3 bg-white border rounded-xl text-sm font-medium text-slate-700 focus:outline-none transition-all appearance-none cursor-pointer ${
                      errors.gradeAppliedFor
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                        : "border-slate-200 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                    }`}
                  >
                    <option value="">Select a Grade Level</option>
                    <option value="Pre-KG">Pre-KG (2.5 - 3.5 Years)</option>
                    <option value="LKG">LKG (3.5 - 4.5 Years)</option>
                    <option value="UKG">UKG (4.5 - 5.5 Years)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.gradeAppliedFor && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">
                    {errors.gradeAppliedFor}
                  </p>
                )}
              </div>

              {/* Information Notice Banner */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#E5EEFF]/60 border border-blue-100 text-[#000E28] text-xs sm:text-sm">
                <Info className="w-4 h-4 text-[#0050CB] shrink-0" />
                <span className="text-slate-600 font-normal">
                  All information provided will be kept secure and used only for school administration purposes.
                </span>
              </div>

              {/* Action Buttons: Cancel and Next */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,80,203,0.3)] hover:shadow-[0_10px_25px_rgba(0,80,203,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <span>Next: Parent / Guardian</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: PARENT / GUARDIAN */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-6" noValidate>
              
              {/* Card Header */}
              <div className="flex items-center gap-3.5 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#000E28] tracking-tight">
                    Parent / Guardian Information
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal">
                    Primary contacts for School ERP parent portal access, fee receipts & alerts
                  </p>
                </div>
              </div>

              {/* Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Parent Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="parentName" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                    FULL NAME <span className="text-[#FF690C]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onKeyDown={preventNonAlphaKey}
                      onChange={(e) => {
                        const val = sanitizeNameInput(e.target.value);
                        setFormData((p) => ({ ...p, parentName: val }));
                        if (errors.parentName) {
                          setErrors((p) => {
                            const next = { ...p };
                            delete next.parentName;
                            return next;
                          });
                        }
                      }}
                      onPaste={(e) =>
                        handleNamePaste(e, (val) =>
                          setFormData((p) => ({ ...p, parentName: val }))
                        )
                      }
                      placeholder="e.g. Michael Smith"
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                        errors.parentName
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                          : "border-slate-200 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                      }`}
                    />
                  </div>
                  {errors.parentName && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {errors.parentName}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                    EMAIL ADDRESS (FOR ERP LOGIN) <span className="text-[#FF690C]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="michael.s@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                        errors.email
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                          : "border-slate-200 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="phone" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                    CONTACT NUMBER (SMS & WHATSAPP) <span className="text-[#FF690C]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      id="phone"
                      name="contactNumber"
                      value={formData.contactNumber}
                      maxLength={10}
                      onKeyDown={preventNonNumericKey}
                      onChange={(e) => {
                        const val = sanitizePhoneInput(e.target.value);
                        setFormData((p) => ({ ...p, contactNumber: val }));
                        if (errors.contactNumber) {
                          setErrors((p) => {
                            const next = { ...p };
                            delete next.contactNumber;
                            return next;
                          });
                        }
                      }}
                      onPaste={(e) =>
                        handlePhonePaste(e, (val) =>
                          setFormData((p) => ({ ...p, contactNumber: val }))
                        )
                      }
                      placeholder="9840123456"
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                        errors.contactNumber
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                          : "border-slate-200 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                      }`}
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>

                {/* Home Address */}
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                    HOME ADDRESS <span className="text-[#FF690C]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <textarea
                      rows={3}
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter full permanent address..."
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all resize-none ${
                        errors.address
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                          : "border-slate-200 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                      }`}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

              </div>

              {/* Action Buttons: Back and Next */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Student Info</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,80,203,0.3)] hover:shadow-[0_10px_25px_rgba(0,80,203,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <span>Next: Review & Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* STEP 3: REVIEW & SUBMIT */}
          {currentStep === 3 && (
            <div className="space-y-6">
              
              {/* Card Header */}
              <div className="flex items-center gap-3.5 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#000E28] tracking-tight">
                    Review Application Details
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal">
                    Verify all entered information before registering to the GGPS School ERP
                  </p>
                </div>
              </div>

              {/* Details Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Student Summary Box */}
                <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-slate-100 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0050CB] uppercase tracking-wider pb-1 border-b border-slate-200/60">
                    <User className="w-3.5 h-3.5" />
                    <span>Student Profile</span>
                  </div>
                  <div className="text-xs sm:text-sm space-y-1.5 text-slate-700">
                    <p><strong className="text-[#000E28]">Full Name:</strong> {formData.childFirstName} {formData.childLastName}</p>
                    <p><strong className="text-[#000E28]">Date of Birth:</strong> {formData.dateOfBirth}</p>
                    <p><strong className="text-[#000E28]">Gender:</strong> {formData.gender}</p>
                    <p><strong className="text-[#000E28]">Grade Level:</strong> {formData.gradeAppliedFor}</p>
                  </div>
                </div>

                {/* Guardian Summary Box */}
                <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-slate-100 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0050CB] uppercase tracking-wider pb-1 border-b border-slate-200/60">
                    <Users className="w-3.5 h-3.5" />
                    <span>Guardian Profile</span>
                  </div>
                  <div className="text-xs sm:text-sm space-y-1.5 text-slate-700">
                    <p><strong className="text-[#000E28]">Guardian Name:</strong> {formData.parentName}</p>
                    <p><strong className="text-[#000E28]">Email:</strong> {formData.email}</p>
                    <p><strong className="text-[#000E28]">Phone:</strong> {formData.contactNumber}</p>
                    <p><strong className="text-[#000E28]">Address:</strong> {formData.address}</p>
                  </div>
                </div>

              </div>

              {/* Terms Info */}
              <div className="p-4 rounded-xl bg-[#E5EEFF]/50 border border-blue-100 text-xs text-slate-600 leading-relaxed">
                By submitting this form, you confirm that the entered student and parent details are accurate and authorize GGPS School to initiate ERP enrollment and communications.
              </div>

              {/* Actions: Back and Submit */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Guardian Info</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,80,203,0.35)] hover:shadow-[0_12px_28px_rgba(0,80,203,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Recording Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application to ERP</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
