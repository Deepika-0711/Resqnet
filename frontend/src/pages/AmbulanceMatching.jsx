import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Radio, 
  ChevronRight, 
  AlertCircle,
  Phone,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import MapView from '../components/MapView';
import { SimulationBadge } from '../components/StatusBadge';
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
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [successNotice, setSuccessNotice] = useState('');

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [capabilityFilter, setCapabilityFilter] = useState('ALL'); // 'ALL' | 'Advanced' | 'Basic'

  const loadAmbulances = async () => {
    try {
      const res = await api.getAvailableAmbulances(incidentId);
      if (res && res.ambulances) {
        setAmbulances(res.ambulances);
        const alreadyAssigned = res.ambulances.find(a => a.isAssignedToThis || a.status === 'ASSIGNED');
        if (alreadyAssigned) setAssignedAmbulance(alreadyAssigned);
        
        const top = res.ambulances.find(a => a.isRecommended) || res.ambulances[0];
        if (top) setSelectedAmbulance(top);
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
      setSuccessNotice(`Unit ${amb.id} (${amb.name}) assigned and dispatched.`);
      loadAmbulances();
    } catch (err) {
      console.error('Assignment error:', err.message);
    } finally {
      setAssigningId(null);
    }
  };

  // Filter ambulances
  const filteredAmbulances = ambulances.filter(amb => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery.trim() ||
      amb.id.toLowerCase().includes(q) ||
      amb.name.toLowerCase().includes(q) ||
      amb.base_location?.toLowerCase().includes(q);

    const matchesCapability = capabilityFilter === 'ALL' || 
      (capabilityFilter === 'Advanced' ? amb.capability?.toLowerCase().includes('adv') : amb.capability?.toLowerCase().includes('basic'));

    return matchesSearch && matchesCapability;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E8E1] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#245C4A]" />
            <span className="text-xs uppercase font-sans font-semibold tracking-wider text-[#707970]">
              Fleet Operations
            </span>
            <SimulationBadge />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#203B32] tracking-tight">
            Ambulance Fleet Matching
          </h1>
          <p className="text-xs text-[#707970] font-sans mt-0.5">
            Multi-factor ALS/BLS fleet ranking by transit distance, equipment capability, and current availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/hospitals"
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#F8F7F2] text-[#203B32] border border-[#E8E8E1] text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-[#245C4A]" />
            <span>Trauma Network</span>
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

      {successNotice && (
        <div className="p-3.5 bg-[#EEF4EF] border border-[#CBDACD] text-[#245C4A] text-xs font-sans rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{successNotice}</span>
          </div>
          <Link to={`/handoff/${incidentId}`} className="font-bold underline text-xs">
            Review in RESQ Handoff →
          </Link>
        </div>
      )}

      {/* COORDINATED MAP-AND-LIST EXPERIENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Elegant Table & Filtered Roster (Not huge cards) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-5 shadow-subtle">
            
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E8E1] mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-[#929B92] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by unit ID, name, or base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8F7F2] border border-[#E8E8E1] rounded-xl text-[#203B32] placeholder-[#929B92] focus:outline-none focus:border-[#245C4A]"
                />
              </div>

              <div className="flex items-center gap-1 text-xs font-sans">
                <span className="text-[11px] text-[#707970] mr-1">Capability:</span>
                {['ALL', 'Advanced', 'Basic'].map((cap) => (
                  <button
                    key={cap}
                    onClick={() => setCapabilityFilter(cap)}
                    className={`px-2.5 py-1 rounded-lg border transition-all ${
                      capabilityFilter === cap
                        ? 'bg-[#EEF4EF] text-[#245C4A] font-semibold border-[#CBDACD]'
                        : 'bg-[#F8F7F2] text-[#707970] border-[#E8E8E1] hover:text-[#203B32]'
                    }`}
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>

            {/* Elegant Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#E8E8E1] text-[#707970] text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold pl-2">Operational Unit</th>
                    <th className="pb-3 font-semibold">Capability</th>
                    <th className="pb-3 font-semibold">Base Location</th>
                    <th className="pb-3 font-semibold">ETA to Scene</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E1]">
                  {filteredTransits(filteredAmbulances).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#707970]">
                        No units match the search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAmbulances.map((amb) => {
                      const isAssigned = assignedAmbulance?.id === amb.id || amb.status === 'ASSIGNED';
                      const isSelected = selectedAmbulance?.id === amb.id;
                      const isRec = amb.isRecommended;

                      return (
                        <tr
                          key={amb.id}
                          onClick={() => setSelectedAmbulance(amb)}
                          className={`hover:bg-[#F8F7F2] transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#EEF4EF]/50' : ''
                          } ${isRec ? 'border-l-2 border-l-[#245C4A]' : ''}`}
                        >
                          <td className="py-3.5 pl-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#203B32]">{amb.id}</span>
                              {isRec && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#EEF4EF] text-[#245C4A] border border-[#CBDACD] rounded">
                                  RECOMMENDED
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#707970] block">{amb.name}</span>
                          </td>

                          <td className="py-3.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              amb.capability?.includes('Advanced') || amb.capability?.includes('ALS')
                                ? 'bg-[#EEF4EF] text-[#245C4A] border border-[#CBDACD]'
                                : 'bg-[#F4F7F4] text-[#707970] border border-[#E8E8E1]'
                            }`}>
                              {amb.capability || 'BLS'}
                            </span>
                          </td>

                          <td className="py-3.5 text-[#203B32]">
                            {amb.base_location || 'Bengaluru Central'}
                          </td>

                          <td className="py-3.5">
                            <div className="flex items-center gap-1 text-[#203B32] font-semibold">
                              <Clock className="w-3.5 h-3.5 text-[#245C4A]" />
                              <span>{amb.eta_min || 6} min</span>
                            </div>
                          </td>

                          <td className="py-3.5">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                              isAssigned ? 'text-[#B94430]' : 'text-[#245C4A]'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isAssigned ? 'bg-[#E66B55]' : 'bg-[#245C4A]'}`} />
                              {isAssigned ? 'Assigned' : 'Available'}
                            </span>
                          </td>

                          <td className="py-3.5 pr-2 text-right">
                            {isAssigned ? (
                              <span className="text-[11px] font-semibold text-[#B94430] bg-[#FCECE9] px-2.5 py-1 rounded-lg border border-[#F5C2BA]">
                                Dispatched
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssign(amb);
                                }}
                                disabled={assigningId === amb.id}
                                className="px-3 py-1 rounded-lg bg-[#245C4A] hover:bg-[#1D4A3B] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                              >
                                {assigningId === amb.id ? 'Dispatching...' : 'Dispatch'}
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

        {/* Right Column: Contextual Detail Panel & Spatial Map Preview */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Contextual Detail Panel */}
          {selectedAmbulance && (
            <div className="bg-white rounded-3xl border border-[#E8E8E1] p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
                <div>
                  <span className="text-[11px] font-sans text-[#707970] uppercase">Selected Unit Detail</span>
                  <h3 className="font-serif text-lg font-bold text-[#203B32]">
                    {selectedAmbulance.name}
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-[#245C4A] bg-[#EEF4EF] px-2.5 py-1 rounded-lg border border-[#CBDACD]">
                  {selectedAmbulance.id}
                </span>
              </div>

              {/* Rationale if recommended */}
              <div className="p-3.5 bg-[#EEF4EF] rounded-2xl border border-[#CBDACD] text-xs font-sans text-[#203B32]">
                <span className="font-bold text-[#245C4A] block mb-1">
                  Why this unit was recommended:
                </span>
                <p className="text-[#203B32] leading-relaxed text-[11px]">
                  {selectedAmbulance.recommendation_reason || 
                    `Closest available ALS paramedic team with 6-minute estimated transit time along Mysore Road corridor.`}
                </p>
              </div>

              <div className="space-y-2 text-xs font-sans text-[#707970]">
                <div className="flex justify-between py-1 border-b border-[#E8E8E1]">
                  <span>Vehicle Registration:</span>
                  <span className="font-mono font-medium text-[#203B32]">{selectedAmbulance.vehicle_number || 'KA-01-EA-4219'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E8E8E1]">
                  <span>Lead Paramedic:</span>
                  <span className="font-medium text-[#203B32]">{selectedAmbulance.driver_name || 'Officer S. Kumar'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E8E8E1]">
                  <span>Direct Radio:</span>
                  <span className="font-mono text-[#245C4A]">{selectedAmbulance.contact_number || '+91 98450 11202'}</span>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {assignedAmbulance?.id === selectedAmbulance.id ? (
                  <div className="w-full py-2.5 rounded-xl bg-[#FCECE9] border border-[#F5C2BA] text-[#B94430] text-xs font-semibold text-center">
                    Currently Assigned to Incident {incidentId}
                  </div>
                ) : (
                  <button
                    onClick={() => handleAssign(selectedAmbulance)}
                    disabled={assigningId === selectedAmbulance.id}
                    className="w-full py-2.5 rounded-xl bg-[#245C4A] hover:bg-[#1D4A3B] text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Assign &amp; Dispatch {selectedAmbulance.id}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Spatial Map Preview */}
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-3 shadow-subtle">
            <div className="h-[260px] rounded-2xl overflow-hidden border border-[#E8E8E1]">
              <MapView
                ambulances={filteredAmbulances}
                center={selectedAmbulance?.lat ? [selectedAmbulance.lat, selectedAmbulance.lng] : [12.955, 77.545]}
                zoom={13}
                height="100%"
              />
            </div>
            <p className="text-[11px] text-[#707970] text-center mt-2 font-sans">
              Live spatial coordinates of available fleet units
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

function filteredTransits(arr) {
  return arr || [];
}
