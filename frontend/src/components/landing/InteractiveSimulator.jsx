import React, { useState } from 'react';
import { 
  ShieldAlert, CheckCircle, AlertTriangle, Terminal, 
  ArrowRight, ShieldCheck, Cpu, Play, Flame, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InteractiveSimulator({ onOpenConsoleWithPreset }) {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);

  const scenarios = [
    {
      id: 'homograph',
      title: 'Punycode Homograph Lure',
      category: 'URL Intelligence',
      tab: 'url',
      threatScore: 99,
      verdict: 'MALICIOUS_HOMOGRAPH_SPOOF',
      verdictType: 'danger',
      target: 'https://login.microsоft-auth.com/oauth2/authorize?client_id=sec',
      iocs: [
        { label: 'Character Spoof', val: 'Cyrillic "о" (U+043E) masquerading as Latin "o"' },
        { label: 'Domain Age', val: 'Created 3 hours ago via NameCheap' },
        { label: 'SSL Profile', val: 'Let\'s Encrypt free leaf (No Extended Validation)' },
        { label: 'Entropy Score', val: '4.82 bits/symbol (High Path Cloaking)' }
      ],
      explanation: 'Attacker leverages an Internationalized Domain Name (IDN) homograph trap to visually spoof Microsoft 365 single sign-on.'
    },
    {
      id: 'quishing',
      title: 'Parking Meter Quishing Trap',
      category: 'QR Shield',
      tab: 'qr',
      threatScore: 91,
      verdict: 'MALICIOUS_QUISHING_REDIRECT',
      verdictType: 'danger',
      target: 'QR Matrix [ECC-Level M] -> https://qr-pay.xyz/meter-chicago?id=921',
      iocs: [
        { label: 'Matrix Encoding', val: 'Version 4 QR (33x33) with byte mode' },
        { label: 'Hop Traversal', val: '302 Found -> harvest-gate-pay.top' },
        { label: 'Form Extraction', val: 'Credit card input field found in target DOM' },
        { label: 'Physical Threat', val: 'Sticker overlay on public payment kiosk' }
      ],
      explanation: 'Decodes obfuscated QR payload and traverses multi-hop HTTP redirect chain leading to an unverified payment credential harvester.'
    },
    {
      id: 'fake-invoice',
      title: 'GeekSquad Scam PDF Invoice',
      category: 'PDF & Invoices',
      tab: 'document',
      threatScore: 94,
      verdict: 'MALICIOUS_INVOICE_LURE',
      verdictType: 'danger',
      target: 'PDF Document: GeekSquad_TotalSecurity_Renewal_INV-9812.pdf',
      iocs: [
        { label: 'Extracted Total', val: '$849.99 USD auto-charged within 24 hours' },
        { label: 'Callback Phone', val: '+1 (888) 492-3019 (Known VoIP Call Center Lure)' },
        { label: 'Urgency Heuristics', val: 'HIGH ("auto-debit", "non-refundable", "call now")' },
        { label: 'Producer Inconsistency', val: 'Created with Canva, claiming Microsoft Corporation' }
      ],
      explanation: 'Low-level PDF stream parsing uncovered high-urgency financial extortion lures, toll-free callback traps, and forged enterprise headers.'
    },
    {
      id: 'deepfake',
      title: 'Synthetic Executive Persona',
      category: 'AI Deepfake & Media',
      tab: 'deepfake',
      threatScore: 96,
      verdict: 'AI_SYNTHETIC_MEDIA_DETECTED',
      verdictType: 'danger',
      target: 'Headshot ID: cfo_executive_portrait_hq.jpg (1024x1024)',
      iocs: [
        { label: '2D-FFT Spatial Slope', val: 'α = 1.38 (Generative model signature roll-off)' },
        { label: 'Upsampling Artifacts', val: 'Periodic checkerboard grid anomalies detected' },
        { label: 'Provenance Metadata', val: 'C2PA/IPTC claims Midjourney v6 Diffusion model' },
        { label: 'Sensor Noise Fingerprint', val: 'Zero physical CMOS PRNU sensor pattern' }
      ],
      explanation: 'Radial power spectrum slope and 2D spatial frequency analysis proved absence of natural optical photon shot noise and presence of diffusion upsampling artifacts.'
    },
    {
      id: 'pdf-macro',
      title: 'Weaponized Government RFP PDF',
      category: 'PDF Exploit Hunter',
      tab: 'document',
      threatScore: 100,
      verdict: 'CRITICAL_PDF_EXPLOIT_PAYLOAD',
      verdictType: 'danger',
      target: 'DoD_CyberDefense_Contract_RFP.pdf (210 KB)',
      iocs: [
        { label: 'Exploit Stream', val: '/Launch action invoking powershell.exe -w hidden' },
        { label: 'Trigger Dictionary', val: '/OpenAction active (executes immediately on view)' },
        { label: 'Embedded Files', val: 'Compressed payload.zip in /EmbeddedFiles catalog' },
        { label: 'Sandbox Warning', val: 'Zero user interaction required for payload staging' }
      ],
      explanation: 'Binary object dictionary inspection discovered weaponized /Launch and /OpenAction routines designed to drop shell payloads.'
    }
  ];

  const current = scenarios[selectedScenarioIndex];

  return (
    <section id="interactive-sandbox" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium">
          <Play className="w-3.5 h-3.5 fill-cyan-400" />
          INTERACTIVE THREAT PLAYGROUND
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Inspect Real-World Zero-Hour Exploits
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Select any real-world attack scenario below to explore how SentiGuard’s low-level forensic engines unmask disguised payloads in milliseconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Scenario List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            SELECT ATTACK SCENARIO:
          </div>
          {scenarios.map((scen, idx) => {
            const isSelected = selectedScenarioIndex === idx;
            return (
              <button
                key={scen.id}
                onClick={() => setSelectedScenarioIndex(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-950/50 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.15)] text-white'
                    : 'bg-slate-900/40 border-white/5 hover:border-white/20 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/20">
                      {scen.category}
                    </span>
                    <span className="text-xs font-bold text-rose-400 font-mono">
                      {scen.threatScore}/100 THREAT
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {scen.title}
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Live Forensic Telemetry Terminal */}
        <div className="lg:col-span-7 bg-[#0b0f19] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_40px_rgba(6,182,212,0.1)] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    SIMULATED PAYLOAD FORENSICS
                  </span>
                  <h4 className="text-lg font-bold text-white mt-0.5">{current.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {current.verdict}
                  </span>
                </div>
              </div>

              {/* Target Stream */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-slate-400">INSPECTED_TARGET_STREAM:</div>
                <div className="text-xs font-mono text-cyan-300 bg-black/60 p-3 rounded-xl border border-white/10 break-all select-all">
                  {current.target}
                </div>
              </div>

              {/* Indicators of Compromise (IOCs) */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400">INDICATORS_OF_COMPROMISE (IOCs):</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {current.iocs.map((ioc, idx) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs">
                      <div className="text-[11px] font-mono text-slate-400">{ioc.label}</div>
                      <div className="text-xs font-mono text-slate-200 mt-1">{ioc.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Explanation */}
              <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
                <strong className="text-cyan-400 font-mono">FORENSIC_SUMMARY: </strong>
                {current.explanation}
              </div>

              {/* Console Deep-Dive CTA */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Ready to test real production files?
                </div>

                <button
                  onClick={() => onOpenConsoleWithPreset(current.tab)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-medium text-xs tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                >
                  <span>Open in {current.category} Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
