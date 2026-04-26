import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './components/pages/Dashboard';
import { checkHealth } from './services/api';
import Particles from "@tsparticles/react";
import { loadSlim } from "tsparticles-slim"; // Load the slim version for better performance

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

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-950">
      
      {/* Interactive Particle Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false, zIndex: 0 },
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: { enable: true, mode: "repulse" },
                resize: true,
              },
              modes: {
                repulse: { distance: 100, duration: 0.4 },
              },
            },
            particles: {
              color: { value: "#0ea5e9" },
              links: { color: "#3b82f6", distance: 150, enable: true, opacity: 0.2, width: 1 },
              collisions: { enable: false },
              move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: true, speed: 0.8, straight: false },
              number: { density: { enable: true, area: 800 }, value: 60 },
              opacity: { value: 0.3 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 2 } },
            },
            detectRetina: true,
          }}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Soft glowing ambient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar apiStatus={apiStatus} />
        <Dashboard />
        <Footer />
      </div>
    </div>
  );
}

export default App;
