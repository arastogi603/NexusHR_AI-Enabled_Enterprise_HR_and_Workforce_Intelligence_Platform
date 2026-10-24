"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  FileCheck,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth.store";
import toast from "react-hot-toast";

interface DocumentItem {
  id: string;
  employeeId: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedBy: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

interface DocumentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

export function DocumentManagerModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
}: DocumentManagerModalProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.includes("ADMIN") || user?.role?.includes("SUPER_ADMIN");

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [selectedType, setSelectedType] = useState("AADHAAR");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const fetchDocuments = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const res = await api.get(`/employees/${employeeId}/documents`);
      setDocuments(res.data || []);
    } catch (err: any) {
      console.warn("Could not fetch documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchDocuments();
    }
  }, [isOpen, employeeId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      setFileToUpload(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("type", selectedType);
      formData.append("file", fileToUpload);

      await api.post(`/employees/${employeeId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`${selectedType} document uploaded securely`);
      setFileToUpload(null);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: DocumentItem) => {
    try {
      toast.loading("Preparing secure download...", { id: "dl" });
      const res = await api.get(`/documents/${doc.id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started", { id: "dl" });
    } catch (err) {
      toast.error("Failed to download document", { id: "dl" });
    }
  };

  const handleVerify = async (docId: string) => {
    try {
      await api.put(`/documents/${docId}/verify`);
      toast.success("Document marked as verified");
      fetchDocuments();
    } catch (err) {
      toast.error("Verification failed");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete(`/documents/${docId}`);
      toast.success("Document removed");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      toast.error("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">KYC & Employee Documents</h2>
              <p className="text-xs text-slate-400">Personnel: {employeeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Upload Form */}
          <form onSubmit={handleUpload} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="font-semibold text-xs text-slate-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" /> Upload New KYC Document
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Document Category</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="AADHAAR">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="OFFER_LETTER">Signed Offer Letter</option>
                  <option value="EXPERIENCE_LETTER">Relieving / Experience Certificate</option>
                  <option value="RESUME">Resume / CV</option>
                  <option value="OTHER">Other Proof</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Select File (PDF, PNG, JPG $\le$ 5MB)</label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={uploading || !fileToUpload}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" /> Upload & Verify
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Document List */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Archived Documents ({documents.length})
            </h3>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 text-xs text-slate-500">
                No KYC documents uploaded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 truncate">{doc.documentType}</span>
                          {doc.verified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock className="w-3 h-3" /> Pending Review
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {doc.fileName} • {formatFileSize(doc.fileSize)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isAdmin && !doc.verified && (
                        <button
                          onClick={() => handleVerify(doc.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-colors"
                          title="Verify document"
                        >
                          Verify
                        </button>
                      )}

                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Download document"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 rounded-lg text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
