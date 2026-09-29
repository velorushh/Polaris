import React from "react";
import { InventoryChartSkeleton } from "./Skeletons";
import { Database, TrendingDown, AlertTriangle } from "lucide-react";

function getStatus(item) {
  if (item.current <= item.threshold_critical) return "critical";
  if (item.current <= item.threshold_warning) return "warning";
  return "ok";
}

const STATUS_CONFIG = {
  critical: { bar: "bg-red-500",    text: "text-red-600",   bg: "bg-red-50 border-red-200" },
  warning:  { bar: "bg-amber-500",  text: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  ok:       { bar: "bg-[#138808]",  text: "text-green-700", bg: "bg-green-50 border-green-200" },
};

export default function InventoryWidget({ data, loading, station }) {
  if (loading) return <InventoryChartSkeleton />;
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Widget header */}
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#003580]" />
          <span className="card-title">Inventory — {station}</span>
        </div>
        <span className="text-[10px] text-[#5a6a8a]">Updated {new Date().toISOString().slice(11, 16)} UTC</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {data.map((item) => {
          const status = getStatus(item);
          const pct = Math.min((item.current / item.capacity) * 100, 100);
          const sc = STATUS_CONFIG[status];
          const daysLeft = item.consumption_rate > 0 ? Math.floor(item.current / item.consumption_rate) : 999;
          const atRisk = daysLeft < item.days_to_next_resupply && item.days_to_next_resupply > 0;

          return (
            <div key={item.id} className={`rounded border p-2.5 ${sc.bg}`}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <span className={`text-[10px] font-bold ${sc.text}`}>{item.category}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {status !== "ok" && <AlertTriangle className={`w-3 h-3 ${sc.text}`} />}
                    <span className="text-[10px] text-[#5a6a8a]">{item.criticality} criticality</span>
                  </div>
                </div>
                <span className={`text-base font-bold font-mono ${sc.text}`}>
                  {item.current}<span className="text-[10px] text-[#8595af] ml-0.5">{item.unit}</span>
                </span>
              </div>

              {/* Progress bar with threshold lines */}
              <div className="relative h-2 bg-white rounded-full overflow-hidden border border-[#d0d7de]">
                <div className={`h-full rounded-full ${sc.bar}`} style={{ width: `${pct}%` }} />
                <div className="absolute top-0 h-full w-0.5 bg-amber-400 opacity-70" style={{ left: `${(item.threshold_warning / item.capacity) * 100}%` }} />
                <div className="absolute top-0 h-full w-0.5 bg-red-400 opacity-70" style={{ left: `${(item.threshold_critical / item.capacity) * 100}%` }} />
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1 text-[10px] text-[#8595af]">
                  <TrendingDown className="w-3 h-3" />
                  <span>{item.consumption_rate}/day</span>
                </div>
                <span className={`text-[10px] font-semibold ${atRisk ? "text-red-600" : "text-green-700"}`}>
                  {daysLeft === 999 ? "Stable" : `${daysLeft}d left`}
                  {atRisk && " ⚠"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
