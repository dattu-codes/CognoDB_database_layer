'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GraphData, GraphNode } from '@/lib/types';
import { Network, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface GraphVisualizerProps {
  graphData: GraphData | null;
  onSelectNode: (node: GraphNode) => void;
  loading: boolean;
  highlightCveId?: string;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  graphData,
  onSelectNode,
  loading,
  highlightCveId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    if (!containerRef.current || !graphData || loading) return;

    let visNetwork: any;

    const initVis = async () => {
      try {
        const vis = await import('vis-network/standalone');

        // Filter nodes based on filterType
        const filteredNodes = graphData.nodes.filter((node) => {
          if (filterType === 'ALL') return true;
          return node.label === filterType;
        });

        const validNodeIds = new Set(filteredNodes.map((n) => n.id));

        const nodesDataSet = filteredNodes.map((node) => {
          let color = '#3b82f6';
          let shape = 'dot';
          let size = 20;

          if (node.label === 'Service') {
            color = '#38bdf8'; // Cyan
            size = 24;
          } else if (node.label === 'Package') {
            color = '#10b981'; // Emerald
            size = 18;
          } else if (node.label === 'Vulnerability') {
            color = '#ef4444'; // Red
            size = 26;
            shape = 'diamond';
          } else if (node.label === 'Maintainer') {
            color = '#a855f7'; // Purple
            size = 16;
          } else if (node.label === 'Repository') {
            color = '#f59e0b'; // Amber
            size = 18;
          } else if (node.label === 'Environment') {
            color = '#6366f1'; // Indigo
            size = 20;
          }

          if (highlightCveId && node.name.includes(highlightCveId)) {
            color = '#ff0055';
            size = 32;
          }

          return {
            id: node.id,
            label: node.name,
            shape,
            size,
            color: {
              background: color,
              border: '#ffffff',
              highlight: { background: '#ffffff', border: color },
            },
            font: { color: '#f3f4f6', size: 12, face: 'Inter' },
            nodeRaw: node,
          };
        });

        const edgesDataSet = graphData.relationships
          .filter((rel) => validNodeIds.has(rel.source) && validNodeIds.has(rel.target))
          .map((rel) => ({
            id: rel.id,
            from: rel.source,
            to: rel.target,
            label: rel.type,
            arrows: 'to',
            color: { color: 'rgba(255, 255, 255, 0.25)', highlight: '#38bdf8' },
            font: { color: '#9ca3af', size: 9, align: 'middle' },
            smooth: { enabled: true, type: 'continuous', roundness: 0.5 },
          }));

        const data = {
          nodes: new vis.DataSet(nodesDataSet as any),
          edges: new vis.DataSet(edgesDataSet as any),
        };

        const options = {
          physics: {
            stabilization: { iterations: 100 },
            barnesHut: {
              gravitationalConstant: -3000,
              centralGravity: 0.3,
              springLength: 95,
              springConstant: 0.04,
            },
          },
          interaction: {
            hover: true,
            zoomView: true,
            dragView: true,
          },
        };

        if (!containerRef.current) return;

        visNetwork = new vis.Network(containerRef.current, data as any, options as any);
        networkRef.current = visNetwork;

        visNetwork.on('click', (params: any) => {
          if (params.nodes.length > 0) {
            const selectedId = params.nodes[0];
            const foundNode = graphData.nodes.find((n) => n.id === selectedId);
            if (foundNode) {
              onSelectNode(foundNode);
            }
          }
        });
      } catch (err) {
        console.error('[GraphVisualizer] Vis.js init error:', err);
      }
    };

    initVis();

    return () => {
      if (visNetwork) visNetwork.destroy();
    };
  }, [graphData, loading, filterType, highlightCveId, onSelectNode]);

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.2 });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale / 1.2 });
    }
  };

  const handleResetView = () => {
    if (networkRef.current) {
      networkRef.current.fit();
    }
  };

  return (
    <div className="glass-panel rounded-xl my-4 border border-slate-800 overflow-hidden relative">
      {/* Header Bar */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white tracking-tight">Interactive Graph Subgraph Visualization</h3>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Service
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Package
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 transform rotate-45" /> Vulnerability
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Maintainer
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Repository
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none"
          >
            <option value="ALL">Show All Nodes</option>
            <option value="Service">Services Only</option>
            <option value="Package">Packages Only</option>
            <option value="Vulnerability">Vulnerabilities Only</option>
          </select>

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
            title="Reset Fit"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas View */}
      <div
        ref={containerRef}
        className="w-full h-[450px] bg-gradient-to-b from-slate-950 to-slate-900 relative cursor-grab active:cursor-grabbing"
      >
        {loading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 text-sky-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin" />
            Rendering graph visualization...
          </div>
        )}
      </div>
    </div>
  );
};
