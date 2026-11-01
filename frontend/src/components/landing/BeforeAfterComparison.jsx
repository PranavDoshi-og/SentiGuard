import React from 'react';
import { ArrowRight, X, Check, Shield, AlertTriangle } from 'lucide-react';

export default function BeforeAfterComparison({ onLaunchConsole }) {
  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Heading & Context */}
        <div className="lg:col-span-5 space-y-6">
          <div className="pearl-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            <span>BEFORE VS. AFTER</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Traditional Threat Scanners vs. SentiGuard Autonomous Defense
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Legacy reputation engines rely on outdated blacklists and slow cloud APIs that leak sensitive intellectual property. SentiGuard executes locally with sub-second mathematical certainty.
          </p>

          <div className="pt-2">
            <button
              onClick={onLaunchConsole}
              className="gradient-button inline-flex items-center gap-2.5 px-7 py-3.5 text-white font-semibold text-sm tracking-wide group"
            >
              <Shield className="w-4 h-4 text-violet-200" />
              <span>Experience SentiGuard Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Column: Side-by-Side Before vs After Cards (SalesHookAI Inspired) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Legacy Card (Before) */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-rose-300 uppercase font-mono tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Traditional Cloud Threat Scanners
              </h3>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-full">
                Slow & Vulnerable
              </span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Multi-second cloud latency:</strong> Queued remote analysis takes 5 to 30 seconds per file.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Blind to AI deepfakes & quishing:</strong> Ignores QR code matrices and generative image artifacts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Data privacy exposure:</strong> Uploads private customer invoices and documents to public cloud sandboxes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Black-box false positives:</strong> Opaque risk scores without explainable heuristic attribution.</span>
              </li>
            </ul>
          </div>

          {/* SentiGuard Card (After) */}
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-6 backdrop-blur-md shadow-[0_0_30px_rgba(124,58,237,0.15)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-violet-300 uppercase font-mono tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-400" />
                With SentiGuard Intelligence Platform
              </h3>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Sub-100ms On-Prem
              </span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Sub-100ms local execution:</strong> In-memory heuristic pipeline delivers verdicts in &lt;85ms.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Full multimodal coverage:</strong> Neutralizes deceptive URLs, QR codes, brand visual lures, AI deepfakes, and PDF exploits.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Air-gapped privacy guarantee:</strong> Zero external uploads — your confidential files never leave local RAM.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">SHAP explainable AI:</strong> Every verdict includes mathematical feature attributions and actionable mitigation playbooks.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}
