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
  X,
  ArrowRight,
  RefreshCw,
  PhoneCall,
  Check
} from 'lucide-react';
import QRCode from 'qrcode';
import { PriorityBadge, StatusBadge, SimulationBadge } from '../components/StatusBadge';
import TimelineView from '../components/TimelineView';
import { api } from '../services/api';
import { socket } from '../services/socket';

const STATUS_PROGRESSION = [
  { key: 'REPORTED', label: 'Reported' },
  { key: 'ASSESSED', label: 'Assessed' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'HOSPITAL_ALERTED', label: 'Pre-Alert' },
  { key: 'AMBULANCE_EN_ROUTE', label: 'En Route' }
];

export default function ResqHandoff() {
  const { incidentId: paramId } = useParams();
  const incidentId = paramId || 'RSQ-2026-001';

  const [handoff, setHandoff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRoleView, setActiveRoleView] = useState('ALL'); // 'ALL' | 'RESPONDER' | 'HOSPITAL' | 'COMMAND'
  
  // Modals & UI states
  const [qrModal, setQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const fetchHandoff = async () => {
    try {
      const res = await api.getHandoff(incidentId);
      if (res && res.handoff) {
        setHandoff(res.handoff);
      }
    } catch (err) {
      console.warn('Failed to load handoff, using localized brief');
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

  // Generate QR Code data URL
  const handleOpenQr = async () => {
    try {
      const payload = JSON.stringify({
        incidentId,
        url: window.location.href,
        status: handoff?.status || 'ASSIGNED',
        priority: handoff?.priority || 'HIGH'
      });
      const url = await QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        color: { dark: '#203B32', light: '#FFFFFF' }
      });
      setQrUrl(url);
      setQrModal(true);
    } catch (e) {
      console.error('QR generation error:', e);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.updateIncidentStatus(incidentId, newStatus);
      setActionNotice(`Status updated to ${newStatus}`);
      setStatusModal(false);
      await fetchHandoff();
    } catch (err) {
      setActionNotice('Status update submitted locally.');
      setStatusModal(false);
    } finally {
      setUpdatingStatus(false);
      setTimeout(() => setActionNotice(''), 4000);
    }
  };

  const h = handoff || {
    incident_id: incidentId,
    id: incidentId,
    status: 'AMBULANCE_EN_ROUTE',
    priority: 'HIGH',
    location: 'Mysore Road, Near NICE Road Junction, Bengaluru',
    incident_summary: 'There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.',
    people_count: 3,
    injury_indicators: ['Multiple reported injuries', 'Possible blunt trauma'],
    road_obstruction: 1,
    fire_smoke: 0,
    created_at: new Date().toISOString(),
    assigned_ambulance: {
      id: 'AMB-BLR-02',
      name: 'LifeCare ALS Express 02',
      capability: 'Advanced (ALS)',
      vehicle_number: 'KA-01-EA-4219',
      driver_name: 'Officer S. Kumar',
      contact_number: '+91 98450 11202',
      status: 'DISPATCHED',
      eta_min: 6
    },
    selected_hospital: {
      id: 'HOSP-BLR-01',
      name: 'Fortis Hospital - Bannerghatta',
      address: '154/9, Bannerghatta Road, Opp IIMB, Bengaluru',
      capability: 'Level 1 Trauma',
      emergency_beds_available: 8,
      icu_beds_available: 3,
      contact_phone: '+91 80 6621 4444',
      alert_status: 'PRE-ALERT SENT',
      alert_sent_at: new Date().toISOString(),
      eta_min: 14
    },
    route_name: 'Route B — Outer Ring Road & Hosur Corridor',
    route_eta_min: 14,
    route_distance_km: 7.2,
    route_traffic: 'Moderate Flow',
    timeline: [
      { id: 1, event_type: 'REPORTED', description: 'Citizen voice intake logged via ElevenLabs', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
      { id: 2, event_type: 'AI_ASSESSMENT', description: 'Priority assessed as HIGH (6 points, multiple casualties + road obstruction)', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
      { id: 3, event_type: 'AMBULANCE_ASSIGNED', description: 'ALS Unit AMB-BLR-02 assigned & dispatched', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
      { id: 4, event_type: 'HOSPITAL_ALERTED', description: 'Trauma pre-alert transmitted to Fortis Hospital emergency desk', timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString() },
      { id: 5, event_type: 'ROUTE_SELECTED', description: 'Risk-optimized corridor Route B locked', timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString() }
    ]
  };

  const currentStatusIndex = STATUS_PROGRESSION.findIndex(s => s.key === h.status);
  const activeProgressionIndex = currentStatusIndex !== -1 ? currentStatusIndex : 3;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-6">
      
      {/* 1. TOP HEADER: Briefing Actions & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E8E1] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#245C4A]" />
            <span className="text-xs uppercase font-sans font-semibold tracking-wider text-[#707970]">
              Signature Coordinated Briefing
            </span>
            <SimulationBadge />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#203B32] tracking-tight">
            RESQ Handoff Brief
          </h1>
          <p className="text-xs text-[#707970] font-sans mt-0.5">
            Continuously updated digital emergency brief connecting dispatch, ambulance, and trauma desk.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenQr}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E8E1] hover:border-[#245C4A] text-xs font-sans font-semibold text-[#203B32] flex items-center gap-1.5 transition-colors shadow-subtle"
            title="Display QR Code for hospital intake handover"
          >
            <QrCode className="w-3.5 h-3.5 text-[#245C4A]" />
            <span>QR Pass</span>
          </button>

          <button
            onClick={() => setStatusModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E8E8E1] hover:border-[#245C4A] text-xs font-sans font-semibold text-[#203B32] flex items-center gap-1.5 transition-colors shadow-subtle"
          >
            <Activity className="w-3.5 h-3.5 text-[#245C4A]" />
            <span>Update Status</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-white border border-[#E8E8E1] hover:border-[#245C4A] text-[#707970] hover:text-[#203B32] transition-colors shadow-subtle"
            title="Copy shareable link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#245C4A]" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-white border border-[#E8E8E1] hover:border-[#245C4A] text-[#707970] hover:text-[#203B32] transition-colors shadow-subtle hidden sm:block"
            title="Print handoff document"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-[#EEF4EF] border border-[#CBDACD] text-[#245C4A] text-xs font-sans rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 2. SUBTLE GREEN STATUS STRIP & 5-STAGE PROGRESSION */}
      <div className="bg-[#EEF4EF] rounded-2xl border border-[#CBDACD] p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#CBDACD]">
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#245C4A]">
            Response Progression Pipeline
          </span>
          <span className="text-xs font-mono font-bold text-[#203B32]">
            Current: {h.status?.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center text-xs font-sans">
          {STATUS_PROGRESSION.map((step, idx) => {
            const isCompleted = idx <= activeProgressionIndex;
            const isCurrent = idx === activeProgressionIndex;

            return (
              <div key={step.key} className="space-y-1">
                <div className={`h-1.5 rounded-full transition-all ${
                  isCurrent 
                    ? 'bg-[#245C4A]' 
                    : isCompleted 
                    ? 'bg-[#6E9C91]' 
                    : 'bg-[#CBDACD]'
                }`} />
                <span className={`text-[11px] block truncate ${
                  isCurrent ? 'font-bold text-[#245C4A]' : isCompleted ? 'font-medium text-[#203B32]' : 'text-[#707970]'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ROLE PERSPECTIVE HUD TABS */}
      <div className="flex items-center gap-1.5 border-b border-[#E8E8E1] pb-2 text-xs font-sans">
        <span className="text-[#707970] text-[11px] mr-2">Perspective:</span>
        {[
          { key: 'ALL', label: 'Complete Brief' },
          { key: 'RESPONDER', label: 'Field Responder HUD' },
          { key: 'HOSPITAL', label: 'Hospital Trauma Desk' },
          { key: 'COMMAND', label: 'Command Dispatch' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveRoleView(tab.key)}
            className={`px-3 py-1 rounded-xl transition-all ${
              activeRoleView === tab.key
                ? 'bg-white text-[#245C4A] font-semibold border border-[#CBDACD] shadow-subtle'
                : 'text-[#707970] hover:text-[#203B32]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. THE SIGNATURE 8-SECTION HANDOFF DOCUMENT */}
      <div className="bg-white rounded-3xl border border-[#E8E8E1] p-6 sm:p-8 shadow-sheet space-y-6">
        
        {/* Document Header with Distinctive Incident Identifier */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E8E8E1] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#245C4A] bg-[#EEF4EF] px-2.5 py-0.5 rounded-lg border border-[#CBDACD]">
                {h.id || h.incident_id}
              </span>
              <span className="text-xs text-[#707970] font-sans">
                {h.created_at ? new Date(h.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Live'}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#203B32] mt-1.5">
              Live Emergency Coordination Briefing
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={h.status} />
            <PriorityBadge priority={h.priority} size="md" />
          </div>
        </div>

        {/* Section 1: Incident Summary & Caller Narrative */}
        <div className="space-y-1.5">
          <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#707970]">
            1. Incident Summary &amp; Caller Narrative
          </span>
          <p className="text-sm text-[#203B32] p-4 bg-[#F8F7F2] rounded-2xl border border-[#E8E8E1] leading-relaxed font-sans">
            "{h.incident_summary || h.raw_text}"
          </p>
        </div>

        {/* Section 2: Location & Casualties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E8E8E1]">
            <span className="text-[11px] font-sans font-medium text-[#707970] block uppercase">
              2. Exact Location
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-[#245C4A] shrink-0" />
              <span className="font-semibold text-xs text-[#203B32] truncate">{h.location}</span>
            </div>
          </div>

          <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E8E8E1]">
            <span className="text-[11px] font-sans font-medium text-[#707970] block uppercase">
              Casualties Involved
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Users className="w-4 h-4 text-[#245C4A] shrink-0" />
              <span className="font-semibold text-xs text-[#203B32]">{h.people_count || 3} individuals</span>
            </div>
          </div>

          <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E8E8E1]">
            <span className="text-[11px] font-sans font-medium text-[#707970] block uppercase">
              Observed Indicators
            </span>
            <span className="font-semibold text-xs text-[#203B32] mt-1 block">
              {(Array.isArray(h.injury_indicators) ? h.injury_indicators.join(', ') : 'Blunt trauma')}
            </span>
          </div>
        </div>

        {/* Section 3 & 4: Assigned Ambulance & Selected Hospital (Split Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          
          {/* Section 3: Assigned Ambulance */}
          <div className="p-5 bg-[#F8F7F2] rounded-2xl border border-[#E8E8E1] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#245C4A]">
                3. Assigned Ambulance Unit
              </span>
              <span className="font-mono text-xs font-bold text-[#203B32]">
                {h.assigned_ambulance?.id || 'AMB-BLR-02'}
              </span>
            </div>

            <div>
              <p className="font-serif font-bold text-base text-[#203B32]">
                {h.assigned_ambulance?.name || 'LifeCare ALS Express 02'}
              </p>
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EEF4EF] text-[#245C4A] border border-[#CBDACD] mt-1">
                {h.assigned_ambulance?.capability || 'Advanced (ALS)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-sans text-[#707970] pt-2 border-t border-[#E8E8E1]">
              <div>
                <span className="text-[10px] block text-[#929B92]">Lead Crew</span>
                <span className="font-medium text-[#203B32]">{h.assigned_ambulance?.driver_name || 'Officer S. Kumar'}</span>
              </div>
              <div>
                <span className="text-[10px] block text-[#929B92]">Radio Contact</span>
                <span className="font-mono text-[#245C4A]">{h.assigned_ambulance?.contact_number || '+91 98450 11202'}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Selected Trauma Hospital */}
          <div className="p-5 bg-[#F8F7F2] rounded-2xl border border-[#E8E8E1] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#203B32]">
                4. Selected Trauma Center
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EEF4EF] text-[#245C4A] border border-[#CBDACD]">
                Pre-Alert Active
              </span>
            </div>

            <div>
              <p className="font-serif font-bold text-base text-[#203B32]">
                {h.selected_hospital?.name || 'Fortis Hospital - Bannerghatta'}
              </p>
              <p className="text-xs text-[#707970] truncate mt-0.5">
                {h.selected_hospital?.address || '154/9, Bannerghatta Road, Bengaluru'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-sans text-[#707970] pt-2 border-t border-[#E8E8E1]">
              <div>
                <span className="text-[10px] block text-[#929B92]">ER Beds Ready</span>
                <span className="font-mono font-bold text-[#245C4A]">{h.selected_hospital?.emergency_beds_available || 8} Available</span>
              </div>
              <div>
                <span className="text-[10px] block text-[#929B92]">Intake Hotline</span>
                <span className="font-mono text-[#203B32]">{h.selected_hospital?.contact_phone || '+91 80 6621 4444'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Section 5 & 6: Recommended Corridor & Estimated Times */}
        <div className="p-4 bg-[#EEF4EF] rounded-2xl border border-[#CBDACD] space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-[#245C4A] uppercase tracking-wider block">
                5 &amp; 6. Recommended Corridor &amp; ETA Telemetry
              </span>
              <p className="text-xs text-[#203B32] font-medium mt-0.5">
                {h.route_name || 'Route B — Outer Ring Road & Hosur Corridor (Recommended)'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono font-bold text-[#245C4A]">
              <span>ETA: {h.route_eta_min || 14} min</span>
              <span>Distance: {h.route_distance_km || 7.2} km</span>
            </div>
          </div>
        </div>

        {/* Section 7 & 8: Response Timeline */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#707970]">
            7 &amp; 8. Chronological Event Timeline
          </span>
          <TimelineView events={h.timeline || []} layout="vertical" />
        </div>

      </div>

      {/* QR CODE MODAL FOR HOSPITAL INTAKE */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-6 max-w-sm w-full shadow-dropdown text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E1]">
              <span className="font-serif font-bold text-base text-[#203B32]">
                Digital Handoff QR Pass
              </span>
              <button onClick={() => setQrModal(false)} className="text-[#707970] hover:text-[#203B32]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#707970] font-sans">
              Scan at emergency triage intake desk to synchronize patient telemetry directly.
            </p>

            {qrUrl && (
              <div className="flex justify-center p-3 bg-[#F8F7F2] rounded-2xl border border-[#E8E8E1]">
                <img src={qrUrl} alt="Handoff QR" className="w-56 h-56 rounded-xl" />
              </div>
            )}

            <div className="text-[11px] font-mono text-[#707970]">
              Incident ID: <strong className="text-[#203B32]">{incidentId}</strong>
            </div>

            <button
              onClick={() => setQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#245C4A] text-white text-xs font-semibold"
            >
              Close QR Pass
            </button>
          </div>
        </div>
      )}

      {/* STATUS UPDATE MODAL */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-6 max-w-md w-full shadow-dropdown space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E1]">
              <span className="font-serif font-bold text-base text-[#203B32]">
                Update Response Progression
              </span>
              <button onClick={() => setStatusModal(false)} className="text-[#707970] hover:text-[#203B32]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#707970] font-sans">
              Advance the coordinated status across all connected ambulance and hospital displays.
            </p>

            <div className="space-y-2">
              {[
                { status: 'ASSESSED', label: 'Assessed — Triage Scoring Locked' },
                { status: 'ASSIGNED', label: 'Assigned — Ambulance Dispatched' },
                { status: 'HOSPITAL_ALERTED', label: 'Hospital Alerted — Pre-Alert Sent' },
                { status: 'AMBULANCE_EN_ROUTE', label: 'Ambulance En Route — In Transit' },
                { status: 'ON_SCENE', label: 'On Scene — Paramedics Arrived' }
              ].map(opt => (
                <button
                  key={opt.status}
                  onClick={() => handleUpdateStatus(opt.status)}
                  disabled={updatingStatus}
                  className="w-full p-3 text-left rounded-xl border border-[#E8E8E1] hover:border-[#245C4A] hover:bg-[#EEF4EF] text-xs font-sans text-[#203B32] transition-colors flex items-center justify-between"
                >
                  <span>{opt.label}</span>
                  {h.status === opt.status && <Check className="w-3.5 h-3.5 text-[#245C4A]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
