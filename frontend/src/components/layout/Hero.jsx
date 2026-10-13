import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative text-center pt-16 pb-10 px-4 overflow-hidden z-10">
      <div className="inline-flex items-center gap-2 bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-5 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
        <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
        Zero-Day Threat Intelligence & Live Profiling
      </div>

      <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
        Enterprise URL & QR Payload Threat Engine
      </h1>

      <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
        Real-time malicious payload inspection powered by 36 multidimensional heuristic vectors, live WHOIS/DNS/SSL profiling, and SHAP explainable AI.
      </p>
    </section>
  );
}
