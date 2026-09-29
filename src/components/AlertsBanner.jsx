import React from "react";
import { AlertTriangle, AlertCircle, Info, X, ChevronRight } from "lucide-react";

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertTriangle, bar: "bg-red-600",
    bg: "bg-red-50 border-red-200 hover:bg-red-100",
    iconColor: "text-red-600", label: "CRITICAL",
    labelStyle: "bg-red-100 text-red-700 border border-red-200",
    textColor: "text-red-900", metaColor: "text-red-500", pulse: true,
  },
  warning: {
    icon: AlertCircle, bar: "bg-amber-500",
    bg: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    iconColor: "text-amber-600", label: "WARNING",
    labelStyle: "bg-amber-100 text-amber-800 border border-amber-200",
    textColor: "text-amber-900", metaColor: "text-amber-500", pulse: false,
  },
  info: {
    icon: Info, bar: "bg-blue-500",
    bg: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    iconColor: "text-blue-600", label: "INFO",
    labelStyle: "bg-blue-100 text-blue-800 border border-blue-200",
    textColor: "text-blue-900", metaColor: "text-blue-400", pulse: false,
  },
};

function relativeTime(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function AlertsBanner({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) return null;
  const unread = alerts.filter((a) => !a.acknowledged);
  if (unread.length === 0) return null;
  const visible = unread.slice(0, 3);

  return (
    <div style={{ background: "#fff8f0", borderBottom: "1px solid #f0d9b5", padding: "8px 16px" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#92400e" }}>
          System Alerts — {unread.length} unacknowledged
        </span>
      </div>
      <div className="space-y-1.5">
        {visible.map((alert) => {
          const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info;
          const Icon = cfg.icon;
          return (
            <div
              key={alert.id}
              id={`alert-${alert.id}`}
              className={`flex items-center gap-3 px-3 py-1.5 rounded border transition-colors cursor-pointer ${cfg.bg}`}
            >
              <div className={`w-1 h-6 rounded-full flex-shrink-0 ${cfg.bar}`} />
              <Icon className={`flex-shrink-0 w-3.5 h-3.5 ${cfg.iconColor} ${cfg.pulse ? "animate-pulse" : ""}`} />
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${cfg.labelStyle}`}>{cfg.label}</span>
                <span className={`text-[11px] font-medium truncate ${cfg.textColor}`}>{alert.message}</span>
                <span className={`text-[10px] flex-shrink-0 ${cfg.metaColor}`}>{alert.station} · {relativeTime(alert.timestamp)}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              {onDismiss && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDismiss(alert.id); }}
                  className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/70 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
