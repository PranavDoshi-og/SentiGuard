import React from 'react';
import { History, Trash2, ArrowUpRight, ShieldCheck, ShieldAlert, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuditLog({ history, onClearHistory, onReScan }) {
  if (!history || history.length === 0) {
    return (
      <div className="mt-12 glass-panel rounded-2xl p-8 text-center border border-white/5 bg-slate-900/30">
        <History className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-300">No Scan History</h4>
        <p className="text-xs text-slate-500 mt-1">
          Scanned URLs and QR payloads from this session will appear here for audit logging.
        </p>
      </div>
    );
  }

  const exportHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sentiguard-audit-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="mt-12 glass-panel rounded-2xl p-6 border border-white/10 bg-slate-900/40">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            Session Audit Log ({history.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportHistory}
            className="text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
            title="Export History JSON"
          >
            <Download className="w-3 h-3" /> Export
          </button>
          <button
            onClick={onClearHistory}
            className="text-xs text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
            title="Clear History"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono">
              <th className="py-2 px-3 font-semibold">Time</th>
              <th className="py-2 px-3 font-semibold">Target URL</th>
              <th className="py-2 px-3 font-semibold">Verdict</th>
              <th className="py-2 px-3 font-semibold text-right">Trust Score</th>
              <th className="py-2 px-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {history.map((item, index) => {
              const isSafe = item.verdict === 'SAFE';
              return (
                <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                  </td>
                  <td className="py-2.5 px-3 max-w-[280px] truncate text-slate-200" title={item.url}>
                    {item.url}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSafe
                          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                          : 'text-rose-400 bg-rose-950/40 border-rose-500/30'
                      }`}
                    >
                      {isSafe ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {item.verdict}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                    {item.trust_score}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onReScan(item.url)}
                      className="text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1"
                    >
                      Re-scan <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
