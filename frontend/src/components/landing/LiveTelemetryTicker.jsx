import React from 'react';
import { ShieldCheck, Cpu, Eye, Radio, Zap, Lock, Terminal, Activity } from 'lucide-react';

export default function LiveTelemetryTicker() {
  const telemetryItems = [
    { icon: Zap, label: '36 DEEP HEURISTIC VECTORS', value: 'ACTIVE' },
    { icon: Activity, label: '2D-FFT FREQUENCY SPECTROGRAM', value: 'CALIBRATED' },
    { icon: Eye, label: 'DUAL-TIER NATIVE & TESSERACT OCR', value: 'ONLINE' },
    { icon: Cpu, label: 'RAPIDFUZZ BRAND FUZZY MATCHER', value: 'LOADED' },
    { icon: Lock, label: 'PYPDF LOW-LEVEL STREAM PARSER', value: 'ARMED' },
    { icon: Radio, label: 'C2PA & IPTC PROVENANCE INSPECTOR', value: 'MONITORING' },
    { icon: Terminal, label: 'SHAP EXPLAINABLE AI MODEL', value: 'INITIALIZED' },
    { icon: ShieldCheck, label: 'ZERO-DAY ZERO-CLOUD INTEGRITY', value: '100% PRIVATE' },
  ];

  return (
    <div className="relative w-full border-y border-cyan-500/15 bg-slate-950/80 backdrop-blur-md overflow-hidden py-3">
      {/* Subtle edge fade gradient */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#070a0f] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#070a0f] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex w-max animate-marquee space-x-10 items-center">
        {[...telemetryItems, ...telemetryItems].map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className="inline-flex items-center gap-2.5 px-3 py-1 rounded-md bg-white/[0.03] border border-white/5 font-mono text-xs text-slate-300"
            >
              <IconComponent className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">{item.label}:</span>
              <span className="text-cyan-300 font-semibold">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
