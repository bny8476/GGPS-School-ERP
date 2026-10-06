"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiBaseUrl } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { createNameSchema, emailSchema, phoneSchema } from "@/schemas";
import {
  preventNonAlphaKey,
  preventNonNumericKey,
  sanitizeNameInput,
  sanitizePhoneInput,
  handleNamePaste,
  handlePhonePaste,
} from "@/lib/validationUtils";

const contactSchema = z.object({
  name: createNameSchema("Your Full Name", 2, 80),
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(120, "Subject cannot exceed 120 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message cannot exceed 1000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/v1/admissions/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: data.name,
          email: data.email,
          phone: data.phone,
          childName: "General Inquiry",
          classApplied: "LKG",
          academicYear: "2026–2027",
          preferredContactMethod: "Email",
          source: "Contact Page",
          message: `[Subject: ${data.subject}] ${data.message}`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message. Please try again.");
      }

      setIsSubmitted(true);
      toast.success("Thank you! Your message has been sent to our admissions team.");
      reset();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#000a1f] text-[#000E28] dark:text-slate-100 font-sans selection:bg-[#0050CB]/20 selection:text-[#0050CB] transition-colors duration-200">
      
      {/* HERO SECTION */}
      <section className="relative pt-6 pb-10 sm:pt-8 sm:pb-12 overflow-hidden border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white via-[#F6F8FC] to-[#E5EEFF]/30 dark:from-[#000E28] dark:via-[#000a1f] dark:to-[#050E22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/30 border border-blue-200 dark:border-blue-900 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#FF690C]" />
              <span>We are here to assist you</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000E28] dark:text-white tracking-tight leading-tight mb-4">
              Get in Touch with <span className="text-[#0050CB] dark:text-[#38BDF8]">GGPS School</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Have questions regarding admissions, kindergarten programs, or campus facilities? Contact our administrative desk or plan a campus tour today.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT WORKSPACE */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: CAMPUS CONTACT INFO */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Cards */}
            <div className="bg-white dark:bg-[#001438] rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
              <h2 className="text-base font-black text-[#000E28] dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0050CB]" /> Campus Information
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#000E28] dark:text-white">Campus Address</h3>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">
                      GGPS School Campus, 123 Education Boulevard, Chennai, Tamil Nadu – 600001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#FF690C] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#000E28] dark:text-white">Admissions Helpline</h3>
                    <p className="font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                      +91 98401 22334 / +91 98401 22335
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0050CB] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#000E28] dark:text-white">Official Email</h3>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                      admissions@ggps.edu / contact@ggps.edu
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#000E28] dark:text-white">Visiting & Desk Hours</h3>
                    <p className="text-slate-500 mt-0.5">
                      Monday to Saturday: 8:30 AM – 4:30 PM (Sunday Closed)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admission Callout */}
            <div className="p-6 rounded-2xl bg-[#E5EEFF]/80 dark:bg-[#001D4D]/60 border border-blue-200/90 dark:border-blue-900/60 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0050CB] dark:text-[#38BDF8]">
                Prospective Admissions
              </span>
              <h3 className="text-sm font-black text-[#000E28] dark:text-white">
                Looking for 2026–27 Kindergarten Admission?
              </h3>
              <p className="text-xs text-slate-600 dark:text-blue-200 leading-relaxed">
                Submit an official enquiry directly to our admissions team for faster counselling and campus visit scheduling.
              </p>
              <Link
                href="/enquire"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs shadow-md shadow-[#0050CB]/20 transition-all cursor-pointer"
              >
                <span>✦ Start Admission Enquiry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#001438] rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-xl">
              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-[#000E28] dark:text-white">
                    Message Sent Successfully
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Thank you for reaching out. Our administrative team will review your inquiry and get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#0050CB] text-white font-bold text-xs"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-2">
                    <h2 className="text-xl font-black text-[#000E28] dark:text-white">
                      Send a Message
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fill out the form below and we will respond within 24 hours.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Your Full Name <span className="text-[#FF690C]">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="e.g. Meera Raman"
                        {...register("name")}
                        onKeyDown={preventNonAlphaKey}
                        onChange={(e) => setValue("name", sanitizeNameInput(e.target.value), { shouldValidate: true })}
                        onPaste={(e) => handleNamePaste(e, (v) => setValue("name", v, { shouldValidate: true }))}
                        className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none transition-all ${
                          errors.name
                            ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                            : "border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                        }`}
                      />
                      {errors.name && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number <span className="text-[#FF690C]">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="9840123456"
                        maxLength={10}
                        {...register("phone")}
                        onKeyDown={preventNonNumericKey}
                        onChange={(e) => setValue("phone", sanitizePhoneInput(e.target.value), { shouldValidate: true })}
                        onPaste={(e) => handlePhonePaste(e, (v) => setValue("phone", v, { shouldValidate: true }))}
                        className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none transition-all ${
                          errors.phone
                            ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                            : "border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                        }`}
                      />
                      {errors.phone && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address <span className="text-[#FF690C]">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="meera@example.com"
                        {...register("email")}
                        className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none transition-all ${
                          errors.email
                            ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                            : "border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                        }`}
                      />
                      {errors.email && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Subject <span className="text-[#FF690C]">*</span>
                      </label>
                      <input
                        id="subject"
                        type="text"
                        placeholder="e.g. Campus Visit / Curriculum Inquiry"
                        {...register("subject")}
                        className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none transition-all ${
                          errors.subject
                            ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                            : "border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                        }`}
                      />
                      {errors.subject && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.subject.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Message <span className="text-[#FF690C]">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Please write your questions or comments here..."
                      {...register("message")}
                      className={`w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none transition-all resize-none ${
                        errors.message
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-500/15"
                          : "border-slate-200 dark:border-slate-700 focus:border-[#0050CB] focus:ring-2 focus:ring-[#0050CB]/15"
                      }`}
                    />
                    {errors.message && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0050CB]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span>Sending message...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
