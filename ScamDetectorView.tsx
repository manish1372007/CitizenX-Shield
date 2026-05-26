import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import { 
  Shield, 
  ShieldCheck,
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Sparkles, 
  Info, 
  ArrowRight, 
  RefreshCw, 
  X, 
  Copy, 
  Check, 
  Terminal,
  HelpCircle,
  FileText,
  MessageSquare,
  Globe,
  Upload,
  Image as ImageIcon
} from "lucide-react";

interface ScamDetectorViewProps {
  user: { _id: string; name: string; email: string };
}

interface AnalysisResponse {
  safetyScore: number;
  scamType: string;
  riskLevel: string;
  threatIndicators: string[];
  authenticityChecklist: { factor: string; value: string; passed: boolean }[];
  structuralBreaks: string[];
  technicalReasoning: string;
  safetyAdvisory: string;
  
  // Upgraded scam indicators
  status?: "SCAM" | "SUSPICIOUS" | "SAFE";
  confidence?: "HIGH" | "MEDIUM";
  risk_score?: number;
  detected_company?: string;
  company_status?: "VALID" | "UNKNOWN";
  reasons?: string[];
  extracted_text?: string;
}

export default function ScamDetectorView({ user }: ScamDetectorViewProps) {
  const [inputText, setInputText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // OCR states
  const [activeMode, setActiveMode] = useState<"text" | "screenshot">("text");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgressMsg, setOcrProgressMsg] = useState("");
  const [ocrProgressPercent, setOcrProgressPercent] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Specified practical scam parameters requested by user
  const presetExamples = [
    {
      id: 1,
      title: "Suspicious Bank Alert",
      badge: "Phishing SMS",
      icon: MessageSquare,
      text: "Dear Customer, your HDFC account XXXX is blocked due to KYC parameters. Update your secure PAN card immediately to avoid cancellation. Click here link to verify: http://hdfc-netbanking-verify.co",
      category: "Suspicious Bank Message"
    },
    {
      id: 2,
      title: "Predatory Instant Loan",
      badge: "Debt Trap Promo",
      icon: FileText,
      text: "CONGRATULATIONS! You are pre-approved for an Instant Loan of Rs 5,0,000 at 0% interest with zero processing fees. Click here to disburse directly to your wallet within 5 minutes: http://fastcash-prize.loans.in",
      category: "Instant Loan Prize Promo"
    },
    {
      id: 3,
      title: "Urgent UPI/KYC Threat",
      badge: "Vishing / Coercion",
      icon: ShieldAlert,
      text: "URGENT NOTICE: Your UPI transaction capability on PhonePe/Paytm is locked today. Contact bank executive Rohit Sharma at 9988776655 instantly to verify or download AnyDesk app for visual verification support.",
      category: "Urgent UPI / KYC Block"
    },
    {
      id: 4,
      title: "Crypto Guarantee Hype",
      badge: "Ponzi Scheme",
      icon: Globe,
      text: "Earn Rs 50,050 daily starting with just Rs 1000! Join VIP Secret Crypto Signalling WhatsApp group. Guaranteed 10x ROI within 2 hours. Register your slot now: http://cryptopowervip.xyz",
      category: "Crypto Investment Profit"
    }
  ];

  const handleApplyPreset = (text: string) => {
    setInputText(text);
    setResult(null);
    setError(null);
    setActiveMode("text");
  };

  const processImageForOCR = async (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setOcrLoading(true);
    setOcrProgressMsg("Engaging Tesseract character matrix engine...");
    setOcrProgressPercent(15);
    setError(null);

    try {
      const result = await Tesseract.recognize(
        file,
        "eng",
        {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setOcrProgressMsg(`Matching text boundaries: ${Math.round(m.progress * 100)}%`);
              setOcrProgressPercent(20 + Math.round(m.progress * 75));
            } else {
              setOcrProgressMsg(`Initializing OCR variables: ${m.status}`);
            }
          }
        }
      );

      const text = result?.data?.text || "";
      const cleaned = text.trim();
      
      if (!cleaned) {
        throw new Error("No legible character patterns were extracted from this screenshot copy. Kindly try a high contrast or clear draft screenshot.");
      }

      setInputText(cleaned);
      setOcrProgressPercent(100);
      setOcrProgressMsg("Character extraction matrix matched successfully!");
      
      setTimeout(() => {
        setOcrLoading(false);
      }, 500);

    } catch (err: any) {
      setError(err?.message || "Screenshot Character Scanning failed.");
      setOcrLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageForOCR(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await processImageForOCR(file);
    } else {
      setError("Please drop a valid screenshot image file (PNG/JPEG).");
    }
  };

  const handleScan = async () => {
    if (!inputText.trim()) {
      setError("Please paste or type suspicious text, copy/paste an email, or upload a screenshot.");
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanProgress(5);

    // Dynamic visual scanning countdown simulated intervals
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 120);

    try {
      const response = await fetch("/api/scam/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error("Target analysis endpoint failed to respond.");
      }

      const data = await response.json();
      
      // Complete countdown
      setScanProgress(100);
      setTimeout(() => {
        setResult(data);
        setIsScanning(false);
        clearInterval(progressInterval);
      }, 300);

    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err?.message || "Failed to analyze link/text. Please try again.");
      setIsScanning(false);
    }
  };

  const handleClear = () => {
    setInputText("");
    setImageFile(null);
    setImagePreview(null);
    setOcrProgressMsg("");
    setOcrProgressPercent(0);
    setResult(null);
    setError(null);
  };

  return (
    <div id="scam-detector-pane" className="flex-1 overflow-y-auto bg-slate-50/60 p-6 md:p-8 space-y-8 custom-scrollbar">
      
      {/* Title block */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/10">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Scam & Phishing Forensic Scanner</h1>
            <p className="text-xs text-slate-500 mt-1">
              Analyze unsolicited text messages, suspicious instant loans, fraudulent bank alerts, UPI blocks, or crypto investments with forensic precision.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 cols) stack */}
        <div className="col-span-1 lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            
            {/* Active Mode Selectors Tab Option */}
            <div className="flex border-b border-slate-100 pb-3 gap-6">
              <button
                type="button"
                onClick={() => setActiveMode("text")}
                className={`text-xs font-black tracking-wider uppercase pb-2 border-b-2 transition-all cursor-pointer bg-transparent border-0 ${
                  activeMode === "text" 
                    ? "border-indigo-600 text-indigo-600 font-extrabold" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Copy-Paste Direct Text
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("screenshot")}
                className={`text-xs font-black tracking-wider uppercase pb-2 border-b-2 transition-all cursor-pointer bg-transparent border-0 ${
                  activeMode === "screenshot" 
                    ? "border-indigo-600 text-indigo-600 font-extrabold" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Upload Screenshot (OCR Scan)
              </button>
            </div>

            {activeMode === "screenshot" ? (
              <div className="space-y-4">
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl h-44 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                    isDragOver 
                      ? "border-indigo-600 bg-indigo-50/50" 
                      : imagePreview 
                      ? "border-slate-300 bg-slate-50/40" 
                      : "border-slate-300 bg-slate-50 hover:bg-slate-100/50"
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />

                  {imagePreview ? (
                    <div className="relative w-full h-full rounded-md overflow-hidden flex items-center justify-center bg-slate-100">
                      <img src={imagePreview} alt="Screenshot input preview" className="max-h-full max-w-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold bg-slate-900/85 px-2.5 py-1 rounded">Replace Screenshot File</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Drag or click to upload scam screenshot</p>
                        <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, or JPEG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {ocrLoading && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>{ocrProgressMsg}</span>
                      </span>
                      <span className="text-indigo-600 font-bold">{ocrProgressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${ocrProgressPercent}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <label htmlFor="scam-input-field" className="text-xs font-bold tracking-wide text-slate-700 uppercase flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-500" />
                <span>Text Analysis Workspace {imageFile && "(OCR Extracted Content)"}</span>
              </label>
              {inputText && (
                <button 
                  onClick={handleClear} 
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer transition-all border-0 bg-transparent"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Content</span>
                </button>
              )}
            </div>

            {/* Main Textarea */}
            <div className="relative">
              <textarea
                id="scam-input-field"
                className="w-full h-44 rounded-xl border border-slate-300 bg-slate-50/50 p-4 text-sm font-sans text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none custom-scrollbar"
                placeholder="Paste suspicious SMS messages, phishing email bodies, fake credit cards alerts, UPI blocks, pre-approved loan promos, or suspicious web addresses here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isScanning}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span>{inputText.length} chars</span>
              </div>
            </div>

            {/* Scanner triggers */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="scam-trigger-btn"
                onClick={handleScan}
                disabled={isScanning || !inputText.trim()}
                className={`flex-1 h-11 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer border-0 ${
                  isScanning 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : !inputText.trim()
                    ? "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10 hover:shadow-indigo-600/20"
                }`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                    <span>Analyzing Indicators ({scanProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Fraud Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Dynamic Scanning Simulation Loading overlay */}
          {isScanning && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 bg-blue-500/5 bg-[radial-gradient(#1e1e38_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-blue-400 font-bold uppercase">AI HEURISTIC ENGINE ENGAGED</span>
                  <span className="text-[10px] font-mono text-blue-400">{scanProgress}% SECURE</span>
                </div>
                
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>

                <div className="space-y-2 font-mono text-[10.5px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">▶</span>
                    <span className="animate-pulse">Loading linguistic pattern vectors...</span>
                  </div>
                  {scanProgress > 30 && (
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">▶</span>
                      <span>Extracting coercive social hooks...</span>
                    </div>
                  )}
                  {scanProgress > 60 && (
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">▶</span>
                      <span>Checking target domain registrar signatures...</span>
                    </div>
                  )}
                  {scanProgress > 85 && (
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">▶</span>
                      <span>Finalizing classification parameters...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Examples Directory block requested by user */}
          <div className="space-y-4">
            <div className="flex items-center gap-1 px-1">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Verified Forensic Simulation Templates</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {presetExamples.map((ex) => {
                const ExIcon = ex.icon;
                return (
                  <div 
                    key={ex.id}
                    onClick={() => handleApplyPreset(ex.text)}
                    className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-all">
                          <ExIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-extrabold text-slate-800">{ex.title}</span>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {ex.badge}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 line-clamp-2 italic leading-relaxed bg-slate-50/50 p-2 rounded-lg border border-slate-100 group-hover:bg-slate-50 transition-all">
                      "{ex.text}"
                    </p>
                    <div className="flex items-center justify-between text-[10.5px] text-indigo-600 font-semibold pt-1">
                      <span>Load Preset</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div> {/* Left Column End */}

        {/* Right Column (5 cols) stack */}
        <div className="col-span-1 lg:col-span-5">
          {result ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0.5">
              
              {/* Header Header Status Banner */}
              <div className={`p-6 border-b border-slate-200 flex flex-col items-center justify-center text-center space-y-3 relative ${
                result.safetyScore >= 75 
                  ? "bg-gradient-to-b from-emerald-50/70 to-white" 
                  : result.safetyScore >= 50 
                  ? "bg-gradient-to-b from-amber-50/70 to-white" 
                  : "bg-gradient-to-b from-rose-50/90 to-white"
              }`}>
                
                {/* Score Indicator visual feedback circle */}
                <div className="relative flex items-center justify-center font-mono">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#e2e8f0"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke={result.safetyScore >= 75 ? "#10b981" : result.safetyScore >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - result.safetyScore / 100)}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-800 tracking-tight leading-none">{result.safetyScore}</span>
                    <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold font-mono">Safety</span>
                  </div>
                </div>

                <div>
                  <span className={`text-[10px] font-mono tracking-widest uppercase font-black px-2.5 py-1 rounded-full ${
                    result.riskLevel === "Low Risk" 
                      ? "bg-emerald-100 text-emerald-800"
                      : result.riskLevel === "Medium Risk"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}>
                    {result.riskLevel} Flagged
                  </span>
                  <h2 className="text-sm font-extrabold text-slate-800 mt-1.5">{result.scamType}</h2>
                </div>

                <div className="w-full max-w-sm mt-3">
                  {(result.status || (result.safetyScore < 50 ? "SCAM" : result.safetyScore < 75 ? "SUSPICIOUS" : "SAFE")) === "SCAM" ? (
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center text-rose-800 shadow-sm">
                      <p className="text-xs font-black tracking-wide uppercase flex items-center justify-center gap-1 text-rose-700">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        ⚠️ Scam Detected / Do NOT respond or share any details.
                      </p>
                      <p className="text-[11px] font-bold text-rose-950 mt-1 leading-normal">
                        This message attempts fraud. Strictly avoid wire transfers, key entries, or OTP shares.
                      </p>
                    </div>
                  ) : (result.status || (result.safetyScore < 50 ? "SCAM" : result.safetyScore < 75 ? "SUSPICIOUS" : "SAFE")) === "SUSPICIOUS" ? (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center text-amber-800 shadow-sm">
                      <p className="text-xs font-black tracking-wide uppercase flex items-center justify-center gap-1 text-amber-700">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        ⚠️ This message may be risky. Verify before proceeding.
                      </p>
                      <p className="text-[11px] font-bold text-amber-950 mt-1 leading-normal">
                        High potential social engineering signs detected. Cross-verify identity parameters.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center text-emerald-800 shadow-sm">
                      <div className="text-xs font-black tracking-wide uppercase flex items-center justify-center gap-1 text-emerald-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        No scam patterns detected.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Cards layout */}
              <div className="p-6 space-y-6">

                {/* Known Brand validation header indicator */}
                {result.detected_company && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center text-indigo-700 font-mono text-[9px] font-black">
                        {result.detected_company.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase leading-none">Extracted Trademark Entity</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">{result.detected_company}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[9px] font-mono tracking-widest uppercase font-black px-2 py-0.5 rounded-full ${
                        result.company_status === "VALID"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {result.company_status} BRAND
                      </span>
                    </div>
                  </div>
                )}

                {/* Scam Pattern Classifications */}
                {result.reasons && result.reasons.length > 0 && result.reasons[0] !== "None detected" && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold block">
                      Forensic Classifications
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.reasons.map((reason, rIdx) => (
                        <span key={rIdx} className="text-[9px] font-black font-mono tracking-wide px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          <span>{reason.toUpperCase()}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Heuristics Authentication Checklist Factors */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold block">
                    Authenticity Verifiers Checklist
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.authenticityChecklist.map((ch, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-xl border flex flex-col justify-between space-y-1.5 transition-all ${
                          ch.passed 
                            ? "bg-emerald-50/30 border-emerald-100" 
                            : "bg-rose-50/10 border-rose-100"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-extrabold text-slate-800 truncate">{ch.factor}</span>
                          {ch.passed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10.5px] leading-relaxed text-slate-500 break-words">
                          {ch.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Threat Indicators block */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold block">
                    Extracted Security Threat Warnings
                  </span>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    {result.threatIndicators.map((th, index) => (
                      <div key={index} className="flex items-start gap-2.5 text-[11.5px] leading-relaxed text-slate-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{th}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logical breaks block */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold block">
                    Structural & Regulatory Mismatches
                  </span>
                  <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-4 space-y-2">
                    {result.structuralBreaks.map((sb, index) => (
                      <div key={index} className="flex items-start gap-2.5 text-[11.5px] leading-relaxed text-slate-700">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{sb}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Analysis Technical Breakdown */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold block">
                    Scientific Forensics Assessment
                  </span>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative text-white">
                    <div className="absolute top-2.5 right-3 text-[8px] font-mono select-none text-slate-500 uppercase tracking-widest">
                      AI COGNITION SYSTEM
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-line select-text">
                      {result.technicalReasoning}
                    </p>
                  </div>
                </div>

                {/* Protective Action Advisory */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold block">
                    Actionable Shield Advisory
                  </span>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-indigo-900">
                    <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-extrabold block uppercase tracking-wide">Shield Protocol Advisory</span>
                      <p className="text-[11.5px] leading-relaxed text-indigo-800">
                        {result.safetyAdvisory}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="h-full border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-white/40">
              <svg 
                className="w-14 h-14 text-indigo-200 shrink-0 mb-3 animate-pulse" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800">Forced Security Assessment Telemetry</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                Verify if a link, transactional SMS, UPI block, or crypto opportunity behaves securely before proceeding. Paste your content block or test our templates.
              </p>
            </div>
          )}
        </div>

      </div> {/* Grid End */}

    </div>
  );
}
