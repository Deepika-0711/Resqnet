import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  ShieldAlert, 
  Truck, 
  Building2, 
  Navigation, 
  Radio, 
  BarChart3, 
  FileText, 
  Wifi, 
  WifiOff, 
  AlertCircle,
  Play
} from 'lucide-react';
import { socket } from '../services/socket';

export default function Navbar() {
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const navItems = [
    { to: '/', label: 'Overview', icon: Activity },
    { to: '/report', label: 'Report Emergency', icon: AlertCircle, highlight: true },
    { to: '/analysis', label: 'AI Analysis', icon: ShieldAlert },
    { to: '/ambulances', label: 'Ambulances', icon: Truck },
    { to: '/hospitals', label: 'Hospitals', icon: Building2 },
    { to: '/map', label: 'Routes & Map', icon: Navigation },
    { to: '/handoff/RSQ-2026-001', label: 'RESQ Handoff', icon: FileText, hero: true },
    { to: '/command-center', label: 'Command Center', icon: Radio },
    { to: '/readiness', label: 'Predictive Readiness', icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-resq-border bg-resq-panel/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-500 p-0.5 shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-resq-dark rounded-[10px] flex items-center justify-center">
                <span className="text-xl">🚑</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-white">RESQ<span className="text-resq-accent">NET</span></span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold">
                  BHARAT INFRA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                AI Accident Coordination Platform
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.hero && location.pathname.startsWith('/handoff'));

              let style = "text-slate-300 hover:text-white hover:bg-slate-800/60";
              if (isActive) {
                style = "text-white bg-slate-800 border-resq-borderLight shadow-sm shadow-cyan-500/5";
              }
              if (item.hero) {
                style = isActive
                  ? "text-cyan-300 bg-cyan-950/70 border-cyan-500/50 shadow-md shadow-cyan-500/20 font-semibold"
                  : "text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/40 border-cyan-800/40";
              }
              if (item.highlight && !isActive) {
                style = "text-red-400 hover:text-red-300 hover:bg-red-950/30";
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-transparent ${style}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.hero ? 'text-cyan-400 animate-pulse' : ''}`} />
                  <span>{item.label}</span>
                  {item.hero && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping ml-0.5" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Status Indicator & Quick Demo */}
          <div className="flex items-center gap-3">
            {/* Live Socket Status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
              isConnected 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">LIVE SYNC</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span className="hidden sm:inline">CONNECTING</span>
                </>
              )}
            </div>

            {/* Quick Demo CTA */}
            <Link
              to="/command-center"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-semibold shadow-md shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>LIVE DEMO</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="lg:hidden flex items-center justify-start overflow-x-auto px-4 py-2 border-t border-resq-border/60 bg-resq-dark/80 gap-2 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || (item.hero && location.pathname.startsWith('/handoff'));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`whitespace-nowrap flex items-center gap-1 px-2.5 py-1 rounded border text-xs ${
                isActive 
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-semibold' 
                  : 'bg-resq-card/60 border-resq-border text-slate-300'
              }`}
            >
              <Icon className="w-3 h-3" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
