import React from 'react';
import { Shield, ShieldAlert, Zap, ArrowRight, Activity, Terminal, Eye, Sparkles, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingHero({ onLaunchConsole, onExploreEngines }) {
  return (
    <section className="relative pt-20 pb-20 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-blue-500/15 to-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -top-10 left-10 w-72 h-72 bg-blue-600/10 blur-[90px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-cyan-400/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Column: Mission & CTAs */}
        <div className="lg:col-span-7 text-left space-y-6">
          {/* Status pill */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="tracking-wide">NEXT-GEN MULTIMODAL THREAT PLATFORM</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">SUB-100MS ON-PREM INFERENCE</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]"
          >
            Stop Modern Phishing. <br />
            <span className="text-gradient">Before It Infiltrates.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal"
          >
            SentiGuard defends the full enterprise attack surface beyond traditional URLs. 
            Deep forensic scrutiny across <strong className="text-white font-medium">QR quishing</strong>, <strong className="text-white font-medium">brand visual lures</strong>, <strong className="text-white font-medium">generative AI deepfakes</strong>, and <strong className="text-white font-medium">weaponized PDFs</strong>.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <button
              onClick={onLaunchConsole}
              className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm tracking-wide shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <Shield className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span>Launch Threat Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreEngines}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/30 text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Explore 5 Threat Engines</span>
            </button>
          </motion.div>

          {/* Quick Metrics Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg"
          >
            <div>
              <div className="text-2xl font-bold font-mono text-white">5-in-1</div>
              <div className="text-xs text-slate-400">Multimodal Vectors</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-cyan-400">&lt;85ms</div>
              <div className="text-xs text-slate-400">Avg Scan Latency</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-emerald-400">100%</div>
              <div className="text-xs text-slate-400">Zero Cloud Leak</div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Tactical Radar HUD & Live Threat Hologram */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-5 relative flex items-center justify-center"
        >
          {/* Tactical Radar Container */}
          <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-3xl bg-slate-950/70 border border-cyan-500/20 backdrop-blur-xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.12)] flex flex-col justify-between overflow-hidden">
            {/* Corner Bracket Accents */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

            {/* Top HUD Header */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-white/10 pb-2 z-10">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold tracking-wider">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                RADAR_TELEMETRY.SYS
              </span>
              <span className="text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                ACTIVE HEURISTICS: 36
              </span>
            </div>

            {/* Center Circular Radar Display */}
            <div className="relative my-auto flex items-center justify-center">
              {/* Concentric Radar Rings */}
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-cyan-500/20 flex items-center justify-center relative">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-cyan-500/15 flex items-center justify-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-cyan-500/10 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#06b6d4]" />
                  </div>
                </div>

                {/* Radar Grid Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/15" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/15" />

                {/* Rotating Sweep Beam */}
                <div className="absolute inset-0 rounded-full animate-radar pointer-events-none origin-center">
                  <div 
                    className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left"
                    style={{
                      background: 'conic-gradient(from 180deg at 0% 100%, rgba(6, 182, 212, 0.45) 0deg, rgba(6, 182, 212, 0) 65deg)',
                      borderTopRightRadius: '100%'
                    }}
                  />
                </div>

                {/* Target Beacon 1: Phishing Brand Lure */}
                <div className="absolute top-8 right-12 group cursor-pointer z-20">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
                  </span>
                  <div className="absolute left-4 -top-2 whitespace-nowrap bg-rose-950/90 border border-rose-500/40 text-[10px] font-mono text-rose-300 px-2 py-0.5 rounded shadow-lg backdrop-blur-md">
                    THREAT: Brand Impersonation (98%)
                  </div>
                </div>

                {/* Target Beacon 2: AI Deepfake Spectrum */}
                <div className="absolute bottom-10 left-10 group cursor-pointer z-20">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
                  </span>
                  <div className="absolute right-4 -top-2 whitespace-nowrap bg-amber-950/90 border border-amber-500/40 text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded shadow-lg backdrop-blur-md">
                    WARN: 2D-FFT Grid Discrepancy
                  </div>
                </div>

                {/* Target Beacon 3: Weaponized PDF */}
                <div className="absolute bottom-6 right-16 group cursor-pointer z-20">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_6px_#f43f5e]"></span>
                  </span>
                  <div className="absolute left-4 -top-2 whitespace-nowrap bg-rose-950/90 border border-rose-500/40 text-[10px] font-mono text-rose-300 px-1.5 py-0.5 rounded shadow-lg backdrop-blur-md">
                    /Launch Exploit
                  </div>
                </div>

                {/* Target Beacon 4: Clean DigiCert SSL */}
                <div className="absolute top-14 left-12 group cursor-pointer z-20">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
                  </span>
                  <div className="absolute right-4 -top-2 whitespace-nowrap bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 px-1.5 py-0.5 rounded shadow-lg backdrop-blur-md">
                    VALID: EV SSL Chain
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom HUD Status Strip */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400 z-10">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                AUTONOMOUS DEFENSE
              </span>
              <span className="text-cyan-400">ENGINE_STATE: READY</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
