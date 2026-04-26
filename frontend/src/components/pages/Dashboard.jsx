import React, { useState } from 'react';
import Hero from '../layout/Hero';
import UrlScanner from '../scanner/UrlScanner';
import QrScanner from '../scanner/QrScanner';
import ResultPanel from '../results/ResultPanel';
import { scanUrl, scanQr } from '../../services/api';
import { Link2, QrCode, AlertCircle } from 'lucide-react';
import { cn } from '../results/ResultPanel'; 
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('url');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-6 pb-32 relative">
      <Hero />

      {/* Animated Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex bg-slate-900/60 backdrop-blur-xl border border-white/10 p-2 rounded-full mb-12 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative z-20 max-w-md mx-auto"
      >
        <button
          onClick={() => { setActiveTab('url'); setResult(null); setError(null); }}
          className={cn(
            "relative flex-1 flex items-center justify-center gap-3 py-4 rounded-full text-sm font-black tracking-wide transition-colors z-10",
            activeTab === 'url' ? "text-white" : "text-slate-400 hover:text-white"
          )}
        >
          {activeTab === 'url' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <Link2 className="w-5 h-5" /> URL Scanner
        </button>
        <button
          onClick={() => { setActiveTab('qr'); setResult(null); setError(null); }}
          className={cn(
            "relative flex-1 flex items-center justify-center gap-3 py-4 rounded-full text-sm font-black tracking-wide transition-colors z-10",
            activeTab === 'qr' ? "text-white" : "text-slate-400 hover:text-white"
          )}
        >
          {activeTab === 'qr' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <QrCode className="w-5 h-5" /> QR Scanner
        </button>
      </motion.div>

      {/* Scanner Views with AnimatePresence */}
      <div className="relative z-20">
        <AnimatePresence mode="wait">
          {activeTab === 'url' ? (
            <motion.div
              key="url"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <UrlScanner onScan={(url) => handleScan(url, 'url')} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QrScanner onScan={(file, type) => handleScan(file, type)} isLoading={isLoading} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-start gap-4 shadow-[0_0_30px_rgba(239,68,68,0.15)] backdrop-blur-md"
          >
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-200 font-medium text-base leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <ResultPanel result={result} />
        )}
      </AnimatePresence>
    </main>
  );
}
