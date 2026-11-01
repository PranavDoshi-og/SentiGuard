import React from 'react';
import { ShieldCheck, Cpu, Terminal, Lock, Layers, Zap, Radio, Binary, Sparkles, Activity } from 'lucide-react';

export default function EcosystemMarquee() {
  const row1 = [
    { label: 'Splunk SIEM Webhook', tag: 'Enterprise Feed', icon: Zap },
    { label: 'Microsoft Sentinel SOC', tag: 'Cloud Connector', icon: ShieldCheck },
    { label: 'FastAPI High-Speed Core', tag: 'Asynchronous', icon: Terminal },
    { label: 'Elastic Security Ingestion', tag: 'Log Stream', icon: Layers },
    { label: 'Wazuh Open SOC Gateway', tag: 'Rule Engine', icon: Lock },
    { label: 'CrowdStrike Falcon Intel', tag: 'Threat Mesh', icon: Activity },
  ];

  const row2 = [
    { label: '2D-FFT Spatial Frequency Math', tag: 'Fourier Transform', icon: Binary },
    { label: 'Dual-Tier Native & Tesseract OCR', tag: 'Pixel Extraction', icon: Cpu },
    { label: 'pypdf Binary Stream Parser', tag: 'AST Walker', icon: Lock },
    { label: 'RapidFuzz Brand Fuzzy Matcher', tag: 'Levenshtein Distance', icon: Sparkles },
    { label: 'C2PA Content Credentials Provenance', tag: 'Metadata Profile', icon: Radio },
    { label: 'SHAP Explainable AI Attributions', tag: 'Tree Explainer', icon: Terminal },
  ];

  return (
    <div className="relative w-full py-8 border-y border-white/5 bg-[#030509]/80 backdrop-blur-md overflow-hidden">
      {/* Edge Gradient Masks (SalesHookAI Inspired) */}
      <div 
        className="relative w-full overflow-hidden" 
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
        }}
      >
        {/* Row 1: Leftward Marquee */}
        <div className="flex w-max animate-marquee items-center gap-6 mb-3">
          {[...row1, ...row1].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="pearl-badge flex items-center gap-2.5 px-4 py-2 rounded-full text-xs text-slate-300 shrink-0 hover:border-violet-500/40 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-violet-400" />
                <span className="font-medium text-white">{item.label}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  {item.tag}
                </span>
              </div>
            );
          })}
        </div>

        {/* Row 2: Rightward Reverse Marquee */}
        <div className="flex w-max animate-marquee-reverse items-center gap-6">
          {[...row2, ...row2].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="pearl-badge flex items-center gap-2.5 px-4 py-2 rounded-full text-xs text-slate-300 shrink-0 hover:border-cyan-500/40 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-white">{item.label}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  {item.tag}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
