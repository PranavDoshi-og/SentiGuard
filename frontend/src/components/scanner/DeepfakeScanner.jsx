import React, { useState } from 'react';
import { UploadCloud, Bot, Fingerprint, Sparkles, X, Loader2, Cpu, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DeepfakeScanner({ onScan, isLoading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

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
    onScan(file, 'synthetic');
  };

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="glass-panel rounded-3xl p-8 sm:p-10 relative overflow-hidden ring-1 ring-white/10 shadow-[0_0_50px_rgba(168,85,247,0.15)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <label className="flex items-center gap-3 text-sm font-bold text-slate-300 uppercase tracking-widest">
          <div className="w-1.5 h-5 bg-gradient-to-b from-fuchsia-400 to-purple-600 rounded-full shadow-[0_0_10px_rgba(217,70,239,0.8)]" />
          AI Deepfake & Synthetic Media Detector
        </label>
        <span className="text-xs font-mono text-fuchsia-300 bg-fuchsia-950/40 border border-fuchsia-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
          <Bot className="w-3.5 h-3.5 text-fuchsia-400" />
          2D FFT Spatial Frequency + Provenance
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-6 relative z-10 leading-relaxed">
        Upload an image (executive portrait, social media avatar, identity badge, or artwork) to determine if it is
        <strong> AI-generated (Midjourney, Stable Diffusion, DALL-E, Flux, GANs)</strong> or an authentic photograph.
        SentiGuard analyzes 2D Fourier power spectrum anomalies, hardware camera EXIF signatures, and C2PA Content Credentials.
      </p>

      {/* File Dropzone / Preview */}
      <div className="relative z-10">
        {!file ? (
          <motion.div
            whileHover={{ scale: 1.01 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('deepfakeFileInput').click()}
            className="border-2 border-dashed border-slate-700 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 rounded-2xl p-12 text-center transition-all cursor-pointer group backdrop-blur-sm"
          >
            <Bot className="w-16 h-16 text-slate-600 group-hover:text-fuchsia-400 group-hover:drop-shadow-[0_0_15px_rgba(217,70,239,0.8)] mx-auto mb-4 transition-all duration-300" />
            <p className="text-slate-200 font-bold text-lg mb-1">Drag & drop portrait, ID, or media image</p>
            <p className="text-slate-500 text-xs mb-4">Supports PNG, JPEG, WebP (up to 20MB)</p>
            <span className="inline-block bg-slate-800 border border-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm group-hover:border-fuchsia-500/50 transition-colors">
              Browse Image
            </span>
            <input
              type="file"
              id="deepfakeFileInput"
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
                alt="Media Preview"
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
              <p className="text-xs font-mono text-slate-400 mb-6">{(file.size / 1024).toFixed(1)} KB</p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 text-white font-bold text-sm rounded-xl px-7 py-3.5 flex items-center gap-2.5 w-full sm:w-auto justify-center shadow-[0_0_25px_rgba(217,70,239,0.35)] disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Running Spectral & Provenance Analysis...' : 'Inspect AI Media Artifacts'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Analysis Capabilities Quick Matrix */}
      <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center relative z-10">
        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
          <p className="text-[11px] font-bold text-fuchsia-300">2D FFT Spectrum</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Fourier roll-off & grid spikes</p>
        </div>
        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
          <p className="text-[11px] font-bold text-cyan-300">Camera Hardware EXIF</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Sensor make, model & lens</p>
        </div>
        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
          <p className="text-[11px] font-bold text-purple-300">Prompt / Gen Signatures</p>
          <p className="text-[10px] text-slate-500 mt-0.5">PNG chunks & tool markers</p>
        </div>
        <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
          <p className="text-[11px] font-bold text-emerald-300">C2PA Credentials</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Digital source provenance</p>
        </div>
      </div>
    </motion.div>
  );
}

