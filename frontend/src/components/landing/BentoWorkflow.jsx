import React from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight, Activity, Terminal, Eye, Lock, Cpu, Layers } from 'lucide-react';

export default function BentoWorkflow() {
  const heuristicCells = [
    { label: 'Homograph', active: true },
    { label: 'Entropy', active: true },
    { label: 'WHOIS', active: true },
    { label: 'SSL Leaf', active: false },
    { label: '2D-FFT', active: true },
    { label: 'C2PA', active: true },
    { label: 'OCR Logo', active: true },
    { label: 'Mismatch', active: true },
    { label: '/Launch', active: true },
    { label: '/OpenAction', active: true },
    { label: 'Urgency', active: false },
    { label: 'Phone Trap', active: true },
  ];

  return (
    <section id="workflow" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
      {/* Section Header with Left Line Indicator */}
      <div className="max-w-3xl mb-16 space-y-4">
        <span className="inline-flex items-center gap-3 text-sm font-medium text-violet-400">
          <span className="w-8 h-px bg-violet-500"></span>
          Operational Workflow
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          From First Ingest to Final Neutralization
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          SentiGuard guides every suspicious payload through a unified zero-trust forensic pipeline — no external cloud dependencies and zero privacy exposure.
        </p>
      </div>

      {/* 2x2 Bento Container (SalesHookAI Inspired) */}
      <div className="relative rounded-3xl border border-white/10 overflow-hidden bg-slate-950/70 backdrop-blur-xl grid grid-cols-1 md:grid-cols-2 shadow-[0_15px_50px_rgba(0,0,0,0.5)]">
        
        {/* Quadrant 1: Ingest & Payload Table */}
        <div className="p-8 lg:p-12 border-b md:border-r border-white/10 flex flex-col justify-between">
          <div className="mb-8">
            <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden text-xs">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 text-slate-400 font-mono">
                <span>PAYLOAD_INGEST #9812</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Buffered
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 text-slate-300 font-mono text-[11px]">
                <span>Target Scheme</span>
                <span className="text-cyan-400">https://paypaI-security.top</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 text-slate-300 font-mono text-[11px]">
                <span>Homograph Trap</span>
                <span className="text-rose-400 font-semibold">Cyrillic Spoof Detected</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 text-slate-300 font-mono text-[11px]">
                <span>Entropy Bounds</span>
                <span className="text-amber-400">4.82 bits/symbol</span>
              </div>
              {/* Highlighted Row (SalesHookAI Inspired) */}
              <div className="lp3-row-glow flex items-center justify-between px-4 py-2.5 bg-violet-500/10 text-white font-semibold font-mono text-[11px]">
                <span className="text-violet-300">Composite Threat</span>
                <span className="text-rose-400 font-bold">CRITICAL (99/100)</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Payload Ingest & De-obfuscation</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Streams raw URLs, high-density QR matrices, screenshots, portraits, and binary PDF byte buffers directly into an air-gapped memory sandbox.
            </p>
          </div>
        </div>

        {/* Quadrant 2: Autonomous Quarantine & Ring Pulse */}
        <div className="p-8 lg:p-12 border-b border-white/10 flex flex-col justify-between">
          <div className="mb-8">
            <div className="rounded-xl border border-white/10 bg-black/40 p-5 text-xs flex items-center gap-4">
              <div className="relative w-12 h-12 shrink-0">
                <span className="lp3-ring-pulse absolute inset-0 rounded-full bg-emerald-400/40"></span>
                <div className="relative w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="text-white font-bold text-sm">Deterministic Quarantine</div>
                <div className="text-slate-400 text-xs font-mono mt-0.5">Threat Neutralized in 42ms</div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1">IOC Hash & Playbook Dispatched</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Instant Autonomous Neutralization</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Terminates malicious execution immediately. Generates standardized Indicators of Compromise (IOCs) and emits actionable incident mitigation playbooks.
            </p>
          </div>
        </div>

        {/* Quadrant 3: 36-Vector Heuristic Grid with Cell Glow */}
        <div className="p-8 lg:p-12 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between">
          <div className="mb-8">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs grid grid-cols-4 gap-2">
              <div className="text-center text-[10px] text-slate-500 font-mono mb-1">VEC_01</div>
              <div className="text-center text-[10px] text-slate-500 font-mono mb-1">VEC_02</div>
              <div className="text-center text-[10px] text-slate-500 font-mono mb-1">VEC_03</div>
              <div className="text-center text-[10px] text-slate-500 font-mono mb-1">VEC_04</div>
              {heuristicCells.map((cell, idx) => (
                <div
                  key={idx}
                  className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-mono px-1 truncate transition-all ${
                    cell.active
                      ? 'lp3-cell-glow bg-violet-500/20 border border-violet-500/40 text-violet-300'
                      : 'bg-white/[0.02] border border-white/5 text-slate-500'
                  }`}
                >
                  {cell.label}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Deep Forensic Vector Correlation</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Synthesizes 36 lexical heuristic vectors, 2D-FFT spatial frequencies, low-level PDF stream parsing, and SHAP explainable AI attribution weights.
            </p>
          </div>
        </div>

        {/* Quadrant 4: SOC Pipeline & SIEM Export */}
        <div className="p-8 lg:p-12 flex flex-col justify-between">
          <div className="mb-8">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs flex items-center justify-center gap-2 flex-wrap">
              <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]">
                Raw Ingest
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
              <span className="px-3 py-1.5 rounded-lg bg-violet-600 text-white font-semibold font-mono text-[11px] shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                SentiGuard Core
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
              <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]">
                Splunk / SIEM
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]">
                MITRE Feeds
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">SOC Gateway & SIEM Automation</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Export forensic payloads in one click to Splunk, Microsoft Sentinel, or webhook endpoints. Zero rate limits, zero cloud queue delays.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
