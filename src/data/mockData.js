/**
 * Mock data layer - structured to mirror the Polaris PostgreSQL schema.
 * All fetchXxx() functions return Promises so they can be swapped for
 * real API / Supabase / PostgreSQL calls with zero component changes.
 */

export const inventoryData = [
  { id: 'inv-001', station: 'Bharati', category: 'Aviation Fuel', current: 68, capacity: 100, unit: 'kL', threshold_warning: 40, threshold_critical: 20, last_updated: '2026-09-10T06:15:00Z', shelf_life_days: 365, storage_condition: 'Below 40C', criticality: 'critical', consumption_rate: 4.2, days_to_next_resupply: 85 },
  { id: 'inv-002', station: 'Bharati', category: 'Winter Rations', current: 82, capacity: 100, unit: '%', threshold_warning: 35, threshold_critical: 15, last_updated: '2026-09-10T06:15:00Z', shelf_life_days: 730, storage_condition: 'Dry & Cool', criticality: 'high', consumption_rate: 0.9, days_to_next_resupply: 85 },
  { id: 'inv-003', station: 'Bharati', category: 'Vehicle Spares', current: 31, capacity: 100, unit: '%', threshold_warning: 40, threshold_critical: 20, last_updated: '2026-09-10T06:15:00Z', shelf_life_days: 1825, storage_condition: 'Dry', criticality: 'high', consumption_rate: 0.5, days_to_next_resupply: 85 },
  { id: 'inv-004', station: 'Maitri', category: 'Aviation Fuel', current: 54, capacity: 100, unit: 'kL', threshold_warning: 40, threshold_critical: 20, last_updated: '2026-09-10T07:00:00Z', shelf_life_days: 365, storage_condition: 'Below 40C', criticality: 'critical', consumption_rate: 3.8, days_to_next_resupply: 90 },
  { id: 'inv-005', station: 'Maitri', category: 'Winter Rations', current: 91, capacity: 100, unit: '%', threshold_warning: 35, threshold_critical: 15, last_updated: '2026-09-10T07:00:00Z', shelf_life_days: 730, storage_condition: 'Dry & Cool', criticality: 'high', consumption_rate: 0.8, days_to_next_resupply: 90 },
  { id: 'inv-006', station: 'Maitri', category: 'Medical Supplies', current: 44, capacity: 100, unit: '%', threshold_warning: 30, threshold_critical: 15, last_updated: '2026-09-09T12:00:00Z', shelf_life_days: 365, storage_condition: 'Cool & Dry', criticality: 'critical', consumption_rate: 0.3, days_to_next_resupply: 90 },
  { id: 'inv-007', station: 'Himadri', category: 'Diesel', current: 72, capacity: 100, unit: 'kL', threshold_warning: 30, threshold_critical: 15, last_updated: '2026-09-08T09:00:00Z', shelf_life_days: 730, storage_condition: 'Below 40C', criticality: 'critical', consumption_rate: 2.1, days_to_next_resupply: 120 },
  { id: 'inv-008', station: 'Goa Hub', category: 'Spare Electronics', current: 88, capacity: 100, unit: '%', threshold_warning: 25, threshold_critical: 10, last_updated: '2026-09-12T10:00:00Z', shelf_life_days: 3650, storage_condition: 'Climate-controlled', criticality: 'medium', consumption_rate: 0.1, days_to_next_resupply: 0 },
];

