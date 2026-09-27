# RESQNET: AI-Powered Road Accident Response & Coordination Platform
### Track 2: Bharat Infra — Indian Arterial Corridor Emergency Response
> *“From accident detection to coordinated response — faster, smarter, safer.”*

---

## 1. Project Overview & Problem Statement
Road accidents in India account for over 150,000 fatalities annually, with many deaths occurring in the critical **"Golden Hour"** (the first 60 minutes following trauma). Existing emergency workflows suffer from fragmented communication:
- Witnesses call a general hotline with imprecise location and victim descriptions.
- Ambulances are dispatched blindly without real-time knowledge of incoming victim trauma severity.
- Emergency departments (EDs) are caught off-guard with zero advance preparation, leading to ambulance diversion at hospital gates.
- Transit routing relies on standard civilian GPS which fails to consider road blockages, emergency vehicle width, and secondary crash risk.

### The RESQNET Solution
**RESQNET** shifts the focus from simple detection to **end-to-end coordinated response**. Rather than isolated dashboards, RESQNET orchestrates dispatchers, ambulance responders, and trauma centers around a single live synchronized emergency brief: **RESQ HANDOFF**.

---

## 2. Signature Hero Feature: RESQ HANDOFF
**“One Live Emergency Brief — Zero Coordination Friction”**

When an incident is reported, RESQNET automatically generates and continuously updates a unified telemetry record accessible in real-time by:
1. **The Dispatched Ambulance**: Live GPS navigation, patient triage notes, and target hospital ER bed status.
2. **The Destination Hospital**: Advance victim condition, estimated arrival countdown, and trauma bay prep checklist.
3. **Command Operations Center**: System-wide telemetry, fleet availability, and corridor safety indices.

### Live Telemetry Elements
- Incident ID (`RSQ-2026-001`) & Verified Location (Mysore Road, Bengaluru)
- Casualty Count & Injury Indicators
- Transparent AI Priority Score (0–6+ point breakdown)
- Assigned Unit (AMB-102 Advanced Life Support) & Real-time ETA (7 min)
- Confirmed Hospital (City Emergency Hospital Level 1 Trauma) & ER Bed Capacity (8 ER / 4 ICU)
- Pre-Alert Status (`ALERT SENT ✓`)
- Navigation HUD (Route B selected over congested Route A due to lower risk)
- Instant QR Code Generation for physical triage handoff

---

## 3. Core Architecture & Data Flow

```
                                [ CITIZEN / WITNESS ]
                   (Text / Multilingual Voice / Scene Photo / GPS)
                                          │
                                          ▼
                            [ SMART REPORTING PORTAL ]
                                          │
                                          ▼
                ┌───────────────────────────────────────────────────┐
                │          PRIMARY NODE.JS ORCHESTRATOR             │
                │              (Express + Socket.IO)                │
                │                                                   │
                │  • AI Orchestrator (priorityEngine.js)           │
                │  • Transparent Priority Scoring (0-6+ points)    │
                │  • Fleet Dispatch & ALS/BLS Suitability Matcher   │
                │  • Trauma Intake & ER Bed Capacity Evaluator      │
                │  • Emergency Route Risk & Traffic Scorer          │
                │  • Optional Remote AI Bridge (FastAPI / Gemini)   │
                └─────────────────────────┬─────────────────────────┘
                                          │ Structured Telemetry & State
                                          ▼
                ┌───────────────────────────────────────────────────┐
                │      HERO FEATURE: RESQ HANDOFF (Live Brief)      │
                │               /handoff/:incidentId                │
                │             SQLite Database (node:sqlite)         │
                └─────────────────────────┬─────────────────────────┘
                                          │ Real-Time WebSockets (Socket.IO)
                ┌─────────────────────────┼─────────────────────────┐
                ▼                         ▼                         ▼
       [ RESQ HANDOFF UI ]      [ COMMAND CENTER ]     [ EMERGENCY READINESS ]
      (Ambulance & Hospital)   (Operations Center)     (Predictive Staging)
```

---

## 4. Key Platform Features

1. **Smart Accident Reporting**:
   - Multilingual interface supporting English, Hindi, and Kannada.
   - Text description with 1-click sample demo templates.
   - Speech dictation (Web Speech API with graceful simulated fallback).
   - Non-medical computer vision scene analyzer (identifies vehicle blockages, fire/smoke hazard, and crowd density).
   - Auto GPS corridor localization.

2. **AI Incident Intelligence & Transparent Priority**:
   - Extracts structured variables: type, casualties, injury markers, entrapment, and lane blockage.
   - Transparent scoring engine: Multiple victims (+2), Injuries (+3), Road Blockage (+1), Fire (+2), Extrication (+1).
   - Score mapping: 0–1 (LOW), 2–3 (MODERATE), 4–5 (HIGH), 6+ (CRITICAL).
   - Full JSON telemetry inspection.

3. **Smart Ambulance Matching**:
   - Multi-factor evaluation: Advanced (ALS) vs Basic (BLS), crew status, distance, and transit ETA.
   - Does not blindly pick the closest unit — recommends ALS for severe trauma.

