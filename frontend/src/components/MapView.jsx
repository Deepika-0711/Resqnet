import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom SVG Icons without broken external PNG dependencies
function createCustomIcon(type, label, color = '#ef4444') {
  let html = '';
  if (type === 'incident') {
    html = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${color}33; border: 2px solid ${color}; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background-color: ${color}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color};">
          <span style="font-size: 11px; font-weight: bold; color: white;">!</span>
        </div>
      </div>
    `;
  } else if (type === 'ambulance') {
    html = `
      <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background-color: #0d1322; border: 2px solid #06b6d4; box-shadow: 0 0 8px #06b6d4; font-size: 14px;">
        🚑
      </div>
    `;
  } else if (type === 'hospital') {
    html = `
      <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background-color: #0d1322; border: 2px solid #3b82f6; box-shadow: 0 0 8px #3b82f6; font-size: 14px;">
        🏥
      </div>
    `;
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

// Controller to smoothly pan map when center changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function MapView({
  incidents = [],
  ambulances = [],
  hospitals = [],
  routes = [],
  center = [12.955, 77.545],
  zoom = 13,
  height = '460px'
}) {
  const defaultCenter = center || [12.955, 77.545];

  return (
    <div style={{ height, width: '100%' }} className="rounded-xl overflow-hidden relative border border-resq-border shadow-inner dark-tiles">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <MapRecenter center={defaultCenter} />
        
        {/* OpenStreetMap dark-styled tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Incidents */}
        {incidents.map((inc) => {
          if (!inc.lat || !inc.lng) return null;
          const color = inc.priority === 'CRITICAL' ? '#ef4444' : (inc.priority === 'HIGH' ? '#f97316' : '#eab308');
          return (
            <Marker
              key={`inc-${inc.id}`}
              position={[inc.lat, inc.lng]}
              icon={createCustomIcon('incident', inc.id, color)}
            >
              <Popup>
                <div className="text-slate-900 font-sans p-1 text-xs">
                  <p className="font-bold text-red-600 font-mono text-sm">{inc.id} ({inc.priority})</p>
                  <p className="font-semibold text-slate-800">{inc.location}</p>
                  <p className="text-slate-600 mt-1">{inc.people_count || inc.peopleCount || 1} people involved</p>
                  <p className="text-slate-500 font-mono text-[10px] mt-1">Status: {inc.status}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 2. Ambulances */}
        {ambulances.map((amb) => {
          if (!amb.lat || !amb.lng) return null;
          return (
            <Marker
              key={`amb-${amb.id}`}
              position={[amb.lat, amb.lng]}
              icon={createCustomIcon('ambulance', amb.id)}
            >
              <Popup>
                <div className="text-slate-900 font-sans p-1 text-xs">
                  <p className="font-bold text-cyan-700 font-mono text-sm">Unit {amb.id}</p>
                  <p className="font-medium text-slate-700">{amb.name}</p>
                  <p className="text-slate-600 mt-0.5">Capability: <strong>{amb.capability}</strong></p>
                  <p className="text-slate-600">Base: {amb.base_location}</p>
                  <p className="font-mono text-[10px] font-semibold text-emerald-700 mt-1">Status: {amb.status}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 3. Hospitals */}
        {hospitals.map((hosp) => {
          if (!hosp.lat || !hosp.lng) return null;
          return (
            <Marker
              key={`hosp-${hosp.id}`}
              position={[hosp.lat, hosp.lng]}
              icon={createCustomIcon('hospital', hosp.id)}
            >
              <Popup>
                <div className="text-slate-900 font-sans p-1 text-xs">
                  <p className="font-bold text-blue-700 text-sm">{hosp.name}</p>
                  <p className="text-slate-700 text-[11px]">{hosp.capability}</p>
                  <div className="mt-1 flex gap-2 font-mono text-[11px]">
                    <span className="text-emerald-700 font-bold">{hosp.emergency_beds_available} ER Beds</span>
                    <span className="text-indigo-700 font-bold">{hosp.icu_beds_available} ICU</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Intake: {hosp.capacity_status}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 4. Routes */}
        {routes.map((rt) => {
          if (!rt.waypoints || rt.waypoints.length < 2) return null;
          const isSelected = Boolean(rt.is_selected);
          const isRecommended = Boolean(rt.is_recommended);
          
          let color = '#f59e0b'; // amber
          let weight = 4;
          let dashArray = '6, 8';

          if (isSelected) {
            color = '#06b6d4'; // cyan
            weight = 6;
            dashArray = undefined;
          } else if (isRecommended) {
            color = '#10b981'; // emerald
            weight = 5;
            dashArray = undefined;
          }

          return (
            <Polyline
              key={`route-${rt.id || rt.route_name}`}
              positions={rt.waypoints}
              pathOptions={{
                color,
                weight,
                dashArray,
                opacity: isSelected ? 0.95 : 0.75
              }}
            >
              <Popup>
                <div className="text-slate-900 font-sans p-1 text-xs">
                  <p className="font-bold text-sm">{rt.route_name} {isRecommended && '(Recommended)'}</p>
                  <p className="text-slate-700">{rt.distance_km || rt.distanceKm} km • {rt.eta_min || rt.etaMin} min</p>
                  <p className="text-slate-500 font-mono text-[10px]">Traffic: {rt.traffic_level || rt.traffic}</p>
                  <p className="text-slate-500 font-mono text-[10px]">Risk: {rt.risk_level || rt.risk}</p>
                </div>
              </Popup>
            </Polyline>
          );
        })}

      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] glass-panel px-3 py-2 rounded-lg text-[11px] font-mono border border-slate-700/80 shadow-lg flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-slate-300">Incident</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🚑</span>
          <span className="text-slate-300">Ambulance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🏥</span>
          <span className="text-slate-300">Hospital</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 bg-emerald-500 rounded" />
          <span className="text-slate-300">Recommended Route (B)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 bg-amber-500 border-dashed rounded" />
          <span className="text-slate-300">Alternative (A)</span>
        </div>
      </div>
    </div>
  );
}
