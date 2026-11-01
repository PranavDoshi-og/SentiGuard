import React, { useState } from 'react';
import { Terminal, Copy, Check, Code2, ExternalLink, Zap } from 'lucide-react';

export default function ApiShowcaseSection() {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    python: `# Ingest and inspect weaponized document in Python
import requests

with open("Suspicious_Invoice.pdf", "rb") as f:
    response = requests.post(
        "http://localhost:8000/api/scan/document",
        files={"file": f}
    )

verdict = response.json()
print(f"Safety Verdict: {verdict['verdict']}")
print(f"Exploit Stream Detected: {verdict['exploit_indicators']['has_launch_action']}")
# Output: Safety Verdict: MALICIOUS_DOCUMENT_EXPLOIT
`,
    curl: `# Fast terminal forensic inspection via cURL
curl -X POST "http://localhost:8000/api/scan/synthetic" \\
     -F "file=@executive_avatar.jpg" \\
     -H "Accept: application/json"

# Response:
# {
#   "verdict": "AI_SYNTHETIC_MEDIA_DETECTED",
#   "synthetic_probability": 0.94,
#   "frequency_analysis": { "fft_slope_alpha": 1.41, "has_checkerboard_grid": true }
# }
`,
    node: `// Node.js / TypeScript SOC Gateway Integration
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const form = new FormData();
form.append('file', fs.createReadStream('phishing_screenshot.png'));

const { data } = await axios.post(
  'http://localhost:8000/api/scan/visual',
  form,
  { headers: form.getHeaders() }
);

if (data.verdict === 'MALICIOUS_BRAND_IMPERSONATION') {
  console.error(\`Alert: Spoofing \${data.brand_analysis.detected_brands.join(', ')}\`);
}
`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[selectedLanguage]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="api" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Copy */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium">
            <Code2 className="w-3.5 h-3.5" />
            DEVELOPER & SOC AUTOMATION
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Seamless REST Integration for Modern SOCs
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            Integrate SentiGuard directly into your email security gateways (SEG), SIEM ingestion queues, web proxy firewalls, or Slack/Discord bot pipelines.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>OpenAPI 3.1 & Swagger interactive docs</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Standardized JSON threat verdicts & MITRE mappings</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Sub-100ms local execution with zero cloud rate limits</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-slate-200 hover:text-white text-xs font-mono transition-all"
            >
              <span>Explore Interactive OpenAPI Docs</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          </div>
        </div>

        {/* Right Code Block */}
        <div className="lg:col-span-7 bg-[#050811] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
          {/* Terminal Titlebar */}
          <div className="bg-slate-950 px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="ml-2 text-xs font-mono text-slate-400">sentiguard_client</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5 text-xs font-mono">
              {['python', 'curl', 'node'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-5 font-mono text-xs overflow-x-auto relative text-slate-300">
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
              title="Copy Code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <pre className="pr-12 text-slate-300 leading-relaxed">
              <code>{codeSnippets[selectedLanguage]}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

