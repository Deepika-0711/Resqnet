const db = require('../config/db');
const { calculateRoutes } = require('../services/routeService');
const { syncHandoff } = require('../services/handoffService');
const { logEvent } = require('../utils/logger');
const { emitEvent } = require('../services/socketService');

const DEMO_INCIDENT_ID = 'RSQ-2026-001';

// Reset demo incident to initial reported state
function resetDemo(req, res, next) {
  try {
    const now = new Date().toISOString();

    // Reset ambulances
    db.run("UPDATE ambulances SET status = 'AVAILABLE', current_incident_id = NULL WHERE current_incident_id = ? OR id IN ('AMB-102', 'AMB-108')", [DEMO_INCIDENT_ID]);

    // Reset routes
    db.run('DELETE FROM routes WHERE incident_id = ?', [DEMO_INCIDENT_ID]);

    // Reset logs
    db.run('DELETE FROM emergency_logs WHERE incident_id = ?', [DEMO_INCIDENT_ID]);

    // Reset handoffs
    db.run('DELETE FROM handoffs WHERE incident_id = ?', [DEMO_INCIDENT_ID]);

    // Reset incident
    db.run(`
      UPDATE incidents SET
        assigned_ambulance_id = NULL,
        selected_hospital_id = NULL,
        selected_route_id = NULL,
        hospital_prealert_status = 'NOT_SENT',
        priority = 'HIGH',
        priority_score = 6,
        status = 'REPORTED',
        updated_at = ?
      WHERE id = ?
    `, [now, DEMO_INCIDENT_ID]);

    logEvent(
      DEMO_INCIDENT_ID,
      'REPORTED',
      'Emergency reported: Road accident on Mysore Road with 3 reported injuries and road obstruction.',
      'WITNESS_DISPATCH'
    );

    const handoff = syncHandoff(DEMO_INCIDENT_ID);

    emitEvent('incidentStatusChanged', { incidentId: DEMO_INCIDENT_ID, status: 'REPORTED' });
    emitEvent('handoffUpdated', { incidentId: DEMO_INCIDENT_ID, handoff });
    emitEvent('dashboardUpdated', {});

    return res.json({
      success: true,
      message: 'Demo state successfully reset to initial reported emergency',
      incidentId: DEMO_INCIDENT_ID,
      handoff
    });
  } catch (err) {
    next(err);
  }
}

