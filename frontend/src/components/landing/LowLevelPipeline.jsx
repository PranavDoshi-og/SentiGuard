import React from 'react';
import { Cpu, Binary, Layers, ShieldCheck, ArrowRight, Zap, Eye, Lock, FileSearch } from 'lucide-react';

export default function LowLevelPipeline() {
  const pipelineSteps = [
    {
      step: '01',
      title: 'Multimodal Ingestion',
      subtitle: 'Zero-Leak Stream Ingest',
      icon: Layers,
      description: 'Receives raw URLs, QR matrices, uncompressed screenshots, high-res portrait media, or raw PDF byte buffers directly into memory sandbox.',
      tags: ['Byte Buffers', 'No Disk Caching', 'Local Memory Sandbox']
    },
    {
      step: '02',
      title: 'Low-Level Signal Extraction',
      subtitle: 'Heuristics, Spectral & OCR',
      icon: Cpu,
      description: 'Deconstructs payloads simultaneously across 2D-FFT frequency spectrums, native OCR text layers, pypdf object dictionaries, and WHOIS/SSL network trees.',
      tags: ['2D FFT Spectrogram', 'Dual-Tier OCR', 'PDF Object Tree', 'WHOIS/SSL']
    },
    {
      step: '03',
      title: 'Composite AI Scoring',
      subtitle: 'SHAP Explainability Engine',
      icon: Binary,
      description: 'Synthesizes forensic signals into a 0-100 Safety Index with explainable SHAP local feature attributions, eliminating black-box false positives.',
      tags: ['SHAP Feature Weights', 'Entropy Bounds', 'Heuristic Correlation']
    },
    {
      step: '04',
      title: 'Deterministic SOC Verdict',
      subtitle: 'Instant Threat Neutralization',
      icon: ShieldCheck,
      description: 'Emits structured threat verdicts, detailed forensic indicators of compromise (IOCs), extracted links, and SOC-ready mitigation playbooks in <100ms.',
      tags: ['Sub-100ms Latency', 'Actionable IOCs', 'REST JSON Schema']
    }
  ];

  return (
    <section id="architecture" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-medium">
          <Binary className="w-3.5 h-3.5" />
          SYSTEM ARCHITECTURE & DATA FLOW
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          How SentiGuard Neutralizes Threats
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Engineered from the ground up for zero-trust enterprise environments. All inspection pipelines execute locally with deterministic cryptographic and mathematical rigor.
        </p>
      </div>

      {/* 4 Pipeline Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pipelineSteps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="relative bg-slate-950/60 border border-white/10 hover:border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
            >
              {/* Step Number Watermark */}
              <div className="text-4xl font-mono font-black text-white/5 group-hover:text-cyan-500/10 transition-colors absolute top-4 right-4 pointer-events-none">
                {step.step}
              </div>

              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase text-cyan-400 tracking-wider font-semibold">
                    {step.subtitle}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Tags */}
              <div className="pt-6 border-t border-white/5 flex flex-wrap gap-1.5 mt-4">
                {step.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