export const itemMaster = [
  { id: 'itm-001', name: 'Aviation Fuel (Jet A-1)', category: 'Fuel', unit: 'kL', criticality: 'critical', shelf_life_days: 365, storage_condition: 'Below 40C, away from ignition', barcode: '8901234567890' },
  { id: 'itm-002', name: 'Diesel (HSD)', category: 'Fuel', unit: 'kL', criticality: 'critical', shelf_life_days: 730, storage_condition: 'Below 40C', barcode: '8901234567891' },
  { id: 'itm-003', name: 'MRE Rations (1-yr pack)', category: 'Food', unit: 'carton', criticality: 'high', shelf_life_days: 730, storage_condition: 'Dry, <25C', barcode: '8901234567892' },
  { id: 'itm-004', name: 'Medical Kit - Type A', category: 'Medical', unit: 'kit', criticality: 'critical', shelf_life_days: 365, storage_condition: '2-8C refrigerated', barcode: '8901234567893' },
  { id: 'itm-005', name: 'Oxygen Cylinder (50L)', category: 'Medical', unit: 'unit', criticality: 'critical', shelf_life_days: 0, storage_condition: 'Upright, away from heat', barcode: '8901234567894' },
  { id: 'itm-006', name: 'Snow Scooter Spare Parts', category: 'Vehicle', unit: 'set', criticality: 'high', shelf_life_days: 1825, storage_condition: 'Dry, covered', barcode: '8901234567895' },
  { id: 'itm-007', name: 'Scientific Instruments (Seismic)', category: 'Equipment', unit: 'unit', criticality: 'high', shelf_life_days: 3650, storage_condition: 'Dry, stable temp', barcode: '8901234567896' },
  { id: 'itm-008', name: 'Emergency Tent (8-person)', category: 'Emergency', unit: 'unit', criticality: 'critical', shelf_life_days: 3650, storage_condition: 'Dry', barcode: '8901234567897' },
];

export const stockTransactions = [
  { id: 'txn-001', item_id: 'itm-001', station: 'Bharati', type: 'issue', quantity: -2.5, unit: 'kL', date: '2026-09-10', performed_by: 'K. Sharma', reference: 'Daily ops - helicopter fuel', barcode_scanned: true },
  { id: 'txn-002', item_id: 'itm-003', station: 'Maitri', type: 'receipt', quantity: 45, unit: 'carton', date: '2026-09-08', performed_by: 'L. Nair', reference: 'Supply from MV Sagar Nidhi', barcode_scanned: true },
  { id: 'txn-003', item_id: 'itm-004', station: 'Maitri', type: 'issue', quantity: -2, unit: 'kit', date: '2026-09-09', performed_by: 'Dr. P. Singh', reference: 'Medical emergency - frostbite', barcode_scanned: false },
  { id: 'txn-004', item_id: 'itm-006', station: 'Bharati', type: 'issue', quantity: -1, unit: 'set', date: '2026-09-07', performed_by: 'R. Rao', reference: 'Snow scooter breakdown repair', barcode_scanned: true },
];

export const expeditionTeams = [
  { id: 'team-alpha', name: 'Team Alpha', station: 'Maitri', status: 'active', active_count: 24, mission: 'Atmospheric Science', lead: 'Dr. R. Venkataraman', deployed_since: '2026-07-15', eta_return: '2026-11-30', priority: 'high' },
  { id: 'team-ice-core', name: 'Ice Core Team', station: 'Field - Schirmacher Oasis', status: 'field', active_count: 8, mission: 'Paleoclimate Drilling', lead: 'Dr. S. Bhattacharya', deployed_since: '2026-08-02', eta_return: '2026-09-25', priority: 'critical' },
  { id: 'team-geo', name: 'Geophysics Unit', station: 'Bharati', status: 'active', active_count: 16, mission: 'Seismic Monitoring', lead: 'Dr. P. Krishnamurthy', deployed_since: '2026-07-28', eta_return: '2026-12-10', priority: 'normal' },
  { id: 'team-bio', name: 'Marine Biology Unit', station: 'Bharati', status: 'standby', active_count: 6, mission: 'Ocean Sampling', lead: 'Dr. A. Nair', deployed_since: '2026-08-20', eta_return: '2026-10-15', priority: 'normal' },
];

