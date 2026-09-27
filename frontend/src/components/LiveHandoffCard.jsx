import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Share2, 
  QrCode, 
  MapPin, 
  Users, 
  Truck, 
  Building2, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ShieldAlert,
  X,
  Copy,
  Printer
} from 'lucide-react';
import QRCode from 'qrcode';
import { PriorityBadge, StatusBadge } from './StatusBadge';
import { api } from '../services/api';
import { socket } from '../services/socket';

export default function LiveHandoffCard({ incidentId = 'RSQ-2026-001', variant = 'card' }) {
  const [handoff, setHandoff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Load handoff data
  const fetchHandoff = async () => {
    try {
      const res = await api.getHandoff(incidentId);
      if (res && res.handoff) {
        setHandoff(res.handoff);
        setError(null);
      }
    } catch (err) {
      console.warn('Failed fetching live handoff:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandoff();

    // Listen for live handoff updates over WebSocket
    const onHandoffUpdate = (data) => {
      if (data && (!data.incidentId || data.incidentId === incidentId)) {
        if (data.handoff) {
          setHandoff(data.handoff);
        } else {
          fetchHandoff();
        }
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

  // Generate QR Code
  const handleGenerateQr = async () => {
    try {
      const targetUrl = `${window.location.origin}/handoff/${incidentId}`;
      const url = await QRCode.toDataURL(targetUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#080c14',
          light: '#ffffff'
        }
      });
      setQrDataUrl(url);
      setShowQrModal(true);
    } catch (e) {
      console.error('Failed generating QR code:', e);
    }
  };

  const handleCopyLink = () => {
    const targetUrl = `${window.location.origin}/handoff/${incidentId}`;
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !handoff) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-resq-border animate-pulse flex flex-col gap-4">
        <div className="h-6 w-36 bg-slate-800 rounded"></div>
        <div className="h-10 w-48 bg-slate-800 rounded"></div>
        <div className="h-24 w-full bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  const h = handoff || {
    incidentId: incidentId,
    priority: 'HIGH',
    location: 'Mysore Road, Bengaluru',
    peopleInvolved: 3,
    ambulance: { id: 'AMB-102', etaMin: 7, status: 'ASSIGNED', name: 'FastResponse ALS-102' },
    hospital: { name: 'City Emergency Hospital', etaMin: 12, prealertStatus: 'SENT' },
    route: { name: 'Route B', distanceKm: 7.3, etaMin: 12, risk: 'Low reported risk' },
    aiReasoning: ['Multiple people involved', 'Reported injuries', 'Road obstruction'],
    hospitalPreparation: ['Emergency department alerted', 'Prepare appropriate emergency capacity']
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-b from-[#0b1424] via-[#090e1a] to-[#070b13] p-6 shadow-2xl shadow-cyan-950/40 text-slate-100">
        
        {/* Glowing top ambient badge */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/10 blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Card Header */}
        <div className="flex items-start justify-between border-b border-cyan-900/40 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  RESQ HANDOFF
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE BRIEF
                </span>
              </div>
              <h2 className="text-xl font-mono font-extrabold text-white tracking-wider mt-0.5">
                {h.incidentId}
              </h2>
            </div>
          </div>

          <PriorityBadge priority={h.priority} size="md" />
        </div>

        {/* Incident Summary */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 text-slate-200">
            <MapPin className="w-4 h-4 text-resq-accent shrink-0" />
            <span className="font-semibold text-sm">{h.location}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-mono font-medium text-amber-300">
            <Users className="w-3.5 h-3.5" />
            <span>{h.peopleInvolved} PEOPLE INVOLVED</span>
            {h.roadObstruction && (
              <span className="text-slate-400">• ROAD OBSTRUCTION</span>
            )}
          </div>
        </div>

        {/* 3 Coordinated Pillars: Ambulance, Hospital, Route */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          
          {/* AMBULANCE */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 mb-2">
              <Truck className="w-3.5 h-3.5" />
              <span>AMBULANCE</span>
            </div>
            {h.ambulance ? (
              <div>
                <p className="font-bold text-sm text-white">{h.ambulance.id}</p>
                <p className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                  ETA: {h.ambulance.etaMin || 7} min
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {h.ambulance.status || 'EN ROUTE'}
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Matching available unit...</p>
            )}
          </div>

          {/* HOSPITAL */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>HOSPITAL</span>
            </div>
            {h.hospital ? (
              <div>
                <p className="font-bold text-sm text-white truncate" title={h.hospital.name}>
                  {h.hospital.name}
                </p>
                <p className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                  ETA: {h.hospital.etaMin || 12} min
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30">
                  {h.hospital.prealertStatus === 'SENT' ? 'ALERT SENT ✓' : 'STANDBY'}
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Evaluating trauma bays...</p>
            )}
          </div>

          {/* ROUTE */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 mb-2">
              <Navigation className="w-3.5 h-3.5" />
              <span>SELECTED ROUTE</span>
            </div>
            {h.route ? (
              <div>
                <p className="font-bold text-sm text-white">{h.route.name}</p>
                <p className="text-xs font-mono text-slate-300 mt-0.5">
                  {h.route.distanceKm} km • {h.route.etaMin} min
                </p>
                <p className="text-[10px] font-mono text-emerald-400 uppercase mt-2">
                  {h.route.risk || 'LOW RISK'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Calculating risk HUD...</p>
            )}
          </div>

        </div>

        {/* AI Assessment Reasoning */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 mb-6">
          <p className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase mb-2">
            AI ASSESSMENT FACTORS
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {(h.aiReasoning || []).map((reason, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            to={`/handoff/${h.incidentId}`}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs tracking-wider shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ExternalLink className="w-4 h-4" />
            <span>VIEW LIVE HANDOFF</span>
          </Link>

          <button
            onClick={handleGenerateQr}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold tracking-wide transition-all"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>GENERATE HANDOFF QR</span>
          </button>
        </div>

      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-resq-panel border border-cyan-500/40 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-3">
              <QrCode className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold font-mono text-white mb-1">
              LIVE RESQ HANDOFF QR
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Scan from emergency vehicle or hospital triage tablet for real-time telemetry access.
            </p>

            <div className="bg-white p-4 rounded-xl inline-block shadow-inner mb-4">
              <img src={qrDataUrl} alt="Handoff QR" className="w-48 h-48 mx-auto" />
            </div>

            <div className="text-[11px] font-mono text-cyan-300 bg-slate-900 py-1.5 px-3 rounded border border-slate-800 mb-4 break-all">
              {window.location.origin}/handoff/{h.incidentId}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-medium transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-xs text-cyan-300 border border-cyan-800 font-medium transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
