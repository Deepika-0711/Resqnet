const db = require('../config/db');
const { getAvailableAmbulances } = require('../services/ambulanceService');
const { getAvailableHospitals } = require('../services/hospitalService');
const { syncHandoff } = require('../services/handoffService');
const { logEvent } = require('../utils/logger');
const { emitEvent } = require('../services/socketService');

// Get scored ambulances for an incident
function getAmbulances(req, res, next) {
  try {
    const { incidentId } = req.query;
    const ambulances = getAvailableAmbulances(incidentId || 'RSQ-2026-001');
    return res.json({ success: true, count: ambulances.length, ambulances });
  } catch (err) {
    next(err);
  }
}

// Assign an ambulance to an incident
function assignAmbulance(req, res, next) {
  try {
    const { incidentId, ambulanceId } = req.body;

    if (!incidentId || !ambulanceId) {
      return res.status(400).json({ error: 'incidentId and ambulanceId are required' });
    }

    const incident = db.get('SELECT * FROM incidents WHERE id = ?', [incidentId]);
    if (!incident) {
      return res.status(404).json({ error: `Incident ${incidentId} not found` });
    }

    const ambulance = db.get('SELECT * FROM ambulances WHERE id = ?', [ambulanceId]);
    if (!ambulance) {
      return res.status(404).json({ error: `Ambulance ${ambulanceId} not found` });
    }

    const now = new Date().toISOString();

    // Update ambulance
    db.run("UPDATE ambulances SET status = 'ASSIGNED', current_incident_id = ?, updated_at = ? WHERE id = ?", [incidentId, now, ambulanceId]);

    // Update incident
    db.run("UPDATE incidents SET assigned_ambulance_id = ?, status = 'AMBULANCE_ASSIGNED', updated_at = ? WHERE id = ?", [ambulanceId, now, incidentId]);

    // Log timeline
    const etaMin = ambulanceId === 'AMB-102' ? 7 : 9;
    logEvent(
      incidentId,
      'AMBULANCE_ASSIGNED',
      `Unit ${ambulance.id} (${ambulance.capability} Life Support) assigned to incident. ETA: ${etaMin} minutes. Driver: ${ambulance.driver_name}.`,
      'DISPATCHER',
      { ambulanceId, etaMin, capability: ambulance.capability }
    );

    // Sync handoff
    const handoff = syncHandoff(incidentId);

    // Broadcast
    emitEvent('ambulanceAssigned', { incidentId, ambulanceId, etaMin });
    emitEvent('incidentStatusChanged', { incidentId, status: 'AMBULANCE_ASSIGNED' });
    emitEvent('handoffUpdated', { incidentId, handoff });
    emitEvent('dashboardUpdated', {});

    return res.json({
      success: true,
      message: `Ambulance ${ambulanceId} successfully assigned`,
      ambulance,
      handoff
    });
  } catch (err) {
    next(err);
  }
}

// Get scored hospitals for an incident
function getHospitals(req, res, next) {
  try {
    const { incidentId } = req.query;
    const hospitals = getAvailableHospitals(incidentId || 'RSQ-2026-001');
    return res.json({ success: true, count: hospitals.length, hospitals });
  } catch (err) {
    next(err);
  }
}

// Recommend hospitals endpoint
function recommendHospitals(req, res, next) {
  try {
    const { incidentId } = req.body;
    const hospitals = getAvailableHospitals(incidentId || 'RSQ-2026-001');
    const recommended = hospitals.find(h => h.isRecommended) || hospitals[0];
    return res.json({
      success: true,
      recommendedHospital: recommended,
      allHospitals: hospitals
    });
  } catch (err) {
    next(err);
  }
}

// Select hospital & dispatch Hospital Pre-Alert
function selectHospital(req, res, next) {
  try {
    const hospitalId = req.params.id || req.body.hospitalId;
    const { incidentId } = req.body;

    if (!incidentId || !hospitalId) {
      return res.status(400).json({ error: 'incidentId and hospitalId are required' });
    }

    const incident = db.get('SELECT * FROM incidents WHERE id = ?', [incidentId]);
    if (!incident) {
      return res.status(404).json({ error: `Incident ${incidentId} not found` });
    }

    const hospital = db.get('SELECT * FROM hospitals WHERE id = ?', [hospitalId]);
    if (!hospital) {
      return res.status(404).json({ error: `Hospital ${hospitalId} not found` });
    }

    const now = new Date().toISOString();

    // Update incident with selected hospital & alert status
    db.run(`
      UPDATE incidents SET
        selected_hospital_id = ?,
        hospital_prealert_status = 'SENT',
        status = 'HOSPITAL_SELECTED',
        updated_at = ?
      WHERE id = ?
    `, [hospitalId, now, incidentId]);

    // Log timeline
    logEvent(
      incidentId,
      'HOSPITAL_SELECTED',
      `Destination hospital confirmed: ${hospital.name}. Trauma intake verified.`,
      'DISPATCHER',
      { hospitalId, hospitalName: hospital.name }
    );

    // Pre-alert dispatch log
    logEvent(
      incidentId,
      'HOSPITAL_ALERTED',
      `Hospital Pre-Alert transmitted to ${hospital.name} ER Triage. Emergency capacity reserved for incoming casualties.`,
      'SYSTEM_TELEMETRY',
      { hospitalId, bedsRequested: incident.people_count, priority: incident.priority }
    );

    // Sync handoff
    const handoff = syncHandoff(incidentId);

    // Broadcast
    emitEvent('hospitalSelected', { incidentId, hospitalId, hospitalName: hospital.name });
    emitEvent('hospitalAlerted', { incidentId, hospitalId, prealertStatus: 'SENT' });
    emitEvent('incidentStatusChanged', { incidentId, status: 'HOSPITAL_SELECTED' });
    emitEvent('handoffUpdated', { incidentId, handoff });
    emitEvent('dashboardUpdated', {});

    return res.json({
      success: true,
      message: `Hospital ${hospital.name} selected and Pre-Alert dispatched`,
      hospital,
      prealertStatus: 'SENT',
      handoff
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAmbulances,
  assignAmbulance,
  getHospitals,
  recommendHospitals,
  selectHospital
};
