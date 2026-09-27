import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  FileText,
  AlertOctagon,
  Gauge
} from 'lucide-react';
import MapView from '../components/MapView';
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
      loadData();
    } catch (err) {
      console.error('Failed selecting route:', err.message);
    } finally {
      setSelectingRouteId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-28 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-resq-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              EMERGENCY NAVIGATION &amp; RISK HUD
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
              LEAFLET OSM ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Emergency Route Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Recommends transit corridors by dynamically evaluating secondary accident risk, bottle-necks, and live choke-points — not merely the shortest distance.
          </p>
        </div>

        <Link
          to={`/handoff/${incidentId}`}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 text-white font-bold text-xs tracking-wider shadow-lg shadow-cyan-600/30 transition-all hover:scale-105"
        >
          <FileText className="w-4 h-4" />
          <span>OPEN LIVE RESQ HANDOFF</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Grid: Interactive Map + Route Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map View (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <MapView
            incidents={incident ? [incident] : [{ id: incidentId, lat: 12.9482, lng: 77.5358, priority: 'HIGH', location: 'Mysore Road, Bengaluru' }]}
            ambulances={ambulances.slice(0, 4)}
            hospitals={hospitals.slice(0, 3)}
            routes={routes}
            height="500px"
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>Map coordinates: Bengaluru West Arterial Corridor</span>
            <span className="text-cyan-400">Green Polyline: Route B (Recommended)</span>
          </div>
        </div>

        {/* Route Alternatives Side Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              EVALUATED ROUTE OPTIONS
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              SIMULATED TRAFFIC TELEMETRY
            </span>
          </div>

          {routes.map((rt) => {
            const isSelected = selectedRoute && (selectedRoute.id === rt.id || selectedRoute.route_name === rt.route_name);
            const isRecommended = Boolean(rt.is_recommended);

            return (
              <div
                key={rt.id || rt.route_name}
                className={`relative rounded-2xl p-5 border-2 transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-gradient-to-br from-[#0c182b] to-[#08101e] shadow-xl shadow-cyan-950/60'
                    : isRecommended
                    ? 'border-emerald-500/50 bg-slate-900/80 hover:border-emerald-500'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                {/* Badge Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold font-mono text-white">
                      {rt.route_name}
                    </span>
                    {isRecommended && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        AI RECOMMENDED
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    rt.traffic_level === 'Heavy' 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {rt.traffic_level} Traffic
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium mb-3">
                  {rt.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono p-3 rounded-xl bg-slate-950/80 border border-slate-800 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">DISTANCE:</span>
                    <span className="font-bold text-white">{rt.distance_km} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">EST. TIME:</span>
                    <span className="font-bold text-emerald-400">{rt.eta_min} min</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">RISK LEVEL:</span>
                    <span className={`font-bold ${rt.risk_level === 'High' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {rt.risk_level}
                    </span>
                  </div>
                </div>

                {/* AI Rationale / Explanation */}
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-300 mb-4 leading-relaxed">
                  <strong>Why {isRecommended ? 'Selected' : 'Not Recommended'}?</strong> {rt.explanation || (isRecommended 
                    ? 'Route B is recommended because estimated travel time is slightly longer (12 min vs 10 min) but reported traffic and secondary collision risk are significantly lower.' 
                    : 'Shorter distance (6.8 km), but heavy flyover bottlenecks create high risk of transit stall.')}
                </div>

                {/* Selection Action */}
                <div>
                  {isSelected ? (
                    <div className="w-full py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>LOCKED TRANSIT ROUTE</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectRoute(rt)}
                      disabled={selectingRouteId === rt.id}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-semibold hover:border-cyan-500/40 transition-all"
                    >
                      {selectingRouteId === rt.id ? 'LOCKING...' : `Select ${rt.route_name} for Navigation`}
                    </button>
                  )}
                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}
