import React, { useState } from 'react';
import { 
  Link2, QrCode, Image as ImageIcon, Bot, FileText, 
  CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, 
  Cpu, Binary, Lock, Eye, Zap, Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EngineShowcase({ onSelectEngine }) {
  const [activeEngine, setActiveEngine] = useState('url');

  const engines = [
    {
      id: 'url',
      name: 'URL Intelligence',
      badge: '36-Vector Heuristics',
      icon: Link2,
      color: 'blue',
      headline: 'Deep URL & Domain Threat Profiling',
      description: 'Performs multi-layered heuristic analysis, domain aging calculation, SSL chain verification, Shannon entropy calculation, and SHAP explainable AI attribution.',
      latency: '45ms',
      precision: '99.4%',
      features: [
        'IDN homograph & punycode character masquerade detection',
        'Shannon lexical entropy calculation for DGA & cloaked paths',
        'Live WHOIS domain registration aging & registrar reputation',
        'SSL certificate validity, TLS version & leaf issuer hierarchy',
        'SHAP local feature attribution with granular risk weights'
      ],
      sampleThreat: {
        target: 'https://paypaI-security-update.com/verify-login',
        flag: 'HOMOGRAPH_SPOOF',
        risk: 'CRITICAL (99/100)',
        detail: 'Cyrillic uppercase "I" replacing Latin lowercase "l". Registered 4 hours ago.'
      }
    },
    {
      id: 'qr',
      name: 'Quishing & QR Shield',
      badge: 'Byte-Level Matrix Decoding',
      icon: QrCode,
      color: 'cyan',
      headline: 'Physical-to-Digital Attack Neutralization',
      description: 'Decodes high-density QR code matrices with Reed-Solomon error unmasking, traverses chained HTTP redirects, and isolates malicious payloads before device execution.',
      latency: '32ms',
      precision: '99.1%',
      features: [
        'Client & server dual-phase high-entropy matrix decoding',
        'Chained HTTP 301/302 redirect traversal & destination uncloaking',
        'Zero-trust QR payload sandboxing against malicious URL schemes',
        'Camera snapshot & uploaded image artifact de-skewing',
        'Immediate pipe to deep URL forensic pipeline'
      ],
      sampleThreat: {
        target: 'QR Payload -> https://bit.ly/3x8K... -> http://login-parking-pay.xyz',
        flag: 'REDIRECT_CHAIN_SPOOF',
        risk: 'HIGH (88/100)',
        detail: 'Obfuscated shortlink redirecting to untrusted parking fee harvest lure.'
      }
    },
    {
      id: 'visual',
      name: 'Visual Brand Phishing & OCR',
      badge: 'RapidFuzz & Dual OCR',
      icon: ImageIcon,
      color: 'indigo',
      headline: 'Pixel-Level Brand Impersonation Hunter',
      description: 'Extracts visual text via dual-tier OCR (Windows Native / Tesseract), performs fuzzy logo and brand matching for top 15 targets, and detects domain discrepancy traps.',
      latency: '95ms',
      precision: '98.7%',
      features: [
        'Dual-tier OCR pipeline with Windows Native engine fallback',
        'Fuzzy brand matching across Microsoft, Google, PayPal, Chase, Apple',
        'Domain discrepancy logic: flags brand UI hosted on mismatched FQDNs',
        'Social engineering urgency heuristic scoring (urgency keywords)',
        'Automatic callback phone & extracted link extraction'
      ],
      sampleThreat: {
        target: 'Screenshot: Microsoft 365 Login UI hosted on "azure-cdn-blob99.cc"',
        flag: 'VISUAL_BRAND_IMPERSONATION',
        risk: 'CRITICAL (96/100)',
        detail: 'Fuzzy match 98% with Microsoft Corporation; origin domain mismatch confirmed.'
      }
    },
    {
      id: 'deepfake',
      name: 'AI Deepfake & Synthetic Media',
      badge: '2D-FFT Spatial Frequency',
      icon: Bot,
      color: 'purple',
      headline: 'Generative AI Forensic Spectral Analysis',
      description: 'Decomposes image frequencies using 2D Fast Fourier Transform (FFT) to expose generative checkerboard grid artifacts, C2PA Content Credentials, and camera EXIF profiling.',
      latency: '65ms',
      precision: '97.9%',
      features: [
        '2D Fast Fourier Transform (FFT) spatial frequency roll-off analysis',
        'Radial power spectrum slope (α) calculation for generative models',
        'High-frequency periodic checkerboard upsampling grid detection',
        'C2PA Content Credentials & IPTC metadata provenance extraction',
        'Camera hardware EXIF profiling (Lens, Aperture, ISO consistency)'
      ],
      sampleThreat: {
        target: 'Headshot ID Image: synthetic_executive_avatar.jpg',
        flag: 'GENERATIVE_AI_DETECTED',
        risk: 'SYNTHETIC (94% AI)',
        detail: 'FFT slope anomaly α=1.42 with periodic upsampling grid; zero camera sensor noise.'
      }
    },
    {
      id: 'document',
      name: 'Weaponized PDF & Invoices',
      badge: 'Low-Level Stream Parser',
      icon: FileText,
      color: 'emerald',
      headline: 'Exploit-Bearing PDF & Invoice Inspector',
      description: 'Parses binary PDF object trees for executable streams (/JavaScript, /Launch, /OpenAction), extracts embedded URLs, and scores financial invoice scam lures.',
      latency: '78ms',
      precision: '99.5%',
      features: [
        'Low-level pypdf object stream parsing without dangerous rendering',
        'Checks for /JavaScript, /Launch, /OpenAction, /EmbeddedFiles, /SubmitForm',
        'Automatic extraction and scanning of all hyperlinked payloads',
        'Financial invoice scam heuristics (urgency, high totals, callback lines)',
        'Metadata sanity check (anomalous producer, creation date delta)'
      ],
      sampleThreat: {
        target: 'Contract_Agreement_2026.pdf (142 KB)',
        flag: 'MALICIOUS_PDF_EXPLOIT',
        risk: 'CRITICAL (99/100)',
        detail: 'Contains executable /Launch dictionary executing cmd.exe via /OpenAction trigger.'
      }
    }
  ];

  const current = engines.find(e => e.id === activeEngine) || engines[0];
  const CurrentIcon = current.icon;

  return (
    <section id="threat-engines" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/50 border border-blue-500/30 text-blue-400 text-xs font-mono font-medium">
          <Layers className="w-3.5 h-3.5" />
          5-PILLAR DEFENSE MATRIX
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Comprehensive Forensics Across Every Attack Vector
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Modern adversaries pivot from deceptive URLs to visual lures, deepfakes, and weaponized PDF invoices. SentiGuard inspects every layer with zero-latency local intelligence.
        </p>
      </div>

      {/* Interactive Engine Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10 p-1.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl max-w-4xl mx-auto">
        {engines.map((eng) => {
          const Icon = eng.icon;
          const isActive = activeEngine === eng.id;
          return (
            <button
              key={eng.id}
              onClick={() => setActiveEngine(eng.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{eng.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Engine Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeEngine}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-950/80 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
        >
          {/* Left Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <CurrentIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">
                  {current.badge}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">{current.headline}</h3>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              {current.description}
            </p>

            {/* Core Capabilities Checklist */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                CORE FORENSIC VECTORS:
              </div>
              {current.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Launch Tab Button */}
            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => onSelectEngine(current.id)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
              >
                <span>Launch {current.name} in Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Forensic Telemetry Card */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/70 border border-white/10 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono text-slate-400">BENCHMARK_TELEMETRY</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded">
                FIDELITY {current.precision}
              </span>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-mono">SCAN_LATENCY</div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{current.latency}</div>
                <div className="text-[10px] text-slate-500">Median pipeline time</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-mono">ISOLATION</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">Local</div>
                <div className="text-[10px] text-slate-500">Zero cloud transmission</div>
              </div>
            </div>

            {/* Sample Detection Box */}
            <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  REAL-WORLD EXPLOIT CASE
                </span>
                <span className="text-rose-400 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/20">
                  {current.sampleThreat.risk}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-300 break-all bg-black/40 p-2 rounded border border-white/5">
                {current.sampleThreat.target}
              </div>
              <div className="text-[11px] text-slate-400 leading-normal">
                {current.sampleThreat.detail}
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-500 text-center">
              ENGINE IDENTIFIER: <span className="text-slate-300">sentiguard.core.{current.id}_engine</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
