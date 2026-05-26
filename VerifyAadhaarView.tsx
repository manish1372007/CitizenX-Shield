import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import { ShieldCheck, FileText, Upload, AlertCircle, RefreshCw, FileImage, ShieldAlert, Sparkles, BookOpen, Globe, Check, AlertTriangle } from "lucide-react";

interface VerifyAadhaarViewProps {
  user: { _id: string; name: string; email: string };
  onVerificationComplete?: () => void;
}

export default function VerifyAadhaarView({ user, onVerificationComplete }: VerifyAadhaarViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"document" | "website">("document");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteResult, setWebsiteResult] = useState<any>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  const [ocrText, setOcrText] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [metaInfo, setMetaInfo] = useState<{ size: number; name: string; hasExif: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectTypos = (domain: string): { isTypo: boolean; target: string } => {
    const cleanDomain = domain.toLowerCase();

    // Lookalike patterns for digilocker
    if (
      cleanDomain.includes("digil0cker") ||
      cleanDomain.includes("digiloker") ||
      cleanDomain.includes("digi1ocker") ||
      cleanDomain.includes("degelocker")
    ) {
      return { isTypo: true, target: "digilocker.gov.in" };
    }

    // Lookalike patterns for aadhaar
    if (
      cleanDomain.includes("aadhaaar") ||
      cleanDomain.includes("adhaaar") ||
      cleanDomain.includes("aadhar") ||
      cleanDomain.includes("adhaar") ||
      cleanDomain.includes("aadaar") ||
      cleanDomain.includes("aadahar")
    ) {
      return { isTypo: true, target: "uidai.gov.in" };
    }

    // Lookalike patterns for uidai
    if (
      cleanDomain.includes("uida1") ||
      cleanDomain.includes("uiday") ||
      cleanDomain.includes("uldai") ||
      cleanDomain.includes("ui-dai")
    ) {
      return { isTypo: true, target: "uidai.gov.in" };
    }

    // Lookalike patterns for incometax
    if (
      cleanDomain.includes("incometex") ||
      cleanDomain.includes("income-tax") ||
      cleanDomain.includes("inkometax")
    ) {
      return { isTypo: true, target: "incometax.gov.in" };
    }

    // Also check if domain contains one of the Whitelist names but has a non-gov extension
    const brandKeywords = ["digilocker", "uidai", "myaadhaar", "incometax"];
    for (const brand of brandKeywords) {
      if (cleanDomain.includes(brand)) {
        if (!cleanDomain.endsWith(".gov.in")) {
          return { isTypo: true, target: `${brand}.gov.in` };
        }
      }
    }

    return { isTypo: false, target: "" };
  };

  const verifyWebsite = (url: string) => {
    if (!url || url.trim().length === 0) return;

    let input = url.trim();
    
    // Check if it has protocol
    let hasProtocol = input.startsWith("https://") || input.startsWith("http://");
    const isHttps = input.startsWith("https://");
    const isHttp = input.startsWith("http://");

    // normalization
    let clean = input.toLowerCase();
    
    // Extract protocol
    if (clean.startsWith("https://")) {
      clean = clean.substring(8);
    } else if (clean.startsWith("http://")) {
      clean = clean.substring(7);
    }

    // Remove paths and query strings
    const slashIdx = clean.indexOf("/");
    if (slashIdx !== -1) {
      clean = clean.substring(0, slashIdx);
    }

    // Remove port numbers
    const colonIdx = clean.indexOf(":");
    if (colonIdx !== -1) {
      clean = clean.substring(0, colonIdx);
    }

    // Extract raw host domain
    let hostDomain = clean;
    if (hostDomain.startsWith("www.")) {
      hostDomain = hostDomain.substring(4);
    }

    const whitelist = ["myaadhaar.uidai.gov.in", "digilocker.gov.in", "uidai.gov.in", "incometax.gov.in"];
    
    const isExplicitHttp = isHttp;
    const isMissingHttps = hasProtocol && !isHttps;

    const typoCheck = detectTypos(hostDomain);

    let status: "SAFE" | "HIGH RISK" = "HIGH RISK";
    let confidence = "HIGH (100%)";
    let reason = "";
    let recommendation = "";

    // LAYER 1: EXACT WHITELIST MATCH
    if (whitelist.includes(hostDomain)) {
      if (isExplicitHttp || isMissingHttps) {
        status = "HIGH RISK";
        confidence = "HIGH (99%)";
        reason = `Official whitelisted platform ("${hostDomain}") accessed via insecure transmission channel (HTTP). Registered government services strictly mandate secure SSL tunnels.`;
        recommendation = "CRITICAL ADVISORY: Immediately leave this connection. Authentic state directories never prompt identity documents over insecure channels.";
      } else {
        status = "SAFE";
        confidence = "HIGH (100%)";
        reason = `Official government platform (whitelisted): "${hostDomain}" is a verified, authenticated national digital secure hub.`;
        recommendation = "This portal is fully whitelisted. It is completely safe to proceed with uploads, electronic signature authorization, and OTP submissions.";
      }
    }
    // LAYER 2: GOVERNMENT DOMAIN CHECK (.gov.in)
    else if (hostDomain.endsWith(".gov.in")) {
      // Check suspicious prefixes / misleading words
      const suspiciousWords = ["fake", "scam", "phish", "hack", "suspicious", "temp", "test-", "login-fast", "verify-now", "kyc-update", "urgent"];
      const containsSuspicious = suspiciousWords.some(word => hostDomain.includes(word));

      // Check if it ends exactly with .gov.in
      const parts = hostDomain.split(".");
      const isExactlyGovInSuffix = parts.length >= 3 && parts[parts.length - 2] === "gov" && parts[parts.length - 1] === "in";

      if (containsSuspicious || !isExactlyGovInSuffix) {
        status = "HIGH RISK";
        confidence = "HIGH (95%)";
        reason = `Misleading domain structure: Suffix ends with .gov.in but contains flagged suspicious keywords or malicious sub-address arrays: "${hostDomain}"`;
        recommendation = "CRITICAL ALERT: Never upload documents or authenticate OTPs. This portal displays severe malicious masking variables.";
      } else if (isExplicitHttp || isMissingHttps) {
        status = "HIGH RISK";
        confidence = "HIGH (99%)";
        reason = `Government portal (".gov.in") accessed via insecure transmission channel (HTTP). Government portals strictly require secure HTTPS connections.`;
        recommendation = "CRITICAL: IMMEDIATELY LEAVE THIS SITE. Standard portals never process identification files over insecure channels.";
      } else {
        status = "SAFE";
        confidence = "MEDIUM (85%)";
        reason = `Government domain detected: Verified ".gov.in" suffix root domain.`;
        recommendation = "This domain reflects an authorized state digital repository suffix. Proceed with normal standard caution.";
      }
    }
    // LAYER 3: PHISHING / FAKE DETECTION (HIGH RISK)
    else {
      const containsSuspiciousKey = ["kyc-update", "verify-now", "urgent", "login-fast", "update-kyc", "verify-aadhaar", "aadhaar-kyc", "digilocker-login", "paytm-kyc", "paytmkyc"].some(k => hostDomain.includes(k));

      status = "HIGH RISK";
      confidence = "HIGH (99%)";

      if (typoCheck.isTypo) {
        reason = `Adversarial Lookalike detected: Direct resemblance and deliberate typo matching target portal "${typoCheck.target}".`;
        recommendation = `CRITICAL WARNING: This is a highly dangerous phishing target designed to resemble "${typoCheck.target}". Refrain from entering any data.`;
      } else if (containsSuspiciousKey) {
        reason = `Unverified non-government domain contains urgent coercive keywords: "${hostDomain}". High probability of a malicious social engineering phishing trap.`;
        recommendation = "CRITICAL: Refrain from filing data. Alert security officers immediately. Do not run any transactions or sign OTP credentials.";
      } else {
        reason = `Unverified domain: "${hostDomain}". Suffix does not map to recognized government whitelist directories or TLDs. All non-government domains are flagged as high risk.`;
        recommendation = "CRITICAL WARNING: Under no circumstances should you upload your Aadhaar Card, PAN card, or input OTP/credentials. This website displays high phishing characteristics.";
      }
    }

    setWebsiteResult({
      inputUrl: url,
      normalizedDomain: hostDomain,
      status,
      confidence,
      reason,
      recommendation,
      isHttps: hasProtocol ? isHttps : false, // helper flags if they skipped it entirely or put plain HTTP
    });
  };

  // Checks JPEG raw array buffer byte signatures for the "Exif" marker block (0x45 0x78 0x69 0x66)
  const auditExifHeader = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const bytes = new Uint8Array(e.target?.result as ArrayBuffer);
        let found = false;
        const limit = Math.min(bytes.length, 60000);
        for (let i = 0; i < limit - 4; i++) {
          if (
            bytes[i] === 0x45 &&     // 'E'
            bytes[i + 1] === 0x78 && // 'x'
            bytes[i + 2] === 0x69 && // 'i'
            bytes[i + 3] === 0x66    // 'f'
          ) {
            found = true;
            break;
          }
        }
        resolve(found);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setOcrText(null);
    setAuditResult(null);
    setMetaInfo(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // Show dynamic upload preview
    setImagePreview(URL.createObjectURL(file));
    setLoading(true);
    setProgressMsg("Starting Neural OCR Worker Initialization...");
    setProgressPercent(10);

    try {
      // 1. Audit JPEG binary block triggers for EXIF metadata records
      const hasExif = await auditExifHeader(file);
      setMetaInfo({
        size: Math.round(file.size / 1024),
        name: file.name,
        hasExif,
      });

      // 2. Load Tesseract engine and analyze character pixels
      setProgressMsg("Engaging OCR engine core libraries...");
      setProgressPercent(25);

      const result = await Tesseract.recognize(
        file,
        "eng",
        {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setProgressMsg(`Matching Character Matrix Coordinates: ${Math.round(m.progress * 100)}%`);
              setProgressPercent(30 + Math.round(m.progress * 65));
            } else {
              setProgressMsg(`Status: ${m.status}...`);
            }
          }
        }
      );

      const text = result.data.text || "";
      setOcrText(text);
      setProgressMsg("Transmitting extracted blocks to validation system...");
      setProgressPercent(95);

      // 3. Complete processing on backend verification engines
      const response = await fetch("/api/verify/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          userName: user.name,
          fileName: file.name,
          ocrText: text,
          metadataMissing: !hasExif,
        }),
      });

      const auditData = await response.json();
      if (!response.ok) {
        throw new Error(auditData.error || "Aadhaar structure parsing timeout.");
      }

      setAuditResult(auditData);
      setProgressPercent(100);
      setProgressMsg("Verification Complete.");

      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to finalize OCR text extraction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/60 p-6 md:p-8 space-y-6 custom-scrollbar">
      
      {/* 1. HUD title header */}
      <div className="border-b border-slate-200/80 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">National ID & KYC Verification Gateway</h1>
          <p className="text-xs text-slate-500 mt-1">
            Perform high-precision local document scans and audit compliance directories to prevent social engineering phishing models.
          </p>
        </div>
      </div>

      {/* 2. SUB-TAB BAR */}
      <div className="flex border-b border-slate-200 gap-4 mb-2">
        <button
          onClick={() => setActiveSubTab("document")}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "document"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          id="tab-btn-document-verify"
        >
          <FileImage className="w-3.5 h-3.5" />
          <span>🆔 Aadhaar Document Auditor</span>
        </button>
        <button
          onClick={() => setActiveSubTab("website")}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "website"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          id="tab-btn-website-verify"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>🌐 KYC Website Safety Monitor</span>
        </button>
      </div>

      {activeSubTab === "document" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* Left Columns uploading and results */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main document uploader card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Input Verification Media</h2>
              
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 max-w-lg mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6 items-center">
                
                {/* Box frame upload selector */}
                <div 
                  onClick={() => !loading && fileInputRef.current?.click()}
                  className={`w-full md:w-72 h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all ${
                    loading
                      ? "border-blue-300 bg-blue-50/40 cursor-wait"
                      : "border-slate-300 bg-slate-50 hover:bg-slate-100/50 cursor-pointer"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={loading}
                  />

                  {imagePreview ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-black/5">
                      <img 
                        src={imagePreview} 
                        alt="Identity Proof preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-semibold bg-black/60 px-2 py-1 rounded">Swap Image file</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Select Identity Image Copy</p>
                        <p className="text-[10px] text-slate-400 mt-1">JPEG or PNG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status or description box */}
                <div className="flex-1 space-y-4 text-left">
                  {!loading && !auditResult && (
                    <div className="space-y-2 text-slate-600 text-xs leading-relaxed">
                      <p className="font-semibold text-slate-800">Direct Local Neural Scan Engine:</p>
                      <p>When you select an image, CitizenX Shield spins a dedicated Tesseract client-side runtime to parse the characters text line items.</p>
                      <p>Simultaneously, we perform binary-level analysis to detect JPEG metadata. Any stripped or modified file signatures increase security suspicion scores immediately.</p>
                    </div>
                  )}

                  {loading && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                          <span>Parsing Image Elements...</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[10.5px] font-mono text-slate-500 animate-pulse">{progressMsg}</p>
                    </div>
                  )}

                  {auditResult && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Audit Complete Verification Output:</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`text-md font-bold px-3 py-1 rounded-lg border ${
                          auditResult.result === "Likely Genuine"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : auditResult.result === "Suspicious"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-rose-50 border-rose-200 text-rose-700"
                        }`}>
                          {auditResult.result}
                        </div>
                        <div className="text-sm text-slate-500">
                          With <b className="text-slate-700">{auditResult.confidence}</b> Confidence
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-2 font-mono">
                        Detected Aadhaar ID: <b className="text-slate-800">{auditResult.aadhaarNumber}</b>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Extracted content and issues lists if valid */}
            {auditResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Detected Text representation display */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <FileText className="w-3.5 h-3.5 text-blue-500" /> Extracted OCR Script
                  </span>
                  <div className="text-[11px] bg-slate-50 border border-slate-150 p-4 rounded-xl font-mono leading-relaxed h-52 overflow-y-auto select-text whitespace-pre-wrap text-slate-600 custom-scrollbar">
                    {ocrText || "Zero characters matching verified coordinates."}
                  </div>
                </div>

                {/* Warnings and Issue signals card checklist info */}
                <div id="verify-audit-report" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Validation Penalties Breakdown
                  </span>
                  <div className="space-y-3 h-52 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* Score circle meter */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs block font-bold text-slate-800">Weighted Risk Points</span>
                        <span className="text-[10px] text-slate-400 font-mono">Higher points represent greater suspicion.</span>
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center text-sm font-extrabold text-blue-600 bg-white shadow-sm font-mono shrink-0">
                        {auditResult.score}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {auditResult.issuesFound.length === 0 ? (
                        <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs rounded-lg flex items-center gap-2 font-mono">
                          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>All core parameters verified perfectly.</span>
                        </div>
                      ) : (
                        auditResult.issuesFound.map((issue: string, idx: number) => (
                          <div 
                            key={idx} 
                            className="p-2 bg-slate-100 border border-slate-200/60 rounded-lg text-[10.5px] font-mono text-slate-600 flex items-start gap-2"
                          >
                            <span className="text-rose-500 shrink-0 select-none font-bold mt-0.5">•</span>
                            <span>{issue}</span>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Help reference sidebar columns info */}
          <div className="space-y-6">
            
            {/* Metadata info card */}
            {metaInfo && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5">JPEG Media File Metadata</h3>
                <div className="space-y-2 text-xs text-slate-600 font-mono">
                  <div className="flex justify-between border-b border-slate-50 pb-1">
                    <span className="text-slate-400">Target File:</span>
                    <span className="text-slate-800 truncate max-w-[140px]">{metaInfo.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-1">
                    <span className="text-slate-400">Byte Size:</span>
                    <span className="text-slate-800">{metaInfo.size} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">APP1 EXIF Block:</span>
                    <span className={`font-bold ${metaInfo.hasExif ? "text-emerald-600" : "text-amber-600"}`}>
                      {metaInfo.hasExif ? "EXIF PRESENT" : "ABSENT / STRIPPED"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" /> Scoring Weight Indices
              </h3>
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <p>Scores are calculated using mandatory criteria points:</p>
                
                <div className="space-y-2 font-mono text-[10.5px]">
                  <div className="flex justify-between items-center text-rose-700 bg-rose-50/50 p-1.5 rounded">
                    <span>Missing UIDAI / Aadhaar keyword:</span>
                    <b>+30 Points</b>
                  </div>
                  <div className="flex justify-between items-center text-rose-700 bg-rose-50/50 p-1.5 rounded">
                    <span>Invalid format spacing (XXXX XXXX XXXX):</span>
                    <b>+40 Points</b>
                  </div>
                  <div className="flex justify-between items-center text-rose-700 bg-rose-50/50 p-1.5 rounded">
                    <span>Abnormal text overlaps / layout:</span>
                    <b>+20 Points</b>
                  </div>
                  <div className="flex justify-between items-center text-rose-700 bg-rose-50/50 p-1.5 rounded">
                    <span>Missing camera/EXIF metadata:</span>
                    <b>+10 Points</b>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] leading-relaxed">
                  <div className="font-bold text-slate-700 mb-1">Final Risk Classification:</div>
                  <div className="grid grid-cols-3 gap-1.5 text-center font-semibold mt-1.5">
                    <div className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9.5px]">0-40 Genuine</div>
                    <div className="p-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9.5px]">40-70 Suspicious</div>
                    <div className="p-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[9.5px]">70+ Fake</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* KYC SAFETY WEBSITE DASHBOARD */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" id="kyc-safety-dashboard">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Direct Link Evaluation input card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Official Government Domain Verifier</h3>
                <p className="text-[11.5px] text-slate-500 mt-1">
                  Authenticate websites in real time using the 3-Layer inspection sequence. This safeguards credentials from lookalike phishing patterns or insecure connections.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Globe className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    id="kyc-url-input"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="Enter KYC Portal URL, e.g. https://myaadhaar.uidai.gov.in"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-250 focus:border-blue-500 rounded-xl text-xs outline-hidden transition-all font-mono"
                    onKeyDown={(e) => e.key === "Enter" && verifyWebsite(websiteUrl)}
                  />
                </div>
                
                <button
                  id="verify-domain-btn"
                  onClick={() => verifyWebsite(websiteUrl)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Verify Portal</span>
                </button>
              </div>

              {/* Sample test triggers helper segment */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] uppercase tracking-wider font-mono text-slate-450 font-bold block mb-2">Simulate Test Links:</span>
                <div className="flex flex-wrap gap-2 text-[10.5px]">
                  <button
                    onClick={() => { setWebsiteUrl("https://myaadhaar.uidai.gov.in"); verifyWebsite("https://myaadhaar.uidai.gov.in"); }}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-205 text-slate-700 font-mono transition-colors cursor-pointer border border-slate-150"
                  >
                    myaadhaar.uidai.gov.in (Official)
                  </button>
                  <button
                    onClick={() => { setWebsiteUrl("https://digilocker.gov.in"); verifyWebsite("https://digilocker.gov.in"); }}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-205 text-slate-700 font-mono transition-colors cursor-pointer border border-slate-150"
                  >
                    digilocker.gov.in (Official)
                  </button>
                  <button
                    onClick={() => { setWebsiteUrl("https://digil0cker.com"); verifyWebsite("https://digil0cker.com"); }}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-205 text-rose-700 font-mono transition-colors cursor-pointer border border-slate-150"
                  >
                    digil0cker.com (Lookalike)
                  </button>
                  <button
                    onClick={() => { setWebsiteUrl("https://uidai-verify.net"); verifyWebsite("https://uidai-verify.net"); }}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-205 text-rose-700 font-mono transition-colors cursor-pointer border border-slate-150"
                  >
                    uidai-verify.net (Fake Suffix)
                  </button>
                  <button
                    onClick={() => { setWebsiteUrl("http://myaadhaar.uidai.gov.in"); verifyWebsite("http://myaadhaar.uidai.gov.in"); }}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-205 text-rose-700 font-mono transition-colors cursor-pointer border border-slate-150"
                  >
                    http://myaadhaar (No SSL HTTP)
                  </button>
                  <button
                    onClick={() => { setWebsiteUrl("https://paytm-kyc-update-login.com"); verifyWebsite("https://paytm-kyc-update-login.com"); }}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-205 text-rose-700 font-mono transition-colors cursor-pointer border border-slate-150"
                  >
                    paytm-kyc-update (Social Engineered)
                  </button>
                </div>
              </div>
            </div>

            {/* Verification results display */}
            {websiteResult && (
              <div id="kyc-domain-result-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
                
                {/* Result header banner */}
                <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  websiteResult.status === "SAFE"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-250 text-rose-800"
                }`}>
                  <div className={`p-2 rounded-lg shrink-0 ${
                    websiteResult.status === "SAFE" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                  }`}>
                    {websiteResult.status === "SAFE" ? <ShieldCheck className="w-5 h-5 animate-bounce" /> : <ShieldAlert className="w-5 h-5 animate-pulse" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase">
                      Audit Classification: {websiteResult.status}
                    </h4>
                    <p className="text-[10.5px] mt-0.5 opacity-80 font-mono">
                      Security Confidence Quotient: <b className="font-extrabold">{websiteResult.confidence}</b>
                    </p>
                  </div>
                </div>

                {/* Extracted stats details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <span className="text-slate-400 font-mono text-[9px] block uppercase font-bold">Input Hostname String</span>
                    <span className="text-slate-800 font-mono font-bold mt-1 block truncate">
                      {websiteResult.normalizedDomain}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 font-mono text-[9px] block uppercase font-bold border-b border-transparent pb-0.5">SSL secure transit (HTTPS)</span>
                      <span className={`text-[10.5px] font-mono font-bold mt-1 block ${websiteResult.isHttps ? "text-emerald-600" : "text-rose-600"}`}>
                        {websiteResult.isHttps ? "Active (SSL Secured)" : "Insecure (No HTTPS Protocol)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Breakdown Reason */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-405 font-bold block">Audit Reason Description:</span>
                  <p className="text-xs text-slate-705 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed font-mono">
                    {websiteResult.reason}
                  </p>
                </div>

                {/* Important recommendation warnings */}
                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  websiteResult.status === "SAFE"
                    ? "bg-emerald-50/10 border-emerald-100 text-slate-700"
                    : "bg-rose-50/30 border-rose-200 text-rose-900 border-2 font-black shadow-md shadow-rose-100/30"
                }`}>
                  <span className="font-bold block mb-1">Actionable Advisory Guidelines:</span>
                  <p className="font-mono text-[11px] leading-relaxed">
                    {websiteResult.recommendation}
                  </p>
                </div>

              </div>
            )}

          </div>

          {/* Right Column: Whitelist rules explanation */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" /> verification Hierarchy
              </h3>
              
              <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <p>
                  To secure digital credentials, CitizenX Shield enforces strict multi-layered verifications on external KYC websites:
                </p>

                <div className="space-y-2.5">
                  <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-lg">
                    <span className="font-bold text-emerald-850 block text-[11px]">Level 1: Exact Whitelist Match</span>
                    <span className="text-[10.5px] text-slate-500 mt-0.5 block leading-normal">
                      Validates domain directly matching registered governmental databases like Digilocker or UIDAI. Returns high trust.
                    </span>
                  </div>

                  <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-lg">
                    <span className="font-bold text-blue-800 block text-[11px]">Level 2: National Suffix Check</span>
                    <span className="text-[10.5px] text-slate-500 mt-0.5 block leading-normal">
                      Checks that other domains strictly utilize the official `.gov.in` suffix without incorporating suspicious substrings.
                    </span>
                  </div>

                  <div className="p-2.5 bg-rose-50/40 border border-rose-100 rounded-lg">
                    <span className="font-bold text-rose-800 block text-[11px]">Level 3: Phishing / Lookalike Filter</span>
                    <span className="text-[10.5px] text-slate-500 mt-0.5 block leading-normal">
                      Blocks unauthorized non-govt TLDs, lookalike typo addresses (e.g., digil0cker, aadhaaar), and social-engineering keywords instantly.
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 shadow-sm space-y-2.5 font-mono text-[10.5px] border border-slate-800 leading-relaxed">
              <h4 className="font-bold text-white border-b border-slate-800 pb-1.5 uppercase tracking-wide">Standard Compliance Rule</h4>
              <p>
                Strict Policy Directive: Only verified government portals are trusted. Any non-government or unverified domain must be marked as high risk to secure credentials successfully.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
