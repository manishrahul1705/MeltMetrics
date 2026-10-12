# MetalliSense Master Project Document

**Project:** MetalliSense
**Document status:** Repository-grounded master reference
**Last reviewed:** 2026-09-25
**Workspace root:** `MetalliSense-COMPLETE-FINAL`

## 1. What this project is

MetalliSense is a metal-melting quality and decision-support platform. It combines:

- Raw-material stock and pre-melt charge control.
- Simulated spectrometer and handheld XRF/LIBS inspection flows.
- Composition anomaly detection.
- Alloy-addition recommendations.
- A coordinated AI-agent workflow.
- Closed-loop reinforcement-learning optimization.
- Cost, carbon, savings, and downgrade analysis.
- Explainable AI chat, text-to-speech, and transcription.
- Historical training-data analysis and semantic search.
- A React operator interface.

The project is deliberately split into independent services. The Node backend is the public application API; the Python services are intelligence providers; the React application is the operator UI.

## 2. System at a glance

```text
React UI :5173
    |
    v
Node/Express backend :3000
    |-- CSV stores, grade specs, prices, carbon, alerts, savings
    |-- OPC UA spectrometer simulator :4334
    |-- OPC UA handheld-gun simulator :4335
    |-- proxy --> AI service :8000
    |-- proxy --> Agent service :8001
    |-- optional proxy --> Agent vector routes
    |
    +--> AI service :8000
    |      anomaly model, alloy model, mechanical prediction
    |
    +--> Agent service :8001
           orchestration, copilot, voice, RL, pre-melt risk, vector adapter

Optional standalone semantic-search service :8002
    dataset.csv -> sentence-transformer -> Actian VectorAI or local fallback
```

### Service matrix

| Service | Directory | Default port | Technology | Role |
|---|---|---:|---|---|
| Main backend | `MetalliSense_Backend_Simple` | 3000 | Node.js, Express | Public API, in-memory stores, proxies, OPC UA simulators |
| AI service | `MetalliSense_AI_R/MetalliSense_AI` | 8000 | FastAPI, scikit-learn | Anomaly, alloy correction, mechanical-property prediction |
| Agent service | `MetalliSense_Agent_R/MetalliSense_Agent` | 8001 | FastAPI, scikit-learn | Agent orchestration, RL, pre-melt AI, copilot, voice |
| Semantic search | `MetalliSense_VectorSearch` | 8002 | FastAPI, sentence-transformers | Free-text vector search; optional standalone service |
| Frontend | `MetalliSense_Frontend_R/MetalliSense_Frontend` | 5173 | React, Vite, Tailwind | Dashboard and operator workflows |

## 3. Source-of-truth file map

### Root documentation

- [TORUN.md](TORUN.md): quick-start instructions and feature notes.
- [PREMELT_GATE_MASTER_PLAN.md](PREMELT_GATE_MASTER_PLAN.md): detailed pre-melt domain design, checks, demo script, and limitations.
- [PROJECT_MASTER_DOCUMENT.md](PROJECT_MASTER_DOCUMENT.md): this consolidated reference.
- [MetalliSense_Architecture.png](MetalliSense_Architecture.png): architecture visual.

### Main backend

- [server.js](MetalliSense_Backend_Simple/server.js): Express bootstrap, all major routes, proxy logic, cost/carbon/savings logic, workflow composition, service startup.
- [csvDataStore.js](MetalliSense_Backend_Simple/csvDataStore.js): CSV-backed in-memory training-data store.
- [gradeSpecStore.js](MetalliSense_Backend_Simple/gradeSpecStore.js): grade specifications.
- [alloyPriceStore.js](MetalliSense_Backend_Simple/alloyPriceStore.js): element and base-metal prices.
- [carbonStore.js](MetalliSense_Backend_Simple/carbonStore.js): carbon factors.
- [sellingPriceStore.js](MetalliSense_Backend_Simple/sellingPriceStore.js): grade selling-price ladder and downgrade loss model.
- [mechanicalRoutes.js](MetalliSense_Backend_Simple/mechanicalRoutes.js): mechanical-property proxy routes.
- [opcuaService.js](MetalliSense_Backend_Simple/opcuaService.js): spectrometer OPC UA lifecycle and client operations.
- [opcuaClient.js](MetalliSense_Backend_Simple/opcuaClient.js): OPC UA client implementation.
- [opcua-server/opcuaServer.js](MetalliSense_Backend_Simple/opcua-server/opcuaServer.js): spectrometer simulator.
- [premeltGate/](MetalliSense_Backend_Simple/premeltGate/): raw materials, QA, gun inspection, heat plans, gate checks, interlock, audit.
- [verify.js](MetalliSense_Backend_Simple/verify.js): endpoint-level verifier.
- [dataset.csv](MetalliSense_Backend_Simple/dataset.csv): backend training/history data.

