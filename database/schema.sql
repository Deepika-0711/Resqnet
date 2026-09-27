-- ==============================================================================
-- RESQNET Database Schema (PostgreSQL & SQLite Dual-Compatible)
-- Track 2: Bharat Infra Emergency Response & Coordination Platform
-- ==============================================================================

-- 1. USERS / DISPATCHERS / RESPONDERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL, -- DISPATCHER, PARAMEDIC, HOSPITAL_TRIAGE, ADMIN
    badge_id VARCHAR(64),
    station VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. EMERGENCY INCIDENTS
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY, -- e.g., RSQ-2026-001
    raw_text TEXT NOT NULL,
    incident_type VARCHAR(128) DEFAULT 'Road Accident',
    location VARCHAR(255) NOT NULL,
    lat REAL,
    lng REAL,
    people_count INTEGER DEFAULT 1,
    injury_indicators TEXT DEFAULT '[]', -- JSON array of strings
    road_obstruction INTEGER DEFAULT 0,  -- 0: No, 1: Yes
    fire_smoke INTEGER DEFAULT 0,        -- 0: No, 1: Yes
    access_difficulty INTEGER DEFAULT 0, -- 0: No, 1: Yes
    priority VARCHAR(32) DEFAULT 'HIGH', -- CRITICAL, HIGH, MODERATE, LOW
    priority_score INTEGER DEFAULT 4,
    priority_reasoning TEXT DEFAULT '[]', -- JSON array of points
    assigned_ambulance_id VARCHAR(64),
    selected_hospital_id VARCHAR(64),
    selected_route_id VARCHAR(64),
    hospital_prealert_status VARCHAR(32) DEFAULT 'NOT_SENT', -- NOT_SENT, SENT, ACKNOWLEDGED
    status VARCHAR(64) DEFAULT 'REPORTED', -- REPORTED, ANALYZING, ASSESSED, AMBULANCE_SEARCH, AMBULANCE_ASSIGNED, HOSPITAL_SELECTED, ROUTE_SELECTED, HOSPITAL_ALERTED, AMBULANCE_EN_ROUTE, ON_SCENE, RESOLVED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. AMBULANCES (ALS / BLS Fleet)
CREATE TABLE IF NOT EXISTS ambulances (
    id VARCHAR(64) PRIMARY KEY, -- e.g. AMB-102
    name VARCHAR(255) NOT NULL,
    vehicle_number VARCHAR(64) NOT NULL,
    capability VARCHAR(64) NOT NULL, -- Advanced (ALS), Basic (BLS)
    status VARCHAR(32) DEFAULT 'AVAILABLE', -- AVAILABLE, ASSIGNED, EN_ROUTE, ON_SCENE, BUSY
    base_location VARCHAR(255) NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    driver_name VARCHAR(128),
    contact_number VARCHAR(64),
    current_incident_id VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. HOSPITALS (Emergency & Trauma Centers)
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(64) PRIMARY KEY, -- e.g. HOSP-01
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    capability VARCHAR(255) NOT NULL, -- Level 1 Trauma, Tertiary, etc.
    capacity_status VARCHAR(64) DEFAULT 'Available', -- Available, Limited, Full
    emergency_beds_total INTEGER NOT NULL,
    emergency_beds_available INTEGER NOT NULL,
    icu_beds_available INTEGER NOT NULL,
    specialties TEXT DEFAULT '[]', -- JSON array of specialties
    contact_phone VARCHAR(64),
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. EMERGENCY NAVIGATION ROUTES
CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(64) PRIMARY KEY, -- e.g. RT-RSQ-2026-001-A
    incident_id VARCHAR(64) NOT NULL,
    route_name VARCHAR(128) NOT NULL,
    description TEXT,
    distance_km REAL NOT NULL,
    eta_min INTEGER NOT NULL,
    traffic_level VARCHAR(64) NOT NULL, -- Low, Moderate, Heavy
    risk_level VARCHAR(64) NOT NULL,    -- Low reported risk, Moderate, High
    road_conditions VARCHAR(255),
    score REAL NOT NULL,
    is_recommended INTEGER DEFAULT 0,
    is_selected INTEGER DEFAULT 0,
    waypoints TEXT DEFAULT '[]', -- JSON array of [lat, lng]
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. HERO FEATURE: RESQ HANDOFF ("One Live Emergency Brief")
CREATE TABLE IF NOT EXISTS handoffs (
    id VARCHAR(64) PRIMARY KEY, -- e.g. HDF-RSQ-2026-001
    incident_id VARCHAR(64) UNIQUE NOT NULL,
    ambulance_id VARCHAR(64),
    hospital_id VARCHAR(64),
    route_id VARCHAR(64),
    priority VARCHAR(32) NOT NULL,
    summary TEXT,
    people_involved INTEGER DEFAULT 1,
    injury_indicators TEXT DEFAULT '[]',
    road_obstruction INTEGER DEFAULT 0,
    ambulance_eta_min INTEGER,
    hospital_eta_min INTEGER,
    hospital_prealert_status VARCHAR(32) DEFAULT 'NOT_SENT',
    ai_reasoning TEXT DEFAULT '[]',
    hospital_preparation TEXT DEFAULT '[]',
    status VARCHAR(64) DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. AUDIT & TELEMETRY TIMELINE LOGS
CREATE TABLE IF NOT EXISTS emergency_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_display VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    actor VARCHAR(64) DEFAULT 'SYSTEM',
    metadata TEXT DEFAULT '{}'
);

-- 8. HISTORICAL ACCIDENT & READINESS RECORDS (SIMULATED DATA)
CREATE TABLE IF NOT EXISTS accident_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id VARCHAR(64),
    corridor VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    time_of_day VARCHAR(32) NOT NULL,
    hour_of_day INTEGER NOT NULL,
    day_of_week VARCHAR(32) NOT NULL,
    weather VARCHAR(64) DEFAULT 'Clear',
    severity VARCHAR(32) NOT NULL, -- CRITICAL, HIGH, MODERATE, LOW
    response_time_min INTEGER NOT NULL,
    vehicles_involved INTEGER DEFAULT 1,
    injuries_count INTEGER DEFAULT 0,
    road_type VARCHAR(128) DEFAULT 'Expressway / Arterial Road',
    risk_index REAL DEFAULT 0.5
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_ambulances_status ON ambulances(status);
CREATE INDEX IF NOT EXISTS idx_hospitals_capacity ON hospitals(capacity_status);
CREATE INDEX IF NOT EXISTS idx_logs_incident ON emergency_logs(incident_id);
CREATE INDEX IF NOT EXISTS idx_accident_corridor ON accident_history(corridor);
CREATE INDEX IF NOT EXISTS idx_accident_hour ON accident_history(hour_of_day);
