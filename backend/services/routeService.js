const db = require('../config/db');

// Sample coordinates along Mysore Road -> City Emergency Hospital
const WAYPOINTS_ROUTE_A = [
  [12.9482, 77.5358], // Accident site (Mysore Road)
  [12.9510, 77.5380], // Congested Junction
  [12.9540, 77.5395], // Choked Underpass
  [12.9580, 77.5405], // Heavy signal
  [12.9610, 77.5412]  // City Emergency Hospital
];

const WAYPOINTS_ROUTE_B = [
  [12.9482, 77.5358], // Accident site
  [12.9460, 77.5385], // Bypass Arterial Road
  [12.9490, 77.5440], // Wide Service Lane
  [12.9555, 77.5450], // Low-traffic corridor
  [12.9610, 77.5412]  // City Emergency Hospital
];

function calculateRoutes(incidentId) {
  // Check if routes already generated in database for this incident
  const existingRoutes = db.all('SELECT * FROM routes WHERE incident_id = ? ORDER BY route_name ASC', [incidentId]);
  if (existingRoutes && existingRoutes.length > 0) {
    return existingRoutes.map(r => ({
      ...r,
      waypoints: JSON.parse(r.waypoints || '[]'),
      is_recommended: Boolean(r.is_recommended),
      is_selected: Boolean(r.is_selected)
    }));
  }

  // Create Route A and Route B
  const routeAId = `RT-${incidentId}-A`;
  const routeBId = `RT-${incidentId}-B`;
  const now = new Date().toISOString();

  // Route A: 6.8 km, 10 min, Heavy traffic, High risk. Score = 68 (penalized for risk & traffic)
  db.run(`
    INSERT OR REPLACE INTO routes (id, incident_id, route_name, description, distance_km, eta_min, traffic_level, risk_level, road_conditions, score, is_recommended, is_selected, waypoints, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    routeAId,
    incidentId,
    'Route A',
    'Direct Arterial Highway via Mysore Road Flyover',
    6.8,
    10,
    'Heavy',
    'High',
    'Severe corridor congestion; single-lane blockage reported near toll.',
    42.5,
    0,
    0,
    JSON.stringify(WAYPOINTS_ROUTE_A),
    now
  ]);

  // Route B: 7.3 km, 12 min, Moderate traffic, Low risk. Score = 88 (Recommended!)
  db.run(`
    INSERT OR REPLACE INTO routes (id, incident_id, route_name, description, distance_km, eta_min, traffic_level, risk_level, road_conditions, score, is_recommended, is_selected, waypoints, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    routeBId,
    incidentId,
    'Route B',
    'Outer Ring Road Service Corridor & West Arterial Bypass',
    7.3,
    12,
    'Moderate',
    'Low',
    'Smooth transit corridors, active emergency green corridor support enabled.',
    88.0,
    1,
    0,
    JSON.stringify(WAYPOINTS_ROUTE_B),
    now
  ]);

  return [
    {
      id: routeAId,
      incident_id: incidentId,
      route_name: 'Route A',
      description: 'Direct Arterial Highway via Mysore Road Flyover',
      distance_km: 6.8,
      eta_min: 10,
      traffic_level: 'Heavy',
      risk_level: 'High',
      road_conditions: 'Severe corridor congestion; single-lane blockage reported near toll.',
      score: 42.5,
      is_recommended: false,
      is_selected: false,
      waypoints: WAYPOINTS_ROUTE_A,
      explanation: 'Shortest distance, but heavy congestion and high secondary accident risk make transport unpredictable.'
    },
    {
      id: routeBId,
      incident_id: incidentId,
      route_name: 'Route B',
      description: 'Outer Ring Road Service Corridor & West Arterial Bypass',
      distance_km: 7.3,
      eta_min: 12,
      traffic_level: 'Moderate',
      risk_level: 'Low',
      score: 88.0,
      is_recommended: true,
      is_selected: false,
      waypoints: WAYPOINTS_ROUTE_B,
      explanation: 'Route B is recommended because it has lower reported traffic and lower route risk despite being slightly longer.'
    }
  ];
}

module.exports = {
  calculateRoutes,
  WAYPOINTS_ROUTE_A,
  WAYPOINTS_ROUTE_B
};
