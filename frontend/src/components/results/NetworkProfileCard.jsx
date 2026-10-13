import React from 'react';
import { Globe, ShieldCheck, ShieldAlert, Clock, Server, Mail, Lock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NetworkProfileCard({ networkProfile, url }) {
  if (!networkProfile) return null;

  const {
    has_dns_a_record,
    has_dns_mx_record,
    domain_age_days = -1,
    time_to_expiry_days = -1,
    has_valid_ssl,
    ssl_days_to_expiry = -1,
    is_free_ssl_issuer,
  } = networkProfile;

  const formatDays = (days) => {
    if (days === null || days === undefined || days < 0) return 'Unavailable';
    if (days >= 365) {
      const years = (days / 365.25).toFixed(1);
      return `${Math.round(days).toLocaleString()} days (~${years} yrs)`;
    }
    return `${Math.round(days).toLocaleString()} days`;
  };

  const getAgeStatus = (days) => {
    if (days < 0) return { label: 'Unknown', color: 'text-slate-400 bg-slate-800/60 border-slate-700' };
    if (days < 30) return { label: 'Zero-Day (<30d)', color: 'text-rose-400 bg-rose-950/40 border-rose-500/30' };
    if (days < 180) return { label: 'Recent (<6mo)', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' };
    return { label: 'Established', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' };
  };

  const ageStatus = getAgeStatus(domain_age_days);

  return (
    <div className="p-8 border-b border-white/5 bg-slate-900/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          Live Network & Infrastructure Profile
        </h3>
        <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
          Real-Time DNS & WHOIS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Domain Age */}
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Domain Age
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${ageStatus.color}`}>
              {ageStatus.label}
            </span>
          </div>
          <div className="font-mono text-base font-bold text-white">
            {formatDays(domain_age_days)}
          </div>
          {time_to_expiry_days > 0 && (
            <div className="text-[11px] text-slate-400 mt-1">
              Expires in {Math.round(time_to_expiry_days).toLocaleString()} days
            </div>
          )}
        </div>

        {/* DNS Resolution (A Records) */}
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-400" /> DNS A Records
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                has_dns_a_record
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                  : 'text-rose-400 bg-rose-950/40 border-rose-500/30'
              }`}
            >
              {has_dns_a_record ? 'Resolved' : 'No Record'}
            </span>
          </div>
          <div className="font-mono text-base font-bold text-white">
            {has_dns_a_record ? 'Active IP Routing' : 'Unresolvable Host'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {has_dns_a_record ? 'Authoritative nameservers responding' : 'Domain does not route traffic'}
          </div>
        </div>

        {/* Apex Mail Servers (MX Records) */}
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" /> Mail Infrastructure (MX)
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                has_dns_mx_record
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                  : 'text-slate-400 bg-slate-800/40 border-slate-700'
              }`}
            >
              {has_dns_mx_record ? 'Configured' : 'None'}
            </span>
          </div>
          <div className="font-mono text-base font-bold text-white">
            {has_dns_mx_record ? 'Mail Exchange Active' : 'No Mail Servers'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {has_dns_mx_record ? 'Apex domain has verified email routing' : 'Standard for disposable sites'}
          </div>
        </div>

        {/* TLS / SSL Certificate */}
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-400" /> SSL / TLS Certificate
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                has_valid_ssl
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                  : 'text-rose-400 bg-rose-950/40 border-rose-500/30'
              }`}
            >
              {has_valid_ssl ? 'Valid TLS' : 'Invalid / Inactive'}
            </span>
          </div>
          <div className="font-mono text-base font-bold text-white">
            {has_valid_ssl ? 'End-to-End Encrypted' : 'Plaintext / Insecure'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {ssl_days_to_expiry > 0
              ? `Valid for ${Math.round(ssl_days_to_expiry)} more days`
              : has_valid_ssl
              ? 'Certificate verified'
              : 'TLS handshake failed'}
          </div>
        </div>

        {/* Certificate Authority */}
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Certificate Authority
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border text-slate-300 bg-slate-800 border-slate-700">
              {is_free_ssl_issuer ? 'Free / Automated' : 'Standard CA'}
            </span>
          </div>
          <div className="font-mono text-base font-bold text-white">
            {is_free_ssl_issuer ? "Let's Encrypt / ZeroSSL" : 'Enterprise / Commercial CA'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {is_free_ssl_issuer
              ? 'Short-lived automated cert (common in both SaaS and phish)'
              : 'Vetted commercial validation certificate'}
          </div>
        </div>

        {/* Zero-Day Domain Flag */}
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Zero-Day Threat Risk
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                domain_age_days >= 0 && domain_age_days < 14
                  ? 'text-rose-400 bg-rose-950/40 border-rose-500/30 animate-pulse'
                  : 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
              }`}
            >
              {domain_age_days >= 0 && domain_age_days < 14 ? 'High Zero-Day Risk' : 'Low Anomaly'}
            </span>
          </div>
          <div className="font-mono text-base font-bold text-white">
            {domain_age_days >= 0 && domain_age_days < 14
              ? 'New Domain (<14 Days)'
              : 'No Zero-Day Flags'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {domain_age_days >= 0 && domain_age_days < 14
              ? 'Recently registered domains are a primary phishing signal'
              : 'Domain age is consistent with authentic services'}
          </div>
        </div>
      </div>
    </div>
  );
}
