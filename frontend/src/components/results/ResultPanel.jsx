import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, useAnimation, useInView } from 'framer-motion';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Custom hook for animated counting
function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    const duration = 1500; // 1.5s
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function (easeOutQuart)
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(Math.floor(easeProgress * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue}</>;
}

export default function ResultPanel({ result }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (result && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result]);

  if (!result) return null;

  const isSafe = result.verdict === 'SAFE';

  const formatFeatureName = (key) => {
    return key.replace(/^has_/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const SHOW_FEATURES = [
    'has_https', 'has_ip_address', 'url_length', 'num_dots',
    'has_at_symbol', 'has_suspicious_tld', 'num_hyphens', 'has_login_keyword',
    'has_hex_encoding', 'subdomain_count', 'num_params', 'path_depth',
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 } 
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      ref={panelRef}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="glass-panel rounded-3xl overflow-hidden mt-10 ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative"
    >
      
      {/* Dynamic Glow Behind Panel */}
      <div className={cn(
        "absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 blur-[100px] pointer-events-none -z-10",
        isSafe ? "bg-emerald-500/30" : "bg-red-500/30"
      )} />

      {/* Verdict Header */}
      <motion.div variants={itemVariants} className={cn(
        "relative px-10 py-12 border-b border-white/10 overflow-hidden",
        isSafe ? "bg-emerald-950/20" : "bg-red-950/20"
      )}>
        <div className={cn(
          "absolute inset-0 opacity-20 pointer-events-none",
          isSafe ? "bg-gradient-to-br from-emerald-500 to-transparent" : "bg-gradient-to-br from-red-500 to-transparent"
        )} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 1, delay: 0.2 }}
            className={cn(
              "p-5 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20",
              isSafe ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-red-500/20 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
            )}
          >
            {isSafe ? <ShieldCheck className="w-16 h-16 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" /> : <ShieldAlert className="w-16 h-16 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />}
          </motion.div>
          <div className="flex-1">
            <h2 className={cn(
              "text-4xl md:text-5xl font-black tracking-tighter mb-4 drop-shadow-[0_0_20px_currentColor]",
              isSafe ? "text-emerald-400" : "text-red-500"
            )}>
              {isSafe ? 'SAFE' : 'PHISHING DETECTED'}
            </h2>
            <div className="inline-flex items-center gap-2 bg-slate-900/80 text-slate-300 font-mono text-sm px-4 py-2 rounded-xl break-all border border-slate-700 shadow-inner">
              <ExternalLink className="w-4 h-4 shrink-0 text-blue-400" />
              {result.url}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trust Score */}
      <motion.div variants={itemVariants} className="px-10 py-10 border-b border-white/5 bg-slate-900/50">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]" />
            Trust Score
          </h3>
          <span className="text-6xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <AnimatedNumber value={result.trust_score} /><span className="text-4xl text-slate-500">%</span>
          </span>
        </div>
        <div className="h-5 bg-slate-950 rounded-full overflow-hidden p-0.5 shadow-inner border border-slate-800 relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${result.trust_score}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            className={cn(
              "h-full rounded-full relative shadow-[0_0_20px_currentColor]",
              isSafe ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-500" : "bg-gradient-to-r from-red-600 to-rose-400 text-red-500"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
        <div className="flex justify-between mt-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <span>Dangerous</span>
          <span>Safe</span>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2">
        {/* Risk Factors */}
        {!isSafe && result.risk_factors?.length > 0 && (
          <div className="p-10 border-b md:border-b-0 md:border-r border-white/5 overflow-hidden">
            <h3 className="flex items-center gap-3 text-sm font-bold text-slate-300 uppercase tracking-widest mb-6">
              <AlertTriangle className="w-5 h-5 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              Risk Factors
            </h3>
            <ul className="space-y-4">
              {result.risk_factors.map((risk, idx) => (
                <motion.li 
                  key={idx}
                  custom={idx}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: i => ({ opacity: 1, x: 0, transition: { delay: 0.8 + (i * 0.1) } })
                  }}
                  className="flex items-start gap-3 bg-red-950/30 border border-red-500/20 p-4 rounded-2xl text-red-200 text-sm leading-relaxed shadow-inner"
                >
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                  {risk}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <motion.div variants={itemVariants} className={cn("p-10", isSafe ? "md:col-span-2" : "")}>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-3">
            <div className="w-1.5 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]" />
            Deep URL Analysis
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {SHOW_FEATURES.filter(k => k in result.features).map((key, idx) => {
              const val = result.features[key];
              const isBool = typeof val === 'boolean';
              return (
                <motion.div 
                  key={key} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + (idx * 0.05) }}
                  className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-2xl flex flex-col gap-2 shadow-inner hover:bg-slate-800/80 transition-all hover:border-slate-600"
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate" title={formatFeatureName(key)}>
                    {formatFeatureName(key)}
                  </span>
                  <span className={cn(
                    "font-mono text-base font-black tracking-tight",
                    isBool ? (val ? 'text-emerald-400' : 'text-red-400') : 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                  )}>
                    {isBool ? (val ? 'YES' : 'NO') : val}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
