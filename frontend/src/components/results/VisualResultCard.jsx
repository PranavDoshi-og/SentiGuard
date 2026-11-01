import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  PhoneCall,
  Mail,
  FileText,
  ChevronDown,
  ChevronUp,
  Cpu,
  Flame,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './ResultPanel';

export default function VisualResultCard({ result }) {
  const [showRawText, setShowRawText] = useState(false);

  if (!result || (!result.brand_analysis && !result.image_metadata)) {
    return null;
  }

  const {
    brand_analysis = {},
    urgency_analysis = {},
    extracted_entities = {},
    extracted_urls_scans = [],
    image_metadata = {},
    raw_text_snippet = '',
  } = result;

  const isImpersonation = brand_analysis.is_impersonation;
  const detectedBrands = brand_analysis.detected_brands || [];
  const mismatchedBrands = brand_analysis.mismatched_brands || [];
  const urgencyScore = urgency_analysis.urgency_score || 0;
  const urgencyCues = urgency_analysis.detected_cues || [];
  const urls = extracted_entities.urls || [];
  const phones = extracted_entities.phone_numbers || [];
  const emails = extracted_entities.emails || [];

  return (
    <div className="border-b border-white/5 bg-slate-900/40 p-6 sm:p-8">
      {/* ── 1. Brand Impersonation Forensic Banner ─────────────────────── */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
          <span className="w-1.5 h-3.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,1)]" />
          Visual Brand Intelligence & Domain Alignment
        </h3>

        {isImpersonation ? (
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="text-sm font-bold text-rose-300">
                    High-Risk Brand Impersonation Detected
                  </h4>
                  {mismatchedBrands.map((m, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-500/40"
                    >
                      Spoofed: {m.brand}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-rose-200/80 leading-relaxed mb-3">
                  This media displays branding or terminology associated with{' '}
                  <strong className="text-white">{detectedBrands.join(', ')}</strong>, but points to or is associated with unverified external infrastructure.
                </p>

                {mismatchedBrands.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-black/40 rounded-xl p-3 border border-rose-500/20 text-xs font-mono space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-rose-300">
                      <span className="text-slate-500 font-semibold">Legitimate Brand Domains:</span>
                      <span className="text-emerald-400 font-bold">{m.expected_domains.slice(0, 3).join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-rose-300">
                      <span className="text-slate-500 font-semibold">Observed Unofficial Domains:</span>
                      <span className="text-rose-400 font-bold">
                        {m.found_domains.length > 0 ? m.found_domains.join(', ') : 'Third-Party / Missing Official Host'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : detectedBrands.length > 0 ? (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-300 leading-relaxed">
              Detected brand marks (<strong className="text-white">{detectedBrands.join(', ')}</strong>) are consistent with verified official domain records.
            </p>
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 text-xs text-slate-400">
            No prominent enterprise brand impersonation detected in visual media.
          </div>
        )}
      </div>

      {/* ── 2. Extracted Entities & Chained URL Scans ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column: Chained URL Scans */}
        <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-cyan-400" />
            Embedded URLs ({urls.length}) & Deep Threat Verification
          </h4>

          {extracted_urls_scans.length > 0 ? (
            <div className="space-y-2.5">
              {extracted_urls_scans.map((scanItem, idx) => {
                const isItemSafe = scanItem.verdict === 'SAFE';
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
                        {scanItem.url}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0',
                          isItemSafe
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        )}
                      >
                        {scanItem.verdict} ({scanItem.trust_score ?? 0}/100)
                      </span>
                    </div>

                    {scanItem.risk_factors && scanItem.risk_factors.length > 0 && (
                      <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5">
                        {scanItem.risk_factors.map((rf, rIdx) => (
                          <li key={rIdx} className="truncate">{rf}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : urls.length > 0 ? (
            <ul className="space-y-1.5 text-xs font-mono text-cyan-300">
              {urls.map((u, idx) => (
                <li key={idx} className="bg-slate-900 p-2 rounded-lg truncate border border-slate-800">
                  {u}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No embedded hyperlinks recognized in image.</p>
          )}
        </div>

        {/* Right Column: Callback Phishing & Social Engineering */}
        <div className="space-y-4">
          {/* Phone Numbers & Callback Scams */}
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-2.5">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              Callback Lures & Extracted Contacts
            </h4>
            {phones.length > 0 || emails.length > 0 ? (
              <div className="space-y-2">
                {phones.map((phone, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-amber-950/20 border border-amber-500/30 p-2.5 rounded-xl text-xs font-mono"
                  >
                    <span className="text-amber-200 font-bold">{phone}</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                      Support Lure Line
                    </span>
                  </div>
                ))}
                {emails.map((email, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-mono text-slate-300"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No phone lines or contact emails identified.</p>
            )}
          </div>

          {/* Social Engineering Urgency Meter */}
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                Coercion & Urgency Metric
              </h4>
              <span className="text-xs font-mono font-bold text-rose-400">
                {urgencyScore}/100
              </span>
            </div>

            <div className="h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-600 transition-all duration-700"
                style={{ width: `${Math.min(100, urgencyScore)}%` }}
              />
            </div>

            {urgencyCues.length > 0 ? (
              <ul className="space-y-1 text-xs text-slate-400">
                {urgencyCues.map((cue, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400">•</span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No artificial urgency triggers observed.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. OCR Engine & Transcript Inspector ───────────────────────── */}
      <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              OCR Extracted Transcript
            </h4>
            {image_metadata.ocr_engine && (
              <span className="text-[10px] font-mono text-purple-300 bg-purple-950/50 border border-purple-500/30 px-2 py-0.5 rounded">
                {image_metadata.ocr_engine}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
          >
            {showRawText ? 'Hide Transcript' : 'View Extracted Text'}
            {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <AnimatePresence>
          {showRawText && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {raw_text_snippet || 'No text recognized in image.'}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

