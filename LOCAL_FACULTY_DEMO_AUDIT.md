# DermaSense AI - Local Faculty Demo Audit

This document outlines the steps taken to verify and configure the DermaSense AI project for a local faculty demonstration, ensuring that all components (Backend, Web Frontend, and Mobile App) communicate effectively over the local network without relying on production deployment endpoints.

## 1. Backend Verification (FastAPI + AI Model)

- **Environment Setup:** Python 3.12 virtual environment was created to support `tensorflow>=2.16.0`.
- **Configuration:** `.env` was validated. The Supabase connection strings are intact for local database and authentication testing.
- **AI Model Status:** The EfficientNetV2B2 model (`DermaSense_SkinDisease_v1.keras`) and its calibration configuration were successfully loaded into memory.
- **Testing:** The `pytest` suite ran with 100% success (33 passing tests) validating prediction schemas, authentication flows, and payment webhook logic.
- **Network Binding:** The Uvicorn server is bound to `0.0.0.0:8000`, making it accessible via both `localhost` and the local LAN IP (`172.23.52.86`).
- **Endpoint Status:** `http://localhost:8000/health` returns `model_loaded: true` and `database: ok`.

## 2. Web Frontend Verification (React + Vite)

- **Environment Setup:** Updated `frontend/.env` to point `VITE_API_BASE_URL` to the local backend `http://localhost:8000/api/v1`.
- **CORS Testing:** Confirmed that the backend CORS explicitly allows `http://localhost:5173`.
- **Functionality Tests:** 
  - Validated local Vite production build (`npm run build`).
  - Tested Auth flows (Signup, OTP fallback, Demo Login) via browser subagent.
  - Successfully verified AI endpoint (`/api/v1/predict/analyze`) functionality against a test image.

## 3. Mobile App Verification (React Native + Expo)

- **Environment Setup:** Updated `mobile/.env` to use the LAN IP for the backend API: `EXPO_PUBLIC_API_URL=http://172.23.52.86:8000/api/v1`. This is critical as Android Emulators and physical devices cannot resolve `localhost` to the host machine.
- **Source Code Audit:** Verified that no hardcoded `localhost` or `onrender.com` URLs exist in the TypeScript source files.
- **Compilation Check:** Ran `npx tsc --noEmit` and confirmed zero TypeScript compilation errors.
- **Network Accessibility:** Verified that the LAN IP `172.23.52.86:8000` is exposed and serving the API correctly for the mobile app to consume.

---

## Instructions to Run the Local Demo

Open three separate terminal windows/tabs at the root of the project (`C:\praveen\Derma sense`).

### Terminal 1: Run the Backend
```cmd
cd backend
venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000
```
*(Alternatively, you can just run `start-backend.bat` from the root folder).*

### Terminal 2: Run the Web Frontend
```cmd
cd frontend
npm run dev
```
*(Then open `http://localhost:5173` in your browser).*

### Terminal 3: Run the Mobile App
```cmd
cd mobile
npx expo start --lan
```
*(Then scan the QR code with the Expo Go app on your physical device connected to the same Wi-Fi network, or press `a` to run it on an Android Emulator).*
