@echo off
REM DermaSense AI — Backend Virtual Environment Setup Script
REM =========================================================
REM
REM IMPORTANT: TensorFlow requires Python 3.9 – 3.12.
REM This script creates a compatible virtual environment using py launcher.
REM
REM Requirements:
REM   - Python 3.11 or 3.12 installed (https://python.org/downloads)
REM   - Run from the backend\ directory
REM
REM Usage:
REM   cd backend
REM   setup_venv.bat

echo.
echo ============================================================
echo  DermaSense AI — Backend Environment Setup
echo ============================================================
echo.

REM Check if py launcher is available
where py >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python launcher ^(py^) not found.
    echo Please install Python 3.11 or 3.12 from https://python.org/downloads
    pause
    exit /b 1
)

REM Try Python 3.12 first, then 3.11
echo Checking for Python 3.12...
py -3.12 --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYVER=3.12
    goto :found
)

echo Checking for Python 3.11...
py -3.11 --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYVER=3.11
    goto :found
)

echo Checking for Python 3.10...
py -3.10 --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYVER=3.10
    goto :found
)

echo.
echo ERROR: Python 3.10, 3.11, or 3.12 is required for TensorFlow.
echo Your system only has Python 3.14 which TensorFlow does not support yet.
echo.
echo Please install Python 3.12 from: https://python.org/downloads/release/python-3127/
echo Then run this script again.
pause
exit /b 1

:found
echo Found Python %PYVER% — creating virtual environment...
echo.

REM Remove old venv if it exists
if exist venv (
    echo Removing old virtual environment...
    rmdir /s /q venv
)

REM Create new venv with correct Python version
py -%PYVER% -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment.
    pause
    exit /b 1
)

echo Virtual environment created with Python %PYVER%.
echo.

REM Upgrade pip
echo Upgrading pip...
venv\Scripts\python.exe -m pip install --upgrade pip --quiet

REM Install all requirements
echo Installing requirements...
venv\Scripts\python.exe -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Some packages failed to install. Check the output above.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo  Setup complete!
echo ============================================================
echo.
echo To start the backend:
echo   venv\Scripts\activate
echo   uvicorn main:app --reload
echo.
echo Or use: start-backend.bat
echo.
pause
