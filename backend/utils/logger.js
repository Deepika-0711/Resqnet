const db = require('../config/db');

function logEvent(incidentId, eventType, description, actor = 'SYSTEM', metadata = {}) {
  const now = new Date();
  const timestamp = now.toISOString();
  const timeDisplay = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  try {
    const result = db.run(`
      INSERT INTO emergency_logs (incident_id, event_type, timestamp, time_display, description, actor, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [incidentId, eventType, timestamp, timeDisplay, description, actor, JSON.stringify(metadata)]);

    return {
      id: result.lastInsertRowid,
      incidentId,
      eventType,
      timestamp,
      timeDisplay,
      description,
      actor,
      metadata
    };
  } catch (err) {
    console.error('[Logger Error]', err);
    return null;
  }
}

module.exports = {
  logEvent
};
