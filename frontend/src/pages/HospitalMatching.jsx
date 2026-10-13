import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Send, 
  AlertCircle,
  Activity,
  Bed,
  Search,
  ArrowRight,
  ShieldCheck,
  Truck
} from 'lucide-react';
import MapView from '../components/MapView';
import { SimulationBadge } from '../components/StatusBadge';
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
  const [searchQuery, setSearchQuery] = useState('');

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
            status: 'PRE-ALERT ACTIVE'
          });
        } else {
          const rec = res.hospitals.find(h => h.isRecommended) || res.hospitals[0];
          if (rec) setSelectedHospital(rec);
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
        status: 'PRE-ALERT SENT'
      });
      loadHospitals();
    } catch (err) {
      console.error('Hospital selection error:', err.message);
    } finally {
      setSelectingId(null);
    }
  };

  const filteredHospitals = hospitals.filter(h => {
    const q = searchQuery.toLowerCase();
    return !searchQuery.trim() ||
      h.name.toLowerCase().includes(q) ||
      h.address.toLowerCase().includes(q) ||
      h.capability?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E8E1] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#245C4A]" />
            <span className="text-xs uppercase font-sans font-semibold tracking-wider text-[#707970]">
              Trauma Network Coordination
            </span>
            <SimulationBadge />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#203B32] tracking-tight">
            Trauma Center Alignment
          </h1>
          <p className="text-xs text-[#707970] font-sans mt-0.5">
            Real-time ER bed availability, ICU surge capacity, and automated emergency pre-alert broadcast.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/ambulances"
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#F8F7F2] text-[#203B32] border border-[#E8E8E1] text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-[#245C4A]" />
            <span>Ambulance Fleet</span>
          </Link>

          <Link
            to={`/handoff/${incidentId}`}
            className="px-4 py-2 rounded-xl bg-[#245C4A] hover:bg-[#1D4A3B] text-white text-xs font-sans font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>Handoff Brief</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {preAlertNotice && (
        <div className="p-3.5 bg-[#EEF4EF] border border-[#CBDACD] text-[#245C4A] text-xs font-sans rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              Automated pre-alert transmitted to {preAlertNotice.hospital.name} emergency desk.
            </span>
          </div>
          <Link to={`/handoff/${incidentId}`} className="font-bold underline text-xs">
            View Live Handoff Brief →
          </Link>
        </div>
      )}

      {/* COORDINATED MAP-AND-LIST EXPERIENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Elegant Table & Filtered Hospital Roster */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-5 shadow-subtle">
            
            {/* Filter Search */}
            <div className="pb-4 border-b border-[#E8E8E1] mb-4">
              <div className="relative max-w-sm">
                <Search className="w-3.5 h-3.5 text-[#929B92] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search hospital name, capability, address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8F7F2] border border-[#E8E8E1] rounded-xl text-[#203B32] placeholder-[#929B92] focus:outline-none focus:border-[#245C4A]"
                />
              </div>
            </div>

            {/* Elegant Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#E8E8E1] text-[#707970] text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold pl-2">Hospital Facility</th>
                    <th className="pb-3 font-semibold">Trauma Level</th>
                    <th className="pb-3 font-semibold">ER Beds</th>
                    <th className="pb-3 font-semibold">ICU Beds</th>
                    <th className="pb-3 font-semibold">Transit ETA</th>
                    <th className="pb-3 font-semibold pr-2 text-right">Pre-Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E1]">
                  {filteredHospitals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#707970]">
                        No trauma facilities found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredHospitals.map((hosp) => {
                      const isSelected = selectedHospital?.id === hosp.id;
                      const isPreAlerted = hosp.isSelected;
                      const isRec = hosp.isRecommended;

                      return (
                        <tr
                          key={hosp.id}
                          onClick={() => setSelectedHospital(hosp)}
                          className={`hover:bg-[#F8F7F2] transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#EEF4EF]/50' : ''
                          } ${isRec ? 'border-l-2 border-l-[#245C4A]' : ''}`}
                        >
                          <td className="py-3.5 pl-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#203B32]">{hosp.name}</span>
                              {isRec && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#EEF4EF] text-[#245C4A] border border-[#CBDACD] rounded">
                                  RECOMMENDED
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#707970] block truncate max-w-xs">{hosp.address}</span>
                          </td>

                          <td className="py-3.5">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F4F7F4] text-[#203B32] border border-[#E8E8E1]">
                              {hosp.capability || 'Level 1 Trauma'}
                            </span>
                          </td>

                          <td className="py-3.5">
                            <span className="font-mono font-bold text-[#245C4A] bg-[#EEF4EF] px-2 py-0.5 rounded">
                              {hosp.emergency_beds_available} Available
                            </span>
                          </td>

                          <td className="py-3.5">
                            <span className="font-mono font-bold text-[#203B32] bg-[#F4F7F4] px-2 py-0.5 rounded">
                              {hosp.icu_beds_available} ICU
                            </span>
                          </td>

                          <td className="py-3.5">
                            <div className="flex items-center gap-1 font-semibold text-[#203B32]">
                              <Clock className="w-3.5 h-3.5 text-[#245C4A]" />
                              <span>{hosp.eta_min || 11} min</span>
                            </div>
                          </td>

                          <td className="py-3.5 pr-2 text-right">
                            {isPreAlerted ? (
                              <span className="text-[11px] font-semibold text-[#245C4A] bg-[#EEF4EF] px-2.5 py-1 rounded-lg border border-[#CBDACD]">
                                Pre-Alerted
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelect(hosp);
                                }}
                                disabled={selectingId === hosp.id}
                                className="px-3 py-1 rounded-lg bg-[#245C4A] hover:bg-[#1D4A3B] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                              >
                                {selectingId === hosp.id ? 'Sending...' : 'Send Alert'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right Column: Contextual Detail Panel & Spatial Map */}
        <div className="lg:col-span-4 space-y-4">
          
          {selectedHospital && (
            <div className="bg-white rounded-3xl border border-[#E8E8E1] p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
                <div>
                  <span className="text-[11px] font-sans text-[#707970] uppercase">Selected Facility</span>
                  <h3 className="font-serif text-lg font-bold text-[#203B32]">
                    {selectedHospital.name}
                  </h3>
                </div>
                <span className="font-mono text-xs text-[#707970] bg-[#F8F7F2] px-2 py-0.5 rounded border border-[#E8E8E1]">
                  {selectedHospital.id}
                </span>
              </div>

              {/* Rationale if recommended */}
              <div className="p-3.5 bg-[#EEF4EF] rounded-2xl border border-[#CBDACD] text-xs font-sans text-[#203B32]">
                <span className="font-bold text-[#245C4A] block mb-1">
                  Why this hospital was selected:
                </span>
                <p className="text-[#203B32] leading-relaxed text-[11px]">
                  {selectedHospital.recommendation_reason || 
                    `Highest trauma readiness score in southern corridor with ${selectedHospital.emergency_beds_available} emergency beds and active neuro-trauma team on duty.`}
                </p>
              </div>

              <div className="space-y-2 text-xs font-sans text-[#707970]">
                <div className="flex justify-between py-1 border-b border-[#E8E8E1]">
                  <span>Intake Desk Contact:</span>
                  <span className="font-mono text-[#245C4A]">{selectedHospital.contact_phone || '+91 80 6621 4444'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E8E8E1]">
                  <span>Surge Capacity:</span>
                  <span className="font-medium text-[#203B32]">{selectedHospital.capacity_status || 'Accepting Trauma'}</span>
                </div>
              </div>

              <div>
                {selectedHospital.isSelected ? (
                  <div className="w-full py-2.5 rounded-xl bg-[#EEF4EF] border border-[#CBDACD] text-[#245C4A] text-xs font-semibold text-center">
                    Pre-Alert Broadcast Confirmed
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelect(selectedHospital)}
                    disabled={selectingId === selectedHospital.id}
                    className="w-full py-2.5 rounded-xl bg-[#245C4A] hover:bg-[#1D4A3B] text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Pre-Alert to {selectedHospital.name}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Spatial Map Preview */}
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-3 shadow-subtle">
            <div className="h-[260px] rounded-2xl overflow-hidden border border-[#E8E8E1]">
              <MapView
                hospitals={filteredHospitals}
                center={selectedHospital?.lat ? [selectedHospital.lat, selectedHospital.lng] : [12.955, 77.545]}
                zoom={13}
                height="100%"
              />
            </div>
            <p className="text-[11px] text-[#707970] text-center mt-2 font-sans">
              Trauma center spatial network in Bengaluru
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
