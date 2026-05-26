import React, { useState, useRef } from "react";
import { Upload, HelpCircle, Eye, AlertCircle, Play, ShieldAlert, Sparkles, Check, ChevronRight, RefreshCw } from "lucide-react";

interface DeepfakeDetectorViewProps {
  user: { _id: string; name: string; email: string };
  onScanComplete?: () => void;
}

export default function DeepfakeDetectorView({ user, onScanComplete }: DeepfakeDetectorViewProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanSteps, setScanSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState("");
  
  const [scanResult, setScanResult] = useState<any>(null);
  const [visualMetrics, setVisualMetrics] = useState<{
    smoothnessPercent: number;
    repetitionPercent: number;
    edgeJaggedness: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Performs JPEG file binary header search to ensure metadata exists
  const checkExifHeader = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arr = new Uint8Array(e.target?.result as ArrayBuffer);
        let found = false;
        const scanRange = Math.min(arr.length, 60000);
        for (let i = 0; i < scanRange - 4; i++) {
          if (arr[i] === 0x45 && arr[i+1] === 0x78 && arr[i+2] === 0x69 && arr[i+3] === 0x66) {
            found = true;
            break;
          }
        }
        resolve(found);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const executeImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setScanResult(null);
    setVisualMetrics(null);
    setScanSteps([]);

    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setLoading(true);

    const logStep = (msg: string) => {
      setCurrentStep(msg);
      setScanSteps((prev) => [...prev, msg]);
    };

    try {
      logStep("Engaging CitizenX Forensic Vision Engine...");
      await new Promise((r) => setTimeout(r, 400));

      // 1. Audit byte headers for EXIF metadata blocks
      logStep("Parsing byte coordinates to verify digital camera signatures...");
      const hasExif = await checkExifHeader(file);
      await new Promise((r) => setTimeout(r, 450));

      const metadataMissing = !hasExif;
      if (metadataMissing) {
        logStep("⚠️ Metadata Anomaly: Missing EXIF device headers (Standard AI output signature).");
      } else {
        logStep("Info: Photographic EXIF metadata block found.");
      }

      // 2. Load onto hidden canvas and extract RGBA channels
      logStep("Mapping visual pixels into standard 2D Cartesian matrix...");
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error("Failed to compile image raster."));
        img.src = URL.createObjectURL(file);
      });

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas context is missing.");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not draw 2D matrix.");

      // Scale drawing boundaries
      const maxDim = 300;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);
      const pixels = imgData.data;

      // ---- Forensics 1: Facial Artifacts (Skin Smoothness & Soft Edges) ----
      logStep("Examining local adjacent pixel matrix for over-smooth texture gradients...");
      await new Promise((r) => setTimeout(r, 400));
      
      let smoothCount = 0;
      let totalComparisons = 0;
      for (let y = 1; y < h - 1; y += 4) {
        for (let x = 1; x < w - 1; x += 4) {
          const idx = (y * w + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          
          const rx = (y * w + (x + 1)) * 4;
          const diff = Math.abs(r - pixels[rx]) + Math.abs(g - pixels[rx + 1]) + Math.abs(b - pixels[rx + 2]);
          totalComparisons++;
          if (diff < 8) {
            smoothCount++;
          }
        }
      }
      const smoothnessRatio = smoothCount / (totalComparisons || 1);
      const faceArtifact = smoothnessRatio > 0.58; 
      const smoothnessPercent = Math.round(smoothnessRatio * 100);

      // ---- Forensics 2: Symmetry check (Horizontal facial mirror analysis) ----
      logStep("Scanning symmetry alignment (AI models exhibit eerie geometric mirroring)...");
      await new Promise((r) => setTimeout(r, 400));

      const startX = Math.floor(w * 0.2);
      const endX = Math.floor(w * 0.8);
      const startY = Math.floor(h * 0.2);
      const endY = Math.floor(h * 0.8);
      let symDiff = 0;
      let symCount = 0;

      for (let y = startY; y < endY; y += 4) {
        for (let x = startX; x < (startX + endX) / 2; x += 4) {
          const mirrorX = startX + endX - x;
          const idx1 = (y * w + x) * 4;
          const idx2 = (y * w + mirrorX) * 4;
          
          const dR = Math.abs(pixels[idx1] - pixels[idx2]);
          const dG = Math.abs(pixels[idx1+1] - pixels[idx2+1]);
          const dB = Math.abs(pixels[idx1+2] - pixels[idx2+2]);
          
          symDiff += dR + dG + dB;
          symCount++;
        }
      }
      const avgSymDiff = symDiff / (symCount || 1);
      // Perfect biological faces are asymmetrical due to light angle/structure. Symmetric models match lower differences.
      const symmetryAnomaly = avgSymDiff < 20;
      const symmetryPercent = Math.max(0, Math.min(100, Math.round(100 - (avgSymDiff * 1.5))));

      // ---- Forensics 3: Background Consistency (Warping and dynamic blur mismatch) ----
      logStep("Analyzing peripheral background vectors for spatial anomalies or warped lines...");
      await new Promise((r) => setTimeout(r, 400));

      let bgEdges = 0;
      let fgEdges = 0;
      let bgCt = 0;
      let fgCt = 0;

      for (let y = 1; y < h - 1; y += 4) {
        const isYBg = y < h * 0.15 || y > h * 0.85;
        for (let x = 1; x < w - 1; x += 4) {
          const isXBg = x < w * 0.15 || x > w * 0.85;
          const idx = (y * w + x) * 4;
          const leftIdx = (y * w + (x - 1)) * 4;
          
          const edgeVal = Math.abs(pixels[idx] - pixels[leftIdx]) + Math.abs(pixels[idx+1] - pixels[leftIdx+1]);
          
          if (isXBg || isYBg) {
            bgEdges += edgeVal;
            bgCt++;
          } else {
            fgEdges += edgeVal;
            fgCt++;
          }
        }
      }
      const avgFg = fgEdges / (fgCt || 1);
      const avgBg = bgEdges / (bgCt || 1);
      // Synthesised background is often extremely blurred compared to foreground, or contains warping noise
      const backgroundIssue = (avgBg < 2 && avgFg > 12) || (avgBg > 60 && avgFg < 22);
      const backgroundIssuePercent = backgroundIssue ? 85 : Math.round(Math.min(100, (avgBg / (avgFg || 1)) * 100));

      // ---- Forensics 4: Noise & Frequency (Over-clean pixels vs natural sensor noise) ----
      logStep("Mapping image grain frequencies (AI faces lack physical camera sensor grain)...");
      await new Promise((r) => setTimeout(r, 450));

      let duplicatePixels = 0;
      let totalGrainComparisons = 0;
      for (let i = 0; i < pixels.length - 12; i += 12) {
        const isDup = Math.abs(pixels[i] - pixels[i+4]) === 0 &&
                      Math.abs(pixels[i+1] - pixels[i+5]) === 0 &&
                      Math.abs(pixels[i+2] - pixels[i+6]) === 0;
        totalGrainComparisons++;
        if (isDup) duplicatePixels++;
      }
      const uniformityRatio = duplicatePixels / (totalGrainComparisons || 1);
      const noiseAnomaly = uniformityRatio > 0.08; // High uniformity represents AI flat texture renders
      const noisePercent = Math.round(uniformityRatio * 1000);

      setVisualMetrics({
        smoothnessPercent: Math.min(100, smoothnessPercent),
        repetitionPercent: Math.min(100, noisePercent),
        edgeJaggedness: Math.min(100, symmetryPercent),
      });

      logStep("Securely uploading visual matrix for AI Forensic aggregation...");

      // Convert image to base64 for multimodal secondary check if available
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string;

          const response = await fetch("/api/deepfake/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user._id,
              userName: user.name,
              fileName: file.name,
              base64Image,
              faceArtifact,
              symmetryAnomaly,
              backgroundIssue,
              noiseAnomaly,
              metadataMissing,
            }),
          });

          const auditData = await response.json();
          if (!response.ok) {
            throw new Error(auditData.error || "Acoustic audit pipeline failure.");
          }

          setScanResult(auditData);
          logStep("Forensic deepfake audit successfully summarized.");
          
          if (onScanComplete) {
            onScanComplete();
          }
        } catch (postErr: any) {
          setError(postErr.message || "Endpoint transmission failed.");
        } finally {
          setLoading(false);
        }
      };

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Pixel matrix calculation crash.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/60 p-6 md:p-8 space-y-8 custom-scrollbar">
      
      {/* Title Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Media & Deepfake Analysis Suite</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detect artificial images, face swaps, and JPEG structural tampering through local channel scanning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main interactive panel */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4 font-sans">Select Media to Scan</h2>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 max-w-lg mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 items-center">
              
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
                  onChange={executeImageScan}
                  disabled={loading}
                />

                {imagePreview ? (
                  <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-black/5">
                    <img 
                      src={imagePreview} 
                      alt="Verify image" 
                      className="max-w-full max-h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-semibold bg-black/60 px-2 py-1 rounded">Swap Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Choose Visual Asset</p>
                      <p className="text-[10px] text-slate-400 mt-1">JPEG, JPG, or PNG</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status or results display summary */}
              <div className="flex-1 text-left space-y-3">
                {!loading && !scanResult && (
                  <div className="space-y-2 text-slate-600 text-xs leading-relaxed">
                    <p className="font-semibold text-slate-800">Strict Classification Assurance:</p>
                    <p>Unlike standard validators, CitizenX Shield <b>never</b> defaults to labeling an uploaded image as verified "Real" or "Safe" without checking metadata, edges, and texture metrics.</p>
                  </div>
                )}

                {loading && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                      <span>Scanning image matrix...</span>
                    </div>
                    <p className="text-[10.5px] font-mono text-slate-500 animate-pulse bg-slate-100 p-2 rounded-lg border border-slate-200">
                      Current: {currentStep}
                    </p>
                  </div>
                )}

                {scanResult && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Threat Index Output:</span>
                    <div className="flex items-center gap-2">
                      <div className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                        scanResult.result === "Likely AI Generated"
                          ? "bg-rose-50 border-rose-200 text-rose-700"
                          : scanResult.result === "Suspicious"
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}>
                        <span>Result: {scanResult.result}</span>
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/5">Confidence: {scanResult.confidence}</span>
                      </div>
                    </div>
                    
                    {scanResult.issues && scanResult.issues.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono tracking-wider text-slate-400 block uppercase font-bold">Acoustic & Vector Anomalies Found:</span>
                        <div className="space-y-1">
                          {scanResult.issues.map((issue: string, i: number) => (
                            <div key={i} className="text-[10px] text-rose-800 font-mono flex items-start gap-1.5 bg-rose-50/50 p-1.5 px-2.5 rounded-lg border border-rose-100/50">
                              <span className="shrink-0 text-rose-600">🚨</span>
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 leading-normal">
                      Scan finished. Forensic risk rating registers as <span className="text-slate-705 font-bold">{scanResult.result}</span> based on the 5-tiered forensic matrix.
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Hidden Canvas used for calculations */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Staggered progress logs stream */}
          {scanSteps.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block border-b border-slate-100 pb-2">
                Neural Scan Stream Activity Log
              </span>
              <div className="space-y-1.5 font-mono text-[10.5px] max-h-40 overflow-y-auto custom-scrollbar">
                {scanSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-600">
                    <ChevronRight className="w-3 h-3 text-blue-500 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Quantified analysis meters */}
        <div className="space-y-6">
          
          {visualMetrics && scanResult && (
            <div id="deepfake-metrics-panel" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-500" /> Forensic breakdown
              </h3>
              
              <div className="space-y-3.5 text-xs">
                
                {/* Met: Texture smoothness */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Texture Smoothness (Anomaly):</span>
                    <b className="font-mono text-slate-800">{visualMetrics.smoothnessPercent}%</b>
                  </div>
                  <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${visualMetrics.smoothnessPercent}%` }}
                    />
                  </div>
                </div>

                {/* Met: Pattern repetition */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Pixel Uniformity Ratio (Absence of local grain):</span>
                    <b className="font-mono text-slate-800">{visualMetrics.repetitionPercent}%</b>
                  </div>
                  <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full" 
                      style={{ width: `${visualMetrics.repetitionPercent}%` }}
                    />
                  </div>
                </div>

                {/* Met: Edge discrepancy */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Geometric Symmetry Correlation:</span>
                    <b className="font-mono text-slate-800">{visualMetrics.edgeJaggedness}%</b>
                  </div>
                  <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-600 h-full rounded-full" 
                      style={{ width: `${visualMetrics.edgeJaggedness}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500" /> Multi-layered scoring rubrics
            </h3>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>Risk scoring incorporates standard visual anomalies and header files mathematically:</p>
              
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-250/50">
                  <span>Skin Over-Smoothness:</span>
                  <span className="text-slate-800 font-bold">+25 Points</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-250/50">
                  <span>Horizontal Symmetry:</span>
                  <span className="text-slate-800 font-bold">+20 Points</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-250/50">
                  <span>Background Blur/Warp:</span>
                  <span className="text-slate-800 font-bold">+20 Points</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-250/50">
                  <span>High Freq Grain Absence:</span>
                  <span className="text-slate-800 font-bold">+25 Points</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-250/50">
                  <span>Missing EXIF Metadata:</span>
                  <span className="text-slate-800 font-bold">+10 Points</span>
                </div>
              </div>

              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-[10px] text-rose-800">
                🚨 <b>Mandate Rule</b>: To prevent false security clearness, we never label files as absolute "Real". Score parameters determine Likelihood risks.
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
