import React, { useState } from 'react';
import { Link2, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UrlScanner({ onScan, isLoading }) {
  const [url, setUrl] = useState('');

  const handleScan = (e) => {
    e.preventDefault();
    if (url.trim()) onScan(url);
  };

  return (
    <motion.div 
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="glass-panel rounded-3xl p-10 relative overflow-hidden ring-1 ring-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none" />
      <div className="relative z-10">
        <label className="flex items-center gap-3 text-sm font-bold text-slate-300 uppercase tracking-widest mb-6">
          <div className="w-1.5 h-5 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          Enter URL for deep analysis
        </label>
        
        <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Link2 className="h-6 w-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 text-white font-mono text-base rounded-2xl pl-14 pr-6 py-5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-inner backdrop-blur-md"
              placeholder="https://example.com/login?id=..."
              required
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !url.trim()}
            className="group relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-lg tracking-wide rounded-2xl px-10 py-5 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </span>
          </motion.button>
        </form>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Try:</span>
          {['https://www.google.com', 'http://paypa1-secure.tk/update', 'http://192.168.1.1/login'].map((sample) => (
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(30, 41, 59, 0.8)", color: "white" }}
              whileTap={{ scale: 0.95 }}
              key={sample}
              onClick={() => { setUrl(sample); onScan(sample); }}
              className="text-xs bg-slate-800/50 border border-slate-700/50 text-slate-400 px-4 py-2 rounded-full transition-all font-mono"
            >
              {sample.replace(/^https?:\/\//, '').substring(0, 20)}...
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
