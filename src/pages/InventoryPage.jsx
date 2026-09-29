import React, { useState, useEffect } from "react";
import { fetchAllInventory, fetchItemMaster, fetchStockTransactions } from "../data/api";
import { Modal, Toast, Field, SubmitBtn } from "../components/Modal";
import { logTransaction } from "../data/api";
import { Database, TrendingDown, AlertTriangle, Plus, QrCode, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Cell } from "recharts";

function getStatus(item) {
  if (item.current <= item.threshold_critical) return "critical";
  if (item.current <= item.threshold_warning) return "warning";
  return "ok";
}
function forecastDays(item) {
  return item.consumption_rate > 0 ? Math.floor(item.current / item.consumption_rate) : Infinity;
}

const STATUS_CFG = {
  critical: { bar: "bg-red-500",   text: "text-red-700",   border: "border-red-300",   bg: "bg-red-50",   badge: "badge badge-danger"  },
  warning:  { bar: "bg-amber-500", text: "text-amber-700", border: "border-amber-300", bg: "bg-amber-50", badge: "badge badge-warning" },
  ok:       { bar: "bg-green-600", text: "text-green-700", border: "border-green-300", bg: "bg-green-50", badge: "badge badge-success" },
};

const CRIT_BADGE = { critical: "badge badge-danger", high: "badge badge-warning", medium: "badge badge-info", low: "badge badge-neutral" };