### Agent service

- [app/main.py](MetalliSense_Agent_R/MetalliSense_Agent/app/main.py): FastAPI application and startup initialization.
- `app/agents/`: manager plus anomaly/alloy wrappers.
- `app/policies/decision_policy.py`: safety and orchestration policy.
- `app/inference/`: model inference adapters.
- `app/rl/`: reward model, policy, constraints, feedback store, schemas.
- `app/premelt/`: charge-risk model, assessor, schemas.
- `app/copilot/`: Groq, Gemini, Claude explainers and voice service.
- `app/vectorsearch/`: embeddings, indexer, adapter, and real/fallback VectorAI selection.
- `app/training/`: training scripts for anomaly, alloy, RL, and pre-melt risk models.
- `app/models/`: serialized model files, including the RL reward model and pre-melt model.
- [requirements.txt](MetalliSense_Agent_R/MetalliSense_Agent/requirements.txt): pinned core dependencies plus optional provider packages.

### AI service

- [app/main.py](MetalliSense_AI_R/MetalliSense_AI/app/main.py): FastAPI application.
- `app/inference/anomaly_predict.py`: anomaly inference.
- `app/inference/alloy_predict.py`: alloy-addition inference.
- `app/mech_predict.py` and `app/mech_api.py`: mechanical properties.
- `app/training/`: anomaly and alloy training scripts.
- `app/models/`: serialized models.
- `app/data/`: grade specs, synthetic data helpers, and dataset.
- [requirements.txt](MetalliSense_AI_R/MetalliSense_AI/requirements.txt): Python 3.11 dependency pins.

### Frontend

- [src/App.jsx](MetalliSense_Frontend_R/MetalliSense_Frontend/src/App.jsx): routes and providers.
- `src/pages/`: user-facing workflows listed in Section 7.
- `src/services/`: Axios API clients, one module per feature.
- `src/components/layout/`: shell, sidebar, top bar, OPC status.
- `src/components/premelt/`: gate banner and pre-melt UI helpers.
- `src/components/common/`: reusable controls, tables, cards, dialogs, audio, explanations.
- `src/context/`: auth stub, OPC state, grade state, and melt-flow state.
- [src/services/api.js](MetalliSense_Frontend_R/MetalliSense_Frontend/src/services/api.js): default API base URL and Axios behavior.

## 4. Runtime and installation

### Prerequisites

- Windows PowerShell or an equivalent shell.
- Node.js and npm.
- Python 3.11 for the two Python services.
- Optional Docker plus Actian VectorAI DB for a real vector backend.
- Optional provider API keys for LLM and voice features.

### Recommended startup order

Start each command in its own terminal:

```powershell
# 1. Backend
cd MetalliSense_Backend_Simple
npm install
npm start

# 2. AI service
cd MetalliSense_AI_R\MetalliSense_AI
py -3.11 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app\main.py

# 3. Agent service
cd MetalliSense_Agent_R\MetalliSense_Agent
py -3.11 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app\main.py

# 4. Optional standalone semantic search
cd MetalliSense_VectorSearch
py -3.11 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py

# 5. Frontend
cd MetalliSense_Frontend_R\MetalliSense_Frontend
npm install
npm run dev
```

The frontend normally opens at `http://localhost:5173`. Its default backend base URL is `http://localhost:3000/api/v2`; override it with `VITE_API_BASE_URL`.

### Health checks

| URL | Meaning |
|---|---|
| `http://localhost:3000/api/v1/health` | Main backend is alive |
| `http://localhost:3000/api/v2/grades` | Backend loaded grade data |
| `http://localhost:8000/health` | AI model readiness |
| `http://localhost:8001/health` | Agent, RL, copilot, voice readiness |
| `http://localhost:8002/health` | Optional semantic-search readiness |
| `http://localhost:8000/docs` | AI OpenAPI UI |
| `http://localhost:8001/docs` | Agent OpenAPI UI |

Run the backend verifier after required services are running:

