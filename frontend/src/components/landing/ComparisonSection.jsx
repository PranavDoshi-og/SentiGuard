import React from 'react';
import { Check, X, Shield, Zap, Sparkles } from 'lucide-react';

export default function ComparisonSection() {
  const comparisonData = [
    {
      feature: 'Malicious URL & Domain Heuristics',
      sentiguard: true,
      traditional: true,
      checkphish: true,
      note: '36 multidimensional vectors, WHOIS aging, SSL validity'
    },
    {
      feature: 'QR Matrix & Quishing De-obfuscation',
      sentiguard: true,
      traditional: false,
      checkphish: 'Partial',
      note: 'High-density QR byte decoding & chained redirect traversal'
    },
    {
      feature: 'Visual Brand Phishing & Native OCR',
      sentiguard: true,
      traditional: false,
      checkphish: true,
      note: 'Dual-tier OCR + RapidFuzz matching across top 15 brands'
    },
    {
      feature: 'AI Deepfake & 2D-FFT Spectral Forensics',
      sentiguard: true,
      traditional: false,
      checkphish: false,
      note: 'Spatial frequency slope (α), checkerboard grid, C2PA & IPTC'
    },
    {
      feature: 'Low-Level Weaponized PDF Stream Parsing',
      sentiguard: true,
      traditional: 'Hashes only',
      checkphish: false,
      note: 'Direct parsing for /Launch, /OpenAction & invoice scam heuristics'
    },
    {
      feature: 'Zero Cloud Data Leakage (Air-Gapped Privacy)',
      sentiguard: true,
      traditional: false,
      checkphish: false,
      note: 'Analyzes files entirely in-memory with zero external uploads'
    },
    {
      feature: 'Median Forensic Inference Latency',
      sentiguard: '<100ms',
      traditional: '3s - 15s',
      checkphish: '2s - 5s',
      note: 'Zero cloud queueing delays'
    }
  ];

  return (
    <section id="comparison" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
          <Shield className="w-3.5 h-3.5" />
          COMPETITIVE ARCHITECTURE
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          How SentiGuard Compares
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Traditional scanners rely on static reputation blacklists and external cloud lookups. SentiGuard combines multimodal signal processing, deepfake forensics, and binary exploit parsing into a single unified shield.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto bg-slate-950/70 border border-white/10 rounded-3xl backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs font-mono uppercase text-slate-400">
              <th className="py-5 px-6 font-semibold">Capability Vector</th>
              <th className="py-5 px-6 font-bold text-cyan-400 bg-cyan-950/20 border-x border-cyan-500/20">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  SentiGuard Platform
                </div>
              </th>
              <th className="py-5 px-6 font-medium text-slate-300">Traditional Scanners (VT/URLScan)</th>
              <th className="py-5 px-6 font-medium text-slate-300">Checkphish / Bolster</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {comparisonData.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6">
                  <div className="font-semibold text-white">{row.feature}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{row.note}</div>
                </td>
                
                {/* SentiGuard column */}
                <td className="py-4 px-6 bg-cyan-950/20 border-x border-cyan-500/20">
                  {typeof row.sentiguard === 'boolean' ? (
                    <div className="inline-flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
                      <Check className="w-4 h-4" /> Full Support
                    </div>
                  ) : (
                    <span className="font-mono font-bold text-cyan-300">{row.sentiguard}</span>
                  )}
                </td>

                {/* Traditional Scanners */}
                <td className="py-4 px-6 text-slate-400">
                  {typeof row.traditional === 'boolean' ? (
                    row.traditional ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-300">
                        <Check className="w-3.5 h-3.5 text-slate-400" /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-rose-400/80">
                        <X className="w-3.5 h-3.5" /> No
                      </span>
                    )
                  ) : (
                    <span>{row.traditional}</span>
                  )}
                </td>

                {/* Checkphish */}
                <td className="py-4 px-6 text-slate-400">
                  {typeof row.checkphish === 'boolean' ? (
                    row.checkphish ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-300">
                        <Check className="w-3.5 h-3.5 text-slate-400" /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-rose-400/80">
                        <X className="w-3.5 h-3.5" /> No
                      </span>
                    )
                  ) : (
                    <span>{row.checkphish}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
