import React from 'react';
import { ShieldCheck, Cpu, Terminal, CheckCircle2, ArrowRight, Zap, Lock, Layers } from 'lucide-react';

export default function WhoIsSentiGuardFor({ onLaunchConsole }) {
  const personas = [
    {
      title: 'SOC & Incident Response',
      subtitle: 'Tier 1 & Tier 2 Security Operations',
      icon: ShieldCheck,
      description: 'Accelerate alert triage and eliminate false positives. Ingest suspicious customer or employee submissions and receive actionable IOCs in <100ms.',
      bullets: [
        'Automated webhook triage for SIEM & ticketing queues',
        'Standardized MITRE ATT&CK taxonomy & IOC hashes',
        'Zero-trust sandbox execution with zero file rendering risks',
        'Explainable SHAP local feature attribution breakdown'
      ],
      metric: '⚡ 94% Faster Mean Time to Respond (MTTR)'
    },
    {
      title: 'Enterprise SecOps & IT Teams',
      subtitle: 'Corporate Defense & Identity Protection',
      icon: Lock,
      description: 'Stop sophisticated modern attacks targeting executive credentials, supply-chain billing departments, and physical office parking or badge kiosks.',
      bullets: [
        'QR quishing unmasking across physical & digital matrices',
        'Fake PDF invoice & callback extortion lure detection',
        'AI deepfake headshot & synthetic media identification',
        '100% on-premises privacy with zero external cloud leaks'
      ],
      metric: '🛡️ 100% Air-Gapped Data Sovereignty'
    },
    {
      title: 'Security Developers & Gateways',
      subtitle: 'SEGs, Web Firewalls & Automated Bots',
      icon: Terminal,
      description: 'Drop SentiGuard into your existing message security gateways, Slack/Discord abuse bots, or proxy firewalls via high-throughput REST endpoints.',
      bullets: [
        'OpenAPI 3.1 & Swagger interactive documentation',
        'High-performance async FastAPI backend architecture',
        'Multi-format support (Multipart Form, JSON, Base64 buffers)',
        'Container-ready Docker deployment with minimal footprint'
      ],
      metric: '🚀 Sub-85ms Local Forensic Inference'
    }
  ];

  return (
    <section id="use-cases" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
      <div className="max-w-3xl mb-16 space-y-4">
        <span className="inline-flex items-center gap-3 text-sm font-medium text-violet-400">
          <span className="w-8 h-px bg-violet-500"></span>
          Enterprise Use Cases
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Who is SentiGuard Built For?
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          From high-velocity SOC triage desks to corporate email security gateways, SentiGuard delivers unified protection across the modern attack surface.
        </p>
      </div>

      {/* 3 Bento Cards (SalesHookAI Inspired) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {personas.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="group relative p-8 rounded-3xl bg-slate-950/70 border border-white/10 hover:border-violet-500/40 hover:shadow-[0_10px_40px_rgba(124,58,237,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-xl"
            >
              {/* Corner Glow Orb */}
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div>
                <div className="w-12 h-12 rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="text-[11px] font-mono uppercase text-violet-400 tracking-wider font-semibold">
                  {p.subtitle}
                </div>
                <h3 className="text-xl font-bold text-white mt-1 mb-3">
                  {p.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                  {p.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {p.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-white/5 font-mono text-xs font-bold text-violet-300">
                {p.metric}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
