import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Globe,
  PhoneCall,
  DollarSign,
  ChevronDown,
  ChevronUp,
  FileCode,
  Terminal,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './ResultPanel';

export default function DocumentResultCard({ result }) {
  const [showText, setShowText] = useState(false);

  if (!result || (!result.structural_exploits && !result.document_metadata)) {
    return null;
  }

  const {
    document_metadata = {},
    structural_exploits = {},
    invoice_heuristics = {},
    extracted_links = [],
    text_preview = '',
  } = result;

  const {
    has_javascript = false,
    has_launch_action = false,
    has_open_action = false,
    has_embedded_files = false,
    has_submit_form = false,
    detected_exploits = [],
  } = structural_exploits;

  const isInvoiceScam = invoice_heuristics.is_invoice_phishing;
  const hasExploits = has_javascript || has_launch_action || has_open_action || has_embedded_files || has_submit_form;

  return (
    <div className="border-b border-white/5 bg-slate-900/40 p-6 sm:p-8">
      {/* ── 1. Structural Exploit Checklist ─────────────────────────────── */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
          <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]" />
          PDF Structural Action & Exploit Analysis
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* JavaScript */}
          <div
            className={cn(
              'p-3.5 rounded-xl border flex flex-col justify-between text-xs',
              has_javascript ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' : 'bg-slate-950/60 border-white/5 text-slate-300'
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[11px] font-mono">/JavaScript</span>
              {has_javascript ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            </div>
            <span className="text-[10px] text-slate-400">
              {has_javascript ? 'Weaponized Code' : 'Clean (No Scripts)'}
            </span>
          </div>

          {/* Launch Action */}
          <div
            className={cn(
              'p-3.5 rounded-xl border flex flex-col justify-between text-xs',
              has_launch_action ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' : 'bg-slate-950/60 border-white/5 text-slate-300'
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[11px] font-mono">/Launch</span>
              {has_launch_action ? <Terminal className="w-4 h-4 text-rose-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            </div>
            <span className="text-[10px] text-slate-400">
              {has_launch_action ? 'OS Command Spawn' : 'No Shell Execution'}
            </span>
          </div>

          {/* OpenAction */}
          <div
            className={cn(
              'p-3.5 rounded-xl border flex flex-col justify-between text-xs',
              has_open_action ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' : 'bg-slate-950/60 border-white/5 text-slate-300'
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[11px] font-mono">/OpenAction</span>
              {has_open_action ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            </div>
            <span className="text-[10px] text-slate-400">
              {has_open_action ? 'Auto-Triggered Hook' : 'Manual Trigger Only'}
            </span>
          </div>

          {/* Embedded Files */}
          <div
            className={cn(
              'p-3.5 rounded-xl border flex flex-col justify-between text-xs',
              has_embedded_files ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' : 'bg-slate-950/60 border-white/5 text-slate-300'
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[11px] font-mono">/EmbeddedFiles</span>
              {has_embedded_files ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            </div>
            <span className="text-[10px] text-slate-400">
              {has_embedded_files ? 'Contains Dropper' : 'No Hidden Files'}
            </span>
          </div>

          {/* SubmitForm */}
          <div
            className={cn(
              'p-3.5 rounded-xl border flex flex-col justify-between text-xs',
              has_submit_form ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' : 'bg-slate-950/60 border-white/5 text-slate-300'
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[11px] font-mono">/SubmitForm</span>
              {has_submit_form ? <Zap className="w-4 h-4 text-rose-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            </div>
            <span className="text-[10px] text-slate-400">
              {has_submit_form ? 'Silent Exfiltration' : 'No Data Extraction'}
            </span>
          </div>
        </div>

        {detected_exploits.length > 0 && (
          <div className="mt-3 bg-rose-950/30 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-200 space-y-1">
            {detected_exploits.map((exp, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{exp}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. Scam Invoice & Phishing Template Alert ──────────────────── */}
      {isInvoiceScam && (
        <div className="mb-6 bg-rose-950/40 border border-rose-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="text-sm font-bold text-rose-300">
                  Fraudulent Invoice & Callback Scam Detected
                </h4>
                {invoice_heuristics.detected_brands?.map((b, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-500/40"
                  >
                    Targeted Brand: {b}
                  </span>
                ))}
              </div>
              <p className="text-xs text-rose-200/80 leading-relaxed mb-3">
                This document utilizes unauthorized auto-renewal lures to coerce victims into calling a fake tech support or refund desk line.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                {invoice_heuristics.claimed_amounts?.length > 0 && (
                  <div className="bg-black/40 p-2.5 rounded-xl border border-rose-500/20 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-rose-400" />
                    <span className="text-slate-400">Claimed Debit:</span>
                    <span className="text-white font-bold">${invoice_heuristics.claimed_amounts.join(', ')}</span>
                  </div>
                )}
                {invoice_heuristics.support_phones?.length > 0 && (
                  <div className="bg-black/40 p-2.5 rounded-xl border border-rose-500/20 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-400">Lure Phone Line:</span>
                    <span className="text-amber-300 font-bold">{invoice_heuristics.support_phones.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Extracted Embedded Links & Document Metadata ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Extracted Links */}
        <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-cyan-400" />
            Embedded Hyperlinks ({extracted_links.length})
          </h4>

          {extracted_links.length > 0 ? (
            <div className="space-y-2.5">
              {extracted_links.map((linkItem, idx) => {
                const isItemSafe = linkItem.verdict === 'SAFE';
                return (
                  <div
                    key={idx}
                    className={cn(
                      'p-3 rounded-xl border text-xs',
                      isItemSafe
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold truncate max-w-[240px] text-white">
                        {linkItem.url}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0',
                          isItemSafe
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        )}
                      >
                        {linkItem.verdict} ({linkItem.trust_score ?? 0}/100)
                      </span>
                    </div>

                    {linkItem.risk_factors && linkItem.risk_factors.length > 0 && (
                      <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5">
                        {linkItem.risk_factors.map((rf, rIdx) => (
                          <li key={rIdx} className="truncate">{rf}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No clickable hyperlinks found in PDF annotations or streams.</p>
          )}
        </div>

        {/* Document Metadata */}
        <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
            <FileCode className="w-4 h-4 text-purple-400" />
            PDF Metadata & Object Hierarchy
          </h4>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">Document Title:</span>
              <span className="text-slate-200 font-bold truncate max-w-[200px]">{document_metadata.title}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">Page Count:</span>
              <span className="text-slate-200 font-bold">{document_metadata.page_count} Page(s)</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">Author:</span>
              <span className="text-slate-200 truncate max-w-[200px]">{document_metadata.author}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">Producer / Tool:</span>
              <span className="text-slate-200 truncate max-w-[200px]">{document_metadata.producer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Encryption Status:</span>
              <span className={cn('font-bold', document_metadata.is_encrypted ? 'text-amber-400' : 'text-emerald-400')}>
                {document_metadata.is_encrypted ? 'Encrypted / Password' : 'Unencrypted (Standard)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Document Text Preview ───────────────────────────────────── */}
      {text_preview && (
        <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Extracted Document Text
              </h4>
            </div>
            <button
              onClick={() => setShowText(!showText)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              {showText ? 'Hide Text' : 'View Extracted Text'}
              {showText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <AnimatePresence>
            {showText && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                  {text_preview}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