export const expeditions = [
  {
    id: 'exp-44', name: 'Indian Scientific Expedition to Antarctica - 44', short_name: 'ISEA-44', season: '2026-27',
    status: 'active', stations: ['Maitri', 'Bharati'],
    objectives: ['Atmospheric & climate monitoring', 'Paleoclimate ice-core drilling', 'Marine ecology survey'],
    start_date: '2026-07-01', end_date: '2027-03-31',
    team_count: 54, budget_crore: 48.5, budget_spent_crore: 22.1,
    cargo_planned_mt: 320, cargo_dispatched_mt: 180, cargo_received_mt: 95,
    milestones: [
      { id: 'm-01', title: 'Scientific plan approval', due: '2026-05-15', status: 'completed' },
      { id: 'm-02', title: 'Personnel medical clearance', due: '2026-06-01', status: 'completed' },
      { id: 'm-03', title: 'Cargo consolidation - Goa Hub', due: '2026-07-20', status: 'completed' },
      { id: 'm-04', title: 'MV Sagar Nidhi departure', due: '2026-09-06', status: 'completed' },
      { id: 'm-05', title: 'Bharati station resupply', due: '2026-09-20', status: 'in-progress' },
      { id: 'm-06', title: 'Winter team rotation', due: '2026-11-15', status: 'pending' },
      { id: 'm-07', title: 'Season closeout - Maitri', due: '2027-03-01', status: 'pending' },
    ],
    approvals: {
      scientific: { status: 'approved', by: 'Dr. M. Ravichandran', date: '2026-04-20' },
      logistics: { status: 'approved', by: 'Cmdr. S. Kulkarni', date: '2026-04-25' },
      finance: { status: 'approved', by: 'A. Mehta', date: '2026-05-02' },
      safety: { status: 'approved', by: 'Dr. T. Sharma', date: '2026-05-05' },
    },
    capacity_checks: {
      berths_maitri: { used: 42, total: 50 },
      berths_bharati: { used: 28, total: 30 },
      storage_maitri_m3: { used: 410, total: 500 },
      storage_bharati_m3: { used: 280, total: 300 },
      lab_space_bharati: { used: 8, total: 10 },
    },
  },
  {
    id: 'exp-43', name: 'Indian Scientific Expedition to Antarctica - 43', short_name: 'ISEA-43', season: '2025-26',
    status: 'completed', stations: ['Maitri', 'Bharati'],
    objectives: ['Ocean floor mapping', 'Glacier dynamics study'],
    start_date: '2025-07-01', end_date: '2026-03-31',
    team_count: 48, budget_crore: 43.2, budget_spent_crore: 43.2,
    cargo_planned_mt: 290, cargo_dispatched_mt: 290, cargo_received_mt: 288,
    milestones: [],
    approvals: { scientific: { status: 'approved' }, logistics: { status: 'approved' }, finance: { status: 'approved' }, safety: { status: 'approved' } },
    capacity_checks: {},
  },
  {
    id: 'exp-him-06', name: 'Himadri Arctic Expedition - 06', short_name: 'HAE-06', season: '2026',
    status: 'planning', stations: ['Himadri'],
    objectives: ['Arctic permafrost monitoring', 'Sea-ice extent mapping'],
    start_date: '2026-06-01', end_date: '2026-09-30',
    team_count: 12, budget_crore: 8.5, budget_spent_crore: 1.2,
    cargo_planned_mt: 40, cargo_dispatched_mt: 0, cargo_received_mt: 0,
    milestones: [
      { id: 'hm-01', title: 'Scientific plan submission', due: '2026-03-01', status: 'completed' },
      { id: 'hm-02', title: 'Logistics clearance', due: '2026-04-01', status: 'pending' },
    ],
    approvals: { scientific: { status: 'approved', by: 'Dr. K. Agarwal', date: '2026-03-15' }, logistics: { status: 'pending' }, finance: { status: 'pending' }, safety: { status: 'pending' } },
    capacity_checks: {},
  },
];

