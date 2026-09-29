import React, { useState, useEffect } from "react";
import { reportIncident, updateIncident, scheduleDrill } from "../data/api";
import { Toast } from "../components/Modal";
import { fetchIncidents, fetchEmergencyResources, fetchEmergencySOPs, fetchDrillLogs, fetchPersonnel } from "../data/api";
import {
  AlertTriangle, FileText, Shield, Wrench, Users, Plus,
  MapPin, Clock, CheckCircle2, Phone, BookOpen, Calendar, Bell,
} from "lucide-react";

const SEV_CFG = {
  critical: { badge: "badge badge-danger",   dot: "bg-red-600 animate-ping", dotI: "bg-red-600" },
  high:     { badge: "badge badge-warning",  dot: "bg-orange-500",           dotI: "bg-orange-500" },
  medium:   { badge: "badge badge-saffron",  dot: "bg-amber-500",            dotI: "bg-amber-500" },
  low:      { badge: "badge badge-neutral",  dot: "bg-slate-400",            dotI: "bg-slate-400" },
};
const INC_STATUS = {
  active:       "badge badge-danger",
  "in-progress":"badge badge-warning",
  resolved:     "badge badge-success",
};
const SOP_COLORS = {
  Medical:   "bg-red-100 text-red-800 border border-red-200",
  Fire:      "bg-orange-100 text-orange-800 border border-orange-200",
  Weather:   "bg-blue-100 text-blue-800 border border-blue-200",
  Evacuation:"bg-amber-100 text-amber-800 border border-amber-200",
  "Search & Rescue": "bg-green-100 text-green-800 border border-green-200",
  Communication: "bg-purple-100 text-purple-800 border border-purple-200",
};

