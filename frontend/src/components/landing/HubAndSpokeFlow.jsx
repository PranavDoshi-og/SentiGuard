import React from 'react';
import { 
  Link2, QrCode, Image as ImageIcon, Bot, FileText, 
  ShieldCheck, ArrowRight, Zap, Radio, Lock, Terminal 
} from 'lucide-react';

export default function HubAndSpokeFlow() {
  const inputs = [
    { label: 'Deceptive URLs', icon: Link2, desc: 'Punycode & Entropy' },
    { label: 'Quishing QRs', icon: QrCode, desc: 'Redirect Traversal' },
    { label: 'Brand Visuals', icon: ImageIcon, desc: 'OCR & Logo Match' },
    { label: 'AI Deepfakes', icon: Bot, desc: '2D-FFT Spectrogram' },
    { label: 'Weaponized PDFs', icon: FileText, desc: '/Launch AST Parser' },
  ];

  const outputs = [
    { label: 'Zero-Hour Quarantine', desc: 'Instant Firewall Null-Route', icon: Lock },
    { label: 'SIEM & SOC Export', desc: 'Splunk & Sentinel Feeds', icon: Zap },
    { label: 'Actionable IOCs', desc: 'MITRE ATT&CK Mapping', icon: Terminal },
  ];

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="pearl-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium">
          <Radio className="w-3.5 h-3.5 text-violet-400" />
          MULTIMODAL INTELLIGENCE GRAPH
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          One Core Engine. Infinite Threat Visibility.
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Every incoming attack modality converges into SentiGuard’s mathematical and structural forensic pipeline before routing to your SOC defense stack.
        </p>
      </div>

      {/* SVG Flow Container (SalesHookAI Inspired) */}
      <div className="max-w-4xl mx-auto">
        {/* Top 5 Ingestion Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {inputs.map((inp, idx) => {
            const Icon = inp.icon;
            return (
              <div
                key={idx}
                className="pearl-badge p-3.5 rounded-2xl flex flex-col items-center text-center hover:border-violet-400/50 transition-all hover:-translate-y-1 group"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-2 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">{inp.label}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{inp.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Top SVG Connecting Bezier Lines */}
        <div className="w-full flex justify-center py-1">
          <svg viewBox="0 0 500 80" preserveAspectRatio="none" className="w-full max-w-2xl h-16" style={{ filter: 'drop-shadow(0 0 5px rgba(139,92,246,0.5))' }}>
            <path d="M50,0 C50,50 250,30 250,80" fill="none" stroke="rgba(196,181,253,0.7)" strokeWidth="1.5" className="lp3-hub-line" />
            <path d="M150,0 C150,50 250,30 250,80" fill="none" stroke="rgba(196,181,253,0.7)" strokeWidth="1.5" className="lp3-hub-line" />
            <path d="M250,0 C250,40 250,50 250,80" fill="none" stroke="rgba(196,181,253,0.9)" strokeWidth="2" className="lp3-hub-line" />
            <path d="M350,0 C350,50 250,30 250,80" fill="none" stroke="rgba(196,181,253,0.7)" strokeWidth="1.5" className="lp3-hub-line" />
            <path d="M450,0 C450,50 250,30 250,80" fill="none" stroke="rgba(196,181,253,0.7)" strokeWidth="1.5" className="lp3-hub-line" />
          </svg>
        </div>

        {/* Center Core Engine Node */}
        <div className="flex justify-center my-2">
          <div className="pearl-panel px-8 py-5 rounded-3xl border border-violet-400/40 shadow-[0_0_40px_rgba(124,58,237,0.35)] flex items-center gap-4 hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(124,58,237,0.6)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>SentiGuard Core Forensics</span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  Sub-100ms
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                36 Heuristic Vectors · 2D-FFT Spatial Math · Zero Cloud Leakage
              </div>
            </div>
          </div>
        </div>

        {/* Bottom SVG Connecting Bezier Lines */}
        <div className="w-full flex justify-center py-1">
          <svg viewBox="0 0 500 80" preserveAspectRatio="none" className="w-full max-w-2xl h-16" style={{ filter: 'drop-shadow(0 0 5px rgba(6,182,212,0.5))' }}>
            <path d="M250,0 C250,30 100,50 100,80" fill="none" stroke="rgba(6,182,212,0.7)" strokeWidth="1.5" className="lp3-hub-line" />
            <path d="M250,0 C250,40 250,50 250,80" fill="none" stroke="rgba(6,182,212,0.9)" strokeWidth="2" className="lp3-hub-line" />
            <path d="M250,0 C250,30 400,50 400,80" fill="none" stroke="rgba(6,182,212,0.7)" strokeWidth="1.5" className="lp3-hub-line" />
          </svg>
        </div>

        {/* Bottom 3 SOC Execution Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {outputs.map((out, idx) => {
            const Icon = out.icon;
            return (
              <div
                key={idx}
                className="pearl-badge p-4 rounded-2xl flex flex-col items-center text-center hover:border-cyan-400/50 transition-all hover:-translate-y-1 group"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">{out.label}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{out.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
