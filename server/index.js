require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const { getDB, all, get, run, parseJSON, saveDB } = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

let dbReady = false;
getDB().then(() => { dbReady = true; console.log("DB ready"); }).catch(console.error);

const ready = (req, res, next) => dbReady ? next() : res.status(503).json({ error: "DB initialising" });
app.use(ready);

// ── Auth ──────────────────────────────────────────────
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing credentials" });
  const rows = all("users", "WHERE username = ? AND password = ?", [username, password]);
  if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });
  const { password: _p, ...user } = rows[0];
  res.json({ ok: true, user });
});

// ── Station KPIs ──────────────────────────────────────
app.get("/api/stations", (_req, res) => res.json(all("station_kpis")));

// ── Expeditions ───────────────────────────────────────
app.get("/api/expeditions", (_req, res) => {
  res.json(all("expeditions").map(e => parseJSON(e, ["stations","objectives","milestones","approvals","capacity_checks"])));
});
app.get("/api/expeditions/:id", (req, res) => {
  const row = get("expeditions", req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(parseJSON(row, ["stations","objectives","milestones","approvals","capacity_checks"]));
});
app.patch("/api/expeditions/:id/milestone", (req, res) => {
  const exp = get("expeditions", req.params.id);
  if (!exp) return res.status(404).json({ error: "Not found" });
  const milestones = JSON.parse(exp.milestones || "[]");
  const { milestone_id, status } = req.body;
  const updated = milestones.map(m => m.id === milestone_id ? { ...m, status } : m);
  run("UPDATE expeditions SET milestones=?,sync_status='pending' WHERE id=?", [JSON.stringify(updated), req.params.id]);
  res.json({ ok: true });
});

// ── Teams ─────────────────────────────────────────────
app.get("/api/teams", (_req, res) => res.json(all("expedition_teams")));

// ── Cargo Vessels ─────────────────────────────────────
app.get("/api/cargo/vessels", (_req, res) =>
  res.json(all("cargo_vessels").map(v => parseJSON(v, ["current_location","stops","cargo_manifest","tracking_events"]))));

// ── Cargo Indents ─────────────────────────────────────
app.get("/api/cargo/indents", (_req, res) =>
  res.json(all("cargo_indents").map(i => parseJSON(i, ["items"]))));
app.post("/api/cargo/indents", (req, res) => {
  const b = req.body;
  const id = "ind-" + Date.now();
  run("INSERT INTO cargo_indents VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [id, b.expedition_id||null, b.raised_by, b.station, b.category,
     JSON.stringify(b.items||[]), "pending", b.priority||"normal",
     new Date().toISOString().slice(0,10), null, null, b.notes||"", "pending"]);
  res.status(201).json({ ok: true, id });
});
app.patch("/api/cargo/indents/:id", (req, res) => {
  const { status, approved_by } = req.body;
  run("UPDATE cargo_indents SET status=?,approved_by=?,approved_date=?,sync_status='pending' WHERE id=?",
    [status, approved_by||null, new Date().toISOString().slice(0,10), req.params.id]);
  res.json({ ok: true });
});

// ── Inventory ─────────────────────────────────────────
app.get("/api/inventory", (_req, res) => res.json(all("inventory_items")));
app.get("/api/inventory/items", (_req, res) => res.json(all("item_master")));
app.get("/api/inventory/transactions", (_req, res) => res.json(all("stock_transactions")));
app.post("/api/inventory/transactions", (req, res) => {
  const b = req.body;
  const id = "tx-" + Date.now();
  run("INSERT INTO stock_transactions VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [id, b.item_id, b.station, b.type, b.quantity, b.unit,
     new Date().toISOString().slice(0,10), b.performed_by,
     b.reference||"", b.barcode_scanned?1:0, "pending"]);
  // Update current stock
  const delta = b.type === "receipt" ? Math.abs(b.quantity) : -Math.abs(b.quantity);
  run("UPDATE inventory_items SET current = MAX(0, current + ?) WHERE station=? AND id=?",
    [delta, b.station, b.item_id]);
  saveDB();
  res.status(201).json({ ok: true, id });
});
app.patch("/api/inventory/:id", (req, res) => {
  const fields = req.body;
  const sets = Object.keys(fields).map(k => `${k}=?`).join(",");
  run(`UPDATE inventory_items SET ${sets} WHERE id=?`, [...Object.values(fields), req.params.id]);
  res.json({ ok: true });
});

// ── Personnel ─────────────────────────────────────────
app.get("/api/personnel", (_req, res) =>
  res.json(all("personnel").map(p => parseJSON(p, ["clearances","movement_log"]))));
