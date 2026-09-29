import React, { useState, useEffect } from "react";
import { fetchAnalytics, fetchExpeditions } from "../data/api";
import { BarChart3, Download, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#003580","#f47920","#138808","#b91c1c","#6b21a8","#0891b2"];
const TT = { contentStyle: { background:"#fff", border:"1px solid #c8d4e8", borderRadius:"4px", fontSize:"11px", color:"#1a2744" }, cursor:{ fill:"rgba(0,53,128,0.04)" } };

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [expeditions, setExpeditions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    Promise.all([fetchAnalytics(), fetchExpeditions()]).then(([a,e]) => { setAnalytics(a); setExpeditions(e); setLoading(false); });
  }, []);

  if (loading) return <div className="p-4 space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton-shimmer h-48 rounded" />)}</div>;

  const activeExp = expeditions?.find(e => e.status==="active");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="section-header flex-shrink-0">
        <div className="breadcrumb">
          <BarChart3 className="w-3.5 h-3.5 text-[#003580]" />
          <span className="text-[#003580] font-semibold">Analytics & Reports</span>
        </div>
        <div className="flex gap-2">
          <button id="analytics-refresh" onClick={() => { setLoading(true); Promise.all([fetchAnalytics(), fetchExpeditions()]).then(([a,e]) => { setAnalytics(a); setExpeditions(e); setLoading(false); }); }} className="btn-ghost" title="Refresh data"><RefreshCw className="w-3.5 h-3.5" /></button>
          <button id="analytics-export" onClick={() => window.print()} className="btn-outline"><Download className="w-3.5 h-3.5" /> Export / Print</button>
        </div>
      </div>

      {/* Report tabs */}
      <div style={{ borderBottom:"1px solid #c8d4e8", background:"#f5f7fb" }} className="flex gap-0 px-4 flex-shrink-0">
        {["overview","cargo","inventory","personnel","budget"].map(id => (
          <button key={id} id={`analytics-tab-${id}`} onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-[12px] font-semibold border-b-2 transition-colors capitalize ${
              tab===id ? "border-[#f47920] text-[#003580]" : "border-transparent text-[#5a6a8a] hover:text-[#003580]"
            }`}>{id.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* OVERVIEW */}
        {tab==="overview" && activeExp && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-success">ACTIVE</span>
              <h3 className="text-[13px] font-bold text-[#1a2744]">{activeExp.name}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label:"Personnel",        value: activeExp.team_count,                           sub:`4 teams deployed`,                                              border:"#003580" },
                { label:"Budget Spent",     value:`₹${activeExp.budget_spent_crore}Cr`,            sub:`of ₹${activeExp.budget_crore}Cr total`,                        border:"#138808" },
                { label:"Cargo Received",   value:`${activeExp.cargo_received_mt} MT`,             sub:`of ${activeExp.cargo_planned_mt} MT planned`,                  border:"#f47920" },
                { label:"Milestones Done",  value:`${activeExp.milestones.filter(m=>m.status==="completed").length}/${activeExp.milestones.length}`, sub:"complete", border:"#6b21a8" },
              ].map(({label,value,sub,border}) => (
                <div key={label} className="card p-4" style={{ borderLeft:`4px solid ${border}` }}>
                  <p className="data-label mb-1">{label}</p>
                  <p className="text-xl font-bold font-mono text-[#1a2744]">{value}</p>
                  <p className="text-[10px] text-[#5a6a8a] mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
            <div className="card p-4">
              <p className="card-title mb-4">Monthly Budget Utilization (₹ Crore)</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.budget_utilization} {...TT}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill:"#5a6a8a", fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"#5a6a8a", fontSize:10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TT} />
                  <Bar dataKey="spent" name="Spent (Cr)" fill="#003580" radius={[3,3,0,0]} fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* CARGO */}
        {tab==="cargo" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"Planned",    value:`${analytics.cargo_reconciliation.planned} MT`,    border:"#003580" },
                { label:"Dispatched", value:`${analytics.cargo_reconciliation.dispatched} MT`, border:"#f47920" },
                { label:"Received",   value:`${analytics.cargo_reconciliation.received} MT`,   border:"#138808" },
              ].map(({label,value,border}) => (
                <div key={label} className="card p-4 text-center" style={{ borderLeft:`4px solid ${border}` }}>
                  <p className="data-label mb-1">{label}</p>
                  <p className="text-2xl font-bold font-mono text-[#1a2744]">{value}</p>
                </div>
              ))}
            </div>
            <div className="card p-4">
              <p className="card-title mb-4">Cargo Reconciliation by Category</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.cargo_reconciliation.by_category}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill:"#5a6a8a", fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"#5a6a8a", fontSize:10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TT} />
                  <Legend wrapperStyle={{ fontSize:"11px", color:"#5a6a8a" }} />
                  <Bar dataKey="planned"    name="Planned (MT)"    fill="#c8d4e8" radius={[3,3,0,0]} />
                  <Bar dataKey="dispatched" name="Dispatched (MT)" fill="#f47920" radius={[3,3,0,0]} fillOpacity={0.8} />
                  <Bar dataKey="received"   name="Received (MT)"   fill="#138808" radius={[3,3,0,0]} fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* INVENTORY */}
        {tab==="inventory" && (
          <div className="card p-4">
            <p className="card-title mb-4">Inventory Level Trends (% of Capacity)</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={analytics.inventory_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill:"#5a6a8a", fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#5a6a8a", fontSize:10 }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ fontSize:"11px", color:"#5a6a8a" }} />
                <Line type="monotone" dataKey="fuel_bharati"   name="Fuel – Bharati"   stroke="#003580" strokeWidth={2} dot={{ r:3 }} />
                <Line type="monotone" dataKey="fuel_maitri"    name="Fuel – Maitri"    stroke="#1a4d9c" strokeWidth={2} dot={{ r:3 }} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="rations_bharati"name="Rations – Bharati" stroke="#138808" strokeWidth={2} dot={{ r:3 }} />
                <Line type="monotone" dataKey="rations_maitri" name="Rations – Maitri"  stroke="#1d6b2a" strokeWidth={2} dot={{ r:3 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* PERSONNEL */}
        {tab==="personnel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <p className="card-title mb-4">Personnel by Station</p>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={analytics.personnel_distribution} cx="50%" cy="50%" outerRadius={90} dataKey="count" nameKey="station"
                    label={({station,count})=>`${station} (${count})`} labelLine={{ stroke:"#c8d4e8", strokeWidth:1 }}
                    style={{ fontSize:"10px", fill:"#5a6a8a" }}>
                    {analytics.personnel_distribution.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} fillOpacity={0.85} />)}
                  </Pie>
                  <Tooltip {...TT} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-4">
              <p className="card-title mb-4">Distribution Details</p>
              <div className="space-y-3">
                {analytics.personnel_distribution.map((item,i) => {
                  const total = analytics.personnel_distribution.reduce((s,x)=>s+x.count,0);
                  return (
                    <div key={item.station} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background:COLORS[i%COLORS.length] }} />
                      <span className="text-[12px] text-[#1a2744] flex-1">{item.station}</span>
                      <div className="flex-1 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width:`${(item.count/total)*100}%`, background:COLORS[i%COLORS.length], opacity:0.85 }} />
                      </div>
                      <span className="text-[12px] font-bold font-mono text-[#1a2744] w-8 text-right">{item.count}</span>
                    </div>
                  );
                })}
                <div className="border-t border-[#e2e8f0] pt-2 flex justify-between">
                  <span className="text-[12px] text-[#5a6a8a]">Total Deployed</span>
                  <span className="text-[13px] font-bold font-mono text-[#003580]">{analytics.personnel_distribution.reduce((s,x)=>s+x.count,0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BUDGET */}
        {tab==="budget" && activeExp && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"Total Budget", value:`₹${activeExp.budget_crore} Cr`,                              border:"#003580" },
                { label:"Spent",        value:`₹${activeExp.budget_spent_crore} Cr`,                        border:"#f47920" },
                { label:"Remaining",    value:`₹${(activeExp.budget_crore-activeExp.budget_spent_crore).toFixed(1)} Cr`, border:"#138808" },
              ].map(({label,value,border}) => (
                <div key={label} className="card p-4 text-center" style={{ borderLeft:`4px solid ${border}` }}>
                  <p className="data-label mb-1">{label}</p>
                  <p className="text-2xl font-bold font-mono text-[#1a2744]">{value}</p>
                </div>
              ))}
            </div>
            <div className="card p-4">
              <div className="flex justify-between text-[11px] text-[#5a6a8a] mb-1">
                <span>Budget Utilization</span>
                <span className="font-bold">{Math.round((activeExp.budget_spent_crore/activeExp.budget_crore)*100)}%</span>
              </div>
              <div className="h-3 bg-[#e2e8f0] rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full" style={{ width:`${(activeExp.budget_spent_crore/activeExp.budget_crore)*100}%`, background:"linear-gradient(to right,#003580,#f47920)" }} />
              </div>
              <p className="card-title mb-4">Monthly Spend (₹ Crore)</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.budget_utilization}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill:"#5a6a8a", fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"#5a6a8a", fontSize:10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TT} />
                  <Bar dataKey="spent" name="Spent (₹ Cr)" fill="#003580" radius={[3,3,0,0]} fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
