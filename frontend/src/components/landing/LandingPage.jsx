import React from 'react';
import LandingHero from './LandingHero';
import EcosystemMarquee from './EcosystemMarquee';
import PerspectiveDeck from './PerspectiveDeck';
import BentoWorkflow from './BentoWorkflow';
import HubAndSpokeFlow from './HubAndSpokeFlow';
import InteractiveSimulator from './InteractiveSimulator';
import BeforeAfterComparison from './BeforeAfterComparison';
import ThreatTriageCalculator from './ThreatTriageCalculator';
import WhoIsSentiGuardFor from './WhoIsSentiGuardFor';
import ComparisonSection from './ComparisonSection';
import ApiShowcaseSection from './ApiShowcaseSection';
import FaqAccordion from './FaqAccordion';
import { Shield, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage({ onLaunchConsole, onSelectEngine }) {
  const handleExploreEngines = () => {
    const el = document.getElementById('threat-engines');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full flex flex-col space-y-6">
      {/* 1. SalesHookAI Style Hero with Pearl Badges & Radar HUD */}
      <LandingHero 
        onLaunchConsole={onLaunchConsole}
        onExploreEngines={handleExploreEngines}
      />

      {/* 2. Dual-Direction Ecosystem & Partner Marquee with Edge Masks */}
      <EcosystemMarquee />

      {/* 3. 3D Perspective Interactive Platform Deck */}
      <PerspectiveDeck 
        onSelectEngine={onSelectEngine}
      />

      {/* 4. 2x2 Bento Workflow Grid (From Ingest to Neutralization) */}
      <BentoWorkflow />

      {/* 5. Multimodal Intelligence Graph (SVG Bezier Hub & Spoke) */}
      <HubAndSpokeFlow />

      {/* 6. Live Interactive Attack Sandbox / Playground */}
      <InteractiveSimulator 
        onOpenConsoleWithPreset={onSelectEngine}
      />

      {/* 7. Side-by-Side Before vs. After Comparison */}
      <BeforeAfterComparison 
        onLaunchConsole={onLaunchConsole}
      />

      {/* 8. Interactive SOC Triage Acceleration Slider Calculator */}
      <ThreatTriageCalculator 
        onLaunchConsole={onLaunchConsole}
      />

      {/* 9. Target Audience / Who is SentiGuard For Bento Grid */}
      <WhoIsSentiGuardFor 
        onLaunchConsole={onLaunchConsole}
      />

      {/* 10. Comprehensive Head-to-Head Capability Matrix */}
      <ComparisonSection />

      {/* 11. SOC & Developer REST API Showcase */}
      <ApiShowcaseSection />

      {/* 12. Technical Frequently Asked Questions Accordion */}
      <FaqAccordion />

      {/* 13. High-Impact Closing Banner */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="pearl-panel relative rounded-3xl p-8 sm:p-14 text-center overflow-hidden border border-violet-500/30 shadow-[0_0_60px_rgba(124,58,237,0.2)]">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-radial-gradient from-violet-600/15 to-transparent pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="pearl-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span>AIR-GAPPED ON-PREM & DOCKER READY</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Secure Your Threat Surface?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Launch the live scanning console now to test URLs, QR matrices, visual brand impersonation, AI deepfakes, and weaponized PDF invoices in real time.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onLaunchConsole}
                className="gradient-button inline-flex items-center gap-2.5 px-9 py-4 text-white font-bold text-sm tracking-wide group"
              >
                <Shield className="w-4 h-4 text-violet-200" />
                <span>Launch Threat Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
