import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Send, 
  AlertCircle,
  Activity,
  Bed,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';

export default function HospitalMatching() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const incidentId = searchParams.get('incidentId') || 'RSQ-2026-001';

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [preAlertNotice, setPreAlertNotice] = useState(null);

  const loadHospitals = async () => {
    try {
      const res = await api.getAvailableHospitals(incidentId);
      if (res && res.hospitals) {
        setHospitals(res.hospitals);
        const alreadySelected = res.hospitals.find(h => h.isSelected);
        if (alreadySelected) {
          setSelectedHospital(alreadySelected);
          setPreAlertNotice({
            hospital: alreadySelected,
            status: 'ALERT SENT'
          });
        }
      }
    } catch (err) {
      console.error('Failed loading hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();

    const onHospitalSelected = (data) => {
      if (data && data.incidentId === incidentId) {
        loadHospitals();
      }
    };

    socket.on('hospitalSelected', onHospitalSelected);
    return () => socket.off('hospitalSelected', onHospitalSelected);
  }, [incidentId]);

  const handleSelect = async (hosp) => {
    setSelectingId(hosp.id);
    try {
      const res = await api.selectHospital(incidentId, hosp.id);
      setSelectedHospital(hosp);
      setPreAlertNotice({
        hospital: hosp,
        status: 'ALERT SENT'
      });
      loadHospitals();
    } catch (err) {
      console.error('Hospital selection error:', err.message);
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-28 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-resq-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              TRAUMA NETWORK &amp; BED AVAILABILITY INTAKE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
              8 HOSPITALS MONITORED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Intelligent Hospital Matching
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluates trauma resuscitation level, ICU open beds, and intake acceptance — preventing ambulance diversion at ER gates.
          </p>
        </div>

        {selectedHospital && (
          <Link
            to={`/map?incidentId=${incidentId}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs tracking-wider shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
          >
            <span>PROCEED TO ROUTE INTELLIGENCE</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Hospital Pre-Alert Generated Banner (Section 8 Hero) */}
      {preAlertNotice && (
        <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 p-6 shadow-2xl shadow-emerald-950/60 text-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-800/40 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                  TRAUMA INTAKE BROADCAST
                </span>
                <h3 className="text-lg font-bold font-mono text-white">
                  EMERGENCY PRE-ALERT TRANSMITTED
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 animate-pulse">
              STATUS: ALERT SENT ✓
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono mb-4">
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">INCIDENT ID:</span>
              <span className="font-bold text-white">{incidentId}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DESTINATION ER:</span>
              <span className="font-bold text-cyan-300 truncate block">{preAlertNotice.hospital.name}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">INCOMING ETA:</span>
              <span className="font-bold text-emerald-400">{preAlertNotice.hospital.etaMin || 12} MINUTES</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PREPARATION:</span>
              <span className="font-bold text-amber-300">Trauma Team Requested</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-400">
              Hospital ER staff received preliminary casualty telemetry to prepare triage bays prior to ambulance arrival.
            </span>
            <Link
              to={`/map?incidentId=${incidentId}`}
              className="font-mono text-cyan-400 hover:text-cyan-300 font-bold underline shrink-0 ml-3"
            >
              Lock Transit Route →
            </Link>
          </div>
        </div>
      )}

      {/* Recommended Hospital Card */}
      {hospitals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              AI OPTIMAL TRAUMA FACILITY RECOMMENDATION:
            </span>
          </div>

          {(() => {
            const top = hospitals.find(h => h.isRecommended) || hospitals[0];
            const isSelected = top.isSelected;
            return (
              <div className="relative rounded-2xl border-2 border-indigo-500/60 bg-gradient-to-r from-[#0d1326] via-[#090d1c] to-[#0d1326] p-6 shadow-2xl shadow-indigo-950/40">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-extrabold text-white font-mono">
                        {top.name}
                      </span>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        {top.capability}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      <strong>Recommendation Rationale:</strong> {top.aiRecommendationReason}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        ETA: {top.etaMin} MINUTES
                      </span>
                      <span className="flex items-center gap-1.5 text-cyan-300">
                        <Bed className="w-3.5 h-3.5" />
                        {top.emergency_beds_available} Available Emergency Beds ({top.icu_beds_available} ICU)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-resq-accent" />
                        {top.address}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    {isSelected ? (
                      <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>HOSPITAL CONFIRMED</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelect(top)}
                        disabled={selectingId === top.id}
                        className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 text-white font-bold text-xs font-mono tracking-wider shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {selectingId === top.id ? 'TRANSMITTING...' : 'SELECT & SEND PRE-ALERT'}
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Alternative Hospitals Table */}
      <div className="glass-panel p-6 rounded-2xl border border-resq-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            REGIONAL TRAUMA NETWORK ({hospitals.length} FACILITIES)
          </span>
          <span className="text-[11px] font-mono text-slate-500">Ranked by bed availability &amp; capability match</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-resq-border text-slate-400 font-mono text-[11px] uppercase">
                <th className="pb-3 font-semibold">Hospital Facility</th>
                <th className="pb-3 font-semibold">Trauma Level</th>
                <th className="pb-3 font-semibold">Available Beds</th>
                <th className="pb-3 font-semibold">ETA</th>
                <th className="pb-3 font-semibold">Intake Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-resq-border/40">
              {hospitals.map((hosp) => {
                const isSelected = hosp.isSelected;
                return (
                  <tr key={hosp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{hosp.name}</span>
                        {hosp.isRecommended && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px] font-mono">
                            AI Choice
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-sans font-normal text-slate-400 block mt-0.5">
                        {hosp.address}
                      </span>
                    </td>

                    <td className="py-3.5 text-slate-300 font-mono text-[11px]">
                      {hosp.capability}
                    </td>

                    <td className="py-3.5 font-mono">
                      <span className="text-emerald-400 font-bold">{hosp.emergency_beds_available} ER</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-indigo-400 font-semibold">{hosp.icu_beds_available} ICU</span>
                    </td>

                    <td className="py-3.5 font-mono font-bold text-slate-200">
                      {hosp.etaMin} min
                    </td>

                    <td className="py-3.5 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        hosp.capacity_status === 'Available'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : hosp.capacity_status === 'Limited'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {hosp.capacity_status}
                      </span>
                    </td>

                    <td className="py-3.5 text-right">
                      {isSelected ? (
                        <span className="text-emerald-400 font-mono font-semibold text-[11px]">
                          Pre-Alert Sent ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelect(hosp)}
                          disabled={selectingId === hosp.id || hosp.capacity_status === 'Full'}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-mono text-xs hover:border-indigo-400 transition-all disabled:opacity-40"
                        >
                          {selectingId === hosp.id ? '...' : 'Select & Alert'}
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
