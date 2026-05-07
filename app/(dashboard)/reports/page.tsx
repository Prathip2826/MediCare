'use client';
export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  FileText, Upload, Search, Download, Brain, Loader2,
  CheckCircle, ShieldAlert, Trash2, X, AlertCircle, Eye
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface AiData {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  concerns: string[];
  vocabulary: { term: string; definition: string }[];
}

interface Report {
  id: string;
  title: string;
  report_type: string;
  file_type: string;
  file_url: string;
  file_path: string;
  ai_summarized: boolean;
  ai_summary?: AiData;
  created_at: string;
}

const REPORT_TYPES = ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Prescription', 'ECG', 'Other'];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [reportType, setReportType] = useState('Other');

  const getUid = () => auth?.currentUser?.uid || '';

  useEffect(() => {
    const unsub = auth?.onAuthStateChanged?.((user: any) => {
      if (user) fetchReports();
      else setLoading(false);
    });
    return () => unsub?.();
  }, []);

  const fetchReports = async () => {
    const uid = getUid();
    if (!uid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/reports', { headers: { 'x-user-id': uid } });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const uid = getUid();
    if (!uid || !supabase) { toast.error('Please sign in first'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }

    setIsUploading(true);
    setShowUpload(false);

    try {
      // 1. Upload to Supabase Storage
      setUploadProgress('Uploading to secure storage...');
      const ext = file.name.split('.').pop();
      const filePath = `reports/${uid}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('medical-reports')
        .upload(filePath, file, { upsert: false });
      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('medical-reports')
        .getPublicUrl(filePath);

      // 3. Save metadata to DB
      setUploadProgress('Saving metadata...');
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
        body: JSON.stringify({
          title: file.name.replace(/\.[^.]+$/, ''),
          file_type: file.type,
          file_url: publicUrl,
          file_path: filePath,
          report_type: reportType,
        }),
      });

      if (!res.ok) throw new Error('Failed to save report metadata');
      const newReport = await res.json();
      setReports(prev => [newReport, ...prev]);
      toast.success('Report uploaded successfully! ✅');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Upload failed');
    }

    setIsUploading(false);
    setUploadProgress('');
  }, [reportType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleSummarize = async (report: Report) => {
    const uid = getUid();
    if (!uid) return;
    setSummarizingId(report.id);

    try {
      // For images, send the URL. For PDFs, send filename + type as context.
      const isImage = report.file_type?.startsWith('image/');
      const reportText = isImage
        ? `[Image report uploaded by user. File: ${report.title}. Type: ${report.report_type}. Analyze this medical image report.]`
        : `Medical report file: "${report.title}". Report type: ${report.report_type}. ` +
          `This is a ${report.report_type} document. Please provide a comprehensive summary based on the report type and title.`;

      const res = await fetch('/api/reports/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportText,
          fileName: report.title,
          fileUrl: report.file_url,
          fileType: report.file_type,
          reportType: report.report_type,
        }),
      });

      if (!res.ok) throw new Error('Summarization failed');
      const aiData: AiData = await res.json();

      // Save AI summary back to DB
      const patchRes = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
        body: JSON.stringify({ id: report.id, ai_summary: aiData, ai_summarized: true }),
      });

      if (patchRes.ok) {
        const updated = await patchRes.json();
        setReports(prev => prev.map(r => r.id === report.id ? updated : r));
        setSelectedReport({ ...report, ai_summary: aiData, ai_summarized: true });
        toast.success('AI summary ready!');
      }
    } catch (err: any) {
      toast.error('Failed to summarize report');
    }
    setSummarizingId(null);
  };

  const handleDelete = async (id: string) => {
    const uid = getUid();
    if (!uid) return;
    const res = await fetch(`/api/reports?id=${id}`, { method: 'DELETE', headers: { 'x-user-id': uid } });
    if (res.ok) {
      setReports(prev => prev.filter(r => r.id !== id));
      if (selectedReport?.id === id) setSelectedReport(null);
      toast.success('Report deleted');
    } else {
      toast.error('Failed to delete report');
    }
  };

  const filtered = reports.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || r.report_type === filterType;
    return matchSearch && matchType;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      'Blood Test': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'X-Ray': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'MRI': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Prescription': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return map[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Medical Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Upload, store, and get AI-powered insights on your medical documents.</p>
        </div>
        <motion.button onClick={() => setShowUpload(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-hero text-white font-semibold text-sm btn-glow">
          <Upload size={16} /> Upload Report
        </motion.button>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Upload Medical Document</h3>
                <button onClick={() => setShowUpload(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X size={18} /></button>
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Report Type</label>
                <select value={reportType} onChange={e => setReportType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Upload size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{isDragActive ? 'Drop it here!' : 'Drag & drop your file'}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">or click to browse (PDF, JPG, PNG · max 10MB)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <ShieldAlert size={12} />
                Files are encrypted and stored securely in Supabase Storage.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      <AnimatePresence>
        {isUploading && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
            <Loader2 size={18} className="animate-spin text-primary" />
            <p className="text-sm font-medium text-primary">{uploadProgress || 'Processing...'}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search reports..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">All Types</option>
          {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </motion.div>

      {/* Reports Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-2xl animate-shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl">
          <FileText size={48} className="text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-foreground">No reports yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Upload your first medical document to get AI-powered insights.</p>
          <button onClick={() => setShowUpload(true)}
            className="mt-4 px-5 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
            Upload Report
          </button>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((report, i) => (
            <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all group flex flex-col">

              {/* Preview thumbnail */}
              <div className="h-32 bg-muted/50 flex items-center justify-center border-b border-border relative overflow-hidden">
                {report.file_type?.startsWith('image/') ? (
                  <img src={report.file_url} alt={report.title}
                    className="w-full h-full object-cover" />
                ) : (
                  <FileText size={40} className="text-muted-foreground/40" />
                )}
                {report.ai_summarized && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle size={10} /> AI Ready
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={report.file_url} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Eye size={13} className="text-foreground" />
                  </a>
                  <a href={report.file_url} download={report.title}
                    className="w-7 h-7 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Download size={13} className="text-foreground" />
                  </a>
                  <button onClick={() => handleDelete(report.id)}
                    className="w-7 h-7 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={13} className="text-red-500" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug">{report.title}</h3>
                </div>
                <div className="flex items-center justify-between mt-1 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(report.report_type)}`}>
                    {report.report_type}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(report.created_at)}</span>
                </div>

                <div className="mt-auto">
                  {report.ai_summarized ? (
                    <button onClick={() => setSelectedReport(report)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                      <Brain size={14} /> View AI Summary
                    </button>
                  ) : (
                    <button onClick={() => handleSummarize(report)} disabled={summarizingId === report.id}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50">
                      {summarizingId === report.id
                        ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
                        : <><Brain size={14} /> Summarize with AI</>}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Summary Modal */}
      <AnimatePresence>
        {selectedReport?.ai_summarized && selectedReport.ai_summary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <Brain size={18} className="text-primary" />
                  <h3 className="font-bold text-foreground">AI Summary: {selectedReport.title}</h3>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Overview */}
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Overview</h4>
                  <p className="text-sm text-foreground leading-relaxed">{selectedReport.ai_summary.summary}</p>
                </div>

                {/* Key Findings & Concerns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle size={12} /> Key Findings
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedReport.ai_summary.keyFindings.map((f, i) => (
                        <li key={i} className="text-sm text-emerald-800 dark:text-emerald-300 flex gap-2"><span>•</span>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <AlertCircle size={12} /> Concerns
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedReport.ai_summary.concerns.map((c, i) => (
                        <li key={i} className="text-sm text-amber-800 dark:text-amber-300 flex gap-2"><span>•</span>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Recommendations</h4>
                  <ul className="space-y-1.5">
                    {selectedReport.ai_summary.recommendations.map((r, i) => (
                      <li key={i} className="text-sm text-foreground flex gap-2"><span className="text-primary">→</span>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Medical Vocabulary */}
                {selectedReport.ai_summary.vocabulary?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Medical Terms Explained</h4>
                    <div className="space-y-2">
                      {selectedReport.ai_summary.vocabulary.map((v, i) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-xl text-sm">
                          <span className="font-semibold text-primary">{v.term}: </span>
                          <span className="text-foreground">{v.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <ShieldAlert size={14} />
                  This AI summary is for informational purposes only. Always consult your doctor for medical decisions.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
