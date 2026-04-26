import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto py-8 text-center text-sm text-slate-500 border-t border-slate-200/60 bg-slate-50/50 backdrop-blur-sm relative z-10">
      <p>SentiGuard v2.0 &nbsp;·&nbsp; AI-Powered Phishing Detection &nbsp;·&nbsp;
        <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
          API Docs
        </a>
      </p>
    </footer>
  );
}
