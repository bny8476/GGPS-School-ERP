"use client";

import React, { useState, useRef } from 'react';
import { 
  Upload, X, FileText, CheckCircle2, AlertCircle, 
  Trash2, RefreshCw, ShieldCheck, ArrowUpRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (fileRecord: any) => void;
  defaultCategory?: string;
  entityType?: string;
  entityId?: string;
  title?: string;
}

const ACCEPTED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', 
  '.jpg', '.jpeg', '.png', '.webp', '.svg', '.ppt', '.pptx', '.zip'
];

export default function FileUploadModal({
  isOpen,
  onClose,
  onSuccess,
  defaultCategory = 'general',
  entityType,
  entityId,
  title = 'Upload Document to Cloud Storage',
}: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateAndSetFile = (selectedFile: File) => {
    // 25MB max
    if (selectedFile.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds the 25MB maximum limit.');
      return;
    }

    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      toast.error(`File extension ${ext} is not supported. Please upload a PDF, DOCX, XLSX, Image, or ZIP.`);
      return;
    }

    setFile(selectedFile);
    if (!docTitle) {
      // Auto-populate human-friendly title from filename
      const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      setDocTitle(baseName.replace(/[_-]/g, ' '));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(15);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const formData = new FormData();
      formData.append('files', file);
      formData.append('category', category);
      formData.append('description', docTitle);
      if (entityType) formData.append('entityType', entityType);
      if (entityId) formData.append('entityId', entityId);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${apiBase}/api/v1/files/upload`, true);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 90);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(100);
          toast.success(`Successfully uploaded "${file.name}"`);
          try {
            const resData = JSON.parse(xhr.responseText);
            if (onSuccess) onSuccess(resData.data);
          } catch {
            if (onSuccess) onSuccess(null);
          }
          onClose();
          // Reset
          setFile(null);
          setDocTitle('');
          setUploadProgress(0);
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            toast.error(err.message || 'Upload failed');
          } catch {
            toast.error(`Upload failed with status ${xhr.status}`);
          }
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        toast.error('Network connection error during file upload.');
      };

      xhr.send(formData);
    } catch (err: any) {
      setUploading(false);
      toast.error(err.message || 'Failed to initialize upload.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#001438] rounded-[28px] max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#000E28] dark:text-white">{title}</h3>
              <p className="text-xs text-slate-500">Persistent storage with verified checksum & audit tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[#0050CB] bg-[#E5EEFF]/40 dark:bg-[#0050CB]/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-[#0050CB] bg-slate-50/50 dark:bg-slate-900/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
              className="hidden"
              accept={ACCEPTED_EXTENSIONS.join(',')}
            />

            <div className="w-12 h-12 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200">
                Click to browse or drag & drop document
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PDF, DOCX, XLSX, CSV, JPG, PNG, WEBP, ZIP (Up to 25 MB)
              </p>
            </div>
          </div>

          {/* Selected File Card */}
          {file && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <FileText className="w-5 h-5 text-[#0050CB] shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Binary'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Document Title */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Display Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Birth Certificate Verification"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#000E28] font-bold text-xs focus:ring-2 focus:ring-[#0050CB]"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Storage Category / Vault
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#000E28] font-bold text-xs cursor-pointer focus:ring-2 focus:ring-[#0050CB]"
            >
              <option value="students">Students Archive</option>
              <option value="admissions">Admissions & Enquiries</option>
              <option value="teachers">Teaching Staff</option>
              <option value="employees">Non-Teaching Employees</option>
              <option value="fees">Fees & Invoices</option>
              <option value="finance">Campus Finance & Payroll</option>
              <option value="certificates">Certificates & Awards</option>
              <option value="reports">Academic Reports</option>
              <option value="general">General Institution Repository</option>
            </select>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>Uploading to persistent storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0050CB] transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-5 py-2.5 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] disabled:opacity-50 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Upload...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Upload & Verify</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
