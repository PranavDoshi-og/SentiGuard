import React, { useState } from 'react';
import {
  GitCommit,
  CornerDownRight,
  ArrowRight,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';

export default function RedirectTracer({ redirectTrace, initialUrl }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!redirectTrace) return null;

  const {
    hops = [],
    hop_count = 0,
    is_redirected = false,
    final_url = initialUrl,
    has_shortener_hop = false,
  } = redirectTrace;

  if (hops.length === 0 && !is_redirected) return null;

  const getStatusColor = (code) => {
    if (!code) return 'text-slate-400 bg-slate-800/60 border-slate-700';
    if (code >= 200 && code < 300) return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
    if (code >= 300 && code < 400) return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
    return 'text-rose-400 bg-rose-950/40 border-rose-500/30';
  };

  const getStatusLabel = (code) => {
    if (!code) return 'No Response';
    switch (code) {
      case 200:
        return '200 OK';
      case 301:
        return '301 Moved Permanently';
      case 302:
        return '302 Found';
      case 303:
        return '303 See Other';
      case 307:
        return '307 Temporary Redirect';
      case 308:
        return '308 Permanent Redirect';
      case 403:
        return '403 Forbidden';
      case 404:
        return '404 Not Found';
      default:
        return `HTTP ${code}`;
    }
  };

  return (
    <div className="p-8 border-b border-white/5 bg-slate-900/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <GitCommit className="w-4 h-4 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
            HTTP Redirect Chain Tracer
          </h3>
          <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-full">
            {hop_count} {hop_count === 1 ? 'Hop' : 'Hops'}
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
        >
          {isExpanded ? (
            <>
              Collapse <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Expand Trace <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Shortener Alert Banner */}
      {has_shortener_hop && (
        <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <span className="font-bold text-amber-300">URL Shortener Intermediary Detected:</span>{' '}
            The input URL masked the landing destination. SentiGuard automatically expanded the full
            redirect chain to evaluate the final target.
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-3 mt-2">
          {hops.map((hop, idx) => {
            const isLast = idx === hops.length - 1;
            const statusColor = getStatusColor(hop.status_code);
            const statusLabel = getStatusLabel(hop.status_code);

            return (
              <div
                key={idx}
                className="relative flex items-start gap-3 bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-xs font-mono"
              >
                {/* Hop Number Badge */}
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-cyan-400 shrink-0 mt-0.5">
                  {hop.hop || idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {isLast ? 'Final Destination' : `Hop ${hop.hop || idx + 1}`}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* URL Text */}
                  <div className="text-slate-200 truncate font-semibold" title={hop.url}>
                    {hop.url}
                  </div>

                  {/* Redirection indicator to next target */}
                  {hop.target_url && !isLast && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 pl-2 border-l-2 border-cyan-500/40">
                      <CornerDownRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-slate-500 shrink-0">Redirects to:</span>
                      <span className="text-cyan-300 truncate font-medium" title={hop.target_url}>
                        {hop.target_url}
                      </span>
                    </div>
                  )}

                  {hop.error && (
                    <div className="text-[11px] text-rose-400 mt-1.5">
                      ⚠️ Trace Error: {hop.error}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Path expansion summary */}
          {is_redirected && final_url && final_url !== initialUrl && (
            <div className="mt-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Expanded Target:</span>
              <span className="text-emerald-400 font-bold truncate max-w-[340px] sm:max-w-[480px]" title={final_url}>
                {final_url}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
