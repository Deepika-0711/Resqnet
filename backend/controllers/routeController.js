const db = require('../config/db');
const { calculateRoutes } = require('../services/routeService');
const { syncHandoff } = require('../services/handoffService');
const { logEvent } = require('../utils/logger');
const { emitEvent } = require('../services/socketService');

// Calculate available alternative routes
function getRoutes(req, res, next) {
  try {
    const { incidentId } = req.body.incidentId ? req.body : req.query;
    const resolvedIncidentId = incidentId || 'RSQ-2026-001';

    const routes = calculateRoutes(resolvedIncidentId);
    return res.json({ success: true, count: routes.length, routes });
  } catch (err) {
    next(err);
  }
}

// Select a route
function selectRoute(req, res, next) {
  try {
    const { incidentId, routeId } = req.body;

    if (!incidentId || !routeId) {
      return res.status(400).json({ error: 'incidentId and routeId are required' });
    }

    const incident = db.get('SELECT * FROM incidents WHERE id = ?', [incidentId]);
    if (!incident) {
      return res.status(404).json({ error: `Incident ${incidentId} not found` });
    }

    const route = db.get('SELECT * FROM routes WHERE id = ?', [routeId]);
    if (!route) {
      return res.status(404).json({ error: `Route ${routeId} not found` });
    }

    const now = new Date().toISOString();

    // Mark previous routes unselected and this route selected
    db.run('UPDATE routes SET is_selected = 0 WHERE incident_id = ?', [incidentId]);
    db.run('UPDATE routes SET is_selected = 1 WHERE id = ?', [routeId]);

    // Update incident
    db.run("UPDATE incidents SET selected_route_id = ?, status = 'ROUTE_SELECTED', updated_at = ? WHERE id = ?", [routeId, now, incidentId]);

    // Timeline event
    logEvent(
      incidentId,
      'ROUTE_SELECTED',
      `${route.route_name} selected for transit (${route.distance_km} km, ${route.eta_min} min, ${route.traffic_level} traffic, ${route.risk_level} risk). Navigation telemetry synced with responder.`,
      'ROUTE_DISPATCHER',
      { routeId, routeName: route.route_name, etaMin: route.eta_min }
    );

    // Sync handoff
    const handoff = syncHandoff(incidentId);

    // Broadcast
    emitEvent('routeSelected', { incidentId, routeId, routeName: route.route_name });
    emitEvent('incidentStatusChanged', { incidentId, status: 'ROUTE_SELECTED' });
    emitEvent('handoffUpdated', { incidentId, handoff });
    emitEvent('dashboardUpdated', {});

    return res.json({
      success: true,
      message: `${route.route_name} locked for navigation`,
      route: { ...route, waypoints: JSON.parse(route.waypoints || '[]') },
      handoff
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRoutes,
  selectRoute
};