```powershell
cd MetalliSense_Backend_Simple
node verify.js
```

## 5. Configuration and secrets

### Frontend

- `VITE_API_BASE_URL`: defaults to `http://localhost:3000/api/v2`.
- `VITE_API_TIMEOUT`: Axios timeout in milliseconds; defaults to `30000`.

### Backend

The backend loads `MetalliSense_Backend_Simple/config.env` through `dotenv`.

- `PORT`: HTTP port; defaults to 3000.
- `AI_SERVICE_URL`: defaults to `http://localhost:8000`.
- `AGENT_SERVICE_URL`: defaults to `http://127.0.0.1:8001`.
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `OWNER_EMAIL`: optional real email-alert integration.

**Security action required:** the checked-in `config.env` contains credential-looking Gmail values. Treat them as compromised, rotate the Gmail app password immediately, remove secrets from version control, and replace them with local untracked configuration or environment variables. Do not paste those values into documentation, tickets, or commits.

### Agent `.env` and optional providers

The Agent configuration loads its `.env` from the service root, independent of the current working directory.

- `GROQ_API_KEY`: default copilot provider and Whisper transcription.
- `COPILOT_PROVIDER`: `groq` by default; optional `gemini` or `claude`.
- `GOOGLE_GEMINI_API_KEY`: required for Gemini reasoning.
- `ANTHROPIC_API_KEY`: required for Claude reasoning.
- `TTS_PROVIDER`: default gTTS; `elevenlabs` enables ElevenLabs with fallback.
- `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL`: ElevenLabs settings.
- `VECTORAI_HOST`: real VectorAI endpoint; default `localhost:50051`.

Missing provider keys should degrade only the related copilot/voice feature. Core anomaly, alloy, RL, and pre-melt features do not require an LLM key.

## 6. Backend API catalogue

All routes below are under `http://localhost:3000`, except where a service base is explicitly shown. The frontend normally reaches them through `/api/v2`.

### Health and alerts

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Basic backend health |
| GET | `/api/v2/alerts/email-status` | Email configuration status |
| POST | `/api/v2/alerts/send-email` | Send a real deviation email when configured |
| POST | `/api/v2/alerts/simulate` | Draft a simulated escalation; never sends |
| GET | `/api/v2/alerts/history` | Recent simulated alerts |

### Training data

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/v2/training-data` | All CSV rows |
| GET | `/api/v2/training-data/paginated` | Filtered, sorted, paginated rows |
| GET | `/api/v2/training-data/visualizations` | Dashboard aggregates |
| GET | `/api/v2/training-data/grade/:gradeName` | Rows for one grade |
| GET | `/api/v2/training-data/grade/:gradeName/statistics` | Grade statistics by sample type |
| GET | `/api/v2/training-data/:id` | One row |
| POST/PATCH/DELETE | `/api/v2/training-data` or `/:id` | In-memory CRUD |

### Grades

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/v2/grades` | All grade specs |
| POST | `/api/v2/grades` | Create an in-memory grade spec |
| GET | `/api/v2/grades/:gradeName` | One grade |
| GET | `/api/v2/grades/:gradeName/composition` | Composition ranges |
| PATCH/DELETE | `/api/v2/grades/:id` | Update or remove a grade |

### Spectrometer and synthetic readings

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/v2/synthetic/opc-status` | OPC UA status |
| POST | `/api/v2/synthetic/opc-connect` | Connect backend client to simulator |
| POST | `/api/v2/synthetic/opc-disconnect` | Disconnect client |
| POST | `/api/v2/synthetic/opc-reading` | Request a simulated spectrometer reading |
| POST | `/api/v2/synthetic/generate-synthetic` | Generate a reading without OPC UA |
| GET/POST | `/api/v2/synthetic` | In-memory reading collection |
| GET/DELETE | `/api/v2/synthetic/:id` | Read/delete a stored reading |

Compatibility aliases also exist under `/api/v1/spectrometer` and `/api/v2/api/v1/spectrometer`.

### AI proxy routes

| Method | Route | Downstream |
|---|---|---|
| GET | `/api/v2/ai/health` | AI `GET /health` |
| POST | `/api/v2/ai/anomaly/predict` | AI `POST /anomaly/predict` |
| POST | `/api/v2/ai/individual/analyze` | Backend combines AI anomaly + alloy calls |
| POST | `/api/v2/ai/agent/analyze` | Agent `POST /agents/analyze` |
| POST | `/api/v2/ai/explain` | Agent copilot explanation, response adapted for UI |
| POST | `/api/v2/ai/analyze-with-explanation` | Agent explanation proxy |
| POST | `/api/v2/ai/what-if` | Agent what-if proxy |
| GET | `/api/v2/ai/gemini/health` | Agent health compatibility route |

### Connected full analysis

`POST /api/v2/workflow/full-analysis` accepts `{ metalGrade, composition, batchWeightKg, topK }` and composes:

1. Agent anomaly analysis.
2. Alloy recommendation.
3. RL candidates.
4. Cost and carbon annotations.
5. Historical root-cause hint.
6. Best-effort owner email alert for medium/high severity.

The endpoint returns partial results when an optional downstream step fails.

### RL proxy and annotations

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/v2/rl/optimize` | RL candidates plus backend cost/carbon/savings annotations |
| POST | `/api/v2/rl/feedback` | Forward operator outcome feedback |
| GET | `/api/v2/rl/policy/status` | RL policy status |
| GET | `/api/v2/rl/feedback` | Backend in-memory feedback log |

