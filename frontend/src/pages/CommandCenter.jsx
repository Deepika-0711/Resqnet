import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  Truck, 
  Building2, 
  AlertTriangle, 
  Activity, 
  MapPin, 
  Clock, 
  RefreshCw, 
  ChevronRight, 
  ShieldAlert, 
  FileText,
  Navigation,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import MapView from '../components/MapView';
import TimelineView from '../components/TimelineView';
import { PriorityBadge, StatusBadge, SimulationBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { socket } from '../services/socket';

export default function CommandCenter() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchDashboard = async () => {
    try {
      const data = await api.getDashboardData();
      if (data) {
        setDashboardData(data);
        if (data.activeIncidents && data.activeIncidents.length > 0) {
          // Keep current selection or default to first
          setSelectedIncident(prev => {
            if (prev) {
              const matched = data.activeIncidents.find(i => i.id === prev.id);
              return matched || data.activeIncidents[0];
            }
            return data.activeIncidents[0];
          });
        }
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const onUpdate = () => {
      fetchDashboard();
    };

    socket.on('dashboardUpdated', onUpdate);
    socket.on('incidentCreated', onUpdate);
    socket.on('incidentStatusChanged', onUpdate);
    socket.on('ambulanceAssigned', onUpdate);
    socket.on('hospitalAlerted', onUpdate);
    socket.on('routeSelected', onUpdate);

    return () => {
      socket.off('dashboardUpdated', onUpdate);
      socket.off('incidentCreated', onUpdate);
      socket.off('incidentStatusChanged', onUpdate);
      socket.off('ambulanceAssigned', onUpdate);
      socket.off('hospitalAlerted', onUpdate);
      socket.off('routeSelected', onUpdate);
    };
  }, []);

  const metrics = dashboardData?.metrics || {
    activeIncidents: 1,
    ambulancesAvailable: 10,
    ambulancesEnRoute: 0,
    hospitalsAvailable: 5
  };

  const activeIncidents = dashboardData?.activeIncidents || [];
  const ambulances = dashboardData?.ambulances || [];
  const hospitals = dashboardData?.hospitals || [];
  const recentLogs = dashboardData?.recentLogs || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 space-y-6">
      
      {/* Top HUD Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-resq-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wider">
              CENTRAL EMERGENCY OPERATIONS CENTER
            </h1>
            <SimulationBadge />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Bengaluru Metropolitan Corridor Real-Time Dispatch &amp; Telemetry Feed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400">
            Last sync: {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchDashboard}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Incidents */}
        <div className="glass-panel p-4 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-950/20 to-slate-900 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-red-400 mb-1">
            <span className="font-bold">ACTIVE INCIDENTS</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">
            {metrics.activeIncidents}
          </p>
          <span className="text-[10px] font-mono text-slate-400 mt-1 block">
            Coordinated via RESQNET
          </span>
        </div>

        {/* Ambulances Available */}
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-1">
            <span className="font-bold">AMBULANCES AVAILABLE</span>
            <Truck className="w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-emerald-400">
            {metrics.ambulancesAvailable}
          </p>
          <span className="text-[10px] font-mono text-slate-400 mt-1 block">
            Stationary &amp; Ready for Dispatch
          </span>
        </div>

        {/* Ambulances En Route */}
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-slate-900 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1">
            <span className="font-bold">AMBULANCES EN ROUTE</span>
            <Navigation className="w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-cyan-400">
            {metrics.ambulancesEnRoute}
          </p>
          <span className="text-[10px] font-mono text-slate-400 mt-1 block">
            Active Sirens &amp; Transit Telemetry
          </span>
        </div>

        {/* Hospitals Available */}
        <div className="glass-panel p-4 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-slate-900 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-blue-400 mb-1">
            <span className="font-bold">HOSPITALS WITH ER BEDS</span>
            <Building2 className="w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-blue-400">
            {metrics.hospitalsAvailable}
          </p>
          <span className="text-[10px] font-mono text-slate-400 mt-1 block">
            Accepting Emergency Admissions
          </span>
        </div>

      </div>

      {/* Main Center Area: Map (Left 8 cols) + Active Incident Inspector (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map View */}
        <div className="lg:col-span-8 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              LIVE EMERGENCY MAP (BENGALURU CORRIDORS)
            </span>
            <span className="text-[11px] font-mono text-cyan-400">Real-time GPS Tracking</span>
          </div>

          <MapView
            incidents={activeIncidents}
            ambulances={ambulances}
            hospitals={hospitals}
            height="480px"
          />
        </div>

        {/* Active Incident Side Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              INCIDENT FOCUS HUD
            </span>
            {selectedIncident && (
              <Link
                to={`/handoff/${selectedIncident.id}`}
                className="text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Handoff</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {selectedIncident ? (
            <div className="glass-panel p-5 rounded-2xl border-2 border-cyan-500/40 space-y-4">
              
              <div className="flex items-center justify-between border-b border-resq-border/60 pb-3">
                <div>
                  <h3 className="font-mono font-extrabold text-lg text-white">
                    {selectedIncident.id}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedIncident.location}</p>
                </div>
                <PriorityBadge priority={selectedIncident.priority} size="sm" />
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">STATUS:</span>
                <StatusBadge status={selectedIncident.status} size="sm" />
              </div>

              {/* People count */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">PEOPLE INVOLVED:</span>
                <span className="font-bold text-amber-300">{selectedIncident.people_count} individuals</span>
              </div>

              {/* Assigned Ambulance */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-cyan-400">
                  <span className="font-bold">ASSIGNED AMBULANCE</span>
                  <span>{selectedIncident.assigned_ambulance_id ? 'DISPATCHED' : 'PENDING'}</span>
                </div>
                <p className="font-bold text-sm text-white">
                  {selectedIncident.assigned_ambulance_id || 'AMB-102'}
                </p>
                <p className="text-emerald-400 font-semibold text-[11px]">
                  Estimated ETA: 7 minutes
                </p>
              </div>

              {/* Selected Hospital */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-indigo-400">
                  <span className="font-bold">DESTINATION HOSPITAL</span>
                  <span className="text-emerald-400 font-bold">PRE-ALERT SENT</span>
                </div>
                <p className="font-bold text-sm text-white truncate">
                  {selectedIncident.selected_hospital_id === 'HOSP-01' ? 'City Emergency Hospital' : 'City Emergency Hospital'}
                </p>
                <p className="text-emerald-400 font-semibold text-[11px]">
                  Estimated ETA: 12 minutes
                </p>
              </div>

              {/* Action Link to Handoff */}
              <Link
                to={`/handoff/${selectedIncident.id}`}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all hover:scale-[1.02]"
              >
                <FileText className="w-4 h-4" />
                <span>OPEN FULL RESQ HANDOFF</span>
              </Link>

            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-resq-border text-center text-xs font-mono text-slate-400">
              No active incident selected.
            </div>
          )}

          {/* Quick Active Incidents Selector */}
          {activeIncidents.length > 1 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase">OTHER ACTIVE INCIDENTS:</span>
              {activeIncidents.map(inc => (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-colors ${
                    selectedIncident?.id === inc.id
                      ? 'bg-slate-800 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>{inc.id} - {inc.location.split(',')[0]}</span>
                  <span className="text-[10px] text-orange-400 font-bold">{inc.priority}</span>
                </button>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Bottom Area: Live Response Timeline Feed */}
      <div className="glass-panel p-6 rounded-2xl border border-resq-border space-y-4">
        <div className="flex items-center justify-between border-b border-resq-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              REAL-TIME DISPATCH &amp; TELEMETRY LOG
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            STREAM ACTIVE
          </span>
        </div>

        <TimelineView events={recentLogs} />
      </div>

    </div>
  );
}
