import React from "react";
import { Users, Thermometer, Wind, Activity, ArrowUpRight } from "lucide-react";

export default function StationKPIBar({ stations, loading }) {
  if (loading) {
    return (
      <div style={{ borderBottom: "1px solid #c8d4e8", background: "#f5f7fb", padding: "8px 16px" }}>
        <div className="flex gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex-1 skeleton-shimmer h-14 rounded" />
          ))}
        </div>
      </div>
    );
  }
  if (!stations) return null;

  return (
    <div style={{ borderBottom: "1px solid #c8d4e8", background: "#eef2f8", padding: "6px 16px" }}>
      <div className="flex gap-3">
        {stations.map((stn) => (
          <div
            key={stn.station}
            id={`kpi-${stn.station.toLowerCase()}`}
            className="flex-1 bg-white rounded border border-[#c8d4e8] flex items-center gap-3 px-4 py-2 hover:border-[#003580] hover:shadow-sm transition-all cursor-pointer group"
          >
            {/* Station name + status */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-70" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#003580]">{stn.station}</span>
              </div>
              <span className="text-[9px] font-semibold uppercase text-green-600">{stn.status}</span>
            </div>

            <div className="w-px h-8 bg-[#c8d4e8] flex-shrink-0" />

            {/* KPIs */}
            <div className="flex items-center gap-5 flex-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#003580]" />
                <span className="text-[12px] font-bold font-mono text-[#1a2744]">{stn.personnel}</span>
                <span className="text-[10px] text-[#5a6a8a]">personnel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[12px] font-bold font-mono text-[#1a2744]">{stn.temp_c}°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-[#5a6a8a]" />
                <span className="text-[12px] font-mono text-[#1a2744]">{stn.wind_kph}</span>
                <span className="text-[10px] text-[#5a6a8a]">km/h</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#8595af]" />
                <span className="text-[10px] text-[#5a6a8a]">Vis: {stn.visibility}</span>
              </div>
            </div>

            <ArrowUpRight className="w-3.5 h-3.5 text-[#c8d4e8] group-hover:text-[#003580] transition-colors flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
