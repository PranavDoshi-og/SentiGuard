import React, { useState } from 'react';
import { Link2, Loader2, ArrowRight, Clipboard, X, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UrlScanner({ onScan, isLoading }) {
  const [url, setUrl] = useState('');

  const handleScan = (e) => {
    e.preventDefault();
    if (url.trim()) onScan(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch {
      // Clipboard permissions denied
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  const getSchemeIndicator = () => {
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('https://')) {
      return { label: 'HTTPS', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' };
    }
    if (trimmed.startsWith('http://')) {
      return { label: 'INSECURE HTTP', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' };
    }
    if (trimmed.length > 0) {
      return { label: 'AUTO (HTTPS)', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' };
    }
    return { label: 'PROTOCOL', color: 'text-slate-500 bg-slate-900 border-slate-800' };
  };

  const scheme = getSchemeIndicator();

  const QUICK_SAMPLES = [
    { label: 'Google Search', url: 'https://www.google.com' },
    { label: 'Perplexity AI', url: 'https://www.perplexity.ai/?login-source=oneTapHome&login-new=false' },
    { label: 'Typosquatting Phish', url: 'http://paypa1-secure-auth.xyz/login' },
    { label: 'IP Host Scam', url: 'http://192.168.1.1/update-account' },
  ];

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-panel rounded-3xl p-8 md:p-10 relative overflow-hidden ring-1 ring-white/10 shadow-[0_0_50px_rgba(59,130,246,0.12)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-300 uppercase tracking-widest">
            <span className="w-1.5 h-4 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            Enter URL for Zero-Day Threat Analysis
          </label>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${scheme.color}`}>
            {scheme.label}
          </span>
        </div>

        <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
              <Link2 className="h-5 w-5" />
            </div>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-700/60 text-white font-mono text-sm rounded-2xl pl-12 pr-24 py-4 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all shadow-inner placeholder:text-slate-600"
              placeholder="https://domain.com/login?token=..."
              required
            />

            {/* Quick action buttons inside input */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
              {url && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800 transition-all"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handlePaste}
                className="text-slate-400 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-slate-800 transition-all"
                title="Paste from clipboard"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !url.trim()}
            className="group relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 text-white font-bold text-sm tracking-wide rounded-2xl px-8 py-4 flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning Network...
              </>
            ) : (
              <>
                Inspect URL
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        {/* Quick Samples */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mr-1">
            Quick Benchmarks:
          </span>
          {QUICK_SAMPLES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                onScan(sample.url);
              }}
              className="text-xs font-mono bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition-all"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