export const cargoVessels = [
  {
    id: 'vessel-sn-001', vessel_name: 'MV Sagar Nidhi', voyage_id: 'SN-2026-04', status: 'en_route',
    current_location: { lat: -38.2, lon: 22.1, label: 'Southern Ocean' },
    origin: 'Cape Town, South Africa', destination: 'Antarctic Ice Shelf - Bharati Approach',
    departed_at: '2026-09-06T08:00:00Z', eta: '2026-09-14T12:00:00Z', eta_days: 4,
    stops: [
      { name: 'Bharati', order: 1, eta: '2026-09-14T12:00:00Z', cargo_items: 3 },
      { name: 'Maitri', order: 2, eta: '2026-09-20T08:00:00Z', cargo_items: 2 },
    ],
    cargo_manifest: [
      { item: 'Aviation Fuel (Jet A-1)', quantity: '45,000 L', priority: 'critical', destination: 'Bharati', stowage_zone: 'Deck A - Tank 3' },
      { item: 'Scientific Equipment', quantity: '12 crates', priority: 'high', destination: 'Bharati', stowage_zone: 'Hold 2 - Section B' },
      { item: 'Winter Provisions', quantity: '8.2 tons', priority: 'high', destination: 'Maitri', stowage_zone: 'Hold 1 - Section A' },
      { item: 'Vehicle Spare Parts', quantity: '3 pallets', priority: 'normal', destination: 'Maitri', stowage_zone: 'Hold 1 - Section C' },
      { item: 'Medical Supplies', quantity: '2 crates', priority: 'critical', destination: 'Bharati', stowage_zone: 'Hold 2 - Section A' },
    ],
    tracking_events: [
      { id: 'ev-001', timestamp: '2026-09-06T08:00:00Z', event: 'Departed Cape Town', location: 'Cape Town', status: 'completed', signed_by: 'Capt. V. Reddy' },
      { id: 'ev-002', timestamp: '2026-09-08T14:30:00Z', event: 'Crossed 40S - Entered Roaring Forties', location: '40S 20E', status: 'completed', signed_by: 'Auto-AIS' },
      { id: 'ev-003', timestamp: '2026-09-10T06:00:00Z', event: 'Crossing Southern Ocean - Active', location: '55S 22E', status: 'active', signed_by: null },
      { id: 'ev-004', timestamp: null, event: 'Approaching Antarctic Convergence Zone', location: '65S', status: 'pending', signed_by: null },
      { id: 'ev-005', timestamp: null, event: 'ETA Ice Shelf Approach - Bharati', location: 'Prydz Bay', status: 'pending', signed_by: null },
    ],
  },
];

export const cargoIndents = [
  { id: 'ind-001', expedition_id: 'exp-44', raised_by: 'Dr. P. Krishnamurthy', station: 'Bharati', category: 'Scientific Equipment', items: [{ name: 'Seismometer Array', qty: 3, unit: 'unit', weight_kg: 45, volume_m3: 0.5 }], status: 'approved', priority: 'high', raised_date: '2026-05-10', approved_date: '2026-05-18', approved_by: 'Cmdr. S. Kulkarni', notes: 'Required for seismic baseline survey' },
  { id: 'ind-002', expedition_id: 'exp-44', raised_by: 'Dr. A. Nair', station: 'Bharati', category: 'Lab Consumables', items: [{ name: 'Water Sampling Bottles', qty: 200, unit: 'unit', weight_kg: 20, volume_m3: 0.2 }], status: 'approved', priority: 'normal', raised_date: '2026-05-15', approved_date: '2026-05-22', approved_by: 'Cmdr. S. Kulkarni', notes: 'Ocean sampling program' },
  { id: 'ind-003', expedition_id: 'exp-44', raised_by: 'Stn Incharge Bharati', station: 'Bharati', category: 'Provisions', items: [{ name: 'MRE Rations 2026-27', qty: 5000, unit: 'meals', weight_kg: 1250, volume_m3: 8.0 }], status: 'dispatched', priority: 'high', raised_date: '2026-05-05', approved_date: '2026-05-12', approved_by: 'Cmdr. S. Kulkarni', notes: 'Full winter season rations' },
  { id: 'ind-004', expedition_id: 'exp-44', raised_by: 'Dr. R. Venkataraman', station: 'Maitri', category: 'Meteorological Equipment', items: [{ name: 'Radiosonde Set', qty: 100, unit: 'unit', weight_kg: 5, volume_m3: 0.1 }], status: 'pending', priority: 'high', raised_date: '2026-09-01', approved_date: null, approved_by: null, notes: 'Awaiting logistics clearance' },
];

