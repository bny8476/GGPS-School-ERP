"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, HelpCircle, Award, Play, Plus, BookOpen, X, Check } from "lucide-react";
import EmergencyBanner from "@/components/ui/EmergencyBanner";
import toast from "react-hot-toast";
import { OnlineExamCreationSchema } from "@/schemas";
import FieldError from "@/components/ui/FieldError";

export default function OnlineExamsPage() {
  const [exams, setExams] = useState([
    { id: 1, title: "Pre-KG Phonics & Alphabet Recognition Quiz", duration: "20 Minutes", totalQuestions: 15, passingScore: "70%", status: "Active" },
    { id: 2, title: "LKG Early Numeracy & Shape Identification", duration: "25 Minutes", totalQuestions: 20, passingScore: "65%", status: "Scheduled" },
    { id: 3, title: "UKG General Awareness & Environmental Fun Test", duration: "30 Minutes", totalQuestions: 20, passingScore: "75%", status: "Completed" },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [examErrors, setExamErrors] = useState<Record<string, string>>({});

  // Form states
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("45 Minutes");
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [passingScore, setPassingScore] = useState("70%");
  const [status, setStatus] = useState("Active");

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = OnlineExamCreationSchema.safeParse({
      title,
      duration,
      totalQuestions,
      passingScore,
      status,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : "general";
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setExamErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || "Please fix exam configuration");
      return;
    }
    setExamErrors({});

    const newExam = {
      id: Date.now(),
      title: title.trim(),
      duration,
      totalQuestions: Number(totalQuestions) || 20,
      passingScore,
      status
    };
    setExams(prev => [newExam, ...prev]);
    toast.success(`Exam "${title.trim()}" configured successfully!`);
    setTitle("");
    setExamErrors({});
    setShowCreateModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <EmergencyBanner />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#000E28] dark:text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#0050CB] dark:text-[#38BDF8]" />
            Online Examination Engine & Question Bank
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
            Configure computerized tests, MCQ question banks, auto-grading, and anti-cheating timers.
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Online Exam</span>
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white dark:bg-[#000E28] border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                  exam.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {exam.status}
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {exam.duration}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">{exam.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5 text-[#0050CB]" /> {exam.totalQuestions} Questions</span>
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-500" /> Pass: {exam.passingScore}</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedExam(exam)}
              className="w-full py-2.5 bg-[#E5EEFF] hover:bg-[#0050CB] text-[#0050CB] hover:text-white dark:bg-[#0050CB]/20 dark:text-[#38BDF8] dark:hover:bg-[#0050CB] dark:hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>{exam.status === 'Active' ? 'Launch Exam Portal' : 'View Test Details'}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0050CB] dark:text-[#38BDF8]" />
                <h2 className="text-base font-black text-[#000E28] dark:text-white">Create Online Assessment</h2>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Exam Title / Subject <span className="text-[#FF690C]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (examErrors.title) setExamErrors(prev => ({ ...prev, title: '' }));
                  }}
                  aria-invalid={Boolean(examErrors.title)}
                  aria-describedby={examErrors.title ? "exam-title-err" : undefined}
                  placeholder="e.g. UKG Phonics & Sight Words Assessment"
                  required
                  className={`w-full mt-1 px-3.5 py-2 rounded-xl border ${
                    examErrors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  } outline-none focus:ring-2 focus:ring-[#0050CB] font-bold`}
                />
                <FieldError id="exam-title-err" error={examErrors.title} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  >
                    <option value="30 Minutes">30 Minutes</option>
                    <option value="45 Minutes">45 Minutes</option>
                    <option value="60 Minutes">60 Minutes</option>
                    <option value="90 Minutes">90 Minutes</option>
                    <option value="120 Minutes">120 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Total Questions <span className="text-[#FF690C]">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={totalQuestions}
                    onChange={(e) => {
                      setTotalQuestions(Number(e.target.value));
                      if (examErrors.totalQuestions) setExamErrors(prev => ({ ...prev, totalQuestions: '' }));
                    }}
                    aria-invalid={Boolean(examErrors.totalQuestions)}
                    aria-describedby={examErrors.totalQuestions ? "exam-total-err" : undefined}
                    className={`w-full mt-1 px-3 py-2 rounded-xl border ${
                      examErrors.totalQuestions ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    } outline-none font-bold`}
                  />
                  <FieldError id="exam-total-err" error={examErrors.totalQuestions} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Passing Score</label>
                  <select
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  >
                    <option value="50%">50%</option>
                    <option value="60%">60%</option>
                    <option value="65%">65%</option>
                    <option value="70%">70%</option>
                    <option value="75%">75%</option>
                    <option value="80%">80%</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Publish Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Portal Details Modal */}
      {selectedExam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#000E28] w-full max-w-lg p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-[#0050CB] dark:text-[#38BDF8]" />
                <h2 className="text-base font-black text-[#000E28] dark:text-white">Exam Portal Control</h2>
              </div>
              <button 
                onClick={() => setSelectedExam(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <h3 className="font-extrabold text-sm text-[#000E28] dark:text-white">{selectedExam.title}</h3>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 pt-1">
                  <div><strong>Duration:</strong> {selectedExam.duration}</div>
                  <div><strong>Total Questions:</strong> {selectedExam.totalQuestions}</div>
                  <div><strong>Pass Requirement:</strong> {selectedExam.passingScore}</div>
                  <div><strong>Portal Status:</strong> <span className="text-[#0050CB] font-bold">{selectedExam.status}</span></div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50 space-y-1">
                <p className="font-bold text-blue-700 dark:text-blue-300 text-[11px]">Proctoring & System Instructions:</p>
                <ul className="list-disc pl-4 text-[10px] text-slate-600 dark:text-slate-300 space-y-0.5">
                  <li>Full screen lock mode will be enforced once the test session initiates.</li>
                  <li>Tab switching and window blur triggers an automated warning flag.</li>
                  <li>Auto-submission will execute immediately once the {selectedExam.duration} countdown concludes.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Exam session initialized for "${selectedExam.title}"!`);
                  setSelectedExam(null);
                }}
                className="px-4 py-2 bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold rounded-xl shadow-xs cursor-pointer text-xs transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Begin Test Simulation</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedExam(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
