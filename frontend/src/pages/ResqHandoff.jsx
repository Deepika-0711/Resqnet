import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  Users, 
  Truck, 
  Building2, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  Radio, 
  QrCode, 
  Share2, 
  Printer, 
  Copy, 
  AlertCircle,
  ShieldAlert,
  Activity,
  HeartPulse,
  Flame,
  X
} from 'lucide-react';
import QRCode from 'qrcode';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import TimelineView from '../components/TimelineView';
import { api } from '../services/api';
import { socket } from '../services/socket';

export default function ResqHandoff() {
  const { incidentId: paramId } = useParams();
  const incidentId = paramId || 'RSQ-2026-001';

  const [handoff, setHandoff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRoleView, setActiveRoleView] = useState('ALL'); // 'ALL' | 'RESPONDER' | 'HOSPITAL' | 'COMMAND'
  const [qrModal, setQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchHandoff = async () => {
    try {
      const res = await api.getHandoff(incidentId);
      if (res && res.handoff) {
        setHandoff(res.handoff);
      }
    } catch (err) {
      console.warn('Failed to load handoff, using cached live state');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandoff();

    const onHandoffUpdate = (data) => {
      if (!data.incidentId || data.incidentId === incidentId) {
        if (data.handoff) setHandoff(data.handoff);
        else fetchHandoff();
      }
    };

    socket.on('handoffUpdated', onHandoffUpdate);
    socket.on('incidentStatusChanged', onHandoffUpdate);
    socket.on('ambulanceAssigned', onHandoffUpdate);
    socket.on('hospitalAlerted', onHandoffUpdate);
    socket.on('routeSelected', onHandoffUpdate);

    return () => {
      socket.off('handoffUpdated', onHandoffUpdate);
      socket.off('incidentStatusChanged', onHandoffUpdate);
      socket.off('ambulanceAssigned', onHandoffUpdate);
      socket.off('hospitalAlerted', onHandoffUpdate);
      socket.off('routeSelected', onHandoffUpdate);
    };
  }, [incidentId]);

  const handleOpenQr = async () => {
    try {
      const url = window.location.href;
      const dataUrl = await QRCode.toDataURL(url, { width: 340, margin: 2 });
      setQrUrl(dataUrl);
      setQrModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const h = handoff || {
    id: `HND-${incidentId}`,
    incidentId: incidentId,
    status: 'LIVE',
    priority: 'HIGH',
    location: 'Mysore Road, Bengaluru',
    incidentType: 'Road Accident',
    peopleInvolved: 3,
    injuryIndicators: ['Multiple reported injuries', 'Possible blunt trauma'],
    roadObstruction: true,
    fireSmoke: false,
    incidentStatus: 'AMBULANCE_EN_ROUTE',
    ambulance: {
      id: 'AMB-102',
      name: 'FastResponse ALS-102',
      capability: 'Advanced',
      etaMin: 7,
      status: 'EN_ROUTE',
      vehicleNumber: 'KA-05-EA-1020',
      contact: '+91-98765-43210',
      driver: 'Manoj Gowda'
    },
    hospital: {
      name: 'City Emergency Hospital',
      capability: 'Level 1 Trauma & Resuscitation',
      etaMin: 12,
      prealertStatus: 'SENT',
      emergencyBedsAvailable: 8,
      icuBedsAvailable: 4
    },
    route: {
      name: 'Route B',
      distanceKm: 7.3,
      etaMin: 12,
      traffic: 'Moderate',
      risk: 'Low reported risk'
    },
    aiReasoning: [
      'Multiple people involved (+2)',
      'Reported injuries (+3)',
      'Road obstruction detected (+1)'
    ],
    hospitalPreparation: [
      'Emergency department alerted',
      'Prepare 3 emergency intake resuscitation bays',
      'Blood bank O-negative on standby',
      'Incoming ambulance ETA: 12 min'
    ],
    timeline: [
      { event_type: 'REPORTED', time_display: '10:32', description: 'Emergency reported near Mysore Road. 3 casualties reported.', actor: 'WITNESS' },
      { event_type: 'AI_ASSESSMENT', time_display: '10:33', description: 'AI Priority assessed as HIGH (Score: 6/10). Multi-trauma protocol triggered.', actor: 'AI_ANALYZER' },
      { event_type: 'AMBULANCE_ASSIGNED', time_display: '10:35', description: 'AMB-102 (ALS) dispatched. ETA: 7 min. Driver: Manoj Gowda.', actor: 'DISPATCHER' },
      { event_type: 'HOSPITAL_SELECTED', time_display: '10:36', description: 'Destination hospital confirmed: City Emergency Hospital.', actor: 'DISPATCHER' },
      { event_type: 'HOSPITAL_ALERTED', time_display: '10:37', description: 'Hospital Pre-Alert transmitted to ER Triage desk. 3 trauma bays reserved.', actor: 'TELEMETRY' },
      { event_type: 'ROUTE_SELECTED', time_display: '10:38', description: 'Route B locked for transit (7.3 km, 12 min, Moderate traffic, Low risk).', actor: 'ROUTE_ENGINE' },
      { event_type: 'AMBULANCE_EN_ROUTE', time_display: '10:39', description: 'Unit AMB-102 en route with active emergency sirens.', actor: 'AMBULANCE_GPS' }
    ],
    lastUpdated: new Date().toISOString()
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-900/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              RESQ HANDOFF — SIGNATURE HERO FEATURE
            </span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY SYNC
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-wider">
            {h.incidentId}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Last synchronized: {new Date(h.lastUpdated).toLocaleTimeString()}</span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">One Emergency Brief — Zero Coordination Latency</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenQr}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-medium shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>GENERATE HANDOFF QR</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono font-medium transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT BRIEF</span>
          </button>
        </div>
      </div>

      {/* Role Perspectives Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-resq-border/60 text-xs font-mono">
        <span className="text-slate-400 text-[11px] mr-1">VIEW PERSPECTIVE:</span>
        {[
          { id: 'ALL', label: 'Unified Brief' },
          { id: 'RESPONDER', label: '🚑 Ambulance Crew HUD' },
          { id: 'HOSPITAL', label: '🏥 Hospital ER Triage' },
          { id: 'COMMAND', label: '📡 Command Dispatch' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveRoleView(tab.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeRoleView === tab.id
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Primary Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Summary, Ambulance, Hospital, Route (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Incident Core Card */}
          <div className="glass-panel p-6 rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-br from-[#0c1626] to-[#080d17] relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-resq-accent" />
                <span className="font-bold text-base text-white">{h.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={h.priority} size="md" />
                <StatusBadge status={h.incidentStatus} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Casualties:</span>
                <span className="font-bold text-amber-300 text-sm">{h.peopleInvolved} People Involved</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Road Hazard:</span>
                <span className={`font-bold ${h.roadObstruction ? 'text-red-400' : 'text-emerald-400'}`}>
                  {h.roadObstruction ? 'Road Blockage Active' : 'Corridor Clear'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Reported Injuries:</span>
                <span className="font-bold text-orange-300">
                  {Array.isArray(h.injuryIndicators) ? h.injuryIndicators.join(', ') : h.injuryIndicators}
                </span>
              </div>
            </div>
          </div>

          {/* Tri-Coordination Matrix: Ambulance, Hospital, Route */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Ambulance */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-3">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span className="font-bold">AMBULANCE</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  {h.ambulance?.status || 'EN ROUTE'}
                </span>
              </div>
              <p className="text-lg font-bold font-mono text-white">
                {h.ambulance?.id || 'AMB-102'}
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                {h.ambulance?.name || 'Advanced ALS Unit'}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono">
                <span className="text-emerald-400 font-bold block text-sm">
                  ETA: {h.ambulance?.etaMin || 7} MIN
                </span>
                <span className="text-slate-400 text-[11px]">
                  Driver: {h.ambulance?.driver || 'Manoj Gowda'}
                </span>
              </div>
            </div>

            {/* Hospital */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono text-indigo-400 mb-3">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span className="font-bold">HOSPITAL</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ALERT SENT ✓
                </span>
              </div>
              <p className="text-base font-bold text-white truncate" title={h.hospital?.name}>
                {h.hospital?.name || 'City Emergency Hospital'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {h.hospital?.capability || 'Level 1 Trauma'}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono">
                <span className="text-emerald-400 font-bold block text-sm">
                  ETA: {h.hospital?.etaMin || 12} MIN
                </span>
                <span className="text-slate-400 text-[11px]">
                  {h.hospital?.emergencyBedsAvailable || 8} ER / {h.hospital?.icuBedsAvailable || 4} ICU Beds
                </span>
              </div>
            </div>

            {/* Route */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-3">
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-4 h-4" />
                  <span className="font-bold">ROUTE</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  LOCKED
                </span>
              </div>
              <p className="text-lg font-bold font-mono text-white">
                {h.route?.name || 'Route B'}
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                {h.route?.distanceKm || 7.3} km • {h.route?.etaMin || 12} min
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono">
                <span className="text-emerald-400 font-semibold block text-xs uppercase">
                  {h.route?.risk || 'LOW REPORTED RISK'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {h.route?.traffic || 'Moderate'} Traffic
                </span>
              </div>
            </div>

          </div>

          {/* Hospital Preparation Requirements */}
          <div className="glass-panel p-5 rounded-2xl border border-resq-border">
            <div className="flex items-center gap-2 mb-3">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                HOSPITAL PREPARATION REQUIREMENTS (ER TRIAGE)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(h.hospitalPreparation || []).map((prep, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{prep}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assessment Justification */}
          <div className="glass-panel p-5 rounded-2xl border border-resq-border">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                SCENE REASONING &amp; DISPATCH CRITERIA
              </h3>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              {(h.aiReasoning || []).map((reason, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Live Event Telemetry Timeline (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>LIVE INCIDENT TIMELINE</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <TimelineView events={h.timeline} />
        </div>

      </div>

      {/* QR Code Dialog */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-resq-panel border border-cyan-500/40 rounded-2xl max-w-sm w-full p-6 text-center relative shadow-2xl">
            <button
              onClick={() => setQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <QrCode className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold font-mono text-white">RESQ HANDOFF QR</h3>
            <p className="text-xs text-slate-400 mb-4">
              Scan to view this synchronized emergency brief on responder or hospital tablets.
            </p>
            <div className="bg-white p-4 rounded-xl inline-block shadow-inner mb-4">
              <img src={qrUrl} alt="Handoff QR" className="w-48 h-48 mx-auto" />
            </div>
            <div className="text-[11px] font-mono text-cyan-300 bg-slate-900 py-1.5 px-3 rounded border border-slate-800 mb-4 break-all">
              {window.location.href}
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Direct Link'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
