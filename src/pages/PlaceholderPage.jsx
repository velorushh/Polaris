import React from "react";
import { Settings, Shield, HelpCircle } from "lucide-react";

const MODULE_META = {
  settings: { label:"System Settings", icon: Settings,    desc:"Configure application preferences, user roles, and system-wide parameters." },
  access:   { label:"Access Control",  icon: Shield,      desc:"Manage user permissions, RBAC roles, and authentication logs." },
  help:     { label:"Help & Documentation", icon: HelpCircle, desc:"User guides, SOP documentation, and platform release notes." },
};

export default function PlaceholderPage({ module }) {
  const meta = MODULE_META[module] || { label: module, icon: Settings, desc: "This module is under development." };
  const Icon = meta.icon;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="section-header flex-shrink-0">
        <div className="breadcrumb">
          <Icon className="w-3.5 h-3.5 text-[#003580]" />
          <span className="text-[#003580] font-semibold">{meta.label}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ background:"#eef2f8", border:"1px solid #c8d4e8" }}>
            <Icon className="w-8 h-8 text-[#003580]" />
          </div>
          <h2 className="text-[15px] font-bold text-[#1a2744] mb-2">{meta.label}</h2>
          <p className="text-[12px] text-[#5a6a8a] mb-4">{meta.desc}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded border border-[#c8d4e8] bg-[#f5f7fb]">
            <span className="badge badge-info">Under Development</span>
            <span className="text-[11px] text-[#5a6a8a]">Scheduled for v3.0 release</span>
          </div>
        </div>
      </div>
    </div>
  );
}