The backend translates frontend camelCase fields to the Agent service's snake_case schemas. Candidate strategy premiums are deterministic operational premiums, not raw material prices.

### Vector proxy

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/v2/vector/status` | Agent vector status |
| POST | `/api/v2/vector/reindex` | Rebuild Agent vector index |
| POST | `/api/v2/vector/search` | Search Agent vector index |
| POST | `/api/v2/vector/memory/add` | Add copilot memory |
| POST | `/api/v2/vector/memory/recall` | Recall copilot memory |

### Cost, carbon, selling prices, and root cause

| Method | Route | Purpose |
|---|---|---|
| GET/PATCH | `/api/v2/cost/prices` | Read/update element and base-metal prices |
| POST | `/api/v2/cost/estimate` | Estimate batch and addition cost |
| GET | `/api/v2/cost/history` | Recent in-memory estimates |
| GET/PATCH | `/api/v2/cost/selling-prices` | Read/update selling-price ladder |
| GET | `/api/v2/cost/savings-analysis` | Historical correction cost versus downgrade/rejection loss |
| GET/PATCH | `/api/v2/carbon/factors` | Read/update emission factors |
| POST | `/api/v2/carbon/estimate` | Estimate batch CO2e |
| GET | `/api/v2/carbon/history` | Recent in-memory carbon estimates |
| GET | `/api/v2/rootcause/:gradeName` | Explainable historical outlier ranking |

Cost prices, carbon factors, histories, readings, alerts, and feedback are in memory unless a future persistence layer is added. Restarting the backend resets them.

### Pre-melt API

The complete pre-melt design is documented in [PREMELT_GATE_MASTER_PLAN.md](PREMELT_GATE_MASTER_PLAN.md). The route base is `/api/v2/premelt`.

| Area | Routes |
|---|---|
| Stock | `GET /summary`, `GET /lots`, `GET /lots/:id`, `POST /lots`, `PATCH /lots/:id/status`, `POST /lots/:id/adjust`, `GET /movements` |
| Additives | `GET /additives`, `POST /additives/receive`, `POST /additives/deduct` |
| DRI QA | `POST /lots/:id/dri-qa`, `GET /dri-qa`, `POST /dri-qa/:qaId/approve`, `POST /dri-qa/:qaId/reject` |
| Handheld gun | `GET /gun/status`, `POST /gun/connect`, `POST /gun/disconnect`, `POST /gun/inspect`, `GET /gun/live`, `POST /gun/ingest-csv`, `GET /gun/sessions`, `GET /gun/sessions/:id`, `GET /gun/sessions/:id/csv`, `POST /gun/argon/replace`, `GET /gun/scenarios` |
| Heat gate | `GET /heats`, `POST /heats`, `GET /heats/:id`, `PUT /heats/:id/charge`, `POST /heats/:id/gate-check`, `POST /heats/:id/start-melting` |
| Configuration | `GET/PATCH /config`, `GET /audit`, `POST /demo/reset` |

Important interlock responses include:

- `428`: gate check or warning acknowledgement is required.
- `423`: gate decision is HOLD; melting is locked.
- `409`: charge changed or previous gate result expired.
- `200`: melting started and stock was deducted.

### Mechanical properties

Mechanical routes are mounted under `/api/v2/mechanical` and implemented in [mechanicalRoutes.js](MetalliSense_Backend_Simple/mechanicalRoutes.js). The underlying model lives in the AI service's `mech_predict.py` and `mech_api.py`.

## 7. Python service API catalogue

### AI service on port 8000

- `GET /`, `GET /health`.
- `POST /anomaly/predict`: grade-aware anomaly score and LOW/MEDIUM/HIGH severity.
- `POST /alloy/recommend`: recommended element additions, confidence, message, warning.
- `GET /grades`, `GET /grades/{grade}`.
- Mechanical-property routes are mounted from `mech_api.py`.

The anomaly model is intended to identify abnormal readings or unstable chemistry; it is not itself a pass/fail furnace gate. The alloy model answers what to add; it does not authorize production.

### Agent service on port 8001

- `GET /`, `GET /health`.
- `POST /agents/analyze`: manager always runs anomaly detection and conditionally invokes alloy correction for medium/high severity; outputs require human approval.
- `POST /anomaly/predict`, `POST /alloy/recommend`, `GET /grades`, `GET /grades/{grade}`: direct compatibility/model routes.
- `GET /vector/status`, `POST /vector/reindex`, `POST /vector/search`, `POST /vector/memory/add`, `POST /vector/memory/recall`.
- `POST /copilot/explain`, `POST /copilot/chat`, `DELETE /copilot/chat/history`.
- `POST /copilot/voice/transcribe`, `POST /copilot/voice/synthesize`, `GET /copilot/voice/status`, `GET /copilot/voice/languages`.
- `POST /rl/optimize`, `POST /rl/feedback`, `GET /rl/policy/status`.
- `POST /premelt/assess`, `GET /premelt/model/status`.

## 8. Frontend route and feature map

The application route table is in [App.jsx](MetalliSense_Frontend_R/MetalliSense_Frontend/src/App.jsx).

| UI route | Page | Main capability |
|---|---|---|
| `/dashboard` | Dashboard | Operational overview, charts, health signals |
| `/anomaly` | AnomalyDetection | Generate/read composition and score anomaly severity |
| `/recommendation` | Recommendation | Review alloy corrections |
| `/rl-optimizer` | RLOptimizer | Compare conservative/balanced/aggressive strategies, cost/carbon, accept/modify/reject |
| `/agent` | AIAgent | Coordinated agent result, explanation, and audio |
| `/grades` | GradeSpecs | Grade specifications |
| `/synthetic` | SyntheticData | Create synthetic deviations |
| `/spectrometer` | Spectrometer | OPC UA connection and readings |
| `/training-data` | TrainingData | Browse and inspect historical rows |
| `/semantic-search` | SemanticSearch | Free-text vector search |
| `/cost-analysis` | CostAnalysis | Prices, estimates, savings and history |
| `/full-analysis` | FullAnalysis | One-click anomaly -> alloy -> RL -> root cause workflow |
| `/mechanical-properties` | MechanicalProperties | Mechanical-property prediction |
| `/raw-material-stock` | RawMaterialStock | Lots, ledger, additives, DRI QA |
| `/yard-inspection` | YardInspection | Handheld XRF/LIBS inspection and CSV ingestion |
| `/premelt-gate` | PreMeltGate | Heat plan, checks, GO/WARN/HOLD, melting interlock |

The frontend has no effective authentication in this build. `AuthContext` returns a Guest user, `ProtectedRoute` renders children directly, and auth pages remain as legacy routes. `api.js` has `withCredentials: false`.

## 9. Core business workflows

### Standard composition analysis

1. Operator generates a synthetic or OPC UA reading.
2. Frontend calls the backend's AI proxy.
3. Backend forwards the composition to the AI service.
4. Anomaly and/or alloy results return to the UI.
5. Recommendations are informational and require operator approval.

### Full analysis

The backend composes Agent analysis, RL candidates, cost, carbon, root cause, and optional email notification into one response. A downstream failure is recorded in the affected step rather than necessarily failing the entire response.

### Pre-melt gate

1. Receive and identify raw-material lots.
2. Inspect scrap with the handheld-gun flow or upload a real-format CSV.
3. Enter and approve DRI lab QA using maker-checker separation.
4. Build a heat from released/restricted lots.
5. Run chemistry, residual, stock, source-quality, and AI-risk checks.
6. Resolve additions from available additive inventory.
7. Receive GO, WARN, or HOLD.
8. Acknowledge warnings or obtain an engineer override where allowed.
9. Start melting only when the interlock permits it; stock is then deducted.

The gate uses source trust, yields, recovery, uncertainty, grade limits, residual limits, and an AI risk model. Fe is treated as the balance element in the gate chemistry logic.

### RL feedback loop

1. Request ranked strategies from `/rl/optimize`.
2. Operator accepts, modifies, or rejects a candidate in the UI.
3. Actual result and operator note are sent to `/rl/feedback`.
4. The Agent reward model persists updates in its configured model/feedback files.

### Semantic search

The standalone service embeds CSV readings and derived grade descriptions. It uses real Actian VectorAI when the SDK and server are reachable; otherwise it uses an in-memory NumPy cosine-similarity implementation with the same adapter interface.

## 10. Data, models, and persistence

### Data sources

- Main backend: `MetalliSense_Backend_Simple/dataset.csv`.
- AI service: `MetalliSense_AI_R/MetalliSense_AI/app/data/dataset.csv` and grade data.
- Agent service: its `app/data` dataset and serialized models.
- Vector service: `MetalliSense_VectorSearch/dataset.csv`.

### Persistence model

The Simple backend keeps operational state in process memory: lots, movements, heats, audit records, readings, price history, carbon history, simulated alerts, and RL proxy feedback. The pre-melt demo can be reset with `POST /api/v2/premelt/demo/reset`.

The Python services load serialized model files. Training scripts can regenerate missing models. The RL service includes a bootstrapped reward model in the packaged Agent service; retraining is optional unless the policy needs resetting.

### Training commands

Run from the relevant Python service root with its virtual environment active:

```powershell
python app\training\train_anomaly.py
python app\training\train_alloy_agent.py
python app\training\train_premelt_risk.py
python app\training\train_rl.py 2000
```

Use the RL argument as a smaller CSV row count for a quick reset; omitting it uses the full dataset and may take longer. Do not retrain production models without recording the dataset and configuration used.

## 11. OPC UA devices

### Spectrometer

- Simulator endpoint: `opc.tcp://localhost:4334/MetalliSense/Spectrometer`.
- Backend starts the server at boot and connects the client only when requested.
- The client can request a grade-specific reading with selected deviation elements.

