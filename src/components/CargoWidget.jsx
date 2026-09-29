import React from "react";
import { Package, Anchor, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { CargoSkeleton } from "./Skeletons";

const STATUS_CONFIG = {
  en_route:  { badge: "badge badge-info",    progress: "bg-[#003580]", label: "En Route"  },
  loading:   { badge: "badge badge-warning", progress: "bg-amber-500", label: "Loading"   },
  unloading: { badge: "badge badge-warning", progress: "bg-amber-400", label: "Unloading" },
  completed: { badge: "badge badge-success", progress: "bg-green-600", label: "Completed" },
  scheduled: { badge: "badge badge-neutral", progress: "bg-slate-300", label: "Scheduled" },
};

const PRIORITY_BADGE = {
  critical: "badge badge-danger",
  high:     "badge badge-warning",
  normal:   "badge badge-neutral",
};

export default function CargoWidget({ data, loading }) {
  if (loading) return <CargoSkeleton />;
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-[#003580]" />
          <span className="card-title">Cargo & Vessel Status</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {data.map((vessel) => {
          const sc = STATUS_CONFIG[vessel.status] || STATUS_CONFIG.scheduled;
          // Derive progress from eta_days (0 days left = 100%)
          const maxDays = 30;
          const progress = vessel.eta_days != null
            ? Math.max(0, Math.round((1 - vessel.eta_days / maxDays) * 100))
            : 50;
          // Top priority items from manifest
          const topItems = (vessel.cargo_manifest || [])
            .sort((a, b) => (a.priority === "critical" ? -1 : b.priority === "critical" ? 1 : a.priority === "high" ? -1 : 1))
            .slice(0, 3)
            .map(i => ({ name: i.item.split(" ").slice(0, 2).join(" "), priority: i.priority }));

          return (
            <div key={vessel.id} id={`vessel-${vessel.id}`}
              className="rounded border border-[#c8d4e8] bg-white hover:border-[#003580] hover:shadow-sm transition-all cursor-pointer">

              {/* Vessel title bar */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#eef2f8]">
                <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
                  style={{ background: "var(--goi-navy)" }}>
                  {vessel.vessel_name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-[#1a2744] truncate">{vessel.vessel_name}</p>
                  <p className="text-[10px] text-[#8595af] font-mono">{vessel.voyage_id}</p>
                </div>
                <span className={sc.badge}>{sc.label}</span>
              </div>

              {/* Route row */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#f5f7fb]">
                <span className="text-[11px] text-[#003580] font-semibold truncate max-w-[80px]">{vessel.origin?.split(",")[0]}</span>
                <div className="flex-1 flex items-center">
                  <div className="flex-1 h-px bg-[#c8d4e8]" />
                  <ArrowRight className="w-3 h-3 text-[#5a6a8a] flex-shrink-0" />
                  <div className="flex-1 h-px bg-[#c8d4e8]" />
                </div>
                <span className="text-[11px] text-[#003580] font-semibold truncate max-w-[80px]">{vessel.destination?.split(" -")[0]}</span>
                {vessel.eta_days != null && (
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <Clock className="w-3 h-3 text-[#8595af]" />
                    <span className="text-[10px] text-[#5a6a8a] font-mono">{vessel.eta_days}d ETA</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="px-3 py-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-[#5a6a8a]">Voyage Progress</span>
                  <span className="text-[10px] font-bold font-mono text-[#1a2744]">{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#e2e8f0] overflow-hidden">
                  <div className={`h-full rounded-full ${sc.progress}`} style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Priority cargo tags */}
              {topItems.length > 0 && (
                <div className="border-t border-[#eef2f8] px-3 py-2">
                  <p className="data-label mb-1.5">Priority Cargo</p>
                  <div className="flex flex-wrap gap-1">
                    {topItems.map((item, i) => (
                      <span key={i} className={PRIORITY_BADGE[item.priority]}>{item.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
