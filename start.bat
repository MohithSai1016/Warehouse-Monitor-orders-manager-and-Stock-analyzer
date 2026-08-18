@echo off
echo ==========================================================
echo Starting Sai's Warehouse Management System & 3D Simulation
echo ==========================================================
echo.
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
echo.
echo Launching Vite Development Server...
start "" "http://localhost:5173"
npm run dev
pause
