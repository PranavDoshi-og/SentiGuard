import React from 'react';
import { Shield, Activity, Wifi, WifiOff } from 'lucide-react';

export default function Navbar({ apiStatus }) {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/10 py-5 px-6 md:px-12 flex items-center justify-between transition-all duration-300 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">
          <Shield className="w-8 h-8 text-white drop-shadow-md" />
        </div>
        <span className="text-2xl font-black text-white tracking-tighter drop-shadow-sm">SentiGuard</span>
      </div>
      
      <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-slate-300 bg-slate-900/80 px-5 py-2.5 rounded-full border border-slate-700 shadow-inner">
        {apiStatus === 'online' && (
          <>
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400">System Online</span>
            <span className="relative flex h-2.5 w-2.5 ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></span>
            </span>
          </>
        )}
        {apiStatus === 'connecting' && (
          <>
            <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-amber-400">Connecting...</span>
          </>
        )}
        {apiStatus === 'offline' && (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-400">System Offline</span>
          </>
        )}
      </div>
    </nav>
  );
}
