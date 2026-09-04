# DermaSense AI — Local AI & Dermatology Screening Platform

DermaSense AI is an AI-assisted skin health screening platform featuring:
1. **EfficientNetV2 Dermatology Image Model**: 7-class HAM10000 skin lesion classification with confidence scores and top-k breakdowns.
2. **Local AI Chatbot (Ollama + LLaMA 3.1 8B)**: 100% local, private conversational AI for explaining screening results, answering questions, and preparing for doctor visits.
3. **Zero Paid External API Required**: No OpenAI, Gemini, or Anthropic API keys needed.

---

## 📁 Repository Structure

```
Derma sense/
├── frontend/                     # React 19 + TypeScript + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/           # UI & Clinical components (Chat, Screening, etc.)
│   │   ├── pages/                # Dashboard, Disease Analysis, Reports, etc.)
│   │   ├── services/             # Ollama, Disease Analysis, Doctor Search, etc.
│   │   └── types/                # TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.local                # Points to http://localhost:8000
│
├── backend/                      # Python FastAPI Backend
│   ├── main.py                   # FastAPI server entry point
│   ├── requirements.txt          # Python dependencies (FastAPI, TensorFlow, etc.)
│   ├── services/
│   │   ├── skin_ai_service.py    # EfficientNetV2 inference & HAM10000 mapping
│   │   └── local_ai_service.py   # Ollama LLM proxy & guardrails
│   ├── routers/
│   │   ├── skin_router.py        # /api/skin/analyze & /api/skin/quality-check
│   │   └── ai_router.py          # /api/ai/chat & /api/ai/explain-result
│   ├── models/                   # Place skin_model.keras here
│   └── train_model.py            # EfficientNetV2 HAM10000 training script
│
├── start-all.bat                 # One-click launcher for Frontend + Backend
├── start-frontend.bat            # Launches Vite dev server
├── start-backend.bat             # Launches FastAPI server
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+
- **Ollama**: Download from [ollama.com](https://ollama.com/download/windows)

### 2. Launching the Application

#### Option A: One-Click (Windows)
Double-click `start-all.bat` in the root folder.

#### Option B: Manual Terminal Commands

**Terminal 1 — Local AI (Ollama):**
```powershell
ollama serve
ollama pull llama3.1:8b
```

**Terminal 2 — Backend (FastAPI):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 3 — Frontend (React/Vite):**
```powershell
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing Backend Health
```powershell
curl http://localhost:8000/health
```
