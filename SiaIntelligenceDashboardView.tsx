import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Network, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Radio, 
  RefreshCw, 
  ExternalLink, 
  TrendingUp, 
  Database,
  Link,
  Phone,
  Layers,
  ArrowRight
} from "lucide-react";

interface NodeItem extends d3.SimulationNodeDatum {
  id: string;
  type: "phone" | "url";
  value: string;
  risk_score: number;
  report_count: number;
  threatLevel: "HIGH" | "MEDIUM" | "LOW";
}

interface EdgeItem extends d3.SimulationLinkDatum<NodeItem> {
  id: string;
  relation_type: "same_report" | "multi_user" | "same_pattern";
  weight: number;
}

interface UserRiskData {
  userId: string;
  risk_score: number;
  risk_level: string;
  reasons: string[];
  metrics: {
    reportsCount: number;
    riskyMessagesAnalyzed: number;
    suspiciousInteractions: number;
  };
}

interface SiaIntelligenceDashboardViewProps {
  user: { _id: string; name: string; email: string; mobile_number: string } | null;
}

export default function SiaIntelligenceDashboardView({ user }: SiaIntelligenceDashboardViewProps) {
  const currentUserId = user?._id || "guest_user";
  
  // UI States
  const [graphData, setGraphData] = useState<{ nodes: NodeItem[]; edges: EdgeItem[] }>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [nodeDetails, setNodeDetails] = useState<any | null>(null);
  const [userRisk, setUserRisk] = useState<UserRiskData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Activity stream lists
  const [recentReports, setRecentReports] = useState<any[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Load backend statistics and build data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch graph data
      const graphRes = await fetch("/graph");
      if (!graphRes.ok) throw new Error("Could not download threat graph topology");
      const graphRaw = await graphRes.json();

      // 2. Fetch User risk score
      const riskRes = await fetch(`/user-risk/${currentUserId}`);
      if (!riskRes.ok) throw new Error("Unable to parse user security exposures");
      const riskRaw = await riskRes.json();

      setGraphData({
        nodes: graphRaw.nodes || [],
        edges: graphRaw.edges || []
      });
      setUserRisk(riskRaw);

      // Select first node as default view if available
      if (graphRaw.nodes && graphRaw.nodes.length > 0) {
        const queryVal = graphRaw.nodes[0].value;
        const detailsRes = await fetch(`/entity/${encodeURIComponent(queryVal)}`);
        if (detailsRes.ok) {
          const detailRaw = await detailsRes.json();
          setSelectedNode(graphRaw.nodes[0]);
          setNodeDetails(detailRaw);
        }
      }

      // Fetch recent reports to feed the activity log
      const reportsRes = await fetch("/api/reports/check-phone?phone=0000000000"); // just query fallback to trigger a read or read standard list
      // Since we also want standard lists, let's fetch all graph nodes corresponding to real database logs
      const sortedByRecency = (graphRaw.nodes || []).flatMap((n: any) => n.associatedReports || []);
      setRecentReports(sortedByRecency);

      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to assemble SIA intelligence telemetry");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUserId]);

  // Click on a node details viewer
  const selectEntityValue = async (node: NodeItem) => {
    try {
      const detailsRes = await fetch(`/entity/${encodeURIComponent(node.value)}`);
      if (detailsRes.ok) {
        const detailRaw = await detailsRes.json();
        setSelectedNode(node);
        setNodeDetails(detailRaw);
      }
    } catch (err) {
      console.error("Failed to select entity:", err);
    }
  };

  // Physics simulation renderer using D3 force simulation
  useEffect(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Fresh container wipe for hot reload

    const width = svgRef.current.clientWidth && svgRef.current.clientWidth > 50 ? svgRef.current.clientWidth : 650;
    const height = svgRef.current.clientHeight && svgRef.current.clientHeight > 50 ? svgRef.current.clientHeight : 380;

    svg.attr("width", width).attr("height", height);

    // Deep copy graph data to avoid mutating react state objects
    const nodesCopy: NodeItem[] = graphData.nodes.map(n => ({ ...n }));
    const edgesCopy: EdgeItem[] = graphData.edges.map(e => ({
      ...e,
      source: nodesCopy.find(node => node.id === (e.source as any || (e as any).source.id || e.source))!,
      target: nodesCopy.find(node => node.id === (e.target as any || (e as any).target.id || e.target))!
    })).filter(e => e.source && e.target);

    // Initial force layout config
    const simulation = d3.forceSimulation<NodeItem>(nodesCopy)
      .force("link", d3.forceLink<NodeItem, EdgeItem>(edgesCopy).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(25));

    // Render correlation links (edges)
    const link = svg.append("g")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(edgesCopy)
      .join("line")
      .attr("stroke-width", d => Math.max(d.weight * 1.5, 2))
      .attr("stroke", d => {
        if (d.relation_type === "same_report") return "#6366f1"; // Blue-indigo 
        if (d.relation_type === "multi_user") return "#ec4899";  // Pink
        return "#f59e0b"; // Orange/Gold
      })
      .attr("stroke-dasharray", d => d.relation_type === "same_pattern" ? "3,3" : "none");

    // Container for nodes
    const node = svg.append("g")
      .selectAll<SVGGElement, NodeItem>("g")
      .data(nodesCopy)
      .join("g")
      .attr("class", "node-group")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        const originalNode = graphData.nodes.find(orig => orig.id === d.id);
        if (originalNode) selectEntityValue(originalNode);
      });

    // Add visual anchors for nodes based on type
    node.each(function(d) {
      const g = d3.select(this);
      
      // Node Risk Color Palette
      let nodeColor = "#10b981"; // Low (Green)
      if (d.risk_score >= 70) nodeColor = "#ef4444"; // High (Red)
      else if (d.risk_score >= 40) nodeColor = "#f59e0b"; // Medium (Yellow)

      if (d.type === "phone") {
        // Circles for phones
        g.append("circle")
          .attr("r", 18)
          .attr("fill", "#ffffff")
          .attr("stroke", nodeColor)
          .attr("stroke-width", 3.5)
          .attr("shadow", "0 2px 4px rgba(0,0,0,0.1)");
        
        // Dynamic centered inner icon
        g.append("circle")
          .attr("r", 6)
          .attr("fill", nodeColor);
      } else {
        // Rectangles for URLs
        g.append("rect")
          .attr("x", -15)
          .attr("y", -15)
          .attr("width", 30)
          .attr("height", 30)
          .attr("rx", 6)
          .attr("fill", "#ffffff")
          .attr("stroke", nodeColor)
          .attr("stroke-width", 3.5);

        g.append("circle")
          .attr("r", 4)
          .attr("fill", nodeColor);
      }
    });

    // Elegant text labels of threat objects
    node.append("text")
      .attr("dy", 35)
      .attr("text-anchor", "middle")
      .attr("font-family", "monospace")
      .attr("font-size", "10px")
      .attr("fill", "#334155")
      .attr("font-weight", "bold")
      .text(d => {
        if (d.type === "phone") return d.value;
        // Trim path for urls
        return d.value.length > 15 ? d.value.slice(0, 15) + "..." : d.value;
      });

    // Append standard drag functionality
    const dragHandler = d3.drag<SVGGElement, NodeItem>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(dragHandler as any);

    // Dynamic ticking positions
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node
        .attr("transform", d => `translate(${d.x}, ${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 space-y-8 custom-scrollbar">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 px-2.5 bg-indigo-600/10 text-indigo-700 font-extrabold text-[10px] tracking-widest font-mono rounded-full uppercase">
              ACTIVE COUNTER-INTELLIGENCE
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] tracking-wide text-slate-400 font-mono font-bold">REAL-TIME DATASTREAM STREAMING</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans mt-1">SIA Intelligence Dashboard</h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Correlate phone records, suspicious link vectors, and dynamic report networks. Track multi-user connections and analyze operator vulnerability ratings instantly on a live ledger.
          </p>
        </div>

        <button 
          onClick={loadDashboardData}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Synchronize Ledger</span>
        </button>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center flex-col gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
          <span className="text-xs font-mono font-bold text-slate-400">LOADING POLISHED DATA CLUSTERS...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold">Ledger Retrieval Error: </span>
            <span>{error}</span>
          </div>
        </div>
      ) : (
        <>
          {/* TOP DUAL PANEL GRID (LEFT: GRAPH, RIGHT: USER RISK) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: GRAPH VISUALIZATION PANEL */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col shadow-xs" style={{ minHeight: "540px" }}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Network className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                    <span>Dynamic Fraud Graph System</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    INTERACTIVE FORCE-PHYsICS SPECTRUM • NODES: {graphData.nodes.length} | LINKS: {graphData.edges.length}
                  </p>
                </div>

                {/* GRAPH COLORS LEGEND */}
                <div className="flex gap-2.5 text-[9px] font-mono font-bold">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> HIGH RISK</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> MEDIUM</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> LOW</span>
                </div>
              </div>

              {/* LIVE D3 GRAPH MOUNT */}
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-2 relative overflow-hidden flex flex-col justify-center items-center min-h-[380px]">
                <svg ref={svgRef} style={{ width: "100%", height: "380px" }} className="block w-full h-full"></svg>
                
                {/* FLOATING ACTION TIPS */}
                <div className="absolute bottom-2 left-2 p-2 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-lg shadow-xs pointer-events-none text-[8.5px] font-mono text-slate-500 space-y-0.5">
                  <div>🖱️ Click a node to inspect entity profiles</div>
                  <div>🔄 Drag nodes to manipulate physics anchors</div>
                </div>
              </div>

              {/* GRAPH NODE INSPECTOR TAB */}
              {selectedNode && (
                <div className="mt-4 p-4 border border-slate-150 bg-indigo-50/20 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {selectedNode.type === "phone" ? (
                          <Phone className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <Link className="w-3.5 h-3.5 text-pink-600" />
                        )}
                        <span className="text-xs font-mono font-black text-slate-800">{selectedNode.value}</span>
                        <span className="text-[9px] font-mono font-bold text-slate-400 capitalize">({selectedNode.type} Node)</span>
                      </div>
                      
                      <div className="flex gap-4 mt-2">
                        <div className="text-center bg-white border border-slate-150 px-2 py-1 rounded-lg">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-mono block">Complaints</span>
                          <span className="text-xs font-bold text-slate-800">{selectedNode.report_count} filings</span>
                        </div>
                        <div className="text-center bg-white border border-slate-150 px-2 py-1 rounded-lg">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-mono block">Risk Meter</span>
                          <span className={`text-xs font-black ${selectedNode.risk_score >= 70 ? 'text-rose-600' : selectedNode.risk_score >= 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {selectedNode.risk_score}%
                          </span>
                        </div>
                        <div className="text-center bg-white border border-slate-150 px-2 py-1 rounded-lg">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-mono block">Threat Standard</span>
                          <span className={`text-[9px] font-extrabold uppercase px-1 rounded block ${
                            selectedNode.threatLevel === "HIGH" ? 'bg-rose-100 text-rose-700' : 
                            selectedNode.threatLevel === "MEDIUM" ? 'bg-amber-100 text-amber-700' : 
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {selectedNode.threatLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono text-slate-400">ID: {selectedNode.id}</span>
                  </div>

                  {/* CONNECTED ENTITIES SUB FIELD */}
                  {nodeDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] font-sans">
                      <div className="space-y-1.5">
                        <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Linked Neighbors ({nodeDetails.connectedEntities?.length})</span>
                        {nodeDetails.connectedEntities?.length === 0 ? (
                          <div className="text-slate-400 italic">No structural loop connections.</div>
                        ) : (
                          <div className="space-y-1 max-h-[100px] overflow-y-auto">
                            {nodeDetails.connectedEntities.map((link: any) => (
                              <div key={link.id} className="flex justify-between items-center bg-white border border-slate-100 p-1.5 rounded-lg text-[10px] font-mono">
                                <span className="text-slate-700 truncate max-w-[120px]">{link.value}</span>
                                <span className="text-indigo-600 text-[8.5px] font-bold">({link.relation_type.replace("_", " ")})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Correlated Cases ({nodeDetails.associatedReports?.length})</span>
                        <div className="space-y-1 max-h-[100px] overflow-y-auto">
                          {nodeDetails.associatedReports?.map((rep: any) => (
                            <div key={rep._id} className="bg-white border border-slate-100 p-1.5 rounded-lg text-[9.5px] leading-relaxed">
                              <div className="font-bold text-slate-800">{rep.scamType}</div>
                              <div className="text-slate-500 truncate">{rep.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: USER RISK SCORE PANEL */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs" style={{ minHeight: "540px" }}>
              
              <div className="space-y-5">
                <div className="space-y-0.5 border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4.5 h-4.5 text-slate-800" />
                    <span>Dynamic User Risk Score System</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">
                    Operator Vulnerability Rating Index & Exposure Evaluation
                  </p>
                </div>

                {userRisk && (
                  <div className="space-y-5">
                    {/* RISK GAUGE METER */}
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
                      
                      {/* ACCENT CIRCLE */}
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                          <circle cx="56" cy="56" r="48" stroke="#e2e8f0" strokeWidth="8" fill="transparent"></circle>
                          <circle 
                            cx="56" 
                            cy="56" 
                            r="48" 
                            stroke={userRisk.risk_score >= 70 ? '#ef4444' : userRisk.risk_score >= 40 ? '#f59e0b' : '#10b981'} 
                            strokeWidth="8" 
                            fill="transparent"
                            strokeDasharray={301.6}
                            strokeDashoffset={301.6 - (301.6 * userRisk.risk_score) / 100}
                            className="transition-all duration-1000 ease-out"
                          ></circle>
                        </svg>

                        <div className="text-center">
                          <span className="text-3xl font-black text-slate-800 font-mono">{userRisk.risk_score}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">RISK SCOrE</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-mono font-bold text-slate-400">EXPOSURE STATUS</div>
                        <div className={`text-md font-black tracking-tight mt-0.5 ${
                          userRisk.risk_score >= 70 ? 'text-red-600' : userRisk.risk_score >= 40 ? 'text-amber-500' : 'text-emerald-600'
                        }`}>
                          {userRisk.risk_level}
                        </div>
                      </div>
                    </div>

                    {/* RISKY THREATS REASONS */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider block">Observed Threat Markers ({userRisk.reasons?.length})</span>
                      {userRisk.reasons?.length === 0 ? (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Strictly Compliant: No threat flags detected on current session.</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {userRisk.reasons.map((reason, idx) => (
                            <div key={idx} className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[10.5px] text-rose-800 font-medium flex items-start gap-2 animate-fadeIn">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Risk parameters analyzed */}

                  </div>
                )}
              </div>



            </div>

          </div>


        </>
      )}

    </div>
  );
}
