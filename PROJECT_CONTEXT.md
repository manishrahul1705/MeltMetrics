# MetalliSense project context

Last reviewed: 2026-09-28. Scope: onboarding, code inspection, safe local checks, and documentation only. No application behavior was changed.

## How to use this document

Read this before substantial project work. The active source code is the implementation authority; this document is a dated map, not a guarantee of production behavior. Existing PROJECT_MASTER_DOCUMENT.md, PREMELT_GATE_MASTER_PLAN.md and TORUN.md remain useful detailed references, but contain historical claims and contradictions noted below. No previous chat history was assumed.

No AGENTS.md was found in the active project or the inspected user/Downloads ancestor directories. Neither this file nor root AGENTS.md previously existed. Git status at the project root reported "not a git repository"; no nested .git directory was found. Do not claim a clean Git working tree or discard existing files. Backups and "Claude outputs" are historical artifacts, not active application roots.

## Purpose and scope

MetalliSense is a human-approved foundry decision-support prototype covering raw-material receipt and assessment, charge planning, pre-melt checks, alloy analysis and correction, strategy comparison, inventory, supplier evaluation, mechanical estimates, heat completion and sales records. Circular Economy is its primary sustainability positioning: scrap screening, material recovery, supplier quality and returns reuse. Climate Tech is secondary through estimated energy and carbon effects.

The software's "start furnace" action updates application records and stock. No physical furnace actuator/control path was found. Do not describe it as autonomous safety-critical furnace control or portray modeled savings as measured production improvements.

## Active architecture and folder map

Paths in the following sections use these abbreviations:

| Alias | Active directory | Runtime/default port | Responsibility |
|---|---|---|---|
| B | MetalliSense_Backend_Simple | Node.js/Express, 3000 | Public REST API, CSV/history, business stores, proxy/orchestration, OPC UA simulators |
| F | MetalliSense_Frontend_R/MetalliSense_Frontend | React 18/Vite/Tailwind, 5173 | Operator pages, charts, shared melt-flow state |
| AI | MetalliSense_AI_R/MetalliSense_AI | Python/FastAPI, 8000 | Anomaly, supervised alloy correction, mechanical estimates |
| A | MetalliSense_Agent_R/MetalliSense_Agent | Python/FastAPI, 8001 | Agent orchestration, strategy reward learning, pre-melt risk, copilot and voice |
| V | MetalliSense_VectorSearch | Python/FastAPI, 8002 | Optional standalone sentence-transformer semantic search |

- F: src/App.jsx defines routes/providers; src/pages contains workflows; src/services contains Axios clients; src/context contains Auth, OPC, Grade and MeltFlow providers.
- B: server.js mounts APIs; csvDataStore.js loads dataset.csv; gradeSpecStore.js, alloyPriceStore.js, carbonStore.js and sellingPriceStore.js hold grade/economic defaults.
- B/premeltGate: store.js, chemistry.js, gateEngine.js, config.js, additives.js, driQa.js, gun* modules, supplierScorecard.js, supplierHistory.js, energy.js, inventory.js, purchaseRequests.js, sales.js and corresponding route files.
- AI and A: app/main.py, app/config.py, app/agents, app/inference, app/data, app/training and app/models. These services have separate model/data copies; do not assume changes to one update the other.
- AI/app/mech_api.py and mech_predict.py implement mechanical endpoints/formulas; app/models/mechanical contains serialized regression, classifier and metadata artifacts.
- A/app/rl contains policy.py, reward_model.py, constraints.py, feedback_store.py and schemas.py. A/app/premelt contains the charge-risk assessor/model. A/app/copilot contains selectable explainers and voice_service.py.
- B/opcua-server/opcuaServer.js simulates a spectrometer at opc.tcp://localhost:4334/MetalliSense/Spectrometer; opcuaService.js/opcuaClient.js manage its client.
- B/premeltGate/gunOpcuaServer.js simulates the handheld gun at port 4335, path /MetalliSense/HandheldGun. CSV exports go to premeltGate/gun_exports.
- Exclude node_modules, venv/.venv, dist/build, __pycache__, generated exports and all _backup_before_* directories from the primary review. The specifically reported _backup_before_claude_20260925_0252 exists; several later backups also exist.