4. **Intelligent Hospital Matching & Pre-Alert**:
   - Scans 8 regional trauma facilities in Bengaluru by live emergency beds, ICU capacity, and specialty trauma surgery.
   - Dispatches an automated **Hospital Pre-Alert** reserving trauma bays before ambulance arrival.

5. **Emergency Route Intelligence**:
   - Powered by Leaflet OpenStreetMap.
   - Compares **Route A** (Direct flyover, 6.8 km, 10 min, Heavy traffic, High risk) vs **Route B** (Outer Ring Road Service Corridor, 7.3 km, 12 min, Moderate traffic, Low risk).
   - Configurable route scoring prioritizes safe transit over pure distance.

6. **Operations Command Center (`/command-center`)**:
   - Professional dark command center HUD.
   - Real-time fleet metrics (Active Incidents, Available Ambulances, Ambulances En Route, Hospitals Available).
   - Interactive live map & active incident telemetry inspector.

7. **Predictive Emergency Readiness (`/emergency-readiness`)**:
   - Analyzes simulated historical accident records across key Bengaluru corridors.
   - Identifies peak evening crash clusters (6 PM – 9 PM on Mysore Road & Silk Board).
   - Generates proactive ambulance positioning recommendations.

8. **Automated & Step-by-Step Demo Mode**:
   - Real backend execution advancing through 10 deterministic steps from incident ingestion to live handoff.

---

## 5. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Leaflet (OpenStreetMap), Recharts, Socket.IO Client, Axios, QRCode, Canvas-Confetti.
- **Backend**: Node.js v24, Express.js, Socket.IO, `node:sqlite` (with PostgreSQL standard SQL schema compatibility), CORS, Dotenv.
- **AI Microservice**: Python 3.13, FastAPI, Uvicorn, Pydantic, Rule-based NLP + LLM prompt adapter.
- **Database**: Relational SQL (`database/schema.sql`, `database/seed.sql`) with dual engine compatibility (embedded SQLite for instant hackathon evaluation, PostgreSQL compatible).

---

## 6. Database Schema Summary

The database defines 8 normalized relational tables:
1. `users`: Dispatchers, paramedics, ER triage doctors.
2. `incidents`: Emergency incidents, severity, casualties, priority score, and assigned assets.
3. `ambulances`: 10 fleet units with ALS/BLS capability, live coordinates, and crew status.
4. `hospitals`: 8 Bengaluru trauma centers with ER beds, ICU capacity, and specialty surgery.
5. `routes`: Evaluated corridors with distance, ETA, traffic level, and secondary collision risk index.
6. `handoffs`: The live synchronized brief (`HND-RSQ-2026-001`).
7. `emergency_logs`: Immutable chronological telemetry audit log.
8. `accident_history`: 55 simulated historical corridor collision records for predictive readiness.

---

## 7. Installation & Quick Start

### Prerequisites
- Node.js v18+ (Node.js v24 recommended)
- Python 3.10+ (Optional for FastAPI microservice; Node backend operates internal fallback if python is not running)

### Step 1: Install Backend & Initialize Database
```bash
cd backend
npm install
node seed.js
node server.js
```
*Backend runs on `http://localhost:5000` with WebSocket telemetry.*

### Step 2: Install & Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### Step 3 (Optional): Start Python FastAPI AI Service
```bash
cd ../ai_service
pip install -r requirements.txt
python main.py
```
*FastAPI microservice runs on `http://localhost:8000`.*

---

## 8. Deterministic Hackathon Demo Flow (30 Seconds)

1. Open `http://localhost:5173` in your browser.
2. Notice the floating bottom control bar: **REAL-TIME HACKATHON DEMO ENGINE**.
3. Click **`[ START LIVE DEMO ]`**:
   - **0s**: Incident `RSQ-2026-001` created on Mysore Road.
   - **2s**: AI parses tokens (3 victims, road obstruction, injuries).
   - **4s**: Transparent priority assessed as **HIGH** (Score: 6/10).
   - **6s**: Fleet scanned; **AMB-102** (Advanced Life Support) recommended.
   - **8s**: AMB-102 assigned & dispatched.
   - **10s**: Trauma network scanned; **City Emergency Hospital** recommended.
   - **12s**: Hospital confirmed.
   - **16s**: **Route B** selected (lower risk corridor).
   - **18s**: **Hospital Pre-Alert Sent ✓** to ER triage.
   - **20s**: Ambulance **EN ROUTE**; **RESQ HANDOFF** synchronized live across all tabs!
4. Click **`[ OPEN LIVE RESQ HANDOFF ]`** or click **`GENERATE HANDOFF QR`** to scan from a mobile phone.

---

## 9. Safety & Ethical Disclosure
> **Disclaimer:** RESQNET is a hackathon prototype developed for Track 2 (Bharat Infra). It is designed strictly for emergency coordination and decision support. AI-generated priority assessments do not constitute medical diagnosis and do not replace trained triage physicians, emergency healthcare providers, or official emergency services (112 / 108). All historical collision datasets and hospital capacity figures are simulated for demonstration purposes.
# Resqnet
