@echo off
echo Starting AyuMantra Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node app.js"

timeout /t 3 /nobreak >nul

echo Starting Frontend Application...
start "Frontend App" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
