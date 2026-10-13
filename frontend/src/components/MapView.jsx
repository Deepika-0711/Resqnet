import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom SVG Icons with Calm in a Crisis palette
function createCustomIcon(type, label, color = '#E66B55') {
  let html = '';
  if (type === 'incident') {
    html = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: #E66B5522; border: 1.5px solid #E66B55; animation: pulse 2s infinite;"></div>
        <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background-color: #E66B55; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(230, 107, 85, 0.35);">
          <span style="font-size: 11px; font-weight: 700; color: white; line-height: 1;">!</span>
        </div>
      </div>
    `;
  } else if (type === 'ambulance') {
    html = `
      <div style="display: flex; align-items: center; gap: 4px; padding: 3px 6px; border-radius: 9999px; background-color: #FFFFFF; border: 1.5px solid #245C4A; box-shadow: 0 2px 6px rgba(36, 92, 74, 0.15);">
        <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #245C4A; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px;">✚</div>
        <span style="font-size: 10px; font-weight: 700; color: #203B32; font-family: monospace;">${label || 'AMB'}</span>
      </div>
    `;
  } else if (type === 'hospital') {
    html = `
      <div style="display: flex; align-items: center; gap: 4px; padding: 3px 6px; border-radius: 9999px; background-color: #FFFFFF; border: 1.5px solid #203B32; box-shadow: 0 2px 6px rgba(32, 59, 50, 0.12);">
        <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #203B32; display: flex; align-items: center; justify-content: center; color: white; font-size: 9px;">H</div>
        <span style="font-size: 10px; font-weight: 600; color: #203B32; max-width: 65px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${label || 'ER'}</span>
      </div>
    `;
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
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
  height = '480px'
}) {
  const defaultCenter = center || [12.955, 77.545];

  return (
    <div style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden relative border border-[#E8E8E1] shadow-subtle bg-[#F8F7F2]">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <MapRecenter center={defaultCenter} />
        
        {/* OpenStreetMap light-styled tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Incidents */}
        {incidents.map((inc) => {
          if (!inc.lat || !inc.lng) return null;
          const color = inc.priority === 'CRITICAL' ? '#E66B55' : (inc.priority === 'HIGH' ? '#E7B65C' : '#245C4A');
          return (
            <Marker
              key={`inc-${inc.id}`}
              position={[inc.lat, inc.lng]}
              icon={createCustomIcon('incident', inc.id, color)}
            >
              <Popup>
                <div className="font-sans p-1 text-xs text-[#203B32]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-mono font-bold text-xs text-[#B94430]">{inc.id}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#FCECE9] text-[#B94430]">
                      {inc.priority}
                    </span>
                  </div>
                  <p className="font-medium text-[#203B32]">{inc.location}</p>
                  <p className="text-[#707970] mt-1">{inc.people_count || inc.peopleCount || 1} people involved</p>
                  <p className="text-[#707970] font-mono text-[10px] mt-0.5">Status: {inc.status}</p>
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
              icon={createCustomIcon('ambulance', amb.id?.slice(-3) || 'AMB')}
            >
              <Popup>
                <div className="font-sans p-1 text-xs text-[#203B32]">
                  <p className="font-bold text-sm text-[#245C4A]">{amb.name} ({amb.id})</p>
                  <p className="text-[#707970] text-[11px] mt-0.5">Capability: <strong>{amb.capability}</strong></p>
                  <p className="text-[#707970] text-[11px]">Base: {amb.base_location}</p>
                  <div className="mt-1.5 inline-block text-[10px] font-semibold text-[#245C4A] bg-[#EEF4EF] px-2 py-0.5 rounded">
                    {amb.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 3. Hospitals */}
        {hospitals.map((hosp) => {
          if (!hosp.lat || !hosp.lng) return null;
          const shortName = hosp.name?.split(' ')[0] || 'Hospital';
          return (
            <Marker
              key={`hosp-${hosp.id}`}
              position={[hosp.lat, hosp.lng]}
              icon={createCustomIcon('hospital', shortName)}
            >
              <Popup>
                <div className="font-sans p-1 text-xs text-[#203B32]">
                  <p className="font-bold text-sm text-[#203B32]">{hosp.name}</p>
                  <p className="text-[#707970] text-[11px]">{hosp.capability}</p>
                  <div className="mt-1.5 flex gap-2 font-mono text-[11px]">
                    <span className="text-[#245C4A] font-bold bg-[#EEF4EF] px-1.5 py-0.5 rounded">{hosp.emergency_beds_available} ER Beds</span>
                    <span className="text-[#203B32] font-bold bg-[#F4F7F4] px-1.5 py-0.5 rounded">{hosp.icu_beds_available} ICU</span>
                  </div>
                  <p className="text-[10px] text-[#707970] mt-1">Capacity: {hosp.capacity_status}</p>
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
          
          let color = '#E7B65C'; // warm amber for alternative
          let weight = 4;
          let dashArray = '5, 8';

          if (isRecommended || isSelected) {
            color = '#245C4A'; // forest green for recommended
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
                opacity: isRecommended || isSelected ? 0.95 : 0.7
              }}
            >
              <Popup>
                <div className="font-sans p-1 text-xs text-[#203B32]">
                  <p className="font-bold text-sm text-[#203B32]">
                    {rt.route_name} {isRecommended && '(Recommended)'}
                  </p>
                  <p className="text-[#707970]">{rt.distance_km || rt.distanceKm} km • {rt.eta_min || rt.etaMin} min transit</p>
                  <p className="text-[#707970] font-mono text-[10px] mt-0.5">Traffic: {rt.traffic_level || rt.traffic}</p>
                </div>
              </Popup>
            </Polyline>
          );
        })}

      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-xl text-[11px] font-sans border border-[#E8E8E1] shadow-sheet flex flex-wrap items-center gap-3.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E66B55]" />
          <span className="text-[#203B32] font-medium">Incident</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#245C4A]" />
          <span className="text-[#203B32] font-medium">Ambulance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#203B32] text-white text-[8px] flex items-center justify-center font-bold">H</span>
          <span className="text-[#203B32] font-medium">Hospital</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-1 bg-[#245C4A] rounded" />
          <span className="text-[#245C4A] font-semibold">Route B (Recommended)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-1 bg-[#E7B65C] border-dashed rounded" />
          <span className="text-[#9E6F18] font-medium">Route A (Choked)</span>
        </div>
      </div>
    </div>
  );
}
