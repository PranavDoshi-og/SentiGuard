import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './components/pages/Dashboard';
import LandingPage from './components/landing/LandingPage';
import { checkHealth } from './services/api';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [apiStatus, setApiStatus] = useState('connecting');
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'scanner'
  const [activeScannerTab, setActiveScannerTab] = useState('url');

  useEffect(() => {
    let mounted = true;
    const pollHealth = async () => {
      if (!mounted) return;
      setApiStatus('connecting');
      const isOk = await checkHealth();
      if (mounted) setApiStatus(isOk ? 'online' : 'offline');
    };

    pollHealth();
    const interval = setInterval(pollHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLaunchConsole = (tab = 'url') => {
    const resolvedTab = tab === 'deepfake' ? 'synthetic' : tab;
    setActiveScannerTab(resolvedTab);
    setCurrentView('scanner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOverview = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#070a0f] text-slate-100">
      {/* Precision technical background grid */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 10%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 10%, #000 60%, transparent 100%)'
        }}
      />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          apiStatus={apiStatus} 
          currentView={currentView}
          onViewChange={(view) => {
            if (view === 'scanner') handleLaunchConsole('url');
            else handleBackToOverview();
          }}
        />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            {currentView === 'landing' ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <LandingPage 
                  onLaunchConsole={() => handleLaunchConsole('url')}
                  onSelectEngine={(tab) => handleLaunchConsole(tab)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard 
                  initialTab={activeScannerTab} 
                  onBackToOverview={handleBackToOverview} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
