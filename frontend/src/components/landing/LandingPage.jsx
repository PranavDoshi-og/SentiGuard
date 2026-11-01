import React from 'react';
import LandingHero from './LandingHero';
import LiveTelemetryTicker from './LiveTelemetryTicker';
import EngineShowcase from './EngineShowcase';
import InteractiveSimulator from './InteractiveSimulator';
import LowLevelPipeline from './LowLevelPipeline';
import ComparisonSection from './ComparisonSection';
import ApiShowcaseSection from './ApiShowcaseSection';
import { Shield, ArrowRight, Zap, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage({ onLaunchConsole, onSelectEngine }) {
  const handleExploreEngines = () => {
    const el = document.getElementById('threat-engines');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full flex flex-col space-y-4">
      {/* Hero Section with Tactical Radar HUD */}
      <LandingHero 
        onLaunchConsole={onLaunchConsole}
        onExploreEngines={handleExploreEngines}
      />

      {/* Real-Time Telemetry Bar */}
      <LiveTelemetryTicker />

      {/* 5-Pillar Defense Matrix Showcase */}
      <EngineShowcase 
        onSelectEngine={onSelectEngine}
      />

      {/* Interactive Threat Playground / Sandbox */}
      <InteractiveSimulator 
        onOpenConsoleWithPreset={onSelectEngine}
      />

      {/* Deep Pipeline & Architecture */}
      <LowLevelPipeline />

      {/* SentiGuard vs Traditional Scanners Comparison */}
      <ComparisonSection />

      {/* SOC & Developer REST API Showcase */}
      <ApiShowcaseSection />

      {/* Bottom CTA Banner */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/80 border border-cyan-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.15)]">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-radial-gradient from-cyan-500/10 to-transparent pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium">
              <Zap className="w-3.5 h-3.5" />
              DEPLOYABLE ON-PREM & CLOUD
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Secure Your Threat Surface?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Launch the live scanning console now to test URLs, QR codes, visual brand impersonation, AI deepfakes, and weaponized PDF invoices in real-time.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onLaunchConsole}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm tracking-wide shadow-[0_0_35px_rgba(6,182,212,0.45)] transition-all transform hover:scale-105 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-white" />
                <span>Launch Threat Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
