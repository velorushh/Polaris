import React, { useState } from "react";
import { Snowflake, Eye, EyeOff, LogIn, Shield, AlertCircle } from "lucide-react";

// Ashoka Chakra SVG
function AshokaEmblem({ size = 64 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
      <circle cx="24" cy="24" r="22" fill="#003580" stroke="#f47920" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="14" fill="none" stroke="#f4c430" strokeWidth="1.2" />
      <circle cx="24" cy="24" r="3" fill="#f4c430" />
      {Array.from({ length: 24 }).map((_, i) => {
        const rad = (i * 360 / 24 * Math.PI) / 180;
        return (
          <line key={i}
            x1={24 + 4 * Math.cos(rad)} y1={24 + 4 * Math.sin(rad)}
            x2={24 + 13 * Math.cos(rad)} y2={24 + 13 * Math.sin(rad)}
            stroke="#f4c430" strokeWidth="0.8" />
        );
      })}
    </svg>
  );
}

const DEMO_USERS = [
  { username: "vikram.kumar",   password: "ncpor@2026", name: "Vikram Kumar",    role: "Operations Director",     avatar: "VK" },
  { username: "admin",          password: "admin123",   name: "Admin User",       role: "System Administrator",    avatar: "AU" },
  { username: "s.kulkarni",     password: "ncpor@2026", name: "Cmdr. S. Kulkarni",role: "NCPOR Operations",        avatar: "SK" },
  { username: "r.venkataraman", password: "ncpor@2026", name: "Dr. R. Venkataraman", role: "Chief Scientist",     avatar: "RV" },
];

export default function LoginPage({ onLogin }) {
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) { setError("Please enter both username and password."); return; }
    setLoading(true);
    try {
      const { loginUser } = await import("../data/api");
      const result = await loginUser(username.toLowerCase(), password);
      if (result.ok) {
        onLogin(result.user);
      } else {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      // Fallback to demo users if API is unreachable
      const user = DEMO_USERS.find(u => u.username === username.toLowerCase() && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
      }
    }
  };

  const handleQuickLogin = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--goi-bg)" }}>
      {/* GOI Top bar */}
      <div style={{ background: "#002060" }} className="py-1.5 px-6 flex items-center justify-between">
        <span className="text-[11px] text-blue-200">Government of India · Ministry of Earth Sciences</span>
        <span className="text-[11px] text-blue-300">Official Portal — NCPOR</span>
      </div>
      <div className="saffron-stripe" />

      {/* Main login area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl flex gap-0 rounded-lg shadow-lg overflow-hidden border border-[#c8d4e8]">

          {/* Left panel — branding */}
          <div className="w-96 flex-shrink-0 flex flex-col items-center justify-center p-10 text-white"
            style={{ background: "linear-gradient(160deg, #002060 0%, #003580 60%, #1a4d9c 100%)" }}>
            <AshokaEmblem size={80} />
            <div className="mt-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">NCPOR</p>
              <h1 className="text-xl font-bold text-white">Polar Command Center</h1>
              <p className="text-[11px] text-blue-200 mt-1">Integrated Expedition Logistics &amp; Asset Management</p>
            </div>
            <div className="mt-8 w-full border-t border-blue-400/20 pt-6 space-y-3">
              {[
                "Expedition Planning & Milestones",
                "Cargo & Vessel Tracking",
                "Inventory & Asset Management",
                "Emergency Response System",
              ].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f47920] flex-shrink-0" />
                  <span className="text-[11px] text-blue-100">{f}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-[9px] text-blue-400 uppercase tracking-widest">SIH26062 · MoES Polar Division</p>
            </div>
          </div>

          {/* Right panel — form */}
          <div className="flex-1 bg-white flex flex-col justify-center p-10">
            <div className="max-w-sm mx-auto w-full">
              <div className="flex items-center gap-2 mb-1">
                <Snowflake className="w-5 h-5 text-[#f47920]" />
                <h2 className="text-lg font-bold text-[#1a2744]">Sign In</h2>
              </div>
              <p className="text-[12px] text-[#5a6a8a] mb-6">Access the NCPOR Polar Command Center</p>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username */}
                <div>
                  <label htmlFor="login-username" className="data-label block mb-1">Username / Employee ID</label>
                  <input
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    placeholder="e.g. vikram.kumar"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full border border-[#c8d4e8] rounded px-3 py-2.5 text-[13px] text-[#1a2744] bg-white focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 focus:outline-none transition-colors"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className="data-label block mb-1">Password</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPass ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full border border-[#c8d4e8] rounded px-3 py-2.5 pr-10 text-[13px] text-[#1a2744] bg-white focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 focus:outline-none transition-colors"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8595af] hover:text-[#003580] transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-[12px] text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-[13px] text-white transition-all"
                  style={{ background: loading ? "#6b8cbf" : "var(--goi-navy)" }}
                >
                  {loading ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Authenticating…</>
                  ) : (
                    <><LogIn className="w-4 h-4" /> Sign In to Portal</>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] mt-1">
                  <a href="#" className="text-[#003580] hover:underline font-medium">Forgot Password?</a>
                  <a href="#" className="text-[#5a6a8a] hover:text-[#003580]">Request Access</a>
                </div>
              </form>

              {/* Demo quick logins */}
              <div className="mt-6 pt-5 border-t border-[#e2e8f0]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8595af] mb-2.5">Demo Credentials (SIH Evaluation)</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {DEMO_USERS.map(u => (
                    <button key={u.username} onClick={() => handleQuickLogin(u)}
                      className="text-left px-2.5 py-2 rounded border border-[#c8d4e8] hover:border-[#003580] hover:bg-[#f5f7fb] transition-colors">
                      <p className="text-[11px] font-bold text-[#1a2744]">{u.name.split(" ").slice(-1)[0]}</p>
                      <p className="text-[10px] text-[#5a6a8a]">{u.role}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 p-2.5 bg-[#f5f7fb] border border-[#c8d4e8] rounded">
                <Shield className="w-3.5 h-3.5 text-[#003580] flex-shrink-0" />
                <p className="text-[10px] text-[#5a6a8a]">This is a secure system. Unauthorized access is prohibited under IT Act 2000.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#002060", borderTop: "2px solid #f47920" }} className="py-2 px-6 flex items-center justify-between">
        <span className="text-[10px] text-blue-300">National Centre for Polar and Ocean Research (NCPOR), Headland Sada, Vasco-da-Gama, Goa – 403804</span>
        <span className="text-[10px] text-blue-400">v2.4.1-rc3 · NIC Hosted</span>
      </div>
    </div>
  );
}
