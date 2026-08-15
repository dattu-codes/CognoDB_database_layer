'use client';

import React, { useState } from 'react';
import { DependencyPathResult, Service, Package } from '@/lib/types';
import { GitPullRequest, Search, ShieldAlert, CheckCircle } from 'lucide-react';

interface DependencyTableProps {
  services: Service[];
  packages: Package[];
  pathResult: DependencyPathResult | null;
  onSearchPath: (serviceName: string, packageName: string) => void;
  loading: boolean;
}

export const DependencyTable: React.FC<DependencyTableProps> = ({
  services,
  packages,
  pathResult,
  onSearchPath,
  loading,
}) => {
  const [selectedService, setSelectedService] = useState('payment-service');
  const [selectedPackage, setSelectedPackage] = useState('log4j-core');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchPath(selectedService, selectedPackage);
  };

  return (
    <div className="glass-panel p-5 rounded-xl my-4 border border-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
            <GitPullRequest className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Dependency Path Explorer (Shortest Path Query)</h3>
            <p className="text-xs text-slate-400">
              Find the exact multi-hop dependency chain connecting any microservice to a target software package.
            </p>
          </div>
        </div>

        {/* Controls */}
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            {services.map((s) => (
              <option key={s.id} value={s.name}>
                Service: {s.name}
              </option>
            ))}
          </select>

          <span className="text-slate-500 text-xs">→</span>

          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            {packages.map((p) => (
              <option key={p.id} value={p.name}>
                Package: {p.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            Find Path
          </button>
        </form>
      </div>

      {/* Results Display */}
      {loading ? (
        <div className="p-4 text-center text-xs text-sky-400 animate-pulse">Running shortest path Cypher query...</div>
      ) : pathResult ? (
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Path Distance:</span>
              <span className="text-xs font-mono font-bold text-sky-300 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                {pathResult.hopDistance} {pathResult.hopDistance === 1 ? 'Hop' : 'Hops'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {pathResult.targetHasVulnerabilities ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/30">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Target Has Active CVEs
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Target Clean
                </span>
              )}
            </div>
          </div>

          {/* Visual Step-by-step chain */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs overflow-x-auto py-2">
            {pathResult.pathNodes.map((node, i) => (
              <React.Fragment key={i}>
                <div
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                    node.label === 'Service'
                      ? 'bg-sky-950/80 text-sky-300 border-sky-600/40 font-bold'
                      : i === pathResult.pathNodes.length - 1 && pathResult.targetHasVulnerabilities
                      ? 'bg-rose-950/80 text-rose-300 border-rose-600/40 font-bold'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
                  }`}
                >
                  <span className="text-[10px] opacity-60 uppercase">[{node.label}]</span>
                  <span>{node.name}</span>
                  {node.version && <span className="text-[10px] text-slate-400">@{node.version}</span>}
                </div>
                {i < pathResult.pathNodes.length - 1 && <span className="text-slate-600">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
