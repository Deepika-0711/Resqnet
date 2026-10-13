import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  FileText,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Info
} from 'lucide-react';
import MapView from '../components/MapView';
import { SimulationBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { socket } from '../services/socket';

export default function EmergencyMap() {
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('incidentId') || 'RSQ-2026-001';

  const [routes, setRoutes] = useState([]);
  const [incident, setIncident] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingRouteId, setSelectingRouteId] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectNotice, setSelectNotice] = useState('');

  const loadData = async () => {
    try {
      const [rRes, incRes, ambRes, hospRes] = await Promise.all([
        api.calculateRoutes(incidentId),
        api.getIncidentById(incidentId).catch(() => null),
        api.getAvailableAmbulances(incidentId).catch(() => null),
        api.getAvailableHospitals(incidentId).catch(() => null)
      ]);

      if (rRes && rRes.routes) {
        setRoutes(rRes.routes);
        const sel = rRes.routes.find(r => r.is_selected || r.isSelected);
        if (sel) setSelectedRoute(sel);
        else {
          const rec = rRes.routes.find(r => r.is_recommended || r.isRecommended);
          if (rec) setSelectedRoute(rec);
        }
      }

      if (incRes && incRes.incident) setIncident(incRes.incident);
      if (ambRes && ambRes.ambulances) setAmbulances(ambRes.ambulances);
      if (hospRes && hospRes.hospitals) setHospitals(hospRes.hospitals);
    } catch (err) {
      console.error('Failed loading route intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const onRouteSelected = (data) => {
      if (data && data.incidentId === incidentId) {
        loadData();
      }
    };

    socket.on('routeSelected', onRouteSelected);
    return () => socket.off('routeSelected', onRouteSelected);
  }, [incidentId]);

  const handleSelectRoute = async (rt) => {
    setSelectingRouteId(rt.id);
    try {
      const res = await api.selectRoute(incidentId, rt.id);
      setSelectedRoute(rt);
      setSelectNotice(`${rt.route_name} confirmed as primary transit corridor.`);
      setTimeout(() => setSelectNotice(''), 4000);
      loadData();
    } catch (err) {
      console.error('Failed selecting route:', err.message);
    } finally {
      setSelectingRouteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E8E1] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#245C4A]" />
            <span className="text-xs uppercase font-sans font-semibold tracking-wider text-[#707970]">
              Corridor Intelligence
            </span>
            <SimulationBadge />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#203B32] tracking-tight">
            Route Intelligence &amp; Spatial Risk
          </h1>
          <p className="text-xs text-[#707970] font-sans mt-0.5">
            Dynamic risk-weighted transit comparison: Route B (Outer Ring Road) vs Route A (Hosur Road choke).
          </p>
        </div>

        <Link
          to={`/handoff/${incidentId}`}
          className="px-4 py-2 rounded-xl bg-[#245C4A] hover:bg-[#1D4A3B] text-white text-xs font-sans font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <span>Handoff Brief</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {selectNotice && (
        <div className="p-3 bg-[#EEF4EF] border border-[#CBDACD] text-[#245C4A] text-xs font-sans rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{selectNotice}</span>
        </div>
      )}

      {/* Main Grid: Prominent Map on Left, Corridor Comparison on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Prominent Map */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-3 shadow-subtle">
            <div className="h-[520px] rounded-2xl overflow-hidden border border-[#E8E8E1]">
              <MapView
                incidents={incident ? [incident] : []}
                ambulances={ambulances}
                hospitals={hospitals}
                routes={routes}
                center={incident?.lat ? [incident.lat, incident.lng] : [12.955, 77.545]}
                zoom={13}
                height="100%"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#707970] font-sans px-3 py-2 mt-1">
              <span>Solid Green: Route B (Recommended) • Dashed Amber: Route A (Congested)</span>
              <span className="font-mono text-[11px] text-[#245C4A]">Live OSM Telemetry</span>
            </div>
          </div>
        </div>

        {/* Right Column: Route B vs Route A Comparison */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-5 shadow-subtle space-y-4">
            <div className="pb-3 border-b border-[#E8E8E1]">
              <h2 className="font-serif text-lg font-bold text-[#203B32]">
                Corridor Comparison
              </h2>
              <p className="text-[11px] text-[#707970] font-sans">
                Real-time congestion and historical accident hotspot risk
              </p>
            </div>

            {/* Route Cards */}
            <div className="space-y-3">
              {routes.map((rt) => {
                const isRec = rt.is_recommended || rt.isRecommended;
                const isSel = selectedRoute?.id === rt.id || rt.is_selected;

                return (
                  <div
                    key={rt.id || rt.route_name}
                    onClick={() => handleSelectRoute(rt)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isRec
                        ? 'bg-[#EEF4EF] border-[#245C4A] shadow-subtle'
                        : 'bg-[#FFFFFF] border-[#E8E8E1] hover:border-[#CBDACD]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-serif font-bold text-sm text-[#203B32]">
                        {rt.route_name}
                      </span>
                      {isRec && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#245C4A] text-white">
                          RECOMMENDED
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-sans text-[#707970] mb-3">
                      <div>
                        <span className="text-[10px] text-[#929B92] block">Estimated Transit</span>
                        <span className="font-semibold text-sm text-[#203B32]">{rt.eta_min || rt.etaMin} min</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#929B92] block">Total Distance</span>
                        <span className="font-semibold text-sm text-[#203B32]">{rt.distance_km || rt.distanceKm} km</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#203B32] leading-relaxed mb-3">
                      {rt.rationale || (isRec 
                        ? 'Avoids Silk Board flyover bottleneck. 4.2 km longer but saves 9 minutes of critical transit.' 
                        : 'Direct path but currently experiencing heavy junction choke and slow speeds.')}
                    </p>

                    <div className="pt-2 border-t border-[#E8E8E1]/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#707970]">
                        Traffic: <strong>{rt.traffic_level || rt.traffic || 'Moderate'}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRoute(rt);
                        }}
                        disabled={selectingRouteId === rt.id}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSel
                            ? 'bg-[#245C4A] text-white'
                            : 'bg-white text-[#245C4A] border border-[#CBDACD] hover:bg-[#EEF4EF]'
                        }`}
                      >
                        {isSel ? 'Route Locked' : 'Select Route'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breeth AI Corridor Context Box */}
          <div className="p-4 bg-white rounded-3xl border border-[#E8E8E1] shadow-subtle space-y-2 text-xs font-sans">
            <span className="text-xs font-bold text-[#245C4A] uppercase tracking-wider block">
              Corridor Historical Intelligence
            </span>
            <p className="text-[#707970] leading-relaxed text-[11px]">
              Mysore Road near NICE junction experiences frequent slow traffic between 18:00–20:30. Routing via Outer Ring Road reduces delay variance by 42%.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
