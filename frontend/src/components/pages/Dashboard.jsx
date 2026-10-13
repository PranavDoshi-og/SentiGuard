import React, { useState, useEffect } from 'react';
import Hero from '../layout/Hero';
import UrlScanner from '../scanner/UrlScanner';
import QrScanner from '../scanner/QrScanner';
import ResultPanel from '../results/ResultPanel';
import AuditLog from '../history/AuditLog';
import { scanUrl, scanQr } from '../../services/api';
import { Link2, QrCode, AlertCircle } from 'lucide-react';
import { cn } from '../results/ResultPanel';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'sentiguard_session_history';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('url');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveToHistory = (scanData) => {
    if (!scanData || !scanData.url) return;
    const entry = {
      url: scanData.url,
      verdict: scanData.verdict,
      trust_score: scanData.trust_score,
      confidence: scanData.confidence,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.url !== scanData.url);
      const updated = [entry, ...filtered].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleScan = async (input, type = 'url') => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let data;
      if (type === 'url') {
        let finalUrl = input.trim();
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
          finalUrl = `https://${finalUrl}`;
        }
        data = await scanUrl(finalUrl);
      } else {
        data = await scanQr(input);
      }
      setResult(data);
      saveToHistory(data);
    } catch (err) {
      setError(err.message || 'Scanning failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReScan = (url) => {
    setActiveTab('url');
    handleScan(url, 'url');
  };

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-32 relative">
      <Hero />

      {/* Animated Tab Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex bg-slate-900/70 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative z-20 max-w-sm mx-auto"
      >
        <button
          onClick={() => {
            setActiveTab('url');
            setError(null);
          }}
          className={cn(
            'relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold tracking-wide transition-colors z-10',
            activeTab === 'url' ? 'text-white' : 'text-slate-400 hover:text-white'
          )}
        >
          {activeTab === 'url' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] -z-10"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Link2 className="w-4 h-4" /> URL Intelligence
        </button>
        <button
          onClick={() => {
            setActiveTab('qr');
            setError(null);
          }}
          className={cn(
            'relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold tracking-wide transition-colors z-10',
            activeTab === 'qr' ? 'text-white' : 'text-slate-400 hover:text-white'
          )}
        >
          {activeTab === 'qr' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] -z-10"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <QrCode className="w-4 h-4" /> QR Optical Scanner
        </button>
      </motion.div>

      {/* Scanner Section */}
      <div className="relative z-20">
        <AnimatePresence mode="wait">
          {activeTab === 'url' ? (
            <motion.div
              key="url"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25 }}
            >
              <UrlScanner onScan={(url) => handleScan(url, 'url')} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
            >
              <QrScanner onScan={(payload, type) => handleScan(payload, type)} isLoading={isLoading} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 flex items-start gap-3 shadow-[0_0_30px_rgba(244,63,94,0.15)] backdrop-blur-md"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-rose-200 text-sm leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan Results Panel */}
      <AnimatePresence>
        {result && <ResultPanel result={result} />}
      </AnimatePresence>

      {/* Session Audit History */}
      <AuditLog history={history} onClearHistory={handleClearHistory} onReScan={handleReScan} />
    </main>
  );
}
