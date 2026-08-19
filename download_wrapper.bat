@echo off
rem Wrapper to launch download_datasets.py using the virtual environment
pushd "%~dp0"
".venv312\Scripts\python.exe" "backend\download_datasets.py"
popd
