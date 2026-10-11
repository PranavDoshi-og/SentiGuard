import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './components/pages/Dashboard';
import { checkHealth } from './services/api';

function App() {
  const [apiStatus, setApiStatus] = useState('connecting');

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
        <Navbar apiStatus={apiStatus} />
        <Dashboard />
        <Footer />
      </div>
    </div>
  );
}

export default App;