export const personnel = [
  { id: 'prs-001', name: 'Dr. Rahul Venkataraman', role: 'Atmospheric Scientist', affiliation: 'IITM Pune', station: 'Maitri', expedition_id: 'exp-44', status: 'deployed', team: 'team-alpha', contact: '+91-9876543210', emergency_contact: 'Priya Venkataraman +91-9876543211', arrival_date: '2026-07-15', departure_date: '2026-11-30', clearances: { medical: 'approved', training: 'approved', admin: 'approved' }, movement_log: [{ event: 'Departed Goa', location: 'Goa Hub', timestamp: '2026-07-10T06:00:00Z', mode: 'Sea voyage' }, { event: 'Arrived Cape Town', location: 'Cape Town', timestamp: '2026-07-14T14:00:00Z', mode: 'Sea voyage' }, { event: 'Arrived Maitri', location: 'Maitri', timestamp: '2026-07-15T09:00:00Z', mode: 'Air - IL-76' }] },
  { id: 'prs-002', name: 'Dr. Sunita Bhattacharya', role: 'Glaciologist', affiliation: 'NCPOR', station: 'Field - Schirmacher Oasis', expedition_id: 'exp-44', status: 'field', team: 'team-ice-core', contact: '+91-9988776655', emergency_contact: 'A. Bhattacharya +91-9988776656', arrival_date: '2026-08-02', departure_date: '2026-09-25', clearances: { medical: 'approved', training: 'approved', admin: 'approved' }, movement_log: [{ event: 'Departed Maitri for field camp', location: 'Maitri', timestamp: '2026-08-02T07:00:00Z', mode: 'Helicopter' }] },
  { id: 'prs-003', name: 'Dr. Priya Krishnamurthy', role: 'Geophysicist', affiliation: 'CSIR-NIO', station: 'Bharati', expedition_id: 'exp-44', status: 'deployed', team: 'team-geo', contact: '+91-9911223344', emergency_contact: 'S. Krishnamurthy +91-9911223345', arrival_date: '2026-07-28', departure_date: '2026-12-10', clearances: { medical: 'approved', training: 'approved', admin: 'approved' }, movement_log: [] },
  { id: 'prs-004', name: 'Dr. Arjun Nair', role: 'Marine Biologist', affiliation: 'CMFRI', station: 'Bharati', expedition_id: 'exp-44', status: 'standby', team: 'team-bio', contact: '+91-9900112233', emergency_contact: 'M. Nair +91-9900112234', arrival_date: '2026-08-20', departure_date: '2026-10-15', clearances: { medical: 'approved', training: 'pending', admin: 'approved' }, movement_log: [] },
  { id: 'prs-005', name: 'Lt. Cmdr. Vikram Singh', role: 'Station In-Charge', affiliation: 'Indian Navy', station: 'Maitri', expedition_id: 'exp-44', status: 'deployed', team: 'team-alpha', contact: '+91-9012345678', emergency_contact: 'Neha Singh +91-9012345679', arrival_date: '2026-07-15', departure_date: '2027-01-15', clearances: { medical: 'approved', training: 'approved', admin: 'approved' }, movement_log: [] },
  { id: 'prs-006', name: 'Dr. Kavita Sharma', role: 'Medical Officer', affiliation: 'AFMC', station: 'Maitri', expedition_id: 'exp-44', status: 'deployed', team: 'team-alpha', contact: '+91-9555666777', emergency_contact: 'R. Sharma +91-9555666778', arrival_date: '2026-07-15', departure_date: '2026-11-30', clearances: { medical: 'approved', training: 'approved', admin: 'approved' }, movement_log: [] },
  { id: 'prs-007', name: 'Ramesh Kumar', role: 'Logistics Officer', affiliation: 'NCPOR', station: 'Goa Hub', expedition_id: 'exp-44', status: 'at-hub', team: null, contact: '+91-9876512345', emergency_contact: 'S. Kumar +91-9876512346', arrival_date: '2026-06-01', departure_date: '2027-04-30', clearances: { medical: 'approved', training: 'approved', admin: 'approved' }, movement_log: [] },
];

