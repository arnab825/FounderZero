# 🚀 The Autonomous Co-Founder

An end-to-end multi-agent AI system that converts a raw startup idea into validated market research, a 12-month business model & KPI roadmap, conversion-focused marketing copy, functional web code, and instant live deployment—streamed live to an interactive dashboard.

---

## 🏗️ Architecture

```text
[ React / Vite Frontend ] <=== WebSocket (Telemetry Stream) & REST ===> [ FastAPI Backend (Python) ]
       |                                                                             |
       | (Direct Auth & State Sync)                                                  | (Firebase Admin SDK)
       v                                                                             v
[ Firebase Auth / Cloud Firestore / Storage / Hosting ]              [ LangGraph Multi-Agent Engine ]
                                                                                     |
                                                                             [ Google Gemini ]
```

### Agent Workflow (LangGraph)

```text
[User Idea] ───► (Market Researcher Agent)
                         │
                         ▼
              (Business Planner Agent)
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
   (Copywriter Agent)        (Code Architect Agent)
            └────────────┬────────────┘
                         │
                         ▼
                (Deployment Agent) ───► [ Live Preview / Production URL ]
```

---

## ✨ Features

- **Multi-Agent LangGraph Pipeline:** Orchestrates 5 specialized agent nodes with state passing and fallback recovery.
- **Native WebSocket Streaming:** Real-time terminal telemetry streaming agent thoughts, tools, token generation, and stage transitions.
- **Market Research & Validation:** Live web search (DuckDuckGo / Tavily) to uncover competitors, market size, and customer personas.
- **Financial & Operational Roadmap:** Automated 12-month projections, CAC/LTV calculations, burn rates, and quarterly milestones.
- **Copywriting Engine:** Value propositions, elevator pitch, hooks, and full landing page content copy.
- **Code Generation & Live Preview:** Responsive HTML5 + Tailwind CSS + JS single-page web app generation with a live interactive iframe preview sandbox.
- **Instant Deployment:** Automatic deployment target support (Firebase Hosting, Vercel REST API, and built-in local static server).
- **Firebase Auth & Firestore:** Optional Firebase integration for user authentication and startup document persistence.

---

## 🛠️ Quick Start

### 1. Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm
- Google Gemini API key (Free at [Google AI Studio](https://aistudio.google.com/))

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
cp ../.env.example .env
# Edit .env and set GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` to access the Autonomous Co-Founder dashboard!

---

## 📁 Repository Structure

```text
autonomous-co-founder/
├── .env.example
├── README.md
│
├── backend/
│   ├── main.py                      # FastAPI entrypoint & static sandbox
│   ├── config.py                    # App configuration & env loader
│   ├── firebase.py                  # Firebase Admin SDK & fallback store
│   ├── schemas.py                   # Pydantic schemas & state models
│   ├── routes/                      # REST & WebSocket endpoints
│   │   ├── auth.py
│   │   ├── projects.py
│   │   └── ws.py
│   ├── agents/                      # Multi-agent LangGraph workflow
│   │   ├── state.py
│   │   ├── workflow.py
│   │   ├── nodes/
│   │   │   ├── market_research.py
│   │   │   ├── business_planner.py
│   │   │   ├── copywriter.py
│   │   │   ├── code_architect.py
│   │   │   └── deployment.py
│   │   └── tools/
│   │       ├── search_tools.py
│   │       └── deploy_tools.py
│   └── requirements.txt
│
└── frontend/
    ├── index.html
    ├── vite.config.ts
    ├── package.json
    └── src/
        ├── App.tsx
        ├── config/firebase.ts
        ├── context/AuthContext.tsx
        ├── hooks/useAgentWebSocket.ts
        ├── components/
        │   ├── Navbar.tsx
        │   ├── TerminalLog.tsx
        │   ├── BusinessRoadmap.tsx
        │   ├── CodePreview.tsx
        │   └── DeploymentBadge.tsx
        ├── pages/
        │   ├── Dashboard.tsx
        │   ├── ProjectView.tsx
        │   └── Login.tsx
        └── services/api.ts
```
