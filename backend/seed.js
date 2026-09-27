const db = require('./config/db');

function seedDatabase() {
  console.log('[RESQNET] Initializing database schema...');
  db.initSchema();

  console.log('[RESQNET] Seeding realistic data...');

  // 1. Clear existing seed data if needed
  db.run('DELETE FROM users');
  db.run('DELETE FROM ambulances');
  db.run('DELETE FROM hospitals');
  db.run('DELETE FROM routes');
  db.run('DELETE FROM handoffs');
  db.run('DELETE FROM emergency_logs');
  db.run('DELETE FROM accident_history');
  db.run('DELETE FROM incidents');

  const now = new Date().toISOString();

  // 2. Seed Users / Dispatchers
  const users = [
    { id: 'USR-001', name: 'Commander R. Sharma', role: 'DISPATCHER', badge_id: 'DSP-8821', station: 'Central Command Bengaluru', created_at: now },
    { id: 'USR-002', name: 'Paramedic S. Rao', role: 'PARAMEDIC', badge_id: 'PRM-4019', station: 'Mysore Road Station 4', created_at: now },
    { id: 'USR-003', name: 'Dr. Ananya Sen', role: 'HOSPITAL_TRIAGE', badge_id: 'DOC-1120', station: 'City Emergency Hospital', created_at: now }
  ];
  users.forEach(u => {
    db.run(
      'INSERT INTO users (id, name, role, badge_id, station, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [u.id, u.name, u.role, u.badge_id, u.station, u.created_at]
    );
  });

  // 3. Seed 10 Ambulances (realistic Bengaluru deployment)
  const ambulances = [
    { id: 'AMB-102', name: 'FastResponse ALS-102', vehicle_number: 'KA-05-EA-1020', capability: 'Advanced', status: 'AVAILABLE', base_location: 'Kengeri Satellite Station', lat: 12.9285, lng: 77.5020, driver_name: 'Manoj Gowda', contact_number: '+91-98765-43210' },
    { id: 'AMB-108', name: 'QuickAid BLS-108', vehicle_number: 'KA-01-GA-9081', capability: 'Basic', status: 'AVAILABLE', base_location: 'Nayandahalli Depot', lat: 12.9521, lng: 77.5218, driver_name: 'Suresh Patil', contact_number: '+91-98765-43211' },
    { id: 'AMB-115', name: 'MetroTrauma ALS-115', vehicle_number: 'KA-04-EM-5512', capability: 'Advanced', status: 'AVAILABLE', base_location: 'Vijayanagar Post', lat: 12.9712, lng: 77.5342, driver_name: 'Arun Kumar', contact_number: '+91-98765-43212' },
    { id: 'AMB-120', name: 'CityCare BLS-120', vehicle_number: 'KA-03-FA-4421', capability: 'Basic', status: 'AVAILABLE', base_location: 'Rajajinagar Depot', lat: 12.9902, lng: 77.5532, driver_name: 'Karthik N.', contact_number: '+91-98765-43213' },
    { id: 'AMB-104', name: 'TraumaCruiser ALS-104', vehicle_number: 'KA-02-EA-8812', capability: 'Advanced', status: 'AVAILABLE', base_location: 'Silk Board Hub', lat: 12.9175, lng: 77.6234, driver_name: 'Pradeep R.', contact_number: '+91-98765-43214' },
    { id: 'AMB-111', name: 'ApexRescue BLS-111', vehicle_number: 'KA-51-AB-3301', capability: 'Basic', status: 'AVAILABLE', base_location: 'Electronic City Toll', lat: 12.8452, lng: 77.6602, driver_name: 'Venkatesh B.', contact_number: '+91-98765-43215' },
    { id: 'AMB-125', name: 'CapitalLife ALS-125', vehicle_number: 'KA-05-EM-7721', capability: 'Advanced', status: 'AVAILABLE', base_location: 'Outer Ring Road Marathahalli', lat: 12.9560, lng: 77.7011, driver_name: 'Rajesh Nair', contact_number: '+91-98765-43216' },
    { id: 'AMB-130', name: 'HebbalAid BLS-130', vehicle_number: 'KA-50-ER-1290', capability: 'Basic', status: 'AVAILABLE', base_location: 'Hebbal Flyover Depot', lat: 13.0358, lng: 77.5970, driver_name: 'Dinesh Prasad', contact_number: '+91-98765-43217' },
    { id: 'AMB-132', name: 'CentralRapid ALS-132', vehicle_number: 'KA-01-EA-4902', capability: 'Advanced', status: 'AVAILABLE', base_location: 'Victoria Hospital Base', lat: 12.9620, lng: 77.5740, driver_name: 'Santosh Hegde', contact_number: '+91-98765-43218' },
    { id: 'AMB-140', name: 'SouthLine BLS-140', vehicle_number: 'KA-05-FA-6611', capability: 'Basic', status: 'AVAILABLE', base_location: 'Jayanagar 4th Block', lat: 12.9308, lng: 77.5838, driver_name: 'Mahesh K.', contact_number: '+91-98765-43219' }
  ];

  ambulances.forEach(a => {
    db.run(`
      INSERT INTO ambulances (id, name, vehicle_number, capability, status, base_location, lat, lng, driver_name, contact_number, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [a.id, a.name, a.vehicle_number, a.capability, a.status, a.base_location, a.lat, a.lng, a.driver_name, a.contact_number, now, now]);
  });

  // 4. Seed 8 Hospitals
  const hospitals = [
    {
      id: 'HOSP-01',
      name: 'City Emergency Hospital',
      address: 'Mysore Road Extension, Bengaluru',
      lat: 12.9610,
      lng: 77.5412,
      capability: 'Level 1 Trauma & Resuscitation',
      capacity_status: 'Available',
      emergency_beds_total: 24,
      emergency_beds_available: 8,
      icu_beds_available: 4,
      specialties: JSON.stringify(['Trauma Surgery', 'Orthopedics', 'Neurotrauma', 'Blood Bank 24x7']),
      contact_phone: '+91-80-2670-0100'
    },
    {
      id: 'HOSP-02',
      name: 'Metro Trauma Centre',
      address: 'Near Nayandahalli Ring Road, Bengaluru',
      lat: 12.9515,
      lng: 77.5280,
      capability: 'Emergency & Orthopedic Care',
      capacity_status: 'Limited',
      emergency_beds_total: 16,
      emergency_beds_available: 2,
      icu_beds_available: 1,
      specialties: JSON.stringify(['General Trauma', 'Emergency Medicine']),
      contact_phone: '+91-80-2670-0200'
    },
    {
      id: 'HOSP-03',
      name: 'Victoria Trauma Care Centre',
      address: 'K.R. Market, Fort, Bengaluru',
      lat: 12.9632,
      lng: 77.5750,
      capability: 'Apex Government Trauma Super-Specialty',
      capacity_status: 'Available',
      emergency_beds_total: 40,
      emergency_beds_available: 12,
      icu_beds_available: 6,
      specialties: JSON.stringify(['Apex Trauma', 'Burns Unit', 'Neurosurgery', 'Critical Care']),
      contact_phone: '+91-80-2670-1111'
    },
    {
      id: 'HOSP-04',
      name: 'Bowring & Lady Curzon Hospital',
      address: 'Shivajinagar, Bengaluru',
      lat: 12.9822,
      lng: 77.6045,
      capability: 'Emergency Medicine & General Surgery',
      capacity_status: 'Available',
      emergency_beds_total: 30,
      emergency_beds_available: 9,
      icu_beds_available: 3,
      specialties: JSON.stringify(['Emergency Surgery', 'ICU', 'Radiology CT/MRI']),
      contact_phone: '+91-80-2559-1323'
    },
    {
      id: 'HOSP-05',
      name: 'Manipal Hospital HAL Road',
      address: '98 HAL Old Airport Rd, Kodihalli, Bengaluru',
      lat: 12.9592,
      lng: 77.6492,
      capability: 'Tertiary Quaternary Multi-Specialty',
      capacity_status: 'Limited',
      emergency_beds_total: 35,
      emergency_beds_available: 3,
      icu_beds_available: 2,
      specialties: JSON.stringify(['Comprehensive Trauma', 'Interventional Radiology', 'Cardio-Thoracic']),
      contact_phone: '+91-80-2502-4444'
    },
    {
      id: 'HOSP-06',
      name: "St. John's Medical College Hospital",
      address: 'Sarjapur Main Rd, Koramangala, Bengaluru',
      lat: 12.9315,
      lng: 77.6210,
      capability: 'Level 1 Trauma & Critical Care',
      capacity_status: 'Available',
      emergency_beds_total: 36,
      emergency_beds_available: 11,
      icu_beds_available: 5,
      specialties: JSON.stringify(['Emergency Triage', 'Polytrauma Unit', 'Vascular Surgery']),
      contact_phone: '+91-80-2206-5000'
    },
    {
      id: 'HOSP-07',
      name: 'Fortis Hospital Bannerghatta',
      address: '154/9 Bannerghatta Rd, Opp IIMB, Bengaluru',
      lat: 12.8942,
      lng: 77.5991,
      capability: 'Trauma & Emergency Care',
      capacity_status: 'Available',
      emergency_beds_total: 20,
      emergency_beds_available: 7,
      icu_beds_available: 3,
      specialties: JSON.stringify(['Trauma Resuscitation', 'Orthopedic Surgery']),
      contact_phone: '+91-80-6621-4444'
    },
    {
      id: 'HOSP-08',
      name: 'Aster CMI Hospital Hebbal',
      address: 'No. 43/42 NH 44, Bellary Rd, Hebbal, Bengaluru',
      lat: 13.0562,
      lng: 77.5910,
      capability: 'Super-Specialty Acute Care',
      capacity_status: 'Full',
      emergency_beds_total: 25,
      emergency_beds_available: 0,
      icu_beds_available: 0,
      specialties: JSON.stringify(['Level 1 Trauma', 'Neurosurgery']),
      contact_phone: '+91-80-4342-0100'
    }
  ];

  hospitals.forEach(h => {
    db.run(`
      INSERT INTO hospitals (id, name, address, lat, lng, capability, capacity_status, emergency_beds_total, emergency_beds_available, icu_beds_available, specialties, contact_phone, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
    `, [h.id, h.name, h.address, h.lat, h.lng, h.capability, h.capacity_status, h.emergency_beds_total, h.emergency_beds_available, h.icu_beds_available, h.specialties, h.contact_phone, now, now]);
  });

  // 5. Seed 55 Historical Accident Records across Bengaluru key corridors (SIMULATED DATA)
  const corridors = [
    { name: 'Mysore Road (Kengeri - Satellite Bus Stand)', lat: 12.9482, lng: 77.5358 },
    { name: 'Silk Board Junction & Hosur Road Flyover', lat: 12.9175, lng: 77.6234 },
    { name: 'Outer Ring Road (Marathahalli - Bellandur)', lat: 12.9350, lng: 77.6890 },
    { name: 'Hebbal Flyover - Bellary Road Highway', lat: 13.0358, lng: 77.5970 },
    { name: 'Electronic City Elevated Tollway', lat: 12.8452, lng: 77.6602 },
    { name: 'Bannerghatta Road Corridor', lat: 12.8942, lng: 77.5991 },
    { name: 'Old Madras Road (KR Puram Hanging Bridge)', lat: 13.0012, lng: 77.6950 },
    { name: 'Tumkur Road - Peenya Elevated Highway', lat: 13.0280, lng: 77.5180 }
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weathers = ['Clear', 'Rain / Wet Asphalt', 'Evening Drizzle', 'Clear / Dry Road'];
  const severities = ['HIGH', 'CRITICAL', 'MODERATE', 'LOW'];

  for (let i = 1; i <= 55; i++) {
    const corridor = corridors[i % corridors.length];
    // Peak hours clustered around 18-21 (6 PM - 9 PM) or 8-10 AM
    let hour;
    if (i % 3 === 0) {
      hour = 18 + (i % 4); // 18, 19, 20, 21
    } else if (i % 3 === 1) {
      hour = 8 + (i % 3); // 8, 9, 10
    } else {
      hour = (11 + i * 2) % 24;
    }
    const timeOfDay = `${String(hour).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`;
    const day = days[i % days.length];
    const weather = weathers[i % weathers.length];
    const severity = (hour >= 18 && hour <= 21) ? (i % 2 === 0 ? 'HIGH' : 'CRITICAL') : severities[i % severities.length];
    const vehicles = (i % 3) + 1;
    const injuries = severity === 'CRITICAL' ? (vehicles + 2) : (severity === 'HIGH' ? vehicles : 1);
    const responseTime = Math.floor(8 + (i % 12));
    const riskIndex = Number((0.4 + (injuries * 0.12) + (weather.includes('Rain') ? 0.15 : 0)).toFixed(2));

    db.run(`
      INSERT INTO accident_history (incident_id, corridor, location, lat, lng, time_of_day, hour_of_day, day_of_week, weather, severity, response_time_min, vehicles_involved, injuries_count, road_type, risk_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `HIST-2025-${String(i).padStart(3, '0')}`,
      corridor.name,
      `${corridor.name} Km ${(i * 1.3).toFixed(1)}`,
      corridor.lat + ((i % 5 - 2) * 0.004),
      corridor.lng + ((i % 5 - 2) * 0.004),
      timeOfDay,
      hour,
      day,
      weather,
      severity,
      responseTime,
      vehicles,
      injuries,
      'Expressway / Arterial Road',
      riskIndex
    ]);
  }

  // 6. Pre-seed standard Demo Incident: RSQ-2026-001 (Mysore Road)
  const demoIncidentId = 'RSQ-2026-001';
  db.run(`
    INSERT INTO incidents (
      id, raw_text, incident_type, location, lat, lng,
      people_count, injury_indicators, road_obstruction, fire_smoke,
      access_difficulty, priority, priority_score, priority_reasoning,
      assigned_ambulance_id, selected_hospital_id, selected_route_id,
      hospital_prealert_status, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    demoIncidentId,
    'There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.',
    'Road Accident',
    'Mysore Road, Bengaluru',
    12.9482,
    77.5358,
    3,
    JSON.stringify(['Multiple reported injuries', 'Possible blunt trauma']),
    1,
    0,
    0,
    'HIGH',
    6,
    JSON.stringify([
      'Multiple people involved (+2)',
      'Reported injuries (+3)',
      'Road obstruction detected (+1)'
    ]),
    null,
    null,
    null,
    'NOT_SENT',
    'REPORTED',
    now,
    now
  ]);

  // Initial timeline log
  db.run(`
    INSERT INTO emergency_logs (incident_id, event_type, timestamp, time_display, description, actor, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    demoIncidentId,
    'REPORTED',
    now,
    new Date(now).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    'Emergency reported: Road accident on Mysore Road with 3 reported injuries and road obstruction.',
    'WITNESS_DISPATCH',
    JSON.stringify({ raw_text: 'There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.' })
  ]);

  console.log('[RESQNET] Seed completed successfully!');
  console.log(`[RESQNET] Seeded: ${ambulances.length} ambulances, ${hospitals.length} hospitals, 55 historical records, 1 demo incident.`);
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
