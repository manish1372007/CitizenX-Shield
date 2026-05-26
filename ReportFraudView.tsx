import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Info, Phone, ListFilter, IndianRupee, Landmark } from "lucide-react";

interface ReportFraudViewProps {
  user: { _id: string; name: string; email: string; mobile_number?: string };
  onReportFiled?: () => void;
}

export default function ReportFraudView({ user, onReportFiled }: ReportFraudViewProps) {
  const [phone, setPhone] = useState("");
  const [scamAmount, setScamAmount] = useState("");
  const [scamType, setScamType] = useState("Phishing Call");
  const [description, setDescription] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Live Scam Monitor Stats State
  const [dbStats, setDbStats] = useState({ totalLoss: 0, totalReports: 0 });

  const fetchDbStats = async () => {
    try {
      const res = await fetch("/api/complaints/stats");
      if (res.ok) {
        const data = await res.json();
        setDbStats({
          totalLoss: data.totalLoss || 0,
          totalReports: data.totalReports || 0
        });
      }
    } catch (err) {
      console.error("Failed to load complaints DB statistics.", err);
    }
  };

  useEffect(() => {
    fetchDbStats();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Strict 10-digit validation: Numbers only
    const cleanNum = phone.trim();
    if (cleanNum.length !== 10 || !/^\d+$/.test(cleanNum)) {
      setError("Invalid phone number. Please enter exactly 10 digits.");
      return;
    }

    // Validate scam amount of money is greater than zero
    const amt = Number(scamAmount);
    if (isNaN(amt) || amt <= 0) {
      setError("Scam amount must be greater than zero.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError("Please describe the scam scenario with at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/complaints/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          userName: user.name,
          scamAmount: amt,
          reportedNumber: cleanNum,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not log complaint.");
      }

      setSuccess(`Success: Logged financial scam report (+91 ${cleanNum}) representing a loss of ₹${amt.toLocaleString()} in our database.`);
      setPhone("");
      setScamAmount("");
      setDescription("");
      
      // Update the live monitor stats instantly (Always fetches from DB)
      await fetchDbStats();
      
      if (onReportFiled) onReportFiled();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while processing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/60 p-6 md:p-8 space-y-8 custom-scrollbar">
      
      {/* Title block */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Report Suspect Scam Communications</h1>
        <p className="text-xs text-slate-500 mt-1">
          Add phone numbers executing phishing, lottery message baiting, Aadhaar spoofs, or OTP thefts to global directories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main report form column */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 id="form-sub-header" className="text-sm font-bold text-slate-950 mb-5">File Fraud Database Record</h2>
          
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {error && (
              <div id="report-error-msg" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div id="report-success-msg" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Reported Number Suspect Input */}
            <div className="space-y-1">
              <label htmlFor="scam-phone" className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
                Suspect Phone Number (10 Digits)
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-2.5 text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="scam-phone"
                  type="text"
                  maxLength={10}
                  placeholder="e.g. 9876543210 (do not type +91 or country codes)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Must contain exactly 10 digits without symbols, spaces, or letters.</p>
            </div>

            {/* Scam Amount Input (Financial Loss) */}
            <div className="space-y-1">
              <label htmlFor="scam-amount" className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
                Scam Money Lost (Amount in ₹)
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-2.5 text-slate-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  id="scam-amount"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 5000 (must be greater than 0)"
                  value={scamAmount}
                  onChange={(e) => setScamAmount(e.target.value)}
                  className="w-full bg-slate-50 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Input the money lost due to this scam. Required positive numbers only.</p>
            </div>

            {/* Select Scam Category */}
            <div className="space-y-1">
              <label htmlFor="scam-category" className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
                Classified Scam Category
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-2.5 text-slate-400">
                  <ListFilter className="w-4 h-4" />
                </div>
                <select
                  id="scam-category"
                  value={scamType}
                  onChange={(e) => setScamType(e.target.value)}
                  className="w-full bg-slate-50 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                >
                  <option value="Phishing Call">Phishing Call (Impersonators claiming bank linkages)</option>
                  <option value="Lottery Scam">Lottery Scam (Bait SMS claiming cash wins)</option>
                  <option value="Vishing / Voice Clone">Vishing / Voice Clone (AI synthesis deception)</option>
                  <option value="OTP Theft / Threat">OTP Theft / Threat (Coerced secondary passwords)</option>
                  <option value="Aadhaar Spoofing">Aadhaar Spoofing (Unauthorized ID claims)</option>
                </select>
              </div>
            </div>

            {/* Description TextArea */}
            <div className="space-y-1">
              <label htmlFor="scam-desc" className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
                Details & Activity Description
              </label>
              <textarea
                id="scam-desc"
                placeholder="Briefly state dialogue, specific threats, or messages received. Include text patterns or any links sent in support to analyze risk."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 min-h-[140px] resize-none leading-relaxed"
              />
            </div>

            <button
              id="report-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white rounded-lg shadow-sm tracking-wide flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-4 cursor-pointer"
            >
              {loading ? "Recording in Complaints DB..." : "Submit Verification Audit"}
            </button>
          </form>
        </div>

        {/* Informative column containing Live Scam Amount Monitor */}
        <div className="space-y-6">
          
          {/* LIVE SCAM AMOUNT MONITOR (REAL DATA ONLY) */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Landmark className="w-4 h-4 text-emerald-600" />
              Live Scam Amount Monitor
            </h3>
            
            <div className="space-y-4 font-sans text-slate-800">
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold block">
                  💰 Total Money Lost:
                </span>
                <span id="live-total-loss" className="text-2xl font-black text-red-600 block mt-1">
                  ₹ {(dbStats.totalLoss).toLocaleString()}
                </span>
              </div>
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                  📊 Total Reports Added:
                </span>
                <span id="live-total-reports" className="text-2xl font-black text-slate-800 block mt-1">
                  {dbStats.totalReports}
                </span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-400 leading-tight">
              Synced directly with internal complaints database tables. Values recalculated on every new citizen report.
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1">
              <Info className="w-4 h-4 text-blue-500" /> Active Registry Rules
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every filed telemarketing scam report enters citizens directory clusters immediately. All active dashboards across standard operators will flag phone indices having count benchmarks greater than 2 reports.
            </p>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100/60 text-[11px] text-blue-800 space-y-1.5 leading-relaxed">
              <div>• <b>No Spoofs</b>: Do not post local test numbers unless they made actual unauthorized calls.</div>
              <div>• <b>Logs Verified</b>: Entries containing suspicious links are analyzed for malware tactics.</div>
            </div>
          </div>

          <div className="bg-slate-150 rounded-2xl p-5 space-y-2">
            <h4 className="text-[10.5px] uppercase font-mono tracking-wider text-slate-500 font-bold">Confidentiality Assured</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Internal logs use encrypted user-identities in local file adapters to maintain reporter digital privacy.
            </p>
          </div>
        </div>
        
      </div>

    </div>
  );
}