export const systemAlerts = [
  { id: 'alert-001', severity: 'warning', message: 'Vehicle Spares at Bharati below warning threshold (31%)', station: 'Bharati', timestamp: '2026-09-10T05:42:00Z', acknowledged: false, module: 'inventory' },
  { id: 'alert-002', severity: 'info', message: 'Weather window open for Maitri helipad operations - next 48h', station: 'Maitri', timestamp: '2026-09-10T04:00:00Z', acknowledged: false, module: 'weather' },
  { id: 'alert-003', severity: 'critical', message: 'Ice Core Team: Satellite comms degraded - last contact 3h ago', station: 'Field', timestamp: '2026-09-10T09:30:00Z', acknowledged: false, module: 'personnel' },
  { id: 'alert-004', severity: 'warning', message: 'Maitri Aviation Fuel projected stock-out in 14 days at current rate', station: 'Maitri', timestamp: '2026-09-10T06:00:00Z', acknowledged: false, module: 'inventory' },
  { id: 'alert-005', severity: 'info', message: 'MV Sagar Nidhi ETA updated: 4 days to Bharati Ice Shelf approach', station: 'Bharati', timestamp: '2026-09-10T08:15:00Z', acknowledged: false, module: 'cargo' },
];

export const stationKPIs = [
  { station: 'Maitri', lat: -70.7669, lon: 11.7253, personnel: 48, status: 'operational', temp_c: -34, wind_kph: 67, visibility: 'Poor', emergency_readiness: 'ready' },
  { station: 'Bharati', lat: -69.4063, lon: 76.1917, personnel: 28, status: 'operational', temp_c: -22, wind_kph: 43, visibility: 'Moderate', emergency_readiness: 'ready' },
];

export const incidents = [
  { id: 'inc-001', station: 'Maitri', severity: 'high', type: 'Medical', title: 'Frostbite - Team Member', description: 'Team member sustained frostbite (Grade 2) on field excursion. Medical officer attending. Patient stable.', reported_by: 'Dr. K. Sharma', reported_at: '2026-09-08T14:30:00Z', status: 'resolved', location: 'Maitri - South access route', escalated: false, escalation_level: 1, resolution: 'Treated on-site. Return to full duty in 5 days.', attachments: [] },
  { id: 'inc-002', station: 'Bharati', severity: 'medium', type: 'Equipment Failure', title: 'Generator #2 Outage', description: 'Main backup generator failed due to fuel filter blockage. Running on Generator #1 only. Maintenance team dispatched.', reported_by: 'R. Singh', reported_at: '2026-09-09T22:15:00Z', status: 'in-progress', location: 'Bharati - Generator Room', escalated: true, escalation_level: 2, resolution: null, attachments: [] },
  { id: 'inc-003', station: 'Field', severity: 'critical', type: 'Communication', title: 'Satellite Comms Loss - Ice Core Team', description: 'Ice Core team at Schirmacher Oasis has not reported in for 3 hours. Last known position logged. Search & rescue protocol initiated.', reported_by: 'Lt. Cmdr. V. Singh', reported_at: '2026-09-10T09:30:00Z', status: 'active', location: 'Schirmacher Oasis - Grid F-12', escalated: true, escalation_level: 3, resolution: null, attachments: [] },
];

