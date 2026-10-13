import React from 'react';
import { ExternalLink, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto py-8 text-center text-xs text-slate-500 border-t border-white/10 bg-[#070a0f]/90 backdrop-blur-md relative z-10">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-400">SentiGuard Intelligence Platform v2.0</span>
        </div>
        <div className="flex items-center gap-6 font-mono">
          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
          >
            OpenAPI Docs <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="/redoc"
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
          >
            ReDoc <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/geekytan/SentiGuard"
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
          >
            GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