### Handheld gun

- Simulator endpoint: `opc.tcp://localhost:4335/MetalliSense/HandheldGun`.
- Backend starts it with the main server.
- It emits piece-level readings, status, count, CSV content, and argon state.
- Real gun-compatible CSV files can be ingested through the pre-melt API.
- XRF does not report carbon; LIBS requires grinding and consumes argon per piece.

The simulators are demonstrations and integration scaffolds, not certified instrument drivers.

## 12. Cost, carbon, and business assumptions

- Cost uses configured element prices plus base-metal price and an optional strategy operational premium.
- Conservative, balanced, and aggressive premiums are intended to represent handling, QA, and rework risk; they are not raw material prices.
- Carbon uses configured illustrative emission factors.
- Savings analysis assumes a 1,000 kg batch and compares correction cost with downgrade loss or a fallback rejection fraction.
- Selling-price and commodity values are not live feeds. Operators must update them and verify supplier/market inputs.
- The savings model treats additions below the normal range as correctable and reports above-range deviations separately; removing excess material requires dilution or rework and is not modeled as a simple addition.

## 13. Known limitations and discrepancies

1. **Secrets:** checked-in backend configuration contains credential-looking Gmail values. Rotate and remove them before any deployment or sharing.
2. **No effective authentication:** frontend auth components are compatibility stubs. CORS is open in the backend and Python services. This is demo-grade, not production access control.
3. **In-memory backend:** restart loses operational state and histories.
4. **VectorAI:** the standalone service may use a local fallback; successful startup does not prove a real Actian connection unless health reports the real backend.
5. **Synthetic training data:** model behavior and grade chemistry are only as representative as the current CSV. Validate against plant data before decisions.
6. **Illustrative chemistry limits:** yields, recoveries, residual limits, trust levels, prices, carbon factors, and mechanical assumptions must be plant-calibrated.
7. **LLM/voice live calls:** provider integrations require keys and network access. Fallback behavior is expected when providers are unavailable.
8. **Email:** simulated alerts never send messages; real email requires the separate email endpoint and valid Gmail app-password configuration.
9. **Legacy auth UI:** `/login` and `/signup` files remain in the frontend even though every route is effectively open.
10. **Port fallback:** the backend automatically tries later ports when 3000 is occupied. The frontend must then be pointed at the actual backend port.
11. **Compatibility route shapes:** the backend contains aliases and field-name translations because older frontend service names and current Python schemas differ.
12. **Operator approval:** AI outputs are recommendations. The Agent manager explicitly records a human-approval requirement; it does not autonomously actuate the furnace.

