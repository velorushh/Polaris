import React, { useState, useEffect } from "react";
import { fetchExpeditions } from "../data/api";
import {
  Map, CheckCircle2, Circle, Clock, ChevronRight, ChevronDown, ChevronUp,
  Users, Package, DollarSign, AlertCircle, Anchor, BarChart3, Shield,
  FlaskConical, Plus, RefreshCw,
} from "lucide-react";

const STATUS_CONFIG = {
  active:    { badge: "badge badge-success", label: "Active"    },
  planning:  { badge: "badge badge-warning", label: "Planning"  },
  completed: { badge: "badge badge-neutral", label: "Completed" },
};

const MILESTONE_STATUS = {
  completed:    { dot: "bg-green-600",  text: "text-green-700",  badge: "badge badge-success" },
  "in-progress":{ dot: "bg-blue-600",   text: "text-blue-700",   badge: "badge badge-info"    },
  pending:      { dot: "bg-slate-300",  text: "text-slate-500",  badge: "badge badge-neutral" },
};

const APPROVAL_ICONS = { scientific: FlaskConical, logistics: Anchor, finance: DollarSign, safety: Shield };

function ApprovalBadge({ domain, data }) {
  const Icon = APPROVAL_ICONS[domain] || CheckCircle2;
  const ok = data?.status === "approved";
  return (
    <div className={`flex items-center gap-1.5 px-3 py-2 rounded border ${ok ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
      <Icon className={`w-3.5 h-3.5 ${ok ? "text-green-600" : "text-amber-600"}`} />
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-[#5a6a8a]">{domain}</p>
        <p className={`text-[11px] font-bold ${ok ? "text-green-700" : "text-amber-700"}`}>{ok ? "Approved" : "Pending"}</p>
      </div>
    </div>
  );
}

function CapacityBar({ label, used, total }) {
  const pct = Math.min((used / total) * 100, 100);
  const over = used >= total * 0.9;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-[#5a6a8a]">{label}</span>
        <span className={`text-[11px] font-mono font-bold ${over ? "text-amber-700" : "text-[#1a2744]"}`}>{used}/{total}</span>
      </div>
      <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${over ? "bg-amber-500" : "bg-[#003580]"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MilestoneTimeline({ milestones }) {
  return (
    <div className="relative">
      <div className="absolute left-2 top-3 bottom-3 w-px bg-[#c8d4e8]" />
      {milestones.map((m) => {
        const cfg = MILESTONE_STATUS[m.status] ?? MILESTONE_STATUS.pending;
        return (
          <div key={m.id} className="relative flex items-start gap-3 pl-7 py-2.5">
            <span className={`absolute left-0 top-3.5 w-4 h-4 rounded-full flex-shrink-0 border-2 border-white shadow ${cfg.dot}`} />
            <div className="flex-1 flex items-start justify-between gap-3">
              <div>
                <p className={`text-[12px] font-semibold ${cfg.text}`}>{m.title}</p>
                <p className="text-[10px] text-[#8595af] font-mono mt-0.5">Due: {m.due}</p>
              </div>
              <span className={cfg.badge}>{m.status}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExpeditionCard({ exp, selected, onSelect }) {
  const sc = STATUS_CONFIG[exp.status] || STATUS_CONFIG.planning;
  const cargoPct = exp.cargo_planned_mt > 0 ? (exp.cargo_dispatched_mt / exp.cargo_planned_mt) * 100 : 0;
  return (
    <button
      id={`exp-card-${exp.id}`}
      onClick={() => onSelect(exp)}
      className={`w-full text-left p-3.5 rounded border transition-all ${
        selected
          ? "bg-[#dbe6f8] border-[#003580]"
          : "bg-white border-[#c8d4e8] hover:border-[#003580] hover:bg-[#f5f7fb]"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className={`${sc.badge} mb-1.5 inline-block`}>{sc.label}</span>
          <h3 className="text-[12px] font-bold text-[#1a2744]">{exp.short_name}</h3>
          <p className="text-[10px] text-[#5a6a8a] mt-0.5">{exp.season} · {exp.stations.join(", ")}</p>
        </div>
        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${selected ? "text-[#003580]" : "text-[#c8d4e8]"}`} />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div><p className="data-label">Personnel</p><p className="text-[13px] font-bold font-mono text-[#003580]">{exp.team_count}</p></div>
        <div><p className="data-label">Budget</p><p className="text-[13px] font-bold font-mono text-[#003580]">₹{exp.budget_crore}Cr</p></div>
      </div>
      <div>
        <div className="flex justify-between mb-1"><span className="text-[10px] text-[#5a6a8a]">Cargo Dispatch</span><span className="text-[10px] font-mono text-[#1a2744]">{Math.round(cargoPct)}%</span></div>
        <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[#003580]" style={{ width: `${cargoPct}%` }} />
        </div>
      </div>
    </button>
  );
}

export default function ExpeditionPage() {
  const [expeditions, setExpeditions] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showMilestones, setShowMilestones] = useState(true);
  const [showCapacity, setShowCapacity] = useState(true);

  useEffect(() => {
    fetchExpeditions().then(d => { setExpeditions(d); setSelected(d[0]); setLoading(false); });
  }, []);

  if (loading) return <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton-shimmer h-32 rounded" />)}</div>;

  return (
    <>
    <div className="flex flex-col h-full overflow-hidden">
      {/* Breadcrumb header */}
      <div className="section-header flex-shrink-0">
        <div className="breadcrumb">
          <Map className="w-3.5 h-3.5 text-[#003580]" />
          <span className="text-[#003580] font-semibold">Expedition Planning</span>
          {selected && <><span className="breadcrumb-sep">/</span><span className="text-[#1a2744]">{selected.short_name}</span></>}
        </div>
        <div className="flex items-center gap-2">
          <button id="exp-refresh" className="btn-ghost"><RefreshCw className="w-3.5 h-3.5" /></button>
          <button id="exp-new" className="btn-primary"><Plus className="w-3.5 h-3.5" /> New Expedition</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* List panel */}
        <div className="w-72 flex-shrink-0 overflow-y-auto p-3 space-y-2" style={{ borderRight: "1px solid #c8d4e8", background: "#f5f7fb" }}>
          <p className="data-label px-1 mb-2">All Expeditions ({expeditions?.length})</p>
          {expeditions?.map(exp => (
            <ExpeditionCard key={exp.id} exp={exp} selected={selected?.id === exp.id} onSelect={setSelected} />
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Heading */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={STATUS_CONFIG[selected.status]?.badge}>{STATUS_CONFIG[selected.status]?.label}</span>
                <span className="text-[11px] text-[#5a6a8a] font-mono">{selected.season}</span>
              </div>
              <h2 className="text-lg font-bold text-[#1a2744]">{selected.name}</h2>
              <p className="text-[12px] text-[#5a6a8a] mt-0.5">{selected.start_date} to {selected.end_date} · Stations: {selected.stations.join(", ")}</p>
            </div>

            {/* Objectives */}
            <div className="card overflow-hidden">
              <div className="card-header"><span className="card-title">Mission Objectives</span></div>
              <div className="p-4">
                <ul className="space-y-2">
                  {selected.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f47920] mt-1.5 flex-shrink-0" />
                      <span className="text-[12px] text-[#1a2744]">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Personnel",   value: selected.team_count, unit: "pax", icon: Users,    color: "#003580" },
                { label: "Budget",      value: `₹${selected.budget_crore}Cr`, unit: `${Math.round((selected.budget_spent_crore/selected.budget_crore)*100)}% used`, icon: DollarSign, color: "#138808" },
                { label: "Cargo Planned", value: `${selected.cargo_planned_mt} MT`, unit: `${selected.cargo_dispatched_mt} dispatched`, icon: Package, color: "#f47920" },
                { label: "Milestones", value: `${selected.milestones.filter(m=>m.status==="completed").length}/${selected.milestones.length}`, unit: "complete", icon: BarChart3, color: "#6b21a8" },
              ].map(({ label, value, unit, icon: Icon, color }) => (
                <div key={label} className="card p-3" style={{ borderLeft: `3px solid ${color}` }}>
                  <div className="flex items-center gap-1.5 mb-1"><Icon className="w-3.5 h-3.5" style={{ color }} /><span className="data-label">{label}</span></div>
                  <p className="text-[15px] font-bold font-mono text-[#1a2744]">{value}</p>
                  <p className="text-[10px] text-[#5a6a8a]">{unit}</p>
                </div>
              ))}
            </div>

            {/* Approvals */}
            <div className="card overflow-hidden">
              <div className="card-header"><span className="card-title">Approval Workflow</span></div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(selected.approvals).map(([domain, data]) => (
                  <ApprovalBadge key={domain} domain={domain} data={data} />
                ))}
              </div>
            </div>

            {/* Milestones */}
            {selected.milestones.length > 0 && (
              <div className="card overflow-hidden">
                <button id="exp-milestones-toggle" onClick={() => setShowMilestones(!showMilestones)}
                  className="w-full card-header hover:bg-[#e8eef8] transition-colors">
                  <span className="card-title">Milestones & Timeline</span>
                  {showMilestones ? <ChevronUp className="w-3.5 h-3.5 text-[#5a6a8a]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#5a6a8a]" />}
                </button>
                {showMilestones && <div className="p-4"><MilestoneTimeline milestones={selected.milestones} /></div>}
              </div>
            )}

            {/* Capacity checks */}
            {Object.keys(selected.capacity_checks).length > 0 && (
              <div className="card overflow-hidden">
                <button id="exp-capacity-toggle" onClick={() => setShowCapacity(!showCapacity)}
                  className="w-full card-header hover:bg-[#e8eef8] transition-colors">
                  <span className="card-title">Capacity Checks</span>
                  {showCapacity ? <ChevronUp className="w-3.5 h-3.5 text-[#5a6a8a]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#5a6a8a]" />}
                </button>
                {showCapacity && (
                  <div className="p-4 space-y-3">
                    {Object.entries(selected.capacity_checks).map(([key, val]) => (
                      <CapacityBar key={key} label={key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} used={val.used} total={val.total} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {toast && (
      <div className={`fixed bottom-6 right-6 z-[500] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-[12px] font-semibold ${toast.type==="success" ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"}`}>
        {toast.type === "success" ? "✓ " : "✗ "}{toast.msg}
        <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
      </div>
    )}
    </>
  );
}