export const emergencyResources = [
  { station: 'Maitri', resources: [{ name: 'Medical Kit - Trauma', qty: 4, status: 'available', last_checked: '2026-09-01' }, { name: 'Oxygen Cylinders (50L)', qty: 12, status: 'available', last_checked: '2026-09-01' }, { name: 'Emergency Tents (8-person)', qty: 3, status: 'available', last_checked: '2026-08-15' }, { name: 'Snow Scooters (rescue-fitted)', qty: 2, status: 'available', last_checked: '2026-09-05' }, { name: 'Rescue Sleds', qty: 4, status: 'available', last_checked: '2026-09-05' }, { name: 'Emergency Fuel (diesel)', qty: 500, unit: 'L', status: 'available', last_checked: '2026-09-01' }, { name: 'SAR Radio Sets', qty: 6, status: 'available', last_checked: '2026-09-01' }, { name: 'Flares / Signaling Kit', qty: 8, status: 'available', last_checked: '2026-08-20' }] },
  { station: 'Bharati', resources: [{ name: 'Medical Kit - Trauma', qty: 3, status: 'available', last_checked: '2026-09-02' }, { name: 'Oxygen Cylinders (50L)', qty: 8, status: 'available', last_checked: '2026-09-02' }, { name: 'Emergency Tents (8-person)', qty: 2, status: 'available', last_checked: '2026-08-20' }, { name: 'Snow Scooters (rescue-fitted)', qty: 2, status: '1 under maintenance', last_checked: '2026-09-08' }, { name: 'Rescue Boats (inflatable)', qty: 2, status: 'available', last_checked: '2026-09-02' }, { name: 'Emergency Fuel (diesel)', qty: 300, unit: 'L', status: 'available', last_checked: '2026-09-02' }, { name: 'SAR Radio Sets', qty: 4, status: 'available', last_checked: '2026-09-02' }] },
];

export const emergencySOPs = [
  { id: 'sop-001', station: 'all', type: 'Medical', title: 'Medical Emergency Response Protocol', version: '3.2', last_updated: '2026-01-15', url: '#' },
  { id: 'sop-002', station: 'all', type: 'Fire', title: 'Fire Emergency & Evacuation SOP', version: '2.1', last_updated: '2026-01-15', url: '#' },
  { id: 'sop-003', station: 'all', type: 'Weather', title: 'Blizzard / Whiteout Protocol', version: '1.8', last_updated: '2025-12-01', url: '#' },
  { id: 'sop-004', station: 'all', type: 'Search & Rescue', title: 'Search & Rescue (SAR) Operations Manual', version: '2.5', last_updated: '2026-02-20', url: '#' },
  { id: 'sop-005', station: 'Maitri', type: 'Evacuation', title: 'Maitri Station Evacuation Plan', version: '1.4', last_updated: '2026-03-01', url: '#' },
  { id: 'sop-006', station: 'Bharati', type: 'Evacuation', title: 'Bharati Station Evacuation Plan', version: '1.2', last_updated: '2026-03-05', url: '#' },
  { id: 'sop-007', station: 'all', type: 'Communication', title: 'Communication Failure Contingency', version: '2.0', last_updated: '2026-01-10', url: '#' },
];

export const drillLogs = [
  { id: 'drill-001', station: 'Maitri', type: 'Fire Drill', date: '2026-08-15', conducted_by: 'Lt. Cmdr. V. Singh', participants: 46, outcome: 'Passed', notes: 'Full evacuation in 4m 20s. Below 5-min target.' },
  { id: 'drill-002', station: 'Bharati', type: 'Medical Evacuation Drill', date: '2026-08-22', conducted_by: 'Dr. P. Krishnamurthy', participants: 26, outcome: 'Passed', notes: 'Minor delay in accessing medical kit - kit relocated.' },
  { id: 'drill-003', station: 'Maitri', type: 'SAR Drill', date: '2026-09-01', conducted_by: 'Lt. Cmdr. V. Singh', participants: 12, outcome: 'Passed', notes: 'Night SAR exercise. All team located within 45 minutes.' },
];

