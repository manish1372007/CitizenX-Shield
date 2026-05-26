import React, { useState, useEffect } from "react";
import { AlertTriangle, Search, PhoneOff, ShieldCheck, ShieldAlert, History, User, BookOpen, AlertCircle } from "lucide-react";

interface AlertsViewProps {
  user: { _id: string; name: string; email: string };
}

export default function AlertsView({ user }: AlertsViewProps) {
  const [searchPhone, setSearchPhone] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [globalAlerts, setGlobalAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // Load platform-wide aggregate threat stats
  const fetchGlobalAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setGlobalAlerts(data.alertSignals || []);
      }
    } catch (err) {
      console.error("Failed to load global alert feeds.", err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchGlobalAlerts();
  }, []);

  const handlePhoneSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setSearchResult(null);

    const clean = searchPhone.replace(/\D/g, "");
    if (clean.length !== 10) {
      setSearchError("Format error: A valid Indian phone number contains exactly 10 numeric digits.");
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/reports/check-phone?phone=${clean}`);
      if (!res.ok) throw new Error("Threat query endpoint offline.");
      const data = await res.json();
      setSearchResult(data);
    } catch (err: any) {
      setSearchError(err.message || "Something went wrong during check.");
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/60 p-6 md:p-8 space-y-8 custom-scrollbar">
      
      {/* HUD Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Spam Telephone Threat Database</h1>
        <p className="text-xs text-slate-500 mt-1">
          Perform queries on suspicious contact parameters, or view active High-Risk flag alerts in the global registry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Interactive Search Box Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-950 mb-4">Validate Suspect Caller Telephony</h2>
            
            <form onSubmit={handlePhoneSearch} className="space-y-4">
              {searchError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 max-w-lg">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{searchError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-2.5 text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    id="search-phone-input"
                    type="text"
                    placeholder="Enter 10-digit number (e.g., 9012345678)"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="w-full bg-slate-50 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 font-mono"
                  />
                </div>
                <button
                  id="search-phone-btn"
                  type="submit"
                  disabled={searchLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all shadow-sm shrink-0 min-w-28 cursor-pointer"
                >
                  {searchLoading ? "Searching..." : "Check Number"}
                </button>
              </div>
            </form>

            {/* Render Phone database match results */}
            {searchResult && (
              <div id="search-threat-badge" className="mt-6 border-t border-slate-100 pt-5 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Scam Alert Threat Level</span>
                    <span className="text-sm font-bold text-slate-800 font-mono block">
                      +91 {searchResult.phone}
                    </span>
                  </div>

                  {searchResult.count > 2 ? (
                    <div className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>{searchResult.threatLevel}</span>
                    </div>
                  ) : searchResult.count > 0 ? (
                    <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-lg flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Suspicious Activity Block ({searchResult.count} Reports)</span>
                    </div>
                  ) : (
                    <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Zero Reports (Genuine Indicator)</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed font-mono">
                  Report Count: <b>{searchResult.count} times reported</b> in database.
                  {searchResult.count > 2 && (
                    <p className="mt-1 text-[11px] text-rose-700 font-semibold font-sans">
                      ⚠️ Warning: This contact number has breached our security benchmark threshold limits (&gt;2 verified reports). Extreme caution is advised when interfacing content.
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Platform broad alert streams list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-950 mb-4 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Registered Scammers Stream
            </h2>

            {loadingAlerts ? (
              <div className="text-center py-12 text-slate-400 text-xs animate-pulse">
                Synchronizing live reports indexes...
              </div>
            ) : globalAlerts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                <p>No high-risk numbers currently matching database alerts.</p>
                <p className="text-[10px] text-slate-400 font-mono">Benchmark trigger: number with &gt;2 citizen reports.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {globalAlerts.map((alert: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-rose-50/30 border border-rose-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 font-mono">+91 {alert.phone}</span>
                        <span className="text-[9px] font-mono tracking-wider font-bold bg-rose-100 text-rose-700 py-0.5 px-1.5 rounded">{alert.threat}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">Scam Style: {alert.scamType}</p>
                    </div>

                    <div className="text-xs text-rose-700 font-semibold font-mono bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/50">
                      Reported {alert.count} Times
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Right Reference sidebar elements */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-500" /> Telephony Validation Benchmarks
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              CitizenX Shield flags and monitors suspect telecommunication nodes. If any 10-digit handset receives over 2 complaints, we elevate the entry to high-risk stream parameters.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1.5 leading-normal">
              <div>• <b>Low Risk</b>: Zero reported files.</div>
              <div>• <b>Suspicion</b>: 1 or 2 complaint entries.</div>
              <div>• <b>⚠️ High Risk</b>: Exceeds 2 verified citizen logs.</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
