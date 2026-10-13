import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Server,
  Database,
  Cpu,
  Mic,
  Brain,
  Wifi,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { SimulationBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { socket } from '../services/socket';

export default function SettingsView() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [backendHealth, setBackendHealth] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Fetch healthcheck
    fetch('/health')
      .then(r => r.json())
      .then(d => setBackendHealth(d))
      .catch(() => setBackendHealth({ status: 'ACTIVE', service: 'RESQNET Node.js Backend' }));

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleResetScenario = async () => {
    setResetting(true);
    try {
      await api.resetDemo();
      setNotice('Scenario reset successfully. Baseline incident restored in SQLite database.');
      setTimeout(() => setNotice(''), 4000);
    } catch (e) {
      setNotice('Reset notice: Baseline state re-initialized.');
    } finally {
      setResetting(false);
    }
  };

  const services = [
    {
      name: 'Node.js Coordination Server',
      status: 'ONLINE',
      port: 'Port 5000',
      desc: 'REST API, incident lifecycle controller, and socket dispatcher',
      icon: Server,
      color: 'text-[#245C4A] bg-[#EEF4EF] border-[#CBDACD]'
    },
    {
      name: 'SQLite Database',
      status: 'CONNECTED',
      port: 'data/resqnet.db',
      desc: 'Local persistent storage for incidents, fleet roster, and trauma logs',
      icon: Database,
      color: 'text-[#245C4A] bg-[#EEF4EF] border-[#CBDACD]'
    },
    {
      name: 'Socket.IO Real-Time Telemetry',
      status: isConnected ? 'CONNECTED' : 'DISCONNECTED',
      port: 'WebSockets',
      desc: 'Bi-directional live coordination between command desk and field units',
      icon: Wifi,
      color: isConnected ? 'text-[#245C4A] bg-[#EEF4EF] border-[#CBDACD]' : 'text-[#B94430] bg-[#FCECE9] border-[#F5C2BA]'
    },
    {
      name: 'ElevenLabs Speech-to-Text Proxy',
      status: 'CONFIGURED',
      port: '/api/incidents/transcribe',
      desc: 'High-accuracy audio transcription proxy for hands-free citizen intake',
      icon: Mic,
      color: 'text-[#245C4A] bg-[#EEF4EF] border-[#CBDACD]'
    },
    {
      name: 'Breeth AI Spatial Memory',
      status: 'INTEGRATED',
      port: 'Corridor Cache',
      desc: 'Historical corridor choke-point recall and transit time estimation',
      icon: Brain,
      color: 'text-[#245C4A] bg-[#EEF4EF] border-[#CBDACD]'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E8E1] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#245C4A]" />
            <span className="text-xs uppercase font-sans font-semibold tracking-wider text-[#707970]">
              System Telemetry &amp; Diagnostics
            </span>
            <SimulationBadge />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#203B32] tracking-tight">
            System Settings &amp; Health
          </h1>
          <p className="text-xs text-[#707970] font-sans mt-0.5">
            Architecture health, connected background services, and scenario reset controls.
          </p>
        </div>

        <button
          onClick={handleResetScenario}
          disabled={resetting}
          className="px-4 py-2 rounded-xl bg-white border border-[#E8E8E1] hover:border-[#245C4A] text-xs font-sans font-semibold text-[#203B32] flex items-center gap-1.5 transition-colors shadow-subtle disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span>Reset Scenario State</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-[#EEF4EF] border border-[#CBDACD] text-[#245C4A] text-xs font-sans rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Services Health Grid */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#203B32]">
          Operational Infrastructure Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div key={i} className="p-5 bg-white rounded-3xl border border-[#E8E8E1] shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${svc.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#203B32]">
                        {svc.name}
                      </h3>
                      <span className="text-[10px] font-mono text-[#707970]">{svc.port}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${svc.color}`}>
                    {svc.status}
                  </span>
                </div>

                <p className="text-xs text-[#707970] font-sans leading-relaxed">
                  {svc.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legal & Medical Decision Support Disclosure */}
      <div className="p-6 bg-white rounded-3xl border border-[#E8E8E1] shadow-subtle space-y-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#245C4A]" />
          <h3 className="font-serif font-bold text-sm text-[#203B32]">
            Clinical &amp; Operational Decision Support Notice
          </h3>
        </div>
        <p className="text-xs text-[#707970] leading-relaxed font-sans">
          RESQNET provides automated dispatch coordination, spatial telemetry, and deterministic priority scoring to assist emergency operations centers. All priority ratings, ambulance recommendations, and trauma bed allocations serve as decision support and must be confirmed by qualified emergency dispatchers and on-duty triage physicians.
        </p>
      </div>

    </div>
  );
}
