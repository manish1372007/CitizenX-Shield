import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Activity, 
  Filter, 
  Search, 
  ChevronRight,
  Info
} from "lucide-react";

interface VerificationRecord {
  _id: string;
  userId: string;
  userName: string;
  fileName: string;
  aadhaarNumber: string;
  extractedText: string;
  issuesFound: string[];
  score: number; // Penalty score out of 100
  result: string; // Likely Genuine, Suspicious, Likely Fake
  confidence: string; // pre-calculated e.g., "90%"
  createdAt: string;
}

export default function VerificationHistoryView() {
  const [data, setData] = useState<VerificationRecord[]>([]);
  const [filteredData, setFilteredData] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, Likely Genuine, Suspicious, Likely Fake

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 });

  // Handle Container Resizing for Fluid Responsive layout
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      // Set limits for width to keep it usable
      setDimensions({
        width: Math.max(width, 320),
        height: 320
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/verify/history");
      if (!response.ok) {
        throw new Error("Failed to pull scanning logs from telemetry database");
      }
      const records: VerificationRecord[] = await response.json();
      
      // Sort chronologically
      const sorted = [...records].sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      
      setData(sorted);
      setFilteredData(sorted);
      if (sorted.length > 0) {
        setSelectedRecord(sorted[sorted.length - 1]);
      }
    } catch (err: any) {
      setError(err.message || "Unknown retrieval failure");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Update filtered list when criteria changes
  useEffect(() => {
    let result = [...data];
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.userName.toLowerCase().includes(term) ||
        r.fileName.toLowerCase().includes(term) ||
        r.aadhaarNumber.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter(r => r.result === statusFilter);
    }
    setFilteredData(result);
  }, [searchTerm, statusFilter, data]);

  // Render D3 Line Chart
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous elements inside SVG
    d3.select(svgRef.current).selectAll("*").remove();

    if (filteredData.length === 0) return;

    const margin = { top: 25, right: 30, bottom: 40, left: 45 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare chronological data
    // Map accuracy metric: 100 - penaltyScore
    const chartData = filteredData.map((d) => ({
      date: new Date(d.createdAt),
      accuracy: 100 - d.score,
      fileName: d.fileName,
      userName: d.userName,
      result: d.result,
      id: d._id,
      record: d
    }));

    // Scales
    const timeExtent = d3.extent(chartData, (d: any) => d.date) as [Date, Date];
    if (chartData.length === 1 && timeExtent[0]) {
      const singleDate = timeExtent[0].getTime();
      timeExtent[0] = new Date(singleDate - 12 * 3600 * 1000);
      timeExtent[1] = new Date(singleDate + 12 * 3600 * 1000);
    }

    const xScale = d3.scaleTime()
      .domain(timeExtent)
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // X-Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(chartData.length, width > 500 ? 8 : 4))
      .tickFormat(d3.timeFormat("%b %d") as any);

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .call(g => g.select(".domain").attr("stroke", "#cbd5e1"))
      .call(g => g.selectAll(".tick text").attr("fill", "#64748b").style("font-size", "10px").style("font-family", "Inter"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#f1f5f9"));

    // Y-Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .call(g => g.select(".domain").attr("stroke", "none")) 
      .call(g => g.selectAll(".tick text").attr("fill", "#64748b").style("font-size", "10px").style("font-family", "Inter"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#f1f5f9").attr("x2", width));

    // Gradient below line
    const gradientId = "accuracy-area-gradient";
    const defs = svg.append("defs");
    const areaGradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    areaGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#2563eb")
      .attr("stop-opacity", 0.15);

    areaGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#2563eb")
      .attr("stop-opacity", 0.00);

    // Area builder
    const area = d3.area<any>()
      .x((d: any) => xScale(d.date))
      .y0(height)
      .y1((d: any) => yScale(d.accuracy))
      .curve(d3.curveMonotoneX);

    // Flat baseline area builder for smooth growing transition
    const areaZero = d3.area<any>()
      .x((d: any) => xScale(d.date))
      .y0(height)
      .y1(height)
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(chartData)
      .attr("fill", `url(#${gradientId})`)
      .attr("d", areaZero)
      .attr("opacity", 0.1)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr("d", area)
      .attr("opacity", 1);

    // Grid Horizontal Reference Rules
    svg.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data([50]) // Center guide representation
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", (d: any) => yScale(d))
      .attr("y2", (d: any) => yScale(d))
      .attr("stroke", "#fda4af")
      .attr("stroke-dasharray", "4,4")
      .attr("stroke-width", 1);

    svg.append("text")
      .attr("x", 5)
      .attr("y", yScale(50) - 5)
      .attr("fill", "#cca2a2")
      .style("font-size", "9px")
      .style("font-family", "JetBrains Mono")
      .text("CRITICAL FRAUD ZONE BOUNDRY (50%)");

    // Line builder
    const line = d3.line<any>()
      .x((d: any) => xScale(d.date))
      .y((d: any) => yScale(d.accuracy))
      .curve(d3.curveMonotoneX);

    const path = svg.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Smooth trace transition for the trend line
    let totalLength = 0;
    try {
      totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0;
    } catch (e) {
      // fallback
    }

    if (totalLength > 0) {
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .attr("stroke-dashoffset", 0);
    }

    // Hover tooltip container (div based)
    const tooltipDiv = d3.select("#d3-accuracy-tooltip");
    
    // Add interactive circles
    const dots = svg.selectAll(".dot")
      .data(chartData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d: any) => xScale(d.date))
      .attr("cy", (d: any) => yScale(d.accuracy))
      .attr("r", 0) // start at 0 for pop animation
      .attr("fill", (d: any) => {
        if (d.accuracy >= 70) return "#10b981"; // Emerald
        if (d.accuracy >= 50) return "#f59e0b"; // Amber
        return "#ef4444"; // Rose
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .style("transition", "transform 150ms ease-in-out")
      .on("mouseover", function(event, d: any) {
        d3.select(this).attr("r", 7).attr("stroke", "#1e3a8a");
        
        tooltipDiv.transition()
          .duration(150)
          .style("opacity", 1);
          
        tooltipDiv.html(`
          <div class="space-y-1 font-sans">
            <div class="flex items-center justify-between gap-3 border-b border-slate-100 pb-1">
              <span class="font-bold text-slate-800 text-[10.5px] truncate max-w-[120px]">${d.fileName}</span>
              <span class="text-[9.5px] text-slate-400 font-mono">${d.date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
            </div>
            <div class="text-[10px] text-slate-500">Identity Operator: <b class="text-slate-700">${d.userName}</b></div>
            <div class="flex items-center justify-between text-[11px] pt-1 pt-0.5">
              <span class="text-slate-500">Detected Accuracy:</span>
              <span class="font-bold text-blue-600 font-mono">${d.accuracy}%</span>
            </div>
            <div class="text-[9px] uppercase font-bold text-center py-0.5 px-1.5 rounded text-white bg-slate-800/90 mt-1">
              ${d.result}
            </div>
          </div>
        `);
      })
      .on("mousemove", function(event) {
        // Position relative to document
        tooltipDiv
          .style("left", (event.pageX + 12) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 5).attr("stroke", "#ffffff");
        tooltipDiv.transition()
          .duration(150)
          .style("opacity", 0);
      })
      .on("click", function(event, d: any) {
        setSelectedRecord(d.record);
      });

    // Animate points with a staggered pop-in bounce effect
    dots.transition()
      .delay((d: any, i: number) => {
        return 250 + i * (600 / Math.max(chartData.length, 1));
      })
      .duration(600)
      .ease(d3.easeBackOut)
      .attr("r", 5);

  }, [filteredData, dimensions]);

  // Calculations for high-level insight panels
  const scanCount = data.length;
  const avgAccuracy = scanCount > 0 
    ? Math.round(data.reduce((acc, current) => acc + (100 - current.score), 0) / scanCount)
    : 0;

  const failureRates = scanCount > 0
    ? Math.round((data.filter(r => r.result === "Likely Fake").length / scanCount) * 100)
    : 0;

  const suspiciousCount = data.filter(r => r.result === "Suspicious").length;
  
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/60 p-6 md:p-8 space-y-8 custom-scrollbar">
      
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">National Scanning Assurance Hub</h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Tracking chronological accuracy scoring trends, OCR parsing integrity logs, and credential fraud vectors.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
        >
          Reload Statistics
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 text-slate-500">
          <Activity className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <span className="text-xs font-mono">Querying historical database arrays...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-3xl text-center space-y-3 max-w-md mx-auto">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold">Chronology Parse Failure</h3>
          <p className="text-xs text-rose-600 leading-normal">{error}</p>
          <button 
            onClick={fetchHistory}
            className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-500"
          >
            Retry Connection Link
          </button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Core Telemetry Highlight Grid cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Database Scans Listed</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">{scanCount} Documents</div>
              </div>
              <p className="text-[10.5px] text-slate-400 font-sans">Combined physical and system logs</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Mean Identity Accuracy</span>
                <div className="text-3xl font-extrabold text-blue-600 mt-1">{avgAccuracy}%</div>
              </div>
              <p className="text-[10.5px] text-slate-400 font-sans">Dynamic UI/OCR correlation rate</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Forgeries Diverted</span>
                <div className="text-3xl font-extrabold text-rose-600 mt-1">{failureRates}% Rate</div>
              </div>
              <p className="text-[10.5px] text-slate-500 font-sans">Identified fraudulent documents block</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Suspicious Files Tracked</span>
                <div className="text-3xl font-extrabold text-amber-500 mt-1">{suspiciousCount} Files</div>
              </div>
              <p className="text-[10.5px] text-slate-400 font-sans">Medium risk alignment failures</p>
            </div>

          </div>

          {/* D3 Line Chart Visualization Box */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex h-5 items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-blue-600 tracking-wider font-bold block">PRECISION TIMELINE SYSTEM</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                    <span>Live Chronology Layout</span>
                  </div>
                </div>
                <h2 className="text-md font-bold text-slate-900 mt-1">Aadhaar Verification Authenticity Trends</h2>
                <p className="text-[11px] text-slate-500 max-w-xl">
                  Points represent single scanning uploads. Higher percentages represent perfect match parameters. Click nodes to trace detail metadata on the inspector panel.
                </p>
              </div>

              {/* Chart Stage */}
              <div 
                ref={containerRef} 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-3 relative overflow-hidden"
              >
                <svg ref={svgRef} className="max-w-full drop-shadow-[0_1px_2px_rgba(241,245,249,0.5)]"></svg>
                
                {/* Fixed tooltip anchor targeting container hover */}
                <div 
                  id="d3-accuracy-tooltip" 
                  className="absolute pointer-events-none opacity-0 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg z-50 text-xs text-slate-700 min-w-[170px] transition-all line-clamp-3"
                  style={{ top: 0, left: 0 }}
                />
              </div>

              <div className="flex gap-4 items-center justify-start text-[10px] font-semibold text-slate-500 px-1 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block border border-white shadow-sm" />
                  <span>Pass Rate Bounds (&gt;70% Accuracy)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block border border-white shadow-sm" />
                  <span>Suspicion Warnings (50% - 70% Accuracy)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block border border-white shadow-sm" />
                  <span>Identified Forgery (&lt;50% Accuracy)</span>
                </div>
              </div>
            </div>

            {/* Selected Node Detailed Inspector Panel on Left */}
            <div id="selected-scan-inspector" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              
              {selectedRecord ? (
                <div className="space-y-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-500" /> FILE AUDIT INSPECTOR
                    </span>
                    
                    <div className="mt-4 space-y-4">
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-900 block truncate leading-tight">{selectedRecord.fileName}</span>
                          <span className="text-[10px] text-slate-400 block mt-1 font-mono">ID: {selectedRecord._id}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 pt-2">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold">Identity Score</span>
                          <span className={`text-md font-mono font-bold block mt-1 ${
                            (100 - selectedRecord.score) >= 70 ? "text-emerald-600" : (100 - selectedRecord.score) >= 50 ? "text-amber-500" : "text-rose-600"
                          }`}>
                            {100 - selectedRecord.score}% Precision
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold">Class Audit</span>
                          <span className="text-xs font-bold text-slate-800 block mt-1.5">
                            {selectedRecord.result}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-baseline font-mono text-[10.5px]">
                          <span className="text-slate-400">Operator:</span>
                          <span className="text-slate-800 font-bold">{selectedRecord.userName}</span>
                        </div>
                        <div className="flex justify-between items-baseline font-mono text-[10.5px]">
                          <span className="text-slate-400">Aadhaar UID:</span>
                          <span className="text-slate-800 font-bold">{selectedRecord.aadhaarNumber}</span>
                        </div>
                        <div className="flex justify-between items-baseline font-mono text-[10.5px]">
                          <span className="text-slate-400">Scanned At:</span>
                          <span className="text-slate-800">{new Date(selectedRecord.createdAt).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                        </div>
                      </div>

                      {/* Issues detected */}
                      <div className="space-y-1.5 pt-3 border-t border-slate-100 flex-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Validation Check Alerts:</span>
                        {!selectedRecord.issuesFound || selectedRecord.issuesFound.length === 0 ? (
                          <div className="p-2 bg-emerald-50 text-emerald-800 text-[10.5px] font-mono rounded-xl border border-emerald-100 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Zero verification faults mapped.</span>
                          </div>
                        ) : (
                          <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                            {selectedRecord.issuesFound.map((issue, i) => (
                              <div key={i} className="p-1.5 bg-slate-50 text-slate-600 font-mono text-[9px] uppercase leading-tight rounded-lg border border-slate-150 flex items-start gap-1">
                                <span className="text-rose-500 font-black shrink-0">•</span>
                                <span>{issue}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-2xl text-[10px] text-blue-800/90 leading-normal flex gap-1.5 mt-2">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>Selected coordinate metrics match system assurance index tables locally. Upload more documents under verification to increase mapping range.</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center h-full">
                  <FileText className="w-10 h-10 text-slate-300 mb-2 animate-bounce" />
                  <span className="text-xs">No Verification Node Tracked. Run Aadhaar scanning to populate graphs.</span>
                </div>
              )}

            </div>

          </div>

          {/* Search, Filter, & History Data Grid List Table representation */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Document Scan Registry Logs</h3>
                <p className="text-[11px] text-slate-400">Interactive telemetry list tracking scanned files matching validation queries</p>
              </div>

              {/* Filters Box */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Search Bar input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, file, uid..."
                    className="pl-8.5 pr-3 py-1.5 bg-slate-105 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-44 md:w-56"
                  />
                </div>

                {/* Dropdown status selector */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-150 px-2 rounded-xl text-xs text-slate-600">
                  <Filter className="w-3 h-3 text-slate-400" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="py-1.5 pr-1 outline-none font-semibold text-slate-700 bg-transparent cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Likely Genuine">Likely Genuine</option>
                    <option value="Suspicious">Suspicious</option>
                    <option value="Likely Fake">Likely Fake</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Table layout container */}
            <div className="overflow-x-auto rounded-xl border border-slate-150">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 font-mono text-[9.5px] tracking-wider text-slate-400 uppercase">
                    <th className="py-3 px-4 font-bold">Verified Date</th>
                    <th className="py-3 px-4 font-bold">Operator Citizen</th>
                    <th className="py-3 px-4 font-bold">Aadhaar Media Target</th>
                    <th className="py-3 px-4 font-bold">Aadhaar Number Match</th>
                    <th className="py-3 px-4 font-bold text-center">Score Penalty</th>
                    <th className="py-3 px-4 font-bold text-center">Assurance Level</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 text-xs font-mono">
                        Zero scanning logs matching filters checked.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record) => {
                      const ageDays = Math.round((Date.now() - new Date(record.createdAt).getTime()) / (1000 * 3600 * 24));
                      const acc = 100 - record.score;
                      return (
                        <tr 
                          key={record._id}
                          onClick={() => setSelectedRecord(record)}
                          className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                            selectedRecord?._id === record._id ? "bg-blue-50/30 font-semibold" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono text-[10.5px]">
                            {new Date(record.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                            <span className="text-[9.5px] text-slate-400 block mt-0.5">{ageDays === 0 ? "Today" : `${ageDays} days ago`}</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{record.userName}</td>
                          <td className="py-3.5 px-4 truncate max-w-[150px] font-mono text-[11px] text-slate-500" title={record.fileName}>
                            {record.fileName}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-800">{record.aadhaarNumber}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">{record.score} pts</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              record.result === "Likely Genuine"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : record.result === "Suspicious"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}>
                              {acc}% ACC ({record.result.split(" ").pop()})
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecord(record);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
