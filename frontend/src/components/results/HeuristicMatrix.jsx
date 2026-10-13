import React, { useState } from 'react';
import { Layers, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  {
    id: 'all',
    label: 'All Vectors',
  },
  {
    id: 'lexical',
    label: 'Domain & Lexical',
    keys: [
      'url_length',
      'domain_length',
      'num_dots',
      'subdomain_count',
      'num_hyphens',
      'num_digits_in_domain',
      'has_underscore',
      'has_brand_spoofing',
      'has_digit_substitution',
      'is_url_shortener',
    ],
  },
  {
    id: 'security',
    label: 'Security & Obfuscation',
    keys: [
      'has_https',
      'has_http',
      'has_ip_address',
      'has_at_symbol',
      'has_double_slash',
      'has_suspicious_tld',
      'has_login_keyword',
      'has_sensitive_keyword',
      'has_hex_encoding',
      'path_depth',
      'num_params',
    ],
  },
  {
    id: 'network',
    label: 'Network & DNS',
    keys: [
      'has_dns_a_record',
      'has_dns_mx_record',
      'domain_age_days',
      'time_to_expiry_days',
      'has_valid_ssl',
      'ssl_days_to_expiry',
      'is_free_ssl_issuer',
      'is_trusted_domain',
    ],
  },
];

const DESCRIPTIONS = {
  url_length: 'Excessive lengths (>75 chars) commonly conceal redirection paths.',
  domain_length: 'Long domain strings frequently indicate algorithmic generation or typosquatting.',
  num_dots: 'Multiple dots indicate deep subdomain nesting or deceptive host structures.',
  subdomain_count: 'High subdomain count is used to mimic trusted brand infrastructures.',
  num_hyphens: 'Hyphens in hostname are heavily correlated with brand impersonation.',
  num_digits_in_domain: 'Numeric digits in hostnames often indicate disposable DGA domains.',
  has_underscore: 'Rare in legitimate hostnames; used to evade naive filters.',
  has_brand_spoofing: 'Detects lookalike imitation of major trusted brands.',
  has_digit_substitution: 'Detects homoglyphs / leetspeak (e.g. paypa1, micr0soft).',
  is_url_shortener: 'Known URL shorteners (bit.ly, tinyurl) masking destination.',
  has_https: 'Validates encrypted transport protocol (TLS/SSL).',
  has_http: 'Unencrypted transport exposed to plaintext interception.',
  has_ip_address: 'Direct IP address hosts bypass domain reputation tracking.',
  has_at_symbol: 'Userinfo redirect delimiter bypass trick.',
  has_double_slash: 'Embedded // in path indicates open-redirect evasion tricks.',
  has_suspicious_tld: 'Free or low-cost TLDs favored by malicious campaigns.',
  has_login_keyword: 'Contains sensitive auth tokens (login, signin, verify, account).',
  has_sensitive_keyword: 'Contains financial target tokens (banking, wallet, payment).',
  has_hex_encoding: 'Percent-encoded characters used to obfuscate blacklisted tokens.',
  path_depth: 'Directory traversal hierarchy depth.',
  num_params: 'Number of GET query parameters passed to destination.',
  has_dns_a_record: 'Domain resolves to active IPv4 / IPv6 addresses.',
  has_dns_mx_record: 'Apex domain has verified mail exchange infrastructure.',
  domain_age_days: 'Days since domain WHOIS creation.',
  time_to_expiry_days: 'Days remaining before WHOIS domain expiration.',
  has_valid_ssl: 'Valid TLS/SSL certificate installed.',
  ssl_days_to_expiry: 'Days remaining before SSL certificate expiry.',
  is_free_ssl_issuer: "Issued by automated CAs (Let's Encrypt / ZeroSSL).",
  is_trusted_domain: 'Domain matches global verified authority registry.',
};

export default function HeuristicMatrix({ features }) {
  const [activeCategory, setActiveCategory] = useState('all');

  if (!features || Object.keys(features).length === 0) return null;

  const formatKeyName = (k) => {
    return k
      .replace(/^has_/, '')
      .replace(/^is_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getFilteredKeys = () => {
    if (activeCategory === 'all') {
      return Object.keys(features);
    }
    const cat = CATEGORIES.find((c) => c.id === activeCategory);
    return cat ? cat.keys.filter((k) => k in features) : Object.keys(features);
  };

  const filteredKeys = getFilteredKeys();

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            Heuristic Diagnostic Feature Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Multidimensional signal extraction vectors parsed by the zero-day classifier.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredKeys.map((key) => {
          const val = features[key];
          const isBool = typeof val === 'boolean' || val === 0.0 || val === 1.0;
          const boolValue = typeof val === 'boolean' ? val : val === 1.0;
          const desc = DESCRIPTIONS[key] || 'Extracted structural signal for machine learning.';

          // Color classification: is having this value a risk?
          const riskKeys = [
            'has_ip_address',
            'has_at_symbol',
            'has_double_slash',
            'has_suspicious_tld',
            'has_login_keyword',
            'has_sensitive_keyword',
            'has_brand_spoofing',
            'has_digit_substitution',
            'is_url_shortener',
            'has_http',
          ];
          const safeKeys = ['has_https', 'has_dns_a_record', 'has_valid_ssl', 'is_trusted_domain'];

          let valColor = 'text-cyan-400';
          if (isBool) {
            if (riskKeys.includes(key)) {
              valColor = boolValue ? 'text-rose-400' : 'text-slate-400';
            } else if (safeKeys.includes(key)) {
              valColor = boolValue ? 'text-emerald-400' : 'text-rose-400';
            }
          }

          return (
            <div
              key={key}
              className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 p-4 rounded-xl flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-300 truncate" title={key}>
                    {formatKeyName(key)}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {typeof val === 'number' && !isBool
                      ? Number.isInteger(val)
                        ? val
                        : val.toFixed(1)
                      : isBool
                      ? boolValue
                        ? 'TRUE'
                        : 'FALSE'
                      : String(val)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 group-hover:text-slate-400 transition-colors">
                  {desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
