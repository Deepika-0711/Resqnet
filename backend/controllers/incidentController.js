const db = require('../config/db');
const { analyzeIncidentText } = require('../services/aiService');
const { syncHandoff, getHandoff } = require('../services/handoffService');
const { logEvent } = require('../utils/logger');
const { emitEvent } = require('../services/socketService');

// Create emergency incident
async function createIncident(req, res, next) {
  try {
    const { text, location, lat, lng, imageAnalysis } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Incident description text is required' });
    }

    // Generate Incident ID (e.g. RSQ-2026-002)
    const countRow = db.get('SELECT COUNT(*) as count FROM incidents');
    const seq = (countRow ? countRow.count : 0) + 1;
    const incidentId = `RSQ-2026-${String(seq).padStart(3, '0')}`;
    const now = new Date().toISOString();

    // AI Analysis
    const aiResult = await analyzeIncidentText(text);

    const resolvedLocation = location || aiResult.location || 'Mysore Road, Bengaluru';
    const resolvedLat = lat || (resolvedLocation.toLowerCase().includes('mysore') ? 12.9482 : 12.9716);
    const resolvedLng = lng || (resolvedLocation.toLowerCase().includes('mysore') ? 77.5358 : 77.5946);

    const resolvedIncidentType = aiResult.incidentType || aiResult.incident_type || 'Road Accident';
    const resolvedPeopleCount = Number(aiResult.peopleCount ?? aiResult.people_count ?? 1);
    const resolvedInjuryIndicators = aiResult.injuryIndicators || aiResult.injury_indicators || [];
    const resolvedRoadObstruction = (aiResult.roadObstruction || aiResult.road_obstruction) ? 1 : 0;
    const resolvedFireSmoke = (aiResult.fireSmoke || aiResult.fire_smoke) ? 1 : 0;
    const resolvedAccessDifficulty = (aiResult.accessDifficulty || aiResult.access_difficulty) ? 1 : 0;
    const resolvedPriority = aiResult.priority || 'HIGH';
    const resolvedPriorityScore = Number(aiResult.priorityScore ?? aiResult.priority_score ?? 4);
    const resolvedReasoning = aiResult.reasoning || [];

    db.run(`
      INSERT INTO incidents (
        id, raw_text, incident_type, location, lat, lng,
        people_count, injury_indicators, road_obstruction, fire_smoke,
        access_difficulty, priority, priority_score, priority_reasoning,
        hospital_prealert_status, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NOT_SENT', 'ASSESSED', ?, ?)
    `, [
      incidentId,
      text,
      resolvedIncidentType,
      resolvedLocation,
      resolvedLat,
      resolvedLng,
      resolvedPeopleCount,
      JSON.stringify(resolvedInjuryIndicators),
      resolvedRoadObstruction,
      resolvedFireSmoke,
      resolvedAccessDifficulty,
      resolvedPriority,
      resolvedPriorityScore,
      JSON.stringify(resolvedReasoning),
      now,
      now
    ]);

    // Initial timeline logs
    logEvent(incidentId, 'REPORTED', `Emergency reported: ${text}`, 'WITNESS_DISPATCH');
    logEvent(incidentId, 'AI_ASSESSMENT', `AI Priority assessed as ${aiResult.priority} (Score: ${aiResult.priorityScore}/10). Factors: ${aiResult.reasoning.join(', ')}`, 'AI_ANALYZER');

    // Create live handoff record
    const handoff = syncHandoff(incidentId);

    const incident = db.get('SELECT * FROM incidents WHERE id = ?', [incidentId]);

    // Broadcast real-time events
    emitEvent('incidentCreated', { incidentId, incident });
    emitEvent('incidentAnalyzed', { incidentId, aiResult });
    emitEvent('handoffUpdated', { incidentId, handoff });
    emitEvent('dashboardUpdated', {});

    return res.status(201).json({
      success: true,
      incident: {
        ...incident,
        injury_indicators: JSON.parse(incident.injury_indicators || '[]'),
        priority_reasoning: JSON.parse(incident.priority_reasoning || '[]')
      },
      aiResult,
      handoff
    });
  } catch (err) {
    next(err);
  }
}

// Get all incidents
function getIncidents(req, res, next) {
  try {
    const rows = db.all('SELECT * FROM incidents ORDER BY created_at DESC');
    const incidents = rows.map(r => ({
      ...r,
      injury_indicators: JSON.parse(r.injury_indicators || '[]'),
      priority_reasoning: JSON.parse(r.priority_reasoning || '[]')
    }));
    return res.json({ success: true, count: incidents.length, incidents });
  } catch (err) {
    next(err);
  }
}

