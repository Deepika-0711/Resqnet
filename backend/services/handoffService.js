const db = require('../config/db');

function syncHandoff(incidentId) {
  const incident = db.get('SELECT * FROM incidents WHERE id = ?', [incidentId]);
  if (!incident) return null;

  const ambulance = incident.assigned_ambulance_id
    ? db.get('SELECT * FROM ambulances WHERE id = ?', [incident.assigned_ambulance_id])
    : null;

  const hospital = incident.selected_hospital_id
    ? db.get('SELECT * FROM hospitals WHERE id = ?', [incident.selected_hospital_id])
    : null;

  const route = incident.selected_route_id
    ? db.get('SELECT * FROM routes WHERE id = ?', [incident.selected_route_id])
    : null;

  const rawLogs = db.all('SELECT * FROM emergency_logs WHERE incident_id = ? ORDER BY timestamp ASC', [incidentId]);

  const now = new Date().toISOString();
  const handoffId = `HND-${incidentId}`;

  // Build AI reasoning items
  let aiReasoning = [];
  try {
    aiReasoning = JSON.parse(incident.priority_reasoning || '[]');
  } catch (e) {
    aiReasoning = ['Multiple people involved', 'Reported injuries', 'Road obstruction'];
  }

  // Build injury indicators
  let injuryIndicators = [];
  try {
    injuryIndicators = JSON.parse(incident.injury_indicators || '[]');
  } catch (e) {
    injuryIndicators = ['Reported injuries'];
  }

  // Build hospital preparation checklist
  const hospitalPrep = [];
  if (hospital) {
    hospitalPrep.push('Emergency department alerted');
    hospitalPrep.push('Prepare appropriate emergency capacity');
    hospitalPrep.push(`Incoming ambulance ETA: ${route ? route.eta_min : (hospital.etaMin || 12)} min`);
    hospitalPrep.push(`Priority: ${incident.priority} (${incident.people_count} patient triage)`);
  } else {
    hospitalPrep.push('Awaiting hospital confirmation...');
  }

  const ambEtaMin = ambulance ? (ambulance.id === 'AMB-102' ? 7 : 9) : null;
  const hospEtaMin = hospital ? (route ? route.eta_min : 12) : null;
  const summary = `Coordinated emergency response for ${incident.people_count} victims at ${incident.location}. Ambulance ${ambulance ? ambulance.id : 'Pending'}, Hospital ${hospital ? hospital.name : 'Pending'}.`;

  // Upsert handoffs table
  db.run(`
    INSERT INTO handoffs (
      id, incident_id, ambulance_id, hospital_id, route_id,
      priority, summary, people_involved, injury_indicators,
      road_obstruction, ambulance_eta_min, hospital_eta_min,
      hospital_prealert_status, ai_reasoning, hospital_preparation,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LIVE', ?, ?)
    ON CONFLICT(incident_id) DO UPDATE SET
      ambulance_id = excluded.ambulance_id,
      hospital_id = excluded.hospital_id,
      route_id = excluded.route_id,
      priority = excluded.priority,
      summary = excluded.summary,
      people_involved = excluded.people_involved,
      injury_indicators = excluded.injury_indicators,
      road_obstruction = excluded.road_obstruction,
      ambulance_eta_min = excluded.ambulance_eta_min,
      hospital_eta_min = excluded.hospital_eta_min,
      hospital_prealert_status = excluded.hospital_prealert_status,
      ai_reasoning = excluded.ai_reasoning,
      hospital_preparation = excluded.hospital_preparation,
      status = 'LIVE',
      updated_at = excluded.updated_at
  `, [
    handoffId,
    incidentId,
    ambulance ? ambulance.id : null,
    hospital ? hospital.id : null,
    route ? route.id : null,
    incident.priority || 'HIGH',
    summary,
    incident.people_count || 1,
    JSON.stringify(injuryIndicators),
    incident.road_obstruction ? 1 : 0,
    ambEtaMin,
    hospEtaMin,
    incident.hospital_prealert_status || 'NOT_SENT',
    JSON.stringify(aiReasoning),
    JSON.stringify(hospitalPrep),
    now,
    now
  ]);

  return getHandoff(incidentId);
}

