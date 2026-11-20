@echo off
echo ==========================================================
echo Launching Upwork AI Matcher & Proposal Studio
echo ==========================================================
echo Starting Backend (FastAPI) and Frontend (React Vite)...

start "Upwork Studio - Backend (FastAPI)" cmd /c "%~dp0run_backend.bat"
timeout /t 2 /nobreak >nul
start "Upwork Studio - Frontend (React)" cmd /c "%~dp0run_frontend.bat"

echo App is launching!
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
timeout /t 3 >nul
start http://localhost:5173