export const analyticsData = {
  cargo_reconciliation: {
    planned: 320, dispatched: 180, received: 95, pending_dispatch: 140, in_transit: 85,
    by_category: [
      { name: 'Fuel', planned: 80, dispatched: 80, received: 45 },
      { name: 'Provisions', planned: 70, dispatched: 50, received: 50 },
      { name: 'Equipment', planned: 100, dispatched: 30, received: 0 },
      { name: 'Spares', planned: 40, dispatched: 10, received: 0 },
      { name: 'Medical', planned: 30, dispatched: 10, received: 0 },
    ],
  },
  inventory_trends: [
    { month: 'May', fuel_bharati: 100, fuel_maitri: 100, rations_bharati: 100, rations_maitri: 100 },
    { month: 'Jun', fuel_bharati: 95, fuel_maitri: 90, rations_bharati: 98, rations_maitri: 97 },
    { month: 'Jul', fuel_bharati: 88, fuel_maitri: 78, rations_bharati: 95, rations_maitri: 94 },
    { month: 'Aug', fuel_bharati: 80, fuel_maitri: 68, rations_bharati: 90, rations_maitri: 92 },
    { month: 'Sep', fuel_bharati: 68, fuel_maitri: 54, rations_bharati: 82, rations_maitri: 91 },
  ],
  personnel_distribution: [
    { station: 'Maitri', count: 48 }, { station: 'Bharati', count: 28 },
    { station: 'Field', count: 8 }, { station: 'Himadri', count: 6 }, { station: 'Goa Hub', count: 12 },
  ],
  budget_utilization: [
    { month: 'Apr', spent: 2.1 }, { month: 'May', spent: 4.8 },
    { month: 'Jun', spent: 3.5 }, { month: 'Jul', spent: 5.2 },
    { month: 'Aug', spent: 3.9 }, { month: 'Sep', spent: 2.6 },
  ],
};

const SIMULATED_DELAY_MS = 1200;
export const fetchInventory = (station = 'Bharati') => new Promise((resolve) => setTimeout(() => resolve(inventoryData.filter((d) => d.station === station)), SIMULATED_DELAY_MS));
export const fetchAllInventory = () => new Promise((resolve) => setTimeout(() => resolve(inventoryData), SIMULATED_DELAY_MS));
export const fetchItemMaster = () => new Promise((resolve) => setTimeout(() => resolve(itemMaster), SIMULATED_DELAY_MS - 200));
export const fetchStockTransactions = () => new Promise((resolve) => setTimeout(() => resolve(stockTransactions), SIMULATED_DELAY_MS));
export const fetchExpeditionTeams = () => new Promise((resolve) => setTimeout(() => resolve(expeditionTeams), SIMULATED_DELAY_MS - 200));
export const fetchCargoVessels = () => new Promise((resolve) => setTimeout(() => resolve(cargoVessels), SIMULATED_DELAY_MS + 100));
export const fetchCargoIndents = () => new Promise((resolve) => setTimeout(() => resolve(cargoIndents), SIMULATED_DELAY_MS));
export const fetchAlerts = () => new Promise((resolve) => setTimeout(() => resolve(systemAlerts), 300));
export const fetchStationKPIs = () => new Promise((resolve) => setTimeout(() => resolve(stationKPIs), 400));
export const fetchExpeditions = () => new Promise((resolve) => setTimeout(() => resolve(expeditions), SIMULATED_DELAY_MS - 300));
export const fetchPersonnel = () => new Promise((resolve) => setTimeout(() => resolve(personnel), SIMULATED_DELAY_MS));
export const fetchIncidents = () => new Promise((resolve) => setTimeout(() => resolve(incidents), 500));
export const fetchEmergencyResources = () => new Promise((resolve) => setTimeout(() => resolve(emergencyResources), 600));
export const fetchEmergencySOPs = () => new Promise((resolve) => setTimeout(() => resolve(emergencySOPs), 400));
export const fetchDrillLogs = () => new Promise((resolve) => setTimeout(() => resolve(drillLogs), 400));
export const fetchAnalytics = () => new Promise((resolve) => setTimeout(() => resolve(analyticsData), SIMULATED_DELAY_MS));

// ─── Dashboard alias exports (for DashboardPage compatibility) ───
export const fetchStationStatus = () => new Promise((resolve) => setTimeout(() => resolve(stationKPIs), 400));
export const fetchDashboardCargo = () => new Promise((resolve) => setTimeout(() => resolve(cargoVessels), SIMULATED_DELAY_MS + 100));
export const fetchDashboardInventory = () => new Promise((resolve) => setTimeout(() => resolve(inventoryData), SIMULATED_DELAY_MS));
export const fetchDeployments = () => new Promise((resolve) => setTimeout(() => resolve(expeditionTeams), SIMULATED_DELAY_MS - 200));