## 14. Validation checklist

### Installation

- [ ] Node dependencies install in backend and frontend.
- [ ] Python 3.11 virtual environments are used for AI and Agent services.
- [ ] Exact pinned scikit-learn version `1.3.2` is installed.
- [ ] Model files exist or training scripts have been run.
- [ ] Frontend `VITE_API_BASE_URL` points to the actual backend port.

### Runtime

- [ ] Backend health and `/api/v2/grades` return JSON.
- [ ] AI health reports anomaly and alloy models ready.
- [ ] Agent health reports RL and pre-melt readiness.
- [ ] OPC UA simulator logs show ports 4334 and 4335 where applicable.
- [ ] Frontend dashboard loads without a login dependency.
- [ ] `node verify.js` passes required checks.

### Feature smoke tests

- [ ] Generate a normal and deviated synthetic reading.
- [ ] Run anomaly detection and alloy recommendation.
- [ ] Run full analysis with a batch weight.
- [ ] Request RL candidates and submit feedback.
- [ ] Read and update cost and carbon factors.
- [ ] Run a root-cause request for a known grade.
- [ ] Receive a stock lot, inspect it, and view its movement history.
- [ ] Enter and approve a DRI QA result using two names.
- [ ] Create a heat, run the pre-melt gate, and verify the start-melting interlock.
- [ ] Confirm semantic search reports whether it is using Actian or local fallback.

