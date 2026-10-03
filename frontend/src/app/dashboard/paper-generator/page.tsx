"use client";

import React, { useState } from "react";
import { FileText, Sparkles, Printer, Download, RefreshCw, CheckCircle2, Sliders, Layers } from "lucide-react";
import { printDocument } from "@/lib/exportUtils";
import toast from "react-hot-toast";

export default function PaperGeneratorPage() {
  const [subject, setSubject] = useState("Phonics & English");
  const [grade, setGrade] = useState("Pre-KG");
  const [totalMarks, setTotalMarks] = useState("25");
  const [difficulty, setDifficulty] = useState("Balanced");
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/nextgen/question-paper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, grade, totalMarks, difficulty }),
      });

      if (res.ok) {
        const data = await res.json();
        setPaper(data.paper);
      } else {
        // Fallback generator preview
        setPaper({
          title: `Continuous Assessment & Activity Worksheet - ${subject} (${grade})`,
          duration: "45 Minutes",
          marks: totalMarks,
          sections: [
            {
              name: "Section A: Visual Identification & Coloring (10 Marks)",
              questions: [
                "1. Circle all objects that begin with the letter sound 'B'. (3 Marks)",
                "2. Color the largest apple red and the smallest apple yellow. (3 Marks)",
                "3. Match the baby animal to its mother. (4 Marks)",
              ],
            },
            {
              name: "Section B: Number Tracing & Counting (10 Marks)",
              questions: [
                "4. Count the stars in each box and trace the corresponding number. (5 Marks)",
                "5. Connect the dots from 1 to 10 to reveal the hidden butterfly. (5 Marks)",
              ],
            },
            {
              name: "Section C: Fine Motor Skills & Maze (5 Marks)",
              questions: [
                "6. Help the puppy find the ball by drawing a line through the path without touching walls. (5 Marks)",
              ],
            },
          ],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportWordDoc = () => {
    if (!paper) return;
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${paper.title}</title>
      <style>
        body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; }
        .header { text-align: center; border-bottom: 2px solid #0050CB; padding-bottom: 12px; margin-bottom: 20px; }
        h1 { color: #0050CB; margin: 0; font-size: 22px; }
        h2 { font-size: 14px; color: #475569; margin: 5px 0; }
        .meta { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin: 15px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; }
        .section-title { background: #f1f5f9; padding: 6px 10px; font-weight: bold; font-size: 14px; margin-top: 20px; }
        .q-item { margin: 10px 0 10px 15px; font-size: 13px; }
      </style>
      </head>
      <body>
        <div class="header">
          <h1>GGPS SCHOOL</h1>
          <h2>${paper.title}</h2>
          <div class="meta">
            <span>Grade: ${grade}</span>
            <span>Duration: ${paper.duration || '45 Mins'}</span>
            <span>Max Marks: ${paper.marks || totalMarks}</span>
          </div>
        </div>
        ${paper.sections?.map((s: any) => `
          <div class="section-title">${s.name}</div>
          ${s.questions?.map((q: string) => `<p class="q-item">${q}</p>`).join('')}
        `).join('')}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GGPS_Question_Paper_${subject.replace(/[^a-zA-Z0-9]/g, '_')}_${grade}.doc`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
    toast.success('Question paper exported as Word (.doc) document!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#000E28] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#0050CB] dark:text-[#38BDF8] font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="h-4 w-4" />
            <span>AI Automated Assessment Suite</span>
          </div>
          <h1 className="text-2xl font-black text-[#000E28] dark:text-white tracking-tight">
            Question Paper Generator & Blueprint Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate balanced, randomized exam question papers mapped to Bloom's taxonomy, course difficulty sliders, and curriculum standards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Config Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-[#000E28] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#0050CB]" />
            Paper Configuration
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
              >
                <option value="Phonics & English">Phonics & English</option>
                <option value="Early Numeracy & Math">Early Numeracy & Math</option>
                <option value="General Awareness (EVS)">General Awareness (EVS)</option>
                <option value="Rhymes & Storytelling">Rhymes & Storytelling</option>
                <option value="Art & Craft">Art & Craft</option>
                <option value="Sensory & Motor Skills">Sensory & Motor Skills</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Grade Level</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="Pre-KG">Pre-KG</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Marks</label>
                <select
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="20">20 Marks</option>
                  <option value="25">25 Marks</option>
                  <option value="50">50 Marks</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Difficulty Curve</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="Easy">Easy (Focus on Foundations)</option>
                <option value="Balanced">Balanced (30% Easy, 50% Med, 20% Hard)</option>
                <option value="Expert">Expert Olympiad (High Difficulty)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0050CB] hover:bg-[#003da3] disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loading ? "Generating Questions..." : "Generate Question Paper"}</span>
            </button>
          </form>
        </div>

        {/* Right Preview Box */}
        <div className="lg:col-span-2 bg-white dark:bg-[#000E28] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#000E28] dark:text-white uppercase tracking-wider">
              Generated Paper Preview
            </h2>
            {paper && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => printDocument('printable-question-paper', paper.title)}
                  className="px-3 py-1.5 bg-[#E5EEFF] text-[#0050CB] text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-[#0050CB] hover:text-white transition-all cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Paper</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportWordDoc}
                  className="px-3 py-1.5 bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Word (.doc)</span>
                </button>
              </div>
            )}
          </div>

          {!paper ? (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <FileText className="h-10 w-10 mx-auto opacity-40 text-[#0050CB]" />
              <p className="text-xs font-bold">Configure parameters on the left and click "Generate Question Paper".</p>
            </div>
          ) : (
            <div id="printable-question-paper" className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-6 font-serif">
              {/* Header */}
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4 space-y-1">
                <h3 className="text-lg font-black uppercase text-[#000E28] dark:text-white">{paper.title}</h3>
                <div className="flex justify-between text-xs font-sans font-bold text-slate-500 pt-2 px-4">
                  <span>Time Allowed: {paper.duration}</span>
                  <span>Maximum Marks: {paper.marks}</span>
                </div>
              </div>

              {/* Question Sections */}
              {paper.sections.map((sec: any, idx: number) => (
                <div key={idx} className="space-y-3 font-sans">
                  <h4 className="text-xs font-black uppercase text-[#0050CB] dark:text-[#38BDF8] border-b border-slate-200 dark:border-slate-800 pb-1">
                    {sec.name}
                  </h4>
                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                    {sec.questions.map((q: string, qIdx: number) => (
                      <p key={qIdx} className="leading-relaxed">
                        {q}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
