import React from 'react';
import { Shield, Activity, ArrowRight, LayoutDashboard, Globe, ChevronLeft } from 'lucide-react';

export default function Navbar({ apiStatus, currentView, onViewChange }) {
  const scrollToSection = (sectionId) => {
    if (currentView !== 'landing') {
      onViewChange('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#070a0f]/90 backdrop-blur-md border-b border-white/10 py-3 px-6 md:px-12 flex items-center justify-between transition-all duration-200">
      {/* Brand Logo */}
      <div 
        onClick={() => onViewChange('landing')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-950 border border-sky-400/30 flex items-center justify-center text-sky-400 group-hover:scale-105 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <Shield className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
            SentiGuard
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-1.5 py-0.5 rounded">
            v2.0
          </span>
        </div>
      </div>

      {/* Center Nav Links (Desktop) */}
      <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
        <button
          onClick={() => {
            onViewChange('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`hover:text-cyan-400 transition-colors cursor-pointer ${
            currentView === 'landing' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => scrollToSection('threat-engines')}
          className="hover:text-cyan-400 transition-colors cursor-pointer"
        >
          5 Threat Engines
        </button>
        <button
          onClick={() => scrollToSection('interactive-sandbox')}
          className="hover:text-cyan-400 transition-colors cursor-pointer"
        >
          Live Sandbox
        </button>
        <button
          onClick={() => scrollToSection('architecture')}
          className="hover:text-cyan-400 transition-colors cursor-pointer"
        >
          Architecture
        </button>
        <button
          onClick={() => scrollToSection('comparison')}
          className="hover:text-cyan-400 transition-colors cursor-pointer"
        >
          Comparison
        </button>
        <button
          onClick={() => scrollToSection('api')}
          className="hover:text-cyan-400 transition-colors cursor-pointer"
        >
          API
        </button>
      </div>
      
      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* View Switch Button */}
        {currentView === 'landing' ? (
          <button
            onClick={() => onViewChange('scanner')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Launch Console</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={() => onViewChange('landing')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Platform Overview</span>
          </button>
        )}

        {/* API Status Badge */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-medium text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-white/10">
          {apiStatus === 'online' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="text-emerald-400">Online</span>
            </>
          )}
          {apiStatus === 'connecting' && (
            <>
              <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-amber-400">Connecting...</span>
            </>
          )}
          {apiStatus === 'offline' && (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-rose-400">Offline</span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
