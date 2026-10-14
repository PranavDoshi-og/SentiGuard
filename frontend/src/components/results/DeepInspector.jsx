import React, { useState } from 'react';
import {
  Server,
  Globe,
  Calendar,
  Building,
  Shield,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  Cpu,
  Layers,
  Clock,
} from 'lucide-react';

export default function DeepInspector({ deepInspector, networkProfile }) {
  const [copiedIp, setCopiedIp] = useState(null);

  if (!deepInspector && !networkProfile) return null;

  const whois = deepInspector?.whois || {};
  const hosting = deepInspector?.hosting_asn || {};

  const registrar = whois.registrar || networkProfile?.registrar || 'Private / Redacted';
  const creationDate = whois.creation_date;
  const expirationDate = whois.expiration_date;
  const statusList = whois.status || [];
  const nameServers = whois.name_servers || [];

  const primaryIp = hosting.primary_ip || networkProfile?.primary_ip || 'Unresolved';
  const resolvedIps = hosting.resolved_ips?.length > 0 ? hosting.resolved_ips : (primaryIp !== 'Unresolved' ? [primaryIp] : []);
  const asn = hosting.asn || networkProfile?.asn || 'Unknown ASN';
  const asName = hosting.as_name || networkProfile?.as_name || 'Autonomous System Unregistered';
  const country = hosting.country || networkProfile?.country || 'Global';
  const cidr = hosting.cidr || 'N/A';
  const reverseDns = hosting.reverse_dns || 'No PTR Record';

  const formatDate = (isoString) => {
    if (!isoString) return 'Unavailable';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const handleCopyIp = (ip) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  return (
    <div className="p-8 border-b border-white/5 bg-slate-950/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            Deep Domain & Infrastructure Inspector
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative WHOIS registry attribution, Autonomous System (ASN), and BGP routing intelligence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {whois.source && (
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-md">
              Source: {whois.source}
            </span>
          )}
          <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            Phase 4 Telemetry
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── CARD 1: WHOIS Registry Intelligence ───────────────── */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  WHOIS Domain Registration
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                ICANN Registry
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Registrar */}
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                  <Shield className="w-3.5 h-3.5 text-slate-500" /> Registrar
                </span>
                <span className="font-mono font-semibold text-slate-200 text-right truncate max-w-[240px]" title={registrar}>
                  {registrar}
                </span>
              </div>

              {/* Registered On */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Registered On
                </span>
                <span className="font-mono font-medium text-slate-200">
                  {formatDate(creationDate)}
                </span>
              </div>

              {/* Expiration Date */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Expiry Date
                </span>
                <span className="font-mono font-medium text-slate-200">
                  {formatDate(expirationDate)}
                </span>
              </div>

              {/* Nameservers */}
              {nameServers.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                    Authoritative Name Servers ({nameServers.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {nameServers.slice(0, 4).map((ns, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-slate-950/80 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                      >
                        {ns}
                      </span>
                    ))}
                    {nameServers.length > 4 && (
                      <span className="text-[10px] font-mono text-slate-500 px-1 py-0.5">
                        +{nameServers.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Domain Status Flags */}
              {statusList.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                    Registry Security Status
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                    {statusList.slice(0, 3).map((st, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono text-cyan-300 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20 truncate max-w-[200px]"
                        title={st}
                      >
                        {st.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CARD 2: Hosting, ASN & BGP Network ───────────────── */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Hosting & ASN Routing
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-rose-400" /> {country}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Primary IP */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                  <Globe className="w-3.5 h-3.5 text-blue-400" /> Primary Resolved IP
                </span>
                <div className="inline-flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                  <span className="font-mono font-bold text-white text-xs">
                    {primaryIp}
                  </span>
                  {primaryIp !== 'Unresolved' && (
                    <button
                      onClick={() => handleCopyIp(primaryIp)}
                      className="text-slate-400 hover:text-white p-0.5 transition-colors"
                      title="Copy IP"
                    >
                      {copiedIp === primaryIp ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* ASN & Organization */}
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Autonomous System
                </span>
                <div className="text-right">
                  <div className="font-mono font-bold text-purple-300">
                    {asn}
                  </div>
                  <div className="text-[11px] text-slate-400 max-w-[220px] truncate" title={asName}>
                    {asName}
                  </div>
                </div>
              </div>

              {/* CIDR Prefix */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                  <Layers className="w-3.5 h-3.5 text-slate-500" /> BGP IP Prefix
                </span>
                <span className="font-mono font-medium text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/80">
                  {cidr}
                </span>
              </div>

              {/* Reverse DNS PTR */}
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                  <Globe className="w-3.5 h-3.5 text-teal-400" /> Reverse DNS (PTR)
                </span>
                <span className="font-mono text-slate-300 text-right truncate max-w-[220px]" title={reverseDns}>
                  {reverseDns}
                </span>
              </div>

              {/* Additional Resolved IPs */}
              {resolvedIps.length > 1 && (
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                    All Resolved Address Records ({resolvedIps.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                    {resolvedIps.map((ip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCopyIp(ip)}
                        className="text-[10px] font-mono bg-slate-950/80 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1 transition-colors"
                        title="Click to copy IP"
                      >
                        {ip}
                        {copiedIp === ip && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