export default function InventoryPage() {
  const [inventory, setInventory] = useState(null);
  const [items, setItems]         = useState(null);
  const [txns, setTxns]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("overview");
  const [stnFilter, setStnFilter] = useState("all");
  const [scanMode, setScanMode]   = useState(false);
  const [scanned, setScanned]     = useState("");
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [txnForm, setTxnForm]     = useState({ item_id:"", station:"Bharati", type:"issue", quantity:"", unit:"", performed_by:"", reference:"", barcode_scanned:false });
  const [txnSaving, setTxnSaving] = useState(false);
  const [toast, setToast]         = useState(null);

  useEffect(() => {
    Promise.all([fetchAllInventory(), fetchItemMaster(), fetchStockTransactions()]).then(([inv, im, tx]) => {
      setInventory(inv); setItems(im); setTxns(tx); setLoading(false);
    });
  }, []);

  const stations = inventory ? [...new Set(inventory.map(i => i.station))] : [];
  const filtered = inventory?.filter(i => stnFilter === "all" || i.station === stnFilter) || [];
  const atRisk   = filtered.filter(i => forecastDays(i) < i.days_to_next_resupply && i.days_to_next_resupply > 0);

  if (loading) return <div className="p-4 space-y-3">{[1,2,3,4].map(i => <div key={i} className="skeleton-shimmer h-24 rounded" />)}</div>;

  return (
    <>
    <div className="flex flex-col h-full overflow-hidden">
      <div className="section-header flex-shrink-0">
        <div className="breadcrumb">
          <Database className="w-3.5 h-3.5 text-[#003580]" />
          <span className="text-[#003580] font-semibold">Inventory & Asset Management</span>
        </div>
        <div className="flex gap-2">
          <button id="inv-scan" onClick={() => setScanMode(!scanMode)}
            className={`btn-outline ${scanMode ? "border-[#f47920] text-[#f47920]" : ""}`}>
            <QrCode className="w-3.5 h-3.5" /> {scanMode ? "Scanning…" : "QR Scan"}
          </button>
          <button id="inv-add-item" onClick={() => setShowTxnModal(true)} className="btn-primary"><Plus className="w-3.5 h-3.5" /> Log Transaction</button>
        </div>
      </div>

      {/* Scan bar */}
      {scanMode && (
        <div className="flex-shrink-0 mx-4 mt-2 p-3 bg-amber-50 border border-amber-200 rounded flex items-center gap-3">
          <QrCode className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-[12px] text-amber-800 flex-1">Barcode / QR Scan Mode — Point camera or type below</p>
          <input id="inv-barcode-input" type="text" placeholder="Scan or enter barcode…" value={scanned}
            onChange={e => setScanned(e.target.value)}
            className="w-52 border border-amber-300 rounded px-2.5 py-1.5 text-[12px] text-[#1a2744] focus:border-[#003580] focus:outline-none font-mono bg-white" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #c8d4e8", background: "#f5f7fb" }} className="flex gap-0 px-4 flex-shrink-0">
        {[
          { id: "overview",      label: "Stock Overview"   },
          { id: "forecast",      label: "Risk Forecast"    },
          { id: "transactions",  label: "Transactions"     },
          { id: "master",        label: "Item Master"      },
        ].map(({ id, label }) => (
          <button key={id} id={`inv-tab-${id}`} onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-[12px] font-semibold border-b-2 transition-colors ${
              tab === id ? "border-[#f47920] text-[#003580]" : "border-transparent text-[#5a6a8a] hover:text-[#003580]"
            }`}>{label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* === STOCK OVERVIEW === */}
        {tab === "overview" && (
          <div className="space-y-4">
            {atRisk.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-300 rounded">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-[12px] text-red-800 font-medium">{atRisk.length} item(s) projected to reach stock-out before next resupply. Immediate action required.</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#5a6a8a]" />
              <div className="flex gap-1 bg-white border border-[#c8d4e8] rounded p-1">
                <button id="inv-filter-all" onClick={() => setStnFilter("all")}
                  className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${stnFilter === "all" ? "bg-[#003580] text-white" : "text-[#5a6a8a] hover:text-[#003580]"}`}>All</button>
                {stations.map(s => (
                  <button key={s} id={`inv-filter-${s.toLowerCase().replace(/\s/g,"-")}`} onClick={() => setStnFilter(s)}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${stnFilter === s ? "bg-[#003580] text-white" : "text-[#5a6a8a] hover:text-[#003580]"}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(item => {
                const st = getStatus(item);
                const pct = Math.min((item.current / item.capacity) * 100, 100);
                const cfg = STATUS_CFG[st];
                const daysLeft = forecastDays(item);
                const risk = daysLeft < item.days_to_next_resupply && item.days_to_next_resupply > 0;
                return (
                  <div key={item.id} className={`rounded border p-3.5 ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex gap-2 mb-1"><span className={cfg.badge}>{st}</span><span className={CRIT_BADGE[item.criticality]}>{item.criticality}</span></div>
                        <p className={`text-[12px] font-bold ${cfg.text}`}>{item.category}</p>
                        <p className="text-[10px] text-[#5a6a8a]">{item.station}</p>
                      </div>
                      <p className={`text-lg font-bold font-mono ${cfg.text}`}>{item.current}<span className="text-[10px] text-[#8595af] ml-0.5">{item.unit}</span></p>
                    </div>
                    <div className="relative h-2 bg-white rounded-full overflow-hidden border border-[#d0d7de] mb-2">
                      <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                      <div className="absolute top-0 h-full w-0.5 bg-amber-400" style={{ left: `${(item.threshold_warning/item.capacity)*100}%` }} />
                      <div className="absolute top-0 h-full w-0.5 bg-red-500"   style={{ left: `${(item.threshold_critical/item.capacity)*100}%` }} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-[#5a6a8a] flex items-center gap-1"><TrendingDown className="w-3 h-3" />{item.consumption_rate}/day</span>
                      <span className={`text-[10px] font-semibold ${risk ? "text-red-700" : "text-green-700"}`}>
                        {daysLeft === Infinity ? "Stable" : `${daysLeft}d to stockout`}{risk && " ⚠ Risk"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === RISK FORECAST === */}
        {tab === "forecast" && (
          <div className="space-y-4">
            <div className="card p-4">
              <p className="card-title mb-4">Inventory Risk Overview (% of Capacity)</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={inventory?.map(i => ({
                  name: i.category.split(" ")[0],
                  pct: Math.round((i.current / i.capacity) * 100),
                  st: getStatus(i),
                }))} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: "#5a6a8a", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#5a6a8a", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0,100]} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #c8d4e8", borderRadius: "4px", fontSize: "11px", color: "#1a2744" }} cursor={{ fill: "rgba(0,53,128,0.04)" }} />
                  <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: "Warn", fill: "#b45309", fontSize: 9 }} />
                  <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="4 3" label={{ value: "Crit", fill: "#991b1b", fontSize: 9 }} />
                  <Bar dataKey="pct" radius={[3,3,0,0]}>
                    {inventory?.map((entry, i) => {
                      const st = getStatus(entry);
                      return <Cell key={i} fill={st==="critical"?"#ef4444":st==="warning"?"#f59e0b":"#138808"} fillOpacity={0.85} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card overflow-hidden">
              <div className="card-header"><span className="card-title">Depletion Forecast Table</span></div>
              <table className="goi-table">
                <thead><tr><th>Item</th><th>Station</th><th>Current</th><th>Rate/Day</th><th>Days Left</th><th>Next Resupply</th><th>Risk</th></tr></thead>
                <tbody>
                  {inventory?.map(item => {
                    const daysLeft = forecastDays(item);
                    const risk = daysLeft < item.days_to_next_resupply && item.days_to_next_resupply > 0;
                    return (
                      <tr key={item.id}>
                        <td className="font-medium">{item.category}</td>
                        <td>{item.station}</td>
                        <td className="font-mono">{item.current} {item.unit}</td>
                        <td className="font-mono">{item.consumption_rate}</td>
                        <td className={`font-mono font-bold ${risk ? "text-red-700" : "text-green-700"}`}>{daysLeft === Infinity ? "Stable" : `${daysLeft}d`}</td>
                        <td className="font-mono text-[#5a6a8a]">{item.days_to_next_resupply > 0 ? `${item.days_to_next_resupply}d` : "Hub"}</td>
                        <td>{risk ? <span className="badge badge-danger">Stockout Risk</span> : <span className="badge badge-success">OK</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === TRANSACTIONS === */}
        {tab === "transactions" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="data-label">{txns?.length} Recent Transactions</p>
              <button id="inv-log-txn" onClick={() => setShowTxnModal(true)} className="btn-primary"><Plus className="w-3.5 h-3.5" /> Log Transaction</button>
            </div>
            <div className="card overflow-hidden">
              <table className="goi-table">
                <thead><tr><th>Type</th><th>Item</th><th>Station</th><th>Qty</th><th>Date</th><th>Performed By</th><th>Reference</th><th>QR</th></tr></thead>
                <tbody>
                  {txns?.map(txn => (
                    <tr key={txn.id}>
                      <td><span className={txn.type === "issue" ? "badge badge-warning" : "badge badge-success"}>{txn.type}</span></td>
                      <td className="font-medium">{items?.find(i => i.id === txn.item_id)?.name || txn.item_id}</td>
                      <td>{txn.station}</td>
                      <td className={`font-mono font-bold ${txn.quantity < 0 ? "text-red-700" : "text-green-700"}`}>{txn.quantity > 0 ? "+" : ""}{txn.quantity}</td>
                      <td className="font-mono text-[#5a6a8a]">{txn.date}</td>
                      <td>{txn.performed_by}</td>
                      <td className="text-[#5a6a8a]">{txn.reference}</td>
                      <td>{txn.barcode_scanned ? <span className="badge badge-info">QR ✓</span> : <span className="badge badge-neutral">Manual</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === ITEM MASTER === */}
        {tab === "master" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="data-label">{items?.length} Registered Items</p>
              <button id="inv-add-master" className="btn-primary"><Plus className="w-3.5 h-3.5" /> Add Item</button>
            </div>
            <div className="card overflow-hidden">
              <table className="goi-table">
                <thead><tr><th>Item Name</th><th>Category</th><th>Unit</th><th>Criticality</th><th>Shelf Life</th><th>Storage</th><th>Barcode</th></tr></thead>
                <tbody>
                  {items?.map(item => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.name}</td>
                      <td>{item.category}</td>
                      <td className="font-mono">{item.unit}</td>
                      <td><span className={CRIT_BADGE[item.criticality]}>{item.criticality}</span></td>
                      <td className="font-mono">{item.shelf_life_days > 0 ? `${item.shelf_life_days}d` : "N/A"}</td>
                      <td className="text-[#5a6a8a]">{item.storage_condition}</td>
                      <td className="font-mono text-[#8595af] text-[10px]">{item.barcode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* === LOG TRANSACTION MODAL === */}
    {showTxnModal && (
      <Modal title="Log Stock Transaction" onClose={() => setShowTxnModal(false)}
        footer={
          <>
            <button type="submit" form="txn-form" disabled={txnSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded text-[12px] font-semibold text-white"
              style={{ background: txnSaving ? "#6b8cbf" : "var(--goi-navy)" }}>
              {txnSaving && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />}
              {txnSaving ? "Saving..." : "Log Transaction"}
            </button>
            <button type="button" onClick={() => setShowTxnModal(false)} className="btn-outline px-4 py-2">Cancel</button>
          </>
        }>
        <form id="txn-form" onSubmit={async e => {
          e.preventDefault(); setTxnSaving(true);
          try {
            await logTransaction({ ...txnForm, quantity: Number(txnForm.quantity) });
            const [ni, nt] = await Promise.all([fetchAllInventory(), fetchStockTransactions()]);
            setInventory(ni); setTxns(nt);
            setShowTxnModal(false);
            setTxnForm({ item_id:"", station:"Bharati", type:"issue", quantity:"", unit:"", performed_by:"", reference:"", barcode_scanned:false });
            setToast({ msg:"Transaction logged successfully", type:"success" });
          } catch(err) { setToast({ msg:"Failed: " + err.message, type:"error" }); }
          setTxnSaving(false);
        }} className="space-y-3">
          <div>
            <label className="data-label block mb-1">Item <span className="text-red-500">*</span></label>
            <select required value={txnForm.item_id} onChange={e => setTxnForm(f=>({...f,item_id:e.target.value}))}
              className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] text-[#1a2744] bg-white focus:border-[#003580] focus:outline-none">
              <option value="">— Select Item —</option>
              {items?.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="data-label block mb-1">Station <span className="text-red-500">*</span></label>
              <select required value={txnForm.station} onChange={e => setTxnForm(f=>({...f,station:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] text-[#1a2744] bg-white focus:border-[#003580] focus:outline-none">
                {["Bharati","Maitri","Himadri"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="data-label block mb-1">Type <span className="text-red-500">*</span></label>
              <select required value={txnForm.type} onChange={e => setTxnForm(f=>({...f,type:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] text-[#1a2744] bg-white focus:border-[#003580] focus:outline-none">
                {["issue","receipt","adjustment"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="data-label block mb-1">Quantity <span className="text-red-500">*</span></label>
              <input required type="number" placeholder="e.g. 500" value={txnForm.quantity} onChange={e => setTxnForm(f=>({...f,quantity:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] text-[#1a2744] bg-white focus:border-[#003580] focus:outline-none" />
            </div>
            <div>
              <label className="data-label block mb-1">Unit <span className="text-red-500">*</span></label>
              <input required placeholder="L / kg / sets" value={txnForm.unit} onChange={e => setTxnForm(f=>({...f,unit:e.target.value}))}
                className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] text-[#1a2744] bg-white focus:border-[#003580] focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="data-label block mb-1">Performed By <span className="text-red-500">*</span></label>
            <input required placeholder="Officer name" value={txnForm.performed_by} onChange={e => setTxnForm(f=>({...f,performed_by:e.target.value}))}
              className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] text-[#1a2744] bg-white focus:border-[#003580] focus:outline-none" />
          </div>
          <div>
            <label className="data-label block mb-1">Reference No.</label>
            <input placeholder="e.g. IND-004-RECEIPT" value={txnForm.reference} onChange={e => setTxnForm(f=>({...f,reference:e.target.value}))}
              className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] text-[#1a2744] bg-white focus:border-[#003580] focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="txn-qr-check" checked={txnForm.barcode_scanned} onChange={e => setTxnForm(f=>({...f,barcode_scanned:e.target.checked}))} className="w-4 h-4 accent-[#003580]" />
            <label htmlFor="txn-qr-check" className="text-[12px] text-[#1a2744]">Barcode / QR scanned</label>
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