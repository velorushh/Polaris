import React from "react";
import { MapPin, Navigation, Anchor, Snowflake, Mountain } from "lucide-react";

const STATION_POSITIONS = {
  Bharati:  { top: "62%", left: "72%", region: "Prydz Bay · East Antarctica" },
  Maitri:   { top: "58%", left: "34%", region: "Schirmacher Oasis · Antarctica" },
  };

const VESSEL_POSITION = { top: "48%", left: "53%", label: "Samudra Nidhi", eta: "12d" };

const STATION_ICONS = { Bharati: Snowflake, Maitri: Snowflake };

const POLAR_BLUE = "#dbe8f5";
const STATION_COLORS = {
  Bharati: { bg: "#003580", ring: "#f47920" },
  Maitri:  { bg: "#1a5c38", ring: "#22c55e" },
  };

export default function MapWidget({ data, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="card-header">
          <span className="card-title">Station Map</span>
        </div>
        <div className="flex-1 skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-[#003580]" />
          <span className="card-title">Operational Map — Active Stations</span>
        </div>
        <span className="badge badge-success">3 OPERATIONAL</span>
      </div>

      {/* Map container */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #c8dcef 0%, #daeaf7 40%, #b8d4e8 100%)" }}>
        {/* Grid lines - subtle */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.12 }}>
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(v => (
            <React.Fragment key={v}>
              <line x1={`${v}%`} y1="0" x2={`${v}%`} y2="100%" stroke="#003580" strokeWidth="0.8" strokeDasharray="4 6" />
              <line x1="0" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke="#003580" strokeWidth="0.8" strokeDasharray="4 6" />
            </React.Fragment>
          ))}
        </svg>

        {/* Continents - simplified paths */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Antarctica */}
          <ellipse cx="52%" cy="80%" rx="28%" ry="14%" fill="white" fillOpacity="0.55" stroke="#003580" strokeWidth="0.8" strokeOpacity="0.3" />
          {/* Arctic circle */}
          <ellipse cx="50%" cy="10%" rx="22%" ry="7%" fill="white" fillOpacity="0.45" stroke="#003580" strokeWidth="0.8" strokeOpacity="0.3" />
          {/* India (simplified) */}
          <ellipse cx="60%" cy="40%" rx="4%" ry="6%" fill="#f47920" fillOpacity="0.3" stroke="#f47920" strokeWidth="0.6" />
          <text x="62%" y="41%" fontSize="8" fill="#b45309" fontWeight="bold">INDIA</text>
        </svg>

        {/* Station markers */}
        {Object.entries(STATION_POSITIONS).map(([name, pos]) => {
          const Icon = STATION_ICONS[name] || Snowflake;
          const colors = STATION_COLORS[name] || STATION_COLORS.Bharati;
          const stationData = data?.find(d => d.station === name);
          return (
            <div
              key={name}
              id={`map-station-${name.toLowerCase()}`}
              style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -50%)" }}
              className="absolute flex flex-col items-center cursor-pointer group"
            >
              {/* Pulse ring */}
              <span className="absolute w-8 h-8 rounded-full opacity-30 animate-ping" style={{ background: colors.ring }} />

              {/* Marker */}
              <div className="relative w-7 h-7 rounded-full shadow-md flex items-center justify-center border-2"
                style={{ background: colors.bg, borderColor: colors.ring }}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Label */}
              <div className="mt-1 bg-white border border-[#c8d4e8] rounded shadow-sm px-2 py-1 min-w-max">
                <p className="text-[11px] font-bold text-[#003580]">{name}</p>
                <p className="text-[9px] text-[#5a6a8a]">{pos.region}</p>
                {stationData && (
                  <p className="text-[9px] font-semibold text-green-700">{stationData.personnel} personnel</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Vessel marker */}
        <div
          id="map-vessel"
          style={{ top: VESSEL_POSITION.top, left: VESSEL_POSITION.left, transform: "translate(-50%, -50%)" }}
          className="absolute flex flex-col items-center cursor-pointer group"
        >
          <div className="relative w-7 h-7 rounded-full shadow-md flex items-center justify-center border-2"
            style={{ background: "#1e3a8a", borderColor: "#60a5fa" }}>
            <Anchor className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="mt-1 bg-[#1e3a8a] rounded px-2 py-0.5 min-w-max">
            <p className="text-[10px] font-bold text-white">{VESSEL_POSITION.label}</p>
            <p className="text-[9px] text-blue-300">ETA: {VESSEL_POSITION.eta}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-white/90 border border-[#c8d4e8] rounded p-2 space-y-1">
          {[
            { color: "#003580", label: "Bharati (E. Antarctica)" },
            { color: "#1a5c38", label: "Maitri (Antarctica)" },
            { color: "#1e3a8a", label: "Vessel" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-[9px] text-[#5a6a8a]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
