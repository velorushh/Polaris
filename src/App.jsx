import React, { useState, useCallback } from "react";
import LoginPage from "./pages/LoginPage";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import ExpeditionPage from "./pages/ExpeditionPage";
import CargoPage from "./pages/CargoPage";
import InventoryPage from "./pages/InventoryPage";
import PersonnelPage from "./pages/PersonnelPage";
import EmergencyPage from "./pages/EmergencyPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PlaceholderPage from "./pages/PlaceholderPage";

const INITIAL_QUEUE_COUNT = 7;

export default function App() {
  // ── Auth state ──
  const [user, setUser]         = useState(null);   // null = logged out
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState(INITIAL_QUEUE_COUNT);
  const [alerts, setAlerts]     = useState(null);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [refreshKey, setRefreshKey]     = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    setUser(null);
    setActiveModule("dashboard");
    setAlerts(null);
  };

  const handleToggleNetwork = () => {
    setIsOnline(prev => {
      if (!prev) setOfflineQueueCount(0);
      else setOfflineQueueCount(INITIAL_QUEUE_COUNT);
      return !prev;
    });
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshKey(k => k + 1);
      setIsRefreshing(false);
    }, 1200);
  }, []);

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activeModule) {
      case "dashboard":  return <DashboardPage key={refreshKey} onAlertsLoad={setAlerts} />;
      case "expedition": return <ExpeditionPage key={refreshKey} />;
      case "cargo":      return <CargoPage key={refreshKey} />;
      case "inventory":  return <InventoryPage key={refreshKey} />;
      case "personnel":  return <PersonnelPage key={refreshKey} />;
      case "emergency":  return <EmergencyPage key={refreshKey} />;
      case "analytics":  return <AnalyticsPage key={refreshKey} />;
      default:           return <PlaceholderPage module={activeModule} />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--goi-bg)" }}>
      <Header
        isOnline={isOnline}
        offlineQueueCount={offlineQueueCount}
        onToggleNetwork={handleToggleNetwork}
        alerts={alerts}
        user={user}
        onLogout={handleLogout}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        <main id="main-content" className="flex-1 overflow-hidden" style={{ background: "var(--goi-bg)" }}>
          {renderPage()}
        </main>
      </div>

      {/* GOI footer */}
      <div style={{ background: "#002060", borderTop: "2px solid #f47920" }}
        className="flex-shrink-0 h-7 flex items-center justify-between px-4">
        <div className="flex items-center gap-3 text-[10px] text-blue-300">
          <span>National Centre for Polar and Ocean Research (NCPOR), Goa — Ministry of Earth Sciences</span>
          <span className="text-blue-600">|</span>
          <span>Content owned and maintained by NCPOR</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-blue-400">
          <span>
            DB: <span className={isOnline ? "text-green-400" : "text-amber-400"}>
              {isOnline ? "Polaris DB (Connected)" : "Local Cache"}
            </span>
          </span>
          <span className="text-blue-600">|</span>
          <span>Logged in as: <span className="text-blue-200 font-semibold">{user.name}</span></span>
          <span className="text-blue-600">|</span>
          <span>v2.4.1-rc3</span>
        </div>
      </div>
    </div>
  );
}
