import React, { useState, useEffect } from "react";
import { Shield, LayoutDashboard, FileSpreadsheet, CheckSquare, AlertOctagon, UserCheck, LogOut, Lock, KeyRound, Radio, Activity, Clock, ShieldCheck, Mic, Network } from "lucide-react";
import AuthView from "./components/AuthView";
import DashboardView from "./components/DashboardView";
import ReportFraudView from "./components/ReportFraudView";
import VerifyAadhaarView from "./components/VerifyAadhaarView";
import AIDetectionDashboardView from "./components/AIDetectionDashboardView";
import AlertsView from "./components/AlertsView";
import VerificationHistoryView from "./components/VerificationHistoryView";
import ScamDetectorView from "./components/ScamDetectorView";
import SiaChatBubble from "./components/SiaChatBubble";
import SiaVoiceAssistant from "./components/SiaVoiceAssistant";
import SiaIntelligenceDashboardView from "./components/SiaIntelligenceDashboardView";
// Empty line - VoiceVerificationView removed

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ _id: string; name: string; email: string; mobile_number: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"Dashboard" | "Report" | "Verify" | "Scam" | "Deepfake" | "Alerts" | "History" | "Profile" | "Intelligence">("Dashboard");
  const [sessionToken, setSessionToken] = useState<string>("");
  const [showLogoIntro, setShowLogoIntro] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogoIntro(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 1. Check for cached operator session items in localStorage
    const cached = localStorage.getItem("citizenx_auth_session");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.email && parsed.name) {
          setCurrentUser(parsed);
          setSessionToken(`token_${parsed._id.split("_")[1] || "session"}`);
        }
      } catch (err) {
        console.error("Failed to restore cached citizen session.", err);
      }
    }
  }, []);

  const handleAuthSuccess = (user: { _id: string; name: string; email: string; mobile_number: string }) => {
    setCurrentUser(user);
    setSessionToken(`token_${user._id.split("_")[1] || "session"}`);
    localStorage.setItem("citizenx_auth_session", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSessionToken("");
    localStorage.removeItem("citizenx_auth_session");
  };

  // Switch tabs safely
  const navigateTab = (target: string) => {
    if (target === "Report") {
      setActiveTab("Report");
    } else if (target === "Verify") {
      setActiveTab("Verify");
    } else if (target === "Scam") {
      setActiveTab("Scam");
    } else if (target === "Alerts") {
      setActiveTab("Alerts");
    } else if (target === "History") {
      setActiveTab("History");
    } else if (target === "Intelligence") {
      setActiveTab("Intelligence");
    } else {
      setActiveTab("Dashboard");
    }
  };

  // 3D Animated Logo Intro Splash Screen (requested by user, pops for 3 seconds)
  if (showLogoIntro) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans z-50">
        <div className="absolute inset-0 bg-[radial-gradient(#1e1e38_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-40"></div>
        
        <div style={{ perspective: "1000px" }} className="relative flex flex-col items-center justify-center space-y-9 max-w-sm px-6">
          
          <div className="absolute w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-pulse"></div>
          
          <div 
            className="w-32 h-32 relative transform-gpu select-none flex items-center justify-center"
            style={{
              animation: "floatSpin 5s ease-in-out infinite",
              transformStyle: "preserve-3d"
            }}
          >
            {/* 3D shadows and visual depth thickness overlays */}
            <div className="absolute inset-0 bg-blue-900 rounded-3xl opacity-60 filter blur-sm transform scale-[0.98]" style={{ transform: "translateZ(-10px)" }}></div>

            {/* Middle core depth highlight layer */}
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-400 rounded-3xl flex items-center justify-center text-white"
              style={{
                transform: "translateZ(-5px)",
                boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.4)"
              }}
            ></div>

            {/* Primary outer shiny face with custom bevel borders */}
            <div 
              className="absolute inset-0 bg-slate-900/90 border-2 border-blue-500 rounded-3xl flex items-center justify-center text-white backdrop-blur-md"
              style={{
                transform: "translateZ(10px)",
                boxShadow: "inset 0 1px 1.5px rgba(255,255,255,0.35), 0 12px 30px rgba(0,0,0,0.6)"
              }}
            >
              <Shield className="w-16 h-16 text-blue-500 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-bounce" />
            </div>

            {/* Small active quantum secure trackers */}
            <div className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping top-1 right-1" style={{ transform: "translateZ(15px)" }}></div>
            <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full top-1 right-1" style={{ transform: "translateZ(15px)" }}></div>
          </div>

          <div className="text-center space-y-2 relative">
            <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400 uppercase">
              CitizenX Shield
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-blue-400 font-bold">
              Autonomous Cyber Defense Portal
            </p>
          </div>

          <div className="w-64 space-y-3 font-mono">
            <div className="w-full bg-slate-900 border border-slate-800 h-1.5 rounded-full overflow-hidden p-[1px]">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full animate-[loadingProgress_3s_linear_infinite]" style={{ width: "100%" }}></div>
            </div>
            
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider animate-pulse">
                Booting secure linked workspace...
              </span>
            </div>
          </div>

        </div>

        <style>{`
          @keyframes floatSpin {
            0% { transform: rotateY(0deg) translateY(0px) rotateX(10deg); }
            50% { transform: rotateY(180deg) translateY(-8px) rotateX(-5deg); }
            100% { transform: rotateY(360deg) translateY(0px) rotateX(10deg); }
          }
          @keyframes loadingProgress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // Loading router state
  if (!currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans antialiased text-slate-800">
      
      {/* 1. TOP NAVBAR (As specified by User Rubric 9) */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm shadow-slate-100">
        
        {/* LOGO */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/15">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span id="logo-branding" className="font-extrabold text-md tracking-tight text-slate-900 block leading-tight">
              CitizenX Shield
            </span>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
              Cyber Verification Node
            </span>
          </div>
        </div>

        {/* MENU TABS */}
        <nav className="flex items-center gap-1 sm:gap-2">
          
          <button
            id="tab-btn-dashboard"
            onClick={() => setActiveTab("Dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "Dashboard"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            id="tab-btn-report"
            onClick={() => setActiveTab("Report")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "Report"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>

          <button
            id="tab-btn-verify"
            onClick={() => setActiveTab("Verify")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "Verify"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Verify</span>
          </button>

          <button
            id="tab-btn-scam"
            onClick={() => setActiveTab("Scam")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "Scam"
                ? "bg-blue-600 text-white shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Scam Detector</span>
          </button>

          <button
            id="tab-btn-history"
            onClick={() => setActiveTab("History")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "History"
                ? "bg-blue-600 text-white shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Scan History</span>
          </button>

          <button
            id="tab-btn-deepfake"
            onClick={() => setActiveTab("Deepfake")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "Deepfake"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>AI Detection Dashboard</span>
          </button>

          <button
            id="tab-btn-alerts"
            onClick={() => setActiveTab("Alerts")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "Alerts"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Alerts</span>
          </button>

          <button
            id="tab-btn-intelligence"
            onClick={() => setActiveTab("Intelligence")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "Intelligence"
                ? "bg-blue-600 text-white shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>SIA Intelligence</span>
          </button>

          <button
            id="tab-btn-profile"
            onClick={() => setActiveTab("Profile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "Profile"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

        </nav>

        {/* ACTIVE OPERATOR BADGE */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-100 rounded-full px-3.5 py-1.5 border border-slate-200">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10.5px] font-mono font-bold text-slate-600">
            SECURE LINKED: {currentUser.name.toUpperCase().split(" ")[0]}
          </span>
        </div>

      </header>

      {/* 2. TAB TRANSITION RENDER CHASSIS */}
      <main className="flex-1 flex flex-col min-h-0 bg-slate-50/40">
        
        {activeTab === "Dashboard" && (
          <DashboardView user={currentUser} onNavigate={navigateTab} />
        )}

        {activeTab === "Report" && (
          <ReportFraudView user={currentUser} />
        )}

        {activeTab === "Verify" && (
          <VerifyAadhaarView user={currentUser} />
        )}

        {activeTab === "Scam" && (
          <ScamDetectorView user={currentUser} />
        )}

        {activeTab === "Deepfake" && (
          <AIDetectionDashboardView user={currentUser} />
        )}

        {activeTab === "Alerts" && (
          <AlertsView user={currentUser} />
        )}

        {activeTab === "History" && (
          <VerificationHistoryView />
        )}

        {activeTab === "Intelligence" && (
          <SiaIntelligenceDashboardView user={currentUser} />
        )}

        {/* Operator Profile Tab Page */}
        {activeTab === "Profile" && (
          <div id="profile-tab-pane" className="flex-1 overflow-y-auto bg-slate-50/60 p-6 md:p-8 space-y-6 custom-scrollbar">
            
            <div className="border-b border-slate-200/80 pb-6">
              <h1 className="text-2xl font-bold text-slate-900">Active Operator Signature Profile</h1>
              <p className="text-xs text-slate-500 mt-1">
                Your linked digital token parameters, session hashes, and regulatory parameters.
              </p>
            </div>

            <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xl flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-md font-bold text-slate-900">{currentUser.name}</h3>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-3">
                <h4 className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Cryptographic Session Hashes</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-600">
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                    <span className="text-slate-400 text-[10px] block">Security ID Block</span>
                    <span className="text-slate-800 font-semibold">{currentUser._id}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                    <span className="text-slate-400 text-[10px] block">Operator Token Key</span>
                    <span className="text-slate-800 font-semibold truncate block">{sessionToken}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                <div>
                  <span className="text-xs block font-bold text-slate-800">Clear Session Parameters</span>
                  <span className="text-[10px] text-slate-400 block font-sans">Signs you out of this local tracking node immediately.</span>
                </div>
                
                <button
                  id="signout-session-btn"
                  onClick={handleLogout}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-sm tracking-wide flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Seal Port & Logout</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      <SiaChatBubble user={currentUser} />
      <SiaVoiceAssistant user={currentUser} />

      {/* 3. ACCESSIBILITY STATUS FOOTER */}
      <footer className="h-10 border-t border-slate-200 bg-white px-6 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div>CitizenX Shield Operational Dashboard Hub. Built end-to-end.</div>
        <div className="flex gap-4">
          <span>SECURED TRANSITS (HTTPS/SSL)</span>
          <span className="text-emerald-600 font-bold">ONLINE</span>
        </div>
      </footer>

    </div>
  );
}
