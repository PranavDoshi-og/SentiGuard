import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative text-center pt-20 pb-14 px-6 overflow-hidden z-10">
      <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-sky-400/25 text-sky-400 text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-6">
        <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
        Zero-Day Phishing Heuristics
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
        Real-Time Malicious URL & QR Intelligence
      </h1>
      
      <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
        Analyze unknown links and QR code payloads against 25 structural heuristic vectors, lexical anomaly models, and domain obfuscation signatures.
      </p>
    </section>
  );
}
