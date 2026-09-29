/**
 * api.js — API-first data layer with offline fallback.
 * All fetch functions try the real backend (localhost:3001) first.
 * If the API is unreachable, they fall back to the local mockData.
 */

const BASE = "/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// Wrap with offline fallback
async function withFallback(apiFn, fallbackFn) {
  try {
    return await apiFn();
  } catch (e) {
    console.warn("[Polaris] API unavailable, using local mock data:", e.message);
    return fallbackFn();
  }
}

// ─── Import local fallbacks ───────────────────────────
import {
  stationKPIs, expeditions, expeditionTeams, cargoVessels, cargoIndents,
  inventoryData, itemMaster, stockTransactions, personnel,
  incidents, emergencyResources, emergencySOPs, drillLogs,
  systemAlerts, analyticsData,
} from "./mockData.js";

// ─── Station KPIs ─────────────────────────────────────
export const fetchStationKPIs    = () => withFallback(() => apiFetch("/stations"), () => stationKPIs);
export const fetchStationStatus  = () => withFallback(() => apiFetch("/stations"), () => stationKPIs);

// ─── Expeditions ──────────────────────────────────────
export const fetchExpeditions    = () => withFallback(() => apiFetch("/expeditions"), () => expeditions);
export const fetchExpeditionTeams= () => withFallback(() => apiFetch("/teams"), () => expeditionTeams);
export const fetchDeployments    = () => withFallback(() => apiFetch("/teams"), () => expeditionTeams);

// ─── Cargo ────────────────────────────────────────────
export const fetchCargoVessels   = () => withFallback(() => apiFetch("/cargo/vessels"), () => cargoVessels);
export const fetchCargoIndents   = () => withFallback(() => apiFetch("/cargo/indents"), () => cargoIndents);
export const fetchDashboardCargo = () => withFallback(() => apiFetch("/cargo/vessels"), () => cargoVessels);

// ─── Inventory ────────────────────────────────────────
export const fetchAllInventory      = () => withFallback(() => apiFetch("/inventory"), () => inventoryData);
export const fetchDashboardInventory= () => withFallback(() => apiFetch("/inventory"), () => inventoryData);
export const fetchInventory         = (station = "Bharati") =>
  withFallback(() => apiFetch(`/inventory?station=${station}`), () => inventoryData.filter(d => d.station === station));
export const fetchItemMaster        = () => withFallback(() => apiFetch("/inventory/items"), () => itemMaster);
export const fetchStockTransactions = () => withFallback(() => apiFetch("/inventory/transactions"), () => stockTransactions);

// ─── Personnel ────────────────────────────────────────
export const fetchPersonnel      = () => withFallback(() => apiFetch("/personnel"), () => personnel);

// ─── Alerts ───────────────────────────────────────────
export const fetchAlerts         = () => withFallback(() => apiFetch("/alerts"), () => systemAlerts);

// ─── Emergency ────────────────────────────────────────
export const fetchIncidents         = () => withFallback(() => apiFetch("/incidents"), () => incidents);
export const fetchEmergencyResources= () => withFallback(() => apiFetch("/emergency/resources"), () => emergencyResources);
export const fetchEmergencySOPs     = () => withFallback(() => apiFetch("/emergency/sops"), () => emergencySOPs);
export const fetchDrillLogs         = () => withFallback(() => apiFetch("/drills"), () => drillLogs);

// ─── Analytics ────────────────────────────────────────
export const fetchAnalytics      = () => withFallback(() => apiFetch("/analytics"), () => analyticsData);

// ─── Auth ─────────────────────────────────────────────
export const loginUser = (username, password) =>
  apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });

// ─── Write operations ─────────────────────────────────
export const reportIncident = (data) =>
  apiFetch("/incidents", { method: "POST", body: JSON.stringify(data) });

export const updateIncident = (id, data) =>
  apiFetch(`/incidents/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const logTransaction = (data) =>
  apiFetch("/inventory/transactions", { method: "POST", body: JSON.stringify(data) });

export const raiseIndent = (data) =>
  apiFetch("/cargo/indents", { method: "POST", body: JSON.stringify(data) });

export const acknowledgeAlert = (id) =>
  apiFetch(`/alerts/${id}/acknowledge`, { method: "PATCH" });

export const updateMilestone = (expeditionId, milestone_id, status) =>
  apiFetch(`/expeditions/${expeditionId}/milestone`, { method: "PATCH", body: JSON.stringify({ milestone_id, status }) });

export const scheduleDrill = (data) =>
  apiFetch("/drills", { method: "POST", body: JSON.stringify(data) });

export const syncPending = () => apiFetch("/sync/pending");
export const flushSync   = () => apiFetch("/sync/flush", { method: "POST" });
export const checkHealth = () => apiFetch("/health");

export const updateIndent = (id, data) => apiFetch('/cargo/indents/' + id, { method: 'PUT', body: JSON.stringify(data) });
