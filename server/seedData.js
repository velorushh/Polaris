const { getDB, saveDB } = require("./db");

const SEED = {
  users: [
    { id:"u-001", username:"vikram.kumar",   password:"ncpor@2026", name:"Vikram Kumar",          role:"Operations Director",  avatar:"VK" },
    { id:"u-002", username:"admin",          password:"admin123",   name:"Admin User",             role:"System Administrator", avatar:"AU" },
    { id:"u-003", username:"s.kulkarni",     password:"ncpor@2026", name:"Cmdr. S. Kulkarni",     role:"NCPOR Operations",     avatar:"SK" },
    { id:"u-004", username:"r.venkataraman",password:"ncpor@2026",  name:"Dr. R. Venkataraman",  role:"Chief Scientist",      avatar:"RV" },
  ],
  station_kpis: [
    { id:"stn-001", station:"Maitri",  lat:-70.7669, lon:11.7253, personnel:48, status:"operational", temp_c:-34, wind_kph:67, visibility:"Poor",     emergency_readiness:"ready" },
    { id:"stn-002", station:"Bharati", lat:-69.4063, lon:76.1917, personnel:28, status:"operational", temp_c:-22, wind_kph:43, visibility:"Moderate", emergency_readiness:"ready" },
    { id:"stn-003", station:"Himadri", lat:78.9250,  lon:11.9260, personnel:12, status:"operational", temp_c:-8,  wind_kph:28, visibility:"Good",     emergency_readiness:"ready" },
  ],
  teams: [
    { id:"team-alpha",    name:"Team Alpha",         station:"Maitri",                    status:"active",  active_count:24, mission:"Atmospheric Science",   lead:"Dr. R. Venkataraman", deployed_since:"2026-07-15", eta_return:"2026-11-30", priority:"high"     },
    { id:"team-ice-core", name:"Ice Core Team",      station:"Field - Schirmacher Oasis", status:"field",   active_count:8,  mission:"Paleoclimate Drilling",  lead:"Dr. S. Bhattacharya", deployed_since:"2026-08-02", eta_return:"2026-09-25", priority:"critical" },
    { id:"team-geo",      name:"Geophysics Unit",    station:"Bharati",                   status:"active",  active_count:16, mission:"Seismic Monitoring",    lead:"Dr. P. Krishnamurthy",deployed_since:"2026-07-28", eta_return:"2026-12-10", priority:"normal"   },
    { id:"team-bio",      name:"Marine Biology Unit",station:"Bharati",                   status:"standby", active_count:6,  mission:"Ocean Sampling",        lead:"Dr. A. Nair",         deployed_since:"2026-08-20", eta_return:"2026-10-15", priority:"normal"   },
    { id:"team-himadri",  name:"Arctic Research Unit",station:"Himadri",                  status:"active",  active_count:12, mission:"Sea-Ice Monitoring",    lead:"Dr. V. Singh",        deployed_since:"2026-06-01", eta_return:"2026-09-30", priority:"high"     },
  ],
  inventory: [
    { id:"inv-001", station:"Bharati", category:"Aviation Fuel (ATF)",   current:28000, capacity:50000, unit:"L",  threshold_warning:20000, threshold_critical:10000, shelf_life_days:365,  storage_condition:"Sealed tank", criticality:"critical", consumption_rate:500, days_to_next_resupply:4  },
    { id:"inv-002", station:"Bharati", category:"Provisions & Rations",  current:4200,  capacity:6000,  unit:"kg", threshold_warning:2000,  threshold_critical:1000,  shelf_life_days:730,  storage_condition:"Cold store",  criticality:"critical", consumption_rate:42,  days_to_next_resupply:4  },
    { id:"inv-003", station:"Bharati", category:"Medical Supplies",      current:85,    capacity:100,   unit:"%",  threshold_warning:40,    threshold_critical:20,    shelf_life_days:1095, storage_condition:"Secure room", criticality:"high",     consumption_rate:0.5, days_to_next_resupply:4  },
    { id:"inv-004", station:"Bharati", category:"Diesel (HSD)",          current:12000, capacity:20000, unit:"L",  threshold_warning:8000,  threshold_critical:4000,  shelf_life_days:365,  storage_condition:"Tank farm",   criticality:"critical", consumption_rate:300, days_to_next_resupply:4  },
    { id:"inv-005", station:"Maitri",  category:"Diesel (HSD)",          current:18500, capacity:60000, unit:"L",  threshold_warning:15000, threshold_critical:8000,  shelf_life_days:365,  storage_condition:"Tank farm",   criticality:"critical", consumption_rate:800, days_to_next_resupply:45 },
    { id:"inv-006", station:"Maitri",  category:"Provisions & Rations",  current:9200,  capacity:15000, unit:"kg", threshold_warning:6000,  threshold_critical:3000,  shelf_life_days:730,  storage_condition:"Cold store",  criticality:"critical", consumption_rate:96,  days_to_next_resupply:45 },
    { id:"inv-007", station:"Maitri",  category:"Kerosene (Heating)",    current:3200,  capacity:8000,  unit:"L",  threshold_warning:2500,  threshold_critical:1200,  shelf_life_days:365,  storage_condition:"Tank farm",   criticality:"high",     consumption_rate:80,  days_to_next_resupply:45 },
    { id:"inv-008", station:"Maitri",  category:"Medical Oxygen",        current:320,   capacity:400,   unit:"kg", threshold_warning:150,   threshold_critical:80,    shelf_life_days:0,    storage_condition:"Gas locker",  criticality:"critical", consumption_rate:1.5, days_to_next_resupply:45 },
    { id:"inv-009", station:"Himadri", category:"Diesel (HSD)",          current:4800,  capacity:8000,  unit:"L",  threshold_warning:2500,  threshold_critical:1000,  shelf_life_days:365,  storage_condition:"Tank farm",   criticality:"high",     consumption_rate:60,  days_to_next_resupply:90 },
    { id:"inv-010", station:"Himadri", category:"Provisions & Rations",  current:1800,  capacity:3000,  unit:"kg", threshold_warning:1000,  threshold_critical:500,   shelf_life_days:730,  storage_condition:"Cold store",  criticality:"high",     consumption_rate:24,  days_to_next_resupply:90 },
  ],
  alerts: [
    { id:"alt-001", severity:"critical", message:"Generator Unit 2 failure at Bharati - backup power active.", station:"Bharati", timestamp:"2026-09-09T22:15:00Z", acknowledged:false, type:"Equipment" },
    { id:"alt-002", severity:"warning",  message:"MV Sagar Nidhi entering Ice Exclusion Zone - advisory active.", station:"Vessel",timestamp:"2026-09-10T06:30:00Z", acknowledged:false, type:"Navigation"},
    { id:"alt-003", severity:"warning",  message:"Inventory: Aviation Fuel at Bharati below 60% - resupply ETA 4 days.", station:"Bharati",timestamp:"2026-09-10T08:00:00Z",acknowledged:true,type:"Inventory"},
    { id:"alt-004", severity:"info",     message:"Whiteout drill at Maitri - retraining scheduled for 3 members.", station:"Maitri",timestamp:"2026-09-06T14:00:00Z",acknowledged:true,type:"Training"},
    { id:"alt-005", severity:"critical", message:"Ice Core Team overdue at base by 2 hours - search protocol initiated.", station:"Field",timestamp:"2026-09-10T17:45:00Z",acknowledged:false,type:"Personnel"},
  ],
};

module.exports = SEED;
