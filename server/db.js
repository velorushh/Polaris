const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "polaris.db");

let db = null;

async function getDB() {
  if (db) return db;
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create schema
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
      name TEXT NOT NULL, role TEXT NOT NULL, avatar TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS station_kpis (
      id TEXT PRIMARY KEY, station TEXT UNIQUE NOT NULL, lat REAL, lon REAL,
      personnel INTEGER DEFAULT 0, status TEXT DEFAULT 'operational',
      temp_c REAL, wind_kph REAL, visibility TEXT,
      emergency_readiness TEXT DEFAULT 'ready'
    );
    CREATE TABLE IF NOT EXISTS expeditions (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT, season TEXT,
      status TEXT DEFAULT 'planning', stations TEXT, objectives TEXT,
      start_date TEXT, end_date TEXT, team_count INTEGER DEFAULT 0,
      budget_crore REAL DEFAULT 0, budget_spent_crore REAL DEFAULT 0,
      cargo_planned_mt REAL DEFAULT 0, cargo_dispatched_mt REAL DEFAULT 0,
      cargo_received_mt REAL DEFAULT 0, milestones TEXT, approvals TEXT,
      capacity_checks TEXT, sync_status TEXT DEFAULT 'synced'
    );
    CREATE TABLE IF NOT EXISTS expedition_teams (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, station TEXT,
      status TEXT DEFAULT 'active', active_count INTEGER DEFAULT 0,
      mission TEXT, lead TEXT, deployed_since TEXT, eta_return TEXT,
      priority TEXT DEFAULT 'normal', sync_status TEXT DEFAULT 'synced'
    );
    CREATE TABLE IF NOT EXISTS cargo_vessels (
      id TEXT PRIMARY KEY, vessel_name TEXT NOT NULL, voyage_id TEXT,
      status TEXT DEFAULT 'scheduled', current_location TEXT,
      origin TEXT, destination TEXT, departed_at TEXT, eta TEXT, eta_days INTEGER,
      stops TEXT, cargo_manifest TEXT, tracking_events TEXT,
      sync_status TEXT DEFAULT 'synced'
    );
    CREATE TABLE IF NOT EXISTS cargo_indents (
      id TEXT PRIMARY KEY, expedition_id TEXT, raised_by TEXT, station TEXT,
      category TEXT, items TEXT, status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'normal', raised_date TEXT,
      approved_date TEXT, approved_by TEXT, notes TEXT,
      sync_status TEXT DEFAULT 'synced'
    );
    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY, station TEXT NOT NULL, category TEXT NOT NULL,
      current REAL DEFAULT 0, capacity REAL DEFAULT 0, unit TEXT,
      threshold_warning REAL DEFAULT 0, threshold_critical REAL DEFAULT 0,
      shelf_life_days INTEGER DEFAULT 0, storage_condition TEXT,
      criticality TEXT DEFAULT 'medium', consumption_rate REAL DEFAULT 0,
      days_to_next_resupply INTEGER DEFAULT 0, last_updated TEXT,
      sync_status TEXT DEFAULT 'synced'
    );
    CREATE TABLE IF NOT EXISTS item_master (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT, unit TEXT,
      criticality TEXT DEFAULT 'medium', shelf_life_days INTEGER DEFAULT 0,
      storage_condition TEXT, barcode TEXT UNIQUE
    );
    CREATE TABLE IF NOT EXISTS stock_transactions (
      id TEXT PRIMARY KEY, item_id TEXT, station TEXT, type TEXT,
      quantity REAL, unit TEXT, date TEXT, performed_by TEXT,
      reference TEXT, barcode_scanned INTEGER DEFAULT 0,
      sync_status TEXT DEFAULT 'synced'
    );
    CREATE TABLE IF NOT EXISTS personnel (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT, affiliation TEXT,
      station TEXT, expedition_id TEXT, status TEXT DEFAULT 'deployed',
      team TEXT, contact TEXT, emergency_contact TEXT,
      arrival_date TEXT, departure_date TEXT, clearances TEXT, movement_log TEXT,
      sync_status TEXT DEFAULT 'synced'
    );
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY, station TEXT, severity TEXT DEFAULT 'medium',
      type TEXT, title TEXT, description TEXT, reported_by TEXT,
      reported_at TEXT, status TEXT DEFAULT 'active', location TEXT,
      escalated INTEGER DEFAULT 0, escalation_level INTEGER DEFAULT 1,
      resolution TEXT, attachments TEXT, sync_status TEXT DEFAULT 'synced',
      requires_manual_review INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS emergency_resources (
      id TEXT PRIMARY KEY, station TEXT NOT NULL, resources TEXT,
      sync_status TEXT DEFAULT 'synced'
    );
    CREATE TABLE IF NOT EXISTS emergency_sops (
      id TEXT PRIMARY KEY, type TEXT, title TEXT, version TEXT,
      last_updated TEXT, station TEXT DEFAULT 'all', file_url TEXT
    );
    CREATE TABLE IF NOT EXISTS drill_logs (
      id TEXT PRIMARY KEY, type TEXT, station TEXT, date TEXT,
      participants INTEGER, conducted_by TEXT, outcome TEXT, notes TEXT
    );
    CREATE TABLE IF NOT EXISTS system_alerts (
      id TEXT PRIMARY KEY, severity TEXT DEFAULT 'info', message TEXT,
      station TEXT, timestamp TEXT, acknowledged INTEGER DEFAULT 0, type TEXT
    );
  `);

  saveDB();
  return db;
}

function saveDB() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Helpers
function all(table, where = "", params = []) {
  const stmt = db.prepare(`SELECT * FROM ${table} ${where}`);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

function get(table, id) {
  const stmt = db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
  stmt.bind([id]);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function count(table) {
  const stmt = db.prepare(`SELECT COUNT(*) as c FROM ${table}`);
  stmt.step();
  const r = stmt.getAsObject();
  stmt.free();
  return r.c;
}

function parseJSON(row, fields) {
  if (!row) return null;
  const out = { ...row };
  fields.forEach(f => {
    if (out[f]) {
      try { out[f] = JSON.parse(out[f]); } catch(e) {}
    }
  });
  // Convert sqlite integers (0/1) for boolean-ish fields
  if (out.escalated !== undefined) out.escalated = !!out.escalated;
  if (out.barcode_scanned !== undefined) out.barcode_scanned = !!out.barcode_scanned;
  if (out.acknowledged !== undefined) out.acknowledged = !!out.acknowledged;
  if (out.requires_manual_review !== undefined) out.requires_manual_review = !!out.requires_manual_review;
  return out;
}

module.exports = { getDB, saveDB, all, run, get, count, parseJSON };
