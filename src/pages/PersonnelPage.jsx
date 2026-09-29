import React, { useState, useEffect } from "react";
import { Toast } from "../components/Modal";
import { fetchPersonnel } from "../data/api";
import {
  Users, CheckCircle2, AlertCircle, MapPin, Phone,
  Shield, Activity, Plus, Search, Calendar,
} from "lucide-react";

const STATUS_CFG = {
  deployed:  { badge: "badge badge-success", dot: "bg-green-600"  },
  field:     { badge: "badge badge-info",    dot: "bg-blue-600 animate-pulse" },
  standby:   { badge: "badge badge-warning", dot: "bg-amber-500"  },
  "at-hub":  { badge: "badge badge-neutral", dot: "bg-slate-400"  },
};

function PersonnelCard({ person, selected, onSelect }) {
  const sc = STATUS_CFG[person.status] || STATUS_CFG.deployed;
  const allClear = Object.values(person.clearances).every(v => v === "approved");
  return (
    <button id={`person-${person.id}`} onClick={() => onSelect(person)}
      className={`w-full text-left p-3 rounded border transition-all ${
        selected ? "bg-[#dbe6f8] border-[#003580]" : "bg-white border-[#c8d4e8] hover:border-[#003580] hover:bg-[#f5f7fb]"
      }`}>
      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 font-bold text-[11px] text-white"
          style={{ background: "var(--goi-navy)" }}>
          {person.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[12px] font-bold text-[#1a2744] truncate">{person.name}</p>
            {!allClear && <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
          </div>
          <p className="text-[10px] text-[#5a6a8a]">{person.role}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`relative flex h-1.5 w-1.5`}>
              <span className={`absolute inline-flex h-full w-full rounded-full ${sc.dot} opacity-70`} />
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${sc.dot}`} />
            </span>
            <span className={sc.badge}>{person.status}</span>
            <span className="text-[10px] text-[#8595af] truncate">{person.station}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function RollCall({ personnel }) {
  const stations = [...new Set(personnel.map(p => p.station))];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-300 rounded">
        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
        <p className="text-[12px] text-red-800 font-bold">EMERGENCY ROLL-CALL MODE — Total personnel: {personnel.length}</p>
      </div>
      {stations.map(station => {
        const sp = personnel.filter(p => p.station === station);
        return (
          <div key={station} className="card overflow-hidden">
            <div className="card-header bg-[#dbe6f8]">
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#003580]" /><span className="card-title">{station}</span><span className="text-[11px] text-[#5a6a8a]">({sp.length} personnel)</span></div>
              <span className="badge badge-success">ACCOUNTED</span>
            </div>
            <table className="goi-table">
              <thead><tr><th>#</th><th>Name</th><th>Role</th><th>Status</th><th>Emergency Contact</th></tr></thead>
              <tbody>
                {sp.map((p, i) => (
                  <tr key={p.id}>
                    <td className="font-mono text-[#8595af]">{i+1}</td>
                    <td><div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-600" />{p.name}</div></td>
                    <td className="text-[#5a6a8a]">{p.role}</td>
                    <td><span className={STATUS_CFG[p.status]?.badge || "badge badge-neutral"}>{p.status}</span></td>
                    <td className="font-mono text-[#5a6a8a]">{p.emergency_contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>

  );
}

export default function PersonnelPage() {
  const [personnel, setPersonnel]     = useState(null);
  const [selected, setSelected]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState("roster");
  const [search, setSearch]           = useState("");
  const [stnFilter, setStnFilter]     = useState("all");
  const [addModal, setAddModal]       = useState(false);
  const [addForm, setAddForm]         = useState({ name:"", role:"", affiliation:"", station:"Maitri", emergency_contact:"", arrival_date:"", departure_date:"" });
  const [addSaving, setAddSaving]     = useState(false);
  const [toast, setToast]             = useState(null);

  useEffect(() => {
    fetchPersonnel().then(d => { setPersonnel(d); setSelected(d[0]); setLoading(false); });
  }, []);

  const stations = personnel ? ["all", ...new Set(personnel.map(p => p.station))] : ["all"];
  const filtered = personnel?.filter(p =>
    (stnFilter === "all" || p.station === stnFilter) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  if (loading) return <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton-shimmer h-20 rounded" />)}</div>;

  return (
    <>
    <div className="flex flex-col h-full overflow-hidden">
      <div className="section-header flex-shrink-0">
        <div className="breadcrumb">
          <Users className="w-3.5 h-3.5 text-[#003580]" />
          <span className="text-[#003580] font-semibold">Personnel Movement</span>
        </div>
        <button id="personnel-add" onClick={() => setAddModal(true)} className="btn-primary"><Plus className="w-3.5 h-3.5" /> Add Personnel</button>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #c8d4e8", background: "#f5f7fb" }} className="flex gap-0 px-4 flex-shrink-0">
        {[
          { id: "roster",    label: "Roster",                badge: null },
          { id: "rollcall",  label: "Emergency Roll-Call",   badge: "!" },
          { id: "clearances",label: "Clearance Status",      badge: null },
        ].map(({ id, label, badge }) => (
          <button key={id} id={`personnel-tab-${id}`} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold border-b-2 transition-colors ${
              tab === id ? "border-[#f47920] text-[#003580]" : "border-transparent text-[#5a6a8a] hover:text-[#003580]"
            }`}>
            {label}
            {badge && <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">{badge}</span>}
          </button>
        ))}
      </div>

      {/* Roll-call tab */}
      {tab === "rollcall" ? (
        <div className="flex-1 overflow-y-auto p-4"><RollCall personnel={personnel} /></div>
      ) : tab === "clearances" ? (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="card overflow-hidden">
            <div className="card-header"><span className="card-title">Clearance Status Matrix</span></div>
            <table className="goi-table">
              <thead><tr><th>Personnel</th><th>Role</th><th>Station</th><th>Medical</th><th>Training</th><th>Admin</th><th>Overall</th></tr></thead>
              <tbody>
                {personnel?.map(p => {
                  const allClear = Object.values(p.clearances).every(v => v === "approved");
                  return (
                    <tr key={p.id}>
                      <td className="font-medium">{p.name}</td>
                      <td>{p.role}</td>
                      <td>{p.station}</td>
                      {["medical","training","admin"].map(cl => (
                        <td key={cl}>{p.clearances[cl]==="approved"
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                        </td>
                      ))}
                      <td><span className={allClear ? "badge badge-success" : "badge badge-warning"}>{allClear ? "Cleared" : "Incomplete"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Roster tab */
        <div className="flex-1 overflow-hidden flex">
          {/* Left list */}
          <div className="w-72 flex-shrink-0 overflow-hidden flex flex-col" style={{ borderRight: "1px solid #c8d4e8", background: "#f5f7fb" }}>
            <div className="p-3 space-y-2" style={{ borderBottom: "1px solid #c8d4e8" }}>
              <div className="flex items-center gap-2 bg-white border border-[#c8d4e8] rounded px-2.5 py-1.5">
                <Search className="w-3.5 h-3.5 text-[#5a6a8a]" />
                <input id="personnel-search" type="text" placeholder="Search by name or role…" value={search} onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-[12px] text-[#1a2744] placeholder-[#8595af] focus:outline-none" />
              </div>
              <div className="flex flex-wrap gap-1">
                {stations.map(s => (
                  <button key={s} id={`personnel-filter-${s.toLowerCase().replace(/\s/g,"-")}`} onClick={() => setStnFilter(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${stnFilter === s ? "bg-[#003580] text-white" : "bg-white border border-[#c8d4e8] text-[#5a6a8a] hover:border-[#003580] hover:text-[#003580]"}`}>
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              <p className="data-label px-1 mb-1">{filtered.length} personnel</p>
              {filtered.map(p => <PersonnelCard key={p.id} person={p} selected={selected?.id === p.id} onSelect={setSelected} />)}
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                  style={{ background: "var(--goi-navy)" }}>
                  {selected.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1a2744]">{selected.name}</h2>
                  <p className="text-[12px] text-[#5a6a8a]">{selected.role} · {selected.affiliation}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={STATUS_CFG[selected.status]?.badge}>{selected.status}</span>
                    <MapPin className="w-3 h-3 text-[#5a6a8a]" />
                    <span className="text-[11px] text-[#5a6a8a]">{selected.station}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="card p-3"><p className="data-label mb-1">Deployment Period</p><div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#003580]" /><span className="text-[12px] text-[#1a2744]">{selected.arrival_date} → {selected.departure_date}</span></div></div>
                <div className="card p-3"><p className="data-label mb-1">Emergency Contact</p><div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#003580]" /><span className="text-[12px] text-[#1a2744]">{selected.emergency_contact}</span></div></div>
              </div>

              {/* Clearances */}
              <div className="card overflow-hidden">
                <div className="card-header"><div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#003580]" /><span className="card-title">Clearance Status</span></div></div>
                <div className="p-4 flex flex-wrap gap-2">
                  {Object.entries(selected.clearances).map(([type, status]) => {
                    const ok = status === "approved";
                    return (
                      <div key={type} className={`flex items-center gap-1.5 px-3 py-1.5 rounded border ${ok ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                        {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                        <span className={`text-[11px] font-bold capitalize ${ok ? "text-green-700" : "text-amber-700"}`}>{type}</span>
                        <span className={`text-[10px] ${ok ? "text-green-600" : "text-amber-600"}`}>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Movement log */}
              <div className="card overflow-hidden">
                <div className="card-header"><div className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-[#003580]" /><span className="card-title">Movement Log</span></div></div>
                <div className="p-4">
                  {(!selected.movement_log || selected.movement_log.length === 0)
                    ? <p className="text-[12px] text-[#8595af] italic">No movement log entries.</p>
                    : (
                      <div className="relative">
                        <div className="absolute left-2 top-3 bottom-3 w-px bg-[#c8d4e8]" />
                        {selected.movement_log.map((entry, i) => (
                          <div key={i} className="relative flex items-start gap-3 pl-7 py-2.5">
                            <span className="absolute left-0 top-3.5 w-4 h-4 rounded-full bg-[#003580] border-2 border-white shadow flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-[12px] font-semibold text-[#1a2744]">{entry.event}</p>
                              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#8595af]">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.location}</span>
                                <span className="font-mono">{new Date(entry.timestamp).toUTCString().slice(5,17)}</span>
                                <span className="text-[#f47920]">{entry.mode}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {addModal && (
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30" onClick={() => setAddModal(false)} />
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl border border-[#c8d4e8]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#c8d4e8]" style={{ background: "var(--goi-navy)" }}>
            <h3 className="text-[13px] font-bold text-white">Add Personnel to Expedition</h3>
            <button onClick={() => setAddModal(false)} className="text-blue-200 hover:text-white">✕</button>
          </div>
          <form className="p-5 space-y-3" onSubmit={async e => {
            e.preventDefault(); setAddSaving(true);
            try {
              await fetch("/api/personnel", {
                method:"POST", headers:{"Content-Type":"application/json"},
                body: JSON.stringify({ ...addForm, id:"p-"+Date.now(), expedition_id:"isea-44", status:"deployed", clearances:{medical:"pending",training:"pending",admin:"pending"}, movement_log:[] })
              });
              const np = await fetchPersonnel();
              setPersonnel(np); setSelected(np[0]);
              setAddModal(false);
              setAddForm({ name:"", role:"", affiliation:"", station:"Maitri", emergency_contact:"", arrival_date:"", departure_date:"" });
              setToast({ msg:"Personnel added successfully", type:"success" });
            } catch(err) { setToast({ msg:"Failed: " + err.message, type:"error" }); }
            setAddSaving(false);
          }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="data-label block mb-1">Full Name <span className="text-red-500">*</span></label>
                <input required placeholder="Dr. / Lt. Cmdr. …" value={addForm.name} onChange={e => setAddForm(f=>({...f,name:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
              <div>
                <label className="data-label block mb-1">Role <span className="text-red-500">*</span></label>
                <input required placeholder="Scientist / Officer / NCO" value={addForm.role} onChange={e => setAddForm(f=>({...f,role:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="data-label block mb-1">Affiliation</label>
                <input placeholder="NCPOR / NIO / IIT…" value={addForm.affiliation} onChange={e => setAddForm(f=>({...f,affiliation:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
              <div>
                <label className="data-label block mb-1">Assigned Station <span className="text-red-500">*</span></label>
                <select required value={addForm.station} onChange={e => setAddForm(f=>({...f,station:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none">
                  {["Maitri","Bharati","Himadri","Field"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="data-label block mb-1">Emergency Contact <span className="text-red-500">*</span></label>
              <input required placeholder="+91-9876543000" value={addForm.emergency_contact} onChange={e => setAddForm(f=>({...f,emergency_contact:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="data-label block mb-1">Arrival Date</label>
                <input type="date" value={addForm.arrival_date} onChange={e => setAddForm(f=>({...f,arrival_date:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
              <div>
                <label className="data-label block mb-1">Departure Date</label>
                <input type="date" value={addForm.departure_date} onChange={e => setAddForm(f=>({...f,departure_date:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#c8d4e8]">
              <button type="submit" disabled={addSaving}
                className="flex items-center gap-1.5 px-5 py-2 rounded text-[12px] font-semibold text-white"
                style={{ background: addSaving ? "#6b8cbf" : "var(--goi-navy)" }}>
                {addSaving && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />}
                {addSaving ? "Adding..." : "Add Personnel"}
              </button>
              <button type="button" onClick={() => setAddModal(false)} className="btn-outline px-4 py-2">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}    {addModal && (
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30" onClick={() => setAddModal(false)} />
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl border border-[#c8d4e8]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#c8d4e8]" style={{ background: "var(--goi-navy)" }}>
            <h3 className="text-[13px] font-bold text-white">Add Personnel to Expedition</h3>
            <button onClick={() => setAddModal(false)} className="text-blue-200 hover:text-white">✕</button>
          </div>
          <form className="p-5 space-y-3" onSubmit={async e => {
            e.preventDefault(); setAddSaving(true);
            try {
              await fetch("/api/personnel", {
                method:"POST", headers:{"Content-Type":"application/json"},
                body: JSON.stringify({ ...addForm, id:"p-"+Date.now(), expedition_id:"isea-44", status:"deployed", clearances:{medical:"pending",training:"pending",admin:"pending"}, movement_log:[] })
              });
              const np = await fetchPersonnel();
              setPersonnel(np); setSelected(np[0]);
              setAddModal(false);
              setAddForm({ name:"", role:"", affiliation:"", station:"Maitri", emergency_contact:"", arrival_date:"", departure_date:"" });
              setToast({ msg:"Personnel added successfully", type:"success" });
            } catch(err) { setToast({ msg:"Failed: " + err.message, type:"error" }); }
            setAddSaving(false);
          }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="data-label block mb-1">Full Name <span className="text-red-500">*</span></label>
                <input required placeholder="Dr. / Lt. Cmdr. …" value={addForm.name} onChange={e => setAddForm(f=>({...f,name:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
              <div>
                <label className="data-label block mb-1">Role <span className="text-red-500">*</span></label>
                <input required placeholder="Scientist / Officer / NCO" value={addForm.role} onChange={e => setAddForm(f=>({...f,role:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="data-label block mb-1">Affiliation</label>
                <input placeholder="NCPOR / NIO / IIT…" value={addForm.affiliation} onChange={e => setAddForm(f=>({...f,affiliation:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
              <div>
                <label className="data-label block mb-1">Assigned Station <span className="text-red-500">*</span></label>
                <select required value={addForm.station} onChange={e => setAddForm(f=>({...f,station:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none">
                  {["Maitri","Bharati","Himadri","Field"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="data-label block mb-1">Emergency Contact <span className="text-red-500">*</span></label>
              <input required placeholder="+91-9876543000" value={addForm.emergency_contact} onChange={e => setAddForm(f=>({...f,emergency_contact:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="data-label block mb-1">Arrival Date</label>
                <input type="date" value={addForm.arrival_date} onChange={e => setAddForm(f=>({...f,arrival_date:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
              <div>
                <label className="data-label block mb-1">Departure Date</label>
                <input type="date" value={addForm.departure_date} onChange={e => setAddForm(f=>({...f,departure_date:e.target.value}))}
                  className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#c8d4e8]">
              <button type="submit" disabled={addSaving}
                className="flex items-center gap-1.5 px-5 py-2 rounded text-[12px] font-semibold text-white"
                style={{ background: addSaving ? "#6b8cbf" : "var(--goi-navy)" }}>
                {addSaving && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />}
                {addSaving ? "Adding..." : "Add Personnel"}
              </button>
              <button type="button" onClick={() => setAddModal(false)} className="btn-outline px-4 py-2">Cancel</button>
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