import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, Sparkles, ShieldAlert, Globe, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VisualScanner({ onScan, isLoading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [originUrl, setOriginUrl] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = () => {
    if (!file) return;
    onScan({ file, originUrl }, 'visual');
  };

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="glass-panel rounded-3xl p-8 sm:p-10 relative overflow-hidden ring-1 ring-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <label className="flex items-center gap-3 text-sm font-bold text-slate-300 uppercase tracking-widest">
          <div className="w-1.5 h-5 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
          Visual Phishing & OCR Inspector
        </label>
        <span className="text-xs font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          OCR + Brand Discrepancy Engine
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-6 relative z-10 leading-relaxed">
        Upload a screenshot of a suspicious webpage, email, SMS, or fake invoice. SentiGuard extracts embedded text,
        detects brand impersonation (e.g. Microsoft/PayPal logos on spoofed domains), analyzes extortion urgency, and automatically scans any embedded URLs.
      </p>

      {/* Drag & Drop or Preview Area */}
      <div className="relative z-10">
        {!file ? (
          <motion.div
            whileHover={{ scale: 1.01 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('visualFileInput').click()}
            className="border-2 border-dashed border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/5 rounded-2xl p-12 text-center transition-all cursor-pointer group backdrop-blur-sm"
          >
            <ImageIcon className="w-16 h-16 text-slate-600 group-hover:text-purple-400 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] mx-auto mb-4 transition-all duration-300" />
            <p className="text-slate-200 font-bold text-lg mb-1">Drag & drop a screenshot or phishing image</p>
            <p className="text-slate-500 text-xs mb-4">Supports PNG, JPEG, WebP (up to 15MB)</p>
            <span className="inline-block bg-slate-800 border border-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm group-hover:border-purple-500/50 transition-colors">
              Browse Image
            </span>
            <input
              type="file"
              id="visualFileInput"
              accept="image/*"
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
            <div className="w-44 h-44 sm:w-48 sm:h-48 bg-slate-950 rounded-2xl shadow-inner p-2.5 relative border border-slate-800 shrink-0">
              <img
                src={preview}
                alt="Phishing Screenshot Preview"
                className="w-full h-full object-contain rounded-xl"
              />
              <button
                onClick={handleClear}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              <h4 className="font-bold text-white text-base mb-1 truncate max-w-sm">{file.name}</h4>
              <p className="text-xs font-mono text-slate-400 mb-4">{(file.size / 1024).toFixed(1)} KB</p>

              {/* Optional Origin URL Input */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Origin / Context Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. login-account-recovery.xyz or https://suspicious-site.com"
                  value={originUrl}
                  onChange={(e) => setOriginUrl(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 outline-none transition-all"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Provide the website URL where this screenshot was taken to verify domain brand alignment.
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-sm rounded-xl px-6 py-3 flex items-center gap-2.5 w-full sm:w-auto justify-center shadow-[0_0_25px_rgba(147,51,234,0.35)] disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Running OCR & Brand Profiling...' : 'Scan Visual Media'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Analysis Capabilities Quick Matrix */}
      <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center relative z-10">
        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
          <p className="text-[11px] font-bold text-purple-300">OCR Extraction</p>
          <p className="text-[10px] text-slate-500 mt-0.5">URLs, emails & phone lines</p>
        </div>
        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
          <p className="text-[11px] font-bold text-cyan-300">Brand Spoofing</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Cross-domain verification</p>
        </div>
        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
          <p className="text-[11px] font-bold text-rose-300">Social Engineering</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Extortion & urgency heuristics</p>
        </div>
        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
          <p className="text-[11px] font-bold text-emerald-300">Chained URL Scan</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Deep ML engine lookup</p>
        </div>
      </div>
    </motion.div>
  );
}

