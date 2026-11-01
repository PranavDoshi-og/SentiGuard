import React from 'react';
import { Shield, Activity, ArrowRight, LayoutDashboard, ChevronLeft, Sparkles } from 'lucide-react';

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
    <nav className="sticky top-0 z-50 bg-[#04060b]/90 backdrop-blur-md border-b border-white/10 py-3.5 px-6 md:px-12 flex items-center justify-between transition-all duration-200">
      {/* Brand Logo */}
      <div 
        onClick={() => onViewChange('landing')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-xl bg-violet-950/80 border border-violet-400/40 flex items-center justify-center text-violet-400 group-hover:scale-105 group-hover:border-violet-300 transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)]">
          <Shield className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white tracking-tight group-hover:text-violet-300 transition-colors">
            SentiGuard
          </span>
          <span className="pearl-badge text-[10px] font-semibold uppercase tracking-wider text-violet-300 px-2 py-0.5 rounded-full">
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
          className={`hover:text-violet-400 transition-colors cursor-pointer ${
            currentView === 'landing' ? 'text-violet-400 font-semibold' : ''
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => scrollToSection('threat-engines')}
          className="hover:text-violet-400 transition-colors cursor-pointer"
        >
          Engines
        </button>
        <button
          onClick={() => scrollToSection('workflow')}
          className="hover:text-violet-400 transition-colors cursor-pointer"
        >
          Workflow
        </button>
        <button
          onClick={() => scrollToSection('interactive-sandbox')}
          className="hover:text-violet-400 transition-colors cursor-pointer"
        >
          Live Sandbox
        </button>
        <button
          onClick={() => scrollToSection('use-cases')}
          className="hover:text-violet-400 transition-colors cursor-pointer"
        >
          Use Cases
        </button>
        <button
          onClick={() => scrollToSection('comparison')}
          className="hover:text-violet-400 transition-colors cursor-pointer"
        >
          Comparison
        </button>
        <button
          onClick={() => scrollToSection('api')}
          className="hover:text-violet-400 transition-colors cursor-pointer"
        >
          API
        </button>
        <button
          onClick={() => scrollToSection('faq')}
          className="hover:text-violet-400 transition-colors cursor-pointer"
        >
          FAQ
        </button>
      </div>
      
      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* View Switch Button */}
        {currentView === 'landing' ? (
          <button
            onClick={() => onViewChange('scanner')}
            className="gradient-button inline-flex items-center gap-2 px-4 py-2 text-white text-xs font-semibold tracking-wide cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-violet-200" />
            <span>Launch Console</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={() => onViewChange('landing')}
            className="pearl-badge inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-violet-400" />
            <span>Platform Overview</span>
          </button>
        )}

        {/* API Status Badge */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-medium text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-full border border-white/10">
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