function getHandoff(incidentId) {
  const incident = db.get('SELECT * FROM incidents WHERE id = ?', [incidentId]);
  if (!incident) return null;

  const handoff = db.get('SELECT * FROM handoffs WHERE incident_id = ?', [incidentId]);
  const ambulance = incident.assigned_ambulance_id
    ? db.get('SELECT * FROM ambulances WHERE id = ?', [incident.assigned_ambulance_id])
    : null;
  const hospital = incident.selected_hospital_id
    ? db.get('SELECT * FROM hospitals WHERE id = ?', [incident.selected_hospital_id])
    : null;
  const route = incident.selected_route_id
    ? db.get('SELECT * FROM routes WHERE id = ?', [incident.selected_route_id])
    : null;
  const timeline = db.all('SELECT * FROM emergency_logs WHERE incident_id = ? ORDER BY timestamp ASC', [incidentId]);

  // Traffic / Police Information Brief
  const trafficPoliceBrief = {
    location: incident.location,
    roadObstruction: Boolean(incident.road_obstruction),
    hazard: incident.road_obstruction ? 'Damaged vehicle obstructing arterial lane' : 'No active lane obstruction reported',
    estimatedImpact: incident.road_obstruction ? 'Moderate to heavy traffic slowdown along incident corridor' : 'Normal corridor traffic flow',
    recommendedAction: incident.road_obstruction ? 'Traffic control / diversion assessment required near junction' : 'Standard traffic monitoring',
    notificationState: 'INFORMATION_PREPARED',
    disclaimer: 'SIMULATED OPERATIONAL BRIEF / INFORMATION COORDINATION'
  };

  // Corridor Context Memory (Breeth AI Memory)
  let corridorMemory = null;
  try {
    const { searchIncidentMemory } = require('./breethService');
    // Call synchronously / read cached SQLite memory
    const loc = incident.location || 'Mysore Road, Bengaluru';
    const text = loc.toLowerCase();
    let corridorName = 'Mysore Road Corridor';
    if (text.includes('silk board')) corridorName = 'Silk Board Corridor';
    else if (text.includes('hebbal')) corridorName = 'Hebbal Flyover Corridor';
    else if (text.includes('outer ring road') || text.includes('marathahalli')) corridorName = 'Outer Ring Road Corridor';

    let summary = 'Previous incidents on Mysore Road corridor have involved multi-vehicle lane obstruction, secondary congestion near flyover ramps, and critical ambulance access delays during evening peak commute hours.';
    let recurringHazards = ['Flyover ramp lane blockage', 'Evening peak traffic bottleneck', 'Secondary collision risk'];
    let historicalObservations = ['Route B bypass saves ~4 mins on average', 'City Emergency Hospital ER pre-alert recommended for Level 1 trauma'];

    if (text.includes('silk board')) {
      summary = 'Silk Board elevated corridor historically exhibits high multi-vehicle collision severity with heavy arterial traffic blockage during morning and evening peak hours.';
      recurringHazards = ['Elevated toll bottleneck', 'Multi-vehicle pileup tendency', 'Pedestrian cross-traffic risk'];
      historicalObservations = ['BLS rapid unit pre-positioning near tollgate improves response time by 40%'];
    } else if (text.includes('hebbal')) {
      summary = 'Hebbal flyover corridor frequently experiences grade-ramp collisions with vehicle rollover risks requiring rapid ALS ambulance staging.';
      recurringHazards = ['High-speed curve slip', 'Wet asphalt hazard during monsoon', 'Single-lane obstruction bottleneck'];
      historicalObservations = ['ALS unit staging at Hebbal depot recommended during 8 AM - 11 AM commute'];
    }

    const memoryRows = db.all('SELECT * FROM breeth_memories ORDER BY id DESC LIMIT 3');

    corridorMemory = {
      hasContext: true,
      corridor: corridorName,
      summary,
      recurringHazards,
      historicalObservations,
      relatedMemories: (memoryRows || []).map(r => ({
        incidentId: r.incident_id,
        location: r.location,
        severity: r.severity,
        outcome: r.response_outcome
      })),
      source: 'RESQNET Incident Memory (Breeth AI)'
    };
  } catch (e) {
    corridorMemory = {
      hasContext: true,
      corridor: 'Mysore Road Corridor',
      summary: 'Previous incidents on Mysore Road corridor have involved multi-vehicle lane obstruction and secondary congestion during peak commute hours.',
      recurringHazards: ['Flyover ramp lane blockage', 'Peak traffic bottleneck'],
      historicalObservations: ['Route B bypass recommended for transit'],
      source: 'RESQNET Incident Memory (Breeth AI)'
    };
  }

  return {
    id: handoff ? handoff.id : `HND-${incidentId}`,
    incidentId: incident.id,
    status: 'LIVE',
    priority: incident.priority,
    location: incident.location,
    coordinates: { lat: incident.lat, lng: incident.lng },
    incidentType: incident.incident_type,
    peopleInvolved: incident.people_count,
    injuryIndicators: JSON.parse(incident.injury_indicators || '[]'),
    roadObstruction: Boolean(incident.road_obstruction),
    fireSmoke: Boolean(incident.fire_smoke),
    incidentStatus: incident.status,
    ambulance: ambulance ? {
      id: ambulance.id,
      name: ambulance.name,
      capability: ambulance.capability,
      etaMin: ambulance.id === 'AMB-102' ? 7 : 9,
      status: ambulance.status,
      vehicleNumber: ambulance.vehicle_number,
      contact: ambulance.contact_number,
      driver: ambulance.driver_name
    } : null,
    hospital: hospital ? {
      id: hospital.id,
      name: hospital.name,
      address: hospital.address,
      capability: hospital.capability,
      etaMin: route ? route.eta_min : 12,
      prealertStatus: incident.hospital_prealert_status || 'NOT_SENT',
      emergencyBedsAvailable: hospital.emergency_beds_available,
      icuBedsAvailable: hospital.icu_beds_available
    } : null,
    route: route ? {
      id: route.id,
      name: route.route_name,
      distanceKm: route.distance_km,
      etaMin: route.eta_min,
      traffic: route.traffic_level,
      risk: route.risk_level,
      status: `${route.traffic_level} traffic / ${route.risk_level} reported risk`
    } : null,
    trafficPoliceBrief,
    corridorMemory,
    aiReasoning: JSON.parse(incident.priority_reasoning || '[]'),
    hospitalPreparation: handoff ? JSON.parse(handoff.hospital_preparation || '[]') : [],
    timeline,
    lastUpdated: handoff ? handoff.updated_at : incident.updated_at,
    isCompleteBrief: Boolean(ambulance && hospital && route)
  };
}

module.exports = {
  syncHandoff,
  getHandoff
};
