import React from 'react';
import { Cpu, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShapExplanations({ shapExplanations, modelType }) {
  if (!shapExplanations || shapExplanations.length === 0) return null;

  const formatFeatureName = (name) => {
    return name
      .replace(/^has_/, '')
      .replace(/^is_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Find max absolute shap value to scale the bars proportionally
  const maxAbsShap = Math.max(...shapExplanations.map((item) => Math.abs(item.shap_value || 0)), 0.05);

  return (
    <div className="p-8 border-b border-white/5 bg-slate-900/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            SHAP Explainable AI Diagnostics
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            TreeExplainer feature attribution revealing how individual signals shifted the model's verdict.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-lg shrink-0">
          <span>{modelType || 'RandomForest Ensemble'}</span>
        </div>
      </div>

      <div className="space-y-3">
        {shapExplanations.map((item, idx) => {
          const isPhishingRisk = (item.shap_value || 0) > 0;
          const absVal = Math.abs(item.shap_value || 0);
          const barWidthPercent = Math.min(100, Math.max(8, (absVal / maxAbsShap) * 100));

          return (
            <div
              key={item.feature || idx}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">
                    {formatFeatureName(item.feature)}
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    value: {String(item.value)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      isPhishingRisk
                        ? 'text-rose-400 bg-rose-950/40 border-rose-500/30'
                        : 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                    }`}
                  >
                    {isPhishingRisk ? (
                      <>
                        <ArrowUpRight className="w-3 h-3" /> Increases Threat Risk
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="w-3 h-3" /> Validates Legitimate Host
                      </>
                    )}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Force Bar Indicator */}
              <div className="w-full md:w-56 shrink-0 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Impact Force</span>
                  <span className={isPhishingRisk ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {item.shap_value > 0 ? `+${item.shap_value.toFixed(3)}` : item.shap_value.toFixed(3)}
                  </span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidthPercent}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                    className={`h-full rounded-full ${
                      isPhishingRisk
                        ? 'bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
