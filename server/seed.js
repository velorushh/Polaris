const { getDB, saveDB } = require("./db");
const SEED = require("./seedData");

async function seed() {
  const db = await getDB();
  console.log("Seeding Polaris SQLite database...");

  for (const u of SEED.users)
    db.run("INSERT OR REPLACE INTO users VALUES (?,?,?,?,?,?)",[u.id,u.username,u.password,u.name,u.role,u.avatar]);
  console.log("Users:", SEED.users.length);

  for (const s of SEED.station_kpis)
    db.run("INSERT OR REPLACE INTO station_kpis VALUES (?,?,?,?,?,?,?,?,?,?)",[s.id,s.station,s.lat,s.lon,s.personnel,s.status,s.temp_c,s.wind_kph,s.visibility,s.emergency_readiness]);
  console.log("Stations:", SEED.station_kpis.length);

  for (const t of SEED.teams)
    db.run("INSERT OR REPLACE INTO expedition_teams VALUES (?,?,?,?,?,?,?,?,?,?,?)",[t.id,t.name,t.station,t.status,t.active_count,t.mission,t.lead,t.deployed_since,t.eta_return,t.priority,"synced"]);
  console.log("Teams:", SEED.teams.length);

  for (const i of SEED.inventory)
    db.run("INSERT OR REPLACE INTO inventory_items VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[i.id,i.station,i.category,i.current,i.capacity,i.unit,i.threshold_warning,i.threshold_critical,i.shelf_life_days,i.storage_condition,i.criticality,i.consumption_rate,i.days_to_next_resupply,null,"synced"]);
  console.log("Inventory:", SEED.inventory.length);

  for (const a of SEED.alerts)
    db.run("INSERT OR REPLACE INTO system_alerts VALUES (?,?,?,?,?,?,?)",[a.id,a.severity,a.message,a.station,a.timestamp,a.acknowledged?1:0,a.type]);
  console.log("Alerts:", SEED.alerts.length);

  // Hardcoded expeditions
  const exps = [
    { id:"isea-44", name:"Indian Scientific Expedition to Antarctica - 44th", short_name:"ISEA-44", season:"2026-27", status:"active", stations:["Maitri","Bharati"], objectives:["Atmospheric research","Glaciological studies","Marine biology","Geophysical surveys"], start_date:"2026-07-15", end_date:"2027-03-30", team_count:76, budget_crore:112, budget_spent_crore:43.2, cargo_planned_mt:280, cargo_dispatched_mt:195, cargo_received_mt:180, milestones:[{id:"ms-001",title:"Pre-expedition Training",due:"2026-07-01",status:"completed"},{id:"ms-002",title:"Cargo Loading at Goa Port",due:"2026-07-20",status:"completed"},{id:"ms-003",title:"Vessel Departure from Cape Town",due:"2026-08-05",status:"completed"},{id:"ms-004",title:"Bharati Station Resupply",due:"2026-08-18",status:"completed"},{id:"ms-005",title:"Maitri Changeover",due:"2026-09-10",status:"in-progress"},{id:"ms-006",title:"Field Camp Establishment",due:"2026-09-25",status:"pending"},{id:"ms-007",title:"Ice Core Drilling Campaign",due:"2026-11-01",status:"pending"},{id:"ms-008",title:"Return Voyage Preparation",due:"2027-02-28",status:"pending"}], approvals:{scientific:{status:"approved",by:"Dr. M. Ravichandran",date:"2026-05-10"},logistics:{status:"approved",by:"Cmdr. S. Kulkarni",date:"2026-05-15"},finance:{status:"approved",by:"Smt. R. Pillai",date:"2026-05-18"},safety:{status:"approved",by:"Dr. K. Sharma",date:"2026-05-20"}}, capacity_checks:{vessel_tonnage:{used:195,total:280},bunk_capacity:{used:76,total:90},cold_storage:{used:42,total:60}} },
    { id:"isea-43", name:"ISEA - 43rd Edition", short_name:"ISEA-43", season:"2025-26", status:"completed", stations:["Maitri","Bharati"], objectives:["Ice sheet dynamics","Atmospheric research"], start_date:"2025-07-10", end_date:"2026-04-15", team_count:68, budget_crore:98, budget_spent_crore:97.5, cargo_planned_mt:260, cargo_dispatched_mt:258, cargo_received_mt:255, milestones:[], approvals:{scientific:{status:"approved"},logistics:{status:"approved"},finance:{status:"approved"},safety:{status:"approved"}}, capacity_checks:{} },
    { id:"hae-06",  name:"Himadri Arctic Expedition 2026", short_name:"HAE-06", season:"2026", status:"active", stations:["Himadri"], objectives:["Arctic sea-ice monitoring","Atmospheric aerosol studies"], start_date:"2026-06-01", end_date:"2026-09-30", team_count:12, budget_crore:22, budget_spent_crore:14.8, cargo_planned_mt:45, cargo_dispatched_mt:44, cargo_received_mt:44, milestones:[], approvals:{scientific:{status:"approved"},logistics:{status:"approved"},finance:{status:"approved"},safety:{status:"approved"}}, capacity_checks:{} },
  ];
  for (const e of exps)
    db.run("INSERT OR REPLACE INTO expeditions VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[e.id,e.name,e.short_name,e.season,e.status,JSON.stringify(e.stations),JSON.stringify(e.objectives),e.start_date,e.end_date,e.team_count,e.budget_crore,e.budget_spent_crore,e.cargo_planned_mt,e.cargo_dispatched_mt,e.cargo_received_mt,JSON.stringify(e.milestones),JSON.stringify(e.approvals),JSON.stringify(e.capacity_checks),"synced"]);
  console.log("Expeditions:", exps.length);

  // Vessel
  const vessel = { id:"vessel-sn-001", vessel_name:"MV Sagar Nidhi", voyage_id:"SN-2026-04", status:"en_route", current_location:{lat:-38.2,lon:22.1,label:"Southern Ocean"}, origin:"Cape Town, South Africa", destination:"Antarctic Ice Shelf - Bharati Approach", departed_at:"2026-09-06T08:00:00Z", eta:"2026-09-14T12:00:00Z", eta_days:4, stops:[{name:"Bharati",order:1,eta:"2026-09-14T12:00:00Z",cargo_items:3},{name:"Maitri",order:2,eta:"2026-09-20T08:00:00Z",cargo_items:2}], cargo_manifest:[{item:"Aviation Fuel (Jet A-1)",quantity:"45,000 L",priority:"critical",destination:"Bharati",stowage_zone:"Deck A - Tank 3"},{item:"Scientific Equipment",quantity:"12 crates",priority:"high",destination:"Bharati",stowage_zone:"Hold 2 - Section B"},{item:"Winter Provisions",quantity:"8.2 tons",priority:"high",destination:"Maitri",stowage_zone:"Hold 1 - Section A"},{item:"Vehicle Spare Parts",quantity:"3 pallets",priority:"normal",destination:"Maitri",stowage_zone:"Hold 1 - Section C"},{item:"Medical Supplies",quantity:"2 crates",priority:"critical",destination:"Bharati",stowage_zone:"Hold 2 - Section A"}], tracking_events:[{id:"te-001",event:"Cargo Loading Complete",location:"Goa Port",status:"completed",timestamp:"2026-09-05T18:00:00Z",signed_by:"Port Officer J. Pereira"},{id:"te-002",event:"Departed Goa",location:"Goa Port",status:"completed",timestamp:"2026-09-06T08:00:00Z",signed_by:"Capt. R. Nambiar"},{id:"te-003",event:"Arrived Cape Town",location:"Cape Town",status:"completed",timestamp:"2026-09-09T14:30:00Z",signed_by:"Cape Town Port Auth."},{id:"te-004",event:"Resupply & Bunkering",location:"Cape Town",status:"completed",timestamp:"2026-09-10T10:00:00Z",signed_by:"Capt. R. Nambiar"},{id:"te-005",event:"En Route to Bharati",location:"Southern Ocean",status:"active",timestamp:"2026-09-10T16:00:00Z",signed_by:null},{id:"te-006",event:"Bharati Unloading",location:"Bharati",status:"pending",timestamp:null,signed_by:null},{id:"te-007",event:"En Route to Maitri",location:"Southern Ocean",status:"pending",timestamp:null,signed_by:null},{id:"te-008",event:"Maitri Unloading Complete",location:"Maitri",status:"pending",timestamp:null,signed_by:null}] };
  db.run("INSERT OR REPLACE INTO cargo_vessels VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[vessel.id,vessel.vessel_name,vessel.voyage_id,vessel.status,JSON.stringify(vessel.current_location),vessel.origin,vessel.destination,vessel.departed_at,vessel.eta,vessel.eta_days,JSON.stringify(vessel.stops),JSON.stringify(vessel.cargo_manifest),JSON.stringify(vessel.tracking_events),"synced"]);
  console.log("Vessels: 1");

  // Indents
  const indents = [
    { id:"ind-001", exp:"isea-44", raised_by:"Dr. K. Sharma",        station:"Maitri",  category:"Medical & Emergency",   status:"approved",  priority:"critical", raised_date:"2026-07-10", approved_date:"2026-07-12", approved_by:"Cmdr. S. Kulkarni",      items:[{name:"Trauma Kit",qty:5,unit:"sets",weight_kg:8.5,volume_m3:0.03},{name:"Hypothermia Packs",qty:20,unit:"pcs",weight_kg:1.2,volume_m3:0.005}], notes:"Priority shipment" },
    { id:"ind-002", exp:"isea-44", raised_by:"Dr. P. Krishnamurthy", station:"Bharati", category:"Scientific Instruments", status:"dispatched", priority:"high",     raised_date:"2026-07-15", approved_date:"2026-07-18", approved_by:"Dr. R. Venkataraman",    items:[{name:"Seismograph Array",qty:3,unit:"sets",weight_kg:45,volume_m3:0.2},{name:"GPS Base Station",qty:2,unit:"units",weight_kg:12,volume_m3:0.05}], notes:"Coordinate with Ice Core team" },
    { id:"ind-003", exp:"isea-44", raised_by:"Lt. Cmdr. A. Prasad",  station:"Maitri",  category:"Fuel & Energy",          status:"received",   priority:"critical", raised_date:"2026-06-28", approved_date:"2026-07-01", approved_by:"Cmdr. S. Kulkarni",      items:[{name:"HSD",qty:50000,unit:"litres",weight_kg:42000,volume_m3:54.5},{name:"ATF",qty:20000,unit:"litres",weight_kg:16000,volume_m3:22}], notes:"Winter stock - 6 months" },
    { id:"ind-004", exp:"isea-44", raised_by:"Dr. A. Nair",          station:"Bharati", category:"Provisions & Rations",   status:"pending",    priority:"normal",   raised_date:"2026-09-01", approved_date:null,         approved_by:null,                     items:[{name:"Freeze-dried Meals",qty:800,unit:"packs",weight_kg:400,volume_m3:2}], notes:"Awaiting finance approval" },
  ];
  for (const i of indents)
    db.run("INSERT OR REPLACE INTO cargo_indents VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",[i.id,i.exp,i.raised_by,i.station,i.category,JSON.stringify(i.items),i.status,i.priority,i.raised_date,i.approved_date||null,i.approved_by||null,i.notes,"synced"]);
  console.log("Indents:", indents.length);

  // Item master
  const master = [
    { id:"im-001",name:"Aviation Turbine Fuel",  category:"Fuel",     unit:"Litres",criticality:"critical",shelf_life_days:365, storage_condition:"Sealed fuel tank",  barcode:"NCR-FUEL-ATF-001"},
    { id:"im-002",name:"High Speed Diesel",      category:"Fuel",     unit:"Litres",criticality:"critical",shelf_life_days:365, storage_condition:"Tank farm",         barcode:"NCR-FUEL-HSD-001"},
    { id:"im-003",name:"Kerosene (Heating)",     category:"Fuel",     unit:"Litres",criticality:"high",    shelf_life_days:365, storage_condition:"Tank farm",         barcode:"NCR-FUEL-KRS-001"},
    { id:"im-004",name:"Freeze-dried Meal (Veg)",category:"Rations",  unit:"Pack",  criticality:"critical",shelf_life_days:1095,storage_condition:"Cold/dry store",    barcode:"NCR-RATS-VEG-001"},
    { id:"im-005",name:"Trauma Kit - Advanced",  category:"Medical",  unit:"Set",   criticality:"critical",shelf_life_days:730, storage_condition:"Secure climate",    barcode:"NCR-MED-TKA-001"},
    { id:"im-006",name:"Medical Oxygen Cylinder",category:"Medical",  unit:"Kg",    criticality:"critical",shelf_life_days:0,   storage_condition:"Gas locker",        barcode:"NCR-MED-OXY-001"},
    { id:"im-007",name:"Seismograph - Portable", category:"Equipment",unit:"Unit",  criticality:"high",    shelf_life_days:0,   storage_condition:"Heated storage",    barcode:"NCR-EQP-SGR-001"},
  ];
  for (const m of master)
    db.run("INSERT OR REPLACE INTO item_master VALUES (?,?,?,?,?,?,?,?)",[m.id,m.name,m.category,m.unit,m.criticality,m.shelf_life_days,m.storage_condition,m.barcode]);
  console.log("Item master:", master.length);

  // Transactions
  const txns = [
    { id:"tx-001",item_id:"im-002",station:"Maitri",  type:"receipt",    quantity:10000,unit:"L",   date:"2026-08-20",performed_by:"Lt. Cmdr. A. Prasad",reference:"IND-003-RECEIPT-01",  barcode_scanned:1},
    { id:"tx-002",item_id:"im-002",station:"Maitri",  type:"issue",      quantity:-800, unit:"L",   date:"2026-08-21",performed_by:"Sgt. M. Kumar",       reference:"DAILY-ISSUE-0821",     barcode_scanned:1},
    { id:"tx-003",item_id:"im-001",station:"Bharati", type:"receipt",    quantity:45000,unit:"L",   date:"2026-08-18",performed_by:"Dr. P. Krishnamurthy",reference:"SN-2026-04-BHARATI",  barcode_scanned:0},
    { id:"tx-004",item_id:"im-005",station:"Maitri",  type:"issue",      quantity:-1,   unit:"Set", date:"2026-09-08",performed_by:"Dr. K. Sharma",       reference:"MED-INC001",           barcode_scanned:1},
    { id:"tx-005",item_id:"im-004",station:"Bharati", type:"issue",      quantity:-42,  unit:"Pack",date:"2026-09-10",performed_by:"Cook Incharge",       reference:"DAILY-MEALS-10SEP26", barcode_scanned:1},
  ];
  for (const t of txns)
    db.run("INSERT OR REPLACE INTO stock_transactions VALUES (?,?,?,?,?,?,?,?,?,?,?)",[t.id,t.item_id,t.station,t.type,t.quantity,t.unit,t.date,t.performed_by,t.reference,t.barcode_scanned,"synced"]);
  console.log("Transactions:", txns.length);

  // Personnel
  const personnel = [
    { id:"p-001",name:"Dr. Rajesh Venkataraman",  role:"Chief Scientist",       affiliation:"NIO Goa",        station:"Maitri",  exp:"isea-44",status:"deployed",team:"team-alpha",   contact:"+91-9876543210",emergency_contact:"+91-9876543211",arrival_date:"2026-07-15",departure_date:"2026-11-30",clearances:{medical:"approved",training:"approved",admin:"approved"},movement_log:[{event:"Arrived Maitri",location:"Maitri Station",timestamp:"2026-07-16T08:00:00Z",mode:"Helicopter"}]},
    { id:"p-002",name:"Dr. Kalpana Sharma",       role:"Medical Officer",        affiliation:"AFMC Pune",      station:"Maitri",  exp:"isea-44",status:"deployed",team:"team-alpha",   contact:"+91-9876543212",emergency_contact:"+91-9876543213",arrival_date:"2026-07-15",departure_date:"2026-11-30",clearances:{medical:"approved",training:"approved",admin:"approved"},movement_log:[]},
    { id:"p-003",name:"Dr. Sunita Bhattacharya",  role:"Glaciologist",           affiliation:"IACS Kolkata",   station:"Maitri",  exp:"isea-44",status:"field",   team:"team-ice-core",contact:"+91-9876543214",emergency_contact:"+91-9876543215",arrival_date:"2026-08-02",departure_date:"2026-09-25",clearances:{medical:"approved",training:"approved",admin:"approved"},movement_log:[{event:"Moved to Field Camp",location:"Schirmacher Oasis",timestamp:"2026-08-03T06:00:00Z",mode:"Snow vehicle"}]},
    { id:"p-004",name:"Dr. Pradeep Krishnamurthy",role:"Geophysicist",           affiliation:"NGRI Hyderabad", station:"Bharati", exp:"isea-44",status:"deployed",team:"team-geo",     contact:"+91-9876543216",emergency_contact:"+91-9876543217",arrival_date:"2026-07-28",departure_date:"2026-12-10",clearances:{medical:"approved",training:"approved",admin:"approved"},movement_log:[]},
    { id:"p-005",name:"Dr. Anita Nair",           role:"Marine Biologist",       affiliation:"CMFRI Kochi",    station:"Bharati", exp:"isea-44",status:"standby", team:"team-bio",     contact:"+91-9876543218",emergency_contact:"+91-9876543219",arrival_date:"2026-08-20",departure_date:"2026-10-15",clearances:{medical:"approved",training:"pending",admin:"approved"},movement_log:[]},
    { id:"p-006",name:"Lt. Cmdr. Arun Prasad",   role:"Station Commander",      affiliation:"Indian Navy",    station:"Maitri",  exp:"isea-44",status:"deployed",team:null,           contact:"+91-9876543220",emergency_contact:"+91-9876543221",arrival_date:"2026-07-15",departure_date:"2026-11-30",clearances:{medical:"approved",training:"approved",admin:"approved"},movement_log:[]},
    { id:"p-007",name:"Sgt. Mohan Kumar",         role:"Logistics NCO",          affiliation:"Indian Army",    station:"Maitri",  exp:"isea-44",status:"deployed",team:null,           contact:"+91-9876543222",emergency_contact:"+91-9876543223",arrival_date:"2026-07-15",departure_date:"2026-11-30",clearances:{medical:"approved",training:"approved",admin:"approved"},movement_log:[]},
    { id:"p-008",name:"Dr. Vikram Singh",         role:"Arctic Research Lead",   affiliation:"NCPOR Goa",      station:"Himadri", exp:"hae-06", status:"deployed",team:"team-himadri", contact:"+91-9876543224",emergency_contact:"+91-9876543225",arrival_date:"2026-06-01",departure_date:"2026-09-30",clearances:{medical:"approved",training:"approved",admin:"approved"},movement_log:[]},
    { id:"p-009",name:"Dr. Meera Joshi",          role:"Atmospheric Scientist",  affiliation:"IITM Pune",      station:"Himadri", exp:"hae-06", status:"deployed",team:"team-himadri", contact:"+91-9876543226",emergency_contact:"+91-9876543227",arrival_date:"2026-06-01",departure_date:"2026-09-30",clearances:{medical:"approved",training:"approved",admin:"pending"},movement_log:[]},
    { id:"p-010",name:"Cmdr. Suresh Kulkarni",    role:"Operations Coordinator", affiliation:"NCPOR Goa",      station:"at-hub",  exp:"isea-44",status:"at-hub",  team:null,           contact:"+91-9876543228",emergency_contact:"+91-9876543229",arrival_date:"2026-07-01",departure_date:"2027-04-01",clearances:{medical:"approved",training:"approved",admin:"approved"},movement_log:[]},
  ];
  for (const p of personnel)
    db.run("INSERT OR REPLACE INTO personnel VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[p.id,p.name,p.role,p.affiliation,p.station,p.exp,p.status,p.team||null,p.contact,p.emergency_contact,p.arrival_date,p.departure_date,JSON.stringify(p.clearances),JSON.stringify(p.movement_log),"synced"]);
  console.log("Personnel:", personnel.length);

  // Incidents
  const incidents = [
    { id:"inc-001",station:"Maitri",  severity:"high",    type:"Medical",           title:"Frostbite - Team Member",         desc:"Team member sustained frostbite (Grade 2). Patient stable.",              reported_by:"Dr. K. Sharma",       reported_at:"2026-09-08T14:30:00Z",status:"resolved",    location:"Maitri - South access route",escalated:false,escalation_level:1,resolution:"Treated with warming protocol. Returned to duty after 3 days."},
    { id:"inc-002",station:"Bharati", severity:"critical",type:"Equipment Failure",  title:"Generator Unit 2 - Complete Failure",desc:"Primary generator unit 2 failed. Station on backup Gen 3. Parts required.", reported_by:"Dr. P. Krishnamurthy",reported_at:"2026-09-09T22:15:00Z",status:"in-progress",location:"Bharati - Power plant",     escalated:true, escalation_level:2,resolution:null},
    { id:"inc-003",station:"Maitri",  severity:"medium",  type:"Communication",     title:"Satellite Link Degradation",      desc:"Primary VSAT 40% packet loss. Switched to backup INMARSAT.",               reported_by:"Lt. Cmdr. A. Prasad", reported_at:"2026-09-07T11:00:00Z",status:"resolved",    location:"Maitri - Comm room",         escalated:false,escalation_level:1,resolution:"VSAT recalibrated. Full bandwidth restored."},
  ];
  for (const i of incidents)
    db.run("INSERT OR REPLACE INTO incidents VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[i.id,i.station,i.severity,i.type,i.title,i.desc,i.reported_by,i.reported_at,i.status,i.location,i.escalated?1:0,i.escalation_level,i.resolution||null,"[]","synced",0]);
  console.log("Incidents:", incidents.length);

  // Emergency resources
  const resources = [
    { id:"er-001",station:"Maitri",  res:[{name:"Fire Extinguisher (CO2)",qty:12,unit:"units",status:"available",last_checked:"2026-09-01"},{name:"First Aid Kit",qty:8,unit:"kits",status:"available",last_checked:"2026-09-01"},{name:"Emergency Rations",qty:300,unit:"person-days",status:"available",last_checked:"2026-08-20"},{name:"Emergency Radio Beacon",qty:4,unit:"units",status:"available",last_checked:"2026-09-01"},{name:"Thermal Emergency Shelters",qty:6,unit:"units",status:"available",last_checked:"2026-09-05"},{name:"Snow Mobile",qty:3,unit:"units",status:"available",last_checked:"2026-09-03"},{name:"Helicopter (HAL Dhruv)",qty:1,unit:"unit",status:"available",last_checked:"2026-09-10"}]},
    { id:"er-002",station:"Bharati", res:[{name:"Fire Extinguisher (CO2)",qty:8,unit:"units",status:"available",last_checked:"2026-08-28"},{name:"First Aid Kit",qty:4,unit:"kits",status:"available",last_checked:"2026-08-28"},{name:"Emergency Rations",qty:180,unit:"person-days",status:"available",last_checked:"2026-08-15"},{name:"Generator (Emergency)",qty:2,unit:"units",status:"in-use",last_checked:"2026-09-09"}]},
    { id:"er-003",station:"Himadri", res:[{name:"Fire Extinguisher (CO2)",qty:6,unit:"units",status:"available",last_checked:"2026-09-05"},{name:"First Aid Kit",qty:3,unit:"kits",status:"available",last_checked:"2026-09-05"},{name:"Emergency Rations",qty:90,unit:"person-days",status:"available",last_checked:"2026-09-01"}]},
  ];
  for (const r of resources)
    db.run("INSERT OR REPLACE INTO emergency_resources VALUES (?,?,?,?)",[r.id,r.station,JSON.stringify(r.res),"synced"]);
  console.log("Emergency resources:", resources.length);

  // SOPs
  const sops = [
    { id:"sop-001",type:"Medical",         title:"Medical Emergency Response Protocol",     version:"3.2",last_updated:"2026-05-15",station:"all"    },
    { id:"sop-002",type:"Fire",            title:"Fire Response & Evacuation Procedure",    version:"2.8",last_updated:"2026-04-10",station:"all"    },
    { id:"sop-003",type:"Weather",         title:"Extreme Weather & Whiteout Protocol",     version:"2.1",last_updated:"2026-03-22",station:"Maitri" },
    { id:"sop-004",type:"Evacuation",      title:"Station Evacuation and Medevac Protocol", version:"4.0",last_updated:"2026-06-01",station:"all"    },
    { id:"sop-005",type:"Search & Rescue", title:"SAR Operations Manual - Polar Conditions",version:"3.5",last_updated:"2026-05-20",station:"all"    },
    { id:"sop-006",type:"Communication",   title:"Communication Failure Contingency Plan",  version:"2.0",last_updated:"2026-04-28",station:"all"    },
  ];
  for (const s of sops)
    db.run("INSERT OR REPLACE INTO emergency_sops VALUES (?,?,?,?,?,?,?)",[s.id,s.type,s.title,s.version,s.last_updated,s.station,null]);
  console.log("SOPs:", sops.length);

  // Drills
  const drills = [
    { id:"dl-001",type:"Fire Drill",              station:"Maitri",  date:"2026-08-15",participants:48,conducted_by:"Lt. Cmdr. A. Prasad",  outcome:"Passed",notes:"Evacuation in 3m 42s."},
    { id:"dl-002",type:"Medical Emergency Drill", station:"Maitri",  date:"2026-08-22",participants:48,conducted_by:"Dr. K. Sharma",        outcome:"Passed",notes:"Casualty stabilised within 8 min."},
    { id:"dl-003",type:"Communications Failure",  station:"Bharati", date:"2026-08-10",participants:28,conducted_by:"Dr. P. Krishnamurthy", outcome:"Passed",notes:"Backup comms activated."},
    { id:"dl-004",type:"Whiteout Drill",          station:"Maitri",  date:"2026-09-05",participants:10,conducted_by:"Lt. Cmdr. A. Prasad",  outcome:"Failed",notes:"Two members exceeded safe return time."},
    { id:"dl-005",type:"Fire Drill",              station:"Himadri", date:"2026-07-20",participants:12,conducted_by:"Dr. V. Singh",         outcome:"Passed",notes:"All personnel accounted."},
  ];
  for (const d of drills)
    db.run("INSERT OR REPLACE INTO drill_logs VALUES (?,?,?,?,?,?,?,?)",[d.id,d.type,d.station,d.date,d.participants,d.conducted_by,d.outcome,d.notes]);
  console.log("Drills:", drills.length);

  saveDB();
  console.log("\nDatabase seeded successfully -> polaris.db");
}

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });
