import React from 'react';
import { Shield, Activity, Wifi, WifiOff } from 'lucide-react';

export default function Navbar({ apiStatus }) {
  return (
    <nav className="sticky top-0 z-50 bg-[#070a0f]/90 backdrop-blur-md border-b border-white/10 py-3.5 px-6 md:px-12 flex items-center justify-between transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-blue-950 border border-sky-400/30 flex items-center justify-center text-sky-400">
          <Shield className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white tracking-tight">SentiGuard</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
            Threat Intel
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-300 bg-slate-900 px-3 py-1.5 rounded-md border border-white/10">
        {apiStatus === 'online' && (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            <span className="text-emerald-400">API Online</span>
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
            <span className="text-rose-400">API Offline</span>
          </>
        )}
      </div>
    </nav>
  );
}
