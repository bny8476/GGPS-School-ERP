'use client';

import React, { useState } from 'react';
import { Database, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import { downloadFile } from '@/lib/fileDownload';
import toast from 'react-hot-toast';

export default function ImportExportPage() {
  const [selectedEntity, setSelectedEntity] = useState('students');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setImporting(true);
    setImportStatus(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const formData = new FormData();
      formData.append('file', file);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

      const res = await fetch(`${apiBase}/api/v1/import-export/import/${selectedEntity}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Import failed with status ${res.status}`);
      }

      setImportStatus({
        success: true,
        message: data.message || `Successfully processed and ingested ${data.recordsImported || data.processedCount || 'all'} records into ${selectedEntity.toUpperCase()} repository.`,
      });
      setFile(null);
      toast.success(`Import to ${selectedEntity} completed!`);
    } catch (err: any) {
      setImportStatus({
        success: false,
        message: err.message || 'Error occurred while processing file import.',
      });
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    await downloadFile(`/api/v1/import-export/template/${selectedEntity}`, `GGPS_${selectedEntity}_template.csv`);
  };

  const handleExport = async (endpoint: string, fallbackName: string) => {
    await downloadFile(endpoint, fallbackName);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <EmergencyBanner />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#000E28] dark:text-white flex items-center gap-3">
          <Database className="w-8 h-8 text-[#0050CB]" />
          Bulk Data Import & Export Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          GGPS School ERP • Batch CSV/Excel Ingestion, Dual-Layer Validation Mapping & Live Database Exports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IMPORT SECTION */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-[#000E28] dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#0050CB]" /> Bulk File Ingestion
            </h2>
            <button
              onClick={handleDownloadTemplate}
              className="text-xs font-semibold text-[#0050CB] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download Template
            </button>
          </div>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#000E28] dark:text-slate-300 mb-1">Target Entity</label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
              >
                <option value="students">Students Master Directory</option>
                <option value="teachers">Faculty & Staff Directory</option>
                <option value="fees">Fee Structures & Ledger</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center space-y-2 hover:border-[#0050CB] transition-colors bg-slate-50/50 dark:bg-slate-800/40">
              <FileSpreadsheet className="w-10 h-10 text-[#0050CB] mx-auto opacity-70" />
              <div className="text-sm font-semibold text-[#000E28] dark:text-slate-200">
                {file ? file.name : 'Click to select CSV or XLSX file'}
              </div>
              <p className="text-xs text-slate-400">Supported formats: .csv, .xlsx (Max 25MB)</p>
              <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="hidden" id="csv-upload" />
              <label
                htmlFor="csv-upload"
                className="inline-block cursor-pointer px-4 py-2 bg-[#E5EEFF] text-xs font-bold rounded-xl text-[#0050CB] hover:bg-[#d0e2ff] transition-colors"
              >
                Browse Files
              </label>
            </div>

            <button
              type="submit"
              disabled={!file || importing}
              className="w-full flex items-center justify-center gap-2 bg-[#0050CB] hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {importing ? 'Validating & Importing...' : 'Import Data'}
            </button>
          </form>

          {importStatus && (
            <div
              className={`p-4 rounded-xl flex items-start gap-3 text-xs font-semibold ${
                importStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              )}
              <div>{importStatus.message}</div>
            </div>
          )}
        </div>

        {/* EXPORT SECTION */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h2 className="font-bold text-lg text-[#000E28] dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-[#0050CB]" /> Export Live System Records
          </h2>
          <p className="text-xs text-slate-500">
            Generate server-authenticated, formatted CSV and spreadsheet exports directly from the live school database.
          </p>

          <div className="space-y-3 pt-2">
            {[
              {
                title: 'Full Student Roster (All Grades)',
                format: 'Live CSV Export',
                endpoint: '/api/v1/import-export/export/students?format=csv',
                filename: 'GGPS-Students-Roster.csv',
              },
              {
                title: 'Fee Collection Ledger',
                format: 'Financial CSV Export',
                endpoint: '/api/v1/finance/export?format=csv',
                filename: 'GGPS-Fee-Collection-Ledger.csv',
              },
              {
                title: 'Staff & Faculty Directory',
                format: 'HR Directory CSV',
                endpoint: '/api/v1/import-export/export/teachers?format=csv',
                filename: 'GGPS-Faculty-Staff-Directory.csv',
              },
              {
                title: 'System Activity & Audit Log',
                format: 'Security Audit Log CSV',
                endpoint: '/api/v1/reports/export/system?format=csv',
                filename: 'GGPS-System-Audit-Log.csv',
              },
            ].map((exp, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-[#0050CB]/30 transition-colors"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#000E28] dark:text-white">{exp.title}</h4>
                  <span className="text-xs text-slate-400">{exp.format}</span>
                </div>
                <button
                  onClick={() => handleExport(exp.endpoint, exp.filename)}
                  className="flex items-center gap-1.5 text-xs font-bold bg-[#E5EEFF] text-[#0050CB] hover:bg-[#0050CB] hover:text-white border border-[#0050CB]/20 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
