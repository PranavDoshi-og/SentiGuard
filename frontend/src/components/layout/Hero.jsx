import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative text-center pt-28 pb-20 px-6 overflow-hidden z-10 perspective-1000">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-glow" />
      
      <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-[0.2em] uppercase px-6 py-2 rounded-full mb-10 shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-md">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        Next-Gen Threat Intelligence
      </div>
      
      <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl">
        Detect Phishing <br className="hidden md:block" />
        <span className="text-gradient relative inline-block pb-2 px-2">
          Before It's Too Late
        </span>
      </h1>
      
      <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
        Analyze URLs and QR codes instantly with our advanced machine learning engine. Get a trust score, real-time verdict, and detailed risk breakdown.
      </p>
    </section>
  );
}
