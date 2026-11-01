import React, { useState } from 'react';
import { UploadCloud, FileText, FileCode, X, Loader2, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocumentScanner({ onScan, isLoading }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf'))) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.toLowerCase().endsWith('.pdf'))) {
      setFile(droppedFile);
    }
  };

  const handleClear = () => {
    setFile(null);
  };

  const handleSubmit = () => {
    if (!file) return;
    onScan(file, 'document');
  };

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="glass-panel rounded-3xl p-8 sm:p-10 relative overflow-hidden ring-1 ring-white/10 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <label className="flex items-center gap-3 text-sm font-bold text-slate-300 uppercase tracking-widest">
          <div className="w-1.5 h-5 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          Weaponized PDF & Invoice Phishing Inspector
        </label>
        <span className="text-xs font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
          <FileCode className="w-3.5 h-3.5 text-emerald-400" />
          Stream Parser + Exploit Detector
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-6 relative z-10 leading-relaxed">
        Inspect email PDF attachments, receipts, and agreements for dangerous structural exploits:
        <strong> embedded /JavaScript execution</strong>, <strong>/Launch OS commands</strong>, <strong>/OpenAction auto-redirects</strong>,
        hidden dropper payloads, and fake invoice extortion lures before opening them on your system.
      </p>

      {/* Dropzone / Preview */}
      <div className="relative z-10">
        {!file ? (
          <motion.div
            whileHover={{ scale: 1.01 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('docFileInput').click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-2xl p-12 text-center transition-all cursor-pointer group backdrop-blur-sm"
          >
            <FileText className="w-16 h-16 text-slate-600 group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] mx-auto mb-4 transition-all duration-300" />
            <p className="text-slate-200 font-bold text-lg mb-1">Drag & drop a PDF document or invoice</p>
            <p className="text-slate-500 text-xs mb-4">Supports PDF files up to 25MB</p>
            <span className="inline-block bg-slate-800 border border-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm group-hover:border-emerald-500/50 transition-colors">
              Browse PDF
            </span>
            <input
              type="file"
              id="docFileInput"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl"
          >
            <div className="w-24 h-28 sm:w-28 sm:h-32 bg-slate-950 rounded-2xl shadow-inner p-3 relative border border-slate-800 flex flex-col items-center justify-center shrink-0">
              <FileText className="w-12 h-12 text-emerald-400 mb-1" />
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                PDF
              </span>
              <button
                onClick={handleClear}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
                title="Remove PDF"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              <h4 className="font-bold text-white text-base mb-1 truncate max-w-sm">{file.name}</h4>
              <p className="text-xs font-mono text-slate-400 mb-6">{(file.size / 1024).toFixed(1)} KB</p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 text-white font-bold text-sm rounded-xl px-7 py-3.5 flex items-center gap-2.5 w-full sm:w-auto justify-center shadow-[0_0_25px_rgba(16,185,129,0.35)] disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Parsing PDF Streams & Exploits...' : 'Inspect Document Safety'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Feature Matrix */}
      <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center relative z-10">
        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
          <p className="text-[11px] font-bold text-emerald-300">/JavaScript & /Launch</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Shell & script triggers</p>
        </div>
        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
          <p className="text-[11px] font-bold text-teal-300">/OpenAction Hooks</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Auto-run on open</p>
        </div>
        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
          <p className="text-[11px] font-bold text-cyan-300">Chained URL Scan</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Hyperlink ML lookups</p>
        </div>
        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
          <p className="text-[11px] font-bold text-rose-300">Invoice Phishing</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Fake charges & lures</p>
        </div>
      </div>
    </motion.div>
  );
}
