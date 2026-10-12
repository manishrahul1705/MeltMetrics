# Browser mock coverage

Source inventory recorded before implementation. Backend source is the authority; no service was called to create this inventory.

## Routes

| Route | Page file |
|---|---|
| /login | src/pages/Login.jsx |
| /signup | src/pages/Signup.jsx |
| /dashboard | src/pages/Dashboard.jsx |
| /anomaly | src/pages/AnomalyDetection.jsx |
| /recommendation | src/pages/Recommendation.jsx |
| /rl-optimizer | src/pages/RLOptimizer.jsx |
| /agent | src/pages/AIAgent.jsx |
| /grades | src/pages/GradeSpecs.jsx |
| /synthetic | src/pages/SyntheticData.jsx |
| /spectrometer | src/pages/Spectrometer.jsx |
| /training-data | src/pages/TrainingData.jsx |
| /semantic-search | src/pages/SemanticSearch.jsx |
| /cost-analysis | src/pages/CostAnalysis.jsx |
| /full-analysis | src/pages/FullAnalysis.jsx |
| /mechanical-properties | src/pages/MechanicalProperties.jsx |
| /raw-material-stock | src/pages/RawMaterialStock.jsx |
| /yard-inspection | src/pages/YardInspection.jsx |
| /premelt-gate | src/pages/PreMeltGate.jsx |
| /supplier-scorecard | src/pages/SupplierScorecard.jsx |
| /energy | src/pages/EnergyDashboard.jsx |
| /inventory-forecast | src/pages/InventoryForecast.jsx |
| /sales | src/pages/SalesInvoices.jsx |

## Network and environment call sites

