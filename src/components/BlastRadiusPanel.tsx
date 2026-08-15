'use client';

import React from 'react';
import { BlastRadiusResult } from '@/lib/types';
import { ShieldAlert, Server, GitCommit, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BlastRadiusPanelProps {
  blastRadius: BlastRadiusResult | null;
  loading: boolean;
  onSelectNode?: (nodeId: string) => void;
}

export const BlastRadiusPanel: React.FC<BlastRadiusPanelProps> = ({
  blastRadius,
  loading,
  onSelectNode,
}) => {
  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-xl my-4 text-center animate-pulse">
        <div className="flex items-center justify-center gap-3 text-sky-400 text-sm font-medium">
          <ShieldAlert className="w-5 h-5 animate-spin" />
          Traversing 1–5 hop dependency graph in CognoDB...
        </div>
        <p className="text-xs text-slate-500 mt-2">Calculating multi-hop blast radius impact...</p>
      </div>
    );
  }

  if (!blastRadius) return null;

  const hasImpact = blastRadius.affectedServices.length > 0;

  return (
    <div className="glass-panel p-5 rounded-xl my-4 border border-slate-800">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white tracking-tight">
              Impact Analysis: <span className="text-rose-400 font-mono">{blastRadius.cveId}</span>
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                blastRadius.severity === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {blastRadius.severity} (CVSS {blastRadius.cvssScore})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">{blastRadius.vulnerabilitySummary}</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Vulnerable Package</span>
          <span className="text-sm font-mono font-semibold text-emerald-400">
            {blastRadius.vulnerablePackage}@{blastRadius.vulnerableVersion}
          </span>
        </div>
      </div>

      {/* Impact Summary Stat Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
          <Server className="w-5 h-5 text-rose-400" />
          <div>
            <span className="text-xs text-slate-400 block">Total Affected Services</span>
            <span className="text-xl font-bold text-white">{blastRadius.affectedServicesCount}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <div>
            <span className="text-xs text-slate-400 block">Production Services</span>
            <span className="text-xl font-bold text-rose-400">{blastRadius.prodServicesCount}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
          <Layers className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-xs text-slate-400 block">Staging Services</span>
            <span className="text-xl font-bold text-amber-300">{blastRadius.stagingServicesCount}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
          <GitCommit className="w-5 h-5 text-sky-400" />
          <div>
            <span className="text-xs text-slate-400 block">Max Transitive Depth</span>
            <span className="text-xl font-bold text-sky-300">{blastRadius.maxHopDepth} Hops</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!hasImpact ? (
        <div className="p-8 text-center bg-slate-900/40 rounded-lg border border-slate-800 my-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-200">No Affected Services Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            This vulnerability does not appear in any microservice dependency paths in the current graph.
          </p>
        </div>
      ) : (
        /* Affected Services Table & Dependency Chains */
        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Transitive Exposure Chains (Sorted by Hop Distance & Criticality)
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                  <th className="p-3 font-semibold">Service Name</th>
                  <th className="p-3 font-semibold">Environment</th>
                  <th className="p-3 font-semibold">Tier</th>
                  <th className="p-3 font-semibold">Hops</th>
                  <th className="p-3 font-semibold">Multi-Hop Dependency Chain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {blastRadius.affectedServices.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-medium text-white flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-sky-400" />
                      {item.serviceName}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          item.environment.includes('prod') ? 'badge-prod' : 'badge-staging'
                        }`}
                      >
                        {item.environment}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          item.tier === 'critical'
                            ? 'badge-critical'
                            : item.tier === 'high'
                            ? 'badge-high'
                            : 'badge-medium'
                        }`}
                      >
                        {item.tier}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-sky-300">{item.hopDistance}</td>
                    <td className="p-3 font-mono text-[11px]">
                      <div className="flex flex-wrap items-center gap-1">
                        {item.pathNodes.map((pn, pidx) => (
                          <React.Fragment key={pidx}>
                            <span
                              onClick={() => onSelectNode && onSelectNode(pn.id)}
                              className={`px-2 py-0.5 rounded border cursor-pointer hover:scale-105 transition-transform ${
                                pn.label === 'Service'
                                  ? 'bg-sky-950/80 text-sky-300 border-sky-600/40'
                                  : pn.label === 'Vulnerability'
                                  ? 'bg-rose-950/80 text-rose-300 border-rose-600/40 font-bold'
                                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
                              }`}
                            >
                              {pn.name}
                            </span>
                            {pidx < item.pathNodes.length - 1 && (
                              <span className="text-slate-600 font-sans">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
