@echo off
TITLE RESQNET Orchestrator
echo ===================================================
echo 🚑 STARTING RESQNET PLATFORM (TRACK 2: BHARAT INFRA)
echo ===================================================

echo [1/3] Starting AI Microservice (FastAPI on Port 8000)...
start "RESQNET AI Microservice (Port 8000)" cmd /k "cd ai_service && python main.py"

timeout /t 2 > nul

echo [2/3] Starting Backend Server (Express + SQLite on Port 5000)...
start "RESQNET Backend Server (Port 5000)" cmd /k "cd backend && node server.js"

timeout /t 2 > nul

echo [3/3] Starting Frontend Dev Server (Vite on Port 5173)...
start "RESQNET Frontend UI (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo ✓ All services initiated!
echo 🌐 Frontend UI:  http://localhost:5173
echo 🏥 Backend API:  http://localhost:5000
echo 🧠 AI Service:   http://localhost:8000/docs
echo ===================================================
timeout /t 3 > nul
start http://localhost:5173