| Caller | Line | Call / URL / polling | Status |
|---|---:|---|---|
| src\components\premelt\premeltUi.jsx | 41 | `err?.response?.data?.message // (err?.code === "ERR_NETWORK" ? "Backend not reachable on :3000" : err?.message) // fallback;` | pending |
| src\config\firebase.js | 6 | `apiKey: import.meta.env.VITE_FIREBASE_API_KEY,` | pending |
| src\config\firebase.js | 7 | `authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,` | pending |
| src\config\firebase.js | 8 | `projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,` | pending |
| src\config\firebase.js | 9 | `storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,` | pending |
| src\config\firebase.js | 10 | `messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,` | pending |
| src\config\firebase.js | 11 | `appId: import.meta.env.VITE_FIREBASE_APP_ID,` | pending |
| src\context\OPCContext.jsx | 7 | `import { OPC_POLL_INTERVAL } from "../utils/constants";` | pending |
| src\context\OPCContext.jsx | 59 | `const interval = setInterval(checkStatus, OPC_POLL_INTERVAL);` | pending |
| src\pages\EnergyDashboard.jsx | 47 | `const [heatId, setHeatId] = useState(params.get("heat") // current[0]?.heatId // heats[0]?.heatId // "");` | pending |
| src\pages\InventoryForecast.jsx | 499 | `const [detail, setDetail] = useState(params.get("item") // null);` | pending |
| src\pages\MechanicalProperties.jsx | 27 | `const API_BASE = import.meta.env.VITE_API_URL // "http://localhost:3000";` | pending |
| src\pages\MechanicalProperties.jsx | 218 | `const res = await fetch(`${API_BASE}/api/v2/mechanical/predict`, {` | pending |
| src\pages\PreMeltGate.jsx | 149 | `useEffect(() => { const t = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(t); }, []);` | pending |
| src\pages\RawMaterialStock.jsx | 446 | `const prId = params.get("pr");` | pending |
| src\pages\SalesInvoices.jsx | 342 | `const hid = params.get("heat");` | pending |
| src\pages\YardInspection.jsx | 25 | `const [form, setForm] = useState({ lotId: params.get("lot") // "", device: "XRF", pieces: 15, surfacePrepared: false, inspector: "" });` | pending |
| src\pages\YardInspection.jsx | 49 | `timer.current = setInterval(async () => {` | pending |
| src\pages\YardInspection.jsx | 132 | `<p className="font-mono text-[11px] text-metal-500 mt-2 break-all">{status?.server?.endpoint // "opc.tcp://localhost:4335/MetalliSense/HandheldGun"}</p>` | pending |
| src\services\aiService.js | 4 | `export const checkAIHealth = () => api.get("/ai/health");` | pending |
| src\services\aiService.js | 9 | `const response = await api.post("/ai/anomaly/predict", data);` | pending |
| src\services\aiService.js | 16 | `api.post("/ai/individual/analyze", data);` | pending |
| src\services\aiService.js | 19 | `export const analyzeAgent = (data) => api.post("/ai/agent/analyze", data);` | pending |
| src\services\aiService.js | 24 | `api.post("/ai/analyze-with-explanation", data);` | pending |
| src\services\aiService.js | 27 | `export const explainResult = (data) => api.post("/ai/explain", data);` | pending |
| src\services\aiService.js | 30 | `export const whatIfAnalysis = (data) => api.post("/ai/what-if", data);` | pending |
| src\services\api.js | 7 | `baseURL: import.meta.env.VITE_API_BASE_URL // "http://localhost:3000/api/v2",` | pending |
| src\services\api.js | 8 | `timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) // 30000,` | pending |
| src\services\copilotService.js | 5 | `baseURL: import.meta.env.VITE_COPILOT_BASE_URL // "http://localhost:8001",` | pending |
| src\services\copilotService.js | 18 | `copilotApi.post("/copilot/explain", data);` | pending |
| src\services\copilotService.js | 27 | `copilotApi.post("/copilot/chat", {` | pending |
| src\services\copilotService.js | 37 | `copilotApi.delete("/copilot/chat/history");` | pending |
| src\services\copilotService.js | 52 | `return copilotApi.post("/copilot/voice/transcribe", formData, {` | pending |
| src\services\copilotService.js | 67 | `const response = await copilotApi.post(` | pending |
| src\services\copilotService.js | 86 | `copilotApi.get("/copilot/voice/languages");` | pending |
| src\services\copilotService.js | 92 | `export const checkCopilotHealth = () => copilotApi.get("/health");` | pending |
| src\services\copilotService.js | 99 | `const response = await copilotApi.post(` | pending |
| src\services\copilotService.js | 107 | `export const getVoiceStatus = () => copilotApi.get("/copilot/voice/status");` | pending |
| src\services\costService.js | 4 | `export const getPrices = () => api.get("/cost/prices");` | pending |
| src\services\costService.js | 6 | `export const updatePrices = (updates) => api.patch("/cost/prices", updates);` | pending |
| src\services\costService.js | 8 | `export const estimateCost = (payload) => api.post("/cost/estimate", payload);` | pending |
| src\services\costService.js | 12 | `api.get(`/cost/history?limit=${limit}${grade ? `&grade=${grade}` : ""}`);` | pending |
| src\services\gradeService.js | 4 | `export const getAllGrades = (params) => api.get("/grades", { params });` | pending |
| src\services\gradeService.js | 7 | `export const createGrade = (data) => api.post("/grades", data);` | pending |
| src\services\gradeService.js | 10 | `export const getGradeByName = (gradeName) => api.get(`/grades/${gradeName}`);` | pending |
| src\services\gradeService.js | 14 | `api.get(`/grades/${gradeName}/composition`);` | pending |
| src\services\gradeService.js | 17 | `export const updateGrade = (id, data) => api.patch(`/grades/${id}`, data);` | pending |
| src\services\gradeService.js | 20 | `export const deleteGrade = (id) => api.delete(`/grades/${id}`);` | pending |
| src\services\gradeSpecService.js | 4 | `export const getAllGradeSpecs = () => api.get("/grades");` | pending |
| src\services\gradeSpecService.js | 7 | `export const getGradeSpecById = (id) => api.get(`/grades/${id}`);` | pending |
| src\services\gradeSpecService.js | 11 | `api.get(`/grades/${gradeName}`);` | pending |
| src\services\gradeSpecService.js | 15 | `api.get(`/grades/${gradeName}/composition`);` | pending |
| src\services\gradeSpecService.js | 18 | `export const createGradeSpec = (data) => api.post("/grades", data);` | pending |
| src\services\gradeSpecService.js | 21 | `export const updateGradeSpec = (id, data) => api.patch(`/grades/${id}`, data);` | pending |
| src\services\gradeSpecService.js | 24 | `export const deleteGradeSpec = (id) => api.delete(`/grades/${id}`);` | pending |
| src\services\insightsService.js | 7 | `api.get(`${P}/suppliers/scorecard`, { params: materialType ? { materialType } : {} });` | pending |
| src\services\insightsService.js | 9 | `api.get(`${P}/suppliers/detail`, { params: { name, materialType } });` | pending |
| src\services\insightsService.js | 10 | `export const getLotSupplierGrade = (lotId) => api.get(`${P}/suppliers/lot-grade/${lotId}`);` | pending |
| src\services\insightsService.js | 11 | `export const updateSupplierWeights = (weights) => api.patch(`${P}/suppliers/weights`, weights);` | pending |
| src\services\insightsService.js | 13 | `export const getEnergyForHeat = (heatId, params = {}) => api.get(`${P}/energy/heat/${heatId}`, { params });` | pending |
| src\services\insightsService.js | 14 | `export const recordHeatEnergy = (heatId, data) => api.post(`${P}/energy/heat/${heatId}/actual`, data);` | pending |
| src\services\insightsService.js | 15 | `export const simulateHeatEnergy = (heatId) => api.post(`${P}/energy/heat/${heatId}/simulate`, {});` | pending |
| src\services\insightsService.js | 16 | `export const getEnergySummary = () => api.get(`${P}/energy/summary`);` | pending |
| src\services\insightsService.js | 17 | `export const getEnergyConfig = () => api.get(`${P}/energy/config`);` | pending |
| src\services\insightsService.js | 18 | `export const updateEnergyConfig = (patch) => api.patch(`${P}/energy/config`, patch);` | pending |
| src\services\insightsService.js | 21 | `export const getSupplierAhp = () => api.get(`${P}/suppliers/ahp`);` | pending |
| src\services\insightsService.js | 22 | `export const updateSupplierAhp = (judgements, apply = true) => api.patch(`${P}/suppliers/ahp`, { judgements, apply });` | pending |
| src\services\insightsService.js | 23 | `export const getOrderPlan = (materialType, tonnes) => api.get(`${P}/suppliers/order-plan`, { params: { materialType, tonnes } });` | pending |
| src\services\insightsService.js | 24 | `export const getSupplierAlerts = (materialType) => api.get(`${P}/suppliers/alerts`, { params: materialType ? { materialType } : {} });` | pending |
| src\services\inventoryService.js | 6 | `export const getInventoryForecast = () => api.get(`${P}/forecast`);` | pending |
| src\services\inventoryService.js | 7 | `export const getInventoryItem = (item) => api.get(`${P}/forecast/${encodeURIComponent(item)}`);` | pending |
| src\services\inventoryService.js | 8 | `export const getReorderSuggestions = () => api.get(`${P}/reorder-suggestions`);` | pending |
| src\services\inventoryService.js | 9 | `export const getPurchaseRequests = (params = {}) => api.get(`${P}/purchase-requests`, { params });` | pending |
| src\services\inventoryService.js | 10 | `export const getPurchaseRequest = (prId) => api.get(`${P}/purchase-requests/${encodeURIComponent(prId)}`);` | pending |
| src\services\inventoryService.js | 11 | `export const createPurchaseRequest = (data) => api.post(`${P}/purchase-requests`, data);` | pending |
| src\services\inventoryService.js | 12 | `export const approvePurchaseRequest = (prId, by) => api.post(`${P}/purchase-requests/${prId}/approve`, { by });` | pending |
| src\services\inventoryService.js | 13 | `export const rejectPurchaseRequest = (prId, by, reason) => api.post(`${P}/purchase-requests/${prId}/reject`, { by, reason });` | pending |
| src\services\inventoryService.js | 14 | `export const receivePurchaseRequest = (prId, lotId, by) => api.post(`${P}/purchase-requests/${prId}/receive`, { lotId, by });` | pending |
| src\services\inventoryService.js | 15 | `export const getInventoryConfig = () => api.get(`${P}/config`);` | pending |
| src\services\inventoryService.js | 16 | `export const updateInventoryConfig = (patch) => api.patch(`${P}/config`, patch);` | pending |
| src\services\opcService.js | 4 | `export const getOPCStatus = () => api.get("/synthetic/opc-status");` | pending |
| src\services\opcService.js | 7 | `export const connectOPC = () => api.post("/synthetic/opc-connect");` | pending |
| src\services\opcService.js | 10 | `export const disconnectOPC = () => api.post("/synthetic/opc-disconnect");` | pending |
| src\services\opcService.js | 14 | `api.post("/synthetic/generate-synthetic", data);` | pending |
| src\services\premeltService.js | 8 | `export const getStockSummary = () => api.get(`${P}/summary`);` | pending |
| src\services\premeltService.js | 9 | `export const getLots = (params = {}) => api.get(`${P}/lots`, { params });` | pending |
| src\services\premeltService.js | 10 | `export const getLot = (lotId) => api.get(`${P}/lots/${lotId}`);` | pending |
| src\services\premeltService.js | 11 | `export const receiveLot = (data) => api.post(`${P}/lots`, data);` | pending |
| src\services\premeltService.js | 12 | `export const setLotStatus = (lotId, data) => api.patch(`${P}/lots/${lotId}/status`, data);` | pending |
| src\services\premeltService.js | 13 | `export const adjustStock = (lotId, data) => api.post(`${P}/lots/${lotId}/adjust`, data);` | pending |
| src\services\premeltService.js | 14 | `export const getMovements = (lotId) => api.get(`${P}/movements`, { params: { lotId } });` | pending |
| src\services\premeltService.js | 15 | `export const getAdditives = () => api.get(`${P}/additives`);` | pending |
| src\services\premeltService.js | 18 | `export const enterDriQa = (lotId, data) => api.post(`${P}/lots/${lotId}/dri-qa`, data);` | pending |
| src\services\premeltService.js | 19 | `export const approveDriQa = (qaId, approver) => api.post(`${P}/dri-qa/${qaId}/approve`, { approver });` | pending |
| src\services\premeltService.js | 20 | `export const rejectDriQa = (qaId, approver, reason) => api.post(`${P}/dri-qa/${qaId}/reject`, { approver, reason });` | pending |
| src\services\premeltService.js | 23 | `export const getGunStatus = () => api.get(`${P}/gun/status`);` | pending |
| src\services\premeltService.js | 24 | `export const connectGun = () => api.post(`${P}/gun/connect`);` | pending |
| src\services\premeltService.js | 25 | `export const disconnectGun = () => api.post(`${P}/gun/disconnect`);` | pending |
| src\services\premeltService.js | 26 | `export const startInspection = (data) => api.post(`${P}/gun/inspect`, data);` | pending |
| src\services\premeltService.js | 27 | `export const getGunLive = () => api.get(`${P}/gun/live`);` | pending |
| src\services\premeltService.js | 28 | `export const replaceArgon = () => api.post(`${P}/gun/argon/replace`);` | pending |
| src\services\premeltService.js | 29 | `export const getScenarios = () => api.get(`${P}/gun/scenarios`);` | pending |
| src\services\premeltService.js | 30 | `export const getGunSessions = (lotId) => api.get(`${P}/gun/sessions`, { params: { lotId } });` | pending |
| src\services\premeltService.js | 31 | `export const ingestGunCsv = (csv, inspector) => api.post(`${P}/gun/ingest-csv`, { csv, inspector });` | pending |
| src\services\premeltService.js | 35 | `export const getHeats = () => api.get(`${P}/heats`);` | pending |
| src\services\premeltService.js | 36 | `export const getHeat = (heatId) => api.get(`${P}/heats/${heatId}`);` | pending |
| src\services\premeltService.js | 37 | `export const planHeat = (data) => api.post(`${P}/heats`, data);` | pending |
| src\services\premeltService.js | 38 | `export const updateCharge = (heatId, data) => api.put(`${P}/heats/${heatId}/charge`, data);` | pending |
| src\services\premeltService.js | 39 | `export const runGateCheck = (heatId, by) => api.post(`${P}/heats/${heatId}/gate-check`, { by });` | pending |
| src\services\premeltService.js | 40 | `export const startMelting = (heatId, data) => api.post(`${P}/heats/${heatId}/start-melting`, data);` | pending |
| src\services\premeltService.js | 42 | `export const getPremeltConfig = () => api.get(`${P}/config`);` | pending |
| src\services\premeltService.js | 45 | `export const deductAdditives = (lines) => api.post(`${P}/additives/deduct`, { lines });` | pending |
| src\services\premeltService.js | 46 | `export const receiveFerroalloy = (data) => api.post(`${P}/additives/receive`, data);` | pending |
| src\services\premeltService.js | 47 | `export const getAudit = (limit = 50) => api.get(`${P}/audit`, { params: { limit } });` | pending |
| src\services\premeltService.js | 48 | `export const resetDemo = () => api.post(`${P}/demo/reset`);` | pending |
| src\services\rlService.js | 7 | `api.post("/rl/optimize", { grade, composition, topK, ...(batchWeightKg ? { batchWeightKg } : {}) });` | pending |
| src\services\rlService.js | 10 | `api.post("/rl/feedback", payload);` | pending |
| src\services\rlService.js | 12 | `export const rlPolicyStatus = () => api.get("/rl/policy/status");` | pending |
| src\services\rlService.js | 15 | `api.get(`/rl/feedback?limit=${limit}`);` | pending |
| src\services\salesService.js | 6 | `export const completeHeat = (heatId, data) => api.post(`${P}/heats/${heatId}/complete`, data);` | pending |
| src\services\salesService.js | 7 | `export const getFinishedHeats = () => api.get(`${P}/heats`);` | pending |
| src\services\salesService.js | 8 | `export const getCertificate = (heatId) => api.get(`${P}/certificates/${heatId}`);` | pending |
| src\services\salesService.js | 9 | `export const getCustomers = () => api.get(`${P}/customers`);` | pending |
| src\services\salesService.js | 10 | `export const getInvoices = () => api.get(`${P}/invoices`);` | pending |
| src\services\salesService.js | 11 | `export const createInvoice = (data) => api.post(`${P}/invoices`, data);` | pending |
| src\services\salesService.js | 12 | `export const getSalesConfig = () => api.get(`${P}/config`);` | pending |
| src\services\salesService.js | 13 | `export const updateSalesConfig = (patch) => api.patch(`${P}/config`, patch);` | pending |
| src\services\semanticSearchService.js | 5 | `baseURL: import.meta.env.VITE_VECTORSEARCH_BASE_URL // "http://localhost:8002",` | pending |
| src\services\semanticSearchService.js | 10 | `export const getSemanticSearchHealth = () => vectorSearchApi.get("/health");` | pending |
| src\services\semanticSearchService.js | 18 | `vectorSearchApi.post("/semantic-search", { query, collection, limit });` | pending |
| src\services\semanticSearchService.js | 20 | `export const reindex = () => vectorSearchApi.post("/reindex");` | pending |
| src\services\spectrometerService.js | 5 | `api.get("/api/v1/spectrometer/opc-status");` | pending |
| src\services\spectrometerService.js | 9 | `api.post("/api/v1/spectrometer/opc-connect");` | pending |
| src\services\spectrometerService.js | 13 | `api.post("/api/v1/spectrometer/opc-disconnect");` | pending |
| src\services\spectrometerService.js | 17 | `api.post("/api/v1/spectrometer/opc-reading");` | pending |
| src\services\spectrometerService.js | 21 | `api.get("/api/v1/spectrometer", { params });` | pending |
| src\services\spectrometerService.js | 24 | `export const createReading = (data) => api.post("/api/v1/spectrometer", data);` | pending |
| src\services\spectrometerService.js | 27 | `export const getReading = (id) => api.get(`/api/v1/spectrometer/${id}`);` | pending |
| src\services\spectrometerService.js | 30 | `export const deleteReading = (id) => api.delete(`/api/v1/spectrometer/${id}`);` | pending |
| src\services\trainingDataService.js | 5 | `api.get("/training-data/paginated", { params });` | pending |
| src\services\trainingDataService.js | 9 | `api.get("/training-data", { params });` | pending |
| src\services\trainingDataService.js | 13 | `api.get(`/training-data/grade/${gradeName}`, { params });` | pending |
| src\services\trainingDataService.js | 17 | `api.get(`/training-data/grade/${gradeName}/statistics`);` | pending |
| src\services\trainingDataService.js | 20 | `export const createTrainingData = (data) => api.post("/training-data", data);` | pending |
| src\services\trainingDataService.js | 24 | `api.patch(`/training-data/${id}`, data);` | pending |
| src\services\trainingDataService.js | 27 | `export const deleteTrainingData = (id) => api.delete(`/training-data/${id}`);` | pending |
| src\services\trainingDataService.js | 31 | `api.get("/training-data/visualizations", { params });` | pending |
| src\services\vectorSearchService.js | 5 | `getStatus: () => api.get("/vector/status"),` | pending |
| src\services\vectorSearchService.js | 6 | `search: (query, topK = 5) => api.post("/vector/search", { query, top_k: topK }),` | pending |
| src\services\vectorSearchService.js | 7 | `reindex: () => api.post("/vector/reindex"),` | pending |
| src\services\vectorSearchService.js | 8 | `addMemory: (text, metadata) => api.post("/vector/memory/add", { text, metadata }),` | pending |
| src\services\vectorSearchService.js | 9 | `recallMemory: (query, topK = 3) => api.post("/vector/memory/recall", { query, top_k: topK }),` | pending |
| src\services\workflowService.js | 10 | `api.post("/workflow/full-analysis", { metalGrade, composition, batchWeightKg, topK });` | pending |
| src\utils\constants.js | 39 | `export const OPC_POLL_INTERVAL = 3000;` | pending |

