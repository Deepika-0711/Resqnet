Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "🚑 STARTING RESQNET PLATFORM (TRACK 2: BHARAT INFRA)" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Starting AI Microservice (FastAPI on Port 8000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd ai_service && python main.py" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "[2/3] Starting Backend Server (Express + SQLite on Port 5000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd backend && node server.js" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "[3/3] Starting Frontend Dev Server (Vite on Port 5173)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd frontend && npm run dev" -WindowStyle Normal

Write-Host "`n===================================================" -ForegroundColor Cyan
Write-Host "✓ All RESQNET services are online!" -ForegroundColor Green
Write-Host "🌐 Frontend UI:  http://localhost:5173" -ForegroundColor White
Write-Host "🏥 Backend API:  http://localhost:5000" -ForegroundColor White
Write-Host "🧠 AI Service:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Cyan

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
