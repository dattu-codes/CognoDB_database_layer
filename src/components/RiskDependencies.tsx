'use client';

import React from 'react';
import { RiskDependencyItem } from '@/lib/types';
import { Layers, Server, AlertTriangle } from 'lucide-react';

interface RiskDependenciesProps {
  riskDependencies: RiskDependencyItem[];
  loading: boolean;
}

export const RiskDependencies: React.FC<RiskDependenciesProps> = ({ riskDependencies, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel p-5 rounded-xl my-4 text-center text-xs text-sky-400 animate-pulse">
        Evaluating downstream impact ranking across dependency graph...
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-xl my-4 border border-slate-800">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <Layers className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            High-Impact Vulnerable Dependencies (Downstream Impact Ranking)
          </h3>
          <p className="text-xs text-slate-400">
            Packages with HIGH or CRITICAL severity vulnerabilities that affect the largest number of downstream production services.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
              <th className="p-3 font-semibold">Package Name</th>
              <th className="p-3 font-semibold">Version</th>
              <th className="p-3 font-semibold">Ecosystem</th>
              <th className="p-3 font-semibold">CVE ID</th>
              <th className="p-3 font-semibold">Severity</th>
              <th className="p-3 font-semibold">CVSS</th>
              <th className="p-3 font-semibold">Affected Services</th>
              <th className="p-3 font-semibold">Prod Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {riskDependencies.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                <td className="p-3 font-mono font-bold text-emerald-400">{item.packageName}</td>
                <td className="p-3 font-mono text-slate-300">v{item.version}</td>
                <td className="p-3 uppercase text-[10px] font-semibold tracking-wider text-slate-400">
                  {item.ecosystem}
                </td>
                <td className="p-3 font-mono font-bold text-rose-400">{item.cveId}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {item.severity}
                  </span>
                </td>
                <td className="p-3 font-mono font-bold text-white">{item.cvssScore}</td>
                <td className="p-3 font-bold text-sky-300">
                  <span className="inline-flex items-center gap-1">
                    <Server className="w-3 h-3 text-sky-400" />
                    {item.affectedServicesCount} Services
                  </span>
                </td>
                <td className="p-3 font-bold text-rose-400">
                  <span className="inline-flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    {item.prodServicesCount} Prod
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
