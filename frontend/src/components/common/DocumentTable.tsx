"use client";

import React, { useState } from 'react';
import { 
  FileText, Download, Eye, Trash2, RefreshCw, 
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck, 
  MoreVertical, FileSpreadsheet, Image as ImageIcon, Calendar, Clock 
} from 'lucide-react';
import { downloadFile } from '@/lib/fileDownload';
import toast from 'react-hot-toast';

export interface DocumentItem {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  originalName?: string;
  category?: string;
  mimeType?: string;
  extension?: string;
  size?: number | string;
  documentUrl?: string;
  url?: string;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected' | 'Replacement Required' | 'Expired';
  uploadedBy?: any;
  verifiedBy?: any;
  createdAt?: string | Date;
  expiryDate?: string | Date;
}

interface DocumentTableProps {
  documents: DocumentItem[];
  isLoading?: boolean;
  onPreview: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
  onVerify?: (doc: DocumentItem, status: 'Verified' | 'Rejected' | 'Replacement Required') => void;
  onReplace?: (doc: DocumentItem) => void;
  canVerify?: boolean;
  canDelete?: boolean;
}

export default function DocumentTable({
  documents,
  isLoading = false,
  onPreview,
  onDelete,
  onVerify,
  onReplace,
  canVerify = false,
  canDelete = false,
}: DocumentTableProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (doc: DocumentItem) => {
    const id = doc._id || doc.id || '';
    setDownloadingId(id);
    const targetUrl = doc.url || doc.documentUrl || id;
    const filename = doc.originalName || doc.name || doc.title || 'GGPS-Document.pdf';
    await downloadFile(targetUrl, filename);
    setDownloadingId(null);
  };

  const formatSize = (bytes: number | string | undefined) => {
    if (!bytes) return '—';
    if (typeof bytes === 'string' && bytes.includes('B')) return bytes;
    const num = Number(bytes);
    if (isNaN(num)) return String(bytes);
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'Replacement Required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" />
            Re-upload Req.
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-[#0050CB] border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800">
            <Clock className="w-3 h-3" />
            Pending Audit
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0050CB] mx-auto" />
        <p className="text-xs font-bold text-slate-500">Retrieving verified records from repository...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">No documents found</h4>
        <p className="text-xs text-slate-400">Upload or attach records into this category to view them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-[#001438]">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 dark:bg-[#000E28]/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Document Details</th>
              <th className="py-3.5 px-3">Category</th>
              <th className="py-3.5 px-3">Type & Size</th>
              <th className="py-3.5 px-3">Upload Date</th>
              <th className="py-3.5 px-3 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {documents.map((doc) => {
              const id = doc._id || doc.id || '';
              const title = doc.title || doc.originalName || doc.name || 'Untitled Document';
              const ext = (doc.originalName || doc.name || '').split('.').pop()?.toUpperCase() || 'PDF';
              const isDownloading = downloadingId === id;

              return (
                <tr key={id} className="hover:bg-slate-50/70 dark:hover:bg-[#000E28]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate max-w-[280px]">
                        <p className="font-bold text-[#000E28] dark:text-white truncate" title={title}>
                          {title}
                        </p>
                        {doc.originalName && doc.originalName !== title && (
                          <p className="text-[10px] text-slate-400 font-mono truncate">{doc.originalName}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-bold">
                    {doc.category || 'General'}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-200">
                      {ext}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-normal">
                      {formatSize(doc.size)}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-GB') : '—'}
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {getStatusBadge(doc.verificationStatus)}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Preview Button */}
                      <button
                        onClick={() => onPreview(doc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0050CB] hover:bg-[#E5EEFF] transition-colors cursor-pointer"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={isDownloading}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0050CB] hover:bg-[#E5EEFF] transition-colors cursor-pointer"
                        title="Download file"
                      >
                        {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin text-[#0050CB]" /> : <Download className="w-4 h-4" />}
                      </button>

                      {/* Verification Controls for Admins */}
                      {canVerify && onVerify && (
                        <>
                          <button
                            onClick={() => onVerify(doc, 'Verified')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Verify Document"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onVerify(doc, 'Rejected')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Reject Document"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Delete */}
                      {canDelete && onDelete && (
                        <button
                          onClick={() => onDelete(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE RESPONSIVE CARDS */}
      <div className="md:hidden space-y-3">
        {documents.map((doc) => {
          const id = doc._id || doc.id || '';
          const title = doc.title || doc.originalName || doc.name || 'Untitled Document';
          const ext = (doc.originalName || doc.name || '').split('.').pop()?.toUpperCase() || 'PDF';
          const isDownloading = downloadingId === id;

          return (
            <div
              key={id}
              className="bg-white dark:bg-[#001438] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-sm text-[#000E28] dark:text-white truncate">{title}</h4>
                    <p className="text-[10px] text-slate-400">{doc.category || 'General'} • {ext} • {formatSize(doc.size)}</p>
                  </div>
                </div>
                <div>{getStatusBadge(doc.verificationStatus)}</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <span>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-GB') : '—'}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreview(doc)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={isDownloading}
                    className="px-3 py-1.5 rounded-xl bg-[#0050CB] text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
