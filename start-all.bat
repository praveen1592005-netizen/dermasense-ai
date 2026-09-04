@echo off
echo ========================================================
echo Starting DermaSense AI (Backend + Frontend)
echo ========================================================
start "DermaSense Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul
start "DermaSense Frontend" cmd /k "%~dp0start-frontend.bat"
