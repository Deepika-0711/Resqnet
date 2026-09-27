const db = require('../config/db');

function getDashboardData(req, res, next) {
  try {
    // 1. Counts
    const activeIncidentsRow = db.get(`
      SELECT COUNT(*) as count FROM incidents
      WHERE status NOT IN ('COMPLETED', 'CANCELLED')
    `);

    const ambAvailableRow = db.get(`
      SELECT COUNT(*) as count FROM ambulances WHERE status = 'AVAILABLE'
    `);

    const ambEnRouteRow = db.get(`
      SELECT COUNT(*) as count FROM ambulances WHERE status IN ('ASSIGNED', 'EN_ROUTE')
    `);

    const hospAvailableRow = db.get(`
      SELECT COUNT(*) as count FROM hospitals WHERE capacity_status = 'Available'
    `);

    // 2. Active Incidents list
    const activeIncidents = db.all(`
      SELECT * FROM incidents
      ORDER BY CASE priority
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MODERATE' THEN 3
        ELSE 4
      END, created_at DESC
      LIMIT 10
    `).map(i => ({
      ...i,
      injury_indicators: JSON.parse(i.injury_indicators || '[]'),
      priority_reasoning: JSON.parse(i.priority_reasoning || '[]')
    }));

    // 3. Ambulances
    const ambulances = db.all('SELECT * FROM ambulances ORDER BY id ASC');

    // 4. Hospitals
    const hospitals = db.all('SELECT * FROM hospitals ORDER BY capacity_status ASC');

    // 5. Recent timeline logs
    const recentLogs = db.all('SELECT * FROM emergency_logs ORDER BY timestamp DESC LIMIT 20');

    return res.json({
      success: true,
      metrics: {
        activeIncidents: activeIncidentsRow ? activeIncidentsRow.count : 0,
        ambulancesAvailable: ambAvailableRow ? ambAvailableRow.count : 0,
        ambulancesEnRoute: ambEnRouteRow ? ambEnRouteRow.count : 0,
        hospitalsAvailable: hospAvailableRow ? hospAvailableRow.count : 0
      },
      activeIncidents,
      ambulances,
      hospitals: hospitals.map(h => ({ ...h, specialties: JSON.parse(h.specialties || '[]') })),
      recentLogs
    });
  } catch (err) {
    next(err);
  }
}

function getHotspots(req, res, next) {
  try {
    const rows = db.all(`
      SELECT
        corridor,
        COUNT(*) as totalAccidents,
        SUM(CASE WHEN severity IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END) as criticalCount,
        ROUND(AVG(response_time_min), 1) as avgResponseTime,
        ROUND(AVG(risk_index), 2) as avgRiskIndex,
        lat,
        lng
      FROM accident_history
      GROUP BY corridor
      ORDER BY totalAccidents DESC
    `);

    return res.json({
      success: true,
      simulationBadge: 'SIMULATED HISTORICAL DATA',
      count: rows.length,
      hotspots: rows
    });
  } catch (err) {
    next(err);
  }
}

function getReadiness(req, res, next) {
  try {
    // Group by hour
    const hourlyData = db.all(`
      SELECT
        hour_of_day as hour,
        COUNT(*) as incidentCount,
        SUM(CASE WHEN severity IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END) as severeCount
      FROM accident_history
      GROUP BY hour_of_day
      ORDER BY hour_of_day ASC
    `);

    // Group by day of week
    const dayData = db.all(`
      SELECT
        day_of_week as day,
        COUNT(*) as count
      FROM accident_history
      GROUP BY day_of_week
      ORDER BY count DESC
    `);

    // Severity distribution
    const severityData = db.all(`
      SELECT
        severity,
        COUNT(*) as count
      FROM accident_history
      GROUP BY severity
    `);

    // Strategic positioning recommendations
    const recommendations = [
      {
        corridor: 'Mysore Road (Kengeri - Satellite Bus Stand)',
        historicalDemand: 'HIGH',
        peakPeriod: '6 PM – 9 PM',
        recommendedPositioning: 'Consider positioning additional emergency capacity (ALS Units) near Nayandahalli Junction during peak evening commute.',
        priorityLevel: 'HIGH',
        suggestedUnits: ['AMB-102', 'AMB-108']
      },
      {
        corridor: 'Silk Board Junction & Hosur Road Flyover',
        historicalDemand: 'HIGH',
        peakPeriod: '8 AM – 11 AM & 6 PM – 9 PM',
        recommendedPositioning: 'Pre-deploy BLS rapid responder unit on elevated toll access ramp to bypass grade bottlenecks.',
        priorityLevel: 'HIGH',
        suggestedUnits: ['AMB-104']
      },
      {
        corridor: 'Outer Ring Road (Marathahalli - Bellandur)',
        historicalDemand: 'MODERATE',
        peakPeriod: '7 PM – 10 PM',
        recommendedPositioning: 'Maintain green-corridor liaison with HAL traffic division for fast transit to Manipal Hospital.',
        priorityLevel: 'MODERATE',
        suggestedUnits: ['AMB-125']
      }
    ];

    return res.json({
      success: true,
      simulationBadge: 'SIMULATED HISTORICAL DATA',
      hourlyDistribution: hourlyData.map(h => ({
        hourLabel: `${String(h.hour).padStart(2, '0')}:00`,
        hour: h.hour,
        incidentCount: h.incidentCount,
        severeCount: h.severeCount
      })),
      dayDistribution: dayData,
      severityDistribution: severityData,
      recommendations
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardData,
  getHotspots,
  getReadiness
};
