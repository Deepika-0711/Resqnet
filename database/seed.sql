-- ==============================================================================
-- RESQNET Database Seed Data
-- Track 2: Bharat Infra (Bengaluru Corridor Simulated Demonstration Data)
-- ==============================================================================

-- 1. USERS / DISPATCHERS
INSERT INTO users (id, name, role, badge_id, station, created_at) VALUES
('USR-001', 'Commander R. Sharma', 'DISPATCHER', 'DSP-8821', 'Central Command Bengaluru', CURRENT_TIMESTAMP),
('USR-002', 'Paramedic S. Rao', 'PARAMEDIC', 'PRM-4019', 'Mysore Road Station 4', CURRENT_TIMESTAMP),
('USR-003', 'Dr. Ananya Sen', 'HOSPITAL_TRIAGE', 'DOC-1120', 'City Emergency Hospital', CURRENT_TIMESTAMP);

-- 2. 10 AMBULANCES (Bengaluru Key Locations & Capabilities)
INSERT INTO ambulances (id, name, vehicle_number, capability, status, base_location, lat, lng, driver_name, contact_number, created_at, updated_at) VALUES
('AMB-102', 'FastResponse ALS-102', 'KA-05-EA-1020', 'Advanced', 'AVAILABLE', 'Kengeri Satellite Station', 12.9285, 77.5020, 'Manoj Gowda', '+91-98765-43210', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AMB-108', 'QuickAid BLS-108', 'KA-01-GA-9081', 'Basic', 'AVAILABLE', 'Nayandahalli Depot', 12.9521, 77.5218, 'Suresh Patil', '+91-98765-43211', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AMB-115', 'MetroTrauma ALS-115', 'KA-04-EM-5512', 'Advanced', 'AVAILABLE', 'Vijayanagar Post', 12.9712, 77.5342, 'Arun Kumar', '+91-98765-43212', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AMB-120', 'CityCare BLS-120', 'KA-03-FA-4421', 'Basic', 'AVAILABLE', 'Rajajinagar Depot', 12.9902, 77.5532, 'Karthik N.', '+91-98765-43213', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AMB-104', 'TraumaCruiser ALS-104', 'KA-02-EA-8812', 'Advanced', 'AVAILABLE', 'Silk Board Hub', 12.9175, 77.6234, 'Pradeep R.', '+91-98765-43214', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AMB-111', 'ApexRescue BLS-111', 'KA-51-AB-3301', 'Basic', 'AVAILABLE', 'Electronic City Toll', 12.8452, 77.6602, 'Venkatesh B.', '+91-98765-43215', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AMB-125', 'CapitalLife ALS-125', 'KA-05-EM-7721', 'Advanced', 'AVAILABLE', 'Outer Ring Road Marathahalli', 12.9560, 77.7011, 'Rajesh Nair', '+91-98765-43216', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AMB-130', 'HebbalAid BLS-130', 'KA-50-ER-1290', 'Basic', 'AVAILABLE', 'Hebbal Flyover Depot', 13.0358, 77.5970, 'Dinesh Prasad', '+91-98765-43217', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AMB-132', 'CentralRapid ALS-132', 'KA-01-EA-4902', 'Advanced', 'AVAILABLE', 'Victoria Hospital Base', 12.9620, 77.5740, 'Santosh Hegde', '+91-98765-43218', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AMB-140', 'SouthLine BLS-140', 'KA-05-FA-6611', 'Basic', 'AVAILABLE', 'Jayanagar 4th Block', 12.9308, 77.5838, 'Mahesh K.', '+91-98765-43219', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. 8 HOSPITALS (Bengaluru Emergency & Trauma Centers)
INSERT INTO hospitals (id, name, address, lat, lng, capability, capacity_status, emergency_beds_total, emergency_beds_available, icu_beds_available, specialties, contact_phone, status, created_at, updated_at) VALUES
('HOSP-01', 'City Emergency Hospital', 'Mysore Road Extension, Bengaluru', 12.9610, 77.5412, 'Level 1 Trauma & Resuscitation', 'Available', 24, 8, 4, '["Trauma Surgery", "Orthopedics", "Neurotrauma", "Blood Bank 24x7"]', '+91-80-2670-0100', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HOSP-02', 'Metro Trauma Centre', 'Near Nayandahalli Ring Road, Bengaluru', 12.9515, 77.5280, 'Emergency & Orthopedic Care', 'Limited', 16, 2, 1, '["General Trauma", "Emergency Medicine"]', '+91-80-2670-0200', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HOSP-03', 'Victoria Trauma Care Centre', 'K.R. Market, Fort, Bengaluru', 12.9632, 77.5750, 'Apex Government Trauma Super-Specialty', 'Available', 40, 12, 6, '["Apex Trauma", "Burns Unit", "Neurosurgery", "Critical Care"]', '+91-80-2670-1111', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HOSP-04', 'Bowring & Lady Curzon Hospital', 'Shivajinagar, Bengaluru', 12.9822, 77.6045, 'Emergency Medicine & General Surgery', 'Available', 30, 9, 3, '["Emergency Surgery", "ICU", "Radiology CT/MRI"]', '+91-80-2559-1323', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HOSP-05', 'Manipal Hospital HAL Road', '98 HAL Old Airport Rd, Kodihalli, Bengaluru', 12.9592, 77.6492, 'Tertiary Quaternary Multi-Specialty', 'Limited', 35, 3, 2, '["Comprehensive Trauma", "Interventional Radiology", "Cardio-Thoracic"]', '+91-80-2502-4444', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HOSP-06', 'St. Johns Medical College Hospital', 'Sarjapur Main Rd, Koramangala, Bengaluru', 12.9315, 77.6210, 'Level 1 Trauma & Critical Care', 'Available', 36, 11, 5, '["Emergency Triage", "Polytrauma Unit", "Vascular Surgery"]', '+91-80-2206-5000', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HOSP-07', 'Fortis Hospital Bannerghatta', '154/9 Bannerghatta Rd, Opp IIMB, Bengaluru', 12.8942, 77.5991, 'Trauma & Emergency Care', 'Available', 20, 7, 3, '["Trauma Resuscitation", "Orthopedic Surgery"]', '+91-80-6621-4444', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HOSP-08', 'Aster CMI Hospital Hebbal', 'No. 43/42 NH 44, Bellary Rd, Hebbal, Bengaluru', 13.0562, 77.5910, 'Super-Specialty Acute Care', 'Full', 25, 0, 0, '["Level 1 Trauma", "Neurosurgery"]', '+91-80-4342-0100', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. DEMO INCIDENT: RSQ-2026-001 (Mysore Road Emergency Scenario)
INSERT INTO incidents (
    id, raw_text, incident_type, location, lat, lng,
    people_count, injury_indicators, road_obstruction, fire_smoke,
    access_difficulty, priority, priority_score, priority_reasoning,
    assigned_ambulance_id, selected_hospital_id, selected_route_id,
    hospital_prealert_status, status, created_at, updated_at
) VALUES (
    'RSQ-2026-001',
    'There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.',
    'Road Accident',
    'Mysore Road, Bengaluru',
    12.9482,
    77.5358,
    3,
    '["Multiple reported injuries", "Possible blunt trauma"]',
    1,
    0,
    0,
    'HIGH',
    6,
    '["Multiple people involved (+2)", "Reported injuries (+3)", "Road obstruction detected (+1)"]',
    NULL,
    NULL,
    NULL,
    'NOT_SENT',
    'REPORTED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Initial audit log for demo incident
INSERT INTO emergency_logs (incident_id, event_type, timestamp, time_display, description, actor, metadata) VALUES
('RSQ-2026-001', 'REPORTED', CURRENT_TIMESTAMP, '10:32', 'Emergency reported: Road accident on Mysore Road with 3 reported injuries and road obstruction.', 'WITNESS_DISPATCH', '{"raw_text": "There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road."}');

-- 5. ACCIDENT HISTORY (SIMULATED DATASET FOR PREDICTIVE READINESS)
INSERT INTO accident_history (incident_id, corridor, location, lat, lng, time_of_day, hour_of_day, day_of_week, weather, severity, response_time_min, vehicles_involved, injuries_count, road_type, risk_index) VALUES
('HIST-2025-001', 'Mysore Road (Kengeri - Satellite Bus Stand)', 'Mysore Road Km 1.3', 12.9482, 77.5358, '18:14', 18, 'Tuesday', 'Clear', 'CRITICAL', 9, 2, 4, 'Expressway / Arterial Road', 0.88),
('HIST-2025-002', 'Silk Board Junction & Hosur Road Flyover', 'Silk Board Km 2.6', 12.9175, 77.6234, '08:42', 8, 'Wednesday', 'Clear / Dry Road', 'HIGH', 14, 3, 3, 'Expressway / Arterial Road', 0.76),
('HIST-2025-003', 'Outer Ring Road (Marathahalli - Bellandur)', 'ORR Marathahalli Km 3.9', 12.9350, 77.6890, '19:21', 19, 'Thursday', 'Rain / Wet Asphalt', 'CRITICAL', 18, 2, 4, 'Expressway / Arterial Road', 0.92),
('HIST-2025-004', 'Hebbal Flyover - Bellary Road Highway', 'Hebbal Flyover Km 5.2', 13.0358, 77.5970, '20:30', 20, 'Friday', 'Clear', 'HIGH', 11, 2, 2, 'Expressway / Arterial Road', 0.64),
('HIST-2025-005', 'Electronic City Elevated Tollway', 'Electronic City Km 6.5', 12.8452, 77.6602, '09:15', 9, 'Monday', 'Clear', 'HIGH', 13, 1, 1, 'Expressway / Arterial Road', 0.52),
('HIST-2025-006', 'Bannerghatta Road Corridor', 'Bannerghatta Road Km 7.8', 12.8942, 77.5991, '21:05', 21, 'Saturday', 'Evening Drizzle', 'CRITICAL', 16, 2, 3, 'Expressway / Arterial Road', 0.85),
('HIST-2025-007', 'Mysore Road (Kengeri - Satellite Bus Stand)', 'Mysore Road Km 9.1', 12.9520, 77.5400, '19:45', 19, 'Friday', 'Clear', 'CRITICAL', 10, 3, 5, 'Expressway / Arterial Road', 0.95),
('HIST-2025-008', 'Silk Board Junction & Hosur Road Flyover', 'Hosur Road Km 10.4', 12.9200, 77.6250, '18:50', 18, 'Wednesday', 'Clear', 'HIGH', 15, 2, 2, 'Expressway / Arterial Road', 0.70),
('HIST-2025-009', 'Old Madras Road (KR Puram Hanging Bridge)', 'KR Puram Bridge Km 11.7', 13.0012, 77.6950, '20:10', 20, 'Monday', 'Rain / Wet Asphalt', 'HIGH', 17, 2, 2, 'Expressway / Arterial Road', 0.79),
('HIST-2025-010', 'Tumkur Road - Peenya Elevated Highway', 'Peenya Toll Km 13.0', 13.0280, 77.5180, '22:15', 22, 'Tuesday', 'Clear', 'MODERATE', 12, 1, 1, 'Expressway / Arterial Road', 0.52);
