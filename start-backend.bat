@echo off
echo ============================================================
echo  DermaSense AI — FastAPI Backend (Port 8000)
echo ============================================================
echo.
cd /d "%~dp0backend"

if not exist venv (
    echo Virtual environment not found.
    echo Running setup_venv.bat first...
    call setup_venv.bat
    if %errorlevel% neq 0 (
        echo Setup failed. Please fix the errors above.
        pause
        exit /b 1
    )
) else (
    call venv\Scripts\activate
)

echo.
echo Starting DermaSense AI Backend...
echo Model: models\skin_disease\DermaSense_SkinDisease_v1.keras
echo API Docs: http://localhost:8000/docs
echo Health:   http://localhost:8000/health
echo.
venv\Scripts\python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
