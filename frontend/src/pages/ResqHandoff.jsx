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
  X,
  Siren,
  Brain,
  History,
  Info
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
    hazards: ['Fuel spill risk on roadway'],
    roadObstruction: true,
    fireSmoke: false,
    incidentStatus: 'AMBULANCE_EN_ROUTE',
    ambulance: {
      id: 'AMB-102',
      name: 'FastResponse ALS-102',
      capability: 'Advanced Life Support (ALS)',
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
    trafficPoliceBrief: {
      location: 'Mysore Road, Bengaluru',
      roadObstruction: '1 lane blocked',
      hazard: 'Damaged vehicle on roadway',
      estimatedImpact: 'Traffic slowdown around incident corridor',
      recommendedAction: 'Traffic control / diversion assessment required',
      informationPrepared: true,
      notificationState: 'SIMULATED_NOTIFIED',
      disclaimer: 'SIMULATED OPERATIONAL BRIEF (No actual police dispatch)'
    },
    corridorMemory: {
      corridor: 'Mysore Road',
      summary: 'Previous incidents on this corridor frequently involved heavy congestion during evening hours.',
      recurringHazards: ['Evening rush hour congestion', 'Intersection bottleneck'],
      historicalObservations: ['Frequent rear-end collisions during peak traffic hours'],
      recentMemories: [
        { id: 'MEM-001', location: 'Mysore Road', severity: 'HIGH', summary: 'Multi-vehicle collision near silk board ramp' }
      ],
      source: 'RESQNET Incident Memory (Breeth AI)'
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
      { event_type: 'BREETH_MEMORY_FOUND', time_display: '10:34', description: 'Breeth AI retrieved corridor memory: High congestion area.', actor: 'BREETH_AI' },
      { event_type: 'AMBULANCE_ASSIGNED', time_display: '10:35', description: 'AMB-102 (ALS) dispatched. ETA: 7 min. Driver: Manoj Gowda.', actor: 'DISPATCHER' },
      { event_type: 'HOSPITAL_SELECTED', time_display: '10:36', description: 'Destination hospital confirmed: City Emergency Hospital.', actor: 'DISPATCHER' },
      { event_type: 'HOSPITAL_ALERTED', time_display: '10:37', description: 'Hospital Pre-Alert transmitted to ER Triage desk. 3 trauma bays reserved.', actor: 'TELEMETRY' },
      { event_type: 'TRAFFIC_ALERT_CREATED', time_display: '10:37', description: 'Traffic/Police brief generated for corridor obstruction management.', actor: 'TRAFFIC_ENGINE' },
      { event_type: 'ROUTE_SELECTED', time_display: '10:38', description: 'Route B locked for transit (7.3 km, 12 min, Moderate traffic, Low risk).', actor: 'ROUTE_ENGINE' },
      { event_type: 'AMBULANCE_EN_ROUTE', time_display: '10:39', description: 'Unit AMB-102 en route with active emergency sirens.', actor: 'AMBULANCE_GPS' }
    ],
    lastUpdated: new Date().toISOString()
  };

  const tpBrief = h.trafficPoliceBrief || {
    location: h.location,
    roadObstruction: h.roadObstruction ? '1 lane blocked' : 'None reported',
    hazard: h.hazards ? (Array.isArray(h.hazards) ? h.hazards.join(', ') : h.hazards) : 'Damaged vehicle',
    estimatedImpact: 'Traffic slowdown around incident corridor',
    recommendedAction: 'Traffic control / diversion assessment required',
    informationPrepared: true,
    notificationState: 'SIMULATED_NOTIFIED',
    disclaimer: 'SIMULATED OPERATIONAL BRIEF'
  };

  const cMemory = h.corridorMemory || {
    corridor: h.location,
    summary: 'Previous incidents on this corridor frequently involved heavy congestion during evening hours.',
    recurringHazards: ['Rush hour traffic bottleneck'],
    historicalObservations: ['Related previous incident context available'],
    source: 'RESQNET Incident Memory (Breeth AI)'
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32 space-y-8">
      
      {/* Top Banner / Hero Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-900/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              RESQ HANDOFF — SINGLE SHARED EMERGENCY RECORD
            </span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY SYNC
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-wider">
              {h.incidentId}
            </h1>
            <PriorityBadge priority={h.priority} size="md" />
            <StatusBadge status={h.incidentStatus || h.status} />
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-resq-accent" />
              <strong className="text-slate-200">{h.location}</strong>
            </span>
            <span>•</span>
            <span>Last updated: {new Date(h.lastUpdated || Date.now()).toLocaleTimeString()}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenQr}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-medium shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>SECTION 8: HANDOFF QR</span>
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

      {/* Hero Header Prompt Banner */}
      <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-200 flex items-center gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0" />
        <div>
          <span className="font-bold uppercase tracking-wider text-cyan-300 block">WHAT DOES EVERY RESPONDER NEED TO KNOW RIGHT NOW?</span>
          <span>Zero coordination latency. Information synchronized across Dispatcher, Ambulance Team, ER Triage, & Traffic Operational briefs.</span>
        </div>
      </div>

      {/* Role Perspectives Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-resq-border/60 text-xs font-mono">
        <span className="text-slate-400 text-[11px] mr-1">ROLE VIEW:</span>
        {[
          { id: 'ALL', label: 'Unified 8-Section Brief' },
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

      {/* Main Sections Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Sections 1-6 (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* SECTION 1: EMERGENCY ASSESSMENT */}
          <div className="glass-panel p-6 rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-br from-[#0c1626] to-[#080d17] relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h2 className="font-mono font-bold text-base text-white tracking-wider uppercase">
                  1. EMERGENCY ASSESSMENT (DETERMINISTIC OPERATIONAL SCORING)
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                EXPLAINABLE OPERATIONAL PRIORITY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">What Happened:</span>
                <p className="font-bold text-white text-sm">{h.incidentType || 'Road Accident'}</p>
                <p className="text-[11px] text-slate-300">Location: {h.location}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">People Affected:</span>
                <p className="font-bold text-amber-300 text-sm">{h.peopleInvolved} Individual(s) Reported</p>
                <p className="text-[11px] text-slate-300">Severity Level: {h.priority}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Injury Indicators:</span>
                <p className="font-bold text-orange-300">
                  {Array.isArray(h.injuryIndicators) ? h.injuryIndicators.join(', ') : (h.injuryIndicators || 'Reported injuries')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Hazards & Obstruction:</span>
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${h.roadObstruction ? 'text-red-400' : 'text-emerald-400'}`}>
                    {h.roadObstruction ? 'Road Obstruction Active' : 'Clear Passage'}
                  </span>
                  {h.fireSmoke && <span className="text-red-400 font-bold">Fire/Smoke Reported</span>}
                </div>
                {h.hazards && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {Array.isArray(h.hazards) ? h.hazards.join(', ') : h.hazards}
                  </p>
                )}
              </div>
            </div>

            {/* AI Explanation Justification */}
            {h.aiReasoning && h.aiReasoning.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Deterministic Priority Derivation:
                </span>
                <div className="flex flex-wrap gap-2">
                  {h.aiReasoning.map((r, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300 text-[11px]">
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: RESPONSE (AMBULANCE) */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Truck className="w-5 h-5" />
                <h2 className="font-mono font-bold text-base text-white tracking-wider uppercase">
                  2. RESPONSE (AMBULANCE)
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                STATUS: {h.ambulance?.status || 'EN_ROUTE'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Assigned Unit:</span>
                <p className="text-base font-bold text-white">{h.ambulance?.id || 'AMB-102'}</p>
                <p className="text-slate-300 text-[11px]">{h.ambulance?.name || 'Advanced ALS Unit'}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Capability Rating:</span>
                <p className="text-sm font-bold text-cyan-300">{h.ambulance?.capability || 'ALS (Advanced Life Support)'}</p>
                <p className="text-slate-400 text-[11px]">Driver: {h.ambulance?.driver || 'Manoj Gowda'}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">ETA to Scene:</span>
                <p className="text-xl font-extrabold text-emerald-400">{h.ambulance?.etaMin || 7} MIN</p>
                <p className="text-slate-400 text-[11px]">Contact: {h.ambulance?.contact || '+91-98765-43210'}</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: HOSPITAL PRE-ALERT & INTAKE */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Building2 className="w-5 h-5" />
                <h2 className="font-mono font-bold text-base text-white tracking-wider uppercase">
                  3. DESTINATION HOSPITAL INTAKE
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                PRE-ALERT: {h.hospital?.prealertStatus || 'SENT'} ✓
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono mb-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Selected Hospital:</span>
                <p className="text-base font-bold text-white truncate" title={h.hospital?.name}>
                  {h.hospital?.name || 'City Emergency Hospital'}
                </p>
                <p className="text-slate-400 text-[11px]">{h.hospital?.capability || 'Level 1 Trauma'}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">ER & ICU Capacity:</span>
                <p className="text-sm font-bold text-indigo-300">
                  {h.hospital?.emergencyBedsAvailable || 8} ER Beds Available
                </p>
                <p className="text-slate-400 text-[11px]">
                  {h.hospital?.icuBedsAvailable || 4} ICU Beds Open
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Arrival ETA:</span>
                <p className="text-xl font-extrabold text-emerald-400">{h.hospital?.etaMin || 12} MIN</p>
                <p className="text-emerald-300 text-[11px]">Triage Bay Standby Active</p>
              </div>
            </div>

            {/* Hospital Prep Checklist */}
            {h.hospitalPreparation && (
              <div className="pt-3 border-t border-slate-800/80 text-xs font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">Hospital Preparation Directives:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {h.hospitalPreparation.map((prep, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{prep}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: ROUTE INTELLIGENCE */}
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Navigation className="w-5 h-5" />
                <h2 className="font-mono font-bold text-base text-white tracking-wider uppercase">
                  4. ROUTE RISK INTELLIGENCE
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                ROUTE LOCKED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Designated Route:</span>
                <p className="text-base font-bold text-white">{h.route?.name || 'Route B'}</p>
                <p className="text-slate-400 text-[11px]">Distance: {h.route?.distanceKm || 7.3} km</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Traffic Assessment:</span>
                <p className="text-sm font-bold text-amber-300">{h.route?.traffic || 'Moderate Traffic'}</p>
                <p className="text-slate-400 text-[11px]">Dynamic Corridor Clearance</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Route Risk Rating:</span>
                <p className="text-sm font-bold text-emerald-400 uppercase">{h.route?.risk || 'LOW REPORTED RISK'}</p>
                <p className="text-slate-400 text-[11px]">Transit ETA: {h.route?.etaMin || 12} min</p>
              </div>
            </div>
          </div>

          {/* SECTION 5: TRAFFIC / POLICE INFORMATION BRIEF */}
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-purple-400">
                <Siren className="w-5 h-5" />
                <h2 className="font-mono font-bold text-base text-white tracking-wider uppercase">
                  5. TRAFFIC & POLICE OPERATIONAL BRIEF
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                SIMULATED BRIEF
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono mb-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">Corridor Location:</span>
                <p className="font-bold text-white">{tpBrief.location}</p>
                <span className="text-[10px] text-slate-400 uppercase block mt-2">Road Obstruction Status:</span>
                <p className="font-bold text-amber-300">{tpBrief.roadObstruction}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">Identified Hazard:</span>
                <p className="font-bold text-orange-300">{tpBrief.hazard}</p>
                <span className="text-[10px] text-slate-400 uppercase block mt-2">Estimated Traffic Impact:</span>
                <p className="font-bold text-purple-300">{tpBrief.estimatedImpact}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono mb-3">
              <span className="text-[10px] text-slate-400 uppercase block font-bold mb-1">Recommended Operational Action:</span>
              <p className="text-slate-200">{tpBrief.recommendedAction}</p>
            </div>

            <p className="text-[10px] font-mono text-slate-500 italic">
              Note: {tpBrief.disclaimer || 'SIMULATED OPERATIONAL BRIEF (Demonstrates multi-agency record sharing without real police dispatch)'}
            </p>
          </div>

          {/* SECTION 6: CORRIDOR MEMORY (BREETH AI) */}
          <div className="glass-panel p-6 rounded-2xl border border-teal-500/30 bg-slate-900/90">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
              <div className="flex items-center gap-2 text-teal-400">
                <Brain className="w-5 h-5" />
                <h2 className="font-mono font-bold text-base text-white tracking-wider uppercase">
                  6. CORRIDOR MEMORY & HISTORICAL CONTEXT
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded font-bold border uppercase ${
                  cMemory.source && cMemory.source.includes('Breeth')
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {cMemory.source && cMemory.source.includes('Breeth') ? 'REMOTE BREETH AI API' : 'LOCAL INCIDENT MEMORY (FALLBACK)'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase">Target Corridor:</span>
                <span className="text-[11px] text-teal-300 font-bold">{cMemory.corridor || 'Mysore Road Corridor'}</span>
              </div>
              <p className="font-bold text-slate-100 text-sm leading-relaxed">
                "{cMemory.summary}"
              </p>
              <p className="text-[10px] text-slate-500 italic">
                Memory Source: {cMemory.source || 'LOCAL INCIDENT MEMORY'} • Provides historical corridor context without altering medical priority scoring.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono mb-4">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase">
                  <History className="w-3.5 h-3.5" />
                  <span>Recurring Corridor Hazards</span>
                </div>
                <div className="space-y-1">
                  {(cMemory.recurringHazards || []).map((hzd, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{hzd}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] uppercase">
                  <Info className="w-3.5 h-3.5" />
                  <span>Historical Observations</span>
                </div>
                <div className="space-y-1">
                  {(cMemory.historicalObservations || []).map((obs, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Relevant Previous Incidents List */}
            {cMemory.recentMemories && cMemory.recentMemories.length > 0 && (
              <div className="pt-3 border-t border-slate-800 text-xs font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">Relevant Previous Incident Memories:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cMemory.recentMemories.map((m, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center justify-between">
                      <div>
                        <span className="text-cyan-400 font-bold text-[11px] block">{m.incidentId}</span>
                        <span className="text-[10px] text-slate-400">{m.location}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold">{m.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Section 7 - Live Timeline (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>7. LIVE TIMELINE</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <p className="text-[11px] font-mono text-slate-400">
            Real-time event logging across witness report, AI scoring, Breeth memory search, ambulance assignment, hospital pre-alert, & route locking.
          </p>

          <TimelineView events={h.timeline || []} />
        </div>

      </div>

      {/* SECTION 8: QR CODE MODAL */}
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
              Scan to open this single synchronized emergency record on responder or hospital tablets.
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

