import React, { useState } from "react";
import {
  LayoutDashboard, Map, Package, Database, Users, AlertTriangle,
  ChevronLeft, ChevronRight, Settings, HelpCircle, Shield, BarChart3, Layers,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",           icon: LayoutDashboard, badge: null,  badgeColor: null,    variant: "normal" },
  { id: "expedition", label: "Expedition Planning",  icon: Map,             badge: null,  badgeColor: null,    variant: "normal" },
  { id: "cargo",      label: "Cargo & Logistics",    icon: Package,         badge: "1",   badgeColor: "navy",  variant: "normal" },
  { id: "inventory",  label: "Inventory Management", icon: Database,        badge: "2",   badgeColor: "amber", variant: "normal" },
  { id: "personnel",  label: "Personnel Movement",   icon: Users,           badge: null,  badgeColor: null,    variant: "normal" },
  { id: "emergency",  label: "Emergency Response",   icon: AlertTriangle,   badge: "!",   badgeColor: "red",   variant: "danger" },
  { id: "analytics",  label: "Analytics & Reports",  icon: BarChart3,       badge: null,  badgeColor: null,    variant: "normal" },
];

const BOTTOM_ITEMS = [
  { id: "access",   label: "Access Control", icon: Shield    },
  { id: "settings", label: "System Settings",icon: Settings  },
  { id: "help",     label: "Help & Docs",    icon: HelpCircle},
];

const BADGE_STYLES = {
  navy:  "bg-blue-100 text-blue-800 border border-blue-200",
  amber: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  red:   "bg-red-100 text-red-700 border border-red-200 animate-pulse",
};

export default function Sidebar({ activeModule, onModuleChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{ background: "#f5f7fb", borderRight: "1px solid #c8d4e8" }}
      className={`flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? "w-14" : "w-60"}`}
    >
      {/* Module label row */}
      <div
        style={{ background: "#eef2f8", borderBottom: "1px solid #c8d4e8" }}
        className={`flex items-center h-9 px-3 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-[#5a6a8a]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5a6a8a]">Modules</span>
          </div>
        )}
        <button
          id="sidebar-collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-[#5a6a8a] hover:text-[#003580] hover:bg-[#dbe6f8] transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          const isDanger = item.variant === "danger";

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onModuleChange(item.id)}
              style={
                isActive && !isDanger
                  ? { borderLeft: "3px solid #f47920", background: "#dbe6f8", color: "#003580" }
                  : isDanger
                  ? { borderLeft: "3px solid transparent" }
                  : { borderLeft: "3px solid transparent" }
              }
              className={`
                w-full flex items-center gap-2.5 px-2.5 py-2 rounded-r text-[13px] font-medium
                transition-all duration-150 cursor-pointer text-left
                ${isActive && !isDanger
                  ? "text-[#003580] font-semibold"
                  : isDanger
                  ? "text-red-700 hover:text-red-800 hover:bg-red-50"
                  : "text-[#3a5080] hover:text-[#003580] hover:bg-[#e8eef8]"
                }
                ${collapsed ? "justify-center px-0" : ""}
              `}
              title={collapsed ? item.label : ""}
            >
              <Icon
                className={`flex-shrink-0 w-4 h-4 ${
                  isDanger ? "text-red-600" : isActive ? "text-[#f47920]" : "text-[#5a6a8a]"
                }`}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-[12px]">{item.label}</span>
                  {item.badge && (
                    <span className={`flex-shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[10px] font-bold ${BADGE_STYLES[item.badgeColor]}`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #c8d4e8" }} className="mx-2 my-1" />

      {/* Bottom utilities */}
      <div className="pb-2 px-2 space-y-0.5">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-[12px] text-[#5a6a8a] hover:text-[#003580] hover:bg-[#e8eef8] transition-colors ${collapsed ? "justify-center" : ""}`}
              title={item.label}
            >
              <Icon className="flex-shrink-0 w-3.5 h-3.5" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Version tag */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div style={{ background: "#eef2f8", border: "1px solid #c8d4e8" }} className="rounded px-2.5 py-2">
            <p className="text-[9px] text-[#8595af] font-mono uppercase tracking-wider">SIH26062 — NCPOR Polaris</p>
            <p className="text-[9px] text-[#a0aec0] font-mono mt-0.5">Build v2.4.1-rc3</p>
          </div>
        </div>
      )}
    </aside>
  );
}
