import React, { useState, useEffect } from "react";
import {
  fetchStationStatus, fetchAlerts, fetchDashboardCargo,
  fetchDashboardInventory, fetchDeployments,
} from "../data/api";
import AlertsBanner from "../components/AlertsBanner";
import StationKPIBar from "../components/StationKPIBar";
import MapWidget from "../components/MapWidget";
import CargoWidget from "../components/CargoWidget";
import InventoryWidget from "../components/InventoryWidget";
import DeploymentsWidget from "../components/DeploymentsWidget";
import {
  LayoutDashboard, Package, Database, Users, AlertTriangle,
  TrendingUp, RefreshCw, ChevronRight, BarChart3, Clock, Map,
} from "lucide-react";

// Summary stat card at the top
function StatCard({ label, value, sub, icon: Icon, color, accent, onClick }) {
  return (
    <button
      id={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}
      onClick={onClick}
      className="card p-4 text-left hover:shadow-md hover:border-[#003580] transition-all duration-150 group"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="data-label mb-1">{label}</p>
          <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
          {sub && <p className="text-[11px] text-[#5a6a8a] mt-0.5">{sub}</p>}
        </div>
        <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
          style={{ background: `${accent}18` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-[10px] text-[#5a6a8a]">View details</span>
        <ChevronRight className="w-3 h-3 text-[#8595af]" />
      </div>
    </button>
  );
}

export default function DashboardPage({ onAlertsLoad }) {
  const [stations, setStations]     = useState(null);
  const [alerts, setAlerts]         = useState(null);
  const [cargo, setCargo]           = useState(null);
  const [inventory, setInventory]   = useState(null);
  const [deployments, setDeployments] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [invStation, setInvStation] = useState("Bharati");
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    Promise.all([
      fetchStationStatus(),
      fetchAlerts(),
      fetchDashboardCargo(),
      fetchDashboardInventory(),
      fetchDeployments(),
    ]).then(([stn, al, cg, inv, dep]) => {
      setStations(stn); setAlerts(al);
      setCargo(cg); setInventory(inv);
      setDeployments(dep); setLoadingMap(false);
      if (onAlertsLoad) onAlertsLoad(al);
    });
  }, []);

  const handleDismiss = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    setDismissedAlerts(prev => new Set([...prev, id]));
  };

  const visibleAlerts = alerts?.filter(a => !a.acknowledged) || [];
  const criticalCount = visibleAlerts.filter(a => a.severity === "critical").length;
  const totalPersonnel = stations?.reduce((s, st) => s + st.personnel, 0) || 0;
  const activeVessels = cargo?.filter(c => c.status === "en_route" || c.status === "loading").length || 0;
  const invBharatiItems = inventory?.filter(i => i.station === "Bharati") || [];
  const atRiskItems = inventory?.filter(i => {
    const daysLeft = i.consumption_rate > 0 ? Math.floor(i.current / i.consumption_rate) : 999;
    return daysLeft < i.days_to_next_resupply && i.days_to_next_resupply > 0;
  }).length || 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Alerts */}
      <AlertsBanner alerts={alerts} onDismiss={handleDismiss} />

      {/* Station KPI bar */}
      <StationKPIBar stations={stations} loading={!stations} />

      {/* Page heading */}
      <div className="section-header flex-shrink-0">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-[#003580]" />
          <h1 className="text-[13px] font-bold text-[#003580]">Operational Dashboard</h1>
          <span className="badge badge-info">Expedition 44 — 2026-27</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8595af]">
            Refreshed: {lastRefresh.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false })} IST
          </span>
          <button
            id="dashboard-refresh"
            onClick={() => setLastRefresh(new Date())}
            className="btn-ghost"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Summary stat cards row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Personnel Deployed"
            value={totalPersonnel}
            sub="across 3 stations"
            icon={Users}
            color="#003580"
            accent="#003580"
          />
          <StatCard
            label="Active Vessels"
            value={activeVessels}
            sub="in transit"
            icon={Package}
            color="#f47920"
            accent="#f47920"
          />
          <StatCard
            label="Inventory Alerts"
            value={atRiskItems}
            sub={atRiskItems > 0 ? "stockout risk items" : "all items adequate"}
            icon={Database}
            color={atRiskItems > 0 ? "#b91c1c" : "#0a7a3e"}
            accent={atRiskItems > 0 ? "#b91c1c" : "#138808"}
          />
          <StatCard
            label="Active Incidents"
            value={criticalCount}
            sub={criticalCount > 0 ? "critical — action required" : "no critical issues"}
            icon={AlertTriangle}
            color={criticalCount > 0 ? "#b91c1c" : "#0a7a3e"}
            accent={criticalCount > 0 ? "#b91c1c" : "#138808"}
          />
        </div>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: 360 }}>
          {/* Map - 2 cols */}
          <div className="lg:col-span-2 card overflow-hidden" style={{ minHeight: 340 }}>
            <MapWidget data={stations} loading={loadingMap} />
          </div>

          {/* Deployments - 1 col */}
          <div className="card overflow-hidden">
            <DeploymentsWidget data={deployments} loading={!deployments} />
          </div>
        </div>

        {/* Bottom 2-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: 320 }}>
          {/* Cargo widget */}
          <div className="card overflow-hidden">
            <CargoWidget data={cargo} loading={!cargo} />
          </div>

          {/* Inventory widget with station tab */}
          <div className="card overflow-hidden flex flex-col">
            {/* Station tabs for inventory */}
            <div style={{ background: "#eef2f8", borderBottom: "1px solid #c8d4e8" }}
              className="flex items-center gap-0 px-3 pt-2">
              {["Bharati", "Maitri"].map(stn => (
                <button
                  key={stn}
                  id={`inv-tab-${stn.toLowerCase()}`}
                  onClick={() => setInvStation(stn)}
                  className={`px-3 py-1.5 text-[11px] font-semibold border-b-2 transition-colors ${
                    invStation === stn
                      ? "border-[#f47920] text-[#003580]"
                      : "border-transparent text-[#5a6a8a] hover:text-[#003580]"
                  }`}
                >
                  {stn}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              <InventoryWidget
                data={inventory?.filter(i => i.station === invStation)}
                loading={!inventory}
                station={invStation}
              />
            </div>
          </div>
        </div>

        {/* Quick links row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "View Expedition Plan", icon: Map, href: "expedition", color: "#003580" },
            { label: "Cargo Indents",        icon: Package, href: "cargo",  color: "#f47920" },
            { label: "Analytics & Reports",  icon: BarChart3, href: "analytics", color: "#138808" },
            { label: "Emergency SOPs",       icon: AlertTriangle, href: "emergency", color: "#b91c1c" },
          ].map(item => (
            <button
              key={item.label}
              id={`quicklink-${item.href}`}
              className="card p-3 flex items-center gap-2.5 hover:border-[#003580] hover:shadow-sm transition-all text-left group"
            >
              <item.icon className="w-4 h-4 flex-shrink-0" style={{ color: item.color }} />
              <span className="text-[12px] font-medium text-[#1a2744] group-hover:text-[#003580] transition-colors">{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#c8d4e8] group-hover:text-[#003580] ml-auto" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
