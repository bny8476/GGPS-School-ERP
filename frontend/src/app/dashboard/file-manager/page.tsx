"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Folder, File, Upload, Download, Trash2, Search, 
  HardDrive, Share2, Eye, RefreshCw, Plus, ShieldCheck, 
  FileSpreadsheet, Image as ImageIcon, FileText, CheckCircle2 
} from "lucide-react";
import EmergencyBanner from "@/components/ui/EmergencyBanner";
import FileUploadModal from "@/components/common/FileUploadModal";
import FilePreviewModal, { PreviewableFile } from "@/components/common/FilePreviewModal";
import { downloadFile } from "@/lib/fileDownload";
import toast from "react-hot-toast";

interface CloudFile {
  _id: string;
  originalName: string;
  storedName: string;
  category: string;
  size: number;
  mimeType: string;
  extension: string;
  url: string;
  verificationStatus?: string;
  createdAt: string;
  uploadedBy?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export default function FileManagerPage() {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const folders = [
    { key: "all", label: "All Folders" },
    { key: "students", label: "Students" },
    { key: "admissions", label: "Admissions" },
    { key: "teachers", label: "Teachers & Staff" },
    { key: "fees", label: "Fees & Finance" },
    { key: "reports", label: "Reports" },
    { key: "certificates", label: "Certificates" },
    { key: "general", label: "General Docs" },
  ];

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let url = `${apiBase}/api/v1/files?limit=100`;
      if (selectedFolder !== "all") {
        url += `&category=${selectedFolder}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const json = await res.json();
        setFiles(json.data || []);
      } else {
        toast.error("Failed to load cloud files from repository.");
      }
    } catch (err: any) {
      console.error("Fetch files error:", err);
      toast.error("Network error loading files.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFolder, searchQuery]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDownload = async (file: CloudFile) => {
    setDownloadingId(file._id);
    await downloadFile(file._id, file.originalName);
    setDownloadingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${apiBase}/api/v1/files/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        toast.success(`Deleted "${name}"`);
        setFiles((prev) => prev.filter((f) => f._id !== id));
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to delete file.");
      }
    } catch {
      toast.error("Network error while deleting file.");
    }
  };

  const handleShare = (file: CloudFile) => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    const shareUrl = `${apiBase}/api/v1/files/${file._id}/download`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success(`Secure download URL for "${file.originalName}" copied to clipboard!`);
    } else {
      toast.success(`File link ready: ${file.originalName}`);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mime: string, ext: string) => {
    if (mime?.includes("pdf") || ext === ".pdf") return <FileText className="w-5 h-5 text-rose-500" />;
    if (mime?.includes("sheet") || ext === ".xlsx" || ext === ".csv") return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    if (mime?.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return <ImageIcon className="w-5 h-5 text-[#0050CB]" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <EmergencyBanner />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#000E28] dark:text-white flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-[#0050CB] dark:text-[#38BDF8]" />
            Digital File Manager & Cloud Documents
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
            Centralized document storage, syllabus distribution, verified student archives, and secure streaming.
          </p>
        </div>

        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="px-5 py-2.5 bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by file or student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#000E28] text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
          />
        </div>

        {/* Folder / Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {folders.map((folder) => {
            const isActive = selectedFolder === folder.key;
            return (
              <button
                key={folder.key}
                onClick={() => setSelectedFolder(folder.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#0050CB] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{folder.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* File List Grid & Table */}
      <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0050CB] mx-auto" />
            <p className="text-xs font-bold text-slate-500">Querying verified documents repository...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Folder className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No documents found</h3>
            <p className="text-xs text-slate-400">Upload documents or adjust search filters to locate records.</p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-2 px-4 py-2 bg-[#0050CB] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload First File</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-[#000E28]/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Document Name</th>
                  <th className="py-3.5 px-3">Vault / Category</th>
                  <th className="py-3.5 px-3">Size</th>
                  <th className="py-3.5 px-3">Uploaded Date</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {files.map((file) => {
                  const isDownloading = downloadingId === file._id;

                  return (
                    <tr key={file._id} className="hover:bg-slate-50/60 dark:hover:bg-[#000E28]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0">
                            {getFileIcon(file.mimeType, file.extension)}
                          </div>
                          <div className="truncate max-w-[280px]">
                            <p className="font-bold text-[#000E28] dark:text-white truncate">
                              {file.originalName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{file.storedName}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#60A5FA] capitalize">
                          {file.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {formatSize(file.size)}
                      </td>

                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(file.createdAt).toLocaleDateString("en-GB")}
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          file.verificationStatus === "Verified"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : file.verificationStatus === "Rejected"
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-blue-50 text-[#0050CB] border border-blue-200"
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {file.verificationStatus || "Verified"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Button */}
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0050CB] hover:bg-[#E5EEFF] transition-colors cursor-pointer"
                            title="Preview file"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Download Button */}
                          <button
                            onClick={() => handleDownload(file)}
                            disabled={isDownloading}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0050CB] hover:bg-[#E5EEFF] transition-colors cursor-pointer"
                            title="Download file"
                          >
                            {isDownloading ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-[#0050CB]" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>

                          {/* Share Link */}
                          <button
                            onClick={() => handleShare(file)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0050CB] hover:bg-[#E5EEFF] transition-colors cursor-pointer"
                            title="Copy share link"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(file._id, file.originalName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Real Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultCategory={selectedFolder === "all" ? "general" : selectedFolder}
        onSuccess={() => fetchFiles()}
      />

      {/* Real Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
