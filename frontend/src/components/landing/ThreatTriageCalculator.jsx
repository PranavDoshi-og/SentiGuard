import React, { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck, Zap, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

export default function ThreatTriageCalculator({ onLaunchConsole }) {
  const [alertsPerWeek, setAlertsPerWeek] = useState(250);

  // Dynamic Calculations
  const manualMinutesPerAlert = 12; // Typical manual SOC triage time
  const sentiguardSecondsPerAlert = 0.085; // Sub-100ms
  const hoursSavedPerWeek = Math.round((alertsPerWeek * (manualMinutesPerAlert - (sentiguardSecondsPerAlert / 60))) / 60);
  const triageSpeedup = 94; // % faster triage
  const zeroDayBreachesPrevented = Math.max(1, Math.round(alertsPerWeek * 0.04)); // ~4% zero-hour threats
  const estimatedCostAverted = (zeroDayBreachesPrevented * 48000).toLocaleString(); // estimated breach cost averted

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
      <div className="pearl-panel rounded-3xl p-8 sm:p-12 border border-violet-500/30 shadow-[0_0_50px_rgba(124,58,237,0.15)] relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Left Column: Interactive Slider Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="pearl-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium">
              <Calculator className="w-3.5 h-3.5 text-violet-400" />
              <span>SOC TRIAGE ACCELERATION CALCULATOR</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Estimate Your SecOps Efficiency Gain
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">
              Slide below to estimate how many manual analyst triage hours SentiGuard eliminates through autonomous sub-100ms forensic classification.
            </p>

            {/* Slider Widget */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">WEEKLY SUSPICIOUS ALERTS:</span>
                <span className="text-xl font-bold font-mono text-violet-300 bg-violet-950/60 border border-violet-500/30 px-3 py-1 rounded-xl">
                  {alertsPerWeek.toLocaleString()} / week
                </span>
              </div>

              <input
                type="range"
                min="50"
                max="2500"
                step="50"
                value={alertsPerWeek}
                onChange={(e) => setAlertsPerWeek(Number(e.target.value))}
                className="roi-range w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>50 (Startup / SME)</span>
                <span>1,250 (Mid-Enterprise)</span>
                <span>2,500+ (SOC / MSSP)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Reactive Metrics Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="pearl-badge p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-violet-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase">Time Reclaimed</span>
              </div>
              <div className="text-3xl font-black font-mono text-white mt-1">
                {hoursSavedPerWeek} <span className="text-sm font-normal text-slate-400">hrs/week</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Eliminates tedious manual URL & PDF decoding.
              </div>
            </div>

            <div className="pearl-badge p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase">MTTR Speedup</span>
              </div>
              <div className="text-3xl font-black font-mono text-emerald-300 mt-1">
                {triageSpeedup}% <span className="text-sm font-normal text-slate-400">faster</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                From 12 min manual audit to &lt;85ms verdict.
              </div>
            </div>

            <div className="pearl-badge p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase">Zero-Days Intercepted</span>
              </div>
              <div className="text-3xl font-black font-mono text-cyan-300 mt-1">
                ~{zeroDayBreachesPrevented} <span className="text-sm font-normal text-slate-400">/ week</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Caught via 2D-FFT & low-level PDF stream parsing.
              </div>
            </div>

            <div className="pearl-badge p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase">Breach Risk Averted</span>
              </div>
              <div className="text-3xl font-black font-mono text-amber-300 mt-1">
                ${estimatedCostAverted}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Based on IBM Cost of a Data Breach benchmarks.
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
