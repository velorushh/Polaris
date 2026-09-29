import React, { useState, useEffect } from "react";
import { Modal, Toast } from "../components/Modal";
import { raiseIndent, updateIndent, fetchCargoVessels, fetchCargoIndents } from "../data/api";
import {
  Package, Anchor, ChevronRight, CheckCircle2, Loader2, Circle,
  Plus, Filter, ArrowRight, Layers, Clock,
} from "lucide-react";

const INDENT_STATUS = {
  pending:    "badge badge-warning",
  approved:   "badge badge-info",
  dispatched: "badge badge-success",
  received:   "badge badge-neutral",
};

const PRIORITY_BADGE = {
  critical: "badge badge-danger",
  high:     "badge badge-warning",
  normal:   "badge badge-neutral",
};

const EVENT_CONFIG = {
  completed: { dot: "bg-green-600", text: "text-green-700", Icon: CheckCircle2, ic: "text-green-600" },
  active:    { dot: "bg-blue-600 ring-4 ring-blue-100", text: "text-blue-700", Icon: Loader2, ic: "text-blue-600 animate-spin" },
  pending:   { dot: "bg-slate-300", text: "text-slate-500", Icon: Circle, ic: "text-slate-400" },
};

function StowagePlanner({ vessel }) {
  const byDest = {};
  vessel.cargo_manifest.forEach(item => {
    if (!byDest[item.destination]) byDest[item.destination] = [];
    byDest[item.destination].push(item);
  });
  const stops = vessel.stops.sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
        <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <p className="text-[12px] text-blue-800 font-medium">Smart Stowage Rule: <strong>Last Loaded = First Offloaded</strong> — Items for the first stop must be loaded last.</p>
      </div>

      {/* Voyage route */}
      <div className="bg-[#f5f7fb] border border-[#c8d4e8] rounded p-3 flex items-center gap-2">
        <span className="text-[11px] font-bold text-[#003580]">{vessel.origin}</span>
        {stops.map(stop => (
          <React.Fragment key={stop.name}>
            <ArrowRight className="w-3.5 h-3.5 text-[#8595af]" />
            <span className="text-[11px] font-bold text-[#1a2744]">{stop.name}</span>
          </React.Fragment>
        ))}
      </div>

      {stops.map((stop, i) => {
        const items = byDest[stop.name] || [];
        const loadOrder = stops.length - i;
        return (
          <div key={stop.name} className={`card overflow-hidden ${i === 0 ? "border-[#003580]" : ""}`}>
            <div className={`card-header ${i === 0 ? "bg-[#dbe6f8]" : ""}`}>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${i === 0 ? "bg-[#003580] text-white" : "bg-[#e2e8f0] text-[#475569]"}`}>
                  LOAD ORDER #{loadOrder}
                </span>
                <span className="card-title">{stop.name}</span>
                <span className="text-[10px] text-[#5a6a8a]">ETA: {new Date(stop.eta).toLocaleDateString("en-IN")}</span>
              </div>
              <span className="text-[10px] text-[#5a6a8a]">{items.length} items</span>
            </div>
            <table className="goi-table">
              <thead><tr>
                <th>Item</th><th>Priority</th><th>Quantity</th><th>Stowage Zone</th>
              </tr></thead>
              <tbody>
                {items.map((item, j) => (
                  <tr key={j}>
                    <td className="font-medium">{item.item}</td>
                    <td><span className={PRIORITY_BADGE[item.priority]}>{item.priority}</span></td>
                    <td className="font-mono">{item.quantity}</td>
                    <td className="text-[#5a6a8a]">{item.stowage_zone}</td>
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

export default function CargoPage() {
  const [vessels, setVessels] = useState(null);
  const [indents, setIndents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tracking");
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [raiseForm, setRaiseForm] = useState({ station:"Bharati", category:"", raised_by:"", priority:"normal", notes:"", items:[{name:"",qty:"",unit:"kg",weight_kg:"",volume_m3:""}] });
  const [raiseSaving, setRaiseSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [indentFilter, setIndentFilter] = useState("all");

  useEffect(() => {
    Promise.all([fetchCargoVessels(), fetchCargoIndents()]).then(([v, i]) => {
      setVessels(v); setIndents(i); setLoading(false);
    });
  }, []);

  const filtered = indents?.filter(i => indentFilter === "all" || i.status === indentFilter) || [];

  if (loading) return <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton-shimmer h-24 rounded" />)}</div>;

  return (
    <>
    <div className="flex flex-col h-full overflow-hidden">
      <div className="section-header flex-shrink-0">
        <div className="breadcrumb">
          <Package className="w-3.5 h-3.5 text-[#003580]" />
          <span className="text-[#003580] font-semibold">Cargo & Logistics</span>
        </div>
        <button id="cargo-raise-indent" onClick={() => setShowRaiseModal(true)} className="btn-primary"><Plus className="w-3.5 h-3.5" /> Raise Indent</button>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #c8d4e8", background: "#f5f7fb" }} className="flex gap-0 px-4 flex-shrink-0">
        {[
          { id: "tracking", label: "Live Vessel Tracking" },
          { id: "indents",  label: "Indent Management"   },
          { id: "stowage",  label: "Stowage Planner"     },
        ].map(({ id, label }) => (
          <button key={id} id={`cargo-tab-${id}`} onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 text-[12px] font-semibold border-b-2 transition-colors ${
              activeTab === id
                ? "border-[#f47920] text-[#003580]"
                : "border-transparent text-[#5a6a8a] hover:text-[#003580]"
            }`}>{label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Tracking Tab */}
        {activeTab === "tracking" && vessels?.map(vessel => (
          <div key={vessel.id} className="space-y-4">
            <div className="card overflow-hidden">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-[#003580]" />
                  <span className="text-[13px] font-bold text-[#1a2744]">{vessel.vessel_name}</span>
                  <span className="badge badge-info">{vessel.status.replace("_", " ")}</span>
                  <span className="text-[10px] font-mono text-[#8595af]">#{vessel.voyage_id}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#f47920]" />
                  <span className="text-[12px] font-bold text-[#f47920] font-mono">{vessel.eta_days}d ETA</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 bg-[#f5f7fb] rounded border border-[#c8d4e8] p-3 mb-4">
                  <span className="text-[12px] font-bold text-[#003580]">{vessel.origin}</span>
                  {vessel.stops.sort((a,b)=>a.order-b.order).map(stop => (
                    <React.Fragment key={stop.name}>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8595af]" />
                      <div className="text-center">
                        <p className="text-[11px] font-bold text-[#1a2744]">{stop.name}</p>
                        <p className="text-[9px] text-[#8595af]">Stop {stop.order}</p>
                      </div>
                    </React.Fragment>
                  ))}
                  <ArrowRight className="w-3.5 h-3.5 text-[#8595af]" />
                  <span className="text-[12px] text-[#8595af]">Return</span>
                </div>
                {/* Chain of custody */}
                <p className="data-label mb-3">Chain of Custody</p>
                <div className="relative">
                  <div className="absolute left-1.5 top-3 bottom-3 w-px bg-[#c8d4e8]" />
                  {vessel.tracking_events.map(ev => {
                    const cfg = EVENT_CONFIG[ev.status] ?? EVENT_CONFIG.pending;
                    const Icon = cfg.Icon;
                    return (
                      <div key={ev.id} className="relative flex items-start gap-3 pl-7 py-2.5 hover:bg-[#f5f7fb] rounded transition-colors">
                        <span className={`absolute left-0 top-3.5 w-4 h-4 rounded-full flex-shrink-0 border-2 border-white shadow ${cfg.dot}`} />
                        <div className="flex-1">
                          <p className={`text-[12px] font-semibold ${cfg.text}`}>{ev.event}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#8595af]">
                            <span>{ev.location}</span>
                            {ev.timestamp && <span className="font-mono">{new Date(ev.timestamp).toUTCString().slice(5,17)}</span>}
                            {ev.signed_by && <span className="text-green-700">Signed: {ev.signed_by}</span>}
                          </div>
                        </div>
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${cfg.ic}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Indents Tab */}
        {activeTab === "indents" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Filter className="w-3.5 h-3.5 text-[#5a6a8a]" />
              <div className="flex gap-1 bg-[#f5f7fb] border border-[#c8d4e8] rounded p-1">
                {["all", "pending", "approved", "dispatched"].map(f => (
                  <button key={f} id={`indent-filter-${f}`} onClick={() => setIndentFilter(f)}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                      indentFilter === f ? "bg-[#003580] text-white" : "text-[#5a6a8a] hover:text-[#003580]"
                    }`}>{f}</button>
                ))}
              </div>
              <span className="text-[11px] text-[#5a6a8a] ml-auto">{filtered.length} indents</span>
            </div>

            {filtered.map(indent => (
              <div key={indent.id} id={`indent-${indent.id}`}
                className="card hover:border-[#003580] hover:shadow-sm transition-all">
                <div className="card-header">
                  <div className="flex items-center gap-2">
                    <span className={INDENT_STATUS[indent.status]}>{indent.status}</span>
                    <span className={PRIORITY_BADGE[indent.priority]}>{indent.priority}</span>
                    <span className="text-[11px] font-bold text-[#1a2744]">{indent.category}</span>
                    <span className="text-[10px] font-mono text-[#8595af]">#{indent.id}</span>
                  </div>
                  <div className="text-right">
                    {indent.approved_by && <p className="text-[11px] text-green-700 font-semibold">Approved by {indent.approved_by}</p>}
                    <p className="text-[10px] text-[#8595af]">{indent.station} · {indent.raised_by} · {indent.raised_date}</p>
                  </div>
                </div>
                <table className="goi-table">
                  <thead><tr><th>Item Name</th><th>Qty</th><th>Unit</th><th>Weight (kg)</th><th>Volume (m³)</th></tr></thead>
                  <tbody>
                    {indent.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td className="font-mono">{item.qty}</td>
                        <td>{item.unit}</td>
                        <td className="font-mono">{item.weight_kg}</td>
                        <td className="font-mono">{item.volume_m3}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {indent.notes && <div className="px-4 py-2 text-[11px] text-[#5a6a8a] italic bg-[#f5f7fb] border-t border-[#c8d4e8]">{indent.notes}</div>}
              <div className="flex gap-2 px-4 py-2 bg-[#f5f7fb] border-t border-[#c8d4e8]">
                {indent.status === "pending" && (
                  <button onClick={async () => {
                    try {
                      await updateIndent(indent.id, { status:"approved", approved_by:"Current User" });
                      const ni = await fetchCargoIndents(); setIndents(ni);
                      setToast({ msg:"Indent approved", type:"success" });
                    } catch(err) { setToast({ msg:err.message, type:"error" }); }
                  }} className="px-3 py-1 rounded text-[11px] font-semibold text-white bg-green-700 hover:bg-green-800 transition-colors">✓ Approve</button>
                )}
                {indent.status === "approved" && (
                  <button onClick={async () => {
                    try {
                      await updateIndent(indent.id, { status:"dispatched" });
                      const ni = await fetchCargoIndents(); setIndents(ni);
                      setToast({ msg:"Marked as dispatched", type:"success" });
                    } catch(err) { setToast({ msg:err.message, type:"error" }); }
                  }} className="px-3 py-1 rounded text-[11px] font-semibold text-white bg-blue-700 hover:bg-blue-800 transition-colors">→ Mark Dispatched</button>
                )}
                {indent.status === "dispatched" && (
                  <button onClick={async () => {
                    try {
                      await updateIndent(indent.id, { status:"received" });
                      const ni = await fetchCargoIndents(); setIndents(ni);
                      setToast({ msg:"Marked as received", type:"success" });
                    } catch(err) { setToast({ msg:err.message, type:"error" }); }
                  }} className="px-3 py-1 rounded text-[11px] font-semibold text-white bg-[#003580] hover:bg-[#002060] transition-colors">✓ Mark Received</button>
                )}
              </div>
              </div>
            ))}
          </div>
        )}

        {/* Stowage Tab */}
        {activeTab === "stowage" && vessels?.map(vessel => (
          <StowagePlanner key={vessel.id} vessel={vessel} />
        ))}
      </div>
    </div>

    {/* === RAISE INDENT MODAL === */}
    {showRaiseModal && (
      <Modal title="Raise New Cargo Indent" onClose={() => setShowRaiseModal(false)} wide
        footer={
          <>
            <button type="submit" form="raise-indent-form" disabled={raiseSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded text-[12px] font-semibold text-white"
              style={{ background: raiseSaving ? "#6b8cbf" : "var(--goi-navy)" }}>
              {raiseSaving && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />}
              {raiseSaving ? "Submitting..." : "Submit Indent"}
            </button>
            <button type="button" onClick={() => setShowRaiseModal(false)} className="btn-outline px-4 py-2">Cancel</button>
          </>
        }>
        <form id="raise-indent-form" onSubmit={async e => {
          e.preventDefault(); setRaiseSaving(true);
          try {
            await raiseIndent({
              ...raiseForm,
              items: raiseForm.items.map(i => ({ ...i, qty: Number(i.qty), weight_kg: Number(i.weight_kg), volume_m3: Number(i.volume_m3) }))
            });
            const ni = await fetchCargoIndents();
            setIndents(ni);
            setShowRaiseModal(false);
            setRaiseForm({ station:"Bharati", category:"", raised_by:"", priority:"normal", notes:"", items:[{name:"",qty:"",unit:"kg",weight_kg:"",volume_m3:""}] });
            setToast({ msg:"Indent raised successfully", type:"success" });
          } catch(err) { setToast({ msg:"Failed: " + err.message, type:"error" }); }
          setRaiseSaving(false);
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="data-label block mb-1">Station <span className="text-red-500">*</span></label>
              <select required value={raiseForm.station} onChange={e => setRaiseForm(f=>({...f,station:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none">
                {["Bharati","Maitri","Himadri"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="data-label block mb-1">Priority <span className="text-red-500">*</span></label>
              <select required value={raiseForm.priority} onChange={e => setRaiseForm(f=>({...f,priority:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none">
                {["normal","high","critical"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="data-label block mb-1">Category <span className="text-red-500">*</span></label>
              <input required placeholder="e.g. Medical & Emergency" value={raiseForm.category} onChange={e => setRaiseForm(f=>({...f,category:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
            </div>
            <div>
              <label className="data-label block mb-1">Raised By <span className="text-red-500">*</span></label>
              <input required placeholder="Officer name" value={raiseForm.raised_by} onChange={e => setRaiseForm(f=>({...f,raised_by:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="data-label">Items <span className="text-red-500">*</span></p>
              <button type="button" onClick={() => setRaiseForm(f => ({...f, items:[...f.items, {name:"",qty:"",unit:"kg",weight_kg:"",volume_m3:""}]}))}
                className="text-[11px] text-[#003580] font-semibold hover:underline">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {raiseForm.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                  <input placeholder="Item name" value={item.name} onChange={e => { const items=[...raiseForm.items]; items[idx]={...items[idx],name:e.target.value}; setRaiseForm(f=>({...f,items})); }}
                    className="col-span-2 border border-[#c8d4e8] rounded px-2.5 py-1.5 text-[11px] bg-white focus:border-[#003580] focus:outline-none" required />
                  <input placeholder="Qty" type="number" value={item.qty} onChange={e => { const items=[...raiseForm.items]; items[idx]={...items[idx],qty:e.target.value}; setRaiseForm(f=>({...f,items})); }}
                    className="border border-[#c8d4e8] rounded px-2.5 py-1.5 text-[11px] bg-white focus:border-[#003580] focus:outline-none" required />
                  <input placeholder="Unit" value={item.unit} onChange={e => { const items=[...raiseForm.items]; items[idx]={...items[idx],unit:e.target.value}; setRaiseForm(f=>({...f,items})); }}
                    className="border border-[#c8d4e8] rounded px-2.5 py-1.5 text-[11px] bg-white focus:border-[#003580] focus:outline-none" />
                  <button type="button" onClick={() => setRaiseForm(f => ({...f, items: f.items.filter((_,i) => i!==idx)}))}
                    className="text-red-500 hover:text-red-700 text-[10px] font-semibold" disabled={raiseForm.items.length===1}>✕ Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="data-label block mb-1">Notes / Justification</label>
            <textarea rows={2} placeholder="Reason for indent, special requirements…" value={raiseForm.notes} onChange={e => setRaiseForm(f=>({...f,notes:e.target.value}))}
              className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none resize-none" />
          </div>
        </form>
      </Modal>
    )}    {/* === RAISE INDENT MODAL === */}
    {showRaiseModal && (
      <Modal title="Raise New Cargo Indent" onClose={() => setShowRaiseModal(false)} wide
        footer={
          <>
            <button type="submit" form="raise-indent-form" disabled={raiseSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded text-[12px] font-semibold text-white"
              style={{ background: raiseSaving ? "#6b8cbf" : "var(--goi-navy)" }}>
              {raiseSaving && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />}
              {raiseSaving ? "Submitting..." : "Submit Indent"}
            </button>
            <button type="button" onClick={() => setShowRaiseModal(false)} className="btn-outline px-4 py-2">Cancel</button>
          </>
        }>
        <form id="raise-indent-form" onSubmit={async e => {
          e.preventDefault(); setRaiseSaving(true);
          try {
            await raiseIndent({
              ...raiseForm,
              items: raiseForm.items.map(i => ({ ...i, qty: Number(i.qty), weight_kg: Number(i.weight_kg), volume_m3: Number(i.volume_m3) }))
            });
            const ni = await fetchCargoIndents();
            setIndents(ni);
            setShowRaiseModal(false);
            setRaiseForm({ station:"Bharati", category:"", raised_by:"", priority:"normal", notes:"", items:[{name:"",qty:"",unit:"kg",weight_kg:"",volume_m3:""}] });
            setToast({ msg:"Indent raised successfully", type:"success" });
          } catch(err) { setToast({ msg:"Failed: " + err.message, type:"error" }); }
          setRaiseSaving(false);
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="data-label block mb-1">Station <span className="text-red-500">*</span></label>
              <select required value={raiseForm.station} onChange={e => setRaiseForm(f=>({...f,station:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none">
                {["Bharati","Maitri","Himadri"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="data-label block mb-1">Priority <span className="text-red-500">*</span></label>
              <select required value={raiseForm.priority} onChange={e => setRaiseForm(f=>({...f,priority:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none">
                {["normal","high","critical"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="data-label block mb-1">Category <span className="text-red-500">*</span></label>
              <input required placeholder="e.g. Medical & Emergency" value={raiseForm.category} onChange={e => setRaiseForm(f=>({...f,category:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
            </div>
            <div>
              <label className="data-label block mb-1">Raised By <span className="text-red-500">*</span></label>
              <input required placeholder="Officer name" value={raiseForm.raised_by} onChange={e => setRaiseForm(f=>({...f,raised_by:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none" />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="data-label">Items <span className="text-red-500">*</span></p>
              <button type="button" onClick={() => setRaiseForm(f => ({...f, items:[...f.items, {name:"",qty:"",unit:"kg",weight_kg:"",volume_m3:""}]}))}
                className="text-[11px] text-[#003580] font-semibold hover:underline">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {raiseForm.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                  <input placeholder="Item name" value={item.name} onChange={e => { const items=[...raiseForm.items]; items[idx]={...items[idx],name:e.target.value}; setRaiseForm(f=>({...f,items})); }}
                    className="col-span-2 border border-[#c8d4e8] rounded px-2.5 py-1.5 text-[11px] bg-white focus:border-[#003580] focus:outline-none" required />
                  <input placeholder="Qty" type="number" value={item.qty} onChange={e => { const items=[...raiseForm.items]; items[idx]={...items[idx],qty:e.target.value}; setRaiseForm(f=>({...f,items})); }}
                    className="border border-[#c8d4e8] rounded px-2.5 py-1.5 text-[11px] bg-white focus:border-[#003580] focus:outline-none" required />
                  <input placeholder="Unit" value={item.unit} onChange={e => { const items=[...raiseForm.items]; items[idx]={...items[idx],unit:e.target.value}; setRaiseForm(f=>({...f,items})); }}
                    className="border border-[#c8d4e8] rounded px-2.5 py-1.5 text-[11px] bg-white focus:border-[#003580] focus:outline-none" />
                  <button type="button" onClick={() => setRaiseForm(f => ({...f, items: f.items.filter((_,i) => i!==idx)}))}
                    className="text-red-500 hover:text-red-700 text-[10px] font-semibold" disabled={raiseForm.items.length===1}>✕ Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="data-label block mb-1">Notes / Justification</label>
            <textarea rows={2} placeholder="Reason for indent, special requirements…" value={raiseForm.notes} onChange={e => setRaiseForm(f=>({...f,notes:e.target.value}))}
              className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] bg-white focus:border-[#003580] focus:outline-none resize-none" />
          </div>
        </form>
      </Modal>
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