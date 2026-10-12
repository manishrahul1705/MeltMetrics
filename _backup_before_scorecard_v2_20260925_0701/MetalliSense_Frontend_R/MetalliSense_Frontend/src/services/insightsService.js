import api from "./api";

// Supplier Scorecard + Energy — backend routes under /api/v2/insights.
const P = "/insights";

export const getSupplierScorecard = (materialType) =>
  api.get(`${P}/suppliers/scorecard`, { params: materialType ? { materialType } : {} });
export const getSupplierDetail = (name, materialType) =>
  api.get(`${P}/suppliers/detail`, { params: { name, materialType } });
export const getLotSupplierGrade = (lotId) => api.get(`${P}/suppliers/lot-grade/${lotId}`);
export const updateSupplierWeights = (weights) => api.patch(`${P}/suppliers/weights`, weights);

export const getEnergyForHeat = (heatId, params = {}) => api.get(`${P}/energy/heat/${heatId}`, { params });
export const recordHeatEnergy = (heatId, data) => api.post(`${P}/energy/heat/${heatId}/actual`, data);
export const simulateHeatEnergy = (heatId) => api.post(`${P}/energy/heat/${heatId}/simulate`, {});
export const getEnergySummary = () => api.get(`${P}/energy/summary`);
export const getEnergyConfig = () => api.get(`${P}/energy/config`);
export const updateEnergyConfig = (patch) => api.patch(`${P}/energy/config`, patch);
