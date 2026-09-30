"use client";

import React from 'react';
import { 
  X, Download, Printer, FileText, Image as ImageIcon, 
  FileSpreadsheet, ExternalLink, ShieldCheck, AlertCircle, FileCheck 
} from 'lucide-react';
import { downloadFile } from '@/lib/fileDownload';
import { printDocument } from '@/lib/exportUtils';
import toast from 'react-hot-toast';

export interface PreviewableFile {
  _id?: string;
  id?: string;
  name?: string;
  originalName?: string;
  title?: string;
  mimeType?: string;
  size?: number | string;
  url?: string;
  category?: string;
  verificationStatus?: string;
  createdAt?: string | Date;
  checksum?: string;
}

interface FilePreviewModalProps {
  file: PreviewableFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilePreviewModal({
  file,
  isOpen,
  onClose,
}: FilePreviewModalProps) {
  if (!isOpen || !file) return null;

  const fileName = file.originalName || file.name || file.title || 'GGPS-Document.pdf';
  const fileId = file._id || file.id || '';
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  let previewUrl = file.url || '';
  if (fileId && (!previewUrl || previewUrl.includes('download'))) {
    previewUrl = `${apiBase}/api/v1/files/${fileId}/preview`;
  } else if (previewUrl && !previewUrl.startsWith('http')) {
    previewUrl = `${apiBase}${previewUrl}`;
  }

  // Determine media category
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const isPDF = ext === 'pdf' || file.mimeType?.includes('pdf');
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext) || file.mimeType?.startsWith('image/');
  const isSpreadsheet = ['xls', 'xlsx', 'csv'].includes(ext) || file.mimeType?.includes('sheet') || file.mimeType?.includes('csv');

  const handleDownloadClick = async () => {
    const downloadTarget = fileId ? fileId : (file.url || '');
    await downloadFile(downloadTarget, fileName);
  };

  const handlePrintClick = () => {
    if (isImage) {
      printDocument('preview-image-container', fileName);
    } else {
      window.open(previewUrl, '_blank')?.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#001438] rounded-[28px] max-w-5xl w-full h-[88vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#001438]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] shrink-0">
              {isPDF ? <FileText className="w-5 h-5" /> : isImage ? <ImageIcon className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <h3 className="font-black text-sm text-[#000E28] dark:text-white truncate">
                {fileName}
              </h3>
              <p className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>{file.category ? `Vault: ${file.category}` : 'Official Record'}</span>
                {file.verificationStatus && (
                  <span className={`px-2 py-0.2 rounded-full font-bold text-[9px] ${
                    file.verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                    file.verificationStatus === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                    'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {file.verificationStatus}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrintClick}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Print document"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadClick}
              className="px-3.5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white transition-all shadow-xs flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Viewport */}
        <div className="flex-1 bg-slate-100 dark:bg-[#000E28]/80 p-4 overflow-auto flex items-center justify-center">
          {isPDF ? (
            <iframe
              src={previewUrl}
              className="w-full h-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white"
              title={fileName}
            />
          ) : isImage ? (
            <div id="preview-image-container" className="flex items-center justify-center max-h-full max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={fileName}
                className="max-h-[72vh] max-w-full object-contain rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800"
              />
            </div>
          ) : (
            /* Document Card for DOCX, XLSX, PPT, ZIP, etc. */
            <div className="bg-white dark:bg-[#001438] rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] mx-auto flex items-center justify-center">
                {isSpreadsheet ? <FileSpreadsheet className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
              </div>

              <div>
                <h4 className="font-black text-base text-[#000E28] dark:text-white break-words">{fileName}</h4>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">
                  {ext.toUpperCase()} DOCUMENT ARCHIVE
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#000E28] rounded-2xl p-4 text-left text-xs space-y-2 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>File Size:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {typeof file.size === 'number' ? `${(file.size / 1024).toFixed(1)} KB` : file.size || 'Standard'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Format:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{file.mimeType || ext.toUpperCase()}</span>
                </div>
                {file.checksum && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Checksum:</span>
                    <span className="font-mono text-[10px] text-slate-500 truncate max-w-[180px]">{file.checksum}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleDownloadClick}
                className="w-full py-3 rounded-xl bg-[#0050CB] hover:bg-[#0041A8] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download & Open on Device</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