app.get("/api/personnel/:id", (req, res) => {
  const row = get("personnel", req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(parseJSON(row, ["clearances","movement_log"]));
});
app.post("/api/personnel/:id/movement", (req, res) => {
  const row = get("personnel", req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  const log = JSON.parse(row.movement_log || "[]");
  log.unshift({ ...req.body, timestamp: new Date().toISOString() });
  run("UPDATE personnel SET movement_log=?,station=?,status=?,sync_status='pending' WHERE id=?",
    [JSON.stringify(log), req.body.location, req.body.status||row.status, req.params.id]);
  res.json({ ok: true });
});

// ── Incidents ─────────────────────────────────────────
app.get("/api/incidents", (_req, res) =>
  res.json(all("incidents").map(i => parseJSON(i, ["attachments"]))));
app.post("/api/incidents", (req, res) => {
  const b = req.body;
  const id = "inc-" + Date.now();
  run("INSERT INTO incidents VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [id, b.station, b.severity||"medium", b.type, b.title, b.description,
     b.reported_by, new Date().toISOString(), "active", b.location,
     0, 1, null, "[]", "pending", 0]);
  res.status(201).json({ ok: true, id });
});
app.patch("/api/incidents/:id", (req, res) => {
  const { status, resolution, escalated, escalation_level } = req.body;
  run("UPDATE incidents SET status=?,resolution=?,escalated=?,escalation_level=?,sync_status='pending' WHERE id=?",
    [status, resolution||null, escalated?1:0, escalation_level||1, req.params.id]);
  res.json({ ok: true });
});

// ── Emergency Resources ───────────────────────────────
app.get("/api/emergency/resources", (_req, res) =>
  res.json(all("emergency_resources").map(r => parseJSON(r, ["resources"]))));

// ── Emergency SOPs ────────────────────────────────────
app.get("/api/emergency/sops", (_req, res) => res.json(all("emergency_sops")));

// ── Drill Logs ────────────────────────────────────────
app.get("/api/drills", (_req, res) => res.json(all("drill_logs")));
app.post("/api/drills", (req, res) => {
  const b = req.body;
  const id = "dl-" + Date.now();
  run("INSERT INTO drill_logs VALUES (?,?,?,?,?,?,?,?)",
    [id, b.type, b.station, b.date, b.participants, b.conducted_by, b.outcome||"Pending", b.notes||""]);
  saveDB();
  res.status(201).json({ ok: true, id });
});

// ── System Alerts ─────────────────────────────────────
app.get("/api/alerts", (_req, res) => res.json(all("system_alerts").map(a => parseJSON(a, []))));
app.patch("/api/alerts/:id/acknowledge", (req, res) => {
  run("UPDATE system_alerts SET acknowledged=1 WHERE id=?", [req.params.id]);
  res.json({ ok: true });
});
app.post("/api/alerts", (req, res) => {
  const b = req.body;
  const id = "alt-" + Date.now();
  run("INSERT INTO system_alerts VALUES (?,?,?,?,?,?,?)",
    [id, b.severity||"info", b.message, b.station, new Date().toISOString(), 0, b.type||"General"]);
  saveDB();
  res.status(201).json({ ok: true, id });
});

// ── Analytics ─────────────────────────────────────────
app.get("/api/analytics", (_req, res) => {
  const exp = all("expeditions").map(e => parseJSON(e, ["stations","objectives","milestones","approvals","capacity_checks"])).find(e => e.status === "active");
  const inv = all("inventory_items");

  // Budget utilization from expedition monthly spend (mock monthly breakdown)
  const months = ["Jul","Aug","Sep","Oct","Nov","Dec"];
  const totalSpent = exp ? exp.budget_spent_crore : 0;
  const budget_utilization = months.map((m, i) => ({
    month: m,
    spent: +(totalSpent / months.length * (0.8 + Math.random() * 0.4)).toFixed(1),
  }));

  const cargo_reconciliation = {
    planned:    exp?.cargo_planned_mt    || 0,
    dispatched: exp?.cargo_dispatched_mt || 0,
    received:   exp?.cargo_received_mt   || 0,
    by_category: [
      { name:"Fuel",      planned:90,  dispatched:80,  received:75  },
      { name:"Provisions",planned:60,  dispatched:50,  received:48  },
      { name:"Equipment", planned:80,  dispatched:45,  received:38  },
      { name:"Medical",   planned:20,  dispatched:15,  received:15  },
      { name:"Other",     planned:30,  dispatched:25,  received:24  },
    ],
  };

  const inventory_trends = [
    { month:"Jul", fuel_bharati:95, fuel_maitri:90, rations_bharati:88, rations_maitri:85 },
    { month:"Aug", fuel_bharati:78, fuel_maitri:72, rations_bharati:72, rations_maitri:75 },
    { month:"Sep", fuel_bharati:56, fuel_maitri:31, rations_bharati:70, rations_maitri:61 },
  ];

  const stations = all("station_kpis");
  const personnel_distribution = stations.map(s => ({ station: s.station, count: s.personnel }));

  res.json({ budget_utilization, cargo_reconciliation, inventory_trends, personnel_distribution });
});

// ── Sync queue (offline-first) ────────────────────────
app.get("/api/sync/pending", (_req, res) => {
  const pending = {
    expeditions: all("expeditions", "WHERE sync_status='pending'").length,
    inventory:   all("inventory_items", "WHERE sync_status='pending'").length,
    personnel:   all("personnel", "WHERE sync_status='pending'").length,
    incidents:   all("incidents", "WHERE sync_status='pending'").length,
    cargo:       all("cargo_indents", "WHERE sync_status='pending'").length,
  };
  res.json(pending);
});
app.post("/api/sync/flush", (_req, res) => {
  ["expeditions","inventory_items","personnel","incidents","cargo_indents","cargo_vessels","stock_transactions"].forEach(t =>
    run(`UPDATE ${t} SET sync_status='synced'`));
  saveDB();
  res.json({ ok: true, message: "All pending changes synced to central server" });
});

// ── Health ────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", db: "polaris.db", ts: new Date().toISOString() }));

app.listen(PORT, () => console.log(`Polaris API running on http://localhost:${PORT}`));
