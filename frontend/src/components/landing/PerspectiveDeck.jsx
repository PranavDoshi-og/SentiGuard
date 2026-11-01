import React, { useState } from 'react';
import { 
  Link2, QrCode, Image as ImageIcon, Bot, FileText, 
  ArrowRight, ShieldCheck, AlertTriangle, Activity, Eye, Zap, Lock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PerspectiveDeck({ onSelectEngine }) {
  const [activeTab, setActiveTab] = useState('url');

  const deckData = [
    {
      id: 'url',
      name: 'URL Intelligence',
      badge: '36-Vector Profiling',
      urlPath: 'app.sentiguard.intel/console/url-intelligence',
      icon: Link2,
      headline: 'Real-Time Domain & Lexical Entropy Scrutiny',
      riskScore: 99,
      verdict: 'MALICIOUS_HOMOGRAPH_SPOOF',
      target: 'https://login.microsоft-auth.com/oauth2/authorize',
      stats: [
        { label: 'Latency', value: '42ms' },
        { label: 'Entropy', value: '4.82 bits' },
        { label: 'SSL Issuer', value: 'Untrusted Leaf' },
        { label: 'Domain Age', value: '3.2 Hours' }
      ],
      detail: 'Punycode Cyrillic homograph masquerade detected with zero historical WHOIS reputation and anomalous URL path character distribution.'
    },
    {
      id: 'qr',
      name: 'Quishing & QR Shield',
      badge: 'Byte-Level Matrix De-obfuscation',
      urlPath: 'app.sentiguard.intel/console/quishing-shield',
      icon: QrCode,
      headline: 'Physical-to-Digital Redirect Unmasking',
      riskScore: 91,
      verdict: 'MALICIOUS_QUISHING_REDIRECT',
      target: 'QR [ECC-M] -> https://bit.ly/3x8... -> http://parking-toll-pay.top',
      stats: [
        { label: 'Latency', value: '34ms' },
        { label: 'Matrix', value: 'Version 4 (33x33)' },
        { label: 'Redirect Hops', value: '3 Hops Traversed' },
        { label: 'Harvest Form', value: 'Credit Card Input' }
      ],
      detail: 'Client-side Reed-Solomon de-obfuscation traversed obfuscated shortlink redirect chain leading to an untrusted payment credential harvester.'
    },
    {
      id: 'visual',
      name: 'Visual Brand Phishing & OCR',
      badge: 'Dual-Engine OCR + RapidFuzz',
      urlPath: 'app.sentiguard.intel/console/visual-brand-phishing',
      icon: ImageIcon,
      headline: 'Pixel-Level Brand Impersonation Hunter',
      riskScore: 96,
      verdict: 'MALICIOUS_BRAND_IMPERSONATION',
      target: 'Screenshot: Microsoft 365 Login UI hosted on "azure-cdn-blob99.cc"',
      stats: [
        { label: 'Latency', value: '92ms' },
        { label: 'Fuzzy Brand Match', value: '98% Microsoft' },
        { label: 'Domain Discrepancy', value: 'Confirmed FQDN Lure' },
        { label: 'Extracted Phone', value: '+1 (800) 249-9210' }
      ],
      detail: 'Native Windows & Tesseract OCR extracted textual assets and matched Fortune 500 branding while flagging authoritative domain discrepancy.'
    },
    {
      id: 'synthetic',
      name: 'AI Deepfake & Synthetic Media',
      badge: '2D-FFT Spatial Frequency',
      urlPath: 'app.sentiguard.intel/console/deepfake-spectrogram',
      icon: Bot,
      headline: 'Generative AI Spectral Frequency Forensics',
      riskScore: 94,
      verdict: 'AI_SYNTHETIC_MEDIA_DETECTED',
      target: 'Headshot ID Image: cfo_executive_portrait_hq.jpg (1024x1024)',
      stats: [
        { label: 'Latency', value: '62ms' },
        { label: 'FFT Slope (α)', value: '1.38 (Generative Roll-Off)' },
        { label: 'Grid Artifact', value: 'Checkerboard Detected' },
        { label: 'Sensor Noise', value: 'Zero PRNU Signature' }
      ],
      detail: 'Radial power spectrum slope anomaly proved absence of natural optical sensor noise and presence of diffusion model periodic upsampling grid artifacts.'
    },
    {
      id: 'document',
      name: 'Weaponized PDF & Invoices',
      badge: 'Low-Level Stream Parser',
      urlPath: 'app.sentiguard.intel/console/document-inspector',
      icon: FileText,
      headline: 'Exploit-Bearing Binary Stream Parser',
      riskScore: 100,
      verdict: 'CRITICAL_PDF_EXPLOIT_PAYLOAD',
      target: 'Government_Procurement_Contract_RFP.pdf (195 KB)',
      stats: [
        { label: 'Latency', value: '78ms' },
        { label: 'Exploit Stream', value: '/Launch cmd.exe' },
        { label: 'Trigger Dictionary', value: '/OpenAction Active' },
        { label: 'Embedded Payload', value: 'Compressed EXE' }
      ],
      detail: 'Direct binary object stream inspection discovered weaponized /Launch and /OpenAction routines designed to drop executable shell payloads upon view.'
    }
  ];

  const current = deckData.find(d => d.id === activeTab) || deckData[0];
  const CurrentIcon = current.icon;

  return (
    <section id="threat-engines" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="pearl-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium">
          <span className="w-2 h-2 rounded-full bg-violet-400"></span>
          <span>5-IN-1 FORENSIC ECOSYSTEM</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Your Threat Defense, One Dashboard.
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          URLs, QR matrices, brand visual phishing, deepfakes, and weaponized PDF invoices — all live, all in one place.
        </p>
      </div>

      {/* Pill Tab Switcher (SalesHookAI Style) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10 p-1.5 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-xl max-w-3xl mx-auto">
        {deckData.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'pearl-badge text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] border-violet-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-violet-400" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3D Perspective Card Deck */}
      <div className="relative mx-auto max-w-5xl [perspective:1000px]">
        {/* Ambient Underglow */}
        <div className="absolute -inset-x-10 -inset-y-6 bg-gradient-to-b from-violet-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20, rotateX: 6 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -20, rotateX: -6 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="pearl-panel relative rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/10 border border-white/10"
          >
            {/* Mac / Browser Titlebar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#060810]/90 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="ml-4 text-xs font-mono text-slate-400 hidden sm:inline-block">
                  {current.urlPath}
                </span>
              </div>
              <span className="pearl-badge text-[10px] font-mono text-violet-300 uppercase px-2.5 py-0.5 rounded-full">
                {current.badge}
              </span>
            </div>

            {/* Console Screen Body */}
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <CurrentIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {current.headline}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      ACTIVE_ENGINE: sentiguard.{current.id}_analyzer
                    </p>
                  </div>
                </div>

                <div className="pearl-badge px-3.5 py-1.5 rounded-full flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {current.riskScore}/100 THREAT VERDICT
                  </span>
                </div>
              </div>

              {/* Inspected Stream Box */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-slate-400">LIVE_PAYLOAD_STREAM:</div>
                <div className="text-xs font-mono text-violet-300 bg-black/60 p-3.5 rounded-xl border border-white/10 break-all select-all">
                  {current.target}
                </div>
              </div>

              {/* Forensic Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {current.stats.map((s, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5">
                    <div className="text-[11px] font-mono text-slate-400">{s.label}</div>
                    <div className="text-sm sm:text-base font-bold font-mono text-white mt-1">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Forensic Description */}
              <div className="bg-violet-950/20 border border-violet-500/20 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
                <strong className="text-violet-400 font-mono">FORENSIC_FINDING: </strong>
                {current.detail}
              </div>

              {/* Direct Console Launch CTA */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-slate-400 font-mono">
                  Sub-100ms on-premises execution · Zero cloud data leak
                </span>

                <button
                  onClick={() => onSelectEngine(current.id)}
                  className="gradient-button inline-flex items-center gap-2 px-6 py-3 text-white font-medium text-xs sm:text-sm group"
                >
                  <span>Launch {current.name} Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
