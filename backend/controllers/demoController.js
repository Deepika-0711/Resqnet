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
      case 1: // Witness reports accident by voice (ElevenLabs)
        message = 'STEP 1: Witness reports accident by voice via ElevenLabs audio recorder...';
        status = 'REPORTED';
        db.run("UPDATE incidents SET status = 'REPORTED', updated_at = ? WHERE id = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'REPORTED', 'Citizen audio recording initiated: Voice intake via ElevenLabs Scribe API.', 'CITIZEN_VOICE');
        break;

      case 2: // ElevenLabs converts speech into text
        message = 'STEP 2: ElevenLabs converts citizen speech into verified editable transcript.';
        status = 'REPORTED';
        logEvent(DEMO_INCIDENT_ID, 'TRANSCRIPT_CONFIRMED', 'ElevenLabs speech-to-text transcript confirmed: "Accident near Mysore Road, 3 injured, car blocking road."', 'ELEVENLABS_STT');
        break;

      case 3: // Incident created
        message = 'STEP 3: Emergency Incident RSQ-2026-001 created on Mysore Road corridor.';
        status = 'REPORTED';
        logEvent(DEMO_INCIDENT_ID, 'INCIDENT_CREATED', 'Incident RSQ-2026-001 registered on Mysore Road, Bengaluru.', 'SYSTEM_CORE');
        break;

      case 4: // Emergency information extracted
        message = 'STEP 4: Emergency NLP information extracted (3 casualties, road obstruction, injuries).';
        status = 'ANALYZING';
        db.run("UPDATE incidents SET status = 'ANALYZING', updated_at = ? WHERE id = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'ANALYZING', 'AI pipeline extracted: 3 casualties, reported trauma, lane blockage.', 'AI_ANALYZER');
        break;

      case 5: // Transparent priority score generated
        message = 'STEP 5: Transparent priority score generated: HIGH (+2 casualties, +3 injuries, +1 obstruction).';
        status = 'ASSESSED';
        db.run(`
          UPDATE incidents SET
            status = 'ASSESSED',
            priority = 'HIGH',
            priority_score = 6,
            updated_at = ?
          WHERE id = ?
        `, [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'AI_ASSESSMENT', 'Deterministic Priority: HIGH (6/10). Multi-trauma coordination active.', 'PRIORITY_ENGINE');
        break;

      case 6: // Breeth searches relevant incident memory
        message = 'STEP 6: CORRIDOR MEMORY FOUND ✓ (Breeth AI retrieved Mysore Road historical collision context).';
        status = 'ASSESSED';
        logEvent(DEMO_INCIDENT_ID, 'BREETH_MEMORY_FOUND', 'Breeth AI retrieved corridor memory: Previous Mysore Road incidents involved flyover ramp congestion & trauma pre-alert urgency.', 'BREETH_AI');
        break;

      case 7: // Traffic/police information brief prepared
        message = 'STEP 7: Traffic & Police information brief prepared for road obstruction coordination.';
        status = 'ASSESSED';
        logEvent(DEMO_INCIDENT_ID, 'TRAFFIC_ALERT_CREATED', 'Traffic/Police brief generated: 1 lane blocked near Mysore Road. Traffic diversion recommended.', 'TRAFFIC_COORDINATOR');
        logEvent(DEMO_INCIDENT_ID, 'POLICE_INFORMATION_READY', 'Police operational brief ready: Damage & hazard telemetry attached.', 'POLICE_STAGING');
        break;

      case 8: // Suitable ambulance selected
        message = 'STEP 8: AMB-102 (Advanced Life Support) matched & dispatched (7 min ETA).';
        status = 'AMBULANCE_ASSIGNED';
        db.run("UPDATE ambulances SET status = 'ASSIGNED', current_incident_id = ?, updated_at = ? WHERE id = 'AMB-102'", [DEMO_INCIDENT_ID, now]);
        db.run("UPDATE incidents SET assigned_ambulance_id = 'AMB-102', status = 'AMBULANCE_ASSIGNED', updated_at = ? WHERE id = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'AMBULANCE_DISPATCHED', 'Unit AMB-102 (Advanced Life Support) dispatched. ETA: 7 min. Driver: Manoj Gowda.', 'DISPATCHER');
        break;

      case 9: // Hospital selected and pre-alert prepared
        message = 'STEP 9: City Emergency Hospital selected & Hospital Pre-Alert dispatched to ER Triage.';
        status = 'HOSPITAL_SELECTED';
        db.run("UPDATE incidents SET selected_hospital_id = 'HOSP-01', hospital_prealert_status = 'SENT', status = 'HOSPITAL_SELECTED', updated_at = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'HOSPITAL_ALERTED', 'Hospital Pre-Alert sent to City Emergency Hospital. 3 trauma bays reserved.', 'HOSPITAL_TRIAGE');
        break;

      case 10: // Route risk evaluated
        message = 'STEP 10: Route B selected (Outer Ring Road Service Corridor — Moderate traffic, Low risk).';
        status = 'ROUTE_SELECTED';
        calculateRoutes(DEMO_INCIDENT_ID);
        db.run('UPDATE routes SET is_selected = 0 WHERE incident_id = ?', [DEMO_INCIDENT_ID]);
        db.run('UPDATE routes SET is_selected = 1 WHERE id = ?', [`RT-${DEMO_INCIDENT_ID}-B`]);
        db.run("UPDATE incidents SET selected_route_id = ?, status = 'ROUTE_SELECTED', updated_at = ? WHERE id = ?", [`RT-${DEMO_INCIDENT_ID}-B`, now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'ROUTE_SELECTED', 'Route B locked for ambulance transit (7.3 km, 12 min, Moderate traffic, Low risk).', 'ROUTE_ENGINE');
        break;

      case 11: // RESQ HANDOFF synchronized
        message = 'STEP 11: RESQ HANDOFF synchronized live across Command Center, Ambulance & Hospital.';
        status = 'AMBULANCE_EN_ROUTE';
        db.run("UPDATE ambulances SET status = 'EN_ROUTE', updated_at = ? WHERE id = 'AMB-102'", [now]);
        db.run("UPDATE incidents SET status = 'AMBULANCE_EN_ROUTE', updated_at = ? WHERE id = ?", [now, DEMO_INCIDENT_ID]);
        logEvent(DEMO_INCIDENT_ID, 'RESQ_HANDOFF_UPDATED', 'RESQ HANDOFF brief synchronized live via Socket.IO across all responder endpoints.', 'HANDOFF_HUB');
        break;

      case 12: // Complete timeline recorded
        message = 'STEP 12: Ambulance AMB-102 EN ROUTE — Full emergency timeline recorded.';
        status = 'AMBULANCE_EN_ROUTE';
        logEvent(DEMO_INCIDENT_ID, 'AMBULANCE_EN_ROUTE', 'Unit AMB-102 active sirens en route. Live GPS stream active.', 'AMBULANCE_GPS');
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
