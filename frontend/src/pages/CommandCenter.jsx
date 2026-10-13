import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  AlertCircle,
  Users,
  Search,
  Filter,
  Layers,
  PhoneCall,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import MapView from '../components/MapView';
import TimelineView from '../components/TimelineView';
import { PriorityBadge, StatusBadge, SimulationBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { socket } from '../services/socket';

export default function CommandCenter() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Search & Filter for incident queue
  const [queueSearch, setQueueSearch] = useState('');
  const [queuePriority, setQueuePriority] = useState('ALL');

  // Map layer toggle
  const [mapFilter, setMapFilter] = useState('ALL'); // 'ALL' | 'INCIDENTS' | 'FLEET' | 'HOSPITALS'
  const [activeRoutes, setActiveRoutes] = useState([]);

  const fetchDashboard = async () => {
    try {
      const data = await api.getDashboardData();
      if (data) {
        setDashboardData(data);
        setError(null);
        if (data.activeIncidents && data.activeIncidents.length > 0) {
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
      setError('Unable to synchronize live coordination backend. Displaying localized data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch routes when selected incident changes
  useEffect(() => {
    if (selectedIncident?.id) {
      api.calculateRoutes(selectedIncident.id)
        .then(res => {
          if (res && res.routes) setActiveRoutes(res.routes);
        })
        .catch(() => setActiveRoutes([]));
    }
  }, [selectedIncident?.id]);

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

  // Filter queue incidents
  const filteredQueue = activeIncidents.filter(inc => {
    const matchesSearch = !queueSearch.trim() ||
      inc.id.toLowerCase().includes(queueSearch.toLowerCase()) ||
      inc.location.toLowerCase().includes(queueSearch.toLowerCase());
    const matchesPriority = queuePriority === 'ALL' || inc.priority === queuePriority;
    return matchesSearch && matchesPriority;
  });

  // Layer filters for map
  const mapIncidents = mapFilter === 'FLEET' || mapFilter === 'HOSPITALS' ? [] : activeIncidents;
  const mapAmbulances = mapFilter === 'INCIDENTS' || mapFilter === 'HOSPITALS' ? [] : ambulances;
  const mapHospitals = mapFilter === 'INCIDENTS' || mapFilter === 'FLEET' ? [] : hospitals;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 space-y-6">
      
      {/* 1. TOP HEADER: Refined Mission Title & Compact Operational Indicators */}
      <div className="bg-white rounded-2xl border border-[#E8E8E1] p-5 shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Mission Statement */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#245C4A]" />
              <h1 className="font-serif text-2xl font-bold text-[#203B32] tracking-tight">
                Emergency Command Center
              </h1>
              <SimulationBadge />
            </div>
            <p className="text-xs text-[#707970] mt-1 font-sans">
              Real-time accident coordination, fleet dispatching, and trauma hospital alignment.
            </p>
          </div>

          {/* Compact Operational Indicators (NOT oversized bulky cards) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Indicator 1: Active Incidents */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FCECE9] border border-[#F5C2BA] text-xs font-sans">
              <span className="w-2 h-2 rounded-full bg-[#E66B55]" />
              <span className="text-[#B94430] font-semibold">{metrics.activeIncidents} Active</span>
            </div>

            {/* Indicator 2: Ambulances Available */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EEF4EF] border border-[#CBDACD] text-xs font-sans">
              <Truck className="w-3.5 h-3.5 text-[#245C4A]" />
              <span className="text-[#245C4A] font-semibold">{metrics.ambulancesAvailable} Ambulances Ready</span>
            </div>

            {/* Indicator 3: Responses En Route */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FCF7ED] border border-[#F4DCAD] text-xs font-sans">
              <Clock className="w-3.5 h-3.5 text-[#9E6F18]" />
              <span className="text-[#9E6F18] font-semibold">{metrics.ambulancesEnRoute || 0} En Route</span>
            </div>

            {/* Indicator 4: Hospitals Available */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F4F7F4] border border-[#E8E8E1] text-xs font-sans">
              <Building2 className="w-3.5 h-3.5 text-[#203B32]" />
              <span className="text-[#203B32] font-semibold">{metrics.hospitalsAvailable} Hospitals Available</span>
            </div>

            {/* Actions: Refresh & Report */}
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="p-2 rounded-xl bg-[#F8F7F2] hover:bg-[#EEF4EF] text-[#707970] hover:text-[#245C4A] border border-[#E8E8E1] transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/report"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E66B55] hover:bg-[#D45943] text-white text-xs font-sans font-semibold shadow-sm transition-all active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Report Emergency</span>
            </Link>

          </div>

        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FCF7ED] border border-[#F4DCAD] text-[#9E6F18] text-xs font-sans flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. MAIN VISUAL WORKSPACE: MAP ALONGSIDE ACTIVE INCIDENT LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Main Element): Large Prominent Spatial Map */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-[#E8E8E1] shadow-subtle">
            
            {/* Map Header Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 px-2 border-b border-[#E8E8E1] gap-2 mb-3">
              <div>
                <span className="font-serif text-base font-bold text-[#203B32]">
                  Live Tactical Response Corridor
                </span>
                <span className="text-xs text-[#707970] ml-2 font-sans">
                  {selectedIncident ? `Focused on ${selectedIncident.id}` : 'All active units'}
                </span>
              </div>

              {/* Layer Toggles */}
              <div className="flex items-center gap-1 bg-[#F8F7F2] p-1 rounded-xl border border-[#E8E8E1] text-[11px] font-sans">
                <button
                  onClick={() => setMapFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    mapFilter === 'ALL'
                      ? 'bg-white text-[#245C4A] font-semibold shadow-subtle border border-[#CBDACD]'
                      : 'text-[#707970] hover:text-[#203B32]'
                  }`}
                >
                  All Layers
                </button>
                <button
                  onClick={() => setMapFilter('INCIDENTS')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    mapFilter === 'INCIDENTS'
                      ? 'bg-white text-[#E66B55] font-semibold shadow-subtle border border-[#F5C2BA]'
                      : 'text-[#707970] hover:text-[#203B32]'
                  }`}
                >
                  Incidents
                </button>
                <button
                  onClick={() => setMapFilter('FLEET')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    mapFilter === 'FLEET'
                      ? 'bg-white text-[#245C4A] font-semibold shadow-subtle border border-[#CBDACD]'
                      : 'text-[#707970] hover:text-[#203B32]'
                  }`}
                >
                  Fleet
                </button>
                <button
                  onClick={() => setMapFilter('HOSPITALS')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    mapFilter === 'HOSPITALS'
                      ? 'bg-white text-[#203B32] font-semibold shadow-subtle border border-[#E8E8E1]'
                      : 'text-[#707970] hover:text-[#203B32]'
                  }`}
                >
                  Trauma
                </button>
              </div>
            </div>

            {/* The Map Component */}
            <div className="h-[480px] sm:h-[540px] rounded-xl overflow-hidden border border-[#E8E8E1]">
              <MapView
                incidents={mapIncidents}
                ambulances={mapAmbulances}
                hospitals={mapHospitals}
                routes={activeRoutes}
                center={selectedIncident?.lat ? [selectedIncident.lat, selectedIncident.lng] : [12.955, 77.545]}
                zoom={selectedIncident?.lat ? 14 : 13}
                height="100%"
              />
            </div>

            {/* Selected Incident Telemetry Bar directly below map */}
            {selectedIncident && (
              <div className="mt-3 p-3 bg-[#F8F7F2] rounded-xl border border-[#E8E8E1] flex flex-wrap items-center justify-between text-xs font-sans gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#203B32]">{selectedIncident.id}</span>
                  <PriorityBadge priority={selectedIncident.priority} size="sm" />
                  <span className="text-[#707970] truncate max-w-xs">{selectedIncident.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/handoff/${selectedIncident.id}`}
                    className="text-[#245C4A] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>View RESQ Handoff</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* 3. HORIZONTAL RESPONSE TIMELINE (Below the Map) */}
          <TimelineView events={recentLogs} layout="horizontal" />

        </div>

        {/* Right Column: Active Incident List (Alongside Map) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8E8E1] p-5 shadow-subtle">
            
            {/* Queue Header & Filters */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1] mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#203B32]">
                  Active Incidents
                </h2>
                <p className="text-[11px] text-[#707970] font-sans">
                  {filteredQueue.length} incidents currently in coordination
                </p>
              </div>

              <Link
                to="/incidents"
                className="text-xs font-semibold text-[#245C4A] hover:underline flex items-center gap-1 font-sans"
              >
                All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Queue Search & Priority Filters */}
            <div className="space-y-2 mb-4">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#929B92] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by ID or location..."
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8F7F2] border border-[#E8E8E1] rounded-xl text-[#203B32] placeholder-[#929B92] focus:outline-none focus:border-[#245C4A]"
                />
              </div>

              <div className="flex items-center gap-1 text-[10px] font-sans">
                {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setQueuePriority(p)}
                    className={`px-2 py-0.5 rounded-lg border transition-all ${
                      queuePriority === p
                        ? 'bg-[#EEF4EF] text-[#245C4A] font-semibold border-[#CBDACD]'
                        : 'bg-[#F8F7F2] text-[#707970] border-[#E8E8E1] hover:text-[#203B32]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Incident Rows alongside the map */}
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredQueue.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#707970] font-sans bg-[#F8F7F2] rounded-xl border border-[#E8E8E1]">
                  No incidents match the active search filter.
                </div>
              ) : (
                filteredQueue.map((inc) => {
                  const isSelected = selectedIncident?.id === inc.id;
                  const isCritical = inc.priority === 'CRITICAL';
                  const isHigh = inc.priority === 'HIGH';

                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EEF4EF] border-[#245C4A] shadow-subtle'
                          : 'bg-[#FFFFFF] border-[#E8E8E1] hover:border-[#CBDACD] hover:bg-[#F8F7F2]'
                      }`}
                    >
                      {/* Row 1: ID, Priority & Status */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#203B32]">{inc.id}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-[#FCECE9] text-[#B94430] border border-[#F5C2BA]'
                              : isHigh
                              ? 'bg-[#FCF7ED] text-[#9E6F18] border border-[#F4DCAD]'
                              : 'bg-[#EEF4EF] text-[#245C4A] border border-[#CBDACD]'
                          }`}>
                            {inc.priority}
                          </span>
                        </div>
                        <StatusBadge status={inc.status} size="sm" />
                      </div>

                      {/* Row 2: Location */}
                      <div className="flex items-start gap-1.5 text-xs text-[#203B32] font-medium mb-2.5">
                        <MapPin className="w-3.5 h-3.5 text-[#245C4A] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{inc.location}</span>
                      </div>

                      {/* Row 3: Ambulance & Hospital Operational Details */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-sans pt-2 border-t border-[#E8E8E1]/80 text-[#707970]">
                        <div>
                          <span className="text-[#929B92] block text-[10px]">Ambulance</span>
                          <span className="font-medium text-[#203B32] truncate block">
                            {inc.assigned_ambulance || 'Pending Dispatch'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#929B92] block text-[10px]">Hospital</span>
                          <span className="font-medium text-[#203B32] truncate block">
                            {inc.selected_hospital || 'Trauma Triage'}
                          </span>
                        </div>
                      </div>

                      {/* Row 4: Quick Action buttons when active */}
                      {isSelected && (
                        <div className="mt-3 pt-2 border-t border-[#CBDACD] flex items-center justify-between text-xs">
                          <span className="text-[10px] text-[#707970] font-mono">
                            {inc.created_at ? new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                          </span>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/handoff/${inc.id}`}
                              className="text-[#245C4A] font-semibold hover:underline flex items-center gap-1"
                            >
                              <span>Handoff Brief</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Link to Emergency Report */}
            <div className="mt-4 pt-4 border-t border-[#E8E8E1]">
              <Link
                to="/report"
                className="w-full py-2.5 px-3 rounded-xl bg-[#F8F7F2] hover:bg-[#EEF4EF] text-[#245C4A] border border-[#CBDACD] text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Open Guided Intake Workspace</span>
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
