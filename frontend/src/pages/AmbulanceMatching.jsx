import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Radio, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  Phone,
  User,
  Activity
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { socket } from '../services/socket';

export default function AmbulanceMatching() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const incidentId = searchParams.get('incidentId') || 'RSQ-2026-001';

  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [assignedAmbulance, setAssignedAmbulance] = useState(null);
  const [successNotice, setSuccessNotice] = useState('');

  const loadAmbulances = async () => {
    try {
      const res = await api.getAvailableAmbulances(incidentId);
      if (res && res.ambulances) {
        setAmbulances(res.ambulances);
        const alreadyAssigned = res.ambulances.find(a => a.isAssignedToThis || a.status === 'ASSIGNED');
        if (alreadyAssigned) setAssignedAmbulance(alreadyAssigned);
      }
    } catch (err) {
      console.error('Failed loading ambulances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAmbulances();

    const onAmbulanceAssigned = (data) => {
      if (data && data.incidentId === incidentId) {
        loadAmbulances();
      }
    };

    socket.on('ambulanceAssigned', onAmbulanceAssigned);
    return () => socket.off('ambulanceAssigned', onAmbulanceAssigned);
  }, [incidentId]);

  const handleAssign = async (amb) => {
    setAssigningId(amb.id);
    try {
      const res = await api.assignAmbulance(incidentId, amb.id);
      setAssignedAmbulance(amb);
      setSuccessNotice(`Unit ${amb.id} (${amb.name}) successfully assigned and dispatched.`);
      loadAmbulances();
    } catch (err) {
      console.error('Assignment error:', err.message);
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-28 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-resq-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              MULTI-FACTOR FLEET DISPATCH ENGINE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
              10 UNITS SCANNED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Smart Ambulance Matching
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Recommends units based on life-support capability (ALS vs BLS), crew status, and arrival ETA — not solely geographical distance.
          </p>
        </div>

        {assignedAmbulance && (
          <Link
            to={`/hospitals?incidentId=${incidentId}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs tracking-wider shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
          >
            <span>PROCEED TO HOSPITAL MATCHING</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <Link
            to={`/hospitals?incidentId=${incidentId}`}
            className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs hover:bg-emerald-500"
          >
            Next: Match Hospital →
          </Link>
        </div>
      )}

      {/* Recommended Top Ambulance Highlight */}
      {ambulances.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              AI OPTIMAL FLEET RECOMMENDATION:
            </span>
          </div>

          {(() => {
            const top = ambulances.find(a => a.isRecommended) || ambulances[0];
            const isAssigned = top.isAssignedToThis || top.status === 'ASSIGNED';
            return (
              <div className="relative rounded-2xl border-2 border-cyan-500/60 bg-gradient-to-r from-[#0d1629] via-[#09101d] to-[#0d1629] p-6 shadow-2xl shadow-cyan-950/50">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-extrabold text-white font-mono">
                        {top.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        {top.name}
                      </span>
                      <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        top.capability === 'Advanced'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {top.capability} Life Support
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 max-w-xl font-sans leading-relaxed">
                      <strong>Recommendation Rationale:</strong> Selected because it provides the required Advanced Emergency Support capability with the lowest feasible arrival ETA ({top.etaMin} min).
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        ETA: {top.etaMin} MINUTES
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-resq-accent" />
                        {top.distanceKm} km ({top.base_location})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Driver: {top.driver_name}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    {isAssigned ? (
                      <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>ASSIGNED &amp; ACTIVE</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAssign(top)}
                        disabled={assigningId === top.id}
                        className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs font-mono tracking-wider shadow-lg shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {assigningId === top.id ? 'ASSIGNING...' : 'CONFIRM ASSIGNMENT'}
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Alternative Fleet Table */}
      <div className="glass-panel p-6 rounded-2xl border border-resq-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            ALL MONITORED FLEET UNITS ({ambulances.length})
          </span>
          <span className="text-[11px] font-mono text-slate-500">Sorted by dynamic suitability score</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-resq-border text-slate-400 font-mono text-[11px] uppercase">
                <th className="pb-3 font-semibold">Ambulance</th>
                <th className="pb-3 font-semibold">Capability</th>
                <th className="pb-3 font-semibold">Distance</th>
                <th className="pb-3 font-semibold">ETA</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-resq-border/40">
              {ambulances.map((amb) => {
                const isAssigned = amb.isAssignedToThis || amb.status === 'ASSIGNED';
                return (
                  <tr key={amb.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{amb.id}</span>
                        {amb.isRecommended && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono">
                            AI Choice
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-sans font-normal text-slate-400 block mt-0.5">
                        {amb.name}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                        amb.capability === 'Advanced' ? 'bg-purple-950/60 text-purple-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {amb.capability} (ALS)
                      </span>
                    </td>

                    <td className="py-3.5 text-slate-300 font-mono">
                      {amb.distanceKm} km
                    </td>

                    <td className="py-3.5 font-mono font-bold text-emerald-400">
                      {amb.etaMin} min
                    </td>

                    <td className="py-3.5 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isAssigned
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : amb.status === 'AVAILABLE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isAssigned ? 'ASSIGNED' : amb.status}
                      </span>
                    </td>

                    <td className="py-3.5 text-right">
                      {isAssigned ? (
                        <span className="text-emerald-400 font-mono font-semibold text-[11px]">
                          Assigned ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAssign(amb)}
                          disabled={assigningId === amb.id}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-mono text-xs hover:border-cyan-400 transition-all disabled:opacity-50"
                        >
                          {assigningId === amb.id ? '...' : 'Assign'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
