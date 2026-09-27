const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'database.sqlite');
const dbDir = path.dirname(path.resolve(dbPath));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(path.resolve(dbPath));

// Enable foreign keys and WAL mode for reliability
db.exec('PRAGMA foreign_keys = ON;');

// Create tables if not exist
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      badge_id TEXT,
      station TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      raw_text TEXT NOT NULL,
      incident_type TEXT DEFAULT 'Road Accident',
      location TEXT NOT NULL,
      lat REAL,
      lng REAL,
      people_count INTEGER DEFAULT 1,
      injury_indicators TEXT DEFAULT '[]',
      road_obstruction INTEGER DEFAULT 0,
      fire_smoke INTEGER DEFAULT 0,
      access_difficulty INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'HIGH',
      priority_score INTEGER DEFAULT 4,
      priority_reasoning TEXT DEFAULT '[]',
      assigned_ambulance_id TEXT,
      selected_hospital_id TEXT,
      selected_route_id TEXT,
      hospital_prealert_status TEXT DEFAULT 'NOT_SENT',
      status TEXT DEFAULT 'REPORTED',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ambulances (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      vehicle_number TEXT NOT NULL,
      capability TEXT NOT NULL,
      status TEXT DEFAULT 'AVAILABLE',
      base_location TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      driver_name TEXT,
      contact_number TEXT,
      current_incident_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hospitals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      capability TEXT NOT NULL,
      capacity_status TEXT DEFAULT 'Available',
      emergency_beds_total INTEGER NOT NULL,
      emergency_beds_available INTEGER NOT NULL,
      icu_beds_available INTEGER NOT NULL,
      specialties TEXT DEFAULT '[]',
      contact_phone TEXT,
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL,
      route_name TEXT NOT NULL,
      description TEXT,
      distance_km REAL NOT NULL,
      eta_min INTEGER NOT NULL,
      traffic_level TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      road_conditions TEXT,
      score REAL NOT NULL,
      is_recommended INTEGER DEFAULT 0,
      is_selected INTEGER DEFAULT 0,
      waypoints TEXT DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS handoffs (
      id TEXT PRIMARY KEY,
      incident_id TEXT UNIQUE NOT NULL,
      ambulance_id TEXT,
      hospital_id TEXT,
      route_id TEXT,
      priority TEXT NOT NULL,
      summary TEXT,
      people_involved INTEGER DEFAULT 1,
      injury_indicators TEXT DEFAULT '[]',
      road_obstruction INTEGER DEFAULT 0,
      ambulance_eta_min INTEGER,
      hospital_eta_min INTEGER,
      hospital_prealert_status TEXT DEFAULT 'NOT_SENT',
      ai_reasoning TEXT DEFAULT '[]',
      hospital_preparation TEXT DEFAULT '[]',
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS emergency_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      time_display TEXT NOT NULL,
      description TEXT NOT NULL,
      actor TEXT DEFAULT 'SYSTEM',
      metadata TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS accident_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id TEXT,
      corridor TEXT NOT NULL,
      location TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      time_of_day TEXT NOT NULL,
      hour_of_day INTEGER NOT NULL,
      day_of_week TEXT NOT NULL,
      weather TEXT DEFAULT 'Clear',
      severity TEXT NOT NULL,
      response_time_min INTEGER NOT NULL,
      vehicles_involved INTEGER DEFAULT 1,
      injuries_count INTEGER DEFAULT 0,
      road_type TEXT DEFAULT 'Arterial Corridor',
      risk_index REAL DEFAULT 0.5
    );
  `);
}

// Database wrapper utilities
const dbWrapper = {
  db,
  initSchema,
  all(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },
  get(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  },
  run(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  },
  exec(sql) {
    return db.exec(sql);
  }
};

module.exports = dbWrapper;