Frontend dependencies include React Router, Axios, Recharts, lucide-react and react-hot-toast. Backend uses node-opcua, csv-parse, dotenv and nodemailer. Python uses scikit-learn, NumPy, pandas, SciPy and joblib. MongoDB is not used by this backend. Firebase configuration and login/signup files remain, but AuthContext supplies a Guest stub and no real authentication. Application communication is REST with frontend polling; no application WebSocket transport was found.

## Page/API/service map

Except where stated, API paths below are relative to B's /api/v2. Follow F/src/services for payload shapes and camelCase/snake_case translation.

| Frontend page/route | API connection and implementation |
|---|---|
| Dashboard /dashboard | training-data and grade summaries; CSV-backed data, not live plant statistics |
| RawMaterialStock /raw-material-stock | premelt/lots, movements, additives, dri-qa; B/premeltGate/routes.js, store.js, additives.js, driQa.js |
| YardInspection /yard-inspection | premelt/gun status/connect/inspect/live/sessions/ingest-csv; simulated OPC UA plus CSV parser |
| PreMeltGate /premelt-gate | premelt/heats, heat charge update, gate-check, start-melting, config, audit and demo/reset |
| AnomalyDetection /anomaly; Recommendation /recommendation | ai/individual/analyze combines AI:8000 /anomaly/predict and /alloy/recommend |
| RLOptimizer /rl-optimizer | rl/optimize, feedback, policy/status -> A:8001 /rl/*; B annotates cost/carbon/savings |
| FullAnalysis /full-analysis | workflow/full-analysis chains AI/Agent outputs; strategy approval uses rl/feedback |
| AIAgent /agent | ai/agent/analyze -> A /agents/analyze; ai/explain -> A /copilot/explain; direct copilot client also used |
| MechanicalProperties /mechanical-properties | /api/v2/mechanical/predict -> AI /mechanical/predict; formula fallback in browser; sales/heats/:heatId/complete for tap |
| SupplierScorecard /supplier-scorecard | insights/suppliers/scorecard, detail, ahp, weights, best, order-plan, alerts |
| EnergyDashboard /energy | insights/energy/summary, config, heat/:heatId, actual, simulate |
| InventoryForecast /inventory-forecast | inventory/forecast, reorder-suggestions, purchase-requests, config |
| SalesInvoices /sales | sales/heats, certificates/:heatId, customers, invoices, config |
| GradeSpecs /grades | grades APIs and mutable in-memory custom specs |
| SyntheticData /synthetic; Spectrometer /spectrometer | synthetic/* and compatibility spectrometer routes -> B OPC UA simulator |
| TrainingData /training-data | training-data CRUD/pagination/visualizations; changes are in memory |
| CostAnalysis /cost-analysis | cost/*, carbon/* and related savings/root-cause data; illustrative constants |
| SemanticSearch /semantic-search | DIRECT V:8002 /semantic-search, /health, /reindex via semanticSearchService.js |

Separate vectorSearchService.js and B /vector/* proxy to A's embedded vector module; that is a different search implementation from the Semantic Search page. Copilot chat and voice use a separate direct A:8001 client, not solely the backend base URL.

## Actual end-to-end flow

1. Receive lots via premelt/lots (or additives/receive). Ledger RECEIPT movements establish stock. Material type determines release/QA requirements. Scrap is screened by simulated XRF/LIBS or imported gun CSV; DRI lab entry and approval use separate typed names. Gun samples flag/restrict/quarantine scrap; they are not treated as a representative bulk chemistry average.
2. Plan a heat with grade, target kg and charge lines. chemistry.js predicts metal yield, melt-down composition, uncertainty and elemental sources from declared/certificate/lab/parent-heat data.
3. POST premelt/heats/:heatId/gate-check runs charge weight, lot status, available stock, scrap inspection, DRI QA, composition/spec, residual and AI-risk checks. B calls A /premelt/assess; AI unavailability causes HOLD by default (aiRequired setting). Configurable thresholds and energy estimates are attached. Results and gate history are stored and audited.
4. POST start-melting requires an operator, a current gate fingerprint and nonexpired result. WARN requires acknowledgement; HOLD requires engineer name and written reason. The backend rechecks stock, immediately writes negative CHARGE movements for the raw charge, sets MELTING and logs start/override. This is software state, not hardware actuation.
5. PreMeltGate's gatePassed dispatch copies predicted composition, sigma, grade, heat ID, mass, gate spec/checks and suggested additive lots into MeltFlowContext. Continue to AI analysis exists for newly started and already started heats. Gate-origin pages use predicted chemistry; a spectrometer navigation button does not establish a measured post-correction feedback loop.
6. Anomaly and alloy pages save results through anomalyDone/alloyDone. RLOptimizer restores flow.rlResult and its _reading, can run automatically after alloy completion, and exposes gate-run/re-score controls. Manual/synthetic mode is also present; UI gating is not backend authorization.
7. RL optimize obtains three scaled/clipped recommendations and learned rewards. B adds cost/carbon estimates. The UI calculates a separate composite score and displays comparison, winners, mechanical formula checks and constraint flags.
8. Operator acceptance first submits RL feedback (which updates the reward model). RLOptimizer then deducts additive lines from the GATE's suggestedAdditions and calls acceptStrategy. See known issues: selected candidate quantities, error handling and the FullAnalysis path are inconsistent.
9. MechanicalProperties uses accepted additions and composition for estimates. Operator tap approval calls sales/heats/:heatId/complete. sales.js checks submitted chemistry/mechanics, completes/downgrades the heat, creates a RETURNS lot with parent chemistry, and enables certificate/invoice/margin views. Castings/returns percentages and values are configured demo assumptions, not measured weights. If no energy actual exists, completion simulates one.
10. Backend actions add audit events via store.log. RL feedback has its own persistent JSONL log; it is not the same as the Pre-Melt Gate audit list.

## AI, scoring and learning: precise interpretation

- Anomaly: IsolationForest plus StandardScaler in AI/app/agents/anomaly_agent.py (also a separate copy under A). Grade/spec logic contributes to interpretation. Six core model elements: Fe, C, Si, Mn, P, S.
- Alloy: GradientBoostingRegressor wrapped in MultiOutputRegressor, with X/y StandardScaler, in app/agents/alloy_agent.py. Training derives correction targets from grade specifications; do not equate those targets with measured successful plant interventions. Inference includes clipping/fallback rules.
- Agent manager: deterministic orchestration in A/app/agents/agent_manager.py and policies/decision_policy.py; always checks anomaly and conditionally requests alloy correction for MEDIUM/HIGH. This is not an autonomous LLM planning/control loop.
- Pre-melt risk: per-grade HistGradientBoostingClassifier trained using dataset is_deviated labels; chemistry features C/Si/Mn/P/S, uncertainty sampling and driver estimates. Assessor restricts corrections to C/Si/Mn and adjusts Fe to a grade midpoint for alloy-model input because the dataset's Fe differs from balance Fe. A missing/unloadable risk artifact triggers train_and_save on first use; avoid triggering this during read-only inspection.
- RL: contextual-bandit-style reward regression, not a full sequential RL/MDP furnace controller. policy.py actually uses conservative 0.3x, balanced 1.0x, aggressive 2.0x. Older docstrings say 0.5/1.0/1.5 and are stale.
- Candidates come from scaling the supervised alloy output, applying per-element/total bounds, predicting reward and sorting by reward. constraints.py costs are relative weights, not rupees or live inventory checks.
- reward_model.py uses SGDRegressor.partial_fit. Feedback rewards combine operator accepted/modified/rejected judgments, optional actual_result improvement toward grade midpoint, and a cost penalty. Both acceptance pages currently send decisions without measured actual_result.
- Updates persist rl_reward_model.pkl, rl_reward_model_state.json and app/data/rl_feedback_log.jsonl. No feedback/retraining was performed in this onboarding. Existing model reported 60,055 updates; that counter is not evidence of 60,055 real plant outcomes.
- app/training/train_rl.py bootstraps from hypothetical additive corrections to CSV readings, not recorded post-correction outcomes. The policy has genuine incremental learning code, but its production effectiveness and calibration are unverified.
- UI composite in F/src/components/rl/StrategyComparison.jsx: min-max normalize candidates; reward 35%, cost 25%, spec compliance 25%, CO2 15%; mechanical failure subtracts 0.5 from the compliance input; each constraint flag subtracts 10 points; final result clamps to 0..100. It is relative to the candidates and is not model accuracy or a calibrated probability. Backend reward winner can differ from UI composite winner.
- RL mechanical comparison uses local hardcoded formulas/specs in RLOptimizer.jsx. AI mechanical API supports formula (default single prediction) and optional serialized ML modes; MechanicalProperties requests formula and falls back to browser formulas. Predictions are not physical tensile-test certificates.
- "accuracy, balance, composite" has no confirmed one-to-one meaning in this code. Balanced is a strategy; composite is a UI metric; model accuracy is a different concept. Do not silently reinterpret that phrase as the three strategy labels.
- Spectrometer exposes Fe/C/Si/Mn/P/S/Cr/Ni/Mo/Cu plus temperature/pressure. Core ML does not consume all those fields. Pre-melt residual logic additionally uses Sn. Gate-derived UI readings use default temperature 1480 and pressure 1, not measurements.

## Data and persistence

All four dataset.csv copies (B root, AI/app/data, A/app/data, V root) contained 200,001 data rows with identical SHA-256 at review. Columns: timestamp, grade, is_deviated, Fe, C, Si, Mn, P, S, total_composition. Synthetic generators and demo seeds exist; provenance as real production data is not established. Do not adopt older 30K/189K size claims.

| State | Actual persistence |
|---|---|
| Backend dataset | CSV read at startup; CRUD changes to records are in memory, not CSV write-through |
| Lots, movements, QA, heats, gate history, operational audit | Process memory in B/premeltGate/store.js; reseeded on restart/reset |
| Supplier history | Deterministic demo seed in supplierHistory.js, with scoring recomputed from available records |
| PRs, invoices, energy actuals, mutable price/config/grade data | In-memory module state; not durable business records |
| Audit trail | store.log keeps at most 500 events; API defaults to returning 100 |
| Current browser heat and results | sessionStorage key metallisense.meltFlow.v1, per tab; gate, anomaly, alloy, RL, accepted strategy and mechanical/tap state |
| RL reward model/state and feedback | Disk artifacts in A/app/models and A/app/data/rl_feedback_log.jsonl |
| Handheld inspection export | CSV file in B/premeltGate/gun_exports, separate from in-memory session state |
| Vector fallback | In-memory cosine store; not durable Actian storage |
| Auth | Guest stub; typed operator/engineer identities are not authenticated roles |

A refresh can restore browser state while the backend has restarted/reset and lost that heat. sessionStorage is not server persistence or multi-user synchronization. sales.js has a resume path for an existing PLANNED heat, not complete recovery of missing heat records. Reset calls /premelt/demo/reset and invokes business-store seed hooks; it is not a universal reset of every module, browser session or Python model.

## Integrations and configuration

Configuration inspection recorded names/presence only; no secret values were copied. A's .env selects Groq and ElevenLabs; Groq/ElevenLabs keys and voice/model variables are nonempty. AI's .env also contains those names, but active copilot/voice routes live in A. A localhost voice status GET reported ElevenLabs configured and STT available; actual provider authentication/audio were not tested.

| Area | Variables / behavior |
|---|---|
| Frontend shared API | VITE_API_BASE_URL (default http://localhost:3000/api/v2), VITE_API_TIMEOUT (30000) |
| Frontend direct services | VITE_COPILOT_BASE_URL (8001), VITE_VECTORSEARCH_BASE_URL (8002) |
| Mechanical page | VITE_API_URL (default http://localhost:3000), separately appends /api/v2/mechanical/predict |
| Backend config.env | PORT, DATA_CSV, AI_SERVICE_URL (8000), AGENT_SERVICE_URL (127.0.0.1:8001) |
| Mechanical proxy | AI_ENGINE_URL or AI_API_URL (8000); does NOT use AI_SERVICE_URL |
| Gun simulator | GUN_OPCUA_PORT (4335), GUN_STEP_MS (350) |
| Email | GMAIL_USER, GMAIL_APP_PASSWORD, OWNER_EMAIL; all nonempty in config.env; nodemailer real-email path exists |
| Copilot | COPILOT_PROVIDER chooses groq (default), gemini or claude; GROQ_API_KEY/GROQ_MODEL, GOOGLE_GEMINI_API_KEY/GEMINI_MODEL, ANTHROPIC_API_KEY/ANTHROPIC_MODEL |
| Voice | TTS_PROVIDER, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL; STT uses GROQ_API_KEY |
| Vector | VECTORAI_HOST (localhost:50051); standalone also TRAINING_DATA_CSV, EMBEDDING_MODEL (all-MiniLM-L6-v2), MAX_TRAINING_ROWS (5000) |
| Legacy Firebase | VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID; not active authentication |

Provider dispatch is in A/app/copilot/__init__.py. Groq, Gemini and Claude are alternatives, not an automatic cross-provider failover chain. If copilot initialization fails, startup catches it and copilot endpoints remain unavailable. Model identifiers in source/env are configuration, not proof that external providers currently support them.

Voice initializes separately: missing Groq key disables transcription, not TTS. voice_service.py tries ElevenLabs, then gTTS; ReadAloud.jsx falls back to browser speech if server TTS/playback fails. ElevenLabs and gTTS need network access. AI/eleven.py now reads its key from environment; it is an external smoke-test script and requires the ElevenLabs SDK, not the production voice path (which uses requests). check_keys.py makes live provider calls and can write an MP3: never treat it as a harmless configuration-only check.

V uses SentenceTransformer (384-dimensional default). A's embedded vector search instead uses TF-IDF + TruncatedSVD (64-dimensional). Both adapters attempt Actian and include NumPy cosine fallbacks. Actian SDK/server compatibility and deployment were not verified. Standalone embeddings may need an initial model download; optional search is not guaranteed offline on a fresh machine.

Secret-bearing local env files and AI/metallisense-node.pem are present. Do not print, duplicate, commit or embed their contents. Key validity and repository tracking history are unknown (this workspace is not a Git checkout).

## Reported feature verification

"Present" here means inspected source, not a full browser/operational test.

| Reported capability/change | Finding |
|---|---|
| Pre-Melt Gate, risk/checks, revised header, progress, heats and audit | Present; safe GETs for heats/audit returned HTTP 200 |
| Scrap assessment, supplier evaluation, runners/risers returned to inventory | Implemented demo workflows; real instrument/bulk-quality accuracy and physical recovery not verified |
| Alloy completion shared across pages | Recommendation calls alloyDone; MeltFlowContext exposes sequencing state |
| Gate and manual strategy comparison | Present in RLOptimizer; comparison driven by results rather than excluding gate source |
| Conservative/balanced/aggressive, metrics and best indicators | Present; composite and reward ranking differ as explained above |
| RL results survive navigation/current heat survives refresh | Context restoration plus sessionStorage implemented for active gate heat; manual-only results are local component state |
| Accept & Deduct Stock missing-function fix | deductAdditives import/export and API route exist; correctness still broken in the ways listed below |
| Run RL on gate composition / Re-score | Present |
| Read comparison / Read decision | Present in StrategyComparison and PreMeltGate |
| ElevenLabs -> gTTS -> browser; Groq-independent TTS | Present; live audio not exercised |
| Key moved out of eleven.py; check_keys.py and TORUN.md | Present; key values not reproduced, live checks intentionally not invoked |
| Continue to AI analysis for new/already started heat | Both code paths present; no operational/browser test |
| Reset label/confirmation/success text | Present; still calls resetDemo; historical equivalence cannot be proven without a prior revision |
| Inventory, scorecard, heat history | Present; associated read-only APIs responded, but data durability and demo provenance limits apply |
| Audit Trail full-width/alignment/responsiveness request | PENDING; no layout changes made |

## Important gaps and contradictions (do not silently fix during onboarding)

1. Stock timing mismatch: gateEngine.startMelting deducts raw charge immediately. MeltFlowContext comments and PreMeltGate's "Charge reserved" message say deduction waits for strategy acceptance. The executable backend behavior wins.
2. RLOptimizer.handleFeedback deducts flow.suggestedAdditions from the gate, not quantities derived from the accepted conservative/balanced/aggressive candidate. In the deduction-error catch it still calls acceptStrategy, which sets stockStatus='deducted', and emits a success toast containing the error. Feedback learning already occurred before this failure.
3. FullAnalysis.handleFeedback calls acceptStrategy and displays "stock deducted" without calling deductAdditives. Thus the two acceptance paths do not perform the same stock transaction.
4. premelt/additives/deduct mutates lines sequentially; there is no all-lines validation/rollback/idempotency token, and finite positive kg is not enforced there. A later-line failure can leave earlier deductions applied; retries can duplicate movements. These are source findings, not executed mutation tests.
5. Backend state is volatile, and browser/session identity is not reconciled reliably after reset/restart. sales.completeHeat's resume path can deduct available quantities for an existing PLANNED heat without rerunning the normal gate interlock; it trusts browser-submitted completion data.
6. MechanicalProperties.runPrediction returns on successful API response before resetting loading=false; only the fallback path clears it. Likely stuck-loading UI on API success; identified statically, not browser-reproduced.
7. Configuration split: mechanical page/proxy use different URL variables from shared API/proxy. Overriding only VITE_API_BASE_URL or AI_SERVICE_URL will not redirect those mechanical calls.
8. B proxies /ai/analyze-with-explanation and /ai/what-if to A /analyze-with-explanation and /copilot/what-if, which have no matching route in inspected A/app/main.py. Existing client/helper presence should not be mistaken for complete functionality.
9. B individual/agent analysis wrappers may return HTTP 200/status success with serviceAvailable=false and null results. Check nested availability/errors; a successful transport envelope is not successful inference.
10. No authentication/RBAC; open CORS; operator/engineer names and maker-checker rules are typed input. UI locks and "requires_human_approval" metadata are not authenticated backend authorization.
11. Duplicated grade limits, formula mechanics, model copies and hardcoded prices/yields/carbon factors can drift. Custom backend grades are not automatically learned by the Python models; UI comparison has only five hardcoded grade specs. Reward model one-hot feature count can also change when adding a new grade.
12. Costs include illustrative strategy premiums; carbon/energy/savings and generated supplier histories are demonstrations, not certified LCA, live market prices or production proof. Formula-based mechanical pass/fail is not material certification.
13. Existing TORUN claims past end-to-end success and root documentation labels secrets "checked-in"; neither past execution nor Git tracking can be independently established here. Do not turn old checklists/comments into new evidence.

## Startup and development

Use the active directories above in separate terminals, not a backup. Python 3.11 is the intended runtime; both existing AI/Agent venvs report Python 3.11.9. The default system launcher is Python 3.12, so use py -3.11 explicitly when creating a new venv. Local Node is v22.13.0 and npm 11.11.1; installed Vite is 7.3.6 and requires Node ^20.19.0 or >=22.12.0 (verified from its local package metadata).

Commands below assume each terminal is already in the indicated service root:

| Service | Existing environment | Fresh setup, when needed |
|---|---|---|
| B | npm start | npm install |
| AI | .\venv\Scripts\python.exe -X utf8 app\main.py | py -3.11 -m venv venv; .\venv\Scripts\python.exe -m pip install -r requirements.txt |
| A | .\venv\Scripts\python.exe -X utf8 app\main.py | Same commands, in A's own directory |
| V (optional) | python -X utf8 main.py in its configured environment | Create Python 3.11 venv; install its requirements.txt |
| F | npm run dev | npm install; npm run build for production output |

Backend boots the simulated spectrometer and gun support; no separate simulator terminal is normally needed. Start B, AI and A for core workflows and F for UI; V is only needed for standalone Semantic Search. Gate risk needs A, basic anomaly/alloy needs AI, and full analysis uses both. Check actual backend listening port if 3000 is occupied; align all relevant frontend/service variables, including the separate mechanical variables.

Python requirements pin FastAPI 0.104.1, scikit-learn 1.3.2, NumPy 1.26.2, pandas 2.1.4, joblib 1.3.2 and related dependencies. A additionally includes Groq/gTTS/requests and unpinned optional anthropic/google-genai packages. A fresh dependency resolution was not performed; installed-environment success does not prove a fresh install succeeds today.

Useful read-only checks:
- B: node verify.js (basic HTTP/shape checks, not comprehensive integration assertions).
- GET B /api/v1/health and /api/v2/grades.
- GET AI /health; GET A /health and /copilot/voice/status.
- GET V /health for optional search.
- Frontend production build. Avoid overwriting existing dist during a documentation-only review; use a separate output directory.

Existing AI test_api.py/validate_models.py and A test_agent_system.py/test_diagnostic.py require services and perform prediction requests. test_copilot.py and check_keys.py call external providers; do not run them without appropriate task scope. Training scripts overwrite model artifacts; RL feedback endpoints update learning state. Do not run reset, stock, furnace, tap, email, provider or retraining actions merely to establish context.

## Validation performed on 2026-09-28

- Inspected source, existing documentation, package manifests, model/dataset presence, environment variable presence and API wiring. Dependencies/build outputs/backups were excluded from primary source review.
- Python AST parsing: 78 active project Python files, zero syntax errors; no application import or bytecode write for this scan.
- Backend node --check: 32 JavaScript files, zero syntax failures.
- Frontend: direct local Vite production build passed, 2,751 modules; output in the system temporary folder metallisense-onboarding-build-20260928. Existing dist was preserved. Warning: generated JS chunk about 1.29 MB, above 500 kB warning threshold. First npm-wrapper attempt misparsed --outDir and failed; direct Vite invocation resolved command invocation, not source code.
- Local AI venv smoke: anomaly and alloy artifacts loaded, one LOW-CARBON-STEEL composition returned expected result keys; formula mechanical prediction returned PASS. This single sample establishes executability, not accuracy.
- Local Agent venv smoke: loaded alloy/reward artifacts and proposed all three strategies without feedback. Reward model fitted, 60,055 existing updates.
- Initial Python smoke failed on a Unicode checkmark printed to cp1252 stdout; rerun with UTF-8 stdout passed. Use -X utf8 in Windows service commands.
- Existing running localhost services: node verify.js passed all six required backend checks and AI health/proxy, Agent docs and RL status checks; optional V:8002 health unreachable. Some verifier checks accept any structured status and are weak evidence.
- Additional read-only GETs returned HTTP 200 for premelt/heats, premelt/audit, insights/suppliers/scorecard, insights/energy/summary, inventory/forecast, sales/heats, A /health and A /copilot/voice/status. Only shapes/configuration status were examined. Running processes were not started/restarted and their launch directories were not independently identified.
- NOT verified: browser rendering/navigation/refresh, transactional inventory correctness, gate start/override execution, real OPC devices, end-to-end heat completion, live voice/LLM/email credentials, mechanical ML accuracy, real Actian connection, fresh install or production suitability.
- No email, deduction, reset, furnace/tap action, paid provider request, model feedback or retraining was performed. No application source/config/data edits were made.

## Pending Audit Trail UI task

User request: "Make the Audit Trail span the full available content width, from the left content margin to the right content margin, with the heading and entries aligned left, consistent padding, and responsive behavior."

Status: recorded only, NOT implemented. Enough source context is available to begin a focused UI task when requested.

Primary file: F/src/pages/PreMeltGate.jsx, Audit trail Card near line 618. It is already outside the earlier lg:grid-cols-[16rem_1fr] heats/charge grid in the inspected JSX. Entries use grid-cols-[6.5rem_12rem_1fr] without a mobile breakpoint; do not assume moving it out of the sidebar grid alone is the fix.

Related files: F/src/components/common/Card.jsx (header px-6 py-4, body p-6, title accent/gap), F/src/components/layout/MainLayout.jsx (main p-6, fixed sidebar offset), F/src/App.css and src/index.css for inherited alignment/width. Inspect rendered behavior before choosing the smallest layout adjustment; preserve unrelated pages, reset behavior, gate checks and approval controls. Verify full content-width alignment, heading/entry left alignment, wrapping at narrow widths and frontend build. Do not represent this request as completed until implemented and checked.