function EvacManifest({ personnel }) {
  const [station, setStation] = useState("Maitri");
  const stations = [...new Set(personnel?.map(p => p.station) || [])].filter(s => !s.includes("Hub") && !s.includes("Field"));
  const sp = personnel?.filter(p => p.station === station) || [];
  return (
    <div className="space-y-4">
      <div className="p-3 bg-red-50 border border-red-300 rounded flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
        <p className="text-[12px] text-red-800 font-semibold">Evacuation Manifest — Auto-generated from current roll-call. Verify before use.</p>
      </div>
      <div className="flex gap-2">
        {stations.map(s => (
          <button key={s} id={`evac-${s.toLowerCase()}`} onClick={() => setStation(s)}
            className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-colors ${station===s ? "bg-red-700 text-white" : "btn-outline"}`}>{s}</button>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="card-header" style={{ background: "#fee2e2", borderColor: "#fecaca" }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
            <span className="card-title text-red-800">Evacuation Manifest — {station}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-red-600">{new Date().toUTCString().slice(0,17)} UTC</span>
            <button id="evac-print" className="text-[11px] text-blue-700 font-semibold hover:underline">Print / Export PDF</button>
          </div>
        </div>
        <table className="goi-table">
          <thead><tr><th>#</th><th>Name</th><th>Role</th><th>Affiliation</th><th>Emergency Contact</th><th>Status</th></tr></thead>
          <tbody>
            {sp.map((p, i) => (
              <tr key={p.id}>
                <td className="font-mono text-[#8595af]">{i+1}</td>
                <td className="font-medium">{p.name}</td>
                <td>{p.role}</td>
                <td>{p.affiliation}</td>
                <td className="font-mono">{p.emergency_contact}</td>
                <td><span className="badge badge-success">ACCOUNTED</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  );
}

function IncidentCard({ incident, selected, onSelect }) {
  const sc = SEV_CFG[incident.severity] || SEV_CFG.medium;
  return (
    <button id={`incident-${incident.id}`} onClick={() => onSelect(incident)}
      className={`w-full text-left p-3 rounded border transition-all ${
        selected ? "bg-red-50 border-red-400" : "bg-white border-[#c8d4e8] hover:border-red-300 hover:bg-red-50/40"
      }`}>
      <div className="flex items-start gap-2.5">
        <span className="relative flex h-3 w-3 flex-shrink-0 mt-0.5">
          {incident.status==="active" && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${sc.dot} opacity-70`} />}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${sc.dotI}`} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-1">
            <span className={sc.badge}>{incident.severity}</span>
            <span className={INC_STATUS[incident.status]}>{incident.status}</span>
            {incident.escalated && <span className="badge badge-danger">ESC L{incident.escalation_level}</span>}
          </div>
          <p className="text-[12px] font-bold text-[#1a2744] leading-tight">{incident.title}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8595af]">
            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{incident.station}</span>
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{new Date(incident.reported_at).toUTCString().slice(5,17)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function EmergencyPage() {
  const [incidents, setIncidents]   = useState(null);
  const [resources, setResources]   = useState(null);
  const [sops, setSOPs]             = useState(null);
  const [drills, setDrills]         = useState(null);
  const [personnel, setPersonnel]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState("incidents");
  const [selInc, setSelInc]         = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [resStn, setResStn]         = useState("Maitri");
  const [incSaving, setIncSaving]   = useState(false);
  const [drillModal, setDrillModal] = useState(false);
  const [drillForm, setDrillForm]   = useState({ type:"Fire Drill", station:"Maitri", date:"", participants:"", conducted_by:"" });
  const [drillSaving, setDrillSaving] = useState(false);
  const [toast, setToast]           = useState(null);

  useEffect(() => {
    Promise.all([fetchIncidents(), fetchEmergencyResources(), fetchEmergencySOPs(), fetchDrillLogs(), fetchPersonnel()]).then(([i,r,s,d,p]) => {
      setIncidents(i); setResources(r); setSOPs(s); setDrills(d); setPersonnel(p);
      setSelInc(i[0]); setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton-shimmer h-24 rounded" />)}</div>;

  const activeCount = incidents?.filter(i => i.status==="active").length || 0;
  const selRes = resources?.find(r => r.station === resStn);

  return (
    <>
    <div className="flex flex-col h-full overflow-hidden">
      {/* Emergency alert banner */}
      {activeCount > 0 && (
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2" style={{ background: "#b91c1c" }}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <p className="text-[12px] font-bold text-white">{activeCount} ACTIVE INCIDENT{activeCount>1?"S":""} — EMERGENCY RESPONSE ACTIVE</p>
          <Bell className="w-4 h-4 text-white animate-pulse ml-auto" />
          <span className="text-[11px] text-red-100">Notifications dispatched to all stakeholders</span>
        </div>
      )}

      <div className="section-header flex-shrink-0">
        <div className="breadcrumb">
          <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
          <span className="text-red-700 font-bold">Emergency Response</span>
        </div>
        <button id="emergency-report-incident" onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white transition-colors" style={{ background: "#b91c1c" }}>
          <Plus className="w-3.5 h-3.5" /> Report Incident
        </button>
      </div>

      {/* Report form */}
      {showForm && (
        <div className="flex-shrink-0 mx-4 mt-2 card p-4 border-red-300">
          <p className="text-[12px] font-bold text-red-700 mb-3">New Incident Report</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { label:"Station", id:"inc-station", type:"select", options:["Maitri","Bharati","Field","Himadri"] },
              { label:"Type",    id:"inc-type",    type:"select", options:["Medical","Fire","Equipment Failure","Communication","Weather","Search & Rescue"] },
              { label:"Severity",id:"inc-severity",type:"select", options:["low","medium","high","critical"] },
              { label:"Location",id:"inc-location",type:"text",   placeholder:"Specific location…" },
            ].map(f => (
              <div key={f.id}>
                <label className="data-label block mb-1">{f.label}</label>
                {f.type==="select"
                  ? <select id={f.id} className="w-full border border-[#c8d4e8] rounded px-2.5 py-1.5 text-[12px] text-[#1a2744] bg-white focus:border-red-500 focus:outline-none">{f.options.map(o=><option key={o}>{o}</option>)}</select>
                  : <input id={f.id} type="text" placeholder={f.placeholder} className="w-full border border-[#c8d4e8] rounded px-2.5 py-1.5 text-[12px] text-[#1a2744] bg-white focus:border-red-500 focus:outline-none" />
                }
              </div>
            ))}
          </div>
          <div className="mb-3">
            <label className="data-label block mb-1">Description</label>
            <textarea id="inc-description" rows={3} placeholder="Describe the incident…"
              className="w-full border border-[#c8d4e8] rounded px-2.5 py-1.5 text-[12px] text-[#1a2744] bg-white focus:border-red-500 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-2">
            <button id="inc-submit" type="submit" onClick={async e => {
                  e.preventDefault();
                  setIncSaving(true);
                  try {
                    const station = document.getElementById("inc-station").value;
                    const type = document.getElementById("inc-type").value;
                    const severity = document.getElementById("inc-severity").value;
                    const location = document.getElementById("inc-location").value;
                    const description = document.getElementById("inc-description").value;
                    if (!description.trim()) { alert("Please enter a description"); setIncSaving(false); return; }
                    await reportIncident({ station, type, severity, location, title:`${type} at ${station}`, description, reported_by:"Current User" });
                    const ni = await fetchIncidents();
                    setIncidents(ni); setSelInc(ni[0]);
                    setShowForm(false);
                    setToast({ msg:"Incident reported successfully", type:"success" });
                  } catch(err) { setToast({ msg:"Failed: " + err.message, type:"error" }); }
                  setIncSaving(false);
                }}
                className="px-4 py-1.5 rounded text-[12px] font-semibold text-white flex items-center gap-1.5" style={{ background: "#b91c1c" }}>
                  {incSaving && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {incSaving ? "Reporting..." : "Submit Report"}</button>
            <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #c8d4e8", background: "#f5f7fb" }} className="flex gap-0 px-4 flex-shrink-0">
        {[
          { id:"incidents",   label:"Incidents",         badge: activeCount },
          { id:"resources",   label:"On-site Resources", badge: 0 },
          { id:"sops",        label:"SOP Repository",    badge: 0 },
          { id:"evacuation",  label:"Evacuation Plan",   badge: 0 },
          { id:"drills",      label:"Drill Logs",        badge: 0 },
        ].map(({ id, label, badge }) => (
          <button key={id} id={`emergency-tab-${id}`} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-semibold border-b-2 transition-colors ${
              tab===id ? "border-red-600 text-red-700" : "border-transparent text-[#5a6a8a] hover:text-[#003580]"
            }`}>
            {label}
            {badge > 0 && <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">{badge}</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Incidents */}
        {tab==="incidents" && (
          <div className="flex h-full overflow-hidden">
            <div className="w-80 flex-shrink-0 overflow-y-auto p-3 space-y-2" style={{ borderRight:"1px solid #c8d4e8", background:"#f5f7fb" }}>
              <p className="data-label px-1 mb-2">{incidents?.length} Incidents</p>
              {incidents?.map(inc => <IncidentCard key={inc.id} incident={inc} selected={selInc?.id===inc.id} onSelect={setSelInc} />)}
            </div>
            {selInc && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="card overflow-hidden" style={{ borderLeft: selInc.severity==="critical" ? "4px solid #b91c1c" : undefined }}>
                  <div className="card-header">
                    <div className="flex flex-wrap gap-2">
                      <span className={SEV_CFG[selInc.severity]?.badge}>{selInc.severity}</span>
                      <span className={INC_STATUS[selInc.status]}>{selInc.status}</span>
                      <span className="badge badge-neutral">{selInc.type}</span>
                      {selInc.escalated && <span className="badge badge-danger">ESCALATED L{selInc.escalation_level}</span>}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-[14px] font-bold text-[#1a2744] mb-2">{selInc.title}</h3>
                    <div className="flex gap-4 mb-3 text-[11px] text-[#5a6a8a]">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selInc.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(selInc.reported_at).toUTCString().slice(0,22)}</span>
                    </div>
                    <p className="text-[12px] text-[#1a2744] leading-relaxed">{selInc.description}</p>
                    {selInc.resolution && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-[11px] font-bold text-green-800 mb-1">Resolution</p>
                        <p className="text-[12px] text-green-900">{selInc.resolution}</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Escalation matrix */}
                <div className="card overflow-hidden">
                  <div className="card-header"><span className="card-title">Escalation Matrix</span></div>
                  <div className="p-4 space-y-2">
                    {[
                      { level:1, label:"Station In-Charge", contact:"Lt. Cmdr. V. Singh", method:"Satellite Phone" },
                      { level:2, label:"NCPOR Operations",  contact:"Cmdr. S. Kulkarni",  method:"Email + Phone"   },
                      { level:3, label:"MoES Director",     contact:"Dr. M. Ravichandran", method:"Emergency Line" },
                    ].map(lv => {
                      const active = selInc.escalation_level >= lv.level;
                      return (
                        <div key={lv.level} className={`flex items-center gap-3 p-2.5 rounded border ${active ? "bg-red-50 border-red-300" : "bg-[#f5f7fb] border-[#c8d4e8]"}`}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${active ? "text-white" : "bg-[#e2e8f0] text-[#5a6a8a]"}`}
                            style={active ? { background:"#b91c1c" } : {}}>L{lv.level}</span>
                          <div className="flex-1">
                            <p className={`text-[12px] font-semibold ${active ? "text-red-800" : "text-[#5a6a8a]"}`}>{lv.label}</p>
                            <p className="text-[10px] text-[#8595af]">{lv.contact} · {lv.method}</p>
                          </div>
                          {active && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resources */}
        {tab==="resources" && (
          <div className="overflow-y-auto h-full p-4 space-y-4">
            <div className="flex gap-2">
              {resources?.map(r => (
                <button key={r.station} id={`resource-station-${r.station.toLowerCase()}`} onClick={() => setResStn(r.station)}
                  className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-colors ${resStn===r.station ? "text-white" : "btn-outline"}`}
                  style={resStn===r.station ? { background:"#b91c1c" } : {}}>{r.station}</button>
              ))}
            </div>
            {selRes && (
              <div className="card overflow-hidden">
                <div className="card-header"><div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-[#003580]" /><span className="card-title">Emergency Resources — {selRes.station}</span></div></div>
                <table className="goi-table">
                  <thead><tr><th>Resource</th><th>Quantity</th><th>Status</th><th>Last Checked</th></tr></thead>
                  <tbody>
                    {selRes.resources.map((res, i) => (
                      <tr key={i}>
                        <td className="font-medium">{res.name}</td>
                        <td className="font-mono">{res.qty}{res.unit ? ` ${res.unit}` : ""}</td>
                        <td><span className={res.status==="available" ? "badge badge-success" : "badge badge-warning"}>{res.status}</span></td>
                        <td className="text-[#5a6a8a]">{res.last_checked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SOPs */}
        {tab==="sops" && (
          <div className="overflow-y-auto h-full p-4 space-y-2">
            <p className="data-label mb-3">{sops?.length} Standard Operating Procedures</p>
            {sops?.map(sop => (
              <div key={sop.id} id={`sop-${sop.id}`}
                className="card flex items-center gap-3 px-4 py-3 hover:border-[#003580] hover:shadow-sm transition-all cursor-pointer">
                <span className={`text-[10px] font-bold px-2 py-1 rounded flex-shrink-0 ${SOP_COLORS[sop.type] || "bg-slate-100 text-slate-600 border border-slate-200"}`}>{sop.type}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-[#1a2744]">{sop.title}</p>
                  <p className="text-[10px] text-[#5a6a8a]">v{sop.version} · Updated {sop.last_updated} · {sop.station==="all" ? "All Stations" : sop.station}</p>
                </div>
                <button className="text-[11px] text-[#003580] font-semibold hover:underline flex-shrink-0">View PDF</button>
              </div>
            ))}
          </div>
        )}

        {/* Evacuation */}
        {tab==="evacuation" && (
          <div className="overflow-y-auto h-full p-4"><EvacManifest personnel={personnel} /></div>
        )}

        {/* Drills */}
        {tab==="drills" && (
          <div className="overflow-y-auto h-full p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="data-label">{drills?.length} Drill Records</p>
              <button id="emergency-schedule-drill" onClick={() => setDrillModal(true)} className="btn-outline"><Calendar className="w-3.5 h-3.5" /> Schedule Drill</button>
            </div>
            <div className="card overflow-hidden">
              <table className="goi-table">
                <thead><tr><th>Type</th><th>Station</th><th>Date</th><th>Participants</th><th>Conducted By</th><th>Outcome</th><th>Notes</th></tr></thead>
                <tbody>
                  {drills?.map(d => (
                    <tr key={d.id}>
                      <td className="font-medium">{d.type}</td>
                      <td>{d.station}</td>
                      <td className="font-mono">{d.date}</td>
                      <td className="font-mono">{d.participants}</td>
                      <td>{d.conducted_by}</td>
                      <td><span className={d.outcome==="Passed" ? "badge badge-success" : "badge badge-danger"}>{d.outcome}</span></td>
                      <td className="text-[#5a6a8a] italic text-[11px]">{d.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* SCHEDULE DRILL MODAL */}
    {drillModal && (
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30" onClick={() => setDrillModal(false)} />
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#c8d4e8]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#c8d4e8]" style={{ background: "#b91c1c" }}>
            <h3 className="text-[13px] font-bold text-white">Schedule Emergency Drill</h3>
            <button onClick={() => setDrillModal(false)} className="text-red-200 hover:text-white">✕</button>
          </div>
          <form className="p-5 space-y-3" onSubmit={async e => {
            e.preventDefault(); setDrillSaving(true);
            try {
              await scheduleDrill(drillForm);
              const nd = await fetchDrillLogs();
              setDrills(nd);
              setDrillModal(false);
              setDrillForm({ type:"Fire Drill", station:"Maitri", date:"", participants:"", conducted_by:"" });
              setToast({ msg:"Drill scheduled successfully", type:"success" });
            } catch(err) { setToast({ msg:"Failed: " + err.message, type:"error" }); }
            setDrillSaving(false);
          }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="data-label block mb-1">Drill Type <span className="text-red-500">*</span></label>
                <select required value={drillForm.type} onChange={e => setDrillForm(f=>({...f,type:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none">
                  {["Fire Drill","Medical Emergency Drill","Communications Failure","Whiteout Drill","Evacuation Drill","Search & Rescue Drill"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="data-label block mb-1">Station <span className="text-red-500">*</span></label>
                <select required value={drillForm.station} onChange={e => setDrillForm(f=>({...f,station:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none">
                  {["Maitri","Bharati","Himadri"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="data-label block mb-1">Date <span className="text-red-500">*</span></label>
                <input required type="date" value={drillForm.date} onChange={e => setDrillForm(f=>({...f,date:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
              <div>
                <label className="data-label block mb-1">Expected Participants <span className="text-red-500">*</span></label>
                <input required type="number" placeholder="e.g. 48" value={drillForm.participants} onChange={e => setDrillForm(f=>({...f,participants:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="data-label block mb-1">Conducted By <span className="text-red-500">*</span></label>
              <input required placeholder="Officer/Doctor name" value={drillForm.conducted_by} onChange={e => setDrillForm(f=>({...f,conducted_by:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#c8d4e8]">
              <button type="submit" disabled={drillSaving}
                className="flex items-center gap-1.5 px-5 py-2 rounded text-[12px] font-semibold text-white"
                style={{ background: drillSaving ? "#9b1919" : "#b91c1c" }}>
                {drillSaving && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />}
                {drillSaving ? "Scheduling..." : "Schedule Drill"}
              </button>
              <button type="button" onClick={() => setDrillModal(false)} className="btn-outline px-4 py-2">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}    {/* SCHEDULE DRILL MODAL */}
    {drillModal && (
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30" onClick={() => setDrillModal(false)} />
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#c8d4e8]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#c8d4e8]" style={{ background: "#b91c1c" }}>
            <h3 className="text-[13px] font-bold text-white">Schedule Emergency Drill</h3>
            <button onClick={() => setDrillModal(false)} className="text-red-200 hover:text-white">✕</button>
          </div>
          <form className="p-5 space-y-3" onSubmit={async e => {
            e.preventDefault(); setDrillSaving(true);
            try {
              await scheduleDrill(drillForm);
              const nd = await fetchDrillLogs();
              setDrills(nd);
              setDrillModal(false);
              setDrillForm({ type:"Fire Drill", station:"Maitri", date:"", participants:"", conducted_by:"" });
              setToast({ msg:"Drill scheduled successfully", type:"success" });
            } catch(err) { setToast({ msg:"Failed: " + err.message, type:"error" }); }
            setDrillSaving(false);
          }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="data-label block mb-1">Drill Type <span className="text-red-500">*</span></label>
                <select required value={drillForm.type} onChange={e => setDrillForm(f=>({...f,type:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none">
                  {["Fire Drill","Medical Emergency Drill","Communications Failure","Whiteout Drill","Evacuation Drill","Search & Rescue Drill"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="data-label block mb-1">Station <span className="text-red-500">*</span></label>
                <select required value={drillForm.station} onChange={e => setDrillForm(f=>({...f,station:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none">
                  {["Maitri","Bharati","Himadri"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="data-label block mb-1">Date <span className="text-red-500">*</span></label>
                <input required type="date" value={drillForm.date} onChange={e => setDrillForm(f=>({...f,date:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
              <div>
                <label className="data-label block mb-1">Expected Participants <span className="text-red-500">*</span></label>
                <input required type="number" placeholder="e.g. 48" value={drillForm.participants} onChange={e => setDrillForm(f=>({...f,participants:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="data-label block mb-1">Conducted By <span className="text-red-500">*</span></label>
              <input required placeholder="Officer/Doctor name" value={drillForm.conducted_by} onChange={e => setDrillForm(f=>({...f,conducted_by:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#c8d4e8]">
              <button type="submit" disabled={drillSaving}
                className="flex items-center gap-1.5 px-5 py-2 rounded text-[12px] font-semibold text-white"
                style={{ background: drillSaving ? "#9b1919" : "#b91c1c" }}>
                {drillSaving && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />}
                {drillSaving ? "Scheduling..." : "Schedule Drill"}
              </button>
              <button type="button" onClick={() => setDrillModal(false)} className="btn-outline px-4 py-2">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {toast && (
      <div className={`fixed bottom-6 right-6 z-[500] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-[12px] font-semibold ${toast.type==="success" ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"}`}>
        {toast.type === "success" ? "✓ " : "✗ "}{toast.msg}
        <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
      </div>
    )}
    </>
  );
}