// Execute individual demo step
async function executeDemoStep(req, res, next) {
  try {
    const { step } = req.body;
    const now = new Date().toISOString();
    let message = '';
    let status = 'REPORTED';

    switch (Number(step)) {
      case 1: // 0s: Emergency Reported
        message = 'Emergency reported: Mysore Road 3 people injured';
        status = 'REPORTED';
        db.run("UPDATE incidents SET status = 'REPORTED', updated_at = ? WHERE id = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'REPORTED', 'Citizen text report received: Accident near Mysore Road.', 'CITIZEN');
        break;

      case 2: // 2s: AI Analysis Starts
        message = 'AI Analysis pipeline initiated: parsing natural language tokens...';
        status = 'ANALYZING';
        db.run("UPDATE incidents SET status = 'ANALYZING', updated_at = ? WHERE id = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'ANALYZING', 'AI pipeline initiated: Token extraction & hazard classification.', 'AI_ANALYZER');
        break;

      case 3: // 4s: Priority assessed as HIGH
        message = 'AI Priority assessed: HIGH (+2 multiple people, +3 injuries, +1 road obstruction)';
        status = 'ASSESSED';
        db.run(`
          UPDATE incidents SET
            status = 'ASSESSED',
            priority = 'HIGH',
            priority_score = 6,
            updated_at = ?
          WHERE id = ?
        `, [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'AI_ASSESSMENT', 'AI Priority verified: HIGH. Multi-trauma coordination protocol activated.', 'AI_ANALYZER');
        break;

      case 4: // 6s: Ambulance Matching
        message = 'Fleet scanning: evaluating 10 ambulance locations & capabilities...';
        status = 'AMBULANCE_SEARCH';
        db.run("UPDATE incidents SET status = 'AMBULANCE_SEARCH', updated_at = ? WHERE id = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'AMBULANCE_SEARCH', 'Scanning nearest ALS/BLS fleet units.', 'DISPATCHER');
        break;

      case 5: // 8s: AMB-102 Assigned
        message = 'AMB-102 assigned (Advanced Life Support, 7 min ETA)';
        status = 'AMBULANCE_ASSIGNED';
        db.run("UPDATE ambulances SET status = 'ASSIGNED', current_incident_id = ?, updated_at = ? WHERE id = 'AMB-102'", [DEMO_INCIDENT_ID, now]);
        db.run("UPDATE incidents SET assigned_ambulance_id = 'AMB-102', status = 'AMBULANCE_ASSIGNED', updated_at = ? WHERE id = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'AMBULANCE_ASSIGNED', 'AMB-102 (Advanced Life Support) dispatched. ETA: 7 min. Driver: Manoj Gowda.', 'DISPATCHER');
        break;

      case 6: // 10s: Hospital Matching
        message = 'Hospital intake evaluation: ranking 8 trauma facilities by bed capacity...';
        status = 'HOSPITAL_SEARCH';
        db.run("UPDATE incidents SET status = 'HOSPITAL_SEARCH', updated_at = ? WHERE id = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'HOSPITAL_SEARCH', 'Trauma network scanned: checking ICU & ER bay availability.', 'DISPATCHER');
        break;

      case 7: // 12s: Hospital Selected (City Emergency Hospital)
        message = 'City Emergency Hospital selected (Available emergency capacity, 12 min ETA)';
        status = 'HOSPITAL_SELECTED';
        db.run("UPDATE incidents SET selected_hospital_id = 'HOSP-01', status = 'HOSPITAL_SELECTED', updated_at = ? WHERE id = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'HOSPITAL_SELECTED', 'Destination hospital confirmed: City Emergency Hospital.', 'DISPATCHER');
        break;

      case 8: // 14s & 16s: Route Analysis & Route B Selected
        message = 'Route B selected (Outer Ring Road Service Corridor — Moderate traffic, Low risk)';
        status = 'ROUTE_SELECTED';
        calculateRoutes(DEMO_INCIDENT_ID);
        db.run('UPDATE routes SET is_selected = 0 WHERE incident_id = ?', [DEMO_INCIDENT_ID]);
        db.run('UPDATE routes SET is_selected = 1 WHERE id = ?', [`RT-${DEMO_INCIDENT_ID}-B`]);
        db.run("UPDATE incidents SET selected_route_id = ?, status = 'ROUTE_SELECTED', updated_at = ? WHERE id = ?", [`RT-${DEMO_INCIDENT_ID}-B`, now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'ROUTE_SELECTED', 'Route B locked for ambulance transit (7.3 km, 12 min, Moderate traffic, Low risk).', 'ROUTE_ENGINE');
        break;

      case 9: // 18s: Hospital Pre-Alert Sent
        message = 'HOSPITAL PRE-ALERT SENT ✓ (City Emergency Hospital ER notified)';
        status = 'HOSPITAL_ALERTED';
        db.run("UPDATE incidents SET hospital_prealert_status = 'SENT', status = 'HOSPITAL_ALERTED', updated_at = ? WHERE id = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'HOSPITAL_ALERTED', 'Hospital Pre-Alert transmitted to City Emergency Hospital ER. 3 trauma bays reserved.', 'TELEMETRY');
        break;

      case 10: // 20s+: Ambulance En Route & Handoff Live
        message = 'Ambulance AMB-102 EN ROUTE — RESQ HANDOFF synchronized live';
        status = 'AMBULANCE_EN_ROUTE';
        db.run("UPDATE ambulances SET status = 'EN_ROUTE', updated_at = ? WHERE id = 'AMB-102'", [now]);
        db.run("UPDATE incidents SET status = 'AMBULANCE_EN_ROUTE', updated_at = ? WHERE id = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'AMBULANCE_EN_ROUTE', 'Unit AMB-102 active sirens en route. Real-time GPS stream connected.', 'AMBULANCE_GPS');
        break;

      default:
        return res.status(400).json({ error: `Unknown step: ${step}` });
    }

    const handoff = syncHandoff(DEMO_INCIDENT_ID);

    emitEvent('incidentStatusChanged', { incidentId: DEMO_INCIDENT_ID, status });
    emitEvent('handoffUpdated', { incidentId: DEMO_INCIDENT_ID, handoff });
    emitEvent('dashboardUpdated', {});

    return res.json({
      success: true,
      step,
      status,
      message,
      handoff
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  resetDemo,
  executeDemoStep
};
