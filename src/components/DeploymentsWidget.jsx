import React from "react";
import { Users, ArrowUpRight } from "lucide-react";
import { DeploymentsSkeleton } from "./Skeletons";

const STATUS_CONFIG = {
  active:   { badge: "badge badge-success", dot: "bg-green-500" },
  field:    { badge: "badge badge-info",    dot: "bg-blue-500 animate-pulse" },
  standby:  { badge: "badge badge-warning", dot: "bg-amber-500" },
  critical: { badge: "badge badge-danger",  dot: "bg-red-500 animate-pulse" },
};

const PRIORITY_CONFIG = {
  critical: "badge badge-danger",
  high:     "badge badge-warning",
  normal:   "badge badge-neutral",
};

export default function DeploymentsWidget({ data, loading }) {
  if (loading) return <DeploymentsSkeleton />;
  if (!data || data.length === 0) return null;

  const total = data.reduce((s, t) => s + t.active_count, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-[#003580]" />
          <span className="card-title">Field Teams</span>
        </div>
        <span className="text-[11px] font-bold text-[#003580]">{total} total</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#e8eef8]">
        {data.map((team) => {
          const sc = STATUS_CONFIG[team.status] || STATUS_CONFIG.active;
          return (
            <div
              key={team.id}
              id={`team-${team.id}`}
              className="flex items-center gap-3 px-3 py-3 hover:bg-[#f5f7fb] transition-colors cursor-pointer group"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 font-bold text-[11px] text-white"
                style={{ background: "var(--goi-navy)" }}>
                {team.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                    <span className={`absolute inline-flex h-full w-full rounded-full ${sc.dot} opacity-70`} />
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${sc.dot}`} />
                  </span>
                  <span className="text-[12px] font-semibold text-[#1a2744] truncate">{team.name}</span>
                  <span className={PRIORITY_CONFIG[team.priority]}>{team.priority}</span>
                </div>
                <p className="text-[10px] text-[#5a6a8a] truncate">{team.mission}</p>
                <p className="text-[10px] text-[#8595af]">{team.station} · {team.lead}</p>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={sc.badge}>{team.status}</span>
                <span className="text-[11px] font-bold font-mono text-[#003580]">{team.active_count} pax</span>
              </div>

              <ArrowUpRight className="w-3.5 h-3.5 text-[#c8d4e8] group-hover:text-[#003580] transition-colors flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
