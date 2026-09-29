import React, { useState, useEffect, useRef } from "react";
import {
  Wifi, WifiOff, RefreshCw, Bell, ChevronDown, Snowflake, Radio,
  Activity, LogOut, User, Settings, Lock, Shield, X, CheckCircle2,
  AlertTriangle, Info, AlertCircle, ExternalLink, Monitor, Globe,
  Volume2, VolumeX, Moon, Sun, Sliders,
} from "lucide-react";

function useUTCClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function formatIST(date) {
  return date.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

// Ashoka Chakra emblem
function AshokaEmblem() {
  return (
    <svg viewBox="0 0 48 48" width="38" height="38" fill="none">
      <circle cx="24" cy="24" r="22" fill="#003580" stroke="#f47920" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="14" fill="none" stroke="#f4c430" strokeWidth="1.2" />
      <circle cx="24" cy="24" r="3" fill="#f4c430" />
      {Array.from({ length: 24 }).map((_, i) => {
        const rad = (i * 15 * Math.PI) / 180;
        return <line key={i} x1={24 + 4 * Math.cos(rad)} y1={24 + 4 * Math.sin(rad)} x2={24 + 13 * Math.cos(rad)} y2={24 + 13 * Math.sin(rad)} stroke="#f4c430" strokeWidth="0.8" />;
      })}
    </svg>
  );
}

// Notification severity config
const NOTIF_CFG = {
  critical: { icon: AlertTriangle, color: "text-red-600",   bg: "bg-red-50 border-red-200",   bar: "bg-red-600",   label: "CRITICAL" },
  warning:  { icon: AlertCircle,   color: "text-amber-600", bg: "bg-amber-50 border-amber-200",bar: "bg-amber-500", label: "WARNING"  },
  info:     { icon: Info,          color: "text-blue-600",  bg: "bg-blue-50 border-blue-200",  bar: "bg-blue-500",  label: "INFO"     },
};

function relTime(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
}

// ─── Notification Panel ───────────────────────────────
function NotificationPanel({ alerts, onClose, onDismissAll }) {
  const [localAlerts, setLocalAlerts] = useState(alerts || []);
  const unread = localAlerts.filter(a => !a.acknowledged);

  const dismiss = (id) => setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  const dismissAll = () => { setLocalAlerts(prev => prev.map(a => ({ ...a, acknowledged: true }))); if (onDismissAll) onDismissAll(); };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-[#c8d4e8] rounded-lg shadow-xl z-[200] overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: "var(--goi-navy)" }}>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-white" />
          <span className="text-[13px] font-bold text-white">Notifications</span>
          {unread.length > 0 && (
            <span className="text-[10px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded-full">{unread.length} new</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread.length > 0 && (
            <button onClick={dismissAll} className="text-[10px] text-blue-200 hover:text-white font-semibold">Mark all read</button>
          )}
          <button onClick={onClose} className="text-blue-300 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Alert list */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#f0f4f8]">
        {localAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-[12px] text-[#5a6a8a]">No notifications</p>
          </div>
        ) : (
          localAlerts.map(alert => {
            const cfg = NOTIF_CFG[alert.severity] ?? NOTIF_CFG.info;
            const Icon = cfg.icon;
            return (
              <div key={alert.id}
                className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#f5f7fb] ${alert.acknowledged ? "opacity-50" : ""}`}>
                <div className={`w-1 h-full min-h-[36px] rounded-full flex-shrink-0 ${cfg.bar}`} />
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.bg}`}>{cfg.label}</span>
                    <span className="text-[10px] text-[#8595af]">{alert.station} · {relTime(alert.timestamp)}</span>
                  </div>
                  <p className="text-[12px] text-[#1a2744] leading-tight">{alert.message}</p>
                </div>
                {!alert.acknowledged && (
                  <button onClick={() => dismiss(alert.id)} className="flex-shrink-0 text-[#8595af] hover:text-[#003580]" title="Dismiss">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#c8d4e8] px-4 py-2.5 bg-[#f5f7fb] flex items-center justify-between">
        <span className="text-[10px] text-[#5a6a8a]">{localAlerts.length} total alerts</span>
        <button className="flex items-center gap-1 text-[11px] text-[#003580] font-semibold hover:underline">
          View All in Emergency Module <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────
function SettingsPanel({ onClose }) {
  const [soundOn, setSoundOn]       = useState(true);
  const [autoSync, setAutoSync]     = useState(true);
  const [syncInterval, setSyncInterval] = useState("30");
  const [language, setLanguage]     = useState("en");
  const [saved, setSaved]           = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-96 h-full bg-white shadow-2xl border-l border-[#c8d4e8] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c8d4e8]" style={{ background: "var(--goi-navy)" }}>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-white" />
            <span className="text-[13px] font-bold text-white">System Settings</span>
          </div>
          <button onClick={onClose} className="text-blue-300 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Display */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5a6a8a] mb-3 flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5" /> Display</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#1a2744]">Language</p>
                  <p className="text-[10px] text-[#5a6a8a]">Portal display language</p>
                </div>
                <select id="settings-language" value={language} onChange={e => setLanguage(e.target.value)}
                  className="border border-[#c8d4e8] rounded px-2.5 py-1.5 text-[12px] text-[#1a2744] bg-white focus:border-[#003580] focus:outline-none">
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sync */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5a6a8a] mb-3 flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Sync & Connectivity</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#1a2744]">Auto-sync</p>
                  <p className="text-[10px] text-[#5a6a8a]">Sync data when online</p>
                </div>
                <button id="settings-autosync" onClick={() => setAutoSync(!autoSync)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoSync ? "bg-[#003580]" : "bg-[#c8d4e8]"}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${autoSync ? "translate-x-4" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#1a2744]">Sync Interval</p>
                  <p className="text-[10px] text-[#5a6a8a]">How often to check for updates</p>
                </div>
                <select id="settings-sync-interval" value={syncInterval} onChange={e => setSyncInterval(e.target.value)}
                  className="border border-[#c8d4e8] rounded px-2.5 py-1.5 text-[12px] text-[#1a2744] bg-white focus:border-[#003580] focus:outline-none"
                  disabled={!autoSync}>
                  <option value="15">Every 15s</option>
                  <option value="30">Every 30s</option>
                  <option value="60">Every 1 min</option>
                  <option value="300">Every 5 min</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5a6a8a] mb-3 flex items-center gap-1.5"><Bell className="w-3.5 h-3.5" /> Notifications</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#1a2744]">Sound Alerts</p>
                  <p className="text-[10px] text-[#5a6a8a]">Play audio for critical alerts</p>
                </div>
                <button id="settings-sound" onClick={() => setSoundOn(!soundOn)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${soundOn ? "bg-[#003580]" : "bg-[#c8d4e8]"}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${soundOn ? "translate-x-4" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5a6a8a] mb-3 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Security</p>
            <div className="space-y-2">
              <button id="settings-change-password" className="w-full text-left flex items-center gap-3 px-3 py-2.5 border border-[#c8d4e8] rounded hover:border-[#003580] hover:bg-[#f5f7fb] transition-colors">
                <Lock className="w-4 h-4 text-[#003580]" />
                <div>
                  <p className="text-[12px] font-semibold text-[#1a2744]">Change Password</p>
                  <p className="text-[10px] text-[#5a6a8a]">Update your login credentials</p>
                </div>
              </button>
              <button id="settings-audit-log" className="w-full text-left flex items-center gap-3 px-3 py-2.5 border border-[#c8d4e8] rounded hover:border-[#003580] hover:bg-[#f5f7fb] transition-colors">
                <Shield className="w-4 h-4 text-[#003580]" />
                <div>
                  <p className="text-[12px] font-semibold text-[#1a2744]">View Audit Log</p>
                  <p className="text-[10px] text-[#5a6a8a]">Review user activity history</p>
                </div>
              </button>
            </div>
          </div>

          {/* System info */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5a6a8a] mb-3 flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> System Information</p>
            <div className="bg-[#f5f7fb] border border-[#c8d4e8] rounded p-3 space-y-1.5">
              {[
                ["Version",      "v2.4.1-rc3"],
                ["Problem ID",   "SIH26062"],
                ["Organization", "NCPOR / MoES"],
                ["Hosting",      "NIC Cloud"],
                ["DB",           "PostgreSQL (Polaris)"],
                ["Build Date",   "27-Sep-2026"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[10px] text-[#5a6a8a]">{k}</span>
                  <span className="text-[10px] font-mono font-semibold text-[#1a2744]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#c8d4e8] px-5 py-3 bg-[#f5f7fb] flex items-center gap-3">
          <button id="settings-save" onClick={save}
            className="flex-1 py-2 rounded text-[12px] font-semibold text-white transition-colors"
            style={{ background: saved ? "#138808" : "var(--goi-navy)" }}>
            {saved ? "✓ Settings Saved" : "Save Changes"}
          </button>
          <button id="settings-cancel" onClick={onClose} className="btn-outline px-4 py-2">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────
function ProfileDropdown({ user, onClose, onLogout, onSettings }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#c8d4e8] rounded-lg shadow-xl z-[200] overflow-hidden">
      {/* User info */}
      <div className="px-4 py-4 border-b border-[#c8d4e8]" style={{ background: "linear-gradient(135deg, #002060, #003580)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#f47920] bg-[#1a4d9c] flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0">
            {user.avatar}
          </div>
          <div>
            <p className="text-[13px] font-bold text-white">{user.name}</p>
            <p className="text-[10px] text-blue-200">{user.role}</p>
            <p className="text-[9px] text-blue-400 mt-0.5">NCPOR · Expedition 44</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        {[
          { icon: User,     label: "My Profile",       id: "profile-my-profile"  },
          { icon: Lock,     label: "Change Password",  id: "profile-change-pass" },
          { icon: Activity, label: "My Activity Log",  id: "profile-activity"    },
        ].map(({ icon: Icon, label, id }) => (
          <button key={id} id={id}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[12px] text-[#1a2744] hover:bg-[#f5f7fb] hover:text-[#003580] transition-colors">
            <Icon className="w-3.5 h-3.5 text-[#5a6a8a]" />
            {label}
          </button>
        ))}

        <button id="profile-settings" onClick={() => { onClose(); onSettings(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[12px] text-[#1a2744] hover:bg-[#f5f7fb] hover:text-[#003580] transition-colors">
          <Settings className="w-3.5 h-3.5 text-[#5a6a8a]" />
          System Settings
        </button>
      </div>

      <div className="border-t border-[#c8d4e8]" />

      {/* Logout */}
      <button id="profile-logout" onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 text-left text-[12px] text-red-700 hover:bg-red-50 transition-colors">
        <LogOut className="w-3.5 h-3.5" />
        Sign Out
      </button>
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────
export default function Header({ isOnline, offlineQueueCount, onToggleNetwork, alerts, user, onLogout, onRefresh, isRefreshing }) {
  const time = useUTCClock();
  const [showNotif, setShowNotif]     = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const unreadAlerts  = alerts ? alerts.filter(a => !a.acknowledged).length : 0;
  const criticalAlerts = alerts ? alerts.filter(a => a.severity === "critical" && !a.acknowledged).length : 0;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header className="flex-shrink-0 z-50">
        {/* Top utility bar */}
        <div style={{ background: "#002060" }} className="flex items-center justify-between px-4 py-1">
          <span className="text-[10px] text-blue-200">Ministry of Earth Sciences, Government of India · National Centre for Polar and Ocean Research (NCPOR)</span>
          <div className="flex items-center gap-3 text-[10px] text-blue-200">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-blue-300" />
              <span className="font-mono">{formatIST(time)} IST</span>
            </span>
            <span className="text-blue-500">|</span>
            <span>Expedition 44 · 2026-27</span>
            <span className="text-blue-500">|</span>
            <a href="#" className="hover:text-white transition-colors">Screen Reader</a>
          </div>
        </div>
        <div className="saffron-stripe" />

        {/* Main header bar */}
        <div style={{ background: "var(--goi-navy)" }} className="flex items-center justify-between px-4 py-2">
          {/* Left: Identity */}
          <div className="flex items-center gap-3">
            <AshokaEmblem />
            <div className="border-l border-blue-400/30 pl-3">
              <div className="flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-[#f4c430]" />
                <span className="text-[15px] font-bold text-white tracking-wide">POLAR COMMAND CENTER</span>
              </div>
              <p className="text-[9px] text-blue-200 mt-0.5 tracking-widest uppercase">
                Integrated Expedition Logistics &amp; Asset Management · NCPOR
              </p>
            </div>
          </div>

          {/* Center: Status */}
          <div className="hidden lg:flex items-center gap-4">
            <button id="network-status-toggle" onClick={onToggleNetwork} title="Click to toggle network (demo)"
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                isOnline
                  ? "bg-green-700/40 border-green-400/40 text-green-200 hover:bg-green-700/60"
                  : "bg-amber-700/40 border-amber-400/40 text-amber-200 hover:bg-amber-700/60"
              }`}>
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-70 ${isOnline ? "bg-green-400" : "bg-amber-400"}`} />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isOnline ? "bg-green-400" : "bg-amber-400"}`} />
              </span>
              {isOnline ? <><Wifi className="w-3 h-3" /> Online — Synced</> : <><WifiOff className="w-3 h-3" /> Offline — Queue: {offlineQueueCount}</>}
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-green-300">
              <Activity className="w-3 h-3" />
              <span className="font-semibold">System Nominal</span>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5">
            {/* Refresh */}
            <button id="header-refresh" onClick={onRefresh}
              className="p-1.5 rounded text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
              title="Refresh dashboard data">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            {/* Settings */}
            <button id="header-settings" onClick={() => { setShowNotif(false); setShowProfile(false); setShowSettings(true); }}
              className="p-1.5 rounded text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
              title="System settings">
              <Settings className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button id="header-alerts"
                onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
                className="relative p-1.5 rounded text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Notifications">
                <Bell className="w-4 h-4" />
                {unreadAlerts > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${criticalAlerts > 0 ? "bg-red-500" : "bg-[#f47920]"} text-white`}>
                    {unreadAlerts}
                  </span>
                )}
              </button>
              {showNotif && (
                <NotificationPanel
                  alerts={alerts}
                  onClose={() => setShowNotif(false)}
                  onDismissAll={() => setShowNotif(false)}
                />
              )}
            </div>

            <div className="w-px h-6 bg-blue-400/20 mx-1" />

            {/* User profile */}
            <div className="relative" ref={profileRef}>
              <button id="header-user-profile"
                onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 transition-colors">
                <div className="w-7 h-7 rounded-full border-2 border-[#f47920] bg-[#1a4d9c] flex items-center justify-center text-[10px] font-bold text-white">
                  {user?.avatar || "VK"}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-[12px] font-semibold text-white leading-tight">{user?.name || "Vikram Kumar"}</span>
                  <span className="text-[9px] text-blue-300">{user?.role || "Operations Director"}</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-blue-300 hidden md:block transition-transform ${showProfile ? "rotate-180" : ""}`} />
              </button>

              {showProfile && (
                <ProfileDropdown
                  user={user || { name: "Vikram Kumar", role: "Operations Director", avatar: "VK" }}
                  onClose={() => setShowProfile(false)}
                  onLogout={onLogout}
                  onSettings={() => setShowSettings(true)}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Settings panel (full-screen overlay) */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}