// Get single incident by ID
function getIncidentById(req, res, next) {
  try {
    const { id } = req.params;
    const incident = db.get('SELECT * FROM incidents WHERE id = ?', [id]);
    if (!incident) {
      return res.status(404).json({ error: `Incident ${id} not found` });
    }

    const ambulance = incident.assigned_ambulance_id
      ? db.get('SELECT * FROM ambulances WHERE id = ?', [incident.assigned_ambulance_id])
      : null;

    const hospital = incident.selected_hospital_id
      ? db.get('SELECT * FROM hospitals WHERE id = ?', [incident.selected_hospital_id])
      : null;

    const route = incident.selected_route_id
      ? db.get('SELECT * FROM routes WHERE id = ?', [incident.selected_route_id])
      : null;

    const timeline = db.all('SELECT * FROM emergency_logs WHERE incident_id = ? ORDER BY timestamp ASC', [id]);
    const handoff = getHandoff(id);

    return res.json({
      success: true,
      incident: {
        ...incident,
        injury_indicators: JSON.parse(incident.injury_indicators || '[]'),
        priority_reasoning: JSON.parse(incident.priority_reasoning || '[]')
      },
      ambulance,
      hospital: hospital ? { ...hospital, specialties: JSON.parse(hospital.specialties || '[]') } : null,
      route: route ? { ...route, waypoints: JSON.parse(route.waypoints || '[]') } : null,
      handoff,
      timeline
    });
  } catch (err) {
    next(err);
  }
}

// Explicit AI Re-analysis endpoint
async function analyzeIncident(req, res, next) {
  try {
    const { id } = req.params;
    const incident = db.get('SELECT * FROM incidents WHERE id = ?', [id]);
    if (!incident) {
      return res.status(404).json({ error: `Incident ${id} not found` });
    }

    const aiResult = await analyzeIncidentText(incident.raw_text);
    const now = new Date().toISOString();

    db.run(`
      UPDATE incidents SET
        priority = ?,
        priority_score = ?,
        priority_reasoning = ?,
        people_count = ?,
        injury_indicators = ?,
        road_obstruction = ?,
        fire_smoke = ?,
        status = 'ASSESSED',
        updated_at = ?
      WHERE id = ?
    `, [
      aiResult.priority || 'HIGH',
      Number(aiResult.priorityScore ?? aiResult.priority_score ?? 4),
      JSON.stringify(aiResult.reasoning || []),
      Number(aiResult.peopleCount ?? aiResult.people_count ?? 1),
      JSON.stringify(aiResult.injuryIndicators || aiResult.injury_indicators || []),
      (aiResult.roadObstruction || aiResult.road_obstruction) ? 1 : 0,
      (aiResult.fireSmoke || aiResult.fire_smoke) ? 1 : 0,
      now,
      id
    ]);

    logEvent(id, 'AI_ASSESSMENT', `AI Priority updated to ${aiResult.priority}. ${aiResult.reasoning.join(', ')}`, 'AI_ANALYZER');

    const handoff = syncHandoff(id);

    emitEvent('incidentAnalyzed', { incidentId: id, aiResult });
    emitEvent('handoffUpdated', { incidentId: id, handoff });
    emitEvent('dashboardUpdated', {});

    return res.json({ success: true, aiResult, handoff });
  } catch (err) {
    next(err);
  }
}

// Update incident status
function updateIncidentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      'REPORTED', 'ANALYZING', 'ASSESSED', 'AMBULANCE_SEARCH',
      'AMBULANCE_ASSIGNED', 'HOSPITAL_SEARCH', 'HOSPITAL_SELECTED',
      'ROUTE_SELECTED', 'HOSPITAL_ALERTED', 'AMBULANCE_EN_ROUTE',
      'ARRIVED', 'COMPLETED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status: ${status}` });
    }

    const now = new Date().toISOString();
    db.run('UPDATE incidents SET status = ?, updated_at = ? WHERE id = ?', [status, now, id]);

    logEvent(id, 'STATUS_CHANGE', note || `Incident status advanced to ${status}`, 'COMMAND_CENTER', { status });

    // If marked AMBULANCE_EN_ROUTE, also update assigned ambulance status
    const incident = db.get('SELECT * FROM incidents WHERE id = ?', [id]);
    if (status === 'AMBULANCE_EN_ROUTE' && incident.assigned_ambulance_id) {
      db.run('UPDATE ambulances SET status = "EN_ROUTE", updated_at = ? WHERE id = ?', [now, incident.assigned_ambulance_id]);
    } else if (status === 'COMPLETED' && incident.assigned_ambulance_id) {
      db.run('UPDATE ambulances SET status = "AVAILABLE", current_incident_id = NULL, updated_at = ? WHERE id = ?', [now, incident.assigned_ambulance_id]);
    }

    const handoff = syncHandoff(id);

    emitEvent('incidentStatusChanged', { incidentId: id, status });
    emitEvent('handoffUpdated', { incidentId: id, handoff });
    emitEvent('dashboardUpdated', {});

    return res.json({ success: true, status, handoff });
  } catch (err) {
    next(err);
  }
}

// Get timeline for incident
function getIncidentTimeline(req, res, next) {
  try {
    const { id } = req.params;
    const logs = db.all('SELECT * FROM emergency_logs WHERE incident_id = ? ORDER BY timestamp ASC', [id]);
    return res.json({ success: true, incidentId: id, timeline: logs });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createIncident,
  getIncidents,
  getIncidentById,
  analyzeIncident,
  updateIncidentStatus,
  getIncidentTimeline
};
