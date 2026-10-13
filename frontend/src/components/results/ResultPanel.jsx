import React, { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';
import NetworkProfileCard from './NetworkProfileCard';
import ShapExplanations from './ShapExplanations';
import HeuristicMatrix from './HeuristicMatrix';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function AnimatedNumber({ value }) {
  const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const [displayValue, setDisplayValue] = useState(numValue);

  useEffect(() => {
    let startTime;
    const duration = 1200;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);

      setDisplayValue(Math.floor(easeProgress * numValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [numValue]);

  return <>{displayValue}</>;
}

export default function ResultPanel({ result }) {
  const panelRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (result && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result]);

  if (!result) return null;

  const isSafe = result.verdict === 'SAFE';
  const confidencePercent = Math.round((typeof result.confidence === 'number' ? result.confidence : 0) * 100);
  const trustScore = typeof result.trust_score === 'number' && !isNaN(result.trust_score) ? result.trust_score : (isSafe ? 90 : 10);

  const handleCopyUrl = () => {
    if (result.url) {
      navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="glass-panel rounded-3xl overflow-hidden mt-10 ring-1 ring-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)] relative"
    >
      {/* Background Glow */}
      <div
        className={cn(
          'absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-40 blur-[120px] pointer-events-none -z-10',
          isSafe ? 'bg-emerald-500/20' : 'bg-rose-500/25'
        )}
      />

      {/* ── 1. Verdict Header ─────────────────────────────────── */}
      <div
        className={cn(
          'relative px-8 py-10 border-b border-white/10 overflow-hidden',
          isSafe ? 'bg-emerald-950/20' : 'bg-rose-950/25'
        )}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
            className={cn(
              'p-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 shrink-0',
              isSafe
                ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                : 'bg-rose-500/20 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
            )}
          >
            {isSafe ? (
              <ShieldCheck className="w-14 h-14 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            ) : (
              <ShieldAlert className="w-14 h-14 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap mb-2">
              <span
                className={cn(
                  'text-3xl md:text-4xl font-black tracking-tight',
                  isSafe ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                {isSafe ? 'VERIFIED SAFE' : 'MALICIOUS THREAT DETECTED'}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-white/10 text-slate-300 border border-white/10">
                Confidence {confidencePercent}%
              </span>
              {result.model_type && (
                <span className="text-xs font-mono font-medium text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                  {result.model_type}
                </span>
              )}
              {result.cached && (
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Cached ({result.cache_latency_ms ? `${result.cache_latency_ms}ms` : '<1ms'})
                </span>
              )}
              {result.external_intelligence?.flagged && (
                <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950/50 border border-rose-500/40 px-2 py-0.5 rounded">
                  🚨 External Feed Verified
                </span>
              )}
            </div>

            {/* Target URL Omnibar */}
            <div className="inline-flex items-center gap-2 max-w-full bg-slate-950/80 text-slate-300 font-mono text-xs px-3.5 py-2 rounded-xl border border-slate-800 shadow-inner mt-1">
              <span className="truncate max-w-[320px] sm:max-w-[480px]" title={result.url}>
                {result.url}
              </span>
              <button
                onClick={handleCopyUrl}
                className="hover:text-white p-1 rounded transition-colors text-slate-400"
                title="Copy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-blue-400 p-1 rounded transition-colors text-slate-400"
                  title="Open in new tab (Caution)"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Trust Score Gauge ─────────────────────────────── */}
      <div className="px-8 py-8 border-b border-white/5 bg-slate-900/60">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,1)]" />
              Calculated Safety Index
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Probabilistic score synthesized from ML heuristics and live network intelligence.
            </p>
          </div>
          <div className="text-right">
            <span className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white">
              <AnimatedNumber value={trustScore} />
              <span className="text-2xl text-slate-500">/100</span>
            </span>
          </div>
        </div>

        <div className="h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 shadow-inner border border-slate-800 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, trustScore))}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            className={cn(
              'h-full rounded-full relative shadow-[0_0_15px_currentColor]',
              isSafe
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-500'
                : 'bg-gradient-to-r from-rose-600 to-amber-500 text-rose-500'
            )}
          />
        </div>
        <div className="flex justify-between mt-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span>0 (Critical Risk)</span>
          <span>50 (Suspicious)</span>
          <span>100 (Verified Legitimate)</span>
        </div>
      </div>

      {/* ── 3. Risk Factors ──────────────────────────────────── */}
      {!isSafe && result.risk_factors?.length > 0 && (
        <div className="p-8 border-b border-white/5 bg-rose-950/15">
          <h3 className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-widest mb-4">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Active Risk Flags ({result.risk_factors.length})
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.risk_factors.map((risk, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 bg-rose-950/40 border border-rose-500/20 p-3.5 rounded-xl text-rose-200 text-xs leading-relaxed"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── 4. Live Network Profile Card ─────────────────────── */}
      <NetworkProfileCard networkProfile={result.network_profile} url={result.url} />

      {/* ── 5. SHAP Tree Explainer ───────────────────────────── */}
      <ShapExplanations
        shapExplanations={result.shap_explanations}
        modelType={result.model_type}
        features={result.features}
      />

      {/* ── 6. Heuristic Matrix ─────────────────────────────── */}
      <HeuristicMatrix features={result.features} />
    </motion.div>
  );
}
