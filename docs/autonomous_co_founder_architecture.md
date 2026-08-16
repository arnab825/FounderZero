# System Architecture: The Autonomous Co-Founder (Unified Single-Server)
**Tech Stack:** React (Frontend) + Python (FastAPI + LangGraph) + Firebase (Firestore, Auth, Storage, Hosting) + Google Gemini (via Google AI Studio / Generative AI SDK)

---

## 1. System Overview & Data Flow (FastAPI + Firebase)

```
[ React / Vite Frontend ] <=== WebSocket (Streaming) & REST ===> [ Python FastAPI Backend ]
       |                                                                   |
       | (Direct Auth & Realtime Sync)                                     | (Firebase Admin SDK)
       v                                                                   v
[ Firebase Auth / Firestore DB / Cloud Storage / Firebase Hosting (Generated Apps) ]
                                       ^
                                       |
                             [ Google Gemini API ]
                             (Reasoning & Coding)
```

### Component Breakdown:
1. **Frontend (React / Vite):** Dynamic dashboard showing live agent execution logs via WebSockets, generated business plans, interactive roadmaps, and deployed preview URLs.
2. **Unified Backend (FastAPI):** Single backend service handling:
   - Verifying Firebase Auth JWT tokens.
   - Managing Firestore DB read/write via `firebase-admin` Python SDK.
   - Real-time WebSocket streaming directly to the React client.
   - Orchestrating the LangGraph AI multi-agent workflow in background tasks.
3. **Database & Services (Firebase - 100% Free Spark Tier):**
   - **Firebase Authentication:** Handles Google login & Email/Password auth effortlessly on frontend and backend.
   - **Cloud Firestore (NoSQL DB):** Stores user profiles, startup projects, agent execution logs, and structured business outputs.
   - **Firebase Storage:** Stores generated artifacts, business plan PDFs, and code bundles.
   - **Firebase Hosting:** Free deployment target for user-generated startups with custom subdomains or preview links.
4. **AI Core (LangGraph + Gemini 1.5):** Embedded directly inside FastAPI, executing agent nodes, tool calls, and structured schema outputs.

---

## 2. Multi-Agent System Architecture (LangGraph Workflow)

The embedded LangGraph engine manages the event-driven workflow:

```
[User Idea] ---> (Market Researcher Agent)
                       |
                       v
            (Business Planner Agent)
                       |
                       v
         +------------+------------+
         |                         |
         v                         v
(Copywriter Agent)        (Code Architect Agent)
         |                         |
         +------------+------------+
                      |
                      v
             (Deployment Agent) ---> [Live Firebase / Vercel URL]
```

### Agent Roles & Free-Tier Tools:
* **Market Researcher Agent:**
  * *Tools:* `duckduckgo-search` / Tavily API (Free tier).
  * *Output:* Validates market demand, lists competitors, and highlights user target personas.
* **Business Planner Agent:**
  * *Tools:* Python-based financial calculation tools.
  * *Output:* 12-month operational budget, unit economics, and milestones saved to Firestore.
* **Copywriter Agent:**
  * *Tools:* Gemini Prompt Templates with Markdown/HTML formatting.
  * *Output:* Landing page copy, value props, elevator pitch, and social media hooks.
* **Code Architect Agent:**
  * *Tools:* Gemini Structured Output (`pydantic` schema enforcement).
  * *Output:* Generates functional single-page web app / landing page (HTML/Tailwind/JS).
* **Deployment Agent:**
  * *Tools:* Firebase Hosting API / GitHub Pages API / Vercel Deploy API (all free).
  * *Output:* Deploys generated code and returns a live production URL.

---

## 3. Key Implementation Steps (FastAPI + Firebase)

### Step 1: Initialize Firebase & FastAPI Server
- Setup `firebase-admin` in FastAPI for Firestore database operations and token verification.
- Connect React directly to Firebase Auth (Client SDK) for one-click Google Login.

### Step 2: Native WebSocket Streaming
- Implement native FastAPI WebSocket endpoints (`@app.websocket("/ws/agent/{project_id}")`).
- Stream real-time LangGraph node execution events, reasoning tokens, and tool results directly to the React dashboard.

### Step 3: Embed LangGraph Workflow
- Define the state graph using `langgraph` in Python.
- Connect Google Gemini (`google-generativeai` or `langchain-google-genai`) using a free Google AI Studio API key.

### Step 4: Output Persistence & Hosting
- Write generated milestones (`researching` -> `planning` -> `generating_code` -> `deploying` -> `deployed`) into **Firestore**.
- Automatically deploy the generated startup landing page to **Firebase Hosting** or **Vercel** and return the live URL.

---

## 4. Why Firebase Simplifies This Architecture
1. **No Relational Database / Migration Overhead:** Firestore's document-based structure easily stores nested JSON outputs from Gemini without complex SQL schema migrations.
2. **Built-in Auth:** Zero boilerplate auth setup (Google Sign-In out of the box).
3. **Generous Free Tier (Firebase Spark Plan):** Free Auth, 1GB Firestore storage, 50k reads/day, 20k writes/day, and 10GB/mo free hosting bandwidth.
4. **Unified Google Ecosystem:** Seamless pairing with Google Gemini and Google Cloud.