## 15. Demo sequence

For the most complete demonstration:

1. Start the Agent, AI, backend, and frontend services.
2. Open Raw Material Stock and review seeded alerts.
3. Run Yard Inspection on a seeded scrap lot and show the reading stream.
4. Enter and approve DRI QA with different submitter and approver names.
5. Build a planned heat in Pre-Melt Gate.
6. Run the gate and show WARN/HOLD reasons, predicted chemistry, uncertainty, and additions.
7. Apply additions, re-check, and start melting only after GO or required acknowledgement.
8. Open Full Analysis to show anomaly, alloy, RL, cost, carbon, and root cause together.
9. Open Cost Analysis to explain assumptions and update illustrative prices.
10. Finish with Semantic Search if the optional service is available.

## 16. Future production hardening

- Move secrets to a secret manager and rotate all exposed credentials.
- Add authentication, authorization, operator roles, CSRF protection where relevant, and restricted CORS.
- Persist lots, heats, audit, prices, feedback, and histories in a database.
- Add request validation, rate limiting, structured logs, tracing, and metrics.
- Replace demo OPC UA servers with certified instrument integrations and device security.
- Version datasets and model artifacts; record model/data provenance for every recommendation.
- Calibrate chemistry, uncertainty, costs, carbon factors, and residual limits with plant QA.
- Add end-to-end tests across all service boundaries and contract tests for frontend payloads.
- Add a durable approval/override workflow with immutable audit records.
- Deploy services independently with health probes, timeouts, retries, and circuit breakers.

## 17. Related documentation

- [TORUN.md](TORUN.md): concise operational startup guide.
- [PREMELT_GATE_MASTER_PLAN.md](PREMELT_GATE_MASTER_PLAN.md): pre-melt requirements, chemistry, checks, gun simulator, API, demo, and limits.
- `MetalliSense_Backend_Simple/premeltGate/README.md`: pre-melt implementation notes.
- `MetalliSense_VectorSearch/README.md`: semantic-search setup and troubleshooting.
- `MetalliSense_VectorSearch/VECTORSEARCH_README.md`: VectorAI integration and fallback details.
- `MetalliSense_Agent_R/MetalliSense_Agent/DOCS/`: Agent architecture, API references, copilot setup, frontend integration, and implementation notes.
- `MetalliSense_AI_R/MetalliSense_AI/DOCS/`: AI-service documentation and model notes.

## 18. One-sentence operating principle

MetalliSense turns a composition reading or raw-material charge into explainable quality signals and recommended actions, while keeping the final production decision, pre-melt interlock, and physical furnace action under human control.