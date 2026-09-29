import React, { useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export function Modal({ title, onClose, children, footer, wide = false }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className={`relative bg-white rounded-lg shadow-2xl border border-[#c8d4e8] flex flex-col ${wide ? "w-full max-w-2xl" : "w-full max-w-md"} max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#c8d4e8] flex-shrink-0" style={{ background: "var(--goi-navy)" }}>
          <h3 className="text-[13px] font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-blue-300 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {/* Footer */}
        {footer && <div className="border-t border-[#c8d4e8] px-5 py-3 bg-[#f5f7fb] flex items-center gap-2 flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

export function Toast({ message, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-[500] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-[12px] font-semibold animate-[fadeIn_.2s_ease] ${type === "success" ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"}`}>
      {type === "success" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
      {message}
    </div>
  );
}

export function Field({ label, id, type = "text", value, onChange, required, options, placeholder, rows }) {
  const base = "w-full border border-[#c8d4e8] rounded px-3 py-2 text-[12px] text-[#1a2744] bg-white focus:border-[#003580] focus:ring-1 focus:ring-[#003580]/20 focus:outline-none";
  return (
    <div>
      <label htmlFor={id} className="data-label block mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {options
        ? <select id={id} value={value} onChange={e => onChange(e.target.value)} className={base} required={required}>
            <option value="">— Select —</option>
            {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
          </select>
        : rows
        ? <textarea id={id} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} required={required} className={`${base} resize-none`} />
        : <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} className={base} />
      }
    </div>
  );
}

export function SubmitBtn({ loading, label = "Submit", loadLabel = "Saving…" }) {
  return (
    <button type="submit" disabled={loading}
      className="flex items-center gap-1.5 px-5 py-2 rounded text-[12px] font-semibold text-white transition-colors"
      style={{ background: loading ? "#6b8cbf" : "var(--goi-navy)" }}>
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {loading ? loadLabel : label}
    </button>
  );
}
