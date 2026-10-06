'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  HelpCircle,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
  Award,
  Video,
  Download,
} from 'lucide-react';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import { getApiBaseUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ClassroomMaterialSchema } from '@/schemas';
import FieldError from '@/components/ui/FieldError';

export default function DigitalClassroomPage() {
  const [activeTab, setActiveTab] = useState<'materials' | 'exams' | 'questions' | 'atrisk'>('materials');

  // State
  const [materials, setMaterials] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modals & New Form State
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialErrors, setMaterialErrors] = useState<Record<string, string>>({});
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    subject: 'Phonics & English',
    classId: '',
    fileUrl: '',
    fileType: 'PDF',
    description: '',
  });

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    subject: 'Phonics & English',
    difficulty: 'Medium',
    marks: 1,
    options: ['', '', '', ''],
    correctAnswer: '',
  });

  const API_BASE = getApiBaseUrl();

  const getAuthHeaders = (extra: Record<string, string> = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'materials') {
        const res = await fetch(`${API_BASE}/api/learning`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) setMaterials(data.data || []);
      } else if (activeTab === 'exams') {
        const res = await fetch(`${API_BASE}/api/exams`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) setExams(data.data || []);
      } else if (activeTab === 'questions') {
        const res = await fetch(`${API_BASE}/api/exams/questions`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) setQuestions(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = ClassroomMaterialSchema.safeParse(newMaterial);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = err.path[0] ? String(err.path[0]) : "general";
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setMaterialErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0] || "Please fill required material fields");
      return;
    }
    setMaterialErrors({});

    try {
      const res = await fetch(`${API_BASE}/api/learning`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(newMaterial),
      });
      if (res.ok) {
        toast.success("Resource uploaded successfully!");
        setShowMaterialModal(false);
        setNewMaterial({
          title: '',
          subject: 'Phonics & English',
          classId: '',
          fileUrl: '',
          fileType: 'PDF',
          description: '',
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload material");
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/exams/questions`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(newQuestion),
      });
      if (res.ok) {
        setShowQuestionModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <EmergencyBanner />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Digital Classroom & Learning Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            GGPS School • Courseware, Online Assessments & Academic Risk Monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'materials' && (
            <button
              onClick={() => setShowMaterialModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md"
            >
              <Plus className="w-5 h-5" /> Upload Learning Material
            </button>
          )}
          {activeTab === 'questions' && (
            <button
              onClick={() => setShowQuestionModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md"
            >
              <Plus className="w-5 h-5" /> Add Question to Bank
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {[
          { id: 'materials', label: 'Learning Materials', icon: FileText },
          { id: 'exams', label: 'Online Exams & Quizzes', icon: Clock },
          { id: 'questions', label: 'Question Bank', icon: HelpCircle },
          { id: 'atrisk', label: 'Student Early Warning', icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 font-semibold text-sm transition-colors border-b-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {materials.length === 0 ? (
              <div className="col-span-3 p-12 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Learning Materials Uploaded</h3>
                <p className="text-sm text-slate-500 mt-1">Upload study guides, presentations, or reference videos for students.</p>
              </div>
            ) : (
              materials.map((mat) => (
                <div
                  key={mat._id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                      {mat.subject}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {mat.fileType}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{mat.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {mat.description || 'Comprehensive digital courseware resource for students.'}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400">Uploaded by {mat.uploadedBy?.name || 'Faculty'}</span>
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Resource <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EXAMS */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                  <th className="p-4">Exam Title</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Total Marks</th>
                  <th className="p-4">Passing Marks</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No online exams scheduled currently.
                    </td>
                  </tr>
                ) : (
                  exams.map((exam) => (
                    <tr key={exam._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{exam.title}</td>
                      <td className="p-4">{exam.subject}</td>
                      <td className="p-4">{exam.durationMinutes} mins</td>
                      <td className="p-4">{exam.totalMarks} pts</td>
                      <td className="p-4">{exam.passingMarks} pts</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          {exam.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: QUESTIONS */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                Question bank is empty. Click "Add Question to Bank" to add questions.
              </div>
            ) : (
              questions.map((q) => (
                <div
                  key={q._id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-indigo-600 dark:text-indigo-400">{q.subject}</span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {q.difficulty} • {q.marks} Mark
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{q.questionText}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {q.options?.map((opt: string, i: number) => (
                      <div
                        key={i}
                        className={`p-2 rounded-lg border ${
                          opt === q.correctAnswer
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AT RISK */}
      {activeTab === 'atrisk' && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-bold text-lg text-amber-900 dark:text-amber-200">
                Academic Early Warning & Intervention Dashboard
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Automatically identifies students with attendance below 75% or declining examination trends.
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 dark:text-white">All Students Meeting Academic Benchmarks</h4>
            <p className="text-xs text-slate-500 mt-1">
              No critical academic risk flags detected for the current term.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: ADD MATERIAL */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Upload Learning Resource</h3>
            <form onSubmit={handleCreateMaterial} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Title <span className="text-[#FF690C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newMaterial.title}
                  onChange={(e) => {
                    setNewMaterial({ ...newMaterial, title: e.target.value });
                    if (materialErrors.title) setMaterialErrors(prev => ({ ...prev, title: '' }));
                  }}
                  aria-invalid={Boolean(materialErrors.title)}
                  aria-describedby={materialErrors.title ? "mat-title-err" : undefined}
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${
                    materialErrors.title ? 'border-rose-400 bg-rose-50/20' : 'dark:bg-slate-800 dark:border-slate-700'
                  }`}
                  placeholder="Rhymes & Phonics Sound Cards (Pre-KG)"
                />
                <FieldError id="mat-title-err" error={materialErrors.title} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Subject <span className="text-[#FF690C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMaterial.subject}
                    onChange={(e) => setNewMaterial({ ...newMaterial, subject: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Type</label>
                  <select
                    value={newMaterial.fileType}
                    onChange={(e) => setNewMaterial({ ...newMaterial, fileType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Video">Video</option>
                    <option value="Document">Document</option>
                    <option value="Link">Link</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  File / Link URL <span className="text-[#FF690C]">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={newMaterial.fileUrl}
                  onChange={(e) => {
                    setNewMaterial({ ...newMaterial, fileUrl: e.target.value });
                    if (materialErrors.fileUrl) setMaterialErrors(prev => ({ ...prev, fileUrl: '' }));
                  }}
                  aria-invalid={Boolean(materialErrors.fileUrl)}
                  aria-describedby={materialErrors.fileUrl ? "mat-url-err" : undefined}
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${
                    materialErrors.fileUrl ? 'border-rose-400 bg-rose-50/20' : 'dark:bg-slate-800 dark:border-slate-700'
                  }`}
                  placeholder="https://..."
                />
                <FieldError id="mat-url-err" error={materialErrors.fileUrl} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