## Backend endpoints

| Method | Mounted path | Backend handler | Browser handler | Fidelity |
|---|---|---|---|---|
| GET | /api/v1/health | server.js:34 | pending | pending |
| GET | /api/v2/alerts/email-status | server.js:39 | pending | pending |
| POST | /api/v2/alerts/send-email | server.js:52 | pending | pending |
| GET | /api/v2/training-data/paginated | server.js:65 | pending | pending |
| GET | /api/v2/training-data/visualizations | server.js:100 | pending | pending |
| GET | /api/v2/training-data/grade/:gradeName/statistics | server.js:154 | pending | pending |
| GET | /api/v2/training-data/grade/:gradeName | server.js:176 | pending | pending |
| GET | /api/v2/training-data/ | server.js:185 | pending | pending |
| POST | /api/v2/training-data/ | server.js:190 | pending | pending |
| GET | /api/v2/training-data/:id | server.js:194 | pending | pending |
| PATCH | /api/v2/training-data/:id | server.js:200 | pending | pending |
| DELETE | /api/v2/training-data/:id | server.js:206 | pending | pending |
| GET | /api/v2/grades/ | server.js:217 | pending | pending |
| POST | /api/v2/grades/ | server.js:222 | pending | pending |
| GET | /api/v2/grades/:gradeName/composition | server.js:227 | pending | pending |
| GET | /api/v2/grades/:gradeName | server.js:233 | pending | pending |
| PATCH | /api/v2/grades/:id | server.js:239 | pending | pending |
| DELETE | /api/v2/grades/:id | server.js:245 | pending | pending |
| GET | /api/v2/synthetic/opc-status | server.js:287 | pending | pending |
| POST | /api/v2/synthetic/opc-connect | server.js:291 | pending | pending |
| POST | /api/v2/synthetic/opc-disconnect | server.js:300 | pending | pending |
| POST | /api/v2/synthetic/opc-reading | server.js:309 | pending | pending |
| POST | /api/v2/synthetic/generate-synthetic | server.js:318 | pending | pending |
| GET | /api/v2/synthetic/ | server.js:333 | pending | pending |
| POST | /api/v2/synthetic/ | server.js:337 | pending | pending |
| GET | /api/v2/synthetic/:id | server.js:343 | pending | pending |
| DELETE | /api/v2/synthetic/:id | server.js:349 | pending | pending |
| GET | /synthetic/... | server.js:357 | pending | pending |
| GET | /api/v1/spectrometer/... | server.js:359 | pending | pending |
| GET | /api/v2/ai/health | server.js:388 | pending | pending |
| POST | /api/v2/ai/anomaly/predict | server.js:389 | pending | pending |
| POST | /api/v2/ai/individual/analyze | server.js:390 | pending | pending |
| POST | /api/v2/ai/agent/analyze | server.js:435 | pending | pending |
| POST | /api/v2/ai/explain | server.js:476 | pending | pending |
| POST | /api/v2/ai/analyze-with-explanation | server.js:491 | pending | pending |
| POST | /api/v2/ai/what-if | server.js:492 | pending | pending |
| GET | /api/v2/ai/gemini/health | server.js:493 | pending | pending |
| POST | /api/v2/workflow/full-analysis | server.js:501 | pending | pending |
| POST | /api/v2/rl/optimize | server.js:761 | pending | pending |
| POST | /api/v2/rl/feedback | server.js:802 | pending | pending |
| GET | /api/v2/rl/policy/status | server.js:825 | pending | pending |
| GET | /api/v2/rl/feedback | server.js:836 | pending | pending |
| GET | /api/v2/vector/status | server.js:845 | pending | pending |
| POST | /api/v2/vector/reindex | server.js:846 | pending | pending |
| POST | /api/v2/vector/search | server.js:847 | pending | pending |
| POST | /api/v2/vector/memory/add | server.js:848 | pending | pending |
| POST | /api/v2/vector/memory/recall | server.js:849 | pending | pending |
| GET | /api/v2/cost/prices | server.js:855 | pending | pending |
| PATCH | /api/v2/cost/prices | server.js:867 | pending | pending |
| POST | /api/v2/cost/estimate | server.js:883 | pending | pending |
| GET | /api/v2/cost/history | server.js:897 | pending | pending |
| GET | /api/v2/carbon/factors | server.js:912 | pending | pending |
| PATCH | /api/v2/carbon/factors | server.js:924 | pending | pending |
| POST | /api/v2/carbon/estimate | server.js:940 | pending | pending |
| GET | /api/v2/carbon/history | server.js:954 | pending | pending |
| POST | /api/v2/alerts/simulate | server.js:971 | pending | pending |
| GET | /api/v2/alerts/history | server.js:1009 | pending | pending |
| GET | /api/v2/rootcause/:gradeName | server.js:1018 | pending | pending |
| GET | /api/v2/cost/savings-analysis | server.js:1180 | pending | pending |
| GET | /api/v2/cost/selling-prices | server.js:1229 | pending | pending |
| PATCH | /api/v2/cost/selling-prices | server.js:1233 | pending | pending |
| GET | /api/v2/insights/suppliers/scorecard | premeltGate\insightsRoutes.js:15 | pending | pending |
| GET | /api/v2/insights/suppliers/detail | premeltGate\insightsRoutes.js:16 | pending | pending |
| GET | /api/v2/insights/suppliers/lot-grade/:lotId | premeltGate\insightsRoutes.js:21 | pending | pending |
| GET | /api/v2/insights/suppliers/best | premeltGate\insightsRoutes.js:26 | pending | pending |
| PATCH | /api/v2/insights/suppliers/weights | premeltGate\insightsRoutes.js:27 | pending | pending |
| GET | /api/v2/insights/suppliers/ahp | premeltGate\insightsRoutes.js:29 | pending | pending |
| PATCH | /api/v2/insights/suppliers/ahp | premeltGate\insightsRoutes.js:30 | pending | pending |
| GET | /api/v2/insights/suppliers/order-plan | premeltGate\insightsRoutes.js:32 | pending | pending |
| GET | /api/v2/insights/suppliers/alerts | premeltGate\insightsRoutes.js:34 | pending | pending |
| GET | /api/v2/insights/energy/config | premeltGate\insightsRoutes.js:37 | pending | pending |
| PATCH | /api/v2/insights/energy/config | premeltGate\insightsRoutes.js:38 | pending | pending |
| GET | /api/v2/insights/energy/summary | premeltGate\insightsRoutes.js:39 | pending | pending |
| GET | /api/v2/insights/energy/heat/:heatId | premeltGate\insightsRoutes.js:40 | pending | pending |
| POST | /api/v2/insights/energy/heat/:heatId/actual | premeltGate\insightsRoutes.js:46 | pending | pending |
| POST | /api/v2/insights/energy/heat/:heatId/simulate | premeltGate\insightsRoutes.js:47 | pending | pending |
| GET | /api/v2/inventory/forecast | premeltGate\inventoryRoutes.js:17 | pending | pending |
| GET | /api/v2/inventory/forecast/:item | premeltGate\inventoryRoutes.js:18 | pending | pending |
| GET | /api/v2/inventory/reorder-suggestions | premeltGate\inventoryRoutes.js:19 | pending | pending |
| GET | /api/v2/inventory/purchase-requests | premeltGate\inventoryRoutes.js:21 | pending | pending |
| POST | /api/v2/inventory/purchase-requests | premeltGate\inventoryRoutes.js:22 | pending | pending |
| GET | /api/v2/inventory/purchase-requests/:id | premeltGate\inventoryRoutes.js:23 | pending | pending |
| POST | /api/v2/inventory/purchase-requests/:id/approve | premeltGate\inventoryRoutes.js:28 | pending | pending |
| POST | /api/v2/inventory/purchase-requests/:id/reject | premeltGate\inventoryRoutes.js:29 | pending | pending |
| POST | /api/v2/inventory/purchase-requests/:id/receive | premeltGate\inventoryRoutes.js:30 | pending | pending |
| GET | /api/v2/inventory/config | premeltGate\inventoryRoutes.js:32 | pending | pending |
| PATCH | /api/v2/inventory/config | premeltGate\inventoryRoutes.js:33 | pending | pending |
| GET | /api/v2/premelt/summary | premeltGate\routes.js:45 | pending | pending |
| GET | /api/v2/premelt/lots | premeltGate\routes.js:72 | pending | pending |
| GET | /api/v2/premelt/lots/:lotId | premeltGate\routes.js:84 | pending | pending |
| POST | /api/v2/premelt/lots | premeltGate\routes.js:98 | pending | pending |
| PATCH | /api/v2/premelt/lots/:lotId/status | premeltGate\routes.js:117 | pending | pending |
| POST | /api/v2/premelt/lots/:lotId/adjust | premeltGate\routes.js:139 | pending | pending |
| GET | /api/v2/premelt/movements | premeltGate\routes.js:150 | pending | pending |
| GET | /api/v2/premelt/additives | premeltGate\routes.js:151 | pending | pending |
| POST | /api/v2/premelt/additives/deduct | premeltGate\routes.js:156 | pending | pending |
| POST | /api/v2/premelt/additives/receive | premeltGate\routes.js:174 | pending | pending |
| POST | /api/v2/premelt/lots/:lotId/dri-qa | premeltGate\routes.js:189 | pending | pending |
| GET | /api/v2/premelt/dri-qa | premeltGate\routes.js:190 | pending | pending |
| POST | /api/v2/premelt/dri-qa/:qaId/approve | premeltGate\routes.js:191 | pending | pending |
| POST | /api/v2/premelt/dri-qa/:qaId/reject | premeltGate\routes.js:192 | pending | pending |
| GET | /api/v2/premelt/gun/status | premeltGate\routes.js:195 | pending | pending |
| POST | /api/v2/premelt/gun/connect | premeltGate\routes.js:196 | pending | pending |
| POST | /api/v2/premelt/gun/disconnect | premeltGate\routes.js:201 | pending | pending |
| POST | /api/v2/premelt/gun/inspect | premeltGate\routes.js:202 | pending | pending |
| GET | /api/v2/premelt/gun/live | premeltGate\routes.js:203 | pending | pending |
| POST | /api/v2/premelt/gun/argon/replace | premeltGate\routes.js:204 | pending | pending |
| GET | /api/v2/premelt/gun/scenarios | premeltGate\routes.js:205 | pending | pending |
| GET | /api/v2/premelt/gun/sessions | premeltGate\routes.js:206 | pending | pending |
| GET | /api/v2/premelt/gun/sessions/:sessionId | premeltGate\routes.js:207 | pending | pending |
| GET | /api/v2/premelt/gun/sessions/:sessionId/csv | premeltGate\routes.js:213 | pending | pending |
| POST | /api/v2/premelt/gun/ingest-csv | premeltGate\routes.js:219 | pending | pending |
| GET | /api/v2/premelt/heats | premeltGate\routes.js:249 | pending | pending |
| POST | /api/v2/premelt/heats | premeltGate\routes.js:250 | pending | pending |
| GET | /api/v2/premelt/heats/:heatId | premeltGate\routes.js:261 | pending | pending |
| PUT | /api/v2/premelt/heats/:heatId/charge | premeltGate\routes.js:266 | pending | pending |
| POST | /api/v2/premelt/heats/:heatId/gate-check | premeltGate\routes.js:278 | pending | pending |
| POST | /api/v2/premelt/heats/:heatId/start-melting | premeltGate\routes.js:279 | pending | pending |
| GET | /api/v2/premelt/config | premeltGate\routes.js:282 | pending | pending |
| PATCH | /api/v2/premelt/config | premeltGate\routes.js:290 | pending | pending |
| GET | /api/v2/premelt/audit | premeltGate\routes.js:298 | pending | pending |
| POST | /api/v2/premelt/demo/reset | premeltGate\routes.js:299 | pending | pending |
| POST | /api/v2/sales/heats/:heatId/complete | premeltGate\salesRoutes.js:12 | pending | pending |
| GET | /api/v2/sales/heats | premeltGate\salesRoutes.js:13 | pending | pending |
| GET | /api/v2/sales/certificates/:heatId | premeltGate\salesRoutes.js:14 | pending | pending |
| GET | /api/v2/sales/customers | premeltGate\salesRoutes.js:15 | pending | pending |
| GET | /api/v2/sales/invoices | premeltGate\salesRoutes.js:16 | pending | pending |
| POST | /api/v2/sales/invoices | premeltGate\salesRoutes.js:17 | pending | pending |
| GET | /api/v2/sales/invoices/:id(*) | premeltGate\salesRoutes.js:18 | pending | pending |
| GET | /api/v2/sales/config | premeltGate\salesRoutes.js:19 | pending | pending |
| PATCH | /api/v2/sales/config | premeltGate\salesRoutes.js:20 | pending | pending |
| GET | /api/v2/premelt/summary | premeltGate\routes.js:45 | pending | pending |
| GET | /api/v2/premelt/lots | premeltGate\routes.js:72 | pending | pending |
| GET | /api/v2/premelt/lots/:lotId | premeltGate\routes.js:84 | pending | pending |
| POST | /api/v2/premelt/lots | premeltGate\routes.js:98 | pending | pending |
| PATCH | /api/v2/premelt/lots/:lotId/status | premeltGate\routes.js:117 | pending | pending |
| POST | /api/v2/premelt/lots/:lotId/adjust | premeltGate\routes.js:139 | pending | pending |
| GET | /api/v2/premelt/movements | premeltGate\routes.js:150 | pending | pending |
| GET | /api/v2/premelt/additives | premeltGate\routes.js:151 | pending | pending |
| POST | /api/v2/premelt/additives/deduct | premeltGate\routes.js:156 | pending | pending |
| POST | /api/v2/premelt/additives/receive | premeltGate\routes.js:174 | pending | pending |
| POST | /api/v2/premelt/lots/:lotId/dri-qa | premeltGate\routes.js:189 | pending | pending |
| GET | /api/v2/premelt/dri-qa | premeltGate\routes.js:190 | pending | pending |
| POST | /api/v2/premelt/dri-qa/:qaId/approve | premeltGate\routes.js:191 | pending | pending |
| POST | /api/v2/premelt/dri-qa/:qaId/reject | premeltGate\routes.js:192 | pending | pending |
| GET | /api/v2/premelt/gun/status | premeltGate\routes.js:195 | pending | pending |
| POST | /api/v2/premelt/gun/connect | premeltGate\routes.js:196 | pending | pending |
| POST | /api/v2/premelt/gun/disconnect | premeltGate\routes.js:201 | pending | pending |
| POST | /api/v2/premelt/gun/inspect | premeltGate\routes.js:202 | pending | pending |
| GET | /api/v2/premelt/gun/live | premeltGate\routes.js:203 | pending | pending |
| POST | /api/v2/premelt/gun/argon/replace | premeltGate\routes.js:204 | pending | pending |
| GET | /api/v2/premelt/gun/scenarios | premeltGate\routes.js:205 | pending | pending |
| GET | /api/v2/premelt/gun/sessions | premeltGate\routes.js:206 | pending | pending |
| GET | /api/v2/premelt/gun/sessions/:sessionId | premeltGate\routes.js:207 | pending | pending |
| GET | /api/v2/premelt/gun/sessions/:sessionId/csv | premeltGate\routes.js:213 | pending | pending |
| POST | /api/v2/premelt/gun/ingest-csv | premeltGate\routes.js:219 | pending | pending |
| GET | /api/v2/premelt/heats | premeltGate\routes.js:249 | pending | pending |
| POST | /api/v2/premelt/heats | premeltGate\routes.js:250 | pending | pending |
| GET | /api/v2/premelt/heats/:heatId | premeltGate\routes.js:261 | pending | pending |
| PUT | /api/v2/premelt/heats/:heatId/charge | premeltGate\routes.js:266 | pending | pending |
| POST | /api/v2/premelt/heats/:heatId/gate-check | premeltGate\routes.js:278 | pending | pending |
| POST | /api/v2/premelt/heats/:heatId/start-melting | premeltGate\routes.js:279 | pending | pending |
| GET | /api/v2/premelt/config | premeltGate\routes.js:282 | pending | pending |
| PATCH | /api/v2/premelt/config | premeltGate\routes.js:290 | pending | pending |
| GET | /api/v2/premelt/audit | premeltGate\routes.js:298 | pending | pending |
| POST | /api/v2/premelt/demo/reset | premeltGate\routes.js:299 | pending | pending |
| POST | /api/v2/mechanical/predict | mechanicalRoutes.js:11 | pending | pending |
| POST | /api/v2/mechanical/predict/batch | mechanicalRoutes.js:25 | pending | pending |
| POST | /api/v2/mechanical/ce-check | mechanicalRoutes.js:38 | pending | pending |
| GET | /api/v2/mechanical/standards | mechanicalRoutes.js:51 | pending | pending |
| GET | /api/v2/mechanical/standards/:grade | mechanicalRoutes.js:60 | pending | pending |
| GET | /api/v2/mechanical/model-info | mechanicalRoutes.js:69 | pending | pending |
